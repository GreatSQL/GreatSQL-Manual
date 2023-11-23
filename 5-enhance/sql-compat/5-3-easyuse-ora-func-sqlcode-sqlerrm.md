# Oracle兼容-函数-SQLCODE()/SQLERRM()函数
---
[toc]

## 1. 语法

```sql
SQLCODE()

SQLERRM()

SQLERRM( errcode )
```

## 2. 定义和用法
`SQLCODE()` 函数的作用是返回错误号与错误信息，与 `exception` 配合使用。

`SQLERRM()` 函数的作用是返回指定错误代码的错误信息，主要用法有以下几个：

1. 运行 `SQLERRM()` 获取上一次发生错误的信息，与 `exception` 配合使用。
2. 运行 `SQLERRM(sqlcode)` 获取错误信息，如果指定的错误号与当前错误一致，则返回完整的错误信息。
3. 运行 `SQLERRM(sqlcode)` 获取错误信息，如果指定的错误号与当前错误不一致，则返回指定错误号对应的错误信息（可能存在占位符）。

## 3. Oracle兼容说明

`SQLCODE()` 返回的是GreatSQL中原生定义的错误号，不是Oracle的错误号。

当运行的SQL或函数没有报错时，没有异常被触发，则返回值为 0。

`SQLCODE()` 必须在存储过程中或函数中使用，不能单独使用。

`SQLERRM()` 返回的是GreatSQL中原生定义的错误信息，如果指定了不存在的错误信息，则返回 `errcode: Unknown error`。


## 4. 示例

```
-- 先切换到Oracle mode
greatsql> SET sql_mode = ORACLE;

-- 修改DELIMITER
greatsql> DELIMITER //

-- 查询一个不存在的表t1
-- 第一次执行时未报错 SQLCODE = 0;
-- SQLERRM 不指定 SQLCODE，返回最近一次发生的错误
-- SQLERRM 中指定 SQLCODE，仍是返回最近一次发生的错误
-- SQLERRM 中指定自定义的 SQLCODE，返回对应的错误信息（不是最近一次发生的错误）
greatsql> BEGIN
SELECT SQLCODE, SQLERRM;
SELECT * FROM t1;
EXCEPTION
WHEN OTHERS THEN
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret1;
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret2;
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret3;
END; //
+---------+-----------------------------------+
| SQLCODE | SQLERRM                           |
+---------+-----------------------------------+
|       0 | 0 : normal, successful completion |
+---------+-----------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret1                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret2                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

+------------------------------------------------------------------------+
| ret3                                                                   |
+------------------------------------------------------------------------+
| errcode:1146 msg:1145 : The host or user argument to GRANT is too long |
+------------------------------------------------------------------------+
1 row in set (0.00 sec)


-- 在最开始自行制定SQLCODE不影响后续获取真正的SQLCODE
greatsqal> BEGIN
SELECT SQLERRM(105400) ;
SELECT SQLCODE, SQLERRM;
SELECT * FROM t1;
EXCEPTION
WHEN OTHERS THEN
SELECT 'errcode:' || SQLCODE ||' msg:' || SQLERRM AS ret1;
END; //
+------------------------+
| SQLERRM(105400)        |
+------------------------+
| 105400 : Unknown error |
+------------------------+
1 row in set (0.00 sec)

+---------+-----------------------------------+
| SQLCODE | SQLERRM                           |
+---------+-----------------------------------+
|       0 | 0 : normal, successful completion |
+---------+-----------------------------------+
1 row in set (0.00 sec)

+-----------------------------------------------------------+
| ret1                                                      |
+-----------------------------------------------------------+
| errcode:1146 msg:1146 : Table 'greatsql.t1' doesn't exist |
+-----------------------------------------------------------+
1 row in set (0.00 sec)
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
