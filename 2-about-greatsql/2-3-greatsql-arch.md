# 系统架构
---

GreatSQL和MySQL一样，是个单机系统。同样地，GreatSQL也是三层体系结构。

除了传统的主从复制（Replication），还可以利用组复制（Group Replication）构建高可靠和读写扩展架构。

## 基于传统主从复制架构
---

以两个节点为例，可以构建单向的复制架构，也可以是双向复制架构。一般情况下，建议采用单向复制，这样的话，架构方案比较简单，也不容易误操。

单向复制架构即由一个主节点（Master/Source）和一个从节点（Slave/Replicas）构成。主节点接收到应用端发出的读写请求，并将对数据库产生变化的事件对应的操作记录到二进制日志（binlog/binary log）中，然后将二进制日志发送到从节点。从节点接将二进制日志转储到本地成为中级日志（relay log），然后再读取中级日志，将这些变更操作应用到本地数据库中。这样就完成主从间的逻辑复制了。

在单向复制架构中，通常要把从节点设置为只读模式（`read_only = 1` & `super_read_only = 1`），避免应用端或DBA误操作写入数据造成主从间数据不一致，并可能导致主从复制失败停止。

如果是采用双向复制架构，则也强烈建议只在某个节点上发起写请求，避免双向都写数据可能造成冲突的风险。或者从业务架构上进行区分，不同节点上处理不同的业务数据对象，避免造成冲突。

经典主从单向复制架构如下图所示：

![传统主从复制技术架构图](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/deep-dive-mgr/deep-dive-mgr-02-01.jpg)

**架构说明**

| 名称 | 描述 |
| --- | --- |
| Source | 即Master节点，也称为主节点、主库，响应业务端发起的读写请求。|
| Replica | 即Slave节点，也称为从节点、从库，接收Source节点发送过来的binlog event，并转储成relay log。一般设置为只读模式，只负责响应业务端发起的只读请求，并禁止业务端向Replica节点写入数据。|
| binlog | 即binary log，也称为二进制日志，是一种逻辑日志。选项 `binlog_format` 可用于设置binlog的工作模式，支持三种可选：row、statement、mixed。**强烈建议选择row模式**，以提高主从间的数据一致性。|
| relay log | 也称为中继日志。是Replica节点接收来自Source节点的binlog event后，转储到本地成为relay log，在Replica节点上再启动一个或多个SQL线程读取relay log并应用到本地节点，重演Source节点上的数据变更操作。|

对于复制方式，可以选择异步复制或半同步复制。通常情况下，选择异步复制模式就可以。如果是数据一致性等级要求较高的话，可以选择半同步复制。

异步复制（async replication）是主从复制的默认模式，这种模式不足之处在于，Master点无法验证binlog是否成功写入到Slave节点。当一个事务提交时，Master节点上成功写入binlog，但还没来得及将这个event发送到Slave节点，此时Master节点宕机了；或者Slave节点上因为磁盘损坏等故障，导致该event没能写入relay log中，那Slave节点上就不能正确应用这个事务event，从而造成了主从节点数据不一致。

半同步复制（semi-sync replication）的区别在于，Master节点上每提交一个事务后，不会立即返回给用户，而是等待至少一个Slave节点收到binlog并成功写入relay log才返回，这样可以保证这个事务在至少一个Slave节点上存在，从而保证了主从间数据的安全性和一致性。

不过半同步复制也有个风险，当主从节点间发生网络故障了，binlog发送到Slave节点时会一直等待，直到超时，然后再将半同步复制降级为异步复制。当主从间网络恢复正常了，再重新切换为半同复制。当超时阈值 `rpl_semi_sync_master_timeout` 设置较大时，就会影响业务端的正常请求，造成业务卡死的现象。

半同步复制架构如下图所示：

![半同步复制技术架构图](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/deep-dive-mgr/deep-dive-mgr-02-02.jpg)

**架构说明**

和上面的传统主从异步复制架构相比，能看到半同步复制的主要区别在于：一个事务要在Replica节点上被apply了，才能向Source节点返回ACK信息，然后Source节点上才能完成commit。选项 `rpl_semi_sync_master_wait_point` 用于设置Source节点什么时候提交事务，可选值有 AFTER_SYNC(默认)、AFTER_COMMIT，**建议采用默认的AFTER_SYNC**。该选项的详细解读见：[#sysvar_rpl_semi_sync_master_wait_point](https://dev.mysql.com/doc/refman/8.0/en/replication-options-source.html#sysvar_rpl_semi_sync_master_wait_point)。

事实上，如果业务系统要求数据一致性等级较高的话，强烈建议选择组复制架构。

## 基于组复制架构
---

MGR是MySQL Group Replication的缩写，即MySQL组复制。

在以往，我们一般是利用MySQL的主从复制或半同步复制来提供高可用解决方案，但这存在以下几个比较严重的问题：

1. 主从复制间容易发生复制延迟，尤其是在5.6以前的版本，以及当数据库实例中存在没有显式主键表时，很容易发生。
1. 主从复制节点间的数据一致性无法自行实现最终一致性。
1. 当主节点发生故障时，如果有多个从节点，无法自动从中选择合适的节点作为新的主节点。
1. 如果采用（增强）半同步复制，那么当有个从节点因为负载较高、网络延迟或其他意外因素使得事务无法及时确认时，也会反过来影响主节点的事务提交。

因为上述几个明显的缺点，因此MySQL推出了全新的高可用解决方案 -- 组复制。

MGR是MySQL 5.7.17开始引入的，但随着5.7版本逐渐退出历史舞台（MySQL 5.7已于2020年10月起不再做大的功能更新，只有修修补补以及针对安全更新），更多MGR相关特性都只在MySQL 8.0上才有。

### MGR技术概要
---

MGR具备以下几个特点：

1. 基于shared-nothing模式，所有节点都有一份完整数据，发生故障时可以直接切换。
1. MGR提供了数据一致性保障，默认是最终一致性，可根据业务特征需要自行调整一致性级别。
1. 支持在线添加、删除节点，节点管理更方便。
1. 支持故障自动检测及自动切换，发生故障时能自动切换到新的主节点，再配合MySQL Router中间件，应用层无需干预或调整。
1. 支持单节点、多节点写入两种模式，可根据架构或业务需要选择哪种方案，不过强烈建议选用单主模式。

### MGR技术架构
---

首先来个MGR的技术架构图：

![MGR技术架构图](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/deep-dive-mgr/deep-dive-mgr-02-03.jpg)

**架构说明**

| 名称| 描述 |
| --- | --- |
| Member | 成员，即MGR中的节点。MGR成员可选角色有Primary（主节点），可响应读写请求；或者Secondary（从节点），只能响应只读请求。|
| Primary | 称为主要节点，主节点，MGR节点角色之一。响应读写事务请求。|
| Secondary | 称为辅助节点，从节点，MGR节点角色之一。只能响应只读事务请求。|
| Consensus | 共识。在MGR中，一个事务发起后，要广播到各个节点，当多数派节点达成共识（Consensus）后，这个事务才可以被提交。所谓的多数派就是超过半数的节点达成一致，例如总共3个节点，则至少2个节点达成一致。|
| cetfify | 事务认证。在MGR中，一个事务需要进行认证，确认不存在冲突，并且多数派达成一致后，才可以被提交。|

MGR是以Plugin方式嵌入MySQL，部署更灵活方便。

事务从Server层通过钩子（hook）进入MGR API接口层，再分发到各组件层，在组件层完成事务Capture/Apply/Recover，通过复制协议层（Replication Protocol Logics）传输事务，最后经由GCS协调事务在各节点的最终一致性。

MGR节点间由组通信系统（GCS）提供支持，它提供了故障检测机制、组成员角色管理，以及安全且有序的消息传递，这些机制可确保在各节点间一致地复制数据。这项技术的核心是Paxos算法的实现，在MySQL里称之为XCom，由它充当MGR的通信引擎。

对于要提交的事务，组中的多数派节点必须就全局事务序列中给定的事务顺序达成一致。各节点做出决定提交或中止事务的选择，但所有节点都要做出相同的决定。如果发生网络分区，导致节点间无法达成一致决定，则在网络恢复前，MGR无法工作。

MGR支持单主和多主两种模式，在单主模式下，各节点会自动选定主节点，只有该主节点能同时读写，而其他（从）节点只能只读。在多主模式下，所有节点都可以进行读写。

**单主（Single-Primary）模式**

![MGR单主模式](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/deep-dive-mgr/single-primary-election.png)
**架构说明**

如上图所示，一开始S1节点是Primary角色，提供读写服务。当它发生故障时，剩下的S2-S5节点会再投票选举出S2作为新的Primary角色提供读写服务，而S1节点再达到一定超时阈值后，就会被踢出。

**多主（Multi-Primary）模式**

![MGR多主模式](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/deep-dive-mgr/multi-primary.png)
**架构说明**

如上图所示，一开始S1-S5所有节点都是Primary角色，都可以提供读写服务，任何一个节点发生故障时，只需要把指向这个节点的流量切换下就行。

上述两种架构模式下，应用端通过MySQL Router连接后端在MGR服务，当后端节点发生切换时，Router会自动感知，对应用端来说几乎是透明的，影响很小，架构上也更灵活。

## 总结
---

MySQL数据库架构通常有以下几种方案：

- 基于异步复制架构，一般用于写少读多，尤其是在要求读请求快速扩展的场景。
- 基于半同步复制架构，一般用于同一个子网中的高可用快速切换场景，对网络抖动非常敏感。
- 基于MGR的高一致性高可靠架构，用于对一致性及可用性要求都较高的业务场景，例如金融级应用。

在金融级应用场景中，强烈建议采用GreatSQL MGR来构建高一致性高可用数据库架构。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
