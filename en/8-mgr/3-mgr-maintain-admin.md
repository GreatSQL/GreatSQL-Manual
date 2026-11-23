# MGR Administration

---

This article describes the daily administration and maintenance operations of an MGR cluster, including primary node switchover, single-primary & multi-primary mode switching, etc. The operations in this article are explained using both MySQL Shell for GreatSQL (hereinafter referred to as GreatSQL Shell) and the manual method.

## Installing GreatSQL Shell

Open the [GreatSQL Shell binary package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25) and download the installation package of the corresponding version. It is more recommended to use [Docker to run GreatSQL Shell](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell), which is more convenient and saves effort.

When downloading, choose the binary package with the same glibc version as the operating system. Use the following method to confirm:

```bash
$ ldd --version | grep GNU
ldd (GNU libc) 2.28

$ uname -p
x86_64
```
It can be seen that it is the glibc 2.28 version on the x86_64 platform, so choose the binary package: **greatsql-shell-8.0.32-25-glibc2.28-x86_64.tar.xz**.

Due to compilation environment limitations, GreatSQL Shell binary packages are not provided for all platforms. If needed, refer to the [GreatSQL Shell Build repository](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build) to build a binary package suitable for your runtime environment.

Running GreatSQL Shell 8.0.32-25 requires the Python 3.8 environment. Execute the following commands first to complete the installation of related dependencies:

```bash
yum install -y libssh python38 python38-libs python38-pyyaml
pip3.8 install --user certifi pyclamd
```

Next, prepare a three-node MGR cluster that includes an arbitrator node:

```sql
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 172.16.16.11 |        3306 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 172.16.16.12 |        3306 | ONLINE       | ARBITRATOR  | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```

First, use the `mysqlsh` client to connect to any node in the MGR cluster; it is usually best to connect to the primary node. If you want to use the manual method, this step is not needed.

```bash
mysqlsh --uri GreatSQL@172.16.16.10:3306
```

## Primary Node Switchover

### Switching the Primary Node with GreatSQL Shell

When the primary node needs maintenance, or when performing a rolling upgrade, you can switch it to make another node the primary node.

In GreatSQL Shell, you can call the `setPrimaryInstance()` function to perform the switchover:

```js
#First obtain the mgr cluster object
MySQL  172.16.16.10:3306 ssl  JS > c=dba.getCluster()

#View the current list of nodes
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

#Perform the switchover
MySQL  172.16.16.10:3306 ssl  JS > c.setPrimaryInstance('172.16.16.11:3306')

Setting instance '172.16.16.11:3306' as the primary instance of cluster 'MGR1'...

#Lists the changes that occurred on each of the three nodes
Instance '172.16.16.10:3306' was switched from PRIMARY to SECONDARY.
Instance '172.16.16.11:3306' was switched from SECONDARY to PRIMARY.
Instance '172.16.16.12:3306' remains ARBITRATOR.

WARNING: The cluster internal session is not the primary member anymore. For cluster management operations please obtain a fresh cluster handle using dba.getCluster().

#Switchover complete
The instance '172.16.16.11:3306' was successfully elected as primary.
```

After that, executing `c.status()` again will show that the `PRIMARY` role has been switched to *172.16.16.11:3306*.

### Manual Switchover

In the command line mode, you can use the `group_replication_set_as_primary()` UDF to perform the switchover, for example:

```sql
# Switch the Primary role to the second node
greatsql> SELECT group_replication_set_as_primary('b05c0838-6850-11ec-a06b-00155d064000');
+--------------------------------------------------------------------------+
| group_replication_set_as_primary('b05c0838-6850-11ec-a06b-00155d064000') |
+--------------------------------------------------------------------------+
| Primary server switched to: b05c0838-6850-11ec-a06b-00155d064000         |
+--------------------------------------------------------------------------+
1 row in set (1.00 sec)

greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 172.16.16.10 |        3306 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 172.16.16.11 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 172.16.16.12 |        3306 | ONLINE       | ARBITRATOR  | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```

It can be seen that the `PRIMARY` role has been switched to *172.16.16.11:3306*.

## Switching Between Single-Primary and Multi-Primary Modes

### Switching Modes with GreatSQL Shell

Calling the `switchToMultiPrimaryMode()` and `switchToSinglePrimaryMode()` functions can switch to multi-primary and single-primary modes respectively.

First, switch from single-primary mode to multi-primary mode:

```js
MySQL  172.16.16.10:3306 ssl  JS > c.switchToMultiPrimaryMode()

Switching cluster 'GreatSQLMGR' to Multi-Primary mode...

Instance '172.16.16.10:3306' remains PRIMARY.
Instance '172.16.16.11:3306' was switched from SECONDARY to PRIMARY.

The cluster successfully switched to Multi-Primary mode.
```

Note that the output above does not include the *172.16.16.12:3306* node. This is because during the switch between single-primary and multi-primary modes, seamless handling of the arbitrator node is not supported, so the switch will fail and exit. You need to manually stop the arbitrator node before switching, and start it again after the switch is complete.

Manually start the arbitrator node:

```sql
greatsql> START group_replication;
ERROR 3092 (HY000): The server is not configured properly to be an active member of the group. Please see more details on error log.
```

It is found that the startup failed. Check the error log, and you can see information similar to the following:

```log
[ERROR] [MY-011529] [Repl] Plugin group_replication reported: 'The member configuration is not compatible with the group configuration. Variables such as group_replication_single_primary_mode or group_replication_enforce_update_everywhere_checks must have the same value on every server in the group. (member configuration option: [group_replication_single_primary_mode], group configuration option: [group_replication_enforce_update_everywhere_checks]).'
```

This is because when MGR is managed through GreatSQL Shell, the value of the option `group_replication_enforce_update_everywhere_checks` is dynamically modified according to the single-primary/multi-primary mode. In the arbitrator node, the value of this option is different from that of other nodes, so it needs to be modified manually first:

```sql
-- First manually disable single-primary mode
SET GLOBAL group_replication_single_primary_mode=OFF;

-- Then modify the option value to be consistent with other nodes
SET GLOBAL group_replication_enforce_update_everywhere_checks=ON;
```

Then start the MGR service again.

```sql
START group_replication;
```

Check the MGR status again:

```js
 MySQL  172.16.16.10:3306 ssl  JS > c.status()
...
                "address": "172.16.16.10:3306",
                "memberRole": "PRIMARY",
...
                "address": "172.16.16.11:3306",
                "memberRole": "PRIMARY",
...
                "address": "172.16.16.12:3306",
                "memberRole": "ARBITRATOR",
...
```

When switching to single-primary mode, you can specify a node as the new primary node. If not specified, a new primary node will be automatically selected according to the rules.
Specify *172.16.16.10:3306* as the new primary:

```js
MySQL  172.16.16.10:3306 ssl  JS > c.switchToSinglePrimaryMode("172.16.16.10:3306")

Switching cluster 'GreatSQLMGR' to Single-Primary mode...

Instance '172.16.16.10:3306' remains PRIMARY.
Instance '172.16.16.11:3306' was switched from PRIMARY to SECONDARY.
Instance '172.16.16.12:3306' remains ARBITRATOR.

WARNING: Existing connections that expected a R/W connection must be disconnected, i.e. instances that became SECONDARY.

The cluster successfully switched to Single-Primary mode.
```

As you can see, the switch succeeded, and the arbitrator node did not fail with an error. If there are still errors, reset the above two options and start the MGR service again:

```sql
SET GLOBAL group_replication_enforce_update_everywhere_checks=OFF;
SET GLOBAL group_replication_single_primary_mode=ON;
START group_replication;
```

### Manual Mode Switching

In the command line mode, you can call `group_replication_switch_to_single_primary_mode()` and `group_replication_switch_to_multi_primary_mode()` to switch between single-primary and multi-primary modes.

```sql
-- Call the function directly
greatsql> SELECT group_replication_switch_to_multi_primary_mode();
+--------------------------------------------------+
| group_replication_switch_to_multi_primary_mode() |
+--------------------------------------------------+
| Mode switched to multi-primary successfully.     |
+--------------------------------------------------+

-- View the status of each node
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 172.16.16.11 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 172.16.16.12 |        3306 | ONLINE       | ARBITRATOR  | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+

-- When switching to single-primary mode, you can specify the server_uuid of a node. If not specified, a new primary node will be automatically selected according to the rules.
-- Here, I chose to specify the mgr1 node as the new primary
greatsql> SELECT group_replication_switch_to_single_primary_mode('af39db70-6850-11ec-94c9-00155d064000');
+-----------------------------------------------------------------------------------------+
| group_replication_switch_to_single_primary_mode('af39db70-6850-11ec-94c9-00155d064000') |
+-----------------------------------------------------------------------------------------+
| Mode switched to single-primary successfully.                                           |
+-----------------------------------------------------------------------------------------+
```

## Adding a New Node

### Adding a New Node with GreatSQL Shell

First, start a brand-new empty instance and make sure it can be connected and logged in with the root account.

Refer to the document: [MGR Node Pre-check](../4-install-guide/2-install-with-rpm.md#mgr-node-pre-check). First use GreatSQL Shell to call the `dba.configureInstance()` function to complete the initialization check.

Then switch to the GreatSQL Shell terminal connected to the primary node, first obtain the cluster object, and then add the new node:

```js
MySQL  172.16.16.10:3306 ssl  JS > c=dba.getCluster()

MySQL  172.16.16.10:3306 ssl  JS > c.addInstance("GreatSQL@172.16.16.13:3306")

NOTE: The target instance '172.16.16.13:3306' has not been pre-provisioned (GTID set is empty). The Shell is unable to decide whether incremental state recovery can correctly provision it.
The safest and most convenient way to provision a new instance is through automatic clone provisioning, which will completely overwrite the state of '172.16.16.13:3306' with a physical snapshot from an existing cluster member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

The incremental state recovery may be safely used if you are sure all updates ever executed in the cluster were done with GTIDs enabled, there are no purged transactions and the new instance contains the same GTID set as the cluster or a subset of it. To use this method by default, set the 'recoveryMethod' option to 'incremental'.


Please select a recovery method [C]lone/[I]ncremental recovery/[A]bort (default Clone):  <-- Press Enter here to confirm using Clone for data recovery
...

* Waiting for distributed recovery to finish...
NOTE: '172.16.16.13:3306' is being recovered from '172.16.16.12:3306'
* Distributed recovery has finished

# The new node has been added successfully
The instance '172.16.16.13:3306' was successfully added to the cluster.

# Confirm that the addition was successful; it is now in the MGR cluster list
 MySQL  172.16.16.10:3306 ssl  JS > c.status()
...
                "address": "172.16.16.10:3306",
                "memberRole": "PRIMARY",
...
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
...
                "address": "172.16.16.12:3306",
                "memberRole": "ARBITRATOR",
...
                "address": "172.16.16.13:3306",
                "memberRole": "SECONDARY",
...
```

Confirm that the new node has been added successfully.

### Adding a New Node Manually

First, complete the MySQL Server initialization, create the dedicated MGR account, and set up the MGR service channel and other preparatory work. For this part, refer to the previous article [**3. Deploying the MGR Cluster**](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr/deep-dive-mgr-03.md).

Next, directly execute the command `START GROUP_REPLICATION` to start the MGR service. The newly added node will enter the distributed recovery step, in which it will automatically select one of the existing nodes as the donor, and decide on its own whether to read the binlog directly for recovery or use Clone for full recovery.

If the MGR cluster has been running online for a period of time and has a certain amount of existing data, the new node may join more slowly. In this case, it is recommended to manually use Clone for a full copy. Remember that when creating the dedicated MGR account earlier, we granted the **BACKUP_ADMIN** privilege; this is where it comes in handy, because Clone requires this privilege.

The following demonstrates how to use Clone for a full data recovery, assuming the node to be added is *172.16.16.13* (name it mgr4).

```sql
-- Set the donor on mgr4
-- To reduce the impact on the Primary node, it is recommended to choose another Secondary node
SET GLOBAL clone_valid_donor_list='172.16.16.11:3306';

-- Stop the MGR service (if any), disable super_read_only mode, and then start copying data
-- Note that the port to fill in here is 3306 (the normal MySQL service port), not 33061, the dedicated MGR service port
STOP group_replication;
SET GLOBAL super_read_only=0;
CLONE INSTANCE FROM GreatSQL@172.16.16.11:3306 IDENTIFIED BY 'GreatSQL';
```

After the full data copy is complete, the node will restart automatically. After the restart is complete, confirm again that the values of the options `group_replication_group_name`, `group_replication_local_address`, and `group_replication_group_seeds` are correct. If there is no problem, execute `START GROUP_REPLICATION` and the node should be able to join the cluster normally.

## Removing a Node

### Removing a Node with GreatSQL Shell

Removing a node is relatively simple: just call the `removeInstance()` function:

```js
MySQL  172.16.16.10:3306 ssl  JS > c.removeInstance("GreatSQL@172.16.16.13:3306")
The instance will be removed from the InnoDB cluster. Depending on the instance
being the Seed or not, the Metadata session might become invalid. If so, please
start a new session to the Metadata Storage R/W instance.

Instance '172.16.16.13:3306' is attempting to leave the cluster...

The instance '172.16.16.13:3306' was successfully removed from the cluster.
```

This expels the node from the cluster and resets the values of the two options `group_replication_group_seeds` and `group_replication_local_address`. After that, if the node wants to rejoin the cluster, it only needs to call `addInstance()` to add it back.

### Removing a Node Manually

In the command line mode, if a node wants to leave the MGR cluster, simply execute `STOP GROUP_REPLICATION`. If the node is only temporarily leaving the cluster and wants to rejoin later, executing `START GROUP_REPLICATION` will automatically rejoin it. If you want to leave the cluster completely, after stopping the MGR service, execute `RESET BINARY LOGS AND GTIDS ; RESET REPLICA ALL;` to reset all replication-related information (including MGR).

## Rejoining an Abnormally Exited Node

### Rejoining with GreatSQL Shell

In GreatSQL Shell, you can call the `rejoinInstance()` function to rejoin an abnormal node to the cluster:

```js
 MySQL  172.16.16.10:3306 ssl  JS > c.rejoinInstance('172.16.16.13:3306');
 
Rejoining instance '172.16.16.13:3306' to cluster 'GreatSQLMGR'...
The instance '172.16.16.13:3306' was successfully rejoined to the cluster.
```

### Rejoining Manually

When a node is disconnected from the MGR cluster due to abnormal situations such as network disconnection or instance crash, the node's status will become **UNREACHABLE**. After exceeding `group_replication_member_expel_timeout` + 5 seconds, the cluster will expel the node.

When the node starts again and executes `START GROUP_REPLICATION`, under normal circumstances, the node should automatically rejoin the cluster. If the option `group_replication_start_on_boot = ON` is set, the instance will also try to rejoin the cluster automatically when it starts.

## Restarting the MGR Cluster

Under normal circumstances, when the Primary node in an MGR cluster exits, the remaining nodes will automatically elect a new Primary node. When the last node also exits, it is equivalent to the entire MGR cluster being shut down. At this time, after any node starts the MGR service, it will not automatically become the Primary node. Before starting the MGR service, you need to set `group_replication_bootstrap_group=ON` to make it the bootstrap node, and then start the MGR service; only then will it become the Primary node, and the other nodes started later can also join the cluster normally. You can test this yourself; no demonstration is given here.

P.S., after the first node has finished starting, remember to reset the option `group_replication_bootstrap_group=OFF` to avoid splitting the MGR cluster in subsequent operations.

If you use GreatSQL Shell to restart the MGR cluster, call the `rebootClusterFromCompleteOutage()` function. It will automatically determine the status of each node, select one of them as the Primary node, and then start the MGR service on each node to complete the MGR cluster restart. You can refer to this article: [Wonder Q&A #12: How to automatically elect a primary node without manual intervention after the entire MGR cluster goes down](https://mp.weixin.qq.com/s/07o1poO44zwQIvaJNKEoPA)


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
