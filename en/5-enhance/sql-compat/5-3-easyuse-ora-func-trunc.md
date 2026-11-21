# Oracle Compatibility - Function - TRUNC()

---

The `TRUNC()` function supports two usages:
- `TRUNC(date [, fmt ])`
- `TRUNC(n1 [, n2 ])`

The two usages are described in detail below.

## 1. Syntax 1: TRUNC(date [, fmt ])

```sql
TRUNC(date [, fmt ])
```

## 2. Definition and Usage

The `TRUNC(date [, fmt ])` function truncates the date `date` according to the time unit specified by `fmt`. When `fmt` is not specified, the date is truncated to 0 o'clock of the specified date (equivalent to `TRUNC(DATE, 'DD')`).

**Note**: The data type of the parameter `date` must be `DATE`, `DATETIME`, `TIMESTAMP`, etc.; otherwise it is handled according to the `TRUNC(NUMBER)` usage, for example:

```sql
-- TRUNC(DATE)
greatsql> SELECT NOW(), TRUNC(NOW(), 'yyyy') AS trunc_year, TRUNC(NOW(), 'mm') AS trunc_month, TRUNC(NOW(), 'dd') AS trunc_day FROM DUAL\G
*************************** 1. row ***************************
      now(): 2023-05-18 14:21:23
 trunc_year: 2023-01-01 00:00:00
trunc_month: 2023-05-01 00:00:00
  trunc_day: 2023-05-18 00:00:00

-- When executing TRUNC('2021-10-21', 'dd'), the string '2021-10-21' is not converted to the DATE type first, so it is handled as the TRUNC(NUMBER) usage
-- In the TRUNC(NUMBER) usage, '2021-10-21' is an invalid number, so an argument error is reported
greatsql> SELECT TRUNC('2021-10-21', 'dd') FROM DUAL;
ERROR 1210 (HY000): Incorrect arguments to trunc

-- The following usage is handled as TRUNC(NUMBER, 0)
greatsql> SELECT TRUNC('20211021') FROM DUAL;
+-------------------+
| TRUNC('20211021') |
+-------------------+
|          20211021 |
+-------------------+
```

In the date-time truncation usage, the formats supported by the parameter `fmt` and the corresponding date truncation notes:

| Format                           | Description                           |
| ---------------------------- | ---------------------------- |
| CC, SCC                      | Truncate to the first day of the century of the date                 |
| [S]YYYY, [S]YEAR, YYY, YY, Y | Truncate to the first day of the year of the date                 |
| IYYY,IYY,IY,I                | Truncate to the first day of the ISO year of the date              |
| Q                            | Truncate to the first day of the quarter of the date                  |
| MONTH, MON, MM, RM           | Truncate to the first day of the month of the date                  |
| WW                           | Truncate to the nearest date with the same day of the week as the first day (January 1) of the year of the date |
| IW                           | Truncate to the first day of the week (ISO) of the date **(Monday)**   |
| W                            | Truncate backward to the nearest date with the same day of the week as the first day (the 1st) of the month of the date |
| DDD,DD,J                     | Truncate to 00:00:00 of the day             |
| DAY,DY,D                     | Truncate to the first day of the week of the date **(Sunday)**        |
| HH, HH12, HH24               | Truncate to the beginning of the hour of the date (minutes, seconds, etc. are reset to zero)          |
| MI                           | Truncate to the beginning of the minute of the date (seconds, microseconds, etc. are reset to zero)         |

## 3. Examples

```sql
greatsql> SELECT TRUNC(TO_DATE('2003-01-02 10:11:12','yyyy-mm-dd hh:mi:ss'), 'YEAR') FROM DUAL;
+---------------------------------------------------------------------+
| TRUNC(TO_DATE('2003-01-02 10:11:12','yyyy-mm-dd hh:mi:ss'), 'YEAR') |
+---------------------------------------------------------------------+
| 2003-01-01 00:00:00                                                 |
+---------------------------------------------------------------------+

greatsql> SELECT TRUNC(TO_DATE('2003-01-02 8:11:2','yyyy-mm-dd hh:mi:ss'), 'MI') FROM DUAL;
+-----------------------------------------------------------------+
| TRUNC(TO_DATE('2003-01-02 8:11:2','yyyy-mm-dd hh:mi:ss'), 'MI') |
+-----------------------------------------------------------------+
| 2003-01-02 08:11:00                                             |
+-----------------------------------------------------------------+

greatsql> SELECT TRUNC(TO_DATE('2003-01-02 8:11:2','yyyy-mm-dd hh:mi:ss'), 'HH') FROM DUAL;
+-----------------------------------------------------------------+
| TRUNC(TO_DATE('2003-01-02 8:11:2','yyyy-mm-dd hh:mi:ss'), 'HH') |
+-----------------------------------------------------------------+
| 2003-01-02 08:00:00                                             |
+-----------------------------------------------------------------+

greatsql> SELECT TO_DATE('2008-11-10', 'yyyy-mm-dd'),
 TRUNC(TO_DATE('2008-11-10', 'yyyy-mm-dd'), 'year'),
 TRUNC(TO_DATE('2008-11-10', 'yyyy-mm-dd'), 'dd'),
 TRUNC(TO_DATE('2008-11-10', 'yyyy-mm-dd')) FROM DUAL\G
*************************** 1. row ***************************
               TO_DATE('2008-11-10', 'yyyy-mm-dd'): 2008-11-10 00:00:00
TRUNC(TO_DATE('2008-11-10', 'yyyy-mm-dd'), 'year'): 2008-01-01 00:00:00
  TRUNC(TO_DATE('2008-11-10', 'yyyy-mm-dd'), 'dd'): 2008-11-10 00:00:00
        TRUNC(TO_DATE('2008-11-10', 'yyyy-mm-dd')): 2008-11-10 00:00:00

-- When the year of the input date or the year after TRUNC calculation is less than 1, TRUNC returns NULL and raises a date overflow warning
greatsql> SELECT TRUNC(DATE('0000-01-10'), 'ww') FROM DUAL;
+---------------------------------+
| TRUNC(DATE('0000-01-10'), 'ww') |
+---------------------------------+
| NULL                            |
+---------------------------------+
1 row in set, 1 warning (0.01 sec)

greatsql> show warnings;
+---------+------+-----------------------------------------+
| Level   | Code | Message                                 |
+---------+------+-----------------------------------------+
| Warning | 1441 | Datetime function: trunc field overflow |
+---------+------+-----------------------------------------+

greatsql> SELECT TRUNC(DATE('0001-01-02'), 'iy') FROM DUAL;
+---------------------------------+
| TRUNC(DATE('0001-01-02'), 'iy') |
+---------------------------------+
| NULL                            |
+---------------------------------+
1 row in set, 1 warning (0.01 sec)

greatsql> show warnings;
+---------+------+-----------------------------------------+
| Level   | Code | Message                                 |
+---------+------+-----------------------------------------+
| Warning | 1441 | Datetime function: trunc field overflow |
+---------+------+-----------------------------------------+
```

## 4. Syntax 2: TRUNC(n1 [, n2 ])

```sql
TRUNC(n1 [, n2 ])
```

## 5. Definition and Usage

The `TRUNC(n1 [, n2 ])` function truncates the number `n1` according to the decimal position specified by `n2`. The truncation rules are as follows:
- When `n2` is positive, `n1` is truncated to `n2` digits after the decimal point;
- When `n2` is 0, the fractional part of `n1` is truncated;
- When `n2` is negative, the `n2` digits to the left of the decimal point of `n1` are all reset to 0;
- If `n2` is not specified, the default value 0 is used, i.e., `TRUNC(n1, 0)`.

## 6. Oracle Compatibility Notes

| Description | Example | Oracle return value | GreatSQL return value |
| -------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| Maximum number of decimal digits retained (38 digits in Oracle, 30 digits in GreatSQL) | TRUNC(1.123456789123456789123456789123456789123456789, 100) | 1.12345678912345678912345678912345678912 | 1.123456789123456789123456789123 |
| Handling of decimals with a fractional decimal position specifier (Oracle truncates, GreatSQL rounds) | TRUNC(123.456, 1.1)<br/>TRUNC(123.456, 1.5) | 123.4<br/>123.4 | 123.4<br/>123.45 |

## 7. Examples

```sql
greatsql> SELECT TRUNC(123.456, 2) FROM DUAL;
+-------------------+
| TRUNC(123.456, 2) |
+-------------------+
|            123.45 |
+-------------------+

greatsql> SELECT TRUNC(123.456, -1) FROM DUAL;
+-------------------+
| TRUNC(123.456,-1) |
+-------------------+
|               120 |
+-------------------+

greatsql> SELECT TRUNC(123.456, -2) FROM DUAL;
+--------------------+
| TRUNC(123.456, -2) |
+--------------------+
|                100 |
+--------------------+

greatsql> SELECT TRUNC(123.456) FROM DUAL;
+----------------+
| TRUNC(123.456) |
+----------------+
|            123 |
+----------------+

greatsql> SELECT TRUNC(123.456, 'abc') FROM DUAL;
ERROR 1210 (HY000): Incorrect arguments to trunc
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
