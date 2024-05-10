# Oracle兼容-语法-CREATE TABLE OF TYPE
---


## 1. 语法

```sql
SET sql_mode = ORACLE;

CREATE TABLE [IF NOT EXISTS] table_name OF type_name [table options]
```

需要先切换到 `ORACLE` 模式下才能支持本语法。

## 2. 定义和用法

GreatSQL支持用户通过 `CREATE TABLE OF TYPE` 创建自定义数据类型。


## 3. Oracle兼容说明

GreatSQL中的`CREATE TABLE OF TYPE`与Oracle兼容情况说明如下：

1. 不支持 `CREATE TEMPORARY TABLE OF TYPE` 用法。

2. 建表时表定义参数 `table options` 中不支持设置 `SECONDARY_ENGINE, AVG_ROW_LENGTH, ROW_FORMAT, SECONDARY_ENGINE_ATTRIBUTE, UNION, AUTO_INCREMENT, PARTITION BY` 等几个属性。

3. 不允许修改表结构，但支持 `ALTER TABLE ... RENAME, ALTER TABLE ... COMMENT, CREATE INDEX, DROP INDEX, ALTER INDEX` 等几种操作。

4. 若有其他表存在依赖/继承关系，在删除这些表之前不允许 `DROP TABLE TYPE`。

5. 支持跨库引用创建新表，但必须和引用的 `TABLE TYPE` 在同一个Schema里。

6. 支持 `INSERT ... VALUES` 和 `INSERT ... SELECT` 两种方式写入数据。

7. 不允许插入 `TYPE = NULL` 值，但可以插入 `TYPE(NULL,NULL)` 值。

8. 更新数据时，只能对列进行一对一更新，不能使用类似 `UPDATE TABLE SET(col1, col2) = (udt_type(val1, val2))` 方式进行更新。

## 4. 示例


- 1. 示例1：建表及写数据

```sql
greatsql> SET sql_mode = ORACLE;

-- 1. 建表
greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));

greatsql> CREATE TABLE tf_t1 OF udt1;

-- 2. 写数据 INSERT ... VALUES
greatsql> INSERT INTO tf_t1 VALUES(1, 'c1_row1');

-- 3. 写数据 INSERT ... SELECT
greatsql> INSERT INTO tf_t1 SELECT udt1(2, 'c1_row2');

greatsql> SELECT * FROM tf_t1;
+------+---------+
| id   | c1      |
+------+---------+
|    1 | c1_row1 |
|    2 | c1_row2 |
+------+---------+

greatsql> CREATE TABLE tf_t2 (id INT, c1 udt1);

greatsql> INSERT INTO tf_t2 VALUES(10, udt1(10, 'tf_t2_row10')),
(20, udt1(20,'tf_t2_row20')),
(30, udt1(30,'tf_t2_row30')),
(40, udt1(40,'tf_t2_row40'));

greatsql> INSERT INTO tf_t1 SELECT c1 FROM tf_t2;

greatsql> SET udt_format_result = DBA;

greatsql> SELECT * FROM tf_t2;
+------+------------------------+
| id   | c1                     |
+------+------------------------+
|   10 | id:10 | c1:tf_t2_row10 |
|   20 | id:20 | c1:tf_t2_row20 |
|   30 | id:30 | c1:tf_t2_row30 |
|   40 | id:40 | c1:tf_t2_row40 |
+------+------------------------+

greatsql> SELECT * FROM tf_t1;
+------+-------------+
| id   | c1          |
+------+-------------+
|    1 | c1_row1     |
|    2 | c1_row2     |
|   10 | tf_t2_row10 |
|   20 | tf_t2_row20 |
|   30 | tf_t2_row30 |
|   40 | tf_t2_row40 |
+------+-------------+

-- 4. 查看表结构
greatsql> SHOW CREATE TABLE tf_t1\G
*************************** 1. row ***************************
       Table: tf_t1
Create Table: CREATE TABLE "tf_t1" (
  "id" int DEFAULT NULL,
  "c1" varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SHOW CREATE TABLE tf_t2\G
*************************** 1. row ***************************
       Table: tf_t2
Create Table: CREATE TABLE "tf_t2" (
  "id" int DEFAULT NULL,
  "c1" udt1 DEFAULT NULL,
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

- 2. 示例2：修改表

本示例基于示例1中的表和数据，不再重复执行。

```sql
-- 不能修改表结构
greatsql> ALTER TABLE tf_t1 ADD i INT;
ERROR 7552 (HY000): cannot alter column from an object type table

greatsql> ALTER TABLE tf_t1 DROP COLUMN id;
ERROR 7552 (HY000): cannot alter column from an object type table

greatsql> ALTER TABLE tf_t1 MODIFY c1 CHAR(20);
ERROR 7552 (HY000): cannot alter column from an object type table

-- 可以增加COMMENT
greatsql> ALTER TABLE tf_t1 COMMENT ='UDT TABLE';

-- 还可以创建索引
greatsql> CREATE INDEX idx_c1 ON tf_t1(c1);

greatsql> SHOW CREATE TABLE tf_t1\G
*************************** 1. row ***************************
       Table: tf_t1
Create Table: CREATE TABLE "tf_t1" (
  "id" int DEFAULT NULL,
  "c1" varchar(20) DEFAULT NULL,
  KEY "idx_c1" ("c1")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='UDT TABLE'

-- 不支持对UDT列创建索引，只能对普通列创建索引
greatsql> CREATE INDEX idx_c1 ON tf_t2(id, c1);
ERROR 7549 (42000): Udf type column 'c1' can't be used in key specification with the used table type

greatsql> CREATE INDEX idx_c1 ON tf_t2(id);

greatsql> SHOW CREATE TABLE tf_t2\G
*************************** 1. row ***************************
       Table: tf_t2
Create Table: CREATE TABLE "tf_t2" (
  "id" int DEFAULT NULL,
  "c1" udt1 DEFAULT NULL,
  KEY "idx_c1" ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## 5. TABLE TYPE数据字典

```sql
-- 1. 查询 information_schema.TABLES 查看所有 TABLE

-- 查询结果中，CREATE_OPTIONS包含udt_name关键字的表
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, CREATE_OPTIONS, TABLE_COMMENT
  FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'greatsql';
+--------------+------------+-----------------+---------------+
| TABLE_SCHEMA | TABLE_NAME | CREATE_OPTIONS  | TABLE_COMMENT |
+--------------+------------+-----------------+---------------+
| greatsql     | tf_t1      | udt_name="udt1" | UDT TABLE     |
| greatsql     | tf_t2      |                 |               |
+--------------+------------+-----------------+---------------+

-- 2. 查询 information_schema.COLUMNS 查看表中所有列
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, DATA_TYPE, EXTRA
  FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'greatsql';
+--------------+------------+-------------+------------------+-----------+-----------------+
| TABLE_SCHEMA | TABLE_NAME | COLUMN_NAME | ORDINAL_POSITION | DATA_TYPE | EXTRA           |
+--------------+------------+-------------+------------------+-----------+-----------------+
| greatsql     | tf_t1      | id          |                1 | int       |                 |
| greatsql     | tf_t1      | c1          |                2 | varchar   |                 |
| greatsql     | tf_t2      | id          |                1 | int       |                 |
| greatsql     | tf_t2      | c1          |                2 | udt1      | udt_name="udt1" |
+--------------+------------+-------------+------------------+-----------+-----------------+
```

## 6. 导出备份

由于 `CREATE TABLE OF TYPE` 需要从 `UDT` 中继承用户自定义的数据类型，因此在使用 `mysqldump` 导出数据时，还需要再指定 `--routines` 选项（默认为关闭），把UDT也一并导出，否则会导致在恢复数据时失败。

示例：
```
mysqldump -S/data/GreatSQL/mysql.sock -uroot -pxxx -B greatsql --routines > /data/backup/GreatSQL/greatsql-ddl.sql
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
