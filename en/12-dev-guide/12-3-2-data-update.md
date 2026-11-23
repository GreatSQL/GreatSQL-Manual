# UPDATE
---

This section describes how to update data in the GreatSQL database with the UPDATE statement.

## Using the UPDATE Statement
Use the UPDATE statement to update data. The syntax is as follows:
```sql
UPDATE table_name
  SET column1=value1, column2=value2, …, column=valuen
  [WHERE condition]
```

Example: update the age field to 10 in all rows:
```sql
UPDATE test SET age=10;
```
::: danger Warning
This SQL statement has no WHERE condition, so it updates the `age` field to 10 in all rows.

In a production environment, always use SQL statements with a WHERE condition to specify the data to be updated.
:::

### Specifying the Data to Be Updated

Use the `WHERE` clause to specify the data to be updated.

Example: update the `age` field in the row with *id=2*:

```sql
UPDATE test SET age=10 WHERE id=2;
```
This SQL statement only updates the `age` field in the row with *id=2*.

### Updating Multiple Fields
You can specify multiple fields after the `SET` keyword.

Example: for the row with *id=2*, update the `age` field to *10* and the `name` field to *GreatSQL*:
```sql
UPDATE test SET age=10, name='GreatSQL' WHERE id=2;
```
This SQL statement updates the `age` field to *10* and the `name` field to *GreatSQL* in the row with *id=2*.

## Using the ON DUPLICATE KEY UPDATE Clause

When inserting data with the INSERT statement, an error is reported if a row with the same primary key already exists in the table. You can use the `ON DUPLICATE KEY UPDATE` clause to turn the insert into an update of the related fields.
The syntax is as follows:
```sql
INSERT INTO table (column1, column2, …)
  VALUES (value1, value2, …)
  ON DUPLICATE KEY UPDATE column1=value1, column2=value2, …;
```
Example:
```sql
INSERT INTO test (id, name)
  VALUES (1, 'GreatSQL')
  ON DUPLICATE KEY UPDATE name='GreatSQL';
```
In this example, if the row with *id=1* does not exist, a new row is inserted. If the row with *id=1* exists, the `name` field is updated to *GreatSQL*.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
