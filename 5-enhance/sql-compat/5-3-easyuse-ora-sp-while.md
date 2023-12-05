# Oracle兼容-存储过程-WHILE
---


## 1. 语法

```sql
WHILE
.. 
LOOP
.. 
END LOOP
```

## 2. 定义和用法

在 `ORACLE` 模式下，GreatSQL在存储过程/存储函数，支持用 `WHILE .. LOOP .. END LOOP` 语法实现语句块循环。

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL在存储过程/存储函数，可利用 `WHILE .. LOOP .. END LOOP` 语句实现循环结构。而在GreatSQL原生语法结构中，是采用 `WHILE .. DO .. END WHILE` 这种用法。

在 `ORACLE` 模式下，将不再支持原生的 `WHILE .. DO .. END WHILE` 语法。

## 4. 示例


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

CALL while_loop_sp() //
+-----------------------------------+
| v2                                |
+-----------------------------------+
| GreatSQL SP WHILE LOOP 1,2,3,4,5, |
+-----------------------------------+
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
