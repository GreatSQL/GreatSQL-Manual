# 查询失败
本章介绍 GreatSQL 中查询失败的常见原因。

## 查询表或字段不存在
查询表或字段不存在，通常是因为表名拼写错误。

例如，查询表 `world.city` 时，如果写成 `SELECT * FROM world.city`，则报错：

```sql
greatsql> SELECT * FROM world.city;
ERROR 1146 (42S02): Table 'world.city' doesn't exist
```
错误码为`1146`，表示表不存在。详见错误码列表 [ GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)

查询表`world.city` 字段Name时，如果写成`SELECT names FROM world.city`，则报错：

```sql
greatsql> SELECT names FROM world.city;
ERROR 1054 (42S22): Unknown column 'names' in 'field list'
```
错误码为`1054`，表示字段不存在。详见错误码列表 [ GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)

### 解决方法
使用正确的表名或字段名。

可使用`SHOW DATABASES;`命令查看当前数据库中所有库。

可使用`SHOW TABLES;`命令查看当前数据库中所有表

可使用`SHOW COLUMNS FROM world.city;`命令查看表`world.city`的字段。

## 权限问题

用户没有足够的权限来执行查询操作

创建一个名为user1的 GreatSQL 用户，并限制该用户只能查询world数据库下的city表

```sql
 greatsql> CREATE USER 'user1'@'%' IDENTIFIED BY 'password123';
```
并使用该账户登录 GreatSQL 数据库

```sql
$ mysql -uuser1 -ppassword123    
```
登录后，使用`SHOW DATABASES;`命令查看当前数据库中所有库，可以看到只有world库。

```sql
greatsql> SHOW DATABASES;
+--------------------+
| DATABASES          |
+--------------------+
| information_schema |
| performance_schema |
| world              |
+--------------------+
3 rows in set (0.00 sec)
```
若要查询 employees 库下的 employees 表则会报错：

```sql
greatsql> SELECT * FROM employees.titles LIMIT 5;
ERROR 1142 (42000): SELECT command denied to user 'user1'@'localhost' for table 'titles'
```
错误码为`1142`，表示用户没有权限。详见错误码列表 [ GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)

### 解决方法
使用root用户，向用户 user1 授予权限，使其可以查询 employees 库下的所有表。

```bash
$ mysql -uroot -p
```
向用户 user1 授予权限

```sql
greatsql> GRANT ALL ON employees.* TO 'user1'@'%';
```



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
