# Oracle Compatibility - Stored Procedure - %TYPE
---


## 1. Syntax

```sql
var_name (ref_var_name | table_name.column_name | ref_rowtype)%TYPE [:= init_val]
```

## 2. Definition and Usage

GreatSQL supports using `%TYPE` to declare variable types. Using `%TYPE` makes the data type of a variable the same as that of another variable or column.

The variable types that can be applied to `%TYPE` are:

- Ordinary variables
- A column in a table
- `%ROWTYPE` types
- A column in a `%ROWTYPE` type

## 3. Oracle Compatibility Notes

In `ORACLE` mode, GreatSQL supports using `%TYPE` to declare variable types. The usage is as follows:

1. All compatible data types are supported.

2. Referencing columns of temporary tables is not supported.

3. Views (`VIEW`) are not supported, including `view%TYPE` and `view%ROWTYPE`.

4. Reusing one's own type is not supported, for example `x x%TYPE`.

## 4. Examples

Set the `sql_generate_invisible_primary_key` option because the tables created in the following examples have no explicit primary key; disabling this option avoids automatically creating the implicit primary key `my_row_id`, which might affect the following examples.
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

Create test tables and initialize data
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. Example 1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp1() AS
  v_id t1.a%TYPE;
  v_vchar VARCHAR(100) := 'varchar_type';

  v3 v_vchar%TYPE;
  v4 v3%TYPE;
BEGIN
  v_id := 1;
  v_vchar := 'v_vchar_type';
  v3 := 'v3_varchar';
  v4 := 'v4_varchar';

  SELECT v_id, v_vchar, v3, v4;
END; //

greatsql> CALL vtype_sp1() //
+------+--------------+------------+------------+
| v_id | v_vchar      | v3         | v4         |
+------+--------------+------------+------------+
|    1 | v_vchar_type | v3_varchar | v4_varchar |
+------+--------------+------------+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. Example 2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp2() AS
  CURSOR cur1 (v_a INT) IS SELECT * FROM t1 WHERE a = v_a;
  rec1 cur1%ROWTYPE;
  rec2 rec1%TYPE;
BEGIN
  FOR rec2 IN cur1(1)
  LOOP
    SELECT rec2.b;
  END LOOP;
END; //

greatsql> CALL vtype_sp2() //
+--------+
| rec2.b |
+--------+
| row1   |
+--------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> DECLARE
  rec t1.a%TYPE;
BEGIN
  rec := ROUND(RAND()*10240);

  SELECT rec;
END; //
+------+
| rec  |
+------+
| 8473 |
+------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

- 4. Example 4

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(a INT, b VARCHAR(20));
greatsql> CREATE TABLE udt_t1(a INT, b udt1);
greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1'));
greatsql> INSERT INTO udt_t1 VALUES(2, udt1(2, 'c1_row2'));
greatsql> INSERT INTO udt_t1 VALUES(3, udt1(3, 'c1_row3'));

greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp3() AS
  vt1 udt_t1.b%TYPE;
  vt2 udt1;
BEGIN
  SELECT b INTO vt1 FROM udt_t1 WHERE a = 2;
  SELECT vt1.a, vt1.b;

  SELECT b INTO vt2 FROM udt_t1 WHERE a = 3;
  SELECT vt2.a, vt2.b;

  SELECT vt1 INTO vt2;
  SELECT vt2.a, vt2.b;
END; //

greatsql> CALL vtype_sp3() //
+-------+---------+
| vt1.a | vt1.b   |
+-------+---------+
|     2 | c1_row2 |
+-------+---------+
1 row in set (0.00 sec)

+-------+---------+
| vt2.a | vt2.b   |
+-------+---------+
|     3 | c1_row3 |
+-------+---------+
1 row in set (0.00 sec)

+-------+---------+
| vt2.a | vt2.b   |
+-------+---------+
|     2 | c1_row2 |
+-------+---------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. Example 5

```
-- Continue based on Example 4
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp4() AS
  vt1 udt_t1%ROWTYPE;
BEGIN
  vt1.b := udt1(10, 'c1_row10');

  SELECT vt1, vt1.a, vt1.b.a, vt1.b.b;
END; //

greatsql> CALL vtype_sp4() //
+------------------------------+-------+---------+----------+
| vt1                          | vt1.a | vt1.b.a | vt1.b.b  |
+------------------------------+-------+---------+----------+
| a:NULL | b:a:10 | b:c1_row10 |  NULL |      10 | c1_row10 |
+------------------------------+-------+---------+----------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```





**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
