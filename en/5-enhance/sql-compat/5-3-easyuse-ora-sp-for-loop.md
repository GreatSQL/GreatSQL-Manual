# Oracle Compatibility - Stored Procedure - FOR LOOP
---


## 1. Syntax

```sql
FOR var IN [REVERSE] expr1 .. expr2 LOOP .. END LOOP

-- OR
FOR var IN [REVERSE] expr1..expr2 LOOP .. END LOOP
```

## 2. Definition and Usage

GreatSQL supports using the `FOR .. IN expr1 .. expr2 LOOP .. END LOOP` syntax to read data in a loop and assign it to the corresponding variable. In `FOR ... LOOP`, the two parameter expressions at the front and back can be connected with the middle dots, for example: `FOR .. IN expr1..expr2 LOOP`; or connected with only one parameter, for example: `FOR .. IN expr1.. expr2 LOOP` and `FOR .. IN expr1 ..expr2 LOOP` are both allowed.

## 3. Oracle Compatibility Notes

In `ORACLE` mode, GreatSQL stored procedures support the `FOR .. LOOP` usage. The usage is as follows:

1. The variable `var` in `FOR LOOP` does not need to be declared in advance; the `FOR var IN expr1 .. expr2 LOOP` syntax can be used directly.

2. The `REVERSE` keyword can be added to obtain data in reverse order.

3. `expr1/expr2` in the loop support numeric-type variables, numbers, functions, expressions, etc. If `expr1/expr2` is of `FLOAT` type, it is converted to `INT` type (rounded during conversion).

4. If `expr1/expr2` is of a time type, it is converted to a numeric type for calculation instead of being added or subtracted according to time rules. Oracle does not support this type and reports an error.

5. In the loop `FOR var IN`, if the variable `var` is of `FLOAT` type, it is converted to `INT` type (rounded during conversion).

## 4. Examples

- 1. Example 1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(i FLOAT, j FLOAT) AS
BEGIN
  FOR x IN i .. j LOOP
    SELECT x;
  END LOOP;
END; //

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.4,3.5) //
+------+
| x    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    4 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```
It can be seen that when the passed parameter is of `FLOAT` type, it is converted to `INT` type (rounded during conversion).

- 2. Example 2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(i FLOAT, j FLOAT) AS
BEGIN
  -- Reverse order
  FOR x IN REVERSE i .. j LOOP
    SELECT x;
  END LOOP;
END; //

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.4, 3.5) //
+------+
| x    |
+------+
|    4 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(i FLOAT, j FLOAT) AS
  val FLOAT := 1.2; 
BEGIN
  FOR x IN i .. j LOOP
    -- Add a FLOAT type value inside the loop
    val := val + x;
    SELECT val;
  END LOOP;
END; //

greatsql> CALL p1(1.5, 3.4) //
+------+
| val  |
+------+
|  3.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  6.2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.4, 3.5) //
+------+
| val  |
+------+
|  2.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  4.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  7.2 |
+------+
1 row in set (0.01 sec)

+------+
| val  |
+------+
| 11.2 |
+------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)

greatsql> CALL p1(1.5, 3.4) //
+------+
| val  |
+------+
|  3.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  6.2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```





**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
