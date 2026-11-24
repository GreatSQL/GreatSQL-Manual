# Table Management
---

## What Is a Table

In GreatSQL, a table is a basic component of a database and is used to store a collection of data with the same structure. A table consists of rows and columns, where each column represents an attribute or field and each row represents a data record.

## Creating a Table
The basic syntax for creating a table in a database is as follows:
```sql
CREATE TABLE [IF NOT EXISTS] tablename(
	COLUMN_NAME_1 COLUMN_TYPE_1 [CONSTRAINTS] [DEFAULT], 
	COLUMN_NAME_2 COLUMN_TYPE_2 [CONSTRAINTS] [DEFAULT], 
	COLUMN_NAME_3 COLUMN_TYPE_3 [CONSTRAINTS] [DEFAULT],  
	...
	COLUMN_NAME_N COLUMN_TYPE_N CONSTRAINTS
)
```

Where:
- `tablename` is the name of the table,
- `COLUMN_NAME_1` is a column name,
- `COLUMN_TYPE_1` is the data type of the column,
- `CONSTRAINTS` are the constraints,
- `DEFAULT` is the default value.

For example, create a table named `test_greatsql` that contains four fields: `id` (number), `name` (name), `gender` (gender), and `address` (address).
```sql
CREATE TABLE test_greatsql(
  id INT NOT NULL AUTO_INCREMENT,
  ename VARCHAR(10) NOT NULL,
  gender CHAR(1) NOT NULL,
  address VARCHAR(20) NOT NULL,
  PRIMARY KEY(id)
  );
```
Use `SHOW CREATE TABLE test_greatsql \G` to obtain more complete table creation information.

```sql
greatsql> SHOW CREATE TABLE test_greatsql \G
*************************** 1. row ***************************
       Table: test_greatsql
Create Table: CREATE TABLE `test_greatsql` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ename` varchar(10) NOT NULL,
  `gender` char(1) NOT NULL,
  `address` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)
```
## Dropping and Truncating a Table
Operations on a table include dropping a table and truncating a table.
### Dropping a Table
```sql
DROP TABLE [IF EXISTS] tablename;
```
For example, drop the `test_greatsql` table.
```sql
DROP TABLE test_greatsql;
```
### Truncating a Table
The table structure is not dropped; only the contents are deleted.
```sql
TRUNCATE TABLE tablename;
```
For example, truncate the `test_greatsql` table.
```sql
TRUNCATE TABLE test_greatsql;
```
## Modifying a Table
### Adding a Column
```sql
ALTER TABLE tablename ADD COLUMN_NAME COLUMN_TYPE;
```
For example, add an `age` column to the `test_greatsql` table.
```sql
ALTER TABLE test_greatsql ADD age INT;
```
### Modifying a Column
```sql
ALTER TABLE tablename MODIFY COLUMN_NAME COLUMN_TYPE;
```
For example, change the data type of the `age` column of the `test_greatsql` table to `varchar`.
```sql
ALTER TABLE test_greatsql MODIFY age VARCHAR(10);
```
### Dropping a Column
```sql
ALTER TABLE tablename DROP COLUMN_NAME;
```
For example, drop the `age` column of the `test_greatsql` table.
```sql
ALTER TABLE test_greatsql DROP age;
```
### Renaming a Table
```sql
RENAME TABLE old_tablename TO new_tablename;

-- Or
ALTER TABLE old_tablename RENAME TO new_tablename;
```
For example, rename the `test_greatsql` table to `test_greatsql1`.
```sql
RENAME TABLE test_greatsql TO test_greatsql1;
```
## Viewing Tables
### Viewing the Tables in a Database
```sql
SHOW TABLES;
```
For example, view the tables in the `test` database.
```sql
greatsql> SHOW TABLES;
+------------------+
| Tables_in_test   |
+------------------+
| test_greatsql    |
+------------------+
1 row in set (0.00 sec)
```
## Table Creation Reference

For details, see: [Schema Design Guidelines Reference](../10-optimize/2-1-schema-design-refer.md)

Here are several column naming rules from the *Java Development Manual*:

1. [Mandatory] Table names and column names must use lowercase letters or digits. They must not start with a digit, and a digit must not appear between two underscores. Renaming a database column is very expensive because there is no pre-release environment, so column names must be chosen carefully.
   Correct examples: aliyun_admin, rdc_config, level3_name
   Incorrect examples: AliyunAdmin, rdcConfig, level_3_name

2. [Mandatory] A table must have three columns: id, gmt_create, and gmt_modified.
   Description: id must be the primary key, of type BIGINT UNSIGNED, auto-incrementing for single tables with a step of 1. Both gmt_create and gmt_modified are of type DATETIME; the former uses the present tense to indicate active creation, and the latter uses the past participle to indicate passive modification.

3. [Recommended] Table names should follow the pattern "business name_purpose of the table".
   Correct examples: alipay_task, force_project, trade_config

4. [Recommended] The schema name should be consistent with the application name whenever possible.

5. [Reference] A suitable character storage length not only saves database table space and index storage, but more importantly improves retrieval speed.
   Correct example: unsigned values avoid storing negative numbers by mistake and also expand the value range.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
