# Oracle Compatibility - Function - LISTAGG()

---

## 1. Syntax

```sql
LISTAGG ( [ { ALL | DISTINCT } ] measure_expr [ , 'delimiter' ] )
[ WITHIN GROUP ( order_by_clause ) ]
[ OVER query_partition_clause ]

query_partition_clause := ( PARTITION BY column_name [,...] )
```

## 2. Definition and Usage

Parameter descriptions:

1. `measure_expr` can be a column, a constant, or an expression based on a column.
2. `delimiter`, the delimiter, can be **''**, **a string literal**, **a number**, **a floating-point number**, etc.
3. The `order_by_clause`, an ORDER BY clause, determines the order in which column values are concatenated.
4. When neither `ALL` nor `DISTINCT` is specified, it is treated as `ALL`.
5. When `OVER query_partition_clause` is absent, it is treated as an **aggregate (AGGREGATE)** function. Otherwise, it is treated as an **analytic (ANALYTIC)** function.
6. Nested use of aggregate functions is currently not supported, for example:

```sql
greatsql> SELECT listagg(sum(id))  FROM t1 GROUP BY id;
ERROR 1111 (HY000): Invalid use of group function
```

## 3. Oracle Compatibility Notes

1. The syntax of the `LISTAGG()` function in GreatSQL follows the Oracle 19c usage, with some differences from the `WITHIN GROUP` usage in Oracle 11g R2.
2. The `LISTAGG OVERFLOW` syntax is not yet supported; the `group_concat_max_len` option in GreatSQL is still used for the length limit.
3. The `delimiter` currently only supports character constants; session/global settings or expressions are not supported (**Note:** numeric constants are converted to character constants, and due to floating-point precision or formatting issues, the result may not appear as expected; therefore, it is recommended to use character constants directly).

## 4. Examples

Note: The order of results returned by GreatSQL may differ from Oracle's order due to different character sets used for sorting.

```sql
-- Create test tables and fill in test data
greatsql> CREATE TABLE plan1 (
id int PRIMARY KEY,
name VARCHAR(255)
);

greatsql> CREATE TABLE plandetail(
id INT PRIMARY KEY,
name VARCHAR(255),
state INT,
planid INT
);

greatsql> INSERT INTO plan1 VALUES(1,'计划一'), (2,'计划二'), (3,'计划三');

greatsql> INSERT INTO plandetail VALUES(1,'明细一',0,1), (2,'明细2',1,1), (3,'明细3',1,1);

greatsql> INSERT INTO plandetail VALUES(4,'明细一',0,2), (5,'明细2',0,2), (6,'明细3',1,2);

greatsql> INSERT INTO plandetail VALUES(7,'明细一',1,3), (8,'明细2',1,3), (9,'明细3',1,3);
```

**1. Testing GROUP_CONCAT() and LISTAGG() separately**

```sql
greatsql> SELECT t1.name ,GROUP_CONCAT(t2.name ORDER BY planid ASC SEPARATOR ',') FROM plan1 t1 
  LEFT JOIN plandetail t2 
  ON t1.id = t2.planid
  GROUP BY t1.name;
+-----------+---------------------------------------------------------+
| name      | GROUP_CONCAT(t2.name ORDER BY planid ASC SEPARATOR ',') |
+-----------+---------------------------------------------------------+
| 计划一    | 明细一,明细2,明细3                                      |
| 计划三    | 明细一,明细2,明细3                                      |
| 计划二    | 明细一,明细2,明细3                                      |
+-----------+---------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,',') WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1
  LEFT JOIN plandetail t2 
  ON t1.id = t2.planid 
  GROUP BY t1.name;
+-----------+-------------------------------------------------------------+
| name      | LISTAGG(t2.name,',') WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+-------------------------------------------------------------+
| 计划一    | 明细一,明细2,明细3                                          |
| 计划三    | 明细一,明细2,明细3                                          |
| 计划二    | 明细一,明细2,明细3                                          |
+-----------+-------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,'') WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1 
  LEFT JOIN plandetail t2 
  ON t1.id = t2.planid 
  GROUP BY t1.name;
+-----------+------------------------------------------------------------+
| name      | LISTAGG(t2.name,'') WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+------------------------------------------------------------+
| 计划一    | 明细一明细2明细3                                           |
| 计划三    | 明细一明细2明细3                                           |
| 计划二    | 明细一明细2明细3                                           |
+-----------+------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,':') WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1 
  LEFT JOIN plandetail t2 
  ON t1.id = t2.planid 
  GROUP BY t1.name;
+-----------+-------------------------------------------------------------+
| name      | LISTAGG(t2.name,':') WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+-------------------------------------------------------------+
| 计划一    | 明细一:明细2:明细3                                          |
| 计划三    | 明细一:明细2:明细3                                          |
| 计划二    | 明细一:明细2:明细3                                          |
+-----------+-------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,'\'') WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1
  LEFT JOIN plandetail t2
  ON t1.id = t2.planid
  GROUP BY t1.name;
+-----------+--------------------------------------------------------------+
| name      | LISTAGG(t2.name,'\'') WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+--------------------------------------------------------------+
| 计划一    | 明细一'明细2'明细3                                           |
| 计划三    | 明细一'明细2'明细3                                           |
| 计划二    | 明细一'明细2'明细3                                           |
+-----------+--------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,1) WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1
  LEFT JOIN plandetail t2
  ON t1.id = t2.planid
  GROUP BY t1.name;
+-----------+-----------------------------------------------------------+
| name      | LISTAGG(t2.name,1) WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+-----------------------------------------------------------+
| 计划一    | 明细一1明细21明细3                                        |
| 计划三    | 明细一1明细21明细3                                        |
| 计划二    | 明细一1明细21明细3                                        |
+-----------+-----------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,-1) WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1
  LEFT JOIN plandetail t2
  ON t1.id = t2.planid
  GROUP BY t1.name;
+-----------+------------------------------------------------------------+
| name      | LISTAGG(t2.name,-1) WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+------------------------------------------------------------+
| 计划一    | 明细一-1明细2-1明细3                                       |
| 计划三    | 明细一-1明细2-1明细3                                       |
| 计划二    | 明细一-1明细2-1明细3                                       |
+-----------+------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,1.0000000001) WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1
  LEFT JOIN plandetail t2
  ON t1.id = t2.planid
  GROUP BY t1.name;
+-----------+----------------------------------------------------------------------+
| name      | LISTAGG(t2.name,1.0000000001) WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+----------------------------------------------------------------------+
| 计划一    | 明细一1.0000000001明细21.0000000001明细3                             |
| 计划三    | 明细一1.0000000001明细21.0000000001明细3                             |
| 计划二    | 明细一1.0000000001明细21.0000000001明细3                             |
+-----------+----------------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,-1.0000000001) WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1
  LEFT JOIN plandetail t2
  ON t1.id = t2.planid
  GROUP BY t1.name;
+-----------+-----------------------------------------------------------------------+
| name      | LISTAGG(t2.name,-1.0000000001) WITHIN GROUP (ORDER BY t2.planid ASC) |
+-----------+-----------------------------------------------------------------------+
| 计划一    | 明细一-1.0000000001明细2-1.0000000001明细3                            |
| 计划三    | 明细一-1.0000000001明细2-1.0000000001明细3                            |
| 计划二    | 明细一-1.0000000001明细2-1.0000000001明细3                            |
+-----------+-----------------------------------------------------------------------+

greatsql> SELECT t1.name ,LISTAGG(t2.name,'|分割|') WITHIN GROUP (ORDER BY t2.planid ASC) FROM plan1 t1 
  LEFT JOIN plandetail t2 
  ON t1.id = t2.planid 
  GROUP BY t1.name;
+-----------+--------------------------------------------------------------------+
| name      | LISTAGG(t2.name,'|分割|') WITHIN GROUP (ORDER BY t2.planid ASC)   |
+-----------+--------------------------------------------------------------------+
| 计划一    | 明细一|分割|明细2|分割|明细3                                       |
| 计划三    | 明细一|分割|明细2|分割|明细3                                       |
| 计划二    | 明细一|分割|明细2|分割|明细3                                       |
+-----------+--------------------------------------------------------------------+
```

**2. Testing analytic queries**

```sql
-- Create test table and fill in test data
greatsql> CREATE TABLE p (population INT, nation CHAR(20), city CHAR(20));
greatsql> INSERT INTO p VALUES (500, 'China','Guangzhou'),
(1500, 'China','Shanghai'),
(500, 'China','Beijing'),
(1000, 'USA','New York'),
(500, 'USA','Bostom'),
(500, 'Japan','Tokyo');

-- Test LISTAGG over partition
greatsql> SELECT
  nation, LISTAGG(p.city, ',') OVER (PARTITION BY nation ) la_a_city
  FROM p;
+--------+----------------------------+
| nation | la_a_city                  |
+--------+----------------------------+
| China  | Guangzhou,Shanghai,Beijing |
| China  | Guangzhou,Shanghai,Beijing |
| China  | Guangzhou,Shanghai,Beijing |
| Japan  | Tokyo                      |
| USA    | New York,Bostom            |
| USA    | New York,Bostom            |
+--------+----------------------------+

greatsql> SELECT 
  nation, city, LISTAGG(p.city, ',') OVER (PARTITION BY nation ) la_a_city
  FROM p;
+--------+-----------+----------------------------+
| nation | city      | la_a_city                  |
+--------+-----------+----------------------------+
| China  | Guangzhou | Guangzhou,Shanghai,Beijing |
| China  | Shanghai  | Guangzhou,Shanghai,Beijing |
| China  | Beijing   | Guangzhou,Shanghai,Beijing |
| Japan  | Tokyo     | Tokyo                      |
| USA    | New York  | New York,Bostom            |
| USA    | Bostom    | New York,Bostom            |
+--------+-----------+----------------------------+

greatsql> SELECT 
  nation, city, LISTAGG(p.city, ',') WITHIN GROUP (ORDER BY city ASC)
  OVER (PARTITION BY nation ) la_a_city
  FROM p;
+--------+-----------+----------------------------+
| nation | city      | la_a_city                  |
+--------+-----------+----------------------------+
| China  | Beijing   | Beijing,Guangzhou,Shanghai |
| China  | Guangzhou | Beijing,Guangzhou,Shanghai |
| China  | Shanghai  | Beijing,Guangzhou,Shanghai |
| Japan  | Tokyo     | Tokyo                      |
| USA    | Bostom    | Bostom,New York            |
| USA    | New York  | Bostom,New York            |
+--------+-----------+----------------------------+

-- Test other analytic functions
greatsql> SELECT
  SUM(population) OVER (PARTITION BY nation) population,
  LISTAGG(p.city, ',') OVER (PARTITION BY nation) la_a_city
  FROM p;
+------------+----------------------------+
| population | la_a_city                  |
+------------+----------------------------+
|       2500 | Guangzhou,Shanghai,Beijing |
|       2500 | Guangzhou,Shanghai,Beijing |
|       2500 | Guangzhou,Shanghai,Beijing |
|        500 | Tokyo                      |
|       1500 | New York,Bostom            |
|       1500 | New York,Bostom            |
+------------+----------------------------+

greatsql> SELECT
  SUM(population) OVER (PARTITION BY nation) population,
  LISTAGG(p.city, ',') WITHIN GROUP (ORDER BY city ASC)
  OVER (PARTITION BY nation ) la_a_city
  FROM p;
+------------+----------------------------+
| population | la_a_city                  |
+------------+----------------------------+
|       2500 | Beijing,Guangzhou,Shanghai |
|       2500 | Beijing,Guangzhou,Shanghai |
|       2500 | Beijing,Guangzhou,Shanghai |
|        500 | Tokyo                      |
|       1500 | Bostom,New York            |
|       1500 | Bostom,New York            |
+------------+----------------------------+

greatsql> SELECT
  SUM(population) OVER (PARTITION BY nation ORDER BY city ASC) population,
  LISTAGG(p.city, ',') OVER (PARTITION BY nation ) la_a_city
  FROM p;
+------------+----------------------------+
| population | la_a_city                  |
+------------+----------------------------+
|        500 | Beijing,Guangzhou,Shanghai |
|       1000 | Beijing,Guangzhou,Shanghai |
|       2500 | Beijing,Guangzhou,Shanghai |
|        500 | Tokyo                      |
|        500 | Bostom,New York            |
|       1500 | Bostom,New York            |
+------------+----------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
