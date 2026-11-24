# Error Log

## What Is the Error Log

The **Error Log** is the most common log in GreatSQL. It mainly records information during the startup and shutdown of the GreatSQL server, as well as failures and abnormal conditions that occur while the server is running.

## Contents of the Error Log

The error log contains time information for GreatSQL startup and shutdown, and also contains diagnostic messages, such as errors, warnings, and other information requiring attention that appear during server startup and shutdown as well as while the server is running.

For example, the following situations:
- If GreatSQL detects that a table may be corrupted and needs to be checked or repaired, it is recorded in the error log.
- If the `mysqld` process is started with the `mysqld_safe` daemon, `mysqld_safe` records relevant information in the error log.
- When the `mysqld_safe` daemon detects that the `mysqld` process exited abnormally, it restarts the `mysqld` process and records relevant information in the error log.

Depending on the error log configuration, the error log may also be stored in the `performance_schema.error_log` table, which can be queried more conveniently through the SQL interface.

## Configuring the Error Log

In the GreatSQL database, the error log feature is enabled by default and cannot be disabled.

By default, the error log is stored in the `datadir` directory of the GreatSQL database, with the default name `mysqld.log` (Linux systems) or `hostname.err` (Mac systems). If you need to customize the file name, modify the following configuration in my.cnf:

```ini
[mysqld]
log-error=[path/[filename]] 
```
Where *path* is the directory path where the log file is located. It can be left unconfigured, and defaults to `datadir`; *filename* is the log file name, for example:

```ini
[mysqld]
log-error=/data/GreatSQL/error.log
# Or it can also be written like this
# log-error=error.log
```

After modifying the above configuration items, restart the GreatSQL service to take effect.

## Viewing the Error Log

The GreatSQL error log is stored as a text file and can be viewed directly with a text editor. Execute the following command to query the storage path of the error log:

```sql
SHOW VARIABLES LIKE 'log_error';
```

::: details View the result
```sql
greatsql> SHOW VARIABLES LIKE 'log_error';
+----------------------------+----------------------------------------+
| Variable_name              | Value                                  |
+----------------------------+----------------------------------------+
| log_error                  | /data/GreatSQL/error.log                |
+----------------------------+----------------------------------------+
```
:::

The above result indicates that the current GreatSQL error log file path is */data/GreatSQL/error.log*.

## Related Parameters

The following are parameters related to the error log.

- `log_error` The error log file path, supporting specification as a full path or relative path.
- `log_error_services` Sets which error log service components are used to control how error logs are processed and stored. This parameter can be set to 0, 1, or multiple optional values; in the latter case, the component list can be separated by semicolons or commas (starting from GreatSQL 8.0.12), and each service name represents a log processing component. These components can filter, format, or store log messages.

By default, `log_error_services` has the following selectable values:

```sql
greatsql> SELECT @@GLOBAL.log_error_services;
+----------------------------------------+
| @@GLOBAL.log_error_services            |
+----------------------------------------+
| log_filter_internal; log_sink_internal |
+----------------------------------------+
```

In the above configuration:

1. *log_filter_internal* is responsible for filtering unnecessary log information.

2. *log_sink_internal* is responsible for writing the filtered log information to the log file.

By properly configuring `log_error_services`, error log recording can be optimized, ensuring that the log information is both comprehensive and does not over-consume storage resources.

- `log_error_suppression_list` is used to suppress error log events, setting certain logs not to be recorded.
- `log_error_verbosity` sets the logging level. The selectable values are

| log_error_verbosity Value | Permitted Message Priorities |
| :------------------------ | :--------------------------- |
| 1                         | ERROR                        |
| 2                         | ERROR, WARNING               |
| 3                         | ERROR, WARNING, INFORMATION  |

It is recommended to set it to 3, so that more log information is recorded, making it easier to track and analyze various problems.

- `log_timestamps` controls the time displayed in the logs

Starting from GreatSQL 5.7.2, the `log_timestamps` parameter was added, used to set the recording method of timestamps in the [error log](#what-is-the-error-log) and the [general log](./4-7-greatsql-general-log.md). The default value of this parameter is *UTC* (simply put, the UTC+0 timezone), which makes the time recorded in the logs 8 hours slower than the timezone used in China, making log viewing less convenient.

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'log_timestamps';
+----------------+-------+
| Variable_name  | Value |
+----------------+-------+
| log_timestamps | UTC   |
+----------------+-------+
```
It is usually recommended to modify it to *system*, so that the timestamps in the logs are consistent with the system timestamps.

The global parameter setting can be modified online:
```sql
SET GLOBAL log_timestamps=system;
```

The my.cnf configuration file can also be modified to make it take effect persistently (taking effect after the next database instance restart):

```ini
[mysqld]
log_timestamps=system
```

## Error Log Management

Error logs from long ago are usually no longer useful. These error logs can be backed up and then cleared. Since the error log is stored as a text file, it can be directly cleared after backup:

```shell
# Backup and then clear
cd /data/GreatSQL
cp error.log error-`date +'%Y%m%d'`.log
echo '' > error.log

# Refresh the error log file
mysqladmin -uroot -p flush-logs error
```

After completing the `cp` backup, you can also connect to GreatSQL and execute the corresponding SQL command to refresh the error log:

```sql
FLUSH ERROR LOGS;
```

::: tip Tip
If the GreatSQL log file is opened or locked by other processes, executing `mysqladmin flush-logs error` may fail
:::

If the following error prompt appears:

```bash
mysqladmin: refresh failed; error: 'Could not open file '/data/GreatSQL/error.log' for error logging.'
```

You can perform the following operations:

```bash
# Backup the old error log
cd /data/GreatSQL
mv error.log error-`date +'%Y%m%d'`.log

# Clear the error log file
echo '' > error.log
```

::: warning Warning
Do not open the error log file online with vi or other tools on the server, as this may cause the file handle to be modified, making the file state abnormal and causing unexpected disk-full problems.
:::

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
