# Why Upgrade to GreatSQL 8.4
---

This article introduces how to upgrade from GreatSQL 8.0 to GreatSQL 8.4.

## Why Upgrade

MySQL 8.4 is the first long-term support (LTS) release. Based on it, GreatSQL 8.4 has many new features and changes compared with GreatSQL 8.0, including but not limited to the following:

- **InnoDB engine related**

The default values of several major InnoDB parameters (not all listed) have changed.

| Parameter | 8.4 Default Value | 8.0 Default Value |
| :--- | :---: | :---: |
| innodb_buffer_pool_in_core_file | OFF when MADV_DONTDUMP is supported, otherwise ON | ON |
| innodb_buffer_pool_instances | 1 when IBP <= 1 GB; automatically calculated by formula when IBP > 1 GB | 8, and 1 when IBP <= 1 GB|
| innodb_change_buffering | none | all |
| innodb_adaptive_hash_index | OFF | ON |
| innodb_doublewrite_files | 2 | innodb_buffer_pool_instances*2 |
| innodb_flush_method (on Linux systems) | O_DIRECT when supported by the system, otherwise fsync | fsync |
| innodb_io_capacity | 1000 | 200 |
| innodb_io_capacity_max | innodb_io_capacity*2 | innodb_io_capacity*2, with a minimum of 2000 |
| innodb_log_buffer_size | 64 MB | 16 MB |
| innodb_numa_interleave | ON | OFF|
| innodb_page_cleaners | innodb_buffer_pool_instances | 4 |
| innodb_parallel_read_threads | number of logical CPU cores/8, with a default minimum of 4 | 4 |
| innodb_purge_threads | 1 when logical CPU cores <= 16, otherwise 4 |  4 |
| innodb_read_io_threads | number of logical CPU cores/8, with a default minimum of 4 | 4 |
| innodb_use_fdatasync | ON | OFF |

- **Temporary table related**

The default values of several parameters related to temporary tables have also changed.

| Parameter | 8.4 Default Value | 8.0 Default Value |
| :--- | :---: | :---: |
| temptable_max_ram | 3% of physical memory, and the default value ranges from 1-4 GB | 1 GB |
| temptable_max_mmap | 0 (disabled) | 1 GB |
| temptable_use_mmap | OFF | ON, with a deprecation notice starting from 8.0.26 |

- **MGR related**

  - 1. The default values of two MGR parameters have changed: the transaction consistency level parameter `group_replication_consistency` has been adjusted from *EVENTUAL* to *BEFORE_ON_PRIMARY_FAILOVER*; the default behavior parameter after a member exits, `group_replication_exit_state_action`, has been adjusted from *READ_ONLY* to *OFFLINE_MODE*.
  - 2. When switching to a new primary in MGR, you need to wait for the current DDL operations (e.g., `ALTER TABLE`) and most DCL operations (e.g., `ALTER DATABASE`) to finish before proceeding.
  - 3. The version compatibility constraints for MGR have also been relaxed: in-place downgrade between minor versions within the same major version is supported (e.g., in-place downgrade from 8.4.2 to 8.4.0). In addition, as long as the major version numbers are the same, multiple members with different minor version numbers can run together (e.g., members with three different minor versions 8.4.0, 8.4.2, and 8.4.3 can run MGR together).
  - 4. A new parameter `group_replication_preemptive_garbage_collection` has been added to MGR. When set to *ON*, preemptive GC (garbage collection) is enabled in single-primary mode, retaining only the writesets of transactions that have not yet been committed. This can save time and memory consumption. In addition, a new parameter `group_replication_preemptive_garbage_collection_rows_threshold` has been added to set the minimum number of certified transactions required to trigger preemptive GC, with a default of 100000.

- **Source-replica replication and Clone related**
  - 1. The Clone plugin no longer strictly requires the minor version numbers to match; cloning within the same major version is allowed. This is a nice feature, and we hope compatibility can be further improved in the future to support cloning data across different major versions.
  - 2. In source-replica replication, the default value of the parameter `SOURCE_RETRY_COUNT` has been adjusted from 86400 to 10. That is, the default behavior is to retry 10 times, with an interval of 60 seconds each time, for a total of 10 minutes. In 8.0, the default behavior was to retry 86400 times, with an interval of 60 seconds each time, for a total of 60 days.
  - 3. Different tags can be set for GTID transactions, which is friendly for operations, e.g., special tags can be added to some special operations for easier differentiation later.
  - 4. When executing `START REPLICA` on the replica to start the replication threads, the clause `SQL_AFTER_GTIDS` supports multi-threaded parallel replay working mode. Previously, when multi-threaded parallel replay was enabled, adding `SQL_AFTER_GTIDS` would raise an *ER_MTA_FEATURE_IS_NOT_SUPPORTED* warning and automatically switch to single-threaded replay mode.

- **Others**
  - 1. Histogram statistics can be updated automatically whether or not the `ANALYZE TABLE` statement is executed. The automatic update rules are the same as those for automatic updating of InnoDB table statistics. For details, refer to the [`innodb_stats_auto_recalc` parameter](https://dev.mysql.com/doc/refman/8.4/en/innodb-persistent-stats.html#innodb-persistent-stats-auto-recalc) and [MySQL 8.4 new feature: automatic histogram updates](https://mp.weixin.qq.com/s/IWSMjRwye7xozJ3iwIdYtg).
  - 2. By default, the **mysql_native_password** authentication plugin is disabled. If you need to be compatible with older applications, add the corresponding parameter to the configuration file: `mysql_native_password=ON`.
  - 3. A new `--output-as-version` parameter has been added to **mysqldump**, which supports setting a compatibility mode for older versions.
  - 4. A corresponding privilege *FLUSH_PRIVILEGES* has been added for `FLUSH PRIVILEGES`.
  - 5. Some new reserved keywords have been added: `AUTO, BERNOULLI, GTIDS, LOG, MANUAL, PARALLEL, PARSE_TREE, QUALIFY, S3, TABLESAMPLE`. These reserved keywords cannot be used as names of database objects such as databases, tables, and columns.

- **Deprecated or no longer recommended features and parameters**

  The following features and parameters are planned to be deprecated in the future:

  - 1. The parameter `binlog_transaction_dependency_tracking`, because the *WRITESET* mechanism is always used now.
  - 2. The parameter `group_replication_allow_local_lower_version_join`.
  - 3. Starting from 8.3.0, MGR group member metadata information is shared among members, so it is no longer necessary to rely on group view change events. Accordingly, the parameter `group_replication_view_change_uuid` is no longer needed.
  - 4. The deprecated function `WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS()`.
  - 5. In source-replica replication, if GTID mode is enabled, transactions that have already been applied are automatically ignored, which means that the `IGNORE_SERVER_IDS` parameter is incompatible with GTID mode.
  - 6. The deprecated parameter `expire_logs_days`, replaced by the `binlog_expire_logs_seconds` parameter.
  - 7. The deprecated parameter `group_replication_recovery_complete_at`. Starting from 8.4.0, the strategy during distributed transaction recovery is always: a new member is marked online only after it has received, certified, and applied all transactions that occurred before it joined the group; this is equivalent to the effect of setting `group_replication_recovery_complete_at = TRANSACTIONS_APPLIED` in earlier versions.
  - 8. In source-replica replication, most **MASTER/SLAVE** keywords are no longer supported and have been replaced by **SOURCE/REPLICA** keywords.

Overall, GreatSQL 8.4 seems to be a continuation of 8.0 and becomes an LTS release. The changes between the two versions are not too big, and they are mainly focused on the InnoDB engine. Both developers and DBAs can adapt to and accommodate them quickly. If conditions permit, it is recommended to complete the upgrade as early as possible.

## Preparation Before Upgrade

The compatibility relationship table for **upgrade/downgrade** between several major future versions is an important reference when choosing a specific version (this table is excerpted from the WeChat official account **MySQL Solution Engineer** run by Mr. Xu Yitao):

- **Upgrade**

| | In-Place | Clone | Async Replication | Dump/Load |
| :--- | :---: | :---: | :---: | :---: |
| LTS 8.4 → LTS 9.7 | ✓ | ✗ |✓ |✓ |
| LTS 8.4.11 → LTS 8.4.20 |✓ |✓ |✓ |✓ |
| Innovation 8.1 → 8.2 | ✓ | ✗ |✓ |✓ |
| Innovation 8.1 → 8.3 | ✓ | ✗ |✓ |✓ |
| Innovation 9.1 → LTS 9.7 | ✓ | ✗ |✓ |✓ |
| LTS 8.4 →  LTS 10.7 | ✗ | ✗ | ✗ | ✗ |

- **Downgrade**

| | In-Place | Clone | Async Replication | Dump/Load |
| :--- | :---: | :---: | :---: | :---: |
| LTS 8.4.20 → 8.4.11 | ✓ | ✓ | ✓ | ✓ |
| LTS 9.7 → LTS 8.4 | ✗ | ✗ | ✓\* | ✓\* |
| LTS 9.7 → Innovation 9.6 | ✗ | ✗ | ✓\* | ✓\* |
| LTS 9.7 → Innovation 9.5 | ✗ | ✗ | ✓\* | ✓\* |

\*Indicates used for rollback purposes only.

### Notes

When upgrading from GreatSQL 8.0 to 8.4, please carefully check the following notes for any conflicts or incompatibilities:

1. It is best to first upgrade to the latest version of GreatSQL 8.0, then to the latest version of 8.4. Do not upgrade directly from versions such as 5.6 or 5.7 to 8.4.
1. The `caching_sha2_password` password plugin is used by default, which may prevent connection drivers and clients from some older versions from connecting to the server; they also need to be upgraded accordingly.
1. New reserved words and keywords have been added. For details, see: [2.6 Reserved Words & Keywords](../2-about-greatsql/7-greatsql-keywords.md).
1. Some parameter options are no longer supported, e.g., `expire_logs_days`, `binlog_transaction_dependency_tracking`, `group_replication_allow_local_lower_version_join`, etc.
1. Some features and functions are no longer supported, e.g., `WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS`, etc.
1. In source-replica replication, most **MASTER/SLAVE** keywords are no longer supported and have been replaced by **SOURCE/REPLICA** keywords.

For more details, see: [What Is New in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html).

### Upgrade Preparation

First download the GreatSQL 8.4 installation package. It is recommended to choose the latest [GreatSQL 8.4.4-5 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-5). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

This article assumes that both before and after the upgrade, the binary tarball installation method is used.

Before the formal upgrade, be sure to back up your data. You can use any of the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as `mysqldump`/`xtrabackup` to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the members, or temporarily take a member offline/exit as a standby member.

## Upgrade Process

There are several upgrade methods to choose from.

### In-Place Upgrade (Recommended)

If the database can be stopped for maintenance, the in-place upgrade method is the simplest.

After the backup is complete, shut down the database instance. Before shutting down the database instance, be sure to set the option `innodb_fast_shutdown=0` to ensure that you get a clean, normally shut-down set of database files.

First modify the `my.cnf` configuration file, adding a line in the `[mysqld]` section:
```ini
upgrade=FORCE
```

Then modify the correct `basedir` to point to the new version's binary file path, and start the GreatSQL 8.4 service again. The automatic upgrade can then be completed. In addition to system tables, user tables will also be fully upgraded.

**Note:** This method does not support upgrading directly from 5.6 or 5.7 to 8.4.

The log output during the upgrade process is similar to the following:
```log
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' started.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.4.4-5'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 5, Revision 39b389cdf3b.
```

If you want to see the complete upgrade process, you can also add two options `log_error_verbosity=3` and `innodb_print_ddl_logs=ON`, and much more logs will be output:

```log
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[Note] [MY-011088] [Server] Data dictionary initializing version '80032'.
[Note] [MY-010337] [Server] Created Data Dictionary for upgrade
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-010006] [Server] Using data dictionary with version '80032'.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' started.
[Note] [MY-013386] [Server] Running queries to upgrade MySQL server.
...
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=1, thread_id=5, table_id=1072, new_file_path=mysql/default_roles
]
[Note] [MY-012478] [InnoDB] DDL log delete : 1
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=2, thread_id=5, space_id=4294967294, index_id=57, page_no=542]
[Note] [MY-012478] [InnoDB] DDL log delete : 2
[Note] [MY-012485] [InnoDB] DDL log post ddl : begin for thread id : 5
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 5
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=3, thread_id=5, table_id=1073, new_file_path=mysql/role_edges]
[Note] [MY-012478] [InnoDB] DDL log delete : 3
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=4, thread_id=5, space_id=4294967294, index_id=58, page_no=543]
[Note] [MY-012478] [InnoDB] DDL log delete : 4
[Note] [MY-012485] [InnoDB] DDL log post ddl : begin for thread id : 5
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 5
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=744, thread_id=5, table_id=1171, new_file_path=mysql/help_relation]
...
[Note] [MY-012478] [InnoDB] DDL log delete : 744
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=745, thread_id=5, space_id=4294967294, index_id=189, page_no=1183]
[Note] [MY-012478] [InnoDB] DDL log delete : 745
[Note] [MY-012485] [InnoDB] DDL log post ddl : begin for thread id : 5
[Note] [MY-012479] [InnoDB] DDL log replay : [DDL record: DROP, id=743, thread_id=5, table_id=1146]
[Note] [MY-012479] [InnoDB] DDL log replay : [DDL record: FREE, id=742, thread_id=5, space_id=4294967294, index_id=156, page_no=835]
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 5
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'greatsql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80404' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.4.4-5'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 5, Revision 39b389cdf3b.
```

**Suggestion:** After the GreatSQL 8.4 service has been started for the first time, shut it down and start it again to ensure the upgrade is successful.

That completes the upgrade. It is very convenient and effortless.

### Rolling Upgrade

With the source-replica replication or MGR architecture, you can use the rolling upgrade method: first upgrade and verify on the replica members, then upgrade the primary, and finally all members are upgraded to GreatSQL 8.4.

For details, refer to the article: [Smooth upgrade of MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg). Based on the approach in that article, after smoothly upgrading MySQL 5.7 to GreatSQL 5.7, use the same method to upgrade to GreatSQL 8.4.

Finally, be sure to check whether there are error messages in the logs output during the upgrade process. If not, the upgrade process went smoothly.

After the upgrade is complete, remember to comment out the `upgrade=FORCE` option in the `my.cnf` file, or change it to `upgrade=AUTO`.

**Reference Documents**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [Smooth upgrade of MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
