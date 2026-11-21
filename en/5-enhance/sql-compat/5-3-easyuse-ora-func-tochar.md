# Oracle Compatibility - Function - TO_CHAR()

---

## 1. Syntax

```sql
TO_CHAR( number  [, fmt [, string ] ] )
TO_CHAR( datetime  [, fmt [, string ] ] )
```

## 2. Definition and Usage

The `TO_CHAR()` function converts a numeric type (`number`) or a date-time type (`datetime`) into a character type (`varchar`).

When the `TO_CHAR()` function is executed without the `fmt` parameter, the result is equivalent to the `CAST()` conversion, which is inconsistent with the result in Oracle.

The principles of data type conversion by the `TO_CHAR()` function are as follows:
1. Format the time type into a string.
2. Convert the numeric type into a string.
3. Parameter 3 (`string`) is intended to be compatible with the Oracle character set parameter usage; in practice it takes no effect and is not validated, and is treated as a reserved parameter.

Format symbols currently supported for time types:

| Format symbol     | Description                           | Difference from Oracle            |
| ----------------- | ------------------------------ | ------------------------ |
| ```!@#$%^*()_+-{}:<>?[]\;,.'\`=&\|``` | Reproduce punctuation | |
| “text” | Reproduce quoted text | |
| AD / A.D. | AD with or without periods | |
| AM / A.M. | Meridian indicator with A.M. | |
| BC / B.C. | BC | |
| CC | Century; for example, 2002 returns 21; 2000 returns 20 | |
| D | Day of week 1-7 (Sunday is 1 by default) | Monday or Sunday can be defined as the first day of the week according to `default_week_format` |
| DAY | Full name of the day | |
| DD | Day of month 1-31 | |
| DDD | Day of year (1-366) | |
| DY | Abbreviated name of the day | |
| FF[1-9] | Fractional seconds, 6 digits by default | Also supports use with the sysdate type |
| FM | Remove leading or trailing spaces | |
| HH / H12 | Hour 1-12 | |
| HH24 | Hour 0-23 | |
| IW | Calendar week defined by the ISO 8601 standard (1-52 or 1-53) | |
| I/IY/IYY | Last 3, 2, or 1 digit(s) of the ISO 8601 year containing the calendar week | |
| IYYY | 4-digit ISO 8601 year containing the calendar week | |
| J | Julian day | Years less than 0 are not supported |
| MI | Minute 0-59 | |
| MM | Month 0-12 | |
| MON | Abbreviated name of the month | |
| MONTH | Full name of the month | Chinese: `一月`, Oracle: `1 月` |
| PM / P.M. | Meridian indicator with P.M. | |
| Q | Quarter | |
| RM | Roman numeral month | |
| RR | Two-digit year in the 21st and 20th centuries | |
| RRRR | Full year | |
| SS | Second 0-59 | |
| SSSSS | Seconds past 00:00:00 (0-86399) | |
| TH | Ordinal suffix | Except for non-numeric outputs, other elements can be followed by the TH suffix |
| W | Week of the year (1-53), where week 1 starts from the first day of the year | |
| WW | Week of the month (1-5), where week 1 starts from the first day of the month | |
| X | Decimal point, used together with the FF format, e.g., 'HH:MI:SSXFF' | |
| YYYY/YYY / YY / Y | Year | |
| Y,YYY | Year with a comma | |
| YEAR | Year spelled in English | Years less than 0 are not supported |

**Notes:**
- Since `|` is also the concatenation operator in Oracle, a single `|` is ignored.
- In a date-time format string, a single `|` is ignored; only when multiple `|` appear are they not ignored.
- A single `\` (backslash, not including double quotes) is treated as an escape character; to display `\`, it must be written as `\\`.
- When a non-numeric output format, for example **DY/DAY/AD/BC/AM/PM/MON/MONTH/YEAR/RM**, is followed by the **TH** suffix, an error message is generated: `ERROR 3047 (HY000): Invalid argument error: ... TH in function to_char`.
- When the **CC** format is used and the year is less than 0 or greater than 9900, an error message is generated: `ERROR 3048 (HY000): Out of range error: year must be between 0001 and 9900 in function to_char`.

Examples:
```sql
-- A single | is ignored
-- Only when more than one | appears are they not ignored
greatsql> SELECT TO_CHAR(NOW(), 'YYYY|MM|DD'), TO_CHAR(NOW(), 'YYYY|MM||DD||');
+------------------------------+---------------------------------+
| TO_CHAR(NOW(), 'YYYY|MM|DD') | TO_CHAR(NOW(), 'YYYY|MM||DD||') |
+------------------------------+---------------------------------+
| 20230511                     | 202305|11|                      |
+------------------------------+---------------------------------+

greatsql> SELECT TO_CHAR("GreatSQ|L数据库"), TO_CHAR("GreatSQL\数据库"), TO_CHAR("GreatSQL\\数据库");
+-------------------------------+-------------------------------+--------------------------------+
| TO_CHAR("GreatSQ|L数据库")    | TO_CHAR("GreatSQL\数据库")    | TO_CHAR("GreatSQL\\数据库")    |
+-------------------------------+-------------------------------+--------------------------------+
| GreatSQ|L数据库               | GreatSQL数据库                | GreatSQL\数据库                |
+-------------------------------+-------------------------------+--------------------------------+
```

The option `default_week_format` is used to define Monday or Sunday as the first day of the week:

Mode |    First day of week
-- | -- |
0    | Sunday
1    |Monday
2    |Sunday
3    |Monday
4    |Sunday
5    |Monday
6    |Sunday
7    |Monday

Format symbols currently supported for numeric types:

| Format symbol | Description | Restrictions |
| --------- | ---------- | ---------- |
| $ | Dollar sign | |
| 9 | Returns a value with the specified number of digits, with a leading space if positive and a leading minus sign if negative. Leading zeros are blank, except for the zero value, which returns zeros for the integer part of a fixed-point number. | |
| 0 | Leading zero, trailing 0 | |
| , (COMMA) | Group separator | In a number format model, the group separator cannot appear to the right of the decimal character or decimal point. |
| . | Decimal point | Only one decimal point can be specified in a number format model |
| B | Returns an empty string if 0, with a length equal to the length of the format string | |
| D | Decimal point character according to the local configuration; only one decimal point is allowed in the same format string | Only one decimal point can be specified in a number format model |
| G | Group separator | In a number format model, the group separator cannot appear to the right of the decimal character or decimal point. |
| EEEE | Scientific notation | |
| PR | 1. Negative numbers use <> 2. Positive numbers return with a leading sign and trailing spaces | |
| MI | Returns negative values with a trailing minus sign (-), and positive values with trailing blanks. | The format element can only appear in the last position of the number format model |
| S | 1. Returns negative values with a leading minus sign (-).</br> 2. Returns positive values with a leading plus sign (+).</br>3. Returns negative values with a trailing minus sign (-).</br> 4. Returns positive values with a trailing plus sign (+). | Can only appear in the first or last position of the number format model. |
| TM | Returns the numeric string; by default 'TM9' returns the numeric string, and 'TME' returns the scientific notation string | 1. No other element can be added before this element </br> 2. Only one 9 or one E (or e) can be used after this element, but any combination of them is not allowed |
| V | Returns the value multiplied by 10^N, where n is the number of 9s after V | Cannot be used together with scientific notation |
| X/x | Returns hexadecimal in uppercase/lowercase; only positive integers are accepted | 1. You can only add 0 (returns leading zeros) or FM before this element. Any other element returns an error. If you specify neither 0 nor FM with X, the return always has a leading space </br> 2. This element only accepts positive values or 0. Negative values return an error |
| FM | Removes leading space characters and trailing 0 | |

If the integer part of a number exceeds the formatting range, '#' is used to replace the returned fractional part; if it exceeds the format range for the fractional part, the **last digit is rounded**.

The maximum length of the numeric part cannot exceed 64 digits, for example: 1e+64.

## 3. Examples

```sql

greatsql> SELECT TO_CHAR(NOW(), 'YYYY/MM/DD HH24:MI:SS' );
+------------------------------------------+
| TO_CHAR(NOW(), 'YYYY/MM/DD HH24:MI:SS' ) |
+------------------------------------------+
| 2023/05/11 16:42:52                      |
+------------------------------------------+

greatsql> SELECT TO_CHAR(NOW(), 'YY/MON/DAY HH24:MI:SS' );
+------------------------------------------+
| TO_CHAR(NOW(), 'YY/MON/DAY HH24:MI:SS' ) |
+------------------------------------------+
| 23/MAY/THURSDAY  16:43:10                |
+------------------------------------------+

greatsql> SELECT TO_CHAR(NOW(), 'RR/MONTH/DY HH24:MI:SS' );
+-------------------------------------------+
| TO_CHAR(NOW(), 'YY/MONTH/DY HH24:MI:SS' ) |
+-------------------------------------------+
| 23/MAY      /THU 16:43:23                 |
+-------------------------------------------+

greatsql> SELECT TO_CHAR(0,'99.99') FROM DUAL;
+--------------------+
| TO_CHAR(0,'99.99') |
+--------------------+
| .00                |
+--------------------+

greatsql> SELECT TO_CHAR(0,'090V99' ) FROM DUAL;
+----------------------+
| TO_CHAR(0,'090V99' ) |
+----------------------+
| 00000                |
+----------------------+

greatsql> SELECT TO_CHAR(0.1 ,'90.99' ) FROM DUAL;
+------------------------+
| TO_CHAR(0.1 ,'90.99' ) |
+------------------------+
| 0.10                   |
+------------------------+

greatsql> SELECT TO_CHAR(-0.2 ,'90.99' ) FROM DUAL;
+-------------------------+
| TO_CHAR(-0.2 ,'90.99' ) |
+-------------------------+
| -0.20                   |
+-------------------------+

greatsql> SELECT TO_CHAR(1 ,'B9999' ) FROM DUAL;
+----------------------+
| TO_CHAR(1 ,'B9999' ) |
+----------------------+
| 1                    |
+----------------------+

greatsql> SELECT TO_CHAR(0 ,'B90.99' ) , LENGTH(TO_CHAR(0 ,'B90.99' )) FROM DUAL;
+-----------------------+-------------------------------+
| TO_CHAR(0 ,'B90.99' ) | LENGTH(TO_CHAR(0 ,'B90.99' )) |
+-----------------------+-------------------------------+
|                       |                             6 |
+-----------------------+-------------------------------+

greatsql> SELECT TO_CHAR(123.456 ,'999.999' ) FROM DUAL;
+------------------------------+
| TO_CHAR(123.456 ,'999.999' ) |
+------------------------------+
| 123.456                      |
+------------------------------+

greatsql> SELECT TO_CHAR(-123.456 ,'999.999' ) FROM DUAL;
+-------------------------------+
| TO_CHAR(-123.456 ,'999.999' ) |
+-------------------------------+
| -123.456                      |
+-------------------------------+

greatsql> SELECT TO_CHAR(123.456 ,'FM999.009' ) FROM DUAL;
+--------------------------------+
| TO_CHAR(123.456 ,'FM999.009' ) |
+--------------------------------+
| 123.456                        |
+--------------------------------+

greatsql> SELECT TO_CHAR(123.456 ,'9.9EEEE' ) FROM DUAL;
+------------------------------+
| TO_CHAR(123.456 ,'9.9EEEE' ) |
+------------------------------+
| 1.2e+02                      |
+------------------------------+

greatsql> SELECT TO_CHAR(1E+123 ,'9.9EEEE' ) FROM DUAL;
ERROR 3049 (HY000): Overflow error: number in function to_char.

greatsql> SELECT TO_CHAR(NOW(),'9.9');
ERROR 3047 (HY000): Invalid argument error: 9.9 in function to_char.

greatsql> SELECT TO_CHAR(99,'YYY');
ERROR 3047 (HY000): Invalid argument error: YYY in function to_char.

greatsql> SELECT TO_CHAR(1234567890 ,'9999999999S' ) FROM DUAL;
+-------------------------------------+
| TO_CHAR(1234567890 ,'9999999999S' ) |
+-------------------------------------+
| 1234567890+                         |
+-------------------------------------+

greatsql> SELECT TO_CHAR(111,'99');
+-------------------+
| TO_CHAR(111,'99') |
+-------------------+
| ###               |
+-------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
