# Oracle Compatibility - Stored Procedure - TYPE IS TABLE
---


## 1. Syntax

```sql
1. TYPE type IS 
   { assoc_array_type_def
   | nested_table_type_def
   } ;
   
assoc_array_type_def：
    TABLE OF datatype
    INDEX BY { PLS_INTEGER | BINARY_INTEGER | VARCHAR ( v_size )}
    
nested_table_type_def：
    TABLE OF datatype
    
datatype:
     { record_type
     | rowtype_attribute
     | type_attribute
     }
rowtype_attribute: db_table_or_view %ROWTYPE

2. var var_def

3. collection.{ COUNT
           | FIRST
           | LAST
           }
4. var(row) := record_value

5. record_value := var(row)

6. var(row) := var1(row)

7. SELECT var(row)

8. SELECT var(row) INTO var

9. TYPE(row => RECORD(value_list) , row => ..)
```

## 2. Definition and Usage

GreatSQL supports using `TYPE IS TABLE` to define custom data types, and supports the following usages:

- 1. Use `TYPE IS TABLE OF` to define a `TABLE` type.

- 2. Use `var var_def` to define parameters of this custom type.

- 3. Use `var.COUNT` to obtain the number of rows in a custom `TABLE`.

- 4. Use `var(row) := record_value` to assign a value to a row of a custom `TABLE`.

- 5. Use `record_value := var(row)` to assign a value from a row of a custom `TABLE` to a `RECORD` type parameter.

- 6. Use `var(row) := var1(row)` to assign a value from a row of a custom `TABLE` to a row of another custom `TABLE`.

- 7. Use `SELECT var(row)` to query a row of a `TABLE`.

- 8. Use `SELECT var(row) INTO VAR` to assign a value from a row of a custom `TABLE` to a `RECORD` type parameter.

- 9. A `RECORD TABLE` type with `INDEX BY ..` allows assigning default values with `=>`.


## 3. Oracle Compatibility Notes

GreatSQL supports using `TYPE IS TABLE` to define custom data types. The usage is as follows:

1. In the `TYPE IS TABLE OF .. INDEX BY BINARY_INTEGER` definition, self-incrementing integer forms are supported; manually specified integer forms are not supported.

2. Unlimited circular nesting of tables is supported; `RECORD` type data can be used as default values, and `RECORD` and `TABLE` types can be mixed, for example `a.b(1).c`.

3. `%ROWTYPE` is supported to define `TABLE` types, for example `TYPE udt_type IS TABLE OF udt_table%ROWTYPE`.

4. Infinite circular nesting of `SELECT` or `SET` assignments is supported.

5. `NO_DATA_FOUND` is supported to determine the `EXCEPTION` state when data cannot be found. See Example 3 below for details.

6. Assignment between `RECORD TABLE`s with different rows and columns is supported. After assignment, the number of rows in the `TABLE` is consistent with the source `RECORD TABLE`. Default values can also be assigned to `RECORD TABLE` types. If the `RECORD TABLE` is `INDEX BY`, the row number must be included when assigning default values, for example `v1 record_table := record_table(1, udt_table(1 => udt_type(1, 'row1')))`, where `1=>` indicates row 1. If the `RECORD TABLE` is not `INDEX BY`, the row number marker cannot be included when assigning default values.

7. Single-type array definitions are not supported, for example `CREATE TYPE v_list_attrs AS VARRAY(10) OF VARCHAR2(80)`.

8. Using `TABLE` types as `RECORD` types is not supported; usages like `table_type employees%ROWTYPE` are not supported.

9. In the loop `FOR i IN udt_table.FIRST .. udt_table.LAST LOOP`, `i` is an integer type, so the row number value of `udt_table` cannot be non-integer, otherwise the assignment cannot be performed normally. If `udt_table` is empty, no error is reported; the loop is simply skipped, while Oracle reports an error. `udt_table.FIRST` is the minimum row number of `udt_table`, and `udt_table.LAST` is the maximum row number.

10. When the `INDEX BY BINARY_INTEGER` attribute is specified, non-numeric character row-number markers are not supported, for example `TABLE('a')`, but numeric character row numbers are supported, for example `TABLE('1') / TABLE('-1')`. When the `INDEX BY VARCHAR` attribute is specified, character row-number parameters are allowed, for example `TABLE('a')`. In addition, when `INDEX BY VARCHAR` is specified, row numbers are sorted by ASCII code, while `INDEX BY BINARY_INTEGER` sorts by integer.

11. In `SELECT var(row)`, if `var(row)` contains custom type data, `NULL` is returned. See Example 10 below for details.

12. In `SELECT var.COUNT`, if the variable name `var` duplicates a `TABLE` name, it is preferentially parsed as the `RECORD TABLE` name, so `var.COUNT` returns the number of rows in the `TABLE`.

13. When `TYPE IS TABLE OF` is not followed by `INDEX BY`, the custom data type must be initialized before use. Once the maximum number of rows is defined during initialization, it cannot be changed later; only `UPDATE` operations are supported afterwards, not `INSERT` operations. An exception is `SELECT BULK COLLECT INTO var`, which can be used directly without initialization, because the `BULK COLLECT` operation performs initialization and data insertion. The Oracle `EXTEND()` function to expand `TABLE` types is not supported yet.

14. In the `TYPE IS TABLE OF INDEX BY VARCHAR(v_size)` definition, the range of the parameter `v_size` in Oracle is [1, 32676], while in GreatSQL the supported range is [1, 16383]; the two are different.

15. Using reserved keywords as `TABLE` column names is not supported, such as `NAME`, `ANY`, `BULK`, `TABLE`, etc.

16. In stored procedures, `TYPE` is a reserved keyword and cannot be used as a variable name.



## 4. Examples

Set the `sql_generate_invisible_primary_key` option because the tables created in the following examples have no explicit primary key; disabling this option avoids automatically creating the implicit primary key `my_row_id`, which might affect the following examples.
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

- 1. Example 1: `TYPE IS RECORD/TYPE IS TABLE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp1 AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 33.06
);

TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;

TYPE t2_record IS RECORD(
  v_i INT := 1,
  t1_record_v1 t1_list
);
t1_record_val t2_record;

BEGIN
  t1_record_val.t1_record_v1(1).id := 1;
  t1_record_val.t1_record_v1(2).c1 := 'row1';
  t1_record_val.t1_record_v1(0).id := 2;
  t1_record_val.t1_record_v1(3).c2 := 3.306;

  SELECT t1_record_val.t1_record_v1(1).id,
    t1_record_val.t1_record_v1(1).c1,
    t1_record_val.t1_record_v1(0).id,
    t1_record_val.t1_record_v1(3).c2;

  SELECT t1_record_val.v_i;
END; //

greatsql> CALL record_sp1() //
+----------------------------------+----------------------------------+----------------------------------+----------------------------------+
| t1_record_val.t1_record_v1(1).id | t1_record_val.t1_record_v1(1).c1 | t1_record_val.t1_record_v1(0).id | t1_record_val.t1_record_v1(3).c2 |
+----------------------------------+----------------------------------+----------------------------------+----------------------------------+
|                                1 | NULL                             |                                2 |                            3.306 |
+----------------------------------+----------------------------------+----------------------------------+----------------------------------+
1 row in set (0.00 sec)

+-------------------+
| t1_record_val.v_i |
+-------------------+
|                 1 |
+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. Example 2: `TYPE IS TABLE OF %ROWTYPE`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TABLE t1(a INT, b CHAR(50));
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2');

greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp2() AS
  TYPE udt_t1 IS TABLE OF t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udt_t2 udt_t1;
BEGIN
  SELECT * BULK COLLECT INTO udt_t2 FROM t1;

  FOR i IN udt_t2.FIRST .. udt_t2.LAST LOOP
    SELECT udt_t2(i).a, udt_t2(i).b;
  END LOOP;
END; //

greatsql> CALL table_sp2() //
+-------------+-------------+
| udt_t2(i).a | udt_t2(i).b |
+-------------+-------------+
|           1 | row1        |
+-------------+-------------+
1 row in set (0.00 sec)

+-------------+-------------+
| udt_t2(i).a | udt_t2(i).b |
+-------------+-------------+
|           2 | row2        |
+-------------+-------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3: `EXCEPTION WHEN NO_DATA_FOUND`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp3() AS
 TYPE t1_record IS RECORD(
    id INT := 1
  );

  TYPE t1_table IS TABLE OF t1_record INDEX BY BINARY_INTEGER;  
  v1 t1_table;
BEGIN
  v1(0).id := 3306;
  SELECT v1(0).id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN SELECT 'The row does not exist!' AS ret;
END; //

greatsql> CALL table_sp3() //
+----------+
| v1(0).id |
+----------+
|     3306 |
+----------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. Example 4: assign values to `RECORD / TABLE` type data

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp4() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1  VARCHAR(20) := 'row1',
  c2 FLOAT := 33.06
);

TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;

t_record_v1 t1_list;
t_record_v2 t1_list;

BEGIN
 t_record_v1(0).id := 2;
 t_record_v1(0).c2 := 3.306;
 t_record_v2(10).id := 20;

 t_record_v2 := t_record_v1;

 SELECT t_record_v1(0).id, t_record_v1(0).c1, t_record_v1(0).c2;

 SELECT t_record_v2(0).id, t_record_v2(0).c1, t_record_v2(0).c2;
END; //

greatsql> CALL table_sp4() //
+--------------------+--------------------+--------------------+
|  t_record_v1(0).id |  t_record_v1(0).c1 |  t_record_v1(0).c2 |
+--------------------+--------------------+--------------------+
|                  2 | row1               |              3.306 |
+--------------------+--------------------+--------------------+
1 row in set (0.00 sec)

+--------------------+--------------------+--------------------+
|  t_record_v2(0).id |  t_record_v2(0).c1 |  t_record_v2(0).c2 |
+--------------------+--------------------+--------------------+
|                  2 | row1               |              3.306 |
+--------------------+--------------------+--------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. Example 5: `table.COUNT`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp5() AS
TYPE t1_list IS TABLE OF VARCHAR(20) INDEX BY BINARY_INTEGER;
t_record_v1 t1_list;
id INT := 1;

BEGIN
 t_record_v1(id) := 1;
 t_record_v1(3) := 1;

 SELECT t_record_v1(id), t_record_v1(3);

 SELECT t_record_v1.COUNT;
END; //

greatsql> CALL table_sp5() //
+------------------+-----------------+
|  t_record_v1(id) |  t_record_v1(3) |
+------------------+-----------------+
| 1                | 1               |
+------------------+-----------------+
1 row in set (0.00 sec)

+--------------------+
| t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 6. Example 6: `TYPE IS TABLE OF TYPE INDEX BY VARCHAR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp6() AS
TYPE t1_list IS TABLE OF VARCHAR(20) INDEX BY VARCHAR(20);
t_record_v1 t1_list;
id VARCHAR(20) := 'row1';

BEGIN
 t_record_v1(id) := 10;
 t_record_v1(1) := 1;

 SELECT t_record_v1(id), t_record_v1(1);
 SELECT t_record_v1.COUNT;
END; //

greatsql> CALL table_sp6() //
+------------------+-----------------+
|  t_record_v1(id) |  t_record_v1(1) |
+------------------+-----------------+
| 10               | 1               |
+------------------+-----------------+
1 row in set (0.00 sec)

+--------------------+
|  t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

```

- 7. Example 7: `TYPE IS TABLE OF RECORD INDEX BY VARCHAR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c2 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(10, 'c2_row10'));
greatsql> INSERT INTO udt_t1 VALUES(2, udt1(20, 'c2_row20'));

greatsql> CREATE OR REPLACE PROCEDURE table_sp7() AS
  TYPE udt_t2 IS TABLE OF udt_t1%ROWTYPE index by INT;
  udt_t3 udt_t2;
BEGIN
  SELECT * BULK COLLECT INTO udt_t3 FROM udt_t1;

  FOR i IN 1 .. udt_t3.COUNT LOOP
    SELECT udt_t3(i).id, udt_t3(i).c2;
  END LOOP;
END; //

greatsql> CALL table_sp7() //
+--------------+---------------------+
| udt_t3(i).id | udt_t3(i).c2        |
+--------------+---------------------+
|            1 | id:10 | c1:c2_row10 |
+--------------+---------------------+
1 row in set (0.01 sec)

+--------------+---------------------+
| udt_t3(i).id | udt_t3(i).c2        |
+--------------+---------------------+
|            2 | id:20 | c1:c2_row20 |
+--------------+---------------------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

- 8. Example 8: `var(row) := record_value`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp8() AS
TYPE t1_list IS TABLE OF VARCHAR(20) INDEX BY VARCHAR2(30);
v_array t1_list;

TYPE t1_record IS RECORD(
  c1 VARCHAR(20) := 'c1_row1',
  c2 VARCHAR(20) := 'c2_row1'
);

TYPE t2_list IS TABLE OF t1_record INDEX BY pls_integer;
t3_list t2_list;

v_c1 VARCHAR(10) := 'b';

BEGIN
 t3_list(1) := t1_record(v_c1, 'c2_row1');
 t3_list(2) := t1_record('b', 'c2_row2');

 FOR i IN 1 .. t3_list.COUNT LOOP
   v_array(t3_list(i).c1) := t3_list(i).c2;

   SELECT v_array(t3_list(i).c1);
 END LOOP;
END; //

greatsql> CALL table_sp8() //
+------------------------+
| v_array(t3_list(i).c1) |
+------------------------+
| c2_row1                |
+------------------------+
1 row in set (0.00 sec)

+------------------------+
| v_array(t3_list(i).c1) |
+------------------------+
| c2_row2                |
+------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 9. Example 9: `record_value := var(row)`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp9() AS
  TYPE t1_record IS RECORD(
    id INT := 1,
    c1  VARCHAR(20) := 'row1',
    c2 FLOAT := 33.06
  );

  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  t_record_v1 t1_list;
  t_record_v2 t1_record;

BEGIN
  t_record_v1(1).id := 10;
  t_record_v1(2).id := 20;
  t_record_v2 := t_record_v1(2);
  
  SELECT t_record_v1(1), t_record_v2;
  
  SELECT t_record_v1.COUNT;
  
  t_record_v1(2).id := 30;
  SELECT t_record_v1(2), t_record_v1(1);
END; //

greatsql> CALL table_sp9() //
+----------------------------+----------------------------+
|  t_record_v1(1)            |  t_record_v2               |
+----------------------------+----------------------------+
| id:10 | c1:row1 | c2:33.06 | id:20 | c1:row1 | c2:33.06 |
+----------------------------+----------------------------+
1 row in set (0.00 sec)

+--------------------+
| t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

+----------------------------+----------------------------+
|  t_record_v1(2)            |  t_record_v1(1)            |
+----------------------------+----------------------------+
| id:30 | c1:row1 | c2:33.06 | id:10 | c1:row1 | c2:33.06 |
+----------------------------+----------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 10. Example 10: `SELECT var(row)`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp10() AS
  TYPE t1_record IS RECORD (
    a VARCHAR(30) := 'a',
    b VARCHAR(30) := 'b',
    c VARCHAR(30) := 'c'
  ); 

  TYPE t2_record IS RECORD (
    v_t1 t1_record,  
    d VARCHAR(30) := 'd'
  );

  TYPE t3 IS TABLE OF t2_record INDEX BY VARCHAR2(30);
  t4 t3;

  TYPE udt_t2 IS TABLE OF t1_record INDEX BY VARCHAR2(30);
  udt_t3 udt_t2;

BEGIN
  t4(1).d := 'e';
  SELECT t4(1), t4(1).v_t1;

  udt_t3(1) := t4(1).v_t1;
  SELECT udt_t3(1);
END; //

greatsql> CALL table_sp10() //
+-----------------+-----------------+
| t4(1)           | t4(1).v_t1      |
+-----------------+-----------------+
| v_t1:NULL | d:e | a:a | b:b | c:c |
+-----------------+-----------------+
1 row in set (0.00 sec)

+-----------------+
| udt_t3(1)       |
+-----------------+
| a:a | b:b | c:c |
+-----------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 11. Example 11: `var(row) := var1(row)`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp11() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20) := 'c1',
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
t_record_v1 t1_list;
t_record_v2 t1_list;
BEGIN
 t_record_v1(1).id := 10;
 SELECT t_record_v1;

 t_record_v1(2).id := 20;
 t_record_v1(3).c1 := 'c1_30';
 t_record_v1(4) := t_record_v1(2);

 SELECT t_record_v1(1), t_record_v1(2), t_record_v1(3), t_record_v1(4), t_record_v1;

 SELECT t_record_v1.COUNT;

 t_record_v2(2) := t_record_v1(2);

 SELECT t_record_v2(2);

 SELECT t_record_v1(1).id, t_record_v1(2).id, t_record_v1(3).id, t_record_v1(4).id, t_record_v1;
END; //

greatsql> CALL table_sp11() //
+---------------------------------+
|  t_record_v1                    |
+---------------------------------+
| t1_list(t1_record(10,c1,33.06)) |
+---------------------------------+
1 row in set (0.00 sec)

+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
| t_record_v1(1).id | t_record_v1(2).id | t_record_v1(3).id | t_record_v1(4).id | t_record_v1
            |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
|                10 |                20 |                 1 |                20 | t1_list(t1_record(10,c1,33.06),t1_record(20,c1,33.06),t1_record(1,c1_30,33.06),t1_record(20,c1,33.06)) |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

+--------------------+
|  t_record_v1.COUNT |
+--------------------+
|                  4 |
+--------------------+
1 row in set (0.00 sec)

+--------------------------+
| t_record_v2(2)          |
+--------------------------+
| id:20 | c1:c1 | c2:33.06 |
+--------------------------+
1 row in set (0.00 sec)

+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
| t_record_v1(1).id | t_record_v1(2).id | t_record_v1(3).id | t_record_v1(4).id | t_record_v1                                                                                            |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
|                10 |                20 |                 1 |                20 | t1_list(t1_record(10,c1,33.06),t1_record(20,c1,33.06),t1_record(1,c1_30,33.06),t1_record(20,c1,33.06)) |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 12. Example 12: `SELECT var(row) INTO var`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp12() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20) := 'c1_1',
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
t_record_v1 t1_list;
t_record_v2 t1_record;
BEGIN
 t_record_v1(2) := t1_record(10, 'c1_10', 43.06);

 SELECT t_record_v1(2) INTO t_record_v2;

 SELECT t_record_v2;
END; //

greatsql> CALL table_sp12() //
+-----------------------------+
|  t_record_v2                |
+-----------------------------+
| id:10 | c1:c1_10 | c2:43.06 |
+-----------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 13. Example 13: `TYPE IS TABLE OF RECORD` without `INDEX BY`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp13() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1  VARCHAR(20) := 'c1_1',
  c2 FLOAT := 33.06
);
-- It can be left uninitialized here, and assigned later for initialization
TYPE t1_list IS TABLE OF t1_record;

t_record_v1 t1_list := t1_list(t1_record(11, 'c1_11', 44.06), NULL);
t_record_v2 t1_record;

BEGIN
 -- If it was not initialized above, it can still be assigned here, as shown below
 -- t_record_v1 := t1_list(t1_record(11, 'c1_11', 44.06), NULL);

 t_record_v1(1).id := 10;
 t_record_v1(2).id := 20;
 t_record_v2 := t_record_v1(2);

 SELECT t_record_v1(1), t_record_v2;

 SELECT t_record_v1.COUNT;

 t_record_v1(2).id := 30;
 SELECT t_record_v1(2), t_record_v1(1);
END; //

greatsql> CALL table_sp13() //
+-----------------------------+---------------------------+
|  t_record_v1(1)             |  t_record_v2              |
+-----------------------------+---------------------------+
| id:10 | c1:c1_11 | c2:44.06 | id:20 | c1:NULL | c2:NULL |
+-----------------------------+---------------------------+
1 row in set (0.00 sec)

+--------------------+
|  t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

+---------------------------+-----------------------------+
|  t_record_v1(2)           |  t_record_v1(1)             |
+---------------------------+-----------------------------+
| id:30 | c1:NULL | c2:NULL | id:10 | c1:c1_11 | c2:44.06 |
+---------------------------+-----------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 14. Example 14: `TYPE IS TABLE OF RECORD` with `INDEX BY` and default values

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp14 AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;

TYPE t2_record IS RECORD(
  id INT := 1,
  c1 t1_list,
  c2 FLOAT := 33.06
);

TYPE t3_record IS RECORD(
  v_i INT := 1,
  t_record_v1 t2_record := t2_record(10, t1_list(1=>t1_record(1, 'c1_row1', 34.06)), 43.06)
);
t_record_v2 t3_record;

BEGIN
 SELECT t_record_v2.t_record_v1.c1(1).c1;
END; //

greatsql> CALL table_sp14() //
+----------------------------------+
| t_record_v2.t_record_v1.c1(1).c1 |
+----------------------------------+
| c1_row1                          |
+----------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 15. Example 15: `table.FIRST / table.LAST`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c2 udt1);

greatsql> CREATE OR REPLACE PROCEDURE table_sp15() AS
  TYPE udt_t2 IS TABLE OF udt_t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udt_t3 udt_t2 := udt_t2(1=>NULL, -1=>NULL);
BEGIN
  udt_t3(0).id := 10;
  udt_t3(1).id := 20;
  FOR i IN REVERSE udt_t3.FIRST .. udt_t3.LAST LOOP
    SELECT i, udt_t3.FIRST, udt_t3.LAST, udt_t3(i);
  END LOOP;
END; //

greatsql> CALL table_sp15() //
+------+--------------+-------------+-----------------+
| i    | udt_t3.FIRST | udt_t3.LAST | udt_t3(i)       |
+------+--------------+-------------+-----------------+
|    1 | -1           | 1           | id:20 | c2:NULL |
+------+--------------+-------------+-----------------+
1 row in set (0.00 sec)

+------+--------------+-------------+-----------------+
| i    | udt_t3.FIRST | udt_t3.LAST | udt_t3(i)       |
+------+--------------+-------------+-----------------+
|    0 | -1           | 1           | id:10 | c2:NULL |
+------+--------------+-------------+-----------------+
1 row in set (0.00 sec)

+------+--------------+-------------+-------------------+
| i    | udt_t3.FIRST | udt_t3.LAST | udt_t3(i)         |
+------+--------------+-------------+-------------------+
|   -1 | -1           | 1           | id:NULL | c2:NULL |
+------+--------------+-------------+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```



More related usages:
- [BULK COLLECT](./5-3-easyuse-ora-sp-bulk-collect.md)
- [FORALL LOOP](./5-3-easyuse-ora-sp-forall-loop.md)
- [TYPE IS RECORD](./5-3-easyuse-ora-sp-record-type.md)





**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
