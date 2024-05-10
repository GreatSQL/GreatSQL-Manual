# 应用开发（整理中，未完稿）
---

本章文档主要介绍如何基于 GreatSQL 进行应用开发，以及开发过程中涉及到的模式设计、事务控制、SQL优化等多方面内容。

本章文档内容大纲如下（大纲会根据实际情况调整，欢迎提建议补充）：

```
- 0. 概览
- 1. 连接到GreatSQL
  - 1.1 通过GreatSQL客户端连接
  - 1.2 通过GUI客户端连接
  - 1.3 选择驱动连接
  - 1.4 线程池 & 连接参数
  - 1.5 字符集、校验集
- 2. 模式开发设计
  - 2.1 概览
  - 2.2 Schema/库管理
  - 2.3 Table/表管理
  - 2.4 Index/索引管理
- 3. 数据写入
  - 3.1 插入数据
  - 3.2 更新数据
  - 3.3 删除数据
  - 3.4 替换数据
  - 3.5 预处理语句PREPARE
  - 3.6 生成随机测试数据
  - 3.7 使用sysbench生成测试数据
- 4. 数据读取
  - 4.1 单表查询
  - 4.2 多表查询
  - 4.3 子查询
  - 4.4 支持的函数
- 5. Oracle兼容
  - 5.1 Oracle兼容设计思路概述
  - 5.2 数据类型兼容
  - 5.3 SQL语法兼容
  - 5.4 函数兼容
  - 5.5 存储过程/函数兼容
  - 5.6 Oracle兼容常见问题
- 6. 事务控制
  - 6.1 事务管理概述
  - 6.2 事务管理
  - 6.3 事务隔离级别
  - 6.4 事务错误处理
- 7. 优化SQL性能
  - 7.1 概览
  - 7.2 几种常用SQL优化方法
  - 7.3 SQL优化最佳实践
  - 7.4 慢查询SQL处理办法
  - 7.5 事务、锁监控
  - 7.6 （待定）InnoDB并行查询
  - 7.7 （待定）Rapid引擎
- 8. 常见报错
  - 8.1 连接失败
  - 8.2 创建和写入失败
  - 8.3 查询失败
  - 8.4 其他常见报错处理
```

## 文档约定

在开始本章内容之前，请你根据 [GreatSQL快速上手](../3-quick-start/3-quick-start.md) 中的内容先行完成 GreatSQL 数据库安装。

在这里，我们选择了常见的 [RPM安装](../3-quick-start/3-1-quick-start-with-rpm.md) 方式完成GreatSQL数据库安装及初始化。

安装完成后，GreatSQL数据库运行环境如下：

- GreatSQL配置文件为：*/etc/my.cnf*
- GreatSQL服务程序文件为：*/usr/sbin/mysqld*
- 数据主目录datadir为： */var/lib/mysql*
- mysql.sock套接字文件为： */var/lib/mysql/mysql.sock*
- 错误日志文件为： */var/log/mysqld.log*
- 监听TCP端口为：*3306*
- CLI客户端为：*/usr/bin/mysql*
- 管理工具位：*/usr/bin/mysqladmin*
- GreatSQL数据库中root账户的密码已修改为：`GreatSQL@202X`

## 安装样例数据库

在本章内容中，所有展示的案例都基于以下几个样例数据库

- employee data (large dataset, includes data and test/verification suite)
- world database
- sakila database

打开链接 [https://dev.mysql.com/doc/index-other.html](https://dev.mysql.com/doc/index-other.html) ，页面滚动到 "Example Databases" 这部分内容，分别下载相应的压缩包文件，放在 `/data/ExampleDBs` 目录下。

分别解开压缩包文件：
```shell
$ cd /data/ExampleDBs
$ ls -la 
drwxr-xr-x 2  500  500        72 Jul  1  2023 sakila-db
-rw-r--r-- 1 root root    732287 Jul  1  2023 sakila-db.tar.gz
drwxr-xr-x 4 root root      4096 Jul  5  2023 test_db
-rw-r--r-- 1 root root  35607473 Dec  8  2021 test_db-1.0.7.tar.gz
drwxr-xr-x 2  500  500        23 Jul  1  2023 world-db
-rw-r--r-- 1 root root     92917 Jul  1  2023 world-db.tar.gz
```

连入GreatSQL，测试数据库可用
```shell
$ mysql -S /var/lib/mysql/mysql.sock -uroot -p -e 'SELECT VERSION()'
Enter password:   <-- 这里输入密码 GreatSQL@202X，支持复制粘贴方式
+-----------+
| VERSION() |
+-----------+
| 8.0.32-25 |
+-----------+
```
由于mysql.sock套接字文件默认位于 `/var/lib/mysql/mysql.sock`，下面的例子中将不再显式指定 `-S /var/lib/mysql/mysql.sock` 参数，如果在你的环境中不是这样，请自行修改参数值。

在本章内容中，为了使用方便，把数据库中的root账户密码修改为空，**但这是一种不安全行为，不推荐，请不要在生产环境中也这么做**。
```shell
# 修改root账户为空密码
$ mysqladmin -uroot -p'GreatSQL@202X' password ''
mysqladmin: [Warning] Using a password on the command line interface can be insecure.
Warning: Since password will be sent to server in plain text, use ssl connection to ensure password safety.

# 测试
$ mysqladmin -uroot ping
mysqld is alive
```

接下来分别导入这些样例数据：
```shell
# 导入sakila样例数据
$ cd /data/ExampleDBs/sakila-db
$ mysql -uroot -f < ./sakila-schema.sql
$ mysql -uroot -f < ./sakila-data.sql

# 导入employees样例数据
$ cd /data/ExampleDBs/test_db
$ mysql -uroot -f < ./employees.sql
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

# 验证employees样例数据
$ mysql -uroot -f -t < ./test_employees_md5.sql
+----------------------+
| INFO                 |
+----------------------+
| TESTING INSTALLATION |
+----------------------+
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
+------------------+
| computation_time |
+------------------+
| 00:00:35         |
+------------------+
+---------+--------+
| summary | result |
+---------+--------+
| CRC     | OK     |
| count   | OK     |
+---------+--------+

# 导入world样例数据
$ cd /data/ExampleDBs/world-db
$ mysql -uroot -f < ./world.sql
```

这就完成了3个样例数据库导入工作，再次查看导入结果：
```shell
$ mysql -uroot -e 'SHOW TABLE STATUS' employees
+----------------------+--------+---------+------------+---------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
| Name                 | Engine | Version | Row_format | Rows    | Avg_row_length | Data_length | Max_data_length | Index_length | Data_free | Auto_increment | Create_time         | Update_time         | Check_time | Collation          | Checksum | Create_options | Comment |
+----------------------+--------+---------+------------+---------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
| current_dept_emp     | NULL   |    NULL | NULL       |    NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 05:37:14 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| departments          | InnoDB |      10 | Dynamic    |       9 |           1820 |       16384 |               0 |        16384 |         0 |           NULL | 2024-04-24 05:37:12 | 2024-04-24 05:37:15 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| dept_emp             | InnoDB |      10 | Dynamic    |  331143 |             36 |    12075008 |               0 |      5783552 |   4194304 |           NULL | 2024-04-24 05:37:13 | 2024-04-24 05:37:41 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| dept_emp_latest_date | NULL   |    NULL | NULL       |    NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 05:37:14 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| dept_manager         | InnoDB |      10 | Dynamic    |      24 |            682 |       16384 |               0 |        16384 |         0 |           NULL | 2024-04-24 05:37:12 | 2024-04-24 05:37:41 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| employees            | InnoDB |      10 | Dynamic    |  299996 |             50 |    15220736 |               0 |            0 |   4194304 |           NULL | 2024-04-24 05:37:11 | 2024-04-24 05:37:26 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| expected_values      | InnoDB |      10 | Dynamic    |       6 |           2730 |       16384 |               0 |            0 |         0 |           NULL | 2024-04-24 05:40:54 | 2024-04-24 05:40:55 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| found_values         | InnoDB |      10 | Dynamic    |       5 |           3276 |       16384 |               0 |            0 |         0 |           NULL | 2024-04-24 05:40:54 | 2024-04-24 05:42:31 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| salaries             | InnoDB |      10 | Dynamic    | 2838709 |             33 |    95027200 |               0 |            0 |   4194304 |           NULL | 2024-04-24 05:37:14 | 2024-04-24 05:39:52 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| tchecksum            | InnoDB |      10 | Dynamic    | 3664655 |            132 |   484442112 |               0 |            0 | 212860928 |           NULL | 2024-04-24 05:40:55 | 2024-04-24 05:42:31 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| titles               | InnoDB |      10 | Dynamic    |  443318 |             46 |    20512768 |               0 |            0 |   4194304 |           NULL | 2024-04-24 05:37:13 | 2024-04-24 05:37:58 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
+----------------------+--------+---------+------------+---------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+

$ mysql -uroot -e 'SHOW TABLE STATUS' sakila
+----------------------------+--------+---------+------------+-------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
| Name                       | Engine | Version | Row_format | Rows  | Avg_row_length | Data_length | Max_data_length | Index_length | Data_free | Auto_increment | Create_time         | Update_time         | Check_time | Collation          | Checksum | Create_options | Comment |
+----------------------------+--------+---------+------------+-------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
| actor                      | InnoDB |      10 | Dynamic    |   200 |             81 |       16384 |               0 |        16384 |         0 |            201 | 2024-04-24 03:24:48 | 2024-04-24 03:25:32 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| actor_info                 | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:02 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| address                    | InnoDB |      10 | Dynamic    |   603 |            163 |       98304 |               0 |        16384 |         0 |            606 | 2024-04-24 03:24:48 | 2024-04-24 03:25:32 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| category                   | InnoDB |      10 | Dynamic    |    16 |           1024 |       16384 |               0 |            0 |         0 |             17 | 2024-04-24 03:24:50 | 2024-04-24 03:25:33 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| city                       | InnoDB |      10 | Dynamic    |   600 |             81 |       49152 |               0 |        16384 |         0 |            601 | 2024-04-24 03:24:50 | 2024-04-24 03:25:33 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| country                    | InnoDB |      10 | Dynamic    |   109 |            150 |       16384 |               0 |            0 |         0 |            110 | 2024-04-24 03:24:51 | 2024-04-24 03:25:33 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| customer                   | InnoDB |      10 | Dynamic    |   599 |            136 |       81920 |               0 |        49152 |         0 |            600 | 2024-04-24 03:24:51 | 2024-04-24 03:25:33 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| customer_list              | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:01 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| film                       | InnoDB |      10 | Dynamic    |  1000 |            196 |      196608 |               0 |        81920 |         0 |           1001 | 2024-04-24 03:24:52 | 2024-04-24 03:25:35 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| film_actor                 | InnoDB |      10 | Dynamic    |  5462 |             35 |      196608 |               0 |        81920 |         0 |           NULL | 2024-04-24 03:24:53 | 2024-04-24 03:25:36 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| film_category              | InnoDB |      10 | Dynamic    |  1000 |             65 |       65536 |               0 |        16384 |         0 |           NULL | 2024-04-24 03:24:53 | 2024-04-24 03:25:36 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| film_list                  | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:01 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| film_text                  | InnoDB |      10 | Dynamic    |  1000 |            180 |      180224 |               0 |        16384 |         0 |           NULL | 2024-04-24 03:24:54 | 2024-04-24 03:25:35 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| inventory                  | InnoDB |      10 | Dynamic    |  4581 |             39 |      180224 |               0 |       196608 |         0 |           4582 | 2024-04-24 03:24:57 | 2024-04-24 03:25:37 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| language                   | InnoDB |      10 | Dynamic    |     6 |           2730 |       16384 |               0 |            0 |         0 |              7 | 2024-04-24 03:24:58 | 2024-04-24 03:25:37 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| nicer_but_slower_film_list | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:01 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| payment                    | InnoDB |      10 | Dynamic    | 15813 |            100 |     1589248 |               0 |       638976 |   4194304 |          16050 | 2024-04-24 03:24:58 | 2024-04-24 03:25:41 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| rental                     | InnoDB |      10 | Dynamic    | 16008 |             99 |     1589248 |               0 |      1196032 |   4194304 |          16050 | 2024-04-24 03:24:59 | 2024-04-24 03:25:45 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| sales_by_film_category     | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:01 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| sales_by_store             | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:01 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| staff                      | InnoDB |      10 | Dynamic    |     2 |          32768 |       65536 |               0 |        32768 |         0 |              3 | 2024-04-24 03:25:00 | 2024-04-24 03:25:46 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| staff_list                 | NULL   |    NULL | NULL       |  NULL |           NULL |        NULL |            NULL |         NULL |      NULL |           NULL | 2024-04-24 03:25:01 | NULL                | NULL       | NULL               |     NULL | NULL           | VIEW    |
| store                      | InnoDB |      10 | Dynamic    |     2 |           8192 |       16384 |               0 |        32768 |         0 |              3 | 2024-04-24 03:25:00 | 2024-04-24 03:25:46 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
+----------------------------+--------+---------+------------+-------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+

$ mysql -uroot -e 'SHOW TABLE STATUS' world
+-----------------+--------+---------+------------+------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
| Name            | Engine | Version | Row_format | Rows | Avg_row_length | Data_length | Max_data_length | Index_length | Data_free | Auto_increment | Create_time         | Update_time         | Check_time | Collation          | Checksum | Create_options | Comment |
+-----------------+--------+---------+------------+------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
| city            | InnoDB |      10 | Dynamic    | 4046 |            101 |      409600 |               0 |       114688 |         0 |           4080 | 2024-04-24 05:49:31 | 2024-04-24 05:49:37 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| country         | InnoDB |      10 | Dynamic    |  239 |            479 |      114688 |               0 |            0 |         0 |           NULL | 2024-04-24 05:49:38 | 2024-04-24 05:49:40 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
| countrylanguage | InnoDB |      10 | Dynamic    |  984 |             99 |       98304 |               0 |        65536 |         0 |           NULL | 2024-04-24 05:49:40 | 2024-04-24 05:49:43 | NULL       | utf8mb4_0900_ai_ci |     NULL |                |         |
+-----------------+--------+---------+------------+------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+---------------------+------------+--------------------+----------+----------------+---------+
```
所有的测试样例数据都已成功导入。

接下来，可以开始GreatSQL数据库应用开发之旅了。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
