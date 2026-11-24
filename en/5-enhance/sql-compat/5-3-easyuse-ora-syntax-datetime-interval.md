# Oracle Compatibility - Syntax - DATETIME INTERVAL Arithmetic
---

## 1. Syntax

```sql
DATETIME_expr [+|-] INTERVAL expr type
```

## 2. Definition and Usage

GreatSQL supports `INTERVAL` addition and subtraction on `DATETIME` data.

If the expression on the other side is a date or date-time value, `INTERVAL expr type` is allowed only on either side of the `+` operator. For the `-` operator, `INTERVAL expr type` is allowed only on its right side, because extracting a date or date-time value from a time interval is meaningless.

1. In Oracle, `INTERVAL` can be used as a field type for operations such as table creation, but GreatSQL does not have this type, so `INTERVAL` is currently not supported as a field type.

2. The currently supported scope is only the addition and subtraction of date values or time values with `INTERVAL` in the syntax. Due to the way the `INTERVAL` syntax is currently implemented in GreatSQL, the precision settings inside `INTERVAL` in Oracle syntax, such as `YEAR(3)`, have no practical meaning in the compatible syntax.

## 3. Examples

**Note:** Time types such as `SYSDATE`, `NOW`, and `SYSTIMESTAMP` in GreatSQL currently return time values different from Oracle. Therefore, the examples below use fixed year-month times to demonstrate and compare the results of `INTERVAL` arithmetic with time values in `GreatSQL` and Oracle.

- 1. `'2000-01-01 00:00:00' + INTERVAL '80' SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00' + INTERVAL '80' SECOND   FROM DUAL;
+----------------------------------------------+
| '2000-01-01 00:00:00' + INTERVAL '80' SECOND |
+----------------------------------------------+
| 2000-01-01 00:01:20                          |
+----------------------------------------------+

-- Oracle
-- Set the date format first
SQL> ALTER SESSION SET NLS_DATE_FORMAT='YYYY-MM-DD HH24:MI:SS';
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '80' SECOND   FROM DUAL;

TO_DATE('2000-01-01 00:00:00') + INTERVAL '80' SECOND
-------------------
2000-01-01 00:01:20
```

- 2. `'2000-01-01 00:00:00' - INTERVAL '80' SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00' - INTERVAL '80' SECOND   FROM DUAL;
+----------------------------------------------+
| '2000-01-01 00:00:00' - INTERVAL '80' SECOND |
+----------------------------------------------+
| 1999-12-31 23:58:40                          |
+----------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '80' SECOND   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '80' SECOND
-------------------
1999-12-31 23:58:40
```

- 3. `'2000-01-01 00:00:00' + INTERVAL '80' SECOND(2)`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00' + INTERVAL '80' SECOND(2)   FROM DUAL;
+-------------------------------------------------+
| '2000-01-01 00:00:00' + INTERVAL '80' SECOND(2) |
+-------------------------------------------------+
| 2000-01-01 00:01:20                             |
+-------------------------------------------------+        
        
-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '80' SECOND(2)   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '80' SECOND(2) 
-------------------
2000-01-01 00:01:20
```

- 4. `'2000-01-01 00:00:00' - INTERVAL '80' SECOND(2)`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00' - INTERVAL '80' SECOND(2)   FROM DUAL;
+-------------------------------------------------+
| '2000-01-01 00:00:00' - INTERVAL '80' SECOND(2) |
+-------------------------------------------------+
| 1999-12-31 23:58:40                             |
+-------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '80' SECOND(2)   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '80' SECOND(2) 
-------------------
1999-12-31 23:58:40
```

- 5. `'2000-01-01 00:00:00'  + INTERVAL '80' MINUTE`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '80' MINUTE   FROM DUAL;
+-----------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '80' MINUTE |
+-----------------------------------------------+
| 2000-01-01 01:20:00                           |
+-----------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '80' MINUTE   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '80' MINUTE
-------------------
2000-01-01 01:20:00
```

- 6. `'2000-01-01 00:00:00'  - INTERVAL '80' MINUTE`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '80' MINUTE   FROM DUAL;
+-----------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '80' MINUTE |
+-----------------------------------------------+
| 1999-12-31 22:40:00                           |
+-----------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '80' MINUTE   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '80' MINUTE
-------------------
1999-12-31 22:40:00
```

- 7. `'2000-01-01 00:00:00'  + INTERVAL '15:30' MINUTE TO SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '15:30' MINUTE TO SECOND FROM DUAL;
+------------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '15:30' MINUTE TO SECOND |
+------------------------------------------------------------+
| 2000-01-01 00:15:30                                        |
+------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '15:30' MINUTE TO SECOND FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '15:30' MINUTE TO SECOND
-------------------
2000-01-01 00:15:30
```

- 8. `'2000-01-01 00:00:00'  - INTERVAL '15:30' MINUTE TO SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '15:30' MINUTE TO SECOND FROM DUAL;
+------------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '15:30' MINUTE TO SECOND |
+------------------------------------------------------------+
| 1999-12-31 23:44:30                                        |
+------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '15:30' MINUTE TO SECOND FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '15:30' MINUTE TO SECOND
-------------------
1999-12-31 23:44:30
```

- 9. `'2000-01-01 00:00:00'  + INTERVAL '09:08:07'  HOUR to SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '09:08:07'  HOUR to SECOND FROM DUAL;
+--------------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '09:08:07'  HOUR to SECOND |
+--------------------------------------------------------------+
| 2000-01-01 09:08:07                                          |
+--------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '09:08:07'  HOUR to SECOND FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '09:08:07'  HOUR to SECOND
-------------------
2000-01-01 09:08:07
```

- 10. `'2000-01-01 00:00:00'  - INTERVAL '09:08:07'  HOUR to SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '09:08:07'  HOUR to SECOND FROM DUAL;
+--------------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '09:08:07'  HOUR to SECOND |
+--------------------------------------------------------------+
| 1999-12-31 14:51:53                                          |
+--------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '09:08:07'  HOUR to SECOND FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '09:08:07'  HOUR to SECOND
-------------------
1999-12-31 14:51:53
```

**Note:** In GreatSQL, if the data after `INTERVAL` does not match the type specified by the `type` keyword, NULL is returned.

- 11. `'2000-01-01 00:00:00'  + INTERVAL '09:08:07.666666' HOUR TO SECOND(7)`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '09:08:07.666666' HOUR TO SECOND(7) FROM DUAL;
+-----------------------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '09:08:07.666666' HOUR TO SECOND(7) |
+-----------------------------------------------------------------------+
| NULL                                                                  |
+-----------------------------------------------------------------------+

-- The GreatSQL compatible syntax HOUR TO MICROSECOND can be used instead
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '09:08:07.666666' HOUR TO MICROSECOND(7) FROM DUAL;
+-----------------------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '09:08:07.666666' HOUR TO MICROSECOND(7) |
+----------------------------------------------------------------------+
| 2000-01-01 09:08:07.666666                                           |
+----------------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '09:08:07.666666' HOUR TO SECOND(7) FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '09:08:07.666666' HOUR TO SECOND(7)
-------------------
2000-01-01 09:08:07
```

**Note:** In GreatSQL, if the data after the `INTERVAL` operation does not match the type specified by the `type` keyword, NULL is returned.

- 12. `'2000-01-01 00:00:00'  - INTERVAL '09:08:07.666666' HOUR TO SECOND(7)`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '09:08:07.666666' HOUR TO SECOND(7) FROM DUAL;
+-----------------------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '09:08:07.666666' HOUR TO SECOND(7) |
+-----------------------------------------------------------------------+
| NULL                                                                  |
+-----------------------------------------------------------------------+

-- The GreatSQL compatible syntax HOUR TO MICROSECOND can be used instead
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '09:08:07.666666' HOUR TO MICROSECOND(7) FROM DUAL;
+----------------------------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '09:08:07.666666' HOUR TO MICROSECOND(7) |
+----------------------------------------------------------------------------+
| 1999-12-31 14:51:52.333334                                                 |
+----------------------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '09:08:07.666666' HOUR TO SECOND(7) FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '09:08:07.666666' HOUR TO SECOND(7)
-------------------
1999-12-31 14:51:52
```

- 13. `'2000-01-01 00:00:00'  + INTERVAL '2 1:3:4' DAY to SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '2 1:3:4' DAY to SECOND FROM DUAL;
+-----------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '2 1:3:4' DAY to SECOND |
+-----------------------------------------------------------+
| 2000-01-03 01:03:04                                       |
+-----------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '2 1:3:4' DAY to SECOND FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '2 1:3:4' DAY to SECOND
-------------------
2000-01-03 01:03:04
```

- 14. `'2000-01-01 00:00:00'  - INTERVAL '2 1:3:4' DAY to SECOND`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '2 1:3:4' DAY to SECOND FROM DUAL;
+-----------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '2 1:3:4' DAY to SECOND |
+-----------------------------------------------------------+
|  1999-12-29 22:56:56                                      |
+-----------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '2 1:3:4' DAY to SECOND FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '2 1:3:4' DAY to SECOND
-------------------
1999-12-29 22:56:56
```

- 15. `'2000-01-01 00:00:00'  + INTERVAL '11 10:09' DAY TO MINUTE`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '11 10:09' DAY TO MINUTE FROM DUAL;
+------------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '11 10:09' DAY TO MINUTE |
+------------------------------------------------------------+
| 2000-01-12 10:09:00                                        |
+------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '11 10:09' DAY TO MINUTE FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '11 10:09' DAY TO MINUTE
-------------------
2000-01-12 10:09:00
```

- 16. `'2000-01-01 00:00:00'  - INTERVAL '11 10:09' DAY TO MINUTE`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '11 10:09' DAY TO MINUTE FROM DUAL;
+------------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '11 10:09' DAY TO MINUTE |
+------------------------------------------------------------+
| 1999-12-20 13:51:00                                         |
+------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '11 10:09' DAY TO MINUTE FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '11 10:09' DAY TO MINUTE
-------------------
1999-12-20 13:51:00
```

- 17. `'2000-01-01 00:00:00'  + INTERVAL '100 10' DAY(3) TO HOUR`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '100 10' DAY(3) TO HOUR FROM DUAL;
+-----------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '100 10' DAY(3) TO HOUR |
+-----------------------------------------------------------+
| 2000-04-11 10:00:00                                       |
+-----------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '100 10' DAY(3) TO HOUR FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '100 10' DAY(3) TO HOUR
-------------------
2000-04-11 10:00:00
```

- 18. `'2000-01-01 00:00:00'  - INTERVAL '100 10' DAY(3) TO HOUR`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '100 10' DAY(3) TO HOUR FROM DUAL;
+-----------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '100 10' DAY(3) TO HOUR |
+-----------------------------------------------------------+
| 1999-09-22 14:00:00                                      |
+-----------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '100 10' DAY(3) TO HOUR FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '100 10' DAY(3) TO HOUR
-------------------
1999-09-22 14:00:00
```

- 19. `'2000-01-01 00:00:00'  + INTERVAL '123-2' YEAR(3) TO MONTH`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  + INTERVAL '123-2' YEAR(3) TO MONTH   FROM DUAL;
+------------------------------------------------------------+
| '2000-01-01 00:00:00'  + INTERVAL '123-2' YEAR(3) TO MONTH |
+------------------------------------------------------------+
| 2123-03-01 00:00:00                                        |
+------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  + INTERVAL '123-2' YEAR(3) TO MONTH   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  + INTERVAL '123-2' YEAR(3) TO MONTH
-------------------
2123-03-01 00:00:00
```

- 20. `'2000-01-01 00:00:00'  - INTERVAL '123-2' YEAR(3) TO MONTH`

```sql
-- GreatSQL
greatsql> SELECT '2000-01-01 00:00:00'  - INTERVAL '123-2' YEAR(3) TO MONTH   FROM DUAL;
+------------------------------------------------------------+
| '2000-01-01 00:00:00'  - INTERVAL '123-2' YEAR(3) TO MONTH |
+------------------------------------------------------------+
| 1876-11-01 00:00:00                                         |
+------------------------------------------------------------+

-- Oracle
SQL> SELECT TO_DATE('2000-01-01 00:00:00')  - INTERVAL '123-2' YEAR(3) TO MONTH   FROM DUAL;
TO_DATE('2000-01-01 00:00:00')  - INTERVAL '123-2' YEAR(3) TO MONTH
-------------------
1876-11-01 00:00:00

```

- 21. `'0001-01-01 00:00:00'  -  INTERVAL '123-2' YEAR(3) TO MONTH`

**Note:**

- 1. GreatSQL and Oracle handle extreme years differently.
- 2. When the input time or date value does not satisfy the subtraction with the `INTERVAL` format content, GreatSQL returns NULL.

```sql
-- GreatSQL
greatsql> SELECT '0001-01-01 00:00:00'  -  INTERVAL '123-2' YEAR(3) TO MONTH   FROM DUAL;
+-------------------------------------------------------------+
| '0001-01-01 00:00:00'  -  INTERVAL '123-2' YEAR(3) TO MONTH |
+-------------------------------------------------------------+
| NULL                                                        |
+-------------------------------------------------------------+

SQL> SELECT TO_DATE('0001-01-02 00:00:00')  - INTERVAL '123-2' YEAR(3) TO MONTH   FROM DUAL;
TO_DATE('0001-01-02 00:00:00')  - INTERVAL '123-2' YEAR(3) TO MONTH
-------------------
0123-11-02 00:00:00
```

- 22. `'0001-01-01 00:00:00'  - INTERVAL '100 10' DAY(3) TO HOUR`

```sql
-- GreatSQL
greatsql> SELECT '0001-01-01 00:00:00'  - INTERVAL '100 10' DAY(3) TO HOUR FROM DUAL;
+-----------------------------------------------------------+
| '0001-01-01 00:00:00'  - INTERVAL '100 10' DAY(3) TO HOUR |
+-----------------------------------------------------------+
| 0000-00-00 14:00:00                                       |
+-----------------------------------------------------------+

SQL> SELECT TO_DATE('0001-01 00:00:00')  - INTERVAL '100 10' DAY(3) TO HOUR FROM DUAL;
TO_DATE('0001-01-01 00:00:00')  - INTERVAL '100 10' DAY(3) TO HOUR
-------------------
0000-09-22 14:00:00
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
