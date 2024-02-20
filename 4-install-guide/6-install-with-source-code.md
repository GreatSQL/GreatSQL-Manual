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
## 1. 准备工作
### 1.1 配置 Yum 源
开始编译之前，建议先配置好 Yum 源，方便安装一些工具
```bash
# 直接替换yum源文件，并替换部分资源
$ curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo
$ sed -i -e '/mirrors.cloud.aliyuncs.com/d' -e '/mirrors.aliyuncs.com/d' /etc/yum.repos.d/CentOS-Base.repo

# 删除其他无用的yum源文件
$ rm -f /etc/yum.repos.d/CentOS-Linux-*

#替换完后，更新缓存
$ yum clean all
$ yum makecache
```

### 1.2 安装 Docker
下载 Docker 的 Yum 源，并清理生成新的 Yum 缓存
```bash
$ wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
$ yum clean all
$ yum makecache
```
安装 Docker，并启动 Docker 进程
```bash
$ yum install -y docker-ce docker-ce-cli containerd.io
```
启动 Docker 并验证版本
```bash
$ systemctl start docker
$ docker --version
Docker version 25.0.3, build 4debf41
```
### 1.3 安装 Git
安装Git方便拉取仓库
```bash
$ yum install -y git
```

## 2. 下载GreatSQL源码及Docker压缩包

### 2.1 下载Docker编译环境压缩包

到GreatSQL-Docker仓库下载GreatSQL Docker编译环境需要文件 [戳此下载](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build)

将仓库内文件下载后放在 `/opt/` 目录下：
```
$ cd /opt/
$ git clone https://gitee.com/GreatSQL/GreatSQL-Docker.git
$ cd GreatSQL-Docker
$ cd GreatSQL-Build
$ ls
Dockerfile  README.md  docker-entrypoint.sh  greatsql-automake.sh  patchelf-0.14.5.tar.gz  rpcgen-1.3.1-4.el8.x86_64.rpm
```
## 3. GreatSQL Build Docker镜像构建
```bash
$ docker build -t greatsql/greatsql_build .
```
上述命令会查找当前目录下的 Dockerfile 文件，并构建名为 greatsql/greatsql_build 的Docker 镜像。

在构建镜像时，会自动从服务器上下载相应的源码包文件、初始化脚本等文件，并全自动化方式完成镜像构建工作。

> 由于镜像构建需要下载基础镜像并进行层层构建，受限于当前机器配置和网络环境，整个构建过程可能需要一定时间，请耐心等待。
## 4. GreatSQL Build Docker镜像使用
```bash
# 创建新容器
$ docker run -itd --hostname greatsql_build --name greatsql_build greatsql/greatsql_build bash

# 查看自动编译进展
$ docker logs greatsql_build

1. compile patchelf
2. entering greatsql automake
3. greatsql automake completed
drwxrwxr-x 13 mysql mysql       293 Feb 18 08:29 GreatSQL-8.0.32-25-centos-glibc2.28-x86_64
/opt/GreatSQL-8.0.32-25-centos-glibc2.28-x86_64/bin/mysqld  Ver 8.0.32-25 for Linux on x86_64 (GreatSQL, Release 25, Revision 79f57097e3f)
4. entering /bin/bash
```
> 由于编译过程需要大量计算资源，根据机器配置不同,可能需要的时间也不同，请耐心等待。

可以看到已经完成编译，如果需要的话，可以将Docker容器中的二进制包文件拷贝到宿主机上，例如：

```bash
$ docker cp greatsql_build:/opt/GreatSQL-8.0.32-25-centos-glibc2.28-x86_64 /usr/local/
```
如果宿主机环境也是CentOS 8 x86_64的话，这就可以在宿主机环境下直接使用该二进制文件包了。

如果需要自定义编译参数，可以在 `greatsql-automake.sh` 脚本自行修改，然后删除 Dockerfile 第50行附近，在最后改成 COPY 方式，把在本地修改后的文件拷贝到Docker容器中，类似下面这样：
```bash
FROM centos:8
ENV LANG en_US.utf8

...
dnf install -y ${GREATSQL_BUILD_DOWNLOAD_URL}/${RPCGEN} > /dev/null 2>&1 && \
curl -o /${ENTRYPOINT} ${GREATSQL_BUILD_DOWNLOAD_URL}/${ENTRYPOINT} > /dev/null 2>&1 && \
...
chmod +x /docker-entrypoint.sh

#删除curl下载greatsql-automake.sh脚本工作，改成COPY
COPY ${GREATSQL_MAKESH} ${OPT_DIR}

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["bash"]
```

至此，GreatSQL二进制安装包就编译成功了，接下来可以参考文档[二进制包安装并构建MGR集群](./3-install-with-tarball.md)继续进行数据库的初始化，以及MGR集群构建等工作，这里不赘述。

## 4. 相关资源
`greatsql_docker_build` 仓库地址详见：[https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL-Build)

**延伸阅读**
- [在Linux下源码编译安装GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source.md)
- [麒麟OS+龙芯环境编译GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source-under-kylin-and-loongson.md)
- [openEuler、龙蜥Anolis、统信UOS系统下编译GreatSQL二进制包](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-under-openeuler-anolis-uos.md)

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
