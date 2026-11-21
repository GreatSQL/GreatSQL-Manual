# Disconnecting App Connections After MGR Primary Switchover
---

## Introduction

In a single-primary MGR cluster, when the Primary node is switched, the application connections on the old Primary node are not automatically disconnected. The application needs to detect the abnormal state or set up a response timeout control mechanism, which may cause brief unavailability of the application.

Starting from GreatSQL 8.0.32-25, the option `greatdb_ha_mgr_exit_primary_kill_connection_mode` is added. When the parameter value is set to **ON**, all connections on the old Primary node are proactively disconnected when MGR Primary switchover occurs. The default value of this option is **OFF**, meaning that by default, all application connections on the old Primary node are not automatically disconnected during Primary switchover.

::: danger Special Reminder
After enabling this feature, when MGR Primary switchover occurs, **all connections on the old Primary node will be disconnected**, which may affect applications such as read-only services and monitoring services. Therefore, evaluate carefully before use.
:::

## Enabling the Feature

- Enable the `greatdb_ha` plugin

This feature depends on the **greatdb_ha** plugin, so the plugin must be enabled first.

Modify **my.cnf** and add the following content to the *[mysqld]* section:

```ini
[mysqld]
plugin_load_add=greatdb_ha.so

#Disconnect all application connections on the old Primary node after MGR Primary switchover
greatdb_ha_mgr_exit_primary_kill_connection_mode=ON
```

Or, after GreatSQL is started, manually execute the following SQL commands to enable it:

```sql
INSTALL PLUGIN greatdb_ha SONAME 'greatdb_ha.so';

SET GLOBAL greatdb_ha_mgr_exit_primary_kill_connection_mode=ON;
```

## Additional Notes

When the MGR Primary node is in the minority due to a failure (such as the classic split-brain scenario), the node cannot provide write services but can provide read-only services. If you also want this node to disconnect all application connections, you need to set the parameter `group_replication_unreachable_majority_timeout` to a non-zero value. After waiting for `group_replication_unreachable_majority_timeout`, the old Primary node proactively exits the MGR cluster, triggering the Primary switchover action, which automatically disconnects all application connections.

To ensure that the other majority nodes can only vote for a new Primary node after the old Primary node has exited, you can set `group_replication_unreachable_majority_timeout` < `group_replication_member_expel_timeout`. This ensures that only after the old Primary in the minority completely exits will the remaining majority nodes re-elect a new Primary node.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
