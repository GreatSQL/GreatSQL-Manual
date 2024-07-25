# 单表查询
---

本节介绍如何使用 SELECT 命令来对GreatSQL数据库中的数据进行查询。

本节将使用 [文档约定](./12-dev-guide.md) 中提到的样例数据库
- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

## 基本的SELECT语句
最基本的SELECT语句如下：
```sql
greatsql> SELECT 1; 
+---+
| 1 |
+---+
| 1 |
+---+
1 row in set (0.00 sec)

-- 可以做数学运算
greatsql> SELECT 9/2;
+--------+
| 9/2    |
+--------+
| 4.5000 |
+--------+
1 row in set (0.00 sec)
```
## SELECT … FROM语句
语法如下：
```sql
SELECT   标识选择哪些列
FROM     标识从哪个表中选择
```
- 选择全部列：

例如查询 `world` 库中 `city` 表的所有数据
```sql
greatsql> SELECT * FROM world.city;
+------+------------------------------------+-------------+------------------------+------------+
| ID   | Name                               | CountryCode | District               | Population |
+------+------------------------------------+-------------+------------------------+------------+
|    1 | Kabul                              | AFG         | Kabol                  |    1780000 |
|    2 | Qandahar                           | AFG         | Qandahar               |     237500 |
|    3 | Herat                              | AFG         | Herat                  |     186800 |
|    4 | Mazar-e-Sharif                     | AFG         | Balkh                  |     127800 |
|    5 | Amsterdam                          | NLD         | Noord-Holland          |     731200 |
......下面结果省略
4079 rows in set (0.00 sec)
```
一般情况下，除非需要使用表中所有的字段数据，避免滥用通配符`*`。除非必要获取所有字段数据，否则使用通配符不仅会导致不必要的列数据检索，还可能拖慢查询速度和应用程序性能。

- 选择指定的列

例如查询 `world` 库中 `city` 表的 `ID` 和 `Name` 列
```sql
greatsql> SELECT ID, Name FROM world.city;
+------+------------------------------------+
| ID   | Name                               |
+------+------------------------------------+
|    1 | Kabul                              |
|    2 | Qandahar                           |
|    3 | Herat                              |
......下面结果省略
4079 rows in set (0.01 sec)
```
在GreatSQL中，列名和表名都可以使用反引号 "`" 包裹，避免与关键字冲突。

## 条件查询
语法如下：
```sql
SELECT col1, col2, ...
FROM table_name
WHERE condition;
```
使用 `WHERE` 子句，将不满足条件的行过滤掉。

例如查询 `world` 库中 `city` 表的数据，满足 `Name = "Kabul"` 的行
```sql
greatsql> SELECT * FROM world.city WHERE Name = "Kabul";
+----+-------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |
+----+-------+-------------+----------+------------+
|  1 | Kabul | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+
1 row in set (0.00 sec)
```
## 去重查询
在 `SELECT` 语句中使用关键字 `DISTINCT` 去除重复行。

例如查询 `world` 库中 `city` 表的 `CountryCode` 列有
```sql
greatsql> SELECT CountryCode FROM city;
+-------------+
| CountryCode |
+-------------+
| ABW         |
| AFG         |
| AFG         |
......下面结果省略
4079 rows in set (0.01 sec)
```
查询出来了有4079行，但是 `CountryCode` 列有重复数据

使用 `DISTINCT` 去除重复行
```sql
greatsql> SELECT DISTINCT CountryCode FROM city;
+-------------+
| CountryCode |
+-------------+
| ABW         |
| AFG         |
| AGO         |
......下面结果省略
232 rows in set (0.00 sec)
```
去重后查询出来只有232行

## 别名查询
可以使用关键字`AS`给查询结果设置别名

例如查询 `world` 库中 `city` 表的 `CountryCode` 列数据，设置别名 `c`
```sql
greatsql> SELECT CountryCode AS c FROM city;
+-----+
| c   |
+-----+
| ABW |
| AFG |
| AFG |
......下面结果省略
4079 rows in set (0.01 sec)
```

## 排序查询
在 `SELECT` 语句中使用关键字 `ORDER BY` 对查询结果进行排序
- ASC（ascend）: 升序，默认升序
- DESC（descend）:降序

例如查询 `world` 库中 `city` 表的数据，按照 `Population` 列升序排列
```sql
greatsql> SELECT * FROM city ORDER BY `Population`;
+------+---------------------+-------------+-------------+------------+
| ID   | Name                | CountryCode | District    | Population |
+------+---------------------+-------------+-------------+------------+
| 2912 | Adamstown           | PCN         | –           |         42 |
| 2317 | West Island         | CCK         | West Island |        167 |
| 3333 | Fakaofo             | TKL         | Fakaofo     |        300 |
| 3538 | Città del Vaticano  | VAT         | –           |        455 |
| 2316 | Bantam              | CCK         | Home Island |        503 |
......下面结果省略
```
例如查询 `world` 库中 `city` 表的数据，按照 `Population` 列降序排列。
```sql
greatsql> SELECT * FROM city ORDER BY `Population` DESC;
+------+-------------------+-------------+------------------+------------+
| ID   | Name              | CountryCode | District         | Population |
+------+-------------------+-------------+------------------+------------+
| 1024 | Mumbai (Bombay)   | IND         | Maharashtra      |   10500000 |
| 2331 | Seoul             | KOR         | Seoul            |    9981619 |
|  206 | São Paulo         | BRA         | São Paulo        |    9968485 |
| 1890 | Shanghai          | CHN         | Shanghai         |    9696300 |
|  939 | Jakarta           | IDN         | Jakarta Raya     |    9604900 |
......下面结果省略
```
同时也可以分别对两列一个进行升序一个进行降序排序
例如查询 `world` 库中 `city` 表的数据，按照 `CountryCode` 列升序排列，再按照 `Population
列降序排列
```sql
greatsql> SELECT * FROM city ORDER BY `CountryCode` ASC,`Population` DESC;
+-----+----------------+-------------+----------+------------+
| ID  | Name           | CountryCode | District | Population |
+-----+----------------+-------------+----------+------------+
| 129 | Oranjestad     | ABW         | –        |      29034 |
|   1 | Kabul          | AFG         | Kabol    |    1780000 |
|   2 | Qandahar       | AFG         | Qandahar |     237500 |
|   3 | Herat          | AFG         | Herat    |     186800 |
|   4 | Mazar-e-Sharif | AFG         | Balkh    |     127800 |
......下面结果省略
```

## 分页查询
所谓分页显示，就是将数据库中的结果集，一段一段显示出来需要的条件。

LIMIT格式：
```sql
SELECT * FROM 表名 LIMIT [offset,] rows;
```
- offset: 起始行号，从0开始
- rows: 显示的行数

例如查询 `world` 库中 `city` 表的数据，从第1行开始显示5条数据
```sql
greatsql> SELECT * FROM city LIMIT 1,5;
+----+----------------+-------------+---------------+------------+
| ID | Name           | CountryCode | District      | Population |
+----+----------------+-------------+---------------+------------+
|  2 | Qandahar       | AFG         | Qandahar      |     237500 |
|  3 | Herat          | AFG         | Herat         |     186800 |
|  4 | Mazar-e-Sharif | AFG         | Balkh         |     127800 |
|  5 | Amsterdam      | NLD         | Noord-Holland |     731200 |
|  6 | Rotterdam      | NLD         | Zuid-Holland  |     593321 |
+----+----------------+-------------+---------------+------------+
5 rows in set (0.00 sec)
```
例如查询 `world` 库中 `city` 表的数据，从第10行开始显示5条数据
```sql
greatsql> SELECT * FROM city LIMIT 10,5;
+----+-----------+-------------+---------------+------------+
| ID | Name      | CountryCode | District      | Population |
+----+-----------+-------------+---------------+------------+
| 11 | Groningen | NLD         | Groningen     |     172701 |
| 12 | Breda     | NLD         | Noord-Brabant |     160398 |
| 13 | Apeldoorn | NLD         | Gelderland    |     153491 |
| 14 | Nijmegen  | NLD         | Gelderland    |     152463 |
| 15 | Enschede  | NLD         | Overijssel    |     149544 |
+----+-----------+-------------+---------------+------------+
5 rows in set (0.00 sec)
```
## 聚合函数查询
聚合函数：对表中的数据进行统计，计算等操作
常见的聚合函数：
- COUNT：统计行数
- SUM：求和
- AVG：平均值
- MAX：最大值
- MIN：最小值

例如查询 `world` 库中 `city` 表的数据，统计行数
```sql
greatsql> SELECT COUNT(*) FROM city;
+----------+
| COUNT(*) |
+----------+
|     4079 |
+----------+
1 row in set (0.00 sec)
```
例如查询 `world` 库中 `city` 表的数据，求和
```sql
greatsql> SELECT SUM(`Population`) FROM city;
+-------------------+
| SUM(`Population`) |
+-------------------+
|        1429559884 |
+-------------------+
1 row in set (0.02 sec)
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
