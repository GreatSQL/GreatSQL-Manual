# GreatSQL高可用特性之快速单主模式
---

MySQL MGR原生的流控算法有较大缺陷，触发流控阈值后，会有短暂的流控停顿动作，之后继续放行事务，这会造成1秒的性能抖动，且没有真正起到持续流控的作用。

在GreatSQL中，重新设计了流控算法，增加主从延迟时间来计算流控阈值，并且同时考虑了大事务处理和主从节点的同步，流控粒度更细致，不会出现官方社区版本的1秒小抖动问题。

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
mysql> SET GLOBAL group_replication_flow_control_replay_lag_behind = 60;
```
正常情况下，该参数无需调整。


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
