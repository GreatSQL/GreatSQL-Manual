# Docker Installation
---

This section introduces how to install the GreatSQL database using Docker. It is assumed that the installation is performed in a CentOS 8.x x86_64 environment and as the root user.

## Environment Preparation

Installing GreatSQL with Docker is independent of the host operating system. Any OS that can run Docker is supported, such as Linux, Windows, and macOS. Before proceeding, you need to make sure Docker is installed and works properly.

Docker is an open-source application container engine, developed in the Go language and open-sourced under the Apache 2.0 license. Docker allows developers to package their applications and dependencies into lightweight, portable containers, and then publish them on any popular Linux machine; it can also achieve virtualization.

GreatSQL Docker image repository homepage: [https://hub.docker.com/repository/docker/greatsql/greatsql](https://hub.docker.com/repository/docker/greatsql/greatsql).

The Docker version used in this article is 20.10.10

```bash
docker --version

...
Docker version 20.10.10, build b485636
```

::: tip Tip
When using a specific version of Docker or a too-low version (e.g., <=17.12.1), problems may occur. Refer to: [20. Why does the GreatSQL Docker container fail to start](../11-faq/5-faq-others.md#_20-why-does-the-greatsql-docker-container-fail-to-start).
:::

## Installation Steps

### 1. Start the Docker service

```bash
systemctl start docker
```

### 2. Search for and pull the GreatSQL image

```bash
docker search greatsql

...
NAME                DESCRIPTION   STARS     OFFICIAL   AUTOMATED
greatsql/greatsql                 4

docker pull greatsql/greatsql

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

If you cannot pull the GreatSQL image from docker.io due to network issues, you can pull it from Alibaba Cloud instead, as follows:

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

### 3. Create a new container

The GreatSQL database will be installed and started in the container

```bash
docker run -d --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql

...
4f351e22cea990b177589970ac5374f4b3366d2c0f69e923475f82c51da4b934
```
Both the container name and the hostname inside the container are greatsql.

Confirm the container status:

```bash
docker ps -a | grep greatsql

...
4f351e22cea9   greatsql/greatsql     "/docker-entrypoint.…"   About a minute ago   Up About a minute          3306/tcp, 33060-33061/tcp   greatsql
...
```
If the container status is Up, it means the container has started normally.

Occasionally, exceptions may occur when creating the Docker container, for example:

```bash
docker logs greatsql
...
Could not find OpenSSL on the system
MySQL init process in progress...
MySQL init process failed.
...
```

In this case, first check whether SELinux is disabled

```bash
sestatus

...
SELinux status:                 disabled
```

If not, disable SELinux first. Refer to: [Disable the firewall and SELinux](../4-install-guide/1-install-prepare.md#disabling-the-firewall-and-selinux).

If the above problem still occurs after SELinux is disabled, you can add the `--privileged` parameter when creating the Docker container, for example:

```bash
docker run -d --privileged --name greatsql --hostname=greatsql -e MYSQL_ALLOW_EMPTY_PASSWORD=1 greatsql/greatsql
```

This usually solves the above problem.

This kind of problem is usually caused by a low Docker version or problems in special versions. Upgrading the version can generally solve the problem. Based on my personal testing, older Docker versions such as <=18.06.3 (some users have also encountered it in version 20.10.8) have this problem, and Docker installed in some Kubernetes environments may also have problems.

### 4. Enter the container

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
As you can see, GreatSQL has been installed and initialized.

Log into the GreatSQL database in the container:

```bash
[root@greatsql GreatSQL]# mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

[root@GreatSQL][(none)]> status;
--------------
...
Server version:        8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
...
Threads: 2  Questions: 6  Slow queries: 0  Opens: 119  Flush tables: 3  Open tables: 36  Queries per second avg: 0.017
```

At this point, installing the GreatSQL database in Docker is complete.

If you want to execute a SQL script in the Docker container, you need to copy the SQL script into the container first, and then execute the corresponding SQL script, as shown in the following example:

```bash
# first copy the file from the host to the container
docker cp /tmp/greatsql-test.sql greatsql:/tmp/
```

Where
- `docker cp` initiates a Docker container copy operation
- `/tmp/greatsql-test.sql` is the file on the host
- `greatsql` is the container name
- `/tmp/` is the directory in the container

Next, you can directly call and execute the SQL script in the container from the host

```bash
docker exec -it greatsql bash -c "mysql -f < /tmp/greatsql-test.sql"
```

The above method may fail due to some environment variables and other reasons. In this case, you can enter the container first and then execute the SQL script

```bash
# first enter the container
docker exec -it greatsql bash

# then execute a SQL script in the container
mysql -f < /tmp/greatsql-test.sql
```
That works.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
