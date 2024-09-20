# Binary Log（二进制日志）

## 什么是二进制日志

Binlog 是 GreatSQL 最重要的日志之一。

Binlog 即 Binary Log，二进制日志文件，也叫作变更日志（Update Log）。它记录了数据库中所有的 DDL 和 DML 等对数据库有变更的事件，但不包含没有修改任何数据的语句（如 `SELECT` 只读查询请求）。

Binlog 以事件（Event）形式记录并保存在二进制文件中，利用这些 Events，可以很方便地再现数据变更的全过程，所以 Binlog 常用于主从复制、MGR 等场景。

::: tip 小贴士
如果是想记录所有的请求，则需要使用 [通用日志](./4-7-greatsql-general-log.md)。
:::

## 应用场景

Binlog 主要的应用场景有以下几种：

- 用于数据恢复。如果发生了对数据库执行误操作（误删数据、误删库表等）等意外事件，可以利用全量备份先恢复大部分数据，再利用 Binlog 恢复到误操作发生前的时间点，就可以实现业务数据无损恢复。
- 用于主从复制或 MGR 组复制。无论主从复制还是 MGR 组复制，都是基于 Binlog 实现的逻辑复制。
- 用于审计。由于 Binlog 中记录了对数据库的所有变更操作，因此一定程度上也可以用于审计，从中发现一些可能潜在的违规或风险操作。

综上，可以说 GreatSQL 数据库的数据备份、主从复制、MGR 都离不开Binlog。

![Binary Log](./4-3-greatsql-binary-log-01.png#pic_center)

## 开启 Binlog

执行下面命令查看 Binlog 是否已启用，默认是启用的：

```sql
greatsql> SHOW VARIABLES LIKE '%log_bin%';
+---------------------------------+-----------------------------+
| Variable_name                   | Value                       |
+---------------------------------+-----------------------------+
| log_bin                         | ON                          |
| log_bin_basename                | /data/GreatSQL/binlog       |
| log_bin_index                   | /data/GreatSQL/binlog.index |
| log_bin_trust_function_creators | ON                          |
| log_bin_use_v1_row_events       | OFF                         |
| sql_log_bin                     | ON                          |
+---------------------------------+-----------------------------+
6 rows in set (0.01 sec)
```

- `log_bin` 开启 Binlog 的总开关，可选值为 ON/OFF。
- `log_bin_basename` 是 Binlog 基本文件名前缀，实际的 Binlog 会在其后追加数字标识来表示每一个文件，例如：binlog.000001, binlog.003306。支持设定全路径，或仅设置基本文件名，例如 `log_bin_basename = binlog`。
- `log_bin_index` 是 Binlog 的索引文件名，在这个文件中记录了所有 Binlog 文件列表。
- `log_bin_trust_function_creators` 设置是否相信所有存储程序创建者，该参数值默认为 OFF，这是为了避免部分存储程序创建者可能无意或恶意破坏数据库。设置为 OFF 时会导致没有 SUPER 权限的账户无法创建或修改存储程序，即便这些账户已有 `CREATE ROUTINE` 或 `ALTER ROUTINE` 权限也不行。当设置为 OFF 时，普通账户想要创建存储程序时，需要指定 `DETERMINISTIC` 或 `READS SQL DATA` 或 `NO SQL` 标识符声明不会修改数据库，才能创建/修改存储程序。设置为 ON 虽然方便了开发者，但却可能存在数据库安全风险。
- `log_bin_use_v1_row_events` 从 8.0.18 开始已弃用，不解读。
- `sql_log_bin` 用于设置在当前会话中是否启用 Binlog，默认值为 ON，**设置为 OFF 后，当前会话中所有对数据库的变更操作都不会被记录到 Binlog 中，可能会对数据库一致性造成破坏，导致主从复制或 MGR 工作异常**，所以需要严格控制该参数的设置权限。在 8.0.14 以前，需要 `SYSTEM_VARIABLES_ADMIN` 或 `SUPER` 权限才能修改设置；从 8.0.14 开始，调整为需要至少拥有 `SESSION_VARIABLES_ADMIN` 权限才能修改设置。

## 设置 Binlog

修改 GreatSQL 的 my.cnf 配置文件，调整下面和 Binlog 相关的参数：

```ini
[mysqld]
# 必须参数
log_bin = /data/GreatSQL/binlog

# 可选参数
binlog_expire_logs_seconds = 604800
max_binlog_size = 1G
binlog_format = ROW
sync_binlog = 1
max_binlog_size = 1G
binlog_cache_size = 4M
max_binlog_cache_size = 2G
binlog_checksum = CRC32
binlog_transaction_dependency_tracking = WRITESET
```

- `log_bin`

  开启 Binlog 与否的总开关。该参数的值只要不是设置为 OFF，就表示启用 Binlog。如果设置为 `log_bin = 1` 或 `log_bin = ON`，仅表示打开 Binlog 不设置 Binlog 文件基本名；如果设置为字符串，则表示除了打开 Binlog 外，还同时设定 Binlog 的基本文件名，支持设定为全路径或仅文件名，如 `log_bin = binlog` 或 `log_bin = /data/GreatSQL/binlog`。

- `binlog_expire_logs_seconds`

  设置 Binlog 多长时间后自动删除，单位：秒。默认值是：2592000 秒，即 30 天。一般建议保留 7 天，即 604800 秒，根据业务需求自行调整。

- `max_binlog_size`

  设置每个 Binlog 文件大小，当最大和默认值都是 1GB，一般也建议设置为 1GB。当 Binlog 文件大小超过此阈值时，会自动执行 Binlog 轮转（log rotate）动作，生成新的 Binlog 文件。例外的情况是，当一个事务尚未提交时，即便此时 Binlog 文件大小已超过阈值，为了保证事务的完整性，并不会强行进行日志轮转，需要等到事务结束后，才会进行轮转，所以能看到有时候某个 Binlog 文件超过预设的阈值。

- `binlog_format`

  设置 Binlog 格式，支持三种可选：STATEMENT（语句格式）、ROW（行格式）、MIXED（混合格式）。默认是 ROW 格式，也强烈建议设置为 ROW 格式。

  - **STATEMENT**
    
    在 STATEMENT 模式下，二进制日志记录的是执行的每个 SQL 语句。这是最早的一种二进制日志格式，适用于较少依赖复杂 SQL 语句的场景。优点：生成的日志文件较小；复制开销较低。缺点：某些情况下，重放 SQL 语句可能导致非预期结果（如包含非确定性函数）；可能需要在复制环境中添加额外的锁，以确保一致性。

  - **ROW**

    在 ROW 模式下，二进制日志记录的是每一行数据的变化。也就是说，它记录了数据行的具体更改而不是 SQL 语句本身。优点：适用于所有类型的 SQL 语句，确保复制的一致性；更加精确，适合高复杂度和高并发环境。缺点：生成的日志文件较大，特别是对于批量操作；复制时开销较高，传输更多数据。

  - **MIXED**

    MIXED 模式结合了 STATEMENT 和 ROW 模式。在这种模式下，MySQL 通常会选择 STATEMENT 模式来记录日志，但在某些需要精确性的情况下（如非确定性函数或包含用户变量的语句），会自动切换到 ROW 模式。优点：综合了两者的优点，适应性更强；提高了复制的准确性和性能。缺点：日志大小和性能开销介于 STATEMENT 和 ROW 之间。

注意：修改 `binlog_format` 需要考虑当前复制拓扑结构和工作负载的特点；切换日志格式可能会影响正在进行的事务，因此建议在低峰期或维护窗口内进行。

- `sync_binlog`

  用于控制 Binlog 的同步（刷盘）模式，默认值是 1。设置 `sync_binlog = N`，表示每写入 N 次 Binlog Events 后，再将 Binlog 同步刷新到磁盘，以确保数据的一致性和持久性。设置 `sync_binlog=1` 可以提供最强的数据安全性，但会很大程度影响性能；设置较大的值可以提高性能，但增加数据丢失的风险。在要求高一致性的业务场景中，务必设置 `sync_binlog = 1` 以确保数据安全。

- `binlog_cache_size` 和 `max_binlog_cache_size`

  参数 `binlog_cache_size` 用于设置会话级别的 Binlog 缓存的大小，这个缓存用于存储在事务提交之前的 Binlog Event。而 `max_binlog_cache_size` 参数则定义了所有会话的 Binlog 缓存的最大总大小，限制了单个事务可以使用的最大缓存空间。当一个事务非常大的时候，可能会导致出现下面的报错提示：`Multi-statement transaction required more than 'max_binlog_cache_size' bytes of storage`，此时需要适当加大 `max_binlog_cache_size` 参数值。

- `binlog_checksum`

  用于设置 Binlog Events 的校验和类型，以确保数据完整性。可选值有 NONE（不进行校验和）和 CRC32（使用 CRC32 算法进行校验和），推荐使用 CRC32 以检测和防止日志文件损坏。在 MGR 架构中，如果是在 8.0.20 之前，要求 `binlog_checksum=NONE`，但是从 8.0.20 后，可以设置 `binlog_checksum=CRC32`。

- `binlog_transaction_dependency_tracking`

  用于控制 GreatSQL 主服务器在生成 Binlog 时如何跟踪事务依赖关系。这对于提高从服务器的并行复制性能非常重要。可选值包括：
 
  - **COMMIT_ORDER**，按事务提交的顺序跟踪依赖关系。这是默认值。适用于大多数工作负载，但并行度较低。
  - **WRITESET**：基于事务的写集合跟踪依赖关系。事务之间如果没有写集合冲突，则可以并行执行。适合有高并发写操作的工作负载。
  - **WRITESET_SESSION**，基于写集合并按会话跟踪依赖关系。这意味着即使写集合之间没有冲突，但如果同一会话的事务，它们还是会按顺序执行。适用于事务之间存在一定顺序但又需要高并行度的场景。

  对于高并发的写操作，设置为 WRITESET 通常能提供更好的并行度。

::: tip 小贴士
有条件的话，最好不要将数据库文件与 Binlog 日志文件放在同一个物理磁盘上，一方面降低物理 I/O 读写请求的竞争，还可以降低故障单点风险，避免二者同时损坏。
:::


## 查看 Binlog

GreatSQL 在创建 Binlog 文件时，先创建 `log_bin_index` 定义的索引文件，再创建 `log_bin` 定义为基本名（basename），并以数字为后缀的日志文件，例如：binlog.000001。

GreatSQL 服务进程每次重启，Binlog 文件后缀的数字会自动递增。当前 Binlog 文件大小超过了 `max_binlog_size` 定义的阈值后会自动轮转出一个新的日志文件。

执行下面的命令查看当前所有 Binlog 文件列表及大小：

```sql
greatsql> SHOW BINARY LOGS;
+---------------+------------+-----------+
| Log_name      | File_size  | Encrypted |
+---------------+------------+-----------+
| binlog.000101 | 1073967237 | No        |
| binlog.000102 |  368552117 | No        |
+---------------+------------+-----------+
```
表示当前有两个 Binlog 文件，第三列 `Encrypted` 表示 Binlog 是否已加密。

数据库的所有变更操作都会记录到 Binlog 中，但 Binlog 是二进制而非明文格式，无法直接以明文方式查看，需要借助 `mysqlbinlog` 工具：

```bash
cd /data/GreatSQL && mysqlbinlog ./binlog.000102 | less
```

::: details 查看运行结果
```
# at 972
#240704 14:20:52 server id 3306  end_log_pos 1058 CRC32 0x1752752f      GTID    last_committed=1        sequence_number=2       rbr_only=yes    original_committed_timestamp=1
720074052491915   immediate_commit_timestamp=1720074052492308     transaction_length=1244
/*!50718 SET TRANSACTION ISOLATION LEVEL READ COMMITTED*//*!*/;
# original_commit_timestamp=1720074052491915 (2024-07-04 14:20:52.491915 CST)
# immediate_commit_timestamp=1720074052492308 (2024-07-04 14:20:52.492308 CST)
/*!80001 SET @@session.original_commit_timestamp=1720074052491915*//*!*/;
/*!80014 SET @@session.original_server_version=80032*//*!*/;
/*!80014 SET @@session.immediate_server_version=80032*//*!*/;
SET @@SESSION.GTID_NEXT= '46dda72d-ceec-11ee-be3f-d08e7908bcb1:994406'/*!*/;
# at 1058
#240704 14:20:52 server id 3306  end_log_pos 1142 CRC32 0x199cc2e6      Query   thread_id=713   exec_time=0     error_code=0
SET TIMESTAMP=1720074052/*!*/;
BEGIN
/*!*/;
# at 1142
# at 1596
#240704 14:20:52 server id 3306  end_log_pos 1668 CRC32 0xb8dd2245      Table_map: `greatsql`.`t_803225` mapped to number 400
# has_generated_invisible_primary_key=0
# at 1668
#240704 14:20:52 server id 3306  end_log_pos 2185 CRC32 0x10809f2a      Write_rows: table id 400 flags: STMT_END_F

BINLOG '
RD+GZhPqDAAASAAAAIQGAAAAAJABAAAAAAEACGdyZWF0c3FsAAh0XzgwMzIyNQAFA/wP9gMFBHgA
QR4AAQHgAgP8/wBFIt24
RD+GZh7qDAAABQIAAIkIAAAAAJABAAAAAAEAAgAF/wABAAAAEgAAADAuNzkxNzY0NDcwNTU0NjY4
ORIwLjc0OTQwMzk3NDczOTI3OTaAAAAAAAAAAAAAAAAABc7oAAAAAAAAAAAAAAAAAACviQkAAAIA
AAASAAAAMC45MzY5MjM0MDQxNjU0NzIzEjAuODUzMzU1MzQwNTIzMDQ0OIAAAAAAAAAAAAAAAAAH
IAcAAAAAAAAAAAAAAAAAAN4/CwAABAAAABMAAAAwLjIzMTgxMzUzNTMxMDE1NDM2EjAuOTk5MTY3
ODY3MDA0MDk2NIAAAAAAAAAAAAAAAAAEsZgAAAAAAAAAAAAAAAAAAPbhBwAACAAAABIAAAAwLjYy
MTI1NDg5NTQ2MTAyOTMSMC41OTI4MDM4MjE1MTk3NjU5gAAAAAAAAAAAAAAAAAGRBQAAAAAAAAAA
AAAAAAAAcUsLAAAQAAAAEwAAADAuMzEzNTQwODA0NDkxODgyMDQSMC4zOTkxMjE1NzU0MjkyMTc1
gAAAAAAAAAAAAAAAAADb8QAAAAAAAAAAAAAAAAAAQDYBAAAgAAAAEgAAADAuMjIyODU3NDI5ODUz
NTA3NxIwLjg4MTU5ODg1MDYwMTkxMDWAAAAAAAAAAAAAAAAAC42wAAAAAAAAAAAAAAAAAABB0QAA
Kp+AEA==
'/*!*/;
...
```
:::

从上面的输出结果中看不出来具体的 SQL 语句是什么，这是因为 Binlog 文件存储的是经过编码后的二进制内容。

如果从上述已知信息里，还是能看出几个关键信息的，主要有：

- 发生的时间点：**#240704 14:20:52**，对应的 Unix 时间戳：**TIMESTAMP=1720074052**。
- 服务器对应的 `server_id` 和 `server_uuid` 分别是：**server id 3306** 和 **46dda72d-ceec-11ee-be3f-d08e7908bcb1**。
- 从 **rbr_only=yes** 可以看出来设置了 `binlog_format = ROW`。
- 从 **Table_map: \`greatsql\`.\`t_803225\`** 知道对应的库表，它在 Binlog 中映射的 **table id 400**。
- 从 **Write_rows:** 可知这是一个写入操作（如果是更新操作，则对应 **Update_rows**）。

再次增加 `--base64-output=decode-rows` 参数就可以看到解码成明文后的结果：

```bash
mysqlbinlog -vvv --base64-output=decode-rows ./binlog.000102 | less
```

::: details 查看运行结果
```
...
# at 972
#240704 14:20:52 server id 3306  end_log_pos 1058 CRC32 0x1752752f      GTID    last_committed=1        sequence_number=2       rbr_only=yes    original_committed_timestamp=1720074052491915   immediate_commit_timestamp=1720074052492308     transaction_length=1244
/*!50718 SET TRANSACTION ISOLATION LEVEL READ COMMITTED*//*!*/;
# original_commit_timestamp=1720074052491915 (2024-07-04 14:20:52.491915 CST)
# immediate_commit_timestamp=1720074052492308 (2024-07-04 14:20:52.492308 CST)
/*!80001 SET @@session.original_commit_timestamp=1720074052491915*//*!*/;
/*!80014 SET @@session.original_server_version=80032*//*!*/;
/*!80014 SET @@session.immediate_server_version=80032*//*!*/;
SET @@SESSION.GTID_NEXT= '46dda72d-ceec-11ee-be3f-d08e7908bcb1:994406'/*!*/;
# at 1058
#240704 14:20:52 server id 3306  end_log_pos 1142 CRC32 0x199cc2e6      Query   thread_id=713   exec_time=0     error_code=0
SET TIMESTAMP=1720074052/*!*/;
BEGIN
/*!*/;
# at 1142
#240704 14:20:52 server id 3306  end_log_pos 1596 CRC32 0xccd47c70      Rows_query
# INSERT INTO t_803225 VALUES
# (1, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
# (2, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
# (4, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
# (8, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
# (16, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
# (32, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000))
# at 1596
#240704 14:20:52 server id 3306  end_log_pos 1668 CRC32 0xb8dd2245      Table_map: `greatsql`.`t_803225` mapped to number 400
# has_generated_invisible_primary_key=0
# at 1668
#240704 14:20:52 server id 3306  end_log_pos 2185 CRC32 0x10809f2a      Write_rows: table id 400 flags: STMT_END_F
### INSERT INTO `greatsql`.`t_803225`
### SET
###   @1=1 /* INT meta=0 nullable=0 is_null=0 */
###   @2='0.7917644705546689' /* LONGBLOB/LONGTEXT meta=4 nullable=0 is_null=0 */
###   @3='0.7494039747392796' /* VARSTRING(120) meta=120 nullable=0 is_null=0 */
###   @4=380648.000000000000000000000000000000 /* DECIMAL(65,30) meta=16670 nullable=0 is_null=0 */
###   @5=625071 /* INT meta=0 nullable=0 is_null=0 */
### INSERT INTO `greatsql`.`t_803225`
### SET
###   @1=2 /* INT meta=0 nullable=0 is_null=0 */
###   @2='0.9369234041654723' /* LONGBLOB/LONGTEXT meta=4 nullable=0 is_null=0 */
###   @3='0.8533553405230448' /* VARSTRING(120) meta=120 nullable=0 is_null=0 */
###   @4=466951.000000000000000000000000000000 /* DECIMAL(65,30) meta=16670 nullable=0 is_null=0 */
###   @5=737246 /* INT meta=0 nullable=0 is_null=0 */
### INSERT INTO `greatsql`.`t_803225`
### SET
###   @1=4 /* INT meta=0 nullable=0 is_null=0 */
###   @2='0.23181353531015436' /* LONGBLOB/LONGTEXT meta=4 nullable=0 is_null=0 */
###   @3='0.9991678670040964' /* VARSTRING(120) meta=120 nullable=0 is_null=0 */
###   @4=307608.000000000000000000000000000000 /* DECIMAL(65,30) meta=16670 nullable=0 is_null=0 */
###   @5=516598 /* INT meta=0 nullable=0 is_null=0 */
### INSERT INTO `greatsql`.`t_803225`
### SET
###   @1=8 /* INT meta=0 nullable=0 is_null=0 */
###   @2='0.6212548954610293' /* LONGBLOB/LONGTEXT meta=4 nullable=0 is_null=0 */
###   @3='0.5928038215197659' /* VARSTRING(120) meta=120 nullable=0 is_null=0 */
###   @4=102661.000000000000000000000000000000 /* DECIMAL(65,30) meta=16670 nullable=0 is_null=0 */
###   @5=740209 /* INT meta=0 nullable=0 is_null=0 */
### INSERT INTO `greatsql`.`t_803225`
### SET
###   @1=16 /* INT meta=0 nullable=0 is_null=0 */
###   @2='0.31354080449188204' /* LONGBLOB/LONGTEXT meta=4 nullable=0 is_null=0 */
###   @3='0.3991215754292175' /* VARSTRING(120) meta=120 nullable=0 is_null=0 */
###   @4=56305.000000000000000000000000000000 /* DECIMAL(65,30) meta=16670 nullable=0 is_null=0 */
###   @5=79424 /* INT meta=0 nullable=0 is_null=0 */
### INSERT INTO `greatsql`.`t_803225`
### SET
###   @1=32 /* INT meta=0 nullable=0 is_null=0 */
###   @2='0.2228574298535077' /* LONGBLOB/LONGTEXT meta=4 nullable=0 is_null=0 */
###   @3='0.8815988506019105' /* VARSTRING(120) meta=120 nullable=0 is_null=0 */
###   @4=757168.000000000000000000000000000000 /* DECIMAL(65,30) meta=16670 nullable=0 is_null=0 */
###   @5=53569 /* INT meta=0 nullable=0 is_null=0 */
# at 2185
#240704 14:20:52 server id 3306  end_log_pos 2216 CRC32 0x231ec0d2      Xid = 322337
COMMIT/*!*/;
...
```
:::

这个结果很轻松就能看懂 Binlog 里具体记录了什么事件。

关于 `mysqlbinlog` 工具的参数还有很多，例如只解析对某个库的操作或者某个时间段内的操作等。简单分享几个常用的语句，更多操作可以参考文档：[mysqlbinlog](https://dev.mysql.com/doc/refman/8.0/en/mysqlbinlog.html)。

```bash
# 查看参数帮助
mysqlbinlog --no-defaults --help

# 查看最后 100 行
mysqlbinlog --no-defaults --base64-output=decode-rows -vv binlog.000028 |tail - 100

# 根据 position 查找
mysqlbinlog --no-defaults --base64-output=decode-rows -vv binlog.000028 |grep -A 20 '619'
```

用 `mysqlbinlog` 工具读取出的 Binlog Events 内容比较多，还可以在 GreatSQL 中执行 SQL 命令 `SHOW BINLOG EVENTS` 查看处理后的简单版本事件内容：

```sql
-- 参考用法
SHOW BINLOG EVENTS [IN 'log_name'] [FROM pos] [LIMIT [offset,] row_count];
```

实际运行结果：
```sql
greatsql> SHOW BINLOG EVENTS IN 'binlog.000102' FROM 1142 LIMIT 1\G
*************************** 1. row ***************************
   Log_name: mgr01.002583
        Pos: 1142
 Event_type: Rows_query
  Server_id: 3306
End_log_pos: 1596
       Info: # INSERT INTO t_803225 VALUES
(1, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
(2, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
(4, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
(8, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
(16, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000)),
(32, rand(), rand(), ROUND(RAND()*1024000), ROUND(RAND()*1024000))
```
:::

- `IN 'log_name'：` 指定要查询的 Binlog 文件名（不指定就是第一个 Binlog 文件）。
- `FROM pos：` 指定从哪个 position 起始点开始查起（不指定就是从整个文件首个 position 开始算）。
- `LIMIT [offset]：` 偏移量（不指定就是 0）。
- `row_count :` 查询总条数（不指定就是所有行）。

其它用法参考：

```sql
-- a、查询第一个最早的 Binlog 日志:
SHOW BINLOG EVENTS\G

-- b、指定查询 binlog.088802 这个文件
SHOW BINLOG EVENTS IN 'binlog.088802'\G

-- c、指定查询 binlog.080802 这个文件，从 pos = 391 开始查起:
SHOW BINLOG EVENTS IN 'binlog.080802' FROM 391\G

-- d、指定查询 binlog.000802 这个文件，从 pos = 391 开始查起，查询 5 个 Events
SHOW BINLOG EVENTS IN 'binlog.000802' FROM 391 LIMIT 5\G

-- e、指定查询 binlog.880002 这个文件，从 pos = 391 开始查起，偏移量 2（即中间跳过 2 个 Events），查询 5 个 Events
SHOW BINLOG EVENTS IN 'binlog.880002' FROM 391 LIMIT 2,5\G
```

## 使用 Binlog 恢复数据

利用 `mysqlbinlog` 恢复数据的方法如下：

```sql
mysqlbinlog [option] filename | mysql -h'hostname' –u'user' -p'password'
```

上述命令的作用是用 `mysqlbinlog` 来读取 Binlog Events，然后通过管道直接将 Events 恢复到指定数据库中。

- `filename`：指定 Binlog 日志文件名。
- `option`：可选项，比较常用的参数是 `start-date`、`stop-date`、`start-position`、`stop-position`、`database`。
  - `start-date` 和 `stop-date`：可以指定恢复数据库的起始时间点和结束时间点。
  - `start-position` 和 `stop-position`：可以指定恢复数据的开始位置和结束位置。
  - `database`：只读取指定的数据库相关的 Events。

::: warning 警告
使用 `mysqlbinlog` 进行数据恢复操作时，必须按 Binlog 文件编号正序操作，不能跳跃和倒序操作。
:::

下面是一个利用 Binlog 恢复数据的例子：
```bash
cd /data/GreatSQL
mysqlbinlog --no-defaults --start-position=236 --stop-position=1071 --database=greatsql binlog.000002 | mysql -h192.168.0.11 -uroot -p'GreatSQL@202X' -f greatsql
```
上述命令的作用是读取 Binlog 中指定的起止点位，并且限定了只读 greatsql 这个数据库下的 Events，然后通过管道直接将 Events 恢复到 192.168.0.11 这个数据库实例中。

## 删除 Binlog

Binlog 文件可以设置为过期后自动删除，同时 GreatSQL 也提供了手动删除方法。

- 设置过期自动删除策略

修改 my.cnf 配置文件，增加类似下面内容
```ini
[mysqld]
binlog_expire_logs_seconds = 604800
```
上面提到过，这个设置表示 Binlog 会自动删除 7 天前的历史日志文件。

- 手动清除

还可以执行下面的命令手动清除 Binlog：

```sql
-- 删除编号比指定的 log_name 更小的所有 Binlog
PURGE BINARY LOGS TO 'log_name';

-- 删除指定日期 datetime_expr 之前的所有 Binlog
PURGE BINARY LOGS BEFORE 'datetime_expr';
```

下面是相应的示例：
```sql
-- 1. 查看当前所有的 Binlog
greatsql> SHOW BINARY LOGS;
+---------------+-----------+-----------+
| Log_name      | File_size | Encrypted |
+---------------+-----------+-----------+
| binlog.002583 |      2802 | No        |
| binlog.002584 |       576 | No        |
| binlog.002585 |       576 | No        |
| binlog.002586 |       576 | No        |
| binlog.002587 |       533 | No        |
+---------------+-----------+-----------+

-- 删除 'binlog.002587' 之前的所有 Binlog
greatsql> PURGE BINARY LOGS TO 'binlog.002587';
Query OK, 0 rows affected (0.07 sec)

-- 再次查看剩下的 Binlog
greatsql> SHOW BINARY LOGS;
+---------------+-----------+-----------+
| Log_name      | File_size | Encrypted |
+---------------+-----------+-----------+
| binlog.002587 |       533 | No        |
+---------------+-----------+-----------+

-- 或者用 BEFORE 指定时间参数
greatsql> PURGE BINARY LOGS BEFORE '2024-07-04 15:30';
Query OK, 0 rows affected (0.00 sec)
```

::: warning 警告
无论何种方式删除 Binlog，都务必要先进行备份，避免误操作后无法恢复。
:::

## 深入理解 Binlog

### Binlog 写入机制

事务执行过程中，会产生相应的 Binlog Events，就需要先把这些 Events 写到 Binlog cache 中，事务提交的时候，再把 Binlog cache 刷新同步到 Binlog 文件中。同一个事务中产生的不能被拆开，无论这个事务多大，也要确保全部写完，为了提高写入效率，GreatSQL 会给每个线程都分配 Binlog cache。

参数 `binlog_cache_size` 用于设置每个线程 binlog cache 大小，当 Binlog cache 中缓冲的数据量超过阈值后，就要将这些数据暂存到磁盘中。

Binlog 刷盘流程如下：

![Binlog 写入机制](./4-3-greatsql-binary-log-02.png#pic_center)

::: tip 小贴士
上图的 Write 动作是指把 Binlog Events 写入到文件系统的 Page cache，没有立即把数据同步刷新到磁盘，所以速度比较快。

其中的 fsync 动作才是真正将数据持久化刷新到磁盘的操作。
:::

参数 `sync_binlog` 用于设置 Write 和 fsync 的时机，它的默认值是 1。

在上面已经解释了 `sync_binlog` 不同设置的区别。当设置为 0，表示每次提交事务都只 Write 到操作系统的 Page cache，再由操作系统自行判断什么时候执行 fsync。这时候的性能最好，但也最危险，以为当系统发生故障重启时，Page cache 里暂存的 Binglog Events 就会丢失。如下图所示：

![Binlog 刷盘机制](./4-3-greatsql-binary-log-03.png#pic_center)

在要求数据高一致性的业务场景中，务必设置为 1，表示每次提交事务都会执行 fsync 立即同步刷新到磁盘。

还可以设置为 `sync_binlog = N`（N > 1），表示每次提交事务都 Write 到操作系统的 Page cache，在累积 N 次提交后才批量 fsync，这是介于性能和数据可靠性中间的一个折中方案。

### Binlog 与 Redo Log 的异同

- Redo Log 是逻辑物理日志，记录的内容是 **在某个数据页上做了什么修改**，它只工作在 InnoDB 引擎层。
- 而 Binlog 是 **纯粹的逻辑日志**，记录的内容是对数据库变更的事件（通常也可以理解为对数据库修改的 SQL 语句），它工作 Server 层，所有的引擎都会涉及到。
- 二者都是为事务数据的持久化提供保障，但是侧重点略有不同：
  - Redo Log 为 InnoDB 引擎提供事务一致性保障和崩溃恢复支持。
  - Binlog 主要用于主从复制、MGR 组复制、增量备份（后用于恢复到指定时间点）等其他用途。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
