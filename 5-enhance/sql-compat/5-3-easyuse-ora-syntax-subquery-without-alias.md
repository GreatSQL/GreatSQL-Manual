# Oracle兼容-语法-子查询无别名
---

## 1. 语法

```sql
greatsql> SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
```

即在子查询SQL语句中，无需加上别名而不会报语法错误。

## 2. 示例

```sql
greatsql>  SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
+---+---+
| 1 | 2 |
+---+---+
| 1 | 2 |
+---+---+
```

这个SQL请求如果是放在MySQL/Percona中执行，则会报告错误：
```
mysql> SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
ERROR 1248 (42000): Every derived table must have its own alias
```

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
