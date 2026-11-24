# Optimizing SQL Performance
---

This section describes how to optimize SQL statement query performance in GreatSQL. The main contents include:
- Common SQL performance tuning methods.
- Best-practice references for SQL performance optimization, including schema design and more efficient ways of writing SQL.
- How to locate performance bottlenecks through slow SQL queries.
- How to optimize SQL performance with InnoDB parallel query.
- How to leverage the Rapid Engine to optimize SQL performance.

To make SQL requests execute faster, you should follow the core principles below, that is, optimize from the following directions:
- Store **as little data as possible** in a table. It is best to store only the hot data that applications frequently read, and archive the remaining cold data into other tables, which effectively reduces the total amount of data scanned by each SQL read. For more information, see: [Schema Design Optimization](./12-7-1-sql-optimize-schema-design.md).
- Make each row **as narrow as possible** (in other words, store the shortest possible content in each row). The benefit is that more hot data can be held in the memory buffer, reducing the number of physical I/O reads. For more information, see: [Schema Design Optimization](./12-7-1-sql-optimize-schema-design.md).
- Read or scan **as little data as possible** each time. Generally, you should either filter out more irrelevant data with WHERE conditions, limit the number of rows returned with LIMIT, or create appropriate indexes to improve data scanning efficiency (reducing needless scans). Also try not to execute `SELECT *` to read all columns. Use various means to improve SQL execution efficiency. For more information, see: [SQL Development Optimization](./12-7-2-sql-optimize-sql-dev.md).
- Choose an appropriate storage engine. For OLTP workloads, choose the InnoDB storage engine; for OLAP workloads, the Rapid Engine is recommended; for mixed HTAP workloads, it is recommended to enable the dplan feature. For more information, see: [Storage Engine Selection](./12-7-3-sql-optimize-engines.md).
- Regularly review and optimize slow query requests. As the amount of data in production environments changes, the performance of some business SQL queries may change significantly, and requests that used to complete very quickly may take longer and become slow queries. Therefore, you need to regularly review the slow query log, analyze and optimize the slow query requests that consume more database system resources, and reduce their impact on the online production environment. For more information, see: [Slow Query Analysis & Optimization](12-7-4-sql-optimize-slowsql.md).

SQL optimization is a continuous and dynamic process. There is no fixed routine; developers and DBAs are expected to adapt flexibly to the actual situation and take appropriate measures.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)