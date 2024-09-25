# SQL MODE/SQL 模式
---

在 GreatSQL 中，`sql_mode` 是一个非常重要的系统变量，它用于控制 SQL 语句的处理方式，包括但不限于数据类型检查、空值处理、日期时间格式化等方面。

通过设置不同的 `sql_mode` 值，可以改变 GreatSQL 的行为模式，使其更符合某些 SQL 标准，或启用、禁用特定的功能。

`sql_mode` 可以在服务器启动时设置，也可以在运行时动态更改。

## 设置和查看 sql_mode

- **全局设置**：影响所有新连接到服务器的客户端

  ```sql
  SET GLOBAL sql_mode = 'mode1,mode2,...';
  ```

- **会话设置**：仅影响当前客户端连接

  ```sql
  -- 不加 SESSION 关键字也可以
  SET [SESSION] sql_mode = 'mode1,mode2,...';
  ```

- **配置文件设置**：在 my.cnf 配置文件中设置，对所有服务启动后的新连接生效

  ```ini
  [mysqld]
  sql_mode=mode1,mode2,...
  ```

- 查看全局 sql_mode 设置

  ```sql
  SELECT @@GLOBAL.sql_mode;
  ```

- 查看当前会话 sql_mode 设置

  ```sql
  SELECT @@SESSION.sql_mode;
  ```


## 常见的 sql_mode

- STRICT_TRANS_TABLES

当启用这个模式时，GreatSQL 在插入或更新操作时采用严格的错误处理模式，对于不符合数据类型约束的数据插入会报错并拒绝执行，而不是静默地转换或存储为NULL。适用于事务性存储引擎，如 InnoDB。

- STRICT_ALL_TABLES

与 *STRICT_TRANS_TABLES* 类似，但作用于所有存储引擎，而不仅仅是事务性存储引擎。

- NO_ZERO_IN_DATE

禁止日期字段中的月份或日子为0，例如 '2024-00-22' 或 '2024-05-00'。

- NO_ZERO_DATE

类似 *NO_ZERO_IN_DATE*，禁止插入零日期（'0000-00-00'），如果尝试插入这样的日期，会抛出错误。

- ERROR_FOR_DIVISION_BY_ZERO

在除以零的情况下，生成错误而不是警告或返回 NULL。

- NO_AUTO_CREATE_USER

阻止 `GRANT` 语句自动创建新用户，要求必须使用 `CREATE USER` 显式创建新用户。

- NO_ENGINE_SUBSTITUTION

如果指定的存储引擎不可用，GreatSQL 会抛出错误而不是使用默认存储引擎。

- ANSI
启用多种符合 SQL 标准的模式选项，如 REAL_AS_FLOAT、PIPES_AS_CONCAT、ANSI_QUOTES 和 IGNORE_SPACE。

- ANSI_QUOTES

启用 ANSI SQL 的双引号作为标识符引用字符，而不是字符串引用。

- TRADITIONAL
使 GreatSQL 更严格，类似于严格的 SQL 标准。通常与 STRICT_TRANS_TABLES 或 STRICT_ALL_TABLES 一起使用。

- ONLY_FULL_GROUP_BY

要求 SELECT 列表中的每一列要么是 GROUP BY 子句的表达式的一部分，要么包含在聚合函数中，以防止不确定的结果。在将 GreatSQL 5.7 升级到 8.0 过程中经常遇到这个问题，业务系统中的 SQL 可能会运行出错，这时候可以考虑临时阶段性去掉该模式，待所有业务 SQL 都改造升级完成后再重新启用。

- IGNORE_SPACE

允许函数名称和其后面的括号之间有空格。

## SQL 模式的影响

- 插入和更新操作

在严格模式下（如 *STRICT_TRANS_TABLES* 或 *STRICT_ALL_TABLES*），GreatSQL 遇到数据错误时会阻止插入或更新操作。例如，如果你尝试在一个非空字段中插入 NULL 值，GreatSQL 会返回错误。

- 日期和时间值

在启用 *NO_ZERO_IN_DATE* 或 *NO_ZERO_DATE* 模式时，插入无效日期如 '0000-00-00' 会引发错误。这有助于保证数据的完整性。

- 空字符串和数字

在严格模式下，尝试在整数字段中插入空字符串会引发错误，而不是将其自动转换为零。

## 如何选择 SQL 模式

选择合适的 SQL 模式取决于你的应用需求和数据完整性要求。通常，采用默认的 sql_mode 设置就可以。

建议尽量启用严格模式以防止无效数据进入数据库，这有助于确保数据的准确性和一致性。

## 注意事项

- **兼容性**：不同的 `sql_mode` 设置会影响 SQL 语句的兼容性，特别是在数据库迁移或使用多数据库系统时，例如上面提到的 *ONLY_FULL_GROUP_BY* 模式。
- **默认值**：默认 `sql_mode` 可能会随着版本升级而变化，因此在升级时需要特别注意并可能需要手动调整以保持现有行为。
- **性能**：某些 `sql_mode` 设置可能会影响查询性能，尤其是那些涉及到额外数据验证或转换的模式。
- **数据校验**：在开发和测试环境中使用严格的 `sql_mode` 可以帮助提前发现和修正数据问题，避免生产环境中出现意外。

`sql_mode` 是 GreatSQL 中一个强大的配置选项，通过设置不同的 SQL 模式，可以改变 GreatSQL 的行为，使其更符合特定的业务需求或标准规范。了解和正确配置 `sql_mode` 对于保证数据库的稳定性和数据的完整性至关重要。

从 GreatSQL 8.0.32-24 版本开始支持 Oracle 兼容，并新增支持设置 `sql_mode = ORACLE` 模式以适配 Oracle 语法及行为模式，详情请参考：[ORACLE MODE](../5-enhance/sql-compat/5-3-easyuse-ora-syntax-oraclemode.md)。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
