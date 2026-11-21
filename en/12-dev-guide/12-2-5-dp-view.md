# Views
---

## What Is a View

A view is a virtual table that does not contain actually stored data; instead, its result set is generated dynamically from the SQL query logic written when the view is defined.

Unlike an actual table, a view does not store data but stores an SQL query. Views let users access the results of complex queries by querying the view, just like querying an ordinary table.

The main functions of views include:

- Simplifying complex queries: with views, users can encapsulate a complex SQL query into a simple query.
- Data security: views can be used to restrict users' access to specific data, and part of the data of a table can be exposed through a view.
- Data independence: views can hide changes to the table structure and provide data independence.
- Reusing query logic: views can reuse query logic, improving development efficiency.

## Creating a View

The basic syntax for creating a view is as follows:

```sql
CREATE 
 [OR REPLACE] 
 [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
  VIEW view_name AS
SELECT c1, c2, ...
 FROM t1
  WHERE condition;
```

- `ALGORITHM` specifies the mechanism used to generate the view.
- `view_name` is the name of the view.
- `c1, c2, ...` are the columns contained in the view.
- `t1` is the name of the actual table being queried.
- `condition` is an optional query condition.

## Using Views

1. **Querying a view**: query the view just like querying an ordinary table.
   ```sql
   SELECT * FROM view_name;
   ```

2. **Updating a view**: if the view definition allows it (usually it is based on a single table and does not contain aggregate functions, `DISTINCT`, `GROUP BY`, and so on), the data of the base table can also be updated through the view.
   ```sql
   UPDATE view_name SET column = value WHERE condition;

   DELETE FROM view_name WHERE condition;
   ```

## Precautions

1. **Performance impact**: complex view queries may affect performance, especially when the `TEMPTABLE` algorithm is used, because the data is copied into a temporary table.
2. **Update restrictions**: not all views are updatable. Views that involve aggregate functions, subqueries, `DISTINCT`, `UNION`, and similar operations are usually not updatable.
3. **Privilege management**: creating a view requires the corresponding privileges. Also make sure to grant access privileges on the view correctly through the `GRANT` statement, and be careful not to accidentally expose sensitive data through views.
4. **Dependency management**: views depend on base tables. Changes to the base table structure may affect the validity of a view, so the view definition must be adjusted in time.
5. **Indexes and views**: indexes cannot be created on a view itself, but queries based on a view can use the indexes of the base tables.
6. **Choosing a view algorithm**: MySQL provides three view processing algorithms: `MERGE`, `TEMPTABLE`, and `UNDEFINED`. Choosing the appropriate algorithm can optimize performance and updatability.
   - *MERGE*: suitable for simple views; the view definition is combined with the query for execution.
   - *TEMPTABLE*: suitable for complex views; the results are first stored in a temporary table and then processed.
   - *UNDEFINED*: undefined; the algorithm is chosen automatically, preferring *MERGE*.

For example, create a view with the following method, which can then be queried and updated:

```sql
greatsql> USE world;
greatsql> CREATE VIEW v1 AS SELECT * FROM city WHERE CountryCode = 'CHN';
greatsql> SELECT * FROM v1 LIMIT 5;

-- The view definition can be displayed with SHOW CREATE VIEW/TABLE; the two are equivalent
greatsql> SHOW CREATE TABLE v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` AS select `city`.`ID` AS `ID`,`city`.`Name` AS `Name`,`city`.`CountryCode` AS `CountryCode`,`city`.`District` AS `District`,`city`.`Population` AS `Population` from `city` where (`city`.`CountryCode` = 'CHN')
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci

greatsql> SHOW CREATE VIEW v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` AS select `city`.`ID` AS `ID`,`city`.`Name` AS `Name`,`city`.`CountryCode` AS `CountryCode`,`city`.`District` AS `District`,`city`.`Population` AS `Population` from `city` where (`city`.`CountryCode` = 'CHN')
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci

-- Update the view and query it again
greatsql> UPDATE v1 SET Population = 9696400 WHERE ID = 1890;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM v1 WHERE ID = 1890;
+------+----------+-------------+----------+------------+
| ID   | Name     | CountryCode | District | Population |
+------+----------+-------------+----------+------------+
| 1890 | Shanghai | CHN         | Shanghai |    9696400 |
+------+----------+-------------+----------+------------+
```

## Modifying a View

A view can be modified with `ALTER VIEW`, for example:

```sql
greatsql> SELECT COUNT(*) FROM v1;
+----------+
| count(*) |
+----------+
|      363 |
+----------+

greatsql> ALTER VIEW v1 AS SELECT * FROM city WHERE CountryCode = 'CHN' AND Population >= 5000000;
Query OK, 0 rows affected (0.07 sec)

greatsql> SELECT COUNT(*) FROM v1;
+----------+
| count(*) |
+----------+
|        4 |
+----------+
```

When a view is modified or dropped, the `VIEW` keyword must be used and the `TABLE` keyword can no longer be used, for example:

```sql
greatsql> DROP TABLE v1;
ERROR 1051 (42S02): Unknown table 'world.v1'

greatsql> DROP VIEW v1;
Query OK, 0 rows affected (0.00 sec)
```

## Summary

A view is a flexible and powerful tool in database design. Through views, users can simplify complex queries, enhance data security, and improve the maintainability and reusability of queries.

However, when using views, pay attention to their performance impact, updatability restrictions, and dependencies to ensure the validity and reliability of the views.

Starting from GreatSQL 8.0.32-24, Oracle compatibility is supported, and the view creation syntax has been extended to support the `CREATE FORCE VIEW` syntax. For details, see: [Oracle Compatibility - Syntax - CREATE FORCE VIEW](../5-enhance/sql-compat/5-3-easyuse-ora-syntax-createforceview.md).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
