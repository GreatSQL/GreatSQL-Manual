# Oracle兼容-语法-EXTERNAL TABLE
---


GreatSQL中支持外部表特性。

外部表是指不存在于数据库中的表，通过向数据库提供描述外部表的元数据，可以把一个操作系统文件当成一个只读的数据库表，就像这些数据存储在一个普通数据库表中一样来进行访问。

## 1. 语法

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

参数说明：

1. `DEFAULT DIRECTORY`：外部文件所在操作系统上的存储路径。

2. `LOACATION`：定义了外部表源文件位置，可由目录和文件名组成，数据文件命名后缀必须是 `*.csv` 或 `*.CSV`。当指定源文件位置包含目录信息时，则 `DEFAULT DIRECTORY` 参数不生效；否则会在 `DEFAULT DIRECTORY` 参数指向的目录下读取源文件。


## 2. 定义和用法

外部表目前只支持外部CSV格式文件数据，是在 `CSV` 引擎基础上新增 `DLK` 引擎来管理外部表。

外部表数据源位于文件系统之中，只有CSV格式文件可以作为外部表的数据源。

可以通过SQL语句来访问外部表，无需事先装载表数据装。

对外部表只能进行 `SELECT` 只读查询，不能执行有修改数据的 `DML` 操作（`INSERT`、`UPDATE`、`DELETE`），也不能创建索引。


外部表中的列定义不能支持NULL，读取外部文件数据时也无法有效识别空列。


## 3. Oracle兼容说明

当前GreatSQL和Oracle外部表功能的主要区别有以下几点：

1. GreatSQL外部表不需要设置安全目录。

2. GreatSQL外部表只能指定单个文件，不支持多个数据文件导入。

3. GreatSQL外部表不能指定外部文件的读取格式。

4. GreatSQL外部表不能设定外部文件的访问驱动接口。


## 4. 示例

- 1. 先准备好源文件

```shell
$ cat /data/external/extt.CSV

1,"c2_row1","c3_row1"
2,"c2_row2","c3_row2"
3,"c2_row3","c3_row3"
4,"c2_row4","c3_row4"
5,"c2_row5","c3_row5"
6,"c2_row6","c3_row6"
```

- 2. 创建外部表

采用以下几种不同方式都可以创建外部表：

```sql
-- 1. 分别定义DEFAULT DIRECTORY和LOCATION
greatsql> CREATE TABLE extt_t1 (
c1 INT NOT NULL,
c2 VARCHAR(10) NOT NULL,
c3 CHAR(20) NOT NULL)
ORGANIZATION EXTERNAL(
DEFAULT DIRECTORY '/data/external'
LOCATION ('extt.csv'));

-- 2. LOCATION已经指定完整路径
greatsql> CREATE TABLE extt_t2 (
c1 INT NOT NULL,
c2 VARCHAR(10) NOT NULL,
c3 CHAR(20) NOT NULL) 
ORGANIZATION EXTERNAL ( 
LOCATION ( '/data/external' : 'extt.csv'));

-- 3. LOCATION已经指定完整路径，忽略DEFAULT DIRECTORY参数
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

-- 三个表checksum一致
greatsql> CHECKSUM TABLE extt_t1, extt_t2, extt_t3;
+------------------+------------+
| Table            | Checksum   |
+------------------+------------+
| greatsql.extt_t1 | 1347810397 |
| greatsql.extt_t2 | 1347810397 |
| greatsql.extt_t3 | 1347810397 |
+------------------+------------+
```

- 3. 访问和管理外部表

```sql
-- 1. 查看表DDL
-- 另外两个外部表的DDL也一样
greatsql> SHOW CREATE TABLE extt_t1\G
*************************** 1. row ***************************
       Table: extt_t1
Create Table: CREATE TABLE `extt_t1` (
  `c1` int NOT NULL,
  `c2` varchar(10) NOT NULL,
  `c3` char(20) NOT NULL
) ORGANIZATION EXTERNAL ( LOCATION ( '/data' : 'extt.csv'))

-- 2. 删除外部表
greatsql> DROP TABLE extt_t1, extt_t2, extt_t3;
Query OK, 0 rows affected (0.01 sec)

-- 删除全部外部表后，源文件依然存在，不会被同步删除
$ ls -la /data/external/extt.csv
-rw-r--r-- 1 root root 132 Nov 20 13:35 /data/external/extt.csv
```

- 4. 不支持的外部表操作

外部表不支持的一些操作类型：`INSERT`、`UPDATE`、`DELETE`、`ALTER TABLE`、`TRUNCATE`、`CREATE INDEX`。

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


## 5. 外部表数据字典

```sql
-- 查询ENGINE = 'DLK'的表
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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
