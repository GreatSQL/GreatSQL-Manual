# Changes in GreatSQL 8.4.4-4 (2025-10-15)

## Version Information

- Release date: October 15, 2025

- Version number: 8.4.4-4, Revision d73de75905d

- Download links: [RPM package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4), [TAR package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4), [Source code package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4)

- User manual: [GreatSQL 8.4.4-4 User Manual](https://greatsql.cn/docs/8.4.4-4/)

## Feature Enhancements

Based on Percona Server for MySQL 8.4.4-4, GreatSQL 8.4.4-4 has mainly enhanced features in four aspects: **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, enabling GreatSQL to meet financial-grade application scenarios on commodity hardware and serve as an ideal drop-in replacement for MySQL or Percona Server for MySQL.

### [High Availability](../../5-enhance/5-2-ha.md)

A large number of improvements and enhancements have been made to MGR and source-replica replication. Features such as zone tags, arbitrator nodes, dynamic read/write VIP, fast single-primary mode, and smart primary election are supported. In-depth optimizations have been made to multiple MGR underlying working mechanisms and algorithms, including the flow control algorithm, transaction certification queue cleanup algorithm, node join/leave mechanism, recovery mechanism, and large transaction compression and transmission, further improving MGR's high availability guarantee and performance stability.

- Supports the [zone tag](../../5-enhance/5-2-ha-mgr-zoneid.md) feature, improving data reliability in multi-data-center architectures.
- Supports the [arbitrator node](../../5-enhance/5-2-ha-mgr-arbitrator.md) feature, achieving higher availability at lower server cost.
- Supports the [dynamic read/write VIP](../../5-enhance/5-2-ha-mgr-vip.md) feature, making high availability switchover more convenient and achieving read load balancing faster. Supports [actively closing current active connections when the primary node switches](../../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md), shortening the application-side unavailability window.
- Supports [fast single-primary mode](../../5-enhance/5-2-ha-mgr-fast-mode.md), which is faster and higher performing in single-primary mode.
- Supports the [smart primary election](../../5-enhance/5-2-ha-mgr-election-mode.md) feature, making the high availability switchover primary election mechanism more reasonable.
- Optimized the [flow control algorithm](../../5-enhance/5-2-ha-mgr-new-fc.md), making transactions smoother and avoiding severe jitter.
- Supports [recording events where MGR network communication overhead exceeds the threshold](../../5-enhance/5-2-ha-mgr-request-time.md), for further analysis and optimization.
- Supports automatically selecting the member node with the latest transaction data for data copying, effectively improving Clone speed and MGR service reliability.
- In source-replica replication, rate limiting is supported when replica nodes initiate Binlog read requests to the primary node.
- Optimized the failure detection efficiency in [asynchronous connection failover](https://dev.mysql.com/doc/refman/8.0/en/replication-asynchronous-connection-failover.html), reducing the duration of source-replica replication link disconnection and improving overall availability.
- Supports the [loop prevention in primary-primary bidirectional replication](../../5-enhance/5-2-ha-repl-server-mode.md) mechanism in cross-data-center disaster recovery scenarios.
- Optimized the problem of severe performance jitter that could occur when MGR nodes join or leave.
- Solved the problem of the entire MGR cluster being blocked when the disk space on individual nodes is full.
- Optimized the MGR transaction certification queue cleanup algorithm; under high load, the performance jitter every 60 seconds no longer exists.
- Solved the problem of being unable to elect a primary caused by long transactions in MGR.
- Fixed the long wait problem during MGR recovery.
- Optimized the handling mechanism for MGR large transaction compression exceeding the limit.

For more information, see the documentation: [High Availability](../../5-enhance/5-2-ha.md).

### [High Performance](../../5-enhance/5-1-highperf.md)
Performance is more stable and excellent compared with MySQL and Percona Server for MySQL. Features such as the Rapid Engine, Turbo Engine, transaction lock-free optimization, parallel LOAD DATA, asynchronous deletion of large tables, thread pool, non-blocking DDL, and NUMA affinity scheduling optimization are supported. In [TPC-C testing, performance is improved by more than 30% compared with MySQL](../../10-optimize/3-5-benchmark-greatsql-vs-mysql-tpcc-report.md), and in [TPC-H testing, performance is more than ten times or even hundreds of times that of MySQL](../../10-optimize/3-3-benchmark-greatsql-tpch-report.md).

- Supports the [high-performance Rapid Engine with massive parallelism, in-memory queries, and a high compression ratio](../../5-enhance/5-1-highperf-rapid-engine.md), which can improve data analysis performance by several orders of magnitude.
- Supports the [high-performance parallel query engine Turbo](../../5-enhance/5-1-highperf-turbo-engine.md), giving GreatSQL multi-threaded concurrent vectorized real-time query capabilities.
- Optimized the InnoDB transaction system, implementing multiple optimizations such as large lock splitting and lock-free design; overall OLTP scenario performance is improved by about 20%.
- Supports [parallel LOAD DATA](../../5-enhance/5-1-highperf-parallel-load.md), suitable for application scenarios that frequently import large amounts of data, with performance improved by more than 20 times; optimization is also provided for scenarios without an explicitly defined primary key.
- Supports [asynchronous deletion of large tables](../../5-enhance/5-1-highperf-async-purge-big-table.md), improving the stability of InnoDB runtime performance.
- Supports the [thread pool](../../5-enhance/5-1-highperf-thread-pool.md), reducing the cost of thread creation and destruction, and ensuring stable performance without obvious degradation under high concurrency.
- Supports [non-blocking DDL](../../5-enhance/5-1-highperf-nonblocking-ddl.md), avoiding the problem of business requests being blocked in large numbers because the database must complete DDL operations as soon as possible.
- Supports [NUMA affinity optimization](../../5-enhance/5-1-highperf-numa-affinity.md). Through NUMA affinity scheduling optimization, front-end user threads and background threads are bound to fixed NUMA nodes to improve thread processing performance.

For more information, see the documentation: [High Performance](../../5-enhance/5-1-highperf.md).

### [High Compatibility](../../5-enhance/5-3-easyuse.md)

GreatSQL achieves 100% complete compatibility with MySQL and Percona Server for MySQL syntax, and supports most common Oracle syntax, including [data type compatibility](../../5-enhance/5-3-easyuse.md#data-type-compatibility), [function compatibility](../../5-enhance/5-3-easyuse.md#function-compatibility), [SQL syntax compatibility](../../5-enhance/5-3-easyuse.md#sql-syntax-compatibility), [stored routine compatibility](../../5-enhance/5-3-easyuse.md#stored-routine-compatibility), and many other compatibility extension usages.

For more information, see the documentation: [High Compatibility](../../5-enhance/5-3-easyuse.md).

### [High Security](../../5-enhance/5-4-security.md)

GreatSQL supports multiple security enhancement features such as logical backup encryption, Clone backup encryption, auditing, tablespace encryption with national cryptographic algorithms, sensitive data masking, and login history storage, further ensuring business data security and making it more suitable for financial-grade application scenarios.

- Supports [mysqldump logical backup encryption](../../5-enhance/5-4-security-mysqldump-encrypt.md), providing the secure encryption requirements for logical backups using mysqldump.
- Supports [Clone backup encryption](../../5-enhance/5-4-security-clone-encrypt.md), providing the secure encryption requirements for physical backups using Clone.
- Supports the [auditing feature](../../5-enhance/5-4-security-audit.md), promptly recording and detecting unauthorized or unsafe behavior.
- Supports [InnoDB tablespace encryption with national cryptographic algorithms](../../5-enhance/5-4-security-encrypt-with-gmssl.md), ensuring the encryption security of important data.
- Supports [two data masking working modes based on functions and policies](../../5-enhance/5-4-security-data-masking.md), ensuring the confidentiality of query results for sensitive user data.

Through the above multiple security enhancement features, business data security is further ensured. For more information, see the documentation: [High Security](../../5-enhance/5-4-security.md).

### [Others](../../5-enhance/5-5-others.md)
- Supports [Clone online full hot backup, incremental backup, and recovery](../../5-enhance/5-5-clone-compressed-and-incrment-backup.md). Combined with Binlog, recovery to a specified point in time is possible. In addition, Clone backup also supports compression.
- Supports [transparent InnoDB Page compression using the Zstd algorithm](../../5-enhance/5-5-innodb-page-compression.md), further improving the data compression ratio, especially when there is a large amount of long-text duplicate data.

## Notes

Upgrading from 8.0 to 8.4 has the greatest impact on existing operations and management systems: the original commands containing the `MASTER/SLAVE` keywords are no longer available. The main changes are shown in the table below

| Old Command | New Command |
| :--- | :--- | 
| START SLAVE       | START REPLICA |
| STOP SLAVE        | STOP REPLICA  | 
| SHOW SLAVE STATUS | SHOW REPLICA STATUS |
| SHOW SLAVE HOSTS  | SHOW REPLICAS |
| RESET SLAVE  	    | RESET REPLICA |
| CHANGE MASTER TO  | CHANGE REPLICATION SOURCE TO |
| RESET MASTER      | RESET BINARY LOGS AND GTIDS  |
| SHOW MASTER STATUS| SHOW BINARY LOG STATUS |
| PURGE MASTER LOGS | PURGE BINARY LOGS |
| SHOW MASTER LOGS  | SHOW BINARY LOGS |

In addition, the related parameter variables in `CHANGE MASTER` (the new command is `CHANGE REPLICATION SOURCE TO`) and `START SLAVE` (the new command is `START REPLICA`) have also changed, as shown in the table below

| Old Parameter Name | New Parameter Name |
| :--- | :--- |
| MASTER_AUTO_POSITION    | SOURCE_AUTO_POSITION |
| MASTER_HOST             | SOURCE_HOST |
| MASTER_BIND             | SOURCE_BIND |
| MASTER_USER             | SOURCE_USER |
| MASTER_PASSWORD         | SOURCE_PASSWORD |
| MASTER_PORT             | SOURCE_PORT | 
| MASTER_CONNECT_RETRY    | SOURCE_CONNECT_RETRY |
| MASTER_RETRY_COUNT      | SOURCE_RETRY_COUNT |
| MASTER_DELAY            | SOURCE_DELAY | 
| MASTER_SSL              | SOURCE_SSL | 
| MASTER_SSL_CA           | SOURCE_SSL_CA | 
| MASTER_SSL_CAPATH       | SOURCE_SSL_CAPATH | 
| MASTER_SSL_CIPHER       | SOURCE_SSL_CIPHER | 
| MASTER_SSL_CRL          | SOURCE_SSL_CRL | 
| MASTER_SSL_CRLPATH      | SOURCE_SSL_CRLPATH | 
| MASTER_SSL_KEY          | SOURCE_SSL_KEY | 
| MASTER_SSL_VERIFY_SERVER_CERT | SOURCE_SSL_VERIFY_SERVER_CERT | 
| MASTER_TLS_VERSION      | SOURCE_TLS_VERSION | 
| MASTER_TLS_CIPHERSUITES | SOURCE_TLS_CIPHERSUITES | 
| MASTER_SSL_CERT         | SOURCE_SSL_CERT | 
| MASTER_PUBLIC_KEY_PATH  | SOURCE_PUBLIC_KEY_PATH | 
| GET_MASTER_PUBLIC_KEY   | GET_SOURCE_PUBLIC_KEY | 
| MASTER_HEARTBEAT_PERIOD | SOURCE_HEARTBEAT_PERIOD | 
| MASTER_COMPRESSION_ALGORITHMS | SOURCE_COMPRESSION_ALGORITHMS | 
| MASTER_ZSTD_COMPRESSION_LEVEL | SOURCE_ZSTD_COMPRESSION_LEVEL | 
| MASTER_LOG_FILE         | SOURCE_LOG_FILE | 
| MASTER_LOG_POS          | SOURCE_LOG_POS |

In the results of the SQL command `SHOW [GLOBAL] STATUS`, some status variables have also changed, as shown in the table below

| Old Status Variable Name | New Status Variable Name | 
| :--- | :--- |
| Com_slave_start  | Com_replica_start | 
| Com_slave_stop   | Com_replica_stop | 
| Com_show_slave_status  | Com_show_replica_status | 
| Com_show_slave_hosts   | Com_show_replicas | 
| Com_show_master_status | Com_show_binary_log_status | 
| Com_change_master      | Com_change_replication_source |

## Upgrading/Downgrading to GreatSQL 8.4.4-4

### Upgrading to GreatSQL 8.4.4-4
- If the old version is GreatSQL 5.7 or another series version, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, first upgrading in-place to GreatSQL 8.0.32-27. Then continue upgrading on the basis of that `datadir`, i.e., modify `basedir` to point to the new GreatSQL 8.4.4-4 version and perform the in-place upgrade again. Note that after upgrading from 5.7 to 8.0 and then to 8.4, the accounts in the database still use the `mysql_native_password` password authentication plugin. After the final upgrade to 8.4, you need to modify the *my.cnf* configuration file and add `mysql_native_password=1` to ensure that the original accounts can log in normally.
- If the old version is GreatSQL 8.0 or another series version and the **Rapid** Engine is not used, you can directly start GreatSQL 8.4.4-4 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- If the old version is GreatSQL 8.0.32-27 with the **Rapid** Engine enabled, you can directly start GreatSQL 8.4.4-4 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- If the old version is GreatSQL 8.0.32-25 or 8.0.32-26 with the **Rapid** Engine enabled, **in-place upgrade is not possible in this case**. You need to unload all **Rapid** Engine tables and delete the **Rapid** data files, and then you can start GreatSQL 8.4.4-4 in-place based on the original `datadir` after modifying `basedir` for automatic upgrade. After the new version instance starts, execute `ALTER TABLE SECONDARY_LOAD` on all **Rapid** Engine tables to complete the full data import, then execute `SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK()` to start the incremental import task, completing the **Rapid** Engine table upgrade. The following is a reference upgrade process:

  **1. Query and record all Rapid Engine tables**
  
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
  
  **2. Stop the GreatSQL instance process normally**
  
  Before stopping the GreatSQL instance process, first modify `innodb_fast_shutdown=0` and then execute `SHUTDOWN` to stop the instance
  
  ```sql
  greatsql> SET GLOBAL innodb_fast_shutdown=0;
  greatsql> SHUTDOWN;
  ```
  
  **3. Delete the old Rapid Engine data files**
  
  ```bash
  cd /data/GreatSQL && rm -f duckdb*
  ```
  
  **4. Modify the `basedir` parameter in the `my.cnf` configuration file to point to the new GreatSQL 8.4.4-4 version**
  
  ```ini
  #my.cnf
  [mysqld]
  basedir=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
  ```
  And make sure the parameter `upgrade` is not set to *NONE*.
  
  **5. Start the new GreatSQL 8.4.4-4 instance**
  
  ```bash
  systemctl start greatsql
  ```
  
  **6. Reinstall the Rapid Engine**
  
  ```sql
  greatsql> INSTALL PLUGIN rapid SONAME 'ha_rapid.so';
  ```
  
  **7. Perform a full data import for the Rapid Engine tables**
  
  ```sql
  greatsql> ALTER TABLE test.t1 SECONDARY_LOAD;
  ```
  
  ::: tip Tip
  Since the `SECONDARY_ENGINE=rapid` attribute of the table was not removed before the upgrade, there is no need to set it again. If all Rapid Engine tables were unloaded before the upgrade, you need to set it again.
  :::
  
  **8. Start the incremental import task again**
  
  ```sql
  greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('test', 't1');
  ```
  This completes the Rapid Engine table upgrade.

- If the old version is MySQL 5.7 or Percona Server 5.7 or another series version, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`. After confirming the upgrade is successful, continue upgrading on the basis of the original `datadir`, i.e., modify `basedir` to point to the new GreatSQL 8.4.4-4 version, and then automatic upgrade will be completed. Note that after upgrading from 5.7 to 8.0 and then to 8.4, the accounts in the database still use the `mysql_native_password` password authentication plugin. After the final upgrade to 8.4, you need to modify the *my.cnf* configuration file and add `mysql_native_password=1` to ensure that the original accounts can log in normally.
- If the old version is MySQL 8.0 or Percona Server 8.0 or another series version, you can directly start GreatSQL 8.4.4-4 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- In other cases, it is best to upgrade to GreatSQL 8.4.4-4 by importing a logical backup file.

In the above in-place upgrade scenarios, make sure that the `upgrade` parameter in `my.cnf` is not set to *NONE*; it can be set to the default *AUTO* or *FORCE*. For example:

```ini
#my.cnf
[mysqld]
upgrade = AUTO
```

For more migration and upgrade solutions, please refer to: [Migration & Upgrade](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md).

### Downgrading to GreatSQL 8.4.4-4

If you want to downgrade from a higher minor version in the MySQL/Percona 8.4 series to GreatSQL 8.4.4-4, you can use the in-place downgrade method to quickly complete the version downgrade. That is, you can directly start GreatSQL 8.4.4-4 in-place based on the original `datadir` after modifying `basedir` and adding the parameter setting `upgrade=FORCE`, and automatic downgrade will be completed.

If you want to downgrade from MySQL/Percona 9.0 or later versions to GreatSQL 8.4.4-4, you need to use the logical backup + logical import method to complete the downgrade. In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade=FORCE` to force upgrading all data tables, including system tables.

The downgrade process is roughly as follows:

**1. Perform a full logical backup in the higher version**
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. Import the logical backup file in the GreatSQL 8.4.4-4 environment to complete logical recovery**

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

**3. Modify `my.cnf` to ensure the `upgrade=FORCE` setting**
```ini
#my.cnf
[mysqld]
upgrade = FORCE
```

**4. Restart GreatSQL to complete the downgrade**

```bash
systemctl restart greatsql
```
During the restart, you can see a forced downgrade process in the log similar to the following

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-014064] [Server] Server downgrade from '80406' to '80404' started.
[System] [MY-014064] [Server] Server downgrade from '80406' to '80404' completed.
```

If `upgrade = FORCE` is not set to force upgrading all tables, the system table `mysql.procs_priv` may be corrupted, and an error similar to the following may be reported when creating users:

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## GreatSQL vs MySQL

| **1. Major Features** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
| :--- | :---: | :---: |
| Open Source |  :heavy_check_mark: |  :heavy_check_mark: |
| ACID Integrity | :heavy_check_mark: | :heavy_check_mark: |
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
| **2. Performance Enhancement Extensions** | GreatSQL 8.4.4-4 | MySQL 8.4.4 |
|Rapid Engine| :heavy_check_mark: | HeatWave (cloud only) |
|Turbo Engine| :heavy_check_mark: | ❌ |
|NUMA Affinity Optimization| :heavy_check_mark: | ❌ |
|Non-Blocking DDL| :heavy_check_mark: | ❌ |
|Import Optimization for Tables Without Primary Key| :heavy_check_mark: | ❌ |
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

GreatSQL 8.4.4-4 is based on Percona Server for MySQL 8.4.4-4, which has made a large number of improvements and enhancements and added many new features on top of MySQL 8.4.4. For details, please see: [**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.4/feature-comparison.html). These include features only available in MySQL Enterprise Edition, such as thread pool, auditing, and data masking, as well as numerous improvements and enhancements such as performance_schema improvements, information_schema improvements, performance and scalability improvements, user statistics enhancements, PROCESSLIST enhancements, and Slow Query Log enhancements. They are not listed here one by one.

## GreatSQL Release Notes
### GreatSQL 8.4
- [Changes in GreatSQL 8.4.4-4 (2025-10-15)](changes-greatsql-8444.md)

### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-27 (2025-3-10)](changes-greatsql-8-0-32-27.md)
- [Changes in GreatSQL 8.0.32-26 (2024-8-5)](changes-greatsql-8-0-32-26-20240805.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
