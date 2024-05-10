# 保留字、关键字
---


在GreatSQL中，**保留字（Reserved Words）** 和 **关键字（Keywords）** 通常有特殊意义，比如`SELECT`/`DELETE`/`BIGINT` 都是保留字。

当使用这些保留字（Reserved Words）作为表名、列名、内置函数名等对象名情况下，需要特殊处理才行（通常建议加上反引号"`"），避免报SQL语法错误。

当使用关键字（Keywords）作为表明、列名、内置函数名等对象名时，无需特殊处理，不会报SQL语法错误。

如下面的例子：
```
greatsql> CREATE TABLE interval (begin INT, end INT);
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'interval (begin INT, end INT)' at line 1
```

这是因为 **interval** 是保留字，需要用 "`" 引用包括才行，而 **begin**/**end** 只是关键字，不需要特殊处理，修改如下：
```
greatsql> CREATE TABLE `interval`(begin INT, end INT);
Query OK, 0 rows affected (0.08 sec)
```

另外，要注意的是，从GreatSQL 8.0.32-24开始，开启Oracle兼容模式（`SET sql_mode = ORACLE`）后，对象名都需要特殊处理才行，例如：
```
greatsql> CREATE TABLE `interval`(`begin` INT, `end` INT);
Query OK, 0 rows affected (0.02 sec)
```
或
```
greatsql> CREATE TABLE "interval"("begin" INT, "end" INT);
Query OK, 0 rows affected (0.02 sec)
```
在上面的两个例子中，用双引号 **"** 或 **`** 均可。

综上，强烈建议在SQL开发、编写SQL语句时，对象名都用 **"** 或 **`** 将其引用起来，避免报SQL语法错误，保证应用程序的容错性。

通过查询视图 `information_schema.KEYWORDS` 也可以找到保留字和关键字的信息（其中RESERVED=1的表示是保留字，其余是关键字）：
```
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

其中，GreatSQL相对MySQL新增的保留字、关键字如下：
```
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
在使用过程中请注意上述保留字、关键字，默认都用 **"** 或 **`** 将其引用起来，避免报SQL语法错误，保证应用程序的容错性。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
