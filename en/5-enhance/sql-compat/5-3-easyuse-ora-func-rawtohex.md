# Oracle Compatibility - Function - RAWTOHEX()

---

## 1. Syntax

```sql
RAWTOHEX(expr)
```

## 2. Definition and Usage

The `RAWTOHEX()` function converts `expr` into a character value represented in hexadecimal.

The `RAWTOHEX()` function only accepts arguments of the following data types: `CHAR`, `VARCHAR`, `BINARY`, `VARBINARY`, `BLOB`, `TEXT`, `ENUM`, `SET`, `RAW`, `VARCHAR2`, etc.

The function returns a string consisting of the hexadecimal representation of the bytes that make up the original value, i.e., each byte is represented by two hexadecimal digits.

## 3. Oracle Compatibility Notes

In Oracle, the supported types for the `expr` argument are any scalar data types except `LONG, LONG RAW, CLOB, NCLOB, BLOB, BFILE`, while GreatSQL only supports the data types mentioned above.

| RAWTOHEX input     | ORACLE           | GreatSQL                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| RAWTOHEX(1)       | C102             | ERROR 3064 (HY000): Incorrect type for argument args 0 in function rawtohex. |
| RAWTOHEX(sysdate) | E7070B06081C2300 | ERROR 3064 (HY000): Incorrect type for argument args 0 in function rawtohex. |

This function works differently in statements that are only allowed in stored programs than in standalone SQL statements. In the former, an implicit conversion is performed before the function converts the value to hexadecimal, which may cause this function to return different values in different scenarios. For example:
```sql
DECLARE
  a varchar2(8);
BEGIN
  a := rawtohex('AB');
  SELECT a;
  SELECT RAWTOHEX('AB') INTO a FROM DUAL;
  SELECT a;
END;
```
The output is:
```sql
+------+
| a    |
+------+
| AB   |
+------+
1 row in set (0.00 sec)

+------+
| a    |
+------+
| 4142 |
+------+
1 row in set (0.00 sec)
```

The difference arises because in statements that are only allowed in stored programs, 'AB' is implicitly converted to the `RAW` type (i.e., 'AB' is treated as a single byte equal to 0xAB) before being passed to `RAWTOHEX()` for conversion, so the string 'AB' is returned. However, in standalone SQL statements, this implicit conversion is not performed; at this point 'AB' is already a 2-byte RAW value, so 4142 is returned.

## 4. Examples

```
greatsql> SELECT RAWTOHEX(NULL) FROM DUAL;
+----------------+
| RAWTOHEX(NULL) |
+----------------+
| NULL           |
+----------------+

greatsql> SELECT RAWTOHEX('A') FROM DUAL;
+---------------+
| RAWTOHEX('A') |
+---------------+
| 41            |
+---------------+

greatsql> SELECT RAWTOHEX(UNHEX('A')) FROM DUAL;
+----------------------+
| RAWTOHEX(UNHEX('A')) |
+----------------------+
| 0A                   |
+----------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
