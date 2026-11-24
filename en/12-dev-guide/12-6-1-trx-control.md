# Transaction Management
---

This section describes transaction control statements, transaction autocommit mode, XA transactions, and related topics.

Before you begin, create the test database and table.
```sql
CREATE DATABASE trx;
USE trx;
CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` int unsigned NOT NULL DEFAULT '0',
  `c2` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

## Starting a Transaction

GreatSQL supports the following ways to start a transaction.

- Execute the `BEGIN` command.
```sql
greatsql> BEGIN; /* start a transaction */
greatsql> INSERT INTO t1 VALUES(1, 1, 'row1');
greatsql> COMMIT;
greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
+----+----+------+
```

- Execute the `START TRANSACTION` command.

```sql
greatsql> START TRANSACTION;
greatsql> INSERT INTO t1 VALUES(2, 2, 'row2');
greatsql> COMMIT;
greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
+----+----+------+
```

- Set `autocommit = 0` (disable autocommit). After that, executing statements such as `INSERT`, `UPDATE`, `DELETE`, and `SELECT ... FOR UPDATE` starts a new transaction.

```sql
SET autocommit = 0;
INSERT INTO t1 VALUES(3, 3, 'row3');
COMMIT;

SET autocommit = 0;
UPDATE t1 SET c2 = 'row11' WHERE id=1;
COMMIT;

SET autocommit = 0;
DELETE FROM t1 WHERE id=2;
COMMIT;

SET autocommit = 0;
SELECT * FROM t1 WHERE id=3 FOR UPDATE;
UPDATE t1 SET c2 = 'row33' WHERE id=3;
COMMIT;
```

After executing the transaction statements above, query the table data again. The result is as follows:
```sql
greatsql> SELECT * FROM t1;
+----+----+-------+
| id | c1 | c2    |
+----+----+-------+
|  1 |  1 | row11 |
|  3 |  3 | row33 |
+----+----+-------+
```

When a transaction starts, it is read-only by default and no formal transaction ID is assigned yet. Only when data modification occurs does it automatically switch to read-write mode and get a formal transaction ID.

You can query `information_schema.INNODB_TRX` to view the transaction state.

```sql
               session1                │ session2
----------------------------------------------------------------------------------------------------------------------
greatsql> BEGIN;                       │greatsql> SELECT * FROM INNODB_TRX\G
Query OK, 0 rows affected (0.00 sec)   │Empty set (0.00 sec)
                                       │
greatsql> SELECT * FROM t1 WHERE id=1; │greatsql> SELECT * FROM INNODB_TRX\G
+----+----+-------+                    │*************************** 1. row ***************************
| id | c1 | c2    |                    │                    trx_id: 421166643830136
+----+----+-------+                    │                 trx_state: RUNNING
|  1 |  1 | row11 |                    │               trx_started: 2024-04-25 03:09:46
+----+----+-------+                    │     trx_requested_lock_id: NULL
1 row in set (0.00 sec)                │          trx_wait_started: NULL
                                       │                trx_weight: 0
greatsql>                              │       trx_mysql_thread_id: 52
                                       │                 trx_query: NULL
                                       │       trx_operation_state: NULL
                                       │         trx_tables_in_use: 0
                                       │         trx_tables_locked: 0
                                       │          trx_lock_structs: 0
                                       │     trx_lock_memory_bytes: 1128
                                       │           trx_rows_locked: 0
                                       │         trx_rows_modified: 0
                                       │   trx_concurrency_tickets: 0
                                       │       trx_isolation_level: REPEATABLE READ
                                       │         trx_unique_checks: 1
                                       │    trx_foreign_key_checks: 1
                                       │trx_last_foreign_key_error: NULL
                                       │ trx_adaptive_hash_latched: 0
                                       │ trx_adaptive_hash_timeout: 0
                                       │          trx_is_read_only: 0
                                       │trx_autocommit_non_locking: 0
                                       │       trx_schedule_weight: NULL
```

As you can see, in the example above the initial transaction ID is a very large number. Now modify the table data and observe the transaction state again:

```sql
                   session1                     │ session2
----------------------------------------------------------------------------------------------------------------------
                                                │greatsql> SELECT * FROM INNODB_TRX\G
greatsql> UPDATE t1 SET c2='row111' WHERE id=1; │*************************** 1. row ***************************
Query OK, 0 rows affected (0.00 sec)            │                    trx_id: 2443
Rows matched: 1  Changed: 0  Warnings: 0        │                 trx_state: RUNNING
                                                │               trx_started: 2024-04-25 03:10:00
greatsql>                                       │     trx_requested_lock_id: NULL
                                                │          trx_wait_started: NULL
                                                │                trx_weight: 3
                                                │       trx_mysql_thread_id: 52
                                                │                 trx_query: NULL
                                                │       trx_operation_state: NULL
                                                │         trx_tables_in_use: 0
                                                │         trx_tables_locked: 1
                                                │          trx_lock_structs: 2
                                                │     trx_lock_memory_bytes: 1128
                                                │           trx_rows_locked: 1
                                                │         trx_rows_modified: 1
                                                │   trx_concurrency_tickets: 0
                                                │       trx_isolation_level: REPEATABLE READ
                                                │         trx_unique_checks: 1
                                                │    trx_foreign_key_checks: 1
                                                │trx_last_foreign_key_error: NULL
                                                │ trx_adaptive_hash_latched: 0
                                                │ trx_adaptive_hash_timeout: 0
                                                │          trx_is_read_only: 0
                                                │trx_autocommit_non_locking: 0
                                                │       trx_schedule_weight: NULL
```
At this point the transaction state changes from **READ ONLY** to **READ WRITE** and a formal transaction ID is assigned: the `trx_id` value changes from 421166643830136 to 2443. You can also see details such as the memory occupied by the transaction (`trx_lock_memory_bytes`), the locks it holds (`trx_tables_locked`, `trx_lock_structs`, `trx_rows_locked`), and how many rows it has modified (`trx_rows_modified`).

In the example above, note that the `trx_is_read_only` column in `information_schema.INNODB_TRX` is 0 in both queries. This is because the transaction is a convertible transaction that can change from read-only to read-write. Only when a read-only transaction is explicitly started with `START TRANSACTION READ ONLY` can it not be converted to read-write; in that case the value of `trx_is_read_only` is 1.
```sql
greatsql> START TRANSACTION READ ONLY;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+

greatsql> SELECT * FROM information_schema.INNODB_TRX\G
*************************** 1. row ***************************
                    trx_id: 421166643830136
                 trx_state: RUNNING
               trx_started: 2024-04-25 06:47:39
     trx_requested_lock_id: NULL
          trx_wait_started: NULL
                trx_weight: 0
       trx_mysql_thread_id: 63
                 trx_query: SELECT * FROM information_schema.INNODB_TRX
       trx_operation_state: NULL
         trx_tables_in_use: 0
         trx_tables_locked: 0
          trx_lock_structs: 0
     trx_lock_memory_bytes: 1128
           trx_rows_locked: 0
         trx_rows_modified: 0
   trx_concurrency_tickets: 0
       trx_isolation_level: REPEATABLE READ
         trx_unique_checks: 1
    trx_foreign_key_checks: 1
trx_last_foreign_key_error: NULL
 trx_adaptive_hash_latched: 0
 trx_adaptive_hash_timeout: 0
          trx_is_read_only: 1
trx_autocommit_non_locking: 0
       trx_schedule_weight: NULL
```


## Committing a Transaction

Committing a transaction persists its modifications, clears its savepoints (`SAVEPOINT`), and releases the locks it holds. Only after the commit do the modifications become visible to other sessions.

The statement used to explicitly commit a transaction is `COMMIT`.
```sql
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+

greatsql> INSERT INTO t1 VALUES(2,2,'row2');
greatsql> COMMIT; /* commit the transaction so that the modifications are persisted */

greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  2 |  2 | row2   |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

There are several other ways to implicitly commit a transaction:

- Setting `autocommit=1`; enabling autocommit mode implicitly commits the transaction;

```sql
greatsql> SET autocommit=0;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  2 |  2 | row2   |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+

greatsql> DELETE FROM t1 WHERE id=2;

greatsql> SET autocommit=1; /* enable autocommit mode */

greatsql> EXIT
Bye
```

Connect to the database again and query the table; you will find that the `DELETE` request succeeded:

```sql
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

- Starting a new transaction implicitly commits the transaction that has not yet ended;

```sql
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
+----+----+--------+

greatsql> INSERT INTO t1 VALUES(4, 4, 'row4');

greatsql> BEGIN; /* starting a new transaction implicitly commits the current one */

greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

- Issuing DDL or DCL operations. DDL and DCL do not support transactions, so they require the unfinished transaction to be implicitly committed.

## Rolling Back a Transaction

Rolling back a transaction undoes its modifications, clears its savepoints (`SAVEPOINT`), and releases the locks it holds.

You can roll back the entire uncommitted transaction, or roll back to a specified savepoint.

The statement used to explicitly roll back a transaction is `ROLLBACK`.

```sql
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+

greatsql> INSERT INTO t1 VALUES(2,2,'row2');

greatsql> ROLLBACK;  /* after `ROLLBACK`, the preceding INSERT request is undone */

greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

There are several other ways to implicitly roll back a transaction:

1. The connection is explicitly closed with `greatsql> exit`;

```sql
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+

greatsql> INSERT INTO t1 VALUES(2,2,'row2');
greatsql> exit /* closing the connection triggers an implicit rollback */
Bye
```
After the current connection is closed, an implicit rollback is triggered. Connect to the database again and query the table; you will find that the preceding `INSERT` request was neither committed nor persisted.

2. The connection stays idle until it times out and is disconnected (exceeding the threshold set by `wait_timeout`);

```sql
greatsql> SET SESSION wait_timeout = 10; /* set the timeout to 10 seconds */
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  2 |  2 | row2   |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+

greatsql> DELETE FROM t1 WHERE id=2; /* after the DELETE, the connection is idle for more than 10 seconds */

greatsql> SELECT * FROM t1; /* after more than 10 seconds a new query reconnects, and the DELETE turns out to be rolled back */
ERROR 4031 (HY000): The client was disconnected by the server because of inactivity. See wait_timeout and interactive_timeout for configuring this behavior.
No connection. Trying to reconnect...
Connection id:    59
Current database: trx

+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  2 |  2 | row2   |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

## Savepoints

The `SAVEPOINT` statement sets a marker within a transaction, so that the transaction can later be rolled back to this savepoint.

Savepoints are optional, and a transaction can set multiple savepoints.

A savepoint can be used in several ways.

```sql
-- 1. Set a savepoint
SAVEPOINT pt;

-- 2. Roll back to the given savepoint, discarding all modifications made after it
ROLLBACK TO pt;

-- 3. Release the savepoint
-- Releasing a savepoint is equivalent to deleting this savepoint and all savepoints after it (only the identifiers are dropped), while the corresponding modifications are kept
RELEASE SAVEPOINT pt;
```
Here, `pt` is the identifier name of the savepoint.

The following example shows how to use savepoints in a transaction.

```sql
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
+----+----+------+

greatsql> SAVEPOINT r4; /* set savepoint r4 */
greatsql> INSERT INTO t1 VALUES(4,4,'row4');

greatsql> SAVEPOINT r5; /* set savepoint r5 */
greatsql> INSERT INTO t1 VALUES(5,5,'row5');

greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
|  4 |  4 | row4 |
|  5 |  5 | row5 |
+----+----+------+

greatsql> ROLLBACK TO r5; /* roll back to savepoint r5, discarding the operations after it */
greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
|  4 |  4 | row4 |
+----+----+------+

greatsql> COMMIT;
greatsql> SELECT * FROM t1; /* only the row with id=4 was inserted; the insertion of id=5 was rolled back */
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
|  4 |  4 | row4 |
+----+----+------+
```

Now look at an example of releasing a savepoint:

```sql
greatsql> BEGIN;
greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
+----+----+------+

greatsql> SAVEPOINT r4; /* set savepoint r4 */
greatsql> INSERT INTO t1 VALUES(4,4,'row4');

greatsql> SAVEPOINT r5; /* set savepoint r5 */
greatsql> INSERT INTO t1 VALUES(5,5,'row5');

greatsql> SAVEPOINT r6; /* set savepoint r6 */
greatsql> INSERT INTO t1 VALUES(6,6,'row6');

greatsql> RELEASE SAVEPOINT r5;  /* release savepoint r5 and the savepoints after it, that is, both r5 and r6 */

/* therefore it is impossible to roll back to either r5 or r6 */
greatsql> ROLLBACK TO r6;
ERROR 1305 (42000): SAVEPOINT r6 does not exist
greatsql> ROLLBACK TO r5;
ERROR 1305 (42000): SAVEPOINT r5 does not exist

greatsql> SAVEPOINT r7; /* set a new savepoint r7 */
greatsql> INSERT INTO t1 VALUES(7,7,'row7');

greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
|  4 |  4 | row4 |
|  5 |  5 | row5 |
|  6 |  6 | row6 |
|  7 |  7 | row7 |
+----+----+------+

greatsql> ROLLBACK TO r7; /* roll back to savepoint r7, discarding the insertion of id=7 */
greatsql> COMMIT;

greatsql> SELECT * FROM t1; /* rows with id=(4,5,6) were inserted, and the row with id=7 was rolled back */
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
|  4 |  4 | row4 |
|  5 |  5 | row5 |
|  6 |  6 | row6 |
+----+----+------+
```

## Transaction Autocommit

`autocommit` is a session-level variable that determines whether transaction autocommit mode is enabled.

When `autocommit=1`, that is, in autocommit mode, every SQL statement automatically becomes a transaction and is committed immediately.

When `autocommit=0`, you must use the `COMMIT` statement explicitly to commit a transaction.

**When to enable autocommit mode (`autocommit=1`)**
1. **For simple transactions**: for simple transactional operations, such as executing a single SQL statement or cases that do not need manual transaction control, enabling autocommit reduces redundant code.
2. **When transaction control is not needed**: if the business logic of the application does not need transaction control, that is, every SQL statement is an independent operation that does not need to be rolled back, autocommit mode can be used.
3. **To reduce interaction overhead**: when performance requirements are high, autocommit reduces transaction overhead and improves execution efficiency.

**When to disable autocommit mode (`autocommit=0`)**
1. **For complex transactions**: for complex transactional operations that consist of multiple SQL statements, autocommit cannot be used if the integrity and consistency of the transaction are to be ensured.
2. **When the transaction may need to be rolled back**: if the application may need to roll back, that is, restore the state before the transaction started when an operation fails, for example when data is updated manually, autocommit should be disabled so that the operation can still be rolled back if the update fails.
3. **Data consistency requirements**: in scenarios with high data consistency requirements, it is recommended to control transactions manually to ensure the atomicity and consistency of operations.

Consider the business requirements, performance requirements, and data consistency requirements of the application when deciding whether to enable the `autocommit=1` transaction autocommit mode.

Usually, autocommit mode can be enabled to improve performance for a single SQL operation or when transaction control is not needed; for complex transactional operations or cases where data consistency must be guaranteed, it is better not to enable autocommit mode.

## XA Transactions

### XA Transaction Overview
The InnoDB storage engine supports XA transactions. The XA transaction implementation is based on the X/Open CAE document Distributed Transaction Processing: The XA Specification. This document is published by The Open Group and is available at [http://www.opengroup.org/public/pubs/catalog/c193.htm](http://www.opengroup.org/public/pubs/catalog/c193.htm).

An XA transaction is a distributed transaction processing protocol that allows a global transaction to be executed across multiple resource managers.

A global transaction is a transaction that can be executed across multiple database instances, each of which is a participant in the transaction.

Before you begin, understand a few basic concepts.
- **Participant**: a database instance that executes the transaction operations. Each participant must support the XA transaction protocol.
- **Coordinator**: responsible for coordinating the commit and rollback of the global transaction, and for handling the prepare and commit requests of the participants.

To guarantee transaction consistency, MySQL implements the classic XA standard and uses XA transactions to guarantee transaction properties. As an important component of the MySQL ecosystem, the binary log records the logical updates of database operations and can be used to build various MySQL high availability architectures. The binary log also plays another important role: it acts as the coordinator of XA transactions, coordinating the participants (storage engines) to achieve XA transaction consistency.

Executing a global transaction uses two-phase commit (2PC).
1. **In the first phase**: all participants are prepared.
2. **In the second phase**: the coordinator notifies the participants whether the transaction is to be committed or rolled back. If all participants indicated during prepare that they can commit, they are all told to commit the transaction. If any participant indicated during prepare that it cannot commit the transaction, all participants are told to roll back the transaction.

MySQL XA transaction support includes internal XA transactions and external XA transactions.

Internal XA transactions mainly refer to transactions inside the current instance. If a transaction reads from or writes to multiple storage engines, an internal XA transaction is generated. In an internal XA transaction, every transaction must write the binary log, and the consistency between the binary log and the engine modifications must be guaranteed, so the binary log is a special participant. Therefore, when the binary log is enabled, an internal XA transaction is started even if the transaction modifies only one engine.

External XA transactions have core logic similar to internal XA transactions. They consist of several XA transaction commands, including `XA START`, `XA END`, `XA PREPARE`, `XA COMMIT`, `XA ROLLBACK`, and `XA RECOVER`, and can support XA transactions across multiple nodes. For external XA transactions, the coordinator is the user application and the participants are MySQL instances, so the application must persist the coordination information to solve transaction consistency problems.

**How to use XA transactions**
1. **Prepare phase**: the coordinator sends a prepare request `XA PREPARE` to all participants, asking them to prepare to commit the transaction.
2. **Commit phase**: if all participants prepare successfully, the coordinator sends a commit request `XA COMMIT` to all participants, asking them to commit the transaction.
3. **Rollback phase**: if any participant cannot prepare, or the coordinator receives a rollback request `XA ROLLBACK`, the coordinator sends a rollback request to all participants, asking them to roll back the transaction.

When using MySQL XA transactions, make sure that all instances are in a normal state and that communication between nodes works. Also make sure that the transaction log functions of MySQL (including the binary log and the redo log) are available, so that transactions can be recovered and rolled back.

### XA Transaction SQL Statements

MySQL/GreatSQL supports the following SQL statements for XA transactions:

```sql
-- Start a transaction
XA {START|BEGIN} xid [JOIN|RESUME]

-- End a transaction
XA END xid [SUSPEND [FOR MIGRATE]]

-- Prepare the transaction for commit
XA PREPARE xid

-- Commit the transaction
XA COMMIT xid [ONE PHASE]

-- Roll back the transaction
XA ROLLBACK xid

-- List all transactions in the PREPARED state
-- Requires the XA_RECOVER_ADMIN privilege
XA RECOVER [CONVERT XID]
```

The following example demonstrates the process of an XA transaction:

```sql
                           session1                            │ session2
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> XA BEGIN 'xa1';
                                                               │Query OK, 0 rows affected (0.00 sec)
----------------------------------------------------------------------------------------------------------------------------------------
/* XA BEGIN does not really start a transaction */             │ /* XA BEGIN does not actually start a transaction */
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* it starts only when a DML statement is issued */
Empty set (0.00 sec)                                           │
                                                               │
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> SELECT * FROM city WHERE ID = 3;
                                                               │+----+-------+-------------+----------+------------+
                                                               │| ID | Name  | CountryCode | District | Population |
                                                               │+----+-------+-------------+----------+------------+
                                                               │|  3 | Herat | AFG         | Herat    |     186800 |
                                                               │+----+-------+-------------+----------+------------+
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* the transaction really starts after the SELECT; it is still a read-only transaction */
*************************** 1. row *************************** │ /* it becomes a read-write transaction only after the UPDATE */
                    trx_id: 421166643830136                    │
...                                                            │
       trx_mysql_thread_id: 79                                 │
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;
                                                               │Query OK, 1 row affected (0.07 sec)
                                                               │Rows matched: 1  Changed: 1  Warnings: 0
                                                               │
                                                               │greatsql> XA END 'xa1';
                                                               │Query OK, 0 rows affected (0.00 sec)
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* before XA PREPARE, XA RECOVER returns an empty result */
*************************** 1. row *************************** │
                    trx_id: 2673                               │
...                                                            │
       trx_mysql_thread_id: 79                                 │
                                                               │
                                                               │
greatsql> XA RECOVER;                                          │
Empty set (0.00 sec)                                           │
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> XA PREPARE 'xa1';
                                                               │Query OK, 0 rows affected (0.07 sec)
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* after XA PREPARE, XA RECOVER shows the transaction in the PREPARE state */
*************************** 1. row *************************** │ /* in addition, trx_mysql_thread_id changes from 79 to 0 */
                    trx_id: 2673                               │
...                                                            │
       trx_mysql_thread_id: 0                                  │
                                                               │
                                                               │
greatsql> XA RECOVER;                                          │
+----------+--------------+--------------+------+              │
| formatID | gtrid_length | bqual_length | data |              │
+----------+--------------+--------------+------+              │
|        1 |            3 |            0 | xa1  |              │
+----------+--------------+--------------+------+              │
1 row in set (0.00 sec)                                        │
                                                               │
greatsql> XA ROLLBACK 'xa1';                                   │ /* another session can execute XA ROLLBACK to roll back a transaction of a different session */
Query OK, 0 rows affected (0.00 sec)                           │ /* this session can no longer commit or roll back that XA transaction */
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> XA COMMIT 'xa1';
                                                               │ERROR 1397 (XAE04): XAER_NOTA: Unknown XID
                                                               │
                                                               │ /* start a new XA transaction */
                                                               │greatsql> XA BEGIN 'xa1';
                                                               │greatsql> SELECT * FROM city WHERE ID = 3;
                                                               │+----+-------+-------------+----------+------------+
                                                               │| ID | Name  | CountryCode | District | Population |
                                                               │+----+-------+-------------+----------+------------+
                                                               │|  3 | Herat | AFG         | Herat    |     186800 |
                                                               │+----+-------+-------------+----------+------------+
                                                               │
                                                               │greatsql> UPDATE city set Population = 206800 WHERE ID = 3;
                                                               │Query OK, 1 row affected (0.07 sec)
                                                               │Rows matched: 1  Changed: 1  Warnings: 0
                                                               │
                                                               │greatsql> XA END 'xa1';
                                                               │Query OK, 0 rows affected (0.00 sec)
                                                               │
                                                               │greatsql> XA PREPARE 'xa1';
                                                               │Query OK, 0 rows affected (0.07 sec)
                                                               │
                                                               │greatsql> XA COMMIT 'xa1';
                                                               │Query OK, 0 rows affected (0.00 sec)
                                                               │
                                                               │greatsql> SELECT * FROM city WHERE ID = 3;
                                                               │+----+-------+-------------+----------+------------+
                                                               │| ID | Name  | CountryCode | District | Population |
                                                               │+----+-------+-------------+----------+------------+
                                                               │|  3 | Herat | AFG         | Herat    |     206800 |
                                                               │+----+-------+-------------+----------+------------+
```

Sometimes the xid of an XA transaction is generated by an external program and uses hexadecimal or another format. In that case it may look like unprintable garbage, as shown below:

```sql
greatsql> XA RECOVER;
+----------+--------------+--------------+-----------------------------------+
| formatID | gtrid_length | bqual_length | data                              |
+----------+--------------+--------------+-----------------------------------+
|      201 |           29 |            4 | ljX6DBH           w           |
|      201 |           28 |            4 |   jƪ8hiqw                    |
|      201 |           23 |            4 | <jKi(8hiqw                 |
+----------+--------------+--------------+----------------------------------+
```

In this case, add the `CONVERT XID` keyword to convert the `data` column value into printable hexadecimal, and then you can perform a `ROLLBACK` operation on it:

```sql
greatsql> XA RECOVER CONVERT XID;
+----------+--------------+--------------+----------------------------------------------------------+
| formatID | gtrid_length | bqual_length | data                                                     |
+----------+--------------+--------------+----------------------------------------------------------+
|      201 |           23 |            4 | 0xAAAAAB3C6ABAE54B6928EBF6AAAB38EC68E58C13697184C2D3FF77 |
+----------+--------------+--------------+----------------------------------------------------------+
```

In the result above, the `data` column value consists of `gtrid`, `bqual`, and `xid`. The breakdown is as follows:

1. In the hexadecimal representation of `data`, the `bqual` length is `bqual_length` * 2 = 8 (in hexadecimal mode the length must be multiplied by 2, because one ASCII character occupies 2 characters when represented in hexadecimal; this is not needed in normal mode).
2. Therefore, the hexadecimal value of `bqual` is `C2D3FF77`.
3. The remaining part is the hexadecimal value of `xid`, which is `AAAAAB3C6ABAE54B6928EBF6AAAB38EC68E58C13697184`.
4. Apart from the `data` column, the `formatID` column value is 201, which needs no extra handling.

Therefore, this XA transaction can be committed or rolled back as follows:

```sql
greatsql> XA ROLLBACK X'AAAAAB3C6ABAE54B6928EBF6AAAB38EC68E58C13697184', X'C2D3FF77', 201;
Query OK, 0 rows affected (0.00 sec)
```

For more details about XA transactions, see: [XA Transactions](https://dev.mysql.com/doc/refman/8.0/en/xa.html).



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
