# Transaction Isolation Levels
---

This section describes transaction isolation levels, how to set them, and how to choose one.

## Introduction

The database transaction isolation level describes the degree to which concurrently executing transactions interfere with each other.

During concurrent transaction execution, without proper isolation level control, the following problems may occur:
- Dirty read: a transaction reads data that another transaction has not committed. If the other transaction rolls back, the data that was read is invalid.
- Non-repeatable read: within the same transaction, updates made by other transactions cause multiple reads of the same data to return different results.
- Phantom read: within the same transaction, inserts or deletes made by other transactions cause multiple queries of the same data set to return different result sets.

These concurrency problems arise because the transaction isolation levels differ, or because transactions do not correctly use mechanisms such as locks or row-level locks to control concurrency.

GreatSQL supports four isolation levels. The higher the isolation level, the smaller the mutual influence between transactions and the fewer the problems that can occur. The four levels are:

1. Read Uncommitted, abbreviated as **RU**

2. Read Committed, abbreviated as **RC**

3. Repeatable Read, abbreviated as **RR**

4. Serializable, abbreviated as **SR**

The default transaction isolation level of GreatSQL is Repeatable Read. You can set the transaction isolation level to control the concurrency behavior and data consistency of transactions, so as to meet the requirements of different business scenarios. Note that the higher the isolation level, the lower the transaction concurrency and the higher the performance overhead. Therefore, when choosing an isolation level, you need to weigh the specific business requirements against the performance requirements.

## Read Uncommitted

Read Uncommitted is the lowest isolation level; it allows a transaction to read data that another transaction has not committed. It may cause dirty reads, non-repeatable reads, and phantom reads.

An example is shown below:

```sql
---------------------------------------------------------------------------------------------------------------------------------------
                               trx1                                 │ trx2
---------------------------------------------------------------------------------------------------------------------------------------
/* Change the isolation level */
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
                                                                    │
greatsql> BEGIN;                                                    │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 3;                         │greatsql> SELECT * FROM city WHERE ID <= 3;
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
| ID | Name     | CountryCode | District | Population |             │| ID | Name     | CountryCode | District | Population |
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
|  1 | Kabul    | AFG         | Kabol    |    1780000 |             │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  2 | Qandahar | AFG         | Qandahar |     237500 |             │|  2 | Qandahar | AFG         | Qandahar |     237500 |
|  3 | Herat    | AFG         | Herat    |     186800 |             │|  3 | Herat    | AFG         | Herat    |     186800 |
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
3 rows in set (0.00 sec)                                            │3 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> UPDATE city SET Population=206800 WHERE ID=3;             │
Query OK, 1 row affected (0.00 sec)                                 │
Rows matched: 1  Changed: 1  Warnings: 0                            │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx1 has not committed; trx2 reads the change immediately (dirty read) */
                                                                    │greatsql> SELECT * FROM city WHERE ID = 3;
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │| ID | Name  | CountryCode | District | Population |
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │|  3 | Herat | AFG         | Herat    |     206800 |
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │1 row in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> DELETE FROM city WHERE ID=2;                              │
Query OK, 1 row affected (0.00 sec)                                 │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx1 deletes ID=2 without committing; trx2 cannot read it (phantom read) */
                                                                    │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │| ID | Name  | CountryCode | District | Population |
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │|  1 | Kabul | AFG         | Kabol    |    1780000 |
                                                                    │|  3 | Herat | AFG         | Herat    |     206800 |
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │2 rows in set (0.01 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> ROLLBACK;                                                 │
Query OK, 0 row affected (0.00 sec)                                 │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx1 rolls back; trx2 reads the oldest version of the data again */
                                                                    │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │| ID | Name     | CountryCode | District | Population |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                    │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                    │|  3 | Herat    | AFG         | Herat    |     186800 |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │3 rows in set (0.00 sec)
```

## Read Committed

Read Committed: guarantees that a transaction can read only data committed by other transactions. It avoids dirty reads, but non-repeatable reads and phantom reads may still occur.

```sql
---------------------------------------------------------------------------------------------------------------------------------------
                              trx1                                │ trx2
---------------------------------------------------------------------------------------------------------------------------------------
/* Change the isolation level */
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
Query OK, 0 rows affected (0.00 sec)                              │Query OK, 0 rows affected (0.00 sec)
                                                                  │
greatsql> BEGIN;                                                  │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                              │Query OK, 0 rows affected (0.01 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 2;                       │greatsql> SELECT * FROM city WHERE ID <= 2;
+----+----------+-------------+----------+------------+           │+----+----------+-------------+----------+------------+
| ID | Name     | CountryCode | District | Population |           │| ID | Name     | CountryCode | District | Population |
+----+----------+-------------+----------+------------+           │+----+----------+-------------+----------+------------+
|  1 | Kabul    | AFG         | Kabol    |    1780000 |           │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  2 | Qandahar | AFG         | Qandahar |     237500 |           │|  2 | Qandahar | AFG         | Qandahar |     237500 |
+----+----------+-------------+----------+------------+           │+----+----------+-------------+----------+------------+
2 rows in set (0.00 sec)                                          │2 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> UPDATE city SET Population=337500 WHERE ID = 2;         │
Rows matched: 1  Changed: 1  Warnings: 0                          │
                                                                  │
greatsql> SELECT * FROM city WHERE ID <= 2;                       │
+----+----------+-------------+----------+------------+           │
| ID | Name     | CountryCode | District | Population |           │
+----+----------+-------------+----------+------------+           │
|  1 | Kabul    | AFG         | Kabol    |    1780000 |           │
|  2 | Qandahar | AFG         | Qandahar |     337500 |           │
+----+----------+-------------+----------+------------+           │
2 rows in set (0.00 sec)                                          │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                  │/* trx2 cannot read the modifications trx1 made without committing */
                                                                  │greatsql> SELECT * FROM city WHERE ID <= 2;
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │| ID | Name     | CountryCode | District | Population |
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                  │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │2 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> DELETE FROM city WHERE ID = 1;                          │
Query OK, 1 row affected (0.00 sec)                               │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                  │/* trx2 reads again and still cannot see the updates and deletes */
                                                                  │/* because trx1 has not committed yet */
                                                                  │greatsql> SELECT * FROM city WHERE ID <= 2;
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │| ID | Name     | CountryCode | District | Population |
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                  │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │2 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> COMMIT;                                                 │
Query OK, 0 rows affected (0.06 sec)                              │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                  │/* after trx1 commits, the updated data can be read */
                                                                  │/* and the row with ID=1 can no longer be read (phantom read) */
                                                                  │greatsql> SELECT * FROM city WHERE ID <= 2;
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │| ID | Name     | CountryCode | District | Population |
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │|  2 | Qandahar | AFG         | Qandahar |     337500 |
                                                                  │+----+----------+-------------+----------+------------+
                                                                  │1 row in set (0.00 sec)
```

## Repeatable Read

Repeatable Read: guarantees that when a transaction reads the same data set multiple times during its execution, the data set it reads is consistent, that is, non-repeatable reads do not occur. In GreatSQL 8.0 and later, phantom reads do not occur; before GreatSQL 8.0, phantom reads may occur.

```sql
---------------------------------------------------------------------------------------------------------------------------------------
                               trx1                                │ trx2
---------------------------------------------------------------------------------------------------------------------------------------
/* Change the isolation level */
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ; │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
Query OK, 0 rows affected (0.00 sec)                               │Query OK, 0 rows affected (0.00 sec)
                                                                   │
greatsql> BEGIN;                                                   │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                               │Query OK, 0 rows affected (0.00 sec)
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 3;                        │greatsql> SELECT * FROM city WHERE ID <= 3;
+----+----------+-------------+----------+------------+            │+----+----------+-------------+----------+------------+
| ID | Name     | CountryCode | District | Population |            │| ID | Name     | CountryCode | District | Population |
+----+----------+-------------+----------+------------+            │+----+----------+-------------+----------+------------+
|  1 | Kabul    | AFG         | Kabol    |    1780000 |            │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  2 | Qandahar | AFG         | Qandahar |     237500 |            │|  2 | Qandahar | AFG         | Qandahar |     237500 |
|  3 | Herat    | AFG         | Herat    |     186800 |            │|  3 | Herat    | AFG         | Herat    |     186800 |
+----+----------+-------------+----------+------------+            │+----+----------+-------------+----------+------------+
3 rows in set (0.00 sec)                                           │3 rows in set (0.00 sec)
                                                                   │
greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;        │
Query OK, 1 row affected (0.00 sec)                                │
Rows matched: 1  Changed: 1  Warnings: 0                           │
                                                                   │
greatsql> DELETE FROM city WHERE ID = 2;                           │
Query OK, 1 row affected (0.00 sec)                                │
                                                                   │
greatsql> SELECT * FROM city WHERE ID <= 3;                        │
+----+-------+-------------+----------+------------+               │
| ID | Name  | CountryCode | District | Population |               │
+----+-------+-------------+----------+------------+               │
|  1 | Kabul | AFG         | Kabol    |    1780000 |               │
|  3 | Herat | AFG         | Herat    |     206800 |               │
+----+-------+-------------+----------+------------+               │
2 rows in set (0.00 sec)                                           │
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> COMMIT;                                                  │/* trx1 updated and deleted rows without committing; trx2 cannot read the new data */
Query OK, 0 rows affected (0.08 sec)                               │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                   │+----+----------+-------------+----------+------------+
greatsql> SELECT * FROM city WHERE ID <= 3;                        │| ID | Name     | CountryCode | District | Population |
+----+-------+-------------+----------+------------+               │+----+----------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |               │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+               │|  2 | Qandahar | AFG         | Qandahar |     237500 |
|  1 | Kabul | AFG         | Kabol    |    1780000 |               │|  3 | Herat    | AFG         | Herat    |     186800 |
|  3 | Herat | AFG         | Herat    |     206800 |               │+----+----------+-------------+----------+------------+
+----+-------+-------------+----------+------------+               │3 rows in set (0.00 sec)
2 rows in set (0.00 sec)                                           │
----------------------------------------------------------------------------------------------------------------------------------------
                                                                   │/* after trx1 commits, trx2 has still not committed and cannot read the new data */
                                                                   │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                   │+----+----------+-------------+----------+------------+
                                                                   │| ID | Name     | CountryCode | District | Population |
                                                                   │+----+----------+-------------+----------+------------+
                                                                   │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                   │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                   │|  3 | Herat    | AFG         | Herat    |     186800 |
                                                                   │+----+----------+-------------+----------+------------+
                                                                   │3 rows in set (0.00 sec)
                                                                   │
                                                                   │greatsql> COMMIT;
                                                                   │Query OK, 0 rows affected (0.00 sec)
                                                                   │
                                                                   │/* only after trx2 commits can a new transaction read the new data */
                                                                   │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                   │+----+-------+-------------+----------+------------+
                                                                   │| ID | Name  | CountryCode | District | Population |
                                                                   │+----+-------+-------------+----------+------------+
                                                                   │|  1 | Kabul | AFG         | Kabol    |    1780000 |
                                                                   │|  3 | Herat | AFG         | Herat    |     206800 |
                                                                   │+----+-------+-------------+----------+------------+
                                                                   │2 rows in set (0.00 sec)
```

In GreatSQL 5.7, when `innodb_locks_unsafe_for_binlog=1` is set (the default is 0), phantom reads may occur under the Repeatable Read isolation level. You can test this yourself.

## Serializable

Serializable: the highest isolation level. It fully isolates transactions and guarantees that every transaction execution sees the same data view, avoiding dirty reads, non-repeatable reads, and phantom reads, but the performance overhead is high. Under the Serializable isolation level, the InnoDB storage engine can hardly take advantage of its row locks and transaction concurrency, and its performance is close to that of the MyISAM storage engine.

```sql
------------------------------------------------------------------------------------------------------------------------------------
                             trx1                               │ trx2
------------------------------------------------------------------------------------------------------------------------------------
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE; │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
Query OK, 0 rows affected (0.00 sec)                            │Query OK, 0 rows affected (0.00 sec)
                                                                │
greatsql> BEGIN;                                                │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                            │Query OK, 0 rows affected (0.00 sec)
------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 3;                     │/* read-only requests do not block each other */
+----+----------+-------------+----------+------------+         │greatsql> SELECT * FROM city WHERE ID <= 3;
| ID | Name     | CountryCode | District | Population |         │+----+----------+-------------+----------+------------+
+----+----------+-------------+----------+------------+         │| ID | Name     | CountryCode | District | Population |
|  1 | Kabul    | AFG         | Kabol    |    1780000 |         │+----+----------+-------------+----------+------------+
|  2 | Qandahar | AFG         | Qandahar |     237500 |         │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  3 | Herat    | AFG         | Herat    |     186800 |         │|  2 | Qandahar | AFG         | Qandahar |     237500 |
+----+----------+-------------+----------+------------+         │|  3 | Herat    | AFG         | Herat    |     186800 |
3 rows in set (0.00 sec)                                        │+----+----------+-------------+----------+------------+
                                                                │3 rows in set (0.00 sec)
------------------------------------------------------------------------------------------------------------------------------------
                                                                │greatsql> ROLLBACK;
                                                                │Query OK, 0 rows affected (0.00 sec)
                                                                │/* the trx1 UPDATE stays blocked until trx2 rolls back */
greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;     │
Query OK, 0 rows affected (17.66 sec)                           │
Rows matched: 1  Changed: 0  Warnings: 0                        │
------------------------------------------------------------------------------------------------------------------------------------
greatsql> ROLLBACK;                                             │/* trx1 and trx2 start new transactions */
Query OK, 0 rows affected (0.00 sec)                            │greatsql> BEGIN;
                                                                │Query OK, 0 rows affected (0.00 sec)
greatsql> BEGIN;                                                │
Query OK, 0 rows affected (0.00 sec)                            │
                                                                │
greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;     │
Query OK, 0 rows affected (0.00 sec)                            │
Rows matched: 1  Changed: 0  Warnings: 0                        │
                                                                │
greatsql> ROLLBACK;                                             │
                                                                │---------------------------------------------------------------
                                                                │/* trx1 executes UPDATE first; before it executes ROLLBACK */
                                                                │/* even a read-only request from trx2 is blocked */
                                                                │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                │+----+----------+-------------+----------+------------+
                                                                │| ID | Name     | CountryCode | District | Population |
                                                                │+----+----------+-------------+----------+------------+
                                                                │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                │|  3 | Herat    | AFG         | Herat    |     186800 |
                                                                │+----+----------+-------------+----------+------------+
                                                                │3 rows in set (5.69 sec)
```

As the example above shows, under the Serializable isolation level, apart from read-only requests, no requests can be executed concurrently. Therefore, this isolation level is almost never chosen in real business scenarios.

## How to Set the Isolation Level

You can set the global isolation level in the `[mysqld]` section of the `my.cnf` configuration file, for example:
```ini
[mysqld]
transaction_isolation = REPEATABLE-READ
```

You can also change it dynamically online with SQL statements at runtime, for example:
```sql
SET [GLOBAL | SESSION] TRANSACTION ISOLATION LEVEL REPEATABLE READ; 
```

When changing the isolation level with SQL statements, you can change the global (GLOBAL) isolation level or only the current session (SESSION) isolation level; you can even set an isolation level that affects only the next transaction.

```sql
-- Change the global setting
greatsql> SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ; 

-- Change the session-level setting
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ; 

-- View the global/session-level setting
greatsql> SELECT @@GLOBAL.TRANSACTION_ISOLATION, @@SESSION.TRANSACTION_ISOLATION;
+--------------------------------+---------------------------------+
| @@GLOBAL.TRANSACTION_ISOLATION | @@SESSION.TRANSACTION_ISOLATION |
+--------------------------------+---------------------------------+
| REPEATABLE-READ                | READ-COMMITTED                  |
+--------------------------------+---------------------------------+

-- Reconnect and continue the test
greatsql> \r
Connection id:    1988641
Current database: *** NONE ***

-- Change only the next transaction, without affecting the global/session setting
greatsql> SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; 

greatsql> SELECT @@GLOBAL.TRANSACTION_ISOLATION, @@SESSION.TRANSACTION_ISOLATION;
+--------------------------------+---------------------------------+
| @@GLOBAL.TRANSACTION_ISOLATION | @@SESSION.TRANSACTION_ISOLATION |
+--------------------------------+---------------------------------+
| REPEATABLE-READ                | REPEATABLE-READ                 |
+--------------------------------+---------------------------------+
1 row in set (0.00 sec)

greatsql> SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
Query OK, 0 rows affected (0.00 sec)

/* start a new transaction */
greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT * FROM city WHERE ID = 1;
+----+-------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |
+----+-------+-------------+----------+------------+
|  1 | Kabul | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+
1 row in set (0.01 sec)

/* check the current transaction state and confirm its isolation level is RC */
greatsql> SELECT * FROM information_schema.INNODB_TRX\G
*************************** 1. row ***************************
                    trx_id: 421697769444584
                 trx_state: RUNNING
               trx_started: 2024-04-28 10:48:08
     trx_requested_lock_id: NULL
          trx_wait_started: NULL
                trx_weight: 0
       trx_mysql_thread_id: 1988641
                 trx_query: SELECT * FROM information_schema.INNODB_TRX
       trx_operation_state: NULL
         trx_tables_in_use: 0
         trx_tables_locked: 0
          trx_lock_structs: 0
     trx_lock_memory_bytes: 1128
           trx_rows_locked: 0
         trx_rows_modified: 0
   trx_concurrency_tickets: 0
       trx_isolation_level: READ COMMITTED
         trx_unique_checks: 1
    trx_foreign_key_checks: 1
trx_last_foreign_key_error: NULL
 trx_adaptive_hash_latched: 0
 trx_adaptive_hash_timeout: 0
          trx_is_read_only: 0
trx_autocommit_non_locking: 0
       trx_schedule_weight: NULL

greatsql> COMMIT;
Query OK, 0 rows affected (0.00 sec)

/* commit the current transaction, start a new one, and confirm the isolation level is RR again */
greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT * FROM city WHERE ID = 1;
+----+-------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |
+----+-------+-------------+----------+------------+
|  1 | Kabul | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM information_schema.INNODB_TRX\G
*************************** 1. row ***************************
                    trx_id: 421697769444584
                 trx_state: RUNNING
               trx_started: 2024-04-28 10:50:35
     trx_requested_lock_id: NULL
          trx_wait_started: NULL
                trx_weight: 0
       trx_mysql_thread_id: 1988641
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
          trx_is_read_only: 0
trx_autocommit_non_locking: 0
       trx_schedule_weight: NULL
```

## Choosing an Isolation Level

Choosing a transaction isolation level depends on the specific situation and application requirements. RC (Read Committed) and RR (Repeatable Read) are two commonly used transaction isolation levels, each with its own advantages and disadvantages.

1. **RC**:
   - Advantages: every read returns the latest data and no dirty reads occur, so data consistency is guaranteed.
   - Disadvantages: phantom reads may occur, that is, two queries in the same transaction may return different rows.
2. **RR** (default level):
   - Advantages: guarantees repeatable read consistency within a transaction and avoids phantom reads.
   - Disadvantages: may cause more lock contention and deadlocks, which affects system performance to some extent.

Recommendations:

- If the application has high data consistency requirements but does not have particularly high concurrency requirements, choose the RR isolation level.

- If the application has high concurrency requirements and its data consistency requirements can be relaxed, choose the RC isolation level.

Note that the choice of isolation level should also consider factors such as the overall system architecture, concurrent access volume, and transaction types. It is recommended to test and evaluate in the actual application and choose the most suitable isolation level. In most scenarios, choosing the RC isolation level basically meets business requirements.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
