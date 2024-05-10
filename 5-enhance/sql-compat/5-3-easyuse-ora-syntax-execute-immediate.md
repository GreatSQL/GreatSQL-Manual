# Oracle兼容-语法-EXECUTE IMMEDIATE
---


## 1. 语法

```sql
EXECUTE IMMEDIATE dynamic_sql_stmt
  [ { into_clause  | bulk_collect_into_clause } [ using_clause ]
  | using_clause 
  ] ;
```

```sql
using_clause ::= 

USING [ IN | OUT | IN OUT ] bind_argument
  [ [,] [ [ IN | OUT | IN OUT ] bind_argument ]...
 
```

```sql
into_clause ::=

 INTO { variable [, variable ]... | record ) 
```

当 `sql_mode` 切换到 `ORACLE` 模式下时，在存储过程中支持如下用法：

```sql
bulk_collect_into_clause ::=

BULK COLLECT INTO { collection | :host_array }
  [, { collection | :host_array } ]...
```

## 2. 定义和用法

`EXECUTE IMMEDIATE` 用于动态执行SQL语句，是指先把一个SQL命令保存到一个字符串中，然后通过 `EXECUTE IMMEDIATE` 命令动态执行字符串中的SQL语句，以实现SQL语句的动态生成。


`EXECUTE IMMEDIATE` 使用时有以下几点注意事项：

- 1. 参数 `USING` 支持使用表达式作为预处理变量。
- 2. 参数 `USING OUT` / `USING IN OUT` 支持对变量进行赋值。
- 3. 支持使用 `INTO` 将返回结果赋给变量。
- 4. 在 `DYNAMIC_SQL_STMT` 子句中支持使用变量。
- 5. 在 `DYNAMIC_SQL_STMT` 子句中不支持含有 `INTO` 的语法。


在GreatSQL和Oracle中的差异点及其他注意事项：

- `DYNAMIC_SQL_STMT` 子句不支持匿名存储过程（例如：`BEGIN SELECT :1, :2; END;`）运行。

- 在Oracle中，作为 `USING OUT` 时在语法上允许 `USING OUT TO_CHAR(...)` 这种语句运行，但会导致Oracle单个进程断开连接，因此如果用到需要 `USING OUT` 支持存储过程赋值的情况，将会限制只能使用变量或者系统变量作为参数。

```sql
> EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT var;  <--允许
> EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT @var; <--允许
> EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT TO_CAHR(@var); <-- 被禁止
```

- 语句 `USING OUT` 将被视为 `USING IN OUT`。
 
```sql
greatsql> DROP PROCEDURE IF EXISTS p1;
greatsql> DELIMITER //
greatsql> CREATE PROCEDURE IF NOT EXISTS p1(i INT)
AS
 BEGIN
  i:= 10;
END;

EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT a; 
```

在GreatSQL中允许这种方式运行，而在Oracle中会报错，要求 `USING IN OUT var` 或者 `USING IN var`; 

```sql
> EXECUTE IMMEDIATE 'SELECT ?' USING OUT a;  
ERROR HY000: Incorrect arguments to using OUT param var only use for call
```

上述SQL命令在GreatSQL运行时将会引发报错。

- 同时使用 `USING IN OUT` 与 `INTO` 属于未定义行为，`OUT` 不一定能够正确赋值。

- 在使用 `USING` 字段的时候，预处理的数据内容需要根据数据类型进行判断的时候，默认将会使用字符串类型，部分函数需要类型转换后才可以使用。
   
```sql
greatsql> DELIMITER //
greatsql> DECLARE
     v DATETIME;
 BEGIN
      v:= TO_DATE('22:31:23', 'HH24:MI:SS');
     EXECUTE IMMEDIAtE 'SELECT TO_ChAR(?, ''HH24:MI'')' USING v;
END; //
 
ERROR 3064 (HY000): Incorrect type for argument args 0 in function to_char.
 
greatsql> DELIMITER //
greatsql> DECLARE
    v DATETIME;
BEGIN
    v:= TO_DATE('22:31:23', 'hh24:mi:ss');
    EXECUTE IMMEDIATE 'SELECT TO_CHAR(CAST( ? AS DATETIME) , ''hh24:mi'')' USING v;
END; //
+-------------------------------------------+
| TO_CHAR(CAST( ? AS DATETIME) , 'hh24:mi') |
+-------------------------------------------+
| 22:31                                     |
+-------------------------------------------+
```


## 3. 示例

先创建基本测试表t1：
```sql
greatsql> DROP TABLE IF EXISTS t1;
greatsql> CREATE TABLE IF NOT EXISTS t1
(
id INT UNSIGNED NOT NULL AUTO_INCREMENT,
a INT,
PRIMARY KEY(id));
```

- 支持`DDL`、`DML`、`TCL`（事务控制语言）语句。

```sql
EXECUTE IMMEDIATE 'CREATE  TABLE t1 (a INT DEFAULT 10, b varchar(255) NOT NULL DEFAULT 1);';
EXECUTE IMMEDIATE 'DROP TABLE IF EXISTS t1;';
EXECUTE IMMEDIATE 'ALTER TABLE \`t1\` ADD COLUMN \`b\` varchar(255) NOT NULL DEFAULT 1;';
EXECUTE IMMEDIATE 'CREATE VIEW  v1 AS SELECT * FROM t1;';
EXECUTE IMMEDIATE 'DROP VIEW IF EXISTS v1;';
EXECUTE IMMEDIATE 'ALTER TABLE t1 ADD INDEX k1 (a) ;';
EXECUTE IMMEDIATE 'DROP INDEX k1 ON t1;';

EXECUTE IMMEDIATE 'INSERT INTO t1 VALUES (2,3)';
EXECUTE IMMEDIATE 'UPDATE t1 SET a=3 WHERE a=2;';
EXECUTE IMMEDIATE 'DELETE FROM t1 WHERE a=2;';
EXECUTE IMMEDIATE 'SELECT * FROM t1;';
EXECUTE IMMEDIATE 'ROLLBACK';
EXECUTE IMMEDIATE 'COMMIT;';
```
 
- 支持 `SET` 赋值临时变量。

```sql
EXECUTE IMMEDIATE 'SET @param=(SELECT a FROM t1 LIMIT 1);';
SELECt @param;
```
 
- 支持利用 `USING` 绑定参数与表达式。

```sql
greatsql> SET @a=1;
greatsql> EXECUTE IMMEDIATE 'INSERT INTO t1 VALUES (?,1)' USING @a;
Query OK, 1 row affected (0.00 sec)

greatsql> EXECUTE IMMEDIATE 'SELECT ?' USING TO_CHAR(1);
+------+
| ?    |
+------+
| 1    |
+------+

-- 切换sql_mode为ORACLE
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
greatsql> DECLARE
 v1 INT:= 2;
BEGIN
 EXECUTE IMMEDIATE 'SELECT ?' USING v1;
END; //
+------+
| ?    |
+------+
|    2 |
+------+
```

- 支持存储过程中使用 EXECUTE IMMEDIATE。

```sql
greatsql> DROP PROCEDURE IF EXISTS p1;
greatsql> DELIMITER //
CREATE PROCEDURE IF NOT EXISTS p1 (x int)
BEGIN
 SET @a = x;
 EXECUTE IMMEDIATE 'SELECT * FROM t1 WHERE a = ?;' USING @a;
 EXECUTE IMMEDIATE 'ALTER TABLE \`t1\` add column \`c\` VARCHAR(255) NOT NULL DEFAULT 123456;';
 EXECUTE IMMEDIATE 'SELECT * FROM t1 WHERE a = ?;' USING @a;
END; //

greatsql> CALL p1(1); //
+----+------+
| id | a    |
+----+------+
|  1 |    1 |
+----+------+
1 row in set (0.00 sec)

+----+------+--------+
| id | a    | c      |
+----+------+--------+
|  1 |    1 | 123456 |
+----+------+--------+
```

- 调用存储过程。

```sql
greatsql> DROP PROCEDURE IF EXISTS p2;
greatsql> DELIMITER //
greatsql> CREATE PROCEDURE IF NOT EXISTS p2(OUT a INT)
BEGIN
 SET a:= 10;
 SELECT CONCAT("IN a=", a);
END; //

greatsql> DELIMITER ;
greatsql> SET @a = 2;
greatsql> EXECUTE IMMEDIATE 'CALL p2(?)' USING @a;
+--------------------+
| CONCAT("IN a=", a) |
+--------------------+
| IN a=10            |
+--------------------+

greatsql> SELECT @a;
+------+
| @a   |
+------+
|    2 |
+------+

-- 注意和上例多了个 OUT 关键字后，返回结果不同
greatsql> EXECUTE IMMEDIATE 'CALL p2(?)' USING OUT @a;
+--------------------+
| CONCAT("IN a=", a) |
+--------------------+
| IN a=10            |
+--------------------+

greatsql> SELECT @a;
+------+
| @a   |
+------+
|   10 |
+------+

greatsql> DROP PROCEDURE IF EXISTS p2;
```

- 变量作为语句。

```sql
greatsql> SET @v = 'SELECT "GreatSQL"';

greatsql> EXECUTE IMMEDIATE @v;
+----------+
| GreatSQL |
+----------+
| GreatSQL |
+----------+
```

- 支持存储过程中的变量作为语句。

```sql
-- 切换sql_mode为ORACLE
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
greatsql> DECLARE 
 v VARCHAR(200);
BEGIN 
 v:= 'SELECT \'GreatSQL\', ' || TO_CHAR(3306);

 EXECUTE IMMEDIATE v;
END; //

+----------+------+
| GreatSQL | 3306 |
+----------+------+
| GreatSQL | 3306 |
+----------+------+
```

- 支持用 `INTO/BULK COLLECT INTO` 获取查询结果。

```sql
greatsql> EXECUTE IMMEDIATE 'SELECT \'GreatSQL\'' INTO @v;

greatsql> SELECT @v;
+----------+
| @v       |
+----------+
| GreatSQL |
+----------+

greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
greatsql> DECLARE
 v1 INT := 2;
BEGIN
 EXECUTE IMMEDIATE 'SELECT ?' INTO v1 USING 1;
 SELECT v1;
END; //

+------+
| v1   |
+------+
|    1 |
+------+

greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
greatsql> DECLARE
 TYPE 1type IS RECORD
 (
  a INT
 );
 TYPE array_param_type IS TABLE OF 1type;
 ary array_param_type;
BEGIN
 EXECUTE IMMEDIATE 'SELECT a FROM t1' BULK COLLECT INTO ary;
 SELECT ary;
END; //

+----------------------------+
| ary                        |
+----------------------------+
| ARRAY_PARAM_TYPE(1type(1)) |
+----------------------------+
```

- 不支持使用非定义参数。
```sql
greatsql> CREATE TABLE t3 (a INT DEFAULT 10);
greatsql> EXECUTE IMMEDIATE 'INSERT INTO t3 VALUES (?)' USING DEFAULT;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '' at line 1
```

- 不支持数据库切换语句。

```sql
greatsql> EXECUTE IMMEDIATE 'USE greatsql;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
  ```

- 不支持创建/删除存储过程。

```sql
greatsql> EXECUTE IMMEDIATE 'CREATE PROCEDURE p5(x int) BEGIN SET @a = x; END;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> EXECUTE IMMEDIATE 'drop PROCEDURE p1;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- 不支持创建/删除函数。

```sql
greatsql> EXECUTE IMMEDIATE 'CREATE FUNCTION f1(a int) RETURNS INT BEGIN RETURN a * 10; END;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> EXECUTE IMMEDIATE 'DROP FUNCTION f1;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- 不支持创建/删除触发器。

```sql
greatsql> EXECUTE IMMEDIATE 'CREATE TRIGGER trig1 BEFORE INSERT ON t1 FOR EACH ROW SET @sum = @sum + NEW.c0;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> EXECUTE IMMEDIATE 'drop TRIGGER IF EXISTS trig1;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- 不支持handler使用。

```sql
greatsql> EXECUTE IMMEDIATE 'handler test_number open;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```
- 不支持开始事务操作。

```sql
greatsql> EXECUTE IMMEDIATE 'START TRANSACTION;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- 不支持语句中带有INTO。

```sql
greatsql> EXECUTE IMMEDIATE 'SELECT 1 INTO @v;';
ERROR HY000: Misplaced INTO clause, INTO is not allowed inside EXECUTE IMMEDIATE query string
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
