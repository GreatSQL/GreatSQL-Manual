# General Log

## What Is the General Log

The General Log records all requests sent to the GreatSQL server, regardless of whether these requests were executed correctly.

The general log records including the startup and shutdown of the GreatSQL service, the connection start and end times of all users, and all requests sent to the GreatSQL database server.

It is a very useful debugging tool that can help DBAs and developers monitor database operations and troubleshoot problems.

## Setting Methods

The general log can be set through the my.cnf configuration file or dynamically at runtime.

### Setting in the my.cnf Configuration File

Add the following settings to the configuration file my.cnf:

```ini
[mysqld]
general_log=ON
general_log_file=/data/GreatSQL/general.log
```

### Setting Dynamically at Runtime

SQL statements can be used to enable or disable the general log while GreatSQL is running:

```sql
-- Enable the general log
SET GLOBAL general_log=ON;

-- Disable the general log
SET GLOBAL general_log=OFF;

-- Set the general log file path
SET GLOBAL general_log_file='/data/GreatSQL/general.log';
```

The general log supports online dynamic enabling/disabling, as well as setting the log file path.

## Viewing the Current Status

The following command can be used to view the current status of the general log:

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'general_log%';
+------------------+----------------------------+
| Variable_name    | Value                      |
+------------------+----------------------------+
| general_log      | OFF                        |
| general_log_file | /data/GreatSQL/general.log |
+------------------+----------------------------+
```

## Viewing Log Contents

The general log is stored in the file system as a text file and can be opened directly with a text editor.

```bash
$ cd /data/GreatSQL && cat general.log

...
/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld, Version: 8.0.32-27 (GreatSQL, Release 27, Revision aa66a385910), started with:
Tcp port: 3306  Unix socket: /data/GreatSQL/mysql.sock
Time                 Id Command    Argument
16 Connect   root@localhost on  using Socket
16 Query     select @@version_comment limit 1
16 Query     select version()
16 Query     select user()
16 Quit
```

From the above content, the specific time point, connection ID, request type, and specific request command can all be seen at a glance.

## Managing the General Log

After the general log is enabled, if requests to the database are very frequent, the general log file grows quickly and can easily exhaust disk space. DBAs need to frequently monitor disk space utilization and promptly clear older log content to ensure that the hard disk space on the server is not exhausted.

In GreatSQL, the `mysqladmin flush-logs general` command can be used to refresh the general log (its actual function is: first close the file handle, then reopen it), for example:

```bash
mysqladmin -uroot -p flush-logs general
```
The following command can also be executed to complete the general log refresh:

```sql
FLUSH GENERAL LOGS;
```

The new general log directly overwrites the old query log, so the usual practice is to first back up the old log file, then clear it, and immediately execute the refresh operation to regenerate the general log file.

In addition to the manual refresh method above, restarting the GreatSQL service also refreshes the general log.

## Usage Notes

1. **Performance impact**

Enabling the general log affects database performance, because every query needs to be recorded in the log. For high-load production environments, it is recommended to use the general log with caution.

2. **Disk space**

The general log can quickly become very large and occupy a lot of disk space. Therefore, it is recommended to regularly monitor the log file size and take corresponding measures, such as log rotation or cleaning up expired logs.

3. **Privacy and security**

The general log records all queries, including query contents that may contain sensitive information. Therefore, pay attention to protecting the security of the log files and preventing unauthorized access.

4. **Enable on demand, disable after use**

When there is a problem to troubleshoot, enable it temporarily; after troubleshooting or debugging is completed, it is recommended to promptly disable the general log, to avoid affecting database performance and increasing unnecessary disk space usage.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
