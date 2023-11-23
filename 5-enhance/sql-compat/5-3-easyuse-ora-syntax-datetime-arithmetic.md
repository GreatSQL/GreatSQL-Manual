# Oracle兼容-语法-DATETIME加减运算
---

[toc]

## 1. 语法
```
SELECT SYSDATE + 1 FROM DUAL;
SELECT SYSDATE - 1 FROM DUAL;
SELECT SYSDATE - SYSDATE FROM DUAL;
```
## 2. 定义和用法

在GreatSQL中支持对 `DATETIME` 类型数据做加减运算，例如增加1秒、1天，使用该运算行为模式需要切换到ORACLE模式下。

1. 只支持加减运算，不支持其他运算类型。
2. 对 `TIME` 类型运算前，会先被转换成 `DATETIME` 类型。
3. 会先将时间戳的值转换为日期值，并将 `NUMBER` 算术日期时间和间隔表达式中的常量解释为天数。
4. 年份范围为：[0,9999]，不支持公元前的年份，溢出时将返回**NULL**，并产生warning。
5. 当计算结果包含无限循环小数时，默认只保留**10位**，即：`div_precincrement` 选项默认值(4) + 6 = 10。
6. 对YEAR类型加减运算时，默认转换将失败而无法运算时，会返回**NULL** , 并产生warning。

```
greatsql> SET sql_mode = ORACLE;

-- 例1：多个查询结果集合并，或者数值作为查询条件时
greatsql> SELECT TO_DATE('00:00:00','HH24:MI:SS') -  TO_DATE('00:00:01','HH24:MI:SS') FROM DUAL
 UNION ALL
 SELECT TO_DATE('00:00:00','HH24:MI:SS') -  TO_DATE('00:00:01','HH24:MI:SS') FROM DUAL;
+----------------------------------------------------------------------+
| to_date('00:00:00','HH24:MI:SS') -  to_date('00:00:01','HH24:MI:SS') |
+----------------------------------------------------------------------+
|                                                        -0.0000115741 |
|                                                        -0.0000115741 |
+----------------------------------------------------------------------+

- 例2：在单一查询计算结果作为字符串展示的时候，保留小数位长度不再限制保留10位
greatsql> SELECT TO_DATE('00:00:00','HH24:MI:SS') -  TO_DATE('00:00:01','HH24:MI:SS');
+----------------------------------------------------------------------+
| to_date('00:00:00','HH24:MI:SS') -  to_date('00:00:01','HH24:MI:SS') |
+----------------------------------------------------------------------+
|                                                -0.000011574074074074 |
+----------------------------------------------------------------------+
```

**DATETIME类型运算兼容矩阵**

Operand & Operator|DATETIME| TIMESTAMP|TIME|NUMBER
--| -- | -- | -- | --
| **DATETIME**| - | - | -   | -
|+ | - |  - | - |DATETIME
|— | DECIMAL | DECIMAL | DECIMAL | DATETIME
|* | - | - | - | -
|/ | - | - | - | -
|**TIMESTAMP** | -  | -|- | -
|+ | - |- | -|TIMESTAMP|
|- | DECIMAL | DECIMAL |DECIMAL| TIMESTAMP
|* | - | - | - | - | -
|/ | - | - | - | - | -
|**DATE**| | | |
|+| - | - | - |DATETIME |
|-| DECIMAL | DECIMAL| DECIMAL| DATETIME
|*| - | - | - | -|
|/| -| - | -| -|
|**TIME** | - | - | -
|+| - |  - | - | DATETIME
|-| DECIMAL | DECIMAL | DECIMAL |DATETIME
|*| - | - |  - | -
|/| - | - | - | -
|NUMBER | - | - |-| -
|+ | DATETIME | TIMESTAMP| DATETIME|NA
|- | DATETIME | TIMESTAMP| DATETIME|NA
|*| - | - | -|NA
|/| - | - | -|NA

上表是 `DATETIME` 类型算术运算的兼容矩阵，破折号代表不支持的操作。

## 3. 与Oracle差异说明

1. 默认日期差异日期保留精度不一致，在GreatSQL中默认保留10位小数精度，而Oracle中根据不同的精度数据不一样。
2. 时间范围最大与最小范围不一致。在GreatSQL中年份范围是 [0,9999]，而Oracle中的范围是 [-4713,9999]。
3. 加减字符串运算行为不同，例如字符串'a'，在Oracle中转换失败将会报错，而在GreatSQL中将转换为 '0' 并产生警告，之后再进行运算。
4. 在GreatSQL中，`TIMESTAMP - TIMESTAMP` 返回的结果是 `DECIMAL` 类型， Oracle 中返回 `INTERVAL` 类型。

## 4. 示例

```
greatsql> SET sql_mode = ORACLE;

greatsql> SET TIMESTAMP = 1;

-- +1/2 等同于 +12小时
greatsql> SELECT SYSDATE +1/2 ;
+----------------------------+
| SYSDATE +1/2               |
+----------------------------+
| 1970-01-01 12:00:01.000000 |
+----------------------------+

-- 等同于 +1天
greatsql> SELECT SYSDATE +1  ;
+----------------------------+
| SYSDATE +1                 |
+----------------------------+
| 1970-01-02 00:00:01.000000 |
+----------------------------+

-- 等同于 -1 天
greatsql> SELECT SYSDATE -1  ;
+----------------------------+
| SYSDATE -1                 |
+----------------------------+
| 1969-12-31 00:00:01.000000 |
+----------------------------+

greatsql> SELECT SYSDATE - SYSDATE;
+-------------------+
| SYSDATE - SYSDATE |
+-------------------+
|                 0 |
+-------------------+

-- 将'a'转换成'0'后再运算，并产生warning
greatsql> SELECT  SYSDATE + 'a';
+----------------------------+
| SYSDATE + 'a'              |
+----------------------------+
| 1970-01-01 00:00:01.000000 |
+----------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------------------------------+
| Level   | Code | Message                               |
+---------+------+---------------------------------------+
| Warning | 1292 | Truncated incorrect DOUBLE value: 'a' |
+---------+------+---------------------------------------+

-- 不支持 乘/除 运算，
greatsql> SELECT SYSDATE *  10;
ERROR 7038 (42000): in oracle_mode: date * LONGLONG not allowed

greatsql> SELECT SYSDATE / 10;
ERROR 7038 (42000): in oracle_mode: date / LONGLONG not allowed

greatsql> SELECT SYSDATE + SYSDATE;
ERROR 7038 (42000): in oracle_mode: date + DATETIME not allowed

greatsql> SELECT SYSDATE + 1000000000000;
+-------------------------+
| SYSDATE + 1000000000000 |
+-------------------------+
| NULL                    |
+-------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+--------------------------------------------+
| Level   | Code | Message                                    |
+---------+------+--------------------------------------------+
| Warning | 1441 | Datetime function: datetime field overflow |
+---------+------+--------------------------------------------+

-- 无法对YEAR做运算
greatsql> SELECT CAST(2023 AS YEAR) + 1;
+------------------------+
| CAST(2023 AS YEAR) + 1 |
+------------------------+
| NULL                   |
+------------------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+----------------------------------+
| Level   | Code | Message                          |
+---------+------+----------------------------------+
| Warning | 1292 | Incorrect datetime value: '2023' |
+---------+------+----------------------------------+
```

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
