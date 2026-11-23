# Oracle Compatibility - Syntax - ORACLE MODE
---

## 1. Syntax

```sql
SET GLOBAL sql_mode = 'ORACLE';
SET SESSION sql_mode = 'ORACLE';
```

## 2. Definition and Usage

The purpose of modifying `sql_mode` to `ORACLE` is to switch to the Oracle compatibility mode, avoiding conflicts with the existing GreatSQL modes (working methods).

If neither `GLOBAL` nor `SESSION` is specified, only the `SESSION` level `sql_mode` is modified by default.

Changing the `GLOBAL` level `sql_mode` requires the `SYSTEM_VARIABLES_ADMIN` or `SUPER` privilege.

The Oracle mode is actually a combination of the following modes:
| Mode | Function |
| ---- | ---- |
| PIPES_AS_CONCAT | &#124; &#124; concatenation operator |
| ANSI_QUOTES | keywords enclosed in double quotes "" |
| IGNORE_SPACE | ignore spaces |
| ONLY_FULL_GROUP_BY | only allow querying grouped fields with GROUP BY |
| STRICT_TRANS_TABLES | strictly restrict data conversion when inserting into tables |
| STRICT_ALL_TABLES | strictly restrict data conversion |
| NO_ZERO_IN_DATE | do not allow the 00 part in dates |
| NO_ZERO_DATE | do not allow dates 0000-00-00 |
| ERROR_FOR_DIVISION_BY_ZERO | report an error directly when dividing by 0 |
| NO_ENGINE_SUBSTITUTION | do not allow specifying storage engines that are not enabled |

More specifically, some working behaviors in Oracle mode include the following:

- 1. Implicit conversion of types will be strictly restricted. Exception: when a function such as `IFNULL(v1, v2)` returns a string type, an implicit conversion will be performed again, and forcing the type conversion will not report an error.

- 2. For temporal types, illegal date values are not allowed, for example: 0000-00-00.

- 3. In division operations, an error is reported when the denominator is 0.

- 4. When performing `GROUP BY` grouping queries, fields that are not in the `GROUP BY` clause cannot be queried.

- 5. Data types must strictly follow the specification when declared; non-standard data types will cause errors.

If needed, to remove individual modes from ORACLE mode, you can also adjust it by setting the `shrink_sql_mode` parameter. For details, refer to [shrink_sql_mode](./5-3-easyuse-ora-syntax-shrinkmode.md).

**Reminder:** If `GLOBAL` level `sql_mode = ORACLE` has been set, then when `sql_mode = DEFAULT` is modified in a session, the `sql_mode` of that session is still `ORACLE`, not the native default mode of GreatSQL. As shown below:
```
-- Set GLOBAL sql_mode in session 1
greatsql> SET GLOBAL sql_mode = ORACLE;
greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

-- In session 2 (this session must connect after session 1 is set), set sql_mode = DEFAULT, the result is still ORACLE
greatsql> SET SESSION sql_mode = DEFAULT;
greatsql> SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode\G
*************************** 1. row ***************************
 @@GLOBAL.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
@@SESSION.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

-- Temporarily change to ANSI
greatsql> SET SESSION sql_mode = ANSI;

greatsql> SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode\G
*************************** 1. row ***************************
 @@GLOBAL.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
@@SESSION.sql_mode: REAL_AS_FLOAT,PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ANSI
1 row in set (0.00 sec)

-- Set to DEFAULT mode again, and it is still ORACLE mode
greatsql> SET SESSION sql_mode = DEFAULT;

greatsql> SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode\G
*************************** 1. row ***************************
 @@GLOBAL.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
@@SESSION.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

## 3. Examples

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

greatsql> SELECT 1/0;
ERROR 1365 (22012): Division by 0


-- In DEFAULT mode, or in ORACLE mode after removing the ERROR_FOR_DIVISION_BY_ZERO mode, the 1/0 operation is allowed

-- 1. Remove the ERROR_FOR_DIVISION_BY_ZERO mode in ORACLE mode
greatsql> SET shrink_sql_mode = ERROR_FOR_DIVISION_BY_ZERO;
greatsql> SELECT @@shrink_sql_mode;
+----------------------------+
| @@shrink_sql_mode          |
+----------------------------+
| ERROR_FOR_DIVISION_BY_ZERO |
+----------------------------+

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION

-- No error and no warning
greatsql> SELECT 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set (0.00 sec)


-- 2. Switch to DEFAULT mode
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

greatsql> SET sql_mode = DEFAULT;

-- No error, but a warning
greatsql> SELECT 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------+
| Level   | Code | Message       |
+---------+------+---------------+
| Warning | 1365 | Division by 0 |
+---------+------+---------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
