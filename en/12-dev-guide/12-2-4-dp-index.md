# Index Management
---

## What Is an Index
In GreatSQL, an index is a data structure used to improve database query performance. It allows the database system to access specific data in a table more quickly instead of having to search the entire table from the beginning. Simply put, an index is like a pointer to the data in a table, through which the data can be found faster.
## Index Types
Index types include the regular index, the unique index, the full-text index, the single-column index, the multi-column index, and the spatial index.

- From a functional and logical point of view, there are mainly 4 kinds of indexes: the regular index, the unique index, the primary key index, and the full-text index.

- According to the physical implementation, indexes can be divided into 2 kinds: the clustered index and the non-clustered index.

- According to the number of columns involved, indexes are divided into the single-column index and the composite index.

### Clustered Index & Non-Clustered Index
According to the physical implementation, indexes can be divided into 2 kinds: the clustered index and the non-clustered index. A non-clustered index is also called a secondary index.

**Clustered Index**

- A clustered index determines the logical structure of the index according to how the data is organized in physical storage. A table can have only one cluster. A clustered index builds a B+ tree on the primary key of each table, and the leaf nodes store the row records of the whole table; the leaf nodes of a clustered index are also called data pages.

- Each table can have only one clustered index, which is usually built on the primary key. If no primary key is explicitly specified, the InnoDB storage engine tries to use the first unique non-null index as the clustered index. If the table has neither a primary key nor a suitable unique index, InnoDB implicitly creates a clustered index containing a row ID.


**Non-Clustered Index**

- A non-clustered index (also called a secondary index) stores the primary key and the index columns, rather than the complete row record, in its leaf nodes. This means that when data is queried through a non-clustered index, the corresponding primary key value must be found first, and then the complete row record is looked up in the clustered index by that primary key value.

- The order in which the table records of a non-clustered index are arranged is usually inconsistent with the order of the index. In addition, a table can have multiple non-clustered indexes, and each index is independent.

- The advantage of a non-clustered index is that indexes can be created for multiple columns, thereby supporting more complex query conditions. In addition, because the structure of a non-clustered index is relatively simple, it may provide higher query performance in some cases. However, because two lookups are required to obtain the complete data record (first the non-clustered index, then the clustered index), query complexity and overhead may increase in some cases.

### Primary Key Index & Secondary Index
**Primary Key Index**

- A primary key index is created based on the primary key of a table. The primary key is an attribute or a group of attributes used to uniquely identify a row in a table, so a primary key index is unique.

- For the InnoDB storage engine, the primary key index is the clustered index. This means that the data rows of the table are actually stored in the order of the primary key index. Therefore, the leaf nodes of the primary key index contain all the data of a row.

- A table can have only one primary key index, and the values in the primary key index must be unique and non-null.

**Secondary Index**

- A secondary index is an index created on the non-primary-key columns of a table. Unlike the primary key index, the leaf nodes of a secondary index do not contain all the data of a row; instead, they contain the index key value and a pointer to the location where the row data is stored (for the InnoDB storage engine, this pointer points to the primary key value).

- A table can have multiple secondary indexes, and each secondary index is independent.

- The main purpose of a secondary index is to speed up access to the data in a table. When the query conditions include columns of a secondary index, the database can use the secondary index to quickly locate the data rows that satisfy the conditions without scanning the entire table.

- Note that because the leaf nodes of a secondary index contain only the index key value and a pointer to the data row, when querying data through a secondary index, the database must first find the primary key value corresponding to the index key value, and then look up the complete data row in the clustered index by that primary key value. This process is called **table lookup**. Therefore, in some cases, if the query conditions only involve the columns of the secondary index and not the primary key column, query performance may be lower than expected even though the secondary index is used.

### Single-Column Index & Composite Index

**Single-Column Index**
- A single-column index is an index created on a single column of a table. A table can have multiple single-column indexes, and each index targets one column of the table.
- Common single-column index types include the regular index, the unique index, the primary key index, and the prefix index.
  - Regular index: used only to improve query speed; it allows duplicate data and NULL values.
  - Unique index: ensures that the values in the indexed column are unique, but NULL values are allowed.
  - Primary key index: a special unique index that does not allow NULL values, and each table can have only one primary key index.
  - Prefix index: an index created on only the first few characters of string data, suitable for columns with long strings.
- When the query conditions involve only a single column, a single-column index can significantly improve query speed.
- However, if the query conditions often involve multiple columns, you may need to consider using a composite index.

**Composite Index**
- A composite index is an index created on multiple columns of a table. These columns are combined in the order in which they are defined in the index.
- The main purpose of a composite index is to optimize the performance of queries with multi-column conditions. When the query conditions involve multiple columns, a composite index can combine these columns so that GreatSQL can locate the matching data faster.
- The order of columns must be considered carefully when creating a composite index. Columns that are often used together in query conditions should be placed at the front of the composite index. In this way, when the query conditions involve only these leading columns, the composite index can still be used effectively.
- A composite index can speed up queries with multi-column conditions and can also improve the performance of multi-column sorting operations.
- Compared with a single-column index, a composite index may use more storage space and may require more maintenance cost (such as index updates).

## Creating an Index
GreatSQL supports several ways to create an index on one or more columns: specifying the index column in the `CREATE TABLE` statement, creating an index on an existing table with the `ALTER TABLE` statement, or adding an index to an existing table with the `CREATE INDEX` statement.

### ALTER TABLE
The basic syntax for creating an index with the `ALTER TABLE` statement is as follows:
```sql
ALTER TABLE table_name ADD [UNIQUE | FULLTEXT | SPATIAL] [INDEX | KEY]
[index_name] (col_name[length],...) [ASC | DESC]
```
  - `UNIQUE`: creates a unique index.
  - `FULLTEXT`: creates a full-text index.
  - `SPATIAL`: creates a spatial index.
  - `INDEX`: creates a regular index.

The pseudocode is as follows:
```sql
ALTER TABLE table_name ADD index_type index_name(column_name);
```
For example, create a regular index:
```sql
ALTER TABLE test ADD INDEX index_name(id);
```
For example, create a unique index:
```sql
ALTER TABLE test ADD UNIQUE index_name(id);
```
For example, create a composite index:
```sql
ALTER TABLE test ADD INDEX index_name(id, name);
```
### CREATE INDEX

The basic syntax for creating an index with the `CREATE INDEX` statement is as follows:
```sql
CREATE [UNIQUE | FULLTEXT | SPATIAL] INDEX index_name
ON table_name (col_name[length],...) [ASC | DESC]
```
The pseudocode is as follows:
```sql
CREATE index_type index_name ON table_name(column_name);
```
For example, create a regular index:
```sql
CREATE INDEX index_name ON test(id);
```
For example, create a unique index:
```sql
CREATE UNIQUE INDEX index_name ON test(id);
```
For example, create a composite index:
```sql
CREATE INDEX index_name ON test(id, name);
```
## Dropping an Index
The basic syntax for dropping an index with `ALTER TABLE` is as follows:
```sql
ALTER TABLE table_name DROP INDEX index_name;
```
The basic syntax for dropping an index with `DROP INDEX` is as follows:
```sql
DROP INDEX index_name ON table_name;
```

::: tip Tip
1. When a large amount of table data needs to be deleted or modified, you can consider dropping the index first and inserting the index again after the data has been modified.

2. A unique index on an AUTO_INCREMENT column cannot be dropped.

3. When a column of a table is dropped, if the column is part of an index, the column is also removed from the index. If all columns that make up the index are dropped, the entire index is dropped.
:::

### Dropping a Primary Key Index
If a primary key is auto-incrementing, you cannot drop the primary key index of that column directly; you should cancel the auto-increment attribute first and then drop the primary key.
```sql
-- Redefine the column type
ALTER TABLE tablename MODIFY id INT ;

-- Drop the primary key index
ALTER TABLE tablename DROP PRIMARY KEY;
```
## Invisible Indexes
In GreatSQL 5.7 and earlier versions, both dropping and restoring an index rely on explicit operations. If an error occurs after an index is dropped, it must be explicitly created again to restore it. For scenarios with a large amount of data or complex table structures, this is not only cumbersome but also consumes a large amount of system resources, raising the cost of the operation.

Since GreatSQL 8.0, the invisible index feature has been introduced, making index management more flexible. Simply set the index to be dropped to the invisible state, and the query optimizer will no longer use it, even if a forced index is used. Once the setting is confirmed to have no impact on the system, an index can easily be soft-deleted. This innovative approach simplifies index management and improves system efficiency.

At the same time, if you want to verify the query performance impact of dropping an index, you can temporarily set that index to invisible first.

Indexes are visible by default. When using statements such as `CREATE TABLE`, `CREATE INDEX`, or `ALTER TABLE`, you can set the visibility of an index with the `VISIBLE` or `INVISIBLE` keyword.

### Creating an Invisible Index
An invisible index is implemented with the SQL keyword INVISIBLE, and its syntax is as follows:
```sql
CREATE TABLE tablename(
	propname1 type1 [ CONSTRAINT1],propname2 type2[ CONSTRAINT2],
    ...
	propnamen typen,
	INDEX [indexname ](propname1 [ ( length)]) INVISIBLE
);
```
For example:
```sql
CREATE TABLE t1(a int, b int, INDEX idx_b (b) INVISIBLE);
```
At this point the index `idx_b` is invisible and cannot be used.

### Creating an Invisible Index on an Existing Table

The syntax for setting an invisible index on an existing table is as follows:
```sql
CREATE [UNIQUE | FULLTEXT | SPATIAL] INDEX index_name
  ON table_name (col_name[length] [ASC | DESC],...) [INVISIBLE|VISIBLE]
```

For example:
```sql
CREATE INDEX idx_b ON t1 (b) INVISIBLE ;
```
The invisible index idx_b is created on table t1, and the index is invisible.

### Creating/Modifying an Invisible Index
#### Creating an Index with ALTER TABLE
The syntax is as follows:
```sql
ALTER TABLE table_name ADD [UNIQUE | FULLTEXT | SPATIAL] INDEX
  index_name (col_name[length],...) INVISIBLE
```
For example, create the invisible index idx_b:
```sql
ALTER TABLE t1 ADD INDEX idx_b (b) INVISIBLE ;
```
The invisible index idx_b is created on table t1, and the index is invisible.
#### Changing Index Visibility with ALTER TABLE
The visibility of an existing index can be switched with the following statement:
```sql
ALTER TABLE table_name ALTER INDEX index_name INVISIBLE|VISIBLE ;
```
For example, set the index idx_b on table t1 to invisible:
```sql
ALTER TABLE t1 ALTER INDEX idx_b INVISIBLE ;
```
For example, set the index idx_b on table t1 to visible:
```sql
ALTER TABLE t1 ALTER INDEX idx_b VISIBLE ;
```

::: tip Tip
After an index is set to invisible, the index data is still updated in real time.

If the index is not used for a long time, it is recommended to drop it after a period of time to reduce its performance impact on data insert, update, and delete operations.
:::

## Descending Index

Indexes created in GreatSQL before version 8.0 are still ascending indexes, and a reverse scan is performed at query time, which greatly reduces database efficiency. In some scenarios, descending indexes are of great significance. For example, if a query needs to sort multiple columns and the sort directions are inconsistent, using a descending index avoids additional filesort operations by the database, thereby improving performance.

A descending index is used as follows:

For example, create the table t1 and create the composite index idx_a_b, in which a is in ascending order and b is in descending order.
```sql
CREATE TABLE t1(a int, b int, index idx_a_b(a, b desc) );
```
View the structure of table t1; the result is as follows:
```sql
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `my_row_id` bigint unsigned NOT NULL AUTO_INCREMENT /*!80023 INVISIBLE */,
  `a` int DEFAULT NULL,
  `b` int DEFAULT NULL,
  PRIMARY KEY (`my_row_id`),
  KEY `idx_a_b` (`a`,`b` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```
As can be seen from the result, the index is already in descending order.


## Index Usage Reference
To make index usage more efficient, you must consider which columns to create indexes on and what types of indexes to create. Unreasonable index design or missing indexes will hinder the performance of the database and applications. Efficient indexes are very important for achieving good performance. The following guidelines should be considered when designing indexes. For details, see: [SQL Development Optimization Reference](../10-optimize/2-2-sql-develop-refer.md)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
