# 优势特性

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

## 核心特性

### [高可用](../5-enhance/5-2-ha.md)

针对 MGR 进行了大量改进和提升工作，支持 地理标签、仲裁节点、读写动态 VIP、快速单主模式、智能选主 等特性，并针对 流控算法、事务认证队列清理算法、节点加入&退出机制、recovery机制 等多个 MGR 底层工作机制算法进行深度优化，进一步提升优化了 MGR 的高可用保障及性能稳定性。

- 支持 [地理标签](../5-enhance/5-2-ha-mgr-zoneid.md) 特性，提升多机房架构数据可靠性。
- 支持 [仲裁节点](../5-enhance/5-2-ha-mgr-arbitrator.md) 特性，用更低的服务器成本实现更高可用。
- 支持 [读写动态 VIP](../5-enhance/5-2-ha-mgr-vip.md) 特性，高可用切换更便捷，更快实现读负载均衡。支持 [当主节点切换时，主动关闭当前活跃连接](../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md)，缩短应用端不可用时长。
- 支持 [快速单主模式](../5-enhance/5-2-ha-mgr-fast-mode.md)，在单主模式下更快，性能更高。
- 支持 [智能选主](../5-enhance/5-2-ha-mgr-election-mode.md) 特性，高可用切换选主机制更合理。
- 优化 [流控算法](../5-enhance/5-2-ha-mgr-new-fc.md)，使得事务更平稳，避免剧烈抖动。
- 支持 [记录 MGR 网络通信开销超过阈值的事件](../5-enhance/5-2-ha-mgr-request-time.md)，用于进一步分析和优化。
- 支持在跨机房容灾场景中的 [主主双向复制防止回路](../5-enhance/5-2-ha-repl-server-mode.md) 机制。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 解决了个别节点上磁盘空间爆满时导致MGR集群整体被阻塞的问题。
- 优化事务认证队列清理算法，高负载下不复存在每 60 秒性能抖动问题。
- 解决了长事务造成无法选主的问题。
- 修复了 recovery 过程中长时间等待的问题。

更多信息详见文档：[高可用](../5-enhance/5-2-ha.md)。

### [高性能](../5-enhance/5-1-highperf.md)

相对 MySQL 及 Percona Server For MySQL 的性能表现更稳定优异，支持 Rapid 引擎、事务无锁化、并行 LOAD DATA、异步删除大表、线程池、非阻塞式 DDL、NUMA 亲和调度优化 等特性，在 TPC-C 测试中相对 MySQL 性能提升超过 30%，在 TPC-H 测试中的性能表现是 MySQL 的十几倍甚至上百倍。

- 支持 [大规模并行、基于内存查询、高压缩比的高性能 Rapid 引擎](../5-enhance/5-1-highperf-rapid-engine.md)，可将数据分析性能提升几个数量级。
- 优化 InnoDB 事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP 场景整体性能提升约 20%。
- 支持 [并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)，适用于频繁导入大批量数据的应用场景，性能可提升约 20 多倍；对于无显式定义主键的场景亦有优化提升。
- 支持 [异步删除大表](../5-enhance/5-1-highperf-async-purge-big-table.md)，提高 InnoDB 引擎运行时性能的稳定性。
- 支持 [线程池](../5-enhance/5-1-highperf-thread-pool.md)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。
- 支持 [非阻塞式 DDL](../5-enhance/5-1-highperf-nonblocking-ddl.md)，可以避免数据库因为必须尽快完成 DDL 操作而导致业务请求大量被阻塞的问题。
- 支持 [NUMA 亲和性优化](../5-enhance/5-1-highperf-numa-affinity.md)，通过 NUMA 亲和性调度优化，将前端用户线程和后台线程绑定到固定 NUMA 节点上以提升线程处理性能。

更多信息详见文档：[高性能](../5-enhance/5-1-highperf.md)。

### [高兼容](../5-enhance/5-3-easyuse.md)

GreatSQL 实现 100% 完全兼容 MySQL 及 Percona Server For MySQL 用法，支持大多数常见 Oracle 用法，包括 [数据类型兼容](../5-enhance/5-3-easyuse.md#数据类型兼容)、[函数兼容](../5-enhance/5-3-easyuse.md#函数兼容)、[SQL 语法兼容](../5-enhance/5-3-easyuse.md#sql语法兼容)、[存储程序兼容](../5-enhance/5-3-easyuse.md#存储程序兼容) 等众多兼容扩展用法。

更多信息详见文档：[高兼容](../5-enhance/5-3-easyuse.md)。

### [高安全](../5-enhance/5-4-security.md)

GreatSQL 支持逻辑备份加密、CLONE 备份加密、审计、表空间国密加密、敏感数据脱敏等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

- 支持 [mysqldump 逻辑备份加密](../5-enhance/5-4-security-mysqldump-encrypt.md)，提供了利用 mysqldump 逻辑备份的安全加密需求。
- 支持 [Clone 备份加密](../5-enhance/5-4-security-clone-encrypt.md)，提供了利用 Clone 物理备份的安全加密需求。
- 支持 [审计功能](../5-enhance/5-4-security-audit.md)，及时记录和发现未授权或不安全行为。
- 支持 [InnoDB 表空间国密加密算法](../5-enhance/5-4-security-innodb-tablespace-encrypt.md)，确保重要数据的加密安全。
- 支持 [基于函数和策略的两种数据脱敏](../5-enhance/5-4-security-data-masking.md) 工作方式，保障敏感用户数据查询结果保密性。
- 支持 [记录指定用户的最后一次登入时间](../5-enhance/5-4-security-last-login.md)，便于管理员查询，进一步提升数据库安全性。

通过上述多个安全提升特性，进一步保障业务数据安全。更多信息详见文档：[高安全](../5-enhance/5-4-security.md)。

### [其他](../5-enhance/5-5-others.md)
- 支持 [Clone 在线全量热备、增备及恢复](../5-enhance/5-5-clone-compressed-and-incrment-backup.md)，结合 Binlog 可实现恢复到指定时间点。此外，Clone 备份还支持压缩功能。

## GreatSQL VS MySQL

| **1.主要特性** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| 开源 |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID 完整性| :heavy_check_mark: | :heavy_check_mark: |
|MVCC 特性| :heavy_check_mark:     | :heavy_check_mark: |
|支持行锁| :heavy_check_mark: | :heavy_check_mark: |
|Crash 自动修复| :heavy_check_mark: | :heavy_check_mark: |
|表分区（Partitioning）| :heavy_check_mark: | :heavy_check_mark: |
|视图（Views）| :heavy_check_mark: | :heavy_check_mark: |
|子查询（Subqueries）| :heavy_check_mark: | :heavy_check_mark: |
|触发器（Triggers）| :heavy_check_mark: | :heavy_check_mark: |
|存储程序（Stored Programs）| :heavy_check_mark: | :heavy_check_mark: |
|外键（Foreign Keys）| :heavy_check_mark: | :heavy_check_mark: |
|窗口函数（Window Functions）| :heavy_check_mark: | :heavy_check_mark: |
|通用表表达式 CTE| :heavy_check_mark: | :heavy_check_mark: |
|地理信息（GIS）| :heavy_check_mark: | :heavy_check_mark: |
|基于 GTID 的复制| :heavy_check_mark: | :heavy_check_mark: |
|组复制（MGR）| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks 引擎| :heavy_check_mark: | |
| **2. 性能提升扩展** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|AP 引擎| :heavy_check_mark: | 仅云上HeatWave |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入提速 | :heavy_check_mark: | ❌ |
|InnoDB 并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行 LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB 事务 ReadView 无锁优化| :heavy_check_mark: | ❌ |
|InnoDB 事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB 资源组| :heavy_check_mark: | :heavy_check_mark: |
|自定义 InnoDB 页大小| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes 拆分优化| :heavy_check_mark: | ❌ |
|MEMORY 引擎优化| :heavy_check_mark: | ❌ |
|InnoDB Flushing 优化| :heavy_check_mark: | ❌ |
|并行 Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 快速索引创建优化| :heavy_check_mark: | ❌ |
|VARCHAR/BLOB/JSON 类型存储单列压缩| :heavy_check_mark: | ❌ |
|数据字典中存储单列压缩信息| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|MGR 提升-地理标签| :heavy_check_mark: | ❌ |
|MGR 提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR 提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR 提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR 提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR 提升-全新流控算法| :heavy_check_mark: | ❌ |
|MGR 提升-自动选择 Donor 节点| :heavy_check_mark: | ❌ |
|Clone 全备 & 增备| :heavy_check_mark: | ❌ |
|Clone 备份压缩| :heavy_check_mark: | ❌ |
|information_schema 表数量|95|65|
|全局性能和状态指标|853|434|
|优化器直方图（Histograms）| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table 性能指标| :heavy_check_mark: | ❌ |
|Per-Index 性能指标| :heavy_check_mark: | ❌ |
|Per-User 性能指标| :heavy_check_mark: | ❌ |
|Per-Client 性能指标| :heavy_check_mark: | ❌ |
|Per-Thread 性能指标| :heavy_check_mark: | ❌ |
|全局查询相应耗时统计| :heavy_check_mark: | ❌ |
|SHOW INNODB ENGINE STATUS 增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log 信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计| :heavy_check_mark: | 仅企业版 |
|数据脱敏| :heavy_check_mark: | ❌ |
|最后登录记录| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2 密码Hashing| :heavy_check_mark: | :heavy_check_mark: |
|密码轮换策略| :heavy_check_mark: | :heavy_check_mark: |
|PAM 认证插件| :heavy_check_mark: | 仅企业版 |
|Keyring 存储在文件中| :heavy_check_mark: | :heavy_check_mark: |
|Keyring 存储在Hashicorp Vault中| :heavy_check_mark: | 仅企业版 |
|InnoDB 数据加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 日志加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 各种表空间文件加密| :heavy_check_mark: | :heavy_check_mark: |
|二进制日志加密| :heavy_check_mark: | ❌ |
|临时文件加密| :heavy_check_mark: | ❌ |
|强制加密| :heavy_check_mark: | ❌ |
| **6. 运维便利性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|DDL 原子性| :heavy_check_mark: | :heavy_check_mark: |
|数据字典存储 InnoDB 表| :heavy_check_mark: | :heavy_check_mark: |
|快速 DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|不可见索引| :heavy_check_mark: | :heavy_check_mark: |
|线程池（Threadpool）| :heavy_check_mark: | 仅企业版 |
|备份锁| :heavy_check_mark: | ❌ |
|SHOW GRANTS 扩展| :heavy_check_mark: | ❌ |
|表损坏动作扩展| :heavy_check_mark: | ❌ |
|杀掉不活跃事务| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT 扩展| :heavy_check_mark: | ❌ |

GreatSQL 8.0.32-26 基于 Percona Server for MySQL 8.0.32 版本，它在 MySQL 8.0.32 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等 MySQL 企业版才有的特性，以及 performance_schema 提升、information_schema 提升、性能和可扩展性提升、用户统计增强、PROCESSLIST 增强、Slow Log 增强等大量改进和提升，这里不一一重复列出。

GreatSQL同时也是gitee（码云）平台上的GVP项目，详见：[https://gitee.com/gvp/database-related](https://gitee.com/gvp/database-related) **数据库相关**类目。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
