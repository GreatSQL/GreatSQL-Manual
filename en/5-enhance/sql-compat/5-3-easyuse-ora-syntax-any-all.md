# Oracle Compatibility - Syntax - ANY/ALL
---

## 1. Syntax

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

## 2. Definition and Usage

GreatSQL supports the `ANY/ALL` syntax to compare multiple expressions.

`ANY/ALL` is implemented by means of equivalent conversion.

| operator | conversion |
| ---- | ---- |
| x = ANY(a,b,c) | x IN(a,b,c) |
| x != ANY(a,b,c) | x != a OR x != b OR x != c |
| x < ANY(a,b,c) | x <= GREATEST(a,b,c) |
| x <= ANY(a,b,c) | x <= GREATEST(a,b,c) |
| x > ANY(a,b,c) | x > LEAST(a,b,c) |
| x >= ANY(a,b,c) | x >= LEAST(a,b,c) |
| x = ALL(a,b,c) | x = a AND x = b AND x= c |
| x != ALL(a,b,c) | x NOT IN(a,b,c) |
| x < ALL(a,b,c) | x < LEAST(a,b,c) |
| x <= ALL(a,b,c) | x <= LEAST(a,b,c) |
| x > ALL(a,b,c) | x > GREATEST(a,b,c) |
| x >= ALL(a,b,c) | x >= GREATEST(a,b,c) |

## 3. Oracle Compatibility Notes

GreatSQL natively supports comparison of the `ROW` type. Since `IN` and `NOT IN` support expression lookups, `= ANY` and `!= ANY` are also supported.

Other expressions are consistent with Oracle and are not supported either.

## 4. Examples

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

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
