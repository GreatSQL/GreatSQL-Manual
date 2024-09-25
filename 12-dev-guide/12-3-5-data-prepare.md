# PREPARE 预处理语句
---

本节介绍在GreatSQL数据库中创建、使用及删除 PREPARE 预处理语句。

在GreatSQL中，预处理语句（也称为参数化查询或预编译语句）用于执行多次具有不同参数的相同或相似的SQL语句。预处理语句可以提高性能，因为数据库可以优化并重用查询计划，同时它们还可以帮助防止SQL注入攻击。

## 创建预处理语句
```sql
PREPARE stmt_name FROM preparable_stmt;
```
- stmt_name：预处理语句的名称。
- preparable_stmt：要预处理的SQL语句。

## 执行预处理语句
执行预处理语句前需要先使用 `SET` 语句设置变量
```sql
SET @{parameter_name} = {parameter_value};
```
- parameter_name：变量名。
- parameter_value：变量值。

设置变量完成后可使用`EXECUTE`语句执行
```sql
EXECUTE stmt_name [USING @var_name [, @var_name] ...];	
```
- stmt_name：预处理语句的名称。
- @var_name：变量名。

## 删除预处理语句
```sql
DEALLOCATE PREPARE stmt_name;
```
- stmt_name：预处理语句的名称。

## 示例

### 查询示例
创建一张user表，并插入三条数据
```sql
CREATE TABLE user (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(20) DEFAULT NULL, PRIMARY KEY (id));
INSERT INTO user VALUES (1, '刘一');
INSERT INTO user VALUES (2, '陈二');
INSERT INTO user VALUES (3, '张三');
```
创建一条名为`stmt1`的预处理语句，SQL语句中的参数使用问号(?)占位
```sql
greatsql> PREPARE stmt1 FROM 'SELECT id, name FROM user WHERE id = ?';
Query OK, 0 rows affected (0.01 sec)
Statement prepared
```
使用`SET`设置变量
```sql
greatsql> SET @id = 1;
Query OK, 0 rows affected (0.01 sec)
```
执行预处理语句
```sql
greatsql> EXECUTE stmt1 USING @id;
+----+--------+
| id | name   |
+----+--------+
|  1 | 刘一   |
+----+--------+
1 row in set (0.00 sec)
```
### 插入示例
使用 user 表 为例，需要插入一个 id 为 4, name 为 李四。因为 user 表的id主键字段包含 AUTO_RANDOM 属性，所以在插入时候不需要指定 id 的值。
```sql
greatsql> PREPARE `user_insert` FROM 'INSERT INTO `user` (name) VALUES (?);';
Query OK, 0 rows affected (0.02 sec)
Statement prepared
```
设置变量
```sql
greatsql> SET @name = '李四';
Query OK, 0 rows affected (0.00 sec)
```
执行预处理语句
```sql
greatsql> EXECUTE `user_insert` USING @name;
Query OK, 1 row affected (0.01 sec)
```
查看下表数据
```sql
greatsql> SELECT * FROM user;
+----+--------+
| id | name   |
+----+--------+
|  1 | 刘一   |
|  2 | 陈二   |
|  3 | 张三   |
|  4 | 李四   |
+----+--------+
4 rows in set (0.01 sec)
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
