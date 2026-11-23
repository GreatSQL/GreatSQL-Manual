# RPM Installation
---

This section introduces how to install the GreatSQL database using the RPM package method. It is assumed that this installation is performed in a CentOS 8.x x86_64 environment and the installation operations are performed as the root user.

Before starting the installation, please complete the preparation work according to the document [Installation Preparation](./1-install-prepare.md).

## MGR Cluster Planning

This time, we plan to install the GreatSQL database on 3 servers and deploy an MGR cluster:

| node | ip | datadir | port |role|
| --- | --- | --- | --- | --- |
| GreatSQL-01 | 172.16.16.10 | /data/GreatSQL/ | 3306 | PRIMARY |
| GreatSQL-02 | 172.16.16.11 | /data/GreatSQL/ | 3306 | SECONDARY |
| GreatSQL-03 | 172.16.16.12 | /data/GreatSQL/ | 3306 | ARBITRATOR |

The following installation and configuration work is performed the same way on all three nodes.

::: tip Tip
If you only want to deploy the standalone running mode, you only need to install on one server and skip the MGR-related configuration. For the method, refer to: [Quick Start: RPM Installation](../3-quick-start/3-1-quick-start-with-rpm.md).
:::

## Downloading the Installation Package

Check the machine's glibc version to select the correct installation package:
```bash
$ ldd --version

...
ldd (GNU libc) 2.28
```
If your glibc version is 2.28 or higher, select the rpm package marked with "el8"; if your glibc version is 2.17, select the rpm package marked with "el7".

[Click here](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5) to download the latest installation package. Download the following ones:

- greatsql-client-8.4.4-5.1.el8.x86_64.rpm
- greatsql-devel-8.4.4-5.1.el8.x86_64.rpm
- greatsql-icu-data-files-8.4.4-5.1.el8.x86_64.rpm
- greatsql-shared-8.4.4-5.1.el8.x86_64.rpm
- greatsql-server-8.4.4-5.1.el8.x86_64.rpm

## Installing the GreatSQL RPM Package

Execute the following command to install the RPM package. If everything goes smoothly, the corresponding process is as follows:
```bash
$ rpm -ivh greatsql*rpm

...
Verifying...                          ################################# [100%]
Preparing...                          ################################# [100%]
Updating / installing...
   1:greatsql-shared-8.4.4-5.1.el8  ################################# [ 20%]
   2:greatsql-client-8.4.4-5.1.el8  ################################# [ 40%]
   3:greatsql-icu-data-files-8.4.4-5################################# [ 60%]
   4:greatsql-server-8.4.4-5.1.el8  ################################# [ 80%]
   5:greatsql-devel-8.4.4-5.1.el8   ################################# [100%]
```
The installation is successful.

**Note**:
1. Other dependency packages need to be installed before installing the GreatSQL RPM package. The following command can be executed to complete this:

```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs \
  net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper \
  perl-Digest-MD5 python perl-JSON perl-Test-Simple libatomic
```

If a dependency package installation fails or is not found, delete it and then retry. For more details, refer to: [Installation Preparation](./1-install-prepare.md).

If some other dependency packages still cannot be installed through yum, add `--nodeps --force` to force ignoring them, for example:
```bash
$ rpm -ivh greatsql*rpm

...
error: Failed dependencies:
        perl(Lmo) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Lmo::Meta) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Lmo::Object) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Lmo::Types) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Lmo::Utils) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Percona::Toolkit) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Quoter) is needed by greatsql-server-8.4.4-5.1.el8.x86_64
        perl(Transformers) is needed by greatsql-server-8.4.4-5.1.el8.x86_64

#The above dependency packages can be ignored first; they do not affect normal GreatSQL use

$ rpm -ivh --nodeps --force greatsql*rpm

...
Preparing...                          ################################# [100%]
Updating / installing...
   1:greatsql-shared-8.4.4-5.1.el8  ################################# [ 20%]
   2:greatsql-client-8.4.4-5.1.el8  ################################# [ 40%]
   3:greatsql-icu-data-files-8.4.4-5################################# [ 60%]
   4:greatsql-server-8.4.4-5.1.el8  ################################# [ 80%]
   5:greatsql-devel-8.4.4-5.1.el8   ################################# [100%]
```

2. When officially installing the GreatSQL RPM package, other software packages such as Perl may also be needed. For a quick demonstration here, the `--nodeps` parameter is added to ignore the corresponding dependency checks. After installation, if it cannot start due to dependencies, install the corresponding software dependency packages.

## Preparation Before Startup

### Creating or Modifying the /etc/my.cnf Configuration File

If the `/etc/my.cnf` configuration file does not exist, create a new one. For the file content, refer to this [my.cnf template](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.4.4-5). It can be modified according to the actual situation. Generally, only a few options such as database file partition, directory, and memory configuration are mainly involved. Take the following as an example:
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
#In source-replica replication or MGR clusters, remember that server_id must be different
#In addition, when the instance starts, auto.cnf is generated, and the server_uuid value inside must also be different
#The server_uuid value can also be manually specified, as long as it conforms to the uuid format standard
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

### Creating the datadir

Create the main database directory and modify the permission mode and owner:

```bash
mkdir -p /data/GreatSQL
chown -R mysql:mysql /data/GreatSQL
chmod -R 700 /data/GreatSQL
```

## Starting GreatSQL

Before starting the GreatSQL service, first create or modify the systemd file `vim /lib/systemd/system/mysqld.service`, and add the following lines in the *[Service]* section to increase some limit upper limits, avoiding warnings about insufficient file or thread counts.

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

Make sure to confirm that the directories and file names specified by the `ExecStartPre` and `ExecStart` parameters in the file are correct.

::: tip Tip

When installing GreatSQL with the RPM method, the systemd service management file `mysqld.service` script file is located at `/lib/systemd/system/mysqld.service` by default. Please find this file first and confirm that the GreatSQL executable file paths involved are correct. There are mainly two places:

```
ExecStartPre=/usr/bin/mysqld_pre_systemd
ExecStart=/usr/sbin/mysqld $MYSQLD_OPTS
```
:::

Save and exit, then execute the command to reload systemd. If there is no problem, no error is reported:
```bash
systemctl daemon-reload
```

Execute the following command to start the GreatSQL service
```bash
systemctl start mysqld
```

Check whether the service has started, as well as the process status:
```bash
$ systemctl status mysqld

...
● mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
   Active: active (running) since ...
     Docs: man:mysqld(8)
           https://dev.mysql.com/doc/refman/8.4/en/using-systemd.html
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

# View the database files
$ ls /data/GreatSQL

...
 auto.cnf        ca-key.pem        error.log           '#ib_archive'    '#innodb_redo'       mysql.ibd         performance_schema   server-key.pem   undo_002
 binlog.000001   ca.pem           '#file_purge'         ib_buffer_pool   innodb_status.258   mysql.pid         private_key.pem      slow.log
 binlog.000002   client-cert.pem  '#ib_16384_0.dblwr'   ibdata1         '#innodb_temp'       mysql.sock        public_key.pem       sys
 binlog.index    client-key.pem   '#ib_16384_1.dblwr'   ibtmp1           mysql               mysql.sock.lock   server-cert.pem      undo_001
```
It can be seen that the GreatSQL service has started normally.

Also confirm that the dynamic library `jemalloc` was loaded successfully:
```bash
$ lsof -p 43653 | grep -i jema

...
mysqld  52003 mysql  mem       REG              253,0     608096   68994440 /usr/lib64/libjemalloc.so.2
```

::: tip Tip

If GreatSQL is installed with the RPM method in a Docker environment, or other special installation methods result in being unable to start GreatSQL directly with the systemd method after installation, and thus the `mysqld_pre_systemd` script cannot be called in systemd to complete initialization and startup, manual initialization is needed at this time, i.e., manually execute the `/usr/bin/mysqld_pre_systemd` script (the default path after RPM installation) to complete initialization:

```bash
$ chmod +x /usr/bin/mysqld_pre_systemd && /usr/bin/mysqld_pre_systemd
```

If normal, GreatSQL initialization is completed and the GreatSQL database service process starts.

:::

## Connecting and Logging into GreatSQL

After installing GreatSQL with the RPM method, a random password is generated for the administrator root. Obtain it by searching the log file:
```bash
$ grep -i root /data/GreatSQL/error.log

...
[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: ahaA(ACmw8wy
```
It can be seen that the password of the root account is: "ahaA(ACmw8wy" (without the double quotes). Copy it to the clipboard.

After logging into GreatSQL for the first time, the root password must be changed immediately; otherwise, no other operations can be executed. And the new password must comply with certain security rules:
```bash
$ mysql -uroot -p
Enter password:     # <-- Paste the random password copied above here
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> status;   # <-- Want to execute a command, prompted to change the password first
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.

greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@202X';  # <-- Change the password
Query OK, 0 rows affected (0.02 sec)

greatsql> status;   # <-- Now other commands can be executed normally
--------------
mysql  Ver 8.4.4-5 for Linux on x86_64 (GreatSQL, Release 5, Revision 39b389cdf3b)

Connection id:          8
Current database:
Current user:           root@localhost
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
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

greatsql> SHOW DATABASES;  # <-- View the database list
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

## Stopping/Restarting GreatSQL

Execute the following command to stop the GreatSQL database.
```bash
systemctl stop mysqld
```

Execute the following command to restart the GreatSQL database.
```bash
systemctl restart mysqld
```

The GreatSQL database has been installed and initialized.

## Installing GreatSQL Shell

To support the arbitrator node feature, GreatSQL Shell needs to be installed. Open the [GreatSQL download page](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5), find **GreatSQL MySQL Shell**, and download the corresponding MySQL Shell installation package (currently only binary installation packages are provided).

P.S., if you do not want to use the arbitrator node feature for now, you can continue to use the official MySQL Shell installation package of the same version, which can be installed directly with the yum method. This is skipped here.

In the scenario of this document, select the following binary package:

- greatsql-shell-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz

Place the binary package in the `/usr/local` directory and decompress it:
```bash
cd /usr/local/
tar xf greatsql-shell-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
```

Modify the profile file in the home directory `vim ~/.bash_profile` and add the PATH:
```ini
PATH=$PATH:$HOME/bin:/usr/local/greatsql-shell-8.4.4-4-Linux-glibc2.28-x86_64/bin
export PATH
```

Load it to take effect
```bash
source ~/.bash_profile
```

In this way, `mysqlsh` can be executed directly without adding the full path every time.

Running GreatSQL Shell 8.4.4 requires installing the Python 3.8 dependency

```bash
dnf install -y libssh python38 python38-libs python38-pyyaml
pip3.8 install --user certifi pyclamd
```

Next, mysqlsh can be used directly
```bash
$ mysqlsh
MySQL Shell 8.4.4
...
Type '\help' or '\?' for help; '\quit' to exit.
 MySQL  JS >
```

GreatSQL Shell can now be used normally, and the MGR cluster can continue to be built.

## Preparing to Build the MGR Cluster

Here, it is recommended to use MySQL Shell to build the MGR cluster, which is much more convenient and faster than manual construction. If you want to experience manual construction, refer to this document: [3. Installing and Deploying an MGR Cluster | MGR in Depth](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr/deep-dive-mgr-03.md).

Using MySQL Shell to build an MGR cluster is relatively simple, mainly with a few steps:

1. Check whether the instance meets the conditions.
2. Create and initialize a cluster.
3. Add instances one by one.

Next, execute step by step.

### MGR Node Pre-check

Connect to the first node with the administrator account root:
```js
#Log in locally through the socket
$ mysqlsh -S/data/GreatSQL/mysql.sock -u root
Please provide the password for 'root@.%2Fmysql.sock': ********  <-- Enter the root password
Save password for 'root@.%2Fmysql.sock'? [Y]es/[N]o/Ne[v]er (default No): yes  <-- Prompt whether to store the password (depends on each company's security rules; for convenience, storing the password was chosen here)
MySQL Shell 8.4.4
...
Server version: 8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
No default schema selected; type \use <schema> to set one.
WARNING: Found errors loading plugins, for more details look at the log at: /root/.mysqlsh/mysqlsh.log
 MySQL  localhost  JS >
```

Next, execute the `dba.configureInstance()` command to start checking whether the current instance is ready and can serve as a node of the MGR cluster:
```js
# Start configuring the MGR node
MySQL  172.16.16.10:3306 ssl  JS > dba.configureInstance();
Configuring local MySQL instance listening at port 3306 for use in an InnoDB cluster...

This instance reports its own address as GreatSQL-01:3306
Clients and other cluster members will communicate with it through this address by default. If this is not correct, the report_host MySQL system variable should be changed.

#Prompt: the root account cannot run the MGR service, a new dedicated account needs to be created
ERROR: User 'root' can only connect from 'localhost'. New account(s) with proper source address specification to allow remote connection from all instances must be created to manage the cluster.

1) Create remotely usable account for 'root' with same grants and password
2) Create a new admin account for InnoDB cluster with minimal required grants
3) Ignore and continue
4) Cancel

Please select an option [1]: 2  # <-- Select creating an account with minimal privileges
Please provide an account name (e.g: icroot@%) to have it created with the necessary
privileges or leave empty and press Enter to cancel.
Account Name: GreatSQL  <-- Enter the account name
Password for new account: *******  <-- Enter the password
Confirm password: *******  <-- Confirm the password again

#Node initialization is complete
The instance 'GreatSQL-01:3306' is valid to be used in an InnoDB cluster.

#MGR management account creation is complete
Cluster admin user 'GreatSQL'@'%' created.
The instance 'GreatSQL-01:3306' is already ready to be used in an InnoDB cluster.
```
**Up to here, all the above steps must also be executed the same way on the other two nodes GreatSQL-02 and GreatSQL-03.**

### Creating and Initializing a Cluster

Before formally initializing the MGR cluster, it is reminded again to complete the above initialization work on the other nodes first.

After the other two nodes are also initialized, use the mysqlsh client, specify the newly created MGR management account **GreatSQL** to log into the PRIMARY node, and prepare to create the MGR cluster:
```js
$ mysqlsh --uri GreatSQL@172.16.16.10:3306
Please provide the password for 'GreatSQL@172.16.16.10:3306': *************
Save password for 'GreatSQL@172.16.16.10:3306'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.4.4
...
Server version: 8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
No default schema selected; type \use <schema> to set one.

#Select the GreatSQL-01 node as the PRIMARY and start creating the MGR cluster
#Name the cluster GreatSQLMGR, which will be useful later when mysqlrouter reads the metadata
MySQL  172.16.16.10:3306 ssl  JS > c=dba.createCluster('GreatSQLMGR');
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
The cluster has been created and initialized. Next, continue adding other nodes.

### Adding Instances One by One

You can directly add other nodes on the GreatSQL-01 (PRIMARY) node, or use the mysqlsh client to log into other nodes and execute the add-node operation. Here, the former is used:
```js
#At this time, the mysqlsh client remains connected to the GreatSQL-01 node
#The GreatSQL-02 node can be added directly
MySQL  172.16.16.10:3306 ssl  JS > c.addInstance('GreatSQL@172.16.16.11:3306');  <-- Add the GreatSQL-02 node
NOTE: The target instance 'GreatSQL-02:3306' has not been pre-provisioned (GTID set is empty). The Shell is unable to decide whether incremental state recovery can correctly provision it.
The safest and most convenient way to provision a new instance is through automatic clone provisioning, which will completely overwrite the state of 'GreatSQL-02:3306' with a physical snapshot from an existing cluster member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

The incremental state recovery may be safely used if you are sure all updates ever executed in the cluster were done with GTIDs enabled, there are no purged transactions and the new instance contains the same GTID set as the cluster or a subset of it. To use this method by default, set the 'recoveryMethod' option to 'incremental'.

#Select the recovery mode: clone/incremental recovery/abort, clone is selected by default
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

#Prompt that the GreatSQL-02 node instance needs to be restarted during this process
#If it cannot restart automatically, it needs to be restarted manually
NOTE: A server restart is expected to happen as part of the clone process. If the
server does not support the RESTART command or does not come back after a
while, you may need to manually start it back.

* Waiting for clone to finish...
#Clone data from the GreatSQL-01 node
NOTE: GreatSQL-02:3306 is being cloned from GreatSQL-01:3306
** Stage DROP DATA: Completed
** Clone Transfer
    FILE COPY  ############################################################  100%  Completed
    PAGE COPY  ############################################################  100%  Completed
    REDO COPY  ############################################################  100%  Completed
    NOTE: GreatSQL-02:3306 is shutting down...

* Waiting for server restart... \   <-- Restarting
* Waiting for server restart... ready   <-- Restart complete. If it was not added to systemd, it needs to be started manually
* GreatSQL-02:3306 has restarted, waiting for clone to finish...
** Stage RESTART: Completed
* Clone process has finished: 59.62 MB transferred in about 1 second (~59.62 MB/s)

State recovery already finished for 'GreatSQL-02:3306'

#The new node GreatSQL-02:3306 has joined the cluster
The instance 'GreatSQL-02:3306' was successfully added to the cluster.
```

This adds the GreatSQL-02 node to the MGR cluster. At this time, the cluster status can be viewed first.

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
                "version": "8.4.4"
            },
            "172.16.16.11:3306": {
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.4.4"
            }
        },
        "topologyMode": "Single-Primary"
    },
    "groupInformationSourceMember": "172.16.16.10:3306"
}
```
It can be seen that a two-node MGR cluster has been built. The Primary node is *172.16.16.10:3306*. Next, another node needs to be added: the **arbitrator node**.

If you do not want to experience the arbitrator node feature, you can follow the above operation to add the GreatSQL-03 node as a Secondary node normally. The MGR cluster construction work can end here.

### Adding the Arbitrator Node

Edit the `/etc/my.cnf` configuration file on the GreatSQL-03 node and add/modify the following line:
```ini
loose-group_replication_arbitrator=ON
```
Its role is to specify this node as the **arbitrator node**. Save and exit, and restart the GreatSQL database on this node.

Then follow the third step operation, call `dba.addInstance()` to add the new node, and the arbitrator node can be directly added to the MGR cluster. View the cluster status again:

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
                "version": "8.4.4"
            },
            "172.16.16.11:3306": {
                "address": "172.16.16.11:3306",
                "memberRole": "SECONDARY",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.4.4"
            },
            "172.16.16.12:3306": {
                "address": "172.16.16.12:3306",
                "memberRole": "ARBITRATOR",
                "mode": "R/O",
                "readReplicas": {},
                "replicationLag": null,
                "role": "HA",
                "status": "ONLINE",
                "version": "8.4.4"
            }
        },
        "topologyMode": "Single-Primary"
    },
    "groupInformationSourceMember": "172.16.16.10:3306"
}
```
It can be seen that a three-node MGR cluster including an arbitrator node has been built.

In the following content, we will introduce how to deploy an MGR cluster manually, and how to use MySQL Router to implement read/write splitting and read scalability. For details, see: [Read/Write Splitting](../6-oper-guide/2-oper-rw-splitting.md).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
