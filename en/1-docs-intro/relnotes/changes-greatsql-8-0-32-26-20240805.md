# Changes in GreatSQL 8.0.32-26 (2024-08-05)

## Version Information

- Release date: August 5, 2024

- Version number: 8.0.32-26, Revision a68b3034c3d

- Download links: [RPM package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26), [TAR package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26), [Source code package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)

- User manual: [GreatSQL 8.0.32-26 User Manual](https://greatsql.cn/docs/8.0.32-26/)

## Feature Enhancements

GreatSQL 8.0.32-26 adds enhanced new features in **High Availability**, **High Performance**, **High Compatibility**, **High Security** and other aspects, including Clone incremental backup and compressed backup, automatic selection of the node with the latest data as the donor node when a new member node joins MGR, NUMA affinity optimization, non-blocking DDL, import optimization for tables without a primary key, more Oracle compatibility usage, last login information, rule-based data masking, and many other new features.

### High Availability
- When a new member node joins MGR, if the Clone method is selected to copy data, automatic selection of the member node with the latest transaction data for data copying is supported, which can effectively improve Clone speed and MGR service reliability. This feature is also supported when a newly joined node triggers Clone-based data copying.

The parameter `group_replication_donor_threshold` is used to define the transaction delay threshold for judging when selecting a donor node. The value range is [1, MAX], with a default value of MAX. The MAX value depends on the CPU type: it is 2147483647 (2^31-1) on 32-bit systems and 9223372036854775807 (2^63-1) on 64-bit systems.

When a new member node joins MGR, it only selects nodes whose delay is less than `group_replication_donor_threshold` as the donor node.

Assuming `group_replication_donor_threshold = 100`:
1. Now there are two nodes A and B in MGR, with GTIDs [1-300] and [1-280] respectively. New node C joins. Since the GTID difference between nodes A & B is less than the preset threshold, either A or B is randomly selected as the donor node.
2. Now there are two nodes A and B in MGR, with GTIDs [1-400] and [1-280] respectively. New node C joins. Since the GTID difference between nodes A & B is greater than the preset threshold, only A is selected as the donor node.
3. Now there are three nodes A, B, and C in MGR, with GTIDs [1-400], [1-350], and [1-280] respectively. New node D joins. Since node C's GTID difference is greater than the preset threshold and the GTID delay of nodes A & B is less than the preset threshold, either A or B is randomly selected as the donor node.

- In source-replica replication, the replica node initiates Binlog read requests to the primary node. If reading is too fast or too many threads run concurrently, the load on the primary node increases. The new parameter `rpl_read_binlog_speed_limit` is used to control the rate limit of Binlog read requests initiated by replica nodes to the primary node. This is very useful for controlling network bandwidth usage in source-replica replication, reducing primary node pressure, or reducing resource consumption during data recovery. This parameter takes effect when set on the replica node. See: [Binlog Read Rate Limit](../../5-enhance/5-2-ha-binlog-speed-limit.md).
- Optimized the Relay Log application logic in [fast single-primary mode](../../5-enhance/5-2-ha-mgr-fast-mode.md), improving overall MGR performance; and optimized the abnormal memory consumption of applier threads when Relay Log accumulates.
- Optimized the failure detection efficiency in [asynchronous connection failover](https://dev.mysql.com/doc/refman/8.0/en/replication-asynchronous-connection-failover.html). In particular, when network failures occur, the standby cluster can complete source-replica replication channel adjustment faster, reducing the duration of source-replica replication link disconnection and improving overall availability. Taking `MASTER_RETRY_COUNT = 2` as an example (with `slave_net_timeout` and `MASTER_CONNECT_RETRY` both defaulting to 60), when a network failure occurs between source-replica replication channels, the replication interruption lasted about 3 minutes; after optimization, the failure impact duration is shortened to within 10-20 seconds. [Asynchronous connection failover](https://dev.mysql.com/doc/refman/8.0/en/replication-asynchronous-connection-failover.html) can be used to implement source-replica replication between two MGR clusters, enabling a cross-data-center high availability switchover solution.
- The [zone tag](../../5-enhance/5-2-ha-mgr-zoneid.md) feature includes two parameters: `group_replication_zone_id` (default value 0) and `group_replication_zone_id_sync_mode` (default value ON). In older versions, the `group_replication_zone_id_sync_mode` of all nodes was required to be consistent, otherwise they could not join MGR. In the new version, arbitrator nodes are allowed to set a different `group_replication_zone_id_sync_mode`. For example, nodes A1 and A2 set `group_replication_zone_id = 0` & `zone_id_sync_mode = ON`; nodes B1 and B2 set `group_replication_zone_id = 1`, and they must also set `zone_id_sync_mode = ON`; arbitrator voting node C sets `group_replication_zone_id = 2`, but can set `group_replication_zone_id_sync_mode = OFF`.
- When the greatdb_ha Plugin is enabled, IPv6 support is added.

For more information, see the documentation: [High Availability](../../5-enhance/5-2-ha.md).

### High Performance

- Supports non-blocking DDL operations. When a large transaction or a large query on the table being modified by a DDL operation has not finished, the DDL request waits a long time for the MDL lock. With this feature, the problem of business requests being blocked in large numbers because the database must complete DDL operations as soon as possible can be avoided. See: [Non-Blocking DDL](../../5-enhance/5-1-highperf-nonblocking-ddl.md).
- NUMA affinity optimization. Through NUMA affinity scheduling optimization, front-end user threads and background threads are bound to fixed NUMA nodes to improve thread processing performance. See: [NUMA Affinity Optimization](../../5-enhance/5-1-highperf-numa-affinity.md).
- Performance optimization for parallel import of tables without an explicit primary key. When importing data in parallel into tables without an explicit primary key, performance degrades significantly as concurrency increases. GreatSQL provides an optimization solution for this situation. See: [Parallel LOAD DATA](../../5-enhance/5-1-highperf-parallel-load.md).

For more information, see the documentation: [High Performance](../../5-enhance/5-1-highperf.md).

### High Compatibility
- Added support for using the `CONTINUE` syntax in `LOOP` loops. See: [CONTINUE](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-continue.md).
- Added support for creating/modifying triggers with the `CREATE OR REPLACE` syntax; added support for using the `DECLARE BEGIN` syntax in triggers. See: [Triggers](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-trigger.md).
- Added support for using the `DECLARE BEGIN` syntax in anonymous blocks. See: [Anonymous Blocks](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-anony-block.md).
- Added support for connecting symbols and parameters in `FOR/FOR ALL ... LOOP` usage, for example `FOR var1..var2 LOOP`. See: [FOR LOOP](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-for-loop.md) and [FORALL LOOP](../../5-enhance/sql-compat/5-3-easyuse-ora-sp-forall-loop.md).

For more information, see the documentation: [High Compatibility](../../5-enhance/5-3-easyuse.md).

### High Security
- Added support for recording the last login time of specified users, making it easier for administrators to query and further improving database security. See: [Last Login Information](../../5-enhance/5-4-security-last-login.md).
- Added support for rule-based data masking. See: [Data Masking](../../5-enhance/5-4-security-data-masking.md).

For more information, see the documentation: [High Security](../../5-enhance/5-4-security.md).

### Others
- Supports using Clone to implement online full hot backup, incremental backup, and recovery (similar to Xtrabackup). Combined with Binlog, it can recover to a specified point in time. In addition, Clone backup also supports compression. See: [Clone Backup](../../5-enhance/5-5-clone-compressed-and-incrment-backup.md).
- Merged the LoongArch support patch, refer to: [add loongarch64 support](https://gitee.com/src-openeuler/greatsql/pulls/54/files).
- Since GreatSQL already supports the Rapid Engine and will also launch the dplan feature in the future, starting from GreatSQL 8.0.32-26, the InnoDB parallel query feature is no longer recommended (the entry link in the user manual will also be removed).

## Bug Fixes
- Fixed the issue where parallel replication cannot be used in some ARM architecture environments, see: [MySQL Bug 110752](https://bugs.mysql.com/bug.php?id=110752).
- Fixed the issue where the last login information and audit log table-writing did not handle Binlog, which could cause source-replica anomalies. In the new version, neither the last login information nor the audit log is recorded in Binlog, avoiding source-replica replication failure (or MGR errors) caused by all instances in source-replica replication (including MGR) enabling this feature to record Binlog.
- Fixed several issues where SQL injection could cause database instance coredumps, greatly improving GreatSQL's resistance to SQL injection risks.
- Fixed the NULL value unique constraint problem in Oracle mode. In the original Oracle mode, inserting NULL values would trigger a unique constraint conflict; in Oracle databases, repeated NULL values are allowed in unique constraint columns. This problem is fixed in the new version.

```sql
-- In the old version
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t1 (c1 INT UNIQUE);
greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE "t1" (
  "my_row_id" bigint unsigned NOT NULL AUTO_INCREMENT /*!80023 INVISIBLE */,
  "c1" int DEFAULT NULL,
  PRIMARY KEY ("my_row_id"),
  UNIQUE KEY "c1" ("c1") /* nulls are equal in unique index as oracle does */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t1 SELECT NULL;
Query OK, 1 row affected (0.01 sec)
Records: 1  Duplicates: 0  Warnings: 0

greatsql> INSERT INTO t1 SELECT NULL;
ERROR 1062 (23000): Duplicate entry 'NULL' for key 't1.c1'
```

This uniqueness constraint problem is fixed in the new version:
```sql
-- In the new version
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t1 (c1 INT UNIQUE);
greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE "t1" (
  "my_row_id" bigint unsigned NOT NULL AUTO_INCREMENT /*!80023 INVISIBLE */,
  "c1" int DEFAULT NULL,
  PRIMARY KEY ("my_row_id"),
  UNIQUE KEY "c1" ("c1") /* nulls are equal in unique index as oracle does */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t1 SELECT NULL;
Query OK, 1 row affected (0.01 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- No uniqueness constraint conflict is reported
greatsql> INSERT INTO t1 SELECT NULL;
Query OK, 1 row affected (0.01 sec)
Records: 1  Duplicates: 0  Warnings: 0
```

- Fixed the issue where enabling the thread pool with more than 128 logical CPU cores triggers a coredump, see: [mysqld debug version will core if the number of cpu cores is larger than 128](https://github.com/GreatSQL/GreatSQL/issues/5).
- Fixed the issue where enabling VIP in the greatdb_ha Plugin could cause GreatSQL to coredump after starting MGR due to system environment issues or improper configuration, see: [Issue#I9VTF8](https://gitee.com/GreatSQL/GreatSQL/issues/I9VTF8?from=project-issue).
- Fixed the issue where installing with the RPM package and the TAR binary package in different ways results in different default settings for `lower_case_table_names`.
- Fixed the issue of high process CPU consumption when idle or under low load.
- Fixed the issue of an extra sys_audit database in the default installation, see: [Issue#I8TL52](https://gitee.com/GreatSQL/GreatSQL/issues/I8TL52?from=project-issue).
- Fixed the assert fail problem after merging views, see: [Issue#IABSE6](https://gitee.com/GreatSQL/GreatSQL/issues/IABSE6?from=project-issue).
- Fixed the incorrect execution plan problem of full join, see: [Issue#IADFD7](https://gitee.com/GreatSQL/GreatSQL/issues/IADFD7?from=project-issue).

## Notes
None.

## Upgrading/Downgrading to GreatSQL 8.0.32-26

### Upgrading to GreatSQL 8.0.32-26

The following describes several different scenarios for upgrading to GreatSQL 8.0.32-26.

- If the old version is GreatSQL 8.0.32-25 and the Rapid Engine is not used, you can directly start GreatSQL 8.0.32-26 in-place based on the original *datadir* after modifying *basedir*, and automatic upgrade will be completed.
- If the old version is GreatSQL 8.0.32-25 and the Rapid Engine is enabled, do not upgrade for now; you can wait until a later GreatSQL 8.0.32-26 version with a new Rapid Engine is released before upgrading.
- If the old version is GreatSQL 8.0.32-24, 8.0.25-*, 5.7.36-39 or other series versions, you can directly start GreatSQL 8.0.32-26 in-place based on the original *datadir* after modifying *basedir*, and automatic upgrade will be completed.
- If the old version is MySQL 8.0.* (<= 8.0.32), Percona Server 8.0.* (<= 8.0.32) or other series versions, you can directly start GreatSQL 8.0.32-26 in-place based on the original *datadir* after modifying *basedir*, and automatic upgrade will be completed.
- If the old version is MySQL 8.0.* (> 8.0.32), Percona Server 8.0.* (> 8.0.32) or other series versions, you need to export data using logical backup and then import it to complete the upgrade. In-place upgrade to GreatSQL 8.0.32-26 is not supported.
- If the old version is MySQL 5.7.* (>= 5.7.23), Percona Server 5.7.* (>= 5.7.23) or other series versions, you can directly start GreatSQL 8.0.32-26 in-place based on the original *datadir* after modifying *basedir*, and automatic upgrade will be completed.

In the above in-place upgrade scenarios, make sure that the `upgrade` parameter in GreatSQL is not set to *NONE*; it can be set to the default *AUTO* or *FORCE*. For example:

```ini
[mysqld]
upgrade = AUTO
```

For more migration and upgrade solutions, please refer to: [Migration & Upgrade](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md).

### Downgrading to GreatSQL 8.0.32-26

If you want to downgrade from a version after MySQL/Percona 8.0.32 to GreatSQL 8.0.32-26, you need to use the logical backup + logical import method to complete the downgrade. In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade = FORCE` to force upgrading all data tables, including system tables.

The downgrade process is roughly as follows:

1. Perform a full logical backup in the higher version
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

2. Import the logical backup file in the GreatSQL 8.0.32-26 environment to complete logical recovery

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

3. Modify my.cnf to ensure the `upgrade = FORCE` setting
```ini
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

## GreatSQL VS MySQL

| **1. Major Features** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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
| **2. Performance Enhancement Extensions** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|AP Engine| :heavy_check_mark: | HeatWave (cloud only) |
|NUMA Affinity Optimization| :heavy_check_mark: | ❌ |
|Non-Blocking DDL| :heavy_check_mark: | ❌ |
|Import Optimization for Tables Without Primary Key| :heavy_check_mark: | ❌ |
|InnoDB Parallel Query| :heavy_check_mark: | Primary key scans only |
|Parallel LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB Transaction ReadView Lock-Free Optimization| :heavy_check_mark: | ❌ |
|InnoDB Transaction Large Lock Splitting Optimization| :heavy_check_mark: | ❌ |
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
| **3. Developer-Oriented Improvements** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level Interface| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Full-Text Search Improvements| :heavy_check_mark: | ❌ |
|More Hash/Digest Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Data Types| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - SQL Syntax| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Stored Programs| :heavy_check_mark: | ❌ |
| **4. Basic Feature Enhancements** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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
| **5. Security Enhancements** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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
| **6. Operations Convenience Enhancements** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
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

GreatSQL 8.0.32-26 is based on Percona Server for MySQL 8.0.32, which has made a large number of improvements and enhancements and added many new features on top of MySQL 8.0.32. For details, please see: [**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html). These include features only available in MySQL Enterprise Edition, such as thread pool, auditing, and data masking, as well as numerous improvements and enhancements such as performance_schema improvements, information_schema improvements, performance and scalability improvements, user statistics enhancements, PROCESSLIST enhancements, and Slow Query Log enhancements. They are not listed here one by one.

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
