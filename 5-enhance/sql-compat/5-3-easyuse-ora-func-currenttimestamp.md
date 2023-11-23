# Oracle兼容-函数-CURRENT_TIMESTAMP()函数
---
[toc]

## 1. 语法

```sql
CURRENT_TIMESTAMP[([n])]
```

## 2. 定义和用法

返回当前时间戳。

参数 `n` 说明：
1. n的值要小于等于6。
2. 在ORACLE mode中，`CURRENT_TIMESTAMP` 等价于 `CURRENT_TIMESTAMP(6)`，小数位是6（n=6），而 `CURRENT_TIMESTAMP()` 小数位是0（n=0）。而在DEFAULT mode中，`CURRENT_TIMESTAMP` 和 `CURRENT_TIMESTAMP()` 等价，小数位都是0（n=0）。
3. 在ORACLE mode中，输出值格式为`dd-mm-yy hh:mm:ss[.dec] am|pm timezone`，而在DEFAULT mode中，输出值格式为`yyyy-mm-dd hh24:mm:ss[.dec]`。
4. 在ORACLE mode中，时间格式与原有的不一样，这会导致部分函数（如`UNIX_TIMESTAMP()`）当其参数值为`CURRENT_TIMESTAMP`时会显示异常。


## 3. 示例
```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SELECT CURRENT_TIMESTAMP;
+------------------------------------+
| CURRENT_TIMESTAMP                  |
+------------------------------------+
| 30-10-23 03:53:18.127314 PM +08:00 |
+------------------------------------+

greatsql> SELECT CURRENT_TIMESTAMP();
+-----------------------------+
| CURRENT_TIMESTAMP()         |
+-----------------------------+
| 30-10-23 03:53:30 PM +08:00 |
+-----------------------------+ 

greatsql> SELECT CURRENT_TIMESTAMP(6);
+------------------------------------+
| CURRENT_TIMESTAMP(6)               |
+------------------------------------+
| 30-10-23 03:53:41.122988 PM +08:00 |
+------------------------------------+

-- 小数位>6时会报错
greatsql> SELECT CURRENT_TIMESTAMP(7);
ERROR 1426 (42000): Too-big precision 7 specified for 'now'. Maximum is 6.

greatsql> CREATE TABLE t1(
    id INT,
    c VARCHAR2(64)
);

greatsql> INSERT INTO t1 VALUES(1, CURRENT_TIMESTAMP),
(2, CURRENT_TIMESTAMP()),
(3, CURRENT_TIMESTAMP(3)),
(4, CURRENT_TIMESTAMP(6));

greatsql> SELECT * FROM t1;
+------+------------------------------------+
| id   | c                                  |
+------+------------------------------------+
|    1 | 30-10-23 03:55:12.024380 PM +08:00 |
|    2 | 30-10-23 03:55:17 PM +08:00        |
|    3 | 30-10-23 03:55:26.559 PM +08:00    |
|    4 | 30-10-23 03:55:29.372250 PM +08:00 |
+------+------------------------------------+

greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT CURRENT_TIMESTAMP;
+---------------------+
| CURRENT_TIMESTAMP   |
+---------------------+
| 2023-10-30 15:55:59 |
+---------------------+

greatsql> SELECT CURRENT_TIMESTAMP();
+---------------------+
| CURRENT_TIMESTAMP() |
+---------------------+
| 2023-10-30 15:56:08 |
+---------------------+

greatsql> SELECT CURRENT_TIMESTAMP(6);
+----------------------------+
| CURRENT_TIMESTAMP(6)       |
+----------------------------+
| 2023-10-30 15:56:17.512329 |
+----------------------------+

greatsql> INSERT INTO t1 VALUES(5, CURRENT_TIMESTAMP),
(6, CURRENT_TIMESTAMP()),
(7, CURRENT_TIMESTAMP(3)),
(8, CURRENT_TIMESTAMP(6));

greatsql> SELECT * FROM t1;
+------+------------------------------------+
| id   | c                                  |
+------+------------------------------------+
|    1 | 30-10-23 03:55:12.024380 PM +08:00 |
|    2 | 30-10-23 03:55:17 PM +08:00        |
|    3 | 30-10-23 03:55:26.559 PM +08:00    |
|    4 | 30-10-23 03:55:29.372250 PM +08:00 |
|    5 | 2023-10-30 15:56:31                |
|    6 | 2023-10-30 15:56:34                |
|    7 | 2023-10-30 15:56:37.998            |
|    7 | 2023-10-30 15:56:39.494867         |
+------+------------------------------------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
