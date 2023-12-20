# Oracle兼容-语法-索引中NULL视为相同值
---


## 1. 语法

```sql
SET sql_mode = ORACLE;
```

## 2. 定义和用法

在GreatSQL原生 `DEFAULT` 模式下，唯一索引(`UNIQUE KEY`)中的 `NULL` 被视为不同值。

当切换到 `ORACLE` 模式下之后，唯一索引中的 `NULL` 就会被视为相同值了。 

此外，在 `ORACLE` 模式下，唯一索引可能会报告 `NULL` 值重复冲突。

## 3. Oracle兼容说明

1. 切换到 `ORACLE` 模式下之后，新创建的唯一索引会对 `NULL` 视为相同值处理，而在切换模式前已经存在的唯一索引则保持不变。

2. 仅InnoDB引擎支持该特性。


## 4. 示例

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TABLE t1 (i1 INT, i2 INT);

greatsql> CREATE UNIQUE INDEX t1_i1_i2 ON t1(i1, i2);

-- 再次插入相同记录会报错
greatsql> INSERT INTO t1 VALUES (1, null);
greatsql> INSERT INTO t1 VALUES (1, null);
ERROR 1062 (23000): Duplicate entry '1-NULL' for key 't1.t1_i1_i2'

greatsql> INSERT INTO t1 VALUES (2, null);
greatsql> INSERT INTO t1 VALUES (2, null);
ERROR 1062 (23000): Duplicate entry '2-NULL' for key 't1.t1_i1_i2'

greatsql> INSERT INTO t1 VALUES (null, 1);
greatsql> INSERT INTO t1 VALUES (null, 1);
ERROR 1062 (23000): Duplicate entry 'NULL-1' for key 't1.t1_i1_i2'

greatsql> INSERT INTO t1 VALUES (null, null);
greatsql> INSERT INTO t1 VALUES (null, null);
ERROR 1062 (23000): Duplicate entry 'NULL-NULL' for key 't1.t1_i1_i2'

-- 即便切换到DEFAULT模式，再插入相同记录也会报错
greatsql> SET sql_mode = DEFAULT;

greatsql>  INSERT INTO t1 VALUES (null, null);
ERROR 1062 (23000): Duplicate entry 'NULL-NULL' for key 't1.t1_i1_i2'

greatsql> INSERT INTO t1 VALUES (2, null);
ERROR 1062 (23000): Duplicate entry '2-NULL' for key 't1.t1_i1_i2'

greatsql> SELECT * FROM t1;
+------+------+
| i1   | i2   |
+------+------+
| NULL | NULL |
| NULL |    1 |
|    1 | NULL |
|    2 | NULL |
+------+------+
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
