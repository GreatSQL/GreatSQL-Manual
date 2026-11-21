# MGR Smart Primary Election
---

## Introduction
GreatSQL supports multiple smart primary election modes, making the primary election mechanism in high availability switchover more reasonable.

The automatic primary election mechanism has been improved by adding primary election based on the latest GTID, avoiding the automatic selection of a node without the latest GTID as the new primary.

By default, MGR elects a primary according to the following rules:
1. When nodes of different MySQL versions (MySQL 5.7 and MySQL 8.0) are deployed in a mixed manner, only nodes running 5.7 will be selected as the primary. In addition, for versions <= MySQL 8.0.16, nodes are sorted by major version number, meaning 5.7 comes before 8.0. For versions > MySQL 8.0.17, nodes are sorted by patch version number, meaning 8.0.17 comes before 8.0.25.
2. When all nodes have the same version, they are sorted by node weight (the weight is defined by the option `group_replication_member_weight`; this option is not available in version 5.7 and was introduced in 8.0), with higher-weight nodes ranked first.
3. Nodes are sorted by server_uuid.

In some cases, when all MGR nodes need to be restarted unexpectedly, the transaction application state of each node is not checked and a wrong new primary may be elected, which may cause some transaction data to be lost. Or when the original primary crashes and a new primary needs to be elected by voting, a node with a higher weight but without the latest transactions may be selected, which also carries the risk of losing some transaction data.

## New System Variable
In GreatSQL, the new option `group_replication_primary_election_mode` is added to customize the primary election policy. The optional values are:
- WEIGHT_ONLY, still follows the traditional mode described above for automatic primary election. This is the default value.
- GTID_FIRST, prioritizes checking the transaction application state of each node and automatically selects the node with the latest transactions as the new primary. **It is recommended to set this mode.**
- WEIGHT_FIRST, gives priority to the traditional mode, and only checks the transaction state of each node if there is no suitable result.

**Reminder**: The setting must be the same on all nodes; otherwise, MGR cannot be started.

| System Variable Name    | group_replication_primary_election_mode |
| --- | --- |
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Type | Enumeration |
| Permitted Values |  [WEIGHT_ONLY | GTID_FIRST | WEIGHT_FIRST] |
| Default    | WEIGHT_ONLY |
| Description    | Sets the smart primary election policy. The setting must be the same on all nodes; otherwise, MGR cannot be started. |

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
