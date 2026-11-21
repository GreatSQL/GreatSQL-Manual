# sql_mode (SQL Mode)
---

In GreatSQL, `sql_mode` is a very important system variable. It controls how SQL statements are handled, including but not limited to data type checking, NULL handling, and date and time formatting.

By setting different `sql_mode` values, you can change the behavior of GreatSQL so that it conforms more closely to certain SQL standards, or enable or disable specific features.

`sql_mode` can be set at server startup, or changed dynamically at runtime.

## Setting and Viewing sql_mode

- **Global setting**: affects all clients that newly connect to the server

  ```sql
  SET GLOBAL sql_mode = 'mode1,mode2,...';
  ```

- **Session setting**: affects only the current client connection

  ```sql
  -- The SESSION keyword can also be omitted
  SET [SESSION] sql_mode = 'mode1,mode2,...';
  ```

- **Configuration file setting**: set in the my.cnf configuration file, taking effect for all connections established after the service starts

  ```ini
  [mysqld]
  sql_mode=mode1,mode2,...
  ```

- View the global sql_mode setting

  ```sql
  SELECT @@GLOBAL.sql_mode;
  ```

- View the sql_mode setting of the current session

  ```sql
  SELECT @@SESSION.sql_mode;
  ```


## Common sql_mode Values

- STRICT_TRANS_TABLES

When this mode is enabled, GreatSQL uses strict error handling for insert and update operations: data that does not conform to the data type constraints is rejected with an error instead of being silently converted or stored as NULL. It applies to transactional storage engines such as InnoDB.

- STRICT_ALL_TABLES

Similar to *STRICT_TRANS_TABLES*, but it applies to all storage engines, not only transactional storage engines.

- NO_ZERO_IN_DATE

Disallows the month or day part of a date field to be 0, for example '2024-00-22' or '2024-05-00'.

- NO_ZERO_DATE

Similar to *NO_ZERO_IN_DATE*, it disallows inserting a zero date ('0000-00-00'); attempting to insert such a date raises an error.

- ERROR_FOR_DIVISION_BY_ZERO

In the case of division by zero, an error is produced instead of a warning or a NULL result.

- NO_AUTO_CREATE_USER

Prevents the `GRANT` statement from automatically creating new users; new users must be created explicitly with `CREATE USER`.

- NO_ENGINE_SUBSTITUTION

If the specified storage engine is not available, GreatSQL raises an error instead of using the default storage engine.

- ANSI
Enables several SQL-standard-compliant mode options, such as REAL_AS_FLOAT, PIPES_AS_CONCAT, ANSI_QUOTES, and IGNORE_SPACE.

- ANSI_QUOTES

Enables ANSI SQL double quotes as the identifier quoting character instead of the string quoting character.

- TRADITIONAL
Makes GreatSQL stricter, similar to the strict SQL standard. It is usually used together with STRICT_TRANS_TABLES or STRICT_ALL_TABLES.

- ONLY_FULL_GROUP_BY

Requires that every column in the SELECT list is either part of an expression in the GROUP BY clause or included in an aggregate function, to prevent indeterminate results. This problem is often encountered when upgrading GreatSQL 5.7 to 8.0, where SQL statements in business systems may fail to run. In this case, consider temporarily removing this mode for a period, and re-enabling it after all business SQL statements have been modified and upgraded.

- IGNORE_SPACE

Allows spaces between a function name and the parenthesis that follows it.

## Impact of SQL Mode

- Insert and update operations

In strict mode (such as *STRICT_TRANS_TABLES* or *STRICT_ALL_TABLES*), GreatSQL blocks insert or update operations when a data error occurs. For example, if you try to insert a NULL value into a NOT NULL field, GreatSQL returns an error.

- Date and time values

When *NO_ZERO_IN_DATE* or *NO_ZERO_DATE* mode is enabled, inserting an invalid date such as '0000-00-00' raises an error. This helps guarantee data integrity.

- Empty strings and numbers

In strict mode, trying to insert an empty string into an integer field raises an error instead of automatically converting it to zero.

## How to Choose a SQL Mode

Choosing an appropriate SQL mode depends on your application requirements and data integrity requirements. Usually, the default sql_mode setting is sufficient.

It is recommended to enable strict mode as much as possible to prevent invalid data from entering the database, which helps ensure the accuracy and consistency of the data.

## Notes

- **Compatibility**: different `sql_mode` settings affect the compatibility of SQL statements, especially during database migration or when multiple database systems are used, such as the *ONLY_FULL_GROUP_BY* mode mentioned above.
- **Default value**: the default `sql_mode` may change with version upgrades, so special attention is needed during upgrades, and manual adjustment may be required to maintain the existing behavior.
- **Performance**: some `sql_mode` settings may affect query performance, especially those involving additional data validation or conversion.
- **Data validation**: using a strict `sql_mode` in development and test environments helps to find and fix data problems in advance and avoid surprises in production environments.

`sql_mode` is a powerful configuration option in GreatSQL. By setting different SQL modes, you can change the behavior of GreatSQL so that it conforms more closely to specific business requirements or standards. Understanding and correctly configuring `sql_mode` is essential for ensuring database stability and data integrity.

Starting from GreatSQL 8.0.32-24, Oracle compatibility is supported, and a new `sql_mode = ORACLE` mode is provided to adapt to Oracle syntax and behavior. For details, see: [ORACLE MODE](../5-enhance/sql-compat/5-3-easyuse-ora-syntax-oraclemode.md).



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
