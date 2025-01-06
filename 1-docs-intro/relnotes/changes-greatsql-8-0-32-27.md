# Changes in GreatSQL 8.0.32-27 (2025-x-x)

## 版本信息

- 发布时间：2025年x月x日

- 版本号：8.0.32-27, Revision a68b3034c3d

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)

- 用户手册：[GreatSQL 8.0.32-27 User Manual](https://greatsql.cn/docs/8.0.32-27/)

##  特性增强

GreatSQL 8.0.32-27 版本在 **高可用**、**高性能**、**高兼容**、**高安全** 等多方面都有增强新特性，包括 等多个新特性。

### 高可用
- 当启用 greatdb_ha Plugin 时，新增支持 IPv6。

更多信息详见文档：[高可用](../../5-enhance/5-2-ha.md)。

### 高性能

- 支持非阻塞式 DDL 操作。当执行 DDL 操作的表上有大事务或大查询未结束时，会导致 DDL 请求长时间等待 MDL 锁。利用该特性，可以避免数据库因为必须尽快完成 DDL 操作而导致业务请求大量被阻塞的问题。详见：[非阻塞式 DDL](../../5-enhance/5-1-highperf-nonblocking-ddl.md)。

更多信息详见文档：[高性能](../../5-enhance/5-1-highperf.md)。

### 高兼容
- 新增支持在 `FOR/FOR ALL ... LOOP` 用法中使用符号和参数相连，例如 `FOR var1..var2 LOOP`。详见：[FOR LOOP](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-for-loop.md) 和 [FORALL LOOP](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-forall-loop.md)。

更多信息详见文档：[高兼容](../../5-enhance/5-3-easyuse.md)。

### 高安全
- 新增支持基于规则的数据脱敏功能。详见：[数据脱敏](../../5-enhance/5-4-security-data-masking.md)。

更多信息详见文档：[高安全](../../5-enhance/5-4-security.md)。

### 其他
- 由于 GreatSQL 已支持 Rapid 引擎，以及未来还将推出 dplan 特性，因此从 GreatSQL 8.0.32-27 开始，不再推荐使用 InnoDB 并行查询特性（同时会删除用户手册中的入口链接）。

## 缺陷修复
- 修复了 Oracle 模式下 NULL 值唯一约束问题。在原来的 Oracle 模式下，插入 NULL 值会触发唯一约束冲突；而在 Oracle 数据库中，是允许向唯一约束列中重复写入 NULL 值的。在新版本中修复了这个问题。

## 注意事项
无。

## 升级/降级到 GreatSQL 8.0.32-27

### 升级到 GreatSQL 8.0.32-27

以下是升级到 GreatSQL 8.0.32-27 的几种不同场景说明。

- 如果旧版本是 GreatSQL 8.0.32-25 及更早的版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-27 后会完成自动升级。
- 如果旧版本是 GreatSQL 8.0.32-24、8.0.25-*、5.7.36-39 等系列版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-27 后会完成自动升级。
- 如果是 MySQL 8.0.*（<= 8.0.32 版本）、Percona Server 8.0.*（<= 8.0.32 版本）等系列版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-27 后会完成自动升级。
- 如果是 MySQL 8.0.*（> 8.0.32 版本）、Percona Server 8.0.*（> 8.0.32 版本）等系列版本，则需要利用逻辑备份方式导出数据，再导入的方式完成升级，不支持原地（in-place）升级到 GreatSQL 8.0.32-27。
- 如果是 MySQL 5.7.*（>= 5.7.23 版本）、Percona Server 5.7.*（<= 5.7.23 版本）等系列版本，则可以直接在原来的 *datadir* 基础上，修改 *basedir* 后，原地（in-place）启动 GreatSQL 8.0.32-27 后会完成自动升级。

在以上几个原地升级场景中，务必保证 GreatSQL 中参数 `upgrade` 不能设置为 *NONE*，可以设置为默认的 *AUTO* 或 *FORCE*。例如：

```ini
[mysqld]
upgrade = AUTO
```

更多迁移升级方案请参考：[迁移升级](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md)。

### 降级到 GreatSQL 8.0.32-27

如果是要从 MySQL/Percona 8.0.32 之后的版本降级到 GreatSQL 8.0.32-27 版本，则需要采取逻辑备份 + 逻辑导入方式完成降级操作，并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade = FORCE` 强制升级所有数据表，包括系统表。

降级过程操作大致如下所示：

1. 在高版本中逻辑备份全量数据
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

2. 在GreatSQL 8.0.32-27版本环境中导入逻辑备份文件，完成逻辑恢复

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

3. 修改my.cnf，确保 upgrade = FORCE 设置
```ini
[mysqld]
upgrade = FORCE
```

4. 重启GreatSQL，降级完成

```bash
systemctl restart greatsql
```
重启过程中，可以看到日志有类似下面的强制升级过程

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80032' completed.
```

如果不设置 `upgrade = FORCE` 强制升级所有表，有可能发生系统表 `mysql.procs_priv` 损坏错误，在创建用户时可能会报告类似下面的错误：

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## GreatSQL VS MySQL

| **1.主要特性** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
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
| **2. 性能提升扩展** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
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
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
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
| **5.安全性提升** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
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
| **6. 运维便利性提升** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
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

GreatSQL 8.0.32-27 基于 Percona Server for MySQL 8.0.32 版本，它在 MySQL 8.0.32 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等 MySQL 企业版才有的特性，以及 performance_schema 提升、information_schema 提升、性能和可扩展性提升、用户统计增强、PROCESSLIST 增强、Slow Log 增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-27 (2025-x-x)](changes-greatsql-8-0-32-27.md)
- [Changes in GreatSQL 8.0.32-26 (2024-08-05)](changes-greatsql-8-0-32-26-20240805.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)


**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
