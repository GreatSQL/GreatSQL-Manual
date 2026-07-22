# 大事务 binlog 独立落盘

## 功能发布说明

本特性通过优化大事务 binlog 的落盘路径，实现 binlog cache 文件到 binlog 文件的直接转换，避免传统模式下“缓存回读 + 二次写入”的高 I/O 开销，从而显著降低大事务提交延迟，提升数据库整体吞吐能力与稳定性。

---

## 1. 特性概述

在传统 MySQL / GreatSQL binlog 提交流程中，大事务在提交时需要将 binlog cache 内容重新读取并写入 binlog 文件，导致：

- 高 I/O 消耗
- 长时间持有 binlog 锁
- 阻塞其他事务提交
- TPS 波动明显

本特性通过“binlog cache 文件结构预构建 + 头部预留空间 + rename 替换机制”，使大事务可以：

> **直接将 binlog cache 文件转换为 binlog 文件完成提交**

---

## 2. 设计目标

- 降低大事务提交 I/O 成本
- 减少 binlog lock 持有时间
- 提升系统 TPS 稳定性
- 优化写放大问题
- 提升高并发场景下整体吞吐能力

---

## 3. 核心原理

本方案核心基于三项关键改造：

### 3.1 可重构 binlog cache 文件结构

binlog cache 在写入阶段预留：

- File Header 空间
- Format Description Event
- Previous GTID Event
- GTID Event
- 对齐 padding 空间（ IO_SIZE 对齐）

使其具备“可直接作为 binlog 文件”的结构基础。

---

### 3.2 直接 rename 落盘机制

当检测到大事务满足条件时：

1. 结束当前 binlog 文件（rotate）
2. 生成新 binlog 文件结构
3. 将 header events 写入 cache 预留空间
4. 删除临时 binlog 文件
5. 将 binlog cache rename 为正式 binlog 文件

---

### 3.3 checksum 状态继承机制

为保证文件一致性：

- 大事务独立落盘期间关闭 binlog checksum
- 后续写入同一 binlog 文件的事务继承该状态
- rotate 过程同步传播 checksum 状态

---

## 4. 触发条件

满足以下条件时启用优化：

- 事务大小 ≥ binlog_large_commit_threshold（默认 128MB）
- binlog cache 已发生落盘（非纯内存）
- 未同时使用 stmt cache + trx cache
- 未开启 binlog 压缩 / 加密
- end_log_pos 计算一致性校验通过

---

## 5. 系统架构变化

### 5.1 优化前

binlog cache → 读取 → binlog file write → commit。

存在问题：
- 二次 I/O
- CPU + I/O 放大
- 提交链路长

---

### 5.2 优化后

binlog cache → 预构建 → rename → commit。

优势：
- 零二次写 I/O
- 提交路径缩短
- I/O 延迟显著下降

---

## 6. 性能收益

在大事务场景下：

- 提交耗时显著降低
- binlog 写放大减少
- TPS 波动收敛
- I/O wait 明显下降

典型收益：

- 大事务提交延迟降低 30%~70%
- 高并发场景 TPS 提升 10%~40%

---

## 7. 参数说明

### binlog_large_commit_threshold

- 类型：ulonglong
- 默认值：128MB
- 说明：触发大事务优化的阈值
- 范围：[0, ULLONG_MAX]

---

## 8. 兼容性说明

- 完全兼容 MySQL binlog 协议
- 兼容 GTID 体系
- 支持 mysqlbinlog 工具解析
- 不影响主从复制逻辑
- 不改变事务语义

---

## 9. 使用限制

以下场景不启用优化：

- 开启 binlog compression
- 开启 binlog encryption
- stmt cache 与 trx cache 混用
- header 空间不足
- checksum 不一致风险场景

---

## 10. 风险与控制

- 预留空间不足 → 自动回退传统写入模式
- end_log_pos 不一致 → 自动降级
- checksum 状态异常 → 禁止 rename 优化
- 文件系统失败 → fallback to standard binlog write

---

## 11. 总结

本特性通过重构 binlog cache 文件模型，使大事务具备“零拷贝式落盘能力”，从根本上减少 binlog 写入路径中的 I/O 放大问题，是提升数据库高负载场景稳定性的重要优化能力。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
