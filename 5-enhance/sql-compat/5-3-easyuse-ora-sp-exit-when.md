# Oracle兼容-存储过程-EXIT WHEN
---


## 1. 语法

```sql
EXIT (label) / EXIT (label) WHEN
```

## 2. 定义和用法

GreatSQL存储过程中支持用 `EXIT (label)/EXIT (label) WHEN` 退出当前循环。该用法如下所述：

1. 退出时可带标签，也可不带标签。

2. 支持多种退出循环判断条件，包括 `EXIT WHEN cursor%FOUND / %NOTFOUND / %ISOPEN` 等多种判断条件。


## 3. 示例

创建测试表并初始化数据
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. 示例1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_loop1() AS
  CURSOR cur1 IS SELECT a, b FROM t1 WHERE a>1;
BEGIN
  <<forLoop>>
  FOR rec IN cur1 LOOP
    SELECT rec.a ,rec.b; 
    EXIT;   -- 只循环一次就退出
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

- 2. 示例2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp_loop2() AS
  CURSOR cur1 IS SELECT a, b FROM t1 WHERE a>1;
BEGIN
  <<forLoop>>
  FOR rec IN  cur1 LOOP
    EXIT forLoop;   -- 一次都没循环成功，直接退出
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

- 3. 示例3

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

- 4. 示例4

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






**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
