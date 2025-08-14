# MGR 地理标签
---

## 简介
GreatSQL中新增地理标签特性，可以提升多机房架构数据可靠性。

可以对每个节点设置地理标签，主要用于解决多机房数据同步的问题。

新增选项 `group_replication_zone_id`，用于标记节点地理标签。该选项值支持范围 0 ~ 8，默认值为0。

当集群中各节点该选项值设置为不同的时候，就被认定为设置了不同的地理标签。有个例外情况是，在 [仲裁节点](./5-2-ha-mgr-arbitrator.md) 中无需额外设置地理标签，保持使用默认值即可。

在同城多机房部署方案中，同一个机房的节点可以设置相同的数值，另一个机房里的节点设置另一个不同的数值，这样在事务提交时会要求每组 `group_replication_zone_id` 中至少有个节点确认事务，然后才能继续处理下一个事务。这就可以确保每个机房的某个节点里，总有最新的事务。

## 新增系统参数

- group_replication_zone_id

| System Variable Name  | group_replication_zone_id |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | Yes |
| Type                | Interger  |
| Permitted Values |    [0 - 8] |
| Default       | 0 |
| Description   | 设置MGR各节点不同的地理标签，主要用于解决多机房数据同步的问题。<br/>修改完该选项值之后，要重启MGR线程才能生效。 |


- group_replication_zone_id_sync_mode

| System Variable Name  | group_replication_zone_id_sync_mode |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | Yes |
| Type                | Boolean  |
| Permitted Values |    ON/OFF |
| Default       | ON |
| Description   | 该参数用于控制 MGR 中，不同机房里的节点的数据同步行为模式 |


该参数用于控制 MGR 中，不同机房里的节点的数据同步行为模式。需要保证 MGR 中除了仲裁节点之外的所有节点配置相同的值，否则节点无法加入 MGR。

在 MGR 运行过程中，不允许更改选项值；需要先停止 MGR 服务，修改后才能再启动。

当选项设置为 ON 时，如果 MGR 中存在多个 zone id（地理标签），则要求在满足 Paxos 多数派协议的基础上，需要保证每个 zone id 中最少有一个节点同步到最新数据。

如果设置了 `group_replication_zone_id` 启用地理标签功能，需要保证所有节点都同步数据。但当 `group_replication_zone_id_sync_mode = OFF` 时，地理标签就只是个标记，不再保证各节点都同步数据。 

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
