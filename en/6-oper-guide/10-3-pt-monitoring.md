# Percona Toolkit Monitoring

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## Monitoring

In Percona Toolkit, the monitoring category includes the following tools:

- `pt-deadlock-logger`: Extract and record MySQL/GreatSQL deadlocks.
- `pt-fk-error-logger`: Extract and record foreign key information.
- `pt-mext`: View status sample information in parallel.
- `pt-query-digest`: Analyze query logs and generate reports.
- `pt-mongodb-summary`: Collect information about MongoDB clusters.
- `pt-pg-summary`: Collect information about PostgreSQL clusters.

## pt-deadlock-logger

### Overview

Extract and record MySQL/GreatSQL deadlocks.

**Usage**

```bash
pt-deadlock-logger [OPTIONS] DSN
```

Record information about MySQL/GreatSQL deadlocks. The information is printed to `STDOUT`, and can also be saved to a table by specifying `--dest`. Unless `--run-time` or `--iterations` is specified, the tool runs forever.

### Options

All options of this tool are as follows:

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --charset           | Character set                                                       |
| --clear-deadlocks  | Create a small deadlock.<br />Use this newly generated deadlock to refresh the deadlock information in `Engine InnoDB Status`, indirectly achieving the result of clearing the large deadlock information in `Engine InnoDB Status`. The table name is `percona_schema.clear_deadlocks`. This table must not exist. The script automatically creates the table and deletes it after generating the deadlock. The table creation statement is `CREATE TABLE percona_schema.clear_deadlocks (a INT PRIMARY KEY) ENGINE=InnoDB` |
| --columns           | Result set fields                                                   |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --create-dest-table | Create the table specified by `--dest`                                         |
| --daemonize         | Run in the background                                                     |
| --database          | Connect to this database                                               |
| --defaults-file     | Read MySQL/GreatSQL options only from the given file                       |
| --dest              | Write the storage location of deadlocks in DSN format. At least the database and table must be specified                |
| --help              | Display help                                                     |
| --host              | Connect to the host                                                   |
| --interval          | The frequency of checking for deadlocks. If not specified, it defaults to running forever                   |
| --iterations        | The number of times to check for deadlocks. By default, if not specified, it is infinite. The exit time is limited by `--run-time` |
| --log               | Print all output to this file when daemonized                           |
| --numeric-ip        | Represent IP addresses as integers.                                       |
| --password          | The password used for the connection                                               |
| --pid               | Create the given PID file                                          |
| --port              | The port number used for the connection                                             |
| --quiet             | Do not report deadlocks, only print errors and warnings to STDERR                         |
| --run-time          | How long to run before exiting. By default, it runs forever, checking for deadlocks every `--interval` seconds. |
| --set-vars          | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket            | The socket file used for the connection                                         |
| --tab               | Use tabs instead of spaces to separate columns                                 |
| --user              | The login user                                                   |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

If you want to store all information about deadlocks extracted by `pt-deadlock-logger`, it is recommended to use the following table structure:

```sql
-- Can be adjusted according to the fields of --columns
CREATE TABLE deadlocks (
  server char(20) NOT NULL,
  ts timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  thread int unsigned NOT NULL,
  txn_id bigint unsigned NOT NULL,
  txn_time smallint unsigned NOT NULL,
  user char(16) NOT NULL,
  hostname char(20) NOT NULL,
  ip char(15) NOT NULL, -- alternatively, ip int unsigned NOT NULL
  db char(64) NOT NULL,
  tbl char(64) NOT NULL,
  idx char(64) NOT NULL,
  lock_type char(16) NOT NULL,
  lock_mode char(1) NOT NULL,
  wait_hold char(1) NOT NULL,
  victim tinyint unsigned NOT NULL,
  query text NOT NULL,
  PRIMARY KEY  (server,ts,thread)
) ENGINE=InnoDB;
```

- `server`: The (source) server where the deadlock occurred.
- `ts`: The date and time when the deadlock was last detected.
- `thread`: The GreatSQL thread number, consistent with the ID in `SHOW FULL PROCESSLIST`.
- `txn_id`: The InnoDB transaction ID.
- `txn_time`: The time the transaction was active when the deadlock occurred.
- `user`: The connected database username.
- `hostname`: The connected host.
- `ip`: The connected IP address. If `--numeric-ip` is specified, it is converted to an unsigned integer.
- `db`: The database where the deadlock occurred.
- `tbl`: The table where the deadlock occurred.
- `idx`: The index where the deadlock occurred.
- `lock_type`: The type of the transaction holding the lock that caused the deadlock.
- `lock_mode`: The lock mode of the lock that caused the deadlock.
- `wait_hold`: Whether the transaction is waiting for the lock or holding the lock.
- `victim`: Whether the transaction was selected as the rollback candidate (victim) and rolled back.
- `query`: The query that caused the deadlock.

First create the `deadlocks` table provided above, or add `--create-dest-table` to the command to automatically create the table:

```sql
greatsql> CREATE TABLE deadlocks 
-- ......the middle is omitted
Query OK, 0 rows affected (0.06 sec)
```

Save the deadlock information generated on the host1 host to the deadlocks table under the test_db database on the host2 host:

```bash
pt-deadlock-logger h=localhost,P=3306,u=root,p='' --dest h=localhost,P=3307,u=root,p='',D=test_db,t=deadlocks
```
::: tip Tip
Because `--run-time` is not specified, the tool keeps running in the current window. To run in the background, use `--daemonize`.
:::

Manually create a deadlock:

| session 1                                   | session 2                                                    |
| ------------------------------------------- | ------------------------------------------------------------ |
| START TRANSACTION;                          |                                                              |
| UPDATE t1 SET c2 = 'greatsql' WHERE id = 1; | START TRANSACTION;                                           |
|                                             | UPDATE t1 SET c2 = 'GreatSQL' WHERE id = 2;                  |
| UPDATE t1 SET c2 = 'greatsql' WHERE id = 2; |                                                              |
|                                             | UPDATE t1 SET c2 = 'GreatSQL' WHERE id = 1;                  |
|                                             | ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction |

View the `deadlocks` table:

```bash
+-----------+---------------------+--------+--------+----------+------+-----------+----+---------+-----+---------+-----------+-----------+-----------+--------+--------------------------------------------+
| server    | ts                  | thread | txn_id | txn_time | user | hostname  | ip | db      | tbl | idx     | lock_type | lock_mode | wait_hold | victim | query                                      |
+-----------+---------------------+--------+--------+----------+------+-----------+----+---------+-----+---------+-----------+-----------+-----------+--------+--------------------------------------------+
| localhost | 2024-03-20 15:12:51 |   1216 |      0 |        8 | root | localhost |    | test_db | t1  | PRIMARY | RECORD    | X         | w         |      1 | UPDATE t1 SET c2 = 'GreatSQL' WHERE id = 1 |
| localhost | 2024-03-20 15:12:51 |   1230 |      0 |       11 | root | localhost |    | test_db | t1  | PRIMARY | RECORD    | X         | w         |      0 | UPDATE t1 SET c2 = 'greatsql' WHERE id = 2 |
+-----------+---------------------+--------+--------+----------+------+-----------+----+---------+-----+---------+-----------+-----------+-----------+--------+--------------------------------------------+
2 rows in set (0.00 sec)
```

The `deadlocks` table records the lock details, types, and SQL statements, which is more convenient than directly viewing `SHOW ENGINE INNODB STATUS`.

## pt-fk-error-logger

### Overview

The role of the `pt-fk-error-logger` tool is similar to `pt-deadlock-logger`. `pt-fk-error-logger` records MySQL/GreatSQL foreign key error information.

**Usage**

```bash
pt-fk-error-logger [OPTIONS] [DSN]
```

Record information about foreign key errors on the given DSN. The information is printed to `STDOUT`, and can also be saved to a table by specifying `--dest`. Unless `--run-time` or `--iterations` is specified, the tool runs forever.

### Options

All options of this tool are as follows

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --charset           | Character set                                                       |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --daemonize         | Run in the background                                                     |
| --database          | Connect to this database                                               |
| --defaults-file     | Read MySQL/GreatSQL options only from the given file                       |
| --dest              | Write the storage location of deadlocks in DSN format. At least the database and table must be specified                |
| --help              | Display help                                                     |
| --host              | Connect to the host                                                   |
| --interval          | The frequency of checking for deadlocks. If not specified, it defaults to running forever                   |
| --iterations        | The number of times to check for deadlocks. By default, if not specified, it is infinite. The exit time is limited by `--run-time` |
| --log               | Print all output to this file when daemonized.                           |
| --password          | The password used for the connection                                               |
| --pid               | Create the given PID file                                          |
| --port              | The port number used for the connection                                             |
| --quiet             | Do not report deadlocks, only print errors and warnings to STDERR                         |
| --run-time          | How long to run before exiting. By default, it runs forever, checking for deadlocks every `--interval` seconds. |
| --set-vars          | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket            | The socket file used for the connection                                         |
| --user              | The login user                                                   |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

If you want to store all information about deadlocks that pt-fk-error-logger can extract, it is recommended to use the following table structure:

```sql
CREATE TABLE foreign_key_errors (
  ts datetime NOT NULL,
  error text NOT NULL,
  PRIMARY KEY (ts)
);
```

- `ts`: The recording time
- `error`: The error description

Save the foreign key constraint violation information generated on the host1 host to the foreign_key_errors table under the test_db database on the host2 host:

```bash
pt-fk-error-logger h=localhost,P=3306,u=root,p='',S=/data/GreatSQL01/mysql.sock --dest h=localhost,P=3307,u=root,p='',S=/data/GreatSQL02/mysql.sock,D=test_db,t=foreign_key_errors
```

Manually create an index constraint violation:

```sql
-- Create the t_fk1 table
CREATE TABLE `t_fk1` (  
  `id` int unsigned NOT NULL AUTO_INCREMENT,  
  `k` int unsigned NOT NULL DEFAULT '0',  
  `c` char(20) NOT NULL DEFAULT '',  
  `pad` char(20) NOT NULL DEFAULT '',  
  PRIMARY KEY (`id`),  
  KEY `k_2` (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the t_fk2 table
CREATE TABLE `t_fk2` (  
  `id1` int unsigned NOT NULL AUTO_INCREMENT,  
  `id2` int unsigned NOT NULL,  
  PRIMARY KEY (`id1`),  
  KEY `id2` (`id2`),  
  CONSTRAINT `t2_ibfk_1` FOREIGN KEY (`id2`) REFERENCES `t1` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Insert data into the t_fk1 table:

```sql
greatsql> INSERT INTO t_fk1 VALUES(1,1,'a','a');
greatsql> INSERT INTO t_fk1 VALUES(2,2,'b','b');
greatsql> INSERT INTO t_fk1 VALUES(3,3,'c','c');
```

Insert data into the t_fk2 table:

```sql
greatsql> INSERT INTO t_fk2 VALUES(5,5);
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`test_db`.`t_fk2`, CONSTRAINT `t2_ibfk_1` FOREIGN KEY (`id2`) REFERENCES `t1` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE)
```

View the `foreign_key_errors` table:

```SQL
greatsql> SELECT * FROM foreign_key_errors\G
*************************** 1. row ***************************
   ts: 2024-03-20 16:21:51
error: 140628737369792 Transaction:
TRANSACTION 21974, ACTIVE 0 sec inserting
mysql tables in use 1, locked 1
3 lock struct(s), heap size 1128, 1 row lock(s), undo log entries 1
MySQL thread id 1235, OS thread handle 140628737369792, query id 90865 localhost root update
insert into t_fk2 values(5,5)
Foreign key constraint fails for table `test_db`.`t_fk2`:
,
  CONSTRAINT `t2_ibfk_1` FOREIGN KEY (`id2`) REFERENCES `t1` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
Trying to add in child table, in index id2 tuple:
DATA TUPLE: 2 fields;
 0: len 4; hex 00000005; asc     ;;
 1: len 4; hex 00000005; asc     ;;

But in parent table `test_db`.`t1`, in index PRIMARY,
the closest match we can find is record:
PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 00000006; asc     ;;
 1: len 6; hex 000000004339; asc     C9;;
 2: len 7; hex 82000003cb0110; asc        ;;
 3: len 4; hex 000f5bcd; asc   [ ;;
 4: len 17; hex 3139323639362e36393136393235323433; asc 192696.6916925243;;

1 row in set (0.00 sec)
```

The table clearly records that an attempt was made to insert the value `5` into the `id2` field of the `t_fk2` table, but according to the foreign key constraint `t2_ibfk_1`, this value must exist in the `id` field of the `t1` table.

## pt-mext

### Overview

View examples of MySQL/GreatSQL `SHOW GLOBAL STATUS` side by side.

**Usage**

```bash
pt-mext [OPTIONS] -- COMMAND
```

### Options

All options of this tool are as follows:

| Parameter       | Meaning                 |
| ---------- | -------------------- |
| --help     | Display help             |
| --relative | Subtract each column from the previous column |
| --version  | Display the version             |

### Best Practices

```bash
$ pt-mext -r -- mysqladmin ext -i10 -c3

Aborted_clients                              84                    0
Aborted_connects                             18                    0
Acl_cache_items_count                         0                    0
Binlog_cache_disk_use                        15                    0
Binlog_cache_use                            118                    0
# ······the following is omitted
```

- `-i10`: The collection interval.

- `-c5`: The number of collections.

- `-r`: Relative.

The above command has three iterations, but only the results of the first iteration and the differences between the second and first iterations are output. This means that each variable is listed in detail with an initial value (the first column) during this phase and the difference between every two sampling points.

In the above example, 84 in `Aborted_clients` is the initial value of the sample, and the following 0 is the difference between every two sampling points.

## pt-query-digest

### Overview

`pt-query-digest` is a tool for analyzing MySQL/GreatSQL slow queries. It can analyze Binlog, General log, and Slowlog, and can also analyze data captured by `SHOW PROCESSLIST` or MySQL/GreatSQL protocol data captured by `tcpdump`.

The analysis results can be output to a file. The analysis process first parameterizes the conditions of the query statements, then groups and counts the parameterized queries, and counts the execution time, number, and proportion of each query. With the analysis results, problems can be found for optimization.

**Usage**

```bash
pt-query-digest [OPTIONS] [FILES] [DSN]
```

### Options

All options of this tool are as follows

| Parameter                        | Meaning                                                         |
| --------------------------- | ------------------------------------------------------------ |
| --ask-pass                  | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --attribute-aliases         | Aliases for attribute lists, etc.                                               |
| --attribute-value-limit     | Sanity limits for attribute values                                             |
| --charset                   | Character set                                                       |
| --config                    | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --[no]continue-on-error     | Continue parsing even if errors occur                                       |
| --[no]create-history-table  | Create the `--history` table if it does not exist                            |
| --[no]create-review-table   | Create the `--review` table if it does not exist                           |
| --daemonize                 | Run in the background                                                     |
| --database                  | Connect to this database                                               |
| --defaults-file             | Read MySQL/GreatSQL options only from the given file                       |
| --embedded-attributes       | Two Perl regex patterns used to capture pseudo-attributes embedded in queries           |
| --expected-range            | Explain items when the quantity is more or less than expected (default value is 5,10)               |
| --explain                   | Run `EXPLAIN` on sample queries with this DSN and print the results                 |
| --filter                    | Discard events for which this Perl code does not return true                               |
| --group-by                  | Which attribute of the events to group by                                     |
| --help                      | Display help                                                     |
| --history                   | Save the metrics of each query class in the given table                               |
| --host                      | Connect to the host                                                   |
| --ignore-attributes         | Do not aggregate these attributes                                             |
| --inherit-attributes        | If missing, inherit these attributes from the last event that has them         |
| --interval                  | The frequency of checks                                                   |
| --iterations                | The number of collection and reporting cycles. If not specified, it is infinite. The exit time is limited by `--run-time` |
| --limit                     | Limit the output result percentage or number. The default value is 20, i.e., output the 20 slowest statements   |
| --log                       | Print all output to this file when daemonized                             |
| --max-hostname-length       | Truncate hostnames in reports to this length                                 |
| --max-line-length           | Set the line length                                                 |
| --order-by                  | Sort events by this attribute and aggregate function                             |
| --outliers                  | Report outliers by attribute                                             |
| --output                    | How to format and print the query analysis results                                 |
| --password                  | The password used for the connection                                               |
| --pid                       | Create the given PID file                                          |
| --port                      | The port number used for the connection                                             |
| --preserve-embedded-numbers | Preserve numbers in database/table names when fingerprinting queries                          |
| --processlist               | Poll the process list of this DSN for queries, sleeping `--interval` between polls    |
| --progress                  | Print progress reports to STDERR                                      |
| --read-timeout              | Wait this long for events from the input; 0 waits forever                    |
| --[no]report                | Print the query analysis report for each `--group-by` attribute                     |
| --report-all                | Report all queries, even those that have already been reviewed                         |
| --report-format             | Print these parts of the query analysis report (rusage,date,hostname,files,header,profile,query_report,prepared) |
| --report-histogram          | Plot the distribution of this attribute value                                         |
| --resume                    | Write the last file offset (if any) to the given file name               |
| --review                    | Save query classes for later review, and do not report reviewed classes               |
| --run-time                  | How long to run each `--iterations`, default runs forever               |
| --run-time-mode             | Set what the `--run-time` value applies to                               |
| --sample                    | Filter out all but the first N occurrences of each query                  |
| --slave-user                | Set the user used to connect to the replica                                       |
| --slave-password            | Set the password used to connect to the replica                                       |
| --set-vars                  | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --show-all                  | Show all values of these attributes                                         |
| --since                     | Only parse queries newer than this value (parse queries since this date)             |
| --socket                    | The socket file used for the connection                                         |
| --timeline                  | Display a timeline of events                                             |
| --type                      | The input type to parse                                             |
| --until                     | The cutoff time. Combined with since, it can analyze slow queries in a period                |
| --user                      | The login user                                                   |
| --variations                | Report the number of variations of these attribute values                                     |
| --version                   | Display the version                                                     |
| --[no]version-check         | Version check                                                     |
| --[no]vertical-format       | Output SQL results vertically                                              |
| --watch-server              | Which server IP address and port to watch when parsing tcpdump (such as "10.0.0.1:3306") (for `--type` tcpdump); all other servers are ignored |

### Best Practices

#### Directly Analyzing the Slow Query Log

```bash
pt-query-digest ./slow.log
```

**The first part**

```bash
-- User time, system time, physical memory usage, virtual memory usage
170ms user time, 0 system time, 29.88M rss, 38.17M vsz
-- The time of executing the tool
Current date: Thu Mar 21 10:13:18 2024
-- The hostname
Hostname: myarch
-- The analyzed file names
Files: ./slow.log
-- Total number of statements, number of unique statements, QPS, concurrency
Overall: 119 total, 18 unique, 0.00 QPS, 0.00x concurrency _____________
-- The log recording time range
Time range: 2024-03-08T09:52:08 to 2024-03-20T14:37:23
-- Attribute              total      min      max      avg     95%  stddev  median
Attribute          total     min     max     avg     95%  stddev  median
============     ======= ======= ======= ======= ======= ======= =======
Exec time           122s   189us     44s      1s      1s      6s   384us
Lock time          489us       0   198us     4us     6us    17us     1us
Rows sent          1.10M       0 535.35k   9.44k   1.26k  68.78k   97.36
Rows examine      97.56M     102  35.09M 839.55k 961.27k   4.59M   97.36
Rows affecte           0       0       0       0       0       0       0
Bytes sent       285.10M      56 202.68M   2.40M   9.76M  18.45M   5.45k
Query size        15.50k      30     250  133.39  202.40   52.84  143.84
......the following is omitted
```

- unique: The number of unique queries, i.e., after parameterizing the query conditions, how many different queries there are in total.
- 95%: Arrange all values from small to large, the number at the 95% position.
- median: The median, arrange all values from small to large, the number in the middle position.

::: tip Tip
If the `hostname` command is not available, an error `error: Can't exec "hostname"` may be reported. At this time, download `inetutils`.
:::

**The second part**

```bash
Profile
Rank Query ID                            Response time Calls R/Call  V/M   Item
==== =================================== ============= ===== ======= ====  ========
   1 0x4029831C8032DEE4724E42576E2C52A6  83.1656 68.2%     2 41.5828  0.37 SELECT tpch.lineitem
   2 0x6472467F1FD96D847221959F021B8110  22.8429 18.7%     1 22.8429  0.00 SELECT xxl_job_log
   3 0x34BC467D466B794E79C020BEF3BFFE95   6.3289  5.2%     7  0.9041  1.17 SELECT test_index
   4 0x14810CF629251E9A8950ED961EA04448   4.3492  3.6%     6  0.7249  0.06 SELECT test_db.xxl_job_log
```

This part parameterizes and groups the queries, then analyzes the execution of each type of query. The results are sorted from large to small by total execution time.

- Response: The total response time.
- time: The proportion of the total time of this query in this analysis.
- Calls: The number of executions, i.e., how many queries of this type there are in total in this analysis.
- R/Call: The average response time of each execution.
- V/M: The ratio of response time Variance-to-mean.
- Item: The query object.

**The third part**

This part lists the detailed statistics of the first query, listing the statistics of execution count, max, min, average, 95%, standard deviation, and median.

```bash
Query 1: 0.02 QPS, 0.92x concurrency, ID 0x4029831C8032DEE4724E42576E2C52A6 at byte 1789
This item is included in the report because it matches --limit.
Scores: V/M = 0.37
Time range: 2024-03-08T09:53:37 to 2024-03-08T09:55:07
Attribute    pct   total     min     max     avg     95%  stddev  median
============ === ======= ======= ======= ======= ======= ======= =======
Count          1       2
Exec time     68     83s     39s     44s     42s     44s      4s     42s
Lock time      2    11us     5us     6us     5us     6us       0     5us
Rows sent      0     273     133     140  136.50     140    4.95  136.50
Rows examine  71  70.19M  35.09M  35.09M  35.09M  35.09M       0  35.09M
Rows affecte   0       0       0       0       0       0       0       0
Bytes sent     0  38.41k  18.81k  19.60k  19.20k  19.60k  567.10  19.20k
Query size     0      98      49      49      49      49       0      49
String:
Databases    test_db
End          2024-03-08... (1/50%), 2024-03-08... (1/50%)
Hosts        localhost
Start        2024-03-08... (1/50%), 2024-03-08... (1/50%)
Users        root
Query_time distribution
  1us
 10us
100us
  1ms
 10ms
100ms
   1s
 10s+  ################################################################
Tables
   SHOW TABLE STATUS FROM `tpch` LIKE 'lineitem'\G
   SHOW CREATE TABLE `tpch`.`lineitem`\G
EXPLAIN /*!50100 PARTITIONS*/
select * from tpch.lineitem where l_suppkey=23045\G
```

- Exec time: Indicates the execution time of the query.
- Lock time: Indicates the time the query waited for locks.
- Rows sent: Indicates the number of rows returned by the query.
- Rows examined: Indicates the number of rows scanned by the query.
- Rows affected: Indicates the number of rows affected by the query.
- Bytes sent: Indicates the number of bytes sent by the query.
- Query size: Indicates the size of the query.
- Query_time distribution: The distribution of query time. It can be seen that the execution time of this SQL query is all above 10 seconds.
- Tables: The tables involved in this SQL query.
- EXPLAIN: The SQL statement of the query.

#### Analyzing Queries in a Specified Time Period

Analyze queries within 12 hours:

```bash
pt-query-digest --since=12h ./slow.log
```

Analyze queries within a specified time period:

```bash
pt-query-digest slow.log --since '2024-03-19 00:00:00' --until '2024-03-21 23:59:59'
```

#### Analyzing Slow Queries Containing Query Statements

```bash
pt-query-digest --filter '$event->{fingerprint} =~ m/^select/i' slow.log
```

#### Analyzing Queries of a Specified User

Replace root in `m/^root/i` with the corresponding user:

```bash
pt-query-digest --filter '($event->{user} || "") =~ m/^root/i' slow.log
```

#### Analyzing Other Logs

**Analyze binlog**

It must be parsed first before analysis:

```bash
mysqlbinlog binlog.000023 > binlog.000023.sql
```

After parsing, analyze the binlog:
```bash
pt-query-digest  --type=binlog  binlog.000023.sql > binlog_analysis.log
```

**Analyze the general log**

```bash
pt-query-digest  --type=genlog  general.log > general_analysis.log
```

#### Storing Query Results in a Table

Save queries to the `query_review` table or the `query_review_history` table. First look at the `query_review` table structure:

```sql
CREATE TABLE IF NOT EXISTS query_review (
   checksum     CHAR(32) NOT NULL PRIMARY KEY,
   fingerprint  TEXT NOT NULL,
   sample       TEXT NOT NULL,
   first_seen   DATETIME,
   last_seen    DATETIME,
   reviewed_by  VARCHAR(20),
   reviewed_on  DATETIME,
   comments     TEXT
)
```

Save queries to the query_review table. Using `--create-review-table` automatically creates it:

```bash
pt-query-digest --user=root --password='' --review h=localhost,D=test_db,t=query_review --create-review-table slow.log
```

#### Analyzing Data Captured by tcpdump

First use `tcpdump` to capture data:
```bash
tcpdump -s 65535 -x -nn -q -tttt -i any -c 1000 port 3306 > GreatSQL.tcp.txt
```
Then analyze the data captured by tcpdump:
```bash
pt-query-digest --type tcpdump GreatSQL.tcp.txt> tcp_analysis.log
```
::: tip Tip
If tcpdump is not available, install it manually.
:::

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
