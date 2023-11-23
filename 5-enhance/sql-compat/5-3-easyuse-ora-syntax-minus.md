# Oracle兼容-语法-
---
[toc]

## 1. 语法

```sql
SELECT ...
 MINUS SELECT ...
  [MINUS SELECT ...]
```

## 2. 定义和用法

`MINUS` 语法的作用是对两个结果集进行差集计算，不包括重复行。其用法类似 `UNION`、`INTERSECT` 语法。

## 3. 示例

```
greatsql> SELECT 1,2 MINUS SELECT 'a','b';
+---+---+
| 1 | 2 |
+---+---+
| 1 | 2 |
+---+---+

greatsql> SELECT 1,2 MINUS SELECT 1,2;
Empty set (0.00 sec)

greatsql> CREATE TABLE t1(c1 INT);
greatsql> INSERT INTO t1 VALUES (1),(2),(3),(3);

greatsql> CREATE TABLE t2(c1 INT);
greatsql> INSERT INTO t2 VALUES (1),(2);

greatsql> SELECT * FROM t1 MINUS SELECT * FROM t2;
+------+
| c1   |
+------+
|    3 |
+------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)