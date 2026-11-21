# Oracle Compatibility - Function - TRIM()/LTRIM()/RTRIM()

---

## 1. Syntax

```sql
TRIM(str)
TRIM(LEADING [remchr] FROM str)
TRIM(TRAILING [remchr] FROM str)
TRIM(BOTH [remchr] FROM str)
TRIM(remchr FROM str)

LTRIM(str[, remstr])
RTRIM(str[, remstr])
```

## 2. Definition and Usage

Since GreatSQL natively supports the `TRIM()/LTRIM()/RTRIM()` functions, to use the extended functions in GreatSQL, you need to run `SET sql_mode = ORACLE;` first to activate Oracle compatibility mode.

In Oracle compatibility mode, the functions work as follows:
- The `TRIM()` function removes the specified character `remchr` from the string `str`; when `remchr` is not specified, spaces are removed by default.
- The `LTRIM()` function removes the specified string `remstr` starting from the leftmost side of the string `str`; when `remstr` is not specified, spaces are removed by default.
- The `RTRIM()` function removes the specified string `remstr` starting from the rightmost side of the string `str`; when `remstr` is not specified, spaces are removed by default.

Descriptions of the parameters:
- `remchr`: the character to be removed. In Oracle compatibility mode, the `TRIM()` function can only specify one character to remove (not a string of characters), with a default of space (note: a space is not a NULL value). When the parameter `remchr` is an empty value (''), the result is always NULL. Note in particular: although Chinese characters, emoji, etc. are multibyte characters, they are still treated as one character in the `TRIM()` function.
- `remstr`: the string to be removed, used by the `LTRIM()/RTRIM()` functions.
- `LEADING`: removes from the head until the first position that is not `remchr`.
- `TRAILING`: removes from the tail until the first position that is not `remchr`.
- `BOTH`: applies to both the head and the tail; enabled by default when neither is specified.

## 3. Examples

```sql
greatsql> SET sql_mode = ORACLE;
-- The string "  GreatSQL  " has two spaces at the head and tail
greatsql> SELECT TRIM(LEADING '' FROM '  GreatSQL  ');
+--------------------------------------+
| TRIM(LEADING '' FROM '  GreatSQL  ') |
+--------------------------------------+
| NULL                                 |
+--------------------------------------+

greatsql> SELECT TRIM(LEADING ' ' FROM '  GreatSQL  '), LENGTH(TRIM(LEADING ' ' FROM '  GreatSQL  ')) AS LEN;
+---------------------------------------+------+
| TRIM(LEADING ' ' FROM '  GreatSQL  ') | LEN  |
+---------------------------------------+------+
| GreatSQL                              |   10 |
+---------------------------------------+------+

-- If not specified, BOTH is the default
greatsql> SELECT TRIM(' ' FROM '  GreatSQL  '), LENGTH(TRIM(' ' FROM '  GreatSQL  ')) AS LEN;
+-------------------------------+------+
| TRIM(' ' FROM '  GreatSQL  ') | LEN  |
+-------------------------------+------+
| GreatSQL                      |    8 |
+-------------------------------+------+

-- An error is reported if more than one character is specified
greatsql> SELECT TRIM('ea' FROM '  GreatSQL  ');
ERROR 7564 (HY000): trim set should have only one character

-- One Chinese character is treated as one character
greatsql> SELECT TRIM('库' FROM 'GreatSQL数据库');
+-------------------------------------+
| TRIM('库' FROM 'GreatSQL数据库')     |
+-------------------------------------+
| GreatSQL数据                        |
+-------------------------------------+

-- One emoji character is treated as one character
greatsql> SELECT TRIM('😀' FROM 'GreatSQL数据库😀');
+-------------------------------------+
| TRIM('?' FROM 'GreatSQL数据库?')    |
+-------------------------------------+
| GreatSQL数据库                      |
+-------------------------------------+

-- LTRIM()/RTRIM() support multiple characters
greatsql> SELECT LTRIM('GreatSQL', 'Great');
+----------------------------+
| LTRIM('GreatSQL', 'Great') |
+----------------------------+
| SQL                        |
+----------------------------+

greatsql> SELECT RTRIM('GreatSQL', 'SQL');
+--------------------------+
| RTRIM('GreatSQL', 'SQL') |
+--------------------------+
| Great                    |
+--------------------------+

greatsql> SELECT RTRIM('  GreatSQL  '), LENGTH(RTRIM('  GreatSQL  '));
+-----------------------+-------------------------------+
| RTRIM('  GreatSQL  ') | LENGTH(RTRIM('  GreatSQL  ')) |
+-----------------------+-------------------------------+
|   GreatSQL            |                            10 |
+-----------------------+-------------------------------+

greatsql> SELECT LTRIM('  GreatSQL  '), LENGTH(LTRIM('  GreatSQL  '));
+-----------------------+-------------------------------+
| LTRIM('  GreatSQL  ') | LENGTH(LTRIM('  GreatSQL  ')) |
+-----------------------+-------------------------------+
| GreatSQL              |                            10 |
+-----------------------+-------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
