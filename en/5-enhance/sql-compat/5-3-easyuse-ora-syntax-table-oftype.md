# Oracle Compatibility - Syntax - CREATE TABLE OF TYPE
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

CREATE TABLE [IF NOT EXISTS] table_name OF type_name [table options]
```

You need to switch to `ORACLE` mode first to support this syntax.

## 2. Definition and Usage

GreatSQL supports users creating tables with custom data types through `CREATE TABLE OF TYPE`.

## 3. Oracle Compatibility Notes

The compatibility of `CREATE TABLE OF TYPE` in GreatSQL with Oracle is described as follows:

1. The `CREATE TEMPORARY TABLE OF TYPE` usage is not supported.

2. When creating a table, the following attributes cannot be set in the `table options` parameter: `SECONDARY_ENGINE, AVG_ROW_LENGTH, ROW_FORMAT, SECONDARY_ENGINE_ATTRIBUTE, UNION, AUTO_INCREMENT, PARTITION BY`, etc.

3. Modifying the table structure is not allowed, but operations such as `ALTER TABLE ... RENAME`, `ALTER TABLE ... COMMENT`, `CREATE INDEX`, `DROP INDEX`, `ALTER INDEX` are supported.

4. If other tables have dependency/inheritance relationships, `DROP TABLE TYPE` is not allowed until these tables are dropped.

5. Cross-schema references are supported when creating a new table, but the referenced `TABLE TYPE` must be in the same Schema.

6. Both `INSERT ... VALUES` and `INSERT ... SELECT` are supported for writing data.

7. Inserting a `TYPE = NULL` value is not allowed, but inserting a `TYPE(NULL,NULL)` value is allowed.

8. When updating data, columns can only be updated one-to-one; updating with a form like `UPDATE TABLE SET(col1, col2) = (udt_type(val1, val2))` is not supported.

## 4. Examples

- 1. Example 1: create a table and write data

```sql
greatsql> SET sql_mode = ORACLE;

-- 1. Create a table
greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));

greatsql> CREATE TABLE tf_t1 OF udt1;

-- 2. Write data INSERT ... VALUES
greatsql> INSERT INTO tf_t1 VALUES(1, 'c1_row1');

-- 3. Write data INSERT ... SELECT
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

-- 4. View the table structure
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

- 2. Example 2: modify the table

This example is based on the tables and data in example 1 and is not executed again.

```sql
-- The table structure cannot be modified
greatsql> ALTER TABLE tf_t1 ADD i INT;
ERROR 7552 (HY000): cannot alter column from an object type table

greatsql> ALTER TABLE tf_t1 DROP COLUMN id;
ERROR 7552 (HY000): cannot alter column from an object type table

greatsql> ALTER TABLE tf_t1 MODIFY c1 CHAR(20);
ERROR 7552 (HY000): cannot alter column from an object type table

-- A COMMENT can be added
greatsql> ALTER TABLE tf_t1 COMMENT ='UDT TABLE';

-- An index can also be created
greatsql> CREATE INDEX idx_c1 ON tf_t1(c1);

greatsql> SHOW CREATE TABLE tf_t1\G
*************************** 1. row ***************************
       Table: tf_t1
Create Table: CREATE TABLE "tf_t1" (
  "id" int DEFAULT NULL,
  "c1" varchar(20) DEFAULT NULL,
  KEY "idx_c1" ("c1")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='UDT TABLE'

-- Creating an index on a UDT column is not supported; an index can only be created on a normal column
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

## 5. TABLE TYPE Data Dictionary

```sql
-- 1. Query information_schema.TABLES to view all TABLES

-- In the query results, tables whose CREATE_OPTIONS contains the udt_name keyword
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, CREATE_OPTIONS, TABLE_COMMENT
  FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'greatsql';
+--------------+------------+-----------------+---------------+
| TABLE_SCHEMA | TABLE_NAME | CREATE_OPTIONS  | TABLE_COMMENT |
+--------------+------------+-----------------+---------------+
| greatsql     | tf_t1      | udt_name="udt1" | UDT TABLE     |
| greatsql     | tf_t2      |                 |               |
+--------------+------------+-----------------+---------------+

-- 2. Query information_schema.COLUMNS to view all columns in the table
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

## 6. Export Backup

Because `CREATE TABLE OF TYPE` needs to inherit the user-defined data type from `UDT`, when using `mysqldump` to export data, you also need to specify the `--routines` option (off by default) to export the UDT as well; otherwise, the restore will fail.

Example:
```
mysqldump -S/data/GreatSQL/mysql.sock -uroot -pxxx -B greatsql --routines > /data/backup/GreatSQL/greatsql-ddl.sql
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
