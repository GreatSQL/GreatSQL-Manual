# Docker 容器化安装
---

本文详细介绍如何在Docker中部署GreatSQL，并且构建一个MGR集群。

本文使用的 Docker 版本是 20.10.10

```bash
docker --version

...
Docker version 20.10.10, build b485636
```

docker-compose 版本是 2.15.0

```bash
docker-compose --version

...
Docker Compose version v2.15.0 
```

::: tip 小贴士
当使用特定版本的 Docker 或其版本过低（如<=17.12.1）时，可能存在问题，参考：[20. 为什么GreatSQL Docker容器启动失败](../11-faq/5-faq-others.md#_20-为什么greatsql-docker容器启动失败)。
:::

##  安装Docker
直接用yum/dnf安装Docker，非常省事
```bash
yum install -y docker
```

之后启动 Docker 服务，并设置开机自启动
```bash
systemctl enable docker
systemctl start docker
```

##  拉取GreatSQL镜像，并创建容器
###  拉取镜像
拉取GreatSQL官方镜像
```bash
docker pull greatsql/greatsql
```

::: details 查看运行结果
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

若由于网络原因无法从 docker.io 拉取 GreatSQL 镜像的话，可以改成从阿里云 ACR 拉取，方法如下：

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

也可以从腾讯云 TCR 拉取：

```bash
docker pull ccr.ccs.tencentyun.com/greatsql/greatsql
```

检查是否成功拉取

```bash
docker images

REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
docker.io/greatsql/greatsql   latest              a930afc72d88        8 weeks ago         923 MB
```

###  创建新容器

之后，就可以直接创建一个新的容器了，先用常规方式
```bash
docker run -d --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql
```

容器的命名和容器内主机名均为greatsql。

确认容器状态：
```bash
docker ps -a | grep greatsql

...
4f351e22cea9   greatsql/greatsql     "/docker-entrypoint.…"   About a minute ago   Up About a minute          3306/tcp, 33060-33061/tcp   greatsql
...
```
看到容器状态是Up的，表示已正常启动了。

个别时候，可能会发生Docker容器创建异常，例如下面这样

```bash
docker log greatsql
...
Could not find OpenSSL on the system
MySQL init process in progress...
MySQL init process failed.
...
```

这种情况下，请先检查是否关闭了 SELinux

```bash
sestatus

...
SELinux status:                 disabled
```

如果没有就先关闭 SELinux，参考：[关闭防火墙及selinux](../4-install-guide/1-install-prepare.html#关闭防火墙及selinux)。

如果已经关闭 SELinux 还是会出现上述问题的话，可以在创建 Docker 容器时加上 `--privileged` 参数，例如下面这样

```bash
docker run -d --privileged --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql
```

这样通常就可以解决上述问题。

这种问题通常是因为安装的Docker版本号较低或特殊版本存在问题导致的，升级版本一般也能解决问题。经我个人测试，使用较早的Docker版本如<=17.12.1的版本（有少部分用户在其他版本也遇到过）就有该问题，个别在Kubernetes环境中安装的Docker可能也有问题。

###  容器管理

进入容器查看
```bash
docker exec -it greatsql /bin/bash

...
[root@greatsql /]# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 12
Server version: 8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
...
Server version:        8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
...

Threads: 2  Questions: 18  Slow queries: 0  Opens: 119  Flush tables: 3  Open tables: 36  Queries per second avg: 0.243
```

看到容器已经完成初始化，并且可以直接无密码登入。

##  构建MGR集群（单主模式）

手工管理Docker比较麻烦，建议采用 `docker-compose` ，它可以更方便的管理docker容器。

先用yum安装docker-compose，并确认版本号
```bash
yum install -y docker-compose

docker-compose --version

...
docker-compose version 1.29.2, build 5becea4c
```

编辑一个yaml文件，准备部署包含仲裁节点的三节点MGR集群：

```bash
mkdir -p /data/docker-compose
vim /data/docker-compose/mgr-3nodes.yml
```

::: details mgr-3nodes.yml 文件详细内容
```ini
version: '2'

services:
  mgr2:
    image: greatsql/greatsql         #指定镜像
    container_name: mgr2    #设定容器名字
    hostname: mgr2          #设定容器中的主机名
    networks:               #指定容器使用哪个专用网络
      mgr_net:
        ipv4_address: 172.18.0.2    #设置容器使用固定IP地址，避免重启后IP变化
    restart: unless-stopped         #设定重启策略
    environment:                    #设置多个环境变量
      TZ: Asia/Shanghai             #时区
      MYSQL_ALLOW_EMPTY_PASSWORD: 1                 #允许root账户空密码
      MYSQL_INIT_MGR: 1                             #初始化MGR集群
      MYSQL_MGR_LOCAL: '172.18.0.2:33061'           #当前MGR节点的local_address
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'     #MGR集群seeds
      MYSQL_MGR_START_AS_PRIMARY: 1                 #指定当前MGR节点为Primary角色
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
      MYSQL_MGR_ARBITRATOR: 0                       #既非Primary，也非Arbitrator，那么就是Secondary角色了
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
      MYSQL_MGR_ARBITRATOR: 1                   #指定当前MGR节点为Arbitrator角色，此时不能同时指定其为Primary/Secondary角色
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
networks:
  mgr_net:  #创建独立MGR专属网络
    ipam:
      config:
        - subnet: 172.18.0.0/24
```
:::

关于GreatSQL容器启动选项说明，详见[GreatSQL For Docker文档](https://hub.docker.com/r/greatsql/greatsql)。

如果不想要仲裁节点，则可以修改最后一个节点的属性 `MYSQL_MGR_ARBITRATOR: 0` 就行了。

启动三个实例：

```bash
docker-compose -f /data/docker-compose/mgr-3nodes.yml up -d
```

::: details 查看运行结果
```
Creating network "docker-compose_mgr_net" with the default driver
Creating mgr2 ... done
Creating mgr3 ... done
Creating mgr4 ... done
```
:::

查看运行状态：
```bash
docker-compose -f /data/docker-compose/mgr-3nodes.yml ps
```

::: details 查看运行结果
```
Name             Command              State               Ports
----------------------------------------------------------------------------
mgr2   /docker-entrypoint.sh mysqld   Up      3306/tcp, 33060/tcp, 33061/tcp
mgr3   /docker-entrypoint.sh mysqld   Up      3306/tcp, 33060/tcp, 33061/tcp
mgr4   /docker-entrypoint.sh mysqld   Up      3306/tcp, 33060/tcp, 33061/tcp
```
:::

容器刚创建完还需要过一小段时间才能完成GreatSQL的初始化以及MGR集群自动构建，视服务器性能不同而定，一般需要30秒至四分钟左右。

进入被选为PRIMARY节点的容器mgr2，查看MGR集群状态。

::: details 查看运行结果
```
docker exec -it mgr2 bash

...
[root@mgr2 /]# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 30
Server version: 8.4.4-4 GreatSQL, Release 4, Revision d73de75905d
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

[root@GreatSQL][(none)]> \s
--------------
mysql  Ver 8.4.4-4 for Linux on x86_64 (GreatSQL, Release 4, Revision d73de75905d)
...
Uptime:            1 min 38 sec

Threads: 11  Questions: 52  Slow queries: 0  Opens: 145  Flush tables: 3  Open tables: 62  Queries per second avg: 0.530
--------------

[root@GreatSQL][(none)]> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
| group_replication_applier | 396465ad-01ab-11ed-9c1a-0242ac120002 | 172.18.0.2  |        3306 | ONLINE       | PRIMARY     | 8.4.4          |
| group_replication_applier | 3a4eabbd-01ab-11ed-a7ea-0242ac120003 | 172.18.0.3  |        3306 | ONLINE       | SECONDARY   | 8.4.4          |
| group_replication_applier | 3c707b56-01ab-11ed-969b-0242ac120004 | 172.18.0.4  |        3306 | ONLINE       | ARBITRATOR  | 8.4.4          |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
3 rows in set (0.01 sec)
```
:::

可以看到，包含仲裁节点的三节点MGR集群已自动构建完毕。

##  构建MGR集群（多主模式）

下面是一个docker-compose的配置文件参考 `/data/docker/mgr-multi-primary.yml`:

::: details mgr-multi-primary.yml 文件详细内容
```
version: '2'

services:
  mgr2:
    image: greatsql/greatsql
    container_name: mgr2    #设定容器名字
    hostname: mgr2          #设定容器中的主机名
    networks:               #指定容器使用哪个专用网络
      mgr_net:
        ipv4_address: 172.18.0.2    #设置容器使用固定IP地址，避免重启后IP变化
    restart: unless-stopped         #设定重启策略
    environment:                    #设置多个环境变量
      TZ: Asia/Shanghai             #时区
      MYSQL_ALLOW_EMPTY_PASSWORD: 1                 #允许root账户空密码
      MYSQL_INIT_MGR: 1                             #初始化MGR集群
      MYSQL_MGR_LOCAL: '172.18.0.2:33061'           #当前MGR节点的local_address
      MYSQL_MGR_SEEDS: '172.18.0.2:33061,172.18.0.3:33061,172.18.0.4:33061'     #MGR集群seeds
      MYSQL_MGR_START_AS_PRIMARY: 1                 #指定当前MGR节点为Primary角色
      MYSQL_MGR_MULTI_PRIMARY: 1             #指定是否采用多主模式
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
      MYSQL_MGR_ARBITRATOR: 0                       #既非Primary，也非Arbitrator，那么就是Secondary角色了                 
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
      MYSQL_MGR_ARBITRATOR: 0                   #指定当前MGR节点为Arbitrator角色，此时不能同时指定其为Primary/Secondary角色
      #MYSQL_MGR_VIEWID: "aaaaaaaa-bbbb-bbbb-aaaa-aaaaaaaaaaa1"
networks:
  mgr_net:  #创建独立MGR专属网络
    ipam:
      config:
        - subnet: 172.18.0.0/24
```
:::

启动所有容器:
```bash
docker-compse -f /data/docker/mgr-multi-primary.yml up -d
```

容器启动后，会自行进行MySQL实例的初始化并自动构建MGR集群。

进入第一个容器，确认实例启动并成为MGR的Primary节点：

```bash
docker exec -it mgr2 bash

...
mysql

...
[root@GreatSQL][(none)]> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+----------------------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION | MEMBER_COMMUNICATION_STACK |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+----------------------------+
| group_replication_applier | 9831bac0-30d4-11ee-8b65-0242ac120002 | 172.18.0.2  |        3306 | ONLINE       | PRIMARY     | 8.4.4          | XCom                       |
| group_replication_applier | 9907b1ae-30d4-11ee-8c66-0242ac120003 | 172.18.0.3  |        3306 | ONLINE       | PRIMARY     | 8.4.4          | XCom                       |
| group_replication_applier | 9a1ee7ca-30d4-11ee-8b93-0242ac120004 | 172.18.0.4  |        3306 | ONLINE       | PRIMARY     | 8.4.4          | XCom                       |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+----------------------------+
```
可以看到，一个三节点的MGR集群已自动构建完毕，运行模式为多主模式。

##  Docker-Compose环境变量/参数介绍
- **MYSQL_ROOT_PASSWORD**
设置MySQL root账号的密码。如果下面指定了MYSQL_ALLOW_EMPTY_PASSWORD=1，则本参数无效。

- **MYSQL_DATABASE**
是否初始化一个新的数据库。

- **MYSQL_ALLOW_EMPTY_PASSWORD**
是否设置MySQL root账号使用空密码，因为安全原因，不推荐这么做。

- **MYSQL_RANDOM_ROOT_PASSWORD**
设置MySQL root账号的密码采用随机生成方式。

- **MYSQL_IBP**
设置innodb_buffer_pool_size，默认值：128M。

- **MYSQL_INIT_MGR**
是否初始化MGR相关设置，默认值：0（否）。如果设置为1（是），则会创建MGR服务所需账号，并设定运行 CHANGE MASTER TO 设置好MGR复制通道。
非必选项。

- **MYSQL_MGR_NAME**
设置group_replication_group_name，默认值："aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"。
非必选项。

- **MYSQL_MGR_LOCAL**
设置 group_replication_local_address，默认值："172.17.0.2:33061"。
如果 MYSQL_INIT_MGR=1 则为必选项。

- **MYSQL_MGR_SEEDS**
设置 group_replication_group_seeds，默认值："172.17.0.2:33061,172.17.0.3:33061"。
如果 MYSQL_INIT_MGR=1 则为必选项。

- **MYSQL_MGR_USER**
设置MGR服务所需账号，默认值：repl。
非必选项。

- **MYSQL_MGR_USER_PWD**
设置MGR服务所需账号的密码，默认值：repl4MGR。
非必选项。

- **MYSQL_SID**
设置server_id选项，构建MGR集群时要求每个节点的server_id是唯一的，默认值：3306+随机数
非必选项。

- **MYSQL_MGR_START_AS_PRIMARY**
指定当前节点在MGR中以PRIMARY角色启动，每次都会进行MGR初始化引导操作。默认值：0。
如果 MYSQL_INIT_MGR=1 则至少要有一个节点指定为PRIMARY角色。

- **MYSQL_MGR_MULTI_PRIMARY**
设置是否采用多主模式运行。默认值：0。
如果 MYSQL_MGR_MULTI_PRIMARY=1，则【有且只能选择一个节点】设置 MYSQL_MGR_START_AS_PRIMARY=1，该节点会采用引导模式启动，其余节点不设置引导模式。

- **MYSQL_MGR_ARBITRATOR**
指定当前节点在MGR中以ARBITRATOR角色启动，该选项和**MYSQL_MGR_START_AS_PRIMARY**是互斥的，不能同时设置为1。默认值：0。
非必选项。

- **MYSQL_MGR_VIEWID**
MySQL 8.0.26开始，可以为view change单独指定一个GTID前缀，避免和正常的事务GTID混杂一起，产生问题。默认值：AUTOMATIC。
非必选项。


更多关于如何利用Docker/Docker-Compose完成GreatSQL初始化并构建MGR集群的详情请查看 [**GreatSQL-Docker项目**](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
