# Docker 容器化安装
---

本节介绍如何用 Docker 方式安装 GreatSQL 数据库，假定本次安装是在 CentOS 8.x x86_64 环境中安装，并且是以 root 用户身份执行安装操作。

## 环境准备

Docker 安装 GreatSQL 与宿主机的操作系统无关，只要能够运行 Docker 的操作系统均可支持，比如 Linux，Windows，macOS。在此之前，您需要先确认已经安装好 Docker 并能正常使用。

Docker 是一个开源的应用容器引擎，基于 Go 语言并遵从 Apache2.0 协议开源。Docker 可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。

GreatSQL Docker 镜像仓库主页：[https://hub.docker.com/repository/docker/greatsql/greatsql](https://hub.docker.com/repository/docker/greatsql/greatsql)。

本文使用的 Docker 版本是 20.10.10

```bash
docker --version

...
Docker version 20.10.10, build b485636
```

## 安装步骤

### 1. 启动Docker服务

```bash
systemctl start docker
```

### 2. 搜索、拉取GreatSQL镜像

```bash
docker search greatsql

...
NAME                DESCRIPTION   STARS     OFFICIAL   AUTOMATED
greatsql/greatsql                 4

docker pull greatsql

...
Using default tag: latest
latest: Pulling from greatsql/greatsql
a1d0c7532777: Already exists
0689c7a54f49: Pull complete
...
Digest: sha256:27255f94207ceec4302d4fb6f83c4b610e177f57e66347766befb69d1bae91e8
Status: Downloaded newer image for greatsql/greatsql:latest
docker.io/greatsql/greatsql:latest
```

若由于网络原因无法从 docker.io 拉取 GreatSQL 镜像的话，可以改成从阿里云拉取，方法如下：

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

### 3. 创建一个新容器

容器中会安装并启动GreatSQL数据库

```bash
docker run -d --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql

...
4f351e22cea990b177589970ac5374f4b3366d2c0f69e923475f82c51da4b934
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
docker logs greatsql
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

这种问题通常是因为安装的Docker版本号较低或特殊版本存在问题导致的，升级版本一般也能解决问题。经我个人测试，使用较早的Docker版本如<=18.06.3的版本（有部分用户在20.10.8版本也遇到过）就有该问题，个别在Kubernetes环境中安装的Docker可能也有问题。

### 4. 进入容器

```bash
docker exec -it greatsql bash

...
[root@greatsql /]# cd /data/GreatSQL/
[root@greatsql GreatSQL]# ls
 auto.cnf        binlog.index      client-key.pem   '#file_purge'         ibdata1          '#innodb_temp'   mysql.sock           public_key.pem    sys
 binlog.000001   ca-key.pem        duckdb.data      '#ib_16384_0.dblwr'   ibtmp1            mysql           mysql.sock.lock      server-cert.pem   sys_audit
 binlog.000002   ca.pem            duckdb.data.wal  '#ib_16384_1.dblwr'  '#innodb_redo'     mysql.ibd       performance_schema   server-key.pem    undo_001
 binlog.000003   client-cert.pem   error.log         ib_buffer_pool       innodb_status.1   mysql.pid       private_key.pem      slow.log          undo_002
```
可以看到，GreatSQL已经安装并初始化完毕。

在容器中登入GreatSQL数据库：

```bash
[root@greatsql GreatSQL]# mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

[root@GreatSQL][(none)]> status;
--------------
...
Server version:        8.0.32-27 GreatSQL, Release 27, Revision aa66a385910
...
Threads: 2  Questions: 6  Slow queries: 0  Opens: 119  Flush tables: 3  Open tables: 36  Queries per second avg: 0.017
```

至此，在Docker中安装GreatSQL数据库完成。

如果想要在 Docker 容器中执行某个 SQL 脚本，需要先将该 SQL 脚本拷贝到容器中，再执行相应的 SQL 脚本，如下例所示：

```bash
# 先从宿主拷贝文件到容器中
docker cp /opt/greatsql-test.sql greatsql:/tmp/
```

其中
- `docker cp` 表示发起一个 Docker 容器拷贝操作
- `/tmp/greatsql-test.sql` 是宿主环境下的文件
- `greatsql` 是容器名
- `/tmp/` 是容器中的目录

接下来，可以直接在宿主环境中调用执行容器中的 SQL 脚本

```bash
docker exec -it greatsql bash -c "mysql -f < /tmp/greatsql-test.sql"
```

上述方法有可能由于一些环境变量等原因无法执行，这时可以先进入容器再执行 SQL 脚本

```bash
# 先进入容器
docker exec -it greatsql bash

# 再在容器中执行一个 SQL 脚本
mysql -f < /tmp/greatsql-test.sql
```
这样就可以了。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
