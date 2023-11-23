# Oracle兼容-语法-CREATE TYPE
---
[toc]

## 1. 语法

```sql
SET sql_mode = ORACLE;

CREATE [OR REPLACE] [DEFINER = user] TYPE type_name [AS|IS] OBJECT(column_list) [sp_c_chistics]

CREATE [OR REPLACE] [DEFINER = user] TYPE type_name [AS|IS] TABLE OF [udt_name|udt_type]

CREATE [OR REPLACE] [DEFINER = user] TYPE type_name [AS|IS] VARRAY(n) OF [udt_name|udt_type]
```

需要先切换到 `ORACLE` 模式下才能支持本语法。

## 2. 定义和用法

GreatSQL支持用户通过 `CREATE TYPE` 创建自定义数据类型，有几点注意事项：

1. 支持常用的 `INT/VARCHAR` 等类型，暂不支持 `TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB` 等几个类型。

2. 在 `VARRAY(n)` 中，n的取值范围：[1024, 18446744073709551615]，默认值为1048576，由全局选项 `tf_udt_table_max_rows` 控制。如果是在MGR集群中使用，则必须确保所有节点的 `tf_udt_table_max_rows` 选项值设置一致，否则可能造成MGR运行报错。

3. 支持跨库访问用户自定义类型。

## 3. Oracle兼容说明

GreatSQL和Oracle自定义类型的使用主要有以下几点不同：

1. 可以定义具体列类型，暂不支持多层类型嵌套定义。

2. 不支持设置或赋默认值。

3. 执行 `SELECT type_name` 结果的显示，会由于GreatSQL跟Oracle终端网络传输协议不一致而不同。可用设置选项 `udt_format_result = 'DBA'` 控制输出格式为字符串格式如 `col1:value | col2:value2`，详见下面示例。

4. 在Oracle中，`TYPE, FUNCTION, PACKAGE` 这些数据对象名都不能重名；在GreatSQL中，`TYPE, FUNCTION, PACKAGE` 这些数据对象名也不能重名，例外的是，`FUNCTION` 和 `PACKAGE`可以重名。

5. 执行 `SELECT type_table` 返回值为输入的字符串，如果想变为表格的形式输出就使用 `TABLE` 函数。

6. 执行 `SELECT type_table()` 的参数必须为定义时候用的type类型对象，否则会报错。

7. 执行 `CREATE TYPE AS TABLE/VARRAY(n) OF type_name` 语句中，`type_name` 只支持 `UDT` 类型，不支持 `UDT TABLE` 类型，即不支持多层嵌套自定义表的类型。

8. 目前不支持 `SELECT * FROM udt_table` 用法，可以改用 `SELECT * FROM TABLE(udt_table)` 来获取udt_table的值。

9. 不支持 `CREATE TABLE table_name AS SELECT udt_table() FROM DUAL` 这种用法。


## 4. 示例

- 1. 示例1：`CREATE TYPE`, `SHOW CREATE TYPE`, `SHOW TYPE STATUS`

```sql
-- 先切换到ORACLE模式
greatsql> SET sql_mode = Oracle;

-- 1. 创建UDT，不支持 IF NOT EXISTS
greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT ,c1 VARCHAR(20));

greatsql> SELECT udt1(1, 'c1_row1') FROM DUAL;
+--------------------+
| udt1(1, 'c1_row1') |
+--------------------+
| id:1 | c1:c1_row1  |
+--------------------+
1 row in set (0.01 sec)

-- 2. 查看UDT DDL
greatsql> SHOW CREATE TYPE udt1\G
*************************** 1. row ***************************
                Type: udt1
            sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
         Create Type: CREATE DEFINER="root"@"localhost" TYPE "udt1" AS OBJECT(id INT ,c1 VARCHAR(20))
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
  Database Collation: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 3. 查看UDT状态
greatsql> SHOW TYPE STATUS LIKE 'udt1'\G
*************************** 1. row ***************************
                  Db: greatsql
                Name: udt1
                Type: TYPE
             Definer: root@localhost
            Modified: 2023-11-22 09:46:23
             Created: 2023-11-22 09:46:23
       Security_type: DEFINER
             Comment:
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
  Database Collation: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 4. 删除UDT，支持 IF EXISTS
greatsql> DROP TYPE IF EXISTS udt1;
Query OK, 0 rows affected (0.00 sec)
```
use db1;
set sql_mode="Oracle";
create or replace type udt1 as object(id INT ,c1 VARCHAR(20));
```


- 2. 示例2：支持将TYPE授权给其他用户

```sql
greatsql> SET sql_mode = Oracle;

greatsql> SELECT CURRENT_USER();
+----------------+
| CURRENT_USER() |
+----------------+
| root@localhost |
+----------------+

greatsql> CREATE OR REPLACE DEFINER = 'u2@localhost' TYPE udt1 AS OBJECT(id INT, c1 CHAR(10)) SQL SECURITY INVOKER;

greatsql> CREATE USER u1@localhost IDENTIFIED BY '';

greatsql> GRANT EXECUTE ON TYPE greatsql.udt1 TO u1@localhost;
```

用 `u1` 账户新建连接，使用UDT：
```sql
$ mysql -S/data/GreatSQL/mysql.sock -uu1 greatsql
...
greatsql> SHOW GRANTS;
+-------------------------------------------------------------+
| Grants for u1@localhost                                     |
+-------------------------------------------------------------+
| GRANT USAGE ON *.* TO "u1"@"localhost"                      |
| GRANT EXECUTE ON TYPE `greatsql`.`udt1` TO "u1"@"localhost" |
+-------------------------------------------------------------+
2 rows in set (0.00 sec)

-- 直接执行会报错
greatsql> SELECT udt1(1, 'c1_row1') FROM DUAL;
ERROR 1370 (42000): execute command denied to user 'u1'@'localhost' for routine 'greatsql.udt1'

-- 要先切换到ORACLE模式
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT udt1(1, 'c1_row1') FROM DUAL;
+-----------------------------------------------+
| udt1(1, 'c1_row1')                            |
+-----------------------------------------------+
|    c1_row1                                   |
+-----------------------------------------------+
1 row in set (0.00 sec)
``` 

- 3. 示例3：`CREATE TYPE AS TABLE/VARRAY OF udt_name`

```sql
greatsql> SET sql_mode = Oracle;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(10));
greatsql> CREATE OR REPLACE TYPE udt2 AS OBJECT(id INT, c1 VARCHAR(10));

greatsql> SELECT @@tf_udt_table_max_rows;
+-----------------------+---------+
| Variable_name         | Value   |
+-----------------------+---------+
| tf_udt_table_max_rows | 1048576 |
+-----------------------+---------+

greatsql> CREATE OR REPLACE TYPE udt1_varray AS VARRAY(1) OF udt1;

greatsql> CREATE OR REPLACE TYPE udt1_varray AS VARRAY(1048577) OF udt1;
ERROR 7556 (HY000): The number of records generated by UDT_TABLE() cannot exceed 1048576 (1048577 requested). Try increasing @@tf_udt_table_max_rows to a larger value.

greatsql> CREATE OR REPLACE TYPE udt1_table AS TABLE OF udt1;

greatsql> SELECT udt1_table(udt1(1, 'c1_row1'), udt1(2, 'c1_row2'));
+----------------------------------------------------+
| udt1_table(udt1(1, 'c1_row1'), udt1(2, 'c1_row2')) |
+----------------------------------------------------+
| udt1_table(udt1(1,c1_row1),udt1(2,c1_row2))        |
+----------------------------------------------------+

greatsql> SELECT udt1_table(udt1(1,'c1_row1'), udt2(2,'c1_row2'));
ERROR 7550 (HY000): inconsistent datatypes: expected 'greatsql'.'udt1' got 'greatsql'.'udt2'

greatsql> SELECT udt1_varray(udt1(1, 'c1_row1'), udt1(2,'c1_row2'));
ERROR 3950 (HY000): Out of memory

greatsql> SELECT udt1_varray(udt1(1, 'c1_row1'));
+---------------------------------+
| udt1_varray(udt1(1, 'c1_row1')) |
+---------------------------------+
| udt1_varray(udt1(1,c1_row1))    |
+---------------------------------+
```

- 4. 示例4：`CREATE TYPE AS TABLE/VARRAY OF TYPE`

```sql
greatsql> CREATE OR REPLACE TYPE my_int IS VARRAY(100) OF INT;

greatsql> select my_int('1', 0, 1);
+-------------------+
| my_int('1', 0, 1) |
+-------------------+
| my_int(1,0,1)     |
+-------------------+

greatsql> CREATE OR REPLACE TYPE my_vchar IS VARRAY(100) OF VARCHAR2(8000);

greatsql> SELECT my_vchar('1', 'GreatSQL', 'GreatSQL is a branch of MySQL');
+------------------------------------------------------------+
| my_vchar('1', 'GreatSQL', 'GreatSQL is a branch of MySQL') |
+------------------------------------------------------------+
| my_vchar(1,GreatSQL,GreatSQL is a branch of MySQL)         |
+------------------------------------------------------------+
```

## 5. TABLE UDT数据字典

```sql
-- 1. 查询 INFORMATION_SCHEMA.ROUTINES 查看所有 UDT
greatsql> SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME LIKE 'UDT%';
+----------------+--------------+--------------+
| ROUTINE_SCHEMA | ROUTINE_NAME | ROUTINE_TYPE |
+----------------+--------------+--------------+
| greatsql       | udt1         | TYPE         |
| greatsql       | udt2         | TYPE         |
| greatsql       | udt1_varray  | TYPE         |
| greatsql       | udt1_table   | TYPE         |
+----------------+--------------+--------------+

-- 2. 查询 INFORMATION_SCHEMA.PARAMETERS 查看UDT定义
greatsql> SELECT SPECIFIC_SCHEMA, SPECIFIC_NAME, ORDINAL_POSITION, PARAMETER_NAME, DATA_TYPE, CHARACTER_OCTET_LENGTH
  FROM INFORMATION_SCHEMA.PARAMETERS WHERE SPECIFIC_NAME LIKE 'UDT%';
+-----------------+---------------+------------------+----------------+-----------+------------------------+
| SPECIFIC_SCHEMA | SPECIFIC_NAME | ORDINAL_POSITION | PARAMETER_NAME | DATA_TYPE | CHARACTER_OCTET_LENGTH |
+-----------------+---------------+------------------+----------------+-----------+------------------------+
| greatsql        | udt1          |                1 | id             | int       |                   NULL |
| greatsql        | udt1          |                2 | c1             | char      |                     40 |
| greatsql        | udt2          |                1 | id             | int       |                   NULL |
| greatsql        | udt2          |                2 | c1             | varchar   |                     40 |
+-----------------+---------------+------------------+----------------+-----------+------------------------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
