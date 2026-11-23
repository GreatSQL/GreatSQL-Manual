# Oracle Compatibility - Stored Procedure - Default Parameter Values of Stored Procedures/Functions
---


## 1. Syntax

```sql
[ IN | OUT | INOUT ]          # Optional input/output marker
var_name                      # Parameter name
var_type                      # Parameter type
[ { := | DEFAULT } optval ]     # Default value
```

## 2. Definition and Usage

In `ORACLE` mode, when defining parameters of GreatSQL stored procedures/functions, marker usage like `n INT := 1` is allowed. If another value is specified for the parameter when calling, this expression is ignored; otherwise, the parameter is initialized with this expression.

This feature allows parameters to be omitted when calling, improving ease of use and convenience.

### 2.1 Key points for parameter default values

- Parameter default values only apply to input parameters, i.e., parameters marked as `IN`.
- The parameter value `optval` and the parameter type `var_type` must be compatible.
- The space occupied by the parameter value `optval` must be smaller than the length defined for the parameter.
- The parameter value `optval` only allows time functions, such as `NOW()/SYSDATE()/CURRENT_TIMESTAMP()`, etc.; other types of functions are not supported.
- The parameter value `optval` is not allowed to contain references to data columns, stored procedure calls, pseudocolumns, etc.
- The parameter value `optval` must be a literal constant (LITERAL); expressions are not supported. For example, the parameter value `-1` is supported, but an expression like `0-1` is not; logical operations and parentheses `(` `)` are not supported either.
- Any parameter position is allowed to have a default value.


### 2.2 Supported data type list

The data types supported by the parameter default value feature are shown in the table below:

| Data type | Internal type | Example value | Unsupported value |
| ----------------- | ---------- | --------------------- | ------------------------------- |
| INT/INTEGER       | LONG       | 100                   | 0xFF                            |
| BIT               | BIT        | 1                     | 3                               |
| TINYINT           | TINY       | 100                   | 130                             |
| BOOL              | TINY       | 0                     | 130                             |
| SMALLINT          | SHORT      | 100                   |                                 |
| MEDIUMINT         | INT24      | -50                   |                                 |
| BIGINT            | LONGLONG   | 100                   |                                 |
| DECIMAL/DEX/FIXED | NEWDECIMAL | 100                   |                                 |
| FLOAT             | FLOAT      | 1.1                   |                                 |
| DOUBLE            | DOUBLE     | 1.1                   |                                 |
| VARCHAR           | VARCHAR    | 'GreatSQL'            |                                 |
| VARBINARY         | VARCHAR    | 'GreatSQL'            |                                 |
| DATE              | NEWDATE    | '2023-10-23'          |                                 |
| YEAR              | YEAR       | '2023', 2023          |                                 |
| TIME              | TIME2      | '20:01:02'            |                                 |
| DATETIME          | DATETIME2  | '2023-10-23 20:01:02' |                                 |
| TIMESTAMP         | TIMESTAMP2 | '2023-10-23 20:01:02' |                                 |
| BLOB              | BLOB       | 'GreatSQL'            |                                 |
| TEXT              | BLOB       | 'GreatSQL'            |                                 |


A few notes:

- `BIT`, `SET`, `ENUM`, `JSON` and other data types are not supported.
- The value range of the `BOOL` type is the same as that of `TINYINT`.
- If string-related types use default values, the character sets of the client (connection), database and data column must be consistent, otherwise the expected value may not be obtained.
- String-related types are not allowed to use default values longer than the defined length (an error is reported instead of automatic truncation).
- The handling of some special default values is consistent with the default values declared in the data types in the table creation DDL.
- When the parameter is of `VARBINARY` type, the character set of the parameter is not checked.
- When the data column type declared in the table creation DDL is `BLOB` or `TEXT`, its default value only supports `NULL`; it cannot be set to '' or other strings.


### 2.3 Supported function list

The functions supported by the parameter default value feature are shown in the table below:

SQL type | Internal type | 
---|---|---|---
NOW | NOW
CURRENT_TIMESTAMP | NOW
SYSDATE | NOW

Functions not listed in the table above are not supported, such as `ABS()`, `SUM()`, `DECODE()`, etc.



### 3.4 Error descriptions

When a parameter value error occurs, there are mainly two types of error messages:

- `Parameter '%s' has invalid value`
    - Error cause: an invalid default parameter value is found during the execution of a stored procedure/function.
    - Suggested action: modify the parameter value.
    
- `Parameter '%s' is invalid for %s`
    - Error cause: the parameter is invalid.
    - Suggested action: modify the invalid content, such as the parameter name, duplicate parameters, unsupported types, unsupported characters, etc.


## 3. Oracle Compatibility Notes

The main differences between GreatSQL and Oracle in the usage of stored procedure/function parameter default values are:

- Oracle supports transcoding character parameters, while GreatSQL does not.
- Oracle supports constant expressions as default parameters, while GreatSQL does not.


## 4. Examples

- 1. Example 1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(a BIT DEFAULT NULL) AS
BEGIN
  SELECT a;
END; //

greatsql> CREATE FUNCTION f1(a BIT DEFAULT NULL) RETURN BIT DETERMINISTIC AS
BEGIN
  RETURN a;
END; //

greatsql> CALL p1(NULL) //
+------+
| a    |
+------+
| NULL |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1() //
+------+
| a    |
+------+
| NULL |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT f1(NULL) //
+----------+
| f1(NULL) |
+----------+
| NULL     |
+----------+
1 row in set (0.00 sec)

greatsql> SELECT f1() //
+------+
| f1() |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```

- 2. Example 2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(a DATE DEFAULT NOW()) AS
BEGIN
  SELECT a;
END; //

greatsql> CREATE OR REPLACE FUNCTION f1(a DATE DEFAULT NOW()) RETURN DATE DETERMINISTIC AS
BEGIN
  RETURN a;
END; //

greatsql> CALL p1(NOW()) //
+------------+
| a          |
+------------+
| 2023-12-04 |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected, 1 warning (0.00 sec)

greatsql> CALL p1() //
+------------+
| a          |
+------------+
| 2023-12-04 |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected, 1 warning (0.00 sec)

greatsql> SELECT f1(NOW()) //
+------------+
| f1(NOW())  |
+------------+
| 2023-12-04 |
+------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SELECT f1() //
+------------+
| f1()       |
+------------+
| 2023-12-04 |
+------------+
1 row in set, 1 warning (0.00 sec)
```

- 3. Example 3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p2(a DATE DEFAULT NOW(), b DATE DEFAULT NOW()) AS
BEGIN
  SELECT a;
  SELECT b;
END; //

greatsql> CALL p1(a=>'2023-10-23') //
+------------+
| a          |
+------------+
| 2023-10-23 |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
