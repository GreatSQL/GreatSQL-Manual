# Clone Compression & Incremental Backup

Starting from GreatSQL 8.0.32-26, Clone supports online full hot backup, incremental backup, and compressed backup.

For the basic usage of Clone, refer to the document: [Clone Backup & Restore](../6-oper-guide/4-5-clone.md). This article assumes that the GreatSQL database instance has been installed and configured, and the prerequisite grants have been completed.

## Clone Incremental Backup

### Full Backup

#### Backing Up a Remote Instance

Connect to the donor instance and execute the following SQL command to install the mysqlbackup component:

```sql
INSTALL COMPONENT "file://component_mysqlbackup";
```

Then connect to the recipient instance and execute the following SQL command to perform an online full hot backup:

```sql
CLONE INSTANCE FROM repl@172.16.16.10:3306
          IDENTIFIED BY 'GreatSQL@2023'
          DATA DIRECTORY = '/data/backup/clone-full/20240610'
          ENABLE PAGE TRACK;
```

The above command performs an online full hot backup of the remote instance *172.16.16.10:3306*, saves the backup data to the local directory */data/backup/clone-full/20240610*, and enables [InnoDB page tracking](#about-innodb-page-tracking) for subsequent incremental backups (if only a one-time full backup is needed, there is no need to enable *InnoDB page tracking*, so do not add the `ENABLE PAGE TRACK` clause).

When the `ENABLE PAGE TRACK` clause is added, the LSN at the end of the full backup task (*END_LSN*) and the LSN starting point for the next incremental backup task (*PAGE_TRACK_LSN*) are recorded when the full backup task ends. After each backup task ends, the metadata table `mysql.clone_history` can be queried to confirm the status of the backup task and obtain the position information of the backup task:

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

Here,
- `START_LSN`, indicates the LSN at the beginning of this backup task. For a full backup task, the value is 0.
- `PAGE_TRACK_LSN`, indicates the LSN at the end of this backup task with InnoDB page tracking enabled, which is used as the starting LSN for subsequent incremental backup tasks.
- `END_LSN`, indicates the LSN at the end of this backup task.

#### Backing Up a Local Instance

If a full backup of the local instance is performed, it is simpler. Execute a SQL command similar to the following:

```sql
-- Install the mysqlbackup component
INSTALL COMPONENT "file://component_mysqlbackup";

-- Start the Clone backup
CLONE LOCAL DATA
  DIRECTORY = '/data/backup/clone-full/20240610'
  ENABLE PAGE TRACK;
```

Similarly, if incremental backup is not needed, do not add the `ENABLE PAGE TRACK` clause.

### Incremental Backup

An incremental backup is based on the previous full or incremental backup, backing up all new data modified in the database up to the current time. Therefore, when performing a Clone incremental backup, the *PAGE_TRACK_LSN* generated at the end of the previous backup needs to be reflected in the backup command. It is the LSN recorded at the end of the previous full/incremental backup. All modified data with an LSN greater than this value falls within the backup scope of this incremental backup task.

#### Performing Incremental Backup of a Remote Instance

Connect to the recipient instance and execute the following SQL command to perform the incremental backup:

```sql
CLONE INSTANCE FROM repl@172.16.16.10:3306
  IDENTIFIED BY 'GreatSQL@2023'
  DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
  ENABLE PAGE TRACK START_LSN = 21083116;
```

The above command performs an incremental backup of the remote instance *172.16.16.10:3306* with the starting point *LSN = 21083116*, and the incremental backup files are stored in */data/backup/clone-incr/20240610-21083116*.

In addition to specifying the starting LSN, an incremental backup based on a local backup directory can also be specified:

```sql
CLONE INSTANCE FROM repl@172.16.16.10:3306
  IDENTIFIED BY 'GreatSQL@2023'
  DATA DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
  ENABLE PAGE TRACK
  INCREMENT BASED DIRECTORY = '/data/backup/clone-full/20240610';
```
The above command specifies that this incremental backup task is based on the existing backup directory */data/backup/clone-full/20240610*, automatically identifying the starting LSN before performing the incremental backup. The benefit of this method is avoiding hand-typing an incorrect *START_LSN* value.

#### Performing Incremental Backup of a Local Instance

Execute the following SQL command to complete the incremental backup of the local instance:

```sql
CLONE LOCAL DATA
  DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
  ENABLE PAGE TRACK START_LSN = 21083116;
```

Similarly, an incremental backup based on a local backup directory can also be specified:

```sql
CLONE LOCAL DATA
  DIRECTORY = '/data/backup/clone-incr/20240610-21083116'
  ENABLE PAGE TRACK
  INCREMENT BASED DIRECTORY = '/data/backup/clone-full/20240610';
```

## Restoring Clone Incremental Backup Data

### Viewing Backup Tasks

Before starting data recovery, first query all historical backup tasks to confirm the available backup set resources:

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

### Determining the Backup Chain

As shown in the query results above,
- According to the `CLONE_TYPE` field, of the three backup tasks: ID = 3 is a full backup; ID = 4 and 5 are both incremental backups;
- According to the `SOURCE` field, all three backups were of the local instance;
- According to the `DESTINATION` field, the data directories where these three backup tasks stored their files;
- Based on the `START_LSN`, `PAGE_TRACK_LSN` and `END_LSN` relationships of the three backup tasks above, the conclusion about these three backup tasks is: the backup chain relationship is ID:3 ==> ID:4 ==> ID:5;
- That is, a full backup of the current instance was first performed (ID = 3); then the first incremental backup was made based on the full backup (ID = 4); finally, the second incremental backup was made based on the first incremental backup (ID = 5).

### Restoring Backups (Full, Incremental)

After determining the backup chain, the recovery strategy can be selected: *full restore* or *full + incremental restore*. The restore process steps are as follows:

1. If only the full backup data needs to be restored, simply start the GreatSQL service based on the backup file set of ID = 3;
2. If subsequent incremental backups also need to be restored, point the parameter `--clone_incremental_dir` to the first incremental backup (ID = 4) directory based on the backup file set of ID = 3;
3. Wait until the first incremental backup (ID = 4) restore is completed;
4. If the second incremental backup (ID = 5) also needs to be restored, continue pointing the parameter `--clone_incremental_dir` to the second incremental backup (ID = 5) directory based on step 4, thus completing the restore of all full + incremental backup data.

When starting the *mysqld* program, the purpose of adding the parameter `--clone_incremental_dir` is to apply the incremental backup data to the `datadir`. After all incremental backup data has been applied, it exits automatically instead of continuing into the service startup phase.

A complete data recovery process is demonstrated below.

#### Restoring Based on Clone Full + Incremental Backups

::: danger Special Reminder
The restore process modifies the data of the full backup. If an error occurs midway, the data files may be corrupted. Therefore, always make a backup before each restore operation.

To avoid misoperation, accidental data deletion and other reasons, **it is strictly forbidden to operate directly on the original data backup directory. Instead, copy the backup files to the target working directory**.
:::

**1. First prepare the working directory for data recovery.**

```bash
# Create the working directory
mkdir -p /data/restore && chown -R mysql:mysql /data/restore/
```

**2. Copy the full backup files to the working directory**

```bash
# Copy the backup files to the target working directory (do not restore directly in the backup result directory; keep at least one copy of the original backup)
cp -rfp /data/backup/clone-full/20240618/ /data/restore/
chown -R mysql:mysql /data/restore/
```

**3. Start the database in the recovery working directory**

If subsequent incremental backup restore is not planned, you can stop here. Based on this working directory, prepare an appropriate `my.cnf` configuration file (refer to the sample below) and directly start a new database instance.

```bash
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

The above is a very simple my.cnf reference with only a few basic parameters set. More parameters can be added or adjusted according to the actual situation. For example, `lower_case_table_names` should remain consistent with the original instance. In the above configuration file, a line of *skip-networking* is added because this is a recovery test environment that does not intend to provide external services and is only used to test the recoverability of the backup.

If subsequent incremental backup restore is not planned, the GreatSQL service can be started directly:

```bash
cd /data/restore/20240618
/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf &
```

If the subsequent incremental backup restore is still needed, do not start the database instance yet and continue with the steps below.

**4. Continue with the incremental restore.**

Based on the above working directory, continue with the subsequent incremental backup file restore work.

Create the incremental restore target directory:

```bash
mkdir -p /data/restore/increment && chown -R mysql:mysql /data/restore/
```

Copy the first incremental backup files to the target directory:

```bash
cp -rfp /data/backup/clone-incr/20240618-202406181041/ /data/restore/increment
chown -R mysql:mysql /data/restore/
```

Restore the first incremental backup files

```bash
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf --clone_incremental_dir=/data/restore/increment/20240618-202406181041

[System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld (mysqld 8.0.32-26) starting as process 914938
[Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: f982e941-2d42-11ef-9a06-d08e7908bcb1.
[System] [MY-013576] [InnoDB] InnoDB initialization has started.
[Warning] [MY-012091] [InnoDB] Allocated tablespace ID 6 for sys_mac, old maximum was 0
```

At this point, the first incremental backup has been successfully restored to the full backup working directory.

**5. Continue with the restore of the second incremental backup.**

Copy the second incremental backup files to the target directory:

```bash
$ cp -rfp /data/backup/clone-incr/20240618-202406181350/ /data/restore/increment
$ chown -R mysql:mysql /data/restore/

# Restore the second incremental backup files
$ cd /data/restore/20240618
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf \
  --clone_incremental_dir=/data/restore/increment/20240618-202406181350

...
[System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld (mysqld 8.0.32-26) starting as process 915395
[System] [MY-013576] [InnoDB] InnoDB initialization has started.
[Warning] [MY-012091] [InnoDB] Allocated tablespace ID 6 for sys_mac, old maximum was 0
```

No error messages were generated during the restore, indicating everything went smoothly.

This completes the two incremental backups. Next, the database instance can be started.

**6. Start the database instance.**

Before starting the instance, confirm that the key parameter configurations in `my.cnf` are consistent with those of the original instance, especially `lower_case_table_names`, and make appropriate adjustments (refer to the sample below).

```bash
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

After the data instance starts, the [gt-checksum tool](https://gitee.com/GreatSQL/gt-checksum) or the `CHECKSUM` SQL command built into GreatSQL can be used to check whether the data in the original database instance and the restored instance is consistent, thereby confirming the success of the data recovery.

#### Restoring to an Arbitrary Point in Time Based on Binlog

After the restore work above, the data backup at the end time of the last backup task (assume this time is T1) has been restored. Combined with Binlog, data at any specified point in time can be restored (provided that this point in time is later than T1).

The steps to restore to an arbitrary point in time based on Binlog are as follows:

**1. Connect to the restored database instance and query the GTID information of executed transactions.**

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

This query result indicates that the GTID of transactions restored in this instance is *c42c1e3e-0f41-11ef-b6bf-d08e7908bcb1:1-3270*, the corresponding Binlog file is *binlog.000013*, and the log position is *29832341*.

**2. Connect to the original database instance and query the latest transaction GTID information.**

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
It can be seen that the Binlog file has been updated, generating more transaction logs.

**3. Specify the Binlog file and position to perform a point-in-time restore.**

```bash
# Enter the directory where the original database instance stores Binlog
cd /data/GreatSQL

# Call the mysqlbinlog tool, specify the start and stop positions, and parse the Binlog to complete the restore
mysqlbinlog ./binlog.000013 --start-position=29832341 \
  --stop-position=29838644 | mysql -S/data/restore/20240618/mysql.sock -uroot -p
```

When parsing the Binlog for restore, you can also specify a cut-off time:

```bash
mysqlbinlog ./binlog.000013 --start-position=29832341 \
  --stop-datetime="2024-06-18 16:00:00" | mysql -S/data/restore/20240618/mysql.sock -uroot -p
```

You can also omit the cut-off position, which means restoring to the latest transactions, for example:

```bash
mysqlbinlog ./binlog.000013 --start-position=29832341 | mysql -S/data/restore/20240618/mysql.sock -uroot -p
```

Using Clone online hot backup and incremental backup combined with Binlog greatly improves the data recovery reliability of GreatSQL, meeting the requirement of restoring to any specified point in time.

## Clone Compressed Backup

Starting from GreatSQL 8.0.32-26, Clone backup file compression is supported. Simply set the parameter `clone_file_compress`, for example set to `clone_file_compress = CLONE_FILE_COMPRESS_ZSTD`. This feature is not enabled by default.

There are several points to note about Clone compressed backup:

1. This feature is only supported in GreatSQL 8.0.32-26 and above, meaning the recipient of the Clone backup must be version 8.0.32-26 or above.

2. If a remote instance is backed up with Clone, this parameter must be set on the recipient instance.

3. Two compression algorithms are supported: *zstd* and *lz4*. *zstd* is recommended; it is a fast lossless compression algorithm designed for real-time compression scenarios and offers a better compression ratio.

4. The parameter `clone_file_compress` is different from `clone_enable_compression`. The former determines whether backup files are compressed; the latter determines whether compression is enabled when Clone transmits data over the network. The two are independent of each other.

5. Enabling Clone backup compression and [Clone backup encryption](./5-4-security-clone-encrypt.md) at the same time is not supported.

### Starting a Compressed Backup

The following demonstrates a compressed backup of the local instance.

#### Enabling the Backup File Compression Feature

Execute the following SQL command to enable the Clone compression feature:
```sql
SET GLOBAL clone_file_compress = CLONE_FILE_COMPRESS_ZSTD;
```

#### Performing a Clone Backup

Execute the following SQL command to perform a Clone backup with page tracking enabled:
```sql
-- Back up the local instance and enable page tracking
CLONE LOCAL DATA DIRECTORY = '/data/backup/clone-compressed/20240708'
  ENABLE PAGE TRACK;
```

View the backup files to confirm the compression result

```bash
$ ls -la /data/backup/clone-compressed/20240708

...
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

In the Clone compressed backup file directory, each tablespace has a corresponding data file with the *.delta* suffix. The reason these files are generated is that after the *FILE COPY* stage of a full Clone compressed backup ends, the data files have been compressed. During the *PAGE COPY* stage, because their positions in the original files cannot be found, the data needs to be stored separately in the *.delta* files.

During data recovery, GreatSQL treats these *.delta* files as incremental backup files for recovery processing.

#### Performing an Incremental Backup (Compressed) Based on the Full Backup

Execute the following SQL command to complete the (compressed) incremental backup:
```sql
CLONE LOCAL DATA
  DIRECTORY = '/data/backup/clone-compressed-incr/20240708-202407081218'
  ENABLE PAGE TRACK
  INCREMENT BASED DIRECTORY '/data/backup/clone-compressed/20240708';
```

View the backup files to confirm the compression result

```bash
$ ls -la /data/backup/clone-compressed-incr/20240708-2024070812

...
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

### Restoring Compressed Backups

#### Setting Environment Variables

Decompression requires the `zstd_decompress` and `lz4_decompress` decompression tools provided by GreatSQL. They are located in the *basedir/bin* directory and need to be added to the environment variable **PATH**, otherwise the full path must be specified:

```bash
$ export PATH=$PATH:/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin
$ which zstd_decompress

..
/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/zstd_decompress
```

#### Decompressing Backup Files

Before restoring using the compressed backup files, they need to be decompressed first:

```bash
# No matter what, do not forget to make another backup to avoid misoperation affecting the original backup files
$ cp -rfp /data/backup/clone-compressed/20240708 /data/restore/

# Decompress
$ cd /data/restore/20240618
$ for f in `find . -iname "*\.zstd"`; do zstd_decompress $f $(dirname $f)/$(basename $f .zstd); rm -f $f; done

...
decompress file: ./sys/sys_config.ibd.zstd
decompress file: ./sys/dbms_alert_info.ibd.zstd
...
decompress file: ./mysql/clone_history.ibd.delta.zstd
decompress file: ./#innodb_redo/#ib_redo0.zstd

# Confirm the decompressed files
$ ls -la

...
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

The above assumes that the backup compression uses the *zstd* method. If *lz4* is used, change it to something like the following (modify the file suffix and the decompression tool called):

```bash
# Decompress
cd /data/restore/20240618
for f in `find . -iname "*\.lz4"`; do lz4_decompress $f $(dirname $f)/$(basename $f .lz4); rm $f; done
```

#### Decompressing Incremental Backup Files

If the compressed incremental backup also needs to be restored, decompression must be performed first as well:

```bash
# Reminder again: make a backup first and do not operate directly on the original backup files
$ cp -rfp /data/backup/clone-compressed-incr/20240708-2024070812 /data/restore/increment

# Decompress
$ cd /data/restore/increment/20240708-2024070812
$ for f in `find . -iname "*\.zstd"`; do zstd_decompress $f $(dirname $f)/$(basename $f .zstd); rm -f $f; done

...
decompress file: ./ibdata1.delta.zstd
...
decompress file: ./sys/dbms_alert_info.ibd.delta.zstd
```

#### Restoring a Full Compressed Backup

Prepare an appropriate my.cnf configuration file, then apply the *.delta* files to complete the full backup restore:

```bash
$ cd /data/restore/20240708

# Check and confirm the content of the my.cnf file
$ cat my.cnf

[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/restore/20240708
user = mysql
socket = mysql.sock
skip-networking
```
The content of the my.cnf configuration file can be adjusted as needed.

If the incremental backup files still need to be restored, skip to the next step [Restoring an Incremental Compressed Backup](#restoring-an-incremental-compressed-backup).

If the incremental backup files do not need to be restored, use the directory after restoring the full compressed backup as the `datadir` and prepare to start the *mysqld* program.

Special attention should be paid here: during the first restore of the full compressed backup, when starting the *mysqld* program, both `datadir=/data/restore/20240708` and `clone_incremental_dir=/data/restore/20240708` must be specified, so that the *.delta* files can be restored. Similar to the following:

```bash
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf \
  --clone_incremental_dir=/data/restore/20240708

...
[Warning] [MY-010097] [Server] Insecure configuration for --secure-log-path: Current value does not restrict location of generated files. Consider setting it to a valid, non-empty path.
[System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.17-x86_64/bin/mysqld (GreatSQL 8.0.32-26) starting as process 1637442
[Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: 0c2b81ce-3cfd-11ef-be21-d08e7908bcb1.
[System] [MY-013576] [InnoDB] InnoDB initialization has started.
[Warning] [MY-012091] [InnoDB] Allocated tablespace ID 7 for sys_audit, old maximum was 0
```

::: tip Tip
That is, when restoring Clone compressed backup files, the restore directory should also be treated as the incremental backup directory to complete the restore of the .delta files.
:::

The content of the my.cnf configuration file can be adjusted as needed.

If no errors occurred during the process, the compressed full backup restore was successful.

#### Restoring an Incremental Compressed Backup

After decompressing the incremental compressed backup files, prepare an appropriate my.cnf configuration file, and with the full backup file directory, execute the application of the incremental backup files:

```bash
$ cd /data/restore/20240618

# Check and confirm the content of the my.cnf file
$ cat my.cnf

[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/restore/20240618
user = mysql
socket = mysql.sock
skip-networking
```

The content of the my.cnf configuration file can be adjusted as needed.

Next, start the *mysqld* program, pointing the `--clone_incremental_dir` parameter to the incremental backup restore data directory. After all incremental backup data has been applied, the process exits automatically instead of continuing into the service startup phase.

```bash
# Start GreatSQL, pointing the parameter --clone_incremental_dir to the incremental restore files
$ /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf \
  --clone_incremental_dir=/data/restore/20240618-202406181530

...
[Warning] [MY-010097] [Server] Insecure configuration for --secure-log-path: Current value does not restrict location of generated files. Consider setting it to a valid, non-empty path.
[System] [MY-010116] [Server] /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.17-x86_64/bin/mysqld (mysqld 8.0.32-23)
[Warning] [MY-010075] [Server] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: d1405fbb-3cf7-11ef-8d84-d08e7908bcb1.
[System] [MY-013576] [InnoDB] InnoDB initialization has started.
[Warning] [MY-012091] [InnoDB] Allocated tablespace ID 7 for sys_audit, old maximum was 0
```

No error messages were generated during the restore, indicating everything went smoothly.

This completes the incremental backup file restore. If there are multiple compressed incremental backup files, repeat the **decompress & apply** operations above.

#### Starting the Database Instance

After all full and incremental backup files have been applied, the database instance can be started:

```bash
cd /data/restore/20240618
/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=./my.cnf &
```
The content of the my.cnf configuration file can be adjusted as needed.

If no errors occurred during startup, the compressed full + incremental backup restore was successful.

At this point, a complete Clone compressed full + incremental backup and the subsequent data recovery work are completed.

### Compressed Backup Effectiveness Test

Use the `sysbench` tool to populate 5 test tables, each with 20 million rows of data. After comparative testing, the data compression ratios are as follows:

| Compression algorithm | Original data size | Clone | Xtrabackup| Clone compression ratio| Xtrabackup compression ratio|
| --- | --- |--- | --- | --- | --- |
| zstd| 23Gb |9.6Gb |9.6Gb |2.40 | 2.40 |
| lz4 | 23Gb |16.1Gb |17Gb |1.43 | 1.35 |

It can be seen that the compression effect of Clone backup is quite good.

## About InnoDB Page Tracking

When the `ENABLE PAGE TRACK` clause is added to a Clone backup task, it indicates that the *page tracking* feature is enabled. Each time the instance flushes data to disk, the *page tracking* system records the *tablespace id* and *page no* of the flushed pages. This operation is performed asynchronously by a background thread and does not affect the performance of front-end user business. For more information about *page tracking*, see [InnoDB Clone and page tracking](https://dev.mysql.com/blog-archive/innodb-clone-and-page-tracking).

### Enabling Page Tracking

When performing a Clone backup, add the `ENABLE PAGE TRACK` clause to enable *page tracking*:

```sql
CLONE ... ENABLE PAGE TRACK;
```

You can also call the `mysqlbackup_page_track_set()` function to enable *page tracking*:

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

Passing the parameter *true* to the function indicates enabling *page tracking*, and the return value of the function is the current latest LSN.

After enabling *page tracking*, continue writing new data or updating data to the database. Observe the LSN changes after a period of time:

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
-- Execute the INSERT ... SELECT operation multiple times repeatedly
greatsql> INSERT INTO t SELECT 0, rand()*10240000, rand() FROM t;

-- Observe the latest LSN
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

After enabling *page tracking*, new files recording the *tablespace id* and *page no* changes are generated under the `%datadir%/#ib_archive` directory:

```bash
$ find ./#ib_archive/ -type f | xargs ls -l

...
-rw-r----- 1 mysql mysql 49152 Jun 18 09:50 ./#ib_archive/ib_dblwr/dblwr_0
-rw-r----- 1 mysql mysql     0 Jun 17 17:55 ./#ib_archive/page_group_21483396843/durable
-rw-r----- 1 mysql mysql 32768 Jun 18 09:39 ./#ib_archive/page_group_21483396843/ib_page_0
-rw-r----- 1 mysql mysql     0 Jun 18 09:45 ./#ib_archive/page_group_21528636229/active
-rw-r----- 1 mysql mysql     0 Jun 18 09:44 ./#ib_archive/page_group_21528636229/durable
-rw-r----- 1 mysql mysql 65536 Jun 18 09:50 ./#ib_archive/page_group_21528636229/ib_page_0
```

### Disabling Page Tracking

*page tracking* can be disabled by calling the `mysqlbackup_page_track_set()` function:

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
Passing the parameter *false* to the function indicates disabling *page tracking*, and the return value of the function is the current latest LSN.

### Purging Page Tracking Historical Data

Before purging *page tracking* historical data, *page tracking* must be disabled first, and then the `mysqlbackup_page_track_purge_up_to()` function is called to purge the historical data.

```sql
-- Disable page tracking
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

-- Call the purge function again, returning the maximum LSN
greatsql> SELECT mysqlbackup_page_track_purge_up_to(21635193850);
+-------------------------------------------------+
| mysqlbackup_page_track_purge_up_to(21635193850) |
+-------------------------------------------------+
|                             9223372036854775807 |
+-------------------------------------------------+
```

Here, *21635193850* is the cut-off LSN specified for purging *page tracking* data. To purge all *page tracking* historical data, specify *LSN = 9223372036854775807*, which is the maximum value of LSN.

View the related files in the `%datadir%/#ib_archive` directory again:

```bash
$ find ./#ib_archive/ -type f | xargs ls -l

-rw-r----- 1 mysql mysql 49152 Jun 18 09:55 ./#ib_archive/ib_dblwr/dblwr_0
```
It can be seen that the related data files have all been purged.

After enabling *page tracking*, if incremental backup is no longer needed later, it is best to disable *page tracking* and purge the historical data using the above method.

## New Parameters

The following parameters are newly added in GreatSQL for Clone backup.

- clone_file_compress

| System Variable Name | clone_file_compress |
| --- | --- | 
| Variable Scope | Global |
| Dynamic Variable | Yes |
| Permitted Values | [CLONE_FILE_COMPRESS_NONE | CLONE_FILE_COMPRESS_ZSTD | CLONE_FILE_COMPRESS_LZ4] |
| Default | CLONE_FILE_COMPRESS_NONE |
| Description | Selects the Clone file compression algorithm, default: not enabled. Two compression algorithms are supported:<br/>zstd (CLONE_FILE_COMPRESS_ZSTD)<br/>lz4 (CLONE_FILE_COMPRESS_LZ4)|

- clone_file_compress_zstd_level

| System Variable Name | clone_file_compress_zstd_level |
| --- | --- | 
| Variable Scope | Global |
| Dynamic Variable | Yes |
| Permitted Values | [1 - 19] |
| Default | 1 |
| Description | The zstd compression level, an integer in the range [1 - 19], default is 1|

- clone_file_compress_chunk_size

| System Variable Name | clone_file_compress_chunk_size |
| --- | --- | 
| Variable Scope | Global |
| Dynamic Variable | Yes |
| Permitted Values | [1024, ULLONG_MAX] |
| Default | 64Kb |
| Description | The working buffer size of the data compression threads (in bytes), default: 64Kb |

- clone_file_compress_threads

| System Variable Name | clone_file_compress_threads |
| --- | --- | 
| Variable Scope | Global |
| Dynamic Variable | Yes |
| Permitted Values | [1 - 128] |
| Default | 4 |
| Description | The number of parallel threads for data compression, an integer in the range [1 - 128], default: 4 |

- clone_incremental_dir

| System Variable Name | clone_incremental_dir |
| --- | --- | 
| Variable Scope | Global |
| Dynamic Variable | No |
| Permitted Values |  |
| Default |  |
| Description | Specifies the incremental backup file path used for data recovery |


## Metadata Tables

### Clone Backup History Table

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

Here,
- `PID`: corresponds to the ID column of `information_schema.PROCESSLIST`. To terminate the current clone operation, execute `KILL [QUERY] PID`.
- `CLONE_TYPE`: the type of the Clone operation, including: full clone, increment clone.
- `STATE`: the state of the Clone operation, including: Not Started, In Progress, Completed, Failed.
- `BEGIN_TIME`, `END_TIME`: the start and end time of the Clone operation.
- `ERROR_MESSAGE`: the specific error message.
- `SOURCE`: the address of the donor instance. If it is *LOCAL INSTANCE*, it represents a local Clone operation.
- `DESTINATION`: the local directory where Clone backup files are stored.
- `START_LSN`: the LSN at the start of the Clone.
- `PAGE_TRACK_LSN`: the LSN of the newly started *page tracking*.
- `END_LSN`: the LSN at the end of the Clone.
- `BINLOG_FILE`, `BINLOG_POSITION`, `GTID_EXECUTED`: Binlog position related parameters, currently unused.

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
It can be seen that among the two backup tasks with IDs 3 and 4, one is a full backup (*full clone*) and the other is an incremental backup (*increment clone*), and both have been completed (*Completed*).

### Backup Status Monitoring Views

In GreatSQL, the system views `clone_status` and `clone_progress` under `performance_schema` have been enhanced to serve as status monitoring for incremental backup operations.

These views can only retain records of the most recent 5 backup operations. For more details, see: [Performance Schema Clone Tables](https://dev.mysql.com/doc/mysql-perfschema-excerpt/8.0/en/performance-schema-clone-tables.html).

#### Querying Backup Status

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

If the incremental backup task with ID = 4 needs to be terminated, use the following SQL command:

```sql
-- In the above example, the incremental backup task with ID = 4 has been completed (Completed) and cannot be terminated afterwards.
KILL 11;
```

Note: A terminated backup task cannot be restarted, and backup task pausing is currently not supported either.

#### Querying Backup Progress

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

It can be seen that the complete processes of the two backup tasks with IDs 3 and 4 are:
- `DROP DATA`, first clears the target directory where backup files are stored.
- `FILE COPY`, copies files.
- `PAGE COPY`, copies the changed data pages.
- `REDO COPY`, copies the changed Redo Log.
- `FILE SYNC`, the files cloned locally are flushed and written to disk.
- `RESTART`, whether this backup file set has undergone a restart.
- `RECOVERY`, whether this backup file set has been used for recovery.

In GreatSQL, Clone makes it easier to perform full or incremental backups of local or remote instances, greatly improving the convenience and reliability of the database.

## Notes

- During a Clone backup, it is best not to perform DDL operations on tables at the same time, to avoid severe MDL waits that may cause business system unavailability or backup task abnormalities.
- To avoid serious impact on the database system load, do not initiate multiple concurrent Clone backup requests at the same time.


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
