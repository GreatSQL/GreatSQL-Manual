# Physical Backup & Restore
---

This article introduces how to perform physical backup and restore for the GreatSQL database.

## File-Level Physical Backup & Restore
Physical backup can be performed in several ways at the file system layer:
- During downtime maintenance, copy the entire data file directory at the file system layer, i.e., the directory pointed to by `datadir`, including files such as ibdata1, Redo, and Undo.
- During downtime maintenance of a replica node in the source-replica replication architecture, copy the entire data file directory.
- During downtime maintenance of a replica node in the MGR architecture, copy the entire data file directory.

::: warning Note

1. If a physical backup is to be performed at the file system layer, it is best to set `innodb_fast_shutdown=0` before downtime maintenance, and then shut down the instance, to ensure that a clean data file set is obtained.
2. When performing a physical backup, the corresponding my.cnf configuration file must also be backed up, because the relevant parameter options must remain consistent during restore.
3. If there is a `mysqld-auto.cnf` configuration file under the `datadir` directory, it must also be backed up.
4. The `auto.cnf` file under the `datadir` directory records the `server_uuid` of this instance. If the original value does not need to be preserved during restore, this file can be deleted, and a new `server_uuid` is automatically generated when the instance starts. It is usually also not recommended to keep it, because it may conflict with existing instances.
:::

When restore is needed, directly copy the physical backup files to the corresponding directory, modify the file owner and permission mode, confirm that the configuration in the corresponding my.cnf is correct, and then directly start the GreatSQL service process.

## xtrabackup Backup & Restore
`XtraBackup` is an open source and free backup tool produced by Percona. It can conveniently perform online hot backup of MySQL databases, and supports compression, encryption, streaming backup, and other methods.

This is the [download address](https://www.percona.com/downloads/Percona-XtraBackup-LATEST/) of the `Xtrabackup` installation package, and this is the [documentation address](https://docs.percona.com/percona-xtrabackup).

The version selected in this article's environment is XtraBackup 8.0.32-27.

You can choose the RPM package or the binary package according to personal preference. The installation steps are skipped.

The `Xtrabackup` backup process is roughly as follows:

1. Initiate the backup, initialization checks, etc.;
2. Back up the system tablespace file ibdata1 and the .ibd files of each tablespace;
3. Back up other non-InnoDB tables;
4. Execute the operation `FLUSH NO_WRITE_TO_BINLOG BINARY LOGS` to flush binlog;
5. Obtain the latest Redo Log LSN and binlog position information from `p_s.log_status`;
6. Back up the latest binlog files (the new binlog files generated after the flush in step 4);
7. Update the binlog.index file in the backup target directory;
8. Update the xtrabackup_binlog_info file;
9. Execute the operation `FLUSH NO_WRITE_TO_BINLOG ENGINE LOGS`;
10. Back up the ib_buffer_pool file;
11. Backup ends.

In Xtrabackup 2.X and earlier versions, step 5 directly executes FTWRL, regardless of whether there are only InnoDB tables.

In GreatSQL 8.0 (with XtraBackup correspondingly upgraded to 8.x), if only InnoDB tables exist, FTWRL is no longer executed; instead, metadata is read directly.

### Regular Full Backup

```bash
$ xtrabackup --backup --datadir=/data/GreatSQL/ --target-dir=/backup/GreatSQL/full/`date +'%Y%m%d'`/

...
xtrabackup: Transaction log of lsn (46865086) to (46876581) was copied.
230822 10:24:59 completed OK!

$ ls /backup/GreatSQL/`date +'%Y%m%d'`/

backup-my.cnf   binlog.000007  mysql.ibd                      db1   undo_001                xtrabackup_checkpoints  xtrabackup_tablespaces
ib_buffer_pool  binlog.index   mysql_innodb_cluster_metadata  sys   undo_002                xtrabackup_info
ibdata1         mysql          performance_schema             db2   xtrabackup_binlog_info  xtrabackup_logfile
```

The roles of several options are respectively:

- `--backup`, specifies that this operation is a backup
- `--datadir`, specifies the datadir of the database
- `--target-dir`, specifies the target directory of this backup

After the backup is completed, the roles of several files in the target directory are respectively:

- backup-my.cnf, records the xtrabackup related option parameters executed, used for subsequent restore
- xtrabackup_binlog_info, records the binlog and GTID information at the time of backup, used to set source-replica replication related options after restoring the data as a replica node
- xtrabackup_checkpoints, records the Redo Log LSN and checkpoint information of this backup, used to determine the transaction recovery point during full/incremental data restore
- xtrabackup_info, records the general information of this backup

### Backing Up Only Some Database Tables

```bash
$ xtrabackup --backup --datadir=/data/GreatSQL/ --tables="db1.t_user_*,db2.t_log_*" --target-dir=/backup/GreatSQL/partial/`date +'%Y%m%d'`/

...
xtrabackup: Transaction log of lsn (48318000) to (48324707) was copied.
230822 10:45:46 completed OK!

$ ls /backup/GreatSQL/`date +'%Y%m%d'`/
backup-my.cnf   ibdata1        binlog.index  db1  undo_001  xtrabackup_binlog_info  xtrabackup_info     xtrabackup_tablespaces
ib_buffer_pool  binlog.000006  mysql.ibd     db2  undo_002  xtrabackup_checkpoints  xtrabackup_logfile
```

### Compressed Backup

Add the `--compress` option on the original basis, for example:
```bash
xtrabackup --backup --compress --datadir=/data/GreatSQL/ --target-dir=/backup/GreatSQL/full/`date +'%Y%m%d'`/
```
Generally speaking, there is a compression ratio of about 4 times.

### Parallel Compression and Streaming Backup
```bash
xtrabackup --backup --stream=xbstream --compress --compress-threads=4 --datadir=/data/GreatSQL/ > /backup/GreatSQL/full/xbk-`date +'%Y%m%d'`.xbstream
```
Compress with 4 concurrent threads, and use the streaming file method for backup.

### Incremental Backup

XtraBackup also supports incremental backup, i.e., based on the previous backup, only the newly changed data is backed up.

Before initiating an incremental backup, a full backup must first exist; only then can there be so-called increments.
```bash
# Assume the full backup files are placed in the /backup/GreatSQL/ directory
# Initiate an incremental backup
xtrabackup --backup --incremental-basedir=/backup/GreatSQL/full/`date +'%Y%m%d'`/ --target-dir=/backup/GreatSQL/inc-backup/`date +'%Y%m%d%H'`/
```

View the contents of the `xtrabackup_info` and `xtrabackup_checkpoints` files:
```bash
$ cat xtrabackup_info

...
innodb_from_lsn = 91534393  <--The LSN of the full backup
innodb_to_lsn = 98570737  <--The LSN after this incremental backup
partial = N
incremental = Y  <--Indicates incremental backup
format = file
compressed = N
encrypted = N

# Record the lsn related information of this incremental backup
$ cat xtrabackup_checkpoints
backup_type = incremental
from_lsn = 91534393
to_lsn = 98570737
last_lsn = 98574379
flushed_lsn = 98574369
```

**Suggestion:** Incremental backups are always based on the previous full backup, not on the previous incremental backup. This makes restore more convenient. For example, do a full backup at 0:00 every day and an incremental backup every hour. When executing the incremental backup, specify the full backup at 0:00 as the basis.

### Full Backup Restore

XtraBackup backup files cannot be used directly to start the database; preprocessing is needed first:
```bash
$ cd /backup/GreatSQL/full/`date +'%Y%m%d'`/
$ xtrabackup --prepare --target-dir=./

...
Starting shutdown...
Log background threads are being closed...
Shutdown completed; log sequence number 176148580
Number of pools: 1
230825 16:54:30 completed OK!
```

If the preprocessing is fine, the data files can be copied/moved to the database directory to start the database.

The target directory must be cleared first; otherwise, an error is reported.
```bash
$ cd /backup/GreatSQL/full/`date +'%Y%m%d'`/
$ xtrabackup --copy-back --target-dir=./ --datadir=/data/GreatSQL

...
230825 17:01:08 [01] Copying ./xtrabackup_master_key_id to /data/GreatSQL/xtrabackup_master_key_id
230825 17:01:08 [01]        ...done
230825 17:01:08 completed OK!

# If you want to move instead of copy, just modify it
$ xtrabackup --move-back --target-dir=./ --datadir=/data/GreatSQL

...
230825 17:02:01 [01] Moving ./xtrabackup_master_key_id to /data/GreatSQL/xtrabackup_master_key_id
230825 17:02:01 [01]        ...done
230825 17:02:01 completed OK!
```

### Full Compressed Backup Restore

First restore the streaming file to a normal compressed file
```bash
cd /backup/GreatSQL/full/`date +'%Y%m%d'`
xbstream -x < xbk-`date +'%Y%m%d'`.xbstream
```

Then decompress it:
```bash
cd /backup/GreatSQL/full/`date +'%Y%m%d'`
xtrabackup --decompress --target-dir=.
```

Then, like above, first *--prepare*, and then *--copy-back* the restored data files to the database directory to start the database.

::: tip Tip
During the decompression process, `qpress` needs to be installed. It can be [downloaded from here (source code or binary)](https://github.com/PierreLvx/qpress).
:::

### Incremental Backup Restore

Assume a full backup is done at 0:00 every day and an incremental backup relative to 0:00 every hour. Now it is necessary to restore to the incremental backup time point of 8:00 on the day. It can be done as follows:

First, execute the following operation in the full backup file directory (without performing transaction rollback):
```bash
$ cd /backup/GreatSQL/full/20230825
$ xtrabackup --prepare --apply-log-only --target-dir=/backup/GreatSQL/full/20230825

...
Log background threads are being closed...
Shutdown completed; log sequence number 101667236
Number of pools: 1
230825 10:45:23 completed OK!
```

Next, apply the incremental backup log:
```bash
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

After that, copy/move the restored data files to the target directory:
```bash
$ xtrabackup --copy-back --target-dir=/backup/GreatSQL/full/20230825 --datadir=/data/GreatSQL

...
230825 17:26:52 [01] Copying ./xtrabackup_info to /data/GreatSQL/xtrabackup_info
230825 17:26:52 [01]        ...done
230825 17:26:52 completed OK!
```

**Reference materials:**
- [XtraBackup](https://docs.percona.com/percona-xtrabackup/8.0/)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
