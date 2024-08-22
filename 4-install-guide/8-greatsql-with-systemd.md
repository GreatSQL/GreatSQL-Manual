# 利用systemd管理GreatSQL
---

无论是在CentOS、Ubuntu，还是openEuler、Anolis、UOS等系统环境下，都推荐采用systemd来管理GreatSQL数据库。

##  关于systemd

systemd 是Linux系统启动和服务器守护进程管理器，负责在系统启动或运行时，激活系统资源，服务器进程和其它进程，systemd被设计用来改进原来sysvinit中的多个缺点。

CentOS的systemd服务配置脚本存放在 `/usr/lib/systemd/` 目录下，并区分 system 和 user，每一个服务配置脚本以 **.service** 结尾，例如 `/usr/lib/systemd/system/sshd.service`。

##  编辑systemd服务配置脚本

如果是采用RPM方式安装，则会默认利用systemd来管理GreatSQL，服务名是 *mysql*，相应的服务配置文件是 `/lib/systemd/system/mysqld.service`。

另一个服务配置文件 `/lib/systemd/system/mysqld@.service` 是用于管理单机多实例场景的，可以参考这篇文章：[单机多实例](../6-oper-guide/5-multi-instances.md)。

如果是采用二进制包安装GreatSQL，需要手动编辑服务配置文件，例如：
```
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

其中，`ExecStartPre=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd` 用于GreatSQL首次启动时，进行初始化；`ExecStart=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS` 是GreatSQL服务主进程，在这里甚至还可以自行指定不同路径下的配置文件，例如：`ExecStart=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/greatsql.cnf $MYSQLD_OPTS`。

务必确认文件中目录及文件名是否正确。

执行命令重载systemd，加入 `greatsql` 服务，如果没问题就不会报错：
```
$ systemctl daemon-reload
```

这就安装成功并将GreatSQL添加到系统服务中，后面可以用 `systemctl` 来管理GreatSQL服务。

下面分别是启动、关闭、重启GreatSQL服务操作：
```
$ systemctl start greatsql
...
$ systemctl stop greatsql
...
$ systemctl restart greatsql
```

如果是在一个全新环境中首次启动GreatSQL数据库，可能会失败，因为在 `mysqld_pre_systemd` 的初始化处理逻辑中，需要依赖 `/var/lib/mysql-files` 目录保存一个临时文件。如果首次启动失败，可能会有类似下面的报错提示：
```
$ journalctl -ex
...
mysqld_pre_systemd[1257969]: mktemp: failed to create file via template ‘/var/lib/mysql-files/install-validate-password-plugin.XXXXXX.sql’: No such file or directory
mysqld_pre_systemd[1257969]: chmod: cannot access '': No such file or directory
...
```

需手动创建 `/var/lib/mysql-files` 目录，再次启动GreatSQL服务即可：
```
$ mkdir -p /var/lib/mysql-files && chown -R mysql:mysql /var/lib/mysql-files
$ systemctl start greatsql
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
