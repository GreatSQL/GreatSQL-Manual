# GreatSQL高可用特性之智能选主
---

GreatSQL中支持多种智能选主模式，使得高可用切换选主机制更合理。

完善自动选主机制，增加基于最新GTID判断来选主，避免自动选择没有最新GTID的节点作为新主。

默认地，MGR根据以下规则选主：
1. 当有MySQL 5.7和MySQL 8.0不同版本的节点混合部署时，只会选择运行5.7的节点作为主节点。此外，在 <= MySQL 8.0.16 版本时，以主版本号进行排序，也就是说 5.7 排在 8.0 前
面。在 > MySQL 8.0.17版本中，则是以补丁版本号排序，也就是 8.0.17 排在 8.0.25 前面。
2. 当所有节点版本号一致时，则根据节点权重值（选项 group_replication_member_weight 定义权重值，这个选项5.7版本没有，8.0开始新增）排序，权重值高的节点排在前面。
3. 根据节点 server_uuid 排序。

在一些情况下，在MGR所有节点都发生意外要重新拉起时，不会检查各节点事务应用状态，而错误选择新的主节点，这时可能会导致丢失一些事务数据。或者当原来的主节点crash需要重
新投票选择新的主节点时，可能也会选择一个权重值较高，但没有最新事务的节点，也会存在丢失一部分事务数据的风险。

在GreatSQL中，新增选项 `group_replication_primary_election_mode` 用于自定义选主策略，可选值有以下几个：
- WEIGHT_ONLY，还是按照上述传统模式自动选主，这是默认值。
- GTID_FIRST，优先判断各节点事务应用状态，自动选择拥有最新事务的节点作为新的主节点。**推荐设置为该模式。**
- WEIGHT_FIRST，传统模式优先，如果没有合适的结果再判断各节点事务状态。

**提醒**，所有节点都的设置必须相同，否则无法启动。

| System Variable Name    | group_replication_primary_election_mode |
| --- | --- |
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Permitted Values |    WEIGHT_ONLY<br/>GTID_FIRST<br/>WEIGHT_FIRST |
| Default    | WEIGHT_ONLY |
| Description    | 当MGR集群需要投票选主时，采用何种投票策略。|


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")

