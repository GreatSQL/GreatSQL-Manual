# Monitoring & Alerting
---

This article describes the main points to pay attention to when monitoring the GreatSQL database.

In addition to the regular service availability and performance monitoring, the following aspects are recommended for monitoring the GreatSQL database:

1. SQL average response time
2. Locks and waiting events
3. Large transactions
4. MGR monitoring

Below, we introduce these different monitoring dimensions in detail.

## SQL Average Response Time

In addition to TPS and QPS, the SQL average response time is also one of the important metrics for measuring database performance.

TPS and QPS are like how many cars can pass through the toll booth gate of a highway per minute, while the SQL average response time is the average time for each car to pass through the gate.

The former tests the processing capacity of the toll booth per unit time, and the latter is a dimension for measuring user experience.

The former can improve processing capacity by adding more gates (increasing concurrency); the latter needs to optimize the gate processing mechanism (optimizing the database & each SQL) to improve response efficiency.

In GreatSQL, the `benchmark()` function can be used to measure the SQL average response time:
```sql
greatsql> \help benchmark
Name: 'BENCHMARK'
Description:
Syntax:
BENCHMARK(count,expr)
...
Examples:
greatsql> SELECT BENCHMARK(1000000,AES_ENCRYPT('hello','goodbye'));
+---------------------------------------------------+
| BENCHMARK(1000000,AES_ENCRYPT('hello','goodbye')) |
+---------------------------------------------------+
|                                                 0 |
+---------------------------------------------------+
1 row in set (4.74 sec)
```
That is, call the `benchmark()` function to perform a fixed number of calculations, and use its time consumption as a metric for the SQL average response time.

And this value can be obtained during the idle period of the business as baseline data, and then compared with the time consumption during the business peak period, to know how much the SQL average response time increased during the business peak period and how much the efficiency decreased.

For example:
```bash
$ time mysql -q -N -s -e "SELECT BENCHMARK(100000,AES_ENCRYPT('hello','goodbye'))"
0

real    0m0.024s
user    0m0.001s
sys     0m0.004s
```

This gives a time consumption of 0.024s, which can be considered that the current SQL average response time is 24ms. By obtaining this value at different times through the monitoring system, the fluctuation range of this metric can be known.

## Locks and Waiting Events

### Current number of row locks
```sql
greatsql> SELECT * FROM performance_schema.global_status WHERE variable_name = 'Innodb_row_lock_current_waits';
+-------------------------------+----------------+
| VARIABLE_NAME                 | VARIABLE_VALUE |
+-------------------------------+----------------+
| Innodb_row_lock_current_waits | 0              |
+-------------------------------+----------------+
```
When this value is greater than 0, an alert must be issued immediately, indicating that a row lock wait event currently exists. Check whether there is a transaction holding row locks that has not been released.

### InnoDB buffer pool wait free
```sql
greatsql> SELECT * FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_wait_free';
+-------------------------------+----------------+
| VARIABLE_NAME                 | VARIABLE_VALUE |
+-------------------------------+----------------+
| Innodb_buffer_pool_wait_free  | 0              |
+-------------------------------+----------------+
```
When this value is greater than 0, an alert must be issued immediately, indicating that the InnoDB Buffer Pool is seriously insufficient. If physical memory is sufficient, increase it appropriately, or migrate to a server with more memory.

### InnoDB log wait
```sql
greatsql> SELECT * FROM performance_schema.global_status WHERE variable_name = 'Innodb_log_waits';
+------------------+----------------+
| VARIABLE_NAME    | VARIABLE_VALUE |
+------------------+----------------+
| Innodb_log_waits | 0              |
+------------------+----------------+
```
When this value is greater than 0, an alert must be issued immediately, indicating that the InnoDB Log Buffer is seriously insufficient. If physical memory is sufficient, increase it appropriately, or migrate to a server with more memory.

### InnoDB Purge Lag
```sql
greatsql> SELECT `COUNT`,`COMMENT` FROM information_schema.INNODB_METRICS WHERE NAME = 'trx_rseg_history_len';
+-------+-------------------------------------+
| COUNT | COMMENT                             |
+-------+-------------------------------------+
|    14 | Length of the TRX_RSEG_HISTORY list |
+-------+-------------------------------------+

greatsql> pager cat - | grep -i 'History list length'
PAGER set to 'cat - | grep -i 'History list length''

-- Or view it in another way
greatsql> SHOW ENGINE INNODB STATUS\G
History list length 4
```
When this value exceeds 2000, an alert must be issued immediately, indicating that the queue waiting to be purged is large. Check whether there is a physical I/O bottleneck, or whether a large transaction has been committed.

## Large Transactions

In production environments, large transactions or transactions that run for a long time may occur for various reasons.

These transactions may perform a large number of modification operations on the database, needing to hold resources such as row locks and MDL locks. If the transactions are not committed/rolled back for a long time, other business requests may be seriously affected, and these requests may be blocked for a long time.

Therefore, attention needs to be paid to running large transactions and long transactions. Once they exceed the threshold, an alert should be issued.
```sql
-- Find the transaction that has been active the longest
SELECT * FROM information_schema.INNODB_TRX ORDER BY trx_started ASC LIMIT 1;

-- Find the transaction that has been waiting the longest
SELECT * FROM sys.innodb_lock_waits ORDER BY wait_age_secs DESC LIMIT 1;

-- Find transactions that need special attention
SELECT * FROM information_schema.INNODB_TRX WHERE
  trx_lock_structs >= 5 OR    -- Holds more than 5 locks
  trx_rows_locked >= 100 OR   -- More than 100 rows are locked
  trx_rows_modified >= 100 OR -- More than 100 rows are modified
  TIME_TO_SEC(TIMEDIFF(NOW(),trx_started)) > 100;    -- The transaction has been active for more than 100 seconds
```
The above thresholds can be adjusted according to the actual situation. Active large transactions in the production environment need to be kept under attention to avoid chain effects.

## MGR Monitoring

For MGR, in addition to monitoring its service status, it is more important to monitor the transaction delay between nodes, to judge the transaction processing capability of each node, and to evaluate whether the server configuration level needs to be upgraded.
```sql
greatsql> SELECT MEMBER_ID AS id, COUNT_TRANSACTIONS_IN_QUEUE AS trx_tobe_certified,
  COUNT_TRANSACTIONS_REMOTE_IN_APPLIER_QUEUE AS relaylog_tobe_applied,
  COUNT_TRANSACTIONS_CHECKED AS trx_chkd,
  COUNT_TRANSACTIONS_REMOTE_APPLIED AS trx_done,
  COUNT_TRANSACTIONS_LOCAL_PROPOSED AS proposed
  FROM performance_schema.replication_group_member_stats;
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
| id                                   |trx_tobe_certified |relaylog_tobe_applied| trx_chkd | trx_done | proposed |
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
| 4ebd3504-11d9-11ec-8f92-70b5e873a570 |                 0 |                   0 |   422248 |        6 |   422248 |
| 549b92bf-11d9-11ec-88e1-70b5e873a570 |                 0 |              238391 |   422079 |   183692 |        0 |
| 5596116c-11d9-11ec-8624-70b5e873a570 |              2936 |              238519 |   422115 |   183598 |        0 |
| ed5fe7ba-37c2-11ec-8e12-70b5e873a570 |              2976 |              238123 |   422167 |   184044 |        0 |
+--------------------------------------+-------------------+---------------------+----------+----------+----------+
```
Among them, the value of `relaylog_tobe_applied` indicates the transaction queue waiting to be replayed after remote transactions are written to the Relay Log, and `trx_tobe_certified` indicates the size of the transaction queue waiting to be certified. If either of these two values is greater than 0, it indicates that there is a certain degree of delay currently, and an alert should be issued.

You can also pay attention to the changes in the above two values, to see whether the two queues are gradually increasing or decreasing, and use this to judge whether the Primary node is "running too fast" or whether the Secondary node is "running too slow".

If the `relaylog_tobe_applied` value on a certain node is especially large, attention needs to be paid. Check whether the business pressure on this node is too high, or whether there is a problem with the server configuration.

In GreatSQL, the following status variables are added for the MGR applier thread:

1. `group_replication_apply_queue_size`: the size of the message queue not yet processed in the applier thread. If this value accumulates to a large amount, it indicates that the current node may have a large delay, i.e., a large amount of transaction data has not yet been written to the Relay Log.

2. `group_replication_applied_messages`: the total number of messages cumulatively applied by the applier thread. This includes transaction messages of user data and various other messages generated during group replication operation.

3. `group_replication_applied_data_messages`: the total number of user data transaction messages cumulatively applied by the applier thread, i.e., the total number of transactions already written to the Relay Log. By comparing with `group_replication_applied_messages`, the proportion of transaction messages can be analyzed.

4. `group_replication_applied_events`: the total number of Binlog Events of user data transactions cumulatively applied by the applier thread. By comparing with `group_replication_applied_data_messages`, it can be estimated how many Binlog Events a transaction roughly writes on average.

5. `group_replication_io_buffered_events`: when the applier thread writes transaction data to the Relay Log, it performs batch processing to reduce the number of disk flush operations and improve disk utilization. This variable indicates the cumulative number of Binlog Events buffered in the IO buffer that have not been flushed to disk. By comparing with `group_replication_applied_events`, it can be estimated how many Events roughly trigger one disk flush, analyzing the Relay Log disk utilization.

6. `group_replication_before_commit_request_time`: used to count the time consumed at the MGR layer during the transaction commit phase. Related to it is `group_replication_flow_control_time`, which counts the total time consumed due to flow control during the commit phase of all transactions when flow control is enabled. `group_replication_before_commit_request_time` does not include the time of `group_replication_flow_control_time`, i.e., the actual total time consumed by MGR is `group_replication_before_commit_request_time` + `group_replication_flow_control_time`.



For more details on MGR monitoring, refer to the document: [MGR Status Monitoring](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-MGR/deep-dive-MGR-06.md).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
