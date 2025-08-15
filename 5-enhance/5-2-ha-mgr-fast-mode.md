# MGR 快速单主模式
---

## 简介

GreatSQL中增加一个新的工作模式：**单主快速模式**，在这个模式下，不再采用MGR原有的认证数据库方式，而是判断当前Binlog是否能够及时入盘来决定怎么样流控，避免发生OOM。

新增系统参数 `group_replication_single_primary_fast_mode` 用于设置是否启用快速单主模式，或选择使用哪种模式。

快速单主模式特别适合在跨机房部署，压力测试以及内存要求不高等多种场景。

这种模式弱于传统的异步复制，但强于半同步复制，且没有MGR默认的认证数据库可能消耗较大内存的问题。

系统参数 `group_replication_single_primary_fast_mode` 可选值有：0、1、2，不同值分别表示如下：
- 0，表示不采取快速单主模式，这是默认值。
- 1，表示采用快速单主模式，支持并发回放。**强烈建议设置为1，即启用快速单主模式**。
- 2，表示采用快速单主模式，但不支持并行回放，加速Relay Log落盘，且让从库消耗更少的资源。

| System Variable Name    | group_replication_single_primary_fast_mode |
| --- | --- |
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Type | Enumeration |
| Permitted Values |    [0 | 1 | 2] |
| Default    | 0 |
| Description    | 设置是否启用快速单主模式，强烈建议启用（即设置为1）。|


## 优化机制解读

MGR的事务冲突检测机制需要在各个MGR节点保存一个认证库，认证库的大小本身依赖于主从节点间的复制延迟，如果延迟较大，这个认证库就会变大，并占用大量内存。

快速单主模式只能应用在单主模式下，在单主模式下理论上不存在事务冲突，因此可以不再需要进行冲突检测，也就不需要在内存中存储相应的事务认证库，可以降低内存资源的消耗。

同时快速单主模式下，也能减少事务冲突检测本身的时间开销。

在快速单主模式下，GreatSQL 还通过优化了生成 [Binary Log](../2-about-greatsql/4-3-greatsql-binary-log.md) 中的 [last_committed](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_transaction_dependency_tracking) 计算逻辑，可以帮助提升在从节点上的 [Relay Log](../2-about-greatsql/4-4-greatsql-relay-log.md) Applier 线程整体处理流程，确保 Applier 线程能将 Relay Log 及时刷新落盘，降低因 Relay Log 落盘不及时导致的内存增长的风险。

## 注意事项

1. 启用快速单主模式时，**不支持采用多主模式**。

2. **所有节点都得设置必须相同**，即系统参数 `group_replication_single_primary_fast_mode` 的值要一致，否则无法启动MGR。

3. 从MySQL 8.0.27起新增**single leader**模式（对应 `group_replication_paxos_single_leader` 选项），建议不要启用该特性，因为启用该特性后可能会导致MGR集群整体崩溃风险。在GreatSQL针对MGR所做的优化工作已包含这方面的优化工作。 

4. 在切换主节点时（不管是手动切换，还是故障时自动切换），如果新的主节点设置 `group_replication_consistency=EVENTUAL`，但未开启快速单主模式的情况下，新的主节点可以立即提供读写服务，但部分写事务可能会因延时导致冲突回滚；在开启快速单主模式时，新的主节点需要等待事务回放完成之后，才能提供读写服务，这之前执行DML等请求会被阻塞，状态显示为`hook transaction begin`，在事务回放完成后，才能正常提供服务，这类似于设置 `group_replication_consistency=BEFORE_ON_PRIMARY_FAILOVER` 时的行为。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
