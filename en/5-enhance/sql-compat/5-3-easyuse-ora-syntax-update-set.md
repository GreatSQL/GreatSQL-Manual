# Oracle Compatibility - Syntax - UPDATE ... SET
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

UPDATE [LOW_PRIORITY] [IGNORE] table_reference
    SET (assignment_list) = (var_list)
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]

UPDATE [LOW_PRIORITY] [IGNORE] table_reference
    SET (assignment_list) = (SELECT stmt)
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

You need to switch to `ORACLE` mode first to support this syntax.

## 2. Definition and Usage

In GreatSQL, executing `UPDATE ... SET` to update multiple tables at the same time is supported, similar to the Oracle usage. There are mainly two forms:

- Usage 1, multi-table update

`UPDATE t1, t2 ... tn SET(column1,column2) = (value1, value2)`

This form supports updating multiple columns with the same name in multiple tables at the same time.

- Usage 2, single-table update, where the update values come from a subquery

`UPDATE TABLE t1 SET(a,b) = (SELECT * FROM t2) WHERE`

This usage only supports updating a single table, and only supports assignment with a single SELECT statement; multiple SELECT statements are not supported, which is consistent with Oracle behavior.

## 3. Oracle Compatibility Notes

In Oracle, *Usage 1* mentioned above is not supported, that is, updating multiple tables at the same time; it is only supported in GreatSQL.

## 4. Examples

Create test tables and initialize data:

```sql
greatsql> CREATE TABLE t1 (c1 INT NOT NULL AUTO_INCREMENT PRIMARY KEY, c2 VARCHAR(10) NOT NULL, c3 VARCHAR(10) NOT NULL);
greatsql> CREATE TABLE t2 LIKE t1;
greatsql> INSERT INTO t1 VALUES (1, 'rt1c2', 'rt1c3');
greatsql> INSERT INTO t2 VALUES (1, 'rt2c2', 'rt2c3');
```

- 1. Example 1: multi-table update

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> UPDATE t2, t1 SET (t2.c1, t1.c1) = (2, 9);
Query OK, 2 rows affected (0.00 sec)
Rows matched: 2  Changed: 2  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  9 | rt1c2 | rt1c3 |
+----+-------+-------+

greatsql> SELECT * FROM t2;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  2 | rt2c2 | rt2c3 |
+----+-------+-------+
```

- 2. Example 2: update values from a subquery

```sql
greatsql> SET sql_mode = ORACLE;

-- This form is also acceptable
-- UPDATE t1 SET (c1, c2 ,c3) = (SELECT * FROM t2 WHERE c1 = 2) WHERE t1.c1 = 9;
greatsql> UPDATE t1 SET (t1.c1, t1.c2, t1.c3) = (SELECT t2.c1, t2.c2, t2.c3 FROM t2 WHERE t2.c1 = 2) WHERE t1.c1 = 9;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  2 | rt2c2 | rt2c3 |
+----+-------+-------+

greatsql> SELECT * FROM t2;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  2 | rt2c2 | rt2c3 |
+----+-------+-------+
```

- 3. Example 3: update values from a subquery

```sql
-- Reinitialize the t1 and t2 tables
greatsql> TRUNCATE TABLE t1;
greatsql> INSERT INTO t1 VALUES (1, 'rt1c21', 'rt1c31');

greatsql> TRUNCATE TABLE t2;
greatsql> INSERT INTO t2 VALUES (1, 'rt2c21', 'rt2c31'),
(2, 'rt2c22', 'rt2c32'),
(3, 'rt2c23', 'rt2c33');

greatsql> SET sql_mode = ORACLE;

-- Compared with usage 2, the WHERE condition on the t1 table at the end is missing
greatsql> UPDATE t1 SET(c2, c3) = (SELECT c2, c3 FROM t2 WHERE c1 = 3);
Query OK, 3 rows affected (0.00 sec)
Rows matched: 3  Changed: 3  Warnings: 0

greatsql> SELECT * FROM t1;
+----+--------+--------+
| c1 | c2     | c3     |
+----+--------+--------+
|  1 | rt2c23 | rt2c33 |
|  2 | rt2c23 | rt2c33 |
|  3 | rt2c23 | rt2c33 |
+----+--------+--------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
