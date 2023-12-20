# mysqldump备份恢复
---

本文介绍GreatSQL数据库如何采用 `mysqldump` 进行备份恢复。

`mysqldump` 是GreatSQL数据库自带的逻辑备份工具，可以实现对整个数据库、单库、单表，以及表中部分数据进行备份等多种方式。

## 1. 全库备份
运行 `mysqldump` 时指定 `-A / --all-databases` 参数可以备份全库数据，如果还要备份存储过程、存储函数、视图、event时，还需要再指定 `--triggers --routines --events` 这三个参数：
```
$ mysqldump -S/data/GreatSQL/mysql.sock -A --triggers --routines --events > /backup/GreatSQL/fullbackup-`date +'%Y%m%d'`.sql
```
这就完成了备份全部数据，并且备份触发器、存储函数、event等其他元数据。

如果不想备份触发器、存储函数、event的话，则去掉上述几个选项 `--triggers --routines --events`。

通常，在进行逻辑备份时，还会利用管道同步压缩，使得备份文件更小：
```
$ mysqldump -S/data/GreatSQL/mysql.sock -A --triggers --routines --events | gzip > /backup/GreatSQL/fullbackup-`date +'%Y%m%d'`.sql.gz
```

## 2. 单库备份

```
$ export db="greatsql"
$ mysqldump -S/data/GreatSQL/mysql.sock --triggers --routines --events -B ${db} | gzip > /backup/GreatSQL/${db}-`date +'%Y%m%d'`.sql.gz
```

如果不是备份全库数据，此时可能会有如下提示：
```
Warning: A partial dump from a server that has GTIDs will by default include the GTIDs of all transactions, even those that changed suppressed parts of the database. If you don't want to restore GTIDs, pass --set-gtid-purged=OFF. To make a complete dump, pass --all-databases --triggers --routines --events.
```

大意是本次是部分数据备份，无法用于全量恢复，因此加上 `gtid_purged` 有一定风险，建议手动加上选项 `--set-gtid-purged=OFF`。

这个选项建议不要加上，如果本次的逻辑备份文件用于后面的恢复时，再利用sed去掉 `gtid_purged` 信息，或者恢复之前先记录当时的 `gtid_purged` 信息，恢复结束后再还原回去。

## 3. 单表备份

```
$ export db="greatsql"
$ export table="t1"
$ mysqldump -S/data/GreatSQL/mysql.sock --triggers --routines --events ${db} ${table} | gzip > /backup/GreatSQL/${db}-${table}-`date +'%Y%m%d'`.sql.gz
```

## 4. 只备份部分数据

运行 `mysqldump` 时，加上 `-w / --where` 选项，可以指定 WHERE过滤条件，达到只备份某一部分数据的目的，例如：
```
$ export db="greatsql"
$ export table="t1"

# 只备份单表的部分数据
$ mysqldump -S/data/GreatSQL/mysql.sock -w "id>=10000" ${db} ${table} > /backup/GreatSQL/${db}-${table}-partial-`date +'%Y%m%d'`.sql

# 备份单库所有表的部分数据
$ mysqldump -S/data/GreatSQL/mysql.sock -f -w "id>=10000" -B ${db} > /backup/GreatSQL/${db}-partial-`date +'%Y%m%d'`.sql
```

如果个别表没有where条件中指定的列名，则会报告类似下面的错误：
```
mysqldump: Couldn't execute 'SELECT /*!40001 SQL_NO_CACHE */ * FROM `t4` WHERE id>=1000000': Unknown column 'id' in 'where clause' (1054)
```

加上选项 `-f / --force` 后，备份任务依然可以继续，不影响后面其他表的备份。

## 5. 逻辑备份恢复

`mysqldump` 逻辑备份文件恢复时很简单，只需调用mysql客户端执行恢复，有两种方式：

在mysql客户端工具里，执行 `source` 指令导入SQL文件，这种方式的缺点是终端会一直输出执行的结果，很不友好。用法是：
```
> USE db;
> SOURCE path/file.sql;
```

例如：
```
greatsql> USE greatsql;
greatsql> SOURCE /backup/GreatSQL/greatsql-20230830.sql;
```
**提示：** 如果要恢复的SQL文件中不包含 `use db` 这样切换到指定库名的话，就需要先自己手动执行 `use db` 这个操作。

或者利用命令行的重定向方式：
```
$ mysql -f -S/data/GreatSQL/mysql.sock greatsql < /backup/GreatSQL/greatsql-20230830.sql;
```
**提示：** 如果要恢复的SQL文件中不包含 `use db` 这样切换到指定库名的话，就需要在调用mysql客户端时指定相应的库名`greatsql`，下同。

又或者在操作系统命令行模式下，直接用管道方式导入SQL文件：
```
$ cat /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock greatsql
```

甚至还可以利用 `sed` 提取实现只恢复部分数据。

例1：提取备份文件中，数据库db1到db2之间的所有数据，即只恢复db1这个库
```
$ export DB1="db1"
$ export DB2="db2"
$ sed -n "/^-- Current Database: \`$DB1\`/,/^-- Current Database: \`$DB2\`/p" /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock
```

例2：提取备份文件中，数据表tb1到tb2之间的所有数据，即只恢复tb1这个表
```
TB1="tb1"
TB2="tb2"
$ sed -n "/^-- Table structure for table \`$TB1\`/,/^-- Table structure for table \`$TB2\`/p" /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock greatsql
```

例3：向 `sed` 传递参数，只提取指定行号的数据：
```
$ sed -n "100,200p" /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock greatsql
```
即：提取备份文件中第100-200行之间的数据进行恢复。


更多关于 `mysqldump` 更详细说明详见文档：[mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)。

从GreatSQL 8.0.32-24版本开始，`mysqldump`支持加密备份，详情见文档：[mysqldump备份加密](../5-enhance/5-4-security-mysqldump-encrypt.md)。

**参考资料：**

- [mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
- [如何从mysqldump全量备份中抽取部分库表用于恢复](https://imysql.com/2010/06/01/mysql-faq-how-to-extract-data-from-dumpfile.html)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
