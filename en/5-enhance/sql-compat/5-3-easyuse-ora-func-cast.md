# Oracle Compatibility - Function - CAST()

---

## 1. Syntax

```sql
CAST(expr AS VARCHAR(N))
```

## 2. Definition and Usage

Based on the native `CAST()` function, this adds syntactic support for the VARCHAR(N) type.

## 3. Examples

```sql
greatsql> SELECT CAST('greatsql' AS VARCHAR(10)), CAST('greatsql' AS VARCHAR(5));
+---------------------------------+--------------------------------+
| CAST('greatsql' AS VARCHAR(10)) | CAST('greatsql' AS VARCHAR(5)) |
+---------------------------------+--------------------------------+
| greatsql                        | great                          |
+---------------------------------+--------------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+-----------------------------------------------+
| Level   | Code | Message                                       |
+---------+------+-----------------------------------------------+
| Warning | 1292 | Truncated incorrect CHAR(5) value: 'greatsql' |
+---------+------+-----------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
