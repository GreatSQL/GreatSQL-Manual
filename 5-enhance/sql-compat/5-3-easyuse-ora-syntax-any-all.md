# Oracle兼容-语法-ANY/ALL
---
[toc]

## 1. 语法

```sql
expr  comp_op ANY/ALL ( expr,expression_list ) 

comp_op:
    =
   | !=
   | <>
   | <
   | >
   | <=
   | >= 
```

## 2. 定义和用法

GreatSQL兼容支持 `ANY/ALL` 语法对多个表达式进行比较。

`ANY/ALL` 是采用等价转换方式来实现的。

 operator | 转换 
 ----   | ---- 
 x = ANY(a,b,c)   | x IN(a,b,c) 
 x != ANY(a,b,c)   | x != a OR x != b OR x != c
 x < ANY(a,b,c) | x <= GREATEST(a,b,c)
 x <= ANY(a,b,c) | x <= GREATEST(a,b,c)
 x > ANY(a,b,c) | x > LEAST(a,b,c)
 x >= ANY(a,b,c) | x >= LEAST(a,b,c)
 x = ALL(a,b,c)   | x = a AND x = b AND x= c 
 x != ALL(a,b,c)   | x NOT IN(a,b,c)
 x < ALL(a,b,c) | x < LEAST(a,b,c)
 x <= ALL(a,b,c) | x <= LEAST(a,b,c)
 x > ALL(a,b,c) | x > GREATEST(a,b,c)
 x >= ALL(a,b,c) | x >= GREATEST(a,b,c)


## 3. Oracle兼容说明

GreatSQL原生支持`ROW`类型的比较，因为 `IN` 与 `NOT IN` 支持表达式查找，所以`= ANY`、`!= ANY` 也支持。

其他表达式和Oracle一致，都不支持。

## 4. 示例

```sql
greatsql> CREATE TABLE t1 (
uid INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
name VARCHAR(50) NOT NULL,
salary INT NOT NULL,
deptno INT NOT NULL);

greatsql> INSERT INTO t1(name, salary, deptno) VALUES ('John',5000,50),
('Jane',6000,50),
('Bob',7000,60),
('Sue',8000,70);

greatsql> SELECT * FROM t1;
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
|   2 | Jane |   6000 |     50 |
|   3 | Bob  |   7000 |     60 |
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary = ANY (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
|   2 | Jane |   6000 |     50 |
|   3 | Bob  |   7000 |     60 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary = ALL (5000, 6000, 7000);
Empty set (0.00 sec)

greatsql> SELECT * FROM t1 WHERE salary != ALL (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary != ANY (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
|   2 | Jane |   6000 |     50 |
|   3 | Bob  |   7000 |     60 |
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary < ALL (5000, 6000, 7000);
Empty set (0.00 sec)

greatsql> SELECT * FROM t1 WHERE salary < ANY (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
|   2 | Jane |   6000 |     50 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary > ALL (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary > ANY (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   2 | Jane |   6000 |     50 |
|   3 | Bob  |   7000 |     60 |
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary <= ALL (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary <= ANY (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
|   2 | Jane |   6000 |     50 |
|   3 | Bob  |   7000 |     60 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary >= ALL (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   3 | Bob  |   7000 |     60 |
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+

greatsql> SELECT * FROM t1 WHERE salary >= ANY (5000, 6000, 7000);
+-----+------+--------+--------+
| uid | name | salary | deptno |
+-----+------+--------+--------+
|   1 | John |   5000 |     50 |
|   2 | Jane |   6000 |     50 |
|   3 | Bob  |   7000 |     60 |
|   4 | Sue  |   8000 |     70 |
+-----+------+--------+--------+
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
