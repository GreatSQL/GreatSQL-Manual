# GreatSQL 8.0升级到8.4
---

本文介绍如何从GreatSQL 8.0 版本升级到 GreatSQL 8.4 版本。

## 为什么要升级

MySQL 8.4 是第一个长期支持版本（LTS），基于此的 GreatSQL 8.4 相对于 GreatSQL 8.0 有多项新特性以及变化，包括且不仅限以下：

- **InnoDB引擎相关**

多个 InnoDB 主要参数（没有全部列出）的默认值发生变化。

| 参数名 | 8.4 默认值 | 8.0 默认值 |
| :--- | :---: | :---: |
| innodb_buffer_pool_in_core_file | 支持 MADV_DONTDUMP 时默认 OFF，其他情况下默认 ON | ON |
| innodb_buffer_pool_instances | 当 IBP <= 1GB 时为 1，当 IBP > 1GB 时会根据公式自动计算 | 8，当 IBP <= 1GB 时为 1|
| innodb_change_buffering | none | all |
| innodb_adaptive_hash_index | OFF | ON |
| innodb_doublewrite_files | 2 | innodb_buffer_pool_instances*2 |
| innodb_flush_method（Linux系统中） | 系统支持时为 O_DIRECT，否则 fsync | fsync |
| innodb_io_capacity | 1000 | 200 |
| innodb_io_capacity_max | innodb_io_capacity*2 | innodb_io_capacity*2，且最小值为 2000 |
| innodb_log_buffer_size | 64MB | 16MB |
| innodb_numa_interleave | ON | OFF|
| innodb_page_cleaners | innodb_buffer_pool_instances | 4 |
| innodb_parallel_read_threads | CPU逻辑核数/8，默认最低为 4 | 4 |
| innodb_purge_threads | CPU逻辑核数 <=16 时为 1，否则为 4 |  4 |
| innodb_read_io_threads | CPU逻辑核数/8，默认最低为 4 | 4 |
| innodb_use_fdatasync | ON | OFF |

- **临时表相关**

临时表相关几个参数的默认值也发生变化。

| 参数名 | 8.4 默认值 | 8.0 默认值 |
| :--- | :---: | :---: |
| temptable_max_ram | 物理内存 * 3%，且默认值的范围在 1-4GB 间 | 1GB |
| temptable_max_mmap | 0（禁用） | 1GB |
| temptable_use_mmap | OFF | ON，从 8.0.26 开始提示即将弃用 |

- **MGR 相关**

  - 1. 有两个 MGR 参数默认值发生变化：事务一致性级别参数 `group_replication_consistency` 从 *EVENTUAL* 调整为 *BEFORE_ON_PRIMARY_FAILOVER*；节点退出后的默认行为参数 `group_replication_exit_state_action` 从 *READ_ONLY* 调整为 *OFFLINE_MODE*。
  - 2. 在 MGR 中切换新的主节点时，需要等待当前的 DDL 操作（例如 `ALTER TABLE`）以及大部分 DCL 操作（例如 `ALTER DATABASE`）结束才能继续。
  - 3. 对 MGR 的版本兼容约束也放宽了，支持相同大版本内的小版本原地降级（例如从 8.4.2 原地降级到 8.4.0）；另外，只要是大版本号相同，小版本号不同的多个节点也可以混跑（例如在 8.4.0、8.4.2、8.4.3 三个不同小版本号的节点可以在一起跑 MGR）。
  - 4. 在 MGR 中新增参数 `group_replication_preemptive_garbage_collection`，设置为 *ON* 时，在单主模式下会启用了抢占式 GC（garbage collection），仅保留尚未提交的事务 writeset。这可以节省时间和内存消耗。同时新增 `group_replication_presemptive_garbage_collection_rows_threshold` 参数用于设置了触发抢占式 GC 所需的认证事务数最小值，默认为 100000。

- **主从复制及 Clone 相关**
  - 1. Clone 插件不再严格要求连小版本号也要一致才行，允许在同一个大版本内进行克隆。这个特性不错，希望未来能继续提升兼容性，支持在不同大版本间 Clone 数据。
  - 2. 在主从复制中，参数 `SOURCE_RETRY_COUNT` 默认值从 86400 调整为 10。即默认行为是 重试 10 次，每次间隔 60 秒，总共 10 分钟。在 8.0 中默认行为是重试 86400 次，每次间隔 60 秒，总共 60 天（这也太过于疯狂了吧 ~~）。
  - 3. 支持对 GTID 事务设置不同的 tag（标签），这对于运维很友好，比如针对一些特殊操作加上特别的标签便于后续区分。
  - 4. 在从服务器上执行 `START REPLICA` 启动复制线程时，子句 `SQL_AFTER_GTIDS` 支持多线程并行回放工作模式。在以前，启用多线程并行回放时，如果加上 `SQL_AFTER_GTIDS` 会提示 *ER_MTA_FEATURE_IS_NOT_SUPPORTED* 告警，并自动切换到单线程回放模式。

- **其他**
  - 1. 无论是否执行了 `ANALYZE TABLE` 操作，都支持自动更新直方图统计信息，自动更新的规则和 InnoDB 表统计信息自动更新规则一样，详情参考 [`innodb_stats_auto_recalc` 参数](https://dev.mysql.com/doc/refman/8.4/en/innodb-persistent-stats.html#innodb-persistent-stats-auto-recalc) 以及 [MySQL 8.4新特性之直方图自动更新](https://mp.weixin.qq.com/s/IWSMjRwye7xozJ3iwIdYtg)。
  - 2. 默认地，禁用 **mysql_native_password** 认证插件，如果需要兼容旧的应用程序，需要在配置文件中增加相应的参数：`mysql_native_password=ON`。
  - 3. 在 **mysqldump** 中增加 `--output-as-version` 参数，支持设置对旧版本的兼容性模式。
  - 4. 针对 `FLUSH PRIVILEGES` 新增相应的授权 *FLUSH_PRIVILEGES*。
  - 5. 新增一些保留关键字：`AUTO, BERNOULLI, GTIDS, LOG, MANUAL, PARALLEL, PARSE_TREE, QUALIFY, S3, TABLESAMPLE`，这些保留关键字不可用于库、表、字段等数据库对象名称。

- **弃用或不再建议使用的特性、参数**

  下面是未来准备弃用的一些特性及参数

  - 1. 参数 `binlog_transaction_dependency_tracking`，因为已经总是使用 *WRITESET* 机制。
  - 2. 参数 `group_replication_allow_local_lower_version_join`。
  - 3. 从 8.3.0 开始，MGR 组成员元数据信息会在各节点间共享，因此不再需要依赖组视图变化事件，相应地，参数 `group_replication_view_change_uuid` 也不再需要。
  - 4. 废弃函数 `WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS()`。
  - 5. 在主从复制中如果已启用 GTID 模式，则已被应用的事务会自动被忽略，这意味着 `IGNORE_SERVER_IDS` 参数和 GTID 模式将不兼容。
  - 6. 废弃参数 `expire_logs_days`，改用 `binlog_expire_logs_seconds` 参数。
  - 7. 废弃参数 `group_replication_recovery_complete_at`。从 8.4.0 开始，分布式事务恢复过程中的策略始总是：只有在新成员接收、认证并应用了其加入组之前发生的所有事务后，才会标记在线；这相当于在早期版本中设置 `group_replication_recovery_complete_at = TRANSACTIONS_APPLIED` 同样的效果。
  - 8. 主从复制中大量 **MASTER/SLAVE** 关键字都不再支持，而改为 **SOURCE/REPLICA** 关键字。

总的来说，GreatSQL 8.4 看起来是作为 8.0 的延续并成为 LTS 版本。两个版本间的变化并不算太大，并且主要集中在 InnoDB 引擎方面。无论对开发者还是DBA来说都能很快适配和适应。有条件的话，建议都今早完成升级。

## 升级前准备

未来几个主要版本之间的 **升级、降级** 兼容关系表，作为选择具体哪个版本之前的重要参考之一（本表格内容摘自徐轶韬老师主理的公众号：**MySQL解决方案工程师**）：

- **升级**

| | 原地 | 克隆 | 异步复制 | 转储/加载 |
| :--- | :---: | :---: | :---: | :---: |
| LTS 8.4 → LTS 9.7 | ✓ | ✗ |✓ |✓ |
| LTS 8.4.11 → LTS 8.4.20 |✓ |✓ |✓ |✓ |
| Innovation 8.1 → 8.2 | ✓ | ✗ |✓ |✓ |
| Innovation 8.1 → 8.3 | ✓ | ✗ |✓ |✓ |
| Innovation 9.1 → LTS 9.7 | ✓ | ✗ |✓ |✓ |
| LTS 8.4 →  LTS 10.7 | ✗ | ✗ | ✗ | ✗ |

- **降级**

| | 原地 | 克隆 | 异步复制 | 转储/加载 |
| :--- | :---: | :---: | :---: | :---: |
| LTS 8.4.20 → 8.4.11 | ✓ | ✓ | ✓ | ✓ |
| LTS 9.7 → LTS 8.4 | ✗ | ✗ | ✓✮ | ✓✮ |
| LTS 9.7 → Innovation 9.6 | ✗ | ✗ | ✓✮ | ✓✮ |
| LTS 9.7 → Innovation 9.5 | ✗ | ✗ | ✓✮ | ✓✮ |

✮表示仅用于回滚目的。

### 注意事项

从GreatSQL 8.0版本升级到8.4，有以下相关注意事项，请认真核对是否产生冲突或不兼容：

1. 最好是先升级到 GreatSQL 8.0 最新版本，再升级到 8.4 的最新版本，不要从 5.6, 5.7 等版本直接升级到 8.4。
1. 默认采用 `caching_sha2_password` 密码插件，这可能导致部分版本较早的连接驱动、连接客户端无法连接服务端，也需要同步升级。
1. 新增保留字、关键字，详情请见：[2.6 保留字、关键字](../2-about-greatsql/7-greatsql-keywords.md)。
1. 部分参数选项不再支持，例如：`expire_logs_days`, `binlog_transaction_dependency_tracking`, `group_replication_allow_local_lower_version_join` 等。
1. 部分功能、函数不再支持，例如：`WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS` 等。
1. 主从复制中大量 **MASTER/SLAVE** 关键字都不再支持，而改为 **SOURCE/REPLICA** 关键字。

更多详情请见：[What Is New in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)。

### 升级准备

首先下载 GreatSQL 8.4 版本安装包，推荐选择最新的[GreatSQL 8.4.4-4版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-4)，至于选择RPM还是二进制包看具体情况及个人喜好。

本文假定升级前后都是二进制包方式安装。

正式升级之前，务必做好数据备份，可以采用以下几种方式：

1. 停机维护，复制当前的数据库目录，做一个全量物理备份，这种方式恢复起来最快。
2. 利用mysqldump/xtrabackup等备份工具，执行一个全量备份。
3. 利用主从复制或MGR，在其中一个节点执行备份，或者令某个节点临时下线/退出，作为备用节点。

## 升级过程

升级的方法有以下几种可选。

### 原地升级（推荐）

如果数据库能停机维护，则采用原地升级（in-place upgrade）方法最为简单。

备份完成后，关闭数据库实例，在关闭数据库实例前，务必确保设置选项 `innodb_fast_shutdown=0`，以确保得到的是个干净的、正常关闭的数据库文件集。

首先修改 `my.cnf` 配置文件，在 `[mysqld]` 区间中增加一行内容
```ini
upgrade=FORCE
```

然后修改正确的 `basedir` 指向新版本二进制文件路径，再次启动 GreatSQL 8.4 服务，即可实现自动升级，除了系统表，用户表也会全部升级。

**注意：** 这种方法不支持从 5.6, 5.7 版本直接升级到 8.4。

升级过程的日志输入类似下面这样：
```log
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' started.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.4.4-4'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 4, Revision d73de75905d.
```

如果想要看到完整升级过程，还可以加上两个选项 `log_error_verbosity=3` 以及 `innodb_print_ddl_logs=ON`，输出的日志就会多很多：

```log
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[Note] [MY-011088] [Server] Data dictionary initializing version '80032'.
[Note] [MY-010337] [Server] Created Data Dictionary for upgrade
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-010006] [Server] Using data dictionary with version '80032'.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' started.
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
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.4.4-4'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 4, Revision d73de75905d.
```

**建议**：在 GreatSQL 8.4 服务第一次启动完成后，先关闭后再次启动，以确保升级成功。

这样就完成升级了，非常便捷省事。

### 滚动升级

可借助主从复制或MGR架构，利用滚动升级方法，先在从节点升级验证无误后，再升级主节点，最终实现所有节点都升级到 GreatSQL 8.4 版本。

具体可参考文章：[MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)。根据该文章提供的思路，把MySQL 5.7平滑升级到GreatSQL 5.7之后，仍旧采用同样方法升级到 GreatSQL 8.4 版本。

最后要注意检查升级过程中输出的日志是否有报错信息，如果没有就说明升级过程很顺利。

升级完成后，记得注释掉 `my.cnf` 文件中的 `upgrade=FORCE` 选项，或者将其修改成 `upgrade=AUTO`。

**参考文档**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
