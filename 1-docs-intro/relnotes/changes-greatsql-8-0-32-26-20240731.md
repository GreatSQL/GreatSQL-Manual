# Changes in GreatSQL 8.0.32-26 (2024-07-31)

## 版本信息

- 发布时间：2024年07月31日

- 版本号：8.0.32-26, Revision xxxxxxxxxxx

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)

- 用户手册：[GreatSQL 8.0.32-26 User Manual](https://greatsql.cn/docs/8.0.32-26/)

##  特性增强

GreatSQL 8.0.32-26 版本在 **高可用**、**高性能**、**高兼容**、**高安全** 等多方面都有增强新特性，包括 Clone 增量备份、压缩备份，MGR 新加入成员节点时自动选择最新数据节点为 donor 节点，NUMA 亲和性优化，非阻塞式 DDL，无主键表导入优化，更多 Oracle 兼容用法，最后登录信息，基于规则的数据脱敏功能等多个新特性。

### 高可用
- 当有新成员节点加入 MGR 时，如果选择 Clone 方式复制数据，支持自动选择从最新事务数据的成员节点复制数据，可有效提升 Clone 速度，提高 MGR 的服务可靠性。当新加入节点触发 Clone 方式复制数据时，也支持该特性。

参数 `group_replication_donor_threshold` 用于定义选择 donor 节点时判断事务延迟阈值，取值范围 [1, MAX]，默认值为 MAX。MAX 值取决于 CPU 类型，在 32-bit 系统中是 2147483647（2^31-1），而在 64-bit 系统中是 9223372036854775807（2^63-1）。

当新成员节点加入 MGR 时，新成员节点只会选择那些延迟小于 `group_replication_donor_threshold` 的节点作为 donor 节点。

假设 `group_replication_donor_threshold = 100`，那么：
1. 现在 MGR 中有两个节点A、B，它们的 GTID 分别是 [1-300]、[1-280]，新节点 C 加入，由于 A & B 节点的 GTID 差值小于预设阈值，则随机选择 A 或 B 其中一个节点作为 donor 节点。
2. 现在 MGR 中有两个节点A、B，它们的 GTID 分别是 [1-400]、[1-280]，新节点 C 加入，由于 A & B 节点的 GTID 差值大于预设阈值，则只会选择 A 作为 donor 节点。
3. 现在 MGR 中有三个节点A、B、C，它们的 GTID 分别是 [1-400]、[1-350]、[1-280]，新节点 D 加入，由于 C 节点的 GTID 差值大于预设阈值，A & B 节点 GTID 延迟小于预设阈值，则会随机选择 A 或 B 其中一个作为 donor 节点。

- 在主从复制中，由从节点向主节点发起 Binlog 读取请求，如果读取太快或并发太多线程就会加大主节点的压力。新增参数 `rpl_read_binlog_speed_limit` 用于控制从节点上向主节点发起 Binlog 读取请求的限速，这对于控制主从复制中的网络带宽使用率、降低主节点压力、或在数据恢复过程中降低消耗资源非常有用。该参数可在从节点端设置生效。详见：[Binlog 读取限速](../../5-enhance/5-2-ha-binlog-speed-limit.md)。
- 优化了在 [快速单主模式](../../5-enhance/5-2-ha-mgr-fast-mode.md) 下 relay log 应用逻辑，提升 MGR 整体性能；并优化了当 relay log 存在堆积时的 applier 线程的内存消耗异常情况。
- GreatSQL 优化了 [asynchronous connection failover](https://dev.mysql.com/doc/refman/8.0/en/replication-asynchronous-connection-failover.html) 中的故障检测效率，特别是发生网络故障时，备用集群能更快完成主从复制通道调整，降低主从复制链路断开的时间，提高整体可用性。以设置 `MASTER_RETRY_COUNT = 2` 为例（`slave_net_timeout` 和 `MASTER_CONNECT_RETRY` 默认值均为 60），在主从复制通道间发生网络故障时导致的复制中断持续约 3 分钟，优化后故障影响时长缩短到 10 - 20 秒以内。在 GreatSQL 中，可以利用 [asynchronous connection failover](https://dev.mysql.com/doc/refman/8.0/en/replication-asynchronous-connection-failover.html) 实现两个 MGR 集群间的主从复制，实现跨机房间的高可用切换方案。
- [地理标签](../../5-enhance/5-2-ha-mgr-zoneid.md) 功能中包含两个参数 `group_replication_zone_id`（默认值为 0）和 `group_replication_zone_id_sync_mode`（默认值为ON）。在旧版本中，要求各个节点的 `group_replication_zone_id_sync_mode` 保持一致，否则无法加入 MGR。新版本中，允许仲裁节点设置不同的 `group_replication_zone_id_sync_mode`。例如，节点 A1、A2 设置 `group_replication_zone_id = 0` & `zone_id_sync_mode = ON`；节点 B1、B2 设置 `group_replication_zone_id = 1`，它们也必须设置 `zone_id_sync_mode = ON`；仲裁投票节点C 设置 `group_replication_zone_id = 2`，但可以设置 `group_replication_zone_id_sync_mode = OFF`。
- 当启用 greatdb_ha Plugin 时，新增支持 IPv6。

更多信息详见文档：[高可用](../../5-enhance/5-2-ha.md)。

### 高性能

- 支持非阻塞式 DDL 操作。当执行 DDL 操作的表上有大事务或大查询未结束时，会导致 DDL 请求长时间等待 MDL 锁。利用该特性，可以避免数据库因为必须尽快完成 DDL 操作而导致业务请求大量被阻塞的问题。详见：[非阻塞式 DDL](../../5-enhance/5-1-highperf-nonblocking-ddl.md)。
- NUMA 亲和性优化。通过 NUMA 亲和性调度优化，将前端用户线程和后台线程绑定到固定 NUMA 节点上以提升线程处理性能。详见：[NUMA 亲和性优化](../../5-enhance/5-1-highperf-numa-affinity.md)。
- 无显式主键表并行导入性能优化。对无显式主键表并行导入数据时，会随着并发数的增加，性能明显下降，GreatSQL针对这种情况也提供了优化方案。详见：[并行 LOAD DATA](../../5-enhance/5-1-highperf-parallel-load.md)。

更多信息详见文档：[高性能](../../5-enhance/5-1-highperf.md)。

### 高兼容
- 新增支持在 `LOOP` 循环使用 `CONTINUE` 语法。详见：[CONTINUE](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-continue.md)。
- 新增支持用 `CREATE OR REPLACE` 语法创建/修改触发器；新增支持在触发器中使用 `DECLARE BEGIN` 语法。详见：[触发器](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-trigger.md)。
- 新增支持在匿名块中使用 `DECLARE BEGIN` 语法。详见：[匿名块](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-anony-block.md)。
- 新增支持在 `FOR/FOR ALL ... LOOP` 用法中使用符号和参数相连，例如 `FOR var1..var2 LOOP`。详见：[FOR LOOP](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-for-loop.md) 和 [FORALL LOOP](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-forall-loop.md)。

更多信息详见文档：[高兼容](../../5-enhance/5-3-easyuse.md)。

### 高安全
- 新增支持记录指定用户的最后一次登入时间，便于管理员查询，进一步提升数据库安全性。详见：[最后登录信息](../../5-enhance/5-4-security-last-login.md)。
- 新增支持基于规则的数据脱敏功能。详见：[数据脱敏](../../5-enhance/5-4-security-data-masking.md)。

更多信息详见文档：[高安全](../../5-enhance/5-4-security.md)。

### 其他
- 支持采用 Clone 实现在线全量热备和增备以及恢复（类似 Xtrabackup），结合 Binlog 可实现恢复到指定时间点。此外，Clone 备份还支持压缩功能。详见：[Clone 备份](../../5-enhance/5-5-clone-compressed-and-incrment-backup.md)。
- 由于 GreatSQL 已支持 Rapid 引擎，以及未来还将推出 dplan 特性，因此从 GreatSQL 8.0.32-26 开始，不再推荐使用 InnoDB 并行查询特性（同时会删除用户手册中的入口链接）。
- 合并龙芯支持 patch，参考：[add loongarch64 support](https://gitee.com/src-openeuler/greatsql/pulls/54/files)。

## 缺陷修复
- 修复了在部分 ARM 架构环境中无法使用并行复制的问题，详见：[MySQL Bug 110752](https://bugs.mysql.com/bug.php?id=110752)。
- 修复了最后登录信息和审计日志入表时未处理 Binlog 可能导致主从异常的问题。在新版本中，最后登录信息和审计日志都不会记录 Binlog，避免因为主从复制（也包括 MGR）中各实例都开启该特性记录 Binlog 而造成主从复制失败（或 MGR 报错）。
- 修复了数个因为 SQL 注入可能导致数据库实例发生 coredump 的问题，大幅提升 GreatSQL 对 SQL 注入风险的抵御能力。
- 修复了 Oracle 模式下 NULL 值唯一约束问题。在原来的 Oracle 模式下，插入 NULL 值会触发唯一约束冲突；而在 Oracle 数据库中，是允许向唯一约束列中重复写入 NULL 值的。在新版本中修复了这个问题。

```sql
-- 在老版本中
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t1 (c1 INT UNIQUE);
greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE "t1" (
  "my_row_id" bigint unsigned NOT NULL AUTO_INCREMENT /*!80023 INVISIBLE */,
  "c1" int DEFAULT NULL,
  PRIMARY KEY ("my_row_id"),
  UNIQUE KEY "c1" ("c1") /* nulls are equal in unique index as oracle does */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t1 SELECT NULL;
Query OK, 1 row affected (0.01 sec)
Records: 1  Duplicates: 0  Warnings: 0

greatsql> INSERT INTO t1 SELECT NULL;
ERROR 1062 (23000): Duplicate entry 'NULL' for key 't1.c1'
```

在新版本中修复了这个唯一性约束问题：
```sql
-- 在新版本中
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t1 (c1 INT UNIQUE);
greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE "t1" (
  "my_row_id" bigint unsigned NOT NULL AUTO_INCREMENT /*!80023 INVISIBLE */,
  "c1" int DEFAULT NULL,
  PRIMARY KEY ("my_row_id"),
  UNIQUE KEY "c1" ("c1") /* nulls are equal in unique index as oracle does */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t1 SELECT NULL;
Query OK, 1 row affected (0.01 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- 不再报告唯一性约束冲突
greatsql> INSERT INTO t1 SELECT NULL;
Query OK, 1 row affected (0.01 sec)
Records: 1  Duplicates: 0  Warnings: 0
```

- 修复了开启线程池后，当逻辑 CPU 核数大于 128 时会触发 coredump 的问题，详见：[mysqld debug version will core if the number of cpu cores is larger than 128](https://github.com/GreatSQL/GreatSQL/issues/5)。
- 修复了在 greatdb_ha Plugin 中启用 VIP 后因系统环境问题或配置不当可能导致 GreatSQL 在启动 MGR 后发生 coredump 的问题，详见：[Issue#I9VTF8](https://gitee.com/GreatSQL/GreatSQL/issues/I9VTF8?from=project-issue)。
- 修复了用RPM包和TAR二进制包不同方式安装会造成 `lower_case_table_names` 的默认设置不同的问题。
- 修复了在空跑或低负载时，进程 CPU 消耗较高的问题。
- 修复了 默认安装多了sys_audit库 问题，详见：[Issue#I8TL52](https://gitee.com/GreatSQL/GreatSQL/issues/I8TL52?from=project-issue)。
- 修复了 merge view 后导致 assert fail 问题，详见：[Issue#IABSE6](https://gitee.com/GreatSQL/GreatSQL/issues/IABSE6?from=project-issue)。
- 修复了 full join 执行计划不正确问题，详见：[Issue#IADFD7](https://gitee.com/GreatSQL/GreatSQL/issues/IADFD7?from=project-issue)。

## 注意事项
无。

## 升级到 GreatSQL 8.0.32-26

以下是升级到 GreatSQL 8.0.32-26 的几种不同场景说明。

- 如果旧版本是 GreatSQL 8.0.32-25，并且没有使用 Rapid 引擎，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-26 后会完成自动升级。
- 如果旧版本是 GreatSQL 8.0.32-25，并且已启用 Rapid 引擎，这种情况下暂时先不要升级，可以等到后续发布带新版本 Rapid 引擎的 GreatSQL 8.0.32-26 版本后再升级。
- 如果旧版本是 GreatSQL 8.0.32-24、8.0.25-*、5.7.36-39 等系列版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-26 后会完成自动升级。
- 如果是 MySQL 8.0.*（<= 8.0.32 版本）、Percona Server 8.0.*（<= 8.0.32 版本）等系列版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-26 后会完成自动升级。
- 如果是 MySQL 8.0.*（> 8.0.32 版本）、Percona Server 8.0.*（> 8.0.32 版本）等系列版本，则需要利用逻辑备份方式导出数据，再导入的方式完成升级，不支持原地（in-place）升级到 GreatSQL 8.0.32-26。
- 如果是 MySQL 5.7.*（>= 5.7.23 版本）、Percona Server 5.7.*（<= 5.7.23 版本）等系列版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-26 后会完成自动升级。

在以上几个原地升级场景中，务必保证 GreatSQL 中参数 `upgrade` 不能设置为 *NONE*，可以设置为默认的 *AUTO* 或 *FORCE*。例如：

```ini
[mysqld]
upgrade = AUTO
```


更多迁移升级方案请参考：[迁移升级](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md)。

## GreatSQL VS MySQL

| **1.主要特性** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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
| **2. 性能提升扩展** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|AP 引擎| :heavy_check_mark: | 仅云上HeatWave |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入优化 | :heavy_check_mark: | ❌ |
|InnoDB 并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行 LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB 事务 ReadView 无锁优化| :heavy_check_mark: | ❌ |
|InnoDB 事务大锁拆分优化| :heavy_check_mark: | ❌ |
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
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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
|SHOW INNODB ENGINE STATUS 增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log 信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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
| **6. 运维便利性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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

GreatSQL 8.0.32-26 基于 Percona Server for MySQL 8.0.32 版本，它在 MySQL 8.0.32 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等 MySQL 企业版才有的特性，以及 performance_schema 提升、information_schema 提升、性能和可扩展性提升、用户统计增强、PROCESSLIST 增强、Slow Log 增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-26 (2024-07-31)](changes-greatsql-8-0-32-26-20240731.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)




**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
