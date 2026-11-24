# Oracle Compatibility - Stored Procedure - CONTINUE
------

## Syntax

```sql
SET sql_mode = ORACLE;
CONTINUE [ LABEL ] [ WHEN boolean_expression ] ;
```

## Definition and Usage
GreatSQL supports using `CONTINUE` in stored procedures to jump to the beginning of a `LOOP` or the `LABEL` position at the beginning of a `LOOP`, continuing the loop directly from the next iteration.

This usage can only be applied to `LOOP` loops in stored procedures, including `FOR LOOP`, `WHILE LOOP` and `LOOP .. END LOOP`.

Note: Stored procedure `LABEL` does not support the following keywords: `EXECUTE, RESTART, SHUTDOWN, ASCII, BYTE, CHARSET, COMMENT, COMPRESSION_DICTIONARY, CONTAINS, LANGUAGE, NO, SIGNED, SLAVE, UNICODE`.

## Oracle Compatibility Notes

GreatSQL's `CONTINUE` usage is consistent with Oracle.

1. `CONTINUE [ LABEL ]`: If there is no label, the `CONTINUE` statement jumps directly to the next iteration of the loop. If a label is added, the `CONTINUE` statement jumps to the next iteration of the loop identified by the label.

2. `CONTINUE [ LABEL ] WHEN`: If there is no `WHEN` clause, the `CONTINUE` statement exits the current loop directly. If a `WHEN` clause is added, the `CONTINUE` statement exits the current loop only when the value of the "boolean_expression" expression is "TRUE".

3. For multiple nested `FOR i IN (select_stmt) LOOP` and `FOR i IN cursor LOOP` loops, `CONTINUE` jumps to the beginning of any previous N-th level loop. The cursor between the current level and the N-th level will execute the `CLOSE cursor` operation, so the next iteration is not affected. However, a cursor that has executed `OPEN cursor` in between will not execute the `CLOSE cursor` operation again. The `CLOSE cursor` operation is also executed for `OPEN CURSOR FOR sys_refcursor`. For details, see [Example 1](#example-1-for-cursor-loop) below.

4. `CONTINUE` can only be used in `FOR ... LOOP` loops.

## Examples

Create test tables and initialize data

```sql
greatsql> DROP TABLE IF EXISTS t1, t2;

greatsql> CREATE TABLE IF NOT EXISTS t1(id INT NOT NULL, c1 VARCHAR(100) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3, 'row3');

greatsql> CREATE TABLE IF NOT EXISTS t2(id INT NOT NULL, c1 VARCHAR(100) NOT NULL);
greatsql> INSERT INTO t2 VALUES(10, 'row10'), (20, 'row20'), (30, 'row30');
```

### Example 1: FOR ... CURSOR LOOP

```sql
greatsql> SET sql_mode = ORACLE; SET udt_format_result = 'DBA';
greatsql> DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
  CURSOR cur1  IS SELECT * FROM t1 WHERE id < 3;
  CURSOR cur21 IS SELECT * FROM t2 WHERE id < 30;
  CURSOR cur22 IS SELECT * FROM t2 WHERE id < 30;
  cur3 sys_refcursor;
begin
  <<label1>>
  FOR i IN cur1 LOOP
    SELECT i;
    <<label2>>
    FOR j IN cur21 LOOP
      SELECT j;
      CONTINUE label1;
      -- The current logic jumps to the beginning of the label1 loop. Before jumping out, cur21 is CLOSEd first, so the next execution of the label2 loop is not affected.
      -- 1. If OPEN cur22 is added, the next loop will raise an error, because cur22 has already been OPENed (it cannot be OPENed twice).
      -- 2. If changed to CONTINUE (without LABEL), the next loop will continue from label2.
      -- 3. If changed to CONTINUE label2 WHEN j.id = 2, it will jump to the beginning of the label2 loop when the condition is met.
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;

greatsql> CALL p1();
+----------------+
| i              |
+----------------+
| id:1 | c1:row1 |
+----------------+
1 row in set (0.01 sec)

+------------------+
| j                |
+------------------+
| id:10 | c1:row10 |
+------------------+
1 row in set (0.01 sec)

+----------------+
| i              |
+----------------+
| id:2 | c1:row2 |
+----------------+
1 row in set (0.01 sec)

+------------------+
| j                |
+------------------+
| id:10 | c1:row10 |
+------------------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

### Example 2: `FOR select_stmt LOOP`

```
greatsql> SET sql_mode = ORACLE; SET udt_format_result = 'DBA';
greatsql> DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
  CURSOR cur1 IS SELECT * FROM t1 WHERE id < 3;
  CURSOR cur2 IS SELECT * FROM t2 WHERE id < 30;
BEGIN
  <<label1>>
  FOR i IN (SELECT * FROM t1 WHERE id < 3) LOOP
    SELECT i;
    <<label2>>
    FOR j IN (SELECT * FROM t2 WHERE id < 30) LOOP
      SELECT j;
      CONTINUE WHEN j.id = 10;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;

greatsql> CALL p1();
+----------------+
| i              |
+----------------+
| id:1 | c1:row1 |
+----------------+
1 row in set (0.00 sec)

+------------------+
| j                |
+------------------+
| id:10 | c1:row10 |
+------------------+
1 row in set (0.00 sec)

+------------------+
| j                |
+------------------+
| id:20 | c1:row20 |
+------------------+
1 row in set (0.00 sec)

+----------------+
| AFTER CONTINUE |
+----------------+
| AFTER CONTINUE |
+----------------+
1 row in set (0.00 sec)

+----------------+
| i              |
+----------------+
| id:2 | c1:row2 |
+----------------+
1 row in set (0.00 sec)

+------------------+
| j                |
+------------------+
| id:10 | c1:row10 |
+------------------+
1 row in set (0.00 sec)

+------------------+
| j                |
+------------------+
| id:20 | c1:row20 |
+------------------+
1 row in set (0.00 sec)

+----------------+
| AFTER CONTINUE |
+----------------+
| AFTER CONTINUE |
+----------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

### Example 3: `FOR i IN ... LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
  ret VARCHAR(100);
BEGIN
  <<label1>>
  FOR i IN 1..2 LOOP
    SELECT i;
    <<label2>>
    FOR j IN 10 .. 12 LOOP
      SELECT j;
      CONTINUE label1;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;

greatsql> CALL p1();
+------+
| i    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+------+
| j    |
+------+
|   10 |
+------+
1 row in set (0.00 sec)

+------+
| i    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| j    |
+------+
|   10 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

### Example 4: `WHILE ... LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
  ret VARCHAR(100);
  c1 INT := 0;
  c2 INT := 0;
BEGIN
  <<label1>>
  WHILE c1<2 LOOP
    c1 := c1 + 1;
    SELECT c1;
    <<label2>>
    WHILE c2 < 4 LOOP
      c2 := c2 + 1;
      SELECT c2;
      CONTINUE WHEN c2 = 2;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;

greatsql> CALL p1();
+------+
| c1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+------+
| c2   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+----------------+
| AFTER CONTINUE |
+----------------+
| AFTER CONTINUE |
+----------------+
1 row in set (0.00 sec)

+------+
| c2   |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| c2   |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+----------------+
| AFTER CONTINUE |
+----------------+
| AFTER CONTINUE |
+----------------+
1 row in set (0.00 sec)

+------+
| c2   |
+------+
|    4 |
+------+
1 row in set (0.00 sec)

+----------------+
| AFTER CONTINUE |
+----------------+
| AFTER CONTINUE |
+----------------+
1 row in set (0.00 sec)

+------+
| c1   |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

### Example 5: `LOOP ... END LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
  ret VARCHAR(100);
  c1 INT := 0;
  c2 INT := 0;
BEGIN
  <<label1>>
  LOOP
    c1 := c1 + 1;
    SELECT c1;
    EXIT WHEN c1 = 2;
    <<label2>>
    LOOP
      c2 := c2 + 1;
      SELECT c2;
      EXIT WHEN c2 = 3;
      CONTINUE label1 WHEN c2 = 2;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;

greatsql> CALL p1();
+------+
| c1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+------+
| c2   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+----------------+
| AFTER CONTINUE |
+----------------+
| AFTER CONTINUE |
+----------------+
1 row in set (0.00 sec)

+------+
| c2   |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| c1   |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

### Example 6: `CONTINUE` is not supported outside `LOOP` blocks

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
BEGIN
  <<label1>>
  CONTINUE;
END //
DELIMITER ;
ERROR 1235 (42000): This version of MySQL doesn't yet support 'CONTINUE clause without loop statement'
```



**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
