# Compressed Columns with Dictionaries

---

The `per-column compression` feature is a data type modifier, independent of user-level SQL and InnoDB data compression. It causes the data stored in a column to be compressed when written to storage and decompressed when read. For all other purposes, the data type is the same as the data type without the modifier, i.e., no new data type is created. Compression is done using the `zlib` library.

In addition, a set of strings can be predefined for each compressed column to achieve better compression ratios on relatively small individual data items.

This feature provides:

- A compression method using static dictionaries, providing better compression ratios for text data composed of a large number of predefined words (such as JSON or XML)
- A method to select columns in a table for compression (as opposed to the InnoDB row compression method).

## Specifications

This feature is limited to the InnoDB storage engine and columns of the following data types:

- `BLOB` (including TINYBLOB, MEDIUMBLOB, LONGBLOB)
- `TEXT` (including TINYTEXT, MEDIUMTEXT, LONGTEXT)
- `VARCHAR` (including NATIONAL VARCHAR)
- `VARBINARY`
- `JSON`

Compressed columns are declared by using syntax that extends the existing `COLUMN_FORMAT` modifier: `COLUMN_FORMAT COMPRESSED`. If this modifier is applied to an unsupported column type or storage engine, an error is returned.

Compression can be specified:

- When creating a table:
  - `CREATE TABLE ... (..., foo BLOB COLUMN_FORMAT COMPRESSED, ...);`
- When altering a table and modifying a column to compressed format: 
  - `ALTER TABLE ... MODIFY [COLUMN] ... COLUMN_FORMAT COMPRESSED` 
  - `ALTER TABLE ... CHANGE [COLUMN] ... COLUMN_FORMAT COMPRESSED` 

Unlike MySQL, compression applies to generated stored columns. This syntax extension is used as follows:

```sql
greatsql> CREATE TABLE t1(
       id INT,
       a BLOB,
       b JSON COLUMN_FORMAT COMPRESSED,
       g BLOB GENERATED ALWAYS AS (a) STORED COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY numbers
     ) ENGINE=InnoDB;
```

To decompress a column, specify a value other than `COMPRESSED` for `COLUMN_FORMAT`: `FIXED`, `DYNAMIC`, or `DEFAULT`. If there is a column compression/decompression request in `ALTER TABLE`, the `COPY` algorithm is forced.

Two new variables: `innodb_compressed_columns_zip_level` and `innodb_compressed_columns_threshold` have been implemented

## Compression Dictionary Support

To achieve better compression ratios on relatively small individual data items, a compression dictionary can be predefined, which is a set of strings for each compressed column.

A compression dictionary can be represented as a word list in string form (commas or any other character can be used as separators, but are not required). In other words, `a, bb, ccc`, `a bb ccc`, and `abbccc` will have the same effect. However, the latter is more compact. Quoting symbols are handled by regular SQL quoting. The maximum supported dictionary length is 32506 bytes (a `zlib` limitation).

Compression dictionaries are stored in a new system InnoDB table. Because this table is of the data dictionary type, concurrent reads are allowed, but writes are serialized and reads are blocked by writes. Reading the table through an old read view is not supported, similar to InnoDB internal DDL transactions.

**Interaction with the innodb_force_recovery variable**

Compression dictionary operations are treated as DDL operations, with an exception when `innodb_force_recovery` is set to `3`: for values less than `3`, compression dictionary operations are allowed, and for values >= `3`, they are forbidden.

## Custom Compression Dictionary

Create a variable named `dictionary_data` and set its value to the string `'one' 'two' 'three' 'four'`.

```sql
greatsql> SET @dictionary_data = 'one' 'two' 'three' 'four';
Query OK, 0 rows affected (0.00 sec)
```

Create a compression dictionary named `numbers` and use the previously defined `dictionary_data` variable as the dictionary content:

```sql
greatsql> CREATE COMPRESSION_DICTIONARY numbers (@dictionary_data);
Query OK, 0 rows affected (0.05 sec)
```

To create a table that supports both compression and compression dictionaries, the following should be run:

```sql
greatsql> CREATE TABLE t1(
    id INT, 
    a BLOB COLUMN_FORMAT COMPRESSED, 
    b BLOB COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY numbers 
) ENGINE=InnoDB;
Query OK, 0 rows affected (0.07 sec)
```

The following example shows how to insert a sample of JSON data into the table:

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

## New INFORMATION_SCHEMA Tables

This feature adds two new `INFORMATION_SCHEMA` tables

### COMPRESSION_DICTIONARY

This table provides a view of internal compression dictionaries. The `SUPER` privilege is required to query it

The result of querying this table is as follows:

```sql
greatsql> select * from INFORMATION_SCHEMA.COMPRESSION_DICTIONARY;
+--------------+-----------+----------------------------------+
| DICT_VERSION | DICT_NAME | DICT_DATA                        |
+--------------+-----------+----------------------------------+
|            1 | numbers   | 0x6F6E6574776F7468726565666F7572 |
+--------------+-----------+----------------------------------+
1 row in set (0.01 sec)
```

| Column Name       | Description           |
| ------------ | -------------- |
| DICT_VERSION | The dictionary version       |
| DICT_NAME    | The dictionary name       |
| DICT_DATA    | The compression dictionary string |

### COMPRESSION_DICTIONARY_TABLES

This table provides a view of the internal table that stores the mapping between compression dictionaries and the columns using them. The `SUPER` privilege is required to query it.

The result of querying this table is as follows:

```sql
greatsql> select * from INFORMATION_SCHEMA.COMPRESSION_DICTIONARY_TABLES;
+--------------+------------+-------------+-----------+
| TABLE_SCHEMA | TABLE_NAME | COLUMN_NAME | DICT_NAME |
+--------------+------------+-------------+-----------+
| test_db      | t1         | b           | numbers   |
+--------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

| Column Name       | Description                                          |
| ------------ | --------------------------------------------- |
| TABLE_SCHEMA | The table schema (database name)                                |
| TABLE_NAME   | The table name, from the INFORMATION_SCHEMA.INNODB_TABLES table |
| COLUMN_NAME  | The column name, from the INFORMATION_SCHEMA.INNODB_COLUMNS table |
| DICT_NAME    | The dictionary name                                        |

## Feature Limitations

Compressed columns cannot be used in indexes (neither alone nor as part of a composite key).

`CREATE TABLE t2 AS SELECT * FROM t1` creates a new table with compressed columns, while `CREATE TABLE t2 AS SELECT CONCAT(a,'') AS a FROM t1` does not create compressed columns.

At the same time, after executing the `CREATE TABLE t2 LIKE t1` statement, t2.a has the `COMPRESSED` attribute.

`ALTER TABLE ... DISCARD/IMPORT TABLESPACE` is not supported for tables with compressed columns.

To export and import a tablespace containing compressed columns, first decompress them using `ALTER TABLE ... MODIFY ... COLUMN_FORMAT DEFAULT`.

## `mysqldump` Command-Line Parameters

By default, if there are no other options, `mysqldump` generates GreatSQL-compatible SQL output.

All `/*!50633 COLUMN_FORMAT COMPRESSED */` and `/*!50633 COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY <dictionary> */` do not appear in the dump.

When the new option enable-compressed-columns is specified, all `/*!50633 COLUMN_FORMAT COMPRESSED */` remain unchanged, and all `/*!50633 COLUMN_FORMAT COMPRESSED WITH COMPRESSION_DICTIONARY <dictionary> */` are converted to `/*!50633 COLUMN_FORMAT COMPRESSED */`. In this mode, the dump contains the SQL statements needed to create compressed columns, but not the dictionaries.

When the new enable-compressed-columns-with-dictionaries option is specified, the dump contains all compressed column attributes and compression dictionaries.

In addition, the following dictionary creation snippets are added before the first `CREATE TABLE` statements that use these dictionaries.

```sql
/*!50633 DROP COMPRESSION_DICTIONARY IF EXISTS <dictionary>; */
/*!50633 CREATE COMPRESSION_DICTIONARY <dictionary>(...); */
```

The two new options add-drop-compression-dictionary and skip-add-drop-compression-dictionary control whether the `/*!50633 DROP COMPRESSION_DICTIONARY IF EXISTS <dictionary> */` part in the previous paragraph is skipped. By default, the add-drop-compression-dictionary mode is used.

When enable-compressed-columns-with-dictionaries and the `--tab=<dir>` (separate files per table) option are specified at the same time, the following snippet is used to create the necessary compression dictionaries in each output file (regardless of the add-drop-compression-dictionary and skip-add-drop-compression-dictionary options).

```sql
/*!50633 CREATE COMPRESSION_DICTIONARY IF NOT EXISTS <dictionary>(...); */
```

## New System Parameters

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

This variable is used to specify the compression level of compressed columns. Specifying `0` does not use compression, `1` is the fastest, and `9` is the best compression. The default value is `6`.

### innodb_compressed_columns_threshold

| System Variable Name | innodb_compressed_columns_threshold |
| -------------------- | ----------------------------------- |
| Command-line         | YES                                 |
| Config file          | YES                                 |
| Variable Scope       | Global                              |
| Dynamic Variable     | YES                                 |
| Data type            | Numeric                             |
| Default              | 96                                  |
| Range                | 1 - 2^64-1 (or 2^32-1 for 32-bit versions) |

By default, if the length of the inserted value exceeds `innodb_compressed_columns_threshold` bytes, the value is compressed. Otherwise, it is stored in its original (uncompressed) form.

Also note that, due to the nature of some data, the compressed representation may be longer than the original value. In this case, storing these values in compressed form is meaningless, because GreatSQL would have to waste memory space and CPU resources on unnecessary decompression. Therefore, even if the length of such incompressible values exceeds `innodb_compressed_columns_threshold`, they are stored in uncompressed form (but compression is still attempted).

For values whose compression ratio of the first N bytes is known to be poor in advance by the user, this parameter can be adjusted to skip unnecessary data compression attempts.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
