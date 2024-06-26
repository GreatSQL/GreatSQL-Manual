# MGR 优化提升
---

- 节点异常状态判断更完善和高效。

新增系统参数 `group_replication_communication_flp_timeout`

MGR中，各节点间会定期交换消息，当超过 5 秒（在 MySQL 中是固定值）还没收到某个节点的任何消息时，就会将这个节点标记为可疑状态（suspicion）。MGR 各正常存活节点会对可疑节点每隔 15 秒检测一次（在 MySQL 中是固定值），当确认可疑节点在超过 `group_replication_member_expel_timeout` 秒超时阈值后，再将该节点驱逐出 MGR。当节点发生故障时，极端情况下，可能要耗费 5（5 秒没发送消息，被判定为可疑节点） + 15（对可疑节点每 15 秒检测一次） + 5（`group_replication_member_expel_timeout`） = 25 秒之后才会驱逐该节点。最好的情况下，最少也需要 5 + 5 = 10 秒后才会驱逐该节点。

GreatSQL 对此情况进行了优化，新增选项 `group_replication_communication_flp_timeout`（默认值：5，最小：3，最大：60）用于定义节点超过多少秒没发消息会被判定为可疑。此外，还将故障检测线程调整为每 2 秒（而非原来的 15 秒）检查一次。因此在 GreatSQL 中，最快只需要 3（`group_replication_communication_flp_timeout`） + 5（`group_replication_member_expel_timeout`） = 8 秒即可完成对可疑节点的驱逐，最慢 5（`group_replication_communication_flp_timeout`） + 5（`group_replication_member_expel_timeout`） + 2（对可疑节点每 2 秒检测一次）  = 12 秒即可完成对可疑节点的驱逐。

- 支持AFTER模式下多数派写机制。
- 解决磁盘空间爆满时导致MGR集群阻塞的问题。
- 解决多主模式下或切主时可能导致丢数据的问题。
- 解决节点异常退出集群时导致性能抖动的问题。
- 提高MGR吞吐量。
- 提升一致性读性能。
- 优化了加入节点时可能导致性能剧烈抖动的问题。
- 优化手工选主机制，解决了长事务造成无法选主的问题。
- 完善MGR中的外键约束机制，降低或避免从节点报错退出MGR的风险。
- 提升了Secondary节点上大事务并发应用回放的速度。
- 优化了加入节点时可能导致性能剧烈抖动的问题。
- 完善MGR中的外键约束机制，降低或避免从节点报错退出MGR的风险。




**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
