# InnoDB Page压缩
---

## 简介

InnoDB Page Compression（透明页压缩）是一种基于文件系统的表空间压缩技术，通过Zlib/LZ4/Zstd等算法对数据页进行压缩，并利用稀疏文件特性（如Linux的hole punching或Windows的NTFS压缩单元）释放尾部空白块，从而减少物理存储占用。该特性仅适用于`file-per-table`表空间（独立表空间），且依赖操作系统内核及文件系统对空洞机制的支持，在不同平台有特定的版本和配置要求。

从GreatSQL 8.0.32-27版本开始，Page压缩新增支持Zstd算法，它可以使得Page压缩率进一步得到提高，尤其是当表中有大量重复字符类型数据时。

## 使用方法
### 启用Page压缩

可以在执行`CREATE TABLE`创建新表时指定启用Page压缩，例如

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

也可以执行`ALTER TABLE`修改表的Page压缩算法，例如

```sql
greatsql> ALTER TABLE t1 COMPRESSION='zstd';
greatsql> OPTIMIZE TABLE t1;
```

需要执行`OPTIMIZE TABLE`才能生效。

### 禁用Page压缩

可以执行`ALTER TABLE`修改表禁用Page压缩，例如

```sql
greatsql> ALTER TABLE t1 COMPRESSION='None';
greatsql> OPTIMIZE TABLE t1;
```

需要执行`OPTIMIZE TABLE`才能生效。

## 新增参数

针对Page压缩新增参数`innodb_page_zstd_compression_level`。

| System Variable Name	| innodb_page_zstd_compression_level |
| --- | --- | 
| Variable Scope	| Global |
| Dynamic Variable	| No |
| SET_VAR Hint Applies  | No |
| Permitted Values |	[0-9] |
| Type | Integer |
| Default	| 6 |
| Description	| 指定InnoDB Page压缩使用Zstd时的压缩级别，0表示最低压缩级别, 9表示最高压缩级别 |

## Page压缩效果评估

1. 先创建一个普通表

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

2. 利用`mysql_random_data_load`工具加载测试数据

至少加载数百万行测试数据，例如

```bash
mysql_random_data_load -h127.0.0.1 -uGreatSQL -pGreatSQL -P3306 test t1 1000000
```

3. 分别创建不同压缩算法的表，如下所示

```sql
greatsql> CREATE TABLE t1_lz4 LIKE t1;
greatsql> ALTER TABLE t1_lz4 COMPRESSION='lz4';
greatsql> OPTIMIZE TABLE t1_lz4;

greatsql> CREATE TABLE t1_zstd LIKE t1;
greatsql> ALTER TABLE t1_zstd COMPRESSION='zstd';
greatsql> OPTIMIZE TABLE t1_zstd;
```

4. 分别向两个表写入数据

```sql
greatsql> INSERT INTO t1_lz4 SELECT * FROM t1;
greatsql> INSERT INTO t1_zstd SELECT * FROM t1;
```

5. 观察两个表空间文件大小

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

其中

- `FS_BLOCK_SIZE`：文件系统块大小，是打孔时使用的单位大小。
- `FILE_SIZE`：文件的显式大小，表示未压缩的最大文件大小。
- `ALLOCATED_SIZE`：文件的实际大小，即在磁盘上分配的空间量。 

也可以从系统层面查看实际分配数据库大小

```bash
$ du --block-size=1 test/t1_*ibd

120795136       test/t1_lz4.ibd
92200960        test/t1_zstd.ibd
```

从上面的结果可以看到，如果采用Zstd压缩算法，分配的数据库约为采用LZ4压缩算法时的76.3%，约为未压缩时的43.1%，这个效果还是相当可观的。

## 提高压缩率

通过调高`innodb_page_zstd_compression_level`参数的设置值，可以进一步提高数据压缩率。此外，当表中的数据以重复文本、字符类型为主时，压缩率也会更高。

下面举两个例子说明。

首先修改`my.cnf`配置文件，设置`innodb_page_zstd_compression_level=9`，将压缩率设置为最高级别，并重启数据库实例。

**例1：有大量短文本，且重复率较高**

1. 基础表结构如下

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

2. 样例数据

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

3. 各个列数据重复率

```sql
greatsql> SELECT COUNT(DISTINCT(id)),  COUNT(DISTINCT(c1)), COUNT(DISTINCT(c2)), COUNT(DISTINCT(c3)), COUNT(DISTINCT(c4)) FROM t2;
+---------------------+---------------------+---------------------+---------------------+---------------------+
| count(distinct(id)) | count(distinct(c1)) | count(distinct(c2)) | count(distinct(c3)) | count(distinct(c4)) |
+---------------------+---------------------+---------------------+---------------------+---------------------+
|             2597152 |                   2 |                   2 |             2363778 |                  75 |
+---------------------+---------------------+---------------------+---------------------+---------------------+
```

4. 查看压缩效果

```sql
greatsql> SELECT SPACE, NAME, FS_BLOCK_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM INFORMATION_SCHEMA.INNODB_TABLESPACES WHERE NAME LIKE 'test/t2%';
+-------+--------------+---------------+-----------+----------------+
| SPACE | NAME         | FS_BLOCK_SIZE | FILE_SIZE | ALLOCATED_SIZE |
+-------+--------------+---------------+-----------+----------------+
|   498 | test/t2_zstd |          4096 | 247463936 |      146001920 | - 59%
|   500 | test/t2      |          4096 | 247463936 |      247468032 |
+-------+--------------+---------------+-----------+----------------+
```

压缩后的数据只有原来的59%，效果还不错。

**例2：有大量长文本，且重复率较高**

1. 基础表结构如下

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

2. 样例数据

```sql
greatsql> SELECT * FROM t3 LIMIT 2;
+----+----------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------+--------------------------------+
| id | c1                                                 | c2                                                                                                                                                                                                       | c3                  | c4                             |
+----+----------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------+--------------------------------+
|  1 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | 1971-07-10 22:19:41 | cccccccccccccccccccccccccccccc |
|  2 | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | 1971-09-04 13:23:07 | cccccccccccccccccccccccccccccc |
+----+----------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------+--------------------------------+
```

3. 各个列数据重复率

```sql
greatsql> SELECT COUNT(DISTINCT(id)),  COUNT(DISTINCT(c1)), COUNT(DISTINCT(c2)), COUNT(DISTINCT(c3)), COUNT(DISTINCT(c4)) FROM t3;
+---------------------+---------------------+---------------------+---------------------+---------------------+
| count(distinct(id)) | count(distinct(c1)) | count(distinct(c2)) | count(distinct(c3)) | count(distinct(c4)) |
+---------------------+---------------------+---------------------+---------------------+---------------------+
|              720896 |                   1 |                   1 |              683841 |                   1 |
+---------------------+---------------------+---------------------+---------------------+---------------------+
```

表中 `c1/c2/c4` 三个列的数据全部是重复的，`id`不重复，`c3`列重复率约为5%。

4. 查看压缩效果

```sql
greatsql> SELECT SPACE, NAME, FS_BLOCK_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM INFORMATION_SCHEMA.INNODB_TABLESPACES WHERE NAME LIKE 'test/t3%';
+-------+--------------+---------------+-----------+----------------+
| SPACE | NAME         | FS_BLOCK_SIZE | FILE_SIZE | ALLOCATED_SIZE |
+-------+--------------+---------------+-----------+----------------+
|   492 | test/t3      |          4096 | 301989888 |      301989888 |
|   493 | test/t3_zstd |          4096 | 301989888 |      114909184 | - 38.05%
+-------+--------------+---------------+-----------+----------------+
```

压缩后的数据只有原来的38.05%，效果相当炸裂，可见当有大量长文本重复数据时的压缩效果是很不错的。

以上两个例子中，表`t2/t3`在加载完测试数据后，都再次执行`OPTIMIZE TABLE`重建整个表空间。

关于InnoDB Page压缩更多细节内容请参考：[InnoDB Page Compression](https://dev.mysql.com/doc/refman/8.0/en/innodb-page-compression.html)。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
