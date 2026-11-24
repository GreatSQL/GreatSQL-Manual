# MGR Arbitrator Node
---

## Introduction

GreatSQL introduces a new role: the Arbitrator node (voting node), enabling high availability goals to be achieved at lower server cost.

This node only participates in MGR voting and arbitration. It does not participate in MGR transaction certification, does not store actual data (it does not need to store all user table data, only the necessary system tables), and does not need to execute DML operations (it does not need to store Binlog, nor dump and apply Relay Log). Therefore, a server with ordinary configuration can be used, reducing server cost while ensuring MGR reliability.

The new parameter `group_replication_arbitrator` is used to set an arbitrator node.

To set a member node as an arbitrator role, with other MGR-related parameters already configured, add the following configuration to the `my.cnf` configuration file:

```ini
[mysqld]
group_replication_arbitrator=ON
```

Then start the MGR service, and the node will automatically join the MGR cluster. Check the MGR member node status:

```sql
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+----------------------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION | MEMBER_COMMUNICATION_STACK |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+----------------------------+
| group_replication_applier | 4b2b46e2-3b13-11ec-9800-525400fb993a | 172.16.16.16 |        3306 | ONLINE       | SECONDARY   | 8.0.32          | XCom                       |
| group_replication_applier | 4b51849b-3b13-11ec-a180-525400e802e2 | 172.16.16.10 |        3306 | ONLINE       | ARBITRATOR  | 8.0.32          | XCom                       |
| group_replication_applier | 4b7b3b88-3b13-11ec-86e9-525400e2078a | 172.16.16.53 |        3306 | ONLINE       | PRIMARY     | 8.0.32          | XCom                       |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+----------------------------+
```

It can be seen that the `MEMBER_ROLE` column displays **ARBITRATOR**, indicating that this node is an arbitrator node.

::: tip Note
When only the Arbitrator node remains in the MGR cluster, it will automatically exit. Manual intervention is required to restart the MGR cluster.
:::

## Lower Load on Arbitrator Nodes

Run a [sysbench performance benchmark](../10-optimize/3-1-benchmark-sysbench.md) on an MGR cluster that includes an arbitrator node, and observe the load data of each node during the benchmark.

First, look at the Primary node:

```bash
$ top

...
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
20198 mysql     20   0   11.9g   3.4g  23440 S 207.6 21.6  21:33.48 mysqld

$ vmstat -S m 1

...
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

Then observe the Secondary node:

```bash
$ top

...
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
26824 mysql     20   0   11.6g   3.0g  22880 S 175.7 19.4  19:27.34 mysqld

$ vmstat -S m 1

...
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

Continue to observe and compare the Arbitrator node:
```bash
$ top

...
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
16997 mysql     20   0   11.2g   2.5g  22184 S  29.6 16.4   3:47.84 mysqld

$ vmstat -S m 1

...
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0   6145    141   7095    0    0     0    44 17767 16010  4  4 93  0  0
 1  0      0   6146    141   7095    0    0     0     0 17020 16189  4  4 93  0  0
 0  0      0   6144    141   7095    0    0     0     0 16958 15365  3  4 93  0  0
 0  0      0   6145    141   7095    0    0     0     0 15942 14969  3  3 93  0  0
 1  0      0   6146    141   7095    0    0     0     0 17698 16320  4  4 92  0  0
```

It can be seen that the system load of the Arbitrator node is significantly lower. This means multiple arbitrator nodes can run on a single server to achieve the high availability goal at lower cost.

## Notes

1. When the MGR cluster contains an arbitrator node, to switch from single-primary mode to multi-primary mode, the voting node must be shut down first before the switchover. Otherwise, the switchover may fail and the arbitrator node will report an error and exit the MGR cluster.

2. Arbitrator nodes are only supported in GreatSQL, not in native MySQL. Therefore, MySQL Shell cannot be used to manage an MGR cluster that contains arbitrator nodes. Instead, use [GreatSQL Shell](../8-mgr/3-mgr-maintain-admin.md) for management.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
