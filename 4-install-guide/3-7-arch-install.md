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

> 更多介绍前往Arch Linux社区网站：https://www.archlinuxcn.org/

## 安装Arch Linux

安装Arch Linux的过程这里就不再详细介绍了，可以前往Arch Linux的官方文档查看详细的安装流程：https://arch-linux.osrc.com/rookie/pre-install.html

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

$ lcc -version
ldd (GNU libc) 2.38
```

## 安装GreatSQL

### 选择GreatSQL安装包

因为Arch Linux系统自带的ldd (GNU libc)版本是2.38，所以这里下载的GreatSQL二进制包选择

- GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz

Arch Linux系统缺少wget需要先安装wget

```bash
$ pacman -S wget
```

将二进制安装包下载在`/usr/local`目录下,并解压

```bash
$ cd /usr/local
$ wget https://product.greatdb.com/GreatSQL-8.0.32-26/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz
# 解压
$ tar xf GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64.tar.xz
```

### 运行环境配置

因为Arch Linux系统主打极简风，所以selinux和防火墙都没有，都不需要手动关闭了

### 安装依赖包

Arch Linux用了一个工具 pacman 作为下载软件包

进入到`GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin`目录，输入命令`ldd mysqld mysql | grep "not found"`若不显示其它信息则已经不缺必要软件包

这里缺失了两个依赖包

```bash
$ ldd mysqld mysql | grep "not found"
libaio.so.1 => not found
libnuma.so.1 => not found
```

使用pacman安装libaio和numactl

```bash
$ pacman -S libaio
$ pacman -S numactl
```

最后检查下若不显示其它信息则已经不缺必要软件包
```bash
$ ldd mysqld mysql | grep "not found"
```

### 创建配置文件及新建用户与目录

可根据实际情况修改，一般主要涉及数据库文件分区、目录，内存配置等少数几个选项。以下面这份为例

> 注意，若内存不够充足请调低 `innodb_buffer_pool_size`

```sql
$ vi /etc/my.cnf
[client]
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

接下来新建mysql用户和新建数据库主目录，并修改权限模式及属主

```sql
$ /sbin/groupadd mysql
$ /sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
$ mkdir -p /data/GreatSQL
$ chown -R mysql:mysql /data/GreatSQL
$ chmod -R 700 /data/GreatSQL
```

如果是在一个全新环境中首次启动GreatSQL数据库，可能会失败，因为在 `mysqld_pre_systemd` 的初始化处理逻辑中，需要依赖 `/var/lib/mysql-files` 目录保存一个临时文件

所以手动创建`/var/lib/mysql-files` 目录

```bash
$ mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
```

### 增加GreatSQL系统服务

```bash
$ vim /lib/systemd/system/greatsql.service
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
#如果是GreatSQL 8.0版本则可以使用notify模式
#Type=simple
Type=notify
TimeoutSec=0
PermissionsStartOnly=true
ExecStartPre=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```

### 启动GreatSQL

把GreatSQL添加进环境变量

```bash
$ echo 'export PATH=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin:$PATH' >> ~/.bash_profile
$ source ~/.bash_profile
```

执行下面的命令启动GreatSQL服务

```sql
$ systemctl start greatsql
$ systemctl status greatsql
● greatsql.service - GreatSQL Server
     Loaded: loaded (/usr/lib/systemd/system/greatsql.service; disabled; preset: disabled)
     Active: active (running) since Fri 2024-07-08 10:30:29 CST; 4s ago
       Docs: man:mysqld(8)
             http://dev.mysql.com/doc/refman/en/using-systemd.html
    Process: 712571 ExecStartPre=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
   Main PID: 712708 (mysqld)
     Status: "Server is operational"
     Memory: 2.5G
        CPU: 4.549s
     CGroup: /system.slice/greatsql.service
             └─712708 /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld

systemd[1]: Starting GreatSQL Server...
(mysqld)[712708]: greatsql.service: Referenced but unset environment variable evaluates to an empty string: MYSQLD_OPTS
systemd[1]: Started GreatSQL Server.
```

在上面进行GreatSQL初始化时，会为 *root@localhost* 用户生成一个随机密码，记录在 `error.log` 日志文件中，例如下面这样：

```bash
$ grep -i root /data/GreatSQL/error.log
... A temporary password is generated for root@localhost: ji!pjndiw5sJ
```

复制该密码，将用于首次登入GreatSQL所需。

```sql
$ mysql -uroot -p
Enter password:

# 进入数据库后可以看到版本
Server version: 8.0.32-26
```

首次登入立刻提醒该密码已过期，需要修改，执行类似下面的命令修改即可：

```sql
greatsql> alter user 'root'@'localhost' identified by 'GreatSQL@2022';
Query OK, 0 rows affected (0.02 sec)
```

GreatSQL数据库安装并初始化完毕

## 安装GreatSQL Shell

为了支持仲裁节点特性，需要安装GreatSQL Shell。打开GreatSQL下载页面找到

- greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz

下载相应的MySQL Shell安装包（目前只提供二进制安装包）并解压

```bash
$ cd /usr/local
$ wget https://product.greatdb.com/GreatSQL-8.0.32-25/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
$ tar xf greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
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
$ pacman -S core/openssl-1.1
$ pacman -S archlinuxcn/python39
```

因为下载的Python版本过高，所以采用软连接的方式

```
$ ln -s /usr/lib/libpython3.9.so.1.0 /usr/lib64/libpython3.8.so.1.0
```

再次检查下还有没有缺失依赖

```bash
$ ldd mysqlsh | grep "not found"
```

没有缺失依赖的话，接下来就可以体验MySQL Shell了

```sql
$ /usr/local/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqlsh
MySQL Shell 8.0.32

Copyright (c) 2016, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
WARNING: Found errors loading plugins, for more details look at the log at: /root/.mysqlsh/mysqlsh.log
 MySQL  Py > 
```

> 推荐使用 Docker 来运行 GreatSQL Shell，详情参考 [GreatSQL-Shell Docker](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
