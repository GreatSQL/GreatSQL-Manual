# Oracle Compatibility - Function - MONTHS_BETWEEN()

---

## 1. Syntax

```sql
MONTHS_BETWEEN(date1, date2)
```

## 2. Definition and Usage

The `MONTHS_BETWEEN()` function calculates the number of months between `date1` and `date2`. The return value type depends on the specific situation, as described below.

**1. Whether the return value is positive or negative**

- If `date1` is later than `date2`, a positive value is returned;
- If `date1` is earlier than `date2`, a negative value is returned;
- If `date1` and `date2` are the same, 0 is returned.

**2. Whether the return value is an integer or a decimal**

- If the day-of-month values in `date1` and `date2` are the same (e.g., `'2021-04-13'` and `'2021-03-13'`) or both are the last day of their respective months (e.g., `'2021-02-28'` and `'2021-03-31'`), an integer is returned;
- In other cases, the database uses 31 days as the denominator and calculates the fractional part based on the day difference (less than 31 days) between `date1` and `date2`.

## 3. Oracle Compatibility Notes

The input parameters of `MONTHS_BETWEEN()` support string formats. GreatSQL automatically converts them to `DATE`/`DATETIME` types before performing date calculations, but the input string must be convertible to a valid date type; otherwise, NULL is returned with a warning due to a date conversion error. Differences from Oracle results caused by invalid input are currently not handled.

**Note**: A valid date string must contain at least the complete date part (year, month, day); the time part (hour, minute, second) is optional. When the time part is specified, it must also contain complete hour, minute, and second values. Valid formats include the following:

- `YYMMDD`, such as '230518'
- `YYYYMMDD`, such as '20230518'
- `YYMMDDHHmmss`, such as '230518095050'
- `YYYYMMDDHHmmss`, such as '20230518095050'
- `YY-MM-DD`, such as '23-05-18'
- `YYYY-MM-DD`, such as '2023-05-18'
- `YYYY-MM-DD HH`, such as '2023-05-18 09'
- `YYYY-MM-DD HH:mm`, such as '2023-05-18 09:50'
- `YY-MM-DD HH:mm:ss`, such as '23-05-18 09:50:50'

The following formats are invalid and cannot be parsed:

- `YYYYMMDDHH`, such as '2022020203'
- `YYYYMM`, such as '202102'

```sql
-- The parameter date format is invalid and cannot be parsed, returns NULL
greatsql> SELECT MONTHS_BETWEEN('2022022823', '20220224') FROM DUAL;
+-----------------------------------------+
| MONTHS_BETWEEN('2022022823','20220224') |
+-----------------------------------------+
|                                    NULL |
+-----------------------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+----------------------------------------+
| Level   | Code | Message                                |
+---------+------+----------------------------------------+
| Warning | 1292 | Incorrect datetime value: '2022022823' |
+---------+------+----------------------------------------+
```

## 4. Examples

```sql
greatsql> SELECT MONTHS_BETWEEN(TO_DATE('2021-3-21', 'yyyy-mm-dd'), TO_DATE('2021-1-10', 'yyyy-mm-dd')) AS MT1 FROM DUAL
 UNION ALL
 SELECT MONTHS_BETWEEN('2021-3-21', '2021-1-10') FROM DUAL;
+--------------------+
| MT1                |
+--------------------+
| 2.3548387096774195 |
| 2.3548387096774195 |
+--------------------+

greatsql> SELECT MONTHS_BETWEEN(TO_DATE('2021-1-10', 'yyyy-mm-dd'), TO_DATE('2021-3-21', 'yyyy-mm-dd')) AS MT2 FROM DUAL 
 UNION ALL
 SELECT MONTHS_BETWEEN( '2021-1-10', '2021-3-21' );
+---------------------+
| MT2                 |
+---------------------+
| -2.3548387096774195 |
| -2.3548387096774195 |
+---------------------+
```

**Note**: For notes on using the `MONTHS_BETWEEN()` function, refer to the [rules in the `TO_DATE()` function](./5-3-easyuse-ora-func-todate.md).

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
