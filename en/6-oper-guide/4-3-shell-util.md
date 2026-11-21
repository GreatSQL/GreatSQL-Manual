# MySQL Shell Utilities Backup & Restore
---

This article introduces how to use MySQL Shell Utilities for backup and restore in the GreatSQL database.

MySQL Shell is a client tool that can be used to conveniently manage and operate MySQL. It supports multiple languages such as SQL, JavaScript, and Python, and also includes comprehensive APIs. MySQL Shell supports document-type and relational database modes. Document-type data can be managed through X DevAPI, and InnoDB Cluster, InnoDB ClusterSet, and InnoDB ReplicaSet can be managed through AdminAPI.

MySQL Shell provides a Utilities toolkit that can be used for database backup and restore. It supports data backup and restore at three different levels: instance level, Schema level, and table level. It also supports compatibility checks, parallel import/export, and backup file compression features, with backup and restore efficiency higher than mysqldump.

Before starting the backup and restore, you need to connect and log into the database first. Here, the local socket method is used for connection:
```bash
$ mysqlsh -S/data/GreatSQL/mysql.sock -uroot -p

MySQL Shell 8.0.32
...
Server version: 8.4.4-5  GreatSQL, Release 5, Revision 39b389cdf3b
No default schema selected; type \use <schema> to set one.

 MySQL  localhost  JS >
```

## Instance-Level Backup & Restore
### Backing Up the Entire Instance
Call the `util.dumpInstance` method to back up the entire instance:
```js
 MySQL  localhost  JS > util.dumpInstance("/data/backup/20230830")

Acquiring global read lock
Global read lock acquired
Initializing - done
2 out of 6 schemas will be dumped and within them 6 tables, 0 views, 1 routine.
1 out of 4 users will be dumped.
Gathering information - done
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Writing users DDL
Running data dump using 4 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done
Writing DDL - done
Writing table metadata - done
Starting data dump
101% (666.32K rows / ~656.38K rows), 794.80K rows/s, 155.72 MB/s uncompressed, 20.12 MB/s compressed
Dump duration: 00:00:01s
Total duration: 00:00:01s
Schemas dumped: 2
Tables dumped: 6
Uncompressed data size: 170.71 MB
Compressed data size: 23.23 MB
Compression ratio: 7.3
Rows written: 666320
Bytes written: 23.23 MB
Average uncompressed throughput: 164.78 MB/s
Average compressed throughput: 22.42 MB/s
```

**Note:** The target location of the backup */data/backup/20230830* must be an empty directory; otherwise, an error similar to the following is reported:
```log
Util.dumpInstance: Cannot proceed with the dump, the specified directory '/data/backup/20230830' already exists at the target location /data/backup/20230830 and is not empty. (ArgumentError)
```

When executing the backup, the default is 4 concurrent threads. The number of concurrent threads can be adjusted by setting the parameter `threads`, for example, the following command:
```js
util.dumpInstance("/data/backup/20230830", {threads: 8})
```

The shard size can also be specified during backup, controlled by the parameter `bytesPerChunk`. The default is 64MB per shard, for example, the following command:
```js
util.dumpInstance("/data/backup/20230830", {threads: 8, bytesPerChunk: "16M"})
```

If metadata such as stored procedures, stored functions, and events also need to be backed up, the corresponding parameters can be set, for example, the following command:
```js
util.dumpInstance("/data/backup/20230830", {events: true, triggers: true, routines: true})
```
The names indicate their meanings, corresponding respectively; this is not described in detail here.

### Restoring to a Brand-New Instance

First initialize a brand-new instance, and then use the above backup to complete the restore.

First, `local_infile=1` must be set; otherwise, the following error is reported when executing the restore:
```log
ERROR: The 'local_infile' global system variable must be set to ON in the target server, after the server is verified to be trusted.
Util.loadDump: local_infile disabled in server (MYSQLSH 53025)
```

Call the `util.loadDump` method to restore the entire instance:
```js
 MySQL  localhost  JS > util.loadDump("/data/backup/20230830", {excludeSchemas: ["sys_audit"]})

Loading DDL and Data from '/data/backup/20230830' using 4 threads.
Opening dump...
Target is GreatSQL 8.4.4-5. Dump was produced from GreatSQL 8.4.4-5
NOTE: Load progress file detected. Load will be resumed from where it was left, assuming no external updates were made.
You may enable the 'resetProgress' option to discard progress for this MySQL instance and force it to be completely reloaded.
Scanning metadata - done
Executing common preamble SQL
Executing DDL - done
Executing view DDL - done
Starting data load
2 thds loading | 100% (170.71 MB / 170.71 MB), 37.93 MB/s, 4 / 5 tables done
Executing common postamble SQL
Recreating indexes - done
6 chunks (666.32K rows, 170.71 MB) for 5 tables in 1 schemas were loaded in 4 sec (avg throughput 37.92 MB/s)
0 warnings were reported during the load.
```
Because GreatSQL initializes the `sys_audit` Schema used for the auditing feature by default, this Schema needs to be ignored when importing, while several system-level Schemas such as `mysql`/`sys`/`information_schema`/`performance_schema` are recognized and ignored by MySQL Shell, and no additional policy needs to be set. In other words, when restoring with `util.loadDump()`, the several system Schemas of the current instance are not overwritten.

When performing the restore, if the target instance already has corresponding data objects, an error similar to the following may be reported:
```js
 MySQL  localhost  JS > util.loadDump("/data/backup/20230830")

Loading DDL and Data from '/data/backup/20230830' using 4 threads.
Opening dump...
Target is GreatSQL 8.4.4-5 Dump was produced from GreatSQL 8.4.4-5
Scanning metadata - done
Checking for pre-existing objects...
ERROR: Schema `sys_audit` already contains a table named audit_log
ERROR: Schema `sys_audit` already contains a procedure named purge_audit_log
ERROR: Schema `greatsql` already contains a table named t1
ERROR: Schema `greatsql` already contains a table named t2
ERROR: Schema `greatsql` already contains a table named t3
ERROR: One or more objects in the dump already exist in the destination database. You must either DROP these objects or exclude them from the load.
Util.loadDump: While 'Scanning metadata': Duplicate objects found in destination database (MYSQLSH 53021)
```
At this time, either delete the corresponding data objects in the target instance first, or add the `excludeSchemas` parameter to set the ignore rules.

## Schema-Level Backup & Restore
### Backing Up an Entire Schema
Call the `util.dumpSchema` method to back up a single Schema:
```js
util.dumpSchemas(["greatsql"], "/data/backup/20230830/greatsql")
```

### Restoring an Entire Schema
Call the `util.loadDump` method to restore the Schema:
```js
util.loadDump("/data/backup/20230830", {includeSchemas: ["greatsql"]})
```
It can be seen that the method called is the same as when restoring the entire instance, except that the `includeSchemas` parameter is specified, i.e., only this Schema is restored and the rest are ignored.

## Table-Level Backup & Restore
### Backing Up a Single Table
Call the `util.dumpTables` method to back up a single Table:
```js
util.dumpTables("greatsql", ["t1", "t2", "t3"], "/data/backup/20230830/greatsql")
```
The role of the above command is to export the three tables *t1/t2/t3* in the database *greatsql*.

### Restoring a Single Table
Call the `util.loadDump` or `util.importTable` method to restore a single Table:
```js
util.loadDump("/data/backup/20230830/greatsql/", { includeTables: ["greatsql.t1", "greatsql.t2", "greatsql.t3"]})
```

Or
```js
util.importTable("/data/backup/20230830/greatsql/greatsql@t1@*.zst", {schema: "greatsql", table: "t1"})
```

**Note:** The `util.importTable` method can only restore single-table data, meaning an empty table needs to be created first, and multiple tables cannot be restored at the same time.

If an empty table has not been created first for the table to be restored, the following error is reported:
```log
Importing from multiple files to table `greatsql`.`t1` in MySQL Server at .%2Fmgr05%2Fmysql.sock using 8 threads
ERROR: [Worker002] greatsql@t1@@0.tsv.zst: MySQL Error 1146 (42S02): Table 'greatsql.t1' doesn't exist: LOAD DATA LOCAL INFILE '/data/backup/20230830/greatsql/greatsql@t1@@0.tsv.zst' INTO TABLE `greatsql`.`t1` FIELDS TERMINATED BY '     ' ESCAPED BY '\\' LINES STARTING BY '' TERMINATED BY '\n'
0% (0 bytes / 8.94 MB), 0.00 B/s
Total rows affected in greatsql.t1: Records: 0  Deleted: 0  Skipped: 0  Warnings: 0
Util.importTable: [Worker002] greatsql@t1@@0.tsv.zst: MySQL Error 1146 (42S02): Table 'greatsql.t1' doesn't exist: LOAD DATA LOCAL INFILE '/data/backup/20230830/greatsql/greatsql@t1@@0.tsv.zst' INTO TABLE `greatsql`.`t1` FIELDS TERMINATED BY '  ' ESCAPED BY '\\' LINES STARTING BY '' TERMINATED BY '\n' (RuntimeError)
```
From this perspective, `util.importTable` is more suitable for single-table restore in special situations.


**Reference materials:**

- [Instance Dump Utility, Schema Dump Utility, and Table Dump Utility](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-dump-instance-schema.html)
- [Dump Loading Utility](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-load-dump.html)
- [Is myloader faster for importing? Not really...](https://mp.weixin.qq.com/s/bTxXjNvCktUVu4el8kO7Sg)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
