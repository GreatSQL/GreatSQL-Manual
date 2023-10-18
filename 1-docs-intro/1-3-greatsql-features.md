# 版本特性
---
GreatSQL是适用于金融级应用的国内自主开源数据库，具备高性能、高可靠、高易用性、高安全等多个核心特性，可以作为MySQL或Percona Server的可选替换，用于线上生产环境，且完全免费并兼容MySQL或Percona Server。

GreatSQL具备**高性能**、**高可靠**、**高易用性**、**高安全**等多个核心特性。

**1. 高性能**
- 支持InnoDB并行查询，适用于轻量级OLAP应用场景，在TPC-H测试中平均提升15倍，最高提升40+倍。
- 优化InnoDB事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP场景整体性能提升约20%。
- 支持并行load data，适用于频繁导入大批量数据的应用场景，性能可提升约20+倍。
- 支持线程池（thread pool），降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。

**2. 高可靠**
GreatSQL针对MGR进行了大量改进和提升工作，进一步提升MGR的高可靠等级。

- 地理标签，提升多机房架构数据可靠性。
- 读写节点动态VIP，高可用切换更便捷。
- 仲裁节点，用更低的服务器成本实现更高可用。
- 快速单主模式，在单主模式下更快，性能更高。
- 智能选主，高可用切换选主机制更合理。
- 全新流控算法，使得事务更平稳，避免剧烈抖动。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 解决磁盘空间爆满时导致MGR集群阻塞的问题。
- 解决了长事务造成无法选主的问题。
- 优化事务认证队列清理算法，规避每60s抖动问题。
- 修复了recover过程中长时间等待的问题。

**3. 高易用性**
支持多个SQL兼容特性，包括CLOB、VARCHAR2数据类型，DATETIME运算、ROWNUM、子查询无别名、EXPLAIN PLAN FOR等语法，以及ADD_MONTHS()、CAST()、DECODE()等17个函数。

更多信息详见文档：[GreatSQL中的SQL兼容性](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/sql-compat.md)。

**4. 高安全性**
支持逻辑备份加密、CLONE备份加密、审计日志入表、表空间国密加密等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

更多信息详见文档：[GreatSQL中的安全性提升](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/changes-greatsql-8-0-32-24-20230605.md#14-%E5%AE%89%E5%85%A8)

下面是GreatSQL 和 MySQL社区版本的对比表格：

| 特性 | GreatSQL 8.0.32-24 | MySQL 8.0.32 |
| --- | --- | --- |
| 开源 | ✅| ✅|
|ACID完整性|✅|✅|
|MVCC特性|✅    |✅|
|支持行锁|✅|✅|
|Crash自动修复|✅|✅|
|表分区(Partitioning)|✅|✅|
|视图(Views)    |✅|✅|
|子查询(Subqueries)|✅|✅|
|触发器(Triggers)|✅|✅|
|存储过程(Stored Procedures)|✅|✅|
|外键(Foreign Keys)|✅|✅|
|窗口函数(Window Functions)|✅|✅|
|通用表表达式CTE|✅|✅|
|地理信息(GIS)|✅|✅|
|基于GTID的复制|✅|✅|
|组复制(MGR)|✅|✅|
|MyRocks引擎|✅|❎|
|SQL兼容扩展|1.数据类型扩展<br/>2.SQL语法扩展<br/>共超过20个扩展新特性| ❎ |
|MGR提升|1.地理标签<br/>2.仲裁节点<br/>3.读写节点绑定VIP<br/>4.快速单主模式<br/>5.智能选主机制<br/>6.全新流控算法|❎|
|性能提升|1.InnoDB并行查询<br/>2.并行load data<br/>3.InnoDB事务readview无锁优化<br/>4.InnoDB事务大锁拆分优化|❎|
|安全提升|1.国密支持<br/>2.备份加密<br/>3.审计日志入库|❎|

此外，GreatSQL 8.0.32-24基于Percona Server for MySQL 8.0.32-24版本，它在MySQL 8.0.32基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature_comparison.html#percona-server-for-mysql-feature-comparison)，这其中包括线程池、审计、数据脱敏等MySQL企业版才有的特性，以及PFS提升、IFS提升、性能和可扩展性提升、用户统计增强、processlist增强、slow log增强等大量改进和提升，这里不一一重复列出。

GreatSQL同时也是gitee（码云）平台上的GVP项目，详见：[https://gitee.com/gvp/database-related](https://gitee.com/gvp/database-related) **数据库相关**类目。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
