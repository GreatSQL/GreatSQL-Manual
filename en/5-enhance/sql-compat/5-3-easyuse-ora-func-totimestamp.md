# Oracle Compatibility - Function - TO_TIMESTAMP()

---

## 1. Syntax

```
TO_TIMESTAMP(string , fmt)
```

## 2. Definition and Usage

The `TO_TIMESTAMP()` function converts string data `string` into a date (time) format type, and `fmt` is used to specify the date model of `string`.

The date models supported by the parameter `fmt`:

| Format | Description | Example or Note |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| YYYY/RRRR               | 4-digit year                                                                                       | 2021                                                                                                                                                                                                                                                                                                                                                                               |
| YYY                     | 3-digit year                                                                                       | 021                                                                                                                                                                                                                                                                                                                                                                                |
| YY                      | 2-digit year                                                                                       | 21                                                                                                                                                                                                                                                                                                                                                                                 |
| RR                      | 2-digit year                                                                                       | Similar to YY, but returns different values depending on the last two digits of the specified year and the current year:<br/>- If the last two digits of the current year are [00,49]:<br/>  'RR' with the specified year in [00,49] returns the first two digits of the year the same as the current year<br/>  'RR' with the specified year in [50,99] returns the first two digits of the year 1 less than the current year<br/>- If the last two digits of the current year are [50,99]:<br/>  'RR' with the specified year in [00,49] returns the first two digits of the year 1 greater than the current year<br/>  'RR' with the specified year in [50,99] returns the first two digits of the year the same as the current year |
| Y| 1-digit year| 1|
| DD| Day of month (1-31)||
| HH, HH12| Hour of day (1-12).||
| HH24| Hour of day (0-23).||
| MI| Minute that ranges from 0 to 59||
| MM| Month that ranges from 01 through 12, where January is 01.||
| MON| Abbreviated name of the month.| JAN,FEB|
| MONTH| Name of the month.| JANUARY|
| SS| Second (0-59).||
| AM| Meridian indicator with or without periods.| Equivalent to the PM format; the final date value depends on the value at the corresponding position in the first argument string|
| PM| Meridian indicator with or without periods.| Equivalent to the AM format; the final date value depends on the value at the corresponding position in the first argument string|
| FF[1-6]| Fractional seconds||
| D| Day of week (1-7). This element depends on the NLS territory of the session.||
| DDD| Day of year (1-366).||
| `-` `/` `,` `.` `;` `:` | Punctuation is reproduced in the result.                                                           | Any non-alphanumeric character is allowed to match the punctuation characters in the format model.|
| SSSSS| Seconds past midnight (0-86399).||
| J| Julian day; the number of days since January 1, 4712 BC. Number specified with J must be integers. | GreatSQL only supports Julian days between 0001-01-01 and 9999-12-31, i.e., the range: [1721424, 5373484]|
| X| Local radix character.| 'HH:MI:SSXFF'|
| Y,YYY| Year with comma in this position.| 2,023|
| RM| Roman numeral month (I-XII; January = I).||
| TH| Ordinal Number| DDTH|
| FM| Fill mode.||
| FX| Format exact.||

Notes on the function return value:

- When the date format is specified in the parameter `fmt` and `string` is successfully parsed, a timestamp value with a date is returned (date + time, e.g., `2023-01-01 00:00:00.00000`).
- When a legal date-time value cannot be obtained from `string` according to `fmt`, NULL is returned.
- For the returned `timestamp` value, the fractional seconds part is 6 digits long, and the value of the fractional seconds part is determined by the FF indicator. Specific examples are as follows:

| TO_TIMESTAMP() input | Description | Output result |
| ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS') | FF format not specified; all fractional seconds are set to zero | NULL |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff') | FF specified but without digits; all 6 fractional second digits are kept by default | 2023-05-01 11:00:00.123456 |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff6') | FF specified with 6 digits; parsed correctly | 2023-05-01 11:00:00.123456 |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff2') | FF specified with 2 digits, but the fractional seconds part has 6 digits; parsing fails | NULL |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff0')<br/><br/>TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff7') | FF specified but the digit indicator is out of the legal range (1-6); an error is reported | ERROR 1525 (HY000): Incorrect string value: 'please check the format string' |

## 3. Oracle Compatibility Notes

- When the specified format contains HH or HH12, GreatSQL and Oracle return different values for displaying 12 o'clock. As shown in the example below:

| TO_TIMESTAMP() input| Oracle return| GreatSQL return|
| ------------- | ----------------------- | ------------ |
| TO_TIMESTAMP('12','HH12') | 2023-09-01 12:00:00.000000000 | 2023-05-01 00:00:00.000000 |
| TO_TIMESTAMP('12','HH')   | 2023-09-01 12:00:00.000000000 | 2023-05-01 00:00:00.000000 |

- The fractional seconds part differs: the fractional seconds part of the Oracle return value is 9 digits, while GreatSQL uses 6 digits.

| TO_TIMESTAMP() input| Oracle return| GreatSQL return |
| -------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff')     | 11.00.00.123456000 | 2023-05-01 11:00:00.123456 |
| TO_TIMESTAMP('11:00:00.123456', 'HH:Mi:SS.ff6')    | 11.00.00.123456    | 2023-05-01 11:00:00.123456 |
| TO_TIMESTAMP('11:00:00.123456789', 'HH:Mi:SS.ff9') | 11.00.00.123456789 | ERROR 1525 (HY000): Incorrect string value: 'please check the format string' |

- Format support differs: the Oracle YY format can read 2-digit, 3-digit, or 4-digit year numbers, while GreatSQL can only read 2-digit year numbers. Examples of the differences are as follows:

| TO_TIMESTAMP() input| Oracle return| GreatSQL return |
| --------------------- | ----------------------------------------- | ----------- |
| TO_TIMESTAMP('20121018', 'YYMMDD')    | 2012-10-18 | NULL        |
| TO_TIMESTAMP('2012-10-18','YY-MM-DD') | 2012-10-18 | NULL        |
| TO_TIMESTAMP('20121018', 'RRMMDD')    | 2012-10-18 | NULL        |
| TO_TIMESTAMP('012-10-18','RR-MM-DD')  | 2012-10-18 | NULL        |
| TO_TIMESTAMP('12-10-18','YY-MM-DD')   | 2012-10-18 | 2012-10-18 00:00:00.000000  |

## 4. Examples

```sql
greatsql> SELECT TO_TIMESTAMP('2003-01-02 10:11:12 PM', 'YYYY-MM-DD HH12:MI:SS PM') FROM DUAL;
+--------------------------------------------------------------------+
| TO_TIMESTAMP('2003-01-02 10:11:12 PM', 'YYYY-MM-DD HH12:MI:SS PM') |
+--------------------------------------------------------------------+
| 2003-01-02 22:11:12.000000                                         |
+--------------------------------------------------------------------+

greatsql> SELECT TO_TIMESTAMP('03-01-02 8:11:2.123456', 'YY-MM-DD HH24:MI:SS.FF') FROM DUAL;
+-------------------------------------------------------------------+
| TO_TIMESTAMP('03-01-02 8:11:2.123456', 'YY-MM-DD HH24:MI:SS.FF')  |
+-------------------------------------------------------------------+
| 2003-01-02 08:11:02.123000                                        |
+-------------------------------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
