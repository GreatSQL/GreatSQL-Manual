# Changes in GreatSQL 8.0.25-16 (2022-5-16)
---

## New Features
### New Arbitrator (Voting Node) Role
This node only participates in MGR voting and arbitration. It does not store actual data and does not need to perform DML operations, so a server of general configuration level can be used, reducing server costs while ensuring MGR reliability.

The new parameter `group_replication_arbitrator` is used to set up an arbitrator node.

To add an arbitrator node, simply add the following configuration to the `my.cnf` configuration file:
`group_replication_arbitrator = true`

When only Arbitrator nodes remain in the cluster, they automatically exit.
```
greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+----------------------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION | MEMBER_COMMUNICATION_STACK |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+----------------------------+
| group_replication_applier | 4b2b46e2-3b13-11ec-9800-525400fb993a | 172.16.16.16 |        3306 | ONLINE       | SECONDARY   | 8.0.27         | XCom                       |
| group_replication_applier | 4b51849b-3b13-11ec-a180-525400e802e2 | 172.16.16.10 |        3306 | ONLINE       | ARBITRATOR  | 8.0.27         | XCom                       |
| group_replication_applier | 4b7b3b88-3b13-11ec-86e9-525400e2078a | 172.16.16.53 |        3306 | ONLINE       | PRIMARY     | 8.0.27         | XCom                       |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+----------------------------+
```
As you can see, the `MEMBER_ROLE` column displays **ARBITRATOR**, indicating that this node is an arbitrator node.

Now let's look at the load data of each node during stress testing. First, the **Primary** node:
```
$ top
...
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
20198 mysql     20   0   11.9g   3.4g  23440 S 207.6 21.6  21:33.48 mysqld

$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  3      0   5637    152   6385    0    0     0 56311 53024 53892 36 17 43  3  0
 0  3      0   5633    152   6389    0    0     0 46053 51900 52435 35 17 44  4  0
 6  0      0   5628    152   6393    0    0     0 47024 52026 52388 36 17 44  3  0
 7  1      0   5623    152   6397    0    0     0 51673 52165 53113 36 17 43  3  0
 3  1      0   5621    152   6401    0    0     0 44231 52164 52875 35 17 45  3  0
 3  4      0   5616    152   6404    0    0     0 49278 52854 53139 37 17 43  3  0
 4  0      0   5613    152   6408    0    0     0 49738 52848 53361 37 17 43  3  0
```

On one of the **Secondary** nodes:
```
$ top
...
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
26824 mysql     20   0   11.6g   3.0g  22880 S 175.7 19.4  19:27.34 mysqld

$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  0      0   2089    128  10757    0    0     0 53671 31463 46803 30 11 55  4  0
 3  0      0   2082    128  10765    0    0     0 52737 31475 45862 30 11 55  4  0
 2  0      0   2073    128  10772    0    0     0 52121 31035 45820 29 12 55  4  0
 3  0      0   2065    128  10781    0    0     0 51469 31081 44831 30 12 55  4  0
 1  0      0   2057    128  10788    0    0     0 53071 31442 45664 30 11 55  4  0
 3  0      0   2049    128  10795    0    0     0 51357 29848 43391 30 12 54  4  0
 0  0      0   2041    128  10803    0    0     0 52404 30545 45020 29 12 56  4  0
 3  0      0   2034    128  10811    0    0     0 51355 31483 45582 32 12 53  3  0
```

On the **Arbitrator** node:
```
$ top
...
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
16997 mysql     20   0   11.2g   2.5g  22184 S  29.6 16.4   3:47.84 mysqld

$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0   6145    141   7095    0    0     0    44 17767 16010  4  4 93  0  0
 1  0      0   6146    141   7095    0    0     0     0 17020 16189  4  4 93  0  0
 0  0      0   6144    141   7095    0    0     0     0 16958 15365  3  4 93  0  0
 0  0      0   6145    141   7095    0    0     0     0 15942 14969  3  3 93  0  0
 1  0      0   6146    141   7095    0    0     0     0 17698 16320  4  4 92  0  0
```
It can be seen that the load is much lower, which means multiple arbitrator node roles can run on a single server.

**Note:** In the presence of an arbitrator node, when switching from single-primary mode to multi-primary mode, the voting nodes need to be shut down first before switching; otherwise, the switch may fail and the arbitrator node may report an error and exit MGR.

### New Fast Single-Primary Mode
GreatSQL adds a new working mode: **fast single-primary mode**. In this mode, the original MySQL MGR certification database approach is no longer used. The new option `group_replication_single_primary_fast_mode` is used to set whether it is enabled and which specific mode is used.

Fast single-primary mode is especially suitable for scenarios such as cross-data-center deployment, stress testing, and low memory requirements. This mode is weaker than traditional asynchronous replication but stronger than semi-synchronous replication, and it does not have the problem that MGR's default certification database may consume a large amount of memory.

**Reminder**: when fast single-primary mode is enabled, multi-primary mode is not supported; all nodes must be set identically, otherwise the cluster cannot start.

The option `group_replication_single_primary_fast_mode` accepts values 0, 1, and 2, which respectively mean:
- 0: fast single-primary mode is not used. This is the default value.
- 1: fast single-primary mode is used, with concurrent replay supported. **It is strongly recommended to set it to 1, i.e., enable fast single-primary mode**.
- 2: fast single-primary mode is used, but parallel replay is not supported; it accelerates Relay Log flushing to disk and makes replicas consume fewer resources.

| System Variable Name    | group_replication_single_primary_fast_mode |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Permitted Values |    0<br/>1<br/>2 |
| Default    | 0 |
| Description    | Sets whether fast single-primary mode is enabled. It is strongly recommended to enable it (i.e., set it to 1).|

**Reminder:** Since MySQL 8.0.27, a **single leader** mode has been added (corresponding to the `group_replication_paxos_single_leader` option). Do not enable this feature, because enabling it may cause the risk of overall MGR cluster crash. GreatSQL's optimizations for MGR already include this aspect of optimization work.


### New MGR Network Overhead Threshold
A new option `group_replication_request_time_threshold` has been added.

In an MGR architecture, the cost of a transaction includes both the network layer overhead and local resource (such as CPU, disk I/O, etc.) overhead. When a transaction responds slowly and you want to analyze the performance bottleneck, you can first determine whether it is caused by the network layer overhead or by local performance bottlenecks. By setting the option `group_replication_request_time_threshold`, events that exceed the threshold can be recorded for further analysis. The output is recorded in the error log, for example:
```
[Note] Plugin group_replication reported: 'MGR request time:30808us, server id:3306879, thread_id:17368'
```
This means that the network overhead of this transaction at the MGR layer took 30808 microseconds (30.808 milliseconds). You can then check the network monitoring during that period to analyze the cause of the high network latency.

The unit of the option `group_replication_request_time_threshold` is milliseconds, with a default value of 0, a minimum value of 0, and a maximum value of 100000. If MGR runs in a LAN environment, it is recommended to set it to the 50~100 millisecond range; if it runs in a cross-public-network environment, it is recommended to set it to about 1~10 seconds. In addition, when the value is set between 1 and 9, it is automatically adjusted to 10 (milliseconds) without a warning; if set to 0, the feature is disabled.

| System Variable Name    | group_replication_request_time_threshold |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | YES |
| Permitted Values |    [0 ~ 100000] |
| Default    | 0 |
| Description    |Unit: milliseconds.<br/>Sets the threshold. When the MGR-layer network overhead of a transaction exceeds this threshold, a record is output to the error log.<br/>When set to 0, the feature is disabled.<br/>Enable it only when you suspect that excessive MGR communication time has become a transaction performance bottleneck; it is not recommended to enable it in normal circumstances.|

### Custom Primary Election Mode
The automatic primary election mechanism has been improved, adding election based on the latest GTID, to avoid automatically selecting a node without the latest GTID as the new primary.

By default, MGR elects the primary according to the following rules:
1. When nodes of different versions of MySQL 5.7 and MySQL 8.0 are deployed in a mixed cluster, only nodes running 5.7 are selected as the primary. In addition, for versions <= MySQL 8.0.16, sorting is by major version number, i.e., 5.7 comes before 8.0. For versions > MySQL 8.0.17, sorting is by patch version number, i.e., 8.0.17 comes before 8.0.25.
2. When all nodes have the same version number, sorting is by node weight (the option `group_replication_member_weight` defines the weight value; this option does not exist in 5.7 and was added starting from 8.0), with higher-weight nodes ranked first.
3. Sorting by node `server_uuid`.

In some cases, when all MGR nodes need to be restarted unexpectedly, the transaction application state of each node is not checked, and a wrong new primary may be selected, which may lead to the loss of some transaction data. Or when the original primary crashes and a new primary needs to be elected by voting, a node with a higher weight but without the latest transactions may be selected, which also carries the risk of losing some transaction data.

In GreatSQL, a new option `group_replication_primary_election_mode` is added for custom primary election policies. The available values are:
- WEIGHT_ONLY: automatic primary election still follows the traditional mode described above. This is the default value.
- GTID_FIRST: the transaction application state of each node is checked first, and the node with the latest transactions is automatically selected as the new primary. **It is recommended to set this mode.**
- WEIGHT_FIRST: the traditional mode takes priority; if no suitable result is found, the transaction state of each node is then checked.

**Reminder**: all nodes must be configured identically, otherwise the cluster cannot start.

| System Variable Name    | group_replication_primary_election_mode |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Permitted Values |    WEIGHT_ONLY<br/>GTID_FIRST<br/>WEIGHT_FIRST |
| Default    | WEIGHT_ONLY |
| Description    | Specifies the voting strategy to use when the MGR cluster needs to vote for primary election.|

## Stability Improvements
1. Optimized the problem of severe performance jitter that could occur when nodes join.
2. Optimized the manual primary election mechanism, solving the problem of being unable to elect a primary caused by long transactions.
3. Improved the foreign key constraint mechanism in MGR, reducing or avoiding the risk of secondary nodes reporting errors and exiting MGR.

## Other Adjustments
1. Added the option `group_replication_communication_flp_timeout` (unit: seconds, default value: 5). When the majority of nodes do not receive a message from a certain node beyond this threshold, the node is judged as a suspect node. In environments with poor network conditions, this threshold can be appropriately increased to avoid frequent jitter.

In MySQL MGR, MGR nodes exchange messages periodically. When no message is received from a node for more than 5 seconds (a fixed value), the node is marked as suspect (SUSPICION). After a faulty node is confirmed as suspect, it continues to wait for `group_replication_member_expel_timeout` seconds before reporting a timeout and expelling the node from MGR.

GreatSQL adds the `group_replication_communication_flp_timeout` option to control the timeout for detecting the suspect state, replacing the official fixed 5-second value.

Setting this parameter smaller allows suspect node states to be detected faster; combined with the `group_replication_member_expel_timeout` option, faulty nodes can be expelled faster.

Under normal circumstances, this parameter does not need to be configured.
2. Added the option `group_replication_zone_id_sync_mode` (type: boolean, allowed values: ON/OFF, default value: ON). If `group_replication_zone_id` is set to enable the zone tag feature, all nodes need to be guaranteed to synchronize data. But when `group_replication_zone_id_sync_mode = OFF`, the zone tag is only a marker and no longer guarantees that all nodes synchronize data.
3. The default value of the option `group_replication_flow_control_replay_lag_behind` was adjusted from 60 seconds to 600 seconds to accommodate more business scenarios. This option is used to control the replication delay threshold of MGR primary and secondary nodes. When the delay between MGR primary and secondary nodes exceeds the threshold due to large transactions or other reasons, the flow control mechanism is triggered.


## Bug Fixes
01. Fixed the InnoDB parallel query crash problem ([issue#I4J1IH](https://gitee.com/GreatSQL/GreatSQL/issues/I4J1IH)).
02. Fixed the issue where bind unexpectedly failed when DNS or hostname was enabled.
03. Fixed the issue of unreasonable coroutine scheduling, which could cause the system to mistakenly determine network errors when handling large transactions.
04. Fixed the issue where connections were closed prematurely due to write timeouts while a newly joined node was catching up on Paxos data.
05. Fixed the data anomaly caused when a recovering node was stopped midway.
06. Fixed the view problem caused by multiple simultaneous exceptions.
07. Fixed the issue where adding nodes simultaneously failed in some scenarios.
08. Fixed the abnormal group view problem in special scenarios.
09. Fixed the crash caused by member_stats-related queries during the rejoin process.
10. Fixed the issue that could cause assert failures in BEFORE mode.
11. Fixed the problem of potentially long waits when executing `stop group_replication`.
12. Fixed the infinite loop that could be caused by importing binlogs generated in a traditional source-replica environment into MGR.
13. Fixed the crash caused by memory allocation failure for large transactions.

## GreatSQL VS MySQL Community Edition

| Feature | GreatSQL 8.0.25-16| MySQL 8.0.25 Community Edition |
|---| --- | --- |
| Voting node/Arbitrator node | ✅ | ❎ |
| Fast single-primary mode | ✅ | ❎ |
| Zone tags | ✅ | ❎ |
| New flow control algorithm | ✅ | ❎ |
| InnoDB parallel query optimization | ✅ | ❎ |
| Thread Pool | ✅ | ❎ |
|Auditing| ✅ | ❎ |
| InnoDB transaction lock optimization | ✅ | ❎ |
|SEQUENCE_TABLE(N) function|✅ | ❎ |
|InnoDB corrupted table exception handling|✅ | ❎ |
|Force InnoDB engine tables only|✅ | ❎ |
|Kill idle transactions to avoid long lock waits|✅ | ❎ |
|Data Masking|✅ | ❎ |
|InnoDB fragmented page statistics enhancement|✅ | ❎ |
|MyRocks engine support|✅ | ❎ |
| InnoDB I/O performance |  ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️ | 
| Network partition exception handling |  ⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Improved abnormal node exit handling |   ⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Consistent read performance |   ⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Improved MGR throughput |⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Statistics enhancement |⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Slow Query Log enhancement |⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Large transaction handling |   ⭐️⭐️⭐️⭐️ | ⭐️ | 
| Fixed risk of data loss in multi-write mode | ⭐️⭐️⭐️⭐️⭐️ | /  | 
| Fixed risk of data loss during primary switchover in single-primary mode | ⭐️⭐️⭐️⭐️⭐️ | / | 
|  MGR cluster startup efficiency improvement | ⭐️⭐️⭐️⭐️⭐️ |  / | 
| Handling of full cluster node disks |   ⭐️⭐️⭐️⭐️⭐️ | /  | 
| Fixed TCP self-connect problem| ⭐️⭐️⭐️⭐️⭐️ | / | 
| PROCESSLIST enhancement | ⭐️⭐️⭐️⭐️⭐️ | /  | 

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
