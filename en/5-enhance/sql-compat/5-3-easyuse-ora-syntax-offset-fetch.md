# Oracle Compatibility - Syntax - OFFSET ... FETCH
---

## 1. Syntax

```sql
[ OFFSET offset { ROW | ROWS } ]
[ FETCH { FIRST | NEXT } [ { row_count | percent PERCENT } ]
    { ROW | ROWS } { ONLY | WITH TIES } ]
```

## 2. Definition and Usage

The following is a description of the usage of `SELECT ... OFFSET ... FETCH`:

- `NEXT` and `FIRST` are keywords with the same meaning.

- `ROW` and `ROWS` are also keywords with the same meaning.

- About `row_count | percent PERCENT`

The `OFFSET` clause is used to specify the number of rows to skip before the row limiting begins. The `OFFSET` clause is optional. If it is omitted, the offset is `0` and the row limit is calculated from the first row.

The offset must be a number or an expression (the result of evaluating the expression is a number). The offset follows these rules:

1. If the offset is a negative value, it is treated as `0`.

2. If the offset is `NULL` or greater than the number of rows returned by the query, no rows are returned.

3. If `row_count` contains a decimal, the fractional part is truncated.

4. The `PERCENT` percentage value returns a percentage of the number of rows in the table. If the result of `percent` calculation contains a decimal, it is rounded up by one digit. For example: the table contains 100 rows in total; when *percent=0.1*, the calculation result is *100*0.1/100=0.1*, which contains a decimal and is rounded up to *1*.

- About `ONLY | WITH TIES`

1. `ONLY`: returns only the number of rows or the percentage of rows after `FETCH NEXT/FIRST`.

2. `WITH TIES`: returns the records with the same value as the last row of `ORDER BY`. **Note**: if `WITH TIES` is used, an `ORDER BY` clause must be specified in the query. Otherwise, the query will not return additional rows.

## 3. Oracle Compatibility Notes

1. In Oracle, it cannot be used together with `FOR UPDATE`, **but in GreatSQL, `LIMIT OFFSET` and `FOR UPDATE` can be used together.**

2. If the query list contains fields with the same name, aliases must be used to distinguish them.

3. In GreatSQL, the `OFFSET` offset may undergo implicit conversion, and the implicit conversion results of different functions may be inconsistent.

## 4. Examples

```sql
greatsql> CREATE TABLE t1 (a INT);
greatsql> INSERT INTO t1 VALUES (1), (1), (2), (3), (2);

greatsql> SELECT * FROM t1
OFFSET 2 ROWS;
+------+
| a    |
+------+
|    2 |
|    3 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST ROW ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST ROWS ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT ROW ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT ROWS ONLY;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROW
FETCH FIRST ROW ONLY;
+------+
| a    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS
FETCH FIRST 1 ROW ONLY;
+------+
| a    |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST ROW WITH TIES;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
FETCH FIRST ROW WITH TIES;
+------+
| a    |
+------+
|    1 |
|    1 |
+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS
FETCH FIRST ROW WITH TIES;
+------+
| a    |
+------+
|    2 |
|    2 |
+------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH FIRST 3 ROW ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 1+2 ROWS ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS FETCH FIRST 3 ROW ONLY;
+------+
| a    |
+------+
|    2 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
OFFSET 2 ROWS FETCH NEXT 3 ROW ONLY;
+------+
| a    |
+------+
|    2 |
|    3 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
FETCH FIRST 3 ROWS WITH TIES;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
|    2 |
+------+
4 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 2 ROWS
FETCH NEXT 3 ROWS WITH TIES;
+------+
| a    |
+------+
|    2 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 49 PERCENT ROWS ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 50 PERCENT ROWS ONLY;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
OFFSET 2 ROWS
FETCH NEXT 50 PERCENT ROWS ONLY;
+------+
| a    |
+------+
|    2 |
|    3 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1
FETCH NEXT 50 PERCENT ROWS WITH TIES;
+------+
| a    |
+------+
|    1 |
|    1 |
|    2 |
+------+
3 rows in set (0.00 sec)

greatsql> SELECT * FROM t1 ORDER BY a
OFFSET 1 ROWS
FETCH NEXT 49 PERCENT ROWS WITH TIES;
+------+
| a    |
+------+
|    1 |
|    2 |
|    2 |
+------+
3 rows in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
