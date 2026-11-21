# Oracle Compatibility - Syntax - Oracle (+) Syntax
---

## 1. Syntax

```sql
-- LEFT JOIN
SELECT * FROM join_table1, join_table2 WHERE join_table1.col1 join_specification join_table2.col2(+);

-- RIGHT JOIN
SELECT * FROM join_table1, join_table2 WHERE join_table1.col1(+) join_specification join_table2.col2;
```

## 2. Usage Examples and Description of the `(+)` Syntax

Create test tables and fill in test data

```
greatsql> CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY, c1 INT);
greatsql> CREATE TABLE t2 (id INT NOT NULL PRIMARY KEY, c1 INT);
greatsql> INSERT INTO t1 VALUES (1, 1), (2, 2), (3,3), (4,4);
greatsql> INSERT INTO t2 VALUES (4, 4), (3, 3), (2,2), (1,1);

greatsql> SELECT * FROM t1;
+----+------+
| id | c1   |
+----+------+
|  1 |    1 |
|  2 |    2 |
|  3 |    3 |
|  4 |    4 |
+----+------+
4 rows in set (0.00 sec)

greatsql> SELECT * FROM t2;
+----+------+
| id | c1   |
+----+------+
|  4 |    4 |
|  3 |    3 |
|  2 |    2 |
|  1 |    1 |
+----+------+
4 rows in set (0.00 sec)

greatsql> SELECT * FROM t1;
+----+------+
| id | c1   |
+----+------+
|  1 |    1 |
|  2 |    2 |
|  3 |    3 |
|  4 |    4 |
+----+------+
4 rows in set (0.00 sec)
```

- 1. Multiple usages are supported.

```sql

-- `(+)` is written on the side of the joined table, indicating t1 LEFT JOIN t2
greatsql> EXPLAIN SELECT * FROM t1, t2 WHERE t1.c1 = t2.c1(+);
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | NULL                                       |
|  1 | SIMPLE      | t2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    3 |   100.00 | Using where; Using join buffer (hash join) |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
2 rows in set, 1 warning (0.00 sec)

-- It can be seen that this is t1 left join t2
greatsql> SHOW WARNINGS;
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`id` AS `id`,`greatsql`.`t1`.`c1` AS `c1`,`greatsql`.`t2`.`id` AS `id`,`greatsql`.`t2`.`c1` AS `c1` from `greatsql`.`t1` left join `greatsql`.`t2` on((`greatsql`.`t2`.`c1` = `greatsql`.`t1`.`c1`)) where true

-- `(+)` is written on the side of the driving table, indicating t1 RIGHT JOIN t2
greatsql> EXPLAIN SELECT * FROM t1, t2 WHERE t1.c1 (+)= t2.c1;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
|  1 | SIMPLE      | t2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    3 |   100.00 | NULL                                       |
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using where; Using join buffer (hash join) |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
2 rows in set, 1 warning (0.00 sec)

-- It can be seen that this is t2 left join t1
greatsql> SHOW WARNINGS;
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`id` AS `id`,`greatsql`.`t1`.`c1` AS `c1`,`greatsql`.`t2`.`id` AS `id`,`greatsql`.`t2`.`c1` AS `c1` from `greatsql`.`t2` left join `greatsql`.`t1` on((`greatsql`.`t1`.`c1` = `greatsql`.`t2`.`c1`)) where true

-- Multi-table JOIN is supported
greatsql> CREATE TABLE t3 LIKE t1;
greatsql> INSERT INTO t3 SELECT * FROM t1;

-- Equivalent to t3 left join t2 left join t1
greatsql> EXPLAIN SELECT * FROM t1, t2, t3 WHERE t1.c1(+) = t2.c1 AND t2.c1(+) = t3.c1;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
|  1 | SIMPLE      | t3    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | NULL                                       |
|  1 | SIMPLE      | t2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using where; Using join buffer (hash join) |
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using where; Using join buffer (hash join) |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
3 rows in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`id` AS `id`,`greatsql`.`t1`.`c1` AS `c1`,`greatsql`.`t2`.`id` AS `id`,`greatsql`.`t2`.`c1` AS `c1`,`greatsql`.`t3`.`id` AS `id`,`greatsql`.`t3`.`c1` AS `c1` from `greatsql`.`t3` left join (`greatsql`.`t2` left join `greatsql`.`t1` on((`greatsql`.`t1`.`c1` = `greatsql`.`t2`.`c1`))) on((`greatsql`.`t2`.`c1` = `greatsql`.`t3`.`c1`)) where true

-- Partial multi-table JOIN is supported
greatsql> CREATE TABLE t4 LIKE t1;
greatsql> INSERT INTO t4 SELECT * FROM t1;

-- Equivalent to (t2 left join t1) join (t3 left join t4)
greatsql> EXPLAIN SELECT * FROM t1, t2, t3, t4 WHERE t1.c1(+) = t2.c1 AND t3.c1 = t4.c1(+);
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
|  1 | SIMPLE      | t2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | NULL                                       |
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using where; Using join buffer (hash join) |
|  1 | SIMPLE      | t3    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using join buffer (hash join)              |
|  1 | SIMPLE      | t4    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using where; Using join buffer (hash join) |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
4 rows in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`id` AS `id`,`greatsql`.`t1`.`c1` AS `c1`,`greatsql`.`t2`.`id` AS `id`,`greatsql`.`t2`.`c1` AS `c1`,`greatsql`.`t3`.`id` AS `id`,`greatsql`.`t3`.`c1` AS `c1`,`greatsql`.`t4`.`id` AS `id`,`greatsql`.`t4`.`c1` AS `c1` from `greatsql`.`t3` left join `greatsql`.`t4` on((`greatsql`.`t4`.`c1` = `greatsql`.`t3`.`c1`)) join `greatsql`.`t2` left join `greatsql`.`t1` on((`greatsql`.`t1`.`c1` = `greatsql`.`t2`.`c1`)) where true
```

- 2. `(+)` can only be used on a single column, and cannot be used on expressions or constants.

```sql
-- Error example, a syntax error is reported
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 = 0(+);
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '(+)' at line 1

greatsql> SELECT * FROM t1, t2 WHERE (t1.c1 + t2.c1)(+) = t2.id;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '(+) = t2.id' at line 1
```

- 3. `(+)` can only be used on columns in the `WHERE` expression; using it on columns in other positions will ignore its effect.

```sql
-- The following examples will not sort or group by the t2.c1 column
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 = t2.c1 ORDER BY t2.c1(+);
+----+------+----+------+
| id | c1   | id | c1   |
+----+------+----+------+
|  1 |    1 |  1 |    1 |
|  2 |    2 |  2 |    2 |
|  3 |    3 |  3 |    3 |
|  4 |    4 |  4 |    4 |
+----+------+----+------+
4 rows in set (0.00 sec)

greatsql> SELECT t2.c1 FROM t1, t2 WHERE t1.c1 = t2.c1 GROUP BY t2.c1(+);
+------+
| c1   |
+------+
|    4 |
|    3 |
|    2 |
|    1 |
+------+
4 rows in set (0.00 sec)

greatsql> SELECT t1.c1, t2.c1 FROM t1, t2 GROUP BY t2.c1, t1.c1 HAVING t2.c1 = t1.c1(+);
+------+------+
| c1   | c1   |
+------+------+
|    4 |    4 |
|    3 |    3 |
|    2 |    2 |
|    1 |    1 |
+------+------+
4 rows in set (0.00 sec)
```

## 3. Semantic Checks

- 1. It cannot be used together with ANSI joins.

```sql
greatsql> SELECT * FROM t1 LEFT JOIN t2 ON t1.c1 = t2.c1 WHERE t1.c1 = t2.c1(+);
ERROR 7526 (HY000): OuterJoin: old style outer join (+) cannot be used with ANSI joins
```

- 2. `(+)` cannot be specified on a correlation column.

```sql
greatsql> SELECT * FROM t1 WHERE t1.id = (SELECT c1 FROM t2 WHERE t2.c1  = t1.c1(+));
ERROR 7526 (HY000): OuterJoin: an outer join cannot be specified on a correlation column
```

- 3. A `(+)` column cannot be outer-joined to a subquery.

```sql
greatsql> SELECT * FROM t1 WHERE t1.c1(+) = (SELECT id FROM t2);
ERROR 7526 (HY000): OuterJoin: a column may not be outer-joined to a subquery
```

- 4. The `(+)` operator can only be applied to columns, not to arbitrary expressions. But an arbitrary expression can contain one or more columns marked with the `(+)` operator.

```sql
-- Valid
greatsql> SELECT * FROM t1, t2 WHERE t1.c1(+) + t1.c1(+) < t2.c1;

-- Valid
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 + t2.c1(+) < t1.c1;

-- Error
greatsql> SELECT * FROM t1, t2 WHERE t1.c1(+) + t2.c1(+) < t2.c1; 
ERROR 7526 (HY000): OuterJoin: a predicate may reference only one outer-joined table
```

- 5. A `WHERE` condition containing the `(+)` operator cannot be combined with other conditions using the `OR` operator.

```sql
greatsql> SELECT * FROM t1, t2 WHERE t1.c1+t2.c1(+) < t1.c1 OR t1.c1 = 5;
ERROR 7526 (HY000): OuterJoin: outer join operator (+) not allowed in operand of OR or IN

greatsql> SELECT * FROM t1, t2 WHERE t1.c1(+) in (t2.c1, t2.c1);
ERROR 7526 (HY000): OuterJoin: outer join operator (+) not allowed in operand of OR or IN

-- IN is optimized and rewritten as =
greatsql> EXPLAIN FORMAT=JSON SELECT * FROM t1, t2 WHERE t1.c1(+) in (t2.c1);
...
          "attached_condition": "<if>(is_not_null_compl(t1), (`greatsql`.`t1`.`c1` = `greatsql`.`t2`.`c1`), true)"
...
```

- 6. There are several scenarios where joining is not possible

```sql
-- Cannot join with itself
greatsql> SELECT * FROM t1 WHERE t1.c1(+) = t1.c1;
ERROR 7526 (HY000): OuterJoin: two tables cannot be outer-joined to each other

-- Repeated left and right joins between two tables
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 = t2.c1(+) AND t1.c1(+) = t2.c1;
ERROR 7526 (HY000): OuterJoin: two tables cannot be outer-joined to each other

-- First join itself, then join other tables
greatsql> SELECT * FROM t1, t2 WHERE t2.c1 + t2.c1(+) < t1.c1;
ERROR 7526 (HY000): OuterJoin: a table may be outer joined to at most one other table

-- Valid
greatsql> SELECT * FROM t1, t2 WHERE t2.c1(+) + t2.c1(+) < t1.c1;
+----+------+------+------+
| id | c1   | id   | c1   |
+----+------+------+------+
|  1 |    1 | NULL | NULL |
|  2 |    2 | NULL | NULL |
|  3 |    3 |    1 |    1 |
|  4 |    4 |    1 |    1 |
+----+------+------+------+
4 rows in set (0.00 sec)
```

- 7. A table can be joined to at most one table; it cannot be joined to multiple tables.

```sql

greatsql> SELECT * FROM t1, t2, t3 WHERE t1.c1(+) = t2.c1 AND t1.c1(+) = t3.c1;
ERROR 7526 (HY000): OuterJoin: a table may be outer joined to at most one other table

-- The other side where (+) is located involves multiple tables
-- Oracle 12c and later versions support this usage
greatsql> SELECT * FROM t1, t2, t3 WHERE t1.c1(+) = t2.c1+t3.c1;
ERROR 7526 (HY000): OuterJoin: a table may be outer joined to at most one other table
```

- 8. Projection columns, `CONNECT BY`, `ORDER BY`, etc. do not support the `(+)` operator.

```sql
greatsql> SELECT c1(+) FROM t1;
ERROR 7526 (HY000): OuterJoin: outer join operator (+) is not allowed here
```

- 9. In the following two cases, `(+)` is meaningless and will be ignored
  - a. If two tables have multiple join conditions, `(+)` must be specified for each join condition; otherwise, `(+)` is meaningless and will be ignored, equivalent to an `INNER JOIN`.
  - b. When the tables joined by `(+)` are in an outer query and an inner query respectively, for example: `SELECT * FROM t1 WHERE t1.c1 = (SELECT a FROM t2 WHERE t2.c1(+) = t1.c1);`.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
