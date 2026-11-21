# Oracle Compatibility - Syntax - NULL Treated as the Same Value in Indexes
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;
```

## 2. Definition and Usage

In the native `DEFAULT` mode of GreatSQL, `NULL` values in a unique index (`UNIQUE KEY`) are treated as different values.

After switching to `ORACLE` mode, `NULL` values in a unique index are treated as the same value.

In addition, in `ORACLE` mode, the unique index may report a duplicate `NULL` value conflict.

## 3. Oracle Compatibility Notes

1. After switching to `ORACLE` mode, newly created unique indexes treat `NULL` as the same value, while unique indexes that already existed before switching modes remain unchanged.

2. Only the InnoDB engine supports this feature.

## 4. Examples

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TABLE t1 (i1 INT, i2 INT);

greatsql> CREATE UNIQUE INDEX t1_i1_i2 ON t1(i1, i2);

-- Inserting the same record again will report an error
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

-- Even after switching back to DEFAULT mode, inserting the same record will still report an error
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

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
