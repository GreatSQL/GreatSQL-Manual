# Oracle Compatibility - Stored Procedure - named parameter
---


## 1. Syntax

```sql
udf_expr:
    expr
    | ident '=>' expr
```

## 2. Definition and Usage

### 2.1 Definition

When calling GreatSQL stored procedures/functions, markers such as `parameter1 => value1` can be added to parameters, decoupling the calling order of parameters from the definition order, improving ease of use and reducing the probability of hidden errors.

Notes on using named notation:

- Named notation and positional notation (the traditional calling mode) can be mixed, but after the first named-notation parameter, positional notation is no longer allowed.

- When executing `EXPLAIN` to view the execution plan, the functions involved are displayed rewritten in positional notation, but this does not affect the execution result.

- Built-in system functions cannot be used with named notation, such as `SUM`, `DECODE()`, etc.

### 2.2 Supported scope

In `ORACLE` mode, the following named-notation usages are supported:

- Stored procedures

- Stored functions

- User-defined functions (UDF, loaded with udf.so). Native UDF usage supports named notation, such as `f1(1 AS a, 2 AS b)`, but `f1(a=>1, b=>2)` is not supported; the latter requires switching to `ORACLE` mode first.

### 2.3 Error descriptions

When a named-notation error occurs, there are mainly three types of error messages:

- `In %s %s, a named parameter was specified before a positional parameter.`
    - Error cause: a named parameter appears to the left of a positional parameter.
    - Suggested action: adjust the parameter order or change the named parameter to a positional parameter.

- `In %s %s, parameter %s was invalid.`
    - Error cause: the name of the named parameter is invalid.
    - Suggested action: refer to the definition and correct the invalid name.

- `In %s %s, parameter %s was missing.`
    - Error cause: a parameter is missing, most likely a duplicate-name error, such as: `CALL p1(a=>2, a=>1);`.
    - Suggested action: refer to the definition and correct the error.


## 3. Examples


```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1(a INT, b INT, c INT) AS
BEGIN
  SELECT a*b+c;
END; //

CREATE OR REPLACE FUNCTION f1(a INT, b INT) RETURN INT DETERMINISTIC AS
BEGIN
  RETURN a-b;
END; //

greatsql> DELIMITER ;
greatsql> CALL p1(3, 2, 1);           -- Positional notation
greatsql> CALL p1(c=>1, b=>2, a=>1);  -- Named notation
greatsql> CALL p1(1, c=>3, b=>2);     -- Mixed notation

greatsql> SELECT f1(2, 1);            -- Positional notation
greatsql> SELECT f1(a=>2, 1);         -- Incorrect usage

greatsql> EXPLAIN SELECT * FROM t1 WHERE a > f1(a=>2, b=>1);
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
