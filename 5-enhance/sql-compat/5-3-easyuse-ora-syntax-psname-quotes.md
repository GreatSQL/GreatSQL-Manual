# Oracle兼容-语法-存储过程名双引号引用
---


GreatSQL支持在ORACLE模式（`sql_mode = ORACLE`）下，存储过程名用双引号括起来使用。

如果不是在ORACLE模式下，这么用会触发报告语法错误。

## 1. 语法

```sql
SET sql_mode = ORACLE;
CALL "ps_name"(ps_parameters);
```

## 2. 示例

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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
