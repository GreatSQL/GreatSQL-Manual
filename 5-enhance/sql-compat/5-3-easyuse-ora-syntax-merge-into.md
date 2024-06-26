# Oracle兼容-语法-MERGE INTO
---


## 1. 语法

```sql
MERGE INTO target_tab_name [tab_alias]
    USING { tab_name | view | subquery } [tab_alias]
    ON ( condition )
    [ merge_update_clause ]
    [ merge_insert_clause ]
    ;

condition:
    valid JOIN condition

subquery:

merge_update_clause:
    WHEN MATCHED THEN UPDATE SET
    column_name = expr [,...]
    [ WHERE update_condition ]
    [ DELETE WHERE delete_condition ]
	
merge_insert_clause:
    WHEN NOT MATCHED THEN INSERT
    [ ( column_name [,...]  ) ]
    VALUES ( expr [,...] )
    [ WHERE insert_condition ]
```

## 2. 定义和用法

`MERGE INTO` 相当于 `UPDATE target_tab_name RIGHT OUTER JOIN tab_name ON (condition)`，当 `target_tab_name` 有相应匹配的数据时，就执行 `merge_update_clause` 子句；若无匹配数据时，则执行 `merge_insert_clause` 子句。

- `update_condition` 是根据更新前的内容来运算。当运算结果为真时，才会更新。
- `delete_condition` 是根据更新后的内容来运算。当运算结果为真时，才会刪除。
- `insert_condition` 是根据更新前的内容来运算。当运算结果为真时，才会插入新内容。

## 3. Oracle兼容说明

在原生 `UPDATE ... RIGHT OUTER JOIN ON` 的基础上，实现 `MERGE INTO` 语法兼容。但有以下限制：

- 对象 `target_tab_name` 必须是基本表，不可以是视图或派生表。

- 不支持 `EXPLAIN`。

- 在触发器（`trigger`） 内，无法禁止更新ON子句所引用的列。


## 4. 示例

```sql
greatsql> CREATE TABLE t1 (
 id BIGINT(10) PRIMARY KEY,
 name VARCHAR(16),
 sale BIGINT(10),
 operatime BIGINT);

greatsql> CREATE TABLE t2(
 id BIGINT(10),
 name VARCHAR(16),
 sale BIGINT(20),
 UNIQUE KEY `idx_id` (`id`));

greatsql> INSERT INTO t1 VALUES(1, 'Cindy', 1000, 1000), (2, 'James',  500, 1000);

greatsql> INSERT INTO t2 VALUES(1, 'Cindy',  300), (2, 'James',  400), (3,  'John',  900),(4, 'Peter', 1200);

greatsql> SELECT * FROM t1;
+----+-------+------+-----------+
| id | name  | sale | operatime |
+----+-------+------+-----------+
|  1 | Cindy | 1000 |      1000 |
|  2 | James |  500 |      1000 |
+----+-------+------+-----------+
2 rows in set (0.00 sec)

greatsql> SELECT * FROM t2;
+------+-------+------+
| id   | name  | sale |
+------+-------+------+
|    1 | Cindy |  300 |
|    2 | James |  400 |
|    3 | John  |  900 |
|    4 | Peter | 1200 |
+------+-------+------+
4 rows in set (0.00 sec)

greatsql> MERGE INTO t1
 USING t2
 ON ( t2.id = t1.id )
 WHEN MATCHED THEN
 UPDATE SET
  t1.name = t2.name,
  t1.sale = t2.sale + t1.id + 20
 WHERE 1 = 1
 WHEN NOT MATCHED THEN
 INSERT 
  VALUES (t2.id, t2.name, t2.sale + t2.id + 10, 1020);
Query OK, 4 rows affected (0.00 sec)
Rows matched: 2  Changed: 2  Inserted: 2  Deleted: 0  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+------+-----------+
| id | name  | sale | operatime |
+----+-------+------+-----------+
|  1 | Cindy |  321 |      1000 |
|  2 | James |  422 |      1000 |
|  3 | John  |  913 |      1020 |
|  4 | Peter | 1214 |      1020 |
+----+-------+------+-----------+

greatsql> DELETE FROM t1 WHERE id > 2;

greatsql> MERGE INTO t1
 USING t2
 ON ( t2.id = t1.id )
 WHEN MATCHED THEN
 UPDATE SET
  t1.name = t2.name,
  t1.sale = t2.sale + t1.id + 30;
Query OK, 2 rows affected (0.00 sec)
Rows matched: 2  Changed: 2  Inserted: 0  Deleted: 0  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+------+-----------+
| id | name  | sale | operatime |
+----+-------+------+-----------+
|  1 | Cindy |  331 |      1000 |
|  2 | James |  432 |      1000 |
+----+-------+------+-----------+

greatsql> MERGE INTO t1
 USING t2
 ON ( t2.id = t1.id )
  WHEN MATCHED THEN
  UPDATE SET
   t1.name = t2.name,
   t1.sale = t2.sale + t1.id + 40;
Query OK, 2 rows affected (0.00 sec)
Rows matched: 2  Changed: 2  Inserted: 0  Deleted: 0  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+------+-----------+
| id | name  | sale | operatime |
+----+-------+------+-----------+
|  1 | Cindy |  341 |      1000 |
|  2 | James |  442 |      1000 |
+----+-------+------+-----------+

greatsql> MERGE INTO t1
 USING t2
 ON ( t2.id = t1.id )
 WHEN NOT MATCHED THEN
 INSERT 
  VALUES (t2.id, t2.name, t2.sale + t2.id + 10, 3000);
Query OK, 2 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Inserted: 2  Deleted: 0  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+------+-----------+
| id | name  | sale | operatime |
+----+-------+------+-----------+
|  1 | Cindy |  341 |      1000 |
|  2 | James |  442 |      1000 |
|  3 | John  |  913 |      3000 |
|  4 | Peter | 1214 |      3000 |
+----+-------+------+-----------+
4 rows in set (0.00 sec)

greatsql> DELETE FROM t1 WHERE id > 2;
Query OK, 2 rows affected (0.00 sec)

greatsql> MERGE INTO t1
 USING t2
 ON ( t2.id = t1.id )
 WHEN NOT MATCHED THEN
 INSERT  
  (t1.id, t1.name, t1.sale, t1.operatime)
 VALUES
  (t2.id, t2.name, t2.sale + t2.id + 10, 4000);
Query OK, 2 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Inserted: 2  Deleted: 0  Warnings: 0

greatsql> SELECT * FROM t1;
+----+-------+------+-----------+
| id | name  | sale | operatime |
+----+-------+------+-----------+
|  1 | Cindy |  341 |      1000 |
|  2 | James |  442 |      1000 |
|  3 | John  |  913 |      4000 |
|  4 | Peter | 1214 |      4000 |
+----+-------+------+-----------+
4 rows in set (0.00 sec)
```



**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
