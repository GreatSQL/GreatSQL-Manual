# Changes in GreatSQL 5.7.36 (2022-4-7)

## 新增特性
### 新增 MGR 角色列
在 MySQL 5.7 中，查询 `performance_schema.replication_group_members` 时，没有 `MEMBER_ROLE` 这个列，这很不便于快速查看哪个节点是 Primary Node。

在 GreatSQL 中，增加了这个列，查看节点角色更便利了，对一些中间件支持也更友好。
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

### 采用全新的流控机制
原生的流控算法有较大缺陷，触发流控阈值后，会有短暂的流控停顿动作，之后继续放行事务，这会造成 1 秒的性能抖动，且没有真正起到持续流控的作用。

在 GreatSQL 中，重新设计了流控算法，增加主从延迟时间来计算流控阈值，并且同时考虑了大事务处理和主从节点的同步，流控粒度更细致，不会出现 MySQL 社区版本的 1 秒小抖动问题。

新增选项 `group_replication_flow_control_replay_lag_behind` 用于控制 MGR 主从节点复制延迟阈值，当 MGR 主从节点因为大事务等原因延迟超过阈值时，就会触发流控机制。

| System Variable Name	| group_replication_flow_control_replay_lag_behind |
| --- | --- | 
| Variable Scope	| global |
| Dynamic Variable	| YES |
| Permitted Values |	[0 ~ ULONG_MAX] |
| Default	| 600 |
| Description	| 用于控制 MGR 主从节点复制延迟阈值，当 MGR 主从节点因为大事务等原因延迟超过阈值时，就会触发流控机制 |

该选项默认为 600 秒，可在线动态修改，例如：
```sql
mysql> SET GLOBAL group_replication_flow_control_replay_lag_behind = 600;
```
正常情况下，该参数无需调整。

### 新增 MGR 网络开销阈值
新增相应选项 `group_replication_request_time_threshold`。

在 MGR 结构中，一个事务的开销包含网络层以及本地资源（例如 CPU、磁盘 I/O 等）开销，GreatSQL 针对 MGR 的网络层开销进行了多项优化工作，因此在网络层的开销通常不会成为瓶颈。

当事务响应较慢想要分析性能瓶颈时，可以先确定是网络层的开销还是本地性能瓶颈导致的。通过设置选项 `group_replication_request_time_threshold` 即可记录超过阈值的事件，便于进一步分析。输出的内容记录在 error log 中，例如：
```
[Note] Plugin group_replication reported: 'MGR request time:33775'
```
表示当时这个事务在 MGR 层的网络开销耗时 33.775 毫秒，再去查看那个时段的网络监控，分析网络延迟较大的原因。

选项 `group_replication_request_time_threshold` 单位是微秒，默认值是 0，最小值 0，最大值 100000000，建议值 20000（即 20 毫秒）。

| System Variable Name	| group_replication_request_time_threshold |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| YES |
| Permitted Values |	[0 ~ 100000000] |
| Default	| 0 |
| Description	|单位：微秒。<br/>设置阈值，当一个事务的 MGR 层网络开销超过该阈值时，会在 error log 中输出一条记录。<br/>设置为 0 时，表示不启用。<br/>当怀疑可能因为 MGR 通信耗时过久成为事务性能瓶颈时，再开启，平时不建议开启。|

### 调整 MGR 大事务限制
调整 MGR 事务限制选项 `group_replication_transaction_size_limit`，其默认值为 150000000（同时也是最大值）。

在 MySQL 5.7 中，MGR 事务没有进行分片处理，执行大事务很容易造成超时（并反复重发事务数据），最终导致节点报错并退出集群。

在 GreatSQL 5.7 中，针对该问题进行优化，并设置事务上限，超过该上限事务会失败回滚，但节点不会再退出集群。

**注意**，这是**硬限制**，即便将其设置为 0，也会自动调整成 150000000。
```
mysql> set global group_replication_transaction_size_limit = 150000001;
Query OK, 0 rows affected, 1 warning (0.00 sec)

-- 提示被重置了
mysql> show warnings;
+---------+------+-------------------------------------------------------------------------+
| Level   | Code | Message                                                                 |
+---------+------+-------------------------------------------------------------------------+
| Warning | 1292 | Truncated incorrect group_replication_transaction_si value: '150000001' |
+---------+------+-------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> set global group_replication_transaction_size_limit=0;
Query OK, 0 rows affected (0.00 sec)

-- 虽然没有error也没warning，但也被重置了
mysql> select @@global.group_replication_transaction_size_limit;
+---------------------------------------------------+
| @@global.group_replication_transaction_size_limit |
+---------------------------------------------------+
|                                         150000000 |
+---------------------------------------------------+
```

当执行一个超限的大事务时，会报告下面的错误：
```
ERROR 3100 (HY000): Error on observer while running replication hook 'before_commit'.
```

以测试工具 sysbench 生成的表为例，事务一次可批量执行的数据行上限约 73.2 万条记录：
```
mysql> insert into t1 select * from sbtest1 limit 732000;
Query OK, 732000 rows affected (16.07 sec)
Records: 732000  Duplicates: 0  Warnings: 0

mysql> insert into t1 select * from sbtest1 limit 733000;
ERROR 3100 (HY000): Error on observer while running replication hook 'before_commit'.
```

如果大事务能执行成功，也会记录类似下面的日志，告知该事务的字节数：
```
[Note] Plugin group_replication reported: 'large transaction size:149856412'
```

| System Variable Name	| group_replication_transaction_size_limit |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| YES |
| Permitted Values |	[0 ~ 150000000] |
| Default	| 150000000 |
| Description	|设置大事务阈值，当一个 MGR 事务超过该阈值时，会在 error log 中输出一条记录|

## 稳定性提升
1. 修复了在异常情况下（节点崩溃，关闭节点，网络分区）的剧烈性能抖动问题。
2. 提升数个大事务造成的长时间阻塞的问题。

## 性能提升
1. 重新设计事务认证队列清理算法。MySQL 社区版本中，对事务认证队列清理时采用了类似全表扫描的算法，清理效率较低，性能抖动较大。在 GreatSQL 版本中，对事务认证队列增加了类似索引机制，并控制每次清理的时间，可以有效解决清理效率低、性能抖动大的问题。
2. 提升了 Secondary 节点上大事务并发应用回放的速度。
3. 增加 XCom cache 条目，提升了在网络延迟较大或事务应用较慢场景下的性能。

## bug 修复
01. 修复了在启用 dns 或 hostname 的情况下，bind 意外失败问题。
02. 修复了协程调度不合理的问题，该问题可能会造成在大事务时系统错误判断为网络错误。
03. 修复了新加入节点在追 Paxos 数据时，由于 write 超时导致连接提前关闭的问题。
04. 修复了 recovering 节点被中途停止导致的数据异常问题。
05. 修复了多主多写模式中，个别情况下可能丢数据的问题。
06. 修复了在某些特殊场景下，多个节点同时启动一直处于 recovering 的状态
07. 修复了 applier 线程在特殊场景下的诡异问题。
08. 修复了在高并发情况下由于创建线程失败导致的死循环问题。
09. 修复了某一个从节点 hang 住导致整个集群被拖垮的问题。
10. 修复了单机部署多个节点场景下，tcp self connect 导致的诡异问题。
11. 修复了同时多个异常导致的视图问题。
12. 修复了 5 个及以上节点数量同时重启导致的视图问题（某一个节点会一直处于 recovering 状态）。
13. 修复了在某些场景下同时添加节点失败的问题。
14. 修复了在特殊场景下组视图异常的问题。


## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)




**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
