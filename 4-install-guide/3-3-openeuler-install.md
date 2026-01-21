# 欧拉openEuler系统中安装GreatSQL

---

##  准备工作

###  配置yum源

开始编译之前，建议先配置好yum源，方便安装一些工具以及必要的依赖包。

这里采用系统安装后默认的yum源，并生成缓存。

```bash
yum clean all && yum makecache
```

在开始安装前，请根据文档 [安装准备](./1-install-prepare.md) 已经完成准备工作。

###  关闭selinux

```bash
setenforce=0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

###  选择下载GreatSQL二进制包

本文使用的欧拉openEuler系统如下：

```bash
$ cat /etc/os-release

...
NAME="openEuler"
VERSION="20.03 (LTS-SP3)"
ID="openEuler"
VERSION_ID="20.03"
PRETTY_NAME="openEuler 20.03 (LTS-SP3)"
ANSI_COLOR="0;31"

$ ldd --version

...
ldd (GNU libc) 2.28
```

那么在这个环境下，可以选择 [GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4) 这个二进制包进行安装。若glibc为2.17，请选择带有"glibc2.17"标识的安装包。

当然了，也可以选择相应的minimal包，minimal版本是对二进制文件进行strip后，所以文件尺寸较小，功能上没本质区别，但不支持gdb debug功能，可以放心使用。

::: tip 小贴士
若您的CPU架构为ARM版本请采用ARM版本的安装包`GreatSQL-8.4.4-4-Linux-glibc2.28-aarch64.tar.xz`。
:::

将下载的二进制包放到安装目录下，并解压缩：

```bash
cd /usr/local
tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
```

同时修改设置，将GreatSQL加入 `PATH` 环境变量：

```bash
echo 'export PATH=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

安装GreatSQL需要先安装其他依赖包，可执行下面命令完成：

```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```

如果报告个别依赖包安装失败或者找不到就删掉，然后重试。更详细的请参考：[安装准备](./1-install-prepare.md)。

接下来准备开始安装GreatSQL二进制包。

##  安装GreatSQL

### 创建或修改 /etc/my.cnf 配置文件

如果 `/etc/my.cnf` 配置文件不存在就新建一个，文件内容请参考这份 [my.cnf 模板](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.4.4-4)，可根据实际情况修改，一般主要涉及数据库文件分区、目录，内存配置等少数几个选项。以下面这份为例：

```ini
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
basedir = /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
datadir    = /data/GreatSQL
socket    = /data/GreatSQL/mysql.sock
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
max_connections = 1024
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
tmp_table_size = 96M
max_heap_table_size = 96M
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
max_binlog_cache_size = 6G
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
replica_preserve_commit_order = ON
replica_checkpoint_period = 2
loose-rpl_read_binlog_speed_limit = 100

# MGR
loose-plugin_load_add = 'mysql_clone.so'
loose-plugin_load_add = 'group_replication.so'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
loose-group_replication_local_address = "172.16.16.10:33061"
loose-group_replication_group_seeds = '172.16.16.10:33061,72.16.16.12:33061,72.16.16.12:33061'
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
innodb_buffer_pool_size = 2G #如果是专用的数据库服务器，则可以设置为物理内存的50%-70%，视实际情况而定
innodb_buffer_pool_instances = 8
innodb_data_file_path = ibdata1:12M:autoextend
innodb_flush_log_at_trx_commit = 1
innodb_log_buffer_size = 64M
innodb_redo_log_capacity = 6G
innodb_doublewrite_files=64
innodb_doublewrite_pages = 128
innodb_max_undo_log_size = 4G
innodb_io_capacity = 10000
innodb_io_capacity_max = 20000
innodb_open_files = 65535
innodb_flush_method = O_DIRECT
innodb_use_fdatasync = ON
innodb_lru_scan_depth=9000
innodb_lock_wait_timeout = 10
innodb_rollback_on_timeout = ON
innodb_print_all_deadlocks = ON
innodb_online_alter_log_max_size = 4G
innodb_print_ddl_logs=OFF
innodb_status_file = ON
innodb_status_output = OFF
innodb_status_output_locks = ON
innodb_sort_buffer_size = 64M
innodb_adaptive_hash_index = OFF
innodb_numa_interleave = OFF
innodb_spin_wait_delay = 20
innodb_print_lock_wait_timeout_info=OFF
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

一般修改 *basedir/datadir/innodb_buffer_pool_size* 等几个选项就可以，修改完后保存退出。

### 新建mysql用户

```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql -M mysql -s /sbin/nologin
```

### 新建 datadir

新建数据库主目录，并修改权限模式及属主：

```bash
mkdir -p /data/GreatSQL 
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
```

### 配置GreatSQL systemd服务

推荐采用systemd来管理GreatSQL服务，执行 `vim /etc/systemd/system/greatsql.service` 命令，添加下面的内容：

```ini
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
ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```

务必确认文件中 `ExecStartPre` 和 `ExecStart` 两个参数指定的目录及文件名是否正确。

**提示**：如果不是安装到默认的 `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64` 目录下（不同版本具体目录也有所变化），可能会影响 GreatSQL 的自动初始化操作。这种时候，可以先将GreatSQL二进制包解压缩到 `/usr/local` 目录下，再根据需要自行做软链接，例如：

```bash
tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz -C /usr/local
ln -s /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64 /usr/local/GreatSQL
```
这样既不影响GreatSQL的自动初始化，又能满足自定义需要。

也可以编辑二进制包中的 `mysqld_pre_systemd` 脚本，修改脚本中几处涉及 GreatSQL 安装路径的地方，例如：

```bash
# grep -n GreatSQL mysqld_pre_systemd
33:    ret=$(/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/my_print_defaults  ${instance:+--defaults-group-suffix=@$instance} $section | \
178:    /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld ${instance:+--defaults-group-suffix=@$instance} --initialize \
183:    if [ -x /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup -a ! -e "${datadir}/server-key.pem" ] ; then
184:        /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup --datadir="$datadir" --uid=mysql >/dev/null 2>&1
```

以上几处请自行修改，然后执行命令重载systemd，加入 `greatsql` 服务，如果没问题就不会报错：

```bash
systemctl daemon-reload
```

这就安装成功并将GreatSQL添加到系统服务中，后面可以用 `systemctl` 来管理GreatSQL服务。

编辑 `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd` 文件，将文件中的几处 `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/` 改为 GreatSQL 实际安装目录。

### 添加动态依赖库

编辑 `/etc/ld.so.conf` 文件，增加以下几行内容：

```ini
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/mysqlrouter/
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/mysqlrouter/private
```

保存退出，执行下面的命令，确认生效：

```bash
ldconfig && ldconfig -p | grep libprotobuf.so

...
	libprotobuf.so.24.4.0 (libc6,x86-64) => /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.24.4.0
```

这个步骤的作用是加载 GreatSQL 自带的动态依赖库文件，这样在运行 mysql/mysqld 等二进制文件时可能需要用到，避免报错。

## 启动GreatSQL

执行下面的命令启动GreatSQL服务

```bash
systemctl start greatsql
```

如果是在一个全新环境中首次启动GreatSQL数据库，可能会失败，因为在 `mysqld_pre_systemd` 的初始化处理逻辑中，需要依赖 `/var/lib/mysql-files` 目录保存一个临时文件。如果首次启动失败，可能会有类似下面的报错提示：

::: details 查看运行结果
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since ...
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 790866 ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
  Process: 791426 ExecStart=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS (code=exited, status=1/FAILURE)
 Main PID: 791426 (code=exited, status=1/FAILURE)

systemd[1]: Starting GreatSQL Server...
mysqld_pre_systemd[790895]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or direct>
mysqld_pre_systemd[790896]: chmod: cannot access '': No such file or directory
mysqld_pre_systemd[790894]: /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 43: : No such file or directory
mysqld_pre_systemd[790894]: /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 44: $initfile: ambiguous redirect
systemd[1]: Started GreatSQL Server.
systemd[1]: greatsql.service: Main process exited, code=exited, status=1/FAILURE
systemd[1]: greatsql.service: Failed with result 'exit-code'.
```
:::

只需手动创建 `/var/lib/mysql-files` 目录，再次启动GreatSQL服务即可：

```bash
mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
systemctl start greatsql
```

检查服务是否已启动，以及进程状态：

```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: active (running) since ...
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 793576 ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 793606 (mysqld)
   Memory: 2.5G
   CGroup: /system.slice/greatsql.service
           └─793606 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld
mysql     818929       1  4 14:08 ?        00:00:07 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld

$ ss -lntp | grep mysqld
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=60231,fd=38))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=60231,fd=43))
```

可以看到，GreatSQL服务已经正常启动了。

## 连接登入GreatSQL

在上面进行GreatSQL初始化时，会为 *root@localhost* 用户生成一个随机密码，记录在 `error.log` 日志文件中，例如下面这样：

```bash
$ grep -i root /data/GreatSQL/error.log

...
A temporary password is generated for root@localhost: ji!pjndiw5sJ
```

复制该密码，将用于首次登入GreatSQL所需。

部分GreatSQL二进制包方式安装后，有可能初始化的root密码是空的，这种情况下可以直接登入并修改成安全密码。

```sql
$ mysql -uroot  -p"ji!pjndiw5sJ"   #<--这里输入刚才复制的临时密码
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
...
greatsql> status;
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

首次登入立刻提醒该密码已过期，需要修改，执行 SQL 命令 `ALTER USER USER() IDENTIFIED BY` 修改即可：

```sql
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@2022';  #<--修改密码
Query OK, 0 rows affected (0.02 sec)

greatsql> status;
...
mysql  Ver 8.4.4-4 for Linux on x86_64 (GreatSQL, Release 4, Revision d73de75905d)

Connection id:          9
Current database:       
Current user:           root@localhost
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
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

## 安装GreatSQL Shell

下载GreatSQL Shell二进制包*greatsql-shell-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz*。

接下来安装GreatSQL Shell，以及进行MGR初始化等操作和用RPM包方式安装一样，这里就不赘述了。

参考文档[RPM安装并构建MGR集群](./2-install-with-rpm.md#安装greatsql-shell)，从“安装MySQL Shell”这节开始及往后内容即可。

GreatSQL Shell就可以正常使用，并继续构建MGR集群了。

::: tip 小贴士
推荐使用 Docker 来运行 GreatSQL Shell，详情参考 [GreatSQL-Shell Docker](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell)。
:::

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
