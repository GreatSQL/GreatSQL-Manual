# 子查询
---

本节介绍 GreatSQL 中子查询的用法。

子查询指一个查询语句嵌套在另一个查询语句内部的查询。

本章将使用 [文档约定](./12-dev-guide.md) 中提到的样例数据库
- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

## 实际案例分析
例如在world database中的city表中，想查询那个城市的的人口比Shanghai人口多。整个查询步骤如下：
1. 查询Shanghai的人口
2. 在city表找出人口比Shanghai多的城市

**方式1**

首先我们查询Shanghai的人口
```sql
greatsql> SELECT population FROM city WHERE name = 'Shanghai';
+------------+
| population |
+------------+
|    9696300 |
+------------+
1 row in set (0.01 sec)
```

Shanghai人口是9696300，接下来我们查询人口比Shanghai多城市的城市
```sql
greatsql> SELECT name FROM city WHERE population > 9696300;
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.01 sec)
```
就得出了要的结果，但这样查询效率不高，因为需要先查询Shanghai人口，再查询人口比Shanghai多城市的城市。

**方式2**

使用上一章学习过的多表查询，将两个查询合并为一个。若对连接查询不理解，请参考[多表查询](./12-4-2-data-select-multi-table.md)。

自连接查询示例如下：
```sql
greatsql> SELECT c2.name FROM city c1,city c2 WHERE c1.name = 'Shanghai' AND c1.`population` < c2.`population`;
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.00 sec)
```

**方式3**

使用子查询，将Shanghai人口作为子查询，在city表中查询人口比该城市多城市的城市
```sql
greatsql> SELECT name FROM city WHERE population > (SELECT population FROM city WHERE name = 'Shanghai');
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.00 sec)
```

## 子查询的分类
按内查询的结果返回一条还是多条记录，将子查询分为 **单行子查询** 和 **多行子查询**。

## 单行子查询
单行子查询只返回单个值（或一行一列的结果）。这个值可以用于比较操作（如等于、大于等），也可以作为表达式的一部分。由于只返回一个值，因此它可以直接在 `SELECT`、`WHERE`、`HAVING` 等子句中使用，而无需特殊的处理。

### 单行子查询比较操作符

| 操作符 |            含义            |
| :----: | :------------------------: |
|   =    |            等于            |
|   >    |            大于            |
|   >=   |         大于或等于         |
|   <    |            小于            |
|   <=   |         小于或等于         |
|   <>   |           不等于           |

### 单行子查询语法格式

单行子查询的语法格式如下：
```sql
SELECT ... FROM table WHERE column = (subquery)
```

例如在city表中查询人口比该城市多城市的城市
```sql
greatsql> SELECT name FROM city WHERE population > (SELECT population FROM city WHERE name = 'Shanghai');
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.00 sec)
```


## 多行子查询

多行子查询返回多行结果。这些结果通常用于与主查询中的行进行比较，以确定它们是否满足某个条件。由于返回的是多行结果，因此不能直接用于等于或比较操作，而需要使用如 `IN`、`ANY`、`ALL` 等操作符。

例如，使用city表，和country表，找到country为China的所有城市，并只显示前5条记录
```sql
greatesql> SELECT name FROM city WHERE countrycode IN (SELECT code FROM country WHERE name = 'China')LIMIT 5;

+-----------+
| name      |
+-----------+
| Shanghai  |
| Peking    |
| Chongqing |
| Tianjin   |
| Wuhan     |
+-----------+
5 rows in set (0.01 sec)
```
### 多行子查询比较操作符

| 操作符 | 含义                                                         |
| ------ | ------------------------------------------------------------ |
| IN     | 等于列表中的**任意一个**                                     |
| ANY    | 需要和单行比较操作符一起使用，和子查询返回的**某一个**值比较 |
| ALL    | 需要和单行比较操作符一起使用，和子查询返回的**所有**值比较   |
| SOME   | 实际上是ANY的别名，作用相同，一般常使用ANY                   |

### 多行子查询语法格式
多行子查询的语法格式如下：
```sql
SELECT ... FROM table WHERE column IN (subquery)
```
要查询那些有官方语言的国家的所有城市并只显示前5条记录，以下是一个 SQL 查询示例：

```sql
SELECT c.name AS city_name, co.name AS country_name  
FROM city c  
JOIN country co ON c.countrycode = co.code  
WHERE co.code IN (  
    SELECT countrycode  
    FROM countrylanguage  
    WHERE IsOfficial = 'T'  
)
LIMIT 5;
```
执行结果如下：
```sql
+----------------+--------------+
| city_name      | country_name |
+----------------+--------------+
| Kabul          | Afghanistan  |
| Qandahar       | Afghanistan  |
| Herat          | Afghanistan  |
| Mazar-e-Sharif | Afghanistan  |
| Amsterdam      | Netherlands  |
+----------------+--------------+
5 rows in set (0.01 sec)
```
1. 子查询 `SELECT countrycode FROM countrylanguage WHERE IsOfficial = TRUE` 首先从 countrylanguage 表中选取所有官方语言的国家ID。
2. 主查询通过 `JOIN` 关联 city 和 country 表，并通过 `WHERE` 子句筛选出那些 ID 在子查询结果中的国家。
3. 最后，查询返回这些国家的所有城市名称和对应的国家名称。



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
