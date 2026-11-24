# Oracle Compatibility - Function - INITCAP()

---

## 1. Syntax

```sql
INITCAP(string)
```

## 2. Definition and Usage

The `INITCAP()` function converts the first letter of each word in a string to uppercase and the remaining letters to lowercase. Words are separated by spaces or by characters other than letters and digits.

- In GreatSQL, when `string` contains escape characters (`\0` `\'` `\"` `''` `\\` `\b` `\B` `\n` `\N` `\r` `\R` `\t` `\T` `\z` `\Z`), they are **treated as 1 character instead of 2**. This causes differences between GreatSQL and Oracle: in ORACLE mode, escape characters are output as **2 characters** after processing by `INITCAP()` (for example, `INITCAP('\n')` returns `\N`), while in GreatSQL they are output as **1 character** (for example, `INITCAP('\n')` returns a line break).
- When the `string` argument is a numeric type, the output is not converted to scientific notation. In addition, if `string` **contains more than 81 digits**, overflow truncation occurs, and the result is **65 nines**.

## 3. Examples

```sql
greatsql> SELECT INITCAP('hello world');
+------------------------+
| INITCAP('hello world') |
+------------------------+
| Hello World            |
+------------------------+

greatsql> SELECT INITCAP('hello你好world');
+-----------------------------+
| INITCAP('hello你好world')   |
+-----------------------------+
| Hello你好World              |
+-----------------------------+

greatsql> SELECT INITCAP('hello123world');
+--------------------------+
| INITCAP('hello123world') |
+--------------------------+
| Hello123world            |
+--------------------------+

greatsql> SELECT INITCAP(NULL);
+------------------------------+
| INITCAP(NULL)                |
+------------------------------+
| NULL                         |
+------------------------------+

greatsql> SELECT INITCAP('hello\nworld');
+-------------------------+
| INITCAP('hello\nworld') |
+-------------------------+
| Hello
World             |
+-------------------------+

greatsql> SELECT INITCAP('hello\1world');
+-------------------------+
| INITCAP('hello\1world') |
+-------------------------+
| Hello1world             |
+-------------------------+

greatsql> SELECT INITCAP('àabcd abÀcd abcdÀ');
+---------------------------------+
| INITCAP('àabcd abÀcd abcdÀ')    |
+---------------------------------+
| Àabcd Abàcd Abcdà               |
+---------------------------------+

greatsql> SELECT INITCAP(111111111111111111111111111111111111111111111111111111111111111111111111111111111);
+--------------------------------------------------------------------------------------------+
| INITCAP(111111111111111111111111111111111111111111111111111111111111111111111111111111111) |
+--------------------------------------------------------------------------------------------+
| 111111111111111111111111111111111111111111111111111111111111111111111111111111111          |
+--------------------------------------------------------------------------------------------+

greatsql> SELECT INITCAP(1111111111111111111111111111111111111111111111111111111111111111111111111111111111);
+---------------------------------------------------------------------------------------------+
| INITCAP(1111111111111111111111111111111111111111111111111111111111111111111111111111111111) |
+---------------------------------------------------------------------------------------------+
| 99999999999999999999999999999999999999999999999999999999999999999                           |
+---------------------------------------------------------------------------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+------------------------------------------------------------------------------------------------------------------------+
| Level   | Code | Message                                                                                                                |
+---------+------+------------------------------------------------------------------------------------------------------------------------+
| Warning | 1292 | Truncated incorrect DECIMAL value: '111111111111111111111111111111111111111111111111111111111111111111111111111111111' |
+---------+------+------------------------------------------------------------------------------------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
