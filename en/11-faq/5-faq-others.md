# FAQ - Other Questions
---

## 1. Are there any limitations when using MGR

The following are some limitations on the use of MGR:

- All tables must use the InnoDB engine. Non-InnoDB engine tables can be created, but data cannot be written to them, and errors will also occur when using Clone to build new nodes.
- All tables should preferably have a primary key (it is recommended to set the global option `sql_require_primary_key=ON`). Similarly, tables without a primary key can be created, but data cannot be written to them, and errors will also occur when using Clone to build new nodes (exception: if the option `sql_generate_invisible_primary_key=ON` is set before creating the table, InnoDB will automatically create an invisible primary key for the table, see: [Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html)).
- Do not use large transactions. By default, transactions exceeding 150MB will report an error, and the maximum supported transaction size is 2GB (in future GreatSQL versions, support for large transactions will be added to raise the large transaction limit).
- If upgrading from an old version, you cannot choose the MINIMAL mode upgrade. It is recommended to choose AUTO mode, i.e., `upgrade=AUTO`.
- Since the MGR transaction certification thread does not support gap lock, it is recommended to change the transaction isolation level of all nodes to `READ COMMITTED`. For the same reason, do not use `table lock` or `name lock` (i.e., the `GET_LOCK()` function) in MGR clusters.
- In multi-primary mode, the serializable (`SERIALIZABLE`) isolation level is not supported.
- Executing DML and DDL on the same table on different MGR nodes is not supported, which may cause data loss or node errors and exits.
- Multi-level cascading foreign key tables are not supported in multi-primary mode. In addition, to avoid MGR errors caused by foreign keys, it is recommended to set `group_replication_enforce_update_everywhere_checks=ON`.
- In multi-primary mode, if multiple nodes execute `SELECT ... FOR UPDATE` and then commit transactions, it will cause deadlocks.
- Replication Filters are not supported.

It looks like there are quite a few limitations, but in most cases they do not affect normal business use.

In addition, there are several requirements to enable MGR:
- Each node must enable binlog.
- Each node must also log binlog updates from replicas, i.e., set `log_replica_updates=1`.
- The binlog format must be row mode, i.e., `binlog_format=ROW`.
- The `server_id` and `server_uuid` of each node must not be the same.
- Before 8.0.20, `binlog_checksum=NONE` was required, but after 8.0.20, `binlog_checksum=CRC32` can be set.
- GTID must be enabled, i.e., set `gtid_mode=ON` and `enforce_gtid_consistency=ON`.
- `master_info_repository=TABLE` and `relay_log_info_repository=TABLE` are required. However, starting from MySQL 8.0.23, these two options are set to TABLE by default, so there is no need to set them separately.
- The `lower_case_table_names` parameter for table name case on all nodes must be consistent.
- It is better to deploy MGR in a LAN rather than across the public network. If the network latency is too high, MGR performance will be poor or errors will easily occur.
- It is recommended to enable writeset mode, i.e., set the following parameters:
    - `replica_parallel_type=LOGICAL_CLOCK`
    - `replica_parallel_workers=N`, N > 0, can be set to 2 times the number of logical CPUs
    - `replica_preserve_commit_order=1`
    - `replica_checkpoint_period=2`

## 2. Compared with traditional source-replica replication, does MGR consume more CPU, memory, and bandwidth resources

To a certain extent, yes. Because MGR needs to perform transaction conflict detection between multiple nodes, although this overhead is limited, overall it is acceptable.

If you do not need MGR, make sure the option `group_replication_start_on_boot` is not set to *ON*; if it is set to *ON*, it will attempt to start the MGR service process, which will consume significantly more memory. For details, refer to the cases: [GreatSQL memory usage issue](https://greatsql.cn/thread-755-1-1.html) and [High memory usage after docker 8.0.32-25 startup](https://greatsql.cn/thread-666-1-1.html).

## 3. Can InnoDB tables without a primary key be created in MGR
Yes, they can be created and replicated to all MGR nodes, but only empty tables can be created; business data cannot be written.

When writing data to an InnoDB table without a primary key, an error similar to the following will be reported:
```sql
[root@GreatSQL] [test]> INSERT INTO t3 SELECT 1;
ERROR 3098 (HY000): The table does not comply with the requirements by an external plugin.
```
Similarly, MyISAM tables can also be created, but writes will fail.

In addition, when a new instance to be added to the MGR cluster contains an InnoDB table without a primary key, if you want to add the node through **MySQL Shell**, an error similar to the following will be reported, and it cannot be added:
```log
Validating instance configuration at mgr03:3306...

This instance reports its own address as mgr03:3306
ERROR: The following tables do not have a Primary Key or equivalent column:
test.t3

Group Replication requires tables to use InnoDB and have a PRIMARY KEY or PRIMARY KEY Equivalent (non-null unique key). Tables that do not follow these requirements will be readable but not updateable when used with Group Replication. If your applications make updates (INSERT, UPDATE or DELETE) to these tables, ensure they use the InnoDB storage engine and have a PRIMARY KEY or PRIMARY KEY Equivalent.
If you can't change the tables structure to include an extra visible key to be used as PRIMARY KEY, you can make use of the INVISIBLE COLUMN feature available since 8.0.23: https://dev.mysql.com/doc/refman/8.0/en/invisible-columns.html

ERROR: Instance must be configured and validated with dba.checkInstanceConfiguration() and dba.configureInstance() before it can be used in an InnoDB cluster.
Cluster.addInstance: Instance check failed (RuntimeError)
```
This error still exists in MySQL 8.0.25, and it is said to be resolved in MySQL 8.0.27.

If you change to manually adding the new node, or directly delete the table without a primary key, it can succeed.

As can be seen from the above error message, if you create a unique index equivalent to a primary key (and it is not allowed to be NULL), this unique index can be used as the clustered index of the InnoDB table, and the error will no longer be reported, and business writes can proceed normally.

It is best to set the option `sql_generate_invisible_primary_key=ON` before creating the table, so that InnoDB will automatically create an invisible primary key for the table, see: [Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html).

## 4. How to back up GreatSQL
You can use the mysqldump tool provided in the GreatSQL installation package to perform logical backups. The mysqldump backup tool in GreatSQL supports encrypted backups. For details, see: [mysqldump backup encryption](../5-enhance/5-4-security-mysqldump-encrypt.md).

You can also use Percona Xtrabackup with the same version number to perform physical backups. For example, use Percona XtraBackup 8.0.25-17 to back up GreatSQL 8.0.25-15 and GreatSQL 8.0.25-16 versions, and use Percona XtraBackup 2.4 to back up GreatSQL 5.7.36-39 versions.

Starting from GreatSQL 8.0.32-26, you can use the built-in Clone plugin to complete full and incremental backups, and use Clone to implement encrypted and compressed backups. For details, refer to:

- [Clone compressed and incremental backup](../5-enhance/5-5-clone-compressed-and-incrment-backup.md)
- [Clone backup encryption](../5-enhance/5-4-security-clone-encrypt.md)

## 5. What are the mysql_innodb_cluster_* accounts added when creating MGR with MySQL Shell for
This is a feature unique to creating MGR with MySQL Shell. These accounts are used for subsequent node distributed recovery scenarios. The account name rule is: `mysql_innodb_cluster_server_id@%`

See the description in the manual [Internal User Accounts Created by InnoDB Cluster](https://dev.mysql.com/doc/mysql-shell/8.0/en/innodb-cluster-user-accounts.html#admin-api-configuring-users):
```
As part of using Group Replication, InnoDB Cluster creates internal recovery users which enable connections between the servers in the cluster. 
These users are internal to the cluster, and the user name of the generated users follows a naming scheme of mysql_innodb_cluster_server_id@%, 
where server_id is unique to the instance. In versions earlier than 8.0.17 the user name of the generated users followed a naming 
scheme of mysql_innodb_cluster_r[10_numbers].
```

## 6. When a SQL statement has both a normal JOIN and a subquery, can the InnoDB parallel query (PQ) feature be used

This situation is not supported.
Currently, the InnoDB parallel query of GreatSQL does not support subqueries yet. Support will be added in the future.

## 7. Why is InnoDB parallel query (PQ) not available
There may be several reasons:
1. The optimizer thinks it is unnecessary to use parallelism, for example, because the cost is too small.
2. Unsupported SQL types. Subqueries are currently not supported.
3. The optimizer thinks the available resources are insufficient and "cannot" use parallel query.

For example, in one scenario, because `parallel_memory_limit` was set too low, the optimizer judged the SQL cost to be relatively large, so it only tried to use parallelism but did not take full advantage of it:
```sql
greatsql> SHOW GLOBAL STATUS LIKE 'PQ_%';
| PQ_memory_refused  | 0     |
| PQ_memory_used     | 0     |  <-- Not actually used, because the available buffer is insufficient
| PQ_threads_refused | 82    |
| PQ_threads_running | 4     |  <-- Tried parallelism
```

It worked after increasing `parallel_memory_limit`:
```sql
greatsql> SHOW GLOBAL STATUS LIKE 'PQ_%';
| PQ_memory_refused  | 0       |
| PQ_memory_used     | 4801552 |  <-- Memory consumed by PQ
| PQ_threads_refused | 82      |
| PQ_threads_running | 4       |  <-- 4 parallel threads
```
By comparison, it is recommended to use the [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md) to improve query efficiency, as its improvement effect is more obvious.

## 8. Why can a table set with `SECONDARY_ENGINE=rapid` still not use the Rapid Engine to accelerate queries

There may be several reasons why the Rapid Engine cannot be used to accelerate queries:

1. The table may not have been fully loaded into the Rapid Engine yet. You need to execute a command similar to the following to complete it:
```sql
ALTER TABLE t1 SECONDARY_LOAD;
```

2. The user data table uses data types that are not yet supported. Currently, data types such as *BOOL\INT\FLOAT\DOUBLE\DECIMAL* are supported; other data types are not supported for now.

3. The user SQL request contains functions that are not yet supported.

4. The user data table contains hidden auto-increment columns. You need to set `sql_generate_invisible_primary_key=OFF` before creating the table.

5. The optimizer evaluates that the threshold defined by the `secondary_engine_cost_threshold` option is not reached (its default value is 100000).

6. The MyISAM storage engine is not supported, and DDL syntax is not supported.

7. Mixing InnoDB and Rapid engines in the same SQL query is not supported. That is, when a JOIN query is performed between a Rapid Engine table and an InnoDB engine table, the Rapid Engine cannot be used to improve query efficiency. Both tables can only use the InnoDB engine execution plan.

8. Other situations.

In addition, there are a few notes when using the Rapid Engine:
- The primary engine of user data tables can only be the InnoDB engine; other engines such as MyISAM are not supported.
- After the database instance restarts, querying some Rapid Engine tables may prompt that the Rapid Engine cannot be used for acceleration. In this case, you can try executing `ALTER TABLE ... SECONDARY_LOAD` to load the table into the Rapid Engine again. In fact, there is no need to reload it again; it is very fast, and then the Rapid Engine can be used.

## 9. Can MySQL 5.7 and GreatSQL 5.7 share a datadir
Yes.

However, a reminder: if you start GreatSQL directly on an existing MySQL datadir, remember to run mysql_upgrade, otherwise there will be no MEMBER_ROLE column.

Upgrade/switch steps:

1. Execute mysql_upgrade -f -s (at least add -s to upgrade the system schema)

2. Restart the instance (the new schema metadata can only be recognized after restart)

Similarly, the same applies if you are running MySQL 8.0.x and GreatSQL 8.0.x versions.

However, cross-version mixed running of 5.7 and 8.0 is not supported.

## 10. Which transaction isolation level is recommended in MGR

A limitation is mentioned in the GreatSQL MGR FAQ:

- Since the MGR transaction certification thread does not support gap lock, it is recommended to change the transaction isolation level of all nodes to READ COMMITTED. For the same reason, do not use table lock or name lock (i.e., the GET_LOCK() function) in MGR clusters.

This means that because the MGR transaction certification thread does not support gap lock, RR isolation level guarantees cannot be achieved across nodes in MGR. That is, between two MGR nodes s1 and s2, it is impossible to implement RR isolation level guarantees as within the same local node.

For example, as shown below:

**Case 1:**

| Timeline | Node 1 | Node 2|
|--- |---|---|
|T1|begin;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|10 \| | begin;<br/>select * from t1 where id>=3;<br/>\|  3 \|<br/>\| 10 \| |
|T2|insert into t1 select 6;<br/>commit;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \|||
|T3| | begin;<br/>select * from t1 where id>=3; -- still only two rows<br/>\|  3 \|<br/>\| 10 \||
|T4||begin;<br/>select * from t1 where id>=3 for update; -- the newly inserted row can be seen<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \||

::: tip Tip
Table t1 has only one primary key column id, with 3 existing rows: 1, 3, 10, using the RR level.
:::

**Case 2 (first delete the row 6 inserted above):**

| Timeline | Node 1 | Node 2|
|--- |---|---|
|T1|begin;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\| 10 \|||
|T2| | begin;<br/>select * from t1 where id>=3 for update; -- acquire lock<br/>\|  3 \|<br/>\| 10 \||
|T3|insert into t1 select 6; -- will not be blocked (if executed on the same node, under RR level, this SQL would be blocked)<br/>commit;<br/>select * from t1;<br/>\|  1 \|<br/>\|  3 \|<br/>\|  6 \|<br/>\| 10 \|||
|T4||select * from t1 where id>=3 for update; -- a deadlock will be triggered here regardless of whether for update is added<br/>ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction|

In summary, in MGR, even if the local node selects the RR level, gap lock locking still cannot be implemented across nodes, and therefore RR level cannot be guaranteed across nodes. However, **if write transactions are all on the same node, setting RR is meaningful**.

## 11. How is GreatSQL performance

Compared with the MySQL official community version, GreatSQL has a very large performance improvement, especially with the introduction of the InnoDB parallel query feature. In the TPC-H test, the average improvement is more than 15 times, and the highest improvement is 43 times, showing excellent performance.

Starting from GreatSQL 8.0.32-25, it supports the large-scale parallel, high-performance in-memory query acceleration AP engine, which can improve data analysis performance by several orders of magnitude. On a 32C64G test machine, in the TPC-H 100G test, the total time of 22 SQL statements was less than 80 seconds. For more details, refer to: [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md).

For more content on GreatSQL performance improvement, you can refer to the following evaluation reports:
- [GreatSQL major feature: InnoDB parallel query optimization test](https://mp.weixin.qq.com/s/pK90W9xT_V59yvgxRwcn8A)
- [GreatSQL & NVIDIA InfiniBand NVMe SSD performance test](https://mp.weixin.qq.com/s/F9804_7H1WiJ6xD0E1AueQ)
- [GreatSQL & DapuStor Roealsen5 NVMe SSD performance test](https://mp.weixin.qq.com/s/QrIZ8Fu69Bzq5MvNZwtTww)
- GreatSQL TPC-H performance test report: [Online report](../10-optimize/3-3-benchmark-greatsql-tpch-report.md), [PDF document download](https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/Presentations/27%E3%80%81benchmark-greatsql-tpch-report-20240228.pdf)

## 12. When running GreatSQL, is it necessary to install the jemalloc package first

It is not required.

We recommend installing the jemalloc package to improve the efficiency of GreatSQL memory allocation management, but it is not mandatory.

In ARM environments, the jemalloc dependency can be omitted.

## 13. Does GreatSQL support data masking

Yes, it does. For details, refer to: [Data masking](../5-enhance/5-4-security-data-masking.md).

## 14. What are "dual 1" or "dual 0"?

Usually, after a transaction commits, to ensure that user data is not lost, or to ensure that committed data is not lost after the mysqld process crashes unexpectedly, you need to confirm that the following two option values are both set to 1. This is called **dual 1**:
- sync_binlog = 1
- innodb_flush_log_at_trx_commit = 1

In some special situations such as test environments or offline analysis, where data security requirements are not that high, you can change the above two option values to 0. This is called **dual 0**:
- sync_binlog = 0
- innodb_flush_log_at_trx_commit = 0

After changing to dual 0, transaction commit/data write performance usually improves significantly.

The above two options can only be modified globally and cannot be modified in a single session, for example:
```sql
-- Modify the global settings
greatsql> SET GLOBAL sync_binlog = 1;
greatsql> SET GLOBAL innodb_flush_log_at_trx_commit = 1;

-- Modify the session settings
greatsql> SET sync_binlog = 1;
ERROR 1229 (HY000): Variable 'sync_binlog' is a GLOBAL variable and should be set with SET GLOBAL

greatsql> SET innodb_flush_log_at_trx_commit = 1;
ERROR 1229 (HY000): Variable 'innodb_flush_log_at_trx_commit' is a GLOBAL variable and should be set with SET GLOBAL
```

## 15. Why are my transactions blocked but I cannot find the source

Currently, a large number of transactions are blocked, generating many table locks and row locks, for example:

```sql
greatsql> SHOW ENGINE INNODB STATUS\G
...
---TRANSACTION 402851757, ACTIVE (PREPARED) 93 sec recovered trx
1 lock struct(s), heap size 1136, 0 row lock(s), undo log entries 5
TABLE LOCK table `db1`.`t1` trx id 402851757 lock mode IX
---TRANSACTION 402851749, ACTIVE (PREPARED) 93 sec recovered trx
1 lock struct(s), heap size 1136, 0 row lock(s), undo log entries 7
TABLE LOCK table `db1`.`t1` trx id 402851749 lock mode IX
...
```

But when querying `information_schema.INNODB_TRX`, the `trx_mysql_thread_id` value corresponding to this transaction is found to be 0:

```sql
greatsql> SELECT trx_mysql_thread_id FROM information_schema.innodb_trx WHERE trx_id = 402851749\G
*************************** 1. row ***************************
trx_mysql_thread_id: 0
1 row in set (0.00 sec)
```

This situation occurs because these transactions are all XA transactions and are in the PREPARE state, so the `trx_mysql_thread_id` value of these transactions is 0.

This can also be found from the `recovered trx` keyword in the transaction status viewed above.

At this point, you can execute `XA RECOVER` or `XA RECOVER CONVERT XID` to view the list of these transactions, and commit or roll them back.

For more details, refer to:
- [Transaction control](../12-dev-guide/12-6-1-trx-control.md)
- [The table is locked and cannot be unlocked](https://greatsql.cn/thread-487-1-1.html)

## 16. Why does startup become slow and look stuck when `innodb_numa_interleave=ON` is set

When `innodb_numa_interleave=ON` is set, the startup process may become slow and appear stuck. This is due to the complexity of the memory allocation mechanism of NUMA (Non-Uniform Memory Access) systems.

- Introduction to NUMA (Non-Uniform Memory Access)

NUMA is a memory design for multiprocessor systems that aims to improve system performance. NUMA systems divide memory into multiple nodes, each consisting of one or more processors and their dedicated memory. In this architecture, a processor accesses memory on its local node faster, while accessing memory on other nodes is slightly slower.

- The `innodb_numa_interleave` option

The `innodb_numa_interleave` option controls whether InnoDB allocates memory across multiple memory nodes in a NUMA system. When set to `ON`, InnoDB attempts to evenly distribute memory among all available NUMA nodes. This helps balance the load of memory access but also introduces some overhead.

- Reasons for slow startup

When `innodb_numa_interleave=ON`, the following operations occur during GreatSQL startup:

1. **Memory allocation**: InnoDB needs to allocate large blocks of memory, and these memory blocks need to be evenly distributed across all NUMA nodes. This allocation method is more complex than single-node memory allocation and therefore requires more time.

2. **Page initialization**: InnoDB initializes memory pages to ensure they are physically distributed across different NUMA nodes. This step involves a large number of memory read/write operations, further increasing startup time.

3. **NUMA topology discovery and setup**: InnoDB needs to discover the system's NUMA topology and configure memory policies. These operations are much more complex in NUMA systems than in Uniform Memory Access (UMA) systems.

Although enabling `innodb_numa_interleave` can bring some performance benefits, if the startup time is too slow and affects system availability, you can consider the following methods:
- Evaluate whether NUMA needs to be enabled. You can first run a benchmark test. If enabling NUMA on your server has little impact on performance, consider turning it off.
- Lower the initial setting value of the `innodb_buffer_pool_size` option, and dynamically increase it online after startup succeeds.

Through the above methods, the problem of slow startup caused by `innodb_numa_interleave=ON` can be alleviated to a certain extent.

In addition, when `innodb_numa_interleave=ON` is set, if the `innodb_buffer_pool_size` parameter value is set relatively large, it may cause the mysqld process to pre-allocate (or even preempt) the corresponding memory during startup, and even a brand-new instance may appear to occupy a lot of memory. For example, this case: [Difference in memory allocation between GreatSQL and MySQL](https://greatsql.cn/thread-951-1-1.html).

## 17. Installing the percona-toolkit package requires the perl-DBD-MySQL dependency, but it conflicts with GreatSQL

When using the percona-toolkit tools, an error reports that perl-DBD-MySQL is missing. When installing perl-DBD-MySQL, an error occurs that conflicts with GreatSQL, similar to the following:

```bash
$ yum install perl-DBD-MySQL

...
Installing:
perl-DBD-MySQL                                 x86_64                                 4.023-6.el7                                       base                                 140 k
Installing for dependencies:
mariadb-libs        
...
Transaction check error:
  file /etc/my.cnf from install of mariadb-libs-1:5.5.68-1.el7.x86_64 conflicts with file from package greatsql-server-8.0.32-25.1.el7.x86_64
  file /usr/lib64/mysql/plugin/dialog.so from install of mariadb-libs-1:5.5.68-1.el7.x86_64 conflicts with file from package greatsql-server-8.0.32-25.1.el7.x86_64
...
```

This is because installing percona-toolkit requires perl-DBD-MySQL as a dependency, and perl-DBD-MySQL in turn depends on mariadb-libs.

If GreatSQL has already been installed on the system via RPM, this conflict will be reported because GreatSQL also provides this lib library.

Therefore, adding the --nodeps parameter when installing perl-DBD-MySQL should work, for example, try `yum install --nodeps perl-DBD-MySQL` again.

The same problem may also occur when installing other software packages, such as installing sysbench.

## 18. When deploying the GreatSQL VIP feature, `ldconfig -p` reports "file is truncated"

When `ldconfig` attempts to read or process a shared library file, if the file size is smaller than expected, or the end of the file is accidentally truncated, the "file is truncated" error is reported. This situation can be caused by the following reasons:

1. **File system errors**: Disk corruption or other file system problems may cause incomplete files.

2. **Incomplete copying or downloading**: Dynamic library files may have problems during transfer and be copied or downloaded, resulting in file data loss.

3. **Software faults**: Application crashes or incorrect writes may also corrupt files.

4. **Malicious behavior**: Viruses or malware may modify or delete system files.

5. **Permission issues**: The user attempting to access or modify the file may not have sufficient permissions, although in this case there is usually a different error message. Or SELinux may also cause this problem. Refer to this page: [Starting GreatSQL with systemd reports `Failed to execute command: Permission denied`](../6-oper-guide/8-troubleshooting.md#when-starting-greatsql-with-systemd-the-error-failed-to-execute-command-permission-denied-is-reported).

Methods to solve the "file is truncated" error include:

1. **Reinstall the affected library**: Uninstall and reinstall the package containing the problematic .so file, which usually replaces the corrupted file.

2. **Repair the file system**: Use file system check and repair tools (such as fsck) to scan and repair disk errors.

3. **Restore the file**: Restore the file from a backup, if available.

4. **Manually replace the file**: Copy the file from another healthy machine with the same version, then replace the locally corrupted file.

5. **Check permissions**: Confirm that you have sufficient permissions to access and modify the file, or fix SELinux-related issues. Refer to this page: [Starting GreatSQL with systemd reports `Failed to execute command: Permission denied`](../6-oper-guide/8-troubleshooting.md#when-starting-greatsql-with-systemd-the-error-failed-to-execute-command-permission-denied-is-reported).

6. **Update the system**: Make sure all system packages are up to date. Sometimes the problem may be caused by old versions of library files.

The above methods usually solve this problem.

## 19. Why can't the GreatSQL client use the Backspace and Delete keys

This problem is common in binary packages compiled by GreatSQL in the glibc2.28 environment. For example, after installing the GreatSQL-8.0.32-27-Linux-glibc2.28 binary package in Debian or Ubuntu environments, after connecting to GreatSQL with the built-in CLI client tool, you may find that the Backspace and Delete keys and other shortcuts cannot be used.

This problem occurs because the ncurses 6.1 dynamic library bundled in the GreatSQL for glibc2.28 binary package has made major improvements to terminal keyboard handling, one of which changed the key mapping relationship of the Backspace and Delete keys, so the result appears as if the Backspace and Delete keys cannot be used.

Refer to the following solutions.

**1. Best solution: recompile GreatSQL and link the system ncurses**

For the method of recompiling GreatSQL from source code, refer to: [Compile and install GreatSQL from source code](../4-install-guide/6-install-with-source-code.md).

**2. Use MySQL clients of other versions instead**

Download the GreatSQL for glibc2.17 binary package and use the MySQL client binary from this version, for example:

```bash
$ /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.17-x86_64/bin/mysql -uXX -pXX
```

**3. Downgrade ncurses (not recommended)**

You can extract the ncurses dynamic library files from the GreatSQL for glibc2.17 binary package and replace the corresponding ncurses dynamic library files in the GreatSQL for glibc2.28 version. You can also directly copy the ncurses dynamic library files already installed by the operating system to replace them.

Taking the first solution as an example, the operation method is as follows:

```bash
# First enter the GreatSQL for glibc2.28 version directory
$ cd /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/lib/private/

# Copy the ncurses dynamic library files, two files in total
$ cp /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.17-x86_64/lib/private/libncurses.so.5.9 .
$ cp /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.17-x86_64/lib/private/libtinfo.so.5.9 .

# Recreate the symbolic links
$ unlink libncurses.so && ln -s libncurses.so.5.9 libncurses.so
$ unlink libtinfo.so && ln -s libtinfo.so.5.9 libtinfo.so

# Check that it takes effect
$ ldd ../../bin/mysql | grep -iE 'libncurses|libtinfo'
    libncurses.so => /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/lib/private/../../bin/../lib/private/libncurses.so (0x00007f854bdbd000)
    libtinfo.so => /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/lib/private/../../bin/../lib/private/libtinfo.so (0x00007f854bb90000)

# Start the client again to confirm that the Backspace and Delete keys work properly
$ /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysql -uXX -pXX
```
The above three methods usually solve this problem.

## 20. Why does the GreatSQL Docker container fail to start

In individual cases, when starting a GreatSQL Docker container, it may fail to start normally. The corresponding log output is similar to the following:

```bash
$ docker logs -f greatsql

Initializing database
Database initialized
Initializing certificates
[ERROR]   Could not find OpenSSL on the system
Certificates initialized
MySQL init process in progress...
MySQL init process in progress...
MySQL init process in progress...
MySQL init process in progress...
```

The Docker container reports that the OpenSSL library cannot be found and stays in the initialization process.

This situation may be caused by SELinux or AppArmor security restrictions, causing the creation of the GreatSQL Docker container to fail with the "Could not find OpenSSL on the system" error. In this case, you can add the `--privileged` parameter when creating the container to solve it.

In addition, it may also be caused by problems with a low or special Docker version installed. Upgrading the version can generally solve the problem. It has been tested that older Docker versions such as <=17.12.1 have this problem, and some Dockers installed in Kubernetes environments may also have problems. It is recommended to avoid them.

## 21. Why are some very fast SQL operations also recorded in the Slow Query Log

`long_query_time=10` has been set (SQL requests exceeding 10 seconds are treated as slow queries). Why are some SQL requests that only take milliseconds also recorded in the Slow Query Log?

This is most likely because `log_queries_not_using_indexes=ON` is set, which means that when a SQL request cannot use an index, even if it executes very fast, it will still be recorded as a slow query request. As shown in the example below:

```log
# Query_time: 0.006571  Lock_time: 0.000004 Rows_sent: 14  Rows_examined: 43 Thread_id: 21 Errno: 0 Killed: 0 Bytes_received: 58 Bytes_sent: 289 Read_first: 2 Read_last: 0 R
ead_key: 13 Read_next: 9 Read_prev: 0 Read_rnd: 0 Read_rnd_next: 15 Sort_merge_passes: 0 Sort_range_count: 0 Sort_rows: 0 Sort_scan_count: 0 Created_tmp_disk_tables: 0 Creat
ed_tmp_tables: 0 Start: 2025-07-17T14:47:42.308420+08:00 End: 2025-07-17T14:47:42.314991+08:00 Schema:  Rows_affected: 0
# Tmp_tables: 0  Tmp_disk_tables: 0  Tmp_table_sizes: 0
# InnoDB_trx_id: 0
# Full_scan: Yes  Full_join: Yes  Tmp_table: No  Tmp_table_on_disk: No
# Filesort: No  Filesort_on_disk: No  Merge_passes: 0
#   InnoDB_IO_r_ops: 2  InnoDB_IO_r_bytes: 32768  InnoDB_IO_r_wait: 0.004966
#   InnoDB_rec_lock_wait: 0.000000  InnoDB_queue_wait: 0.000000
#   InnoDB_pages_distinct: 22
SET timestamp=1752734862;
SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA;
```

As you can see, **Query_time: 0.006571** and **Full_scan: Yes** indicate that this is a full table scan that does not use an index, taking only 0.006571 seconds. Although it does not exceed the `long_query_time=10` threshold, it is still recorded as a slow query.

The benefit of doing this is that when a table is still small, SQL requests that cannot use indexes can be discovered in advance, avoiding the situation where, as the table data grows rapidly with business development, effective indexes are still not created to improve SQL query efficiency. This can prevent potential future performance risks in advance.

In development and test environments, it is strongly recommended to set `log_queries_not_using_indexes=ON`, or even set `long_query_time=0` to record all SQL, and then regularly review and optimize.

Reference: [Slow Query Log](../2-about-greatsql/4-2-greatsql-slow-log.md).

## 22. Java application connection failure, error: Public Key Retrieval is not allowed

This is because the default authentication plugin in GreatSQL 8.0 is `caching_sha2_password`. The client needs to retrieve the public key from the server for authentication. However, for security reasons, public key retrieval is not allowed by default, causing the connection failure.

There are multiple solutions.

1. Add `allowPublicKeyRetrieval=true` to the JDBC URL so that the client can retrieve the public key from the server, as shown in the example below:

```ini
jdbc:mysql://localhost:3306/greatsql?allowPublicKeyRetrieval=true
```

2. Modify the authentication plugin of the connecting user, changing it from **caching_sha2_password** to **mysql_native_password**, as shown in the example below:

```sql
ALTER USER app@'%' IDENTIFIED WITH mysql_native_password BY 'New-Password';
```

3. Update the MySQL JDBC driver

Make sure the version of MySQL Connector/J is up to date (8.x is recommended). Older versions of the driver may not support the **caching_sha2_password** plugin.

The latest driver can be obtained from the [MySQL official download page](https://dev.mysql.com/downloads/connector/j/).

This method is recommended.

4. Enable SSL encryption

Modify the JDBC connection string to enable SSL parameters to avoid the client directly retrieving the public key, as shown in the example below:

```ini
jdbc:mysql://localhost:3306/greatsql?useSSL=true&requireSSL=true
```

Note that enabling SSL has a certain performance overhead.

5. Modify the GreatSQL configuration parameters

Add the following configuration to the my.cnf configuration file:

```ini
[mysqld]
default_authentication_plugin="mysql_native_password"
```

The purpose of this parameter is to force **mysql_native_password** as the default authentication plugin, and then restart the GreatSQL service for it to take effect.

Comparison of the advantages and disadvantages of several solutions:

| Solution | Security level | Applicable scenario | Notes |
|------|---------|---------|------|
| Update JDBC driver | ★★★★★ | All environments | Secure solution, recommended |
| Enable SSL encrypted connection | ★★★★☆ | All environments | Secure solution, recommended |
| Automatically retrieve public key | ★★★☆☆ | Trusted intranet environments | Risk of man-in-the-middle attacks |
| Change account authentication plugin | ★☆☆☆☆ | Development/test environments | Not recommended, poor compatibility, low security |
| Change global parameters | ☆☆☆☆☆ | Development/test environments | Not recommended, poor compatibility, low security |

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
