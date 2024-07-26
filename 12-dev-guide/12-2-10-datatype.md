# 常用数据类型

本节介绍在 GreatSQL 中常用的数据类型，包括以下几个：

## 整数类型

1. **TINYINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **范围**：-128 到 127（带符号/SIGNED）；0 到 255（无符号/UNSIGNED）
   - **存储空间**：1字节
   - **注意事项**：适用于极小范围的整数。

2. **SMALLINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **范围**：-32768 到 32767（带符号/SIGNED）；0 到 65535（无符号/UNSIGNED）
   - **存储空间**：2字节
   - **注意事项**：适用于小范围的整数。

3. **MEDIUMINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **范围**：-8388608 到 8388607（带符号/SIGNED）；0 到 16777215（无符号/UNSIGNED）
   - **存储空间**：3字节
   - **注意事项**：适用于中等范围的整数。

4. **INT[(M)] [UNSIGNED] [ZEROFILL]**
   - INTEGER 类型是 INT 的别名，用法一样
   - **范围**：-2147483648 到 2147483647（带符号）；0 到 4294967295（无符号）
   - **存储空间**：4字节
   - **注意事项**：最常用的整型数据类型，也经常用做大表的自增主键类型，适用于绝大多数场景。

5. **BIGINT[(M)] [UNSIGNED] [ZEROFILL]**
   - **范围**：-2^63 到 2^63-1（带符号/SIGNED）；0 到 2^64-1（无符号/UNSIGNED）
   - **存储空间**：8字节
   - **注意事项**：适用于超大范围的整数，经常用做大表的自增主键类型。

6. **UNSIGNED**，无符号标识，如果不加这个标识，则为有符号数。

7. **ZEROFILL**，补零标识，如果有这个标识，如果定义了长度 M，则在显示查询结果时会在左侧补零，但不影响实际存储数据。

示例：

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

-- id列自增属性，可以指定为0
greatsql> insert into t_int values(0, 1, 1);

-- c1列不允许为负数
greatsql> INSERT INTO t_int VALUES(0, -2, -2);
ERROR 1264 (22003): Out of range value for column 'c1' at row 1

greatsql> INSERT INTO t_int VALUES(0, 2, -2);

greatsql> INSERT INTO t_int VALUES(0, 3, 0);

-- c2列允许为NULL
greatsql> INSERT INTO t_int VALUES(0, 4, NULL);

-- 只指定c1列的值，c2列使用默认值
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

## 浮点类型

1. **FLOAT[(M,D)] [UNSIGNED] [ZEROFILL]**
   - **范围**：4字节（单精度）： -3.402823466E+38 到 -1.175494351E-38, 0, 1.175494351E-38 到 3.402823466E+38；无符号：0 到 3.402823466E+38
   - **存储空间**：
     - FLOAT, 4字节
     - FLOAT(p), 0 <= p <= 24 时4字节, 25 <= p <= 53时8字节
   - **注意事项**：浮点数在计算过程中可能存在精度损失，适用于科学计算等需要浮点数的场景。

2. **DOUBLE(M, D) [UNSIGNED] [ZEROFILL]**
   - **范围**：8字节（双精度）： -1.7976931348623157E+308 到 -2.2250738585072014E-308, 0, 2.2250738585072014E-308 到 1.7976931348623157E+308；无符号：0 到 1.7976931348623157E+308
   - **存储空间**：8字节
   - **注意事项**：双精度浮点数提供更高的精度和范围，但占用更多存储空间，适用于需要高精度的计算场景。

3. 浮点类型可能会导致精度丢失，因此在需要精确计算的场景（如财务计算）应慎用。

4. 浮点类型的计算通常比整数类型慢，使用时需要权衡性能和精度。

5. 通常建议把对精度有要求的浮点型数据做一定处理后，改成用 DECIMAL 或 INT/BIGINT 来存储以提高精度。

## 定点类型

1. **DECIMAL[(M[,D])] [UNSIGNED] [ZEROFILL]**
   - NUMBER 类型是 DECIMAL 的别名，用法一样
   - **范围**：定点数，M是总位数，默认值为10，最大值为65；D是小数位数，默认值为0，最大值为30
   - **存储空间**：可变，取决于M和D。每九位数字（9个十进制数）需要占用4字节
   - **注意事项**：适用于高精度计算的场景，如财务数据。

示例：

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

-- 查询结果表明DOUBLE比FLOAT精度更高
greatsql> SELECT * FROM t1;
+----+---------+---------+---------+---------+----------+------+
| id | c1      | c2      | c3      | c4      | c5       | c6   |
+----+---------+---------+---------+---------+----------+------+
|  1 | 123.457 | 123.457 | 123.457 | 123.457 | 123.4567 |  123 |
|  2 | 123.432 | 123.432 | 123.432 | 123.432 | 123.4321 |  123 |
+----+---------+---------+---------+---------+----------+------+
```

## 字符串类型

1. **CHAR(N)**
   - **范围**：定长字符串，N为长度。
   - **存储长度**：1到255字符，假设选择使用 utf8mb4 字符集，则最大的存储空间为1020字节。
   - **注意事项**：
     - **固定长度**：适用于存储固定长度数据，如国家代码、邮政编码等。
     - **填充空格**：如果插入的数据长度小于指定长度，会在末尾填充空格以达到固定长度（但是在显示读取结果时会截断尾部空格）。
     - **额外存储**：当定义的存储长度 N<=255 字节时，需要额外存储1字节；当定义存储长度 N>255 字节时，需要额外存储2字节。

2. **VARCHAR(N)**
   - **范围**：变长字符串，N为最大长度。
   - **存储长度**：0到65535字节，因此如果选择使用 utf8mb4 字符集，则定义长度N最大只能是16382个字符。
   - **注意事项**：
     - **变长特性**：适合存储长度可变的字符串数据，避免空间浪费。
     - **额外存储**：当定义的存储长度 N<=255 字节时，需要额外存储1字节；当定义存储长度 N>255 字节时，需要额外存储2字节。
     - **空格处理**：向 VARCHAR 列插入数据尾部带空格时不会被自动截断，仍旧显示。

```sql
greatsql> CREATE TABLE t1(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  c1 CHAR(15) NOT NULL DEFAULT '',
  c2 VARCHAR(15) NOT NULL DEFAULT '');

-- 插入时尾部总是包含三个空格
greatsql> INSERT INTO t1 VALUES(0, 'abcde', 'abcde   '), (0, '', '   '), 
  (0, 'GreatSQL数据库', 'GreatSQL数据库   ');

greatsql> INSERT INTO t1 VALUES(0, NULL, NULL);
ERROR 1048 (23000): Column 'c1' cannot be null

greatsql> SELECT id, c1, LENGTH(c1), c2, LENGTH(c2) FROM t1;
+----+-------------------+------------+----------------------+------------+
| id | c1                | LENGTH(c1) | c2                   | LENGTH(c2) |
+----+-------------------+------------+----------------------+------------+
|  1 | abcde             |          5 | abcde                |          8 |
|  2 |                   |          0 |                      |          3 |
|  3 | GreatSQL数据库    |         17 | GreatSQL数据库       |         20 |
+----+-------------------+------------+----------------------+------------+

-- VARCHAR列定义长度不能超过16383，否则报错
greatsql> CREATE TABLE t2(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, c1 VARCHAR(16383) NOT NULL DEFAULT '');
ERROR 1118 (42000): Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs
greatsql> CREATE TABLE t2(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, c1 VARCHAR(16382) NOT NULL DEFAULT '');
```

## 时间和日期类型

1. **DATETIME[(fsp)]**
  - **取值范围**: `1000-01-01 00:00:00` 到 `9999-12-31 23:59:59`
  - **存储空间**: 5个字节
  - **使用注意事项**: 存储的是日期和时间，不受时区影响。适用于需要精确记录某一时刻的场景。

2. **TIMESTAMP[(fsp)]**
  - **取值范围**: `1970-01-01 00:00:01` UTC 到 `2038-01-19 03:14:07` UTC
  - **存储空间**: 4个字节
  - **使用注意事项**: 存储的是 UNIX 时间戳，会自动根据系统时区进行转换。适用于记录创建时间或更新时间等时区相关的场景。

3. **DATE**
  - **取值范围**: `1000-01-01` 到 `9999-12-31`
  - **存储空间**: 3个字节
  - **使用注意事项**: 只存储日期部分，适用于只需记录日期的场景，例如生日。

4. **YEAR[(4)]**
  - **取值范围**: `1901` 到 `2155`
  - **存储空间**: 1个字节
  - **使用注意事项**: 只存储年份，适用于只需记录年份的场景，例如记录年份的数据。

5. **TIME[(fsp)]**
  - **取值范围**: `-838:59:59` 到 `838:59:59`
  - **存储空间**: 3个字节
  - **使用注意事项**: 存储的是时间部分，可以存储负数，适用于记录时间间隔或持续时间。

6. 两个最常用的数据类型 DATETIME 和 TIMESTAMP 的区别主要有几点
  - **存储方式**： 
    - DATETIME：存储的是日期和时间，格式为 YYYY-MM-DD HH:MM:SS，不受时区影响。
    - TIMESTAMP：存储的是从1970年1月1日 UTC 时间以来的秒数，会受时区影响，自动进行时区转换。
  - **取值范围**：
    - DATETIME：范围从 1000-01-01 00:00:00 到 9999-12-31 23:59:59。
    - TIMESTAMP：范围从 1970-01-01 00:00:01 UTC 到 2038-01-19 03:14:07 UTC。
  - **存储空间**：
    - DATETIME：使用 8 个字节。
    - TIMESTAMP：使用 4 个字节。
  - **自动更新**：
    - 二者都支持在一个表中定义多个列，并自动更新为当前时间。
  - **建议优先使用**：
    - DATETIME：当你需要记录不受时区影响的固定时间时（例如预约时间）。
    - TIMESTAMP：当你需要记录受时区影响的时间，并且希望在时区转换时保持一致（例如记录创建时间或更新时间）。
    - 总的来说，建议更优先使用 DATETIME 类型，其存储的日期时间范围更大，整体的性能和 TIMESTAMP 相当。另外，如果使用 TIMESTAMP 类型，在高并发业务场景中，可能更容易触发因为要进行时区转换而带来的 CPU 高负载问题。

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

7. 使用注意事项
  - **选择适当的数据类型**: 根据实际需求选择适合的日期时间数据类型，以确保存储效率和数据准确性。
  - **时区处理**: 使用`TIMESTAMP`时需注意时区转换问题，确保时区设置正确。
  - **存储空间**: 确保字段类型选择合理，以节省存储空间。

## JSON 类型

JSON 数据类型理论上可以存储任何有效的 JSON 文档，包括数字、字符串、布尔值、数组和对象等。JSON 数据会被存储为二进制格式，这样可以在检索时更有效率。最大可存储65535字节，实际存储空间取决于 JSON 文档的内容和大小。


1. **创建表并使用JSON字段**：
```sql
greatsql> CREATE TABLE t1(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data JSON);
```

2. **插入JSON数据**：
```sql
greatsql> INSERT INTO t1(data) VALUES ('{"name": "乌孙怀玉", "age": 30, "city": "Beijing"}');
```

3. **查询JSON数据**：

    - 获取整个JSON字段：
```sql
greatsql> SELECT data FROM t1 WHERE id = 1;
+--------------------------------------------------------+
| data                                                   |
+--------------------------------------------------------+
| {"age": 30, "city": "Beijing", "name": "乌孙怀玉"}     |
+--------------------------------------------------------+
```

    - 获取JSON字段的某个属性：

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

> `->` 操作符：用于从 JSON 字段中提取 JSON 值。返回的值仍然是 JSON 格式。
>
> `->>` 操作符：用于从 JSON 字段中提取纯文本值。返回的值是纯文本格式。

4. **更新JSON数据**：
```sql
greatsql> UPDATE t1 SET data = JSON_SET(data, '$.age', 31) WHERE id = 1;
```

5. **删除JSON字段的某个属性**：
```sql
greatsql> UPDATE t1 SET data = JSON_REMOVE(data, '$.city') WHERE id = 1;
```

6. 使用注意事项

-  **索引**：允许在 JSON 字段上创建虚拟列，并对这些虚拟列创建索引，从而提高查询性能。
-  **验证**：插入的数据必须是合法的 JSON 格式，在插入时会进行验证。
-  **性能**：虽然 JSON 数据类型很灵活，但复杂的 JSON 操作可能会影响查询性能，因此在设计数据库时应慎重考虑。

JSON数据类型为存储和操作JSON数据提供了便利，并且支持多种JSON函数和操作，但应注意性能和索引优化。

下面是利用虚拟列对 JSON 列创建索引的示例

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

利用虚拟列，可以实现对 JSON 数据创建索引，极大提高搜索效率。

## 文本、大对象类型

TEXT数据类型用于存储大文本数据，有四种类型：TINYTEXT、TEXT、MEDIUMTEXT、和LONGTEXT。

1. **TINYTEXT**：
   - 取值范围：最大255字节
   - 存储空间：1字节 + 实际存储数据的字节数。

2. **TEXT**：
   - 取值范围：最大65535字节（64 KB）
   - 存储空间：2字节 + 实际存储数据的字节数。

3. **MEDIUMTEXT**：
   - 取值范围：最大16777215字节（16 MB）
   - 存储空间：3字节 + 实际存储数据的字节数。

4. **LONGTEXT**：
   - 取值范围：最大4294967295字节（4 GB）
   - 存储空间：4字节 + 实际存储数据的字节数。

5. 几个注意事项
  - **索引**：TEXT 类型的列不能直接建立索引，但可以对前N个字符建立前缀索引。
  - **存储效率**：TEXT 类型不在内存中而是存储在磁盘上，操作大文本时可能影响性能。
  - **字符集**：确保字符集和排序规则（collation）设置正确，避免出现乱码问题。
  - **查询性能**：对 TEXT 列的查询和排序性能相对较低，适合存储不经常查询的大文本数据。

BLOB（Binary Large Object）数据类型用于存储二进制数据，如图像、视频等。它有四种类型：TINYBLOB、BLOB、MEDIUMBLOB和LONGBLOB。

1. **TINYBLOB**：
   - 取值范围：最大255字节
   - 存储空间：1字节 + 实际数据大小。

2. **BLOB**：
   - 取值范围：最大65,535字节（64 KB）
   - 存储空间：2字节 + 实际数据大小。

3. **MEDIUMBLOB**：
   - 取值范围：最大16,777,215字节（16 MB）
   - 存储空间：3字节 + 实际数据大小。

4. **LONGBLOB**：
   - 取值范围：最大4,294,967,295字节（4 GB）
   - 存储空间：4字节 + 实际数据大小。

数据类型 TEXT/BLOB 中通常存储长文本或大对象，使用时有以下几个注意事项

- 由于 TEXT/BLOB 类型的数据通常较大，处理这类数据时需要考虑性能问题。
- 不要在 TEXT/BLOB 类型的列上建立索引，确实有需要时，可以对前N个字节建立前缀索引。
- 不要对 TEXT/BLOB 类型数据进行 `LIKE '%x%'` 这样的模糊查询，也不建议使用全文索引。
- 对于有 TEXT/BLOB 列的表，不要总是执行 `SELECT *` 查询，而是明确每次要读取的列，并且非必要不读取 TEXT/BLOB 列。
- 存储空间：TEXT/BLOB 类型的数据会占用较大的存储空间，特别是当存储大量文本时，很容易导致发生数据页溢出（[overflow page](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_overflow_page)）问题，引发比较严重的性能问题。
- 尽量不使用、少使用 TEXT/BLOB 数据类型，如果需要存储图片附件等数据时，可以把这些文件放在磁盘存储中，只在数据库中保存其存储路径，可以大幅减少存储空间消耗，提升数据库读写性能。

## 枚举、集合类型

1. **枚举 ENUM**
   - **范围**：从预定义字符串集合中选择一个值。
   - **存储空间**：1到2字节
   - **注意事项**：适用于有限选项集。

2. **集合 SET**
   - **范围**：从预定义字符串集合中选择多个值组合。
   - **存储空间**：1到8字节
   - **注意事项**：适用于存储多个不重复选项。

这两种数据类型相对较少使用，如果有需要建议改成用 TINYINT/SMALLINT 来表示，性能更好，业务中使用起来也更灵活。

## 总结

为了尽可能保证业务应用开发的性能，合理选择和使用数据类型是非常关键的。下面是一些关于常用数据类型在使用中的注意事项、优化技巧以及如何提升和保证性能的方法：

1. 选择适当的数据类型
  - **CHAR vs VARCHAR**：对于固定长度的字符串，使用 `CHAR` 可以提高性能，但对于长度变化较大的字符串，使用 `VARCHAR` 更节省空间。
  - **INT vs BIGINT**：在能满足需求的情况下，尽量使用更小的数据类型，如 `INT` 而不是 `BIGINT`，以减少存储空间和提高索引性能。
  - **FLOAT vs DECIMAL**：对于需要精确数值计算的场景，使用 `DECIMAL` 类型，而对于不需要精确值的场景，可以使用 `FLOAT` 或 `DOUBLE`。
  - **避免过大的字符串**：对于非常大的文本或二进制数据，考虑使用 `TEXT` 或 `BLOB` 类型，但要注意这些类型不适合建立索引。
  - **使用 `DATETIME`**：对于需要存储完整日期时间信息的场景，使用 `DATETIME` 类型。**避免使用 `TIMESTAMP`**：除非需要自动更新或记录时间戳，否则使用 `DATETIME` 类型可以避免时区相关的问题。
  - **考虑 JSON 存储**：对于结构化程度较低的数据，可以考虑使用 JSON 类型，以提高灵活性。
  - **避免频繁更新 JSON 字段**：频繁更新 JSON 字段可能导致性能下降，因为整个 JSON 字段需要被重新写入。

2. 合理使用索引
  - **索引选择**：为经常用于查询条件的列创建索引，特别是经常出现在 `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY` 子句中的列。
  - **复合索引**：考虑创建复合索引（多个列的索引），以减少索引的数量并提高查询效率。
  - **覆盖索引**：创建覆盖索引（即索引中包含查询所需的所有列），以避免额外的表扫描。

3. 避免使用 `NULL`
  - **使用非空值**：尽量避免在列上使用 `NULL` 值，因为这会导致索引变得复杂，影响查询性能。
  - **默认值**：为列指定默认值，以便在插入数据时自动填充。

4. 其他使用和优化原则
  - 尽可能使用更小、更短的数据类型，例如能用 TINYINT 的就不用 BIGINT，能用 VARCHAR(5) 的就不用 VARCHAR(50)。
  - 对于 CHAR/VARCHAR/TEXT/BLOB 等数据类型，尽可能不要加长更新，例如原来只有 10 个字符，更新后变成 20 个字符。
  - 对于 CHAR/VARCHAR/TEXT/BLOB 等数据类型，尽可能不要创建索引，确实有需要的话就创建前缀索引。
  - 对于 TEXT/BLOB 等可能存储较大数据的场景，最好把它们放在独立的表中，不要和其他更新频率更高的列放在ton一个表里。
  - 同理，最好根据更新频率区分，把经常更新和不经常更新的列分开来放到不同的表里，不要混合存储，减少对物理 I/O 的读写压力。

尽可能严格遵循上述方法、原则，通常可以有效地提升和保证业务应用的性能。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
