# PREPARE Statements
---

This section describes how to create, use, and drop PREPARE prepared statements in the GreatSQL database.

In GreatSQL, prepared statements (also called parameterized queries or precompiled statements) are used to execute the same or similar SQL statements multiple times with different parameters. Prepared statements can improve performance because the database can optimize and reuse the query plan, and they also help prevent SQL injection attacks.

## Creating a Prepared Statement
```sql
PREPARE stmt_name FROM preparable_stmt;
```
- stmt_name: the name of the prepared statement.
- preparable_stmt: the SQL statement to be prepared.

## Executing a Prepared Statement
Before executing a prepared statement, you need to set the variables with the `SET` statement.
```sql
SET @{parameter_name} = {parameter_value};
```
- parameter_name: the variable name.
- parameter_value: the variable value.

After the variables are set, execute the statement with the `EXECUTE` statement.
```sql
EXECUTE stmt_name [USING @var_name [, @var_name] ...];	
```
- stmt_name: the name of the prepared statement.
- @var_name: the variable name.

## Dropping a Prepared Statement
```sql
DEALLOCATE PREPARE stmt_name;
```
- stmt_name: the name of the prepared statement.

## Examples

### Query Example
Create a user table and insert three rows.
```sql
CREATE TABLE user (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(20) DEFAULT NULL, PRIMARY KEY (id));
INSERT INTO user VALUES (1, '刘一');
INSERT INTO user VALUES (2, '陈二');
INSERT INTO user VALUES (3, '张三');
```
Create a prepared statement named `stmt1`, using a question mark (?) as the parameter placeholder in the SQL statement.
```sql
greatsql> PREPARE stmt1 FROM 'SELECT id, name FROM user WHERE id = ?';
Query OK, 0 rows affected (0.01 sec)
Statement prepared
```
Set the variable with `SET`:
```sql
greatsql> SET @id = 1;
Query OK, 0 rows affected (0.01 sec)
```
Execute the prepared statement:
```sql
greatsql> EXECUTE stmt1 USING @id;
+----+--------+
| id | name   |
+----+--------+
|  1 | 刘一   |
+----+--------+
1 row in set (0.00 sec)
```
### Insert Example
Using the user table as an example, insert a row with id 4 and name `李四`. Because the id primary key field of the user table has the AUTO_RANDOM attribute, the id value does not need to be specified when inserting.
```sql
greatsql> PREPARE `user_insert` FROM 'INSERT INTO `user` (name) VALUES (?);';
Query OK, 0 rows affected (0.02 sec)
Statement prepared
```
Set the variable:
```sql
greatsql> SET @name = '李四';
Query OK, 0 rows affected (0.00 sec)
```
Execute the prepared statement:
```sql
greatsql> EXECUTE `user_insert` USING @name;
Query OK, 1 row affected (0.01 sec)
```
View the data in the table:
```sql
greatsql> SELECT * FROM user;
+----+--------+
| id | name   |
+----+--------+
|  1 | 刘一   |
|  2 | 陈二   |
|  3 | 张三   |
|  4 | 李四   |
+----+--------+
4 rows in set (0.01 sec)
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
