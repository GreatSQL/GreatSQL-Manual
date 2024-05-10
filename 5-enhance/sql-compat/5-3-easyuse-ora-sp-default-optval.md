# Oracle兼容-存储过程-存储过程/存储函数默认参数值
---


## 1. 语法

```sql
[ IN | OUT | INOUT ]          #可选输入输出标记
var_name                      #参数名
var_type                      #参数类型
[ { := | DEFAULT } optval ]     #默认值
```

## 2. 定义和用法

在 `ORACLE` 模式下，GreatSQL存储过程/存储函数的参数定义时，允许添加类似 `n INT := 1` 这样的的标记用法。如果调用时该参数被指定了其他值，则这个表达式会被忽略，否则该参数将使用该表达式进行初始化。

该功能使得参数在调用的时候允许被省略，提升了易用性，更方便实用。

### 2.1 参数默认值使用要点

- 参数默认值仅针对输入参数有效，即标记为 `IN` 的参数。
- 参数值 `optval` 与参数类型 `var_type` 需要能兼容。
- 参数值 `optval` 所占的空间要小于参数长度定义。
- 参数值 `optval` 仅允许包含时间函数, 如：`NOW()/SYSDATE()/CURRENT_TIMESTAMP()` 等，不支持其他类型的函数。
- 参数值 `optval` 不允许包含对数据列的引用、存储过程调用、伪列等。
- 参数值 `optval` 必须为字面常量(LITERAL)，不支持表达式。例如，支持参数值 `-1`，但不支持 `0-1` 这种表达式，不支持逻辑运算和括号 `(` `)` 等。
- 允许任意位置参数有默认值。


### 2.2 支持的数据类型列表

参数默认值特性支持的数据类型详见下表：

| 数据类型          | 内部类型   | 取值示例              | 不支持取值                        |
| ----------------- | ---------- | --------------------- | ------------------------------- |
| INT/INTEGER       | LONG       | 100                   | 0xFF                            |
| BIT               | BIT        | 1                     | 3                               |
| TINYINT           | TINY       | 100                   | 130                             |
| BOOL              | TINY       | 0                     | 130                             |
| SMALLINT          | SHORT      | 100                   |                                 |
| MEDIUMINT         | INT24      | -50                   |                                 |
| BIGINT            | LONGLONG   | 100                   |                                 |
| DECIMAL/DEX/FIXED | NEWDECIMAL | 100                   |                                 |
| FLOAT             | FLOAT      | 1.1                   |                                 |
| DOUBLE            | DOUBLE     | 1.1                   |                                 |
| VARCHAR           | VARCHAR    | 'GreatSQL'            |                                 |
| VARBINARY         | VARCHAR    | 'GreatSQL'            |                                 |
| DATE              | NEWDATE    | '2023-10-23'          |                                 |
| YEAR              | YEAR       | '2023', 2023          |                                 |
| TIME              | TIME2      | '20:01:02'            |                                 |
| DATETIME          | DATETIME2  | '2023-10-23 20:01:02' |                                 |
| TIMESTAMP         | TIMESTAMP2 | '2023-10-23 20:01:02' |                                 |
| BLOB              | BLOB       | 'GreatSQL'            |                                 |
| TEXT              | BLOB       | 'GreatSQL'            |                                 |


几个注意事项：

- 布置及 `SET`、`ENUM`、`JSON` 等几个数据类型。
- `BOOL` 类型取值范围与 `TINYINT` 相同。
- 字符串相关类型如果使用默认值，则要求 客户端(连接)、数据库、数据列的字符集要一致，否则可能无法得到预期值。
- 字符串相关类型不允许使用长度超过定义的默认值（会报错，而不是自动截断处理）。
- 一些特殊默认值的处理与建表DDL中声明的数据里默认值保持一致。
- 参数为 `VARBINARY` 类型时，不会检查参数的字符集。
- 建表DDL声明中的数据列类型为 `BLOB` 和 `TEXT` 时，其默认值只支持设置为 `NULL`，不能设置为 '' 或其他字符串。


### 2.3 支持的函数列表

参数默认值特性支持的函数详见下表：

SQL类型 | 内部类型 | 
---|---|---|---
NOW | NOW
CURRENT_TIMESTAMP | NOW
SYSDATE | NOW

上表中没有列出的函数都不支持，如 `ABS()`、SUM()`、`DECODE()` 等。



### 3.4 错误说明

当参数取值发生错误时，主要有以下两种错误提示：

- `Parameter '%s' has invalid value`
    - 错误原因：在存储过程/存储函数的执行中，发现默认参数值非法。
    - 建议动作：修改参数值。
    
- `Parameter '%s' is invalid for %s`
    - 错误原因：参数非法。
    - 建议动作：修改非法内容，如：参数名称、重复参数、不支持的类型、不支持的字符等。


## 3. Oracle兼容说明

GreatSQL存储过程/存储函数参数默认值用法和Oracle区别主要有：

- Oracle中支持对字符参数进行转码, GreatSQL不支持该动作。
- Oralce支持常量表达式类型默认参数，GreatSQL不支持该用法。


## 4. 示例

- 1. 示例1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(a BIT DEFAULT NULL) AS
BEGIN
  SELECT a;
END; //

greatsql> CREATE FUNCTION f1(a BIT DEFAULT NULL) RETURN BIT DETERMINISTIC AS
BEGIN
  RETURN a;
END; //

greatsql> CALL p1(NULL) //
+------+
| a    |
+------+
| NULL |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL p1() //
+------+
| a    |
+------+
| NULL |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT f1(NULL) //
+----------+
| f1(NULL) |
+----------+
| NULL     |
+----------+
1 row in set (0.00 sec)

greatsql> SELECT f1() //
+------+
| f1() |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```

- 2. 示例2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(a DATE DEFAULT NOW()) AS
BEGIN
  SELECT a;
END; //

greatsql> CREATE OR REPLACE FUNCTION f1(a DATE DEFAULT NOW()) RETURN DATE DETERMINISTIC AS
BEGIN
  RETURN a;
END; //

greatsql> CALL p1(NOW()) //
+------------+
| a          |
+------------+
| 2023-12-04 |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected, 1 warning (0.00 sec)

greatsql> CALL p1() //
+------------+
| a          |
+------------+
| 2023-12-04 |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected, 1 warning (0.00 sec)

greatsql> SELECT f1(NOW()) //
+------------+
| f1(NOW())  |
+------------+
| 2023-12-04 |
+------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SELECT f1() //
+------------+
| f1()       |
+------------+
| 2023-12-04 |
+------------+
1 row in set, 1 warning (0.00 sec)
```

- 3. 示例3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p2(a DATE DEFAULT NOW(), b DATE DEFAULT NOW()) AS
BEGIN
  SELECT a;
  SELECT b;
END; //

greatsql> CALL p1(a=>'2023-10-23') //
+------------+
| a          |
+------------+
| 2023-10-23 |
+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
