# Single-Machine Multi-Instances
---

This article introduces how to deploy multiple GreatSQL database instances in a single-machine environment.

Sometimes, multiple database instances need to be run in the same system environment to save server resources.

Starting from MySQL 5.7, the official default uses `systemd` to manage the `mysqld` service, and it is no longer recommended to use the `mysqld_safe` daemon method.

In single-machine single-instance mode, managing the `mysqld` service with `systemd` can be referred to here: [Adding the GreatSQL System Service](../4-install-guide/3-install-with-tarball.md).

Whether GreatSQL is installed with the RPM or binary package method, `systemd` can be used to manage multiple instances.

Assume that `systemd` managing a single `mysqld` instance has now been implemented. Next, implement managing multiple instances.

## Adding the `systemd` Service File

Manually edit the `systemd` service file `/lib/systemd/system/greatsql@.service` (refer to the sample below for the file content):
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
Type=notify
TimeoutSec=10
PermissionsStartOnly=true

#for single instance
#ExecStartPre=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
#ExecStart=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS

#for multi instance
ExecStartPre=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd %I
ExecStart=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-group-suffix=@%I $MYSQLD_OPTS

EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```
Note that compared with the single-instance service file name, the system service file name has an additional **@** symbol, and the contents of `ExecStartPre` and `ExecStart` in the file are also slightly different.

## Editing the /etc/my.cnf Configuration File

The original `/etc/my.cnf` configuration file can be directly used. Comment out several options such as `datadir`, `port`, `socket`, and `server_id`, and then add content similar to the following at the end of the file:
```ini
# Note that the writing style here is different from mysqld_multi
[mysqld@mgr01]
datadir=/data/GreatSQL/mgr01
socket=/data/GreatSQL/mgr01/mysql.sock
port=3306
server_id=103306
log-error=/data/GreatSQL/mgr01/error.log
group_replication_local_address= "172.16.16.10:33061"

[mysqld@mgr02]
datadir=/data/GreatSQL/mgr02
socket=/data/GreatSQL/mgr02/mysql.sock
port=3307
server_id=103307
log-error=/data/GreatSQL/mgr02/error.log
group_replication_local_address= "172.16.16.10:33071"

#For more instances, continue copying in this way
```

Reload `systemd` to make it take effect:
```bash
systemctl daemon-reload
```

Then these newly added service lists can be recognized:
```bash
$ systemctl -l

...
greatsql@mgr01.service                              loaded active running   GreatSQL Server...
greatsql@mgr02.service                              loaded active running   GreatSQL Server...
greatsql@mgr03.service                              loaded active running   GreatSQL Server...
...
```

Now commands similar to the following can be directly executed to start and stop multi-instance services:
```bash
systemctl start greatsql@mgr01
```

In this way, multi-instance services can be conveniently managed in a single-machine environment.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
