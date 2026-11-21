# 术语表
---

| 术语 | 解释 |
| :---------------------------------------- | --- |
| arbitrator | 仲裁节点/投票节点。GreatSQL 8.0.25-16 版本中新增角色类型。该节点不存储用户数据，没有 binlog，也不需要回放 Relay Log，只参与 MGR 状态投票/仲裁。详情参考文档：[1.1 新增仲裁节点（投票节点）角色](../5-enhance/5-2-ha-mgr-arbitrator.md)。|
| audit | GreatSQL 支持开启审计功能，并且还支持将审计日志写入数据库中，方便管理员查询。详情参考文档：[审计日志入表](../5-enhance/5-4-security-audit.md)。 |
| binary log | 二进制日志。记录所有对数据库执行的更改操作（如建表、改表、数据变更），用于数据恢复、主从复制、读写分离等场景。详情参考文档：[二进制日志（Binary Log）](../2-about-greatsql/4-greatsql-log.md)。 |
| Clone backup | 克隆备份。基于 MySQL Clone 插件的物理备份方式，可对 InnoDB 表进行高效备份，GreatSQL 还支持 Clone 备份加密、压缩与增量备份。详情参考文档：[Clone 压缩及增量备份](../5-enhance/5-5-clone-compressed-and-incrment-backup.md)。 |
| consensus | 共识。在 MGR 中，一个事务发起后，要广播到各个节点，当多数派节点达成共识后，这个事务才可以被提交。所谓的多数派就是超过半数的节点达成一致，例如总共 3 个节点，则至少 2 个节点达成一致。|
| data masking | 数据脱敏（数据屏蔽）。对敏感数据（如手机号、身份证号、银行卡号）进行掩码处理，防止敏感信息泄露。详情参考文档：[数据脱敏](../5-enhance/5-4-security-data-masking.md)。 |
| deadlock | 死锁。两个或多个事务相互持有对方需要的锁，彼此等待对方释放，导致事务永久阻塞。详情参考文档：[死锁诊断](../10-optimize/2-6-deadlock-diag.md)。 |
| donor | 新节点加入 MGR 时，为新节点提供数据传输的节点称为 donor。|
| election mode | 选主策略。设置选项 `group_replication_primary_election_mode` 选择不同的选主策略。详情参考文档：[1.4 自定义选主模式](../5-enhance/5-2-ha-mgr-election-mode.md)。|
| encryption | GreatSQL 支持 mysqldump 备份加密、CLONE 备份加密，以及 InnoDB 表空间国密加密等功能。详情参考文档：[高安全](../1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605.md#安全)。|
| fast mode | 快速单主模式。在该模式下可以降低 MGR 事务代价，提升事务性能。详情参考文档：[1.2 新增快速单主模式](../5-enhance/5-2-ha-mgr-fast-mode.md)。|
| flow control | 流控。MGR 用于协调各节点事务提交速率、控制认证队列长度、避免成员间数据差距过大的机制，GreatSQL 实现了全新流控算法。详情参考文档：[1.3 新增全新流控算法](../5-enhance/5-2-ha-mgr-new-fc.md)。 |
| GCS | Group Communication System，组通信系统，MGR 底层通信系统。|
| GMSSL | 国密。基于国家密码算法（SM2/SM3/SM4）的 SSL 加密实现，GreatSQL 支持国密加密连接。详情参考文档：[国密支持](../5-enhance/5-4-security-encrypt-with-gmssl.md)。 |
| joiner | MGR 中新加入的节点，称之为 joiner。|
| lock-free transactions | 无锁事务。GreatSQL 对 InnoDB 事务机制的优化，减少锁竞争，提升高并发下的读写性能。详情参考文档：[高性能](../5-enhance/5-1-highperf.md)。 |
| MariaDB | 在本用户手册中均指 [MariaDB Server](https://mariadb.com/kb/en/documentation/)，由 MySQL 创始人 Monty 创建的 MySQL 可选替代数据库产品。|
| member | MGR 成员，也称为节点。|
| MGR/<br/>GR/<br/>Group Replication | MySQL Group Replication，MySQL 组复制的简称。MySQL 推出的一种不同于主从复制、半同步复制的全新复制机制。|
| Oracle Compat | GreatSQL 中支持多个 Oracle 兼容特性，包括数据类型、函数、SQL 语法、存储过程等。详情参考文档：[高兼容](../5-enhance/5-3-easyuse.md)。|
| Percona | 在本用户手册中均指 Percona Server For MySQL，即通常所说的 [Percona 分支](https://docs.percona.com/percona-server/)，业界著名的 MySQL 分支。 |
| PQ | parallel query（并行查询）的缩写。GreatSQL 合并了华为鲲鹏计算团队贡献的代码，实现了 InnoDB 并行查询特性。详情参考文档：[InnoDB 并行查询优化参考](../5-enhance/5-1-highperf-innodb-pq.md)。|
| Primary | 称为主要节点，主节点，MGR 节点角色之一。响应读写事务请求。|
| primary switchover | 主切换（切主）。MGR 主节点发生切换的过程（包括故障转移与手动切换），切换后旧主节点上的应用连接会被断开。详情参考文档：[MGR 切主后断开应用连接](../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md)。 |
| Rapid Engine | Rapid 引擎。GreatSQL 内置的列存分析引擎，用于加速分析型查询（AP 场景）。详情参考文档：[Rapid 引擎](../5-enhance/5-1-highperf-rapid-engine.md)。 |
| read/write splitting | 读写分离。将读请求与写请求分发到不同节点（如 MGR 中主节点负责写、从节点负责读），提升整体吞吐能力。详情参考文档：[读写分离](../8-mgr/5-mgr-readwrite-split.md)。 |
| redo log | 重做日志。InnoDB 存储引擎用于崩溃恢复的日志，记录数据页面的物理修改。详情参考文档：[重做日志（Redo Log）](../2-about-greatsql/4-greatsql-log.md)。 |
| Secondary | 称为辅助节点，从节点，MGR 节点角色之一。只能响应只读事务请求。|
| slow query log | 慢查询日志。记录执行时间超过阈值的 SQL 语句，用于慢 SQL 排查与性能优化。详情参考文档：[慢查询日志（Slow Query Log）](../2-about-greatsql/4-greatsql-log.md)。 |
| smart primary election | 智能选主。MGR 基于多个维度（如节点数据量、复制延迟等）自动选择最合适的主节点。详情参考文档：[MGR 智能选主](../5-enhance/5-2-ha-mgr-election-mode.md)。 |
| thread pool | 线程池。预先创建并复用线程处理客户端连接请求，减少线程频繁创建与销毁的开销，提升并发性能。详情参考文档：[线程池](../5-enhance/5-1-highperf-thread-pool.md)。 |
| Turbo Engine | Turbo 引擎。GreatSQL 内置的向量相似度检索引擎，支持向量类型与向量索引。详情参考文档：[Turbo 引擎](../5-enhance/5-1-highperf-turbo-engine.md)。 |
| undo log | 撤销日志。InnoDB 存储引擎用于实现事务回滚与 MVCC 的日志。详情参考文档：[撤销日志（Undo Log）](../2-about-greatsql/4-greatsql-log.md)。 |
| VIP | GreatSQL 中支持读写节点绑定动态 VIP（虚拟 IP），高可用切换更便捷。详情参考文档：[MGR 内置动态 VIP](../5-enhance/5-2-ha-mgr-vip.md)。|
| XCom | Paxos 算法在 MGR 中的具体实现，称之为 XCom，由它充当 MGR 的通信引擎。|
| zone id | 地理标签。可以对每个节点设置地理标签，主要用于解决多机房数据同步的问题。详情参考文档：[1.1 新增节点地理标签](../5-enhance/5-2-ha-mgr-zoneid.md)。|


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
