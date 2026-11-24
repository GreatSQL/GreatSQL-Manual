# INSERT
---

This section describes how to insert data into the GreatSQL database with the INSERT statement.

## Inserting Data with INSERT

### Adding Rows with VALUES
#### Specifying Column Names
```sql
INSERT INTO table_name(column1 [, column2, …, columnn]) 
  VALUES (value1 [,value2, …, valuen]);
```
You can list the column names in any order in the INSERT clause, but once they are listed, the values value1,…valuen in VALUES must correspond one-to-one with the columns column1,…columnn. If the types do not match, the row cannot be inserted and GreatSQL returns an error.

Example of inserting a single row:
```sql
greatsql> INSERT INTO student(id, name) VALUES (1001,'张三');
Query OK, 1 row affected (0.05 sec)
```
Example of inserting multiple rows:
```sql
greatsql> INSERT INTO student(id, name) VALUES (1002,'李四'),(1003,'王五');
Query OK, 2 rows affected (0.05 sec)
Records: 2  Duplicates: 0  Warnings: 0
```
#### Not Specifying Column Names
```sql
INSERT INTO table_name 
  VALUES (value1 [,value2, …, valuen]);
```
If no column names are specified in the INSERT clause, all columns of the table are used by default.
Example of inserting a single row:
```sql
greatsql> INSERT INTO student VALUES (1004,'赵六');
Query OK, 1 row affected (0.05 sec)
```
Example of inserting multiple rows:
```sql
greatsql> INSERT INTO student VALUES (1005,'钱七'),(1006,'孙八');
Query OK, 2 rows affected (0.05 sec)
Records: 2  Duplicates: 0  Warnings: 0
```

## Adding Rows with INSERT ... SELECT
You can also insert the result set of a SELECT statement into a table. In this case you do not need to enter the values of each record one by one; a single statement that combines INSERT and SELECT can quickly insert multiple rows from one or more tables into a table.
```sql
INSERT INTO target_table_name
  (tar_column1 [, tar_column2, …, tar_columnn])
  SELECT
    (src_column1 [, src_column2, …, src_columnn])
  FROM source_table_name
  [WHERE condition]
```
- Add a subquery to the INSERT statement.
- You do not need to add a VALUES clause.
- The value list in the subquery should correspond to the column names in the INSERT clause.


Example: insert the rows of the student table whose id is greater than 1002 into the teacher table:
```sql
greatsql> INSERT INTO teacher(id, name) SELECT id, name FROM student WHERE id > 1002;
Query OK, 2 rows affected (0.05 sec)
Records: 2  Duplicates: 0  Warnings: 0
```

## Recommendations for Inserting Data
1. When inserting data, it is recommended to use the VALUES clause, which avoids SQL injection problems and duplicate data. You can go further and use `PREPARE` to format the data, which also avoids the risk of SQL injection. For details, see: [PREPARE Statements](./12-3-5-data-prepare.md).
2. When inserting data, it is recommended to first understand the table structure, the information of each column, and the data type of each field, so as to avoid inserting invalid data.
    The table structure and field data types can be viewed with the `DESC` command (short for `DESCRIBE`).
    ```sql
    greatsql> DESC student;
    +-------+-------------+------+-----+---------+----------------+
    | Field | Type        | Null | Key | Default | Extra          |
    +-------+-------------+------+-----+---------+----------------+
    | id    | int(11)     | NO   | PRI | NULL    | auto_increment |
    | name  | varchar(20) | YES  |     | NULL    |                |
    +-------+-------------+------+-----+---------+----------------+
    2 rows in set (0.01 sec)
    ```
3. When inserting data, it is recommended to understand the constraints defined on the columns.
    `NOT NULL`, `PRIMARY KEY`, and `UNIQUE` constraints can all be viewed with the `DESC` statement, while `FOREIGN KEY` and `CHECK` constraints can be viewed by querying the `information_schema.TABLE_CONSTRAINTS` view.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
