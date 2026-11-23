# Row Lock and Row Lock Wait Analysis
---

This article introduces how to view row locks in the GreatSQL database, and how to troubleshoot and analyze when row lock waits occur.

## About Row Locks
Row locks, also called row-level locks, are referred to as row lock.

In the MySQL/GreatSQL database, InnoDB engine tables support row locks, relying on them to implement transaction isolation. Row locking is a concurrency control mechanism that allows multiple users to access different data rows in a table at the same time without causing data inconsistency or conflicts.

InnoDB row locks are index-based. When locking, it scans and checks and locks row by row. When the column of the locking condition has no index, row locks are added to all data in the table.

Modifications between different columns of the same row of data cause mutual exclusion on the same lock. Modifications on different rows of data are two different locks, which may (or may not) produce mutual exclusion.

Usually, a mutex lock is only needed when modifying data. For read-only access, no lock is needed by default, unless explicitly specified, for example: `SELECT ... FROM t WHERE id=? FOR SHARE` or `SELECT ... FROM t WHERE id=? FOR UPDATE`.

InnoDB row lock locking methods include the following:

- Shared lock: multiple transactions can hold shared locks at the same time, allowing concurrent reads of the same data rows. The shared lock does not prevent other transactions from acquiring shared locks, but prevents other transactions from acquiring exclusive locks. For example: `SELECT ... FROM t WHERE id=? FOR SHARE`.

- Exclusive lock: only one transaction can hold an exclusive lock at a time, used to modify or insert data. The exclusive lock prevents other transactions from acquiring shared locks or exclusive locks, ensuring data exclusivity. For example: `SELECT ... FROM t WHERE id=? FOR UPDATE` or `UPDATE t SET c1=? where id=?`.

In addition, InnoDB has a special locking method called intention locks, divided into two types:
- Intention shared lock (IS): when reading data in a table, an IS lock is also added to the table.
- Intention exclusive lock (IX): when modifying data in a table, an IX lock is also added to the table.

The above two intention locks are usually table-level locks, not row locks.

The mutual exclusion table of the above several different locking methods is as follows:

| \  | IS | IX | S | X |
|--- | ---| ---|---|---| 
| IS |  + |  + | + | - |
| IX |  + |  + | - | - |
| S  |  + |  - | + | - |
| X  |  - |  - | - | - |

The "+" in the table means compatible, and "-" means incompatible.

Summarized in words into the following rules:
1. Intention locks are mutually compatible, because the purpose of adding IX and IS locks is to apply for the X and S locks on the data rows.
1. The table-level S lock is incompatible with X and IX locks, because after adding the S lock at the table level, other transactions are not allowed to add X locks, which is equivalent to adding "read-only protection".
1. The table-level X lock is incompatible with IS, IX, S, and X, because after adding the X lock at the table level, the table structure or table data may be modified. At this time, "write-only protection" should be added to prevent other transactions from modifying the table structure or table data.
1. After adding a row-level X lock, it will not be blocked by other read/write transactions, because InnoDB supports multiple row-level X locks coexisting, as long as locks are not added on the same data row (i.e., supporting modifying multiple rows of data at the same time).


InnoDB row locks have several different locking granularities (ranges):

- Record lock
	- The record lock is a lock at the row level, used to protect a single data row, not including the gap between two rows.
	- If transaction Trx1 holds a shared lock (S) on row R1, other transactions Trx2 can also hold a shared lock (S) at the same time, but cannot hold an exclusive lock (X).
	- If transaction Trx1 holds an exclusive lock (X) on row R1, other transactions Trx2 cannot hold any type of lock at the same time.
	- Primary key indexes and unique indexes add record locks by default.
- Gap lock
	- The gap lock is used to lock the range between records, rather than a single row. It is used to ensure that insert operations within a range do not break the uniqueness constraint.
	- When transaction Trx1 holds a gap lock, other transactions Trx2 cannot insert new rows within the same gap, but can insert new rows in other gaps.
	- The gap lock can prevent the phantom read problem, i.e., new rows are inserted between two queries of a transaction.
- Intention insert lock
	- Is a special type of gap lock, used to control insert operations into a gap in a data table.
	- Specially used to coordinate concurrent insertion of new records by multiple transactions, ensuring data integrity and consistency.
- Next-key lock
	- Is a locking method unique to the InnoDB engine, combining the record lock and the gap lock.
	- When transaction Trx1 operates on a range of data rows, it locks **the records that satisfy the conditions** and **the gaps between these records**.
	- It is used to ensure the uniqueness constraint while preventing phantom reads.
	- Secondary indexes add next-key locks by default.

These different row lock methods allow the InnoDB engine to maintain data consistency and integrity when multiple transactions access the database at the same time, while providing flexibility to meet different concurrency needs.

## Viewing Row Lock Status
The row lock status can be observed by executing `SHOW ENGINE INNODB STATUS\G` or viewing `performance_schema.data_locks`.

The option `innodb_status_output_locks` is used to set whether row lock information is displayed when executing `SHOW ENGINE INNODB STATUS`. It is disabled by default, and it is recommended to enable it.

Use the standard test table created with sysbench for observation. First use two different views to look at the organization order of table data:
```sql
greatsql> SELECT id, k           greatsql> SELECT k, id
  FROM t1 ORDER BY id;            FROM t1 ORDER BY k;
+----+--------+                  +--------+----+
| id | k      |                  | k      | id |
+----+--------+                  +--------+----+
|  1 | 138562 |                  | 116311 |  3 |
|  2 | 506525 |                  | 138562 |  1 |
|  3 | 116311 |                  | 169091 |  6 |
|  4 | 953626 |                  | 211310 |  5 |
|  5 | 211310 |                  | 347368 | 10 |
|  6 | 169091 |                  | 506525 |  2 |
|  7 | 680431 |                  | 680431 |  7 |
|  8 | 995844 |                  | 901640 |  9 |
|  9 | 901640 |                  | 953626 |  4 |
| 10 | 347368 |                  | 995844 |  8 |
+----+--------+                  +--------+----+
```
That is, read data according to the organization order of the primary key index and the secondary index respectively, which helps understand the locking examples below.

Start a transaction and lock one row of data:
```sql
greatsql> BEGIN; SELECT * FROM t1 WHERE k = 211310 FOR UPDATE;
...
*************************** 1. row ***************************
 id: 5
  k: 211310
  c: 79230092690-18015886351-20814229767-74051492749-92766406337-56361550942-61071912119-36644661046-06519823634-83902323394
pad: 75239007095-21240899951-18845450077-03788416707-63186498182
```

Observe the row lock information in another session:
```sql
greatsql> SHOW ENGINE INNODB STATUS\G
...
# Transaction ID, transaction active duration
---TRANSACTION 5315754169, ACTIVE 4 sec

# 4 lock structs, of which 3 are row locks, occupying memory
4 lock struct(s), heap size 1128, 3 row lock(s)

# Connection ID, OS layer thread information, query ID
MySQL thread id 13312, OS thread handle 139836433352448, query id 36923051665 localhost root

# Table-level IX lock
TABLE LOCK table `greatsql`.`t1` trx id 5315754169 lock mode IX

# Lock on secondary index idx_k: next-key lock | X, tablespace_id=685, pageno=5, heapno=5 (this is the record with k = 211310)
# Two columns are locked, because idx_k is a secondary index, and the index tree contains the primary key index column id
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754169 lock_mode X
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
# In hexadecimal, converted to decimal it is 211310, i.e., k=211310
 0: len 4; hex 8003396e; asc   9n;;
# In hexadecimal, converted to decimal it is 5, i.e., id=5
 1: len 4; hex 80000005; asc     ;;

# Lock on primary key index PRIMARY: record lock | X, tablespace_id=685, pageno=4, heapno=6 (this is the record with id = 5)
# The primary key index contains all columns
RECORD LOCKS space id 685 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754169 lock_mode X locks rec but not gap
Record lock, heap no 6 PHYSICAL RECORD: n_fields 6; compact format; info bits 0
 0: len 4; hex 80000005; asc     ;;
 1: len 6; hex 00003df5e425; asc   =  %;;
 2: len 7; hex 01000016982efd; asc      . ;;
 3: len 4; hex 8003396e; asc   9n;;
 4: len 30; hex 37393233303039323639302d31383031353838363335312d323038313432; asc 79230092690-18015886351-208142; (total 120 bytes);
 5: len 30; hex 37353233393030373039352d32313234303839393935312d313838343534; asc 75239007095-21240899951-188454; (total 60 bytes);

# Lock on secondary index idx_k: gap lock | X (add a gap lock in front of k=347368,id=10, because k=347368 is the next record after k=211310)
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754169 lock_mode X locks gap before rec
Record lock, heap no 6 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 80054ce8; asc   L ;;
 1: len 4; hex 8000000a; asc     ;;
```
From this perspective, the row lock information is basically explained clearly.

Let's view it from another perspective:
```sql
greatsql> SELECT * FROM performance_schema.data_locks;
+--------+-----------------------------------------+-----------------------+-----------+----------+---------------+-------------+----------------+-------------------+------------+-----------------------+-----------+---------------+-------------+------------+
| ENGINE | ENGINE_LOCK_ID                          | ENGINE_TRANSACTION_ID | THREAD_ID | EVENT_ID | OBJECT_SCHEMA | OBJECT_NAME | PARTITION_NAME | SUBPARTITION_NAME | INDEX_NAME | OBJECT_INSTANCE_BEGIN | LOCK_TYPE | LOCK_MODE     | LOCK_STATUS | LOCK_DATA  |
+--------+-----------------------------------------+-----------------------+-----------+----------+---------------+-------------+----------------+-------------------+------------+-----------------------+-----------+---------------+-------------+------------+
| INNODB | 139846278460776:1881:139846301860896    |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | NULL       |       139846301860896 | TABLE     | IX            | GRANTED     | NULL       |
| INNODB | 139846278460776:685:5:5:139846301868064 |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | idx_k      |       139846301868064 | RECORD    | X             | GRANTED     | 211310, 5  |
| INNODB | 139846278460776:685:4:6:139846301868408 |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | PRIMARY    |       139846301868408 | RECORD    | X,REC_NOT_GAP | GRANTED     | 5          |
| INNODB | 139846278460776:685:5:6:139846301868752 |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | idx_k      |       139846301868752 | RECORD    | X,GAP         | GRANTED     | 347368, 10 |
+--------+-----------------------------------------+-----------------------+-----------+----------+---------------+-------------+----------------+-------------------+------------+-----------------------+-----------+---------------+-------------+------------+

-- After removing some less useful information
greatsql> SELECT ENGINE_LOCK_ID, ENGINE_TRANSACTION_ID, INDEX_NAME, LOCK_TYPE, LOCK_MODE, LOCK_STATUS, LOCK_DATA FROM performance_schema.data_locks;
+-----------------------------------------+-----------------------+------------+-----------+---------------+-------------+------------+
| ENGINE_LOCK_ID                          | ENGINE_TRANSACTION_ID | INDEX_NAME | LOCK_TYPE | LOCK_MODE     | LOCK_STATUS | LOCK_DATA  |
+-----------------------------------------+-----------------------+------------+-----------+---------------+-------------+------------+
| 139846278460776:1881:139846301860896    |            5315754171 | NULL       | TABLE     | IX            | GRANTED     | NULL       |
| 139846278460776:685:5:5:139846301868064 |            5315754171 | idx_k      | RECORD    | X             | GRANTED     | 211310, 5  |
| 139846278460776:685:4:6:139846301868408 |            5315754171 | PRIMARY    | RECORD    | X,REC_NOT_GAP | GRANTED     | 5          |
| 139846278460776:685:5:6:139846301868752 |            5315754171 | idx_k      | RECORD    | X,GAP         | GRANTED     | 347368, 10 |
+-----------------------------------------+-----------------------+------------+-----------+---------------+-------------+------------+
```
In the above table, several pieces of information are interpreted as follows:
- ENGINE_LOCK_ID, the lock ID. The lock ID format is internal and may change at any time. Information such as table_id, tablespace_id, pageno, and heapno can be observed.
- ENGINE_TRANSACTION_ID, the transaction ID, the ID of the transaction requesting the lock, i.e., the holder of this lock.
- INDEX_NAME, the index name.
- LOCK_TYPE, the lock type, table lock/row lock.
- LOCK_MODE, the lock mode, whether it is a table-level IS/IX lock or a row-level S/X lock, and whether the row-level lock includes GAP.
- LOCK_STATUS, the lock status, whether the lock has been acquired (GRANTED) or is blocked (WAITING).
- LOCK_DATA, the data corresponding to this lock

These two ways of viewing row locks can be chosen according to personal preference.

## Viewing and Analyzing Row Lock Waits

The row lock status can be observed by executing `SHOW ENGINE INNODB STATUS\G` or viewing `sys.innodb_lock_waits`.

Start two sessions and execute the following transactions respectively:

| Timeline | Transaction 1 | Transaction 2|
| --- | --- | --- |
| t1 | begin;<br/>select * from t1 where k = 211310 for update;| |
| t2 | |begin;<br/>begin; update t1 set pad=rand() where k=211310; |

Then the request of transaction 2 is blocked until the row lock wait times out and exits, reporting:
```log
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

While transaction 2 is waiting to acquire the row lock, the row lock wait situation can be observed.
```sql
greatsql> SHOW ENGINE INNODB STATUS\G
...

# Transaction 2, waiting to acquire the row lock, the blocked transaction
---TRANSACTION 5315754189, ACTIVE 5 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1128, 1 row lock(s)
MySQL thread id 13336, OS thread handle 139846262703872, query id 36923051957 localhost root updating
update t1 set pad=rand() where k=211310

# Waiting to acquire the next-key lock | X on idx_k (k=211310)
------- TRX HAS BEEN WAITING 5 SEC FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754189 lock_mode X waiting
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 8003396e; asc   9n;;
 1: len 4; hex 80000005; asc     ;;

------------------
TABLE LOCK table `greatsql`.`t1` trx id 5315754189 lock mode IX
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754189 lock_mode X waiting
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 8003396e; asc   9n;;
 1: len 4; hex 80000005; asc     ;;

# Transaction 1, the transaction currently holding the lock. The locks it holds refer to the analysis above
---TRANSACTION 5315754188, ACTIVE 24 sec
4 lock struct(s), heap size 1128, 3 row lock(s)
MySQL thread id 13333, OS thread handle 139836264539904, query id 36923051955 localhost root
TABLE LOCK table `greatsql`.`t1` trx id 5315754188 lock mode IX
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754188 lock_mode X
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 8003396e; asc   9n;;
 1: len 4; hex 80000005; asc     ;;

RECORD LOCKS space id 685 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754188 lock_mode X locks rec but not gap
Record lock, heap no 6 PHYSICAL RECORD: n_fields 6; compact format; info bits 0
 0: len 4; hex 80000005; asc     ;;
 1: len 6; hex 00003df5e425; asc   =  %;;
 2: len 7; hex 01000016982efd; asc      . ;;
 3: len 4; hex 8003396e; asc   9n;;
 4: len 30; hex 37393233303039323639302d31383031353838363335312d323038313432; asc 79230092690-18015886351-208142; (total 120 bytes);
 5: len 30; hex 37353233393030373039352d32313234303839393935312d313838343534; asc 75239007095-21240899951-188454; (total 60 bytes);

RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754188 lock_mode X locks gap before rec
Record lock, heap no 6 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 80054ce8; asc   L ;;
 1: len 4; hex 8000000a; asc     ;;
```

Or observe from another perspective:
```sql
greatsql> SELECT * FROM sys.innodb_lock_waits\G
*************************** 1. row ***************************
                wait_started: 2023-09-07 14:03:53
                    wait_age: 00:00:31					#<-- The row lock has been waiting for 31 seconds
               wait_age_secs: 31                #<-- The row lock has been waiting for 31 seconds
                locked_table: `greatsql`.`t1`
         locked_table_schema: greatsql
           locked_table_name: t1
      locked_table_partition: NULL
   locked_table_subpartition: NULL
                locked_index: idx_k             #<-- The locked index
                 locked_type: RECORD            #<-- Lock type, it is a next-key lock
              waiting_trx_id: 5315754189        #<-- The waiting (blocked) transaction ID
         waiting_trx_started: 2023-09-07 14:03:53
             waiting_trx_age: 00:00:31
     waiting_trx_rows_locked: 1                 #<-- The number of locked rows
   waiting_trx_rows_modified: 0                 #<-- Of the locked rows, how many rows have been modified
                 waiting_pid: 13336             #<-- The PROCESSLIST_ID corresponding to the waiting transaction
               waiting_query: update t1 set pad=rand() where k=211310    #<-- The blocked transaction SQL
             waiting_lock_id: 139846278460776:685:5:5:139846301868064
           waiting_lock_mode: X                 #<-- Waiting to acquire the exclusive lock
             blocking_trx_id: 5315754188        #<-- The transaction ID holding the lock
                blocking_pid: 13333             #<-- The PROCESSLIST_ID corresponding to the lock-holding transaction
              blocking_query: NULL              #<-- The currently active SQL of the lock-holding transaction. Because the SQL has finished executing (but the transaction has not yet committed), it is displayed as NULL
            blocking_lock_id: 139846278459928:685:5:5:139846301553696
          blocking_lock_mode: X                 #<-- Holding the exclusive lock
        blocking_trx_started: 2023-09-07 14:03:34
            blocking_trx_age: 00:00:50          #<-- Holding duration
    blocking_trx_rows_locked: 3                 #<-- How many rows of data are locked (in fact, this means there are 3 row locks, i.e., the Next-Key lock on the secondary index, the Record lock on the primary key index, and the Gap lock in front of the next record on the secondary index)
  blocking_trx_rows_modified: 0                 #<-- Of the locked data, how many rows have been modified
     sql_kill_blocking_query: KILL QUERY 13333  #<-- One unlocking method
sql_kill_blocking_connection: KILL 13333        #<-- The second unlocking method
```

In the above output result, even the unlocking methods are given, i.e., KILL the currently executing SQL or connection. However, this is a relatively crude approach. It is best to find the transaction holding the row lock and proactively initiate COMMIT/ROLLBACK to end this transaction, which releases the corresponding row locks.

Using the above methods, the current row locks and row lock waits in the InnoDB table can be clearly observed. At the same time, it is recommended to set corresponding monitoring and alerting rules for row lock waits, for example, alert when row lock waits exceed 10 seconds. For more on monitoring and alerting, refer to: [Monitoring & Alerting](../6-oper-guide/3-monitoring-and-alerting.md).

## Row Lock Wait Optimization Suggestions

To avoid a large number of long-duration row lock waits, it is recommended to appropriately lower the row lock wait duration threshold `innodb_lock_wait_timeout`. In the [GreatSQL my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-25), this threshold is set to 10 (seconds). It can be appropriately adjusted according to the actual situation, and it is usually recommended not to exceed 120 (seconds).

**Reference materials**
- [InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)
- [InnoDB Standard Monitor and Lock Monitor Output](https://dev.mysql.com/doc/refman/8.0/en/innodb-standard-monitor.html)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
