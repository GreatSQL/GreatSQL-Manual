# Upgrading GreatSQL 5.7 to 8.0

---

This document describes how to upgrade from GreatSQL 5.7/MySQL 5.7 to GreatSQL 8.0.

## Why Upgrade

GreatSQL 8.0 has many excellent new features compared with GreatSQL 5.7, including but not limited to the following:

| Feature | GreatSQL 8.0 | GreatSQL/MySQL 5.7 |
| --- | ---|---|
| LoongArch Support | :heavy_check_mark: | ❌ |
| Rapid Engine | :heavy_check_mark: | HeatWave only on cloud |
| Turbo Engine | :heavy_check_mark: | ❌ |
| Parallel LOAD DATA | :heavy_check_mark: | ❌ |
| Lock-free InnoDB Transaction ReadView Optimization | :heavy_check_mark: | ❌ |
| InnoDB Transaction Large Lock Splitting Optimization | :heavy_check_mark: | ❌ |
| Fast DDL | :heavy_check_mark: | :heavy_check_mark: |
| NUMA Affinity Optimization | :heavy_check_mark: | ❌ |
| Non-blocking DDL | :heavy_check_mark: | ❌ |
| Faster Import for Tables without Primary Keys | :heavy_check_mark: | ❌ |
| InnoDB Parallel Query | :heavy_check_mark: | Primary-key scan only |
| Parallel LOAD DATA | :heavy_check_mark: | ❌ |
| Atomic DDL | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Resource Groups | :heavy_check_mark: | :heavy_check_mark: |
| Contention-Aware Transaction Scheduling | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Mutex Splitting Optimization | :heavy_check_mark: | ❌ |
| MEMORY Engine Optimization | :heavy_check_mark: | ❌ |
| InnoDB Flushing Optimization | :heavy_check_mark: | ❌ |
| Fast InnoDB Index Creation Optimization | :heavy_check_mark: | ❌ |
| Parallel Doublewrite Buffer | :heavy_check_mark: | :heavy_check_mark: |
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
| Oracle Compatibility - Data Types | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Functions | :heavy_check_mark: | ❌ |
| Oracle Compatibility - SQL Syntax | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Stored Routines | :heavy_check_mark: | ❌ |
| Clone Incremental Backup | :heavy_check_mark: | ❌ |
| Clone Backup Compression | :heavy_check_mark: | ❌ |
| Binlog Read Speed Limit | :heavy_check_mark: | ❌ |
| Hash Join | :heavy_check_mark: | ❌ |
| Anti Join Optimization | :heavy_check_mark: | ❌ |
| Optimizer Histograms | :heavy_check_mark: | :heavy_check_mark: |
| Descending Indexes | :heavy_check_mark: | ❌ |
| Invisible Indexes | :heavy_check_mark: | ❌ |
| Functional/Expression Indexes | :heavy_check_mark: | ❌ |
| Multi-Valued Indexes | :heavy_check_mark: | ❌ |
| CTE | :heavy_check_mark: | ❌ |
| Window Functions | :heavy_check_mark: | ❌ |
| EXPLAIN ANALYZE | :heavy_check_mark: | ❌ |
| Clone Plugin | :heavy_check_mark: | ❌ |
| New Data Dictionary | :heavy_check_mark: | ❌ |
| More Flexible Upgrade | :heavy_check_mark: | ❌ |
| Multiple Security Enhancements | :heavy_check_mark: | ❌ |
| Multiple InnoDB Enhancements | :heavy_check_mark: | ❌ |
| Multiple Optimizer Enhancements | :heavy_check_mark: | ❌ |
| Thread Pool | :heavy_check_mark: | Enterprise only |
| Backup Locks | :heavy_check_mark: | ❌ |
| National Cryptographic (GM) Support | :heavy_check_mark: | ❌ |
| Data Masking | :heavy_check_mark: | ❌ |
| Last Login Recording | :heavy_check_mark: | ❌ |
| Backup Encryption | :heavy_check_mark: | ❌ |
| Auditing | :heavy_check_mark: | ❌ |

## Preparation Before Upgrade

### Notes

When upgrading from 5.7 to 8.0, the following points require attention. Please carefully check whether there are any conflicts or incompatibilities:

1. It is best to first upgrade to the latest 5.7.x version, and then to the latest 8.0.x version. Do not upgrade directly from a minor 5.7 version to 8.0, especially from a non-GA version.
1. In 8.0, except for `general_log` and `slow_log`, all other metadata dictionary data is stored in InnoDB tables, and MyISAM tables are no longer used.
1. In 8.0, the `caching_sha2_password` authentication plugin is used by default. This may prevent some older connection drivers and clients from connecting to the 8.0 server, and they need to be upgraded as well.
1. In 8.0, the default character set is `utf8mb4`, while in 5.7 the default character set is `utf8` (also `utf8mb3`). Pay attention to the before/after comparison checks when migrating data.
1. In 8.0, be sure to set the `lower_case_table_names` option before startup, and it cannot be changed after the instance is started. Be especially careful when migrating from old systems that do not distinguish case.
1. In 8.0, the default value of the parameter `explicit_defaults_for_timestamp` is `ON`, which may affect the default behavior of `timestamp` columns.
1. In 8.0, `event_scheduler` is enabled by default. It is recommended to disable it on all secondary nodes in source-replica replication or MGR.
1. In 8.0, the results of `GROUP BY` queries are no longer sorted by default; you need to explicitly add `ORDER BY`.
1. New reserved words and keywords have been added. For details, see: [2.6 Reserved Words & Keywords](../2-about-greatsql/7-greatsql-keywords.md).
1. Except for InnoDB and NDB, other engines no longer support table partitioning.
1. SQL Mode no longer supports `NO_AUTO_CREATE_USER`, which means you cannot directly use `GRANT` to create and authorize a new user. You need to `CREATE USER` first, and then grant privileges.
1. Some parameter options are no longer supported, for example: `innodb_locks_unsafe_for_binlog`, `old_passwords`, query cache-related parameters, etc.
1. Some features and functions are no longer supported, for example: `query cache`, `PASSWORD()`, `ENCODE()`, `DECODE()`, `ENCRYPT()`, etc.

For more details, see: [What Is New in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/mysql-nutshell.html).

### Upgrade Check

Before officially starting, it is recommended to use GreatSQL Shell to run a comprehensive check on the old database instance to confirm whether there are any incompatibilities after the upgrade.

Download the [latest GreatSQL Shell release](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27) here.

After downloading, extract it to the */usr/local* directory.

```bash
tar xf /tmp/greatsql-shell-8.0.32-25-glibc2.28-x86_64.tar.xz -C /usr/local
```

Run the following command to perform the pre-upgrade check with GreatSQL Shell:

```bash
/usr/local/greatsql-shell-8.0.32-25-glibc2.28-x86_64/bin/mysqlsh -- util checkForServerUpgrade \
  --socket=/data/GreatSQL/mysql.sock --target-version=8.0.32 \
  --output-format=JSON --config-path=/etc/my.cnf > /tmp/upgradecheck_57_to_8032.log
```

Where:
- `-- util checkForServerUpgrade` indicates that a pre-upgrade check is to be performed;
- `--socket` specifies the local SOCKET file; it can also be changed to the account/password format, for example: `user:password@127.0.0.1:3306`;
- `--target-version` specifies the version number after the upgrade. If not specified, it defaults to the current version number of GreatSQL Shell;
- `--output-format` specifies the output log format, JSON by default;
- `--config-path` specifies the configuration file path to be checked;

After the check is complete, you need to manually confirm whether there are items marked as Errors level in the results. All such items must be fixed first.

```bash
mysqlsh -- util checkForServerUpgrade \
  --socket=./data/mysql.sock --target-version=8.0.32 \
  --output-format=JSON --config-path=./my.cnf > /tmp/upgradecheck_57_to_8032.log
...
    "serverAddress": "%2Fdata%2FGreatSQL%2Fmysql.sock",
    "serverVersion": "5.7.36-39 (GreatSQL, Release 39, Revision a2ce7ad3400)",
    "targetVersion": "8.0.32",
    "errorCount": 0,
    "warningCount": 16,
    "noticeCount": 1,
    "summary": "No fatal errors were found that would prevent an upgrade, but some potential issues were detected. Please ensure that the reported issues are not significant before upgrading.",
...
```

GreatSQL Shell performs multiple detailed checks, reports the results of each check one by one, and gives further suggestions. The main checks include:
- Whether there are unsupported data or index types, or data types that are unreasonably defined/out of range, etc.;
- Whether there are table name case incompatibility issues; pay attention to setting the correct `lower_case_table_names` parameter value;
- Whether object names contain reserved words/keywords; object names need to be enclosed in backticks. For details, see: [Reserved Words & Keywords](../2-about-greatsql/7-greatsql-keywords.md);
- Whether the utf8mb3 character set is used; it is recommended to convert to utf8mb4;
- Whether there are unsupported SQL MODE values;
- Whether there are dates like '0000-00-00', which are not allowed by default in 8.0;
- Whether there are incompatible function usages;
- Whether there are unsupported system variable parameter names;
- Whether there are orphaned frm files;

And so on. All check items and their results can also be seen in the check result log file.

GreatSQL Shell supports using the *greatsql/greatsql_shell* Docker container to complete the upgrade check:
```bash
docker pull greatsql/greatsql_shell
docker run -itd --hostname greatsqlsh --name greatsqlsh greatsql/greatsql_shell bash
docker cp /etc/my.cnf greatsqlsh:/tmp/
docker exec -it greatsqlsh bash -c "mysqlsh -- util checkForServerUpgrade user:password@127.0.0.1:3306 \
  --target-version=8.0.32 --output-format=JSON --config-path=/tmp/my.cnf" > /tmp/upgradecheck_57_to_8032.log
```

In the above operations, you need to first copy the */etc/my.cnf* configuration file from the host environment into the container.

For more information about using GreatSQL Shell for pre-upgrade checks, please refer to: [Upgrade Checker Utility](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-upgrade.html).

### Upgrade Preparation

First download the GreatSQL 8.0 installation package. It is recommended to choose the latest [GreatSQL 8.0.32-27 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-27). Whether to choose the RPM or the binary tarball depends on the specific situation and personal preference.

This document assumes that both the old and new versions are installed with the binary tarball.

Before the official upgrade, be sure to back up the data. You can use the following methods:

1. Stop for maintenance, copy the current database directory, and make a full physical backup. This method is the fastest to restore.
2. Use backup tools such as mysqldump/xtrabackup to perform a full backup.
3. Use source-replica replication or MGR to perform a backup on one of the nodes, or temporarily take a node offline/out of the cluster as a standby node.

Note that your currently running GreatSQL/MySQL 5.7 version may itself have been upgraded from another old version. In this case, some metadata tables under the MySQL system database may still be in the old format. If so, you need to run `mysql_upgrade` in the original environment to upgrade and repair the old format. For example:
```bash
# Switch to the datadir of the currently running database instance
$ cd /data/GreatSQL

# Run the mysql_upgrade program
# The -s parameter means only upgrade the MySQL system database table files, not other user data files; it is generally recommended to remove it and upgrade all data
# The -f parameter means force upgrade; if an error is encountered during the upgrade, it will continue upgrading the following database table files instead of exiting directly
# Assuming the socket file path is /data/GreatSQL/mysql.sock, use the -S parameter to point to it
$ /usr/local/GreatSQL-5.7.36-39-Linux-glibc2.28-x86_64/bin/mysql_upgrade -s -f -S/data/GreatSQL/mysql.sock

/usr/local/GreatSQL-5.7.36-39-Linux-glibc2.28-x86_64/bin/mysql_upgrade -s -S./mysql.sock
The --upgrade-system-tables option was used, databases won't be touched.
Checking if update is needed.
Checking server version.
Running queries to upgrade MySQL server.

...

mysql.time_zone_transition_type                    OK
mysql.user                                         OK
The sys schema is already up to date (version 1.5.2).
Checking databases.
sys.sys_config                                     OK
test.sbtest1                                       OK
Upgrade process completed successfully.
Checking if update is needed.
```

In addition, it is recommended to use the `util.checkForServerUpgrade()` method provided by MySQL Shell for the pre-upgrade check. It mainly determines whether the instance meets the upgrade conditions based on the basic data of the instance itself, such as whether removed functions are used and whether table names conflict. For a detailed introduction to this tool, refer to the following articles by community user **Fenda**:
- [The principle of the 5.7 to 8.0 upgrade check tool util.checkForServerUpgrade (1)](https://mp.weixin.qq.com/s/EuR7MSaVMOTnQTMh0_RsZQ)
- [The principle of the 5.7 to 8.0 upgrade check tool util.checkForServerUpgrade (2)](https://mp.weixin.qq.com/s/i9w4-zqRh8DO2XByhUZrVA)
- [The principle of the 5.7 to 8.0 upgrade check tool util.checkForServerUpgrade (3)](https://mp.weixin.qq.com/s/0rMJpIS7zyP3Het5QOwYmw)

## Upgrade Process

The following changes require attention when upgrading from GreatSQL/MySQL 5.7 to 8.0:

1. The version before the upgrade must be a GA version, i.e., a version after 5.7.9. Otherwise, you should first upgrade the minor version within the 5.7 major version.
2. It is recommended to first upgrade the current 5.7 to the latest minor version. As of the time of writing this document, the latest version is 5.7.43.
3. After upgrading to 8.0, the main difference is that the default password authentication plugin (`default_authentication_plugin`) changes from `mysql_native_password` to `caching_sha2_password`, which will affect some APIs/drivers with lower versions. You can still specify `mysql_native_password` when creating users, or set `default_authentication_plugin=mysql_native_password` in `my.cnf`.
4. In 8.0, you cannot directly use `GRANT` to create a new user; you need to manually `CREATE USER` first, then `GRANT`, corresponding to `SQL_MODE=NO_AUTO_CREATE_USER`.
5. In 8.0, except for the InnoDB engine, tables in other engines do not support the native PARTITION feature.
6. The default character set and collation are upgraded from `latin1 & latin1_swedish_ci` to `utf8mb4 & utf8mb4_0900_ai_ci`. **Note**: in 5.7, the default collation of `utf8mb4` is `utf8mb4_general_ci`, while in 8.0 the corresponding default collation becomes `utf8mb4_0900_ai_ci`. If database, table, stored function or other data objects do not explicitly declare a collation, pay attention to whether it changes.

As long as you pay attention to the above differences and keep them in mind, upgrading to 8.0 will be worry-free.

There are several upgrade methods to choose from.

### In-Place Upgrade

If the database can be stopped for maintenance, the in-place upgrade method is the simplest.

After the backup is complete, shut down the database instance. Before shutting down the database instance, be sure to set the option `innodb_fast_shutdown=0` to ensure that you get a clean, normally shut down database file set.

First modify the `my.cnf` configuration file and add a line in the `[mysqld]` section:
```ini
upgrade=FORCE
```

Then modify `basedir` to point to the new version's binary file path, and start the GreatSQL 8.0 service again. Automatic upgrade will be completed. In addition to the system tables, all user tables will also be upgraded.

**Note:** This method does not support upgrading directly from 5.6 to 8.0.

The logs during the upgrade process look similar to the following:
```log
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80032' started.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80032' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.0.32-27'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 27, Revision aa66a385910.
```

A bit surprising and unexpected, right? How can it be so simple? That is indeed the fact.

If you are obsessive-compulsive and want to see the complete upgrade process, you can also add two options `log_error_verbosity=3` and `innodb_print_ddl_logs=ON`, and the output logs will be much more detailed:
```log
...
[System] [MY-011012] [Server] Starting upgrade of data directory.
...
[Note] [MY-011088] [Server] Data dictionary initializing version '80023'.
[Note] [MY-010337] [Server] Created Data Dictionary for upgrade
...
[System] [MY-011003] [Server] Finished populating Data Dictionary tables with data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-011008] [Server] Finished migrating TABLE statistics data.
[Note] [MY-010006] [Server] Using data dictionary with version '80023'.
[System] [MY-013381] [Server] Server upgrade from '50700' to '80032' started.
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
[System] [MY-013381] [Server] Server upgrade from '50700' to '80032' completed.
...
[System] [MY-010931] [Server] /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld: ready for connections. Version: '8.0.32-27'  socket: 'mysql.sock'  port: 3306  GreatSQL, Release 27, Revision aa66a385910.
```
This completes the upgrade, which is very convenient and labor-saving.

### Rolling Upgrade

With the help of source-replica replication or MGR architecture, you can use the rolling upgrade method: first upgrade and verify on the secondary node, then upgrade the primary node, and finally upgrade all nodes to GreatSQL 8.0.

For details, refer to the article: [Smoothly upgrading MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg). Following the approach in this article, after smoothly upgrading MySQL 5.7 to GreatSQL 5.7, you can still use the same method to upgrade to GreatSQL 8.0.

Finally, pay attention to checking whether the logs output during the upgrade process contain error messages. If not, the upgrade process went smoothly.

After confirming the upgrade is complete, remember to comment out the `upgrade=FORCE` option in the `my.cnf` file, or change it to `upgrade=AUTO`.

## Upgrading GreatSQL 8.0.25 to 8.0.32

Compared with the 8.0.25 version, GreatSQL 8.0.32 adds the Rapid Engine, more SQL syntax compatibility, VIP binding at the MGR level, parallel LOAD DATA, and national cryptographic encryption & backup encryption in terms of security. These are very good features, and it is strongly recommended to upgrade to the latest GreatSQL 8.0.32 version.

The process of upgrading from GreatSQL 8.0.25 to 8.0.32 is relatively simple:

1. Download the latest [GreatSQL 8.0.32 binary tarball](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27), and extract it to the corresponding directory.

2. Shut down the GreatSQL 8.0.25 database during the maintenance period. Before shutting down, first run `SET GLOBAL innodb_fast_shutdown=0` to ensure a complete and clean data file set is obtained when stopping.

3. Modify my.cnf, adjust basedir, and point it to the new version's binary package path. You can refer to this [my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-27).

4. Restart the new GreatSQL 8.0.32 database service process to complete the in-place upgrade. You can see similar content in the logs:
```log
[Note] [MY-013327] [Server] MySQL server upgrading from version '80025' to '80032'.
[Note] [MY-012357] [InnoDB] Reading DD tablespace files
[Note] [MY-012356] [InnoDB] Scanned 7 tablespaces. Validated 7.
[Note] [MY-010006] [Server] Using data dictionary with version '80023'.
[Note] [MY-011323] [Server] Plugin mysqlx reported: 'X Plugin ready for connections. socket: '/tmp/mysqlx.sock''
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' started.
[Note] [MY-013386] [Server] Running queries to upgrade MySQL server.
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' completed.
```

5. If the option `innodb_print_ddl_logs=ON` is set, you can also see a large number of DDL upgrade records during the upgrade process. For example:
```log
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' started.
[Note] [MY-013386] [Server] Running queries to upgrade MySQL server.
[Note] [MY-012477] [InnoDB] DDL log insert : [DDL record: REMOVE CACHE, id=6, thread_id=6, table_id=1062, new_file_path=mysql/replication_group_member_actions]
[Note] [MY-012478] [InnoDB] DDL log delete : 6
[Note] [MY-012472] [InnoDB] DDL log insert : [DDL record: FREE, id=7, thread_id=6, space_id=4294967294, index_id=156, page_no=1111]
...
[Note] [MY-012479] [InnoDB] DDL log replay : [DDL record: FREE, id=792, thread_id=6, space_id=4294967294, index_id=259, page_no=...
[Note] [MY-012486] [InnoDB] DDL log post ddl : end for thread id : 6
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80025' to '80032' completed.
```
This way, you can conveniently complete the in-place upgrade of the GreatSQL version.

**Reminder:** Since the option `group_replication_view_change_uuid` was added starting from MySQL 8.0.26, it is not supported to have versions before and after 8.0.26 in the same MGR cluster at the same time. For example, 8.0.25 and 8.0.26 cannot coexist in an MGR cluster. In this case, if an MGR cluster with version 8.0.25 wants to upgrade to 8.0.32, you need to create a new 8.0.32 MGR cluster and build an asynchronous (or semi-synchronous) replication channel between the two clusters. Only in this way can a smooth upgrade and migration be achieved. Otherwise, you can only arrange offline downtime maintenance time to complete the upgrade.

**Reference Documents**

- [Upgrading GreatSQL-8.0.25 to GreatSQL-8.0.32](https://greatsql.cn/thread-825-1-2.html)
- [Percona Server for MySQL In-Place Upgrading Guide: From 5.7 to 8.0](https://docs.percona.com/percona-server/8.0/upgrade.html)
- [Changes in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html)
- [Before You Begin](https://dev.mysql.com/doc/refman/8.0/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.0/en/upgrading-what-is-upgraded.html)
- [Smoothly upgrading MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
