# Oracle Compatibility - Function - TO_NUMBER()

---

## 1. Syntax

```sql
TO_NUMBER(expr [ , fmt [ , 'nlsparam'] ] )
```

## 2. Definition and Usage

`TO_NUMBER` converts `expr` into a value of the `number` type in the format specified by `fmt`.

Currently supported usages:
```
-- The simplest syntax
TO_NUMBER(expr)

-- Automatically removes leading and trailing spaces
TO_NUMBER(' xxxxx ')

-- Currently the fmt parameter only supports common formats such as "9990.9909" or '9990.9909'. The integer and fractional parts support 9 or 0 to represent the format, without rounding
TO_NUMBER(expr [ , fmt [ , 'nlsparam'] ] )

-- Both of the following SQL statements return NULL
TO_NUMBER('')
TO_NUMBER(null)

-- Full syntax
TO_NUMBER(expr [ , fmt [ , 'nlsparam'] ] )
```

The optional values of the parameter `fmt` are shown in the following table:

| fmt No. | Format symbol | Meaning | Example |
| ------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1       | 9      | Returns a value with the specified number of digits, with a leading space if positive and a leading minus sign if negative. Leading zeros are blank, except for the zero value, which returns zeros for the integer part of a fixed-point number | `TO_NUMBER('1234','9999')` returns **1234**|
| 2       | 0      | Leading zero, trailing 0                                               | `TO_NUMBER('0234','0999')` returns **234**; the integer part of the parameter must be 4 digits, and the high-order digits of the string to be converted are padded with 0 |
| 3       | Comma,  | Conversion of strings containing commas. Multiple commas can be specified in the format model. Format restrictions: commas cannot appear at the beginning; commas cannot appear to the right of the decimal point | `TO_NUMBER('1,234.567','9,999.999')` returns **1234.567** |
| 4       | Decimal point. | Decimal format conversion; it specifies the position of the decimal point | `TO_NUMBER('0.12','0.99')` returns **0.12** |
| 5       | EEEE   | Returns the value in scientific notation (when it is '+', if the exponent < 15, the result is displayed as a number, and if >= 15, the result is displayed in scientific notation; when it is '-', if the exponent < 16, the result is displayed as a number, and if >= 16, the result is displayed in scientific notation) | `TO_NUMBER('1.6E+02','9.9EEEE')` returns **160**; `TO_NUMBER('1.6e+16','9.9EEEE')` returns **1.6e16** |
| 6       | X      | Converts hexadecimal to a decimal number                                     | `TO_NUMBER('4D2','XXX')` returns **1234** |

## 3. Oracle Compatibility Notes

1. The currently supported `fmt` formats are listed in the table above; other formats that are not yet supported trigger an error message.

2. The output of scientific notation (EEEE, fmt = 5) differs from Oracle. Executing the SQL statement `SELECT TO_NUMBER('1.666e+30','9.999EEEE') FROM DUAL;` returns **1.666e+30** in Oracle, while the result in GreatSQL is **1.666e30**.

3. When the X format (fmt = 6) is set and the input parameter value contains special characters such as **'.'**, the result of `TO_NUMBER(',0.','xxx')` differs from Oracle: Oracle returns a very large value, while GreatSQL determines that the fmt format input does not match and reports an error.

4. When executing, for example, `TO_NUMBER(',123,','99,999,')`, the result differs from Oracle: Oracle reports an error, while GreatSQL does not. This currently conflicts with known compatible scenarios, such as `TO_NUMBER(',123','9,9,9,999')` and `TO_NUMBER('123,','9,9,9,999,')`, neither of which reports an error in GreatSQL; all of these examples return **123** in GreatSQL.

5. The escape symbol **`\`** is uniformly filtered out in GreatSQL, which differs from Oracle. Only when `sql_mode = NO_BACKSLASH_ESCAPES` is set does GreatSQL not filter out escape characters, and then its behavior is consistent with Oracle. For example: `SET sql_mode = NO_BACKSLASH_ESCAPES; SELECT TO_NUMBER('-\,0.0','9,9.9') FROM DUAL;` reports an error, consistent with Oracle behavior.

## 4. Examples

```
greatsql> SELECT TO_NUMBER('1234.56');
+----------------------+
| TO_NUMBER('1234.56') |
+----------------------+
|              1234.56 |
+----------------------+

greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` int unsigned DEFAULT NULL,
  `c2` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

greatsql> SELECT * FROM t1;
+----+------+----------+
| id | c1   | c2       |
+----+------+----------+
|  1 |  211 | 1234abca |
|  2 | NULL | 1234     |
+----+------+----------+

greatsql> SELECT id, c2, TO_NUMBER(c2) FROM t1 WHERE id = 2;
+----+------+---------------+
| id | c2   | TO_NUMBER(c2) |
+----+------+---------------+
|  2 | 1234 |          1234 |
+----+------+---------------+

greatsql> SELECT id, c2, TO_NUMBER(c2, "999999.999") FROM t1 WHERE id = 2;
+----+------+-----------------------------+
| id | c2   | TO_NUMBER(c2, "999999.999") |
+----+------+-----------------------------+
|  2 | 1234 |                    1234.000 |
+----+------+-----------------------------+

-- The input value does not meet the requirements and is out of the conversion range
greatsql>  SELECT id, c2, TO_NUMBER(c2, "999999") FROM t1 WHERE id = 1;
ERROR 1690 (22003): NUMBER value is out of range in 'to_number'

-- The fmt parameter format is incorrect
greatsql> SELECT TO_NUMBER(123.456, 'a999.99') ;
ERROR 1525 (HY000): Incorrect format model value: 'a999.99'

-- The fmt parameter format is correct, but the source data does not conform to the format
greatsql> SELECT TO_NUMBER(123333.456, '999.99') ;
  ERROR 1690 (22003): NUMBER value is out of range in 'to_number'

-- The fmt format parameter is out of range
greatsql> SELECT TO_NUMBER(12333333333333333333333333333333333333333.456,'9999999999999999999999999999999999999999999999999999999999999999999999.99') ;
ERROR 1059 (42000): Identifier name '9999999999999999999999999999999999999999999999999999999999999999999999.99' is too long
  
greatsql> SELECT TO_NUMBER('12,12,12','99,99,99.99') FROM DUAL;
+-------------------------------------+
| TO_NUMBER('12,12,12','99,99,99.99') |
+-------------------------------------+
|                              121212 |
+-------------------------------------+

greatsql> SELECT TO_NUMBER('0.12','0.99') FROM DUAL;
+--------------------------+
| TO_NUMBER('0.12','0.99') |
+--------------------------+
|                     0.12 |
+--------------------------+

greatsql> SELECT TO_NUMBER('1.6E+02','9.9EEEE') FROM DUAL;
+--------------------------------+
| TO_NUMBER('1.6E+02','9.9EEEE') |
+--------------------------------+
|                            160 |
+--------------------------------+

greatsql> SELECT TO_NUMBER('1.6e+16','9.9EEEE') FROM DUAL;
+--------------------------------+
| TO_NUMBER('1.6e+16','9.9EEEE') |
+--------------------------------+
|                         1.6e16 |
+--------------------------------+

greatsql> SELECT TO_NUMBER('f12','XXX') FROM DUAL;
+------------------------+
| TO_NUMBER('f12','XXX') |
+------------------------+
|                   3858 |
+------------------------+

greatsql> SELECT TO_NUMBER('4D2','XXX') FROM DUAL;
+------------------------+
| TO_NUMBER('4D2','XXX') |
+------------------------+
|                   1234 |
+------------------------+

greatsql> SET sql_mode = NO_BACKSLASH_ESCAPES;

greatsql> SELECT TO_NUMBER('-\,0.0','9,9.9') FROM DUAL;
ERROR 1690 (22003): NUMBER value is out of range in 'to_number'

greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT TO_NUMBER('-\,0.0','9,9.9') FROM DUAL;
+-----------------------------+
| TO_NUMBER('-\,0.0','9,9.9') |
+-----------------------------+
|                           0 |
+-----------------------------+  
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
