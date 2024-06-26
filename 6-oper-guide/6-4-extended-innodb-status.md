# 扩展显示InnoDB引擎状态

---

此功能重新组织 `SHOW ENGINE INNODB STATUS` 的输出以提高可读性并提供附加信息。变量`innodb_show_locks_held`控制每个 InnoDB 事务打印时持有的锁数量。

此功能修改了 `SHOW ENGINE INNODB STATUS` 命令如下:

- 在 `BUFFER POOL AND MEMORY` 部分添加了有关 InnoDB 内部哈希表大小（以字节为单位）的扩展信息；还添加了缓冲池大小（以字节为单位）。
- 添加了额外的 LOG 部分信息。

## 系统参数

### innodb_show_locks_held

| System Variable Name | innodb_show_locks_held |
| -------------------- | ---------------------- |
| Command-line         | YES                    |
| Config file          | YES                    |
| Variable Scope       | Global                 |
| Dynamic Variable     | YES                    |
| Data type            | ULONG                  |
| Default              | 10                     |
| Range                | 0-1000                 |

指定为 `SHOW ENGINE INNODB STATUS` 中的每个 InnoDB 事务打印而持有的锁数。

### innodb_print_lock_wait_timeout_info

| System Variable Name | innodb_print_lock_wait_timeout_info |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Boolean                             |
| Default              | OFF                                 |

使 InnoDB 将所有锁等待超时错误的信息写入日志文件。

这允许找出有关失败事务的详细信息，最重要的是，找到阻塞事务的详细信息。可以根据 `PROCESSLIST_ID` 字段从`EVENTS_STATMENTS_CURRENT`表中获取查询字符串，该字段对应于日志输出中的 `thread_id` 。

考虑到阻塞事务通常是多条语句，可以使用以下查询来获取阻塞线程语句历史记录:

```sql
greatsql> SELECT s.SQL_TEXT FROM performance_schema.events_statements_history s
INNER JOIN performance_schema.threads t ON t.THREAD_ID = s.THREAD_ID
WHERE t.PROCESSLIST_ID = %d
UNION
SELECT s.SQL_TEXT FROM performance_schema.events_statements_current s
INNER JOIN performance_schema.threads t ON t.THREAD_ID = s.THREAD_ID
WHERE t.PROCESSLIST_ID = %d;
```

本例中的 `PROCESSLIST_ID` 正是错误日志输出中的线程 ID

## 状态变量

这里的状态变量包含 `SHOW ENGINE INNODB STATUS` 输出中可用的信息，按 `SHOW ENGINE INNODB STATUS` 显示部分组织。如果您熟悉 `SHOW ENGINE INNODB STATUS` 的输出，您可能已经认识到这些变量包含的信息。

### 后台 Master 线程状态

以下变量包含 `SHOW ENGINE INNODB STATUS` 输出的 `BACKGROUND THREAD` 部分中的信息。

```sql
BACKGROUND THREAD
-----------------
srv_master_thread loops: 1207 srv_active, 0 srv_shutdown, 2174337 srv_idle
srv_master_thread log flush and writes: 0
```

InnoDB 有一个源线程，它根据服务器状态每秒执行一次后台任务。如果服务器处于工作负载状态，源线程将运行以下操作: 执行后台表删除；自适应地执行更改缓冲区合并；将重做日志刷新到磁盘；如果需要满足其大小限制，则从字典缓存中逐出表；建立一个检查点。如果服务器空闲:由于检查点年龄而需要，则执行后台表删除、刷新和/或检查重做日志；以完整 I/O 容量执行更改缓冲区合并；如果需要，从字典缓存中逐出表；并设置一个检查点。

> 以下状态变量的范围(Scope)都是全局的（Global）、数据类型（Data type）都是数字（Numeric）

- Innodb_master_thread_active_loops:此变量显示针对活动服务器状态执行上述一秒循环的次数
- Innodb_master_thread_idle_loops:该变量显示在空闲服务器状态下执行上述一秒循环的次数
- Innodb_background_log_sync:该变量显示InnoDB源线程写入和刷新重做日志的次数

### 等待线程的列表及事件计数器

以下变量包含 `SHOW ENGINE INNODB STATUS` 输出的 `SEMAPHORES` 部分中的信息。该输出的一个示例是:

```sql
SEMAPHORES
----------
OS WAIT ARRAY INFO: reservation count 343493
OS WAIT ARRAY INFO: signal count 423594
RW-shared spins 0, rounds 0, OS waits 0
RW-excl spins 0, rounds 0, OS waits 0
RW-sx spins 0, rounds 0, OS waits 0
Spin rounds per wait: 0.00 RW-shared, 0.00 RW-excl, 0.00 RW-sx
```

### Insert Buffer Pool 和 AHI 状态 

以下变量包含 `SHOW ENGINE INNODB STATUS` 输出的 `INSERT BUFFER AND ADAPTIVE HASH INDEX` 部分中的信息。该输出的一个示例是:

```sql
INSERT BUFFER AND ADAPTIVE HASH INDEX
-------------------------------------
Ibuf: size 1, free list len 0, seg size 2, 11 merges
merged operations:
 insert 12, delete mark 0, delete 0
discarded operations:
 insert 0, delete mark 0, delete 0
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
Hash table size 553253, node heap has 0 buffer(s)
0.00 hash searches/s, 0.00 non-hash searches/s
```

> 以下状态变量的范围(Scope)都是全局的（Global）、数据类型（Data type）都是数字（Numeric）

- Innodb_ibuf_free_list:记录当前Insert Buffer中空闲列表的长度
- Innodb_ibuf_segment_size:记录Insert Buffer每个段的大小

### 日志

以下变量包含 `SHOW ENGINE INNODB STATUS` 输出的 `LOG` 部分中的信息。该输出的一个示例是:

```sql
LOG
---
Log sequence number          34360435648
Log buffer assigned up to    34360435648
Log buffer completed up to   34360435648
Log written up to            34360435648
Log flushed up to            34360435648
Added dirty pages up to      34360435648
Pages flushed up to          34360435648
Last checkpoint at           34360435648
Log minimum file id is       151
Log maximum file id is       170
Modified age no less than    34360435648
Checkpoint age               0
Max checkpoint age           5422668288
8931689 log i/o's done, 0.00 log i/o's/second
```

> 以下状态变量的范围(Scope)都是全局的（Global）、数据类型（Data type）都是数字（Numeric）

- Innodb_lsn_current:该变量显示当前日志序列号
- Innodb_lsn_flushed:该变量显示当前已写入并刷新到磁盘的最大 LSN
- Innodb_lsn_last_checkpoint:该变量显示最新完成的检查点的LSN
- Innodb_checkpoint_age:该变量显示当前InnoDB检查点年龄，即当前LSN和最后完成的检查点的LSN之间的差异

### InnoDB Buffer Pool 使用统计信息

以下变量包含 `SHOW ENGINE INNODB STATUS` 输出的 `BUFFER POOL AND MEMORY` 部分中的信息。该输出的一个示例是:

```sql
BUFFER POOL AND MEMORY
----------------------
Total large memory allocated 0
Dictionary memory allocated 832298
Buffer pool size   131056
Buffer pool size, bytes 2147221504
Free buffers       32000
Database pages     99056
Old database pages 36400
Modified db pages  0
Pending reads      0
Pending writes: LRU 0, flush list 0, single page 0
Pages made young 1717203, not young 1531632
0.00 youngs/s, 0.00 non-youngs/s
Pages read 701103, created 1376628, written 1887910
0.00 reads/s, 0.00 creates/s, 0.00 writes/s
No buffer pool page gets since the last printout
Pages read ahead 0.00/s, evicted without access 0.00/s, Random read ahead 0.00/s
LRU len: 99056, unzip_LRU len: 0
I/O sum[0]:cur[0], unzip sum[0]:cur[0]
```

> 以下状态变量的范围(Scope)都是全局的（Global）、数据类型（Data type）都是数字（Numeric）

- Innodb_mem_adaptive_hash:该变量显示自适应哈希索引的当前大小（以字节为单位）
- Innodb_mem_dictionary:该变量显示 InnoDB 内存中数据字典信息的当前大小（以字节为单位）
- Innodb_mem_total:该变量显示InnoDB在进程堆内存中分配的内存总量（以字节为单位）
- Innodb_buffer_pool_pages_LRU_flushed:该变量显示已从 LRU 列表中刷新的缓冲池页面总数，即必须刷新太旧的页面，以便为缓冲池腾出空间来读取新数据页面
- Innodb_buffer_pool_pages_made_not_young:该变量显示由于 innodb_old_blocks_time 变量设置，缓冲池页面在 LRU 列表中未标记为最近访问的次数
- Innodb_buffer_pool_pages_made_young:此变量显示缓冲池页面由于其访问而被移动到 LRU 列表的年轻端的次数，以防止其从缓冲池中逐出
- Innodb_buffer_pool_pages_old:此变量显示被视为旧的缓冲池页面总数

### InnoDB 事务统计信息

以下变量包含 `SHOW INNODB STATUS` 输出的 `TRANSACTIONS` 部分中的信息。该输出的一个示例是:

```sql
TRANSACTIONS
------------
Trx id counter 15689
Purge done for trx's n:o < 15688 undo n:o < 0 state: running but idle
History list length 0
LIST OF TRANSACTIONS FOR EACH SESSION:
---TRANSACTION 421695624703352, not started
0 lock struct(s), heap size 1128, 0 row lock(s)
---TRANSACTION 421695624702504, not started
0 lock struct(s), heap size 1128, 0 row lock(s)
---TRANSACTION 421695624701656, not started
0 lock struct(s), heap size 1128, 0 row lock(s)
```

> 以下状态变量的范围(Scope)都是全局的（Global）、数据类型（Data type）都是数字（Numeric）

- Innodb_max_trx_id:该变量显示下一个空闲交易 ID 号
- Innodb_oldest_view_low_limit_trx_id:该变量显示最高事务 ID，在该 ID 之上，当前最早打开的读取视图看不到任何事务更改。如果没有开放视野则为零
- Innodb_purge_trx_id:此变量显示其记录尚未清除的最旧的事务 ID
- Innodb_purge_undo_no:记录undo日志的purge操作数量


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
