# Oracle兼容-函数-SUBSTR()函数
---


## 1. 语法

```sql
SUBSTR(string, pos [, substring_length] )
```

## 2. 定义和用法

函数 `SUBSTR()` 的作用是返回字符型参数 `string` 的一部分。该部分是由 `string` 的第 `pos` 个字符开始，取 `substring_length` 个字符。

- 若`pos`为0，视为1，表示`string`从第1个字符开始。
- 若`pos`为正数，表示由`string`的第`pos`个字符开始。
- 若`pos`为负数，表示由`string`倒数第`pos`个字符开始。
- 若`pos`为''（空）时，在Oracle模式下，当做1看待。
- 若`substring_length`未指定，表示取到`string`的最后一个字符为止。
- 若`substring_length`小于等于0，会传回空字符。
- 若`string`、`pos`、`substring_length`任意一个值为NULL，则返回NULL。
- 当`string中包含转义字符（例如：`\0`、`\'`、`''`、`\"`、`\\`、`\b`、`\B`、`\n`、`\N`、`\r`、`\R`、`\t`、`\T`、`\z`、`\Z`）时，不会视为2个字符，而视为1个字符来处理。


## 3. Oracle兼容说明

因为GreatSQL已原生支持 `SUBSTR()` 函数，因此想要在GreatSQL中使用扩展后的 `SUBSTR()` 函数时，需要先执行 `SET sql_mode = ORACLE;` 激活Oracle兼容模式。

在Oracle兼容模式下，与GreatSQL原生的 `SUBSTR()` 函数区别在于两处：
- 当参数 `pos` 为0时，Oracle兼容模式下视为1；而GreatSQL原生函数仍视为0，且返回结果总是为空值('')。
- 当返回结果为空值('')时，Oracle兼容模式下返回NULL；而GreatSQL原生函数仍旧返回空值('')。

GreatSQL原生的 `SUBSTR()` 函数是 `SUBSTRING()` 函数的别名，其用法是：
```
SUBSTRING(str,pos)
SUBSTRING(str FROM pos)
SUBSTRING(str,pos,len)
SUBSTRING(str FROM pos FOR len)
```
更多关于原生的 `SUBSTR()` 函数用法这里不再赘述。

## 4. 示例
```
-- 切换到Oracle mode
greatsql> SET sql_mode = ORACLE;

-- 当pos=0时，视为pos=1
greatsql> SELECT SUBSTR('GreatSQL', 0, 1);
+--------------------------+
| SUBSTR('GreatSQL', 0, 1) |
+--------------------------+
| G                        |
+--------------------------+

greatsql> SELECT SUBSTR('GreatSQL', 1, 1);
+--------------------------+
| SUBSTR('GreatSQL', 1, 1) |
+--------------------------+
| G                        |
+--------------------------+

-- 当结果为空值时，返回NULL
greatsql> SELECT SUBSTR('GreatSQL', 9, 1);
+--------------------------+
| SUBSTR('GreatSQL', 9, 1) |
+--------------------------+
| NULL                     |
+--------------------------+

-- 转义字符视为1个字符处理
greatsql> SELECT SUBSTR('\"GreatSQL', 1);
+-------------------------+
| SUBSTR('\"GreatSQL', 1) |
+-------------------------+
| "GreatSQL               |
+-------------------------+

-- 切换到DEFAULT mode下
-- 当pos=0时，返回总是空值
greatsql> SELECT SUBSTR('GreatSQL', 0, 1);
+--------------------------+
| SUBSTR('GreatSQL', 0, 1) |
+--------------------------+
|                          |
+--------------------------+

-- 当结果为空值时，显式''，而非NULL
greatsql> SELECT SUBSTR('GreatSQL', 9, 1);
+--------------------------+
| SUBSTR('GreatSQL', 9, 1) |
+--------------------------+
|                          |
+--------------------------+
```




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
