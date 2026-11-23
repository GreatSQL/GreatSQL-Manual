# Oracle Compatibility - Function - CHR()

---

## 1. Syntax

```sql
CHR(n [ USING characterset name ])
```

## 2. Definition and Usage

Parameters:

- `n`, an integer, e.g., 97.
  - 1. The value of `n` must be non-negative; if it is negative, it is converted to 255.
  - 2. `n` can also be an integer or a floating-point number; floating-point numbers are automatically converted to (rounded) integers. For example, 97.3 is converted to 97, while 97.6 is converted to 98.
  - 3. `n` can also be a string, which must be convertible to a non-negative integer.
- `characterset`, a valid character set name, e.g., utf8mb4.

Treats **n** as an integer and returns the character corresponding to that value in the **ASCII table**.

If the `characterset` argument is a single-byte character set and `n > 256`, the binary equivalent of `n mod 256` is returned.

If the `characterset` argument is a multibyte character set, `n` must resolve to a complete code point.

If `n` is NULL, NULL is returned.

## 3. Examples

```sql
greatsql> SELECT CHR(90+256 using utf8mb4);
+-------------------------------+
| chr(90+256 using utf8mb4) |
+-------------------------------+
| Z                            |
+-------------------------------+
1 row in set (0.00 sec)

greatsql> SELECT CHR(NULL using utf8mb4);
+-------------------------+
| chr(NULL using utf8mb4) |
+-------------------------+
| NULL                    |
+-------------------------+
1 row in set (0.00 sec)

greatsql> SELECT CHR(90 using utf8mb4);
+-----------------------+
| chr(90 using utf8mb4) |
+-----------------------+
| Z                     |
+-----------------------+
1 row in set (0.01 sec)

```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
