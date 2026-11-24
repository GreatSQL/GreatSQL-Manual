# Binary Tarball Installation
---

This section introduces how to install the GreatSQL database using the binary tarball method. It is assumed that the installation is performed in a CentOS 8.x x86_64 environment and as the root user.

## Downloading the Installation Package

[Click here](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-27) to download the latest installation package. Download the following file:

- GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal.tar.xz

::: tip Tip
The minimal version runs the `strip` operation on the binary files, so the file size is smaller, but the functionality is the same as the normal version. The minimal version is generally used for testing and experience environments.
:::

## Runtime Environment Configuration
Disable SELinux and the firewall

```bash
# disable selinux
setenforce=0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config

# disable the firewall
systemctl disable firewalld
systemctl stop firewalld
systemctl disable iptables
systemctl stop iptables
```

In addition, make sure the yum source is available first, because other dependency packages need to be installed before installing GreatSQL, and installing through yum is the most convenient.

If you need to configure a yum source, refer to [Configuring the Alibaba Cloud YUM source](https://developer.aliyun.com/mirror/centos).

## Installing Dependency Packages

Other dependency packages need to be installed before installing GreatSQL. Run the following command to do this:

```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```
If some dependency packages fail to install or cannot be found, remove them and retry. For more details, refer to: [Installation Preparation](../4-install-guide/1-install-prepare.md).

## Downloading and Installing the Binary Tarball

Place the downloaded binary tarball in the installation directory `/usr/local/` and extract it:

```bash
# download
cd /usr/local && wget https://product.greatdb.com/GreatSQL-8.0.32-27/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal.tar.xz
# or use curl

cd /usr/local && curl -o GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal.tar.xz https://product.greatdb.com/GreatSQL-8.0.32-27/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal.tar.xz

# extract
tar xf GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal.tar.xz
```

Modify the *PATH* environment variable to add the GreatSQL installation directory, making it convenient to run commands without specifying the full path every time:

```bash
export PATH=$PATH:/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin
echo 'export PATH=$PATH:/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin' >> ~/.bash_profile
```

Edit/create the systemd system service file to configure the GreatSQL service `vim /lib/systemd/system/greatsql.service`. The main content of the file is as follows:

```ini
[Unit]
Description=GreatSQL Server
Documentation=https://greatsql.cn/docs/
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
ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysqld --defaults-file=/etc/my.cnf $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```

Make sure that the directories and file names specified by the `ExecStartPre` and `ExecStart` parameters in the file are correct.

**Tip**: If you do not install to the default `/usr/local/` directory, edit the `bin/mysqld_pre_systemd` script and modify the places in the script that involve the GreatSQL installation path.

Run the command to reload systemd and add the `greatsql` service. If there are no problems, no error will be reported:

```bash
systemctl daemon-reload
```

Now the installation is successful and GreatSQL has been added to the system services. Later, `systemctl` can be used to manage the GreatSQL service.

Edit the GreatSQL global configuration file `vim /etc/my.cnf` and add the following content:
```ini
[mysql]
socket=/var/lib/mysql/mysql.sock

[mysqld]
user=mysql
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock

log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```
Save and exit.

Create the system user *mysql*:

```bash
/sbin/groupadd mysql
/sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
```

Create the related folders and change the user group:

```bash
mkdir /var/run/mysqld/ /var/lib/mysql-files/ /var/lib/mysql/
chown mysql:mysql /var/run/mysqld/ /var/lib/mysql-files/ /var/lib/mysql/ /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/
```

Edit the `/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd` file, and change the several occurrences of `/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/` in the file to the actual GreatSQL installation directory.

## Starting GreatSQL

Run the following command to start the GreatSQL service

```bash
systemctl start greatsql
```

Check whether the service has started and the process status:
```bash
$ systemctl status greatsql

...
● greatsql.service - GreatSQL Server
   Loaded: loaded (/usr/lib/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: active (running) since ...
     Docs: https://greatsql.cn/docs
  Process: 47924 ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 47994 (mysqld)
   Status: "Server is operational"
    Tasks: 38 (limit: 149064)
   Memory: 444.5M
   CGroup: /system.slice/greatsql.service
           └─47994 /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysqld

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld

...
mysql      47994       1  2 13:42 ?        00:00:03 /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysqld

$ ss -lntp | grep mysqld

...
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=47994,fd=23))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=47994,fd=26))

# view the database files
$ ls /var/lib/mysql

...
 auto.cnf        ca-key.pem        error.log           '#ib_archive'    '#innodb_redo'       mysql.ibd         performance_schema   server-key.pem   undo_002
 binlog.000001   ca.pem           '#file_purge'         ib_buffer_pool   innodb_status.258   mysql.pid         private_key.pem      slow.log
 binlog.000002   client-cert.pem  '#ib_16384_0.dblwr'   ibdata1         '#innodb_temp'       mysql.sock        public_key.pem       sys
 binlog.index    client-key.pem   '#ib_16384_1.dblwr'   ibtmp1           mysql               mysql.sock.lock   server-cert.pem      undo_001
```
As you can see, the GreatSQL service has started normally.

## Connecting and Logging into GreatSQL

After installing GreatSQL with the binary tarball method, check the log file specified by the `log-error` parameter (`log-error=/var/log/mysqld.log`) to find the initialization password, and then log in.

```bash
$ grep -i root /var/log/mysqld.log

...
[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: NrkNcJya<9f6
```

::: tip Tip
If you use the my.cnf template recommended by GreatSQL, the error log file path may be different. Use the following command to view the initialization password.
:::

```bash
$ grep -i root /data/GreatSQL/error.log

...
A temporary password is generated for root@localhost: ji!pjndiw5sJ
```

Copy the password and log into GreatSQL

```bash
$ /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64-minimal/bin/mysql -uroot

...
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> status;
--------------
mysql  Ver 8.0.32-27 for Linux on x86_64 (GreatSQL, Release 27, Revision aa66a385910)

Connection id:          8
Current database:
Current user:           root@localhost
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
Protocol version:       10
Connection:             Localhost via UNIX socket
Server characterset:    utf8mb4
Db     characterset:    utf8mb4
Client characterset:    utf8mb4
Conn.  characterset:    utf8mb4
UNIX socket:            /var/lib/mysql/mysql.sock
Binary data as:         Hexadecimal
Uptime:                 17 min 23 sec

Threads: 2  Questions: 12  Slow queries: 0  Opens: 120  Flush tables: 3  Open tables: 36  Queries per second avg: 0.011
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

Change the password promptly after logging in

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'PASSWORD'
```

## Stopping/Restarting GreatSQL

Run the following command to stop the GreatSQL database.

```bash
systemctl stop greatsql
```

Run the following command to restart the GreatSQL database.

```bash
systemctl restart greatsql
```

At this point, installing the GreatSQL database using the binary tarball method is complete.


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
