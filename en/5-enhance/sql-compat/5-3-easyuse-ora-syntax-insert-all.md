# Oracle Compatibility - Syntax - INSERT ALL
---

## 1. Syntax

```sql
INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY]
    { ALL insert_into_clause ... | conditional_insert_clause }
    {SELECT ...  }

insert_into_clause:
    INTO tbl_name
    [PARTITION (partition_name [, partition_name] ...)]
    [(col_name [, col_name] ...)]
    [{ VALUES | VALUE} (value_list)]

conditional_insert_clause:
    { ALL | FIRST } when_insert_clause ... [ else_insert_clause ]

when_insert_clause:
    WHEN condition THEN insert_into_clause ...

else_insert_clause:
    ELSE insert_into_clause ...

value:
    {expr | DEFAULT}

value_list:
    value [, value] ...


EXPLAIN insert_all_stmt
```

## 2. Definition and Usage

In multi-table inserts, `INSERT ALL INTO` supports inserting computed rows derived from the rows returned by the subquery into one or more tables.

1. Inserting into different tables is supported.

2. Conditional query inserts are supported.

`INSERT ALL INTO` usage restrictions:

1. The insert target can only be a table, not a view or a collection expression.

2. After the insert ends, the function `LAST_INSERT_ID()` returns 0, to avoid ambiguity in multi-table inserts.

3. Running `EXPLAIN FORMAT=JSON` to view the execution plan output only shows the first table inserted.

## 3. Examples

```
greatsql> CREATE TABLE t3(id INT PRIMARY KEY, cc VARCHAR(10));
greatsql> CREATE TABLE t2 LIKE t3;
greatsql> CREATE TABLE t1 LIKE t3;
greatsql> INSERT INTO t3 VALUES(1, 'test1'),(2,'test2'), (3,'test3');

greatsql> INSERT ALL 
   INTO t1 
   INTO t2 
   SELECT * FROM t3;
Query OK, 6 rows affected (0.45 sec)
Records: 6  Duplicates: 0  Warnings: 0

greatsql> INSERT ALL 
  INTO t1(id) VALUES (id+20)
  INTO t2(cc,id) VALUES ('test',id+10) 
  SELECT id FROM t3;
Query OK, 6 rows affected (0.05 sec)
Records: 6  Duplicates: 0  Warnings: 0

greatsql> INSERT ALL 
  INTO t1 (id,cc) VALUES(13,'test13')
  INTO t1 (id,cc) VALUES(12,'test12')
  SELECT 1 FROM DUAL;
Query OK, 2 rows affected (0.06 sec)
Records: 2  Duplicates: 0  Warnings: 0

greatsql> SELECT * FROM t2;
+----+-------+
| id | cc    |
+----+-------+
|  1 | test1 |
|  2 | test2 |
|  3 | test3 |
| 11 | test  |
| 12 | test  |
| 13 | test  |
+----+-------+

greatsql> SELECT * FROM t1;
+----+--------+
| id | cc     |
+----+--------+
|  1 | test1  |
|  2 | test2  |
|  3 | test3  |
| 12 | test12 |
| 13 | test13 |
| 21 | NULL   |
| 22 | NULL   |
| 23 | NULL   |
+----+--------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
