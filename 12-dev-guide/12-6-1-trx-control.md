# 事务控制
---

本节介绍事务控制语句、事务自动提交模式、XA 事务等相关内容。

在开始之前，先创建测试库表。
```sql
greatsql> CREATE DATABASE trx;
greatsql> USE trx;
greatsql> CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` int unsigned NOT NULL DEFAULT '0',
  `c2` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

## 开启事务

GreatSQL 数据库中支持采用以下几种方式开启事务

- 执行 `BEGIN` 命令
```sql
greatsql> BEGIN; /* 开启事务 */
greatsql> INSERT INTO t1 VALUES(1, 1, 'row1');
greatsql> COMMIT;
greatsql> SELECT * FROM t1;
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
+----+----+------+
```

- 执行 `START TRANSACTION` 命令

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

- 设置 `autocommit = 0`（关闭自动提交），之后执行 `INSERT`、`UPDATE`、`DELETE`、`SELECT ... FOR UPDATE` 等语句时，都会开启一个新事务

```sql
greatsql> SET autocommit = 0;
greatsql> INSERT INTO t1 VALUES(3, 3, 'row3');
greatsql> COMMIT;

greatsql> SET autocommit = 0;
greatsql> UPDATE t1 SET c2 = 'row11' WHERE id=1;
greatsql> COMMIT;

greatsql> SET autocommit = 0;
greatsql> DELETE FROM t1 WHERE id=2;
greatsql> COMMIT;

greatsql> SET autocommit = 0;
greatsql> SELECT * FROM t1 WHERE id=3 FOR UPDATE;
greatsql> UPDATE t1 SET c2 = 'row33' WHERE id=3;
greatsql> COMMIT;
```

执行完上述事务语句后，再次查询表数据，结果如下所示：
```sql
greatsql> SELECT * FROM t1;
+----+----+-------+
| id | c1 | c2    |
+----+----+-------+
|  1 |  1 | row11 |
|  3 |  3 | row33 |
+----+----+-------+
```

事务启动时，默认是只读模式，还不会分配正式的事务ID，直到数据修改发生时，才会自动切换成读写模式，并正式分配事务ID。

可以通过查询 `information_schema.INNODB_TRX` 查看事务状态。

```sql
                        会话1                          │                    会话2
----------------------------------------------------------------------------------------------------------------------
greatsql> BEGIN;                                       │greatsql> SELECT * FROM INNODB_TRX\G
Query OK, 0 rows affected (0.00 sec)                   │Empty set (0.00 sec)
                                                       │
greatsql> SELECT * FROM t1 WHERE id=1;                 │greatsql> SELECT * FROM INNODB_TRX\G
+----+----+-------+                                    │*************************** 1. row ***************************
| id | c1 | c2    |                                    │                    trx_id: 421166643830136
+----+----+-------+                                    │                 trx_state: RUNNING
|  1 |  1 | row11 |                                    │               trx_started: 2024-04-25 03:09:46
+----+----+-------+                                    │     trx_requested_lock_id: NULL
1 row in set (0.00 sec)                                │          trx_wait_started: NULL
                                                       │                trx_weight: 0
greatsql>                                              │       trx_mysql_thread_id: 52
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

可以看到，在上面例子中，一开始的事务ID是一个很大的数值，接下来修改表数据，再观察事务状态：

```sql
                        会话1                          │                    会话2
----------------------------------------------------------------------------------------------------------------------
                                                       │greatsql> SELECT * FROM INNODB_TRX\G
greatsql> UPDATE t1 SET c2='row111' WHERE id=1;        │*************************** 1. row ***************************
Query OK, 0 rows affected (0.00 sec)                   │                    trx_id: 2443
Rows matched: 1  Changed: 0  Warnings: 0               │                 trx_state: RUNNING
                                                       │               trx_started: 2024-04-25 03:10:00
greatsql>                                              │     trx_requested_lock_id: NULL
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
此时事务状态从 **只读（READ ONLY）** 转变成 **读写（READ WRITE）** 模式，也正式分配事务ID，`trx_id`列值从 421166643830136 变成了 2443，同时也能看到该事务占用的内存（`trx_lock_memory_bytes`）、持有的锁（`trx_tables_locked`、`trx_lock_structs`、`trx_rows_locked`）、修改了多少数据（`trx_rows_modified`）等详细信息。

在上面的例子中，注意到 `information_schema.INNODB_TRX` 中 `trx_is_read_only` 列的值前后两次查询都为0，这是因为它是一个允许从只读状态转化到读写状态的可转化的事务。有当执行 `START TRANSACTION READ ONLY` 显式开启一个只读事务时，这种事务不可转化为读写状态，此时 `trx_is_read_only` 值为 1。
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


## 提交事务

提交事务能让事务的修改持久化，清除事务保存点（`SAVEPOINT`），并释放事务持有的锁；提交后，事务中的修改才会对其他会话可见。

用于显式提交事务的语句是 `COMMIT`。
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
greatsql> COMMIT; /* 提交事务，使得数据修改持久化 */

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

其他几个隐式提交事务的方法有：

- 修改 `autocommit=1`，启用自动提交模式会隐式提交事务；

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

greatsql> SET autocommit=1; /* 修改启用自动提交模式 */

greatsql> EXIT
Bye
```

再次连接登入数据库，查询表，会发现刚才的 `DELETE` 请求成功了：

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

- 再次开启一个新事务，会把尚未结束的事务隐式提交；

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

greatsql> BEGIN; /* 再次开启新事务，会发起隐式提交 */

greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

- 发起 DDL、DCL 操作，因为 DDL、DCL 不支持事务，因此会要求把尚未结束的事务隐式提交。

## 回滚事务

回滚事务能让事务的修改撤销，清除事务保存点（`SAVEPOINT`），并释放事务持有的锁。

可以回滚当前整个未提交事务，也可以回滚到指定的事务保存点。

用于显式回滚事务的语句是 `ROLLBACK`。

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

greatsql> ROLLBACK;  /* 执行 `ROLLBACK` 后，前面的INSERT请求会被撤销回滚 */

greatsql> SELECT * FROM t1;
+----+----+--------+
| id | c1 | c2     |
+----+----+--------+
|  1 |  1 | row111 |
|  3 |  3 | row33  |
|  4 |  4 | row4   |
+----+----+--------+
```

其他几个隐式提交事务的方法有：

1. 连接主动退出 `greatsql> exit`;

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
greatsql> exit /* 主动退出连接，触发隐式回滚 */
Bye
```
主动退出当前连接后，会触发隐式回滚，再次连接登入数据库，查询表，会发现刚才的 `INSERT` 请求并没有被提交和持久化。

2. 连接一直不活跃，直到超时后被断开（超过 `wait_timeout` 设定的阈值）；

```sql
greatsql> SET SESSION wait_timeout = 10; /* 修改超时阈值为10秒 */
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

greatsql> DELETE FROM t1 WHERE id=2; /* 执行完DELETE后，该连接不再做任何操作，等待超过10秒 */

greatsql> SELECT * FROM t1; /* 等待超过10秒后，再次发起查询，会重新建立连接，并且发现刚才的DELETE操作被回滚了 */
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

## 保存点

保存点 `SAVEPOINT` 语句可以在事务过程中做标记，后续可以将事务回滚到这个保存点。

保存点是可选的，一个事务过程中可以标记多个保存点。

保存点有几种用法。

```sql
-- 1. 标记保存点
SAVEPOINT pt;

-- 2. 回滚到指定保存点，丢弃该保存点之后的所有修改操作
ROLLBACK TO pt;

-- 3. 释放保存点
-- 释放保存点的作用相当于删除该保存点及其之后的保存点标识（只是放弃这个保存点标识），但相应的修改操作仍保留
RELEASE SAVEPOINT pt;
```
其中，`pt` 表示保存点的标识名。

下面演示如何在一个事务中使用保存点。

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

greatsql> SAVEPOINT r4; /* 设置保存点r4 */
greatsql> INSERT INTO t1 VALUES(4,4,'row4');

greatsql> SAVEPOINT r5; /* 设置保存点r5 */
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

greatsql> ROLLBACK TO r5; /* 回滚到保存点r5，即放弃保存点r5之后的操作 */
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
greatsql> SELECT * FROM t1; /* 看到只有id=4这条记录插入成功，而id=5记录插入操作被回滚了 */
+----+----+------+
| id | c1 | c2   |
+----+----+------+
|  1 |  1 | row1 |
|  2 |  2 | row2 |
|  3 |  3 | row3 |
|  4 |  4 | row4 |
+----+----+------+
```

再看释放保存点的示例：

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

greatsql> SAVEPOINT r4; /* 设置保存点r4 */
greatsql> INSERT INTO t1 VALUES(4,4,'row4');

greatsql> SAVEPOINT r5; /* 设置保存点r5 */
greatsql> INSERT INTO t1 VALUES(5,5,'row5');

greatsql> SAVEPOINT r6; /* 设置保存点r6 */
greatsql> INSERT INTO t1 VALUES(6,6,'row6');

greatsql> RELEASE SAVEPOINT r5;  /* 释放保存点r5及其后面的其他保存点，即释放r5、r6两个保存点 */

/* 因此无法回滚到r5、r6任意一个保存点 */
greatsql> ROLLBACK TO r6;
ERROR 1305 (42000): SAVEPOINT r6 does not exist
greatsql> ROLLBACK TO r5;
ERROR 1305 (42000): SAVEPOINT r5 does not exist

greatsql> SAVEPOINT r7; /* 再次设置新保存点r7 */
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

greatsql> ROLLBACK TO r7; /* 回滚到保存点r7，即放弃插入id=7数据 */
greatsql> COMMIT;

greatsql> SELECT * FROM t1; /* 可以看到id=(4,5,6)三条记录插入成功，id=7记录回滚 */
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

## 事务自动提交

`autocommit` 是一个会话级别变量，决定是否启用自动提交事务模式。

当 `autocommit=1` 时，即自动提交模式，每个 SQL 语句都会自动成为一个事务并立即提交。

而当 `autocommit=0` 时，需要显式使用 `COMMIT` 命令提交事务。

**建议启用自动提交模式（`autocommit=1`）的情况**
1. **简单事务时**：对于简单的事务操作，比如执行单个 SQL 语句或不需要手动控制事务的情况，启用自动提交可以减少冗余的代码。
2. **无需事务控制时**：如果应用程序的业务逻辑不需要事务控制，即每个 SQL 语句都是独立的操作且不需要回滚，可以使用自动提交模式。
3. **降低交互开销时**：在对性能要求较高的情况下，自动提交可以减少事务开销，提升执行效率。

**建议禁用自动提交模式（`autocommit=0`）的情况**
1. **复杂事务时**：对于需要多个 SQL 语句组成的复杂事务操作，就不能自动提交以确保事务的完整性和一致性。
2. **可能需要事务回滚时**：如果应用程序中可能需要回滚时，即在操作失败时能够回滚到事务开始前的状态，例如需要手动更新数据时，就要关闭自动提交，以便在更新发生错误时还能回滚操作。
3. **数据一致性要求**：在对数据一致性要求较高的场景，建议手动控制事务，确保操作的原子性和一致性。

综合考虑应用程序的业务需求、性能要求和数据一致性要求，选择是否启用 `autocommit=1` 事务自动提交模式。

通常情况下，在单个 SQL 操作或不需要事务控制的情况下，可以启用自动提交模式以提升性能；而对于复杂事务操作或需要保证数据一致性的情况，最好不启用自动提交模式。

## XA 事务

### XA 事务概述
InnoDB 存储引擎支持 XA 事务。XA 事务实现基于 X/Open CAE 文档分布式事务处理：XA 规范。本文档由 The Open Group 发布，可从 [http://www.opengroup.org/public/pubs/catalog/c193.htm](http://www.opengroup.org/public/pubs/catalog/c193.htm) 获得。

XA 事务是一种分布式事务处理协议，允许在多个资源管理器上执行全局事务。

所谓全局事务，是指事务允许跨越多个数据库实例执行，每个实例都是事务的参与者。

开始之前，先理解几个基本概念
- **参与者**：执行事务操作的数据库实例，每个参与者必须支持 XA 事务协议。
- **协调者**：负责协调全局事务的提交和回滚，以及处理参与者的准备请求和提交请求。

为了保证事务一致性，MySQL 实现了经典的 XA 标准，通过 XA 事务来保证事务的特征。Binlog 作为 MySQL 生态的一个重要组件，它记录了数据库操作的逻辑更新，可以利用 Binlog 构建各种 MySQL 高可用架构。Binlog 还有一个重要角色就是作为 XA 事务的协调者，协调各个参与者（存储引擎）来实现 XA 事务的一致性。

执行全局事务的过程使用两阶段提交 (2PC)
1. **在第一阶段**：所有参与者都准备好了。
2. **在第二阶段**：协调者通知参与者，事务要提交还是回滚。如果所有参与者在准备好时都表示可以提交，则它们都会被告知提交事务。如果任何参与者在准备时表示它无法提交事务，则所有参与者都会被告知回滚事务。

MySQL XA 事务支持包括内部 XA 事务和外部 XA 事务。

内部 XA 事务主要指本实例内部的事务，事务中如果跨多个存储引擎进行读写，那么就会产生内部 XA 事务。在内部 XA 事务中，每个事务都需要写 Binlog，并且要保证 Binlog 与引擎修改的一致性，因此 Binlog 是一个特殊的参与者。所以在打开 Binlog 的情况下，即使事务修改只涉及一个引擎，内部也会启动 XA 事务。

外部 XA 事务与内部 XA 事务核心逻辑类似，由几个 XA 事务操作命令组成，包括 `XA START`、`XA END`、`XA PREPRE`、`XA COMMIT`、`XA ROLLBACK`、`XA RECOVER` 等，可以支持跨多个节点的XA事务。外部 XA 事务的协调者是用户的应用，参与者是 MySQL 实例，因此需要应用持久化协调信息，解决事务一致性问题。

**XA 事务使用方法**
1. **准备阶段**：协调者向所有参与者发送准备请求 `XA PREPARE`，要求参与者准备提交事务。
2. **提交阶段**：如果所有参与者都成功准备，协调者向所有参与者发送提交请求 `XA COMMIT`，要求参与者提交事务。
3. **回滚阶段**：如果任何一个参与者无法准备或者协调者接收到回滚请求 `XA ROLLBACK`，则协调者向所有参与者发送回滚请求，要求它们回滚事务。

使用 MySQL XA 事务时，需要确保所有实例状态正常，且各节点间的通信也正常。同时，保证 MySQL 的事务日志功能可用（包括 Binlog 和 Redo log），以便于事务的恢复和回滚。

### XA 事务 SQL 语句

MySQL/GreatSQL 中执行 XA 事务，支持以下 SQL 语句：

```sql
-- 开始事务
XA {START|BEGIN} xid [JOIN|RESUME]

-- 结束事务
XA END xid [SUSPEND [FOR MIGRATE]]

-- 准备事务提交
XA PREPARE xid

-- 发起事务提交
XA COMMIT xid [ONE PHASE]

-- 回滚事务
XA ROLLBACK xid

-- 列出所有 PREPARED 状态的事务
-- 需要具备 XA_RECOVER_ADMIN 权限
XA RECOVER [CONVERT XID]
```

下面演示一个 XA 事务的过程：

```sql
                         会话1                                 │                  会话2
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> XA BEGIN 'xa1';
                                                               │Query OK, 0 rows affected (0.00 sec)
----------------------------------------------------------------------------------------------------------------------------------------
/* 执行XA BEGIN时，还未真正启动事务，要等到发起DML才启动 */    │ /* 执行 XA BEGIN 时，还未真正启动事务 */
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* 要等到发起 DML 才启动 */
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
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* 发起 SELECT 后正式启动事务，此时还是只读事务 */
*************************** 1. row *************************** │ /* 直到执行 UPDATE 后才转变成读写事务 */
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
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* 在 XA PREPARE 前，XA RECOVER 查询结果为空 */
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
greatsql> SELECT * FROM information_schema.INNODB_TRX\G        │ /* XA PREPARE 后，XA RECOVER 可查到当前处于 PREPARE 状态的事务 */
*************************** 1. row *************************** │ /* 此外，trx_mysql_thread_id 的值从 79 变成了 0 */
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
greatsql> XA ROLLBACK 'xa1';                                   │ /* 在另一个会话中，可以执行 XA ROLLBACK 回滚其他会话的事务 */
Query OK, 0 rows affected (0.00 sec)                           │ /* 当前会话无法提交/回滚该 XA 事务 */
----------------------------------------------------------------------------------------------------------------------------------------
                                                               │greatsql> XA COMMIT 'xa1';
                                                               │ERROR 1397 (XAE04): XAER_NOTA: Unknown XID
                                                               │
                                                               │ /* 再次启动新 XA 事务 */
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

有些时候，XA 事务中的 xid 可能是由外部程序生成的，采用16进制或其他格式，这时看起来可能会像是不可打印的乱码，例如下面这样：

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

这时候，就需要加上 `CONVERT XID` 关键字，将 `data` 列值转成可打印的16进制，并且可以对其执行 `ROLLBACK` 操作：

```sql
greatsql> XA RECOVER CONVERT XID;
+----------+--------------+--------------+----------------------------------------------------------+
| formatID | gtrid_length | bqual_length | data                                                     |
+----------+--------------+--------------+----------------------------------------------------------+
|      201 |           23 |            4 | 0xAAAAAB3C6ABAE54B6928EBF6AAAB38EC68E58C13697184C2D3FF77 |
+----------+--------------+--------------+----------------------------------------------------------+
```

在上面的结果中，`data` 列值内容由 `gtrid`、`bqual` 和 `xid` 构成，拆解过程如下：

1. 以16进制表示的 `data` 中，`bqual` 长度为 `bqual_length` * 2 = 8（16进制模式下计算长度需要乘2，因为一个ASCII字符16进制表示时需要2个字符宽度，正常模式下不需要）。
2. 所以 `bqual` 的16进制值为 `C2D3FF77`。
3. 剩余部分即为 `xid` 的16进制值，即为 `AAAAAB3C6ABAE54B6928EBF6AAAB38EC68E58C13697184`。
4. 除了 `data` 列，`formatID` 列值为 201，无需额外处理。

因此，这个 XA 事务可以采用以下方式提交或回滚：

```sql
greatsql> XA ROLLBACK X'AAAAAB3C6ABAE54B6928EBF6AAAB38EC68E58C13697184', X'C2D3FF77', 201;
Query OK, 0 rows affected (0.00 sec)
```

更多关于 XA 事务的细节内容请参考：[XA Transactions](https://dev.mysql.com/doc/refman/8.0/en/xa.html)。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
