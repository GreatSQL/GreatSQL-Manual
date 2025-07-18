# RPM安装
---

本节介绍如何用RPM包方式安装GreatSQL数据库，假定本次安装是在CentOS 8.x x86_64环境中安装，并且是以root用户身份执行安装操作。

在开始安装前，请根据文档 [安装准备](./1-install-prepare.md) 已经完成准备工作。

##  MGR集群规划

本次计划在3台服务器上安装GreatSQL数据库并部署MGR集群：

| node | ip | datadir | port |role|
| --- | --- | --- | --- | --- |
| GreatSQL-01 | 172.16.16.10 | /data/GreatSQL/ | 3306 | PRIMARY |
| GreatSQL-02 | 172.16.16.11 | /data/GreatSQL/ | 3306 | SECONDARY |
| GreatSQL-03 | 172.16.16.12 | /data/GreatSQL/ | 3306 | ARBITRATOR |

以下安装配置工作先在三个节点都同样操作一遍。

##  下载安装包

查看机器的glibc版本，以选择正确的安装包：
```bash
$ ldd --version

...
ldd (GNU libc) 2.28
```
如果您的glibc版本为2.28或更高版本，请选择带有"el8"标识的rpm包；如果您的glibc版本为2.17，请选择带有"el7"标识的rpm包。

[点击此处](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27)下载最新的安装包，下载以下几个就可以：

- greatsql-client-8.0.32-27.1.el8.x86_64.rpm
- greatsql-devel-8.0.32-27.1.el8.x86_64.rpm
- greatsql-icu-data-files-8.0.32-27.1.el8.x86_64.rpm
- greatsql-shared-8.0.32-27.1.el8.x86_64.rpm
- greatsql-server-8.0.32-27.1.el8.x86_64.rpm

##  安装GreatSQL RPM包

执行下面的命令安装PRM包，如果一切顺利的话，相应的过程如下所示：
```bash
$ rpm -ivh greatsql*rpm

...
Verifying...                          ################################# [100%]
Preparing...                          ################################# [100%]
Updating / installing...
   1:greatsql-shared-8.0.32-27.1.el8  ################################# [ 20%]
   2:greatsql-client-8.0.32-27.1.el8  ################################# [ 40%]
   3:greatsql-icu-data-files-8.0.32-27################################# [ 60%]
   4:greatsql-server-8.0.32-27.1.el8  ################################# [ 80%]
   5:greatsql-devel-8.0.32-27.1.el8   ################################# [100%]
```
这就安装成功了。

**提示**：
1. 安装GreatSQL RPM包需要先安装其他依赖包，可执行下面命令完成：

```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```

如果报告个别依赖包安装失败或者找不到就删掉，然后重试。更详细的请参考：[安装准备](./1-install-prepare.md)。

其他部分依赖包，如果通过yum还是无法安装，则加上 `--nodeps --force` 强制忽略即可，例如：
```bash
$ rpm -ivh greatsql*rpm

...
error: Failed dependencies:
        perl(Lmo) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Lmo::Meta) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Lmo::Object) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Lmo::Types) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Lmo::Utils) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Percona::Toolkit) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Quoter) is needed by greatsql-server-8.0.32-27.1.el8.x86_64
        perl(Transformers) is needed by greatsql-server-8.0.32-27.1.el8.x86_64

#上述这些依赖包可以先忽略，不影响GreatSQL正常使用

$ rpm -ivh --nodeps --force greatsql*rpm

...
Preparing...                          ################################# [100%]
Updating / installing...
   1:greatsql-shared-8.0.32-27.1.el8  ################################# [ 20%]
   2:greatsql-client-8.0.32-27.1.el8  ################################# [ 40%]
   3:greatsql-icu-data-files-8.0.32-27################################# [ 60%]
   4:greatsql-server-8.0.32-27.1.el8  ################################# [ 80%]
   5:greatsql-devel-8.0.32-27.1.el8   ################################# [100%]
```

2. 正式安装GreatSQL RPM包时，可能还需要依赖Perl等其他软件包，此处为快速演示，因此加上 `--nodeps` 参数，忽略相应的依赖关系检查。安装完毕后，如果因为依赖关系无法启动，请再行安装相应软件依赖包。

##  启动前准备

### 创建或修改 /etc/my.cnf 配置文件

如果 `/etc/my.cnf` 配置文件不存在就新建一个，文件内容请参考这份 [my.cnf 模板](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-27)，可根据实际情况修改，一般主要涉及数据库文件分区、目录，内存配置等少数几个选项。以下面这份为例：
```ini
#my.cnf
[client]
socket	= /data/GreatSQL/mysql.sock
[mysql]
loose-skip-binary-as-hex
prompt = "(\\D)[\\u@GreatSQL][\\d]>"
no-auto-rehash
[mysqld]
user	= mysql
port	= 3306
#主从复制或MGR集群中，server_id记得要不同
#另外，实例启动时会生成 auto.cnf，里面的 server_uuid 值也要不同
#server_uuid的值还可以自己手动指定，只要符合uuid的格式标准就可以
server_id = 3306
basedir = /usr/
datadir	= /data/GreatSQL
socket	= mysql.sock
pid-file = mysql.pid
character-set-server = UTF8MB4
skip_name_resolve = ON
default_time_zone = "+8:00"
bind_address = "0.0.0.0"
secure_file_priv = /data/GreatSQL

# Performance
lock_wait_timeout = 3600
open_files_limit    = 65535
back_log = 1024
max_connections = 512
max_connect_errors = 1000000
table_open_cache = 4096
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
tmp_table_size = 32M
max_heap_table_size = 32M
max_allowed_packet = 64M
net_buffer_shrink_interval = 180
sql_generate_invisible_primary_key = ON
loose-lock_ddl_polling_mode = ON
loose-lock_ddl_polling_runtime = 200

# Logs
log_timestamps = SYSTEM
log_error = error.log
log_error_verbosity = 3
slow_query_log = ON
log_slow_extra = ON
slow_query_log_file = slow.log
long_query_time = 0.01
log_queries_not_using_indexes = ON
log_throttle_queries_not_using_indexes = 60
min_examined_row_limit = 100
log_slow_admin_statements = ON
log_slow_replica_statements = ON
log_slow_verbosity = FULL
log_bin = binlog
binlog_format = ROW
sync_binlog = 1
binlog_cache_size = 4M
max_binlog_cache_size = 2G
max_binlog_size = 1G
binlog_space_limit = 500G
binlog_rows_query_log_events = ON
binlog_expire_logs_seconds = 604800
binlog_checksum = CRC32
binlog_order_commits = OFF
gtid_mode = ON
enforce_gtid_consistency = ON

# Replication
relay-log = relaylog
relay_log_recovery = ON
replica_parallel_type = LOGICAL_CLOCK
replica_parallel_workers = 16
binlog_transaction_dependency_tracking = WRITESET
replica_preserve_commit_order = ON
replica_checkpoint_period = 2
loose-rpl_read_binlog_speed_limit = 100

# MGR
loose-plugin_load_add = 'mysql_clone.so'
loose-plugin_load_add = 'group_replication.so'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
loose-group_replication_local_address = "172.16.16.10:33061"
loose-group_replication_group_seeds = "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
loose-group_replication_communication_stack = "XCOM"
loose-group_replication_recovery_use_ssl = OFF
loose-group_replication_ssl_mode = DISABLED
loose-group_replication_start_on_boot = OFF
loose-group_replication_bootstrap_group = OFF
loose-group_replication_exit_state_action = READ_ONLY
loose-group_replication_flow_control_mode = "DISABLED"
loose-group_replication_single_primary_mode = ON
loose-group_replication_enforce_update_everywhere_checks = OFF
loose-group_replication_majority_after_mode = ON
loose-group_replication_communication_max_message_size = 10M
loose-group_replication_arbitrator = OFF
loose-group_replication_single_primary_fast_mode = 1
loose-group_replication_request_time_threshold = 100
loose-group_replication_primary_election_mode = GTID_FIRST
loose-group_replication_unreachable_majority_timeout = 0
loose-group_replication_member_expel_timeout = 5
loose-group_replication_autorejoin_tries = 288
loose-group_replication_recovery_get_public_key = ON
loose-group_replication_donor_threshold = 100
report_host = "172.16.16.10"

# InnoDB
innodb_buffer_pool_size = 64G
innodb_buffer_pool_instances = 8
innodb_data_file_path = ibdata1:12M:autoextend
innodb_flush_log_at_trx_commit = 1
innodb_log_buffer_size = 64M
innodb_redo_log_capacity = 6G
innodb_doublewrite_files = 2
innodb_doublewrite_pages = 128
innodb_max_undo_log_size = 4G
innodb_io_capacity = 10000
innodb_io_capacity_max = 20000
innodb_open_files = 65535
innodb_flush_method = O_DIRECT
innodb_use_fdatasync = ON
innodb_lru_scan_depth = 4000
innodb_lock_wait_timeout = 10
innodb_rollback_on_timeout = ON
innodb_print_all_deadlocks = ON
innodb_online_alter_log_max_size = 4G
innodb_print_ddl_logs = ON
innodb_status_file = ON
innodb_status_output = OFF
innodb_status_output_locks = ON
innodb_sort_buffer_size = 64M
innodb_adaptive_hash_index = OFF
innodb_numa_interleave = OFF
innodb_spin_wait_delay = 20
innodb_print_lock_wait_timeout_info = ON
innodb_change_buffering = none
kill_idle_transaction = 300
innodb_data_file_async_purge = ON

#innodb monitor settings
#innodb_monitor_enable = "module_innodb,module_server,module_dml,module_ddl,module_trx,module_os,module_purge,module_log,module_lock,module_buffer,module_index,module_ibuf_system,module_buffer_page,module_adaptive_hash"

#pfs settings
performance_schema = 1
#performance_schema_instrument = '%memory%=on'
performance_schema_instrument = '%lock%=on'
```

### 新建datadir

新建数据库主目录，并修改权限模式及属主：

```bash
mkdir -p /data/GreatSQL
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
```

##  启动GreatSQL

启动GreatSQL服务前，先创建或修改systemd文件 `vim /lib/systemd/system/mysqld.service`，在 *[Service]* 区间增加下面几行内容，调高一些limit上限，避免出现文件数、线程数不够用的告警。

```ini
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
...
```

务必确认文件中 `ExecStartPre` 和 `ExecStart` 两个参数指定的目录及文件名是否正确。

::: tip 小贴士

RPM方式安装GreatSQL时，systemd服务管理文件 `mysqld.service` 脚本文件默认位于 `/lib/systemd/system/mysqld.service`。请先找到该文件，确认其中涉及 GreatSQL 可执行文件路径是否正确。主要有以下两处：

```
ExecStartPre=/usr/bin/mysqld_pre_systemd
ExecStart=/usr/sbin/mysqld $MYSQLD_OPTS
```
:::

保存退出，然后再执行命令重载systemd，如果没问题就不会报错：
```bash
systemctl daemon-reload
```

执行下面的命令启动GreatSQL服务
```bash
systemctl start mysqld
```

检查服务是否已启动，以及进程状态：
```bash
$ systemctl status mysqld

...
● mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
   Active: active (running) since ...
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 51902 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 52003 (mysqld)
   Status: "Server is operational"
    Tasks: 48 (limit: 149064)
   Memory: 5.5G
   CGroup: /system.slice/mysqld.service
           └─52003 /usr/sbin/mysqld

systemd[1]: Starting MySQL Server...
systemd[1]: Started MySQL Server.

$ ps -ef | grep mysqld

...
mysql      43653       1  3 10:35 ?        00:00:02 /usr/sbin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=43653,fd=23))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=43653,fd=26))

# 查看数据库文件
$ ls /data/GreatSQL

...
 auto.cnf        ca-key.pem        error.log           '#ib_archive'    '#innodb_redo'       mysql.ibd         performance_schema   server-key.pem   undo_002
 binlog.000001   ca.pem           '#file_purge'         ib_buffer_pool   innodb_status.258   mysql.pid         private_key.pem      slow.log
 binlog.000002   client-cert.pem  '#ib_16384_0.dblwr'   ibdata1         '#innodb_temp'       mysql.sock        public_key.pem       sys
 binlog.index    client-key.pem   '#ib_16384_1.dblwr'   ibtmp1           mysql               mysql.sock.lock   server-cert.pem      undo_001
```
可以看到，GreatSQL服务已经正常启动了。

顺便确认动态库 `jemalloc` 成功加载：
```bash
$ lsof -p 43653 | grep -i jema

...
mysqld  52003 mysql  mem       REG              253,0     608096   68994440 /usr/lib64/libjemalloc.so.2
```

::: tip 小贴士

如果是在Docker环境中采用RPM方式安装GreatSQL，或其他特殊安装方式导致在安装完毕后无法直接用systemd方式启动GreatSQL，也就无法在systemd中调用 `mysqld_pre_systemd` 脚本完成初始化后并启动的过程，这时候需要手动初始化，即手动执行 `/usr/bin/mysqld_pre_systemd` 脚本（RPM方式安装后的默认路径）完成初始化：

```bash
$ chmod +x /usr/bin/mysqld_pre_systemd && /usr/bin/mysqld_pre_systemd
```

正常的话，就会完成GreatSQL的初始化工作并启动GreatSQL数据库服务进程。

:::

##  连接登入GreatSQL

RPM方式安装GreatSQL后，会随机生成管理员root的密码，通过搜索日志文件获取：
```bash
$ grep -i root /data/GreatSQL/error.log

...
[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: ahaA(ACmw8wy
```
可以看到，root账户的密码是："ahaA(ACmw8wy" (不包含双引号)，复制到粘贴板里。

首次登入GreatSQL后，要立即修改root密码，否则无法执行其他操作，并且新密码要符合一定安全规则：
```bash
$ mysql -uroot -p
Enter password:     #<--这个地方粘贴上面复制的随机密码
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910

Copyright (c) 2021-2023 GreatDB Software Co., Ltd
Copyright (c) 2009-2021 Percona LLC and/or its affiliates
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> status;   #<--想执行一个命令，提示要先修改密码
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.

greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@202X';  #<--修改密码
Query OK, 0 rows affected (0.02 sec)

greatsql> status;   #<--就可以正常执行其他命令了
--------------
mysql  Ver 8.0.32-27 for Linux on x86_64 (GreatSQL, Release 27, Revision aa66a385910)

Connection id:          8
Current database:
Current user:           root@localhost
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
Protocol version:       10
Connection:             Localhost via UNIX socket
Server characterset:    utf8mb4
Db     characterset:    utf8mb4
Client characterset:    utf8mb4
Conn.  characterset:    utf8mb4
UNIX socket:            /data/GreatSQL/mysql.sock
Binary data as:         Hexadecimal
Uptime:                 20 min 8 sec

Threads: 2  Questions: 7  Slow queries: 0  Opens: 130  Flush tables: 3  Open tables: 46  Queries per second avg: 0.005
--------------

greatsql> SHOW DATABASES;  #<--查看数据库列表
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.01 sec)
```

##  关闭/重启GreatSQL

执行下面的命令关闭GreatSQL数据库。
```bash
systemctl stop mysqld
```

执行下面的命令重启GreatSQL数据库。
```bash
systemctl restart mysqld
```

GreatSQL数据库安装并初始化完毕。

##  安装GreatSQL Shell

为了支持仲裁节点特性，需要安装GreatSQL Shell。打开[GreatSQL下载页面](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-25)，找到 **GreatSQL MySQL Shell**，下载相应的MySQL Shell安装包（目前只提供二进制安装包）。

P.S，如果暂时不想使用仲裁节点特性的话，则可以继续使用相同版本的官方MySQL Shell安装包，可以直接用yum方式安装，此处略过。

本文场景中，选择下面的二进制包：

- greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz

将二进制文件包放在 `/usr/local` 目录下，解压缩：
```bash
cd /usr/local/
tar xf greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
```

修改家目录下的profile文件 `vim ~/.bash_profile`，加入PATH：
```ini
PATH=$PATH:$HOME/bin:/usr/local/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64/bin
export PATH
```

加载，使之生效
```bash
source ~/.bash_profile
```

这样就可以直接执行 `mysqlsh`，而无需每次都加上全路径了。

运行 GreatSQL Shell 8.0.32-25 需要安装 Python 3.8 依赖

```bash
dnf install -y libssh python38 python38-libs python38-pyyaml
pip3.8 install --user certifi pyclamd
```

接下来就可以直接使用mysqlsh了
```bash
$ mysqlsh
MySQL Shell 8.0.32

Copyright (c) 2016, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
 MySQL  JS >
```

GreatSQL Shell就可以正常使用，并继续构建MGR集群了。

##  准备构建MGR集群

在这里建议用MySQL Shell来构建MGR集群，相对于手工构建方便快捷很多，如果想要体验手工构建的同学可以参考这篇文档：[3. 安装部署MGR集群 | 深入浅出MGR](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr/deep-dive-mgr-03.md)。

利用MySQL Shell构建MGR集群比较简单，主要有几个步骤：

1. 检查实例是否满足条件。
2. 创建并初始化一个集群。
3. 逐个添加实例。

接下来一步步执行。

### MGR节点预检查

用管理员账号 root 连接到第一个节点：
```js
#在本地通过socket方式登入
$ mysqlsh -S/data/GreatSQL/mysql.sock -u root
Please provide the password for 'root@.%2Fmysql.sock': ********  <-- 输入root密码
Save password for 'root@.%2Fmysql.sock'? [Y]es/[N]o/Ne[v]er (default No): yes  <-- 提示是否存储密码（视各公司安全规则而定，这里为了方便选择了存储密码）
MySQL Shell 8.0.32
...
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
No default schema selected; type \use <schema> to set one.
WARNING: Found errors loading plugins, for more details look at the log at: /root/.mysqlsh/mysqlsh.log
 MySQL  localhost  JS >
```

接下来，执行 `dba.configureInstance()`命令开始检查当前实例是否准备好了，可以作为MGR集群的一个节点：
```js
# 开始配置MGR节点
MySQL  172.16.16.10:3306 ssl  JS > dba.configureInstance();
Configuring local MySQL instance listening at port 3306 for use in an InnoDB cluster...

This instance reports its own address as GreatSQL-01:3306
Clients and other cluster members will communicate with it through this address by default. If this is not correct, the report_host MySQL system variable should be changed.

# 提示root账号不能运行MGR服务，需要创建新的专用账号
ERROR: User 'root' can only connect from 'localhost'. New account(s) with proper source address specification to allow remote connection from all instances must be created to manage the cluster.

1) Create remotely usable account for 'root' with same grants and password
2) Create a new admin account for InnoDB cluster with minimal required grants
3) Ignore and continue
4) Cancel

Please select an option [1]: 2  #<-- 选择创建最小权限账号
Please provide an account name (e.g: icroot@%) to have it created with the necessary
privileges or leave empty and press Enter to cancel.
Account Name: GreatSQL  <-- 输入账号名
Password for new account: *******  <-- 输入密码***
Confirm password: *******  <-- 再次确认密码

#节点初始化完毕
The instance 'GreatSQL-01:3306' is valid to be used in an InnoDB cluster.

#MGR管理账号创建完毕
Cluster admin user 'GreatSQL'@'%' created.
The instance 'GreatSQL-01:3306' is already ready to be used in an InnoDB cluster.
```
**截止到这里，以上所有步骤在另外两个节点 GreatSQL-02、GreatSQL-03 也同样执行一遍。**

### 创建并初始化一个集群

在正式初始化MGR集群前，再次提醒要先再其他节点完成上述初始化工作。

上述另外两个节点也初始化完毕后，利用mysqlsh客户端，指定新建MGR的管理账号**GreatSQL**登入PRIMARY节点，准备创建MGR集群：
```js
$ mysqlsh --uri GreatSQL@172.16.16.10:3306
Please provide the password for 'GreatSQL@172.16.16.10:3306': *************
Save password for 'GreatSQL@172.16.16.10:3306'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.32
...
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
No default schema selected; type \use <schema> to set one.

# 选定GreatSQL-01节点作为PRIMARY，开始创建MGR集群
# 集群命名为 GreatSQLMGR，后面mysqlrouter读取元数据时用得上
MySQL  172.16.16.10:3306 ssl  JS > c = dba.createCluster('GreatSQLMGR');
A new InnoDB cluster will be created on instance '172.16.16.10:3306'.

Validating instance configuration at 172.16.16.10:3306...

This instance reports its own address as GreatSQL-01:3306

Instance configuration is suitable.
NOTE: Group Replication will communicate with other members using 'GreatSQL-01:33061'. Use the localAddress option to override.

Creating InnoDB cluster 'GreatSQLMGR' on 'GreatSQL-01:3306'...

Adding Seed Instance...
Cluster successfully created. Use Cluster.addInstance() to add MySQL instances.
At least 3 instances are needed for the cluster to be able to withstand up to
one server failure.
MySQL  172.16.16.10:3306 ssl  JS >
```
集群已经创建并初始化完毕，接下来就是继续添加其他节点了。

### 逐个添加实例

可以在GreatSQL-01（PRIMARY）节点上直接添加其他节点，也可以用mysqlsh客户端登入其他节点执行添加节点操作。这里采用前者：
```js
# 此时mysqlsh客户端还保持连接到GreatSQL-01节点
# 可以直接添加GreatSQL-02节点
MySQL  172.16.16.10:3306 ssl  JS > c.addInstance('GreatSQL@172.16.16.11:3306');  <-- 添加GreatSQL-02节点
NOTE: The target instance 'GreatSQL-02:3306' has not been pre-provisioned (GTID set is empty). The Shell is unable to decide whether incremental state recovery can correctly provision it.
The safest and most convenient way to provision a new instance is through automatic clone provisioning, which will completely overwrite the state of 'GreatSQL-02:3306' with a physical snapshot from an existing cluster member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

The incremental state recovery may be safely used if you are sure all updates ever executed in the cluster were done with GTIDs enabled, there are no purged transactions and the new instance contains the same GTID set as the cluster or a subset of it. To use this method by default, set the 'recoveryMethod' option to 'incremental'.

# 选择恢复模式：克隆/增量恢复/忽略，默认选择克隆
Please select a recovery method [C]lone/[I]ncremental recovery/[A]bort (default Clone):
Validating instance configuration at 172.16.16.11:3306...

This instance reports its own address as GreatSQL-02:3306

Instance configuration is suitable.
NOTE: Group Replication will communicate with other members using 'GreatSQL-02:33061'. Use the localAddress option to override.

A new instance will be added to the InnoDB cluster. Depending on the amount of
data on the cluster this might take from a few seconds to several hours.

Adding instance to the cluster...

Monitoring recovery process of the new cluster member. Press ^C to stop monitoring and let it continue in background.
Clone based state recovery is now in progress.

# 提示在这个过程中需要重启GreatSQL-02节点实例
# 如果无法自动重启，需要手动重启
NOTE: A server restart is expected to happen as part of the clone process. If the
server does not support the RESTART command or does not come back after a
while, you may need to manually start it back.

* Waiting for clone to finish...
# 从GreatSQL-01节点克隆数据
NOTE: GreatSQL-02:3306 is being cloned from GreatSQL-01:3306
** Stage DROP DATA: Completed
** Clone Transfer
    FILE COPY  ############################################################  100%  Completed
    PAGE COPY  ############################################################  100%  Completed
    REDO COPY  ############################################################  100%  Completed
    NOTE: GreatSQL-02:3306 is shutting down...

* Waiting for server restart... \   <-- 重启中
* Waiting for server restart... ready   <-- 重启完毕，如果没有加入systemed，则需要自己手工启动
* GreatSQL-02:3306 has restarted, waiting for clone to finish...
** Stage RESTART: Completed
* Clone process has finished: 59.62 MB transferred in about 1 second (~59.62 MB/s)

State recovery already finished for 'GreatSQL-02:3306'

# 新节点 GreatSQL-02:3306 已加入集群
The instance 'GreatSQL-02:3306' was successfully added to the cluster.
```

这就将 GreatSQL-02 节点加入MGRT集群中了，此时可以先查看下集群状态。

```js
MySQL  172.16.16.10:3306 ssl  JS > c.status()
{
    "clusterName": "GreatSQLMGR",
    "defaultReplicaSet": {
        "name": "default",
        "primary": "172.16.16.10:3306",
        "ssl": "REQUIRED",
        "status": "OK_NO_TOLERANCE",
        "statusText": "Cluster is NOT tolerant to any failures.",
        "topology": {
            "172.16.16.10:3306": {
                "address": "172.16.16.10:3306",
                "memberRole": "PRIMARY",
                "mode": "R/W",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            },
            "172.16.16.11:3306": {
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            }
        },
        "topologyMode": "Single-Primary"
    },
    "groupInformationSourceMember": "172.16.16.10:3306"
}
```
可以看到，一个包含两节点的MGR集群已经构建好了，Primary节点是 *172.16.16.10:3306*，接下来还要加入另一个节点：**仲裁节点**。

如果不想体验仲裁节点特性的话，可以照着上面操作再次正常加入 GreatSQL-03 节点作为 Secondary 节点即可，到这里就可以结束MGR集群构建工作了。

### 添加仲裁节点

编辑 GreatSQL-03 节点上的 `/etc/my.cnf` 配置文件，加入/修改下面这行内容：
```ini
loose-group_replication_arbitrator = 1
```
其作用就是指定该节点作为**仲裁节点**，保存退出，重启该节点GreatSQL数据库。

然后照着第三步的操作，调用 `dba.addInstance()` 添加新节点，就可以直接将仲裁节点加入MGR集群了，再次查看集群状态：

```js
MySQL  172.16.16.10:3306 ssl  JS > c.status()
{
    "clusterName": "GreatSQLMGR",
    "defaultReplicaSet": {
        "name": "default",
        "primary": "172.16.16.10:3306",
        "ssl": "REQUIRED",
        "status": "OK",
        "statusText": "Cluster is ONLINE and can tolerate up to ONE failure.",
        "topology": {
            "172.16.16.10:3306": {
                "address": "172.16.16.10:3306",
                "memberRole": "PRIMARY",
                "mode": "R/W",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            },
            "172.16.16.11:3306": {
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            },
            "172.16.16.12:3306": {
                "address": "172.16.16.12:3306",
                "memberRole": "ARBITRATOR",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.0.32"
            }
        },
        "topologyMode": "Single-Primary"
    },
    "groupInformationSourceMember": "172.16.16.10:3306"
}
```
可以看到一个包含仲裁节点的三节点MGR集群已经构建完毕。

在后面的内容中，我们再介绍如何手工方式部署MGR集群，以及利用MySQL Router实现读写分离及读可扩展，详见：[读写分离](../6-oper-guide/2-oper-rw-splitting.md)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
