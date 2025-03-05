# 其他高可用优化提升
---

- 节点异常状态判断更完善和高效。

新增系统参数 `group_replication_communication_flp_timeout`

MGR中，各节点间会定期交换消息，当超过 5 秒（在 MySQL 中是固定值）还没收到某个节点的任何消息时，就会将这个节点标记为可疑状态（suspicion）。MGR 各正常存活节点会对可疑节点每隔 15 秒检测一次（在 MySQL 中是固定值），当确认可疑节点在超过 `group_replication_member_expel_timeout` 秒超时阈值后，再将该节点驱逐出 MGR。当节点发生故障时，极端情况下，可能要耗费 5（5 秒没发送消息，被判定为可疑节点） + 15（对可疑节点每 15 秒检测一次） + 5（`group_replication_member_expel_timeout`） = 25 秒之后才会驱逐该节点。最好的情况下，最少也需要 5 + 5 = 10 秒后才会驱逐该节点。

GreatSQL 对此情况进行了优化，新增选项 `group_replication_communication_flp_timeout`（默认值：5，最小：3，最大：60）用于定义节点超过多少秒没发消息会被判定为可疑。此外，还将故障检测线程调整为每 2 秒（而非原来的 15 秒）检查一次。因此在 GreatSQL 中，最快只需要 3（`group_replication_communication_flp_timeout`） + 5（`group_replication_member_expel_timeout`） = 8 秒即可完成对可疑节点的驱逐，最慢 5（`group_replication_communication_flp_timeout`） + 5（`group_replication_member_expel_timeout`） + 2（对可疑节点每 2 秒检测一次）  = 12 秒即可完成对可疑节点的驱逐。

| System Variable Name  | group_replication_communication_flp_timeout |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | YES |
| Type      | Integer |
| Permitted Values |    [3 ~ 60] |
| Default       | 5 |

- 当有新成员节点加入 MGR 时，如果选择 Clone 方式复制数据，支持自动选择从最新事务数据的成员节点复制数据，可有效提升 Clone 速度，提高 MGR 的服务可靠性。当新加入节点触发 Clone 方式复制数据时，也支持该特性。

选项 `group_replication_donor_threshold` 用于定义选择 Donor 节点时判断事务延迟阈值，取值范围 [1, MAX]，默认值为 MAX。MAX 值取决于 CPU 类型，在 32-bit 系统中是 2147483647（2^31-1），而在 64-bit 系统中是 9223372036854775807（2^63-1）。

当新成员节点加入 MGR 时，新成员节点只会选择那些延迟小于 `group_replication_donor_threshold` 的节点作为 Donor 节点。

假设 `group_replication_donor_threshold = 100`，那么：
1. 现在 MGR 中有两个节点A、B，它们的 GTID 分别是 [1-300]、[1-280]，新节点 C 加入，由于 A & B 节点的 GTID 差值小于预设阈值，则随机选择 A 或 B 其中一个节点作为 Donor 节点。
2. 现在 MGR 中有两个节点A、B，它们的 GTID 分别是 [1-400]、[1-280]，新节点 C 加入，由于 A & B 节点的 GTID 差值大于预设阈值，则只会选择 A 作为 Donor 节点。
3. 现在 MGR 中有三个节点A、B、C，它们的 GTID 分别是 [1-400]、[1-350]、[1-280]，新节点 D 加入，由于 C 节点的 GTID 差值大于预设阈值，A & B 节点 GTID 延迟小于预设阈值，则会随机选择 A 或 B 其中一个作为 Donor 节点。

| System Variable Name  | group_replication_donor_threshold |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | YES |
| Type      | Integer |
| Permitted Values |    [1 ~ 9223372036854775807] |
| Default       | 9223372036854775807 |

- 优化了MGR大事务传输时压缩超过限制的处理机制。

在MGR中有大事务超过`group_replication_compression_threshold`阈值时会进行LZ4压缩，但由于LZ4自身限制，可能导致压缩失败报错，事务执行失败，报告类似下面的错误

```log
[GCS] Gcs_packet's payload is too big. Only packets smaller than 2113929216 bytes can be compressed. Payload size is 2197817290
```

  GreatSQL对此机制进行调整优化，实现以下两点目标：

  1. 当事务大小超过`group_replication_compression_threshold`阈值则启动压缩。

  2. 但当事务大小超过LZ4压缩限制时不再报错，改成继续使用原始未压缩的事务数据进行传输，即类似设置`group_replication_compression_threshold=0`（不启用压缩）时的效果。

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


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
