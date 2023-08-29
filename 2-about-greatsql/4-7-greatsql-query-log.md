# 图解GreatSQL Slow Query Log（慢查询日志）

## 什么是通用查询日志

**通用查询日志（General Query Log）** 用来**记录用户的所有操作**，包括启动和关闭GreatSQL服务、所有用户的连接开始时间和截止时间、发给 GreatSQL 数据库服务器的所有 SQL 指令等。当我们的数据发生异常时， 查看通用查询日志，还原操作时的具体场景 ，可以帮助我们准确定位问题。

## 查看当前状态

```sql
greatsql> SHOW VARIABLES LIKE '%general%';
+------------------+---------------------------+
| Variable_name    | Value                     |
+------------------+---------------------------+
| general_log      | OFF                       |
| general_log_file | /var/lib/mysql/zhyno1.log |
+------------------+---------------------------+
2 rows in set (0.00 sec)
```

从`general_log`可以看到通用查询日志处于关闭状态，从`general_log_file`可以看到日志的目录以及文件名称

## 启动日志

- 方式1

修改 my.cnf 或者 my.ini 配置文件来设置。在 [mysqld] 组下加入log选项，并重启GreatSQL服务。格式如下：

```bash
[mysqld]
general_log=ON
general_log_file=[path[filename]] #日志文件所在目录路径，filename为日志文件名  
```

如果不指定目录和文件名，通用查询日志将默认存储在GreatSQL数据目录中的hostname.log文件中，hostname表示主机名。

- 方式2

```sql
greatsql> SET GLOBAL general_log=on;  # 开启通用查询日志
greatsql> SET GLOBAL general_log_file='path/filename'; # 设置日志文件保存位置
```

## 查看日志

通用查询日志是以文本文件的形式存储在文件系统中的，可以使用文本编辑器直接打开日志文件。每台GreatSQL服务器的通用查询日志内容是不同的。

- 在Windows操作系统中，使用文本文件查看器；
- 在Linux系统中，可以使用vi工具或者gedit工具查看；
- 在Mac OSX系统中，可以使用文本文件查看器或者vi等工具查看。

```bash
$ cat zhyno1.log
/usr/sbin/mysqld, Version: 8.0.25-16 (GreatSQL (GPL), Release 16, Revision 8bb0e5af297). started with:
Tcp port: 3306  Unix socket: /var/lib/mysql/mysql.sock
Time                 Id Command    Argument
2022-11-24T10:07:31.300579Z  4398 Query SHOW VARIABLES LIKE '%general%'
2022-11-24T10:07:42.344537Z  4398 Query SET GLOBAL general_log=OFF
```

可以看出，该日志非常清晰地记录了客户端的所有行为。

## 停止日志

修改my.cnf或者my.ini文件，把[mysqld]组下的general_log值设置为OFF或者把general_log一项注释掉。修改保存后，再重启GreatSQL服务，即可生效。

```bash
[mysqld]
general_log=OFF
```

或是

```sql
greatsql> SET GLOBAL general_log=off;
```

## 删除\刷新日志

如果数据的使用非常频繁，那么通用查询日志会占用服务器非常大的磁盘空间。数据管理员可以删除很长时间之前的查询日志，以保证GreatSQL服务器上的硬盘空间。

在 GreatSQL 中，可以使用 `mysqladmin` 命令来开启新的通用查询日志。新的通用查询日志会直接覆盖旧的查询日志，不需要再手动删除了。

`mysqladmin` 命令的语法如下：

```bash
$ mysqladmin -uroot -p flush-logs
```

需要注意的是，如果希望备份旧的通用查询日志，必须先将旧的日志文件拷贝出来或者改名。然后，再执行 `mysqladmin` 命令。

除了上述方法之外，还可以手工删除通用查询日志。删除之后需要重新启动 GreatSQL 服务。重启之后就会生成新的通用查询日志。如果希望备份旧的日志文件，可以将旧的日志文件改名，然后重启 GreatSQL 服务。

**问题反馈**
---

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")