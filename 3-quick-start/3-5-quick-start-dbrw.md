# 访问数据库
---

成功安装 GreatSQL 后，就可以登入连接 GreatSQL 数据库，并执行 SQL 语句来操作和管理数据库。

GreatSQL 中除去部分新增的 [Oracle 兼容语法](../5-enhance/5-3-easyuse.md) 特性外，绝大多数语法和 MySQL 是完全一样的。

MySQL 相关 SQL 语法详见手册：[SQL Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html)。

本文档中所有操作都采用命令行模式下的 Cli 工具来演示。

## 连接登入GreatSQL数据库

有多种方式连入：

```bash
# 本机直接连入
$ mysql -uroot -p

# 本机指定socket文件连入
$ mysql -S/var/lib/mysql/mysql.sock -uroot -p

# 指定主机IP连入（假定本机IP地址是 172.17.0.3 ）
$ mysql -h172.17.0.3 -uroot -p
```

## 修改root用户密码

二进制及Docker方式快速安装GreatSQL后，数据库中的管理员用户root默认是空密码，安全起见，可以先修改密码：

```sql
-- 先查看当前用户
greatsql> SELECT USER();
+----------------+
| user()         |
+----------------+
| root@localhost |
+----------------+

-- 修改密码
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@202X';
Query OK, 0 rows affected (0.02 sec)
```
修改完成后，再次用root用户连入的话就可以用新密码了。

## 创建新用户

平时操作数据库时，尽量少用最高权限的root用户，避免误操作删除数据。最好创建新用户，并且只授予部分权限。

```sql
-- 先以root用户登入
-- mysql -uroot 

-- 创建新用户
CREATE USER GreatSQL@'172.17.0.0/16' IDENTIFIED BY 'GreatSQL-202X';


-- 创建一个新的用户库，并对GreatSQL用户授予读写权限
CREATE DATABASE GreatSQL;
GRANT ALL ON GreatSQL.* TO GreatSQL@'172.17.0.0/16';
```

## 操作 GreatSQL 读写数据

切换到普通用户GreatSQL登入，创建测试表，写入数据：
```sql
-- 先以普通用户登入GreatSQL
-- mysql -h172.17.0.3 -uGreatSQL -p'GreatSQL-202X'

-- 切换到GreatSQL数据库下
greatsql> USE GreatSQL;
Database changed

-- 创建新表
greatsql> CREATE TABLE t1(id INT PRIMARY KEY);
Query OK, 0 rows affected (0.07 sec)

-- 查看都有哪些数据表
greatsql> SHOW TABLES;
+--------------------+
| Tables_in_GreatSQL |
+--------------------+
| t1                 |
+--------------------+
1 row in set (0.00 sec)

-- 写入测试数据
greatsql> INSERT INTO t1 SELECT RAND()*1024;
Query OK, 1 row affected (0.05 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- 查询数据
greatsql> SELECT * FROM t1;
+-----+
| id  |
+-----+
| 203 |
+-----+
1 row in set (0.00 sec)
```
成功。

更多相关SQL命令/语法详见手册：[SQL Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html)。

更多基于 GreatSQL 的应用开发内容请参考：[应用开发](../12-dev-guide/12-dev-guide.md)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
