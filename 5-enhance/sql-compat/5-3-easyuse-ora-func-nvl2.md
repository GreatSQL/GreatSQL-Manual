# Oracle兼容-函数-NVL2()函数
---


## 1. 语法

```sql
NVL2(expr1, expr2, expr3)
```

## 2. 定义和用法
参数 `expr1`、`expr2`、`expr3` 均为表达式。

`NVL2()` 函数作用类似 `IFNULL()`，如果 `expr1` 不为 NULL，则返回 `expr2`；当 `expr1` 为 NULL 时，则返回 `expr3`。

如果expr2和expr3类型不同，则返回的数据类型会依据expr2,expr3的类型自动选择其一并做适当转换。


## 3. Oracle兼容说明

GreatSQL中的 `NVL2()` 函数使用方法和Oracle中相同，但函数返回值类型与Oracle存在不同。

在Oracle中，如果 `expr2` 和 `expr3` 类型不同，`expr3` 会转换为 `expr2` 的类型，如果不能转换，则会报错。

而在GreatSQL中，则会依据 `expr2` 和 `expr3` 的类型，判断是否可聚合成为`expr2` 或 `expr3` 的类型之一。这个处理方式与 `NVL()`、`COALESCE()`、`IF()`、`CASE()` 等函数一致。

## 4. 示例

```sql
-- 1. 当expr2和expr3类型不同时，与oracle不同的示例
-- GreatSQL返回值，整型和浮点型聚合成浮点型
greatsql> SELECT NVL2(1, 2.0, 3.0) + 0, NVL2(1.111111, 3, 2.111111), NVL(3, 2.111111) FROM DUAL;
+-----------------------+-----------------------------+------------------+
| NVL2(1, 2.0, 3.0) + 0 | NVL2(1.111111, 3, 2.111111) | NVL(3, 2.111111) |
+-----------------------+-----------------------------+------------------+
|                   2.0 |                    3.000000 |         3.000000 |
+-----------------------+-----------------------------+------------------+

-- Oracle返回值，expr3转换成expr2的类型
SQL> SELECT NVL2(1, 2.0, 3.0) + 0, NVL2(1.111111, 3, 2.111111), NVL(3,2.111111) FROM DUAL;

NVL2(1,2.0,3.0)+0 NVL2(1.111111,3,2.111111) NVL(3,2.111111)
----------------- ------------------------- ---------------
                2                         3               3

-- GreatSQL返回值，整型和字符串聚合成字符串
greatsql> SELECT NVL2(NULL, 1, 'GreatSQL'), NVL(1, 'GreatSQL') FROM DUAL;
+---------------------------+--------------------+
| NVL2(NULL, 1, 'GreatSQL') | NVL(1, 'GreatSQL') |
+---------------------------+--------------------+
| GreatSQL                  | 1                  |
+---------------------------+--------------------+

-- Oracle会报错，expr3字符串无法直接转换成expr2整型
SQL> SELECT NVL2(NULL, 1, 'GreatSQL'), NVL(1, 'GreatSQL') FROM DUAL;
SELECT NVL2(NULL, 1, 'GreatSQL'), NVL(1, 'GreatSQL') FROM DUAL
                                *
ERROR at line 1:
ORA-01722: invalid number


-- 2. GreatSQL中其他函数的处理方式
greatsql> SELECT NVL2(NULL, 1, 'GreatSQL'), if(NULL, 1, 'GreatSQL'), COALESCE(NULL, 1, 'GreatSQL'), NVL(3306, 'GreatQL') FROM DUAL;
+---------------------------+-------------------------+-------------------------------+----------------------+
| NVL2(NULL, 1, 'GreatSQL') | if(NULL, 1, 'GreatSQL') | COALESCE(NULL, 1, 'GreatSQL') | NVL(3306, 'GreatQL') |
+---------------------------+-------------------------+-------------------------------+----------------------+
| GreatSQL                  | GreatSQL                | 1                             | 3306                 |
+---------------------------+-------------------------+-------------------------------+----------------------+

-- 3. 正常案例
-- GreatSQL
greatsql> SELECT NVL2(0, 'ERROR', 'THIS'), NVL2(1, 'IS', 'ERROR'), NVL2(NULL, 'ERROR', 'A'), NVL2(1, 2, 3) FROM DUAL;
+--------------------------+------------------------+--------------------------+---------------+
| NVL2(0, 'ERROR', 'THIS') | NVL2(1, 'IS', 'ERROR') | NVL2(NULL, 'ERROR', 'A') | NVL2(1, 2, 3) |
+--------------------------+------------------------+--------------------------+---------------+
| ERROR                    | IS                     | A                        |             2 |
+--------------------------+------------------------+--------------------------+---------------+

-- Oracle
SQL> SELECT NVL2(0, 'ERROR', 'THIS'), NVL2(1, 'IS', 'ERROR'), NVL2(NULL, 'ERROR', 'A'), NVL2(1, 2, 3) FROM DUAL;

NVL2( NV N NVL2(1,2,3)
----- -- - -----------
ERROR IS A           2

-- GreatSQL，全部返回NULL
greatsql> SELECT NVL2('GreatSQL', NULL ,3306), NVL2(NULL, 3306 ,NULL), NVL2(NULL, 3306, '') FROM DUAL;
+------------------------------+------------------------+----------------------+
| NVL2('GreatSQL', NULL ,3306) | NVL2(NULL, 3306 ,NULL) | NVL2(NULL, 3306, '') |
+------------------------------+------------------------+----------------------+
|                         NULL |                   NULL | NULL                 |
+------------------------------+------------------------+----------------------+

-- Oracle，全部返回空值
SQL> SELECT NVL2('GreatSQL', NULL ,3306), NVL2(NULL, 3306 ,NULL), NVL2(NULL, 3306, '') FROM DUAL;

NVL2('GREATSQL',NULL,3306) NVL2(NULL,3306,NULL) NVL2(NULL,3306,'')
-------------------------- -------------------- ------------------


SQL>
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
