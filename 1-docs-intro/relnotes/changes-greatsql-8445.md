# Changes in GreatSQL 8.4.4-5 (2026-06-30)

## 版本信息

- 发布时间：2026年06月30日

- 版本号：8.4.4-5, Revision 39b389cdf3b

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5)

- 用户手册：[GreatSQL 8.4.4-5 User Manual](https://greatsql.cn/docs/8.4.4-5/)

##  改进提升

GreatSQL 8.4.4-5版本在**高可用**、**高性能**、**高兼容**、**高安全**四个方面进行了多项特性增强，使得 GreatSQL 可在普通硬件上满足金融级应用场景，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

GreatSQL 8.4.4-5版本中新增**大事务binlog独立落盘**优化，提升**并行复制回放效率**，新增**向量数据类型及相似度查询**支持，**恢复旧版主从复制语法兼容**，优化**MGR多项机制**，增强**MGR VIP插件安全性**，并修复了多个可能导致crash或数据不一致的bug。

### [高可用](../../5-enhance/5-2-ha.md)

- 新增兼容特性，恢复`CHANGE MASTER TO`、`START SLAVE`等全套旧版主从复制语法与配套状态变量、报错信息，兼容存量运维脚本。新旧复制指令并行可用，底层复制逻辑无改动，升级无需改造监控自动化工具。解决从低版本升级至8.4后旧复制管理语句执行报错问题，大幅降低数据库大版本升级改造工作量。

本特性为内核复制兼容增强层，不改动底层复制同步核心逻辑，仅在SQL解析、结果输出、错误提示外层做双向映射适配：
1. 完整恢复以前高频使用的 `Master/Slave` 复制管理SQL语法，新旧语法均可正常执行；
2. `SHOW SLAVE STATUS`、`SHOW MASTER STATUS` 输出结果兼容旧字段名、字段顺序；
3. 同步保留 `Slave_*` 系列全局状态变量，与新版 `Replica_*` 变量数据实时双向同步；
4. 旧语法执行报错时，返回历史兼容错误码与Master/Slave风格提示文本；
5. 新旧语法完全隔离互不干扰，底层复用同一套复制执行逻辑，性能无损耗、数据一致性不受影响。

**复制管理语句新旧对应**

| 旧版Master/Slave语法 | 新版Source/Replica标准语法 |
|---------------------|---------------------------|
| `CHANGE MASTER TO` | `CHANGE REPLICATION SOURCE TO` |
| `START SLAVE` | `START REPLICA` |
| `STOP SLAVE` | `STOP REPLICA` |
| `RESET SLAVE` | `RESET REPLICA` |
| `SHOW SLAVE STATUS` | `SHOW REPLICA STATUS` |
| `SHOW SLAVE HOSTS` | `SHOW REPLICAS` |
| `RESET MASTER` | `RESET BINARY LOGS AND GTIDS` |
| `SHOW MASTER STATUS` | `SHOW BINARY LOG STATUS` |
| `SHOW MASTER LOGS` | `SHOW BINARY LOGS` |
| `PURGE MASTER LOGS` | `PURGE BINARY LOGS` |

**CHANGE MASTER TO 参数映射**

旧 `MASTER_*` 选项会自动映射为内部 `SOURCE_*` 参数，完整兼容：`MASTER_HOST`/`MASTER_USER`/`MASTER_PASSWORD`/`MASTER_PORT`/`MASTER_AUTO_POSITION`/`MASTER_LOG_FILE`/`MASTER_LOG_POS`/`MASTER_CONNECT_RETRY`/`MASTER_RETRY_COUNT`/`MASTER_DELAY`/SSL全套参数/压缩参数/心跳参数/公钥参数等。

详情参考：[恢复部分主从复制兼容接口](../../5-enhance/5-2-ha-repl-interface-cmd.md)。

- 针对 GreatDB HA 插件改用 UDF 函数替代原来的端口通信逻辑，调用 UDF 时需要 SUPER 权限及相关 MGR 权限，同时可按需支持 SSL 加密，兼顾 HA 插件的功能及通信安全。详情参考：[MGR节点内置VIP](../../5-enhance/5-2-ha-mgr-vip.md#安全加固说明)。
- 修改 `performance_schema.replication_group_member_stats` 系统表，新增 `SECOND_BEHIND_GROUP` 字段，用于记录 MGR 节点间复制延迟时间状态。
- 主从复制中针对大批量 DML 操作时如果发生 `1032 / duplicate-key` 错误，在以前缺乏精确定位能力，调研目标是增强错误日志能力以输出不一致数据行，降低运维排查成本。
- 在 MGR 节点重启自动加入失败的场景下，由于 `super_read_only` 未保持开启导致节点仍可写入数据，从而引发数据不一致与后续无法加入复制组的问题，因此需要在加入失败时也强制保持 `super_read_only=ON` 以避免异常写入。
- 在 MGR 自动重加组及手动启动流程中，XCom 线程已退出后仍继续处于 `Wait for view modification` 超时等待已无实际意义，因此可优化为在确认 XCom 退出后提前结束 `START GROUP_REPLICATION` 或 `auto-rejoin` 流程，以减少无效等待并提升重入效率与错误返回及时性。

更多信息详见文档：[高可用](../../5-enhance/5-2-ha.md)。

### 高性能
- 新增大事务 binlog 独立落盘特性，通过重构 binlog cache 文件结构、直接 rename 落盘等核心改造，避免大事务提交时 binlog 二次写入的高I/O开销。该特性可**降低 30%~70% 的大事务提交延迟，提升 10%~40% 的高并发TPS**，保障系统稳定性。详情参考：[大事务 binlog 独立落盘](../../5-enhance/5-1-highperf-binlog-flush-opt-large-trx.md)。
- 优化了主从/组复制中从节点的并行复制回放机制，将冲突事务的等待逻辑从协调线程下沉至 worker 线程，通过新增 need_wait 标记、worker 等待与唤醒机制，配合设置参数 `replica_parallel_wait_mode=WAIT_ON_WORKER_THREAD`，有效减少调度阻塞，提升备节点并行回放吞吐能力，降低复制延迟，增强集群高可用稳定性。详情参考：[并行复制回放优化](../../5-enhance/5-1-highperf-parallel-replica.md)。
- 新增SQL Digest维度的执行计划变更异常捕获功能，可持续采集并缓存执行计划基线信息，通过差分比对识别执行计划变化及存疑SQL，解决数据库重启/升级后执行计划漂移不可见等问题。该功能基于插件化架构，采用内存缓存+异步持久化设计，保障主链路性能不受影响，同时支持异常容错、权限管控，可通过参数开关控制采集与持久化行为，兼容现有Digest体系及MySQL协议，仅部分引擎/特殊SQL存在使用限制。详情参考：[执行计划变更异常捕获](../../5-enhance/5-1-highperf-execplan-baseline.md)。
- 新增 `VECTOR` 向量原生数据类型，配套字符串互转、维度查询、余弦/欧氏/内积三类距离计算SQL函数，支持 Turbo 引擎向量化并行加速向量相似度查询；完全兼容 `binlog`、`xtrabackup` 备份，`JDBC/ODBC/Python` 驱动配套适配版本有明确要求，同时明确向量字段使用约束与 Turbo 自动降级机制，支撑AI向量检索类业务场景。详情参考：[Turbo 引擎向量相似度查询](../../5-enhance/5-1-highperf-vector-search.md)。

### 其他
- 在 `mysqlbinlog` 的输出中，加上参数 `-vvv` 后，可以补充展示每个事务的实际影响行数 `affected rows`，增强 binlog 解析的可观测性与运维统计能力。

## 缺陷修复
- 修复 `Turbo` 引擎类型映射时，对于不支持的类型，会抛出异常，但未被捕获导致 coredump 问题。
- 修复 `Turbo` 查询 Kill 时可能无响应的问题。
- 修复 `Rapid` 和 `Turbo` 引擎中处理负的 `Time` 值的时候，忽略负号导致的查询错误问题。
- 修复新节点加入 MGR 的过程中，当主节点有较大压力负载的情况下，可能长时间处于 `Recovery` 状态的问题。
- 修复多节点 MGR 场景中，当发生网络故障并恢复后，个别节点无法恢复的问题。
- 修复在 MGR 中进行 Relay Log 批量落盘后可能存在 `RECEIVED_TRANSACTION_SET` 断点的问题。
- 修复在 MGR 中节点因故存在延迟，使用 `BEFORE` 读写级别时，启动新事务进行查询、修改时，新事务的第一条执行语句会阻塞；此时，若用户手动执行 `STOP GROUP_REPLICATION` 停止该节点的组复制，会导致事务语句以及 `STOP GROUP_REPLICATION` 操作可能都被阻塞的问题。
- 修复 Clone 执行增量备份任务时如果同时有大量事务执行，可能失败甚至数据丢失的问题。
- 修复视图语句使用(+)语法可能导致报错甚至coredump问题。
- 修复服务端开启空串模式（`EMPTYSTRING_EQUAL_NULL`）后执行 `mysqldump` 提示设置''模式失败问题。
- 修复在游标使用 `BULK INTO` 写入嵌套表或关联数组时可能发生异常的问题。

## 注意事项

## 升级/降级到 GreatSQL 8.4.4-5

### 升级到 GreatSQL 8.4.4-5
- 如果是 GreatSQL 5.7 系列版本，可以直接在原来的 `datadir` 基础上，修改 `basedir` 后，原地（in-place）启动 GreatSQL 8.0.32-27 版本后，先原地升级到 GreatSQL 8.0.32-27 版本。再继续在该 `datadir` 基础上升级，即修改 `basedir` 指向 GreatSQL 8.4.4-5 新版本，再次进行原地升级。需要注意的是，从 5.7 版本升级到 8.0 版本，再升级到 8.4 版本后，数据库中的账号仍采用 `mysql_native_password` 密码验证插件。当最终升级到 8.4 版本后，需要修改 *my.cnf* 配置文件，加上 `mysql_native_password=1`，以保证原有的账号能正常登录。
- 如果是 GreatSQL 8.0/8.4 系列版本，并且没有使用 **Rapid** 引擎，则可以直接在原来的** `datadir`** 基础上，修改** `basedir`** 后，原地（in-place）启动 GreatSQL 8.4.4-5 后会完成自动升级。
- 如果是 GreatSQL 8.0/8.4 系列版本且已启用 **Rapid** 引擎，**这种情况下无法原地升级**，需要卸载所有 **Rapid** 引擎表，删除 **Rapid** 数据文件，才可以在原来的 `datadir` 基础上，修改 `basedir` 后，原地（in-place）启动 GreatSQL 8.4.4-5 后进行自动升级。新版本实例启动后，对所有 **Rapid** 引擎表执行 `ALTER TABLE SECONDARY_LOAD` 完成全量数据导入，再执行 `SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK()` 启动增量导入任务，完成 **Rapid** 引擎表升级工作。下面是一个升级参考过程：

  **1. 查询并记录所有Rapid引擎表**
  
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
  
  **2. 卸载所有Rapid表**

  以其中一个表为例：

  ```sql
  greatsql> ALTER TABLE tpch100g.customer SECONDARY_UNLOAD;
  ```

  **3. 正常停止GreatSQL实例进程**
  
  在停止GreatSQL实例进程前，先修改`innodb_fast_shutdown=0`后再执行`SHUTDOWN`停止实例
  
  ```sql
  greatsql> SET GLOBAL innodb_fast_shutdown=0;
  greatsql> SHUTDOWN;
  ```
  
  **4. 删除旧的Rapid引擎数据文件**
  
  ```bash
  cd /data/GreatSQL && rm -f duckdb*
  ```
  
  **5. 修改`my.cnf`配置文件中的`basedir`参数，指向GreatSQL 8.4.4-5新版本**
  
  ```ini
  #my.cnf
  [mysqld]
  basedir=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64
  ```
  并确保参数`upgrade`不是设置为*NONE*。
  
  **6. 启动GreatSQL 8.4.4-5新版本实例**
  
  ```bash
  systemctl start greatsql
  ```
  
  **7. 重新安装Rapid引擎**
  
  ```sql
  greatsql> INSTALL PLUGIN rapid SONAME 'ha_rapid.so';
  ```
  
  此时有可能提示错误 `ERROR 1125 (HY000): Function 'rapid' already exists`，可以不用理会，这是以为在重启前没有卸载Rapid引擎。
  
  **8. 对所有Rapid引擎表做一次全量数据导入**
  
  ```sql
  greatsql> ALTER TABLE tpch100g.customer SECONDARY_ENGINE = rapid;
  greatsql> ALTER TABLE tpch100g.customer SECONDARY_LOAD;
  ```

  其他表重复执行上述操作，直到全部完成。
  
  ::: tip 小贴士
  由于在升级前没有去掉该表的`SECONDARY_ENGINE=rapid`属性，所以无需重新设置。如果在升级前卸载所有Rapid引擎表，则需要重新设置。
  :::
  
  **9. 再次启动增量导入任务**
  
  ```sql
  greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('tpch100g', 'customer');
  ```
  这就完成Rapid引擎表的升级操作了。

- 如果是 MySQL 5.7 或 Percona Server 5.7 等系列版本，可以直接在原来的 `datadir` 基础上，修改 `basedir` 后，原地（in-place）启动 GreatSQL 8.0.32-27 版本后，确认升级成功后，再次在原来 `datadir` 基础上继续升级，即修改 `basedir` 指向 GreatSQL 8.4.4-5 新版本，之后就能完成自动升级。需要注意的是，从 5.7 版本升级到 8.0 版本，再升级到 8.4 版本后，数据库中的账号仍采用 `mysql_native_password` 密码验证插件。当最终升级到 8.4 版本后，需要修改 *my.cnf* 配置文件，加上 `mysql_native_password=1`，以保证原有的账号能正常登录。
- 如果是 MySQL 8.0 或 Percona Server 8.0 等系列版本，则可以直接在原来的 `datadir` 基础上，修改 `basedir` 后，原地（in-place）启动 GreatSQL 8.4.4-5 后会完成自动升级。
- 其他情况下，最好采用导入逻辑备份文件方式升级到 GreatSQL 8.4.4-5 版本。

在以上几个原地升级场景中，务必保证`my.cnf`中参数`upgrade`不能设置为*NONE*，可以设置为默认的*AUTO*或*FORCE*。例如：

```ini
#my.cnf
[mysqld]
upgrade = AUTO
```

更多迁移升级方案请参考：[迁移升级](../../7-migrate-and-upgrade/0-migrate-and-upgrade.md)。

### 降级到 GreatSQL 8.4.4-5

如果是要从 MySQL/Percona 8.4 系列较高的小版本降级到 GreatSQL 8.4.4-5 版本，可以采用原地降级方式快速完成版本降级操作。即可以直接在原来的 `datadir` 基础上，修改 `basedir` 后，并增加设置参数`upgrade=FORCE`，原地（in-place）启动 GreatSQL 8.4.4-5 后会完成自动降级。

如果是要从 MySQL/Percona 9.0 及之后的版本降级到 GreatSQL 8.4.4-5 版本，则需要采取逻辑备份 + 逻辑导入方式完成降级操作，并且在逻辑备份导入完成后的首次重启时，务必设置 `upgrade=FORCE` 强制升级所有数据表，包括系统表。

降级过程操作大致如下所示：

**1. 在高版本中逻辑备份全量数据**
```bash
mysqldump -S/data/MySQL/mysql.sock -A --triggers --routines --events --single-transaction > /data/backup/fulldump.sql
```

**2. 在GreatSQL 8.4.4-5版本环境中导入逻辑备份文件，完成逻辑恢复**

```bash
mysql -S/data/GreatSQL/mysql.sock -f < /data/backup/fulldump.sql
```

**3. 修改`my.cnf`，确保设置`upgrade=FORCE`**
```ini
#my.cnf
[mysqld]
upgrade = FORCE
```

**4. 重启GreatSQL，降级完成**

```bash
systemctl restart greatsql
```
重启过程中，可以看到日志有类似下面的强制降级过程

```log
[Note] [MY-013387] [Server] Upgrading system table data.
[Note] [MY-013385] [Server] Upgrading the sys schema.
[Note] [MY-013400] [Server] Upgrade of help tables started.
[Note] [MY-013400] [Server] Upgrade of help tables completed.
[Note] [MY-013394] [Server] Checking 'mysql' schema.
[Note] [MY-013394] [Server] Checking 'sys' schema.
[System] [MY-014064] [Server] Server downgrade from '80406' to '80404' started.
[System] [MY-014064] [Server] Server downgrade from '80406' to '80404' completed.
```

如果不设置 `upgrade = FORCE` 强制升级所有表，有可能发生系统表 `mysql.procs_priv` 损坏错误，在创建用户时可能会报告类似下面的错误：

```sql
greatsql> create user tpch identified by 'tpch';
ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted
```

## GreatSQL vs MySQL

| **1.主要特性** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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
|支持RISC-V架构| :heavy_check_mark: | ❌ |
|恢复部分主从复制兼容接口| :heavy_check_mark: | ❌ |
| **2. 性能提升扩展** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
|Rapid 引擎| :heavy_check_mark: | 仅云上HeatWave |
|Turbo 引擎| :heavy_check_mark: | ❌ |
|Turbo 引擎向量相似度查询| :heavy_check_mark: | ❌ |
|大事务binlog独立落盘优化| :heavy_check_mark: | ❌ |
|并行复制回放优化| :heavy_check_mark: | ❌ |
|执行计划变更异常捕获| :heavy_check_mark: | ❌ |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入优化 | :heavy_check_mark: | ❌ |
|并行 LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB 事务 ReadView 无锁优化| :heavy_check_mark: | ❌ |
|InnoDB 事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB Page压缩支持Zstd| :heavy_check_mark: | ❌ | 
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
| **3. 面向开发者提升改进** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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
|MGR 提升-大事务压缩优化| :heavy_check_mark: | ❌ |
|MGR 提升-查看复制延迟秒数| :heavy_check_mark: | ❌ |
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
|SHOW ENGINE INNODB STATUS 增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log 信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计| :heavy_check_mark: | 仅企业版 |
|数据脱敏| :heavy_check_mark: | ❌ |
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
| **6. 运维便利性提升** | GreatSQL 8.4.4-5 | MySQL 8.4.4 |
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

GreatSQL 8.4.4-5 基于 Percona Server for MySQL 8.4.4-4 版本，它在 MySQL 8.4.4 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.4/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等 MySQL 企业版才有的特性，以及 performance_schema 提升、information_schema 提升、性能和可扩展性提升、用户统计增强、PROCESSLIST 增强、Slow Log 增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.4
- [Changes in GreatSQL 8.4.4-5 (2026-06-30)](changes-greatsql-8445.md)
- [Changes in GreatSQL 8.4.4-4 (2025-10-15)](changes-greatsql-8444.md)

### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-27 (2025-3-10)](changes-greatsql-8-0-32-27.md)
- [Changes in GreatSQL 8.0.32-26 (2024-8-5)](changes-greatsql-8-0-32-26-20240805.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)


**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
