# Oracle Compatibility - Stored Procedure - Anonymous Blocks
---


## 1. Syntax

```sql
SET sql_mode = ORACLE;

1. DECLARE
 ...
BEGIN
 ...
END;

2. [DECLARE] BEGIN
 ...
END;
```

## 2. Definition and Usage

GreatSQL supports Oracle-style anonymous block usage.

## 3. Examples

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> BEGIN
  SELECT 'Hi GreatSQL';
END; //
+-------------+
| Hi GreatSQL |
+-------------+
| Hi GreatSQL |
+-------------+
1 row in set (0.00 sec)

greatsql> DECLARE 
  a INT;
  b INT;
BEGIN
  a := 3306;
  SELECT CONCAT('GreatSQL default port is:' , a);
END; //
+-----------------------------------------+
| CONCAT('GreatSQL default port is:' , a) |
+-----------------------------------------+
| GreatSQL default port is:3306           |
+-----------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
