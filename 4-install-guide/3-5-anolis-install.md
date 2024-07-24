# 龙蜥Anolis系统中安装GreatSQL

---

本文档主要介绍如何用二进制包方式安装GreatSQL数据库，假定本次安装是在Anolis OS release 8.8 x86_64环境中安装，并且是以root用户身份执行安装操作。

环境介绍

```Bash
$ cat /etc/anolis-release
Anolis OS release 8.8
----
$ getconf GNU_LIBC_VERSION
glibc 2.28
```

在开始安装前，请根据文档 [安装准备](./1-install-prepare.md) 已经完成准备工作。

## 下载安装包

先安装wget

```bash
$ yum install -y wget
```
查看机器的glibc版本，以选择正确的安装包：
```bash
$ ldd --version
ldd (GNU libc) 2.28
```
如果您的glibc版本为2.28或更高版本，请选择带有"glibc2.28"标识的安装包；如果您的glibc版本为2.17，请选择带有"glibc2.17"标识的安装包。

[点击此处](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)下载最新的安装包，下载以下二进制包就可以：

- GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz

将下载的二进制包放到安装目录下，并解压缩：

```bash
$ cd /usr/local
$ curl -o GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz https://product.greatdb.com/GreatSQL-8.0.32-26/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz
$ tar xf GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz
```

**提示**：安装GreatSQL需要先安装其他依赖包，可执行下面命令完成：

安装GreatSQL需要先安装其他依赖包，可执行下面命令完成： 

```
$ yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```

如果报告个别依赖包安装失败或者找不到就删掉，然后重试。更详细的请参考：[安装准备](./1-install-prepare.md)。

选择安装`jemalloc jemalloc-devel`jemalloc并库不是必须的，用它的好处是可以优化内存管理性能等，有条件的话尽量启用。

```bash
$ yum install epel-release  -y
$ yum install jemalloc jemalloc-devel -y
```

进入到`GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin`目录，输入命令`ldd mysqld mysql | grep "not found"`若不显示其它信息则已经不缺必要软件包

## 启动前准备

### 修改 /etc/my.cnf 配置文件

[参考这份文件](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-26)，可根据实际情况修改，一般主要涉及数据库文件分区、目录，内存配置等少数几个选项。以下面这份为例：

```sql
$ vi /etc/my.cnf
[client]
user = root
socket  = /data/GreatSQL/mysql.sock

[mysqld]
user    = mysql
port    = 3306
#主从复制或MGR集群中，server_id记得要不同
#另外，实例启动时会生成 auto.cnf，里面的 server_uuid 值也要不同
#server_uuid的值还可以自己手动指定，只要符合uuid的格式标准就可以
server_id = 3306
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/GreatSQL
socket  = /data/GreatSQL/mysql.sock
pid-file = mysql.pid
character-set-server = UTF8MB4
skip_name_resolve = 1
#若你的MySQL数据库主要运行在境外，请务必根据实际情况调整本参数
default_time_zone = "+8:00"

#performance setttings
lock_wait_timeout = 3600
open_files_limit    = 65535
back_log = 1024
max_connections = 512
max_connect_errors = 1000000
table_open_cache = 1024
table_definition_cache = 1024
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
#GIPK
loose-sql_generate_invisible_primary_key = ON

#log settings
log_timestamps = SYSTEM
log_error = /data/GreatSQL/error.log
log_error_verbosity = 3
slow_query_log = 1
log_slow_extra = 1
slow_query_log_file = slow.log
#设置slow log文件大小1G及总文件数10
max_slowlog_size = 1073741824
max_slowlog_files = 10
long_query_time = 0.1
log_queries_not_using_indexes = 1
log_throttle_queries_not_using_indexes = 60
min_examined_row_limit = 100
log_slow_admin_statements = 1
log_slow_slave_statements = 1
log_bin = binlog
binlog_format = ROW
sync_binlog = 1
binlog_cache_size = 4M
max_binlog_cache_size = 2G
max_binlog_size = 1G
#控制binlog总大小，避免磁盘空间被撑爆
binlog_space_limit = 500G
binlog_rows_query_log_events = 1
binlog_expire_logs_seconds = 604800
#MySQL 8.0.22前，想启用MGR的话，需要设置binlog_checksum=NONE才行
binlog_checksum = CRC32
gtid_mode = ON
enforce_gtid_consistency = TRUE

#myisam settings
key_buffer_size = 32M
myisam_sort_buffer_size = 128M

#replication settings
relay_log_recovery = 1
slave_parallel_type = LOGICAL_CLOCK
#可以设置为逻辑CPU数量的2倍
slave_parallel_workers = 64
binlog_transaction_dependency_tracking = WRITESET
slave_preserve_commit_order = 1
slave_checkpoint_period = 2

#mgr settings
loose-plugin_load_add = 'mysql_clone.so'
loose-plugin_load_add = 'group_replication.so'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
#MGR本地节点IP:PORT，请自行替换
loose-group_replication_local_address = "172.16.16.10:33061"
#MGR集群所有节点IP:PORT，请自行替换
loose-group_replication_group_seeds = "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
loose-group_replication_start_on_boot = OFF
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

#innodb settings
innodb_buffer_pool_size = 2G
innodb_buffer_pool_instances = 8
innodb_data_file_path = ibdata1:12M:autoextend
innodb_flush_log_at_trx_commit = 1
innodb_log_buffer_size = 32M
innodb_log_file_size = 2G
innodb_log_files_in_group = 3
innodb_redo_log_capacity = 6G
innodb_max_undo_log_size = 4G
# 根据您的服务器IOPS能力适当调整
# 一般配普通SSD盘的话，可以调整到 10000 - 20000
# 配置高端PCIe SSD卡的话，则可以调整的更高，比如 50000 - 80000
innodb_io_capacity = 4000
innodb_io_capacity_max = 8000
innodb_open_files = 65535
innodb_flush_method = O_DIRECT
innodb_lru_scan_depth = 4000
innodb_lock_wait_timeout = 10
innodb_rollback_on_timeout = 1
innodb_print_all_deadlocks = 1
innodb_online_alter_log_max_size = 4G
innodb_print_ddl_logs = 0
innodb_status_file = 1
#注意: 开启 innodb_status_output & innodb_status_output_locks 后, 可能会导致log_error文件增长较快
innodb_status_output = 0
innodb_status_output_locks = 1
innodb_sort_buffer_size = 67108864
innodb_adaptive_hash_index = 0
#开启NUMA支持
innodb_numa_interleave = ON
innodb_print_lock_wait_timeout_info = 1
#自动杀掉超过5分钟不活跃事务，避免行锁被长时间持有
kill_idle_transaction = 300

#innodb monitor settings
#innodb_monitor_enable = "module_innodb,module_server,module_dml,module_ddl,module_trx,module_os,module_purge,module_log,module_lock,module_buffer,module_index,module_ibuf_system,module_buffer_page,module_adaptive_hash"

#innodb parallel query
loose-force_parallel_execute = OFF
loose-parallel_default_dop = 8
loose-parallel_max_threads = 96
temptable_max_ram = 8G

#pfs settings
performance_schema = 1
#performance_schema_instrument = '%memory%=on'
performance_schema_instrument = '%lock%=on'
```

###  新建mysql用户

```bash
$ /sbin/groupadd mysql
$ /sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
```

###  新建 datadir

新建数据库主目录，并修改权限模式及属主：


```bash
$ mkdir -p /data/GreatSQL
$ chown -R mysql:mysql /data/GreatSQL
$ chmod -R 700 /data/GreatSQL
```

## 启动GreatSQL

把GreatSQL添加进环境变量

```bash
$ sh -c 'echo "export PATH=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin:\$PATH" >> /etc/profile'
# 刷新文件使得生效
$ source /etc/profile
```

初始化GreatSQL

```bash
$ mysqld --defaults-file=/etc/my.cnf --initialize-insecure --user=mysql
```

启动GreatSQL

```bash
$ mysqld --defaults-file=/etc/my.cnf&
```

因为本文示例环境在Docker中，所以不采用systemd管理GreatSQL服务，但无论是RPM、二进制包还是Ansible等何种方式安装GreatSQL，都建议采用systemd来管理GreatSQL服务。在Docker容器环境中，无需利用systemd来管理GreatSQL，直接整个容器启停即可。

参考文档：[二进制包安装](./3-install-with-tarball.md)。

安装完成后加入systemd服务方法可以参考这篇文章：[利用systemd管理GreatSQL](./8-greatsql-with-systemd.md)。

## 连接登入GreatSQL

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
Server version: 8.0.32-26 GreatSQL, Release 26, Revision 444164cc78e
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
...
greatsql> \s
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

首次登入立刻提醒该密码已过期，需要修改，执行类似下面的命令修改即可：

```sql
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@2022';  #<--修改密码
Query OK, 0 rows affected (0.02 sec)

greatsql> \s
...
Server version:         8.0.32-26
...
```

GreatSQL数据库安装并初始化完毕。

## 安装GreatSQL Shell

下载GreatSQL Shell二进制包*greatsql-shell-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz*。

接下来安装GreatSQL Shell，以及进行MGR初始化等操作和用RPM包方式安装一样，这里就不赘述了。

参考文档[RPM安装并构建MGR集群](./2-install-with-rpm.md#安装mysql-shell)，从“8. 安装MySQL Shell”这节开始及往后内容即可。

GreatSQL Shell就可以正常使用，并继续构建MGR集群了。

> 推荐使用 Docker 来运行 GreatSQL Shell，详情参考 [GreatSQL-Shell Docker](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
