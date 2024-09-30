# Percona Toolkit 性能类

::: tip 小贴士
`$`为 Linux 命令提示符、`greatsql>`为 GreatSQL 数据库提示符。
:::

## 性能类

在 Percona Toolkit 中性能类共有以下工具：

- `pt-index-usage`：分析日志中索引使用情况，并出报告。
- `pt-pmp`：查询结果跟踪，并汇总跟踪结果。
- `pt-table-usage`：分析日志中查询并分析表使用情况。
- `pt-visual-explain`：格式化执行计划。
- `pt-mongodb-index-check`：MongoDB 索引执行检查。
- `pt-mongodb-query-digest`：通过聚合来自 MongoDB 查询分析器的查询来报告查询使用统计信息。

## pt-index-usage

### 概要

从慢查询日志中读取查询并分析它们如何使用索引。

**用法**

```bash
pt-index-usage [OPTIONS] [FILES]
```

### 选项

该工具所有选项如下

| 参数                           | 含义                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| --ask-pass                     | 连接 MySQL/GreatSQL 提示输入密码                             |
| --charset                      | 默认字符集                                                   |
| --config                       | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --create-save-results-database | 如果 `--save-results-database` 不存在，则创建它                |
| --[no]create-views             | 为 `--save-results-database` 示例查询创建视图                  |
| --database                     | 用于连接的数据库                                             |
| --databases                    | 仅从此逗号分隔的数据库列表中获取表和索引                     |
| --databases-regex              | 仅从数据库中获取名称与此 Perl 正则表达式匹配的表和索引       |
| --defaults-file                | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --drop                         | 建议仅删除这些类型的未使用索引                               |
| --empty-save-results-tables    | 删除并重新创建 `--save-results-database` 中所有预先存在的表    |
| --help                         | 显示帮助                                                     |
| --host                         | 连接到主机                                                   |
| --ignore-databases             | 忽略这个以逗号分隔的数据库列表                               |
| --ignore-databases-regex       | 忽略名称与此 Perl 正则表达式匹配的数据库                     |
| --ignore-tables                | 忽略这个以逗号分隔的表名列表                                 |
| --ignore-tables-regex          | 忽略名称与 Perl 正则表达式匹配的表                           |
| --password                     | 连接时使用的密码                                             |
| --port                         | 连接的端口号                                                 |
| --progress                     | 将进度报告打印到 STDERR                                      |
| --quiet                        | 不打印任何告警                                               |
| --[no]report                   | 根据 `-–report-format` 报告格式打印报告                        |
| --report-format                | 报告的格式，目前只有一种：`drop_unused_indexes`                |
| --save-results-database        | 将结果保存到该数据库中的表中                                 |
| --set-vars                     | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket                       | 用于连接的套接字文件                                         |
| --tables                       | 仅从这个以逗号分隔的表列表中获取索引                         |
| --tables-regex                 | 仅从名称与此 Perl 正则表达式匹配的表中获取索引               |
| --user                         | 登录的用户                                                   |
| --version                      | 显示版本                                                     |
| --[no]version-check            | 版本检查                                                     |

### 最佳实践

```bash
pt-index-usage /data/GreatSQL/slow.log --host='localhost' --user='root' --ask-pass
```
::: details 查看运行结果
```bash
$ pt-index-usage /data/GreatSQL/slow.log --host='localhost' --user='root' --ask-pass
ALTER TABLE `tpch`.`lineitem` DROP KEY `lineitem_fk1`, DROP KEY `lineitem_fk2`; -- type:non-unique
```
:::


该工具连接到 GreatSQL 数据库服务器，读取查询日志，并使用 EXPLAIN 询问 GreatSQL 将如何使用每个查询。当完成时，打印出一个关于查询没有使用的索引。

也可以将打印出来的结果存入到数据库当中：

```bash
pt-index-usage /data/GreatSQL/slow.log --no-report --save-results-database h=127.0.0.1,P=3306,u=root,p=,D=test_db
```

进入到数据库中就可以看到自动创建了四张表：

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

- index_alternatives：此表记录了索引的替代方案。它包含了关于哪些索引可以替代其他索引的信息。
- index_usage：这张表跟踪了索引的使用情况。它记录了哪些索引被查询使用，以及它们的效率和性能。
- indexes：此表包含了数据库中所有表的索引信息。它记录了每个表的索引名称、列、类型等。
- tables：这张表记录了数据库中的所有表。它包含了表的名称、行数、大小等信息。

### 额外补充

在 MySQL/GreatSQL 5.7 版本中，sys schema提供了以下几张表，有助于分析数据库索引使用情况：

- `schema_index_statistics`：此表显示有关索引的统计信息，包括索引的大小、行数、唯一性和其他相关指标。它对于优化查询和了解索引的使用情况非常有用。
- `schema_redundant_indexes`：这个表显示重复索引或被其他索引替代的索引。具体来说，它列出了哪些索引是多余的，以及哪些索引是主导索引（使多余索引变得多余）。
- `schema_unused_indexes`：这个表显示那些没有被使用的索引。如果某个索引长时间没有被查询，就可能是多余的。通过检查这个表，您可以找到可以删除或优化的未使用索引。

在 MySQL/GreatSQL 8.0 版本中，也有几张表关于索引的：

- `INFORMATION_SCHEMA.INNODB_INDEXES` 表提供有关 `InnoDB` 索引的元数据。
- `INFORMATION_SCHEMA.INDEX_STATISTICS` 表提供了索引统计信息。

## pt-pmp

### 概要

查询结果跟踪，并汇总跟踪结果。获取进程的堆栈信息，并且对这些结果进行汇总。

::: tip 小贴士
进程的堆栈信息是通过gdb获取的，所以在获取过程中，会对数据库的性能有一定的影响。
:::

**用法**

```bash
pt-pmp [OPTIONS] [FILES]
```

### 选项

**该工具所有选项如下**

| 参数           | 含义                                                  |
| -------------- | ----------------------------------------------------- |
| --binary       | 要跟踪哪个二进制文件                                  |
| --help         | 显示帮助                                              |
| --interval     | `--iterations` 之间休眠的秒数                          |
| --iterations   | 要收集和聚合的跟踪数                                  |
| --lines        | 仅聚合许多函数的第一个指定数量，默认值是0也就是无穷大 |
| --pid          | 要跟踪的进程的进程 ID                                 |
| --save-samples | 聚合后将原始跟踪保留在此文件中                        |
| --version      | 显示版本                                              |

### 最佳实践

#### 根据进程名汇总堆栈信息

```bash
pt-pmp --binary mysqld
```
::: tip 小贴士
使用该工具需要安装gdb，否则报错 “gdb: command not found”。
:::

#### 汇总pstack获取的结果

使用 `ps -ef` 获取进程名，然后使用 `pstack` 获取堆栈信息，最后使用该工具汇总：
```bash
ps -ef |grep mysqld
mysql      29297       1  0 Apr24 ?        00:18:07 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-group-suffix=@mgr01
```
::: details 查看运行结果
```bash
ps -ef |grep mysqld
mysql      29297       1  0 Apr24 ?        00:18:07 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-group-suffix=@mgr01
```
:::

然后使用 `pstack` 获取堆栈信息：

```bash
pstack 29297 > /tmp/29297.info
```

最后使用 `pt-pmp` 工具汇总：

```bash
pt-pmp /tmp/29297.info
```

## pt-table-usage

### 概要

分析日志中查询并分析表使用情况通。过读取日志(例如：慢查询日志)中的查询语句，然后分析语句是如何使用表的，即：表之间的数据流向。

**用法**

```bash
pt-table-usage [OPTIONS] [FILES]
```

### 选项

| 参数                       | 含义                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | 连接 MySQL/GreatSQL 提示输入密码                               |
| --charset                  | 默认字符集                                                   |
| --config                   | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --constant-data-value      | 作为常量数据（文字）源打印的表                               |
| --[no]continue-on-error    | 出错时跳过错误继续运行                                       |
| --create-table-definitions | 从此逗号分隔文件列表中读取`CREATE TABLE`定义                 |
| --daemonize                | 后台运行                                                     |
| --database                 | 数据库名                                                     |
| --defaults-file            | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --explain-extended         | 执行 `EXPLAIN EXTENDED` 查询的服务器                           |
| --filter                   | 丢弃此 Perl 代码不返回 true 的事件                           |
| --help                     | 显示帮助                                                     |
| --host                     | 连接到主机                                                   |
| --id-attribute             | 使用此属性标识每个事件                                       |
| --log                      | 后台运行时将所有输出打印到此文件                             |
| --password                 | 连接时使用的密码                                             |
| --pid                      | 创建给定的 PID 文件                                          |
| --port                     | 用于连接的端口号                                             |
| --progress                 | 将进度报告打印到 STDERR                                      |
| --query                    | 分析指定的查询，而不是读取日志文件                           |
| --read-timeout             | 设置等待输入中的事件时间，默认为0即永远等待                  |
| --run-time                 | 运行时间，默认永远运行                                       |
| --set-vars                 | 以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket                   | 用于连接的套接字文件                                         |
| --user                     | 登录的用户                                                   |
| --version                  | 显示版本                                                     |

### 最佳实践

#### 分析语句结构

```bash
pt-table-usage --query="SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id WHERE t1.code = 2;"
```
::: details 查看运行结果
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

::: tip 小贴士
Explain 也可以分析语句结构。
:::

#### 分析慢查询日志

```bash
pt-table-usage /data/GreatSQL/slow.log
```
::: details 查看运行结果
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

- Query_id：查询的ID。
- SELECT：从表中获取数据。
- JOIN：已连接的表。
- WHERE：用于过滤结果的表。
- TLIST：查询语句中访问的表，通常是产生笛卡尔积。

## pt-visual-explain

### 概要

用于格式化 MySQL/GreatSQL 执行计划。

**用法**

```bash
pt-visual-explain [OPTIONS] [FILES]
```

### 选项

| 参数            | 含义                                                         |
| :-------------- | ------------------------------------------------------------ |
| --ask-pass      | 连接 MySQL/GreatSQL 提示输入密码                               |
| --charset       | 默认字符集                                                   |
| --clustered-pk  | 假设 PRIMARY KEY 索引访问不需要对 检索行                     |
| --config        | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --connect       | 将输入视为查询，并通过连接到数据库实例并对查询运行 EXPLAIN 来获取输出 |
| --databases     | 数据库列表                                                   |
| --defaults-file | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --format        | 设置输出格式，有两种格式(tree、dump)默认为tree               |
| --help          | 显示帮助                                                     |
| --host          | 连接到主机                                                   |
| --password      | 连接时使用的密码                                             |
| --pid           | 创建给定的 PID 文件                                          |
| --port          | 用于连接的端口号                                             |
| --set-vars      | 以逗号分隔的`variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket        | 用于连接的套接字文件                                         |
| --user          | 用于登录的用户                                               |
| --version       | 显示版本                                                     |

### 最佳实践

直接使用即可：

```bash
mysql -uroot -p -e "explain select * from test_db.test_t1" |pt-visual-explain --clustered-pk
```
::: details 查看运行结果
```bash
$ mysql -uroot -p -e "explain select * from test_db.test_t1" |pt-visual-explain --clustered-pk
Table scan
rows           9
+- Table
   table          test_t1
```
:::

此时会输出该语句格式化后的执行计划。

::: tip 小贴士
pt-visual-explain的信息有限，如果想获得更多详细信息，最好还是进入数据库查看执行计划。
:::

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
