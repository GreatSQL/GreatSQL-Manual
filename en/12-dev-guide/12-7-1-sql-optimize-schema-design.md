# Schema Design Optimization
---

This section describes how to optimize schema development and design in GreatSQL.

## Basic Principles

There are two very important principles for database schema development and design:

### Store as little data as possible in a table

It is best to store only the hot data that applications frequently read, and archive more cold data into other tables. This effectively reduces the total amount of data scanned by each SQL read.

Sometimes we may have a misconception: the more data stored in a database, the "stronger" the database appears, making the DBA or architect look more capable.

However, we believe the more sensible approach is to store as little hot data as possible in the hot tables of the core business database. The database keeps frequently accessed active data in its finite memory buffer (in GreatSQL, its size is defined by the `innodb_buffer_pool_size` option). If the frequently read hot data can all be loaded into the memory buffer, physical reads can clearly be avoided or reduced. If there is too much hot data to fit entirely into the memory buffer, then when the business application needs to read data that is not in the buffer, a physical read is required to bring that data into the buffer, which is clearly less efficient.

Consider the following architectural design approaches:
- Separate hot and cold data at the physical level, that is, use one hot table to store hot data and archive cold data into other physical tables, leveraging tools such as `pt-archiver` for periodic automatic archiving. In addition, you can use source-replica replication or an MGR architecture to implement read/write splitting, that is, read and write the hot tables on the primary node, while routing requests for cold data to the secondary nodes, doing everything possible to reduce the read/write pressure on the **primary node** and **hot tables**.
- Use table partitioning to separate hot and cold data: place hot data in an independent partition and cold data in other partitions, and use the **[event scheduler](https://dev.mysql.com/doc/refman/8.0/en/events-configuration.html)** to periodically create and drop partitions automatically and archive the data from hot partitions to cold partitions.
- Add a cache service in front of the database so that application requests go to the cache service first; only when the requested data is not in the cache does the system read it from the backend database nodes. In this approach, the cache service can be built as a distributed service to reduce the risk of a single point of failure, and multi-layer encapsulation can be applied to reduce the avalanche impact of a single-layer failure on the backend database.

### Make each row as narrow as possible

In other words, store the shortest possible content in each row. The benefit is that more hot data can be held in the memory buffer, reducing the number of physical I/O reads.

When storing data, try to compress the size and length of the data to be written. For example, when a state is represented by the `VARCHAR` strings `'one'` and `'two'`, you can switch to the `TINYINT` data type instead. This makes the stored data smaller, and the new data type is also more efficient. You can also compress the strings to be written using hash compression.

In some cases where long text, strings, or other large data objects genuinely need to be stored in the database, you can separate these large object contents from the main table and store them in a separate data table. That is, split a single wide table into two or more sub-tables, keeping the data most closely related to the application business in the main table and the less closely related data in other tables. The benefit is obvious: more hot data that needs to be accessed frequently can be loaded into the memory buffer, improving the access efficiency of the business application.

## Schema Design Optimization

When developing and designing a GreatSQL schema, it is recommended to follow the specifications and optimization ideas below:
- Use a normalized database schema, following the third normal form (3NF) or Boyce-Codd normal form (BCNF) as much as possible to reduce data redundancy and improve data consistency and integrity. However, if moderate redundancy can reduce the frequency of JOINs in application development, it is worthwhile, and a comprehensive balance should be struck.
- Choose appropriate data types based on storage requirements, avoiding oversized or unnecessary data types to save storage space and improve query efficiency. For example, as mentioned above, use `INT` instead of `VARCHAR` whenever possible; do not store date/time values or IPv4 addresses as `VARCHAR`—use `DATETIME` or `INT` instead; in cases where `ENUM` or `SET` might be used, consider switching to the `TINYINT` type.
- For large tables, consider using table partitioning to spread the data across multiple physical storage areas, improving query efficiency and management performance.
- Perform vertical partitioning (Vertical Partitioning) and horizontal partitioning (Horizontal Partitioning) based on business requirements, distributing data across different tables or databases to improve performance and scalability.
- From the database instance, to the database schema, then to tables and columns—including all data objects such as stored procedures, triggers, and events—as well as application connections and query results, use the same character set (and collation) throughout, to avoid garbled characters and prevent the risk of implicit type conversion caused by inconsistent character sets (collations).
- Avoid the `FLOAT` and `DOUBLE` data types as much as possible. On the one hand, they do not store exact values and generally cannot be used for equality comparisons; on the other hand, the database system is usually less efficient at handling the `FLOAT` data type.
- Avoid large object types such as `TEXT` and `BLOB` as much as possible. They are less efficient to store and are more likely to cause serious tablespace fragmentation.
- Avoid storing NULL values as much as possible and add the `NOT NULL` constraint when defining columns, because NULL is a special value that cannot be used directly in equality comparisons, and the database system is usually less efficient at handling NULL.
- Give every table an auto-increment `INT` column as the primary key, plus two columns representing the creation time (`gmt_create`) and the last update time (`gmt_modify`). This is very helpful for subsequent table maintenance.
- Within a single database instance, the number of tables (including partitions) should normally not exceed ten thousand, and the number of tables within each schema (database) should normally not exceed one thousand, to avoid excessive metadata management overhead.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)