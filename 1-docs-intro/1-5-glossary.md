# 术语表
---

| 术语 | 解释 |
| :---------------------------------------- | --- |
| arbitrator | 仲裁节点/投标节点。GreatSQL 8.0.25-16 版本中新增角色类型。该节点不存储用户数据，没有 binlog，也不需要回放 relay log，只参与 MGR 状态投票/仲裁。详情参考文档：[1.1 新增仲裁节点（投票节点）角色](../5-enhance/5-2-ha-mgr-arbitrator.md)。|
| audit | GreatSQL 支持开启审计功能，并且还支持将审计日志写入数据库中，方便管理员查询。详情参考文档：[审计日志入表](../5-enhance/5-4-security-audit.md)。 |
| consensus | 共识。在 MGR 中，一个事务发起后，要广播到各个节点，当多数派节点达成共识后，这个事务才可以被提交。所谓的多数派就是超过半数的节点达成一致，例如总共3个节点，则至少2个节点达成一致。|
| donor | 新节点加入 MGR 时，为新节点提供数据传输的节点称为 donor。|
| election mode | 选主策略。设置选项 `group_replication_primary_election_mode` 选择不同的选主策略。详情参考文档：[1.4 自定义选主模式](../5-enhance/5-2-ha-mgr-election-mode.md)。|
| encryption | GreatSQL 支持 mysqldump 备份加密、CLONE 备份加密，以及 InnoDB 表空间国密加密等功能。详情参考文档：[高安全](../1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605.md#14-%E5%AE%89%E5%85%A8)。|
| fast mode | 快速单主模式。在该模式下可以降低 MGR 事务代价，提升事务性能。详情参考文档：[1.2 新增快速单主模式](../5-enhance/5-2-ha-mgr-fast-mode.md)。|
| GCS | Group Communication System，组通信系统，MGR 底层通信系统。|
| joiner | MGR 中新加入的节点，称之为 joiner。|
| MariaDB | 在本用户手册中均指 [MariaDB Server](https://mariadb.com/kb/en/documentation/)，由 MySQL 创始人 Monty 创建的 MySQL 可选替代数据库产品。|
| member | MGR 成员，也称为节点。|
| MGR/<br/>GR/<br/>Group Replication | MySQL Group Replication，MySQL 组复制的简称。MySQL 推出的一种不同于主从复制、半同步复制的全新复制机制。|
| Oracle Compat | GreatSQL 中支持多个 Oracle 兼容特性，包括数据类型、函数、SQL 语法、存储过程等。详情参考文档：[高兼容](../5-enhance/5-3-easyuse.md)。|
| Percona | 在本用户手册中均指 Percona Server For MySQL，即通常所说的 [Percona 分支](https://docs.percona.com/percona-server/)，业界著名的 MySQL 分支。 |
| PQ | parallel query（并行查询）的缩写。GreatSQL 合并了华为鲲鹏计算团队贡献的代码，实现了 InnoDB 并行查询特性。详情参考文档：[InnoDB并行查询优化参考](../5-enhance/5-1-highperf-innodb-pq.md)。|
| Primary | 称为主要节点，主节点，MGR 节点角色之一。响应读写事务请求。|
| Secondary | 称为辅助节点，从节点，MGR 节点角色之一。只能响应只读事务请求。|
| VIP | GreatSQL中支持读写节点绑定动态 VIP（虚拟 IP），高可用切换更便捷。详情参考文档：[MGR内置动态VIP](../5-enhance/5-2-ha-mgr-vip.md)。|
| Xcom | Paxos 算法在 MGR 中的具体实现，称之为 XCom，由它充当 MGR 的通信引擎。|
| zone id | 地理标签。可以对每个节点设置地理标签，主要用于解决多机房数据同步的问题。详情参考文档：[1.1 新增节点地理标签](../5-enhance/5-2-ha-mgr-zoneid.md)。|


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
