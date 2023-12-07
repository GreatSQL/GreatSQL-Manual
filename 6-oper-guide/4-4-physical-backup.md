# 物理备份恢复
---

本文介绍GreatSQL数据库如何采进行物理备份恢复。

## 1. 文件层物理备份恢复
可以采用多种方式在文件系统层进行物理备份：
- 在停机维护时，通过文件系统层copy整个数据文件目录，即`datadir`指向的目录，包括ibdata1、redo、undo等文件。
- 在主从复制架构的从节点停机维护时，copy整个数据文件目录。
- 在MGR架构的从节点停机维护时，copy整个数据文件目录。

**注意：** 

1. 如果想要通过文件系统层进行物理备份，则在停机维护前，最好先设置 `innodb_fast_shutdown=0`，然后再关闭该实例，以确保可以获得一份干净的数据文件。
2. 进行物理备份时，还要同时备份相应的my.cnf配置文件，因为在恢复时相关的参数选项要保持一致。
3. 如果`datadir`目录下有`mysqld-auto.cnf`这个配置文件，也要备份。
4. 在`datadir`目录下的`auto.cnf`文件记录的是该实例的`server_uuid`，在做恢复时如果不需要保留原值，则可以删除该文件，在实例启动时会自动重新生成一个新的`server_uuid`。通常也不建议保留，因为有可能会和现有的实例产生冲突。

需要恢复时，直接将物理备份文件copy到相应目录下，修改文件属主及权限模式，确认相应的my.cnf中的配置无误后，直接启动GreatSQL服务进程即可。

## 2. xtrabackup备份恢复
`Xtrabackup` 是由Percona公司出品的开源免费备份工具，它能很方便的对MySQL数据库进行在线热备，并且支持压缩、加密、流式备份等多种方式。

这是`Xtrabackup`安装包[下载地址](https://www.percona.com/downloads/Percona-XtraBackup-LATEST/)，这是[文档地址](https://docs.percona.com/percona-xtrabackup)。

本文环境选择的是 `Xtrabackup 8.0.32-26` 版本。

可根据个人喜好选择RPM包或二进制包，安装步骤略过。

`Xtrabackup`备份的流程大致如下：

1. 发起备份，初始化检查等；
2. 备份系统表空间文件ibdata1及各表空间.ibd文件；
3. 备份其它非InnoDB表；
4. 执行操作 `FLUSH NO_WRITE_TO_BINLOG BINARY LOGS`，刷新binlog；
5. 从`p_s.log_status`中获取最新的redo log lsn，以及binlog点位信息；
6. 备份最新的binlog文件（步骤4刷新后新产生的binlog文件）；
7. 更新备份目标目录下的binlog.index文件；
8. 更新xtrabackup_binlog_info文件；
9. 执行操作`FLUSH NO_WRITE_TO_BINLOG ENGINE LOGS`；
10. 备份ib_buffer_pool文件；
11. 备份结束。

而在Xtrabackup 2.X及更早的版本中，第5步这里直接执行FTWRL，不管是否只有InnoDB表。

在GreatSQL 8.0中（XtraBackup也相应升级到8.x版本），仅存在InnoDB表的话，不再执行FTWRL，而是直接读元数据。

### 2.1 常规全量备份

```
$ xtrabackup --backup --datadir=/data/GreatSQL/ --target-dir=/backup/GreatSQL/full/`date +'%Y%m%d'`/
...
xtrabackup: Transaction log of lsn (46865086) to (46876581) was copied.
230822 10:24:59 completed OK!

$ ls /backup/GreatSQL/`date +'%Y%m%d'`/
backup-my.cnf   binlog.000007  mysql.ibd                      db1   undo_001                xtrabackup_checkpoints  xtrabackup_tablespaces
ib_buffer_pool  binlog.index   mysql_innodb_cluster_metadata  sys   undo_002                xtrabackup_info
ibdata1         mysql          performance_schema             db2   xtrabackup_binlog_info  xtrabackup_logfile
```

几个选项的作用分别是：

- `--backup`，指定本次操作是备份
- `--datadir`，指定数据库的datadir
- `--target-dir`，指定本次备份的目标目录

备份完毕后，目标目录下的几个文件作用分别是：

- backup-my.cnf，记录执行xtrabackup相关选项参数，用于后续恢复
- xtrabackup_binlog_info，记录备份时的binlog及GTID信息，用于将数据恢复后作为从节点时设置主从复制相关选项
- xtrabackup_checkpoints，记录本次备份redo log的lsn及checkpoint信息，用于数据全量/增量恢复时的事务恢复点位判断
- xtrabackup_info，记录本次备份常规信息

### 2.2 只备份部分库表

```
$ xtrabackup --backup --datadir=/data/GreatSQL/ --tables="db1.t_user_*,db2.t_log_*" --target-dir=/backup/GreatSQL/partial/`date +'%Y%m%d'`/
...
xtrabackup: Transaction log of lsn (48318000) to (48324707) was copied.
230822 10:45:46 completed OK!

$ ls /backup/GreatSQL/`date +'%Y%m%d'`/
backup-my.cnf   ibdata1        binlog.index  db1  undo_001  xtrabackup_binlog_info  xtrabackup_info     xtrabackup_tablespaces
ib_buffer_pool  binlog.000006  mysql.ibd     db2  undo_002  xtrabackup_checkpoints  xtrabackup_logfile
```

### 2.3 压缩备份

在原来的基础上增加 `--compress` 选项即可，例如：
```
$ xtrabackup --backup --compress --datadir=/data/GreatSQL/ --target-dir=/backup/GreatSQL/full/`date +'%Y%m%d'`/
```
通常而言，大概有4倍左右的压缩比。

### 2.4 并行压缩，并且流式备份
```
$ xtrabackup --backup --stream=xbstream --compress --compress-threads=4 --datadir=/data/GreatSQL/ > /backup/GreatSQL/full/xbk-`date +'%Y%m%d'`.xbstream
```
并发4个线程压缩，并且采用流文件方式备份。

### 2.5 增量备份

Xtrabackup还支持增量备份，即在上一次备份的基础上，只备份发生新变化的数据。

发起增量备份前，得先有一份全量备份，才能有所谓的增量。
```
# 假定全备文件放在 /backup/GreatSQL/ 目录下
# 发起增量备份
$ xtrabackup --backup --incremental-basedir=/backup/GreatSQL/full/`date +'%Y%m%d'`/ --target-dir=/backup/GreatSQL/inc-backup/`date +'%Y%m%d%H'`/
```
查看`xtrabackup_info`和`xtrabackup_checkpoints`文件内容：
```
$ cat xtrabackup_info
...
innodb_from_lsn = 91534393  <--全备的LSN
innodb_to_lsn = 98570737  <--本次增背后的LSN
partial = N
incremental = Y  <--表示增备
format = file
compressed = N
encrypted = N

# 记录本次增备lsn相关信息
$ cat xtrabackup_checkpoints
backup_type = incremental
from_lsn = 91534393
to_lsn = 98570737
last_lsn = 98574379
flushed_lsn = 98574369
```

**建议：** 增量备份总是基于上一次全量备份的基础，不要基于上一次增量备份，这样在还原时会更方便。例如每天0点做一次全量备份，每小时做一次增量备份，执行增备时指定基于0点的全备。

### 2.6 全备还原

Xtrabackup备份文件不能直接用来拉起数据库，需要先做预处理：
```
$ cd /backup/GreatSQL/full/`date +'%Y%m%d'`/
$ xtrabackup --prepare --target-dir=./
...
Starting shutdown...
Log background threads are being closed...
Shutdown completed; log sequence number 176148580
Number of pools: 1
230825 16:54:30 completed OK!
```

预处理没问题的话，就可以将数据文件copy/move到数据库目录下，用于拉起。

目标目录需要先清空，否则会报错。
```
$ cd /backup/GreatSQL/full/`date +'%Y%m%d'`/
$ xtrabackup --copy-back --target-dir=./ --datadir=/data/GreatSQL
...
230825 17:01:08 [01] Copying ./xtrabackup_master_key_id to /data/GreatSQL/xtrabackup_master_key_id
230825 17:01:08 [01]        ...done
230825 17:01:08 completed OK!

# 如果不想copy，而是move的话，修改下即可
$ xtrabackup --move-back --target-dir=./ --datadir=/data/GreatSQL
...
230825 17:02:01 [01] Moving ./xtrabackup_master_key_id to /data/GreatSQL/xtrabackup_master_key_id
230825 17:02:01 [01]        ...done
230825 17:02:01 completed OK!
```

### 2.7 全量压缩备份还原

先将流式文件恢复成正常压缩文件
```
$ cd /backup/GreatSQL/full/`date +'%Y%m%d'`
$ xbstream -x < xbk-`date +'%Y%m%d'`.xbstream
```

再进行解压缩：
```
$ cd /backup/GreatSQL/full/`date +'%Y%m%d'`
$ xtrabackup --decompress --target-dir=.
```

然后和上面一样，先 *--prepare* 后，再将还原出来的数据文件 *--copy-back* 到数据库目录下拉起即可。

P.S，解压缩过程中需要安装 `qpress`，可以从[这里下载源码或二进制文件](https://github.com/PierreLvx/qpress)。

### 2.8 增量备份还原

假定每天0点做一次全备，每小时做一次相对0点的增备，现在需要还原到当天8:00的增备时间点。可以像下面这么做：

首先，在全备文件目录下执行下面的操作（不执行事务回滚操作）：
```
$ cd /backup/GreatSQL/full/20230825
$ xtrabackup --prepare --apply-log-only --target-dir=/backup/GreatSQL/full/20230825
...
Log background threads are being closed...
Shutdown completed; log sequence number 101667236
Number of pools: 1
230825 10:45:23 completed OK!
```

接下来应用增备日志：
```
$ xtrabackup --prepare --apply-log-only --target-dir=/backup/GreatSQL/full/20230825 --incremental-dir=/backup/GreatSQL/inc-backup/2023082508
...
incremental backup from 101659735 is enabled.
xtrabackup: cd to /backup/GreatSQL/full/20230825
xtrabackup: This target seems to be already prepared with --apply-log-only.
Number of pools: 1
xtrabackup: xtrabackup_logfile detected: size=8388608, start_lsn=(101688040)
xtrabackup: using the following InnoDB configuration for recovery:
xtrabackup:   innodb_data_home_dir = .
xtrabackup:   innodb_data_file_path = ibdata1:12M:autoextend
xtrabackup:   innodb_log_group_home_dir = /backup/GreatSQL/inc-backup/2023082508/
...
xtrabackup: page size for /backup/GreatSQL/inc-backup/2023082508//ibdata1.delta is 16384 bytes
Applying /backup/GreatSQL/inc-backup/2023082508//ibdata1.delta to ./ibdata1...
...
230825 10:49:58 completed OK!
```

之后将还原后的数据文件copy/move到目标目录即可：
```
$ xtrabackup --copy-back --target-dir=/backup/GreatSQL/full/20230825 --datadir=/data/GreatSQL
...
230825 17:26:52 [01] Copying ./xtrabackup_info to /data/GreatSQL/xtrabackup_info
230825 17:26:52 [01]        ...done
230825 17:26:52 completed OK!
```

**参考资料：**
- [XtraBackup](https://docs.percona.com/percona-xtrabackup/8.0/)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
