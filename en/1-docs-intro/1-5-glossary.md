# Glossary

---

| Term | Explanation |
| :---------------------------------------- | --- |
| arbitrator | An arbitrator/voting node. A new role type introduced in GreatSQL 8.0.25-16. This node stores no user data, has no binary log, and does not replay the relay log; it only participates in MGR status voting/arbitration. For details, see [1.1 New Arbitrator (Voting) Node Role](../5-enhance/5-2-ha-mgr-arbitrator.md). |
| audit | GreatSQL supports the auditing feature, and can also write audit logs into the database for convenient querying by administrators. For details, see [Writing Audit Logs to Tables](../5-enhance/5-4-security-audit.md). |
| binary log | The binary log records all change operations performed on the database (e.g., table creation, table alteration, data changes) and is used for data recovery, source-replica replication, read/write splitting, and more. For details, see [Binary Log](../2-about-greatsql/4-greatsql-log.md). |
| Clone backup | A physical backup method based on the MySQL Clone plugin that efficiently backs up InnoDB tables. GreatSQL also supports Clone backup encryption, compression, and incremental backup. For details, see [Clone Compression & Incremental Backup](../5-enhance/5-5-clone-compressed-and-incrment-backup.md). |
| consensus | Consensus. In MGR, when a transaction is initiated, it is broadcast to all members; the transaction can only be committed after a majority of members reach consensus. The majority means that more than half of the members agree — for example, with 3 members in total, at least 2 must agree. |
| data masking | Data masking. Masks sensitive data (such as phone numbers, ID card numbers, and bank card numbers) to prevent disclosure of sensitive information. For details, see [Data Masking](../5-enhance/5-4-security-data-masking.md). |
| deadlock | A deadlock occurs when two or more transactions hold locks that the others need and each waits for the other to release them, causing the transactions to block permanently. For details, see [Deadlock Diagnostics](../10-optimize/2-6-deadlock-diag.md). |
| donor | When a new member joins MGR, the member that provides data transfer for the new member is called the donor. |
| election mode | The primary election strategy. Set the option `group_replication_primary_election_mode` to choose different primary election strategies. For details, see [1.4 Custom Primary Election Mode](../5-enhance/5-2-ha-mgr-election-mode.md). |
| encryption | GreatSQL supports mysqldump backup encryption, CLONE backup encryption, and national cryptographic encryption of InnoDB tablespaces, among other features. For details, see [High Security](../1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605.md#security). |
| fast mode | Fast single-primary mode. In this mode, the transaction cost of MGR can be reduced and transaction performance improved. For details, see [1.2 New Fast Single-Primary Mode](../5-enhance/5-2-ha-mgr-fast-mode.md). |
| flow control | A mechanism used by MGR to coordinate the transaction commit rate of members, control the length of the certification queue, and avoid excessive data gaps between members. GreatSQL implements a new flow control algorithm. For details, see [1.3 New Flow Control Algorithm](../5-enhance/5-2-ha-mgr-new-fc.md). |
| GCS | Group Communication System, the underlying communication system of MGR. |
| GMSSL | National cryptography. An SSL encryption implementation based on national cryptographic algorithms (SM2/SM3/SM4). GreatSQL supports encrypted connections with GMSSL. For details, see [GMSSL (National Cryptography) Support](../5-enhance/5-4-security-encrypt-with-gmssl.md). |
| joiner | A newly joined member of MGR is called a joiner. |
| lock-free transactions | An optimization of the InnoDB transaction mechanism in GreatSQL that reduces lock contention and improves read/write performance under high concurrency. For details, see [High Performance](../5-enhance/5-1-highperf.md). |
| MariaDB | In this user manual, this term always refers to [MariaDB Server](https://mariadb.com/kb/en/documentation/), an alternative MySQL-compatible database product created by MySQL founder Monty. |
| member | An MGR member, also called a node. |
| MGR/<br/>GR/<br/>Group Replication | MySQL Group Replication, short for MySQL group replication. A new replication mechanism introduced by MySQL that differs from source-replica replication and semi-synchronous replication. |
| Oracle Compat | GreatSQL supports multiple Oracle compatibility features, including data types, functions, SQL syntax, stored routines, and more. For details, see [High Compatibility](../5-enhance/5-3-easyuse.md). |
| Percona | In this user manual, this term always refers to Percona Server For MySQL, commonly known as the [Percona branch](https://docs.percona.com/percona-server/), a well-known MySQL branch in the industry. |
| PQ | Abbreviation of parallel query. GreatSQL incorporates code contributed by the Huawei Kunpeng computing team to implement the InnoDB parallel query feature. For details, see [InnoDB Parallel Query Optimization Reference](../5-enhance/5-1-highperf-innodb-pq.md). |
| Primary | The primary node, one of the MGR member roles. It handles read/write transaction requests. |
| primary switchover | The process during which the primary node of MGR changes (including failover and manual switchover). After the switchover, application connections to the old primary are disconnected. For details, see [Disconnecting App Connections After MGR Primary Switchover](../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md). |
| Rapid Engine | The columnar analytical engine built into GreatSQL, used to accelerate analytical queries (AP scenarios). For details, see [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md). |
| read/write splitting | Splits read requests and write requests across different members (for example, in MGR the primary handles writes and secondaries handle reads) to improve overall throughput. For details, see [Read/Write Splitting](../8-mgr/5-mgr-readwrite-split.md). |
| redo log | The log used by the InnoDB storage engine for crash recovery, recording physical modifications to data pages. For details, see [Redo Log](../2-about-greatsql/4-greatsql-log.md). |
| Secondary | The secondary node, one of the MGR member roles. It can only respond to read-only transaction requests. |
| slow query log | Records SQL statements whose execution time exceeds a threshold, used for slow SQL troubleshooting and performance optimization. For details, see [Slow Query Log](../2-about-greatsql/4-greatsql-log.md). |
| smart primary election | Automatically selects the most suitable primary node based on multiple dimensions (such as member data size and replication lag). For details, see [MGR Smart Primary Election](../5-enhance/5-2-ha-mgr-election-mode.md). |
| thread pool | Pre-creates and reuses threads to handle client connection requests, reducing the overhead of frequent thread creation and destruction and improving concurrent performance. For details, see [Thread Pool](../5-enhance/5-1-highperf-thread-pool.md). |
| Turbo Engine | The vector similarity search engine built into GreatSQL, supporting vector data types and vector indexes. For details, see [Turbo Engine](../5-enhance/5-1-highperf-turbo-engine.md). |
| undo log | The log used by the InnoDB storage engine to implement transaction rollback and MVCC. For details, see [Undo Log](../2-about-greatsql/4-greatsql-log.md). |
| VIP | GreatSQL supports binding a dynamic VIP (virtual IP) to read/write members, making high availability switchover more convenient. For details, see [MGR Built-in Dynamic VIP](../5-enhance/5-2-ha-mgr-vip.md). |
| XCom | The concrete implementation of the Paxos algorithm in MGR, called XCom, which serves as the communication engine of MGR. |
| zone id | A geographic tag. A geographic tag can be set for each member, mainly used to solve the problem of data synchronization across multiple data centers. For details, see [1.1 New Member Zone Tag](../5-enhance/5-2-ha-mgr-zoneid.md). |

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
