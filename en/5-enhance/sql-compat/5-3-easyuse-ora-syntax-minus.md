# Oracle Compatibility - Syntax - MINUS
---

## 1. Syntax

```sql
SELECT ...
 MINUS SELECT ...
  [MINUS SELECT ...]
```

## 2. Definition and Usage

The `MINUS` syntax is used to compute the set difference of two result sets, excluding duplicate rows. Its usage is similar to the `UNION` and `INTERSECT` syntaxes.

Its usage is the same as the `UNION` operation; nesting `MINUS` in the right subtree is not supported, as shown in the following example:

```sql
greatsql> SELECT 1 minus (SELECT 1 MINUS SELECT 1);
ERROR 1235 (42000): This version of MySQL doesn't yet support 'nesting of unions at the right-hand side'
```

## 3. Examples

```
greatsql> SELECT 1,2 MINUS SELECT 'a','b';
+---+---+
| 1 | 2 |
+---+---+
| 1 | 2 |
+---+---+

greatsql> SELECT 1,2 MINUS SELECT 1,2;
Empty set (0.00 sec)

greatsql> CREATE TABLE t1(c1 INT);
greatsql> INSERT INTO t1 VALUES (1),(2),(3),(3);

greatsql> CREATE TABLE t2(c1 INT);
greatsql> INSERT INTO t2 VALUES (1),(2);

greatsql> SELECT * FROM t1 MINUS SELECT * FROM t2;
+------+
| c1   |
+------+
|    3 |
+------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
