# GreatSQL高可用特性之全新流控算法
---

原生MGR流控算法有较大缺陷，触发流控阈值后，会有短暂的流控停顿动作，之后继续放行事务，这可能会造成反复多次1秒的性能抖动，且没有真正起到持续流控的作用。

当 `group_replication_flow_control_mode=DISABLED` 时，关闭流控机制。

当 `group_replication_flow_control_mode=QUOTA` 时，采用全新的流控机制。GreatSQL中重新设计了流控算法，除了会考虑认证数据库队列大小的因素，并同时考虑了大事务处理和主从节点的同步，流控粒度更细致，不会出现官方社区版本的1秒小抖动问题。

新增选项 `group_replication_flow_control_replay_lag_behind` 用于控制MGR主从节点复制延迟阈值，当MGR主从节点因为大事务等原因延迟超过阈值时，就会触发流控机制。

| System Variable Name  | group_replication_flow_control_replay_lag_behind |
| --- | --- |
| Variable Scope        | global |
| Dynamic Variable      | YES |
| Permitted Values |    [0 ~ ULONG_MAX] |
| Default       | 60 |
| Description   | 用于控制MGR主从节点复制延迟阈值，当MGR主从节点因为大事务等原因延迟超过阈值时，就会触发流控机制 |

该选项默认为60秒，可在线动态修改，例如：
```sql
greatsql> SET GLOBAL group_replication_flow_control_replay_lag_behind = 60;
```
正常情况下，该参数无需调整。

**提示**：
1. 在GreatSQL中，启用新的流控机制后（`group_replication_flow_control_mode=QUOTA`），只有 `group_replication_flow_control_replay_lag_behind` 参数有作用。原先关于流控的几个选项 `group_replication_flow_control*` 等都不再起作用，但仍然查看和修改。
2. Percona 8.0.30中对选项 `group_replication_flow_control_mode` 新增可选值 `MAJORITY`，在GreatSQL中也不起作用。


在GreatSQL的global status中，还新增了两个状态参数：
- `group_replication_flow_control_count`，表示流控被触发的累积次数。
- `group_replication_flow_control_time`，表示流控触发后累积等待时长（单位：微秒）。

根据这两个指标项，可以判断MGR流控的影响有多大。也可以通过监控某个时段内指标发生的变化，判断这段时间内的事务提交是否受到流控的影响。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
