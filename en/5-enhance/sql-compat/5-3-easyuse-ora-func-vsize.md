# Oracle Compatibility - Function - VSIZE()

---

## 1. Syntax

```sql
VSIZE( expr )
```

## 2. Definition and Usage

The `VSIZE()` function returns the internal storage size of `expr`.

The parameter `expr` is the expression to be analyzed. It can be a number or a string, etc., and can also be values of various types, but it cannot be of the `BLOB` type or its derived types.

## 3. Oracle Compatibility Notes

- Since the internal storage mechanisms of Oracle and GreatSQL differ, the `VSIZE()` function is used to evaluate the actual storage space consumed, so the return value may be inconsistent with Oracle.
- Temporary variables `@var` use other intermediate representations and are not converted until they are called; such variables are currently not supported.

## 4. Examples

```
-- 1. The parameter expr is NULL
greatsql> SELECT VSIZE(NULL);
+-------------+
| VSIZE(NULL) |
+-------------+
|        NULL |
+-------------+

-- 2. When the parameter expr is an empty string, it is treated as NULL
greatsql> SELECT VSIZE('');
+-----------+
| VSIZE('') |
+-----------+
|      NULL |
+-----------+

-- 3. expr can be a constant
greatsql> SELECT VSIZE(true), VSIZE(false);
+-------------+--------------+
| VSIZE(true) | VSIZE(false) |
+-------------+--------------+
|           1 |            1 |
+-------------+--------------+

greatsql> SELECT VSIZE('3306'), VSIZE(3306);
+---------------+-------------+
| VSIZE('3306') | VSIZE(3306) |
+---------------+-------------+
|             6 |           8 |
+---------------+-------------+

greatsql> SELECT VSIZE(date(NOW())), DATE(NOW());
+--------------------+-------------+
| VSIZE(date(NOW())) | DATE(NOW()) |
+--------------------+-------------+
|                  3 | 2023-11-07  |
+--------------------+-------------+

greatsql> SELECT VSIZE(STR_TO_DATE(SYSDATE(), '%Y-%m-%d %H:%i:%s')), STR_TO_DATE(SYSDATE(), '%Y-%m-%d %H:%i:%s');
+----------------------------------------------------+---------------------------------------------+
| VSIZE(STR_TO_DATE(SYSDATE(), '%Y-%m-%d %H:%i:%s')) | STR_TO_DATE(SYSDATE(), '%Y-%m-%d %H:%i:%s') |
+----------------------------------------------------+---------------------------------------------+
|                                                  8 | 2023-11-07 11:18:56                         |
+----------------------------------------------------+---------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
