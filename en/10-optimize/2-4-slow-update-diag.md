# Troubleshooting and Analyzing Slow UPDATE Execution
---

This article introduces how to troubleshoot and analyze when UPDATE requests respond slowly in the GreatSQL database.

## Foreword

Before starting the analysis and troubleshooting, first briefly understand what the lifecycle of an UPDATE request is in MySQL/GreatSQL, and how a transaction is executed.

After understanding the working process of UPDATE, it is more helpful to troubleshoot and analyze the reasons for slowness.

## UPDATE Lifecycle

### Server Layer Phase

**1. Connector**

After a client initiates a TCP request, the MySQL/GreatSQL Server side is responsible for communication protocol processing, thread processing, account authentication, and security checks.

**2. Parser**

The MySQL/GreatSQL Server side performs lexical analysis (identifying select, from) on a SQL request, and then performs syntax analysis to determine whether the syntax is correct.

**3. Optimizer**

The optimizer analyzes the SQL statement, selects the appropriate index, and determines whether to use a full table scan based on the estimated result set.

### InnoDB Engine Layer Phase

#### Transaction Execution Phase

1. After the request enters the InnoDB engine, it first determines whether the data pages involved in this transaction are in the buffer pool (hereinafter referred to as ibp). If not, the data pages involved in this transaction are loaded from disk into the ibp, and the corresponding index data pages are locked.

2. The data before modification is written to Undo. After modification, the rollback pointer points to the row before modification in the Undo log.

3. Write Redo Log buffer. The data is modified in the BP, and the modified values are written to the Redo Log buffer, waiting for asynchronous sync to disk.

4. Write binlog cache. At the same time, the modification information is recorded in the binlog cache, waiting to be flushed to disk. If the binlog cache is insufficient, it is written to a binlog temporary file.

5. Write change buffer. If this transaction needs to make modifications on a secondary index, it is written to the change buffer page. Later, when the transaction needs to read this secondary index, a merge is performed.

#### Transaction Commit Phase

Executing a transaction commit enters the two-phase commit mode (prepare phase and commit phase).

Two-phase commit involves two parameters (`sync_binlog` and `innodb_flush_log_at_trx_commit`).

1. Transaction commit is divided into the prepare phase and the commit phase (two-phase commit).

2. Redo log prepare.

3. Binlog write&fsync: the executor writes the complete transaction in the binlog cache and the xid in the Redo Log prepare to the binlog.

4. Redo log commit.

5. The transaction commits, releasing the exclusive locks held by the row records.

6. After Binlog and Redo Log are flushed to disk, the dirty page flushing operation is triggered.

7. If the transaction is ROLLBACK'd, because of system anomalies or explicit rollback, all data changes return to the original state, restored through the data in the rollback log.

## Several Situations Affecting Slow Transaction Commits

**1. In the transaction execution phase**

1. Due to lock waiting, including row locks and MDL locks. The lock waiting situation can be seen by observing `sys.innodb_lock_waits` and `sys.schema_table_lock_waits`.

1. Due to slow physical I/O or high physical I/O cost. At this time, the IOPS or iowait indicators are usually high.

1. Because the buffer pool is insufficient and it is necessary to wait for some pages to be released. At this time, the status indicator `Innodb_buffer_pool_wait_free` can usually be seen with a value greater than 0.

1. Because the two-phase collaborative commit of binlog & Redo Log causes slow flushing to disk. At this time, thread states similar to `waiting for handler commit` can usually be seen.

## Troubleshooting and Analyzing Slow UPDATE Execution

### Excluding System Load Interference

View the system load of the instance at that time (IO, CPU, memory) to exclude system load interference.

If CPU is high, IO is high, and wa is large:

First troubleshoot slow SQL, then check the current concurrency. It is generally caused by a large number of concurrent slow SQL statements.

If CPU is high, IO is medium, and wa is small:

Troubleshoot slow SQL, then view the current concurrency. It is generally caused by a single compute-intensive SQL.

If CPU is low, IO is high, and wa is low:

Troubleshoot threads currently occupying high IO. It may be caused by page clean or frequent log flushing.

### Checking the Database Status

Execute `SHOW PROCESSLIST` to check whether the current threads have any of the following situations:
- States such as converting HEAP to ondisk, copy to tmp table, Copying to group table, Copying to tmp table.
- States such as Copying to tmp table on disk, Creating sort index, Creating tmp table.
- States such as Killed, Rolling back.
- States such as Sorting result, Sending data, Searching rows for update.
- Waiting for XX states.

If so, promptly analyze and optimize these executing SQL statements.

### Analyzing the SQL Statement

Use `EXPLAIN` to analyze the execution of the SQL, whether it uses indexes, whether there is additional grouping, sorting, temporary tables, and whether the driving table is wrongly selected in multi-table join queries.

Use `PROFILING` to analyze which execution phase of the SQL statement is the slowest.

### Analyzing the Time When the Application's SQL Execution Is Slow

Observe whether a single SQL execution is slow, or all statements are slow. If all SQL statements are slow, it is possible that the database was affected by other external factors during that period, causing overall poor database performance. System-level monitoring tools are needed to assist in troubleshooting and analysis.

### Performing Packet Capture and Stack Analysis

Use `tcpdump` to capture packets and analyze whether MySQL/GreatSQL is slow to return, or the network is slow.

Use `strace` to analyze where inside MySQL/GreatSQL it is slow and which function causes it.

The slow UPDATE problem is not limited to the situations listed above. This article mainly provides an idea for troubleshooting and analysis. More causes still need further specific analysis.

In addition, this article takes the UPDATE request as an example. In fact, the same troubleshooting and analysis approach can also be used for INSERT and DELETE requests.

**Reference materials:**
- [Technical Sharing | Troubleshooting Ideas for Slow Updates and Deadlocks](https://mp.weixin.qq.com/s/8EIWAWQD6BPS-j8gKt28Gw)
- [Which Elements Should Be Focused on in the EXPLAIN Execution Plan](https://mp.weixin.qq.com/s/CDKN_nPcIjzA_U5-xwAE5w)
- [Which States in PROCESSLIST Should Be Concerned](https://mp.weixin.qq.com/s/vhUmB9JO-Zt2P02gVk4mwg)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
