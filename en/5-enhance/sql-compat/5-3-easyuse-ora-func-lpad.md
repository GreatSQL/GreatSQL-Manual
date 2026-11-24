# Oracle Compatibility - Function - LPAD()

---

## 1. Syntax

```sql
LPAD(str,len)
LPAD(str,len,padstr)
```

## 2. Definition and Usage

Since GreatSQL natively supports the `LPAD()` function, to use the extended `LPAD()` function in GreatSQL, you need to run `SET sql_mode = ORACLE;` first to activate Oracle compatibility mode.

In GreatSQL, the native `LPAD()` function pads the string `str` on the left with the string `padstr` so that the total length is `len` characters (note: character length, not byte length). When the length of `str` already exceeds `len`, a portion is truncated. For example:

```
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT LPAD("a", 3, "b");
+-------------------+
| LPAD("a", 3, "b") |
+-------------------+
| bba               |
+-------------------+

greatsql> SELECT LPAD("aaaa", 3, "b");
+----------------------+
| LPAD("aaaa", 3, "b") |
+----------------------+
| aaa                  |
+----------------------+

greatsql> SELECT LPAD("数据库", 8, "GreatSQL");
+----------------------------------+
| LPAD("数据库", 8, "GreatSQL")    |
+----------------------------------+
| Great数据库                      |
+----------------------------------+
```

In Oracle mode, the `LPAD()` function can have as few as 2 parameters: its behavior is to pad the left side of the string `str` with spaces so that the final total length equals the length specified by `len`. With 3 parameters, the specified string `padstr` is added to the left of `str` to reach the length specified by `len`.

The `len` value refers to the display length on screen, not the total number of characters or bytes in the string. Chinese characters count as 2 character lengths, while English letters and half-width symbols count as 1 character length.

If only one character length needs to be padded and the target string to be padded is Chinese, only one space is added on the left.

If `len` is smaller than the length of `str`, characters on the right side of `str` are removed. When the remaining length of `str` is 1 character and that character is Chinese, one space is padded on the left. If `len` is 0, NULL is displayed.

## 3. Oracle Compatibility Notes

When the GreatSQL character set is utf8 (utf8mb4/utf8mb3), multibyte characters are displayed with a fixed length of 2, and single-byte characters with a fixed length of 1. Most results are the same as Oracle, except that a small number of multibyte or half-width characters behave differently from Oracle.

## 4. Examples

```
-- Test the native LPAD() function first
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT LPAD('a', 3, 'b');
+-------------------+
| LPAD("a", 3, "b") |
+-------------------+
| bba               |
+-------------------+

greatsql> SELECT LPAD('aaaa', 3, 'b');
+----------------------+
| LPAD("aaaa", 3, "b") |
+----------------------+
| aaa                  |
+----------------------+

-- In DEFAULT mode, each Chinese character counts as 1 in length
greatsql> SELECT LPAD('数据库', 8, 'GreatSQL');
+----------------------------------+
| LPAD("数据库", 8, "GreatSQL")    |
+----------------------------------+
| Great数据库                      |
+----------------------------------+

-- In DEFAULT mode, the LENGTH() function calculates each Chinese character as 3 bytes
greatsql> SELECT LPAD('据b', 6, '数a'), length(LPAD('据b', 6, '数a'));
+-------------------------+---------------------------------+
| LPAD('据b', 6, '数a')   | length(LPAD('据b', 6, '数a'))   |
+-------------------------+---------------------------------+
| 数a数a据b               |                              12 |
+-------------------------+---------------------------------+

-- At least 3 parameters are required
greatsql> SELECT LPAD("数据库", 8);
ERROR 1582 (42000): Incorrect parameter count in the call to native function 'lpad'

-- Switch to Oracle mode
greatsql> SET sql_mode = ORACLE;

-- Each Chinese character counts as 2 in length
-- In Oracle mode, the LENGTH() function calculates each Chinese character as 1 character
greatsql> SELECT LPAD('据b', 6, '数a'), length(LPAD('据b', 6, '数a'));
+-------------------------+---------------------------------+
| LPAD('据b', 6, '数a')   | length(LPAD('据b', 6, '数a'))   |
+-------------------------+---------------------------------+
| 数a据b                  |                               4 |
+-------------------------+---------------------------------+

-- The string to be padded on the left has a length of only 1 and is Chinese, so only one space is padded
greatsql> SELECT LPAD('据b', 6, '数据'), length(LPAD('据b', 6, '数据'));
+---------------------------+-----------------------------------+
| LPAD('据b', 6, '数据')    | length(LPAD('据b', 6, '数据'))    |
+---------------------------+-----------------------------------+
|  数据b                    |                                 4 |
+---------------------------+-----------------------------------+

-- The string to be padded on the left has a length of only 1 and is Chinese, so only one space is padded
greatsql> SELECT LPAD('数据库', 1), length(LPAD('数据库', 1));
+----------------------+------------------------------+
| LPAD('数据库', 1)    | length(LPAD('数据库', 1))    |
+----------------------+------------------------------+
|                      |                            1 |
+----------------------+------------------------------+

-- len = 0, returns NULL
greatsql> SELECT LPAD('数据库', 0);
+----------------------+
| LPAD('数据库', 0)    |
+----------------------+
| NULL                 |
+----------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
