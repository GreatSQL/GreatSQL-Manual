# Oracle Compatibility - Syntax - TABLE FUNCTION
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

TABLE(expr_list)

expr_list:
  expr, type_table_name(type_name(expr, expr..), type_name(expr, expr..) ..)
```

You need to switch to `ORACLE` mode first to support this syntax.

## 2. Definition and Usage

GreatSQL supports the usage of the TABLE function to retrieve data of a custom table type.

## 3. Examples

- 1. Example 1: `SELECT FROM TABLE()`

```sql
-- Switch to ORACLE mode first
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

- 2. Example 2: `CREATE TABLE AS ... SELECT FROM TABLE()`

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

- 3. Example 3: `INSERT INTO ... SELECT FROM TABLE()`

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

- 4. Example 4: `SELECT FROM TABLE() WHERE`

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

- 5. Example 5: `EXPLAIN SELECT FROM TABLE()`

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

## 4. Export Backup

When using `mysqldump` to export data, you can specify the `--routines` option (off by default) to export TABLE FUNCTION objects.

Example:
```
mysqldump -S/data/GreatSQL/mysql.sock -uroot -pxxx -B greatsql -d --routines > /data/backup/GreatSQL/greatsql-ddl.sql
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
