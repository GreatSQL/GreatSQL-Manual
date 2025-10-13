# 从Percona迁移/升级/降级到GreatSQL
---

本文介绍如何从Percona迁移/升级到GreatSQL数据库。

## 为什么要迁移/升级

GreatSQL是在Percona的基础上Fork的开源分支，GreatSQL相对于Percona有着众多优秀新特性和改进提升，包括且不仅限以下：

| **1.主要特性** | GreatSQL 8.4.4-4 | Percona 8.4.4-4 |
| :--- | :---: | :---: |
|支持龙芯架构| :heavy_check_mark: | ❌ |
| **2. 性能提升扩展** | GreatSQL 8.4.4-4 | Percona 8.4.4-4 |
|Rapid 引擎| :heavy_check_mark: | 仅云上HeatWave |
|Turbo 引擎| :heavy_check_mark: | ❌ |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入优化 | :heavy_check_mark: | ❌ |
|InnoDB并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB事务ReadView无锁优化| :heavy_check_mark: | ❌ |
|InnoDB事务大锁拆分优化| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.4.4-4 | MySQL 8.4.4-4 |
|Oracle兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle兼容-函数| :heavy_check_mark: | ❌ |
|Oracle兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.4.4-4 | MySQL 8.4.4-4 |
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
| **5.安全性提升** | GreatSQL 8.4.4-4 | MySQL 8.4.4-4 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|基于策略的数据脱敏| :heavy_check_mark: | ❌ |

## 迁移/升级前准备

首先下载GreatSQL 8.4版本安装包，推荐选择最新的[GreatSQL 8.4.4-4版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-4)，至于选择RPM还是二进制包看具体情况及个人喜好。

本文选用二进制包方式安装。

正式迁移/升级之前，务必做好数据备份，可以采用以下几种方式：

1. 停机维护，复制当前的数据库目录，做一个全量物理备份，这种方式恢复起来最快。
2. 利用mysqldump/xtrabackup等备份工具，执行一个全量备份。
3. 利用主从复制或MGR，在其中一个节点执行备份，或者令某个节点临时下线/退出，作为备用节点。

接下来，要区分本次迁移/升级属于以下哪种情况：

1. 从Percona 8.0直接一次性迁移+升级到GreatSQL 8.4.4-4。
2. 从Percona 8.4.4-4及以下版本迁移/升级到GreatSQL 8.0.32。
3. 从 MySQL 5.7 及更低版本迁移+升级到GreatSQL 8.4.4-4。

针对前两种情况，可参考文档：[GreatSQL 8.0升级到8.4](./1-upgrade-to-greatsql8.md) 的方法进行迁移/升级即可，过程是完全一样的。

针对第三种情况下，应该先逐次升级大版本，例如 5.6=>5.7，5.7=>8.0 最新版本，而后再升级到 GreatSQL 8.4.4-4。也可以利用 mysqldump 将低版本数据库中的数据全量备份出来，再导入到 GreatSQL 8.4.4-4 版本的数据库环境中，一次性完成升级。

## 降级到 GreatSQL 8.4.4-4

如果要从 Percona 8.4.4-5 及之后的版本降级到 GreatSQL 8.4.4-4，请参考以下步骤。

**1. 卸载 telemetry 组件并安全关闭 Percona 服务**

```sql
greatsql> UNINSTALL COMPONENT 'file://component_percona_telemetry';
greatsql> SET GLOBAL innodb_fast_shutdown=1;
greatsql> SHUTDOWN;
```
**2. 修改 my.cnf 配置文件**

修改 `basedir` 参数指向 GreatSQL 8.4.4-4，并加上 `upgrade=FORCE` 参数。

**3. 启动 GreatSQL 数据库服务，完成原地降级。**

升级/降级完成后，记得注释掉 `my.cnf` 文件中的 `upgrade=FORCE` 选项，或者将其修改成 `upgrade=AUTO`。

**参考文档**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
