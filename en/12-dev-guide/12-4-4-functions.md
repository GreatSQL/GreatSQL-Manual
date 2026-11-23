# Supported Functions
---
This section lists the functions supported by GreatSQL and provides examples.

This section uses the sample databases mentioned in [Documentation Conventions](./12-dev-guide.md):
- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

## Function Categories
The functions supported by GreatSQL can be roughly divided into the following categories:
1. String functions
2. Mathematical functions
3. Date and time functions
4. Flow control functions
5. System information functions
6. Window functions

## String Functions
GreatSQL provides a series of string functions for processing and manipulating string data. These functions are very feature-rich and can meet various string processing requirements.
### CONCAT() Function
Used to concatenate two or more strings.

For example: `CONCAT('Hello', ' ', 'World')` returns the string "Hello World".
```sql
greatsql> SELECT CONCAT('Hello', ' ', 'World');
+-------------------------------+
| CONCAT('Hello', ' ', 'World') |
+-------------------------------+
| Hello World                   |
+-------------------------------+
1 row in set (0.00 sec)
```
### SUBSTRING() Function
Used to extract a substring of a string.

For example: `SUBSTRING('abcdef', 3, 2)` returns the string "cd".
```sql
greatsql> SELECT SUBSTRING('abcdef', 3, 2);
+---------------------------+
| SUBSTRING('abcdef', 3, 2) |
+---------------------------+
| cd                        |
+---------------------------+
1 row in set (0.00 sec)
```

### REPLACE() Function
Used to replace a specified substring in a string.

For example: `REPLACE('This is a test', 'is', 'was')` returns the string "This was a test".
```sql
greatsql> SELECT REPLACE('This is a test', 'is', 'was');
+----------------------------------------+
| REPLACE('This is a test', 'is', 'was') |
+----------------------------------------+
| Thwas was a test                       |
+----------------------------------------+
1 row in set (0.00 sec)
```
### TRIM() Function

Used to remove spaces from both ends of a string.

For example: `TRIM(' Hello World ')` returns the string "Hello World".
```sql
greatsql> SELECT TRIM(' Hello World ');
+-----------------------+
| TRIM(' Hello World ') |
+-----------------------+
| Hello World           |
+-----------------------+
1 row in set (0.00 sec)
```
### LOWER() Function

Used to convert a string to lowercase.

For example: `LOWER('HELLO WORLD')` returns the string "hello world".
```sql
greatsql> SELECT LOWER('HELLO WORLD');
+----------------------+
| LOWER('HELLO WORLD') |
+----------------------+
| hello world          |
+----------------------+
1 row in set (0.00 sec)
```

### UPPER() Function

Used to convert a string to uppercase.

For example: `UPPER('hello world')` returns the string "HELLO WORLD".
```sql
greatsql> SELECT UPPER('hello world');
+----------------------+
| UPPER('hello world') |
+----------------------+
| HELLO WORLD          |
+----------------------+
1 row in set (0.00 sec)
```
### LEFT() Function

Used to extract the specified number of characters from the left side of a string.

For example: `LEFT('abcdef', 3)` returns the string "abc".
```sql
greatsql> SELECT LEFT('abcdef', 3);
+-------------------+
| LEFT('abcdef', 3) |
+-------------------+
| abc               |
+-------------------+
1 row in set (0.00 sec)
```
### RIGHT() Function

Used to extract the specified number of characters from the right side of a string.

For example: `RIGHT('abcdef', 3)` returns the string "def".

```sql
greatsql> SELECT RIGHT('abcdef', 3);
+--------------------+
| RIGHT('abcdef', 3) |
+--------------------+
| def                |
+--------------------+
1 row in set (0.00 sec)
```
### LPAD() Function

Used to pad a string on the left with a specified number of characters.

For example: `LPAD('Hello', 10, '#')` returns the string "####Hello".

```sql
greatsql> SELECT LPAD('Hello', 10, '#');
+------------------------+
| LPAD('Hello', 10, '#') |
+------------------------+
| #####Hello             |
+------------------------+
1 row in set (0.00 sec)
```

### RPAD() Function

Used to pad a string on the right with a specified number of characters.

For example: `RPAD('Hello', 10, '#')` returns the string "Hello####".
```sql
greatsql> SELECT RPAD('Hello', 10, '#');
+------------------------+
| RPAD('Hello', 10, '#') |
+------------------------+
| Hello#####             |
+------------------------+
1 row in set (0.00 sec)
```
### LOCATE() Function
Used to find the position of the first occurrence of a substring in a string.

For example: `LOCATE('World', 'Hello World')` returns 7.
```sql
greatsql> SELECT LOCATE('World', 'Hello World');
+--------------------------------+
| LOCATE('World', 'Hello World') |
+--------------------------------+
|                              7 |
+--------------------------------+
1 row in set (0.00 sec)
```
### INSTR() Function

Similar to the `LOCATE()` function.

For example, the following query finds the position of the first occurrence of "world" in the string "Hello World":
```sql
greatsql> SELECT INSTR('Hello World', 'World');
+-------------------------------+
| INSTR('Hello World', 'World') |
+-------------------------------+
|                             7 |
+-------------------------------+
1 row in set (0.00 sec)
```
### LENGTH() Function
Used to obtain the actual number of bytes of a string.

For example: `LENGTH('Hello World')` returns 11.
```sql
greatsql> SELECT LENGTH('Hello World');
+-----------------------+
| LENGTH('Hello World') |
+-----------------------+
|                    11 |
+-----------------------+
1 row in set (0.00 sec)
```
For example, the Chinese characters `你好` occupy 3 bytes each in UTF-8, so the `LENGTH()` function returns 6.
```sql
greatsql> SELECT LENGTH('你好');
+------------------+
| LENGTH('你好')   |
+------------------+
|                6 |
+------------------+
1 row in set (0.00 sec)
```

### ISNULL() Function
Used to check whether an expression is NULL.

For example: `ISNULL(NULL)` returns 1 (meaning that the value is NULL).
```sql
greatsql> SELECT ISNULL(NULL);
+--------------+
| ISNULL(NULL) |
+--------------+
|            1 |
+--------------+
1 row in set (0.00 sec)
```
### CHAR_LENGTH() Function
Unlike the `LENGTH()` function, which returns the number of bytes, `CHAR_LENGTH()` returns the number of characters in a string regardless of the actual number of bytes. It counts the actual characters in the string and is not affected by multi-byte character encodings.

For example: `CHAR_LENGTH('你好')` returns 2 instead of 6 (in UTF-8, each Chinese character occupies 3 bytes).
```sql
greatsql> SELECT CHAR_LENGTH('你好');
+-----------------------+
| CHAR_LENGTH('你好')   |
+-----------------------+
|                     2 |
+-----------------------+
1 row in set (0.00 sec)
```
### ASCII() Function
Used to obtain the ASCII code value of a character.

For example: `ASCII('A')` returns 65.
```sql
greatsql> SELECT ASCII('A');
+------------+
| ASCII('A') |
+------------+
|         65 |
+------------+
1 row in set (0.00 sec)
```
### CONV() Function
Used to convert a string to a number in the specified base.

The format is: `CONV(string, from_base, to_base)`
- The `string` parameter indicates the string.
- The `from_base` parameter indicates the base of the string, with a value range of 2 to 36.
- The `to_base` parameter indicates the base after conversion, with a value range of 2 to 36.

For example: `CONV('123', 10, 16)` converts 123 from base 10 to base 16 and returns the string "7B".
```sql
greatsql> SELECT CONV('123', 10, 16);
+---------------------+
| CONV('123', 10, 16) |
+---------------------+
| 7B                  |
+---------------------+
1 row in set (0.00 sec)
```

### REVERSE() Function
Used to reverse a string.

For example: `REVERSE('Hello World')` returns the string "dlroW olleH".
```sql
greatsql> SELECT REVERSE('Hello World');
+------------------------+
| REVERSE('Hello World') |
+------------------------+
| dlroW olleH            |
+------------------------+
1 row in set (0.00 sec)
```

## Mathematical Functions
Mathematical functions in GreatSQL are functions used to perform mathematical operations. They can be used for various purposes, such as calculating column values, comparing values, or extracting data from a result set.

### ROUND() Function
The rounding function, used to round a number to the specified number of decimal places.
- For positive numbers, the value is rounded as usual.
- For negative numbers, the sign is removed first, the value is rounded, and then the sign is added back.

The format is as follows:
```sql
ROUND(number, decimals)
```
- number: the number to be rounded
- decimals: the number of decimal places to round to

For example: `ROUND(1.598588,3)` returns 1.599.
```sql
greatsql> SELECT ROUND(1.598588,3);
+-------------------+
| ROUND(1.598588,3) |
+-------------------+
|             1.599 |
+-------------------+
1 row in set (0.00 sec)
```
If the number is negative, `ROUND(-1.598658,3)` returns -1.599.
```sql
greatsql> SELECT ROUND(-1.598588,3);
+--------------------+
| ROUND(-1.598588,3) |
+--------------------+
|             -1.599 |
+--------------------+
1 row in set (0.00 sec)
```
### CEIL() Function
The ceiling function, used to round a number up to the next integer.

For example: `CEIL(1.598588)` returns 2.
```sql
greatsql> SELECT CEIL(1.598588);
+----------------+
| CEIL(1.598588) |
+----------------+
|              2 |
+----------------+
1 row in set (0.00 sec)
```
### AVG() Function
Used to calculate the average value of a column.

For example: `AVG(column_name)` returns the average value of a column. Take the Population column of the city table as an example.
```sql
greatsql> SELECT AVG(Population) FROM city;
+-----------------+
| AVG(Population) |
+-----------------+
|     350383.9583 |
+-----------------+
1 row in set (0.00 sec)
```
### SUM() Function
Used to calculate the sum of a column.

For example: `SUM(column_name)` returns the sum of a column. Take the Population column of the city table as an example.
```sql
greatsql> SELECT SUM(Population) FROM city;
+-----------------+
| SUM(Population) |
+-----------------+
|      1429566550 |
+-----------------+
1 row in set (0.01 sec)
```
### TRUNCATE() Function
Used to truncate a number and return the truncated value.

The format is: `TRUNCATE(number,decimals)`
- number: the number to be truncated
- decimals: the number of decimal places to keep

For example: `TRUNCATE(1.598588,3)` returns 1.598.
```sql
greatsql> SELECT TRUNCATE(1.598588,3);
+----------------------+
| TRUNCATE(1.598588,3) |
+----------------------+
|                1.598 |
+----------------------+
1 row in set (0.00 sec)
```

### MOD() Function
Used to calculate the remainder of two numbers.

The format is: `MOD(number1, number2)`
- number1: the dividend
- number2: the divisor

For example: `MOD(10,3)` returns 1.
```sql
greatsql> SELECT MOD(10,3);
+-----------+
| MOD(10,3) |
+-----------+
|         1 |
+-----------+
1 row in set (0.00 sec)
```

### POW() Function
Used to calculate an exponential function.

The format is: `POW(number, power)`
- number: the base
- power: the exponent

For example: `POW(2,3)` returns 8.
```sql
greatsql> SELECT POW(2,3);
+----------+
| POW(2,3) |
+----------+
|        8 |
+----------+
1 row in set (0.01 sec)
```
## Date and Time Functions
Date and time functions in GreatSQL are functions used to process and manipulate date and time values. They can be used for various purposes, such as obtaining the current date and time, formatting date and time values, and calculating the difference between date and time values.

### NOW() Function
Used to obtain the current date and time.

For example: `NOW()` returns the current date and time.
```sql
greatsql> SELECT NOW();
+---------------------+
| NOW()               |
+---------------------+
| 2024-05-14 17:29:46 |
+---------------------+
1 row in set (0.01 sec)
```
### CURDATE() Function
Used to obtain the current date.

For example: `CURDATE()` returns the current date.
```sql
greatsql> SELECT CURDATE();
+------------+
| CURDATE()  |
+------------+
| 2024-05-14 |
+------------+
1 row in set (0.00 sec)
```
### CURTIME() Function
Used to obtain the current time.

For example: `CURTIME()` returns the current time.
```sql
greatsql> SELECT CURTIME();
+-----------+
| CURTIME() |
+-----------+
| 17:30:36  |
+-----------+
1 row in set (0.00 sec)
```

### Extracting Date Parts
**The YEAR() function returns the year**
```sql
greatsql> SELECT YEAR(NOW());
+-------------+
| YEAR(NOW()) |
+-------------+
|        2024 |
+-------------+
1 row in set (0.00 sec)
```
**The MONTH() function returns the month**
```sql
greatsql> SELECT MONTH(NOW());
+--------------+
| MONTH(NOW()) |
+--------------+
|            5 |
+--------------+
1 row in set (0.00 sec)
```

**The DAY() function returns the day of the month**
```sql
greatsql> SELECT DAY(NOW());
greatsql> SELECT DAY(NOW());
+------------+
| DAY(NOW()) |
+------------+
|         14 |
+------------+
1 row in set (0.00 sec)
```

**The HOUR() function returns the hour**
```sql
greatsql> SELECT HOUR(NOW());
+-------------+
| HOUR(NOW()) |
+-------------+
|          17 |
+-------------+
1 row in set (0.00 sec)
```
**The MINUTE() function returns the minute**
```sql
greatsql> SELECT MINUTE(NOW());
+---------------+
| MINUTE(NOW()) |
+---------------+
|            34 |
+---------------+
1 row in set (0.00 sec)
```
**The SECOND() function returns the second**
```sql
greatsql> SELECT SECOND(NOW());
+---------------+
| SECOND(NOW()) |
+---------------+
|            17 |
+---------------+
1 row in set (0.01 sec)
```

### WEEKOFYEAR() Function
Used to obtain the week number of the current date within the year.

For example: `WEEKOFYEAR(NOW())` returns the week number of the current date within the year.
```sql
greatsql> SELECT WEEKOFYEAR(NOW());
+-------------------+
| WEEKOFYEAR(NOW()) |
+-------------------+
|                20 |
+-------------------+
1 row in set (0.01 sec)
```

### QUARTER() Function
Used to obtain the quarter of the current date within the year.

For example: `QUARTER(NOW())` returns the quarter of the current date within the year.
```sql
greatsql> SELECT QUARTER(NOW());
+----------------+
| QUARTER(NOW()) |
+----------------+
|              2 |
+----------------+
1 row in set (0.00 sec)
```
### STR_TO_DATE() Function
Used to convert a string to a date.

For example: `STR_TO_DATE('2019-05-14','%Y-%m-%d')` returns a date.
```sql
greatsql> SELECT STR_TO_DATE('2024-05-14','%Y-%m-%d');
+--------------------------------------+
| STR_TO_DATE('2024-05-14','%Y-%m-%d') |
+--------------------------------------+
| 2024-05-14                           |
+--------------------------------------+
1 row in set (0.00 sec)
```
### DATE_FORMAT() Function
Used to format a date as a string.

For example: `DATE_FORMAT(NOW(),'%Y-%m-%d')` returns a date.
```sql
greatsql> SELECT DATE_FORMAT(NOW(),'%Y-%m-%d');
greatsql> SELECT DATE_FORMAT(NOW(),'%Y-%m-%d');
+-------------------------------+
| DATE_FORMAT(NOW(),'%Y-%m-%d') |
+-------------------------------+
| 2024-05-16                    |
+-------------------------------+
1 row in set (0.00 sec)
```
### LAST_DAY() Function
Used to obtain the last day of the month of the specified date.

For example: `LAST_DAY('2019-05-14')` returns the last day of the month of the specified date.
```sql
greatsql> SELECT LAST_DAY('2019-05-14');
+------------------------+
| LAST_DAY('2019-05-14') |
+------------------------+
| 2019-05-31             |
+------------------------+
1 row in set (0.00 sec)
```
### DATEDIFF() Function
Used to calculate the difference between two dates.

For example: `DATEDIFF('2019-05-14','2024-05-14')`
```sql
greatsql> SELECT DATEDIFF('2019-05-14','2024-05-14');
+-------------------------------------+
| DATEDIFF('2019-05-14','2024-05-14') |
+-------------------------------------+
|                               -1827 |
+-------------------------------------+
1 row in set (0.00 sec)
```

## Flow Control Functions
Flow control functions in GreatSQL allow different processing flows to be executed according to different conditions, thus implementing conditional selection in SQL statements.

### IF() Function
Returns the true result if the condition holds; otherwise, returns the false result.

The format is: `IF(condition,result 1,result 2)`. If the condition holds, result 1 is returned; otherwise, result 2 is returned.

For example: `IF(1=2,100,200)` returns 200.
```sql
greatsql> SELECT IF(1=2,100,200);
+-----------------+
| IF(1=2,100,200) |
+-----------------+
|             200 |
+-----------------+
1 row in set (0.00 sec)
```

### IFNULL() Function
Returns the value of the second parameter if the first parameter is NULL; otherwise, returns the value of the first parameter.

The format is: `IFNULL(parameter 1,parameter 2)`. If the first parameter is NULL, the value of the second parameter is returned; otherwise, the value of the first parameter is returned.

For example: `IFNULL(10,20)` returns 10.
```sql
greatsql> SELECT IFNULL(10,20);
+---------------+
| IFNULL(10,20) |
+---------------+
|            10 |
+---------------+
1 row in set (0.00 sec)
```
For example: `IFNULL(NULL,20)` returns 20.
```sql
greatsql> SELECT IFNULL(NULL,20);
+-----------------+
| IFNULL(NULL,20) |
+-----------------+
|              20 |
+-----------------+
1 row in set (0.00 sec)
```
### CASE Function
Returns different values based on the evaluation of conditions.

The format is: `CASE WHEN condition 1 THEN result 1 ELSEIF condition 2 THEN result 2 ... ELSE result n END`.

For example: `CASE WHEN 1=2 THEN '条件成立' ELSE '条件不成立' END`.
```sql
greatsql> SELECT CASE WHEN 1=2 THEN '条件成立' ELSE '条件不成立' END;
+------------------------------------------------------------+
| CASE WHEN 1=2 THEN '条件成立' ELSE '条件不成立' END          |
+------------------------------------------------------------+
| 条件不成立                                                  |
+------------------------------------------------------------+
1 row in set (0.40 sec)
```
For example, in the city table, the Population field holds the city population. If Population is greater than 10000000, `'人口超过1千万'` is returned; if Population is greater than 5000000, `'人口超过5百万'` is returned; otherwise, `'人口不足5百万'` is returned.
```sql
greatsql> SELECT city.Name, Population,
CASE WHEN Population>10000000 THEN '人口超过1千万'
WHEN Population>5000000 THEN '人口超过5百万'
ELSE '人口不足5百万' END AS '城市人口'
FROM city
LIMIT 5;

+----------------+------------+---------------------+
| Name           | Population | 城市人口            |
+----------------+------------+---------------------+
| Kabul          |    1780000 | 人口不足5百万       |
| Qandahar       |     237500 | 人口不足5百万       |
| Herat          |     186800 | 人口不足5百万       |
| Mazar-e-Sharif |     127800 | 人口不足5百万       |
| Amsterdam      |     731200 | 人口不足5百万       |
+----------------+------------+---------------------+
5 rows in set (0.00 sec)
```

## System Information Functions
### VERSION() Function
Used to obtain the current database version.

For example: `VERSION()` returns the current database version.
```sql
greatsql> SELECT VERSION();
+-----------+
| VERSION() |
+-----------+
| 8.0.32-25 |
+-----------+
1 row in set (0.00 sec)
```
### DATABASE() Function
Used to obtain the name of the current database.

For example: `DATABASE()` returns the name of the current database.
```sql
greatsql> SELECT DATABASE();
+------------+
| DATABASE() |
+------------+
| world      |
+------------+
1 row in set (0.00 sec)
```

### SCHEMA() Function
Used to obtain the name of the current database.

For example: `SCHEMA()` returns the name of the current database.
```sql
greatsql> SELECT SCHEMA();
+----------+
| SCHEMA() |
+----------+
| world    |
+----------+
1 row in set (0.00 sec)
```
### USER() Function
Used to obtain the current user.

For example: `USER()` returns the current user.
```sql
greatsql> SELECT USER();
+----------------+
| USER()         |
+----------------+
| root@localhost |
+----------------+
1 row in set (0.00 sec)
```
### CHARSET() Function
Used to obtain the character set used by the current string.

For example: `CHARSET('你好')` returns the current character set.
```sql
greatsql> SELECT CHARSET('你好');
+-------------------+
| CHARSET('你好')   |
+-------------------+
| utf8mb4           |
+-------------------+
1 row in set (0.00 sec)
```
### COLLATION() Function
Used to obtain the collation used by the current string.

For example: `COLLATION('你好')` returns the current collation.
```sql
greatsql> SELECT COLLATION('你好');
+---------------------+
| COLLATION('你好')   |
+---------------------+
| utf8mb4_0900_ai_ci  |
+---------------------+
1 row in set (0.01 sec)
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
