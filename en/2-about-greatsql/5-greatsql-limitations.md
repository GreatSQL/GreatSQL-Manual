# Usage Limitations
---

## Identifier Length

| Identifier Type | Maximum Length (Characters) |
| ---------- | ---------------- |
| Database | 64 |
| Table | 64 |
| Column | 64 |
| Index | 64 |
| Constraint | 64 |
| Stored Program | 64 |
| View | 64 |
| Alias | 256  |
| Compound Statement Label| 16 |
| User Defined Variable|64 |

## Limits on the Number of Database Objects

| Object Type|Maximum Number |
| ---------- | ---------------- |
| Number of databases | Unlimited |
| Number of tables | Unlimited |
| Number of views | Unlimited |
| Number of connections | Unlimited |

## Single Table Limits

| Type|Maximum Limit |
| ----- | ------ |
| Number of columns | 1000 |
| Number of indexes | 60 |
| Index length | 3072 bytes |
| Number of columns in a composite index | 16 |

## Partitioned Table Limits

* The following are **not supported** in partition expressions:

  * Stored procedures, functions, user variables: the values of these elements change at runtime and cannot serve as static partition conditions.

* The result of the partition expression must be an integer type (except for KEY partitioning).

* Maximum number of partitions: 8192.

* Unique constraints: must include all the columns in the partition expression.

* Full-text indexes are not supported.

## MGR Usage Limitations

When using GreatSQL MGR, there are several notes as follows:

- A maximum of 9 nodes is supported.
- Each node must enable Binlog, and must enable log relaying, i.e., set `log_replica_updates=ON`.
- The Binlog format must be ROW mode, i.e., `binlog_format=ROW`.
- The `server_id` and `server_uuid` of each node cannot be the same.
- Before 8.0.20, `binlog_checksum=NONE` was required, but starting from 8.0.20, `binlog_checksum=CRC32` can be set.
- GTID must be enabled, i.e., set `gtid_mode=ON` and `enforce_gtid_consistency=ON`.
- `master_info_repository=TABLE` and `relay_log_info_repository=TABLE` are required. However, starting from 8.0.23, these two options are already set to TABLE by default, so there is no need to set them separately.
- The table name case-sensitivity parameter `lower_case_table_names` must be set consistently on all nodes.
- All tables must use the InnoDB engine. Non-InnoDB engine tables can be created, but data cannot be written to them, and errors will be reported when using Clone to build new nodes.
- All tables should preferably have a primary key (it is recommended to set the option `sql_require_primary_key=ON` globally). Similarly, tables without a primary key can be created, but data cannot be written to them, and errors will be reported when using Clone to build new nodes (exception: before creating the table, set the option `sql_generate_invisible_primary_key=ON`, so that InnoDB automatically creates an invisible primary key for the table, see: [Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html)).
- Try to avoid large transactions; by default, transactions exceeding *150MB* report an error, and the maximum supported transaction size is *2GB*.
- If upgrading from an old version, the *MINIMAL* mode upgrade cannot be selected; it is recommended to select *AUTO* mode, i.e., `upgrade=AUTO`.
- Since the MGR transaction certification thread does not support GAP Lock, it is recommended to change the transaction isolation level of all nodes to *READ COMMITTED*. For the same reason, table locks and name locks (i.e., the `GET_LOCK()` function) should not be used in MGR clusters.
- The *SERIALIZABLE* isolation level is not supported in multi-primary mode.
- Executing DML and DDL on the same table on different MGR nodes is not supported; it may cause data loss or node errors and exits.
- Multi-level cascading foreign key tables are not supported in multi-primary mode. In addition, to avoid MGR errors caused by foreign keys, it is recommended to set `group_replication_enforce_update_everywhere_checks=ON`.
- In multi-primary mode, if multiple nodes execute `SELECT ... FOR UPDATE` and then commit transactions, deadlocks can occur. If necessary, the transaction determined to be deadlocked can retry the commit.
- Replication Filters settings are not supported.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
