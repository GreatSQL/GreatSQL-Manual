# Oracle 兼容 - 语法 - 子查询无别名
---

## 1. 语法

```sql
greatsql> SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
```

即在子查询 SQL 语句中，无需加上别名而不会报语法错误。

## 2. 示例

```sql
greatsql>  SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
+---+---+
| 1 | 2 |
+---+---+
| 1 | 2 |
+---+---+
```

这个 SQL 请求如果是放在 MySQL/Percona 中执行，则会报告错误：
```
mysql> SELECT * FROM (SELECT 1 FROM DUAL), (SELECT 2 FROM DUAL);
ERROR 1248 (42000): Every derived table must have its own alias
```


**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
