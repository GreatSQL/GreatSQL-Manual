# MGR Data Consistency

---

This article describes how MGR ensures data consistency and security.

## MGR Transaction Consistency
For a "distributed" system like MGR, transaction consistency must be guaranteed across multiple nodes. Whether all nodes are in a normal state, or some nodes are in a fault-repair state, the transaction data on each node must be **eventually consistent**. The so-called **eventual consistency** means that after all write transaction requests have stopped, the transaction data on each node is consistent.

The factors related to MGR data consistency include:
- Node changes, i.e. adding or removing nodes.
- Node fault repair.
- Primary node switchover.

The transaction consistency guarantee level of a node can be set through the option `group_replication_consistency`.

## How to Ensure Transaction Consistency During Primary Node Switchover
In single-primary mode, when the Primary node switches over (whether manually or due to failover), the new Primary node has two optional ways to handle the backlog of transactions:
1. **First option: do not process the backlog of transactions and respond to read/write transaction requests immediately**. In this case, transactions may read old data, or problems such as lost `UPDATE`s and conflicts with newly `INSERT`ed data may occur.
2. **Second option: process the backlog of transactions first, and then respond to read/write transaction requests**. In this case, the new Primary node may take longer to respond to read/write transaction requests, depending on the size of the backlog transaction queue.

## Transaction Data Consistency Guarantees
In MGR, not all events (transactions) are synchronous; some processes are asynchronous, so there may be data delay on the Secondary nodes, meaning that old transaction data may be read on the Secondaries.

By setting the option `group_replication_consistency`, you can control the consistency level of RO (read-only) and RW (read-write) transactions before reading or writing data, avoiding reading old data, or ensuring data is synchronized to other nodes as soon as possible after writing, to meet the consistency level requirements of various application scenarios.

Let's first understand a few basic concepts. Transaction synchronization points can be divided into **transaction synchronization at read time** and **transaction synchronization at write time**. Combined with MGR's transaction mechanism, more specifically they are **before transaction execution (BEFORE)** and **after transaction execution (AFTER)**.

Next, we introduce the selectable levels of the option `group_replication_consistency`.

::: tip Tip
Different transaction consistency levels can be set independently on each node, and session-level changes are also possible, but **this is strongly not recommended**.
:::

### EVENTUAL
At this level, neither RO nor RW transactions wait for the backlog of transactions to be applied first before execution.

This is the default level and also the behavior before this option was introduced. This means the following:
1. RW transactions do not need to wait and may be externalized (broadcast to other nodes) before other nodes.
2. RO transactions may read old data.
3. During Primary node switchover, newly generated RW transactions may be rolled back due to conflicts.

### BEFORE_ON_PRIMARY_FAILOVER
When a Primary node switchover occurs, the new Primary must first wait until all backlog transactions from the old Primary node have been applied, and only then can the switchover be officially completed, the node transitions to the ONLINE state, becomes the new Primary node, and continues to respond to new transaction requests.

This ensures that during failover, clients will not see old data, guaranteeing data consistency. However, clients may also experience delays.

### BEFORE
RW transactions must wait for the backlog of transactions to complete before being applied, and RO transactions must wait before being executed.

This ensures that RO transactions can always read the latest transactions, but for RW transactions, it only waits for the backlog transactions to be applied, without requiring the transactions to be completed on other nodes as well.

### AFTER
It goes one step further than BEFORE, requiring RW transactions to wait until they are applied on other nodes as well. In this way, subsequent transactions can obtain the latest transaction data on any node.

In fact, this level and higher levels should be used with caution, as they may cause other problems. Refer to this article: [Why the AFTER consistency mode is not recommended for MGR](https://mp.weixin.qq.com/s/zy0VUgF_5gJuZYbzNVxPXA).

### BEFORE_AND_AFTER
This consistency level has the highest requirements, requiring transaction data to be synchronized for both RO and RW transactions. That is, RW transactions must wait for the backlog of transactions to complete before being applied, and must also wait for their transaction changes to be applied on all other nodes; RO transactions must also wait for the backlog of transactions to complete before being executed.

## Consistency Level Selection Suggestions
For most scenarios, the default **EVENTUAL** level is sufficient; especially when using single-primary mode, if real-time transaction data reads are needed, you only need to send requests to the Primary node.

Furthermore, if you are worried about reading old transaction data during Primary node switchover, you can raise the level to **BEFORE_ON_PRIMARY_FAILOVER**.

Going further, if you want to read the latest transaction data in a timely manner on the Secondary nodes as well, to improve read scalability, you can raise the level to **BEFORE**.

Higher consistency levels are no longer recommended, as there are more potential risks and bugs.

P.S., it is best to set the same consistency level on all nodes, and do not modify the session-level option values during operation, to avoid unpredictable impacts.


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
