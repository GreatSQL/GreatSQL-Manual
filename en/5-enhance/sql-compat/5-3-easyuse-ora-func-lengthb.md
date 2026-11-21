# Oracle Compatibility - Function - LENGTHB()

---

## 1. Syntax

```sql
LENGTHB(string)
```

## 2. Definition and Usage

The `LENGTHB()` function is equivalent to an alias of the built-in `LENGTH()` function, returning the number of bytes required to store `string`.

## 3. Examples

```sql
-- Note that here -123 and 123.5555 are treated as string types
greatsql> SELECT LENGTHB(-123), LENGTHB(123.5555);
+---------------+-------------------+
| LENGTHB(-123) | LENGTHB(123.5555) |
+---------------+-------------------+
|             4 |                 8 |
+---------------+-------------------+

greatsql> SELECT LENGTHB(DATE '2023-05-26');
+----------------------------+
| LENGTHB(DATE '2023-05-26') |
+----------------------------+
|                         10 |
+----------------------------+

greatsql> SELECT LENGTHB(1.2E+9),1.2E+9;
+-----------------+------------+
| LENGTHB(1.2E+9) | 1.2E+9     |
+-----------------+------------+
|              10 | 1200000000 |
+-----------------+------------+

greatsql> SELECT LENGTHB( _UTF8MB4 'GreatSQL数据库');
+---------------------------------------+
| LENGTHB( _UTF8MB4 'GreatSQL数据库')    |
+---------------------------------------+
|                                    17 |
+---------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
