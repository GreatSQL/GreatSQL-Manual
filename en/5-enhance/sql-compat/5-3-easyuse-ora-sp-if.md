# Oracle Compatibility - Stored Procedure - IF
---


## 1. Syntax

```sql
IF search_condition THEN statement_list
    [ELSIF search_condition THEN statement_list]
    [ELSE statement_list]
END IF
```

## 2. Definition and Usage

In `ORACLE` mode, GreatSQL can use the `IF .. ELSIF .. ELSE .. END IF` statement in stored procedures/functions to implement a basic conditional structure.

## 3. Oracle Compatibility Notes

In `ORACLE` mode, GreatSQL can use the `IF .. ELSIF .. ELSE .. END IF` statement in stored procedures/functions to implement a basic conditional structure. In GreatSQL's native syntax structure, the usage is `IF .. ELSEIF .. ELSE .. END IF`.

In `ORACLE` mode, the native `IF .. ELSEIF` syntax is no longer supported.

## 4. Examples


```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE `elsif_sp`(n IN INT) AS
BEGIN
IF n >= 3 THEN
  SELECT 3 AS a, n;
ELSIF n = 2 THEN
  SELECT 2 AS b, n;
ELSE 
  SELECT 1 AS c, n;
END IF;

RETURN;

SELECT 0 AS d, n;

END; //

greatsql> CALL elsif_sp(0) //
+---+------+
| c | n    |
+---+------+
| 1 |    0 |
+---+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL elsif_sp(1) //
+---+------+
| c | n    |
+---+------+
| 1 |    1 |
+---+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL elsif_sp(2) //
+---+------+
| b | n    |
+---+------+
| 2 |    2 |
+---+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> CALL elsif_sp(3) //
+---+------+
| a | n    |
+---+------+
| 3 |    3 |
+---+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
