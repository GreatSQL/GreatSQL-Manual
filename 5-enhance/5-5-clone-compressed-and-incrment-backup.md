# Clone 压缩及增量备份

从 GreatSQL 8.0.32-26 起支持 Clone 在线全量热备和增量备份，以及压缩备份。

关于 Clone 的基础使用方法参考文档：[Clone 备份恢复](../6-oper-guide/4-5-clone.md)，本文假定已经安装配置好 GreatSQL 数据库实例，以及前置的授权等工作都已做好。

## Clone 增量备份

### 全量备份

#### 备份远程实例

连接到 donor 实例上，执行下面的命令安装 mysqlbackup 组件：

```sql
greatsql> INSTALL COMPONENT "file://component_mysqlbackup";
```

再连接到 recipient 实例上，执行下面的命令进行在线全量热备：

```sql
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023'
          DATA DIRECTORY = '/data/backup/clone-full/20240610' ENABLE PAGE TRACK;
```

上述命令的作用是对远程实例 *172.16.16.10:3306* 执行在线全量热备，备份数据保存到本地目录 */data/backup/clone-full/20240610* 中，同时启用 [InnoDB page tracking](#关于-innodb-page-tracking) 用于后续的增量备份（如果只需要一次性全量备份，则不需要启用 *InnoDB page tracking*，就不要加上 `ENABLE PAGE TRACK` 子句）。

加上 `ENABLE PAGE TRACK` 子句后，在全量备份任务结束时会记录本次备份结束时的 LSN（*END_LSN*），以及下次增备任务的 LSN 起始点（*PAGE_TRACK_LSN*）。在每次备份任务结束后，都可以通过查询元数据表 `mysql.clone_history` 查看确认备份任务的状态，获取备份任务的位置点信息：

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
```

其中
- `START_LSN`，表示本次备份任务开始时的 LSN，如果是全量备份任务，则值为 0。
- `PAGE_TRACK_LSN`，表示本次备份任务结束时，启用 InnoDB page tracking 的 LSN，将它作为后续增量备份任务的起始点 LSN。
- `END_LSN`，表示本次备份任务结束时的 LSN。

#### 备份本地实例

如果是对本地实例进行全量备份，则会简单些，执行类似下面的命令即可：

```sql
greatsql> INSTALL COMPONENT "file://component_mysqlbackup";

greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-full/20240610' ENABLE PAGE TRACK;
```

同样地，如果不需要增量备份，则不要加上 `ENABLE PAGE TRACK` 子句。

### 增量备份

增量备份是在上一次全量或增量备份的基础上，再次备份到当前时间为止，对数据库所有修改变化的新数据。因此，在执行 Clone 增量备份时，需要在备份命令中体现上一次备份结束时产生的 *PAGE_TRACK_LSN*，它是上一次全量/增量备份结束时记录 LSN。所有大于该 LSN 的修改变化数据，都在本次增量备份任务的备份范围内。

#### 对远程实例执行增量备份

连接到 recipient 实例上，执行下面的命令执行增量备份：

```sql
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023'
	  DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
	  ENABLE PAGE TRACK START_LSN = 21083116;
```

上述命令的作用是对远程实例 *172.16.16.10:3306* 执行增量备份，增备的起始点 *LSN = 21083116*，增备文件存放在 */data/backup/clone-incr/20240610-21083116* 中。

除了指定起始 LSN 方式外，还可以指定基于本地备份目录执行增量备份：

```sql
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023'
	  DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
	  ENABLE PAGE TRACK
	  INCREMENT BASED DIRECTORY = '/data/backup/clone-full/20240610';
```
上述命令指定本次增备任务是在已有的别分目录 */data/backup/clone-full/20240610* 基础上，自动识别起始 LSN 后执行增备，这个方法的好处是避免手误写错 *START_LSN* 值。

#### 对本地实例执行增量备份

执行下面的命令，完成针对本地实例的增量备份：

```sql
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
          ENABLE PAGE TRACK START_LSN = 21083116;
```

同样地，也可以指定基于本地备份目录执行增备：

```sql
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
          ENABLE PAGE TRACK
          INCREMENT BASED DIRECTORY = '/data/backup/clone-full/20240610';
```

## Clone 增备数据恢复

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

### 备份（全量、增量）恢复

确定备份链路后，就可以选择恢复策略了，是要执行 *全量恢复* 还是 *全量 + 增量* 恢复，恢复过程步骤如下所示：

1. 如果只想要恢复全量备份数据，那么直接在 ID = 3 的备份文件集基础上启动 GreatSQL 服务即可；
2. 如果还想要恢复后续的增量备份，那么需要在以 ID = 3 的备份文件集基础上再将参数 `--clone_incremental_dir` 指向第一次增量备份（ID = 4）目录；
3. 待到第一次增量备份（ID = 4）恢复完成；
4. 如果还想继续恢复第二次增量备份（ID = 5），则需要在步骤 4 的基础上，继续将参数 `--clone_incremental_dir` 指向第二次增量备份（ID = 5）目录，这样就可以完成所有全备+增备数据恢复。

在启动 mysqld 程序时，加上参数 `--clone_incremental_dir` 的作用是将增量备份数据应用到 `datadir` 中，在应用完全部增量备份数据后，它就会自动退出，而不是继续进入服务启动阶段。

一次完整的数据恢复过程如下方的演示。

#### 基于 Clone 全量+增量备份恢复

**提醒**：恢复过程会修改全量备份的数据，如果中途出错，则数据文件可能会被破坏，因此每次恢复操作之前务必要先做好备份。

再次提醒，为了避免误操作、误删数据等原因，**严禁在原来的数据备份目录上直接操作，而是将备份文件复制到目标工作目录下**。

**1. 先准备好数据恢复的工作目录。**

```shell
# 创建工作目录
$ mkdir -p /data/restore && chown -R mysql:mysql /data/restore/
```

**2. 将全量备份文件及复制到工作目录下**

```shell
# 复制备份文件到目标工作目录下（不要直接在备份结果目录上进行恢复，至少留一份原始备份副本）
$ cp -rfp /data/backup/clone-full/20240618/ /data/restore/
$ chown -R mysql:mysql /data/restore/
```

**3. 在恢复工作目录下启动数据库**

如果不打算进行后续的增量备份恢复，那进行到这里就行了，可以基于这个工作目录，准备好一个合适的 my.cnf 配置文件，然后直接启动一个新的数据库实例。

```shell
$ cd /data/restore/20240618
$ cat my.cnf
[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/restore/20240618
user = mysql
socket = mysql.sock
lower_case_table_names = 1
skip-networking
```

上面是一份很简单的 my.cnf 参考，仅设定了几个基本参数，更多参数可根据实际情况进行增减和调整，例如 `lower_case_table_names` 要和原来的实例设置保持一致。在上面的配置文件中，增加了一行 *skip-networking*，因为这是做恢复测试的环境，不打算对外提供服务，只用于测试备份的可恢复性。

如果不打算进行后续的增备恢复，则可以直接启动 GreatSQL 服务：

```shell
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf &
```

如果还要继续后面的增备恢复，就先不启动数据库实例，继续往下进行。

**4. 继续进行增量恢复。**

在上述工作目录的基础上，继续进行后面的增量备份文件恢复工作。

创建增备恢复目标目录：

```shell
$ mkdir -p /data/restore/increment && chown -R mysql:mysql /data/restore/
```

复制第一次增量备份文件到目标目录：

```shell
$ cp -rfp /data/backup/clone-incr/20240618-202406181041/ /data/restore/increment
$ chown -R mysql:mysql /data/restore/
```

对第一次增量备份文件进行恢复

```shell
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf --clone_incremental_dir=/data/restore/increment/20240618-202406181041
2024-06-18T07:18:34.877691Z 0 [System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld (mysqld 8.0.32-26) starting as process 914938
2024-06-18T07:18:34.897273Z 0 [Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: f982e941-2d42-11ef-9a06-d08e7908bcb1.
2024-06-18T07:18:34.931886Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2024-06-18T07:18:34.934287Z 1 [Warning] [MY-012091] [InnoDB] Allocated tablespace ID 6 for sys_mac, old maximum was 0
```

到这里就成功地把第一次增量备份恢复到全量备份工作目录下了。

**5. 继续进行第二次增量备份的恢复工作。**

复制第二次增量备份文件到目标目录：

```shell
$ cp -rfp /data/backup/clone-incr/20240618-202406181350/ /data/restore/increment
$ chown -R mysql:mysql /data/restore/
```

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

**6. 启动数据库实例。**

启动实例前，需要确认 my.cnf 中关键参数配置和原来实例中的要保持一致，尤其是 `lower_case_table_names`，并进行适当的调整。

```shell
$ cd /data/restore/20240618
$ cat my.cnf
[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/restore/20240618
user = mysql
socket = mysql.sock
lower_case_table_names = 1
skip-networking

$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf &
```

数据实例启动后，可以利用 [gt-checksum 工具](https://gitee.com/GreatSQL/gt-checksum) 或 GreatSQL 内置的 `CHECKSUM` SQL 命令检查校验原来的数据库实例以及恢复后的实例中的数据是否一致，以确认数据恢复成功。

#### 基于 Binlog 实现任意时间点恢复

经过了上面的恢复工作，已经恢复到最后一次备份任务结束时刻（假设该时刻为 T1）的数据备份。再结合 Binlog，就可以恢复到指定的任意时刻的数据（前提是这个时刻一定要大于 T1）。

基于 Binlog 实现任意时间点的恢复步骤如下所示：

**1. 连接恢复后的数据库实例，查询已执行的事务 GTID 信息。**

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

这个查询结果表明该实例已恢复的事务 GTID 是 *c42c1e3e-0f41-11ef-b6bf-d08e7908bcb1:1-3270*，对应的 Binlog 文件是 *binlog.000013*，日志的点位是 *29832341*。

**2. 连接原来的数据库实例，查询最新的事务 GTID 信息。**

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

**3. 指定 Binlog 文件及点位，进行指定时间点恢复。**

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

利用 Clone 在线热备及增备功能，再结合 Binlog 大大提升 GreatSQL 的数据恢复可靠性，满足了可以恢复到任意指定时间点的需求。

## Clone 压缩备份

GreatSQL 8.0.32-26 版本开始支持 Clone 备份文件压缩功能，只需设置参数 `clone_file_compress` 即可实现，例如设置为 `clone_file_compress = CLONE_FILE_COMPRESS_ZSTD`，该特性默认不启用。

关于 Clone 压缩备份，有几点注意：

1. 必须是 GreatSQL 8.0.32-26 及以上版本才支持该特性，也就是 Clone 备份的接收端必须是 8.0.32-26 及以上版本才支持。

2. 如果是 Clone 备份远程实例，则需要在接收端实例（recipient 实例）设置该参数。

3. 支持两种压缩算法：*zstd* 和 *lz4*。推荐选择 *zstd*，它是一种快速无损压缩算法，针对实时压缩场景，且具有更好的压缩比。

4. 参数 `clone_file_compress` 和 `clone_enable_compression` 不同，前者决定了备份文件是否压缩；而后者用于决定 Clone 在网络传输数据时，是否开启压缩功能。且二者没有依赖关系。

5. 不支持同时开启 Clone 备份压缩和[Clone 备份加密](./5-4-security-clone-encrypt.md)功能。

### 开始压缩备份

下面以对本地实例进行压缩备份为例进行演示。

#### 开启备份文件压缩功能

```sql
greatsql> SET GLOBAL clone_file_compress = CLONE_FILE_COMPRESS_ZSTD;
```

#### 执行 Clone 备份

```sql
-- 备份本地实例，并开启 page tracking
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-compressed/20240708' ENABLE PAGE TRACK;
```

查看备份文件，确认压缩结果

```shell
$ ls -la /data/backup/clone-compressed/20240708
total 50744
drwxr-x--- 7 mysql mysql     4096 Jul  8 12:16  .
drwxr-x--- 3 mysql mysql       22 Jul  8 12:16  ..
drwxr-x--- 2 mysql mysql      115 Jul  8 12:16 '#clone'
-rw-r----- 1 mysql mysql     1699 Jul  8 12:16  ib_buffer_pool.zstd
-rw-r----- 1 mysql mysql      142 Jul  8 12:16  ibdata1.delta.zstd
-rw-r----- 1 mysql mysql       64 Jul  8 12:16  ibdata1.meta
-rw-r----- 1 mysql mysql     4410 Jul  8 12:16  ibdata1.zstd
drwxr-x--- 2 mysql mysql       28 Jul  8 12:16 '#innodb_redo'
drwxr-x--- 2 mysql mysql     4096 Jul  8 12:16  mysql
-rw-r----- 1 mysql mysql      432 Jul  8 12:16  mysql.ibd.delta.zstd
-rw-r----- 1 mysql mysql       73 Jul  8 12:16  mysql.ibd.meta
-rw-r----- 1 mysql mysql  4671502 Jul  8 12:16  mysql.ibd.zstd
drwxr-x--- 2 mysql mysql      195 Jul  8 12:16  sys
-rw-r----- 1 mysql mysql        0 Jul  8 12:16  sys_audit.ibd.delta.zstd
-rw-r----- 1 mysql mysql       64 Jul  8 12:16  sys_audit.ibd.meta
-rw-r----- 1 mysql mysql     3399 Jul  8 12:16  sys_audit.ibd.zstd
-rw-r----- 1 mysql mysql        0 Jul  8 12:16  sys_mac.ibd.delta.zstd
-rw-r----- 1 mysql mysql       64 Jul  8 12:16  sys_mac.ibd.meta
-rw-r----- 1 mysql mysql    15696 Jul  8 12:16  sys_mac.ibd.zstd
drwxr-x--- 2 mysql mysql     4096 Jul  8 12:16  tpch1g
-rw-r----- 1 mysql mysql        0 Jul  8 12:16  undo_001.delta.zstd
-rw-r----- 1 mysql mysql       69 Jul  8 12:16  undo_001.meta
-rw-r----- 1 mysql mysql 26857347 Jul  8 12:16  undo_001.zstd
-rw-r----- 1 mysql mysql      407 Jul  8 12:16  undo_002.delta.zstd
-rw-r----- 1 mysql mysql       69 Jul  8 12:16  undo_002.meta
-rw-r----- 1 mysql mysql 20346487 Jul  8 12:16  undo_002.zstd
```

在 Clone 压缩备份文件目录下，可以看到每个表空间都会对应一个 *.delta* 后缀的数据文件。之所以产生这些文件，是因为全量 Clone 压缩备份在 *FILE COPY* 阶段结束后，数据文件已被压缩，在 *PAGE COPY* 阶段中的数据因找不到其在原文件的位置，需要单独存储到 *.delta* 文件。

在数据恢复阶段，GreatSQL 会把这些 *.delta* 文件当做增量备份文件去做恢复处理。

#### 在全备基础上，再做一次增备（压缩）

```sql
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-compressed-incr/20240708-202407081218'
          ENABLE PAGE TRACK
          INCREMENT BASED DIRECTORY '/data/backup/clone-compressed/20240708';
```

查看备份文件，确认压缩结果

```shell
$ ls -la /data/backup/clone-compressed-incr/20240708-2024070812
total 176
drwxr-x--- 7 mysql mysql   4096 Jul  8 12:18  .
drwxr-x--- 3 mysql mysql     33 Jul  8 12:18  ..
drwxr-x--- 2 mysql mysql    115 Jul  8 12:18 '#clone'
-rw-r----- 1 mysql mysql    195 Jul  8 12:18  ibdata1.delta.zstd
-rw-r----- 1 mysql mysql     64 Jul  8 12:18  ibdata1.meta
drwxr-x--- 2 mysql mysql     28 Jul  8 12:18 '#innodb_redo'
drwxr-x--- 2 mysql mysql    236 Jul  8 12:18  mysql
-rw-r----- 1 mysql mysql 103457 Jul  8 12:18  mysql.ibd.delta.zstd
-rw-r----- 1 mysql mysql     73 Jul  8 12:18  mysql.ibd.meta
drwxr-x--- 2 mysql mysql    136 Jul  8 12:18  sys
-rw-r----- 1 mysql mysql      0 Jul  8 12:18  sys_audit.ibd.delta.zstd
-rw-r----- 1 mysql mysql     64 Jul  8 12:18  sys_audit.ibd.meta
-rw-r----- 1 mysql mysql      0 Jul  8 12:18  sys_mac.ibd.delta.zstd
-rw-r----- 1 mysql mysql     64 Jul  8 12:18  sys_mac.ibd.meta
drwxr-x--- 2 mysql mysql   4096 Jul  8 12:18  tpch1g
-rw-r----- 1 mysql mysql   9692 Jul  8 12:18  undo_001.delta.zstd
-rw-r----- 1 mysql mysql     69 Jul  8 12:18  undo_001.meta
-rw-r----- 1 mysql mysql  21114 Jul  8 12:18  undo_002.delta.zstd
-rw-r----- 1 mysql mysql     69 Jul  8 12:18  undo_002.meta
```

### 压缩备份恢复

#### 设置环境变量

解压缩时需要用到 `zstd_decompress` 和 `lz4_decompress` 是 GreatSQL 提供的解压缩工具，它们位于 *basedir/bin* 目录下，需要将该目录加到环境变量 **PATH** 中，否则就需要指定全路径：

```shell
$ export PATH=$PATH:/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin
$ which zstd_decompress
/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/zstd_decompress
```

#### 解压缩备份文件

在开始使用压缩后的备份文件恢复前，需要先解压缩：

```shell
# 无论如何，不要忘记再做一次备份，避免误操作影响原来的备份文件
$ cp -rfp /data/backup/clone-compressed/20240708 /data/restore/

# 解压缩
$ cd /data/restore/20240618
$ for f in `find . -iname "*\.zstd"`; do zstd_decompress $f $(dirname $f)/$(basename $f .zstd); rm -f $f; done
decompress file: ./sys/sys_config.ibd.zstd
decompress file: ./sys/dbms_alert_info.ibd.zstd
...
decompress file: ./mysql/clone_history.ibd.delta.zstd
decompress file: ./#innodb_redo/#ib_redo0.zstd

# 确认解压缩后的文件
$ ls -la
total 299644
drwxr-x--- 7 mysql mysql      4096 Jul  8 14:05  .
drwxr-xr-x 4 root  root         39 Jul  8 14:04  ..
drwxr-x--- 2 mysql mysql       115 Jul  8 12:16 '#clone'
-rw-r--r-- 1 root  root      10237 Jul  8 14:05  ib_buffer_pool
-rw-r--r-- 1 root  root   12582912 Jul  8 14:05  ibdata1
-rw-r--r-- 1 root  root      32768 Jul  8 14:05  ibdata1.delta
-rw-r----- 1 mysql mysql        64 Jul  8 12:16  ibdata1.meta
drwxr-x--- 2 mysql mysql        23 Jul  8 14:05 '#innodb_redo'
drwxr-x--- 2 mysql mysql       312 Jul  8 14:05  mysql
-rw-r--r-- 1 root  root   41943040 Jul  8 14:05  mysql.ibd
-rw-r--r-- 1 root  root      32768 Jul  8 14:05  mysql.ibd.delta
-rw-r----- 1 mysql mysql        73 Jul  8 12:16  mysql.ibd.meta
drwxr-x--- 2 mysql mysql       175 Jul  8 14:05  sys
-rw-r--r-- 1 root  root     131072 Jul  8 14:05  sys_audit.ibd
-rw-r--r-- 1 root  root          0 Jul  8 14:05  sys_audit.ibd.delta
-rw-r----- 1 mysql mysql        64 Jul  8 12:16  sys_audit.ibd.meta
-rw-r--r-- 1 root  root     376832 Jul  8 14:05  sys_mac.ibd
-rw-r--r-- 1 root  root          0 Jul  8 14:05  sys_mac.ibd.delta
-rw-r----- 1 mysql mysql        64 Jul  8 12:16  sys_mac.ibd.meta
drwxr-x--- 2 mysql mysql      4096 Jul  8 14:05  tpch1g
-rw-r--r-- 1 root  root  134217728 Jul  8 14:05  undo_001
-rw-r--r-- 1 root  root          0 Jul  8 14:05  undo_001.delta
-rw-r----- 1 mysql mysql        69 Jul  8 12:16  undo_001.meta
-rw-r--r-- 1 root  root  117440512 Jul  8 14:05  undo_002
-rw-r--r-- 1 root  root      32768 Jul  8 14:05  undo_002.delta
-rw-r----- 1 mysql mysql        69 Jul  8 12:16  undo_002.meta
```

以上是假定备份压缩采用的是 *zstd* 方式，如果是 *lz4* 则改成类似下面这样（修改文件后缀，以及调用的解压缩工具）：

```shell
# 解压缩
$ cd /data/restore/20240618
$ for f in `find . -iname "*\.lz4"`; do lz4_decompress $f $(dirname $f)/$(basename $f .lz4); rm $f; done
```

#### 解压缩增备文件

如果还要恢复增备压缩文件，同样地，也要先进行解压缩操作：

```shell
# 不厌其烦地提醒，要先做好备份，不要对原备份文件直接操作
$ cp -rfp /data/backup/clone-compressed-incr/20240708-2024070812 /data/restore/increment

# 解压缩
$ cd /data/restore/increment/20240708-2024070812
$ for f in `find . -iname "*\.zstd"`; do zstd_decompress $f $(dirname $f)/$(basename $f .zstd); rm -f $f; done
decompress file: ./ibdata1.delta.zstd
...
decompress file: ./sys/dbms_alert_info.ibd.delta.zstd
```

#### 全量压缩备份恢复

准备好一个合适的 my.cnf 配置文件，然后应用 *.delta* 文件，即可完成全量备份恢复：

```shell
$ cd /data/restore/20240708

# 检查确认 my.cnf 文件内容
$ cat my.cnf
[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/restore/20240708
user = mysql
socket = mysql.sock
skip-networking
```
可根据需要自行调整 my.cnf 配置文件内容。

如果还想继续恢复增量备份文件，请跳到下一步操作 [增量压缩备份恢复](#增量压缩备份恢复)。

如果不需要继续恢复增备文件，则将全量压缩备份恢复后的文件目录作为 `datadir`，准备启动 *mysqld *程序。

在这里要特别注意的是，在对全量压缩备份的第一次恢复过程中，启动 mysqld 程序时既要指定 datadir=/data/restore/20240708，同时也要指定 clone_incremental_dir=/data/restore/20240708，这样才能对 .delta 文件进行恢复操作。类似下面这样：

```shell
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf --clone_incremental_dir=/data/restore/20240708
2024-07-08T07:38:19.997169Z 0 [Warning] [MY-010097] [Server] Insecure configuration for --secure-log-path: Current value does not restrict location of generated files. Consider setting it to a valid, non-empty path.
2024-07-08T07:38:19.997213Z 0 [System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.17-x86_64/bin/mysqld (GreatSQL 8.0.32-26) starting as process 1637442
2024-07-08T07:38:20.034542Z 0 [Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: 0c2b81ce-3cfd-11ef-be21-d08e7908bcb1.
2024-07-08T07:38:20.102551Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2024-07-08T07:38:20.105270Z 1 [Warning] [MY-012091] [InnoDB] Allocated tablespace ID 7 for sys_audit, old maximum was 0
```

> 也就是说，在对 Clone 压缩备份文件执行恢复时，同时要把恢复目录当做增量备份目录以完成对 .delta 文件的恢复

可根据需要自行调整 my.cnf 配置文件内容。

过程中如果没有报错，就说明压缩全量备份恢复成功。

#### 增量压缩备份恢复

将增备压缩文件解压缩后，准备好一个合适的 my.cnf 配置文件，配合全备文件目录，执行增备文件的恢复应用：

```shell
$ cd /data/restore/20240618

# 检查确认 my.cnf 文件内容
$ cat my.cnf
[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/restore/20240618
user = mysql
socket = mysql.sock
skip-networking
```

可根据需要自行调整 my.cnf 配置文件内容。

接下来启动 *mysqld* 程序，将 `--clone_incremental_dir` 参数指向增量备份恢复数据目录，在应用完全部增量备份数据后，进程就会自动退出，而不是继续进入服务启动阶段。

```shell
# 启动 GreatSQL，将参数 --clone_incremental_dir 指向增备恢复文件
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf --clone_incremental_dir=/data/restore/20240618-202406181530
2024-07-08T07:00:53.686378Z 0 [Warning] [MY-010097] [Server] Insecure configuration for --secure-log-path: Current value does not restrict location of generated files. Consider setting it to a valid, non-empty path.
2024-07-08T07:00:53.686422Z 0 [System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.17-x86_64/bin/mysqld (mysqld 8.0.32-23)
2024-07-08T07:00:53.702073Z 0 [Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: d1405fbb-3cf7-11ef-8d84-d08e7908bcb1.
2024-07-08T07:00:53.728307Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2024-07-08T07:00:53.738851Z 1 [Warning] [MY-012091] [InnoDB] Allocated tablespace ID 7 for sys_audit, old maximum was 0
```

恢复过程中没有产生报错信息，说明一切顺利。

这就完成了增备文件恢复，如果有多个增备压缩文件，重复上面的 **解压缩 & 应用** 操作即可。

#### 启动数据库实例

全备、增备文件全部应用完后，接下来可以启动数据库实例：

```shell
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf &
```
可根据需要自行调整 my.cnf 配置文件内容。

启动过程中如果没有报错，就说明压缩全备 + 增备恢复成功。

至此，一次完整的 Clone 压缩全备 + 增备，以及后续的数据恢复工作完成了。

### 压缩备份效果测试

利用 `sysbench` 工具填充 5 个测试表，每个表 2000 万行数据。经对比测试，数据压缩比如下：

| 压缩算法	| 原数据大小 | Clone | Xtrabackup| Clone 压缩比| Xtrabackup压缩比|
| --- | --- |--- | --- | --- | --- |
| zstd| 23Gb |9.6Gb |9.6Gb |2.40 | 2.40 |
| lz4 |	23Gb |16.1Gb |17Gb |1.43 | 1.35 |

可见 Clone 备份的压缩效果还是不错的。

## 关于 InnoDB page tracking

当在 Clone 备份任务中加上 `ENABLE PAGE TRACK` 子句，表示启用 *page tracking* 特性，则备份对象实例每次数据刷盘时，*page tracking* 系统就会记录刷盘的页面的 *tablespace id* 和 *page no*。这个操作由后台线程异步执行，并不影响前端用户业务性能。更多关于 *page tracking* 的介绍详见 [InnoDB Clone and page tracking](https://dev.mysql.com/blog-archive/innodb-clone-and-page-tracking)。

### 开启 page tracking

在执行 Clone 备份时，加上 `ENABLE PAGE TRACK` 子句即可启用 *page tracking*：

```sql
greatsql> CLONE ... ENABLE PAGE TRACK;
```

还可以调用 `mysqlbackup_page_track_set()` 函数来启用 *page tracking*：

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

向函数传递参数 *true* 表示开启 *page tracking*，函数返回值为当前最新 LSN。

开启 *page tracking* 后，向数据库中持续写入新数据或更新数据，过一段时间后再观察 LSN 变化：

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

开启 *page tracking* 后，会在 `%datadir%/#ib_archive` 目录下生成相关新文件记录 *tablespace id* 和 *page no* 变化情况：

```shell
$ find ./#ib_archive/ -type f | xargs ls -l
-rw-r----- 1 mysql mysql 49152 Jun 18 09:50 ./#ib_archive/ib_dblwr/dblwr_0
-rw-r----- 1 mysql mysql     0 Jun 17 17:55 ./#ib_archive/page_group_21483396843/durable
-rw-r----- 1 mysql mysql 32768 Jun 18 09:39 ./#ib_archive/page_group_21483396843/ib_page_0
-rw-r----- 1 mysql mysql     0 Jun 18 09:45 ./#ib_archive/page_group_21528636229/active
-rw-r----- 1 mysql mysql     0 Jun 18 09:44 ./#ib_archive/page_group_21528636229/durable
-rw-r----- 1 mysql mysql 65536 Jun 18 09:50 ./#ib_archive/page_group_21528636229/ib_page_0
```

### 关闭 page tracking

可以通过调用 `mysqlbackup_page_track_set()` 函数来关闭 *page tracking*：

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
向函数传递参数 *false* 表示关闭 *page tracking*，函数返回值为当前最新 LSN。

### 清除 page tracking 历史数据

在清除 *page tracking* 历史数据前需要先关闭 *page tracking*，再调用 `mysqlbackup_page_track_purge_up_to()` 函数清除历史数据。

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

其中，*21635193850* 是指定要清除 *page tracking* 数据的截止 LSN。如果要清除所有 *page tracking* 历史数据，则可以指定 *LSN = 9223372036854775807*，这是 LSN 的最大值。

再次查看 `%datadir%/#ib_archive` 目录下相关文件：

```shell
$ find ./#ib_archive/ -type f | xargs ls -l
-rw-r----- 1 mysql mysql 49152 Jun 18 09:55 ./#ib_archive/ib_dblwr/dblwr_0
```
可以看到，相关的数据文件都已经被清除。

打开 *page tracking* 后，如果后续不再需要增备，则最好采用上面的方法关闭 *page tracking* 并清除历史数据。

## 新增参数

GreatSQL 中针对 Clone 备份新增以下几个参数。

- clone_file_compress

| System Variable Name	| clone_file_compress |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| Yes |
| Permitted Values |	[CLONE_FILE_COMPRESS_NONE | CLONE_FILE_COMPRESS_ZSTD | CLONE_FILE_COMPRESS_LZ4] |
| Default	| CLONE_FILE_COMPRESS_NONE |
| Description	| 选择 Clone 文件压缩算法，默认：未开启。支持两种压缩算法：<br/>zstd（CLONE_FILE_COMPRESS_ZSTD）<br/>lz4（CLONE_FILE_COMPRESS_LZ4）|

- clone_file_compress_zstd_level

| System Variable Name	| clone_file_compress_zstd_level |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| Yes |
| Permitted Values |	[1 - 19] |
| Default	| 1 |
| Description	| zstd 压缩级别，取值范围为 [1 - 19] 的整数，默认为 1|

- clone_file_compress_chunk_size

| System Variable Name	| clone_file_compress_chunk_size |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| Yes |
| Permitted Values |	[1024, ULLONG_MAX] |
| Default	| 64Kb |
| Description	| 数据压缩线程的工作缓冲区大小（以字节为单位），默认值：64Kb |

- clone_file_compress_threads

| System Variable Name	| clone_file_compress_threads |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| Yes |
| Permitted Values |	[1 - 128] |
| Default	| 4 |
| Description	| 数据压缩的并行线程数，取值范围 [1 - 128] 的整数，默认值：4 |

- clone_incremental_dir

| System Variable Name	| clone_incremental_dir |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| No |
| Permitted Values |	 |
| Default	|  |
| Description	| 指定用于数据恢复的增备文件路径 |


## 元数据表

### Clone 备份历史记录表

```sql
greatsql> SHOW CREATE TABLE mysql.clone_history\G
*************************** 1. row ***************************
       Table: clone_history
Create Table: CREATE TABLE `clone_history` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PID` int DEFAULT '0',
  `CLONE_TYPE` varchar(50) DEFAULT NULL,
  `STATE` char(16) DEFAULT NULL,
  `BEGIN_TIME` timestamp(3) NULL DEFAULT NULL,
  `END_TIME` timestamp(3) NULL DEFAULT NULL,
  `SOURCE` varchar(512) DEFAULT NULL,
  `DESTINATION` varchar(512) DEFAULT NULL,
  `ERROR_NO` int DEFAULT NULL,
  `ERROR_MESSAGE` varchar(512) DEFAULT NULL,
  `BINLOG_FILE` varchar(512) DEFAULT NULL,
  `BINLOG_POSITION` bigint DEFAULT NULL,
  `GTID_EXECUTED` varchar(4096) DEFAULT NULL,
  `START_LSN` bigint DEFAULT NULL,
  `PAGE_TRACK_LSN` bigint DEFAULT NULL,
  `END_LSN` bigint DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci STATS_PERSISTENT=0 COMMENT='Clone history'
```

其中，
- `PID`：对应 `information_schema.PROCESSLIST` 的 ID  列，如果要终止当前的克隆操作，可执行 `KILL [QUERY] PID`。
- `CLONE_TYPE`:  Clone 操作的类型，包括：full clone（全量），increment clone（增量）。
- `STATE`：Clone 操作的状态，包括：Not Started（尚未开始），In Progress（进行中），Completed（成功），Failed（失败）。
- `BEGIN_TIME`，`END_TIME`：Clone 操作开始、结束时间。
- `ERROR_MESSAGE`：出具体的报错信息。
- `SOURCE`：donor 实例的地址。如果是 *LOCAL INSTANCE*，代表是本地 Clone 操作。
- `DESTINATION`：Clone 备份文件存储的本地目录。
- `START_LSN`：Clone 开始时的 LSN。
- `PAGE_TRACK_LSN`：新启动 *page tracking* 的 LSN。
- `END_LSN`：Clone 结束时的 LSN。
- `BINLOG_FILE`、`BINLOG_POSITION`、`GTID_EXECUTED`：Binlog 位置的相关参数，目前暂未使用。

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
可以看到当前 ID 为 3 和 4 的两个备份任务，一个是全备（*full clone*），另一个是增备（*increment clone*），均已完成（*Completed*）。

### 备份状态监控视图

在 GreatSQL 中，对 `performance_schema` 下的系统视图 `clone_status` 和 `clone_progress` 进行了改造，使其可以作为增量备份操作的状态监控。

该视图只能保存最近 5 次备份操作记录。更多详细信息请参考：[Performance Schema Clone Tables](https://dev.mysql.com/doc/mysql-perfschema-excerpt/8.0/en/performance-schema-clone-tables.html)。

#### 查询备份状态

```sql
greatsql> SELECT * FROM performance_schema.clone_status;
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

#### 查询备份进度

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
- `DROP DATA`，先清除备份文件存储的目标目录。
- `FILE COPY`，拷贝文件。
- `PAGE COPY`，拷贝有变化的 data page。
- `REDO COPY`，拷贝有变化的 Rodo Log。
- `FILE SYNC`，这份备份文件集是否被用过（用于后续的增备等）。
- `RESTART`，这份备份文件集是否经历过重启。
- `RECOVERY`，这份备份文件集是否已用于恢复。

在 GreatSQL 中，通过 Clone 能更方便实现对本地或远程实例的全量或增量备份，大幅提升了数据库的便利性和可靠性。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
