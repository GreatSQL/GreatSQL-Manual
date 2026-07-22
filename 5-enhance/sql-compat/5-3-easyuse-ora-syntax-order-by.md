# Oracle 兼容 - 语法 - Oracle ORDER BY 兼容
---


在 GreatSQL 中，切换到 ORACLE 模式后，即可支持 Oracle 风格的排序规则。

## 1. 语法

```sql
ORDER BY order_expr [, order_expr...]

order_expr :
    expr [ ASC | DESC ] [ NULLS FIRST | NULLS LAST ]
```

## 2. Oracle 兼容说明

GreatSQL 和 Oracle 在 `ORDER BY` 排序时，对于 `NULL` 值的排序处理方式存在差异。

GreatSQL 的做法：
- 按 `ASC` 排序时，`NULL` 排序在前;
- 按 `DESC` 排序时，`NULL` 排序在后。

Oracle 的做法与 GreatSQL 相反，即：
- 按 `ASC` 排序时，`NULL` 排序在后;
- 按 `DESC` 排序时，`NULL` 排序在前。

可以设置 `SET sql_mode = ORACLE` 切换到 ORACLE 模式，选择使用 Oracle 的排序模式。

在 ORACLE 模式下，还可以在排序时加上 NULLS FIRST 显式设置在最终结果中将 `NULL` 排序在最前面。
也可以加上 NULLS LAST 显式设置在最终结果中将 `NULL` 排序在最后面。


## 3. 示例

```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> CREATE TABLE t1 (id INT, desc1 VARCHAR(2), desc2 VARCHAR(2));
greatsql> INSERT INTO t1 VALUES (1, NULL, 'A'), (2, 'B', 'B'), (3, 'C', 'C'), (4, 'D', 'D');

greatsql> SELECT * FROM t1;
+------+-------+-------+
| id   | desc1 | desc2 |
+------+-------+-------+
|    1 | NULL  | A     |
|    2 | B     | B     |
|    3 | C     | C     |
|    4 | D     | D     |
+------+-------+-------+

greatsql> SELECT * FROM t1 ORDER BY desc1;
+------+-------+-------+
| id   | desc1 | desc2 |
+------+-------+-------+
|    1 | NULL  | A     |
|    2 | B     | B     |
|    3 | C     | C     |
|    4 | D     | D     |
+------+-------+-------+

greatsql> SELECT * FROM t1 ORDER BY desc1 DESC;
+------+-------+-------+
| id   | desc1 | desc2 |
+------+-------+-------+
|    4 | D     | D     |
|    3 | C     | C     |
|    2 | B     | B     |
|    1 | NULL  | A     |
+------+-------+-------+

greatsql> SELECT * FROM t1 ORDER BY desc1 NULLS FIRST;
+------+-------+-------+
| id   | desc1 | desc2 |
+------+-------+-------+
|    1 | NULL  | A     |
|    2 | B     | B     |
|    3 | C     | C     |
|    4 | D     | D     |
+------+-------+-------+

greatsql> SELECT * FROM t1 ORDER BY desc1 NULLS LAST;
+--------+-------+-------+
| id | desc1 | desc2 |
+--------+-------+-------+
|      2 | B     | B     |
|      3 | C     | C     |
|      4 | D     | D     |
|      1 | NULL  | A     |
+--------+-------+-------+

greatsql> SELECT * FROM t1 ORDER BY desc1 DESC NULLS FIRST;
+------+-------+-------+
| id   | desc1 | desc2 |
+------+-------+-------+
|    1 | NULL  | A     |
|    4 | D     | D     |
|    3 | C     | C     |
|    2 | B     | B     |
+------+-------+-------+

greatsql> SELECT * FROM t1 ORDER BY desc1 DESC NULLS LAST;
+------+-------+-------+
| id   | desc1 | desc2 |
+------+-------+-------+
|    4 | D     | D     |
|    3 | C     | C     |
|    2 | B     | B     |
|    1 | NULL  | A     |
+------+-------+-------+
```



**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
