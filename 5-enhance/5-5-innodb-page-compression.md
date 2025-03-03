# InnoDB Page压缩
---

## 简介

InnoDB Page Compression（透明页压缩）是一种基于文件系统的表空间压缩技术，通过Zlib/LZ4/Zstd等算法对数据页进行压缩，并利用稀疏文件特性（如Linux的hole punching或Windows的NTFS压缩单元）释放尾部空白块，从而减少物理存储占用。该特性仅适用于`file-per-table`表空间（独立表空间），且依赖操作系统内核及文件系统对空洞机制的支持，在不同平台有特定的版本和配置要求。

从GreatSQL 8.0.32-27版本开始，Page压缩新增支持Zstd算法，它可以使得Page压缩率提高约5%。

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
greatsql> SELECT SPACE, NAME, FS_BLOCK_SIZE, FILE_SIZE, ALLOCATED_SIZE FROM INFORMATION_SCHEMA.INNODB_TABLESPACES WHERE NAME like 'test/t1%';
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

关于InnoDB Page压缩更多细节内容请参考：[InnoDB Page Compression](https://dev.mysql.com/doc/refman/8.0/en/innodb-page-compression.html)。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
