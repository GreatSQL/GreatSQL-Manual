# GMSSL (National Cryptography) Support
---

GreatSQL adds support for the national cryptographic SM2 asymmetric encryption algorithm, the SM3 hash algorithm, and the SM4 symmetric encryption algorithm. Encrypted connections can be established and data can be transmitted encrypted using national cryptographic algorithms. To this end, GreatSQL has released a dedicated national cryptography version binary package. Search for the *binary package supporting national cryptography* keyword on the [download page](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5) and download the corresponding binary package.

This section describes how to install the national cryptography version of the GreatSQL database using the binary package. It is assumed that the installation is performed in a CentOS 8.x x86_64 environment and as the root user.

## Downloading the Installation Package

Check the glibc version of the server to select the correct installation package:

```bash
$ ldd --version

...
ldd (GNU libc) 2.28
```
If your glibc version is 2.28 or higher, select the installation package marked with "glibc2.28"; if your glibc version is 2.17, select the installation package marked with "glibc2.17".

[Click here](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5), scroll the page to section "4. Binary packages supporting national cryptography" and download the package supporting national cryptography. Downloading one of the following is sufficient:

- GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64.tar.xz

::: tip Tip
- After clicking the download link, the download address should contain the "GM" directory, for example *https://product.greatdb.com/GreatSQL-8.4.4-5/GM/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64.tar.xz*.

- If your CPU architecture is ARM, use the ARM version of the installation package `GreatSQL-8.4.4-5-Linux-glibc2.28-aarch64.tar.xz`.
:::

Place the downloaded binary package in the installation directory and decompress it:
```bash
cd /usr/local
curl -o GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64.tar.xz https://product.greatdb.com/GreatSQL-8.4.4-5/GM/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64.tar.xz
tar xf GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64.tar.xz
```

At the same time, modify the settings to add GreatSQL to the `PATH` environment variable:
```bash
echo 'export PATH=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

Installing GreatSQL requires other dependency packages to be installed first. The following command can be executed:

```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python perl-JSON perl-Test-Simple
```

If some dependency packages fail to install or cannot be found, remove them and retry. For more details, see: [Installation Preparation](../4-install-guide/1-install-prepare.md).

## Pre-Start Preparation

### Creating or Modifying the /etc/my.cnf Configuration File

If the `/etc/my.cnf` configuration file does not exist, create a new one. Refer to this [my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.4.4-5) for the file content, which can be modified according to the actual situation. Generally, only a few options such as database file partitioning, directories, and memory configuration are involved. Take the following as an example:

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
basedir = /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64
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
loose-rpl_read_binlog_speed_limit=0

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
innodb_buffer_pool_size = 2G #If it is a dedicated database server, it can be set to 50%-70% of physical memory, depending on the actual situation
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

::: tip Tip
Compared with the regular version, the version supporting national cryptography adds the `enable_gm_ssl=1` parameter in the configuration file.
:::

Generally, modifying a few options such as *basedir/datadir/innodb_buffer_pool_size* is sufficient. Save and exit after modification.

### Creating the mysql User
```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
```

### Creating datadir

Create the main database directory and modify the permission mode and owner:

```bash
mkdir -p /data/GreatSQL
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
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
#For GreatSQL 5.7, change this to simple mode, otherwise the service may fail to start
#For GreatSQL 8.0, notify can be used
#If daemonize=1 is added to my.cnf at startup (starting GreatSQL in daemon mode), the forking mode can be used
#Type=simple
Type=notify
TimeoutSec=10
PermissionsStartOnly=true
ExecStartPre=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```

Make sure the directories and file names specified by the `ExecStartPre` and `ExecStart` parameters in the file are correct.

**Hint**: If the installation is not in the default `/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64` directory (the specific directory also varies by version), it may affect the automatic initialization of GreatSQL. In this case, you can first decompress the GreatSQL binary package into the `/usr/local` directory, and then create a symbolic link as needed, for example:

```bash
tar xf GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64.tar.xz -C /usr/local
ln -s /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64 /usr/local/GreatSQL
```
This way, neither the automatic initialization of GreatSQL is affected, nor the custom needs are compromised.

You can also edit the `mysqld_pre_systemd` script in the binary package to modify the places involving the GreatSQL installation path, for example:

```bash
# grep -n GreatSQL mysqld_pre_systemd
33:    ret=$(/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/my_print_defaults  ${instance:+--defaults-group-suffix=@$instance} $section | \
178:    /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld ${instance:+--defaults-group-suffix=@$instance} --initialize \
183:    if [ -x /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup -a ! -e "${datadir}/server-key.pem" ] ; then
184:        /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysql_ssl_rsa_setup --datadir="$datadir" --uid=mysql >/dev/null 2>&1
```

Modify the above places by yourself, then execute the command to reload systemd and add the `greatsql` service. If there are no problems, no errors will be reported:

```bash
systemctl daemon-reload
```

GreatSQL is now installed successfully and added to the system services. You can use `systemctl` to manage the GreatSQL service later.

Edit the `/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd` file and change the `/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/` paths in the file to the actual GreatSQL installation directory.

### Adding Dynamic Dependency Libraries

Edit the `/etc/ld.so.conf` file and add the following lines:

```ini
/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/
/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/private
/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/mysqlrouter/
/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/mysqlrouter/private
```

Save and exit, then execute the following command to confirm it takes effect:

```bash
ldconfig && ldconfig -p | grep libprotobuf.so

...
	libprotobuf.so.24.4.0 (libc6,x86-64) => /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.24.4.0
```

This step loads the dynamic dependency library files bundled with GreatSQL, which may be needed when running mysql/mysqld and other binary files, to avoid errors.

## Starting GreatSQL

Execute the following command to start the GreatSQL service
```bash
systemctl start greatsql
```

If the GreatSQL database is started for the first time in a brand-new environment, it may fail because the initialization logic in `mysqld_pre_systemd` depends on the `/var/lib/mysql-files` directory to store a temporary file. If the first startup fails, an error similar to the following may be reported:

::: details View the result
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since ...
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 1258165 ExecStart=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS (code=exited, status=1/FAILURE)
  Process: 1257969 ExecStartPre=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 1258165 (code=exited, status=1/FAILURE)
   Status: "Server shutdown complete"

systemd[1]: Starting GreatSQL Server...
mysqld_pre_systemd[1257969]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or directory
mysqld_pre_systemd[1257969]: chmod: cannot access '': No such file or directory
mysqld_pre_systemd[1257969]: /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 43: : No such file or directory
mysqld_pre_systemd[1257969]: /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd: line 44: $initfile: ambiguous redirect
systemd[1]: greatsql.service: Main process exited, code=exited, status=1/FAILURE
systemd[1]: greatsql.service: Failed with result 'exit-code'.
systemd[1]: Failed to start GreatSQL Server.
```
:::

Simply create the `/var/lib/mysql-files` directory manually and start the GreatSQL service again:
```bash
mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
systemctl start greatsql
```

Check whether the service has started and the process status:

::: details View the result
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/etc/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: activating (start) since Tue 2026-01-27 15:41:42 CST; 20s ago
     Docs: https://greatsql.cn/docs
  Process: 7207 ExecStartPre=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
Cntrl PID: 7240 (mysqld)
    Tasks: 37 (limit: 201684)
   Memory: 1.4G
   CGroup: /system.slice/greatsql.service
           └─7240 /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld

Jan 27 15:41:42 db150 systemd[1]: Starting GreatSQL Server...

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld

...
mysql       7473       1  5 15:43 ?        00:00:00 /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=7473,fd=18))
LISTEN 0      151                *:3306             *:*    users:(("mysqld",pid=7473,fd=25))

# View the database files
$ ls /data/GreatSQL

...
 auto.cnf        binlog.index          client-sign-cert.pem  '#ib_16384_0.dblwr'  '#innodb_redo'   mysql.sock              public_key.pem         sys
 binlog.000001   ca-key.pem            client-sign-key.pem   '#ib_16384_1.dblwr'  '#innodb_temp'   mysql.sock.lock         server-enc-cert.pem    undo_001
 binlog.000002   ca.pem                db150-slow.log         ib_buffer_pool       mysql           mysql_upgrade_history   server-enc-key.pem     undo_002
 binlog.000003   client-enc-cert.pem   error.log              ibdata1              mysqld.pid      performance_schema      server-sign-cert.pem
 binlog.000004   client-enc-key.pem   '#file_purge'           ibtmp1               mysql.ibd       private_key.pem         server-sign-key.pem
```
:::

As you can see, the GreatSQL service has started normally.

## Connecting and Logging in to GreatSQL

During the GreatSQL initialization above, a random password is generated for the *root@localhost* user and recorded in the `error.log` file, for example:

```bash
$ grep -i root /data/GreatSQL/error.log

...
A temporary password is generated for root@localhost: ji!pjndiw5sJ
```

Copy this password, which will be needed for the first login to GreatSQL.

For some GreatSQL binary package installations, the initialized root password may be empty. In this case, you can log in directly and change it to a secure password.

```sql
$ mysql -uroot  -p"ji!pjndiw5sJ"   #<--Enter the temporary password just copied here

...
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
...

greatsql> status;
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

On the first login, you are immediately reminded that the password has expired and needs to be changed. Execute the SQL command `ALTER USER USER() IDENTIFIED BY` to change it:

```sql
greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@2026';  #<--Change the password
Query OK, 0 rows affected (0.02 sec)

greatsql> status;
...
Server version:         8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
...
```

The GreatSQL database installation and initialization is now complete.

## Enabling National Cryptography Encryption for Communications

Log in using the **mysql** client of the national cryptography version of GreatSQL, adding the `--gm_ssl` parameter, to confirm that national cryptography encryption for communication connections is effective:

```sql
-- Make sure to log in using the TCP protocol to confirm that the national cryptographic algorithms take effect
-- For example: mysql -hxx -uxx -pxx --protocol=tcp -P3306 --gm_ssl
greatsql> status;
...
SSL:                    Cipher in use is ECC-SM2-SM4-GCM-SM3
```
Seeing the keywords **SM2/SM3/SM4** indicates that the communication connection is encrypted using national cryptographic algorithms.

If you log in with other MySQL clients that do not support the national cryptography version, an error message similar to the following may be displayed:

```bash
mysql: [ERROR] unknown option '--gm_ssl'
```

When connecting to GreatSQL via TCP without the `--gm_ssl` parameter, an error message similar to the following may be displayed:

```bash
ERROR 2026 (HY000): SSL connection error: error:1408F10B:SSL routines:ssl3_get_record:wrong version number
```

::: tip Tip
- Connecting to the GreatSQL national cryptography server via JDBC is currently not supported.

- For the C API, use `mysql_options(mysql, MYSQL_OPT_GM_SSL, &is_gm)` before the `mysql_real_connect()` function to enable national cryptography authentication.
:::

## Encrypting Tablespaces with National Cryptographic Algorithms

GreatSQL supports transparent encryption of static data for user tablespaces, the system tablespace, Redo Log, and Undo Log.

The tablespace encryption keyring architecture consists of two layers of encryption: the master key and the tablespace key.

The master key is used to encrypt the tablespace key, and the encrypted result is stored in the header of the tablespace.

The tablespace key is used to encrypt data. When a user wants to access an encrypted table, InnoDB first uses the master key to decrypt the encrypted information previously stored in the header to obtain the tablespace key, then uses the tablespace key to decrypt the data.

The tablespace key never changes, while the master key can be updated through rotation commands.

The master key uses the keyring_file plugin, and the key file is stored directly on disk.

To generate a master keyring file that supports national cryptography, the **component_keyring_file** component is required.

1. In the directory where the **mysqld** main program is located under the GreatSQL basedir directory, create the configuration file `mysqld.my` and add the following content:

```ini
{
"components": "file://component_keyring_file"
}
```

2. In the directory where the **component_keyring_file.so** component library file is located under the GreatSQL basedir directory, create the configuration file `component_keyring_file.cnf` and add the following content:

```ini
{
"path": "/data/keyring/master_keyring",
"read_only": false
}
```

**Hint**:

1. The file `mysqld.my` must be in the same directory as the **mysqld** binary file, for example: */usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld.my*.
1. The file `component_keyring_file.cnf` must be in the same directory as the component library file **component_keyring_file.so**, for example: */usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf*.
1. The parameter `path` points to the path of the master keyring file.
1. The file **master_keyring** does not need to be created in advance; GreatSQL creates it automatically at startup.

3. Create a new directory dedicated to storing the GreatSQL master keyring file

This directory must not be placed under the datadir directory. Modify the corresponding owner and permission mode:

```bash
# datadir is /data/GreatSQL, keep them separate
mkdir /data/keyring

chown -R mysql:mysql /data/keyring /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld.my

chmod 750 /data/keyring
chmod 0640 /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld.my
```

Confirm the file owner and permission mode again

```bash
stat /data/keyring/ /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/lib/plugin/component_keyring_file.cnf /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld.my | grep Uid

Access: (0750/drwxr-xr-x)  Uid: ( 3306/   mysql)   Gid: ( 3306/   mysql)
Access: (0640/-rw-r--r--)  Uid: ( 3306/   mysql)   Gid: ( 3306/   mysql)
Access: (0640/-rw-r--r--)  Uid: ( 3306/   mysql)   Gid: ( 3306/   mysql)
```

Restart GreatSQL

```bash
systemctl restart greatsql
```

Execute the following query to confirm that the *component_keyring_file* component is enabled
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

The master key at initialization is still an empty file and needs to be regenerated:
```sql
greatsql> system ls -la /data/keyring/master_keyring
-rw-r----- 1 mysql mysql 0 Jan 27 16:34 /data/keyring/master_keyring

# Update the master key
greatsql> ALTER INSTANCE ROTATE INNODB MASTER KEY;

greatsql> system ls -la /data/keyring/master_keyring
-rw-r----- 1 mysql mysql 390 Jan 27 16:55 /data/keyring/master_keyring
```

Next, encryption can be set for multiple database objects (databases, tables, tablespaces).
```sql
-- Set the default encryption for tables newly created in this database
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

-- Disable encryption
greatsql> ALTER TABLE t1 ENCRYPTION='N';
```
**Note:** The keyring file needs to be backed up properly. If it is accidentally deleted, modified or moved, the encrypted database objects cannot be read correctly. In this case, the backup file can be restored.

## Viewing Metadata
Encryption-related metadata information can be viewed in `performance_schema` and `information_schema`:

```sql
-- View the current master key
greatsql> SELECT * FROM performance_schema.keyring_keys;
+--------------------------------------------------+-----------+----------------+
| KEY_ID                                           | KEY_OWNER | BACKEND_KEY_ID |
+--------------------------------------------------+-----------+----------------+
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-2 |           |                |
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-4 |           |                |
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-3 |           |                |
| INNODBKey-6731fd8f-fb47-11f0-88b1-0242ac120004-1 |           |                |
+--------------------------------------------------+-----------+----------------+

-- View which tablespace files are encrypted
greatsql> SELECT SPACE, NAME, SPACE_TYPE, ENCRYPTION FROM information_schema.INNODB_TABLESPACES WHERE ENCRYPTION='Y';
+-------+---------+------------+------------+
| SPACE | NAME    | SPACE_TYPE | ENCRYPTION |
+-------+---------+------------+------------+
|     6 | test/t1 | Single     | Y          |
+-------+---------+------------+------------+

-- View which tables are encrypted
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, CREATE_OPTIONS FROM information_schema.TABLES WHERE CREATE_OPTIONS LIKE '%ENCRYPTION%'; -- table
+--------------+------------+----------------+
| TABLE_SCHEMA | TABLE_NAME | CREATE_OPTIONS |
+--------------+------------+----------------+
| test         | t1         | ENCRYPTION='Y' |
+--------------+------------+----------------+

-- View which databases are encrypted
SELECT SCHEMA_NAME, DEFAULT_ENCRYPTION FROM information_schema.SCHEMATA WHERE DEFAULT_ENCRYPTION='YES';
+-------------+--------------------+
| SCHEMA_NAME | DEFAULT_ENCRYPTION |
+-------------+--------------------+
| test        | YES                |
+-------------+--------------------+
```

For more details, see the MySQL documentation:
- [https://dev.mysql.com/doc/refman/8.0/en/keyring.html](https://dev.mysql.com/doc/refman/8.0/en/keyring.html)
- [https://dev.mysql.com/doc/refman/8.0/en/innodb-data-encryption.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-data-encryption.html)


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
