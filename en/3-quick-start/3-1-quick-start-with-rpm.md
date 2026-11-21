# RPM Installation
---

This section introduces how to install the GreatSQL database using RPM packages. It is assumed that the installation is performed in a CentOS 8.x x86_64 environment and as the root user.

## Downloading the Installation Packages

[Click here](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.4.4-5) to download the latest installation packages. At least the following RPM package files are required:

- greatsql-client-8.4.4-5.1.el8.x86_64.rpm
- greatsql-devel-8.4.4-5.1.el8.x86_64.rpm
- greatsql-icu-data-files-8.4.4-5.1.el8.x86_64.rpm
- greatsql-shared-8.4.4-5.1.el8.x86_64.rpm
- greatsql-server-8.4.4-5.1.el8.x86_64.rpm

**Tip**: It is recommended to download the RPM bundle file directly, e.g., greatsql-8.4.4-5.1.el8.x86_64.rpm-bundle.tar.xz, so that you do not need to download each file separately.

## Runtime Environment Configuration
Disable SELinux and the firewall

```bash
# disable selinux
setenforce 0
sed -i 's/^SELINUX=.*/SELINUX=disabled/ig' /etc/selinux/config

# disable the firewall
systemctl disable firewalld
systemctl stop firewalld
systemctl disable iptables
systemctl stop iptables
```

In addition, make sure the yum source is available first, because other dependency packages need to be installed before installing GreatSQL, and installing through yum is the most convenient.

If you need to configure a yum source, refer to [Configuring the Alibaba Cloud YUM source](https://developer.aliyun.com/mirror/centos).

## Installing Dependency Packages

Before installing the GreatSQL RPM packages, you need to install these related dependency packages first.
```bash
$ yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools \
  openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 \
  python perl-JSON perl-Test-Simple libatomic
```

If some dependency packages fail to install or cannot be found, remove them and retry. For more details, refer to: [Installation Preparation](../4-install-guide/1-install-prepare.md).

## Installing the RPM Packages

Run the following command to install the RPM packages. If everything goes well, the process will look like this:
```bash
rpm -ivh --nodeps greatsql*rpm

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

When installing the GreatSQL RPM packages, dependency errors similar to the following may be reported:

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
```

These dependency packages above can be ignored; they do not affect the normal use of GreatSQL. At this point, you can add `--nodeps --force` to forcibly ignore them, for example:

```bash
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

## Starting GreatSQL

Before starting the GreatSQL service, first modify the systemd file `vim /lib/systemd/system/mysqld.service`, and add the following lines in the *[Service]* section to raise some limits and avoid warnings about insufficient file descriptors or threads.

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
```

Save and exit, then reload systemd. If there are no problems, no error will be reported:

```bash
systemctl daemon-reload
```

Run the following command to start the GreatSQL service

```bash
systemctl start mysqld
```

Check whether the service has started and the process status:

```bash
$ systemctl status mysqld

...
● mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
   Active: active (running) since ...
     Docs: https://greatsql.cn/docs
  Process: 43570 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 43653 (mysqld)
   Status: "Server is operational"
    Tasks: 39 (limit: 149064)
   Memory: 446.4M
   CGroup: /system.slice/mysqld.service
           └─43653 /usr/sbin/mysqld
...

$ ps -ef | grep mysqld

...
mysql      43653       1  3 10:35 ?        00:00:02 /usr/sbin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=43653,fd=23))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=43653,fd=26))

# view the database files
$ ls /var/lib/mysql
 auto.cnf        ca-key.pem        client-key.pem  '#ib_16384_0.dblwr'   ibdata1         mysql                private_key.pem   server-key.pem   undo_001
 binlog.000001   ca.pem           '#file_purge'    '#ib_16384_1.dblwr'  '#innodb_redo'   mysql.ibd            public_key.pem    sys              undo_002
 binlog.index    client-cert.pem   greatsql         ib_buffer_pool      '#innodb_temp'   performance_schema   server-cert.pem   sys_audit
```
As you can see, the GreatSQL service has started normally.

## Connecting and Logging into GreatSQL

After installing GreatSQL with the RPM method, a random password is generated for the administrator root user. Obtain it by searching the log file:

```bash
$ grep -i root /var/log/mysqld.log

...
[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: K<f9Iapd#wwp
```

As you can see, the root account password is: "K<f9Iapd#wwp" (without the double quotes). Copy it to the clipboard.

After logging into GreatSQL for the first time, you must change the root password immediately; otherwise, no other operations can be performed. The new password must also meet certain security rules:

```bash
$ mysql -uroot -p

...
Enter password:     #<-- paste the random password copied above here
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> status;   #<-- try to run a command, prompted to change the password first
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.

greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@202X';  #<-- change the password
Query OK, 0 rows affected (0.02 sec)

greatsql> status;   #<-- now other commands can be run normally
--------------
mysql  Ver 8.4.4-5 for Linux on x86_64 (GreatSQL, Release 5, Revision 39b389cdf3b)

Connection id:          11
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
UNIX socket:            /var/lib/mysql/mysql.sock
Binary data as:         Hexadecimal
Uptime:                 10 min 14 sec

Threads: 2  Questions: 7  Slow queries: 0  Opens: 130  Flush tables: 3  Open tables: 46  Queries per second avg: 0.005
--------------

greatsql> SHOW DATABASES;  #<-- view the database list
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

Run the following command to stop the GreatSQL database.

```bash
systemctl stop mysqld
```

Run the following command to restart the GreatSQL database.

```bash
systemctl restart mysqld
```

At this point, installing the GreatSQL database using the RPM package method is complete.


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
