# 卸载 GreatSQL

当确定不再需要使用 GreatSQL 数据库时，或者想要安装 MySQL 数据库产生冲突需要卸载 GreatSQL 数据库时，可以参考本文方法卸载 GreatSQL 数据库。

**重要提示**
在开始卸载 GreatSQL 数据库前，务必做好数据文件备份，避免重要数据丢失。

## 步骤1：关闭 GreatSQL 数据库

在开始卸载前，请先正确关闭 GreatSQL 数据。

首先，设置 `innodb_fast_shutdown = 0`，确保在关闭 GreatSQL 数据库时把内存缓冲区中的所有数据都刷新到物理磁盘上。

```sql
greatsql> SET GLOBAL innodb_fast_shutdown = 0;
```

接着，执行 `SHUTDOWN` 命令关闭 GreatSQL 数据库。

```sql
greatsql> SHUTDOWN;
```

也可以利用 `systemctl` 关闭。

```shell
$ systemctl stop greatsql # 如果系统服务名是 mysqld，则改成 systemctl stop mysqld
```

还可以利用 `mysqladmin` 关闭。

```shell
$ mysqladmin -hlocalhost -uroot -p shutdown
```

**严禁直接执行 `kill -9` 命令强制暴力关闭 GreatSQL 数据库，这很可能会造成事务数据丢失**。

## 步骤2：备份数据文件

简单起见，可以备份整个 `datadir` 目录下的所有数据文件。假定 `datadir = /data/GreatSQL`，则执行下面的命令完成备份：
```shell
$ cp -rfp /data/GreatSQL /data/GreatSQL-fullbackup-`date +"%Y%m%d"`
```

如果 [二进制日志](../2-about-greatsql/4-3-greatsql-binary-log.md) 不是存储在 *datadir* 目录下，那么同时还要备份二进制日志。

## 步骤3：卸载 GreatSQL 数据库

如果是采用 RPM 方式安装 GreatSQL，则执行下面的命令完成卸载：

```shell
$ rpm -qa | grep -i greatsql | xargs rpm -e
```

如果是采用二进制包方式安装 GreatSQL，则找到安装包所在位置，直接删除即可，例如：

```shell
$ rm -fr /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.17-x86_64
```

## 步骤4：清除环境

如果设置了 systemd 系统服务，删除相应服务文件，并重新加载。

```shell
$ rm -f /lib/systemd/system/greatsql.service
$ systemctl daemon-reload
```

再检查服务器上 *~/.bashrc* 或 *~/.bash_profile* 中是否设置了和 GreatSQL 相关的环境变量，将其清除即可。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
