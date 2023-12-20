# Oracle兼容-语法-Oracle EXEC
---


## 1. 语法

在 `ORACLE` 模式下，GreatSQL客户端支持使用 `EXEC` 执行一个语句块。 

```sql
SET sql_mode = ORACLE;

EXEC statement
```

## 2. 示例

```sql
-- 新建存储过程
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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
