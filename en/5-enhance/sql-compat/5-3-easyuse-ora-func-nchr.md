# Oracle Compatibility - Function - NCHR()

---

## 1. Syntax

```sql
NCHR(n)
```

## 2. Definition and Usage

The `NCHR()` function converts a Unicode code point to the corresponding character. Its usage is similar to the `CHR()` function, except that a Unicode code point is used instead of an ASCII code.

The requirements for parameter `n` are as follows:

1. The value of `n` must be non-negative; a negative value raises an error.
2. `n` can also be an integer or a floating-point number; floating-point numbers are automatically converted to integers (after taking the absolute value). For example, 97.3 is converted to 97, and 97.6 is also converted to 97.
3. `n` can also be a string, which must be convertible to a non-negative integer.

## 3. Examples

```sql
greatsql> SET @n=97.184; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.184
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97

greatsql> SET @n=97.684; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.684
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97

greatsql> SET @n=-97.684; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

ERROR 1210 (HY000): Incorrect arguments to function nchr.

greatsql> SET @n='97.684'; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.684
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97
1 row in set (0.00 sec)

greatsql> SET @n='97.184'; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.184
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97

greatsql> SET @n='97.184a'; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

ERROR 1292 (22007): Truncated incorrect DOUBLE value: '97.184a'
greatsql> SET @n='97.184  '; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.184
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
