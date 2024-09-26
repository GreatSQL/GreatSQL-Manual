# 事务隔离级别
---

本节介绍事务隔离级别、事务隔离级别设置、事务隔离级别选择等相关内容。

## 简介

数据库事务隔离级别用于描述事务并发执行时互相干扰的程度。

在数据库事务并发执行过程中，如果没有合适的隔离级别控制，则可能存在以下几个问题：
- 脏读（Dirty Read）：指一个事务读取了另一个事务未提交的数据；这时如果另一个事务回滚了，则读取到的数据就是无效的。
- 不可重复读（Non-Repeatable Read）：指在同一个事务中，由于其他事务的更新操作，导致多次读取同一数据得到的结果不一致。
- 幻读（Phantom Read）：指在同一个事务中，由于其他事务的插入或删除操作，导致多次查询同一数据集得到的结果集不一致。

这些并发问题的出现是因为事务隔离级别不同，或者事务没有正确地使用锁或行级锁等机制来控制并发。

GreatSQL 支持四种隔离级别，隔离级别越高，事务间的相互影响越小，允许出现的问题情况越少。分为以下四个级别：

1. 读未提交（Read Uncommitted），简称RU

2. 读已提交（Read Committed），简称RC

3. 可重复读（Repeatable Read），简称RR

4. 可串行化（Serializable），简称SR

GreatSQL 默认的事务隔离级别是可重复读（Repeatable Read）。可以通过设置事务隔离级别来控制事务的并发行为和数据一致性，从而满足不同业务场景的需求。需要注意的是，隔离级别越高，事务的并发性越低，性能开销也会增加。因此，在选择隔离级别时需要根据具体业务需求和性能要求进行权衡。

## 读未提交（Read Uncommitted）

读未提交（Read Uncommitted），这是最低的隔离级别，允许一个事务读取另一个事务未提交的数据。可能会导致脏读、不可重复读和幻读问题。

如下例所示：

```sql
---------------------------------------------------------------------------------------------------------------------------------------
                       trx1                                         │                      trx2
---------------------------------------------------------------------------------------------------------------------------------------
/* 修改隔离级别 */
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
                                                                    │/* trx1修改后还未提交，在trx2中能立刻被读取到（脏读） */
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
                                                                    │/* trx1删除ID=2且未提交，在trx2中读不到（幻读） */
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
                                                                    │/* trx1回滚，在trx2再次读取到最老版本的数据 */
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

## 读已提交（Read Committed）

读已提交（Read Committed）：保证一个事务只能读取到另一个事务已提交的数据。可以避免脏读，但仍可能出现不可重复读和幻读问题。

```sql
---------------------------------------------------------------------------------------------------------------------------------------
                       trx1                                         │                      trx2
---------------------------------------------------------------------------------------------------------------------------------------
/* 修改隔离级别 */
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;   │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
                                                                    │
greatsql> BEGIN;                                                    │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.01 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 2;                         │greatsql> SELECT * FROM city WHERE ID <= 2;
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
| ID | Name     | CountryCode | District | Population |             │| ID | Name     | CountryCode | District | Population |
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
|  1 | Kabul    | AFG         | Kabol    |    1780000 |             │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  2 | Qandahar | AFG         | Qandahar |     237500 |             │|  2 | Qandahar | AFG         | Qandahar |     237500 |
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
2 rows in set (0.00 sec)                                            │2 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> UPDATE city SET Population=337500 WHERE ID = 2;           │
Rows matched: 1  Changed: 1  Warnings: 0                            │
                                                                    │
greatsql> SELECT * FROM city WHERE ID <= 2;                         │
+----+----------+-------------+----------+------------+             │
| ID | Name     | CountryCode | District | Population |             │
+----+----------+-------------+----------+------------+             │
|  1 | Kabul    | AFG         | Kabol    |    1780000 |             │
|  2 | Qandahar | AFG         | Qandahar |     337500 |             │
+----+----------+-------------+----------+------------+             │
2 rows in set (0.00 sec)                                            │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx2无法读取到trx1中更新后但还未提交的修改 */
                                                                    │greatsql> SELECT * FROM city WHERE ID <= 2;
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │| ID | Name     | CountryCode | District | Population |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                    │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │2 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> DELETE FROM city WHERE ID = 1;                            │
Query OK, 1 row affected (0.00 sec)                                 │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx2再次发起读请求，还是无法读取到更新及删除后的变化 */
                                                                    │/* 因为此时trx1还未提交 */
                                                                    │greatsql> SELECT * FROM city WHERE ID <= 2;
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │| ID | Name     | CountryCode | District | Population |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
                                                                    │|  2 | Qandahar | AFG         | Qandahar |     237500 |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │2 rows in set (0.00 sec)
---------------------------------------------------------------------------------------------------------------------------------------
greatsql> COMMIT;                                                   │
Query OK, 0 rows affected (0.06 sec)                                │
---------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx1提交后，可以读取到更新后的数据 */
                                                                    │/* 且 ID=1 的记录也无法读取到（幻读）*/
                                                                    │greatsql> SELECT * FROM city WHERE ID <= 2;
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │| ID | Name     | CountryCode | District | Population |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │|  2 | Qandahar | AFG         | Qandahar |     337500 |
                                                                    │+----+----------+-------------+----------+------------+
                                                                    │1 row in set (0.00 sec)
```

## 可重复读（Repeatable Read）

可重复读（Repeatable Read）：保证一个事务在执行过程中多次读取同一数据集时，其所读取的数据集是一致的，即不会发生不可重复读问题。在 GreatSQL 8.0及以上版本中，不会出现幻读问题；在 GreatSQL 8.0版本以前，则可能存在幻读问题。

```sql
---------------------------------------------------------------------------------------------------------------------------------------
                       trx1                                         │                       trx2
---------------------------------------------------------------------------------------------------------------------------------------
/* 修改隔离级别 */
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;  │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
                                                                    │
greatsql> BEGIN;                                                    │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 3;                         │greatsql> SELECT * FROM city WHERE ID <= 3;
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
| ID | Name     | CountryCode | District | Population |             │| ID | Name     | CountryCode | District | Population |
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
|  1 | Kabul    | AFG         | Kabol    |    1780000 |             │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  2 | Qandahar | AFG         | Qandahar |     237500 |             │|  2 | Qandahar | AFG         | Qandahar |     237500 |
|  3 | Herat    | AFG         | Herat    |     186800 |             │|  3 | Herat    | AFG         | Herat    |     186800 |
+----+----------+-------------+----------+------------+             │+----+----------+-------------+----------+------------+
3 rows in set (0.00 sec)                                            │3 rows in set (0.00 sec)
                                                                    │
greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;         │
Query OK, 1 row affected (0.00 sec)                                 │
Rows matched: 1  Changed: 1  Warnings: 0                            │
                                                                    │
greatsql> DELETE FROM city WHERE ID = 2;                            │
Query OK, 1 row affected (0.00 sec)                                 │
                                                                    │
greatsql> SELECT * FROM city WHERE ID <= 3;                         │
+----+-------+-------------+----------+------------+                │
| ID | Name  | CountryCode | District | Population |                │
+----+-------+-------------+----------+------------+                │
|  1 | Kabul | AFG         | Kabol    |    1780000 |                │
|  3 | Herat | AFG         | Herat    |     206800 |                │
+----+-------+-------------+----------+------------+                │
2 rows in set (0.00 sec)                                            │
----------------------------------------------------------------------------------------------------------------------------------------
greatsql> COMMIT;                                                   │/* trx1更新&删除后，尚未提交，trx2无法读取到新数据 */
Query OK, 0 rows affected (0.08 sec)                                │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                    │+----+----------+-------------+----------+------------+
greatsql> SELECT * FROM city WHERE ID <= 3;                         │| ID | Name     | CountryCode | District | Population |
+----+-------+-------------+----------+------------+                │+----+----------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |                │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+                │|  2 | Qandahar | AFG         | Qandahar |     237500 |
|  1 | Kabul | AFG         | Kabol    |    1780000 |                │|  3 | Herat    | AFG         | Herat    |     186800 |
|  3 | Herat | AFG         | Herat    |     206800 |                │+----+----------+-------------+----------+------------+
+----+-------+-------------+----------+------------+                │3 rows in set (0.00 sec)
2 rows in set (0.00 sec)                                            │
----------------------------------------------------------------------------------------------------------------------------------------
                                                                    │/* trx1提交后，trx2还未提交，仍然无法读取到新数据 */
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
                                                                    │/* trx2提交后，才能在新事务中读取到新数据 */
                                                                    │greatsql> SELECT * FROM city WHERE ID <= 3;
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │| ID | Name  | CountryCode | District | Population |
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │|  1 | Kabul | AFG         | Kabol    |    1780000 |
                                                                    │|  3 | Herat | AFG         | Herat    |     206800 |
                                                                    │+----+-------+-------------+----------+------------+
                                                                    │2 rows in set (0.00 sec)
```

在GreatSQL 5.7版本中，当设置 `innodb_locks_unsafe_for_binlog=1` 时（默认值为0），在可重复读隔离级别中，可能会存在幻读问题，可以自行测试。

## 可串行化（Serializable）

可串行化（Serializable）：最高的隔离级别，完全隔离各个事务，保证每次事务执行时都能看到相同的数据视图，避免脏读、不可重复读和幻读问题，但性能开销较大。在可串行化隔离级别下，InnoDB存储引擎几乎发挥不出来其行锁及事务并行优势，接近于MyISAM存储引擎的性能表现。

```sql
------------------------------------------------------------------------------------------------------------------------------------
                       trx1                                         │                       trx2
------------------------------------------------------------------------------------------------------------------------------------
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;     │greatsql> SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
                                                                    │
greatsql> BEGIN;                                                    │greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)                                │Query OK, 0 rows affected (0.00 sec)
------------------------------------------------------------------------------------------------------------------------------------
greatsql> SELECT * FROM city WHERE ID <= 3;                         │/* 都是只读请求时不会互斥等待 */
+----+----------+-------------+----------+------------+             │greatsql> SELECT * FROM city WHERE ID <= 3;
| ID | Name     | CountryCode | District | Population |             │+----+----------+-------------+----------+------------+
+----+----------+-------------+----------+------------+             │| ID | Name     | CountryCode | District | Population |
|  1 | Kabul    | AFG         | Kabol    |    1780000 |             │+----+----------+-------------+----------+------------+
|  2 | Qandahar | AFG         | Qandahar |     237500 |             │|  1 | Kabul    | AFG         | Kabol    |    1780000 |
|  3 | Herat    | AFG         | Herat    |     186800 |             │|  2 | Qandahar | AFG         | Qandahar |     237500 |
+----+----------+-------------+----------+------------+             │|  3 | Herat    | AFG         | Herat    |     186800 |
3 rows in set (0.00 sec)                                            │+----+----------+-------------+----------+------------+
                                                                    │3 rows in set (0.00 sec)
------------------------------------------------------------------------------------------------------------------------------------
                                                                    │greatsql> ROLLBACK;
                                                                    │Query OK, 0 rows affected (0.00 sec)
                                                                    │/* trx2回滚前，trx1的UPDATE一直被阻塞 */
greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;         │
Query OK, 0 rows affected (17.66 sec)                               │
Rows matched: 1  Changed: 0  Warnings: 0                            │
------------------------------------------------------------------------------------------------------------------------------------
greatsql> ROLLBACK;                                                 │/* trx1、trx2重新开始事务 */
Query OK, 0 rows affected (0.00 sec)                                │greatsql> BEGIN;
                                                                    │Query OK, 0 rows affected (0.00 sec)
greatsql> BEGIN;                                                    │
Query OK, 0 rows affected (0.00 sec)                                │
                                                                    │
greatsql> UPDATE city SET Population = 206800 WHERE ID = 3;         │
Query OK, 0 rows affected (0.00 sec)                                │
Rows matched: 1  Changed: 0  Warnings: 0                            │
                                                                    │
greatsql> ROLLBACK;                                                 │
                                                                    │---------------------------------------------------------------
                                                                    │/* trx1先执行UPDATE，在其执行ROLLBACK前 */
                                                                    │/* trx2哪怕是只读也会被阻塞 */
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

从上面的示例可见，在可串行化隔离级别下，除了只读请求，其余请求均无法实现并发。因此在真实业务场景中，几乎不会选择使用这个隔离级别。

## 隔离级别设置方法

可以在 `my.cnf` 配置文件中的 `[mysqld]` 区间设定全局隔离级别，例如：
```ini
[mysqld]
transaction_isolation = REPEATABLE-READ
```

也可以在运行时利用SQL命令在线动态修改，例如：
```sql
SET [GLOBAL | SESSION] TRANSACTION ISOLATION LEVEL REPEATABLE READ; 
```

在采用SQL命令修改隔离级别时，既可以修改全局（GLOBAL）隔离级别，也可以只修改当前会话（SESSION）隔离级别，甚至还支持只影响下一个事务的隔离级别设置。

```sql
-- 修改全局设定
greatsql> SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ; 

-- 修改会话级设定
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ; 

-- 查看全局/会话级设定
greatsql> SELECT @@GLOBAL.TRANSACTION_ISOLATION, @@SESSION.TRANSACTION_ISOLATION;
+--------------------------------+---------------------------------+
| @@GLOBAL.TRANSACTION_ISOLATION | @@SESSION.TRANSACTION_ISOLATION |
+--------------------------------+---------------------------------+
| REPEATABLE-READ                | READ-COMMITTED                  |
+--------------------------------+---------------------------------+

-- 重新建立连接后继续测试
greatsql> \r
Connection id:    1988641
Current database: *** NONE ***

-- 只修改下一个事务，不影响全局/会话
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

/* 开始一个新事务 */
greatsql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT * FROM city WHERE ID = 1;
+----+-------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |
+----+-------+-------------+----------+------------+
|  1 | Kabul | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+
1 row in set (0.01 sec)

/* 查看当前事务状态，确认其隔离级别为RC */
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

/* 提交当前事务，再次开启新事务，确认新事务的隔离级别已经恢复成RR */
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

## 隔离级别选择

选择事务隔离级别是一个需要根据具体情况和应用需求来决定的问题，RC（Read Committed）和RR（Repeatable Read）是两种常用的事务隔离级别，各有其优缺点。

1. **RC**：
   - 优点：每次读取的数据都是最新的，不会出现脏读现象，因此可以保证数据的一致性。
   - 缺点：可能会出现幻读问题，即在同一事务中，两次查询可能返回不同的数据行。
2. **RR**（默认级别）：
   - 优点：可以保证在一个事务中的可重复读一致性，避免幻读问题。
   - 缺点：可能会导致更多的锁竞争和死锁问题，对系统性能有一定影响。

选择建议：

- 如果应用对数据一致性要求较高，而对并发性要求不是特别高，可以选择RR隔离级别。

- 如果应用对并发性要求较高，而对数据一致性要求可以相对放松，可以选择RC隔离级别。

需要注意的是，隔离级别的选择也要考虑到系统的整体架构、并发访问量、事务类型等因素，建议在实际应用中进行测试和评估，选择最适合的隔离级别。在大多数场景下，选择 RC 隔离级别就基本能满足业务需求。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
