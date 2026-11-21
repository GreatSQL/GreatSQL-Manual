# Table Statistics TABLE_STATISTICS

---

## Introduction to the TABLE_STATISTICS Table

This table is functionally similar to the `INDEX_STATISTICS` table

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.TABLE_STATISTICS WHERE TABLE_NAME='sys_dept';
+--------------+------------+-----------+--------------+------------------------+
| TABLE_SCHEMA | TABLE_NAME | ROWS_READ | ROWS_CHANGED | ROWS_CHANGED_X_INDEXES |
+--------------+------------+-----------+--------------+------------------------+
| test_db      | sys_dept   |   2030011 |            0 |                      0 |
+--------------+------------+-----------+--------------+------------------------+
1 row in set (0.00 sec)
```

| Column Name             | Description                               |
| ---------------------- | ---------------------------------- |
| TABLE_SCHEMA           | The schema (database) name                 |
| TABLE_NAME             | The table name                               |
| ROWS_READ              | The number of rows read from the table                   |
| ROWS_CHANGED           | The number of rows in the table that have been changed                   |
| ROWS_CHANGED_X_INDEXES | The number of changed rows in the table multiplied by the number of changed indexes |

::: warning Note
The current implementation of table statistics does not support partitioned tables.
:::


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
