# 创建和写入失败

本章介绍 GreatSQL 中的创建和写入失败问题。

## 创建库表失败
例如在  GreatSQL  数据库中创建 world 库，报错：

```sql
greatsql> CREATE DATABASE world;
ERROR 1007 (HY000): Can't create database 'world'; database exists
```
错误码 1007 表示数据库已存在，无法创建。详见错误码列表 [GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)


或在 GreatSQL 数据库中创建 world 库下创建 city 表，报错：

```sql
greatsql> CREATE TABLE world.city (id INT, name VARCHAR(20));
ERROR 1050 (42S01): Table 'city' already exists
```
错误码 1050 表示表已存在，无法创建。详见错误码列表 [GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)

以上错误解决方法需在创建库表时加上`IF NOT EXISTS`关键字，如果库表存在，则不创建，也不会报错。

例如在  GreatSQL  数据库中创建 world 库，只会报 warning 而不报错：

```sql
greatsql> CREATE DATABASE IF NOT EXISTS world;
Query OK, 1 row affected, 1 warning (0.04 sec)

greatsql> SHOW WARNINGS;
+-------+------+------------------------------------------------+
| Level | Code | Message                                        |
+-------+------+------------------------------------------------+
| Note  | 1007 | Can't create database 'world'; database exists |
+-------+------+------------------------------------------------+
1 row in set (0.00 sec)

```
> 创建库创建表可以参考 [Schema/库管理](./12-2-2-dp-schema.md) 和 [Table/表管理](./12-2-3-dp-table.md)

## 写入失败

### 与唯一性约束冲突
例如在 GreatSQL 数据库中向 world 库写入数据，报错：

查看 world 库下 city 表的结构：

```sql
greatsql> DESC world.city;
+-------------+----------+------+-----+---------+----------------+
| Field       | Type     | Null | Key | Default | Extra          |
+-------------+----------+------+-----+---------+----------------+
| ID          | int      | NO   | PRI | NULL    | auto_increment |
| Name        | char(35) | NO   |     |         |                |
| CountryCode | char(3)  | YES  | MUL | NULL    |                |
| District    | char(20) | NO   |     |         |                |
| Population  | int      | NO   |     | 0       |                |
+-------------+----------+------+-----+---------+----------------+
5 rows in set (0.01 sec)
```

插入一条数据，报错：

```sql
greatsql> INSERT INTO world.city VALUES (1, 'Kabul', 'AFG', 'Nairobi', 1);
ERROR 1062 (23000): Duplicate entry '1' for key 'city.PRIMARY'
```
错误码 1062 表示主键重复，无法插入。表上有唯一性约束，再插入相同的记录时，系统就会报错。详见错误码列表 [ GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)

#### 解决方法

使用 `INSERT IGNORE INTO` 语句避免约束冲突，IGNORE 关键字可以忽略由于约束冲突导致的 INSERT 失败的影响。

例如在  GreatSQL  数据库中向 world 库写入数据，忽略约束冲突：

先查看表中数据

```sql
greatsql> SELECT * from world.city LIMIT 4075,5;
+------+----------+-------------+------------+------------+
| ID   | Name     | CountryCode | District   | Population |
+------+----------+-------------+------------+------------+
| 4076 | Hebron   | PSE         | Hebron     |     119401 |
| 4077 | Jabaliya | PSE         | North Gaza |     113901 |
| 4078 | Nablus   | PSE         | Nablus     |     100231 |
| 4079 | Rafah    | PSE         | Rafah      |      92020 |
| 4080 | greatsql | NULL        | GREATSQL   |       6666 |
+------+----------+-------------+------------+------------+
5 rows in set (0.00 sec)
```
插入两条数据，第一条数据ID和主键冲突，第二条数据没有冲突：
```sql
greatsql> INSERT IGNORE INTO world.city VALUES (4079, 'Kabul', 'AFG', 'Nairobi',1) , (4081, 'greatsql', 'CHN', 'greatsql',1);
Query OK, 1 row affected, 1 warning (0.01 sec)
Records: 2  Duplicates: 1  Warnings: 1
```

再次查看数据

```sql
greatsql> SELECT * from world.city LIMIT 4075,5;
+------+----------+-------------+------------+------------+
| ID   | Name     | CountryCode | District   | Population |
+------+----------+-------------+------------+------------+
| 4076 | Hebron   | PSE         | Hebron     |     119401 |
| 4077 | Jabaliya | PSE         | North Gaza |     113901 |
| 4078 | Nablus   | PSE         | Nablus     |     100231 |
| 4079 | Rafah    | PSE         | Rafah      |      92020 |
| 4080 | greatsql | NULL        | GREATSQL   |       6666 |
+------+----------+-------------+------------+------------+
5 rows in set (0.01 sec)
```
可以看到，第一条数据被忽略了，而第二条数据插入成功。

### 数据不符合字段类型

向 world 库的 city 表插入一条不符合字段数据类型的数据，报错：

查看 world 库下 city 表的结构：
```sql
greatsql> DESC world.city;
+-------------+----------+------+-----+---------+----------------+
| Field       | Type     | Null | Key | Default | Extra          |
+-------------+----------+------+-----+---------+----------------+
| ID          | int      | NO   | PRI | NULL    | auto_increment |
| Name        | char(35) | NO   |     |         |                |
| CountryCode | char(3)  | YES  | MUL | NULL    |                |
| District    | char(20) | NO   |     |         |                |
| Population  | int      | NO   |     | 0       |                |
+-------------+----------+------+-----+---------+----------------+
5 rows in set (0.01 sec)
```

向字段 Population 插入字符串数据，报错：

```sql
greatsql> INSERT INTO world.city VALUES (4082, ' GreatSQL ', 'CHN', ' GreatSQL ',' GreatSQL ');
ERROR 1366 (HY000): Incorrect integer value: ' GreatSQL ' for column 'Population' at row 1
```
错误码 1366 表示插入的数据类型与字段类型不匹配。详见错误码列表 [ GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)

### 解决方法

查看表结构，确认列数据类型，插入符合数据类型的数据。

若要更改数据类型详见 [Table/表管理](./12-2-3-dp-table.md) 中修改字段类型。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
