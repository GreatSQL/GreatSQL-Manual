# Storage Engine Selection
---

This section describes how to choose the appropriate storage engine for different business scenarios in GreatSQL.

## Common Storage Engines

GreatSQL supports common storage engines such as InnoDB, MyISAM, and ARCHIVE. You can run the following command to view all supported engines:

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

Among these, the Rapid Engine has only been supported since GreatSQL 8.0.32-25.

In addition, because MGR optimization has been applied in GreatSQL, some of the code conflicts with the RocksDB engine. Therefore, when MGR is enabled by default, the RocksDB engine must be disabled. In scenarios where the RocksDB engine is required but MGR is not, you can refer to the document [Compiling GreatSQL with the RocksDB Engine](https://mp.weixin.qq.com/s/aOP9oRhlgFlnz5eEB9clsA) to compile GreatSQL yourself to support the RocksDB engine.

## Storage Engine Selection

In general, the InnoDB storage engine is sufficient for most business scenarios. For special business scenarios or characteristics, you need to choose different storage engines for better adaptation.

- OLTP workloads

There is no doubt that InnoDB is the most suitable engine for OLTP workloads. When designing schemas during application development, follow the optimization principles mentioned in **[Schema Design Optimization](./12-7-1-sql-optimize-schema-design.md)**; in addition, when developing SQL, also follow the optimization principles mentioned in **[SQL Development Optimization](./12-7-2-sql-optimize-sql-dev.md)**. Do these fundamentals well, and get the basic optimization work in place first, to avoid many common performance bottleneck risks.

- OLAP scenarios

In OLAP scenarios, the Rapid Engine is recommended. This engine was introduced in [GreatSQL 8.0.32-25](../1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228.md#feature-enhancements), and it performs extremely well in TPC-H tests. For the test report, see: [GreatSQL TPC-H Performance Benchmark Report](../10-optimize/3-3-benchmark-greatsql-tpch-report.md).

The Rapid Engine is suitable for business scenarios with many reads and very few writes, especially non-real-time business analysis scenarios. For more information about the Rapid Engine, see: [Rapid Engine](../5-enhance/5-1-highperf-rapid-engine.md).

- HTAP scenarios

If the business system has both high-concurrency DML requests and needs real-time business analysis, this is an HTAP scenario. You can adopt a source-replica replication or MGR architecture, responding to read/write requests on the primary node and read-only or analysis requests on the secondary nodes.

Starting from GreatSQL 8.0.32-27, the dplan feature will be released soon, which is particularly suitable for HTAP scenarios. Stay tuned.

- Other scenarios

If you need to import large volumes of data on a schedule, you can use the **[Parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)** feature to speed up data import.

You can also consider using MyISAM storage engine tables as a transition, that is, run `LOAD DATA` to import data into a MyISAM table, and then run `INSERT ... SELECT` to load the data into an InnoDB engine table.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)