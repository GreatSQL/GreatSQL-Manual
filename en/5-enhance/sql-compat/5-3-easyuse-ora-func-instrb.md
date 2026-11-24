# Oracle Compatibility - Function - INSTRB()

---

## 1. Syntax

```sql
INSTRB( string, sub_string [, start_position [, nth_appearance ] ] )
```

## 2. Definition and Usage

Parameters:

- `string`, the string in which to search for the substring.
- `sub_string`, the substring to search for.
- `start_position`, an optional parameter that specifies the byte position at which the search begins. The default value is 1. The `INSTRB()` function counts `start_position` bytes from the end of the string; if a negative value is specified, the search proceeds toward the beginning of the string.
- `nth_appearance`, an optional parameter that specifies the n-th occurrence of the substring to match. The default value is 1.

## 3. Oracle Compatibility Notes

The `INSTRB()` function searches for the `sub_string` in the `string` by bytes.

**Note:** When the types of `string` and `sub_string` differ, the type conversion handling may differ between GreatSQL and Oracle. Oracle may perform special conversions (for example, when `sub_string` is a decimal type, the integer part is dropped when converting to a character type if the integer part is 0). For example:

```
-- Returns 1 in GreatSQL
greatsql> SELECT INSTRB('0.3333', 0.3) FROM DUAL;
+-----------------------+
| INSTRB('0.3333', 0.3) |
+-----------------------+
|                     1 |
+-----------------------+

-- Returns 2 in Oracle
SQL> SELECT INSTRB('0.3333', 0.3) FROM DUAL;

INSTRB('0.3333',0.3)
--------------------
                   2
-- In Oracle, the decimal and string representations are as follows
SQL> SELECT 0.3, '0.3' FROM DUAL;

       0.3 '0.
---------- ---
        .3 0.3
```

## 4. Examples

```
greatsql> SELECT INSTRB('GreatSQL具备高可用、高性能、高兼容、高安全等多个核心特性', '高');
+---------------------------------------------------------------------------------------------------+
| INSTRB('GreatSQL具备高可用、高性能、高兼容、高安全等多个核心特性', '高')                          |
+---------------------------------------------------------------------------------------------------+
|                                                                                                15 |
+---------------------------------------------------------------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL具备高可用、高性能、高兼容、高安全等多个核心特性', '高', 1, 1);
+---------------------------------------------------------------------------------------------------------+
| INSTRB('GreatSQL具备高可用、高性能、高兼容、高安全等多个核心特性', '高', 1, 1)                          |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                      15 |
+---------------------------------------------------------------------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL具备高可用、高性能、高兼容、高安全等多个核心特性', '高', 1, 2);
+---------------------------------------------------------------------------------------------------------+
| INSTRB('GreatSQL具备高可用、高性能、高兼容、高安全等多个核心特性', '高', 1, 2)                          |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                      27 |
+---------------------------------------------------------------------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL is a branch of MySQL', 'S');
+----------------------------------------------+
| INSTRB('GreatSQL is a branch of MySQL', 'S') |
+----------------------------------------------+
|                                            6 |
+----------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL is a branch of MySQL', 'S', 1, 2);
+----------------------------------------------------+
| INSTRB('GreatSQL is a branch of MySQL', 'S', 1, 2) |
+----------------------------------------------------+
|                                                 27 |
+----------------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL is a branch of MySQL', 'S', -1);
+--------------------------------------------------+
| INSTRB('GreatSQL is a branch of MySQL', 'S', -1) |
+--------------------------------------------------+
|                                               27 |
+--------------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL is a branch of MySQL', 'S', -1, 2);
+-----------------------------------------------------+
| INSTRB('GreatSQL is a branch of MySQL', 'S', -1, 2) |
+-----------------------------------------------------+
|                                                   6 |
+-----------------------------------------------------+

-- The fractional part of the parameter is converted to an integer
greatsql> SELECT INSTRB('GreatSQL is a branch of MySQL', 'S', 1, 1.6);
+------------------------------------------------------+
| INSTRB('GreatSQL is a branch of MySQL', 'S', 1, 1.6) |
+------------------------------------------------------+
|                                                    6 |
+------------------------------------------------------+

greatsql> SELECT INSTRB('GreatSQL is a branch of MySQL', 'S', 0.6, 1);
+------------------------------------------------------+
| INSTRB('GreatSQL is a branch of MySQL', 'S', 0.6, 1) |
+------------------------------------------------------+
|                                                    0 |
+------------------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
