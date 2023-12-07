# 导入测试数据集
---

安装完GreatSQL数据库后，如果是用于教学或测试场景，可以导入几个通用的测试数据集，主要有：
- Employees sample database，一个模拟
- world sample database
- Sakila sample database

## 1. 下载测试数据集压缩包
上述三个测试数据集下载地址分别是：
- https://github.com/datacharmer/test_db
- https://downloads.mysql.com/docs/world-db.tar.gz
- https://downloads.mysql.com/docs/sakila-db.tar.gz

分别下载到本地，并解压缩到 `/tmp/testdb` 目录下：
```
$ ls -l /tmp/testdb

drwxr-xr-x 2  500  500      100 Aug  1 06:06 sakila-db  #<--sakila 测试数据集
-rw------- 1 root root   732290 Aug  1 06:06 sakila-db.tar.gz
drwx------ 4 root root      460 Aug 29 15:33 test_db    #<--employees 测试数据集
-rw------- 1 root root 35607473 Aug 29 15:32 test_db-1.0.7.tar.gz
drwxr-xr-x 2  500  500       60 Aug  1 06:06 world-db   #<--world 测试数据集
-rw------- 1 root root    92916 Aug  1 06:06 world-db.tar.gz
```

## 2. 导入测试数据集
### 2.1 导入employees数据集
employees测试数据文件包中提供了导入方法说明，基本上照着做就行：
```
$ cd /tmp/testdb/test_db
$ cat README.md
...
```

开始导入（在这里，采用具有最高权限的root账户导入，所以略过创建测试账户这个环节，下同）：
```
$ mysql -f < employees.sql
INFO
CREATING DATABASE STRUCTURE
INFO
storage engine: InnoDB
INFO
LOADING departments
INFO
LOADING employees
INFO
LOADING dept_emp
INFO
LOADING dept_manager
INFO
LOADING titles
INFO
LOADING salaries
data_load_time_diff
00:02:28
```

导入完成后，还可以执行校验程序，确认导入的结果无误：
```
greatsql> source /tmp/testdb/test_db/test_employees_md5.sql;
+----------------------+
| INFO                 |
+----------------------+
| TESTING INSTALLATION |
+----------------------+
...
+--------------+------------------+----------------------------------+
| table_name   | expected_records | expected_crc                     |
+--------------+------------------+----------------------------------+
| departments  |                9 | d1af5e170d2d1591d776d5638d71fc5f |
| dept_emp     |           331603 | ccf6fe516f990bdaa49713fc478701b7 |
| dept_manager |               24 | 8720e2f0853ac9096b689c14664f847e |
| employees    |           300024 | 4ec56ab5ba37218d187cf6ab09ce1aa1 |
| salaries     |          2844047 | fd220654e95aea1b169624ffe3fca934 |
| titles       |           443308 | bfa016c472df68e70a03facafa1bc0a8 |
+--------------+------------------+----------------------------------+
...
+--------------+------------------+----------------------------------+
| table_name   | found_records    | found_crc                        |
+--------------+------------------+----------------------------------+
| departments  |                9 | d1af5e170d2d1591d776d5638d71fc5f |
| dept_emp     |           331603 | ccf6fe516f990bdaa49713fc478701b7 |
| dept_manager |               24 | 8720e2f0853ac9096b689c14664f847e |
| employees    |           300024 | 4ec56ab5ba37218d187cf6ab09ce1aa1 |
| salaries     |          2844047 | fd220654e95aea1b169624ffe3fca934 |
| titles       |           443308 | bfa016c472df68e70a03facafa1bc0a8 |
+--------------+------------------+----------------------------------+
...
+--------------+---------------+-----------+
| table_name   | records_match | crc_match |
+--------------+---------------+-----------+
| departments  | OK            | ok        |
| dept_emp     | OK            | ok        |
| dept_manager | OK            | ok        |
| employees    | OK            | ok        |
| salaries     | OK            | ok        |
| titles       | OK            | ok        |
+--------------+---------------+-----------+
..
+------------------+
| computation_time |
+------------------+
| 00:02:15         |
+------------------+
...
+---------+--------+
| summary | result |
+---------+--------+
| CRC     | OK     |
| count   | OK     |
+---------+--------+
```
看起来验证无误。

### 2.2 导入world数据集
执行下面的命令导入world数据集：
```
greatsql> source /tmp/testdb/world-db/world.sql;
...
greatsql> select count(*) from city;
+----------+
| count(*) |
+----------+
|     4079 |
+----------+

greatsql> select count(*) from country;
+----------+
| count(*) |
+----------+
|      239 |
+----------+

greatsql> select count(*) from countrylanguage;
+----------+
| count(*) |
+----------+
|      984 |
+----------+
```
导入完毕。

### 2.3 导入Sakila数据集
执行下面的命令初始化Sakila测试数据库：
```
greatsql> source /tmp/testdb/sakila-db/sakila-schema.sql;
greatsql> source /tmp/testdb/sakila-db/sakila-data.sql;
greatsql> select TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_ROWS 
from information_schema.tables where table_schema = 'sakila';
+--------------+----------------------------+------------+--------+------------+
| TABLE_SCHEMA | TABLE_NAME                 | TABLE_TYPE | ENGINE | TABLE_ROWS |
+--------------+----------------------------+------------+--------+------------+
| sakila       | actor                      | BASE TABLE | InnoDB |        200 |
| sakila       | actor_info                 | VIEW       | NULL   |       NULL |
| sakila       | address                    | BASE TABLE | InnoDB |        603 |
| sakila       | category                   | BASE TABLE | InnoDB |         16 |
| sakila       | city                       | BASE TABLE | InnoDB |        600 |
| sakila       | country                    | BASE TABLE | InnoDB |        109 |
| sakila       | customer                   | BASE TABLE | InnoDB |        599 |
| sakila       | customer_list              | VIEW       | NULL   |       NULL |
| sakila       | film                       | BASE TABLE | InnoDB |       1000 |
| sakila       | film_actor                 | BASE TABLE | InnoDB |       5462 |
| sakila       | film_category              | BASE TABLE | InnoDB |       1000 |
| sakila       | film_list                  | VIEW       | NULL   |       NULL |
| sakila       | film_text                  | BASE TABLE | InnoDB |       1000 |
| sakila       | inventory                  | BASE TABLE | InnoDB |       4581 |
| sakila       | language                   | BASE TABLE | InnoDB |          6 |
| sakila       | nicer_but_slower_film_list | VIEW       | NULL   |       NULL |
| sakila       | payment                    | BASE TABLE | InnoDB |      16500 |
| sakila       | rental                     | BASE TABLE | InnoDB |      16010 |
| sakila       | sales_by_film_category     | VIEW       | NULL   |       NULL |
| sakila       | sales_by_store             | VIEW       | NULL   |       NULL |
| sakila       | staff                      | BASE TABLE | InnoDB |          2 |
| sakila       | staff_list                 | VIEW       | NULL   |       NULL |
| sakila       | store                      | BASE TABLE | InnoDB |          2 |
+--------------+----------------------------+------------+--------+------------+
```
导入完毕。

接下来就可以运行查询和测试了。

关于测试数据库的更多详情参考 [**Other MySQL Documentation**](https://dev.mysql.com/doc/index-other.html)。


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
