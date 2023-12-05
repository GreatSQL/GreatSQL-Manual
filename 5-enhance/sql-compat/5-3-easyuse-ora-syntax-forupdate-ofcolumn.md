# Oracle兼容-语法-SELECT ... FOR UPDATE ... OF COLUMN
---


## 1. 语法

```sql
SET sql_mode = ORACLE;

SELECT ... FOR UPDATE OF column_list [locked_row_action]
```

其中，`locked_row_action` 可选用法有：

- `NOWAIT`。
- `SKIP LOCKED`。
- `WAIT n`。
- 空，什么都不加。

需要先切换到 `ORACLE` 模式下才能支持本语法。

## 2. 定义和用法

`SELECT ... FOR UPDATE OF column_list` 语句的作用是查询数据并加锁。

在GreatSQL中，由于行锁机制和Oracle不同，因此在实际加锁时，是锁定整行数据，无法像Oracle那样只锁定指定的列，不锁定其他列。也就是说，本语法只是兼容Oracle风格用法，实际行锁加锁还和GreatSQL原生行锁机制一样。


有几点注意事项：

1. 在 `ORACLE` 模式下，不再支持 `FOR UPDATE OF table_name` 用法，而需要改成 `FOR UPDATE OF column_list` 用法，其功能和在 `DEFAULT` 模式时一样。

2. 在单表查询时不指定表名，只指定列名是允许的，但在多表查询时必须指定表名。

3. 列名指定错误时会引发报错。

4. 在查询加锁请求中，如果 `WHERE` 条件是索引列，那么当前事务会锁定满足条件数据行，如果不是索引列，那么会锁定所有数据行。


## 3. Oracle兼容说明

本语法和在Oracle中区别有以下几点：

1. 在Oracle中无论 `WHERE` 条件是不是索引列，都只会锁定满足条件的数据行；而在GreatSQL中如果非索引列则会锁定全部数据行，在上面已有阐述。

2. 在GreatSQL中，支持类似 `INSERT [ALL] INTO t1 SELECT a.* FROM t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1=12 FOR UPDATE OF a.c1 NOWAIT;` 请求语句，而Oracle不支持。

3. 都支持存在重复列的情况，例如：`SELECT * FROM t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1=12 FOR UPDATE OF a.c1, a.c1;`。

4. 在Oracle中支持子查询，但在GreatSQL中不支持，类似：`SELECT * FROM (SELECT * FROM t1) t WHERE c1=10 FOR UPDATE OF t;`。


## 4. 示例

创建测试表并初始化数据：
```sql
greatsql> CREATE TABLE t1(c1 INT, c2 CHAR(10));
greatsql> INSERT INTO t1 VALUES (10, 'r10'), (12, 'r12'), (13, 'r13');
greatsql> SELECT * FROM t1;
+------+------+
| c1   | c2   |
+------+------+
|   10 | r10  |
|   12 | r12  |
|   13 | r13  |
+------+------+
3 rows in set (0.00 sec)

greatsql> CREATE TABLE t2 (c1 INT, c2 CHAR(10));
greatsql> INSERT INTO t2 VALUES (11, 'r21'), (12, 'r22'), (13, 'r23');
greatsql> SELECT * FROM t2;
+------+------+
| c1   | c2   |
+------+------+
|   11 | r21  |
|   12 | r22  |
|   13 | r23  |
+------+------+
3 rows in set (0.00 sec)
```

- 1. `FOR UPDATE OF table.column`指定基本表中的列。

```sql
-- 先切换到ORACLE模式
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT * from t1 a WHERE c1=10 FOR UPDATE OF c1;
+------+------+
| c1   | c2   |
+------+------+
|   10 | r10  |
+------+------+
1 row in set (0.00 sec)

greatsql> SELECT * from t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1 = 12 FOR UPDATE OF a.c1 NOWAIT;
+------+------+------+------+
| c1   | c2   | c1   | c2   |
+------+------+------+------+
|   12 | r12  |   12 | r22  |
+------+------+------+------+
1 row in set (0.00 sec)

greatsql> SELECT * from t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1 = 12 FOR UPDATE OF a.c1,b.c2 NOWAIT;
+------+------+------+------+
| c1   | c2   | c1   | c2   |
+------+------+------+------+
|   12 | r12  |   12 | r22  |
+------+------+------+------+
1 row in set (0.00 sec)
```

- 2. `FOR UPDATE OF view.column` 指定视图中的列。

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE VIEW v1 AS SELECT * from t1;
greatsql> SELECT * FROM v1;
+------+------+
| c1   | c2   |
+------+------+
|   10 | r10  |
|   12 | r12  |
|   13 | r13  |
+------+------+
3 rows in set (0.00 sec)

greatsql> SELECT * from v1 WHERE c1=11 FOR UPDATE OF v1.c1;
+------+------+
| c1   | c2   |
+------+------+
|   10 | r10  |
+------+------+
1 row in set (0.00 sec)
```

- 3. 几个错误用法

```sql
-- 1. ORACLE模式下不支持FOR UPDATE OF table 

greatsql> SET sql_mode = ORACLE;

greatsql> SELECT * from t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1 = 12 FOR UPDATE OF a NOWAIT;
ERROR 1052 (23000): Column 'a' in field list is ambiguous

-- DEFAULT模式下支持
+------+------+------+------+
| c1   | c2   | c1   | c2   |
+------+------+------+------+
|   12 | r12  |   12 | r22  |
+------+------+------+------+
1 row in set (0.00 sec)

-- 2. 指定列不存在
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT * from t1 a WHERE c1=10 FOR UPDATE OF a.c10;
ERROR 1054 (42S22): Unknown column 'greatsql.a.c10' in 'update of clause'

-- 在DEFAULT模式下报错不同
greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT * from t1 a WHERE c1=10 FOR UPDATE OF a.c10;
ERROR 3568 (HY000): Unresolved table name `a`.`c10` in locking clause.
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
