# 并行复制回放优化

---

## 1. 功能概述

在主从复制或组复制集群中，备节点通过回放 relaylog 中的 binlog 事务实现数据同步。由于 binlog 属于逻辑日志，备节点需要重新执行事务，因此在高并发场景下容易出现复制延迟。

现有并行复制机制基于 write-set / logical clock 模型，通过 last_committed 与 sequence_number 判断事务是否可并行执行。但在传统实现中，当遇到存在依赖关系的事务时，协调线程会阻塞后续 binlog 读取与调度。

本优化方案目标：

- 提升备节点并行回放吞吐能力
- 降低调度阻塞
- 提升复制延迟表现
- 增强高可用稳定性

---

## 2. 技术原理

事务关键字段：

- sequence_number
- last_committed

并行规则：

若 last_committed = M，sequence_number = N，且 M < N，则需等待 sequence_number ≤ M 的事务完成。

---

## 3. 优化方案

核心改造：

- 协调线程不再阻塞
- 冲突事务交由 worker 自身等待

新增机制：

- need_wait 标记
- worker wait_for_last_committed_trx
- SIGNAL 唤醒

---

## 4. 参数说明

replica_parallel_wait_mode

- WAIT_ON_SQL_THREAD（旧行为模式，默认值）
- WAIT_ON_WORKER_THREAD（新行为模式，推荐值）

---

## 5. 性能收益

- 提升并行度
- 减少阻塞链路
- 提升吞吐
- 降低延迟

---

## 6. 总结

通过将等待逻辑从协调线程下沉至 worker，实现调度与执行解耦，显著提升并行复制效率。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
