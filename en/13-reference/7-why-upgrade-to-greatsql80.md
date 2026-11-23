# Why Upgrade to GreatSQL 8.0
---
This section introduces why you should upgrade to GreatSQL 8.0, and what noteworthy advantages and features GreatSQL 8.0 has compared with the 5.7 version.

## Advantages and features of GreatSQL 8.0 compared with 5.7

Compared with MySQL 5.7, GreatSQL 8.0 has improvements in performance, security, functions, SQL syntax, SQL optimizer, and many other aspects. The following is a detailed comparison table of each feature and advantage:

| Category | Feature | MySQL 5.7 | GreatSQL 8.0 | Improvements and advantages |
|------|------|-----------|-----------|----------|
| **Performance** | Instant column addition | Not supported | Supported via instant column addition | Effectively reduces downtime and improves database flexibility |
| **Performance** | Query optimization | Basic query optimization | More query optimization techniques, such as subquery pushdown, index merge, etc. | More efficient query execution plans |
| **Performance** | Parallel query | Limited parallel query support | Supports parallel query | Faster query response time |
| **Performance** | InnoDB performance | Basic InnoDB performance optimization | Improved InnoDB performance, such as faster DDL operations and more efficient cache management | Higher performance and better response time |
| **Performance** | Redo log optimization | Basic functionality | Supports parallel writes of redo logs and temporarily disabling redo logs | Higher transaction processing capability |
| **Performance** | Performance Schema | Basic Performance Schema support | Enhanced Performance Schema, supports more monitoring metrics | More detailed performance monitoring |
| **Performance** | CATS transaction scheduling algorithm | FIFO-based transaction scheduling algorithm | Adopts the Contention-Aware Transaction Scheduling (CATS) algorithm, prioritizing transactions waiting for locks to reduce lock contention and improve concurrency performance | Improves transaction concurrency performance and better resource utilization |
| **Performance** | Invisible indexes | Not supported | Supports invisible indexes | Facilitates performance tuning without affecting existing queries |
| **Performance** | Descending indexes | Not supported | Supports descending indexes | Facilitates performance tuning without affecting existing queries |
| **Performance** | Functional indexes | Not supported | Supports functional indexes | Facilitates performance tuning without affecting existing queries |
| **Performance** | Pushdown optimization | Limited pushdown optimization | More pushdown optimizations, such as `IN / NOT IN` and `EXISTS / NOT EXISTS` subquery pushdown | More efficient query execution plans |
| **Performance** | Hash Join | Not supported | Supports hash join | Improves large table join performance without indexes |
| **Performance** | More Optimize Switch options | Multiple optional switches | Supports more optional switches (such as `JOIN_INDEX / ORDER_INDEX`) to improve SQL performance | Improves large table join performance without indexes |
| **Data Management** | JSON support | Basic functionality | Extended JSON functions<br>JSON expression indexes<br>JSON path expressions | More powerful JSON processing capability |
| **Data Management** | Data dictionary | Based on MyISAM storage | Based on InnoDB storage | Safer, more efficient, and more consistent data dictionary management |
| **Data Management** | Partitioned tables | Basic partitioned table support | More partition types (such as `LIST COLUMNS` partitioning)<br>Partition pruning optimization | More flexible and efficient partition management |
| **Data Management** | Full-text indexes | Only supports full-text indexes on the MyISAM storage engine | Supports full-text indexes on the InnoDB storage engine | Broader full-text index support |
| **Data Management** | Temporary tables | Basic temporary table support | Supports persistent temporary tables | More efficient temporary table management |
| **Data Management** | Temporary tablespace | Limited temporary tablespace support | Supports independent temporary tablespaces | More efficient temporary table management |
| **Data Management** | `Clone` plugin | Not supported | Supports local/remote `CLONE` backups | Improves local/remote backup efficiency and improves source-replica replication/MGR data replication efficiency |
| **Data Management** | Online modification and persistence of configuration parameters | Not supported | Supports `SET PERSIST` to modify configuration parameters online and persist them | Improves system management flexibility |
| **Security** | Role management | Not supported | Supports role management, simplifying privilege management | More flexible privilege management |
| **Security** | Password management | Basic password management | New password validation component, more secure<br>Minimum character length requirement<br>Password history | Stronger security |
| **Security** | Auditing | Not supported | Enhanced audit log functionality | More detailed auditing and compliance support |
| **Security** | Data masking | Not supported | Enhanced data masking functionality | Stronger data masking and compliance support |
| **Replication** | Multi-source replication | Limited multi-source replication support | Improved multi-source replication support | More flexible replication topologies |
| **Replication** | GTID | Basic GTID support | Improved GTID support, supports parallel replication | More reliable replication management |
| **Replication** | Transaction replay | Limited transaction replay support | Supports transaction replay, improving recovery efficiency | Faster recovery time |
| **SQL Syntax** | Window functions | Does not support window functions | Supports window functions (such as `ROW_NUMBER()`, `RANK()`, `LEAD()`, `LAG()`, etc.) | More complex query and data analysis capability |
| **SQL Syntax** | Common table expressions (CTE) | Not supported | Supports CTE | More complex query and data analysis capability |
| **SQL Syntax** | Optimizer hints | Limited optimizer hint support | Supports more optimizer hints | More refined query optimization |
| **SQL Syntax** | Character sets and collations | Limited character set and collation support | Supports more character sets and collations<br>New default character set `utf8mb4` | Broader character set support |
| **SQL Syntax** | Locking syntax | Relatively simple syntax | Supports multiple syntaxes such as `LOCK ... FOR SHARE / NOWAIT / SKIP LOCKED` | More flexible locking request SQL syntax, supports more application scenario needs |
| **SQL Syntax** | `EXPLAIN ANALYZE` syntax | Not supported | Not only displays the query execution plan, but also provides detailed performance data during actual execution, including execution time and row counts of each step | Effectively improves performance diagnosis and SQL optimization efficiency |
| **SQL Syntax** | Basic syntax | Relatively simple syntax, lacking many modern analysis features | Adds various optimized SQL syntaxes, including window functions, CTE, JSON processing, etc. | SQL queries are more flexible and efficient, supporting more complex analysis and data operations |
| **Basic Features** | System variables | Basic system variable support | Supports dynamically modifying more system variables | More flexible configuration management |
| **Basic Features** | AUTO_INCREMENT columns | Basic functionality | Supports persistence of auto-increment values and improves the performance of auto-increment columns in source-replica replication scenarios | Ensures restart safety of auto-increment columns and improves performance under high-concurrency inserts, especially in replication environments |
| **Basic Features** | GIS | Basic functionality | Supports GeoJSON and improved GIS spatial indexes and functions | Improves the ability to process geospatial data |
| **Basic Features** | Atomic DDL | Not supported | Supports atomic DDL operations, DDL operations are crash-safe | Safer during DDL execution, avoids partial failures |
| **Basic Features** | Trigger | Basic functionality | Supports creating multiple triggers on a single table | More flexible trigger usage, improving business convenience |
| **Basic Features** | Version upgrade | Manually execute `mysql_upgrade` to upgrade | Upgrades are completed automatically, and supports pre-upgrade checks with MySQL Shell | More flexible and efficient version upgrades |
| **Basic Features** | Resource groups | Not supported | More precise control over CPU resource allocation and usage through the resource group feature | Provides more powerful tools for database management and performance optimization |
| **GreatSQL Enhancements** | HA - MGR zone id | Not supported | Supports using zone id to improve data reliability in multi-datacenter architectures | Solves the problem of data synchronization across data centers |
| **GreatSQL Enhancements** | HA - MGR arbitrator | Not supported | Arbitrator nodes do not need to store data or apply transaction logs | Achieves higher availability at lower server cost |
| **GreatSQL Enhancements** | HA - MGR read/write node VIP | Not supported | Read/write nodes can bind VIP | More convenient implementation of disaster recovery switchover solutions |
| **GreatSQL Enhancements** | HA - MGR fast single-primary mode | Not supported | Optimizes the transaction certification method in single-primary mode | Faster and higher performance in single-primary mode |
| **GreatSQL Enhancements** | HA - MGR smart primary election | Not supported | Improves the automatic primary election mechanism, adding primary election based on the latest GTID, avoiding automatically selecting a node without the latest GTID as the new primary | More reasonable primary election mechanism during HA switchovers |
| **GreatSQL Enhancements** | HA - MGR optimized flow control algorithm | Not supported | Optimizes the flow control algorithm, comprehensively considering large transactions and certification transaction queue factors | Avoids performance jitter problems |
| **GreatSQL Enhancements** | HA - MGR network overhead recording | Not supported | Records the overhead of MGR at the network layer | Facilitates further analysis and improvement of MGR efficiency |
| **GreatSQL Enhancements** | HA - MGR transaction certification queue cleanup optimization | Not supported | Optimizes the cleanup efficiency of the transaction certification queue | Avoids the risk of performance jitter every 60 seconds |
| **GreatSQL Enhancements** | HA - MGR node abnormal state detection optimization | Not supported | Optimizes the check and judgment efficiency when node status is abnormal | Increases system service time |
| **GreatSQL Enhancements** | HA - MGR node disk full exception handling | Not supported | When a node's disk space is full, the node proactively exits | Avoids blocking MGR transaction certification due to inability to proactively exit |
| **GreatSQL Enhancements** | HA - loop prevention in primary-primary replication | Not supported | Tags binlog to avoid repeated application of transaction loops | Avoids data loop problems in primary-primary replication |
| **GreatSQL Enhancements** | High Performance - Rapid Engine | Not supported | Supports the high-performance Rapid Engine with large-scale parallelism, in-memory queries, and high compression ratios | Can improve complex data analysis performance by several orders of magnitude |
| **GreatSQL Enhancements** | High Performance - InnoDB lock-free transaction optimization | Not supported | Various optimization schemes such as large lock splitting and lock-free design | Overall OLTP scenario performance improvement of about 20% |
| **GreatSQL Enhancements** | High Performance - parallel `LOAD DATA` | Not supported | Imports data with parallel `LOAD DATA`, with optimizations for scenarios without explicitly defined primary keys | Suitable for application scenarios that frequently import large amounts of data, with performance improvement of about 20+ times |
| **GreatSQL Enhancements** | High Performance - asynchronous drop of large tables | Not supported | Drops large tables asynchronously | Improves InnoDB stability |
| **GreatSQL Enhancements** | High Performance - thread pool | Only supported in the enterprise edition | Pre-allocates threads in a pooled manner to improve new connection efficiency | Avoids performance jitter with a large number of short connections |
| **GreatSQL Enhancements** | High Performance - non-blocking DDL | Not supported | No longer continuously blocks when requesting DDL locks | Improves overall business system availability |
| **GreatSQL Enhancements** | High Performance - NUMA affinity optimization | Not supported | Through NUMA affinity scheduling optimization, binds front-end user threads and background threads to fixed NUMA nodes to improve thread processing performance | TPC-C performance improvement of about 10% |
| **GreatSQL Enhancements** | High Compatibility | / | 100% fully compatible with MySQL syntax, supports most common Oracle usages | Improves migration efficiency of legacy business application systems |
| **GreatSQL Enhancements** | High Security - national cryptographic algorithms | Only supports communication encryption with national cryptographic algorithms | In addition to communication encryption, also supports national cryptographic tablespace encryption, backup encryption, etc. | Ensures encrypted security of important data, meeting financial-grade security requirements |
| **GreatSQL Enhancements** | High Security - mysqldump backup encryption | Not supported | Encrypts mysqldump logical backup files | Ensures encrypted security of important data, meeting financial-grade security requirements |
| **GreatSQL Enhancements** | High Security - Clone backup encryption | Not supported | Encrypts Clone physical backup files | Ensures encrypted security of important data, meeting financial-grade security requirements |
| **GreatSQL Enhancements** | High Security - auditing | Only supported in the enterprise edition | Supports the auditing feature, writes audit logs into data tables, and supports setting audit logs to be written to tables | Meets different auditing needs |
| **GreatSQL Enhancements** | High Security - data masking | Only supported in the enterprise edition | Supports two data masking working modes based on functions and policies | Protects the confidentiality of sensitive user data query results |
| **GreatSQL Enhancements** | High Security - recording last login information | Not supported | Supports recording the last login time of specified users for administrator queries | Improves database security and avoids the risk of malicious login cracking attempts |
| **GreatSQL Enhancements** | Others - Clone compressed backup | Not supported | Supports Clone physical compressed backups | Reduces backup file storage costs |
| **GreatSQL Enhancements** | Others - Clone incremental backup | Not supported | Supports Clone physical incremental backups | Improves backup reliability and backup file recovery efficiency |

## Upgrading to GreatSQL 8.0

If you want to upgrade from MySQL / GreatSQL 5.7 to GreatSQL 8.0, refer to the documentation: [Upgrading GreatSQL 5.7 to 8.0](../7-migrate-and-upgrade/1-upgrade-to-greatsql8.md).

## Summary

Compared with 5.7, GreatSQL 8.0 has made significant improvements and enhancements in multiple aspects, including performance, data management, security, replication, optimizer (such as invisible indexes, functional indexes, histograms), and SQL syntax support (such as window functions, CTE). These improvements make GreatSQL 8.0 a more powerful, flexible, and secure database management system, especially suitable for large-scale and high-concurrency application scenarios.

Through these new features, users can manage and optimize databases more efficiently, improving the overall availability, performance, security, compatibility, and reliability of the GreatSQL database.

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
