# Oracle Compatibility - Function - CURRENT_TIMESTAMP()

---

## 1. Syntax

```sql
CURRENT_TIMESTAMP[([n])]
```

## 2. Definition and Usage

Returns the current timestamp.

The parameter `n`:

1. The value of `n` must be less than or equal to 6.
2. In ORACLE mode, `CURRENT_TIMESTAMP` is equivalent to `CURRENT_TIMESTAMP(6)`, with 6 fractional digits (n=6), while `CURRENT_TIMESTAMP()` has 0 fractional digits (n=0). In DEFAULT mode, `CURRENT_TIMESTAMP` and `CURRENT_TIMESTAMP()` are equivalent, both with 0 fractional digits (n=0).
3. In ORACLE mode, the output format is `dd-mm-yy hh:mm:ss[.dec] am|pm timezone`, while in DEFAULT mode, the output format is `yyyy-mm-dd hh24:mm:ss[.dec]`.
4. In ORACLE mode, the time format differs from the original, which may cause some functions (such as `UNIX_TIMESTAMP()`) to display abnormally when their argument value is `CURRENT_TIMESTAMP`.

## 3. Examples

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SELECT CURRENT_TIMESTAMP;
+------------------------------------+
| CURRENT_TIMESTAMP                  |
+------------------------------------+
| 30-10-23 03:53:18.127314 PM +08:00 |
+------------------------------------+

greatsql> SELECT CURRENT_TIMESTAMP();
+-----------------------------+
| CURRENT_TIMESTAMP()         |
+-----------------------------+
| 30-10-23 03:53:30 PM +08:00 |
+-----------------------------+ 

greatsql> SELECT CURRENT_TIMESTAMP(6);
+------------------------------------+
| CURRENT_TIMESTAMP(6)               |
+------------------------------------+
| 30-10-23 03:53:41.122988 PM +08:00 |
+------------------------------------+

-- An error is raised when the fractional part is > 6
greatsql> SELECT CURRENT_TIMESTAMP(7);
ERROR 1426 (42000): Too-big precision 7 specified for 'now'. Maximum is 6.

greatsql> CREATE TABLE t1(
    id INT,
    c VARCHAR2(64)
);

greatsql> INSERT INTO t1 VALUES(1, CURRENT_TIMESTAMP),
(2, CURRENT_TIMESTAMP()),
(3, CURRENT_TIMESTAMP(3)),
(4, CURRENT_TIMESTAMP(6));

greatsql> SELECT * FROM t1;
+------+------------------------------------+
| id   | c                                  |
+------+------------------------------------+
|    1 | 30-10-23 03:55:12.024380 PM +08:00 |
|    2 | 30-10-23 03:55:17 PM +08:00        |
|    3 | 30-10-23 03:55:26.559 PM +08:00    |
|    4 | 30-10-23 03:55:29.372250 PM +08:00 |
+------+------------------------------------+

greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT CURRENT_TIMESTAMP;
+---------------------+
| CURRENT_TIMESTAMP   |
+---------------------+
| 2023-10-30 15:55:59 |
+---------------------+

greatsql> SELECT CURRENT_TIMESTAMP();
+---------------------+
| CURRENT_TIMESTAMP() |
+---------------------+
| 2023-10-30 15:56:08 |
+---------------------+

greatsql> SELECT CURRENT_TIMESTAMP(6);
+----------------------------+
| CURRENT_TIMESTAMP(6)       |
+----------------------------+
| 2023-10-30 15:56:17.512329 |
+----------------------------+

greatsql> INSERT INTO t1 VALUES(5, CURRENT_TIMESTAMP),
(6, CURRENT_TIMESTAMP()),
(7, CURRENT_TIMESTAMP(3)),
(8, CURRENT_TIMESTAMP(6));

greatsql> SELECT * FROM t1;
+------+------------------------------------+
| id   | c                                  |
+------+------------------------------------+
|    1 | 30-10-23 03:55:12.024380 PM +08:00 |
|    2 | 30-10-23 03:55:17 PM +08:00        |
|    3 | 30-10-23 03:55:26.559 PM +08:00    |
|    4 | 30-10-23 03:55:29.372250 PM +08:00 |
|    5 | 2023-10-30 15:56:31                |
|    6 | 2023-10-30 15:56:34                |
|    7 | 2023-10-30 15:56:37.998            |
|    8 | 2023-10-30 15:56:39.494867         |
+------+------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
