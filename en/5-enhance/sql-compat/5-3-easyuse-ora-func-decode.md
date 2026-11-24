# Oracle Compatibility - Function - DECODE()

---

## 1. Syntax

```sql
DECODE(
    expr,                   /* field or expression */
    search,                 /* possible value */
    result                  /* return value */
    [, search, result ]...  /* optional possible value/return value pairs [multiple allowed] */
    [, default ]            /* optional return value when no match */
)
```

## 2. Definition and Usage

As its name implies, the `DECODE()` function encodes/outputs the corresponding result based on expressions: it compares `expr` with `search`; if they match, it returns the corresponding `result`; if no condition matches, it returns `default`; if `default` does not exist, it returns NULL.

For the case where `expr=search=NULL`, the behavior is consistent with Oracle: it returns the `result` of the first `search` that is NULL.

Note: the possible values and return values are evaluated using `short-circuit evaluation`, meaning that as long as `expr`=`search` is matched, subsequent `search` values are not evaluated.

## 3. Examples

```sql
greatsql> SELECT DECODE(1, 1, 'one', 2, 'two', 'other');
+----------------------------------------+
| DECODE(1, 1, 'one', 2, 'two', 'other') |
+----------------------------------------+
| one                                    |
+----------------------------------------+

greatsql> SELECT DECODE(NULL, 1, 'one', NULL, 'NULL');
+--------------------------------------+
| DECODE(NULL, 1, 'one', NULL, 'NULL') |
+--------------------------------------+
| NULL                                 |
+--------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
