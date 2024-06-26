# 使用sysbench生成测试数据
sysbench是一个轻量级且功能强大的基准测试工具，用于评估系统的性能。它支持CPU、内存、线程和I/O等性能测试，并且特别适用于数据库的性能测试，如MySQL、GreatSQL等。通过模拟真实的应用场景和工作负载，sysbench可以帮助用户快速了解系统的性能瓶颈，并据此进行系统优化和硬件选型
## 安装sysbench

centos系统下安装sysbench
```bash
$ yum install sysbench -y
```
unbuntu系统下安装sysbench
```bash
$ apt-get install sysbench -y
```

若使用 yum / apt-get 安装不上，可尝试使用源码编译安装，详见：[sysbench性能测试](../10-optimze/3-1-benchmark-sysbench.md)

查看sysbench版本
```bash
$ sysbench --version
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta3)
```

## 生成测试数据
先创建默认的测试库，例如sysbench_test
登录GreateSQL
```bash
$ mysql -u root -p
```
创建测试库
```sql
greatsql> CREATE DATABASE sysbench_test;
Query OK, 1 row affected (0.03 sec)
```
执行以下命令，本章主要为了演示方法，因此把table_size设置的小一点
```bash
$ sysbench /usr/share/sysbench/oltp_read_write.lua --tables=5 --table_size=100 --mysql-user=root --mysql-password=GreatSQL@2024 --mysql-socket=/var/lib/mysql/mysql.sock --mysql-db=sysbench_test prepare

sysbench 1.0.20 (using system LuaJIT 2.0.5)
Creating table 'sbtest1'...
Inserting 100 records into 'sbtest1'
Creating a secondary index on 'sbtest1'...
Creating table 'sbtest2'...
Inserting 100 records into 'sbtest2'
Creating a secondary index on 'sbtest2'...
Creating table 'sbtest3'...
Inserting 100 records into 'sbtest3'
Creating a secondary index on 'sbtest3'...
Creating table 'sbtest4'...
Inserting 100 records into 'sbtest4'
Creating a secondary index on 'sbtest4'...
Creating table 'sbtest5'...
Inserting 100 records into 'sbtest5'
Creating a secondary index on 'sbtest5'...
```
参数说明：
- --tables：指定表数量，默认为1
- --table_size：指定表大小，默认为1000000
- --mysql-user：指定连接数据库的用户名，默认为root
- --mysql-password：指定连接数据库的密码，默认为空
- --mysql-socket：指定连接数据库的socket文件，默认为空
- --mysql-db：指定连接数据库的库名，默认为空
- prepare：指定执行sysbench的prepare阶段，即生成测试数据

执行完成后，会生成5张表，每张表大小为100行数据。
```sql
greatsql> use sysbench_test;

greatsql> SHOW TABLES;
+-------------------------+
| Tables_in_sysbench_test |
+-------------------------+
| sbtest1                 |
| sbtest2                 |
| sbtest3                 |
| sbtest4                 |
| sbtest5                 |
+-------------------------+
5 rows in set (0.01 sec)

greatsql> SELECT COUNT(*) FROM sbtest1;
+----------+
| COUNT(*) |
+----------+
|      100 |
+----------+
1 row in set (0.00 sec)
```


**问题反馈**
---



**联系我们**
---

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
