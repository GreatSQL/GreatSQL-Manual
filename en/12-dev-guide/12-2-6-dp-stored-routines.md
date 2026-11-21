# Stored Routines

## Overview

Stored routines are a set of precompiled SQL statements stored in the GreatSQL database that can be executed repeatedly.

Stored routines include stored procedures and stored functions. The main difference between them is that a stored function returns a value, whereas a stored procedure does not return a value. In addition, a stored procedure is invoked by executing `CALL`, whereas a stored function is invoked by executing `SELECT`.

Stored routines can improve the efficiency of database operations, enhance security, and simplify complex database operations.

## Stored Procedures

A stored procedure is a predefined block of SQL code stored in the database that is invoked and executed by applications. Stored procedures are usually used to encapsulate common database operations, such as data insert, update, and delete.

### Creating a Stored Procedure

Use the `CREATE PROCEDURE` statement to create a stored procedure. The following is an example:

```sql
DELIMITER //
CREATE PROCEDURE myAdd(IN n1 INT, IN n2 INT, OUT s INT)
BEGIN
    SET s = n1 + n2;
END //
DELIMITER ;
```

- `DELIMITER`: changes the statement terminator to avoid using the default semicolon terminator in the stored procedure definition.
- `CREATE PROCEDURE`: defines a stored procedure.
- `IN` and `OUT` parameters: represent input parameters and output parameters, respectively.
- `BEGIN` and `END`: the start and end of the stored procedure.

### Invoking a Stored Procedure

Use the `CALL` statement to invoke a stored procedure:

```sql
CALL myAdd(5, 3, @s);
SELECT @s;  -- Output: 8
```

### Dropping a Stored Procedure

Use the `DROP PROCEDURE` statement to drop a stored procedure:

```sql
DROP PROCEDURE IF EXISTS myAdd ;
```

## Stored Functions

A stored function is a piece of code stored in the database that returns a single value.

Stored functions are usually used to compute values, perform complex calculations, and so on.

### Creating a Stored Function

Use the `CREATE FUNCTION` statement to create a stored function.

The following is an example:

```sql
DELIMITER //
CREATE FUNCTION myMult(n1 INT, n2 INT) RETURNS INT
BEGIN
    RETURN n1 * n2;
END //
DELIMITER ;
```

- `RETURNS`: specifies the data type returned by the stored function.
- `RETURN`: returns the result of the stored function.

### Invoking a Stored Function

A stored function can be invoked like a standard SQL function:

```sql
SELECT myMult(5, 3);  -- Output: 15
```

### Dropping a Stored Function

Use the `DROP FUNCTION` statement to drop a stored function:

```sql
DROP FUNCTION IF EXISTS myMult ;
```

## Usage Precautions

1. **Error handling**: use the `DECLARE ... HANDLER` statement in stored procedures for error handling, so that appropriate action can be taken when an error occurs.

2. **Performance**: stored routines execute on the server side and are usually more efficient than SQL statements executed on the client side, especially when a large number of complex operations need to be performed.

3. **Security**: stored routines can enhance database security, because users can be granted the EXECUTE privilege on stored routines without being granted direct access to the underlying tables.

4. **Maintainability**: stored routines centralize complex business logic in the database, making the code easier to maintain and update.

5. **Transaction control**: use transaction control statements (such as `START TRANSACTION`, `COMMIT`, and `ROLLBACK`) in stored routines to manage transactions and ensure data consistency.

6. **Debugging**: debugging stored routines can be relatively complex and usually relies on outputting debugging information or using the debugging tools provided by GreatSQL.

7. **Version compatibility**: different versions of GreatSQL may support stored routines differently, especially in terms of syntax and features.

8. **Parameter limits**: GreatSQL has certain limits on the number and types of stored routine parameters. These limits must be taken into account when designing complex stored routines.

## Summary

GreatSQL stored routines include stored procedures and stored functions. They are powerful tools that can encapsulate complex business logic and improve code reusability, performance, and security. When using stored routines, pay attention to proper design and error handling to ensure their stability and maintainability.

Starting from GreatSQL 8.0.32-24, Oracle compatibility is supported, and the stored procedure syntax has been extensively extended. For details, see: [Oracle Compatibility - Stored Routine/Function Compatibility](https://greatsql.cn/docs/8.0.32-25/5-enhance/5-3-easyuse.html#%E5%AD%98%E5%82%A8%E8%BF%87%E7%A8%8B-%E5%87%BD%E6%95%B0%E5%85%BC%E5%AE%B9).



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
