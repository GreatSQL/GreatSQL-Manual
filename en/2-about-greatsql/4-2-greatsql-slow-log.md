# Slow Query Log

## What Is the Slow Query Log

GreatSQL's slow query log records statements in GreatSQL whose response time exceeds a threshold. When a request's response time exceeds `long_query_time`, it is recorded in the slow query log. It is generally also abbreviated as *slow log*.

The default value of the parameter `long_query_time` is 10, in units of *seconds*. It can be set to decimals, for example, 0.01 means 0.01 seconds, i.e., 10 ms (milliseconds). It is generally recommended that the `long_query_time` parameter value be no higher than 0.05, i.e., all requests with a response time exceeding 50 ms are treated as slow query requests.

The Slow Log can effectively help discover those SQL requests that respond slowly. Using the [`mysqldumpslow`](https://dev.mysql.com/doc/refman/8.0/en/mysqldumpslow.html) or [`pt-query-digest`](../12-dev-guide/12-7-4-sql-optimize-slowsql.md#analyzing-slow-queries-with-pt-query-digest) tools to optimize these slow queries can significantly improve GreatSQL's overall response efficiency and avoid serious performance bottleneck risks. When SQL requests are blocked in the GreatSQL database, or SQL requests become obviously slower, the Slow Log should be checked as soon as possible to find the slow queries that may be causing these problems.

The GreatSQL database does not record the Slow Log by default; relevant parameters need to be set manually to enable it. It is usually recommended to enable it, to facilitate timely discovery of potential performance bottleneck risks in the database.

## Configuring Slow Log

Execute the following command online to enable the Slow Log:
```sql
SET GLOBAL slow_query_log=ON;
```

Execute the following command to view whether the Slow Log is enabled, as well as other related configurations:

```sql
greatsql> SELECT * FROM performance_schema.global_variables WHERE VARIABLE_NAME LIKE 'slow_query_log%' OR VARIABLE_NAME LIKE 'long_q%';
+-----------------------------------+-------------------------------+
| VARIABLE_NAME                     | VARIABLE_VALUE                |
+-----------------------------------+-------------------------------+
| long_query_time                   | 0.050000                      |
| slow_query_log                    | ON                            |
| slow_query_log_always_write_time  | 10.000000                     |
| slow_query_log_file               | /data/GreatSQL/slow.log       |
| slow_query_log_use_global_control |                               |
+-----------------------------------+-------------------------------+
```

You can see that the Slow Log is enabled, the full path of the log file is `/data/GreatSQL/slow.log`, and the threshold for determining slow queries is 50 ms.

### About the long_query_time Threshold

Next, look at the parameter `long_query_time` that sets the response time threshold for determining slow queries. Execute the following command:

```sql
greatsql> SHOW VARIABLES LIKE 'long_query_time';
+-----------------+-----------+
| Variable_name   | Value     |
+-----------------+-----------+
| long_query_time | 0.050000  |
+-----------------+-----------+
```

It supports online dynamic modification of the global setting. After modification, it takes effect on newly created connections (the current session does not take effect immediately):
```sql
SET GLOBAL long_query_time=0.01;
```

It also supports modifying only the session-level setting, which takes effect immediately on the current connection session:
```sql
SET long_query_time=0.01;
```

- slow_query_log

| Property    | Value
| :--- | :--- |
| Command-Line Format    | --slow-query-log[={OFF|ON}] |
| System Variable    | slow_query_log |
| Scope    | Global |
| Dynamic    | Yes |
| SET_VAR Hint Applies    | No |
| Type    | Boolean |
| Default Value    | OFF |

- long_query_time

| Property    | Value |
| :--- | :--- |
| Command-Line Format    | --long-query-time=# |
| System Variable    | long_query_time |
| Scope    | Global, Session |
| Dynamic    | Yes |
| SET_VAR Hint Applies    | No |
| Type    | Numeric |
| Default Value    | 10 |
| Minimum Value    | 0 |

You can also modify the my.cnf configuration file to make it persistent (taking effect after the next database instance restart):

```ini
[mysqld]
slow_query_log=ON 
slow_query_log_file=/data/GreatSQL/slow.log 
long_query_time=0.01
```

If the full path of the Slow Log is not configured, it is stored by default in the `datadir` directory of the GreatSQL database; if no file name is specified, the default file name is `hostname-slow.log`.

### About min_examined_row_limit

This parameter is used to set an additional condition for the Slow Query Log. When a SQL request's response time exceeds the `long_query_time` threshold, but the number of rows it scanned and read does not exceed `min_examined_row_limit`, it is still not determined to be a slow query.

In other words, when the `min_examined_row_limit` parameter value is greater than 0, a SQL request needs to satisfy both a response time exceeding `long_query_time` and the number of rows scanned and read exceeding `min_examined_row_limit` to be finally determined as a slow query.

```sql
greatsql> SHOW VARIABLES LIKE 'min_examined_row_limit';
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| min_examined_row_limit | 0     |
+------------------------+-------+
```

Its default value is 0, meaning this auxiliary judgment is not performed.

Like `long_query_time`, it can be modified both at the global setting and at the session level.

| Property    | Value |
| :--- | :--- |
| Command-Line Format    | --min-examined-row-limit=# |
| System Variable    | min_examined_row_limit |
| Scope    | Global, Session |
| Dynamic   |  Yes |
| SET_VAR Hint Applies    | No |
| Type    | Integer |
| Default Value    | 0 |
| Minimum Value    | 0 |
| Maximum Value (64-bit platforms)    | 18446744073709551615 |
| Maximum Value (32-bit platforms)    | 4294967295 |

### About log-queries-not-using-indexes

The role of the parameter `log-queries-not-using-indexes` is to also determine all query requests that fail to use indexes as slow queries. This may be because no index has been created, or because no suitable index can be used.

| Command-Line Format  | --log-queries-not-using-indexes[={OFF\|ON}] |
| :------------------- | ------------------------------------------- |
| System Variable      | log_queries_not_using_indexes               |
| Scope                | Global                                      |
| Dynamic              | Yes                                         |
| SET_VAR Hint Applies | No                                          |
| Type                 | Boolean                                     |
| Default Value        | OFF                                         |

### About log_throttle_queries_not_using_indexes

The parameter `log_throttle_queries_not_using_indexes` is used to set the number of SQL statements that do not use indexes written into the slow log per minute, avoiding a large number of identical SQL requests being written into the log in a short period, which affects overall performance. The default value of this parameter is 0, meaning it is not enabled.

| Command-Line Format  | --log-throttle-queries-not-using-indexes=# |
| :------------------- | ------------------------------------------ |
| System Variable      | log_throttle_queries_not_using_indexes     |
| Scope                | Global                                     |
| Dynamic              | Yes                                        |
| SET_VAR Hint Applies | No                                         |
| Type                 | Integer                                    |
| Default Value        | 0                                          |
| Minimum Value        | 0                                          |
| Maximum Value        | 4294967295                                 |

### About log_slow_extra

The parameter `log_slow_extra` was added starting from GreatSQL 8.0.14, used to set whether to record more detailed information in the slow log, such as *Thread_id*, *Read_rnd_next*, *Sort_merge_passes*, *Created_tmp_disk_tables*, *Created_tmp_tables*, etc. This extra information is quite helpful for analyzing and judging the performance bottlenecks of slow query SQL, so enabling it is recommended.

| Property    | Value |
| :--- | :--- |
| Command-Line Format    | --log-slow-extra[={OFF|ON}] |
| Introduced    | 8.0.14 |
| System Variable    | log_slow_extra |
| Scope    | Global |
| Dynamic    | Yes |
| SET_VAR Hint Applies    | No |
| Type    | Boolean |
| Default Value    | OFF |

### GreatSQL Enhancements to the Slow Log

When using GreatSQL to view slow query log contents, there is also `Query_time`, `Lock_time`, and more additional information, making the log content richer. This extra information can help better troubleshoot and analyze performance bottlenecks.

The following is demonstrated with a simple case.

Set the slow query duration threshold to 1 second:

```sql
SET GLOBAL slow_query_log=ON;
SET GLOBAL long_query_time=1;
SET long_query_time=1;
```

Execute a SQL request with a total duration exceeding 1 second:

```sql
greatsql> SELECT * FROM `student` WHERE id > 1000 AND `name` = 'Yunxi';
+---------+-------+-------+------+---------+
| 9999715 |   707 | Yunxi |  863 |      71 |
.......omitted
| 9999999 |   418 | Yunxi |  793 |     734 |
+---------+-------+-------+------+---------+
166949 rows in set (3.94 sec)

-- Query how many slow query records exist
greatsql> SHOW GLOBAL STATUS LIKE 'Slow_queries';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| Slow_queries  | 4     |
+---------------+-------+
```

View the slow query log file; this slow query has been recorded:

```sql
# Time: 2022-12-14T15:01:34.892085Z
# User@Host: root[root] @ localhost []  Id:     8
# Query_time: 3.985637  Lock_time: 0.000138 Rows_sent: 165346  Rows_examined: 9900000 Thread_id: 8 Errno: 0 Killed: 0 Bytes_received: 0 Bytes_sent: 4848540 Read_first: 0 Read_last: 0 Read_key: 1 Read_next: 9900000 Read_prev: 0 Read_rnd: 0 Read_rnd_next: 0 Sort_merge_passes: 0 Sort_range_count: 0 Sort_rows: 0 Sort_scan_count: 0 Created_tmp_disk_tables: 0 Created_tmp_tables: 0 Start: 2022-12-14T15:01:30.906448Z End: 2022-12-14T15:01:34.892085Z Schema: slow Rows_affected: 0
# Tmp_tables: 0  Tmp_disk_tables: 0  Tmp_table_sizes: 0
# InnoDB_trx_id: 0
# Full_scan: No  Full_join: No  Tmp_table: No  Tmp_table_on_disk: No
# Filesort: No  Filesort_on_disk: No  Merge_passes: 0
#   InnoDB_IO_r_ops: 27606  InnoDB_IO_r_bytes: 452296704  InnoDB_IO_r_wait: 0.220474
#   InnoDB_rec_lock_wait: 0.000000  InnoDB_queue_wait: 0.000000
#   InnoDB_pages_distinct: 8191
use slow;
SET timestamp=1671030090;
SELECT * FROM `student` WHERE id > 1000 AND `name` = 'Yunxi';
```

It can be seen that the slow query log records very detailed information. Several pieces of information can be seen from the above log:

1. This SQL took 3.985637 seconds.
2. The returned result has 165346 rows, and a total of 9900000 rows of data need to be scanned. If many rows are scanned but few rows are returned, it indicates that the SQL is inefficient, possibly due to improper indexes or missing `LIMIT` restrictions.
3. Metrics such as *Read_\** indicate the way this SQL reads records, whether sequential reads, random reads, etc.
4. Metrics such as *Sort_\** indicate whether this SQL generated sorting, and its cost. If so and the cost is large, optimization is needed.
5. Metrics such as *_tmp_\** indicate whether this SQL generated temporary tables or temporary files, and their cost. If so and the cost is large, optimization is needed.
6. *Full_scan/Full_join* indicates whether a full table scan or full table JOIN was generated. If so and the SQL duration is large, optimization is needed.
7. Metrics such as *InnoDB_IO_* indicate data related to InnoDB logical reads.
8. *InnoDB_rec_lock_wait* indicates whether there is row lock waiting.
9. *InnoDB_queue_wait* indicates whether there is queue waiting.
10. *InnoDB_pages_distinct* indicates how many InnoDB Pages this SQL read in total. This is a very important metric that can be used to help determine whether the fragmentation rate of the current table is high.

## Slow Query Log Analysis Tools

In production environments, manually analyzing logs and finding and analyzing SQL is obviously labor-intensive. GreatSQL provides the log analysis tool `mysqldumpslow`, or another tool `pt-query-digest` can be used.

The `pt-query-digest` tool can be used to analyze the general log, slow query log, binary log, as well as `PROCESSLIST` and `tcpdump` capture results to analyze GreatSQL's operating status. The analysis results can be output to files or written directly back to the database.

For detailed methods of slow log analysis, refer to:
- [Slow Query SQL Analysis and Optimization](../12-dev-guide/12-7-4-sql-optimize-slowsql.md#analyzing-slow-queries-with-pt-query-digest) 
- [The Complete Guide to Percona Toolkit](https://mp.weixin.qq.com/s/x37JiZoeZ5deFHhvNU1IDQ)

## Disabling the Slow Query Log
::: tip Tip
Unless you really do not need to pay attention to SQL execution efficiency, it is not recommended to disable the slow query log.
:::

Execute the following command to dynamically disable the slow query log online:

```sql
SET GLOBAL slow_query_log=off;
```

You can also modify the my.cnf configuration file to make it take effect persistently after the next restart (by default, the slow query log is not enabled):
```ini
[mysqld]
slow_query_log=OFF
```

## Slow Query Log Management

It is recommended that administrators regularly (for example, daily or weekly using scheduled tasks) pay attention to and analyze the slow query log. After analyzing the historical slow query logs, they can be backed up and then cleared to avoid continuous accumulation of log content:

```bash
cd /data/GreatSQL
cp slow.log slow-`date +'%Y%m%d'`.log
echo '' > slow.log

# Refresh the slow query log file
mysqladmin -uroot -p flush-logs slow
```

After completing the `cp` backup, you can also connect to GreatSQL and execute the corresponding SQL command to refresh the slow query log:

```sql
FLUSH SLOW LOGS;
```

::: warning Warning
Do not open the slow query log file online with vi or other tools on the server, as this may cause the file handle to be modified, making the file state abnormal and causing unexpected disk-full problems.
:::


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
