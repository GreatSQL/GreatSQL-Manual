# FAQ - 其他问题
---

## 1. 使用MGR有什么限制吗

下面是关于MGR使用的一些限制：

- 所有表必须是InnoDB引擎。可以创建非InnoDB引擎表，但无法写入数据，在利用Clone构建新节点时也会报错。
- 所有表最好都要有主键(建议全局设置选项 `sql_require_primary_key=ON`)。同上，能创建没有主键的表，但无法写入数据，在利用Clone构建新节点时也会报错（例外情况：在创建表之前，设置选项 `sql_generate_invisible_primary_key=ON`，这样InnoDB就会自动为该表创建一个不可见主键，详见：[Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html)）。
- 不要使用大事务，默认地，事务超过150MB会报错，最大可支持2GB的事务（在GreatSQL未来的版本中，会增加对大事务的支持，提高大事务上限）。
- 如果是从旧版本进行升级，则不能选择 MINIMAL 模式升级，建议选择 AUTO 模式，即 `upgrade=AUTO`。
- 由于MGR的事务认证线程不支持 `gap lock`，因此建议把所有节点的事务隔离级别都改成 `READ COMMITTED`。基于相同的原因，MGR集群中也不要使用 `table lock` 及 `name lock`（即 `GET_LOCK()` 函数 ）。
- 在多主（`multi-primary`）模式下不支持串行（`SERIALIZABLE`）隔离级别。
- 不支持在不同的MGR节点上，对同一个表分别执行DML和DDL，可能会造成数据丢失或节点报错退出。
- 在多主（`multi-primary`）模式下不支持多层级联外键表。另外，为了避免因为使用外键造成MGR报错，建议设置 `group_replication_enforce_update_everywhere_checks=ON`。
- 在多主（`multi-primary`）模式下，如果多个节点都执行 `SELECT ... FOR UPDATE` 后提交事务会造成死锁。
- 不支持复制过滤（Replication Filters）设置。

看起来限制有点多，但绝大多数时候并不影响正常的业务使用。

此外，想要启用MGR还有几个要求：
- 每个节点都要启用binlog。
- 每个节点都要转存binlog，即设置 `log_replica_updates=1`。
- binlog format务必是row模式，即 `binlog_format=ROW`。
- 每个节点的 `server_id` 及 `server_uuid` 不能相同。
- 在8.0.20之前，要求 `binlog_checksum=NONE`，但是从8.0.20后，可以设置 `binlog_checksum=CRC32`。
- 要求启用 GTID，即设置 `gtid_mode=ON` 和 `enforce_gtid_consistency = ON`。
- 要求 `master_info_repository=TABLE` 及 `relay_log_info_repository=TABLE`，不过从MySQL 8.0.23开始，这两个选项已经默认设置TABLE，因此无需再单独设置。
- 所有节点上的表名大小写参数 `lower_case_table_names` 设置要求一致。
- 最好在局域网内部署MGR，而不要跨公网，网络延迟太大的话，会导致MGR性能很差或很容易出错。
- 建议启用writeset模式，即设置以下几个参数
    - `replica_parallel_type = LOGICAL_CLOCK`
    - `replica_parallel_workers = N`，N>0，可以设置为逻辑CPU数的2倍
    - `binlog_transaction_dependency_tracking = WRITESET`
- `replica_preserve_commit_order = 1`
    - `replica_checkpoint_period = 2`

## 2. MGR相对传统主从复制是不是会更耗CPU、内存和带宽等资源
一定程度上来说，是的。因为MGR需要在多个节点间进行事务冲突检测，不过这方面的开销有限，总体来说也还好。

如果不需要使用 MGR，请确认选项 `group_replication_start_on_boot` 不要设置为 *ON*；如果设置为 *ON*，则会尝试启动 MGR 服务进程，会显著消耗更多内存。详情参考案例：[GreatSQL内存使用问题](https://greatsql.cn/thread-755-1-1.html) 和 [docker 8.0.32-25 启动后内存使用率很高](https://greatsql.cn/thread-666-1-1.html)。

## 3. MGR中可以创建无主键的InnoDB表吗
是可以的，并且会复制到所有MGR节点，但是仅能创建空表，业务上不能写入数据。

往无主键的InnoDB表中写入数据时，会报告类似下面的错误：
```sql
[root@GreatSQL] [test]> INSERT INTO t3 SELECT 1;
ERROR 3098 (HY000): The table does not comply with the requirements by an external plugin.
```
同理，也可以创建MyISAM表，但写入时会提示失败。

此外，当欲加入MGR集群的新实例中有无主键的InnoDB表时，如果要通过 **MySQL Shell** 添加该节点，会发出类似下面的报错，无法加入：
```log
Validating instance configuration at mgr03:3306...

This instance reports its own address as mgr03:3306
ERROR: The following tables do not have a Primary Key or equivalent column:
test.t3

Group Replication requires tables to use InnoDB and have a PRIMARY KEY or PRIMARY KEY Equivalent (non-null unique key). Tables that do not follow these requirements will be readable but not updateable when used with Group Replication. If your applications make updates (INSERT, UPDATE or DELETE) to these tables, ensure they use the InnoDB storage engine and have a PRIMARY KEY or PRIMARY KEY Equivalent.
If you can't change the tables structure to include an extra visible key to be used as PRIMARY KEY, you can make use of the INVISIBLE COLUMN feature available since 8.0.23: https://dev.mysql.com/doc/refman/8.0/en/invisible-columns.html

ERROR: Instance must be configured and validated with dba.checkInstanceConfiguration() and dba.configureInstance() before it can be used in an InnoDB cluster.
Cluster.addInstance: Instance check failed (RuntimeError)
```
这个报错在MySQL 8.0.25依然存在，据说在MySQL 8.0.27得到解决。

如果改成手动加入新节点，或者直接删除无主键表，则可以成功。

从上面的错误提示也能看出来，如果创建一个和主键等价的唯一索引（且要求不允许为NULL），该唯一索引可用做InnoDB表的聚集索引，就不会再报错了，业务也能正常写入数据。

最好是在创建表之前，设置选项 `sql_generate_invisible_primary_key=ON`，这样InnoDB就会自动为该表创建一个不可见主键，详见：[Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html)。

## 4. GreatSQL怎么备份
可以利用GreatSQL安装包中提供的mysqldump工具执行逻辑备份。GreatSQL中的mysqldump备份工具支持加密备份，详见：[mysqldump备份加密](../5-enhance/5-4-security-mysqldump-encrypt.md)。

也可以利用相同版本号的Percona Xtrabackup执行物理备份，例如利用Percona XtraBackup 8.0.25-17备份GreatSQL 8.0.25-15、GreatSQL 8.0.25-16版本，利用Percona XtraBackup 2.4备份GreatSQL 5.7.36-39版本。

从 GreatSQL 8.0.32-26 版本开始，可以使用自带的 Clone 插件完成全量、增量备份，以及利用 Clone 实现加密、压缩备份，详情参考：

- [Clone 压缩及增量备份](../5-enhance/5-5-clone-compressed-and-incrment-backup.md)
- [Clone 备份加密](../5-enhance/5-4-security-clone-encrypt.md)

## 5. 用MySQL Shell创建MGR时新增的 mysql_innodb_cluster_* 账号是干嘛用的
这是用MySQL Shell创建MGR时才有的特点，这些账户用于后续的节点分布式恢复场景。其账户名规则是：`mysql_innodb_cluster_server_id@%,`

详情见手册 [Internal User Accounts Created by InnoDB Cluster](https://dev.mysql.com/doc/mysql-shell/8.0/en/innodb-cluster-user-accounts.html#admin-api-configuring-users) 中的描述：
```
As part of using Group Replication, InnoDB Cluster creates internal recovery users which enable connections between the servers in the cluster. 
These users are internal to the cluster, and the user name of the generated users follows a naming scheme of mysql_innodb_cluster_server_id@%, 
where server_id is unique to the instance. In versions earlier than 8.0.17 the user name of the generated users followed a naming 
scheme of mysql_innodb_cluster_r[10_numbers].
```

## 6. 当一个SQL中既有普通JOIN又有子查询时，能否用到InnoDB并行查询（PQ）特性

这种情况下是不支持的。
目前GreatSQL 的 InnoDB并行查询还不支持子查询，未来会增加支持。

## 7. 为什么InnoDB并行查询(PQ)不可用
可能原因有几种：
1. 优化器认为没必要走并行，比如因为cost太小了。
2. 不支持的SQL类型，目前还不支持子查询。
3. 优化器认为可用资源不足，"无法"使用并行查询。

例如，有个场景是因为 `parallel_memory_limit` 设置过低，优化器判断SQL的cost较大，所以只是尝试去使用并行，但没发挥最大优势
```sql
greatsql> SHOW GLOBAL STATUS LIKE 'PQ_%';
| PQ_memory_refused  | 0     |
| PQ_memory_used     | 0     |  <-- 没真正用上，因为可用buffer不够
| PQ_threads_refused | 82    |
| PQ_threads_running | 4     |  <-- 尝试并行
```

在调大 `parallel_memory_limit` 之后就好了
```sql
greatsql> SHOW GLOBAL STATUS LIKE 'PQ_%';
| PQ_memory_refused  | 0       |
| PQ_memory_used     | 4801552 |  <-- PQ消耗的内存
| PQ_threads_refused | 82      |
| PQ_threads_running | 4       |  <-- 并行线程4
```
相较而言，建议采用 [Rapid 引擎](../5-enhance/5-1-highperf-rapid-engine.md) 提升查询效率，其提升效果更为明显。

## 8. 为什么一个表已经设置了 `SECONDARY_ENGINE=rapid` 却还无法使用Rapid引擎加速查询

可能存在以下几种原因导致无法使用Rapid引擎加速查询：

1. 可能是因为该表还没有做一次全量加载到Rapid引擎的操作，需要执行类似下面的命令来完成：
```sql
ALTER TABLE t1 SECONDARY_LOAD;
```

2. 用户数据表中用到了暂时还不支持的数据类型，目前支持 *BOOL\INT\FLOAT\DOUBLE\DECIMAL* 等数据类型，其他数据类型暂不支持。

3. 用户SQL请求中包含了暂时还不支持的函数。

4. 用户数据表中包含隐藏自增列，需要在建表前设置 `sql_generate_invisible_primary_key=OFF`。

5. 优化器评估认为未达到 `secondary_engine_cost_threshold` 选项定义的阈值（其默认值为100000）。

6. 不支持MyISAM存储引擎，不支持DDL语法。

7. 不支持在同一个SQL查询中，混合使用 InnoDB 和 Rapid 引擎。也就是说，当一个 Rapid 引擎表和一个 InnoDB 引擎表之间进行 JOIN 关联查询时，是无法利用 Rapid 引擎来提升查
询效率，只能两个表都走 InnoDB 引擎的执行计划。

8. 其他情况。

另外，使用Rapid引擎时还有几个注意事项：
- 用户数据表主引擎只能是InnoDB引擎，不支持MyISAM等其他引擎。
- 数据库实例重启后，查询个别Rapid引擎表可能会提示无法使用Rapid引擎加速，这时可以尝试执行 `ALTER TABLE ... SECONDARY_LOAD` 将该表再次加载到Rapid引擎中，实际上无需重新加载一次，速度非常快，之后就可以使用Rapid引擎了。

## 9. MySQL 5.7可以和GreatSQL 5.7混用datadir吗
是可以的。

不过也提醒下：如果有是在原有MySQL datadir上直接启动GreatSQL的话，记得执行mysql_upgrade哦，要不然是没有MEMBER_ROLE列的。

升级/切换步骤：

1. 执行mysql_upgrade -f -s（至少加 -s，升级system schema）

2.重启实例（重启后才能识别到新的schema metadata）

同理，如果有跑MySQL 8.0.x和GreatSQL 8.0.x版本也是如此。

但还不支持5.7和8.0跨版本混跑。

## 10. MGR里推荐用哪个事务隔离级别

在GreatSQL MGR FAQ中提到一个限制条件：

- 由于MGR的事务认证线程不支持 gap lock，因此建议把所有节点的事务隔离级别都改成 READ COMMITTED。基于相同的原因，MGR集群中也不要使用 table lock 及 name lock（即 GET_LOCK() 函数 ）。

这句话的意思是，由于MGR的事务认证线程不支持gap lock，因此在MGR中，不能实现跨节点间的RR隔离级别保证。也就是说，在s1、s2两个MGR节点间，无法像是在同一个本地节点间实现RR隔离级别保证。

例如下面这样：


**案例1：**

|时间线 | 节点1 | 节点2|
|--- |---|---|
|T1|begin;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|10 \| | begin;<br/>select * from t1 where id>=3;<br/>\|  3 \|<br/>\| 10 \| |
|T2|insert into t1 select 6;<br/>commit;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \|||
|T3| | begin;<br/>select * from t1 where id>=3; -- 还是只有两条记录<br/>\|  3 \|<br/>\| 10 \||
|T4||begin;<br/>select * from t1 where id>=3 for update; -- 可以看到新插入的记录<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \||

::: tip 小贴士
表t1，只有一个主键列id，已有3条数据：1、3、10，采用RR级别。
:::

**案例2（先删掉上面插入的6这条记录）：**

|时间线 | 节点1 | 节点2|
|--- |---|---|
|T1|begin;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\| 10 \|||
|T2| | begin;<br/>select * from t1 where id>=3 for update; -- 加锁<br/>\|  3 \|<br/>\| 10 \||
|T3|insert into t1 select 6; -- 不会被阻塞（如果是在同一个节点上执行，RR级别，这个SQL下会被阻塞）<br/>commit;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \|||
|T4||select * from t1 where id>=3 for update; -- 这里无论是否加for update，都会触发死锁<br/>ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction|

综上，在MGR中，即便本地节点选择的是RR级别，依然无法跨节点实现gap lock加锁，因此也就无法跨节点保证RR级别。但**如果写入事务都在同一个节点的话，则设置RR是有意义的**。

## 11. GreatSQL性能表现如何

GreatSQL相对于MySQL官方社区版本有非常大的性能提升，尤其是引入了InnoDB并行查询特性，在TPC-H测试中，平均提升15倍以上，最高提升43倍，表现非常优异。

从GreatSQL 8.0.32-25版本开始，支持类似MySQL HeatWave的大规模并行、高性能的内存查询加速AP引擎，可将数据分析性能提升几个数量级。在32C64G测试机环境下，TPC-H 100G测试中22条SQL总耗时仅需不到80秒。更详细内容参考：[Rapid引擎](../5-enhance/5-1-highperf-rapid-engine.md)。

更多关于GreatSQL性能提升方面的内容可以参考下面几个测评报告：
- [GreatSQL重磅特性，InnoDB并行并行查询优化测试](https://mp.weixin.qq.com/s/pK90W9xT_V59yvgxRwcn8A)
- [GreatSQL & NVIDIA InfiniBand NVMe SSD性能测试](https://mp.weixin.qq.com/s/F9804_7H1WiJ6xD0E1AueQ)
- [GreatSQL & DapuStor Roealsen5 NVMe SSD性能测试](https://mp.weixin.qq.com/s/QrIZ8Fu69Bzq5MvNZwtTww)
- GreatSQL TPC-H 性能测试报告：[在线报告](../10-optimize/3-3-benchmark-greatsql-tpch-report.md)、[PDF文档下载](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/Presentations/27%E3%80%81benchmark-greatsql-tpch-report-20240228.pdf)

## 12. 运行GreatSQL时，必须先安装jemalloc包吗

不是必须的。

我们推荐安装 jemalloc 包以提升GreatSQL内存分配管理效率，但这并不是必须的。


## 13. GreatSQL支持数据脱敏吗

是的，支持，详情参考：[数据脱敏](../5-enhance/5-4-security-data-masking.md)。

## 14. 什么是双1 或 双0？

通常地，事务提交后为了保证用户数据不丢失，或者保证在mysqld进程意外crash后不丢失已提交的数据，需要确认以下两个选项值均设置为1，这称为 **双1**：
- sync_binlog = 1
- innodb_flush_log_at_trx_commit = 1

在一些测试环境或离线分析等特殊场合，对数据安全要求没那么高的时候，就可以将上述两个选项值修改为0，这称为 **双0**：
- sync_binlog = 0
- innodb_flush_log_at_trx_commit = 0

在修改成双0后，事务提交/数据写入性能通常会有较大幅度提升。

上述这两个选项只能修改全局设置，不能只在某个会话（session）中修改，例如：
```sql
-- 修改全局设置
greatsql> SET GLOBAL sync_binlog = 1;
greatsql> SET GLOBAL innodb_flush_log_at_trx_commit = 1;

-- 修改会话内设置
greatsql> SET sync_binlog = 1;
ERROR 1229 (HY000): Variable 'sync_binlog' is a GLOBAL variable and should be set with SET GLOBAL

greatsql> SET innodb_flush_log_at_trx_commit = 1;
ERROR 1229 (HY000): Variable 'innodb_flush_log_at_trx_commit' is a GLOBAL variable and should be set with SET GLOBAL
```

## 15. 为什么我有事务被阻塞了，却查不到源头

当前有大量事务被阻塞，产生很多表锁、行锁，例如


```sql
greatsql> SHOW ENGINE INNODB STATUS\G
...
---TRANSACTION 402851757, ACTIVE (PREPARED) 93 sec recovered trx
1 lock struct(s), heap size 1136, 0 row lock(s), undo log entries 5
TABLE LOCK table `db1`.`t1` trx id 402851757 lock mode IX
---TRANSACTION 402851749, ACTIVE (PREPARED) 93 sec recovered trx
1 lock struct(s), heap size 1136, 0 row lock(s), undo log entries 7
TABLE LOCK table `db1`.`t1` trx id 402851749 lock mode IX
...
```

但是在查询 `information_schema.INNODB_TRX` 时，发现这个事务对应的 `trx_mysql_thread_id` 值却为 0

```sql
greatsql> SELECT trx_mysql_thread_id FROM information_schema.innodb_trx WHERE trx_id = 402851749\G
*************************** 1. row ***************************
trx_mysql_thread_id: 0
1 row in set (0.00 sec)
```

出现这种情况，是因为这些事务都是 XA 事务，且处于 PREPARE 状态，所以这些事务的 `trx_mysql_thread_id` 值为 0。

从上面查看事务状态中的 `recovered trx` 关键字也能发现这一点。

这时可以执行 `XA RECOVER` 或 `XA RECOVER CONVERT XID` 查看这些事务列表，并对它们进行提交或回滚。

更多详情请参考
- [事务控制](../12-dev-guide/12-6-1-trx-control.md)
- [表锁住了,而且无法解锁](https://greatsql.cn/thread-487-1-1.html)

## 16. 为什么设置 `innodb_numa_interleave = ON` 时，启动就会比较慢，像卡住了似的

设置 `innodb_numa_interleave = ON` 时，启动过程可能变慢并且看起来像卡（qiǎ）住了，这是因为 NUMA（非统一内存访问）系统的内存分配机制的复杂性。

- NUMA（非统一内存访问）简介

NUMA 是一种用于多处理器系统的内存设计，旨在提高系统性能。NUMA 系统将内存划分成多个节点，每个节点由一个或多个处理器和其专属的内存组成。在这种架构下，处理器访问其本地节点的内存速度更快，而访问其他节点的内存则会稍慢。

- `innodb_numa_interleave` 选项

`innodb_numa_interleave` 选项控制 InnoDB 是否在 NUMA 系统中跨多个内存节点分配内存。当设置为 `ON` 时，InnoDB 会尝试在所有可用的 NUMA 节点之间平均分配内存。这有助于平衡内存访问的负载，但也会引入一些开销。

- 启动慢的原因

当 `innodb_numa_interleave = ON` 时，GreatSQL 启动过程中会进行以下操作：

1. **内存分配**：InnoDB 需要分配大块内存，并且这些内存需要均匀分布在所有 NUMA 节点上。这种分配方式比单节点内存分配更复杂，因此需要更多时间。

2. **页初始化**：InnoDB 初始化内存页，确保它们在物理上分布在不同的 NUMA 节点。这一步涉及大量的内存读写操作，进一步增加了启动时间。

3. **NUMA 拓扑发现和设置**：InnoDB 需要发现系统的 NUMA 拓扑结构，并配置内存策略。这些操作在 NUMA 系统中比在统一内存访问（UMA）系统中复杂得多。

虽然启用 `innodb_numa_interleave` 可以带来一些性能优势，但如果启动时间过慢且影响到系统的可用性，可以考虑以下方法：
- 评估是否需要启用 NUMA，可以先进行基准测试，如果在你的服务器上启用 NUMA 对性能影响不大，则可以考虑关闭。
- 调低 `innodb_buffer_pool_size` 选项初始设置值，待到启动成功后再在线动态调大。

通过以上方法，应该可以在一定程度上缓解 `innodb_numa_interleave = ON` 造成的启动变慢问题。

## 17. 安装percona-toolkit工具时需要安装perl-DBD-MySQL依赖，但提示和GreatSQL冲突

使用percona-toolkit工具时报错提示缺失perl-DBD-MySQL，在安装perl-DBD-MySQL的时候出现报错和GreatSQL冲突，类似下面的错误信息：

```bash
$ yum install perl-DBD-MySQL

...
Installing:
perl-DBD-MySQL                                 x86_64                                 4.023-6.el7                                       base                                 140 k
Installing for dependencies:
mariadb-libs        
...
Transaction check error:
  file /etc/my.cnf from install of mariadb-libs-1:5.5.68-1.el7.x86_64 conflicts with file from package greatsql-server-8.0.32-25.1.el7.x86_64
  file /usr/lib64/mysql/plugin/dialog.so from install of mariadb-libs-1:5.5.68-1.el7.x86_64 conflicts with file from package greatsql-server-8.0.32-25.1.el7.x86_64
...
```

这是因为安装 percona-toolkit 时需要依赖 perl-DBD-MySQL，而 perl-DBD-MySQL 又需要依赖 mariadb-libs。

如果系统中已经用 RPM 方式安装了 GreatSQL，就会报告这个冲突，因为 GreatSQL 也提供了这个lib库。

所以，在安装 perl-DBD-MySQL 时加上 --nodeps 参数应该就可以，例如 `yum install --nodeps perl-DBD-MySQL` 再试试看。

同样的问题，可能也会出现在安装其他软件包的时候，例如安装 sysbench 时。

## 18. 部署 GreatSQL VIP功能时，执行 `ldconfig -p` 提示 "file is truncated"

当 `ldconfig` 尝试读取或处理一个共享库文件时，如果文件大小比预期的小，或者文件末尾被意外截断，就会报告 "file is truncated" 错误。这种情况可能由以下几个原因造成：

1. **文件系统错误**：磁盘损坏或其他文件系统问题可能导致文件不完整。

2. **不完整的复制或下载**：动态库文件是在传输过程中出现问题而被复制或下载的，可能会导致文件数据丢失。

3. **软件故障**：应用程序崩溃或错误地写入文件也可能导致文件损坏。

4. **恶意行为**：病毒或恶意软件可能修改或删除系统文件。

5. **权限问题**：尝试访问或修改文件的用户可能没有足够的权限，尽管这种情况下通常会有不同的错误消息。或者 SELinux 也可能会引发这个问题，参考本页内容：[20. 为什么用 systemd 启动 GreatSQL 时，会报错提示 Failed to execute command: Permission denied](#_20-为什么用-systemd-启动-greatsql-时-会报错提示-failed-to-execute-command-permission-denied)。

解决 "file is truncated" 错误的方法包括：

1. **重新安装受影响的库**：卸载并重新安装包含有问题的 .so 文件的包，这通常可以替换损坏的文件。

2. **修复文件系统**：使用文件系统的检查和修复工具（如 fsck）来扫描并修复磁盘错误。

3. **恢复文件**：从备份中恢复文件，如果有的话。

4. **手动替换文件**：从相同版本的另一台健康机器上复制文件，然后替换本地的损坏文件。

5. **检查权限**：确认你有足够的权限访问和修改文件，或者修复 SELinux 相关问题，参考本页内容：[20. 为什么用 systemd 启动 GreatSQL 时，会报错提示 Failed to execute command: Permission denied](#_20-为什么用-systemd-启动-greatsql-时-会报错提示-failed-to-execute-command-permission-denied)。

6. **更新系统**：确保所有的系统包都是最新的，有时候问题可能是因为旧版本的库文件。

以上方法通常就能解决此问题。




**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
