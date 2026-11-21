# Oracle Compatibility - Function - TO_DATE()

---

## 1. Syntax

```
TO_DATE(string , fmt)
```

## 2. Definition and Usage

The `TO_DATE()` function converts string data `string` into a date (time) format type, and `fmt` is used to specify the date model of `string`.

The currently supported `fmt` date models:

| Format | Description | Example or Note |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| YYYY/RRRR | 4-digit year | 2023 |
| YYY | 3-digit year | 023 |
| YY | 2-digit year | 23 |
| RR | 2-digit year | Similar to YY, but returns different values depending on the last two digits of the specified year and the current year:<br/>- If the last two digits of the current year are [00,49]:<br/>  'RR' with the specified year in [00,49] returns the first two digits of the year the same as the current year<br/>  'RR' with the specified year in [50,99] returns the first two digits of the year 1 less than the current year<br/>- If the last two digits of the current year are [50,99]:<br/>  'RR' with the specified year in [00,49] returns the first two digits of the year 1 greater than the current year<br/>  'RR' with the specified year in [50,99] returns the first two digits of the year the same as the current year |
| Y | 1-digit year | 1 |
| DD | Day of month (1-31) | |
| HH, HH12 | Hour of day (1-12). | |
| HH24 | Hour of day (0-23). | |
| MI | Minute that ranges from 0 to 59 | |
| MM | Month that ranges from 01 through 12, where January is 01. | |
| MON | Abbreviated name of the month. | JAN,FEB |
| MONTH | Name of the month. | JANUARY |
| SS | Second (0-59). | |
| AM/A.M. | Meridian indicator with or without periods. | Equivalent to the PM format; the final date value depends on the value at the corresponding position in the first argument string |
| PM/P.M. | Meridian indicator with or without periods. | Equivalent to the AM format; the final date value depends on the value at the corresponding position in the first argument string |
| D | Day of week (1-7). This element depends on the NLS territory of the session. | |
| DDD | Day of year (1-366). | |
| `-` `/` `,` `.` `;` `:` | Punctuation is reproduced in the result.                                                           | Any non-alphanumeric character is allowed to match the punctuation characters in the format model. |
| SSSSS | Seconds past midnight (0-86399). | |
| J | Julian day; the number of days since January 1, 4712 BC. Number specified with J must be integers. | GreatSQL only supports Julian days between 0001-01-01 and 9999-12-31, i.e., the range: [1721424, 5373484] |
| X | Local radix character. | 'HH:MI:SSXFF' |
| Y,YYY | Year with comma in this position. | 2,023 |
| RM | Roman numeral month (I-XII; January = I). | |
| TH | Ordinal Number | DDTH |
| FM | Fill mode. | |
| FX | Format exact. | |

**Output notes:**

- When `fmt` specifies both date and time formats and `string` is successfully parsed, a `DATETIME` value (date + time, e.g., `2023-01-01 00:00:00`) is returned.

- For the date or time parts not specified, `TO_DATE()` assigns default values to the corresponding parts of the returned `DATETIME` value.

| Date or time part | Default value |
| ----------------------- | ------------------------------------------------------------ |
| year   | The current year (i.e., the year in which 'SELECT NOW()' runs) |
| month  | The current month (i.e., the month in which 'SELECT NOW()' runs) |
| day    | The 1st day of each month |
| hour   | 0 |
| minute | 0 |
| second | 0 |

**Examples:**
| TO_DATE() input | Return value |
| ----------------------- | ------------------------------------------------------------ |
| TO_DATE('2023', 'YYYY') | 2023-05-01 00:00:00 |
| TO_DATE('202310', 'YYYYMM') | 2023-10-01 00:00:00 |
| TO_DATE('11', 'HH')     | 2023-05-01 11:00:00 |

## 3. Oracle Compatibility Notes

- When the specified format contains HH or HH12, GreatSQL and Oracle return different values for displaying 12 o'clock. For example:

| TO_DATE() input | Oracle return | GreatSQL return |
| ------------- | ------------------- | ----------- |
| TO_DATE('12','HH12') | 2023-05-01 12:00:00 | 2023-05-01 00:00:00    |
| TO_DATE('12','HH')   | 2023-05-01 12:00:00 | 2023-05-01 00:00:00    |

- In Oracle, the `YY/RR` formats can read 2-digit, 3-digit, or 4-digit year numbers, while GreatSQL can only read 2-digit year numbers.

| TO_DATE() input | Oracle return | GreatSQL return |
| ------------------------- | ---------- | ----------- |
| TO_DATE('20121018', 'YYMMDD')    | 2012-10-18 | NULL        |
| TO_DATE('2012-10-18','YY-MM-DD') | 2012-10-18 | NULL        |
| TO_DATE('20121018', 'RRMMDD')    | 2012-10-18 | NULL        |
| TO_DATE('012-10-18','RR-MM-DD')  | 2012-10-18 | NULL        |
| TO_DATE('12-10-18','YY-MM-DD')   | 2012-10-18 | 2012-10-18 00:00:00  |

## 4. Examples

```sql
greatsql> SELECT TO_DATE('2003-01-02 10:11:12 PM', 'YYYY-MM-DD HH12:MI:SS PM') FROM DUAL;
+---------------------------------------------------------------+
| TO_DATE('2003-01-02 10:11:12 PM', 'YYYY-MM-DD HH12:MI:SS PM') |
+---------------------------------------------------------------+
| 2003-01-02 22:11:12                                           |
+---------------------------------------------------------------+

greatsql> SELECT TO_DATE('03-01-02 8:11:2.123456', 'YY-MM-DD HH24:MI:SS') FROM DUAL;
+----------------------------------------------------------+
| TO_DATE('03-01-02 8:11:2.123456', 'YY-MM-DD HH24:MI:SS') |
+----------------------------------------------------------+
| 2003-01-02 08:11:02                                      |
+----------------------------------------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+--------------------------------------------------------------+
| Level   | Code | Message                                                      |
+---------+------+--------------------------------------------------------------+
| Warning | 1292 | Truncated incorrect datetime value: '03-01-02 8:11:2.123456' |
+---------+------+--------------------------------------------------------------+

greatsql> SELECT TO_DATE('23:45:33','hh24:mi:ss');
+----------------------------------+
| TO_DATE('23:45:33','hh24:mi:ss') |
+----------------------------------+
| 2023-05-01 23:45:33              |
+----------------------------------+

-- GreatSQL supports the `INTERVAL 'n' DAY` arithmetic usage
greatsql> SELECT TO_DATE('20250212','YYYYMMDD') + (INTERVAL '-1' DAY) AS LASTDAY FROM DUAL;
+---------------------+
| LASTDAY             |
+---------------------+
| 2025-02-11 00:00:00 |
+---------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
