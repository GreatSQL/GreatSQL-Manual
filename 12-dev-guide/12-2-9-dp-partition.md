# PARTITION/分区
---

## 概述

PARTITION（分区）支持将大表划分为更小、独立的部分，它可以提高查询性能和管理效率。

分区类型包括 RANGE、LIST、HASH、KEY 等，每种类型基于不同的分区键规则。分区可以降低查询延迟，优化存储空间使用，并简化数据管理。合理配置分区策略能有效提升数据库性能。

## 支持的分区类型

GreatSQL 支持以下几种分区类型：

1. **RANGE 分区**：按照某个字段的值范围进行分区。
1. **LIST 分区**：按照某个字段的具体值进行分区。
1. **COLUMNS 分区**：按照指定列的值分布到不同的分区中。
1. **HASH 分区**：按照某个字段的哈希值进行分区。
1. **KEY 分区**：类似 HASH 分区，但使用 MySQL 自己的哈希函数。
1. **LINEAR HASH 和 LINEAR KEY 分区**：线性哈希分区，适用于数据量变化较大的场景。

## 子分区类型

GreatSQL 也支持子分区，即在一个分区内再进行分区。支持以下子分区类型：

1. **HASH 子分区**：分区后，再次按照哈希值分割。
2. **KEY 子分区**：分区后，再次按照 MySQL 的哈希函数分割。

## 使用案例

在开始之前，先关闭 GIPKs 特性，创建分区时不支持隐藏主键列：

```sql
greatsql> SET sql_generate_invisible_primary_key=OFF;
```

### RANGE 分区

按照年份进行分区：

```sql
-- 建表
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

-- 写数据
greatsql> INSERT INTO sales VALUES(1,'1999-12-31',1999), (2,'2009-12-31',2009),
          (3,'2019-12-31',2019), (4,'2024-07-30',2024);

-- 查询全部数据
greatsql> SELECT * FROM sales;
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    1 | 1999-12-31 | 1999.00 |
|    2 | 2009-12-31 | 2009.00 |
|    3 | 2019-12-31 | 2019.00 |
|    4 | 2024-07-30 | 2024.00 |
+------+------------+---------+

-- 只查询指定分区
greatsql> SELECT * FROM sales PARTITION(p1);
+------+------------+---------+
| id   | sale_date  | amount  |
+------+------------+---------+
|    2 | 2009-12-31 | 2009.00 |
+------+------------+---------+
```

### LIST 分区

按照地区进行分区：

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

greatsql> INSERT INTO customers VALUES(1, '端木元白', 1), (2, '那拉易巧', 2), (3, '尉迟雪艳', 3), (4, '完颜采南', 4);

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

### COLUMNS 分区

GreatSQL 支持 `RANGE COLUMNS` 和 `LIST COLUMNS` 两种用法：

- `RANGE COLUMNS` 分区

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

greatsql> INSERT INTO logs VALUES(1, 3, 3, 'msg-1-3-3'), (2, 3, 20, 'msg-2-3-20'), (3, 6, 20, 'msg-3-6-20'), (4, 20, 30, 'msg-4-20-30');

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

- `LIST COLUMNS` 分区
 
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

greatsql> INSERT INTO customers1 VALUES(1, '端木元白', 1, 2), (2, '那拉易巧', 1, 3), (3, '尉迟雪艳', 2, 5), (4, '端木玉成', 3, 9), (5, '司徒瑜璟', 4, 12);

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

-- 插入一个不存在 LIST 组合报错
greatsql> INSERT INTO customers1 VALUES(6, '宇文娅欣', 2, 3);
ERROR 1526 (HY000): Table has no partition for value from column_list
```

### HASH 分区

按照 ID 哈希分区：
```sql
CREATE TABLE orders (
    id INT,
    order_date DATE,
    customer_id INT,
    PRIMARY KEY(id)
)
PARTITION BY HASH(id) PARTITIONS 4;

greatsql> INSERT INTO orders VALUES(1, '2014-01-01', 1), (2, '2024-02-01', 2), (3, '2024-03-01', 3), (4, '2024-04-01', 4);

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

### 子分区

先按年份分区，再按哈希值子分区：
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

greatsql> INSERT INTO logs VALUES(1, '2009-01-01', 'msg-1-2009'), (2, '2019-01-01', 'msg-2-2019'), (3, '2024-01-01', 'msg-3-2024');

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

## 分区管理

### 增加 RANGE 分区

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

-- 新增分区用于存储 2021-2024 年数据
-- 需要先删除最大分区，再新增分区（可以一次新增多个分区）
greatsql> ALTER TABLE sales DROP PARTITION p3,
	  ADD PARTITION (PARTITION p3 VALUES LESS THAN (2022,
	  ADD PARTITION (PARTITION p4 VALUES LESS THAN (2024),
	  PARTITION p5 VALUES LESS THAN MAXVALUE);
```
从上面案例可见，对于 RANGE 分区最好是显式指定每个分区的范围，不要一开始就定义 MAXVALUE 用于最后一个分区，这样的好处是方便后续新增更多分区。

### 增加/收缩 HASH 分区

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

-- 调整（增加/减少）分区个数
greatsql> ALTER TABLE orders PARTITION BY HASH(id) PARTITIONS 6;
greatsql> ALTER TABLE orders PARTITION BY HASH(id) PARTITIONS 3;
```

### 清空某个分区中的所有数据

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

### 删除分区

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

-- 删除某个分区
greatsql> ALTER TABLE sales DROP PARTITION p2025, p2026;
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0

-- 但不能用同样方法删除 HASH 分区
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

### 将分区和物理表相互交换

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

交换分区和物理表的时候，要和分区规则能匹配才行，否则可能会报错，例如：

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

greatsql> INSERT INTO s VALUES(5, '2023-07-01', 2023); -- 这条数据对应规则应该落在 p3 分区
greatsql> ALTER TABLE sales EXCHANGE PARTITION p4 WITH TABLE s;
ERROR 1737 (HY000): Found a row that does not match the partition
```

### 重建分区

当某个分区有较多碎片时，可以重建该分区

```sql
greatsql> ALTER TABLE sales REBUILD PARTITION p0;
```

或者当某个分区中删除大量数据后，此时有很多空闲磁盘空间待回收，也可以对这个分区进行优化

```sql
greatsql ALTER TABLE sales OPTIMIZE PARTITION p0;


## 注意事项
- **主键和唯一索引**：如果表中定义了主键索引或唯一索引键，则这个索引必须包含分区键。
- **不支持全文索引**：分区不支持全文索引和空间索引。
- **外键约束**：分区表不支持外键约束。


通过合理使用表分区，可以显著提高数据库的查询性能和管理效率。

更多分区使用方法请参考文档：[Partitioning](https://dev.mysql.com/doc/refman/8.0/en/partitioning.html)。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
