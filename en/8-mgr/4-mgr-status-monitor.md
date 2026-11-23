# MGR Status Monitoring

---

Like traditional source-replica replication, MGR mainly requires attention to the running status of each node and whether there is any delay in transactions on the Secondary nodes during operation. This article describes how to monitor the MGR node status, transaction status, etc.

## Node Status Monitoring
By querying the `performance_schema.replication_group_members` table, you can learn the status of each MGR node:
```sql
greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 192.168.6.27 |        4306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 192.168.6.27 |        4307 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 192.168.6.27 |        4308 | ONLINE       | SECONDARY   | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```
The interpretation of the main columns in the output is as follows:
- The **MEMBER_ID** column value is the **server_uuid** of each node, used to uniquely identify each node. In the command line mode, pass the MEMBER_ID when calling UDFs to specify each node.
- **MEMBER_ROLE** indicates the role of each node. If it is **PRIMARY**, the node can accept read/write transactions; if it is **SECONDARY**, the node can only accept read-only transactions. If only one node is PRIMARY and the rest are SECONDARY, the cluster is in **single-primary mode**; if all nodes are PRIMARY, the cluster is in **multi-primary mode**.
- **MEMBER_STATE** indicates the status of each node. There are several states: `ONLINE`, `RECOVERING`, `OFFLINE`, `ERROR`, `UNREACHABLE`, etc. The states are introduced below:
    - `ONLINE` indicates that the node is in a normal state and can provide services.
    - `RECOVERING` indicates that the node is performing distributed recovery and waiting to join the cluster. At this time, it may be copying data from the donor node using clone, or transferring binlog.
    - `OFFLINE` indicates that the node is currently offline. Note that when a node is about to join or rejoin the cluster, its status may also briefly show OFFLINE.
    - `ERROR` indicates that the node is currently in an error state and cannot become a member of the cluster. A node may also be in this state while performing distributed recovery or applying transactions. When a node is in the ERROR state, it cannot participate in cluster transaction arbitration. When a node is joining or rejoining the cluster, it may also show the ERROR state before completing compatibility checks and becoming an official MGR node.
    - `UNREACHABLE` when group communication message send/receive times out, the failure detection mechanism marks this node as a suspected state, suspecting that it may be unable to connect with other nodes, for example, when a node is unexpectedly disconnected. When you see other nodes in the UNREACHABLE state from a node, it may mean that a network partition has occurred among some nodes, that is, multiple nodes have split into two or more subsets. Nodes within a subset can communicate with each other, but communication between subsets is not possible.

When the status of a node is not `ONLINE`, an alert should be raised immediately and an investigation should be conducted.

When the status of a node changes, or when a node joins or leaves, the data in the `performance_schema.replication_group_members` table is updated, and the status information is exchanged and shared among nodes, so it can be viewed from any node.

## MGR Transaction Status Monitoring
Another thing that needs special attention is the transaction status of the Secondary nodes, more precisely, the sizes of the transaction certification queue and the transaction application queue.

You can execute the following command to check whether the values of `trx_tobe_certified` or `relaylog_tobe_applied` on nodes other than the **PRIMARY** node are large:
```sql
greatsql> SELECT MEMBER_ID AS id, COUNT_TRANSACTIONS_IN_QUEUE AS trx_tobe_certified, COUNT_TRANSACTIONS_REMOTE_IN_APPLIER_QUEUE AS relaylog_tobe_applied, COUNT_TRANSACTIONS_CHECKED AS trx_chkd, COUNT_TRANSACTIONS_REMOTE_APPLIED AS trx_done, COUNT_TRANSACTIONS_LOCAL_PROPOSED AS proposed FROM performance_schema.replication_group_member_stats;
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
| id                                   |trx_tobe_certified |relaylog_tobe_applied| trx_chkd | trx_done | proposed |
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
| 4ebd3504-11d9-11ec-8f92-70b5e873a570 |                 0 |                   0 |   422248 |        6 |   422248 |
| 549b92bf-11d9-11ec-88e1-70b5e873a570 |                 0 |              238391 |   422079 |   183692 |        0 |
| 5596116c-11d9-11ec-8624-70b5e873a570 |              2936 |              238519 |   422115 |   183598 |        0 |
| ed5fe7ba-37c2-11ec-8e12-70b5e873a570 |              2976 |              238123 |   422167 |   184044 |        0 |
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
```
Among them, the value of `relaylog_tobe_applied` indicates the queue of transactions waiting to be replayed after remote transactions are written to the Relay Log, and `trx_tobe_certified` indicates the size of the queue of transactions waiting to be certified. If either of these two values is greater than 0, it means there is a certain degree of delay.

You can also pay attention to the changes in the above two values to see whether the two queues are gradually growing or shrinking, and use this to determine whether the Primary node is "running too fast" or whether the Secondary node is "running too slow".

One more thing: when flow control is enabled, if the above two values exceed the corresponding thresholds (`group_replication_flow_control_applier_threshold` and `group_replication_flow_control_certifier_threshold`, both with a default threshold of 25000), the flow control mechanism will be triggered.

## Other Monitoring
In addition, you can also determine the situation by checking the gap between the received transactions and the executed transactions:
```sql
greatsql> SELECT variable_value FROM performance_schema.global_variables WHERE  variable_name = 'gtid_executed'\G
*************************** 1. row ***************************
variable_value: 6cfb873b-573f-11ec-814a-d08e7908bcb1:1-3078139
```
This indicates that the GTID value of the currently executed transactions is 3078139.

You can pay attention to the change of this value per unit time to infer the transaction application performance of the local node.

You can also pay attention to the difference in the executed transaction GTID values among nodes. When the original primary node fails and you want to manually select a node as the new primary node, you should first determine which node has a larger executed transaction GTID value and give priority to that node.

## GreatSQL Shell Monitoring

Using `status()`, you can view the current list of nodes and the status of each node.

```js
MySQL  172.16.16.10:3306 ssl  JS > c.status()

{
    "clusterName": "GreatSQLMGR",
    "defaultReplicaSet": {
        "name": "default",
        "primary": "172.16.16.10:3306",
        "ssl": "REQUIRED",
        "status": "OK",
        "statusText": "Cluster is ONLINE and can tolerate up to ONE failure.",
        "topology": {
            "172.16.16.10:3306": {
                "address": "172.16.16.10:3306",
                "memberRole": "PRIMARY",
                "mode": "R/W",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.4.4"
            },
            "172.16.16.11:3306": {
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.4.4"
            },
            "172.16.16.12:3306": {
                "address": "172.16.16.12:3306",
                "memberRole": "ARBITRATOR",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.4.4"
            }
        },
        "topologyMode": "Single-Primary"
    },
    "groupInformationSourceMember": "172.16.16.10:3306"
}
```

The interpretation of the main fields in the output is as follows:

- `clusterName:` the name of the cluster, here it is GreatSQLMGR
- `defaultReplicaSet:` the default replica set information
- `name:` the name of the replica set, here it is default
- `primary:` the address of the current primary node
- `ssl:` the SSL encryption method used, here REQUIRED means SSL connection is required
- `status:` the status of the replica set, OK means normal
- `statusText:` the textual description of the cluster status
- `topology:` the information of each node that makes up the cluster
  - `address:` the node address
  - `memberRole:` the role of the node in the group, which can be PRIMARY, SECONDARY, ARBITRATOR
  - `mode:` the read/write mode of the node; PRIMARY is read/write, and the others are read-only
  - `readReplicas:` the secondary node information
  - `replicationLag:` the replication delay situation
  - `role:` the node role, HA means high availability
  - `status:` the node status, ONLINE means online
  - `version:` the GreatSQL version of the node


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
