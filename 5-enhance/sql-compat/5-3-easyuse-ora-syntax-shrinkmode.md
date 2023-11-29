# Oracle兼容-语法-shrink_sql_mode
---
[toc]

## 1. 语法

```sql
SET GLBOAL shrink_sql_mode = 'modes';
SET SESSION shrink_sql_mode = 'modes';
```

## 2. 定义和用法


可通过设置 `shrink_sql_mode` 参数实现从组合模式（ORACLE, ANSI, TRADITIONAL等）模式中移除指定的模式，可以同时移除多个模式。

当 `shrink_sql_mode` 参数值为空的时候，则当前的 `sql_mode` 还原为完整展开的结果。

如果不指定 `GLOBAL` 或 `SESSION`，则默认只修改 `SESSION` 级别的 `sql_mdoe`。

想要修改 `GLOBAL` 级别的 `sql_mode` 时，需要具有 `SYSTEM_VARIABLES_ADMIN` 或 `SUPER` 权限才行。


## 3. 示例


```sql
-- 指定单个mode时，可不加引号
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION


-- 移除指定mode（指定多个mode时，需要加引号，且引号中的mode之间不能带有空格）
greatsql> SET shrink_sql_mode = 'PIPES_AS_CONCAT,ERROR_FOR_DIVISION_BY_ZERO';

greatsql> SELECT @@sql_mode;
*************************** 1. row ***************************
@@sql_mode: ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
