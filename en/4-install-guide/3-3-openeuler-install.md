# Installing GreatSQL on openEuler

---

## Preparation

### Configuring the yum Source

Before starting the compilation, it is recommended to configure the yum source first, making it convenient to install some tools and necessary dependency packages.

The default yum source after system installation is used here, and the cache is generated.

```bash
yum clean all && yum makecache
```

Before starting the installation, please complete the preparation work according to the document [Installation Preparation](./1-install-prepare.md).

### Disabling SELinux

```bash
setenforce=0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

### Selecting and Downloading the GreatSQL Binary Package

The openEuler system used in this article is as follows:

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

In this environment, the [GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-4) binary package can be selected for installation. If glibc is 2.17, select the installation package marked with "glibc2.17".

Of course, the corresponding minimal package can also be selected. The minimal version strips the binary files, so the file size is smaller, with no essential difference in functionality, but it does not support gdb debug functionality. It can be used with confidence.

::: tip Tip
If your CPU architecture is ARM, use the ARM version installation package `GreatSQL-8.4.4-4-Linux-glibc2.28-aarch64.tar.xz`.
:::

Put the downloaded binary package into the installation directory and decompress it:

```bash
cd /usr/local
tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
```

At the same time, modify the settings to add GreatSQL to the `PATH` environment variable:

```bash
echo 'export PATH=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

Other dependency packages need to be installed before installing GreatSQL. The following command can be executed to complete this:

```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```

If a dependency package installation fails or is not found, delete it and then retry. For more details, refer to: [Installation Preparation](./1-install-prepare.md).

Next, start installing the GreatSQL binary package.

## Installing GreatSQL

### Creating or Modifying the /etc/my.cnf Configuration File

If the `/etc/my.cnf` configuration file does not exist, create a new one. For the file content, refer to this [my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.4.4-4). It can be modified according to the actual situation. Generally, only a few options such as database file partition, directory, and memory configuration are mainly involved. Take the following as an example:

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
loose-rpl_read_binlog_speed_limit=0

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
innodb_buffer_pool_size = 2G #For a dedicated database server, it can be set to 50%-70% of physical memory, depending on the actual situation
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

Generally, only a few options such as *basedir/datadir/innodb_buffer_pool_size* need to be modified. After modification, save and exit.

### Creating the mysql User

```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql -M mysql -s /sbin/nologin
```

### Creating the datadir

Create the main database directory and modify the permission mode and owner:

```bash
mkdir -p /data/GreatSQL 
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
```

### Configuring the GreatSQL systemd Service

It is recommended to use systemd to manage the GreatSQL service. Execute the `vim /etc/systemd/system/greatsql.service` command and add the following content:

```ini
[Unit]
Description=GreatSQL Server
Documentation=man:mysqld(8)
Documentation=https://dev.mysql.com/doc/refman/8.4/en/using-systemd.html
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

Make sure to confirm that the directories and file names specified by the `ExecStartPre` and `ExecStart` parameters in the file are correct.

**Note**: If not installed in the default `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64` directory (the specific directory also changes in different versions), the automatic initialization operation of GreatSQL may be affected. In this case, first decompress the GreatSQL binary package to the `/usr/local` directory, and then make a symbolic link as needed, for example:

```bash
tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz -C /usr/local
ln -s /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64 /usr/local/GreatSQL
```
This does not affect GreatSQL's automatic initialization and can also meet customization needs.

You can also edit the `mysqld_pre_systemd` script in the binary package and modify the places in the script that involve the GreatSQL installation path, for example:

```bash
# grep -n GreatSQL mysqld_pre_systemd
33:    ret=$(/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/my_print_defaults  ${instance:+--defaults-group-suffix=@$instance} $section | \
178:    /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld ${instance:+--defaults-group-suffix=@$instance} --initialize \
183:    if [ -x /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup -a ! -e "${datadir}/server-key.pem" ] ; then
184:        /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup --datadir="$datadir" --uid=mysql >/dev/null 2>&1
```

Modify the above places yourself, then execute the command to reload systemd and add the `greatsql` service. If there is no problem, no error is reported:

```bash
systemctl daemon-reload
```

This completes the installation and adds GreatSQL to the system services. Later, `systemctl` can be used to manage the GreatSQL service.

Edit the `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd` file and change the several occurrences of `/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/` in the file to the actual GreatSQL installation directory.

### Adding Dynamic Dependency Libraries

Edit the `/etc/ld.so.conf` file and add the following lines:

```ini
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/mysqlrouter/
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/mysqlrouter/private
```

Save and exit, execute the following command to confirm it takes effect:

```bash
ldconfig && ldconfig -p | grep libprotobuf.so

...
	libprotobuf.so.24.4.0 (libc6,x86-64) => /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.24.4.0
```

The role of this step is to load the dynamic dependency library files bundled with GreatSQL, so that they may be needed when running binary files such as mysql/mysqld, avoiding errors.

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
           https://dev.mysql.com/doc/refman/8.4/en/using-systemd.html
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
   Active: active (running) since ...
     Docs: man:mysqld(8)
           https://dev.mysql.com/doc/refman/8.4/en/using-systemd.html
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

```sql
$ mysql -uroot  -p"ji!pjndiw5sJ"   # <-- Enter the temporary password just copied here
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
...
greatsql> status;
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

The first login immediately reminds that this password has expired and needs to be modified. Execute the SQL command `ALTER USER USER() IDENTIFIED BY` to modify it:

```sql
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@2022';  # <-- Change the password
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

The GreatSQL database has been installed and initialized.

## Installing GreatSQL Shell

Download the GreatSQL Shell binary package *greatsql-shell-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz*.

Next, installing GreatSQL Shell and performing MGR initialization and other operations are the same as with the RPM package method, so they are not repeated here.

Refer to the document [RPM Installation and Building an MGR Cluster](./2-install-with-rpm.md#installing-greatsql-shell), starting from the "Installing MySQL Shell" section onwards.

GreatSQL Shell can now be used normally, and the MGR cluster can continue to be built.

::: tip Tip
It is recommended to use Docker to run GreatSQL Shell. For details, refer to [GreatSQL-Shell Docker](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell).
:::

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
