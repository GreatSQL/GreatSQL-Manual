# Daily Management
---

This article describes the daily management operations of the GreatSQL database, mainly including service management, parameter option adjustment, etc.

## Service Management

Regardless of whether GreatSQL is installed with RPM, binary package, or Ansible, it is recommended to use systemd to manage the GreatSQL service. In the Docker container environment, there is no need to use systemd to manage GreatSQL; just start and stop the entire container.

If GreatSQL is installed with the RPM package, the service name is `mysqld`. If installed with the binary package and Ansible, the service name is `greatsql`. For convenience, this article uniformly uses `greatsql`.

**Starting the service**
```bash
systemctl start greatsql
```

**Stopping the service**
```bash
systemctl stop greatsql
```

**Restarting the service**
```bash
systemctl restart greatsql
```

**Viewing the service status**
```bash
systemctl status greatsql
```

If an error occurs during execution, run the following command to view the error information:
```bash
journalctl -ex
```

For more content about managing the GreatSQL service with systemd, refer to: [Managing GreatSQL with systemd](../4-install-guide/8-greatsql-with-systemd.md).

## Modifying Parameter Options

### Modifying with SQL Commands and Taking Effect Immediately

Most parameter options in GreatSQL can be modified online with SQL commands and take effect immediately.

First, view the current value of the parameter option to be modified:
```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'innodb_buffer_pool_size';
+-------------------------+------------+
| Variable_name           | Value      |
+-------------------------+------------+
| innodb_buffer_pool_size | 6442450944 |
+-------------------------+------------+
```

Execute the `SET` command to modify the option value:
```sql
-- Modify to 8G
greatsql> SET GLOBAL innodb_buffer_pool_size = 8589934592;
Query OK, 0 rows affected (0.00 sec)

-- View again to confirm it takes effect
greatsql> SHOW GLOBAL VARIABLES LIKE 'innodb_buffer_pool_size';
+-------------------------+------------+
| Variable_name           | Value      |
+-------------------------+------------+
| innodb_buffer_pool_size | 8589934592 |
+-------------------------+------------+
```

There is a risk in directly modifying the option value online: you only remember to dynamically modify the current value but forget to modify the option in `my.cnf`. After the database restarts, this modification is reset.

Therefore, it is recommended to modify it in another way:
```sql
greatsql> SET PERSIST innodb_buffer_pool_size = 4294967296;
Query OK, 0 rows affected (0.00 sec)

greatsql> SHOW GLOBAL VARIABLES LIKE 'innodb_buffer_pool_size';
+-------------------------+------------+
| Variable_name           | Value      |
+-------------------------+------------+
| innodb_buffer_pool_size | 4294967296 |
+-------------------------+------------+
```
When modifying the option value with `SET PERSIST`, in addition to modifying it immediately, this modification is also recorded in `datadir/mysqld-auto.cnf`, and the option value is loaded on the next restart to take effect. Of course, the premise is that the option value `persisted_globals_load = ON` (the default value is also ON).

In this way, there is no worry about only modifying the current value and forgetting to modify the option value in `my.cnf`.

However, it is also possible that when troubleshooting, a DBA only remembers to check the `my.cnf` file but forgets to check the `mysqld-auto.cnf` file. This also needs attention.

### Modifying Only the Option Value, Taking Effect After Restart

You can also modify only the option value, but it does not take effect immediately; it takes effect only after the database restarts. There are several ways.

The first is to directly modify the `my.cnf` file, save and exit, and it takes effect on the next database restart.

The second is to execute `SET PERSIST_ONLY` to modify. At this time, the new option value is only recorded in `mysqld-auto.cnf`, and the option value in memory is not modified immediately.
```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'innodb_buffer_pool_size';
+-------------------------+------------+
| Variable_name           | Value      |
+-------------------------+------------+
| innodb_buffer_pool_size | 6442450944 |
+-------------------------+------------+
1 row in set (0.01 sec)

greatsql> SET PERSIST_ONLY innodb_buffer_pool_size = 4294967296;
Query OK, 0 rows affected (0.00 sec)

greatsql> SHOW GLOBAL VARIABLES LIKE 'innodb_buffer_pool_size';
+-------------------------+------------+
| Variable_name           | Value      |
+-------------------------+------------+
| innodb_buffer_pool_size | 6442450944 |
+-------------------------+------------+

$ grep innodb_buffer_pool_size /data/GreatSQL/mysqld-auto.cnf
...
"innodb_buffer_pool_size" : { "Value" : "4294967296" , "Metadata" : { "Timestamp" : 1658134448865009 , "User" : "root" , "Host" : "localhost" } } ,
...
```
It can be seen that the new option value has been written to `mysqld-auto.cnf`, while the memory value of the current running state remains unchanged.

## Other Management

### Log Management

During database operation, various logs are generated, including the [general log](../2-about-greatsql/4-7-greatsql-general-log.md), [error log](../2-about-greatsql/4-1-greatsql-error-log.md), [slow query log](../2-about-greatsql/4-2-greatsql-slow-log.md), [binary log](../2-about-greatsql/4-3-greatsql-binary-log.md), [relay log](../2-about-greatsql/4-4-greatsql-relay-log.md), etc.

By default, only the error log, binary log, and relay log are enabled, while the general log and slow query log are not enabled by default.

In addition, there are also the [redo log](../2-about-greatsql/4-5-greatsql-redo-log.md) and [undo log](../2-about-greatsql/4-6-greatsql-undo-log.md) at the InnoDB storage engine layer.

| Log | Brief Description |
| --- | --- |
| binary log | Abbreviated as binlog. Records various change operations on the database, mainly used for database replication and data recovery |
| error log | Records various error information generated during MySQL startup, running, and shutdown, facilitating fault troubleshooting |
| slow query log | Records SQL statements identified as slow queries |
| relay log | During source-replica replication, the dump log on the replica node, used for the replica node to apply database change operations to keep data consistent with the primary node |
| general log | Records in detail the establishment of connections and all executed SQL statements. Usually temporarily enabled for fault troubleshooting or SQL auditing |
| redo log | The InnoDB engine records logs of data page modifications, following the WAL principle, used to guarantee database crash safety, and also used for online hot backup |
| undo log | Records information before data changes, mainly used for transaction rollback, and also used for multi-version concurrency control |

### Cleaning Up binlog

During database operation, as users continuously execute various operations on the database, binlog keeps increasing. The default setting is that binlog is only automatically cleaned up after 30 days (`binlog_expire_logs_seconds = 2592000`). Therefore, when available disk space is tight, the binlog cleanup operation needs to be manually executed. For example:
```sql
-- List all current binlogs
greatsql> SHOW BINARY LOGS;
+---------------------+------------+
| Log_name            | File_size  |
+---------------------+------------+
| greatsql-bin.001425 | 1076686944 |
| greatsql-bin.001426 | 1075651098 |
...
| greatsql-bin.001465 | 1077719005 |
| greatsql-bin.001466 |  416814070 |
+---------------------+------------+
42 rows in set (0.00 sec)

-- It can be seen that there are 42 binlogs in total
-- For example, now only want to keep the latest 2, and clear the rest
greatsql> PURGE BINARY LOGS TO 'greatsql-bin.001465';
Query OK, 0 rows affected (1.99 sec)

-- View again
-- The database is currently being stress tested, so many binlogs were generated quickly again
greatsql> SHOW BINARY LOGS;
+---------------------+------------+
| Log_name            | File_size  |
+---------------------+------------+
| greatsql-bin.001465 | 1077719005 |
| greatsql-bin.001466 | 1074612115 |
...
| greatsql-bin.001480 | 1074615588 |
| greatsql-bin.001481 |  856380441 |
+---------------------+------------+
17 rows in set (0.00 sec)

-- Reset the binlog automatic cleanup period to 7 days
greatsql> SET PERSIST binlog_expire_logs_seconds = 604800;
```

::: warning Warning
Before cleaning up binlog, be sure to make a backup, to avoid affecting subsequent database recovery needs.
:::

### Cleaning Up the slow query log

When recording the slow query log is enabled, it may be because of high business pressure, or because the `long_query_time` threshold is set too low, or because `log_queries_not_using_indexes = ON` is set and a large number of no-index SQL requests are recorded, ultimately causing the slow query log file to be too large. Regular inspection and cleanup are also needed.

The following is a slow query log setting reference suitable for most business scenarios:
```ini
[mysqld]
slow_query_log = 1
log_slow_extra = 1
log_slow_verbosity = FULL
slow_query_log_file = slow.log
long_query_time = 0.05
log_queries_not_using_indexes = 1
log_throttle_queries_not_using_indexes = 60
min_examined_row_limit = 0
log_slow_admin_statements = 1
log_slow_replica_statements = 1
```

The following command can be executed to clean up the slow query log. Remember to make a backup before cleaning:
```bash
cp slow.log slow.log-`date +%Y%m%d`
echo '' > slow.log
```

Then connect to GreatSQL and execute the SQL command
```sql
FLUSH SLOW LOGS;
```
In this way, the slow query log can be cleared.

### Cleaning Up the general log / error log

Similar to cleaning up the slow query log, first back up the log files, then execute the SQL commands:
```sql
FLUSH GENERAL LOGS;
FLUSH ERROR LOGS;
```

For details, refer to the document: [FLUSH Statement](https://dev.mysql.com/doc/refman/8.0/en/flush.html).

### Routine Table Maintenance

Generally speaking, data tables in production environments do not need maintenance, unless the following situations occur:

- The index statistics have serious deviations, affecting the SQL execution plan.
- The data table has a large number of fragments/holes, which may cause the physical I/O efficiency of this table to decrease.

For the above two situations, we can regularly perform necessary maintenance on the data tables.

1. Updating index statistics

First, execute the following SQL to find tables whose index statistics may be inaccurate:

::: tip Working method

1. Scan all index statistics

2. Compare the statistics of secondary indexes that include primary key columns with the statistics of the primary key index columns to get a percentage stat_pct

3. Sort by stat_pct. The lower the value, the less accurate the secondary index statistics are, and the more attention is needed
:::

```sql
greatsql> SET @statdb = 'greatsql';
SELECT 
a.database_name ,
a.table_name ,
a.index_name ,
a.stat_value SK,
b.stat_value PK, 
round((a.stat_value/b.stat_value)*100,2) stat_pct
FROM 
(
SELECT 
b.database_name  ,
b.table_name  ,
b.index_name ,  
b.stat_value
FROM 
(
SELECT database_name  ,
table_name  ,
index_name ,  
max(stat_name) stat_name 
FROM innodb_index_stats 
WHERE database_name = @statdb
AND stat_name NOT IN ( 'size' ,'n_leaf_pages' )
GROUP BY 
database_name  ,
table_name  ,
index_name   
) a JOIN innodb_index_stats b ON a.database_name=b.database_name
AND a.table_name=b.table_name
AND a.index_name=b.index_name
AND a.stat_name=b.stat_name 
AND b.index_name !='PRIMARY'
) a LEFT JOIN 
(
SELECT 
b.database_name  ,
b.table_name  ,
b.index_name ,  
b.stat_value
FROM 
(
SELECT database_name  ,
table_name  ,
index_name ,  
MAX(stat_name) stat_name 
FROM innodb_index_stats 
WHERE database_name = @statdb
AND stat_name NOT IN ( 'size' ,'n_leaf_pages' )
GROUP BY 
database_name  ,
table_name  ,
index_name   
) a JOIN innodb_index_stats b 
ON a.database_name=b.database_name
AND a.table_name=b.table_name
AND a.index_name=b.index_name
AND a.stat_name=b.stat_name
AND b.index_name ='PRIMARY'
) b 
ON a.database_name=b.database_name
AND a.table_name=b.table_name
WHERE b.stat_value IS NOT NULL 
AND  a.stat_value >0
ORDER BY stat_pct;

+---------------+-------------------+--------------+--------+--------+----------+
| database_name | table_name        | index_name   | SK     | PK     | stat_pct |
+---------------+-------------------+--------------+--------+--------+----------+
| greatsql      | t_json_vs_vchar   | c1vc         |  37326 |  39825 |    93.73 |
| greatsql      | t_json_vs_vchar   | c2vc         |  37371 |  39825 |    93.84 |
| greatsql      | t1                | name         | 299815 | 299842 |    99.99 |
| greatsql      | t4                | c2           |      2 |      2 |   100.00 |
+---------------+-------------------+--------------+--------+--------+----------+
```

Of course, when checking and analyzing business SQL, its execution plan is usually also viewed. If the execution plan of some SQL is not as expected, it may also be caused by inaccurate index statistics. In this case, manual confirmation can be done.

Execute the following command to update index statistics during the low-load period of business:
```sql
greatsql> ANALYZE TABLE t1;
+-------------+---------+----------+----------+
| Table       | Op      | Msg_type | Msg_text |
+-------------+---------+----------+----------+
| greatsql.t1 | analyze | status   | OK       |
+-------------+---------+----------+----------+
1 row in set (0.01 sec)
```

Under normal circumstances, the above maintenance command finishes quickly.

However, if the table has already been locked with an MDL lock, it will be blocked, so it is best to check before executing.

Executing `ANALYZE TABLE` adds a read-only lock to the data table. Because the table also needs to be removed from the `table definition cache`, a `FLUSH` lock is also needed.

Before MySQL 8.0.24, if there are unfinished requests on the table, executing `ANALYZE TABLE` at this time causes other requests on the table to be blocked. This situation has been resolved after 8.0.24.

In addition, executing the `ANALYZE TABLE` operation also writes to binlog, so the replica node also performs it. If you do not want it written to binlog, add the `NO_WRITE_TO_BINLOG` keyword.

Reference documents:

- [mysql-toolkit-sql](https://github.com/zhishutech/mysqldba/blob/master/mysql-tools/mysql-toolkit-sql.md)
- [ANALYZE TABLE Statement](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html)

2. Reorganizing data tables to eliminate fragments

Data tables in online production environments may generate a large number of fragments because of unreasonable table structure design, or after long periods of random write requests, which may cause the physical I/O efficiency of this table to decrease.

If the fragmentation rate is particularly high and the impact on performance is indeed very serious, the tablespace needs to be reorganized to eliminate fragments.

First, execute the following SQL command to see which tables may have a higher fragmentation rate:
```sql
greatsql> SELECT TABLE_SCHEMA as `db`, TABLE_NAME as `tbl`, 
  1-(TABLE_ROWS*AVG_ROW_LENGTH)/(DATA_LENGTH + INDEX_LENGTH + DATA_FREE) AS `fragment_pct`,
  TABLE_ROWS
  FROM information_schema.TABLES WHERE 
  TABLE_SCHEMA = 'greatsql' AND TABLE_ROWS >= 10000 ORDER BY fragment_pct DESC, TABLE_ROWS DESC;
+----------+----------+--------------+------------+
| db       | tbl      | fragment_pct | TABLE_ROWS |
+----------+----------+--------------+------------+
| greatsql | sbtest1  |       0.5492 |      12578 |
| greatsql | sbtest2  |       0.5492 |      12450 |
| greatsql | sbtest10 |       0.4874 |      12780 |
| greatsql | sbtest6  |       0.4871 |      13034 |
...
```

The query results are sorted in descending order by fragmentation rate, and the ones at the front have a higher fragmentation rate. Of course, if the table has a very small amount of data, this statistic may be inaccurate, and this also needs to be identified.

If the table data volume is small, or the tablespace file is small, the following SQL command can be directly executed to reorganize the tablespace and eliminate fragments:
```sql
ALTER TABLE sbtest1 ENGINE = innodb;
```

If the table data volume is large, or the tablespace file is large, it is **strongly recommended** to use the `pt-online-schema-change` tool to reorganize the tablespace and eliminate fragments, for example:
```bash
$ pt-online-schema-change --socket=/data/GreatSQL/mysql.sock --alter "ENGINE=InnoDB" D=greatsql,t=sbtest1

...
No slaves found.  See --recursion-method if host greatsql has slaves.
Not checking slave lag because no slaves were found and --check-slave-lag was not specified.
Operation, tries, wait:
  analyze_table, 10, 1
  copy_rows, 10, 0.25
  create_triggers, 10, 1
  drop_triggers, 10, 1
  swap_tables, 10, 1
  update_foreign_keys, 10, 1
Altering `greatsql`.`sbtest1`...
Creating new table...
Created new table greatsql._sbtest1_new OK.
Altering new table...
Altered `greatsql`.`_sbtest1_new` OK.

Creating triggers...
Created triggers OK.
Copying approximately 12578 rows...
Copied rows OK.
Analyzing new table...
Swapping tables...
Swapped original and new tables OK.
Dropping old table...
Dropped old table `greatsql`.`_sbtest1_old` OK.
Dropping triggers...
Dropped triggers OK.
Successfully altered `greatsql`.`sbtest1`.
```
This completes the tablespace reorganization and effectively eliminates fragments.

::: tip Tip
When reorganizing the tablespace, pay attention to whether the remaining disk space of the system is sufficient, because the entire table may be copied once during the reorganization, which could fill up the disk space.
:::

During the daily operation of the database, for what matters need attention and what routine checks need to be done, refer to the following resources:

- [mysql-toolkit-sql](https://github.com/zhishutech/mysqldba/blob/master/mysql-tools/mysql-toolkit-sql.md)
- [check_mysql.py](https://github.com/zhishutech/mysqldba/blob/master/mysql-tools/check_mysql.py)
- [How to Do MySQL Inspections](https://github.com/zhishutech/mysqldba/blob/master/mysql-tools/MySQL%E5%B7%A1%E6%A3%80%E6%80%8E%E4%B9%88%E5%81%9A%EF%BC%9F.md)

### Configuring the GreatSQL Client
The following GreatSQL client configuration parameters are recommended:
```ini
[mysql]
loose-skip-binary-as-hex
prompt = "greatsql [\\u@\\h][\\d]>"
no-auto-rehash
[mysqld]
...
```
Among them, `no-auto-rehash` is especially important and can effectively improve login efficiency.

Because every time the GreatSQL client program logs in, it reads all data object metadata information by default. If there are especially many database objects in the current instance, this process is very slow, and sometimes MDL lock waits may even occur.

For more client configuration parameters, refer to: [Advanced Client Operations](https://mp.weixin.qq.com/s/dM_Kr23h-yXo61uSf8uPNQ)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
