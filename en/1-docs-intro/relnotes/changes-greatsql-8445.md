# Changes in GreatSQL 8.4.4-5 (2026-06-30)

## Version Information

- Release date: June 30, 2026

- Version number: 8.4.4-5, Revision 39b389cdf3b

- Download links: [RPM package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5), [TAR package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5), [Source code package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5)

- User manual: [GreatSQL 8.4.4-5 User Manual](https://greatsql.cn/docs/8.4.4-5/)

## Improvements

GreatSQL 8.4.4-5 has enhanced features in four aspects: **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, enabling GreatSQL to meet financial-grade application scenarios on commodity hardware and serve as an ideal drop-in replacement for MySQL or Percona Server for MySQL.

GreatSQL 8.4.4-5 adds the **large transaction binlog independent flush** optimization, improves **parallel replication replay efficiency**, adds support for **vector data types and similarity queries**, **restores compatibility with legacy source-replica replication syntax**, optimizes **multiple MGR mechanisms**, enhances **MGR VIP plugin security**, and fixes several bugs that could cause crashes or data inconsistency.

### [High Availability](../../5-enhance/5-2-ha.md)

- Added a compatibility feature that restores the full set of legacy source-replica replication syntax such as `CHANGE MASTER TO` and `START SLAVE`, along with the supporting status variables and error messages, providing compatibility with existing operations scripts. The old and new replication commands can be used in parallel, the underlying replication logic is unchanged, and upgrades require no changes to monitoring automation tools. This solves the problem of legacy replication management statements reporting errors after upgrading from lower versions to 8.4, greatly reducing the workload of database major version upgrade modifications.

This feature is a kernel replication compatibility enhancement layer. It does not change the underlying replication synchronization core logic; it only performs bidirectional mapping adaptation at the outer layer of SQL parsing, result output, and error prompts:
1. Fully restores the previously frequently used `Master/Slave` replication management SQL syntax; both old and new syntax can execute normally;
2. The output of `SHOW SLAVE STATUS` and `SHOW MASTER STATUS` is compatible with the old field names and field order;
3. The `Slave_*` series of global status variables are retained and synchronized bidirectionally with the new `Replica_*` variables in real time;
4. When the old syntax reports an execution error, the legacy compatible error codes and Master/Slave style prompt text are returned;
5. The old and new syntax are completely isolated and do not interfere with each other. The same set of replication execution logic is reused at the bottom layer, with no performance loss and no impact on data consistency.

**Correspondence between old and new replication management statements**

| Legacy Master/Slave Syntax | New Source/Replica Standard Syntax |
|---------------------|---------------------------|
| `CHANGE MASTER TO` | `CHANGE REPLICATION SOURCE TO` |
| `START SLAVE` | `START REPLICA` |
| `STOP SLAVE` | `STOP REPLICA` |
| `RESET SLAVE` | `RESET REPLICA` |
| `SHOW SLAVE STATUS` | `SHOW REPLICA STATUS` |
| `SHOW SLAVE HOSTS` | `SHOW REPLICAS` |
| `RESET MASTER` | `RESET BINARY LOGS AND GTIDS` |
| `SHOW MASTER STATUS` | `SHOW BINARY LOG STATUS` |
| `SHOW MASTER LOGS` | `SHOW BINARY LOGS` |
| `PURGE MASTER LOGS` | `PURGE BINARY LOGS` |

**CHANGE MASTER TO parameter mapping**

Legacy `MASTER_*` options are automatically mapped to internal `SOURCE_*` parameters, fully compatible with: `MASTER_HOST`/`MASTER_USER`/`MASTER_PASSWORD`/`MASTER_PORT`/`MASTER_AUTO_POSITION`/`MASTER_LOG_FILE`/`MASTER_LOG_POS`/`MASTER_CONNECT_RETRY`/`MASTER_RETRY_COUNT`/`MASTER_DELAY`/the full set of SSL parameters/compression parameters/heartbeat parameters/public key parameters, etc.

For details, refer to: [Restored Part of the Source-Replica Replication Compatibility Interface](../../5-enhance/5-2-ha-repl-interface-cmd.md).

- For the `greatdb_ha` plugin, UDF functions are used to replace the original port communication logic. Calling the UDF requires SUPER privileges and related MGR privileges, and SSL encryption can be supported on demand, balancing the HA plugin's functionality and communication security. For details, refer to: [Built-in VIP for MGR Nodes](../../5-enhance/5-2-ha-mgr-vip.md#security-hardening-notes).
- Modified the `performance_schema.replication_group_member_stats` system table, adding the `SECOND_BEHIND_GROUP` field to record the replication delay time status between MGR nodes.
- If a `1032 / duplicate-key` error occurs in large-batch DML operations in source-replica replication, precise positioning was previously lacking. By enhancing the error log capability, the inconsistent data rows can now be output, reducing operations and maintenance troubleshooting costs.
- In the scenario where an MGR node fails to rejoin automatically after restart, since `super_read_only` was not kept enabled, the node could still write data, causing data inconsistency and the subsequent inability to rejoin the replication group. Therefore, `super_read_only=ON` must be forcibly maintained even when the join fails to avoid abnormal writes.
- In the MGR automatic rejoin and manual startup processes, after the XCom thread has exited, continuing to wait for the `Wait for view modification` timeout is no longer meaningful. Therefore, it can be optimized to terminate the `START GROUP_REPLICATION` or `auto-rejoin` process early after confirming that XCom has exited, reducing ineffective waiting and improving rejoin efficiency and error return timeliness.

For more information, see the documentation: [High Availability](../../5-enhance/5-2-ha.md).

### High Performance
- Added the large transaction binlog independent flush feature. Through core improvements such as restructuring the binlog cache file structure and direct rename-based flushing, the high I/O overhead of writing binlog a second time when large transactions commit is avoided. This feature can **reduce large transaction commit latency by 30%~70% and improve high-concurrency TPS by 10%~40%**, ensuring system stability. For details, refer to: [Large Transaction Binlog Independent Flush](../../5-enhance/5-1-highperf-binlog-flush-opt-large-trx.md).
- Optimized the parallel replication replay mechanism of secondary nodes in source-replica/group replication. The wait logic for conflicting transactions is moved from the coordinator thread down to worker threads. Through the new need_wait marker, worker thread wait and wake-up mechanism, combined with setting the parameter `replica_parallel_wait_mode=WAIT_ON_WORKER_THREAD`, scheduling blocking is effectively reduced, improving the parallel replay throughput of standby nodes, reducing replication latency, and enhancing cluster high availability stability. For details, refer to: [Parallel Replication Replay Optimization](../../5-enhance/5-1-highperf-parallel-replica.md).
- Added the SQL Digest-dimension execution plan drift detection capability, which can continuously collect and cache execution plan baseline information, identify execution plan changes and suspicious SQL through differential comparison, solving the problem of invisible execution plan drift after database restart/upgrade. This feature is based on a plugin architecture and uses an in-memory cache + asynchronous persistence design, ensuring that main-line performance is not affected. It also supports exception tolerance and permission control, can control collection and persistence behavior through parameter switches, is compatible with the existing Digest system and MySQL protocol, and only some engines/special SQL have usage restrictions. For details, refer to: [Execution Plan Drift Detection](../../5-enhance/5-1-highperf-execplan-baseline.md).
- Added the native `VECTOR` vector data type, with supporting string conversion, dimension query, and three types of distance calculation SQL functions (cosine/Euclidean/inner product), and supports Turbo Engine vectorized parallel acceleration for vector similarity queries. It is fully compatible with `binlog` and `xtrabackup` backups. The `JDBC/ODBC/Python` driver adaptation versions have clear requirements, and the vector field usage constraints and Turbo automatic fallback mechanism are clearly defined, supporting AI vector retrieval business scenarios. For details, refer to: [Turbo Engine Vector Similarity Search](../../5-enhance/5-1-highperf-vector-search.md).

### Others
- In `mysqlbinlog` output, adding the parameter `-vvv` can additionally display the actual affected row count `affected rows` of each transaction, enhancing the observability and operations statistics capability of binlog parsing.

## Bug Fixes
- Fixed the issue where, during Turbo Engine type mapping, unsupported types throw an exception that is not caught, causing a coredump.
- Fixed the issue where Turbo queries may not respond when killed.
- Fixed the issue in the Rapid and Turbo engines where negative `Time` values were processed with the minus sign ignored, causing query errors.
- Fixed the issue where a new node joining MGR might stay in the `Recovery` state for a long time when the primary node is under heavy load.
- Fixed the issue where, in multi-node MGR scenarios, individual nodes cannot recover after a network failure and recovery.
- Fixed the issue of possible `RECEIVED_TRANSACTION_SET` breakpoints after Relay Log batch flushing in MGR.
- Fixed the issue in MGR where, when a node is delayed for some reason and using the `BEFORE` read/write level, starting a new transaction for queries and modifications causes the first statement of the new transaction to block; at this time, if the user manually executes `STOP GROUP_REPLICATION` to stop group replication on that node, both the transaction statements and the `STOP GROUP_REPLICATION` operation may be blocked.
- Fixed the issue where Clone incremental backup tasks may fail or even lose data if a large number of transactions are executed concurrently.
- Fixed the issue where view statements using the (+) syntax may report errors or even coredump.
- Fixed the issue where, after the server enables the empty string mode (`EMPTYSTRING_EQUAL_NULL`), executing `mysqldump` reports that setting the '' mode failed.
- Fixed the issue where using `BULK INTO` in cursors to write to nested tables or associative arrays may cause exceptions.

## Notes

## Upgrading/Downgrading to GreatSQL 8.4.4-5

### Upgrading to GreatSQL 8.4.4-5
- If the old version is a GreatSQL 5.7 series version, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`, first upgrading in-place to GreatSQL 8.0.32-27. Then continue upgrading on the basis of that `datadir`, i.e., modify `basedir` to point to the new GreatSQL 8.4.4-5 version and perform the in-place upgrade again. Note that after upgrading from 5.7 to 8.0 and then to 8.4, the accounts in the database still use the `mysql_native_password` password authentication plugin. After the final upgrade to 8.4, you need to modify the *my.cnf* configuration file and add `mysql_native_password=1` to ensure that the original accounts can log in normally.
- If the old version is a GreatSQL 8.0/8.4 series version and the **Rapid** Engine is not used, you can directly start GreatSQL 8.4.4-5 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- If the old version is a GreatSQL 8.0/8.4 series version with the **Rapid** Engine enabled, **in-place upgrade is not possible in this case**. You need to unload all **Rapid** Engine tables and delete the **Rapid** data files, and then you can start GreatSQL 8.4.4-5 in-place based on the original `datadir` after modifying `basedir` for automatic upgrade. After the new version instance starts, execute `ALTER TABLE SECONDARY_LOAD` on all **Rapid** Engine tables to complete the full data import, then execute `SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK()` to start the incremental import task, completing the **Rapid** Engine table upgrade. The following is a reference upgrade process:

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
  
  **2. Unload all Rapid tables**

  Taking one of the tables as an example:

  ```sql
  greatsql> ALTER TABLE tpch100g.customer SECONDARY_UNLOAD;
  ```

  **3. Stop the GreatSQL instance process normally**
  
  Before stopping the GreatSQL instance process, first modify `innodb_fast_shutdown=0` and then execute `SHUTDOWN` to stop the instance
  
  ```sql
  greatsql> SET GLOBAL innodb_fast_shutdown=0;
  greatsql> SHUTDOWN;
  ```
  
  **4. Delete the old Rapid Engine data files**
  
  ```bash
  cd /data/GreatSQL && rm -f duckdb*
  ```
  
  **5. Modify the `basedir` parameter in the `my.cnf` configuration file to point to the new GreatSQL 8.4.4-5 version**
  
  ```ini
  #my.cnf
  [mysqld]
  basedir=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64
  ```
  And make sure the parameter `upgrade` is not set to *NONE*.

  **6. Start the new GreatSQL 8.4.4-5 instance**
  
  You need to first modify the corresponding GreatSQL service management file in systemd. For details, refer to: [Managing GreatSQL with systemd](../../4-install-guide/8-greatsql-with-systemd.md).

  ```bash
  systemctl start greatsql
  ```

  > If you use other methods to manage the GreatSQL service, you can skip this step.
  
  **7. Reinstall the Rapid Engine**
  
  ```sql
  greatsql> INSTALL PLUGIN rapid SONAME 'ha_rapid.so';
  ```
  
  At this point, the error `ERROR 1125 (HY000): Function 'rapid' already exists` may be prompted; you can ignore it, because the Rapid Engine was not unloaded before the restart.
  
  **8. Perform a full data import for all Rapid Engine tables**
  
  ```sql
  greatsql> ALTER TABLE tpch100g.customer SECONDARY_ENGINE = rapid;
  greatsql> ALTER TABLE tpch100g.customer SECONDARY_LOAD;
  ```

  Repeat the above operations for other tables until all are completed.
  
  ::: tip Tip
  Since the `SECONDARY_ENGINE=rapid` attribute of the table was not removed before the upgrade, there is no need to set it again. If all Rapid Engine tables were unloaded before the upgrade, you need to set it again.
  :::
  
  **9. Start the incremental import task again**
  
  ```sql
  greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('tpch100g', 'customer');
  ```
  This completes the Rapid Engine table upgrade.

- If the old version is MySQL 5.7 or Percona Server 5.7 or another series version, you can directly start GreatSQL 8.0.32-27 in-place based on the original `datadir` after modifying `basedir`. After confirming the upgrade is successful, continue upgrading on the basis of the original `datadir`, i.e., modify `basedir` to point to the new GreatSQL 8.4.4-5 version, and then automatic upgrade will be completed. Note that after upgrading from 5.7 to 8.0 and then to 8.4, the accounts in the database still use the `mysql_native_password` password authentication plugin. After the final upgrade to 8.4, you need to modify the *my.cnf* configuration file and add `mysql_native_password=1` to ensure that the original accounts can log in normally.
- If the old version is MySQL 8.0 or Percona Server 8.0 or another series version, you can directly start GreatSQL 8.4.4-5 in-place based on the original `datadir` after modifying `basedir`, and automatic upgrade will be completed.
- In other cases, it is best to upgrade to GreatSQL 8.4.4-5 by importing a logical backup file.

In the above in-place upgrade scenarios, make sure that the `upgrade` parameter in `my.cnf` is not set to *NONE*; it can be set to the default *AUTO* or *FORCE*. For example:

```ini
#my.cnf
[mysqld]
upgrade = AUTO
```

For more migration and upgrade solutions, please refer to: [Migration & Upgrade](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md).

### Downgrading to GreatSQL 8.4.4-5

If you want to downgrade from a higher minor version in the MySQL/Percona 8.4 series to GreatSQL 8.4.4-5, you can use the in-place downgrade method to quickly complete the version downgrade. That is, you can directly start GreatSQL 8.4.4-5 in-place based on the original `datadir` after modifying `basedir` and adding the parameter setting `upgrade=FORCE`, and automatic downgrade will be completed.

If you want to downgrade from MySQL/Percona 9.0 or later versions to GreatSQL 8.4.4-5, you need to use the logical backup + logical import method to complete the downgrade. In addition, on the first restart after the logical backup import is completed, be sure to set `upgrade=FORCE` to force upgrading all data tables, including system tables.

The downgrade process is roughly as follows:

**1. Perform a full logical backup in the higher version**
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. Import the logical backup file in the GreatSQL 8.4.4-5 environment to complete logical recovery**

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

| **1. Major Features** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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
|RISC-V Architecture Support| :heavy_check_mark: | ❌ |
|Restored Part of the Source-Replica Replication Compatibility Interface| :heavy_check_mark: | ❌ |
| **2. Performance Enhancement Extensions** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
|Rapid Engine| :heavy_check_mark: | HeatWave (cloud only) |
|Turbo Engine| :heavy_check_mark: | ❌ |
|Turbo Engine Vector Similarity Search| :heavy_check_mark: | ❌ |
|Large Transaction Binlog Independent Flush Optimization| :heavy_check_mark: | ❌ |
|Parallel Replication Replay Optimization| :heavy_check_mark: | ❌ |
|Execution Plan Drift Detection| :heavy_check_mark: | ❌ |
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
| **3. Developer-Oriented Improvements** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level Interface| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Full-Text Search Improvements| :heavy_check_mark: | ❌ |
|More Hash/Digest Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Data Types| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Functions| :heavy_check_mark: | ❌ |
|Oracle Compatibility - SQL Syntax| :heavy_check_mark: | ❌ |
|Oracle Compatibility - Stored Programs| :heavy_check_mark: | ❌ |
| **4. Basic Feature Enhancements** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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
|MGR Enhancement - Viewing Replication Delay Seconds| :heavy_check_mark: | ❌ |
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
| **5. Security Enhancements** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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
| **6. Operations Convenience Enhancements** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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

GreatSQL 8.4.4-5 is based on Percona Server for MySQL 8.4.4-4, which has made a large number of improvements and enhancements and added many new features on top of MySQL 8.4.4. For details, please see: [**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.4/feature-comparison.html). These include features only available in MySQL Enterprise Edition, such as thread pool, auditing, and data masking, as well as numerous improvements and enhancements such as performance_schema improvements, information_schema improvements, performance and scalability improvements, user statistics enhancements, PROCESSLIST enhancements, and Slow Query Log enhancements. They are not listed here one by one.

## GreatSQL Release Notes
### GreatSQL 8.4
- [Changes in GreatSQL 8.4.4-5 (2026-06-30)](changes-greatsql-8445.md)
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
