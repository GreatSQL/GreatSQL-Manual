# Oracle兼容-函数-LISTAGG()函数
---


## 1. 语法

```sql
LISTAGG ( [ { ALL | DISTINCT } ] measure_expr [ , 'delimiter' ] )
[ WITHIN GROUP ( order_by_clause ) ]
[ OVER query_partition_clause ]

query_partition_clause := ( PARTITION BY column_name [,...] )
```

## 2. 定义和用法

参数说明：

1. `measure_expr` 可以是列，常量或基于列的表达式。
2. `delimiter` 分隔符，可以是 **''**、**字符串文字**、**数字**、**浮点**等。
3. `order_by_clause` ORDER BY子句决定了列值被拼接的顺序。
4. 当 `ALL` 及 `DISTINCT` 都未指定时，视为 `ALL`。
5. `OVER query_partition_clause` 不存在时，视为 **聚合（AGGREGATE）** 函数。反之，视为 **分析（ANALYTIC）** 函数。
6. 目前不支持聚合类函数嵌套使用，例如：
```sql
greatsql> SELECT listagg(sum(id))  FROM t1 GROUP BY id;
ERROR 1111 (HY000): Invalid use of group function
```

## 3. Oracle兼容说明
1. 在GreatSQL中的 `LISTAGG()` 函数语法参考 Oracle 19c 版本用法，与 Oracle 11r2 版本的 `WITHIN GROUP` 用法部分有差异。
2. 目前尚未支持 `LISTAGG OVERFLOW` 语法，仍沿用GreatSQL中的 `group_concat_max_len` 选项限制方式。
3. 分隔符 `delimiter` 目前只支持字符常量，不支持使用 session/global 设定或运算式（**注意：** 会将数字常量转换为字符常量，转换时可能会因浮点精度或格式问题，不一定如预期呈现，因此建议直接使用字符常量）。


## 4. 示例

说明：GreatSQL中返回结果顺序与Oracle顺序可能会因为使用字符集不同存在排序差异。

```sql
-- 创建测试表，填充测试数据
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

**1. 分别测试 GROUP_CONCAT() 和 LISTAGG()**

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

**2. 测试分析性查询**
```sql
-- 创建测试表，填充测试数据
greatsql> CREATE TABLE p (population INT, nation CHAR(20), city CHAR(20));
greatsql> INSERT INTO p VALUES (500, 'China','Guangzhou'),
(1500, 'China','Shanghai'),
(500, 'China','Beijing'),
(1000, 'USA','New York'),
(500, 'USA','Bostom'),
(500, 'Japan','Tokyo');

-- 测试LISTAGG over partition
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

-- 测试其他分析型函数
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


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
