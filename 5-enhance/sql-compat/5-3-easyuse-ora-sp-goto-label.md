# Oracle兼容-存储过程-GOTO
---


## 1. 语法

```sql
GOTO label
```

label后面的语句块支持以下几种用法：
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

## 2. 定义和用法

GreatSQL的存储过程中支持用 `label` 标记位置，并用 `GOTO label` 跳到指定标记位置。

注意：谨慎使 `GOTO` 语法，容易造成死循环。

## 3. Oracle兼容说明

GreatSQL的存储过程中支持用 `label` 标记位置，并用 `GOTO label` 跳到指定标记位置。该用法如下所述：

1. 如果 `GOTO` 语句退出游标 `FOR LOOP` 循环语句块，则游标将会被关闭。

2. 不能利用 `GOTO` 语句将控制转移到 `IF / CASE / LOOP` 等语句或子块中。

3. 不能利用 `GOTO` 语句将控制从一个 `IF` 语句子句转移到另一个，或从一个 `CASE WHEN` 子句转移到另一个。

4. 不能利用 `GOTO` 语句将控制转移出子程序。

5. 不能利用 `GOTO` 语句将控制转移到异常处理程序中。

6. 不能利用 `GOTO` 语句将控制从异常处理程序转移回当前块（但它可以将控制从异常处理程序转移到封闭块）。

7. 可以利用 `GOTO` 可以跳转到除了以上提到的几种情况之外的任何地方，GreatSQL原生的 `LEAVE label` 只能在 `LOOP` 和 `BEGIN END` 模块内使用。

8. 只支持单个label标记，不支持多个label同时标记位置。如下例所示：

```
<<label1>>
<<label12>>  -- 不支持同时标记位置，二者必须删掉一个
  a := b;
```

9. 支持在 `EVENT / TRIGGER / PACKAGE / 匿名块` 内使用 `GOTO` 语法。如果在 `EVENT / TRIGGER` 中因逻辑错误可能造成死循环，会造成系统资源浪费，应该谨慎使用。


## 4. 示例


- 1. 示例1：往前跳转

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE goto_sp1(v_str IN OUT VARCHAR)
AS
BEGIN 
  v_str := 'label1';

  GOTO label1;

<<label1>>
  -- 又立即跳转到label2，即RETURN完成
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

- 2. 示例2：往回跳转

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

- 3. 示例3：支持条件判断处理

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

greatsql> select @ret //
+--------------------------------------------------------------------------------------------+
| @ret                                                                                       |
+--------------------------------------------------------------------------------------------+
| --- no_data_found cought 1 ------ too_many_rows cought 2 ------ too_many_rows cought 1 --- |
+--------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

greatsql> CALL goto_sp3(0, @ret) //
Query OK, 0 rows affected (0.00 sec)

greatsql> select @ret //
+--------------------------------------------------------------------------------------------+
| @ret                                                                                       |
+--------------------------------------------------------------------------------------------+
| --- no_data_found cought 1 ------ too_many_rows cought 2 ------ too_many_rows cought 1 --- |
+--------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

greatsql> CALL goto_sp3(3, @ret) //
Query OK, 0 rows affected (0.00 sec)

greatsql> select @ret //
+--------------------------------+
| @ret                           |
+--------------------------------+
| --- too_many_rows cought 1 --- |
+--------------------------------+
1 row in set (0.00 sec)

greatsql> CALL goto_sp3(1, @ret) //
Query OK, 1 row affected (0.00 sec)

greatsql> select @ret //
+---------+
| @ret    |
+---------+
|  error  |
+---------+
1 row in set (0.00 sec)
```

- 4. 示例4：不能跳转到`CASE WHEN`语句块

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

- 5. 示例5：不能跳转到另一个 `CASE WHEN` 语句块

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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
