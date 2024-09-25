# View/视图
---

## 什么是 View（视图）

View（视图）是一种虚拟表，它不包含实际存储的数据，而是根据定义视图时所写的 SQL 查询逻辑动态生成结果集。

与实际表不同，视图不存储数据，而是存储 SQL 查询。视图使得用户可以通过查询视图来访问复杂查询的结果，就像查询一个普通的表一样。

视图的主要功能包括：

- 简化复杂查询：通过视图，用户可以将复杂的 SQL 查询封装成一个简单的查询。
- 数据安全性：视图可以用来限制用户对特定数据的访问，通过视图可以暴露表的部分数据。
- 数据独立性：视图可以隐藏表结构的变化，提供数据独立性。
- 重用查询逻辑：视图可以重用查询逻辑，提高开发效率。

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
3. **权限管理**：创建视图需要相应的权限，同时也要注意通过 `GRANT` 语句正确分配对视图的访问权限，注意不要通过视图意外暴露敏感数据。
4. **依赖性管理**：视图依赖于基表，基表结构的更改可能会影响到视图的有效性，需要适时地调整视图定义。
5. **索引和视图**：视图本身不能创建索引，但可以基于视图的查询使用基础表的索引。
6. **视图算法选择**：MySQL提供了`MERGE`, `TEMPTABLE`, `UNDEFINED`三种视图处理算法，选择合适的算法可以优化性能和可更新性。
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

## 小结

视图是数据库设计中一种灵活且强大的工具，通过视图，用户可以简化复杂查询，增强数据安全性，提高查询的可维护性和重用性。

然而，在使用视图时，需注意其性能影响、可更新性限制以及依赖关系，以确保视图的有效性和可靠性。

从 GreatSQL 8.0.32-24 版本开始支持 Oracle 兼容，对创建视图用法进行扩展，支持 `CREATE FORCE VIEW` 语法，详情请参考：[Oracle 兼容之 CREATE FORCE VIEW](../5-enhance/sql-compat/5-3-easyuse-ora-syntax-createforceview.md)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
