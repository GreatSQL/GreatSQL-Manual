# Oracle Compatibility - Syntax - SELECT ... FOR UPDATE WAIT n
---

## 1. Syntax

```sql
SELECT ... FOR UPDATE ... WAIT n
```

## 2. Definition and Usage

The `SELECT ... FOR UPDATE ... WAIT n` statement is used to query data and acquire locks. When applying for a lock, if the row lock resource cannot be acquired immediately, a maximum wait duration can be specified. If the lock is still not acquired after waiting for n seconds, the statement execution is reported as failed. If the row is not locked, the result is returned immediately without waiting.

Notes on parameter `n`:

1. In the `WAIT n` clause, the value range of parameter `n` is [0, 31536000], that is, the longest wait is 1 year.

2. When the lock wait duration parameter `n` is greater than the `innodb_lock_wait_timeout` option value, the latter prevails.

3. The total wait duration does not include the time for SQL parsing, so the actual wait time may be longer than n seconds.

In GreatSQL, since the row lock mechanism differs from Oracle, the actual locking locks the entire row of data, and it is not possible to lock only the specified columns without locking other columns as in Oracle. In other words, this syntax is only compatible with the Oracle style of usage; the actual row lock behavior remains the same as the native GreatSQL row lock mechanism.

## 3. Oracle Compatibility Notes

The differences between this syntax and Oracle are as follows:

1. In Oracle, regardless of whether the `WHERE` condition is an indexed column, only the data rows that satisfy the condition are locked; in GreatSQL, if it is not an indexed column, all data rows are locked, as described above.

2. Parameter `n` only supports positive integers; other values cause an error.

3. In Oracle, statements such as `SELECT * FROM (SELECT * FROM t1 FOR UPDATE WAIT 1000000) FOR UPDATE WAIT 1` are not supported; in GreatSQL, to be compatible with the native feature, this statement usage is supported, and the wait duration is determined by the last one (1 second in this case). However, for statements with only one `WAIT n`, such as `SELECT * FROM (SELECT * FROM t1 FOR UPDATE WAIT 10) FOR UPDATE NOWAIT`, the action of the derived table prevails (in this case, it waits 10 seconds instead of executing the `NOWAIT` logic).

4. In Oracle, usage such as `INSERT INTO t1 SELECT * FROM t1 FOR UPDATE WAIT 3` is not supported; in GreatSQL, to be compatible with the native feature, this statement usage is also supported. When a lock is encountered during execution of this statement, it waits 3 seconds before reporting an error.

## 4. Examples

Create the test tables and initialize data:
```sql
greatsql> CREATE TABLE t1(c1 INT, c2 CHAR(10));
greatsql> INSERT INTO t1 VALUES (10, 'r10'), (12, 'r12'), (13, 'r13');
greatsql> SELECT * FROM t1;
+------+------+
| c1   | c2   |
+------+------+
|   10 | r10  |
|   12 | r12  |
|   13 | r13  |
+------+------+
3 rows in set (0.00 sec)

greatsql> CREATE TABLE t2 (c1 INT, c2 CHAR(10));
greatsql> INSERT INTO t2 VALUES (11, 'r21'), (12, 'r22'), (13, 'r23');
greatsql> SELECT * FROM t2;
+------+------+
| c1   | c2   |
+------+------+
|   11 | r21  |
|   12 | r22  |
|   13 | r23  |
+------+------+
3 rows in set (0.00 sec)
```

- 1. Usage 1: `FOR UPDATE WAIT n`.

```
-- Switch to ORACLE mode first
greatsql> SET sql_mode = ORACLE;

-- session1: lock the record with c1=10
greatsql> BEGIN; SELECT * FROM t1 WHERE c1=10 FOR UPDATE;
+------+------+
| c1   | c2   |
+------+------+
|   10 | aa   |
+------+------+
1 row in set (0.01 sec)

-- session2: request the lock, and an error is reported after waiting 3 seconds
greatsql> SELECT * FROM t1 WHERE c1=10 FOR UPDATE WAIT 3;
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

- 2. Usage 2: `FOR UPDATE OF table.column WAIT n`.

```
greatsql> SET sql_mode = ORACLE;

-- Create a new view
greatsql> CREATE VIEW v1 AS SELECT * FROM t1;

-- session1: lock the record with c1=10
greatsql> BEGIN; SELECT * FROM t1 WHERE c1=10 FOR UPDATE;
+------+------+
| c1   | c2   |
+------+------+
|   10 | aa   |
+------+------+
1 row in set (0.01 sec)

-- session2: locking the view is also blocked
greatsql> SELECT * FROM v1 WHERE c1=10 FOR UPDATE OF v1.c1 WAIT 3;
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

- 3. Examples of incorrect usage

```
-- The parameter n value exceeds the limit
greatsql> SELECT * FROM t12 WHERE c1=12 FOR UPDATE WAIT 31536001;
ERROR 1210 (HY000): Incorrect arguments to wait n
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
