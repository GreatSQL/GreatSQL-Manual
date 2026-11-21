# Percona Toolkit Practical

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## Practical

In Percona Toolkit, the practical category includes the following tools:

- `pt-align`: Align the output of other tools with columns.
- `pt-archiver`: Archive rows in a table to another table or file.
- `pt-find`: Find tables and execute commands.
- `pt-fingerprint`: Convert queries to ciphertext.
- `pt-kill`: Kill SQL statements that meet the conditions.
- `pt-k8s-debug-collector`: Collect debug data (logs, resource status, etc.) from k8s/OpenShift clusters.
- `pt-secure-collect`: Collect, clean, package, and encrypt data.

## pt-align

### Overview

Perform column alignment by reading rows and splitting them into words.

The tool first calculates the number of words contained in each row and tries to determine whether there is a dominant number, assuming it as the number of words in each row. Next, `pt-align` excludes all rows that do not conform to that number and treats the next row as the first non-header row. Based on whether each word looks like a number, it decides the alignment of the columns. Finally, the tool iterates through the dataset, determines the width of each column, and formats and prints them.

The `pt-align` tool is very helpful for adjusting the output of `vmstat` or `iostat`, making it easier to read.

**Usage**

Align the output of other tools with columns. If FILES (files) are not specified, STDIN (input) is read.

```bash
pt-align [FILES]
```

---

If the following output is printed (without alignment):

```
DATABASE TABLE   ROWS
foo      bar      100
long_db_name table  1
another  long_name 500
```

`pt-align` can be used to reprint the output (with alignment):

```
DATABASE     TABLE     ROWS
foo          bar        100
long_db_name table        1
another      long_name  500
```

### Options

The command-line parameters of this tool are as follows:

| Parameter      | Meaning                 |
| --------- | -------------------- |
| --help    | Help, display help and exit |
| --version | Version, display version and exit |

### Best Practices

#### Aligning vmstat

When viewing `vmstat`, sometimes the column alignment is not neat. At this time, the `pt-align` tool can be used to solve this problem.

```bash
# Without using the pt-align tool
$ vmstat
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0 205472 181304     60 948960    0    0     0     1    1    1  1  2 98  0  0

# Using the pt-align tool
$ vmstat | pt-align
r b   swpd   free buff  cache si so bi bo in cs us sy id wa st
2 0 205472 181260   60 948992  0  0  0  1  1  1  1  2 98  0  0
```

#### Aligning iostat

When viewing `iostat`, sometimes the column alignment is not neat. At this time, the `pt-align` tool can be used to solve this problem.

```bash
# Without using the pt-align tool
$ iostat
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.86    0.00    1.51    0.00    0.00   97.62

Device:            tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               0.11         0.33         1.31    6746368   27046909
dm-0              0.09         0.30         1.23    6263958   25261569
dm-1              0.03         0.02         0.09     452072    1782864

# Using the pt-align tool
$ iostat | pt-align
0.86    0.00 1.51      0.00      0.00    97.62   
Device: tps  kB_read/s kB_wrtn/s kB_read kB_wrtn 
sda     0.11 0.33      1.31      6746368 27049993
dm-0    0.09 0.30      1.23      6263958 25264653
dm-1    0.03 0.02      0.09      452072  1782864
```

## pt-archiver

Archive rows in a MySQL/GreatSQL table to another table or file.

### Overview

`pt-archiver` is an online archiving tool that does not affect production, but the table operated on with this command must have a primary key. It can implement the following functions:

- Archive historical data
- Delete large amounts of data online
- Data export and backup
- Remote data archiving
- Data cleanup

**Usage**

```bash
pt-archiver [OPTIONS] --source DSN --where WHERE
```
---

Archive a table from the `oltp` instance to the `olap` instance:

```bash
pt-archiver --source h=oltp_server,D=test,t=tbl --dest h=olap_server --file '/var/log/archive/%Y-%m-%d-%D.%t' --where "1=1" --limit 1000 --commit-each
```

Delete orphaned rows from a child table:

```bash
pt-archiver --source h=host,D=db,t=child --purge --where 'NOT EXISTS(SELECT * FROM parent WHERE col=child.col)'
```

### Options

- At least one of `--dest`, `--file`, or `--purge` must be specified

- If COPY is yes, the DSN value in `--dest` defaults to the value in `--source`

Some parameter options are mutually exclusive and cannot exist at the same time. See:

| Option A                 | Option B            | Relationship |
| --------------------- | ---------------- | ---- |
| --ignore              | --replace        | Mutually exclusive |
| --txn-size            | --commit-each    | Mutually exclusive |
| --low-priority-insert | --delayed-insert | Mutually exclusive |
| --share-lock          | --for-update     | Mutually exclusive |
| --analyze             | --optimize       | Mutually exclusive |
| --no-ascend           | --no-delete      | Mutually exclusive |

All parameter options are as follows:

| Parameter                      | Meaning                                                         |
| ------------------------- | ------------------------------------------------------------ |
| --analyze                 | For d, use `analyze` on dest. For s, use `analyze` on source. ds means execute both |
| --ascend-first            | Ascend only the first index column                                           |
| --ask-pass                | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --buffer                  | When file is specified, only flush to disk at transaction commit                     |
| --bulk-delete             | Bulk delete                                                     |
| --[no]bulk-delete-limit   | Whether to enable the bulk delete limit, `delete ... limit`                       |
| --bulk-insert             | Bulk insert through LOAD DATA                                        |
| --channel                 | Specify the replication channel                                                 |
| --charset                 | Character set                                                       |
| --[no]check-charset       | Whether to check the character set, check by default                                     |
| --[no]check-columns       | Check columns to ensure that `--source` and `--dest` have the same columns                 |
| --check-interval         | Define how long archiving pauses each time                                     |
| --check-slave-lag         | Pause archiving until the lag of this replica is less than `--max-lag`                      |
| --columns                 | Archive the specified fields, comma-separated                                     |
| --commit-each             | Commit each group of fetched and archived rows, used with `--limit`                     |
| --config                  | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --database                | Connect to this database                                               |
| --delayed-insert          | Add the `DELAYED` modifier to `INSERT` or `REPLACE` statements, low-priority insertion.<br />However, this parameter is deprecated in version 5.6 and not supported in version 8.0; the server recognizes but ignores the `DELAYED` keyword |
| --dest                    | This option specifies a table. pt-archiver inserts rows archived from `--source` into it. It uses the same `key=val` parameter format as `--source`.<br />Most missing values default to the same values as `--source`, so there is no need to repeat the same options in `--source` and `--dest`.<br />Use the `--help` option to see which values are copied from `--source`. |
| --dry-run                 | Print the query and exit without performing any operations                               |
| --file                    | The file to archive to. `%D Database name; %t Table name` time formatting as described in the example. Combined with `--output-format`, it can specify whether the output content is dump (using tabs as separators) or csv (using commas as separators). Combined with `--header`, it specifies whether to print field names on the first line |
| --for-update              | Specify whether to add a read lock or write lock. Add the `FOR UPDATE` modifier to `SELECT` statements. Mutually exclusive with `--share-lock`. |
| --header                  | Print column headings at the top of `--file`                                       |
| --help                    | Display help                                                     |
| --high-priority-select    | Add the `HIGH_PRIORITY` modifier to `SELECT` statements.<br />Only applies to table-level storage engines (MyISAM, MEMORY, etc.) |
| --host                    | Connect to the host                                                   |
| --ignore                  | Ignore ignorable errors that occur when executing INSERT. Mutually exclusive with `--replace`          |
| --limit                   | The number of rows to fetch and archive per statement. Defaults to one row                       |
| --local                   | Do not write `OPTIMIZE` or `ANALYZE` queries to `binlog`                   |
| --low-priority-delete     | Add the `LOW_PRIORITY` modifier to `DELETE` statements. This delays the execution of the `DELETE` until no other clients are reading from the table.<br />Only applies to table-level storage engines (MyISAM, MEMORY, etc.) |
| --low-priority-insert     | Low-priority insertion. Only applies to table-level storage engines (MyISAM, MEMORY, etc.)       |
| --max-flow-ctl            | A `max-lag`-like parameter for pxc clusters                                   |
| --max-lag                 | Pause checksum until the lag of all replicas is less than this value                       |
| --no-ascend               | Do not use the ascending index optimization. Mutually exclusive with `no-delete`                          |
| --no-delete               | Do not delete data. Mutually exclusive with `no-ascend`                                  |
| --optimize                | Indicates executing `optimize`, used in the same way as `analyze`. Mutually exclusive with `analyze`        |
| --output-format           | Used with `--file` to specify the output format                                 |
| --password                | The password used when connecting                                             |
| --pid                     | Create the given PID file. If the PID file exists and contains a PID different from the current PID, the tool will not start. However, if the PID file exists and the PID contained in it is no longer running, the tool overwrites the PID file with the current PID. When the tool exits, the PID file is automatically deleted |
| --plugin                  | The `Perl` module name used as a general plugin                                 |
| --port                    | The port number used for the connection                                             |
| --primary-key-only        | Primary key columns only. A shortcut for specifying `--columns` with the primary key columns                  |
| --progress                | Specify how many rows to print progress information for                                   |
| --purge                   | Only purge, do not archive. It is best to combine with `--primary-key-only` to specify the table's primary key columns.|
| --quick-delete            | Add the `quick` modifier to `DELETE`. When using the `QUICK` modifier, the storage engine does not merge index leaf nodes, thus improving the speed of delete operations.<br />Only applies to table-level storage engines (MyISAM, MEMORY, etc.) |
| --quiet                   | Do not output any information, including `statistics` information                           |
| --replace                 | Cause `INSERT` in `--dest` to be written as `REPLACE`. Mutually exclusive with `--ignore`         |
| --retries                 | The number of retries when encountering timeout or deadlock                                     |
| --run-time                | Specify the running time (`s=seconds, m=minutes, h=hours, d=days`), default is s |
| --[no]safe-auto-increment | Do not archive rows with the maximum `AUTO_INCRMENT`                          |
| --sentinel                | The default file is /tmp/pt-archiver-sentinel. If this file exists, exit archiving    |
| --slave-user              | The replica user                                                     |
| --slave-password          | The replica password                                                     |
| --set-vars                | Set MySQL/GreatSQL parameters when executing                               |
| --share-lock              | Specify whether to add a read lock or write lock. Add the `LOCK IN SHARE MODE` modifier to `SELECT` statements. Mutually exclusive with `--for-update` |
| --skip-foreign-key-checks | Disable foreign key checks with `SET FOREIGN_KEY_CHECKS=0`                   |
| --sleep                   | The sleep time between two fetches, no sleep by default                           |
| --sleep-coef              | Specify `sleep` time as how many times the last `SELECT` time                  |
| --socket                  | The socket file used for the connection                                         |
| --source                  | For the table to be archived, the option "i" is used to specify the index. By default, the primary key is used.<br />The "a" and "b" options can be used to adjust the flow of statements through the binary log. Using the "b" option disables binary logging on the specified connection.<br />If the "a" option is selected, the connection uses the specified database, which can prevent binary log events from using the `--replicate-ignore-db` option when executed on the server.<br />These two options provide different ways to achieve the same goal, namely archiving data from the primary server while keeping it on the replica. You can run cleanup jobs on the primary server and use the selected method to prevent them from executing on the replica. |
| --statistics              | Collect and print time statistics                                       |
| --stop                    | Stop archiving by creating the `sentine` file                                |
| --txn-size                | Specify the number of rows committed per transaction. Mutually exclusive with `commit-each`                    |
| --unstop                  | Delete the `sentine` file                                              |
| --user                    | The login user                                                   |
| --version                 | Display the version number                                                   |
| --[no]version-check       | Automatic update check function, check by default                               |
| --where                   | Specify the `WHERE` clause to limit which rows are archived. If no `WHERE` condition is needed, use WHERE 1=1 |
| --why-quit                | Print the reason for quitting                                                 |

### Best Practices

Create an archiver_test table and generate 1000 rows of data:

```sql
greatsql> CREATE TABLE archiver_test (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    age INT,
    gender VARCHAR(10),
    timestamp TIMESTAMP
);

greatsql> SELECT count(*) FROM archiver_test;
+----------+
| count(*) |
+----------+
|     1000 |
+----------+
1 row in set (0.01 sec)
```
::: tip Tip

During use, dependencies may be needed, for example: `Cannot connect to MySQL because the Perl DBD::mysql module is not installed or not found.` At this time, install the corresponding dependency package as prompted.
::: 

#### Archiving to a Different Table on the Same Instance

::: danger Special Reminder

This operation deletes the data of the source table. If you do not want to delete the source table data, add the `--no-delete` option.
:::

```bash
pt-archiver --source h=localhost,P=3306,u=root,D=test_db,t=archiver_test --charset=utf8mb4  --ask-pass --dest h=localhost,P=3306,u=root,D=test_db,t=archiver_test2 --ask-pass --where "id<100" --limit 1000 --commit-each
# It will ask you to enter the password (source) and (target) password
```

Pseudo-code as follows:

```bash
pt-archiver --source h=source-ip,P=source-port,u=user,p=password,D=database,t=table --ask-pass --dest h=target-IP,P=port,u=user,p=password,D=database,t=table --ask-pass --where "id<100" --limit 1000 --commit-each
```
::: tip Tip
The target table must already be created and the fields must be consistent; otherwise, an error is reported: `"Table 'test_db.archiver_test2' doesn't exist "`
If the fields are inconsistent, an error is reported: `"The following columns exist in --dest but not --source: name2"`
:::

Check whether the archiving was successful.

```sql
greatsql> SELECT count(*) FROM archiver_test2;
+----------+
| count(*) |
+----------+
|       99 |
+----------+
1 row in set (0.00 sec)
```

Because `--dest` inherits the same values from `--source`, the above can also be rewritten as follows:

```bash
pt-archiver --source h=localhost,P=3306,u=root,D=test_db,t=archiver_test --charset=utf8mb4  --ask-pass --dest t=archiver_test2 --where "id<100" --limit 1000 --commit-each
```

The Socket can also be used to log in. If GreatSQL is deployed with single-machine multi-instances, special attention should be paid to selecting the corresponding Socket when using this method:

```bash
pt-archiver --source u=root,D=test_db,t=archiver_test -S /data/MySQL/GreatSQL.sock  --charset=utf8mb4 --dest t=archiver_test2  --where "id<100" --limit 1000 --commit-each
```

The username and password can also be read from the my.cnf configuration file, but the username and password need to be configured in the my.cnf file.

::: tip Tip
Although this method is convenient, it may cause password leakage, which is a security risk and is not recommended.
::: 

Modify the `[client]` section of the `/etc/my.cnf` configuration file and add the following content:

```ini
[client]
user=your_user_name
pass=secret
```

Use `-F` to specify the my.cnf file:

```bash
pt-archiver --source F=/etc/my.cnf,u=root,D=test_db,t=archiver_test --charset=utf8mb4 --dest t=archiver_test2  --where "id<100" --limit 1000 --commit-each
```

#### Archiving Without Writing to Binlog

Add `b=true` to specify that the archiving operation is not written to Binlog:

```bash
pt-archiver --source b=true,h=localhost,P=3306,u=root,D=test_db,t=archiver_test --charset=utf8mb4  --ask-pass --dest b=true,t=archiver_test3  --where "id<100" --limit 1000 --commit-each
```

#### Archiving to a File

Export to an external file without deleting the source table data:

```bash
pt-archiver --source h=localhost,D=test_db,t=archiver_test,u=root --where '1=1' --no-check-charset --no-delete --file="/data/bk/archiver_test.dat"
```
Because the file does not have the `utf8mb4` encoding, `no-check-charset` is set to not check the character set.

Check the backup situation:

```bash
$ tail -n 3 /data/bk/archiver_test.dat
997     Fukuda Akina    449     F       2022-02-15 05:54:27
998     Sara Nguyen     45      F       2018-07-08 13:35:45
999     Chan Ka Man     644     M       2012-02-08 18:18:14
```

## pt-find

### Overview

This tool can find tables that meet the conditions and perform some corresponding operations. The default operation is to print the database and table names.

**Usage**

```bash
pt-find [OPTIONS] [DATABASES]
```

### Options

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --case-insensitive  | Specify that all regex searches are case-insensitive                           |
| --charset           | Default character set                                                   |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --database          | Connect to this database                                               |
| --day-start         | Measure time from today's start instead of the current time                       |
| --defaults-file     | Read MySQL/GreatSQL options only from the given file                       |
| --help              | Display help                                                     |
| --host              | Connect to the host                                                   |
| --or                | Combine tests with OR (instead of AND)                                  |
| --password          | The password used when connecting                                             |
| --pid               | Create the given PID file                                          |
| --port              | The port number used for the connection                                             |
| --[no]quote         | Use MySQL/GreatSQL standard backtick characters to quote MySQL/GreatSQL identifier names |
| --set-vars          | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket            | The socket file used for the connection                                         |
| --user              | The login user                                                   |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

#### Finding Tables Larger Than 1G

```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --tablesize +1G
`tpch`.`customer`
`tpch`.`lineitem`
`tpch`.`orders`
`tpch`.`part`
`tpch`.`partsupp`
```

#### Finding Modified Tables

```bash
# Within 30 minutes
$ pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --mmin -30
`mysql`.`gtid_executed`
`test_db`.`archiver_test`

# Before 30 minutes
$ pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --mmin +30
`aptest`.`sys_dept`
`aptest`.`sys_user`
```

::: tip Tip

This search is based on the `Update_time` column in the `INFORMATION_SCHEMA.TABLES` table. If the update time set by `information_schema_stats_expiry` is too long, the `Update_time` column will not be updated in real time. Therefore, in this case, tables modified within the past 30 minutes cannot be accurately retrieved.
:::

#### Finding Tables with No Data

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --empty
```
::: details View the result
```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --empty
`db2`.`t1`
`db2`.`t2`
```
::: 

#### Finding Tables and Modifying the Storage Engine

Find MyISAM tables created within 1 day:

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --ctime -1 --engine MyISAM
```

Find MyISAM tables within 1 day and modify them to InnoDB:

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --ctime -1 --engine MyISAM --exec "ALTER TABLE %D.%N ENGINE=InnoDB"
```

Find InnoDB tables from 1 day ago:

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --ctime +1 --engine InnoDB
```
::: tip Tip
The names of the `InnoDB` and `MyISAM` storage engines must be entered in the standard form; otherwise, a correct search cannot be performed.
:::
#### Finding Empty Tables and Deleting Them

To avoid unnecessary deletion errors, first find which tables are empty:
```bash
pt-find --socket=/data/GreatSQL/mysql.sock --empty test_db
```

::: details View the result
```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --empty test_db
`test_db`.`archiver_test3`
```
::: 

Find empty tables in the test_db database and delete them:

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --empty test_db --exec-plus "DROP TABLE %s"
```

Verify whether the deletion was successful:

```sql
greatsql> SHOW TABLES IN test_db LIKE 'archiver_test3';
Empty set (0.00 sec)
```

#### Sorting All Tables by Total Size of Data and Indexes

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --printf "%T\t%D.%N\n" | sort -rn
```

::: details View the result
```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --printf "%T\t%D.%N\n" | sort -rn
7992197120      `tpch`.`orders`
7817084928      `tpch`.`lineitem`
......
```
:::

::: tip Tip
Some output is not aligned. The `pt-align` tool can be used to align it.

```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --printf "%T\t%D.%N\n" | sort -rn | pt-align
7992197120 `tpch`.`orders`                                                            
7817084928 `tpch`.`lineitem`
```
:::

## pt-fingerprint

Convert queries to ciphertext.

### Overview

This tool can reformat SQL statements into another abstract form, where all specific values are replaced with `?`. It is suitable for data masking scenarios.

**Usage**

```bash
pt-fingerprint [OPTIONS] [FILES]
```

### Options

| Parameter                     | Meaning                                                         |
| ------------------------ | ------------------------------------------------------------ |
| --config                 | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --help                   | Display help and exit                                               |
| --match-embedded-numbers | Match numbers embedded in words and replace them with a single value                           |
| --match-md5-checksums    | Match MD5 checksums and replace them with a single value                                |
| --query                  | The query to convert to ciphertext                                           |
| --version                | Display version and exit                                               |

### Best Practices

#### Replacing a Single Statement

Replace values in a `SELECT` statement:
```bash
pt-fingerprint --query "select a, b, c from users where id = 5 and greatsql = 666"
```

::: details View the result
```bash
$ pt-fingerprint --query "select a, b, c from users where id = 5 and greatsql = 666"
select a, b, c from users where id = ? and greatsql = ?
```
:::

Replace values in an `INSERT` statement:
```bash
pt-fingerprint --query "INSERT INTO product(ID,NAME,PRICE) VALUES(1,'greatsql',666)"
```
::: details View the result
```bash
pt-fingerprint --query "INSERT INTO product(ID,NAME,PRICE) VALUES(1,'greatsql',666)"
insert into product(id,name,price) values(?+)
```
:::

If the SQL statement has numbers in field names or table names, they are also replaced:
```bash
$ pt-fingerprint --query "select a1, b2, c3 from users4 where id = 500 and greatsql = 8032"
select a?, ?, c? from users? where id = ? and greatsql = ?
```

If you do not want to replace field names or table names, add `--match-embedded-numbers`:

```bash
$ pt-fingerprint --match-embedded-numbers --query "select a1, b2, c3 from users4 where id = 5 and greatsql = 666"
select a1, b2, c3 from users4 where id = ? and greatsql = ?
```
::: tip Tip
The `--match-md5-checksums` parameter is used similarly, to avoid MD5 values being replaced.
:::

#### Replacing Statements in Files

Create the file `pt_fingerprint_test_sql.txt` with the following content:

```ini
select a from users where greatsql = 666;
select b from users where greatsql = 777;
select c from users where 
greatsql = 888;
```

Replace all SQL statements in the file:

```bash
pt-fingerprint pt_fingerprint_test_sql.txt
```
::: details View the result
```bash
$ pt-fingerprint pt_fingerprint_test_sql.txt
select a from users where greatsql = ?
select b from users where greatsql = ?
select c from users where greatsql = ?
```
:::

::: tip Tip
No matter what the format in the file is, the `pt-fingerprint` tool normalizes spaces, etc.<br />

Of course, the SQL content of the [Slow Query Log](../2-about-greatsql/4-2-greatsql-slow-log.md) can also be replaced.
:::

## pt-kill

Kill SQL statements that meet the conditions.

### Overview

The `pt-kill` tool can kill any statement, especially when a large number of blocks, deadlocks, or a problematic SQL causes high load on MySQL/GreatSQL. It filters out replication threads by default.

**Usage**

```bash
pt-kill [OPTIONS] [DSN]
```

### Options

At least one of `--kill`, `--kill-query`, `--print`, `--execute-command`, or `--stop` must be specified

Some parameter options are mutually exclusive and cannot exist at the same time. See:

| Option A           | Option B            | Relationship |
| --------------- | ---------------- | ---- |
| --any-busy-time | --each-busy-time | Mutually exclusive |
| --kill          | --kill-query     | Mutually exclusive |
| --daemonize     | --test-matching  | Mutually exclusive |

All parameter options are as follows:

| Option                 | Meaning                                                         |
| -------------------- | ------------------------------------------------------------ |
| --ask-pass           | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --charset            | Default character set                                                   |
| --config             | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --create-log-table   | Create the `--log-dsn` table if it does not exist                                |
| --daemonize          | Run in the background as a daemon                                 |
| --database           | The database used for the connection                                             |
| --defaults-file      | Read MySQL/GreatSQL options only from the given file                       |
| --filter             | Discard events for which this Perl code does not return true                           |
| --group-by           | Apply matching to each class of queries grouped by this `SHOW PROCESSLIST` column         |
| --help               | Display help and exit                                               |
| --host               | Connect to the host                                                   |
| --interval           | The frequency of checking queries to terminate                                       |
| --log                | Print all output to this file when daemonized                             |
| --log-dsn            | Store every terminated query in this DSN                              |
| --json               | Print terminated queries as JSON, must be used with `--print`.             |
| --json-fields        | Specify additional keys to include in the JSON output when using `--json`                 |
| --password           | The password used when connecting                                             |
| --pid                | Create the given PID file                                          |
| --port               | The port number used for the connection                                             |
| --query-id           | Print the ID of the query just terminated                                    |
| --rds                | Indicates that the relevant instance is on Amazon RDS                               |
| --run-time           | How long to run before exiting                                         |
| --sentinel           | Exit if this file exists                                         |
| --slave-user         | Set the user used to connect to the replica                                       |
| --slave-password     | Set the password used to connect to the replica                                       |
| --set-vars           | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket             | The socket file used for the connection                                         |
| --stop               | Make pt-kill create the sentinel file specified by `--sentinel` and exit              |
| --[no]strip-comments | Remove SQL comments from queries in the `Info` column of `PROCESSLIST`             |
| --user               | The login user                                                   |
| --version            | Display version and exit                                               |
| --[no]version-check  | Version check                                                     |
| --victims            | Which matching queries in each class will be terminated                               |
| --wait-after-kill    | Wait after killing a query, then look for more queries to kill               |
| --wait-before-kill   | Wait before terminating queries                                           |

### Best Practices

#### Killing Connections That Have Been Running for a Specified Time

Record query statements that take more than 30 seconds every ten seconds, and output these statements to the `/data/pt_slow.log` file:

```bash
pt-kill --user=root --ask-pass --match-info "select|SELECT" --match-command='Query' --busy-time 30 --victims all --interval 10 --daemonize --print --log=/data/pt_slow.log
```

- `--match-command`: matches the command of the current connection, corresponding to the Command value captured by SHOW PROCESSLIST (selectable values: Query, Sleep, Binlog Dump, Connect, Delayed insert, Execute, Fetch, Init DB, Kill, Prepare, Processlist, Quit, Reset stmt, Table Dump);

- `--match-info`: regular expression matching of the running SQL, case-sensitive;

- `--interval`: how often to run. Default unit is seconds. Default value is 30 seconds

You can also add `--kill` to directly kill the matching query statements:

```bash
pt-kill --user=root --ask-pass --match-info "select|SELECT" --match-command='Query' --busy-time 30 --victims all --interval 10 --daemonize --kill --log=/data/pt_slow.log
```

::: tip Tip
The default of `--victims` is `oldest`, which only kills the query that was initiated first and has existed the longest. `all` kills all matching threads. `all-but-oldest` keeps the longest one and kills all others.
:::

#### Killing Sessions of a Specified IP

Print sessions of the specified IP:

```bash
pt-kill --user=root --ask-pass --match-db='test_db' --match-host "192.168.6.55" --busy-time 30 --victims all --interval 10 --daemonize --print --log=/data/pt_ip.log
```

Kill sessions of the specified IP:

```bash
pt-kill --user=root --ask-pass --match-db='test_db' --match-host "192.168.6.55" --busy-time 30 --victims all --interval 10 --daemonize --kill --log=/data/pt_ip.log
```

#### Killing Sessions of a Specified User

Kill sessions of the specified user:

```bash
pt-kill --user=root --ask-pass --match-db='test_db' --match-user "greatsql" --victims all --interval 10 --daemonize --kill --log=/data/pt_user.log
```

Kill idle connections of the specified user that are longer than 10 seconds:

```bash
pt-kill --user=root --ask-pass --match-db='db_name' --match-user "greatsql" --victims all --interval 10 --daemonize --kill --match-command='Sleep' --idle-time 10 --log=/data/pt_user.log
```
::: danger Special Reminder
The `pt-kill` tool runs in the background and periodically kills matching users and statements.
To stop it, use `kill -9 $(ps -ef| grep pt-kill |grep -v grep |awk '{print $2}')`.
:::

## pt-secure-collect

### Overview

`pt-secure-collect` is used to collect, clean, package, and encrypt data.

**Usage**

```bash
pt-secure-collect [<flags>] <command> [<args> ...]
```
By default, pt-secure-collect collects the following output:

- pt-stalk
- pt-summary
- pt-mysql-summary

**Collection command**
```
pt-secure-collect collect
```
**Decryption command**
```
pt-secure-collect decrypt
```
**Encryption command**
```
pt-secure-collect encrypt
```
**Cleanup command**
```
pt-secure-collect sanitize
```
### Best Practices

#### Collecting GreatSQL Information

Collect GreatSQL information in a non-encrypted manner and do not delete temporary files:
```bash
pt-secure-collect collect --mysql-user=root --mysql-password="" --mysql-port=3306 --mysql-host=localhost --bin-dir=/usr/bin --temp-dir=/data/data_collection --no-encrypt --no-remove-temp-files
```

::: details View the result
```bash
$ pt-secure-collect collect --mysql-user=root --mysql-password="" --mysql-port=3306 --mysql-host=localhost --bin-dir=/usr/bin --temp-dir=/data/data_collection --no-encrypt --no-remove-temp-files

INFO[2024-03-11 17:05:02] Creating temporary directory: /data/data_collection 
INFO[2024-03-11 17:05:02] Temp directory is "/data/data_collection"    
INFO[2024-03-11 17:05:02] Creating output file "/data/data_collection/pt-stalk_2024-03-11_17_05_02.out" 
INFO[2024-03-11 17:05:02] Running pt-stalk --no-stalk --iterations=2 --sleep=30 --host=localhost --dest=/data/data_collection --port=3306 --user=root --password=******** 
INFO[2024-03-11 17:06:35] Creating output file "/data/data_collection/pt-summary_2024-03-11_17_06_35.out" 
INFO[2024-03-11 17:06:35] Running pt-summary                           
INFO[2024-03-11 17:06:36] Creating output file "/data/data_collection/pt-mysql-summary_2024-03-11_17_06_36.out" 
INFO[2024-03-11 17:06:36] Running pt-mysql-summary --host=localhost --port=3306 --user=root --password=******** 
INFO[2024-03-11 17:06:49] Sanitizing output collected data             
INFO[2024-03-11 17:06:57] Creating tar file "/data/data_collection/data_collection.tar.gz" 
```
:::

::: tip Tip
Although `--mysql-port` and `--mysql-host` have default values, they still need to be specified; otherwise, errors are reported when calling and running other tools.
:::

From the output, it can be seen that the `pt-secure-collect` tool calls the three tools `pt-stalk`, `pt-summary`, and `pt-mysql-summary`.

Enter the `data_collection` folder to see all temporary files and a `data_collection.tar.gz` compressed file:

```bash
$ ls /data/data_collection
2024_03_11_17_05_03-df              2024_03_11_17_05_03-opentables2            2024_03_11_17_05_33-diskstats       2024_03_11_17_05_33-processlist
2024_03_11_17_05_03-disk-space      2024_03_11_17_05_03-output                 2024_03_11_17_05_33-dmesg           data_collection.tar.gz   .......the rest is omitted
```

#### Encrypting Files
```bash
pt-secure-collect encrypt /data/pt_secure_collect.txt --outfile=/data/pt_secure_collect.aes
```
::: details View the result
```bash
$ pt-secure-collect encrypt /data/pt_secure_collect.txt --outfile=/data/pt_secure_collect.aes
Encryption password:  -- Enter the encryption password here
Re type password:     -- Enter the encryption password again
INFO[2024-03-12 09:36:39] Encrypting file "/data/pt_secure_collect.txt" into "/data/pt_secure_collect.aes"  -- Encryption successful
```
:::

After successful encryption, a file with the suffix `aes` is generated. Viewing it directly shows garbled text:

```bash
$ ls
pt_secure_collect.aes pt_secure_collect.txt

$ cat pt_secure_collect.aes
5�66~x�y��+�    ?i`��pESϡ>()�g�,�e�u -- Garbled text
```

#### Decrypting Files
```bash
pt-secure-collect decrypt /data/pt_secure_collect.aes
```
::: details View the result
```bash
$ pt-secure-collect decrypt /data/pt_secure_collect.aes
Encryption password: # Enter the encryption password
INFO[2024-03-12 09:41:35] Decrypting file "/data/pt_secure_collect.aes" into "pt_secure_collect" 
```
:::

View the decrypted file:
```bash
$ cat pt_secure_collect
111
aaa
select * from test where id =2;
```

If a wrong password is entered, it does not prompt that the password is wrong, but outputs garbled results:

```bash
$ pt-secure-collect decrypt /data/pt_secure_collect.aes
Encryption password:  # Assume a wrong password is entered here
INFO[2024-03-12 09:44:45] Decrypting file "/data/pt_secure_collect.aes" into "pt_secure_collect" 

$ cat pt_secure_collect
;       �}X����#z1�e��s�/��E���OeB�6��,��       �# 
```

#### Sanitizing Files

This function is somewhat similar to the `pt-fingerprint` tool introduced above, both using `?` to replace key information.

First create a `pt_secure_collect.txt` text file:

```ini
select * from test where id =2;
ip = 192.168.6.66
```

Use the `sanitize` function, which hides key information and hostnames:

```bash
pt-secure-collect sanitize --input-file=/data/pt_secure_collect.txt --no-sanitize-queries
```
::: details View the result
```bash
$ pt-secure-collect sanitize --input-file=/data/pt_secure_collect.txt --no-sanitize-queries
select * from test where id =?;
ip = hostname
```
:::

::: tip Tip
If you do not want to hide the hostname, use `--no-sanitize-hostnames`.
If you do not want to hide queries, use `--no-sanitize-queries`.
:::


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
