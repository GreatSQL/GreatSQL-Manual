# Oracle Compatibility - Stored Procedure - TYPE IS RECORD
---


## 1. Syntax

```sql
1.
SET sql_mode = ORACLE;
TYPE var IS RECORD(columns type [default value]...)

2.
SET sql_mode = ORACLE;
var var_def
```

## 2. Definition and Usage

GreatSQL supports using `TYPE IS RECORD()` to define custom data types, and also supports using `var var_def` to define custom data types.

## 3. Oracle Compatibility Notes

GreatSQL supports using `TYPE IS RECORD()` to define custom data types, and also supports using `var var_def` to define custom data types. The usage is as follows:

1. Unlimited circular nesting is supported, default values can be set at definition time, and `RECORD` and `TABLE` can be mixed, for example `a.b(1).c`.

1. Expressions are supported as the `DEFAULT` attribute when defining custom types, and assignment is performed.

1. `UDT` types are supported, including `CREATE TYPE AS OBJECT` and `CREATE TYPE IS TABLE`. Initial values can be assigned to member variables in a `RECORD`, except for `RECORD TABLE` types.

1. If a `UDT` type is used in the definition of a stored procedure, operations on this `UDT` type are allowed when calling the stored procedure, including deleting and modifying it. After the operation, the stored procedure is re-parsed when called again.

1. Infinite circular nesting of `SELECT` and `SET` assignments is supported.

1. `RECORD` fields can be defined by assigning values with parameters, for example `v1 VARCHAR(20) := v2`. See Example 2 below for details. If the parameter is also a parameter inside the `RECORD`, the assignment fails.

1. Single-type array definitions are not supported, for example `CREATE TYPE v1 AS VARRAY(10) OF VARCHAR2(80);`.

1. Attaching the `NOT NULL` attribute to custom types is not supported.

1. Using `TABLE` type as the type of a `RECORD` is not supported.

1. `RECORD%TYPE` as a default value is not supported, but default assignment for custom `RECORD` types and `UDT TABLE` types is supported. For example: `e stu_record := stu_record(2)`.

1. Defining member fields of a `RECORD` as `%TYPE` types is not supported.

1. Using reserved keywords as `RECORD` column names is not supported, such as `NAME`, `ANY`, `BULK`, `TABLE`, etc.

1. In stored procedures, `TYPE` is a reserved keyword and cannot be used as a variable name.


## 4. Examples


- 1. Example 1: `TYPE IS RECORD/TYPE IS TABLE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp1 AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
TYPE t1_record1 IS RECORD(
  v_i INT := 1,
  t1_record_v1 t1_list
);
t1_record_val t1_record1;
BEGIN
  t1_record_val.t1_record_v1(1).id := 1;
  t1_record_val.t1_record_v1(2).c1 := 'row1';
  t1_record_val.t1_record_v1(0).id := 2;
  t1_record_val.t1_record_v1(3).c2 := 36.06;

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
|                                1 | NULL                             |                                2 |                            36.06 |
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

For more usages, refer to: ora_type_is_table.md

- 2. Example 2: `TYPE RECORD` + default assignment

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp2() AS
  v1 VARCHAR(20) := 'v1_str';

  TYPE t1_record IS RECORD(
    v2 VARCHAR(20) := v1
  ); 

  t1_record1 t1_record;
BEGIN
  SELECT t1_record1.v2;
END; //

greatsql> CALL record_sp2() //
+---------------+
| t1_record1.v2 |
+---------------+
| v1_str        |
+---------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)


greatsql> CREATE OR REPLACE PROCEDURE record_sp2() AS
  v1 VARCHAR(20) := 'v1_str';

  TYPE t1_record IS RECORD(
    v2 VARCHAR(20) := nullptr
  ); 

  t1_record1 t1_record;
BEGIN
  SELECT t1_record1.v2;
END; //
ERROR 1054 (42S22): Unknown column 'nullptr' in 'field list'



greatsql> CREATE OR REPLACE PROCEDURE record_sp1() AS
  TYPE t1_record IS RECORD(
    id INT := 1,
    v1 VARCHAR(20) := 'v1_str'
  );

  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  v1 t1_list;
BEGIN
  v1(1).id := 100;

  SELECT v1(1).id, v1(1).v1;
END; //

greatsql> CALL record_sp1() //
+----------+----------+
| v1(1).id | v1(1).v1 |
+----------+----------+
|      100 | v1_str   |
+----------+----------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3: TYPE IS UDT TYPE AND SET DEFAULT VALUE

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE OR REPLACE TYPE udt_t1 AS TABLE OF udt1;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp3 AS
TYPE t0_record IS RECORD(
  id INT := 1,
  c1 udt_t1,
  c2 FLOAT := 33.06
);
TYPE t1_record IS RECORD(
  v_i INT := 1,
  t1_record_v1 t0_record := t0_record(3, udt_t1(udt1(3, 'c1_row3')), 36.06)
);
t1_record_val t1_record;

BEGIN
  SELECT t1_record_val.t1_record_v1.c1(1).id, t1_record_val.t1_record_v1.c1(1).c1;

  t1_record_val.t1_record_v1.c1(1).c1 := 'c1_row30';

  SELECT t1_record_val.t1_record_v1.c1(1).c1;
END; //

greatsql> CALL record_sp3() //
+-------------------------------------+-------------------------------------+
| t1_record_val.t1_record_v1.c1(1).id | t1_record_val.t1_record_v1.c1(1).c1 |
+-------------------------------------+-------------------------------------+
|                                   3 | c1_row3                             |
+-------------------------------------+-------------------------------------+
1 row in set (0.00 sec)

+-------------------------------------+
| t1_record_val.t1_record_v1.c1(1).c1 |
+-------------------------------------+
| c1_row30                            |
+-------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. Example 4: TYPE IS RECORD TYPE AND SET DEFAULT VALUE

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp4 AS
TYPE t0_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 33.06
);

TYPE t1_record IS RECORD(
  id INT := 1,
  c1 t0_record,
  c2 FLOAT := 33.06
);

TYPE t1_record1 IS RECORD(
  v_i INT := 1,
  t1_record_v1 t1_record := t1_record(10, t0_record(10, 'c1_row10', 43.06), 43.06)
);

t1_record_val t1_record1;

BEGIN
  SELECT t1_record_val.t1_record_v1.id, t1_record_val.t1_record_v1.c1, t1_record_val.t1_record_v1.c2;

  SELECT t1_record_val.t1_record_v1.c1.id, t1_record_val.t1_record_v1.c1.c1, t1_record_val.t1_record_v1.c1.c2;
END; //

greatsql> CALL record_sp4() //
+-------------------------------+--------------------------------+-------------------------------+
| t1_record_val.t1_record_v1.id | t1_record_val.t1_record_v1.c1  | t1_record_val.t1_record_v1.c2 |
+-------------------------------+--------------------------------+-------------------------------+
|                            10 | id:10 | c1:c1_row10 | c2:43.06 |                         43.06 |
+-------------------------------+--------------------------------+-------------------------------+
1 row in set (0.00 sec)

+----------------------------------+----------------------------------+----------------------------------+
| t1_record_val.t1_record_v1.c1.id | t1_record_val.t1_record_v1.c1.c1 | t1_record_val.t1_record_v1.c1.c2 |
+----------------------------------+----------------------------------+----------------------------------+
|                               10 | c1_row10                         |                            43.06 |
+----------------------------------+----------------------------------+----------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. Example 5: TYPE IS UDT TABLE TYPE AND SET DEFAULT VALUE

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE OR REPLACE TYPE udt_t1 AS TABLE OF udt1;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp5() AS
  rec1 udt_t1 := udt_t1(udt1(1, 'c1_row1'), udt1(2, 'c1_row2'));
BEGIN
  rec1(1).id := 10;
  rec1(1).c1 := 'c1_row10';

  FOR i IN rec1.FIRST .. rec1.LAST LOOP
    SELECT rec1(i).id, rec1(i).c1;
  END LOOP;
END; //

greatsql> CALL record_sp5() //
+------------+------------+
| rec1(i).id | rec1(i).c1 |
+------------+------------+
|         10 | c1_row10   |
+------------+------------+
1 row in set (0.00 sec)

+------------+------------+
| rec1(i).id | rec1(i).c1 |
+------------+------------+
|          2 | c1_row2    |
+------------+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```


More related usages:
- [BULK COLLECT](./5-3-easyuse-ora-sp-bulk-collect.md)
- [FORALL LOOP](./5-3-easyuse-ora-sp-forall-loop.md)
- [TYPE IS TABLE](./5-3-easyuse-ora-sp-table-type.md)



**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
