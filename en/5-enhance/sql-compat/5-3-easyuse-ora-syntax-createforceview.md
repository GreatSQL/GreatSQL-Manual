# Oracle Compatibility - Syntax - CREATE FORCE VIEW
---

## 1. Syntax

```sql
CREATE [ OR REPLACE ] FORCE VIEW name [ ( column_name [, ...] ) ]
  AS query
```

## 2. Definition and Usage

Under normal circumstances, creating a view fails if the base table does not exist. However, this feature can be used to force-create a view (provided that the view creation statement is free of syntax errors).

## 3. Oracle Compatibility Notes

1. The `PREPARE stmt FROM` and `EXECUTE IMMEDIATE` scenarios are not supported.

2. After a view is force-created, the `ALTER VIEW new_view compile` syntax is not supported, which differs from Oracle.

3. Error messages may differ from Oracle. If the query is invalid, the error reported when the base table is created is `ER_VIEW_INVALID`; other errors may also occur when creating the base table referenced by the view.

4. If the base table does not exist, the constraint checks performed when force-creating a view only include simple checks for duplicate column names and duplicate table names, which differs from Oracle.

5. In Oracle, when force-creating a view, rule checks are performed on the SQL statement during syntax parsing, and some statements fail directly with an error. In GreatSQL, the error is only reported when the prepare phase resolves the values. When the base table does not exist, Oracle has its own rule-checking error messages.

## 4. Examples

### 4.1 Creating a View Normally
```sql
greatsql> CREATE TABLE t1 (a INT, b INT);
greatsql> INSERT INTO t1 VALUES (1,1), (2,2), (3,3);
greatsql> CREATE FORCE VIEW v1 (c,d) AS SELECT a,b FROM t1 WHERE a<=2;
greatsql> SELECT * FROM t1;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

greatsql> SELECT * FROM v1;
+------+------+
| c    | d    |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
```

### 4.2 The Base Table Does Not Exist When Creating the View; the View Works Normally After the Base Table Is Created

```sql
-- Force-create a view whose base table does not exist
greatsql> CREATE FORCE VIEW v1 (c,d) AS SELECT a,b FROM t1 WHERE a<=2;
Query OK, 0 rows affected, 2 warnings (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------------------------------+
| Level   | Code | Message                               |
+---------+------+---------------------------------------+
| Error   | 1146 | Table 'greatsql.t1' doesn't exist     |
| Warning | 7567 | View created with compilation errors. |
+---------+------+---------------------------------------+

greatsql> SELECT * FROM t1;
ERROR 1146 (42S02): Table 'greatsql.t1' doesn't exist

greatsql> SELECT * FROM v1;
ERROR 1356 (HY000): View 'greatsql.v1' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them

-- Even if the base table does not exist, the view definition can still be viewed
greatsql> SHOW CREATE VIEW v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE FORCE DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` (`c`,`d`) AS select `t1`.`a` AS `a`,`t1`.`b` AS `b` from `t1` where (`t1`.`a` <= 2)
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci

-- Create the base table and insert data
greatsql> CREATE TABLE t1 (a INT, b INT);
greatsql> INSERT INTO t1 VALUES (1,1), (2,2), (3,3);
greatsql> CREATE FORCE VIEW v1 (c,d) AS SELECT a,b FROM t1 WHERE a<=2;
greatsql> SELECT * FROM t1;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

greatsql> SELECT * FROM v1;
+------+------+
| c    | d    |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
```

### 4.3 Two Unsupported Scenarios

```
greatsql> EXECUTE IMMEDIATE 'CREATE OR REPLACE FORCE VIEW v1 AS SELECT * FROM t1';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> PREPARE stmt FROM 'CREATE OR REPLACE FORCE VIEW v1 AS SELECT * FROM t1';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

### 4.4 Constraint Check Fails and the View Cannot Be Force-Created

```
greatsql> CREATE FORCE VIEW v1 AS SELECT * FROM v1;
ERROR 1462 (HY000): `greatsql`.`v1` contains view recursion

greatsql> CREATE FORCE VIEW v1 AS SELECT a,a FROM t1;
ERROR 1060 (42S21): Duplicate column name 'a'
```

### 4.5 Some Error Messages Differ from Oracle

```
-- 1. Duplicate column names
-- GreatSQL
greatsql> CREATE OR REPLACE FORCE VIEW v1 AS SELECT a.a, b.a FROM t1 a JOIN t1 b;
ERROR 1060 (42S21): Duplicate column name 'a'

-- Oracle
SQL> CREATE OR REPLACE FORCE VIEW v1 AS SELECT a.a, b.a FROM t1 a JOIN t1 b;
CREATE OR REPLACE FORCE VIEW v1 AS SELECT a.a, b.a FROM t1 a JOIN t1 b
                                                                     *
ERROR at line 1:
ORA-00905: missing keyword

-- 2. Nesting when creating a view
-- GreatSQL
greatsql> CREATE OR REPLACE FORCE VIEW v2 AS SELECT (SELECT a FROM v2) FROM DUAL;
ERROR 1462 (HY000): `greatsql`.`v2` contains view recursion

greatsql> CREATE OR REPLACE FORCE VIEW v2 AS SELECT * FROM (SELECT a FROM v2) ;
ERROR 1462 (HY000): `greatsql`.`v2` contains view recursion

-- Oracle
SQL> CREATE OR REPLACE FORCE VIEW v2 AS SELECT * FROM (SELECT a FROM v2) ;

Warning: View created with compilation errors.

SQL> CREATE OR REPLACE FORCE VIEW v2 AS SELECT (SELECT a FROM v2) FROM DUAL;

Warning: View created with compilation errors.

SQL> CREATE OR REPLACE FORCE VIEW v2 AS SELECT * FROM (SELECT a FROM v2) ;

Warning: View created with compilation errors.
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
