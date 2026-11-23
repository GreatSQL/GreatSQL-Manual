# Oracle Compatibility - Function - SYSTIMESTAMP()

---

## 1. Syntax

```sql
SYSTIMESTAMP
SYSTIMESTAMP()
```

## 2. Definition and Usage

The `SYSTIMESTAMP()` function returns the current date and time, similar to the native `NOW()` function. When the number of fractional seconds digits is not explicitly specified, the default value for fractional seconds is 6.

## 3. Examples

```sql
-- The default number of fractional seconds digits is 6
greatsql> SELECT SYSTIMESTAMP FROM DUAL;
greatsql> SELECT SYSTIMESTAMP, SYSTIMESTAMP() FROM DUAL;
+----------------------------+----------------------------+
| SYSTIMESTAMP               | SYSTIMESTAMP()             |
+----------------------------+----------------------------+
| 2023-11-02 17:43:25.990131 | 2023-11-02 17:43:25.990131 |
+----------------------------+----------------------------+

-- Specify the number of fractional seconds digits explicitly
greatsql> SELECT SYSTIMESTAMP(0), SYSTIMESTAMP(3) FROM DUAL;
+---------------------+-------------------------+
| SYSTIMESTAMP(0)     | SYSTIMESTAMP(3)         |
+---------------------+-------------------------+
| 2023-11-02 17:43:45 | 2023-11-02 17:43:45.189 |
+---------------------+-------------------------+

-- An error is reported if the specified number of fractional seconds digits is out of range
greatsql> SELECT SYSTIMESTAMP(10) FROM DUAL;
ERROR 1426 (42000): Too-big precision 10 specified for 'now'. Maximum is 6.

greatsql> SELECT SYSTIMESTAMP(-1) FROM DUAL;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '-1) FROM DUAL' at line 1
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
