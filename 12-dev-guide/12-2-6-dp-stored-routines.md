# Stored Routines/存储程序

## 概述

存储程序（Stored Routines）是存储在 GreatSQL 数据库中的一组预编译 SQL 语句，可以重复执行。

存储程序包括存储过程（Stored Procedures）和存储函数（Stored Functions），两者的主要区别在于存储函数会返回一个值，而存储过程不返回值。此外，存储过程需要执行 `CALL` 来调用，而存储函数执行 `SELECT` 调用。

存储程序可以提高数据库操作的效率、增强安全性和简化复杂的数据库操作。

## 存储过程（Stored Procedures）

存储过程是一种预定义的、存储在数据库中的 SQL 代码块，供应用程序调用执行。存储过程通常用于封装常见的数据库操作，例如数据插入、更新、删除等。

### 创建存储过程

使用 `CREATE PROCEDURE` 语句创建存储过程。以下是一个示例：

```sql
DELIMITER //
CREATE PROCEDURE myAdd(IN n1 INT, IN n2 INT, OUT s INT)
BEGIN
    SET s = n1 + n2;
END //
DELIMITER ;
```

- `DELIMITER`：更改语句结束符，以避免在存储过程的定义中使用默认的分号结束符。
- `CREATE PROCEDURE`：定义存储过程。
- `IN` 和 `OUT` 参数：分别表示输入参数和输出参数。
- `BEGIN` 和 `END`：存储过程的开始和结束。

### 调用存储过程

使用 `CALL` 语句调用存储过程：

```sql
CALL myAdd(5, 3, @s);
SELECT @s;  -- 输出 8
```

### 删除存储过程

使用 `DROP PROCEDURE` 语句删除存储过程：

```sql
DROP PROCEDURE IF EXISTS myAdd;
```

## 存储函数（Stored Functions）

存储函数是存储在数据库中的一段代码，返回一个单一值。

存储函数通常用于计算值、执行复杂计算等。

### 创建存储函数

使用 `CREATE FUNCTION` 语句创建存储函数。

以下是一个示例：

```sql
DELIMITER //
CREATE FUNCTION myMult(n1 INT, n2 INT) RETURNS INT
BEGIN
    RETURN n1 * n2;
END //
DELIMITER ;
```

- `RETURNS`：指定存储函数返回的数据类型。
- `RETURN`：返回存储函数的结果。

### 调用存储函数

存储函数可以像标准 SQL 函数一样调用：

```sql
SELECT myMult(5, 3);  -- 输出 15
```

### 删除存储函数

使用 `DROP FUNCTION` 语句删除存储函数：

```sql
DROP FUNCTION IF EXISTS myMult;
```

## 使用的注意事项

1. **错误处理**：在存储过程中使用 `DECLARE ... HANDLER` 语句进行错误处理，以便在出现错误时进行适当的处理。

2. **性能**：存储程序在服务器端执行，通常比在客户端执行的 SQL 语句更高效，特别是需要执行大量复杂操作时。

3. **安全性**：通过存储程序可以增强数据库的安全性，因为用户可以被授予对存储程序的执行权限，而无需对底层表直接访问权限。

4. **维护性**：存储程序使得复杂的业务逻辑集中在数据库中，代码更易于维护和更新。

5. **事务控制**：在存储程序中使用事务控制语句（如 `START TRANSACTION`, `COMMIT`, `ROLLBACK`）管理事务，以确保数据一致性。

6. **调试**：调试存储程序可能比较复杂，通常依赖于输出调试信息或使用 GreatSQL 提供的调试工具。

7. **版本兼容性**：不同版本的 GreatSQL 对存储程序的支持可能有所不同，尤其是在语法和特性上。

8. **参数限制**：GreatSQL 对存储程序参数的数量和类型有一定限制，设计复杂存储程序时需注意这些限制。

## 总结

GreatSQL 存储程序（Stored Routines）包括存储过程和存储函数，是强大的工具，可以封装复杂的业务逻辑，提高代码复用性、性能和安全性。在使用存储程序时，应注意合理设计和错误处理，以确保其稳定性和可维护性。

从 GreatSQL 8.0.32-24 版本开始支持 Oracle 兼容，对存储过程用法进行大量扩展，详情请参考：[Oracle 兼容之存储过程/函数兼容](https://greatsql.cn/docs/8.0.32-25/5-enhance/5-3-easyuse.html#%E5%AD%98%E5%82%A8%E8%BF%87%E7%A8%8B-%E5%87%BD%E6%95%B0%E5%85%BC%E5%AE%B9)。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
