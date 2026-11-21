# MGR Performance Tuning

---

This article describes the content related to MGR performance tuning.

## Performance Bottlenecks
In the MGR architecture, there may be many factors that affect overall performance, including some common performance bottleneck points in local nodes, as well as those generated at the MGR layer.

Generally speaking, the causes of MGR performance bottlenecks may include the following situations:
1. An individual node in the cluster has a performance bottleneck.
2. Inappropriate flow control thresholds limit performance.
3. Defects in the official version's flow control algorithm cause large performance fluctuations.
4. Large transactions cause delay, or even node exit.
5. The network becomes a bottleneck, causing large message delays.
6. Other common GreatSQL performance bottlenecks.

Next, we analyze the bottlenecks for the above situations respectively and give optimization suggestions.

## Optimization Suggestions
### An Individual Node Has a Performance Bottleneck
In MGR, the server configuration levels of each node may differ, and the business pressure they can bear may also differ. Therefore, each node may have different transaction delays, or the backlog of transactions waiting to be applied may grow more and more.

In this case, the most effective way is to upgrade the server configuration level of that node to improve its business carrying capacity. At the same time, you should also check whether there are unreasonable GreatSQL configuration options, and you can consider setting both the options `innodb_flush_log_at_trx_commit` and `sync_binlog` to 0 to reduce the disk I/O load of that node and improve transaction application efficiency.

In GreatSQL, you can also set the option `group_replication_single_primary_fast_mode = 1` (all nodes must be set this way) to enable the fast single-primary mode and improve MGR transaction application efficiency.

### Inappropriate Flow Control
The native flow control mechanism has obvious defects: the actual flow control effect is very limited and may even have a counterproductive effect. Therefore, it is not recommended to enable the native flow control mechanism, that is, set the option `group_replication_flow_control_mode = DISABLED`.

In GreatSQL, in addition to disabling flow control, you only need to set the option `group_replication_flow_control_replay_lag_behind = 600` to control the replication delay threshold between MGR primary and secondary nodes. When the delay between MGR primary and secondary nodes exceeds the threshold due to large transactions or other reasons, the optimized new flow control mechanism will be triggered.

### Delay Caused by Large Transactions
When a large transaction is generated on the Primary, it is easy for the Secondary to have delay while applying the large transaction.

Therefore, you should try to avoid executing large transactions. You can split large transactions into multiple smaller transactions. For example, when executing `LOAD DATA` to import a large amount of data, you can split the import file into multiple smaller files.

In addition, you can appropriately lower the threshold of `group_replication_transaction_size_limit` to limit transaction size.

You can also monitor transaction status to prevent individual transactions from running for too long:
```sql
-- The transaction with the longest active time
SELECT * FROM information_schema.innodb_trx ORDER BY trx_started ASC LIMIT N;

-- The transaction with the longest waiting time
SELECT * FROM sys.innodb_lock_waits ORDER BY wait_age_secs DESC LIMIT N;

-- Large transactions that need special attention
SELECT * FROM information_schema.innodb_trx WHERE
  trx_lock_structs >= 5 OR    -- more than 5 locks
  trx_rows_locked >= 100 OR   -- more than 100 rows locked
  trx_rows_modified >= 100 OR -- more than 100 rows modified
  TIME_TO_SEC(TIMEDIFF(NOW(),trx_started)) > 100;    -- the transaction has been active for more than 100 seconds
```
Of course, the thresholds of the above monitoring SQL statements can be adjusted appropriately according to the actual situation.

### Network Bottleneck
Generally speaking, it is best to run MGR on a LAN, or even in the same VLAN, so that the network quality is as guaranteed as possible.

If you suspect that poor network quality is causing MGR performance problems, you can set the option `group_replication_request_time_threshold` to record MGR performance bottlenecks caused by large network latency (this option only exists in GreatSQL, not in MySQL). The unit of this option is milliseconds. If it is on a LAN, it can be set to about 10-50 (milliseconds); if the network quality is poor or it is a cross-public-network environment, it can be set between 100-10000 (i.e. 100 milliseconds - 10 seconds).

### Other GreatSQL Performance Bottleneck Factors
For performance bottlenecks caused by other factors, refer to this article [A Comprehensive MySQL Optimization Reference (Part 1)](https://mp.weixin.qq.com/s/V51yKzCKUSIm28sMhvQl8Q) and [A Comprehensive MySQL Optimization Reference (Part 2)](https://mp.weixin.qq.com/s/p2IBlGguf4Vaq_AO_jja9A).


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
