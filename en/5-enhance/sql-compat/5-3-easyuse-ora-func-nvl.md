# Oracle Compatibility - Function - NVL()

---

## 1. Syntax

```sql
NVL(expr1, expr2)
```

## 2. Definition and Usage

Both `expr1` and `expr2` are expressions.

The `NVL()` function works similarly to `IFNULL()`: if `expr1` is NULL, it returns `expr2`; when `expr1` is not NULL, it returns `expr1`.

The arguments `expr1` and `expr2` can be of any data type.

If both `expr1` and `expr2` evaluate to NULL, `NVL()` returns NULL.

## 3. Examples

```
greatsql> SELECT NVL(NULL, NULL);
+-----------------+
| NVL(NULL, NULL) |
+-----------------+
|            NULL |
+-----------------+

greatsql> SET @c1 = 33.06; SET @c2 = NULL;
greatsql> SELECT @c1, @c2, NVL(@c1, 'ISNULL'), NVL(@c2, 'ISNULL') FROM DUAL;
+-------+------+--------------------+--------------------+
| @c1   | @c2  | NVL(@c1, 'ISNULL') | NVL(@c2, 'ISNULL') |
+-------+------+--------------------+--------------------+
| 33.06 | NULL | 33.06              | ISNULL             |
+-------+------+--------------------+--------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
