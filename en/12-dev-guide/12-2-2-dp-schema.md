# Schema/Database Management
---

## What Is a Schema

In GreatSQL, a schema (database) is a logical concept that corresponds to physical data files. It can be regarded as an electronic filing cabinet that is used to store electronic files (that is, data) and allows users to perform various operations on that data, such as adding, extracting, updating, and deleting.

In GreatSQL, you can create multiple databases (schemas) and create multiple tables in each database to store different types of data. This structure makes data management and queries more efficient and flexible. At the same time, GreatSQL provides a rich set of tools and commands to manage databases and tables, such as creating, dropping, and modifying tables and querying data.

Note that although "schema" and "database" usually refer to the same concept in GreatSQL, the exact meaning of these two terms may differ in different database management systems. Therefore, in practice you need to determine their meaning according to the documentation and conventions of the database management system you are using.

## Creating a Schema
In GreatSQL, a schema is created with the `CREATE SCHEMA` statement.
```sql
CREATE SCHEMA [IF NOT EXISTS] db_name;
```
You can also specify a character set when creating a schema.
```sql
CREATE SCHEMA [IF NOT EXISTS] db_name CHARACTER SET utf8mb4;
```

## Dropping a Schema
In GreatSQL, a schema is dropped with the `DROP SCHEMA` statement.
```sql
DROP SCHEMA [IF EXISTS] db_name;
```

::: danger Warning
After a schema is dropped, all tables in that schema are dropped as well. Be sure to check carefully before dropping.
:::

## Modifying a Schema
In GreatSQL, a schema is modified with the `ALTER SCHEMA` statement.
```sql
ALTER SCHEMA [IF EXISTS] db_name;
```
## Querying Schemas

In GreatSQL, schemas are queried with the `SHOW SCHEMA` statement.

```sql
greatsql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sakila             |
| world              |
+--------------------+
7 rows in set (0.00 sec)
```
- employees, sakila, and world are the [sample databases](./12-dev-guide.md) that were installed
- information_schema, mysql, and performance_schema are the system schemas built into GreatSQL
    - information_schema: stores information about all tables in the database, such as table names, column names, and data types
    - mysql: stores information such as the built-in functions and privileges of GreatSQL
    - performance_schema: stores performance information of GreatSQL, such as query execution plans and lock waits

After viewing the available schemas, you can switch to a specified schema with the `USE db_name` statement.
```sql
greatsql> USE world;
Database changed
```
## Naming Rules to Follow When Creating Objects
Adopting uniform naming rules and standards for database objects makes application code more readable and easier for others to read, understand, and take over. For details, see: [Schema Design Guidelines Reference](../10-optimize/2-1-schema-design-refer.md)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
