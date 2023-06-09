# SQL兼容性 - CAST()函数
---
[toc]

## 1. 语法

```sql
CAST(expr AS VARCHAR(N))
```

## 2. 定义和用法
在原生 `CAST()` 函数的基础上，增加对 `VARCHAR(N)` 类型的支持。


## 3. 示例
```
greatsql> SELECT CAST('greatsql' AS VARCHAR(10)), CAST('greatsql' AS VARCHAR(5));
+---------------------------------+--------------------------------+
| CAST('greatsql' AS VARCHAR(10)) | CAST('greatsql' AS VARCHAR(5)) |
+---------------------------------+--------------------------------+
| greatsql                        | great                          |
+---------------------------------+--------------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> show warnings;
+---------+------+-----------------------------------------------+
| Level   | Code | Message                                       |
+---------+------+-----------------------------------------------+
| Warning | 1292 | Truncated incorrect CHAR(5) value: 'greatsql' |
+---------+------+-----------------------------------------------+
```

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
