# Database Read/Write Failures

This section introduces database creation and write failures in GreatSQL.

## Database/Table Creation Failures
For example, creating the world database in the GreatSQL database reports an error:

```sql
greatsql> CREATE DATABASE world;
ERROR 1007 (HY000): Can't create database 'world'; database exists
```
Error code 1007 indicates that the database already exists and cannot be created. For details, see the error code list [Common Error Code Reference](./12-8-1-error-code-reference.md).


Or, creating the city table under the world database in the GreatSQL database reports an error:

```sql
greatsql> CREATE TABLE world.city (id INT, name VARCHAR(20));
ERROR 1050 (42S01): Table 'city' already exists
```
Error code 1050 indicates that the table already exists and cannot be created. For details, see the error code list [Common Error Code Reference](./12-8-1-error-code-reference.md).

The solution to the errors above is to add the `IF NOT EXISTS` keyword when creating databases or tables. If the database or table already exists, it is not created and no error is reported.

For example, creating the world database in the GreatSQL database reports only a warning rather than an error:

```sql
greatsql> CREATE DATABASE IF NOT EXISTS world;
Query OK, 1 row affected, 1 warning (0.04 sec)

greatsql> SHOW WARNINGS;
+-------+------+------------------------------------------------+
| Level | Code | Message                                        |
+-------+------+------------------------------------------------+
| Note  | 1007 | Can't create database 'world'; database exists |
+-------+------+------------------------------------------------+
1 row in set (0.00 sec)

```
> For creating databases and tables, see [Schema/Database Management](./12-2-2-dp-schema.md) and [Table Management](./12-2-3-dp-table.md).

## Write Failures

### Conflicts with a unique constraint
For example, writing data to the world database in the GreatSQL database reports an error.

View the structure of the city table under the world database:

```sql
greatsql> DESC world.city;
+-------------+----------+------+-----+---------+----------------+
| Field       | Type     | Null | Key | Default | Extra          |
+-------------+----------+------+-----+---------+----------------+
| ID          | int      | NO   | PRI | NULL    | auto_increment |
| Name        | char(35) | NO   |     |         |                |
| CountryCode | char(3)  | YES  | MUL | NULL    |                |
| District    | char(20) | NO   |     |         |                |
| Population  | int      | NO   |     | 0       |                |
+-------------+----------+------+-----+---------+----------------+
5 rows in set (0.01 sec)
```

Insert a row, and an error is reported:

```sql
greatsql> INSERT INTO world.city VALUES (1, 'Kabul', 'AFG', 'Nairobi', 1);
ERROR 1062 (23000): Duplicate entry '1' for key 'city.PRIMARY'
```
Error code 1062 indicates a duplicate primary key and that the row cannot be inserted. There is a unique constraint on the table, and when the same record is inserted again, the system reports an error. For details, see the error code list [Common Error Code Reference](./12-8-1-error-code-reference.md).

#### Solution

Use the `INSERT IGNORE INTO` statement to avoid constraint conflicts. The IGNORE keyword can ignore the impact of an INSERT failure caused by a constraint conflict.

For example, writing data to the world database in the GreatSQL database while ignoring constraint conflicts:

First, view the data in the table.

```sql
greatsql> SELECT * from world.city LIMIT 4075,5;
+------+----------+-------------+------------+------------+
| ID   | Name     | CountryCode | District   | Population |
+------+----------+-------------+------------+------------+
| 4076 | Hebron   | PSE         | Hebron     |     119401 |
| 4077 | Jabaliya | PSE         | North Gaza |     113901 |
| 4078 | Nablus   | PSE         | Nablus     |     100231 |
| 4079 | Rafah    | PSE         | Rafah      |      92020 |
| 4080 | greatsql | NULL        | GREATSQL   |       6666 |
+------+----------+-------------+------------+------------+
5 rows in set (0.00 sec)
```
Insert two rows: the first row's ID has a primary key conflict, and the second row has no conflict:
```sql
greatsql> INSERT IGNORE INTO world.city VALUES (4079, 'Kabul', 'AFG', 'Nairobi',1), (4081, 'greatsql', 'CHN', 'greatsql',1);
Query OK, 1 row affected, 1 warning (0.01 sec)
Records: 2  Duplicates: 1  Warnings: 1
```

View the data again.

```sql
greatsql> SELECT * from world.city LIMIT 4075,5;
+------+----------+-------------+------------+------------+
| ID   | Name     | CountryCode | District   | Population |
+------+----------+-------------+------------+------------+
| 4076 | Hebron   | PSE         | Hebron     |     119401 |
| 4077 | Jabaliya | PSE         | North Gaza |     113901 |
| 4078 | Nablus   | PSE         | Nablus     |     100231 |
| 4079 | Rafah    | PSE         | Rafah      |      92020 |
| 4080 | greatsql | NULL        | GREATSQL   |       6666 |
+------+----------+-------------+------------+------------+
5 rows in set (0.01 sec)
```
As you can see, the first row was ignored, while the second row was inserted successfully.

### Data does not conform to the field type

Inserting a row that does not conform to the field data type into the city table of the world database reports an error:

View the structure of the city table under the world database:
```sql
greatsql> DESC world.city;
+-------------+----------+------+-----+---------+----------------+
| Field       | Type     | Null | Key | Default | Extra          |
+-------------+----------+------+-----+---------+----------------+
| ID          | int      | NO   | PRI | NULL    | auto_increment |
| Name        | char(35) | NO   |     |         |                |
| CountryCode | char(3)  | YES  | MUL | NULL    |                |
| District    | char(20) | NO   |     |         |                |
| Population  | int      | NO   |     | 0       |                |
+-------------+----------+------+-----+---------+----------------+
5 rows in set (0.01 sec)
```

Inserting string data into the Population field reports an error:

```sql
greatsql> INSERT INTO world.city VALUES (4082, ' GreatSQL ', 'CHN', ' GreatSQL ',' GreatSQL ');
ERROR 1366 (HY000): Incorrect integer value: ' GreatSQL ' for column 'Population' at row 1
```
Error code 1366 indicates that the inserted data type does not match the field type. For details, see the error code list [Common Error Code Reference](./12-8-1-error-code-reference.md).

### Solution

View the table structure, confirm the column data types, and insert data that conforms to the data types.

To change data types, see the section on modifying field types in [Table Management](./12-2-3-dp-table.md).



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)