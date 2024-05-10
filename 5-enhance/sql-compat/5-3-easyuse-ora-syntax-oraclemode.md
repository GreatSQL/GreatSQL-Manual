# Oracle兼容-语法-ORACLE MODE
---


## 1. 语法

```sql
SET GLOBAL sql_mode = 'ORACLE';
SET SESSION sql_mode = 'ORACLE';
```

## 2. 定义和用法

修改`sql_mode` 为 `ORACLE`  的作用是切换到Oracle兼容模式，避免与GreatSQL现有模式（工作方式）产生冲突。

如果不指定 `GLOBAL` 或 `SESSION`，则默认只修改 `SESSION` 级别的 `sql_mode`。

`GLOBAL` 级别的 `sql_mode` 变更，需具有 `SYSTEM_VARIABLES_ADMIN` 或 `SUPER` 权限。

Oracle模式实际上是包含以下几个模式的组合：
| 模式    | 功能    |
| ---- | ---- |
|PIPES_AS_CONCAT|  &#124; &#124; 连接符号|
|ANSI_QUOTES | 关键字用双引号 "" |
|IGNORE_SPACE| 忽略空格 |
|ONLY_FULL_GROUP_BY| GROUP BY时只允许查询分组字段  |
|STRICT_TRANS_TABLES|  严格限制数据转换插入表 |
|STRICT_ALL_TABLES| 严格限制数据转换|
|NO_ZERO_IN_DATE| 不允许日期存在 00 部分 |
|NO_ZERO_DATE|  不允许日期 0000-00-00 |
|ERROR_FOR_DIVISION_BY_ZERO| 除0运算时会直接报错  |
|NO_ENGINE_SUBSTITUTION| 不允许指定没有被enable 的存储引擎 |

更具体而言，在Oracle模式下的一些工作模式包含如下几条：

- 1. 将严格限制类型隐式转换。例外情况：类似 `IFNULL(v1, v2)` 函数返回类型为字符串时，会再进行一次隐式转换，强转类型将不会报错。

- 2. 时间类型，不允许使用非法的日期值，例如：0000-00-00。

- 3. 在除法运算中，当分母为0时会报错。

- 4. 进行 `GROUP BY` 分组查询时，不能查询非 `GROUP BY` 的字段。

- 5. 数据类型声明时要严格遵循规范，不规范的数据类型会导致报错。

如果有需要，想要从 ORACLE 模式中去掉个别模式，还可以通过设置 `shrink_sql_mode` 参数进行调整，详情参考[shrink_sql_mode](./5-3-easyuse-ora-syntax-shrinkmode.md)

**提醒：** 若已设置 GLOBAL 级 `sql_mode = ORACLE`，则在某个会话中修改 `sql_mode = DEFAULT`，该会话的 `sql_mode` 仍为 `ORACLE`，而不是GreatSQL原生默认的模式。如下所示：
```
-- 在会话1设置GLOBAL sql_mode
greatsql> SET GLOBAL sql_mode = ORACLE;
greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

-- 在会话2（该会话需在会话1设置后连接）设置 sql_mode = DEFAULT，结果仍为 ORACLE
greatsql> SET SESSION sql_mode = DEFAULT;
greatsql> SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode\G
*************************** 1. row ***************************
 @@GLOBAL.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
@@SESSION.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

-- 临时修改为ANSI
greatsql> SET SESSION sql_mode = ANSI;

greatsql> SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode\G
*************************** 1. row ***************************
 @@GLOBAL.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
@@SESSION.sql_mode: REAL_AS_FLOAT,PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ANSI
1 row in set (0.00 sec)

-- 再次设置为DEFAULT模式，发现还是ORACLE模式
greatsql> SET SESSION sql_mode = DEFAULT;

greatsql> SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode\G
*************************** 1. row ***************************
 @@GLOBAL.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
@@SESSION.sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

## 3. 示例

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

greatsql> SELECT 1/0;
ERROR 1365 (22012): Division by 0


-- 在DEFAULT模式下，或者在ORACLE模式下，去掉ERROR_FOR_DIVISION_BY_ZERO模式后，都允许1/0运算

-- 1. 在ORACLE模式下去除ERROR_FOR_DIVISION_BY_ZERO模式
greatsql> SET shrink_sql_mode = ERROR_FOR_DIVISION_BY_ZERO;
greatsql> SELECT @@shrink_sql_mode;
+----------------------------+
| @@shrink_sql_mode          |
+----------------------------+
| ERROR_FOR_DIVISION_BY_ZERO |
+----------------------------+

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION

-- 不报错，也没有告警
greatsql> SELECT 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set (0.00 sec)


-- 2. 切换到DEFAULT模式
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

greatsql> SET sql_mode = DEFAULT;

-- 不报错，但有告警
greatsql> SELECT 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------+
| Level   | Code | Message       |
+---------+------+---------------+
| Warning | 1365 | Division by 0 |
+---------+------+---------------+
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
