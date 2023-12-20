# 系统架构
---

GreatSQL和MySQL一样，是个单机系统。同样地，GreatSQL也是三层体系结构。

除了传统的主从复制（Replication），还可以利用组复制（Group Replication）构建高可靠和读写扩展架构。

## 1. GreatSQL体系架构

---

GreatSQL数据库区别于其他数据库的一个特点就是其可插拔的表存储引擎，特别需要注意的是，**存储引擎是基于表的，而不是数据库**。

![图片](./3-greatsql-arch-01.png#pic_center)

<center>图2_GreatSQL8.0 版本体系架构图</center>

总体来说，GreatSQL8.0 可以分为**连接层、服务层、存储引擎层**

### 1.1 连接层（Client Connectors）

连接层又名为`客户端连接器（Client Connectors）`作用是提供与GreatSQL服务器建立的支持。

客户端通过TCP/IP协议与GreatSQL服务器建立连接，每个连接对应一个线程。连接管理还包括了连接池技术，以复用已经建立好的连接，减少重复建立连接的开销。

而且几乎支持所有主流的服务端编程技术，主要完成一些类似于连接处理、授权认证、及相关的安全方案。

会对从 TCP 传输过来的账号密码做身份认证、权限获取

- 用户名或密码不对，会收到`Access denied for user`错误，客户端程序结束执行

例如:

```bash
$ mysql -uroot -p
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
```

- 用户名密码认证通过，会从权限表查出账号拥有的权限与连接关联，之后的权限判断逻辑，都将依赖于此时读到的权限

### 1.2 服务层（GreatSQL Server）

服务层是GreatSQL Server的核心，主要包含连接器、分析器、优化器、执行器等，涵盖 GreatSQL 的大多数核心服务功能，以及所有的内置函数（如日期、时间、数学和加密函数等），所有跨存储引擎的功能都在这一层实现，比如存储过程、触发器、视图等。

**Ⅰ.SQL Interface: SQL接口**

接收用户的SQL命令，并且返回用户需要查询的结果。比如`SELECT … FROM`就是调用`SQL Interface`，GreatSQL支持DML、DDL、存储过程、视图、触发器、自定义函数等多种SQL语言接口

**同时还支持NoSQL**，NoSQL泛指非关系型数据库和数据存储。随着互联网平台的规模飞速发展，传统的关系型数据库已经越来越不能满足需求。从5.6版本开始，GreatSQL就开始支持简单的NoSQL存储功能。GreatSQL8.0 版本对这一功能做了优化，以更灵活的方式实现NoSQL功能，不再依赖模式（schema）。

**Ⅱ.Parser: 解析器**

在解析器中对 SQL 语句进行语法分析、语义分析。将 SQL 语句分解成数据结构，并将这个结构传递到后续步骤，以后 SQL 语句的传递和处理就是基于这个结构的，并且判断你输入的这个 SQL 语句是否满足 GreatSQL 语法。

**Ⅲ.Optimizer: 查询优化器**

在开始执行之前，还要先经过优化器的处理。

SQL语句在语法解析之后、查询之前会使用查询优化器确定 SQL 语句的执行路径，生成一个执行计划，可以使用`EXPLAIN`命令查看执行计划。

这个执行计划表明应该**使用哪些索引**进行查询（全表检索还是使用索引检索），表之间的连接顺序如何，最后会按照执行计划中的步骤调用存储引擎提供的方法来真正的执行查询，并将查询结果返回给用户。

例如下面的 JOIN 语句：

```sql
greatsql> SELECT * FROM tb1 JOIN tb2 USING(ID) WHERE tb1.a=1 and tb2.a=2;
```

那就有两种方法可以选择：

- 第一种，**先取表 tb1** 里 a=1 的记录的ID值，再根据 ID 关联表 tb2 ，然后再判断 tb2 里面 a 的值是否等于 2
- 第二种，**先取表 tb2** 里面的 a=2 记录的 ID 值，在根据 ID 值关联 tb1 ，再判断 tb1 里面 a 的值是否等于 10

执行的结果肯定是一致的，但是效率就大不相同了，所以我们要选择用小的数据集去驱动大的数据集，也就是**小表驱动大表**。

**Ⅳ.Caches & Buffers：查询缓存组件**

GreatSQL 内部维持着一些 `Cache` 和 `Buffer`，比如 `Query Cache` 用来缓存一条 SELECT 语句的执行结果，如果能够在其中找到对应的查询结果，那么就不必再进行查询解析、优化和执行的整个过程了，直接将结果反馈给客户端。

但是在 GreatSQL 8.0 版本及以上中删除了查询缓存功能,因为查询缓存必须要两条SQL语句完全一模一样，否则是不能触发查询缓存，非常的鸡肋~

### 1.3 引擎层（Storage Engines）

**Ⅰ.存储引擎层**

真正的负责了 GreatSQL 中数据的存储和提取，对物理服务器级别维护的底层数据执行操作，服务器通过API与存储引擎进行通信。

存储引擎的优势在于，各式各样的存储引擎都具备独特的特性，从而能够针对特定的应用需求建立不同存储引擎表。

GreatSQL 支持的存储引擎如下：

```sql
greatsql> SHOW ENGINES;
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                    | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| FEDERATED          | NO      | Federated MySQL storage engine                                             | NULL         | NULL | NULL       |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                         | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, and foreign keys | YES          | YES  | YES        |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                  | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                      | NO           | NO   | NO         |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                                      | NO           | NO   | NO         |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears)             | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                                         | NO           | NO   | NO         |
| ARCHIVE            | YES     | Archive storage engine                                                     | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
9 rows in set (0.00 sec)
```

得益于 GreatSQL 数据库的开源特性，用户得以依据存储引擎接口自行编写个性化的存储引擎。当对某一种存储引擎的性能或功能存有疑虑时，可通过优化代码实现所需特性，这正展示了开源所赋予我们的便捷与力量。

**Ⅱ.存储层**

所有的数据，数据库、表的定义，表的每一行的内容，索引，都是存在 **文件系统上**，以文件的方式存在的，并完成与存储引擎的交互。当然有些存储引擎比如InnoDB，也支持不使用文件系统直接管理裸设备，但现代文件系统的实现使得这样做没有必要了。在文件系统之下，可以使用本地磁盘，可以使用DAS、NAS、SAN等各种存储系统。

所以可以把 GreatSQL 的架构图简化如下：

![图片](./3-greatsql-arch-02.png#pic_center)

## 2. 基于传统主从复制架构
---

以两个节点为例，可以构建单向的复制架构，也可以是双向复制架构。一般情况下，建议采用单向复制，这样的话，架构方案比较简单，也不容易误操。

单向复制架构即由一个主节点（Master/Source）和一个从节点（Slave/Replicas）构成。主节点接收到应用端发出的读写请求，并将对数据库产生变化的事件对应的操作记录到二进制日志（binlog/binary log）中，然后将二进制日志发送到从节点。从节点接将二进制日志转储到本地成为中级日志（relay log），然后再读取中级日志，将这些变更操作应用到本地数据库中。这样就完成主从间的逻辑复制了。

在单向复制架构中，通常要把从节点设置为只读模式（`read_only = 1` & `super_read_only = 1`），避免应用端或DBA误操作写入数据造成主从间数据不一致，并可能导致主从复制失败停止。

如果是采用双向复制架构，则也强烈建议只在某个节点上发起写请求，避免双向都写数据可能造成冲突的风险。或者从业务架构上进行区分，不同节点上处理不同的业务数据对象，避免造成冲突。

经典主从单向复制架构如下图所示：

![传统主从复制技术架构图](./3-greatsql-arch-03.png#pic_center)

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

![半同步复制技术架构图](./3-greatsql-arch-04.png#pic_center)

**架构说明**

和上面的传统主从异步复制架构相比，能看到半同步复制的主要区别在于：一个事务要在Replica节点上被apply了，才能向Source节点返回ACK信息，然后Source节点上才能完成commit。选项 `rpl_semi_sync_master_wait_point` 用于设置Source节点什么时候提交事务，可选值有 AFTER_SYNC(默认)、AFTER_COMMIT，**建议采用默认的AFTER_SYNC**。该选项的详细解读见：[#sysvar_rpl_semi_sync_master_wait_point](https://dev.mysql.com/doc/refman/8.0/en/replication-options-source.html#sysvar_rpl_semi_sync_master_wait_point)。

事实上，如果业务系统要求数据一致性等级较高的话，强烈建议选择组复制架构。

## 3. 基于组复制架构
---

MGR是MySQL Group Replication的缩写，即MySQL组复制。

在以往，我们一般是利用MySQL的主从复制或半同步复制来提供高可用解决方案，但这存在以下几个比较严重的问题：

1. 主从复制间容易发生复制延迟，尤其是在5.6以前的版本，以及当数据库实例中存在没有显式主键表时，很容易发生。
1. 主从复制节点间的数据一致性无法自行实现最终一致性。
1. 当主节点发生故障时，如果有多个从节点，无法自动从中选择合适的节点作为新的主节点。
1. 如果采用（增强）半同步复制，那么当有个从节点因为负载较高、网络延迟或其他意外因素使得事务无法及时确认时，也会反过来影响主节点的事务提交。

因为上述几个明显的缺点，因此MySQL推出了全新的高可用解决方案 -- 组复制。

MGR是MySQL 5.7.17开始引入的，但随着5.7版本逐渐退出历史舞台（MySQL 5.7已于2020年10月起不再做大的功能更新，只有修修补补以及针对安全更新），更多MGR相关特性都只在MySQL 8.0上才有。

### 3.1 MGR技术概要
---

MGR具备以下几个特点：

1. 基于shared-nothing模式，所有节点都有一份完整数据，发生故障时可以直接切换。
1. MGR提供了数据一致性保障，默认是最终一致性，可根据业务特征需要自行调整一致性级别。
1. 支持在线添加、删除节点，节点管理更方便。
1. 支持故障自动检测及自动切换，发生故障时能自动切换到新的主节点，再配合MySQL Router中间件，应用层无需干预或调整。
1. 支持单节点、多节点写入两种模式，可根据架构或业务需要选择哪种方案，不过强烈建议选用单主模式。

### 3.2 MGR技术架构
---

首先来个MGR的技术架构图：

![MGR技术架构图](./3-greatsql-arch-05.png#pic_center)

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

![MGR单主模式](./3-greatsql-arch-06.png#pic_center)
**架构说明**

如上图所示，一开始S1节点是Primary角色，提供读写服务。当它发生故障时，剩下的S2-S5节点会再投票选举出S2作为新的Primary角色提供读写服务，而S1节点在达到一定超时阈值后，就会被踢出。

**多主（Multi-Primary）模式**

![MGR多主模式](./3-greatsql-arch-07.png#pic_center)
**架构说明**

如上图所示，一开始S1-S5所有节点都是Primary角色，都可以提供读写服务，任何一个节点发生故障时，只需要把指向这个节点的流量切换下就行。

上述两种架构模式下，应用端通过MySQL Router连接后端在MGR服务，当后端节点发生切换时，Router会自动感知，对应用端来说几乎是透明的，影响很小，架构上也更灵活。

## 4. 总结
---

GreatSQL数据库架构通常有以下几种方案：

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

![greatsql-wx](../greatsql-wx.jpg)
