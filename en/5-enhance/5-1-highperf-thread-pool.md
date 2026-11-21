# Thread Pool
---

## Introduction

By default, GreatSQL creates a worker thread for each client connection (**one-thread-per-connection**). Because system resources are limited, and creating and destroying threads also incurs extra overhead, in this mode the overall database throughput drops noticeably when the number of connections spikes suddenly.

The thread pool feature introduced in GreatSQL avoids the throughput degradation caused by resource contention when connections spike suddenly, making GreatSQL's performance more stable.

The basic principle of the thread pool is as follows: a certain number of worker threads are created in advance. When the listener thread is responsible for listening for new requests, a thread is allocated from the worker threads to serve the request. The worker thread is not destroyed after finishing its service; instead, it remains in the pool waiting for the next request, avoiding the extra overhead of frequently creating and destroying threads.

Enabling the thread pool feature effectively reduces the number of threads, thereby reducing context switches and lock contention. The thread pool feature works best for OLTP workloads (especially more CPU-intensive query requests).

To enable the thread pool feature, set the `thread_handling` parameter to **pool-of-threads** in the *[mysqld]* section of the *my.cnf* configuration file, and restart the GreatSQL service:

```ini
[mysqld]
thread_handling = "pool-of-threads"
```

The default values of the thread pool options are generally suitable for most scenarios; in some cases, minor tuning is needed.

## Connection Priority Scheduling

Although the thread pool limits the number of concurrently running queries, the number of open transactions may still be high, because connections with started transactions are placed at the end of the queue. A larger number of open transactions has many effects on the queries currently running. To improve performance, a new `thread_pool_high_prio_tickets` variable is introduced.

This variable controls the high-priority queue policy. Each new connection is allocated this many tickets to enter the high-priority queue. Whenever a query must be queued for later execution because no thread is available, the thread pool places the connection in the high-priority queue if the following conditions are met:

- The connection has an open transaction on the server.

- The number of high-priority tickets of this connection is non-zero.

If both of the above conditions are true, the connection is placed in the high-priority queue, and its ticket value is decremented. Otherwise, the connection is placed in the common queue with the initial ticket value specified by this option.

Each time the thread pool looks for a new connection to process, it first checks the high-priority queue, and only picks a connection from the common queue when the high-priority queue is empty.

The goal is to minimize the number of open transactions on the server. In many cases, it is beneficial to give short-running transactions a better chance to commit faster, thereby releasing server resources and locks, without waiting in the same queue as other connections that are about to start new transactions or have already exhausted their resources. High-priority tickets.

The default thread pool behavior is to always place events from started transactions into the high-priority queue, because we believe this leads to better performance in the vast majority of cases.

When the value is 0, all connections are always placed in the common queue, i.e., priority scheduling is not used as in the original implementation in MariaDB. The higher the value, the greater the chance that each transaction enters the high-priority queue and commits before being placed in the common queue.

In some cases, it may be necessary to prioritize all statements of a specific connection, whether they are executed as part of a multi-statement transaction or in autocommit mode. Conversely, some connections may need to use the low-priority queue unconditionally for all statements. To achieve this, a new `thread_pool_high_prio_mode` variable is introduced in GreatSQL.

## Low-Priority Queue Limitation

One situation that can limit thread pool performance or even lead to deadlock under high concurrency is thread group oversubscription, where the oversubscription limit is reached by active threads, but all/most worker threads are actually waiting for locks currently held by transactions of another connection that is not currently in the thread pool.

In this case, those threads in the pool that mark themselves as inactive do not count against the oversubscription limit. Therefore, the number of threads in the pool (both active and waiting threads) keeps increasing until it reaches the `thread_pool_max_threads` value. If the connection executing the lock-holding transaction has successfully entered the thread pool by this time, we get a large number (depending on the `thread_pool_max_threads` value) of concurrently running threads, resulting in poor performance. Otherwise, we encounter a deadlock, because no more threads can be created to process these transactions and release the locks.

When the total number of worker threads (active and waiting) reaches the oversubscription limit, this can be prevented by limiting the low-priority queue. That is, if there are too many worker threads, do not start new transactions and create new threads until the queued events from started transactions have been processed.

## Handling Long Network Waits

Certain types of workloads (large result sets, BLOBs, slow clients) may wait for a long time on network I/O (socket reads and writes). Whenever the server waits, this should be communicated to the thread pool, so that it can start a new query by waking up a waiting thread or, occasionally, creating a new thread. This implementation has been ported from the MariaDB patch MDEV-156.

## New System Variables

### thread_pool_idle_timeout

| System Variable Name | thread_pool_idle_timeout            |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 60 (seconds)                        |

This variable can be used to limit how long idle threads should wait before exiting.

### thread_pool_high_prio_mode

| System Variable Name | thread_pool_high_prio_mode          |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global, Session                     |
| Dynamic Variable     | YES                                 |
| Data type            | String                              |
| Default              | transactions                        |
| Allowed values       | transactions, statements, none      |

This variable is used to provide more fine-grained control over global or per-connection high-priority scheduling.
The following values are allowed:

- `transactions (default)`: In this mode, only statements from started transactions can enter the high-priority queue, depending on the number of high-priority tickets currently available in the connection (see thread_pool_high_prio_tickets).
- `statements`: In this mode, all individual statements enter the high-priority queue, regardless of the connection's transaction state and the number of available high-priority tickets. This value can be used to prioritize AUTOCOMMIT transactions or other types of statements, such as administrative statements of a specific connection. Note that setting this globally basically disables high-priority scheduling, because in this case all statements from all connections will use one queue (the high-priority queue).
- `none`: This mode disables the high-priority queue for a connection. Some connections (such as monitoring) may be insensitive to execution latency and/or never allocate any server resources that would affect the performance of other connections, so high-priority scheduling is not really needed. Note that setting thread_pool_high_prio_mode globally to none has basically the same effect as setting it globally to statements: all connections will always use one queue (here, the low-priority queue).

### thread_pool_high_prio_tickets

| System Variable Name | thread_pool_high_prio_tickets       |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global, Session                     |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 4294967295                          |

This variable controls the high-priority queue policy. Each new connection is allocated this many tickets when entering the high-priority queue. Setting this variable to 0 disables the high-priority queue.

### thread_pool_max_threads

| System Variable Name | thread_pool_max_threads             |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 100000                              |

This variable can be used to limit the maximum number of threads in the pool. Once this number is reached, no new threads are created.

### thread_pool_oversubscribe

| System Variable Name | thread_pool_oversubscribe           |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 3                                   |

The larger this parameter value, the more threads can run simultaneously. If the value is less than 3, more sleeping and waking may occur.

### thread_pool_size

| System Variable Name | thread_pool_size                    |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | Number of processors                |

This variable can be used to define the number of threads that can use the CPU at the same time.

### thread_pool_stall_limit

| System Variable Name | thread_pool_stall_limit             |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | NO                                  |
| Data type            | Numeric                             |
| Default              | 500 (ms)                            |

The number of milliseconds before a running thread is considered stalled. When this limit is reached, the thread pool wakes up or creates another thread. This is used to prevent long-running queries from monopolizing the pool.

Tip: In high-concurrency scenarios, if `thread_pool_size` is set too small, or `thread_pool_stall_limit` uses the default value (i.e., 500), and the SQL efficiency of each request is low, the thread pool may fail to respond to switches in time, and some connection requests may fail. In this case, consider increasing `thread_pool_size` and increasing the `thread_pool_stall_limit` value.

## New Status Variables
In the thread pool, 2 status variables have also been added:

- **Threadpool_idle_threads**

Global level. This status variable displays the number of idle threads in the pool.

- **Threadpool_threads**

Global level. This status variable displays the number of threads in the pool.

References: [Thread Pool Details - Tencent Architect](https://zhuanlan.zhihu.com/p/425570523).


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
