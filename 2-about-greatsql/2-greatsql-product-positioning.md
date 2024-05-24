# 产品定位
---

GreatSQL数据库是一款**开源免费**数据库，可在普通硬件上满足金融级应用场景，具有**高可用**、**高性能**、**高兼容**、**高安全**等特性，可作为MySQL或Percona Server for MySQL的理想可选替换。

## 核心特性

### [高可用](../5-enhance/5-2-ha.md)
针对MGR进行了大量改进和提升工作，新增支持**地理标签**、**仲裁节点**、**读写节点可绑定动态IP**、**快速单主模式**、**智能选主**，并针对**流控算法**、**事务认证队列清理算法**、**节点加入&退出机制**、**recovery机制**等多项MGR底层工作机制算法进行深度优化，进一步提升优化了MGR的高可用保障及性能稳定性。

- 支持 [地理标签](../5-enhance/5-2-ha-mgr-zoneid.md) 特性，提升多机房架构数据可靠性。
- 支持 [仲裁节点](../5-enhance/5-2-ha-mgr-arbitrator.md) 特性，用更低的服务器成本实现更高可用。
- 支持 [读写节点动态VIP](../5-enhance/5-2-ha-mgr-vip.md) 特性，高可用切换更便捷。
- 支持 [快速单主模式](../5-enhance/5-2-ha-mgr-fast-mode.md)，在单主模式下更快，性能更高。
- 支持 [智能选主](../5-enhance/5-2-ha-mgr-election-mode.md) 特性，高可用切换选主机制更合理。
- 采用 [全新流控算法](../5-enhance/5-2-ha-mgr-new-fc.md)，使得事务更平稳，避免剧烈抖动。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 优化事务认证队列清理算法，高负载下不复存在每60秒性能抖动问题。
- 解决了个别节点上磁盘空间爆满时导致MGR集群整体被阻塞的问题。
- 解决了长事务造成无法选主的问题。
- 修复了recovery过程中长时间等待的问题。

更多信息详见文档：[高可用](../5-enhance/5-2-ha.md)。

### [高性能](../5-enhance/5-1-highperf.md)
相对MySQL及Percona Server For MySQL的性能表现更稳定优异，支持**高性能的内存查询加速 Rapid 引擎**、**InnoDB并行查询**、**并行LOAD DATA**、**事务无锁化**、**线程池等**特性，在TPC-C测试中相对MySQL性能提升超过30%，在TPC-H测试中的性能表现是MySQL的十几倍甚至上百倍。

- 支持类似MySQL HeatWave的 [大规模并行、高性能的内存查询加速 Rapid 引擎](../5-enhance/5-1-highperf-rapid-engine.md)，可将GreatSQL的数据分析性能提升几个数量级。
- 支持 [InnoDB并行查询](../5-enhance/5-1-highperf-innodb-pq.md)，适用于轻量级OLAP应用场景，在TPC-H测试中平均提升15倍，最高提升40+倍。
- 优化InnoDB事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP场景整体性能提升约20%。
- 支持 [并行LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)，适用于频繁导入大批量数据的应用场景，性能可提升约20+倍。
- 支持 [异步删除大表](../5-enhance/5-1-highperf-async-purge-big-table.md)，提高InnoDB引擎运行时性能的稳定性。
- 支持 [线程池(Threadpool)](../5-enhance/5-1-highperf-thread-pool.md)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。

更多信息详见文档：[高性能](../5-enhance/5-1-highperf.md)。

### [高兼容](../5-enhance/5-3-easyuse.md)

支持大多数常见Oracle用法，包括 [数据类型兼容、函数兼容、SQL语法、存储程序兼容](../5-enhance/5-3-easyuse.md) 等众多兼容扩展用法。

更多信息详见文档：[高兼容](../5-enhance/5-3-easyuse.md)。

### [高安全](../5-enhance/5-4-security.md)

支持 [逻辑备份加密](../5-enhance/5-4-security-mysqldump-encrypt.md)、[CLONE备份加密](../5-enhance/5-4-security-clone-encrypt.md)、[审计](../5-enhance/5-4-security-audit.md)、[表空间国密加密](../5-enhance/5-4-security-innodb-tablespace-encrypt.md)、[数据脱敏](../5-enhance/5-4-security-data-masking.md) 等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

更多信息详见文档：[高安全](../5-enhance/5-4-security.md)。



GreatSQL采用GPLv2协议。

GreatSQL的代码托管在[gitee](https://gitee.com/GreatSQL/GreatSQL)，同时在[github](https://github.com/GreatSQL/GreatSQL)保留镜像备份。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
