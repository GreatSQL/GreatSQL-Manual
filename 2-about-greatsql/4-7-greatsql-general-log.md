# General Log（通用日志）

## 什么是通用日志

通用日志（General Log）记录所有发送到 GreatSQL 服务器的请求，无论这些请求是否被正确执行。

通用日志记录了包括启动和关闭 GreatSQL 服务、所有用户的连接开始时间和截止时间、发给 GreatSQL 数据库服务器的所有请求等。

它是一个非常有用的调试工具，可以帮助 DBA 和开发人员监控数据库操作和排查问题。

## 设置方法

通用日志可以通过 my.cnf 配置文件或者在运行时动态设置。

### 在 my.cnf 配置文件中设置

在配置文件 my.cnf 中添加以下设置：

```ini
[mysqld]
general_log = ON
general_log_file = /data/GreatSQL/general.log
```

### 在运行时动态设置

可以使用 SQL 语句在 GreatSQL 运行时启用或禁用通用日志：

```sql
-- 启用通用日志
SET GLOBAL general_log = ON;

-- 禁用通用日志
SET GLOBAL general_log = OFF;

-- 设置通用日志文件路径
SET GLOBAL general_log_file = '/data/GreatSQL/general.log';
```

通用日志支持在线动态启用或禁用，以及设置日志文件路径。

## 查看当前状态

可以使用以下命令查看通用日志的当前状态：

```sql
greatsql> SHOW GLBOAL VARIABLES LIKE 'general_log%';
+------------------+----------------------------+
| Variable_name    | Value                      |
+------------------+----------------------------+
| general_log      | OFF                        |
| general_log_file | /data/GreatSQL/general.log |
+------------------+----------------------------+
```

## 查看日志内容

通用日志是以文本文件的形式存储在文件系统中的，可以使用文本编辑器直接打开日志文件。

```bash
$ cd /data/GreatSQL && cat general.log

...
/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld, Version: 8.0.32-26 (GreatSQL, Release 26, Revision 444164cc78e), Time: 2024-07-08T10:23:05.166725+08:00. started with:
Tcp port: 3306  Unix socket: /data/GreatSQL/mysql.sock
Time                 Id Command    Argument
16 Connect   root@localhost on  using Socket
16 Query     select @@version_comment limit 1
16 Query     select version()
16 Query     select user()
16 Quit
```

从上面内容可以看出，具体时间点、连接ID、请求类型、具体请求指令，各种信息一目了然。

## 管理通用日志

启用通用日志后，如果对数据库的请求非常频繁，则通用日志文件大小会增长很快，很容易把磁盘空间耗尽。DBA 需要经常监控磁盘空间利用率，并及时清除较久前的日志内容，以保证服务器上的硬盘空间不会耗尽。

在 GreatSQL 中，可以使用 `mysqladmin flush-logs general` 命令来刷新通用日志（它的实际作用是：先关闭文件句柄，再重新打开），例如：

```bash
mysqladmin -uroot -p flush-logs general
```
也可以执行下面的命令完成通用日志刷新：

```sql
FLUSH GENERAL LOGS;
```

新的通用日志会直接覆盖旧的查询日志，因此通常是先备份旧的日志文件后清空它，并立即执行刷新操作，重新生成通用日志文件。

除了上述手动刷新的方法之外，重启 GreatSQL 服务也会刷新通用日志。

## 使用注意事项

1. **性能影响**

启用通用日志会对数据库性能产生影响，因为每个查询都要被记录到日志中。对于高负载的生产环境，建议谨慎使用通用日志。

2. **磁盘空间**

通用日志可能会迅速变得很大，占用大量磁盘空间。因此，建议定期监控日志文件大小并采取相应措施，比如日志轮转或清理过期日志。

3. **隐私和安全**

通用日志会记录所有的查询，包括可能包含敏感信息的查询内容。因此，要注意保护日志文件的安全，防止未经授权的访问。

4. **按需开启，用完即关**

有需要排查问题时，再临时开启，在排查问题或调试完成后，建议及时关闭通用日志，以免影响数据库性能和增加不必要的磁盘空间占用。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
