# GreatSQL优化
---

本文主要介绍从GreatSQL数据库的几个优化参考。

## GreatSQL优化配置参考

通常情况下，运行GreatSQL数据库时，采用 [这份my.cnf](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example) 参考就足够了。

下面针对其中的几个关键参数选项稍作解读：

- no-auto-rehash

mysql客户端登入时，不读取全部metadata，避免影响性能以及产生MDL等待。

- skip_name_resolve=ON

不进行DNS反解析，提高用户端连接性能。

- default_time_zone="+8:00"

显示指定时区，避免频繁调用时区转换函数，提升性能。请务必根据实际情况调整本参数。

- lock_wait_timeout=3600

限制表级锁、MDL锁、备份锁等最大等待时长。

- log_error_verbosity=3

设置为3可以记录更多日志信息，便于问题分析排查。

- replica_parallel_type=LOGICAL_CLOCK
- replica_parallel_workers=16

采用LOGICAL_CLOCK模式，并行复制线程数最高可以设置为逻辑CPU数量的2倍，提高SQL线程应用事务的并行效率。

- binlog_transaction_dependency_tracking=WRITESET

采用WRITESET模式提高从节点事务并行回放度。

- replica_preserve_commit_order=ON

从节点回放事务时，要保证事务顺序，避免和主节点数据不一致。

- loose-group_replication_flow_control_mode="DISABLED"

关闭MySQL原生的MGR流控模式，因为其作用不大。

- loose-group_replication_majority_after_mode=ON

在AFTER模式下，当发生个别节点异常时，只要多数派达成一致即可，不会导致整个MGR都被hang住。

- loose-group_replication_communication_max_message_size=10M

设置MGR通信消息分片，避免一次性发送消息太大，导致网络拥塞，影响MGR性能。

- loose-group_replication_single_primary_fast_mode=1

启用快速单主模式。

- loose-group_replication_request_time_threshold=100

记录因MGR通信超过阈值的事件，便于后续检查确认MGR通信性能是否存在瓶颈。

- loose-group_replication_primary_election_mode=GTID_FIRST

设置MGR选主模式为GTID_FIRST，在发生主节点切换时，会优先选择事务应用效率最高的那个节点。

- innodb_buffer_pool_size=96G

如果是专用的数据库服务器，则可以先设置为物理内存的50%。例如物理内存是128GB，则设置`innodb_buffer_pool_size=64G`。

- innodb_log_buffer_size=64M

设置为32-64MB就能满足大部分业务场景。

- innodb_redo_log_capacity=4G

InnoDB Redo Log一般设置为4GB起步。

- innodb_doublewrite_pages=128

默认值为2，不足以应对大部分业务场景，建议调大到128。

- innodb_io_capacity=20000
- innodb_io_capacity_max=40000

配置高端PCIe SSD卡的话，则可以调整的更高，比如 50000 - 80000

- innodb_read_io_threads=16
- innodb_write_io_threads=16

设置InnoDB I/O读写线程数，默认值均为4，在高I/O负载场景下可以适当调大。

- innodb_thread_concurrency=0

不限制InnoDB并行线程数，使其发挥最大性能。但如果业务端发起的业务请求并行度总是超过服务器逻辑CPU数，则可能导致CPU调度频繁等待，此时可以考虑将本选项设置为逻辑CPU的数量。

- innodb_spin_wait_delay=20

调整 InnoDB 自旋延迟等待为 20 微秒（默认 6 微秒），在高负载场景下不要设置太低。

- loose-rapid_memory_limit=1G

设置Rapid引擎运行过程中可使用的内存，默认值1G。如果数据量较大，也应适当提高，一般可以设置为InnoDB表空间文件总大小的10% ~ 30%。

- loose-rapid_worker_threads=8

设置Rapid引擎运行过程中可使用的线程数，默认值为4，如果OLAP类查询较多，可以适当提高。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
