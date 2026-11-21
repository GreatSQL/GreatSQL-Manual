# MGR Fast Single-Primary Mode
---

## Introduction

GreatSQL adds a new working mode: **fast single-primary mode**. In this mode, the original MGR certification database approach is no longer used. Instead, it determines how to perform flow control based on whether the current Binlog can be flushed to disk in a timely manner, avoiding OOM.

The new system variable `group_replication_single_primary_fast_mode` is added to enable the fast single-primary mode or select which mode to use.

The fast single-primary mode is especially suitable for scenarios such as cross-data-center deployment, stress testing, and environments with low memory requirements.

This mode is weaker than traditional asynchronous replication but stronger than semi-synchronous replication, and it does not have the problem of the MGR default certification database potentially consuming a large amount of memory.

The system variable `group_replication_single_primary_fast_mode` accepts values 0, 1, and 2, which represent the following:
- 0, means the fast single-primary mode is not used. This is the default value.
- 1, means the fast single-primary mode is used, supporting concurrent replay. **It is strongly recommended to set 1, i.e., enable the fast single-primary mode**.
- 2, means the fast single-primary mode is used, but parallel replay is not supported. It accelerates Relay Log flushing to disk and makes the replica consume fewer resources.

| System Variable Name    | group_replication_single_primary_fast_mode |
| --- | --- |
| Variable Scope    | Global |
| Dynamic Variable    | NO |
| Type | Enumeration |
| Permitted Values |    [0 | 1 | 2] |
| Default    | 0 |
| Description    | Sets whether to enable the fast single-primary mode. It is strongly recommended to enable it (i.e., set to 1). |

## Understanding the Optimization Mechanism

The MGR transaction conflict detection mechanism requires each MGR node to maintain a certification database. The size of the certification database itself depends on the replication lag between the primary and secondary nodes. If the lag is large, the certification database grows larger and consumes a large amount of memory.

The fast single-primary mode can only be applied in single-primary mode. In single-primary mode, transaction conflicts theoretically do not exist, so conflict detection is no longer needed, and the corresponding transaction certification database does not need to be stored in memory, reducing memory resource consumption.

At the same time, the fast single-primary mode also reduces the time overhead of transaction conflict detection itself.

In the fast single-primary mode, GreatSQL also optimizes the [last_committed](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_transaction_dependency_tracking) calculation logic when generating the [Binary Log](../2-about-greatsql/4-3-greatsql-binary-log.md), which helps improve the overall processing flow of the [Relay Log](../2-about-greatsql/4-4-greatsql-relay-log.md) Applier thread on secondary nodes, ensuring that the Applier thread can flush the Relay Log to disk in a timely manner, reducing the risk of memory growth caused by untimely Relay Log flushing.

## Notes

1. When the fast single-primary mode is enabled, **multi-primary mode is not supported**.

2. **The setting must be the same on all nodes**, i.e., the value of the system variable `group_replication_single_primary_fast_mode` must be identical; otherwise, MGR cannot be started.

3. Starting from MySQL 8.0.27, a **single leader** mode was added (corresponding to the `group_replication_paxos_single_leader` option). It is recommended not to enable this feature, because enabling it may cause the risk of a complete MGR cluster crash. GreatSQL's optimizations for MGR already cover this aspect.

4. When switching the primary node (whether manually or automatically during a failure), if the new primary node has `group_replication_consistency=EVENTUAL` set and the fast single-primary mode is not enabled, the new primary can immediately provide read/write services, but some write transactions may be rolled back due to conflicts caused by delay. When the fast single-primary mode is enabled, the new primary needs to wait for transaction replay to complete before it can provide read/write services. Before that, requests such as DML will be blocked, with the status displayed as `hook transaction begin`. Only after transaction replay completes can services be provided normally, which is similar to the behavior when `group_replication_consistency=BEFORE_ON_PRIMARY_FAILOVER` is set.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
