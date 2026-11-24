# Oracle Compatibility - Syntax - Quoting Stored Program Names with Double Quotes
---

GreatSQL supports using double quotes to enclose stored procedure names in ORACLE mode (`sql_mode = ORACLE`).

If it is not in ORACLE mode, doing so will trigger a syntax error.

## 1. Syntax

```sql
SET sql_mode = ORACLE;
CALL "ps_name"(ps_parameters);
```

## 2. Examples

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
CREATE PROCEDURE "p1"(i INT)
AS
BEGIN
  SELECT i;
END; //

greatsql> CALL "p1"(4); //
+------+
| i    |
+------+
|    4 |
+------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
