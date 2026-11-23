# Oracle Compatibility - Syntax - SEQUENCE
---

A sequence (`SEQUENCE`) is a sequence number generator that can automatically generate sequence numbers for rows in a table, producing a set of evenly spaced values (of numeric type). It does not occupy disk space, but does occupy memory.

It is usually used to generate primary key values for tables. It can be referenced in insert statements, and the current value can also be checked through a query, or the sequence can be incremented to the next value.

The `SEQUENCE` syntax of GreatSQL is fully compatible with Oracle, with only some features differing slightly in implementation.

## 1. Syntax

```sql
CREATE SEQUENCE schema_name.sequence_name
[INCREMENT BY interval]
[START WITH first_number]
[MAXVALUE max_value | NOMAXVALUE]
[MINVALUE min_value | NOMINVALUE]
[CYCLE | NOCYCLE]
[CACHE cache_size | NOCACHE]
[ORDER | NOORDER];
```

## 2. Definition and Usage

### 2.1 Parameter Description for Creating a `SEQUENCE`

The default values of the parameters for creating a `SEQUENCE` are shown in the following table:

| Attribute | Default Value | Description |
| ------------ | ------- | -------------------------------------- |
| START WITH | 1 | starting value |
| INCREMENT BY | 1 | step size for getting the next value (can be negative) |
| MINVALUE | 1 | minimum value |
| MAXVALUE | 10^29-1 | 28-digit decimal value |
| CYCLE | false | when true, restarts cycling after all values are used |
| CACHE | 20 | the number of values stored in the high-speed cache for the current sequence |
| ORDER | false | when true, guarantees global ordering (at the cost of performance) |

There are a few points to note about using `SEQUENCE`:

- 1. Ensure high-speed access to the `SEQUENCE`

`SEQUENCE` uses an in-memory high-speed cache for fast access and retrieval of `NEXTVAL`, and uses a physical table to persist the current value (the number of `SEQUENCE` values cached in the high-speed cache is related to the number specified by the `CACHE` option).

The `ORDER` parameter is usually used in multi-instance scenarios (for example, MGR multi-writer scenarios) to guarantee global ordering when obtaining `SEQUENCE` values. When `ORDER` is specified as **true**, the high-speed cache becomes invalid, and performance will be degraded to a certain extent.

**Reminder**: When `ORDER` is true, or the `CACHE` parameter value is small, the sequence value retrieval performance will be reduced.

- 2. Sequence value pre-allocation and global uniqueness guarantee

The sequence values in the high-speed cache use a **pre-allocation mechanism**. When the cached values are used up, the current sequence record in the physical table is read, and based on this record, 20 (default) sequence values are allocated again, and the physical table is updated. After the update succeeds, these 20 sequence values are successfully pre-allocated and stored in the high-speed cache.

If the GreatSQL instance is shut down or crashes abnormally, the unused values in the cache will be lost. After restarting the instance, the sequence values obtained again will not include the previously pre-allocated sequence values.

- 3. Other notes

  - 1. It is not recommended to use it in MGR multi-primary write scenarios.

  - 2. To improve performance, sequence objects need to occupy internal connections. When there are many sequence objects, the maximum number of connections needs to be appropriately increased.

### 2.2 Using `SEQUENCE`

- 1. Create/delete/modify

The SEQUENCE operations supported by GreatSQL are `CREATE`, `DROP`, and `ALTER`; `RENAME` is not supported yet.

When executing `ALTER SEQUENCE` to modify, changing the `START WITH` value is not supported.

When executing `DROP SEQUENCE` to delete a sequence, only one sequence can be deleted at a time.

When performing the above DDL operations on a `SEQUENCE`, the `SEQUENCE` is protected by an MDL lock, so there is no need to consider conflicts caused by DDL and DML operating on the same sequence at the same time.

`SEQUENCE` object names are mutually exclusive with table names and view names. Under the same `SCHEMA`, a sequence, table, or view with the same name cannot be created.

- 2. View

The `SHOW CREATE SEQUENCE seq_name` statement can be used to display the DDL for creating a `SEQUENCE`.

The `SHOW [FULL] SEQUENCES [FROM|IN schema_name] [LIKE seq_name] [WHERE where_condition]` statement can also be used to display all sequences in the specified schema.

- 3. Export backup

When using `mysqldump` to export data, you can add the `--sequences` option (off by default) to export sequence objects. When exporting, the `START WITH` of the sequence is the next valid value.

**Note**: The `--sequences` option cannot be used together with the `--xml` option.

Example:
```
mysqldump -S/data/GreatSQL/mysql.sock -uroot -pxxx -B greatsql -d --sequences > /data/backup/GreatSQL/greatsql-ddl.sql
```

## 3. Examples
```sql
-- Create
greatsql> CREATE SEQUENCE `seq1`
 START WITH 1
 MINVALUE 1
 MAXVALUE 9999999999999999999999999999
 INCREMENT BY 1
 NOCYCLE CACHE 20 NOORDER;

-- View
greatsql> SHOW SEQUENCES;
+-----------------------+
| Sequences_in_greatsql |
+-----------------------+
| seq1                  |
+-----------------------+

greatsql> SHOW FULL SEQUENCES;
+-----------------------+------------+----------+------------------------------+--------------+-------+-------+-------+
| Sequences_in_greatsql | Start_with | Minvalue | Maxvalue                     | Increment_by | Cycle | Cache | Order |
+-----------------------+------------+----------+------------------------------+--------------+-------+-------+-------+
| seq1                  |          1 |        1 | 9999999999999999999999999999 |            1 |     0 |    20 |     0 |
+-----------------------+------------+----------+------------------------------+--------------+-------+-------+-------+

greatsql> SHOW CREATE SEQUENCE SEQ1;
+----------+------------------------------------------------------------------------------------------------------------------------------+
| Sequence | Create Sequence                                                                                                              |
+----------+------------------------------------------------------------------------------------------------------------------------------+
| seq1     | CREATE SEQUENCE `seq1` START WITH 1 MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 NOCYCLE CACHE 20 NOORDER |
+----------+------------------------------------------------------------------------------------------------------------------------------+

-- Modify
greatsql> ALTER SEQUENCE seq1 MAXVALUE 99999;

-- Modifying the minimum value fails, because the current value is smaller than the minimum value (MINVALUE <= currval <= MAXVALUE is required)
greatsql> ALTER SEQUENCE seq1 MINVALUE 3;
ERROR 8586 (HY000): alter sequence failed, cause "currval" should between MINVALUE and MAXVALUE!

-- Execute the following operations and repeatedly retrieve values until currval >= MINVALUE
greatsql> SELECT seq1.NEXTVAL;
+---------+
| nextval |
+---------+
|       1 |
+---------+
...
+---------+
| nextval |
+---------+
|      15 |
+---------+

-- Modify again
greatsql> ALTER SEQUENCE seq1 MINVALUE 10;
Query OK, 1 row affected (0.00 sec)

-- START WITH cannot be modified
greatsql> alter sequence seq1 start with 10;
ERROR 8586 (HY000): alter sequence failed, cause can not modify START WITH

-- Delete
greatsql> DROP SEQUENCE seq1;
Query OK, 1 row affected (0.00 sec)
```

## 4. `SEQUENCE` Data Dictionary

```sql
-- 1. Query information_schema.SEQUENCES to view all SEQUENCEs
greatsql> SELECT * FROM information_schema.SEQUENCES;
+----------+------+------------+----------+------------------------------+-----------+------------+-----------+------------+
| DB       | NAME | START_WITH | MINVALUE | MAXVALUE                     | INCREMENT | CYCLE_FLAG | CACHE_NUM | ORDER_FLAG |
+----------+------+------------+----------+------------------------------+-----------+------------+-----------+------------+
| greatsql | seq1 |          1 |        1 | 9999999999999999999999999999 |         1 |          0 |        20 |          0 |
+----------+------+------------+----------+------------------------------+-----------+------------+-----------+------------+
1 row in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
