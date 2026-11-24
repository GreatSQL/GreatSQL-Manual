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
- Supports [recording the last login time of a specified user](../5-enhance/5-4-security-last-login.md), making it easier for administrators to query and further improving database security.

Through the multiple security enhancement features above, business data security is further safeguarded. For more information, see the document: [High Security](../5-enhance/5-4-security.md).

### [Others](../5-enhance/5-5-others.md)
- Supports [Clone online full hot backup, incremental backup, and restore](../5-enhance/5-5-clone-compressed-and-incrment-backup.md). Combined with the binary log, this enables recovery to a specified point in time. In addition, Clone backup supports compression.

## GreatSQL VS MySQL

| **1. Main Features** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| Open Source | :heavy_check_mark: | :heavy_check_mark: |
| ACID Integrity | :heavy_check_mark: | :heavy_check_mark: |
| MVCC | :heavy_check_mark: | :heavy_check_mark: |
| Row Locking | :heavy_check_mark: | :heavy_check_mark: |
| Automatic Crash Recovery | :heavy_check_mark: | :heavy_check_mark: |
| Table Partitioning | :heavy_check_mark: | :heavy_check_mark: |
| Views | :heavy_check_mark: | :heavy_check_mark: |
| Subqueries | :heavy_check_mark: | :heavy_check_mark: |
| Triggers | :heavy_check_mark: | :heavy_check_mark: |
| Stored Programs | :heavy_check_mark: | :heavy_check_mark: |
| Foreign Keys | :heavy_check_mark: | :heavy_check_mark: |
| Window Functions | :heavy_check_mark: | :heavy_check_mark: |
| Common Table Expressions (CTE) | :heavy_check_mark: | :heavy_check_mark: |
| Geographic Information (GIS) | :heavy_check_mark: | :heavy_check_mark: |
| GTID-based Replication | :heavy_check_mark: | :heavy_check_mark: |
| Group Replication (MGR) | :heavy_check_mark: | :heavy_check_mark: |
| MyRocks Engine | :heavy_check_mark: | ❌ |
| LoongArch Support | :heavy_check_mark: | ❌ |
| **2. Performance Extensions** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| Rapid Engine | :heavy_check_mark: | HeatWave only on cloud |
| Turbo Engine | :heavy_check_mark: | ❌ |
| NUMA Affinity Optimization | :heavy_check_mark: | ❌ |
| Non-blocking DDL | :heavy_check_mark: | ❌ |
| Faster Import for Tables without Primary Keys | :heavy_check_mark: | ❌ |
| InnoDB Parallel Query | :heavy_check_mark: | Primary-key scan only |
| Parallel LOAD DATA | :heavy_check_mark: | ❌ |
| Lock-free InnoDB Transaction ReadView Optimization | :heavy_check_mark: | ❌ |
| InnoDB Transaction Large Lock Splitting Optimization | :heavy_check_mark: | ❌ |
| InnoDB Resource Groups | :heavy_check_mark: | :heavy_check_mark: |
| Custom InnoDB Page Size | :heavy_check_mark: | :heavy_check_mark: |
| Contention-Aware Transaction Scheduling | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Mutex Splitting Optimization | :heavy_check_mark: | ❌ |
| MEMORY Engine Optimization | :heavy_check_mark: | ❌ |
| InnoDB Flushing Optimization | :heavy_check_mark: | ❌ |
| Parallel Doublewrite Buffer | :heavy_check_mark: | :heavy_check_mark: |
| Fast InnoDB Index Creation Optimization | :heavy_check_mark: | ❌ |
| Single-column Compression for VARCHAR/BLOB/JSON | :heavy_check_mark: | ❌ |
| Column Compression Info in Data Dictionary | :heavy_check_mark: | ❌ |
| **3. Developer Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| X API | :heavy_check_mark: | :heavy_check_mark: |
| JSON | :heavy_check_mark: | :heavy_check_mark: |
| NoSQL Socket-Level Interface | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Full-Text Search Improvements | :heavy_check_mark: | ❌ |
| More Hash/Digest Functions | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Data Types | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Functions | :heavy_check_mark: | ❌ |
| Oracle Compatibility - SQL Syntax | :heavy_check_mark: | ❌ |
| Oracle Compatibility - Stored Routines | :heavy_check_mark: | ❌ |
| **4. Basic Feature Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| MGR - Zone Tags | :heavy_check_mark: | ❌ |
| MGR - Arbitrator Nodes | :heavy_check_mark: | ❌ |
| MGR - Dynamic VIP for Read/Write Nodes | :heavy_check_mark: | ❌ |
| MGR - Fast Single-Primary Mode | :heavy_check_mark: | ❌ |
| MGR - Smart Primary Election | :heavy_check_mark: | ❌ |
| MGR - New Flow Control Algorithm | :heavy_check_mark: | ❌ |
| MGR - Automatic Donor Selection | :heavy_check_mark: | ❌ |
| Clone Full & Incremental Backup | :heavy_check_mark: | ❌ |
| Clone Backup Compression | :heavy_check_mark: | ❌ |
| Number of information_schema Tables | 95 | 65 |
| Global Performance and Status Metrics | 853 | 434 |
| Optimizer Histograms | :heavy_check_mark: | :heavy_check_mark: |
| Per-Table Performance Metrics | :heavy_check_mark: | ❌ |
| Per-Index Performance Metrics | :heavy_check_mark: | ❌ |
| Per-User Performance Metrics | :heavy_check_mark: | ❌ |
| Per-Client Performance Metrics | :heavy_check_mark: | ❌ |
| Per-Thread Performance Metrics | :heavy_check_mark: | ❌ |
| Global Query Response Time Statistics | :heavy_check_mark: | ❌ |
| Enhanced SHOW ENGINE INNODB STATUS | :heavy_check_mark: | ❌ |
| Enhanced Rollback Segment Information | :heavy_check_mark: | ❌ |
| Enhanced Temporary Table Information | :heavy_check_mark: | ❌ |
| Enhanced User Statistics | :heavy_check_mark: | ❌ |
| Enhanced Slow Log Information | :heavy_check_mark: | ❌ |
| **5. Security Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| National Cryptographic (GM) Support | :heavy_check_mark: | ❌ |
| Backup Encryption | :heavy_check_mark: | ❌ |
| Auditing | :heavy_check_mark: | Enterprise only |
| Data Masking | :heavy_check_mark: | ❌ |
| Last Login Recording | :heavy_check_mark: | ❌ |
| SQL Roles | :heavy_check_mark: | :heavy_check_mark: |
| SHA-2 Password Hashing | :heavy_check_mark: | :heavy_check_mark: |
| Password Rotation Policy | :heavy_check_mark: | :heavy_check_mark: |
| PAM Authentication Plugin | :heavy_check_mark: | Enterprise only |
| Keyring Stored in Files | :heavy_check_mark: | :heavy_check_mark: |
| Keyring Stored in Hashicorp Vault | :heavy_check_mark: | Enterprise only |
| InnoDB Data Encryption | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Log Encryption | :heavy_check_mark: | :heavy_check_mark: |
| InnoDB Tablespace File Encryption | :heavy_check_mark: | :heavy_check_mark: |
| Binary Log Encryption | :heavy_check_mark: | ❌ |
| Temporary File Encryption | :heavy_check_mark: | ❌ |
| Enforced Encryption | :heavy_check_mark: | ❌ |
| **6. Operational Convenience Improvements** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| Atomic DDL | :heavy_check_mark: | :heavy_check_mark: |
| Data Dictionary Stored in InnoDB Tables | :heavy_check_mark: | :heavy_check_mark: |
| Fast DDL | :heavy_check_mark: | :heavy_check_mark: |
| SET PERSIST | :heavy_check_mark: | :heavy_check_mark: |
| Invisible Indexes | :heavy_check_mark: | :heavy_check_mark: |
| Thread Pool | :heavy_check_mark: | Enterprise only |
| Backup Locks | :heavy_check_mark: | ❌ |
| Extended SHOW GRANTS | :heavy_check_mark: | ❌ |
| Extended Corrupted Table Actions | :heavy_check_mark: | ❌ |
| Kill Idle Transactions | :heavy_check_mark: | ❌ |
| Extended START TRANSACTION WITH CONSISTENT SNAPSHOT | :heavy_check_mark: | ❌ |

GreatSQL 8.0.32-27 is based on Percona Server for MySQL 8.0.32 and makes a large number of improvements and new features on top of MySQL 8.0.32. For details, see: [**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html). These include features only available in MySQL Enterprise Edition, such as thread pool, auditing and data masking, as well as performance_schema improvements, information_schema improvements, performance and scalability improvements, enhanced user statistics, enhanced PROCESSLIST, enhanced Slow Log, and many more; they are not all listed here one by one.

GreatSQL is also a GVP project on the Gitee platform, see: [https://gitee.com/gvp/database-related](https://gitee.com/gvp/database-related) in the **Database-related** category.

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
