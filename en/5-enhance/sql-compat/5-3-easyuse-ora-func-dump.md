# Oracle Compatibility - Function - DUMP()

---

## 1. Syntax

```sql
DUMP( expr[, return_format] [, start_position] [, length] )
```

## 2. Definition and Usage

The function has 4 basic parameters; at least `expr` must be provided.

- `expr`, the expression to be analyzed; it can be a number, a string, or values of various types.

**Note:**

  - Large object types (such as `BLOB`, `CLOB`, `JSON`, etc.), enum types, and spatial types are not supported.
  - In addition, temporary variable parameters such as `@a` in `set @a=xxx;` are not supported for now.
  - When `expr` is NULL, NULL is returned directly.

- `return_fmt`, sets the format of the returned value, with 6 usages:
  - 2: returns the result value in binary.
  - 8: returns the result value in octal.
  - 10: returns the result value in decimal (default).
  - 16: returns the result value in hexadecimal.
  - 17 or greater: returns the result value as single characters.
  - 1000: adding 1000 to any of the first four formats indicates that the character set used to process the data (defined by the system option `character_set_system`) is included in the return value.

**Note:** When `return_fmt` does not match any of the formats above, **decimal** (base 10) is used as the default return format.

- `start_position`, specifies the starting character position of the returned data; if the parameter exceeds the actual length of `expr`, NULL is returned.

- `length`, specifies the length of the returned characters; if the parameter exceeds the actual length of `expr`, the remaining data after `start_position` is returned.

## 3. Examples

```
-- 1. Parameter expr is NULL
greatsql> SELECT DUMP(NULL);
+------------+
| DUMP(NULL) |
+------------+
| NULL       |
+------------+

-- 2. Except for the expr parameter, other parameters use default values (data is returned in decimal by default)
greatsql> SELECT DUMP('GreatSQL');
+-----------------------------------------------+
| DUMP('GreatSQL')                              |
+-----------------------------------------------+
| Type=15 Len=10:8,0,71,114,101,97,116,83,81,76 |
+-----------------------------------------------+

-- 3. Data starting from position 3 is returned in decimal
greatsql> SELECT DUMP('GreatSQL', 10, 3);
+-------------------------------------------+
| DUMP('GreatSQL', 10, 3)                   |
+-------------------------------------------+
| Type=15 Len=10:71,114,101,97,116,83,81,76 |
+-------------------------------------------+

-- 4. Data is returned in binary
greatsql> SELECT DUMP('GreatSQL', 2, 3);
+--------------------------------------------------------------------------------+
| DUMP('GreatSQL', 2, 3)                                                         |
+--------------------------------------------------------------------------------+
| Type=15 Len=10:1000111,1110010,1100101,1100001,1110100,1010011,1010001,1001100 |
+--------------------------------------------------------------------------------+

-- 5. Data is returned in decimal
greatsql> SELECT DUMP('GreatSQL', 10);
+-----------------------------------------------+
| DUMP('GreatSQL', 10)                          |
+-----------------------------------------------+
| Type=15 Len=10:8,0,71,114,101,97,116,83,81,76 |
+-----------------------------------------------+

-- 6. Data is returned in hexadecimal
greatsql> SELECT DUMP('GreatSQL', 16);
+----------------------------------------------+
| DUMP('GreatSQL', 16)                         |
+----------------------------------------------+
| Type=15 Len=10:08,00,47,72,65,61,74,53,51,4c |
+----------------------------------------------+

-- 7. Data is returned as single characters
greatsql> SELECT DUMP('GreatSQL', 17);
+-------------------------------+
| DUMP('GreatSQL', 17)          |
+-------------------------------+
| Type=15 Len=8:G,r,e,a,t,S,Q,L |
+-------------------------------+

-- 8. Data is returned in decimal, with character set information displayed
greatsql> SELECT DUMP('GreatSQL', 1010);
+--------------------------------------------------------------------+
| DUMP('GreatSQL', 1010)                                             |
+--------------------------------------------------------------------+
| Type=15 Len=10 CharacterSet=utf8mb3:8,0,71,114,101,97,116,83,81,76 |
+--------------------------------------------------------------------+

-- 9. Data is returned in hexadecimal, with character set information displayed
greatsql> SELECT DUMP('GreatSQL', 1016);
+-------------------------------------------------------------------+
| DUMP('GreatSQL', 1016)                                            |
+-------------------------------------------------------------------+
| Type=15 Len=10 CharacterSet=utf8mb3:08,00,47,72,65,61,74,53,51,4c |
+-------------------------------------------------------------------+

-- 10. Data is returned as single characters, with character set information displayed
greatsql> SELECT DUMP('GreatSQL', 1017);
+----------------------------------------------------+
| DUMP('GreatSQL', 1017)                             |
+----------------------------------------------------+
| Type=15 Len=8 CharacterSet=utf8mb3:G,r,e,a,t,S,Q,L |
+----------------------------------------------------+

-- 11. The length parameter exceeds the actual length of expr
greatsql> SELECT DUMP('GreatSQL', 16, 3, 99);
+----------------------------------------+
| DUMP('GreatSQL', 16, 3, 99)            |
+----------------------------------------+
| Type=15 Len=10:47,72,65,61,74,53,51,4c |
+----------------------------------------+

-- 12. The start_position parameter exceeds the actual length of expr
greatsql> SELECT DUMP('GreatSQL', 16, 99, 3);
+-----------------------------+
| DUMP('GreatSQL', 16, 99, 3) |
+-----------------------------+
| NULL                        |
+-----------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
