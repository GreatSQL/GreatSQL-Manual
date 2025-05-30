# 从Percona迁移/升级/降级到GreatSQL
---

本文介绍如何从Percona迁移/升级到GreatSQL数据库。

## 为什么要迁移/升级

GreatSQL是在Percona的基础上Fork的开源分支，专注于提升MGR可靠性及性能，支持InnoDB并行查询等特性。

GreatSQL相对于Percona有着众多优秀特性，包括且不仅限以下：

| **1.主要特性** | GreatSQL 8.0.32-27 | Percona 8.0.32-24 |
| :--- | :---: | :---: |
|支持龙芯架构| :heavy_check_mark: | ❌ |
| **2. 性能提升扩展** | GreatSQL 8.0.32-27 | Percona 8.0.32-24 |
|Rapid 引擎| :heavy_check_mark: | 仅云上HeatWave |
|Turbo 引擎| :heavy_check_mark: | ❌ |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入优化 | :heavy_check_mark: | ❌ |
|InnoDB并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB事务ReadView无锁优化| :heavy_check_mark: | ❌ |
|InnoDB事务大锁拆分优化| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|Oracle兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle兼容-函数| :heavy_check_mark: | ❌ |
|Oracle兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
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
| **5.安全性提升** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|基于策略的数据脱敏| :heavy_check_mark: | ❌ |
|审计日志入库| :heavy_check_mark: | ❌ |
|最后登录记录| :heavy_check_mark: | ❌ |

## 迁移/升级前准备

首先下载GreatSQL 8.0版本安装包，推荐选择最新的[GreatSQL 8.0.32-25版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-25)，至于选择RPM还是二进制包看具体情况及个人喜好。

推荐使用 GreatSQL Shell 进行升级前的检查工作，并提前修复整改可能存在的问题，详情参考：[升级检查](./1-upgrade-to-greatsql8.md#升级检查)。

本文选用二进制包方式安装。

正式迁移/升级之前，务必做好数据备份，可以采用以下几种方式：

1. 停机维护，复制当前的数据库目录，做一个全量物理备份，这种方式恢复起来最快。
2. 利用mysqldump/xtrabackup等备份工具，执行一个全量备份。
3. 利用主从复制或MGR，在其中一个节点执行备份，或者令某个节点临时下线/退出，作为备用节点。

接下来，要区分本次迁移/升级属于以下哪种情况：

1. 从Percona 5.7直接一次性迁移+升级到GreatSQL 8.0.32。
2. 从Percona 8.0.32及以下版本迁移/升级到GreatSQL 8.0.32。
3. 从Percona 5.6及更低版本迁移+升级到GreatSQL 8.0.32，则应该先逐次升级大版本，例如5.5=>5.6，5.6=>5.7最新版本，而后再一次性升级到GreatSQL 8.0.32-25。

如果是前两种，可以参考文档：[GreatSQL 5.7升级到8.0](./1-upgrade-to-greatsql8.md) 的方法进行迁移/升级即可，过程是完全一样的。

如果是第三种场景，可以参考文档：[从MySQL迁移/升级到GreatSQL](./2-migrate-from-mysql-togreatsql.md) 中介绍的 **逻辑备份+导入** 方法，进行降级处理。

从Percona迁移到GreatSQL是最快捷的，元数据库表几乎没有区别，而InnoDB表数据则是通用的，几乎可以做到平滑迁移。

## 降级到 GreatSQL 8.0.32-27

如果是要从 Percona 8.0.32 之后的版本降级到 GreatSQL 8.0.32-27 版本，则需要采取逻辑备份 + 逻辑导入方式完成降级操作（不支持直接在原来的 datadir 基础上原地启动 GreatSQL 8.0.32-27 完成降级替换），并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade = FORCE` 强制升级所有数据表，包括系统表。

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

## 注意事项

在MySQL 8.0.26中引入MGR组视图UUID特性（[`group_replication_view_change_uuid`](https://dev.mysql.com/doc/refman/8.0/en/group-replication-system-variables.html#sysvar_group_replication_view_change_uuid)）。因此，如果当前有个MGR集群的版本是8.0.25及以下，则无法实现平滑升级迁移到8.0.26版本。需要申请一次停机维护时间，对MGR集群中的各个节点实施in-place升级，完成从8.0.25到8.0.26及更高版本的升级。

详情请参考：[将MGR集群从GreatSQL-8.0.25平滑升级到GreatSQL-8.0.32](https://greatsql.cn/thread-530-1-1.html)。

**参考文档**

- [Percona Server for MySQL In-Place Upgrading Guide: From 5.7 to 8.0](https://docs.percona.com/percona-server/8.0/upgrade.html)
- [Changes in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html)
- [Before You Begin](https://dev.mysql.com/doc/refman/8.0/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.0/en/upgrading-what-is-upgraded.html)
- [MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
