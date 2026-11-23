# Schema Design & Development
---

This section describes schema design and development in GreatSQL.

## Terminology Overview

To avoid confusion with the generic term database, the logical object is referred to as **Database**, while the GreatSQL database instance in use is referred to as **GreatSQL**.

### Common Terms

#### Database
A database is made up of a collection of related data, which is stored in a computer system so that it can be managed, processed, and accessed. It may contain multiple tables or collections, and each table or collection holds a group of similar data. The data may be structured (such as the rows and columns in a table) or unstructured (such as text, images, and audio).

#### Table
A table is the basic unit for storing data in a database and the basic object in a relational database. A table consists of columns and rows.

#### Column
A column is a data field in a table. The name and type of a column define the data stored in that column.

#### Row
A row is a data record in a table. Each row contains the data of all columns in the table.

#### Index
An index is a data structure used to retrieve data quickly in a database. An index usually consists of one or more columns of a table.
- **Primary Key**
A primary key is a column, or a combination of columns, of a table whose value uniquely identifies each row in the table. A primary key may consist of one or more columns, and each table can have only one primary key.
- **Foreign Key**
A foreign key is a column, or a set of columns, of a table whose value matches the primary key value of another table. Foreign keys are used to establish and enforce the relationship between two tables.
- **Unique Key**
A unique key is a column, or a set of columns, of a table whose value uniquely identifies each row in the table. A unique key may consist of one or more columns, and each table can have only one unique key.

### SQL Terms
#### SQL (Structured Query Language)
SQL is the Structured Query Language, a language for querying databases.

#### DDL (Data Definition Language)
DDL is the Data Definition Language, used to create, drop, or modify database objects. Its keywords include `CREATE`, `DROP`, `ALTER`, and so on.

#### DML (Data Manipulation Language)
DML is the Data Manipulation Language, used to insert, delete, update, and query data in a database. Its keywords include `INSERT`, `UPDATE`, `DELETE`, and so on.

#### DCL (Data Control Language)
DCL is the Data Control Language, used to grant or revoke privileges. Its keywords include `GRANT`, `REVOKE`, and so on.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
