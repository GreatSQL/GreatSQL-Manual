# Oracle Compatibility - Syntax - EXTERNAL TABLE
---

GreatSQL supports the external table feature.

An external table is a table that does not exist in the database. By providing metadata that describes the external table to the database, an operating system file can be accessed as a read-only database table, just as if the data were stored in an ordinary database table.

## 1. Syntax

```sql
CREATE TABLE xxx( )
ORGANIZATION EXTERNAL
(
 [ DEFAULT DIRECTORY 'text' ]
 [ LOCATION
  ([ directory: ] 'location_specifier'   )
   ]
)
```

Parameter description:

1. `DEFAULT DIRECTORY`: the storage path of the external file on the operating system.

2. `LOCATION`: defines the location of the external table source file, which can consist of a directory and a file name. The data file naming suffix must be `*.csv` or `*.CSV`. When the specified source file location contains directory information, the `DEFAULT DIRECTORY` parameter does not take effect; otherwise, the source file is read from the directory pointed to by the `DEFAULT DIRECTORY` parameter.

## 2. Definition and Usage

External tables currently support only external CSV format file data. A new `DLK` engine is added on top of the `CSV` engine to manage external tables.

The data source of an external table resides in the file system, and only CSV format files can serve as the data source of an external table.

External tables can be accessed through SQL statements without loading the table data in advance.

Only `SELECT` read-only queries are allowed on external tables. DML operations that modify data (`INSERT`, `UPDATE`, `DELETE`) are not allowed, and indexes cannot be created either.

Column definitions in external tables cannot support NULL, and empty columns cannot be effectively identified when reading external file data.

## 3. Oracle Compatibility Notes

The main differences between the current GreatSQL and Oracle external table features are as follows:

1. GreatSQL external tables do not require a secure directory to be set.

2. GreatSQL external tables can only specify a single file; importing multiple data files is not supported.

3. GreatSQL external tables cannot specify the read format of external files.

4. GreatSQL external tables cannot set the access driver interface of external files.

## 4. Examples

- 1. Prepare the source file first

```shell
$ cat /data/external/extt.CSV

1,"c2_row1","c3_row1"
2,"c2_row2","c3_row2"
3,"c2_row3","c3_row3"
4,"c2_row4","c3_row4"
5,"c2_row5","c3_row5"
6,"c2_row6","c3_row6"
```

- 2. Create an external table

An external table can be created in any of the following different ways:

```sql
-- 1. Define DEFAULT DIRECTORY and LOCATION separately
greatsql> CREATE TABLE extt_t1 (
c1 INT NOT NULL,
c2 VARCHAR(10) NOT NULL,
c3 CHAR(20) NOT NULL)
ORGANIZATION EXTERNAL(
DEFAULT DIRECTORY '/data/external'
LOCATION ('extt.csv'));

-- 2. LOCATION already specifies the full path
greatsql> CREATE TABLE extt_t2 (
c1 INT NOT NULL,
c2 VARCHAR(10) NOT NULL,
c3 CHAR(20) NOT NULL) 
ORGANIZATION EXTERNAL ( 
LOCATION ( '/data/external' : 'extt.csv'));

-- 3. LOCATION already specifies the full path; the DEFAULT DIRECTORY parameter is ignored
greatsql> CREATE TABLE extt_t3 (
c1 INT NOT NULL,
c2 VARCHAR(10) NOT NULL,
c3 CHAR(20) NOT NULL)
ORGANIZATION EXTERNAL(
DEFAULT DIRECTORY '/tmp'
LOCATION ('/data/external' : 'extt.csv'));

greatsql> SELECT * FROM extt_t1;
+----+---------+---------+
| c1 | c2      | c3      |
+----+---------+---------+
|  1 | c2_row1 | c3_row1 |
|  2 | c2_row2 | c3_row2 |
|  3 | c2_row3 | c3_row3 |
|  4 | c2_row4 | c3_row4 |
|  5 | c2_row5 | c3_row5 |
|  6 | c2_row6 | c3_row6 |
+----+---------+---------+
6 rows in set (0.00 sec)

-- The checksums of the three tables are consistent
greatsql> CHECKSUM TABLE extt_t1, extt_t2, extt_t3;
+------------------+------------+
| Table            | Checksum   |
+------------------+------------+
| greatsql.extt_t1 | 1347810397 |
| greatsql.extt_t2 | 1347810397 |
| greatsql.extt_t3 | 1347810397 |
+------------------+------------+
```

- 3. Accessing and managing external tables

```sql
-- 1. View the table DDL
-- The DDL of the other two external tables is the same
greatsql> SHOW CREATE TABLE extt_t1\G
*************************** 1. row ***************************
       Table: extt_t1
Create Table: CREATE TABLE `extt_t1` (
  `c1` int NOT NULL,
  `c2` varchar(10) NOT NULL,
  `c3` char(20) NOT NULL
) ORGANIZATION EXTERNAL ( LOCATION ( '/data' : 'extt.csv'))

-- 2. Drop the external tables
greatsql> DROP TABLE extt_t1, extt_t2, extt_t3;
Query OK, 0 rows affected (0.01 sec)

-- After dropping all external tables, the source files still exist and are not deleted synchronously
$ ls -la /data/external/extt.csv
-rw-r--r-- 1 root root 132 Nov 20 13:35 /data/external/extt.csv
```

- 4. Unsupported external table operations

Some operation types are not supported for external tables: `INSERT`, `UPDATE`, `DELETE`, `ALTER TABLE`, `TRUNCATE`, `CREATE INDEX`.

```sql
greatsql> CREATE INDEX idx_c1 ON extt_t1(c1);
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option

greatsql> ALTER TABLE extt_t1 ADD c4 INT NOT NULL;
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option

greatsql> ALTER TABLE extt_t1 DROP c3;
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option

greatsql> DELETE FROM extt_t1;
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option

greatsql> UPDATE extt_t1 SET c2 = 'row2' WHERE c1 = 2;
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option

greatsql> TRUNCATE TABLE extt_t1;
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option

greatsql> INSERT INTO extt_t1 VALUES (7,'c2_row7','c3_row7');
ERROR 1031 (HY000): Table storage engine for 'extt_t1' doesn't have this option
```

## 5. External Table Data Dictionary

```sql
-- Query tables with ENGINE = 'DLK'
greatsql> SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'greatsql' AND ENGINE = 'DLK';
+---------------+--------------+------------+------------+--------+---------+------------+------------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+-------------+------------+--------------------+----------+----------------+---------------+
| TABLE_CATALOG | TABLE_SCHEMA | TABLE_NAME | TABLE_TYPE | ENGINE | VERSION | ROW_FORMAT | TABLE_ROWS | AVG_ROW_LENGTH | DATA_LENGTH | MAX_DATA_LENGTH | INDEX_LENGTH | DATA_FREE | AUTO_INCREMENT | CREATE_TIME         | UPDATE_TIME | CHECK_TIME | TABLE_COLLATION    | CHECKSUM | CREATE_OPTIONS | TABLE_COMMENT |
+---------------+--------------+------------+------------+--------+---------+------------+------------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+-------------+------------+--------------------+----------+----------------+---------------+
| def           | greatsql     | extt_t1    | BASE TABLE | dlk    |      10 | Dynamic    |          2 |              0 |           0 |               0 |            0 |         0 |           NULL | 2023-11-20 13:59:06 | NULL        | NULL       | utf8mb4_0900_ai_ci |     NULL |                |               |
| def           | greatsql     | extt_t2    | BASE TABLE | dlk    |      10 | Dynamic    |          2 |              0 |           0 |               0 |            0 |         0 |           NULL | 2023-11-20 13:59:10 | NULL        | NULL       | utf8mb4_0900_ai_ci |     NULL |                |               |
| def           | greatsql     | extt_t3    | BASE TABLE | dlk    |      10 | Dynamic    |          2 |              0 |           0 |               0 |            0 |         0 |           NULL | 2023-11-20 13:59:15 | NULL        | NULL       | utf8mb4_0900_ai_ci |     NULL |                |               |
+---------------+--------------+------------+------------+--------+---------+------------+------------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+-------------+------------+--------------------+----------+----------------+---------------+
3 rows in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
