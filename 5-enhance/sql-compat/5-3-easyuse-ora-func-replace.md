# Oracle兼容-函数-REPLACE()函数
---


## 1. 语法

```sql
REPLACE(char, search_string [, replace_string])
```

## 2. 定义和用法
`REPLACE()` 函数的作用是根据给定的字符串匹配并替换原字符串，并返回替换后的字符串。

参数：
- `char`：待替换字符串。
- `search_string`：搜索字符串。
- `replace_string`：替换后的字符串。本参数可选，当未指定时，则认为 `replace_string` 为空字符串。

当 `char`、`search_string`、`replace_string` 中包含转义字符（例如：`\0`、`\'`、`''`、`\"`、`\\`、`\b`、`\B`、`\n`、`\N`、`\r`、`\R`、`\t`、`\T`、`\z`、`\Z`）时，不会视为2个字符，而视为1个字符来处理。


## 3. Oracle兼容说明

因为GreatSQL已原生支持 `REPLACE()` 函数，因此想要在GreatSQL中使用扩展后的 `REPLACE()` 函数时，需要先执行 `SET sql_mode = ORACLE;` 激活Oracle兼容模式。

在原生默认模式（`SET sql_mode = DEFAULT`）下，参数 `replace_string` 必须指定，不能为空。

当 `replace_string` 值为 NULL 时，在 DEFAULT 和 ORACLE 两种不同模式下的返回结果也不同。

## 4. 示例

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

-- 最后一个案例，切换到DEFUALT模式下结果不同
greatsql> SET sql_mode = DEFAULT;
greatsql> SELECT REPLACE('GreatSQL', 'a', NULL);
+--------------------------------+
| REPLACE('GreatSQL', 'a', NULL) |
+--------------------------------+
| NULL                           |
+--------------------------------+

-- 在DEFAULT模式下，不能省略第三个参数
greatsql> SELECT REPLACE('GreatSQL', 'a');
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ')' at line 1
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
