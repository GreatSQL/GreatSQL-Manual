# Index Statistics INDEX_STATISTICS

---

## Introduction to the INDEX_STATISTICS Table

This table shows statistics of index usage. GreatSQL divides the `TABLE_SCHEMA`, `TABLE_NAME`, and `INDEX_NAME` columns into three columns. Users can only view entries for tables to which they have `SELECT` access.

For example, this table can be used to find unused indexes and generate `DROP` commands to delete them:

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

At this time, it shows that the DeptLevel index was used 1003006 times and the PRIMARY key was used 1021000 times. Every time the index is used, the ROWS_READ column count increases.

| Column Name       | Description                                    |
| ------------ | --------------------------------------- |
| TABLE_SCHEMA | The schema (database) name                      |
| TABLE_NAME   | The table name                                    |
| INDEX_NAME   | The index name (visible in SHOW CREATE TABLE) |
| ROWS_READ    | The number of rows read from this index                      |

::: warning Note
The current implementation of index statistics does not support partitioned tables.
:::


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
