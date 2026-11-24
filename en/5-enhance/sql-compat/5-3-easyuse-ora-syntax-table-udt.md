# Oracle Compatibility - Syntax - TABLE UDT
---

## 1. Syntax

```sql

1. CREATE TABLE table_name(column_name type, column_name type ...) 
  type：normally type/udt type:[db.]type(不支持varray/table类型udt).

2. INSERT INTO table_name VALUES(values) 
   values:normally value/udt value
   udt value:[db.]udt_name(values)

3.  ALTER TABLE table_name DROP/ADD [column] column_name udt_type
    udt_type:[db.]udt_name(values)

4. set @@udt_format_result=['BINARY'/'DBA'];
```

You need to switch to `ORACLE` mode first to support this syntax.

## 2. Definition and Usage

GreatSQL supports user-defined TABLE types, and the following usages are supported:

- Syntax 1: execute `CREATE TABLE(udt_name udt_type)` to create a UDT column.

- Syntax 2: insert UDT values into a UDT column.

- Syntax 3: add and drop UDT columns (note: alter does not support the modify operation).

- Syntax 4: the `udt_format_result` session option can be set to specify the output format of UDT type data.

The TABLE UDT of GreatSQL has the following restrictions:

1. TABLE UDT cannot be used across Schemas.

2. In ORACLE mode, the keyword `TYPE` cannot be used as a Schema name or User name.

3. Currently only the `name = udt_type()` function is supported; UDT columns cannot be used in other built-in functions.

4. UDT columns do not support data types such as `TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB`.

## 3. Oracle Compatibility Notes

The compatibility of TABLE UDT in GreatSQL with Oracle is described as follows:

1. Setting default values for UDT columns is not supported, and attributes such as `PRIMARY KEY/FOREIGN KEY/CONSTRAINT/NULL/NOT NULL/INVISIBLE/VIRTUAL` cannot be set either.

2. Only UDT values can be inserted into UDT columns; other types of values cannot be inserted into UDT columns; UDT values cannot be inserted into columns of other types either.

3. Operations such as `CREATE INDEX/ORDER BY/GROUP BY/PARTITION BY/CREATE VIEW/ALTER MODIFY` are not supported for UDT columns.

4. Only adding and dropping UDT columns are supported; `MODIFY` to change a UDT column is not supported.

5. `CREATE VIEW` is supported, and the table_count value of mysql.routines does not change. The difference is that if a table using the udt type is dropped while the view is not dropped, the udt type can still be dropped.

6. The member columns of a UDT column cannot be used independently in separate SQL statements, for example, the usage `udt_type.id` (Oracle supports this usage).

7. UDT columns cannot be used in most built-in functions, except for comparison in query conditions and `ISNULL/IS NOT NULL`, for example, `WHERE c1 = udt_type1(1, 'r1')`.

8. UDT columns do not support the `CREATE TEMPORARY TABLE` usage.

9. When executing `SHOW CREATE TABLE WITH udt_type`, the UDT column type displayed is the name of the TYPE.

10. The default value of the `udt_format_result` option is `BINARY`, that is, the output result is displayed in BINARY format; otherwise it is displayed in the normal format (`udt_format_result = DBA`).

11. Data types such as `BLOB/MEDIUM_BLOB/LONG_BLOB/TINY_BLOB` are not supported.

12. For operations on cross-schema tables, the Schema names specified for the UDT type and the UDT table must be consistent, as follows:
```
greatsql> use greatsql;

-- In the following example, udt_type1 is equivalent to greatsql.udt_type1
-- t1 will fail to be created here, because t1 is in db2 while udt_type1 is in greatsql, not in the same Schema
greatsql> CREATE TABLE db2.t1(id INT, u1 udt_type1);

-- In the following example, udt_type1 is equivalent to greatsql.udt_type1
-- The insert fails here, because t1 is in db2 while udt_type1 is in greatsql, not in the same Schema
greatsql> INSERT INTO db2.t1 VALUES(1, udt_type1(1, 'a'));Here udt_type1 refers to db1.udt_type1.

-- It needs to be modified as follows
greatsql> INSERT INTO db2.t1 VALUES(1, db2.udt_type1(1, 'a'));

-- Here it refers to db1.udt_type1; to create it successfully, db2.udt_type1 needs to be specified
greatsql> ALTER TABLE db2.t1 ADD c2 udt_type1;
```

13. The insert statements `INSERT INTO t1 VALUES udt_type(NULL)` and `INSERT INTO t1 VALUES(NULL)` actually write different values. After writing, executing the query `SELECT * FROM t1 WHERE udt_type IS NULL` returns the latter, not the former.

14. In comparison queries similar to `SELECT * FROM t1 WHERE udt_type1 [<|=|>] udt_type1`, if it is a string, the comparison is performed in `BINARY` format; while in Oracle, an error is reported directly when it is less than or greater than, and an empty value is returned directly when it is equal. This is inconsistent with Oracle.

15. In comparison queries similar to `SELECT * FROM t1 WHERE udt_type1 [<|=|>] udt_type2`, since the `udt name` of `udt_type1` is not equal to the `udt name` of `udt_type2`, an error is reported; while Oracle returns an empty value directly for equality queries. This is inconsistent with Oracle.

16. By querying whether the `extra` column of the system table `information_schema.COLUMNS` contains `udt_name` information, you can know which table columns have the udt type. For example:
```sql
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, EXTRA FROM information_schema.COLUMNS WHERE TABLE_NAME = 'udt_t1';
+--------------+------------+-------------+-----------+-----------------+
| TABLE_SCHEMA | TABLE_NAME | COLUMN_NAME | DATA_TYPE | EXTRA           |
+--------------+------------+-------------+-----------+-----------------+
| greatsql     | udt_t1     | id          | int       |                 |
| greatsql     | udt_t1     | c1          | udt1      | udt_name="udt1" |
+--------------+------------+-------------+-----------+-----------------+
2 rows in set (0.00 sec)
```

## 4. Examples

- 1. Example 1: `CREATE TABLE` usage

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);


-- Unsupported usage
greatsql> CREATE OR REPLACE TYPE udt_t1 IS TABLE OF INT;
greatsql> CREATE TABLE t1(id INT, c1 udt_t1);
ERROR 1235 (42000): This version of MySQL doesn't yet support 'create table with udt table'
```

- 2. Example 2: `INSERT INTO TABLE` usage

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> set udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);
greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1'));
greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
+------+-------------------+
1 row in set (0.00 sec)
```

- 3. Example 3: `ALTER TABLE ADD`

```sql
greatsql> SET SQL_MODE=ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> ALTER TABLE udt_t1 ADD c2 udt1;
Query OK, 0 rows affected (0.00 sec)
Records: 0  Duplicates: 0  Warnings: 0

greatsql> SHOW CREATE TABLE udt_t1\G
*************************** 1. row ***************************
       Table: udt_t1
Create Table: CREATE TABLE `udt_t1` (
  `id` int DEFAULT NULL,
  `c1` udt1 DEFAULT NULL,
  `c2` udt1 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)
```

- 4. Example 4: `ALTER TABLE DROP`

```sql
greatsql> SET SQL_MODE=ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> ALTER TABLE udt_t1 ADD c2 udt1;
greatsql> ALTER TABLE udt_t1 DROP c2;

greatsql> SHOW CREATE TABLE udt_t1\G
*************************** 1. row ***************************
       Table: udt_t1
Create Table: CREATE TABLE `udt_t1` (
  `id` int DEFAULT NULL,
  `c1` udt1 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

- 5. Example 5: `DROP TABLE/DROP TYPE`

```sql
greatsql> SET sql_mode = ORACLE;

-- Before dropping the UDT, the associated tables must be dropped first, otherwise it will fail
greatsql> DROP TYPE udt1;
ERROR 7549 (HY000): Failed to drop type t_air with type or table dependents.

greatsql> DROP TABLE udt_t1;
Query OK, 0 rows affected (0.00 sec)

greatsql> DROP TYPE udt1;
Query OK, 0 rows affected (0.00 sec)
```

- 6. Example 6: `CREATE VIEW`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> CREATE VIEW v1 AS SELECT * FROM udt_t1;
greatsql> SHOW CREATE VIEW v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` AS SELECT `udt_t1`.`id` AS `id`,`udt_t1`.`c1` AS `c1` from `udt_t1`
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
```

- 7. Example 7: queries and functions

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM udt_t1 WHERE c1 = udt1(1, 'c1_row1');
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
+------+-------------------+
1 row in set (0.00 sec)

greatsql> SELECT c1 || udt1(3, 'c1_row3') FROM udt_t1;
ERROR 1235 (42000): This version of MySQL doesn't yet support 'udt type columns used in function'

greatsql> SELECT c1 FROM udt_t1 GROUP BY c1;
ERROR 7548 (HY000): cannot ORDER objects without window function or ORDER method

greatsql> ALTER TABLE udt_t1 ADD c2 udt1;
greatsql> SELECT * FROM udt_t1;
+------+-------------------+------+
| id   | c1                | c2   |
+------+-------------------+------+
|    1 | id:1 | c1:c1_row1 | NULL |
|    2 | id:2 | c1:c1_row2 | NULL |
+------+-------------------+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM udt_t1 WHERE c2 IS NULL;
+------+-------------------+------+
| id   | c1                | c2   |
+------+-------------------+------+
|    1 | id:1 | c1:c1_row1 | NULL |
|    2 | id:2 | c1:c1_row2 | NULL |
+------+-------------------+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM udt_t1 WHERE ISNULL(c2);
+------+-------------------+------+
+------+-------------------+------+
| id   | c1                | c2   |
+------+-------------------+------+
|    1 | id:1 | c1:c1_row1 | NULL |
|    2 | id:2 | c1:c1_row2 | NULL |
+------+-------------------+------+

greatsql> UPDATE udt_t1 SET c2 = c1 WHERE id = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM udt_t1;
+------+-------------------+-------------------+
| id   | c1                | c2                |
+------+-------------------+-------------------+
|    1 | id:1 | c1:c1_row1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 | NULL              |
+------+-------------------+-------------------+
2 rows in set (0.00 sec)

greatsql> SELECT c2 = c1, c2 > c1, c2 < c1 FROM udt_t1;
+---------+---------+----------+
| c2 = c1 | c2 > c1 | c2 < c1  |
+---------+---------+----------+
|       1 |       0 |        0 |
|    NULL |    NULL |     NULL |
+---------+---------+----------+
2 rows in set (0.00 sec)
```

- 8. Example 8: `UPDATE SET`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> UPDATE udt_t1 SET c1 = udt1(50, 'c1_row1') WHERE id = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM udt_t1;
+------+--------------------+
| id   | c1                 |
+------+--------------------+
|    1 | id:50 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2  |
+------+--------------------+
2 rows in set (0.00 sec)
```

- 9. Example 9: `CURSOR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  CURSOR cur1 (i_id INT) IS SELECT * FROM udt_t1 WHERE id = i_id;
  rec cur1%ROWTYPE;
BEGIN
  FOR rec IN cur1(2)
  LOOP
    SELECT rec.id, rec.c1;
  END LOOP;
END; //

greatsql> CALL p1() //
+--------+-------------------+
| rec.id | rec.c1            |
+--------+-------------------+
|      2 | id:2 | c1:c1_row2 |
+--------+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 10. Example 10: `%TYPE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 CHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c1 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1')), (2, udt1(2, 'c1_row2'));

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)

greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1(min INT,max INT) AS
  CURSOR cur(pmin INT, pmax INT) IS SELECT c1 FROM udt_t1 WHERE id BETWEEN pmin AND pmax;
  v_c1 udt_t1.c1%TYPE;
BEGIN
  OPEN cur(min, max);
  LOOP
    FETCH cur INTO v_c1;
    EXIT WHEN cur%NOTFOUND;
    SELECT v_c1;
  END LOOP;
  CLOSE cur;
END; //

greatsql> CALL p1(1,10) //
+-------------------+
| v_c1              |
+-------------------+
| id:1 | c1:c1_row1 |
+-------------------+
1 row in set (0.00 sec)

+-------------------+
| v_c1              |
+-------------------+
| id:2 | c1:c1_row2 |
+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 11. Example 11: udt_format_result

The client establishes a new connection with the parameter `--binary-as-hex`:
```
$ mysql -A -S/data/GreatSQL/mysql.sock --binary-as-hex greatsql

-- When the connection is established with --binary-as-hex, the following marker appears
greatsql> \s
...
Binary data as:         Hexadecimal
...

-- The default value of the parameter udt_format_result is BINARY
greatsql> SELECT @@udt_format_result;
+---------------------+
| @@udt_format_result |
+---------------------+
| BINARY              |
+---------------------+

greatsql> SELECT * FROM udt_t1;
+------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| id   | c1                                                                                                                                                                           |
+------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|    1 | 0xFC0100000063315F726F773120202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020 |
|    2 | 0xFC0200000063315F726F773220202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020 |
+------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
2 rows in set (0.00 sec)

-- Modify udt_format_result = 'DBA'
greatsql> SET udt_format_result = 'DBA';

greatsql> SELECT * FROM udt_t1;
+------+-------------------+
| id   | c1                |
+------+-------------------+
|    1 | id:1 | c1:c1_row1 |
|    2 | id:2 | c1:c1_row2 |
+------+-------------------+
2 rows in set (0.00 sec)
```

## 5. TABLE UDT Data Dictionary

```sql
-- 1. Query information_schema.ROUTINES to view all UDTs
greatsql> SELECT * FROM information_schema.ROUTINES WHERE ROUTINE_NAME = 'UDT1'\G
*************************** 1. row ***************************
           SPECIFIC_NAME: udt1
         ROUTINE_CATALOG: def
          ROUTINE_SCHEMA: greatsql
            ROUTINE_NAME: udt1
            ROUTINE_TYPE: TYPE
               DATA_TYPE:
CHARACTER_MAXIMUM_LENGTH: NULL
  CHARACTER_OCTET_LENGTH: NULL
       NUMERIC_PRECISION: NULL
           NUMERIC_SCALE: NULL
      DATETIME_PRECISION: NULL
      CHARACTER_SET_NAME: NULL
          COLLATION_NAME: NULL
          DTD_IDENTIFIER: NULL
            ROUTINE_BODY: SQL
      ROUTINE_DEFINITION:
           EXTERNAL_NAME: NULL
       EXTERNAL_LANGUAGE: SQL
         PARAMETER_STYLE: SQL
        IS_DETERMINISTIC: NO
         SQL_DATA_ACCESS: CONTAINS SQL
                SQL_PATH: NULL
           SECURITY_TYPE: DEFINER
                 CREATED: 2023-11-21 13:51:40
            LAST_ALTERED: 2023-11-21 13:51:47
                SQL_MODE: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
         ROUTINE_COMMENT:
                 DEFINER: root@localhost
    CHARACTER_SET_CLIENT: utf8mb4
    COLLATION_CONNECTION: utf8mb4_0900_ai_ci
      DATABASE_COLLATION: utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 2. Query information_schema.PARAMETERS to view the UDT definition
greatsql> SELECT * FROM information_schema.PARAMETERS WHERE SPECIFIC_NAME = 'udt1'\G
*************************** 1. row ***************************
        SPECIFIC_CATALOG: def
         SPECIFIC_SCHEMA: greatsql
           SPECIFIC_NAME: udt1
        ORDINAL_POSITION: 1
          PARAMETER_MODE: IN
          PARAMETER_NAME: id
               DATA_TYPE: int
CHARACTER_MAXIMUM_LENGTH: NULL
  CHARACTER_OCTET_LENGTH: NULL
       NUMERIC_PRECISION: 10
           NUMERIC_SCALE: 0
      DATETIME_PRECISION: NULL
      CHARACTER_SET_NAME: NULL
          COLLATION_NAME: NULL
          DTD_IDENTIFIER: int
            ROUTINE_TYPE: TYPE
*************************** 2. row ***************************
        SPECIFIC_CATALOG: def
         SPECIFIC_SCHEMA: greatsql
           SPECIFIC_NAME: udt1
        ORDINAL_POSITION: 2
          PARAMETER_MODE: IN
          PARAMETER_NAME: c1
               DATA_TYPE: char
CHARACTER_MAXIMUM_LENGTH: 20
  CHARACTER_OCTET_LENGTH: 80
       NUMERIC_PRECISION: NULL
           NUMERIC_SCALE: NULL
      DATETIME_PRECISION: NULL
      CHARACTER_SET_NAME: utf8mb4
          COLLATION_NAME: utf8mb4_0900_ai_ci
          DTD_IDENTIFIER: char(20)
            ROUTINE_TYPE: TYPE
2 rows in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
