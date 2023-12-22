# Changes in GreatSQL 8.0.32-25 (2023-12-28)

## 版本信息

- 发布时间：2023年12月28日

- 版本号：8.0.32-25, Revision 0ce93c62130

- 下载链接：[RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-24)、[TAR包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-24)、[源码包](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-24)

- 用户手册：[GreatSQL 8.0.32-25 User Manual](https://greatsql.cn/docs/803225)

##  特性增强

GreatSQL 8.0.32-25版本中首次推出支持高性能的内存查询加速AP引擎，可将GreatSQL的数据分析性能提升几个数量级；大幅增加Oracle兼容特性，支持更多数据类型、SQL语法、函数及存储过程等；支持异步删除InnoDB大表及NUMA调度优化；支持在MGR主节点切换VIP时主动断开当前连接，缩短应用端不可用时长。

### 高可用
- 支持在MGR单主（Single Primary）模式下，读写节点绑定VIP后，当主节点切换时会主动关闭当前活跃连接，缩短应用端不可用时长。更详细内容参考：[MGR切主后断开应用连接](../../5-enhance/5-2-ha-mgr-kill-conn-after-switch.md)。
- 在跨机房容灾场景，同时开启多源复制和主主复制时，可能出现数据回路问题。新增 replicate_server_mode 选项用于控制只应用多源复制管道内临近主节点上产生的binlog，不会应用其他的非临近节点产生的binlog，避免出现数据回路问题。多通道主主复制能减少机房容灾演练和切换时的主从配置变更，该特性由中移智家DBA团队（徐良）贡献代码。更多详细内容参考：[issue#I8E8QB](https://gitee.com/GreatSQL/GreatSQL/issues/I8E8QB)。

### 高性能
- 支持类似MySQL HeatWave的大规模并行、高性能的内存查询加速AP引擎，可将GreatSQL的数据分析性能提升几个数量级。在32C64G测试机环境下，TPC-H 100G测试中22条SQL总耗时仅需不到80秒。更详细内容参考：[Rapid引擎]()。

- 支持异步删除InnoDB大表，删除10G以上大表时对系统负载几乎没影响，有效提高InnoDB引擎运行时性能的稳定性。更详细内容参考：[异步删除InnoDB大表](../../5-enhance/5-1-highperf-async-purge-big-table.md)。

- 支持NUMA调度优化，通过将线程分类以及绑定CPU核心等方式，减少跨NUMA的访问，提升GreatSQL运行时性能的稳定性。更详细内容参考：[NUMA调度优化](../../5-enhance/5-1-highperf-numa-affinity.md)。

- 提升InnoDB PQ能力，支持TPC-H Q21查询优化能力。

### 高兼容
- 从GreatSQL 8.0.32-25版本开始，在Oracle兼容方面有了巨大提升，除了OCI、DBlink、Packages之外，支持大多数常用的SQL语法、数据类型、函数、存储过程、触发器、视图等功能。支持CLOB、NUMA、VARCHAR2、PLS_INTEGER等数据类型，支持ADD_MONTHS、CHR、DUMP等函数，支持ANY、ALL、Hierarchical Query、FULL JOIN等SQL语法，支持存储过程、触发器、视图等兼容性。


## 缺陷修复

- 修复当在多子网环境中的MGR读写节点绑定VIP后需手动刷新ARP表的问题 [issue#I7F3PB](https://gitee.com/GreatSQL/GreatSQL/issues/I7F3PB)。
- 修复当接收端实例设置 `innodb_flush_method = O_DIRECT` 时，执行加密CLONE备份时性能特别差的问题。
- 修复启用InnoDB PQ特性后，TPC-H Q3、Q5查询性能反倒下降的问题。
- 修复Oracle兼容函数SUBSTR及SUBSTRB在对传入参数自动做四舍五入与Oracle处理不一致的问题。
- 修复并行LOAD DATA无法正确分割复杂文本，同时会有长事务不提交导致UNDO持续增长的问题。
- 修复在FOR LOOP循环中用到ROWNUM时，在每轮循环中，数据查询结果集中的ROWNUM不能被重置从0再开始的问题。

## 注意事项

## GreatSQL VS MySQL

| **1.主要特性** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
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
| **2. 性能提升扩展** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
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
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB全文搜索改进| :heavy_check_mark: | ❌ |
|更多Hash/Digest函数| :heavy_check_mark: | ❌ |
|Oracle兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle兼容-函数| :heavy_check_mark: | ❌ |
|Oracle兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
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
| **5.安全性提升** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计日志入库| :heavy_check_mark: | ❌ |
|记录最后一次登录信息| :heavy_check_mark: | ❌ |
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
| **6. 运维便利性提升** | GreatSQL 8.0.32-25 | MySQL 8.0.32 |
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

此外，GreatSQL 8.0.32-25基于Percona Server for MySQL 8.0.32版本，它在MySQL 8.0.32基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等MySQL企业版才有的特性，以及performance_schema提升、information_schema提升、性能和可扩展性提升、用户统计增强、PROCESSLIST增强、Slow log增强等大量改进和提升，这里不一一重复列出。

## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
