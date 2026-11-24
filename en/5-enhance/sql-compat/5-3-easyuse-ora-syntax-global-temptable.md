# Oracle Compatibility - Syntax - GLOBAL|PRIVATE TEMPORARY TABLE
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

create_temporary_table:
	create_global_temporary | create_private_temporary

create_global_temporary:
	CREATE GLOBAL TEMPORARY TABLE 
	[ schema . ] table_ident [ ( relational_properties ) ]
	[ ON COMMIT { DELETE | PRESERVE } ROWS ]
	table_properties

create_private_temporary:
	CREATE PRIVATE TEMPORARY TABLE 
	[ schema . ] table_ident [ ( relational_properties ) ]
	[ ON COMMIT { DROP | PRESERVE } DEFINITION ]
	table_properties
```
This syntax is supported only after switching to the `ORACLE` mode.

## 2. Definition and Usage

GreatSQL supports creating two different temporary tables: `GLOBAL` and `PRIVATE`.

- 1. Creating a `GLOBAL TEMPORARY TABLE`.
  - A temporary table definition is created immediately, but the temporary table entity is not created immediately.
  - The entity is actually created when a SQL statement has an insert operation. If the SQL statement does not insert any records after creation, the temporary table instance is dropped at the end of that SQL statement.
  - When the `ON COMMIT` clause specifies `DELETE ROWS`, the temporary table instance is dropped at the end of the current transaction;
  - When the `ON COMMIT` clause specifies `PRESERVE ROWS`, the temporary table instance and its contents are preserved at the end of the current transaction.
  - When the `ON COMMIT` clause is omitted, the default is `DELETE ROWS`.
  - The temporary table instance is dropped when the current connection session ends.
  - Executing `TRUNCATE` also drops the temporary table instance.
  - When any instance of the temporary table is created in the system, DDL operations on the temporary table are not allowed, for example: `ALTER TABLE`, `CREATE INDEX`, etc.
  - Executing `DROP TABLE` immediately drops the temporary table instance of the current session (if it exists) and the temporary table definition. If the temporary table instance was created by another session, only the temporary table instance of the current session is dropped, and an error is reported when dropping the temporary table definition.
  - Executing `SHOW CREATE TABLE` shows whether the current session has created a temporary table instance. If the current session has such a temporary table instance (for example, data has been written to the table), it is displayed as `CREATE TEMPORARY TABLE` without the `GLOBAL` identifier.

- 2. Creating a `PRIVATE TEMPORARY TABLE`.
  - A temporary table is created immediately.
  - When the `ON COMMIT` clause specifies `DROP DEFINITION`, the temporary table is dropped at the end of the current transaction.
  - When the `ON COMMIT` clause specifies `PRESERVE DEFINITION`, the temporary table is preserved at the end of the current transaction.
  - When the `ON COMMIT` clause is omitted, the default is `DROP DEFINITION`.
  - The temporary table is dropped when the current session ends.
  - Executing `DROP TABLE` drops the temporary table.

## 3. Oracle Compatibility Notes

1. The maintenance and usage of temporary tables are based on GreatSQL temporary tables. Therefore, any temporary table can only be referenced once in the current statement. For example, if t1 is a temporary table, `SELECT * FROM t1 UNION SELECT * FROM t1` reports an error. See the detailed case below.
2. In an MGR environment, when one node creates a temporary table instance, DDL operations on other nodes are not blocked by locks; only the temporary table definition is operated on according to the current DDL operation rules in the MGR environment.
3. Same as GreatSQL temporary tables, the `SHOW TABLES` command does not display the created `GLOBAL|PRIVATE TEMPORARY TABLE` temporary table instances.
4. If a native GreatSQL `TEMPORARY TABLE` with the same name is created at the same time as a `GLOBAL TEMPORARY TABLE`, subsequent SQL statements give priority to the native `TEMPORARY TABLE`.
5. Consistent with the data types supported by regular GreatSQL temporary tables, no error is reported when the temporary table contains `BLOB` type columns.
6. Creating triggers on `GLOBAL TEMPORARY TABLE` is not supported. However, triggers and views can reference `GLOBAL TEMPORARY TABLE`.
7. When executing `RENAME TABLE` and `ALTER TABLE .. RENAME` statements, there must be no instance of the `GLOBAL TEMPORARY TABLE` with the same name at that time (Oracle does not have this restriction).
8. The `AUTO_INCREMENT` field of each `GLOBAL TEMPORARY TABLE` instance always starts from 1 (Oracle does not have this constraint).
9. After a temporary table instance is created, when the database where the `GLOBAL TEMPORARY TABLE` resides is dropped in any session, the temporary table instance continues to exist. If a database with the same name and a `GLOBAL TEMPORARY TABLE` with the same name are subsequently created, the already-generated temporary table instance is not affected.
10. Since specifying a primary key is not supported in `PRIVATE TEMPORARY TABLE`, a primary key cannot be explicitly specified when creating a `PRIVATE TEMPORARY TABLE`, and `sql_generate_invisible_primary_key=0` must be set to avoid implicitly creating a primary key; otherwise, the usage is reported as unsupported.
11. Executing a `TRUNCATE` statement terminates the current transaction and affects the temporary tables created in the current transaction.

## 4. Examples

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TEMPORARY TABLE t1 (id INT);
Query OK, 0 rows affected (0.01 sec)

greatsql> INSERT INTO t1 VALUES (1);
Query OK, 1 row affected (0.00 sec)

-- 1. An ordinary temporary table can only be referenced once in the same SQL statement
greatsql> SELECT * FROM t1 UNION SELECT * FROM t1;
ERROR 1137 (HY000): Can not reopen table: 't1'

greatsql> SELECT * FROM t1;
+------+
| id   |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

-- 2. Create a GLOBAL TEMPORARY TABLE with different ON COMMIT clauses

-- Switch to ORACLE mode first
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE GLOBAL TEMPORARY TABLE gtt1 (
 id INT PRIMARY KEY,
 c1 VARCHAR(16));

-- The ON COMMIT clause is not specified; the default is DELETE ROWS
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT DELETE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- Specify ON COMMIT PRESERVE ROWS
greatsql> CREATE GLOBAL TEMPORARY TABLE gtt2 (
  id INT PRIMARY KEY,
  c1 VARCHAR(16)
) ON COMMIT PRESERVE ROWS;

greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT PRESERVE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO gtt1 SELECT 1, 'c11' FROM DUAL;
Query OK, 0 rows affected (0.40 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- No transaction is explicitly enabled in the SQL above; when the SQL execution ends, the transaction also ends, so no data can be queried
greatsql> SELECT * FROM gtt1;
Empty set (0.00 sec)

greatsql> INSERT INTO gtt2 SELECT 1, 'c12' FROM DUAL;
Query OK, 0 rows affected (0.04 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- Data can still be queried after the SQL statement ends
greatsql> SELECT * FROM gtt2;
+----+------+
| id | c1   |
+----+------+
|  1 | c12  |
+----+------+
1 row in set (0.00 sec)

-- View the DDL again; gtt1 remains unchanged
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT DELETE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- View the DDL again; gtt2 has become an ordinary temporary table
greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 3. Test with an explicitly started transaction
greatsql> DELETE FROM gtt1;
greatsql> DELETE FROM gtt2;

greatsql> BEGIN; 
greatsql> INSERT INTO gtt1 SELECT 1, 'c11' FROM DUAL;
greatsql> INSERT INTO gtt2 SELECT 1, 'c12' FROM DUAL;

-- The transaction has not been committed yet; data can be queried from the gtt1 table
greatsql> SELECT * FROM gtt1;
+----+------+
| id | c1   |
+----+------+
|  1 | c11  |
+----+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM gtt2;
+----+------+
| id | c1   |
+----+------+
|  1 | c12  |
+----+------+
1 row in set (0.00 sec)

-- View the DDL again; both have become ordinary temporary tables
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- After committing the transaction, query the data again; the gtt1 table has been emptied
greatsql> COMMIT;

greatsql> SELECT * FROM gtt1;
Empty set (0.00 sec)

greatsql> SELECT * FROM gtt2;
+----+------+
| id | c1   |
+----+------+
|  1 | c12  |
+----+------+
1 row in set (0.00 sec)

-- View the DDL again; gtt1 has been restored to GLOBAL TEMPORARY TABLE, while gtt2 remains an ordinary temporary table
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT DELETE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- 3. Create a PRIVATE TEMPORARY TABLE with different ON COMMIT clauses
-- 3.1 Specify the PRESERVE DEFINITION clause
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_s1(
id INT,
c1 VARCHAR(30)
)ON COMMIT PRESERVE DEFINITION;

greatsql> INSERT INTO ora$ptt_s1 VALUES (1, 'ora$ptt_s1-1');
greatsql> INSERT INTO ora$ptt_s1 VALUES (2, 'ora$ptt_s1-2');

-- View the table
greatsql> SHOW CREATE TABLE ora$ptt_s1\G
*************************** 1. row ***************************
       Table: ora$ptt_s1
Create Table: CREATE PRIVATE TEMPORARY TABLE "ora$ptt_s1" (
  "id" int DEFAULT NULL,
  "c1" varchar(30) DEFAULT NULL
) ON COMMIT PRESERVE DEFINITION ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- Query the data
greatsql> SELECT * FROM ora$ptt_s1;
+------+--------------+
| id   | c1           |
+------+--------------+
|    1 | ora$ptt_s1-1 |
|    2 | ora$ptt_s1-2 |
+------+--------------+
2 rows in set (0.00 sec)

-- 3.2 Specify the DROP DEFINITION clause

-- Start a transaction
greatsql> BEGIN;
-- The ON COMMIT clause is not specified; DROP DEFINITION is used by default
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t0(
id INT,
c1 VARCHAR(30)
);

greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t1(
id INT,
c1 VARCHAR(30)
) ON COMMIT DROP DEFINITION;

-- Insert data
greatsql> INSERT INTO ora$ptt_t0 VALUES (10, 'ora$ptt_t0-10');
greatsql> INSERT INTO ora$ptt_t0 VALUES (20, 'ora$ptt_t0-20');
greatsql> INSERT INTO ora$ptt_t1 VALUES (100, 'ora$ptt_t1-100');
greatsql> INSERT INTO ora$ptt_t1 VALUES (200, 'ora$ptt_t1-200');

-- View the table DDL
greatsql> SHOW CREATE TABLE ora$ptt_t0\G
*************************** 1. row ***************************
       Table: ora$ptt_t0
Create Table: CREATE PRIVATE TEMPORARY TABLE "ora$ptt_t0" (
  "id" int DEFAULT NULL,
  "c1" varchar(30) DEFAULT NULL
) ON COMMIT DROP DEFINITION ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SHOW CREATE TABLE ora$ptt_t1\G
*************************** 1. row ***************************
       Table: ora$ptt_t1
Create Table: CREATE PRIVATE TEMPORARY TABLE "ora$ptt_t1" (
  "id" int DEFAULT NULL,
  "c1" varchar(30) DEFAULT NULL
) ON COMMIT DROP DEFINITION ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- Query the data
greatsql> SELECT * FROM ora$ptt_t1;
+------+----------------+
| id   | c1             |
+------+----------------+
|  100 | ora$ptt_t1-100 |
|  200 | ora$ptt_t1-200 |
+------+----------------+
2 rows in set (0.00 sec)

-- Commit the transaction
greatsql> COMMIT;

-- Query the data
greatsql> SELECT * FROM ora$ptt_s1;
+------+--------------+
| id   | c1           |
+------+--------------+
|    1 | ora$ptt_s1-1 |
|    2 | ora$ptt_s1-2 |
+------+--------------+
2 rows in set (0.00 sec)

-- After the transaction is committed, the PRIVATE TEMPORARY TABLE is dropped
greatsql> SELECT * FROM ora$ptt_t0;
ERROR 1146 (42S02): Table 'greatsql.ora$ptt_t0' doesn't exist

greatsql> SELECT * FROM ora$ptt_t1;
ERROR 1146 (42S02): Table 'greatsql.ora$ptt_t1' doesn't exist

-- Explicitly specifying PRIMARY KEY, or when sql_generate_invisible_primary_key=1, reports unsupported
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t1(
id INT,
c1 VARCHAR(30),
PRIMARY KEY(id));
ERROR 7561 (HY000): unsupported feature with temporary table

greatsql> SET sql_generate_invisible_primary_key = 1;
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t1(
id INT,
c1 VARCHAR(30));
ERROR 7561 (HY000): unsupported feature with temporary table
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
