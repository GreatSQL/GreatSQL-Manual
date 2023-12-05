# Oracle兼容-存储过程-FOR LOOP
---


## 1. 语法

```sql
FOR var IN [REVERSE] expr1 .. expr2 LOOP .. END LOOP
```

## 2. 定义和用法

在GreatSQL中支持用 `FOR .. IN expr1 .. expr2 LOOP .. END LOOP` 语法循环读取数据，并赋值给相应变量。

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL存储过程支持 `FOR .. LOOP` 用法。该用法如下所述：

1. 不需要事先声明 `FOR LOOP` 中的变量 `var`，直接使用 `FOR var IN expr1 .. expr2 LOOP` 语法即可。

2. 支持增加 `REVERSE` 关键字，可以实现倒序获取数据目的。

3. 循环中的 `expr1/expr2` 支持数值类型变量、数值、函数以及表达式等。`expr1/expr2` 如果是 `FLOAT` 类型则会被转换成 `INT` 型（转换时会做四舍五入处理）。

4. 如果 `expr1/expr2` 是时间类型，则会被转换为数值类型进行计算，而不是按照时间规则进行加减计算。在Oracle中不支持该类型，会产生报错。

5. 在循环 `FOR var IN` 中的变量 `var` 如果是 `FLOAT` 类型则会被转换成 `INT` 型（转换时会做四舍五入处理）。

## 4. 示例

- 1. 示例1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(i FLOAT, j FLOAT) AS
BEGIN
  FOR x IN i .. j LOOP
    SELECT x;
  END LOOP;
END; //

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.4,3.5) //
+------+
| x    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    4 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```
可以看到，当传入参数是 `FLOAT` 类型是，会被转换成 `INT` 型（转换时会做四舍五入处理）。

- 2. 示例2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(i FLOAT, j FLOAT) AS
BEGIN
  -- 倒序
  FOR x IN REVERSE i .. j LOOP
    SELECT x;
  END LOOP;
END; //

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.4, 3.5) //
+------+
| x    |
+------+
|    4 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.5, 3.4) //
+------+
| x    |
+------+
|    3 |
+------+
1 row in set (0.00 sec)

+------+
| x    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. 示例3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(i FLOAT, j FLOAT) AS
  val FLOAT := 1.2; 
BEGIN
  FOR x IN i .. j LOOP
    -- 循环内部再加上一个 FLOAT 类型值
    val := val + x;
    SELECT val;
  END LOOP;
END; //

greatsql> CALL p1(1.5, 3.4) //
+------+
| val  |
+------+
|  3.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  6.2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1(1.4, 3.5) //
+------+
| val  |
+------+
|  2.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  4.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  7.2 |
+------+
1 row in set (0.01 sec)

+------+
| val  |
+------+
| 11.2 |
+------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)

greatsql> CALL p1(1.5, 3.4) //
+------+
| val  |
+------+
|  3.2 |
+------+
1 row in set (0.00 sec)

+------+
| val  |
+------+
|  6.2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
