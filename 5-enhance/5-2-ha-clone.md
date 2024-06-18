# Clone 备份

从 GreatSQL 8.0.32-26 起支持基于 Clone 的在线全量热备和增量备份，以及压缩备份。

关于 Clone 的基础使用方法参考文档：[Clone 备份恢复](../6-oper-guide/4-5-clone.md)，本文假定已经安装配置好 GreatSQL 数据库实例，以及前置的授权等工作都已做好。

## 数据备份

### 全量备份

1. 备份远程实例

连接到 donor 节点上，执行下面的命令安装 mysqlbackup 组件：

```sql
greatsql> INSTALL COMPONENT "file://component_mysqlbackup";
```

再连接到 recipient 节点上，执行下面的命令进行在线全量热备：

```sql
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023' DATA DIRECTORY = '/data/backup/clone-full/20240610' ENABLE PAGE TRACK;
```

上述命令的作用是对远程实例 172.16.16.10:3306 执行在线全量热备，备份数据保存到本地目录 /data/backup/clone-full/20240610 中，同时启用 InnoDB page tracking 用于后续的增量备份（如果只需要一次性全量备份，则不需要启用 InnoDB page tracking，即不需要加上 `ENABLE PAGE TRACK` 子句）。

加上 `ENABLE PAGE TRACK` 子句后，在全量备份任务结束时会记录本次备份结束时的 LSN（END_LSN），将它作为下次增备任务的 LSN 起始点（PAGE_TRACK_LSN）。在每次备份任务结束后，都可以通过查询元数据表 `mysql.clone_history` 查看确认备份任务的状态，获取备份任务的位置点信息：

```sql
greatsql> SELECT * FROM mysql.clone_history\G
*************************** 1. row ***************************
             ID: 1
            PID: 8
     CLONE_TYPE: full clone
          STATE: Completed
     BEGIN_TIME: 2024-06-10 15:05:41.288
       END_TIME: 2024-06-10 15:06:01.537
         SOURCE: LOCAL INSTANCE
    DESTINATION: /data/backup/clone-full/20240610
       ERROR_NO: 0
  ERROR_MESSAGE: 
    BINLOG_FILE: 
BINLOG_POSITION: 0
  GTID_EXECUTED: 
      START_LSN: 0
 PAGE_TRACK_LSN: 21083116
        END_LSN: 21083759
1 rows in set (0.01 sec)

```

其中
- START_LSN，表示本次备份任务开始时的 LSN，如果是全量备份任务，则值为 0。
- PAGE_TRACK_LSN，表示本次备份任务结束时的 LSN，将它作为后续增量备份任务的起始点 LSN。
- END_LSN，表示本次备份任务结束时的 LSN。


2. 备份本地实例

如果只需要对本地实例进行全量备份，执行类似下面的命令即可：

```sql
greatsql> INSTALL COMPONENT "file://component_mysqlbackup";
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-full/20240610' ENABLE PAGE TRACK;
```
同样地，如果不需要增量备份，则不要加上 `ENABLE PAGE TRACK` 子句。

### 增量备份

增量备份是在上一次全量或增量备份的基础上，再次备份到当前为止，对数据库所有修改变化的新数据。因此，在执行 Clone 增量备份时，需要在备份命令中体现上一次备份结束时产生的 PAGE_TRACK_LSN，它是上一次全量/增量备份结束时记录 LSN。所有大于该 LSN 的修改变化数据，都在本次增量备份任务的备份范围内。

1. 对远程实例执行增量备份

连接到 recipient 节点上，执行下面的命令执行增量备份：

```sql
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023' DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116' ENABLE PAGE TRACK START_LSN = 21083116;
```

上述命令的作用是对远程实例 172.16.16.10:3306 执行增量备份，增备的起始点 LSN = 21083116，增备文件存放在 /data/backup/clone-incr/20240610-21083116 中。

除了指定起始 LSN 方式外，还可以指定基于本地备份目录执行增量备份：

```sql
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023' DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116' ENABLE PAGE INCREMENT BASED DIRECTORY = '/data/backup/clone-full/20240610';
```
上述命令指定本次增备任务是在已有的别分目录 /data/backup/clone-full/20240610 基础上，自动识别起始 LSN 后执行增备，这个方法的好处是避免手误写错 START_LSN 值。

2. 对本地实例执行增量备份

执行下面的命令，完成针对本地实例的增量备份：

```sql
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116' ENABLE PAGE TRACK START_LSN = 21083116;
```

同样地，也可以指定基于本地备份目录执行增备：

```sql
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116' ENABLE PAGE TRACK INCREMENT BASED DIRECTORY = '/data/backup/clone-full/20240610' 
```

### 压缩备份

## 数据恢复

### 查看备份任务

在开始进行数据恢复之前，先查询所有历史备份任务，确认可以恢复的备份集资源：

```sql
greatsql> SELECT * FROM mysql.clone_history\G
*************************** 1. row ***************************
             ID: 3
            PID: 11
     CLONE_TYPE: full clone
          STATE: Completed
     BEGIN_TIME: 2024-06-18 10:39:28.214
       END_TIME: 2024-06-18 10:39:42.980
         SOURCE: LOCAL INSTANCE
    DESTINATION: /data/backup/clone-full/20240618/
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE:
BINLOG_POSITION: 0
  GTID_EXECUTED:
      START_LSN: 0
 PAGE_TRACK_LSN: 21635197273
        END_LSN: 21635237128
*************************** 2. row ***************************
             ID: 4
            PID: 11
     CLONE_TYPE: increment clone
          STATE: Completed
     BEGIN_TIME: 2024-06-18 10:41:47.074
       END_TIME: 2024-06-18 10:41:48.006
         SOURCE: LOCAL INSTANCE
    DESTINATION: /data/backup/clone-incr/20240618-202406181041/
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE:
BINLOG_POSITION: 0
  GTID_EXECUTED:
      START_LSN: 21635197273
 PAGE_TRACK_LSN: 21635197273
        END_LSN: 21635283915
*************************** 3. row ***************************
             ID: 5
            PID: 20
     CLONE_TYPE: increment clone
          STATE: Completed
     BEGIN_TIME: 2024-06-18 13:49:36.436
       END_TIME: 2024-06-18 13:49:37.227
         SOURCE: LOCAL INSTANCE
    DESTINATION: /data/backup/clone-incr/20240618-202406181350/
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE:
BINLOG_POSITION: 0
  GTID_EXECUTED:
      START_LSN: 21635197273
 PAGE_TRACK_LSN: 21635197273
        END_LSN: 21635331027
```

### 确定备份链路

如上面查询结果所示
- 根据 `CLONE_TYPE` 字段可以看出，三次备份任务中：ID = 3 的任务为全量备份；ID = 4 和 5 的两次均为增量备份；
- 根据 `SOURCE` 字段可以看出，这三次都是备份本地实例；
- 根据 `DESTINATION` 字段可以看出，这三次备份任务存储的数据目录；
- 根据上述三个备份任务的 `START_LSN`、`PAGE_TRACK_LSN` 和 `END_LSN` 关系可以得出关于这三次备份任务的结论：备份链路关系为 ID:3 ==> ID:4 ==>ID:5；
- 也就是说，先是对当前实例执行了全量备份（ID = 3）；然后基于全量备份做第一次增量备份（ID = 4）；最后又基于第一次增量备份做第二次增量备份（ID = 5）。

### 数据（全量、增量）恢复

确定备份链路后，就可以选择恢复策略了，是要执行全量恢复还是全量+增量恢复，恢复过程步骤如下所示：

1. 如果只想要恢复全量备份数据，那么直接在 ID = 3 的那次备份文件集基础上启动 GreatSQL 服务即可；
2. 如果还想要恢复后续的增量备份，那么需要在以 ID = 3 的那次备份文件集基础上启动 GreatSQL 服务时，再将选项 `--clone_incremental_dir` 指向第一次增量备份（ID = 4）目录；
3. 待到实例启动后，第一次增量备份（ID = 4）恢复完成；
4. 如果还想继续恢复第二次增量备份（ID = 5），则需要在步骤 3 的基础上，重启实例，重启前，再次将选项 `--clone_incremental_dir` 指向第二次增量备份（ID = 5）目录，这样就可以完成所有全备+增备数据恢复。

在 GreatSQL 启动时，加上选项 `--clone_incremental_dir` 的作用是将增量备份数据应用到 datadir 中，在应用完全部增量备份数据后，GreatSQL 服务进程就会自动退出，而不是进入启动阶段。

一次完整的数据恢复过程如下方的演示。

#### 先准备好数据恢复的工作目录。

**提醒**：恢复过程会修改全量备份的数据，如果中途出错，则数据文件可能会被破坏，因此每次恢复操作之前务必要先做好备份。

再次提醒，为了避免误操作、误删数据等原因，**严禁在原来的数据备份目录上直接操作，而是将备份文件复制到目标工作目录下**。

```shell
# 创建工作目录
$ mkdir -p /data/restore/20240618 && chown -R mysql:mysql /data/restore/

# 复制备份文件到目标工作目录下
$ cp -rfp /data/backup/clone-full/20240618/ /data/restore/
```

如果不打算进行后续的增量备份恢复，那进行到这里就行了，可以基于这个工作目录，准备好一个合适的 my.cnf 配置文件，然后直接启动一个新的数据库实例。

```ini
$ cat /data/restore/20240618/my.cnf
[mysqld]
basedir = /data/apps/GreatDB-6.0.4-ALPHA-1413b448-Linux-glibc2.17-x86_64/
datadir = /data/restore/20240618
user = mysql
socket = mysql.sock
```

上面是一份最简单的 my.cnf 参考，仅设定了三个最基本的选项，更多选项可根据实际情况进行增减和调整。

如果还要继续后面的增备恢复，就先不启动数据库实例，继续往下进行。

#### 完成后续的增量恢复。

在上述工作目录的基础上，继续进行后面的增量备份文件恢复工作。

```shell
# 创建增备恢复目标目录
$ mkdir -p /data/restore/increment && chown -R mysql:mysql /data/restore/

# 复制第一次增量备份文件到目标目录
$ cp -rfp /data/backup/clone-incr/20240618-202406181041/ /data/restore/increment

# 对第一次增量备份文件进行恢复
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf --clone_incremental_dir=/data/restore/increment/20240618-202406181041
2024-06-18T07:18:34.877691Z 0 [System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld (mysqld 8.0.32-26) starting as process 914938
2024-06-18T07:18:34.897273Z 0 [Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: f982e941-2d42-11ef-9a06-d08e7908bcb1.
2024-06-18T07:18:34.931886Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2024-06-18T07:18:34.934287Z 1 [Warning] [MY-012091] [InnoDB] Allocated tablespace ID 6 for sys_mac, old maximum was 0
```

继续进行第二次增量备份的恢复工作。

```shell
# 复制第二次增量备份文件到目标目录
$ cp -rfp /data/backup/clone-incr/20240618-202406181350/ /data/restore/increment

# 对第二次增量备份文件进行恢复
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf --clone_incremental_dir=/data/restore/increment/20240618-202406181350
...
2024-06-18T07:28:41.207700Z 0 [System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld (mysqld 8.0.32-26) starting as process 915395
2024-06-18T07:28:41.214029Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2024-06-18T07:28:41.216527Z 1 [Warning] [MY-012091] [InnoDB] Allocated tablespace ID 6 for sys_mac, old maximum was 0
```

恢复的过程中没有产生报错信息，说明一切顺利。

这就完成了两次增量备份，接下来可以启动数据库实例。

#### 启动数据库实例

启动实例前，需要确认 my.cnf 中关键选项配置和原来实例中的要保持一致，尤其是 `port/socket/lower_case_table_names` 等几个，并进行适当的调整。

```shell
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf &
```

数据实例启动后，可以利用 [gt-checksum 工具](https://gitee.com/GreatSQL/gt-checksum) 或 GreatSQL 内置的 `CHECKSUM` SQL 命令检查校验原来的数据库实例以及恢复后的实例中的数据是否一致，以确认数据恢复成功。

#### 基于 Binlog 实现任意时间点恢复。

经过了上面的恢复工作，已经恢复到最后一次备份任务结束时刻（假设该时刻为T1）的数据备份。再结合 Binlog，就可以恢复到指定的任意时刻的数据（前提是这个时刻一定要大于T1）。

基于 Binlog 实现任意时间点的恢复步骤如下所示：

1. 连接恢复后的数据库实例，查询已执行的事务 GTID 信息
```sql
greatsql> SELECT * FROM performance_schema.clone_status\G
*************************** 1. row ***************************
             ID: 3
            PID: 0
          STATE: Completed
     BEGIN_TIME: 2024-06-18 10:39:28.214
       END_TIME: 2024-06-18 15:37:53.569
         SOURCE: LOCAL INSTANCE
    DESTINATION: LOCAL INSTANCE
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE: binlog.000013
BINLOG_POSITION: 29832341
  GTID_EXECUTED: c42c1e3e-0f41-11ef-b6bf-d08e7908bcb1:1-3270
      START_LSN: 0
 PAGE_TRACK_LSN: 0
        END_LSN: 0
```

这个查询结果表明该实例已恢复的事务 GTID 是 "c42c1e3e-0f41-11ef-b6bf-d08e7908bcb1:1-3270"，对应的 Binlog 文件是 "binlog.000013"，日志的点位是 "29832341"，对应的时间是 "2024-06-18 15:37:53.569"。

2. 连接原来的数据库实例，查询最新的事务 GTID 信息

```sql
greatsql> SHOW MASTER STATUS\G
*************************** 1. row ***************************
             File: binlog.000013
         Position: 29838644
     Binlog_Do_DB:
 Binlog_Ignore_DB:
Executed_Gtid_Set: c42c1e3e-0f41-11ef-b6bf-d08e7908bcb1:1-3272

greatsql> SHOW BINARY LOGS;
+---------------+-----------+-----------+
| Log_name      | File_size | Encrypted |
+---------------+-----------+-----------+
| binlog.000011 | 442631746 | No        |
| binlog.000012 |       197 | No        |
| binlog.000013 |  29838644 | No        |
+---------------+-----------+-----------+
```
看到 Binlog 文件已更新，产生了更多的事务日志。

3. 指定 Binlog 文件及点位，进行指定时间点恢复

```shell
# 进入原来的数据库实例存储 Binlog 的目录下
$ cd /data/GreatSQL

# 调用 mysqlbinlog 工具，指定起止点位，解析 Binlog 完成恢复
$ mysqlbinlog ./binlog.000013 --start-position=29832341 --stop-position=29838644 | mysql -S/data/restore/20240618/mysql.sock -uroot -p
```

解析 Binlog 恢复时，也可以改成指定截止时间点：

```shell
$ mysqlbinlog ./binlog.000013 --start-position=29832341 --stop-datetime="2024-06-18 16:00:00" | mysql -S/data/restore/20240618/mysql.sock -uroot -p
```

也可以不指定截止点位，则表示恢复到最新事务，例如：

```shell
$ mysqlbinlog ./binlog.000013 --start-position=29832341 | mysql -S/data/restore/20240618/mysql.sock -uroot -p
```

### 备份解压缩和恢复

### 恢复注意事项

## 关于 InnoDB page tracking

当在 Clone 备份任务中加上 `ENABLE PAGE TRACK` 子句，表示启用 page tracking 特性，则备份对象实例每次数据刷盘时，page tracking 系统就会记录刷盘的页面的 tablespace id 和 page no。这个操作由后台线程异步执行，并不影响前端用户业务性能。更多关于 page tracking 的介绍详见 [InnoDB Clone and page tracking](https://dev.mysql.com/blog-archive/innodb-clone-and-page-tracking)。

1. 开启 page tracking

在执行 Clone 备份时，加上 `ENABLE PAGE TRACK` 子句即可启用 page tracking：

```sql
greatsql> CLONE ... ENABLE PAGE TRACK;
```

还可以调用 `mysqlbackup_page_track_set()` 函数来启用 page tracking：

```sql
greatsql> SELECT mysqlbackup_page_track_set(true); 
+----------------------------------+
| mysqlbackup_page_track_set(true) |
+----------------------------------+
|                      21528636229 |
+----------------------------------+

greatsql> SHOW GLOBAL STATUS LIKE '%lsn%';
+-------------------------------------+-------------+
| Variable_name                       | Value       |
+-------------------------------------+-------------+
| Innodb_redo_log_checkpoint_lsn      | 21528636229 |
| Innodb_redo_log_current_lsn         | 21528636229 |
| Innodb_redo_log_flushed_to_disk_lsn | 21528636229 |
| Innodb_lsn_current                  | 21528636229 |
| Innodb_lsn_flushed                  | 21528636229 |
| Innodb_lsn_last_checkpoint          | 21528636229 |
+-------------------------------------+-------------+
```

向函数传递参数 "true" 表示开启 page tracking，函数返回值为当前最新 LSN。

开启 page tracking 后，向数据库中持续写入新数据或更新数据，过一段时间后再观察 LSN 变化：

```sql
greatsql> CREATE TABLE `t` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` int unsigned NOT NULL,
  `c2` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

greatsql> INSERT INTO t SELECT 0, rand()*10240000, rand();
greatsql> INSERT INTO t SELECT 0, rand()*10240000, rand() FROM t;
greatsql> INSERT INTO t SELECT 0, rand()*10240000, rand() FROM t;
...
-- 反复多次执行 INSERT ... SELECT 操作
greatsql> INSERT INTO t SELECT 0, rand()*10240000, rand() FROM t;

-- 观察最新的 LSN
greatsql> SHOW GLOBAL STATUS LIKE '%lsn%';
+-------------------------------------+-------------+
| Variable_name                       | Value       |
+-------------------------------------+-------------+
| Innodb_redo_log_checkpoint_lsn      | 21563224166 |
| Innodb_redo_log_current_lsn         | 21581909120 |
| Innodb_redo_log_flushed_to_disk_lsn | 21581909120 |
| Innodb_lsn_current                  | 21581909120 |
| Innodb_lsn_flushed                  | 21581909120 |
| Innodb_lsn_last_checkpoint          | 21563224166 |
+-------------------------------------+-------------+
```

开启 page tracking 后，会在 `%datadir%/#ib_archive` 目录下生成相关新文件记录 tablespace id 和 page no 变化情况：

```shell
$ find ./#ib_archive/ -type f | xargs ls -l
-rw-r----- 1 mysql mysql 49152 Jun 18 09:50 ./#ib_archive/ib_dblwr/dblwr_0
-rw-r----- 1 mysql mysql     0 Jun 17 17:55 ./#ib_archive/page_group_21483396843/durable
-rw-r----- 1 mysql mysql 32768 Jun 18 09:39 ./#ib_archive/page_group_21483396843/ib_page_0
-rw-r----- 1 mysql mysql     0 Jun 18 09:45 ./#ib_archive/page_group_21528636229/active
-rw-r----- 1 mysql mysql     0 Jun 18 09:44 ./#ib_archive/page_group_21528636229/durable
-rw-r----- 1 mysql mysql 65536 Jun 18 09:50 ./#ib_archive/page_group_21528636229/ib_page_0
```

2. 关闭 page tracking

可以通过调用 `mysqlbackup_page_track_set()` 函数来关闭 page tracking：

```sql
greatsql> SELECT mysqlbackup_page_track_set(false); 
+-----------------------------------+
| mysqlbackup_page_track_set(false) |
+-----------------------------------+
|                       21635193850 |
+-----------------------------------+

greatsql> SHOW GLOBAL STATUS LIKE '%lsn%';
+-------------------------------------+-------------+
| Variable_name                       | Value       |
+-------------------------------------+-------------+
| Innodb_redo_log_checkpoint_lsn      | 21635193850 |
| Innodb_redo_log_current_lsn         | 21635193850 |
| Innodb_redo_log_flushed_to_disk_lsn | 21635193850 |
| Innodb_lsn_current                  | 21635193850 |
| Innodb_lsn_flushed                  | 21635193850 |
| Innodb_lsn_last_checkpoint          | 21635193850 |
+-------------------------------------+-------------+
```
向函数传递参数 "false" 表示关闭 page tracking，函数返回值为当前最新 LSN。

3. 清除 page tracking 历史数据

在清除 page tracking 历史数据前需要先关闭 page tracking，再调用 `mysqlbackup_page_track_purge_up_to()` 函数清除历史数据。

```sql
-- 关闭 page tracking
greatsql> SELECT mysqlbackup_page_track_set(false);
+-----------------------------------+
| mysqlbackup_page_track_set(false) |
+-----------------------------------+
|                       21635193850 |
+-----------------------------------+

greatsql> SELECT mysqlbackup_page_track_purge_up_to(21635193850);
+-------------------------------------------------+
| mysqlbackup_page_track_purge_up_to(21635193850) |
+-------------------------------------------------+
|                                     21635193850 |
+-------------------------------------------------+

-- 再次调用清除函数，返回 LSN 最大值
greatsql> SELECT mysqlbackup_page_track_purge_up_to(21635193850);
+-------------------------------------------------+
| mysqlbackup_page_track_purge_up_to(21635193850) |
+-------------------------------------------------+
|                             9223372036854775807 |
+-------------------------------------------------+
```

其中，21635193850 是指定要清除 page tracking 数据的截止 LSN。如果要清除所有 page tracking 历史数据，则可以指定 LSN = 9223372036854775807，这是 LSN 的最大值。

再次查看 `%datadir%/#ib_archive` 目录下相关文件：

```shell
$ find ./#ib_archive/ -type f | xargs ls -l
-rw-r----- 1 mysql mysql 49152 Jun 18 09:55 ./#ib_archive/ib_dblwr/dblwr_0
```
可以看到，相关的数据文件都已经被清除。

打开 page tracking 后，如果后续不再需要增备，则最好采用上面的方法关闭 page tracking 并清除历史数据。

## 新增选项

## 元数据表

### Clone 备份历史记录表 mysql.clone_history

```sql
CREATE TABLE IF NOT EXISTS clone_history
(
  `ID` int auto_increment PRIMARY KEY,
  `PID` int DEFAULT 0,
  `CLONE_TYPE` varchar(50) DEFAULT NULL,
  `STATE` char(16) DEFAULT NULL,
  `BEGIN_TIME` timestamp(3) DEFAULT NULL,
  `END_TIME` timestamp(3) DEFAULT NULL,
  `SOURCE` varchar(512) DEFAULT NULL,
  `DESTINATION` varchar(512) DEFAULT NULL,
  `ERROR_NO` int DEFAULT NULL,
  `ERROR_MESSAGE` varchar(512) DEFAULT NULL,
  `BINLOG_FILE` varchar(512) DEFAULT NULL,
  `BINLOG_POSITION` bigint DEFAULT NULL,
  `GTID_EXECUTED` varchar(4096) DEFAULT NULL,
  `START_LSN` bigint DEFAULT NULL,
  `PAGE_TRACK_LSN` bigint DEFAULT NULL,
  `END_LSN` bigint DEFAULT NULL
) engine=INNODB STATS_PERSISTENT=0 CHARACTER SET utf8mb3 engine=InnoDB STATS_PERSISTENT=0 CHARACTER SET utf8mb3 COLLATE utf8mb3_bin comment='Clone history' ROW_FORMAT=DYNAMIC TABLESPACE=mysql";
```

其中，
- PID：对应 `information_schema.PROCESSLIST` 的 ID  列，如果要终止当前的克隆操作，可执行 `KILL [QUERY] PID`。
- CLONE_TYPE:  Clone 操作的类型，包括：full clone（全量），increment clone（增量）。
- STATE：Clone 操作的状态，包括：Not Started（尚未开始），In Progress（进行中），Completed（成功），Failed（失败）。
- BEGIN_TIME，END_TIME：Clone 操作开始、结束时间。
- ERROR_MESSAGE：出具体的报错信息。
- SOURCE：Donor 实例的地址。如果是 "LOCAL INSTANCE"，代表是本地 Clone 操作。
- DESTINATION：Clone 备份文件存储的本地目录。
- START_LSN：Clone 开始时的 LSN。
- PAGE_TRACK_LSN：新启动 page tracking 的 LSN。
- END_LSN：Clone 结束时的 LSN。
- BINLOG_FILE、BINLOG_POSITION、GTID_EXECUTED：Binlog 位置的相关参数，目前暂未使用。

```sql
greatsql> SELECT * FROM mysql.clone_history\G
...
*************************** 3. row ***************************
             ID: 3
            PID: 11
     CLONE_TYPE: full clone
          STATE: Completed
     BEGIN_TIME: 2024-06-18 10:39:28.214
       END_TIME: 2024-06-18 10:39:42.980
         SOURCE: LOCAL INSTANCE
    DESTINATION: /data/backup/clone-full/20240618/
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE:
BINLOG_POSITION: 0
  GTID_EXECUTED:
      START_LSN: 0
 PAGE_TRACK_LSN: 21635197273
        END_LSN: 21635237128
*************************** 4. row ***************************
             ID: 4
            PID: 11
     CLONE_TYPE: increment clone
          STATE: Completed
     BEGIN_TIME: 2024-06-18 10:41:47.074
       END_TIME: 2024-06-18 10:41:48.006
         SOURCE: LOCAL INSTANCE
    DESTINATION: /data/backup/clone-incr/20240618-202406181041/
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE:
BINLOG_POSITION: 0
  GTID_EXECUTED:
      START_LSN: 21635197273
 PAGE_TRACK_LSN: 21635197273
        END_LSN: 21635283915
4 rows in set (0.00 sec)
```
可以看到当前 ID 为 3 和 4 的两个备份任务，一个是全备（full clone），另一个是增备（increment clone），均已完成（Completed）。

### 备份状态监控视图

在 GreatSQL 中，对 `performance_schema` 下的系统视图 `clone_status` 和 `clone_progress` 进行了改造，使其可以作为增量备份操作的状态监控。

该视图只能保存最近 5 次备份操作记录。更多详细信息请参考：[Performance Schema Clone Tables](https://dev.mysql.com/doc/mysql-perfschema-excerpt/8.0/en/performance-schema-clone-tables.html)。

1. 查询备份状态

```sql
greatsql> SELECT * FROM performance_schema.clone_status\G
+------+------+-------------+-------------------------+-------------------------+----------------+------------------------------------------------+----------+---------------+-------------+-----------------+---------------+-------------+----------------+-------------+
| ID   | PID  | STATE       | BEGIN_TIME              | END_TIME                | SOURCE         | DESTINATION                                    | ERROR_NO | ERROR_MESSAGE | BINLOG_FILE | BINLOG_POSITION | GTID_EXECUTED | START_LSN   | PAGE_TRACK_LSN | END_LSN     |
+------+------+-------------+-------------------------+-------------------------+----------------+------------------------------------------------+----------+---------------+-------------+-----------------+---------------+-------------+----------------+-------------+
...
|    3 |   11 | Completed   | 2024-06-18 10:39:28.214 | 2024-06-18 10:39:42.980 | LOCAL INSTANCE | /data/backup/clone-full/20240618/              |        0 |               |             |               0 |               |           0 |    21635197273 | 21635237128 |
|    4 |   11 | Completed   | 2024-06-18 10:41:47.074 | 2024-06-18 10:41:48.006 | LOCAL INSTANCE | /data/backup/clone-incr/20240618-202406181041/ |        0 |               |             |               0 |               | 21635197273 |    21635197273 | 21635283915 |
+------+------+-------------+-------------------------+-------------------------+----------------+------------------------------------------------+----------+---------------+-------------+-----------------+---------------+-------------+----------------+-------------+
```

如果需要终止 ID = 4 的增备任务，可以通过如下命令：

```sql
-- 在上例中，ID = 4 的增备任务已完成（Completed），无法在事后终止。
greatsql> KILL 11;
```

注意：被终止的备份任务，不能再次启动，目前也不支持备份任务暂停。

2. 查询备份进度

```sql
greatsql> SELECT * FROM performance_schema.clone_progress;
+------+-----------+-------------+----------------------------+----------------------------+---------+------------+------------+---------+------------+---------------+
| ID   | STAGE     | STATE       | BEGIN_TIME                 | END_TIME                   | THREADS | ESTIMATE   | DATA       | NETWORK | DATA_SPEED | NETWORK_SPEED |
+------+-----------+-------------+----------------------------+----------------------------+---------+------------+------------+---------+------------+---------------+
...
|    3 | DROP DATA | Completed   | 2024-06-18 10:39:28.213906 | 2024-06-18 10:39:28.214139 |       1 |          0 |          0 |       0 |          0 |             0 |
|    3 | FILE COPY | Completed   | 2024-06-18 10:39:28.214170 | 2024-06-18 10:39:28.758188 |       1 | 2608261990 | 2608261990 |       0 |          0 |             0 |
|    3 | PAGE COPY | Completed   | 2024-06-18 10:39:28.758272 | 2024-06-18 10:39:28.760792 |       1 |     507904 |     507904 |       0 |          0 |             0 |
|    3 | REDO COPY | Completed   | 2024-06-18 10:39:28.760893 | 2024-06-18 10:39:28.761326 |       1 |       2560 |       2560 |       0 |          0 |             0 |
|    3 | FILE SYNC | Completed   | 2024-06-18 10:39:28.761478 | 2024-06-18 10:39:42.979919 |       1 |          0 |          0 |       0 |          0 |             0 |
|    3 | RESTART   | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    3 | RECOVERY  | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    4 | DROP DATA | Completed   | 2024-06-18 10:41:47.073536 | 2024-06-18 10:41:47.073856 |       1 |          0 |          0 |       0 |          0 |             0 |
|    4 | FILE COPY | Completed   | 2024-06-18 10:41:47.073885 | 2024-06-18 10:41:47.749980 |       1 |     737280 |          0 |       0 |          0 |             0 |
|    4 | PAGE COPY | Completed   | 2024-06-18 10:41:47.750062 | 2024-06-18 10:41:47.751127 |       1 |       3072 |       3072 |       0 |          0 |             0 |
|    4 | REDO COPY | Completed   | 2024-06-18 10:41:47.751165 | 2024-06-18 10:41:48.005963 |       1 |          0 |          0 |       0 |          0 |             0 |
|    4 | FILE SYNC | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    4 | RESTART   | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    4 | RECOVERY  | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
+------+-----------+-------------+----------------------------+----------------------------+---------+------------+------------+---------+------------+---------------+
35 rows in set (0.00 sec)
```

可以看到 ID 为 3 和 4 的两次备份任务完整过程：
- DROP DATA，先清除备份文件存储的目标目录。
- FILE COPY，拷贝文件。
- PAGE COPY，拷贝有变化的 data page。
- REDO COPY，拷贝有变化的 Rodo Log。
- FILE SYNC，这份备份文件集是否被用过（用于后续的增备等）。
- RESTART，这份备份文件集是否经历过重启。
- RECOVERY，这份备份文件集是否已用于恢复。

在 GreatSQL 中，通过 Clone 能更方便实现对本地或远程实例的全量或增量备份，大幅提升了数据库的便利性和可靠性。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
