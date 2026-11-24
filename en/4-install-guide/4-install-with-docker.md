# Installing with Docker
---

This article details how to deploy GreatSQL in Docker and build an MGR cluster.

The Docker version used in this article is 20.10.10

```bash
docker --version

...
Docker version 20.10.10, build b485636
```

The docker-compose version is 1.29.2

```bash
docker-compose --version

...
docker-compose version 1.29.2, build 5becea4c
```

::: tip Tip
When using a specific version of Docker or a version that is too old (such as <=17.12.1), problems may occur. Refer to: [20. Why does the GreatSQL Docker container fail to start](../11-faq/5-faq-others.md#_20-why-does-the-greatsql-docker-container-fail-to-start).
:::

## Installing Docker
Install Docker directly with yum/dnf, which is very convenient
```bash
yum install -y docker
```

Then start the Docker service and set it to start automatically on boot
```bash
systemctl enable docker
systemctl start docker
```

## Pulling the GreatSQL Image and Creating a Container
### Pulling the Image
Pull the official GreatSQL image
```bash
docker pull greatsql/greatsql
```

::: details View the result
```bash
docker pull greatsql/greatsql

...
Using default tag: latest
Trying to pull repository docker.io/greatsql/greatsql ...
latest: Pulling from docker.io/greatsql/greatsql
...
Digest: sha256:27255f94207ceec4302d4fb6f83c4b610e177f57e66347766befb69d1bae91e8
Status: Downloaded newer image for greatsql/greatsql:latest
docker.io/greatsql/greatsql:latest
```
:::

If the GreatSQL image cannot be pulled from docker.io due to network reasons, it can be pulled from Alibaba Cloud ACR instead. The method is as follows:

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

It can also be pulled from Tencent Cloud TCR:

```bash
docker pull ccr.ccs.tencentyun.com/greatsql/greatsql
```

Check whether the pull was successful

```bash
docker images

REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
docker.io/greatsql/greatsql   latest              a930afc72d88        8 weeks ago         923 MB
```

### Creating a New Container

After that, a new container can be created directly. First use the conventional method
```bash
docker run -d --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql
```

The container name and the hostname inside the container are both greatsql.

Confirm the container status:
```bash
docker ps -a | grep greatsql

...
4f351e22cea9   greatsql/greatsql     "/docker-entrypoint.…"   About a minute ago   Up About a minute          3306/tcp, 33060-33061/tcp   greatsql
...
```
Seeing that the container status is Up means it has started normally.

Occasionally, Docker container creation anomalies may occur, for example as follows

```bash
docker logs greatsql
...
Could not find OpenSSL on the system
MySQL init process in progress...
MySQL init process failed.
...
```

In this case, first check whether SELinux has been disabled

```bash
sestatus

...
SELinux status:                 disabled
```

If not, first disable SELinux. Refer to: [Disabling the Firewall and SELinux](../4-install-guide/1-install-prepare.md#disabling-the-firewall-and-selinux).

If the above problem still occurs after SELinux has been disabled, the `--privileged` parameter can be added when creating the Docker container, for example as follows

```bash
docker run -d --privileged --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql
```

This usually solves the above problem.

This kind of problem is usually caused by a lower installed Docker version or problems with special versions. Upgrading the version generally also solves the problem. According to my personal tests, older Docker versions such as <=17.12.1 (a small number of users have also encountered it in other versions) have this problem, and Docker installed in some Kubernetes environments may also have problems.

### Container Management

Enter the container to view
```bash
docker exec -it greatsql /bin/bash

...
[root@greatsql /]# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 12
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...
Server version:        8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...

Threads: 2  Questions: 18  Slow queries: 0  Opens: 119  Flush tables: 3  Open tables: 36  Queries per second avg: 0.243
```

Seeing that the container has completed initialization and can log in without a password directly.

## Building an MGR Cluster (Single-Primary Mode)

Manually managing Docker is troublesome. It is recommended to use `docker-compose`, which can manage docker containers more conveniently.

First install docker-compose with yum and confirm the version number
```bash
yum install -y docker-compose

docker-compose --version

...
docker-compose version 1.29.2, build 5becea4c
```

Edit a yaml file to prepare to deploy a three-node MGR cluster including an arbitrator node:

```bash
mkdir -p /data/docker-compose
vim /data/docker-compose/mgr-3nodes.yml
```

::: details Detailed content of the mgr-3nodes.yml file
```ini
version: '2'

services:
  mgr2:
    image: greatsql/greatsql         #Specify the image
    container_name: mgr2    #Set the container name
    hostname: mgr2          #Set the hostname in the container
    networks:               #Specify which dedicated network the container uses
      mgr_net:
        ipv4_address: 172.18.0.2    #Set the container to use a fixed IP address, avoiding IP changes after restart
    restart: unless-stopped         #Set the restart policy
    environment:                    #Set multiple environment variables
      TZ: Asia/Shanghai             #Timezone
      MYSQL_ALLOW_EMPTY_PASSWORD: 1                 #Allow the root account to use an empty password
      MYSQL_INIT_MGR: 1                             #Initialize the MGR cluster
      MYSQL_MGR_LOCAL: '172.18.0.2:33061'           #The local_address of the current MGR node
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'     # MGR cluster seeds
      MYSQL_MGR_START_AS_PRIMARY: 1                 #Specify the current MGR node as the Primary role
      MYSQL_MGR_ARBITRATOR: 0
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
  mgr3:
    image: greatsql/greatsql
    container_name: mgr3
    hostname: mgr3
    networks:
      mgr_net:
        ipv4_address: 172.18.0.3
    restart: unless-stopped
    depends_on:
      - "mgr2"
    environment:
      TZ: Asia/Shanghai
      MYSQL_ALLOW_EMPTY_PASSWORD: 1
      MYSQL_INIT_MGR: 1
      MYSQL_MGR_LOCAL: '172.18.0.3:33061'
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'
      MYSQL_MGR_START_AS_PRIMARY: 0
      MYSQL_MGR_ARBITRATOR: 0                       #Neither Primary nor Arbitrator, so it is the Secondary role
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
  mgr4:
    image: greatsql/greatsql
    container_name: mgr4
    hostname: mgr4
    networks:
      mgr_net:
        ipv4_address: 172.18.0.4
    restart: unless-stopped
    depends_on:
      - "mgr3"
    environment:
      TZ: Asia/Shanghai
      MYSQL_ALLOW_EMPTY_PASSWORD: 1
      MYSQL_INIT_MGR: 1
      MYSQL_MGR_LOCAL: '172.18.0.4:33061'
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'
      MYSQL_MGR_START_AS_PRIMARY: 0
      MYSQL_MGR_ARBITRATOR: 1                   #Specify the current MGR node as the Arbitrator role; at this time, it cannot also be specified as the Primary/Secondary role
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
networks:
  mgr_net:  #Create a dedicated MGR network
    ipam:
      config:
        - subnet: 172.18.0.0/24
```
:::

For the GreatSQL container startup option descriptions, see the [GreatSQL For Docker documentation](https://hub.docker.com/r/greatsql/greatsql).

If you do not want the arbitrator node, you only need to modify the attribute `MYSQL_MGR_ARBITRATOR: 0` of the last node.

Start the three instances:

```bash
docker-compose -f /data/docker-compose/mgr-3nodes.yml up -d
```

::: details View the result
```
Creating network "docker-compose_mgr_net" with the default driver
Creating mgr2 ... done
Creating mgr3 ... done
Creating mgr4 ... done
```
:::

View the running status:
```bash
docker-compose -f /data/docker-compose/mgr-3nodes.yml ps
```

::: details View the result
```
Name             Command              State               Ports
----------------------------------------------------------------------------
mgr2   /docker-entrypoint.sh mysqld   Up      3306/tcp, 33060/tcp, 33061/tcp
mgr3   /docker-entrypoint.sh mysqld   Up      3306/tcp, 33060/tcp, 33061/tcp
mgr4   /docker-entrypoint.sh mysqld   Up      3306/tcp, 33060/tcp, 33061/tcp
```
:::

It takes a short while after the containers are created to complete GreatSQL initialization and automatic MGR cluster construction. Depending on server performance, it generally takes 30 seconds to about four minutes.

Enter the container mgr2, which was selected as the PRIMARY node, and view the MGR cluster status.

::: details View the result
```
docker exec -it mgr2 bash

...
[root@mgr2 /]# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 30
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

[root@GreatSQL][(none)]> \s
--------------
mysql  Ver 8.0.32-27 for Linux on x86_64 (GreatSQL, Release 27, Revision aa66a385910)
...
Uptime:            1 min 38 sec

Threads: 11  Questions: 52  Slow queries: 0  Opens: 145  Flush tables: 3  Open tables: 62  Queries per second avg: 0.530
--------------

[root@GreatSQL][(none)]> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 396465ad-01ab-11ed-9c1a-0242ac120002 | 172.18.0.2  |        3306 | ONLINE       | PRIMARY     | 8.0.32         |
| group_replication_applier | 3a4eabbd-01ab-11ed-a7ea-0242ac120003 | 172.18.0.3  |        3306 | ONLINE       | SECONDARY   | 8.0.32         |
| group_replication_applier | 3c707b56-01ab-11ed-969b-0242ac120004 | 172.18.0.4  |        3306 | ONLINE       | ARBITRATOR  | 8.0.32         |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
3 rows in set (0.01 sec)
```
:::

It can be seen that the three-node MGR cluster including an arbitrator node has been automatically built.

## Building an MGR Cluster (Multi-Primary Mode)

The following is a docker-compose configuration file reference `/data/docker/mgr-multi-primary.yml`:

::: details Detailed content of the mgr-multi-primary.yml file
```
version: '2'

services:
  mgr2:
    image: greatsql/greatsql
    container_name: mgr2    #Set the container name
    hostname: mgr2          #Set the hostname in the container
    networks:               #Specify which dedicated network the container uses
      mgr_net:
        ipv4_address: 172.18.0.2    #Set the container to use a fixed IP address, avoiding IP changes after restart
    restart: unless-stopped         #Set the restart policy
    environment:                    #Set multiple environment variables
      TZ: Asia/Shanghai             #Timezone
      MYSQL_ALLOW_EMPTY_PASSWORD: 1                 #Allow the root account to use an empty password
      MYSQL_INIT_MGR: 1                             #Initialize the MGR cluster
      MYSQL_MGR_LOCAL: '172.18.0.2:33061'           #The local_address of the current MGR node
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'     # MGR cluster seeds
      MYSQL_MGR_START_AS_PRIMARY: 1                 #Specify the current MGR node as the Primary role
      MYSQL_MGR_MULTI_PRIMARY: 1             #Specify whether to use multi-primary mode
      MYSQL_MGR_ARBITRATOR: 0                       
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
  mgr3:
    image: greatsql/greatsql
    container_name: mgr3
    hostname: mgr3
    networks: 
      mgr_net:
        ipv4_address: 172.18.0.3
    restart: unless-stopped
    depends_on:
      - "mgr2"
    environment:
      TZ: Asia/Shanghai
      MYSQL_ALLOW_EMPTY_PASSWORD: 1
      MYSQL_INIT_MGR: 1
      MYSQL_MGR_LOCAL: '172.18.0.3:33061'
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'
      MYSQL_MGR_START_AS_PRIMARY: 0
      MYSQL_MGR_MULTI_PRIMARY: 1
      MYSQL_MGR_ARBITRATOR: 0                       #Neither Primary nor Arbitrator, so it is the Secondary role                 
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
  mgr4:
    image: greatsql/greatsql
    container_name: mgr4
    hostname: mgr4
    networks: 
      mgr_net:
        ipv4_address: 172.18.0.4
    restart: unless-stopped
    depends_on:
      - "mgr3"
    environment:
      TZ: Asia/Shanghai
      MYSQL_ALLOW_EMPTY_PASSWORD: 1
      MYSQL_INIT_MGR: 1
      MYSQL_MGR_LOCAL: '172.18.0.4:33061'
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'
      MYSQL_MGR_START_AS_PRIMARY: 0
      MYSQL_MGR_MULTI_PRIMARY: 1
      MYSQL_MGR_ARBITRATOR: 0                   #Specify the current MGR node as the Arbitrator role; at this time, it cannot also be specified as the Primary/Secondary role
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
networks:
  mgr_net:  #Create a dedicated MGR network
    ipam:
      config:
        - subnet: 172.18.0.0/24
```
:::

Start all containers:
```bash
docker-compose -f /data/docker/mgr-multi-primary.yml up -d
```

After the containers start, the MySQL instance initialization is performed automatically and the MGR cluster is automatically built.

Enter the first container and confirm that the instance has started and become the MGR Primary node:

```bash
docker exec -it mgr2 bash

...
mysql

...
[root@GreatSQL][(none)]> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+----------------------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION | MEMBER_COMMUNICATION_STACK |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+----------------------------+
| group_replication_applier | 9831bac0-30d4-11ee-8b65-0242ac120002 | 172.18.0.2  |        3306 | ONLINE       | PRIMARY     | 8.0.32         | XCom                       |
| group_replication_applier | 9907b1ae-30d4-11ee-8c66-0242ac120003 | 172.18.0.3  |        3306 | ONLINE       | PRIMARY     | 8.0.32         | XCom                       |
| group_replication_applier | 9a1ee7ca-30d4-11ee-8b93-0242ac120004 | 172.18.0.4  |        3306 | ONLINE       | PRIMARY     | 8.0.32         | XCom                       |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+----------------------------+
```
It can be seen that a three-node MGR cluster has been automatically built, running in multi-primary mode.

## Docker Compose Environment Variables/Parameters Introduction
- **MYSQL_ROOT_PASSWORD**
Sets the password of the MySQL root account. If MYSQL_ALLOW_EMPTY_PASSWORD=1 is specified below, this parameter is invalid.

- **MYSQL_DATABASE**
Whether to initialize a new database.

- **MYSQL_ALLOW_EMPTY_PASSWORD**
Whether to set the MySQL root account to use an empty password. For security reasons, this is not recommended.

- **MYSQL_RANDOM_ROOT_PASSWORD**
Sets the password of the MySQL root account to be randomly generated.

- **MYSQL_IBP**
Sets innodb_buffer_pool_size. Default value: 128M.

- **MYSQL_INIT_MGR**
Whether to initialize MGR-related settings. Default value: 0 (no). If set to 1 (yes), the account required by the MGR service is created, and CHANGE MASTER TO is executed to set up the MGR replication channel.
Optional.

- **MYSQL_MGR_NAME**
Sets group_replication_group_name. Default value: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1".
Optional.

- **MYSQL_MGR_LOCAL**
Sets group_replication_local_address. Default value: "172.17.0.2:33061".
Required if MYSQL_INIT_MGR=1.

- **MYSQL_MGR_SEEDS**
Sets group_replication_group_seeds. Default value: "172.17.0.2:33061,172.17.0.3:33061".
Required if MYSQL_INIT_MGR=1.

- **MYSQL_MGR_USER**
Sets the account required by the MGR service. Default value: repl.
Optional.

- **MYSQL_MGR_USER_PWD**
Sets the password of the account required by the MGR service. Default value: repl4MGR.
Optional.

- **MYSQL_SID**
Sets the server_id option. When building an MGR cluster, the server_id of each node is required to be unique. Default value: 3306 + random number
Optional.

- **MYSQL_MGR_START_AS_PRIMARY**
Specifies that the current node starts with the PRIMARY role in MGR, and the MGR initialization bootstrap operation is performed each time. Default value: 0.
If MYSQL_INIT_MGR=1, at least one node must be specified as the PRIMARY role.

- **MYSQL_MGR_MULTI_PRIMARY**
Sets whether to run in multi-primary mode. Default value: 0.
If MYSQL_MGR_MULTI_PRIMARY=1, then **exactly one node** must be set with MYSQL_MGR_START_AS_PRIMARY=1. This node starts in bootstrap mode, and the other nodes do not set bootstrap mode.

- **MYSQL_MGR_ARBITRATOR**
Specifies that the current node starts with the ARBITRATOR role in MGR. This option is mutually exclusive with **MYSQL_MGR_START_AS_PRIMARY** and cannot both be set to 1. Default value: 0.
Optional.

- **MYSQL_MGR_VIEWID**
Starting from MySQL 8.0.26, a separate GTID prefix can be specified for view changes, avoiding mixing with normal transaction GTIDs and causing problems. Default value: AUTOMATIC.
Optional.


For more details on how to use Docker/Docker-Compose to complete GreatSQL initialization and build an MGR cluster, please see the [**GreatSQL-Docker project**](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
