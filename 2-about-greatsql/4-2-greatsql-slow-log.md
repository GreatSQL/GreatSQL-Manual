# Slow Query Log（慢查询日志）

## 什么是慢查询日志

GreatSQL 的慢查询日志，用来记录在 GreatSQL 中响应时间超过阀值的语句，当一次请求响应时长超过 `long_query_time`，则会被记录到慢查询日志中。一般也简称为 *慢日志* 或 *Slow Log*。

参数 `long_query_time` 默认值为 10，单位是 *秒*，可以设置为小数，例如 0.01 表示 0.01 秒，即 10 ms（毫秒）。一般建议 `long_query_time` 参数值不高于 0.05，即所有响应耗时超过 50 ms的请求都被当做时慢查询请求。

Slow Log 可以有效帮助发现那些响应较慢的 SQL 请求，利用 [`mysqldumpslow`](https://dev.mysql.com/doc/refman/8.0/en/mysqldumpslow.html) 或  [`pt-query-digest`](../12-dev-guide/12-7-4-sql-optimize-slowsql.md#利用-pt-query-digest-分析慢查询-sql) 工具针对这些慢查询进行优化，可以显著提高 GreatSQL 的整体响应效率，避免严重的性能瓶颈风险。当 GreatSQL 数据库发生 SQL 请求被阻塞，或 SQL 请求明显变慢的时候，应当尽快检查 Slow Log，找到那些可能造成这些原因的慢查询。

GreatSQL 数据库默认不会记录 Slow Log，需要手动设置相关参数以启用。通常建议启用，便于及时发现数据库中潜在的性能瓶颈风险。

## 配置 Slow Log

可以在线执行下面的命令启用 Slow Log：
```sql
greatsql> SET GLOBAL slow_query_log = ON;
```

执行下面的命令查看 Slow Log 启用与否，以及其他相关配置：

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

看到 Slow Log 已经启用，日志文件全路径是 `/data/GreatSQL/slow.log`，判定是否慢查询的阈值为 50 ms。

### 关于 long_query_time阈值

再看判定慢查询响应时长阈值设置参数 `long_query_time`，执行如下命令：

```sql
greatsql> SHOW VARIABLES LIKE 'long_query_time';
+-----------------+-----------+
| Variable_name   | Value     |
+-----------------+-----------+
| long_query_time | 0.050000  |
+-----------------+-----------+
```

它支持在线动态修改全局设定，修改完后，会对再次创建的新连接会话生效（当前会话不能立即生效）：
```sql
greatsql> SET GLOBAL long_query_time = 0.01;
```

也支持只修改会话级设定，会对当前连接会话立即生效：
```sql
greatsql> SET long_query_time = 0.01;
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

也可以修改 my.cnf 配置文件使其持久化（下次数据库实例重启后生效）：

```ini
[mysqld]
slow_query_log = ON 
slow_query_log_file=/data/GreatSQL/slow.log 
long_query_time = 0.01
```

如果不配置 Slow Log 的全路径名，它将默认存储到 GreatSQL 数据库的 `datadir` 目录下；如果不指定文件名，则默认文件名为 `hostname-slow.log`。

### 关于 min_examined_row_limit

这个参数用于设助判断 Slow Log 条件，当一个 SQL 请求响应耗时超过 `long_query_time` 阈值，但其扫描读取的行数如果没超过 `min_examined_row_limit`，则它仍然不会被判定为慢查询。

也就是说，当 `min_examined_row_limit` 参数值大于 0 时，一个 SQL 请求需要同时满足响应耗时超过 `long_query_time` 并且它扫描读取的行数超过 `min_examined_row_limit` 才会最终被判定为慢查询。

```sql
greatsql> SHOW VARIABLES LIKE 'min_examined_row_limit';
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| min_examined_row_limit | 0     |
+------------------------+-------+
```

它的默认值为 0，表示不执行这个辅助判断。

它和 `long_query_time` 一样，既可以修改全局设定，也支持在会话级设定。

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

### 关于 log-queries-not-using-indexes

参数 `log-queries-not-using-indexes` 作用是将所有未能使用索引的查询请求也判定为慢查询，可能是没有创建索引，也可能是用不上合适的索引。

| Command-Line Format  | --log-queries-not-using-indexes[={OFF\|ON}] |
| :------------------- | ------------------------------------------- |
| System Variable      | log_queries_not_using_indexes               |
| Scope                | Global                                      |
| Dynamic              | Yes                                         |
| SET_VAR Hint Applies | No                                          |
| Type                 | Boolean                                     |
| Default Value        | OFF                                         |

### 关于 log_throttle_queries_not_using_indexes

参数 `log_throttle_queries_not_using_indexes` 用于设置每分钟写入慢日志中的不走索引的 SQL 语句的次数，避免相同的 SQL 请求短时间内大量写入日志，影响整体性能。该参数默认为 0，表示不开启。

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

### 关于 log_slow_extra

参数 `log_slow_extra` 从 GreatSQL 8.0.14 开始新增，用于设置是否在慢日志中记录更多详细信息，例如 *Thread_id*、*Read_rnd_next*、*Sort_merge_passes*、*Created_tmp_disk_tables*、*Created_tmp_tables* 等，这些额外信息对于分析判断慢查询 SQL 的性能瓶颈还是很有帮助的，因此建议启用。

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

### GreatSQL 对 Slow Log 的增强

在使用 GreatSQL 查看慢查询日志内容时，还有 `Query_time`、`Lock_time` 等更多额外的信息，使得日志内容更丰富，这些额外信息可以帮助更好地排查分析性能瓶颈。

下面通过一个简单的案例来展示。

把慢查询时长阈值设置为 1 秒：

```sql
greatsql> SET GLOBAL slow_query_log = ON;
greatsql> SET GLOBAL long_query_time = 1;
greatsql> SET long_query_time = 1;
greatsql> SHOW VARIABLES LIKE '%long_query_time%';
+-----------------+----------+
| Variable_name   | Value    |
+-----------------+----------+
| long_query_time | 1.000000 |
+-----------------+----------+
```

执行一次总耗时超过 1 秒的 SQL 请求：

```sql
greatsql> SELECT * FROM `student` WHERE id > 1000 AND `name` = 'Yunxi';
+---------+-------+-------+------+---------+
| 9999715 |   707 | Yunxi |  863 |      71 |
.......省略
| 9999999 |   418 | Yunxi |  793 |     734 |
+---------+-------+-------+------+---------+
166949 rows in set (3.94 sec)

-- 查询当前有多少次慢查询记录
greatsql> SHOW GLOBAL STATUS LIKE 'Slow_queries';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| Slow_queries  | 4     |
+---------------+-------+
```

查看慢查询日志文件，此次慢查询已被记录：

```shell
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
SELECT * FROM `student` WHERE id>100000 AND `name`='Yunxi';
```

可以看到慢查询日志记录的非常详细，从上述日志中能看到几个信息：

1. 这个 SQL 的耗时 3.985637 秒。
2. 返回结果有 165346 行，总共需要扫描 9900000 行数据。如果扫描行数很多，但返回行数很少，说明该 SQL 效率很低，可能索引不当，或者没有加上 `LIMIT` 限制。
3. *Read_\** 等几个指标表示这个 SQL 读记录的方式，是否顺序读、随机读等。
4. *Sort_\** 等几个指标表示该 SQL 是否产生了排序，及其代价。如果有且代价较大，需要想办法优化。
5. *_tmp_\** 等几个指标表示该 SQL 是否产生临时表、临时文件，及其代价。如果有且代价较大，需要想办法优化。
6. *Full_scan/Full_join* 表示是否产生了全表扫描或全表 JOIN，如果有且 SQL 耗时较大，需要想办法优化。
7. *InnoDB_IO_* 等几个指标表示 InnoDB 逻辑读相关数据。
8. *InnoDB_rec_lock_wait* 表示是否有行锁等待。
9. *InnoDB_queue_wait* 表示是否有排队等待。
10. *InnoDB_pages_distinct* 表示该 SQL 总共读取了多少个InnoDB Page，是个非常重要的指标，可以用来辅助判断当前该表的碎片率是否较高。

## 慢查询日志分析工具

在生产环境中，如果要手工分析日志，查找、分析SQL，显然是个体力活，GreatSQL 提供了日志分析工具 `mysqldumpslow` ，或者是可以使用另一个工具 `pt-query-digest`。

利用 `pt-query-digest` 工具可以对 通用日志、慢查询日志、二进制日志，以及 `PROCESSLIST` 和 `tcpdump` 抓包结果进行分析 GreatSQL 的运行状况。分析结果可以输出到文件中，或则直接写回到数据库中。

慢日志分析的详细方法参考：
- [慢查询 SQL 分析优化](../12-dev-guide/12-7-4-sql-optimize-slowsql.md#利用-pt-query-digest-分析慢查询-sql) 
- [Percona Toolkit 神器全攻略](https://mp.weixin.qq.com/s/x37JiZoeZ5deFHhvNU1IDQ)

## 关闭慢查询日志

> 除非确实不需要关注 SQL 执行效率，否则不建议建议关闭慢查询日志

可以执行下面的命令，在线动态关闭慢查询日志：

```sql
greatsql> SET GLOBAL slow_query_log = off;
```

也可以通过修改 my.cnf 配置文件，使之在下次重启后持久化生效（默认情况下是未开启慢查询日志的）：
```ini
[mysqld]
slow_query_log = OFF
```

## 慢查询日志管理

建议管理员定期（比如每天或每周利用定时任务处理）关注和分析慢查询日志，在分析完历史慢查询日之后，就可以进行备份后清空，避免日志内容持续堆积：

```shell
$ cd /data/GreatSQL
$ cp slow.log slow-`date +'%Y%m%d'`.log
$ echo '' > slow.log

# 清空刷新
$ mysqladmin -uroot -p flush-logs
```

也可以在完成 `cp` 备份后，连入 GreatSQL 后执行相应的 SQL 命令刷新慢查询日志：

```sql
greatsql> FLUSH SLOW LOGS;
```

> 不要在服务器上用 vi 等方式在线打开慢查询日志文件，这可能会文件句柄修改，使得该文件状态异常，并造成不可意料的磁盘满问题。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
