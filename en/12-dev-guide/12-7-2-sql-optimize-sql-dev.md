# SQL Development Optimization
---

This section describes the SQL development optimization references recommended when developing business applications that use and are built on GreatSQL.

## References for Efficient SQL Application Development

- To achieve higher performance for business SQL in application development, follow a few core principles:
	- Narrow tables are good: choose data types no larger than necessary, and keep them efficient.
	- Small tables are good: separate hot and cold data, keeping only the latest hot data.
	- Fast requests: make each transaction/request efficient enough and non-blocking.
	- Fewer requests: reduce unnecessary requests at the product requirement level, make dynamic requests static or reduce their frequency; also reduce extra requests to the database, such as doing extra grouping and sorting at the database layer.

- By default, do not use `SELECT *` to fetch all columns at once; fetch only the necessary columns. If you do need to read all columns, consider querying on a read-only replica.

- Do not read or write too much data in a single SQL statement or transaction; it is usually recommended not to exceed 10,000 rows, to reduce the cost of each request.

- When you need random values, do not simply run `ORDER BY RAND()`; use an optimized approach instead. See the article: [Improving the Efficiency of Random Sorting with MySQL RAND](https://mp.weixin.qq.com/s/SXRXzvuQDmuG99qfpfWwzQ).

- Do not execute full wildcard searches with `LIKE '%search%'`; instead use `LIKE 'search%'` so that the index can be used.

- Executing `COUNT(*)` on InnoDB tables is inefficient, especially without a WHERE condition. Use it sparingly; you can instead compute an approximate count or use another external counter.

- There is no essential difference between the counting queries `COUNT(*)` and `COUNT(N)`, but the latter is not a common way of writing and therefore is not recommended, as it can easily cause confusion. `COUNT(fieldN)` is different, however, especially when the column definition allows NULL: it scans row by row and skips rows whose value is NULL.

- In paginated queries where the page number is very large, do not simply use `LIMIT M,N`; instead adopt the deferred join optimization approach. See the articles: [High-Performance Pagination Method](https://mp.weixin.qq.com/s/Et4nkoawfre_LjPX5kNl8g), [Pagination Optimization](https://mp.weixin.qq.com/s/61SkNCiyebLYOXN3qaAnxw).

- When joining multiple tables, make sure the choice of the driving table is optimal, and check whether the GROUP BY/ORDER BY columns belong to the driving table.

- When joining multiple tables, avoid implicit type conversions that prevent the use of indexes.

- If the results of multiple queries do not need deduplication, use `UNION ALL` instead of `UNION`, because `UNION ALL` does not need to create an additional temporary table.

- Most of the time, database and table sharding is not necessary, and there is no hard requirement that tables with more than ten million rows must be split. The key is to optimize the efficiency of application requests.


## References for Index Usage
- When creating and using indexes, try to satisfy the three-star index principle as much as possible (that is, the columns in the query conditions have indexes, the columns used for sorting are all indexed, and the columns to be read are all covered by the index). However, do not apply it mechanically; be flexible according to the actual situation.

- Index creation and usage must follow the leftmost-prefix matching principle, and place columns with higher cardinality (higher selectivity) on the left side of a composite index to improve index efficiency.

- Before going live, collect the most common SQL requests in the development and test environments (you can set `long_query_time=0` to record all SQL and use the `pt-query-digest` tool for analysis), and create appropriate indexes for these requests.

- In general, multi-column composite indexes are used more frequently than single-column indexes and may satisfy more application scenarios. For example, for a query `WHERE a=? AND b=?`, creating a composite index `idx_a_b(a,b)` is more useful than creating two single-column indexes `idx_a(a)` and `idx_b(b)`, because the latter usually cannot be used at the same time.

- When creating indexes on columns of types such as `CHAR/VARCHAR/TEXT/BLOB`, always create only a partial index rather than indexing the entire column, for example: `idx_user(user(20))`.

- Columns with business meaning should not be designed as the primary key of a table; instead, add a unique constraint. The primary key column of a table is recommended to be an auto-increment integer.

- Columns with low cardinality (low selectivity) usually should not have single-column indexes (except in a multi-column composite index), because their efficiency is generally low. Examples include gender attributes, status values, and logical true/false columns that have only a few possible values.

- In multi-table JOIN queries, always make sure there is an index on the joined columns.

- Do not create duplicate indexes. You can check whether there are duplicate indexes by querying `sys.schema_redundant_indexes`. However, note one situation: with indexes `idx_a_b(a, b)` and `idx_a(a)`, the latter may seem redundant, but if there is a SQL statement like `WHERE a=? ORDER BY id` where `id` is the primary key column, then only the second index can be used to eliminate the `ORDER BY`, while the first index cannot. Therefore, decide whether to drop a redundant index based on the specific situation.

- Watch out for scenarios where the index may not be used:
	- When the estimated number of scanned records exceeds 10% to 20%, even if an index exists, the query is likely to switch to a full table scan.
	- When using a composite index, the leading-prefix matching principle is not satisfied.
	- The leftmost part of a fuzzy search condition column begins with the wildcard "%".
	- In a multi-table JOIN, if the sorted column does not belong to the driving table, the index cannot be used to eliminate the sort.
	- If the columns for filtering and sorting belong to different indexes, only one index can be used, not both.
	- In a multi-table JOIN, if the data types of the joined columns are inconsistent, an implicit type conversion may occur, preventing the use of the index.

- Periodically query `sys.schema_unused_indexes` to find indexes that have not been used for a long time, set them as invisible indexes, and after a period of time, if there is no impact on the business, formally drop them.

- Do not execute full wildcard searches with `LIKE '%search%'`; instead use `LIKE 'search%'` so that the index can be used.

- Run `ANALYZE TABLE` during periods of low load to update statistics and improve the accuracy of index selection.

- All critical business SQL must be reviewed before going live to avoid high-frequency requests without indexes.

- Avoid using foreign key constraints as much as possible, because they increase the probability of additional row locks, deadlocks, and database complexity.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)