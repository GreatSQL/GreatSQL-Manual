# 图解GreatSQL Error Log（错误日志）

## 什么是错误日志

**错误日志（Error Log）** 是 GreatSQL 中最常用的一种日志，主要记录 GreatSQL 服务器启动和停止过程中的信息、服务器在运行过程中发生的故障和异常情况等。

## 错误日志记录了啥

错误日志包含 GreatSQL 启动和关闭的时间信息，还包含诊断消息，如服务器启动和关闭期间以及服务器运行时出现的错误、警告和其他需要注意的信息。

例如：如果 GreatSQL 检测到某个表需要检查或修复，会写入错误日志。

根据错误日志配置，错误消息还可能填充 `performance_schema.error_log` 表，以便为日志提供 SQL 接口，使错误日志能够查询。

如果用 `mysqld_safe` 启动 `mysqld，mysqld_safe` 会将消息写入错误日志。

例如，当 `mysqld_safe` 注意到 mysqld 异常退出时，它会重新启动 mysqld，并将 mysqld 重新启动的消息写入错误日志。

## 怎么启动错误日志

在GreatSQL数据库中，错误日志功能是默认开启的。而且，错误日志无法被禁止。

默认情况下，错误日志存储在GreatSQL数据库的数据文件夹下，名称默认为`mysqld.log`（Linux系统）或`hostname.err`（mac系统）。如果需要制定文件名，则需要在my.cnf或者my.ini中做如下配置：

```sql
[mysqld]
log-error=[path/[filename]] #path为日志文件所在的目录路径，filename为日志文件名
```

修改配置项后，需要**重启** GreatSQL 服务以生效。

## 查看日志

GreatSQL错误日志是以文本文件形式存储的，可以使用文本编辑器直接查看。
查询错误日志的存储路径：

```sql
greatsql> SHOW VARIABLES LIKE 'log_err%';
+----------------------------+----------------------------------------+
| Variable_name              | Value                                  |
+----------------------------+----------------------------------------+
| log_error                  | /var/log/mysqld.log                     |
| log_error_services         | log_filter_internal; log_sink_internal |
| log_error_suppression_list |                                        |
| log_error_verbosity        | 2                                      |
+----------------------------+----------------------------------------+
4 rows in set (0.00 sec)
```

## 参数解析

- `log_error` 定义为错误日志文件路径。
- `log_error_services` 控制哪个日志组件启用错误日志，该变量可以包含具有0、1或多组件列表；在后一种情况下，组件可以用分号或（从GreatSQL 8.0.12开始）逗号分隔，另外服务器按照列出的顺序执行组件。

默认情况下 log_error_services 具有以下值：

```sql
greatsql> SELECT @@GLOBAL.log_error_services;
+----------------------------------------+
| @@GLOBAL.log_error_services            |
+----------------------------------------+
| log_filter_internal; log_sink_internal |
+----------------------------------------+
1 row in set (0.00 sec)
```

- `log_error_suppression_list` 用于错误日志的事件的抑制作用,有些日志不希望记录下来。
- `log_error_verbosity`日志记录等级：

| log_error_verbosity Value | Permitted Message Priorities |
| :------------------------ | :--------------------------- |
| 1                         | ERROR                        |
| 2                         | ERROR, WARNING               |
| 3                         | ERROR, WARNING, INFORMATION  |

- **在MGR中建议设置为 `3` 可以记录更多日志信息，便于跟踪问题。**

## log_timestamps控制日志显示时间

在GreatSQL 5.7.2 新增了 `log_timestamps` 这个参数，该参数主要是控制 `error log`、`genera log`，等等记录日志的显示时间参数。

在 5.7.2 之后改参数为默认 UTC 这样会导致日志中记录的时间比中国这边的慢，导致查看日志不方便。

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'log_timestamps';
+----------------+-------+
| Variable_name  | Value |
+----------------+-------+
| log_timestamps | UTC   |
+----------------+-------+
1 row in set (0.00 sec)
```

可以看到使用的时间是UTC时间，UTC是世界公用的一个时间，那么我们本地时间和UTC时间就必然存在一个换算关系。按北京时间来算，北京时间将比UTC时间**快8个小时**。

**修改方法：**

- GreatSQL 5.7 修改


```sql
greatsql> SET GLOBAL log_timestamps=system;
```

  修改后可以再配置文件中添加

  ```bash
  [mysqld]
  log_timestamps=system
  ```

- GreatSQL 8.0 修改

```sql
greatsql> SET GLOBAL log_timestamps=system;
```

- 小节结论
  1.为了国内用户便于读取日志信息，建议将参数写入到配置文件my.cnf
  2.GreatSQL 8.0支持参数`log_timestamps`持久化设置。

## 删除\刷新日志

对于很久以前的错误日志，数据库管理员查看这些错误日志的可能性不大，可以将这些错误日志删除，以保证 GreatSQL 服务器上的硬盘空间。GreatSQL 的错误日志是以文本文件的形式存储在文件系统中的，可以直接删除。

```bash
#刷新日志
$ mysqladmin -uroot -p flush-logs
```

> 如果 GreatSQL 日志文件被其他进程打开或被锁定，`flush-logs` 操作可能会失败

若提示以下错误

```bash
mysqladmin: refresh failed; error: 'Could not open file '/var/log/mysqld.log' for error logging.'
```

补充操作

```bash
# 备份旧错误日志
$ mv /var/log/mysqld.log /var/log/mysqld.log.old
# 清空GreatSQL的错误日志文件
$ install -omysql -gmysql -m0644 /dev/null /var/log/mysqld.log
```

**flush-logs指令操作**

- GreatSQL 5.5.7以前的版本，flush-logs将错误日志文件重命名为filename.err_old,并创建新的日志文件。
- 从GreatSQL 5.5.7开始，flush-logs只是重新打开日志文件，并不做日志备份和创建的操作。
- 如果日志文件不存在，GreatSQL 启动或者执行flush-logs时会自动创建新的日志文件。重新创建错误日志，大小为0字节。

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
