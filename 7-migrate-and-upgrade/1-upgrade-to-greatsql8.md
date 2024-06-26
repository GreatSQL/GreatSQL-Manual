# GreatSQL 5.7升级到8.0
---

本文介绍如何从GreatSQL 5.7/MySQL 5.7版本升级到GreatSQL 8.0版本。

## 为什么要升级

GreatSQL 8.0相对于GreatSQL 5.7有着众多优秀新特性，包括且不仅限以下：

| 特性 |  GreatSQL 8.0 |GreatSQL/MySQL 5.7 |
| --- | ---|---|
|AP引擎| :heavy_check_mark: | 仅云上HeatWave |
|并行LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB事务ReadView无锁优化| :heavy_check_mark: | ❌ |
|InnoDB事务大锁拆分优化| :heavy_check_mark: | ❌ |
|快速DDL| :heavy_check_mark: | :heavy_check_mark: |
|DDL原子性| :heavy_check_mark: | :heavy_check_mark: |
|MGR提升-地理标签| :heavy_check_mark: | ❌ |
|MGR提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR提升-全新流控算法| :heavy_check_mark: | ❌ |
|MGR提升-网络分区异常处理 |  :heavy_check_mark: | ❌ |
|MGR提升-节点异常退出处理 | :heavy_check_mark: | ❌ |
|MGR提升-节点磁盘满处理 | :heavy_check_mark: | ❌ |
|Oracle兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle兼容-函数| :heavy_check_mark: | ❌ |
|Oracle兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle兼容-存储程序| :heavy_check_mark: | ❌ |
| Hash Join|  :heavy_check_mark: | ❌ |
| Anti Join优化 |  :heavy_check_mark: | ❌ |
| 直方图 |  :heavy_check_mark: | ❌ |
| 倒序索引 |  :heavy_check_mark: | ❌ |
| 不可见索引 |  :heavy_check_mark: | ❌ |
| 函数索引/表达式索引 |  :heavy_check_mark: | ❌ |
| 多值索引 |  :heavy_check_mark: | ❌ |
| CTE |  :heavy_check_mark: | ❌ |
| 窗口函数 |  :heavy_check_mark: | ❌ |
| EXPLAIN ANALYZE | :heavy_check_mark: | ❌ | 
| Clone Plugin | :heavy_check_mark: | ❌ | 
| 全新数据字典 | :heavy_check_mark: | ❌ | 
| 升级更灵活 | :heavy_check_mark: | ❌ |  
| 数个安全增强 | :heavy_check_mark: | ❌ | 
| 数个InnODB增强 | :heavy_check_mark: | ❌ | 
| 数个优化器增强 |  :heavy_check_mark: | ❌ |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计日志入库| :heavy_check_mark: | ❌ |

## 升级前准备

### 注意事项

从5.7版本升级到8.0，有以下相关注意事项，请认真核对是否产生冲突或不兼容：

1. 最好是先升级到5.7.x的最新版本，再升级到8.0.x的最新版本，不要从5.7的小版本直接升级到8.0，尤其是非GA的版本。
1. 在8.0中，除了 `general_log` 和 `slow_log` 之外，其他所有元数据的字典数据都存储在InnoDB引擎表中，不再采用MyISAM引擎表存储。
1. 在8.0中，默认采用 `caching_sha2_password` 密码插件，这可能导致部分版本较早的连接驱动、连接客户端无法连接8.0的服务端，也需要同步升级。
1. 在8.0中，默认采用 `utf8mb4` 字符集，而5.7版本默认字符集是 `utf8`（也是 `utf8mb3`），在做数据迁移时要注意前后对照校验。
1. 在8.0中，启动时务必先设定好 `lower_case_table_names` 选项值，且实例启动后不可再更改，在个别不区分大小写的旧系统中迁移时要特别谨慎。
1. 在8.0中，参数`explicit_defaults_for_timestamp`默认值为 `ON`，这可能会影响 `timestamp` 类型字段的默认行为。
1. 在8.0中，默认启用`event_scheduler`，建议在主从复制或MGR中，在所有从节点中都关闭它。
1. 在8.0中，分组查询`GROUP BY`的结果不再默认进行排序，需要显式加上`ORDER BY`才行。
1. 新增保留字、关键字，详情请见：[2.6 保留字、关键字](../2-about-greatsql/7-greatsql-keywords.md)。
1. 除InnoDB、NDB外，其他引擎不再支持表分区。
1. SQL Mode不再支持 `NO_AUTO_CREATE_USER`，也就是不能直接利用 `GRANT` 创建新用户并授权，需要先 `CREATE USER` 创建用户，再授权。
1. 部分参数选项不再支持，例如：`innodb_locks_unsafe_for_binlog`, `old_passwords`, query cache相关参数等。
1. 部分功能、函数不再支持，例如：`query cache`, `PASSWORD()`, `ENCODE()`, `DECODE()`, `ENCRYPT()`等。

更多详情请见：[What Is New in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/mysql-nutshell.html)。

### 升级准备


首先下载GreatSQL 8.0版本安装包，推荐选择最新的[GreatSQL 8.0.32-25版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-25)，至于选择RPM还是二进制包看具体情况及个人喜好。

本文假定升级前后都是二进制包方式安装。

正式升级之前，务必做好数据备份，可以采用以下几种方式：

1. 停机维护，复制当前的数据库目录，做一个全量物理备份，这种方式恢复起来最快。
2. 利用mysqldump/xtrabackup等备份工具，执行一个全量备份。
3. 利用主从复制或MGR，在其中一个节点执行备份，或者令某个节点临时下线/退出，作为备用节点。

需要特别注意的事，您原先运行中的GreatSQL/MySQL 5.7版本，可能也是从其他旧版本中升级而来的，此时有可能MySQL系统库下的部分元数据表还是旧格式。这种情况下，需要先在原来的环境下执行 `mysql_upgrade` 进行升级修复旧格式。例如：
```
# 切换到当前运行的数据库实例datadir下
$ cd /data/GreatSQL

# 执行mysql_upgrade程序
# 参数 -s 表示只升级MySQL系统库表文件，不升级其他用户数据文件，一般建议去掉，对所有数据都进行升级
# 参数 -f 表示强制升级，如果升级过程中遇到报错，也会继续升级后面的库表文件，而不会直接退出
# 假定socket文件路径是 /data/GreatSQL/mysql.sock，用参数 -S 指向
$ /usr/local/GreatSQL-5.7.36-39-Linux-glibc2.28-x86_64/bin/mysql_upgrade -s -f -S/data/GreatSQL/mysql.sock

/usr/local/GreatSQL-5.7.36-39-Linux-glibc2.28-x86_64/bin/mysql_upgrade -s -S./mysql.sock
The --upgrade-system-tables option was used, databases won't be touched.
Checking if update is needed.
Checking server version.
Running queries to upgrade MySQL server.

...

mysql.time_zone_transition_type                    OK
mysql.user                                         OK
The sys schema is already up to date (version 1.5.2).
Checking databases.
sys.sys_config                                     OK
test.sbtest1                                       OK
Upgrade process completed successfully.
Checking if update is needed.
```

另外，推荐采用MySQL Shell提供的 `util.checkForServerUpgrade()` 方法做升级前的检查，它主要是从实例的基础数据本身来判定实例是否满足升级条件，譬如是否使用了移除的函数、表名是否存在冲突等。该工具的详细介绍可参考社区用户 **芬达** 的几篇文章：
- [5.7 升级 8.0 的升级检查利器 util.checkForServerUpgrade 原理(1)](https://mp.weixin.qq.com/s/EuR7MSaVMOTnQTMh0_RsZQ)
- [5.7 升级 8.0 的升级检查利器 util.checkForServerUpgrade 原理(2)](https://mp.weixin.qq.com/s/i9w4-zqRh8DO2XByhUZrVA)
- [5.7 升级 8.0 的升级检查利器 util.checkForServerUpgrade 原理(3)](https://mp.weixin.qq.com/s/0rMJpIS7zyP3Het5QOwYmw)

## 升级过程

从GreatSQL/MySQL 5.7升级到8.0需要注意以下几点变化：

1. 升级前的版本要求是GA版本，即5.7.9之后的版本。如果不是的话，要先在5.7大版本内升级小版本。
2. 建议先把当前的5.7升级到最新的子版本，截止本文时间，最新版本是5.7.43。
3. 升级到8.0版本后，主要区别是默认密码验证插件(`default_authentication_plugin`)从 `mysql_native_password` 变成了 `caching_sha2_password`，会影响一些版本比较低的API/驱动，在创建用户时仍旧指定为 `mysql_native_password` 即可，或者在 `my.cnf` 中设置 `default_authentication_plugin=mysql_native_password`。
4. 在8.0中，不能直接利用 `GRANT` 创建新用户，需要手动先 `CREATE USER` 才能 `GRANT`，对应 `SQL_MODE = NO_AUTO_CREATE_USER`。
5. 在8.0中，除了InnoDB引擎，其他引擎表都不支持原生PARTITION特性。
6. 默认字符集、校验集分别从 `latin1 & latin1_swedish_ci` 升级成 `utf8mb4 & utf8mb4_0900_ai_ci`。**注意** ，在5.7版本中，`utf8mb4` 默认的校验集是 `utf8mb4_general_ci`，而在8.0中，对应的默认校验集则变成 `utf8mb4_0900_ai_ci`。如果有数据库、表、存储函数等数据对象没有显式声明校验集的话，注意是否发生变化。

只要注意上述这几点区别，做到心中有数，升级到8.0就不慌了。

升级的方法有以下几种可选。

### 原地升级

如果数据库能停机维护，则采用原地升级（in-place upgrade）方法最为简单。

备份完成后，关闭数据库实例，在关闭数据库实例前，务必确保设置选项 `innodb_fast_shutdown=0`，以确保得到的是个干净的、正常关闭的数据库文件集。

首先修改 `my.cnf`，增加一行
```
upgrade = FORCE
```

然后修改正确的 `basedir` 指向新版本二进制文件路径，再次启动GreatSQL 8.0服务，即可实现自动升级，除了系统表，用户表也会全部升级。

**注意：** 这种方法不支持从5.6版本直接升级到8.0。

升级过程的日志输入类似下面这样：
```
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80025' started.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80025' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.0.32-25'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 25, Revision db07cc5cb73.
```

是不是觉得有点惊喜，有点意外，怎么怎么简单，事实的确如此。

如果有强迫症的话，想要看到完整升级过程，还可以加上两个选项 `log_error_verbosity=3` 以及 `innodb_print_ddl_logs = ON`，输出的日志就会多很多：
```
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[Note] [MY-011088] [Server] Data dictionary initializing version '80023'.
[Note] [MY-010337] [Server] Created Data Dictionary for upgrade
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-010006] [Server] Using data dictionary with version '80023'.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80025' started.
[Note] [MY-013386] [Server] Running queries to upgrade MySQL server.
...
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=1, thread_id=5, table_id=1072, new_file_path=mysql/default_roles
]
[Note] [MY-012478] [InnoDB] DDL log delete : 1
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=2, thread_id=5, space_id=4294967294, index_id=57, page_no=542]
[Note] [MY-012478] [InnoDB] DDL log delete : 2
[Note] [MY-012485] [InnoDB] DDL log post ddl : begin for thread id : 5
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 5
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=3, thread_id=5, table_id=1073, new_file_path=mysql/role_edges]
[Note] [MY-012478] [InnoDB] DDL log delete : 3
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=4, thread_id=5, space_id=4294967294, index_id=58, page_no=543]
[Note] [MY-012478] [InnoDB] DDL log delete : 4
[Note] [MY-012485] [InnoDB] DDL log post ddl : begin for thread id : 5
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 5
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=744, thread_id=5, table_id=1171, new_file_path=mysql/help_relation]
...
[Note] [MY-012478] [InnoDB] DDL log delete : 744
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=745, thread_id=5, space_id=4294967294, index_id=189, page_no=1183]
[Note] [MY-012478] [InnoDB] DDL log delete : 745
[Note] [MY-012485] [InnoDB] DDL log post ddl : begin for thread id : 5
[Note] [MY-012479] [InnoDB] DDL log replay : [DDL record: DROP, id=743, thread_id=5, table_id=1146]
[Note] [MY-012479] [InnoDB] DDL log replay : [DDL record: FREE, id=742, thread_id=5, space_id=4294967294, index_id=156, page_no=835]
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 5
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'greatsql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80025' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.0.32-25'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 25, Revision db07cc5cb73.
```
这样就完成升级了，非常便捷省事。

### 滚动升级

可借助主从复制或MGR架构，利用滚动升级方法，先在从节点升级验证无误后，再升级主节点，最终实现所有节点都升级到GreatSQL 8.0版本。

具体可参考文章：[MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)。根据该文章提供的思路，把MySQL 5.7平滑升级到GreatSQL 5.7之后，仍旧采用同样方法升级到GreatSQL 8.0版本。

最后要注意检查升级过程中输出的日志是否有报错信息，如果没有就说明升级过程很顺利。

确定升级完成后，记得注释掉 `my.cnf` 文件中的 `upgrade = FORCE` 选项，或者将其修改成 `upgrade = AUTO`。

## 升级GreatSQL 8.0.25到8.0.32 
GreatSQL 8.0.32相对于8.0.25版本，新增了更多SQL语法兼容性、MGR层支持绑定VIP、支持并行LOAD DATA、在安全方面支持国密加密&备份加密等非常不错的特性，强烈建议升级到最新的GreatSQL 8.0.32版本。

从GreatSQL 8.0.25升级到8.0.32版本过程较为简单：

1. 下载最新[GreatSQL 8.0.32二进制包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25)，并解压缩到相应目录下。

2. 在数据库维护期间关闭GreatSQL 8.0.25版本数据库。关闭前，先执行 `SET GLOBAL innodb_fast_shutdown = 0`，确保停机时得到一份完整、干净的数据文件。

3. 修改my.cnf，调整basedir，指向新版本二进制包路径。可参考这份[my.cnf模板](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-25)。

4. 重启新的GreatSQL 8.0.32版本数据库服务进程，即可实现原地升级（in-place upgrade），可以看到日志中有类似下面的内容：
```
[Note] [MY-013327] [Server] MySQL server upgrading from version '80025' to '80032'.
[Note] [MY-012357] [InnoDB] Reading DD tablespace files
[Note] [MY-012356] [InnoDB] Scanned 7 tablespaces. Validated 7.
[Note] [MY-010006] [Server] Using data dictionary with version '80023'.
[Note] [MY-011323] [Server] Plugin mysqlx reported: 'X Plugin ready for connections. socket: '/tmp/mysqlx.sock''
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' started.
[Note] [MY-013386] [Server] Running queries to upgrade MySQL server.
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' completed.
```

5. 如果设置选项 `innodb_print_ddl_logs=1`，则还能看到升级过程中有大量的DDL升级记录，例如：
```
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' started.
[Note] [MY-013386] [Server] Running queries to upgrade MySQL server.
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=6, thread_id=6, table_id=1062, new_file_path=mysql/replication_group_member_actions]
[Note] [MY-012478] [InnoDB] DDL log delete : 6
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=7, thread_id=6, space_id=4294967294, index_id=156, page_no=1111]
...
[Note] [MY-012479] [InnoDB] DDL log replay : [DDL record: FREE, id=792, thread_id=6, space_id=4294967294, index_id=259, page_n
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 6
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' completed.
```
这样就可以很方便完成原地升级GreatSQL版本。

**提醒：** 由于从MySQL 8.0.26开始新增选项 `group_replication_view_change_uuid`，因此不支持在一个MGR集群中，同时包含8.0.26以前及以后的版本。例如：在MGR集群中，不能并存8.0.25和8.0.26版本。这种情况下，版本号是8.0.25的MGR集群想要升级到8.0.32，就需要新建一个8.0.32版本的MGR集群，两个集群间再构建异步（或半同步）复制通道，采用这种方式才能实现平滑升级迁移，否则只能是安排离线停机维护时间，才能完成升级。

**参考文档**

- [Percona Server for MySQL In-Place Upgrading Guide: From 5.7 to 8.0](https://docs.percona.com/percona-server/latest/upgrading_guide.html)
- [Changes in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html)
- [Before You Begin](https://dev.mysql.com/doc/refman/8.0/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.0/en/upgrading-what-is-upgraded.html)
- [MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
