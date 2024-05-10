# Oracle兼容-语法-UPDATE ... SET
---


## 1. 语法

```sql
SET sql_mode = ORACLE;

UPDATE [LOW_PRIORITY] [IGNORE] table_reference
    SET (assignment_list) = (var_list)
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]

UPDATE [LOW_PRIORITY] [IGNORE] table_reference
    SET (assignment_list) = (SELECT stmt)
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

需要先切换到 `ORACLE` 模式下才能支持本语法。

## 2. 定义和用法

在GeratSQL中，支持执行 `UPDATE ... SET` 同时更新多表，类似Oracle用法。主要有以下两种形式：

- 用法1，多表更新

`UPDATE t1, t2 ... tn SET(column1,column2) = (value1, value2)`

这种写法支持同时更新多表中的同名多列。

- 用法2，单表更新，更新值源自子查询

`UPDATE TABLE t1 SET(a,b) = (SELECT * FROM t2) WHERE`

这种用法只支持更新单表，且只支持单条SELECT语句赋值，不支持多个SELECT语句，与Oracle行为一致。

## 3. Oracle兼容说明

在Oracle中不支持上述提到的 *用法1*，即同时更新多表，只有在GreatSQL中才支持。

## 4. 示例

创建测试表并初始化数据：

```sql
greatsql> CREATE TABLE t1 (c1 INT NOT NULL AUTO_INCREMENT PRIMARY KEY, c2 VARCHAR(10) NOT NULL, c3 VARCHAR(10) NOT NULL);
greatsql> CREATE TABLE t2 LIKE t1;
greatsql> INSERT INTO t1 VALUES (1, 'rt1c2', 'rt1c3');
greatsql> INSERT INTO t2 VALUES (1, 'rt2c2', 'rt2c3');
```

- 1. 示例1：多表更新

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> UPDATE t2, t1 SET (t2.c1, t1.c1) = (2, 9);
Query OK, 2 rows affected (0.00 sec)
Rows matched: 2  Changed: 2  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  9 | rt1c2 | rt1c3 |
+----+-------+-------+

greatsql> SELECT * FROM t2;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  2 | rt2c2 | rt2c3 |
+----+-------+-------+
```

- 2. 示例2：更新值源自子查询

```sql
greatsql> SET sql_mode = ORACLE;

-- 这么写也是可以的
-- UPDATE t1 SET (c1, c2 ,c3) = (SELECT * FROM t2 WHERE c1 = 2) WHERE t1.c1 = 9;
greatsql> UPDATE t1 SET (t1.c1, t1.c2, t1.c3) = (SELECT t2.c1, t2.c2, t2.c3 FROM t2 WHERE t2.c1 = 2) WHERE t1.c1 = 9;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  2 | rt2c2 | rt2c3 |
+----+-------+-------+

greatsql> SELECT * FROM t2;
+----+-------+-------+
| c1 | c2    | c3    |
+----+-------+-------+
|  2 | rt2c2 | rt2c3 |
+----+-------+-------+
```

- 3. 示例3：更新值源自子查询

```sql
-- 对t1, t2表重新初始化
greatsql> TRUNCATE TABLE t1;
greatsql> INSERT INTO t1 VALUES (1, 'rt1c21', 'rt1c31');

greatsql> TRUNCATE TABLE t2;
greatsql> INSERT INTO t2 VALUES (1, 'rt2c21', 'rt2c31'),
(2, 'rt2c22', 'rt2c32'),
(3, 'rt2c23', 'rt2c33');

greatsql> SET sql_mode = ORACLE;

-- 相比用法2，少了最后t1表上的WHERE条件
greatsql> UPDATE t1 SET(c2, c3) = (SELECT c2, c3 FROM t2 WHERE c1 = 3);
Query OK, 3 rows affected (0.00 sec)
Rows matched: 3  Changed: 3  Warnings: 0

greatsql> SELECT * FROM t1;
+----+--------+--------+
| c1 | c2     | c3     |
+----+--------+--------+
|  1 | rt2c23 | rt2c33 |
|  2 | rt2c23 | rt2c33 |
|  3 | rt2c23 | rt2c33 |
+----+--------+--------+
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
