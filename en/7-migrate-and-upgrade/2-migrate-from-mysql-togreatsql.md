# Migrating from MySQL to GreatSQL
---

This article introduces how to migrate/upgrade from MySQL to the GreatSQL database.

## Why Migrate/Upgrade

Compared with MySQL Community Edition, GreatSQL has many excellent features. For details, see: [GreatSQL vs MySQL](../1-docs-intro/relnotes/changes-greatsql-8445.md#greatsql-vs-mysql).

## Preparation Before Migration/Upgrade

First download the GreatSQL 8.4 installation package. It is recommended to choose the latest [GreatSQL 8.4.4-5 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-5). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

This article uses the binary tarball installation method.

Before the formal migration/upgrade, be sure to back up your data. You can use any of the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as `mysqldump`/`xtrabackup` to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the members, or temporarily take a member offline/exit as a standby member.

Next, determine which of the following situations this migration/upgrade belongs to:

1. Migrate+upgrade from MySQL 8.0 directly to GreatSQL 8.4.4-5 in one go.
2. Migrate/upgrade from Percona 8.4.4-4 and earlier versions to GreatSQL 8.4.4-5.
3. Migrate+upgrade from MySQL 5.7 and lower versions to GreatSQL 8.4.4-5.

For the first two situations, refer to the method in the document: [Upgrading from GreatSQL 8.0 to 8.4](./1-upgrade-to-greatsql8.md) to migrate/upgrade. The process is exactly the same.

For the third situation, you should first upgrade the major versions one by one, e.g., 5.6 => 5.7, 5.7 => the latest 8.0, and then upgrade to GreatSQL 8.4.4-5. You can also use `mysqldump` to fully back up the data in the lower-version database and then import it into the GreatSQL 8.4.4-5 database environment to complete the upgrade in one go.

## Downgrading to GreatSQL 8.4.4-5

In the GreatSQL 8.4 LTS release, in-place upgrade/downgrade between different minor versions is supported, while in other releases direct in-place downgrade is not supported. Therefore, it is recommended to use the **logical backup + import** method to complete the migration.

If you want to downgrade from MySQL 9.0 and later versions to GreatSQL 8.4.4-5, you need to use the logical backup + logical import method to complete the downgrade (it is not supported to start GreatSQL 8.4.4-5 in-place on the original `datadir` to complete the downgrade replacement). In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade=FORCE` to force the upgrade of all data tables, including system tables.

The downgrade process is roughly as follows:

**1. Logically back up all data on the higher version**

```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. Import the logical backup file in the GreatSQL 8.4.4-5 environment to complete logical restore**

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
