# Oracle兼容-语法-Oracle COMMENT
---


## 1. 语法

在 `ORACLE` 模式下，GreatSQL客户端支持Oracle风格注释用法：

1. 支持Oracle风格的注释符，即在 `--` 后直接添加注释内容，无需像在GreatSQL原生模式下，必须在注释符后紧跟空格才行。

2. 在SQL语句、视图、函数、存储过程、触发器、包中支持Oracle风格注释符。

```sql
SET sql_mode = ORACLE;

--comment notes

-- comment notes
```

## 2. Oracle兼容说明

GreatSQL客户端在处理注释符后 **是否立即紧跟空格** 时有所区别：

1. 切换到ORACLE模式后，GreatSQL客户端支持在注释符`--`后立即紧跟注释内容，而无需添加空格。

2. 在GreatSQL客户端中，**如果注释符 `--` 后没有紧跟空格**，则注释内容中出现第一个分号`;`后会被当做结束符（前提是此时分隔符也是分号`;`，即`DELIMITER ;`），结束符之后的内容会被当做SQL请求提交。**如果注释符 `--` 后紧跟空格**，则在同一行范围内，所有内容都会被视为注释内容，不会被做SQL请求提交。

3. 每一个注释符 `--` 只能覆盖同一行范围，另起一行时，需要再次添加注释符才行，否则会被当做SQL请求提交。

几个示例展示区别：

```sql
greatsql> SET sql_mode = ORACLE;

-- 1. 注释符后没有紧跟空格，出现第一个分号;后会被当做结束符，结束符之后的内容会被当做SQL请求提交。
greatsql> --a;b;
Query OK, 0 rows affected (0.00 sec)

ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'b' at line 1

-- 将分隔符修改成不是分号
greatsql> DELIMITER //
greatsql> --a;b; //
Query OK, 0 rows affected (0.00 sec)
greatsql> DELIMITER ;

-- 2. 如果注释符 `--` 后紧>跟空格，则在同一行范围内，所有内容都会被视为注释内容，不会被做SQL请求提交。
greatsql> -- a;b;
greatsql>

-- 3. 每一个注释符 `--` 只能覆盖同一行范围，另起一行时，需要再次添加注释符才行，否则会被当做SQL请求提交。
greatsql> --a
    -> b;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'b' at line 2
```

## 4. 示例

先创建测试表，并写入数据：

```sql
greatsql> CREATE TABLE t1(a INT NOT NULL, b INT NOT NULL, c INT NOT NULL);
Query OK, 0 rows affected (0.07 sec)

greatsql> INSERT INTO t1 VALUES(1,1,1), (10,10,10), (20,20,20);
```

- 示例1. 常规用法

```sql
greatsql> SET sql_mode = DEFAULT;

-- 在DEFAULT模式下，不支持不带空格的注释符，会被当做运算符处理
greatsql> SELECT t1.a --t1.b
  , t1.c FROM t1;
+-------------+----+
| t1.a --t1.b | c  |
+-------------+----+
|           2 |  1 |
|          20 | 10 |
|          40 | 20 |
+-------------+----+

-- 在DEFAULT模式下，注释符后必须带空格
greatsql> SELECT t1.a -- t1.b
  , t1.c FROM t1;
+----+----+
| a  | c  |
+----+----+
|  1 |  1 |
| 10 | 10 |
| 20 | 20 |
+----+----+

-- 切换到ORACLE模式，注释符后是否紧跟空格的效果是一样的
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT t1.a,
 --t1.b,
 t1.c
 FROM t1;
+----+----+
| a  | c  |
+----+----+
|  1 |  1 |
| 10 | 10 |
| 20 | 20 |
+----+----+

greatsql> SELECT t1.a,
 -- t1.b,
 t1.c
 FROM t1;
+----+----+
| a  | c  |
+----+----+
|  1 |  1 |
| 10 | 10 |
| 20 | 20 |
+----+----+
```

- 示例2. 在视图(`VIEW`)中使用注释符

```sql
-- 在示例1的基础上创建视图
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE VIEW v1 AS--SELECT SYSDATE FROM DUAL
 --SELECT SYSDATE FROM DUAL
 SELECT * FROM t1;

greatsql> SELECT * FROM v1;
+----+----+----+
| a  | b  | c  |
+----+----+----+
|  1 |  1 |  1 |
| 10 | 10 | 10 |
| 20 | 20 | 20 |
+----+----+----+
```

- 示例3. 在存储过程(`STORE PROCEDURE`)中使用注释符

```
-- 在示例1的基础上创建存储过程
greatsql> SET sql_mode = ORACLE;

greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1 AS--SELECT SYSDATE AS D1 FROM DUAL
 --SELECT SYSDATE AS D2 FROM DUAL
 BEGIN--SELECT SYSDATE AS D5 FROM DUAL
 --SELECT SYSDATE AS D6 FROM DUAL
 SELECT * FROM t1 WHERE a=1;--SELECT SYSDATE AS D7 FROM DUAL
 --SELECT SYSDATE AS D8 FROM DUAL
 end;--SELECT SYSDATE AS D8 FROM DUAL
//

greatsql> call p1() //
+---+---+---+
| a | b | c |
+---+---+---+
| 1 | 1 | 1 |
+---+---+---+
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
