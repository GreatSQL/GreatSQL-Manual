# GreatSQL高性能
---

GreatSQL高性能方面的主要提升有以下几点：

1. 支持类似MySQL HeatWave的大规模并行、高性能的内存查询加速AP引擎，可将GreatSQL的数据分析性能提升几个数量级。在32C64G测试机环境下，TPC-H 100G测试中22条SQL总耗时仅需不到80秒。更详细内容参考：[Rapid引擎](./5-1-highperf-rapid-engine.md)。

2. 支持InnoDB并行查询，适用于轻量级OLAP应用场景，在TPC-H测试中平均提升15倍，最高提升40+倍。更详细内容参考：[InnoDB并行查询](./5-1-highperf-innodb-pq.md)。

3. 优化InnoDB事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP场景整体性能提升约20%。

在MySQL社区版本实现中，使用了红黑树结构实现了事务ID到事务对象的快速映射关系。但是该数据结构在高并发应用场景中，大量的锁竞争会造成事务处理的瓶颈。

在GreatSQL中采用全新的无锁哈希结构，显著减少了锁的临界区消耗，提升事务处理的能力至少10%以上。
![输入图片说明](./5-1-highperf-01.jpg)

4. 支持并行`LOAD DATA`，适用于频繁导入大批量数据的应用场景，性能可提升约20+倍。更详细内容参考：[并行load data](./5-1-highperf-parallel-load.md)。

5. 支持异步删除InnoDB大表，提高InnoDB引擎运行时性能的稳定性。更详细内容参考：[异步删除InnoDB大表](./5-1-highperf-async-purge-big-table.md)。

6. 支持线程池（thread pool），降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。更多内容参考：[线程池](./5-1-highperf-thread-pool.md)。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
