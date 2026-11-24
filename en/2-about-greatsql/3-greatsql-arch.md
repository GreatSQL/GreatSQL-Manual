# System Architecture

GreatSQL adopts a classic three-layer architecture.

In addition to supporting traditional source-replica replication (Replication), GreatSQL can also use Group Replication to build highly reliable and read/write scalable architectures.

## Three-Layer Architecture

One advantage that distinguishes the GreatSQL database from other databases is its **pluggable storage engines. More suitable storage engines can be selected according to business needs**, for example, using InnoDB and the [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md) makes it very convenient to implement an HTAP architecture.

![GreatSQL Architecture Diagram](./3-greatsql-arch-01.png#pic_center)

In general, the GreatSQL architecture can be divided into the **connection layer, server layer, and storage engine layer**.

### Connection Layer (Client Connectors)

The connection layer is also called the **Client Connectors**. Its role is to connect to the GreatSQL server side.

Clients establish connections with the GreatSQL server through the TCP/IP protocol. Each connection corresponds to a thread (if the [thread pool](../5-enhance/5-1-highperf-thread-pool.md) feature is not enabled). Connection management also includes the [thread pool](../5-enhance/5-1-highperf-thread-pool.md) component to reuse established connections and reduce the overhead of repeatedly establishing connections.

GreatSQL supports mainstream server-side programming languages, mainly completing tasks similar to **connection processing, authorization authentication**, and related security solutions.

GreatSQL performs **identity authentication, privilege validation**, etc., on the account passwords transmitted from TCP/IP.

- When connecting to GreatSQL, if the provided username or password is incorrect, you receive the `Access denied for user` error, and the client program ends execution.

For example:

```
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
```

- After the username and password authentication passes, the privileges owned by the connecting account are queried from the grant tables and associated with the connection. All subsequent privilege judgment logic depends on the grant list read at this time.

### Server Layer (GreatSQL Server)

The server layer is the core of the GreatSQL database, mainly including the **connector, parser, optimizer, executor**, etc. It covers most of GreatSQL's core functions and all built-in functions (such as date, time, math, and encryption functions). All cross-storage-engine functions are implemented in this layer, such as stored procedures, triggers, and views.

The server layer consists of the following main components.

#### SQL Interface

The main role of the SQL Interface is to **receive user SQL requests and return the query results the user needs**. For example, `SELECT` requests. GreatSQL achieves 100% complete compatibility with MySQL and Percona Server for MySQL usage, and supports most common Oracle usage.

#### Parser

The parser performs **syntax analysis and semantic analysis** on SQL statements. SQL statements are decomposed into data structures, and this structure is passed to the components in the next layer. The transmission and processing of SQL statements are based on this structure, and it determines whether the input SQL statement meets the syntax rule requirements.

#### Optimizer

Before executing a SQL request, it must also go through the optimizer's processing.

After syntax parsing and before querying, SQL statements use the query optimizer to **determine the execution path of the SQL statement and generate an optimal execution plan**. The `EXPLAIN` command can be used to view the execution plan.

In the execution plan, you can see information such as whether indexes are used, the join order between multiple tables, the estimated number of records to scan, whether temporary tables are generated, or whether there is additional sorting. Finally, the storage engine interfaces are called according to the steps in the execution plan to execute the query, and the query results are returned to the user.

For example, the following JOIN statement:

```sql
SELECT * FROM tb1 JOIN tb2 USING(ID) WHERE tb1.a=1 and tb2.a=2;
```

There are two methods to choose from:

- The first method: first read the ID value of the records where tb1.a=1, then join table tb2 based on the ID column, and then determine whether the value of tb2.a equals 2.
- The second method: first read the ID value of the records where tb2.a=2, then join table tb1 based on the ID column, and then determine whether the value of tb1.a equals 1.

The results of both methods are the same, but the efficiency can be vastly different. The best approach is to use the smaller dataset to drive the larger dataset, i.e., **driving the large table with the small table**.

#### Query Caches

GreatSQL internally maintains a Query Cache to cache the execution results of `SELECT`. If the corresponding query result can be found in it, there is no need to go through the entire process of query parsing, optimization, and execution; the result can be directly returned to the client.

Note: The query cache feature has been removed in GreatSQL 8.0 and above, because the query cache requires two SQL statements to be exactly the same; otherwise, the existing query cache cannot be hit. It may also cause global lock waits, and in most cases does not provide substantial help for performance improvement.

### Engine Layer (Storage Engines)

#### Storage Engine Layer Overview

The storage engine layer is responsible for the storage and retrieval of user data, performing operations on the underlying data maintained at the physical server level. The server layer interacts with storage engines through various standard interfaces.

GreatSQL supports multiple storage engines, each with unique characteristics. GreatSQL adopts a pluggable storage engine management mechanism. The advantage of this management approach is obvious: more suitable storage engines can be selected according to business needs. For example, using InnoDB and the [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md) makes it very convenient to implement an HTAP architecture.

Execute the SQL command `SHOW ENGINES` to view the currently installed storage engines of GreatSQL.

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

Thanks to the open source nature of the GreatSQL database, users can write personalized storage engines based on the storage engine interfaces. When in doubt about the performance or functionality of a particular storage engine, the required features can be implemented by optimizing the code, which demonstrates the convenience and power that open source gives us.

#### How the Storage Layer Works

All user data files, database and table definitions, the content of each row of tables, and indexes are stored on the **file system** as files, and interact with the storage engines.

Some storage engines, such as InnoDB, support managing raw devices directly without using a file system, but this is generally not recommended, because managing data files through the file system is more convenient, and under the file system, various storage solutions such as local disks, DAS, NAS, and SAN can be used more flexibly.

Finally, the GreatSQL architecture diagram can be simplified as shown below

![GreatSQL Simplified Architecture Diagram](./3-greatsql-arch-02.png#pic_center)

## Architecture Based on Traditional Source-Replica Replication

Taking two nodes as an example, a **one-way replication** architecture or a **two-way replication** architecture can be built. In general, one-way replication is recommended, because the architecture is simpler and less prone to misoperation.

A one-way replication architecture consists of one primary node (Master/Replication Source) and one secondary node (Slave/Replica). The primary node receives read/write requests from applications and records the operations corresponding to events that change the database in the binary log (Binlog/Binary log), then sends the binary log to the secondary node. After receiving it, the secondary node dumps the binary log locally as a relay log (Relay Log), then reads the relay log and applies these change operations to the local database. This completes logical replication between the source and replica.

In a one-way replication architecture, the secondary node is usually set to read-only mode (`read_only=ON` & `super_read_only=ON`), to avoid data inconsistency between source and replica caused by misoperation writes from applications or DBAs, which could also cause source-replica replication to fail and stop.

If a two-way replication architecture is used, it is strongly recommended to only initiate write requests on one node, to avoid the risk of conflicts caused by writing data in both directions. Alternatively, distinguish at the business architecture level, processing different business data objects on different nodes, to avoid conflicts.

The classic source-replica one-way replication architecture is shown below:

![Traditional Source-Replica Replication Architecture Diagram](./3-greatsql-arch-03.png#pic_center)

**Architecture Description**

| Name | Description |
| --- | --- |
| Replication Source/Source | Conventionally called the Master node, also called the primary node or primary database. Responds to read/write requests initiated by the business side.|
| Replica | Conventionally called the Slave node, also called the secondary node or secondary database. Receives Binlog Events sent by the Master node and dumps them into the Relay Log. Generally set to read-only mode, only responsible for responding to read-only requests initiated by the business side, and prohibits the business side from writing data to the Slave node.|
| Binlog | i.e., Binary Log, also called the binary log, a logical log. The option `binlog_format` can be used to set the working mode of Binlog, supporting three options: ROW, STATEMENT, MIXED. **ROW mode is strongly recommended** to improve data consistency between source and replica.|
| Relay Log | Also called the relay log. It is the Binlog Events received by the Slave node from the Master node, dumped locally as the Relay Log. On the Slave node, one or more SQL threads are started to read the Relay Log and apply it to the local node, replaying the data change operations on the Master node.|

For the replication method, asynchronous replication or semi-synchronous replication can be chosen. In general, the asynchronous replication mode is sufficient. If higher data consistency requirements are needed, semi-synchronous replication can be chosen.

Asynchronous replication (async replication) is the default mode of source-replica replication. Its shortcoming is that on the Master node, it is impossible to verify whether the Binlog was successfully written to the Slave node. When a transaction commits, the Binlog is successfully written on the Master node, but if the Master node goes down before the event is sent to the Slave node; or if the event fails to be written into the Relay Log on the Slave node due to faults such as disk damage, the Slave node cannot correctly apply this transaction event, resulting in data inconsistency between the source and replica nodes.

The difference of semi-synchronous replication (semi-sync replication) is that after each transaction commits on the Master node, it does not immediately return to the user, but waits for at least one Slave node to receive the Binlog and successfully write it into the Relay Log before returning. This ensures that this transaction exists on at least one Slave node, thus ensuring the security and consistency of data between the source and replica.

However, semi-synchronous replication also has a risk. When a network failure occurs between the source and replica nodes, sending the Binlog to the Slave node keeps waiting until timeout, and then semi-synchronous replication is downgraded to asynchronous replication. When the network between the source and replica returns to normal, it switches back to semi-synchronous replication. When the timeout threshold `rpl_semi_sync_master_timeout` is set large, it affects the normal requests of the business side, causing business freezes.

The semi-synchronous replication architecture is shown below:

![Semi-Synchronous Replication Architecture Diagram](./3-greatsql-arch-04.png#pic_center)

**Architecture Description**

Compared with the traditional source-replica asynchronous replication architecture above, the main difference of semi-synchronous replication can be seen: a transaction must be applied on the Slave node before the ACK information is returned to the Master node, and then the Master node can complete the commit. The option `rpl_semi_sync_master_wait_point` is used to set when the Master node commits transactions. The selectable values are AFTER_SYNC (default) and AFTER_COMMIT. **It is recommended to use the default AFTER_SYNC**. For a detailed interpretation of this option, see: [rpl_semi_sync_master_wait_point](https://dev.mysql.com/doc/refman/8.0/en/replication-options-source.html#sysvar_rpl_semi_sync_master_wait_point).

In fact, if the business system requires a high level of data consistency, the Group Replication architecture is strongly recommended.

## Architecture Based on Group Replication

MGR is the abbreviation of Group Replication, i.e., group replication.

In the past, we generally used source-replica replication or semi-synchronous replication to provide high availability solutions, but there are several serious problems:

1. Replication delay easily occurs in source-replica replication, especially in versions before 5.6, and when there are tables without explicit primary keys in the database instance.
1. Data consistency between source-replica replication nodes cannot achieve final consistency by itself.
1. When the primary node fails, if there are multiple secondary nodes, it is impossible to automatically select an appropriate node as the new primary node.
1. If (enhanced) semi-synchronous replication is used, when a secondary node cannot confirm transactions in time due to high load, network latency, or other unexpected factors, it in turn affects transaction commits on the primary node.

Because of the above obvious shortcomings, a new high availability solution was launched: Group Replication.

MGR was introduced starting from 5.7.17/8.0. However, as the 5.7 version gradually leaves the historical stage (no major feature updates since October 2020, only patching and security updates), more MGR-related features are only supported on 8.0.

### MGR Technical Overview

MGR has the following characteristics:

1. Based on the shared-nothing mode, all nodes have a complete copy of data, and can switch directly in the event of a failure.
1. Provides data consistency guarantees. The default is final consistency, and the consistency level can be adjusted according to business characteristics.
1. Supports online addition and removal of nodes, making node management more convenient.
1. Supports automatic fault detection and automatic switchover. In the event of a failure, it can automatically switch to a new primary node. Combined with the MySQL Router middleware, the application layer does not need to intervene or adjust.
1. Supports single-node and multi-node write modes. The appropriate solution can be selected based on architecture or business needs, but single-primary mode is strongly recommended.

### MGR Technical Architecture

First, a diagram of the MGR technical architecture:

![MGR Technical Architecture Diagram](./3-greatsql-arch-05.png#pic_center)

**Architecture Description**

| Name| Description |
| --- | --- |
| Member | A member, i.e., a node in MGR. MGR members can take the role of Primary (primary node), which can respond to read/write requests; or Secondary (secondary node), which can only respond to read-only requests.|
| Primary | Called the primary node or master node, one of the MGR node roles. Responds to read/write transaction requests.|
| Secondary | Called the auxiliary node or secondary node, one of the MGR node roles. Can only respond to read-only transaction requests.|
| Consensus | Consensus. In MGR, after a transaction is initiated, it is broadcast to all nodes. Only when the majority of nodes reach Consensus can this transaction be committed. The so-called majority means more than half of the nodes reach agreement, for example, with a total of 3 nodes, at least 2 nodes must agree.|
| certify | Transaction certification. In MGR, a transaction needs to be certified, confirming that there is no conflict, and only after the majority reaches agreement can it be committed.|

MGR is embedded in GreatSQL as a Plugin, making deployment more flexible and convenient.

Transactions enter the MGR API interface layer through hooks in the Server layer, and are then distributed to each component layer. In the component layer, transaction Capture/Apply/Recover is completed, and transactions are transmitted through the Replication Protocol Logics layer. Finally, GCS coordinates the final consistency of transactions among nodes.

MGR nodes are supported by the Group Communication System (GCS), which provides fault detection mechanisms, group membership role management, and secure and ordered message delivery. These mechanisms ensure consistent data replication among nodes. The core of this technology is the implementation of the Paxos algorithm, called XCom in GreatSQL, which serves as the communication engine of MGR.

For transactions to be committed, the majority of nodes in the group must agree on the order of a given transaction in the global transaction sequence. Each node makes its own decision to commit or abort a transaction, but all nodes must make the same decision. If a network partition occurs, preventing nodes from reaching an agreement, then until the network recovers, MGR members cannot communicate, and MGR replication cannot work normally.

MGR supports single-primary and multi-primary modes. In single-primary mode, nodes automatically select the primary node, and only this primary node can read and write simultaneously, while other (secondary) nodes can only read. In multi-primary mode, all nodes can read and write.

**Single-Primary Mode**

![MGR Single-Primary Mode](./3-greatsql-arch-06.png#pic_center)
**Architecture Description**

As shown in the figure above, initially the S1 node is in the Primary role, providing read/write services. When it fails, the remaining S2-S5 nodes vote to elect S2 as the new Primary role to provide read/write services, while the S1 node is expelled after reaching a certain timeout threshold.

**Multi-Primary Mode**

![MGR Multi-Primary Mode](./3-greatsql-arch-07.png#pic_center)
**Architecture Description**

As shown in the figure above, initially all nodes S1-S5 are in the Primary role and can provide read/write services. When any node fails, it is only necessary to switch the traffic pointing to that node.

In both of the above architecture modes, applications connect to the backend MGR service through MySQL Router. When the backend node switches, the Router automatically detects it, which is almost transparent to applications with minimal impact, and the architecture is also more flexible.

## Summary

The GreatSQL database architecture usually has the following solutions:

- Based on the asynchronous replication architecture, generally used for scenarios with few writes and many reads, especially where read requests need to scale quickly.
- Based on the semi-synchronous replication architecture, generally used for high availability fast switchover scenarios in the same subnet, and is very sensitive to network jitter.
- Based on MGR's high consistency and high reliability architecture, used for business scenarios with high consistency and availability requirements, such as financial-grade applications.

In financial-grade application scenarios, it is strongly recommended to [use GreatSQL MGR to build a high consistency and high availability database architecture, which has been greatly improved and enhanced based on native MGR](../5-enhance/5-2-ha.md).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
