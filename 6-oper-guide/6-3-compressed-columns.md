# 带字典的压缩列

---

`per-column compression` 功能是一个数据类型修饰符，独立于用户级 SQL 和 InnoDB 数据压缩，它会导致列中存储的数据在写入存储时压缩并在读取时解压缩。对于所有其他目的，数据类型与没有修饰符的数据类型相同，即不会创建新的数据类型。压缩是通过使用 `zlib` 库完成的。

此外，可以为每个压缩列预先定义一组字符串，以在相对较小的单个数据项上实现更好的压缩比。

此功能提供：

- 使用静态字典的压缩方法，对由大量预定义单词（例如 JSON 或 XML）组成的文本数据提供更好的压缩率
- 一种选择表中的列进行压缩的方法（与 InnoDB 行压缩方法相反）。

## 规格

该功能仅限于 InnoDB 存储引擎和以下数据类型的列：

- `BLOB` （包括 TINYBLOB 、MEDIUMBLOB、LONGBLOG）
- `TEXT` （包括 TINYTEXT、 MEDUUMTEXT、LONGTEXT）
- `VARCHAR` （包括 NATIONAL VARCHAR）
- `VARBINARY`
- `JSON`

压缩列是通过使用扩展现有 `COLUMN_FORMAT` 修饰符的语法来声明的：`COLUMN_FORMAT COMPRESSED`。如果将此修饰符应用于不支持的列类型或存储引擎，则会返回错误。

可以指定压缩：

- 创建表时：
  - `CREATE TABLE ... (..., foo BLOB COLUMN_FORMAT COMPRESSED, ...);`
- 当更改表并将列修改为压缩格式时： 
  - `ALTER TABLE ... MODIFY [COLUMN] ... COLUMN_FORMAT COMPRESSED` 
  - `ALTER TABLE ... CHANGE [COLUMN] ... COLUMN_FORMAT COMPRESSED` 

与 MySQL 不同，压缩适用于生成的存储列。使用此语法扩展如下：

```sql
greatsql> CREATE TABLE t1(
       id INT,
       a BLOB,
       b JSON COLUMN_FORMAT COMPRESSED,
       g BLOB GENERATED ALWAYS AS (a) STORED COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY numbers
     ) ENGINE=InnoDB;
```

要解压缩列，请指定 `COMPRESSED` 到 `COLUMN_FORMAT` 以外的值： `FIXED` 、 `DYNAMIC` 或 `DEFAULT` 。如果 `ALTER TABLE` 中有列压缩/解压缩请求，则强制使用 `COPY` 算法。

两个新变量：`innodb_compressed_columns_zip_level` 和 `innodb_compressed_columns_threshold` 已实现

## 压缩字典支持

为了对相对较小的单个数据项实现更好的压缩比，可以预定义压缩字典，它是每个压缩列的一组字符串。

压缩字典可以表示为字符串形式的单词列表（逗号或任何其他字符可以用作分隔符，但不是必需的）。换句话说， `a, bb, ccc` 、 `a bb ccc` 和 `abbccc` 将具有相同的效果。然而，后者更为紧凑。引用符号引用由常规 SQL 引用处理。支持的最大字典长度为 32506 字节（ `zlib` 限制）。

压缩字典存储在新的系统InnoDB表中。由于该表是数据字典类型，因此允许并发读取，但写入是序列化的，并且读取会被写入阻塞。不支持通过旧的读视图读取表，类似于InnoDB内部DDL事务。

**与 innodb_force_recovery 变量交互**

压缩字典操作被视为 DDL 操作，但当`innodb_force_recovery` 设置为 `3` 时例外：值小于 `3` 时，允许压缩字典操作，并且值 >= `3` ，它们是被禁止的。

## 自定义压缩键

创建一个名为`dictionary_data`的变量，并将其值设置为字符串`'one' 'two' 'three' 'four'`。

```sql
greatsql> SET @dictionary_data = 'one' 'two' 'three' 'four';
Query OK, 0 rows affected (0.00 sec)
```

创建一个名为`numbers`的压缩字典，并使用前面定义的`dictionary_data`变量作为字典的内容:

```sql
greatsql> CREATE COMPRESSION_DICTIONARY numbers (@dictionary_data);
Query OK, 0 rows affected (0.05 sec)
```

要创建同时支持压缩和压缩字典的表，应该运行：

```sql
greatsql> CREATE TABLE t1(
    id INT, 
    a BLOB COLUMN_FORMAT COMPRESSED, 
    b BLOB COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY numbers 
) ENGINE=InnoDB;
Query OK, 0 rows affected (0.07 sec)
```

以下示例显示如何将 JSON 数据示例插入表中：

```sql
greatsql> SET @json_value =
'[\n'
' {\n'
' "one" = 0,\n'
' "two" = 0,\n'
' "three" = 0,\n'
' "four" = 0\n'
' },\n'
' {\n'
' "one" = 0,\n'
' "two" = 0,\n'
' "three" = 0,\n'
' "four" = 0\n'
' },\n'
' {\n'
' "one" = 0,\n'
' "two" = 0,\n'
' "three" = 0,\n'
' "four" = 0\n'
' },\n'
' {\n'
' "one" = 0,\n'
' "two" = 0,\n'
' "three" = 0,\n'
' "four" = 0\n'
' }\n'
']\n'
;
greatsql> INSERT INTO t1 VALUES(0, @json_value, @json_value);
Query OK, 1 row affected (0.05 sec)
```

## 新增INFORMATION_SCHEMA表

此功能新增了两个新的 `INFORMATION_SCHEMA` 表

### COMPRESSION_DICTIONARY

该表提供了内部压缩字典的视图。需要 `SUPER` 权限才能查询

查询该表结果如下：

```sql
greatsql> select * from INFORMATION_SCHEMA.COMPRESSION_DICTIONARY;
+--------------+-----------+----------------------------------+
| DICT_VERSION | DICT_NAME | DICT_DATA                        |
+--------------+-----------+----------------------------------+
|            1 | numbers   | 0x6F6E6574776F7468726565666F7572 |
+--------------+-----------+----------------------------------+
1 row in set (0.01 sec)
```

| 列名称       | 描述           |
| ------------ | -------------- |
| DICT_VERSION | 字典版本       |
| DICT_NAME    | 字典名称       |
| DICT_DATA    | 压缩字典字符串 |

### COMPRESSION_DICTIONARY_TABLES

该表提供了内部表的视图，该内部表存储压缩字典和使用它们的列之间的映射。查询需要 `SUPER` 权限。

查询该表结果如下：

```sql
greatsql> select * from INFORMATION_SCHEMA.COMPRESSION_DICTIONARY_TABLES;
+--------------+------------+-------------+-----------+
| TABLE_SCHEMA | TABLE_NAME | COLUMN_NAME | DICT_NAME |
+--------------+------------+-------------+-----------+
| test_db      | t1         | b           | numbers   |
+--------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

| 列名称       | 描述                                          |
| ------------ | --------------------------------------------- |
| TABLE_SCHEMA | 表模式（库名）                                |
| TABLE_NAME   | 表名 来自 INFORMATION_SCHEMA.INNODB_TABLES 表 |
| COLUMN_NAME  | 列名 来自INFORMATION_SCHEMA.INNODB_COLUMNS 表 |
| DICT_NAME    | 字典名                                        |

## 功能限制

压缩列不能在索引中使用（既不能单独使用，也不能作为组合键的一部分）。

`CREATE TABLE t2 AS SELECT \* FROM t1` 将创建一个包含压缩列的新表，而 `CREATE TABLE t2 AS SELECT CONCAT(a,'') AS a FROM t1` 将不会创建压缩列。

同时，执行 `CREATE TABLE t2 LIKE t1` 语句后 t2.a 将具有 `COMPRESSED` 属性。

具有压缩列的表不支持 `ALTER TABLE ... DISCARD/IMPORT TABLESPACE` 。

要导出和导入包含压缩列的表空间，请首先使用 `ALTER TABLE ... MODIFY ... COLUMN_FORMAT DEFAULT` 解压缩它们。

## mysqldump 命令行参数

默认情况下，如果没有其他选项， `mysqldump` 将生成 GreatSQL 兼容的 SQL 输出。

所有 `/\*!50633 COLUMN_FORMAT COMPRESSED \*/` 和 `/\*!50633 COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY <dictionary> \*/` 都不会出现在转储中。

当指定新选项 enable-compressed-columns 时，所有 `/\*!50633 COLUMN_FORMAT COMPRESSED \*/` 将保持不变，所有 `/\*!50633 COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY <dictionary> \*/` 将转换为 `/\*!50633 COLUMN_FORMAT COMPRESSED \*/` 。在此模式下，转储将包含创建压缩列所需的 SQL 语句，但不包含字典。

当指定新的 enable-compressed-columns-with-dictionaries 选项时，转储将包含所有压缩列属性和压缩字典。

此外，在第一次使用这些字典的 `CREATE TABLE` 语句之前将添加以下字典创建片段。

```sql
/*!50633 DROP COMPRESSION_DICTIONARY IF EXISTS <dictionary>; */
/*!50633 CREATE COMPRESSION_DICTIONARY <dictionary>(...); */
```

两个新选项 add-drop-compression-dictionary 和skip-add-drop-compression-dictionary 将控制是否跳过上一段中的 `/\*!50633 DROP COMPRESSION_DICTIONARY IF EXISTS <dictionary> \*/` 部分。默认情况下，将使用 add-drop-compression-dictionary 模式。

当同时指定 enable-compressed-columns-with-dictionaries 和 `--tab=<dir>` （每个表的单独文件）选项时，将使用以下片段在每个输出文件中创建必要的压缩字典（无论add-drop-compression-dictionary 和skip-add-drop-compression-dictionary 选项）。

```sql
/*!50633 CREATE COMPRESSION_DICTIONARY IF NOT EXISTS <dictionary>(...); */
```

## 新增系统参数

### innodb_compressed_columns_zip_level

| System Variable Name | innodb_compressed_columns_zip_level |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 6                                   |
| Range                | 0-9                                 |

该变量用于指定压缩列的压缩级别。指定 `0` 将不使用压缩， `1` 最快， `9` 最佳压缩。默认值为 `6` 。

### innodb_compressed_columns_threshold

| System Variable Name | innodb_compressed_columns_threshold |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 96                                  |
| Range                | 1 - 2^64-1（或 32 位版本为 2^32-1） |

默认情况下，如果插入的值的长度超过 `innodb_compressed_columns_threshold` 字节，则该值将被压缩。否则，它将以原始（未压缩）形式存储。

还请注意，由于某些数据的性质，压缩后的表示可能比原始值更长。在这种情况下，以压缩形式存储这些值是没有意义的，因为 GreatSQL 将不得不浪费内存空间和 CPU 资源来进行不必要的解压缩。因此，即使此类不可压缩值的长度超过`innodb_compressed_columns_threshold`它们也会以未压缩的形式存储（但仍会尝试压缩）。

对于用户事先已知其前 N 个字节的压缩率较差的值，可以调整此参数以跳过不必要的数据压缩尝试。

## 问题反馈

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
