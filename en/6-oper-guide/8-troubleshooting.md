# Troubleshooting

This document summarizes common errors when using GreatSQL. When encountering these related errors, you can check the cause of the error through the troubleshooting ideas in this document and handle it.


## After installing GreatSQL, startup fails, prompting `valid data directory`

This problem usually occurs when manually installing the GreatSQL binary package in a brand-new environment.

When starting GreatSQL, an error message similar to the following may be encountered:

```log
[ERROR] [MY-011011] [Server] Failed to find valid data directory.
[ERROR] [MY-010020] [Server] Data Dictionary initialization failed.
[ERROR] [MY-010119] [Server] Aborting
```

This error usually occurs because GreatSQL encountered a problem during initialization and could not correctly initialize the *datadir* directory, making startup impossible. Several aspects can be checked:

- Check and confirm that all configuration parameters in *my.cnf* are set correctly, avoiding wrong parameter names or some incompatible parameter names.

At this time, the simplest *my.cnf* below can also be used for testing first. 
```ini
[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64
datadir = /data/GreatSQL
user = mysql
log_error_verbosity = 3
```
Replace and adjust the `basedir` and `datadir` according to the actual situation.

- It may be due to operating system environment compatibility or other reasons that the `mysqld_pre_systemd` initialization script cannot work correctly.

At this time, it can be changed to manual initialization to confirm that GreatSQL works normally:
```bash
/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld --no-defaults --user=mysql --log_error_verbosity=3 --datadir=/data/GreatSQL --initialize
```
If manual initialization works normally, further investigate where the `mysqld_pre_systemd` script works abnormally.

- In the initialization processing logic of `mysqld_pre_systemd`, the `/var/lib/mysql-files` directory needs to be created. It may fail to be created due to some anomaly, causing initialization failure.

At this time, the `/var/lib/mysql-files` directory can be created manually and initialization can be performed again.

## After installing GreatSQL, startup fails, prompting `PID file could not be found`

This error usually occurs because the file directory set by the parameter `pid_file` (or `pid-file`) is wrong, the file directory does not exist, or there is no write permission.

It is usually recommended to put `pid_file` in the `datadir` directory, so this parameter only configures the file name, without specifying the full path, for example:
```ini
[mysqld]
datadir = /data/GreatSQL
pid_file = greatsql.pid
```
If this parameter is set with a full file directory, ensure that its parent directory exists and has write permission. For example, if `pid_file = /data/run/greatsql/3306.pid` is set, ensure that the directory `/data/run/greatsql/` exists and the user running the GreatSQL process has write permission to it.

```bash
mkdir -p /data/run/greatsql/
chown -R mysql:mysql /data/run/greatsql/
```

## Cannot connect to GreatSQL, prompting the `Can't connect to local MySQL server through socket '/tmp/mysql.sock'` error

The literal meaning of this error is: unable to connect to the MySQL/GreatSQL server through /tmp/mysql.sock. This is usually caused by the following situations:

- The correct socket file path is not set

Execute the command `systemctl status greatsql` or `ps -ef|grep -i mysqld` to confirm whether the corresponding GreatSQL service process has started.

If the GreatSQL service process is running normally, it may be because the socket file path is wrong. Configure the correct file path in */etc/my.cnf*.

```ini
[client]
socket = /data/GreatSQL/mysql.sock

[mysqld]
datadir = /data/GreatSQL
socket = /data/GreatSQL/mysql.sock
```

- The GreatSQL server failed to start correctly.

Execute the command `systemctl status greatsql` or `ps -ef|grep -i mysqld` to confirm whether the corresponding GreatSQL service process has started.

If the GreatSQL service process really has not started, first check the GreatSQL error log file (the file pointed to by the parameter `log_error`) and the operating system error log file (`/var/log/message`) to see whether an unexpected error caused the service process to exit, and then start the GreatSQL database service.

- The mysql.sock file was accidentally deleted

In this case, switch to connecting to the GreatSQL database using the TCP/IP method. For example:

```bash
mysql -h127.0.0.1 -uroot -P3306 -p'xx'
```

If the normal use of the application business is not affected (application business usually connects using the TCP/IP method, not through the local socket file), there is generally no need to rush to restart the GreatSQL service. It can be restarted at the next routine business maintenance.

## Some query SQL statements in GreatSQL hang and never respond

This may be because the InnoDB parallel query bug was triggered. Try upgrading to the latest GreatSQL version, or modify the option `force_parallel_execute=OFF` to temporarily disable the InnoDB parallel query feature.

Refer to the following cases:

- [mysqldump hangs after exporting 108353886 bytes of data](https://greatsql.cn/thread-522-1-1.html)
- [greatsql SQL execution freezes](https://greatsql.cn/thread-422-1-1.html)

## The database crashes after running some SQL statements in GreatSQL

It may be because some bugs were triggered. Try upgrading to the latest GreatSQL version, or refer to the method mentioned in the article [MySQL coredump collection and processing process](https://mp.weixin.qq.com/s/CrV9kgIUnUd4GEru93xjdA), package and collect the corresponding coredump files, my.cnf configuration file, error log file, and a method that can stably reproduce, and then contact us to report the bug.

Refer to the following cases:

- [Executing some SQL causes the database to restart](https://greatsql.cn/thread-529-1-1.html)

## The GreatSQL database stops or restarts for no reason

The following situations are more likely:

- An OOM Killer (out-of-memory killer) occurred

In simple terms, the system determines that too much memory is occupied, triggers the OOM Killer mechanism, and kills the mysqld process to release memory.

You can check the operating system log file `/var/log/messages`. There is usually log content similar to the following

```log
kernel: Out of memory: Kill process 6033 (mysqld) score 615 or sacrifice child
kernel: Killed process 6033, UID 498, (mysqld) total-vm:56872260kB, anon-rss:3202560kB, file-rss:40kB
```

When an OOM Killer event occurs, some memory design parameter options can be appropriately lowered, such as `innodb_buffer_pool_size`, or the physical memory of the operating system can be appropriately increased.

In addition, if you want to protect the mysqld process from being killed by the OOM Killer mechanism, adjust the `oom_score_adj` setting of the corresponding process to -1000, for example:
```bash
$ ps -ef | grep mysqld
ps -ef | grep mysqld | grep -v grep
mysql     597099   1  9 Apr27 ?        21:16:54 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf

$ cat /proc/597099/oom_score_adj
0

$ echo -1000 > /proc/597099/oom_score_adj

$ cat /proc/597099/oom_score_adj
-1000
```

The definition of the `oom_score_adj` value is as follows:
- The default is 0, indicating that the score is not adjusted.
- If changed to a negative number, it means try not to be killed.
- If changed to a positive number, it means it can be killed preferentially.

For more content about OOM Killer, refer to: [In-depth understanding of the Linux kernel OOM killer mechanism](https://zhuanlan.zhihu.com/p/560714542).


- The administrator accidentally executed kill -9, killing the mysqld process.

- The operating system restarted unexpectedly.

## When starting GreatSQL with systemd, the error `Failed to execute command: Permission denied` is reported

Problem phenomenon: The permissions of the GreatSQL mysqld binary file are set correctly, and manual invocation also starts normally, but as long as it is started through `systemd`, the `Permission denied` error is reported, for example:

```log
systemd[1549425]: greatdb.service: Failed to execute command: Permission denied
systemd[1549425]: greatdb.service: Failed at step EXEC spawning /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld: Permission denied
-- Subject: Process /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld could not be executed
-- Defined-By: systemd
-- Support: https://access.redhat.com/support
--
-- The process /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld could not be executed and failed.
--
-- The error number returned by this process is 13.
```

The file permission setting is normal

```bash
$ ls -la /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld 

-rwxr-xr-x 1 mysql mysql 383759416 Feb  2 23:36 /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld
```

This situation should be caused by **SELinux**.

When **SELinux** is enabled, if the binary executable file is first placed in the user's home directory and then moved to another target directory, the above problem occurs because the file's **security context** is incorrect.

The following method can be used to fix it:

1. First, execute the `restorecon` command to reset the SELinux security context of the files and directories to the default values
```bash
restorecon -rv /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/
```

2. Disable SELinux
```bash
setenforce 0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

Try again, and it should work.


## GreatSQL restarts abnormally, and the error information in the log contains the `long semaphore wait` text

When this situation occurs, it is usually because the mutex or lock mutual exclusion waiting inside InnoDB is too long. The log usually also contains content similar to the following

```log
Thread XXX has waited at XXX line XXX for 928 seconds the semaphore
```

This may be because the system load was too high at that time, or it may be caused by some bugs superimposed. When the semaphore mutual exclusion waiting event lasts too long (about 900 seconds), GreatSQL restarts by itself (if it does not restart, nothing else can be done, and it is meaningless).

Several possible causes and optional solutions
1. Too many garbage SQL statements, which need to be optimized. It can be seen that some transactions modify multiple rows of records and look very inefficient
2. Disable the adaptive hash index at the database level (`innodb_adaptive_hash_index = OFF`), which may also be the cause
3. Strengthen monitoring. Many transactions have been active for too long and have not been committed. Garbage SQL (transactions) that do not end for a long time occupy more resources, and then everything goes down together. Refer to [Monitoring & Alerting](../6-oper-guide/3-monitoring-and-alerting.md).
4. There may be a fault in the system-layer I/O devices. It can be seen that multiple transactions are in the PREPARED state. At this time, it may be impossible to commit/flush data because of physical I/O device faults.
5. Finally, it is recommended to upgrade to the latest GreatSQL version, which is relatively more stable and reliable.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
