# MySQL迁移/升级/降级到GreatSQL
---

本文介绍如何从MySQL迁移/升级到GreatSQL数据库。

## 为什么要迁移/升级

GreatSQL相对于MySQL社区版有着众多优秀特性，详见：[GreatSQL vs MySQL](../1-docs-intro/relnotes/changes-greatsql-8445.md#greatsql-vs-mysql)。

## 迁移/升级前准备

首先下载GreatSQL 8.4版本安装包，推荐选择最新的[GreatSQL 8.4.4-5版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-5)，至于选择RPM还是二进制包看具体情况及个人喜好。

本文选用二进制包方式安装。

正式迁移/升级之前，务必做好数据备份，可以采用以下几种方式：

1. 停机维护，复制当前的数据库目录，做一个全量物理备份，这种方式恢复起来最快。
2. 利用mysqldump/xtrabackup等备份工具，执行一个全量备份。
3. 利用主从复制或MGR，在其中一个节点执行备份，或者令某个节点临时下线/退出，作为备用节点。

接下来，要区分本次迁移/升级属于以下哪种情况：

1. 从MySQL 8.0直接一次性迁移+升级到GreatSQL 8.4.4-5。
2. 从Percona 8.4.4-4及以下版本迁移/升级到GreatSQL 8.4.4-5。
3. 从MySQL 5.7及更低版本迁移+升级到GreatSQL 8.4.4-5。

针对前两种情况，可参考文档：[GreatSQL 8.0升级到8.4](./1-upgrade-to-greatsql8.md) 的方法进行迁移/升级即可，过程是完全一样的。

针对第三种情况下，应该先逐次升级大版本，例如 5.6=>5.7，5.7=>8.0 最新版本，而后再升级到 GreatSQL 8.4.4-5。也可以利用 mysqldump 将低版本数据库中的数据全量备份出来，再导入到 GreatSQL 8.4.4-5 版本的数据库环境中，一次性完成升级。

## 降级到 GreatSQL 8.4.4-5

在 GreatSQL 8.4 这个LTS版本中，不同小版本间支持原地升级/降级，其余版本中是不支持直接原地(in-place)降级的，因此建议采用 **逻辑备份+导入** 的方式完成迁移。

如果要从 MySQL 9.0 及之后的版本降级到 GreatSQL 8.4.4-5，则需要采取逻辑备份 + 逻辑导入方式完成降级操作（不支持直接在原来的 datadir 基础上原地启动 GreatSQL 8.4.4-5 完成降级替换），并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade=FORCE` 强制升级所有数据表，包括系统表。

降级过程操作大致如下所示：

**1. 在高版本中逻辑备份全量数据**

```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. 在GreatSQL 8.4.4-5版本环境中导入逻辑备份文件，完成逻辑恢复**

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
