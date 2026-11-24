# Changes in GreatSQL 8.0.32-27 (2025-3-10)

## Version Information

- Release date: March 10, 2025

- Version number: 8.0.32-27, Revision aa66a385910

- Download links: [RPM package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27), [TAR package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27), [Source code package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)

- User manual: [GreatSQL 8.0.32-27 User Manual](https://greatsql.cn/docs/8.0.32-27/)

## Improvements

GreatSQL 8.0.32-27 adds the high-performance parallel query engine **Turbo**, upgrades the Rapid Engine kernel version, optimizes the compression and transmission mechanism for MGR large transactions, improves the greatdb_ha plugin, supports Zstd compression for InnoDB Pages, improves Oracle compatibility features, improves security, and fixes several bugs that could cause crashes or data loss.

### High Availability

- Optimized the handling mechanism for MGR large transaction compression exceeding the limit.

In MGR, when a large transaction exceeds the `group_replication_compression_threshold` threshold, LZ4 compression is performed. However, due to the limitations of LZ4 itself, compression may fail with an error, and the transaction fails with an error similar to the following

```log
[GCS] Gcs_packet's payload is too big. Only packets smaller than 2113929216 bytes can be compressed. Payload size is 2197817290
```

GreatSQL has adjusted and optimized this mechanism to achieve the following two goals:

1. When the transaction size exceeds the `group_replication_compression_threshold` threshold, compression is started.

2. But when the transaction size exceeds the LZ4 compression limit, an error is no longer reported; instead, the original uncompressed transaction data continues to be transmitted, i.e., the effect is similar to setting `group_replication_compression_threshold=0` (compression disabled).

- Added the status variable `Rpl_data_speed` to display the current Binlog rate limit status. It can be viewed by executing `SHOW GLOBAL STATUS LIKE 'Rpl_data_speed'`, for example

```sql
greatsql> SHOW GLOBAL STATUS LIKE 'Rpl%spee%';
+----------------+------------------+
| Variable_name  | Value            |
+----------------+------------------+
| Rpl_data_speed | async_rpl=100.00 |
+----------------+------------------+
```
This indicates that the current Binlog read rate limit is 100KB/s. For more detailed usage, please refer to: [Binlog Read Rate Limit](../../5-enhance/5-2-ha-binlog-speed-limit.md).

- In the `greatdb_ha` plugin, added defense for the TCP port corresponding to the parameter `greatdb_ha_port`, avoiding the risk of a crash when users send illegal commands.
- Fixed the issue where enabling the `greatdb_ha` plugin could cause a crash due to undefined behavior when the Linux system function FD_SET encounters file descriptors exceeding 1024.
- Fixed the risk of memory leaks after enabling the VIP feature in the `greatdb_ha` plugin.
- Fixed the issue where after deploying source-replica replication between two MGR clusters (primary and standby), if the primary node of the standby cluster crashed unexpectedly, the process might fail to exit.
- Fixed the issue where after deploying source-replica replication between two MGR clusters (primary and standby), if the primary node of the standby cluster executed `kill -19` to kill the mysqld process, the sql_thread on the Slave node might fail to exit for a long time after fault recovery.

### High Performance
- Added the high-performance parallel query engine **Turbo**. By embedding DuckDB, it gives GreatSQL multi-threaded concurrent vectorized query capabilities, achieving exponential acceleration of SQL query speed while maintaining compatibility with the GreatSQL ecosystem. Compared with the Rapid Engine, the Turbo Engine does not need to load data into the engine; instead, during query execution, it directly extracts data in parallel for use by the Turbo Engine.

First install the Turbo Engine

```sql
greatsql> INSTALL PLUGIN turbo SONAME 'turbo.so';
```

Then you can directly use the Turbo Engine to greatly improve SQL query efficiency

```sql
greatsql> SELECT /*+ SET_VAR(turbo_enable=ON) SET_VAR(turbo_cost_threshold=0)*/ * FROM t1;
```

For more detailed usage of the Turbo Engine, please refer to: [Turbo Engine](../../5-enhance/5-1-highperf-turbo-engine.md).

- Upgraded the Rapid Engine kernel to the official GA version. The new version has achieved major breakthroughs in storage format stability and query semantics consistency, providing users with strong stability guarantees. Note that **the new version adopts a new file storage format that is incompatible with previous versions**, so it is not possible to upgrade smoothly and directly from GreatSQL 8.0.32-25 or 8.0.32-26 to GreatSQL 8.0.32-27. You need to first delete the old Rapid Engine data files, then perform a full data import again, and restart the incremental import task. For detailed upgrade steps, please see below: [Upgrading to GreatSQL 8.0.32-27](#upgrading-to-greatsql-8-0-32-27).
- In the new version of the Rapid Engine, the maximum number of parallel logical CPU cores that can be used is 4. If you need higher concurrency performance, please contact us for a solution.
- Fixed the issue in the Rapid Engine where the DELAY field displayed inaccurate values when checking the incremental import task progress after deleting a large batch of data at once.
- Fixed the incorrect problem where using `EXPLAIN` to view the execution plan of a Rapid table in a stored procedure showed that the Rapid Engine could not be used when it actually could.
- Fixed the issue where, in the Rapid Engine, starting an incremental import task directly without first completing a full import task would fail with an error, and after restarting the instance, it could not start normally. Normally, the correct approach is to complete a full import first, and then start the incremental import task.
- Fixed the setting problem of the Rapid Engine parameter `rapid_worker_threads`. After setting it above the maximum value, resetting it to any other legal value except the default value would report an error, and it would not return to normal until the Rapid Engine was reloaded or the database was restarted.
- Removed the Rapid Engine parameter `rapid_hash_table_memory_limit`; it is no longer used.
- When reading Rapid table data, redundant information similar to the following is no longer printed in the error log.

```log
[Note] [MY-011825] [InnoDB] thread 62 handle range count: 34 total rows: 2449266
[Note] [MY-011825] [InnoDB] thread 63 handle range count: 21 total rows: 1648443
[Note] [MY-011825] [InnoDB] total fetch rows count: 150000000
``` 
- Fixed the Rapid Engine's handling of tables with virtual columns. Previously, when a table had virtual columns, executing `ALTER TABLE ... SECONDARY_LOAD` did not report an error, but executing `SELECT ... /*+ SET_VAR(use_secondary_engine=FORCED) */` reported that it was not supported. In the new version, when a table is found to have virtual columns, executing `ALTER TABLE ... SECONDARY_LOAD` directly reports the following error indicating that it is not supported:

```sql
ERROR 3106 (HY000): 'Rapid engine' is not supported for generated columns.
```

- When using the Rapid Engine, if an unsupported data type is encountered, a clearer error is added to the returned error message, as shown in the following example

```sql
greatsql> CREATE TABLE t1 (
  id int unsigned not null primary key,
  c1 int unsigned not null,
  c2 decimal(65,30) DEFAULT NULL
) SECONDARY_ENGINE=rapid;
Query OK, 0 rows affected (0.02 sec)

-- In the error message below, it clearly indicates that the data type of column c2 is not supported
greatsql> ALTER TABLE t1 SECONDARY_LOAD;
ERROR 3877 (HY000): The field c2 type is not supported
```

### High Compatibility
- Added support for the `INTERVAL 'n' DAY` arithmetic usage in the `TO_DATE` function. For example

```sql
greatsql> SELECT TO_DATE('20250212','YYYYMMDD') + (INTERVAL '-1' DAY) AS LASTDAY FROM DUAL;
+---------------------+
| LASTDAY             |
+---------------------+
| 2025-02-11 00:00:00 |
+---------------------+
```
- Optimized the execution efficiency of the `TO_NUMBER` function with large amounts of data; performance can be improved several times.
- Fixed the issue where `REF CURSOR` could report an error when the table structure changes during execution.
- Optimized the memory management mechanism of dynamic cursors, releasing memory in time after the dynamic cursor `END LOOP` completes execution.
- Fixed the issue where the `MERGE INTO` statement failed to update the target table when the source table is a single-row pseudo-table, causing the execution result to be inconsistent with Oracle.

### High Security
- Fixed the source-replica anomaly that could be caused by not handling Binlog in the last login information feature.
- Fixed the source-replica anomaly that could be caused by not handling Binlog in the audit log into tables feature.
- Fixed the inconsistency of function names before and after in the installation and uninstallation SQL scripts of the audit log into tables feature.
- Fixed the issue where, when `sql_log_bin=ON` was set, the audit log table `sys_audit.audit_log` could still be updated and modified, even though modifying it should have been prohibited.

### Others
- The InnoDB Page compression algorithm supports Zstd, further improving the Page compression ratio, especially when the table contains a large amount of repeated character-type data. You can specify the Page compression algorithm when creating a new table, for example

```sql
greatsql> CREATE TABLE `t1_zstd` (
  `id` int NOT NULL,
  `c1` varchar(20) NOT NULL,
  `c2` varchar(30) NOT NULL,
  `c3` datetime NOT NULL,
  `c4` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_c3` (`c3`)
) ENGINE=InnoDB COMPRESSION='zstd';
```

You can also execute `ALTER TABLE` to modify the Page compression algorithm of a table, for example

```sql
greatsql> ALTER TABLE t1 COMPRESSION='zstd';
```

For more usage of InnoDB Page compression, please refer to: [InnoDB Page Compression](../../5-enhance/5-5-innodb-page-compression.md).

## Bug Fixes
- Fixed the issue where executing `EXPLAIN FORMAT=TREE` could cause a crash in specific cases, see: [Issue#IAL5KK](https://gitee.com/GreatSQL/GreatSQL/issues/IAL5KK).
- Merged the bug fixes from MySQL 8.0.38, corresponding bug ids: [#36204344](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-38.html), [#36356279](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-38.html).
- Merged the bug fix for the issue where executing `ALTER TABLE` in specific cases could cause the loss of one row of data, merging the bug fix submitted by the Percona team, corresponding bug ids: [#113812](https://bugs.mysql.com/bug.php?id=113812), [#115511](https://bugs.mysql.com/bug.php?id=115511), [#115608](https://bugs.mysql.com/bug.php?id=115608).
- Fixed the issue where the statistics of some tables were not actually written to disk when shutting down the instance, which could cause inaccurate index statistics and make normally fast SQL run very slowly.

## Notes

## Upgrading/Downgrading to GreatSQL 8.0.32-27

### Upgrading to GreatSQL 8.0.32-27
- If the old version is GreatSQL 8.0.32-25 or 8.0.32-26 and the Rapid Engine is not used, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- If the old version is GreatSQL 8.0.32-25 or 8.0.32-26 and the Rapid Engine is enabled, **in-place upgrade is not possible in this case**. You need to unload all Rapid Engine tables, delete the Rapid data files, and then you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed. After the new version instance starts, execute `ALTER TABLE SECONDARY_LOAD` on all Rapid Engine tables to complete the full data import, then execute `SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK()` to start the incremental import task, completing the Rapid Engine table upgrade. The following is a reference upgrade process:

1. Query and record all Rapid Engine tables

You can execute the following SQL to query which tables currently use the Rapid Engine:

```sql
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE CREATE_OPTIONS LIKE '%Rapid%';
+--------------+----------------+------------+
| TABLE_SCHEMA | TABLE_NAME     | TABLE_ROWS |
+--------------+----------------+------------+
| tpch100g     | customer       |   14854987 |
| tpch100g     | lineitem       |  582868392 |
| tpch100g     | nation         |         25 |
| tpch100g     | orders         |  148492582 |
| tpch100g     | part           |   19943155 |
| tpch100g     | partsupp       |   79832625 |
| tpch100g     | region         |          5 |
| tpch100g     | supplier       |     989416 |
+--------------+----------------+------------+
```

2. Stop the GreatSQL instance process normally

Before stopping the GreatSQL instance process, first modify `innodb_fast_shutdown=0` and then execute `SHUTDOWN` to stop the instance

```sql
greatsql> SET GLOBAL innodb_fast_shutdown=0;
greatsql> SHUTDOWN;
```

3. Delete the old Rapid Engine data files

```bash
cd /data/GreatSQL && rm -f duckdb*
```

4. Modify the `basedir` parameter in the `my.cnf` configuration file to point to the new GreatSQL 8.0.32-27 version

```ini
#my.cnf
[mysqld]
basedir=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64
```
And make sure the parameter `upgrade` is not set to *NONE*.

5. Start the new GreatSQL 8.0.32-27 instance

```bash
systemctl start greatsql
```

6. Reinstall the Rapid Engine

```sql
greatsql> INSTALL PLUGIN rapid SONAME 'ha_rapid.so';
```

7. Perform a full data import for the Rapid Engine tables

```sql
greatsql> ALTER TABLE test.t1 SECONDARY_LOAD;
```

::: tip Tip
Since the `SECONDARY_ENGINE=rapid` attribute of the table was not removed before the upgrade, there is no need to set it again. If all Rapid Engine tables were unloaded before the upgrade, you need to set it again.
:::

8. Start the incremental import task again

```sql
greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('test', 't1');
```
This completes the Rapid Engine table upgrade.

- If the old version is GreatSQL 8.0.32-24, 8.0.25-*, 5.7.36-39 or other series versions, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- If the old version is MySQL 8.0.* (<= 8.0.32), Percona Server 8.0.* (<= 8.0.32) or other series versions, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- If the old version is MySQL 8.0.* (> 8.0.32), Percona Server 8.0.* (> 8.0.32) or other series versions, you need to export data using logical backup and then import it to complete the upgrade. In-place upgrade to GreatSQL 8.0.32-27 is not supported.
- If the old version is MySQL 5.7.* (>= 5.7.23), Percona Server 5.7.* (<= 5.7.23) or other series versions, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.

In the above in-place upgrade scenarios, make sure that the `upgrade` parameter in `my.cnf` is not set to *NONE*; it can be set to the default *AUTO* or *FORCE*. For example:

```ini
#my.cnf
[mysqld]
upgrade = AUTO
```

For more migration and upgrade solutions, please refer to: [Migration & Upgrade](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md).

### Downgrading to GreatSQL 8.0.32-27

If you want to downgrade from a version after MySQL/Percona 8.0.32 to GreatSQL 8.0.32-27, you need to use the logical backup + logical import method to complete the downgrade. In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade = FORCE` to force upgrading all data tables, including system tables.

The downgrade process is roughly as follows:

1. Perform a full logical backup in the higher version
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

2. Import the logical backup file in the GreatSQL 8.0.32-27 environment to complete logical recovery

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

3. Modify `my.cnf` to ensure the `upgrade=FORCE` setting
```ini
#my.cnf
[mysqld]
upgrade = FORCE
```

4. Restart GreatSQL to complete the downgrade

```bash
systemctl restart greatsql
```
During the restart, you can see a forced upgrade process in the log similar to the following

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80032' completed.
```

If `upgrade = FORCE` is not set to force upgrading all tables, the system table `mysql.procs_priv` may be corrupted, and an error similar to the following may be reported when creating users:

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## GreatSQL vs MySQL

| **1. Major Features** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| Open Source |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID Integrity| :heavy_check_mark: | :heavy_check_mark: |
|MVCC Features| :heavy_check_mark:     | :heavy_check_mark: |
|Row Locks Supported| :heavy_check_mark: | :heavy_check_mark: |
|Automatic Crash Recovery| :heavy_check_mark: | :heavy_check_mark: |
|Table Partitioning| :heavy_check_mark: | :heavy_check_mark: |
|Views| :heavy_check_mark: | :heavy_check_mark: |
|Subqueries| :heavy_check_mark: | :heavy_check_mark: |
|Triggers| :heavy_check_mark: | :heavy_check_mark: |
|Stored Programs| :heavy_check_mark: | :heavy_check_mark: |
|Foreign Keys| :heavy_check_mark: | :heavy_check_mark: |
|Window Functions| :heavy_check_mark: | :heavy_check_mark: |
|Common Table Expressions (CTE)| :heavy_check_mark: | :heavy_check_mark: |
|Geographic Information (GIS)| :heavy_check_mark: | :heavy_check_mark: |
|GTID-Based Replication| :heavy_check_mark: | :heavy_check_mark: |
|Group Replication (MGR)| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks Engine| :heavy_check_mark: | ❌ |
|LoongArch Architecture Support| :heavy_check_mark: | ❌ |
| **2. Performance Enhancement Extensions** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|Rapid Engine| :heavy_check_mark: | HeatWave (cloud only) |
|Turbo Engine| :heavy_check_mark: | ❌ |
|NUMA Affinity Optimization| :heavy_check_mark: | ❌ |
|Non-Blocking DDL| :heavy_check_mark: | ❌ |
|Import Optimization for Tables Without Primary Key| :heavy_check_mark: | ❌ |
|InnoDB Parallel Query| :heavy_check_mark: | Primary key scans only |
|Parallel LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB Transaction ReadView Lock-Free Optimization| :heavy_check_mark: | ❌ |
|InnoDB Transaction Large Lock Splitting Optimization| :heavy_check_mark: | ❌ |
|InnoDB Page Compression with Zstd Support| :heavy_check_mark: | ❌ | 
|InnoDB Resource Groups| :heavy_check_mark: | :heavy_check_mark: |
|Custom InnoDB Page Size| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes Splitting Optimization| :heavy_check_mark: | ❌ |
|MEMORY Engine Optimization| :heavy_check_mark: | ❌ |
|InnoDB Flushing Optimization| :heavy_check_mark: | ❌ |
|Parallel Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Fast Index Creation Optimization| :heavy_check_mark: | ❌ |
|Single-Column Compression for VARCHAR/BLOB/JSON Types| :heavy_check_mark: | ❌ |
|Single-Column Compression Information in Data Dictionary| :heavy_check_mark: | ❌ |
| **3. Developer-Oriented Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level Interface| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Full-Text Search Improvements| :heavy_check_mark: | ❌ |
|More Hash/Digest Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Data Types| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - SQL Syntax| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Stored Programs| :heavy_check_mark: | ❌ |
| **4. Basic Feature Enhancements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|MGR Enhancement - Zone Tags| :heavy_check_mark: | ❌ |
|MGR Enhancement - Arbitrator Nodes| :heavy_check_mark: | ❌ |
|MGR Enhancement - VIP Binding for Read/Write Nodes| :heavy_check_mark: | ❌ |
|MGR Enhancement - Fast Single-Primary Mode| :heavy_check_mark: | ❌ |
|MGR Enhancement - Smart Primary Election Mechanism| :heavy_check_mark: | ❌ |
|MGR Enhancement - New Flow Control Algorithm| :heavy_check_mark: | ❌ |
|MGR Enhancement - Network Partition Exception Handling|  :heavy_check_mark: | ❌ |
|MGR Enhancement - Abnormal Node Exit Handling| :heavy_check_mark: | ❌ |
|MGR Enhancement - Full Node Disk Handling| :heavy_check_mark: | ❌ |
|MGR Enhancement - Automatic Donor Node Selection| :heavy_check_mark: | ❌ |
|MGR Enhancement - Large Transaction Compression Optimization| :heavy_check_mark: | ❌ |
|Clone Incremental Backup| :heavy_check_mark: | ❌ |
|Clone Backup Compression| :heavy_check_mark: | ❌ |
|Binlog Read Rate Limit| :heavy_check_mark: | ❌ |
|Number of information_schema tables|95|65|
|Global performance and status metrics|853|434|
|Optimizer Histograms| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table Performance Metrics| :heavy_check_mark: | ❌ |
|Per-Index Performance Metrics| :heavy_check_mark: | ❌ |
|Per-User Performance Metrics| :heavy_check_mark: | ❌ |
|Per-Client Performance Metrics| :heavy_check_mark: | ❌ |
|Per-Thread Performance Metrics| :heavy_check_mark: | ❌ |
|Global Query Response Time Statistics| :heavy_check_mark: | ❌ |
|SHOW ENGINE INNODB STATUS Enhancement| :heavy_check_mark: | ❌ |
|Rollback Segment Information Enhancement| :heavy_check_mark: | ❌ |
|Temporary Table Information Enhancement| :heavy_check_mark: | ❌ |
|User Statistics Enhancement| :heavy_check_mark: | ❌ |
|Slow Query Log Enhancement| :heavy_check_mark: | ❌ |
| **5. Security Enhancements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|National Cryptographic Algorithm Support| :heavy_check_mark: | ❌ |
|Backup Encryption| :heavy_check_mark: | ❌ |
|Auditing| :heavy_check_mark: | Enterprise Edition only |
|Data Masking| :heavy_check_mark: | ❌ |
|Last Login Records| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2 Password Hashing| :heavy_check_mark: | :heavy_check_mark: |
|Password Rotation Policy| :heavy_check_mark: | :heavy_check_mark: |
|PAM Authentication Plugin| :heavy_check_mark: | Enterprise Edition only |
|Keyring Stored in File| :heavy_check_mark: | :heavy_check_mark: |
|Keyring Stored in Hashicorp Vault| :heavy_check_mark: | Enterprise Edition only |
|InnoDB Data Encryption| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Log Encryption| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Tablespace File Encryption| :heavy_check_mark: | :heavy_check_mark: |
|Binary Log Encryption| :heavy_check_mark: | ❌ |
|Temporary File Encryption| :heavy_check_mark: | ❌ |
|Forced Encryption| :heavy_check_mark: | ❌ |
| **6. Operations Convenience Enhancements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|DDL Atomicity| :heavy_check_mark: | :heavy_check_mark: |
|Data Dictionary Stored in InnoDB Tables| :heavy_check_mark: | :heavy_check_mark: |
|Fast DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|Invisible Indexes| :heavy_check_mark: | :heavy_check_mark: |
|Thread Pool| :heavy_check_mark: | Enterprise Edition only |
|Backup Locks| :heavy_check_mark: | ❌ |
|SHOW GRANTS Extension| :heavy_check_mark: | ❌ |
|Table Corruption Action Extension| :heavy_check_mark: | ❌ |
|Kill Inactive Transactions| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT Extension| :heavy_check_mark: | ❌ |

GreatSQL 8.0.32-27 is based on Percona Server for MySQL 8.0.32, which has made a large number of improvements and enhancements and added many new features on top of MySQL 8.0.32. For details, please see: [**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html). These include features only available in MySQL Enterprise Edition, such as thread pool, auditing, and data masking, as well as numerous improvements and enhancements such as performance_schema improvements, information_schema improvements, performance and scalability improvements, user statistics enhancements, PROCESSLIST enhancements, and Slow Query Log enhancements. They are not listed here one by one.

## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-26 (2024-08-05)](changes-greatsql-8-0-32-26-20240805.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
