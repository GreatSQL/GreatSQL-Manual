# 表统计 TABLE_STATISTICS

---

## TABLE_STATISTICS表介绍

此表在功能上与 `INDEX_STATISTICS` 表类似

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.TABLE_STATISTICS WHERE TABLE_NAME='sys_dept';
+--------------+------------+-----------+--------------+------------------------+
| TABLE_SCHEMA | TABLE_NAME | ROWS_READ | ROWS_CHANGED | ROWS_CHANGED_X_INDEXES |
+--------------+------------+-----------+--------------+------------------------+
| test_db      | sys_dept   |   2030011 |            0 |                      0 |
+--------------+------------+-----------+--------------+------------------------+
1 row in set (0.00 sec)
```

| 列名称                 | 描述                               |
| ---------------------- | ---------------------------------- |
| TABLE_SCHEMA           | 架构（数据库）名称                 |
| TABLE_NAME             | 表名                               |
| ROWS_READ              | 从表中读取的行数                   |
| ROWS_CHANGED           | 表中的行数已更改                   |
| ROWS_CHANGED_X_INDEXES | 表中已更改的行数乘以已更改的索引数 |

> 注意：表统计信息的当前实现不支持分区表。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
