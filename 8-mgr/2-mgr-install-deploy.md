# MGR 安装部署

---

本文介绍如何利用手动方式和 MySQL Shell for GreatSQL（以下简称 GreatSQL Shell）方式基于 GreatSQL 8.4.4-4 构建一个三节点的MGR集群。

## 利用手动方式构建MGR

###  安装准备

准备好下面三台服务器：

| IP           | 端口 | 角色 |
| ------------ | ---- | ---- |
| 172.16.16.10 | 3306 | mgr1 |
| 172.16.16.11 | 3306 | mgr2 |
| 172.16.16.12 | 3306 | mgr3 |

确保三个节点间的网络是可以互通的，并且没有针对3306和33061端口的防火墙拦截规则。

下载GreatSQL二进制文件包，下载地址：*https://gitee.com/GreatSQL/GreatSQL/releases* 。

本文以 CentOS x86_64 环境为例，下载的二进制包名为： `GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz`，放在 `/usr/local` 目录下并解压缩：
```bash
$ cd /usr/local
$ tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
$ cd GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
$ ls

bin    COPYING-jemalloc  include  LICENSE         LICENSE-test  mysqlrouter-log-rotate  README.router  run    support-files
cmake  docs              lib      LICENSE.router  man           README                  README-test    share  var
```

###  初始化GreatSQL
首先准备好 */etc/my.cnf* 配置文件：
```ini
#/etc/my.cnf
[mysqld]
user = mysql
basedir=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
datadir=/data/GreatSQL
port=3306
server_id=103306
log-bin
binlog_format=ROW
log_replica_updates=1
gtid_mode=ON
enforce_gtid_consistency=ON
```
本文仅以能正常启动GreatSQL和部署MGR为目的，所以这份配置文件极为简单，如果想要在正式场合使用，可以参考[这份配置文件](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example)。

先初始化GreatSQL：
```bash
mkdir -p /data/GreatSQL && chown -R mysql:mysql /data/GreatSQL
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf --initialize-insecure
```
**注意**：不要在生产环境中使用 `--initialize-insecure` 选项进行初始化安装，因为这么做的话，超级管理员root账号默认是空密码，任何人都可以使用该账号登录数据库，存在安全风险，本文中只是为了演示方便才这么做。

启动GreatSQL：
```bash
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf &
```
如果不出意外，则能正常启动GreatSQL。用同样的方法也完成对另外两个节点的初始化。

此外，建议把GreatSQL加入系统systemd服务中，方便管理。具体方法可以参考这篇文章：[利用systemd管理GreatSQL](../4-install-guide/8-greatsql-with-systemd.md)。

###  初始化MGR第一个节点
接下来准备初始化MGR的第一个节点，也称之为 **引导节点**。

修改 */etc/my.cnf* ，增加以下几行和MGR相关的配置参数：
```ini
[mysqld]
plugin_load_add='group_replication.so'
group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
group_replication_local_address= "172.16.16.10:33061"
group_replication_group_seeds= "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
report_host=172.16.16.10
```
选项 `report_host` 的作用是向MGR其他节点报告本节点使用的地址，避免某个服务器上有多个主机名时，可能无法正确找到对应关系而使得MGR无法启动的问题。此外，设置了 `report_host` 后，修改 `/etc/hosts` 系统文件加入各节点的地址及主机名这个步骤就不是必须的了。

另外，注意上面配置的端口写的是 **33061** 而不是 **3306**，这是为MGR服务指定专用的通信端口，区别于GreatSQL正常的读写服务端口。这里的 33061 端口号可以自定义，例如写成 12345 也可以，注意该端口不能被防火墙拦截。

利用这份配置文件，重启GreatSQL，之后就应该能看到已经成功加载 `group_replicaiton` 插件了：
```sql
greatsql> SHOW PLUGINS;
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
INSTALL PLUGIN group_replication SONAME 'group_replication.so';
```

接下来，创建MGR服务专用账户，并准备配置MGR服务通道：
```sql
-- 每个节点都要单独创建用户，因此这个操作没必要记录binlog并复制到其他节点
SET SESSION sql_log_bin=0;
CREATE USER repl@'%' IDENTIFIED WITH mysql_native_password BY 'repl';
GRANT BACKUP_ADMIN, REPLICATION SLAVE ON *.* TO `repl`@`%`;

-- 创建完用户后继续启用binlog记录
greatsql> SET SESSION sql_log_bin=1;

-- 配置MGR服务通道
-- 通道名字 group_replication_recovery 是固定的，不能修改
CHANGE REPLICATION SOURCE TO SOURCE_USER='repl', SOURCE_PASSWORD='repl' FOR CHANNEL 'group_replication_recovery';
```

接着执行下面的命令，将其设置为MGR的引导节点（只有第一个节点需要这么做）后即可直接启动MGR服务：
```sql
SET GLOBAL group_replication_bootstrap_group=ON;
START group_replication;
```
::: tip 提醒
当整个MGR集群重启时，第一个启动的节点也要先设置为引导模式，然后再启动其他节点。除此外，请勿设置引导模式。
:::

而后，查看MGR服务状态：
```sql
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-11d9-11ec-8f92-70b5e873a570 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```
第一个节点初始化完成。

###  继续设置另外两个节点
继续使用下面这份 */etc/my.cnf* 配置文件模板：
```ini
#my.cnf
[mysqld]
user = mysql
basedir=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
datadir=/data/GreatSQL
port=3306
server_id=113306
log-bin
log_replica_updates=1
gtid_mode=ON
enforce_gtid_consistency=ON

#mgr
plugin_load_add='group_replication.so'
group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
group_replication_local_address= "172.16.16.11:33061"
group_replication_group_seeds= "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
report_host=172.16.16.11
```
::: tip 提醒
上面的几个选项中，`server_id`、`group_replication_local_address` 和 `report_host` 这三个选项要修改为正确的值。在一个MGR集群中，各节点设置的 `server_id` 和 `server_uuid` 要是唯一的，但是 `group_replication_group_name` 的值要一样，这是该MGR集群的唯一标识。
:::

重启GreatSQL实例后（`report_host` 是只读选项，需要重启才能生效），创建MGR服务专用账号及配置MGR服务通道：
```sql
SET SESSION sql_log_bin=0;
CREATE USER repl@'%' IDENTIFIED WITH mysql_native_password BY 'repl';
GRANT BACKUP_ADMIN, REPLICATION SLAVE ON *.* TO `repl`@`%`;
SET SESSION sql_log_bin=1;

CHANGE REPLICATION SOURCE TO SOURCE_USER='repl', SOURCE_PASSWORD='repl' FOR CHANNEL 'group_replication_recovery';
```

接下来即可直接启动MGR服务（除了第一个节点外，其余节点都不需要再设置引导模式）：
```sql
START group_replication;
```
再次查看MGR节点状态：
```sql
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-11d9-11ec-8f92-70b5e873a570 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | 549b92bf-11d9-11ec-88e1-70b5e873a570 | 172.16.16.11 |        3306 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | 5596116c-11d9-11ec-8624-70b5e873a570 | 172.16.16.12 |        3306 | ONLINE       | SECONDARY   | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```
看到上面这个集群共有3个节点处于ONLINE状态，其中 *172.16.16.10* 是 **PRIMARY** 节点，其余两个都是 **SECONDARY** 节点，也就是说当前这个集群采用 **单主** 模式。如果采用多主模式，则所有节点的角色都是 **PRIMARY**。

###  向MGR集群中写入数据
接下来连接到 **PRIMARY** 节点，创建测试库表并写入数据：
```sql
-- 先连接进入GreatSQL
-- mysql -h172.16.16.10 -uroot -Spath/mysql.sock

greatsql> CREATE DATABASE mgr;
greatsql> USE MGR;
greatsql> CREATE TABLE t1(c1 int unsigned not null primary key);
greatsql> INSERT INTO t1 SELECT RAND()*10240;
greatsql> SELECT * FROM t1;
+------+
| c1   |
+------+
| 8078 |
+------+
```
再连接到其中一个 **SECONDARY** 节点，查看刚刚在 **PRIMARY** 写入的数据是否可以看到：
```sql
-- 先连接进入GreatSQL
-- mysql -h172.16.16.11 -uroot -Spath/mysql.sock
greatsql> USE mgr;
greatsql> SELECT * FROM t1;
+------+
| c1   |
+------+
| 8078 |
+------+
```
确认可以读取到该数据。

到这里，就完成了三节点MGR集群的安装部署。

## 使用GreatSQL Shell构建MGR

接下来介绍如何利用 GreatSQL Shell 基于 GreatSQL 8.4.4-4 构建一个三节点的MGR集群。

::: tip 小贴士
只有 GreatSQL Shell 支持仲裁节点（投票节点）特性，MySQL Shell 社区版不支持。
:::

###  安装准备
准备好下面三台服务器：

| IP           | 端口 | 角色 |
| ------------ | ---- | ---- |
| 172.16.16.10 | 3306 | mgr1 |
| 172.16.16.11 | 3306 | mgr2 |
| 172.16.16.12 | 3306 | mgr3 |

确保三个节点间的网络是可以互通的，并且没有针对3306和33061端口的防火墙拦截规则。

打开 [GreatSQL Shell 二进制包文件](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25) 并下载对应版本安装包，更推荐利用 [Docker 运行 GreatSQL Shell](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell)，更便捷省事。

下载时要选择和操作系统相同 glibc 版本的二进制包，用下面方法确认

```bash
$ ldd --version | grep GNU
ldd (GNU libc) 2.28

$ uname -p
x86_64
```
可以看到是 x86_64 平台下的 glibc 2.28 版本，因此选择二进制包文件：**greatsql-shell-8.0.32-25-glibc2.28-x86_64.tar.xz**。

由于编译环境限制，没有提供全平台的 GreatSQL Shell 二进制包，如果有需要，请参考 [GreatSQL Shell Build仓库](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build) 自行构建适合您的运行环境的二进制包文件。

运行 GreatSQL Shell 8.0.32-25 需要依赖 Python 3.8 环境，需要先执行下面命令完成相关依赖安装

```bash
yum install -y libssh python38 python38-libs python38-pyyaml
pip3.8 install --user certifi pyclamd
```

接下来直接利用 GreatSQL Shell 部署MGR

###  利用 GreatSQL Shell 构建MGR集群
利用 GreatSQL Shell 构建MGR集群比较简单，主要有几个步骤：
1. 检查实例是否满足条件。
2. 创建并初始化一个集群。
3. 逐个添加实例。

首先，用管理员账号 root 连接到第一个节点：
```bash
# 在本地通过socket方式登入
$ mysqlsh -Spath/mysql.sock -u root

Please provide the password for 'root@.%2Fmysql.sock': ********
Save password for 'root@.%2Fmysql.sock'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.32
...
```
执行命令 `\status` 查看当前节点的状态，确认连接正常可用。

执行 `dba.configureInstance()` 命令开始检查当前实例是否满足安装MGR集群的条件，如果不满足可以直接配置成为MGR集群的一个节点：
```js
MySQL  localhost  JS > dba.configureInstance()

Configuring local MySQL instance listening at port 3306 for use in an InnoDB cluster...

This instance reports its own address as 172.16.16.10:3306

#提示当前的用户是管理员，不能直接用于MGR集群，需要新建一个账号
ERROR: User 'root' can only connect from 'localhost'. New account(s) with proper source address specification to allow remote connection from all instances must be created to manage the cluster.

1) Create remotely usable account for 'root' with same grants and password
2) Create a new admin account for InnoDB cluster with minimal required grants
3) Ignore and continue
4) Cancel

Please select an option [1]: 2 <-- 这里选择方案2，即创建一个最小权限账号

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
```js
-- 先连接进入GreatSQL
-- mysqlsh --uri GreatSQL@172.16.16.10:3306
Please provide the password for 'GreatSQL@172.16.16.10:3306': ********
Save password for 'GreatSQL@172.16.16.10:3306'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.32
...

#定义一个变量名c，方便下面引用
MySQL  172.16.16.10:3306 ssl  JS > c = dba.createCluster('MGR1');

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

::: tip 提示
参数 `group_replication_communication_stack` 的默认值是 XCOM。但是在利用 GreatSQL Shell 的 `create_cluster()` 函数创建并初始化 MGR 集群时，参数 `communicationStack` 默认值则是 MYSQL，这里存在差异。因此，建议在这里显式指定 `communicationStack` 参数值为 XCOM。
:::

例如，执行下面的命令修改设置：
```js
c = dba.createCluster('MGR1', {"communicationStack": "xcom"});
```

如果是 JS 风格的写法则是下面这样的：

```js
dba.createCluster("MGR1", {"communicationStack": "xcom"})
```

::: warning 风险提醒
因目前采用 MYSQL 协议可能存在风险，所以建议采用 XCOM 协议。

采用 MYSQL 协议的风险可参考文章：[新的MGR MySQL协议报错BUG](https://mp.weixin.qq.com/s/N-poOiG8zAAmLI0-S79zDg)。
:::

接下来，用同样方法先用 root 账号分别登入到另外两个节点，完成节点的检查并创建最小权限级别用户（此过程略过。。。注意各节点上创建的用户名、密码都要一致），之后回到第一个节点，执行 `addInstance()` 添加另外两个节点。
```js
MySQL  172.16.16.10:3306 ssl JS > c.addInstance('GreatSQL@172.16.16.11:3306');<--这里要指定MGR专用账号

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
```js
MySQL  172.16.16.10:3306 ssl  JS > c.describe()
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

至此，利用 GreatSQL Shell 构建一个三节点的MGR集群做好了，可以尝试向 Primary 节点写入数据观察测试。

###   GreatSQL Shell 接管现存的MGR集群
对于已经在运行中的MGR集群，也是可以用 GreatSQL Shell 接管的。只需要在调用 `createCluster()` 函数时，加上 `"adoptFromGR":"true"` 选项即可。实际上不加这个选项的话，GreatSQL Shell 也会自动检测到该MGR集群已存在，并询问是否要接管。

在这里简单演示下：
```js
# 不加上 "adoptFromGr":"true" 选项
MySQL  172.16.16.10:3306 ssl  JS > c = dba.createCluster('MGR1');

A new InnoDB cluster will be created on instance '172.16.16.10:3306'.

You are connected to an instance that belongs to an unmanaged replication group.
Do you want to setup an InnoDB cluster based on this replication group? [Y/n]:
```
可以看到，会有提示信息询问是否要接管。

如果加上 `"adoptFromGr":"true"` 选项，则会直接创建集群，不再询问：
```js
MySQL  172.16.16.10:3306 ssl JS > c=dba.createCluster('MGR1', {"adoptFromGr":"true"});

A new InnoDB cluster will be created based on the existing replication group on instance '172.16.16.10:3306'.

Creating InnoDB cluster 'MGR1' on '172.16.16.10:3306'...

Adding Seed Instance...
Adding Instance '172.16.16.10:3306'...
Adding Instance '172.16.16.11:3306'...
Adding Instance '172.16.16.12:3306'...
...
```

如果是MGR集群的metadata发生变化，这时候无论调用 `dba.getCluster()` 还是 `dba.createCluster()` 都可能会报告类似下面的错误：
```
Dba.getCluster: Unable to get an InnoDB cluster handle. The instance '192.168.6.27:3306' may belong to a different cluster from the one registered in the Metadata since the value of 'group_replication_group_name' does not match the one registered in the Metadata: possible split-brain scenario. Please retry while connected to another member of the cluster. (RuntimeError)
```

这种情况下，可以调用 `dba.dropMetadataSchema()` 函数删除元数据，再调用 `dba.createCluster()` 接管集群：
```js
#确保不影响正常业务的话，删除无用MGR元数据
MySQL  172.16.16.10:3306 ssl  JS > dba.dropMetadataSchema()
Are you sure you want to remove the Metadata? [y/N]: y

Metadata Schema successfully removed.

#接管现有集群
 MySQL  172.16.16.10:3306 ssl  JS > c=dba.createCluster('MGR1', {"adoptFromGr":"true"})
...
```
这样就可以接管了

###  使用 GreatSQL Shell 的窍门
在 GreatSQL Shell 中，也是可以启用pager（分页器）的，像下面这样设置即可：
```js
mysqlsh> shell.enablePager()
mysqlsh> shell.options["pager"]="less -i -n -S";
Pager has been set to 'less -i -n -S'.
```

在用 GreatSQL Shell 连接时，也可以加上 `--dba-log-sql=2 --log-level=debug3` 参数，以启用debug模式，并记录运行过程中实际调用的SQL命令，默认日志文件是 `~/.mysqlsh/mysqlsh.log`。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
