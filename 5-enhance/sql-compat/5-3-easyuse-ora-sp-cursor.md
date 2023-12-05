# Oracle兼容-存储过程-游标（`CURSOR`）
---


## 1. 语法

```sql
1. [ FOR rows IN
  { cursor [ ( cursor_parameter_dec
               [ [,] cursor_parameter_dec ]... )]
  | ( select_statement )
  }
  LOOP statement... END LOOP [label] ;

2. FETCH CURSOR INTO var

3. CURSOR cursor_name (column_name datatype) IS ...

4. cursor_name CURSOR%ROWTYPE

5. cursor_name TABLE%ROWTYPE
```

## 2. 定义和用法

GreatSQL在 `ORACLE` 模式下支持以下几种游标用法：

- 1. 用法1：用 `FOR ... IN CURSOR() LOOP ... END LOOP` 语法循环读取数据到游标中。

```sql
[ FOR rows IN
  { cursor [ ( cursor_parameter_dec
               [ [,] cursor_parameter_dec ]... )]
  | ( select_statement )
  }
  LOOP statement... END LOOP [label] ;
```

- 2. 语法2：读取游标中的多列数据，并赋值给一个变量，实现 `%ROWTYPE` 功能。

```sql
FETCH CURSOR INTO var
```

- 3. 语法3：支持定义游标时附带参数，并采用 `OPEN CURSOR(var_list)` 方式打开游标。

```sql
CURSOR cursor_name (column_name datatype) IS ...
```

- 4. 语法4：支持参数定义为 `CURSOR%ROWTYPE` 类型，用于存放多列。

```sql
cursor_name CURSOR%ROWTYPE
```

- 5. 用法5：支持参数定义为 `TABLE%ROWTYPE` 类型，用于存放多列。

```sql
cursor_name TABLE%ROWTYPE
```

## 3. Oracle兼容说明

GreatSQL在 `ORACLE` 模式下的游标在存储过程中读取数据的用法与Oracle基本一致，仅 `%ROWCOUNT` 还不支持。

在Oracle中支持用 `FOR var_name IN cursor_name LOOP ... END LOOP` 和 `%ROWTYPE` 语法进行游标取值，但在GreatSQL中的用法是 `LOOP ... END LOOP`。

其他关于游标用法详细描述见下：

1. 支持用 `DECLARE CURSOR c IS ...` 和 `DECLARE CURSOR(a INT) c IS ...` 这两种用法来声明游标。

2. 可以用 `FOR var_name IN CURSOR LOOP` 读取数据，游标后面带括号或者不带括号都可以。

3. 支持用 `CURSOR.column_name` 来获取指定列数据。

4. 支持用 `CURSOR%FOUND`、`CURSOR%NOTFOUND`、`CURSOR%ISOPEN` 判断游标的状态。

5. 支持用 `CURSOR%TYPE` 来继承一个游标的 `%ROWTYPE` 类型。

6. 支持用 `TABLE%ROWTYPE` 来获取一张已存在的表的结构。

7. 支持带有 `UDT` 类型的表定义为游标。也可以 `SELECT INTO` 用于 `UDT` 字段。

8. 在语句块 `FOR var IN CURSOR() LOOP ... END LOOP` 中的变量 `var` 只在 `FOR LOOP ... END LOOP` 这这个语句块范围内有效。

## 4. 示例

创建测试表并初始化数据

```sql
greatsql> DROP TABLE IF EXISTS t;
greatsql> CREATE TABLE IF NOT EXISTS t(id INT NOT NULL, c1 VARCHAR(100) NOT NULL);
greatsql> INSERT INTO t VALUES(1, 'row1'), (2, 'row2'), (3, 'row3');
```

- 1. 示例1：`FOR LOOP`循环读取数据

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp1_cur_loop() AS
  CURSOR cur1 IS SELECT * FROM t; 
BEGIN
  FOR rec IN cur1() LOOP
    SELECT rec.id, rec.c1;
  END LOOP;
END; //

greatsql> CALL sp1_cur_loop() //
+--------+--------+
| rec.id | rec.c1 |
+--------+--------+
|      1 | row1   |
+--------+--------+
1 row in set (0.00 sec)

+--------+--------+
| rec.id | rec.c1 |
+--------+--------+
|      2 | row2   |
+--------+--------+
1 row in set (0.00 sec)

+--------+--------+
| rec.id | rec.c1 |
+--------+--------+
|      3 | row3   |
+--------+--------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. 示例2：`CURSOR%ROWTYPE` 继承数据类型

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE or REPLACE PROCEDURE sp2_cur_rowtype() AS 
  CURSOR cur1 IS SELECT * FROM t;

  rec1 cur1%ROWTYPE;   -- 用 CURSOR%ROWTYPE 继承数据类型
  rec2 t.id%TYPE;      -- 用 TABLE%TYPE 继承数据类型
BEGIN
  OPEN cur1;	-- 打开游标

  LOOP		-- 循环游标，直至读取完数据
    FETCH cur1 INTO rec1;
  EXIT WHEN cur1%NOTFOUND;  

  rec2 := 1;	-- 对rec2变量单独赋值

  SELECT rec1.id, rec1.c1, rec2;

END LOOP;
 CLOSE cur1;
END; //

greatsql> CALL sp2_cur_rowtype() //
+---------+---------+------+
| rec1.id | rec1.c1 | rec2 |
+---------+---------+------+
|       1 | row1    |    1 |
+---------+---------+------+
1 row in set (0.00 sec)

+---------+---------+------+
| rec1.id | rec1.c1 | rec2 |
+---------+---------+------+
|       2 | row2    |    1 |
+---------+---------+------+
1 row in set (0.00 sec)

+---------+---------+------+
| rec1.id | rec1.c1 | rec2 |
+---------+---------+------+
|       3 | row3    |    1 |
+---------+---------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. 示例3：声明游标时带参数

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE or REPLACE PROCEDURE sp3_cur_var() AS
 vid INT;

 -- 定义游标时带参数
 CURSOR cur1 (vid INT) IS SELECT * FROM t WHERE id = vid;

 rec1 cur1%ROWTYPE;
BEGIN
 OPEN cur1(2);	  -- 打开游标时，传递参数

 LOOP
   FETCH cur1 INTO rec1;
 EXIT WHEN cur1%NOTFOUND;

 SELECT rec1.id, rec1.c1;

 END LOOP;

 CLOSE cur1;
END; //

greatsql> CALL sp3_cur_var() //
+---------+---------+
| rec1.id | rec1.c1 |
+---------+---------+
|       2 | row2    |
+---------+---------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. 示例4：支持表中包含 `UDT` 类型

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));

greatsql> CREATE TABLE udt_t1(id INT,c2 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(10, 'c1_row10'));
greatsql> INSERT INTO udt_t1 VALUES(2, udt1(20, 'c1_row20'));

greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE or REPLACE PROCEDURE sp4_cur_udt() AS
  CURSOR cur1 (vid INT) IS SELECT * FROM udt_t1 WHERE id = vid;
  rec1 udt_t1.c2%TYPE;
BEGIN
  FOR rec IN cur1(10) LOOP
    SELECT rec.id, rec.c2;
    SELECT rec.c2 INTO rec1;
    SELECT rec1.id, rec1.c1;
  END LOOP;

  SELECT * FROM udt_t1;
END; //

greatsql> CALL sp4_cur_udt(); //
+------+---------------------+
| id   | c2                  |
+------+---------------------+
|    1 | id:10 | c1:c1_row10 |
|    2 | id:20 | c1:c1_row20 |
+------+---------------------+
2 rows in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
