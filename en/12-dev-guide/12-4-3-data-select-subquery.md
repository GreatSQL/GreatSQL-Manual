# Subqueries
---

This section describes how to use subqueries in GreatSQL.

A subquery is a query nested inside another query.

This section uses the sample databases mentioned in [Documentation Conventions](./12-dev-guide.md):
- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

## Case Study

For example, in the `city` table of the `world` database, you want to find the cities whose population is larger than that of *Shanghai*. The query steps are as follows:

1. Query the population of *Shanghai*.

2. Find the cities in the `city` table whose population is larger than that of *Shanghai*.

**Approach 1**

First, query the population of the city *Shanghai* (`city = 'Shanghai'`):
```sql
greatsql> SELECT population FROM city WHERE name = 'Shanghai';
+------------+
| population |
+------------+
|    9696300 |
+------------+
1 row in set (0.01 sec)
```

The query result shows that the population of *Shanghai* is *9696300*. Next, query the cities whose population is larger than that of *Shanghai*:
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
This gives the required result, but the query is not efficient, because you have to query the population of *Shanghai* first and then query the cities whose population is larger.

**Approach 2**

Use the multi-table join query introduced in the previous chapter to merge the two queries into one. If you are not familiar with join queries, see [Multi-Table Join Query](./12-4-2-data-select-multi-table.md).

An example of a self-join query is as follows:
```sql
greatsql> SELECT c2.name FROM city c1,city c2 WHERE
  c1.name = 'Shanghai' AND c1.`population` < c2.`population`;
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.00 sec)
```

**Approach 3**

Use a subquery that takes the population of Shanghai as a subquery, and query the `city` table for the cities whose population is larger than that of this city:
```sql
greatsql> SELECT name FROM city WHERE population >
  (SELECT population FROM city WHERE name = 'Shanghai');
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.00 sec)
```

## Classification of Subqueries
Depending on whether the inner query returns one row or multiple rows, subqueries are classified into **single-row subqueries** and **multi-row subqueries**.

## Single-Row Subqueries
A single-row subquery returns only a single value (or a result of one row and one column). This value can be used in comparison operations (such as equal to, greater than, and so on), and can also be part of an expression. Because it returns only one value, it can be used directly in clauses such as `SELECT`, `WHERE`, and `HAVING` without special handling.

### Comparison Operators for Single-Row Subqueries

| Operator |           Meaning            |
| :------: | :--------------------------: |
|    =     |           equal to           |
|    >     |         greater than         |
|    >=    | greater than or equal to     |
|    <     |          less than           |
|    <=    |  less than or equal to       |
|    <>    |         not equal to         |

### Syntax of Single-Row Subqueries

The syntax of a single-row subquery is as follows:
```sql
SELECT ... FROM table WHERE column = (subquery)
```

For example, query the `city` table for the cities whose population is larger than that of this city:
```sql
greatsql> SELECT name FROM city WHERE population >
  (SELECT population FROM city WHERE name = 'Shanghai');
+-----------------+
| name            |
+-----------------+
| São Paulo       |
| Mumbai (Bombay) |
| Seoul           |
+-----------------+
3 rows in set (0.00 sec)
```

## Multi-Row Subqueries

A multi-row subquery returns a multi-row result. These results are usually compared with the rows of the outer query to determine whether they meet a certain condition. Because the result contains multiple rows, it cannot be used directly in equality or comparison operations; instead, operators such as `IN`, `ANY`, and `ALL` are required.

For example, using the city table and the country table, find all cities whose country is China and display only the first 5 records:
```sql
greatsql> SELECT name FROM city WHERE countrycode IN
  (SELECT code FROM country WHERE name = 'China')LIMIT 5;
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
### Comparison Operators for Multi-Row Subqueries

| Operator | Meaning                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ |
| IN       | equal to **any one** value in the list                                                                 |
| ANY      | must be used together with a single-row comparison operator; compares with **a certain** value returned by the subquery |
| ALL      | must be used together with a single-row comparison operator; compares with **all** values returned by the subquery |
| SOME     | actually an alias of ANY with the same effect; ANY is generally preferred                             |

### Syntax of Multi-Row Subqueries
The syntax of a multi-row subquery is as follows:
```sql
SELECT ... FROM table WHERE column IN (subquery)
```
To query all cities of the countries that have an official language and display only the first 5 records, here is an example SQL query:

```sql
SELECT c.name AS city_name, co.name AS country_name  
FROM city c  
JOIN country co ON c.countrycode = co.code  
WHERE co.code IN (  
    SELECT countrycode  
    FROM countrylanguage  
    WHERE IsOfficial = 'T'  
) LIMIT 5;
```

::: details View the execution result
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
:::

Analysis

1. The subquery `SELECT countrycode FROM countrylanguage WHERE IsOfficial = TRUE` first selects the country IDs of all official languages from the countrylanguage table.

2. The outer query joins the city and country tables with `JOIN`, and uses the `WHERE` clause to filter out the countries whose IDs are in the subquery result.

3. Finally, the query returns the names of all cities in these countries together with the corresponding country names.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
