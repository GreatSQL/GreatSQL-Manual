# Oracle Compatibility - Syntax - DATETIME Arithmetic
---

## 1. Syntax
```
SELECT SYSDATE + 1 FROM DUAL;
SELECT SYSDATE - 1 FROM DUAL;
SELECT SYSDATE - SYSDATE FROM DUAL;
```
## 2. Definition and Usage

GreatSQL supports arithmetic operations on `DATETIME` data, such as adding 1 second or 1 day. To use this operation behavior mode, you need to switch to ORACLE mode.

1. Only addition and subtraction are supported; other operation types are not supported.
2. Before arithmetic operations on the `TIME` type, it is first converted to the `DATETIME` type.
3. The timestamp value is first converted to a date value, and the constants in `NUMBER` arithmetic date-time and interval expressions are interpreted as days.
4. The year range is [0,9999]. Years before the common era (BC) are not supported. When an overflow occurs, **NULL** is returned with a warning.
5. When the calculation result contains an infinite repeating decimal, only **10 digits** are kept by default, that is: default value of `div_precincrement` option (4) + 6 = 10.
6. When performing arithmetic on the YEAR type, the default conversion fails, returning **NULL** with a warning.

```
greatsql> SET sql_mode = ORACLE;

-- Example 1: When merging multiple query result sets, or when a value is used as a query condition
greatsql> SELECT TO_DATE('00:00:00','HH24:MI:SS') -  TO_DATE('00:00:01','HH24:MI:SS') FROM DUAL
 UNION ALL
 SELECT TO_DATE('00:00:00','HH24:MI:SS') -  TO_DATE('00:00:01','HH24:MI:SS') FROM DUAL;
+----------------------------------------------------------------------+
| to_date('00:00:00','HH24:MI:SS') -  to_date('00:00:01','HH24:MI:SS') |
+----------------------------------------------------------------------+
|                                                        -0.0000115741 |
|                                                        -0.0000115741 |
+----------------------------------------------------------------------+

- Example 2: When a single query calculation result is displayed as a string, the number of retained decimal places is no longer limited to 10
greatsql> SELECT TO_DATE('00:00:00','HH24:MI:SS') -  TO_DATE('00:00:01','HH24:MI:SS');
+----------------------------------------------------------------------+
| to_date('00:00:00','HH24:MI:SS') -  to_date('00:00:01','HH24:MI:SS') |
+----------------------------------------------------------------------+
|                                                -0.000011574074074074 |
+----------------------------------------------------------------------+
```

**DATETIME type arithmetic compatibility matrix**

| Operand & Operator | DATETIME | TIMESTAMP | TIME | NUMBER |
| -- | -- | -- | -- | -- |
| **DATETIME** | - | - | - | - |
| + | - | - | - | DATETIME |
| - | DECIMAL | DECIMAL | DECIMAL | DATETIME |
| * | - | - | - | - |
| / | - | - | - | - |
| **TIMESTAMP** | - | - | - | - |
| + | - | - | - | TIMESTAMP |
| - | DECIMAL | DECIMAL | DECIMAL | TIMESTAMP |
| * | - | - | - | - |
| / | - | - | - | - |
| **DATE** | | | | |
| + | - | - | - | DATETIME |
| - | DECIMAL | DECIMAL | DECIMAL | DATETIME |
| * | - | - | - | - |
| / | - | - | - | - |
| **TIME** | - | - | - | - |
| + | - | - | - | DATETIME |
| - | DECIMAL | DECIMAL | DECIMAL | DATETIME |
| * | - | - | - | - |
| / | - | - | - | - |
| NUMBER | - | - | - | - |
| + | DATETIME | TIMESTAMP | DATETIME | NA |
| - | DATETIME | TIMESTAMP | DATETIME | NA |
| * | - | - | - | NA |
| / | - | - | - | NA |

The table above is the arithmetic compatibility matrix for the `DATETIME` type, where the dash represents unsupported operations.

## 3. Differences from Oracle

1. The default precision of the date difference result is inconsistent. In GreatSQL, 10 decimal places are kept by default, while in Oracle, different precision data is used depending on the case.
2. The maximum and minimum time ranges are inconsistent. In GreatSQL, the year range is [0,9999], while in Oracle the range is [-4713,9999].
3. The behavior of string arithmetic differs. For example, for the string 'a', the conversion fails with an error in Oracle, while in GreatSQL it is converted to '0' with a warning before the operation is performed.
4. In GreatSQL, `TIMESTAMP - TIMESTAMP` returns a `DECIMAL` type, while in Oracle it returns an `INTERVAL` type.

## 4. Examples

```
greatsql> SET sql_mode = ORACLE;

greatsql> SET TIMESTAMP = 1;

-- +1/2 is equivalent to +12 hours
greatsql> SELECT SYSDATE +1/2 ;
+----------------------------+
| SYSDATE +1/2               |
+----------------------------+
| 1970-01-01 12:00:01.000000 |
+----------------------------+

-- Equivalent to +1 day
greatsql> SELECT SYSDATE +1  ;
+----------------------------+
| SYSDATE +1                 |
+----------------------------+
| 1970-01-02 00:00:01.000000 |
+----------------------------+

-- Equivalent to -1 day
greatsql> SELECT SYSDATE -1  ;
+----------------------------+
| SYSDATE -1                 |
+----------------------------+
| 1969-12-31 00:00:01.000000 |
+----------------------------+

greatsql> SELECT SYSDATE - SYSDATE;
+-------------------+
| SYSDATE - SYSDATE |
+-------------------+
|                 0 |
+-------------------+

-- 'a' is converted to '0' before the operation, with a warning
greatsql> SELECT  SYSDATE + 'a';
+----------------------------+
| SYSDATE + 'a'              |
+----------------------------+
| 1970-01-01 00:00:01.000000 |
+----------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------------------------------+
| Level   | Code | Message                               |
+---------+------+---------------------------------------+
| Warning | 1292 | Truncated incorrect DOUBLE value: 'a' |
+---------+------+---------------------------------------+

-- Multiplication/division operations are not supported
greatsql> SELECT SYSDATE *  10;
ERROR 7038 (42000): in oracle_mode: date * LONGLONG not allowed

greatsql> SELECT SYSDATE / 10;
ERROR 7038 (42000): in oracle_mode: date / LONGLONG not allowed

greatsql> SELECT SYSDATE + SYSDATE;
ERROR 7038 (42000): in oracle_mode: date + DATETIME not allowed

greatsql> SELECT SYSDATE + 1000000000000;
+-------------------------+
| SYSDATE + 1000000000000 |
+-------------------------+
| NULL                    |
+-------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+--------------------------------------------+
| Level   | Code | Message                                    |
+---------+------+--------------------------------------------+
| Warning | 1441 | Datetime function: datetime field overflow |
+---------+------+--------------------------------------------+

-- Arithmetic cannot be performed on YEAR
greatsql> SELECT CAST(2023 AS YEAR) + 1;
+------------------------+
| CAST(2023 AS YEAR) + 1 |
+------------------------+
| NULL                   |
+------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+----------------------------------+
| Level   | Code | Message                          |
+---------+------+----------------------------------+
| Warning | 1292 | Incorrect datetime value: '2023' |
+---------+------+----------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
