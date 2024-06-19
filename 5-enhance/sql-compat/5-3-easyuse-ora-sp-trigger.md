# Oracle兼容-存储过程-触发器（`TRIGGER`）
---


## 1. 语法

```sql
1.
SET sql_mode = ORACLE;

CREATE [OR REPLACE] TRIGGER trigger_name
  trigger_time trigger_event
  ON tbl_name FOR EACH ROW
  [trigger_order]
  trigger_body

trigger_time: { BEFORE | AFTER }

trigger_event: { INSERT | UPDATE | DELETE | INSERT OR UPDATE | INSERT OR DELETE | UPDATE OR DELETE | INSERT OR UPDATE OR DELETE }

2. ALTER TRIGGER trigger_name [enable|disable]
```

## 2. 定义和用法

在 `ORACLE` 模式下，GreatSQL存储过程支持Oracle风格的触发器大部分语法。

同时也支持在任何模式下启用和禁用触发器。

## 3. Oracle兼容说明

1. 不支持在视图中使用触发器，不支持 `INSTEAD OF`语法

2. 不支持在 `UPDATE` 触发条件后跟这 `OF` 语法。

3. 在 `ORACLE` 模式下，相同触发事件只执行最后创建的触发器；而在 `DEFAULT` 模式下，相同触发事件按创建触发器的顺序逐个执行。

## 4. 示例

提示：下面的示例中，都已预先设置了 `sql_generate_invisible_primary_key = OFF`，所以创建测试表时，没有显式指定主键列也不会自动创建隐藏的 `my_row_id` 列。但是否启用该选项不影响触发器功能的正常使用。

创建测试表并初始化数据
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(300) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1 示例1：`INSERT`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE TRIGGER trg_t1_before_insert BEFORE INSERT 
ON t1 FOR EACH ROW
DECLARE
BEGIN
 IF :NEW.a < 0 THEN
  :NEW.b := '-trg_t1_before_insert INSERT' || :NEW.b;
 END IF;
END; //
```

- 2. 示例2：`INSERT OR UPDATE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE TRIGGER trg_t1_before_insert_or_update BEFORE INSERT OR UPDATE
ON t1 FOR EACH ROW
DECLARE
BEGIN
 IF :NEW.a < 0 THEN
  :NEW.b := '-trg_t1_before_insert_or_update INSERT OR UPDATE' || :NEW.b;
 END IF;
END; //
```

- 3. 示例3：`UPDATE OR DELETE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE TRIGGER trg_t1_before_update_or_delete BEFORE UPDATE OR DELETE
ON t1 FOR EACH ROW
DECLARE
BEGIN
 IF :NEW.a < 0 THEN
  :NEW.b := '-trg_t1_before_update_or_delete UPDATE OR DELETE' || :NEW.b;
 END IF;
END; //
```

- 4. 示例4：支持 `WHEN`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE TRIGGER trg_t1_before_update_or_insert BEFORE UPDATE OR INSERT
ON t1 FOR EACH ROW
WHEN(NEW.a < 0)
DECLARE
 a INT := 0;
BEGIN
 IF :NEW.a < 0 THEN
  :NEW.a := - :NEW.a;
  :NEW.b := '-trg_t1_before_update_or_insert UPDATE OR INSERT' || :NEW.b;
 END IF;
END; //
```

- 5. 示例5

创建完上述4个触发器之后，再执行下面的测试：
```sql
-- 在 `ORACLE` 模式下，相同触发事件只执行最后创建的触发器
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT * FROM t1;
+---+------+
| a | b    |
+---+------+
| 1 | row1 |
| 2 | row2 |
| 3 | row3 |
+---+------+

greatsql> INSERT INTO t1 VALUES(-4, '-row4');
Query OK, 1 row affected (0.00 sec)

greatsql> SELECT * FROM t1;
+---+-------------------------------------------------------+
| a | b                                                     |
+---+-------------------------------------------------------+
| 1 | row1                                                  |
| 2 | row2                                                  |
| 3 | row3                                                  |
| 4 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row4 |
+---+-------------------------------------------------------+

greatsql> UPDATE t1 SET a = -3, b = '-row3' WHERE a = 3;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * from t1;
+---+-------------------------------------------------------+
| a | b                                                     |
+---+-------------------------------------------------------+
| 1 | row1                                                  |
| 2 | row2                                                  |
| 3 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row3 |
| 4 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row4 |
+---+-------------------------------------------------------+

-- 而在 `DEFAULT` 模式下，相同触发事件按创建触发器的顺序逐个执行
greatsql> SET sql_mode = ORACLE;

greatsql> INSERT INTO t1 VALUES(-5, '-row5');
Query OK, 1 row affected (0.00 sec)

greatsql> SELECT * FROM t1;
+---+-----------------------------------------------------------------------------------------------------------------------------------+
| a | b                                                                                                                                 |
+---+-----------------------------------------------------------------------------------------------------------------------------------+
| 1 | row1                                                                                                                              |
| 2 | row2                                                                                                                              |
| 3 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row3                                                                             |
| 4 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row4                                                                             |
| 5 | -trg_t1_before_update_or_insert UPDATE OR INSERT-trg_t1_before_insert_or_update INSERT OR UPDATE-trg_t1_before_insert INSERT-row5 |
+---+-----------------------------------------------------------------------------------------------------------------------------------+

greatsql> UPDATE t1 SET a = -2, b = '-row2' WHERE a = 2;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

greatsql> SELECT * FROM t1;
+---+-------------------------------------------------------------------------------------------------------------------------------------------------------+
| a | b                                                                                                                                                     |
+---+-------------------------------------------------------------------------------------------------------------------------------------------------------+
| 1 | row1                                                                                                                                                  |
| 2 | -trg_t1_before_update_or_insert UPDATE OR INSERT-trg_t1_before_update_or_delete UPDATE OR DELETE-trg_t1_before_insert_or_update INSERT OR UPDATE-row2 |
| 3 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row3                                                                                                 |
| 4 | -trg_t1_before_update_or_insert UPDATE OR INSERT-row4                                                                                                 |
| 5 | -trg_t1_before_update_or_insert UPDATE OR INSERT-trg_t1_before_insert_or_update INSERT OR UPDATE-trg_t1_before_insert INSERT-row5                     |
+---+-------------------------------------------------------------------------------------------------------------------------------------------------------+
```

- 6. 示例6：启用/禁用触发器

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> ALTER TRIGGER trg_t1_before_update_or_delete DISABLE;
Query OK, 0 rows affected (0.00 sec)

greatsql> ALTER TRIGGER trg_t1_before_update_or_delete ENABLE;
Query OK, 0 rows affected (0.00 sec)


greatsql> SET sql_mode = DEFAULT;

greatsql> ALTER TRIGGER trg_t1_before_update_or_delete DISABLE;
Query OK, 0 rows affected (0.00 sec)

greatsql> ALTER TRIGGER trg_t1_before_update_or_delete ENABLE;
Query OK, 0 rows affected (0.00 sec)
```




- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
