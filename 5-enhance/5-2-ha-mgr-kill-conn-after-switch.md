# MGR 切主后断开应用连接
---

## 简介

在单主模式的MGR集群中，当Primary节点发生切换时，旧Primary节点上的应用端连接并不会自动断开，需要应用端进行异常状态判断或设置响应超时控制机制，这可能会造成应用端短暂不可用。

从GreatSQL 8.0.32-25版本开始，新增选项 `greatdb_ha_mgr_exit_primary_kill_connection_mode`，当参数值设置为 **ON**时，在MGR发生Primary节点切换时主动断开旧Primary节点上的**所有连接**。该选项默认值为 **OFF**，即在切换Primary节点时默认不会自动断开旧Primary节点上的所有应用连接。

::: danger 特别提醒
启用该特性后，当MGR Primary节点发生切换时会**断开旧Primary节点上的所有连接**，可能会对只读业务、监控业务等应用造成影响，因此请谨慎评估使用。
:::

## 启用功能特性

- 启用 `greatdb_ha` 插件

该功能特性依赖 **greatdb_ha** 插件，因此要先启用该插件。

修改 **my.cnf**，在 *[mysqld]* 区间添加下面内容

```ini
[mysqld]
plugin_load_add=greatdb_ha.so

#MGR切主后断开旧Priamry节点上的所有应用连接
greatdb_ha_mgr_exit_primary_kill_connection_mode=ON
```

或者在 GreatSQL 启动后，手动执行下面的 SQL 命令启用

```sql
INSTALL PLUGIN greatdb_ha SONAME 'greatdb_ha.so';

SET GLOBAL greatdb_ha_mgr_exit_primary_kill_connection_mode=ON;
```

## 补充说明

当MGR Primary节点因故障处于少数派发生（如经典的脑裂场景），该节点此时不能提供写服务，但是可以提供只读服务。如果此时也想让该节点断开所有应用连接，还需设置 `group_replication_unreachable_majority_timeout` 参数值不为0。在等待 `group_replication_unreachable_majority_timeout` 时间后，旧Primary节点会主动退出MGR集群，从而触发Primary切换这个动作，也就会自动断开所有应用连接。

如果想确保必须在旧Primary节点退出后，其他多数派节点才能投票选出新Primary节点，可以设置 `group_replication_unreachable_majority_timeout` < `group_replication_member_expel_timeout`，这样可以确保处于少数派的旧Primary完全退出后，其余多数派节点才会重新选出新Primary节点。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
