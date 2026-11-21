# Single-Table Query
---

This section describes how to query data in the GreatSQL database with the SELECT statement.

This section uses the sample databases mentioned in [Documentation Conventions](./12-dev-guide.md):
- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

## Basic SELECT Statement
The most basic SELECT statement is as follows:
```sql
greatsql> SELECT 1; 
+---+
| 1 |
+---+
| 1 |
+---+
1 row in set (0.00 sec)

-- Mathematical operations are supported
greatsql> SELECT 9/2;
+--------+
| 9/2    |
+--------+
| 4.5000 |
+--------+
1 row in set (0.00 sec)
```
## SELECT … FROM Statement
The syntax is as follows:
```sql
SELECT   specifies which columns to select
FROM     specifies which table to select from
```
- Selecting all columns:

For example, query all data from the `city` table in the `world` database:
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
......results omitted below
4079 rows in set (0.00 sec)
```
In general, avoid overusing the wildcard `*` unless you really need all column data of a table. Apart from fetching all columns when necessary, using the wildcard not only retrieves unnecessary column data, but may also slow down the query and the application performance.

- Selecting specified columns

For example, query the `ID` and `Name` columns of the `city` table in the `world` database:
```sql
greatsql> SELECT ID, Name FROM world.city;
+------+------------------------------------+
| ID   | Name                               |
+------+------------------------------------+
|    1 | Kabul                              |
|    2 | Qandahar                           |
|    3 | Herat                              |
......results omitted below
4079 rows in set (0.01 sec)
```
In GreatSQL, column names and table names can be enclosed in backticks ("`") to avoid conflicts with keywords.

## Conditional Query
The syntax is as follows:
```sql
SELECT col1, col2, ...
  FROM table_name
  WHERE condition;
```
The `WHERE` clause filters out the rows that do not meet the condition.

For example, query the rows of the `city` table in the `world` database that satisfy `Name = "Kabul"`:
```sql
greatsql> SELECT * FROM world.city WHERE Name = "Kabul";
+----+-------+-------------+----------+------------+
| ID | Name  | CountryCode | District | Population |
+----+-------+-------------+----------+------------+
|  1 | Kabul | AFG         | Kabol    |    1780000 |
+----+-------+-------------+----------+------------+
1 row in set (0.00 sec)
```
## Duplicate Removal
Use the `DISTINCT` keyword in the `SELECT` statement to remove duplicate rows.

For example, query the `CountryCode` column of the `city` table in the `world` database:
```sql
greatsql> SELECT CountryCode FROM city;
+-------------+
| CountryCode |
+-------------+
| ABW         |
| AFG         |
| AFG         |
......results omitted below
4079 rows in set (0.01 sec)
```
The query returns 4079 rows, but the `CountryCode` column contains duplicate values.

Use `DISTINCT` to remove duplicate rows:
```sql
greatsql> SELECT DISTINCT CountryCode FROM city;
+-------------+
| CountryCode |
+-------------+
| ABW         |
| AFG         |
| AGO         |
......results omitted below
232 rows in set (0.00 sec)
```
After duplicate removal, only 232 rows are returned.

## Alias Query
You can use the `AS` keyword to set an alias for the query result.

For example, query the `CountryCode` column of the `city` table in the `world` database and set the alias `c`:
```sql
greatsql> SELECT CountryCode AS c FROM city;
+-----+
| c   |
+-----+
| ABW |
| AFG |
| AFG |
......results omitted below
4079 rows in set (0.01 sec)
```

## Sorting Query
Use the `ORDER BY` keyword in the `SELECT` statement to sort the query result.
- ASC (ascend): ascending order, which is the default
- DESC (descend): descending order

For example, query the data of the `city` table in the `world` database and sort it by the `Population` column in ascending order:
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
......results omitted below
```
For example, query the data of the `city` table in the `world` database and sort it by the `Population` column in descending order:
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
......results omitted below
```
You can also sort one column in ascending order and another column in descending order at the same time.

For example, query the data of the `city` table in the `world` database, sort it by the `CountryCode` column in ascending order, and then by the `Population` column in descending order:

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
......results omitted below
```

## Pagination Query
Pagination means displaying the result set of the database segment by segment according to the required conditions.

LIMIT syntax:
```sql
SELECT * FROM table_name LIMIT [offset,] rows;
```
- offset: the starting row number, starting from 0
- rows: the number of rows to display

For example, query the data of the `city` table in the `world` database and display 5 rows starting from the first row:
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
For example, query the data of the `city` table in the `world` database and display 5 rows starting from the 10th row:
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
## Aggregate Function Query
Aggregate functions perform statistics, calculations, and other operations on the data in a table.
Common aggregate functions:
- COUNT: counts the number of rows
- SUM: calculates the sum
- AVG: calculates the average value
- MAX: returns the maximum value
- MIN: returns the minimum value

For example, query the data of the `city` table in the `world` database and count the number of rows:
```sql
greatsql> SELECT COUNT(*) FROM city;
+----------+
| COUNT(*) |
+----------+
|     4079 |
+----------+
1 row in set (0.00 sec)
```
For example, query the data of the `city` table in the `world` database and calculate the sum:
```sql
greatsql> SELECT SUM(`Population`) FROM city;
+-------------------+
| SUM(`Population`) |
+-------------------+
|        1429559884 |
+-------------------+
1 row in set (0.02 sec)
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
