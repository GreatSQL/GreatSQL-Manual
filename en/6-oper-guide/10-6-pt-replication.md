# Percona Toolkit Replication

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## Replication

In Percona Toolkit, the replication category includes the following tools:

- `pt-heartbeat`: Monitor MySQL/GreatSQL replication delay.
- `pt-slave-delay`: Set the time the replica lags behind the source.
- `pt-slave-find`: Find and print all MySQL/GreatSQL replication hierarchy relationships.
- `pt-slave-restart`: Monitor Slave errors and try to restart the Slave.
- `pt-table-checksum`: Verify source-replica replication consistency.
- `pt-table-sync`: Efficiently synchronize table data.
- `pt-galera-log-explainer`: Filter, aggregate, and summarize multiple Galera logs.

## pt-heartbeat

### Overview

Used to monitor the source-replica delay. This tool inserts a record with the current time (the now() function in GreatSQL) into the heartbeat table on the Master. Then, this record is replicated to the Slave. The Slave determines the source-replica delay by subtracting the record value in the heartbeat table from the current system timestamp (the time function in Perl).

**Usage**

```bash
pt-heartbeat [OPTIONS] [DSN] --update|--monitor|--check|--stop
```

### Options

At least one of `--stop`, `--update`, `--monitor`, or `--check` must be specified.

**Mutual exclusion relationship**

`--update`, `--monitor`, and `--check` are mutually exclusive.

`--daemonize` and `--check` are mutually exclusive.

All options of this tool are as follows

| Parameter                       | Meaning                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset                  | Default character set                                                   |
| --check                    | Check the replica delay once and exit                                       |
| --check-read-only          | Check whether the server has read_only enabled                                |
| --config                   | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --create-table             | Create the heartbeat table `--table` if it does not exist                     |
| --create-table-engine      | Set the engine used for the heartbeat table                                    |
| --daemonize                | Run in the background                                                     |
| --database                 | The database used for the connection                                             |
| --dbi-driver               | Specify the driver used for the connection                                           |
| --defaults-file            | Read MySQL/GreatSQL options only from the given file                             |
| --file                     | Print the latest `--monitor` output to this file                          |
| --frames                   | The time range of averages, default is 1m,5m,15m                            |
| --help                     | Display help                                                     |
| --host                     | Connect to the host                                                   |
| --[no]insert-heartbeat-row | Insert the heartbeat row into `--table` if it does not exist                      |
| --interval                 | The frequency of updating or checking the heartbeat table, default 1 second                         |
| --log                      | Print all output to this file when running in the background                             |
| --master-server-id         | Calculate the delay of `--monitor` or `--check` based on this master server ID           |
| --monitor                  | Continuously monitor the replica delay                                             |
| --fail-successive-errors   | If specified, fail after the given number of successive DBI errors (unable to connect to the server or issue a query) |
| --password                 | The password used when connecting                                             |
| --pid                      | Create the given PID file                                          |
| --port                     | The port number used for the connection                                             |
| --print-master-server-id   | Print the automatically detected or given `--master-server-id`                 |
| --read-only-interval       | When `--check-read-only` is specified, the sleep interval when the server is found to be read-only |
| --recurse                  | In `--check` mode, recursively check replicas to this depth                        |
| --recursion-method         | The preferred recursion method used to find replicas                                   |
| --replace                  | Use `REPLACE` instead of `UPDATE` for `–update`                      |
| --run-time                 | Run time                                                     |
| --sentinel                 | Exit if this file exists                                         |
| --slave-user               | Set the user used to connect to replicas                                       |
| --slave-password           | Set the password used to connect to replicas                                       |
| --set-vars                 | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --skew                     | How long to delay the check, default value: 0.5                                    |
| --socket                   | The socket file used for the connection                                         |
| --stop                     | Stop the running instance by creating a sentinel file                               |
| --table                    | The table used for the heartbeat                                                 |
| --update                   | Update the heartbeat of the host                                               |
| --user                     | The login user                                                   |
| --utc                      | Ignore the system time zone and use only UTC                                     |
| --version                  | Display the version                                                     |
| --[no]version-check        | Version check                                                     |

### Best Practices

To demonstrate this tool, deploy single-machine multi-instances on the host and set up a one-source-one-replica mode. The environment is as follows:

| Database             | IP           | Port Number | Role   |
| ------------------ | ------------ | ------ | ------ |
| GreatSQL-8.0.32-27 | 192.168.6.55 | 3306   | Master |
| GreatSQL-8.0.32-27 | 192.168.6.55 | 3307   | Slave  |

First, you need to add the table on the Master

```bash
pt-heartbeat --user=root --ask-pass -S /data/GreatSQL/mysql.sock -D test_db --master-server-id=103306 --create-table --update
```
::: tip Tip
`-D`: Select a database that exists in the database.
`--master-server-id`: Set the server_id of the source.
`--create-table`: Used to create the table.
`--update`: Updates the record of the heartbeat table every second.
::: 

Now entering the Master, you can see a `heartbeat` table under the `test_db` database, with one record of data. This table should also appear on the Slave node.

```sql
greatsql> SELECT * FROM test_db.heartbeat;
+----------------------------+-----------+---------------+----------+-----------------------+---------------------+
| ts                         | server_id | file          | position | relay_source_log_file | exec_source_log_pos |
+----------------------------+-----------+---------------+----------+-----------------------+---------------------+
| 2024-04-22T15:57:44.001900 |    103306 | binlog.000032 |    41464 | NULL                  |                NULL |
+----------------------------+-----------+---------------+----------+-----------------------+---------------------+
1 row in set (0.00 sec)
```

Next, update this table on the source database and let it run in the background:

```bash
pt-heartbeat --user=root --ask-pass -S /data/GreatSQL/mysql.sock -D test_db --master-server-id=103306 --update --daemonize
```

Enter the replica and start monitoring the source-replica delay:

```bash
pt-heartbeat --user=root --ask-pass -S /data/GreatSQL02/mysql.sock -D test_db --master-server-id=103306 --monitor --print-master-server-id
```
::: details View the result
```bash
$ pt-heartbeat --user=root --ask-pass -S /data/GreatSQL02/mysql.sock -D test_db --master-server-id=103306 --monitor --print-master-server-id
Enter password: -- Enter the password here
0.00s [  0.00s,  0.00s,  0.00s ] 103306
0.00s [  0.00s,  0.00s,  0.00s ] 103306
0.00s [  0.00s,  0.00s,  0.00s ] 103306
0.00s [  0.00s,  0.00s,  0.00s ] 103306
```
:::

::: tip Tip
The output result is: real-time delay, [1-minute delay, 5-minute delay, 15-minute delay] Server_id of the primary node.
::: 

1. Of course, the `--interval` parameter can also be used to control the update interval on the source database, default is 1 second.

2. If the daemon mode is used, it can be stopped with `pt-heartbeat --stop`.

3. To view the delay on the Slave library once, replace `monitor` with `--check`.

## pt-slave-delay

### Overview

In daily work, there may be the possibility of accidentally deleting data, so this tool can be used to set the Slave server to lag behind the Master server, achieving the construction of a delayed replica.

**Principle**

Set the Slave library to lag behind the Master library by the specified time by starting and stopping the replication SQL thread.

**Usage**

```bash
pt-slave-delay [OPTIONS] SLAVE_DSN [MASTER_DSN]
```

### Options

**All options of this tool are as follows**

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | Prompt for a password when connecting                                           |
| --charset           | Default character set                                                   |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --[no]continue      | Continue normal replication after exiting                                           |
| --daemonize         | Run in the background                                                     |
| --database          | The database used for the connection                                             |
| --defaults-file     | Read MySQL/GreatSQL options only from the given file                         |
| --delay             | The time the replica lags behind the source, default 1 hour                              |
| --help              | Display help                                                     |
| --host              | Connect to the IP address of the host                                           |
| --interval          | The frequency of starting or stopping, default 1 minute                                  |
| --log               | The location of log output when running in the background                                     |
| --password          | The password used when connecting                                             |
| --pid               | Create the given PID file                                          |
| --port              | The port number used for the connection                                             |
| --quiet             | Do not print informative messages about operations                                 |
| --run-time          | Run time, default is to run forever                                     |
| --set-vars          | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket            | The socket file used for the connection                                         |
| --use-master        | Get the binary log position from the Master library instead of the Slave library              |
| --user              | The user used for login                                               |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

This tool only needs to run on the Slave library, and does not need to run on the Master node:

```bash
pt-slave-delay --user=root --ask-pass -S /data/GreatSQL02/mysql.sock --delay=1m --interval=15s --run-time=10m
```
::: tip Tip
Here the source-replica delay is set to 1 minute, a check is performed every 15 seconds, and it runs continuously for 10 minutes.
:::

::: details View the result
```bash
2024-04-23T09:29:00 slave running 0 seconds behind
2024-04-23T09:29:00 STOP SLAVE until 2024-04-23T09:30:00 at master position binlog.000032/500611
2024-04-23T09:29:15 slave stopped at master position binlog.000032/500611
2024-04-23T09:29:30 slave stopped at master position binlog.000032/500611
......the middle is omitted
2024-04-23T09:30:30 Setting slave to run normally
```
::: 

If you enter the Slave node during the run and view `SHOW REPLICA STATUS\G`:

```bash
Replica_IO_Running: Yes
Replica_SQL_Running: No
```

It can be seen that the SQL thread has been stopped, proving that this tool precisely controls the start and stop of the SQL thread, effectively implementing the source-replica delay.

::: tip Tip
The command `CHANGE REPLICATION SOURCE TO SOURCE_DELAY=3600;` can also be used to control the source-replica delay time.
:::

## pt-slave-find

### Overview

Find and print the number of replicas of the source library in the source-replica architecture, similar to the meaning of a topology diagram.

**Usage**

```bash
pt-slave-find [OPTIONS] [DSN]
```

### Options

| Parameter               | Meaning                                                         |
| ------------------ | ------------------------------------------------------------ |
| --ask-pass         | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset          | Default character set                                                   |
| --config           | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --databases        | Only check this comma-separated database list                                 |
| --defaults-file    | Read MySQL/GreatSQL options only from the given file                       |
| --help             | Display help                                                     |
| --host             | Connect to the host                                                   |
| --password         | The password used when connecting                                             |
| --pid              | Create the given PID file                                          |
| --port             | The port number used for the connection                                             |
| --recurse          | The number of levels to recurse in the hierarchy, default is infinite                         |
| --recursion-method | The preferred recursion method used to find replicas. There are three (processlist, hosts, none) |
| --report-format    | Set which information about replicas to print                                   |
| --resolve-address  | Resolve IP addresses to hostnames                                       |
| --slave-user       | Set the user used to connect to replicas                                       |
| --slave-password   | Set the password used to connect to replicas                                       |
| --set-vars         | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --socket           | The socket file used for the connection                                         |
| --user             | The login user                                                   |
| --version          | Display the version                                                     |

### Best Practices

Connect to the Master node of the source-replica cluster and view the number of replication layers of this cluster.

```bash
$ pt-slave-find h=192.168.6.55,u=root --ask-pass
```
::: details View the result
```bash
$ pt-slave-find h=192.168.6.55,u=root --ask-pass
192.168.6.55
Version         8.0.32-27
Server ID       103306
Uptime          20:38:01 (started 2024-04-22T14:09:23)
Replication     Is not a slave, has 1 slaves connected, is not read_only
Filters
Binary logging  ROW
Slave status
Slave mode      STRICT
Auto-increment  increment 1, offset 1
InnoDB version  8.0.32-8.0.32
+- 192.168.6.55:3307
   Version         8.0.32-27
   Server ID       103307
   Uptime          20:35:59 (started 2024-04-22T14:12:02)
   Replication     Is a slave, has 0 slaves connected, is not read_only
   Filters
   Binary logging  ROW
   Slave status    0 seconds behind, running, no errors
   Slave mode      STRICT
   Auto-increment  increment 1, o
   InnoDB version  8.0.32-8.0.32
```
:::

It can be seen that this primary node has only one replica node, and the output also displays the information of the primary node and the replica node.

## pt-slave-restart

### Overview

Monitor one or more GreatSQL replication replicas for errors, and try to restart replication when it stops.

**Usage**

```bash
pt-slave-restart [OPTIONS] [DSN]
```

### Options

| Parameter                  | Meaning                                                         |
| --------------------- | ------------------------------------------------------------ |
| --always              | Never stop the Slave thread                                            |
| --ask-pass            | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset             | Default character set                                                   |
| --[no]check-relay-log | Check the last relay log file and position before checking for replica errors             |
| --config              | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --daemonize           | Run in the background                                                     |
| --databases           | Database list                                                   |
| --defaults-file       | Read MySQL/GreatSQL options only from the given file                       |
| --error-length        | The maximum length of the error message to print                                   |
| --error-numbers       | Specify which errors to skip, separated by commas                              |
| --error-text          | Match and skip based on the error information                                       |
| --help                | Display help                                                     |
| --host                | Connect to the host                                                   |
| --log                 | When running in the background, print the output to this file                               |
| --max-sleep           | The maximum time to sleep before polling the replica again                               |
| --min-sleep           | The minimum time to sleep before polling the replica again                               |
| --monitor             | Whether to monitor the replica (default)                                         |
| --password            | The password used when connecting                                             |
| --pid                 | Create the given PID file                                          |
| --port                | The port number used for the connection                                             |
| --quiet               | Suppress normal output (disable `--verbose`)                              |
| --recurse             | Execute on the source library, monitor the replicas. Default depth 0 means "only monitor the specified replica"      |
| --recursion-method    | The preferred recursion method used to find replicas                                   |
| --run-time            | Run time                                                     |
| --sentinel            | Exit if this file exists, default value: /tmp/pt-slave-restart-sentinel |
| --slave-user          | Set the user used to connect to replicas                                       |
| --slave-password      | Set the password used to connect to replicas                                       |
| --set-vars            | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --skip-count          | The number of statements to skip when restarting the replica, default 1                          |
| --master-uuid         | When using GTID, an empty transaction should be created to skip it                     |
| --sleep               | The initial number of seconds to sleep between checking the replicas                                   |
| --socket              | The socket file used for the connection                                         |
| --stop                | Stop the running instance                                                 |
| --until-master        | Run until the specified source_log_pos,file position and then stop                  |
| --until-relay         | Run until the specified relay log file and position and then stop                         |
| --user                | The user used for login                                               |
| --verbose             | Add more information to the output                                           |
| --version             | Display the version                                                     |
| --[no]version-check   | Version check                                                     |

### Best Practices

Create a `t1` table on the source library and insert 5 rows of data:

```sql
greatsql> CREATE TABLE t1 (id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL);
greatsql> INSERT INTO t1 (name) VALUES ('张三');  
greatsql> INSERT INTO t1 (name) VALUES ('李四');  
greatsql> INSERT INTO t1 (name) VALUES ('王五');  
greatsql> INSERT INTO t1 (name) VALUES ('赵六');  
greatsql> INSERT INTO t1 (name) VALUES ('孙七');
```

View the data on the source library:

```sql
greatsql> SELECT * FROM test_db.t1;
+----+--------+
| id | name   |
+----+--------+
|  1 | 张三   |
|  2 | 李四   |
|  3 | 王五   |
|  4 | 赵六   |
|  5 | 孙七   |
+----+--------+
5 rows in set (0.00 sec)
```

View the data on the replica library:

```sql
greatsql> SELECT * FROM test_db.t1;
+----+--------+
| id | name   |
+----+--------+
|  1 | 张三   |
|  2 | 李四   |
|  3 | 王五   |
|  4 | 赵六   |
|  5 | 孙七   |
+----+--------+
5 rows in set (0.00 sec)
```

#### Proactively Handling Errors

Execute the pt-slave-restart tool on the replica library to monitor the replica:

```bash
pt-slave-restart h=192.168.6.55,P=3307,u=root --ask-pass
```

::: danger Special Reminder
If this tool is used, the parameter `replica_parallel_workers` must be set to 0; otherwise, the error "Cannot skip transactions properly because GTID is enabled and replica_parallel_workers > 0.  See 'GLOBAL TRANSACTION IDS' in the tool's documentation." is reported. If multi-threaded replication is not disabled, the tool cannot tell which thread had the replication problem.
::: 

At this time, replica monitoring is already enabled. On the source library, manually create a source-replica replication error:

```sql
greatsql> SET sql_log_bin=0;
greatsql> INSERT INTO t1 VALUES(6,'周八');
greatsql> SET sql_log_bin=1;
greatsql> DELETE FROM t1 WHERE id=6;
```

At this time, the tool detects the source-replica replication anomaly and immediately repairs the error, making the source-replica replication run normally:

```sql
$ pt-slave-restart h=192.168.6.55,P=3307,u=root --ask-pass
-- Timestamp + replica-side information + relay log + relay log position + source-replica replication error code
2024-04-24T10:33:54 P=3307,h=192.168.6.55,u=root myarch-relay-bin.000003   36702 1032
```

#### Manually Handling Errors

The tool keeps running and directly repairs errors when detected. If there is already an error that needs to be handled manually, you can use `--error-numbers=` to specify the error code, and the tool skips that error code:

```sql
greatsql> SHOW REPLICA STATUS\G
Replica_IO_Running: Yes
Replica_SQL_Running: No
Last_SQL_Error: Could not execute Delete_rows event on table test_db.t1; Can't find record in 't1', Error_code: 1032; handler error HA_ERR_KEY_NOT_FOUND; the event's master log binlog.000032, end_log_pos 504208
```

Remember the error code `1032`, then use this tool on the replica machine:

```bash
pt-slave-restart h=192.168.6.55,P=3307,u=root --ask-pass --error-numbers=1032
```

At this time, the corresponding information is output:

::: details View the result

```bash
$ pt-slave-restart h=192.168.6.55,P=3307,u=root --ask-pass --error-numbers=1032

2024-04-24T10:49:26 P=3307,h=192.168.6.55,u=root myarch-relay-bin.000003     37046 1032
```
:::

Then view the source-replica status on the replica library. It can be seen that the source-replica replication is already normal:

```sql
greatsql> SHOW REPLICA STATUS\G
Replica_IO_Running: Yes
Replica_SQL_Running: Yes
Last_SQL_Error:
```

## pt-table-checksum

Although this data verification and repair tool is widely popular, it has shortcomings that cannot be ignored: it does not support MySQL/GreatSQL MGR scenarios, the domestic common cloud migration up and down scenarios, and heterogeneous database scenarios between MySQL/GreatSQL and Oracle. To overcome these difficulties, GreatSQL has launched a verification & repair tool named `gt-checksum`, designed to fully meet various business needs!

- [gt-checksum documentation](https://gitee.com/GreatSQL/gt-checksum/blob/master/gt-checksum-manual.md)
- [Gitee repository address](https://gitee.com/GreatSQL/gt-checksum)

### Overview

Check whether the source-replica data of MySQL/GreatSQL is consistent.

**Usage**

```bash
pt-table-checksum [OPTIONS] [DSN]
```

### Options

| Parameter                            | Meaning                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| --ask-pass                      | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --channel                       | Specify the replication channel                                                 |
| --[no]check-binlog-format       | Check whether the binlog_format system parameter on all servers is the same              |
| --binary-index                  | Modify the behavior of `--create-replicate-table` so that the lower and upper boundary columns of the replicate table are created as BLOB data types |
| --check-interval                | Specify the sleep time between checks due to the option `--max-lag`                        |
| --[no]check-plan                | Check the safety of the query execution plan                                     |
| --[no]check-replication-filters | Specify whether to detect whether the source-replica replication has replication filters set                         |
| --check-slave-lag               | Specify pausing the checksum operation after the replication delay is greater than the value specified by the option `--max-lag`  |
| --[no]check-slave-tables        | Check whether the tables on the replicas exist and have all checksum `--columns`            |
| --chunk-index                   | Specify which index to use for chunk operations on the table                        |
| --chunk-index-columns           | Specify the leftmost prefix index fields of the index used by the option `--chunk-index`, only applicable to composite indexes |
| --chunk-size                    | The number of rows selected for each checksum query. Allowed suffix units are k, M, G          |
| --chunk-size-limit              | Specify how many times the number of rows in a chunk can exceed the number of rows specified by the option `--chunk-size` |
| --chunk-time                    | Dynamically adjust the size of each chunk so that the corresponding table rows are all checked within the specified time |
| --columns                       | Specify the fields that only need to be checked. If there are multiple, separate them with commas                   |
| --config                        | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --[no]create-replicate-table    | Create the database and table specified by the option `--replicate`                        |
| --databases                     | Only check the comma-separated database list                             |
| --databases-regex               | Only check databases whose names match this regex                     |
| --defaults-file                 | Read MySQL/GreatSQL options only from the given file                       |
| --disable-qrt-plugin            | If the QRT (query response time) plugin is enabled, disable it               |
| --[no]empty-replicate-table     | Before checksumming a table, delete the checksums before each table                 |
| --engines                       | Only check tables using these storage engines                                   |
| --explain                       | Show but do not execute the checksum queries (disable `--[no]empty-replicate-table`)  |
| --fail-on-stopped-replication   | If replication stops, fail with an error (exit status 128) instead of waiting until replication restarts |
| --float-precision               | The precision of FLOAT and DOUBLE number to string conversion                       |
| --function                      | Specify the hash function used for checksum operations. Optional functions include SHA1, MD5, etc.            |
| --help                          | Display help                                                     |
| --host                          | Connect to the host                                                   |
| --ignore-columns                | Specify the fields that need to be ignored for checksum                                       |
| --ignore-databases              | Specify the databases that need to be ignored for checksum                                     |
| --ignore-databases-regex        | Specify using regex matching to ignore databases for checksum                       |
| --ignore-engines                | Specify the storage engine list that needs to be ignored for checksum                               |
| --ignore-tables                 | Specify the tables that need to be ignored for checksum                                         |
| --ignore-tables-regex           | Specify using regex matching to ignore tables for checksum                           |
| --max-lag                       | Specify the maximum allowed source-replica replication delay, in seconds                     |
| --max-load                      | Check `SHOW GLOBAL STATUS` after each block. If any status variable is higher than the threshold, pause |
| --password                      | The password used when connecting                                             |
| --pause-file                    | When the file specified by this parameter exists, execution pauses                         |
| --pid                           | Create the given PID file                                          |
| --plugin                        | The Perl module file defining the `pt_table_checksum_plugin` class             |
| --port                          | The port number used for the connection                                             |
| --progress                      | Print progress reports to STDERR                                      |
| --quiet                         | Only print the most important information (disable `--progress` )                     |
| --recurse                       | Specify the level of searching for replicas, default infinite                                 |
| --recursion-method              | Specify the way to obtain replicas                                           |
| --replicate                     | Write the checksum results to this table                                         |
| --[no]replicate-check           | Specify checking whether the current tables of the source and replica are inconsistent after checksumming each table |
| --replicate-check-only          | Check the consistency of replicas without executing checksum queries                       |
| --replicate-check-retries       | Specify the number of retries when source-replica data inconsistency is found during checksum                     |
| --replicate-database            | Specify which database the tool operates in when executing checksum operations                   |
| --resume                        | Specify resuming checksum from the last completed chunk                        |
| --retries                       | Specify the number of times to re-check a block when a non-serious error occurs                 |
| --run-time                       | Specify the running time of the checksum operation                                       |
| --separator                     | The separator used for `CONCAT_WS()`                                    |
| --skip-check-slave-lag          | Specify skipping the source-replica delay check when DSN connects to the replica. Multiple replica checks can be specified      |
| --slave-user                    | Set the user used to connect to replicas                                       |
| --slave-password                | Set the password used to connect to replicas                                       |
| --set-vars                      | Specify parameter values when running checks, separated by commas if multiple                     |
| --socket                        | The socket file used for the connection                                         |
| --slave-skip-tolerance          | When the source table is marked to be checksummed in only one block, but the replica table exceeds the acceptable maximum size, the table is skipped |
| --tables                        | Only checksum this comma-separated table list                         |
| --tables-regex                  | Only checksum tables whose names match this Perl regex                 |
| --trim                          | Add `TRIM()` to `VARCHAR` columns (helpful when comparing 4.1 and >= 5.0) |
| --truncate-replicate-table      | Truncate the replicate table before starting the checksum                                   |
| --user                          | The login user                                                   |
| --version                       | Display the version                                                     |
| --[no]version-check             | Version check                                                     |
| --where                         | Only execute rows matching this WHERE clause                                |

### Best Practices

#### Verifying Whether Source-Replica Data Is Consistent (Source and Replica Ports Are the Same)

::: tip Tip
When the source and replica machine ports are the same, this method can be used.
:::

Detect differences and write the differences to the checksums table. Execute the following command on the source library:

```bash
pt-table-checksum --create-replicate-table --replicate=test_db.checksums --nocheck-replication-filters --nocheck-binlog-format --recursion-method=processlist --databases=test_db --user=root --ask-pass --host=192.168.6.55 --port=3306
```

- --nocheck-replication-filters: Do not check replication filters. It is recommended to enable.

- --no-check-binlog-format: Do not check the replicated Binlog mode. If the Binlog mode is ROW, an error is reported.

The result is as follows:

```bash
Checking if all tables can be checksummed ...
Starting checksum ...
            TS ERRORS  DIFFS     ROWS  DIFF_ROWS  CHUNKS SKIPPED    TIME TABLE
04-24T15:57:13      0      0        9          0       1       0   0.008 test_db.test_t1
```

- TS: The time when the check was completed.
- ERRORS: The number of errors and warnings that occurred during the check.
- DIFFS: 0 means consistent, non-0 means inconsistent.
- DIFF_ROWS: The number of data rows with differences between the source and replica libraries.
- CHUNKS: The number of blocks into which the table was divided.
- SKIPPED: The number of blocks skipped due to errors, warnings, or being too large.
- TIME: The execution time.
- TABLE: The name of the checked table.

At the same time, the results are also saved to the table:

```sql
greatsql> SELECT * FROM checksums;
+---------+--------------------+-------+------------+-------------+----------------+----------------+----------+----------+------------+------------+---------------------+
| db      | tbl                | chunk | chunk_time | chunk_index | lower_boundary | upper_boundary | this_crc | this_cnt | master_crc | master_cnt | ts                  |
+---------+--------------------+-------+------------+-------------+----------------+----------------+----------+----------+------------+------------+---------------------+
| test_db | t1                 |     1 |   0.001848 | NULL        | NULL           | NULL           | 6d60e23f |        5 | 6d60e23f   |          5 | 2024-04-24 16:29:30 |
+---------+--------------------+-------+------------+-------------+----------------+----------------+----------+----------+------------+------------+---------------------+
1 rows in set (0.01 sec)
```

#### Verifying Whether Source-Replica Data Is Consistent (Source and Replica Ports Are Different)

::: tip Tip
When the source and replica machine ports are different, this method can be used.
::: 

Create a DSN table on the source library:

```sql
greatsql> CREATE TABLE test_db.dsns ( id int(11) NOT NULL AUTO_INCREMENT, parent_id int(11) DEFAULT NULL,dsn varchar(255) NOT NULL, PRIMARY KEY (id) );
greatsql> INSERT INTO test_db.dsns(dsn) VALUES ('h=192.168.6.55,P=3307,u=root,p=');
```

Use the tool to verify. Note that at this time `--recursion-method` should be changed to DSN mode:

```bash
pt-table-checksum --replicate=test_db.checksums --nocheck-replication-filters --no-check-binlog-format --host=192.168.6.55 --port=3306 --user=root --ask-pass --databases=test_db --recursion-method dsn=h=192.168.6.55,D=test_db,t=dsns
```

The result is as follows:

```bash
Checking if all tables can be checksummed ...
Starting checksum ...
            TS ERRORS  DIFFS     ROWS  DIFF_ROWS  CHUNKS SKIPPED    TIME TABLE
04-24T17:04:42      0      0        1          0       1       0   0.035 test_db.dsns
04-24T17:04:42      0      0        1          0       1       0   0.022 test_db.heartbeat
04-24T17:04:42      0      0        0          0       1       0   0.036 test_db.my_table
04-24T17:04:42      0      2    10000       9823       4       0   0.097 test_db.ptosc
04-24T17:04:42      0      0        5          0       1       0   0.021 test_db.t1
04-24T17:04:42      0      1       15         15       1       0   0.026 test_db.tc10011_ta4
04-24T17:04:42      0      1        9          9       1       0   0.078 test_db.test_t1
04-24T17:04:42      0      0        0          0       1       0   0.066 test_db.test_table
```

It can be seen that three tables were detected as inconsistent. If even the table does not exist, the error `Table 'XXXX' doesn't exist` is reported.

When source-replica data inconsistency occurs, the `pt-table-sync` tool must be used for repair.

## pt-table-sync

### Overview

Efficiently synchronize MySQL/GreatSQL table data.

**Usage**

```bash
pt-table-sync [OPTIONS] DSN [DSN]
```

### Options

At least one of `--print`, `--execute`, or `--dry-run` must be specified. `--where` and `--replicate` are mutually exclusive.

| Parameter                     | Meaning                                                         |
| ------------------------ | ------------------------------------------------------------ |
| --algorithms             | The algorithms used when comparing tables (in priority order). Default values: Chunk, Nibble, GroupBy, Stream |
| --ask-pass               | Prompt for a password when connecting to MySQL/GreatSQL                             |
| --bidirectional          | Enable bidirectional synchronization between the first and subsequent hosts                           |
| --[no]bin-log            | Specify that the synchronization operation records binary logs, equivalent to executing `SET SQL_LOG_BIN=1`      |
| --buffer-in-mysql        | Specify that MySQL/GreatSQL buffers queries in its memory                       |
| --[no]buffer-to-client   | Fetch rows one by one from MySQL/GreatSQL when comparing                         |
| --channel                | Specify the replication channel                                                 |
| --charset                | Default character set                                                   |
| --[no]check-child-tables | Check whether `--execute` will adversely affect child tables                      |
| --[no]check-master       | Specify that when the option `--sync-to-master` is used, attempt to verify that the source library connected by the tool is the real source library |
| --[no]check-slave        | Check whether the target server is a secondary server                                 |
| --[no]check-triggers     | Check whether triggers are defined on the target table                                 |
| --chunk-column           | Specify which field of the table to use for chunk operations                            |
| --chunk-index            | Specify which index to use for chunk operations on the table                        |
| --chunk-size             | The number of rows or data size of each block                                       |
| --columns                | Compare the comma-separated column list                                       |
| --config                 | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --conflict-column        | When a row conflict occurs during `--bidirectional` synchronization, compare this column              |
| --conflict-comparison    | Select the `--conflict-column` with this attribute as the source                    |
| --conflict-error         | How to report unresolvable conflicts and conflict errors, default is: warn (warning)         |
| --conflict-threshold     | The amount by which one `--conflict-column` must exceed another                  |
| --conflict-value         | Use this value for some `--conflict-comparison`                        |
| --databases              | The database list to synchronize only, separated by commas if multiple                       |
| --defaults-file          | Read MySQL/GreatSQL options only from the given file                             |
| --dry-run                | Analyze, decide which synchronization algorithm to use, print, and exit                       |
| --engines                | The storage engine list to synchronize only, separated by commas if multiple                       |
| --execute                | Execute the queries to make the tables have the same data                                 |
| --explain-hosts          | Print connection information and exit                                           |
| --float-precision        | The precision of `FLOAT` and `DOUBLE` number to string conversion                   |
| --[no]foreign-key-checks | Enable foreign key checks (`SET FOREIGN_KEY_CHECKS=1`)                    |
| --function               | Choose which hash function to use as the checksum, default is `CRC32`               |
| --help                   | Display help                                                     |
| --[no]hex-blob           | HEX() BLOB, TEXT, and BINARY columns                                  |
| --host                   | Connect to the host                                                   |
| --ignore-columns         | Columns to ignore, separated by commas if multiple                               |
| --ignore-databases       | Databases to ignore, separated by commas if multiple                           |
| --ignore-engines         | Engines to ignore, separated by commas if multiple                             |
| --ignore-tables          | Tables to ignore, separated by commas if multiple                               |
| --ignore-tables-regex    | Table regexes to ignore, separated by commas if multiple                     |
| --[no]index-hint         | Add FORCE/USE INDEX hints to chunk and row queries                    |
| --lock                   | Lock tables: 0=never lock tables, 1=lock tables each synchronization cycle, 2=lock tables during table operations, 3=lock tables on the server of each DSN connection |
| --lock-and-rename        | Specify locking the source and target tables, executing the synchronization operation, and then swapping table names         |
| --password               | The password used when connecting                                             |
| --pid                    | Create the given PID file                                          |
| --port                   | The port number used for the connection                                             |
| --print                  | Print the queries that will resolve the differences                                         |
| --recursion-method       | The preferred recursion method used to find replicas                                   |
| --replace                | Write all `INSERT` and `UPDATE` statements as `REPLACE`                    |
| --replicate              | Synchronize the tables listed as different in this table                                       |
| --slave-user             | Set the user used to connect to replicas                                       |
| --slave-password         | Set the password used to connect to replicas                                       |
| --set-vars               | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --socket                 | The socket file used for the connection                                         |
| --sync-to-master         | Specify confirming the DSN connection information as a replica and synchronizing information to the source library                |
| --tables                 | Tables to synchronize, separated by commas if multiple                               |
| --timeout-ok             | Specify skipping the failure and continuing execution when the option `--wait` causes the tool execution to fail         |
| --[no]transaction        | Specify the tool operation uses transactions instead of LOCK TABLES statements to lock tables              |
| --trim                   | `TRIM()` `VARCHAR` columns in `BIT_XOR` and `ACCUM` modes          |
| --[no]unique-checks      | Enable unique key checks ( `SET UNIQUE_CHECKS=1` )                     |
| --user                   | The user used for the connection                                               |
| --verbose                | Print the results of the synchronization operation                                           |
| --version                | Display the version                                                     |
| --[no]version-check      | Version check                                                     |
| --wait                   | Specify how long the replica can wait to catch up with the source when there is source-replica replication delay. If there is still delay after exceeding the time, abort and exit |
| --where                  | The `WHERE` clause used to limit synchronization to a part of the table                         |
| --[no]zero-chunk         | Add a chunk for rows with zero or zero-equivalent values                                   |

### Best Practices

#### Synchronizing a Single Table

::: danger Special Reminder
When synchronizing, the two machines cannot be in a source-replica relationship. The first DSN is the source library, and the second DSN is the synchronized library.
::: 

Synchronize the `test_db.test_t1` table on the 192.168.6.55 machine to the 192.168.6.129 machine:

```bash
pt-table-sync --execute h=192.168.6.55,u=root,p=,P=3306,D=test_db,t=test_t1 h=192.168.6.129,p=test,u=test,P=3306
```

#### Synchronizing a Single Database

::: danger Special Reminder
Note that when synchronizing, the two machines cannot be in a source-replica relationship. The first DSN is the source library, and the second DSN is the synchronized library.
:::

```bash
pt-table-sync --execute h=192.168.6.55,u=root,p=,P=3306 h=192.168.6.129,u=test,p=test --databases test_db
```

At this time, if a table does not exist, an error is reported:

```bash
Table test_db.checksums does not exist on P=3306,h=192.168.6.129,p=...,u=test  while doing test_db.checksums on 192.168.6.129
```

At this time, just create the table manually.

#### Synchronizing All Databases and Tables

::: danger Special Reminder
Note that when synchronizing, the two machines cannot be in a source-replica relationship. The first DSN is the source library, and the second DSN is the synchronized library.
:::

```bash
pt-table-sync --execute h=192.168.6.55,u=root,p=,P=3306 h=192.168.6.129,u=test,p=test
```

#### Synchronizing the Replica in Source-Replica Replication

Synchronize the inconsistent tables recorded in `test_db.checksums`. The data in this table is detected by the `pt-table-checksum` tool.

```bash
pt-table-sync --execute --replicate 'test_db.checksums' --sync-to-master h=192.168.6.55,P=3307,u=root,p=
```

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
