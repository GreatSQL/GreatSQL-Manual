# Oracle兼容-函数-WM_CONCAT()函数
---


## 1. 语法

```sql
WM_CONCAT([DISTINCT] expr,... [ORDER BY col [ASC|DESC],...]
    [SEPARATOR str_const])
```

## 2. 定义和用法
`WM_CONCAT(expr)` 函数的作用是从 `expr` 中连接所有非NULL的字符串。如果没有非NULL的字符串，那么它就会返回NULL。

用法：`WM_CONCAT([DISTINCt] 要连接的字段列表 [ORDER BY 排序字段 ASC|DESC ] [SEPARATOR '分隔符'])`。

## 3. Oracle兼容说明

- `WM_CONCAT()` 是一个聚合函数，在Oracle 10g推出，在10g版本中，返回字符串类型，在11g版本中返回clob类型，在12c后已取消该函数。在Oracle中，该函数是一个undocumented function（未公开函数）），Oracle官方不推荐使用的函数。
- 从网络公开资料中并未看到Oracle的 `WM_CONCAT()` 函数支持 `ORDER BY` 子句。而GreatSQL的 `WM_CONCAT()` 函数是支持 `ORDER BY` 子句的。
- 在Windowing（窗口函数用法）环境中，`OVER()` 内的 `ORDER BY` 子句，与 `WM_CONCAT()` 中的 `ORDER BY` 子句不可同时出现。
- 当 `WM_CONCAT()` 中没有 `ORDER BY` 子句时，允许在 `OVER()` 内使用 `ORDER BY` 子句；当 `OVER()` 中使用 `ORDER BY` 子句时，会将 `ORDER BY` 视为 `PARTITION` 的一部分；`WM_CONCAT()` 内使用 `ORDER BY` 时则是单纯的将结果排序。

## 4. 示例

```
greatsql> CREATE TABLE t1 (
grp INT,
a BIGINT UNSIGNED,
c CHAR(10) NOT NULL,
d CHAR(10) NOT NULL
);

greatsql> INSERT INTO t1 VALUES (1,1,"a","a"),
(2,2,"b","a"),
(2,3,"c","b"),
(3,4,"E","a"),
(3,5,"C","b");

greatsql> SELECT * FROM t1;
+------+------+---+---+
| grp  | a    | c | d |
+------+------+---+---+
|    1 |    1 | a | a |
|    2 |    2 | b | a |
|    2 |    3 | c | b |
|    3 |    4 | E | a |
|    3 |    5 | C | b |
+------+------+---+---+

greatsql> SELECT WM_CONCAT(c) FROM t1;
+--------------+
| WM_CONCAT(c) |
+--------------+
| a,b,c,E,C    |
+--------------+

greatsql> SELECT REPLACE(WM_CONCAT(c),',','|') FROM t1;
+-------------------------------+
| REPLACE(WM_CONCAT(c),',','|') |
+-------------------------------+
| a|b|c|E|C                     |
+-------------------------------+

greatsql> SELECT grp, WM_CONCAT(c) c FROM t1 GROUP BY grp;
+------+------+
| grp  | c    |
+------+------+
|    1 | a    |
|    2 | b,c  |
|    3 | E,C  |
+------+------+

greatsql> SELECT grp, WM_CONCAT(DISTINCT c ORDER BY c DESC) FROM t1 GROUP BY grp;
+------+---------------------------------------+
| grp  | WM_CONCAT(DISTINCT c ORDER BY c DESC) |
+------+---------------------------------------+
|    1 | a                                     |
|    2 | c,b                                   |
|    3 | E,C                                   |
+------+---------------------------------------+

greatsql> SELECT grp, WM_CONCAT(DISTINCT c ORDER BY c DESC) OVER (PARTITION BY grp) FROM t1;
+------+---------------------------------------------------------------+
| grp  | WM_CONCAT(DISTINCT c ORDER BY c DESC) OVER (PARTITION BY grp) |
+------+---------------------------------------------------------------+
|    1 | a                                                             |
|    2 | c,b                                                           |
|    2 | c,b                                                           |
|    3 | E,C                                                           |
|    3 | E,C                                                           |
+------+---------------------------------------------------------------+

greatsql> SELECT grp, WM_CONCAT(DISTINCT c) OVER (PARTITION BY grp ORDER BY c DESC) FROM t1;
+------+---------------------------------------------------------------+
| grp  | WM_CONCAT(DISTINCT c) OVER (PARTITION BY grp ORDER BY c DESC) |
+------+---------------------------------------------------------------+
|    1 | a                                                             |
|    2 | c                                                             |
|    2 | c,b                                                           |
|    3 | E                                                             |
|    3 | E,C                                                           |
+------+---------------------------------------------------------------+

greatsql> EXPLAIN SELECT grp, WM_CONCAT(DISTINCT c ORDER BY c DESC) OVER (PARTITION BY grp) FROM t1;
greatsql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Note
   Code: 3598
Message: To get information about window functions use EXPLAIN FORMAT=JSON
*************************** 2. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`grp` AS `grp`,wm_concat(distinct `greatsql`.`t1`.`c` order by `greatsql`.`t1`.`c` desc separator ',') OVER (PARTITION BY `greatsql`.`t1`.`grp` )  AS `WM_CONCAT(DISTINCT c ORDER BY c DESC) OVER (PARTITION BY grp)` from `greatsql`.`t1`

greatsql> EXPLAIN SELECT grp, WM_CONCAT(DISTINCT c) OVER (PARTITION BY grp ORDER BY c DESC) FROM t1;
greatsql> SHOW WARNINGS\G
*************************** 1. row ***************************
  Level: Note
   Code: 3598
Message: To get information about window functions use EXPLAIN FORMAT=JSON
*************************** 2. row ***************************
  Level: Note
   Code: 1003
Message: /* select#1 */ select `greatsql`.`t1`.`grp` AS `grp`,wm_concat(distinct `greatsql`.`t1`.`c` separator ',') OVER (PARTITION BY `greatsql`.`t1`.`grp` ORDER BY `greatsql`.`t1`.`c` desc )  AS `WM_CONCAT(DISTINCT c) OVER (PARTITION BY grp ORDER BY c DESC)` from `greatsql`.`t1`
```





**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
