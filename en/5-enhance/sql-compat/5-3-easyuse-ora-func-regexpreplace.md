# Oracle Compatibility - Function - REGEXP_REPLACE()

---

## 1. Syntax

```sql
REGEXP_REPLACE ( source_char, pattern
                 [, replace_string
                    [, position
                       [, occurrence
                          [, match_param ]
                       ]
                    ]
                 ]
               )
```

## 2. Definition and Usage

The `REGEXP_REPLACE()` function is an extension of the `REPLACE()` function, used to perform match-and-replace operations with regular expressions. By default, the function returns `source_char` with each occurrence of the regular expression pattern replaced by `replace_string`; the returned string has the same character set as `source_char`.

The parameters are described as follows:

- `source_char` is the source string, a character expression used as the search target for matching.
  - When NULL is specified, the result returns NULL.
  - When an empty string is specified, the result returns an empty string.

- `pattern` is the regular expression pattern. It follows the Unicode Regular Expressions guidelines; for details, please read [ICU's Regular Expressions](https://unicode-org.github.io/icu/userguide/strings/regexp.html).
  - When NULL is specified, the source string is returned.
  - When an empty string or an invalid regular expression is specified, an error is returned.

- `replace_string` is the string used to replace the portions of the source string matched by the regular expression. It can contain backreferences to subexpressions in the form `\n`, where n is a digit from 1 to 9. To include a backslash `\`, it must be preceded by an escape character, which is also a backslash `\`. For example, to replace with `\2`, enter `\\2`.
  - When NULL or an empty string is specified, the matched portions in the source string are replaced with an empty string.

- `position` is a positive integer indicating the character position in the source string at which the search for matches begins. When it is greater than the source string length, the source string is returned. The default value is 1.

- `occurrence` is a non-negative integer indicating the match occurrence to replace:
  - If 0 is specified, all occurrences are replaced.
  - If a positive integer n is specified, the n-th occurrence is replaced. If `occurrence` is greater than 1, the search for the second occurrence starts from the first character after the first occurrence of `pattern`, and so on.

- `match_param` specifies how the matching is performed:
  - 'i': case-insensitive matching.
  - 'c': case-sensitive matching.
  - 'n': allows `.` to match line breaks; if omitted, `.` does not match line breaks.
  - 'm': treats the source string as multiple lines. `^` and `$` are interpreted as the start and end of any line in the source string, rather than only the start or end of the entire source string. If omitted, the source string is treated as a single line.
  - 'x': ignores whitespace in the regular expression pattern.

  - If contradictory option characters are specified in `match_param`, the rightmost one takes precedence.
  - If `match_param` is omitted:
    - The default case sensitivity is determined by the collation of the `REGEXP_REPLACE()` function.
    - `.` does not match line breaks.
    - The source string is treated as a single line.

## 3. Oracle Compatibility Notes

1. In Oracle, quantifier metacharacters in regular expressions can have an empty preceding expression, while GreatSQL does not support this.

| REGEXP_REPLACE input               | Oracle                      | GreatSQL                                                                        |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| REGEXP_REPLACE('123abc', '*', 'xxx')   | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '+', 'xxx')   | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '?', 'xxx')   | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '{2}', 'xxx') | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |

2. Oracle supports illegal brace expressions in regular expressions, while GreatSQL does not.

| REGEXP_REPLACE input               | Oracle | GreatSQL                                                                        |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| REGEXP_REPLACE('123abc', '{', 'xxx')  | 123abc | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '}', 'xxx')  | 123abc | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '{}', 'xxx') | 123abc | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |

3. Oracle allows empty strings in regular expressions, while GreatSQL does not.

| REGEXP_REPLACE input                             | Oracle                      | GreatSQL                                                                 |
| ----------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| REGEXP_REPLACE('123abc', ' ', 'xxx', 1, 0, 'x') | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3685 (HY000): Illegal argument to a regular expression.           |
| REGEXP_REPLACE('123abc', '\', 'xxx', 1, 0, 'x') | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3689 (HY000): Unrecognized escape sequence in regular expression. |

**Other notes**

1. There is no empty string in Oracle, so to obtain the same results as Oracle when handling empty strings in GreatSQL, you need to modify `sql_mode` with `SET sql_mode = EMPTYSTRING_EQUAL_NULL`.

2. In Oracle, the backslash `\` does not represent an escape character, so to obtain the same results as Oracle when handling backslashes `\` in GreatSQL, you need to modify `sql_mode` with `SET sql_mode = NO_BACKSLASH_ESCAPES`.

3. If case sensitivity is not specified in the last parameter, the default case sensitivity is determined by the collation of the `REGEXP_REPLACE()` function (that is, the collation of the first argument), so the case-related results may differ from Oracle.

For example, suppose the collation of the `REGEXP_REPLACE()` function is `BINARY` in Oracle and `utf8mb4_vi_0900_ai_ci` in GreatSQL:

| REGEXP_REPLACE input           | Oracle | GreatSQL |
| ----------------------------- | ------ | ------- |
| REGEXP_REPLACE('A', 'a', 'G') | A      | G       |

## 4. Examples

```
greatsql> SET sql_mode = 'ORACLE,EMPTYSTRING_EQUAL_NULL,NO_BACKSLASH_ESCAPES';

greatsql> SELECT REGEXP_REPLACE('111.222.3333', '([[:digit:]]{3})\.([[:digit:]]{3})\.([[:digit:]]{4})', '(\1) \2-\3') AS REGEXP_REPLACE FROM DUAL;
+----------------+
| REGEXP_REPLACE |
+----------------+
| (1) 2-3        |
+----------------+

greatsql> CREATE TABLE t_regexp (empName varchar2(20), emailID varchar2(20));
greatsql> INSERT INTO t_regexp (empName, emailID) VALUES ('John Doe', 'johndoe@example.com'), ('Jane Doe', 'janedoe@example.com');

greatsql> SELECT * FROM t_regexp;
+----------+---------------------+
| empName  | emailID             |
+----------+---------------------+
| John Doe | johndoe@example.com |
| Jane Doe | janedoe@example.com |
+----------+---------------------+

greatsql> SELECT empName, REGEXP_REPLACE (empName, 'Jane', 'John') AS REGEXP_REPLACE FROM t_regexp;
+----------+----------------+
| empName  | REGEXP_REPLACE |
+----------+----------------+
| John Doe | John Doe       |
| Jane Doe | John Doe       |
+----------+----------------+

greatsql> SELECT empName, REGEXP_REPLACE (empName, 'John', 'Jane') AS REGEXP_REPLACE  FROM t_regexp;
+----------+----------------+
| empName  | REGEXP_REPLACE |
+----------+----------------+
| John Doe | Jane Doe       |
| Jane Doe | Jane Doe       |
+----------+----------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
