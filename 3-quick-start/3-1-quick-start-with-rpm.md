# RPM安装
---

本节介绍如何用 RPM 包方式安装 GreatSQL 数据库，假定本次安装是在 CentOS 8.x x86_64 环境中安装，并且是以 root 用户身份执行安装操作。

## 下载安装包

[点击此处](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25)下载最新的安装包，至少下载以下几个RPM包文件：

- greatsql-client-8.0.32-25.1.el8.x86_64.rpm 
- greatsql-devel-8.0.32-25.1.el8.x86_64.rpm  
- greatsql-icu-data-files-8.0.32-25.1.el8.x86_64.rpm
- greatsql-shared-8.0.32-25.1.el8.x86_64.rpm
- greatsql-server-8.0.32-25.1.el8.x86_64.rpm 

**提示**：建议直接下载RPM集中打包文件，例如 greatsql-8.0.32-25.1.el8.x86_64.rpm-bundle.tar.xz，就无需每个文件单独下载了。

## 运行环境配置
关闭selinux和防火墙
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

安装GreatSQL RPM包时，要先安装这些相关依赖包。
```
$ yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```

如果报告个别依赖包安装失败或者找不到就删掉，然后重试。更详细的请参考：[安装准备](../4-install-guide/1-install-prepare.md)。

## 安装RPM包

执行下面的命令安装PRM包，如果一切顺利的话，相应的过程如下所示：
```
$ rpm -ivh --nodeps greatsql*rpm
Verifying...                          ################################# [100%]
Preparing...                          ################################# [100%]
Updating / installing...
   1:greatsql-shared-8.0.32-25.1.el8  ################################# [ 20%]
   2:greatsql-client-8.0.32-25.1.el8  ################################# [ 40%]
   3:greatsql-icu-data-files-8.0.32-25################################# [ 60%]
   4:greatsql-server-8.0.32-25.1.el8  ################################# [ 80%]
   5:greatsql-devel-8.0.32-25.1.el8   ################################# [100%]
```
这就安装成功了。

**提示**：
1. 安装GreatSQL RPM包需要先安装其他依赖包，可执行下面命令完成：

```
$ yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```

如果报告个别依赖包安装失败或者找不到就删掉，然后重试。更详细的请参考：[安装准备](../4-install-guide/1-install-prepare.md)。

其他部分依赖包，如果通过yum还是无法安装，则加上 `--nodeps --force` 强制忽略即可，例如：
```
$ rpm -ivh greatsql*rpm
error: Failed dependencies:
        perl(Lmo) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Lmo::Meta) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Lmo::Object) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Lmo::Types) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Lmo::Utils) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Percona::Toolkit) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Quoter) is needed by greatsql-server-8.0.32-25.1.el8.x86_64
        perl(Transformers) is needed by greatsql-server-8.0.32-25.1.el8.x86_64

#上述这些依赖包可以先忽略，不影响GreatSQL正常使用

$ rpm -ivh --nodeps --force greatsql*rpm
Preparing...                          ################################# [100%]
Updating / installing...
   1:greatsql-shared-8.0.32-25.1.el7  ################################# [ 20%]
   2:greatsql-client-8.0.32-25.1.el7  ################################# [ 40%]
   3:greatsql-icu-data-files-8.0.32-25################################# [ 60%]
   4:greatsql-server-8.0.32-25.1.el7  ################################# [ 80%]
   5:greatsql-devel-8.0.32-25.1.el7   ################################# [100%]
```

2. 正式安装GreatSQL RPM包时，可能还需要依赖Perl等其他软件包，此处为快速演示，因此加上 `--nodeps` 参数，忽略相应的依赖关系检查。安装完毕后，如果因为依赖关系无法启动，请再行安装相应软件依赖包。

## 启动GreatSQL

启动GreatSQL服务前，先修改systemd文件，调高一些limit上限，避免出现文件数、线程数不够用的告警。
```
# 在[Server]区间增加下面几行内容
$ vim /lib/systemd/system/mysqld.service
...
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
...
```

保存退出，然后再执行命令重载systemd，如果没问题就不会报错：
```
$ systemctl daemon-reload
```

执行下面的命令启动GreatSQL服务
```
$ systemctl start mysqld
```

检查服务是否已启动，以及进程状态：
```
$ systemctl status mysqld
● mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
   Active: active (running) since Wed 2022-07-06 10:35:57 CST; 42s ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 43570 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 43653 (mysqld)
   Status: "Server is operational"
    Tasks: 39 (limit: 149064)
   Memory: 446.4M
   CGroup: /system.slice/mysqld.service
           └─43653 /usr/sbin/mysqld
...

$ ps -ef | grep mysqld
mysql      43653       1  3 10:35 ?        00:00:02 /usr/sbin/mysqld

$ ss -lntp | grep mysqld
LISTEN 0      70                 *:33060            *:*    users:(("mysqld",pid=43653,fd=23))
LISTEN 0      128                *:3306             *:*    users:(("mysqld",pid=43653,fd=26))

# 查看数据库文件
$ ls /var/lib/mysql
 auto.cnf        ca.pem              '#ib_16384_1.dblwr'   ib_logfile1     mysql.ibd         mysqlx.sock.lock     server-cert.pem   undo_002
 binlog.000001   client-cert.pem      ib_buffer_pool       ibtmp1          mysql.sock        performance_schema   server-key.pem
 binlog.index    client-key.pem       ibdata1             '#innodb_temp'   mysql.sock.lock   private_key.pem      sys
 ca-key.pem     '#ib_16384_0.dblwr'   ib_logfile0          mysql           mysqlx.sock       public_key.pem       undo_001
```
可以看到，GreatSQL服务已经正常启动了。

## 连接登入GreatSQL

RPM方式安装GreatSQL后，会随机生成管理员root的密码，通过搜索日志文件获取：
```
$ grep -i root /var/log/mysqld.log
2022-07-06T02:35:54.691879Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: K<f9Iapd#wwp
```
可以看到，root账户的密码是："K<f9Iapd#wwp" (不包含双引号)，复制到粘贴板里。

首次登入GreatSQL后，要立即修改root密码，否则无法执行其他操作，并且新密码要符合一定安全规则：
```
$ mysql -uroot -p
Enter password:     #<--这个地方粘贴上面复制的随机密码
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.32-25 GreatSQL, Release 25, Revision db07cc5cb73

Copyright (c) 2021-2023 GreatDB Software Co., Ltd
Copyright (c) 2009-2021 Percona LLC and/or its affiliates
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> \s   #<--想执行一个命令，提示要先修改密码
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.

greatsql> ALTER USER USER() IDENTIFIED BY 'GreatSQL@202X';  #<--修改密码
Query OK, 0 rows affected (0.02 sec)

greatsql> \s   #<--就可以正常执行其他命令了
--------------
mysql  Ver 8.0.32-25 for Linux on x86_64 (GreatSQL, Release 25, Revision db07cc5cb73)

Connection id:          11
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
Uptime:                 10 min 14 sec

Threads: 2  Questions: 7  Slow queries: 0  Opens: 130  Flush tables: 3  Open tables: 46  Queries per second avg: 0.005
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

greatsql>
```

## 关闭/重启GreatSQL

执行下面的命令关闭GreatSQL数据库。
```
$ systemctl stop mysqld
```

执行下面的命令重启GreatSQL数据库。
```
$ systemctl restart mysqld
```

至此，RPM包方式安装GreatSQL数据库完成。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
