# Oracle Compatibility - Stored Procedure - Basic Constructs
---



GreatSQL supports Oracle-style stored procedure usage. Some stored procedures/functions have been restructured at the basic-construct level in `ORACLE` mode, mainly including the following points.

## 1. Use the `AS/IS` keyword to mark the beginning of the function body

When creating a stored procedure (`PROCEDURE`) or stored function (`FUNCTION`), the `AS` or `IS` keyword is required to mark the beginning of the function body. See the example below:

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

-- CREATE FUNCTION
greatsql> CREATE OR REPLACE FUNCTION f1() RETURN NUMBER
AS
BEGIN
  RETURN 3306;
END; //

-- CREATE PROCEDURE
greatsql> CREATE OR REPLACE PROCEDURE p1()
AS
BEGIN
  SELECT 3306;
END; //

greatsql> SELECT f1() //
+------+
| f1() |
+------+
| 3306 |
+------+

greatsql> CALL p1() //
+------+
| 3306 |
+------+
| 3306 |
+------+
```

## 2. Variable declarations

In `DEFAULT` mode, stored procedure/function variable declarations are placed inside the `BEGIN ... END` statement block, and each statement block can contain multiple `DECLARE` statements. See the example below:

```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> DELIMITER //

-- CREATE PROCEDURE
greatsql> CREATE OR REPLACE PROCEDURE p1()
BEGIN
  DECLARE a INT;
  DECLARE b VARCHAR(10);
  SET a = 3306;
  
  SELECT a;
END; //

greatsql> CALL p1() //
+------+
| a    |
+------+
| 3306 |
+------+
```

When switching to `ORACLE` mode, the following points need attention:

- 1. When declaring variables for a stored function/procedure, data types such as `VARCHAR/VARCHAR2` must specify a string length, which is the same requirement as in `DEFAULT` mode. However, when used as a parameter type or the return value type of a stored function/procedure, the maximum length does not need to be specified.

  - 1. The maximum usable length depends on the character set specified by the `character_set_server` option. The length calculation rule is: `65535 / maxlen value of the character set`, rounded down. For example, when `character_set_server = utf8mb4`, the maximum usable length for `VARCHAR/VARCHAR2` types is: `65535 / 4 = 16383`.

  - 2. The same applies to the `VARBINARY` data type and the `NCHAR/NVARCHAR` types that use the `national` character set. `VARBINARY` uses the `binary` character set, so its maximum length is 65535, while the `national` character set is `utf8`, so the maximum length is (65535/3=) 21845.

A few examples:

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

-- As a return type, no length needs to be specified; as a variable, the length must be specified
-- CREATE PROCEDURE
greatsql> CREATE OR REPLACE FUNCTION f(str VARCHAR) RETURN VARCHAR
AS
  x VARCHAR(16383);
BEGIN
  x := str;
  RETURN x;
END; //

greatsql> CALL p1() //
+------+
| a    |
+------+
| 3306 |
+------+

-- CREATE FUNCTION
greatsql> CREATE OR REPLACE PROCEDURE p(str VARCHAR)
AS
  x VARCHAR(16383);
BEGIN
  x := str;
  SELECT x;
END;

greatsql> SELECT f1() //
+------+
| f1() |
+------+
| 3306 |
+------+
```

- 2. Variable declarations can be placed before the `BEGIN ... END` statement block. Variable declarations are optional, but if `DECLARE` is specified, at least one declaration statement must be written. See the example below:

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> DECLARE 
  a INT;
  b INT;
BEGIN
  a := 3306;
  SELECT a;
END; //
+------+
| a    |
+------+
| 3306 |
+------+
```

Note: In the top-level statement block, the variable declaration section is placed directly after the `AS/IS` keyword, without `DECLARE` as a marker:

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1()
AS
  a INT;
  b VARCHAR(10);
BEGIN
  a := 3306;
  SELECT a;
END;

greatsql> CALL p1() //
+------+
| a    |
+------+
| 3306 |
+------+
```

- 3. Initial values can be assigned to declared variables with `:=`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> DECLARE 
  a INT := 3306;
BEGIN
  SELECT a;
END; //
+------+
| a    |
+------+
| 3306 |
+------+
```

- 4. The `IS` keyword must be added when declaring a cursor (`CURSOR`)

In `DEFAULT` mode, a `CURSOR` is declared as in the following example:

```sql
DECLARE c1 CURSOR FOR SELECT * FROM t1;
```

In `ORACLE` mode, a `CURSOR` is declared as in the following example:

```sql
CURSOR c1 IS SELECT * FROM t1;
```

## 3. Different `IN/OUT` parameter marking

In `DEFAULT` mode, the parameter markers of a stored procedure are: `IN/OUT/INOUT`, for example:

```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1(IN a INT, INOUT b INT, OUT c INT)
BEGIN
  SET b = a + b;
  SET c = a + b;
  SELECT a, b, c;
END; //

greatsql> SELECT 1,3,5 INTO @a,@b,@c //

greatsql> CALL p1(@a, @b, @c) //
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+

greatsql> SELECT @a, @b, @c //
+------+------+------+
| @a   | @b   | @c   |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+
```

In `ORACLE` mode, the parameter markers of a stored procedure are: `IN/OUT/IN OUT` (not `INOUT`), for example:
```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(a IN INT, b IN OUT INT, c OUT INT) AS
BEGIN
  b := a + b;
  c := a + b;
  SELECT a, b, c FROM DUAL;
END;

greatsql> SELECT 1,3,5 INTO @a,@b,@c //

greatsql> CALL p1(@a, @b, @c) //
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+

greatsql> SELECT @a, @b, @c //
+------+------+------+
| @a   | @b   | @c   |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+
```

Summary of the differences:

- In `DEFAULT` mode, `INOUT` is used to mark input/output parameters; in `ORACLE` mode, `IN OUT` is used to mark input/output parameters.

- Using `IN/OUT/IN OUT/INOUT` parameter markers in stored functions (`FUNCTION`) is not supported.

- In `DEFAULT` mode, the parameter marker should be placed before the variable name; in `ORACLE` mode, the parameter marker should be placed after the variable name and before the declared type.

## 4. Different variable assignment methods

In `ORACLE` mode, both GreatSQL and Oracle styles of variable assignment are supported, for example:

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1()
AS
  v1 INT;
  v2 INT;
BEGIN
  set v1 = 3306;  -- GreatSQL style
  v2 := 3306;     -- Oracle style
  SELECT v1, v2;
END; //

greatsql> CALL p1() //
+------+------+
| v1   | v2   |
+------+------+
| 3306 | 3306 |
+------+------+
```

## 5. Parameterless stored procedures or functions are supported

In `ORACLE` mode, stored procedures or functions without parameters are supported, and the parentheses after the name can be omitted when creating them, for example:

```SQL
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1
AS
BEGIN
  SELECT 3306;
END; //

greatsql> CALL p1 //
+------+
| 3306 |
+------+
| 3306 |
+------+
```






**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
