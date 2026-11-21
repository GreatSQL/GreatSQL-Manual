# Oracle Compatibility - Stored Procedure - EXIT WHEN
---


## 1. Syntax

```sql
EXIT (label) / EXIT (label) WHEN
```

## 2. Definition and Usage

GreatSQL stored procedures support using `EXIT (label)/EXIT (label) WHEN` to exit the current loop. The usage is as follows:

1. Exiting can be done with or without a label.

2. Multiple loop exit conditions are supported, including `EXIT WHEN cursor%FOUND / %NOTFOUND / %ISOPEN` and other conditions.


## 3. Examples

Create test tables and initialize data
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. Example 1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_loop1() AS
  CURSOR cur1 IS SELECT a, b FROM t1 WHERE a>1;
BEGIN
  <<forLoop>>
  FOR rec IN cur1 LOOP
    SELECT rec.a ,rec.b; 
    EXIT;   -- Exit after looping only once
  END LOOP forLoop;
  SELECT 'AFTER LOOP';
END; //

greatsql> CALL sp_loop1() //
+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     2 | row2  |
+-------+-------+
1 row in set (0.00 sec)

+------------+
| AFTER LOOP |
+------------+
| AFTER LOOP |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. Example 2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_loop2() AS
  CURSOR cur1 IS SELECT a, b FROM t1 WHERE a>1;
BEGIN
  <<forLoop>>
  FOR rec IN  cur1 LOOP
    EXIT forLoop;   -- Exit directly if the loop never succeeds
    SELECT rec.a ,rec.b; 
  END LOOP forLoop;
  SELECT 'AFTER LOOP';
END; //

greatsql> CALL sp_loop2() //
+------------+
| AFTER LOOP |
+------------+
| AFTER LOOP |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_loop3() AS
  CURSOR cur1 IS SELECT a, b FROM t1;
BEGIN
  <<forLoop>>
  FOR rec IN  cur1 LOOP
     SELECT rec.a ,rec.b; 
     EXIT when cur1%NOTFOUND;
  END LOOP forLoop;
  SELECT 'AFTER LOOP';
END; //

greatsql> CALL sp_loop3() //
+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     1 | row1  |
+-------+-------+
1 row in set (0.00 sec)

+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     2 | row2  |
+-------+-------+
1 row in set (0.00 sec)

+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     3 | row3  |
+-------+-------+
1 row in set (0.01 sec)

+------------+
| AFTER LOOP |
+------------+
| AFTER LOOP |
+------------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

- 4. Example 4

```
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_loop4() AS
  CURSOR cur1 IS SELECT a, b FROM t1;
BEGIN
  <<forLoop>>
  FOR rec IN  cur1 LOOP
    SELECT rec.a ,rec.b; 
    EXIT forLoop when cur1%NOTFOUND;
  END LOOP forLoop;
  SELECT 'AFTER LOOP';
END; //

greatsql> CALL sp_loop4() //
+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     1 | row1  |
+-------+-------+
1 row in set (0.00 sec)

+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     2 | row2  |
+-------+-------+
1 row in set (0.00 sec)

+-------+-------+
| rec.a | rec.b |
+-------+-------+
|     3 | row3  |
+-------+-------+
1 row in set (0.00 sec)

+------------+
| AFTER LOOP |
+------------+
| AFTER LOOP |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```







**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
