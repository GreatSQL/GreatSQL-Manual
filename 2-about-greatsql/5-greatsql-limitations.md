# 使用限制
---

## 标识符长度

| 标识符类型 | 最大长度（字符） |
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

## 数据库对象个数限制

| 对象类型|最大个数 |
| ---------- | ---------------- |
| 数据库个数 | 不限 |
| 数据表个数 | 不限 |
| 视图个数 | 不限 |
| 连接数 | 不限 |

## 单表限制

| 类型|最大限制 |
| ----- | ------ |
| 字段个数 | 1000 |
| 索引个数 | 60 |
| 索引长度 | 3072字节 |
| 组合索引包含列数 | 16 |

## 分区表限制

* 分区表达式**不支持**：

  * 存储过程、函数、用户变量：这些元素的值在运行时是变化的，无法作为静态的分区条件。

* 分区表达式计算结果需要是整数类型(KEY分区除外)。

* 最大分区数：8192。

* 唯一约束：必须包含分区表达式中的所有的列。

* 不支持全文索引。


在使用 GreatSQL MGR 的时候，有以下几条注意事项：

- 最多只支持9个节点。
- 每个节点都要启用 Binlog，且都要启用转存 Binlog，即设置 `log_replica_updates=1`。
- 要求 Binlog format务必是 ROW 模式，即 `binlog_format=ROW`。
- 每个节点的 `server_id` 及 `server_uuid` 不能相同。
- 在 8.0.20 之前，要求 `binlog_checksum=NONE`，但是从 8.0.20 后，可以设置 `binlog_checksum=CRC32`。
- 要求启用 GTID，即设置 `gtid_mode=ON` 和 `enforce_gtid_consistency = ON`。
- 要求 `master_info_repository=TABLE` 及 `relay_log_info_repository=TABLE`，不过从 8.0.23 开始，这两个选项已经默认设置TABLE，因此无需再单独设置。
- 所有节点上的表名大小写参数 `lower_case_table_names` 设置要求一致。
- 所有表必须是 InnoDB 引擎。可以创建非 InnoDB 引擎表，但无法写入数据，在利用 Clone 构建新节点时也会报错。
- 所有表最好都要有主键（建议全局设置选项 `sql_require_primary_key=ON`）。同上，能创建没有主键的表，但无法写入数据，在利用 Clone 构建新节点时也会报错（例外情况：在创建表之前，设置选项 `sql_generate_invisible_primary_key=ON`，这样InnoDB就会自动为该表创建一个不可见主键，详见：[Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html)）。
- 尽量不要使用大事务；默认地，事务超过 *150MB* 会报错，最大可支持 *2GB* 的事务。
- 如果是从旧版本进行升级，则不能选择 *MINIMAL* 模式升级，建议选择 *AUTO* 模式，即 `upgrade=AUTO`。
- 由于 MGR 的事务认证线程不支持 GAP Lock，因此建议把所有节点的事务隔离级别都改成 *READ COMMITTED*。基于相同的原因，MGR集群中也不要使用 table lock 及 name lock（即 `GET_LOCK()` 函数 ）。
- 在多主（multi-primary）模式下不支持串行（*SERIALIZABLE*）隔离级别。
- 不支持在不同的 MGR 节点上，对同一个表分别执行 DML 和 DDL，可能会造成数据丢失或节点报错退出。
- 在多主（multi-primary）模式下不支持多层级联外键表。另外，为了避免因为使用外键造成MGR报错，建议设置 `group_replication_enforce_update_everywhere_checks=ON`。
- 在多主（multi-primary）模式下，如果多个节点都执行 `SELECT ... FOR UPDATE` 后提交事务会造成死锁，有必要的话，被判定为死锁的那个事务可以再重试提交。
- 不支持复制过滤（Replication Filters）设置。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
