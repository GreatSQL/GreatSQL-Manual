# Query Failures

This section introduces common causes of query failures in GreatSQL.

## Table or Column Does Not Exist

A query on a table or column that does not exist usually fails because the table name is misspelled.

For example, when querying the `world.city` table, if you run `SELECT * FROM world.city`, an error is reported:

```sql
greatsql> SELECT * FROM world.city;
ERROR 1146 (42S02): Table 'world.city' doesn't exist
```
Error code `1146` indicates that the table does not exist. For details, see [Common Error Code Reference](./12-8-1-error-code-reference.md).

When querying the Name column of the `world.city` table, if you run `SELECT names FROM world.city`, an error is reported:

```sql
greatsql> SELECT names FROM world.city;
ERROR 1054 (42S22): Unknown column 'names' in 'field list'
```
Error code `1054` indicates that the column does not exist. For details, see [Common Error Code Reference](./12-8-1-error-code-reference.md).

### Solutions
Use the correct table name or column name.

You can use the `SHOW DATABASES;` command to view all databases in the current instance.

You can use the `SHOW TABLES;` command to view all tables in the current database.

You can use the `SHOW COLUMNS FROM world.city;` command to view the columns of the `world.city` table.

## Permission Issues

The user does not have sufficient privileges to execute the query operation.

Create a GreatSQL user named user1 and restrict the user to querying only the city table in the world database:

```sql
 greatsql> CREATE USER 'user1'@'%' IDENTIFIED BY 'password123';
```
Then log in to the GreatSQL database with this account:

```sql
$ mysql -uuser1 -ppassword123    
```
After logging in, use the `SHOW DATABASES;` command to view all databases in the current instance. You can see that only the world database is available.

```sql
greatsql> SHOW DATABASES;
+--------------------+
| DATABASES          |
+--------------------+
| information_schema |
| performance_schema |
| world              |
+--------------------+
3 rows in set (0.00 sec)
```
If you try to query the employees table in the employees database, an error is reported:

```sql
greatsql> SELECT * FROM employees.titles LIMIT 5;
ERROR 1142 (42000): SELECT command denied to user 'user1'@'localhost' for table 'titles'
```
Error code `1142` indicates that the user does not have sufficient privileges. For details, see [Common Error Code Reference](./12-8-1-error-code-reference.md).

### Solutions
Log in as the root user and grant privileges to user1 so that it can query all tables in the employees database.

```bash
$ mysql -uroot -p
```
Grant privileges to user1:

```sql
greatsql> GRANT ALL ON employees.* TO 'user1'@'%';
```



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
