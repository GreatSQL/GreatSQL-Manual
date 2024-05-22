# View/视图
---

## 什么是 View（视图）

View（视图）是一种虚拟表，它不包含实际存储的数据，而是根据定义视图时所写的 SQL 查询逻辑动态生成结果集。

视图基于一个或多个基表（实际的数据表）构建，可以展示基表的部分列或经过计算和过滤后的数据。

视图具有以下几个特点：

1. **虚拟性**：视图本身不存储数据，而是存储了一个查询模板。当查询视图时，会执行该查询模板，从相关基表中检索数据。
2. **透明性**：对于应用程序和用户来说，视图就像一个普通的表，可以进行 `SELECT`、`UPDATE` 等操作。
3. **封装与安全**：视图可以用来封装复杂的查询逻辑，对外提供简化的数据视图，同时可以隐藏敏感数据或限制访问权限，增强数据安全性。
4. **逻辑数据独立性**：视图提供了一层抽象，使得应用程序不必直接依赖于底层表结构，当基表结构发生变化时，仅需调整视图定义，而无需修改应用程序代码。

## 创建视图

创建视图的基本语法如下：

```sql
CREATE 
 [OR REPLACE] 
 [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
  VIEW view_name AS
SELECT c1, c2, ...
 FROM t1
  WHERE condition;
```

- `ALGORITHM` 指定视图生成的机制。
- `view_name` 是视图的名称。
- `c1, c2, ...` 是视图中包含的列。
- `t1` 是被查询的实际表名。
- `condition` 是可选的查询条件。

## 使用视图

1. **查询视图**：像查询普通表一样查询视图。
   ```sql
   SELECT * FROM view_name;
   ```

2. **更新视图**：如果视图定义允许（通常是基于单个表且不包含聚合函数、`DISTINCT`、`GROUP BY` 等），还可以通过视图更新基表数据。
   ```sql
   UPDATE view_name SET column = value WHERE condition;
   DELETE FROM view_name WHERE condition;
   ```

## 注意事项

1. **性能影响**：复杂的视图查询可能会影响性能，特别是当使用了 `TEMPTABLE` 算法时，因为数据会被复制到临时表中。
2. **更新限制**：并非所有视图都是可更新的，涉及聚合函数、子查询、`DISTINCT`、`UNION` 等操作的视图通常不可更新。
3. **权限管理**：创建视图需要相应的权限，同时也要注意通过 `GRANT` 语句正确分配对视图的访问权限。
4. **依赖性管理**：视图依赖于基表，基表结构的更改可能会影响到视图的有效性，需要适时地调整视图定义。
5. **视图算法选择**：MySQL提供了`MERGE`, `TEMPTABLE`, `UNDEFINED`三种视图处理算法，选择合适的算法可以优化性能和可更新性。
   - *MERGE*：适合简单的视图，将视图定义与查询结合执行。
   - *TEMPTABLE*：适合复杂视图，先将结果存入临时表再处理。
   - *UNDEFINED*：未定义，自动选择算法，优先选择 *MERGE*。

例如，用下面的方法创建视图，可以对其进行查询和更新：

```sql
greatsql> USE world;
greatsql> CREATE VIEW v1 AS SELECT * FROM city WHERE CountryCode = 'CHN';
greatsql> SELECT * FROM v1 LIMIT 5;

-- 支持用SHOW CREATE VIEW/TABLE 查看视图定义，二者等价
greatsql> SHOW CREATE TABLE v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` AS select `city`.`ID` AS `ID`,`city`.`Name` AS `Name`,`city`.`CountryCode` AS `CountryCode`,`city`.`District` AS `District`,`city`.`Population` AS `Population` from `city` where (`city`.`CountryCode` = 'CHN')
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci

greatsql> SHOW CREATE VIEW v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` AS select `city`.`ID` AS `ID`,`city`.`Name` AS `Name`,`city`.`CountryCode` AS `CountryCode`,`city`.`District` AS `District`,`city`.`Population` AS `Population` from `city` where (`city`.`CountryCode` = 'CHN')
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci

-- 更新视图并再次查询
greatsql> UPDATE v1 SET Population = 9696400 WHERE ID = 1890;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM v1 WHERE ID = 1890;
+------+----------+-------------+----------+------------+
| ID   | Name     | CountryCode | District | Population |
+------+----------+-------------+----------+------------+
| 1890 | Shanghai | CHN         | Shanghai |    9696400 |
+------+----------+-------------+----------+------------+
```

## 修改视图

支持使用 `ALTER VIEW` 来修改视图，例如：

```sql
greatsql> SELECT COUNT(*) FROM v1;
+----------+
| count(*) |
+----------+
|      363 |
+----------+

greatsql> ALTER VIEW v1 AS SELECT * FROM city WHERE CountryCode = 'CHN' AND Population >= 5000000;
Query OK, 0 rows affected (0.07 sec)

greatsql> SELECT COUNT(*) FROM v1;
+----------+
| count(*) |
+----------+
|        4 |
+----------+
```

修改和删除视图时，就必须使用 `VIEW` 关键字，而不能再用 `TABLE` 关键字了，例如：

```sql
greatsql> DROP TABLE v1;
ERROR 1051 (42S02): Unknown table 'world.v1'

greatsql> DROP VIEW v1;
Query OK, 0 rows affected (0.00 sec)
```

综上，视图是数据库设计中一种灵活且强大的工具，它能够简化数据访问，增强数据安全性和逻辑独立性，但使用时也需注意其潜在的性能影响和更新限制。

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
