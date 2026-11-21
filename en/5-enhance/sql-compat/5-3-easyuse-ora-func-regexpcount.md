# Oracle Compatibility - Function - REGEXP_COUNT()

---

## 1. Syntax

```sql
REGEXP_COUNT ( source_char, pattern [, position [, match_param]])
```

## 2. Definition and Usage

The `REGEXP_COUNT` function counts the number of occurrences of the regular expression pattern `pattern` in the string `source_char`. If no match is found, it returns 0.

- `source_char`: the string to search for matches.
- `pattern`: a regular expression or character text.
- `position`: a positive integer, the position at which the search for matches begins.
- `match_param`: the regular expression match rule parameter. The following optional values are supported (if not set, the system is case-insensitive by default):
  - `c`: case-sensitive matching.
  - `i`: case-insensitive matching, the default match rule.
  - `m`: multiline mode. Recognizes line terminators in the string. The default behavior is to match line terminators only at the beginning and end of the string expression.
  - `n`: causes the period `.` to match line terminators. If this parameter is omitted, the period does not match line breaks.
  - `u`: matches only Unix line endings. Only line breaks are recognized as ending lines with `.`, `^`, and `$`.

## 3. Examples

```
-- 1. match_param with case-sensitive matching
greatsql> SELECT REGEXP_COUNT('GreatSQL', 'greatsql', 1, 'c');
+----------------------------------------------+
| REGEXP_COUNT('GreatSQL', 'greatsql', 1, 'c') |
+----------------------------------------------+
|                                            0 |
+----------------------------------------------+

-- 2. match_param with case-insensitive matching
greatsql> SELECT REGEXP_COUNT('GreatSQL', 'greatsql', 1, 'i');
+----------------------------------------------+
| REGEXP_COUNT('GreatSQL', 'greatsql', 1, 'i') |
+----------------------------------------------+
|                                            1 |
+----------------------------------------------+

-- 3. Number of matches for an expression, case-sensitive
greatsql> SELECT REGEXP_COUNT('GreatSQL', '[a-z]', 1, 'c');
+-------------------------------------------+
| REGEXP_COUNT('GreatSQL', '[a-z]', 1, 'c') |
+-------------------------------------------+
|                                         4 |
+-------------------------------------------+

-- 4. Number of matches for an expression, case-insensitive
greatsql> SELECT REGEXP_COUNT('GreatSQL', '[a-z]', 1, 'i');
+-------------------------------------------+
| REGEXP_COUNT('GreatSQL', '[a-z]', 1, 'i') |
+-------------------------------------------+
|                                         8 |
+-------------------------------------------+

-- 5. Multiline mode, using . to match line breaks
greatsql> SELECT REGEXP_COUNT('fo
fa
^
$

^', '.',1,'mn');
+------------------------------------------+
|                                       12 |
+------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
