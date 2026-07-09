# 优势特性

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

## 核心特性

### [高可用](../5-enhance/5-2-ha.md)

针对 MGR 进行了大量改进和提升工作，支持 地理标签、仲裁节点、读写动态 VIP、快速单主模式、智能选主 等特性，并针对 流控算法、事务认证队列清理算法、节点加入&退出机制、recovery 机制 等多个 MGR 底层工作机制算法进行深度优化，进一步提升优化了 MGR 的高可用保障及性能稳定性。

- 支持 [地理标签](../5-enhance/5-2-ha-mgr-zoneid.md) 特性，提升多机房架构数据可靠性。
- 支持 [仲裁节点](../5-enhance/5-2-ha-mgr-arbitrator.md) 特性，用更低的服务器成本实现更高可用。
- 支持 [读写动态 VIP](../5-enhance/5-2-ha-mgr-vip.md) 特性，高可用切换更便捷，更快实现读负载均衡。支持 [当主节点切换时，主动关闭当前活跃连接](../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md)，缩短应用端不可用时长。
- 支持 [快速单主模式](../5-enhance/5-2-ha-mgr-fast-mode.md)，在单主模式下更快，性能更高。
- 支持 [智能选主](../5-enhance/5-2-ha-mgr-election-mode.md) 特性，高可用切换选主机制更合理。
- 优化 [流控算法](../5-enhance/5-2-ha-mgr-new-fc.md)，使得事务更平稳，避免剧烈抖动。
- 支持 [记录 MGR 网络通信开销超过阈值的事件](../5-enhance/5-2-ha-mgr-request-time.md)，用于进一步分析和优化。
- 支持在跨机房容灾场景中的 [主主双向复制防止回路](../5-enhance/5-2-ha-repl-server-mode.md) 机制。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 解决了个别节点上磁盘空间爆满时导致 MGR 集群整体被阻塞的问题。
- 优化事务认证队列清理算法，高负载下不复存在每 60 秒性能抖动问题。
- 解决了长事务造成无法选主的问题。
- 修复了 recovery 过程中长时间等待的问题。

更多信息详见文档：[高可用](../5-enhance/5-2-ha.md)。

### [高性能](../5-enhance/5-1-highperf.md)

相对 MySQL 及 Percona Server for MySQL 的性能表现更稳定优异，支持 Rapid 引擎、事务无锁化、并行 LOAD DATA、异步删除大表、线程池、非阻塞式 DDL、NUMA 亲和调度优化 等特性，在 TPC-C 测试中相对 MySQL 性能提升超过 30%，在 TPC-H 测试中的性能表现是 MySQL 的十几倍甚至上百倍。

- 支持 [大规模并行、基于内存查询、高压缩比的高性能 Rapid 引擎](../5-enhance/5-1-highperf-rapid-engine.md)，可将数据分析性能提升几个数量级。
- 优化 InnoDB 事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP 场景整体性能提升约 20%。
- 支持 [并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)，适用于频繁导入大批量数据的应用场景，性能可提升约 20 多倍；对于无显式定义主键的场景亦有优化提升。
- 支持 [异步删除大表](../5-enhance/5-1-highperf-async-purge-big-table.md)，提高 InnoDB 引擎运行时性能的稳定性。
- 支持 [线程池](../5-enhance/5-1-highperf-thread-pool.md)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。
- 支持 [非阻塞式 DDL](../5-enhance/5-1-highperf-nonblocking-ddl.md)，可以避免数据库因为必须尽快完成 DDL 操作而导致业务请求大量被阻塞的问题。
- 支持 [NUMA 亲和性优化](../5-enhance/5-1-highperf-numa-affinity.md)，通过 NUMA 亲和性调度优化，将前端用户线程和后台线程绑定到固定 NUMA 节点上以提升线程处理性能。

更多信息详见文档：[高性能](../5-enhance/5-1-highperf.md)。

### [高兼容](../5-enhance/5-3-easyuse.md)

GreatSQL 实现 100% 完全兼容 MySQL 及 Percona Server for MySQL 用法，支持大多数常见 Oracle 用法，包括 [数据类型兼容](../5-enhance/5-3-easyuse.md#数据类型兼容)、[函数兼容](../5-enhance/5-3-easyuse.md#函数兼容)、[SQL 语法兼容](../5-enhance/5-3-easyuse.md#sql语法兼容)、[存储程序兼容](../5-enhance/5-3-easyuse.md#存储程序兼容) 等众多兼容扩展用法。

更多信息详见文档：[高兼容](../5-enhance/5-3-easyuse.md)。

### [高安全](../5-enhance/5-4-security.md)

GreatSQL 支持逻辑备份加密、CLONE 备份加密、审计、表空间国密加密、敏感数据脱敏等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

- 支持 [mysqldump 逻辑备份加密](../5-enhance/5-4-security-mysqldump-encrypt.md)，提供了利用 mysqldump 逻辑备份的安全加密需求。
- 支持 [Clone 备份加密](../5-enhance/5-4-security-clone-encrypt.md)，提供了利用 Clone 物理备份的安全加密需求。
- 支持 [审计功能](../5-enhance/5-4-security-audit.md)，及时记录和发现未授权或不安全行为。
- 支持 [InnoDB 表空间国密加密算法](../5-enhance/5-4-security-encrypt-with-gmssl.md)，确保重要数据的加密安全。
- 支持 [基于函数和策略的两种数据脱敏](../5-enhance/5-4-security-data-masking.md) 工作方式，保障敏感用户数据查询结果保密性。

通过上述多个安全提升特性，进一步保障业务数据安全。更多信息详见文档：[高安全](../5-enhance/5-4-security.md)。

### [其他](../5-enhance/5-5-others.md)
- 支持 [Clone 在线全量热备、增备及恢复](../5-enhance/5-5-clone-compressed-and-incrment-backup.md)，结合 Binlog 可实现恢复到指定时间点。此外，Clone 备份还支持压缩功能。

更多关于 GreatSQL 的优势特性详见：[GreatSQL vs MySQL](./relnotes/changes-greatsql-8445.md#greatsql-vs-mysql)。 

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
