# 用户须知
---

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

GreatSQL 和 MySQL 一样，采用 [GPLv2协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)。

GreatSQL 版本号采用点分位命名规则（X.Y.Z-R）模式，其中
- X表示大版本号：MYSQL_VERSION_MAJOR，例如3.x、4.x、5.x、8.x等
- Y表示小版本号：MYSQL_VERSION_MINOR，例如3.23.x、4.0.x、4.1.x、5.0.x、5.1.x、5.5.x、5.6.x、5.7.x、8.0.x等
- Z表示补丁版本：MYSQL_VERSION_PATCH，例如3.23.58、4.0.30、4.1.25、5.0.96、5.1.73、5.5.62、5.6.51、5.7.37、8.0.29等
- R表示修订版本：MYSQL_VERSION_REVISION，例如5.7.36-39、8.0.25-16、8.0.32-25等
- GreatSQL 的大版本号与 Percona Server for MySQL/Oracle MySQL 版本号对应。

正常情况下，GreatSQL每年会发布两次版本，一般是上半年、下半年各发布一个新版本。

**约定**

在本文档中，关于操作系统命令行以及 SQL 命令提示符约定如下：

- `$` 为 Linux 命令提示符。
- `greatsql>` 为 GreatSQL 数据库 SQL 命令提示符。

如下例所示。

执行下面的命令启动 GreatSQL 服务：

```shell
$ systemctl start greatsql
```

在 GreatSQL 中执行下面的命令查看数据库列表：

```sql
greatsql> SHOW DATABASES;
+-------------------------------+
| Database                      |
+-------------------------------+
| employees                     |
| greatsql                      |
| information_schema            |
| mysql                         |
| mysql_innodb_cluster_metadata |
| performance_schema            |
| sakila                        |
| sys                           |
| sys_audit                     |
| world                         |
+-------------------------------+
14 rows in set (0.00 sec)
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
