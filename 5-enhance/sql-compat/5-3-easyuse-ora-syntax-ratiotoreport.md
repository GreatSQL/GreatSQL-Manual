# Oracle兼容-语法-RATIO_TO_REPORT
---


## 1. 语法

```sql
SET sql_mode = ORACLE;

RATIO_TO_REPORT(expr)
   OVER ([ query_partition_clause ])
```

## 2. 定义和用法

想要使用 `RATIO_TO_REPORT` 需要先切换到`ORACLE`模式下，`RATIO_TO_REPORT` 可用于数据占比分析，其分析公式为：`结果 = 字段值/sum(字段)`。

## 3. Oracle兼容说明

在GreatSQL和Oracle中的 `RATIO_TO_REPORT` 用法一致，具体实现功能如下：

1. `RATIO_TO_REPORT(expr) OVER (query_partition_clause)` 对分组数据进行占比分析。

2. `RATIO_TO_REPORT(expr) OVER ()` 对所有数据进行占比分析。

3. 在Oracle中不支持字符值使用 `RATIO_TO_REPORT`，但因GreatSQL中会自动隐式转换，支持这么用。

4. 在GreatSQL中不支持`ENUM`、`SET`、`JSON`、`GEOMETRY`、时间等多个类型数据使用 `RATIO_TO_REPORT`。

5. `RATIO_TO_REPORT` 分析的结果小数位数为该字段的小数位加上系统参数 `@@div_precision_increment` 的和。

6. 字段值为`NULL`、`''`及**相加和为0**等几种情况下，`RATIO_TO_REPORT` 的结果为 `NULL`。

7. 在GreatSQL中支持 `BIT` 类型字段用于 `RATIO_TO_REPORT`。

8. 当于计算时数值过大产生溢出的情况，将按照GreatSQL原生的方式来处理。


## 4. 示例

创建测试表并填充数据：
```sql
greatsql> CREATE TABLE `t1` (
 sidea INT DEFAULT NULL,
 sideb INT DEFAULT NULL,
 sidec DECIMAL(50,10) GENERATED ALWAYS AS (SQRT(((`sidea` * `sidea`) + (`sideb` * `sideb`)))) VIRTUAL
);

greatsql> INSERT INTO t1(sidea,sideb) VALUES(1,2),(10,20),(null,null),(-1,20),(10,-100),(10,-123);
greatsql> SELECT * FROM t1;
+-------+-------+----------------+
| sidea | sideb | sidec          |
+-------+-------+----------------+
|     1 |     2 |   2.2360679775 |
|    10 |    20 |   22.360679775 |
|  NULL |  NULL |           NULL |
|    -1 |    20 |  20.0249843945 |
|    10 |  -100 | 100.4987562112 |
|    10 |  -123 |  123.405834546 |
+-------+-------+----------------+
6 rows in set (0.00 sec)
```

- 1. `RATIO_TO_REPORT over (partition by)` 对分组数据进行占比分析。

```sql
greatsql> SET sql_mode = ORACLE;

-- 查看 @@div_precision_increment 值
greatsql> SELECT @@div_precision_increment;
+---------------------------+
| @@div_precision_increment |
+---------------------------+
|                         4 |
+---------------------------+

greatsql> SELECT sidec, sidea, RATIO_TO_REPORT(sidec) OVER (PARTITION BY sidea) c FROM t1;
+----------------+-------+------------------+
| sidec          | sidea | c                |
+----------------+-------+------------------+
|           NULL |  NULL |             NULL |
|  20.0249843945 |    -1 |                1 |
|   2.2360679775 |     1 |                1 |
|   22.360679775 |    10 | 0.09079916029847 |
| 100.4987562112 |    10 | 0.40809146979602 |
|  123.405834546 |    10 | 0.50110936990551 |
+----------------+-------+------------------+
6 rows in set (0.00 sec)

greatsql> SELECT sideb, sidea, RATIO_TO_REPORT(sideb) OVER (PARTITION BY sidea) c FROM t1;
+-------+-------+---------+
| sideb | sidea | c       |
+-------+-------+---------+
|  NULL |  NULL |    NULL |
|    20 |    -1 |       1 |
|     2 |     1 |       1 |
|    20 |    10 | -0.0985 |
|  -100 |    10 |  0.4926 |
|  -123 |    10 |  0.6059 |
+-------+-------+---------+
6 rows in set (0.01 sec)
```

- 2. `RATIO_TO_REPORT OVER()` 对所有数据进行占比分析。

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT sidec, sidea, RATIO_TO_REPORT(sidec) OVER () c FROM t1;
+----------------+-------+------------------+
| sidec          | sidea | c                |
+----------------+-------+------------------+
|   2.2360679775 |     1 | 0.00832718354505 |
|   22.360679775 |    10 | 0.08327183545048 |
|           NULL |  NULL |             NULL |
|  20.0249843945 |    -1 | 0.07457363649836 |
| 100.4987562112 |    10 | 0.37426035229721 |
|  123.405834546 |    10 |  0.4595669922089 |
+----------------+-------+------------------+
6 rows in set (0.01 sec)
```

- 3. 字段相加的和为0

```
-- 再新写入两条记录
greatsql> INSERT INTO t1(sidea,sideb) VALUES (20,100),(20,-100);

greatsql> SELECT * FROM t1;
+-------+-------+----------------+
| sidea | sideb | sidec          |
+-------+-------+----------------+
|     1 |     2 |   2.2360679775 |
|    10 |    20 |   22.360679775 |
|  NULL |  NULL |           NULL |
|    -1 |    20 |  20.0249843945 |
|    10 |  -100 | 100.4987562112 |
|    10 |  -123 |  123.405834546 |
|    20 |   100 | 101.9803902719 |
|    20 |  -100 | 101.9803902719 |
+-------+-------+----------------+
8 rows in set (0.00 sec)

greatsql> SET sql_mode = ORACLE;

greatsql> SELECT sideb, sidea, RATIO_TO_REPORT(sideb) OVER (PARTITION BY sidea) c FROM t1;
+-------+-------+---------+
| sideb | sidea | c       |
+-------+-------+---------+
|  NULL |  NULL |    NULL |
|    20 |    -1 |       1 |
|     2 |     1 |       1 |
|    20 |    10 | -0.0985 |
|  -100 |    10 |  0.4926 |
|  -123 |    10 |  0.6059 |
|   100 |    20 |    NULL |
|  -100 |    20 |    NULL |
+-------+-------+---------+
8 rows in set (0.00 sec)
```


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
