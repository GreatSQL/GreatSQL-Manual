# CLOEN备份恢复
---

本文介绍GreatSQL数据库如何采用CLONE进行备份恢复。

## 1. 关于CLONE
在GreatSQL中，CLONE是以插件（Plugin）方式运行的，也就是说可以在线启用和关闭。

利用CLONE插件，只需几行命令，即可很方便地实现备份GreatSQL数据库本地实例，也可以将远程实例备份到本地存储。

先理解两个新概念：
- `donor`节点（供应节点），提供备份数据的源节点
- `recipient`节点（接收节点），接收备份数据的目标节点

只有在远程备份的场景中才有donor和recipient节点的概念，如果是本地CLONE备份，不涉及到数据远程传输，也就无所谓了。

在远程备份场景中，在recipient节点上发起CLONE请求，接收来自donor节点的备份数据，并覆盖本地数据。当CLONE操作完成后，recipient节点和donor节点的数据一致，包括MySQL系统数据库等元数据信息。

CLONE操作的流程大致如下：
1. 在recipient节点上发起CLONE请求。
1. 在recipient节点上清除本地数据。
1. 在recipient节点接收&覆盖donor节点的数据文件。
1. 在recipient节点接收&覆盖donor节点的数据页。
1. 在recipient节点接收&覆盖donor节点的`Redo log`。
1. 在recipient节点接收&覆盖donor节点的数据文件。
1. recipient节点自重启（这时如果没有采用systemd等服务管理方式，可能会导致无法实现自重启，需要手动重启实例）。
1. recipient节点上执行`Crash recovery`操作，并提供服务。


下面是使用CLONE插件的几条注意事项及限制：
- 只支持复制InnoDB表数据（非InnoDB表只能复制表DDL，数据无法复制，即只会生成一个空表）。
- 不能跨版本间CLONE，比如5.7.x和8.0.x之间，以及8.0.25和8.0.32之间（版本号必须完全一致），并且只支持8.0.17及以上版本。
- 不支持CLONE binlog文件。
- 只能CLONE数据，不能同时CLONE系统配置（也就是说不能CLONE my.cnf及mysqld-auto.cnf等系统配置文件）。
- 在MySQL 8.0.27版本之前，CLONE期间donor节点上会阻塞所有DDL操作，包括`TRUNCATE TABLE`操作；从8.0.27版本（对应到GreatSQL的版本号是8.0.32-24）开始，CLONE期间不会阻塞DDL操作，详情请参考文档：[Cloning and Concurrent DDL](https://dev.mysql.com/doc/refman/8.0/en/clone-plugin-concurrent-ddl.html)。
- 一个donor节点同时只能为一个recipient节点提供数据，不能同时响应多个recipient节点的CLONE请求。
- 不支持通过MySQL Router连接时发起CLONE请求，也就是说只能是两个数据库实例间直接相互连接时才能发起CLONE请求。
- 当通用表空间（general tablespaces）创建时指定绝对路径，那么在CLONE备份到本地存储时会产生文件冲突报错（因为用了绝对路径的缘故）。

## 2. 使用CLONE备份数据
### 2.1 准备工作
上面提到，CLONE是以插件方式工作的，所以在开始用之前要先安装该插件：
```
greatsql> INSTALL PLUGIN clone SONAME 'mysql_clone.so';
```
只要 `plugin_dir` 选项设置无误，执行完上面命令即可完成插件安装。

如果要CLONE远程实例数据，则还需要给建立远程连接的用户至少加上相应的授权，在donor节点至少加上 `BACKUP_ADMIN` 权限，而在recipient节点至少加上 `CLONE_ADMIN` 授权。这样才能满足从donor节点CLONE数据，在recipient节点接收和覆盖数据的要求。

因为每个数据库实例有可能既是donor节点，又是recipient节点，如果是为了方便省事，可以在相关节点统一授予 `CLONE_ADMIN` 和 `BACKUP_ADMIN` 权限：
```
greatsql> GRANT CLONE_ADMIN, BACKUP_ADMIN ON *.* TO clone_user@'%';
```
如果对生产环境权限控制更为严格的话，最好还是区分清楚。

开始备份前，先在当前实例中，新建一个MyISAM表，并写入几行数据：
```
greatsql> USE greatsql;
greatsql> CREATE TABLE t4 (id INT PRIMARY KEY)ENGINE=myisam;
greatsql> INSERT INTO t4 SELECT RAND()*10240;
greatsql> INSERT INTO t4 SELECT RAND()*10240;
greatsql> INSERT INTO t4 SELECT RAND()*10240;
```

### 2.2 CLONE备份本地数据

执行下面的命令即可实现对本地实例的CLONE备份：
```
greatsql> CLONE LOCAL DATA DIRECTORY = '/data/backup/clone/20230831';
```
只要GreatSQL服务进程属主用户对本地存储目标路径有写入权限即可，并且上述路径如果没有先创建好，在CLONE备份时也会先行自动创建。

备份结束后，查看本地存储路径下都有哪些文件：
```
$ ls -l /data/backup/clone/20230831
drwxr-x--- 2 mysql mysql       89 Aug 31 14:54 '#clone'
drwxr-x--- 2 mysql mysql       91 Aug 31 14:54  greatsql
-rw-r----- 1 mysql mysql     5679 Aug 31 14:54  ib_buffer_pool
-rw-r----- 1 mysql mysql 12582912 Aug 31 14:54  ibdata1
drwxr-x--- 2 mysql mysql       23 Aug 31 14:54 '#innodb_redo'
drwxr-x--- 2 mysql mysql        6 Aug 31 14:54  mysql
-rw-r----- 1 mysql mysql 26214400 Aug 31 14:54  mysql.ibd
drwxr-x--- 2 mysql mysql       28 Aug 31 14:54  sys
drwxr-x--- 2 mysql mysql       27 Aug 31 14:54  sys_audit
-rw-r----- 1 mysql mysql 16777216 Aug 31 14:54  undo_001
-rw-r----- 1 mysql mysql 16777216 Aug 31 14:54  undo_002

$ ls -l /nvme/backup/clone/20230831/greatsql/
-rw-r----- 1 mysql mysql  92274688 Aug 31 15:18 t1.ibd
-rw-r----- 1 mysql mysql    114688 Aug 31 15:18 t2.ibd
-rw-r----- 1 mysql mysql    114688 Aug 31 15:18 t3.ibd
```
看到只备份了数据（包含redo和undo log，但没有double write buffer和ibtmp1文件），不备份系统配置文件，以及binlog、MyISAM表（没有t4.MYD等文件）。

如果把这个备份数据恢复到一个空实例并启动，就会发现存在表t4，但是个空表：
```
$ ls -la /data/GreatSQL-restore/greatsql
...
-rw-r-----  1 mysql mysql  92274688 Aug 31 15:18 t1.ibd
-rw-r-----  1 mysql mysql    114688 Aug 31 15:18 t2.ibd
-rw-r-----  1 mysql mysql    114688 Aug 31 15:18 t3.ibd
-rw-r-----  1 mysql mysql         0 Aug 31 15:25 t4.MYD
-rw-r-----  1 mysql mysql      1024 Aug 31 15:25 t4.MYI
```
上面仅处于测试目的创建MyISAM表，实际生产环境中强烈建议大家只使用InnoDB表。


### 2.3 CLONE备份远程数据
在开始备份远程节点数据前，需要先在recipient节点设置 `clone_valid_donor_list` 选项，指定donor节点：
```
greatsql> SET GLOBAL clone_valid_donor_list = '172.16.16.10:3306';
```
否则在执行CLONE备份时会报告下面的错误：
```
ERROR 3869 (HY000): Clone system configuration: 172.16.16.10:3306 is not found in clone_valid_donor_list:
```

都设置完毕后，就可以CLONE备份远程节点数据了：
```
greatsql> CLONE INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023';
Query OK, 0 rows affected (0.94 sec)

greatsql> \s
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    9
Current database: *** NONE ***
...
Uptime:                 1 sec    #<-- 可以看到实例被重启了
...

greatsql> SHOW GRANTS FOR repl;
+-----------------------------------------+
| Grants for repl@%                       |
+-----------------------------------------+
| GRANT USAGE ON *.* TO `repl`@`%`        |
| GRANT BACKUP_ADMIN ON *.* TO `repl`@`%` |
+-----------------------------------------+
```
在上面的测试案例中，donor节点的只对repl账户授予 `BACKUP_ADMIN` 权限，所以recipient节点CLONE完成后，该实例上的repl账户授权也被覆盖了，不再拥有 `CLONE_ADMIN` 权限。

在CLONE结束后，recipient节点实例会被自动执行 `SHUTDOWN` 关闭，如果该实例无法实现自动重启的话，就需要自行手动再次启动。因此建议采将数据库加入systemd服务管理中。

### 2.4 查看CLONE备份进度
在CLONE过程中，还支持实时查看其状态和进度：
```
# 查看状态
greatsql> SELECT * FROM performance_schema.clone_status\G
*************************** 1. row ***************************
             ID: 1
            PID: 12
          STATE: In Progress
     BEGIN_TIME: 2023-08-31 16:22:51.612
       END_TIME: NULL
         SOURCE: 127.0.0.1:3306
    DESTINATION: LOCAL INSTANCE
       ERROR_NO: 0
  ERROR_MESSAGE:
    BINLOG_FILE:
BINLOG_POSITION: 0
  GTID_EXECUTED:

# 查看进度
greatsql> SELECT * FROM performance_schema.clone_progress;
+------+-----------+-------------+----------------------------+----------------------------+---------+-------------+-------------+-------------+------------+---------------+
| ID   | STAGE     | STATE       | BEGIN_TIME                 | END_TIME                   | THREADS | ESTIMATE    | DATA        | NETWORK     | DATA_SPEED | NETWORK_SPEED |
+------+-----------+-------------+----------------------------+----------------------------+---------+-------------+-------------+-------------+------------+---------------+
|    1 | DROP DATA | Completed   | 2023-08-31 16:22:51.902263 | 2023-08-31 16:22:52.053017 |       1 |           0 |           0 |           0 |          0 |             0 |
|    1 | FILE COPY | In Progress | 2023-08-31 16:22:52.053083 | NULL                       |       4 | 66550469673 | 11625026601 | 11625667384 |   65408249 |      65411742 |
|    1 | PAGE COPY | Not Started | NULL                       | NULL                       |       0 |           0 |           0 |           0 |          0 |             0 |
|    1 | REDO COPY | Not Started | NULL                       | NULL                       |       0 |           0 |           0 |           0 |          0 |             0 |
|    1 | FILE SYNC | Not Started | NULL                       | NULL                       |       0 |           0 |           0 |           0 |          0 |             0 |
|    1 | RESTART   | Not Started | NULL                       | NULL                       |       0 |           0 |           0 |           0 |          0 |             0 |
|    1 | RECOVERY  | Not Started | NULL                       | NULL                       |       0 |           0 |           0 |           0 |          0 |             0 |
+------+-----------+-------------+----------------------------+----------------------------+---------+-------------+-------------+-------------+------------+---------------+

# 经过处理后可读性更好的视图

greatsql> SELECT STATE, CAST(BEGIN_TIME AS DATETIME) AS "START TIME",
CASE WHEN END_TIME IS NULL THEN
LPAD(sys.format_time(POWER(10,12) * (UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(BEGIN_TIME))), 10, ' ')
ELSE
LPAD(sys.format_time(POWER(10,12) * (UNIX_TIMESTAMP(END_TIME) - UNIX_TIMESTAMP(BEGIN_TIME))), 10, ' ')
END AS DURATION
FROM performance_schema.clone_status;
+-------------+---------------------+------------+
| STATE       | START TIME          | DURATION   |
+-------------+---------------------+------------+
| In Progress | 2023-08-31 16:22:52 |     5.26 m |
+-------------+---------------------+------------+

greatsql> SELECT STAGE, STATE, CAST(BEGIN_TIME AS TIME) AS "START TIME",
  CASE WHEN END_TIME IS NULL THEN
  LPAD(sys.format_time(POWER(10,12) * (UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(BEGIN_TIME))), 10, ' ')
  ELSE
  LPAD(sys.format_time(POWER(10,12) * (UNIX_TIMESTAMP(END_TIME) - UNIX_TIMESTAMP(BEGIN_TIME))), 10, ' ')
  END AS DURATION,
  LPAD(CONCAT(FORMAT(ROUND(ESTIMATE/1024/1024,0), 0), " MB"), 16, ' ') AS "Estimate",
  CASE WHEN BEGIN_TIME IS NULL THEN LPAD('0%', 7, ' ')
  WHEN ESTIMATE > 0 THEN
  LPAD(CONCAT(CAST(ROUND(DATA*100/ESTIMATE, 0) AS BINARY), "%"), 7, ' ')
  WHEN END_TIME IS NULL THEN LPAD('0%', 7, ' ')
  ELSE LPAD('100%', 7, ' ') END AS "Done(%)"
  FROM performance_schema.clone_progress;
+-----------+-------------+------------+------------+------------------+---------+
| STAGE     | STATE       | START TIME | DURATION   | Estimate         | Done(%) |
+-----------+-------------+------------+------------+------------------+---------+
| DROP DATA | Completed   | 16:22:52   |  150.75 ms |             0 MB |    100% |
| FILE COPY | In Progress | 16:22:52   |     4.22 m |        63,467 MB |     71% |
| PAGE COPY | Not Started | NULL       | NULL       |             0 MB |      0% |
| REDO COPY | Not Started | NULL       | NULL       |             0 MB |      0% |
| FILE SYNC | Not Started | NULL       | NULL       |             0 MB |      0% |
| RESTART   | Not Started | NULL       | NULL       |             0 MB |      0% |
| RECOVERY  | Not Started | NULL       | NULL       |             0 MB |      0% |
+-----------+-------------+------------+------------+------------------+---------+
```
通过这些元数据，即可推算出大概的总耗时，以及预计还需要多长时间才能完成。

**提醒：** 
1. 在CLONE过程中，如果被强行KILL终止的话，recipient节点上的数据会被清空，只剩下接近刚初始化完的新实例，请谨慎操作。
2. 从GreatSQL 8.0.32-24版本开始，CLONE支持加密备份及解密，详情请见文档：[CLONE备份加密](/5-enhance/5-4-security-clone-encrypt.md)。

在recipient节点上完成CLONE备份后，就等同于在recipient也做了一次数据恢复，这个节点还可以作为主从复制的从节点，也可以作为MGR组复制的新节点，一举多得。

**参考资料：**

- [The Clone Plugin](https://dev.mysql.com/doc/refman/8.0/en/clone-plugin.html)
- [Clone: Create MySQL instance replica](https://dev.mysql.com/blog-archive/clone-create-mysql-instance-replica/)
- [CLONE加密备份](/5-enhance/5-4-security-clone-encrypt.md)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
