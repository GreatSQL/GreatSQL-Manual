# Rapid、Turbo 引擎支持的函数与操作符

## 聚合函数

| Name | Description |
| --- | --- |
|AVG()|Return the average value of the argument|
|COUNT()|Return a count of the number of rows returned|
|COUNT(DISTINCT)|Return the count of a number of different values|
|MAX()|Return the maximum value|
|MIN()|Return the minimum value|
|STD()|Return the population standard deviation|
|STDDEV()|Return the population standard deviation|
|STDDEV_POP|Return the population standard deviation|
|STDDEV_SAMP|Return the sample standard deviation|
|SUM()|Return the sum|
|VAR_POP()|Return the population standard variance|
|VAR_SAMP()|Return the sample variance|
|VARIANCE()|Return the population standard variance|

## 算术运算符

| Name | Description |
| --- | --- |
|/|Division operator|
|-|Minus operator|
|%，MOD|Modulo operator|
|+|Addition operator|
|*|Multiplication operator|
|-|Change the sign of the argument|

## Cast函数与操作符

Cast类型支持如下：

* CHAR[(N)]
* DATE
* DATETIME
* DECIMAL
* DOUBLE
* FLOAT
* SIGNED [INTEGER]
* TIME
* UNSIGNED [INTEGER]
* YEAR

其中，不支持强转为二进制字符串。

## 比较函数与操作符

| Name | Description |
| --- | --- |
|BETWEEN ... AND ...|Check whether a value is within a range of values|
|COALESCE()|Return the first non-NULL argument. Not supported as a JOIN predicate.|
|=|Equal operator|
|<=>|NULL-safe equal to operator|
|>=|Greater than or equal operator|
|<=|Less than or equal operator|
|>|Greater than operator|
|<|Less than operator|
|!=, <>|Not equal operator|
|IN()|Check whether a value is within a set of values.|
|LIKE|Simple pattern matching|
|NOT BETWEEN ... AND ...|Check whether a value is not within a range of values|
|NOT IN()|Check whether a value is not within a set of values|
|NOT LIKE|Negation of simple pattern matching|
|IS NOT NULL|NOT NULL value test|
|IS NULL|NULL value test|

## 控制流程函数

| Name | Description |
| --- | --- |
|CASE|Case operator|
|IF()|If construct, only three parameters are supported|
|IFNULL()|Null if construct|

## 逻辑操作符

| Name | Description |
| --- | --- |
|AND, &&|Logical AND|
|NOT, !|Negates value|
|||, OR|Logical OR|
|XOR|Logical XOR|

## 数学函数

| Name | Description |
| --- | --- |
|ABS()|Return the absolute value.|
|ACOS()|Return the arc cosine.|
|ASIN()|Return the arc sine.|
|ATAN()|Return the arc tangent.|
|CEIL()|Return the smallest integer value not less than the argument. The function is not applied to BIGINT values. The input value is returned. CEIL() is a synonym for CEILING().|
|CEILING()|Return the smallest integer value not less than the argument. The function is not applied to BIGINT values. The input value is returned. CEILING() is a synonym for CEIL().|
|COS()|Return the cosine.|
|COT()|Return the cotangent.|
|DEGREES()|Convert radians to degrees.|
|EXP()|Raise to the power of.|
|FLOOR()|Return the largest integer value not greater than the argument. The function is not applied to BIGINT values. The input value is returned.|
|LN()|Return the natural logarithm of the argument.|
|LOG()|Return the natural logarithm of the first argument, only two parameters are supported.|
|LOG10()|Return the base-10 logarithm of the argument.|
|LOG2()|Return the base-2 logarithm of the argument.|
|POW()|Return the argument raised to the specified power.|
|RADIANS|Return argument converted to radians.|
|RAND()|Return a random floating-point value.|
|ROUND()|Round the argument.|
|SIGN()|Return the sign of the argument.|
|SIN()|Return the sine of the argument.|
|SQRT()|Return the square root of the argument.|
|TAN()|Return the tangent of the argument.|
|TRUNCATE()|Truncate to specified number of decimal places.only one parameter is supported.|

## 字符串函数与操作符

| Name | Description |
| --- | --- |
|ASCII()|Return numeric value of left-most character|
|BIT_LENGTH()|Return length of argument in bits|
|CHAR_LENGTH()|Return number of characters in argument|
|CHR()|Returns the character corresponding to the ASCII code|
|CONCAT()|Return concatenated string|
|CONCAT_WS()|Return concatenated with separator|
|INSTR()|Return the index of the first occurrence of substring, Oracle sql_mode is not supported|
|LEFT()|Return the leftmost number of characters as specified|
|LENGTH()|Return the length of a string in bytes|
|LOCATE()|Return the position of the first occurrence of substring, only two parameters are supported|
|LOWER()|Return the argument in lowercase|
|LPAD()|Return the string argument, left-padded with the specified string, Oracle sql_mode is not supported|
|LTRIM()|Remove leading spaces, only one parameter is supported, Oracle sql_mode is not supported|
|NCHR()|Return a character that is binary equivalent to the specified digit in the national character set|
|REPEAT()|Repeat a string the specified number of times|
|REPLACE()|Replace occurrences of a specified string, Oracle sql_mode is not supported|
|REVERSE()|Reverse the characters in a string|
|RIGHT()|Return the specified rightmost number of characters|
|RPAD()|Append string the specified number of times, Oracle sql_mode is not supported|
|RTRIM()|Remove trailing spaces, only one parameter is supported, Oracle sql_mode is not supported|
|SUBSTR()|Return the substring as specified, Oracle sql_mode is not supported|
|TRANSLATE()|Replace the characters in a string with the specified characters|
|TRIM()|Remove leading and trailing spaces, only one parameter is supported, Oracle sql_mode is not supported|
|UPPER()|Convert to uppercase|

## 日期和时间函数

| Name | Description |
| --- | --- |
|ADDTIME()|Add time|
|CONVERT_TZ()|Convert from one time zone to another|
|CURDATE()|Return the current date|
|CURRENT_DATE(), CURRENT_DATE|Synonyms for CURDATE()|
|CURRENT_TIME(), CURRENT_TIME|Synonyms for CURTIME()|
|CURTIME()|Return the current time|
|DATE()|Extract the date part of a date or datetime expression|
|DATE_ADD()|Add time values (intervals) to a date value|
|DATE_FORMAT()|Format date as specified|
|DAY()|Synonym for DAYOFMONTH()|
|DAYNAME()|Return the name of the weekday|
|DAYOFMONTH()|Return the day of the month (0-31)|
|DAYOFWEEK()|Return the weekday index of the argument|
|DAYOFYEAR()|Return the day of the year (1-366)|
|EXTRACT|Extract part of a date|
|FROM_DAYS()|Convert a day number to a date|
|FROM_UNIXTIME()|Format Unix timestamp as a date|
|GET_FORMAT()|Return a date format string|
|HOUR()|Extract the hour|
|LAST_DAY|Return the last day of the month for the argument|
|MAKEDATE()|Create a date from the year and day of year|
|MAKETIME()|Create time from hour, minute, second|
|MICROSECOND()|Return the microseconds from argument|
|MINUTE()|Return the minute from the argument|
|MONTH()|Return the month from the date passed|
|MONTHNAME()|Return the name of the month|
|NOW()|Return the current date and time|
|PERIOD_ADD()|Add a period to a year-month|
|PERIOD_DIFF()|Return the number of months between periods|
|QUARTER()|Return the quarter from a date argument|
|SEC_TO_TIME()|Converts seconds to 'hh:mm:ss' format|
|SECOND()|Return the second (0-59)|
|STR_TO_DATE()|Convert a string to a date|
|TIME()|Extract the time portion of the expression passed|
|TIME_FORMAT()|Format as time|
|TIME_TO_SEC()|Return the argument converted to seconds|
|TIMEDIFF()|Subtract time|
|TIMESTAMP()|With a single argument, this function returns the date or datetime expression; with two arguments, the sum of the arguments|
|TIMESTAMPDIFF()|Return the difference of two datetime expressions, using the units specified|
|TO_DAYS()|Return the date argument converted to days|
|TO_SECONDS()|Return the date or datetime argument converted to seconds since Year 0|
|UTC_DATE()|Return the current UTC date|
|UTC_TIME()|Return the current UTC time|
|UTC_TIMESTAMP()|Return the current UTC date and time|
|WEEK()|Return the week number|
|YEAR()|Return the year |
|YEARWEEK()|Return the year and week |

## 窗口函数

窗口函数支持包括：

WINDOW和OVER子句与PARTITION BY、ORDER BY和WINDOW frame一起使用。

{{ PRODUCT_NAME }}支持的非聚合窗口函数。

用于窗口函数的聚合函数如下：

* AVG()
* COUNT()
* MIN()
* MAX()
* STD()
* STDDEV()
* STDDEV_POP()
* STDDEV_SAMP()
* SUM()
* VAR_POP()
* VAR_SAMP()
* VARIANCE()

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
