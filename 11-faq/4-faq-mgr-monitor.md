# FAQ - MGR监控及故障处理
---

本文内容主要是MGR监控及故障处理相关的FAQ。


## 1. 怎么查看MGR从节点是否有延迟
首先，可以执行下面的命令查看当前除了 **PRIMARY** 节点外，其他节点的 `trx_tobe_certified` 或 `relaylog_tobe_applied` 值是否较大：
```
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
其中，`relaylog_tobe_applied` 的值表示远程事务写到relay log后，等待回放的事务队列，`trx_tobe_certified` 表示等待被认证的事务队列大小，这二者任何一个值大于0，都表示当前有一定程度的延迟。

另外，也可以查看接收到的事务和已执行完的事务之间的差距来判断：
```
[root@GreatSQL]> SELECT RECEIVED_TRANSACTION_SET FROM performance_schema.replication_connection_status WHERE  channel_name = 'group_replication_applier' UNION ALL SELECT variable_value FROM performance_schema.global_variables WHERE  variable_name = 'gtid_executed'\G
*************************** 1. row ***************************
RECEIVED_TRANSACTION_SET: 6cfb873b-573f-11ec-814a-d08e7908bcb1:1-3124520
*************************** 2. row ***************************
RECEIVED_TRANSACTION_SET: 6cfb873b-573f-11ec-814a-d08e7908bcb1:1-3078139
```
可以看到，接收到的事务 GTID 已经到了 3124520，而本地只执行到 3078139，二者的差距是 46381。可以顺便持续关注这个差值的变化情况，估算出本地节点是否能追平延迟，还是会加大延迟。



## 2. 三节点的MGR集群，有两个节点宕机后还能正常工作吗
要看具体是哪种情况。

如果两个节点是正常关闭的话，则会向MGR集群发送退出信号，这种情况下，这两个节点属于正常退出，最后仅剩的节点会被提升为Primary角色，还可以正常工作，允许对其进行读写，只是此时没有可用性冗余了。当其他节点再次启动并加入集群后，又能恢复正常服务。

如果是因为网络故障，或者mysqld进程发生oom、或被误杀、或其他原因退出了，则这些节点会被标识为 **UNREACHABLE** 状态，等待直到 `group_replication_member_expel_timeout` 时长（单位：秒）后这个节点才会正式退出集群。在这种情况下，一旦超过多数派节点处于 **UNREACHABLE** 状态时，则整个集群不可用，无法提供读写服务。这种情况下，需要把剩下的节点重启MGR服务才能恢复。

正常情况下，不要把 `group_replication_member_expel_timeout` 值调整太大，并且MGR的事务一致性级别尽量不要选择 **AFTER** 模式，以防出现整个集群服务不可用的问题，详细参见这篇文章：[为什么MGR一致性模式不推荐AFTER](https://mp.weixin.qq.com/s/zy0VUgF_5gJuZYbzNVxPXA)。

## 3. 都有哪些情况可能导致MGR服务无法启动
简单整理了下，大概有以下原因可能导致MGR服务无法启动：
1. 网络原因，例如网络本来就不通，或被防火墙拦住。防火墙通常至少有两道，操作系统默认的firewall策略，以及云主机被默认的安全策略。
2. 第一个启动的节点没先做初始引导操作（`group_replication_bootstrap_group=ON`）。
3. 没有正确配置group_name，所有节点的 `group_replication_group_name` 值要一致才可以。
4. 没正确配置 `group_replication_group_name`，常见于新手。要为MGR服务专门新开一个服务端口，常用33061端口，但新手可能会照样写成3306端口。
5. 通常，我们会在各MGR节点的 hosts 文件里加上所有节点的hostname。这是为了防止本地节点使用的hostname和MGR收到的hostname不一致，这种情况下，可以在每个本地节点设置 `report-host`，主动上报hostname即可解决。
7. 没设置正确的allowlist。有可能加入MGR各节点的IP不在默认的allowlist中，可参考这篇文章：[MySQL Group Replication集群对IP地址的限制导致的一些问题与解决办法](https://mp.weixin.qq.com/s/sbYufrlOx4cKiT8sV3hCaw)。
8. 个别节点的本地事务更多，例如误操作写入数据，也会无法加入MGR，这种情况需要重建本地节点。
9. 个别节点的本地事务缺失太多，且加入MGR时无法自动完成恢复，这种情况比较少见，需要手动执行clone复制数据，或者其他类似操作。

## 4. 为什么InnoDB并行查询(PQ)不可用
可能原因有几种：
1. 优化器认为没必要走并行，比如因为cost太小了。
2. 不支持的SQL类型，目前还不支持子查询。
3. 优化器认为可用资源不足，"无法"使用并行查询。

例如，有个场景是因为 `parallel_memory_limit` 设置过低，优化器判断SQL的cost较大，所以只是尝试去使用并行，但没发挥最大优势
```
mysql> show global status like 'PQ_%';
| PQ_memory_refused  | 0     |
| PQ_memory_used     | 0     |  <-- 没真正用上，因为可用buffer不够
| PQ_threads_refused | 82    |
| PQ_threads_running | 4     |  <-- 尝试并行
```

在调大 `parallel_memory_limit` 之后就好了
```
mysql> show global status like 'PQ_%';
| PQ_memory_refused  | 0       |
| PQ_memory_used     | 4801552 |  <-- PQ消耗的内存
| PQ_threads_refused | 82      |
| PQ_threads_running | 4       |  <-- 并行线程4
```






**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
