# Parallel Replication Replay Optimization

---

## 1. Feature Overview

In source-replica replication or Group Replication clusters, secondary nodes synchronize data by replaying binlog transactions from the relay log. Since binlog is a logical log, the secondary node needs to re-execute transactions, so replication delay is likely in high-concurrency scenarios.

The existing parallel replication mechanism is based on the write-set / logical clock model, using `last_committed` and `sequence_number` to determine whether transactions can be executed in parallel. However, in the traditional implementation, when transactions with dependencies are encountered, the coordination thread blocks subsequent binlog reading and scheduling.

Goals of this optimization:

- Improve parallel replay throughput on secondary nodes
- Reduce scheduling blocking
- Improve replication delay performance
- Enhance high availability stability

---

## 2. Technical Principles

Key transaction fields:

- sequence_number
- last_committed

Parallel rules:

If last_committed = M, sequence_number = N, and M < N, then it is necessary to wait for transactions with sequence_number ≤ M to complete.

---

## 3. Optimization Scheme

Core changes:

- The coordination thread no longer blocks
- Conflicting transactions wait on the worker itself

New mechanisms:

- need_wait marker
- worker wait_for_last_committed_trx
- SIGNAL wake-up

---

## 4. Parameter Description

replica_parallel_wait_mode

- WAIT_ON_SQL_THREAD (old behavior mode, default value)
- WAIT_ON_WORKER_THREAD (new behavior mode, recommended value)

---

## 5. Performance Benefits

- Improved parallelism
- Reduced blocking chains
- Increased throughput
- Lower latency

---

## 6. Summary

By moving the waiting logic from the coordination thread down to the workers, scheduling and execution are decoupled, significantly improving parallel replication efficiency.



**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
