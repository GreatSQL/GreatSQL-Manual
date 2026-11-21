# Extended InnoDB Engine Status Display

---

This feature reorganizes the output of `SHOW ENGINE INNODB STATUS` to improve readability and provide additional information. The variable `innodb_show_locks_held` controls the number of locks held printed for each InnoDB transaction.

This feature modifies the `SHOW ENGINE INNODB STATUS` command as follows:

- Added extended information about the size of InnoDB internal hash tables (in bytes) in the `BUFFER POOL AND MEMORY` section; also added the buffer pool size (in bytes).
- Added additional LOG section information.

## System Parameters

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

Specifies the number of locks held printed for each InnoDB transaction in `SHOW ENGINE INNODB STATUS`.

### innodb_print_lock_wait_timeout_info

| System Variable Name | innodb_print_lock_wait_timeout_info |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Boolean                             |
| Default              | OFF                                 |

Makes InnoDB write information about all lock wait timeout errors to the log file.

This allows finding out detailed information about the failed transaction and, most importantly, finding the details of the blocking transaction. The query string can be obtained from the `EVENTS_STATEMENTS_CURRENT` table based on the `PROCESSLIST_ID` field, which corresponds to the `thread_id` in the log output.

Considering that the blocking transaction is usually multiple statements, the following query can be used to obtain the statement history of the blocking thread:

```sql
greatsql> SELECT s.SQL_TEXT FROM performance_schema.events_statements_history s
INNER JOIN performance_schema.threads t ON t.THREAD_ID = s.THREAD_ID
WHERE t.PROCESSLIST_ID = %d
UNION
SELECT s.SQL_TEXT FROM performance_schema.events_statements_current s
INNER JOIN performance_schema.threads t ON t.THREAD_ID = s.THREAD_ID
WHERE t.PROCESSLIST_ID = %d;
```

The `PROCESSLIST_ID` in this example is exactly the thread ID in the error log output

## Status Variables

The status variables here contain the information available in the `SHOW ENGINE INNODB STATUS` output, organized by the display sections of `SHOW ENGINE INNODB STATUS`. If you are familiar with the output of `SHOW ENGINE INNODB STATUS`, you may already recognize the information these variables contain.

### Background Master Thread Status

The following variables contain the information in the `BACKGROUND THREAD` section of the `SHOW ENGINE INNODB STATUS` output.

```sql
BACKGROUND THREAD
-----------------
srv_master_thread loops: 1207 srv_active, 0 srv_shutdown, 2174337 srv_idle
srv_master_thread log flush and writes: 0
```

InnoDB has a source thread that performs background tasks once per second based on server status. If the server is under a workload, the source thread runs the following operations: perform background table deletions; adaptively perform change buffer merges; flush the redo log to disk; evict tables from the dictionary cache if needed to satisfy its size limit; establish a checkpoint. If the server is idle: perform background table deletions, flushing, and/or checking the redo log as required by the checkpoint age; perform change buffer merges at full I/O capacity; evict tables from the dictionary cache if needed; and set a checkpoint.

The Scope of the following status variables is all Global, and the Data type is all Numeric.

- Innodb_master_thread_active_loops: This variable shows the number of times the above one-second loop was executed for the active server state
- Innodb_master_thread_idle_loops: This variable shows the number of times the above one-second loop was executed in the idle server state
- Innodb_background_log_sync: This variable shows the number of times the InnoDB source thread wrote and flushed the redo log

### List of Waiting Threads and Event Counters

The following variables contain the information in the `SEMAPHORES` section of the `SHOW ENGINE INNODB STATUS` output. An example of this output is:

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

### Insert Buffer Pool and AHI Status

The following variables contain the information in the `INSERT BUFFER AND ADAPTIVE HASH INDEX` section of the `SHOW ENGINE INNODB STATUS` output. An example of this output is:

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

The Scope of the following status variables is all Global, and the Data type is all Numeric.

- Innodb_ibuf_free_list: Records the length of the free list in the current Insert Buffer
- Innodb_ibuf_segment_size: Records the size of each segment of the Insert Buffer

### Log

The following variables contain the information in the `LOG` section of the `SHOW ENGINE INNODB STATUS` output. An example of this output is:

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

The Scope of the following status variables is all Global, and the Data type is all Numeric.

- Innodb_lsn_current: This variable shows the current log sequence number
- Innodb_lsn_flushed: This variable shows the current maximum LSN written and flushed to disk
- Innodb_lsn_last_checkpoint: This variable shows the LSN of the latest completed checkpoint
- Innodb_checkpoint_age: This variable shows the current InnoDB checkpoint age, i.e., the difference between the current LSN and the LSN of the last completed checkpoint

### InnoDB Buffer Pool Usage Statistics

The following variables contain the information in the `BUFFER POOL AND MEMORY` section of the `SHOW ENGINE INNODB STATUS` output. An example of this output is:

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

The Scope of the following status variables is all Global, and the Data type is all Numeric.

- Innodb_mem_adaptive_hash: This variable shows the current size of the adaptive hash index (in bytes)
- Innodb_mem_dictionary: This variable shows the current size of the data dictionary information in InnoDB memory (in bytes)
- Innodb_mem_total: This variable shows the total amount of memory allocated by InnoDB in process heap memory (in bytes)
- Innodb_buffer_pool_pages_LRU_flushed: This variable shows the total number of buffer pool pages flushed from the LRU list, i.e., pages that had to be flushed because they were too old, to make room in the buffer pool for reading new data pages
- Innodb_buffer_pool_pages_made_not_young: This variable shows the number of times buffer pool pages were not marked as recently accessed in the LRU list due to the innodb_old_blocks_time variable setting
- Innodb_buffer_pool_pages_made_young: This variable shows the number of times buffer pool pages were moved to the young end of the LRU list due to their access, to prevent them from being evicted from the buffer pool
- Innodb_buffer_pool_pages_old: This variable shows the total number of buffer pool pages considered old

### InnoDB Transaction Statistics

The following variables contain the information in the `TRANSACTIONS` section of the `SHOW INNODB STATUS` output. An example of this output is:

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

The Scope of the following status variables is all Global, and the Data type is all Numeric.

- Innodb_max_trx_id: This variable shows the next free transaction ID number
- Innodb_oldest_view_low_limit_trx_id: This variable shows the highest transaction ID above which the currently oldest open read view cannot see any transaction changes. Zero if there is no open view
- Innodb_purge_trx_id: This variable shows the oldest transaction ID whose records have not yet been purged
- Innodb_purge_undo_no: The number of purge operations that record undo logs


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
