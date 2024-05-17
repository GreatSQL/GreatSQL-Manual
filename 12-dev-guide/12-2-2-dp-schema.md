# Schema/库管理
---

## 什么是库
在GreatSQL中，库（schema）是逻辑上的概念，它对应着物理数据文件。它可以被视为一个电子化的文件柜，用于存储电子文件（即数据），并允许用户对这些数据进行各种操作，如新增、截取、更新和删除等

在GreatSQL中，你可以创建多个数据库（库），并在每个数据库中创建多个表来存储不同类型的数据。这种结构使得数据的管理和查询变得更加高效和灵活。同时，GreatSQL还提供了丰富的工具和命令来管理数据库和表，如创建、删除、修改表和查询数据等。

需要注意的是，虽然“库”和“数据库”在GreatSQL中通常指的是同一个概念，但在不同的数据库管理系统中，这两个术语的具体含义可能会有所不同。因此，在具体使用时需要根据所使用的数据库管理系统的文档和约定来确定其含义。

## 库的创建
在GreatSQL中，库的创建使用`CREATE SCHEMA`语句。
```sql
greatsql> CREATE SCHEMA [IF NOT EXISTS] db_name;
```
也可以带上字符集的创建库
```sql
greatsql> CREATE SCHEMA [IF NOT EXISTS] db_name CHARACTER SET utf8mb4;
```

## 库的删除
在GreatSQL中，库的删除使用`DROP SCHEMA`语句。
```sql
greatsql> DROP SCHEMA [IF EXISTS] db_name;
```
> 注意！删除库后，库下的所有表都会被全部删除，删除前一定要检查仔细
## 库的修改
在GreatSQL中，库的修改使用`ALTER SCHEMA`语句。
```sql
greatsql> ALTER SCHEMA [IF EXISTS] db_name;
```
## 库的查询
在GreatSQL中，库的查询使用`SHOW SCHEMA`语句。
```sql
greatsql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sakila             |
| world              |
+--------------------+
7 rows in set (0.00 sec)
```
- employees、sakila、world是安装的[样例数据库](./12-dev-guide.md)
- information_schema、mysql、performance_schema是GreatSQL自带的系统库
    - information_schema：存储了数据库中所有表的信息，如表名、列名、数据类型等
    - mysql：存储了GreatSQL的内置函数、权限等信息
    - performance_schema：存储了GreatSQL的性能信息，如查询的执行计划、锁等待等信息

查看完拥有的库后，可以使用`USE db_name`语句切换到指定库。
```sql
greatsql> USE world;
Database changed
```
## 创建时遵守的规则
对数据库对象采用统一的命名规则和标准，使得应用代码的可读性更强，便于他人阅读、理解和继承。详情可见：[Schema设计规范参考](../10-optimze/2-1-schema-design-refer.md)

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
