# Oracle兼容-语法-OFFSET ... FETCH
---


## 1. 语法

```sql
[ OFFSET offset { ROW | ROWS } ]
[ FETCH { FIRST | NEXT } [ { row_count | percent PERCENT } ]
    { ROW | ROWS } { ONLY | WITH TIES } ]
```

## 2. 定义和用法

下面是关于 `SELECT ... OFFSET ... FETCH` 用法的说明：

- `NEXT` 和 `FIRST` 是具有相同意义的关键字。

- `ROW` 和 `ROWS` 也是具有相同意义的关键字。

- 关于 `row_count | percent PERCENT`

`OFFSET` 子句用于指定在行限制开始之前要跳过行数偏移量，`OFFSET` 子句是可选的。如果跳过它，则偏移量为`0`，行限制从第一行开始计算。

偏移量必须是一个数字或一个表达式（表达式计算结果值为一个数字）。偏移量遵守以下规则：

1. 如果偏移量是负值，则将视为`0`。

2. 如果偏移量为`NULL`或大于查询返回的行数，则不返回任何行。

3. 如果 `row_count` 包含一个小数，则小数部分被截断。

4. `PERCENT` 百分值返回表数值的百分比的行数，如果 `percent` 计算后的结果包含小数，则向上补一位。例如：表数据共100条，*percent=0.1* 时计算结果为 *100*0.1/100=0.1*，含有小数则向上补一位为 *1*。 
  
- 关于 `ONLY | WITH TIES`

1. `ONLY`: 仅返回 `FETCH NEXT/FIRST` 后的行数或行数的百分比。

2. `WITH TIES`：返回与 `ORDER BY` 最后一行相同值的记录 。**注意**：如果使用 `WITH TIES`，则必须在查询中指定一个 `ORDER BY` 子句。如果不这样做，查询将不会返回额外的行。

## 3. Oracle兼容说明

1. 在Oracle中不可以和 `FOR UPDATE` 同时使用，**但在GreatSQL中，允许 `LIMIT OFFSET` 与 `FOR UPDATE` 同时使用。**

2. 如果查询列表中包含了相同的名称的字段，则需要用别名区分。

3. 在GreatSQL中，`OFFSET` 偏移量存在隐式转换可能，不同函数的隐式转换结果可能存在不一致。


## 4. 示例

```sql
greatsql> CREATE TABLE t1 (a INT);
greatsql> INSERT INTO t1 VALUES (1), (1), (2), (3), (2);

greatsql> SELECT * FROM t1
OFFSET 2 ROWS;
+------+
| a    |
+------+
|    2 |
|    3 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST ROW ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST ROWS ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT ROW ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT ROWS ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROW
FETCH FIRST ROW ONLY;
+------+
| a    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS
FETCH FIRST 1 ROW ONLY;
+------+
| a    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST ROW WITH TIES;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
FETCH FIRST ROW WITH TIES;
+------+
| a    |
+------+
|    1 |
|    1 |
+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS
FETCH FIRST ROW WITH TIES;
+------+
| a    |
+------+
|    2 |
|    2 |
+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST 3 ROW ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 1+2 ROWS ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS FETCH FIRST 3 ROW ONLY;
+------+
| a    |
+------+
|    2 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
OFFSET 2 ROWS FETCH NEXT 3 ROW ONLY;
+------+
| a    |
+------+
|    2 |
|    3 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
FETCH FIRST 3 ROWS WITH TIES;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
|    2 |
+------+
4 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS
FETCH NEXT 3 ROWS WITH TIES;
+------+
| a    |
+------+
|    2 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 49 PERCENT ROWS ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 50 PERCENT ROWS ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
OFFSET 2 ROWS
FETCH NEXT 50 PERCENT ROWS ONLY;
+------+
| a    |
+------+
|    2 |
|    3 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 50 PERCENT ROWS WITH TIES;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 1 ROWS
FETCH NEXT 49 PERCENT ROWS WITH TIES;
+------+
| a    |
+------+
|    1 |
|    2 |
|    2 |
+------+
3 rows in set (0.00 sec)
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
