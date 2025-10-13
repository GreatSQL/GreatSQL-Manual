# Arch Linux系统中安装GreatSQL
---
## 了解Arch Linux

Arch Linux是一个轻量、灵活、基于x86-64架构的Linux发行版，遵循K.I.S.S.原则。注重代码正确、优雅和极简主义，期待用户能够愿意去理解系统的操作。

### 简洁

Arch Linux将简洁定义为：避免任何不必要的添加、修改和复杂增加。简单来说，archlinux 是一个可以让用户自己动手打造的操作系统。从安装到管理，archlinux 放手让用户处理一切。

用户可以自己决定使用哪种桌面环境、安装哪些组件和服务。这种精细化的控制能够赋予你一个精简的操作系统，可以让用户自由选择所需的组件来构建属于用户自己的系统。

### 滚动更新（现代）

滚动更新（rolling update）是指软件开发中经常性将更新发送到软件的概念。相较于滚动发行，有标准版本和小数点版本的版本号开发模式，必需通过重新安装以取代先前的发行版。Arch Linux 是没有版本概念的，它始终保持最新的状态，通俗的理解就相当于把发行版比喻为一部车，ubuntu 更新就是换一部新的，而 Arch Linux就是把车里面旧的配件换成新的。

Arch Linux是一个滚动发行版，这意味着：

1. 新的内核和应用程序版本一经发布，就会立即向用户推送
2. 当大多数其它 Linux 发行版还在提供旧的 Linux 内核版本时，Arch Linux会迅速向用户提供最新的内核
3. 而软件也是如此。如果 Arch Linux仓库中的软件发布了新版本，Arch Linux用户通常会比其他用户先获得新版本
4. 在滚动发行模式下，一切都是新鲜和前沿的。用户不必把操作系统从一个版本升级到另一个版本，只要使用 `pacman` 的升级命令，便会始终保持最新的版本

### 实用

Arch Linux注重实用性，避免意识形态之争。最终的设计决策都是由开发者的共识决定。开发者依赖基于事实的技术分析和讨论，避免政治因素，不会被流行观点左右。

Arch Linux的仓库中包含大量的软件包和编译脚本。用户可以按照需要自由选择。仓库中既提供了开源、自由的软件，**也提供了闭源软件**（大部分闭源软件在 `AUR` 仓库中）。**实用性大于意识形态**。

### 激进的内核更新机制

Arch Linux在更新内核的时候会立即删除旧内核（因为内核也是一个软件包 `linux` / `linux-zen`...，由 `pacman` 更新）

立即删除旧的内核要求 Arch Linux必须重启来加载新的内核，否则容易发生诡异的问题。这是因为 Linux 所谓的“内核”包含有大量的动态加载模块，如果在某次启动后，某个模块没有被加载过，然后系统内核更新了并且删除了旧的内核，那么这些模块将永远不能被加载了——因为它们随着旧内核被删掉了。除非用户重启系统以完整切换到新的内核以使用新版的动态加载模块。

### 软件包管理体系

不同于 Debian 系列的 `apt / dpkg` 和 Red Hat 系列的 `dnf（yum）/ rpm` 包管理体系，Arch Linux只用了一个工具 pacman 就解决了获取和安装两个功能。这降低了为 Arch Linux 制作软件包的门槛，这也是 AUR 几乎能涵盖整个 Linux 软件生态的主要原因。但是这也导致 pacman 不支持虚包（virtual package）。

::: tip 小贴士
更多介绍前往Arch Linux社区网站：[https://www.archlinuxcn.org](https://www.archlinuxcn.org)。
:::

## 安装Arch Linux

安装Arch Linux的过程这里就不再详细介绍了，可以前往Arch Linux的官方文档查看详细的安装流程：[https://arch-linux.osrc.com/rookie/pre-install.html](https://arch-linux.osrc.com/rookie/pre-install.html)。

下面，将展示成功安装完成的Arch Linux环境

```bash
$ uname -a
Linux myarch 6.6.3-arch1-1 #1 SMP PREEMPT_DYNAMIC Wed, 29 Nov 2023 00:37:40 +0000 x86_64 GNU/Linux

$ neofetch
root@myarch 
----------- 
OS: Arch Linux x86_64 
Host: Latitude 5491 
Kernel: 6.6.3-arch1-1 
Uptime: 17 hours, 39 mins 
Packages: 187 (pacman) 
Shell: bash 5.2.21 
Resolution: 1920x1080 
Terminal: /dev/pts/0 
CPU: Intel i7-8850H (12) @ 4.300GHz 
GPU: Intel CoffeeLake-H GT2 [UHD Graphics 630] 
Memory: 239MiB / 15787MiB

$ ldd --version
ldd (GNU libc) 2.38
```

## 安装GreatSQL

### 选择GreatSQL安装包

因为Arch Linux系统自带的ldd (GNU libc)版本是2.38，所以这里下载的GreatSQL二进制包选择

- GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz

Arch Linux系统缺少wget需要先安装wget

```bash
pacman -S wget
```

将二进制安装包下载在`/usr/local`目录下,并解压

```bash
cd /usr/local
wget https://product.greatdb.com/GreatSQL-8.4.4-4/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
```

### 运行环境配置

因为Arch Linux系统主打极简风，所以selinux和防火墙都没有，都不需要手动关闭了

### 安装依赖包

Arch Linux用了一个工具 pacman 作为下载软件包

进入到`GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin`目录，输入命令`ldd mysqld mysql | grep "not found"`若不显示其它信息则已经不缺必要软件包

这里缺失了两个依赖包

```bash
$ ldd mysqld mysql | grep "not found"
libaio.so.1 => not found
libnuma.so.1 => not found
```

使用pacman安装libaio和numactl

```bash
pacman -S libaio
pacman -S numactl
```

最后检查下若不显示其它信息则已经不缺必要软件包
```bash
ldd mysqld mysql | grep "not found"
```

### 创建或修改 /etc/my.cnf 配置文件及新建用户与目录

如果 `/etc/my.cnf` 配置文件不存在就新建一个，文件内容请参考这份 [my.cnf 模板](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.4.4-4)，可根据实际情况修改，一般主要涉及数据库文件分区、目录，内存配置等少数几个选项。以下面这份为例：

```ini
[client]
socket  = /data/GreatSQL/mysql.sock
[mysql]
loose-skip-binary-as-hex
prompt = "(\\D)[\\u@GreatSQL][\\d]>"
no-auto-rehash
[mysqld]
user    = mysql
port    = 3306
server_id = 3306
basedir = /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
datadir = /data/GreatSQL
socket  = /data/GreatSQL/mysql.sock
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
innodb_buffer_pool_size = 2G #如果是专用的数据库服务器，则可以设置为物理内存的50%-70%，视实际情况而定
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

一般修改 *basedir/datadir/innodb_buffer_pool_size* 等几个选项就可以，修改完后保存退出。

接下来新建mysql用户和新建数据库主目录，并修改权限模式及属主

```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
mkdir -p /data/GreatSQL
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
```

如果是在一个全新环境中首次启动GreatSQL数据库，可能会失败，因为在 `mysqld_pre_systemd` 的初始化处理逻辑中，需要依赖 `/var/lib/mysql-files` 目录保存一个临时文件

所以手动创建`/var/lib/mysql-files` 目录

```bash
mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
```

### 增加GreatSQL系统服务

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
#如果是GreatSQL 5.7版本，此处需要改成simple模式，否则可能服务启用异常
#如果是GreatSQL 8.0版本则可以使用notify
#如果启动时my.cnf中增加daemonize=1参数（以daemon方式启动GreatSQL），则可以采用forking模式
#Type=simple
Type=notify
TimeoutSec=10
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
33:    ret=$(/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/my_print_defaults  ${instance:+--defaults-group-suffix=@$instance} $section | \
178:    /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld ${instance:+--defaults-group-suffix=@$instance} --initialize \
183:    if [ -x /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup -a ! -e "${datadir}/server-key.pem" ] ; then
184:        /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup --datadir="$datadir" --uid=mysql >/dev/null 2>&1
```

以上几处请自行修改，然后执行命令重载systemd，加入 `greatsql` 服务，如果没问题就不会报错：

```bash
systemctl daemon-reload
```

这就安装成功并将GreatSQL添加到系统服务中，后面可以用 `systemctl` 来管理GreatSQL服务。

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
  Process: 1258165 ExecStart=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS (code=exited, status=1/FAILURE)
  Process: 1257969 ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 1258165 (code=exited, status=1/FAILURE)
   Status: "Server shutdown complete"

systemd[1]: Starting GreatSQL Server...
mysqld_pre_systemd[1257969]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or directory
mysqld_pre_systemd[1257969]: chmod: cannot access '': No such file or directory
mysqld_pre_systemd[1257969]: /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 43: : No such file or directory
mysqld_pre_systemd[1257969]: /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 44: $initfile: ambiguous redirect
systemd[1]: greatsql.service: Main process exited, code=exited, status=1/FAILURE
systemd[1]: greatsql.service: Failed with result 'exit-code'.
systemd[1]: Failed to start GreatSQL Server.
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
   Active: active (running) since Tue 2024-07-12 10:08:06 CST; 6min ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 60129 ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 60231 (mysqld)
   Status: "Server is operational"
    Tasks: 49 (limit: 149064)
   Memory: 5.6G
   CGroup: /system.slice/greatsql.service
           └─60231 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld

...
mysql      60231       1  2 10:08 ?        00:00:10 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=60231,fd=38))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=60231,fd=43))

# 查看数据库文件
$ ls /data/GreatSQL

...
 auto.cnf        ca-key.pem        error.log           '#ib_archive'    '#innodb_redo'       mysql.ibd         performance_schema   server-key.pem   undo_002
 binlog.000001   ca.pem           '#file_purge'         ib_buffer_pool   innodb_status.258   mysql.pid         private_key.pem      slow.log
 binlog.000002   client-cert.pem  '#ib_16384_0.dblwr'   ibdata1         '#innodb_temp'       mysql.sock        public_key.pem       sys
 binlog.index    client-key.pem   '#ib_16384_1.dblwr'   ibtmp1           mysql               mysql.sock.lock   server-cert.pem      undo_001
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
greatsql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'GreatSQL@2022';
Query OK, 0 rows affected (0.02 sec)
```

GreatSQL数据库安装并初始化完毕

## 安装GreatSQL Shell

为了支持仲裁节点特性，需要安装GreatSQL Shell。打开GreatSQL下载页面找到

- greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz

下载相应的MySQL Shell安装包（目前只提供二进制安装包）并解压

```bash
cd /usr/local
wget https://product.greatdb.com/GreatSQL-8.0.32-25/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
tar xf greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
```

进入bin目录查看下缺少什么依赖

```bash
$ cd /usr/local/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64/bin
$ ldd mysqlsh | grep "not found"
        libssl.so.1.1 => not found
        libcrypto.so.1.1 => not found
        libpython3.8.so.1.0 => not found
```

安装上缺失的依赖

```sql
pacman -S core/openssl-1.1
pacman -S archlinuxcn/python39
```

因为下载的Python版本过高，所以采用软连接的方式

```
ln -s /usr/lib/libpython3.9.so.1.0 /usr/lib64/libpython3.8.so.1.0
```

再次检查下还有没有缺失依赖

```bash
ldd mysqlsh | grep "not found"
```

没有缺失依赖的话，接下来就可以体验MySQL Shell了

```sql
$ /usr/local/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqlsh
MySQL Shell 8.0.32
...
Type '\help' or '\?' for help; '\quit' to exit.
WARNING: Found errors loading plugins, for more details look at the log at: /root/.mysqlsh/mysqlsh.log
 MySQL  Py > 
```

::: tip 小贴士
推荐使用 Docker 来运行 GreatSQL Shell，详情参考 [GreatSQL-Shell Docker](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell)。
:::

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
