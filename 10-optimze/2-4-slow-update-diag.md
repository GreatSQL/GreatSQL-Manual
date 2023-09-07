# UPDATE执行慢排查分析
---

本文介绍在GreatSQL数据库中，如果UPDATE请求响应较慢如何进行排查分析。

## 1. 写在前面

在开始分析排查先简单了解 UPDATE 请求在 MySQL/GreatSQL 中的生命周期是什么，以及如何执行一个事务。

理解UPDATE的工作过程后，更有利于排查分析慢的原因。

## 2. Update 生命周期

### 2.1 Server 层阶段

**1. 连接器**

客户端发起一个 TCP 请求后，MySQL/GrreatSQL Server 端会负责通信协议处理、线程处理、账号认证、安全检查。

**2. 分析器**

MySQL/GrreatSQL Server 端对一个 SQL 请求进行词法分析（识别 select、from），然后会对语法 进行分析判断语法是否正确。

**3. 优化器**

优化器会分析 SQL 语句，选择合适的索引，根据预结果集判断是否使用全表扫描。

### 2.2 InnoDB 引擎层阶段

#### 2.2.1 事务执行阶段

1. 请求进入 InnoDB 引擎后，首先判断该事务涉及到的数据页是否在buffer pool中（以下简称ibp），不存在则会从磁盘中加载此事务涉及的数据页到ibp中，并对相应的索引数据页加锁。

2. 将修改前的数据写入到 Undo 中，修改后将回滚针执行 Undo log 中修改前的行。

3. 写 redo log buffer 在 BP 中对数据进行修改操作，并将修改后的值写入到 redo log buffer 中等待异步 sync到磁盘。

4. 写 binlog cache，同时将修改的信息记录到 binlog cache 中，等待落盘。如果 binlog cache 不够用时，会写入到 binlog 临时文件。

5. 写 change buffer。如果这个事务需要在二级索引上做修改，写入到 change buffer page 中，等待之后，事务需要读取该二级索引时进行 merge。

#### 2.2.2 事务提交阶段

执行事务提交会进入二阶段提交模式（prepare 阶段和 commit 阶段。

两阶段涉及两个参数（`sync_binlog` 和 `innodb_flush_log_at_trx_commit`）。

1. 事务提交分为 prepare 阶段与 commit 阶段（两阶段提交）。

2. Redo log prepare。

3. Binlog write&fync: 执行器把 binlog cache 里的完整事务和 redo log prepare 中的 xid 写入到 binlog 中。

4. Redo log commit commit。

5. 事务提交，释放行记录持有的排它锁。

6. Binlog 和 redo log 落盘后触发刷新脏页操作。

7. 如果事务发生ROLLBACK，因为系统异常或显示回滚，所有数据变更会变成原来的，通过回滚日志中数据进行恢复。

## 3. 影响事务提交慢的几种情况

**1. 在事务执行阶段**

1. 因为锁等待，包括行锁以及MDL锁，这是通过观察 `sys.innodb_lock_waits` 和 `sys.schema_table_lock_waits` 就能看到锁等待情况。

1. 因为物理I/O较慢或物理I/O代价较高导致，这时通常IOPS或iowait指标较高。

1. 因为buffer pool不够用，需要等待释放部分page，这时通常能看到 `Innodb_buffer_pool_wait_free` 这个状态指标值大于0。

1. 因为binlog & redo log两阶段协同提交，导致落盘慢，这时通常能看到类似 `waiting for handler commit` 的线程状态。

## 4. UPDATE执行慢排查分析

### 4.1 查看当时实例系统性能情况（IO、CPU、memory），排除系统性能干扰

如果 CPU 高、IO 高、wa 大：

先排查慢 SQL，再查当前并发数，一般是大量并发慢 SQL 导致。

如果 CPU 高、IO 中、wa 小：

排查慢 SQL，在查看当前并发数，一般是单个计算 SQL 导致。

如果 CPU 低、IO 高、wa 低：

排查当前占用 io 高的线程，有可能是 page clean 导致或日志刷新频繁导致。

### 4.2 检查数据库状态

执行 `SHOW PROCESSLIST`，查看当前线程是否有下列几种情况：
- converting HEAP to ondisk、copy to tmp table、Copying to group table、Copying to tmp table等状态。
- Copying to tmp table on disk、Creating sort index、Creating tmp table等状态。
- Killed、Rolling back等状态。
- Sorting result、Sending data、Searching rows for update等状态。
- Waiting for XX状态。

如果有，抓紧分析并优化这些正在执行的SQL。

### 4.3 分析SQL语句

通过 `EXPLAIN` 分析SQL的执行情况，是否走索引，是否有额外分组、排序、临时表，以及多表关联查询时驱动表选错等情况。

使用 `PROFILING` 分析SQL语句哪个执行阶段最慢。

### 4.4 分析应用程序执行 SQL 慢的时间

观察是单个 SQL 执行慢，还是所有语句都慢，如果是所有SQL都慢，有可能是那个时段受到其他外部影响，导致数据库整体性能都很差，需要通过系统层的监控工具辅助排查分析。

### 4.5 进行抓包和堆栈分析

使用 `tcpdump` 进行抓包，分析是 MySQL/GreatSQL 返回慢，还是网络慢。

使用 `strace` 分析 MySQL/GreatSQL 内部哪里慢，哪个函数导致的。

UPDATE慢的问题还不止于上面列举的这些情况，本文主要是提供一个排查分析的思路，更多原因还需要进一步具体分析。

另外，本文以UPDATE请求为例，实际上INSERT和DELETE请求的情形也可以采用同样的排查分析思路进行。

**参考资料：**
- [技术分享 | Update更新慢、死锁等问题的排查思路分享](https://mp.weixin.qq.com/s/8EIWAWQD6BPS-j8gKt28Gw)
- [EXPLAIN执行计划中要重点关注哪些要素](https://mp.weixin.qq.com/s/CDKN_nPcIjzA_U5-xwAE5w)
- [PROCESSLIST中哪些状态要引起关注](https://mp.weixin.qq.com/s/vhUmB9JO-Zt2P02gVk4mwg)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
