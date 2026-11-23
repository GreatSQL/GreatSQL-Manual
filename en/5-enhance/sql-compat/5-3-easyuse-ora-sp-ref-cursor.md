# Oracle Compatibility - Stored Procedure - REF CURSOR, SYS_REFCURSOR
---


## 1. Syntax

```sql
1. var SYS_REFCURSOR

2. TYPE type_name IS REF CURSOR

3. OPEN cursor_name FOR {select_statement | dynamic_string}

4. FOR rows IN
   { 
     ( select_statement )
   }
   LOOP statement... END LOOP [label] ;

5. CREATE [OR REPLACE] sp_name(var_list) RETURN SYS_REFCURSOR AS routine_body

6. CREATE [OR REPLACE] sp_name(var_list) AS routine_body

7. cursor1 := cursor2

8. SELECT cursor1 INTO cursor2
```

## 2. Definition and Usage

In `ORACLE` mode, GreatSQL stored procedures/functions support the following `REF CURSOR, SYS_REFCURSOR` usages:

- 1. Usage 1: the `var SYS_REFCURSOR` syntax is supported to define `SYS_REFCURSOR`.

```sql
var SYS_REFCURSOR
```

- 2. Usage 2: the `TYPE ... IS REF CURSOR` syntax is supported to define `REF CURSOR`.

```sql
TYPE type_name IS REF CURSOR
```

- 3. Usage 3: `OPEN ... FOR` is supported to open a `REF CURSOR`.

```sql
OPEN cursor_name FOR {select_statement | dynamic_string}
```

- 4. Usage 4: `FOR rows IN (select_stmt) LOOP` implicitly creates a `REF CURSOR`; here `rows` does not need to be defined in advance and is only valid within the current `FOR ... LOOP` statement block.

```sql
FOR rows IN
{ 
  ( select_statement )
}
LOOP statement... END LOOP [label] ;
```

For more about `FOR rows IN CURSOR`, refer to: [Oracle Compatibility - Stored Procedure - CURSOR](./5-3-easyuse-ora-sp-cursor.md).


- 5. Usage 5: `FUNCTION RETURN SYS_REFCURSOR` supports a function returning `REF CURSOR` type data. For `FUNCTION`, parameters of `SYS_REFCURSOR` type in variables are not supported.

```sql
CREATE [OR REPLACE] FUNCTION sp_name(var_list) RETURN SYS_REFCURSOR AS routine_body
```

- 6. Usage 6: stored procedure parameters with `OUT SYS_REFCURSOR` are supported, and results of `REF CURSOR` type can be returned.

```sql
CREATE [OR REPLACE] sp_name(var_list) AS routine_body
```

- 7. Usage 7: `REF CURSOR` can be assigned as a parameter; both share a common `REF CURSOR` state. `cursor1` and `cursor2` are both `REF CURSOR` types and share a common `REF CURSOR` state. If one of them executes `OPEN CURSOR FOR` or `CLOSE CURSOR` again, it affects all associated `REF CURSOR`s. If only one of them is assigned a value, it does not affect the other associated `REF CURSOR`s; it only affects other `REF CURSOR`s that are assigned values (see Example 12 below).

```sql
cursor1 := cursor2
```

- 8. Usage 8: the `SELECT cursor1 INTO cursor2` syntax can be used to assign `REF CURSOR`; both share a common `REF CURSOR` state.

```sql
SELECT cursor1 INTO cursor2
```

## 3. Oracle Compatibility Notes

In `ORACLE` mode, the `REF CURSOR, SYS_REFCURSOR` usage in GreatSQL stored procedures/functions is basically consistent with Oracle.

The main compatibility differences in GreatSQL are as follows:

1. `SYS_REFCURSOR` can only be used inside stored procedures/functions, and can also be passed in and output as parameters.

2. Parameters of `REF CURSOR` and `SYS_REFCURSOR` types are also parameters of the stored procedure/function, so parameters with the same name cannot be defined again.

3. If only `REF CURSOR` or `SYS_REFCURSOR` is defined without a specific SQL statement, this cursor cannot be used.

4. The statement `OPEN sp_name FOR` can be used in a `LOOP .. END LOOP` statement block.

5. After `OPEN sp_name FOR`, `OPEN sp_name FOR` can be executed again without closing first, which is different from the `OPEN sp_name` usage.

6. If the cursor `cur1` is not defined, `cur1%ISOPEN` can still be used without error; however, `cur1%FOUND, cur1%NOTFOUND, cur1%ROWCOUNT` report errors.

7. For the parameter `var_name` in `CALL sp1(IN var_name)`, only `FETCH` and `CLOSE` operations can be executed; assignment and `OPEN FOR` operations are not allowed, which is consistent with Oracle behavior.

8. For `var_name` in `CALL sp1(var_name)`, it must be of `REF CURSOR` type, otherwise an error is reported (see Example 11 below).

9. After an associated cursor is closed, in Oracle that cursor cannot be opened again and can only be used for assignment; but in GreatSQL it is allowed to be opened again and assigned again. This is a difference between the two (see Example 13 below).

10. In `ORACLE` mode, the `SELECT` result of a stored function whose result type is `SYS_REFCURSOR` is output as `NULL` (see Example 10 below).

## 4. Examples

Set the `sql_generate_invisible_primary_key` option because the tables created in the following examples have no explicit primary key; disabling this option avoids automatically creating the implicit primary key `my_row_id`, which might affect the following examples.
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

Create test tables and initialize data
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. Example 1: `SYS_REFCURSOR, OPEN CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  cur1 SYS_REFCURSOR;
  sql1 VARCHAR(100);
  rtype t1%ROWTYPE;
BEGIN
  sql1 := 'SELECT * FROM t1';

  OPEN cur1 FOR sql1;

  LOOP
    FETCH cur1 INTO rtype;
  EXIT WHEN cur1%NOTFOUND;

  SELECT rtype.a, rtype.b;
  END LOOP;
END; //

greatsql> CALL p1() //
+---------+---------+
| rtype.a | rtype.b |
+---------+---------+
|       1 | row1    |
+---------+---------+
1 row in set (0.00 sec)

+---------+---------+
| rtype.a | rtype.b |
+---------+---------+
|       2 | row2    |
+---------+---------+
1 row in set (0.00 sec)

+---------+---------+
| rtype.a | rtype.b |
+---------+---------+
|       3 | row3    |
+---------+---------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. Example 2: `SYS_REFCURSOR, OPEN CURSOR FOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  cur1 SYS_REFCURSOR;
  rtype t1%ROWTYPE;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1;

  LOOP
    FETCH cur1 INTO rtype;
  EXIT WHEN cur1%NOTFOUND;

  SELECT rtype.a, rtype.b;
  END LOOP;
END; //

greatsql> CALL p1() //
+---------+---------+
| rtype.a | rtype.b |
+---------+---------+
|       1 | row1    |
+---------+---------+
1 row in set (0.00 sec)

+---------+---------+
| rtype.a | rtype.b |
+---------+---------+
|       2 | row2    |
+---------+---------+
1 row in set (0.00 sec)

+---------+---------+
| rtype.a | rtype.b |
+---------+---------+
|       3 | row3    |
+---------+---------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3: `FOR ident in (SELECT_stmt) LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1() AS
BEGIN
  -- The rtype here is only used inside the current FOR LOOP and is not accessible outside
  FOR rtype in (SELECT * FROM t1) LOOP
    SELECT rtype.a, rtype.b;
  END LOOP;
END; //

greatsql> CALL p1() //
+-----------+-----------+
| rtype.a | rtype.b |
+-----------+-----------+
|         1 | aa        |
+-----------+-----------+
1 row in set (0.02 sec)

+-----------+-----------+
| rtype.a | rtype.b |
+-----------+-----------+
|         2 | bb        |
+-----------+-----------+
1 row in set (0.02 sec)

+-----------+-----------+
| rtype.a | rtype.b |
+-----------+-----------+
|         3 | cc        |
+-----------+-----------+
1 row in set (0.02 sec)

Query OK, 0 rows affected (0.02 sec)

```

- 4. Example 4: `REF CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1() AS
  TYPE dr_CURSOR IS REF CURSOR;
  cur1 dr_CURSOR;
  rtype t1%ROWTYPE;
BEGIN
  -- It can be rewritten as: sql1 := 'SELECT * FROM t1 WHERE a<3';
  -- OPEN cur1 FOR sql1; sql1 must be declared in advance.
  OPEN cur1 FOR SELECT * FROM t1 WHERE a<3;

  LOOP
    FETCH cur1 INTO rtype;
  EXIT WHEN cur1%NOTFOUND;

  SELECT rtype.a, rtype.b;
  END LOOP;
END; //

greatsql> CALL p1() //
+-----------+-----------+
| rtype.a | rtype.b |
+-----------+-----------+
|         1 | aa        |
+-----------+-----------+
1 row in set (0.01 sec)

+-----------+-----------+
| rtype.a | rtype.b |
+-----------+-----------+
|         2 | bb        |
+-----------+-----------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

- 5. Example 5: `duplicate var with declared and FOR LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

use db1;
set sql_mode="oracle";
CREATE TABLE t1 (a INT, b VARCHAR(3));
INSERT INTO t1 VALUES(1,'aa'),(2,'bb'),(3,'cc') ;
DELIMITER //
CREATE OR REPLACE PROCEDURE p1() AS
  rtype int;
BEGIN
  FOR rtype in (SELECT * FROM t1) LOOP
    SELECT rtype.a, rtype.b;
  END LOOP;
 SELECT rtype;
END; //

> CALL p1() //
```

- 6. Example 6: `FUNCTION RETURN SYS_REFCURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE FUNCTION returnaCURSOR RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1 WHERE a < 3;

  RETURN cur1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  a INT;
  b VARCHAR(20);
  c SYS_REFCURSOR;
BEGIN
  c := returnaCURSOR();

  LOOP
    FETCH c INTO a, b;
    EXIT WHEN c%NOTFOUND;
    SELECT a, b;
  END LOOP;

  CLOSE c;
END; //

greatsql> CALL p1() //
+------+------+
| a    | b    |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

+------+------+
| a    | b    |
+------+------+
|    2 | row2 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 7. Example 7: `PROCEDURE WITH OUT SYS_REFCURSOR`

```
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_return(ref_rs OUT SYS_REFCURSOR)
IS
  sql1 VARCHAR(100);
BEGIN
  sql1 := 'SELECT a, b FROM t1 WHERE a > 2';
  OPEN ref_rs FOR sql1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  a INT;
  b VARCHAR(20);
  c SYS_REFCURSOR;
BEGIN
  CALL sp_return(c);

  LOOP
    FETCH c INTO a, b;
    EXIT WHEN c%NOTFOUND;
    SELECT a, b;
  END LOOP;

  CLOSE c;
END; //

greatsql> CALL p1() //
+------+------+
| a    | b    |
+------+------+
|    3 | row3 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 8. Example 8: `SET REF CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE FUNCTION return_cur RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1 WHERE a < 3;

  RETURN cur1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
  a INT;
  b VARCHAR(20);
BEGIN
  cur1 := return_cur();
  cur2 := cur1;

  LOOP
    FETCH cur2 INTO a, b;
    EXIT WHEN cur2%NOTFOUND;
    SELECT a, b;
  END LOOP;
  CLOSE cur2;
END; //

greatsql> CALL p1() //
+------+------+
| a    | b    |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

+------+------+
| a    | b    |
+------+------+
|    2 | row2 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 9. Example 9: `SELECT REF CURSOR INTO REF CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE FUNCTION return_cur RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1 WHERE a < 3;

  RETURN cur1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
  a INT;
  b VARCHAR(20);
BEGIN
  cur1 := return_cur();
  SELECT cur1 INTO cur2;
  LOOP
    FETCH cur2 INTO a, b;
    EXIT WHEN cur2%NOTFOUND;
    SELECT a, b;
  END LOOP;
  CLOSE cur2;
END; //

greatsql> CALL p1() //
+------+------+
| a    | b    |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

+------+------+
| a    | b    |
+------+------+
|    2 | row2 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 10. Example 10: `SELECT SYS_REFCURSOR FUNCTION`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE FUNCTION return_cur RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT 1, 'row1';

  RETURN cur1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  type dr_CURSOR IS REF CURSOR;
  cur1 dr_CURSOR;
BEGIN
  SELECT return_cur() FROM t1;
END; //

greatsql> CALL p1() //
ERROR 1235 (42000): This version of MySQL doesn't yet support 'REF CURSOR used in table'
```

- 11. Example 11: parameter return

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_return(ref_rs OUT SYS_REFCURSOR) IS
 sql1 VARCHAR(100);
BEGIN
  sql1  := 'SELECT a, b FROM t1 WHERE a > 2';
  OPEN ref_rs FOR sql1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  a INT;
BEGIN
  CALL sp_return(a);
END; //

greatsql> CALL p1() //
ERROR 7553 (HY000): inconsistent datatypes: udt type and non udt type
```

- 12. Example 12: the impact of `OPEN FOR`, `CLOSE` and assignment on other `REF CURSOR`s

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

-- 1. Impact scope of OPEN FOR
greatsql> CREATE OR REPLACE FUNCTION return_cur RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1 WHERE a < 3;

  RETURN cur1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() IS
  v_a INT;
  v_b VARCHAR(30);
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
BEGIN
  cur1 := return_cur();
  SELECT cur1 INTO cur2 FROM DUAL;

  OPEN cur2 FOR SELECT * FROM t1 WHERE a = 1;
  LOOP
    FETCH cur1 INTO v_a, v_b;
    EXIT WHEN cur1%NOTFOUND;
    SELECT v_a, v_b;
  END LOOP;
  CLOSE cur2;
END; //

-- After OPEN FOR, all associated REF CURSORs are affected
greatsql> CALL p1() //
+------+------+
| v_a  | v_b  |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

-- 2. Impact scope of CLOSE
-- Skip the creation of FUNCTION return_cur() and reuse the result of the previous example
greatsql> CREATE OR REPLACE PROCEDURE p1() IS
  a INT;
  b VARCHAR(30);
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
BEGIN
  cur1 := return_cur();
  SELECT cur1 INTO cur2 FROM DUAL;
  CLOSE cur2;   -- Closing cur2 before opening cur1 affects cur1; it is OK if placed after FETCH cur1
  FETCH cur1 INTO a, b;
END; //

-- After CLOSE, all associated REF CURSORs are affected
greatsql> CALL p1() //
ERROR 1324 (42000): Undefined CURSOR: cur1

-- 3. Impact scope of a plain SET
CREATE OR REPLACE FUNCTION return_cur1 RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1 WHERE a = 2;

  RETURN cur1;
END; //

CREATE OR REPLACE PROCEDURE p1() IS
  v_a INT;
  v_b VARCHAR(30);
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
  cur3 SYS_REFCURSOR;
BEGIN
  cur1 := return_cur();

  SELECT cur1 INTO cur2 FROM DUAL;
  cur3 := cur2;
  cur1 := return_cur1();

  LOOP
    FETCH cur3 INTO v_a, v_b;
    EXIT WHEN cur3%NOTFOUND;

    SELECT v_a, v_b;
  END LOOP;

  LOOP
    FETCH cur1 INTO v_a, v_b;
    EXIT WHEN cur1%NOTFOUND;
    SELECT v_a, v_b;
  END LOOP;
END; //

-- It can be seen from the result that after cur1 is changed, only itself is affected, and cur2 and cur3 assigned from it are not affected
greatsql> CALL p1() //
+------+------+
| v_a  | v_b  |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

+------+------+
| v_a  | v_b  |
+------+------+
|    2 | row2 |
+------+------+
1 row in set (0.00 sec)

+------+------+
| v_a  | v_b  |
+------+------+
|    2 | row2 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 13. Example 13: the impact of `CLOSE REF CURSOR` on associated cursors

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE FUNCTION return_cur RETURN SYS_REFCURSOR
AS
  cur1 SYS_REFCURSOR;
BEGIN
  OPEN cur1 FOR SELECT * FROM t1 WHERE a < 3;

  RETURN cur1;
END; //

greatsql> CREATE OR REPLACE PROCEDURE p1() IS
  v_a INT;
  v_b VARCHAR(30);
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
BEGIN
  cur1 := return_cur();
  SELECT cur1 INTO cur2 FROM DUAL;
  CLOSE cur2;

  -- In GreatSQL, reopening it here is allowed, but in Oracle it would report an invalid CURSOR error
  OPEN cur1 FOR SELECT * FROM t1 WHERE a = 1;
  LOOP
    FETCH cur1 INTO v_a, v_b;
    EXIT WHEN cur1%NOTFOUND;
    SELECT v_a, v_b;
  END LOOP;
END; //

greatsql> CALL p1() //
+------+------+
| v_a  | v_b  |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 14. Example 14: `in SYS_REFCURSOR`

```
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_return(ref_rs in SYS_REFCURSOR) IS
  sql1 VARCHAR(100);
  v_a INT;
  v_b VARCHAR(30);
  BEGIN
  FETCH ref_rs INTO v_a, v_b;
  SELECT v_a, v_b;
 END //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
  v_a INT;
  v_b VARCHAR(20);
BEGIN
  OPEN cur1 FOR SELECT * FROM t1;
  CALL sp_return(cur1);

  SELECT 'AFTER CALL sp_return';

  LOOP
    FETCH cur1 INTO v_a, v_b;
    EXIT WHEN cur1%NOTFOUND;
    SELECT v_a, v_b;
  END LOOP;

  CLOSE cur1;
END //

greatsql> CALL p1() //
+------+------+
| v_a  | v_b  |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

+----------------------+
| AFTER CALL sp_return |
+----------------------+
| AFTER CALL sp_return |
+----------------------+
1 row in set (0.00 sec)

+------+------+
| v_a  | v_b  |
+------+------+
|    2 | row2 |
+------+------+
1 row in set (0.00 sec)

+------+------+
| v_a  | v_b  |
+------+------+
|    3 | row3 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
