# 窗口函数
---

## 简介

窗口函数（Window Functions）是用于在数据分析和处理时非常有用的高级功能。窗口函数可以对一组记录进行计算，并在结果集中保留原有的记录行。不同于聚合函数，窗口函数不会将多行合并成一行，而是为每一行计算出一个值。

窗口函数主要的应用场景是统计分析，例如对查询结果进行分组、排序和聚合，通过各个函数的组合，可以实现各种复杂的逻辑。有了窗口函数，就不再需要用复杂的子查询、JOIN 等方式构建统计逻辑，SQL 开发的便利性和性能好很多。


## 窗口函数的使用方式

窗口函数的基本语法格式如下：

```sql
<窗口函数> OVER (
    [PARTITION BY <分区列>] 
    [ORDER BY <排序列>] 
    [ROWS/RANGE BETWEEN <窗口范围>]
)
```

其中

- `OVER()` 用于定义窗口函数的子句，它必须结合其他的函数才有意义，比如求和、求平均值。它只用于指定要计算的数据范围和排序方式。`OVER()` 可搭配的函数有以下几类：
  - **聚合函数**：`MAX(), MIN(), COUNT(), SUM()` 等，用于生成每个分区的聚合结果。
  - **排序相关**：`ROW_NUMBER(), RANK(), DENSE_RANK()` 等，用于生成每个分区的行号或排名。
  - **窗口函数**：`LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE()` 等，用于基于窗口生成结果。

- `PARTITION BY` 用于指定分区字段（类似于 `GROUP BY` 分组），对不同分区进行分析计算，分区其实就列，可以指定一个列，也可以指定多个列。
- `ORDER BY` 用于对分区内记录进行排序，排序后可以与「范围和滚动窗口」一起使用。
- `范围和滚动窗口` 用于指定分析函数的窗口，包括范围和滚动窗口。
- `滚动窗口(Row window)` 使用了基于当前行的滚动窗口。

## 常见的窗口函数

常用的窗口函数主要有以下几类：

- 序号函数
  - **ROW_NUMBER()**：为结果集中的每行记录分配相应的行号。
  - **RANK()**：为结果集中的每行记录分配排名，遇到并列排名时会跳过后续排名。
  - **DENSE_RANK()**：类似于 RANK()，但不会跳过排名。

- 分布函数
  - **PERCENT_RANK()**：
  - **CUME_DIST()**：

- 前后函数
  - **LAG()**：返回当前行之前第 N 行的值。
  - **LEAD()**：返回当前行之后第 N 行的值。

- 头尾函数
  - **FIRST_VALUE()**：返回窗口中的第一个值。
  - **LAST_VALUE()**：返回窗口中的最后一个值。

- 其他函数
  - **NTILE(n)**：将结果集分为 n 个部分，并为每一部分分配一个唯一的组号。
  - **NTH_VALUE()**：

## 示例

以下是几个使用窗口函数的示例。

### 查询员工薪资排名

已知员工表 `emp`，要求查询每个部门中薪资最高的前 3 名员工：

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

上面这种写法显然看着有点费劲，一不小心还容易写错，改成用下面的窗口函数写法更简单易懂：

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
甚至还支持在查询得到结果时，还能同时显示薪资排序名次。

此外，还注意到两个查询 SQL 语句的耗时对比非常明显：0.21 vs 0.00 秒。可见使用窗口函数对分析查询性能提升作用很大。

下面是两个查询 SQL 相应的 Status 状态值对比：

```
greatsql> FLUSH STATUS;
greatsql> -- 执行第一条查询SQL
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
greatsql> -- 执行第二条（使用了窗口函数的）查询SQL
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

下面是两个查询 SQL 相应的执行计划对比：

```sql
-- 第一条查询SQL
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

-- 第二条查询SQL
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

### 查询学生成绩排名

学生成绩表 `scores`，表结构及数据如下

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

- 需求1：查询各科的学生成绩排名，并分别取前 3 名

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

- 需求2：查询各科成绩超过平均分的学生

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

## 注意事项

窗口函数目前存在以下几个约束条件：

- 只支持 SELECT 查询请求，不支持 UPDATE/DELETE 等请求。
- 不支持 DISTINCT 聚合。
- 不支持嵌套窗口函数。

窗口函数为数据分析提供了强大的工具，能够简化复杂查询并提高数据处理效率。

更多窗口函数的使用方法请参考文档：[Window Functions](https://dev.mysql.com/doc/refman/8.0/en/window-functions.html)。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
