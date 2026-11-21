# Oracle Compatibility - Syntax - shrink_sql_mode
---

## 1. Syntax

```sql
SET GLOBAL shrink_sql_mode = 'modes';
SET SESSION shrink_sql_mode = 'modes';
```

## 2. Definition and Usage

By setting the `shrink_sql_mode` parameter, you can remove specified modes from combined modes (ORACLE, ANSI, TRADITIONAL, etc.), and multiple modes can be removed at the same time.

When the `shrink_sql_mode` parameter value is empty, the current `sql_mode` is restored to the fully expanded result.

If `GLOBAL` or `SESSION` is not specified, only the `SESSION` level `sql_mode` is modified by default.

To modify the `GLOBAL` level `sql_mode`, you need to have the `SYSTEM_VARIABLES_ADMIN` or `SUPER` privilege.

## 3. Examples

```sql
-- When specifying a single mode, quotes are not required
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT @@sql_mode\G
*************************** 1. row ***************************
@@sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION


-- Remove the specified mode (when specifying multiple modes, quotes are required, and there must be no spaces between the modes in the quotes)
greatsql> SET shrink_sql_mode = 'PIPES_AS_CONCAT,ERROR_FOR_DIVISION_BY_ZERO';

greatsql> SELECT @@sql_mode;
*************************** 1. row ***************************
@@sql_mode: ANSI_QUOTES,IGNORE_SPACE,ONLY_FULL_GROUP_BY,ORACLE,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
