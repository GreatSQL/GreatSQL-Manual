# GreatSQL Optimization
---

This article mainly introduces several optimization references for the GreatSQL database.

## GreatSQL Optimization Configuration Reference

Under normal circumstances, when running the GreatSQL database, using [this my.cnf](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example) as a reference is sufficient.

Below, a few key parameter options are briefly explained:

- no-auto-rehash

When the MySQL client logs in, it does not read all metadata, avoiding performance impact and MDL waits.

- skip_name_resolve=ON

DNS reverse resolution is not performed, improving client connection performance.

- default_time_zone="+8:00"

Explicitly specify the time zone, avoiding frequent calls to time zone conversion functions and improving performance. Be sure to adjust this parameter according to the actual situation.

- lock_wait_timeout=3600

Limits the maximum waiting time for table-level locks, MDL locks, backup locks, etc.

- log_error_verbosity=3

Setting it to 3 records more log information, facilitating problem analysis and troubleshooting.

- replica_parallel_type=LOGICAL_CLOCK
- replica_parallel_workers=16

Using LOGICAL_CLOCK mode, the parallel replication thread count can be set up to 2 times the number of logical CPUs, improving the parallel efficiency of SQL threads applying transactions.

- binlog_transaction_dependency_tracking=WRITESET

Using WRITESET mode improves the parallel replay degree of transactions on secondary nodes.

- replica_preserve_commit_order=ON

When secondary nodes replay transactions, the transaction order must be preserved, avoiding data inconsistency with the primary node.

- loose-group_replication_flow_control_mode="DISABLED"

Disables the native MySQL MGR flow control mode, because it is not very useful.

- loose-group_replication_majority_after_mode=ON

In AFTER mode, when an individual node is abnormal, as long as the majority reaches agreement, the entire MGR is not hung.

- loose-group_replication_communication_max_message_size=10M

Sets MGR communication message fragmentation, avoiding sending messages that are too large at once, which causes network congestion and affects MGR performance.

- loose-group_replication_single_primary_fast_mode=1

Enables fast single-primary mode.

- loose-group_replication_request_time_threshold=100

Records events where MGR communication exceeds the threshold, facilitating subsequent checks to confirm whether there is a bottleneck in MGR communication performance.

- loose-group_replication_primary_election_mode=GTID_FIRST

Sets the MGR primary election mode to GTID_FIRST. When a primary switchover occurs, the node with the highest transaction application efficiency is preferentially selected.

- innodb_buffer_pool_size=96G

For a dedicated database server, it can be set to 50% of physical memory first. For example, if the physical memory is 128GB, set `innodb_buffer_pool_size=64G`.

- innodb_log_buffer_size=64M

Setting it to 32-64MB can satisfy most business scenarios.

- innodb_redo_log_capacity=4G

The InnoDB Redo Log is generally set starting from 4GB.

- innodb_doublewrite_pages=128

The default value is 2, which is not enough for most business scenarios. It is recommended to increase it to 128.

- innodb_io_capacity=20000
- innodb_io_capacity_max=40000

If high-end PCIe SSD cards are configured, it can be adjusted higher, for example 50000 - 80000

- innodb_read_io_threads=16
- innodb_write_io_threads=16

Sets the number of InnoDB I/O read/write threads. The default values are both 4, and they can be appropriately increased in high I/O load scenarios.

- innodb_thread_concurrency=0

Does not limit the number of InnoDB parallel threads, allowing it to achieve maximum performance. However, if the parallelism of business requests initiated by the business side always exceeds the number of logical CPUs of the server, frequent CPU scheduling waits may occur. In this case, this option can be set to the number of logical CPUs.

- innodb_spin_wait_delay=20

Adjusts the InnoDB spin delay wait to 20 microseconds (default 6 microseconds). In high-load scenarios, do not set it too low.

- loose-rapid_memory_limit=1G

Sets the memory that can be used during Rapid Engine operation. Default value 1G. If the data volume is large, it should also be appropriately increased. Generally, it can be set to 10% ~ 30% of the total size of InnoDB tablespace files.

- loose-rapid_worker_threads=8

Sets the number of threads that can be used during Rapid Engine operation. Default value is 4. If there are many OLAP-type queries, it can be appropriately increased.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
