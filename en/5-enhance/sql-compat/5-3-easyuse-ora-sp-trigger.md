# Oracle Compatibility - Stored Procedure - TRIGGER
---


## 1. Syntax

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

## 2. Definition and Usage

In `ORACLE` mode, GreatSQL stored procedures support most of the Oracle-style trigger syntax.

Enabling and disabling triggers is also supported in any mode.

## 3. Oracle Compatibility Notes

1. Using triggers on views is not supported, and the `INSTEAD OF` syntax is not supported.

2. The `OF` syntax after the `UPDATE` trigger condition is not supported.

3. In `ORACLE` mode, only the last created trigger is executed for the same trigger event; in `DEFAULT` mode, triggers for the same trigger event are executed one by one in the order they were created.

## 4. Examples

Note: In the following examples, `sql_generate_invisible_primary_key = OFF` has been set in advance, so when creating test tables, no hidden `my_row_id` column is automatically created even if no primary key column is explicitly specified. However, whether this option is enabled does not affect the normal use of trigger functionality.

Create test tables and initialize data
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(300) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1 Example 1: `INSERT`

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

- 2. Example 2: `INSERT OR UPDATE`

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

- 3. Example 3: `UPDATE OR DELETE`

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

- 4. Example 4: `WHEN` is supported

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

- 5. Example 5

After creating the above 4 triggers, execute the following tests:
```sql
-- In `ORACLE` mode, for the same trigger event, only the last created trigger is executed
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

-- In `DEFAULT` mode, for the same trigger event, triggers are executed one by one in the order they were created
greatsql> SET sql_mode = DEFAULT;

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

- 6. Example 6: enable/disable triggers

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





**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
