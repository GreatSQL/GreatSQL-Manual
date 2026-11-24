# Migrating from Percona to GreatSQL
---

This article introduces how to migrate/upgrade from Percona to the GreatSQL database.

## Why Migrate/Upgrade

GreatSQL is an open-source branch forked from Percona, focusing on improving MGR reliability and performance, and supporting features such as InnoDB parallel query.

GreatSQL has many excellent features compared with Percona, including but not limited to the following:

| **1. Main Features** | GreatSQL 8.0.32-27 | Percona 8.0.32-24 |
| :--- | :---: | :---: |
| LoongArch support | :heavy_check_mark: | ❌ |
| **2. Performance Enhancement Extensions** | GreatSQL 8.0.32-27 | Percona 8.0.32-24 |
| Rapid Engine | :heavy_check_mark: | HeatWave only in cloud |
| Turbo Engine | :heavy_check_mark: | ❌ |
| NUMA affinity optimization | :heavy_check_mark: | ❌ |
| Non-blocking DDL | :heavy_check_mark: | ❌ |
| Import optimization for tables without a primary key | :heavy_check_mark: | ❌ |
| InnoDB parallel query | :heavy_check_mark: | primary key scan only |
| Parallel LOAD DATA | :heavy_check_mark: | ❌ |
| InnoDB transaction ReadView lock-free optimization | :heavy_check_mark: | ❌ |
| InnoDB transaction large lock split optimization | :heavy_check_mark: | ❌ |
| **3. Developer-Oriented Improvements** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
| Oracle compatibility - data types | :heavy_check_mark: | ❌ |
| Oracle compatibility - functions | :heavy_check_mark: | ❌ |
| Oracle compatibility - SQL syntax | :heavy_check_mark: | ❌ |
| Oracle compatibility - stored routines | :heavy_check_mark: | ❌ |
| **4. Basic Feature Improvements** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
| MGR enhancement - zone tags | :heavy_check_mark: | ❌ |
| MGR enhancement - arbitrator | :heavy_check_mark: | ❌ |
| MGR enhancement - read/write node bound VIP | :heavy_check_mark: | ❌ |
| MGR enhancement - fast single-primary mode | :heavy_check_mark: | ❌ |
| MGR enhancement - smart primary election | :heavy_check_mark: | ❌ |
| MGR enhancement - new flow control algorithm | :heavy_check_mark: | ❌ |
| MGR enhancement - network partition exception handling | :heavy_check_mark: | ❌ |
| MGR enhancement - node abnormal exit handling | :heavy_check_mark: | ❌ |
| MGR enhancement - node disk full handling | :heavy_check_mark: | ❌ |
| MGR enhancement - automatic donor node selection | :heavy_check_mark: | ❌ |
| Clone incremental backup | :heavy_check_mark: | ❌ |
| Clone backup compression | :heavy_check_mark: | ❌ |
| Binlog read speed limit | :heavy_check_mark: | ❌ |
| **5. Security Enhancements** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
| National Cryptographic (GM) Support | :heavy_check_mark: | ❌ |
| Backup encryption | :heavy_check_mark: | ❌ |
| Policy-based data masking | :heavy_check_mark: | ❌ |
| Audit log into tables | :heavy_check_mark: | ❌ |
| Last login recording | :heavy_check_mark: | ❌ |

## Preparation Before Migration/Upgrade

First download the GreatSQL 8.0 installation package. It is recommended to choose the latest [GreatSQL 8.0.32-25 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-25). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

It is recommended to use GreatSQL Shell for the pre-upgrade check and fix any possible problems in advance. For details, see: [Upgrade Check](./1-upgrade-to-greatsql8.md#upgrade-check).

This article uses the binary tarball installation method.

Before the formal migration/upgrade, be sure to back up your data. You can use any of the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as mysqldump/xtrabackup to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the nodes, or temporarily take a node offline/exit as a standby node.

Next, determine which of the following situations this migration/upgrade belongs to:

1. Migrate+upgrade from Percona 5.7 directly to GreatSQL 8.0.32 in one go.
2. Migrate/upgrade from Percona 8.0.32 and lower versions to GreatSQL 8.0.32.
3. For migrating+upgrading from Percona 5.6 and lower versions to GreatSQL 8.0.32, you should first upgrade the major versions one by one, e.g., 5.5=>5.6, 5.6=>the latest 5.7, and then upgrade to GreatSQL 8.0.32-25 in one go.

For the first two situations, refer to the method in the document: [Upgrading GreatSQL 5.7 to 8.0](./1-upgrade-to-greatsql8.md) to migrate/upgrade. The process is exactly the same.

For the third situation, refer to the **logical backup + import** method introduced in the document: [Migrating from MySQL to GreatSQL](./2-migrate-from-mysql-togreatsql.md) to perform the downgrade.

Migrating from Percona to GreatSQL is the fastest. The metadata database tables are almost identical, and the InnoDB table data is universal, so a smooth migration can almost be achieved.

## Downgrading to GreatSQL 8.0.32-27

If you want to downgrade from a version after Percona 8.0.32 to GreatSQL 8.0.32-27, you need to use the logical backup + logical import method to complete the downgrade (it is not supported to start GreatSQL 8.0.32-27 in-place on the original datadir to complete the downgrade replacement). In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade=FORCE` to force the upgrade of all data tables, including system tables.

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
