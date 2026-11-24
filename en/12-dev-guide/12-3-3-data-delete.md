# DELETE
---

This section describes how to delete data from the GreatSQL database with the DELETE statement.

## Using the DELETE Statement

Use the DELETE statement to delete data from a table.
```sql
DELETE FROM table_name [WHERE <condition>];
```
table_name specifies the table on which the deletion is performed; `[WHERE ]` is an optional parameter that specifies the deletion condition. If there is no WHERE clause, the DELETE statement deletes all records in the table.

::: danger Warning
Be careful when deleting data and always include a WHERE clause; otherwise all data in the table will be deleted.
:::

Example: delete the row with *id=1*:
```sql
DELETE FROM student WHERE id = 1;
```
## Deleting All Data
Use the DELETE statement to delete all data in a table while keeping the table structure.
```sql
DELETE FROM table_name;
```
Example: delete all data in the student table:
```sql
DELETE FROM student;
```

`TRUNCATE TABLE` is functionally the same as a `DELETE` statement without a `WHERE` clause, but `TRUNCATE TABLE` is faster than `DELETE` and uses fewer system and transaction log resources. However, `TRUNCATE TABLE` is not transactional and does not fire a `TRIGGER`, which may cause accidents, so it is not recommended to use this statement in development code.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
