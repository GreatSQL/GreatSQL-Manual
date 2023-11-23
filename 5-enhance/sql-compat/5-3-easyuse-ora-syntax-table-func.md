# Oracle兼容-语法-TABLE FUNCTION
---
[toc]

## 1. 语法

```sql
SET sql_mode = ORACLE;

TABLE(expr_list)

expr_list:
  expr, type_table_name(type_name(expr, expr..), type_name(expr, expr..) ..)
```

需要先切换到 `ORACLE` 模式下才能支持本语法。

## 2. 定义和用法

GreatSQL支持用TABLE函数获取自定义表类型数据的用法。

## 3. 示例


- 1. 示例1：`SELECT FROM TABLE()`

```sql
-- 先切换到ORACLE模式
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE ud_type1 AS OBJECT(id INT, c1 VARCHAR(10)); 
greatsql> CREATE OR REPLACE TYPE ud_tbl1 AS TABLE OF greatsql.ud_type1;
greatsql> CREATE OR REPLACE TYPE ud_varray1 AS VARRAY(10) OF ud_type1;

greatsql> SELECT * FROM TABLE(ud_tbl1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb')));
+------+---------+
| id   | c1      |
+------+---------+
|    1 | c1_rowa |
|    2 | c1_rowb |
+------+---------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM TABLE(ud_tbl1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb'))) a, 
  TABLE(ud_varray1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb'))) b;
+------+---------+------+---------+
| id   | c1      | id   | c1      |
+------+---------+------+---------+
|    1 | c1_rowa |    1 | c1_rowa |
|    1 | c1_rowa |    2 | c1_rowb |
|    2 | c1_rowb |    1 | c1_rowa |
|    2 | c1_rowb |    2 | c1_rowb |
+------+---------+------+---------+
4 rows in set (0.00 sec)

greatsql> CREATE TABLE ud_tbl2(id INT, c1 ud_type1);
greatsql> INSERT INTO ud_tbl2 VALUES(10, ud_type1(10, 'c1_rowa10')), (11, ud_type1(11, 'c1_rowb11'));

greatsql> SELECT a.id, a.c1 FROM ud_tbl2 b,
  TABLE(ud_tbl1(b.c1, ud_type1(1, 'c1_rowa'))) a;
+------+-----------+
| id   | c1        |
+------+-----------+
|   10 | c1_rowa10 |
|    1 | c1_rowa   |
|   11 | c1_rowb11 |
|    1 | c1_rowa   |
+------+-----------+
4 rows in set (0.00 sec)
```

- 2. 示例2：`CREATE TABLE AS ... SELECT FROM TABLE()`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE ud_type1 AS OBJECT(id INT, c1 VARCHAR(10)); 
greatsql> CREATE OR REPLACE TYPE ud_tbl1 AS TABLE OF greatsql.ud_type1;

greatsql> CREATE TABLE ud_tbl2 AS SELECT * FROM TABLE(ud_tbl1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb')));
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

greatsql> SELECT * FROM ud_tbl2;
+------+---------+
| id   | c1      |
+------+---------+
|    1 | c1_rowa |
|    2 | c1_rowb |
+------+---------+
2 rows in set (0.00 sec)
```

- 3. 示例3：`INSERT INTO ... SELECT FROM TABLE()`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE ud_type1 AS OBJECT(id INT, c1 VARCHAR(10)); 
greatsql> CREATE OR REPLACE TYPE ud_tbl1 AS TABLE OF greatsql.ud_type1;
greatsql> CREATE TABLE ud_tbl2 AS SELECT * FROM TABLE(ud_tbl1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb')));
Query OK, 2 rows affected (0.02 sec)
Records: 2  Duplicates: 0  Warnings: 0

greatsql> INSERT INTO ud_tbl2 SELECT * FROM TABLE(ud_tbl1(ud_type1(3, 'c1_rowc'), ud_type1(4, 'c1_rowd')));
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

greatsql> SELECT * FROM ud_tbl2;
+------+---------+
| id   | c1      |
+------+---------+
|    1 | c1_rowa |
|    2 | c1_rowb |
|    3 | c1_rowc |
|    4 | c1_rowd |
+------+---------+
4 rows in set (0.00 sec)
```

- 4. 示例4：`SELECT FROM TABLE() WHERE`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE ud_type1 AS OBJECT(id INT, c1 VARCHAR(10)); 
greatsql> CREATE OR REPLACE TYPE ud_tbl1 AS TABLE OF greatsql.ud_type1;

greatsql> SELECT * FROM TABLE(ud_tbl1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb'))) WHERE id>1;
+------+---------+
| id   | c1      |
+------+---------+
|    2 | c1_rowb |
+------+---------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM TABLE(ud_tbl1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb')));
+------+---------+
| id   | c1      |
+------+---------+
|    1 | c1_rowa |
|    2 | c1_rowb |
+------+---------+
2 rows in set (0.00 sec)

greatsql> CREATE OR REPLACE TYPE my_int IS VARRAY(100) OF INTEGER;
Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT * FROM TABLE(my_int('1', 0, NULL));
+--------------+
| column_value |
+--------------+
|            1 |
|            0 |
|         NULL |
+--------------+
3 rows in set (0.00 sec)
```

- 5. 示例5：`EXPLAIN SELECT FROM TABLE()`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE ud_type1 AS OBJECT(id INT, c1 VARCHAR(10)); 
greatsql> CREATE OR REPLACE TYPE ud_varray1 AS VARRAY(10) OF ud_type1;

greatsql> EXPLAIN SELECT * FROM TABLE(ud_varray1(ud_type1(1, 'c1_rowa'), ud_type1(2, 'c1_rowb')))\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: udt_table_-5015528632416731088
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 2
     filtered: 100.00
        Extra: Table function: udt_table; Using temporary

greatsql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select "greatsql"."udt_table_-5015528632416731088"."id" AS "id","greatsql"."udt_table_-5015528632416731088"."c1" AS "c1" from table(ud_varray1(ud_type1(1,'c1_rowa'),ud_type1(2,'c1_rowb'))) "udt_table_-5015528632416731088"
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
