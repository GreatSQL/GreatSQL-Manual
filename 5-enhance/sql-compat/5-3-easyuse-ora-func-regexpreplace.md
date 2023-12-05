# Oracle兼容-函数-REGEXP_REPLACE()函数
---


## 1. 语法

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

## 2. 定义和用法

`REGEXP_REPLACE()` 函数是 `REPLACE()` 函数的扩展函数，用于通过正则表达式来进行匹配替换。默认情况下，该函数返回 `source_char` 并将每次出现的正则表达式模式替换为 `replace_string`，返回的字符串与 `source_char` 的字符集相同。

各参数说明如下：

- `source_char` 是源字符串，是用作搜索匹配的字符表达式。
  - 指定 NULL 值时，结果返回 NULL。
  - 指定空字符串时，结果返回空字符串。

- `pattern` 是正则表达式模式。遵循 Unicode 正则表达式指南，有关详细信息，请阅读 [ICU’s Regular Expressions](https://unicode-org.github.io/icu/userguide/strings/regexp.html)。
  - 指定 NULL 值时，结果返回源字符串。
  - 指定空字符串或无效的正则表达式时，结果返回错误。

- `replace_string` 是用于替换在源字符串中由正则表达式匹配的字符串，可以包含 `\n` 形式的子表达式的反向引用，其中 n 是从 1 到 9 的数字。如果要包含反斜杠 `\`，则必须在它前面加上转义字符，它也是一个反斜杠 `\`。例如，要替换 `\2`，可以输入 `\\2`。
  - 指定 NULL 值或空字符串时，将在源字符串中由正则表达式匹配的字符串替换为空字符串。

- `position` 是一个正整数，表示应该从源字符串的哪个字符开始搜索匹配，当大于源字符串长度时结果返回源字符串，默认值为 1。

- `occurrence` 是一个非负整数，表示替换的匹配项：
  - 如果指定 0，则将替换所有出现的匹配项。
  - 如果指定一个正整数 n，那么将替换第 n 个出现的位置。如果 `occurrence` 大于 1，则从 `pattern` 第一次出现后的第一个字符开始搜索第二次出现，依此类推。

- `match_param` 指定如何执行匹配的字符串。
  - 'i' 不区分大小写的匹配。
  - 'c' 区分大小写匹配。
  - 'n' 允许 . 匹配换行符，如果省略此参数，则与换行符不匹配。
  - 'm' 将源字符串视为多行。将 ^ 和 $ 分别解释为源字符串中任意行的开始和结束，而不仅仅是整个源字符串的开始或结束。如果省略此参数，则将源字符串视为单行。
  - 'x' 忽略正则表达式模式中的空格。

  - 如果在 `match_param` 中指定了指定矛盾选项的字符，则最右边的优先。
  - 如果省略 `match_param`，则：
    - 默认大小写敏感性由 `REGEXP_REPLACE()` 函数的排序规则确定。
    - `.` 与换行符不匹配。
    - 源字符串被视为单行。


## 3. Oracle兼容说明

1. Oracle的正则表达式中数量限定元字符前面可以为空，而GreatSQL中不支持。

| REGEXP_REPLACE 输入                    | Oracle                      | GreatSQL                                                                        |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| REGEXP_REPLACE('123abc', '*', 'xxx')   | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '+', 'xxx')   | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '?', 'xxx')   | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '{2}', 'xxx') | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |

2. Oracle的正则表达式中支持非法花括号表达式，而GreatSQL中不支持。

| REGEXP_REPLACE 输入                   | Oracle | GreatSQL                                                                        |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| REGEXP_REPLACE('123abc', '{', 'xxx')  | 123abc | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '}', 'xxx')  | 123abc | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |
| REGEXP_REPLACE('123abc', '{}', 'xxx') | 123abc | ERROR 3688 (HY000): Syntax error in regular expression on line 1, character 1. |


3. Oracle的正则表达式允许空串的情况，而GreatSQL不允许

| REGEXP_REPLACE 输入                             | Oracle                      | GreatSQL                                                                 |
| ----------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| REGEXP_REPLACE('123abc', ' ', 'xxx', 1, 0, 'x') | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3685 (HY000): Illegal argument to a regular expression.           |
| REGEXP_REPLACE('123abc', '\', 'xxx', 1, 0, 'x') | xxx1xxx2xxx3xxxaxxxbxxxcxxx | ERROR 3689 (HY000): Unrecognized escape sequence in regular expression. |


**其他注意事项**

1. 在Oracle中没有空串，所以在GreatSQL中处理空串时如果想要得到与Oracle一样的结果，则需要修改 `sql_mode` 设置 `SET sql_mode = EMPTYSTRING_EQUAL_NULL`。

2. 在Oracle中反斜线 `\` 不表示转义字符，所以在GreatSQL中处理反斜线 `\` 时如果想要得到与Oracle一样的结果，则需要修改 `sql_mode` 设置 `SET sql_mode = NO_BACKSLASH_ESCAPES`。

3. 最后一个参数如果不指定是否区分大小写，则默认的大小写敏感性由 `REGEXP_REPLACE()` 函数的排序规则（即第一个参数的排序规则）确定，所以在大小写结果上可能与Oracle有差异。

例如：假设 `REGEXP_REPLACE()` 函数在Oracle的排序规则为 `BINARY`，在 GreatSQL 的排序规则为 `utf8mb4_vi_0900_ai_ci`

| REGEXP_REPLACE 输入           | Oracle | GreatSQL |
| ----------------------------- | ------ | ------- |
| REGEXP_REPLACE('A', 'a', 'G') | A      | G       |


## 4. 示例

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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
