# Other High Availability Improvements
---

- More complete and efficient abnormal node state detection.

A new system variable `group_replication_communication_flp_timeout` is added.

In MGR, nodes exchange messages periodically. When no message is received from a node for more than 5 seconds (a fixed value in MySQL), the node is marked as suspicious. All healthy MGR nodes check the suspicious node every 15 seconds (a fixed value in MySQL). When the suspicious node is confirmed to exceed the `group_replication_member_expel_timeout` threshold, it is expelled from MGR. When a node fails, in the worst case, it may take 5 (no message sent for 5 seconds, judged as suspicious) + 15 (suspicious nodes checked every 15 seconds) + 5 (`group_replication_member_expel_timeout`) = 25 seconds before the node is expelled. In the best case, it takes at least 5 + 5 = 10 seconds before the node is expelled.

GreatSQL optimizes this situation by adding the option `group_replication_communication_flp_timeout` (default: 5, minimum: 3, maximum: 60) to define how many seconds a node can go without sending messages before it is judged as suspicious. In addition, the failure detection thread is adjusted to check every 2 seconds (instead of the original 15 seconds). Therefore, in GreatSQL, expelling a suspicious node takes at least 3 (`group_replication_communication_flp_timeout`) + 5 (`group_replication_member_expel_timeout`) = 8 seconds, and at most 5 (`group_replication_communication_flp_timeout`) + 5 (`group_replication_member_expel_timeout`) + 2 (suspicious nodes checked every 2 seconds) = 12 seconds.

| System Variable Name  | group_replication_communication_flp_timeout |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | YES |
| Type      | Integer |
| Permitted Values |    [3 ~ 60] |
| Default       | 5 |

- When a new member node joins MGR, if the Clone method is chosen to replicate data, the node is automatically selected to replicate data from the member with the latest transaction data, effectively improving Clone speed and improving MGR service reliability. This feature is also supported when a newly joined node triggers the Clone method to replicate data.

The option `group_replication_donor_threshold` defines the transaction lag threshold for selecting the Donor node, with a value range of [1, MAX] and a default value of MAX. The MAX value depends on the CPU type: 2147483647 (2^31-1) on 32-bit systems and 9223372036854775807 (2^63-1) on 64-bit systems.

When a new member node joins MGR, it will only select nodes with lag less than `group_replication_donor_threshold` as the Donor node.

Assuming `group_replication_donor_threshold = 100`:
1. MGR now has two nodes A and B with GTIDs [1-300] and [1-280] respectively. New node C joins. Since the GTID difference between A and B is less than the preset threshold, either A or B is randomly selected as the Donor node.
2. MGR now has two nodes A and B with GTIDs [1-400] and [1-280] respectively. New node C joins. Since the GTID difference between A and B is greater than the preset threshold, only A is selected as the Donor node.
3. MGR now has three nodes A, B, and C with GTIDs [1-400], [1-350], and [1-280] respectively. New node D joins. Since node C's GTID difference is greater than the preset threshold, while the GTID lag of A and B is less than the preset threshold, either A or B is randomly selected as the Donor node.

| System Variable Name  | group_replication_donor_threshold |
| --- | --- |
| Variable Scope        | Global |
| Dynamic Variable      | YES |
| Type      | Integer |
| Permitted Values |    [1 ~ 9223372036854775807] |
| Default       | 9223372036854775807 |

- Optimizes the handling mechanism when compression exceeds the limit during MGR large transaction transmission.

When a large transaction in MGR exceeds the `group_replication_compression_threshold` threshold, LZ4 compression is triggered. However, due to the inherent limitations of LZ4, compression may fail with an error, causing the transaction to fail. An error similar to the following is reported:

```log
[GCS] Gcs_packet's payload is too big. Only packets smaller than 2113929216 bytes can be compressed. Payload size is 2197817290
```

GreatSQL has adjusted and optimized this mechanism to achieve the following two goals:

1. When the transaction size exceeds the `group_replication_compression_threshold` threshold, compression is started.

2. However, when the transaction size exceeds the LZ4 compression limit, an error is no longer reported. Instead, the original uncompressed transaction data is used for transmission, which is similar to the effect of setting `group_replication_compression_threshold=0` (compression disabled).

- Supports the majority write mechanism in AFTER mode.
- Solves the problem of MGR cluster blocking when disk space is full.
- Solves the problem of data loss in multi-primary mode or during primary switchover.
- Solves the problem of performance jitter when a node abnormally exits the cluster.
- Improves MGR throughput.
- Improves consistent read performance.
- Optimizes the problem of severe performance jitter that may occur when a node joins.
- Optimizes the manual primary election mechanism and solves the problem of failing to elect a primary due to long-running transactions.
- Improves the foreign key constraint mechanism in MGR, reducing or avoiding the risk of secondary nodes reporting errors and exiting MGR.
- Improves the speed of concurrent application and replay of large transactions on Secondary nodes.
- Optimizes the problem of severe performance jitter that may occur when a node joins.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
