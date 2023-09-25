# FAQ - 其他问题
---

其他FAQ。

## 1. 使用MGR有什么限制吗
下面是关于MGR使用的一些限制：
- 所有表必须是InnoDB引擎。可以创建非InnoDB引擎表，但无法写入数据，在利用Clone构建新节点时也会报错。
- 所有表都必须要有主键。同上，能创建没有主键的表，但无法写入数据，在利用Clone构建新节点时也会报错。
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
- 每个节点都要转存binlog，即设置 `log_slave_updates=1`。
- binlog format务必是row模式，即 `binlog_format=ROW`。
- 每个节点的 `server_id` 及 `server_uuid` 不能相同。
- 在8.0.20之前，要求 `binlog_checksum=NONE`，但是从8.0.20后，可以设置 `binlog_checksum=CRC32`。
- 要求启用 GTID，即设置 `gtid_mode=ON`。
- 要求 `master_info_repository=TABLE` 及 `relay_log_info_repository=TABLE`，不过从MySQL 8.0.23开始，这两个选项已经默认设置TABLE，因此无需再单独设置。
- 所有节点上的表名大小写参数 `lower_case_table_names` 设置要求一致。
- 最好在局域网内部署MGR，而不要跨公网，网络延迟太大的话，会导致MGR性能很差或很容易出错。
- 建议启用writeset模式，即设置以下几个参数
    - `slave_parallel_type = LOGICAL_CLOCK`
    - `slave_parallel_workers = N`，N>0，可以设置为逻辑CPU数的2倍
    - `binlog_transaction_dependency_tracking = WRITESET`
- `slave_preserve_commit_order = 1`
    - `slave_checkpoint_period = 2`

## 2. MGR相对传统主从复制是不是会更耗CPU、内存和带宽等资源
一定程度上来说，是的。因为MGR需要在多个节点间进行事务冲突检测，不过这方面的开销有限，总体来说也还好。

## 3. MGR中可以创建无主键的InnoDB表吗
是可以的，并且会复制到所有MGR节点，但是仅能创建空表，业务上不能写入数据。

往无主键的InnoDB表中写入数据时，会报告类似下面的错误：
```
[root@GreatSQL] [test]> insert into t3 select 1;
ERROR 3098 (HY000): The table does not comply with the requirements by an external plugin.
```
同理，也可以创建MyISAM表，但写入时会提示失败。

此外，当欲加入MGR集群的新实例中有无主键的InnoDB表时，如果要通过 **MySQL Shell** 添加该节点，会发出类似下面的报错，无法加入：
```
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

## 4. GreatSQL怎么备份
可以利用GreatSQL安装包中提供的mysqldump工具执行逻辑备份。
也可以利用相同版本号的Percona Xtrabackup执行物理备份，例如利用Percona XtraBackup 8.0.25-17备份GreatSQL 8.0.25-15、GreatSQL 8.0.25-16版本，利用Percona XtraBackup 2.4备份GreatSQL 5.7.36-39版本。

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

## 7. MySQL 5.7可以和GreatSQL 5.7混用datadir吗
是可以的。

不过也提醒下：如果有是在原有MySQL datadir上直接启动GreatSQL的话，记得执行mysql_upgrade哦，要不然是没有MEMBER_ROLE列的。

升级/切换步骤：
1. 执行mysql_upgrade -f -s（至少加 -s，升级system schema）
2.重启实例（重启后才能识别到新的schema metadata）

同理，如果有跑MySQL 8.0.x和GreatSQL 8.0.x版本也是如此。

但还不支持5.7和8.0跨版本混跑。

## 8. MGR里推荐用哪个事务隔离级别

在GreatSQL MGR FAQ中提到一个限制条件：

- 由于MGR的事务认证线程不支持 gap lock，因此建议把所有节点的事务隔离级别都改成 READ COMMITTED。基于相同的原因，MGR集群中也不要使用 table lock 及 name lock（即 GET_LOCK() 函数 ）。

这句话的意思是，由于MGR的事务认证线程不支持gap lock，因此在MGR中，不能实现跨节点间的RR隔离级别保证。也就是说，在s1、s2两个MGR节点间，无法像是在同一个本地节点间实现RR隔离级别保证。

例如下面这样：
> 表t1，只有一个主键列id，已有3条数据：1、3、10，采用RR级别。

**案例1：**

|时间线 | 节点1 | 节点2|
|--- |---|---|
|T1|begin;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|10 \| | begin;<br/>select * from t1 where id>=3;<br/>\|  3 \|<br/>\| 10 \| |
|T2|insert into t1 select 6;<br/>commit;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \|||
|T3| | begin;<br/>select * from t1 where id>=3; -- 还是只有两条记录<br/>\|  3 \|<br/>\| 10 \||
|T4||begin;<br/>select * from t1 where id>=3 for update; -- 可以看到新插入的记录<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \||

**案例2（先删掉上面插入的6这条记录）：**

|时间线 | 节点1 | 节点2|
|--- |---|---|
|T1|begin;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\| 10 \|||
|T2| | begin;<br/>select * from t1 where id>=3 for update; -- 加锁<br/>\|  3 \|<br/>\| 10 \||
|T3|insert into t1 select 6; -- 不会被阻塞（如果是在同一个节点上执行，RR级别，这个SQL下会被阻塞）<br/>commit;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \|||
|T4||select * from t1 where id>=3 for update; -- 这里无论是否加for update，都会触发死锁<br/>ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction|

综上，在MGR中，即便本地节点选择的事RR级别，依然无法跨节点实现gap lock加锁，因此也就无法跨节点保证RR级别。但**如果写入事务都在同一个节点的话，则设置RR是有意义的**。

## 9. GreatSQL性能表现如何

GreatSQL相对于MySQL官方社区版本有非常大的性能提升，尤其是引入了InnoDB并行查询特性，在TPC-H测试中，平均提升15倍以上，最高提升43倍，表现非常优异。

更多关于GreatSQL性能提升方面的内容可以参考下面几个测评报告：
- [GreatSQL重磅特性，InnoDB并行并行查询优化测试](https://mp.weixin.qq.com/s/pK90W9xT_V59yvgxRwcn8A)
- [GreatSQL & NVIDIA InfiniBand NVMe SSD性能测试](https://mp.weixin.qq.com/s/F9804_7H1WiJ6xD0E1AueQ)
- [GreatSQL & DapuStor Roealsen5 NVMe SSD性能测试](https://mp.weixin.qq.com/s/QrIZ8Fu69Bzq5MvNZwtTww)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
