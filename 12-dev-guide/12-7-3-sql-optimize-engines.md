# 存储引擎选择
---

本节介绍在 GreatSQL 中如何根据不同业务场景选择相应的存储引擎。

## 常见存储引擎

在 GreatSQL 中，支持常见的 InnoDB、MyISAM、ARCHIVE 等存储引擎，可执行下面的命令查看所有支持的所有引擎：

```sql
greatsql> SHOW ENGINES;
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                    | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| ndbcluster         | NO      | Clustered, fault-tolerant tables                                           | NULL         | NULL | NULL       |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears)             | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                         | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, and foreign keys | YES          | YES  | YES        |
| FEDERATED          | NO      | Federated MySQL storage engine                                             | NULL         | NULL | NULL       |
| dlk                | YES     | datalink storage engine                                                    | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                  | NO           | NO   | NO         |
| Rapid              | YES     | Rapid storage engine                                                       | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                      | NO           | NO   | NO         |
| ndbinfo            | NO      | MySQL Cluster system information storage engine                            | NULL         | NULL | NULL       |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                                      | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                                         | NO           | NO   | NO         |
| ARCHIVE            | YES     | Archive storage engine                                                     | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
```

这其中，Rapid 引擎是在 GreatSQL 8.0.32-25 版本以后才支持。

此外，由于在 GreatSQL 中进行了 MGR 优化，部分代码和 RocksDB 引擎有冲突，因此在默认启用 MGR 的时候就得关闭 RocksDB 引擎。在需要 RocksDB 引擎但不需要 MGR 的场景下，可以参考文档 [编译GreatSQL with RocksDB引擎](https://mp.weixin.qq.com/s/aOP9oRhlgFlnz5eEB9clsA) 自行编译以支持RocksDB引擎。

## 存储引擎选择

通常来说，InnoDB 存储引擎足以满足大多数业务场景。针对特殊的的业务场景或特点，就需要选择使用不同的存储引擎以更好地适配。

- OLTP 业务

毫无疑问，在 OLTP 类业务场景中选择 InnoDB 引擎最合适。在应用业务开发中涉及到 Schema 设计时，注意遵循文档 **[Schema 设计优化](./12-7-1-sql-optimize-schema-design.md)** 中提到的优化原则；此外，在进行 SQL 开发时，也要注意遵循文档 **[SQL 开发优化](./12-7-2-sql-optimize-sql-dev.md)** 中提到的优化原则。先做好这些基本功，把基础的优化工作先做到位，就可以规避很多常见的性能瓶颈风险点。

- OLAP 场景

在 OLAP 场景中，推荐选用 Rapid 引擎，该引擎在 [GreatSQL 8.0.32-25 版本](../1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228.md#特性增强)中开始引入，在 TPC-H 测试中性能表现非常优异，测试报告详见：[GreatSQL TPC-H 性能测试报告](../10-optimize/3-3-benchmark-greatsql-tpch-report.md)。

Rapid 引擎适用于以读多写很少的业务场景，尤其适用于非实时业务分析的场景。更多关于 Rapid 引擎的内容详见：[Rapid 引擎](../5-enhance/5-1-highperf-rapid-engine.md)。

- HTAP 场景

如果业务系统中既有高并发 DML 请求，又需要进行实时业务分析，这种就是 HTAP 场景了，可以采用主从复制或 MGR 架构，在主节点响应读写请求，在从节点响应只读和分析请求。

从 GreatSQL 8.0.32-27 版本开始，新增 **Turbo** 高性能并行查询执行引擎，特别适合用在 HTAP 场景，详见文档：[高性能Turbo引擎](../5-enhance/5-1-highperf-turbo-engine.md)。

- 其他场景

如果需要定时大批量导入数据，可以使用 **[并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)** 特性，加入数据导入效率。

也可以考虑利用 MyISAM 存储引擎表作为过渡，即执行 `LOAD DATA` 把数据导入到 MyISAM 表，而后再执行 `INSERT ... SELECT` 将数据加载到 InnoDB 引擎表中。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
