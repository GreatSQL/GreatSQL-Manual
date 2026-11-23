# Oracle Compatibility - Syntax - Setting CURRENT_TIMESTAMP as the Default Value of a String Column
---

GreatSQL supports setting the default value of `VARCHAR/VARCHAR2` columns to `CURRENT_TIMESTAMP`.

## 1. Syntax

```sql
VARCHAR(n) DEFAULT CURRENT_TIMESTAMP[([fsp])]

VARCHAR2(n) DEFAULT CURRENT_TIMESTAMP[([fsp])]
```

Parameter notes:
1. The value of parameter `n` must be greater than or equal to 48.

2. Parameter `fsp` can specify the fractional seconds precision, with a maximum value of 6.

## 2. Examples

```sql
-- An error is reported when the n value is less than 48
greatsql> CREATE TABLE t1 (
        id INT,
        c1 VARCHAR(47) DEFAULT CURRENT_TIMESTAMP);
ERROR 1067 (42000): Invalid default value for 'c1'

greatsql> CREATE TABLE t1 (
        id INT NOT NULL,
        c1 VARCHAR(48) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        c2 VARCHAR2(48) NOT NULL DEFAULT CURRENT_TIMESTAMP);

greatsql> SET sql_mode = ORACLE;
greatsql> INSERT INTO t1(id) VALUES(1);
greatsql> INSERT INTO t1 VALUES (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

greatsql> SET sql_mode = DEFAULT;
greatsql> INSERT INTO t1(id) VALUES(3);
greatsql> INSERT INTO t1 VALUES(4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

greatsql> SELECT * FROM t1;
+----+------------------------------------+------------------------------------+
| id | c1                                 | c2                                 |
+----+------------------------------------+------------------------------------+
|  1 | 23-11-23 03:33:05.672474 PM +08:00 | 23-11-23 03:33:05.672474 PM +08:00 |
|  2 | 23-11-23 03:33:05.673292 PM +08:00 | 23-11-23 03:33:05.673292 PM +08:00 |
|  3 | 2023-11-23 15:33:05                | 2023-11-23 15:33:05                |
|  4 | 2023-11-23 15:33:05                | 2023-11-23 15:33:05                |
+----+------------------------------------+------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
