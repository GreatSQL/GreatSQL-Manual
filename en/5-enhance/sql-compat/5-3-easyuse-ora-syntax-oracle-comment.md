# Oracle Compatibility - Syntax - Oracle COMMENT
---

## 1. Syntax

In `ORACLE` mode, the GreatSQL client supports Oracle-style comment usage:

1. The Oracle-style comment marker is supported, that is, the comment content can be added directly after `--`, without requiring a space immediately after the comment marker as in the native GreatSQL mode.

2. Oracle-style comment markers are supported in SQL statements, views, functions, stored procedures, triggers, and packages.

```sql
SET sql_mode = ORACLE;

--comment notes

-- comment notes
```

## 2. Oracle Compatibility Notes

The GreatSQL client differs in whether a space **immediately follows the comment marker**:

1. After switching to ORACLE mode, the GreatSQL client supports placing comment content immediately after the comment marker `--` without adding a space.

2. In the GreatSQL client, **if there is no space immediately after the comment marker `--`**, the content up to the first semicolon `;` in the comment will be treated as a terminator (provided that the delimiter is also a semicolon `;`, i.e., `DELIMITER ;`), and the content after the terminator will be submitted as an SQL request. **If a space immediately follows the comment marker `--`**, all content on the same line will be treated as comment content and will not be submitted as an SQL request.

3. Each comment marker `--` can only cover the same line; when starting a new line, the comment marker needs to be added again, otherwise it will be submitted as an SQL request.

Several examples show the differences:

```sql
greatsql> SET sql_mode = ORACLE;

-- 1. When there is no space immediately after the comment marker, the first semicolon ; is treated as a terminator, and the content after the terminator is submitted as an SQL request.
greatsql> --a;b;
Query OK, 0 rows affected (0.00 sec)

ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'b' at line 1

-- Change the delimiter to something other than a semicolon
greatsql> DELIMITER //
greatsql> --a;b; //
Query OK, 0 rows affected (0.00 sec)
greatsql> DELIMITER ;

-- 2. If a space immediately follows the comment marker `--`, all content on the same line is treated as comment content and is not submitted as an SQL request.
greatsql> -- a;b;
greatsql>

-- 3. Each comment marker `--` can only cover the same line; when starting a new line, the comment marker needs to be added again, otherwise it will be submitted as an SQL request.
greatsql> --a
    -> b;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'b' at line 2
```

## 4. Examples

First create a test table and insert data:

```sql
greatsql> CREATE TABLE t1(a INT NOT NULL, b INT NOT NULL, c INT NOT NULL);
Query OK, 0 rows affected (0.07 sec)

greatsql> INSERT INTO t1 VALUES(1,1,1), (10,10,10), (20,20,20);
```

- Example 1. Regular usage

```sql
greatsql> SET sql_mode = DEFAULT;

-- In DEFAULT mode, comment markers without a space are not supported and are treated as operators
greatsql> SELECT t1.a --t1.b
  , t1.c FROM t1;
+-------------+----+
| t1.a --t1.b | c  |
+-------------+----+
|           2 |  1 |
|          20 | 10 |
|          40 | 20 |
+-------------+----+

-- In DEFAULT mode, a space must follow the comment marker
greatsql> SELECT t1.a -- t1.b
  , t1.c FROM t1;
+----+----+
| a  | c  |
+----+----+
|  1 |  1 |
| 10 | 10 |
| 20 | 20 |
+----+----+

-- Switch to ORACLE mode; whether a space follows the comment marker has the same effect
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT t1.a,
 --t1.b,
 t1.c
 FROM t1;
+----+----+
| a  | c  |
+----+----+
|  1 |  1 |
| 10 | 10 |
| 20 | 20 |
+----+----+

greatsql> SELECT t1.a,
 -- t1.b,
 t1.c
 FROM t1;
+----+----+
| a  | c  |
+----+----+
|  1 |  1 |
| 10 | 10 |
| 20 | 20 |
+----+----+
```

- Example 2. Using comment markers in a view (`VIEW`)

```sql
-- Create a view based on example 1
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE VIEW v1 AS--SELECT SYSDATE FROM DUAL
 --SELECT SYSDATE FROM DUAL
 SELECT * FROM t1;

greatsql> SELECT * FROM v1;
+----+----+----+
| a  | b  | c  |
+----+----+----+
|  1 |  1 |  1 |
| 10 | 10 | 10 |
| 20 | 20 | 20 |
+----+----+----+
```

- Example 3. Using comment markers in a stored procedure (`STORED PROCEDURE`)

```
-- Create a stored procedure based on example 1
greatsql> SET sql_mode = ORACLE;

greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1 AS--SELECT SYSDATE AS D1 FROM DUAL
 --SELECT SYSDATE AS D2 FROM DUAL
 BEGIN--SELECT SYSDATE AS D5 FROM DUAL
 --SELECT SYSDATE AS D6 FROM DUAL
 SELECT * FROM t1 WHERE a=1;--SELECT SYSDATE AS D7 FROM DUAL
 --SELECT SYSDATE AS D8 FROM DUAL
 end;--SELECT SYSDATE AS D8 FROM DUAL
//

greatsql> CALL p1() //
+---+---+---+
| a | b | c |
+---+---+---+
| 1 | 1 | 1 |
+---+---+---+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
