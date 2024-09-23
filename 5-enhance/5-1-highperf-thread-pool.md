# 线程池（Thread pool）
---

##  简介

GreatSQL默认为每个客户端连接创建一个工作线程（**one-thread-per-connection**）。由于系统资源是有限的，并且创建、销毁线程也是有额外开销的，在这种模式下，一旦出现连接数瞬间激增的情况，数据库整体吞吐性能就会明显下降。

GreatSQL中引入线程池（**Thread pool**）特性，可以避免在连接数瞬间激增时因资源竞争而导致系统吞吐下降的问题，使得GreatSQL的性能表现更稳定。

线程池的基本原理为：预先创建一定数量的工作线程（**worker**），当监听线程（**listener**）负责监听新请求时，从工作线程中分配一个线程来提供服务。工作线程在服务结束之后不销毁线程，而是保留在线程池中继续等待下一个请求来临，这就可以避免频繁创建和销毁线程的外开销。

启用线程池特性后将能有效减少线程数量，从而减少上下文（**Context**）切换和锁争用。线程池特性对于OLTP场景（尤其是更耗CPU的查询请求）效果更佳。

在 *my.cnf* 配置文件 *[mysqld]* 区间中将参数 `thread_handling` 值设为 **pool-of-threads** ，并重启GreatSQL服务即可启用线程池特性：

```ini
[mysqld]
thread_handling = "pool-of-threads"
```

线程池相关几个选项采用默认值通常就可以适用于大多数场景，个别情况下还需要做些微调。

##  连接优先级调度

尽管线程池对并发运行的查询数量进行了限制，但打开的事务数量可能仍然很高，因为已启动事务的连接被放入队列末尾。 较多数量的打开事务对当前运行的查询有很多影响。 为了提高性能，引入了新的 `thread_pool_high_prio_tickets` 变量。

该变量控制高优先级队列策略。 每个新连接都会被分配这么多票证以进入高优先级队列。 每当由于没有可用线程而必须排队查询以便稍后执行时，如果满足以下条件，线程池就会将该连接放入高优先级队列：

- 该连接在服务器中有一个打开的事务。

- 此连接的高优先级票据数量非零。

如果上述两个条件都成立，则该连接将被放入高优先级队列，并且其票证值会递减。 否则，连接将被放入公共队列中，并使用此选项指定的初始票证值。

每次线程池寻找新的连接来处理时，首先会检查高优先级队列，只有当高优先级队列为空时才从公共队列中挑选连接。

目标是最大限度地减少服务器中打开的事务数量。 在许多情况下，为短时间运行的事务提供更快提交的机会是有益的，从而释放服务器资源和锁，而无需与即将启动新事务或已耗尽其资源的其他连接在同一队列中等待。 高优先级门票。

默认线程池行为是始终将已启动事务中的事件放入高优先级队列中，因为我们相信这在绝大多数情况下会带来更好的性能。

值为 0 时，所有连接始终放入公共队列中，即不像 MariaDB 中的原始实现那样使用优先级调度。 该值越高，每个事务进入高优先级队列并在放入公共队列之前提交的机会就越大。

在某些情况下，需要对特定连接的所有语句进行优先级排序，无论它们是作为多语句事务的一部分还是在自动提交模式下执行。 反之亦然，某些连接可能需要无条件地对所有语句使用低优先级队列。 为了实现这个新的 `thread_pool_high_prio_mode` 变量，GreatSQL中引入了变量。

##  低优先级队列限制

在高并发下会限制线程池性能甚至导致死锁的一种情况是，由于活动线程达到超额订阅限制而导致线程组超额订阅，但所有/大多数工作线程实际上都在等待事务当前持有的锁 当前不在线程池中的另一个连接。

在这种情况下，池中那些将自己标记为不活动的线程不考虑超额订阅限制。 因此，池中的线程数（活动线程和等待线程）会不断增加，直到达到 thread_pool_max_threads 值。 如果执行持有锁的事务的连接此时已成功进入线程池，我们将获得大量（取决于 `thread_pool_max_threads` 值）并发运行的线程，因此导致性能不佳。 否则，我们会遇到死锁，因为无法创建更多线程来处理这些事务并释放锁。

当工作线程总数（活动线程和等待线程）达到超额订阅限制时，可以通过限制低优先级队列来防止这种情况。 也就是说，如果工作线程太多，请不要启动新事务并创建新线程，直到处理已启动事务中的排队事件。

##  长时间网络等待的处理

某些类型的工作负载（大型结果集、BLOB、慢速客户端）可能会在网络 I/O（套接字读取和写入）上等待较长时间。 每当服务器等待时，都应该将其传达给线程池，以便它可以通过唤醒等待线程或有时创建一个新线程来启动新查询。 此实现已从 MariaDB 补丁 MDEV-156 移植。

##  新增系统参数

### thread_pool_idle_timeout

| System Variable Name | thread_pool_idle_timeout            |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 60 (seconds)                        |

该变量可用于限制空闲线程在退出之前应等待的时间。

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

该变量用于对全局或每个连接的高优先级调度提供更细粒度的控制。
允许设置为使用以下值：

- `transactions （默认）`: 在该模式下，只有已启动事务的语句才能进入高优先级队列，具体取决于连接中当前可用的高优先级票的数量（参见 thread_pool_high_prio_tickets）。
- `statements`: 在这种模式下，无论连接的事务状态和可用的高优先级票数如何，所有单个语句都会进入高优先级队列。该值可用于优先处理 AUTOCOMMIT 事务或其他类型的语句，如特定连接的管理语句。请注意，全局设置该值基本上会禁用高优先级调度，因为在这种情况下，来自所有连接的所有语句都将使用一个队列（高优先级队列）。
- `none`: 该模式禁用连接的高优先级队列。某些连接（如监控）可能对执行延迟不敏感，并且/或者从不分配任何会影响其他连接性能的服务器资源，因此并不真正需要高优先级调度。请注意，全局将 thread_pool_high_prio_mode 设置为 none 与全局将其设置为 statements 的效果基本相同：所有连接将始终使用一个队列（此处为低优先级队列）。

### thread_pool_high_prio_tickets

| System Variable Name | thread_pool_high_prio_tickets       |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global, Session                     |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 4294967295                          |

该变量控制高优先级队列策略。每个新连接进入高优先级队列时都会分配这么多票数。将此变量设置为 0 将禁用高优先级队列。

### thread_pool_max_threads

| System Variable Name | thread_pool_max_threads             |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 100000                              |

该变量可用于限制池中线程的最大数量。一旦达到这个数字，就不会创建新的线程。

### thread_pool_oversubscribe

| System Variable Name | thread_pool_oversubscribe           |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 3                                   |

该参数值越大，可同时运行的线程数就越多，如果该值小于 3，则可能导致更多的睡眠和唤醒。

### thread_pool_size

| System Variable Name | thread_pool_size                    |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | Number of processors                |

该变量可用于定义可以同时使用CPU的线程数。

### thread_pool_stall_limit

| System Variable Name | thread_pool_stall_limit             |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | NO                                  |
| Data type            | Numeric                             |
| Default              | 500 (ms)                            |

正在运行的线程被视为停止之前的毫秒数。当达到这个限制时，线程池将唤醒或创建另一个线程。这用于防止长时间运行的查询独占池。

提示：在高并发场景下，如果 `thread_pool_size` 设置太小，或者 `thread_pool_stall_limit` 采用默认值（也就是500），当每次请求的SQL效率都比较低的话，是有可能会造成线程池切换响应不过来，有些连接请求会失败，这时可以考虑适当加大 `thread_pool_size` 并调大 `thread_pool_stall_limit` 值。

## 新增状态变量
在线程池中，同时增加了2个状态变量：

- **Threadpool_idle_threads**

Global级别，该状态变量显示池中空闲线程的数量。

- **Threadpool_threads**

Global级别，该状态变量显示池中的线程数。

参考资料：[线程池详解 - 鹅厂架构师](https://zhuanlan.zhihu.com/p/425570523)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
