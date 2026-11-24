# Managing GreatSQL with systemd
---

Whether in CentOS, Ubuntu, or openEuler, Anolis, UOS and other system environments, it is recommended to use systemd to manage the GreatSQL database.

## About systemd

systemd is the Linux system startup and server daemon manager, responsible for activating system resources, server processes, and other processes when the system starts or runs. systemd is designed to improve on several shortcomings of the original sysvinit.

CentOS's systemd service configuration scripts are stored in the `/usr/lib/systemd/` directory and distinguish between system and user. Each service configuration script ends with **.service**, for example `/usr/lib/systemd/system/sshd.service`.

## Editing the systemd Service Configuration Script

If installed with the RPM method, systemd is used to manage GreatSQL by default. The service name is *mysql*, and the corresponding service configuration file is `/lib/systemd/system/mysqld.service`.

Another service configuration file `/lib/systemd/system/mysqld@.service` is used to manage single-machine multi-instance scenarios. Refer to this article: [Single-Machine Multi-Instances](../6-oper-guide/5-multi-instances.md).

If GreatSQL is installed with the binary package, the service configuration file needs to be edited manually. The content is as follows:

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

Among them,

- `ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd` is used for initialization on the first startup of GreatSQL;
- `ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS` is the main process of the GreatSQL service. A custom configuration file path can also be specified, for example: `ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/greatsql.cnf $MYSQLD_OPTS`.

Make sure to confirm that the directories and file names specified by the `ExecStartPre` and `ExecStart` parameters in the file are correct.

**Note**: If not installed in the default `/usr/local/` directory, edit the `bin/mysqld_pre_systemd` script and modify the places in the script that involve the GreatSQL installation path.

Execute the command to reload systemd and add the `greatsql` service. If there is no problem, no error is reported:
```bash
systemctl daemon-reload
```

This completes the installation and adds GreatSQL to the system services. Later, `systemctl` can be used to manage the GreatSQL service.

The following are the operations to start, stop, and restart the GreatSQL service:
```bash
systemctl start greatsql
systemctl stop greatsql
systemctl restart greatsql
```

If the GreatSQL database is started for the first time in a brand-new environment, it may fail, because in the initialization processing logic of `mysqld_pre_systemd`, it needs to rely on the `/var/lib/mysql-files` directory to save a temporary file. If the first startup fails, an error may occur. Execute `journalctl -ex` to view the specific error information:
```bash
journalctl -ex
```

::: details View the result
```bash
$ journalctl -ex

...
mysqld_pre_systemd[1257969]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or directory
mysqld_pre_systemd[1257969]: chmod: cannot access '': No such file or directory
...
```
:::

Manually create the `/var/lib/mysql-files` directory and start the GreatSQL service again:
```bash
mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
systemctl start greatsql
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
