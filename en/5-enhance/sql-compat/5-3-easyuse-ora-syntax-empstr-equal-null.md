# Oracle Compatibility - Syntax - Empty String '' Equivalent to NULL Mode
---

## 1. Syntax

```sql
SET GLOBAL|SESSION sql_mode = EMPTYSTRING_EQUAL_NULL;
```

## 2. Definition and Usage

After enabling the `sql_mode = EMPTYSTRING_EQUAL_NULL` mode, the empty string `''` is treated as `NULL`. However, this does not mean that `NULL` is equivalent to the empty string `''` in usage.

Enabling the `EMPTYSTRING_EQUAL_NULL` mode not only affects data comparison, statistics, and other operations, but also converts existing empty strings in the data to `NULL` when displayed in queries. The original stored data is not modified (the change only occurs at query display time), as shown in the following example:
```sql
greatsql> SET sql_mode = DEFAULT;

greatsql> CREATE TABLE t1(id INT, c1 VARCHAR(10));
greatsql> INSERT INTO t1 VALUES (1,''), (2,NULL), (3,'str'), (4,'NULL');
greatsql> SELECT id, c1, HEX(c1) FROM t1;
+------+------+----------+
| id   | c1   | HEX(c1)  |
+------+------+----------+
|    1 |      |          |
|    2 | NULL | NULL     |
|    3 | str  | 737472   |
|    4 | NULL | 4E554C4C |
+------+------+----------+
4 rows in set (0.00 sec)

-- COUNT() does not count NULL values
greatsql> SELECT COUNT(*), COUNT(c1) FROM t1;
+----------+-----------+
| count(*) | count(c1) |
+----------+-----------+
|        4 |         3 |
+----------+-----------+
1 row in set (0.00 sec)

greatsql> SET sql_mode = EMPTYSTRING_EQUAL_NULL;
greatsql> SELECT id, c1, HEX(c1) FROM t1;
+------+------+----------+
| id   | c1   | HEX(c1)  |
+------+------+----------+
|    1 | NULL | NULL     |
|    2 | NULL | NULL     |
|    3 | str  | 737472   |
|    4 | NULL | 4E554C4C |
+------+------+----------+
4 rows in set (0.00 sec)

greatsql> SELECT COUNT(*), COUNT(c1) FROM t1;
+----------+-----------+
| count(*) | count(c1) |
+----------+-----------+
|        4 |         2 |
+----------+-----------+
1 row in set (0.00 sec)
```

After enabling the `EMPTYSTRING_EQUAL_NULL` mode, there are several things to note:

- 1. When updating a non-nullable field to `''`, an error should normally be reported, but in this mode only a WARN is issued and the update succeeds. This is because strict mode is not included in this mode; strict mode can be added manually to enforce the restriction.

```
-- The update succeeds in EMPTYSTRING_EQUAL_NULL mode
greatsql> SET sql_mode = EMPTYSTRING_EQUAL_NULL;
greatsql> UPDATE t1 SET c1 = '' WHERE id = 4;
Query OK, 1 row affected, 1 warning (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 1

-- The update fails after adding STRICT mode
greatsql> SET sql_mode = 'EMPTYSTRING_EQUAL_NULL,STRICT_TRANS_TABLES,STRICT_ALL_TABLES';
greatsql> UPDATE t1 SET c1 = '' WHERE id = 3;
ERROR 1048 (23000): Column 'c1' cannot be null
```

- 2. It affects performance to some extent, because the data content needs to be specifically converted to determine whether it is an empty string, which affects processing speed.

- 3. Some statements need to be manually modified based on the actual usage scenario. For example, the statement `SELECT * FROM t1 WHERE name ='';` must be changed to `SELECT * FROM t1 WHERE name IS NULL` for the two to be equivalent.

- 4. If empty string data was previously written to some non-nullable fields, the empty strings will be converted to NULL when querying or using those fields.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
