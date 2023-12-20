# GreatSQL高可用特性之地理标签
---

GreatSQL中新增地理标签特性，可以提升多机房架构数据可靠性。

可以对每个节点设置地理标签，主要用于解决多机房数据同步的问题。

新增选项 `group_replication_zone_id`，用于标记节点地理标签。该选项值支持范围 0 ~ 8，默认值为0。

当集群中各节点该选项值设置为不同的时候，就被认定为设置了不同的地理标签。

在同城多机房部署方案中，同一个机房的节点可以设置相同的数值，另一个机房里的节点设置另一个不同的数值，这样在事务提交时会要求每组 `group_replication_zone_id` 中至少有个节点确认事务，然后才能继续处理下一个事务。这就可以确保每个机房的某个节点里，总有最新的事务。

- 新增选项 `group_replication_zone_id`，用于定义节点所属地理标签ID

| System Variable Name  | group_replication_zone_id |
| --- | --- |
| Variable Scope        | global |
| Dynamic Variable      | YES |
| Permitted Values |    [0 ~ 8] |
| Default       | 0 |
| Description   | 设置MGR各节点不同的地理标签，主要用于解决多机房数据同步的问题。<br/>修改完该选项值之后，要重启MGR线程才能生效。 |


- 新增选项 `group_replication_zone_id_sync_mode`（类型：布尔型，可选值：ON/OFF，默认值：ON）。如果设置了 `group_replication_zone_id` 启用地理标签功能，需要保证所
有节点都同步数据。但当 `group_replication_zone_id_sync_mode = OFF` 时，地理标签就只是个标记，不再保证各节点都同步数据。



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
