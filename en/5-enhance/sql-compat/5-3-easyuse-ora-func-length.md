# Oracle Compatibility - Function - LENGTH()

---

## 1. Syntax

```
LENGTH(data)
```

## 2. Definition and Usage

In Oracle, the `LENGTH()` function returns the length of a string, while in GreatSQL the `LENGTH()` function returns the number of bytes in a string. When the length of the string in the `data` argument is 0, GreatSQL returns 0, while Oracle returns NULL.

To address the differences above, GreatSQL has extended the `LENGTH()` function to support behavior similar to Oracle.

## 3. Oracle Compatibility Notes

Since GreatSQL natively supports the `LENGTH()` function, to use the extended `LENGTH()` function in GreatSQL, you need to run `SET sql_mode = ORACLE;` first to activate Oracle compatibility mode.

For certain escape characters such as '\n', GreatSQL automatically converts them to special characters, so the final result counts them as 1 character instead of 2.

For expressions such as `LENGTH(''+1)`, ORACLE mode currently supports converting numbers to strings, so the final result becomes the length of the numeric string; this behavior is inconsistent with Oracle.

## 4. Examples

```
-- In DEFAULT mode, with the utf8mb4 character set, the result returns 17
-- In the examples, each Chinese character occupies 3 bytes, and each ASCII character occupies 1 byte
greatsql> SELECT LENGTH( _UTF8MB4 'GreatSQL数据库');
+--------------------------------------+
| LENGTH( _UTF8MB4 'GreatSQL数据库')    |
+--------------------------------------+
|                                   17 |
+--------------------------------------+

-- Switch to ORACLE mode first
greatsql> SET sql_mode = ORACLE;

-- In the examples, each Chinese character and ASCII character count as one character
greatsql> SELECT LENGTH( _UTF8MB4 'GreatSQL数据库');
+--------------------------------------+
| LENGTH( _UTF8MB4 'GreatSQL数据库')    |
+--------------------------------------+
|                                   11 |
+--------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
