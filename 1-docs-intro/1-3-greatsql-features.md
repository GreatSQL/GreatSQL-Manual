# 版本特性
---

GreatSQL数据库是一款**开源免费**数据库，可在普通硬件上满足金融级应用场景，具有**高可用**、**高性能**、**高兼容**、**高安全**等特性，可作为MySQL或Percona Server for MySQL的理想可选替换。

## 核心特性

### 1. 高可用

针对MGR进行了大量改进和提升工作，新增支持**地理标签**、**仲裁节点**、**读写节点可绑定动态IP**、**快速单主模式**、**智能选主**，并针对**流控算法**、**事务认证队列清理算法**、**节点加入&退出机制**、**recovery机制**等多项MGR底层工作机制算法进行深度优化，进一步提升优化了MGR的高可用保障及性能稳定性。

- 支持地理标签特性，提升多机房架构数据可靠性。
- 支持仲裁节点特性，用更低的服务器成本实现更高可用。
- 支持读写节点动态VIP特性，高可用切换更便捷。
- 支持快速单主模式，在单主模式下更快，性能更高。
- 支持智能选主特性，高可用切换选主机制更合理。
- 采用全新流控算法，使得事务更平稳，避免剧烈抖动。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 优化事务认证队列清理算法，高负载下不不复存在每60秒性能抖动问题。
- 解决了个别节点上磁盘空间爆满时导致MGR集群整体被阻塞的问题。
- 解决了长事务造成无法选主的问题。
- 修复了recovery过程中长时间等待的问题。

更多信息详见文档：[高可用](/5-enhance/5-2-ha.md)。

### 2. 高性能
相对MySQL及Percona Server For MySQL的性能表现更稳定优异，支持**高性能的内存查询加速AP引擎**、**InnoDB并行查询**、**并行LOAD DATA**、**事务无锁化**、**线程池等**特性，在TPC-C测试中相对MySQL性能提升超过30%，在TPC-H测试中的性能表现是MySQL的十几倍甚至上百倍。

- 支持类似MySQL HeatWave的大规模并行、高性能的内存查询加速AP引擎，可将GreatSQL的数据分析性能提升几个数量级。
- 支持InnoDB并行查询，适用于轻量级OLAP应用场景，在TPC-H测试中平均提升15倍，最高提升40+倍。
- 优化InnoDB事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP场景整体性能提升约20%。
- 支持并行LOAD DATA，适用于频繁导入大批量数据的应用场景，性能可提升约20+倍。
- 支持线程池(Threadpool)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。

更多信息详见文档：[高性能](/5-enhance/5-1-highperf.md)。

### 3. 高兼容

支持大多数常见Oracle用法，包括数据类型、函数、SQL语法、存储程序等兼容性用法。

更多信息详见文档：[Oracle兼容](/5-enhance/5-3-easyuse.md)。

### 4. 高安全

支持逻辑备份加密、CLONE备份加密、审计日志入表、表空间国密加密、记录最后一次登录信息等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

更多信息详见文档：[高安全性](/5-enhance/5-4-security.md)。

下面是GreatSQL 和 MySQL社区版本的对比表格：

| **1.主要特性** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| 开源 |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID完整性| :heavy_check_mark: | :heavy_check_mark: |
|MVCC特性| :heavy_check_mark:     | :heavy_check_mark: |
|支持行锁| :heavy_check_mark: | :heavy_check_mark: |
|Crash自动修复| :heavy_check_mark: | :heavy_check_mark: |
|表分区(Partitioning)| :heavy_check_mark: | :heavy_check_mark: |
|视图(Views)| :heavy_check_mark: | :heavy_check_mark: |
|子查询(Subqueries)| :heavy_check_mark: | :heavy_check_mark: |
|触发器(Triggers)| :heavy_check_mark: | :heavy_check_mark: |
|存储程序(Stored Programs)| :heavy_check_mark: | :heavy_check_mark: |
|外键(Foreign Keys)| :heavy_check_mark: | :heavy_check_mark: |
|窗口函数(Window Functions)| :heavy_check_mark: | :heavy_check_mark: |
|通用表表达式CTE| :heavy_check_mark: | :heavy_check_mark: |
|地理信息(GIS)| :heavy_check_mark: | :heavy_check_mark: |
|基于GTID的复制| :heavy_check_mark: | :heavy_check_mark: |
|组复制(MGR)| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks引擎| :heavy_check_mark: | |
| **2. 性能提升扩展** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|AP引擎| :heavy_check_mark: | 仅云上HeatWave |
|InnODB并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB事务ReadView无锁优化| :heavy_check_mark: | ❌ |
|InnoDB事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB资源组| :heavy_check_mark: | :heavy_check_mark: |
|自定义InnoDB页大小| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes拆分优化| :heavy_check_mark: | ❌ |
|MEMORY引擎优化| :heavy_check_mark: | ❌ |
|InnoDB Flushing优化| :heavy_check_mark: | ❌ |
|并行Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB快速索引创建优化| :heavy_check_mark: | ❌ |
|VARCHAR/BLOB/JSON类型存储单列压缩| :heavy_check_mark: | ❌ |
|数据字典中存储单列压缩信息| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB全文搜索改进| :heavy_check_mark: | ❌ |
|更多Hash/Digest函数| :heavy_check_mark: | ❌ |
|Oracle兼容性-数据类型| :heavy_check_mark: | ❌ |
|Oracle兼容性-函数| :heavy_check_mark: | ❌ |
|Oracle兼容性-SQL语法| :heavy_check_mark: | ❌ |
|Oracle兼容性-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|MGR提升-地理标签| :heavy_check_mark: | ❌ |
|MGR提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR提升-全新流控算法| :heavy_check_mark: | ❌ |
|information_schema表数量|95|65|
|全局性能和状态指标|853|434|
|优化器直方图(Histograms)| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table性能指标| :heavy_check_mark: | ❌ |
|Per-Index性能指标| :heavy_check_mark: | ❌ |
|Per-User性能指标| :heavy_check_mark: | ❌ |
|Per-Client性能指标| :heavy_check_mark: | ❌ |
|Per-Thread性能指标| :heavy_check_mark: | ❌ |
|全局查询相应耗时统计| :heavy_check_mark: | ❌ |
|SHOW INNODB ENGINE STATUS增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log信息增强| :heavy_check_mark: | ❌ |
| ** 5.安全性提升** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计日志入库| :heavy_check_mark: | ❌ |
|记录最后一次登录信息| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2密码Hashing| :heavy_check_mark: | :heavy_check_mark: |
|密码轮换策略| :heavy_check_mark: | :heavy_check_mark: |
|PAM认证插件| :heavy_check_mark: | 仅企业版 |
|审计插件| :heavy_check_mark: | 仅企业版 |
|Keyring存储在文件中| :heavy_check_mark: | :heavy_check_mark: |
|Keyring存储在Hashicorp Vault中| :heavy_check_mark: | 仅企业版 |
|InnoDB数据加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB日志加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB各种表空间文件加密| :heavy_check_mark: | :heavy_check_mark: |
|二进制日志加密| :heavy_check_mark: | ❌ |
|临时文件加密| :heavy_check_mark: | ❌ |
|强制加密| :heavy_check_mark: | ❌ |
| **6. 运维便利性提升** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|DDL原子性| :heavy_check_mark: | :heavy_check_mark: |
|数据字典存储InnoDB表| :heavy_check_mark: | :heavy_check_mark: |
|快速DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|不可见索引| :heavy_check_mark: | :heavy_check_mark: |
|线程池(Threadpool)| :heavy_check_mark: | 仅企业版 |
|备份锁| :heavy_check_mark: | ❌ |
|SHOW GRANTS扩展| :heavy_check_mark: | ❌ |
|表损坏动作扩展| :heavy_check_mark: | ❌ |
|杀掉不活跃事务| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT扩展| :heavy_check_mark: | ❌ |


此外，GreatSQL 8.0.32-25基于Percona Server for MySQL 8.0.32版本，它在MySQL 8.0.32基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等MySQL企业版才有的特性，以及performance_schema提升、information_schema提升、性能和可扩展性提升、用户统计增强、PROCESSLIST增强、Slow log增强等大量改进和提升，这里不一一重复列出。

GreatSQL同时也是gitee（码云）平台上的GVP项目，详见：[https://gitee.com/gvp/database-related](https://gitee.com/gvp/database-related) **数据库相关**类目。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
