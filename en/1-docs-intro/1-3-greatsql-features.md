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

For more of GreatSQL's advantages and features, see: [GreatSQL vs MySQL](./relnotes/changes-greatsql-8445.md#greatsql-vs-mysql).

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
