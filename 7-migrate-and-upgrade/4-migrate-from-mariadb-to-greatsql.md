# 从 MariaDB 迁移到 GreatSQL
---

本节介绍如何从 MariaDB 迁移到 GreatSQL 数据库。

## MariaDB 介绍

MariaDB 是一个开源的关系型数据库管理系统（RDBMS），由 MySQL 的创始人 Michael Widenius（也被称为 Monty）创建。MariaDB 与 MySQL 高度兼容，许多现有的 MariaDB 应用可以直接迁移到 GreatSQL 而无需修改代码。

## MariaDB 和 GreatSQL 之间的相同及差异之处

### 相同之处
1. **开源许可**：
   - 都是基于 GPL 许可的开源数据库管理系统。
2. **SQL 标准支持**：
   - 两者都支持标准的 SQL 语言。
3. **存储引擎**：
   - 两者都支持多种存储引擎，如 InnoDB、MyISAM、Memory 等。
4. **复制和集群**：
   - 两者都支持主从复制、主主复制和集群技术。
5. **安全特性**：
   - 两者都支持用户权限管理、SSL 加密等安全特性。
6. **工具和客户端**：
   - 两者都可以使用相同的客户端工具，如 `mysql` 命令行工具、phpMyAdmin 等。

### 差异之处
1. **存储引擎**：
   - **GreatSQL**：默认存储引擎为 InnoDB，且从 8.0 开始，元数据也存储在 InnoDB 引擎中。
   - **MariaDB**：默认存储引擎也是 InnoDB，但还引入了新的存储引擎，如 Aria、SphinxSE、XtraDB（InnoDB 的增强版）、Spider（分布式存储引擎）等，在 MariaDB 中元数据仍然采用 MyISAM 存储引擎，这点和 GreatSQL 区别很大。
2. **新特性**：
   - **MariaDB**：引入了许多新特性，如窗口函数、序列、动态列等，部分 MariaDB 新特性无法兼容 GreatSQL。
   - **GreatSQL**：也在不断更新，引入了类似的新特性，但可能发布时间不同。
3. **版本号**：
   - **MariaDB**：早期版本号基本上和 MySQL/GreatSQL 保持一致，但从 10.x 开始采用独立的版本号规则，无法直接和 MySQL/GreatSQL 对应。
   - **GreatSQL**：GreatSQL 大版本号和 MySQL/Percona 保持一致，小版本号略有区别，详情参考：[用户须知](../1-docs-intro/1-1-notes-to-users.md)。
4. **GTID不兼容**：
   - **MariaDB**：较复杂，它包含多个部分，包括 Domain ID（域标识）、Server ID（服务器标识）和 Sequence Number（序列号），格式为 **GTID=Domain_ID-Server_ID-Sequence_Number**。MariaDB 的 GTID 允许通过 Domain ID 来隔离和管理不同集群中的事务。
   - **GreatSQL**：是单一值，由服务器 UUID 和事务编号组成，格式为 **GTID=UUID:TrxID**。一个服务器的每个事务都会有一个唯一的 GTID。
   - 也就是说 GreatSQL 和 MariaDB 之间不能创建基于 GTID 的主从复制关系。
5. **参数变量**：
   - **MariaDB**：有些参数变量在 GreatSQL 中没有，例如和 Aria 引擎相关的 `aria_pagecache_buffer_size`。
   - **GreatSQL**：从 8.0 开始引入 `innodb_dedicated_server` 等新参数，这些是 MariaDB 中没有的。
6. **插件（Plugin）**：
   - **MariaDB**：提供更多插件，像是 Cassandra、CONNECT 引擎，插件体系更为丰富。
   - **GreatSQL**：部分企业级特性插件，像是 审计增强、脱敏增强、Clone 增量&加密备份、Rapid 引擎等，在 MariaDB 中没有。
7. **具体功能**：
   - **MariaDB**：增强了对 Galera Cluster（在 Percona 中叫做 PXC） 的支持，在多主集群和高可用性场景下表现更好。
   - **GreatSQL**：在 GreatSQL 中采用基于 Paxos 的强同步复制方案，即组复制（也叫 MGR）。InnoDB 引擎在事务处理、崩溃恢复等方面较为优化，并在 MySQL 8.0 中进行了大量性能提升。Clone 插件在 MariaDB 中也没有。

## MariaDB 和 MySQL/GreatSQL 版本对应关系表

| MariaDB 版本 | MySQL 版本   | 备注                                                         |
|--------------|--------------|--------------------------------------------------------------|
| 10.10.x      | 8.0.x        | MariaDB 10.10 与 MySQL/GreatSQL 8.0 相对应，包含了许多新特性和改进。   |
| 10.9.x       | 8.0.x        | MariaDB 10.9 与 MySQL/GreatSQL 8.0 相对应，包含了一些新特性和改进。   |
| 10.8.x       | 8.0.x        | MariaDB 10.8 与 MySQL/GreatSQL 8.0 相对应，包含了一些新特性和改进。   |
| 10.7.x       | 8.0.x        | MariaDB 10.7 与 MySQL/GreatSQL 8.0 相对应，包含了一些新特性和改进。   |
| 10.6.x       | 8.0.x        | MariaDB 10.6 与 MySQL/GreatSQL 8.0 相对应，包含了一些新特性和改进。   |
| 10.5.x       | 8.0.x        | MariaDB 10.5 与 MySQL/GreatSQL 8.0 相对应，包含了一些新特性和改进。   |
| 10.4.x       | 8.0.x        | MariaDB 10.4 与 MySQL/GreatSQL 8.0 相对应，包含了一些新特性和改进。   |
| 10.3.x       | 5.7.x        | MariaDB 10.3 与 MySQL/GreatSQL 5.7 相对应，包含了一些新特性和改进。   |
| 10.2.x       | 5.7.x        | MariaDB 10.2 与 MySQL/GreatSQL 5.7 相对应，包含了一些新特性和改进。   |
| 10.1.x       | 5.6.x        | MariaDB 10.1 与 MySQL 5.6 相对应，包含了一些新特性和改进。   |
| 10.0.x       | 5.6.x        | MariaDB 10.0 与 MySQL 5.6 相对应，包含了一些新特性和改进。   |
| 5.5.x        | 5.5.x        | MariaDB 5.5 与 MySQL 5.5 相对应，包含了一些新特性和改进。   |
| 5.3.x        | 5.1.x        | MariaDB 5.3 与 MySQL 5.1 相对应，包含了一些新特性和改进。   |
| 5.2.x        | 5.1.x        | MariaDB 5.2 与 MySQL 5.1 相对应，包含了一些新特性和改进。   |
| 5.1.x        | 5.1.x        | MariaDB 5.1 与 MySQL 5.1 相对应，包含了一些新特性和改进。   |

### 版本对照详细说明

1. **版本对应**：
   - MariaDB 的每个主要版本通常对应 MySQL/GreatSQL 的一个主要版本。例如，MariaDB 10.4.x 与 MySQL/GreatSQL 8.0.x 相对应。
   - 从 MariaDB 10.3 开始，MariaDB 的版本号不再直接对应 MySQL/GreatSQL 的版本号，而是独立发展，但仍然保持一定的兼容性。

2. **新特性**：
   - **MariaDB 10.10.x**：引入了许多新特性，如窗口函数、序列、动态列等，与 MySQL/GreatSQL 8.0 的新特性相对应。
   - **MariaDB 10.9.x**：继续增强性能和稳定性，引入了一些新的存储引擎和优化。
   - **MariaDB 10.8.x**：引入了更多的性能优化和安全特性。
   - **MariaDB 10.7.x**：增加了对 JSON 字段的支持和优化。
   - **MariaDB 10.6.x**：引入了对分区表的改进和优化。
   - **MariaDB 10.5.x**：增强了 InnoDB 存储引擎的性能。
   - **MariaDB 10.4.x**：引入了对窗口函数的支持。
   - **MariaDB 10.3.x**：与 MySQL/GreatSQL 5.7 相对应，引入了对 JSON 字段的支持。
   - **MariaDB 10.2.x**：与 MySQL/GreatSQL 5.7 相对应，引入了对多源复制的支持。
   - **MariaDB 10.1.x**：与 MySQL 5.6 相对应，引入了对分区表的改进。
   - **MariaDB 10.0.x**：与 MySQL 5.6 相对应，引入了对 InnoDB 插件的支持。
   - **MariaDB 5.5.x**：与 MySQL 5.5 相对应，引入了对 InnoDB 插件的支持。
   - **MariaDB 5.3.x**：与 MySQL 5.1 相对应，引入了一些新的存储引擎。
   - **MariaDB 5.2.x**：与 MySQL 5.1 相对应，引入了一些新的存储引擎。
   - **MariaDB 5.1.x**：与 MySQL 5.1 相对应，引入了一些新的存储引擎。

## 迁移前准备

首先下载GreatSQL 8.4版本安装包，推荐选择最新的[GreatSQL 8.4.4-4版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-4)，至于选择RPM还是二进制包看具体情况及个人喜好。

本文选用二进制包方式安装。

由于 MariaDB 和 GreatSQL 的差异较大，因此推荐采用 **mysqldump/mydumper 等逻辑全量备份导出** + **逻辑备份导入** 方式完成迁移工作。

详细操作方法可以参考文档：[迁移过程](./2-migrate-from-mysql-togreatsql.md#迁移过程) 和 [mysqldump备份恢复](../6-oper-guide/4-1-mysqldump.md) 中介绍的 **逻辑备份+导入** 方法，完成迁移工作。

如果是迁移单表，则可以考虑采用 [OUTFILE](../6-oper-guide/4-2-outfile.md) 方式完成逻辑备份，再利用 [并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md) 方式导入数据。

## 总结

鉴于 MariaDB 的发展模式及技术生态等多方面因素，可以考虑迁移到 GreatSQL，体验更多 GreatSQL 的优势特性。

**参考文档**

- [Upgrade from 8.0 to 8.4 overview](https://docs.percona.com/percona-server/8.4/upgrade.html)
- [Changes in MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/mysql-nutshell.html)
- [Upgrade Before You Begin](https://dev.mysql.com/doc/refman/8.4/en/upgrade-before-you-begin.html)
- [What the MySQL Upgrade Process Upgrades](https://dev.mysql.com/doc/refman/8.4/en/upgrading-what-is-upgraded.html)
- [MySQL 5.7 MGR平滑升级到GreatSQL 5.7](https://mp.weixin.qq.com/s/u0UAijfM8jHH948ml1PREg)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
