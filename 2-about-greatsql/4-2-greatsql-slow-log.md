# 图解GreatSQL Slow Query Log（慢查询日志）

## 什么是慢查询日志

GreatSQL 的慢查询日志，用来记录在 GreatSQL 中响应时间超过阀值的语句，具体指运行时间超过 `long_query_time` 值的SQL，则会被记录到慢查询日志中。`long_query_time` 的默认值为10，意思是运行10秒以上(不含10秒)的语句，认为是超出了我们的最大忍耐时间值。

它的主要作用是，帮助我们发现那些执行时间特别长的SQL查询，并且有针对性地进行优化，从而提高系统的整体效率。当我们的数据库服务器发生阻塞、运行变慢的时候，检查一下慢查询日志，找到那些慢查询，对解决问题很有帮助。比如一条SQL执行超过5秒钟，我们就算慢SQL，希望能收集超过5秒的SQL，结合EXPLAIN进行全面分析。

默认情况下，GreatSQL数据库没有开启慢查询日志，需要我们手动来设置这个参数。如果不是调优需要的话，一般不建议启动该参数，因为开启慢查询日志会或多或少带来一定的性能影响

慢查询日志支持将日志记录写入文件。

## 如何开启慢查询日志

### 开启slow_query_log

```sql
# 开启慢查询
greatsql> SET GLOBAL slow_query_log='ON';
Query OK, 0 rows affected (0.12 sec)
```

然后我们再来查看下慢查询日志是否开启，以及慢查询日志文件的位置：

```sql
greatsql> SHOW VARIABLES LIKE '%slow_query_log%';
+-----------------------------------+--------------------------------+
| Variable_name                     | Value                          |
+-----------------------------------+--------------------------------+
| slow_query_log                    | ON                             |
| slow_query_log_always_write_time  | 10.000000                      |
| slow_query_log_file               | /var/lib/mysql/slow.log        |
| slow_query_log_use_global_control |                                |
+-----------------------------------+--------------------------------+
4 rows in set (0.00 sec)
```

你能看到这时慢查询分析已经开启，同时文件保存在 `/var/lib/mysql/slow.log` 文件中。

### 修改long_query_time阈值

接下来我们来看下慢查询的时间阈值设置，使用如下命令：

```sql
greatsql> SHOW VARIABLES LIKE '%long_query_time%';
+-----------------+-----------+
| Variable_name   | Value     |
+-----------------+-----------+
| long_query_time | 10.000000 |
+-----------------+-----------+
1 row in set (0.00 sec)
```

意思就是超过10秒的SQL语句就会被记录慢查询日志中，那要如何修改这个阈值呢？

```sql
greatsql> SET GLOBAL long_query_time = 1;
```

或修改 my.cnf 文件，[mysqld]下增加或修改参数`long_query_time`、`slow_query_log`和`slow_query_log_file`后，然后重启MySQL服务器。

```bash
[mysqld]
slow_query_log=ON 
#开启慢查询日志的开关
slow_query_log_file=/var/lib/mysql/slow.log 
#慢查询日志的目录和文件名信息
long_query_time=3 
#设置慢查询的阈值为3秒，超出此设定值的SQL即被记录到慢查询日志
log_output=FILE 
#一般有两种形式，一种是输出到文件FILE中，一种是写入数据表格table中，会保存到mysql库的slow_log表中
```

如果不指定存储路径，慢查询日志将默认存储到 GreatSQL 数据库的数据文件夹下。如果不指定文件名，默认文件名为`hostname-slow.log`。

### 补充

- `min_examined_row_limit`

除了上述变量，控制慢查询日志的还有一个系统变量: `min_examined_row_limit`。
这个变量的意思是，查询扫描过的**最少记录数**。这个变量和查询执行时间，共同组成了判别一个查询是否是慢查询的条件。如果查询扫描过的记录数大于等于这个变量的值，并且查询执行时间超过`long_query_time`的值，那么，这个查询就被记录到慢查询日志中; 反之，则不被记录到慢查询日志中。

```sql
greatsql> SHOW VARIABLES LIKE 'min%';
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| min_examined_row_limit | 0     |
+------------------------+-------+
1 row in set (0.01 sec)
```

你也可以根据需要，通过修改 my.cnf 文件，来修改`min_examined_row_limit`的值。

---

除了记录普通的慢查询之外，GreatSQL 还提供了两个参数来让我们记录未使用索引的查询，它们分别是：`log-queries-not-using-indexes` 和 `log_throttle_queries_not_using_indexes`

- `log-queries-not-using-indexes`

系统变量`log-queries-not-using-indexes`作用是未使用索引的查询也被记录到慢查询日志中。

| Command-Line Format  | --log-queries-not-using-indexes[={OFF\|ON}] |
| :------------------- | ------------------------------------------- |
| System Variable      | log_queries_not_using_indexes               |
| Scope                | Global                                      |
| Dynamic              | Yes                                         |
| SET_VAR Hint Applies | No                                          |
| Type                 | Boolean                                     |
| Default Value        | OFF                                         |

- `log_throttle_queries_not_using_indexes`

可通过设置 `log_throttle_queries_not_using_indexes` 来限制每分钟写入慢日志中的不走索引的SQL语句个数，该参数默认为 0，表示不开启，也就是说不对写入SQL语句条数进行控制。

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

在生产环境下，如果没有使用索引，那么此类 SQL 语句会频繁地被记录到 Slow Log，从而导致 Slow Log 文件大小不断增加，我们可以通过调整此参数进行配置。

------

- `log_slow_extra`

如果启用 log_slow_extra 系统变量（从 GreatSQL 8.0.14 开始提供），服务器会在日志写入几个额外字段。若要记录`bytes_received` 与 `bytes_sent`这两个字段则需要开启

------

- `percona slow log`

在使用GreatSQL查看慢查询日志时，会有`Query_time`、`Lock_time`等信息，使查询内容更加丰富，更多的数据可以使得我们更好的排查错误。

通过一个简单的案例来展示,我们先把慢查询日志打开且设置时间阈值大于1秒就记录

```SQL
#开启慢查询日志
greatsql> SET GLOBAL slow_query_log='ON';
Query OK, 0 rows affected (0.00 sec)

#时间阈值超过1秒就记录
greatsql> SET GLOBAL long_query_time = 1;
Query OK, 0 rows affected (0.01 sec)

greatsql> SHOW VARIABLES LIKE '%long_query_time%';
+-----------------+----------+
| Variable_name   | Value    |
+-----------------+----------+
| long_query_time | 1.000000 |
+-----------------+----------+
1 row in set (0.00 sec)

#查看已经被记录的慢查询数量
greatsql> SHOW GLOBAL STATUS LIKE '%Slow_queries%';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| Slow_queries  | 3     |
+---------------+-------+
1 row in set (0.01 sec)
```

写一条SQL语句使得使用时间大于1秒

```SQL
greatsql> SELECT * FROM `student` WHERE id>1000 AND `name`='Yunxi';
+---------+-------+-------+------+---------+
| 9999715 |   707 | Yunxi |  863 |      71 |
.......省略
| 9999999 |   418 | Yunxi |  793 |     734 |
+---------+-------+-------+------+---------+
166949 rows in set (3.94 sec)

greatsql> SHOW GLOBAL STATUS LIKE '%Slow_queries%';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| Slow_queries  | 4     |
+---------------+-------+
1 row in set (0.00 sec)
```

可以看到此条SQL已经被记录，接下来我们去查看慢查询日志：

```BASH
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

1. 这个SQL的耗时3.985637秒。
2. 返回结果有165346行，总共需要扫描9900000行数据。如果扫描行数很多，但返回行数很少，说明该SQL效率很低，可能索引不当。
3. Read_* 等几个指标表示这个SQL读记录的方式，是否顺序读、随机读等。
4. Sort_* 等几个指标表示该SQL是否产生了排序，及其代价。如果有且代价较大，需要想办法优化。
5. tmp 等几个指标表示该SQL是否产生临时表，及其代价。如果有且代价较大，需要想办法优化。
6. Full_scan/Full_join表示是否产生了全表扫描或全表JOIN，如果有且SQL耗时较大，需要想办法优化。
7. InnoDB_IO_* 等几个指标表示InnoDB逻辑读相关数据。
8. InnoDB_rec_lock_wait 表示是否有行锁等待。
9. InnoDB_queue_wait 表示是否有排队等待。
10. InnoDB_pages_distinct 表示该SQL总共读取了多少个InnoDB page，是个非常重要的指标。

## 查看慢查询数目

查询当前系统中有多少条慢查询记录

```SQL
greatsql> SHOW GLOBAL STATUS LIKE '%Slow_queries%';
```

## 慢查询日志分析工具

在生产环境中，如果要手工分析日志，查找、分析SQL，显然是个体力活，GreatSQL提供了日志分析工具 `mysqldumpslow` ，或者是可以使用另一个工具`pt-query-digest`。
它可以从`logs`、`processlist`、和 `tcpdump` 来分析 GreatSQL 的状况，logs包括 `slow log`、`general log`、`binlog`。也可以把分析结果输出到文件中，或则把文件写到表中。分析过程是先对查询语句的条件进行参数化，然后对参数化以后的查询进行分组统计，统计出各查询的执行时间、次数、占比等，可以借助分析结果找出问题进行优化。

## 关闭慢查询日志

> 建议除了调优需要开，正常还是不要开了

GreatSQL服务器停止慢查询日志功能的方法：

- 方式1

```bash
[mysqld]
slow_query_log=OFF
```

- 方式2

```sql
greatsql> SET GLOBAL slow_query_log=off;
```

## 删除慢查询日志

```sql
greatsql> SHOW VARIABLES LIKE '%slow_query_log%';
+-----------------------------------+--------------------------------+
| Variable_name                     | Value                          |
+-----------------------------------+--------------------------------+
| slow_query_log                    | ON                             |
| slow_query_log_always_write_time  | 10.000000                      |
| slow_query_log_file               | /var/lib/mysql/slow.log        |
| slow_query_log_use_global_control |                                |
+-----------------------------------+--------------------------------+
4 rows in set (0.00 sec)
```

通过以上查询可以看到慢查询日志的目录，在该目录下**手动删除慢查询日志文件**即可。或使用命令 `mysqladmin` 来删除

`mysqladmin` 命令的语法如下：`mysqladmin -uroot -p flush-logs`执行该命令后，命令行会提示输入密码。输入正确密码后，将执行删除操作。新的慢查询日志会直接覆盖旧的查询日志，不需要再手动删除。

> **注意**
> 慢查询日志都是使用`mysqladmin flush-logs`命令来删除重建的。使用时一定要注意，一旦执行了这个命令，慢查询日志都只存在新的日志文件中，如果需要旧的查询日志，就必须事先备份。
>
> 如果 GreatSQL 日志文件被其他进程打开或被锁定，`flush-logs` 操作可能会失败


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
