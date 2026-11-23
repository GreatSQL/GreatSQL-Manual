# Oracle Compatibility - Stored Procedure - WHILE
---


## 1. Syntax

```sql
WHILE
.. 
LOOP
.. 
END LOOP
```

## 2. Definition and Usage

In `ORACLE` mode, GreatSQL supports using the `WHILE .. LOOP .. END LOOP` syntax to implement statement block loops in stored procedures/functions.

## 3. Oracle Compatibility Notes

In `ORACLE` mode, GreatSQL can use the `WHILE .. LOOP .. END LOOP` statement in stored procedures/functions to implement loop structures. In GreatSQL's native syntax structure, the usage is `WHILE .. DO .. END WHILE`.

In `ORACLE` mode, the native `WHILE .. DO .. END WHILE` syntax is no longer supported.

## 4. Examples


```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE while_loop_sp() AS
  v1 INT;
  v2 VARCHAR(255);
BEGIN
  SET v1 = 1;
  SET v2 = 'GreatSQL SP WHILE LOOP ';

  WHILE v1 <= 5 loop
      SET v2 = CONCAT(v2, v1, ',');
      SET v1 = v1 + 1;
  END LOOP;
SELECT v2;
END; //

greatsql> CALL while_loop_sp() //
+-----------------------------------+
| v2                                |
+-----------------------------------+
| GreatSQL SP WHILE LOOP 1,2,3,4,5, |
+-----------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```





**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
