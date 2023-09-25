# GreatSQL简介
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

**3. 高易用性** 支持多个SQL兼容特性，包括CLOB、VARCHAR2数据类型，DATETIME运算、ROWNUM、子查询无别名、EXPLAIN PLAN FOR等语法，以及ADD_MONTHS()、CAST()、DECODE()等17个函数。

更多信息详见文档：[GreatSQL中的SQL兼容性](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/sql-compat.md)。

**4. 高安全性**
支持逻辑备份加密、CLONE备份加密、审计日志入表、表空间国密加密等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

更多信息详见文档：[GreatSQL中的安全性提升](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/changes-greatsql-8-0-32-24-20230605.md#14-%E5%AE%89%E5%85%A8)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
