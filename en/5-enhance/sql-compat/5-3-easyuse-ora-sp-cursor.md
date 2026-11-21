# Oracle Compatibility - Stored Procedure - CURSOR
---


## 1. Syntax

```sql
1. [ FOR rows IN
  { cursor [ ( cursor_parameter_dec
               [ [,] cursor_parameter_dec ]... )]
  | ( select_statement )
  }
  LOOP statement... END LOOP [label] ;

2. FETCH CURSOR INTO var

3. CURSOR cursor_name (column_name datatype) IS ...

4. cursor_name CURSOR%ROWTYPE

5. cursor_name TABLE%ROWTYPE
```

## 2. Definition and Usage

GreatSQL supports the following cursor usages in `ORACLE` mode:

- 1. Usage 1: Use the `FOR ... IN CURSOR() LOOP ... END LOOP` syntax to read data into a cursor in a loop.

```sql
[ FOR rows IN
  { cursor [ ( cursor_parameter_dec
               [ [,] cursor_parameter_dec ]... )]
  | ( select_statement )
  }
  LOOP statement... END LOOP [label] ;
```

- 2. Usage 2: Read multiple columns from a cursor and assign them to a variable, implementing the `%ROWTYPE` feature.

```sql
FETCH CURSOR INTO var
```

- 3. Usage 3: Cursors can be defined with parameters, and opened with `OPEN CURSOR(var_list)`.

```sql
CURSOR cursor_name (column_name datatype) IS ...
```

- 4. Usage 4: Parameters can be defined as `CURSOR%ROWTYPE` type, used to store multiple columns.

```sql
cursor_name CURSOR%ROWTYPE
```

- 5. Usage 5: Parameters can be defined as `TABLE%ROWTYPE` type, used to store multiple columns.

```sql
cursor_name TABLE%ROWTYPE
```

## 3. Oracle Compatibility Notes

The way GreatSQL reads data with cursors in stored procedures in `ORACLE` mode is basically consistent with Oracle; only `%ROWCOUNT` is not yet supported.

In Oracle, the `FOR var_name IN cursor_name LOOP ... END LOOP` and `%ROWTYPE` syntax are supported for fetching values from a cursor, but in GreatSQL the usage is `LOOP ... END LOOP`.

Other details about cursor usage are described below:

1. Both `DECLARE CURSOR c IS ...` and `DECLARE CURSOR(a INT) c IS ...` are supported for declaring cursors.

2. `FOR var_name IN CURSOR LOOP` can be used to read data; parentheses after the cursor name are optional.

3. `CURSOR.column_name` is supported to obtain the data of a specified column.

4. `CURSOR%FOUND`, `CURSOR%NOTFOUND` and `CURSOR%ISOPEN` are supported to check the cursor status.

5. `CURSOR%TYPE` is supported to inherit the `%ROWTYPE` type of a cursor.

6. `TABLE%ROWTYPE` is supported to obtain the structure of an existing table.

7. A table containing `UDT` types can be defined as a cursor. `SELECT INTO` can also be used for `UDT` fields.

8. In the statement block `FOR var IN CURSOR() LOOP ... END LOOP`, the variable `var` is only valid within the `FOR LOOP ... END LOOP` statement block.

## 4. Examples

Set the `sql_generate_invisible_primary_key` option because the tables created in the following examples have no explicit primary key; disabling this option avoids automatically creating the implicit primary key `my_row_id`, which might affect the following examples.
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

Create test tables and initialize data

```sql
greatsql> DROP TABLE IF EXISTS t;
greatsql> CREATE TABLE IF NOT EXISTS t(id INT NOT NULL, c1 VARCHAR(100) NOT NULL);
greatsql> INSERT INTO t VALUES(1, 'row1'), (2, 'row2'), (3, 'row3');
```

- 1. Example 1: `FOR LOOP` reads data in a loop

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp1_cur_loop() AS
  CURSOR cur1 IS SELECT * FROM t; 
BEGIN
  FOR rec IN cur1() LOOP
    SELECT rec.id, rec.c1;
  END LOOP;
END; //

greatsql> CALL sp1_cur_loop() //
+--------+--------+
| rec.id | rec.c1 |
+--------+--------+
|      1 | row1   |
+--------+--------+
1 row in set (0.00 sec)

+--------+--------+
| rec.id | rec.c1 |
+--------+--------+
|      2 | row2   |
+--------+--------+
1 row in set (0.00 sec)

+--------+--------+
| rec.id | rec.c1 |
+--------+--------+
|      3 | row3   |
+--------+--------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. Example 2: `CURSOR%ROWTYPE` inherits a data type

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp2_cur_rowtype() AS 
  CURSOR cur1 IS SELECT * FROM t;

  rec1 cur1%ROWTYPE;   -- Inherit the data type with CURSOR%ROWTYPE
  rec2 t.id%TYPE;      -- Inherit the data type with TABLE%TYPE
BEGIN
  OPEN cur1;	-- Open the cursor

  LOOP		-- Loop over the cursor until all data is read
    FETCH cur1 INTO rec1;
  EXIT WHEN cur1%NOTFOUND;  

  rec2 := 1;	-- Assign a value to the rec2 variable separately

  SELECT rec1.id, rec1.c1, rec2;

END LOOP;
 CLOSE cur1;
END; //

greatsql> CALL sp2_cur_rowtype() //
+---------+---------+------+
| rec1.id | rec1.c1 | rec2 |
+---------+---------+------+
|       1 | row1    |    1 |
+---------+---------+------+
1 row in set (0.00 sec)

+---------+---------+------+
| rec1.id | rec1.c1 | rec2 |
+---------+---------+------+
|       2 | row2    |    1 |
+---------+---------+------+
1 row in set (0.00 sec)

+---------+---------+------+
| rec1.id | rec1.c1 | rec2 |
+---------+---------+------+
|       3 | row3    |    1 |
+---------+---------+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. Example 3: define a cursor with parameters

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE sp3_cur_var() AS
 vid INT;

 -- Define a cursor with parameters
 CURSOR cur1 (vid INT) IS SELECT * FROM t WHERE id = vid;

 rec1 cur1%ROWTYPE;
BEGIN
 OPEN cur1(2);	  -- Pass parameters when opening the cursor

 LOOP
   FETCH cur1 INTO rec1;
 EXIT WHEN cur1%NOTFOUND;

 SELECT rec1.id, rec1.c1;

 END LOOP;

 CLOSE cur1;
END; //

greatsql> CALL sp3_cur_var() //
+---------+---------+
| rec1.id | rec1.c1 |
+---------+---------+
|       2 | row2    |
+---------+---------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. Example 4: a table containing `UDT` types is supported

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));

greatsql> CREATE TABLE udt_t1(id INT,c2 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(10, 'c1_row10'));
greatsql> INSERT INTO udt_t1 VALUES(2, udt1(20, 'c1_row20'));

greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE PROCEDURE sp4_cur_udt() AS
  CURSOR cur1 (vid INT) IS SELECT * FROM udt_t1 WHERE id = vid;
  rec1 udt_t1.c2%TYPE;
BEGIN
  FOR rec IN cur1(10) LOOP
    SELECT rec.id, rec.c2;
    SELECT rec.c2 INTO rec1;
    SELECT rec1.id, rec1.c1;
  END LOOP;

  SELECT * FROM udt_t1;
END; //

greatsql> CALL sp4_cur_udt(); //
+------+---------------------+
| id   | c2                  |
+------+---------------------+
|    1 | id:10 | c1:c1_row10 |
|    2 | id:20 | c1:c1_row20 |
+------+---------------------+
2 rows in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```



**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
