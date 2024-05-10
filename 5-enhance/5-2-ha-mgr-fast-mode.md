# GreatSQL高可用特性之快速单主模式
---

GreatSQL中增加一个新的工作模式：**单主快速模式**，在这个模式下，不再采用MGR原有的认证数据库方式（而是判断当前binlog是否能够及时入盘来决定怎么样流控，确保不oom）。新增选项 `group_replication_single_primary_fast_mode` 用于设置是否启用，以及具体采用哪种模式。

快速单主模式特别适合在跨机房部署，压力测试以及内存要求不高等多种场景。这种模式弱于传统的异步复制，但强于半同步复制，且没有MGR默认的认证数据库可能消耗较大内存的问题
。

**提醒**，启用快速单主模式时，不支持采用多主模式；所有节点都得设置必须相同，否则无法启动。

选项 `group_replication_single_primary_fast_mode` 可选值有：0、1、2，不同值分别表示如下：
- 0，表示不采取快速单主模式，这是默认值。
- 1，表示采用快速单主模式，支持并发回放。**强烈建议设置为1，即启用快速单主模式。**
- 2，表示采用快速单主模式，但不支持并行回放，加速relay log落盘，且让从库消耗更少的资源。

| System Variable Name    | group_replication_single_primary_fast_mode |
| --- | --- |
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Permitted Values |    0<br/>1<br/>2 |
| Default    | 0 |
| Description    | 设置是否启用快速单主模式，强烈建议启用（即设置为1）。|

**提醒：** MySQL 8.0.27起新增**single leader**模式（对应 `group_replication_paxos_single_leader` 选项），请勿启用该特性，因为启用该特性后可能会导致MGR集群整体崩溃风险。在GreatSQL针对MGR所做的优化工作已包含这方面的优化工作。 


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
