# Changes in GreatSQL 8.0.32-27 (2025-x-x)

## 版本信息

- 发布时间：2025年x月x日

- 版本号：8.0.32-27, Revision xxxxxxxxxxx

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)

- 用户手册：[GreatSQL 8.0.32-27 User Manual](https://greatsql.cn/docs/8.0.32-27/)

##  改进提升

在GreatSQL 8.0.32-27版本中新增高性能并行查询引擎**Turbo**，升级Rapid引擎内核版本，优化MGR大事务压缩传输机制，完善greatdb_ha plugin，InnoDB Page支持zstd压缩，完善Oracle兼容特性，完善安全性等，并修复了几个可能导致crash或丢数据的bug。

### 高可用

- 优化了MGR大事务传输时压缩超过限制的处理机制。

在MGR中有大事务超过`group_replication_compression_threshold`阈值时会进行LZ4压缩，但由于LZ4自身限制，可能导致压缩失败报错，事务执行失败，报告类似下面的错误

```log
[GCS] Gcs_packet's payload is too big. Only packets smaller than 2113929216 bytes can be compressed. Payload size is 2197817290
```

GreatSQL对此机制进行调整优化，实现以下两点目标：

1. 当事务大小超过`group_replication_compression_threshold`阈值则启动压缩。

2. 但当事务大小超过LZ4压缩限制时不再报错，改成继续使用原始未压缩的事务数据进行传输，即类似设置`group_replication_compression_threshold=0`（不启用压缩）时的效果。

- 新增状态变量`Rpl_data_speed`显示当前binlog限速的状态，可以通过执行`SHOW GLOBAL STATUS LIKE 'Rpl_data_speed'`查看，例如

```sql
greatsql> SHOW GLOBAL STATUS LIKE 'Rpl%spee%';
+----------------+------------------+
| Variable_name  | Value            |
+----------------+------------------+
| Rpl_data_speed | async_rpl=100.00 |
+----------------+------------------+
```
表示当前的binlog读取限速为100KB/s，更多详细用法请参考：[Binlog 读取限速](../../5-enhance/5-2-ha-binlog-speed-limit.md)。

- 在greatdb_ha plugin中，增加对greatdb_ha_port进行防御，避免用户端发送非法指令后可能导致crash的风险。
- 修复了启用greatdb_ha plugin时，可能因为Linux系统函数FD_SET中当遇到文件描述符超过1024时导致未定义行为而引发crash的问题。
- 修复了greatdb_ha plugin中启用VIP功能后，可能存在内存泄漏风险的问题。
- 修复了在主备两套MGR集群间部署主从复制后，当备用集群主节点shutdown时，可能无法退出进程的问题。
- 修复了在主备两套MGR集群间部署主从复制后，当备用集群主节点执行`kill -19`操作杀掉mysqld进程，在故障恢复后，slave线程可能长时间未能退出的问题。

### 高性能
- 新增高性能并行查询引擎**Turbo**，它通过内嵌DuckDB，使GreatSQL具备多线程并发的向量化查询功能，在实现指数级提升加速SQL查询速度的同时，保持对GreatSQL生态系统的兼容性。相较于Rapid引擎，Turbo引擎不需要将数据加载到引擎中，而是在查询过程中，直接并行抽取数据供Turbo引擎使用。

首先安装Turbo引擎

```sql
greatsql> INSTALL PLUGIN turbo SONAME 'turbo.so';
```

之后就可以利用Turbo引擎提升SQL查询效率

```sql
greatsql> SELECT /*+ SET_VAR(turbo_enable=ON) SET_VAR(turbo_cost_threshold=0)*/ * FROM t1;
```

关于Turbo引擎更详细的使用方法请参考：[Turbo引擎](../../5-enhance/5-1-highperf-turbo-engine.md)。

- 升级Rapid引擎内核到1.0.0版本，新版本在存储格式稳定性、查询语义一致性等方面的重大突破，为用户提供了强有力的稳定性保证。不过，该版本采用新的文件存储格式，和之前的版本**不兼容**，因此无法从GreatSQL 8.0.32-25或8.0.32-26版本直接平滑升级，需要先删除旧的数据文件，再全量导入数据，并重新设置增量导入任务。详细升级方式请见下方：[升级到 GreatSQL 8.0.32-27](#)。
- 在新版本的Rapid引擎中，最大可使用并行逻辑CPU核数上限为4个，如果需要支持更高并发性能，可以联系我们提供解决方案。TODO，待确定具体限制方案
- 修复了Rapid引擎中一次性删除大批量数据后，查看增量导入任务进度时，DELAY字段显示不准确的问题。
- 修复了在存储过程中使用EXPLAIN查看Rapid表执行计划时，显示无法使用Rapid引擎实际上却可以使用的错误问题。
- 修复Rapid引擎中未先完成一次全量导入任务，而是直接启动增量导入任务发生失败报错后，重启实例后无法正常启动的问题。正常地，正确的做法是先完成一次全量导入后，再启动增量导入任务。
- 修复Rapid引擎参数`rapid_worker_threads`设置问题。当将其设置超过最大值后，再重新设置除默认值之外的其他合法值都会报错，需要重新装载Rapid引擎或重启数据库后才恢复正常。
- 移除Rapid引擎参数`rapid_hash_table_memory_limit`，不再使用。
- 读取Rapid表数据时，error log中不再打印类似下方的冗余信息。

```log
[Note] [MY-011825] [InnoDB] thread 62 handle range count: 34 total rows: 2449266
[Note] [MY-011825] [InnoDB] thread 63 handle range count: 21 total rows: 1648443
[Note] [MY-011825] [InnoDB] total fetch rows count: 150000000
``` 
- 修复Rapid引擎对表中存在虚拟列时的处理方案。在以前，当表中存在虚拟列时，执行`ALTER TABLE ... SECONDARY_LOAD`不会报错，但在执行`SELECT ... /*+ SET_VAR(use_secondary_engine=FORCED) */ `时会报错不支持。在新版本中，当发现表中存在虚拟列时，执行`ALTER TABLE ... SECONDARY_LOAD`直接报告下面的错误表示不支持：

```sql
ERROR 3106 (HY000): 'Rapid engine' is not supported for generated columns.
```

- 在使用Rapid引擎时，如果出现不支持的数据类型，返回的错误提示中增加更明确的错误，如下例所示

```sql
greatsql> CREATE TABLE t1 (
  id int unsigned not null primary key,
  c1 int unsigned not null,
  c2 decimal(65,30) DEFAULT NULL
) SECONDARY_ENGINE=rapid;
Query OK, 0 rows affected (0.02 sec)

-- 下面的报错信息中，明确提示 c2 列的数据类型不支持
greatsql> ALTER TABLE t1 SECONDARY_LOAD;
ERROR 3877 (HY000): The field c2 type is not supported
```

### 高兼容
- 在 `TO_DATE` 函数中新增支持`INTERVAL 'n' DAY`运算用法。例如

```sql
greatsql> SELECT TO_DATE('20250212','YYYYMMDD') + (INTERVAL '-1' DAY) AS LASTDAY FROM DUAL;

+---------------------+
| LASTDAY             |
+---------------------+
| 2025-02-11 00:00:00 |
+---------------------+
```
- 优化`TO_NUMBER`函数在大数据量时的执行效率，性能可提升数倍。
- 修复了REF CURSOR在执行过程中表结构发生变化时可能导致报错的问题。
- 优化动态游标内存管理机制，在动态游标END LOOP执行完后及时释放内存。
- 修复了当源表为单行伪表时，MERGE INTO语句更新目标表失败，导致执行结果和在Oracle中不一致的问题。

### 高安全
- 修复最后登录信息功能中由于未处理binlog可能导致主从异常问题。
- 修复审计日志入表功能中由于未处理binlog可能导致主从异常问题。
- 修复了审计日志入表功能中，安装和卸载SQL脚本中前后函数名不一致问题。
- 修复了在开启sql_log_bin的时候，本应该禁止修改审计日志表sys_audit.audit_log，却可以更新修改的问题。

### 其他
- InnoDB Page压缩算法支持zstd, 使得Page压缩率提高约5%。TODO，待提供更详细的说明内容

## 缺陷修复
- 修复了特定情况下，执行`EXPLAIN FORMAT=TREE`可能导致crash的问题，详见：[Issue#IAL5KK](https://gitee.com/GreatSQL/GreatSQL/issues/IAL5KK)。
- 合并了MySQL 8.0.38中的bug fix，对应bug id：#36204344、#36356279。
- 合并了针对特定情况下执行ALTER TABLE可能导致丢失一行数据的问题，合并了Percona团队提交的bug fix，对应的bug id：#113812、#115511、#115608。

## 注意事项

## 升级/降级到 GreatSQL 8.0.32-27

### 升级到 GreatSQL 8.0.32-27
- 如果旧版本是GreatSQL 8.0.32-25或8.0.32-26，并且没有使用Rapid引擎，则可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.0.32-27 后会完成自动升级。
- 如果旧版本是 GreatSQL 8.0.32-25或8.0.32-26，并且已启用Rapid引擎，**这种情况下无法原地升级**，需要卸载所有Rapid引擎表，删除Rapid数据文件，之后才可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动GreatSQL 8.0.32-27后会完成自动升级。新版本实例启动后，对所有Rapid引擎表执行`ALTER TABLE SECONDARY_LOAD`完成全量数据导入，再执行`SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK()`启动增量导入任务，完成Rapid引擎表升级工作。下面是一个升级参考过程：

1. 查询并记录所有Rapid引擎表

可以执行下面的SQL，查询当前有哪些表使用了Rapid引擎：

```sql
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE CREATE_OPTIONS LIKE '%Rapid%';
+--------------+----------------+------------+
| TABLE_SCHEMA | TABLE_NAME     | TABLE_ROWS |
+--------------+----------------+------------+
| tpch100g     | customer       |   14854987 |
| tpch100g     | lineitem       |  582868392 |
| tpch100g     | nation         |         25 |
| tpch100g     | orders         |  148492582 |
| tpch100g     | part           |   19943155 |
| tpch100g     | partsupp       |   79832625 |
| tpch100g     | region         |          5 |
| tpch100g     | supplier       |     989416 |
+--------------+----------------+------------+
```

2. 正常停止GreatSQL实例进程

在停止GreatSQL实例进程前，先修改`innodb_fast_shutdown=0`后再执行`SHUTDOWN`停止实例

```sql
greatsql> SET GLOBAL innodb_fast_shutdown=0;
greatsql> SHUTDOWN;
```

3. 删除旧的Rapid引擎数据文件

```bash
cd /data/GreatSQL && rm -f duckdb*
```

4. 修改`my.cnf`配置文件中的`basedir`参数，指向GreatSQL 8.0.32-27新版本

```ini
#my.cnf
[mysqld]
basedir=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64
```
并确保参数`upgrade`不是设置为*NONE*。

5. 启动GreatSQL 8.0.32-27新版本实例

```bash
systemctl start greatsql
```

6. 重新安装Rapid引擎

```sql
greatsql> INSTALL PLUGIN rapid SONAME 'ha_rapid.so';
```

7. 对Rapid引擎表做一次全量数据导入

```sql
greatsql> ALTER TABLE test.t1 SECONDARY_LOAD;
```

::: tip 小贴士
由于在升级前没有去掉该表的`SECONDARY_ENGINE=rapid`属性，所以无需重新设置。如果在升级前卸载所有Rapid引擎表，则需要重新设置。
:::

8. 再次启动增量导入任务

```sql
greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('test', 't1');
```
这就完成Rapid引擎表的升级操作了。

- 如果旧版本是GreatSQL 8.0.32-24、8.0.25-*、5.7.36-39等系列版本，则可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动GreatSQL 8.0.32-27 后会完成自动升级。
- 如果是MySQL 8.0.*（<= 8.0.32 版本）、Percona Server 8.0.*（<= 8.0.32 版本）等系列版本，则可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.0.32-27后会完成自动升级。
- 如果是MySQL 8.0.*（> 8.0.32 版本）、Percona Server 8.0.*（> 8.0.32 版本）等系列版本，则需要利用逻辑备份方式导出数据，再导入的方式完成升级，不支持原地（in-place）升级到 GreatSQL 8.0.32-27。
- 如果是MySQL 5.7.*（>= 5.7.23 版本）、Percona Server 5.7.*（<= 5.7.23 版本）等系列版本，则可以直接在原来的`datadir`基础上，修改`basedir`后，原地（in-place）启动 GreatSQL 8.0.32-27后会完成自动升级。

在以上几个原地升级场景中，务必保证`my.cnf`中参数`upgrade`不能设置为*NONE*，可以设置为默认的*AUTO*或*FORCE*。例如：

```ini
[mysqld]
upgrade = AUTO
```

更多迁移升级方案请参考：[迁移升级](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md)。

### 降级到 GreatSQL 8.0.32-27

如果是要从 MySQL/Percona 8.0.32 之后的版本降级到 GreatSQL 8.0.32-27 版本，则需要采取逻辑备份 + 逻辑导入方式完成降级操作，并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade = FORCE` 强制升级所有数据表，包括系统表。

降级过程操作大致如下所示：

1. 在高版本中逻辑备份全量数据
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

2. 在GreatSQL 8.0.32-27版本环境中导入逻辑备份文件，完成逻辑恢复

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

3. 修改my.cnf，确保 upgrade = FORCE 设置
```ini
[mysqld]
upgrade = FORCE
```

4. 重启GreatSQL，降级完成

```bash
systemctl restart greatsql
```
重启过程中，可以看到日志有类似下面的强制升级过程

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-013381] [Server] Server upgrade from '80032' to '80032' completed.
```

如果不设置 `upgrade = FORCE` 强制升级所有表，有可能发生系统表 `mysql.procs_priv` 损坏错误，在创建用户时可能会报告类似下面的错误：

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## GreatSQL VS MySQL

| **1.主要特性** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| 开源 |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID 完整性| :heavy_check_mark: | :heavy_check_mark: |
|MVCC 特性| :heavy_check_mark:     | :heavy_check_mark: |
|支持行锁| :heavy_check_mark: | :heavy_check_mark: |
|Crash 自动修复| :heavy_check_mark: | :heavy_check_mark: |
|表分区（Partitioning）| :heavy_check_mark: | :heavy_check_mark: |
|视图（Views）| :heavy_check_mark: | :heavy_check_mark: |
|子查询（Subqueries）| :heavy_check_mark: | :heavy_check_mark: |
|触发器（Triggers）| :heavy_check_mark: | :heavy_check_mark: |
|存储程序（Stored Programs）| :heavy_check_mark: | :heavy_check_mark: |
|外键（Foreign Keys）| :heavy_check_mark: | :heavy_check_mark: |
|窗口函数（Window Functions）| :heavy_check_mark: | :heavy_check_mark: |
|通用表表达式 CTE| :heavy_check_mark: | :heavy_check_mark: |
|地理信息（GIS）| :heavy_check_mark: | :heavy_check_mark: |
|基于 GTID 的复制| :heavy_check_mark: | :heavy_check_mark: |
|组复制（MGR）| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks 引擎| :heavy_check_mark: | ❌ |
|支持龙芯架构| :heavy_check_mark: | ❌ |
| **2. 性能提升扩展** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|Rapid 引擎| :heavy_check_mark: | 仅云上HeatWave |
|Turbo 引擎| :heavy_check_mark: | 仅云上HeatWave |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入优化 | :heavy_check_mark: | ❌ |
|InnoDB 并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行 LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB 事务 ReadView 无锁优化| :heavy_check_mark: | ❌ |
|InnoDB 事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB page压缩支持zstd| :heavy_check_mark: | ❌ | 
|InnoDB 资源组| :heavy_check_mark: | :heavy_check_mark: |
|自定义 InnoDB 页大小| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes 拆分优化| :heavy_check_mark: | ❌ |
|MEMORY 引擎优化| :heavy_check_mark: | ❌ |
|InnoDB Flushing 优化| :heavy_check_mark: | ❌ |
|并行 Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 快速索引创建优化| :heavy_check_mark: | ❌ |
|VARCHAR/BLOB/JSON 类型存储单列压缩| :heavy_check_mark: | ❌ |
|数据字典中存储单列压缩信息| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|MGR 提升-地理标签| :heavy_check_mark: | ❌ |
|MGR 提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR 提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR 提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR 提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR 提升-全新流控算法| :heavy_check_mark: | ❌ |
|MGR 提升-网络分区异常处理 |  :heavy_check_mark: | ❌ |
|MGR 提升-节点异常退出处理 | :heavy_check_mark: | ❌ |
|MGR 提升-节点磁盘满处理 | :heavy_check_mark: | ❌ |
|MGR 提升-自动选择 donor 节点| :heavy_check_mark: | ❌ |
|Clone 增量备份| :heavy_check_mark: | ❌ |
|Clone 备份压缩| :heavy_check_mark: | ❌ |
|Binlog 读取限速| :heavy_check_mark: | ❌ |
|information_schema 表数量|95|65|
|全局性能和状态指标|853|434|
|优化器直方图（Histograms）| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table 性能指标| :heavy_check_mark: | ❌ |
|Per-Index 性能指标| :heavy_check_mark: | ❌ |
|Per-User 性能指标| :heavy_check_mark: | ❌ |
|Per-Client 性能指标| :heavy_check_mark: | ❌ |
|Per-Thread 性能指标| :heavy_check_mark: | ❌ |
|全局查询相应耗时统计| :heavy_check_mark: | ❌ |
|SHOW INNODB ENGINE STATUS 增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log 信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计| :heavy_check_mark: | 仅企业版 |
|数据脱敏| :heavy_check_mark: | ❌ |
|最后登录记录| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2 密码Hashing| :heavy_check_mark: | :heavy_check_mark: |
|密码轮换策略| :heavy_check_mark: | :heavy_check_mark: |
|PAM 认证插件| :heavy_check_mark: | 仅企业版 |
|Keyring 存储在文件中| :heavy_check_mark: | :heavy_check_mark: |
|Keyring 存储在Hashicorp Vault中| :heavy_check_mark: | 仅企业版 |
|InnoDB 数据加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 日志加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 各种表空间文件加密| :heavy_check_mark: | :heavy_check_mark: |
|二进制日志加密| :heavy_check_mark: | ❌ |
|临时文件加密| :heavy_check_mark: | ❌ |
|强制加密| :heavy_check_mark: | ❌ |
| **6. 运维便利性提升** | GreatSQL 8.0.32-27 | MySQL 8.0.32 |
|DDL 原子性| :heavy_check_mark: | :heavy_check_mark: |
|数据字典存储 InnoDB 表| :heavy_check_mark: | :heavy_check_mark: |
|快速 DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|不可见索引| :heavy_check_mark: | :heavy_check_mark: |
|线程池（Threadpool）| :heavy_check_mark: | 仅企业版 |
|备份锁| :heavy_check_mark: | ❌ |
|SHOW GRANTS 扩展| :heavy_check_mark: | ❌ |
|表损坏动作扩展| :heavy_check_mark: | ❌ |
|杀掉不活跃事务| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT 扩展| :heavy_check_mark: | ❌ |

GreatSQL 8.0.32-27 基于 Percona Server for MySQL 8.0.32 版本，它在 MySQL 8.0.32 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等 MySQL 企业版才有的特性，以及 performance_schema 提升、information_schema 提升、性能和可扩展性提升、用户统计增强、PROCESSLIST 增强、Slow Log 增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-26 (2024-08-05)](changes-greatsql-8-0-32-26-20240805.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)


**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
