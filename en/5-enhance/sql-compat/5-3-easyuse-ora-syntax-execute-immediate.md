# Oracle Compatibility - Syntax - EXECUTE IMMEDIATE
---

## 1. Syntax

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

When `sql_mode` is switched to `ORACLE` mode, the following usage is supported in stored procedures:

```sql
bulk_collect_into_clause ::=

BULK COLLECT INTO { collection | :host_array }
  [, { collection | :host_array } ]...
```

## 2. Definition and Usage

`EXECUTE IMMEDIATE` is used to dynamically execute SQL statements. It first saves a SQL command in a string, and then dynamically executes the SQL statement in the string through the `EXECUTE IMMEDIATE` command, so as to dynamically generate SQL statements.

The following points should be noted when using `EXECUTE IMMEDIATE`:

- 1. The `USING` parameter supports expressions as prepared variables.
- 2. The `USING OUT` / `USING IN OUT` parameters support assigning values to variables.
- 3. `INTO` is supported to assign the returned result to a variable.
- 4. Variables can be used in the `DYNAMIC_SQL_STMT` clause.
- 5. Syntax containing `INTO` is not supported in the `DYNAMIC_SQL_STMT` clause.

Differences between GreatSQL and Oracle and other notes:

- The `DYNAMIC_SQL_STMT` clause does not support running anonymous stored procedures (for example: `BEGIN SELECT :1, :2; END;`).

- In Oracle, when used as `USING OUT`, the syntax `USING OUT TO_CHAR(...)` is allowed to run but causes the Oracle session to disconnect. Therefore, if stored procedure assignment with `USING OUT` support is needed, only variables or system variables can be used as parameters.

```sql
> EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT var;  <--allowed
> EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT @var; <--allowed
> EXECUTE IMMEDIATE 'CALL p1(?)' USING OUT TO_CHAR(@var); <-- prohibited
```

- The statement `USING OUT` is treated as `USING IN OUT`.
 
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

In GreatSQL, this mode of execution is allowed, while in Oracle it reports an error, requiring `USING IN OUT var` or `USING IN var`:

```sql
> EXECUTE IMMEDIATE 'SELECT ?' USING OUT a;  
ERROR HY000: Incorrect arguments to using OUT param var only use for call
```

The above SQL command will cause an error when run in GreatSQL.

- Using both `USING IN OUT` and `INTO` is undefined behavior; `OUT` may not be assigned correctly.

- When using the `USING` field, if the prepared data content needs to be judged according to the data type, the string type is used by default, and some functions require type conversion before they can be used.
   
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

## 3. Examples

First create the basic test table t1:
```sql
greatsql> DROP TABLE IF EXISTS t1;
greatsql> CREATE TABLE IF NOT EXISTS t1
(
id INT UNSIGNED NOT NULL AUTO_INCREMENT,
a INT,
PRIMARY KEY(id));
```

- Supports `DDL`, `DML`, and `TCL` (transaction control language) statements.

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
 
- Supports `SET` to assign temporary variables.

```sql
EXECUTE IMMEDIATE 'SET @param=(SELECT a FROM t1 LIMIT 1);';
SELECt @param;
```
 
- Supports binding parameters and expressions with `USING`.

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

-- Switch sql_mode to ORACLE
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

- Supports using EXECUTE IMMEDIATE in stored procedures.

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

- Calling stored procedures.

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

-- Note that after adding the OUT keyword compared with the example above, the returned result differs
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

- Variables as statements.

```sql
greatsql> SET @v = 'SELECT "GreatSQL"';

greatsql> EXECUTE IMMEDIATE @v;
+----------+
| GreatSQL |
+----------+
| GreatSQL |
+----------+
```

- Supports variables in stored procedures as statements.

```sql
-- Switch sql_mode to ORACLE
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

- Supports obtaining query results with `INTO/BULK COLLECT INTO`.

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

- Using undefined parameters is not supported.
```sql
greatsql> CREATE TABLE t3 (a INT DEFAULT 10);
greatsql> EXECUTE IMMEDIATE 'INSERT INTO t3 VALUES (?)' USING DEFAULT;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '' at line 1
```

- Database switching statements are not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'USE greatsql;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
  ```

- Creating/dropping stored procedures is not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'CREATE PROCEDURE p5(x int) BEGIN SET @a = x; END;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> EXECUTE IMMEDIATE 'drop PROCEDURE p1;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- Creating/dropping functions is not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'CREATE FUNCTION f1(a int) RETURNS INT BEGIN RETURN a * 10; END;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> EXECUTE IMMEDIATE 'DROP FUNCTION f1;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- Creating/dropping triggers is not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'CREATE TRIGGER trig1 BEFORE INSERT ON t1 FOR EACH ROW SET @sum = @sum + NEW.c0;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> EXECUTE IMMEDIATE 'drop TRIGGER IF EXISTS trig1;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- Using handler is not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'handler test_number open;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```
- Starting a transaction is not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'START TRANSACTION;';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

- Statements containing INTO are not supported.

```sql
greatsql> EXECUTE IMMEDIATE 'SELECT 1 INTO @v;';
ERROR HY000: Misplaced INTO clause, INTO is not allowed inside EXECUTE IMMEDIATE query string
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
