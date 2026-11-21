# Clone Backup & Restore
---

This article introduces how to use Clone for backup and restore in the GreatSQL database.

## About Clone
In GreatSQL, Clone runs as a Plugin, meaning it can be enabled and disabled online.

With the Clone plugin, only a few commands are needed to conveniently back up the GreatSQL database local instance, or back up a remote instance to local storage.

First understand two new concepts:
- `donor` node (supply node), the source node that provides backup data
- `recipient` node (receiving node), the target node that receives backup data

The concepts of donor and recipient nodes only exist in the remote backup scenario. For local Clone backup, no remote data transmission is involved, so it does not matter.

In the remote backup scenario, a Clone request is initiated on the recipient node, which receives backup data from the donor node and overwrites local data. After the Clone operation is completed, the data of the recipient node and the donor node are consistent, including metadata information such as the GreatSQL system databases.

The Clone operation process is roughly as follows:
1. Initiate a Clone request on the recipient node.
1. Clear local data on the recipient node.
1. Receive and overwrite the donor node's data files on the recipient node.
1. Receive and overwrite the donor node's data pages on the recipient node.
1. Receive and overwrite the donor node's Redo log on the recipient node.
1. Receive and overwrite the donor node's data files on the recipient node.
1. Auto-restart on the recipient node (at this time, if service management methods such as systemd are not used, automatic restart may not be achievable, and the instance needs to be restarted manually).
1. Execute Crash recovery on the recipient node and provide services.

The following are several notes and limitations for using the Clone plugin:
- Only InnoDB table data can be copied (for non-InnoDB tables, only the table DDL can be copied; data cannot be copied, i.e., only an empty table is generated).
- Clone cannot be performed across versions, for example, between 5.7.x and 8.0.x, and between 8.0.25 and 8.0.32 (the version numbers must be exactly the same), and only 8.0.17 and above versions are supported.
- Clone of binlog files is not supported.
- Only data can be cloned; system configurations cannot be cloned at the same time (that is, system configuration files such as my.cnf and mysqld-auto.cnf cannot be cloned).
- Before GreatSQL 8.0.27, all DDL operations on the donor node are blocked during Clone, including `TRUNCATE TABLE` operations; starting from 8.0.27, DDL operations are not blocked during Clone. For details, refer to the document: [Cloning and Concurrent DDL](https://dev.mysql.com/doc/refman/8.0/en/clone-plugin-concurrent-ddl.html).
- A donor node can only provide data for one recipient node at a time, and cannot respond to Clone requests of multiple recipient nodes at the same time.
- Clone requests cannot be initiated when connecting through MySQL Router; that is, Clone requests can only be initiated when two database instances directly connect to each other.
- When general tablespaces are created with an absolute path, file conflict errors are generated when Clone backup is performed to local storage (because of the absolute path).

## Using Clone to Back Up Data
### Preparation
As mentioned above, Clone works as a plugin, so before starting to use it, the plugin must be installed by executing the following SQL command:

```sql
INSTALL PLUGIN clone SONAME 'mysql_clone.so';
```

As long as the `plugin_dir` option is set correctly, executing the above command completes the plugin installation.

To Clone remote instance data, the user establishing the remote connection also needs at least the corresponding grants: at least the `BACKUP_ADMIN` privilege on the donor node, and at least the `CLONE_ADMIN` grant on the recipient node. Only then can the requirements of cloning data from the donor node and receiving and overwriting data on the recipient node be satisfied.

Because each database instance may be both a donor node and a recipient node, for convenience, the `CLONE_ADMIN` and `BACKUP_ADMIN` privileges can be uniformly granted on the relevant nodes by executing the following SQL command:

```sql
GRANT CLONE_ADMIN, BACKUP_ADMIN ON *.* TO clone_user@'%';
```

If permission control in the production environment is stricter, it is best to distinguish them clearly.

Before starting the backup, first create a MyISAM table in the current instance and write a few rows of data. Execute the following SQL commands:

```sql
USE greatsql;
CREATE TABLE t4 (id INT PRIMARY KEY)ENGINE=myisam;
INSERT INTO t4 SELECT RAND()*10240;
INSERT INTO t4 SELECT RAND()*10240;
INSERT INTO t4 SELECT RAND()*10240;
```

### Cloning and Backing Up Local Data

Executing the following SQL command implements Clone backup of the local instance:
```sql
CLONE LOCAL DATA DIRECTORY = '/data/backup/clone/20230831';
```
As long as the owner user of the GreatSQL service process has write permission to the local storage target path, and if the above path has not been created first, it is automatically created during Clone backup.

After the backup ends, view which files are under the local storage path:
```bash
$ ls -l /data/backup/clone/20230831

...
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

...
-rw-r----- 1 mysql mysql  92274688 Aug 31 15:18 t1.ibd
-rw-r----- 1 mysql mysql    114688 Aug 31 15:18 t2.ibd
-rw-r----- 1 mysql mysql    114688 Aug 31 15:18 t3.ibd
```
It can be seen that only data is backed up (including Redo and Undo Log, but no double write buffer and ibtmp1 files), and system configuration files, binlog, and MyISAM tables (no files such as t4.MYD) are not backed up.

If this backup data is restored to an empty instance and started, it will be found that table t4 exists but is an empty table:
```bash
$ ls -la /data/GreatSQL-restore/greatsql

...
-rw-r-----  1 mysql mysql  92274688 Aug 31 15:18 t1.ibd
-rw-r-----  1 mysql mysql    114688 Aug 31 15:18 t2.ibd
-rw-r-----  1 mysql mysql    114688 Aug 31 15:18 t3.ibd
-rw-r-----  1 mysql mysql         0 Aug 31 15:25 t4.MYD
-rw-r-----  1 mysql mysql      1024 Aug 31 15:25 t4.MYI
```
The MyISAM table was created above only for testing purposes. In actual production environments, it is strongly recommended that everyone use only InnoDB tables.


### Cloning and Backing Up Remote Data
Before starting to back up remote node data, the `clone_valid_donor_list` option must first be set on the recipient node to specify the donor node. Execute the following SQL command:

```sql
SET GLOBAL clone_valid_donor_list = '172.16.16.10:3306';
```

Otherwise, the following error is reported when executing Clone backup:

```log
ERROR 3869 (HY000): Clone system configuration: 172.16.16.10:3306 is not found in clone_valid_donor_list:
```

After everything is set up, Clone backup of the remote node data can be performed:

```sql
greatsql> Clone INSTANCE FROM repl@172.16.16.10:3306 IDENTIFIED BY 'GreatSQL@2023';
Query OK, 0 rows affected (0.94 sec)

greatsql> \s
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    9
Current database: *** NONE ***
...
Uptime:                 1 sec    #<-- It can be seen that the instance was restarted
...

greatsql> SHOW GRANTS FOR repl;
+-----------------------------------------+
| Grants for repl@%                       |
+-----------------------------------------+
| GRANT USAGE ON *.* TO `repl`@`%`        |
| GRANT BACKUP_ADMIN ON *.* TO `repl`@`%` |
+-----------------------------------------+
```
In the above test case, the donor node only grants the `BACKUP_ADMIN` privilege to the repl account, so after the recipient node Clone is completed, the repl account grant on this instance is also overwritten and no longer has the `CLONE_ADMIN` privilege.

After Clone ends, the recipient node instance is automatically shut down with `SHUTDOWN`. If the instance cannot restart automatically, it needs to be manually started again. Therefore, it is recommended to add the database to systemd service management.

### Viewing Clone Backup Progress
During the Clone process, its status and progress can be viewed in real time:

```sql
-- View the status
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

-- View the progress
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

-- A view with better readability after processing
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
With these metadata, the approximate total time and the estimated remaining time to complete can be calculated.

::: tip Reminder 
1. During the Clone process, if it is forcibly terminated by KILL, the data on the recipient node is cleared, leaving only a new instance close to just initialized. Please operate with caution.
2. Starting from GreatSQL 8.0.32-25, Clone supports encrypted backup and decryption. For details, see the document: [Clone Backup Encryption](../5-enhance/5-4-security-clone-encrypt.md).
2. Starting from GreatSQL 8.0.32-27, Clone supports incremental backup and compressed backup. For details, see the document: [Clone Compressed and Incremental Backup](../5-enhance/5-5-clone-compressed-and-incrment-backup.md).
:::

After completing Clone backup on the recipient node, it is equivalent to performing a data restore on the recipient. This node can also serve as a replica node of source-replica replication, or as a new node of MGR group replication, achieving multiple benefits with one action.

**Reference materials:**

- [The Clone Plugin](https://dev.mysql.com/doc/refman/8.0/en/clone-plugin.html)
- [Clone: Create MySQL instance replica](https://dev.mysql.com/blog-archive/clone-create-mysql-instance-replica/)
- [Clone Encrypted Backup](../5-enhance/5-4-security-clone-encrypt.md)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
