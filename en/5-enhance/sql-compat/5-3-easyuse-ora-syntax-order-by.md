# Oracle Compatibility - Syntax - Oracle ORDER BY Compatibility
---

In GreatSQL, after switching to ORACLE mode, Oracle-style sort rules are supported.

## 1. Syntax

```sql
ORDER BY order_expr [, order_expr...]

order_expr :
    expr [ ASC | DESC ] [ NULLS FIRST | NULLS LAST ]
```

## 2. Oracle Compatibility Notes

GreatSQL and Oracle differ in the way `NULL` values are handled when sorting with `ORDER BY`.

GreatSQL behavior:
- When sorting by `ASC`, `NULL` values are sorted first;
- When sorting by `DESC`, `NULL` values are sorted last.

Oracle behavior is the opposite of GreatSQL, that is:
- When sorting by `ASC`, `NULL` values are sorted last;
- When sorting by `DESC`, `NULL` values are sorted first.

You can set `SET sql_mode = ORACLE` to switch to ORACLE mode and choose Oracle's sort mode.

In ORACLE mode, you can also add NULLS FIRST to explicitly place `NULL` values first in the final result when sorting.
You can also add NULLS LAST to explicitly place `NULL` values last in the final result.

## 3. Examples

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

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
