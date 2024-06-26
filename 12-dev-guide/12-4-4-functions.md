# 支持的函数
---
本节列举GreatSQL支持的函数，并给出样例。

本节使用 [文档约定](./12-dev-guide.md) 中提到的样例数据库
- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

## 函数分类
GreatSQL支持的函数大致可以分为以下几类：
1. 字符函数
2. 数学函数
3. 时间日期函数
4. 流程控制函数
5. 系统信息函数
6. 窗口函数

## 字符函数
GreatSQL提供了一系列字符函数，用于处理和操作字符串数据。这些函数的功能非常丰富，可以满足各种字符串处理需求。
### CONCAT()函数
用于连接两个或多个字符串。

例如：CONCAT('Hello', ' ', 'World') 将返回字符串 "Hello World"。
```sql
greatsql> SELECT CONCAT('Hello', ' ', 'World');
+-------------------------------+
| CONCAT('Hello', ' ', 'World') |
+-------------------------------+
| Hello World                   |
+-------------------------------+
1 row in set (0.00 sec)
```
### SUBSTRING()函数
用于提取字符串的子串。

例如：SUBSTRING('abcdef', 3, 2) 将返回字符串 "cd"。
```sql
greatsql> SELECT SUBSTRING('abcdef', 3, 2);
+---------------------------+
| SUBSTRING('abcdef', 3, 2) |
+---------------------------+
| cd                        |
+---------------------------+
1 row in set (0.00 sec)
```

### REPLACE()函数
用于替换字符串中的指定子串。

例如：REPLACE('This is a test', 'is', 'was') 将返回字符串 "This was a test"。
```sql
greatsql> SELECT REPLACE('This is a test', 'is', 'was');
+----------------------------------------+
| REPLACE('This is a test', 'is', 'was') |
+----------------------------------------+
| Thwas was a test                       |
+----------------------------------------+
1 row in set (0.00 sec)
```
### TRIM()函数

用于去除字符串两端的空格。

例如：TRIM(' Hello World ') 将返回字符串 "Hello World"。
```sql
greatsql> SELECT TRIM(' Hello World ');
+-----------------------+
| TRIM(' Hello World ') |
+-----------------------+
| Hello World           |
+-----------------------+
1 row in set (0.00 sec)
```
### LOWER()函数

用于将字符串转换为小写。

例如：LOWER('HELLO WORLD') 将返回字符串 "hello world"。
```sql
greatsql> SELECT LOWER('HELLO WORLD');
+----------------------+
| LOWER('HELLO WORLD') |
+----------------------+
| hello world          |
+----------------------+
1 row in set (0.00 sec)
```

### UPPER()函数

用于将字符串转换为大写。

例如：UPPER('hello world') 将返回字符串 "HELLO WORLD"。
```sql
greatsql> SELECT UPPER('hello world');
+----------------------+
| UPPER('hello world') |
+----------------------+
| HELLO WORLD          |
+----------------------+
1 row in set (0.00 sec)
```
### LEFT()函数

用于提取字符串左侧的指定数量字符。

例如：LEFT('abcdef', 3) 将返回字符串 "abc"。
```sql
greatsql> SELECT LEFT('abcdef', 3);
+-------------------+
| LEFT('abcdef', 3) |
+-------------------+
| abc               |
+-------------------+
1 row in set (0.00 sec)
```
### RIGHT()函数

用于提取字符串右侧的指定数量字符。

例如：RIGHT('abcdef', 3) 将返回字符串 "def"。

```sql
greatsql> SELECT RIGHT('abcdef', 3);
+--------------------+
| RIGHT('abcdef', 3) |
+--------------------+
| def                |
+--------------------+
1 row in set (0.00 sec)
```
### LPAD()函数

用于在字符串左侧填充指定数量的字符。

例如：LPAD('Hello', 10, '#') 将返回字符串 "####Hello"。

```sql
greatsql> SELECT LPAD('Hello', 10, '#');
+------------------------+
| LPAD('Hello', 10, '#') |
+------------------------+
| #####Hello             |
+------------------------+
1 row in set (0.00 sec)
```

### RPAD()函数

用于在字符串右侧填充指定数量的字符。

例如：RPAD('Hello', 10, '#') 将返回字符串 "Hello####"。
```sql
greatsql> SELECT RPAD('Hello', 10, '#');
+------------------------+
| RPAD('Hello', 10, '#') |
+------------------------+
| Hello#####             |
+------------------------+
1 row in set (0.00 sec)
```
### LOCATE()函数
用于查找子串在字符串中第一次出现的位置。

例如：LOCATE('World', 'Hello World') 将返回 7
```sql
greatsql> SELECT LOCATE('World', 'Hello World');
+--------------------------------+
| LOCATE('World', 'Hello World') |
+--------------------------------+
|                              7 |
+--------------------------------+
1 row in set (0.00 sec)
```
### INSTR()函数

与`LOCATE()`函数类似。

例如，以下查询将查找字符串 "Hello World" 中 "world" 的第一次出现位置：
```sql
greatsql> SELECT INSTR('Hello World', 'World');
+-------------------------------+
| INSTR('Hello World', 'World') |
+-------------------------------+
|                             7 |
+-------------------------------+
1 row in set (0.00 sec)
```
### LENGTH()函数
用于获取字符串的实际字节数。

例如：LENGTH('Hello World') 将返回 11
```sql
greatsql> SELECT LENGTH('Hello World');
+-----------------------+
| LENGTH('Hello World') |
+-----------------------+
|                    11 |
+-----------------------+
1 row in set (0.00 sec)
```
或者例如中文"你好"在UTF-8下占3个字节，使用`LENGTH()`函数将返回6
```sql
greatsql> SELECT LENGTH('你好');
+------------------+
| LENGTH('你好')   |
+------------------+
|                6 |
+------------------+
1 row in set (0.00 sec)
```

### ISNULL()函数
用于检查表达式是否为 NULL。

例如：ISNULL(NULL) 将返回 1（表示为NULL）
```sql
greatsql> SELECT ISNULL(NULL);
+--------------+
| ISNULL(NULL) |
+--------------+
|            1 |
+--------------+
1 row in set (0.00 sec)
```
### CHAR_LENGTH()函数
`LENGTH()`函数返回的是字节数，返回字符串的字符数，而不考虑实际字节数。它计算的是字符串中的实际字符数，不受多字节字符编码的影响。

例如：CHAR_LENGTH('你好') 将返回 2，而不是 6（UTF-8编码下每个中文字符占3个字节）。
```sql
greatsql> SELECT CHAR_LENGTH('你好');
+-----------------------+
| CHAR_LENGTH('你好')   |
+-----------------------+
|                     2 |
+-----------------------+
1 row in set (0.00 sec)
```
### ASCII()函数
用于获取字符的ASCII码值。

例如：ASCII('A') 将返回 65
```sql
greatsql> SELECT ASCII('A');
+------------+
| ASCII('A') |
+------------+
|         65 |
+------------+
1 row in set (0.00 sec)
```
### CONV()函数
用于将字符串转换为指定进制的数字。

格式为：CONV(string, from_base, to_base)
- 参数string表示字符串
- 参数from_base表示字符串的进制，取值范围为2~36
- 参数to_base表示转换后的进制，取值范围为2~36

例如：CONV('123', 10, 16) 把123从10进制转换为16进制，将返回字符串 "7B"
```sql
greatsql> SELECT CONV('123', 10, 16);
+---------------------+
| CONV('123', 10, 16) |
+---------------------+
| 7B                  |
+---------------------+
1 row in set (0.00 sec)
```

### REVERSE()函数
用于反转字符串。

例如：REVERSE('Hello World') 将返回字符串 "dlroW olleH"
```sql
greatsql> SELECT REVERSE('Hello World');
+------------------------+
| REVERSE('Hello World') |
+------------------------+
| dlroW olleH            |
+------------------------+
1 row in set (0.00 sec)
```

## 数学函数
GreatSQL中的数学函数是指用于执行数学运算的函数。这些函数可以用于各种目的，例如计算列的值、比较值或从结果集中提取数据。

### ROUND()函数
四舍五入函数，用于将数字四舍五入到指定的小数位数。
- 正数正常四舍五入
- 负数先去掉符号后，四舍五入完成后再加上符号

格式如下：
```sql
ROUND(number, decimals)
```
- number：表示要四舍五入的数字
- decimals：表示要四舍五入的小数位数

例如：ROUND(1.598588,3) 返回1.599;
```sql
greatsql> SELECT ROUND(1.598588,3);
+-------------------+
| ROUND(1.598588,3) |
+-------------------+
|             1.599 |
+-------------------+
1 row in set (0.00 sec)
```
若为负数 ROUND(-1.595658,3) 返回-1.599
```sql
greatsql> SELECT ROUND(-1.598588,3);
+--------------------+
| ROUND(-1.598588,3) |
+--------------------+
|             -1.599 |
+--------------------+
1 row in set (0.00 sec)
```
### CEIL()函数
向上取整函数，用于将数字向上取整到下一个整数。

例如：CEIL(1.598588) 返回2;
```sql
greatsql> SELECT CEIL(1.598588);
+----------------+
| CEIL(1.598588) |
+----------------+
|              2 |
+----------------+
1 row in set (0.00 sec)
```
### AVG()函数
用于计算列的平均值。

例如：AVG(column_name) 返回列的平均值，以city表中的Population列为例。
```sql
greateql> SELECT AVG(Population) FROM city;
+-----------------+
| AVG(Population) |
+-----------------+
|     350383.9583 |
+-----------------+
1 row in set (0.00 sec)
```
### SUM()函数
用于计算列的总和。

例如：SUM(column_name) 返回列的总和，以city表中的Population列为例。
```sql
greatsql> SELECT SUM(Population) FROM city;
+-----------------+
| SUM(Population) |
+-----------------+
|      1429566550 |
+-----------------+
1 row in set (0.01 sec)
```
### TRUNCATE()函数
用于截断数字，返回截断后的值。

格式为：TRUNCATE(number,decimals)
- number：表示要截断的数字
- decimals：表示要截断的小数位数

例如：TRUNCATE(1.598588,3) 返回1.598;
```sql
greatsql> SELECT TRUNCATE(1.598588,3);
+----------------------+
| TRUNCATE(1.598588,3) |
+----------------------+
|                1.598 |
+----------------------+
1 row in set (0.00 sec)
```

### MOD()函数
用于计算两个数字的余数。

格式为：MOD(number1, number2)
- number1：表示被除数
- number2：表示除数

例如：MOD(10,3) 返回1;
```sql
greatsql> SELECT MOD(10,3);
+-----------+
| MOD(10,3) |
+-----------+
|         1 |
+-----------+
1 row in set (0.00 sec)
```

### POW()函数
用于计算指数函数。

格式为：POW(number, power)
- number：表示底数
- power：表示幂

例如：POW(2,3) 返回8;
```sql
greatsql> SELECT POW(2,3);
+----------+
| POW(2,3) |
+----------+
|        8 |
+----------+
1 row in set (0.01 sec)
```
## 时间日期函数
GreatSQL中的时间日期函数是指用于处理和操作时间日期值 的函数。这些函数可以用于各种目的，例如获取当前日期和时间、格式化日期时间值、计算日期时间差值等。

### NOW()函数
用于获取当前日期和时间。

例如：NOW() 返回当前日期和时间。
```sql
greateql> SELECT NOW();
+---------------------+
| NOW()               |
+---------------------+
| 2024-05-14 17:29:46 |
+---------------------+
1 row in set (0.01 sec)
```
### CURDATE()函数
用于获取当前日期。

例如：CURDATE() 返回当前日期。
```sql
greatsql> SELECT CURDATE();
+------------+
| CURDATE()  |
+------------+
| 2024-05-14 |
+------------+
1 row in set (0.00 sec)
```
### CURTIME()函数
用于获取当前时间。

例如：CURTIME() 返回当前时间。
```sql
greatsql> SELECT CURTIME();
+-----------+
| CURTIME() |
+-----------+
| 17:30:36  |
+-----------+
1 row in set (0.00 sec)
```

### 日期获取
**YEAR()函数获取年份**
```sql
greateql> SELECT YEAR(NOW());
+-------------+
| YEAR(NOW()) |
+-------------+
|        2024 |
+-------------+
1 row in set (0.00 sec)
```
**MONDAY()函数获取月份**
```sql
greatsql> SELECT MONTH(NOW());
+--------------+
| MONTH(NOW()) |
+--------------+
|            5 |
+--------------+
1 row in set (0.00 sec)
```

**DAY()函数获取日期**
```sql
greateql> SELECT DAY(NOW());
greatsql> SELECT DAY(NOW());
+------------+
| DAY(NOW()) |
+------------+
|         14 |
+------------+
1 row in set (0.00 sec)
```

**HOUR()函数获取小时**
```sql
greatsql> SELECT HOUR(NOW());
+-------------+
| HOUR(NOW()) |
+-------------+
|          17 |
+-------------+
1 row in set (0.00 sec)
```
**MINTUE()函数获取分钟**
```sql
greateql> SELECT MINUTE(NOW());
+---------------+
| MINUTE(NOW()) |
+---------------+
|            34 |
+---------------+
1 row in set (0.00 sec)
```
**SECOND()函数获取秒**
```sql
greateql> SELECT SECOND(NOW());
+---------------+
| SECOND(NOW()) |
+---------------+
|            17 |
+---------------+
1 row in set (0.01 sec)
```

### WEEKOFYEAR()函数
用于获取当前日期是一年中的第几周。

例如：WEEKOFYEAR(NOW()) 返回当前日期是一年中的第几周。
```sql
greatsql> SELECT WEEKOFYEAR(NOW());
+-------------------+
| WEEKOFYEAR(NOW()) |
+-------------------+
|                20 |
+-------------------+
1 row in set (0.01 sec)
```

### QUARTER()函数
用于获取当前日期是一年中的第几季度。

例如：QUARTER(NOW()) 返回当前日期是一年中的第几季度。
```sql
greatsql> SELECT QUARTER(NOW());
+----------------+
| QUARTER(NOW()) |
+----------------+
|              2 |
+----------------+
1 row in set (0.00 sec)
```
### STR_TO_DATE()函数
用于将字符串转换为日期。

例如：STR_TO_DATE('2019-05-14','%Y-%m-%d') 返回日期。
```sql
greatsql> SELECT STR_TO_DATE('2024-05-14','%Y-%m-%d');
+--------------------------------------+
| STR_TO_DATE('2024-05-14','%Y-%m-%d') |
+--------------------------------------+
| 2024-05-14                           |
+--------------------------------------+
1 row in set (0.00 sec)
```
### DATE_FORMAT()函数
用于将日期格式化为字符串。

例如：DATE_FORMAT(NOW(),'%Y-%m-%d') 返回日期。
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
### LAST_DAY()函数
用于获取指定日期所在月份的最后一天。

例如：LAST_DAY('2019-05-14') 返回指定日期所在月份的最后一天。
```sql
greatsql> SELECT LAST_DAY('2019-05-14');
+------------------------+
| LAST_DAY('2019-05-14') |
+------------------------+
| 2019-05-31             |
+------------------------+
1 row in set (0.00 sec)
```
### DATEDIFF()函数
作用是计算两个日期之间的差值。

例如：DATEDIFF('2019-05-14','2024-05-14') 
```sql
greatsql> SELECT DATEDIFF('2019-05-14','2024-05-14');
+-------------------------------------+
| DATEDIFF('2019-05-14','2024-05-14') |
+-------------------------------------+
|                               -1827 |
+-------------------------------------+
1 row in set (0.00 sec)
```

## 流程控制函数
GreatSQL中的流程控制函数允许根据不同的条件执行不同的处理流程，从而实现在 SQL 语句中的条件选择

### IF()函数
作用是如果条件成立，则返回结果为真，否则返回结果为假。

格式为：IF(条件,结果1,结果2)，若条件成立返回结果1，否则返回结果2。

例如：IF(1=2,100,200) 返回结果为200。
```sql
greatsql> SELECT IF(1=2,100,200);
+-----------------+
| IF(1=2,100,200) |
+-----------------+
|             200 |
+-----------------+
1 row in set (0.00 sec)
```

### IFNULL()函数
作用是如果第一个参数为空，则返回第二个参数的值，否则返回第一个参数的值。

格式为：IFNULL(参数1,参数2)，若第一个参数为空，则返回第二个参数的值，否则返回第一个参数的值。

例如：IFNULL(10,20) 返回结果为10。
```sql
greatsql> SELECT IFNULL(10,20);
+---------------+
| IFNULL(10,20) |
+---------------+
|            10 |
+---------------+
1 row in set (0.00 sec)
```
例如：IFNULL(NULL,20) 返回结果为20。
```sql
greatsql> SELECT IFNULL(NULL,20);
+-----------------+
| IFNULL(NULL,20) |
+-----------------+
|              20 |
+-----------------+
1 row in set (0.00 sec)
```
### CASE函数
作用是根据条件判断结果，返回不同的值。

格式为：CASE WHEN 条件1 THEN 结果1 ELSEIF 条件2 THEN 结果2 ... ELSE 结果n END。

例如：CASE WHEN 1=2 THEN '条件成立' ELSE '条件不成立' END。
```sql
greatsql> SELECT CASE WHEN 1=2 THEN '条件成立' ELSE '条件不成立' END;
+------------------------------------------------------------+
| CASE WHEN 1=2 THEN '条件成立' ELSE '条件不成立' END          |
+------------------------------------------------------------+
| 条件不成立                                                  |
+------------------------------------------------------------+
1 row in set (0.40 sec)
```
例如：city表中，Population字段为城市人口，如果Population大于10000000，则返回'人口超过1亿'，如果Population大于50000000，则返回'人口超过5千万'，否则返回'人口超过5千万'。
```sql
greatsql> SELECT city.Name, Population, 
CASE WHEN Population>10000000 THEN '人口超过1亿' 
WHEN Population>50000000 THEN '人口超过5千万' 
ELSE '人口超过5千万' END AS '城市人口' 
FROM city
LIMIT 5;

+----------------+------------+---------------------+
| Name           | Population | 城市人口            |
+----------------+------------+---------------------+
| Kabul          |    1780000 | 人口超过5千万       |
| Qandahar       |     237500 | 人口超过5千万       |
| Herat          |     186800 | 人口超过5千万       |
| Mazar-e-Sharif |     127800 | 人口超过5千万       |
| Amsterdam      |     731200 | 人口超过5千万       |
+----------------+------------+---------------------+
5 rows in set (0.00 sec)
```

## 系统信息函数
### VERSION()函数
用于获取当前数据库版本。

例如：VERSION() 返回当前数据库版本。
```sql
greatsql> SELECT VERSION();
+-----------+
| VERSION() |
+-----------+
| 8.0.32-25 |
+-----------+
1 row in set (0.00 sec)
```
### DATABASE()函数
用于获取当前数据库名称。

例如：DATABASE() 返回当前数据库名称。
```sql
greatsql> SELECT DATABASE();
+------------+
| DATABASE() |
+------------+
| world      |
+------------+
1 row in set (0.00 sec)
```

### SCHEMA()函数
用于获取当前数据库名称。

例如：SCHEMA() 返回当前数据库名称。
```sql
greatsql> SELECT SCHEMA();
+----------+
| SCHEMA() |
+----------+
| world    |
+----------+
1 row in set (0.00 sec)
```
### USER()函数
用于获取当前用户。

例如：USER() 返回当前用户。
```sql
greatsql> SELECT USER();
+----------------+
| USER()         |
+----------------+
| root@localhost |
+----------------+
1 row in set (0.00 sec)
```
### CHARSET()函数
用于获取当前字符串使用的字符集。

例如：CHARSET('你好') 返回当前字符集。
```sql
greatsql> SELECT CHARSET('你好');
+-------------------+
| CHARSET('你好')   |
+-------------------+
| utf8mb4           |
+-------------------+
1 row in set (0.00 sec)
```
### COLLATION()函数
用于获取当前字符串使用的字符集校验规则。

例如：COLLATION('你好') 返回当前字符集校验规则。
```sql
greatsql> SELECT COLLATION('你好');
+---------------------+
| COLLATION('你好')   |
+---------------------+
| utf8mb4_0900_ai_ci  |
+---------------------+
1 row in set (0.01 sec)
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
