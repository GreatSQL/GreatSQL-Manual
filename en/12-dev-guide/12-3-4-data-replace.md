# REPLACE
---

This section describes how to replace data in GreatSQL with the REPLACE statement.

## REPLACE INTO Statement
It can be regarded as an enhanced version of `INSERT`: it updates the row if it exists and inserts it if it does not.
The syntax of the `REPLACE INTO` statement is as follows:

```sql
REPLACE INTO table_name VALUES(value_list);
```
Example:

Create a table named `t1`:
```sql
CREATE TABLE t1 (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  data VARCHAR(64) DEFAULT NULL,
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
Query OK, 0 rows affected (0.03 sec)
```
Insert a row:
```sql
greatsql> INSERT INTO t1 VALUES (1, 'Old', '2024-05-8 13:58:00');
Query OK, 1 row affected (0.05 sec)
```
If the following row is inserted now, the row with id 1 is updated:
```sql
greatsql> REPLACE INTO t1 VALUES (1, 'New', '2024-05-8 14:00:00');
Query OK, 2 rows affected (0.05 sec)

greatsql> SELECT * FROM t1;
+----+------+---------------------+
| id | data | ts                  |
+----+------+---------------------+
|  1 | New  | 2024-05-08 14:00:00 |
+----+------+---------------------+
1 row in set (0.00 sec)
```
`REPLACE INTO` first tries to insert the data into the table:
1. If the row already exists in the table (determined by the primary key or a unique index), the row is deleted first and then the new data is inserted.
2. If the row does not exist in the table, the new data is inserted directly.

If the inserted data does not contain the primary key or a unique index, the new data is inserted directly.
```sql
greatsql> REPLACE INTO t1(data,ts) VALUES ('New', '2024-05-8 14:00:00');
greatsql> SELECT * FROM t1;
+----+------+---------------------+
| id | data | ts                  |
+----+------+---------------------+
|  1 | New  | 2024-05-08 14:00:00 |
|  2 | New  | 2024-05-08 14:00:00 |
+----+------+---------------------+
2 rows in set (0.00 sec)
```
## RENAME TABLE and Foreign Keys

When using the `REPLACE INTO` statement to insert or replace records in GreatSQL, if foreign key constraints are involved and the record being replaced is referenced by a foreign key of another table, the referenced data will be deleted.

Assume there are two tables: `main_table` (the parent table) and `sub_table` (the child table), and `sub_table` has a foreign key field that references the primary key of `main_table`.
```sql
CREATE TABLE main_table (  
    id INT AUTO_INCREMENT PRIMARY KEY,  
    name VARCHAR(50) NOT NULL  
);  
  
CREATE TABLE sub_table (  
    id INT AUTO_INCREMENT PRIMARY KEY,  
    main_id INT,  
    data VARCHAR(50),  
    FOREIGN KEY (main_id) REFERENCES main_table(id) ON DELETE CASCADE  
);
```
In this example, the `main_id` field of `sub_table` is a foreign key that references the id field of `main_table`. If a record in `main_table` is referenced by one or more records in `sub_table`, and we try to replace that record in `main_table` with `REPLACE INTO`, the data in `sub_table` that previously referenced the id field of `main_table` will be lost.

```sql
-- Insert a record into main_table  
greatsql> INSERT INTO main_table (name) VALUES ('Record 1');
Query OK, 1 row affected (0.01 sec)

-- View the records in main_table  
greatsql> SELECT * FROM main_table;
+----+----------+
| id | name     |
+----+----------+
|  1 | Record 1 |
+----+----------+
1 row in set (0.00 sec)

-- Insert two records into sub_table, which reference the id field in main_table  
greatsql> INSERT INTO sub_table (main_id, data) VALUES (1, 'SubData 1');  
greatsql> INSERT INTO sub_table (main_id, data) VALUES (1, 'SubData 2');  

-- You can see that sub_table contains two records
greatsql> SELECT * FROM sub_table;
+----+---------+-----------+
| id | main_id | data      |
+----+---------+-----------+
|  1 |       1 | SubData 1 |
|  2 |       1 | SubData 2 |
+----+---------+-----------+
2 rows in set (0.00 sec)
  
-- Now try to replace the record in main_table with REPLACE INTO  
greatsql> REPLACE INTO main_table (id, name) VALUES (1, 'New Record 1');

-- View the records in main_table  
greatsql> SELECT * FROM main_table;
+----+--------------+
| id | name         |
+----+--------------+
|  1 | New Record 1 |
+----+--------------+
1 row in set (0.00 sec)

-- View the records in sub_table; the data that referenced the id field of main_table has been deleted
greatsql> SELECT * FROM sub_table;
Empty set (0.00 sec)
```

## Notes on REPLACE INTO
1. The table into which data is inserted must have a primary key or a unique index! Otherwise, `REPLACE INTO` inserts the data directly, which results in duplicate data in the table.
2. When `REPLACE INTO` is used in the presence of foreign keys, if the record being replaced is referenced by a foreign key of another table, the data will be deleted.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
