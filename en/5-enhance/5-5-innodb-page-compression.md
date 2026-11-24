# InnoDB Page Compression
---

## Introduction

InnoDB Page Compression (transparent page compression) is a filesystem-based tablespace compression technique that compresses data pages using algorithms such as Zlib/LZ4/Zstd, and releases trailing empty blocks using sparse file features (such as hole punching on Linux or NTFS compression units on Windows), thereby reducing physical storage usage. This feature only applies to `file-per-table` tablespaces, and depends on the support of the operating system kernel and filesystem for the hole mechanism, with specific version and configuration requirements on different platforms.

Starting from GreatSQL 8.0.32-27, Page compression adds support for the Zstd algorithm, which can further improve the page compression ratio, especially when a table contains a large amount of repeated character-type data.

## Usage
### Enabling Page Compression

Page compression can be enabled when creating a new table with `CREATE TABLE`, for example:

```sql
greatsql> CREATE TABLE `t1_zstd` (
  `id` int NOT NULL,
  `c1` varchar(20) NOT NULL,
  `c2` varchar(30) NOT NULL,
  `c3` datetime NOT NULL,
  `c4` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_c3` (`c3`)
) ENGINE=InnoDB COMPRESSION='zstd';
```

The Page compression algorithm of a table can also be modified with `ALTER TABLE`, for example:

```sql
greatsql> ALTER TABLE t1 COMPRESSION='zstd';
greatsql> OPTIMIZE TABLE t1;
```

`OPTIMIZE TABLE` must be executed for it to take effect.

### Disabling Page Compression

Page compression can be disabled with `ALTER TABLE`, for example:

```sql
greatsql> ALTER TABLE t1 COMPRESSION='None';
greatsql> OPTIMIZE TABLE t1;
```

`OPTIMIZE TABLE` must be executed for it to take effect.

## New Parameters

The parameter `innodb_page_zstd_compression_level` is newly added for Page compression.

| System Variable Name | innodb_page_zstd_compression_level |
| --- | --- | 
| Variable Scope | Global |
| Dynamic Variable | No |
| SET_VAR Hint Applies  | No |
| Permitted Values | [0-9] |
| Type | Integer |
| Default | 6 |
| Description | Specifies the compression level when InnoDB Page compression uses Zstd. 0 indicates the lowest compression level and 9 indicates the highest compression level |

## Page Compression Effectiveness Evaluation

1. First create a regular table

```sql
CREATE TABLE `t1` (
  `id` int NOT NULL,
  `c1` varchar(20) NOT NULL,
  `c2` varchar(30) NOT NULL,
  `c3` datetime NOT NULL,
  `c4` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_c3` (`c3`)
) ENGINE=InnoDB;
```

2. Use the `mysql_random_data_load` tool to load test data

Load at least several million rows of test data, for example:

```bash
mysql_random_data_load -h127.0.0.1 -uGreatSQL -pGreatSQL -P3306 test t1 1000000
```

3. Create tables with different compression algorithms respectively, as shown below

```sql
greatsql> CREATE TABLE t1_lz4 LIKE t1;
greatsql> ALTER TABLE t1_lz4 COMPRESSION='lz4';
greatsql> OPTIMIZE TABLE t1_lz4;

greatsql> CREATE TABLE t1_zstd LIKE t1;
greatsql> ALTER TABLE t1_zstd COMPRESSION='zstd';
greatsql> OPTIMIZE TABLE t1_zstd;
```

4. Write data to the two tables respectively

```sql
greatsql> INSERT INTO t1_lz4 SELECT * FROM t1;
greatsql> INSERT INTO t1_zstd SELECT * FROM t1;
```

5. Observe the sizes of the two tablespace files

```sql
greatsql> SELECT SPACE, NAME, FS_BLOCK_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM INFORMATION_SCHEMA.INNODB_TABLESPACES WHERE NAME LIKE 'test/t1%';
+-------+--------------+---------------+-----------+----------------+
| SPACE | NAME         | FS_BLOCK_SIZE | FILE_SIZE | ALLOCATED_SIZE |
+-------+--------------+---------------+-----------+----------------+
|   474 | test/t1      |          4096 | 213909504 |      213913600 |
|   479 | test/t1_lz4  |          4096 | 150994944 |      120795136 |
|   481 | test/t1_zstd |          4096 | 150994944 |       92200960 |
+-------+--------------+---------------+-----------+----------------+
```

Here,

- `FS_BLOCK_SIZE`: the filesystem block size, which is the unit size used for hole punching.
- `FILE_SIZE`: the explicit size of the file, indicating the maximum uncompressed file size.
- `ALLOCATED_SIZE`: the actual size of the file, that is, the amount of space allocated on disk. 

The actual allocated database size can also be viewed at the system level:

```bash
$ du --block-size=1 test/t1_*ibd

120795136       test/t1_lz4.ibd
92200960        test/t1_zstd.ibd
```

From the above results, when using the Zstd compression algorithm, the allocated database is about 76.3% of that when using the LZ4 compression algorithm, and about 43.1% of the uncompressed size. This effect is quite significant.

## Improving the Compression Ratio

By increasing the setting value of the `innodb_page_zstd_compression_level` parameter, the data compression ratio can be further improved. In addition, when the data in a table is mainly repeated text or character-type data, the compression ratio is also higher.

Two examples are given below.

First, modify the `my.cnf` configuration file, set `innodb_page_zstd_compression_level=9` to set the compression ratio to the highest level, and restart the database instance.

**Example 1: A large amount of short text with a high repetition rate**

1. The basic table structure is as follows

```sql
greatsql> SHOW CREATE TABLE t2\G
*************************** 1. row ***************************
       Table: t2
Create Table: CREATE TABLE `t2` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` enum('Y','N') NOT NULL,
  `c2` enum('Y','N') NOT NULL,
  `c3` datetime NOT NULL,
  `c4` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_c3` (`c3`)
) ENGINE=InnoDB AUTO_INCREMENT=3022380 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

2. Sample data

```sql
greatsql> SELECT * FROM t2 LIMIT 5;
+----+----+----+---------------------+--------------------------------+
| id | c1 | c2 | c3                  | c4                             |
+----+----+----+---------------------+--------------------------------+
|  1 | N  | N  | 1994-10-25 18:58:37 |  |
|  2 | Y  | Y  | 1994-10-28 20:58:12 | VVVVVVVVVVVVVVVVVVVVVVVVVVVVVV |
|  3 | N  | Y  | 1984-07-19 09:00:05 | ------------------------------ |
|  4 | N  | Y  | 1995-12-01 10:43:26 | >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> |
|  5 | N  | N  | 2002-01-21 19:17:23 |  |
+----+----+----+---------------------+--------------------------------+
```

3. The repetition rate of data in each column

```sql
greatsql> SELECT COUNT(DISTINCT(id)),  COUNT(DISTINCT(c1)), COUNT(DISTINCT(c2)), COUNT(DISTINCT(c3)), COUNT(DISTINCT(c4)) FROM t2;
+---------------------+---------------------+---------------------+---------------------+---------------------+
| count(distinct(id)) | count(distinct(c1)) | count(distinct(c2)) | count(distinct(c3)) | count(distinct(c4)) |
+---------------------+---------------------+---------------------+---------------------+---------------------+
|             2597152 |                   2 |                   2 |             2363778 |                  75 |
+---------------------+---------------------+---------------------+---------------------+---------------------+
```

4. View the compression effect

```sql
greatsql> SELECT SPACE, NAME, FS_BLOCK_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM INFORMATION_SCHEMA.INNODB_TABLESPACES WHERE NAME LIKE 'test/t2%';
+-------+--------------+---------------+-----------+----------------+
| SPACE | NAME         | FS_BLOCK_SIZE | FILE_SIZE | ALLOCATED_SIZE |
+-------+--------------+---------------+-----------+----------------+
|   498 | test/t2_zstd |          4096 | 247463936 |      146001920 | - 59%
|   500 | test/t2      |          4096 | 247463936 |      247468032 |
+-------+--------------+---------------+-----------+----------------+
```

The compressed data is only 59% of the original size, which is a good result.

**Example 2: A large amount of long text with a high repetition rate**

1. The basic table structure is as follows

```sql
greatsql> SHOW CREATE TABLE t3\G
*************************** 1. row ***************************
       Table: t3
Create Table: CREATE TABLE `t3` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` varchar(50) NOT NULL,
  `c2` varchar(200) NOT NULL,
  `c3` datetime NOT NULL,
  `c4` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_c3` (`c3`)
) ENGINE=InnoDB AUTO_INCREMENT=851940 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

2. Sample data

```sql
greatsql> SELECT * FROM t3 LIMIT 2;
+----+----------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------+--------------------------------+
| id | c1                                                 | c2                                                                                                                                                                                                       | c3                  | c4                             |
+----+----------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------+--------------------------------+
|  1 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | 1971-07-10 22:19:41 | cccccccccccccccccccccccccccccc |
|  2 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | 1971-09-04 13:23:07 | cccccccccccccccccccccccccccccc |
+----+----------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------+--------------------------------+
```

3. The repetition rate of data in each column

```sql
greatsql> SELECT COUNT(DISTINCT(id)),  COUNT(DISTINCT(c1)), COUNT(DISTINCT(c2)), COUNT(DISTINCT(c3)), COUNT(DISTINCT(c4)) FROM t3;
+---------------------+---------------------+---------------------+---------------------+---------------------+
| count(distinct(id)) | count(distinct(c1)) | count(distinct(c2)) | count(distinct(c3)) | count(distinct(c4)) |
+---------------------+---------------------+---------------------+---------------------+---------------------+
|              720896 |                   1 |                   1 |              683841 |                   1 |
+---------------------+---------------------+---------------------+---------------------+---------------------+
```

In the table, the data in all three columns `c1/c2/c4` is duplicated, `id` is unique, and the repetition rate of the `c3` column is about 5%.

4. View the compression effect

```sql
greatsql> SELECT SPACE, NAME, FS_BLOCK_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM INFORMATION_SCHEMA.INNODB_TABLESPACES WHERE NAME LIKE 'test/t3%';
+-------+--------------+---------------+-----------+----------------+
| SPACE | NAME         | FS_BLOCK_SIZE | FILE_SIZE | ALLOCATED_SIZE |
+-------+--------------+---------------+-----------+----------------+
|   492 | test/t3      |          4096 | 301989888 |      301989888 |
|   493 | test/t3_zstd |          4096 | 301989888 |      114909184 | - 38.05%
+-------+--------------+---------------+-----------+----------------+
```

The compressed data is only 38.05% of the original size, which is quite impressive. It can be seen that the compression effect is very good when there is a large amount of long repeated text data.

In the above two examples, after loading the test data, `OPTIMIZE TABLE` was executed again on the tables `t2/t3` to rebuild the entire tablespace.

For more details about InnoDB Page compression, see: [InnoDB Page Compression](https://dev.mysql.com/doc/refman/8.0/en/innodb-page-compression.html).

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
