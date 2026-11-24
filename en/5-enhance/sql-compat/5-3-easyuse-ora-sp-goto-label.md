# Oracle Compatibility - Stored Procedure - GOTO
---


## 1. Syntax

```sql
GOTO label
```

The statement block after label supports the following usages:
```sql
{
  sp_proc_stmt_statement
  | exit [label]/exit [label] when
  | leave label
  | iterate label
  | goto label
  | open cursor
  | fetch cursor
  | close cursor
  | return
  | if elsif
  | case when
  | forall loop
  | declare body begin .. end
  | sp_labeled_control
}

sp_proc_stmt_statement:
{
  DDL_statement ...
  DML_statement ...
  SHOW_statement ...
}

sp_labeled_control:
{
    for_loop_stmt
  | while loop
  | loop end loop
  | repeat until
}
```

## 2. Definition and Usage

GreatSQL stored procedures support using `label` to mark a position and `GOTO label` to jump to the specified marked position.

Note: use the `GOTO` syntax with caution, as it can easily cause infinite loops.

## 3. Oracle Compatibility Notes

GreatSQL stored procedures support using `label` to mark a position and `GOTO label` to jump to the specified marked position. The usage is as follows:

1. If the `GOTO` statement exits a cursor `FOR LOOP` statement block, the cursor is closed.

2. `GOTO` cannot be used to transfer control into statements or sub-blocks such as `IF / CASE / LOOP`.

3. `GOTO` cannot be used to transfer control from one `IF` statement clause to another, or from one `CASE WHEN` clause to another.

4. `GOTO` cannot be used to transfer control out of a subprogram.

5. `GOTO` cannot be used to transfer control into an exception handler.

6. `GOTO` cannot be used to transfer control from an exception handler back to the current block (but it can transfer control from an exception handler to an enclosing block).

7. `GOTO` can jump to anywhere except the cases mentioned above. GreatSQL's native `LEAVE label` can only be used within `LOOP` and `BEGIN END` blocks.

8. Only a single label marker is supported; multiple labels marking the same position are not supported. See the example below:

```
<<label1>>
<<label12>>  -- Marking two positions at the same time is not supported; one of them must be removed
  a := b;
```

9. The `GOTO` syntax is supported in `EVENT / TRIGGER / PACKAGE / anonymous blocks`. If a logic error in `EVENT / TRIGGER` may cause an infinite loop, it wastes system resources, so it should be used with caution.


## 4. Examples


- 1. Example 1: jump forward

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE goto_sp1(v_str IN OUT VARCHAR)
AS
BEGIN 
  v_str := 'label1';

  GOTO label1;

<<label1>>
  -- Jump to label2 immediately, i.e., the RETURN completes
  GOTO label2;
  v_str := 'label2';

<<label2>> 
  RETURN;
END; //

greatsql> CALL goto_sp1(@v_str) //
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT @v_str //
+--------+
| @v_str |
+--------+
| label1 |
+--------+
1 row in set (0.00 sec)
```

- 2. Example 2: jump backward

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE goto_sp2(v_str IN OUT VARCHAR)
AS
BEGIN 
  v_str := 'label1';

<<label1>>
  IF (v_str = 'label2') THEN
    RETURN;
  END IF;

  v_str := 'label2';
  GOTO label1;
END; //

greatsql> CALL goto_sp2(@v_str) //

greatsql> SELECT @v_str //
+--------+
| @v_str |
+--------+
| label2 |
+--------+
1 row in set (0.00 sec)
```

- 3. Example 3: conditional handling is supported

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE goto_sp3(n INT, ret OUT VARCHAR)
AS
  a INT;
BEGIN
<<label1>>
  BEGIN
    SELECT a INTO a FROM information_schema.TABLES LIMIT n;
  EXCEPTION
    WHEN TOO_MANY_ROWS THEN
      BEGIN
        ret := ret||'--- too_many_rows cought 1 ---';
        GOTO label2;
      END;
    WHEN NO_DATA_FOUND THEN
      BEGIN
        ret := ret||'--- no_data_found cought 1 ---';
        n := 2;
        SELECT a INTO a FROM information_schema.TABLES LIMIT n;
      EXCEPTION
        WHEN TOO_MANY_ROWS THEN
          BEGIN
            ret := ret||'--- too_many_rows cought 2 ---';              
            GOTO label1;
          END;
        WHEN NO_DATA_FOUND THEN ret := '--- no_data_found cought 2 ---';
      END;
  END;

  SET ret := ret||' error ';
<<label2>> 
  RETURN;
END; //

greatsql> CALL goto_sp3(0, @ret) //
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT @ret //
+--------------------------------------------------------------------------------------------+
| @ret                                                                                       |
+--------------------------------------------------------------------------------------------+
| --- no_data_found cought 1 ------ too_many_rows cought 2 ------ too_many_rows cought 1 --- |
+--------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

greatsql> CALL goto_sp3(0, @ret) //
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT @ret //
+--------------------------------------------------------------------------------------------+
| @ret                                                                                       |
+--------------------------------------------------------------------------------------------+
| --- no_data_found cought 1 ------ too_many_rows cought 2 ------ too_many_rows cought 1 --- |
+--------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

greatsql> CALL goto_sp3(3, @ret) //
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT @ret //
+--------------------------------+
| @ret                           |
+--------------------------------+
| --- too_many_rows cought 1 --- |
+--------------------------------+
1 row in set (0.00 sec)

greatsql> CALL goto_sp3(1, @ret) //
Query OK, 1 row affected (0.00 sec)

greatsql> SELECT @ret //
+---------+
| @ret    |
+---------+
|  error  |
+---------+
1 row in set (0.00 sec)
```

- 4. Example 4: cannot jump into a `CASE WHEN` statement block

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE goto_sp4()
AS
  a INT;
BEGIN
  GOTO label1;
  case 1
    WHEN 1 THEN
     <<label1>>
      a  :=  2;
    WHEN 2 THEN
      a  :=  1;
  END CASE;
  RETURN;
END; //
ERROR 1308 (42000): GOTO with no matching label: label1
```

- 5. Example 5: cannot jump into another `CASE WHEN` statement block

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE goto_sp5()
AS
  a INT;
BEGIN
  CASE 1
    WHEN 1 THEN
     <<label1>>
      a  :=  2;
    WHEN 2 THEN
      a  :=  1;
      GOTO label1;
  end case;
  RETURN;
END; //
ERROR 1308 (42000): GOTO with no matching label: label1
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
