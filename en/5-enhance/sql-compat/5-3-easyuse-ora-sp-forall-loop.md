# Oracle Compatibility - Stored Procedure - FORALL LOOP
---


## 1. Syntax

```sql
FORALL var IN expr1 .. expr2 INSERT INTO .. VALUES var(n)

-- OR
FORALL var IN expr1..expr2 INSERT INTO .. VALUES var(n)
```

## 2. Definition and Usage

GreatSQL supports using `FORALL .. LOOP` to read all values between `expr1` and `expr2` in a loop, assign them to the variable `var`, and then execute `INSERT INTO .. VALUES var(i)` to write the data. In `FORALL ... LOOP`, the two parameter expressions at the front and back can be connected with the middle dots, for example: `FORALL .. IN expr1..expr2 LOOP`; or connected with only one parameter, for example: `FORALL .. IN expr1.. expr2 LOOP` and `FORALL .. IN expr1 ..expr2 LOOP` are both allowed.

## 3. Oracle Compatibility Notes

In `ORACLE` mode, GreatSQL stored procedures support the `FORALL .. LOOP` usage. The usage is as follows:

1. Currently only `INSERT` is supported after the `FORALL .. LOOP` statement; other usages will be supported in future versions.

2. Parameters are supported to obtain specified data in a table, for example `n := 100; SELECT dr_table(n).col_name`; expressions are also supported to obtain data, for example `SELECT dr_table(n+1).col_name`.

3. For tables containing `UDT` fields, `t1%ROWTYPE` can be used as the TABLE type, and then a sub-column in the `UDT` field can be queried separately.

4. In `FORALL var IN expr`, if the expression `expr` is a `RECORD TABLE`, it must be `INDEX BY INT` (a numeric type). If it is a string type such as `INDEX BY VARCHAR`, an error is reported.

5. In the `INSERT` clause following `FORALL`, the variable `var` must be used as the row-index key of the `TABLE` type variable, otherwise an error is reported.


## 4. Examples

Set the `sql_generate_invisible_primary_key` option because the tables created in the following examples have no explicit primary key; disabling this option avoids automatically creating the implicit primary key `my_row_id`, which might affect the following examples.
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

Create test tables and initialize data
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> CREATE TABLE t2 (a INT NOT NULL, b VARCHAR(20) NOT NULL);

greatsql> INSERT INTO t1 VALUES(1, 't1_row1'), (2, 't1_row2'), (3,'t1_row3') ;
greatsql> INSERT INTO t2 VALUES(1, 't2_row1'), (2, 't2_row2'), (3,'t2_row3') ;
```

- 1. Example 1: `FORALL LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  TYPE udt1 IS TABLE OF t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udt_t1 udt1;
begin
  udt_t1(100).a := 100;
  udt_t1(100).b := 'udt_t1_row100';

  SELECT  udt_t1(100).a, udt_t1(100).b;

  -- Here udt_t1.FIRST and udt_t1.LAST can be replaced with other expressions, as long as they are numeric types and udt_t1(i) has data
  FORALL i IN udt_t1.FIRST .. udt_t1.LAST INSERT INTO t2 VALUES udt_t1 (i);
END; //

greatsql> CALL p1() //
+---------------+---------------+
| udt_t1(100).a | udt_t1(100).b |
+---------------+---------------+
|           100 | udt_t1_row100 |
+---------------+---------------+
1 row in set (0.00 sec)

Query OK, 1 row affected (0.00 sec)

greatsql> SELECT * FROM t2; //
+-----+---------------+
| a   | b             |
+-----+---------------+
|   1 | t2_row1       |
|   2 | t2_row2       |
|   3 | t2_row3       |
| 100 | udt_t1_row100 |
+-----+---------------+
4 rows in set (0.00 sec)
```

- 2. Example 2: `BULK COLLECT INTO AND FORALL`

```sql
-- Continue based on Example 1
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(v_a INT) AS
  TYPE t1_record IS RECORD(
    c1 INT := 1,
    c2 VARCHAR(20)
  );
  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  t1_record_val t1_list;
  CURSOR cur1(v_a INT) IS SELECT a, b FROM t1 WHERE a = v_a;
BEGIN
  t1_record_val(1).c1 := 100;
  SELECT t1_record_val(1).c1;

  OPEN cur1(v_a);
  FETCH cur1 BULK COLLECT INTO t1_record_val LIMIT 3;
  FORALL i IN t1_record_val.FIRST .. t1_record_val.LAST 
    INSERT INTO t2 VALUES t1_record_val(i);
  SELECT t1_record_val(1).c1;
  CLOSE cur1;
END; //

greatsql> CALL p1(1) //
+---------------------+
| t1_record_val(1).c1 |
+---------------------+
|                 100 |
+---------------------+
1 row in set (0.00 sec)

+---------------------+
| t1_record_val(1).c1 |
+---------------------+
|                   2 |
+---------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT * FROM t2 //
+-----+---------------+
| a   | b             |
+-----+---------------+
|   1 | t2_row1       |
|   2 | t2_row2       |
|   3 | t2_row3       |
| 100 | udt_t1_row100 |
|   2 | t1_row2       |
+-----+---------------+
5 rows in set (0.00 sec)
```


More related usages:
- 1. [TYPE IS RECORD](./5-3-easyuse-ora-sp-record-type.md)
- 2. [BULK COLLECT](./5-3-easyuse-ora-sp-bulk-collect.md)



**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
