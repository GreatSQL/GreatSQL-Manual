# Oracle Compatibility - Syntax - FULL JOIN
---

## 1. Syntax

GreatSQL supports **full join** (`FULL JOIN`). Except that the `USING()` syntax is currently not supported, `FULL JOIN` is used in exactly the same way as the existing `LEFT/RIGHT JOIN`.

`FULL OUTER JOIN` is equivalent to `FULL JOIN`.

The reference syntax is as follows:

```sql
table_references:
    escaped_table_reference [, escaped_table_reference] ...

escaped_table_reference: {
    table_reference
  | { OJ table_reference }
}

table_reference: {
    table_factor
  | joined_table
}

...

joined_table: {
  | table_reference {LEFT|RIGHT} [OUTER] JOIN table_reference join_specification
  | table_reference NATURAL [INNER | {LEFT|RIGHT} [OUTER]] JOIN table_factor
  | table_reference FULL [OUTER] JOIN table_reference ON search_condition
}

join_specification: {
    ON search_condition
  | USING (join_column_list)
}
```

## 2. Oracle Compatibility Notes

- 1. The `USING()` syntax is not supported

```
greatsql> SELECT * FROM t1 FULL JOIN t2 USING(c1);
ERROR 1235 (42000): This version of MySQL doesn't yet support 'FULL JOIN with USING clause'
```

- 2. Using it together with the outer join sign `(+)` is not supported

```
greatsql> SELECT * FROM t1 FULL JOIN t2 ON t1.c1=t2.c1(+);
ERROR 1235 (42000): This version of MySQL doesn't yet support 'Full join used together with outer join sign '(+)''
```

## 3. Examples

```sql
-- Create the test tables and initialize data
greatsql> CREATE TABLE t1(c1 INT, c2 VARCHAR(10));
greatsql> CREATE TABLE t2(c1 INT, c2 VARCHAR(10));
greatsql> CREATE TABLE t3(c1 INT, c2 VARCHAR(10));

greatsql> INSERT INTO t1 VALUES(1, 't1_row1'), (2, 't1_row2');
greatsql> INSERT INTO t2 VALUES(1, 't2_row1'), (3, 't2_row3'), (4, 't2_row4');
greatsql> INSERT INTO t3 VALUES(3, 't3_row3');

greatsql> SELECT * FROM t1 FULL JOIN t2 ON t1.c1=t2.c1;
+------+---------+------+---------+
| c1   | c2      | c1   | c2      |
+------+---------+------+---------+
|    1 | t1_row1 |    1 | t2_row1 |
|    2 | t1_row2 | NULL | NULL    |
| NULL | NULL    |    3 | t2_row3 |
| NULL | NULL    |    4 | t2_row4 |
+------+---------+------+---------+

greatsql> SELECT * FROM t1 FULL JOIN (t2 FULL JOIN t3 ON t2.c1=t3.c1) ON t1.c1=t2.c1;
+------+---------+------+---------+------+---------+
| c1   | c2      | c1   | c2      | c1   | c2      |
+------+---------+------+---------+------+---------+
|    1 | t1_row1 |    1 | t2_row1 | NULL | NULL    |
|    2 | t1_row2 | NULL | NULL    | NULL | NULL    |
| NULL | NULL    |    3 | t2_row3 |    3 | t3_row3 |
| NULL | NULL    |    4 | t2_row4 | NULL | NULL    |
+------+---------+------+---------+------+---------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
