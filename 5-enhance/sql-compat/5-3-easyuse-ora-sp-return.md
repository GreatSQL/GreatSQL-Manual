# Oracle兼容-存储过程-RETURN
---
[toc]

## 1. 语法

```sql
BEGIN
 ...
 RETURN; -- 跳出存储过程，程序中断
END;
```

## 2. 定义和用法

在GreatSQL存储过程中支持用 `RETURN` 跳出，实现程序中断效果。


## 3. 示例

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

greatsql> call return_sp(1)//
+------+
| n    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> call return_sp(4)//
Query OK, 0 rows affected (0.00 sec)
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
