# MGR Installation & Deployment

---

This article describes how to build a three-node MGR cluster based on GreatSQL 8.4.4-4 using the manual method and the MySQL Shell for GreatSQL (hereinafter referred to as GreatSQL Shell) method.

## Building MGR Manually

### Installation Preparation

Prepare the following three servers:

| IP           | Port | Role |
| ------------ | ---- | ---- |
| 172.16.16.10 | 3306 | mgr1 |
| 172.16.16.11 | 3306 | mgr2 |
| 172.16.16.12 | 3306 | mgr3 |

Make sure the network between the three nodes is reachable, and there are no firewall interception rules for ports 3306 and 33061.

Download the GreatSQL binary package from: *https://gitee.com/GreatSQL/GreatSQL/releases* .

This article uses CentOS x86_64 as an example. The downloaded binary package is named: `GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz`. Place it in the `/usr/local` directory and extract it:
```bash
$ cd /usr/local
$ tar xf GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64.tar.xz
$ cd GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64
$ ls

bin    COPYING-jemalloc  include  LICENSE         LICENSE-test  mysqlrouter-log-rotate  README.router  run    support-files
cmake  docs              lib      LICENSE.router  man           README                  README-test    share  var
```

### Initializing GreatSQL
First prepare the */etc/my.cnf* configuration file:
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
This article only aims to start GreatSQL normally and deploy MGR, so this configuration file is extremely simple. If you want to use it in a formal environment, refer to [this configuration file](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example).

First initialize GreatSQL:
```bash
mkdir -p /data/GreatSQL && chown -R mysql:mysql /data/GreatSQL
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf --initialize-insecure
```
**Note**: Do not use the `--initialize-insecure` option for initialization in production environments, because the super administrator root account will have an empty password by default, and anyone can log in to the database with this account, which is a security risk. It is only used here for demonstration convenience.

Start GreatSQL:
```bash
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf &
```
If nothing unexpected happens, GreatSQL will start normally. Use the same method to complete the initialization of the other two nodes.

In addition, it is recommended to add GreatSQL to the systemd service of the system for easier management. For the specific method, refer to this article: [Managing GreatSQL with systemd](../4-install-guide/8-greatsql-with-systemd.md).

### Initializing the First MGR Node
Next, prepare to initialize the first node of MGR, also called the **bootstrap node**.

Modify */etc/my.cnf* and add the following MGR-related configuration parameters:
```ini
[mysqld]
plugin_load_add='group_replication.so'
group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
group_replication_local_address= "172.16.16.10:33061"
group_replication_group_seeds= "172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061"
report_host=172.16.16.10
```
The role of the `report_host` option is to report the address used by this node to other MGR nodes, avoiding the problem that MGR cannot start because the correct mapping cannot be found when a server has multiple hostnames. In addition, after setting `report_host`, the step of modifying the `/etc/hosts` system file to add the addresses and hostnames of each node is no longer required.

Also, note that the port configured above is **33061** instead of **3306**. This is a dedicated communication port for the MGR service, distinct from the normal read/write service port of GreatSQL. The 33061 port number here can be customized, for example, set to 12345. Note that this port must not be intercepted by the firewall.

Using this configuration file, restart GreatSQL. After that, you should be able to see that the `group_replication` plugin has been successfully loaded:
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

If it is not loaded correctly, you can also log in to GreatSQL and manually load this plugin:
```sql
INSTALL PLUGIN group_replication SONAME 'group_replication.so';
```

Next, create a dedicated account for the MGR service and prepare to configure the MGR service channel:
```sql
-- A user must be created separately on each node, so there is no need to record this operation in the binlog and replicate it to other nodes
SET SESSION sql_log_bin=0;
CREATE USER repl@'%' IDENTIFIED WITH mysql_native_password BY 'repl';
GRANT BACKUP_ADMIN, REPLICATION SLAVE ON *.* TO `repl`@`%`;

-- Re-enable binlog recording after the user is created
greatsql> SET SESSION sql_log_bin=1;

-- Configure the MGR service channel
-- The channel name group_replication_recovery is fixed and cannot be modified
CHANGE REPLICATION SOURCE TO SOURCE_USER='repl', SOURCE_PASSWORD='repl' FOR CHANNEL 'group_replication_recovery';
```

Then execute the following command to set it as the bootstrap node of MGR (only the first node needs to do this), after which you can directly start the MGR service:
```sql
SET GLOBAL group_replication_bootstrap_group=ON;
START group_replication;
```
::: tip Reminder
When the entire MGR cluster is restarted, the first node to start must also be set to bootstrap mode first, and then the other nodes can be started. Apart from that, do not set bootstrap mode.
:::

Then check the MGR service status:
```sql
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST  | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-11d9-11ec-8f92-70b5e873a570 | 172.16.16.10 |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
+---------------------------+--------------------------------------+--------------+-------------+--------------+-------------+----------------+
```
The first node has been initialized.

### Setting Up the Other Two Nodes
Continue to use the following */etc/my.cnf* configuration file template:
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
::: tip Reminder
Among the options above, `server_id`, `group_replication_local_address`, and `report_host` must be modified to the correct values. In an MGR cluster, the `server_id` and `server_uuid` set on each node must be unique, but the value of `group_replication_group_name` must be the same; it is the unique identifier of this MGR cluster.
:::

After restarting the GreatSQL instance (`report_host` is a read-only option and takes effect only after a restart), create the dedicated account for the MGR service and configure the MGR service channel:
```sql
SET SESSION sql_log_bin=0;
CREATE USER repl@'%' IDENTIFIED WITH mysql_native_password BY 'repl';
GRANT BACKUP_ADMIN, REPLICATION SLAVE ON *.* TO `repl`@`%`;
SET SESSION sql_log_bin=1;

CHANGE REPLICATION SOURCE TO SOURCE_USER='repl', SOURCE_PASSWORD='repl' FOR CHANNEL 'group_replication_recovery';
```

Then you can directly start the MGR service (except for the first node, the other nodes do not need to set bootstrap mode):
```sql
START group_replication;
```
Check the MGR node status again:
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
You can see that the cluster above has 3 nodes in the ONLINE state, of which *172.16.16.10* is the **PRIMARY** node, and the other two are **SECONDARY** nodes, which means the current cluster uses the **single-primary** mode. If the multi-primary mode is used, the role of all nodes is **PRIMARY**.

### Writing Data to the MGR Cluster
Next, connect to the **PRIMARY** node, create a test database and table, and write data:
```sql
-- First connect to GreatSQL
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
Then connect to one of the **SECONDARY** nodes and check whether the data just written to the **PRIMARY** can be seen:
```sql
-- First connect to GreatSQL
-- mysql -h172.16.16.11 -uroot -Spath/mysql.sock
greatsql> USE mgr;
greatsql> SELECT * FROM t1;
+------+
| c1   |
+------+
| 8078 |
+------+
```
Confirm that the data can be read.

At this point, the installation and deployment of the three-node MGR cluster is complete.

## Building MGR with GreatSQL Shell

Next, we introduce how to build a three-node MGR cluster based on GreatSQL 8.4.4-4 using GreatSQL Shell.

::: tip Tip
The arbitrator node (voting node) is a feature natively supported by the GreatSQL database. **GreatSQL Shell can correctly recognize and operate on this feature**, while the MySQL Shell community edition does not yet support recognizing GreatSQL's arbitrator node (voting node) and cannot perform corresponding operations.
:::

### Installation Preparation
Prepare the following three servers:

| IP           | Port | Role |
| ------------ | ---- | ---- |
| 172.16.16.10 | 3306 | mgr1 |
| 172.16.16.11 | 3306 | mgr2 |
| 172.16.16.12 | 3306 | mgr3 |

Make sure the network between the three nodes is reachable, and there are no firewall interception rules for ports 3306 and 33061.

Open the [GreatSQL Shell binary package](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-25) and download the installation package of the corresponding version. It is more recommended to use [Docker to run GreatSQL Shell](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell), which is more convenient and saves effort.

When downloading, choose the binary package with the same glibc version as the operating system. Use the following method to confirm:

```bash
$ ldd --version | grep GNU
ldd (GNU libc) 2.28

$ uname -p
x86_64
```
It can be seen that it is the glibc 2.28 version on the x86_64 platform, so choose the binary package: **greatsql-shell-8.0.32-25-glibc2.28-x86_64.tar.xz**.

Due to compilation environment limitations, GreatSQL Shell binary packages are not provided for all platforms. If needed, refer to the [GreatSQL Shell Build repository](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build) to build a binary package suitable for your runtime environment.

Running GreatSQL Shell 8.0.32-25 requires the Python 3.8 environment. Execute the following commands first to complete the installation of related dependencies:

```bash
yum install -y libssh python38 python38-libs python38-pyyaml
pip3.8 install --user certifi pyclamd
```

Next, use GreatSQL Shell directly to deploy MGR.

### Building an MGR Cluster with GreatSQL Shell
Building an MGR cluster with GreatSQL Shell is relatively simple and mainly involves several steps:
1. Check whether the instances meet the requirements.
2. Create and initialize a cluster.
3. Add instances one by one.

First, connect to the first node with the administrator account root:
```bash
# Log in locally via the socket
$ mysqlsh -Spath/mysql.sock -u root

Please provide the password for 'root@.%2Fmysql.sock': ********
Save password for 'root@.%2Fmysql.sock'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.32
...
```
Execute the command `\status` to view the status of the current node and confirm that the connection is working properly.

Execute the `dba.configureInstance()` command to start checking whether the current instance meets the conditions for installing an MGR cluster. If not, it can be directly configured as a node of the MGR cluster:
```js
MySQL  localhost  JS > dba.configureInstance()

Configuring local MySQL instance listening at port 3306 for use in an InnoDB cluster...

This instance reports its own address as 172.16.16.10:3306

#The prompt indicates that the current user is an administrator and cannot be used directly for the MGR cluster; a new account needs to be created
ERROR: User 'root' can only connect from 'localhost'. New account(s) with proper source address specification to allow remote connection from all instances must be created to manage the cluster.

1) Create remotely usable account for 'root' with same grants and password
2) Create a new admin account for InnoDB cluster with minimal required grants
3) Ignore and continue
4) Cancel

Please select an option [1]: 2 <-- Here choose option 2, i.e. create an account with minimal privileges

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
After completing the check and creating the new user, exit the current administrator account and log in with the newly created dedicated MGR account to prepare for creating a new cluster:
```js
-- First connect to GreatSQL
-- mysqlsh --uri GreatSQL@172.16.16.10:3306
Please provide the password for 'GreatSQL@172.16.16.10:3306': ********
Save password for 'GreatSQL@172.16.16.10:3306'? [Y]es/[N]o/Ne[v]er (default No): yes
MySQL Shell 8.0.32
...

#Define a variable name c for easy reference below
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
This completes the initialization of the MGR cluster and the addition of the first node (the bootstrap node).

::: tip Note
The default value of the `group_replication_communication_stack` parameter is XCOM. However, when using the GreatSQL Shell `create_cluster()` function to create and initialize an MGR cluster, the default value of the `communicationStack` parameter is MySQL. There is a difference here. Therefore, it is recommended to explicitly specify the `communicationStack` parameter value as XCOM.
:::

For example, execute the following command to modify the setting:
```js
c = dba.createCluster('MGR1', {"communicationStack": "xcom"});
```

If written in JS style, it looks like this:

```js
dba.createCluster("MGR1", {"communicationStack": "xcom"})
```

::: warning Risk Reminder
Because using the MySQL protocol currently carries risks, it is recommended to use the XCOM protocol.

For the risks of using the MySQL protocol, refer to the article: [New MGR MySQL Protocol BUG Report](https://mp.weixin.qq.com/s/N-poOiG8zAAmLI0-S79zDg).
:::

Next, use the same method to log in to the other two nodes with the root account respectively, complete the node check and create a minimal-privilege user (this process is omitted... note that the username and password created on each node must be the same). Then return to the first node and execute `addInstance()` to add the other two nodes.
```js
MySQL  172.16.16.10:3306 ssl JS > c.addInstance('GreatSQL@172.16.16.11:3306');<--The dedicated MGR account must be specified here

WARNING: A GTID set check of the MySQL instance at '172.16.16.11:3306' determined that it contains transactions that do not originate from the cluster, which must be discarded before it can join the cluster.

172.16.16.11:3306 has the following errant GTIDs that do not exist in the cluster:
b05c0838-6850-11ec-a06b-00155d064000:1

WARNING: Discarding these extra GTID events can either be done manually or by completely overwriting the state of 172.16.16.11:3306 with a physical snapshot from an existing cluster member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

Having extra GTID events is not expected, and it is recommended to investigate this further and ensure that the data can be removed prior to choosing the clone recovery method.

Please select a recovery method [C]lone/[A]bort (default Abort): Clone  <-- Choose Clone to fully copy data from the first node

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

NOTE: 172.16.16.11:3306 is shutting down...  <-- Data Clone completed, preparing to restart the instance. If the instance cannot restart automatically, it needs to be started manually

* Waiting for server restart... ready
* 172.16.16.11:3306 has restarted, waiting for clone to finish...
** Stage RESTART: Completed
* Clone process has finished: 72.43 MB transferred in about 1 second (~72.43 MB/s)

State recovery already finished for '172.16.16.11:3306'

The instance '172.16.16.11:3306' was successfully added to the cluster.  <-- The new instance was added successfully
```
Use the same method to add the 172.16.16.12:3306 instance to the cluster as well.

Now, a three-node MGR cluster has been deployed. Let's confirm it:
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
Or execute `c.status()` to print more information about the cluster.

At this point, a three-node MGR cluster has been built with GreatSQL Shell. You can try writing data to the Primary node to observe and test.

### GreatSQL Shell Adopting an Existing MGR Cluster
GreatSQL Shell can also adopt an MGR cluster that is already running. You only need to add the `"adoptFromGR":"true"` option when calling the `createCluster()` function. In fact, even without this option, GreatSQL Shell will automatically detect that the MGR cluster already exists and ask whether to adopt it.

Here is a simple demonstration:
```js
# Without the "adoptFromGr":"true" option
MySQL  172.16.16.10:3306 ssl  JS > c = dba.createCluster('MGR1');

A new InnoDB cluster will be created on instance '172.16.16.10:3306'.

You are connected to an instance that belongs to an unmanaged replication group.
Do you want to setup an InnoDB cluster based on this replication group? [Y/n]:
```
As you can see, a prompt message asks whether to adopt it.

If the `"adoptFromGr":"true"` option is added, the cluster will be created directly without asking:
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

If the metadata of the MGR cluster changes, then whether `dba.getCluster()` or `dba.createCluster()` is called, an error similar to the following may be reported:
```
Dba.getCluster: Unable to get an InnoDB cluster handle. The instance '192.168.6.27:3306' may belong to a different cluster from the one registered in the Metadata since the value of 'group_replication_group_name' does not match the one registered in the Metadata: possible split-brain scenario. Please retry while connected to another member of the cluster. (RuntimeError)
```

In this case, you can call the `dba.dropMetadataSchema()` function to delete the metadata, and then call `dba.createCluster()` to adopt the cluster:
```js
#If it is confirmed that normal business will not be affected, delete the useless MGR metadata
MySQL  172.16.16.10:3306 ssl  JS > dba.dropMetadataSchema()
Are you sure you want to remove the Metadata? [y/N]: y

Metadata Schema successfully removed.

#Adopt the existing cluster
 MySQL  172.16.16.10:3306 ssl  JS > c=dba.createCluster('MGR1', {"adoptFromGr":"true"})
...
```
Then the cluster can be adopted.

### Tips for Using GreatSQL Shell
In GreatSQL Shell, you can also enable the pager, as shown below:
```js
mysqlsh> shell.enablePager()
mysqlsh> shell.options["pager"]="less -i -n -S";
Pager has been set to 'less -i -n -S'.
```

When connecting with GreatSQL Shell, you can also add the `--dba-log-sql=2 --log-level=debug3` parameters to enable debug mode and record the actual SQL commands called during the run. The default log file is `~/.mysqlsh/mysqlsh.log`.


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
