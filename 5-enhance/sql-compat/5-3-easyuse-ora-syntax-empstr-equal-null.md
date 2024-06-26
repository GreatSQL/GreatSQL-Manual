# Oracle兼容-语法-空串''与NULL等价模式
---


## 1. 语法

```sql
SET GLOBAL|SESSION sql_mode = EMPTYSTRING_EQUAL_NULL;
```

## 2. 定义和用法

在启用 `sql_mode = EMPTYSTRING_EQUAL_NULL` 模式后，空字符串 `''` 将会被当做 `NULL` 来处理，但并不等同与 `NULL` 可以等价于空串 `''` 来使用。

开启 `EMPTYSTRING_EQUAL_NULL` 模式后不仅在做数据比较、统计、等使用的过程中有影响，原有数据空串在查询显示时也会转为 `NULL`，但不会修改原始存储数据（仅在查询展示时发生变化），如下例所示：
```sql
greatsql> SET sql_mode = DEFAULT;

greatsql> CREATE TABLE t1(id INT, c1 VARCHAR(10));
greatsql> INSERT INTO t1 VALUES (1,''), (2,NULL), (3,'str'), (4,'NULL');
greatsql> SELECT id, c1, HEX(c1) FROM t1;
+------+------+----------+
| id   | c1   | HEX(c1)  |
+------+------+----------+
|    1 |      |          |
|    2 | NULL | NULL     |
|    3 | str  | 737472   |
|    4 | NULL | 4E554C4C |
+------+------+----------+
4 rows in set (0.00 sec)

-- COUNT()不统计NULL值
greatsql> SELECT COUNT(*), COUNT(c1) FROM t1;
+----------+-----------+
| count(*) | count(c1) |
+----------+-----------+
|        4 |         3 |
+----------+-----------+
1 row in set (0.00 sec)

greatsql> SET sql_mode = EMPTYSTRING_EQUAL_NULL;
greatsql> SELECT id, c1, HEX(c1) FROM t1;
+------+------+----------+
| id   | c1   | HEX(c1)  |
+------+------+----------+
|    1 | NULL | NULL     |
|    2 | NULL | NULL     |
|    3 | str  | 737472   |
|    4 | NULL | 4E554C4C |
+------+------+----------+
4 rows in set (0.00 sec)

greatsql> SELECT COUNT(*), COUNT(c1) FROM t1;
+----------+-----------+
| count(*) | count(c1) |
+----------+-----------+
|        4 |         2 |
+----------+-----------+
1 row in set (0.00 sec)
```

开启 `EMPTYSTRING_EQUAL_NULL` 模式后，有几个注意事项：

- 1. 不允许为空的字段更新为`''`时，本应报错，但在该模式下只报WARN且能更新成功。这是因为目前在该模式下不包含严格模式，可以手动加上严格模式加以限制。

```
-- 在EMPTYSTRING_EQUAL_NULL模式下可更新成功
greatsql> SET sql_mode = EMPTYSTRING_EQUAL_NULL;
greatsql> UPDATE t1 SET c1 = '' WHERE id = 4;
Query OK, 1 row affected, 1 warning (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 1

-- 加上STRIC模式后更新失败
greatsql> SET sql_mode = 'EMPTYSTRING_EQUAL_NULL,STRICT_TRANS_TABLES,STRICT_ALL_TABLES';
greatsql> UPDATE t1 SET c1 = '' WHERE id = 3;
ERROR 1048 (23000): Column 'c1' cannot be null
```

- 2. 会影响部分性能，因为需要对数据内容进行具体转换判断是否为空串，影响处理速度。

- 3. 某些语句需要根据实际使用场景进行手动修改，例如：`SELECT * FROM t1 WHERE name ='';` 语句要修改为 `SELECT * FROM t1 WHERE name IS NULL` 二者才能等价。

- 4. 某些非空字段前期已经写入空串数据，此时查询或使用该字段时其空串会转为NULL。




**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
