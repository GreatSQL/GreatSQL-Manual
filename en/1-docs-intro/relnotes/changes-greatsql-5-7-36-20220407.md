# Changes in GreatSQL 5.7.36 (2022-4-7)

## New Features
### New MGR Role Column
In MySQL 5.7, when querying `performance_schema.replication_group_members`, there is no `MEMBER_ROLE` column, which makes it inconvenient to quickly identify which node is the Primary Node.

In GreatSQL, this column has been added, making it easier to view node roles and providing better support for certain middleware.
```
mysql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+
| group_replication_applier | 4c21e81e-953f-11ec-98da-d08e7908bcb1 | 127.0.0.1   |        3308 | ONLINE       | SECONDARY   |
| group_replication_applier | b5e398ac-8e33-11ec-a6cd-d08e7908bcb1 | 127.0.0.1   |        3306 | ONLINE       | PRIMARY     |
| group_replication_applier | b61e7075-8e33-11ec-a5e3-d08e7908bcb1 | 127.0.0.1   |        3307 | ONLINE       | SECONDARY   |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+
```

### A New Flow Control Mechanism
The native flow control algorithm has significant flaws: after the flow control threshold is triggered, there is a brief flow control pause, after which transactions are allowed through again. This causes a 1-second performance jitter and does not really provide sustained flow control.

In GreatSQL, the flow control algorithm has been redesigned. The source-replica delay is added to calculate the flow control threshold, and large transaction processing and synchronization between the primary and secondary nodes are also taken into account. The flow control granularity is finer, and the 1-second small jitter problem of the MySQL community version does not occur.

The new option `group_replication_flow_control_replay_lag_behind` is used to control the replication delay threshold of MGR primary and secondary nodes. When the delay between MGR primary and secondary nodes exceeds the threshold due to large transactions or other reasons, the flow control mechanism is triggered.

| System Variable Name	| group_replication_flow_control_replay_lag_behind |
| --- | --- | 
| Variable Scope	| global |
| Dynamic Variable	| YES |
| Permitted Values |	[0 ~ ULONG_MAX] |
| Default	| 600 |
| Description	| Used to control the replication delay threshold of MGR primary and secondary nodes. When the delay between MGR primary and secondary nodes exceeds the threshold due to large transactions or other reasons, the flow control mechanism is triggered. |

The default value of this option is 600 seconds, and it can be modified dynamically online, for example:
```sql
mysql> SET GLOBAL group_replication_flow_control_replay_lag_behind = 600;
```
Under normal circumstances, this parameter does not need to be adjusted.

### New MGR Network Overhead Threshold
A new option `group_replication_request_time_threshold` has been added.

In an MGR architecture, the cost of a transaction includes both the network layer overhead and local resource (such as CPU, disk I/O, etc.) overhead. GreatSQL has performed a number of optimizations on the network layer overhead of MGR, so the network layer is usually not the bottleneck.

When a transaction responds slowly and you want to analyze the performance bottleneck, you can first determine whether it is caused by the network layer overhead or by local performance bottlenecks. By setting the option `group_replication_request_time_threshold`, events that exceed the threshold can be recorded for further analysis. The output is recorded in the error log, for example:
```
[Note] Plugin group_replication reported: 'MGR request time:33775'
```
This means that the network overhead of this transaction at the MGR layer took 33.775 milliseconds. You can then check the network monitoring during that period to analyze the cause of the high network latency.

The unit of the option `group_replication_request_time_threshold` is microseconds. The default value is 0, the minimum value is 0, the maximum value is 100000000, and the recommended value is 20000 (i.e., 20 milliseconds).

| System Variable Name	| group_replication_request_time_threshold |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| YES |
| Permitted Values |	[0 ~ 100000000] |
| Default	| 0 |
| Description	|Unit: microseconds.<br/>Sets the threshold. When the MGR-layer network overhead of a transaction exceeds this threshold, a record is output to the error log.<br/>When set to 0, this feature is disabled.<br/>Enable it only when you suspect that excessive MGR communication time has become a transaction performance bottleneck; it is not recommended to enable it in normal circumstances.|

### Adjusted MGR Large Transaction Limit
The MGR transaction limit option `group_replication_transaction_size_limit` has been adjusted, with a default value of 150000000 (which is also the maximum value).

In MySQL 5.7, MGR transactions are not sharded. Executing large transactions can easily cause timeouts (and repeatedly resend transaction data), eventually causing nodes to report errors and leave the cluster.

In GreatSQL 5.7, this problem has been optimized, and a transaction size limit has been set. Transactions exceeding this limit fail and roll back, but nodes no longer leave the cluster.

**Note**: this is a **hard limit**. Even if it is set to 0, it will be automatically adjusted to 150000000.
```
mysql> set global group_replication_transaction_size_limit = 150000001;
Query OK, 0 rows affected, 1 warning (0.00 sec)

-- The value was reset
mysql> show warnings;
+---------+------+-------------------------------------------------------------------------+
| Level   | Code | Message                                                                 |
+---------+------+-------------------------------------------------------------------------+
| Warning | 1292 | Truncated incorrect group_replication_transaction_si value: '150000001' |
+---------+------+-------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> set global group_replication_transaction_size_limit=0;
Query OK, 0 rows affected (0.00 sec)

-- No error or warning, but it was also reset
mysql> select @@global.group_replication_transaction_size_limit;
+---------------------------------------------------+
| @@global.group_replication_transaction_size_limit |
+---------------------------------------------------+
|                                         150000000 |
+---------------------------------------------------+
```

When an oversized transaction is executed, the following error is reported:
```
ERROR 3100 (HY000): Error on observer while running replication hook 'before_commit'.
```

Taking the table generated by the test tool sysbench as an example, the upper limit of data rows that a transaction can insert in batches at one time is about 732,000 records:
```
mysql> insert into t1 select * from sbtest1 limit 732000;
Query OK, 732000 rows affected (16.07 sec)
Records: 732000  Duplicates: 0  Warnings: 0

mysql> insert into t1 select * from sbtest1 limit 733000;
ERROR 3100 (HY000): Error on observer while running replication hook 'before_commit'.
```

If a large transaction executes successfully, a log similar to the following is also recorded, telling the byte size of the transaction:
```
[Note] Plugin group_replication reported: 'large transaction size:149856412'
```

| System Variable Name	| group_replication_transaction_size_limit |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| YES |
| Permitted Values |	[0 ~ 150000000] |
| Default	| 150000000 |
| Description	|Sets the large transaction threshold. When an MGR transaction exceeds this threshold, a record is output to the error log.|

## Stability Improvements
1. Fixed the severe performance jitter problem under abnormal conditions (node crash, node shutdown, network partitioning).
2. Improved the long blocking problem caused by several large transactions.

## Performance Improvements
1. Redesigned the transaction certification queue cleanup algorithm. In the MySQL community version, a full-table-scan-like algorithm is used to clean up the transaction certification queue, resulting in low cleanup efficiency and large performance jitter. In GreatSQL, an index-like mechanism has been added to the transaction certification queue, and the time of each cleanup is controlled, effectively solving the problems of low cleanup efficiency and large performance jitter.
2. Improved the speed of concurrent application and replay of large transactions on Secondary nodes.
3. Increased XCom cache entries, improving performance in scenarios with high network latency or slow transaction application.

## Bug Fixes
01. Fixed the issue where bind unexpectedly failed when DNS or hostname was enabled.
02. Fixed the issue of unreasonable coroutine scheduling, which could cause the system to mistakenly determine network errors when handling large transactions.
03. Fixed the issue where connections were closed prematurely due to write timeouts while a newly joined node was catching up on Paxos data.
04. Fixed the data anomaly caused when a recovering node was stopped midway.
05. Fixed the issue of possible data loss in multi-primary multi-write mode in some cases.
06. Fixed the issue where multiple nodes started simultaneously and remained in the recovering state in some special scenarios.
07. Fixed a strange problem with the applier thread in special scenarios.
08. Fixed the infinite loop caused by thread creation failures under high concurrency.
09. Fixed the issue where one secondary node hanging dragged down the entire cluster.
10. Fixed the strange problem caused by TCP self-connect in the scenario of deploying multiple nodes on a single machine.
11. Fixed the view problem caused by multiple simultaneous exceptions.
12. Fixed the view problem caused by simultaneously restarting 5 or more nodes (one node would remain in the recovering state).
13. Fixed the issue where adding nodes simultaneously failed in some scenarios.
14. Fixed the abnormal group view problem in special scenarios.


## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)




**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
