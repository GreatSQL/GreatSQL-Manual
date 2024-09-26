# Percona Toolkit 监控类

::: tip 小贴士
`$`为命令提示符、`greatsql>`为GreatSQL数据库提示符。
:::

## 监控类

在Percona Toolkit中监控类共有以下工具

- `pt-deadlock-logger`：提取和记录MySQL/GreatSQL死锁
- `pt-fk-error-logger`：提取和记录外键信息
- `pt-mext`：并行查看status样本信息
- `pt-query-digest`：分析查询日志，并产生报告
- `pt-mongodb-summary`：收集有关 MongoDB 集群的信息
- `pt-pg-summary`：收集有关 PostgreSQL 集群的信息

## pt-deadlock-logger

### 概要

提取和记录 MySQL/GreatSQL 死锁

**用法**

```bash
- pt-deadlock-logger [OPTIONS] DSN
```

记录 MySQL/GreatSQL 死锁的信息。信息打印到 `STDOUT` ，也可以通过指定 `--dest` 保存到表中。除非指定 `--run-time` 或 `--iterations` ，否则该工具将永远运行

### 选项

该工具所有选项如下

| 参数                | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --charset           | 字符集                                                       |
| --clear-deadlocks  | 创建一个小的死锁。利用新产生的这个死锁刷新`Engine InnoDB Status`中的死锁信息，间接达到清除`Engine InnoDB Status`中大的死锁信息的结果，表名为`percona_schema.clear_deadlocks`这个表一定不能存在，脚本会自动创建表并在生成死锁后删除表，建表语句`CREATE TABLE percona_schema.clear_deadlocks (a INT PRIMARY KEY) ENGINE=InnoDB` |
| --columns           | 结果集字段                                                   |
| --config            | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --create-dest-table | 创建`--dest`指定的表                                         |
| --daemonize         | 后台运行                                                     |
| --database          | 连接到该数据库                                               |
| --defaults-file     | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --dest              | 用DSN的格式写存储死锁的位置，至少要指定库和表                |
| --help              | 显示帮助                                                     |
| --host              | 连接到主机                                                   |
| --interval          | 检查死锁的频率，如果未指定，将默认永远运行                   |
| --iterations        | 检查死锁的次数，默认情况下，如果没指定，则为无限次数，退出的时间由`--run-time`来限制 |
| --log               | 守护进程时将所有输出打印到此文件。                           |
| --numeric-ip        | 将 IP 地址表示为整数。                                       |
| --password          | 用于连接的密码                                               |
| --pid               | 创建给定的 PID 文件                                          |
| --port              | 用于连接的端口号                                             |
| --quiet             | 不要死锁，仅将错误和警告打印到STDERR                         |
| --run-time          | 退出前要跑多长时间。默认情况下永远运行，每 `--interval` 秒检查一次死锁。 |
| --set-vars          | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket            | 用于连接的套接字文件                                         |
| --tab               | 使用制表符而不是空格来分隔列                                 |
| --user              | 登录的用户                                                   |
| --version           | 显示版本                                                     |
| --[no]version-check | 版本检查                                                     |

### 最佳实践

如果想存储 pt-deadlock-logger 提取的有关死锁的所有信息，建议使用以下表结构：

```sql
-- 可以根据 --columns 的字段进行调整
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

- `server`：发生死锁的（源）服务器
- `ts`：上次检测到死锁的日期和时间
- `thread`：GreatSQL线程编号，和`SHOW FULL PROCESSLIST`中的ID一致
- `txn_id`：InnoDB事务ID
- `txn_time`：发生死锁时事务处于活动状态的时间
- `user`：连接的数据库用户名
- `hostname`：连接的主机
- `ip`：连接的 IP 地址。如果指定`--numeric-ip`，则将转换为无符号整数
- `db`：发生死锁的库
- `tbl`：发生死锁的表
- `idx`：发生死锁的索引
- `lock_type`：导致死锁的锁上持有的事务的类型
- `lock_mode`：导致死锁的锁的锁定模式
- `wait_hold`：事务是在等待锁还是持有锁
- `victim`：事务是否被选为死可回滚的事务并进行回滚
- `query`：导致死锁的查询

首先创建上方提供的`deadlocks`表，也可在命令中加入`--create-dest-table`自动创建表

```sql
greatsql> CREATE TABLE deadlocks 
-- ......中间省略
Query OK, 0 rows affected (0.06 sec)
```

将 host1 主机产生的死锁信息保存在 host2 主机 test_db 库下面的 deadlocks 表中

```bash
pt-deadlock-logger h=localhost,P=3306,u=root,p='' --dest h=localhost,P=3307,u=root,p='',D=test_db,t=deadlocks
```
::: tip 小贴士
因为没有指定`--run-time`所以该工具会一直在当前窗口运行，如果要转到后台运行可以使用`--daemonize`
:::

人为制造一个死锁

| session 1                                   | session 2                                                    |
| ------------------------------------------- | ------------------------------------------------------------ |
| START TRANSACTION;                          |                                                              |
| UPDATE t1 SET c2 = 'greatsql' WHERE id = 1; | START TRANSACTION;                                           |
|                                             | UPDATE t1 SET c2 = 'GreatSQL' WHERE id = 2;                  |
| UPDATE t1 SET c2 = 'greatsql' WHERE id = 2; |                                                              |
|                                             | UPDATE t1 SET c2 = 'GreatSQL' WHERE id = 1;                  |
|                                             | ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction |

查看`deadlocks`表

```bash
+-----------+---------------------+--------+--------+----------+------+-----------+----+---------+-----+---------+-----------+-----------+-----------+--------+--------------------------------------------+
| server    | ts                  | thread | txn_id | txn_time | user | hostname  | ip | db      | tbl | idx     | lock_type | lock_mode | wait_hold | victim | query                                      |
+-----------+---------------------+--------+--------+----------+------+-----------+----+---------+-----+---------+-----------+-----------+-----------+--------+--------------------------------------------+
| localhost | 2024-03-20 15:12:51 |   1216 |      0 |        8 | root | localhost |    | test_db | t1  | PRIMARY | RECORD    | X         | w         |      1 | UPDATE t1 SET c2 = 'GreatSQL' WHERE id = 1 |
| localhost | 2024-03-20 15:12:51 |   1230 |      0 |       11 | root | localhost |    | test_db | t1  | PRIMARY | RECORD    | X         | w         |      0 | UPDATE t1 SET c2 = 'greatsql' WHERE id = 2 |
+-----------+---------------------+--------+--------+----------+------+-----------+----+---------+-----+---------+-----------+-----------+-----------+--------+--------------------------------------------+
2 rows in set (0.00 sec)
```

`deadlocks`表中记录了锁的细节、类型、SQL语句，比起直接看`SHOW ENGINE INNODB STATUS`方便

## pt-fk-error-logger

### 概要

pt-fk-error-logger工具的作用和pt-deadlock-logger差不多，pt-fk-error-logger是记录MySQL/GreatSQL外键错误信息。

**用法**

```bash
pt-fk-error-logger [OPTIONS] [DSN]
```

记录有关给定 DSN 上的外键错误的信息。信息打印到 `STDOUT` ，也可以通过指定 `--dest` 保存到表中。除非指定 `--run-time` 或 `--iterations` ，否则该工具将永远运行。

### 选项

该工具所有选项如下

| 参数                | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --charset           | 字符集                                                       |
| --config            | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --daemonize         | 后台运行                                                     |
| --database          | 连接到该数据库                                               |
| --defaults-file     | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --dest              | 用DSN的格式写存储死锁的位置，至少要指定库和表                |
| --help              | 显示帮助                                                     |
| --host              | 连接到主机                                                   |
| --interval          | 检查死锁的频率，如果未指定，将默认永远运行                   |
| --iterations        | 检查死锁的次数，默认情况下，如果没指定，则为无限次数，退出的时间由`--run-time`来限制 |
| --log               | 守护进程时将所有输出打印到此文件。                           |
| --password          | 用于连接的密码                                               |
| --pid               | 创建给定的 PID 文件                                          |
| --port              | 用于连接的端口号                                             |
| --quiet             | 不要死锁，仅将错误和警告打印到STDERR                         |
| --run-time          | 退出前要跑多长时间。默认情况下永远运行，每 `--interval` 秒检查一次死锁。 |
| --set-vars          | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket            | 用于连接的套接字文件                                         |
| --user              | 登录的用户                                                   |
| --version           | 显示版本                                                     |
| --[no]version-check | 版本检查                                                     |

### 最佳实践

如果想存储 pt-fk-error-logger 可以提取的有关死锁的所有信息，建议使用以下表结构：

```sql
CREATE TABLE foreign_key_errors (
  ts datetime NOT NULL,
  error text NOT NULL,
  PRIMARY KEY (ts)
);
```

- `ts`：记录时间
- `error`：错误描述

将host1主机产生的违反外键约束信息保存在host2主机test_db库下面的foreign_key_errors表中

```bash
pt-fk-error-logger h=localhost,P=3306,u=root,p='',S=/data/GreatSQL01/mysql.sock --dest h=localhost,P=3307,u=root,p='',S=/data/GreatSQL02/mysql.sock,D=test_db,t=foreign_key_errors
```

人为创建违反索引约束

```sql
-- 建t_fk1表
CREATE TABLE `t_fk1` (  
  `id` int unsigned NOT NULL AUTO_INCREMENT,  
  `k` int unsigned NOT NULL DEFAULT '0',  
  `c` char(20) NOT NULL DEFAULT '',  
  `pad` char(20) NOT NULL DEFAULT '',  
  PRIMARY KEY (`id`),  
  KEY `k_2` (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 建t_fk2表
CREATE TABLE `t_fk2` (  
  `id1` int unsigned NOT NULL AUTO_INCREMENT,  
  `id2` int unsigned NOT NULL,  
  PRIMARY KEY (`id1`),  
  KEY `id2` (`id2`),  
  CONSTRAINT `t2_ibfk_1` FOREIGN KEY (`id2`) REFERENCES `t1` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

往t_fk1表插入数据

```sql
greatsql> INSERT INTO t_fk1 VALUES(1,1,'a','a');
greatsql> INSERT INTO t_fk1 VALUES(2,2,'b','b');
greatsql> INSERT INTO t_fk1 VALUES(3,3,'c','c');
```

往t_fk2表插入数据

```sql
greatsql> INSERT INTO t_fk2 VALUES(5,5);
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`test_db`.`t_fk2`, CONSTRAINT `t2_ibfk_1` FOREIGN KEY (`id2`) REFERENCES `t1` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE)
```

查看`foreign_key_errors`表

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

该表中很清晰的记录了在`t_fk2`表的`id2`字段中尝试插入值`5`，但是根据外键约束`t2_ibfk_1`，这个值必须在`t1`表的`id`字段中存在。

## pt-mext

### 概要

并排查看 MySQL/GreatSQL `SHOW GLOBAL STATUS` 的例子

**用法**

```bash
- pt-mext [OPTIONS] -- COMMAND
```

### 选项

该工具所有选项如下

| 参数       | 含义                 |
| ---------- | -------------------- |
| --help     | 显示帮助             |
| --relative | 从前一列中减去每一列 |
| --version  | 显示版本             |

### 最佳实践

```bash
$ pt-mext -r -- mysqladmin ext -i10 -c3

Aborted_clients                              84                    0
Aborted_connects                             18                    0
Acl_cache_items_count                         0                    0
Binlog_cache_disk_use                        15                    0
Binlog_cache_use                            118                    0
······下方省略
```

- `-i10`：采集间隔

- `-c5`：采集次数

- `-r`：相对的

上述命令中会有三次迭代，但只会输出第一次的结果，第二次和第一次相差的结果。意味着这会详细的列出每个变量在这一阶段的一个初始值(第一列)以及每两个采样点的差异值。

上面例子中`Aborted_clients`中的84是采样的初始值，后面的0是每两个采样点的差异值。

## pt-query-digest

### 概要

pt-query-digest 是用于分析 MySQL/GreatSQL 慢查询的一个工具，它可以分析Binlog、General log、Slowlog，也可以通过 `SHOWPROCESSLIST` 或者通过 `tcpdump` 抓取的 MySQL/GreatSQL 协议数据来进行分析。可以把分析结果输出到文件中，分析过程是先对查询语句的条件进行参数化，然后对参数化以后的查询进行分组统计，统计出各查询的执行时间、次数、占比等，可以借助分析结果找出问题进行优化。

**用法**

```bash
pt-query-digest [OPTIONS] [FILES] [DSN]
```

### 选项

该工具所有选项如下

| 参数                        | 含义                                                         |
| --------------------------- | ------------------------------------------------------------ |
| --ask-pass                  | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --attribute-aliases         | 属性列表别名等                                               |
| --attribute-value-limit     | 属性值的健全限制                                             |
| --charset                   | 字符集                                                       |
| --config                    | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --[no]continue-on-error     | 即使出现错误也继续解析                                       |
| --[no]create-history-table  | 如果 `--history` 表不存在，则创建                            |
| --[no]create-review-table   | 如果 `--review` 表不存在，则创建它                           |
| --daemonize                 | 后台运行                                                     |
| --database                  | 连接到该数据库                                               |
| --defaults-file             | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --embedded-attributes       | 两个Perl正则表达式模式，用于捕获查询中嵌入的伪属性           |
| --expected-range            | 当数量多于或少于预期时解释项目（默认值为5,10）               |
| --explain                   | 使用此 DSN 运行示例查询的 EXPLAIN 并打印结果                 |
| --filter                    | 丢弃此Perl代码未返回true的事件                               |
| --group-by                  | 按事件的哪个属性进行分组                                     |
| --help                      | 显示帮助                                                     |
| --history                   | 在给定表中保存每个查询类的指标                               |
| --host                      | 连接到主机                                                   |
| --ignore-attributes         | 不要聚合这些属性                                             |
| --inherit-attributes        | 如果缺少，则从具有这些属性的最后一个事件继承这些属性         |
| --interval                  | 检查的频率                                                   |
| --iterations                | 迭代收集和报告周期的次数。如果没指定，则为无限次数，退出的时间由`--run-time`来限制 |
| --limit                     | 限制输出结果百分比或数量，默认值是20，即输出最慢的20条语句   |
| --log                       | 守护进程时将所有输出打印到此文件                             |
| --max-hostname-length       | 将报告中的主机名删减至此长度                                 |
| --max-line-length           | 将行设置长度                                                 |
| --order-by                  | 按此属性和聚合函数对事件进行排序                             |
| --outliers                  | 按属性报告异常值                                             |
| --output                    | 如何格式化并打印查询分析结果                                 |
| --password                  | 用于连接的密码                                               |
| --pid                       | 创建给定的 PID 文件                                          |
| --port                      | 用于连接的端口号                                             |
| --preserve-embedded-numbers | 加密查询时保留数据库/表名称中的数字                          |
| --processlist               | 轮询此 DSN 的进程列表以进行查询，其间有 `--interval` 睡眠    |
| --progress                  | 将进度报告打印到 STDERR                                      |
| --read-timeout              | 等待来自输入的事件这么长时间； 0 永远等待                    |
| --[no]report                | 打印每个 `--group-by` 属性的查询分析报告                     |
| --report-all                | 报告所有查询，甚至是已经审核过的查询                         |
| --report-format             | 打印查询分析报告的这些部分(rusage,date,hostname,files,header,profile,query_report,prepared) |
| --report-histogram          | 绘制该属性值的分布图                                         |
| --resume                    | 将最后一个文件偏移量（如果有）写入给定的文件名               |
| --review                    | 保存查询类以供以后查看，并且不要报告已查看的类               |
| --run-time                  | 每个 `--iterations` 运行多长时间，默认永远执行               |
| --run-time-mode             | 设置 `--run-time` 值的作用对象                               |
| --sample                    | 过滤掉除每个查询的前 N 个出现之外的所有查询                  |
| --slave-user                | 设置用于连接从库的用户                                       |
| --slave-password            | 设置用于连接从库的密码                                       |
| --set-vars                  | 以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --show-all                  | 显示这些属性的所有值                                         |
| --since                     | 仅解析比该值更新的查询（解析自该日期以来的查询）             |
| --socket                    | 用于连接的套接字文件                                         |
| --timeline                  | 显示事件的时间表                                             |
| --type                      | 要解析的输入类型                                             |
| --until                     | 截止时间，配合since可以分析一段时间内的慢查询                |
| --user                      | 登陆的用户                                                   |
| --variations                | 报告这些属性值的变化数量                                     |
| --version                   | 显示版本                                                     |
| --[no]version-check         | 版本检查                                                     |
| --[no]vertical-format       | 垂直输出SQL结果                                              |
| --watch-server              | 在解析 tcpdump 时要监视哪个服务器 IP 地址和端口（如“10.0.0.1:3306”）（对于 `--type` tcpdump）；所有其他服务器都将被忽略 |

### 最佳实践

#### 直接分析慢查询日志

```bash
pt-query-digest ./slow.log
```

**第一部分**

```bash
-- 用户时间，系统时间，物理内存占用大小，虚拟内存占用大小
170ms user time, 0 system time, 29.88M rss, 38.17M vsz
-- 执行工具的时间
Current date: Thu Mar 21 10:13:18 2024
-- 主机名
Hostname: myarch
-- 被分析的文件名字
Files: ./slow.log
-- 语句总数量，唯一的语句数量，QPS，并发数
Overall: 119 total, 18 unique, 0.00 QPS, 0.00x concurrency _____________
-- 日志记录时间范围
Time range: 2024-03-08T09:52:08 to 2024-03-20T14:37:23
-- 属性              总计     最小     最大     平均     95%    标准   中位数
Attribute          total     min     max     avg     95%  stddev  median
============     ======= ======= ======= ======= ======= ======= =======
Exec time           122s   189us     44s      1s      1s      6s   384us
Lock time          489us       0   198us     4us     6us    17us     1us
Rows sent          1.10M       0 535.35k   9.44k   1.26k  68.78k   97.36
Rows examine      97.56M     102  35.09M 839.55k 961.27k   4.59M   97.36
Rows affecte           0       0       0       0       0       0       0
Bytes sent       285.10M      56 202.68M   2.40M   9.76M  18.45M   5.45k
Query size        15.50k      30     250  133.39  202.40   52.84  143.84
......下方省略
```

- unique：唯一查询数量，即对查询条件进行参数化以后，总共有多少个不同的查询
- 95%：把所有值从小到大排列，位置位于95%的那个数
- median：中位数，把所有值从小到大排列，位置位于中间那个数

::: tip 小贴士
如果没有命令hostname可能会导致报错`error: Can't exec "hostname"`此时下载`inetutils`即可
:::

**第二部分**

```bash
Profile
Rank Query ID                            Response time Calls R/Call  V/M   Item
==== =================================== ============= ===== ======= ====  ========
   1 0x4029831C8032DEE4724E42576E2C52A6  83.1656 68.2%     2 41.5828  0.37 SELECT tpch.lineitem
   2 0x6472467F1FD96D847221959F021B8110  22.8429 18.7%     1 22.8429  0.00 SELECT xxl_job_log
   3 0x34BC467D466B794E79C020BEF3BFFE95   6.3289  5.2%     7  0.9041  1.17 SELECT test_index
   4 0x14810CF629251E9A8950ED961EA04448   4.3492  3.6%     6  0.7249  0.06 SELECT test_db.xxl_job_log
```

这部分对查询进行参数化并分组，然后对各类查询的执行情况进行分析，结果按总执行时长，从大到小排序。

- Response：总响应时间
- time：该查询在本次分析中总的时间占比
- Calls：执行次数，即本次分析总共有多少条这种类型的查询语句
- R/Call：平均每次执行的响应时间
- V/M：响应时间Variance-to-mean的比率
- Item：查询对象

**第三部分**

此部分列出了第一个查询的详细统计结果，列出了执行次数、最大、最小、平均、95%、标准、中位数的统计

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

- Exec time：表示查询的执行时间
- Lock time：表示查询在等待锁的时间
- Rows sent：表示查询返回的行数
- Rows examined：表示查询扫描的行数
- Rows affected：表示查询影响的行数
- Bytes sent：表示查询发送的字节数
- Query size：表示查询的大小
- Query_time distribution：查询时间的分布，可以看到这个SQL查询执行时间都是10秒以上

- Tables：该SQL查询涉及的表
- EXPLAIN：查询的SQL语句

#### 分析指定时间内的查询

分析12小时内的查询

```bash
pt-query-digest --since=12h ./slow.log
```

分析指定时间段内的查询

```bash
pt-query-digest slow.log --since '2024-03-19 00:00:00' --until '2024-03-21 23:59:59'
```

#### 分析指含有查询语句的慢查询

```bash
pt-query-digest --filter '$event->{fingerprint} =~ m/^select/i' slow.log
```

#### 分析指定用户的查询

修改`m/^root/i'`中的root换成对应用户即可

```bash
pt-query-digest --filter '($event->{user} || "") =~ m/^root/i' slow.log
```

#### 分析其他日志

**分析binlog**

分析前要先解析

```bash
mysqlbinlog binlog.000023 > binlog.000023.sql
```

解析后在分析binlog
```bash
pt-query-digest  --type=binlog  binlog.000023.sql > binlog_analysis.log
```

**分析general log**

```bash
pt-query-digest  --type=genlog  general.log > general_analysis.log
```

#### 查询结果存储到表

把查询保存到 query_review表 或 query_review_history表，先来查看下 query_review表 结构

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

把查询保存到 query_review表，使用`--create-review-table`会自动创建

```bash
pt-query-digest --user=root,-password='' --review h=localhost,D=test_db,t=query_review --create-review-table slow.log
```

#### 分析tcpdump抓取的数据

先使用 `tcpdump` 抓取数据
```bash
tcpdump -s 65535 -x -nn -q -tttt -i any -c 1000 port 3306 > GreatSQL.tcp.txt
```
在分析tcpdump抓取的数据
```bash
pt-query-digest --type tcpdump GreatSQL.tcp.txt> tcp_analysis.log
```
::: tip 小贴士
如果没有tcpdump，请手动安装
:::

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)