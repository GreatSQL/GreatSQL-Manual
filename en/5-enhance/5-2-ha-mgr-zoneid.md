# MGR Zone Tags
---

## Introduction
GreatSQL adds the zone tag feature to improve data reliability in multi-data-center architectures.

A zone tag can be set for each node, mainly used to solve the problem of data synchronization across multiple data centers.

The new option `group_replication_zone_id` is used to mark the zone tag of a node. The supported value range is 0 ~ 8, and the default value is 0.

When the option values of nodes in the cluster are set differently, they are considered to have different zone tags. An exception is that in [arbitrator nodes](./5-2-ha-mgr-arbitrator.md), there is no need to additionally set a zone tag; the default value can be kept.

In a same-city multi-data-center deployment, nodes in the same data center can be set to the same value, and nodes in another data center can be set to a different value. In this way, when transactions are committed, at least one node in each `group_replication_zone_id` group is required to acknowledge the transaction before the next transaction can be processed. This ensures that a node in each data center always has the latest transactions.

## New System Variables

- group_replication_zone_id

| System Variable Name  | group_replication_zone_id |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | Yes |
| Type                | Integer  |
| Permitted Values |    [0 - 8] |
| Default       | 0 |
| Description   | Sets different zone tags for MGR nodes, mainly used to solve the problem of data synchronization across multiple data centers.<br/>After modifying the option value, the MGR thread must be restarted for the change to take effect. |

- group_replication_zone_id_sync_mode

| System Variable Name  | group_replication_zone_id_sync_mode |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | Yes |
| Type                | Boolean  |
| Permitted Values |    ON/OFF |
| Default       | ON |
| Description   | This parameter controls the data synchronization behavior mode of nodes in different data centers in MGR. |

This parameter controls the data synchronization behavior mode of nodes in different data centers in MGR. All nodes in MGR except arbitrator nodes must be configured with the same value; otherwise, the nodes cannot join MGR.

## Notes

- During MGR operation, the option value cannot be changed. The MGR service must be stopped first, then the value can be modified and MGR restarted.

- When the option is set to ON, if multiple zone ids exist in MGR, it is required that on the basis of satisfying the Paxos majority protocol, at least one node in each zone id synchronizes the latest data.

- If `group_replication_zone_id` is set to enable the zone tag feature, all nodes must synchronize data. However, when `group_replication_zone_id_sync_mode = OFF`, the zone tag is just a marker, and it is no longer guaranteed that all nodes synchronize data.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
