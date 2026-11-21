# Oracle Compatibility - Syntax - Oracle EXEC
---

## 1. Syntax

In `ORACLE` mode, the GreatSQL client supports using `EXEC` to execute a statement block.

```sql
SET sql_mode = ORACLE;

EXEC statement
```

## 2. Examples

```sql
-- Create a stored procedure
greatsql> DROP PROCEDURE IF EXISTS `p1`;

greatsql> DELIMITER //
CREATE PROCEDURE `p1`()
BEGIN
  SELECT 1;
END; //

greatsql> EXEC CALL p1; //
+---+
| 1 |
+---+
| 1 |
+---+

greatsql> EXEC CALL p1; SELECT 2; //
+---+
| 1 |
+---+
| 1 |
+---+

+---+
| 2 |
+---+
| 2 |
+---+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
