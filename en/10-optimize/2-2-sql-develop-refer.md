# SQL Development Optimization Reference
---

This article introduces the SQL development optimization reference recommended to follow when using and developing business system applications based on the GreatSQL database.

## Efficient SQL Application Development Reference

1. To achieve higher performance for business SQL in application development, follow several core principles:
	- Narrow tables are good: data types just need to be sufficient, keeping efficiency high.
	- Small tables are good: separate hot and cold data, keeping only the latest hot data.
	- Fast requests: each transaction/request is efficient enough and does not block.
	- Fewer requests: cut unnecessary requests from the product requirements side, make dynamic requests static or reduce their frequency; also reduce extra requests to the database, for example, additional grouping and sorting at the database layer.

1. By default, do not use `SELECT *` to fetch all columns at once. Only fetch the necessary columns. If all columns really need to be read, consider querying on a read-only secondary node.

1. In one SQL statement or one transaction, do not read or write too much data at once. It is usually recommended not to exceed 10,000 rows, reducing the cost of each request.

1. When random values are needed, do not directly run `ORDER BY RAND()`. Use the optimized method instead. Refer to the article: [Improving the Efficiency of MySQL RAND Random Sorting](https://mp.weixin.qq.com/s/SXRXzvuQDmuG99qfpfWwzQ).

1. Do not execute `LIKE '%search%'` full fuzzy matching searches. Change to `LIKE 'search%'` searches to be able to use the index.

1. `COUNT(*)` on InnoDB tables is inefficient, especially without a WHERE condition. Use it less, change to approximate counts, or use other external counters.

1. In statistical queries, `COUNT(*)` and `COUNT(N)` have no essential difference, but the latter is not a common writing style, so it is not recommended; it easily causes confusion. `COUNT(fieldN)` is different, especially when the column definition allows NULL; it scans row by row and skips rows whose value is NULL.

1. In pagination queries, when the page number is very large, do not simply use `LIMIT M,N`. Instead, use the deferred join optimization approach. Refer to the articles: [High-Performance Pagination Query Method](https://mp.weixin.qq.com/s/Et4nkoawfre_LjPX5kNl8g), [Pagination Optimization](https://mp.weixin.qq.com/s/61SkNCiyebLYOXN3qaAnxw).

1. When joining multiple tables, be sure to check whether the driving table selection is optimal, and whether the grouping/sorting columns belong to the driving table.

1. When joining multiple tables, avoid implicit type conversions that prevent the use of indexes.

1. If deduplication is not needed for multiple query results, `UNION ALL` can be used instead of `UNION`, because `UNION ALL` does not need to generate extra temporary tables.

1. In most cases, database and table sharding is not necessary, and there is no hard requirement to shard when exceeding 10 million rows. The key is still to optimize application request efficiency.


## Index Application Reference
1. Index creation and use should try to satisfy the three-star index principle (i.e., the query condition columns have indexes, the sorting columns have indexes, and the read columns are all in the index), but it should not be rigidly and mechanically executed; it should be flexibly adapted according to the actual situation.

1. Index creation and use should conform to the leftmost matching principle, and put columns with higher cardinality (higher differentiation) on the left side of the composite index, improving index efficiency.

1. Before business goes online, the most commonly used SQL requests need to be collected in the development and test environment first (you can set `long_query_time=0` to record all SQL and use the `pt-query-digest` tool to analyze), and create appropriate indexes for these requests.

1. Generally speaking, the usage rate of multi-column composite indexes is higher than single-column indexes, and they may satisfy more application scenarios. For example: for the query `WHERE a=? AND b=?`, creating the composite index `idx_a_b(a,b)` is more useful than creating two single-column indexes `idx_a(a)` and `idx_b(b)` separately; the latter usually cannot be used at the same time.

1. When creating indexes on columns of types such as CHAR/VARCHAR/TEXT/BLOB, always create only partial indexes rather than adding indexes to the entire column, for example: `idx_user(user(20))`.

1. Columns with business purposes should not be designed as the primary key column of a table. Instead, add a unique constraint. The primary key column of a table is recommended to use an auto-increment integer.

1. For columns with lower cardinality (lower differentiation), single-column indexes usually should not be created (except multi-column composite indexes), because the efficiency is generally low, for example, columns with only a few selectable values such as gender attributes, status values, and logical yes/no.

1. In multi-table join association queries, ensure that the associated columns always have indexes.

1. Do not create duplicate indexes. You can query `sys.schema_redundant_indexes` to confirm whether there are duplicate indexes. However, note one situation: the index `idx_a_b(a, b)` and the index `idx_a(a)`. The latter looks like a redundant index, but if there is a SQL `WHERE a=? ORDER BY id`, where `id` is the primary key column of the table, only the second index can be used to eliminate the `ORDER BY`, while the first index does not support it. Therefore, whether to delete the redundant index should also be decided based on the specific situation.

1. Pay attention to avoiding several scenarios where indexes may not be used:
	- When the estimated number of scanned records exceeds 10% ~ 20%, even with an index, it is very likely to switch to a full table scan.
	- When using a composite index, it does not conform to the leading matching principle.
	- The leftmost of the fuzzy query condition column starts with the wildcard "%".
	- In multi-table JOINs, if the sorting column does not belong to the driving table, the index cannot be used to eliminate sorting.
	- If the columns for condition filtering and sorting belong to different indexes, only one index can be used, and both indexes cannot be used.
	- In multi-table JOINs, if the associated column data types are inconsistent, implicit type conversion may occur and the index cannot be used.

1. You can regularly query `sys.schema_unused_indexes` to find indexes that have not been used for a long time, set them as invisible indexes, and then formally delete them after a period of time if there is no impact on the business.

1. Do not execute `LIKE '%search%'` full fuzzy matching searches. Change to `LIKE 'search%'` searches to be able to use the index.

1. `ANALYZE TABLE` can be executed during periods of low load to update statistics, improving the accuracy of index selection.

1. Key business SQL must be reviewed before going online, avoiding high-frequency requests without indexes.

1. Try not to use foreign key constraints, because they increase the probability of more row locks, deadlocks, and database complexity.





**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
