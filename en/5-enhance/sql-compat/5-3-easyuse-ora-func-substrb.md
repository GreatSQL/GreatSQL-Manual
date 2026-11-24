# Oracle Compatibility - Function - SUBSTRB()

---

## 1. Syntax

```sql
SUBSTRB(string, pos [, substring_length] )
```

## 2. Definition and Usage

The `SUBSTRB()` function returns a portion of the character argument `string`. The portion starts at the `pos`-th byte of `string` and takes `substring_length` bytes.

- If `pos` is 0, it is treated as 1, meaning the portion starts from the very first byte of `string` (the 1st byte).
- If `pos` is positive, it starts from the `pos`-th byte of `string`.
- If `pos` is negative, it starts from the `pos`-th byte counting backward from the end of `string`.
- If `substring_length` is not specified, bytes are taken up to the last byte of `string`.
- If `substring_length` is less than 1, NULL is returned.
- If the returned content contains only a part of a multi-byte character (e.g., a Chinese character), that part is replaced with spaces.

## 3. Examples

```sql
greatsql> CREATE TABLE t1 ( c1 CHAR(20) );
greatsql> INSERT INTO t1 VALUES ('GreatSQL数据库默认端口3306');

-- The hexadecimal value of a space is 20
greatsql> SELECT HEX(SUBSTRB(c1, 8, 6)), CONCAT(SUBSTRB(c1, 8, 6), '|'), c1 FROM t1;
+------------------------+--------------------------------+-----------------------------------+
| HEX(SUBSTRB(c1, 8, 6)) | CONCAT(SUBSTRB(c1, 8, 6), '|') | c1                                |
+------------------------+--------------------------------+-----------------------------------+
| 4CE695B02020           | L数  |                         | GreatSQL数据库默认端口3306        |
+------------------------+--------------------------------+-----------------------------------+

greatsql> SELECT HEX(SUBSTRB(c1, 8, 7)), CONCAT(SUBSTRB(c1, 8, 7), '|'), c1 FROM t1;
+------------------------+--------------------------------+-----------------------------------+
| HEX(SUBSTRB(c1, 8, 7)) | CONCAT(SUBSTRB(c1, 8, 7), '|') | c1                                |
+------------------------+--------------------------------+-----------------------------------+
| 4CE695B0E68DAE         | L数据|                         | GreatSQL数据库默认端口3306        |
+------------------------+--------------------------------+-----------------------------------+

greatsql> SELECT HEX(SUBSTRB(c1, 9, 9)), CONCAT(SUBSTRB(c1, 9, 9), '|'), c1 FROM t1;
+------------------------+--------------------------------+-----------------------------------+
| HEX(SUBSTRB(c1, 9, 9)) | CONCAT(SUBSTRB(c1, 9, 9), '|') | c1                                |
+------------------------+--------------------------------+-----------------------------------+
| E695B0E68DAEE5BA93     | 数据库|                        | GreatSQL数据库默认端口3306        |
+------------------------+--------------------------------+-----------------------------------+

greatsql> SELECT HEX(SUBSTRB(c1, -10, 4)), CONCAT(SUBSTRB(c1, -10, 4), '|'), c1 FROM t1;
+--------------------------+----------------------------------+-----------------------------------+
| HEX(SUBSTRB(c1, -10, 4)) | CONCAT(SUBSTRB(c1, -10, 4), '|') | c1                                |
+--------------------------+----------------------------------+-----------------------------------+
| E7ABAF20                 | 端 |                             | GreatSQL数据库默认端口3306        |
+--------------------------+----------------------------------+-----------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
