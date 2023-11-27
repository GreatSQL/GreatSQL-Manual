# Oracle兼容-函数-TO_CLOB()函数
---
[toc]

## 1. 语法

```sql
TO_CLOB( expression )
```

## 2. 定义和用法
`TO_CLOB()` 函数的作用是把 `expression` 转换成 `CLOB` 类型的同时，其编码格式也会转换成当前所在数据库（Schema）的字符集 `character_set_database`，最后输出转换结果。

在GreatSQL中 `CLOB` 兼容类型有：`CLOB`、`TINYTEXT`、`TEXT`、`MEDIUMTEXT`、`LONGTEXT` 等。

## 3. Oracle兼容说明

1. `TO_CLOB()` 函数在转换时，若出现字符集编码冲突，会有告警提示，同时返回结果可能为NULL。

例如：当数据库编码（`character_set_database`）为`utf8mb4`时，进行如下操作：
```
greatsql> SELECT @@character_set_database;
+--------------------------+
| @@character_set_database |
+--------------------------+
| utf8mb4                  |
+--------------------------+

greatsql> SELECT TO_CLOB(0x80) FROM DUAL;
+---------------+
| TO_CLOB(0x80) |
+---------------+
| NULL          |
+---------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+----------------------------------------+
| Level   | Code | Message                                |
+---------+------+----------------------------------------+
| Warning | 1300 | Invalid utf8mb4 character string: '80' |
+---------+------+----------------------------------------+
```

2. 由于GreatSQL和Oracle对某些数据类型的处理和显式本身就存在差异，例如日期时间、LOB等类型，这可能导致 `TO_CLOB()` 函数在GreatSQL中得到的结果和Oracle不一致。因此，在GreatSQL中 `TO_CLOB()` 函数的重点是 **转换成CLOB兼容类型并设置编码格式，而不保证输出的内容和Oracle严格一致**。

**例1：日期类型转换**

- 在Oracle中的输出为：

```sql
SQL> SELECT SYSDATE, TO_CLOB(SYSDATE) FROM DUAL;

SYSDATE   TO_CLOB(SYSDATE)
--------- --------------------------------------------------------------------------------
06-NOV-23 06-NOV-23
```

- 在GreatSQL上输出为：

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SELECT SYSDATE, TO_CLOB(SYSDATE) FROM DUAL;
+----------------------------+----------------------------+
| SYSDATE                    | TO_CLOB(SYSDATE)           |
+----------------------------+----------------------------+
| 2023-11-06 10:56:41.121699 | 2023-11-06 10:56:41.121699 |
+----------------------------+----------------------------+

greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT SYSDATE, TO_CLOB(SYSDATE) FROM DUAL;
+---------------------+---------------------+
| SYSDATE             | TO_CLOB(SYSDATE)    |
+---------------------+---------------------+
| 2023-11-06 10:57:32 | 2023-11-06 10:57:32 |
+---------------------+---------------------+
```

**例2：LOB类型转换**

- 在Oracle中的输出为：

```sql
-- 初始化数据
SQL> CREATE TABLE t_clob(id number(4), a clob, b blob);
SQL> INSERT INTO t_clob(id,a,b) VALUES(1, 'ABC123', 'ABC123'),
(2, utl_raw.CAST_FROM_BINARY_INTEGER(123), utl_raw.CAST_FROM_BINARY_INTEGER(123)),
(3, utl_raw.CAST_TO_RAW('ABC123'), utl_raw.CAST_TO_RAW('ABC123'));

-- 执行如下SQL
SQL> SELECT * FROM t_clob;

        ID A                                                       B
---------- ------------------------------------------------------- -------------------------
         1 ABC123                                                  ABC123
         2 0000007B                                                0000007B
         3 414243313233                                            414243313233

SQL> SELECT id,TO_CLOB(a),TO_CLOB(b) FROM t_clob;

        ID TO_CLOB(A)                                              TO_CLOB(B)
---------- ------------------------------------------------------- -------------------------
         1 ABC123                                                  ����#
         2 0000007B                                                   {
         3 414243313233                                            ABC123
```

- 在GreatSQL上输出为：

```sql
-- 初始化数据
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t_clob(id INT NOT NULL PRIMARY KEY, a CLOB, b BLOB);
greatsql> INSERT INTO t_clob(id,a,b) VALUES(1, 'ABC123', 'ABC123'),
(2, utl_raw.CAST_FROM_BINARY_INTEGER(123), utl_raw.CAST_FROM_BINARY_INTEGER(123)),
(3, utl_raw.CAST_TO_RAW('ABC123'), utl_raw.CAST_TO_RAW('ABC123'));

-- 执行如下SQL
-- 执行下面的SQL之前，GreatSQL客户端工具需要先设置 "--binary-as-hex" 参数，例如：mysql --binary-as-hex
greatsql> SELECT * FROM t_clob;
+------+--------+----------------+
| id   | a      | b              |
+------+--------+----------------+
|    1 | ABC123 | 0x414243313233 |
|    2 |    {   | 0x0000007B     |
|    3 | ABC123 | 0x414243313233 |
+------+--------+----------------+

greatsql> SELECT id,TO_CLOB(a),TO_CLOB(b) FROM t_clob;
+------+------------+------------+
| id   | TO_CLOB(a) | TO_CLOB(b) |
+------+------------+------------+
|    1 | ABC123     | ABC123     |
|    2 |    {       |    {       |
|    3 | ABC123     | ABC123     |
+------+------------+------------+
```

3. 当参数 `expression `中包含转义字符（例如：\0 \\' '' \\" \\\\等），不是当做2个字符，而是当做1个字符处理。

如下例所示，执行 `SELECT TO_CLOB('\\') FROM DUAL;`，得到结果分别不同：

- 在oracle上输出为：

```
SQL> SELECT TO_CLOB('\\') FROM DUAL;

TO_CLOB('\\')
--------------------------------------------------------------------------------
\\
```

- 在GreatSQL上输出为：

```
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT TO_CLOB('\\') FROM DUAL;
+---------------+
| TO_CLOB('\\') |
+---------------+
| \             |
+---------------+
```

## 4. 示例

```sql
greatsql> SELECT TO_CLOB(123), TO_CLOB('ABC123\\'), TO_CLOB(123.456), TO_CLOB(1+1) FROM DUAL;
+--------------+---------------------+------------------+--------------+
| TO_CLOB(123) | TO_CLOB('ABC123\\') | TO_CLOB(123.456) | TO_CLOB(1+1) |
+--------------+---------------------+------------------+--------------+
| 123          | ABC123\             | 123.456          | 2            |
+--------------+---------------------+------------------+--------------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
