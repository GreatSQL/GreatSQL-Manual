# Glossary

---

| Term | Explanation |
| :---------------------------------------- | --- |
| arbitrator | An arbitrator/voting node. A new role type introduced in GreatSQL 8.0.25-16. This node stores no user data, has no binary log, and does not replay the relay log; it only participates in MGR status voting/arbitration. For details, see [1.1 New Arbitrator (Voting) Node Role](../5-enhance/5-2-ha-mgr-arbitrator.md). |
| audit | GreatSQL supports the auditing feature, and can also write audit logs into the database for convenient querying by administrators. For details, see [Writing Audit Logs to Tables](../5-enhance/5-4-security-audit.md). |
| consensus | Consensus. In MGR, when a transaction is initiated, it is broadcast to all members; the transaction can only be committed after a majority of members reach consensus. The majority means that more than half of the members agree — for example, with 3 members in total, at least 2 must agree. |
| donor | When a new member joins MGR, the member that provides data transfer for the new member is called the donor. |
| election mode | The primary election strategy. Set the option `group_replication_primary_election_mode` to choose different primary election strategies. For details, see [1.4 Custom Primary Election Mode](../5-enhance/5-2-ha-mgr-election-mode.md). |
| encryption | GreatSQL supports mysqldump backup encryption, CLONE backup encryption, and national cryptographic encryption of InnoDB tablespaces, among other features. For details, see [High Security](../1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605.md#security). |
| fast mode | Fast single-primary mode. In this mode, the transaction cost of MGR can be reduced and transaction performance improved. For details, see [1.2 New Fast Single-Primary Mode](../5-enhance/5-2-ha-mgr-fast-mode.md). |
| GCS | Group Communication System, the underlying communication system of MGR. |
| joiner | A newly joined member of MGR is called a joiner. |
| MariaDB | In this user manual, this term always refers to [MariaDB Server](https://mariadb.com/kb/en/documentation/), an alternative MySQL-compatible database product created by MySQL founder Monty. |
| member | An MGR member, also called a node. |
| MGR/<br/>GR/<br/>Group Replication | MySQL Group Replication, short for MySQL group replication. A new replication mechanism introduced by MySQL that differs from source-replica replication and semi-synchronous replication. |
| Oracle Compat | GreatSQL supports multiple Oracle compatibility features, including data types, functions, SQL syntax, stored routines, and more. For details, see [High Compatibility](../5-enhance/5-3-easyuse.md). |
| Percona | In this user manual, this term always refers to Percona Server For MySQL, commonly known as the [Percona branch](https://docs.percona.com/percona-server/), a well-known MySQL branch in the industry. |
| PQ | Abbreviation of parallel query. GreatSQL incorporates code contributed by the Huawei Kunpeng computing team to implement the InnoDB parallel query feature. For details, see [InnoDB Parallel Query Optimization Reference](../5-enhance/5-1-highperf-innodb-pq.md). |
| Primary | The primary node, one of the MGR member roles. It handles read/write transaction requests. |
| Secondary | The secondary node, one of the MGR member roles. It can only respond to read-only transaction requests. |
| VIP | GreatSQL supports binding a dynamic VIP (virtual IP) to read/write members, making high availability switchover more convenient. For details, see [MGR Built-in Dynamic VIP](../5-enhance/5-2-ha-mgr-vip.md). |
| Xcom | The concrete implementation of the Paxos algorithm in MGR, called XCom, which serves as the communication engine of MGR. |
| zone id | A geographic tag. A geographic tag can be set for each member, mainly used to solve the problem of data synchronization across multiple data centers. For details, see [1.1 New Member Zone Tag](../5-enhance/5-2-ha-mgr-zoneid.md). |

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
