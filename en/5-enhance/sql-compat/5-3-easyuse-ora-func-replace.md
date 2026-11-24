# Oracle Compatibility - Function - REPLACE()

---

## 1. Syntax

```sql
REPLACE(char, search_string [, replace_string])
```

## 2. Definition and Usage

The `REPLACE()` function matches and replaces the original string according to the given strings, and returns the replaced string.

Parameters:
- `char`: the string to be replaced.
- `search_string`: the search string.
- `replace_string`: the replacement string. This parameter is optional. When it is not specified, `replace_string` is treated as an empty string.

When `char`, `search_string`, or `replace_string` contains escape characters (for example: `\0`, `\'`, `''`, `\"`, `\\`, `\b`, `\B`, `\n`, `\N`, `\r`, `\R`, `\t`, `\T`, `\z`, `\Z`), they are not treated as 2 characters but as 1 character.

## 3. Oracle Compatibility Notes

Since GreatSQL natively supports the `REPLACE()` function, to use the extended `REPLACE()` function in GreatSQL, you need to run `SET sql_mode = ORACLE;` first to activate Oracle compatibility mode.

In the native default mode (`SET sql_mode = DEFAULT`), the parameter `replace_string` must be specified and cannot be empty.

When the value of `replace_string` is NULL, the return results also differ between the DEFAULT and ORACLE modes.

## 4. Examples

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SELECT REPLACE('GreatSQL tcp port 3306', '3306');
+-------------------------------------------+
| REPLACE('GreatSQL tcp port 3306', '3306') |
+-------------------------------------------+
| GreatSQL tcp port                         |
+-------------------------------------------+

greatsql> SELECT REPLACE('GreatSQL tcp port 3306 and 33060', '3306');
+-----------------------------------------------------+
| REPLACE('GreatSQL tcp port 3306 and 33060', '3306') |
+-----------------------------------------------------+
| GreatSQL tcp port  and 0                            |
+-----------------------------------------------------+

greatsql> SELECT REPLACE('GreatSQL tcp port 3306 and 33060', '3', '4');
+-------------------------------------------------------+
| REPLACE('GreatSQL tcp port 3306 and 33060', '3', '4') |
+-------------------------------------------------------+
| GreatSQL tcp port 4406 and 44060                      |
+-------------------------------------------------------+

greatsql> SELECT REPLACE('000012003', '0');
+---------------------------+
| REPLACE('000012003', '0') |
+---------------------------+
| 123                       |
+---------------------------+

greatsql> SELECT REPLACE('000012003', '0', ' ');
+--------------------------------+
| REPLACE('000012003', '0', ' ') |
+--------------------------------+
|     12  3                      |
+--------------------------------+

greatsql> SELECT REPLACE('GreatSQL', 'a', NULL);
+--------------------------------+
| REPLACE('GreatSQL', 'a', NULL) |
+--------------------------------+
| GretSQL                        |
+--------------------------------+

-- The result differs in DEFAULT mode in this last case
greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT REPLACE('GreatSQL', 'a', NULL);
+--------------------------------+
| REPLACE('GreatSQL', 'a', NULL) |
+--------------------------------+
| NULL                           |
+--------------------------------+

-- In DEFAULT mode, the third parameter cannot be omitted
greatsql> SELECT REPLACE('GreatSQL', 'a');
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ')' at line 1
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
