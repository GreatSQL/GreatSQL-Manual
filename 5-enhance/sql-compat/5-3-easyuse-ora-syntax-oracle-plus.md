# Oracle兼容-语法-Oracle(+)语法
---


## 1. 语法

```sql
-- LEFT JOIN
SELECT * FROM join_table1, join_table2 WHERE join_table1.col1 join_specification join_table2.col2(+);

-- RIGHT JOIN
SELECT * FROM join_table1, join_table2 WHERE join_table1.col1(+) join_specification join_table2.col2;
```

## 2. `(+)`语法使用示例及说明

创建测试表并填充测试数据

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

- 1. 支持多种用法。

```sql

-- `(+)` 写在被连接表一侧，表示 t1 LEFT JOIN t2
greatsql> EXPLAIN SELECT * FROM t1, t2 WHERE t1.c1 = t2.c1(+);
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | NULL                                       |
|  1 | SIMPLE      | t2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    3 |   100.00 | Using where; Using join buffer (hash join) |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
2 rows in set, 1 warning (0.00 sec)

-- 可以看到是t1 left join t2
greatsql> SHOW WARNINGS;
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`id` AS `id`,`greatsql`.`t1`.`c1` AS `c1`,`greatsql`.`t2`.`id` AS `id`,`greatsql`.`t2`.`c1` AS `c1` from `greatsql`.`t1` left join `greatsql`.`t2` on((`greatsql`.`t2`.`c1` = `greatsql`.`t1`.`c1`)) where true

-- `(+)` 写在主动连接表一侧，表示 t1 RIGHT JOIN t2
greatsql> EXPLAIN SELECT * FROM t1, t2 WHERE t1.c1 (+)= t2.c1;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
|  1 | SIMPLE      | t2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    3 |   100.00 | NULL                                       |
|  1 | SIMPLE      | t1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | Using where; Using join buffer (hash join) |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+--------------------------------------------+
2 rows in set, 1 warning (0.00 sec)

-- 可以看到是t2 left join t1
greatsql> SHOW WARNINGS;
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`id` AS `id`,`greatsql`.`t1`.`c1` AS `c1`,`greatsql`.`t2`.`id` AS `id`,`greatsql`.`t2`.`c1` AS `c1` from `greatsql`.`t2` left join `greatsql`.`t1` on((`greatsql`.`t1`.`c1` = `greatsql`.`t2`.`c1`)) where true

-- 支持多表JOIN
greatsql> CREATE TABLE t3 LIKE t1;
greatsql> INSERT INTO t3 SELECT * FROM t1;

-- 等同于 t3 left join t2 left join t1
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

-- 支持多表部分JOIN
greatsql> CREATE TABLE t4 LIKE t1;
greatsql> INSERT INTO t4 SELECT * FROM t1;

-- 等同于 (t2 left join t1) join (t3 left join t4)
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

- 2. `(+)` 只能用在单列上，不能用于表达式或者常量。

```sql
-- 错误示例，报告语法错误
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 = 0(+);
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '(+)' at line 1

greatsql> SELECT * FROM t1, t2 WHERE (t1.c1 + t2.c1)(+) = t2.id;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '(+) = t2.id' at line 1
```

- 3. `(+)` 只能用于 `WHERE` 表达式中的列，用在其它位置的列会忽略其作用。

```sql
-- 下面的示例不会按照t2.c1列排序或分组
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

## 3. 语义检查

- 1. 不能与ANSI连接同时使用。

```sql
greatsql> SELECT * FROM t1 LEFT JOIN t2 ON t1.c1 = t2.c1 WHERE t1.c1 = t2.c1(+);
ERROR 7526 (HY000): OuterJoin: old style outer join (+) cannot be used with ANSI joins
```

- 2. 不能在关联列上指定 `(+)`。

```sql
greatsql> SELECT * FROM t1 WHERE t1.id = (SELECT c1 FROM t2 WHERE t2.c1  = t1.c1(+));
ERROR 7526 (HY000): OuterJoin: an outer join cannot be specified on a correlation column
```

- 3. `(+)` 列不能外部连接到子查询上。

```sql
greatsql> SELECT * FROM t1 WHERE t1.c1(+) = (SELECT id FROM t2);
ERROR 7526 (HY000): OuterJoin: a column may not be outer-joined to a subquery
```

- 4. `(+)` 操作符只能应用于列，不能应用于任意表达式。但任意表达式可以包含一个或多个用 `(+)` 操作符标记的列。

```sql
-- 合法
greatsql> SELECT * FROM t1, t2 WHERE t1.c1(+) + t1.c1(+) < t2.c1;

-- 合法
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 + t2.c1(+) < t1.c1;

-- 报错
greatsql> SELECT * FROM t1, t2 WHERE t1.c1(+) + t2.c1(+) < t2.c1; 
ERROR 7526 (HY000): OuterJoin: a predicate may reference only one outer-joined table
```

- 5. 包含 `(+)` 操作符的 `WHERE` 条件不能与其它条件使用 `OR` 操作符组合。

```sql
greatsql> SELECT * FROM t1, t2 WHERE t1.c1+t2.c1(+) < t1.c1 OR t1.c1 = 5;
ERROR 7526 (HY000): OuterJoin: outer join operator (+) not allowed in operand of OR or IN

greatsql> SELECT * FROM t1, t2 WHERE t1.c1(+) in (t2.c1, t2.c1);
ERROR 7526 (HY000): OuterJoin: outer join operator (+) not allowed in operand of OR or IN

-- IN被优化改写为=
greatsql> EXPLAIN FORMAT=JSON SELECT * FROM t1, t2 WHERE t1.c1(+) in (t2.c1);
...
          "attached_condition": "<if>(is_not_null_compl(t1), (`greatsql`.`t1`.`c1` = `greatsql`.`t2`.`c1`), true)"
...
```

- 6. 有几种不能连接的场景

```sql
-- 不能自己与自己
greatsql> SELECT * FROM t1 WHERE t1.c1(+) = t1.c1;
ERROR 7526 (HY000): OuterJoin: two tables cannot be outer-joined to each other

-- 两表左右重复连接
greatsql> SELECT * FROM t1, t2 WHERE t1.c1 = t2.c1(+) AND t1.c1(+) = t2.c1;
ERROR 7526 (HY000): OuterJoin: two tables cannot be outer-joined to each other

-- 先自己连接自己，再连接其他表
greatsql> SELECT * FROM t1, t2 WHERE t2.c1 + t2.c1(+) < t1.c1;
ERROR 7526 (HY000): OuterJoin: a table may be outer joined to at most one other table

-- 合法
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

- 7. 一个表只能最多连接到一个表，不能连接多个表。 

```sql

greatsql> SELECT * FROM t1, t2, t3 WHERE t1.c1(+) = t2.c1 AND t1.c1(+) = t3.c1;
ERROR 7526 (HY000): OuterJoin: a table may be outer joined to at most one other table

-- (+)所在的另外一侧，涉及多个表
-- Oracle 12c以上版本支持该用法
greatsql> SELECT * FROM t1, t2, t3 WHERE t1.c1(+) = t2.c1+t3.c1;
ERROR 7526 (HY000): OuterJoin: a table may be outer joined to at most one other table
```

- 8. 投影列, `CONNECT BY`, `ORDER BY` 等不支持使用 `(+)` 运算符。

```sql
greatsql> SELECT c1(+) FROM t1;
ERROR 7526 (HY000): OuterJoin: outer join operator (+) is not allowed here
```

- 9.以下两种情况，`(+)`无意义会被可忽略
  - a. 如果两表有多个连接条件，则必须为每个关联条件指定 `(+)`，否则 `(+)` 没有意义，会被忽略，相当于`INNER JOIN`。
  - b. 当 `(+)` 关联的表一个在外查询，一个在内查询时，例如：`SELECT * FROM t1 WHERE t1.c1 = (SELECT a FROM t2 WHERE t2.c1(+) = t1.c1);`。



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
