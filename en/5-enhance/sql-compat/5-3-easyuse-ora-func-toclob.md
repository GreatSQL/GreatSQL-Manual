# Oracle Compatibility - Function - TO_CLOB()

---

## 1. Syntax

```sql
TO_CLOB( expression )
```

## 2. Definition and Usage

The `TO_CLOB()` function converts `expression` to the `CLOB` type, and at the same time converts its encoding format to the character set of the current database (Schema), `character_set_database`, and finally outputs the conversion result.

In GreatSQL, the CLOB-compatible types include: `CLOB`, `TINYTEXT`, `TEXT`, `MEDIUMTEXT`, `LONGTEXT`, etc.

## 3. Oracle Compatibility Notes

1. When the `TO_CLOB()` function encounters a character set encoding conflict during conversion, a warning is raised, and the returned result may be NULL.

For example, when the database encoding (`character_set_database`) is `utf8mb4`, perform the following operations:
```
greatsql> SELECT @@character_set_database;
+--------------------------+
| @@character_set_database |
+--------------------------+
| utf8mb4                  |
+--------------------------+

greatsql> SELECT TO_CLOB(0x80) FROM DUAL;
+---------------+
| TO_CLOB(0x80) |
+---------------+
| NULL          |
+---------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+----------------------------------------+
| Level   | Code | Message                                |
+---------+------+----------------------------------------+
| Warning | 1300 | Invalid utf8mb4 character string: '80' |
+---------+------+----------------------------------------+
```

2. Since GreatSQL and Oracle inherently differ in the handling and display of certain data types, such as date-time and LOB types, this may cause the results obtained by the `TO_CLOB()` function in GreatSQL to be inconsistent with Oracle. Therefore, the focus of `TO_CLOB()` in GreatSQL is **to convert to a CLOB-compatible type and set the encoding format, without guaranteeing that the output content is strictly consistent with Oracle**.

**Example 1: Date type conversion**

- The output in Oracle is:

```sql
SQL> SELECT SYSDATE, TO_CLOB(SYSDATE) FROM DUAL;

SYSDATE   TO_CLOB(SYSDATE)
--------- --------------------------------------------------------------------------------
06-NOV-23 06-NOV-23
```

- The output in GreatSQL is:

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SELECT SYSDATE, TO_CLOB(SYSDATE) FROM DUAL;
+----------------------------+----------------------------+
| SYSDATE                    | TO_CLOB(SYSDATE)           |
+----------------------------+----------------------------+
| 2023-11-06 10:56:41.121699 | 2023-11-06 10:56:41.121699 |
+----------------------------+----------------------------+

greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT SYSDATE, TO_CLOB(SYSDATE) FROM DUAL;
+---------------------+---------------------+
| SYSDATE             | TO_CLOB(SYSDATE)    |
+---------------------+---------------------+
| 2023-11-06 10:57:32 | 2023-11-06 10:57:32 |
+---------------------+---------------------+
```

**Example 2: LOB type conversion**

- The output in Oracle is:

```sql
-- Initialize data
SQL> CREATE TABLE t_clob(id number(4), a clob, b blob);
SQL> INSERT INTO t_clob(id,a,b) VALUES(1, 'ABC123', 'ABC123'),
(2, utl_raw.CAST_FROM_BINARY_INTEGER(123), utl_raw.CAST_FROM_BINARY_INTEGER(123)),
(3, utl_raw.CAST_TO_RAW('ABC123'), utl_raw.CAST_TO_RAW('ABC123'));

-- Execute the following SQL
SQL> SELECT * FROM t_clob;

        ID A                                                       B
---------- ------------------------------------------------------- -------------------------
         1 ABC123                                                  ABC123
         2 0000007B                                                0000007B
         3 414243313233                                            414243313233

SQL> SELECT id,TO_CLOB(a),TO_CLOB(b) FROM t_clob;

        ID TO_CLOB(A)                                              TO_CLOB(B)
---------- ------------------------------------------------------- -------------------------
         1 ABC123                                                  ����#
         2 0000007B                                                   {
         3 414243313233                                            ABC123
```

- The output in GreatSQL is:

```sql
-- Initialize data
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE TABLE t_clob(id INT NOT NULL PRIMARY KEY, a CLOB, b BLOB);
greatsql> INSERT INTO t_clob(id,a,b) VALUES(1, 'ABC123', 'ABC123'),
(2, utl_raw.CAST_FROM_BINARY_INTEGER(123), utl_raw.CAST_FROM_BINARY_INTEGER(123)),
(3, utl_raw.CAST_TO_RAW('ABC123'), utl_raw.CAST_TO_RAW('ABC123'));

-- Execute the following SQL
-- Before executing the SQL below, the GreatSQL client tool needs to set the "--binary-as-hex" parameter first, for example: mysql --binary-as-hex
greatsql> SELECT * FROM t_clob;
+------+--------+----------------+
| id   | a      | b              |
+------+--------+----------------+
|    1 | ABC123 | 0x414243313233 |
|    2 |    {   | 0x0000007B     |
|    3 | ABC123 | 0x414243313233 |
+------+--------+----------------+

greatsql> SELECT id,TO_CLOB(a),TO_CLOB(b) FROM t_clob;
+------+------------+------------+
| id   | TO_CLOB(a) | TO_CLOB(b) |
+------+------------+------------+
|    1 | ABC123     | ABC123     |
|    2 |    {       |    {       |
|    3 | ABC123     | ABC123     |
+------+------------+------------+
```

3. When the parameter `expression` contains escape characters (for example: \0 \\' '' \\" \\\\ etc.), they are treated as 1 character instead of 2 characters.

As shown in the example below, executing `SELECT TO_CLOB('\\') FROM DUAL;` produces different results:

- The output in Oracle is:

```
SQL> SELECT TO_CLOB('\\') FROM DUAL;

TO_CLOB('\\')
--------------------------------------------------------------------------------
\\
```

- The output in GreatSQL is:

```
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT TO_CLOB('\\') FROM DUAL;
+---------------+
| TO_CLOB('\\') |
+---------------+
| \             |
+---------------+
```

## 4. Examples

```sql
greatsql> SELECT TO_CLOB(123), TO_CLOB('ABC123\\'), TO_CLOB(123.456), TO_CLOB(1+1) FROM DUAL;
+--------------+---------------------+------------------+--------------+
| TO_CLOB(123) | TO_CLOB('ABC123\\') | TO_CLOB(123.456) | TO_CLOB(1+1) |
+--------------+---------------------+------------------+--------------+
| 123          | ABC123\             | 123.456          | 2            |
+--------------+---------------------+------------------+--------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
