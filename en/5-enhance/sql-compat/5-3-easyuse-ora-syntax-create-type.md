# Oracle Compatibility - Syntax - CREATE TYPE
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

CREATE [OR REPLACE] [DEFINER = user] TYPE type_name [AS|IS] OBJECT(column_list) [sp_c_chistics]

CREATE [OR REPLACE] [DEFINER = user] TYPE type_name [AS|IS] TABLE OF [udt_name|udt_type]

CREATE [OR REPLACE] [DEFINER = user] TYPE type_name [AS|IS] VARRAY(n) OF [udt_name|udt_type]
```

This syntax is supported only after switching to the `ORACLE` mode.

## 2. Definition and Usage

GreatSQL allows users to create custom data types with `CREATE TYPE`. Note the following:

1. Common types such as `INT/VARCHAR` are supported; a few types such as `TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB` are not supported for now.

2. In `VARRAY(n)`, the value range of n is [1024, 18446744073709551615], with a default value of 1048576, controlled by the global option `tf_udt_table_max_rows`. If used in an MGR cluster, you must ensure that the `tf_udt_table_max_rows` option value is consistent across all nodes; otherwise, MGR may fail with errors.

3. User-defined types can be accessed across databases.

## 3. Oracle Compatibility Notes

The main differences between GreatSQL and Oracle in custom type usage are as follows:

1. Specific column types can be defined, but multi-level nested type definitions are not supported for now.

2. Setting or assigning default values is not supported.

3. The display of the result of `SELECT type_name` differs due to the different terminal network transfer protocols between GreatSQL and Oracle. The output can be controlled as a string format such as `col1:value | col2:value2` by setting the option `udt_format_result = 'DBA'`. See the examples below for details.

4. In Oracle, the data object names `TYPE`, `FUNCTION`, and `PACKAGE` cannot be duplicated; in GreatSQL, the data object names `TYPE`, `FUNCTION`, and `PACKAGE` also cannot be duplicated, except that `FUNCTION` and `PACKAGE` can share the same name.

5. Executing `SELECT type_table` returns the input string; use the `TABLE` function to output it in tabular form.

6. The argument of `SELECT type_table()` must be a type object of the type defined; otherwise, an error is reported.

7. In the `CREATE TYPE AS TABLE/VARRAY(n) OF type_name` statement, `type_name` supports only the `UDT` type, not the `UDT TABLE` type; that is, multi-level nested custom table types are not supported.

8. The `SELECT * FROM udt_table` usage is currently not supported; use `SELECT * FROM TABLE(udt_table)` instead to obtain the values of udt_table.

9. The usage `CREATE TABLE table_name AS SELECT udt_table() FROM DUAL` is not supported.

## 4. Examples

- 1. Example 1: `CREATE TYPE`, `SHOW CREATE TYPE`, `SHOW TYPE STATUS`

```sql
-- Switch to ORACLE mode first
greatsql> SET sql_mode = Oracle;

-- 1. Create a UDT; IF NOT EXISTS is not supported
greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT ,c1 VARCHAR(20));

greatsql> SELECT udt1(1, 'c1_row1') FROM DUAL;
+--------------------+
| udt1(1, 'c1_row1') |
+--------------------+
| id:1 | c1:c1_row1  |
+--------------------+
1 row in set (0.01 sec)

-- 2. View the UDT DDL
greatsql> SHOW CREATE TYPE udt1\G
*************************** 1. row ***************************
                Type: udt1
            sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
         Create Type: CREATE DEFINER="root"@"localhost" TYPE "udt1" AS OBJECT(id INT ,c1 VARCHAR(20))
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
  Database Collation: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 3. View the UDT status
greatsql> SHOW TYPE STATUS LIKE 'udt1'\G
*************************** 1. row ***************************
                  Db: greatsql
                Name: udt1
                Type: TYPE
             Definer: root@localhost
            Modified: 2023-11-22 09:46:23
             Created: 2023-11-22 09:46:23
       Security_type: DEFINER
             Comment:
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
  Database Collation: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 4. Drop a UDT; IF EXISTS is supported
greatsql> DROP TYPE IF EXISTS udt1;
Query OK, 0 rows affected (0.00 sec)
```

```sql
use db1;
set sql_mode="Oracle";
CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT ,c1 VARCHAR(20));
```

- 2. Example 2: Granting the TYPE to Other Users Is Supported

```sql
greatsql> SET sql_mode = Oracle;

greatsql> SELECT CURRENT_USER();
+----------------+
| CURRENT_USER() |
+----------------+
| root@localhost |
+----------------+

greatsql> CREATE OR REPLACE DEFINER = 'u2@localhost' TYPE udt1 AS OBJECT(id INT, c1 CHAR(10)) SQL SECURITY INVOKER;

greatsql> CREATE USER u1@localhost IDENTIFIED BY '';

greatsql> GRANT EXECUTE ON TYPE greatsql.udt1 TO u1@localhost;
```

Connect with a new session using the `u1` account and use the UDT:
```sql
$ mysql -S/data/GreatSQL/mysql.sock -uu1 greatsql
...
greatsql> SHOW GRANTS;
+-------------------------------------------------------------+
| Grants for u1@localhost                                     |
+-------------------------------------------------------------+
| GRANT USAGE ON *.* TO "u1"@"localhost"                      |
| GRANT EXECUTE ON TYPE `greatsql`.`udt1` TO "u1"@"localhost" |
+-------------------------------------------------------------+
2 rows in set (0.00 sec)

-- Direct execution reports an error
greatsql> SELECT udt1(1, 'c1_row1') FROM DUAL;
ERROR 1370 (42000): execute command denied to user 'u1'@'localhost' for routine 'greatsql.udt1'

-- Switch to ORACLE mode first
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT udt1(1, 'c1_row1') FROM DUAL;
+-----------------------------------------------+
| udt1(1, 'c1_row1')                            |
+-----------------------------------------------+
|    c1_row1                                   |
+-----------------------------------------------+
1 row in set (0.00 sec)
``` 

- 3. Example 3: `CREATE TYPE AS TABLE/VARRAY OF udt_name`

```sql
greatsql> SET sql_mode = Oracle;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(10));
greatsql> CREATE OR REPLACE TYPE udt2 AS OBJECT(id INT, c1 VARCHAR(10));

greatsql> SELECT @@tf_udt_table_max_rows;
+-----------------------+---------+
| Variable_name         | Value   |
+-----------------------+---------+
| tf_udt_table_max_rows | 1048576 |
+-----------------------+---------+

greatsql> CREATE OR REPLACE TYPE udt1_varray AS VARRAY(1) OF udt1;

greatsql> CREATE OR REPLACE TYPE udt1_varray AS VARRAY(1048577) OF udt1;
ERROR 7556 (HY000): The number of records generated by UDT_TABLE() cannot exceed 1048576 (1048577 requested). Try increasing @@tf_udt_table_max_rows to a larger value.

greatsql> CREATE OR REPLACE TYPE udt1_table AS TABLE OF udt1;

greatsql> SELECT udt1_table(udt1(1, 'c1_row1'), udt1(2, 'c1_row2'));
+----------------------------------------------------+
| udt1_table(udt1(1, 'c1_row1'), udt1(2, 'c1_row2')) |
+----------------------------------------------------+
| udt1_table(udt1(1,c1_row1),udt1(2,c1_row2))        |
+----------------------------------------------------+

greatsql> SELECT udt1_table(udt1(1,'c1_row1'), udt2(2,'c1_row2'));
ERROR 7550 (HY000): inconsistent datatypes: expected 'greatsql'.'udt1' got 'greatsql'.'udt2'

greatsql> SELECT udt1_varray(udt1(1, 'c1_row1'), udt1(2,'c1_row2'));
ERROR 3950 (HY000): Out of memory

greatsql> SELECT udt1_varray(udt1(1, 'c1_row1'));
+---------------------------------+
| udt1_varray(udt1(1, 'c1_row1')) |
+---------------------------------+
| udt1_varray(udt1(1,c1_row1))    |
+---------------------------------+
```

- 4. Example 4: `CREATE TYPE AS TABLE/VARRAY OF TYPE`

```sql
greatsql> CREATE OR REPLACE TYPE my_int IS VARRAY(100) OF INT;

greatsql> SELECT my_int('1', 0, 1);
+-------------------+
| my_int('1', 0, 1) |
+-------------------+
| my_int(1,0,1)     |
+-------------------+

greatsql> CREATE OR REPLACE TYPE my_vchar IS VARRAY(100) OF VARCHAR2(8000);

greatsql> SELECT my_vchar('1', 'GreatSQL', 'GreatSQL is a branch of MySQL');
+------------------------------------------------------------+
| my_vchar('1', 'GreatSQL', 'GreatSQL is a branch of MySQL') |
+------------------------------------------------------------+
| my_vchar(1,GreatSQL,GreatSQL is a branch of MySQL)         |
+------------------------------------------------------------+
```

## 5. TABLE UDT Data Dictionary

```sql
-- 1. Query information_schema.ROUTINES to view all UDTs
greatsql> SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_NAME LIKE 'UDT%';
+----------------+--------------+--------------+
| ROUTINE_SCHEMA | ROUTINE_NAME | ROUTINE_TYPE |
+----------------+--------------+--------------+
| greatsql       | udt1         | TYPE         |
| greatsql       | udt2         | TYPE         |
| greatsql       | udt1_varray  | TYPE         |
| greatsql       | udt1_table   | TYPE         |
+----------------+--------------+--------------+

-- 2. Query information_schema.PARAMETERS to view the UDT definition
greatsql> SELECT SPECIFIC_SCHEMA, SPECIFIC_NAME, ORDINAL_POSITION, PARAMETER_NAME, DATA_TYPE, CHARACTER_OCTET_LENGTH
  FROM information_schema.PARAMETERS WHERE SPECIFIC_NAME LIKE 'UDT%';
+-----------------+---------------+------------------+----------------+-----------+------------------------+
| SPECIFIC_SCHEMA | SPECIFIC_NAME | ORDINAL_POSITION | PARAMETER_NAME | DATA_TYPE | CHARACTER_OCTET_LENGTH |
+-----------------+---------------+------------------+----------------+-----------+------------------------+
| greatsql        | udt1          |                1 | id             | int       |                   NULL |
| greatsql        | udt1          |                2 | c1             | char      |                     40 |
| greatsql        | udt2          |                1 | id             | int       |                   NULL |
| greatsql        | udt2          |                2 | c1             | varchar   |                     40 |
+-----------------+---------------+------------------+----------------+-----------+------------------------+
```

## 6. Export and Backup

When using `mysqldump` to export data, you can export UDT objects by specifying the `--routines` option (disabled by default).

Example:
```
mysqldump -S/data/GreatSQL/mysql.sock -uroot -pxxx -B greatsql -d --routines > /data/backup/GreatSQL/greatsql-ddl.sql
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
