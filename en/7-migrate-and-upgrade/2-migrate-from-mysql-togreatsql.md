# Migrating from MySQL to GreatSQL
---

This article introduces how to migrate/upgrade from MySQL to the GreatSQL database.

## Why Migrate/Upgrade

Compared with MySQL Community Edition, GreatSQL has many excellent features, including but not limited to the following:

| **1. Main Features** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| Open Source | :heavy_check_mark: | :heavy_check_mark: |
| ACID Integrity | :heavy_check_mark: | :heavy_check_mark: |
| MVCC | :heavy_check_mark: | :heavy_check_mark: |
| Row Locking | :heavy_check_mark: | :heavy_check_mark: |
| Automatic Crash Recovery | :heavy_check_mark: | :heavy_check_mark: |
| Table Partitioning | :heavy_check_mark: | :heavy_check_mark: |
| Views | :heavy_check_mark: | :heavy_check_mark: |
| Subqueries | :heavy_check_mark: | :heavy_check_mark: |
| Triggers | :heavy_check_mark: | :heavy_check_mark: |
| Stored Programs | :heavy_check_mark: | :heavy_check_mark: |
| Foreign Keys | :heavy_check_mark: | :heavy_check_mark: |
| Window Functions | :heavy_check_mark: | :heavy_check_mark: |
| Common Table Expressions (CTE) | :heavy_check_mark: | :heavy_check_mark: |
| Geographic Information (GIS) | :heavy_check_mark: | :heavy_check_mark: |
| GTID-based Replication | :heavy_check_mark: | :heavy_check_mark: |
| Group Replication (MGR) | :heavy_check_mark: | :heavy_check_mark: |
| MyRocks Engine | :heavy_check_mark: | ❌ |
| LoongArch Support | :heavy_check_mark: | ❌ |
| **2. Performance Extensions** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| Rapid Engine | :heavy_check_mark: | HeatWave only on cloud |
| Turbo Engine | :heavy_check_mark: | ❌ |
| NUMA Affinity Optimization | :heavy_check_mark: | ❌ |
| Non-blocking DDL | :heavy_check_mark: | ❌ |
| Faster Import for Tables without Primary Keys | :heavy_check_mark: | ❌ |
| InnoDB Parallel Query | :heavy_check_mark: | Primary-key scan only |
| Parallel LOAD DATA | :heavy_check_mark: | ❌ |
| Lock-free InnoDB Transaction ReadView Optimization | :heavy_check_mark: | ❌ |
| InnoDB Transaction Large Lock Splitting Optimization | :heavy_check_mark: | ❌ |
| InnoDB Resource Groups | :heavy_check_mark: | :heavy_check_mark: |
| Custom InnoDB Page Size | :heavy_check_mark: | :heavy_check_mark: |
| Contention-Aware Transaction Scheduling | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Mutex Splitting Optimization | :heavy_check_mark: | ❌ |
| MEMORY Engine Optimization | :heavy_check_mark: | ❌ |
| InnoDB Flushing Optimization | :heavy_check_mark: | ❌ |
| Parallel Doublewrite Buffer | :heavy_check_mark: | :heavy_check_mark: |
| Fast InnoDB Index Creation Optimization | :heavy_check_mark: | ❌ |
| Single-column Compression for VARCHAR/BLOB/JSON | :heavy_check_mark: | ❌ |
| Column Compression Info in Data Dictionary | :heavy_check_mark: | ❌ |
| **3. Developer Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| X API | :heavy_check_mark: | :heavy_check_mark: |
| JSON | :heavy_check_mark: | :heavy_check_mark: |
| NoSQL Socket-Level Interface | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Full-Text Search Improvements | :heavy_check_mark: | ❌ |
| More Hash/Digest Functions | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Data Types | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Functions | :heavy_check_mark: | ❌ |
| Oracle Compatibility - SQL Syntax | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Stored Routines | :heavy_check_mark: | ❌ |
| **4. Basic Feature Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| MGR - Zone Tags | :heavy_check_mark: | ❌ |
| MGR - Arbitrator Nodes | :heavy_check_mark: | ❌ |
| MGR - Dynamic VIP for Read/Write Nodes | :heavy_check_mark: | ❌ |
| MGR - Fast Single-Primary Mode | :heavy_check_mark: | ❌ |
| MGR - Smart Primary Election | :heavy_check_mark: | ❌ |
| MGR - New Flow Control Algorithm | :heavy_check_mark: | ❌ |
| MGR - Network Partition Exception Handling | :heavy_check_mark: | ❌ |
| MGR - Node Abnormal Exit Handling | :heavy_check_mark: | ❌ |
| MGR - Node Disk Full Handling | :heavy_check_mark: | ❌ |
| MGR - Automatic Donor Selection | :heavy_check_mark: | ❌ |
| Clone Incremental Backup | :heavy_check_mark: | ❌ |
| Clone Backup Compression | :heavy_check_mark: | ❌ |
| Binlog Read Speed Limit | :heavy_check_mark: | ❌ |
| Number of information_schema Tables | 95 | 65 |
| Global Performance and Status Metrics | 853 | 434 |
| Optimizer Histograms | :heavy_check_mark: | :heavy_check_mark: |
| Per-Table Performance Metrics | :heavy_check_mark: | ❌ |
| Per-Index Performance Metrics | :heavy_check_mark: | ❌ |
| Per-User Performance Metrics | :heavy_check_mark: | ❌ |
| Per-Client Performance Metrics | :heavy_check_mark: | ❌ |
| Per-Thread Performance Metrics | :heavy_check_mark: | ❌ |
| Global Query Response Time Statistics | :heavy_check_mark: | ❌ |
| Enhanced SHOW ENGINE INNODB STATUS | :heavy_check_mark: | ❌ |
| Enhanced Rollback Segment Information | :heavy_check_mark: | ❌ |
| Enhanced Temporary Table Information | :heavy_check_mark: | ❌ |
| Enhanced User Statistics | :heavy_check_mark: | ❌ |
| Enhanced Slow Log Information | :heavy_check_mark: | ❌ |
| **5. Security Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| National Cryptographic (GM) Support | :heavy_check_mark: | ❌ |
| Backup Encryption | :heavy_check_mark: | ❌ |
| Auditing | :heavy_check_mark: | Enterprise only |
| Data Masking | :heavy_check_mark: | ❌ |
| Last Login Recording | :heavy_check_mark: | ❌ |
| SQL Roles | :heavy_check_mark: | :heavy_check_mark: |
| SHA-2 Password Hashing | :heavy_check_mark: | :heavy_check_mark: |
| Password Rotation Policy | :heavy_check_mark: | :heavy_check_mark: |
| PAM Authentication Plugin | :heavy_check_mark: | Enterprise only |
| Keyring Stored in Files | :heavy_check_mark: | :heavy_check_mark: |
| Keyring Stored in Hashicorp Vault | :heavy_check_mark: | Enterprise only |
| InnoDB Data Encryption | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Log Encryption | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Tablespace File Encryption | :heavy_check_mark: | :heavy_check_mark: |
| Binary Log Encryption | :heavy_check_mark: | ❌ |
| Temporary File Encryption | :heavy_check_mark: | ❌ |
| Enforced Encryption | :heavy_check_mark: | ❌ |
| **6. Operational Convenience Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| Atomic DDL | :heavy_check_mark: | :heavy_check_mark: |
| Data Dictionary Stored in InnoDB Tables | :heavy_check_mark: | :heavy_check_mark: |
| Fast DDL | :heavy_check_mark: | :heavy_check_mark: |
| SET PERSIST | :heavy_check_mark: | :heavy_check_mark: |
| Invisible Indexes | :heavy_check_mark: | :heavy_check_mark: |
| Thread Pool | :heavy_check_mark: | Enterprise only |
| Backup Locks | :heavy_check_mark: | ❌ |
| Extended SHOW GRANTS | :heavy_check_mark: | ❌ |
| Extended Corrupted Table Actions | :heavy_check_mark: | ❌ |
| Kill Idle Transactions | :heavy_check_mark: | ❌ |
| Extended START TRANSACTION WITH CONSISTENT SNAPSHOT | :heavy_check_mark: | ❌ |

## Preparation Before Migration/Upgrade

First download the GreatSQL 8.0 installation package. It is recommended to choose the latest [GreatSQL 8.0.32-27 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-27). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

It is recommended to use GreatSQL Shell for the pre-upgrade check and fix any possible problems in advance. For details, see: [Upgrade Check](./1-upgrade-to-greatsql8.md#upgrade-check).

This article uses the binary tarball installation method.

Before the formal migration/upgrade, be sure to back up your data. You can use any of the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as mysqldump/xtrabackup to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the nodes, or temporarily take a node offline/exit as a standby node.

Next, determine which of the following situations this migration/upgrade belongs to:

1. Migrate+upgrade from MySQL 5.7 directly to GreatSQL 8.0.32 in one go.
2. Migrate/upgrade from MySQL 8.0.32 and lower versions to GreatSQL 8.0.32.
3. For migrating+upgrading from MySQL 5.6 and lower versions to GreatSQL 8.0.32, you should first upgrade the major versions one by one, e.g., 5.5=>5.6, 5.6=>the latest 5.7, and then upgrade to GreatSQL 8.0.32-27 in one go.

For the first two situations, refer to the method in the document: [Upgrading GreatSQL 5.7 to 8.0](./1-upgrade-to-greatsql8.md) to migrate/upgrade. The process is exactly the same.

This article focuses on the third situation.

## Migration Process

The GreatSQL database does not support direct in-place downgrading, so the **logical backup + import** method is required for migration.

If you start the mysqld binary of GreatSQL 8.0.32-27 directly on the datadir of MySQL 8.0.33 or higher versions, you may see errors similar to the following:
```log
[ERROR] [MY-012530] [InnoDB] Unknown redo log format (5). Please follow the instructions at http://dev.mysql.com/doc/refman/8.0/en/ upgrading-downgrading.html.
[ERROR] [MY-012930] [InnoDB] Plugin initialization aborted with error Generic error.
[ERROR] [MY-010334] [Server] Failed to initialize DD Storage Engine
[ERROR] [MY-010020] [Server] Data Dictionary initialization failed.
[ERROR] [MY-010119] [Server] Aborting
```
Even after restoring with files physically backed up by the xtrabackup tool, it still cannot be started, and similar error messages will be reported.

Therefore, there is only one method, and that is **logical backup + import**.

First, use `mysqldump` to back up all data:
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events > /backup/MySQL/fullbackup-`date +'%Y%m%d'`.sql
```

Copy the backup file to the GreatSQL environment and import it. During the import, errors may be reported; just add the `-f` option and ignore these errors (some tables in the higher version do not exist in the lower version, so skip them).
```bash
$ mysql -S/data/GreatSQL/mysql.sock -f < /backup/MySQL/fullbackup-`date +'%Y%m%d'`.sql

#Error messages similar to the following may be reported; just ignore them
...
ERROR 3723 (HY000) at line 543: The table 'replication_group_configuration_version' may not be created in the reserved tablespace 'mysql'.
ERROR 1146 (42S02) at line 554: Table 'mysql.replication_group_configuration_version' doesn't exist
ERROR 1146 (42S02) at line 555: Table 'mysql.replication_group_configuration_version' doesn't exist
ERROR 1146 (42S02) at line 556: Table 'mysql.replication_group_configuration_version' doesn't exist
ERROR 1146 (42S02) at line 557: Table 'mysql.replication_group_configuration_version' doesn't exist
ERROR 3723 (HY000) at line 567: The table 'replication_group_member_actions' may not be created in the reserved tablespace 'mysql'.
ERROR 1146 (42S02) at line 583: Table 'mysql.replication_group_member_actions' doesn't exist
ERROR 1146 (42S02) at line 584: Table 'mysql.replication_group_member_actions' doesn't exist
ERROR 1146 (42S02) at line 585: Table 'mysql.replication_group_member_actions' doesn't exist
ERROR 1146 (42S02) at line 586: Table 'mysql.replication_group_member_actions' doesn't exist
...
```
If the amount of data is large, the logical backup + import process takes a long time, so be mentally prepared.

## Downgrading to GreatSQL 8.0.32-27

If you want to downgrade from a version after MySQL 8.0.32 to GreatSQL 8.0.32-27, you need to use the logical backup + logical import method to complete the downgrade (it is not supported to start GreatSQL 8.0.32-27 in-place on the original datadir to complete the downgrade replacement). In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade=FORCE` to force the upgrade of all data tables, including system tables.

The downgrade process is roughly as follows:

1. Logically back up all data on the higher version
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

2. Import the logical backup file in the GreatSQL 8.0.32-27 environment to complete logical restore

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

3. Modify my.cnf to ensure `upgrade=FORCE` is set
```ini
[mysqld]
upgrade=FORCE
```

4. Restart GreatSQL to complete the downgrade

```bash
systemctl restart greatsql
```
During the restart, you can see a forced upgrade process similar to the following in the logs

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80032' completed.
```

If `upgrade=FORCE` is not set to force the upgrade of all tables, corruption errors may occur in the system table `mysql.procs_priv`, and an error similar to the following may be reported when creating a user:

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## Notes

The MGR group view UUID feature ([`group_replication_view_change_uuid`](https://dev.mysql.com/doc/refman/8.0/en/group-replication-system-variables.html#sysvar_group_replication_view_change_uuid)) was introduced in MySQL 8.0.26. Therefore, if the version of a current MGR cluster is 8.0.25 or lower, it cannot be smoothly upgraded/migrated to 8.0.26. You need to apply for a downtime maintenance window, perform in-place upgrades on each node of the MGR cluster, and complete the upgrade from 8.0.25 to 8.0.26 or higher.

For details, please refer to: [Smoothly upgrading an MGR cluster from GreatSQL-8.0.25 to GreatSQL-8.0.32](https://greatsql.cn/thread-530-1-1.html).

**Reference Documents**

- [Percona Server for MySQL In-Place Upgrading Guide: From 5.7 to 8.0](https://docs.percona.com/percona-server/8.0/upgrade.html)
- [Changes in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html)
- [Before You Begin](https://dev.mysql.com/doc/refman/8.0/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.0/en/upgrading-what-is-upgraded.html)
- [Smoothly upgrading MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)



**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
