# Oracle Compatibility - Syntax - RATIO_TO_REPORT
---

## 1. Syntax

```sql
SET sql_mode = ORACLE;

RATIO_TO_REPORT(expr)
   OVER ([ query_partition_clause ])
```

## 2. Definition and Usage

To use `RATIO_TO_REPORT`, you need to switch to `ORACLE` mode first. `RATIO_TO_REPORT` can be used for data proportion analysis, and its analysis formula is: `result = field value/sum(field)`.

## 3. Oracle Compatibility Notes

The usage of `RATIO_TO_REPORT` in GreatSQL and Oracle is consistent. The specific functions implemented are as follows:

1. `RATIO_TO_REPORT(expr) OVER (query_partition_clause)` performs proportion analysis on grouped data.

2. `RATIO_TO_REPORT(expr) OVER ()` performs proportion analysis on all data.

3. In Oracle, using `RATIO_TO_REPORT` with character values is not supported, but in GreatSQL, because automatic implicit conversion is performed, this usage is supported.

4. In GreatSQL, `RATIO_TO_REPORT` is not supported for multiple types of data such as `ENUM`, `SET`, `JSON`, `GEOMETRY`, and temporal types.

5. The number of decimal places in the `RATIO_TO_REPORT` analysis result is the decimal places of the field plus the system parameter `@@div_precision_increment`.

6. When the field value is `NULL`, `''`, or the **sum adds up to 0**, etc., the result of `RATIO_TO_REPORT` is `NULL`.

7. In GreatSQL, `BIT` type fields are supported for `RATIO_TO_REPORT`.

8. When the calculation value is too large and overflows, it will be handled in the native GreatSQL way.

## 4. Examples

Create a test table and fill in data:
```sql
greatsql> CREATE TABLE `t1` (
 sidea INT DEFAULT NULL,
 sideb INT DEFAULT NULL,
 sidec DECIMAL(50,10) GENERATED ALWAYS AS (SQRT(((`sidea` * `sidea`) + (`sideb` * `sideb`)))) VIRTUAL
);

greatsql> INSERT INTO t1(sidea,sideb) VALUES(1,2),(10,20),(null,null),(-1,20),(10,-100),(10,-123);
greatsql> SELECT * FROM t1;
+-------+-------+----------------+
| sidea | sideb | sidec          |
+-------+-------+----------------+
|     1 |     2 |   2.2360679775 |
|    10 |    20 |   22.360679775 |
|  NULL |  NULL |           NULL |
|    -1 |    20 |  20.0249843945 |
|    10 |  -100 | 100.4987562112 |
|    10 |  -123 |  123.405834546 |
+-------+-------+----------------+
6 rows in set (0.00 sec)
```

- 1. `RATIO_TO_REPORT over (partition by)` performs proportion analysis on grouped data.

```sql
greatsql> SET sql_mode = ORACLE;

-- Check the value of @@div_precision_increment
greatsql> SELECT @@div_precision_increment;
+---------------------------+
| @@div_precision_increment |
+---------------------------+
|                         4 |
+---------------------------+

greatsql> SELECT sidec, sidea, RATIO_TO_REPORT(sidec) OVER (PARTITION BY sidea) c FROM t1;
+----------------+-------+------------------+
| sidec          | sidea | c                |
+----------------+-------+------------------+
|           NULL |  NULL |             NULL |
|  20.0249843945 |    -1 |                1 |
|   2.2360679775 |     1 |                1 |
|   22.360679775 |    10 | 0.09079916029847 |
| 100.4987562112 |    10 | 0.40809146979602 |
|  123.405834546 |    10 | 0.50110936990551 |
+----------------+-------+------------------+
6 rows in set (0.00 sec)

greatsql> SELECT sideb, sidea, RATIO_TO_REPORT(sideb) OVER (PARTITION BY sidea) c FROM t1;
+-------+-------+---------+
| sideb | sidea | c       |
+-------+-------+---------+
|  NULL |  NULL |    NULL |
|    20 |    -1 |       1 |
|     2 |     1 |       1 |
|    20 |    10 | -0.0985 |
|  -100 |    10 |  0.4926 |
|  -123 |    10 |  0.6059 |
+-------+-------+---------+
6 rows in set (0.01 sec)
```

- 2. `RATIO_TO_REPORT OVER()` performs proportion analysis on all data.

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT sidec, sidea, RATIO_TO_REPORT(sidec) OVER () c FROM t1;
+----------------+-------+------------------+
| sidec          | sidea | c                |
+----------------+-------+------------------+
|   2.2360679775 |     1 | 0.00832718354505 |
|   22.360679775 |    10 | 0.08327183545048 |
|           NULL |  NULL |             NULL |
|  20.0249843945 |    -1 | 0.07457363649836 |
| 100.4987562112 |    10 | 0.37426035229721 |
|  123.405834546 |    10 |  0.4595669922089 |
+----------------+-------+------------------+
6 rows in set (0.01 sec)
```

- 3. The sum of the field values is 0

```
-- Insert two more records
greatsql> INSERT INTO t1(sidea,sideb) VALUES (20,100),(20,-100);

greatsql> SELECT * FROM t1;
+-------+-------+----------------+
| sidea | sideb | sidec          |
+-------+-------+----------------+
|     1 |     2 |   2.2360679775 |
|    10 |    20 |   22.360679775 |
|  NULL |  NULL |           NULL |
|    -1 |    20 |  20.0249843945 |
|    10 |  -100 | 100.4987562112 |
|    10 |  -123 |  123.405834546 |
|    20 |   100 | 101.9803902719 |
|    20 |  -100 | 101.9803902719 |
+-------+-------+----------------+
8 rows in set (0.00 sec)

greatsql> SET sql_mode = ORACLE;

greatsql> SELECT sideb, sidea, RATIO_TO_REPORT(sideb) OVER (PARTITION BY sidea) c FROM t1;
+-------+-------+---------+
| sideb | sidea | c       |
+-------+-------+---------+
|  NULL |  NULL |    NULL |
|    20 |    -1 |       1 |
|     2 |     1 |       1 |
|    20 |    10 | -0.0985 |
|  -100 |    10 |  0.4926 |
|  -123 |    10 |  0.6059 |
|   100 |    20 |    NULL |
|  -100 |    20 |    NULL |
+-------+-------+---------+
8 rows in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
