# FAQ - MGR Operations & Deployment
---

## 1. Can MySQL Shell be used to manage GreatSQL

Yes, it is recommended to use a MySQL Shell with the same version number.

Starting from GreatSQL 8.0.25-16, if there is an arbitrator node, you need to use the MySQL Shell for GreatSQL version to manage it; otherwise, you can only manage it on the command line.

MySQL Shell for GreatSQL download link: [https://gitee.com/GreatSQL/GreatSQL/releases](https://gitee.com/GreatSQL/GreatSQL/releases).

## 2. What is the maximum number of nodes MGR supports
MGR supports up to 9 nodes, whether in single-primary or multi-primary mode.

## 3. Can MGR be set to start automatically
Set the option `group_replication_start_on_boot = ON`. However, when the first node of MGR is initialized and started, or when the entire MGR cluster is shut down and restarted, the first node must first use the bootstrap mode `group_replication_bootstrap_group = ON`.

When the entire MGR cluster is shut down and restarted, you can also use MySQL Shell to quickly bring it up automatically with one click. For details, see: [WanDa #12: After the entire MGR cluster goes down, how can a primary be elected automatically without manual intervention](https://mp.weixin.qq.com/s/07o1poO44zwQIvaJNKEoPA).

## 4. Why is there an extra port 33061 after MGR is started
By default, after MGR is enabled, GreatSQL listens on port 33061, which is used for communication between MGR nodes. Therefore, if there are firewall policies between servers, remember to open this port.

You can also define the port yourself, for example `group_replication_local_address=192.168.0.1:33062`.

## 5. When deploying MGR, is it necessary to set hostname on all nodes
This is not required.

The reason for adding the hostname mapping table of all nodes on each node is that during communication between MGR nodes, the hostname received may be inconsistent with the local actual configuration.

In this case, you can also set `report_host` and `report_port` on each node to solve this problem. If you want to enable the GreatSQL MGR feature of binding dynamic VIP, it is also recommended to set `report_host` and `report_port`. For details, see: [Built-in dynamic VIP in GreatSQL HA features](../5-enhance/5-2-ha-mgr-vip.md).

## 6. Can MGR be deployed across the public network
Yes, but it is highly not recommended.

In addition, since the MGR default allowlist does not include public network addresses, you need to add the public network addresses, for example:
```ini
group_replication_ip_allowlist='192.0.2.0/24, 114.114.114.0/24'
```

As a reminder, the default allowlist range of MGR (`group_replication_ip_allowlist=AUTOMATIC`) is as follows:
```
IPv4 (as defined in RFC 1918)
10/8 prefix       (10.0.0.0 - 10.255.255.255) - Class A
172.16/12 prefix  (172.16.0.0 - 172.31.255.255) - Class B
192.168/16 prefix (192.168.0.0 - 192.168.255.255) - Class C

IPv6 (as defined in RFC 4193 and RFC 5156)
fc00:/7 prefix    - unique-local addresses
fe80::/10 prefix  - link-local unicast addresses

127.0.0.1 - localhost for IPv4
::1       - localhost for IPv6
```
Sometimes the IP address of a Docker container is not in the above range, which also causes the MGR service to fail to start.

## 7. How to check whether MGR is currently in single-primary or multi-primary mode

Run the following command:
```sql
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID ... | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-1... |        3306 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | 549b92bf-1... |        3307 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | 5596116c-1... |        3308 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | ed5fe7ba-3... |        3309 | ONLINE       | PRIMARY     | 8.4.4          |
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
```
If only one node has a `MEMBER_ROLE` value of **PRIMARY**, it means this is single-primary mode. If all nodes have this status value as **PRIMARY**, it means this is multi-primary mode.

Alternatively, you can also confirm by querying the GreatSQL option value:
```bash
$ mysqladmin var|grep -i group_replication_single_primary_mode

| group_replication_single_primary_mode        | ON
```
A value of **ON** means single-primary mode. If the value is **OFF**, it means multi-primary mode.

You can also check the status in MySQL Shell to confirm:
```js
MySQL  GreatSQL:3306 ssl  JS > var c=dba.getCluster()

MySQL  GreatSQL:3306 ssl  JS > c.describe() /* or c.status() */

...
        "topologyMode": "Single-Primary"
...
```

P.S., it is strongly recommended to use single-primary mode, as the probability of encountering bugs or other problems is lower, and MGR runs more stably and reliably.

## 8. How to switch between single-primary and multi-primary
In the GreatSQL client command-line mode, run the following commands:
```sql
-- Switch from single-primary to multi-primary
greatsql> SELECT group_replication_switch_to_multi_primary_mode();
+--------------------------------------------------+
| group_replication_switch_to_multi_primary_mode() |
+--------------------------------------------------+
| Mode switched to multi-primary successfully.     |
+--------------------------------------------------+

-- Switch from multi-primary to single-primary
greatsql> SELECT group_replication_switch_to_single_primary_mode();
+---------------------------------------------------+
| group_replication_switch_to_single_primary_mode() |
+---------------------------------------------------+
| Mode switched to single-primary successfully.     |
+---------------------------------------------------+
```

::: warning Note
A new primary election will be triggered during the switch, and the new primary node may not be the one before the switch. In this case, you can run the following command to re-specify it:
```sql
greatsql> SELECT group_replication_set_as_primary('ed5fe7ba-37c2-11ec-8e12-70b5e873a570');
+--------------------------------------------------------------------------+
| group_replication_set_as_primary('ed5fe7ba-37c2-11ec-8e12-70b5e873a570') |
+--------------------------------------------------------------------------+
| Primary server switched to: ed5fe7ba-37c2-11ec-8e12-70b5e873a570         |
+--------------------------------------------------------------------------+
```
:::

You can also operate through MySQL Shell:
```js
MySQL  GreatSQL:3306 ssl  JS > var c=dba.getCluster()

> c.switchToMultiPrimaryMode()  /*Switch to multi-primary mode*/

Switching cluster 'MGR27' to Multi-Primary mode...

Instance 'GreatSQL:3306' was switched from SECONDARY to PRIMARY.
Instance 'GreatSQL:3307' was switched from SECONDARY to PRIMARY.
Instance 'GreatSQL:3308' was switched from SECONDARY to PRIMARY.
Instance 'GreatSQL:3309' remains PRIMARY.

The cluster successfully switched to Multi-Primary mode.

> c.switchToSinglePrimaryMode()  /*Switch to single-primary mode*/

Switching cluster 'MGR27' to Single-Primary mode...

Instance 'GreatSQL:3306' remains PRIMARY.
Instance 'GreatSQL:3307' was switched from PRIMARY to SECONDARY.
Instance 'GreatSQL:3308' was switched from PRIMARY to SECONDARY.
Instance 'GreatSQL:3309' was switched from PRIMARY to SECONDARY.

WARNING: The cluster internal session is not the primary member anymore. For cluster management operations please obtain a fresh cluster handle using dba.getCluster().

WARNING: Existing connections that expected a R/W connection must be disconnected, i.e. instances that became SECONDARY.

The cluster successfully switched to Single-Primary mode.

> c.setPrimaryInstance('GreatSQL:3309');  /*Re-set the primary node*/

Setting instance 'GreatSQL:3309' as the primary instance of cluster 'MGR27'...

Instance 'GreatSQL:3306' was switched from PRIMARY to SECONDARY.
Instance 'GreatSQL:3307' remains SECONDARY.
Instance 'GreatSQL:3308' remains SECONDARY.
Instance 'GreatSQL:3309' was switched from SECONDARY to PRIMARY.

The instance 'GreatSQL:3309' was successfully elected as primary.
```

P.S., it is strongly recommended to use single-primary mode, as the probability of encountering bugs or other problems is lower, and MGR runs more stably and reliably.

## 9. Does MySQL Router support multi-instance deployment on a single machine
Yes, it does.
During the initial deployment of MySQL Router, add the `--name`, `--directory`, and port number parameters, for example:
```bash
# Deploy the first instance
mysqlrouter --bootstrap mymgr@192.168.1.1:3306 --name=MGR1 --directory=/etc/mysqlrouter/MGR1  --user=mysqlrouter --conf-base-port=6446 --https-port=8443

# Deploy the second instance
mysqlrouter --bootstrap mymgr@192.168.1.1:4306 --name=MGR2 --directory=/etc/mysqlrouter/MGR2  --user=mysqlrouter --conf-base-port=7446 --https-port=9443
```
Then start and stop each instance with the `start.sh` and `stop.sh` scripts in its own directory.

For the method of MySQL Router multi-instance deployment, you can refer to this reference article: [**"Ye Wen" Issue 38: After the entire MGR cluster goes down, how can a primary be elected automatically without manual intervention**](https://mp.weixin.qq.com/s/9eLnQ2EJIMQnZuEvScIhiw).

## 10. Can MySQL Shell 8.0 manage MGR clusters of MySQL/GreatSQL 5.7
The answer is yes.

However, since MySQL/GreatSQL 5.7 does not have the several UDFs for MGR management, calling functions such as `setPrimaryInstance()` and `switchToMultiPrimaryMode()` in MySQL Shell will report errors and is not supported.

Therefore, it is still recommended to upgrade to MySQL/GreatSQL 8.0 as much as possible.

## 11. Does GreatSQL support ARBITRATOR node redundancy (multiple ARBITRATOR nodes)

Yes, multiple ARBITRATOR nodes can exist at the same time.

## 12. If the ARBITRATOR node exits abnormally, do the remaining two nodes have a split-brain risk
Yes. When the ARBITRATOR node exits, only two nodes remain, and there is a split-brain risk. Therefore, when the ARBITRATOR node exits abnormally, it should be brought back up as soon as possible, with proper monitoring and self-healing handling.

## 13. Can multiple MGR clusters share an ARBITRATOR node
No. ARBITRATOR nodes of different clusters can be deployed in a cross-deployment manner, but nodes of the same cluster cannot be placed together. You can also deploy multiple instances on a dedicated server, dedicated to serving as ARBITRATOR nodes.
The impact of an arbitrator node on system load is very small. You can refer to the following data:
```bash
# Observe on the Primary node server
$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 3  1      0    894    206  12238    0    0     0 27186 32669 44745 12  8 68 13  0
 1  0      0    893    206  12239    0    0     0 27555 34887 47219 12 10 64 14  0
 2  1      0    891    206  12240    0    0     0 27756 35025 47353 13  8 66 13  0

# Observe on the Secondary node server
$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  3      0   1950    168  11988    0    0     0 27236 23333 35077 25 19 42 15  0
 2  2      0   1946    168  11990    0    0     0 25950 22254 34017 23 21 42 13  0
 1  0      0   1943    168  11993    0    0     0 26382 21943 33385 24 20 41 14  0

# Observe on the Arbitrator node server
$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 0  0     22    328    193  14132    0    0     0     0 13587 14159  2  2 96  0  0
 1  0     22    326    193  14132    0    0     0     0 15274 15714  3  3 95  0  0
 0  0     22    324    193  14132    0    0     0     0 14983 15155  2  3 95  0  0
```

## 14. When adding an ARBITRATOR node, is it necessary to CLONE the full data
It is not required.

When the Primary node in MGR already has user data, whether you use shell or manually add a new arbitrator node (ARBITRATOR), the first join requires the CLONE process (even if `group_replication_arbitrator = 1` has been set before startup).

Workarounds:
1. For the first ARBITRATOR node added, after it successfully joins, you can disable the ARBITRATOR role and delete all user data. At this point it becomes an empty instance. After restarting, enable the ARBITRATOR role again, and it will not CLONE data again.
2. Based on the first ARBITRATOR node above, while it is shut down, take a full physical backup. This backup can then be used as the datadir for future new ARBITRATOR nodes, and joining the MGR cluster again will not CLONE data again.

In fact, when joining MGR, the basis for determining whether CLONE data is needed is to check `gtid_purged`. Therefore, there is a third method:

3. After completing instance initialization, manually modify gtid_purged, for example `set global gtid_purged = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1:1-1449587416';` to skip data CLONE.

## 15. Why does MySQL Router report "schema does not exist" when building a read/write splitting architecture

This is usually because the required metadata database `mysql_innodb_cluster_metadata` is missing.

You need to use GreatSQL Shell to take over the MGR cluster. It will create the `mysql_innodb_cluster_metadata` metadata schema, and then Router can be connected.

For details, refer to: [Using MySQL Shell to take over an existing MGR cluster](../8-mgr/2-mgr-install-deploy.md#greatsql-shell-adopting-an-existing-mgr-cluster).

## 16. A member node cannot join the MGR cluster and reports "Old incarnation". What is going on

This is because the member node has previously joined the MGR cluster, but due to abnormal node conditions/network issues/network partition, the member node status is abnormal and it has not yet been formally expelled from the MGR cluster. The MGR group view still retains the member node's related information, hence an error similar to the following:
```log
[Warning] [MY-011735] [Repl] Plugin group_replication reported: '[GCS] Old incarnation found while trying to add node ...
```

You can try the following methods to resolve it:

1. Execute `stop group_replication` on the problematic member node, and observe whether the node no longer appears in the MGR member list information;

2. Perform a Primary node switch operation on a normal member node. During the switch, the MGR group view will be updated, which may clear the problematic old node information;

3. Execute `removeInstance()` once with GreatSQL Shell on a normal member node to manually remove the problematic member node from the MGR cluster;

4. If none of the above operations can solve the problem, you can try setting the `group_replication_force_members` option on a normal member node to update the MGR member list. For details, refer to: [15. Failure Detection and Network Partition](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr/deep-dive-mgr-15.md#3-多数派成员失联时).

## 17. How to upgrade an MGR cluster from 8.0.25 to 8.0.32

Since the `group_replication_view_change_uuid` option was added in version 8.0.26, smooth upgrades of MGR clusters across version 8.0.26 are not supported. You can upgrade using a method similar to the following:

1. Shut down the mysqld processes of all member nodes, set `super_read_only=ON`, and stop business applications to avoid new transactions being written;

2. Take a physical backup of the data files of the Primary member node to prevent upgrade failure;

3. Modify the `basedir` in the my.cnf configuration file to point to the 8.0.32 installation directory (if systemd is used to manage the service, also modify the corresponding configuration), and modify `group_replication_bootstrap_group=OFF` and `group_replication_start_on_boot=OFF` to prevent each node from automatically starting the MGR service;

4. Start the mysqld processes of all member nodes one by one. Since the default value of the `upgrade` option is **AUTO**, the upgrade from 8.0.25 to 8.0.32 will be completed automatically;

5. Start the MGR cluster manually (start the Primary node first, then the Secondary nodes). It is more recommended to start the MGR cluster with GreatSQL Shell. For details, refer to: [How to automatically elect a primary when restarting an MGR cluster](https://mp.weixin.qq.com/s/07o1poO44zwQIvaJNKEoPA).

For more content about GreatSQL version upgrades or migration, please refer to: [GreatSQL 5.7 upgrade to 8.0](../7-migrate-and-upgrade/1-upgrade-to-greatsql8.md).

## 18. Why does manually building MGR report a caching_sha2_password error, or why does a node stay in the RECOVERING state

This is caused by the `caching_sha2_password` authentication plugin introduced in 8.0.4. It has higher requirements for password security and requires that passwords transmitted over the network during user authentication are encrypted.

When manually building MGR, you can first modify the option setting `group_replication_recovery_get_public_key=ON` before executing `CHANGE REPLICATION SOURCE TO`, and that will solve it.

For details, refer to: [Analysis and solution of MGR new node RECOVERING state: the impact of the caching_sha2_password authentication plugin](https://mp.weixin.qq.com/s/G9bpThAR-fYHHZsA8l4uuw).

## 19. What to do if an MGR member node reports `Duplicate entry...Error_code: 1062; handler error HA_ERR_FOUND_DUPP_KEY (1062)`

This is because a duplicate conflict error occurred when applying transactions on this member node. It may be caused by some data inconsistency on this node due to manual operations or misoperations.

In this case, if the data volume is small, it is recommended to rebuild the node directly and then join the MGR cluster. If the data volume is large, consider manually repairing the inconsistent data before joining the MGR cluster. For data repair, you can consider using the [gt-checksum tool](https://gitee.com/GreatSQL/gt-checksum).

## 20. What to do if an MGR member node reports `This member has more executed transactions than those present in the group`

This is because the member node has some local transactions that conflict with the MGR global transactions. Most likely, this node has data caused by manual operations or misoperations.

In this case, if the data volume is small, it is recommended to rebuild the node directly and then join the MGR cluster. If the data volume is large, consider manually repairing the inconsistent data before joining the MGR cluster. For data repair, you can consider using the [gt-checksum tool](https://gitee.com/GreatSQL/gt-checksum).

## 21. Why does creating/taking over an MGR cluster with GreatSQL Shell report `Access denied`

When creating a dedicated account for MGR services with an administrator, add the `WITH GRANT OPTION` option.

In addition, you cannot connect GreatSQL Shell with the top-level administrator account `root@localhost` and then create/take over an MGR cluster.

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
