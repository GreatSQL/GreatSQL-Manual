# Oracle兼容-存储过程-匿名块
---


## 1. 语法

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

## 2. 定义和用法

在GreatSQL中支持类似Oracle风格的匿名块用法。

## 3. 示例

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



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
