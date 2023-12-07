# 欧拉openEuler系统中安装GreatSQL

---

## 1. 准备工作

### 1.1 配置yum源

开始编译之前，建议先配置好yum源，方便安装一些工具以及必要的依赖包。

这里采用系统安装后默认的YUM源，并生成缓存。

```bash
$ yum clean all && yum makecache
```

在开始安装前，请根据文档 [安装准备](./1-install-prepare.md) 已经完成准备工作。

### 1.2 关闭selinux

```bash
$ setenforce=0
$ sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

### 1.3 选择下载GreatSQL二进制包

本文使用的欧拉openEuler系统如下：

```bash
$ cat /etc/os-release
NAME="openEuler"
VERSION="20.03 (LTS-SP3)"
ID="openEuler"
VERSION_ID="20.03"
PRETTY_NAME="openEuler 20.03 (LTS-SP3)"
ANSI_COLOR="0;31"

$ ldd --version
ldd (GNU libc) 2.28
```

那么在这个环境下，可以选择`GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64.tar.xz`这个二进制包进行安装

当然了，也可以选择相应的minimal包，minimal版本是对二进制文件进行strip后，所以文件尺寸较小，功能上没本质区别，但不支持gdb debug功能，可以放心使用。

将下载的二进制包放到安装目录下，并解压缩：

```
$ cd /usr/local
$ tar xf GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64.tar.xz
```

同时修改设置，将GreatSQL加入 `PATH` 环境变量：

```
$ echo 'export PATH=/usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin:$PATH' >> ~/.bash_profile
$ source ~/.bash_profile
```

接下来准备开始安装GreatSQL二进制包。

## 2. 安装GreatSQL

### 2.1 修改my.cnf

建议参考下面这份my.cnf模板，并根据实际情况做些适当调整：

[my.cnf for GreatSQL 8.0.32-24](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-24)

```
[client]
socket    = /data/GreatSQL/mysql.sock
[mysql]
loose-skip-binary-as-hex
prompt = "(\\D)[\\u@GreatSQL][\\d]>"
no-auto-rehash
[mysqld]
user    = mysql
port    = 3306
server_id = 3306
basedir = /usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64
datadir    = /data/GreatSQL
socket    = /data/GreatSQL/mysql.sock
pid-file = mysql.pid
character-set-server = UTF8MB4
skip_name_resolve = 1
#若你的MySQL数据库主要运行在境外，请务必根据实际情况调整本参数
default_time_zone = "+8:00"

#performance setttings
lock_wait_timeout = 3600
open_files_limit    = 65535
back_log = 1024
max_connections = 1024
max_connect_errors = 1000000
table_open_cache = 2048
table_definition_cache = 2048
thread_stack = 512K
sort_buffer_size = 4M
join_buffer_size = 4M
read_buffer_size = 8M
read_rnd_buffer_size = 4M
bulk_insert_buffer_size = 64M
thread_cache_size = 768
interactive_timeout = 600
wait_timeout = 600
tmp_table_size = 96M
max_heap_table_size = 96M
max_allowed_packet = 64M
net_buffer_shrink_interval = 180
#GIPK
loose-sql_generate_invisible_primary_key = ON

#log settings
log_timestamps = SYSTEM
log_error = /data/GreatSQL/error.log
log_error_verbosity = 3
slow_query_log = 1
log_slow_extra = 1
slow_query_log_file = /data/GreatSQL/slow.log
#设置slow log文件大小1G及总文件数10
max_slowlog_size = 1073741824
max_slowlog_files = 10
long_query_time = 0.01
log_queries_not_using_indexes = 1
log_throttle_queries_not_using_indexes = 60
min_examined_row_limit = 100
log_slow_admin_statements = 1
log_slow_slave_statements = 1
log_slow_verbosity = FULL
log_bin = /data/GreatSQL/binlog
binlog_format = ROW
sync_binlog = 1
binlog_cache_size = 4M
max_binlog_cache_size = 6G
max_binlog_size = 1G
#控制binlog总大小，避免磁盘空间被撑爆
binlog_space_limit = 500G
binlog_rows_query_log_events = 1
binlog_expire_logs_seconds = 604800
binlog_checksum = CRC32
gtid_mode = ON
enforce_gtid_consistency = TRUE

#myisam settings
key_buffer_size = 32M
myisam_sort_buffer_size = 128M

#replication settings
relay_log_recovery = 1
slave_parallel_type = LOGICAL_CLOCK
#并行复制线程数可以设置为逻辑CPU数量的2倍
slave_parallel_workers = 64
binlog_transaction_dependency_tracking = WRITESET
slave_preserve_commit_order = 1
slave_checkpoint_period = 2

#启用InnoDB并行查询优化功能
loose-force_parallel_execute = OFF
#设置每个SQL语句的并行查询最大并发度
loose-parallel_default_dop = 8
#设置系统中总的并行查询线程数，可以和最大逻辑CPU数量一样
loose-parallel_max_threads = 64
#并行执行时leader线程和worker线程使用的总内存大小上限，可以设置物理内存的5-10%左右
loose-parallel_memory_limit = 12G

#parallel load data
loose-gdb_parallel_load_chunk_size = 4M

#mgr settings
loose-plugin_load_add = 'mysql_clone.so'
loose-plugin_load_add = 'group_replication.so'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
#MGR本地节点IP:PORT，请自行替换
loose-group_replication_local_address = "172.16.16.10:33061"
#MGR集群所有节点IP:PORT，请自行替换
loose-group_replication_group_seeds = '172.16.16.10:33061,72.16.16.12:33061,72.16.16.12:33061'
loose-group_replication_start_on_boot = ON
loose-group_replication_bootstrap_group = OFF
loose-group_replication_exit_state_action = READ_ONLY
loose-group_replication_flow_control_mode = "DISABLED"
loose-group_replication_single_primary_mode = ON
loose-group_replication_majority_after_mode = ON
loose-group_replication_communication_max_message_size = 10M
loose-group_replication_arbitrator = 0
loose-group_replication_single_primary_fast_mode = 1
loose-group_replication_request_time_threshold = 100
loose-group_replication_primary_election_mode = GTID_FIRST
loose-group_replication_unreachable_majority_timeout = 0
loose-group_replication_member_expel_timeout = 5
loose-group_replication_autorejoin_tries = 288
report_host = "172.16.16.10"

#mgr vip
loose-plugin_load_add = 'greatdb_ha.so'
loose-greatdb_ha_enable_mgr_vip = 1

#innodb settings
innodb_buffer_pool_size = 16G
innodb_buffer_pool_instances = 8
innodb_data_file_path = ibdata1:12M:autoextend
innodb_flush_log_at_trx_commit = 1
innodb_log_buffer_size = 32M
innodb_log_file_size = 2G
innodb_log_files_in_group = 3
innodb_redo_log_capacity = 6G
innodb_doublewrite_files = 2
innodb_max_undo_log_size = 4G
# 根据您的服务器IOPS能力适当调整
# 一般配普通SSD盘的话，可以调整到 10000 - 20000
# 配置高端PCIe SSD卡的话，则可以调整的更高，比如 50000 - 80000
innodb_io_capacity = 4000
innodb_io_capacity_max = 8000
innodb_open_files = 65534
#提醒：当需要用CLONE加密特性时，不要选用O_DIRECT模式，否则会比较慢
innodb_flush_method = O_DIRECT
innodb_lru_scan_depth = 4000
innodb_lock_wait_timeout = 10
innodb_rollback_on_timeout = 1
innodb_print_all_deadlocks = 1
innodb_online_alter_log_max_size = 4G
innodb_print_ddl_logs = 0
innodb_status_file = 1
innodb_status_output = 0
innodb_status_output_locks = 1
innodb_sort_buffer_size = 64M
innodb_adaptive_hash_index = 0
#开启NUMA支持
innodb_numa_interleave = ON
innodb_print_lock_wait_timeout_info = 1
#自动杀掉超过5分钟不活跃事务，避免行锁被长时间持有
kill_idle_transaction = 300

#innodb monitor settings
#innodb_monitor_enable = "module_innodb,module_server,module_dml,module_ddl,module_trx,module_os,module_purge,module_log,module_lock,module_buffer,module_index,module_ibuf_system,module_buffer_page,module_adaptive_hash"

#pfs settings
performance_schema = 1
#performance_schema_instrument = '%memory%=on'
performance_schema_instrument = '%lock%=on'
```

一般修改 *basedir/datadir/innodb_buffer_pool_size* 等几个选项就可以，修改完后保存退出。

### 2.3 新建mysql用户

```
$ /sbin/groupadd mysql
$ /sbin/useradd -g mysql -M mysql -s /sbin/nologin
```

### 2.4 新建数据库主目录，并修改权限模式及属主

```
$ mkdir -p /data/GreatSQL 
$ chown -R mysql:mysql /data/GreatSQL
$ chmod -R 700 /data/GreatSQL
```

### 2.5 配置GreatSQL systemd服务

推荐采用systemd来管理GreatSQL服务，可参考这份文件，或根据实际安装目录编辑文件：

```
$ vi /lib/systemd/system/greatsql.service

[Unit]
Description=GreatSQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target
[Install]
WantedBy=multi-user.target
[Service]

# some limits
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=65535
# processes/threads
LimitNPROC=65535
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false

User=mysql
Group=mysql
Type=simple
TimeoutSec=0
PermissionsStartOnly=true
ExecStartPre=/usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```

务必确认文件中目录及文件名是否正确。

执行命令重载systemd，加入 `greatsql` 服务，如果没问题就不会报错：

```
$ systemctl daemon-reload
```

这就安装成功并将GreatSQL添加到系统服务中，后面可以用 `systemctl` 来管理GreatSQL服务。

## 3. 启动GreatSQL

执行下面的命令启动GreatSQL服务

```
$ systemctl start greatsql
```

如果是在一个全新环境中首次启动GreatSQL数据库，可能会失败，因为在 `mysqld_pre_systemd` 的初始化处理逻辑中，需要依赖 `/var/lib/mysql-files` 目录保存一个临时文件。如果首次启动失败，可能会有类似下面的报错提示：

```bash
$ systemctl status greatsql

● greatsql.service - GreatSQL Server
   Loaded: loaded (/usr/lib/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since Wed 2023-08-30 14:02:14 CST; 2s ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 790866 ExecStartPre=/usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
  Process: 791426 ExecStart=/usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS (code=exited, status=1/FAILURE)
 Main PID: 791426 (code=exited, status=1/FAILURE)

8月 30 14:02:03 gip systemd[1]: Starting GreatSQL Server...
8月 30 14:02:03 gip mysqld_pre_systemd[790895]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or direct>
8月 30 14:02:03 gip mysqld_pre_systemd[790896]: chmod: cannot access '': No such file or directory
8月 30 14:02:03 gip mysqld_pre_systemd[790894]: /usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 43: : No such file or directory
8月 30 14:02:03 gip mysqld_pre_systemd[790894]: /usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 44: $initfile: ambiguous redirect
8月 30 14:02:10 gip systemd[1]: Started GreatSQL Server.
8月 30 14:02:14 gip systemd[1]: greatsql.service: Main process exited, code=exited, status=1/FAILURE
8月 30 14:02:14 gip systemd[1]: greatsql.service: Failed with result 'exit-code'.
```

只需手动创建 `/var/lib/mysql-files` 目录，再次启动GreatSQL服务即可：

```bash
$ mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
$ systemctl start greatsql
```

检查服务是否已启动，以及进程状态：

```bash
$ systemctl status greatsql
● greatsql.service - GreatSQL Server
   Loaded: loaded (/usr/lib/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: active (running) since Wed 2023-08-30 14:02:36 CST; 4s ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 793576 ExecStartPre=/usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 793606 (mysqld)
   Memory: 2.5G
   CGroup: /system.slice/greatsql.service
           └─793606 /usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld

8月 30 14:02:36 gip systemd[1]: Starting GreatSQL Server...
8月 30 14:02:36 gip systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld
mysql     818929       1  4 14:08 ?        00:00:07 /usr/local/GreatSQL-8.0.32-24-Linux-glibc2.28-x86_64/bin/mysqld

$ ss -lntp | grep mysqld
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=60231,fd=38))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=60231,fd=43))
```

可以看到，GreatSQL服务已经正常启动了。


## 4. 连接登入GreatSQL

在上面进行GreatSQL初始化时，会为 *root@localhost* 用户生成一个随机密码，记录在 `error.log` 日志文件中，例如下面这样：

```bash
$ grep -i root /data/GreatSQL/error.log
... A temporary password is generated for root@localhost: ji!pjndiw5sJ
```

复制该密码，将用于首次登入GreatSQL所需。

部分GreatSQL二进制包方式安装后，有可能初始化的root密码是空的，这种情况下可以直接登入并修改成安全密码。

```sql
$ mysql -uroot  -p"ji!pjndiw5sJ"   #<--这里输入刚才复制的临时密码
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.0.32-24 GreatSQL, Release 24, Revision 3714067bc8c
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
...
greatsql> \s
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

首次登入立刻提醒该密码已过期，需要修改，执行类似下面的命令修改即可：

```sql
greatsql> alter user user() identified by 'GreatSQL@2022';  #<--修改密码
Query OK, 0 rows affected (0.02 sec)

greatsql> \s
...
mysql  Ver 8.0.32-24 for Linux on x86_64 (GreatSQL, Release 24, Revision 3714067bc8c)

Connection id:          9
Current database:       
Current user:           root@localhost
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         8.0.32-24
Protocol version:       10
Connection:             Localhost via UNIX socket
Server characterset:    utf8mb4
Db     characterset:    utf8mb4
Client characterset:    utf8mb4
Conn.  characterset:    utf8mb4
UNIX socket:            /data/GreatSQL/mysql.sock
Uptime:                 47 sec

Threads: 2  Questions: 8  Slow queries: 0  Opens: 130  Flush tables: 3  Open tables: 46  Queries per second avg: 0.170
--------------
```

GreatSQL数据库安装并初始化完毕。

## 5. 安装MySQL Shell

下载MySQL Shell for GreatSQL二进制包*greatsql-shell-8.0.25-16-Linux-glibc2.28-x86_64.tar.xz*，在欧拉openEuler系统下也可以正常运行。

接下来安装MySQL Shell，以及进行MGR初始化等操作和用RPM包方式安装一样，这里就不赘述了。

参考文档[RPM安装并构建MGR集群](./2-install-with-rpm.md#安装mysql-shell)，从“8. 安装MySQL Shell”这节开始及往后内容即可。

在欧拉openEuler系统中，首次运行 `mysqlsh` 二进制文件时，可能会提示Python依赖错误：

```bash
$ /usr/local/greatsql-shell-8.0.25-16-Linux-glibc2.28-x86_64/bin/mysqlsh

./mysqlsh: error while loading shared libraries: libpython3.8.so.1.0: cannot open shared object file: No such file or directory
```

只需将系统中其他版本的Python依赖包头文件做个软链接就行：

```bash
$ ln -s /usr/lib64/libpython3.7m.so.1.0 /usr/lib64/libpython3.8.so.1.0
$ /usr/local/greatsql-shell-8.0.25-16-Linux-glibc2.28-x86_64/bin/mysqlsh
MySQL Shell 8.0.25

Copyright (c) 2016, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
 MySQL  Py >
```

MySQL Shell就可以正常使用，并继续构建MGR集群了。


**问题反馈**
---

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
