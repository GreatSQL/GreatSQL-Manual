# Oracle兼容-语法-PIVOT
---


`PIVOT` 语法可以将查询以交叉表的形式显示，与一般查询相比，交叉表具有更多的列和较少的行。

## 1. 语法

```sql
SELECT ... 
  select_expr [, select_expr] ...
  ...
  [FROM table_references
      [PARTITION partition_list] [pivot_clause]]
  [WHERE where_condition]
  ...

pivot_clause:
  PIVOT
    ( aggregate_function ( expr ) [[AS] alias ]
        [, aggregate_function ( expr ) [[AS] alias ] ]...
      pivot_for_clause
      pivot_in_clause
    )

pivot_for_clause:
  FOR { column
      | ( column [, column]... )
      } 

pivot_in_clause:
  IN ({
        { expr | ( expr [, expr]... ) } [ [ AS] alias]
      }...
    )
```

## 2. 定义和用法

1. `pivot_clause` 定义了查询将在哪些字段上聚合数据。
2. `pivot_for_clause` 定义了哪些列将被分组，然后交叉聚合。
3. `pivot_in_clause` 用于过滤 `pivot_for_clause` 中列的值，子句中的每个值都将是一个单独的列，子句中使用的表达式只能是常量表达式。
4. `pivot_for_clause` 和 `pivot_in_clause` 没有使用到的列都将作为隐式分组的字段。
5. `select_expr` 只能使用隐式分组用到的字段以及 `pivot_in_clause` 中交叉聚合后生成的列。
6. 可以有多个 `aggregate_function`，但只允许有一个 `aggregate_function` 不指定别名，且 `aggregate_function` 不支持 `GROUP_CONCAT()` 和 `WM_CONCAT()` 函数。

## 3. Oracle兼容说明

- 不支持 `XML with ANY` 和 `XML with Subquery` 语法

```sql
greatsql> CREATE TABLE t1(a INT, b INT, c INT);
greatsql> CREATE TABLE t2(a INT, b INT, c INT);
greatsql> SELECT * FROM t1 PIVOT XML (SUM(c) FOR a IN(ANY));
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'XML (SUM(c) FOR a IN(ANY))' at line 1

greatsql> SELECT * FROM t1 PIVOT XML (SUM(c) FOR a IN(SELECT a FROM t2));
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'XML (SUM(c) FOR a IN(SELECT a FROM t2))' at line 1
```

- 不支持 `table_references` 中的表结果有同名的列

```sql
-- 执行本示例需要先切换sql_mode = ORACLE，否则会报告语法错误，其他示例不受影响
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t1(a INT, b INT, c INT);
greatsql> CREATE TABLE t2(a INT, b INT, c INT);
greatsql> SELECT * FROM t1 JOIN t2 USING(a, c) PIVOT(SUM(c) FOR (a) IN(1, 2, 3, 4, 5 ,6)); 
ERROR 1060 (42S21): Duplicate column name 'b'
```

## 4. 示例

```sql
-- 初始化测试数据
greatsql> CREATE TABLE t1(a INT, b INT, c INT);
greatsql> INSERT INTO t1 VALUES (1, 1, 1) (2, 1, 2), (3, 2, 1), (4, 2, 2), (5, 3, 1), (6, 3, 2);

greatsql> SELECT * FROM t1 PIVOT(SUM(c) FOR(a) IN(1, 2, 3, 4, 5, 6)) ORDER BY b;
+------+------+------+------+------+------+------+
| b    | 1    | 2    | 3    | 4    | 5    | 6    |
+------+------+------+------+------+------+------+
|    1 |    1 |    2 | NULL | NULL | NULL | NULL |
|    2 | NULL | NULL |    1 |    2 | NULL | NULL |
|    3 | NULL | NULL | NULL | NULL |    1 |    2 |
+------+------+------+------+------+------+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 PIVOT(SUM(c) FOR(a) IN(1 AS I, 2 AS II, 3 AS III, 4 AS IV, 5 AS V, 6 AS VI)) ORDER BY b;
+------+------+------+------+------+------+------+
| b    | I    | II   | III  | IV   | V    | VI   |
+------+------+------+------+------+------+------+
|    1 |    1 |    2 | NULL | NULL | NULL | NULL |
|    2 | NULL | NULL |    1 |    2 | NULL | NULL |
|    3 | NULL | NULL | NULL | NULL |    1 |    2 |
+------+------+------+------+------+------+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 PIVOT(SUM(c) AS TOTAL FOR(a) IN(1 AS I, 2 AS II, 3 AS III, 4 AS IV, 5 AS V, 6 AS VI)) ORDER BY b;
+------+---------+----------+-----------+----------+---------+----------+
| b    | I_TOTAL | II_TOTAL | III_TOTAL | IV_TOTAL | V_TOTAL | VI_TOTAL |
+------+---------+----------+-----------+----------+---------+----------+
|    1 |       1 |        2 |      NULL |     NULL |    NULL |     NULL |
|    2 |    NULL |     NULL |         1 |        2 |    NULL |     NULL |
|    3 |    NULL |     NULL |      NULL |     NULL |       1 |        2 |
+------+---------+----------+-----------+----------+---------+----------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 PIVOT(SUM(c) AS TOTAL, count(c) FOR(a) IN(1 AS I, 2 AS II, 3 AS III, 4 AS IV, 5 AS V, 6 AS VI)) ORDER BY b;
+------+---------+---+----------+----+-----------+-----+----------+----+---------+---+----------+----+
| b    | I_TOTAL | I | II_TOTAL | II | III_TOTAL | III | IV_TOTAL | IV | V_TOTAL | V | VI_TOTAL | VI |
+------+---------+---+----------+----+-----------+-----+----------+----+---------+---+----------+----+
|    1 |       1 | 1 |        2 |  1 |      NULL |   0 |     NULL |  0 |    NULL | 0 |     NULL |  0 |
|    2 |    NULL | 0 |     NULL |  0 |         1 |   1 |        2 |  1 |    NULL | 0 |     NULL |  0 |
|    3 |    NULL | 0 |     NULL |  0 |      NULL |   0 |     NULL |  0 |       1 | 1 |        2 |  1 |
+------+---------+---+----------+----+-----------+-----+----------+----+---------+---+----------+----+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 PIVOT(SUM(c) AS TOTAL, count(c) AS NUM FOR(a) IN(1 AS I, 2 AS II, 3 AS III, 4 AS IV, 5 AS V, 6 AS VI)) ORDER BY b;
+------+---------+-------+----------+--------+-----------+---------+----------+--------+---------+-------+----------+--------+
| b    | I_TOTAL | I_NUM | II_TOTAL | II_NUM | III_TOTAL | III_NUM | IV_TOTAL | IV_NUM | V_TOTAL | V_NUM | VI_TOTAL | VI_NUM |
+------+---------+-------+----------+--------+-----------+---------+----------+--------+---------+-------+----------+--------+
|    1 |       1 |     1 |        2 |      1 |      NULL |       0 |     NULL |      0 |    NULL |     0 |     NULL |      0 |
|    2 |    NULL |     0 |     NULL |      0 |         1 |       1 |        2 |      1 |    NULL |     0 |     NULL |      0 |
|    3 |    NULL |     0 |     NULL |      0 |      NULL |       0 |     NULL |      0 |       1 |     1 |        2 |      1 |
+------+---------+-------+----------+--------+-----------+---------+----------+--------+---------+-------+----------+--------+
3 rows in set (0.00 sec)

greatsql> CREATE TABLE t2(a INT, b INT, c INT, d INT);
greatsql> INSERT INTO t2 VALUES (1, 1, 1, 1); (2, 1, 2, 2); (3, 2, 1, 1); (4, 2, 2, 2); (5, 3, 1, 1); (6, 3, 2, 2);

greatsql> SELECT * FROM t2 PIVOT(SUM(c) FOR(a, d) IN((1,1), (2,2), (3,1), (4,2), (5,1), (6,2))) ORDER BY b;
+------+------+------+------+------+------+------+
| b    | 1_1  | 2_2  | 3_1  | 4_2  | 5_1  | 6_2  |
+------+------+------+------+------+------+------+
|    1 |    1 |    2 | NULL | NULL | NULL | NULL |
|    2 | NULL | NULL |    1 |    2 | NULL | NULL |
|    3 | NULL | NULL | NULL | NULL |    1 |    2 |
+------+------+------+------+------+------+------+
3 rows in set (0.00 sec)
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
