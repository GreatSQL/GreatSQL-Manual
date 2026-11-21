# PARTITION
---

## Overview

PARTITION helps divide a large table into smaller, independent parts, which improves query performance and management efficiency.

Partition types include RANGE, LIST, HASH, KEY, and so on, and each type is based on different partition key rules. Partitioning reduces query latency, optimizes storage space usage, and simplifies data management. A properly configured partitioning strategy can effectively improve database performance.

## Supported Partition Types

GreatSQL supports the following partition types:

1. **RANGE partitioning**: partitions data by the value range of a column.
1. **LIST partitioning**: partitions data by the specific values of a column.
1. **COLUMNS partitioning**: distributes data into different partitions by the values of the specified columns.
1. **HASH partitioning**: partitions data by the hash value of a column.
1. **KEY partitioning**: similar to HASH partitioning, but uses the hash function of MySQL itself.
1. **LINEAR HASH and LINEAR KEY partitioning**: linear hash partitioning, suitable for scenarios where the data volume changes considerably.

## Subpartition Types

GreatSQL also supports subpartitioning, that is, partitioning again within a partition. The following subpartition types are supported:

1. **HASH subpartitioning**: after partitioning, the data is split again by hash value.
2. **KEY subpartitioning**: after partitioning, the data is split again by the hash function of MySQL.

## Usage Examples

Before starting, disable the GIPKs feature first, because hidden primary key columns are not supported when creating partitions:

```sql
SET sql_generate_invisible_primary_key=OFF;
```

### RANGE Partitioning

RANGE partitioning partitions data based on the column values of a given continuous range. The most common case is based on a time column; the partition column should preferably be an integer, and a date column can be converted to an integer with a function.

::: tip Tip
It is best to use an integer directly as the RANGE partition column, which reduces data conversion/computation and improves efficiency.
:::

For example, partition by year:

```sql
-- Create the table
greatsql> CREATE TABLE sales (
    id INT,
    sale_date DATE,
    amount DECIMAL(10,2)
)
PARTITION BY RANGE (YEAR(sale_date)) (
    PARTITION p0 VALUES LESS THAN (2000),
    PARTITION p1 VALUES LESS THAN (2010),
    PARTITION p2 VALUES LESS THAN (2020),
    PARTITION p3 VALUES LESS THAN MAXVALUE
);

-- Write data
greatsql> INSERT INTO sales VALUES(1,'1999-12-31',1999),
	  (2,'2009-12-31',2009), (3,'2019-12-31',2019),
	  (4,'2024-07-30',2024);

-- Query all data
greatsql> SELECT * FROM sales;
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    1 | 1999-12-31 | 1999.00 |
|    2 | 2009-12-31 | 2009.00 |
|    3 | 2019-12-31 | 2019.00 |
|    4 | 2024-07-30 | 2024.00 |
+------+------------+---------+

-- Query only the specified partition
greatsql> SELECT * FROM sales PARTITION(p1);
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    2 | 2009-12-31 | 2009.00 |
+------+------------+---------+
```

::: tip Tip
In practice, RANGE partitioning is often used, especially for data that is convenient to archive (delete) on a schedule later, such as logs.
:::

When a new record is inserted, if the partition column value or the return value of the corresponding partition expression is NULL, the record is always written to the smallest partition, for example:

```sql
greatsql> SELECT * FROM sales PARTITION(p0);
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    1 | 1999-12-31 | 1999.00 |
+------+------------+---------+

greatsql> INSERT INTO sales VALUES(5, null, 1024);

-- The newly inserted data falls into partition p0
greatsql> SELECT * FROM sales PARTITION(p0);
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    1 | 1999-12-31 | 1999.00 |
|    5 | NULL       | 1024.00 |
+------+------------+---------+
```

### LIST Partitioning

LIST partitioning is similar to RANGE partitioning. The difference is that LIST is a collection of enumerated value lists, whereas RANGE is a collection of continuous range values. LIST partitioning is often used to distinguish a limited number of enumerated types, such as regions or certain status values.

::: tip Tip
Because the LIST partition enumeration values must be defined in advance, later maintenance can be somewhat troublesome, so this type is used relatively rarely in practice.
:::

For example, partition by region:

```sql
greatsql> CREATE TABLE customers (
    id INT,
    name VARCHAR(50),
    region_id INT
)
PARTITION BY LIST (region_id) (
    PARTITION pNorth VALUES IN (1),
    PARTITION pSouth VALUES IN (2),
    PARTITION pEast VALUES IN (3),
    PARTITION pWest VALUES IN (4)
);

greatsql> INSERT INTO customers VALUES(1, '端木元白', 1),
	  (2, '那拉易巧', 2), (3, '尉迟雪艳', 3),
	  (4, '完颜采南', 4);

greatsql> SELECT * FROM customers;
+------+--------------+-----------+
| id   | name         | region_id |
+------+--------------+-----------+
|    1 | 端木元白     |         1 |
|    2 | 那拉易巧     |         2 |
|    3 | 尉迟雪艳     |         3 |
|    4 | 完颜采南     |         4 |
+------+--------------+-----------+

greatsql> SELECT * FROM customers PARTITION(pEast);
+------+--------------+-----------+
| id   | name         | region_id |
+------+--------------+-----------+
|    3 | 尉迟雪艳     |         3 |
+------+--------------+-----------+
```

When a new record is inserted, if the partition column value or the return value of the corresponding partition expression is NULL, an error is reported if the LIST partition list does not contain the NULL value, for example:

```sql
greatsql> INSERT INTO customers VALUES(5, '南宫彩妍', null);
ERROR 1526 (HY000): Table has no partition for value NULL
```

### COLUMNS Partitioning

GreatSQL supports two usages: `RANGE COLUMNS` and `LIST COLUMNS`:

- `RANGE COLUMNS` partitioning

```sql
greatsql> CREATE TABLE logs (
    id INT,
    a INT,
    b INT,
    msg VARCHAR(20)
)
PARTITION BY RANGE COLUMNS(a, b) (
    PARTITION p0 VALUES LESS THAN (5, 12),
    PARTITION p1 VALUES LESS THAN (12, 20),
    PARTITION p2 VALUES LESS THAN (MAXVALUE, MAXVALUE)
);

greatsql> INSERT INTO logs VALUES(1, 3, 3, 'msg-1-3-3'),
	  (2, 3, 20, 'msg-2-3-20'), (3, 6, 20, 'msg-3-6-20'),
	  (4, 20, 30, 'msg-4-20-30');

greatsql> SELECT * FROM logs;
+------+------+------+-------------+
| id   | a    | b    | msg         |
+------+------+------+-------------+
|    1 |    3 |    3 | msg-1-3-3   |
|    2 |    3 |   20 | msg-2-3-20  |
|    3 |    6 |   20 | msg-3-6-20  |
|    4 |   20 |   30 | msg-4-20-30 |
+------+------+------+-------------+

greatsql> SELECT * FROM logs PARTITION(p0);
+------+------+------+------------+
| id   | a    | b    | msg        |
+------+------+------+------------+
|    1 |    3 |    3 | msg-1-3-3  |
|    2 |    3 |   20 | msg-2-3-20 |
+------+------+------+------------+
```

- `LIST COLUMNS` partitioning
 
```sql
greatsql> CREATE TABLE customers1 (
    id INT,
    name VARCHAR(50),
    region_id INT,
    city_id INT
)
PARTITION BY LIST COLUMNS (region_id, city) (
 PARTITION pNorth VALUES IN ((1, 1), (1, 2), (1, 3)),
 PARTITION pSouth VALUES IN ((2, 4), (2, 5), (2, 6)),
 PARTITION pEast VALUES IN ((3, 7), (3, 8), (3, 9)),
 PARTITION pWest VALUES IN ((4, 10), (4, 11), (4, 12))
);

greatsql> INSERT INTO customers1 VALUES(1, '端木元白', 1, 2),
	  (2, '那拉易巧', 1, 3), (3, '尉迟雪艳', 2, 5),
	  (4, '端木玉成', 3, 9), (5, '司徒瑜璟', 4, 12);

greatsql> SELECT * FROM customers1;
+------+--------------+-----------+---------+
| id   | name         | region_id | city_id |
+------+--------------+-----------+---------+
|    1 | 端木元白     |         1 |       2 |
|    2 | 那拉易巧     |         1 |       3 |
|    3 | 尉迟雪艳     |         2 |       5 |
|    4 | 端木玉成     |         3 |       9 |
|    5 | 司徒瑜璟     |         4 |      12 |
+------+--------------+-----------+---------+

greatsql> SELECT * FROM customers1 PARTITION(pNorth);
+------+--------------+-----------+---------+
| id   | name         | region_id | city_id |
+------+--------------+-----------+---------+
|    1 | 端木元白     |         1 |       2 |
|    2 | 那拉易巧     |         1 |       3 |
+------+--------------+-----------+---------+

-- Insert a column-list combination that does not exist; an error is reported
greatsql> INSERT INTO customers1 VALUES(6, '宇文娅欣', 2, 3);
ERROR 1526 (HY000): Table has no partition for value from column_list
```

::: tip Tip
The rules of COLUMNS partitioning are somewhat complex, so it is used relatively rarely in practice.
:::

### HASH Partitioning

Data is distributed relatively evenly across the partitions by the HASH algorithm. HASH partitioning is supported only for positive integers (or expressions whose result is a positive integer).

Partition by the hash of the ID:
```sql
greatsql> CREATE TABLE orders (
    id INT,
    order_date DATE,
    customer_id INT,
    PRIMARY KEY(id)
)
PARTITION BY HASH(id) PARTITIONS 4;

greatsql> INSERT INTO orders VALUES(1, '2014-01-01', 1),
	  (2, '2024-02-01', 2), (3, '2024-03-01', 3),
	  (4, '2024-04-01', 4);

greatsql> SELECT * FROM orders;
+----+------------+-------------+
| id | order_date | customer_id |
+----+------------+-------------+
|  4 | 2024-04-01 |           4 |
|  1 | 2014-01-01 |           1 |
|  2 | 2024-02-01 |           2 |
|  3 | 2024-03-01 |           3 |
+----+------------+-------------+

greatsql> SELECT * FROM orders PARTITION(p0);
+----+------------+-------------+
| id | order_date | customer_id |
+----+------------+-------------+
|  4 | 2024-04-01 |           4 |
+----+------------+-------------+
```

The underlying implementation of HASH partitioning is based on the `MOD` function. In the example above, the HASH column is `id`, so the partition is chosen according to the value computed by the expression `MOD(id, 4)`.

### LINEAR HASH Partitioning (Linear Hash Partitioning)

LINEAR HASH partitioning is a special type of HASH partitioning. Unlike HASH partitioning, which is based on the `MOD` function, it uses a linear power-of-two algorithm.

Create a linearly hash-partitioned table:

```sql
greatsql> CREATE TABLE orders (
    id INT,
    order_date DATE,
    customer_id INT,
    PRIMARY KEY(id)
)
PARTITION BY LINEAR HASH(id) PARTITIONS 4;

greatsql> INSERT INTO orders VALUES(1, '2014-01-01', 1),
	  (2, '2024-02-01', 2), (3, '2024-03-01', 3),
	  (4, '2024-04-01', 4);

greatsql> SELECT * FROM orders;
+----+------------+-------------+
| id | order_date | customer_id |
+----+------------+-------------+
|  4 | 2024-04-01 |           4 |
|  1 | 2014-01-01 |           1 |
|  2 | 2024-02-01 |           2 |
|  3 | 2024-03-01 |           3 |
+----+------------+-------------+

greatsql> SELECT * FROM orders PARTITION(p0);
+----+------------+-------------+
| id | order_date | customer_id |
+----+------------+-------------+
|  4 | 2024-04-01 |           4 |
+----+------------+-------------+

```

::: tip Tip
LINEAR HASH partitioning is more suitable for scenarios with a large amount of data; however, compared with HASH partitioning, the probability of an uneven data distribution is greater.
:::

### KEY Partitioning

KEY partitioning is much the same as HASH partitioning. The differences are:
- HASH partitioning allows a custom expression, whereas KEY partitioning is built in.
- KEY partitioning can specify multiple columns or none at all, whereas HASH partitioning can specify only one column.
- If the table has a primary key, the KEY partition key must include part or all of the table primary key.
- If no column name is specified as the partition key in KEY partitioning, the primary key of the table is used (if any).
- KEY partitioning cannot use an expression, whereas HASH partitioning can.

```sql
-- The table has no primary key defined; an error is reported if KEY partitioning specifies no column
CREATE TABLE k1 (
    id INT NOT NULL,
    name VARCHAR(20)
)
PARTITION BY KEY()
PARTITIONS 2;
ERROR 1488 (HY000): Field in list of fields for partition function not found in table

-- If there is no primary key, or no unique index key that is not allowed to be NULL (which can be used as a clustered index), KEY partitioning must specify a column
CREATE TABLE k1 (
    id INT NOT NULL,
    name VARCHAR(20)
)
PARTITION BY KEY(id)
PARTITIONS 2;

CREATE TABLE k1 (
    id INT NOT NULL,
    name VARCHAR(20),
    UNIQUE KEY(id)
)
PARTITION BY KEY()
PARTITIONS 2;
```

### Subpartitioning

Partition by year first, then subpartition by hash value:
```sql
greatsql> CREATE TABLE logs (
    id INT,
    log_date DATE,
    message TEXT
)
PARTITION BY RANGE (YEAR(log_date)) 
SUBPARTITION BY HASH(id) SUBPARTITIONS 4 (
    PARTITION p0 VALUES LESS THAN (2010),
    PARTITION p1 VALUES LESS THAN (2020),
    PARTITION p2 VALUES LESS THAN MAXVALUE
);

greatsql> INSERT INTO logs VALUES(1, '2009-01-01', 'msg-1-2009'),
	  (2, '2019-01-01', 'msg-2-2019'),
	  (3, '2024-01-01', 'msg-3-2024');

greatsql> select * from logs;
+------+------------+------------+
| id   | log_date   | message    |
+------+------------+------------+
|    1 | 2009-01-01 | msg-1-2009 |
|    2 | 2019-01-01 | msg-2-2019 |
|    3 | 2024-01-01 | msg-3-2024 |
+------+------------+------------+

greatsql> SELECT * FROM logs PARTITION(p0);
+------+------------+------------+
| id   | log_date   | message    |
+------+------------+------------+
|    1 | 2009-01-01 | msg-1-2009 |
+------+------------+------------+
```

## Partition Management

### Adding Partitions

- Adding RANGE partitions

```sql
greatsql> SHOW CREATE TABLE sales\G
*************************** 1. row ***************************
       Table: sales
Create Table: CREATE TABLE `sales` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`sale_date`))
(PARTITION p0 VALUES LESS THAN (2000) ENGINE = InnoDB,
 PARTITION p1 VALUES LESS THAN (2010) ENGINE = InnoDB,
 PARTITION p2 VALUES LESS THAN (2020) ENGINE = InnoDB,
 PARTITION p3 VALUES LESS THAN MAXVALUE ENGINE = InnoDB) */

-- Add partitions to store data for 2021-2024
-- The largest partition must be dropped first, and then new partitions are added (multiple partitions can be added at one time)
greatsql> ALTER TABLE sales DROP PARTITION p3;
greatsql> ALTER TABLE sales ADD PARTITION (PARTITION p3 VALUES LESS THAN (2022,
	  ADD PARTITION (PARTITION p4 VALUES LESS THAN (2024),
	  PARTITION p5 VALUES LESS THAN MAXVALUE);
```
As can be seen from the case above, for RANGE partitioning it is best to explicitly specify the range of each partition and not to define MAXVALUE for the last partition at the beginning. The advantage is that more partitions can be added easily later.

- Adding HASH partitions

```sql
greatsql> SHOW CREATE TABLE orders\G
*************************** 1. row ***************************
       Table: orders
Create Table: CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_date` date DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY HASH (`id`)
PARTITIONS 4 */

-- Add 2 partitions
greatsql> ALTER TABLE orders ADD PARTITION PARTITIONS 2;

greatsql> SHOW CREATE TABLE orders\G
*************************** 1. row ***************************
       Table: orders
Create Table: CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_date` date DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY HASH (`id`)
PARTITIONS 6 */
```

### Reorganizing Partitions

- Reorganizing RANGE partitions

```sql
-- Merge partitions p0 and p1 of the RANGE partitioning
greatsql> SHOW CREATE TABLE sales\G
*************************** 1. row ***************************
       Table: sales
Create Table: CREATE TABLE `sales` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`sale_date`))
(PARTITION p0 VALUES LESS THAN (2000) ENGINE = InnoDB,
 PARTITION p1 VALUES LESS THAN (2010) ENGINE = InnoDB,
 PARTITION p2 VALUES LESS THAN (2020) ENGINE = InnoDB,
 PARTITION p3 VALUES LESS THAN (2024) ENGINE = InnoDB,
 PARTITION p4 VALUES LESS THAN (2025) ENGINE = InnoDB) */

greatsql> ALTER TABLE sales REORGANIZE PARTITION p0,p1 INTO (PARTITION p0 VALUES LESS THAN (2010));

greatsql> SHOW CREATE TABLE sales\G
*************************** 1. row ***************************
       Table: sales
Create Table: CREATE TABLE `sales` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`sale_date`))
(PARTITION p0 VALUES LESS THAN (2010) ENGINE = InnoDB,
 PARTITION p2 VALUES LESS THAN (2020) ENGINE = InnoDB,
 PARTITION p3 VALUES LESS THAN (2024) ENGINE = InnoDB,
 PARTITION p4 VALUES LESS THAN (2025) ENGINE = InnoDB) */
```

- Reorganizing LIST partitions

```sql
greatsql> SHOW CREATE TABLE customers\G
*************************** 1. row ***************************
       Table: customers
Create Table: CREATE TABLE `customers` (
  `id` int DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `region_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY LIST (`region_id`)
(PARTITION pNorth VALUES IN (1) ENGINE = InnoDB,
 PARTITION pSouth VALUES IN (2) ENGINE = InnoDB,
 PARTITION pEast VALUES IN (3) ENGINE = InnoDB,
 PARTITION pWest VALUES IN (4) ENGINE = InnoDB) */

greatsql> ALTER TABLE customers REORGANIZE PARTITION pNorth,pSouth INTO (PARTITION pNorthSouth VALUES IN (1,2));

greatsql> SHOW CREATE TABLE customers\G
*************************** 1. row ***************************
       Table: customers
Create Table: CREATE TABLE `customers` (
  `id` int DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `region_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY LIST (`region_id`)
(PARTITION pNorthSouth VALUES IN (1,2) ENGINE = InnoDB,
 PARTITION pEast VALUES IN (3) ENGINE = InnoDB,
 PARTITION pWest VALUES IN (4) ENGINE = InnoDB) */
```

- Reorganizing HASH partitions

```sql
greatsql> SHOW CREATE TABLE orders\G
*************************** 1. row ***************************
       Table: orders
Create Table: CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_date` date DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY HASH (`id`)
PARTITIONS 6 */

-- Merge the number of partitions to 4 (shrink by 2)
greatsql> ALTER TABLE orders COALESCE PARTITION 2;

greatsql> SHOW CREATE TABLE orders\G
*************************** 1. row ***************************
       Table: orders
Create Table: CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_date` date DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY HASH (`id`)
PARTITIONS 4 */
```

### Truncating All Data in a Partition

```sql
greatsql> SELECT * FROM orders PARTITION(p3);
+----+------------+-------------+
| id | order_date | customer_id |
+----+------------+-------------+
|  3 | 2024-07-15 |           3 |
+----+------------+-------------+

greatsql> ALTER TABLE orders TRUNCATE PARTITION p3;
Query OK, 0 rows affected (0.01 sec)

greatsql> SELECT * FROM orders PARTITION(p3);
Empty set (0.01 sec)
```

### Dropping Partitions

```sql
greatsql> SHOW CREATE TABLE sales\G
*************************** 1. row ***************************
       Table: sales
Create Table: CREATE TABLE `sales` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`sale_date`))
(PARTITION p0 VALUES LESS THAN (2000) ENGINE = InnoDB,
 PARTITION p1 VALUES LESS THAN (2010) ENGINE = InnoDB,
 PARTITION p2 VALUES LESS THAN (2020) ENGINE = InnoDB,
 PARTITION p3 VALUES LESS THAN (2024) ENGINE = InnoDB,
 PARTITION p4 VALUES LESS THAN (2025) ENGINE = InnoDB,
 PARTITION p2025 VALUES LESS THAN (2026) ENGINE = InnoDB,
 PARTITION p2026 VALUES LESS THAN (2027) ENGINE = InnoDB) */

-- Drop a certain partition
greatsql> ALTER TABLE sales DROP PARTITION p2025, p2026;
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0

-- But HASH partitions cannot be dropped in the same way
greatsql> SHOW CREATE TABLE orders\G
*************************** 1. row ***************************
       Table: orders
Create Table: CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_date` date DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY HASH (`id`)
PARTITIONS 4 */

greatsql> ALTER TABLE orders DROP PARTITION p3;
ERROR 1512 (HY000): DROP PARTITION can only be used on RANGE/LIST partitions
```

### Exchanging a Partition with a Physical Table

```sql
greatsql> SHOW CREATE TABLE sales\G
*************************** 1. row ***************************
       Table: sales
Create Table: CREATE TABLE `sales` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`sale_date`))
(PARTITION p0 VALUES LESS THAN (2000) ENGINE = InnoDB,
 PARTITION p1 VALUES LESS THAN (2010) ENGINE = InnoDB,
 PARTITION p2 VALUES LESS THAN (2020) ENGINE = InnoDB,
 PARTITION p3 VALUES LESS THAN (2024) ENGINE = InnoDB,
 PARTITION p4 VALUES LESS THAN (2025) ENGINE = InnoDB) */

greatsql> SELECT * FROM sales;
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    1 | 1999-12-31 | 1999.00 |
|    2 | 2009-12-31 | 2009.00 |
|    3 | 2019-12-31 | 2019.00 |
+------+------------+---------+

greatsql> CREATE TABLE s LIKE sales;
greatsql> ALTER TABLE s REMOVE PARTITIONING;
greatsql> SHOW CREATE TABLE s\G
*************************** 1. row ***************************
       Table: s
Create Table: CREATE TABLE `s` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO s VALUES(4, '2024-07-01', 2024);
greatsql> ALTER TABLE sales EXCHANGE PARTITION p4 WITH TABLE s;
```

When exchanging a partition with a physical table, the data must match the partition rules; otherwise an error may be reported, for example:

```sql
greatsql> SHOW CREATE TABLE sales\G
*************************** 1. row ***************************
       Table: sales
Create Table: CREATE TABLE `sales` (
  `id` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`sale_date`))
(PARTITION p0 VALUES LESS THAN (2000) ENGINE = InnoDB,
 PARTITION p1 VALUES LESS THAN (2010) ENGINE = InnoDB,
 PARTITION p2 VALUES LESS THAN (2020) ENGINE = InnoDB,
 PARTITION p3 VALUES LESS THAN (2024) ENGINE = InnoDB,
 PARTITION p4 VALUES LESS THAN (2025) ENGINE = InnoDB) */

greatsql> INSERT INTO s VALUES(5, '2023-07-01', 2023); -- According to the rule, this row should fall into partition p3
greatsql> ALTER TABLE sales EXCHANGE PARTITION p4 WITH TABLE s;
ERROR 1737 (HY000): Found a row that does not match the partition
```

### Rebuilding Partitions

When a partition has a lot of fragmentation, the partition can be rebuilt.

```sql
ALTER TABLE sales REBUILD PARTITION p0;
```

Alternatively, after a large amount of data has been deleted from a partition, there is a lot of free disk space waiting to be reclaimed, and the partition can also be optimized.

```sql
ALTER TABLE sales OPTIMIZE PARTITION p0;
```

## Precautions
- **Primary key and unique index**: if a primary key index or a unique index key is defined in the table, the index must include the partition key.
- **Full-text index not supported**: partitioning does not support full-text or spatial indexes.
- **Foreign key constraints**: partitioned tables do not support foreign key constraints.


By using table partitioning properly, the query performance and management efficiency of the database can be significantly improved.

For more information on using partitioning, see: [Partitioning](https://dev.mysql.com/doc/refman/8.0/en/partitioning.html).

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
