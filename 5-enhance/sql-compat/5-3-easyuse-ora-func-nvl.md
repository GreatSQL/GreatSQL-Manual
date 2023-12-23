# Oracle兼容-函数-NVL()函数
---


## 1. 语法

```sql
NVL(expr1, expr2)
```

## 2. 定义和用法
参数 `expr1`、`expr2` 均为表达式。

`NVL()` 函数作用类似 `IFNULL()`，如果 `expr1` 为 NULL，则返回 `expr2`；当 `expr1` 不为 NULL 时，则返回 `expr1`。

参数 `expr1` 和 `expr2` 可以是任意一种数据类型。

如果 `expr1` 与 `expr2` 的结果皆为 NULL，则 `NVL( )` 返回 NULL。


## 3. 示例
```
greatsql> SELECT NVL(NULL, NULL);
+-----------------+
| NVL(NULL, NULL) |
+-----------------+
|            NULL |
+-----------------+

greatsql> SET @c1 = 33.06; SET @c2 = NULL;
greatsql> SELECT @c1, @c2, NVL(@c1, 'ISNULL'), NVL(@c2, 'ISNULL') FROM DUAL;
+-------+------+--------------------+--------------------+
| @c1   | @c2  | NVL(@c1, 'ISNULL') | NVL(@c2, 'ISNULL') |
+-------+------+--------------------+--------------------+
| 33.06 | NULL | 33.06              | ISNULL             |
+-------+------+--------------------+--------------------+
```




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
