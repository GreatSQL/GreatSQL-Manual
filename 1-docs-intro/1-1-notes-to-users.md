# 用户须知
---

## 关于 GreatSQL

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

GreatSQL 致力于保持开源的开放性。GreatSQL 采用 [GPLv2 协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)。

GreatSQL 的代码托管在[gitee](https://gitee.com/GreatSQL/GreatSQL)，同时镜像到 [github](https://github.com/GreatSQL/GreatSQL)。

如果您在使用 GreatSQL，[请戳此填写问卷](https://wj.qq.com/s2/11543483/9e09/)，**即可享受5*8在线免费技术支持服务**，只需1分钟即可完成，这对我们也很重要。

## 理解 GreatSQL 版本号

GreatSQL 版本号采用点分位命名规则（X.Y.Z-R）模式，其中
- X表示大版本号：MYSQL_VERSION_MAJOR，例如3.x、4.x、5.x、8.x等
- Y表示小版本号：MYSQL_VERSION_MINOR，例如3.23.x、4.0.x、4.1.x、5.0.x、5.1.x、5.5.x、5.6.x、5.7.x、8.0.x等
- Z表示补丁版本：MYSQL_VERSION_PATCH，例如3.23.58、4.0.30、4.1.25、5.0.96、5.1.73、5.5.62、5.6.51、5.7.37、8.0.29等
- R表示修订版本：MYSQL_VERSION_REVISION，例如5.7.36-39 Revision a2ce7ad3400、8.0.25-16 Revision 202302041847、8.0.32-27 Revision aa66a385910 等
- GreatSQL 的大版本号与 Percona Server for MySQL/Oracle MySQL 版本号对应。

以 GreatSQL 8.0.32-27 版本为例，登入到 GreatSQL 数据库后，执行 `\s` 或 `STATUS` 命令就可以得到以下信息：

```bash
# 登入到 GreatSQL
$ mysql -hlocalhost -S/data/GreatSQL/mysql.sock -uroot -p
...

# 在GreatSQL 中执行 STATUS 即可查看版本号
greatsql> STATUS;
...
Server version:        8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...
```

其中
- 大版本号X对应：8
- 小版本号Y对应：0
- 补丁版本Z对应：32
- 修订版本R对应：a68b3034c3d

其中的 *Release 27* 是 GreatSQL 新增的发行版本，GreatSQL 可能会基于同一个基础版本，发布多个版本，例如 GreatSQL 8.0.32-24、8.0.32-25、8.0.32-27 这三个版本都是基于 8.0.32 这个版本。

正常情况下，GreatSQL每年会发布两次版本，一般是上半年、下半年各发布一个新版本。

## 约定

在本文档中，关于操作系统命令行以及 SQL 命令提示符约定如下：

- `$` 为 Linux 命令提示符。
- `greatsql>` 为 GreatSQL 数据库 SQL 命令提示符。

如下例所示。

执行下面的命令启动 GreatSQL 服务：

```bash
systemctl start greatsql
```

在 GreatSQL 中执行SQL命令 `SHOW DATABASES` 查看数据库列表：

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
