# Oracle兼容-语法-TABLE UDT
---
[toc]

## 1. 语法

```sql
SET sql_mode = ORACLE;

CREATE TABLE table_name(column_name type, column_name type ...) 
  type：nomally type/udt type:[db.]type(不支持varray/table类型udt).

INSERT INTO table_name VALUES(values) 
  values:nomally value/udt value
  udt value:[db.]udt_name(values)
```

需要先切换到 `ORACLE` 模式下才能支持本语法。

## 2. 定义和用法

GreatSQL支持用户自定义TABLE类型，支持以下几种用法：

- 语法1：执行 `CREATE TABLE(udt_name udt_type)` 创建UDT列。

- 语法2：向UDT列插入UDT值。

- 语法3：添加和删除UDT列。

- 语法4：可设置 `udt_format_result` 会话选项指定UDT类型数据的输出格式。


GreatSQL的TABLE UDT有以下几条限制：

1. TABLE UDT不能跨Schema使用。

2. 在ORACLE模式下，关键词 `TYPE` 不能作为Schema名或User名。

3. 目前只支持 `name = udt_type()` 函数，UDT列不支持用在其他内置函数。

4. UDT列不支持 `TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB` 等几个数据类型。


## 3. Oracle兼容说明


GreatSQL中的TABLE UDT与Oracle兼容情况说明如下：

1. 不支持对UDT列设定默认值，也不支持设置为 `PRIMARY KEY/FOREIGN KEY/CONSTRAINT/NULL/NOT NULL/INVISIBLE/VIRTUAL` 等属性。

2. 只允许对UDT列插入UDT值，其他类型值不允许插入UDT列；UDT值也不允许插入其他类型列。

3. 不支持对UDT列执行 `CREATE INDEX/ORDER BY/GROUP BY/PARTITION BY/CREATE VIEW/ALTER MODIFY` 等操作行为。

4. 只能添加和删除UDT列，不支持 `MODIFY` 修改UDT列。

5. 支持 `CREATE VIEW`，mysql.routines的table_count值不改变。区别是如果使用udt type的table删除而view没有删除，也支持删除该udt type。

6. UDT列的成员列不允许单独使用在独立的SQL语句中，比如 `udt_type.id` 这种用法（Oracle支持该用法）。

7. UDT列不支持用在大部分内置函数中，除了在查询条件中用于比大小以及 `ISNULL/IS NOT NULL`，比如 `WHERE c1 = udt_type1(1, 'r1')`。

8. UDT列不支持 `CREATE TEMPORARY TABLE` 用法。

9. 执行 `SHOW CREATE TABLE WITH udt_type` 显示的UDT列类型就是TYPE的名字。

10. 选项`udt_format_result` 默认值为 `BINARY`，即输出结果显式为BINARY格式，否则正常显示格式（`udt_format_result = DBA`）。

11. 不支持 `BLOB/MEDIUM_BLOB/LONG_BLOB/TINY_BLOB` 等数据类型。

12. 对于跨库表的操作，要求UDT type和UDT table指定的Schema名一致，具体如下：
```
greatsql> use greatsql;

-- 下例中的 udt_type1 等同于 greatsql.udt_type1
-- 此时t1会创建失败，因为t1在db2中，而udt_type1在greatsql中，不在同一个Schema
greatsql> CREATE TABLE db2.t1(id INT, u1 udt_type1);

-- 下例中 udt_type1 等同于 greatsql.udt_type1
-- 此时插入失败，因为t1在db2中，而udt_type1在greatsql中，不在同一个Schema
greatsql> INSERT INTO db2.t1 VALUES(1, udt_type1(1, 'a'));这里的udt_type1指的是db1.udt_type1.

-- 需要修改成下面这样
greatsql> INSERT INTO db2.t1 VALUES(1, db2.udt_type1(1, 'a'));

-- 这里指的是db1.udt_type1，如果想成功创建，需要指定db2.udt_type1
greatsql> ALTER TABLE db2.t1 ADD c2 udt_type1;
```

13. 插入语句 `INSERT INTO t1 VALUES udt_type(NULL)` 和 `INSERT INTO t1 VALUES(NULL)` 实际写入值是不一样的，写入完后执行 `SELECT * FROM t1 WHERE udt_type IS NULL` 查询的结果是后者，而非前者。

14. 在类似 `SELECT * FROM t1 WHERE udt_type1 [<|=|>] udt_type1` 的比较查询中，如果是字符串则会按照 `BINARY` 格式进行比较；而在Oracle中是当小于或者大于的时候直接报错，而等于的时候直接返回空值。这点与Oracle不一致。

15. 在类似 `SELECT * FROM t1 WHERE udt_type1 [<|=|>] udt_type2` 的比较查询中，由于 `udt_type1` 的 `udt name` 不等于 `udt_type2` 的 `udt name`，所以会报错；而Oracle是在等于查询的时候直接返回空值，这点与Oracle不一致。

16. 通过查询系统表 `INFORMATION_SCHEMA.COLUMNS` 的 `extra` 列中是否带有 `udt_name` 信息，就可知道哪些表的列带有udt类型。例如：
```sql
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'udt_t1';
+--------------+------------+-------------+-----------+-----------------+
| TABLE_SCHEMA | TABLE_NAME | COLUMN_NAME | DATA_TYPE | EXTRA           |
+--------------+------------+-------------+-----------+-----------------+
| greatsql     | udt_t1     | id          | int       |                 |
| greatsql     | udt_t1     | c1          | udt1      | udt_name="udt1" |
+--------------+------------+-------------+-----------+-----------------+
2 rows in set (0.00 sec)
```


## 4. 示例


- 1. 示例1：`CREATE TABLE` 用法

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);


-- 不支持的用法
greatsql> CREATE OR REPLACE TYPE udt_t1 IS TABLE OF INT;
greatsql> CREATE TABLE t1(id INT, c1 udt_t1);
ERROR 1235 (42000): This version of MySQL doesn't yet support 'create table with udt table'
```

- 2. 示例2：`INSERT INTO TABLE` 用法

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> set udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);
greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1'));
greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
+------+-------------------+
1 row in set (0.00 sec)
```

- 3. 示例3：`ALTER TABLE ADD`

```sql
greatsql> SET SQL_MODE=ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> ALTER TABLE udt_t1 ADD c2 udt1;
Query OK, 0 rows affected (0.00 sec)
Records: 0  Duplicates: 0  Warnings: 0

greatsql> SHOW CREATE TABLE udt_t1\G
*************************** 1. row ***************************
       Table: udt_t1
Create Table: CREATE TABLE `udt_t1` (
  `id` int DEFAULT NULL,
  `c1` udt1 DEFAULT NULL,
  `c2` udt1 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)
```

- 4. 示例4：`ALTER TABLE DROP`

```sql
greatsql> SET SQL_MODE=ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> ALTER TABLE udt_t1 ADD c2 udt1;
greatsql> ALTER TABLE udt_t1 DROP c2;

greatsql> SHOW CREATE TABLE udt_t1\G
*************************** 1. row ***************************
       Table: udt_t1
Create Table: CREATE TABLE `udt_t1` (
  `id` int DEFAULT NULL,
  `c1` udt1 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

- 5. 示例5：`DROP TABLE/DROP TYPE`

```sql
greatsql> SET sql_mode = ORACLE;

-- 删除UDT前，要先删除关联的表，否则会失败
greatsql> DROP TYPE udt1;
ERROR 7549 (HY000): Failed to drop type t_air with type or table dependents.

greatsql> DROP TABLE udt_t1;
Query OK, 0 rows affected (0.00 sec)

greatsql> DROP TYPE udt1;
Query OK, 0 rows affected (0.00 sec)
```


- 6. 示例6：`CREATE VIEW`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> CREATE VIEW v1 AS SELECT * FROM udt_t1;
greatsql> SHOW CREATE VIEW v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` AS select `udt_t1`.`id` AS `id`,`udt_t1`.`c1` AS `c1` from `udt_t1`
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
```

- 7. 示例7：查询与函数

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM udt_t1 WHERE c1 = udt1(1, 'c1_row1');
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
+------+-------------------+
1 row in set (0.00 sec)

greatsql> select c1 || udt1(3, 'c1_row3') FROM udt_t1;
ERROR 1235 (42000): This version of MySQL doesn't yet support 'udt type columns used in function'

greatsql> SELECT c1 FROM udt_t1 GROUP BY c1;
ERROR 7548 (HY000): cannot ORDER objects without window function or ORDER method

greatsql> ALTER TABLE udt_t1 ADD c2 udt1;
greatsql> SELECT * FROM udt_t1;
+------+-------------------+------+
| id   | c1                | c2   |
+------+-------------------+------+
|    1 | id:1 | c1:c1_row1 | NULL |
|    2 | id:2 | c1:c1_row2 | NULL |
+------+-------------------+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM udt_t1 WHERE c2 IS NULL;
+------+-------------------+------+
| id   | c1                | c2   |
+------+-------------------+------+
|    1 | id:1 | c1:c1_row1 | NULL |
|    2 | id:2 | c1:c1_row2 | NULL |
+------+-------------------+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM udt_t1 WHERE ISNULL(c2);
+------+-------------------+------+
+------+-------------------+------+
| id   | c1                | c2   |
+------+-------------------+------+
|    1 | id:1 | c1:c1_row1 | NULL |
|    2 | id:2 | c1:c1_row2 | NULL |
+------+-------------------+------+

greatsql> UPDATE udt_t1 SET c2 = c1 WHERE id = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM udt_t1;
+------+-------------------+-------------------+
| id   | c1                | c2                |
+------+-------------------+-------------------+
|    1 | id:1 | c1:c1_row1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 | NULL              |
+------+-------------------+-------------------+
2 rows in set (0.00 sec)

greatsql> SELECT c2 = c1, c2 > c1, c2 < c1 FROM udt_t1;
+---------+---------+----------+
| c2 = c1 | c2 > c1 | c2 < c1  |
+---------+---------+----------+
|       1 |       0 |        0 |
|    NULL |    NULL |     NULL |
+---------+---------+----------+
2 rows in set (0.00 sec)
```

- 8. 示例8：`UPDATE SET`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> UPDATE udt_t1 SET c1 = udt1(50, 'c1_row1') WHERE id = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM udt_t1;
+------+--------------------+
| id   | c1                 |
+------+--------------------+
|    1 | id:50 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2  |
+------+--------------------+
2 rows in set (0.00 sec)
```

- 9. 示例9：`CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  CURSOR cur1 (i_id INT) IS SELECT * FROM udt_t1 WHERE id = i_id;
  rec cur1%ROWTYPE;
BEGIN
  FOR rec IN cur1(2)
  LOOP
    SELECT rec.id, rec.c1;
  END LOOP;
END; //

greatsql> call p1() //
+--------+-------------------+
| rec.id | rec.c1            |
+--------+-------------------+
|      2 | id:2 | c1:c1_row2 |
+--------+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 10. 示例10：`%TYPE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1(min INT,max INT) AS
  CURSOR cur(pmin INT, pmax INT) IS SELECT c1 FROM udt_t1 WHERE id BETWEEN pmin AND pmax;
  v_c1 udt_t1.c1%TYPE;
BEGIN
  OPEN cur(min, max);
  LOOP
    FETCH cur INTO v_c1;
    EXIT WHEN cur%NOTFOUND;
    select v_c1;
  END LOOP;
  CLOSE cur;
END; //

greatsql> call p1(1,10) //
+-------------------+
| v_c1              |
+-------------------+
| id:1 | c1:c1_row1 |
+-------------------+
1 row in set (0.00 sec)

+-------------------+
| v_c1              |
+-------------------+
| id:2 | c1:c1_row2 |
+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 11. 示例11：udt_format_result

客户端建立新连接，加上参数 `--binary-as-hex`：
```
$ mysql -A -S/data/GreatSQL/mysql.sock --binary-as-hex greatsql

-- 建立连接时，加上--binary-as-hex就会有下面的标识
greatsql> \s
...
Binary data as:         Hexadecimal
...

-- 参数udt_format_result默认值为BINARY
greatsql> select @@udt_format_result;
+---------------------+
| @@udt_format_result |
+---------------------+
| BINARY              |
+---------------------+

greatsql> SELECT * FROM udt_t1;
+------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| id   | c1                                                                                                                                                                           |
+------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|    1 | 0xFC0100000063315F726F773120202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020 |
|    2 | 0xFC0200000063315F726F773220202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020 |
+------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
2 rows in set (0.00 sec)

-- 修改 udt_format_result = 'DBA'
greatsql> SET udt_format_result = 'DBA';

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)
```

## 5. TABLE UDT数据字典

```sql
-- 1. 查询 INFORMATION_SCHEMA.ROUTINES 查看所有 UDT
greatsql> SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'UDT1'\G
*************************** 1. row ***************************
           SPECIFIC_NAME: udt1
         ROUTINE_CATALOG: def
          ROUTINE_SCHEMA: greatsql
            ROUTINE_NAME: udt1
            ROUTINE_TYPE: TYPE
               DATA_TYPE:
CHARACTER_MAXIMUM_LENGTH: NULL
  CHARACTER_OCTET_LENGTH: NULL
       NUMERIC_PRECISION: NULL
           NUMERIC_SCALE: NULL
      DATETIME_PRECISION: NULL
      CHARACTER_SET_NAME: NULL
          COLLATION_NAME: NULL
          DTD_IDENTIFIER: NULL
            ROUTINE_BODY: SQL
      ROUTINE_DEFINITION:
           EXTERNAL_NAME: NULL
       EXTERNAL_LANGUAGE: SQL
         PARAMETER_STYLE: SQL
        IS_DETERMINISTIC: NO
         SQL_DATA_ACCESS: CONTAINS SQL
                SQL_PATH: NULL
           SECURITY_TYPE: DEFINER
                 CREATED: 2023-11-21 13:51:40
            LAST_ALTERED: 2023-11-21 13:51:47
                SQL_MODE: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
         ROUTINE_COMMENT:
                 DEFINER: root@localhost
    CHARACTER_SET_CLIENT: utf8mb4
    COLLATION_CONNECTION: utf8mb4_0900_ai_ci
      DATABASE_COLLATION: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 2. 查询 INFORMATION_SCHEMA.PARAMETERS 查看UDT定义
greatsql> SELECT * FROM INFORMATION_SCHEMA.PARAMETERS WHERE SPECIFIC_NAME = 'udt1'\G
*************************** 1. row ***************************
        SPECIFIC_CATALOG: def
         SPECIFIC_SCHEMA: greatsql
           SPECIFIC_NAME: udt1
        ORDINAL_POSITION: 1
          PARAMETER_MODE: IN
          PARAMETER_NAME: id
               DATA_TYPE: int
CHARACTER_MAXIMUM_LENGTH: NULL
  CHARACTER_OCTET_LENGTH: NULL
       NUMERIC_PRECISION: 10
           NUMERIC_SCALE: 0
      DATETIME_PRECISION: NULL
      CHARACTER_SET_NAME: NULL
          COLLATION_NAME: NULL
          DTD_IDENTIFIER: int
            ROUTINE_TYPE: TYPE
*************************** 2. row ***************************
        SPECIFIC_CATALOG: def
         SPECIFIC_SCHEMA: greatsql
           SPECIFIC_NAME: udt1
        ORDINAL_POSITION: 2
          PARAMETER_MODE: IN
          PARAMETER_NAME: c1
               DATA_TYPE: char
CHARACTER_MAXIMUM_LENGTH: 20
  CHARACTER_OCTET_LENGTH: 80
       NUMERIC_PRECISION: NULL
           NUMERIC_SCALE: NULL
      DATETIME_PRECISION: NULL
      CHARACTER_SET_NAME: utf8mb4
          COLLATION_NAME: utf8mb4_0900_ai_ci
          DTD_IDENTIFIER: char(20)
            ROUTINE_TYPE: TYPE
2 rows in set (0.00 sec)
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
