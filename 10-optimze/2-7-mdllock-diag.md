# MDL锁等待分析
---

本文介绍在GreatSQL数据库中，如何查看MDL锁以及发生MDL锁等待时如何排查分析。

## 1. 关于MDL锁
在[**UPDATE执行慢排查分析**](./2-4-slow-update-diag.md)一文中提到，当执行`SHOW PROCESSLIST`时，可能会看到一种状态是`Waiting for XX metadata lock`，这就意味着当前发生了MDL锁等待。

MDL锁全称为Metadata Lock（元数据锁）。在MySQL/GreatSQL中，DDL是不不支持事务特性的，当事务和DDL同时操作同一个表，可能会出现各种意想不到问题，如事务特性被破坏、binlog顺序错乱等。为了解决类似这些问题，MySQL在5.5开始引入了MDL锁(Metadata Locking)。也就是说，MDL锁的作用是保证表元数据的一致性，避免DDL和DML并行导致元数据不一致。

MDL锁的范围主要包括以下几种：
- GLOBAL级，即全局读锁，例如执行`FLUSH TABLES WITH READ LOCK`。
- TABLE/TABLESPACE/SCHEMA级，保护元数据。
- FUNCTION/PROCEDURE/TRIGGER/EVENT级，保护元数据。
- COMMIT，用于阻塞事务提交，例如在事务提交前，MDL锁还没释放，此时提交会被阻塞。
- BACKUP，全局备份锁以及单表备份锁，8.0以后新增备份锁。
- USER_LEVEL_LOCK，用户级自定义锁。 
- FOREIGN_KEY/CHECK_CONSTRAINT，约束校验锁。

还有其他MDL锁范围，这里未能全部列出，MySQL仍在持续优化MDL锁。

## 2. 查看MDL锁状态

MDL锁是Server层的锁，对象级锁。

发起DML请求时，会对表同时申请MDL共享锁（只读锁）；发起DDL请求时，会对表同时申请MDL排他锁（写锁）。申请MDL加锁的操作会形成一个队列，队列中写锁获取优先级高于读锁。

通过查询 `performance_schema.metadata_locks` 可以看到当前的MDL加锁及锁等待信息，不过要先进行相应的设置：
```
# 1. 打开PFS中MDL观测开关
greatsql> UPDATE setup_consumers SET ENABLED = 'YES' WHERE NAME ='global_instrumentation';

greatsql> UPDATE setup_instruments SET ENABLED = 'YES' WHERE NAME =‘wait/lock/metadata/sql/mdl';
```

下面模拟几种场景，分别观察MDL锁的不同加锁表现。

**1. 发起一个事务，提交DML请求**

在会话1中发起下面的请求：
```
greatsql> begin;
greatsql> update t1 set k=rand()*102400 where id = 3;
```

在另一个会话中，观察MDL加锁情况：
```
greatsql> select * from performance_schema.metadata_locks\G
*************************** 1. row ***************************
          OBJECT_TYPE: TABLE               #<-- 表级锁
        OBJECT_SCHEMA: greatsql
          OBJECT_NAME: t1
          COLUMN_NAME: NULL
OBJECT_INSTANCE_BEGIN: 139835142929568
            LOCK_TYPE: SHARED_WRITE        #<-- 共享写锁，因为这是一个UPDATE事务，如果发起SELECT...FOR SHARE请求，则加锁类型是SHARED_READ
        LOCK_DURATION: TRANSACTION         #<-- 事务里发起的MDL锁
          LOCK_STATUS: GRANTED             #<-- 加锁状态：已获得
               SOURCE: sql_parse.cc:6516
      OWNER_THREAD_ID: 11648
       OWNER_EVENT_ID: 18
```

**2. 发起一个显式LOCK WRITE请求**

会话1：
```
greatsql> LOCK TABLE t1 WRITE;
```

会话2：
```
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
可以看到，**LOCK WRITE** 请求实际上要申请好几个排他锁。


**3. 发起一个显式LOCK READ请求**

会话1：
```
greatsql> LOCK TABLE t1 READ;
```

会话2：
```
greatsql> select * from performance_schema.metadata_locks\G
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
如果是 **LOCK READ** 请求则简单了很多，只有一个表级对象共享锁。

**4. 发起一个DDL请求**

会话1：
```
greatsql> ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL;
```

会话2：
```
greatsql> select * from performance_schema.metadata_locks\G
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
也是要申请好几个锁。

**5. 发起一个备份锁**
会话1：

```
greatsql> LOCK INSTANCE FOR BACKUP;
```

会话2：
```
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

**6. 发起FTWRL锁**
会话1：

```
greatsql> FLUSH TABLES WITH READ LOCK;
```

会话2：
```
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
看到除了GLOBAL锁，还有COMMIT锁。

## 3. 查看分析MDL锁等待

MDL锁是比较粗粒度的锁，一旦出现写锁等待，不但当前操作会被阻塞，同时还会阻塞后续该表的所有操作，如下例所示：

| 会话1 | 会话2 | 会话3|
| --- | --- | --- |
| BEGIN;<br/>SELECT * FROM t1 WHERE id = 3 FOR UPDATE;<br/>发起事务，申请加行锁，以及MDL锁| | |
| | ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL;<br/>被会话1阻塞 | |
| | | SELECT * FROM t1 WHERE id=5;<br/>被MDL阻塞，进入等待|

这时，如果执行 `SHOW PROCESSLIST` 就可以看到会话2 & 3的状态都是等待获得MDL锁：
```
| 13365 | root                      | localhost           | greatsql | Sleep                                      |      41 |                                                          | NULL                                        |      41867 |         1 |             1 |
| 13366 | root                      | localhost           | greatsql | Query                                      |      14 | Waiting for table metadata lock                          | ALTER TABLE t1 ADD c2 INT UNSIGNED NOT NULL |      13943 |         0 |             0 |
| 13368 | root                      | localhost           | greatsql | Query                                      |       5 | Waiting for table metadata lock                          | SELECT * FROM t1 WHERE id=5                 |       5701 |         0 |             0 |
```

查看 `performance_schema.metadata_locks` 可以看到当前MDL锁的状态是这样的：
```
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

这个视角可读性太差了，改成查看 `sys.schema_table_lock_waits` 更清晰：
```
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
在上述输出结果中，甚至还提供了解除MDL锁等待的方法，通过KILL持有MDL锁的连接或正在执行的SQL以释放MDL锁。不过这种是比较粗暴的做法，最好是找到持有MDL锁的那个事务，主动发起COMMIT/ROLLBACK结束这个事务，或执行 `UNLOCK TABLES`，就可以释放相应的MDL锁了。

## 4. MDL锁等待优化建议

MDL锁等待超时阈值由选项 `lock_wait_timeout` 定义，默认值是 **31536000** 秒（即：一年），这个值太大了，建议调低，在 [GreatSQL my.cnf模板](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-24) 中的建议参考值是 **3600**。

除此外，还应该定期监控MDL锁及MDL锁等待状态，一旦发现有超过设定阈值时长的MDL锁等待发生，应立即发出告警，通知DBA及时检查处理。

以下是几个容易造成较大范围MDL锁等待的操作，尽量放在业务低谷期间执行：
- 备份实例，或备份单表。
- 表DDL操作。
- 长时间未结束的事务。
- 较早的某些版本可能存在bug，导致频繁执行 `SHOW TABLE STATUS` 时也会造成MDL锁等待。 
- 个别图形化数据库管理工具可能在鼠标点中某个数据对象时，也会主动请求MDL锁。

**参考资料**
- [Metadata Locking](https://dev.mysql.com/doc/refman/8.0/en/metadata-locking.html)
- [The metadata_locks Table](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-metadata-locks-table.html)

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
