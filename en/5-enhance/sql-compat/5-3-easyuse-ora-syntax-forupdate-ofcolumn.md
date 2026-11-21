# Oracle Compatibility - Syntax - SELECT ... FOR UPDATE ... OF COLUMN
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

SELECT ... FOR UPDATE OF column_list [locked_row_action]
```

The optional usages of `locked_row_action` are:

- `NOWAIT`.
- `SKIP LOCKED`.
- `WAIT n`.
- Empty, with nothing appended.

This syntax is supported only after switching to the `ORACLE` mode.

## 2. Definition and Usage

The `SELECT ... FOR UPDATE OF column_list` statement is used to query data and acquire locks.

In GreatSQL, since the row lock mechanism differs from Oracle, the actual locking locks the entire row of data, and it is not possible to lock only the specified columns without locking other columns as in Oracle. In other words, this syntax is only compatible with the Oracle style of usage; the actual row lock behavior remains the same as the native GreatSQL row lock mechanism.

There are a few notes:

1. In `ORACLE` mode, the `FOR UPDATE OF table_name` usage is no longer supported; it must be changed to the `FOR UPDATE OF column_list` usage, whose function is the same as in `DEFAULT` mode.

2. In single-table queries, specifying only the column name without the table name is allowed, but in multi-table queries the table name must be specified.

3. An error is reported when an incorrect column name is specified.

4. In a locking query request, if the `WHERE` condition is an indexed column, the current transaction locks the data rows that satisfy the condition; if it is not an indexed column, all data rows are locked.

## 3. Oracle Compatibility Notes

The differences between this syntax and Oracle are as follows:

1. In Oracle, regardless of whether the `WHERE` condition is an indexed column, only the data rows that satisfy the condition are locked; in GreatSQL, if it is not an indexed column, all data rows are locked, as described above.

2. In GreatSQL, statements such as `INSERT [ALL] INTO t1 SELECT a.* FROM t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1=12 FOR UPDATE OF a.c1 NOWAIT;` are supported, while Oracle does not support them.

3. Both support the case of duplicate columns, for example: `SELECT * FROM t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1=12 FOR UPDATE OF a.c1, a.c1;`.

4. Subqueries are supported in Oracle but not in GreatSQL, for example: `SELECT * FROM (SELECT * FROM t1) t WHERE c1=10 FOR UPDATE OF t;`.

## 4. Examples

Create the test tables and initialize data:
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

- 1. `FOR UPDATE OF table.column` specifies columns in a base table.

```sql
-- Switch to ORACLE mode first
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

- 2. `FOR UPDATE OF view.column` specifies columns in a view.

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

- 3. Several incorrect usages

```sql
-- 1. FOR UPDATE OF table is not supported in ORACLE mode

greatsql> SET sql_mode = ORACLE;

greatsql> SELECT * from t1 a JOIN t2 b ON a.c1=b.c1 WHERE a.c1 = 12 FOR UPDATE OF a NOWAIT;
ERROR 1052 (23000): Column 'a' in field list is ambiguous

-- Supported in DEFAULT mode
+------+------+------+------+
| c1   | c2   | c1   | c2   |
+------+------+------+------+
|   12 | r12  |   12 | r22  |
+------+------+------+------+
1 row in set (0.00 sec)

-- 2. The specified column does not exist
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT * from t1 a WHERE c1=10 FOR UPDATE OF a.c10;
ERROR 1054 (42S22): Unknown column 'greatsql.a.c10' in 'update of clause'

-- The error differs in DEFAULT mode
greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT * from t1 a WHERE c1=10 FOR UPDATE OF a.c10;
ERROR 3568 (HY000): Unresolved table name `a`.`c10` in locking clause.
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
