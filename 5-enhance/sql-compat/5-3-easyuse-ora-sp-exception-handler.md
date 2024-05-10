# Oracle兼容-存储过程-Exception Handler
---


在存储过程/存储函数中，当发生异常时，支持以下几种不同处理方式：

1.  异常处理 `Exception Handler`

2.  异常声明 `Exception Declaration`

3.  抛出异常 `Exception Raise`


## 1. 异常处理 `Exception Handler`

在存储过程/存储函数中，发生异常的原因可能来自于设计错误、编码错误、硬件故障及其他，无法预测所有可能的异常。

但可以针对这些状况，编写异常处理程序，让程序在异常发生时仍可继续运行。

任何语句块都可以有一个异常处理部分，可以有一个或多个异常处理程序。


### 1.1 语法

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

### 1.2 定义和用法

- `exception`：异常名，预定义的异常（见下方表格）或用户定义的异常的名称。

- `OTHERS`：其他异常，在代码块异常处理部分没有明确指定的其他所有异常。
 
- `handler_statement`：异常处理语句，当触发了异常，将会执行指定的处理语句。

- 已预定义好的异常名（表格1）：

| Oracle中的异常名    | GreatSQL是否支持 | 映射到GreatSQL中对应的异常名             |
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

更多预定义的异常错误信息，详见参考：[Server Error Message Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

关于Oracle异常错误，详见参考：[Exception Declaration](https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/exception-declaration.html#GUID-AAC8C54F-775C-4E65-B531-0350CFF5B1BD)

提示：错误号本身不能兼容Oracle，因为它和GreatSQL为各自体系错误信息，不存在复用。


## 2. 异常声明 `Exception Declaration`

### 2.1 语法 


```sql
1. exception_name EXCEPTION

2. PRAGMA EXCEPTION_INIT ( EXCEPTION, ERROR_CODE ) ;
```

#### 2.2 定义

1. 自定义异常名称。只能在 `EXCEPTION_INIT PRAGMA`、`RAISE`、`RAISE_APPLICATION_ERROR` 调用或异常处理程序中使用异常。

```sql
exception_name EXCEPTION
```

2. `EXCEPTION_INIT pragma` 将此名称分配给内部定义的异常。 

```sql
PRAGMA EXCEPTION_INIT ( EXCEPTION, ERROR_CODE ) ;
```

关于 `EXCEPTION_INIT` 的用法可参考下方示例4、示例6。

参考：

- [EXCEPTION_INIT Pragma](https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/EXCEPTION_INIT-pragma.html#GUID-873A087E-A470-4798-9152-16BC673B4940)

- [Overview of Exception Handling](https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/plsql-error-handling.html#GUID-343E0653-9BCE-48F5-A00A-795D77B96B44)
 

## 3. 抛出异常

### 3.1 `RAISE`

#### 3.1.1 语法

```sql
RAISE [ exception ]
```

#### 3.1.2 定义

可以调用 `RAISE` 主动触发抛出异常，在异常处理程序之外，必须指定异常名称。

在异常处理程序中，如果省略异常名称，则该 `RAISE` 语句会重新引发当前异常。
    
- 参数 `exception` 可以是以下两种
  - 1. 预定义异常名称 （见上方所示表格1）。
  - 2. 自定义声明的异常名。 
      
     
调用 `RAISE` 主动抛出异常的行为等同于 `SIGNAL Statement`，可用的溢出与禁止使用的错误号详见文档：[SIGNAL Statement](https://dev.mysql.com/doc/refman/8.0/en/signal.html)。
 
关于 `RAISE exception` 的用法可参考下方示例3、示例4。

### 3.2  RAISE_APPLICATION_ERROR

#### 3.2.1 语法

```sql
RAISE_APPLICATION_ERROR (ERROR_CODE, MESSAGE)
```

#### 3.2.2 定义

利用 `RAISE_APPLICATION_ERROR` 可以主动抛出自定义错误。

 参数| 定义 
 --- | ----
 ERROR_CODE | SMALLINT UNSIGNED 
 MESSAGE | VARCHAR(128)
      
关于 `RAISE_APPLICATION_ERROR` 的用法可参考下方示例5。


## 4. 示例

创建测试表并初始化数据

```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. 示例1，使用预定义异常 `TOO_MANY_ROWS`、`NO_DATA_FOUND`

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

- 2. 示例2，处理 `OTHERS` 异常

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

- 3. 示例3，调用 `RAISE` 抛出异常

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE exception_sp3() AS
BEGIN
  BEGIN
    SELECT 'Hi GreatSQL';
    -- 通过RAISE直接抛出异常
    RAISE TOO_MANY_ROWS;

  EXCEPTION
  WHEN OTHERS THEN
    SELECT 'GET RAISE EXCEPTION FROM OTHERS AND RAISE' AS ret;
    -- 并且抛出 TOO_MANY_ROWS 异常
    RAISE;
  END;

-- 捕获主动定义的TOO_MANY_ROWS异常 
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

- 4. 示例4，自定义异常

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

- 5. 示例5，自定义异常与消息

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

- 6. 示例6，异常绑定错误号

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



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
