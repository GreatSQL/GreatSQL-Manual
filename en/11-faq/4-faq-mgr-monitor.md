# FAQ - MGR Monitoring and Troubleshooting
---

## 1. How to check whether MGR secondary nodes have lag
First, you can run the following command to check whether the `trx_tobe_certified` or `relaylog_tobe_applied` values of nodes other than the **PRIMARY** node are large:
```sql
[root@GreatSQL]> SELECT MEMBER_ID AS id, COUNT_TRANSACTIONS_IN_QUEUE AS trx_tobe_certified, COUNT_TRANSACTIONS_REMOTE_IN_APPLIER_QUEUE AS relaylog_tobe_applied, COUNT_TRANSACTIONS_CHECKED AS trx_chkd, COUNT_TRANSACTIONS_REMOTE_APPLIED AS trx_done, COUNT_TRANSACTIONS_LOCAL_PROPOSED AS proposed FROM performance_schema.replication_group_member_stats;
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
| id                                   |trx_tobe_certified |relaylog_tobe_applied| trx_chkd | trx_done | proposed |
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
| 4ebd3504-11d9-11ec-8f92-70b5e873a570 |                 0 |                   0 |   422248 |        6 |   422248 |
| 549b92bf-11d9-11ec-88e1-70b5e873a570 |                 0 |              238391 |   422079 |   183692 |        0 |
| 5596116c-11d9-11ec-8624-70b5e873a570 |              2936 |              238519 |   422115 |   183598 |        0 |
| ed5fe7ba-37c2-11ec-8e12-70b5e873a570 |              2976 |              238123 |   422167 |   184044 |        0 |
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
```
Among them, the `relaylog_tobe_applied` value represents the queue of transactions waiting to be replayed after remote transactions are written to the relay log, and `trx_tobe_certified` represents the size of the queue of transactions waiting to be certified. If either of these two values is greater than 0, it means there is a certain degree of lag.

Alternatively, you can also judge by the gap between the transactions received and the transactions executed:
```sql
[root@GreatSQL]> SELECT RECEIVED_TRANSACTION_SET FROM performance_schema.replication_connection_status WHERE  channel_name = 'group_replication_applier' UNION ALL SELECT variable_value FROM performance_schema.global_variables WHERE  variable_name = 'gtid_executed'\G
*************************** 1. row ***************************
RECEIVED_TRANSACTION_SET: 6cfb873b-573f-11ec-814a-d08e7908bcb1:1-3124520
*************************** 2. row ***************************
RECEIVED_TRANSACTION_SET: 6cfb873b-573f-11ec-814a-d08e7908bcb1:1-3078139
```
As you can see, the GTID of received transactions has reached 3124520, while the local execution has only reached 3078139, with a gap of 46381. You can also continue to pay attention to the changes in this gap to estimate whether the local node can catch up with the lag or whether the lag will increase.

## 2. In a three-node MGR cluster, can it still work normally after two nodes go down
It depends on the specific situation.

If the two nodes are shut down normally, they will send exit signals to the MGR cluster. In this case, the two nodes exit normally, and the last remaining node will be promoted to the PRIMARY role. It can still work normally and allow reads and writes, but there is no availability redundancy at this point. When the other nodes restart and join the cluster, normal service can be restored.

If it is due to network failure, or the mysqld process encounters oom, is accidentally killed, or exits for other reasons, these nodes will be marked as **UNREACHABLE** and wait until the `group_replication_member_expel_timeout` duration (in seconds) before the node formally exits the cluster. In this case, once more than the majority of nodes are in the **UNREACHABLE** state, the entire cluster becomes unavailable and cannot provide read-write services. In this case, you need to restart the MGR service on the remaining nodes to restore it.

Under normal circumstances, do not set the `group_replication_member_expel_timeout` value too large, and try not to choose the **AFTER** mode for the MGR transaction consistency level, to avoid the problem of the entire cluster being unavailable. For details, see this article: [Why MGR consistency mode AFTER is not recommended](https://mp.weixin.qq.com/s/zy0VUgF_5gJuZYbzNVxPXA).

## 3. What situations can cause the MGR service to fail to start
Briefly summarized, the following reasons may cause the MGR service to fail to start:
1. Network reasons, such as the network being unreachable in the first place, or being blocked by firewalls. Firewalls usually have at least two layers: the default firewall policy of the operating system, and the default security policy of cloud hosts.
2. The first node to start did not perform the initial bootstrap operation first (`group_replication_bootstrap_group=ON`).
3. `group_name` was not correctly configured. The `group_replication_group_name` values of all nodes must be consistent.
4. `group_replication_group_name` is not correctly configured, which is common for beginners. A dedicated service port should be newly opened for the MGR service, commonly port 33061, but beginners may still write port 3306.
5. Usually, we add the hostnames of all nodes to the hosts files of each MGR node. This is to prevent the hostname used by the local node from being inconsistent with the hostname received by MGR. In this case, you can set `report_host` on each local node to actively report the hostname.
7. The allowlist is not set correctly. The IPs of nodes joining MGR may not be in the default allowlist. Refer to this article: [Problems caused by IP address restrictions in MySQL Group Replication clusters and solutions](https://mp.weixin.qq.com/s/sbYufrlOx4cKiT8sV3hCaw).
8. A node has more local transactions, such as data written by misoperation, which will also fail to join MGR. In this case, the local node needs to be rebuilt.
9. A node is missing too many local transactions and cannot automatically complete recovery when joining MGR. This situation is relatively rare and requires manual clone to copy data, or other similar operations.

## 3. Error when importing a mysqldump backup file into an MGR cluster

When importing a mysqldump backup file into an MGR cluster, an error is encountered, similar to the following:

```log
ERROR 3098 (HY000) at line 1: The table does not comply with the requirements by an external plugin.
```

The reason for this error is that the CREATE TABLE DDL in the SQL backup file to be imported does not comply with the MGR constraints, such as the table must be an InnoDB engine table and must have an explicitly defined primary key.

For details on the MGR constraints and limitations, refer to: [Are there any limitations when using MGR](./5-faq-others.md#_1-are-there-any-limitations-when-using-mgr)

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
