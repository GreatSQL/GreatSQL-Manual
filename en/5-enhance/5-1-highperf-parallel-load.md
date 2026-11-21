# Parallel LOAD DATA
---

## Limitations of Native LOAD DATA

Native LOAD DATA uses a single thread to read a local file (or receive network packets sent by the client), fetching the content row by row and calling the database `write_row()` interface to insert data. When a single imported file is very large, the single-threaded processing mode cannot fully utilize database resources, resulting in long execution time. In addition, since the data imported by LOAD DATA is within one transaction, when a binlog transaction exceeds 2GB, it cannot be synchronized between MGR member nodes using binlog.

## Parallel LOAD DATA

To solve the above two problems, GreatSQL introduces the Parallel LOAD DATA (parallel import) feature. After the parallel import feature is enabled, the imported file is automatically split into multiple small chunks (chunk size configurable), and then multiple Worker threads (number configurable) are started to import the file chunks.

Parallel import is independent of the storage engine and theoretically supports all storage engines.

## Parallel Import Optimization for Tables Without a Primary Key

When an InnoDB table has no explicit primary key defined and the option `sql_generate_invisible_primary_key = OFF`, the instance-level `DB_ROW_ID` is used as the implicit clustered index key. In this case, if data is imported into this table in parallel, limited by the mutual exclusion of the instance-level `DB_ROW_ID` lock, performance degrades significantly as concurrency increases. GreatSQL also provides an optimization for this situation: better concurrent import performance can be achieved by setting the option `innodb_optimize_no_pk_parallel_load = ON`.

The following is a performance comparison reference. With [GIPKs](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html) disabled, importing 100 million rows via Parallel LOAD DATA (setting `gdb_parallel_load_workers=24`), after enabling this optimization feature (setting `innodb_optimize_no_pk_parallel_load = ON`), the import efficiency improves by about 5 times:

| Imported data volume | Optimization mode | Elapsed time |
|----| --- | ---|
| 100 million rows |  Enabled | 190.87297775 seconds |
| 100 million rows | Disabled | 966.15685475 seconds |

## Related Variables

| Variable Name | Description | Scope | Value Range and Unit | Default |
| --- | --- | ---- | --- | --- |
| gdb_parallel_load | Whether parallel import is enabled (SESSION-level setting) | Session | ON/OFF | OFF |
| gdb_parallel_load_chunk_size | The file chunk size for parallel import | Session | 64k-128M, bytes | 4M |
| gdb_parallel_load_workers | Maximum number of worker threads for parallel import | Session | 1-32 | 8 |
| innodb_optimize_no_pk_parallel_load | Whether to enable the concurrent import optimization feature for tables without an explicit primary key | Global, Session | ON/OFF | OFF |

## Enabling Parallel `LOAD DATA`

Parallel LOAD DATA can be enabled in two ways:

1. **Enable by setting a SESSION-level variable**

Connect to the database and execute `SET SESSION gdb_parallel_load = ON`.

To adjust the file chunk size or the number of threads, execute `SET SESSION gdb_parallel_load_chunk_size = 65536` or `SET SESSION gdb_parallel_load_workers = 16`.

Then execute the `LOAD DATA` statement to import the file.

```sql
LOAD DATA INFILE '/tmp/load.txt' INTO TABLE t1;
```

2. **Enable by adding a HINT to the LOAD statement**

```sql
LOAD /*+ SET_VAR(gdb_parallel_load = ON) SET_VAR(gdb_parallel_load_chunk_size = 65536) SET_VAR(gdb_parallel_load_workers = 16) */
    DATA INFILE '/tmp/load.txt' INTO TABLE t1;
```

## Checking Parallel Import Progress

Worker threads create new sessions to import file chunks. You can execute `SHOW PROCESSLIST` to see the statements being executed by the Worker threads.

The statement format is:

```sql
LOAD /*parallel load worker(chunk_no:xxx)*/ DATA INFILE 'session_id:worker_no' INTO ...
```

`chunk_no` represents the number of the file chunk. Each time a new file chunk is produced, `chunk_no` increases by 1. You can divide the original file size by `gdb_parallel_load_chunk_size` to obtain `chunk_no` and roughly determine the import progress.

`session_id` represents the session id of the session that initially executed the `load data` statement, i.e., the `master_session_id`. `worker_no` represents the number of the started worker thread.

## Special Limitations

**1. Non-atomicity:** After parallel import is started, if it fails midway, the already imported file chunks cannot be rolled back. Therefore, do not use it for data tables in online business systems.

**2. Limited SESSION variable support:** If the import statement uses session-related variables or functions such as `connection_id()`, the Worker session cannot import correctly.

**3. REPLACE INTO is not supported:** Insertion via `REPLACE INTO` is not supported.

## Parallel Import Performance Test

Limited by the file splitting speed of the master session, the parallel import speed may vary greatly. In tests, with sufficient disk I/O and CPU core resources, starting 32 Workers achieves a maximum speedup of about 20 times.



**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
