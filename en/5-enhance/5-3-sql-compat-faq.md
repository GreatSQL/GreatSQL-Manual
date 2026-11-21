# Oracle Compatibility FAQ
---

## Can the **compatible mode** be triggered without explicitly using `sql_mode = ORACLE`

- Adding `sql_mode = ORACLE` to the GreatSQL configuration file my.cnf to modify the default `sql_mode` value will cause GreatSQL functions to behave abnormally, because **the basic stored routines that GreatSQL depends on have not been compatibly modified**.
- After GreatSQL initialization is complete, adding `sql_mode = ORACLE` to the configuration file my.cnf and restarting GreatSQL will cause new connections to switch to Oracle compatible mode by default.
- While the GreatSQL database is running, after modifying the global setting `SET GLOBAL sql_mode = ORACLE`, new connections will switch to Oracle compatible mode by default. This default behavior becomes invalid after GreatSQL is restarted. If you want this setting to be persistent, you can change it to `SET PERSIST sql_mode = ORACLE`.
- You can also fix the setting `sql_mode = ORACLE` in the connection session configuration. For example, adding `session_variables = "sql_mode = ORACLE"` to the JDBC connection string, so that SQL in the connection does not need to explicitly set the compatible mode.

## Can the compatible mode be switched inside a stored routine

In GreatSQL, the **compatible mode**, or **sql mode**, is an inherent attribute of a stored routine and determines how the stored routine is parsed and executed. Modifying `sql_mode` inside a stored routine can change the current compatible mode, but when the stored routine finishes running and returns, the compatible mode in the upper-layer context is restored (consistent with what it was before the stored routine ran).

For example:

```sql
-- sql mode demonstration code

SET sql_mode = DEFAULT;

DROP PROCEDURE mode_test;

DELIMITER $ ;
CREATE PROCEDURE mode_test() BEGIN
 SELECT LENGTH('测试'), @@sql_mode;
 SET sql_mode = ORACLE;
 SELECT LENGTH('测试'), @@sql_mode;
END ;
$

DELIMITER ; $

SET sql_mode = DEFAULT;
SELECT 'before test 1', LENGTH('测试'), @@sql_mode;
CALL mode_test();
SELECT 'after test 1', LENGTH('测试'), @@sql_mode;
```

The running result of this stored routine is as follows:

```sql
greatsql> SET sql_mode = DEFAULT;

-- Before the test, call LENGTH, the output follows GreatSQL default behavior, showing character byte length = 6
greatsql> SELECT 'before test 1', LENGTH('测试'), @@sql_mode;
| before test 1 | LENGTH('测试')   | @@sql_mode | 
| before test 1 |                6 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION |

greatsql> CALL mode_test();
-- Inside the stored routine, call LENGTH before the setting, the output follows GreatSQL default behavior, showing character byte length = 6
| LENGTH('测试')   | @@sql_mode  |
|                6 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION |

-- Inside the stored routine, set Oracle compatible mode, call LENGTH, the output follows Oracle compatible behavior, showing character byte length = 2  
| LENGTH('测试')   | @@sql_mode                                                     |
|                2 | PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ORACLE,SYSDATE_IS_NOW |


greatsql> SELECT 'after test 1', LENGTH('测试'), @@sql_mode;
-- After returning from the stored routine, call LENGTH, the output follows GreatSQL default behavior, showing character byte length = 6
| before test 1 |                6 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION |
```

## Can the SQL compatible mode be switched in triggers and events

In GreatSQL, setting the SQL compatible mode or modifying `sql_mode` before defining a trigger will affect the compatible style of the SQL syntax or functions inside the trigger.

## Why do some cases produce different results or fail to run

It is possible that some individual option parameters or `sql_mode` settings differ, causing different results or even failure to run.

For example, in a stored routine, the `RAND()` function may be used, and its output is a random value, so the results may differ.

Or in the [REF CURSOR, SYS_REFCURSOR usage in stored routines](./sql-compat/5-3-easyuse-ora-sp-ref-cursor.md) case, you need to ensure that `sql_generate_invisible_primary_key = 0` is set first; otherwise, the stored routine may run abnormally and report an error similar to the following:
```sql
greatsql> CALL p1()//
ERROR 1328 (HY000): Incorrect number of FETCH variables
```

You can execute `SELECT @@sql_mode`, `SHOW CREATE TABLE ...`, or `SHOW CREATE PROCEDURE ...` to confirm whether the definitions of `sql_mode`, table structures, stored procedures, triggers, views, etc. are consistent with the cases in the manual.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
