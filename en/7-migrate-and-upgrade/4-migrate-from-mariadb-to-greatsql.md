# Migrating from MariaDB to GreatSQL
---

This section introduces how to migrate from MariaDB to the GreatSQL database.

## Introduction to MariaDB

MariaDB is an open-source relational database management system (RDBMS) created by Michael Widenius (also known as Monty), the founder of MySQL. MariaDB is highly compatible with MySQL, and many existing MariaDB applications can be directly migrated to GreatSQL without modifying code.

## Similarities and Differences Between MariaDB and GreatSQL

### Similarities
1. **Open-source license**:
   - Both are open-source database management systems based on the GPL license.
2. **SQL standard support**:
   - Both support the standard SQL language.
3. **Storage engines**:
   - Both support multiple storage engines, such as InnoDB, MyISAM, Memory, etc.
4. **Replication and clustering**:
   - Both support source-replica replication, primary-primary replication, and clustering technologies.
5. **Security features**:
   - Both support security features such as user privilege management and SSL encryption.
6. **Tools and clients**:
   - Both can use the same client tools, such as the `mysql` command-line tool, `phpMyAdmin`, etc.

### Differences
1. **Storage engines**:
   - **GreatSQL**: The default storage engine is InnoDB, and starting from 8.0, metadata is also stored in the InnoDB engine.
   - **MariaDB**: The default storage engine is also InnoDB, but it also introduces new storage engines such as Aria, SphinxSE, XtraDB (an enhanced version of InnoDB), Spider (a distributed storage engine), etc. In MariaDB, metadata still uses the MyISAM storage engine, which is very different from GreatSQL.
2. **New features**:
   - **MariaDB**: Many new features have been introduced, such as window functions, sequences, dynamic columns, etc. Some MariaDB new features are not compatible with GreatSQL.
   - **GreatSQL**: It is also constantly updated and has introduced similar new features, but the release time may differ.
3. **Version numbers**:
   - **MariaDB**: Early version numbers were basically consistent with MySQL/GreatSQL, but starting from 10.x, independent version numbering rules are used, and they cannot be directly mapped to MySQL/GreatSQL.
   - **GreatSQL**: The major version numbers of GreatSQL are consistent with MySQL/Percona, and the minor version numbers are slightly different. For details, refer to: [Notes to Users](../1-docs-intro/1-1-notes-to-users.md).
4. **GTID incompatibility**:
   - **MariaDB**: It is more complex and consists of multiple parts, including Domain ID, Server ID, and Sequence Number, in the format **GTID = Domain_ID-Server_ID-Sequence_Number**. MariaDB's GTID allows transactions in different clusters to be isolated and managed through Domain ID.
   - **GreatSQL**: It is a single value composed of the server UUID and the transaction number, in the format **GTID = UUID:TrxID**. Each transaction on a server has a unique GTID.
   - In other words, a GTID-based source-replica replication relationship cannot be established between GreatSQL and MariaDB.
5. **Parameters and variables**:
   - **MariaDB**: Some parameters and variables do not exist in GreatSQL, e.g., `aria_pagecache_buffer_size`, which is related to the Aria engine.
   - **GreatSQL**: New parameters such as `innodb_dedicated_server` have been introduced starting from 8.0, which do not exist in MariaDB.
6. **Plugins**:
   - **MariaDB**: Provides more plugins, such as Cassandra and the CONNECT engine, with a richer plugin system.
   - **GreatSQL**: Some enterprise-level feature plugins, such as enhanced auditing, enhanced masking, Clone incremental & encrypted backup, Rapid Engine, etc., are not available in MariaDB.
7. **Specific features**:
   - **MariaDB**: Enhanced support for Galera Cluster (called PXC in Percona), with better performance in multi-primary cluster and high availability scenarios.
   - **GreatSQL**: GreatSQL adopts a Paxos-based strong synchronous replication solution, i.e., Group Replication (also called MGR). The InnoDB engine is more optimized in transaction processing, crash recovery, etc., and has received a lot of performance improvements in MySQL 8.0. The Clone plugin is also not available in MariaDB.

## MariaDB and MySQL/GreatSQL Version Mapping Table

| MariaDB Version | MySQL Version | Notes |
|--------------|--------------|--------------------------------------------------------------|
| 10.10.x      | 8.0.x        | MariaDB 10.10 corresponds to MySQL/GreatSQL 8.0 and includes many new features and improvements. |
| 10.9.x       | 8.0.x        | MariaDB 10.9 corresponds to MySQL/GreatSQL 8.0 and includes some new features and improvements. |
| 10.8.x       | 8.0.x        | MariaDB 10.8 corresponds to MySQL/GreatSQL 8.0 and includes some new features and improvements. |
| 10.7.x       | 8.0.x        | MariaDB 10.7 corresponds to MySQL/GreatSQL 8.0 and includes some new features and improvements. |
| 10.6.x       | 8.0.x        | MariaDB 10.6 corresponds to MySQL/GreatSQL 8.0 and includes some new features and improvements. |
| 10.5.x       | 8.0.x        | MariaDB 10.5 corresponds to MySQL/GreatSQL 8.0 and includes some new features and improvements. |
| 10.4.x       | 8.0.x        | MariaDB 10.4 corresponds to MySQL/GreatSQL 8.0 and includes some new features and improvements. |
| 10.3.x       | 5.7.x        | MariaDB 10.3 corresponds to MySQL/GreatSQL 5.7 and includes some new features and improvements. |
| 10.2.x       | 5.7.x        | MariaDB 10.2 corresponds to MySQL/GreatSQL 5.7 and includes some new features and improvements. |
| 10.1.x       | 5.6.x        | MariaDB 10.1 corresponds to MySQL 5.6 and includes some new features and improvements. |
| 10.0.x       | 5.6.x        | MariaDB 10.0 corresponds to MySQL 5.6 and includes some new features and improvements. |
| 5.5.x        | 5.5.x        | MariaDB 5.5 corresponds to MySQL 5.5 and includes some new features and improvements. |
| 5.3.x        | 5.1.x        | MariaDB 5.3 corresponds to MySQL 5.1 and includes some new features and improvements. |
| 5.2.x        | 5.1.x        | MariaDB 5.2 corresponds to MySQL 5.1 and includes some new features and improvements. |
| 5.1.x        | 5.1.x        | MariaDB 5.1 corresponds to MySQL 5.1 and includes some new features and improvements. |

### Detailed Version Mapping Notes

1. **Version mapping**:
   - Each major version of MariaDB usually corresponds to a major version of MySQL/GreatSQL. For example, MariaDB 10.4.x corresponds to MySQL/GreatSQL 8.0.x.
   - Starting from MariaDB 10.3, MariaDB version numbers no longer directly correspond to MySQL/GreatSQL version numbers, but develop independently while still maintaining a certain degree of compatibility.

2. **New features**:
   - **MariaDB 10.10.x**: Many new features have been introduced, such as window functions, sequences, dynamic columns, etc., corresponding to the new features of MySQL/GreatSQL 8.0.
   - **MariaDB 10.9.x**: Continued to enhance performance and stability, introducing some new storage engines and optimizations.
   - **MariaDB 10.8.x**: Introduced more performance optimizations and security features.
   - **MariaDB 10.7.x**: Added support and optimization for JSON fields.
   - **MariaDB 10.6.x**: Introduced improvements and optimizations for partitioned tables.
   - **MariaDB 10.5.x**: Enhanced the performance of the InnoDB storage engine.
   - **MariaDB 10.4.x**: Introduced support for window functions.
   - **MariaDB 10.3.x**: Corresponds to MySQL/GreatSQL 5.7 and introduced support for JSON fields.
   - **MariaDB 10.2.x**: Corresponds to MySQL/GreatSQL 5.7 and introduced support for multi-source replication.
   - **MariaDB 10.1.x**: Corresponds to MySQL 5.6 and introduced improvements to partitioned tables.
   - **MariaDB 10.0.x**: Corresponds to MySQL 5.6 and introduced support for the InnoDB plugin.
   - **MariaDB 5.5.x**: Corresponds to MySQL 5.5 and introduced support for the InnoDB plugin.
   - **MariaDB 5.3.x**: Corresponds to MySQL 5.1 and introduced some new storage engines.
   - **MariaDB 5.2.x**: Corresponds to MySQL 5.1 and introduced some new storage engines.
   - **MariaDB 5.1.x**: Corresponds to MySQL 5.1 and introduced some new storage engines.

## Preparation Before Migration

First download the GreatSQL 8.4 installation package. It is recommended to choose the latest [GreatSQL 8.4.4-5 release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-5). Whether to choose RPM or binary tarball depends on the specific situation and personal preference.

This article uses the binary tarball installation method.

Since MariaDB and GreatSQL are quite different, it is recommended to use the **`mysqldump`/`mydumper` full logical backup export** + **logical backup import** method to complete the migration.

For detailed operation methods, refer to the **logical backup + import** methods introduced in the documents: [Migration Process](./2-migrate-from-mysql-togreatsql.md) and [mysqldump Backup & Restore](../6-oper-guide/4-1-mysqldump.md) to complete the migration.

If you are migrating a single table, you can consider using the [OUTFILE](../6-oper-guide/4-2-outfile.md) method to complete the logical backup, and then use the [parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md) method to import the data.

## Summary

Considering the development model and technical ecosystem of MariaDB and other factors, you can consider migrating to GreatSQL to experience more of GreatSQL's advantageous features.

**Reference Documents**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [Smooth upgrade of MySQL 5.7 MGR to GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
