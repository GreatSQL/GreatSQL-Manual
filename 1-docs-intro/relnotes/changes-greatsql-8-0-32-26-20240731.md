# Changes in GreatSQL 8.0.32-26 (2024-07-31)

## 版本信息

- 发布时间：2024年07月31日

- 版本号：8.0.32-26, Revision xxxxxxxxxxx

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)

- 用户手册：[GreatSQL 8.0.32-26 User Manual](https://greatsql.cn/docs/8032-26/)

##  特性增强

GreatSQL 8.0.32-26 版本在 **高可用**、**高性能**、**高兼容**、**高安全** 等多方面都有增强新特性，包括 支持基于 Redo 的增量备份和恢复，支持 Clone 压缩备份，支持 Clone 增量备份，Clone 自动选择最新数据节点为 Donor 节点，主从复制时支持网络限流，非阻塞式 DDL，无主键表导入提速，更多 Oracle 兼容用法，可记录最后登入时间，支持基于规则的数据脱敏功能等多个新特性。

### 高可用
- 支持 采用 Clone 进行物理全备，并基于 Redo 的增量备份恢复（类似 Xtrabackup 的做法）。基于此特性，可以满足在线全量热备和增备，并可恢复到任意时间点。此外，Clone 备份还支持加密、压缩、限流等功能。详见：[Clone 备份]()。 http://zbox.greatdb.com/zentao/story-view-3293.html
- 在 MGR 架构中，添加新成员节点当选择 Clone 复制全量数据时，支持自动选择从最新事务数据的成员节点复制数据，可有效提升 Clone 速度，提高 MGR 的服务可靠性。详见：[]()。 http://zbox.greatdb.com/zentao/story-view-1736.html
- 当 MGR 各成员节点设置 [地理标签](../../5-enhance/5-2-ha-mgr-zoneid.md) 时，其中的 [仲裁节点](../../5-enhance/5-2-ha-mgr-arbitrator.md) 无需像其他节点那样也要设置地理标签ID。详见：[地理标签](../../5-enhance/5-2-ha-mgr-zoneid.md)。 http://zbox.greatdb.com/zentao/story-view-4305-0-87.html
- 【缺测试报告】优化了在 [快速单主模式](../../5-enhance/5-2-ha-mgr-fast-mode.md) 下 relay log 应用逻辑，提升 MGR 整体性能；并优化了当 relay log 存在堆积时的 applier 线程的内存消耗异常情况。 http://zbox.greatdb.com/zentao/story-view-4353-0-87.html

更多信息详见文档：[高可用](../../5-enhance/5-2-ha.md)。

### 高性能

- 支持非阻塞式 DDL 操作。当执行 DDL 操作的表上有大事务或大查询未结束时，会导致 DDL 请求长时间等待 MDL 锁。详见：[非阻塞式 DDL](../../5-enhance/5-1-highperf-nonblocking_ddl.md)。
- 【缺测试报告】NUMA 亲和性优化。通过 NUMA 亲和性调度优化，将前端用户线程和后台线程绑定到固定 NUMA 节点上以提升线程处理性能。详见：[NUMA 亲和性优化](../../5-enhance/5-1-highperf-numa-affinity.md)。
- 【缺文档，及测试报告】无显式主键表并行导入性能优化。对无显式主键表并行导入数据时，受限于实例级 `DB_ROW_ID` 锁互斥的影响，随着并发数的增加，性能明显下降。新增选项 `innodb_optimize_no_pk_parallel_load` 以应对这种业务场景。详见：[]()。 http://zbox.greatdb.com/zentao/story-view-4330-0-87.html http://gitlab.greatdb.com/greatdb/percona-server/-/commit/ea2f8454a63bc053c4370d6465d8aa15b1656000
====from 高月====
TC10363:是对这个功能新增参数的测试

单机:
TC31097:关闭GIPK，验证开启innodb_optimize_no_pk_parallel_load时load data执行时间较关闭innodb_optimize_no_pk_parallel_load load data执行数据短
测试数据:normal表load 100000000数据量的数据,提升5倍
开启innodb_optimize_no_pk_parallel_load,load时间为190.87297775s
关闭innodb_optimize_no_pk_parallel_load,load时间为966.15685475s

TC31098:验证基于8.0.25版本升级到604以上版本时，开启innodb_optimize_no_pk_parallel_load时load data执行时间较关闭innodb_optimize_no_pk_parallel_load load data执行时间有提升 (测的是GreatDB-5.1.9-GA-1升级到610beta1)
测试数据:normal表load 100000000数据量的数据,提升4.8倍
开启innodb_optimize_no_pk_parallel_load,load时间为192.728711s
关闭innodb_optimize_no_pk_parallel_load,load时间为930.01837375s

功能主要是针对单机做的，集群也合并这部分代码了，不慢就可以算通过
集群：
TC31136:关闭GIPK，验证开启innodb_optimize_no_pk_parallel_load时load data执行时间较关闭innodb_optimize_no_pk_parallel_load load data执行数据短
测试数据:normal表load 100000000数据量的数据
开启innodb_optimize_no_pk_parallel_load,load时间为549.25322475s
关闭innodb_optimize_no_pk_parallel_load,load时间为555.0122575s

TC31137:验证基于8.0.25版本升级到604以上版本时，开启innodb_optimize_no_pk_parallel_load时load data执行时间较关闭innodb_optimize_no_pk_parallel_load load data执行时间有提升
开启innodb_optimize_no_pk_parallel_load,load时间为558.13615475s
关闭innodb_optimize_no_pk_parallel_load,load时间为564.4806495s

TC31138:验证开启innodb_optimize_no_pk_parallel_load时load data执行时间随着并发数量（测试并发数gdb_parallel_load_workers=1/8/16/24）提升，性能不会下降
测试数据:normal表load 100000000数据量的数据
gdb_parallel_load_workers=1,load时间为1921.15475675s
gdb_parallel_load_workers=8,load时间为722.1722675s
gdb_parallel_load_workers=16,load时间为615.48078875s
gdb_parallel_load_workers=24,load时间为570.91603325s
=================



更多信息详见文档：[高性能](../../5-enhance/5-1-highperf.md)。

### 高兼容
- 在创建触发器时，新增 CREATE OR REPLACE 语法支持。详见：[]()。
- 支持在存储函数中使用 DECLARE BEGIN 语法。详见：[]()。
- 支持 CONTINUE 语法。详见：[]()。
- 在 FOR var1 .. var2 LOOP 用法中新增支持符号和参数相连。详见：[]()。

更多信息详见文档：[高兼容](../../5-enhance/5-3-easyuse.md)。

### 高安全
- 新增支持记录指定用户的最后一次登入时间，便于管理员查询，进一步提升数据库安全性。详见：[最后登录信息](../../5-enhance/5-4-security-last-login.md)。
- 新增支持基于规则的数据脱敏功能。详见：[数据脱敏](../../5-enhance/5-4-security-data-masking.md)。

更多信息详见文档：[高安全](../../5-enhance/5-4-security.md)。

### 其他
无。

## 缺陷修复
- 修复了在部分 ARM 架构环境中无法使用并行复制的问题，详见：[MySQL Bug 110752](https://bugs.mysql.com/bug.php?id=110752)。 http://zbox.greatdb.com/zentao/story-view-4181-0-87.html
- 修复了登录信息和审计日志入表时未处理 binlog 可能导致主从异常的问题。 http://zbox.greatdb.com/zentao/task-view-18847.html
- 修复了数个因为 SQL 注入可能导致数据库实例发生 crash 风险的问题。 http://zbox.greatdb.com/zentao/story-view-4418-0-87.html
- 修复了 Oracle 模式下 NULL 值唯一约束问题。详见：[]()。

## 注意事项

## GreatSQL VS MySQL

| **1.主要特性** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| 开源 |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID完整性| :heavy_check_mark: | :heavy_check_mark: |
|MVCC特性| :heavy_check_mark:     | :heavy_check_mark: |
|支持行锁| :heavy_check_mark: | :heavy_check_mark: |
|Crash自动修复| :heavy_check_mark: | :heavy_check_mark: |
|表分区(Partitioning)| :heavy_check_mark: | :heavy_check_mark: |
|视图(Views)| :heavy_check_mark: | :heavy_check_mark: |
|子查询(Subqueries)| :heavy_check_mark: | :heavy_check_mark: |
|触发器(Triggers)| :heavy_check_mark: | :heavy_check_mark: |
|存储程序(Stored Programs)| :heavy_check_mark: | :heavy_check_mark: |
|外键(Foreign Keys)| :heavy_check_mark: | :heavy_check_mark: |
|窗口函数(Window Functions)| :heavy_check_mark: | :heavy_check_mark: |
|通用表表达式CTE| :heavy_check_mark: | :heavy_check_mark: |
|地理信息(GIS)| :heavy_check_mark: | :heavy_check_mark: |
|基于GTID的复制| :heavy_check_mark: | :heavy_check_mark: |
|组复制(MGR)| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks引擎| :heavy_check_mark: | |
| **2. 性能提升扩展** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|AP引擎| :heavy_check_mark: | 仅云上HeatWave |
|InnODB并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB事务ReadView无锁优化| :heavy_check_mark: | ❌ |
|InnoDB事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB资源组| :heavy_check_mark: | :heavy_check_mark: |
|自定义InnoDB页大小| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes拆分优化| :heavy_check_mark: | ❌ |
|MEMORY引擎优化| :heavy_check_mark: | ❌ |
|InnoDB Flushing优化| :heavy_check_mark: | ❌ |
|并行Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB快速索引创建优化| :heavy_check_mark: | ❌ |
|VARCHAR/BLOB/JSON类型存储单列压缩| :heavy_check_mark: | ❌ |
|数据字典中存储单列压缩信息| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB全文搜索改进| :heavy_check_mark: | ❌ |
|更多Hash/Digest函数| :heavy_check_mark: | ❌ |
|Oracle兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle兼容-函数| :heavy_check_mark: | ❌ |
|Oracle兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|MGR提升-地理标签| :heavy_check_mark: | ❌ |
|MGR提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR提升-全新流控算法| :heavy_check_mark: | ❌ |
|information_schema表数量|95|65|
|全局性能和状态指标|853|434|
|优化器直方图(Histograms)| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table性能指标| :heavy_check_mark: | ❌ |
|Per-Index性能指标| :heavy_check_mark: | ❌ |
|Per-User性能指标| :heavy_check_mark: | ❌ |
|Per-Client性能指标| :heavy_check_mark: | ❌ |
|Per-Thread性能指标| :heavy_check_mark: | ❌ |
|全局查询相应耗时统计| :heavy_check_mark: | ❌ |
|SHOW INNODB ENGINE STATUS增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计日志入库| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2密码Hashing| :heavy_check_mark: | :heavy_check_mark: |
|密码轮换策略| :heavy_check_mark: | :heavy_check_mark: |
|PAM认证插件| :heavy_check_mark: | 仅企业版 |
|审计插件| :heavy_check_mark: | 仅企业版 |
|Keyring存储在文件中| :heavy_check_mark: | :heavy_check_mark: |
|Keyring存储在Hashicorp Vault中| :heavy_check_mark: | 仅企业版 |
|InnoDB数据加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB日志加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB各种表空间文件加密| :heavy_check_mark: | :heavy_check_mark: |
|二进制日志加密| :heavy_check_mark: | ❌ |
|临时文件加密| :heavy_check_mark: | ❌ |
|强制加密| :heavy_check_mark: | ❌ |
| **6. 运维便利性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|DDL原子性| :heavy_check_mark: | :heavy_check_mark: |
|数据字典存储InnoDB表| :heavy_check_mark: | :heavy_check_mark: |
|快速DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|不可见索引| :heavy_check_mark: | :heavy_check_mark: |
|线程池(Threadpool)| :heavy_check_mark: | 仅企业版 |
|备份锁| :heavy_check_mark: | ❌ |
|SHOW GRANTS扩展| :heavy_check_mark: | ❌ |
|表损坏动作扩展| :heavy_check_mark: | ❌ |
|杀掉不活跃事务| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT扩展| :heavy_check_mark: | ❌ |

此外，GreatSQL 8.0.32-26基于Percona Server for MySQL 8.0.32版本，它在MySQL 8.0.32基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等MySQL企业版才有的特性，以及performance_schema提升、information_schema提升、性能和可扩展性提升、用户统计增强、PROCESSLIST增强、Slow log增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-26 (2024-07-31)](changes-greatsql-8.0.32-26-20240731.md)
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8.0.32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
