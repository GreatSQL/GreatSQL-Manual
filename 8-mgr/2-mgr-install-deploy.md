# MGR 安装部署

---

本文介绍如何利用手动方式和MySQL Shell方式用`GreatSQL-8.0.32-25`构建一个三节点的MGR集群

[点击此处查看使用MySQL Shell方式构建三节点MGR集群](#二使用mysql-shell构建mgr)

## 一、利用手动方式构建MGR

### 1. 安装准备

准备好下面三台服务器：

| IP           | 端口 | 角色 |
| ------------ | ---- | ---- |
| 172.16.16.10 | 3306 | mgr1 |
| 172.16.16.11 | 3306 | mgr2 |
| 172.16.16.12 | 3306 | mgr3 |

确保三个节点间的网络是可以互通的，并且没有针对3306和33061端口的防火墙拦截规则。

下载GreatSQL二进制文件包，下载地址：*https://gitee.com/GreatSQL/GreatSQL/releases* 。

本文以 CentOS x86_64 环境为例，下载的二进制包名为： `GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz`，放在 `/usr/local` 目录下并解压缩：
```bash
$ cd /usr/local
$ tar xf GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64.tar.xz
$ cd GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64
$ ls
bin    COPYING-jemalloc  include  LICENSE         LICENSE-test  mysqlrouter-log-rotate  README.router  run    support-files
cmake  docs              lib      LICENSE.router  man           README                  README-test    share  var
```

### 2. 初始化GreatSQL
首先准备好 */etc/my.cnf* 配置文件：
```sql
#/etc/my.cnf
[mysqld]
user = mysql
basedir=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64
datadir=/data/GreatSQL
port=3306
server_id=103306
log-bin
log_slave_updates=1
gtid_mode=ON
enforce_gtid_consistency=ON
```
本文仅以能正常启动GreatSQL和部署MGR为目的，所以这份配置文件极为简单，如果想要在正式场合使用，可以参考[这份配置文件](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example)。

先初始化GreatSQL：
```
$ mkdir -p /data/GreatSQL && chown -R mysql:mysql /data/GreatSQL
$ /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf --initialize-insecure
```
**注意**：不要在生产环境中使用 `--initialize-insecure` 选项进行初始化安装，因为这么做的话，超级管理员root账号默认是空密码，任何人都可以使用该账号登录数据库，存在安全风险，本文中只是为了演示方便才这么做。

启动GreatSQL：
```
$ /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf &
```
如果不出意外，则能正常启动GreatSQL。用同样的方法也完成对另外两个节点的初始化。

此外，建议把GreatSQL加入系统systemd服务中，方便管理。具体方法可以参考这篇文章：[利用systemd管理GreatSQL](../4-install-guide/8-greatsql-with-systemd.md)。

### 3. 初始化MGR第一个节点
接下来准备初始化MGR的第一个节点，也称之为 **引导节点**。

修改 */etc/my.cnf* ，增加以下几行和MGR相关的配置参数：
```
plugin_load_add='group_replication.so'
group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
group_replication_local_address= "172.16.16.10:33061"
group_replication_group_seeds= "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
report-host=172.16.16.10
```
选项 `report-host` 的作用是向MGR其他节点报告本节点使用的地址，避免某个服务器上有多个主机名时，可能无法正确找到对应关系而使得MGR无法启动的问题。此外，设置了 `report-host` 后，修改 `/etc/hosts` 系统文件加入各节点的地址及主机名这个步骤就不是必须的了。

另外，注意上面配置的端口写的是 **33061** 而不是 **3306**，这是为MGR服务指定专用的通信端口，区别于GreatSQL正常的读写服务端口。这里的 33061 端口号可以自定义，例如写成 12345 也可以，注意该端口不能被防火墙拦截。

利用这份配置文件，重启GreatSQL，之后就应该能看到已经成功加载 `group_replicaiton` 插件了：
```sql
greatsql> show plugins;
...
+---------------------------------+----------+--------------------+----------------------+---------+
| Name                            | Status   | Type               | Library              | License |
+---------------------------------+----------+--------------------+----------------------+---------+
...
| group_replication               | ACTIVE   | GROUP REPLICATION  | group_replication.so | GPL     |
...
```

如果没正确加载，也可以登入GreatSQL自行手动加载这个plugin：
```sql
greatsql> install plugin group_replication soname 'group_replication.so';
```

接下来，创建MGR服务专用账户，并准备配置MGR服务通道：
```sql
#每个节点都要单独创建用户，因此这个操作没必要记录binlog并复制到其他节点
greatsql> set session sql_log_bin=0;
greatsql> create user repl@'%' identified with mysql_native_password by 'repl';
greatsql> GRANT BACKUP_ADMIN, REPLICATION SLAVE ON *.* TO `repl`@`%`;
#创建完用户后继续启用binlog记录
greatsql> set session sql_log_bin=1;

#配置MGR服务通道
#通道名字 group_replication_recovery 是固定的，不能修改
greatsql> CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='repl' FOR CHANNEL 'group_replication_recovery';
```

接着执行下面的命令，将其设置为MGR的引导节点（只有第一个节点需要这么做）后即可直接启动MGR服务：
```sql
greatsql> set global group_replication_bootstrap_group=ON;
greatsql> start group_replication;
```
**提醒**：当整个MGR集群重启时，第一个启动的节点也要先设置为引导模式，然后再启动其他节点。除此外，请勿设置引导模式。

而后，查看MGR服务状态：
```sql
greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-11d9-11ec-8f92-70b5e873a570 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.0.32         |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```
好了，第一个节点初始化完成。

### 4. 继续设置另外两个节点
继续使用下面这份 */etc/my.cnf* 配置文件模板：
```sql
#my.cnf
[mysqld]
user = mysql
basedir=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64
datadir=/data/GreatSQL
port=3306
server_id=113306
log-bin
log_slave_updates=1
gtid_mode=ON
enforce_gtid_consistency=ON

#mgr
plugin_load_add='group_replication.so'
group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
group_replication_local_address= "172.16.16.11:33061"
group_replication_group_seeds= "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
report-host=172.16.16.11
```
**提醒**：上面的几个选项中，`server_id`、`group_replication_local_address` 和 `report_host` 这三个选项要修改为正确的值。在一个MGR集群中，各节点设置的 `server_id` 和 `server_uuid` 要是唯一的，但是 `group_replication_group_name` 的值要一样，这是该MGR集群的唯一标识。

重启GreatSQL实例后（`report-host` 是只读选项，需要重启才能生效），创建MGR服务专用账号及配置MGR服务通道：
```sql
greatsql> set session sql_log_bin=0;
greatsql> create user repl@'%' identified with mysql_native_password by 'repl';
greatsql> GRANT BACKUP_ADMIN, REPLICATION SLAVE ON *.* TO `repl`@`%`;
greatsql> set session sql_log_bin=1;

greatsql> CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='repl' FOR CHANNEL 'group_replication_recovery';
```

接下来即可直接启动MGR服务（除了第一个节点外，其余节点都不需要再设置引导模式）：
```
greatsql> start group_replication;
```
再次查看MGR节点状态：
```sql
greatsql> select * from performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-11d9-11ec-8f92-70b5e873a570 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.0.32         |
| group_replication_applier | 549b92bf-11d9-11ec-88e1-70b5e873a570 | 172.16.16.11 |        3306 | ONLINE       | SECONDARY   | 8.0.32         |
| group_replication_applier | 5596116c-11d9-11ec-8624-70b5e873a570 | 172.16.16.12 |        3306 | ONLINE       | SECONDARY   | 8.0.32         |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```
看到上面这个集群共有3个节点处于ONLINE状态，其中 *172.16.16.10* 是 **PRIMARY** 节点，其余两个都是 **SECONDARY** 节点，也就是说当前这个集群采用 **单主** 模式。如果采用多主模式，则所有节点的角色都是 **PRIMARY**。

### 5. 向MGR集群中写入数据
接下来我们连接到 **PRIMARY** 节点，创建测试库表并写入数据：
```sql
$mysql -h172.16.16.10 -uroot -Spath/mysql.sock
greatsql> create database mgr;
greatsql> use mgr;
greatsql> create table t1(c1 int unsigned not null primary key);
greatsql> insert into t1 select rand()*10240;
greatsql> select * from t1;
+------+
| c1   |
+------+
| 8078 |
+------+
```
再连接到其中一个 **SECONDARY** 节点，查看刚刚在 **PRIMARY** 写入的数据是否可以看到：
```sql
$mysql -h172.16.16.11 -uroot -Spath/mysql.sock
greatsql> use mgr;
greatsql> select * from t1;
+------+
| c1   |
+------+
| 8078 |
+------+
```
确认可以读取到该数据。

到这里，就完成了三节点MGR集群的安装部署。

## 二、使用MySQL Shell构建MGR

本文介绍如何利用<a id="test2">MySQL Shell for GreatSQL + GreatSQL 8.0.32</a>构建一个三节点的MGR集群。

> MySQL Shell for GreatSQL 的出现是因为在 GreatSQL 8.0.25-16 版本的时候引入了MGR仲裁节点（投票节点）的新特性，MySQL提供的MySQL Shell无法识别该特性，因此我们提供了 MySQL Shell for GreatSQL 版本

### 1. 安装准备
准备好下面三台服务器：

| IP           | 端口 | 角色 |
| ------------ | ---- | ---- |
| 172.16.16.10 | 3306 | mgr1 |
| 172.16.16.11 | 3306 | mgr2 |
| 172.16.16.12 | 3306 | mgr3 |

确保三个节点间的网络是可以互通的，并且没有针对3306和33061端口的防火墙拦截规则。

首先我们先下载MySQL Shell for GreatSQL，下载地址在GreatSQL的gitee仓库，和我们的GreatSQL 8.0.32-25新版本放在一起：https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25

进入下载文件列表最下方就是我们的MySQL Shell for GreatSQL，大家按机器和架构下载对应版本~

MySQL Shell for GreatSQL 需要 Python 3 的环境，如果没有环境的话，需要安装`yum install python3 -y`

```bash
$ python3 -V
Python 3.6.8
```

接下来直接利用MySQL Shell for GreatSQL部署MGR

### 2. 利用MySQL Shell构建MGR集群
利用MySQL Shell for GreatSQL构建MGR集群比较简单，主要有几个步骤：
1. 检查实例是否满足条件。
2. 创建并初始化一个集群。
3. 逐个添加实例。

首先，用管理员账号 root 连接到第一个节点：
```sql
#在本地通过socket方式登入
$ mysqlsh -Spath/mysql.sock root@localhost
Please provide the password for 'root@.%2Fmysql.sock': ********
Save password for 'root@.%2Fmysql.sock'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.25
...
```
执行命令 `\status` 查看当前节点的状态，确认连接正常可用。

执行 `dba.configure_instance()` 命令开始检查当前实例是否满足安装MGR集群的条件，如果不满足可以直接配置成为MGR集群的一个节点：
```sql
MySQL  localhost  Py > dba.configure_instance()
Configuring local MySQL instance listening at port 3306 for use in an InnoDB cluster...

This instance reports its own address as 172.16.16.10:3306

#提示当前的用户是管理员，不能直接用于MGR集群，需要新建一个账号
ERROR: User 'root' can only connect from 'localhost'. New account(s) with proper source address specification to allow remote connection from all instances must be created to manage the cluster.

1) Create remotely usable account for 'root' with same grants and password
2) Create a new admin account for InnoDB cluster with minimal required grants
3) Ignore and continue
4) Cancel

Please select an option [1]: 2 <-- 这里我们选择方案2，即创建一个最小权限账号
Please provide an account name (e.g: icroot@%) to have it created with the necessary
privileges or leave empty and press Enter to cancel.
Account Name: GreatSQL
Password for new account: ********
Confirm password: ********

applierWorkerThreads will be set to the default value of 4.

The instance '172.16.16.10:3306' is valid to be used in an InnoDB cluster.

Cluster admin user 'GreatSQL'@'%' created.
The instance '172.16.16.10:3306' is already ready to be used in an InnoDB cluster.

Successfully enabled parallel appliers.
```
完成检查并创建完新用户后，退出当前的管理员账户，并用新创建的MGR专用账户登入，准备初始化创建一个新集群：
```sql
$ mysqlsh --uri GreatSQL@172.16.16.10:3306
Please provide the password for 'GreatSQL@172.16.16.10:3306': ********
Save password for 'GreatSQL@172.16.16.10:3306'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.25
...
#定义一个变量名c，方便下面引用
MySQL  172.16.16.10:3306 ssl  Py > c = dba.create_cluster('MGR1');
A new InnoDB cluster will be created on instance '172.16.16.10:3306'.

Validating instance configuration at 172.16.16.10:3306...

This instance reports its own address as 172.16.16.10:3306

Instance configuration is suitable.
NOTE: Group Replication will communicate with other members using '172.16.16.10:33061'. Use the localAddress option to override.

Creating InnoDB cluster 'MGR1' on '172.16.16.10:3306'...

Adding Seed Instance...

Cluster successfully created. Use Cluster.addInstance() to add MySQL instances.
At least 3 instances are needed for the cluster to be able to withstand up to
one server failure.
```
这就完成了MGR集群的初始化并加入第一个节点（引导节点）。

接下来，用同样方法先用 root 账号分别登入到另外两个节点，完成节点的检查并创建最小权限级别用户（此过程略过。。。注意各节点上创建的用户名、密码都要一致），之后回到第一个节点，执行 `add_instance()` 添加另外两个节点。
```sql
MySQL  172.16.16.10:3306 ssl py > c.add_instance('GreatSQL@172.16.16.11:3306');<--这里要指定MGR专用账号

WARNING: A GTID set check of the MySQL instance at '172.16.16.11:3306' determined that it contains transactions that do not originate from the cluster, which must be discarded before it can join the cluster.

172.16.16.11:3306 has the following errant GTIDs that do not exist in the cluster:
b05c0838-6850-11ec-a06b-00155d064000:1

WARNING: Discarding these extra GTID events can either be done manually or by completely overwriting the state of 172.16.16.11:3306 with a physical snapshot from an existing cluster member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

Having extra GTID events is not expected, and it is recommended to investigate this further and ensure that the data can be removed prior to choosing the clone recovery method.

Please select a recovery method [C]lone/[A]bort (default Abort): Clone  <-- 选择用Clone方式从第一个节点全量复制数据
Validating instance configuration at 172.16.16.11:3306...

This instance reports its own address as 172.16.16.11:3306

Instance configuration is suitable.
NOTE: Group Replication will communicate with other members using '172.16.16.11:33061'. Use the localAddress option to override.

A new instance will be added to the InnoDB cluster. Depending on the amount of
data on the cluster this might take from a few seconds to several hours.

Adding instance to the cluster...

Monitoring recovery process of the new cluster member. Press ^C to stop monitoring and let it continue in background.
Clone based state recovery is now in progress.

NOTE: A server restart is expected to happen as part of the clone process. If the
server does not support the RESTART command or does not come back after a
while, you may need to manually start it back.

* Waiting for clone to finish...
NOTE: 172.16.16.11:3306 is being cloned from 172.16.16.10:3306
** Stage DROP DATA: Completed
** Clone Transfer
    FILE COPY  ############################################################  100%  Completed
    PAGE COPY  ############################################################  100%  Completed
    REDO COPY  ############################################################  100%  Completed

NOTE: 172.16.16.11:3306 is shutting down...  <-- 数据Clone完成，准备重启实例。如果该实例无法完成自动重启，则需要手动启动

* Waiting for server restart... ready
* 172.16.16.11:3306 has restarted, waiting for clone to finish...
** Stage RESTART: Completed
* Clone process has finished: 72.43 MB transferred in about 1 second (~72.43 MB/s)

State recovery already finished for '172.16.16.11:3306'

The instance '172.16.16.11:3306' was successfully added to the cluster.  <-- 新实例加入成功
```
用同样的方法，将 172.16.16.12:3306 实例也加入到集群中。

现在，一个有这三节点的MGR集群已经部署完毕，来确认下：
```sql
MySQL  172.16.16.10:3306 ssl  Py > c.describe()
{
    "clusterName": "MGR1",
    "defaultReplicaSet": {
        "name": "default",
        "topology": [
            {
                "address": "172.16.16.10:3306",
                "label": "172.16.16.10:3306",
                "role": "HA"
            },
            {
                "address": "172.16.16.11:3306",
                "label": "172.16.16.11:3306",
                "role": "HA"
            },
            {
                "address": "172.16.16.12:3306",
                "label": "172.16.16.12:3306",
                "role": "HA"
            }
        ],
        "topologyMode": "Single-Primary"
    }
} 
```
或者执行 `c.status()` 可以打印出集群更多的信息。

至此，利用MySQL Shell for GreatSQL构建一个三节点的MGR集群做好了，可以尝试向 Primary 节点写入数据观察测试。

### 3. MySQL Shell接管现存的MGR集群
对于已经在运行中的MGR集群，也是可以用MySQL Shell for GreatSQL接管的。只需要在调用 `createCluster()` 函数时，加上 `adoptFromGR:true` 选项即可。实际上不加这个选项的话，MySQL Shell for GreatSQL也会自动检测到该MGR集群已存在，并询问是否要接管。

在这里简单演示下：
```sql
#不加上 adoptFromGr:true 选项
MySQL  172.16.16.10:3306 ssl  Py > c = dba.create_cluster('MGR1');
A new InnoDB cluster will be created on instance '172.16.16.10:3306'.

You are connected to an instance that belongs to an unmanaged replication group.
Do you want to setup an InnoDB cluster based on this replication group? [Y/n]:
```
可以看到，会有提示信息询问是否要接管。

如果加上 `adoptFromGr:true` 选项，则会直接创建集群，不再询问：
```sql
MySQL  172.16.16.10:3306 ssl Py > c=dba.create_cluster('MGR1', {adoptFromGr:true});
A new InnoDB cluster will be created based on the existing replication group on instance '172.16.16.10:3306'.

Creating InnoDB cluster 'MGR1' on '172.16.16.10:3306'...

Adding Seed Instance...
Adding Instance '172.16.16.10:3306'...
Adding Instance '172.16.16.11:3306'...
Adding Instance '172.16.16.12:3306'...
...
```

如果是MGR集群的metadata发生变化，这时候无论调用 `dba.get_cluster()` 还是 `dba.create_cluster` 都可能会报告类似下面的错误：
```
Dba.getCluster: Unable to get an InnoDB cluster handle. The instance '192.168.6.27:3306' may belong to a different cluster from the one registered in the Metadata since the value of 'group_replication_group_name' does not match the one registered in the Metadata: possible split-brain scenario. Please retry while connected to another member of the cluster. (RuntimeError)
```

这种情况下，可以调用 `dba.drop_metadata_schema()` 函数删除元数据，再调用 `dba.create_cluster` 接管集群：
```sql
#确保不影响正常业务的话，删除无用MGR元数据
MySQL  172.16.16.10:3306 ssl  Py > dba.drop_metadata_schema()
Are you sure you want to remove the Metadata? [y/N]: y
Metadata Schema successfully removed.

#接管现有集群
 MySQL  172.16.16.10:3306 ssl  Py > c=dba.create_cluster('MGR1', {adoptFromGr:true})
...
```
这样就可以接管了

### 4. 使用MySQL Shell的窍门
在MySQL Shell for GreatSQL中，也是可以启用pager（分页器）的，像下面这样设置即可：
```
mysqlsh> shell.enable_pager()
mysqlsh> shell.options["pager"]="less -i -n -S";
Pager has been set to 'less -i -n -S'.
```

在用MySQL Shell for GreatSQL连接时，也可以加上 `--dba-log-sql=2 --log-level=debug3` 参数，以启用debug模式，并记录运行过程中实际调用的SQL命令，默认日志文件是 `~/.mysqlsh/mysqlsh.log`。

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
