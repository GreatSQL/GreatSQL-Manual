# Oracle兼容-语法-字符串列设置CURRENT_TIMESTAMP默认值
---


GreatSQL支持对 `VARCHAR/VARCHAR2` 类型列设置默认值为 `CURRENT_TIMESTAMP`。

## 1. 语法

```sql
VARCHAR(n) DEFAULT CURRENT_TIMESTAMP[([fsp])]

VARCHAR2(n) DEFAULT CURRENT_TIMESTAMP[([fsp])]
```

参数备注：
1. 参数 `n` 值必须大于等于48。

2. 参数 `fsp` 可以指定时间精度，最大值为6。


## 2. 示例

```sql
-- n值小于48会报错
greatsql> CREATE TABLE t1 (
        id INT,
        c1 VARCHAR(47) DEFAULT CURRENT_TIMESTAMP);
ERROR 1067 (42000): Invalid default value for 'c1'

greatsql> CREATE TABLE t1 (
        id INT NOT NULL,
        c1 VARCHAR(48) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        c2 VARCHAR2(48) NOT NULL DEFAULT CURRENT_TIMESTAMP);

greatsql> SET sql_mode = ORACLE;
greatsql> INSERT INTO t1(id) VALUES(1);
greatsql> INSERT INTO t1 VALUES (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

greatsql> SET sql_mode = DEFAULT;
greatsql> INSERT INTO t1(id) VALUES(3);
greatsql> INSERT INTO t1 VALUES(4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

greatsql> SELECT * FROM t1;
+----+------------------------------------+------------------------------------+
| id | c1                                 | c2                                 |
+----+------------------------------------+------------------------------------+
|  1 | 23-11-23 03:33:05.672474 PM +08:00 | 23-11-23 03:33:05.672474 PM +08:00 |
|  2 | 23-11-23 03:33:05.673292 PM +08:00 | 23-11-23 03:33:05.673292 PM +08:00 |
|  3 | 2023-11-23 15:33:05                | 2023-11-23 15:33:05                |
|  4 | 2023-11-23 15:33:05                | 2023-11-23 15:33:05                |
+----+------------------------------------+------------------------------------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
