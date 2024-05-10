# 索引统计 INDEX_STATISTICS

---

## INDEX_STATISTICS表介绍

此表显示索引使用情况的统计数据。GreatSQL将`TABLE_SCHEMA`、`TABLE_NAME` 和 `INDEX_NAME` 这些列分为三列。用户只能查看具有 `SELECT` 访问权限的表的条目。

例如，可以用此表来查找未使用的索引，并生成 DROP 命令来删除：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.INDEX_STATISTICS WHERE TABLE_NAME='sys_dept';
+--------------+------------+------------+-----------+
| TABLE_SCHEMA | TABLE_NAME | INDEX_NAME | ROWS_READ |
+--------------+------------+------------+-----------+
| test_db      | sys_dept   | DeptLevel  |   1003006 |
| test_db      | sys_dept   | PRIMARY    |   1021000 |
+--------------+------------+------------+-----------+
2 rows in set (0.00 sec)
```

此时显示DeptLevel索引使用次数是1003006次，PRIMARY主键使用次数是1021000次，当每次使用索引后，ROWS_READ列计数就会增加。

| 列名称       | 描述                                    |
| ------------ | --------------------------------------- |
| TABLE_SCHEMA | 架构（数据库）名称                      |
| TABLE_NAME   | 表名                                    |
| INDEX_NAME   | 索引名称（在 SHOW CREATE TABLE 中可见） |
| ROWS_READ    | 从此索引读取的行数                      |

> 注意：索引统计信息的当前实现不支持分区表

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
