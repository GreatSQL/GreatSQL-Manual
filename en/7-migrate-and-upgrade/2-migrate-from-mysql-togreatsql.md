# Migrating from MySQL to GreatSQL
---

This article introduces how to migrate/upgrade from MySQL to the GreatSQL database.

## Why Migrate/Upgrade

Compared with MySQL Community Edition, GreatSQL has many excellent features, including but not limited to the following:

| **1. Major Features** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
| :--- | :---: | :---: |
| Open Source |  :heavy_check_mark: |  :heavy_check_mark: |
| ACID Integrity | :heavy_check_mark: | :heavy_check_mark: |
| MVCC Features | :heavy_check_mark:     | :heavy_check_mark: |
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
| **2. Performance Enhancement Extensions** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|Rapid Engine| :heavy_check_mark: | HeatWave (cloud only) |
|Turbo Engine| :heavy_check_mark: | ❌ |
|NUMA Affinity Optimization| :heavy_check_mark: | ❌ |
|Non-Blocking DDL| :heavy_check_mark: | ❌ |
|Import Optimization for Tables Without Primary Key| :heavy_check_mark: | ❌ |
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
| **3. Developer-Oriented Improvements** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level Interface| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Full-Text Search Improvements| :heavy_check_mark: | ❌ |
|More Hash/Digest Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Data Types| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - SQL Syntax| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Stored Programs| :heavy_check_mark: | ❌ |
| **4. Basic Feature Enhancements** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
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
| **5. Security Enhancements** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|National Cryptographic Algorithm Support| :heavy_check_mark: | ❌ |
|Backup Encryption| :heavy_check_mark: | ❌ |
|Auditing| :heavy_check_mark: | Enterprise Edition only |
|Data Masking| :heavy_check_mark: | ❌ |
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
| **6. Operations Convenience Enhancements** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
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

## Preparation Before Migration/Upgrade

First download the GreatSQL 8.4 installation package. It is recommended to choose the latest [GreatSQL 8.4.4-4 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-4). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

This article uses the binary tarball installation method.

Before the formal migration/upgrade, be sure to back up your data. You can use any of the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as `mysqldump`/`xtrabackup` to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the members, or temporarily take a member offline/exit as a standby member.

Next, determine which of the following situations this migration/upgrade belongs to:

1. Migrate+upgrade from MySQL 8.0 directly to GreatSQL 8.4.4-4 in one go.
2. Migrate/upgrade from Percona 8.4.4-4 and earlier versions to GreatSQL 8.0.32.
3. Migrate+upgrade from MySQL 5.7 and lower versions to GreatSQL 8.4.4-4.

For the first two situations, refer to the method in the document: [Upgrading from GreatSQL 8.0 to 8.4](./1-upgrade-to-greatsql8.md) to migrate/upgrade. The process is exactly the same.

For the third situation, you should first upgrade the major versions one by one, e.g., 5.6 => 5.7, 5.7 => the latest 8.0, and then upgrade to GreatSQL 8.4.4-4. You can also use `mysqldump` to fully back up the data in the lower-version database and then import it into the GreatSQL 8.4.4-4 database environment to complete the upgrade in one go.

## Downgrading to GreatSQL 8.4.4-4

In the GreatSQL 8.4 LTS release, in-place upgrade/downgrade between different minor versions is supported, while in other releases direct in-place downgrade is not supported. Therefore, it is recommended to use the **logical backup + import** method to complete the migration.

If you want to downgrade from MySQL 9.0 and later versions to GreatSQL 8.4.4-4, you need to use the logical backup + logical import method to complete the downgrade (it is not supported to start GreatSQL 8.4.4-4 in-place on the original `datadir` to complete the downgrade replacement). In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade=FORCE` to force the upgrade of all data tables, including system tables.

The downgrade process is roughly as follows:

**1. Logically back up all data on the higher version**

```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. Import the logical backup file in the GreatSQL 8.4.4-4 environment to complete logical restore**

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

**3. Modify `my.cnf` to ensure `upgrade=FORCE` is set**

```ini
[mysqld]
upgrade=FORCE
```

**4. Restart GreatSQL to complete the downgrade**

```bash
systemctl restart greatsql
```
During the restart, you can see a forced upgrade process similar to the following in the logs:

```log
[System] [MY-013381] [Server] Server upgrade from '80404' to '80404' started.
[System] [MY-013381] [Server] Server upgrade from '80404' to '80404' completed.
```

If `upgrade=FORCE` is not set to force the upgrade of all tables, corruption errors may occur in the system table `mysql.procs_priv`, and an error similar to the following may be reported when creating a user:

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

After the upgrade/downgrade is complete, remember to comment out the `upgrade=FORCE` option in the `my.cnf` file, or change it to `upgrade=AUTO`.

**Reference Documents**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [Smooth upgrade of MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
