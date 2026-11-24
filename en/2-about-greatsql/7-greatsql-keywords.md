# Reserved Words & Keywords
---


In GreatSQL, **Reserved Words** and **Keywords** usually have special meanings. For example, `SELECT`/`DELETE`/`BIGINT` are all reserved words.

When using these Reserved Words as object names such as table names, column names, built-in function names, etc., special handling is required (it is usually recommended to enclose them in backticks "`") to avoid SQL syntax errors.

When using Keywords as object names such as table names, column names, built-in function names, etc., no special handling is required and no SQL syntax errors are reported.

As shown in the following example:
```sql
greatsql> CREATE TABLE interval (begin INT, end INT);
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'interval (begin INT, end INT)' at line 1
```

This is because **interval** is a reserved word and needs to be enclosed in "`", while **begin**/**end** are only keywords and do not need special handling. Modify as follows:
```sql
greatsql> CREATE TABLE `interval`(begin INT, end INT);
Query OK, 0 rows affected (0.08 sec)
```

In addition, note that starting from GreatSQL 8.0.32-24, after enabling the Oracle compatibility mode (`SET sql_mode=ORACLE`), object names all require special handling. For example:
```sql
greatsql> CREATE TABLE `interval`(`begin` INT, `end` INT);
Query OK, 0 rows affected (0.02 sec)
```
or
```sql
greatsql> CREATE TABLE "interval"("begin" INT, "end" INT);
Query OK, 0 rows affected (0.02 sec)
```
In the above two examples, double quotes **"** or backticks **`** can both be used.

In summary, it is strongly recommended to enclose object names with **"** or **`** when developing SQL or writing SQL statements, to avoid SQL syntax errors and ensure the fault tolerance of applications.

Reserved word and keyword information can also be found by querying the view `information_schema.KEYWORDS` (where RESERVED=1 indicates a reserved word, and the rest are keywords):
```sql
greatsql> SELECT * FROM information_schema.KEYWORDS WHERE WORD LIKE '%int%';
+----------------------------------------+----------+
| WORD                                   | RESERVED |
+----------------------------------------+----------+
| ACCESSIBLE                             |        1 |
| ACCOUNT                                |        0 |
| ACTION                                 |        0 |
| ACTIVE                                 |        0 |
| ADD                                    |        1 |
| ADMIN                                  |        0 |
...
| XML                                    |        0 |
| XOR                                    |        1 |
| YEAR                                   |        0 |
| YEAR_MONTH                             |        1 |
| ZEROFILL                               |        1 |
| ZONE                                   |        0 |
+----------------------------------------+----------+
766 rows in set (0.00 sec)
```

Among them, the reserved words and keywords newly added by GreatSQL relative to MySQL are as follows:
```sql
+----------------------------------------+----------+
| WORD                                   | RESERVED |
+----------------------------------------+----------+
| CLIENT_STATISTICS                      |        0 |
| CLOB                                   |        1 |
| CLUSTERING                             |        1 |
| COMPRESSION_DICTIONARY                 |        0 |
| EFFECTIVE                              |        0 |
| INDEX_STATISTICS                       |        0 |
| PLAN                                   |        1 |
| ROWNUM                                 |        1 |
| SEQUENCE_TABLE                         |        1 |
| SYSDATE                                |        0 |
| SYSTIMESTAMP                           |        0 |
| TABLE_STATISTICS                       |        0 |
| THREAD_STATISTICS                      |        0 |
| USER_STATISTICS                        |        0 |
| VARCHAR2                               |        1 |
+----------------------------------------+----------+
```
Please pay attention to the above reserved words and keywords during use. By default, enclose them all with **"** or **`** to avoid SQL syntax errors and ensure the fault tolerance of applications.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
