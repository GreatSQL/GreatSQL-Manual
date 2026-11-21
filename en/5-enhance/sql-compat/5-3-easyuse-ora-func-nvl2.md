# Oracle Compatibility - Function - NVL2()

---

## 1. Syntax

```sql
NVL2(expr1, expr2, expr3)
```

## 2. Definition and Usage

All three arguments `expr1`, `expr2`, and `expr3` are expressions.

The `NVL2()` function works similarly to `IFNULL()`: if `expr1` is not NULL, it returns `expr2`; when `expr1` is NULL, it returns `expr3`.

If `expr2` and `expr3` are of different types, the return data type is automatically selected from the types of `expr2` and `expr3`, with an appropriate conversion applied.

## 3. Oracle Compatibility Notes

The usage of the `NVL2()` function in GreatSQL is the same as in Oracle, but the return value type differs from Oracle.

In Oracle, if `expr2` and `expr3` are of different types, `expr3` is converted to the type of `expr2`; if the conversion is not possible, an error is raised.

In GreatSQL, whether the result can be aggregated into one of the types of `expr2` or `expr3` is determined based on their types. This handling is consistent with functions such as `NVL()`, `COALESCE()`, `IF()`, and `CASE()`.

## 4. Examples

```sql
-- 1. Examples where expr2 and expr3 are of different types, differing from Oracle
-- GreatSQL return values: integer and floating-point types aggregate into floating-point type
greatsql> SELECT NVL2(1, 2.0, 3.0) + 0, NVL2(1.111111, 3, 2.111111), NVL(3, 2.111111) FROM DUAL;
+-----------------------+-----------------------------+------------------+
| NVL2(1, 2.0, 3.0) + 0 | NVL2(1.111111, 3, 2.111111) | NVL(3, 2.111111) |
+-----------------------+-----------------------------+------------------+
|                   2.0 |                    3.000000 |         3.000000 |
+-----------------------+-----------------------------+------------------+

-- Oracle return values: expr3 is converted to the type of expr2
SQL> SELECT NVL2(1, 2.0, 3.0) + 0, NVL2(1.111111, 3, 2.111111), NVL(3,2.111111) FROM DUAL;

NVL2(1,2.0,3.0)+0 NVL2(1.111111,3,2.111111) NVL(3,2.111111)
----------------- ------------------------- ---------------
                2                         3               3

-- GreatSQL return values: integer and string types aggregate into string type
greatsql> SELECT NVL2(NULL, 1, 'GreatSQL'), NVL(1, 'GreatSQL') FROM DUAL;
+---------------------------+--------------------+
| NVL2(NULL, 1, 'GreatSQL') | NVL(1, 'GreatSQL') |
+---------------------------+--------------------+
| GreatSQL                  | 1                  |
+---------------------------+--------------------+

-- Oracle raises an error: the expr3 string cannot be directly converted to the expr2 integer type
SQL> SELECT NVL2(NULL, 1, 'GreatSQL'), NVL(1, 'GreatSQL') FROM DUAL;
SELECT NVL2(NULL, 1, 'GreatSQL'), NVL(1, 'GreatSQL') FROM DUAL
                                *
ERROR at line 1:
ORA-01722: invalid number


-- 2. Handling of other functions in GreatSQL
greatsql> SELECT NVL2(NULL, 1, 'GreatSQL'), if(NULL, 1, 'GreatSQL'), COALESCE(NULL, 1, 'GreatSQL'), NVL(3306, 'GreatSQL') FROM DUAL;
+---------------------------+-------------------------+-------------------------------+----------------------+
| NVL2(NULL, 1, 'GreatSQL') | if(NULL, 1, 'GreatSQL') | COALESCE(NULL, 1, 'GreatSQL') | NVL(3306, 'GreatSQL') |
+---------------------------+-------------------------+-------------------------------+----------------------+
| GreatSQL                  | GreatSQL                | 1                             | 3306                 |
+---------------------------+-------------------------+-------------------------------+----------------------+

-- 3. Normal cases
-- GreatSQL
greatsql> SELECT NVL2(0, 'ERROR', 'THIS'), NVL2(1, 'IS', 'ERROR'), NVL2(NULL, 'ERROR', 'A'), NVL2(1, 2, 3) FROM DUAL;
+--------------------------+------------------------+--------------------------+---------------+
| NVL2(0, 'ERROR', 'THIS') | NVL2(1, 'IS', 'ERROR') | NVL2(NULL, 'ERROR', 'A') | NVL2(1, 2, 3) |
+--------------------------+------------------------+--------------------------+---------------+
| ERROR                    | IS                     | A                        |             2 |
+--------------------------+------------------------+--------------------------+---------------+

-- Oracle
SQL> SELECT NVL2(0, 'ERROR', 'THIS'), NVL2(1, 'IS', 'ERROR'), NVL2(NULL, 'ERROR', 'A'), NVL2(1, 2, 3) FROM DUAL;

NVL2( NV N NVL2(1,2,3)
----- -- - -----------
ERROR IS A           2

-- GreatSQL, all return NULL
greatsql> SELECT NVL2('GreatSQL', NULL ,3306), NVL2(NULL, 3306 ,NULL), NVL2(NULL, 3306, '') FROM DUAL;
+------------------------------+------------------------+----------------------+
| NVL2('GreatSQL', NULL ,3306) | NVL2(NULL, 3306 ,NULL) | NVL2(NULL, 3306, '') |
+------------------------------+------------------------+----------------------+
|                         NULL |                   NULL | NULL                 |
+------------------------------+------------------------+----------------------+

-- Oracle, all return empty values
SQL> SELECT NVL2('GreatSQL', NULL ,3306), NVL2(NULL, 3306 ,NULL), NVL2(NULL, 3306, '') FROM DUAL;

NVL2('GREATSQL',NULL,3306) NVL2(NULL,3306,NULL) NVL2(NULL,3306,'')
-------------------------- -------------------- ------------------


SQL>
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
