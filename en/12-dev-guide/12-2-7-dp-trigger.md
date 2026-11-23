# Triggers
---


### What Is a Trigger

A trigger is a special database object that executes automatically when a specific database event occurs. Usually, a trigger fires before (`BEFORE`) or after (`AFTER`) an `INSERT`, `UPDATE`, or `DELETE` operation is performed on a table. Triggers help us implement complex business logic, data validation, and automated tasks.

The characteristics of triggers are as follows:
1. **Automatic**: the execution of a trigger is not invoked by a program or started manually, but is triggered by a predefined database event.
2. **Event-driven**: a trigger is bound to a specific database table and event (`INSERT`, `UPDATE`, `DELETE`). When the corresponding event occurs on the table, the trigger executes automatically.
3. **Flexible**: any number of SQL statements can be executed inside a trigger, including operations on other tables, implementing complex business logic.
4. **Cascading operations**: triggers can be used to implement cascading changes between data, for example, automatically updating the related data of another table after the data of one table is updated.

## Trigger Types

In GreatSQL, the following two trigger types are supported:
- **BEFORE trigger**: executes before the actual operation is performed; it can be used to validate or modify the data that is about to be inserted or updated.
- **AFTER trigger**: executes after the actual operation is performed; it can be used to write logs, send notifications, or perform further processing based on the changed data.

## Creating a Trigger

```sql
CREATE TRIGGER trigger_name
BEFORE | AFTER trigger_event ON table_name
FOR EACH ROW
BEGIN
    -- Trigger body logic; can contain multiple SQL statements
    ...
END;
```

- `trigger_name` is the name of the trigger
- `BEFORE` or `AFTER` specifies the trigger timing
- `trigger_event` is the trigger event (such as `INSERT`, `UPDATE`, `DELETE`)
- `table_name` is the name of the table on which the trigger acts
- `FOR EACH ROW` means the trigger is executed for each affected row.

## Old and New Values in Triggers

- Inside the trigger body, the `NEW` keyword can be used to access the new values of the inserted or updated row (for `INSERT` and `UPDATE` events).
- The `OLD` keyword is used to access the original values of the updated or deleted row (for `UPDATE` and `DELETE` events).

## Examples

- Creating a trigger

Suppose we have an orders table (orders) and an order log table (orders_log). Whenever a new order is inserted (`INSERT`) into the orders table, we want to automatically add a record to the order log table.

```sql
CREATE TRIGGER trg_after_insert_orders
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT orders_log(aid, order_id, order_created) VALUES(0, NEW.order_id, NOW());
END;
```

If you want to write to the order log table (orders_log) before inserting into the orders table (orders), you only need to change the `AFTER` keyword to `BEFORE`, as follows:

```sql
CREATE TRIGGER trg_before_insert_orders
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT orders_log(aid, order_id, order_created) VALUES(0, NEW.order_id, NOW());
END;
```

- Viewing triggers

```sql
greatsql> SHOW CREATE TRIGGER trg_after_insert_orders\G
*************************** 1. row ***************************
               Trigger: trg_after_insert_orders
              sql_mode: ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
SQL Original Statement: CREATE DEFINER=`root`@`localhost` TRIGGER `trg_after_insert_orders` AFTER INSERT ON `orders` FOR EACH ROW BEGIN
    INSERT orders_log(aid, order_id, order_created) VALUES(0, NEW.order_id, NOW());
END
  character_set_client: utf8mb4
  collation_connection: utf8mb4_0900_ai_ci
    Database Collation: utf8mb4_0900_ai_ci
               Created: 2024-05-22 17:40:15.94
                Status: ENABLED
```

You can also query the metadata table to view all triggers in a specified schema.

```sql
greatsql> SELECT * FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'orders'\G
*************************** 1. row ***************************
           TRIGGER_CATALOG: def
            TRIGGER_SCHEMA: orders
              TRIGGER_NAME: trg_after_insert_orders
        EVENT_MANIPULATION: INSERT
      EVENT_OBJECT_CATALOG: def
       EVENT_OBJECT_SCHEMA: tpch
        EVENT_OBJECT_TABLE: orders
              ACTION_ORDER: 1
          ACTION_CONDITION: NULL
          ACTION_STATEMENT: BEGIN
    INSERT orders_log(aid, order_id, order_created) VALUES(0, NEW.order_id, NOW());
END
        ACTION_ORIENTATION: ROW
             ACTION_TIMING: AFTER
ACTION_REFERENCE_OLD_TABLE: NULL
ACTION_REFERENCE_NEW_TABLE: NULL
  ACTION_REFERENCE_OLD_ROW: OLD
  ACTION_REFERENCE_NEW_ROW: NEW
                   CREATED: 2024-05-22 17:40:15.94
                  SQL_MODE: ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
                   DEFINER: root@localhost
      CHARACTER_SET_CLIENT: utf8mb4
      COLLATION_CONNECTION: utf8mb4_0900_ai_ci
        DATABASE_COLLATION: utf8mb4_0900_ai_ci
            TRIGGER_STATUS: ENABLED
```

- Dropping a trigger

```sql
DROP TRIGGER trg_after_insert_orders;
```


## Precautions

1. **Performance impact**: excessive or improper use of triggers may affect database performance, especially in highly concurrent environments. The use of triggers adds extra computational overhead, so performance issues require special attention when triggers are used in highly concurrent environments.
2. **Difficult debugging**: triggers execute automatically in the background, so debugging them is relatively difficult and requires careful planning and testing.
3. **Maintenance cost**: as the number of triggers increases, the complexity of database maintenance also increases, especially when triggers have dependencies among them.
4. **Security**: although triggers can enhance data security, over-reliance on triggers may make the database logic difficult to understand and manage.
5. **Portability**: the syntax and functionality of triggers may differ between database systems, which affects database migration.
6. **Recursive invocation of triggers**: a trigger is not allowed to invoke itself, nor is a trigger allowed to invoke another trigger. This prevents system crashes caused by infinite recursion.
7. **Unsupported usage**: SQL statements inside a trigger cannot invoke stored procedures with `CALL` and cannot use `LOAD DATA/XML` statements.
8. **Error handling**: if an error occurs in a trigger, the operations inside the trigger are rolled back, and the statement that fired the trigger also fails. A trigger is also part of a transaction; when the transaction is rolled back, the operations in the trigger are rolled back as well.

## Summary

Triggers play an important role in database automation and data integrity maintenance. They can be used to automatically execute complex business logic and ensure data consistency and integrity.

However, when using triggers, you need to pay attention to potential performance impact and recursive invocation issues.

With reasonable design and use of triggers, you can improve the automation level and data management capability of the database.

Starting from GreatSQL 8.0.32-24, Oracle compatibility is supported, and the trigger syntax has been extended. For details, see: [Oracle Compatibility - Stored Procedure - TRIGGER](../5-enhance/sql-compat/5-3-easyuse-ora-sp-trigger.md).



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
