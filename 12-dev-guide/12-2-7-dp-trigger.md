# Trigger/触发器
---


### 什么是 Trigger/触发器

Trigger（触发器）是数据库的一种特殊的对象，它会在特定的数据库事件发生时自动执行。通常，触发器会在对某个表进行 `INSERT`、`UPDATE` 或 `DELETE` 操作之前（`BEFORE`）或之后（`AFTER`）触发。触发器可以帮助我们实现复杂的业务逻辑、数据验证和自动化任务。

触发器的特点有以下几个：
1. **自动性**：触发器的执行不由程序调用或手动启动，而是由定义好的数据库事件触发。
2. **事件驱动**：触发器绑定到特定的数据库表和事件（`INSERT`、`UPDATE`、`DELETE`），当相应的事件在表上发生时，触发器自动执行。
3. **灵活性**：可以在触发器内部执行任意数量的SQL语句，包括对其他表的操作，实现复杂的业务逻辑。
4. **级联操作**：可用于实现数据之间的级联更改，例如在一个表的数据更新后，自动更新另一个表的相关数据。

## 触发器类型

在 GreatSQL 中，支持以下两种触发器类型：
- **BEFORE触发器**：在实际操作执行之前执行，可以用来验证或修改即将插入或更新的数据。
- **AFTER触发器**：在实际操作执行之后执行，可以用来记录日志、发送通知或基于已更改的数据进行进一步处理。

## 创建触发器

```sql
CREATE TRIGGER trigger_name
BEFORE | AFTER trigger_event ON table_name
FOR EACH ROW
BEGIN
    -- 触发器主体逻辑，可以包含多条SQL语句
    ...
END;
```

- `trigger_name`是触发器的名称
- `BEFORE`或`AFTER`指定了触发时机
- `trigger_event`是触发事件（如`INSERT`、`UPDATE`、`DELETE`）
- `table_name`是触发器作用的表名
- `FOR EACH ROW`表示对每一行受影响的数据都执行触发器。

## 触发器中的新旧值

- 在触发器体内，可以使用 `NEW` 关键字来访问被插入或更新的行的新值（对于 `INSERT` 和 `UPDATE` 事件）。
- 使用 `OLD` 关键字来访问被更新或删除的行的原始值（对于 `UPDATE` 和 `DELETE` 事件）。

## 示例

- 创建触发器

假设我们有一个订单表（orders）和一个订单记录表（orders_log），每当有新订单插入（`INSERT`）到订单表时，我们希望自动增加一次订单记录表。

```sql
greatsql> CREATE TRIGGER trg_after_insert_orders
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT orders_log(aid, order_id, order_created) VALUES(0, NEW.order_id, NOW());
END;
```

如果是想要在插入订单表（orders）前先写入订单记录表（orders_log），则只需要将 `AFTER` 关键字改成 `BEFORE`，像下面这样：

```sql
greatsql> CREATE TRIGGER trg_before_insert_orders
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT orders_log(aid, order_id, order_created) VALUES(0, NEW.order_id, NOW());
END;
```

- 查看触发器

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

也可以通过查询 元数据表，查看指定 Schema 中的所有触发器

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

- 删除触发器

```sql
greatsql> DROP TRIGGER trg_after_insert_orders;
```


## 注意事项

1. **性能影响**：触发器的过度使用或不当设计可能会影响数据库的性能，尤其是在高并发环境下。触发器的使用会增加额外的计算开销，因此在高并发环境下使用触发器时需要特别注意性能问题。
2. **调试困难**：触发器在后台自动执行，调试相对困难，需要仔细规划和测试。
3. **维护成本**：随着触发器数量的增加，数据库的维护复杂度也会增加，特别是当触发器之间存在依赖关系时。
4. **安全性**：虽然触发器可以增强数据安全性，但过度依赖触发器可能导致数据库逻辑变得难以理解和管理。
5. **移植性**：不同数据库系统之间触发器的语法和功能可能有所差异，影响数据库迁移。
6. **触发器的递归调用**：不允许触发器调用自身，也不允许一个触发器调用另一个触发器。这是为了防止无限递归导致的系统崩溃。
7. **不支持的用法**：触发器内的 SQL 语句不能使用 `CALL` 调用存储过程，不能使用 `LOAD DATA/XML` 语句。
8. **错误处理**：如果在触发器中发生错误，触发器内的操作将被回滚，并且触发器所在的语句也会失败。触发器也是事务的一部分，当事务回滚，触发器中的操作也会回滚。


触发器在数据库自动化操作和数据完整性维护中起着重要作用。它们可以用于自动执行复杂的业务逻辑，确保数据一致性和完整性。

然而，在使用触发器时，需要注意潜在的性能影响和递归调用问题。

通过合理设计和使用触发器，可以提高数据库的自动化水平和数据管理能力。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
