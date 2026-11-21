# Data Types

This section describes the commonly used data types in GreatSQL, including the following:

## Integer Types

1. **TINYINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **Range**: -128 to 127 (signed/SIGNED); 0 to 255 (unsigned/UNSIGNED)
   - **Storage**: 1 byte
   - **Precautions**: suitable for integers with an extremely small range.

2. **SMALLINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **Range**: -32768 to 32767 (signed/SIGNED); 0 to 65535 (unsigned/UNSIGNED)
   - **Storage**: 2 bytes
   - **Precautions**: suitable for integers with a small range.

3. **MEDIUMINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **Range**: -8388608 to 8388607 (signed/SIGNED); 0 to 16777215 (unsigned/UNSIGNED)
   - **Storage**: 3 bytes
   - **Precautions**: suitable for integers with a medium range.

4. **INT[(M)] [UNSIGNED] [ZEROFILL]**
   - INTEGER is an alias of INT and is used in the same way
   - **Range**: -2147483648 to 2147483647 (signed); 0 to 4294967295 (unsigned)
   - **Storage**: 4 bytes
   - **Precautions**: the most commonly used integer data type. It is also often used as the AUTO_INCREMENT primary key type of large tables and is suitable for the vast majority of scenarios.

5. **BIGINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **Range**: -2^63 to 2^63-1 (signed/SIGNED); 0 to 2^64-1 (unsigned/UNSIGNED)
   - **Storage**: 8 bytes
   - **Precautions**: suitable for integers with an extremely large range; often used as the AUTO_INCREMENT primary key type of large tables.

6. **UNSIGNED**, the unsigned flag. If this flag is not specified, the number is signed.

7. **ZEROFILL**, the zero-padding flag. If this flag is specified and a length M is defined, the query results are padded with leading zeros, but this does not affect the data actually stored.

Examples:

```sql
greatsql> CREATE TABLE t_int(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 INT(20) UNSIGNED zerofill NOT NULL,
  c2 INT DEFAULT 10);
greatsql> SHOW CREATE TABLE t_int\G
*************************** 1. row ***************************
       Table: t_int
Create Table: CREATE TABLE `t_int` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` int(20) unsigned zerofill NOT NULL,
  `c2` int DEFAULT '10',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- The id column is AUTO_INCREMENT, so 0 can be specified
greatsql> insert into t_int values(0, 1, 1);

-- Negative numbers are not allowed for the c1 column
greatsql> INSERT INTO t_int VALUES(0, -2, -2);
ERROR 1264 (22003): Out of range value for column 'c1' at row 1

greatsql> INSERT INTO t_int VALUES(0, 2, -2);

greatsql> INSERT INTO t_int VALUES(0, 3, 0);

-- NULL is allowed for the c2 column
greatsql> INSERT INTO t_int VALUES(0, 4, NULL);

-- Only the value of c1 is specified; the default value is used for c2
greatsql> INSERT INTO t_int(c1) VALUES(5);
Query OK, 1 row affected (0.00 sec)

greatsql> SELECT * FROM t_int;
+----+----------------------+------+
| id | c1                   | c2   |
+----+----------------------+------+
|  1 | 00000000000000000001 |    1 |
|  2 | 00000000000000000002 |   -2 |
|  3 | 00000000000000000003 |    0 |
|  4 | 00000000000000000004 | NULL |
|  5 | 00000000000000000005 |   10 |
+----+----------------------+------+
```

## Floating-Point Types

1. **FLOAT[(M,D)] [UNSIGNED] [ZEROFILL]**
   - **Range**: 4 bytes (single precision): -3.402823466E+38 to -1.175494351E-38, 0, 1.175494351E-38 to 3.402823466E+38; unsigned: 0 to 3.402823466E+38
   - **Storage**:
     - FLOAT, 4 bytes
     - FLOAT(p), 4 bytes when 0 <= p <= 24, 8 bytes when 25 <= p <= 53
   - **Precautions**: floating-point numbers may lose precision during computation; suitable for scenarios that need floating-point numbers, such as scientific computing.

2. **DOUBLE(M, D) [UNSIGNED] [ZEROFILL]**
   - **Range**: 8 bytes (double precision): -1.7976931348623157E+308 to -2.2250738585072014E-308, 0, 2.2250738585072014E-308 to 1.7976931348623157E+308; unsigned: 0 to 1.7976931348623157E+308
   - **Storage**: 8 bytes
   - **Precautions**: double-precision floating-point numbers provide higher precision and a wider range but use more storage space; suitable for scenarios that need high-precision computation.

3. Floating-point types may cause precision loss, so they should be used with caution in scenarios that require exact computation (such as financial calculations).

4. Computation with floating-point types is usually slower than with integer types, so performance and precision must be balanced in use.

5. It is usually recommended to process floating-point data that requires precision and then store it as DECIMAL or INT/BIGINT to improve precision.

## Fixed-Point Types

1. **DECIMAL[(M[,D])] [UNSIGNED] [ZEROFILL]**
   - NUMBER is an alias of DECIMAL and is used in the same way
   - **Range**: fixed-point number, where M is the total number of digits (default 10, maximum 65) and D is the number of decimal digits (default 0, maximum 30)
   - **Storage**: variable, depending on M and D. Every nine digits (9 decimal digits) use 4 bytes
   - **Precautions**: suitable for scenarios that require high-precision computation, such as financial data.

Examples:

```sql
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 FLOAT(7,3),
  c2 DOUBLE(7,3),
  c3 DECIMAL(7,3),
  c4 FLOAT,
  c5 DOUBLE,
  c6 DECIMAL
);

greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` float(7,3) DEFAULT NULL,
  `c2` double(7,3) DEFAULT NULL,
  `c3` decimal(7,3) DEFAULT NULL,
  `c4` float DEFAULT NULL,
  `c5` double DEFAULT NULL,
  `c6` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t1 VALUES(0, 123.4567, 123.4567, 123.4567, 123.4567, 123.4567, 123.4567);
Query OK, 1 row affected, 2 warnings (0.00 sec)

greatsql> SHOW WARNINGS;
+-------+------+-----------------------------------------+
| Level | Code | Message                                 |
+-------+------+-----------------------------------------+
| Note  | 1265 | Data truncated for column 'c3' at row 1 |
| Note  | 1265 | Data truncated for column 'c6' at row 1 |
+-------+------+-----------------------------------------+

greatsql> INSERT INTO t1 VALUES(0, 123.4321, 123.4321, 123.4321, 123.4321, 123.4321, 123.4321);
Query OK, 1 row affected, 2 warnings (0.00 sec)

-- The query result shows that DOUBLE has higher precision than FLOAT
greatsql> SELECT * FROM t1;
+----+---------+---------+---------+---------+----------+------+
| id | c1      | c2      | c3      | c4      | c5       | c6   |
+----+---------+---------+---------+---------+----------+------+
|  1 | 123.457 | 123.457 | 123.457 | 123.457 | 123.4567 |  123 |
|  2 | 123.432 | 123.432 | 123.432 | 123.432 | 123.4321 |  123 |
+----+---------+---------+---------+---------+----------+------+
```

## String Types

1. **CHAR(N)**
   - **Range**: fixed-length string, where N is the length.
   - **Storage length**: 1 to 255 characters. Assuming the utf8mb4 character set is used, the maximum storage space is 1020 bytes.
   - **Precautions**:
     - **Fixed length**: suitable for storing fixed-length data, such as country codes and postal codes.
     - **Space padding**: if the length of the inserted data is less than the specified length, spaces are padded at the end to reach the fixed length (but trailing spaces are truncated when the read result is displayed).
     - **Extra storage**: when the defined storage length is N<=255 bytes, 1 extra byte is required; when the defined storage length is N>255 bytes, 2 extra bytes are required.

2. **VARCHAR(N)**
   - **Range**: variable-length string, where N is the maximum length.
   - **Storage length**: 0 to 65535 bytes, so if the utf8mb4 character set is used, the defined length N can be at most 16382 characters.
   - **Precautions**:
     - **Variable length**: suitable for storing string data of variable length and avoids wasting space.
     - **Extra storage**: when the defined storage length is N<=255 bytes, 1 extra byte is required; when the defined storage length is N>255 bytes, 2 extra bytes are required.
     - **Space handling**: when data with trailing spaces is inserted into a VARCHAR column, the trailing spaces are not truncated automatically and are still displayed.

```sql
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 CHAR(15) NOT NULL DEFAULT '',
  c2 VARCHAR(15) NOT NULL DEFAULT '');

-- The inserted values always contain three trailing spaces
greatsql> INSERT INTO t1 VALUES(0, 'abcde', 'abcde   '), (0, '', '   '), 
  (0, 'GreatSQL 数据库', 'GreatSQL 数据库   ');

greatsql> INSERT INTO t1 VALUES(0, NULL, NULL);
ERROR 1048 (23000): Column 'c1' cannot be null

greatsql> SELECT id, c1, LENGTH(c1), c2, LENGTH(c2) FROM t1;
+----+-------------------+------------+----------------------+------------+
| id | c1                | LENGTH(c1) | c2                   | LENGTH(c2) |
+----+-------------------+------------+----------------------+------------+
|  1 | abcde             |          5 | abcde                |          8 |
|  2 |                   |          0 |                      |          3 |
|  3 | GreatSQL 数据库    |         17 | GreatSQL 数据库       |         20 |
+----+-------------------+------------+----------------------+------------+

-- The defined length of a VARCHAR column cannot exceed 16383; otherwise an error is reported
greatsql> CREATE TABLE t2(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, c1 VARCHAR(16383) NOT NULL DEFAULT '');
ERROR 1118 (42000): Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs
greatsql> CREATE TABLE t2(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, c1 VARCHAR(16382) NOT NULL DEFAULT '');
```

## Time and Date Types

1. **DATETIME[(fsp)]**
  - **Value range**: `1000-01-01 00:00:00` to `9999-12-31 23:59:59`
  - **Storage**: 5 bytes
  - **Usage precautions**: stores the date and time and is not affected by the time zone. Suitable for scenarios that need to record an exact point in time.

2. **TIMESTAMP[(fsp)]**
  - **Value range**: `1970-01-01 00:00:01` UTC to `2038-01-19 03:14:07` UTC
  - **Storage**: 4 bytes
  - **Usage precautions**: stores the UNIX timestamp and is converted automatically according to the system time zone. Suitable for time-zone-related scenarios such as recording the creation or modification time.

3. **DATE**
  - **Value range**: `1000-01-01` to `9999-12-31`
  - **Storage**: 3 bytes
  - **Usage precautions**: stores only the date part; suitable for scenarios that only need to record a date, such as a birthday.

4. **YEAR[(4)]**
  - **Value range**: `1901` to `2155`
  - **Storage**: 1 byte
  - **Usage precautions**: stores only the year; suitable for scenarios that only need to record a year.

5. **TIME[(fsp)]**
  - **Value range**: `-838:59:59` to `838:59:59`
  - **Storage**: 3 bytes
  - **Usage precautions**: stores only the time part and can store negative values; suitable for recording time intervals or durations.

6. The differences between the two most commonly used data types DATETIME and TIMESTAMP are mainly as follows
  - **Storage method**:
    - DATETIME: stores the date and time in the format YYYY-MM-DD HH:MM:SS and is not affected by the time zone.
    - TIMESTAMP: stores the number of seconds since 1970-01-01 UTC, is affected by the time zone, and is converted automatically according to the time zone.
  - **Value range**:
    - DATETIME: the range is from 1000-01-01 00:00:00 to 9999-12-31 23:59:59.
    - TIMESTAMP: the range is from 1970-01-01 00:00:01 UTC to 2038-01-19 03:14:07 UTC.
  - **Storage**:
    - DATETIME: uses 8 bytes.
    - TIMESTAMP: uses 4 bytes.
  - **Automatic update**:
    - Both support defining multiple columns in one table and updating them automatically to the current time.
  - **Preferred choice**:
    - DATETIME: when you need to record a fixed time that is not affected by the time zone (for example, an appointment time).
    - TIMESTAMP: when you need to record a time that is affected by the time zone and want it to stay consistent across time zone conversions (for example, recording the creation or modification time).
    - In general, the DATETIME type is preferred, because it stores a wider date and time range and its overall performance is comparable to TIMESTAMP. In addition, if the TIMESTAMP type is used in a highly concurrent business scenario, it may be more likely to cause high CPU load due to time zone conversion.

```sql
greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `c2` datetime(4) NOT NULL DEFAULT CURRENT_TIMESTAMP(4) ON UPDATE CURRENT_TIMESTAMP(4),
  `c3` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `c4` timestamp(4) NOT NULL DEFAULT CURRENT_TIMESTAMP(4) ON UPDATE CURRENT_TIMESTAMP(4),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t1 VALUES(0, NOW(), NOW(), NOW(), NOW());

greatsql> SELECT * FROM t1;
+----+---------------------+--------------------------+---------------------+--------------------------+
| id | c1                  | c2                       | c3                  | c4                       |
+----+---------------------+--------------------------+---------------------+--------------------------+
|  1 | 2024-07-26 12:36:35 | 2024-07-26 12:36:35.0000 | 2024-07-26 12:36:35 | 2024-07-26 12:36:35.0000 |
+----+---------------------+--------------------------+---------------------+--------------------------+
```

7. Usage precautions
  - **Choosing an appropriate data type**: choose a suitable date and time data type according to actual needs to ensure storage efficiency and data accuracy.
  - **Time zone handling**: when using `TIMESTAMP`, pay attention to time zone conversion and make sure the time zone is set correctly.
  - **Storage**: make sure the column types are chosen reasonably to save storage space.

## JSON Type

The JSON data type can theoretically store any valid JSON document, including numbers, strings, booleans, arrays, objects, and so on. JSON data is stored in binary format, which makes retrieval more efficient. It can store up to 65535 bytes, and the actual storage space depends on the content and size of the JSON document.


1. **Creating a table with a JSON column**:
```sql
CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  data JSON);
```

2. **Inserting JSON data**:
```sql
INSERT INTO t1(data) VALUES ('{"name": "乌孙怀玉", "age": 30, "city": "Beijing"}');
```

3. **Querying JSON data**:

  - Retrieving the entire JSON column:

```sql
greatsql> SELECT data FROM t1 WHERE id = 1;
+--------------------------------------------------------+
| data                                                   |
+--------------------------------------------------------+
| {"age": 30, "city": "Beijing", "name": "乌孙怀玉"}     |
+--------------------------------------------------------+
```

  - Retrieving a certain attribute of the JSON column:

```sql
greatsql> SELECT data->'$.name' AS name FROM t1 WHERE id = 1;
+----------------+
| name           |
+----------------+
| "乌孙怀玉"     |
+----------------+

greatsql> SELECT data->>'$.name' AS name FROM t1 WHERE id = 1;
+--------------+
| name         |
+--------------+
| 乌孙怀玉     |
+--------------+
```

Where:
- The `->` operator: used to extract a JSON value from a JSON column. The returned value is still in JSON format.

- The `->>` operator: used to extract a plain text value from a JSON column. The returned value is in plain text format.

4. **Updating JSON data**:
```sql
UPDATE t1 SET data = JSON_SET(data, '$.age', 31) WHERE id = 1;
```

5. **Deleting an attribute of a JSON column**:
```sql
UPDATE t1 SET data = JSON_REMOVE(data, '$.city') WHERE id = 1;
```

6. Usage precautions

-  **Index**: virtual columns can be created on a JSON column, and indexes can be created on these virtual columns to improve query performance.
-  **Validation**: the inserted data must be valid JSON and is validated at insert time.
-  **Performance**: although the JSON data type is very flexible, complex JSON operations may affect query performance, so they must be considered carefully when designing a database.

The JSON data type makes it convenient to store and manipulate JSON data and supports various JSON functions and operations, but performance and index optimization should be taken into account.

The following is an example of creating an index on a JSON column by using a virtual column.

```sql
greatsql> CREATE TABLE t1(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data JSON);

greatsql> INSERT INTO t1(data) VALUES ('{"name": "乌孙怀玉", "age": 30, "city": "Beijing"}');

greatsql> EXPLAIN SELECT data->'$.city', JSON_TYPE(data->'$.city') AS datatype FROM t1 WHERE data->'$.city' = 'Beijing';
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    1 |   100.00 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+

greatsql> ALTER TABLE t1 ADD city VARCHAR(20) GENERATED ALWAYS AS (data->'$.city');
greatsql> ALTER TABLE t1 ADD INDEX idx_city(city);
greatsql> EXPLAIN SELECT city FROM t1 WHERE city = 'Beijing';
+----+-------------+-------+------------+------+---------------+----------+---------+-------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key      | key_len | ref   | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+----------+---------+-------+------+----------+-------------+
|  1 | SIMPLE      | t1    | NULL       | ref  | idx_city      | idx_city | 83      | const |    1 |   100.00 | Using index |
+----+-------------+-------+------------+------+---------------+----------+---------+-------+------+----------+-------------+
```

Virtual columns make it possible to create indexes on JSON data, greatly improving search efficiency.

## Text and Large Object Types

The TEXT data type is used to store large text data and has four types: TINYTEXT, TEXT, MEDIUMTEXT, and LONGTEXT.

1. **TINYTEXT**：
   - Value range: maximum 255 bytes
   - Storage: 1 byte + the number of bytes actually stored.

2. **TEXT**：
   - Value range: maximum 65535 bytes (64 KB)
   - Storage: 2 bytes + the number of bytes actually stored.

3. **MEDIUMTEXT**：
   - Value range: maximum 16777215 bytes (16 MB)
   - Storage: 3 bytes + the number of bytes actually stored.

4. **LONGTEXT**：
   - Value range: maximum 4294967295 bytes (4 GB)
   - Storage: 4 bytes + the number of bytes actually stored.

5. Several precautions
  - **Index**: an index cannot be created directly on a TEXT column, but a prefix index can be created on the first N characters.
  - **Storage efficiency**: TEXT data is not stored in memory but on disk, so operating on large texts may affect performance.
  - **Character set**: make sure the character set and collation are set correctly to avoid garbled characters.
  - **Query performance**: queries and sorting on TEXT columns have relatively low performance; TEXT is suitable for storing large texts that are not queried frequently.

The BLOB (Binary Large Object) data type is used to store binary data such as images and videos. It has four types: TINYBLOB, BLOB, MEDIUMBLOB, and LONGBLOB.

1. **TINYBLOB**：
   - Value range: maximum 255 bytes
   - Storage: 1 byte + the actual data size.

2. **BLOB**：
   - Value range: maximum 65,535 bytes (64 KB)
   - Storage: 2 bytes + the actual data size.

3. **MEDIUMBLOB**：
   - Value range: maximum 16,777,215 bytes (16 MB)
   - Storage: 3 bytes + the actual data size.

4. **LONGBLOB**：
   - Value range: maximum 4,294,967,295 bytes (4 GB)
   - Storage: 4 bytes + the actual data size.

The TEXT/BLOB data types usually store long texts or large objects. The following precautions apply when using them:

- Because TEXT/BLOB data is usually large, performance must be taken into account when handling such data.
- Do not create indexes on TEXT/BLOB columns; when an index is really necessary, a prefix index can be created on the first N bytes.
- Do not perform fuzzy queries such as `LIKE '%x%'` on TEXT/BLOB data, and full-text indexes are not recommended.
- For tables with TEXT/BLOB columns, do not always execute `SELECT *`; specify the columns to be read each time and avoid reading TEXT/BLOB columns unless necessary.
- Storage space: TEXT/BLOB data occupies a large amount of storage space. In particular, when a large amount of text is stored, it can easily lead to data page overflow ([overflow page](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_overflow_page)) problems, causing relatively serious performance problems.
- Try not to use, or to use as little as possible, the TEXT/BLOB data types. If data such as image attachments needs to be stored, the files can be placed in disk storage and only their storage paths kept in the database, which greatly reduces storage space consumption and improves database read/write performance.

## ENUM and SET Types

1. **ENUM**
   - **Range**: selects one value from a predefined set of strings.
   - **Storage**: 1 to 2 bytes
   - **Precautions**: suitable for a limited set of options.

2. **SET**
   - **Range**: selects a combination of multiple values from a predefined set of strings.
   - **Storage**: 1 to 8 bytes
   - **Precautions**: suitable for storing multiple non-duplicate options.

These two data types are used relatively rarely. If needed, it is recommended to use TINYINT/SMALLINT instead, which provides better performance and is also more flexible in business use.

## Row Size Limit

1. The maximum length of a stored row is 65535 bytes. For TEXT/BLOB columns, only a 9-12 byte pointer is actually stored, pointing to the data page (InnoDB data page) where the TEXT/BLOB data is actually stored.

2. The actual maximum length of each row stored in a data page is about half of `innodb_page_size`, which is about 8KB with the default configuration (`innodb_page_size` defaults to 16KB). If `innodb_page_size` is set to 32KB, the actual maximum length of each row stored in a data page is about 16KB. For the excess part, the columns are sorted in reverse order by their actual length, and the data of the largest columns is stored in extra pages (called off-page) one by one until the total length of the remaining columns is no greater than half of `innodb_page_size`. This handling is also called row overflow, and the pages used to store extremely long columns are called overflow pages.

::: tip Recommendation
1. When designing a table structure, try to ensure that the total length of all columns does not exceed half of `innodb_page_size`. Columns that may store large data, especially long VARCHAR columns (generally referring to columns longer than 512 bytes) and TEXT/BLOB columns, are best placed in a separate table, separated from smaller columns such as INT.

2. When storing actual user data, try to ensure that the stored row length does not exceed half of `innodb_page_size`; once it does, row overflow occurs, which has a relatively large performance impact.
:::

Examples:

```sql
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 VARCHAR(200) NOT NULL,
  c2 VARCHAR(600) NOT NULL,
  c3 VARCHAR(6000) NOT NULL,
  c4 VARCHAR(9580) NOT NULL);
Query OK, 0 rows affected (0.00 sec)

-- Lengthen the c4 column so that the total defined length of all columns exceeds 16382; an error is reported
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 VARCHAR(200) NOT NULL,
  c2 VARCHAR(600) NOT NULL,
  c3 VARCHAR(6000) NOT NULL,
  c4 VARCHAR(9581) NOT NULL);
ERROR 1118 (42000): Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs

-- Calculate the total length of all columns; ROW_SIZE=65531, which does not exceed the limit
-- VARCHAR columns longer than 255 bytes require 2 extra bytes
greatsql> SELECT 4 + (200*4+2) + (600*4+2) + (6000*4+2) + (9580*4+2) AS ROW_SIZE;
+----------+
| ROW_SIZE |
+----------+
|    65532 |
+----------+

-- Calculate the total length of all columns; ROW_SIZE=65535, which exceeds the limit
greatsql> SELECT 4 + (200*4+2) + (600*4+2) + (6000*4+2) + (9581*4+2) AS ROW_SIZE;
+----------+
| ROW_SIZE |
+----------+
|    65536 |
+----------+

-- Including a TEXT column
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 VARCHAR(200) NOT NULL,
  c2 VARCHAR(600) NOT NULL,
  c3 VARCHAR(6000) NOT NULL,
  c4 VARCHAR(9580) NOT NULL,
  c5 TEXT NOT NULL);
ERROR 1118 (42000): Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs

-- Reduce the length of the c4 column; the table is created successfully
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 VARCHAR(200) NOT NULL,
  c2 VARCHAR(600) NOT NULL,
  c3 VARCHAR(6000) NOT NULL,
  c4 VARCHAR(9578) NOT NULL,
  c5 TEXT NOT NULL);
Query OK, 0 rows affected (0.07 sec)

-- Calculate the total length
greatsql> SELECT 4 + (200*4+2) + (600*4+2) + (6000*4+2) + (9578*4+2) + 9 AS ROW_SIZE;
+----------+
| ROW_SIZE |
+----------+
|    65533 |
+----------+
```

## Summary

To ensure the performance of business application development as much as possible, choosing and using data types properly is essential. The following are some precautions, optimization techniques, and methods for improving and ensuring performance when using common data types:

1. Choosing appropriate data types
  - **CHAR vs VARCHAR**: for fixed-length strings, using `CHAR` improves performance, but for strings whose length varies considerably, using `VARCHAR` saves more space.
  - **INT vs BIGINT**: as long as the requirement can be met, use a smaller data type, such as `INT` instead of `BIGINT`, to reduce storage space and improve index performance.
  - **FLOAT vs DECIMAL**: for scenarios that require exact numeric computation, use the `DECIMAL` type; for scenarios that do not require exact values, `FLOAT` or `DOUBLE` can be used.
  - **Avoiding excessively large strings**: for very large text or binary data, consider using the `TEXT` or `BLOB` type, but note that these types are not suitable for indexing.
  - **Using `DATETIME`**: for scenarios that need to store complete date and time information, use the `DATETIME` type. **Avoid using `TIMESTAMP`**: unless automatic update or timestamp recording is needed, using the `DATETIME` type avoids time-zone-related problems.
  - **Considering JSON storage**: for data with a low degree of structure, consider using the JSON type to improve flexibility.
  - **Avoiding frequent updates of JSON columns**: frequently updating JSON columns may cause performance degradation, because the entire JSON column must be rewritten.

2. Using indexes properly
  - **Index selection**: create indexes on columns often used in query conditions, especially columns that often appear in `WHERE`, `JOIN`, `GROUP BY`, and `ORDER BY` clauses.
  - **Composite index**: consider creating a composite index (an index on multiple columns) to reduce the number of indexes and improve query efficiency.
  - **Covering index**: create a covering index (that is, an index that contains all the columns required by the query) to avoid extra table scans.

3. Avoiding `NULL`
  - **Using non-null values**: try to avoid `NULL` values in columns, because they complicate indexes and affect query performance.
  - **Default values**: specify default values for columns so that they are filled in automatically at insert time.

4. Other usage and optimization principles
  - Use the smallest and shortest data types possible; for example, use TINYINT instead of BIGINT when possible, and VARCHAR(5) instead of VARCHAR(50) when possible.
  - For data types such as CHAR/VARCHAR/TEXT/BLOB, avoid lengthening updates whenever possible; for example, a value that originally had only 10 characters becomes 20 characters after the update.
  - For data types such as CHAR/VARCHAR/TEXT/BLOB, avoid creating indexes whenever possible; if an index is really needed, create a prefix index.
  - For scenarios where TEXT/BLOB may store large data, it is best to place these columns in a separate table rather than in the same table as other columns that are updated more frequently.
  - Similarly, it is best to separate frequently updated columns from infrequently updated ones into different tables according to the update frequency, rather than mixing them, so as to reduce the read/write pressure on physical I/O.

Following the methods and principles above as strictly as possible usually improves and ensures the performance of business applications effectively.

For more information about data types, see: [Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html).

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
