# 二进制包安装
---

本节介绍如何用二进制包方式安装 GreatSQL 数据库，假定本次安装是在 CentOS 8.x x86_64 环境中安装，并且是以 root 用户身份执行安装操作。

## 下载安装包

[点击此处](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25)下载最新的安装包，下载以下文件：

- GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal.tar.xz    

## 运行环境配置
关闭 selinux 和防火墙
```
#关闭selinux
$ setenforce=0
$ sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config

#关闭防火墙
$ systemctl disable firewalld
$ systemctl stop firewalld
$ systemctl disable iptables
$ systemctl stop iptables
```

另外，要先确认yum源可用，因为安装GreatSQL时还要先安装其他依赖包，通过yum安装最省事。

如果需要配置yum源，可以参考[这篇文档](https://developer.aliyun.com/mirror/centos)。

## 安装依赖包

安装 GreatSQL 需要先安装其他依赖包，可执行下面命令完成：

```
$ yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```
如果报告个别依赖包安装失败或者找不到就删掉，然后重试。更详细的请参考：[安装准备](../4-install-guide/1-install-prepare.md)。


## 下载二进制包并安装

将下载的二进制包放在安装目录 `/usr/local/` 下，并解压缩：
```
# 下载
$ cd /usr/local
$ wget https://product.greatdb.com/GreatSQL-8.0.32-25/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal.tar.xz
#或者用curl
$ curl -o GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal.tar.xz https://product.greatdb.com/GreatSQL-8.0.32-25/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal.tar.xz

#解压缩
$ tar xf GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal.tar.xz
```

编辑systemd系统服务文件，增加GreatSQL服务文件：
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
ExecStartPre=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
LimitNOFILE = 10000
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
```
务必确认文件中目录及文件名是否正确。

执行命令重载systemd，加入 `greatsql` 服务，如果没问题就不会报错：
```
$ systemctl daemon-reload
```

这就安装成功并将GreatSQL添加到系统服务中，后面可以用 `systemctl` 来管理GreatSQL服务。

编辑GreatSQL全局配置文件 `/etc/my.cnf`，加入下面内容：
```
$ vim /etc/my.cnf
[mysql]
socket=/var/lib/mysql/mysql.sock

[mysqld]
user=mysql
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock

log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```
保存退出。

创建mysql系统用户：
```
$ /sbin/groupadd mysql
$ /sbin/useradd -g mysql mysql -d /dev/null -s /sbin/nologin
```



创建相关文件夹，并修改用户组：

```
mkdir /var/run/mysqld/ /var/lib/mysql-files/ /var/lib/mysql/ 

chown mysql:mysql /var/run/mysqld/ /var/lib/mysql-files/ /var/lib/mysql/ /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/
```



编辑`mysqld_pre_systemd`脚本文件，修改程序目录：

将文件中的 `/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/`改为实际安装目录。



## 启动GreatSQL

执行下面的命令启动GreatSQL服务
```
$ systemctl start greatsql
```

检查服务是否已启动，以及进程状态：
```
$ systemctl status greatsql
● greatsql.service - GreatSQL Server
   Loaded: loaded (/usr/lib/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: active (running) since Wed 2022-07-06 13:42:35 CST; 2min 42s ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 47924 ExecStartPre=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 47994 (mysqld)
   Status: "Server is operational"
    Tasks: 38 (limit: 149064)
   Memory: 444.5M
   CGroup: /system.slice/greatsql.service
           └─47994 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld

Jul 06 13:42:30 db170 systemd[1]: Starting GreatSQL Server...
Jul 06 13:42:35 db170 systemd[1]: Started GreatSQL Server.

$ ps -ef | grep mysqld
mysql      47994       1  2 13:42 ?        00:00:03 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld

$ ss -lntp | grep mysqld
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=47994,fd=23))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=47994,fd=26))

# 查看数据库文件
$ ls /var/lib/mysql
 auto.cnf        ca-key.pem        client-key.pem       ib_buffer_pool   ib_logfile1     mysql        mysql.sock.lock      public_key.pem    sys
 binlog.000001   ca.pem           '#ib_16384_0.dblwr'   ibdata1          ibtmp1          mysql.ibd    performance_schema   server-cert.pem   undo_001
 binlog.index    client-cert.pem  '#ib_16384_1.dblwr'   ib_logfile0     '#innodb_temp'   mysql.sock   private_key.pem      server-key.pem    undo_002
```
可以看到，GreatSQL服务已经正常启动了。

## 连接登入GreatSQL

采用minimal二进制包安装GreatSQL后，通过log-error日志查看初始化密码，即可登入。

```
$ cat /var/log/mysqld.log|grep password
[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: NrkNcJya<9f6
```
> 若使用了GreatSQL推荐的my.cnf则错误日志路径发生改变，请使用以下命令查看初始化密码
```sql
$ $ grep -i root /data/GreatSQL/error.log
... A temporary password is generated for root@localhost: ji!pjndiw5sJ
```
复制密码即可登入GreatSQL

```
$ /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.32-25 GreatSQL, Release 25, Revision db07cc5cb73

Copyright (c) 2021-2023 GreatDB Software Co., Ltd
Copyright (c) 2009-2021 Percona LLC and/or its affiliates
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> \s
--------------
mysql  Ver 8.0.32-25 for Linux on x86_64 (GreatSQL, Release 25, Revision db07cc5cb73)

Connection id:          8
Current database:
Current user:           root@localhost
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         8.0.32-25 GreatSQL, Release 25, Revision db07cc5cb73
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

greatsql> SHOW DATABASES;  #<--查看数据库列表
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



登录后及时修改密码

```
 ALTER USER 'root'@'localhost' IDENTIFIED BY 'PASSWORD'
```



## 关闭/重启GreatSQL

执行下面的命令关闭GreatSQL数据库。
```
$ systemctl stop greatsql
```

执行下面的命令重启GreatSQL数据库。
```
$ systemctl restart greatsql
```

至此，二进制包方式安装GreatSQL数据库完成。

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
