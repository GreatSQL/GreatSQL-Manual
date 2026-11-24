# Compiling GreatSQL from Source
---

This document describes how to use Docker to compile the GreatSQL source code and generate the corresponding GreatSQL binary package.

If you need to generate an RPM package, refer to this document [Compiling the GreatSQL RPM Package under CentOS](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-rpm-under-centos.md).

The runtime environment described in this document is CentOS 8 x86_64. For adaptation to other environments, please modify the parameters in the Dockerfile and related scripts yourself.
```bash
$ cat /etc/redhat-release
CentOS Linux release 8.5.2111

$ uname -a
Linux gip 4.18.0-348.el8.x86_64 #1 SMP Tue Oct 19 15:14:17 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
```
## Preparation
### Configuring the yum Source
Before starting the compilation, it is recommended to configure the yum source first, making it convenient to install some tools
```bash
# Directly replace the yum source file and replace some resources
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo
sed -i -e '/mirrors.cloud.aliyuncs.com/d' -e '/mirrors.aliyuncs.com/d' /etc/yum.repos.d/CentOS-Base.repo

# Delete other useless yum source files
rm -f /etc/yum.repos.d/CentOS-Linux-*

# After replacement, update the cache
yum clean all
yum makecache
```

### Installing Docker
Download the Docker yum source, and clean and regenerate the new yum cache
```bash
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
yum clean all
yum makecache
```
Install Docker, start Docker and verify the version (the Docker version should preferably not be lower than 20.x)
```bash
yum install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
docker --version
```

## Pulling the GreatSQL-Build Docker Image

Pull the [GreatSQL-Build Docker image](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build)

```bash
docker pull greatsql/greatsql_build
```

If it cannot be pulled from hub.docker.com, you can try pulling from Alibaba Cloud ACR or Tencent Cloud TCR, for example:

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql_build
docker pull ccr.ccs.tencentyun.com/greatsql/greatsql_build
```

::: details View the running result
If a timeout connection error is reported, just retry a few times.
:::

## Building with the GreatSQL Build Docker Image

Create a new container, enter the container, manually call the execution script, and start compiling GreatSQL:

```bash
# Create a new container
$ docker run -itd --hostname greatsql_build --name greatsql_build greatsql/greatsql_build

# Enter the container and manually start the compilation work
$ docker exec -it greatsql_build sh
sh-4.4# pwd
/
sh-4.4#
sh-4.4# ls
bin  boot  dev  etc  greatsql_build_init.sh  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var

sh-4.4# sh ./greatsql_build_init.sh
```

::: details View the running result
```
sh-4.4# sh ./greatsql_build_init.sh

...
0. GreatSQL-Build INIT

1. downloading sourcecode tarballs and extract
 1.1 downloading sourcecode tarballs ...
...
3. compile GreatSQL
 3.1 compiling GreatSQL
 3.2 remove mysql-test from GreatSQL
 3.3 make dynamic link for GreatSQL

4. greatsql build completed!
drwxrwxr-x 13 mysql mysql       293 Aug 16 08:27 GreatSQL-8.0.32-27-ol-glibc2.28-x86_64
/opt/GreatSQL-8.0.32-27-ol-glibc2.28-x86_64/bin/mysqld  Ver 8.0.32-27 for Linux on x86_64 (GreatSQL, Release 27, Revision aa66a385910)

5. remove files and clean up
```
:::

After the compilation is complete, you can copy the compiled binary package files in the container to the host machine, for example:

```shell
docker cp greatsql_build:/opt/GreatSQL-8.0.32-27-ol-glibc2.28-x86_64 /usr/local/
```

If the host environment is also CentOS x86_64, you can directly use this binary package on the host environment.

::: tip Tip
The compilation work consumes a large amount of CPU resources. Depending on the machine configuration, the time required may vary, so please be patient. It takes about 10 minutes on an ordinary 16-core PC workstation.

During the compilation, network problems (DNS resolution failure, network connection timeout, etc.) may cause failures; just retry a few times.
:::

If you need to customize the compilation parameters (such as modifying the version number or the binary package installation directory), you can modify the `/opt/greatsql-setenv.sh` script yourself, similar to the following:

```ini
...
MAJOR_VERSION=8
MINOR_VERSION=0
PATCH_VERSION=39
RELEASE=39
REVISION=aaaaaaaaaaa
...
```
After modifying the above parameters, recompile GreatSQL. After completion, start and connect to GreatSQL, and run the SQL command `status` to view the version number, which will become similar to the following:

::: details View the running result
```
Server version:        8.0.39-39 GreatSQL, Release 39, Revision aaaaaaaaaaa
```
:::

At this point, the GreatSQL binary installation package has been successfully compiled. Next, you can refer to the document [Installing with the Binary Tarball and Building an MGR Cluster](./3-install-with-tarball.md) to continue with database initialization and MGR cluster construction. This is not elaborated here.

## Related Resources and Further Reading
The `GreatSQL-Build` repository address is: [https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build)

**Further Reading**

- [Compiling and installing GreatSQL from source on Linux](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source.md)
- [Compiling GreatSQL in a Kylin OS + Loongson environment](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source-under-kylin-and-loongson.md)
- [Compiling the GreatSQL binary package under openEuler, Anolis and UOS systems](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-under-openeuler-anolis-uos.md)


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
