# 已知问题

- 在 GreatSQL 5.7.36-39 版本中，不支持 InnoDB 并行查询特性。
- 在 GreatSQL 8.0.32-25 以前的版本中，InnoDB 并行查询特性不支持 TPC-H 中的 Q21。
- 在 GreatSQL 8.0.* 版本中，InnoDB 并行查询特性不支持子查询。
- 在 GreatSQL 8.0.32-25 以前的版本中，不支持 Rapid 引擎。
- 从 GreatSQL 8.0.32-26 开始，不再推荐使用 InnoDB 并行查询特性（同时会删除用户手册中的入口链接）。
- Rapid引擎不支持表分区、外键。
- 在 GreatSQL 8.0.32-27 版本中的Rapid引擎表，开启增量数据同步任务后，当其InnoDB基本表中有个事务先删除后插入相同主键记录时，会出现报错。例如

```sql
-- 构造一个先删除后插入的事务
BEGIN;
DELETE FROM t1 WHERE ID=1024;
INSERT INTO t1 VALUES(1024, 1024);
```

这个事务在应用到Rapid引擎表时会出现报错，终止增量数据同步任务，报错信息类似下面这样

```sql
greatsql> SELECT * FROM information_schema.SECONDARY_ENGINE_INCREMENT_LOAD_TASK\G
...
           DB_NAME: test
        TABLE_NAME: t1
...
              INFO: {"exception_type":"Constraint","exception_message":"Duplicate key \"id: 1024\" violates primary key constraint. If this is an unexpected constraint violation please double check with the known index limitations section in our documentation (https://duckdb.org/docs/sql/indexes)."}
```

当出现这种问题时，可以通过重新执行全量导入数据后，再次启动增量导入任务，例如

```sql
-- 先从Rapid引擎中删除全量数据
greatsql> ALTER TABLE t1 SECONDARY_UNLOAD;

-- 执行全量导入
greatsql> ALTER TABLE t1 SECONDARY_LOAD;

-- 再次启动增量导入任务，函数的第三个参数可以指定相应的事务GTID值
greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('test', 't1');
```

该问题预计在下个版本中会解决此问题。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
