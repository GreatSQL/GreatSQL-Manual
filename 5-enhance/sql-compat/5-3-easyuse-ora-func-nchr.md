# Oracle兼容-函数-NCHR()函数
---


## 1. 语法

```sql
NCHR(n)
```

## 2. 定义和用法
`NCHR()` 函数的作用是将Unicode编码转换成对应字符的函数。使用方法与 `CHR()` 函数类似，只是将Unicode编码代替了ASCII码。

参数 `n` 的要求如下：
1. 参数 n 的值要求为非负数，如果是负数则会报错。
2. 参数 n 也可以是整数或浮点数，浮点数会自动被转换为（求绝对值后的）整数，例如：97.3会被转换成97 ，而97.6也会被转换成97。
3. 参数 n 还可以是字符串，这个字符串必须能正确转换出非负整数。


## 3. 示例
```sql
greatsql> SET @n=97.184; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.184
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97

greatsql> SET @n=97.684; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.684
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97

greatsql> SET @n=-97.684; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

ERROR 1210 (HY000): Incorrect arguments to function nchr.

greatsql> SET @n='97.684'; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.684
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97
1 row in set (0.00 sec)

greatsql> SET @n='97.184'; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.184
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97

greatsql> SET @n='97.184a'; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

ERROR 1292 (22007): Truncated incorrect DOUBLE value: '97.184a'
greatsql> SET @n='97.184  '; SELECT @n, NCHR(@n), LENGTH(NCHR(@n)), LENGTHB(NCHR(@n)), ORD(NCHR(@n))\G
Query OK, 0 rows affected (0.00 sec)

*************************** 1. row ***************************
               @n: 97.184
         NCHR(@n): a
 LENGTH(NCHR(@n)): 1
LENGTHB(NCHR(@n)): 1
    ORD(NCHR(@n)): 97
```




**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
