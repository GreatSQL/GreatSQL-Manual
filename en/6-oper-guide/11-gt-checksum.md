# gt-checksum

## About gt-checksum

gt-checksum is a static database checksum and repair tool open-sourced by the GreatSQL community. It supports mainstream databases such as MySQL and Oracle.

## Features
---
The data checksum & repair tools most commonly used by MySQL DBAs are [pt-table-checksum](./10-6-pt-replication.md#pt-table-checksum) and [pt-table-sync](./10-6-pt-replication.md#pt-table-sync) in Percona Toolkit. However, these two tools do not support MySQL MGR architecture, the common domestic "cloud migration" business scenarios (moving to and from the cloud), or heterogeneous databases such as MySQL and Oracle.

The gt-checksum tool open-sourced by GreatSQL can meet the above various business requirement scenarios and solve these pain points.

The gt-checksum tool supports the following common business requirement scenarios:
1. **MySQL source-replica replication**: When replication is interrupted and only discovered after a long time, and the amount of data differing between the source and replica is too large, usually the only option is basically to rebuild the replica. If pt-table-checksum is used to first verify data consistency between the source and replica and then pt-table-sync is used to repair the differing data, this process takes a very long time and the time cost is too high.
2. **MySQL MGR group replication**: When MySQL MGR crashes for some reason and the whole cluster reports errors and exits, or a node exits abnormally, restoring the MGR cluster generally requires first checking data consistency among the nodes. At this time, to save effort, one node is usually chosen as the primary node and the other secondary nodes directly replicate data to rebuild, which takes a very long time and has a high time cost.
3. **Cloud migration business scenarios**: Currently there is a lot of demand for moving to and from the cloud. During this process, a large amount of data migration and verification work is required. If a character set change causes garbled characters in special data or other situations, or if a data migration tool has a bug during migration or data is abnormal but the migration still succeeds, a data verification must be performed after the migration is completed to be assured.
4. **Heterogeneous migration scenarios**: Sometimes we encounter heterogeneous data migration scenarios, for example, migrating from Oracle to MySQL. There are usually different character sets and different data types, and a data verification is also required after the migration is completed to be assured.
5. **Regular verification scenarios**: As a DBA maintaining a high availability architecture, in order to ensure a quick and reliable switchover when the primary node is abnormal, the data consistency among the nodes must be guaranteed, so data verification work needs to be performed regularly.

All the above scenarios can be satisfied by using the gt-checksum tool.

## Download
---
You can download the pre-compiled binary package [here](https://gitee.com/GreatSQL/gt-checksum/releases). It has been tested on Ubuntu, CentOS, RHEL and many others.

If you need to verify an Oracle database, you also need to first download the driver of the corresponding Oracle database version and configure the driver to make it effective. For example, if the database to be verified is Oracle 11-2, you need to download the Oracle 11-2 driver and make it effective; otherwise, an error will be reported when connecting to Oracle. For detailed methods, see below: [**Downloading and Configuring the Oracle Driver**](#downloading-and-configuring-the-oracle-driver).

## Quick Start
---
```bash
# Without any parameters
$ ./gt-checksum
If no parameters are loaded, view the command with --help or -h

# View the version number
$ ./gt-checksum -v
gt-checksum version 1.2.1

# View the usage help
$ ./gt-checksum -h
NAME:
   gt-checksum - A opensource table and data checksum tool by GreatSQL

USAGE:
   gt-checksum [global options] command [command options] [arguments...]
...

# Database authorization
# To run the gt-checksum tool, at least the following privileges need to be granted
# MySQL side
# 1. Global privileges
#  a. `REPLICATION CLIENT`
#  b. `SESSION_VARIABLES_ADMIN`, required for MySQL 8.0, not required for MySQL 5.7
# 2. Data objects to be verified
#  a. If `datafix=file`, only the `SELECT` privilege is required
#  b. If `datafix=table`, the `SELECT, INSERT, DELETE` privileges are required; if table structure inconsistency also needs to be repaired, the `ALTER` privilege is required
#
# Assume that db1.t1 is to be verified and repaired; the privileges can be granted as follows

greatsql> GRANT REPLICATION CLIENT, SESSION_VARIABLES_ADMIN ON *.* to ...;
greatsql> GRANT SELECT, INSERT, DELETE ON db1.t1 to ...;

# Oracle side
# 1. Global privileges
#  a. `SELECT ANY DICTIONARY`
# 2. Data objects to be verified
#  a. If `datafix=file`, only the `SELECT ANY TABLE` privilege is required
#  b. If `datafix=table`, the `SELECT ANY TABLE, INSERT ANY TABLE, DELETE ANY TABLE` privileges are required

# Specify the configuration file and start the data verification, for example:
$ ./gt-checksum -f ./gc.conf
-- gt-checksum init configuration files --
-- gt-checksum init log files --
-- gt-checksum init check parameter --
-- gt-checksum init check table name --
-- gt-checksum init check table column --
-- gt-checksum init check table index column --
-- gt-checksum init source and dest transaction snapshoot conn pool --
-- gt-checksum init cehck table query plan and check data --
begin checkSum index table db1.t1
[█████████████████████████████████████████████████████████████████████████████████████████████████████████████████]113%  task:     678/600
table db1.t1 checksum complete

** gt-checksum Overview of results **
Check time:  73.81s (Seconds)
Schema  Table                   IndexCol                                checkMod        Rows            Differences     Datafix
db1     t1                      ol_w_id,ol_d_id,ol_o_id,ol_number       rows            5995934,5995918 yes             file


# Execute the data verification by passing parameters on the command line
$ ./gt-checksum -S type=mysql,user=checksum,passwd=Checksum@123,host=172.16.0.1,port=3306,charset=utf8 -D type=mysql,user=checksum,passwd=Checksum@123,host=172.16.0.2,port=3306,charset=utf8 -t test.t2 -nit yes
-- gt-checksum init configuration files --
-- gt-checksum init log files --
-- gt-checksum init check parameter --
-- gt-checksum init check table name --
-- gt-checksum init check table column --
-- gt-checksum init check table index column --
-- gt-checksum init source and dest transaction snapshoot conn pool --
-- gt-checksum init cehck table query plan and check data --
begin checkSum index table SCOTT.A5
[█                    ]100%  task:       1/1
table SCOTT.A5 checksum complete

** gt-checksum Overview of results **
Check time:  0.29s (Seconds)
Schema  Table   IndexCol        checkMod        Rows    Differences     Datafix
test    t2      id              rows            10,10   no              file
```

## Downloading and Configuring the Oracle Driver
---
If you need to verify an Oracle database, you also need to first download the driver of the corresponding Oracle database version. For example, if the database to be verified is Oracle 11-2, you need to download the Oracle 11-2 driver and make it effective; otherwise, an error will be reported when connecting to Oracle.

### Downloading Oracle Instant Client
Download the free Basic or Basic Light package from [https://www.oracle.com/database/technologies/instant-client/downloads.html](https://www.oracle.com/database/technologies/instant-client/downloads.html).

- oracle basic client, instantclient-basic-linux.x64-11.2.0.4.0.zip

- oracle sqlplus, instantclient-sqlplus-linux.x64-11.2.0.4.0.zip

- oracle sdk, instantclient-sdk-linux.x64-11.2.0.4.0.zip

### Configuring the Oracle Client to Take Effect
```shell
$ unzip instantclient-basic-linux.x64-11.2.0.4.0.zip
$ unzip instantclient-sqlplus-linux.x64-11.2.0.4.0.zip
$ unzip instantclient-sdk-linux.x64-11.2.0.4.0.zip
$ mv instantclient_11_2 /usr/local
$ echo "export LD_LIBRARY_PATH=/usr/local/instantclient_11_2:$LD_LIBRARY_PATH" >> /etc/profile
$ source /etc/profile
```

## Building from Source
The gt-checksum tool is developed in the GO language, and you can compile and generate the binary file yourself.

The build environment requires golang 1.17 or later.

Please refer to the following method to download the source code and compile it:
```shell
$ git clone https://gitee.com/GreatSQL/gt-checksum.git
$ go build -o gt-checksum gt-checksum.go
$ chmod +x gt-checksum
$ mv gt-checksum /usr/local/bin
```

You can also compile directly in a Docker environment. On the basis of an already prepared Docker runtime environment, execute the following operations:
```shell
$ git clone https://gitee.com/GreatSQL/gt-checksum.git
$ cd gt-checksum
$ DOCKER_BUILDKIT=1 docker build --build-arg VERSION=v1.2.1 -f Dockerfile -o ./ .
$ cd gt-checksum-v1.2.1
$ ./gt-checksum -v
gt-checksum version 1.2.1
```
The compilation is complete and you can start playing happily.

## Documentation
---
- [gt-checksum manual](https://gitee.com/GreatSQL/gt-checksum/blob/master/docs/gt-checksum-manual.md)


## Version History
---
- [Version history](https://gitee.com/GreatSQL/gt-checksum/blob/master/relnotes/CHANGELOG.zh-CN.md)


## Known Defects
---
As of the latest 1.2.1 version, when a table contains multiple completely duplicate rows, the verification result may be inaccurate. For details, see [Known Defects](https://gitee.com/GreatSQL/gt-checksum/blob/master/docs/gt-checksum-manual.md#已知缺陷).

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
