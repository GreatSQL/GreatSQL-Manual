# Migrating from Percona to GreatSQL
---

This article introduces how to migrate/upgrade from Percona to the GreatSQL database.

## Why Migrate/Upgrade

GreatSQL is an open-source branch forked from Percona. Compared with Percona, GreatSQL has many excellent new features and improvements, including but not limited to the following:

| **1. Main Features** | GreatSQL 8.4.4-5 | Percona 8.4.4-4 |
| :--- | :---: | :---: |
| LoongArch support | :heavy_check_mark: | ❌ |
| RISC-V support | :heavy_check_mark: | ❌ |
| Restoring some source-replica replication compatibility interfaces | :heavy_check_mark: | ❌ |
| **2. Performance Enhancement Extensions** | GreatSQL 8.4.4-5 | Percona 8.4.4-4 |
| Rapid Engine | :heavy_check_mark: | HeatWave only in cloud |
| Turbo Engine | :heavy_check_mark: | ❌ |
| Turbo Engine vector similarity search | :heavy_check_mark: | ❌ |
| Large transaction binlog independent flush optimization | :heavy_check_mark: | ❌ |
| Parallel replication replay optimization | :heavy_check_mark: | ❌ |
| Execution plan drift detection | :heavy_check_mark: | ❌ |
| NUMA affinity optimization | :heavy_check_mark: | ❌ |
| Non-blocking DDL | :heavy_check_mark: | ❌ |
| Import optimization for tables without a primary key | :heavy_check_mark: | ❌ |
| InnoDB parallel query | :heavy_check_mark: | primary key scan only |
| Parallel LOAD DATA | :heavy_check_mark: | ❌ |
| InnoDB transaction ReadView lock-free optimization | :heavy_check_mark: | ❌ |
| InnoDB transaction large lock split optimization | :heavy_check_mark: | ❌ |
| **3. Developer-Oriented Improvements** | GreatSQL 8.4.4-5 | Percona 8.4.4-4 |
| Oracle compatibility - data types | :heavy_check_mark: | ❌ |
| Oracle compatibility - functions | :heavy_check_mark: | ❌ |
| Oracle compatibility - SQL syntax | :heavy_check_mark: | ❌ |
| Oracle compatibility - stored routines | :heavy_check_mark: | ❌ |
| **4. Basic Feature Improvements** | GreatSQL 8.4.4-5 | Percona 8.4.4-4 |
| MGR enhancement - zone tags | :heavy_check_mark: | ❌ |
| MGR enhancement - arbitrator | :heavy_check_mark: | ❌ |
| MGR enhancement - read/write node bound VIP | :heavy_check_mark: | ❌ |
| MGR enhancement - fast single-primary mode | :heavy_check_mark: | ❌ |
| MGR enhancement - smart primary election | :heavy_check_mark: | ❌ |
| MGR enhancement - new flow control algorithm | :heavy_check_mark: | ❌ |
| MGR enhancement - network partition exception handling |  :heavy_check_mark: | ❌ |
| MGR enhancement - node abnormal exit handling | :heavy_check_mark: | ❌ |
| MGR enhancement - node disk full handling | :heavy_check_mark: | ❌ |
| MGR enhancement - automatic donor node selection | :heavy_check_mark: | ❌ |
| MGR enhancement - large transaction compression optimization | :heavy_check_mark: | ❌ |
| MGR enhancement - viewing replication lag in seconds | :heavy_check_mark: | ❌ |
| Clone incremental backup | :heavy_check_mark: | ❌ |
| Clone backup compression | :heavy_check_mark: | ❌ |
| Binlog read speed limit | :heavy_check_mark: | ❌ |
| **5. Security Enhancements** | GreatSQL 8.4.4-5 | Percona 8.4.4-4 |
| GMSSL support | :heavy_check_mark: | ❌ |
| Backup encryption | :heavy_check_mark: | ❌ |
| Policy-based data masking | :heavy_check_mark: | ❌ |

## Preparation Before Migration/Upgrade

First download the GreatSQL 8.4 installation package. It is recommended to choose the latest [GreatSQL 8.4.4-5 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-5). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

This article uses the binary tarball installation method.

Before the formal migration/upgrade, be sure to back up your data. You can use any of the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as `mysqldump`/`xtrabackup` to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the members, or temporarily take a member offline/exit as a standby member.

Next, determine which of the following situations this migration/upgrade belongs to:

1. Migrate+upgrade from Percona 8.0 directly to GreatSQL 8.4.4-5 in one go.
2. Migrate/upgrade from Percona 8.4.4-4 and earlier versions to GreatSQL 8.4.4-5.
3. Migrate+upgrade from MySQL 5.7 and lower versions to GreatSQL 8.4.4-5.

For the first two situations, refer to the method in the document: [Upgrading from GreatSQL 8.0 to 8.4](./1-upgrade-to-greatsql8.md) to migrate/upgrade. The process is exactly the same.

For the third situation, you should first upgrade the major versions one by one, e.g., 5.6 => 5.7, 5.7 => the latest 8.0, and then upgrade to GreatSQL 8.4.4-5. You can also use `mysqldump` to fully back up the data in the lower-version database and then import it into the GreatSQL 8.4.4-5 database environment to complete the upgrade in one go.

## Downgrading to GreatSQL 8.4.4-5

If you want to downgrade from Percona 8.4.4-4 and later versions to GreatSQL 8.4.4-5, refer to the following steps.

**1. Uninstall the telemetry component and shut down the Percona service safely**

```sql
greatsql> UNINSTALL COMPONENT 'file://component_percona_telemetry';
greatsql> SET GLOBAL innodb_fast_shutdown=1;
greatsql> SHUTDOWN;
```
**2. Modify the `my.cnf` configuration file**

Modify the `basedir` parameter to point to GreatSQL 8.4.4-5, and add the `upgrade=FORCE` parameter.

**3. Start the GreatSQL database service to complete the in-place downgrade.**

After the upgrade/downgrade is complete, remember to comment out the `upgrade=FORCE` option in the `my.cnf` file, or change it to `upgrade=AUTO`.

**Reference Documents**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [Smooth upgrade of MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
