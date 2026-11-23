# Accessing the Database
---

After successfully installing GreatSQL, you can log in and connect to the GreatSQL database and execute SQL statements to operate and manage the database.

Except for some newly added [Oracle-compatible syntax](../5-enhance/5-3-easyuse.md) features, most of the syntax in GreatSQL is exactly the same as MySQL.

For MySQL-related SQL syntax, see the manual: [SQL Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html).

All operations in this document are demonstrated using the command-line Cli tool.

## Connecting and Logging into the GreatSQL Database

There are several ways to connect:

```bash
# connect directly on the local machine
$ mysql -uroot -p

# connect locally by specifying the socket file
$ mysql -S/var/lib/mysql/mysql.sock -uroot -p

# connect by specifying the host IP (assuming the local IP address is 172.17.0.3)
$ mysql -h172.17.0.3 -uroot -p
```

## Changing the root User Password

After quickly installing GreatSQL with the binary tarball or Docker method, the administrator user root in the database has an empty password by default. For security reasons, you can change the password first:

```sql
-- first view the current user
greatsql> SELECT USER();
+----------------+
| user()         |
+----------------+
| root@localhost |
+----------------+

-- change the password
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@202X';
Query OK, 0 rows affected (0.02 sec)
```
After the change, you can log in again as the root user with the new password.

## Creating a New User

In daily database operations, try to avoid using the root user with the highest privileges to prevent accidental deletion of data. It is best to create a new user and grant only partial privileges.

```sql
-- first log in as the root user
-- mysql -uroot 

-- create a new user
CREATE USER GreatSQL@'172.17.0.0/16' IDENTIFIED BY 'GreatSQL-202X';


-- create a new user database and grant the GreatSQL user read/write privileges
CREATE DATABASE GreatSQL;
GRANT ALL ON GreatSQL.* TO GreatSQL@'172.17.0.0/16';
```

## Operating GreatSQL for Reading and Writing Data

Switch to the ordinary user GreatSQL to log in, create a test table, and write data:
```sql
-- first log into GreatSQL as an ordinary user
-- mysql -h172.17.0.3 -uGreatSQL -p'GreatSQL-202X'

-- switch to the GreatSQL database
greatsql> USE GreatSQL;
Database changed

-- create a new table
greatsql> CREATE TABLE t1(id INT PRIMARY KEY);
Query OK, 0 rows affected (0.07 sec)

-- view which data tables exist
greatsql> SHOW TABLES;
+--------------------+
| Tables_in_GreatSQL |
+--------------------+
| t1                 |
+--------------------+
1 row in set (0.00 sec)

-- write test data
greatsql> INSERT INTO t1 SELECT RAND()*1024;
Query OK, 1 row affected (0.05 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- query data
greatsql> SELECT * FROM t1;
+-----+
| id  |
+-----+
| 203 |
+-----+
1 row in set (0.00 sec)
```
Success.

For more related SQL commands/syntax, see the manual: [SQL Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html).

For more application development content based on GreatSQL, refer to: [Application Development](../12-dev-guide/12-dev-guide.md).


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
