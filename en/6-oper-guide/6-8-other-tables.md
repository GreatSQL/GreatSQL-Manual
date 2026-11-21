# Other INFORMATION_SCHEMA Tables

---
This page lists other `INFORMATION_SCHEMA` tables added by GreatSQL that do not exist elsewhere in the documentation.

## Temporary tables

### INFORMATION_SCHEMA.GLOBAL_TEMPORARY_TABLES

Only shows temporary tables explicitly created with `CREATE TEMPORARY TABLE` or `ALTER TABLE`, and does not show temporary tables created to handle complex queries.

Create a temporary table:

```sql
greatsql> CREATE TEMPORARY TABLE tmp_table (
   id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   age INT
);
```

The output of querying the table is as follows:

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.GLOBAL_TEMPORARY_TABLES\G
*************************** 1. row ***************************
    SESSION_ID: 170
  TABLE_SCHEMA: test_db
    TABLE_NAME: tmp_table
        ENGINE: InnoDB
          NAME: #sql4014d_aa_4
    TABLE_ROWS: 0
AVG_ROW_LENGTH: 0
   DATA_LENGTH: 16384
  INDEX_LENGTH: 0
   CREATE_TIME: NULL
   UPDATE_TIME: NULL
1 row in set (0.00 sec)
```

| Column Name         | Description                       |
| -------------- | -------------------------- |
| SESSION_ID     | The connection ID                    |
| TABLE_SCHEMA   | The schema (database name) where the temporary table was created   |
| TABLE_NAME     | The name of the temporary table               |
| ENGINE         | The engine of the temporary table               |
| NAME           | The internal name of the temporary table           |
| TABLE_ROWS     | The number of rows in the temporary table               |
| AVG_ROW_LENGTH | The average row length of the temporary table         |
| DATA_LENGTH    | The data size (bytes)           |
| INDEX_LENGTH   | The size of the index (bytes)         |
| CREATE_TIME    | The creation date and time of the temporary table     |
| UPDATE_TIME    | The most recent update date and time of the temporary table |

This table holds information about the temporary tables of all existing connections. The `SUPER` privilege is not required to query this table.

### INFORMATION_SCHEMA.TEMPORARY_TABLES

This table holds information about the existing temporary tables of the running connection.

Switch to another GreatSQL connection and querying this table has no content:

```sql
greatsql> SELECT connection_id();
+-----------------+
| connection_id() |
+-----------------+
|             171 |
+-----------------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM INFORMATION_SCHEMA.TEMPORARY_TABLES\G
Empty set (0.00 sec)
```

Create a temporary table with the current connection:

```sql
greatsql> CREATE TEMPORARY TABLE tmp_table2 (
   id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   age INT
);
```

Query the TEMPORARY_TABLES table again, the result is as follows:

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.TEMPORARY_TABLES\G
*************************** 1. row ***************************
    SESSION_ID: 171
  TABLE_SCHEMA: test_db
    TABLE_NAME: tmp_table2
        ENGINE: InnoDB
          NAME: #sql4014d_ab_4
    TABLE_ROWS: 0
AVG_ROW_LENGTH: 0
   DATA_LENGTH: 16384
  INDEX_LENGTH: 0
   CREATE_TIME: NULL
   UPDATE_TIME: NULL
1 row in set (0.00 sec)
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
