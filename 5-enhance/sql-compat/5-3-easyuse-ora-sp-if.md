# Oracle兼容-存储过程-IF
---


## 1. 语法

```sql
IF search_condition THEN statement_list
    [ELSIF search_condition THEN statement_list]
    [ELSE statement_list]
END IF
```

## 2. 定义和用法

在 `ORACLE` 模式下，GreatSQL在存储过程/存储函数，可利用 `IF .. ELSIF .. ELSE .. END IF` 语句实现了一个基本的条件结构。

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL在存储过程/存储函数，可利用 `IF .. ELSIF .. ELSE .. END IF` 语句实现了一个基本的条件结构。而在GreatSQL原生语法结构中，是采用 `IF .. ELSEIF .. ELSE .. END IF` 这种用法。

在 `ORACLE` 模式下，将不再支持原生的 `IF .. ELSEIF` 语法。

## 4. 示例


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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
