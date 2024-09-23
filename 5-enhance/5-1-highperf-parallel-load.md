# 并行 LOAD DATA
---

## 原生LOAD DATA局限

原生的 LOAD DATA 采用单线程读取本地文件（或收取 Client 传来的网络数据包），逐行获取内容并调用数据库 `write_row()` 接口插入数据。当导入的单个文件很大时，单线程处理模式无法充分利用数据库的资源，导致执行时间很长。又由于 LOAD DATA 导入的数据在一个事务内，当 Binlog 事务超过 2GB 时，无法使用 Binlog 在 MGR 成员节点间同步。

## 并行 LOAD DATA

为解决上述两个问题，GreatSQL 新增 Parallel LOAD DATA（并行导入）特性。开启并行导入特性后，会自动将导入的文件切分文件成多个小块（块大小可配置），然后启动多个 Worker 线程（数量可配置）导入文件块。

并行导入与存储引擎无关，理论上可以支持所有的存储引擎。

## 无主键表并行导入优化

当 InnoDB 表没有显式定义主键且选项 `sql_generate_invisible_primary_key = OFF` 时，就会使用实例级的 `DB_ROW_ID` 作为隐式的聚集索引键。这种情况下，如果对该表并行导入数据，受限于实例级 `DB_ROW_ID` 锁互斥的影响，随着并发数的增加，性能明显下降。GreatSQL针对这种情况也提供了优化方案，通过设置选项 `innodb_optimize_no_pk_parallel_load = ON` 就能获得更好的并发导入性能。

下面是一个性能对比参考，可以看到在关闭 [GIPKs](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html) 的前提下，采用并行 LOAD DATA 方式（设置 `gdb_parallel_load_workers=24`）导入一亿条数据，启用本优化特性后（设置 `innodb_optimize_no_pk_parallel_load = ON`），导入效率大约提升了 5 倍：


| 导入数据量 | 优化模式 | 耗时 |
|----| --- | ---|
| 1亿行 |  开启 | 190.87297775 秒 |
| 1亿行 | 关闭 | 966.15685475 秒 |

## 相关变量

| 变量名| 含义| 作用域 | 取值范围及单位 | 默认值 |
| --- | --- | ---- | --- | --- |
| gdb_parallel_load| 是否开启并行导入(SESSION级设置) |Session | ON/OFF|OFF|
| gdb_parallel_load_chunk_size | 并行导入时，文件切割的大小|Session | 64k-128M，字节|4M|
| gdb_parallel_load_workers| 并行导入最大worker线程数 | Session | 1-32| 8|
| innodb_optimize_no_pk_parallel_load | 是否启用无显式主键表并发导入优化特性 | Global, Session | ON/OFF | OFF |

## 启用并行`LOAD DATA`

可采用两种方式启用并行 LOAD DATA：

1. **设置 SESSION 级变量启用**

连接数据库，执行 `SET SESSION gdb_parallel_load = ON`。

如需调整文件块大小或线程数，执行 `SET SESSION gdb_parallel_load_chunk_size = 65536` 或 `SET SESSION gdb_parallel_load_workers = 16`。

然后执行 `LOAD DATA` 语句导入文件。

```sql
LOAD DATA INFILE '/tmp/load.txt' INTO TABLE t1;
```

2. **LOAD 语句增加 HINT 启用**

```sql
LOAD /*+ SET_VAR(gdb_parallel_load = ON) SET_VAR(gdb_parallel_load_chunk_size = 65536) SET_VAR(gdb_parallel_load_workers = 16) */
    DATA INFILE '/tmp/load.txt' INTO TABLE t1;
```

## 检查并行导入进度

Worker 线程会创建新的 session 导入文件块，可通过执行 `SHOW PROCESSLIST` 看到 Worker 线程正在执行的语句。

语句的格式为：

```sql
LOAD /*parallel load worker(chunk_no:xxx)*/ DATA INFILE 'session_id:worker_no' INTO ...
```

其中 `chunk_no` 代表文件块的编号，每新产生一个文件块时 `chunk_no` 增加1，可通过文件原始大小除以 `gdb_parallel_load_chunk_size`，得到 `chunk_no` 并大致判断出导入进度。

`session_id` 表示初始执行 `load data` 语句的那个 session_id，即 `master_session_id`。而`worker_no` 表示启动的worker线程编号。

## 特殊限制

**1. 非原子性：**  启动并行导入后，若中途失败，已执行导入的文件块无法回滚。因此请不要用于在线业务系统的数据表，而是先导入到某个临时表，完全导入成功后，再将数据加载到正式业务表中。

**2. Session 变量支持受限：** 若导入语句使用了类似 `connection_id()` 这类会话相关的变量或函数时，Worker session 无法正确导入。

**3. 不支持 REPLACE INTO：** 不支持 `REPLACE INTO` 方式插入。

## 并行导入提升测试

受限于 master session 的文件分割速度，并行导入速度可能区别较大。经过测试，在磁盘 I/O 和 CPU 核心资源都充足的前提下启动 32 个 Worker，最大的加速比大概为 20 倍。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
