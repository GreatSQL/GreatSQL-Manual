# 编译源码安装
---

本文介绍如何利用Docker来(自动)编译GreatSQL源码并生成对应GreatSQL二进制包

若需要生成RPM包，可以参考这个文档[在CentOS环境下编译GreatSQL RPM包](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-rpm-under-centos.md)

本文介绍的运行环境是CentOS 8 x86_64，更多环境适配请自行修改Dockerfile及相关脚本中的参数。
```bash
$ cat /etc/redhat-release
CentOS Linux release 8.5.2111

$ uname -a
Linux gip 4.18.0-348.el8.x86_64 #1 SMP Tue Oct 19 15:14:17 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
```
##  准备工作
###  配置 yum 源
开始编译之前，建议先配置好 yum 源，方便安装一些工具
```bash
# 直接替换yum源文件，并替换部分资源
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo
sed -i -e '/mirrors.cloud.aliyuncs.com/d' -e '/mirrors.aliyuncs.com/d' /etc/yum.repos.d/CentOS-Base.repo

# 删除其他无用的yum源文件
rm -f /etc/yum.repos.d/CentOS-Linux-*

#替换完后，更新缓存
yum clean all
yum makecache
```

###  安装 Docker
下载 Docker 的 yum 源，并清理生成新的 yum 缓存
```bash
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
yum clean all
yum makecache
```
安装 Docker，启动 Docker 并验证版本（Docker 版本最好不低于20.x版本）
```bash
yum install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
docker --version
```

##  拉取 GreatSQL-Build Docker 镜像

拉取[GreatSQL-Build Docker 镜像](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build)

```bash
docker pull greatsql/greatsql_build
```

如果无法从 hub.docker.com 拉取，可以尝试从阿里云 ACR 或腾讯云 TCR 拉取，例如：

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql_build
docker pull ccr.ccs.tencentyun.com/greatsql/greatsql_build
```

::: details 查看运行结果
如果提示 timeout 连接超时错误，多重试几次应该就好了。
:::

##  GreatSQL Build Docker镜像构建

创建新容器，进入容器后，手动调用执行脚本，开始编译 GreatSQL：

```bash
# 创建新容器
$ docker run -itd --hostname greatsql_build --name greatsql_build greatsql/greatsql_build

# 进入容器，手动启动编译工作
$ docker exec -it greatsql_build sh
sh-4.4# pwd
/
sh-4.4#
sh-4.4# ls
bin  boot  dev  etc  greatsql_build_init.sh  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var

sh-4.4# sh ./greatsql_build_init.sh
```

::: details 查看运行结果
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

编译完成后，可以将容器中编译好的二进制包文件拷贝到宿主机上，例如：

```shell
docker cp greatsql_build:/opt/GreatSQL-8.0.32-27-ol-glibc2.28-x86_64 /usr/local/
```

如果宿主机环境也是 CentOS x86_64 的话，这就可以在宿主机环境下直接使用该二进制文件包了。

::: tip 小贴士
编译工作需要消耗大量 CPU 资源，根据机器配置不同，可能需要的时间也不同，请耐心等待。在普通的 16 核 PC 工作机上约耗时10分钟。

编译过程中，可能会遇到网络问题（DNS解析失败、网络连接超时等）导致失败的话，多重试几次即可。
:::

如果需要自定义编译参数（例如修改版本号，或二进制包安装目录等），可自行修改 `/opt/greatsql-setenv.sh` 脚本，类似下面这样：

```ini
...
MAJOR_VERSION=8
MINOR_VERSION=0
PATCH_VERSION=39
RELEASE=39
REVISION=aaaaaaaaaaa
...
```
修改完上述几个参数后，重新编译 GreatSQL 完成后，启动、连接进入 GreatSQL，执行 SQL 命令 `status` 查看版本号就会变成类似下面这样：

::: details 查看运行结果
```
Server version:        8.0.39-39 GreatSQL, Release 39, Revision aaaaaaaaaaa
```
:::

至此，GreatSQL二进制安装包就编译成功了，接下来可以参考文档[二进制包安装并构建MGR集群](./3-install-with-tarball.md)继续进行数据库的初始化，以及MGR集群构建等工作，这里不赘述。

##  相关资源和延伸阅读
`GreatSQL-Build` 仓库地址详见：[https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build)

**延伸阅读**

- [在Linux下源码编译安装GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source.md)
- [麒麟OS+龙芯环境编译GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source-under-kylin-and-loongson.md)
- [openEuler、龙蜥Anolis、统信UOS系统下编译GreatSQL二进制包](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-under-openeuler-anolis-uos.md)


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
