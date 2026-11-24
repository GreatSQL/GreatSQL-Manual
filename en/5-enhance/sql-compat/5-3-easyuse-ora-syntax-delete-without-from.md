# Oracle Compatibility - Syntax - DELETE without FROM
---

GreatSQL supports the DELETE syntax without FROM in ORACLE mode.

## 1. Syntax

```sql
DELETE table_name ...

DELETE table_name WHERE ...
```

## 2. Examples

```sql
-- Test in DEFAULT mode first
greatsql> SET sql_mode = DEFAULT;
greatsql> DELETE FROM t1 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)

greatsql> DELETE t1 WHERE id = 1;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'where id=1' at line 1
   
-- Switch to ORACLE mode
greatsql> SET sql_mode = ORACLE;
greatsql> DELETE FROM t1 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)
   
greatsql> DELETE t1 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
