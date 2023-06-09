# SQL兼容性 - NVL()函数
---
[toc]
## 1. 语法

```sql
NVL(expr1,expr2)
```

## 2. 定义和用法

如果 `expr1` 的计算结果为 null 值，则 `NVL( )` 返回 `expr2`。如果 `expr1` 的计算结果不是 null 值，则返回 `expr1`。

`expr1` 和 `expr2` 可以是任意一种数据类型。如果 `expr1` 与 `expr2` 的结果皆为 null 值，则 `NVL( )` 返回 NULL。

## 3. 示例

```
greatsql> select nvl(null,null);
+----------------+
| nvl(null,null) |
+----------------+
|           NULL |
+----------------+

-- 读取t1表数据，并加上NVL()函数
greatsql> select *, nvl(c1,'isnull'), nvl(c2,'isnull') from t1;
+----+------+------+------------------+------------------+
| id | c1   | c2   | nvl(c1,'isnull') | nvl(c2,'isnull') |
+----+------+------+------------------+------------------+
|  1 |  211 |  530 | 211              | 530              |
|  2 | NULL |  991 | isnull           | 991              |
|  3 |  294 | NULL | 294              | isnull           |
+----+------+------+------------------+------------------+
```

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
