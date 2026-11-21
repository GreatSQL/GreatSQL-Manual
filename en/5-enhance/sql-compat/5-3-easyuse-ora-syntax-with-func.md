# Oracle Compatibility - Syntax - WITH FUNCTION
---

## 1. Syntax

```sql
WITH FUNCTION
  <func_name> {<function...>}
  SELECT(query_block)
```

## 2. Definition and Usage

With the `WITH FUNCTION` clause, many complex logics that originally required stored procedures can be expressed in a single SQL statement, making it more convenient to use.

Related usage notes are as follows:

1. The scope of the defined function is within the query expression in which it is located.

2. The defined stored function object is not stored in system tables;

3. The defined stored function has higher priority than stored functions of schema objects;

4. The defined stored function has lower priority than local functions;

5. No `CREATE FUNCTION` privilege is required to define a function;

6. There is no need to require `sql_mode = ORACLE`, as long as the syntax for creating the function does not report an error;

7. `PREPARE STMT` is not supported;

8. The function name does not support the `schema_name.func_name` format; functions can only be created in the current Schema;

9. Only the SELECT clause is supported, other clauses such as `DELETE/UPDATE/MERGE` are not supported.

Note: the feature in point 9 is that in stored procedures, the function definition needs to be clearly visible to avoid the overhead of ddl operations. It is not supported yet and needs to be adapted and developed after collecting specific usage scenarios.

## 3. Examples

```sql
-- Switch to ORACLE mode first
greatsql> SET sql_mode = ORACLE;

greatsql> DELIMITER //

-- 1. Create a function
greatsql> WITH
FUNCTION f1(c INT) RETURN INT
AS
BEGIN
  RETURN c * 10;
END;
SELECT f1(3306) FROM DUAL; //
+----------+
| f1(3306) |
+----------+
|    33060 |
+----------+
1 row in set (0.00 sec)

-- 2. Create a function with the same name
greatsql> SELECT LENGTH('GreatSQL') FROM DUAL //
+--------------------+
| LENGTH('GreatSQL') |
+--------------------+
|                  8 |
+--------------------+
1 row in set (0.00 sec)

-- A function with the same name can be created, but the local function takes priority; it can be seen that the result is not 6 but 8
greatsql> WITH
FUNCTION LENGTH(c VARCHAR2(50)) RETURN INT
AS
BEGIN
  RETURN 6;
END;
SELECT LENGTH('GreatSQL'), INSTR('Hello GreatSQL', 'G') FROM DUAL; //
+--------------------+------------------------------+
| LENGTH('GreatSQL') | INSTR('Hello GreatSQL', 'G') |
+--------------------+------------------------------+
|                  8 |                            7 |
+--------------------+------------------------------+
1 row in set, 1 warning (0.00 sec)

-- A warning about the duplicate name is shown
greatsql> SHOW WARNINGS; //
+-------+------+---------------------------------------------------------------+
| Level | Code | Message                                                       |
+-------+------+---------------------------------------------------------------+
| Note  | 1585 | This function 'LENGTH' has the same name as a native function |
+-------+------+---------------------------------------------------------------+
1 row in set (0.00 sec)
 
-- 3. Create a function with a different name
-- The fixed value 16 in the function can be returned
greatsql> WITH
FUNCTION LENGTH_tmp(c VARCHAR2(50)) RETURN INT
AS
BEGIN
  RETURN 16;
END; 
SELECT LENGTH_tmp('GreatSQL') FROM DUAL; //

-- 4. Switch to DEFAULT mode and create a function in DEFAULT mode
greatsql> SET sql_mode = DEFAULT; //

greatsql> WITH FUNCTION f2() RETURNS INT
BEGIN
  DECLARE c, s INT;
  DROP TEMPORARY TABLE IF EXISTS t1;
  CREATE TEMPORARY TABLE t1(id INT);
  INSERT INTO t1 VALUES (1), (2), (3);

  SET c:= (SELECT COUNT(*) FROM t1);
  SET s:= (SELECT SUM(id) FROM t1);

  RETURN c * s;
END;
SELECT f2() FROM DUAL; //
+------+
| f2() |
+------+
|   18 |
+------+
1 row in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
