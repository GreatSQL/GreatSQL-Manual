# Key Features

GreatSQL is an **open source and free** database that can meet financial-grade application scenarios on commodity hardware. It features **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, and can serve as an ideal drop-in replacement for MySQL or Percona Server for MySQL.

## Core Features

### [High Availability](../5-enhance/5-2-ha.md)

GreatSQL has made numerous improvements and enhancements to MGR, supporting features such as zone id, arbitrator, dynamic read/write VIP, fast single-primary mode, and smart primary election. It also deeply optimizes several underlying MGR working mechanisms and algorithms, including the flow control algorithm, transaction certification queue cleanup algorithm, member join/leave mechanism, and recovery mechanism, further improving MGR's high availability guarantee and performance stability.

- Supports the [zone id](../5-enhance/5-2-ha-mgr-zoneid.md) feature to improve data reliability in multi-site architectures.
- Supports the [arbitrator](../5-enhance/5-2-ha-mgr-arbitrator.md) feature, achieving higher availability at lower server cost.
- Supports the [dynamic read/write VIP](../5-enhance/5-2-ha-mgr-vip.md) feature, making high availability switchover more convenient and read load balancing faster. Supports [actively closing current active connections when the primary switches](../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md) to shorten application-side unavailability.
- Supports [fast single-primary mode](../5-enhance/5-2-ha-mgr-fast-mode.md), which is faster and delivers higher performance in single-primary mode.
- Supports [smart primary election](../5-enhance/5-2-ha-mgr-election-mode.md), making the primary election mechanism during HA switchover more reasonable.
- Optimizes the [flow control algorithm](../5-enhance/5-2-ha-mgr-new-fc.md) to make transactions smoother and avoid severe jitter.
- Supports [recording events where MGR network communication overhead exceeds the threshold](../5-enhance/5-2-ha-mgr-request-time.md) for further analysis and optimization.
- Supports a [loop prevention mechanism in primary-primary bidirectional replication](../5-enhance/5-2-ha-repl-server-mode.md) for cross-site disaster recovery scenarios.
- Optimizes the problem of severe performance jitter that may occur when members join or leave.
- Resolves the issue where the entire MGR cluster is blocked when disk space on a member is exhausted.
- Optimizes the transaction certification queue cleanup algorithm, eliminating the performance jitter every 60 seconds under high load.
- Resolves the issue where long-running transactions prevent primary election.
- Fixes the long waiting time during the recovery process.

For more information, see the document: [High Availability](../5-enhance/5-2-ha.md).

### [High Performance](../5-enhance/5-1-highperf.md)

Relative to MySQL and Percona Server for MySQL, GreatSQL delivers more stable and superior performance. It supports features such as Rapid Engine, lock-free transactions, parallel LOAD DATA, asynchronous drop of large tables, thread pool, non-blocking DDL, and NUMA affinity scheduling optimization. In TPC-C tests, performance is improved by more than 30% compared with MySQL, and in TPC-H tests, performance is tens or even hundreds of times that of MySQL.

- Supports the [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md), a high-performance engine featuring massive parallelism, in-memory queries, and a high compression ratio, which can improve data analysis performance by several orders of magnitude.
- Optimizes the InnoDB transaction system with various optimizations such as splitting big locks and lock-free design, improving overall OLTP performance by about 20%.
- Supports [parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md), suitable for applications that frequently import large batches of data, improving performance by more than 20 times; it also provides optimizations for scenarios without an explicitly defined primary key.
- Supports [asynchronous drop of large tables](../5-enhance/5-1-highperf-async-purge-big-table.md), improving the runtime performance stability of the InnoDB engine.
- Supports [thread pool](../5-enhance/5-1-highperf-thread-pool.md), reducing the cost of thread creation and destruction and ensuring stable performance without obvious degradation under high concurrency.
- Supports [non-blocking DDL](../5-enhance/5-1-highperf-nonblocking-ddl.md), avoiding the problem of a large number of business requests being blocked because DDL operations must be completed as soon as possible.
- Supports [NUMA affinity optimization](../5-enhance/5-1-highperf-numa-affinity.md), binding front-end user threads and background threads to fixed NUMA nodes through NUMA affinity scheduling optimization to improve thread processing performance.

For more information, see the document: [High Performance](../5-enhance/5-1-highperf.md).

### [High Compatibility](../5-enhance/5-3-easyuse.md)

GreatSQL is 100% compatible with MySQL and Percona Server for MySQL usage and supports most common Oracle usage, including [data type compatibility](../5-enhance/5-3-easyuse.md#data-type-compatibility), [function compatibility](../5-enhance/5-3-easyuse.md#function-compatibility), [SQL syntax compatibility](../5-enhance/5-3-easyuse.md#sql-syntax-compatibility), [stored routine compatibility](../5-enhance/5-3-easyuse.md#stored-routine-compatibility), and many other compatibility extensions.

For more information, see the document: [High Compatibility](../5-enhance/5-3-easyuse.md).

### [High Security](../5-enhance/5-4-security.md)

GreatSQL supports multiple security enhancement features such as logical backup encryption, Clone backup encryption, auditing, national cryptographic tablespace encryption, and sensitive data masking, further safeguarding business data security and making it more suitable for financial-grade application scenarios.

- Supports [mysqldump logical backup encryption](../5-enhance/5-4-security-mysqldump-encrypt.md), providing a secure encryption solution for logical backups made with mysqldump.
- Supports [Clone backup encryption](../5-enhance/5-4-security-clone-encrypt.md), providing a secure encryption solution for physical backups made with Clone.
- Supports the [auditing feature](../5-enhance/5-4-security-audit.md) to record and detect unauthorized or unsafe behavior in a timely manner.
- Supports [national cryptographic encryption algorithms for InnoDB tablespaces](../5-enhance/5-4-security-encrypt-with-gmssl.md), ensuring the encryption security of important data.
- Supports [two data masking approaches based on functions and policies](../5-enhance/5-4-security-data-masking.md) to protect the confidentiality of query results for sensitive user data.

Through the multiple security enhancement features above, business data security is further safeguarded. For more information, see the document: [High Security](../5-enhance/5-4-security.md).

### [Others](../5-enhance/5-5-others.md)
- Supports [Clone online full hot backup, incremental backup, and restore](../5-enhance/5-5-clone-compressed-and-incrment-backup.md). Combined with the binary log, this enables recovery to a specified point in time. In addition, Clone backup supports compression.

## GreatSQL vs MySQL

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
|Accelerated Import for Tables Without Primary Key| :heavy_check_mark: | ❌ |
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
|MGR Enhancement - Automatic Donor Node Selection| :heavy_check_mark: | ❌ |
|Clone Full & Incremental Backup| :heavy_check_mark: | ❌ |
|Clone Backup Compression| :heavy_check_mark: | ❌ |
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

GreatSQL is also a GVP project on the gitee (code cloud) platform. For details, see the **Database-related** category: [https://gitee.com/gvp/database-related](https://gitee.com/gvp/database-related).

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
