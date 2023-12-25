# GreatSQL高可用特性之主主复制防止回路
---

## 功能说明

在跨机房容灾场景，同时开启多源复制和主主复制时，可能出现数据回路问题。新增 `replicate_server_mode` 选项用于控制只应用多源复制管道内临近主节点上产生的binlog，不会应用其他的非临近节点产生的binlog，避免出现数据回路问题。多通道主主复制能减少机房容灾演练和切换时的主从配置变更，该特性由中移智家DBA团队（徐良）贡献代码。更多详细内容参考：[issue#I8E8QB](https://gitee.com/GreatSQL/GreatSQL/issues/I8E8QB)。


## 新增系统选项

| System Variable Name  | replicate_server_mode |
| --- | --- |
| Command-Line Format | replicate_server_mode[={0\|1}] |
| System Variable     | replicate_server_mode     |
| Variable Scope        | Global |
| Dynamic Variable      | No |
| Type                | bool                             |
| Permitted Values |    [0, 1] |
| Default       | 0 |

设置为1表示只应用只应用多源复制管道内临近主节点上产生的binlog，不会应>用其他的非临近节点产生的binlog；设置为0表示应用binlog时不做此约束。

**提醒**：该选项是个全局选项，且不可在线动态修改，因此需要在实例启动前就设置好。尝试在线修改的话，会提示报错，例如：
```sql
greatsql> select @@session.replicate_server_mode;
ERROR 1238 (HY000): Variable 'replicate_server_mode' is a GLOBAL variable

greatsql> select @@global.replicate_server_mode;
+--------------------------------+
| @@global.replicate_server_mode |
+--------------------------------+
|                              0 |
+--------------------------------+
1 row in set (0.00 sec)

greatsql> set global replicate_server_mode = 0;
ERROR 1238 (HY000): Variable 'replicate_server_mode' is a read only variable
```

更多关于该特性的应用案例请参考：[基于GreatSQL的跨机房多通道主主复制容灾切换实战演练](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/multi-idc-multi-channel-dul-replication-ha.md)、[基于MySQL多通道主主复制的机房容灾方案](https://mp.weixin.qq.com/s/1f8cTzQ_KZiBw9VeadO7KA)。

**延伸阅读**

- [跨机房容灾场景，同时开启多源复制和主主复制，存在数据回路问题](https://gitee.com/GreatSQL/GreatSQL/issues/I8E8QB)
- [基于GreatSQL的跨机房多通道主主复制容灾切换实战演练](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/multi-idc-multi-channel-dul-replication-ha.md)
- [基于MySQL多通道主主复制的机房容灾方案](https://mp.weixin.qq.com/s/1f8cTzQ_KZiBw9VeadO7KA)



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
