# Oracle兼容-语法-CREATE FORCE VIEW
---
[toc]

## 1. 语法

```sql
CREATE [ OR REPLACE ] FORCE VIEW name [ ( column_name [, ...] ) ]
  AS query
```

## 2. 定义和用法

正常情况下，如果基表不存在，创建视图就会失败。但是可以使用使用本功能完成强制创建视图（前提：创建视图的语句无语法错误）。


## 3. Oracle兼容说明

1. 不支持 `PREPARE stmt FROM` 和 `EXCUTE IMMEDIATE` 两种场景。

2. 强制创建视图后，不支持 `ALTER VIEW new_view compile` 的语法，这点与Oracle不同。

3. 错误提示结果可能与Oracle存在不同。如果 query（查询语句）不合理，当基表创建时报错为 `ER_VIEW_INVALID`，也存在创建基表 `referenc view` 的其它错误。

4. 如果基表不存在，强制创建视图时的约束检测只会进行简单的列同名、表名重复的约束检测，这点与Oracle不同。

5. 在Oracle中的强制创建视图时，在语法解析过程中，会对SQL语句进行规则检查，有些语句会直接报错，而GreatSQL则需要到prepare解析取值时才报错。当基表不存在时，Oracle会有自己的规则检测报错信息。


## 4. 示例

### 4.1 正常创建视图
```sql
greatsql> CREATE TABLE t1 (a INT, b INT);
greatsql> INSERT INTO t1 VALUES (1,1), (2,2), (3,3);
greatsql> CREATE FORCE VIEW v1 (c,d) AS SELECT a,b FROM t1 WHERE a<=2;
greatsql> SELECT * FROM t1;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

greatsql> SELECT * FROM v1;
+------+------+
| c    | d    |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
```

### 4.2 创建视图时基表不存在，在当基表创建后，视图可正常使用

```sql
-- 强制创建基表不存在的视图
greatsql> CREATE FORCE VIEW v1 (c,d) AS SELECT a,b FROM t1 WHERE a<=2;
Query OK, 0 rows affected, 2 warnings (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------------------------------+
| Level   | Code | Message                               |
+---------+------+---------------------------------------+
| Error   | 1146 | Table 'greatsql.t1' doesn't exist     |
| Warning | 7567 | View created with compilation errors. |
+---------+------+---------------------------------------+

greatsql> SELECT * FROM t1;
ERROR 1146 (42S02): Table 'greatsql.t1' doesn't exist

greatsql> SELECT * FROM v1;
ERROR 1356 (HY000): View 'greatsql.v1' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them

-- 即便基表不存在，也能查看视图定义
greatsql> SHOW CREATE VIEW v1\G
*************************** 1. row ***************************
                View: v1
         Create View: CREATE FORCE DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v1` (`c`,`d`) AS select `t1`.`a` AS `a`,`t1`.`b` AS `b` from `t1` where (`t1`.`a` <= 2)
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci

-- 创建基表，写入数据
greatsql> CREATE TABLE t1 (a INT, b INT);
greatsql> INSERT INTO t1 VALUES (1,1), (2,2), (3,3);
greatsql> CREATE FORCE VIEW v1 (c,d) AS SELECT a,b FROM t1 WHERE a<=2;
greatsql> SELECT * FROM t1;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

greatsql> SELECT * FROM v1;
+------+------+
| c    | d    |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
```


### 4.3 两种不支持的场景

```
greatsql> EXECUTE IMMEDIATE 'CREATE OR REPLACE FORCE VIEW v1 AS SELECT * FROM t1';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet

greatsql> PREPARE stmt FROM 'CREATE OR REPLACE FORCE VIEW v1 AS SELECT * FROM t1';
ERROR 1295 (HY000): This command is not supported in the prepared statement protocol yet
```

### 4.4 约束检测处理失败，不能强制创建视图

```
greatsql> CREATE FORCE VIEW v1 AS SELECT * FROM v1;
ERROR 1462 (HY000): `greatsql`.`v1` contains view recursion

greatsql> CREATE FORCE VIEW v1 AS SELECT a,a FROM t1;
ERROR 1060 (42S21): Duplicate column name 'a'
```

### 4.5 部分错误信息和Oracle不一致

```
-- 1. 列重名
-- GreatSQL
greatsql> CREATE OR REPLACE FORCE VIEW v1 AS SELECT a.a, b.a FROM t1 a JOIN t1 b;
ERROR 1060 (42S21): Duplicate column name 'a'

-- Oracle
SQL> CREATE OR REPLACE FORCE VIEW v1 AS SELECT a.a, b.a FROM t1 a JOIN t1 b;
CREATE OR REPLACE FORCE VIEW v1 AS SELECT a.a, b.a FROM t1 a JOIN t1 b
                                                                     *
ERROR at line 1:
ORA-00905: missing keyword

-- 2. 创建视图时嵌套
-- GreatSQL
greatsql> CREATE OR REPLACE FORCE VIEW v2 AS SELECT (SELECT a FROM v2) FROM DUAL;
ERROR 1462 (HY000): `greatsql`.`v2` contains view recursion

greatsql> CREATE OR REPLACE FORCE VIEW v2 AS SELECT * FROM (SELECT a FROM v2) ;
ERROR 1462 (HY000): `greatsql`.`v2` contains view recursion

-- Oracle
SQL> CREATE OR REPLACE FORCE VIEW v2 AS SELECT * FROM (SELECT a FROM v2) ;

Warning: View created with compilation errors.

SQL> CREATE OR REPLACE FORCE VIEW v2 AS SELECT (SELECT a FROM v2) FROM DUAL;

Warning: View created with compilation errors.

SQL> CREATE OR REPLACE FORCE VIEW v2 AS SELECT * FROM (SELECT a FROM v2) ;

Warning: View created with compilation errors.
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
