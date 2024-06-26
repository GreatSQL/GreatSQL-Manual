# REPLACE 替换数据
---

本节介绍使用 REPLACE 命令替换GreatSQL中的数据。

## REPLACE INTO 语句
可以理解为是`INSTER`的增强版，如果存在则更新，如果不存在则插入。
`REPLACE INTO` 语句语法格式如下：
```sql
REPLACE INTO table_name VALUES(value_list);
```
举例如下：

创建一张`t1`表：
```sql
CREATE TABLE t1 (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  data VARCHAR(64) DEFAULT NULL,
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
Query OK, 0 rows affected (0.03 sec)
```
插入一条数据
```sql
greatsql> REPLACE INTO t1 VALUES (1, 'Old', '2024-05-8 13:58:00');
Query OK, 1 row affected (0.05 sec)
```
此时插入以下数据，会更新id为1的数据
```sql
greatsql> REPLACE INTO t1 VALUES (1, 'New', '2024-05-8 14:00:00');
Query OK, 2 rows affected (0.05 sec)

greatsql> SELECT * FROM t1;
+----+------+---------------------+
| id | data | ts                  |
+----+------+---------------------+
|  1 | New  | 2024-05-08 14:00:00 |
+----+------+---------------------+
1 row in set (0.00 sec)
```
`REPLACE INTO` 首先尝试插入数据到表中
1. 如果表中已有此行数据（根据主键或者唯一索引判断）则先删除此行数据，然后插入新的数据。 
2. 如果表中没有此行数据，则直接插入新数据。

若插入的数据不包含主键或者唯一索引，则直接插入新数据
```sql
greatsql> REPLACE INTO t1(data,ts) VALUES ('New', '2024-05-8 14:00:00');
greatsql> SELECT * FROM t1;
+----+------+---------------------+
| id | data | ts                  |
+----+------+---------------------+
|  1 | New  | 2024-05-08 14:00:00 |
|  2 | New  | 2024-05-08 14:00:00 |
+----+------+---------------------+
2 rows in set (0.00 sec)
```
## RENAME TABLE 与外键

当使用 `REPLACE INTO` 语句在GreatSQL中插入或替换记录时，如果涉及到外键约束，并且尝试替换的记录被其他表的外键引用，会造成数据被删除。

假设有两个表：一个是`主表（main_table）`，另一个是`从表（sub_table）`，并且 `sub_table` 有一个外键字段指向 `main_table` 的主键。
```sql
CREATE TABLE main_table (  
    id INT AUTO_INCREMENT PRIMARY KEY,  
    name VARCHAR(50) NOT NULL  
);  
  
CREATE TABLE sub_table (  
    id INT AUTO_INCREMENT PRIMARY KEY,  
    main_id INT,  
    data VARCHAR(50),  
    FOREIGN KEY (main_id) REFERENCES main_table(id) ON DELETE CASCADE  
);
```
在这个例子中，`sub_table` 的 `main_id` 字段是一个外键，它引用了 `main_table` 的 id 字段。如果我们在 `main_table` 中有一条记录被 `sub_table` 中的一条或多条记录引用，并且我们尝试使用 `REPLACE INTO` 来替换 `main_table` 中的这条记录，会导致`sub_table`表中原先引用`main_table` id 字段的数据丢失。

```sql
-- 在 main_table 中插入一条记录  
greatsql> INSERT INTO main_table (name) VALUES ('Record 1');
Query OK, 1 row affected (0.01 sec)
-- 查看 main_table 中的记录  
greatsql> SELECT * FROM main_table;
+----+----------+
| id | name     |
+----+----------+
|  1 | Record 1 |
+----+----------+
1 row in set (0.00 sec)

-- 在 sub_table 中插入两条记录，该记录引用了 main_table 中的 id 字段  
greatsql> INSERT INTO sub_table (main_id, data) VALUES (1, 'SubData 1');  
greatsql> INSERT INTO sub_table (main_id, data) VALUES (1, 'SubData 2');  
Query OK, 1 row affected (0.05 sec)

-- 可以看到 sub_table 中有两条记录
greatsql> SELECT * FROM sub_table;
+----+---------+-----------+
| id | main_id | data      |
+----+---------+-----------+
|  1 |       1 | SubData 1 |
|  2 |       1 | SubData 2 |
+----+---------+-----------+
2 rows in set (0.00 sec)
  
-- 现在尝试使用 REPLACE INTO 替换 main_table 中的记录  
greatsql> REPLACE INTO main_table (id, name) VALUES (1, 'New Record 1');
-- 查看 main_table 中的记录  
greatsql> SELECT * FROM main_table;
+----+--------------+
| id | name         |
+----+--------------+
|  1 | New Record 1 |
+----+--------------+
1 row in set (0.00 sec)

-- 查看 sub_table 中的记录，发现原来的引用main_table 表 id 字段的数据被删除了
greatsql> SELECT * FROM sub_table;
Empty set (0.00 sec)
```

## REPLACE INTO 注意事项
1. 插入数据的表必须有主键或者是唯一索引！否则的话，`REPLACE INTO` 会直接插入数据，这将导致表中出现重复的数据。
2. 在有外键的情况下使用`REPLACE INTO`，如果被替换的记录被其他表的外键引用，会造成数据被删除。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
