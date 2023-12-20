# Oracle兼容-语法-DELETE不带FROM
---


GreatSQL在ORACLE模式下支持DELETE不带FROM的语法。

## 1. 语法

```sql
DELETE table_name ...

DELETE table_name WHERE ...
```

## 2. 示例

```sql
-- 先在DEFAULT模式下测试
greatsql> SET sql_mode = DEFAULT;
greatsql> DELETE FROM t1 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)

greatsql> DELETE t1 WHERE id = 1;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'where id=1' at line 1
   
-- 切换到ORACLE模式
greatsql> SET sql_mode = ORACLE;
greatsql> DELETE FROM t1 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)
   
greatsql> DELETE t1 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
