# Oracle Compatibility - Syntax - Subqueries Without Aliases
---

## 1. Syntax

```sql
greatsql> SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
```

That is, in a subquery SQL statement, there is no need to add an alias and no syntax error will be reported.

## 2. Examples

```sql
greatsql>  SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
+---+---+
| 1 | 2 |
+---+---+
| 1 | 2 |
+---+---+
```

If this SQL request is executed in MySQL/Percona, an error will be reported:
```
mysql> SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
ERROR 1248 (42000): Every derived table must have its own alias
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
