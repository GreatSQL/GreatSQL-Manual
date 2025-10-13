# MySQL迁移/升级/降级到GreatSQL
---

本文介绍如何从MySQL迁移/升级到GreatSQL数据库。

## 为什么要迁移/升级

GreatSQL相对于MySQL社区版有着众多优秀特性，包括且不仅限以下：

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

## 迁移/升级前准备

首先下载GreatSQL 8.4版本安装包，推荐选择最新的[GreatSQL 8.4.4-4版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-4)，至于选择RPM还是二进制包看具体情况及个人喜好。

本文选用二进制包方式安装。

正式迁移/升级之前，务必做好数据备份，可以采用以下几种方式：

1. 停机维护，复制当前的数据库目录，做一个全量物理备份，这种方式恢复起来最快。
2. 利用mysqldump/xtrabackup等备份工具，执行一个全量备份。
3. 利用主从复制或MGR，在其中一个节点执行备份，或者令某个节点临时下线/退出，作为备用节点。

接下来，要区分本次迁移/升级属于以下哪种情况：

1. 从 MySQL 8.0 直接一次性迁移+升级到GreatSQL 8.4.4-4。
2. 从Percona 8.4.4-4及以下版本迁移/升级到GreatSQL 8.0.32。
3. 从 MySQL 5.7 及更低版本迁移+升级到GreatSQL 8.4.4-4。

针对前两种情况，可参考文档：[GreatSQL 8.0升级到8.4](./1-upgrade-to-greatsql8.md) 的方法进行迁移/升级即可，过程是完全一样的。

针对第三种情况下，应该先逐次升级大版本，例如 5.6=>5.7，5.7=>8.0 最新版本，而后再升级到 GreatSQL 8.4.4-4。也可以利用 mysqldump 将低版本数据库中的数据全量备份出来，再导入到 GreatSQL 8.4.4-4 版本的数据库环境中，一次性完成升级。

## 降级到 GreatSQL 8.4.4-4

在 GreatSQL 8.4 这个LTS版本中，不同小版本间支持原地升级/降级，其余版本中是不支持直接原地(in-place)降级的，因此建议采用 **逻辑备份+导入** 的方式完成迁移。

如果要从 MySQL 9.0 及之后的版本降级到 GreatSQL 8.4.4-4，则需要采取逻辑备份 + 逻辑导入方式完成降级操作（不支持直接在原来的 datadir 基础上原地启动 GreatSQL 8.4.4-4 完成降级替换），并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade=FORCE` 强制升级所有数据表，包括系统表。

降级过程操作大致如下所示：

**1. 在高版本中逻辑备份全量数据**

```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. 在GreatSQL 8.4.4-4版本环境中导入逻辑备份文件，完成逻辑恢复**

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

**3. 修改my.cnf，确保 upgrade=FORCE 设置**

```ini
[mysqld]
upgrade=FORCE
```

**4. 重启GreatSQL，降级完成**

```bash
systemctl restart greatsql
```
重启过程中，可以看到日志有类似下面的强制升级过程

```log
[System] [MY-013381] [Server] Server upgrade from '80404' to '80404' started.
[System] [MY-013381] [Server] Server upgrade from '80404' to '80404' completed.
```

如果不设置 `upgrade=FORCE` 强制升级所有表，有可能发生系统表 `mysql.procs_priv` 损坏错误，在创建用户时可能会报告类似下面的错误：

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

升级/降级完成后，记得注释掉 `my.cnf` 文件中的 `upgrade=FORCE` 选项，或者将其修改成 `upgrade=AUTO`。

**参考文档**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
