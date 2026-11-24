# Window Functions
---

## Introduction

Window functions are advanced features that are very useful in data analysis and processing. A window function performs calculations on a set of records and keeps the original rows in the result set. Unlike aggregate functions, a window function does not merge multiple rows into one row; instead, it calculates a value for each row.

The main use case of window functions is statistical analysis, such as grouping, sorting, and aggregating query results. By combining various functions, all kinds of complex logic can be implemented. With window functions, there is no need to build statistical logic with complex subqueries or JOINs, which makes SQL development much more convenient and performs much better.


## How to Use Window Functions

The basic syntax of a window function is as follows:

```sql
<window function> OVER (
    [PARTITION BY <partition columns>] 
    [ORDER BY <sort columns>] 
    [ROWS/RANGE BETWEEN <window frame>]
)
```

Where:

- `OVER()` is the clause that defines the window function. It is only meaningful when combined with other functions, such as summing or averaging. It is used only to specify the data range to be calculated and the sorting method. The functions that `OVER()` can be used with fall into the following categories:
  - **Aggregate functions**: `MAX(), MIN(), COUNT(), SUM()`, and so on, used to generate the aggregate result of each partition.
  - **Ranking-related functions**: `ROW_NUMBER(), RANK(), DENSE_RANK()`, and so on, used to generate the row number or rank of each partition.
  - **Window functions**: `LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE()`, and so on, used to generate results based on the window.

- `PARTITION BY` is used to specify the partition columns (similar to `GROUP BY` grouping) so that analysis and calculation are performed on different partitions. A partition is actually a column: you can specify one column or multiple columns.
- `ORDER BY` is used to sort the records within a partition; after sorting, it can be used together with the "frame and rolling window".
- The "frame and rolling window" is used to specify the window of the analysis function, including the frame and the rolling window.
- The rolling window (row window) uses a rolling window based on the current row.

## Common Window Functions

The commonly used window functions mainly fall into the following categories:

- Numbering functions
  - **ROW_NUMBER()**: assigns a row number to each row in the result set.
  - **RANK()**: assigns a rank to each row in the result set; when ties occur, the subsequent ranks are skipped.
  - **DENSE_RANK()**: similar to RANK(), but does not skip ranks.

- Distribution functions
  - **PERCENT_RANK()**:
  - **CUME_DIST()**:

- Offset functions
  - **LAG()**: returns the value of the Nth row before the current row.
  - **LEAD()**: returns the value of the Nth row after the current row.

- Head and tail functions
  - **FIRST_VALUE()**: returns the first value in the window.
  - **LAST_VALUE()**: returns the last value in the window.

- Other functions
  - **NTILE(n)**: divides the result set into n parts and assigns a unique group number to each part.
  - **NTH_VALUE()**:

## Examples

The following are several examples of using window functions.

### Querying Employee Salary Rankings

Given the employee table `emp`, query the top 3 employees with the highest salary in each department:

```sql
greatsql> USE employees;
greatsql> SHOW CREATE TABLE emp\G
*************************** 1. row ***************************
       Table: emp
Create Table: CREATE TABLE `emp` (
  `emp_no` int NOT NULL,
  `dept_no` char(4) NOT NULL,
  `birth_date` date NOT NULL,
  `emp_name` varchar(14) NOT NULL,
  `gender` enum('M','F') NOT NULL,
  `hire_date` date NOT NULL,
  `salary` int NOT NULL,
  PRIMARY KEY (`emp_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SELECT dept_no, emp_no, emp_name, salary FROM emp e1 WHERE 
          ( SELECT COUNT(1) FROM emp e2 WHERE
	    e1.dept_no = e2.dept_no AND e1.salary < e2.salary
	  ) < 3
	  ORDER BY dept_no ASC, salary DESC;
+---------+--------+------------+--------+
| dept_no | emp_no | emp_name   | salary |
+---------+--------+------------+--------+
| d001    |  10941 | Katsuyuki  |  10180 |
| d001    |  10208 | Xiping     |   9110 |
| d001    |  10259 | Susanna    |   9006 |
...
| d009    |  10580 | Christoper |  10199 |
| d009    |  10601 | Barton     |  10135 |
| d009    |  10231 | Shaowen    |  10102 |
+---------+--------+------------+--------+
27 rows in set (0.21 sec)
```

The above approach is rather cumbersome. By comparison, the window function approach below is simpler and easier to understand:

```sql
greatsql> SELECT * FROM (
	    SELECT dept_no, emp_no, emp_name, salary, RANK()
	      OVER (PARTITION BY dept_no ORDER BY dept_no ASC, salary DESC) rnk
	    FROM emp 
	  ) emp_with_rnk WHERE rnk <= 3;
+---------+--------+------------+--------+-----+
| dept_no | emp_no | emp_name   | salary | rnk |
+---------+--------+------------+--------+-----+
| d001    |  10941 | Katsuyuki  |  10180 |   1 |
| d001    |  10208 | Xiping     |   9110 |   2 |
| d001    |  10259 | Susanna    |   9006 |   3 |
...
| d009    |  10580 | Christoper |  10199 |   1 |
| d009    |  10601 | Barton     |  10135 |   2 |
| d009    |  10231 | Shaowen    |  10102 |   3 |
+---------+--------+------------+--------+-----+
27 rows in set (0.00 sec)
```
It even supports displaying the salary ranking at the same time as the query result.

In addition, note that the time consumed by the two query statements differs significantly: 0.21 vs 0.00 seconds. Clearly, using window functions greatly improves the performance of analytical queries.

The following is a comparison of the corresponding Status values of the two queries:

```sql
greatsql> FLUSH STATUS;

-- Execute the first query statement
greatsql> SHOW STATUS LIKE 'Handler_read_%';
+----------------------------+---------+
| Variable_name              | Value   |
+----------------------------+---------+
| Handler_read_first         | 1001    |
| Handler_read_key           | 1001    |
| Handler_read_last          | 0       |
| Handler_read_next          | 0       |
| Handler_read_prev          | 0       |
| Handler_read_rnd           | 0       |
| Handler_read_rnd_next      | 1002001 |
+----------------------------+---------+

greatsql> FLUSH STATUS;

-- Execute the second query statement (which uses a window function)
greatsql> SHOW STATUS LIKE 'Handler_read_%';
+----------------------------+-------+
| Variable_name              | Value |
+----------------------------+-------+
| Handler_read_first         | 1     |
| Handler_read_key           | 1     |
| Handler_read_last          | 0     |
| Handler_read_next          | 0     |
| Handler_read_prev          | 0     |
| Handler_read_rnd           | 0     |
| Handler_read_rnd_next      | 2002  |
+----------------------------+-------+
```

The following is a comparison of the execution plans of the two queries:

```sql
-- The first query statement
greatsql> EXPLAIN SELECT ...
+----+--------------------+-------+------------+------+---------------+------+---------+------+------+----------+-----------------------------+
| id | select_type        | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                       |
+----+--------------------+-------+------------+------+---------------+------+---------+------+------+----------+-----------------------------+
|  1 | PRIMARY            | e1    | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | Using where; Using filesort |
|  2 | DEPENDENT SUBQUERY | e2    | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |     3.33 | Using where                 |
+----+--------------------+-------+------------+------+---------------+------+---------+------+------+----------+-----------------------------+

greatsql> EXPLAIN ANALYZE SELECT ...
*************************** 1. row ***************************
EXPLAIN: -> Sort: e1.dept_no, e1.salary DESC  (cost=104.06 rows=1000) (actual time=247.106..247.108 rows=27 loops=1)
    -> Filter: (3 > (select #2))  (cost=104.06 rows=1000) (actual time=1.309..247.085 rows=27 loops=1)
        -> Table scan on e1  (cost=104.06 rows=1000) (actual time=0.028..0.254 rows=1000 loops=1)
        -> Select #2 (subquery in condition; dependent)
            -> Aggregate: count(1)  (cost=10.73 rows=1) (actual time=0.246..0.246 rows=1 loops=1000)
                -> Filter: ((e1.dept_no = e2.dept_no) and (e1.salary < e2.salary))  (cost=7.40 rows=33) (actual time=0.019..0.243 rows=90 loops=1000)
                    -> Table scan on e2  (cost=7.40 rows=1000) (actual time=0.010..0.152 rows=1000 loops=1000)

1 row in set, 2 warnings (0.25 sec)

-- The second query statement
greatsql> EXPLAIN SELECT ...
+----+-------------+------------+------------+------+---------------+------+---------+------+------+----------+----------------+
| id | select_type | table      | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra          |
+----+-------------+------------+------------+------+---------------+------+---------+------+------+----------+----------------+
|  1 | PRIMARY     | <derived2> | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |    33.33 | Using where    |
|  2 | DERIVED     | emp        | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | Using filesort |
+----+-------------+------------+------------+------+---------------+------+---------+------+------+----------+----------------+

greatsql> EXPLAIN ANALYZE SELECT ...
*************************** 1. row ***************************
EXPLAIN: -> Filter: (emp_with_rnk.rnk <= 3)  (cost=0.35..115.00 rows=333) (actual time=1.054..1.159 rows=27 loops=1)
    -> Table scan on emp_with_rnk  (cost=2.50..2.50 rows=0) (actual time=1.053..1.129 rows=1000 loops=1)
        -> Materialize  (cost=0.00..0.00 rows=0) (actual time=1.052..1.052 rows=1000 loops=1)
            -> Window aggregate: rank() OVER (PARTITION BY emp.dept_no ORDER BY emp.dept_no,emp.salary desc )   (actual time=0.533..0.871 rows=1000 loops=1)
                -> Sort: emp.dept_no, emp.dept_no, emp.salary DESC  (cost=104.06 rows=1000) (actual time=0.527..0.574 rows=1000 loops=1)
                    -> Table scan on emp  (cost=104.06 rows=1000) (actual time=0.028..0.222 rows=1000 loops=1)

1 row in set (0.00 sec)
```

### Querying Student Score Rankings

The student score table `scores` and its structure and data are as follows:

```sql
greatsql> SHOW CREATE TABLE scores\G
*************************** 1. row ***************************
       Table: scores
Create Table: CREATE TABLE `scores` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `stu_name` varchar(10) NOT NULL,
  `cour_name` varchar(20) NOT NULL COMMENT '课程名',
  `score` int NOT NULL COMMENT '分数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SELECT * FROM scores;
+----+------------+-----------+-------+
| id | stu_name   | cour_name | score |
+----+------------+-----------+-------+
|  1 | Li Hua     | Math      |    73 |
|  2 | Li Hua     | English   |    33 |
|  3 | Li Hua     | Physics   |    46 |
|  4 | Sun Lei    | Math      |    31 |
|  5 | Sun Lei    | English   |    18 |
|  6 | Sun Lei    | Physics   |    95 |
|  7 | Zhang Ping | Math      |    21 |
|  8 | Zhang Ping | English   |    19 |
|  9 | Zhang Ping | Physics   |    34 |
| 10 | Liu Fu     | Math      |    11 |
| 11 | Liu Fu     | English   |    55 |
| 12 | Liu Fu     | Physics   |    41 |
| 13 | Zhao Wu    | Math      |    42 |
| 14 | Zhao Wu    | English   |    85 |
| 15 | Zhao Wu    | Physics   |   100 |
| 16 | Qian Bin   | Math      |    45 |
| 17 | Qian Bin   | English   |    23 |
| 18 | Qian Bin   | Physics   |    82 |
+----+------------+-----------+-------+
```

- Requirement 1: query the score ranking of the students in each subject and take the top 3 of each subject

```sql
greatsql> SELECT * FROM (
	  SELECT stu_name, cour_name, score, RANK()
	  OVER (
            PARTITION BY cour_name ORDER BY score DESC) as rnk
	  FROM scores ) s WHERE rnk <= 3;
+----------+-----------+-------+-----+
| stu_name | cour_name | score | rnk |
+----------+-----------+-------+-----+
| Zhao Wu  | English   |    85 |   1 |
| Liu Fu   | English   |    55 |   2 |
| Li Hua   | English   |    33 |   3 |
| Li Hua   | Math      |    73 |   1 |
| Qian Bin | Math      |    45 |   2 |
| Zhao Wu  | Math      |    42 |   3 |
| Zhao Wu  | Physics   |   100 |   1 |
| Sun Lei  | Physics   |    95 |   2 |
| Qian Bin | Physics   |    82 |   3 |
+----------+-----------+-------+-----+
```

- Requirement 2: query the students whose score in each subject is higher than the average score of that subject

```sql
greatsql> SELECT * FROM (
	  SELECT stu_name, cour_name, score, AVG(score)
	  OVER (
	    PARTITION BY cour_name) AS avg_score FROM scores
	  ) s WHERE score >= avg_score
	  ORDER BY cour_name ASC, score DESC;
+----------+-----------+-------+-----------+
| stu_name | cour_name | score | avg_score |
+----------+-----------+-------+-----------+
| Zhao Wu  | English   |    85 |   38.8333 |
| Liu Fu   | English   |    55 |   38.8333 |
| Li Hua   | Math      |    73 |   37.1667 |
| Qian Bin | Math      |    45 |   37.1667 |
| Zhao Wu  | Math      |    42 |   37.1667 |
| Zhao Wu  | Physics   |   100 |   66.3333 |
| Sun Lei  | Physics   |    95 |   66.3333 |
| Qian Bin | Physics   |    82 |   66.3333 |
+----------+-----------+-------+-----------+
```

## Notes

Window functions currently have the following constraints:

- Only SELECT query requests are supported; UPDATE/DELETE and other requests are not supported.
- DISTINCT aggregation is not supported.
- Nested window functions are not supported.

Window functions provide powerful tools for data analysis, simplifying complex queries and improving data processing efficiency.

For more information about window functions, see [Window Functions](https://dev.mysql.com/doc/refman/8.0/en/window-functions.html).

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
