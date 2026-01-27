# 国密算法加密支持
---

GreatSQL 新增国密SM2非对称加密算法，SM3杂凑算法，SM4对称加密算法支持，通过国密算法创建加密连接，加密传输数据。为此 GreatSQL 特地发布国密版本二进制包，在 [下载页面](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4) 中搜索 *支持国密特性二进制包* 关键字并下载相应的二进制包。

本节介绍如何用二进制包方式安装国密版本的GreatSQL数据库，假定本次安装是在CentOS 8.x x86_64环境中安装，并且是以root用户身份执行安装操作。

## 下载安装包

查看服务器的glibc版本，以选择正确的安装包：

```bash
$ ldd --version

...
ldd (GNU libc) 2.28
```
如果您的glibc版本为2.28或更高版本，请选择带有"glibc2.28"标识的安装包；如果您的glibc版本为2.17，请选择带有"glibc2.17"标识的安装包。

[点击此处](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4)，页面滚动到"4. 支持国密特性二进制包"，下载支持国密的安装包，下载以下一个就可以：

- GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz

::: tip 小贴士
- 点击下载链接后，打开的下载地址应该包含"GM"目录，例如 *https://product.greatdb.com/GreatSQL-8.4.4-4/GM/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz*。

- 若您的CPU架构为ARM版本请采用ARM版本的安装包`GreatSQL-8.4.4-4-Linux-glibc2.28-aarch64.tar.xz`。
:::

将下载的二进制包放到安装目录下，并解压缩：
```bash
cd /usr/local
curl -o GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz https://product.greatdb.com/GreatSQL-8.4.4-4/GM/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
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

## 启动前准备

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

# enable GM
enable_gm_ssl=1

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

::: tip 小贴士
相对于普通版本，支持国密的版本在配置文件中增加 `enable_gm_ssl=1` 参数。
:::

一般修改 *basedir/datadir/innodb_buffer_pool_size* 等几个选项就可以，修改完后保存退出。

### 新建mysql用户
```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
```

### 新建 datadir

新建数据库主目录，并修改权限模式及属主：

```bash
mkdir -p /data/GreatSQL
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
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

编辑 `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd` 文件，将文件中的几处 `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/` 改为 GreatSQL 实际安装目录。

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

::: details 查看运行结果
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: activating (start) since Tue 2026-01-27 15:41:42 CST; 20s ago
     Docs: https://greatsql.cn/docs
  Process: 7207 ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
Cntrl PID: 7240 (mysqld)
    Tasks: 37 (limit: 201684)
   Memory: 1.4G
   CGroup: /system.slice/greatsql.service
           └─7240 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld

Jan 27 15:41:42 db150 systemd[1]: Starting GreatSQL Server...

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld

...
mysql       7473       1  5 15:43 ?        00:00:00 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=7473,fd=18))
LISTEN 0      151                *:3306             *:*    users:(("mysqld",pid=7473,fd=25))

# 查看数据库文件
$ ls /data/GreatSQL

...
 auto.cnf        binlog.index          client-sign-cert.pem  '#ib_16384_0.dblwr'  '#innodb_redo'   mysql.sock              public_key.pem         sys
 binlog.000001   ca-key.pem            client-sign-key.pem   '#ib_16384_1.dblwr'  '#innodb_temp'   mysql.sock.lock         server-enc-cert.pem    undo_001
 binlog.000002   ca.pem                db150-slow.log         ib_buffer_pool       mysql           mysql_upgrade_history   server-enc-key.pem     undo_002
 binlog.000003   client-enc-cert.pem   error.log              ibdata1              mysqld.pid      performance_schema      server-sign-cert.pem
 binlog.000004   client-enc-key.pem   '#file_purge'           ibtmp1               mysql.ibd       private_key.pem         server-sign-key.pem
```
:::

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

...
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
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@2026';  #<--修改密码
Query OK, 0 rows affected (0.02 sec)

greatsql> status;
...
Server version:         8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
...
```

GreatSQL数据库安装并初始化完毕。

## 启用通信国密加密支持

使用支持国密版本的 GreatSQL 客户端 **mysql** 登入，加上 `--gm_ssl` 参数，确认通信连接国密支持已生效：

```sql
-- 务必使用TCP协议登入，以确认国密算法生效
-- 例如： mysql -hxx -uxx -pxx --protocol=tcp -P3306 --gm_ssl
greatsql> status;
...
SSL:                    Cipher in use is ECC-SM2-SM4-GCM-SM3
```
看到关键字 **SM2/SM3/SM4** 表示通信连接已经采用国密方式加密。

如果不是用支持国密版本的其他mysql客户端登入，则可能提示下面的错误信息

```bash
mysql: [ERROR] unknown option '--gm_ssl'
```

当通过TCP方式连接到GreatSQL，但没有加上 `--gm_ssl` 参数时，则可能提示下面的错误信息

```bash
ERROR 2026 (HY000): SSL connection error: error:1408F10B:SSL routines:ssl3_get_record:wrong version number
```

::: tip 小贴士
- 目前不支持通过JDBC连接GreatSQL国密服务端。

- 对于C API，需要在 `mysql_real_connect()` 函数之前使用 `mysql_options(mysql, MYSQL_OPT_GM_SSL, &is_gm)` 来设置开启国密认证。
:::

## 采用国密算法加密表空间

GreatSQL 支持数据表空间、系统表空间、Redo Log、Undo Log的静态数据透明加密。

表空间加密keyring架构包含两层加密，master key 和 tablespace key。

master key用于加密tablespace key，加密后的结果存储在tablespace的header中。

tablespace key用于加密数据，当用户想访问加密的表时，InnoDB会先用master key对之前存储在header中的加密信息进行解密，得到tablespace key。再用tablespace key解密数据信息。

tablespace key是不会被改变的，而master key可以通过轮换命令进行更新。

Master key采用keyring_file插件，key file直接存储在磁盘上。

想要生成支持国密的master keyring file，需使用组件 **component_keyring_file**，

1. 在 GreatSQL basedir 目录下的 **mysqld** 主程序所在目录下，创建配置文件 `mysqld.my`，添加如下内容：

```ini
{
"components": "file://component_keyring_file"
}
```

2. 在 GreatSQL basedir 目录下的 **component_keyring_file.so** 组件库文件所在目录，创建配置文件 `component_keyring_file.cnf`，添加如下内容：

```ini
{
"path": "/data/keyring/master_keyring",
"read_only": false
}
```

**提示**：

1. 文件 `mysqld.my` 要和 **mysqld** 二进制文件在相同目录下，例如：*/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld.my*。
1. 文件 `component_keyring_file.cnf` 要和组件库文件 **component_keyring_file.so** 在相同目录下，例如：*/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf*。
1. 参数 `path` 指向 master keyring file 对应的路径。
1. 文件 **master_keyring** 无需提前创建，GreatSQL 在启动时会自动创建。

3. 新建一个专用于存储GreatSQL master keyring file 的目录

该目录不能放在 datadir 目录下，并修改相应的属主及权限模式：

```bash
# datadir是 /data/GreatSQL，要区分开
mkdir /data/keyring

chown -R mysql:mysql /data/keyring /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld.my

chmod 750 /data/keyring
chmod 0640 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld.my
```

再次确认文件属主及权限模式

```bash
stat /data/keyring/ /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld.my | grep Uid

Access: (0750/drwxr-xr-x)  Uid: ( 3306/   mysql)   Gid: ( 3306/   mysql)
Access: (0640/-rw-r--r--)  Uid: ( 3306/   mysql)   Gid: ( 3306/   mysql)
Access: (0640/-rw-r--r--)  Uid: ( 3306/   mysql)   Gid: ( 3306/   mysql)
```

重启 GreatSQL

```bash
systemctl restart greatsql
```

执行下面的查询，确认 *component_keyring_file* 组件已启用
```sql
greatsql> SELECT * FROM performance_schema.keyring_component_status;
+---------------------+------------------------------+
| STATUS_KEY          | STATUS_VALUE                 |
+---------------------+------------------------------+
| Component_name      | component_keyring_file       |
| Author              | Oracle Corporation           |
| License             | GPL                          |
| Implementation_name | component_keyring_file       |
| Version             | 1.0                          |
| Component_status    | Active                       |
| Data_file           | /data/keyring/master_keyring |
| Read_only           | No                           |
+---------------------+------------------------------+
```

刚初始化时的master key还是个空文件，需要重新生成一份：
```sql
greatsql> system ls -la /data/keyring/master_keyring
-rw-r----- 1 mysql mysql 0 Jan 27 16:34 /data/keyring/master_keyring

# 更新master key
greatsql> ALTER INSTANCE ROTATE INNODB MASTER KEY;

greatsql> system ls -la /data/keyring/master_keyring
-rw-r----- 1 mysql mysql 390 Jan 27 16:55 /data/keyring/master_keyring
```

接下来就可以对多种数据库对象（库、表、表空间）设置是否加密。
```sql
-- 设置该库下新建的表默认加密
greatsql> ALTER DATABASE test encryption = 'Y';

greatsql> SHOW CREATE DATABASE test\G
*************************** 1. row ***************************
       Database: test
Create Database: CREATE DATABASE `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='Y' */

greatsql> CREATE TABLE t1(id INT PRIMARY KEY) ENCRYPTION='Y';

greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ENCRYPTION='Y'

-- 取消加密
greatsql> ALTER TABLE t1 ENCRYPTION='N';
```
**注意：** keyring文件需要做好备份，万一不慎被删除、修改或移走，都会导致被加密的数据库对象无法被正确读取，这时就可以将备份文件恢复回去。

## 查看元数据
可以在 `performance_schema` 和 `information_schema` 中查看加密相关元数据信息：

```sql
-- 查看当前的master key
greatsql> SELECT * FROM performance_schema.keyring_keys;
+--------------------------------------------------+-----------+----------------+
| KEY_ID                                           | KEY_OWNER | BACKEND_KEY_ID |
+--------------------------------------------------+-----------+----------------+
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-2 |           |                |
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-4 |           |                |
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-3 |           |                |
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-1 |           |                |
+--------------------------------------------------+-----------+----------------+

-- 查看都有哪些表空间文件被加密
greatsql> SELECT SPACE, NAME, SPACE_TYPE, ENCRYPTION FROM information_schema.INNODB_TABLESPACES WHERE ENCRYPTION='Y';
+-------+---------+------------+------------+
| SPACE | NAME    | SPACE_TYPE | ENCRYPTION |
+-------+---------+------------+------------+
|     6 | test/t1 | Single     | Y          |
+-------+---------+------------+------------+

-- 查看有哪些表被加密
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, CREATE_OPTIONS FROM information_schema.TABLES WHERE CREATE_OPTIONS LIKE '%ENCRYPTION%'; -- table
+--------------+------------+----------------+
| TABLE_SCHEMA | TABLE_NAME | CREATE_OPTIONS |
+--------------+------------+----------------+
| test         | t1         | ENCRYPTION='Y' |
+--------------+------------+----------------+

-- 查看哪些库被加密
SELECT SCHEMA_NAME, DEFAULT_ENCRYPTION FROM information_schema.SCHEMATA WHERE DEFAULT_ENCRYPTION='YES';
+-------------+--------------------+
| SCHEMA_NAME | DEFAULT_ENCRYPTION |
+-------------+--------------------+
| test        | YES                |
+-------------+--------------------+
```

更多详情请见MySQL文档：
- [https://dev.mysql.com/doc/refman/8.0/en/keyring.html](https://dev.mysql.com/doc/refman/8.0/en/keyring.html)
- [https://dev.mysql.com/doc/refman/8.0/en/innodb-data-encryption.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-data-encryption.html)


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
