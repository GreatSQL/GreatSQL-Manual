# Oracle兼容-语法-KEEP FIRST/LAST
---


## 1. 语法

```sql
aggregate_function KEEP(dense_rank FIRST/LAST ORDER BY order_clause)
[ OVER( [ query_partion_clause ] ) ]

aggregate_function:
    [MIN | MAX | SUM | AVG | COUNT | VARIANCE | VAR_POP | STDDEV | STD | STDDEV_POP]
```
其中，`variance` 和 `var_pop` 是同义词，`stddev`、`std`、`stddev_pop` 三个也是同义词。

## 2. 定义和用法

`KEEP FIRST/LAST`二者都是聚合函数和分析函数，它们对一组行中的一组值进行操作，这些行相对于给定的排序规范排名为第一或最后。如果只有一行列为FIRST或LAST，则聚合仅对具有一个元素的集合进行操作。


## 3. 示例

```sql
greatsql> CREATE TABLE t1 (
 id INT,
 dept_id INT,
 age INT,
 name varchar(64),
 salary INT,
 PRIMARY KEY(id)
);

greatsql> INSERT INTO t1 VALUES
(1, 1, 22, 'emp1', 8000),
(2, 1, 30, 'emp2', 7000),
(3, 1, 27, 'emp3', 9000),
(4, 1, 25, 'emp4', 6000),
(5, 1, 22, 'emp5', 5000),
(6, 1, 30, 'emp6', 12000),
(7, 1, 30, 'emp7', 9000),
(101, 2, 27, 'emp101', 8000),
(102, 2, 24, 'emp102', 5000),
(103, 2, 24, 'emp103', 6000),
(104, 2, 26, 'emp104', 6000),
(105, 2, 27, 'emp105', 6000),
(106, 2, 25, 'emp106', 3000),
(201, 3, 28, 'emp201', 8000),
(301, 4, 26, 'emp301', 9000),
(302, 4, 29, 'emp302', 7000);

greatsql> SELECT id, dept_id, age, salary, 
  SUM(salary) KEEP(DENSE_RANK FIRST ORDER BY age)
  OVER(PARTITION BY dept_id) aggrsalary FROM t1;
+-----+---------+------+--------+------------+
| id  | dept_id | age  | salary | aggrsalary |
+-----+---------+------+--------+------------+
|   1 |       1 |   22 |   8000 |      13000 |
|   5 |       1 |   22 |   5000 |      13000 |
|   4 |       1 |   25 |   6000 |      13000 |
|   3 |       1 |   27 |   9000 |      13000 |
|   2 |       1 |   30 |   7000 |      13000 |
|   6 |       1 |   30 |  12000 |      13000 |
|   7 |       1 |   30 |   9000 |      13000 |
| 102 |       2 |   24 |   5000 |      11000 |
| 103 |       2 |   24 |   6000 |      11000 |
| 106 |       2 |   25 |   3000 |      11000 |
| 104 |       2 |   26 |   6000 |      11000 |
| 101 |       2 |   27 |   8000 |      11000 |
| 105 |       2 |   27 |   6000 |      11000 |
| 201 |       3 |   28 |   8000 |       8000 |
| 301 |       4 |   26 |   9000 |       9000 |
| 302 |       4 |   29 |   7000 |       9000 |
+-----+---------+------+--------+------------+
16 rows in set (0.01 sec)

greatsql> SELECT id, dept_id, age, salary, 
  SUM(salary) KEEP(DENSE_RANK LAST ORDER BY age DESC) 
  OVER(PARTITION BY dept_id) aggrsalary FROM t1;
+-----+---------+------+--------+------------+
| id  | dept_id | age  | salary | aggrsalary |
+-----+---------+------+--------+------------+
|   2 |       1 |   30 |   7000 |      13000 |
|   6 |       1 |   30 |  12000 |      13000 |
|   7 |       1 |   30 |   9000 |      13000 |
|   3 |       1 |   27 |   9000 |      13000 |
|   4 |       1 |   25 |   6000 |      13000 |
|   1 |       1 |   22 |   8000 |      13000 |
|   5 |       1 |   22 |   5000 |      13000 |
| 101 |       2 |   27 |   8000 |      11000 |
| 105 |       2 |   27 |   6000 |      11000 |
| 104 |       2 |   26 |   6000 |      11000 |
| 106 |       2 |   25 |   3000 |      11000 |
| 102 |       2 |   24 |   5000 |      11000 |
| 103 |       2 |   24 |   6000 |      11000 |
| 201 |       3 |   28 |   8000 |       8000 |
| 302 |       4 |   29 |   7000 |       9000 |
| 301 |       4 |   26 |   9000 |       9000 |
+-----+---------+------+--------+------------+
16 rows in set (0.00 sec)

greatsql> SELECT dept_id, SUM(salary) KEEP(DENSE_RANK FIRST ORDER BY age) FROM t1 GROUP BY dept_id;
+---------+-------------------------------------------------+
| dept_id | SUM(salary) KEEP(DENSE_RANK FIRST ORDER BY age) |
+---------+-------------------------------------------------+
|       1 |                                           13000 |
|       2 |                                           11000 |
|       3 |                                            8000 |
|       4 |                                            9000 |
+---------+-------------------------------------------------+
4 rows in set (0.01 sec)
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
