# MGR 管理维护

---

本文描述MGR集群的日常管理维护操作，包括主节点切换，单主&多主模式切换等，文档中的操作以MySQL Shell for GreatSQL与手动方式均有讲解

现在有个三节点的MGR集群：

```sql
greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.0.32         |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 172.16.16.11 |        3306 | ONLINE       | SECONDARY   | 8.0.32         |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 172.16.16.12 |        3306 | ONLINE       | ARBITRATOR  | 8.0.32         |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```

首先用 `mysqlsh` 客户端连接MGR集群中的任意节点，通常选择连接主节点。若想使用手工操作则不需要这一步

```
$ mysqlsh --uri GreatSQL@172.16.16.10:3306
```

## 1. 切换主节点

- [MySQL Shell for GreatSQL方式切换主节点](#mysql-shell-for-greatsql方式切换主节点)
- [手动方式切换](#手工方式切换)

##### MySQL Shell for GreatSQL方式切换主节点

当主节点需要进行维护时，或者执行滚动升级时，就可以对其进行切换，将主节点切换到其他节点。

在MySQL Shell for GreatSQL中，可以调用 `set_primary_instance()` 函数进行切换：

```sql
#首先获取mgr cluster对象
MySQL  172.16.16.10:3306 ssl  Py > c=dba.get_cluster()
#查看当前各节点列表 
MySQL  172.16.16.10:3306 ssl  Py > c.status()
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
                "version": "8.0.32"
            },
            "172.16.16.11:3306": {
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            },
            "172.16.16.12:3306": {
                "address": "172.16.16.12:3306",
                "memberRole": "ARBITRATOR",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            }
        },
        "topologyMode": "Single-Primary"
    },
    "groupInformationSourceMember": "172.16.16.10:3306"
}

#执行切换
MySQL  172.16.16.10:3306 ssl  Py > c.set_primary_instance('172.16.16.11:3306')
Setting instance '172.16.16.11:3306' as the primary instance of cluster 'MGR1'...

#罗列了三个节点各自发生的变化
Instance '172.16.16.10:3306' was switched from PRIMARY to SECONDARY.
Instance '172.16.16.11:3306' was switched from SECONDARY to PRIMARY.
Instance '172.16.16.12:3306' remains ARBITRATOR.

WARNING: The cluster internal session is not the primary member anymore. For cluster management operations please obtain a fresh cluster handle using dba.get_cluster().

#完成切换
The instance '172.16.16.11:3306' was successfully elected as primary.
```

之后再次执行 `c.status()` 就能看到 `PRIMARY` 角色切换到 *172.16.16.11:3306* 上了

##### 手工方式切换

在命令行模式下，可以使用`group_replication_set_as_primary()`这个udf实现切换，例如：

```sql
# 将Primary角色切换到第二个节点
greatsql> select group_replication_set_as_primary('b05c0838-6850-11ec-a06b-00155d064000');
+--------------------------------------------------------------------------+
| group_replication_set_as_primary('b05c0838-6850-11ec-a06b-00155d064000') |
+--------------------------------------------------------------------------+
| Primary server switched to: b05c0838-6850-11ec-a06b-00155d064000         |
+--------------------------------------------------------------------------+
1 row in set (1.00 sec)

greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 172.16.16.10 |        3306 | ONLINE       | SECONDARY     | 8.0.32         |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 172.16.16.11 |        3306 | ONLINE       | PRIMARY   | 8.0.32         |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 172.16.16.12 |        3306 | ONLINE       | ARBITRATOR  | 8.0.32         |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```

可以看到`PRIMARY` 角色切换到 *172.16.16.11:3306* 上了

## 2. 切换单主/多主模式

- [MySQL Shell for GreatSQL方式切换模式](#mysql-shell-for-greatsql方式切换模式)
- [手动方式切换](#手动方式切换)

##### MySQL Shell for GreatSQL方式切换模式

调用函数 `switch_to_multi_primary_mode()` 和 `switch_to_single_primary_mode()` 可以实现切换到多主、单主模式。

首先，从单主模式切换到多主模式：

```sql
MySQL  172.16.16.10:3306 ssl  Py > c.switch_to_multi_primary_mode()
Switching cluster 'GreatSQLMGR' to Multi-Primary mode...

Instance '172.16.16.10:3306' remains PRIMARY.
Instance '172.16.16.11:3306' was switched from SECONDARY to PRIMARY.

The cluster successfully switched to Multi-Primary mode.
```

注意到上面的输出内容中，并不包含 *172.16.16.12:3306* 节点，这是因为在切换单主/多主模式过程中，并不支持仲裁节点无缝衔接，因此切换时会失败退出。需要在切换前，手动关闭仲裁节点，切换完成后再次启动。

手工启动仲裁节点：

```sql
greatsql> start group_replication;
ERROR 3092 (HY000): The server is not configured properly to be an active member of the group. Please see more details on error log.
```

发现启动失败了，检查错误日志，可以看到有类似下面的信息：

```sql
[ERROR] [MY-011529] [Repl] Plugin group_replication reported: 'The member configuration is not compatible with the group configuration. Variables such as group_replication_single_primary_mode or group_replication_enforce_update_everywhere_checks must have the same value on every server in the group. (member configuration option: [group_replication_single_primary_mode], group configuration option: [group_replication_enforce_update_everywhere_checks]).'
```

这是因为，通过MySQL Shell for GreatSQL管理MGR时，会跟随单主/多主模式的不同，动态修改选项 `group_replication_enforce_update_everywhere_checks` 的值。仲裁节点中，该选项值和其他节点不同，所以需要先手动修改： 

```sql
# 先手动关闭单主模式
greatsql> set global group_replication_single_primary_mode=OFF;

# 再修改选项值，和其他节点保持一致
greatsql> set global group_replication_enforce_update_everywhere_checks=ON;
```

而后再次启动MGR服务即可。

```sql
greatsql> start group_replication;
Query OK, 0 rows affected (2.65 sec)
```

再次查看MGR的状态：

```sql
 MySQL  172.16.16.10:3306 ssl  Py > c.status()
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

切换成单主模式时可以指定某个节点作为新的主节点，如果不指定则会根据规则自动选择一个新的主节点
指定 *172.16.16.10:3306* 作为新主：

```sql
MySQL  172.16.16.10:3306 ssl  Py > c.switch_to_single_primary_mode("172.16.16.10:3306")
Switching cluster 'GreatSQLMGR' to Single-Primary mode...

Instance '172.16.16.10:3306' remains PRIMARY.
Instance '172.16.16.11:3306' was switched from PRIMARY to SECONDARY.
Instance '172.16.16.12:3306' remains ARBITRATOR.

WARNING: Existing connections that expected a R/W connection must be disconnected, i.e. instances that became SECONDARY.

The cluster successfully switched to Single-Primary mode.
```

可以看到切换成功了，而且仲裁节点没有报错退出，如果还是有报错的话，重置上述两个选项，再次启动MGR服务即可：

```sql
greatsql> set global group_replication_enforce_update_everywhere_checks=OFF;

greatsql> set global group_replication_single_primary_mode=ON;

greatsql> start group_replication;
Query OK, 0 rows affected (2.85 sec)
```

##### 手动方式切换

在命令行模式下，可以调用`group_replication_switch_to_single_primary_mode()` 和 `group_replication_switch_to_multi_primary_mode()` 来切换单主/多主模式

```sql
#直接调用函数即可
greatsql> select group_replication_switch_to_multi_primary_mode();
+--------------------------------------------------+
| group_replication_switch_to_multi_primary_mode() |
+--------------------------------------------------+
| Mode switched to multi-primary successfully.     |
+--------------------------------------------------+

#查看各节点状态
greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | af39db70-6850-11ec-94c9-00155d064000 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.0.32         |
| group_replication_applier | b05c0838-6850-11ec-a06b-00155d064000 | 172.16.16.11 |        3306 | ONLINE       | PRIMARY   | 8.0.32         |
| group_replication_applier | b0f86046-6850-11ec-92fe-00155d064000 | 172.16.16.12 |        3306 | ONLINE       | ARBITRATOR  | 8.0.32         |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+

#切换成单主模式时可以指定某个节点的 server_uuid，如果不指定则会根据规则自动选择一个新的主节点
#在这里，我选择了指定mgr1节点作为新主
greatsql> select group_replication_switch_to_single_primary_mode('af39db70-6850-11ec-94c9-00155d064000');
+-----------------------------------------------------------------------------------------+
| group_replication_switch_to_single_primary_mode('af39db70-6850-11ec-94c9-00155d064000') |
+-----------------------------------------------------------------------------------------+
| Mode switched to single-primary successfully.                                           |
+-----------------------------------------------------------------------------------------+
```

## 3. 添加新节点

- [MySQL Shell for GreatSQL方式添加新节点](#mysql-shell-for-greatsql方式添加新节点)
- [手动方式添加新节点](#手动方式添加新节点)

##### MySQL Shell for GreatSQL方式添加新节点

首先，启动一个全新的空实例，确保可以用root账户连接登入。

参考文档：[MGR节点预检查](../4-install-guide/2-install-with-rpm.md#91mgr节点预检查)，先利用 MySQL Shell for GreatSQL，调用函数 `dba.configure_instance()` 完成初始化检查工作。

而后切换到连接主节点的那个MySQL Shell for GreatSQL终端上，进行添加新节点操作：

```
MySQL  172.16.16.10:3306 ssl  Py > c.add_instance("GreatSQL@172.16.16.13:3306")

NOTE: The target instance '172.16.16.13:3306' has not been pre-provisioned (GTID set is empty). The Shell is unable to decide whether incremental state recovery can correctly provision it.
The safest and most convenient way to provision a new instance is through automatic clone provisioning, which will completely overwrite the state of '172.16.16.13:3306' with a physical snapshot from an existing cluster member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

The incremental state recovery may be safely used if you are sure all updates ever executed in the cluster were done with GTIDs enabled, there are no purged transactions and the new instance contains the same GTID set as the cluster or a subset of it. To use this method by default, set the 'recoveryMethod' option to 'incremental'.


Please select a recovery method [C]lone/[I]ncremental recovery/[A]bort (default Clone):  <--此处直接回车确认用Clone进行数据恢复
...

* Waiting for distributed recovery to finish...
NOTE: '172.16.16.13:3306' is being recovered from '172.16.16.12:3306'
* Distributed recovery has finished

# 新节点成功加入完毕
The instance '172.16.16.13:3306' was successfully added to the cluster.

# 确认添加成功，已在MGR集群列表中
 MySQL  172.16.16.10:3306 ssl  Py > c.status()
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

确认新节点添加成功。

##### 手动方式添加新节点

首先，要先完成MySQL Server初始化，创建好MGR专用账户、设置好MGR服务通道等前置工作，这部分的操作可以参考前文 [**3. 安装部署MGR集群**](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr/deep-dive-mgr-03.md)。

接下来，直接执行命令 `start group_replication` 启动MGR服务即可，新增的节点会进入分布式恢复这个步骤，它会从已有节点中自动选择一个作为捐献者（donor），并自行决定是直接读取binlog进行恢复，还是利用Clone进行全量恢复。

如果是已经在线运行一段时间的MGR集群，有一定存量数据，这时候新节点加入可能会比较慢，建议手动利用Clone进行一次全量复制。还记得前面创建MGR专用账户时，给加上了 **BACKUP_ADMIN** 授权码，这时候就排上用场了，Clone需要用到这个权限。

下面演示如何利用Clone进行一次全量数据恢复，假定要新增的节点是 *172.16.16.13* （给它命名为 mgr4）。

```sql
#在mgr4上设置捐献者
#为了降低对Primary节点的影响，建议选择其他Secondary节点
greatsql> set global clone_valid_donor_list='172.16.16.11:3306';

#停掉mgr服务（如果有的话），关闭super_read_only模式，然后开始复制数据
#注意这里要填写的端口是3306（MySQL正常服务端口），而不是33061这个MGR服务专用端口
greatsql> stop group_replication; 
greatsql> set global super_read_only=0; 
greatsql> clone INSTANCE FROM GreatSQL@172.16.16.11:3306 IDENTIFIED BY 'GreatSQL';
```

全量复制完数据后，该节点会进行一次自动重启。重启完毕后，再次确认 `group_replication_group_name`、`group_replication_local_address`、`group_replication_group_seeds` 这些选项值是否正确，如果没问题，执行 `start group_replication` 后，该节点应该就可以正常加入集群了。

## 4. 删除节点

- [MySQL Shell for GreatSQL方式删除新节点](#mysql-shell-for-greatsql方式删除节点)
- [手动方式添加新节点](#手动方式删除节点)

##### MySQL Shell for GreatSQL方式删除节点

删除节点比较简单，调用 `remove_instance()` 函数即可：

```
MySQL  172.16.16.10:3306 ssl  Py > c.remove_instance("GreatSQL@172.16.16.13:3306")
The instance will be removed from the InnoDB cluster. Depending on the instance
being the Seed or not, the Metadata session might become invalid. If so, please
start a new session to the Metadata Storage R/W instance.

Instance '172.16.16.13:3306' is attempting to leave the cluster...

The instance '172.16.16.13:3306' was successfully removed from the cluster.
```

这就将该节点踢出集群了，并且会重置 `group_replication_group_seeds` 和 `group_replication_local_address` 两个选项值，之后该节点如果想再加入集群，只需调用 `add_instance()` 重新加回即可。

##### 手动方式删除节点

在命令行模式下，一个节点想退出MGR集群，直接执行 `stop group_replication` 即可，如果这个节点只是临时退出集群，后面还想加回集群，则执行 `start group_replication` 即可自动再加入。而如果是想彻底退出集群，则停止MGR服务后，执行 `reset master; reset slave all;` 重置所有复制（包含MGR）相关的信息就可以了。

## 5. 异常退出的节点重新加回

##### MySQL Shell for GreatSQL方式重新加回

在MySQL Shell for GreatSQL里，可以调用 `rejoin_instance()` 函数将异常的节点重新加回集群：

```
 MySQL  172.16.16.10:3306 ssl  Py > c.rejoin_instance('172.16.16.13:3306');
 
Rejoining instance '172.16.16.13:3306' to cluster 'GreatSQLMGR'...
The instance '172.16.16.13:3306' was successfully rejoined to the cluster.
```

##### 手动方式重新加回

当节点因为网络断开、实例crash等异常情况与MGR集群断开连接后，这个节点的状态会变成 **UNREACHABLE**，待到超过 `group_replication_member_expel_timeout` + 5 秒后，集群会踢掉该节点。

等到这个节点再次启动并执行 `start group_replication`，正常情况下，该节点应能自动重新加回集群。如果设置了选项 `group_replication_start_on_boot = ON`，实例启动时也会尝试自动加回集群。

## 6. 重启MGR集群

正常情况下，MGR集群中的Primary节点退出时，剩下的节点会自动选出新的Primary节点。当最后一个节点也退出时，相当于整个MGR集群都关闭了。这时候任何一个节点启动MGR服务后，都不会自动成为Primary节点，需要在启动MGR服务前，先设置 `group_replication_bootstrap_group=ON`，使其成为引导节点，再启动MGR服务，它才会成为Primary节点，后续启动的其他节点也才能正常加入集群。可自行测试，这里不再做演示。

P.S，第一个节点启动完毕后，记得重置选项 `group_replication_bootstrap_group=OFF`，避免在后续的操作中导致MGR集群分裂。

如果是用MySQL Shell for GreatSQL重启MGR集群，调用 `rebootClusterFromCompleteOutage()` 函数即可，它会自动判断各节点的状态，选择其中一个作为Primary节点，然后拉起各节点上的MGR服务，完成MGR集群重启。可以参考这篇文章：[万答#12，MGR整个集群挂掉后，如何才能自动选主，不用手动干预](https://mp.weixin.qq.com/s/07o1poO44zwQIvaJNKEoPA)

**问题反馈**
---

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
