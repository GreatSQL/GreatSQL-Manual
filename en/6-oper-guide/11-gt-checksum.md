# gt-checksum

## About gt-checksum

gt-checksum is an open-source static database checksum and repair tool released by the GreatSQL community. It supports mainstream databases such as MySQL and Oracle.

## Features
---
The most commonly used data checksum & repair tools for MySQL DBAs should be [pt-table-checksum](./10-6-pt-replication.md#pt-table-checksum) and [pt-table-sync](./10-6-pt-replication.md#pt-table-sync) from Percona Toolkit. However, these two tools do not support the MySQL MGR architecture, nor do they support common business scenarios in China such as migrating workloads to and from the cloud, or heterogeneous database scenarios such as between MySQL and Oracle.

The open-source gt-checksum tool from GreatSQL can meet the various business needs above and resolve these pain points.

The gt-checksum tool supports the following common business scenarios:
1. **MySQL source-replica replication**: If a source-replica replication interruption is discovered long after it occurred, and the amount of divergent data between the source and the replica is too large, the only option at this point is usually to rebuild the replica. If pt-table-checksum is used to check the data consistency between the source and the replica first, and then pt-table-sync is used to repair the divergent data, this process takes an extremely long time, and the time cost is too high.
2. **MySQL MGR group replication**: If the MySQL MGR cluster crashes and exits with errors for some reason, or a node exits abnormally, recovering the MGR cluster generally requires first checking the data consistency between nodes. At this point, for convenience, one node is usually chosen as the primary and the remaining secondary nodes directly copy data to rebuild, which takes an extremely long time and has a high time cost.
3. **Cloud migration scenarios (moving workloads to and from the cloud)**: There are many business needs for migrating workloads to and from the cloud. This process involves a large amount of data migration and checksum work. If the character set changes cause special data to become garbled, or if the data migration tool has bugs or data anomalies during migration yet still completes the migration successfully, a data checksum after the migration is necessary to be confident.
4. **Heterogeneous migration scenarios**: Sometimes we encounter heterogeneous data migration scenarios, for example migrating from Oracle to MySQL. There are usually differences in character sets and data types, so a data checksum after the migration is also necessary to be confident.
5. **Periodic checksum scenarios**: As a DBA maintaining a High Availability architecture, to ensure fast and confident switchover when the primary node fails, the data consistency between nodes must be guaranteed, so data checksum work needs to be performed periodically.

All the above scenarios can be satisfied with the gt-checksum tool.

## Download
---
Precompiled binary packages can be downloaded [here](https://gitee.com/GreatSQL/gt-checksum/releases). They have been tested on Ubuntu, CentOS, RHEL and other platforms.

If you need to check an Oracle database, you also need to download the driver matching the Oracle database version and configure it to take effect. For example, if the database to be checked is Oracle 11-2, download the Oracle 11-2 driver and make it effective; otherwise, connecting to Oracle will report an error. For details, see [**Downloading and Configuring the Oracle Driver**](#downloading-and-configuring-the-oracle-driver) below.

## Quick Run
---
```bash
# Run without any parameters
$ ./gt-checksum
If no parameters are loaded, view the command with --help or -h

# View the version
$ ./gt-checksum -v
gt-checksum version 1.2.1

# View usage help
$ ./gt-checksum -h
NAME:
   gt-checksum - A opensource table and data checksum tool by GreatSQL

USAGE:
   gt-checksum [global options] command [command options] [arguments...]
...

# Database privileges
# To run the gt-checksum tool, at least the following privileges need to be granted
# MySQL side
# 1. Global privileges
#  a. `REPLICATION CLIENT`
#  b. `SESSION_VARIABLES_ADMIN`, required for MySQL 8.0, not required for MySQL 5.7
# 2. Objects to be checked
#  a. If `datafix=file`, only the `SELECT` privilege is required
#  b. If `datafix=table`, the `SELECT`, `INSERT`, `DELETE` privileges are required. If the table structure inconsistencies also need to be repaired, the `ALTER` privilege is required
#
# Assuming db1.t1 needs to be checked and repaired, grant the privileges as follows

greatsql> GRANT REPLICATION CLIENT, SESSION_VARIABLES_ADMIN ON *.* to ...;
greatsql> GRANT SELECT, INSERT, DELETE ON db1.t1 to ...;

# Oracle side
# 1. Global privileges
#  a. `SELECT ANY DICTIONARY`
# 2. Objects to be checked
#  a. If `datafix=file`, only the `SELECT ANY TABLE` privilege is required
#  b. If `datafix=table`, the `SELECT ANY TABLE`, `INSERT ANY TABLE`, `DELETE ANY TABLE` privileges are required

# Specify the configuration file and start the data checksum, for example:
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


# Run the data checksum by passing parameters on the command line
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
If you need to check an Oracle database, you also need to download the driver matching the Oracle database version first. For example, if the database to be checked is Oracle 11-2, download the Oracle 11-2 driver and make it effective; otherwise, connecting to Oracle will report an error.

### Downloading Oracle Instant Client
Download the free Basic or Basic Light package from [https://www.oracle.com/database/technologies/instant-client/downloads.html](https://www.oracle.com/database/technologies/instant-client/downloads.html).

- oracle basic client, instantclient-basic-linux.x64-11.2.0.4.0.zip

- oracle sqlplus, instantclient-sqlplus-linux.x64-11.2.0.4.0.zip

- oracle sdk, instantclient-sdk-linux.x64-11.2.0.4.0.zip

### Configuring the Oracle Client
```shell
$ unzip instantclient-basic-linux.x64-11.2.0.4.0.zip
$ unzip instantclient-sqlplus-linux.x64-11.2.0.4.0.zip
$ unzip instantclient-sdk-linux.x64-11.2.0.4.0.zip
$ mv instantclient_11_2 /usr/local
$ echo "export LD_LIBRARY_PATH=/usr/local/instantclient_11_2:$LD_LIBRARY_PATH" >> /etc/profile
$ source /etc/profile
```

## Building from Source
The gt-checksum tool is developed in the Go language, and you can compile it yourself to generate the binary file.

The build environment requires golang 1.17 or later.

Refer to the following methods to download the source code and compile it:
```shell
$ git clone https://gitee.com/GreatSQL/gt-checksum.git
$ go build -o gt-checksum gt-checksum.go
$ chmod +x gt-checksum
$ mv gt-checksum /usr/local/bin
```

You can also compile directly in a Docker environment. With a ready Docker runtime environment, execute the following:
```shell
$ git clone https://gitee.com/GreatSQL/gt-checksum.git
$ cd gt-checksum
$ DOCKER_BUILDKIT=1 docker build --build-arg VERSION=v1.2.1 -f Dockerfile -o ./ .
$ cd gt-checksum-v1.2.1
$ ./gt-checksum -v
gt-checksum version 1.2.1
```
The compilation is now complete, and you can start using it.

## Documentation
---
- [gt-checksum manual](https://gitee.com/GreatSQL/gt-checksum/blob/v1.2.3/gt-checksum-manual.md)


## Release History
---
- [Release History](https://gitee.com/GreatSQL/gt-checksum/blob/master/relnotes/CHANGELOG.zh-CN.md)


## Known Issues
---
As of the latest version 1.2.1, if a table contains multiple completely duplicate rows, the checksum results may be inaccurate. For details, see [Known Issues](https://gitee.com/GreatSQL/gt-checksum/blob/master/docs/gt-checksum-manual.md#已知缺陷) .

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
