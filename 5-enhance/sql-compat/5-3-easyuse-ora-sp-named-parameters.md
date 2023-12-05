# Oracle兼容-存储过程-命名标记法（`named parameter`）
---


## 1. 语法

```sql
udf_expr:
    expr
    | ident '=>' expr
```

## 2. 定义和用法

### 2.1 定义

在GreatSQL存储过程/存储函数调用时，支持对参数添加类似: `parameter1 => value1` 的标记，使得参数在调用的顺序与参数的定义顺序解耦，提升易用性，降低隐含错误出现的概率。

采用命名标记法时要注意：

- 命名标记和位置标记法（传统调用模式）允许混用，但在首个命名标记参数后，不允许再使用位置标记法。

- 执行 `EXPLAIN` 查看执行计划时，涉及的函数在展示时，会被改写成位置标记法标注，但这不影响运行结果。

- 系统内置函数不可使用，如：`SUM`、`DECODE()` 等。

### 2.2 支持范围

在 `ORACLE` 模式下，支持以下几种命名标记用法：  

- 存储过程（Stored Procedure）

- 存储函数（Stored Function）

- 用户自定义函数（UDF, 使用 udf.so加载），UDF原生用法支持命名标记法，如 `f1(1 AS a, 2 AS b)`，但不支持 `f1(a=>1, b=>2)`，后者需要先切换到 `ORACLE` 模式下才行。

### 2.3 错误说明

当命名标记使用发生错误时，主要有以下三种错误提示：

- `In %s %s, a named parameter was specified before a positional parameter.`
    - 错误原因：在基于位置的参数的左边出现命名参数。
    - 建议动作：调整参数顺序或将命名参数修改成位置参数。

- `In %s %s, parameter %s was invalid.`
    - 错误原因：命名参数的名称不合法。
    - 建议动作：参考定义，修改错误名称。

- `In %s %s, parameter %s was missing.`
    - 错误原因：缺失参数，大概率为重名错误，如：`CALL p1(a=>2, a=>1);`。
    - 建议动作：参考定义，修正错误。


## 3. 示例


```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1(a INT, b INT, c INT) AS
BEGIN
  SELECT a*b+c;
END; //

CREATE OR REPLACE FUNCTION f1(a INT, b INT) RETURN INT DETERMINISTIC AS
BEGIN
  RETURN a-b;
END; //

greatsql> DELIMITER ;
greatsql> CALL p1(3, 2, 1);           -- 位置标记法
greatsql> CALL p1(c=>1, b=>2, a=>1);  -- 命名标记法
greatsql> CALL p1(1, c=>3, b=>2);     -- 混合标记法

greatsql> SELECT f1(2, 1);            -- 位置标记法
greatsql> SELECT f1(a=>2, 1);         -- 错误用法

greatsql> EXPLAIN SELECT * FROM t1 WHERE a > f1(a=>2, b=>1);
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
