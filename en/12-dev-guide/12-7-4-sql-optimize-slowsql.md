# Slow Query Analysis & Optimization
---

This section describes how to locate those SQL statements with poor performance at runtime (that is, the so-called slow SQL queries), analyze them, and optimize them.

## Slow Query SQL Settings

By default, slow SQL queries are not recorded; you need to configure this yourself. You can refer to the following `my.cnf` configuration template:

```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = slow.log
log_slow_extra = 1
log_slow_verbosity = FULL
long_query_time = 0.01
log_queries_not_using_indexes = 1
log_throttle_queries_not_using_indexes = 60
min_examined_row_limit = 100
log_slow_admin_statements = 1
log_slow_slave_statements = 1
```

The options are briefly introduced as follows:

| Option | Description |
| --- | --- |
| slow_query_log | Master switch; whether to enable the slow query log. |
| slow_query_log_file | Sets the slow query log file name. |
| log_slow_extra | A new option since MySQL 8.0.14; it records more information in the slow query log, such as the thread ID, bytes read/written, whether a temporary table was used, whether sorting was performed, and so on. It only takes effect when `log_output=FILE`; if set to *TABLE*, it has no effect. |
| log_slow_verbosity | A Percona/GreatSQL-specific option similar to `log_slow_extra`. It can be set to *FULL* to record more detailed information, making it easier to analyze the performance bottlenecks of slow SQL queries. |
| log_slow_admin_statements | Whether to record slow queries for DDL administrative statements such as `ALTER TABLE/ANALYZE TABLE `.
| log_slow_slave_statements | Whether to record slow queries produced when the **sql_thread** thread on the replica applies SQL in source-replica replication. It only takes effect when `binlog_format=STATEMENT`; when set to *ROW/MIXED*, it does not take effect. |
| long_query_time | When a SQL statement runs longer than this threshold, it is classified as a slow query. Unit: seconds. When set to 0, all requests are recorded. |
| log_queries_not_using_indexes | When the executed SQL has no usable index, it is also classified as a slow query. |
| log_throttle_queries_not_using_indexes | When the option `log_queries_not_using_indexes=ON`, the number of slow queries recorded per minute may be very large. This option sets the maximum number of such slow queries to record per minute. |
| min_examined_row_limit | For qualifying slow SQL queries, when the number of scanned rows is below this threshold, they are no longer classified as slow queries. |

A classic slow query SQL record is as follows:

```log
# Time: 2022-07-26T09:59:16.979869+08:00
# User@Host: root[root] @ localhost []  Id: 945574
# Query_time: 0.001096  Lock_time: 0.000127 Rows_sent: 199  Rows_examined: 1600 Thread_id: 945574 Errno: 0 Killed: 0 Bytes_received: 0 Bytes_sent: 25143 Read_first: 1 Read_last: 0 Read_key: 1601 Read_next: 0 Read_prev: 0 Read_rnd: 0 Read_rnd_next: 1801 Sort_merge_passes: 0 Sort_range_count: 0 Sort_rows: 0 Sort_scan_count: 0 Created_tmp_disk_tables: 0 Created_tmp_tables: 1 Start: 2022-07-26T09:59:16.978773+08:00 End: 2022-07-26T09:59:16.979869+08:00 Schema: sbtest Rows_affected: 0
# Tmp_tables: 1  Tmp_disk_tables: 0  Tmp_table_sizes: 0
# InnoDB_trx_id: 0
# Full_scan: Yes  Full_join: No  Tmp_table: Yes  Tmp_table_on_disk: No
# Filesort: No  Filesort_on_disk: No  Merge_passes: 0
#   InnoDB_IO_r_ops: 0  InnoDB_IO_r_bytes: 0  InnoDB_IO_r_wait: 0.000000
#   InnoDB_rec_lock_wait: 0.000000  InnoDB_queue_wait: 0.000000
#   InnoDB_pages_distinct: 24
SET timestamp=1658800756;
select c, count(*) from t1 group by c;
```

From the log above, several pieces of information can be seen:

1. This SQL took 0.001096 seconds, that is, 1 millisecond.
2. It returned 199 rows and scanned 1,600 rows in total. If the number of scanned rows is large but the number of returned rows is small, the SQL statement is inefficient, and the indexes may be inappropriate.
3. Metrics such as **Read_\*** indicate how this SQL reads records—whether sequential reads, random reads, and so on.
4. Metrics such as **Sort_\*** indicate whether this SQL caused sorting and its cost. If sorting occurred and the cost is high, you need to find a way to optimize it.
5. Metrics such as **\*Tmp\*** indicate whether this SQL created temporary tables and their cost. If temporary tables are created and the cost is high, you need to find a way to optimize it.
6. **Full_scan/Full_join** indicates whether a full table scan or a full JOIN occurred. If so and the SQL takes a long time, you need to find a way to optimize it.
7. Metrics such as **InnoDB_IO_\*** indicate InnoDB logical read related data.
8. **InnoDB_rec_lock_wait** indicates whether there is row lock waiting.
9. **InnoDB_queue_wait** indicates whether there is queue waiting.
10. **InnoDB_pages_distinct** indicates how many InnoDB pages this SQL read in total, which is a very important metric.

You can even set `log_slow_verbosity = 'FULL,profiling'` to record detailed profiling (probe) information in the slow query log, for example:

```log
# Time: 2022-07-26T10:35:15.599728+08:00
# User@Host: root[root] @ localhost []  Id: 950529
# Query_time: 0.001020  Lock_time: 0.000118 Rows_sent: 199  Rows_examined: 1600 Thread_id: 950529 Errno: 0 Killed: 0 Bytes_received: 0 Bytes_sent: 25143 Read_first: 1 Read_last: 0 Read_key: 1601 Read_next: 0 Read_prev: 0 Read_rnd: 0 Read_rnd_next: 1801 Sort_merge_passes: 0 Sort_range_count: 0 Sort_rows: 0 Sort_scan_count: 0 Created_tmp_disk_tables: 0 Created_tmp_tables: 1 Start: 2022-07-26T10:35:15.598708+08:00 End: 2022-07-26T10:35:15.599728+08:00 Schema: sbtest Rows_affected: 0
# Tmp_tables: 1  Tmp_disk_tables: 0  Tmp_table_sizes: 0
# Profile_starting: 0.000070 Profile_starting_cpu: 0.000069 Profile_Executing_hook_on_transaction_begin.: 0.000006 Profile_Executing_hook_on_transaction_begin._cpu: 0.000006 Profile_starting: 0.000009 Profile_starting_cpu: 0.000009 Profile_checking_permissions: 0.000003 Profile_checking_permissions_cpu: 0.000003 Profile_Opening_tables: 0.000028 Profile_Opening_tables_cpu: 0.000028 Profile_init: 0.000003 Profile_init_cpu: 0.000002 Profile_System_lock: 0.000006 Profile_System_lock_cpu: 0.000006 Profile_optimizing: 0.000003 Profile_optimizing_cpu: 0.000003 Profile_statistics: 0.000010 Profile_statistics_cpu: 0.000010 Profile_preparing: 0.000007 Profile_preparing_cpu: 0.000007 Profile_Creating_tmp_table: 0.000026 Profile_Creating_tmp_table_cpu: 0.000026 Profile_executing: 0.000823 Profile_executing_cpu: 0.000807 Profile_end: 0.000003 Profile_end_cpu: 0.000003 Profile_query_end: 0.000002 Profile_query_end_cpu: 0.000002 Profile_waiting_for_handler_commit: 0.000008 Profile_waiting_for_handler_commit_cpu: 0.000010 Profile_closing_tables: 0.000006 Profile_closing_tables_cpu: 0.000005 Profile_freeing_items: 0.000009 Profile_freeing_items_cpu: 0.000009 Profile_logging_slow_query: 0.000001 Profile_logging_slow_query_cpu: 0.000001
# Profile_total: 0.001024 Profile_total_cpu: 0.001007
# InnoDB_trx_id: 0
# Full_scan: Yes  Full_join: No  Tmp_table: Yes  Tmp_table_on_disk: No
# Filesort: No  Filesort_on_disk: No  Merge_passes: 0
#   InnoDB_IO_r_ops: 0  InnoDB_IO_r_bytes: 0  InnoDB_IO_r_wait: 0.000000
#   InnoDB_rec_lock_wait: 0.000000  InnoDB_queue_wait: 0.000000
#   InnoDB_pages_distinct: 24
SET timestamp=1658802915;
select c, count(*) from t1 group by c;
```
In this way, profiling information can help you locate more quickly where the performance bottleneck of this SQL might be.

For more detailed interpretation, see: [Slow Query Log](https://www.percona.com/doc/percona-server/5.6/diagnostics/slow_extended.html#id1).

## Analyzing Slow Queries with `pt-query-digest`

`pt-query-digest` is a tool in the **pt-toolkit** suite produced by Percona, mainly used to analyze slow SQL queries. Besides slow queries, it can also analyze the binary log and the general log, and can perform real-time analysis through `SHOW PROCESSLIST` or by capturing network packets with `tcpdump`.

Installation steps are omitted; see: [Installing Percona Toolkit](https://www.percona.com/doc/percona-toolkit/LATEST/installation.html).

This article takes a simple analysis of a slow query log file as an example:

```bash
pt-query-digest /data/GreatSQL/slow.log > /tmp/slow-digest.txt
```

You can run the analysis directly without any additional parameters and output the results to another file. The file directly displays the execution time, count, percentage, and other information of each query, for example:

```log
/* user time and system time consumed by the tool analyzing the log, as well as physical memory and virtual memory size */
# 15.7s user time, 360ms system time, 41.25M rss, 186.59M vsz
# Current date: Sat Jan  7 23:11:32 2022
# Hostname: greatsql
# Files: slow.log
/* total number of slow queries; after formatting there are 435 unique SQL statements */
# Overall: 29.40k total, 435 unique, 0 QPS, 0x concurrency _______________
# Attribute          total     min     max     avg     95%  stddev  median
# ============     ======= ======= ======= ======= ======= ======= =======
/* total, minimum, average, 95% percentile, standard deviation, and median execution time of all SQL */
# Exec time         37138s   500ms    142s      1s      3s      2s   705ms
/* lock wait time */
# Lock time          3535s       0    135s   120ms   609ms   927ms   224us
/* amount of data sent to the client */
# Rows sent        435.22M       0   1.70M  15.16k  65.68k  52.60k       0
/* amount of data scanned */
# Rows examine       1.45G       0   3.40M  51.87k  65.68k  71.73k  65.68k
/* number of rows affected by insert/update/delete */
# Rows affecte       1.87M       0   1.70M   66.53    2.90  10.07k    1.96
/* number of bytes sent */
# Bytes sent        32.88G       0  57.75M   1.14M   2.88M   4.74M   51.63
/* SQL size */
# Query size         7.75M       6 1014.67k  276.42  487.09   6.15k  124.25
```
First is the summary statistics.

Next, sorted by total response time, you can see which SQL statements may have performance bottlenecks:

```log
# Profile
/* rank, SQL statement ID/identifier, total response time, percentage, total number of requests, average time per request, variance-to-mean ratio of response time, and SQL statement */
# Rank Query ID           Response time    Calls R/Call V/M   Item
# ==== ================== ================ ===== ====== ===== ============
#    1 0xCBFFFDC5A18B5CD4 13077.1621 35.2% 14945 0.8750  0.44 UPDATE wp_statistics_visit
#    2 0x813031B8BBC3B329  4878.6998 13.1%  2245 2.1731  5.10 COMMIT
#    3 0x67A347A2812914DF  2798.8377  7.5%  1515 1.8474  7.88 SELECT wp_statistics_visitor
#    4 0xD1A3ED0A00CB8636  2261.3010  6.1%  3807 0.5940  0.03 SELECT wp_statistics_visit
#    5 0x0359C20B19D50ED6   937.8136  2.5%   505 1.8571  0.56 UPDATE wp_statistics_visitor
#    6 0x8A0E5C140D1FEAE6   883.8182  2.4%   433 2.0412  2.44 UPDATE aws_sessions
#    7 0x94350EA2AB8AAC34   817.2749  2.2%   292 2.7989 22.57 UPDATE wp_options
#    8 0xA766EE8F7AB39063   657.8637  1.8%   348 1.8904  2.49 SELECT wp_terms wp_term_taxonomy wp_term_relationships
#    9 0xE35B37A6116CF667   657.3250  1.8%   322 2.0414  4.78 SELECT drupal_cache_field
#   10 0x3249292D0F4247BD   655.1189  1.8%   237 2.7642  7.89 INSERT drupal_cache_page
#   11 0xC6E83D2D23B205EB   548.1317  1.5%   263 2.0842  4.72 DELETE pre_common_session
#   12 0xC88DD5CE28F8574B   535.7342  1.4%   189 2.8346 10.93 INSERT pre_common_session
#   13 0x7FF1B2B54A693E87   509.4790  1.4%   287 1.7752  5.14 SELECT INFORMATION_SCHEMA.FILES INFORMATION_SCHEMA.PARTITIONS
#   14 0x0D7200302E76DA57   449.4795  1.2%   125 3.5958 42.33 INSERT drupal_captcha_sessions
```

Next is the analysis of a specific SQL statement, including the average and maximum execution time, the average and maximum scanned rows, the percentage distribution across different response time ranges, and so on:

```log
# Query 1: 0 QPS, 0x concurrency, ID 0xCBFFFDC5A18B5CD4 at byte 9260279 __
# This item is included in the report because it matches --limit.
# Scores: V/M = 0.44
# Attribute    pct   total     min     max     avg     95%  stddev  median
# ============ === ======= ======= ======= ======= ======= ======= =======
# Count         50   14945
# Exec time     35  13077s   500ms     11s   875ms      2s   623ms   640ms
# Lock time     83   2955s    89us      7s   198ms   900ms   481ms   247us
# Rows sent      0       0       0       0       0       0       0       0
# Rows examine  66 986.11M  67.36k  67.72k  67.57k  65.68k       0  65.68k
# Rows affecte   1  32.31k       1       7    2.21    2.90    0.51    1.96
# Bytes sent     0 758.93k      52      52      52      52       0      52
# Query size    23   1.80M     126     126     126     126       0     126
# String:
# Databases    greatsql
# Hosts        greatsql
# Last errno   0
# Time         2022-07-13... (1/0%), 2022-07-13... (1/0%)... 14943 more
# Users        greatsql
# Query_time distribution
#   1us
#  10us
# 100us
#   1ms
#  10ms
# 100ms  ################################################################
#    1s  ################
#  10s+  #
# Tables
#    SHOW TABLE STATUS FROM `greatsql` LIKE 'wp_statistics_visit'\G
#    SHOW CREATE TABLE `greatsql`.`wp_statistics_visit`\G
UPDATE wp_statistics_visit SET `visit` = `visit` + 1, `last_visit` = '2021-10-17 00:04:53' WHERE `last_counter` = '2021-10-17'\G
# Converted for EXPLAIN
# EXPLAIN /*!50100 PARTITIONS*/
select  `visit` = `visit` + 1, `last_visit` = '2021-10-17 00:04:53' from wp_statistics_visit where  `last_counter` = '2021-10-17'\G
```
At the very end, it even rewrites the `UPDATE` into a `SELECT`, making it convenient to view the execution plan of this SQL directly.

The `pt-query-digest` analysis results are already sorted. Optimize the slow queries that appear first in this order, and this will have a significant effect on improving database performance.

P.S. You can also use the `pt-query-digest` tool to analyze slow SQL queries, write the results into a database, and build a slow query management system together with Anemometer.

## Optimizing Slow Queries

Next, let's take a slow SQL query as an example to see how to optimize it.

First, view the execution plan of this SQL:

```sql
greatsql> EXPLAIN SELECT c, COUNT(*) FROM t1 GROUP BY c\G
           id: 1
  select_type: SIMPLE
        table: t1
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 1613
     filtered: 100.00
        Extra: Using temporary
```
As you can see, the execution plan indicates that this SQL needs a full table scan, with no index available, and it creates a temporary table.

For the above situation, and because the SQL above is relatively simple, you only need to add an index on column `c`:

```sql
greatsql> ALTER TABLE t1 ADD INDEX (c);

-- view the execution plan again
greatsql> explain select c, count(*) from t1 group by c\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: t1
   partitions: NULL
         type: index
possible_keys: c
          key: c
      key_len: 480
          ref: NULL
         rows: 1613
     filtered: 100.00
        Extra: Using index
```
As you can see, it can now use the index, and there is no temporary table.

Business SQL in production environments is generally more complex than this. SQL optimization needs to vary flexibly according to the actual situation, and it is usually not as simple as just adding an index.

In addition, GreatSQL supports automatic slow query log rotation by setting the following parameters:

- max_slowlog_size, sets the size of each slow query log file; the default value is 0, which means no automatic rotation.
- max_slowlog_files, sets the maximum number of files to keep after automatic slow query log rotation is enabled.

After automatic slow query log rotation is enabled, each slow query log gets a numeric suffix similar to binlog files, for example: `slow_query_log_file.000001`.

**References:**
- [Key elements to focus on in the EXPLAIN execution plan](https://mp.weixin.qq.com/s/CDKN_nPcIjzA_U5-xwAE5w)
- [Which PROCESSLIST states deserve attention](https://mp.weixin.qq.com/s/vhUmB9JO-Zt2P02gVk4mwg)
- [Slow query log rotation and expiration](https://docs.percona.com/percona-server/8.0/slowlog-rotation.html)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)