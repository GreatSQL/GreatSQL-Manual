# Percona Toolkit 实用类

::: tip 小贴士
`$`为命令提示符、`greatsql>`为GreatSQL数据库提示符。
:::

## 实用类

在Percona Toolkit中实用类共有以下工具

- `pt-align`：将其它工具输出内容与列对齐
- `pt-archiver`：将表中的行存档到另一个表或文件中
- `pt-find`：查找表并执行命令
- `pt-fingerprint`：将查询转成密文
- `pt-kill`：Kill掉符合条件的SQL
- `pt-k8s-debug-collector`：从 k8s/OpenShift 集群收集调试数据（日志、资源状态等）
- `pt-secure-collect`：收集、清理、打包和加密数据

## pt-align

### 概要

通过读取行并将其分成单词的方式来执行列对齐。该工具首先计算每行包含的单词数量，并尝试确定是否有一个占主导地位的数字，将其假设为每行的单词数量。接下来，`pt-align`会排除所有不符合该数量的行，并将下一行视为第一个非标题行。根据每个单词是否看起来像数字，它会决定列的对齐方式。最后，工具会遍历数据集，确定每列的宽度，并将它们格式化打印出来。

`pt-align`工具对于调整 `vmstat` 或 `iostat` 的输出非常有帮助，使其更易于阅读。

**用法**

将其它工具的输出与列对齐，如果未指定 FILES（文件）则读取 STDIN（输入）

- pt-align [FILES]

---

如果打印以下输出（没有对齐）

```bash
DATABASE TABLE   ROWS
foo      bar      100
long_db_name table  1
another  long_name 500
```

可以使用 `pt-align` 将输出重新打印（有对齐）

```bash
DATABASE     TABLE     ROWS
foo          bar        100
long_db_name table        1
another      long_name  500
```

### 选项

该工具的命令行参数如下

| 参数      | 含义                 |
| --------- | -------------------- |
| --help    | 帮助，显示帮助并退出 |
| --version | 版本，显示版本并退出 |

### 最佳实践

#### 对齐vmstat

当查看 vmstat 时，有时会遇到列对齐不整齐的情况。此时，可以使用 `pt-align` 工具来解决这个问题

```bash
-- 未使用pt-align工具
$ vmstat
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0 205472 181304     60 948960    0    0     0     1    1    1  1  2 98  0  0

-- 使用pt-align工具
$ vmstat | pt-align
r b   swpd   free buff  cache si so bi bo in cs us sy id wa st
2 0 205472 181260   60 948992  0  0  0  1  1  1  1  2 98  0  0
```

#### 对齐iostat

当查看 iostat 时，有时会遇到列对齐不整齐的情况。此时，可以使用 `pt-align` 工具来解决这个问题

```bash
-- 未使用pt-align工具
$ iostat
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.86    0.00    1.51    0.00    0.00   97.62

Device:            tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               0.11         0.33         1.31    6746368   27046909
dm-0              0.09         0.30         1.23    6263958   25261569
dm-1              0.03         0.02         0.09     452072    1782864

-- 使用pt-align工具
$ iostat | pt-align
0.86    0.00 1.51      0.00      0.00    97.62   
Device: tps  kB_read/s kB_wrtn/s kB_read kB_wrtn 
sda     0.11 0.33      1.31      6746368 27049993
dm-0    0.09 0.30      1.23      6263958 25264653
dm-1    0.03 0.02      0.09      452072  1782864
```

## pt-archiver

将 MySQL/GreatSQL 表中的行存档到另一个表或文件中

### 概要

pt-archiver 是一款在线归档工具，不会影响生产，但是用此命令操作的表必须要有主键，它可以实现如下功能：

- 归档历史数据
- 在线删除大量数据
- 数据导出和备份
- 数据远程归档
- 数据清理

**用法**

- pt-archiver [OPTIONS] --source DSN --where WHERE

---

将表从oltp实例归档到olap的实例中

```bash
pt-archiver --source h=oltp_server,D=test,t=tbl --dest h=olap_server --file '/var/log/archive/%Y-%m-%d-%D.%t' --where "1=1" --limit 1000 --commit-each
```

从子表删除孤立行

```bash
pt-archiver --source h=host,D=db,t=child --purge --where 'NOT EXISTS(SELECT * FROM parent WHERE col=child.col)'
```

### 选项

- 至少指定 `--dest` 、 `--file` 或 `--purge` 之一

- 如果 COPY 为 yes， `--dest` 中的 DSN 值默认为 `--source` 中的值

部分参数选项存在互斥，不可同时存在，详见：

| 选项A                 | 选项B            | 关系 |
| --------------------- | ---------------- | ---- |
| --ignore              | --replace        | 互斥 |
| --txn-size            | --commit-each    | 互斥 |
| --low-priority-insert | --delayed-insert | 互斥 |
| --share-lock          | --for-update     | 互斥 |
| --analyze             | --optimize       | 互斥 |
| --no-ascend           | --no-delete      | 互斥 |

所有参数选项如下：

| 参数                      | 含义                                                         |
| ------------------------- | ------------------------------------------------------------ |
| --analyze                 | 为d则在dest上使用analyze，为s则在source上使用analyze，ds则表示两者都执行 |
| --ascend-first            | 仅升序第一个索引列                                           |
| --ask-pass                | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --buffer                  | 指定file时，仅在事务提交的时候刷新到磁盘                     |
| --bulk-delete             | 批量删除                                                     |
| --[no]bulk-delete-limit   | 是否开启批量删除限制，delete ... limit                       |
| --bulk-insert             | 通过LOAD DATA批量插入                                        |
| --channel                 | 指定复制通道                                                 |
| --charset                 | 字符集                                                       |
| --[no]check-charset       | 是否检查字符集，默认检查                                     |
| --[no]check-columns       | 检查列，确保 --source 和 --dest 具有相同的列                 |
| \--check-interval         | 定义归档每次暂停多长时间                                     |
| --check-slave-lag         | 暂停归档，直到此副本的滞后小于--max-lag                      |
| --columns                 | 归档指定的字段，逗号分隔                                     |
| --commit-each             | 提交每组获取和归档的行,与--limit配合使用                     |
| --config                  | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --database                | 连接到该数据库                                               |
| --delayed-insert          | 将 DELAYED 修饰符添加到 INSERT 或 REPLACE 语句，低优先级插入。<br />不过此参数在5.6版本弃用，8.0版本不支持，服务器识别但忽略DELAYED关键字 |
| --dest                    | 此项指定一个表。pt-archiver 将插入从 --source 归档的行。 它使用与 --source 相同的 key=val 参数格式。 大多数缺失值默认为与 --source 相同的值，因此您不必重复 --source 和 --dest 中相同的选项。 使用 --help 选项查看从 --source 复制了哪些值。 |
| --dry-run                 | 打印查询并退出而不执行任何操作                               |
| --file                    | 要存档到的文件，%D Database name；%t Table name，时间的格式化如例子中所描述，与--output-format结合使用可以指定输出的内容是dump(使用制表符作为分隔符)还是csv（使用逗号作为分隔符），与--header配合使用指定是否打印字段名字在第一行 |
| --for-update              | 指定加读锁还是写锁。将 FOR UPDATE 修饰符添加到 SELECT 语句。与--share-lock互斥。 |
| --header                  | 在--file顶部打印列标题                                       |
| --help                    | 显示帮助                                                     |
| --high-priority-select    | 将 HIGH_PRIORITY 修饰符添加到 SELECT 语句。只适用表级别存储引擎（MyISAM、MEMORY等） |
| --host                    | 连接到主机                                                   |
| --ignore                  | 忽略在执行INSERT时出现的可忽略错误。与--replace互斥          |
| --limit                   | 每个语句要获取和归档的行数。默认为一行                       |
| --local                   | 不要将 OPTIMIZE 或 ANALYZE 查询写入 binlog                   |
| --low-priority-delete     | 将 LOW_PRIORITY 修饰符添加到 DELETE 语句。此时会延迟执行该 DELETE 直到没有其他客户端从表中读取数据为止。只适用表级别存储引擎（MyISAM、MEMORY等） |
| --low-priority-insert     | 低优先级插入。只适用表级别存储引擎（MyISAM、MEMORY等）       |
| --max-flow-ctl            | 用于pxc集群的类max-lag参数                                   |
| --max-lag                 | 暂停校验和，直到所有副本的滞后小于此值                       |
| --no-ascend               | 不使用升序索引优化。和no-delete互斥                          |
| --no-delete               | 不删除数据。和no-ascend互斥                                  |
| --optimize                | 表示执行optimize,使用方式与analyze一致。和analyze互斥        |
| --output-format           | 与--file一起使用指定输出格式                                 |
| --password                | 连接时使用的密码                                             |
| --pid                     | 创建给定的 PID 文件。如果 PID 文件已存在且其中包含的 PID 与当前 PID 不同，则该工具将不会启动。但是，如果 PID 文件存在并且其中包含的 PID 不再运行，则该工具将使用当前 PID 覆盖 PID 文件。工具退出时，PID 文件会自动删除 |
| --plugin                  | 用作通用插件的 Perl 模块名称                                 |
| --port                    | 用于连接的端口号                                             |
| --primary-key-only        | 仅主键列。使用主键列指定--columns的快捷方式                  |
| --progress                | 指定多少行打印一次进度信息                                   |
| --purge                   | 只清除，不归档。最好配合 --primary-key-only 指定表的主键列。这将防止无缘无故地从服务器获取所有列。 |
| --quick-delete            | 给DELETE加quick修饰符。使用 QUICK 修饰符时，存储引擎不会合并索引叶子节点，从而提高删除操作的速度。只适用表级别存储引擎（MyISAM、MEMORY等） |
| --quiet                   | 不输出任何信息，包括statistics信息                           |
| --replace                 | 导致--dest中的 INSERT 被写入 REPLACE。与--ignore互斥         |
| --retries                 | 遇到超时或死锁的重试次数                                     |
| --run-time                | 指定运行时间，s=seconds, m=minutes, h=hours, d=days; 如果不指定用的是s |
| --[no]safe-auto-increment | 不要归档具有最大 AUTO_INCRMENT 的行                          |
| --sentinel                | 默认文件是/tmp/pt-archiver-sentinel，该文件存在则退出归档    |
| --slave-user              | 从库用户                                                     |
| --slave-password          | 从库密码                                                     |
| --set-vars                | 设置执行时的MySQL/GreatSQL参数                               |
| --share-lock              | 指定加读锁还是写锁。将 LOCK IN SHARE MODE 修饰符添加到 SELECT 语句。与--for-update互斥 |
| --skip-foreign-key-checks | 使用 SET FOREIGN_KEY_CHECKS=0 禁用外键检查                   |
| --sleep                   | 两次提取中间的休眠时间，默认不休眠                           |
| --sleep-coef              | 指定sleep时间为最后一次 SELECT 时间的多少倍                  |
| --socket                  | 用于连接的套接字文件                                         |
| --source                  | 对于制动归档的表，选项“i”用于指定索引，默认情况下使用主键。选项“a”和“b”可用于调整语句通过二进制日志的流向。使用“b”选项会禁用指定连接上的二进制日志记录。若选择“a”选项，则连接将使用指定的数据库，可通过此方式防止二进制日志事件在服务器上执行时使用 --replicate-ignore-db 选项。这两个选项提供了实现相同目标的不同方法，即将数据从主服务器归档，同时在从服务器上保留它。可以在主服务器上运行清理作业，并通过所选方式防止其在从服务器上执行。 |
| --statistics              | 收集和打印时间统计数据                                       |
| --stop                    | 通过创建sentine文件来停止归档                                |
| --txn-size                | 指定每次事务提交的行数。与commit-each互斥                    |
| --unstop                  | 删除sentine文件                                              |
| --user                    | 登录的用户                                                   |
| --version                 | 显示版本号                                                   |
| --[no]version-check       | 自动检查更新功能，默认是检查的                               |
| --where                   | 指定 WHERE 子句限制归档哪些行。如果不需要 WHERE 条件,可使用 WHERE 1=1 |
| --why-quit                | 打印退出原因                                                 |

### 最佳实践

创建一张archiver_test表，并生成1000条数据

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
::: tip 小贴士

在使用过程中可能会需要依赖例如：`Cannot connect to MySQL because the Perl DBD::mysql module is not installed or not found.`此时按提示安装相应依赖包即可
::: 

#### 归档到同一实例上的不同表

::: danger 特别提醒

此操作会删除源表的数据，若不删除源表数据请加上使用`--no-delete`
:::

```bash
pt-archiver --source h=localhost,P=3306,u=root,D=test_db,t=archiver_test --charset=utf8mb4  --ask-pass --dest h=localhost,P=3306,u=root,D=test_db,t=archiver_test2 --ask-pass --where "id<100" --limit 1000 --commit-each
-- 会让你输入密码（源端）和（目标端）密码
```

伪代码如下

```bash
pt-archiver --source h=源ip,P=源端口,u=用户,p=密码,D=库名,t=表名 --ask-pass --dest h=目标IP,P=端口,u=用户,p=密码,D=库名,t=表名 --ask-pass --where "id<100" --limit 1000 --commit-each
```
::: tip 小贴士
需要目标表已创建且字段一致，否则报错：`"Table 'test_db.archiver_test2' doesn't exist "`
字段不一致报错：`”The following columns exist in --dest but not --source: name2“`
:::

检查是否已经归档成功

```sql
greatsql> SELECT count(*) FROM archiver_test2;
+----------+
| count(*) |
+----------+
|       99 |
+----------+
1 row in set (0.00 sec)
```

因为`--dest`会从`--source`继承相同的值，所以上面也可改写成以下方式

```bash
pt-archiver --source h=localhost,P=3306,u=root,D=test_db,t=archiver_test --charset=utf8mb4  --ask-pass --dest t=archiver_test2 --where "id<100" --limit 1000 --commit-each
```

也可用Socket来进行登录，如果使用单机多实例部署GreatSQL的时候采用这种方法要尤其注意选择对应Socket

```bash
pt-archiver --source u=root,D=test_db,t=archiver_test -S /data/MySQL/GreatSQL.sock  --charset=utf8mb4 --dest t=archiver_test2  --where "id<100" --limit 1000 --commit-each
```

也可以通过 my.cnf 配置文件读取用户名和密码，但是在 my.cnf 文件中需要配置好用户名和密码

::: tip 小贴士
该方法虽然方便，但可能会造成密码泄露，存在安全风险不推荐使用。
::: 

```ini
$ vim /etc/my.cnf
[client]
user=your_user_name
pass=sectet
```
使用 -F 指定 my.cnf 文件
```bash
pt-archiver --source F=/etc/my.cnf,u=root,D=test_db,t=archiver_test --charset=utf8mb4 --dest t=archiver_test2  --where "id<100" --limit 1000 --commit-each
```

#### 归档时不写入Binlog

添加`b=true`指定归档操作不写入Binlog中

```bash
pt-archiver --source b=true,h=localhost,P=3306,u=root,D=test_db,t=archiver_test --charset=utf8mb4  --ask-pass --dest b=true,t=archiver_test3  --where "id<100" --limit 1000 --commit-each
```

#### 归档到文件

导出到外部文件，且不删除源端表的数据

```bash
pt-archiver --source h=localhost,D=test_db,t=archiver_test,u=root --where '1=1' --no-check-charset --no-delete --file="/data/bk/archiver_test.dat"
```
因文件没有utf8mb4编码，所以设置了`no-check-charset`不检查字符集

检查备份情况

```bash
$ tail -n 3 /data/bk/archiver_test.dat
997     Fukuda Akina    449     F       2022-02-15 05:54:27
998     Sara Nguyen     45      F       2018-07-08 13:35:45
999     Chan Ka Man     644     M       2012-02-08 18:18:14
```

## pt-find

### 概要

此工具可以查找符合条件的表，并做一些相应的操作。默认操作是打印数据库和表名称

**用法**

- pt-find [OPTIONS] [DATABASES]

### 选项

| 参数                | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --case-insensitive  | 指定所有正则表达式搜索不区分大小写                           |
| --charset           | 默认字符集                                                   |
| --config            | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --database          | 连接到该数据库                                               |
| --day-start         | 从今天开始而不是从当前时间开始测量时间                       |
| --defaults-file     | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --help              | 显示帮助                                                     |
| --host              | 连接到主机                                                   |
| --or                | 用 OR（而不是 AND）组合测试                                  |
| --password          | 连接时使用的密码                                             |
| --pid               | 创建给定的 PID 文件                                          |
| --port              | 用于连接的端口号                                             |
| --[no]quote         | 使用 MySQL/GreatSQL 的标准反引号字符引用 MySQL/GreatSQL 标识符名称 |
| --set-vars          | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket            | 用于连接的套接字文件                                         |
| --user              | 登录的用户                                                   |
| --version           | 显示版本                                                     |
| --[no]version-check | 版本检查                                                     |

### 最佳实践

#### 查找大于1G的表

```bash

$ pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --tablesize +1G
`tpch`.`customer`
`tpch`.`lineitem`
`tpch`.`orders`
`tpch`.`part`
`tpch`.`partsupp`
```

#### 查找修改过的表

```bash
-- 30分钟之内
$ pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --mmin -30
`mysql`.`gtid_executed`
`test_db`.`archiver_test`

-- 30分钟之前
$ pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --mmin +30
`aptest`.`sys_dept`
`aptest`.`sys_user`
```

::: tip 小贴士

此查找基于`INFORMATION_SCHEMA.TABLES`表中的`Update_time`列，如果`information_schema_stats_expiry`设置的更新时间过长，将导致`Update_time`列不会实时更新。因此，在这种情况下，将无法准确地检索在过去30分钟内发生修改的表。
:::

#### 查找无数据的表

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --empty
`db2`.`t1`
`db2`.`t2`
```

#### 查找表并修改存储引擎

查找1天内创建的 MyISAM 表
```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --ctime -1 --engine MyISAM
`test_db`.`myisam`
```

查找1天内的 MyISAM 表并修改为 InnoDB
```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --ctime -1 --engine MyISAM --exec "ALTER TABLE %D.%N ENGINE=InnoDB"
```

验证下是否修改成功，此时可以用到上述的`pt-align`工具使输出更加美观
```bash
mysql -e "SHOW TABLE STATUS FROM test_db" | pt-align | grep your_table_name
myisam InnoDB ......
```
查找1天前的InnoDB表
```bash
pt-find --socket=/data/GreatSQL/mysql.sock --user=root --port=3306 --ctime +1 --engine InnoDB
```
::: tip 小贴士
`InnoDB`和`MyISAM`两个存储引擎名字必须按照标准输入，否则将无法进行正确的查找
:::
#### 查找空表并删除

避免不必要的删除错误，先查找哪些是空表
```bash
pt-find --socket=/data/GreatSQL/mysql.sock --empty test_db
```

::: details 查看运行结果
```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --empty test_db
`test_db`.`archiver_test3`
```
::: 

查找test_db库中空表并删除

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --empty test_db --exec-plus "DROP TABLE %s"
```

验证是否删除成功

```sql
greatsql> SHOW TABLES IN test_db LIKE 'archiver_test3';
Empty set (0.00 sec)
```

#### 所有表数据和索引总大小排序

```bash
pt-find --socket=/data/GreatSQL/mysql.sock --printf "%T\t%D.%N\n" | sort -rn
```

::: details 查看运行结果
```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --printf "%T\t%D.%N\n" | sort -rn
7992197120      `tpch`.`orders`
7817084928      `tpch`.`lineitem`
......
```
:::

::: tip 小贴士
输出有些没对齐，可以使用pt-align工具对齐
```bash
$ pt-find --socket=/data/GreatSQL/mysql.sock --printf "%T\t%D.%N\n" | sort -rn | pt-align
7992197120 `tpch`.`orders`                                                            
7817084928 `tpch`.`lineitem`
```
:::

## pt-fingerprint

将查询转成密文

### 概要

此工具可以将SQL语句重新格式转换成另一种抽象形式，既所有具体值都以`?`代替。可以适用于数据脱敏的场景。

**用法**

- pt-fingerprint [OPTIONS] [FILES]

### 选项

| 参数                     | 含义                                                         |
| ------------------------ | ------------------------------------------------------------ |
| --config                 | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --help                   | 显示帮助并退出                                               |
| --match-embedded-numbers | 匹配单词中嵌入的数字并替换为单个值                           |
| --match-md5-checksums    | 匹配 MD5 校验和并替换为单个值                                |
| --query                  | 要转换为加密的查询                                           |
| --version                | 显示版本并退出                                               |

### 最佳实践

#### 替换单个语句

替换 `SELECT` 语句中的值
```bash
pt-fingerprint --query "select a, b, c from users where id = 5 and greatsql = 666"
```

::: details 查看运行结果
```bash
$ pt-fingerprint --query "select a, b, c from users where id = 5 and greatsql = 666"
select a, b, c from users where id = ? and greatsql = ?
```
:::

替换 `INSERT` 语句中的值
```bash
pt-fingerprint --query "INSERT INTO product(ID,NAME,PRICE) VALUES(1,'greatsql',666)"
```
::: details 查看运行结果
```bash
pt-fingerprint --query "INSERT INTO product(ID,NAME,PRICE) VALUES(1,'greatsql',666)"
insert into product(id,name,price) values(?+)
```
:::

如果SQL语句中字段名或表名有数字，也会被替换

```bash
$ pt-fingerprint --query "select a1, b2, c3 from users4 where id = 500 and greatsql = 8032"
select a?, ?, c? from users? where id = ? and greatsql = ?
```

若不想替换字段名或表名可加上`--match-embedded-numbers`

```bash
$ pt-fingerprint --match-embedded-numbers --query "select a1, b2, c3 from users4 where id = 5 and greatsql = 666"
select a1, b2, c3 from users4 where id = ? and greatsql = ?
```
::: tip 小贴士
`--match-md5-checksums`参数使用也是同理，避免MD5值被替换
:::

#### 替换文件中语句

创建文件`pt_fingerprint_test_sql.txt`

```ini
$ vim pt_fingerprint_test_sql.txt
select a from users where greatsql = 666;
select b from users where greatsql = 777;
select c from users where 
greatsql = 888;
```

替换文件中的所有SQL语句
```bash
pt-fingerprint pt_fingerprint_test_sql.txt
```
::: details 查看运行结果
```bash
$ pt-fingerprint pt_fingerprint_test_sql.txt
select a from users where greatsql = ?
select b from users where greatsql = ?
select c from users where greatsql = ?
```
:::

::: tip 小贴士
不管文件内格式如何，pt-fingerprint工具都会规范化空格等

当然也可以用作替换[Slow Query Log（慢查询日志）](../2-about-greatsql/4-2-greatsql-slow-log.md)的SQL内容
:::
## pt-kill

Kill掉符合条件的SQL

### 概要

pt-kill 工具可以 Kill 掉任何语句，特别出现大量的阻塞，死锁，或某个有问题的 SQL 导致 MySQL/GreatSQL 负载很高的情况。会默认过滤掉复制线程。

**用法**

- pt-kill [OPTIONS] [DSN]

### 选项

至少指定 `--kill` 、 `--kill-query` 、 `--print` 、 `--execute-command` 或 `--stop` 之一

部分参数选项存在互斥，不可同时存在，详见：

| 选项A           | 选项B            | 关系 |
| --------------- | ---------------- | ---- |
| --any-busy-time | --each-busy-time | 互斥 |
| --kill          | --kill-query     | 互斥 |
| --daemonize     | --test-matching  | 互斥 |

所有参数选项如下:

| 选项                 | 含义                                                         |
| -------------------- | ------------------------------------------------------------ |
| --ask-pass           | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --charset            | 默认字符集                                                   |
| --config             | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --create-log-table   | 如果--log-dsn表不存在，则创建                                |
| --daemonize          | 放在后台以守护进程的形式运行                                 |
| --database           | 用于连接的数据库                                             |
| --defaults-file      | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --filter             | 丢弃此 Perl 代码不返回 true 的事件                           |
| --group-by           | 将匹配应用于由此 SHOW PROCESSLIST 列分组的每一类查询         |
| --help               | 显示帮助并退出                                               |
| --host               | 连接到主机                                                   |
| --interval           | 检查要终止的查询的频率                                       |
| --log                | 守护进程时将所有输出打印到此文件                             |
| --log-dsn            | 将终止的每个查询存储在此 DSN 中                              |
| --json               | 将终止的查询打印为 JSON，必须与--print一起使用。             |
| --json-fields        | 使用--json时指定要包含在 JSON 输出中的附加键                 |
| --password           | 连接时使用的密码                                             |
| --pid                | 创建给定的 PID 文件                                          |
| --port               | 用于连接的端口号                                             |
| --query-id           | 打印刚刚被终止的查询的 ID                                    |
| --rds                | 表示相关实例位于 Amazon RDS 上                               |
| --run-time           | 退出前要运行多长时间                                         |
| --sentinel           | 如果该文件存在则退出                                         |
| --slave-user         | 设置用于连接从机的用户                                       |
| --slave-password     | 设置用于连接从机的密码                                       |
| --set-vars           | 在这个以逗号分隔的variable=value对列表中设置 MySQL/GreatSQL 变量 |
| --socket             | 用于连接的套接字文件                                         |
| --stop               | 使 pt-kill 创建 --sentinel 指定的哨兵文件并退出              |
| --[no]strip-comments | 从 PROCESSLIST 的 Info 列中的查询中删除 SQL 注释             |
| --user               | 登录的用户                                                   |
| --version            | 显示版本并退出                                               |
| --[no]version-check  | 版本检查                                                     |
| --victims            | 每个类中的哪些匹配查询将被终止                               |
| --wait-after-kill    | 杀死一个查询后等待，然后再寻找更多要杀死的查询               |
| --wait-before-kill   | 在终止查询之前等待                                           |

### 最佳实践

#### Kill查询指定时间的连接

每十秒钟记录一下用时超过三十秒的查询语句，并且将这些语句输出到`/data/pt_slow.log`文件中

```bash
pt-kill --user=root --ask-pass --match-info "select|SELECT" --match-command='Query' --busy-time 30 --victims all --interval 10 --daemonize --print --log=/data/pt_slow.log
```

- `--match-command`：匹配当前连接的命令，对应 SHOW PROCESSLIST 捕获的 Command 对应值（可选值：Query、Sleep、Binlog Dump、Connect、Delayed insert、Execute、Fetch、Init DB、Kill、Prepare、Processlist、Quit、Reset stmt、Table Dump）；

- `--match-info`：正则匹配正则运行的 SQL，区分大小写；

- `--interval`：多久运行一次。默认单位秒。默认值30秒

也可以加上`--kill`直接Kill掉符合条件的查询语句

```bash
pt-kill --user=root --ask-pass --match-info "select|SELECT" --match-command='Query' --busy-time 30 --victims all --interval 10 --daemonize --kill --log=/data/pt_slow.log
```

::: tip 小贴士
`--victims`默认是`oldest`只Kill最先发起，存在时间最长的查询。`all Kill`掉所有满足的线程。`all-but-oldest`只保留最长的不Kill其它都Kill掉
:::

#### Kill指定IP的会话

打印出指定IP的会话

```bash
pt-kill --user=root --ask-pass --match-db='test_db' --match-host "192.168.6.55" --busy-time 30 --victims all --interval 10 --daemonize --print --log=/data/pt_ip.log
```

Kill指定IP的会话

```bash
pt-kill --user=root --ask-pass --match-db='test_db' --match-host "192.168.6.55" --busy-time 30 --victims all --interval 10 --daemonize --kill --log=/data/pt_ip.log
```

#### Kill指定用户的会话

Kill指定用户的会话

```bash
pt-kill --user=root --ask-pass --match-db='test_db' --match-user "greatsql" --victims all --interval 10 --daemonize --kill --log=/data/pt_user.log
```

Kill指定用户大于10秒的空闲链接

```bash
pt-kill --user=root --ask-pass --match-db='db_name' --match-user "greatsql" --victims all --interval 10 --daemonize --kill --match-command='Sleep' --idle-time 10 --log=/data/pt_user.log
```
::: danger 特别提醒
pt-kill工具会挂在后台定时Kill符合条件的用户、语句。
若需要停止请使用`kill -9 $(ps -ef| grep pt-kill |grep -v grep |awk '{print $2}')`
:::

## pt-secure-collect

### 概要

pt-secure-collect用于收集、清理、打包和加密数据

**用法**

```bash
- pt-secure-collect [<flags>] <command> [<args> ...]
```
默认情况下，pt-secure-collect 将收集以下输出：

- pt-stalk
- pt-summary
- pt-mysql-summary

**采集命令**

- pt-secure-collect collect

**解密命令**

- pt-secure-collect decrypt

**加密命令**

- pt-secure-collect encrypt

**清理命令**

- pt-secure-collect sanitize

### 最佳实践

#### 收集GreatSQL信息

以非加密方式收集GreatSQL信息并且不删除临时文件
```bash
pt-secure-collect collect --mysql-user=root --mysql-password="" --mysql-port=3306 --mysql-host=localhost --bin-dir=/usr/bin --temp-dir=/data/data_collection --no-encrypt --no-remove-temp-files
```

::: details 查看运行结果
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

::: tip 小贴士
`--mysql-port`和`--mysql-host`虽有默认值但是还是需要指定，否则在调用运行其它工具时会报错
:::

可以从输出上看到，pt-secure-collect工具调用了`pt-stalk`、`pt-summary `、`pt-mysql-summary`这三款工具

进入`data_collection`文件夹即可看到所有的临时文件，以及一个`data_collection.tar.gz`压缩文件

```bash
$ ls /data/data_collection
2024_03_11_17_05_03-df              2024_03_11_17_05_03-opentables2            2024_03_11_17_05_33-diskstats       2024_03_11_17_05_33-processlist
2024_03_11_17_05_03-disk-space      2024_03_11_17_05_03-output                 2024_03_11_17_05_33-dmesg           data_collection.tar.gz   .......其余省略
```

#### 加密文件
```bash
pt-secure-collect encrypt /data/pt_secure_collect.txt --outfile=/data/pt_secure_collect.aes
```
::: details 查看运行结果
```bash
$ pt-secure-collect encrypt /data/pt_secure_collect.txt --outfile=/data/pt_secure_collect.aes
Encryption password:  -- 这里输入加密密码
Re type password:     -- 再次输入加密密码
INFO[2024-03-12 09:36:39] Encrypting file "/data/pt_secure_collect.txt" into "/data/pt_secure_collect.aes"  -- 加密成功
```
:::

加密成功后此时会生成一个后缀为`aes`的文件，直接查看会乱码

```bash
$ ls
pt_secure_collect.aes pt_secure_collect.txt

$ cat pt_secure_collect.aes
5�66~x�y��+�    ?i`��pESϡ>()�g�,�e�u -- 乱码
```

#### 解密文件
```bash
pt-secure-collect decrypt /data/pt_secure_collect.aes
```
::: details 查看运行结果
```bash
$ pt-secure-collect decrypt /data/pt_secure_collect.aes
Encryption password: -- 输入加密的密码
INFO[2024-03-12 09:41:35] Decrypting file "/data/pt_secure_collect.aes" into "pt_secure_collect" 
```
:::
查看解密后的文件
```ini
$ cat pt_secure_collect

111
aaa
select * from test where id =2;
```

假设输入错误密码，不会提示密码错误，而是输出乱码结果

```bash
$ pt-secure-collect decrypt /data/pt_secure_collect.aes
Encryption password:  -- 这里假设输入错误密码
INFO[2024-03-12 09:44:45] Decrypting file "/data/pt_secure_collect.aes" into "pt_secure_collect" 

$ cat pt_secure_collect
;       �}X����#z1�e��s�/��E���OeB�6��,��       �# 
```

#### 加密文件

这个功能和上面介绍的`pt-fingerprint`工具有点类似，都是使用`?`替换关键信息

先造一个文本

```ini
$ cat pt_secure_collect.txt

select * from test where id =2;
ip = 192.168.6.66
```

使用`sanitize`功能，会隐去关键信息和主机名

```bash
$ pt-secure-collect sanitize --input-file=/data/pt_secure_collect.txt --no-sanitize-queries
```
::: details 查看运行结果
```bash
$ pt-secure-collect sanitize --input-file=/data/pt_secure_collect.txt --no-sanitize-queries
select * from test where id =?;
ip = hostname
```
:::

::: tip 小贴士
如果不隐去主机可以使用`--no-sanitize-hostnames`
如果不隐去查询可以使用`--no-sanitize-queries`
:::


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)