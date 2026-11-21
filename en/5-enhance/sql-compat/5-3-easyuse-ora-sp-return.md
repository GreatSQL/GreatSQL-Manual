# Oracle Compatibility - Stored Procedure - RETURN
---


## 1. Syntax

```sql
BEGIN
 ...
 RETURN; -- Exits the stored procedure; the program is interrupted
END;
```

## 2. Definition and Usage

GreatSQL stored procedures support using `RETURN` to jump out, achieving an effect of program interruption.


## 3. Examples

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE `return_sp`(n IN INT) AS
BEGIN
  IF n > 3 THEN
    RETURN;
  ELSE
    SELECT n;
  END IF;
END; //

greatsql> CALL return_sp(1)//
+------+
| n    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL return_sp(4)//
Query OK, 0 rows affected (0.00 sec)
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
