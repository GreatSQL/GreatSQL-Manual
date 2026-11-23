# Oracle Compatibility - Function - WM_CONCAT()

---

## 1. Syntax

```sql
WM_CONCAT([DISTINCT] expr,... [ORDER BY col [ASC|DESC],...]
    [SEPARATOR str_const])
```

## 2. Definition and Usage

The `WM_CONCAT(expr)` function concatenates all non-NULL strings from `expr`. If there are no non-NULL strings, it returns NULL.

Usage: `WM_CONCAT([DISTINCT] field list to be concatenated [ORDER BY sort field ASC|DESC ] [SEPARATOR 'separator'])`.

## 3. Oracle Compatibility Notes

- `WM_CONCAT()` is an aggregate function introduced in Oracle 10g. In the 10g version, it returns a string type; in the 11g version, it returns a clob type; and it was removed after 12c. In Oracle, this function is an undocumented function, and Oracle officially does not recommend using it.
- No evidence has been found in public online materials that the Oracle `WM_CONCAT()` function supports the `ORDER BY` clause. The GreatSQL `WM_CONCAT()` function does support the `ORDER BY` clause.
- In a windowing (window function usage) context, the `ORDER BY` clause inside `OVER()` cannot appear together with the `ORDER BY` clause in `WM_CONCAT()`.
- When there is no `ORDER BY` clause in `WM_CONCAT()`, the `ORDER BY` clause is allowed inside `OVER()`; when the `ORDER BY` clause is used in `OVER()`, the `ORDER BY` is treated as part of `PARTITION`; when `ORDER BY` is used inside `WM_CONCAT()`, it simply sorts the results.

## 4. Examples

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

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
