# Changes in GreatSQL 8.0.32-24 (2023-6-5)


> GreatSQL 8.0.32-24 is released, adding major features such as parallel LOAD DATA, (logical & CLONE) backup encryption, dynamic VIP binding for MGR read/write nodes, Oracle compatibility extensions, and audit log enhancements.

## New Features
### SQL Compatibility
GreatSQL 8.0.32-24 implements multiple SQL compatibility features, including data type extensions, SQL syntax, and more than 20 compatibility features in total.

#### Data Type Extensions
- CLOB
- VARCHAR2

#### SQL Syntax
- [DATETIME arithmetic](../../5-enhance/sql-compat/5-3-easyuse-ora-syntax-datetime-arithmetic.md)
- [ROWNUM](../../5-enhance/sql-compat/5-3-easyuse-ora-syntax-rownum.md)
- [Subquery without alias](../../5-enhance/sql-compat/5-3-easyuse-ora-syntax-subquery-without-alias.md)
- [EXPLAIN PLAN FOR](../../5-enhance/sql-compat/5-3-easyuse-ora-syntax-explain-plan-for.md)

#### Functions
- [ADD_MONTHS()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-addmonths.md)
- [CAST()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-cast.md)
- [DECODE()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-decode.md)
- [INSTR()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-instr.md)
- [LENGTH()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-length.md)
- [LENGTHB()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-lengthb.md)
- [MONTHS_BETWEEN()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-monthsbetween.md)
- [NVL()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-nvl.md)
- [SUBSTRB()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-substrb.md)
- [SYSDATE()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-sysdate.md)
- [TO_CHAR()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-tochar.md)
- [TO_DATE()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-todate.md)
- [TO_NUMBER()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-tonumber.md)
- [TO_TIMESTAMP()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-totimestamp.md)
- [TRANSLATE()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-translate.md)
- [TRUNC()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-trunc.md)
- [SYS_GUID()](../../5-enhance/sql-compat/5-3-easyuse-ora-func-sysguid.md)


For more information, see the documentation: [SQL Compatibility in GreatSQL](../../5-enhance/5-3-easyuse.md).

### MGR

#### MGR Built-in Dynamic VIP
GreatSQL 8.0.32-24 adds the feature that MGR read/write nodes support binding a VIP (Virtual IP). With this feature, when MGR runs in single-primary mode, it can automatically identify the read/write node and bind the VIP, so that applications can send read/write requests to the database through the VIP. When the read/write node role changes, the VIP automatically floats and rebinds accordingly, and applications do not need to modify the VIP configuration.

For more information, see the documentation: [MGR Built-in VIP Support in GreatSQL](../../5-enhance/5-2-ha-mgr-vip.md).

#### New Applier Queue Batch Processing Mechanism
A new option `group_replication_applier_batch_size_threshold` has been added. When the concurrent transactions in MGR are too large, or the performance of individual Secondary nodes (disk I/O) is poor, the applier queue may accumulate more and more and fail to keep up with the Primary node in time.

An effective approach is to make the applier queue flush to disk in batches to improve flushing efficiency. By default, events in the applier queue are flushed one by one, which is very inefficient. When the applier queue exceeds the threshold set by `group_replication_applier_batch_size_threshold`, batch flushing mode is triggered: every 100 events are flushed in a batch, greatly improving flushing efficiency.

In production environments, the value of the option `group_replication_applier_batch_size_threshold` should not be set too small; it is recommended to be no less than 10000. The default value is 100000, the minimum value is 10 (only for development and test environments), and the maximum value is 100000000 (which is essentially equivalent to disabling it). A large transaction contains many events. If this option is set too low, the events in a transaction may not be flushed to disk in time, resulting in an incomplete Relay Log. When a node crashes, it would need to re-read the binlog from the Primary node for recovery.

| System Variable Name    | group_replication_applier_batch_size_threshold |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | YES |
| Permitted Values |    [10 ~ 100000000] |
| Default    | 100000 |
| Description    |When the applier queue exceeds the threshold set by `group_replication_applier_batch_size_threshold`, batch flushing mode is triggered: every 100 events are flushed in a batch to improve flushing efficiency.|

#### Static Allocation of XCom Cache
In MySQL 5.7, the maximum XCom cache size is 1G and cannot be adjusted dynamically. Starting from MySQL 8.0, it can be adjusted dynamically. In versions <= MySQL 8.0.20, the minimum value is 1G. In versions >= MySQL 8.0.21, the minimum value is 128M.

In MySQL, XCom cache is dynamically allocated on demand: if there is too much free space, it is released; if there is not enough, more memory is dynamically allocated, about 250000 cache items at a time, which can easily cause a response latency of about 150ms. In other words, response latency may occur frequently as the number of transactions changes.

In GreatSQL, a static allocation mechanism is adopted for XCom cache, i.e., about 1GB of memory is pre-allocated for XCom cache from the beginning. This avoids the response latency jitter risk mentioned above, but the "side effect" is that the mysqld process occupies more memory than before, making it unsuitable for servers with very tight memory.

A new option `group_replication_xcom_cache_mode` is added to set the initial size of static XCom cache allocation:

| System Variable Name    | group_replication_xcom_cache_mode |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | YES |
| Permitted Values |    [0 ~ 4]|
| Default    | 2 |
| Description    |Sets the initial size of static XCom cache allocation. The mapping is as follows:<br/>0: about 500,000 XCom items can be cached, with corresponding memory consumption of about 200MB;<br/>1: about 1 million XCom items can be cached, with corresponding memory consumption of about 500MB;<br/>2: about 2 million XCom items can be cached, with corresponding memory consumption of about 1GB;<br/>3: about 4 million XCom items can be cached, with corresponding memory consumption of about 2GB;<br/>4: about 8 million XCom items can be cached, with corresponding memory consumption of about 4GB;|

#### Other Optimizations
- Optimized the Mencius algorithm, achieving performance improvements of varying degrees in both single-primary mode and multi-primary mode.
- Eliminated the performance jitter in the scenario of killing node processes.
- Optimized the problem of severe performance jitter that could occur when nodes join.
- Optimized the manual primary election mechanism, solving the problem of being unable to elect a primary caused by long transactions.
- Improved the foreign key constraint mechanism in MGR, reducing or avoiding the risk of secondary nodes reporting errors and exiting MGR.
- Improved the speed of concurrent application and replay of large transactions on Secondary nodes.
- Increased XCom cache entries, improving performance in scenarios with high network latency or slow transaction application.
- Added the parameter option: `group_replication_broadcast_gtid_executed_period`, used to set the frequency at which nodes broadcast their GTID values to each other, in milliseconds. The default is 1000, the minimum is 200, and the maximum is 60000. Combined with the new transaction certification queue cleanup algorithm, it performs cleanup of the certification database. After receiving the GTIDs of all nodes, the certification information of GTIDs that have all been executed can be cleaned up.
- Added the parameter option: `group_replication_flow_control_max_wait_time`, used to set the maximum duration of flow control waiting each time flow control is triggered. The default is 3600 seconds, and the maximum is 86400 seconds (1 day).

### Performance Optimization

#### Parallel LOAD DATA
MySQL's native LOAD DATA uses a single thread to read the local file (or receive network packets sent by the client), and inserts data row by row after obtaining the content.

When the imported single file is very large, the single-threaded processing mode cannot fully utilize database resources, resulting in long execution time. In addition, because the data imported by LOAD DATA is within one transaction, when the binlog transaction exceeds 2G, it may be impossible to use binlog for synchronization among MGR clusters.

To solve the above two problems, GreatSQL supports parallel LOAD DATA import. After parallel import is enabled, the file is automatically split into small blocks (configurable), and then multiple worker threads (configurable number) are started to import the file blocks. Parallel import is engine-independent and theoretically supports any storage engine.

For more information, see the documentation: [Parallel LOAD DATA in GreatSQL](../../5-enhance/5-1-highperf-parallel-load.md).

#### Optimizer Optimization
- Optimized the execution plan, making the benchmark tpcc test throughput higher and more stable.

### Security
#### mysqldump Backup Encryption
GreatSQL 8.0.32-24 supports generating encrypted backup files when performing logical backups with mysqldump, and also supports decrypting and importing the encrypted backup files.

For more information, see the documentation: [Logical Backup Encryption in GreatSQL](../../5-enhance/5-4-security-mysqldump-encrypt.md).

#### Audit Log into Tables
GreatSQL supports writing audit logs into data tables and setting audit log table-writing rules to meet different auditing requirements.

The audit content includes the operating account, client IP, the database objects operated on, the complete statement executed, and the operation result.

For more information, see the documentation: [Audit Log into Tables in GreatSQL](../../5-enhance/5-4-security-audit.md).

#### Tablespace Encryption with National Cryptographic Algorithms

Based on the original keyring architecture of open source MySQL, the security of the open source MySQL keyring architecture is enhanced with national cryptographic algorithms. The tablespace encryption keyring architecture of MySQL includes 2 layers of encryption: master key and tablespace key. The master key is used to encrypt the tablespace key, and the encrypted result is stored in the header of the tablespace. The tablespace key is used to encrypt data. When a user wants to access an encrypted table, InnoDB first uses the master key to decrypt the encrypted information previously stored in the header to obtain the tablespace key, then uses the tablespace key to decrypt the data information. The tablespace key is never changed, while the master key can be changed at any time. The master key of open source MySQL uses the keyring_file plugin, and the key file is stored directly on disk. This feature increases the security of the database based on the national cryptographic algorithm sm4.

Create a table encrypted with national cryptographic algorithms
```
CREATE TABLE test.t1(c1 INT, c2 INT) ENGINE = InnoDB ENCRYPTION = 'Y';
```

For more information, see the documentation: [Tablespace Encryption with GMSSL Support in GreatSQL](../../5-enhance/5-4-security-encrypt-with-gmssl.md).

#### CLONE Backup Encryption
GreatSQL supports performing encryption simultaneously when using CLONE backup, improving the security of backup files and avoiding losses caused by stolen or leaked backup files.

For more information, see the documentation: [CLONE Backup Encryption](../../5-enhance/5-4-security-clone-encrypt.md).

## Stability Improvements
## Other Adjustments
## Bug Fixes
- Fixed the problem where InnoDB parallel query could cause queries to hang or even crash.
- Fixed the data anomaly caused when an MGR recovering node was stopped midway.
- Fixed the issue of possible data loss in MGR multi-primary multi-write mode in some cases.
- Fixed the issue where multiple MGR nodes started simultaneously and remained in the recovering state in some special scenarios.
- Fixed the crash caused by member_stats-related queries during the MGR node rejoin process.
- Fixed the problem of potentially long waits when executing STOP GROUP_REPLICATION in MGR.
- Fixed the infinite loop that could be caused by importing binlogs from a source-replica environment into MGR.
- Fixed the issue of unreasonable coroutine scheduling in MGR, which could cause the system to mistakenly determine network errors when handling large transactions.
- Fixed the issue where connections were closed prematurely due to write timeouts while a newly joined MGR node was catching up on Paxos data.
- Fixed the infinite loop caused by thread creation failures under high concurrency in MGR.
- Fixed the issue where one Secondary node hanging in MGR dragged down the entire MGR cluster.
- Fixed the view problem caused by simultaneously restarting 5 or more MGR nodes (one node would remain in the recovering state).
- Fixed the issue where adding nodes simultaneously failed in some MGR scenarios.
- Fixed the issue in MGR that could cause assert failures in BEFORE mode.

## GreatSQL VS MySQL

| Feature | GreatSQL 8.0.32-24 | MySQL 8.0.32 |
| --- | --- | --- |
| Open Source | ✅| ✅|
|ACID Integrity|✅|✅|
|MVCC Features|✅    |✅|
|Row Locks Supported|✅|✅|
|Automatic Crash Recovery|✅|✅|
|Table Partitioning|✅|✅|
|Views    |✅|✅|
|Subqueries|✅|✅|
|Triggers|✅|✅|
|Stored Procedures|✅|✅|
|Foreign Keys|✅|✅|
|Window Functions|✅|✅|
|Common Table Expressions (CTE)|✅|✅|
|Geographic Information (GIS)|✅|✅|
|GTID-Based Replication|✅|✅|
|Group Replication (MGR)|✅|✅|
|MyRocks Engine|✅|❎|
|SQL Compatibility Extensions|1. Data type extensions<br/>2. SQL syntax extensions<br/>More than 20 new extension features in total| ❎ |
|MGR Improvements|1. Zone tags<br/>2. Arbitrator nodes<br/>3. VIP binding for read/write nodes<br/>4. Fast single-primary mode<br/>5. Smart primary election mechanism<br/>6. New flow control algorithm|❎|
|Performance Improvements|1. InnoDB parallel query<br/>2. Parallel LOAD DATA|❎|
|Security Improvements|1. National cryptographic algorithm support<br/>2. Backup encryption<br/>3. Audit log into tables|❎|

In addition, GreatSQL 8.0.32-24 is based on Percona Server for MySQL 8.0.32-24, which has made a large number of improvements and enhancements and added many new features on top of MySQL 8.0.32. For details, please see: [**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html). These include features only available in MySQL Enterprise Edition, such as thread pool, auditing, and data masking, as well as numerous improvements and enhancements such as PFS improvements, IFS improvements, performance and scalability improvements, user statistics enhancements, processlist enhancements, and Slow Query Log enhancements. They are not listed here one by one.


## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)




**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
