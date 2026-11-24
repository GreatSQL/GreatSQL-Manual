# Known Issues

- In GreatSQL 5.7.36-39, the InnoDB parallel query feature is not supported.
- In versions before GreatSQL 8.0.32-25, the InnoDB parallel query feature does not support Q21 of TPC-H.
- In GreatSQL 8.0.* versions, the InnoDB parallel query feature does not support subqueries.
- In versions before GreatSQL 8.0.32-25, the Rapid Engine is not supported.
- Since GreatSQL 8.0.32-26, the InnoDB parallel query feature is no longer recommended (the entry link in the user manual has also been removed).
- The Rapid Engine does not support table partitioning or foreign keys.
- For Rapid Engine tables in GreatSQL 8.0.32-27, after the incremental data synchronization task is enabled, an error may occur when a transaction in the underlying InnoDB base table deletes a record with the same primary key and then inserts it again. For example:

```sql
-- Construct a transaction that deletes first and then inserts
BEGIN;
DELETE FROM t1 WHERE ID=1024;
INSERT INTO t1 VALUES(1024, 1024);
```

When this transaction is applied to the Rapid Engine table, an error occurs and the incremental data synchronization task is terminated. The error message is similar to the following:

```sql
greatsql> SELECT * FROM information_schema.SECONDARY_ENGINE_INCREMENT_LOAD_TASK\G
...
           DB_NAME: test
        TABLE_NAME: t1
...
              INFO: {"exception_type":"Constraint","exception_message":"Duplicate key \"id: 1024\" violates primary key constraint. If this is an unexpected constraint violation please double check with the known index limitations section in our documentation (https://duckdb.org/docs/sql/indexes)."}
```

When this problem occurs, you can re-run a full load of the data and then start the incremental load task again, for example:

```sql
-- First unload all data from the Rapid Engine
greatsql> ALTER TABLE t1 SECONDARY_UNLOAD;

-- Perform a full load
greatsql> ALTER TABLE t1 SECONDARY_LOAD;

-- Start the incremental load task again; the third parameter of the function can specify the corresponding transaction GTID value
greatsql> SELECT START_SECONDARY_ENGINE_INCREMENT_LOAD_TASK('test', 't1');
```

This issue is expected to be resolved in the next version.

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
