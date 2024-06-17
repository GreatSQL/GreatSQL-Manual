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

### 全量备份恢复

### 增量备份恢复

### 备份解压缩和恢复

### 恢复注意事项

## 关于 InnoDB page tracking

当在 Clone 备份任务中加上 `ENABLE PAGE TRACK` 时，表示启用 InnoDB page tracking 特性，则备份对象实例每次数据刷盘时，InnoDB page tracking 系统就会记录刷盘的页面的 tablespace id 和 page no。这个操作由后台线程异步执行，并不影响前端用户业务性能。更多关于 InnoDB page tracking 的介绍详见 [InnoDB Clone and page tracking](https://dev.mysql.com/blog-archive/innodb-clone-and-page-tracking)。

1. 开启 InnoDB page tracking

在执行 Clone 备份时，加上 `ENABLE PAGE TRACK` 子句即可启用 InnoDB page tracking：

```sql
greatsql> CLONE ... ENABLE PAGE TRACK;
```

还可以调用 `mysqlbackup_page_track_set()` 函数来启用 InnoDB page tracking：

```sql
greatsql> SELECT mysqlbackup_page_track_set(true); 
```
向函数传递参数 "true" 表示开启 InnoDB page tracking，函数返回值为当前最新 LSN。

2. 关闭 InnoDB page tracking

可以通过调用 `mysqlbackup_page_track_set()` 函数来关闭 InnoDB page tracking：

```sql
greatsql> SELECT mysqlbackup_page_track_set(false); 
```
向函数传递参数 "false" 表示关闭 InnoDB page tracking，函数返回值为当前最新 LSN。

3. 清除page tracking历史数据

在清除page tracking的历史数据前需要先关闭page tracking。

```sql
greatdb> SELECT mysqlbackup_page_track_set(false);
greatdb> SELECT mysqlbackup_page_track_purge_up_to($LSN);
```
其中，$LSN是指定要清除页面跟踪数据的LSN。如果要清除所有追踪的数据文件，则LSN=9223372036854775807，该数值是最大可能LSN。

**注意：**
使用enable page track 打开page tracking后，需要用户手动执行上面的命令关闭page tracking和清除历史数据。


## 新增选项

## 元数据表

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
PID：Processlist ID。对应show processlist中的Id，如果要终止当前的克隆操作，可执行KILL QUERY processlist_id。

CLONE_TYPE:  克隆操作的类型，包括：full clone（全量克隆），increment clone（增量克隆）。

STATE：克隆操作的状态，包括：Not Started（克隆尚未开始），In Progress（克隆中），Completed（克隆成功），Failed（克隆失败）。

BEGIN_TIME，END_TIME：克隆操作开始、结束时间。

ERROR_MESSAGE：会给出具体的报错信息。

SOURCE：Donor实例的地址。如果内容是 **LOCAL INSTANCE**，代表是对本地实例做CLONE操作。

DESTINATION：CLONE存储的本地目录。

START_LSN：clone开始LSN。

PAGE_TRACK_LSN：新启动page tracking的LSN。

END_LSN：clone结束LSN。

BINLOG_FILE、BINLOG_POSITION、GTID_EXECUTED：binlog位置的相关参数，目前暂未使用。


对performance_schema下的系统视图clone_status和clone_progress改造，使其可以作为增量备份操作的状态监控，该视图只能保存最近5次的备份操作记录。[更多介绍参考](https://dev.mysql.com/doc/mysql-perfschema-excerpt/8.0/en/performance-schema-clone-tables.html)

1、可以使用如下命令查询备份状态：
```sql
greatdb> select * from clone_status;
+------+------+-------------+-------------------------+-------------------------+----------------+---------------------------------+----------+---------------+-------------+-----------------+---------------+-----------+----------------+------------+
| ID   | PID  | STATE       | BEGIN_TIME              | END_TIME                | SOURCE         | DESTINATION                     | ERROR_NO | ERROR_MESSAGE | BINLOG_FILE | BINLOG_POSITION | GTID_EXECUTED | START_LSN | PAGE_TRACK_LSN | END_LSN    |
+------+------+-------------+-------------------------+-------------------------+----------------+---------------------------------+----------+---------------+-------------+-----------------+---------------+-----------+----------------+------------+
|    0 |  310 | Completed   | 2023-08-01 14:29:29.165 | 2023-08-01 14:29:34.360 | LOCAL INSTANCE | /home/liugang/code/data/clone1/ |        0 |               |             |               0 |               |         0 |              0 |  138085535 |
|    1 |  313 | In Progress | 2023-08-02 16:00:56.557 | NULL                    | LOCAL INSTANCE | /home/liugang/code/data/clone2/ |        0 |               |             |               0 |               |         0 |              0 | 1606948531 |
+------+------+-------------+-------------------------+-------------------------+----------------+---------------------------------+----------+---------------+-------------+-----------------+---------------+-----------+----------------+------------+
2 rows in set (0.00 sec)
```
如果需要终止ID=1的备份任务，可以通过如下命令：
```sql
greatdb> kill 313;
```
**注意：**
终止的备份任务，不能再次启动。

2、可以使用如下命令查询备份进度：
```sql
greatdb> select * from clone_progress;
+------+-----------+-------------+----------------------------+----------------------------+---------+------------+------------+---------+------------+---------------+
| ID   | STAGE     | STATE       | BEGIN_TIME                 | END_TIME                   | THREADS | ESTIMATE   | DATA       | NETWORK | DATA_SPEED | NETWORK_SPEED |
+------+-----------+-------------+----------------------------+----------------------------+---------+------------+------------+---------+------------+---------------+
|    0 | DROP DATA | Completed   | 2023-08-01 14:29:29.164923 | 2023-08-01 14:29:33.602478 |       1 |          0 |          0 |       0 |          0 |             0 |
|    0 | FILE COPY | Completed   | 2023-08-01 14:29:33.602520 | 2023-08-01 14:29:33.801003 |       1 |  419485776 |  419485776 |       0 |          0 |             0 |
|    0 | PAGE COPY | Completed   | 2023-08-01 14:29:33.801075 | 2023-08-01 14:29:34.033987 |       1 |          0 |          0 |       0 |          0 |             0 |
|    0 | REDO COPY | Completed   | 2023-08-01 14:29:34.034063 | 2023-08-01 14:29:34.048264 |       1 |   21940224 |   21940224 |       0 |          0 |             0 |
|    0 | FILE SYNC | Completed   | 2023-08-01 14:29:34.048326 | 2023-08-01 14:29:34.360404 |       1 |          0 |          0 |       0 |          0 |             0 |
|    0 | RESTART   | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    0 | RECOVERY  | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    1 | DROP DATA | Completed   | 2023-08-02 16:00:56.557410 | 2023-08-02 16:00:56.563695 |       1 |          0 |          0 |       0 |          0 |             0 |
|    1 | FILE COPY | Completed   | 2023-08-02 16:00:56.563883 | 2023-08-02 16:00:59.131295 |       1 | 1709234256 | 1709234256 |       0 |          0 |             0 |
|    1 | PAGE COPY | Completed   | 2023-08-02 16:00:59.131370 | 2023-08-02 16:00:59.140021 |       1 |          0 |          0 |       0 |          0 |             0 |
|    1 | REDO COPY | Completed   | 2023-08-02 16:00:59.140058 | 2023-08-02 16:00:59.140424 |       1 |       6656 |       6656 |       0 |          0 |             0 |
|    1 | FILE SYNC | Completed   | 2023-08-02 16:00:59.140457 | 2023-08-02 16:00:59.728959 |       1 |          0 |          0 |       0 |          0 |             0 |
|    1 | RESTART   | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
|    1 | RECOVERY  | Not Started | NULL                       | NULL                       |       0 |          0 |          0 |       0 |          0 |             0 |
+------+-----------+-------------+----------------------------+----------------------------+---------+------------+------------+---------+------------+---------------+
21 rows in set (0.00 sec)

```

