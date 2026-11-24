# Oracle Compatibility - Stored Procedure - Exception Handler
---


In stored procedures/functions, when an exception occurs, the following different handling methods are supported:

1. Exception handling `Exception Handler`

2. Exception declaration `Exception Declaration`

3. Raising exceptions `Exception Raise`


## 1. Exception Handler

In stored procedures/functions, the causes of exceptions may come from design errors, coding errors, hardware failures and others; it is impossible to predict all possible exceptions.

However, exception handling programs can be written for these situations so that the program can continue running when an exception occurs.

Any statement block can have an exception handling section, with one or more exception handlers.


### 1.1 Syntax

```sql
1. WHEN { exception [ OR exception2 ]... | OTHERS }
  THEN handler_statement [ handler_statement2 ]...
END;

2. EXCEPTION
  WHEN exception THEN handler_statement                    -- Exception handler1
  WHEN exception2 OR exception3 THEN handler_statement2    -- Exception handler2
  WHEN OTHERS THEN handler_statement3                      -- Exception handler3
END;


```

### 1.2 Definition and Usage

- `exception`: the exception name, either a predefined exception (see the table below) or a user-defined exception name.

- `OTHERS`: other exceptions, i.e., all exceptions not explicitly specified in the exception handling section of the code block.
 
- `handler_statement`: the exception handling statement. When an exception is triggered, the specified handling statement is executed.

- Predefined exception names (Table 1):

| Oracle exception name | Supported by GreatSQL | Mapped exception name in GreatSQL |
| ----------------------- | -------- | -------------------------- |
| NO_DATA_FOUND           | Y        | ER_SP_FETCH_NO_DATA        |
| INVALID_CURSOR          | Y        | ER_SP_CURSOR_NOT_OPEN      |
| DUP_VAL_ON_INDEX        | Y        | ER_DUP_ENTRY               |
| DUP_VAL_ON_INDEX        | Y        | ER_DUP_ENTRY_WITH_KEY_NAME |
| TOO_MANY_ROWS           | Y        | ER_TOO_MANY_ROWS           |
| INVALID_NUMBER          | Y        | ER_DATA_OUT_OF_RANGE       |
| CURSOR_ALREADY_OPEN     | Y        | ER_SP_CURSOR_ALREADY_OPEN  |
| VALUE_ERROR             | Y        | ER_WRONG_VALUE             |
| STORAGE_ERROR           | Y        | ER_GET_ERRNO               |
| ZERO_DIVIDE             | Y        | ER_DIVISION_BY_ZERO        |
| ACCESS_INTO_NULL        | N        |                            |
| CASE_NOT_FOUND          | N        |                            |
| COLLECTION_IS_NULL      | N        |                            |
| LOGIN_DENIED            | N        |                            |
| NO_DATA_NEEDED          | N        |                            |
| NOT_LOGGED_ON           | N        |                            |
| PROGRAM_ERROR           | N        |                            |
| ROWTYPE_MISMATCH        | N        |                            |
| SELF_IS_NULL            | N        |                            |
| SUBSCRIPT_BEYOND_COUNT  | N        |                            |
| SUBSCRIPT_OUTSIDE_LIMIT | N        |                            |
| SYS_INVALID_ROWID       | N        |                            |
| TIMEOUT_ON_RESOURCE     | N        |                            |

For more predefined exception error information, see: [Server Error Message Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

For Oracle exception errors, see: [Exception Declaration](https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/exception-declaration.html#GUID-AAC8C54F-775C-4E65-B531-0350CFF5B1BD)

Note: The error numbers themselves cannot be compatible with Oracle, because they and GreatSQL are separate error message systems and cannot be reused.


## 2. Exception Declaration

### 2.1 Syntax


```sql
1. exception_name EXCEPTION

2. PRAGMA EXCEPTION_INIT ( EXCEPTION, ERROR_CODE ) ;
```

#### 2.2 Definition

1. Custom exception names. Exceptions can only be used in `EXCEPTION_INIT PRAGMA`, `RAISE`, `RAISE_APPLICATION_ERROR` calls, or exception handlers.

```sql
exception_name EXCEPTION
```

2. The `EXCEPTION_INIT pragma` assigns this name to an internally defined exception. 

```sql
PRAGMA EXCEPTION_INIT ( EXCEPTION, ERROR_CODE ) ;
```

For the usage of `EXCEPTION_INIT`, see Example 4 and Example 6 below.

References:

- [EXCEPTION_INIT Pragma](https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/EXCEPTION_INIT-pragma.html#GUID-873A087E-A470-4798-9152-16BC673B4940)

- [Overview of Exception Handling](https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/plsql-error-handling.html#GUID-343E0653-9BCE-48F5-A00A-795D77B96B44)
 

## 3. Raising Exceptions

### 3.1 `RAISE`

#### 3.1.1 Syntax

```sql
RAISE [ exception ]
```

#### 3.1.2 Definition

`RAISE` can be called to actively trigger an exception. Outside an exception handler, the exception name must be specified.

Inside an exception handler, if the exception name is omitted, the `RAISE` statement re-raises the current exception.
    
- The parameter `exception` can be either of the following:
  - 1. A predefined exception name (see Table 1 above).
  - 2. A user-declared exception name. 
      
     
Calling `RAISE` to actively raise an exception is equivalent to the `SIGNAL Statement`. For the available and prohibited error numbers, see: [SIGNAL Statement](https://dev.mysql.com/doc/refman/8.0/en/signal.html).
 
For the usage of `RAISE exception`, see Example 3 and Example 4 below.

### 3.2 RAISE_APPLICATION_ERROR

#### 3.2.1 Syntax

```sql
RAISE_APPLICATION_ERROR (ERROR_CODE, MESSAGE)
```

#### 3.2.2 Definition

`RAISE_APPLICATION_ERROR` can be used to actively raise a custom error.

 Parameter| Definition 
 --- | ---- 
 ERROR_CODE | SMALLINT UNSIGNED 
 MESSAGE | VARCHAR(128)
      
For the usage of `RAISE_APPLICATION_ERROR`, see Example 5 below.


## 4. Examples

Create test tables and initialize data

```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. Example 1: use the predefined exceptions `TOO_MANY_ROWS` and `NO_DATA_FOUND`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp1(n INT, ret OUT VARCHAR(50)) AS
  a INT;
BEGIN
  SELECT a INTO a FROM t1 LIMIT n;

  EXCEPTION
  WHEN TOO_MANY_ROWS THEN
    SET ret = '--- TOO_MANY_ROWS cought ---';
  WHEN NO_DATA_FOUND THEN
    SET ret = '--- NO_DATA_FOUND cought ---';
END; //

greatsql> SET @ret = ''; CALL exception_sp1(0, @ret); SELECT @ret //
Query OK, 0 rows affected (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

+------------------------------+
| @ret                         |
+------------------------------+
| --- NO_DATA_FOUND cought --- |
+------------------------------+
1 row in set (0.00 sec)

greatsql>
greatsql> SET @ret = ''; CALL exception_sp1(1, @ret); SELECT @ret //
Query OK, 0 rows affected (0.00 sec)

Query OK, 1 row affected (0.00 sec)

+------+
| @ret |
+------+
| NULL |
+------+
1 row in set (0.00 sec)

greatsql>
greatsql> SET @ret = ''; CALL exception_sp1(2, @ret); SELECT @ret //
Query OK, 0 rows affected (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

+------------------------------+
| @ret                         |
+------------------------------+
| --- TOO_MANY_ROWS cought --- |
+------------------------------+
1 row in set (0.00 sec)
```

- 2. Example 2: handle the `OTHERS` exception

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp2(ret OUT VARCHAR(50)) AS
BEGIN
  SELECT 1/0 ;

  EXCEPTION
  WHEN ZERO_DIVIDE THEN
    SET ret = '--- ZERO_DIVIDE cought ---';
  WHEN OTHERS THEN
  SET ret = '--- others cought ---';
END; //

greatsql> SET @ret = ''; CALL exception_sp2(@ret); SELECT @ret //
Query OK, 0 rows affected (0.00 sec)

Empty set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

+----------------------------+
| @ret                       |
+----------------------------+
| --- ZERO_DIVIDE cought --- |
+----------------------------+
1 row in set (0.00 sec)
```

- 3. Example 3: call `RAISE` to raise an exception

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp3() AS
BEGIN
  BEGIN
    SELECT 'Hi GreatSQL';
    -- Raise an exception directly with RAISE
    RAISE TOO_MANY_ROWS;

  EXCEPTION
  WHEN OTHERS THEN
    SELECT 'GET RAISE EXCEPTION FROM OTHERS AND RAISE' AS ret;
    -- And raise the TOO_MANY_ROWS exception
    RAISE;
  END;

-- Catch the manually raised TOO_MANY_ROWS exception 
EXCEPTION
WHEN TOO_MANY_ROWS THEN
    SELECT 'GET TOO_MANY_ROWS FROM MANUALLY RAISE' AS ret;
END; //

greatsql> CALL exception_sp3() //
+-------------+
| Hi GreatSQL |
+-------------+
| Hi GreatSQL |
+-------------+
1 row in set (0.00 sec)

+-------------------------------------------+
| ret                                       |
+-------------------------------------------+
| GET RAISE EXCEPTION FROM OTHERS AND RAISE |
+-------------------------------------------+
1 row in set (0.00 sec)

+---------------------------------------+
| ret                                   |
+---------------------------------------+
| GET TOO_MANY_ROWS FROM MANUALLY RAISE |
+---------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. Example 4: custom exceptions

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp4() AS
  a EXCEPTION;
BEGIN
  DECLARE
    c EXCEPTION;
  BEGIN
    RAISE c;
  EXCEPTION
   WHEN c THEN
     SELECT 'GET c RAISE 1' AS ret;
   RAISE;
  END;

EXCEPTION
WHEN a THEN
  SELECT 'GET a RAISE 2 IS FAILED' AS ret;
WHEN OTHERS THEN
  SELECT 'GET a RAISE OTHERS IS FAILED' AS ret;
END; //


greatsql> CALL exception_sp4() //
+---------------+
| ret           |
+---------------+
| GET c RAISE 1 |
+---------------+
1 row in set (0.00 sec)

+------------------------------+
| ret                          |
+------------------------------+
| GET a RAISE OTHERS IS FAILED |
+------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. Example 5: custom exceptions and messages

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp5() AS
BEGIN
 RAISE_APPLICATION_ERROR(33306, 'GreatSQL exception in sp');
END; //

greatsql> CALL exception_sp5() //
ERROR 33306 (HY000): GreatSQL exception in sp
```

- 6. Example 6: bind an error number to an exception

```
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp6(n INT) AS
  a EXCEPTION;
  b INT;

  PRAGMA EXCEPTION_INIT(a, 1329);
BEGIN
  SELECT a INTO b FROM t1 LIMIT n;
EXCEPTION
  WHEN a THEN
  SELECT '--NO_DATA_FOUND--' AS ret;
  
  WHEN OTHERS THEN
  SELECT 'GET OTHERS' AS ret;
  RAISE;
END; //

greatsql> CALL exception_sp6(0) //
+-------------------+
| ret               |
+-------------------+
| --NO_DATA_FOUND-- |
+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL exception_sp6(1) //
Query OK, 1 row affected (0.00 sec)

greatsql>
greatsql> CALL exception_sp6(2) //
+------------+
| ret        |
+------------+
| GET OTHERS |
+------------+
1 row in set (0.00 sec)

ERROR 1172 (42000): Result consisted of more than one row
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
