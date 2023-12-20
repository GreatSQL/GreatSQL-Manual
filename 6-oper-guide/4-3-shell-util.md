# MySQL Shell Utilities备份恢复
---

本文介绍GreatSQL数据库如何采用MySQL Shell Utilities进行备份恢复。

MySQL Shell是一个客户端工具，可用于方便管理和操作MySQL，支持SQL、JavaScript、Python等多种语言，也包括完善的API。MySQL Shell支持文档型和关系型数据库模式，通过X DevAPI可以管理文档型数据，通过AdminAPI可以管理InnoDB Cluster、InnoDB ClusterSet及InnoDB ReplicaSet等。

MySQL Shell中提供了Utilities工具包，可用于对数据库进行备份和恢复，可支持实例级、Schema级、数据表级三个不同级别的数据备份和恢复功能。并且支持兼容性检查、并行导入导出、以及备份文件压缩特性，备份恢复效率比mysqldump更高。

在开始进行备份和恢复前，要先连接登入数据库，这里采用通过本地socket方式连接：
```
$ mysqlsh -S/data/GreatSQL/mysql.sock -uroot -p
MySQL Shell 8.0.32
...
Server version: 8.0.32-24  GreatSQL, Release 24, Revision 3714067bc8c
No default schema selected; type \use <schema> to set one.
 MySQL  localhost  JS >
```

## 1. 实例级备份恢复
### 1.1 备份整个实例
调用 `util.dumpInstance` 方法备份整个实例：
```
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

**注意：** 备份的目标位置 */data/backup/20230832* 必须是个空目录才行，否则会报告类似下面的错误：
```
Util.dumpInstance: Cannot proceed with the dump, the specified directory '/data/backup/20230830' already exists at the target location /data/backup/20230830 and is not empty. (ArgumentError)
```

执行备份时，默认并发4个线程，可以通过设置参数 `threads` 调整并发线程数，例如：
```
 MySQL  localhost  JS > util.dumpInstance("/data/backup/20230830", {threads: 8})
```

还可以在备份时指定分片大小，由参数 `bytesPerChunk` 控制，默认每个分片是64M，例如：
```
 MySQL  localhost  greatsql  JS > util.dumpInstance("/data/backup/20230830", {threads: 8, bytesPerChunk: "16M"})
```

如果要同时备份存储过程、存储函数、event等元数据，可以设置相应的参数，例如：
```
 MySQL  localhost  greatsql  JS > util.dumpInstance("/data/backup/20230830", {events: true, triggers: true, routines: true})
```
见名知意，分别对应即可，这里不赘述。

### 1.2 恢复到全新实例

先初始化一个全新实例，再利用上面的备份完成恢复。

首先，要先设置 `local_infile=1`，否则执行恢复时会报告下面的错误：
```
ERROR: The 'local_infile' global system variable must be set to ON in the target server, after the server is verified to be trusted.
Util.loadDump: local_infile disabled in server (MYSQLSH 53025)
```

调用 `util.loadDump` 方法恢复整个实例：
```
 MySQL  localhost  JS > util.loadDump("/data/backup/20230830", {excludeSchemas: ["sys_audit"]})
Loading DDL and Data from '/data/backup/20230830' using 4 threads.
Opening dump...
Target is MySQL 8.0.32-24. Dump was produced from MySQL 8.0.32-24
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
因为GreatSQL默认会初始化 `sys_audit` 这个用于审计功能的Schema，导入时要设置忽略这个Schema，而 `mysql`/`sys`/`information_schema`/`performance_schema` 等几个系统级Schema会被MySQL Shell识别并忽略，无需额外设置策略。也就是说，利用`util.loadDump()`进行恢复时，并不会覆盖当前实例中的几个系统Schema。

在进行恢复时，如果目标实例中已有对应的数据对象，则可能会报告类似下面的错误：
```
 MySQL  localhost  JS > util.loadDump("/data/backup/20230830")
Loading DDL and Data from '/data/backup/20230830' using 4 threads.
Opening dump...
Target is MySQL 8.0.32-24. Dump was produced from MySQL 8.0.32-24
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
这时要么先将目标实例中对应的数据对象删除，要么加上 `excludeSchemas` 参数设置忽略规则。

## 2. Schema级备份恢复
### 2.1 备份整个Schema
调用 `util.dumpSchema` 方法备份单个Schema：
```
 MySQL  localhost  greatsql  JS > util.dumpSchemas(["greatsql"], "/data/backup/20230830/greatsql")
```

### 2.2 恢复整个Schema
调用 `util.loadDump` 方法恢复Schema：
```
 MySQL  localhost  JS > util.loadDump("/data/backup/20230830", {includeSchemas: ["greatsql"]})
```
可以看到，和恢复整个实例时调用的方法是一样的，只不过是指定了 `includeSchemas` 参数，也就是只恢复该Schema，其余的忽略。

## 3. Table级备份恢复
### 3.1 备份单个Table
调用 `util.dumpTables` 方法备份单个Table：
```
 MySQL  localhost  greatsql  JS > util.dumpTables("greatsql", ["t1", "t2", "t3"], "/data/backup/20230830/greatsql")
```
上述命令的作用是导出数据库 *greatsql* 中的 *t1/t2/t3* 三个表。

### 3.2 恢复单个Table
调用 `util.loadDump` 或 `util.importTable` 方法恢复单个Table：
```
 MySQL  localhost  JS > util.loadDump("/data/backup/20230830/greatsql/", { includeTables: ["greatsql.t1", "greatsql.t2", "greatsql.t3"]})
```

或者
```
 MySQL  localhost  JS > util.importTable("/data/backup/20230830/greatsql/greatsql@t1@*.zst", {schema: "greatsql", table: "t1"})
```

**注意：** 调用 `util.importTable`方法只能恢复单表数据，意思是需要先创建好一个空表，并且不支持同时恢复多表。

如果要恢复的表没有先创建好空表，则会报告如下错误：
```
Importing from multiple files to table `greatsql`.`t1` in MySQL Server at .%2Fmgr05%2Fmysql.sock using 8 threads
ERROR: [Worker002] greatsql@t1@@0.tsv.zst: MySQL Error 1146 (42S02): Table 'greatsql.t1' doesn't exist: LOAD DATA LOCAL INFILE '/data/backup/20230830/greatsql/greatsql@t1@@0.tsv.zst' INTO TABLE `greatsql`.`t1` FIELDS TERMINATED BY '     ' ESCAPED BY '\\' LINES STARTING BY '' TERMINATED BY '\n'
0% (0 bytes / 8.94 MB), 0.00 B/s
Total rows affected in greatsql.t1: Records: 0  Deleted: 0  Skipped: 0  Warnings: 0
Util.importTable: [Worker002] greatsql@t1@@0.tsv.zst: MySQL Error 1146 (42S02): Table 'greatsql.t1' doesn't exist: LOAD DATA LOCAL INFILE '/data/backup/20230830/greatsql/greatsql@t1@@0.tsv.zst' INTO TABLE `greatsql`.`t1` FIELDS TERMINATED BY '  ' ESCAPED BY '\\' LINES STARTING BY '' TERMINATED BY '\n' (RuntimeError)
```
这样看来，`util.importTable`更适合做特殊情况下的单表恢复。


**参考资料：**

- [Instance Dump Utility, Schema Dump Utility, and Table Dump Utility](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-dump-instance-schema.html)
- [Dump Loading Utility](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-load-dump.html)
- [myloader导入更快吗？并没有。。。](https://mp.weixin.qq.com/s/bTxXjNvCktUVu4el8kO7Sg)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
