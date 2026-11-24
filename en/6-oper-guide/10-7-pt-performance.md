# Percona Toolkit Performance

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## Performance

In Percona Toolkit, the performance category includes the following tools:

- `pt-index-usage`: Analyze index usage in logs and produce reports.
- `pt-pmp`: Track query results and summarize tracking results.
- `pt-table-usage`: Analyze queries in logs and analyze table usage.
- `pt-visual-explain`: Format the execution plan.
- `pt-mongodb-index-check`: Perform MongoDB index checks.
- `pt-mongodb-query-digest`: Report query usage statistics by aggregating queries from the MongoDB query analyzer.

## pt-index-usage

### Overview

Read queries from the slow query log and analyze how they use indexes.

**Usage**

```bash
pt-index-usage [OPTIONS] [FILES]
```

### Options

All options of this tool are as follows

| Parameter                           | Meaning                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| --ask-pass                     | Prompt for a password when connecting to MySQL/GreatSQL                             |
| --charset                      | Default character set                                                   |
| --config                       | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --create-save-results-database | Create `--save-results-database` if it does not exist                |
| --[no]create-views             | Create views for the `--save-results-database` sample queries                  |
| --database                     | The database used for the connection                                             |
| --databases                    | Only get tables and indexes from this comma-separated database list                     |
| --databases-regex              | Only get tables and indexes from databases whose names match this Perl regex       |
| --defaults-file                | Read MySQL/GreatSQL options only from the given file                       |
| --drop                         | Suggest dropping only these types of unused indexes                               |
| --empty-save-results-tables    | Drop and recreate all pre-existing tables in `--save-results-database`    |
| --help                         | Display help                                                     |
| --host                         | Connect to the host                                                   |
| --ignore-databases             | Ignore this comma-separated database list                               |
| --ignore-databases-regex       | Ignore databases whose names match this Perl regex                     |
| --ignore-tables                | Ignore this comma-separated table name list                                 |
| --ignore-tables-regex          | Ignore tables whose names match the Perl regex                           |
| --password                     | The password used when connecting                                             |
| --port                         | The port number for the connection                                                 |
| --progress                     | Print progress reports to STDERR                                      |
| --quiet                        | Do not print any warnings                                               |
| --[no]report                   | Print the report according to the `-–report-format` report format                        |
| --report-format                | The format of the report. Currently there is only one: `drop_unused_indexes`                |
| --save-results-database        | Save the results to tables in this database                                 |
| --set-vars                     | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket                       | The socket file used for the connection                                         |
| --tables                       | Only get indexes from this comma-separated table list                         |
| --tables-regex                 | Only get indexes from tables whose names match this Perl regex               |
| --user                         | The login user                                                   |
| --version                      | Display the version                                                     |
| --[no]version-check            | Version check                                                     |

### Best Practices

```bash
pt-index-usage /data/GreatSQL/slow.log --host='localhost' --user='root' --ask-pass
```
::: details View the result
```bash
$ pt-index-usage /data/GreatSQL/slow.log --host='localhost' --user='root' --ask-pass
ALTER TABLE `tpch`.`lineitem` DROP KEY `lineitem_fk1`, DROP KEY `lineitem_fk2`; -- type:non-unique
```
:::


This tool connects to the GreatSQL database server, reads the query log, and uses `EXPLAIN` to ask GreatSQL how it will use each query. When finished, it prints the indexes not used by the queries.

The printed results can also be stored in the database:

```bash
pt-index-usage /data/GreatSQL/slow.log --no-report --save-results-database h=127.0.0.1,P=3306,u=root,p=,D=test_db
```

Entering the database, it can be seen that four tables were automatically created:

```sql
greatsql> SHOW TABLES;
+--------------------+
| Tables_in_test_db  |
+--------------------+
| index_alternatives |
| index_usage        |
| indexes            |
| tables             |
+--------------------+
4 rows in set (0.01 sec)
```

- index_alternatives: This table records index alternatives. It contains information about which indexes can replace other indexes.
- index_usage: This table tracks index usage. It records which indexes are used by queries, as well as their efficiency and performance.
- indexes: This table contains index information of all tables in the database. It records the index name, columns, type, etc. of each table.
- tables: This table records all tables in the database. It contains the table name, row count, size, and other information.

### Additional Supplement

In MySQL/GreatSQL 5.7, the sys schema provides the following tables, which help analyze database index usage:

- `schema_index_statistics`: This table displays statistics about indexes, including index size, row count, uniqueness, and other related metrics. It is very useful for optimizing queries and understanding index usage.
- `schema_redundant_indexes`: This table shows duplicate indexes or indexes replaced by other indexes. Specifically, it lists which indexes are redundant and which indexes are the dominant indexes (making the redundant indexes redundant).
- `schema_unused_indexes`: This table shows indexes that have not been used. If an index has not been queried for a long time, it may be redundant. By checking this table, unused indexes that can be dropped or optimized can be found.

In MySQL/GreatSQL 8.0, there are also several tables about indexes:

- The `INFORMATION_SCHEMA.INNODB_INDEXES` table provides metadata about `InnoDB` indexes.
- The `INFORMATION_SCHEMA.INDEX_STATISTICS` table provides index statistics.

## pt-pmp

### Overview

Track query results and summarize tracking results. Get the stack information of the process and summarize these results.

::: tip Tip
The stack information of the process is obtained through `gdb`, so during the acquisition process, there is a certain impact on database performance.
:::

**Usage**

```bash
pt-pmp [OPTIONS] [FILES]
```

### Options

**All options of this tool are as follows**

| Parameter           | Meaning                                                  |
| -------------- | ----------------------------------------------------- |
| --binary       | Which binary file to trace                                  |
| --help         | Display help                                              |
| --interval     | The seconds to sleep between `--iterations`                          |
| --iterations   | The number of traces to collect and aggregate                                  |
| --lines        | Only aggregate the first specified number of many functions, default value is 0, i.e., infinite |
| --pid          | The process ID of the process to trace                                 |
| --save-samples | Keep the original traces in this file after aggregating                        |
| --version      | Display the version                                              |

### Best Practices

#### Summarizing Stack Information by Process Name

```bash
pt-pmp --binary mysqld
```
::: tip Tip
Using this tool requires installing gdb; otherwise, the error "gdb: command not found" is reported.
:::

#### Summarizing Results Obtained by pstack

Use `ps -ef` to get the process name, then use `pstack` to get the stack information, and finally use this tool to summarize:
```bash
ps -ef |grep mysqld
mysql      29297       1  0 Apr24 ?        00:18:07 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-group-suffix=@mgr01
```
::: details View the result
```bash
ps -ef |grep mysqld
mysql      29297       1  0 Apr24 ?        00:18:07 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-group-suffix=@mgr01
```
:::

Then use `pstack` to get the stack information:

```bash
pstack 29297 > /tmp/29297.info
```

Finally, use the `pt-pmp` tool to summarize:

```bash
pt-pmp /tmp/29297.info
```

## pt-table-usage

### Overview

Analyze queries in logs and analyze table usage. By reading the query statements in the log (such as the slow query log), it then analyzes how the statements use tables, i.e., the data flow between tables.

**Usage**

```bash
pt-table-usage [OPTIONS] [FILES]
```

### Options

| Parameter                       | Meaning                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset                  | Default character set                                                   |
| --config                   | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --constant-data-value      | Print tables used as constant data (literal) sources                               |
| --[no]continue-on-error    | Skip errors and continue running when errors occur                                       |
| --create-table-definitions | Read `CREATE TABLE` definitions from this comma-separated file list                 |
| --daemonize                | Run in the background                                                     |
| --database                 | Database name                                                     |
| --defaults-file            | Read MySQL/GreatSQL options only from the given file                       |
| --explain-extended         | The server to execute `EXPLAIN EXTENDED` queries                           |
| --filter                   | Discard events for which this Perl code does not return true                           |
| --help                     | Display help                                                     |
| --host                     | Connect to the host                                                   |
| --id-attribute             | Use this attribute to identify each event                                       |
| --log                      | Print all output to this file when running in the background                             |
| --password                 | The password used when connecting                                             |
| --pid                      | Create the given PID file                                          |
| --port                     | The port number used for the connection                                             |
| --progress                 | Print progress reports to STDERR                                      |
| --query                    | Analyze the specified query instead of reading the log file                           |
| --read-timeout             | Set the time to wait for events in the input, default is 0, i.e., wait forever                  |
| --run-time                 | Run time, default runs forever                                       |
| --set-vars                 | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --socket                   | The socket file used for the connection                                         |
| --user                     | The login user                                                   |
| --version                  | Display the version                                                     |

### Best Practices

#### Analyzing Statement Structure

```bash
pt-table-usage --query="SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id WHERE t1.code = 2;"
```
::: details View the result
```bash
$ pt-table-usage --query="SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id WHERE t1.code = 2;"
Query_id: 0xB11D21EDB7630E7E.1
SELECT t1
SELECT t2
JOIN t1
JOIN t2
WHERE t1
```
:::

::: tip Tip
Explain can also analyze statement structure.
:::

#### Analyzing the Slow Query Log

```bash
pt-table-usage /data/GreatSQL/slow.log
```
::: details View the result
```bash
$ pt-table-usage /data/GreatSQL/slow.log

Query_id: 0x98947CCF9160CAC9.1
SELECT information_schema.ROUTINES
WHERE information_schema.ROUTINES

Query_id: 0x459C4D56E071E4D7.1
SELECT performance_schema.threads
SELECT performance_schema.table_handles
JOIN performance_schema.table_handles
JOIN performance_schema.threads
```
:::

- Query_id: The ID of the query.
- SELECT: Get data from the table.
- JOIN: The joined tables.
- WHERE: The tables used to filter results.
- TLIST: The tables accessed in the query statement, usually producing a Cartesian product.

## pt-visual-explain

### Overview

Used to format the MySQL/GreatSQL execution plan.

**Usage**

```bash
pt-visual-explain [OPTIONS] [FILES]
```

### Options

| Parameter            | Meaning                                                         |
| :-------------- | ------------------------------------------------------------ |
| --ask-pass      | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset       | Default character set                                                   |
| --clustered-pk  | Assume that PRIMARY KEY index access does not need to retrieve rows                     |
| --config        | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --connect       | Treat the input as a query and get the output by connecting to the database instance and running EXPLAIN on the query |
| --databases     | Database list                                                   |
| --defaults-file | Read MySQL/GreatSQL options only from the given file                       |
| --format        | Set the output format. There are two formats (tree, dump), default is tree               |
| --help          | Display help                                                     |
| --host          | Connect to the host                                                   |
| --password      | The password used when connecting                                             |
| --pid           | Create the given PID file                                          |
| --port          | The port number used for the connection                                             |
| --set-vars      | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --socket        | The socket file used for the connection                                         |
| --user          | The user used for login                                               |
| --version       | Display the version                                                     |

### Best Practices

Use it directly:

```bash
mysql -uroot -p -e "explain select * from test_db.test_t1" |pt-visual-explain --clustered-pk
```
::: details View the result
```bash
$ mysql -uroot -p -e "explain select * from test_db.test_t1" |pt-visual-explain --clustered-pk
Table scan
rows           9
+- Table
   table          test_t1
```
:::

At this time, the formatted execution plan of the statement is output.

::: tip Tip
The information of `pt-visual-explain` is limited. If you want more detailed information, it is best to enter the database and view the execution plan.
:::

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
