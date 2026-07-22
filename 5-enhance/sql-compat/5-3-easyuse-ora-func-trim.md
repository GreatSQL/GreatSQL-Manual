# Oracle 兼容-函数-TRIM()/LTRIM()/RTRIM()函数
---


## 1. 语法

```sql
TRIM(str)
TRIM(LEADING [remchr] FROM str)
TRIM(TRAILING [remchr] FROM str)
TRIM(BOTH [remchr] FROM str)
TRIM(remchr FROM str)

LTRIM(str[, remstr])
RTRIM(str[, remstr])
```

## 2. 定义和用法

因为 GreatSQL 已原生支持 `TRIM()/LTRIM()/RTRIM()` 函数，因此想要在 GreatSQL 中使用扩展后的函数时，需要先执行 `SET sql_mode = ORACLE;` 激活 Oracle 兼容模式。

在 Oracle 兼容模式下，各个函数的作用分别如下：
- `TRIM()` 函数的作用是从字符串 `str` 中删除指定的字符 `remchr`，未声明 `remchr` 时则默认删除空格。
- `LTRIM()` 函数的作用是从字符串 `str` 的最左侧起，删除指定的字符串 `remstr`，未声明 `remstr` 时则默认删除空格。
- `RTRIM()` 函数的作用是从字符串 `str` 的最右侧起，删除指定的字符串 `remstr`，未声明 `remstr` 时则默认删除空格。

各参数说明如下：
- `remchr`：要删除的字符，在 Oracle 兼容模式下，`TRIM()`函数只能指定删除一个字符（不是一串字符串），默认为空格（注意：空格不是空值）。当参数 `remchr` 为空值('')时，结果总是返回 NULL。特别说明：是中文、emoji 等虽然是多字节字符，但在 `TRIM()` 函数中，仍被视为一个字符。
- `remstr`：要删除的字符串，用于 `LTRIM()/RTRIM()` 函数。
- `LEADING`：从头部开始，删除到第一个不是 `remchr` 的位置。
- `TRAILING`：从尾部开始，删除到第一个不是 `remchr` 的位置。
- `BOTH`：开头和结尾都算，都不指定时默认启用。


## 3. 示例
```sql
greatsql> SET sql_mode = ORACLE;
-- "  GreatSQL  " 字符串首尾各有两个空格
greatsql> SELECT TRIM(LEADING '' FROM '  GreatSQL  ');
+--------------------------------------+
| TRIM(LEADING '' FROM '  GreatSQL  ') |
+--------------------------------------+
| NULL                                 |
+--------------------------------------+

greatsql> SELECT TRIM(LEADING ' ' FROM '  GreatSQL  '), LENGTH(TRIM(LEADING ' ' FROM '  GreatSQL  ')) AS LEN;
+---------------------------------------+------+
| TRIM(LEADING ' ' FROM '  GreatSQL  ') | LEN  |
+---------------------------------------+------+
| GreatSQL                              |   10 |
+---------------------------------------+------+

-- 不指定默认就是BOTH
greatsql> SELECT TRIM(' ' FROM '  GreatSQL  '), LENGTH(TRIM(' ' FROM '  GreatSQL  ')) AS LEN;
+-------------------------------+------+
| TRIM(' ' FROM '  GreatSQL  ') | LEN  |
+-------------------------------+------+
| GreatSQL                      |    8 |
+-------------------------------+------+

-- 指定多余一个字符，报错
greatsql> SELECT TRIM('ea' FROM '  GreatSQL  ');
ERROR 7564 (HY000): trim set should have only one character

-- 一个中文视为一个字符
greatsql> SELECT TRIM('库' FROM 'GreatSQL数据库');
+-------------------------------------+
| TRIM('库' FROM 'GreatSQL数据库')     |
+-------------------------------------+
| GreatSQL数据                        |
+-------------------------------------+

-- 一个emoji字符视为一个字符
greatsql> SELECT TRIM('😀' FROM 'GreatSQL数据库😀');
+-------------------------------------+
| TRIM('?' FROM 'GreatSQL数据库?')    |
+-------------------------------------+
| GreatSQL数据库                      |
+-------------------------------------+

-- LTRIM()/RTRIM()支持多个字符
greatsql> SELECT LTRIM('GreatSQL', 'Great');
+----------------------------+
| LTRIM('GreatSQL', 'Great') |
+----------------------------+
| SQL                        |
+----------------------------+

greatsql> SELECT RTRIM('GreatSQL', 'SQL');
+--------------------------+
| RTRIM('GreatSQL', 'SQL') |
+--------------------------+
| Great                    |
+--------------------------+

greatsql> SELECT RTRIM('  GreatSQL  '), LENGTH(RTRIM('  GreatSQL  '));
+-----------------------+-------------------------------+
| RTRIM('  GreatSQL  ') | LENGTH(RTRIM('  GreatSQL  ')) |
+-----------------------+-------------------------------+
|   GreatSQL            |                            10 |
+-----------------------+-------------------------------+

greatsql> SELECT LTRIM('  GreatSQL  '), LENGTH(LTRIM('  GreatSQL  '));
+-----------------------+-------------------------------+
| LTRIM('  GreatSQL  ') | LENGTH(LTRIM('  GreatSQL  ')) |
+-----------------------+-------------------------------+
| GreatSQL              |                            10 |
+-----------------------+-------------------------------+
```



**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
