# Oracle Compatibility - Function - SQLCODE()/SQLERRM()

---

## 1. Syntax

```sql
SQLCODE()

SQLERRM()

SQLERRM( errcode )
```

## 2. Definition and Usage

The `SQLCODE()` function returns the error number and error message, and is used together with `exception`.

The `SQLERRM()` function returns the error message of the specified error code. Its main usages are as follows:

1. Run `SQLERRM()` to get the message of the last error that occurred, used together with `exception`.
2. Run `SQLERRM(sqlcode)` to get the error message. If the specified error number is the same as the current error, the complete error message is returned.
3. Run `SQLERRM(sqlcode)` to get the error message. If the specified error number differs from the current error, the error message corresponding to the specified error number is returned (it may contain placeholders).

## 3. Oracle Compatibility Notes

`SQLCODE()` returns the error number natively defined in GreatSQL, not the Oracle error number.

When the executed SQL statement or function does not report an error, no exception is triggered, and the return value is 0.

`SQLCODE()` must be used in a stored procedure or function, and cannot be used standalone.

`SQLERRM()` returns the error message natively defined in GreatSQL. If a non-existent error message is specified, `errcode: Unknown error` is returned.

## 4. Examples

```
-- Switch to Oracle mode first
greatsql> SET sql_mode = ORACLE;

-- Modify DELIMITER
greatsql> DELIMITER //

-- Query a non-existent table t1
-- On the first execution, no error is reported and SQLCODE = 0;
-- SQLERRM without specifying SQLCODE returns the most recent error
-- SQLERRM with SQLCODE specified still returns the most recent error
-- SQLERRM with a custom SQLCODE specified returns the corresponding error message (not the most recent error)
greatsql> BEGIN
SELECT SQLCODE, SQLERRM;
SELECT * FROM t1;
EXCEPTION
WHEN OTHERS THEN
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret1;
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret2;
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret3;
END; //
+---------+-----------------------------------+
| SQLCODE | SQLERRM                           |
+---------+-----------------------------------+
|       0 | 0 : normal, successful completion |
+---------+-----------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret1                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret2                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret3                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)


-- Specifying SQLCODE at the beginning does not affect the real SQLCODE obtained later
greatsql> BEGIN
SELECT SQLERRM(105400) ;
SELECT SQLCODE, SQLERRM;
SELECT * FROM t1;
EXCEPTION
WHEN OTHERS THEN
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret1;
END; //
+------------------------+
| SQLERRM(105400)        |
+------------------------+
| 105400 : Unknown error |
+------------------------+
1 row in set (0.00 sec)

+---------+-----------------------------------+
| SQLCODE | SQLERRM                           |
+---------+-----------------------------------+
|       0 | 0 : normal, successful completion |
+---------+-----------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret1                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
