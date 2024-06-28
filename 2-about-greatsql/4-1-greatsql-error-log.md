# Error Log（错误日志）

## 什么是错误日志

**错误日志（Error Log）** 是 GreatSQL 中最常见的日志，主要记录 GreatSQL 服务器启动和停止过程中的信息、服务器在运行过程中发生的故障和异常情况等。

## 错误日志的内容

错误日志包含 GreatSQL 启动和关闭的时间信息，还包含诊断消息，如服务器启动和关闭期间以及服务器运行时出现的错误、警告和其他需要注意的信息。

例如以下几种情况：
- 如果 GreatSQL 检测到某个表可能损坏了，需要检查或修复，会记入错误日志。
- 如果用 `mysqld_safe` 守护进程启动 `mysqld` 进程时，`mysqld_safe` 会将相关信息记入错误日志。
- 当 `mysqld_safe` 守护进程检测到 `mysqld` 进程异常退出时，它会重新启动 `mysqld` 进程，并将相关信息记入错误日志。

根据错误日志配置，错误日志还可能存储在 `performance_schema.error_log` 表中，可以通过 SQL 接口，能更方便查询。

## 配置错误日志

在 GreatSQL 数据库中，错误日志功能是默认开启的，并且错误日志无法被禁用。

默认情况下，错误日志存储在 GreatSQL 数据库的 `datadir` 目录下，名称默认为 `mysqld.log`（Linux 系统）或 `hostname.err`（Mac 系统）。如果需要自定义文件名，则需要在 my.cnf 中做修改下面的配置：

```ini
[mysqld]
log-error = [path/[filename]] 
```
其中，*path* 为日志文件所在的目录路径，可以不配置，默认为 `datadir`；*filename* 为日志文件名，例如：

```ini
[mysqld]
log-error = /data/GreatSQL/error.log
# 或下面这样也可以
# log-error = error.log
```

修改完上述配置项后，需要重启 GreatSQL 服务以生效。

## 查看错误日志

GreatSQL 错误日志是以文本文件形式存储的，可以使用文本编辑器直接查看。查询错误日志的存储路径：

```sql
greatsql> SHOW VARIABLES LIKE 'log_error%';
+----------------------------+----------------------------------------+
| Variable_name              | Value                                  |
+----------------------------+----------------------------------------+
| log_error                  | /var/log/mysqld.log                     |
| log_error_services         | log_filter_internal; log_sink_internal |
| log_error_suppression_list |                                        |
| log_error_verbosity        | 2                                      |
+----------------------------+----------------------------------------+
```
上述结果表明当前 GreatSQL 的错误日志文件路径是 */var/log/mysqld.log*。

## 参数变量

以下是错误日志相关的参数变量。

- `log_error` 错误日志文件路径，支持指定为全路径或相对路径。
- `log_error_services` 设置使用哪些错误日志服务组件，以控制如何处理和存储错误日志。该变量可以设置为 0、1 或多个可选值；在后一种情况下，组件列表可以用分号或逗号（从 GreatSQL 8.0.12开始）分隔，每个服务名称代表一个日志处理组件，这些组件可以过滤、格式化或存储日志消息。

默认情况下，`log_error_services` 具有以下可选值：

```sql
greatsql> SELECT @@GLOBAL.log_error_services;
+----------------------------------------+
| @@GLOBAL.log_error_services            |
+----------------------------------------+
| log_filter_internal; log_sink_internal |
+----------------------------------------+
```

在上述配置中：

1. *log_filter_internal* 负责过滤不必要的日志信息。

2. *log_sink_internal* 负责将过滤后的日志信息写入到日志文件。

通过合理配置 `log_error_services`，可以优化错误日志记录，确保日志信息既全面又不会过度占用存储资源。

- `log_error_suppression_list` 用于抑制错误日志事件，设置不记录某些日志。
- `log_error_verbosity` 设置日志记录等级，可选值有

| log_error_verbosity Value | Permitted Message Priorities |
| :------------------------ | :--------------------------- |
| 1                         | ERROR                        |
| 2                         | ERROR, WARNING               |
| 3                         | ERROR, WARNING, INFORMATION  |

建议设置为 3，这样可以记录更多日志信息，便于跟踪分析各种问题。

- `log_timestamps` 控制日志显示时间

从 GreatSQL 5.7.2 开始新增了 `log_timestamps` 这个参数，用于设置 [错误日志](./)、[通用日志](./4-7-greatsql-query-log.md) 中时间戳的记录方式。参数默认值为 *UTC*（简单说就是 UTC+0 时区），这会使得日志中记录的时间采用比中国采用的时区慢 8 小时，日志查看起来就没那么方便了。

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'log_timestamps';
+----------------+-------+
| Variable_name  | Value |
+----------------+-------+
| log_timestamps | UTC   |
+----------------+-------+
```
通常建议修改为 *system*，使得日志中的时间戳和系统的时间戳保持一致。

可以在线修改全局参数设定：
```sql
greatsql> SET GLOBAL log_timestamps = system;
```

再修改 my.cnf 配置文件使其持久化生效：

```ini
[mysqld]
log_timestamps = system
```

## 错误日志管理

对于很久以前的错误日志，通常已经没什么用处，可以将这些错误日志备份后清空。由于错误日志是以文本文件的形式存储的，可以在备份后直接清空。

```shell
# 备份后清空
$ cp mysqld.log mysqld-`date +'%Y%m%d'`.log
$ echo '' > mysqld.log

# 清空刷新
$ mysqladmin -uroot -p flush-logs
```

也可以在完成 `mv` 备份后，连入 GreatSQL 后执行相应的 SQL 命令

```sql
greatsql> FLUSH ERROR LOGS;
```


> 如果 GreatSQL 日志文件被其他进程打开或被锁定，执行 `mysqladmin flush-logs` 操作可能会失败

如果出现以下错误提示：

```sql
mysqladmin: refresh failed; error: 'Could not open file '/var/log/mysqld.log' for error logging.'
```

可以再进行下面的操作：

```shell
# 备份旧错误日志
$ mv mysqld.log mysqld-`date +'%Y%m%d'`.log

# 清空误日志文件
$ echo '' > mysqld.log
```

补充说明，关于 `flush-logs` 操作

- 在 GreatSQL 5.5.7 以前的版本，`flush-logs` 将错误日志文件重命名为 `filename.err_old`，然后创建新的日志文件。
- 从 GreatSQL 5.5.7 开始，`flush-logs` 只是重新打开日志文件句柄，并不进行日志备份和重新创建的操作。
- 如果日志文件不存在，GreatSQL 启动或者执行 `flush-logs` 时会自动创建新的日志文件；重新创建的错误日志，文件初始大小为 0 字节。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
