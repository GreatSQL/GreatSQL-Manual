# Changes in GreatSQL 8.4.4-4 (2025-9-30)

## 版本信息

- 发布时间：2025年9月30日

- 版本号：8.4.4-4, Revision aa66a385910

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4)

- 用户手册：[GreatSQL 8.4.4-4 User Manual](https://greatsql.cn/docs/8.4.4-4/)

##  特性增强

GreatSQL 8.4.4.-4版本在Percona Server for MySQL 8.4.4-4版本的基础上，主要在 **高可用**、**高性能**、**高兼容**、**高安全**四个方面进行了多项特性增强，使得 GreatSQL 可在普通硬件上满足金融级应用场景，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

### [高可用](../../5-enhance/5-2-ha.md)

针对 MGR 及主从复制进行了大量改进和提升工作，支持 地理标签、仲裁节点、读写动态 VIP、快速单主模式、智能选主 等特性，并针对 流控算法、事务认证队列清理算法、节点加入&退出机制、recovery机制、大事务传输压缩等多个 MGR 底层工作机制算法进行深度优化，进一步提升优化了 MGR 的高可用保障及性能稳定性。

- 支持 [地理标签](../../5-enhance/5-2-ha-mgr-zoneid.md) 特性，提升多机房架构数据可靠性。
- 支持 [仲裁节点](../../5-enhance/5-2-ha-mgr-arbitrator.md) 特性，用更低的服务器成本实现更高可用。
- 支持 [读写动态 VIP](../../5-enhance/5-2-ha-mgr-vip.md) 特性，高可用切换更便捷，更快实现读负载均衡。支持 [当主节点切换时，主动关闭当前活跃连接](../../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md)，缩短应用端不可用时长。。
- 支持 [快速单主模式](../../5-enhance/5-2-ha-mgr-fast-mode.md)，在单主模式下更快，性能更高。
- 支持 [智能选主](../../5-enhance/5-2-ha-mgr-election-mode.md) 特性，高可用切换选主机制更合理。
- 优化 [流控算法](../../5-enhance/5-2-ha-mgr-new-fc.md)，使得事务更平稳，避免剧烈抖动。
- 支持 [记录 MGR 网络通信开销超过阈值的事件](../../5-enhance/5-2-ha-mgr-request-time.md)，用于进一步分析和优化。
- 支持自动选择从最新事务数据的成员节点复制数据，可有效提升 Clone 速度，提高 MGR 的服务可靠性。
- 在主从复制中，从节点向主节点发起 Binlog 读取请求时支持限速控制。
- 优化了 [asynchronous connection failover](https://dev.mysql.com/doc/refman/8.0/en/replication-asynchronous-connection-failover.html) 中的故障检测效率，降低主从复制链路断开的时间，提高整体可用性。
- 支持在跨机房容灾场景中的 [主主双向复制防止回路](../../5-enhance/5-2-ha-repl-server-mode.md) 机制。
- 优化了 MGR 节点加入、退出时可能导致性能剧烈抖动的问题。
- 解决了个别节点上磁盘空间爆满时导致MGR集群整体被阻塞的问题。
- 优化了 MGR 事务认证队列清理算法，高负载下不复存在每 60 秒性能抖动问题。
- 解决了 MGR 中长事务造成无法选主的问题。
- 修复了 MGR recovery 过程中长时间等待的问题。
- 优化了MGR大事务传输时压缩超过限制的处理机制。

更多信息详见文档：[高可用](../../5-enhance/5-2-ha.md)。

### [高性能](../../5-enhance/5-1-highperf.md)
相对 MySQL 及 Percona Server For MySQL 的性能表现更稳定优异，支持 Rapid 引擎、Turbo引擎、事务无锁化、并行 LOAD DATA、异步删除大表、线程池、非阻塞式 DDL、NUMA 亲和调度优化 等特性，在 [TPC-C 测试中相对 MySQL 性能提升超过 30%](./10-optimize/3-5-benchmark-greatsql-vs-mysql-tpcc-report.md)，在 [TPC-H 测试中的性能表现是 MySQL 的十几倍甚至上百倍](./10-optimize/3-3-benchmark-greatsql-tpch-report.md)。

- 支持 [大规模并行、基于内存查询、高压缩比的高性能 Rapid 引擎](../../5-enhance/5-1-highperf-rapid-engine.md)，可将数据分析性能提升几个数量级。
- 支持 [高性能并行查询引擎Turbo](../../5-enhance/5-1-highperf-turbo-engine.md)，使GreatSQL具备多线程并发的向量化实时查询功能。
- 优化 InnoDB 事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP 场景整体性能提升约 20%。
- 支持 [并行 LOAD DATA](../../5-enhance/5-1-highperf-parallel-load.md)，适用于频繁导入大批量数据的应用场景，性能可提升约 20 多倍；对于无显式定义主键的场景亦有优化提升。
- 支持 [异步删除大表](../../5-enhance/5-1-highperf-async-purge-big-table.md)，提高 InnoDB 引擎运行时性能的稳定性。
- 支持 [线程池](../../5-enhance/5-1-highperf-thread-pool.md)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。
- 支持 [非阻塞式 DDL](../../5-enhance/5-1-highperf-nonblocking-ddl.md)，可以避免数据库因为必须尽快完成 DDL 操作而导致业务请求大量被阻塞的问题。
- 支持 [NUMA 亲和性优化](../../5-enhance/5-1-highperf-numa-affinity.md)，通过 NUMA 亲和性调度优化，将前端用户线程和后台线程绑定到固定 NUMA 节点上以提升线程处理性能。

更多信息详见文档：[高性能](../../5-enhance/5-1-highperf.md)。

### [高兼容](../../5-enhance/5-3-easyuse.md)

GreatSQL 实现 100% 完全兼容 MySQL 及 Percona Server For MySQL 语法，支持大多数常见 Oracle 语法，包括 [数据类型兼容](../../5-enhance/5-3-easyuse.md#数据类型兼容)、[函数兼容](../../5-enhance/5-3-easyuse.md#函数兼容)、[SQL 语法兼容](../../5-enhance/5-3-easyuse.md#sql语法兼容)、[存储程序兼容](../../5-enhance/5-3-easyuse.md#存储程序兼容) 等众多兼容扩展用法。

更多信息详见文档：[高兼容](../../5-enhance/5-3-easyuse.md)。

### [高安全](../../5-enhance/5-4-security.md)

GreatSQL 支持逻辑备份加密、CLONE 备份加密、审计、表空间国密加密、敏感数据脱敏、存储登录历史等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

- 支持 [mysqldump 逻辑备份加密](../../5-enhance/5-4-security-mysqldump-encrypt.md)，提供了利用 mysqldump 逻辑备份的安全加密需求。
- 支持 [Clone 备份加密](../../5-enhance/5-4-security-clone-encrypt.md)，提供了利用 Clone 物理备份的安全加密需求。
- 支持 [审计功能](../../5-enhance/5-4-security-audit.md)，及时记录和发现未授权或不安全行为。
- 支持 [InnoDB 表空间国密加密算法](../../5-enhance/5-4-security-encrypt-with-gmssl.md)，确保重要数据的加密安全。
- 支持 [基于函数和策略的两种数据脱敏](../../5-enhance/5-4-security-data-masking.md) 工作方式，保障敏感用户数据查询结果保密性。
- 支持 [存储登录历史](../../5-enhance/5-4-security-last-login.md)，便于管理员查询，进一步提升数据库安全性。

通过上述多个安全提升特性，进一步保障业务数据安全。更多信息详见文档：[高安全](../../5-enhance/5-4-security.md)。

### [其他](../../5-enhance/5-5-others.md)
- 支持 [Clone 在线全量热备、增备及恢复](../../5-enhance/5-5-clone-compressed-and-incrment-backup.md)，结合 Binlog 可实现恢复到指定时间点。此外，Clone 备份还支持压缩功能。
- 支持 [InnoDB Page透明压缩采用Zstd算法](../../5-enhance/5-5-innodb-page-compression.md)，进一步提高数据压缩率，尤其是当有大量长文本重复数据时。

## 注意事项

从8.0升级到8.4版本，对现有运维管控系统最大的影响是，原先包含 `MASTER/SLAVE` 关键字的指令不再可用，相应的主要改动详见下表

| 旧指令 | 新指令 |
| :--- | :--- | 
| START SLAVE       | START REPLICA |
| STOP SLAVE        | STOP REPLICA  | 
| SHOW SLAVE STATUS | SHOW REPLICA STATUS |
| SHOW SLAVE HOSTS  | SHOW REPLICAS |
| RESET SLAVE  	    | RESET REPLICA |
| CHANGE MASTER TO  | CHANGE REPLICATION SOURCE TO |
| RESET MASTER      | RESET BINARY LOGS AND GTIDS  |
| SHOW MASTER STATUS| SHOW BINARY LOG STATUS |
| PURGE MASTER LOGS | PURGE BINARY LOGS |
| SHOW MASTER LOGS  | SHOW BINARY LOGS |

此外，原来在 `CHANGE MASTER`（新的指令 `CHANGE REPLICATION SOURCE TO`） 以及 `START SLAVE`（新的指令 `START REPLICA`） 中相关的参数变量也同样发生变化，详见下表

| 旧参数名 | 新参数名 |
| :--- | :--- |
| MASTER_AUTO_POSITION    | SOURCE_AUTO_POSITION |
| MASTER_HOST             | SOURCE_HOST |
| MASTER_BIND             | SOURCE_BIND |
| MASTER_USER             | SOURCE_USER |
| MASTER_PASSWORD         | SOURCE_PASSWORD |
| MASTER_PORT             | SOURCE_PORT | 
| MASTER_CONNECT_RETRY    | SOURCE_CONNECT_RETRY |
| MASTER_RETRY_COUNT      | SOURCE_RETRY_COUNT |
| MASTER_DELAY            | SOURCE_DELAY | 
| MASTER_SSL              | SOURCE_SSL | 
| MASTER_SSL_CA           | SOURCE_SSL_CA | 
| MASTER_SSL_CAPATH       | SOURCE_SSL_CAPATH | 
| MASTER_SSL_CIPHER       | SOURCE_SSL_CIPHER | 
| MASTER_SSL_CRL          | SOURCE_SSL_CRL | 
| MASTER_SSL_CRLPATH      | SOURCE_SSL_CRLPATH | 
| MASTER_SSL_KEY          | SOURCE_SSL_KEY | 
| MASTER_SSL_VERIFY_SERVER_CERT | SOURCE_SSL_VERIFY_SERVER_CERT | 
| MASTER_TLS_VERSION      | SOURCE_TLS_VERSION | 
| MASTER_TLS_CIPHERSUITES | SOURCE_TLS_CIPHERSUITES | 
| MASTER_SSL_CERT         | SOURCE_SSL_CERT | 
| MASTER_PUBLIC_KEY_PATH  | SOURCE_PUBLIC_KEY_PATH | 
| GET_MASTER_PUBLIC_KEY   | GET_SOURCE_PUBLIC_KEY | 
| MASTER_HEARTBEAT_PERIOD | SOURCE_HEARTBEAT_PERIOD | 
| MASTER_COMPRESSION_ALGORITHMS | SOURCE_COMPRESSION_ALGORITHMS | 
| MASTER_ZSTD_COMPRESSION_LEVEL | SOURCE_ZSTD_COMPRESSION_LEVEL | 
| MASTER_LOG_FILE         | SOURCE_LOG_FILE | 
| MASTER_LOG_POS          | SOURCE_LOG_POS |

执行 SQL 命令 `SHOW [GLOBAL] STATUS` 的结果中，也有部分状态变量发生变化，详见下表

| 旧状态变量名 | 新状态变量名 | 
| :--- | :--- |
| Com_slave_start  | Com_replica_start | 
| Com_slave_stop   | Com_replica_stop | 
| Com_show_slave_status  | Com_show_replica_status | 
| Com_show_slave_hosts   | Com_show_replicas | 
| Com_show_master_status | Com_show_binary_log_status | 
| Com_change_master      | Com_change_replication_source |

## 升级/降级到 GreatSQL 8.4.4-4

### 升级到 GreatSQL 8.4.4-4
- 如果是 GreatSQL 5.7.*等系列版本，可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.0.32-27 版本后，确认升级成功后，再次在原来 `datadir`基础上继续升级，即修改`basedir`指向 GreatSQL 8.4.4-4新版本，之后就能完成自动升级。需要注意的是，从5.7版本升级到8.0版本，再升级到8.4版本后，数据库中的账号仍采用`mysql_native_password`密码验证插件。当最终升级到8.4版本后，需要修改my.cnf配置文件，加上`mysql_native_password=1`，以保证原有的账号能正常登录。
- 如果是 GreatSQL 8.0.*等系列版本，并且没有使用Rapid引擎，则可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.4.4-4 后会完成自动升级。
- 如果旧版本是 GreatSQL 8.0.32-27 且已启用Rapid引擎，可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.4.4-4 后会完成自动升级。
- 如果旧版本是 GreatSQL 8.0.32-25或8.0.32-26 且已启用Rapid引擎，**这种情况下无法原地升级**，需要卸载所有Rapid引擎表，删除Rapid数据文件，之后才可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.4.4-4后会完成自动升级。新版本实例启动后，对所有Rapid引擎表执行`ALTER TABLE SECONDARY_LOAD`完成全量数据导入，再执行`SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK()`启动增量导入任务，完成Rapid引擎表升级工作。下面是一个升级参考过程：

  1. 查询并记录所有Rapid引擎表
  
  可以执行下面的SQL，查询当前有哪些表使用了Rapid引擎：
  
  ```sql
  greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE CREATE_OPTIONS LIKE '%Rapid%';
  +--------------+----------------+------------+
  | TABLE_SCHEMA | TABLE_NAME     | TABLE_ROWS |
  +--------------+----------------+------------+
  | tpch100g     | customer       |   14854987 |
  | tpch100g     | lineitem       |  582868392 |
  | tpch100g     | nation         |         25 |
  | tpch100g     | orders         |  148492582 |
  | tpch100g     | part           |   19943155 |
  | tpch100g     | partsupp       |   79832625 |
  | tpch100g     | region         |          5 |
  | tpch100g     | supplier       |     989416 |
  +--------------+----------------+------------+
  ```
  
  2. 正常停止GreatSQL实例进程
  
  在停止GreatSQL实例进程前，先修改`innodb_fast_shutdown=0`后再执行`SHUTDOWN`停止实例
  
  ```sql
  greatsql> SET GLOBAL innodb_fast_shutdown=0;
  greatsql> SHUTDOWN;
  ```
  
  3. 删除旧的Rapid引擎数据文件
  
  ```bash
  cd /data/GreatSQL && rm -f duckdb*
  ```
  
  4. 修改`my.cnf`配置文件中的`basedir`参数，指向GreatSQL 8.4.4-4新版本
  
  ```ini
  #my.cnf
  [mysqld]
  basedir=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
  ```
  并确保参数`upgrade`不是设置为*NONE*。
  
  5. 启动GreatSQL 8.4.4-4新版本实例
  
  ```bash
  systemctl start greatsql
  ```
  
  6. 重新安装Rapid引擎
  
  ```sql
  greatsql> INSTALL PLUGIN rapid SONAME 'ha_rapid.so';
  ```
  
  7. 对Rapid引擎表做一次全量数据导入
  
  ```sql
  greatsql> ALTER TABLE test.t1 SECONDARY_LOAD;
  ```
  
  ::: tip 小贴士
  由于在升级前没有去掉该表的`SECONDARY_ENGINE=rapid`属性，所以无需重新设置。如果在升级前卸载所有Rapid引擎表，则需要重新设置。
  :::
  
  8. 再次启动增量导入任务
  
  ```sql
  greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('test', 't1');
  ```
  这就完成Rapid引擎表的升级操作了。

- 如果是 MySQL 5.7.*、Percona Server 5.7.* 等系列版本，可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.0.32-27 版本后，确认升级成功后，再次在原来 `datadir`基础上继续升级，即修改`basedir`指向 GreatSQL 8.4.4-4新版本，之后就能完成自动升级。需要注意的是，从5.7版本升级到8.0版本，再升级到8.4版本后，数据库中的账号仍采用`mysql_native_password`密码验证插件。当最终升级到8.4版本后，需要修改my.cnf配置文件，加上`mysql_native_password=1`，以保证原有的账号能正常登录。
- 如果是 MySQL 8.0.*、Percona Server 8.0.* 等系列版本，则可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.4.4-4 后会完成自动升级。
- 其他情况下，最好采用导入逻辑备份文件方式升级到 GreatSQL 8.4.4-4版本。

在以上几个原地升级场景中，务必保证`my.cnf`中参数`upgrade`不能设置为*NONE*，可以设置为默认的*AUTO*或*FORCE*。例如：

```ini
#my.cnf
[mysqld]
upgrade = AUTO
```

更多迁移升级方案请参考：[迁移升级](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md)。

### 降级到 GreatSQL 8.4.4-4

如果是要从 MySQL/Percona 8.4.* 系列较高的小版本降级到 GreatSQL 8.4.4-4 版本，可以采用原地降级方式快速完成版本降级操作。即可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.4.4-4 后会完成自动降级。

如果是要从 MySQL/Percona 9.0 及之后的版本降级到 GreatSQL 8.4.4-4 版本，则需要采取逻辑备份 + 逻辑导入方式完成降级操作，并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade = FORCE` 强制升级所有数据表，包括系统表。

降级过程操作大致如下所示：

1. 在高版本中逻辑备份全量数据
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

2. 在GreatSQL 8.4.4-4版本环境中导入逻辑备份文件，完成逻辑恢复

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

3. 修改`my.cnf`，确保设置`upgrade=FORCE`
```ini
#my.cnf
[mysqld]
upgrade = FORCE
```

4. 重启GreatSQL，降级完成

```bash
systemctl restart greatsql
```
重启过程中，可以看到日志有类似下面的强制降级过程

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-014064] [Server] Server downgrade from '80406' to '80404' started.
[System] [MY-014064] [Server] Server downgrade from '80406' to '80404' completed.
```

如果不设置 `upgrade = FORCE` 强制升级所有表，有可能发生系统表 `mysql.procs_priv` 损坏错误，在创建用户时可能会报告类似下面的错误：

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## GreatSQL vs MySQL

| **1.主要特性** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
| :--- | :---: | :---: |
| 开源 |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID 完整性| :heavy_check_mark: | :heavy_check_mark: |
|MVCC 特性| :heavy_check_mark:     | :heavy_check_mark: |
|支持行锁| :heavy_check_mark: | :heavy_check_mark: |
|Crash 自动修复| :heavy_check_mark: | :heavy_check_mark: |
|表分区（Partitioning）| :heavy_check_mark: | :heavy_check_mark: |
|视图（Views）| :heavy_check_mark: | :heavy_check_mark: |
|子查询（Subqueries）| :heavy_check_mark: | :heavy_check_mark: |
|触发器（Triggers）| :heavy_check_mark: | :heavy_check_mark: |
|存储程序（Stored Programs）| :heavy_check_mark: | :heavy_check_mark: |
|外键（Foreign Keys）| :heavy_check_mark: | :heavy_check_mark: |
|窗口函数（Window Functions）| :heavy_check_mark: | :heavy_check_mark: |
|通用表表达式 CTE| :heavy_check_mark: | :heavy_check_mark: |
|地理信息（GIS）| :heavy_check_mark: | :heavy_check_mark: |
|基于 GTID 的复制| :heavy_check_mark: | :heavy_check_mark: |
|组复制（MGR）| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks 引擎| :heavy_check_mark: | ❌ |
|支持龙芯架构| :heavy_check_mark: | ❌ |
| **2. 性能提升扩展** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|Rapid 引擎| :heavy_check_mark: | 仅云上HeatWave |
|Turbo 引擎| :heavy_check_mark: | ❌ |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入优化 | :heavy_check_mark: | ❌ |
|并行 LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB 事务 ReadView 无锁优化| :heavy_check_mark: | ❌ |
|InnoDB 事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB Page压缩支持Zstd| :heavy_check_mark: | ❌ | 
|InnoDB 资源组| :heavy_check_mark: | :heavy_check_mark: |
|自定义 InnoDB 页大小| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes 拆分优化| :heavy_check_mark: | ❌ |
|MEMORY 引擎优化| :heavy_check_mark: | ❌ |
|InnoDB Flushing 优化| :heavy_check_mark: | ❌ |
|并行 Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 快速索引创建优化| :heavy_check_mark: | ❌ |
|VARCHAR/BLOB/JSON 类型存储单列压缩| :heavy_check_mark: | ❌ |
|数据字典中存储单列压缩信息| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|MGR 提升-地理标签| :heavy_check_mark: | ❌ |
|MGR 提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR 提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR 提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR 提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR 提升-全新流控算法| :heavy_check_mark: | ❌ |
|MGR 提升-网络分区异常处理 |  :heavy_check_mark: | ❌ |
|MGR 提升-节点异常退出处理 | :heavy_check_mark: | ❌ |
|MGR 提升-节点磁盘满处理 | :heavy_check_mark: | ❌ |
|MGR 提升-自动选择 donor 节点| :heavy_check_mark: | ❌ |
|MGR 提升-大事务压缩优化| :heavy_check_mark: | ❌ |
|Clone 增量备份| :heavy_check_mark: | ❌ |
|Clone 备份压缩| :heavy_check_mark: | ❌ |
|Binlog 读取限速| :heavy_check_mark: | ❌ |
|information_schema 表数量|95|65|
|全局性能和状态指标|853|434|
|优化器直方图（Histograms）| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table 性能指标| :heavy_check_mark: | ❌ |
|Per-Index 性能指标| :heavy_check_mark: | ❌ |
|Per-User 性能指标| :heavy_check_mark: | ❌ |
|Per-Client 性能指标| :heavy_check_mark: | ❌ |
|Per-Thread 性能指标| :heavy_check_mark: | ❌ |
|全局查询相应耗时统计| :heavy_check_mark: | ❌ |
|SHOW ENGINE INNODB STATUS 增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log 信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计| :heavy_check_mark: | 仅企业版 |
|数据脱敏| :heavy_check_mark: | ❌ |
|最后登录记录| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2 密码Hashing| :heavy_check_mark: | :heavy_check_mark: |
|密码轮换策略| :heavy_check_mark: | :heavy_check_mark: |
|PAM 认证插件| :heavy_check_mark: | 仅企业版 |
|Keyring 存储在文件中| :heavy_check_mark: | :heavy_check_mark: |
|Keyring 存储在Hashicorp Vault中| :heavy_check_mark: | 仅企业版 |
|InnoDB 数据加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 日志加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 各种表空间文件加密| :heavy_check_mark: | :heavy_check_mark: |
|二进制日志加密| :heavy_check_mark: | ❌ |
|临时文件加密| :heavy_check_mark: | ❌ |
|强制加密| :heavy_check_mark: | ❌ |
| **6. 运维便利性提升** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|DDL 原子性| :heavy_check_mark: | :heavy_check_mark: |
|数据字典存储 InnoDB 表| :heavy_check_mark: | :heavy_check_mark: |
|快速 DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|不可见索引| :heavy_check_mark: | :heavy_check_mark: |
|线程池（Threadpool）| :heavy_check_mark: | 仅企业版 |
|备份锁| :heavy_check_mark: | ❌ |
|SHOW GRANTS 扩展| :heavy_check_mark: | ❌ |
|表损坏动作扩展| :heavy_check_mark: | ❌ |
|杀掉不活跃事务| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT 扩展| :heavy_check_mark: | ❌ |

GreatSQL 8.4.4-4 基于 Percona Server for MySQL 8.4.4-4 版本，它在 MySQL 8.4.4 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.4/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等 MySQL 企业版才有的特性，以及 performance_schema 提升、information_schema 提升、性能和可扩展性提升、用户统计增强、PROCESSLIST 增强、Slow Log 增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.4
- [Changes in GreatSQL 8.4.4-4 (2025-9-30)](changes-greatsql-8444.md)

### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-27 (2025-3-10)](changes-greatsql-8-0-32-27.md)
- [Changes in GreatSQL 8.0.32-26 (2024-8-5)](changes-greatsql-8-0-32-26-20240805.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)


**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
