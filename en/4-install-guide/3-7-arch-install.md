# Installing GreatSQL on Arch Linux
---
## Understanding Arch Linux

Arch Linux is a lightweight, flexible Linux distribution based on the x86-64 architecture, following the K.I.S.S. principle. It focuses on code correctness, elegance, and minimalism, expecting users to be willing to understand how the system works.

### Simplicity

Arch Linux defines simplicity as: avoiding any unnecessary additions, modifications, and complexity. In simple terms, Arch Linux is an operating system that users can build themselves. From installation to management, Arch Linux leaves everything to the user.

Users can decide for themselves which desktop environment to use and which components and services to install. This fine-grained control gives you a streamlined operating system, allowing users to freely choose the components they need to build their own system.

### Rolling Release (Modern)

A rolling release refers to the concept of frequently sending updates to software in software development. Compared with rolling releases, there is a version-number development model with standard versions and point versions, which requires reinstallation to replace the previous release. Arch Linux has no version concept; it always stays at the latest state. To put it in layman's terms, comparing a distribution to a car, an Ubuntu update is like replacing the car with a new one, while Arch Linux is like replacing the old parts in the car with new ones.

Arch Linux is a rolling release distribution, which means:

1. New kernel and application versions are pushed to users immediately once released
2. While most other Linux distributions are still providing old Linux kernel versions, Arch Linux quickly provides users with the latest kernel
3. The same applies to software. If a new version of software in the Arch Linux repositories is released, Arch Linux users usually get the new version before other users
4. In rolling release mode, everything is fresh and cutting-edge. Users do not need to upgrade the operating system from one version to another; as long as they use the `pacman` upgrade command, it always stays at the latest version

### Practicality

Arch Linux focuses on practicality and avoids ideological disputes. Final design decisions are determined by consensus among developers. Developers rely on fact-based technical analysis and discussion, avoid political factors, and are not swayed by popular opinions.

The Arch Linux repositories contain a large number of software packages and compilation scripts. Users can freely choose according to their needs. The repositories provide both open source, free software, **and closed source software** (most closed source software is in the `AUR` repository). **Practicality outweighs ideology**.

### Aggressive Kernel Update Mechanism

Arch Linux immediately deletes the old kernel when updating the kernel (because the kernel is also a package `linux` / `linux-zen`..., updated by `pacman`)

Immediately deleting the old kernel requires Arch Linux to restart to load the new kernel, otherwise strange problems are prone to occur. This is because the so-called "kernel" in Linux contains a large number of dynamically loadable modules. If a module has not been loaded after a certain boot, and then the system kernel is updated and the old kernel is deleted, these modules can never be loaded again—because they were deleted along with the old kernel. Unless the user restarts the system to fully switch to the new kernel to use the new version of dynamically loadable modules.

### Package Management System

Unlike the `apt / dpkg` package management of the Debian series and the `dnf (yum) / rpm` package management of the Red Hat series, Arch Linux uses only one tool, pacman, to handle both fetching and installation functions. This lowers the barrier for making packages for Arch Linux, which is the main reason AUR can cover almost the entire Linux software ecosystem. But it also means pacman does not support virtual packages.

::: tip Tip
For more introduction, visit the Arch Linux community website: [https://www.archlinuxcn.org](https://www.archlinuxcn.org).
:::

## Installing Arch Linux

The process of installing Arch Linux is not described in detail here. You can go to the official documentation of Arch Linux to view the detailed installation process: [https://arch-linux.osrc.com/rookie/pre-install.html](https://arch-linux.osrc.com/rookie/pre-install.html).

Below, a successfully installed Arch Linux environment is shown

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

## Installing GreatSQL

### Selecting the GreatSQL Installation Package

Because the ldd (GNU libc) version bundled with the Arch Linux system is 2.38, the GreatSQL binary package downloaded here is

- GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64.tar.xz

The Arch Linux system lacks wget, so wget needs to be installed first

```bash
pacman -S wget
```

Download the binary installation package to the `/usr/local` directory and decompress it

```bash
cd /usr/local
wget https://product.greatdb.com/GreatSQL-8.0.32-27/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64.tar.xz
tar xf GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64.tar.xz
```

### Runtime Environment Configuration

Because the Arch Linux system emphasizes minimalism, there is no selinux or firewall, so neither needs to be manually disabled

### Installing Dependency Packages

Arch Linux uses one tool, pacman, as the software package downloader

Enter the `GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin` directory and run the command `ldd mysqld mysql | grep "not found"`. If no other information is displayed, the necessary packages are no longer missing

Here two dependency packages are missing

```bash
$ ldd mysqld mysql | grep "not found"
libaio.so.1 => not found
libnuma.so.1 => not found
```

Use pacman to install libaio and numactl

```bash
pacman -S libaio
pacman -S numactl
```

Finally check again. If no other information is displayed, the necessary packages are no longer missing
```bash
ldd mysqld mysql | grep "not found"
```

### Creating or Modifying the /etc/my.cnf Configuration File and Creating the User and Directory

If the `/etc/my.cnf` configuration file does not exist, create a new one. For the file content, refer to this [my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-27). It can be modified according to the actual situation. Generally, only a few options such as database file partition, directory, and memory configuration are mainly involved. Take the following as an example:

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
basedir = /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64
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
innodb_buffer_pool_size = 2G #For a dedicated database server, it can be set to 50%-70% of physical memory, depending on the actual situation
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

Generally, only a few options such as *basedir/datadir/innodb_buffer_pool_size* need to be modified. After modification, save and exit.

Next, create the mysql user and the main database directory, and modify the permission mode and owner

```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
mkdir -p /data/GreatSQL
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
```

If the GreatSQL database is started for the first time in a brand-new environment, it may fail, because in the initialization processing logic of `mysqld_pre_systemd`, it needs to rely on the `/var/lib/mysql-files` directory to save a temporary file

So manually create the `/var/lib/mysql-files` directory

```bash
mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
```

### Adding the GreatSQL System Service

It is recommended to use systemd to manage the GreatSQL service. Execute the `vim /etc/systemd/system/greatsql.service` command and add the following content:

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
#For GreatSQL 5.7, change this to simple mode here, otherwise the service may fail to enable
#For GreatSQL 8.0, notify can be used
#If daemonize=1 is added to my.cnf at startup (starting GreatSQL in daemon mode), the forking mode can be used
#Type=simple
Type=notify
TimeoutSec=10
PermissionsStartOnly=true
ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```

Make sure to confirm that the directories and file names specified by the `ExecStartPre` and `ExecStart` parameters in the file are correct.

**Note**: If GreatSQL is not installed in the default `/usr/local/` directory, edit the `bin/mysqld_pre_systemd` script and modify the places in the script that involve the GreatSQL installation path.

Execute the following command to reload systemd and add the `greatsql` service; if there is no problem, no error will be reported:

```bash
systemctl daemon-reload
```

This completes the installation and adds GreatSQL to the system services; afterwards, `systemctl` can be used to manage the GreatSQL service.

## Starting GreatSQL

Execute the following command to start the GreatSQL service
```bash
systemctl start greatsql
```

If the GreatSQL database is started for the first time in a brand-new environment, it may fail, because in the initialization processing logic of `mysqld_pre_systemd`, it needs to rely on the `/var/lib/mysql-files` directory to save a temporary file. If the first startup fails, there may be error prompts similar to the following:

::: details View the result
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since ...
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 1258165 ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS (code=exited, status=1/FAILURE)
  Process: 1257969 ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 1258165 (code=exited, status=1/FAILURE)
   Status: "Server shutdown complete"

systemd[1]: Starting GreatSQL Server...
mysqld_pre_systemd[1257969]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or directory
mysqld_pre_systemd[1257969]: chmod: cannot access '': No such file or directory
mysqld_pre_systemd[1257969]: /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 43: : No such file or directory
mysqld_pre_systemd[1257969]: /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 44: $initfile: ambiguous redirect
systemd[1]: greatsql.service: Main process exited, code=exited, status=1/FAILURE
systemd[1]: greatsql.service: Failed with result 'exit-code'.
systemd[1]: Failed to start GreatSQL Server.
```
:::

Just manually create the `/var/lib/mysql-files` directory and start the GreatSQL service again:
```bash
mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
systemctl start greatsql
```

Check whether the service has started, as well as the process status:
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: active (running) since Tue 2024-07-12 10:08:06 CST; 6min ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 60129 ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 60231 (mysqld)
   Status: "Server is operational"
    Tasks: 49 (limit: 149064)
   Memory: 5.6G
   CGroup: /system.slice/greatsql.service
           └─60231 /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld

...
mysql      60231       1  2 10:08 ?        00:00:10 /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=60231,fd=38))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=60231,fd=43))

# View the database files
$ ls /data/GreatSQL

...
 auto.cnf        ca-key.pem        error.log           '#ib_archive'    '#innodb_redo'       mysql.ibd         performance_schema   server-key.pem   undo_002
 binlog.000001   ca.pem           '#file_purge'         ib_buffer_pool   innodb_status.258   mysql.pid         private_key.pem      slow.log
 binlog.000002   client-cert.pem  '#ib_16384_0.dblwr'   ibdata1         '#innodb_temp'       mysql.sock        public_key.pem       sys
 binlog.index    client-key.pem   '#ib_16384_1.dblwr'   ibtmp1           mysql               mysql.sock.lock   server-cert.pem      undo_001
```
It can be seen that the GreatSQL service has started normally.

## Connecting and Logging into GreatSQL

During the GreatSQL initialization above, a random password is generated for the *root@localhost* user, recorded in the `error.log` log file, for example as follows:

```bash
$ grep -i root /data/GreatSQL/error.log

...
A temporary password is generated for root@localhost: ji!pjndiw5sJ
```

Copy this password; it will be used for the first login to GreatSQL.

After installing some GreatSQL binary packages, the initialized root password may be empty. In this case, you can log in directly and change it to a secure password.

```bash
$ mysql -uroot  -p"ji!pjndiw5sJ"   # <-- Enter the temporary password just copied here
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
...
greatsql> status;
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

The first login immediately reminds that this password has expired and needs to be modified. Execute the SQL command `ALTER USER USER() IDENTIFIED BY` to modify it:

```sql
greatsql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'GreatSQL@2022';
Query OK, 0 rows affected (0.02 sec)
```

The GreatSQL database has been installed and initialized

## Installing GreatSQL Shell

To support the arbitrator node feature, GreatSQL Shell needs to be installed. Open the [GreatSQL download page](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27) and find

- greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz

Download the corresponding MySQL Shell installation package (currently only binary installation packages are provided) and decompress it

```bash
cd /usr/local
wget https://product.greatdb.com/GreatSQL-8.0.32-25/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
tar xf greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
```

Enter the bin directory to check which dependencies are missing

```bash
$ cd /usr/local/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64/bin
$ ldd mysqlsh | grep "not found"
        libssl.so.1.1 => not found
        libcrypto.so.1.1 => not found
        libpython3.8.so.1.0 => not found
```

Install the missing dependencies

```bash
pacman -S core/openssl-1.1
pacman -S archlinuxcn/python39
```

Because the downloaded Python version is too high, use the symbolic link method

```
ln -s /usr/lib/libpython3.9.so.1.0 /usr/lib64/libpython3.8.so.1.0
```

Check again whether there are still missing dependencies

```bash
ldd mysqlsh | grep "not found"
```

If there are no missing dependencies, you can now experience MySQL Shell

```bash
$ /usr/local/greatsql-shell-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqlsh
MySQL Shell 8.0.32

Copyright (c) 2016, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
WARNING: Found errors loading plugins, for more details look at the log at: /root/.mysqlsh/mysqlsh.log
 MySQL  Py > 
```

::: tip Tip
It is recommended to use Docker to run GreatSQL Shell. For details, refer to [GreatSQL-Shell Docker](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell).
:::

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
