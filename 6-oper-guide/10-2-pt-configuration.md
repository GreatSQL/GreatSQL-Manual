# Percona Toolkit 配置类

::: tip 小贴士
`$`为 Linux 命令提示符、`greatsql>`为 GreatSQL 数据库提示符。
:::

## 配置类

在 Percona Toolkit 中性能类共有以下工具：

- `pt-config-diff`：比较数据库配置文件和参数。
- `pt-mysql-summary`：对 MySQL/GreatSQL 配置和 status 进行汇总。
- `pt-variable-advisor`：分析参数，并提出建议。

## pt-config-diff

### 概要

比较 MySQL/GreatSQL 配置文件和服务器变量。

**用法**

```bash
pt-config-diff [OPTIONS] CONFIG CONFIG [CONFIG...]
```
### 选项

该工具所有选项如下：

| 参数                | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --charset           | 字符集                                                       |
| --config            | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --database          | 连接到该数据库                                               |
| --defaults-file     | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --help              | 显示帮助                                                     |
| --host              | 连接到主机                                                   |
| --[no]ignore-case   | 比较变量时不区分大小写                                       |
| --ignore-variables  | 忽略、不比较这些变量                                         |
| --password          | 用于连接的密码                                               |
| --pid               | 创建给定的 PID 文件                                          |
| --port              | 用于连接的端口号                                             |
| --[no]report        | 将 MySQL/GreatSQL 配置差异报告打印到 STDOUT                  |
| --report-width      | 将报告行截断为设定的字符                                     |
| --set-vars          | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket            | 用于连接的套接字文件                                         |
| --user              | 登录的用户                                                   |
| --version           | 显示版本                                                     |
| --[no]version-check | 版本检查                                                     |

### 最佳实践

首先创建两个配置文件(这里为了示范方便配置文件内容较少)，创建 `test_my_1.cnf`配置文件：

```ini
[client]
socket    = /data/GreatSQL/mysql.sock
[mysql]
loose-skip-binary-as-hex
no-auto-rehash
[mysqld]
user    = mysql
port    = 3306
server_id = 3306
innodb_buffer_pool_size = 16G
loose-group_replication_group_seeds = '172.16.16.10:33061,172.16.16.12:33061,172.16.16.12:33061'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
```
创建 `test_my_2.cnf` 配置文件：

```ini
[client]
socket    = /data/greatsql/greatsql.sock
[mysql]
loose-skip-binary-as-hex
no-auto-rehash
[mysqld]
user    = greatsql
port    = 3308
server_id = 3308
innodb_buffer_pool_size = 8G
loose-group_replication_group_seeds = '172.16.10:33081,172.16.10:33081,172.16.10:33081'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1"
```
::: tip 小贴士
在配置MGR时，需要集群中节点的 my.cnf 部分配置一致，可使用该工具进行比较。
::: 

#### 配置文件对比

不一致才输出，如果完全一致则不输出：

```bash
pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf
```

::: details 查看运行结果
```bash
$ pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf

6 config differences
Variable                  /data/test_my_1.cnf       /data/test_my_2.cnf
========================= ========================= =========================
innodb_buffer_pool_size   17179869184               8589934592
loose_group_replicatio... aaaaaaaa-aaaa-aaaa-aaa... aaaaaaaa-aaaa-aaaa-aaa...
loose_group_replicatio... 172.16.16.10:33061,172... 172.16.10:33081,172.16...
port                      3306                      3308
server_id                 3306                      3308
user                      mysql                     greatsql
```
:::

加上`--report-width 200`，可完整输出差异项：

```bash
pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf --report-width 200
```

::: details 查看运行结果
```bash
$ pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf --report-width 200

6 config differences
Variable                   /data/test_my_1.cnf                                      /data/test_my_2.cnf
========================== ======================================================== ===============================================
innodb_buffer_pool_size    17179869184                                              8589934592
loose_group_replication... aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1                     aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1
loose_group_replication... 172.16.16.10:33061,172.16.16.12:33061,172.16.16.12:33061 172.16.10:33081,172.16.10:33081,172.16.10:33081
port                       3306                                                     3308
server_id                  3306                                                     3308
user                       mysql                                                    greatsql
```
:::
#### 配置文件和系统变量对比

配置文件与本机 GreatSQL 系统变量对比，如果完全一致，则不输出：

```bash
pt-config-diff --report-width=200 /etc/my.cnf u=root,p=
```

::: details 查看运行结果
```bash
$ pt-config-diff --report-width=200 /etc/my.cnf u=root,p=

1 config difference
Variable                  /etc/my.cnf myarch
========================= =========== ================================
slow_query_log_file       slow.log    /data/GreatSQL/myarch.log.000001
```
:::


#### 系统变量之间的对比

两台不同的数据库实例之间的系统变量对比：

```bash
pt-config-diff --report-width=200 h=192.168.6.55,P=3306,u=GreatSQL,p=  h=192.168.6.129,P=3306,u=test,p='test'
```

::: details 查看运行结果
```bash
$ pt-config-diff --report-width=200 h=192.168.6.55,P=3306,u=GreatSQL,p=  h=192.168.6.129,P=3306,u=test,p='test'

104 config differences
Variable                   myarch                                                               hy
========================== ==================================================================== ====================================================================
admin_tls_version          TLSv1.2,TLSv1.3                                                      TLSv1.2
back_log                   1024                                                                 151
basedir                    /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/                /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64/
binlog_cache_size          4194304                                                              32768
binlog_expire_logs_seconds 604800                                                               2592000
binlog_rows_query_log_e... ON                                                                   OFF
......下方省略部分内容
```
:::

## pt-mysql-summary

### 概要

打印出来 MySQL/GreatSQL 的描述信息，包括：版本信息，数据目录，命令的统计，用户，数据库以及复制等信息还包括各个变量（status、variables）信息和各个变量的比例信息，还有配置文件等信息。

**用法**

```bash
pt-mysql-summary [OPTIONS]
```

### 选项

该工具所有选项如下

| 参数                    | 含义                                                         |
| ----------------------- | ------------------------------------------------------------ |
| --all-databases         | mysqldump 并汇总所有数据库                                   |
| --ask-pass              | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --config                | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --databases             | mysqldump 并总结这个以逗号分隔的数据库列表。如果要转储和汇总所有数据库，请指定 `--all-databases` |
| --defaults-file         | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --help                  | 显示帮助                                                     |
| --host                  | 要连接的主机                                                 |
| --list-encrypted-tables | 包括所有数据库中加密表的列表。这可能会导致速度变慢，因为查询信息模式表可能会很慢。 |
| --password              | 连接时使用的密码                                             |
| --port                  | 用于连接的端口号                                             |
| --read-samples          | 从此目录中找到的文件创建报告                                 |
| --save-samples          | 将用于生成摘要的数据文件保存在此目录中                       |
| --sleep                 | 收集状态计数器时休眠的秒数                                   |
| --socket                | 用于连接的套接字文件                                         |
| --user                  | 登录的用户                                                   |
| --version               | 显示版本                                                     |

### 最佳实践

```bash
pt-mysql-summary --user=root --password=greatsql --host=localhost --port=3306
```
::: tip 小贴士
此时会输出所有关于 GreatSQL 的信息，但是要注意很多输出都是做了四舍五入，并不是精确的数据。
不建议此工具远程连接其它数据库，因为可能导致输出数据混乱。
:::

接下来将此工具输出结果分成各个模块介绍：

```bash
# Percona Toolkit MySQL Summary Report #######################
              System time | 2024-03-14 08:19:45 UTC (local TZ: CST +0800)
# Instances ##################################################
  Port  Data Directory             Nice OOM Socket
  ===== ========================== ==== === ======
# MySQL Executable ###########################################
       Path to executable | /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld
              Has symbols | Yes
# Slave Hosts ################################################
No slaves found
```

以上四个部分显示报告是在哪台服务器上生成的以及该服务器上正在运行哪些 GreatSQL 实例，这是从 `ps` 的输出中检测到的，并不总是检测所有实例和参数。

```bash
# Report On Port 3306 ########################################
                     User | root@localhost
                     Time | 2024-03-14 16:19:45 (+08:00)
                 Hostname | myarch
                  Version | 8.0.32-25 GreatSQL, Release 25, Revision 79f57097e3f
                 Built On | Linux x86_64
                  Started | 2024-03-08 09:50 (up 6+06:29:24)
                Databases | 9
                  Datadir | /data/GreatSQL/
                Processes | 2 connected, 2 running
              Replication | Is not a slave, has 0 slaves connected
                  Pidfile | mysql.pid (does not exist)
```

以上是 GreatSQL 实例的快速摘要：版本、正常运行时间和其他非常基本的参数。时间输出是从 GreatSQL 服务器生成的，可能与之前打印的系统日期和时间不同，如果不同的话可以检查下数据库和操作系统的时间是否匹配。

```bash
# Processlist ################################################

  Command                        COUNT(*) Working SUM(Time) MAX(Time)
  ------------------------------ -------- ------- --------- ---------
  Daemon                                1       1    500000    500000
  Query                                 1       1         0         0
  Sleep                                 1       0       450       450
......中间省略
  State                          COUNT(*) Working SUM(Time) MAX(Time)
  ------------------------------ -------- ------- --------- ---------
                                        1       0         0         0
  init                                  1       1         0         0
  Waiting on empty queue                1       1    500000    500000
```

以上是 `SHOW PROCESSLIST` 输出的摘要，这里的数字会四舍五入，不是最精确的。

```bash
# Status Counters (Wait 10 Seconds) ##########################
Variable                                Per day  Per second     10 secs
Aborted_clients                              10                        
Aborted_connects                              2                        
Binlog_snapshot_position                    100                        
.......中间省略
Table_open_cache_overflows                   30                        
Threadpool_idle_threads                       2                        
Threadpool_threads                            2                        
Threads_created                              25                        
Uptime                                    90000           1           1
```

以上是从 `SHOW GLOBAL STATUS` 的两个快照中选择的计数器，这些快照间隔大约 10 秒收集并进行模糊舍入。

- 第一列是变量名称。

- 第二列是第一个快照的计数器除以 86400（一天的秒数），因此您可以看到计数器每天的变化幅度。 86400 次模糊轮换到 90000，因此正常运行时间计数器应始终约为 90000。

- 第三列是第一个快照的值，除以正常运行时间，然后进行模糊舍入，因此它大致表示计数器在服务器正常运行时间内每秒增长的速度。

- 第四列是第一个和第二个快照的增量差异，除以正常运行时间的差异，然后进行模糊舍入。因此，它显示了生成报告时计数器每秒增长的速度。

```bash
# Table cache ################################################
                     Size | 1024
                    Usage | 70%
```

以上显示表缓存的大小，后面是表缓存的使用百分比。

```bash
# Key Percona Server features ################################
      Table & Index Stats | Disabled
     Multiple I/O Threads | Enabled
     Corruption Resilient | Enabled
      Durable Replication | Not Supported
     Import InnoDB Tables | Not Supported
     Fast Server Restarts | Not Supported
         Enhanced Logging | Disabled
     Replica Perf Logging | Enabled
      Response Time Hist. | Not Supported
          Smooth Flushing | Not Supported
      HandlerSocket NoSQL | Not Supported
           Fast Hash UDFs | Unknown
```

以上显示 Percona Server 中可用的特性和启用情况。

```bash
# Plugins ####################################################
       InnoDB compression | ACTIVE
```

以上显示特定插件以及它们是否已启用。

::: tip 小贴士
该工具只检测少数几个Plugin，并不是所有的插件都检测。
:::

```bash
# Schema #####################################################
Specify --databases or --all-databases to dump and summarize schemas
# 如果没指定--databases or --all-databases 则不会打印

# Schema #####################################################
  Database  Tables Views SPs Trigs Funcs   FKs Partn
  mysql         38                                  
  aptest         7                                  
  db2            1                                  
  sys_audit      1                                  
  test_db       11                                  
  tpch           8                                  

  Database  InnoDB CSV
  aptest         7    
  db2            1    
  mysql          2   2
  sys_audit      1    
  test_db       11    
  tpch           8    

  Database  BTREE
  aptest        7
  db2           1
  mysql        45
  sys_audit     1
  test_db      19
  tpch         17
  
-- 下方部分输出为了紧凑显示，作者将这些列标题设置为垂直输出
-- 需要您从顶部向下阅读，第一列是 char ，第二列是 timestamp
              c   t   s   i   t   e   v   f   t   b   s   j   b   m   m   t   d   d   d   d
              h   i   e   n   e   n   a   l   i   i   m   s   l   e   e   i   a   o   a   e
              a   m   t   t   x   u   r   o   n   g   a   o   o   d   d   m   t   u   t   c
              r   e           t   m   c   a   y   i   l   n   b   i   i   e   e   b   e   i
                  s                   h   t   i   n   l           u   u       t   l       m
                  t                   a       n   t   i           m   m       i   e       a
                  a                   r       t       n           t   b       m           l
                  m                                   t           e   l       e            
                  p                                               x   o                    
                                                                  t   b                    
  Database  === === === === === === === === === === === === === === === === === === === ===
  aptest     23           1          58          19                           9   3   2    
  db2                     1                       1                                        
  mysql      64  10   4  46  31  61  25   5  15  23   6   2   4   2   2   2                
  sys_audit                          11                           1                        
  test_db     3   2      33   2      29       4   3   1                       7   2       5
  tpch       16          19          13                                               4   9
```

如果您指定 `--databases` 或 `--all-databases` ，该工具将打印以上部分。

以上显示了数据库中对象的数量和类型，它是通过运行 `mysqldump --no-data` 生成的，而不是通过查询`INFORMATION_SCHEMA`生成。

本节中的第一个子报告是每个数据库中按类型划分的对象计数：表、视图等。第二个显示每个数据库中有多少表使用不同的存储引擎。第三个子报告显示每个数据库中每种类型索引的数量。

最后一部分显示每个数据库中各种数据类型的列数。为了紧凑显示，列标题的格式是垂直的，因此您需要从顶部向下阅读。在此示例中，第一列是 `char` ，第二列是 `timestamp`。

::: tip 小贴士
这部分输出的数字都是精确的，不是四舍五入的。
:::

```bash
# Noteworthy Technologies ####################################
                      SSL | No
     Explicit LOCK TABLES | No
           Delayed Insert | No
          XA Transactions | No
              NDB Cluster | No
      Prepared Statements | No
 Prepared statement count | 0
```

以上显示该服务器上使用的一些特定技术。

```bash
# InnoDB #####################################################
                  Version | 8.0.32-8.0.32
         Buffer Pool Size | 2.0G
         Buffer Pool Fill | 70%
        Buffer Pool Dirty | 0%
......中间省略
      Pending I/O Flushes | 7 buf pool, 0 log
       Transaction States | 3xnot started
```

以上显示InnoDB 存储引擎的重要配置变量。缓冲池填充百分比和脏百分比是模糊舍入的。最后几行来自 `SHOW INNODB STATUS` 的输出。

```bash
# MyISAM #####################################################
                Key Cache | 32.0M
                 Pct Used | 20%
                Unflushed | 0%
```

以上显示 MyISAM 键缓存的大小，后面是正在使用的缓存百分比和未刷新百分比（四舍五入）。

```bash
# Security ###################################################
                    Users | 2 users, 0 anon, 0 w/o pw, 2 old pw
            Old Passwords | 
```

以上显示根据对 GreatSQL 系统数据库中的表的查询生成的。它显示了存在多少用户，以及各种潜在的安全风险，例如旧式密码和无密码的用户。

```bash
# Binary Logging #############################################
                  Binlogs | 8
               Zero-Sized | 0
               Total Size | 10.6G
            binlog_format | ROW
         expire_logs_days | 0
              sync_binlog | 1
                server_id | 3306
             binlog_do_db | 
         binlog_ignore_db | 
```

以上显示二进制日志的配置和状态。如果存在大小为0的二进制日志，则可能是二进制日志索引与磁盘上实际存在的二进制日志不同步。

```bash
# Noteworthy Variables #######################################
     Auto-Inc Incr/Offset | 1/1
   default_storage_engine | InnoDB
               flush_time | 0
             init_connect | 
                init_file | 
                 sql_mode | 
                ......中间省略
log_queries_not_using_indexes | ON
        log_slave_updates | ON
```

以上显示几个值得注意的服务器配置变量，在使用该服务器时了解这些变量可能很重要。

```bash
# Configuration File #########################################
              Config File | /etc/my.cnf
```

最后部分显示 my.cnf 文件的精美打印版本，其中删除了注释并添加了空格以对齐内容以便于阅读。

## pt-variable-advisor

### 概要

这是一款分析参数，并且给出参数设置建议的工具。

**用法**

```bash
pt-variable-advisor [OPTIONS] [DSN]
```

### 选项

该工具所有选项如下

| 参数                  | 含义                                                         |
| --------------------- | ------------------------------------------------------------ |
| --ask-pass            | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --charset             | 字符集                                                       |
| --config              | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --daemonize           | 后台运行                                                     |
| --database            | 连接到该数据库                                               |
| --defaults-file       | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --help                | 显示帮助                                                     |
| --host                | 要连接的主机                                                 |
| --ignore-rules        | 忽略这些规则 ID                                              |
| --password            | 连接时使用的密码                                             |
| --pid                 | 创建给定的 PID 文件                                          |
| --port                | 连接时使用的端口号                                           |
| --set-vars            | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket              | 用于连接的套接字文件                                         |
| --source-of-variables | 从此源读取 `SHOW VARIABLES`                                  |
| --user                | 登录的用户                                                   |
| --verbose             | 增加输出的详细程度                                           |
| --version             | 显示版本                                                     |
| --[no]version-check   | 版本检查                                                     |

### 最佳实践

分析本地 GreatSQL 数据库参数的一些建议：

```bash
pt-variable-advisor localhost
```

::: details 查看运行结果
```bash
$ pt-variable-advisor localhost

# WARN delay_key_write: MyISAM index blocks are never flushed until necessary.

# WARN innodb_log_buffer_size: The InnoDB log buffer size generally should not be set larger than 16MB.

# NOTE read_buffer_size-1: The read_buffer_size variable should generally be left at its default unless an expert determines it is necessary to change it.

# NOTE read_rnd_buffer_size-1: The read_rnd_buffer_size variable should generally be left at its default unless an expert determines it is necessary to change it.

# NOTE sort_buffer_size-1: The sort_buffer_size variable should generally be left at its default unless an expert determines it is necessary to change it.

# WARN expire_logs_days: Binary logs are enabled, but automatic purging is not enabled.

# NOTE innodb_data_file_path: Auto-extending InnoDB files can consume a lot of disk space that is very difficult to reclaim later.

# WARN myisam_recover_options: myisam_recover_options should be set to some value such as BACKUP,FORCE to ensure that table corruption is noticed.
```
:::

当然也可以把 `SHOW VARIABLES` 输出的结果保存在 `pt_va.txt` 文件中，然后再用工具分析：

```bash
pt-variable-advisor localhost --source-of-variables pt_va.txt
```
::: tip 小贴士
除了非常明显的错误，否则这个建议没有太多的意义。

这里也推荐一个网页版的[MySQL/GreatSQL状态诊断工具](https://imysql.com/my-state-diag.html)。
:::

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)