# Oracle兼容-存储过程-REF CURSOR, SYS_REFCURSOR
---


## 1. 语法

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

## 2. 定义和用法

在 `ORACLE` 模式下，GreatSQL存储过程/存储函数支持以下几种 `REF CURSOR, SYS_REFCURSOR` 用法：

- 1. 语法1：支持用 `var SYS_REFCURSOR` 语法来定义 `SYS_REFCURSOR`。

```sql
var SYS_REFCURSOR
```

- 2. 语法2：支持用 `TYPE ... IS REF CURSOR` 语法定义 `REF CURSOR`。

```sql
TYPE type_name IS REF CURSOR
```

- 3. 语法3：支持用 `OPEN ... FOR` 打开 `REF CURSOR`。

```sql
OPEN cursor_name FOR {select_statement | dynamic_string}
```

- 4. 语法4：`FOR rows IN (select_stmt) LOOP` 会隐式创建 `REF CURSOR`，这里的 `rows` 不需要提前定义，且只在当前 `FOR ... LOOP` 语句块中有效。

```sql
FOR rows IN
{ 
  ( select_statement )
}
LOOP statement... END LOOP [label] ;
```

更多关于 `FOR rows IN CURSOR` 用法参考：[Oracle兼容-存储过程-游标（`CURSOR`）](./5-3-easyuse-ora-sp-ref-cursor.md)。


- 5. 语法5：`FUNCTION RETURN SYS_REFCURSOR` 支持函数返回 `REF CURSOR` 类型数据。对于 `FUNCTION` 不支持变量中包含 `SYS_REFCURSOR` 类型参数。

```sql
CREATE [OR REPLACE] FUNCTION sp_name(var_list) RETURN SYS_REFCURSOR AS routine_body
```

- 6. 语法6：支持存储过程的参数带 `OUT SYS_REFCURSOR`，并支持 `REF CURSOR` 类型返回结果。

```sql
CREATE [OR REPLACE] sp_name(var_list) AS routine_body
```

- 7. 语法7：支持将 `REF CURSOR` 作为参数来赋值，二者享有共同的 `REF CURSOR` 状态。`cursor1` 和 `cursor2` 都是 `REF CURSOR` 类型，享有共同的 `REF CURSOR` 状态。如果其中一个重新 `OPEN CURSOR FOR` 或者 `CLOSE CURSOR`，那么会影响所有关联 `REF CURSOR`。如果只是其中一个被赋值，那么不会影响另外的关联 `REF CURSOR`，只会影响其他被赋值的 `REF CURSOR`（详见下方示例12）。

```sql
cursor1 := cursor2
```

- 8. 语法8：采用 `SELECT cursor1 INTO cursor2` 语法就可以进行 `REF CURSOR` 赋值，二者享有共同的 `REF CURSOR` 状态。

```sql
SELECT cursor1 INTO cursor2
```

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL存储过程/存储函数中 `REF CURSOR, SYS_REFCURSOR` 用法与Oracle用法基本一致。

GreatSQL在兼容性差异主要有以下几点：

1. 只支持在存储过程/存储函数内部中使用 `SYS_REFCURSOR`，也支持作为参数传入和输出。

2. `REF CURSOR` 和 `SYS_REFCURSOR` 的参数也作为存储过程/存储函数的参数，因此不能再定义同名参数。

3. 如果只定义了 `REF CURSOR` 或 `SYS_REFCURSOR` 而没有定义具体SQL语句，则这个游标无法使用。

4. 语句 `OPEN sp_name FOR` 可以用在 `LOOP .. END LOOP` 语句块里。

5. 支持在 `OPEN sp_name FOR` 之后无需先 `CLOSE` 而可以继续 `OPEN sp_name FOR` 再次使用，这点和 `OPEN sp_name` 用法不一样。

6. 游标 `cur1` 没有定义的话，`cur1%ISOPEN` 依然可以被使用而不会报错；而 `cur1%FOUND, cur1%NOTFOUND, cur1%ROWCOUNT` 则会报错。

7. 对于 `CALL sp1(IN var_name)` 中的参数 `var_name` 只能执行 `FETCH` 和 `CLOSE` 操作，不能进行赋值和 `OPEN FOR` 操作，这点与Oracle行为一致。

8. 对于 `CALL sp1(var_name)` 中的 `var_name` 必须为`REF CURSOR`类型，否则会报错（详见下方示例11）。

9. 如果被关联的游标关闭以后，在Oracle中该游标是不能再被打开只能被赋值使用；但在GreatSQL允许再次被打开使用，也可以再被赋值使用，这点二者不一样（详见下方示例13）。

10. 在`ORACLE`模式下，`SELECT` 结果为 `SYS_REFCURSOR` 的存储函数结果的输出为 `NULL` (详见下方示例10)。

## 4. 示例

修改 `sql_generate_invisible_primary_key` 选项设定，因为下面案例中创建的表没有显式主键，关闭该选项可以避免自动创建隐式主键 `my_row_id`，可能会对下面的案例造成影响。
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

创建测试表并初始化数据
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. 示例1：`SYS_REFCURSOR, OPEN CURSOR`

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

- 2. 示例2：`SYS_REFCURSOR, OPEN CURSOR FOR`

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

- 3. 示例3：`FOR ident in (SELECT_stmt) LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1() AS
BEGIN
  --这里的rtype只在当前FOR LOOP内部使用，外面无法使用
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

- 4. 示例4：`REF CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1() AS
  TYPE dr_CURSOR IS REF CURSOR;
  cur1 dr_CURSOR;
  rtype t1%ROWTYPE;
BEGIN
  -- 这里可以改写成sql1 := 'SELECT * FROM t1 WHERE a<3';
  -- OPEN cur1 FOR sql1;sql1需要提前声明。
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

- 5. 示例5：`duplicate var with declared and FOR LOOP`

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

- 6. 示例6：`FUNCTION RETURN SYS_REFCURSOR`

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

- 7. 示例7：`PROCEDURE WITH OUT SYS_REFCURSOR`

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

- 8. 示例8：`SET REF CURSOR`

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

- 9. 示例9：`SELECT REF CURSOR INTO REF CURSOR`

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

- 10. 示例10：`SELECT SYS_REFCURSOR FUNCTION`

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

- 11. 示例11：参数返回

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

- 12. 示例12：`OPEN FOR` 和 `CLOSE` 以及赋值对其他 `REF CURSOR` 的影响

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

-- 1、OPEN FOR的影响范围
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

-- OPEN FOR以后影响了所有关联过的REF CURSOR
greatsql> CALL p1() //
+------+------+
| v_a  | v_b  |
+------+------+
|    1 | row1 |
+------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

-- 2、CLOSE的影响范围
-- 略过FUNCTION return_cur()的创建过程，复用上例结果
greatsql> CREATE OR REPLACE PROCEDURE p1() IS
  a INT;
  b VARCHAR(30);
  cur1 SYS_REFCURSOR;
  cur2 SYS_REFCURSOR;
BEGIN
  cur1 := return_cur();
  SELECT cur1 INTO cur2 FROM DUAL;
  CLOSE cur2;   -- 在打开游标cur1之前关闭cur2，则cur1受到影响，如果放在FETCH cur1之后就可以
  FETCH cur1 INTO a, b;
END; //

-- CLOSE以后影响了所有关联REF CURSOR
greatsql> CALL p1() //
ERROR 1324 (42000): Undefined CURSOR: cur1

-- 3、单纯set的影响范围
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

-- 从结果可以看到，最初的cur1被改变后，只影响了自己，没有影响被它赋值的cur2和cur3
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

- 13. 示例13：`CLOSE REF CURSOR` 对关联游标的影响

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

  -- 在GreatSQL中这里再次被OPEN是允许的，但在Oracle中会报告invalid CURSOR错误
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

- 14. 示例14：`in SYS_REFCURSOR`

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



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
