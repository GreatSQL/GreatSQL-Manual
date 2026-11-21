# MDL Lock Wait Analysis
---

This article introduces how to view MDL locks in the GreatSQL database, and how to troubleshoot and analyze when MDL lock waits occur.

## About MDL Locks
In the article [**Troubleshooting and Analyzing Slow UPDATE Execution**](./2-4-slow-update-diag.md), it is mentioned that when executing `SHOW PROCESSLIST`, a status of `Waiting for XX metadata lock` may be seen, which means an MDL lock wait is currently occurring.

MDL lock is the full name of metadata lock. In MySQL/GreatSQL, DDL does not support transaction features. When transactions and DDL operate on the same table at the same time, various unexpected problems may occur, such as transaction features being broken and binlog order disorder. To solve such problems, MySQL introduced MDL locks (metadata locking) starting from 5.5. In other words, the role of the MDL lock is to ensure the consistency of table metadata, avoiding metadata inconsistency caused by DDL and DML running in parallel.

The scope of MDL locks mainly includes the following:
- **GLOBAL**, i.e., a global read lock, for example, executing `FLUSH TABLES WITH READ LOCK`.
- **TABLE/TABLESPACE/SCHEMA**, protecting metadata.
- **FUNCTION/PROCEDURE/TRIGGER/EVENT**, protecting metadata.
- **COMMIT**, used to block transaction commits. For example, before a transaction commits, if the MDL lock has not been released, the commit is blocked at this time.
- **BACKUP**, the global backup lock and single-table backup lock. Backup locks were added after 8.0.
- **USER_LEVEL_LOCK**, user-level custom locks.
- **FOREIGN_KEY/CHECK_CONSTRAINT**, constraint validation locks.

There are other MDL lock scopes that cannot all be listed here. MySQL is still continuously optimizing MDL locks.

## Viewing the MDL Lock Status

The MDL lock is a Server-layer lock and an object-level lock.

When a DML request is initiated, an MDL shared lock (read lock) is also applied to the table; when a DDL request is initiated, an MDL exclusive lock (write lock) is also applied to the table. The operations of applying for MDL locks form a queue, and in the queue, write locks have higher acquisition priority than read locks.

By querying `performance_schema.metadata_locks`, the current MDL locking and lock wait information can be seen. However, corresponding settings must be made first:
```sql
-- 1. Turn on the MDL observation switch in PFS
UPDATE setup_consumers SET ENABLED = 'YES' WHERE NAME ='global_instrumentation';

UPDATE setup_instruments SET ENABLED = 'YES' WHERE NAME ='wait/lock/metadata/sql/mdl';
```

Below, several scenarios are simulated to observe the different locking performances of MDL locks respectively.

**1. Initiate a transaction and submit a DML request**

Initiate the following request in session 1:
```sql
BEGIN;
UPDATE t1 SET k=RAND()*102400 WHERE id = 3;
```

In another session, observe the MDL locking situation:
```sql
greatsql> SELECT * FROM performance_schema.metadata_locks\G
*************************** 1. row ***************************
          OBJECT_TYPE: TABLE               #<-- Table-level lock
        OBJECT_SCHEMA: greatsql
          OBJECT_NAME: t1
          COLUMN_NAME: NULL
OBJECT_INSTANCE_BEGIN: 139835142929568
            LOCK_TYPE: SHARED_WRITE        #<-- Shared write lock, because this is an UPDATE transaction. If a SELECT...FOR SHARE request is initiated, the lock type is SHARED_READ
        LOCK_DURATION: TRANSACTION         #<-- MDL lock initiated in a transaction
          LOCK_STATUS: GRANTED             #<-- Lock status: acquired
               SOURCE: sql_parse.cc:6516
      OWNER_THREAD_ID: 11648
       OWNER_EVENT_ID: 18
```

**2. Initiate an explicit LOCK WRITE request**

Session 1:
```sql
LOCK TABLE t1 WRITE;
```

Session 2:
```sql
greatsql> SELECT * FROM performance_schema.metadata_locks;
+---------------+--------------------+----------------+-------------+-----------------------+----------------------+---------------+-------------+-------------------+-----------------+----------------+
| OBJECT_TYPE   | OBJECT_SCHEMA      | OBJECT_NAME    | COLUMN_NAME | OBJECT_INSTANCE_BEGIN | LOCK_TYPE            | LOCK_DURATION | LOCK_STATUS | SOURCE            | OWNER_THREAD_ID | OWNER_EVENT_ID |
+---------------+--------------------+----------------+-------------+-----------------------+----------------------+---------------+-------------+-------------------+-----------------+----------------+
| GLOBAL        | NULL               | NULL           | NULL        |       139835077968576 | INTENTION_EXCLUSIVE  | STATEMENT     | GRANTED     | sql_base.cc:5588  |           11649 |             18 |
| SCHEMA        | greatsql           | NULL           | NULL        |       139835167440320 | INTENTION_EXCLUSIVE  | TRANSACTION   | GRANTED     | sql_base.cc:5575  |           11649 |             18 |
| TABLE         | greatsql           | t1             | NULL        |       139835167441840 | SHARED_NO_READ_WRITE | TRANSACTION   | GRANTED     | sql_parse.cc:6516 |           11649 |             18 |
| BACKUP TABLES | NULL               | NULL           | NULL        |       139835167437280 | INTENTION_EXCLUSIVE  | STATEMENT     | GRANTED     | lock.cc:1269      |           11649 |             18 |
| TABLESPACE    | NULL               | greatsql/t1    | NULL        |       139835176538640 | INTENTION_EXCLUSIVE  | TRANSACTION   | GRANTED     | lock.cc:816       |           11649 |             18 |
+---------------+--------------------+----------------+-------------+-----------------------+----------------------+---------------+-------------+-------------------+-----------------+----------------+
```
It can be seen that the **LOCK WRITE** request actually needs to apply for several exclusive locks.


**3. Initiate an explicit LOCK READ request**

Session 1:
```sql
LOCK TABLE t1 READ;
```

Session 2:
```sql
greatsql> SELECT * FROM performance_schema.metadata_locks\G
*************************** 1. row ***************************
          OBJECT_TYPE: TABLE
        OBJECT_SCHEMA: greatsql
          OBJECT_NAME: t1
          COLUMN_NAME: NULL
OBJECT_INSTANCE_BEGIN: 139835167440320
            LOCK_TYPE: SHARED_READ_ONLY
        LOCK_DURATION: TRANSACTION
          LOCK_STATUS: GRANTED
               SOURCE: sql_parse.cc:6516
      OWNER_THREAD_ID: 11649
       OWNER_EVENT_ID: 23
```
For a **LOCK READ** request, it is much simpler, with only one table-level object shared lock.

**4. Initiate a DDL request**

Session 1:
```sql
ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL;
```

Session 2:
```sql
greatsql> SELECT * FROM performance_schema.metadata_locks\G
+---------------+--------------------+------------------+-------------+-----------------------+---------------------+---------------+-------------+--------------------+-----------------+----------------+
| OBJECT_TYPE   | OBJECT_SCHEMA      | OBJECT_NAME      | COLUMN_NAME | OBJECT_INSTANCE_BEGIN | LOCK_TYPE           | LOCK_DURATION | LOCK_STATUS | SOURCE             | OWNER_THREAD_ID | OWNER_EVENT_ID |
+---------------+--------------------+------------------+-------------+-----------------------+---------------------+---------------+-------------+--------------------+-----------------+----------------+
| GLOBAL        | NULL               | NULL             | NULL        |       139835077968576 | INTENTION_EXCLUSIVE | STATEMENT     | GRANTED     | sql_base.cc:5588   |           11649 |             32 |
| BACKUP LOCK   | NULL               | NULL             | NULL        |       139835176542080 | INTENTION_EXCLUSIVE | TRANSACTION   | GRANTED     | sql_base.cc:5600   |           11649 |             32 |
| SCHEMA        | greatsql           | NULL             | NULL        |       139835167443440 | INTENTION_EXCLUSIVE | TRANSACTION   | GRANTED     | sql_base.cc:5575   |           11649 |             32 |
| TABLE         | greatsql           | t1               | NULL        |       139835167442560 | SHARED_UPGRADABLE   | TRANSACTION   | GRANTED     | sql_parse.cc:6516  |           11649 |             32 |
| BACKUP TABLES | NULL               | NULL             | NULL        |       139835090555168 | INTENTION_EXCLUSIVE | STATEMENT     | GRANTED     | lock.cc:1269       |           11649 |             32 |
| TABLESPACE    | NULL               | greatsql/t1      | NULL        |       139835176538640 | INTENTION_EXCLUSIVE | TRANSACTION   | GRANTED     | lock.cc:816        |           11649 |             32 |
| TABLE         | greatsql           | #sql-1cbfa7_3436 | NULL        |       139833831927776 | EXCLUSIVE           | STATEMENT     | GRANTED     | sql_table.cc:17750 |           11649 |             32 |
| TABLE         | performance_schema | metadata_locks   | NULL        |       139835329552848 | SHARED_READ         | TRANSACTION   | GRANTED     | sql_parse.cc:6516  |           12409 |              3 |
+---------------+--------------------+------------------+-------------+-----------------------+---------------------+---------------+-------------+--------------------+-----------------+----------------+
```
Several locks also need to be applied for.

**5. Initiate a backup lock**

Session 1:

```sql
LOCK INSTANCE FOR BACKUP;
```

Session 2:
```sql
greatsql> SELECT * FROM performance_schema.metadata_locks\G
*************************** 1. row ***************************
          OBJECT_TYPE: BACKUP LOCK
        OBJECT_SCHEMA: NULL
          OBJECT_NAME: NULL
          COLUMN_NAME: NULL
OBJECT_INSTANCE_BEGIN: 139835167443600
            LOCK_TYPE: SHARED
        LOCK_DURATION: EXPLICIT
          LOCK_STATUS: GRANTED
               SOURCE: sql_backup_lock.cc:100
      OWNER_THREAD_ID: 11649
       OWNER_EVENT_ID: 48
```

**6. Initiate an FTWRL lock**

Session 1:

```sql
FLUSH TABLES WITH READ LOCK;
```

Session 2:
```sql
greatsql> SELECT * FROM performance_schema.metadata_locks\G
*************************** 1. row ***************************
          OBJECT_TYPE: GLOBAL
        OBJECT_SCHEMA: NULL
          OBJECT_NAME: NULL
          COLUMN_NAME: NULL
OBJECT_INSTANCE_BEGIN: 139835167443600
            LOCK_TYPE: SHARED
        LOCK_DURATION: EXPLICIT
          LOCK_STATUS: GRANTED
               SOURCE: lock.cc:1076
      OWNER_THREAD_ID: 11649
       OWNER_EVENT_ID: 62
*************************** 2. row ***************************
          OBJECT_TYPE: COMMIT
        OBJECT_SCHEMA: NULL
          OBJECT_NAME: NULL
          COLUMN_NAME: NULL
OBJECT_INSTANCE_BEGIN: 139835061536608
            LOCK_TYPE: SHARED
        LOCK_DURATION: EXPLICIT
          LOCK_STATUS: GRANTED
               SOURCE: lock.cc:1151
      OWNER_THREAD_ID: 11649
       OWNER_EVENT_ID: 62
```
Besides the GLOBAL lock, a COMMIT lock can also be seen.

## Viewing and Analyzing MDL Lock Waits

The MDL lock is a relatively coarse-grained lock. Once a write lock wait occurs, not only is the current operation blocked, but all subsequent operations on the table are also blocked, as shown in the following example:

| Session 1 | Session 2 | Session 3|
| --- | --- | --- |
| BEGIN;<br/>SELECT * FROM t1 WHERE id = 3 FOR UPDATE;<br/>-- Initiate a transaction, apply for a row lock, and an MDL lock| | |
| | ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL;<br/>-- Blocked by session 1 | |
| | | SELECT * FROM t1 WHERE id=5;<br/>-- Blocked by MDL, enters waiting|

At this time, if `SHOW PROCESSLIST` is executed, it can be seen that the statuses of sessions 2 & 3 are both waiting to acquire the MDL lock:

```sql
| 13365 | root     | localhost    | greatsql | Sleep     |      41 |                                    | NULL                                        |      41867 |         1 |             1 |
| 13366 | root     | localhost    | greatsql | Query     |      14 | Waiting for table metadata lock    | ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL |      13943 |         0 |             0 |
| 13368 | root     | localhost    | greatsql | Query     |       5 | Waiting for table metadata lock    | SELECT * FROM t1 WHERE id=5                 |       5701 |         0 |             0 |
```

Viewing `performance_schema.metadata_locks`, the current MDL lock status is like this:

```sql
greatsql> SELECT * FROM performance_schema.metadata_locks;
+---------------+---------------+------------------+-------------+-----------------------+---------------------+---------------+-------------+--------------------+-----------------+----------------+
| OBJECT_TYPE   | OBJECT_SCHEMA | OBJECT_NAME      | COLUMN_NAME | OBJECT_INSTANCE_BEGIN | LOCK_TYPE           | LOCK_DURATION | LOCK_STATUS | SOURCE             | OWNER_THREAD_ID | OWNER_EVENT_ID |
+---------------+---------------+------------------+-------------+-----------------------+---------------------+---------------+-------------+--------------------+-----------------+----------------+
| TABLE         | greatsql      | t1               | NULL        |       139835061536448 | SHARED_WRITE        | TRANSACTION   | GRANTED     | sql_parse.cc:6516  |           11648 |             46 |
| GLOBAL        | NULL          | NULL             | NULL        |       139836552110240 | INTENTION_EXCLUSIVE | STATEMENT     | GRANTED     | sql_base.cc:5588   |           11649 |             45 |
| BACKUP LOCK   | NULL          | NULL             | NULL        |       139835167443600 | INTENTION_EXCLUSIVE | TRANSACTION   | GRANTED     | sql_base.cc:5600   |           11649 |             45 |
| SCHEMA        | greatsql      | NULL             | NULL        |       139835167442560 | INTENTION_EXCLUSIVE | TRANSACTION   | GRANTED     | sql_base.cc:5575   |           11649 |             45 |
| TABLE         | greatsql      | t1               | NULL        |       139835167442400 | SHARED_UPGRADABLE   | TRANSACTION   | GRANTED     | sql_parse.cc:6516  |           11649 |             45 |
| BACKUP TABLES | NULL          | NULL             | NULL        |       139833831927776 | INTENTION_EXCLUSIVE | STATEMENT     | GRANTED     | lock.cc:1269       |           11649 |             45 |
| TABLESPACE    | NULL          | greatsql/t1      | NULL        |       139835167444000 | INTENTION_EXCLUSIVE | TRANSACTION   | GRANTED     | lock.cc:816        |           11649 |             45 |
| TABLE         | greatsql      | #sql-1cbfa7_3436 | NULL        |       139835167444960 | EXCLUSIVE           | STATEMENT     | GRANTED     | sql_table.cc:17750 |           11649 |             45 |
| TABLE         | greatsql      | t1               | NULL        |       139835167443280 | EXCLUSIVE           | TRANSACTION   | PENDING     | mdl.cc:3784        |           11649 |             45 |
| TABLE         | greatsql      | t1               | NULL        |       139835080065408 | SHARED_READ         | TRANSACTION   | PENDING     | sql_parse.cc:6516  |           11651 |             41 |
+---------------+---------------+------------------+-------------+-----------------------+---------------------+---------------+-------------+--------------------+-----------------+----------------+
```

This perspective is too poorly readable. Change to viewing `sys.schema_table_lock_waits`, which is clearer:
```sql
greatsql> SELECT * FROM sys.schema_table_lock_waits\G
*************************** 1. row ***************************
               object_schema: greatsql
                 object_name: t1
           waiting_thread_id: 11649
                 waiting_pid: 13366
             waiting_account: root@localhost
           waiting_lock_type: EXCLUSIVE
       waiting_lock_duration: TRANSACTION
               waiting_query: ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL
          waiting_query_secs: 39
 waiting_query_rows_affected: 0
 waiting_query_rows_examined: 0
          blocking_thread_id: 11648
                blocking_pid: 13365
            blocking_account: root@localhost
          blocking_lock_type: SHARED_WRITE
      blocking_lock_duration: TRANSACTION
     sql_kill_blocking_query: KILL QUERY 13365
sql_kill_blocking_connection: KILL 13365
*************************** 2. row ***************************
               object_schema: greatsql
                 object_name: t1
           waiting_thread_id: 11651
                 waiting_pid: 13368
             waiting_account: root@localhost
           waiting_lock_type: SHARED_READ
       waiting_lock_duration: TRANSACTION
               waiting_query: SELECT * FROM t1 WHERE id=5
          waiting_query_secs: 36
 waiting_query_rows_affected: 0
 waiting_query_rows_examined: 0
          blocking_thread_id: 11648
                blocking_pid: 13365
            blocking_account: root@localhost
          blocking_lock_type: SHARED_WRITE
      blocking_lock_duration: TRANSACTION
     sql_kill_blocking_query: KILL QUERY 13365
sql_kill_blocking_connection: KILL 13365
*************************** 3. row ***************************
               object_schema: greatsql
                 object_name: t1
           waiting_thread_id: 11649
                 waiting_pid: 13366
             waiting_account: root@localhost
           waiting_lock_type: EXCLUSIVE
       waiting_lock_duration: TRANSACTION
               waiting_query: ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL
          waiting_query_secs: 39
 waiting_query_rows_affected: 0
 waiting_query_rows_examined: 0
          blocking_thread_id: 11649
                blocking_pid: 13366
            blocking_account: root@localhost
          blocking_lock_type: SHARED_UPGRADABLE
      blocking_lock_duration: TRANSACTION
     sql_kill_blocking_query: KILL QUERY 13366
sql_kill_blocking_connection: KILL 13366
*************************** 4. row ***************************
               object_schema: greatsql
                 object_name: t1
           waiting_thread_id: 11651
                 waiting_pid: 13368
             waiting_account: root@localhost
           waiting_lock_type: SHARED_READ
       waiting_lock_duration: TRANSACTION
               waiting_query: SELECT * FROM t1 WHERE id=5
          waiting_query_secs: 36
 waiting_query_rows_affected: 0
 waiting_query_rows_examined: 0
          blocking_thread_id: 11649
                blocking_pid: 13366
            blocking_account: root@localhost
          blocking_lock_type: SHARED_UPGRADABLE
      blocking_lock_duration: TRANSACTION
     sql_kill_blocking_query: KILL QUERY 13366
sql_kill_blocking_connection: KILL 13366
```
In the above output result, methods to resolve the MDL lock wait are even provided, by KILLing the connection holding the MDL lock or the executing SQL to release the MDL lock. However, this is a relatively crude approach. It is best to find the transaction holding the MDL lock and proactively initiate COMMIT/ROLLBACK to end this transaction, or execute `UNLOCK TABLES`, which releases the corresponding MDL locks.

## MDL Lock Wait Optimization Suggestions

The MDL lock wait timeout threshold is defined by the option `lock_wait_timeout`, with a default value of **31536000** seconds (i.e., one year). This value is too large, and it is recommended to lower it. The suggested reference value in the [GreatSQL my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-25) is **3600**.

In addition, MDL locks and MDL lock wait status should be regularly monitored. Once an MDL lock wait exceeding the set threshold duration is found, an alert should be issued immediately to notify the DBA to check and handle it promptly.

The following are several operations prone to causing large-scale MDL lock waits. Try to perform them during business off-peak periods:
- Backing up the instance, or backing up a single table.
- Table DDL operations.
- Transactions that have not ended for a long time.
- Some earlier versions may have bugs, causing MDL lock waits even when `SHOW TABLE STATUS` is frequently executed. 
- Some graphical database management tools may also proactively request MDL locks when the mouse clicks on a data object.

**Reference materials**
- [Metadata Locking](https://dev.mysql.com/doc/refman/8.0/en/metadata-locking.html)
- [The metadata_locks Table](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-metadata-locks-table.html)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
