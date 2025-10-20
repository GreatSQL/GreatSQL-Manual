# 编译源码安装
---

本文介绍如何在 Docker 环境中将 GreatSQL 源码编译到二进制包以及 RPM 包。

本文的宿主运行环境是 CentOS 8 x86_64，其他环境适配请自行修改Dockerfile及相关脚本中的参数。

```bash
$ cat /etc/redhat-release
CentOS Linux release 8.4.2105

$ uname -a
Linux greatsql 4.18.0-305.19.1.el8_4.x86_64 #1 SMP Wed Sep 15 15:39:39 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
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
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo && \
yum clean all && yum makecache
```

安装 Docker，启动 Docker 并验证版本（Docker 版本最好不低于20.x版本，这里指定了具体版本号）

```bash
yum install -y docker-ce-cli-1:26.1.3-1.el8.x86_64 docker-ce-3:26.1.3-1.el8.x86_64 docker-compose-plugin-2.6.0-3.el8.x86_64 docker-buildx-plugin-0.14.0-1.el8.x86_64 --allowerasing
```

加上 `--allowerasing` 参数是为了解决可能潜在的一些冲突。

安装完成后，执行 `docker -v` 检查确认版本：

```bash
docker -v

Docker version 26.1.3, build b72abbb
```

### 创建 Docker 容器

执行下面的命令拉取 Oracle Linux 镜像：

```bash
docker pull oraclelinux:8-slim
```

创建新容器：

```bash
docker run -itd --name greatsql_build oraclelinux:8-slim bash
```

进入该容器：

```bash
docker exec -it greatsql_build bash
```

后面所有的操作，若无特别说明，都是在该容器中进行，并以 root 账户身份执行操作。

## 初始化编译环境

**1. 在容器中安装 gcc, cmake 等必要的工具**

```bash
echo '[main]' > /etc/dnf/dnf.conf && \
microdnf install -y oracle-epel-release-el8 && \
microdnf install -y util-linux autoconf automake binutils bison bzip2 cmake cyrus-sasl-devel cyrus-sasl-scram \
gcc-c++ gcc-toolset-11 gcc-toolset-11-annobin-plugin-gcc gcc-toolset-11-libatomic-devel gzip jemalloc jemalloc-devel \
krb5-devel libaio-devel libatomic libcurl-devel libedit* libevent-devel libicu libicu-devel libtirpc-devel libudev-devel \
lz4 lz4-devel libzstd-devel make mecab-devel m4 ncurses-devel numactl-devel openldap-devel openssl openssl-devel \
pam-devel patchelf perl protobuf-lite* readline-devel rpcgen time systemd zlib-devel findutils procps-ng xz && \
microdnf update -y && microdnf clean all
```

::: tip 小贴士
1. 如果有遇到个别包不存在或报错，从列表中去掉即可。

2. 如果是在 ARM 架构下，可以不用安装 jemalloc, jemalloc-devel 这两个包。
:::

**2. 下载GreatSQL、boost源码包**

```bash
mkdir -p /opt && \
cd /opt && \
curl -kOL -o greatsql-8.4.4.tar.xz https://product.greatdb.com/GreatSQL-8.4.4-4/greatsql-8.4.4-4.tar.xz && \
curl -kOL -o boost_1_77_0.tar.bz2 https://sourceforge.net/projects/boost/files/boost/1.77.0/boost_1_77_0.tar.bz2 && \
curl -kOL -o patchelf-0.14.5.tar.gz https://gitee.com/GreatSQL/GreatSQL-Docker/raw/master/deppkgs/patchelf-0.14.5.tar.gz && 
curl -kOL -o rpcgen-1.3.1-4.el8.x86_64.rpm https://gitee.com/GreatSQL/GreatSQL-Docker/raw/master/deppkgs/rpcgen-1.3.1-4.el8.x86_64.rpm && 
tar xf greatsql-8.4.4-4.tar.xz && \
tar xf patchelf-0.14.5.tar.gz && \
tar xjf boost_1_77_0.tar.bz2
```

**3. 编译安装patchelf**

```bash
cd /opt/patchelf-0.14.5 && ./bootstrap.sh && ./configure && \
make && make install
```

如果你的编译环境中可以直接通过 yum/dnf/apt 方式直接安装 patchelf 包的话，就无需额外下载源码包和安装，可以通过 yum/dnf/apt 安装 patchelf：

```bash
# yum/dnf 安装
#dnf install -y patchelf
yum install -y patchelf

# apt 安装
apt install -y patchelf
```

**4. 安装 rpcgen**

```bash
rpm -ivh /opt/rpcgen-1.3.1-4.el8.x86_64.rpm
```

如果你的编译环境中可以直接通过 yum/dnf/apt 方式直接安装 rpcgen 包的话，就无需额外下载rpm包和安装，可以通过 yum/dnf/apt 安装 patchelf：

```bash
# yum/dnf 安装
#dnf install -y rpcgen
yum install -y rpcgen

# apt 安装
apt install -y rpcgen
```

## 编译 GreatSQL 二进制包

执行下面的命令开始编译安装：

```bash
export MAJOR_VERSION=8 && \
MINOR_VERSION=4 && \
PATCH_VERSION=4 && \
RELEASE=4 && \
REVISION=d73de75905d && \
OPT_DIR=/opt && \
GLIBC=`ldd --version | head -n 1 | awk '{print $NF}'` && \
ARCH=`uname -p` && \
OS=`grep '^ID=' /etc/os-release | sed 's/.*"\(.*\)".*/\1/ig'` && \
GREATSQL=GreatSQL-${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}-${RELEASE}-${OS}-glibc${GLIBC}-${ARCH} && \
MAKELOG=/tmp/greatsql-make.log && \
BOOST="boost_1_77_0" && \
DEST_DIR=${OPT_DIR}/${GREATSQL} && \
cd /opt/greatsql-8.4.4-4/ && \
mkdir bld && \
cd bld && \
cmake .. \
-DBUILD_CONFIG=mysql_release \
-DCMAKE_BUILD_TYPE=RelWithDebInfo \
-DCMAKE_EXE_LINKER_FLAGS=" -ljemalloc" \
-DCOMPILATION_COMMENT="GreatSQL, Release ${RELEASE}, Revision ${REVISION}" \
-DMAJOR_VERSION=${MAJOR_VERSION} -DMINOR_VERSION=${MINOR_VERSION} -DPATCH_VERSION=${PATCH_VERSION} \
-DBOOST_INCLUDE_DIR=${OPT_DIR}/${BOOST} \
-DLOCAL_BOOST_DIR=${OPT_DIR}/${BOOST} \
-DCMAKE_INSTALL_PREFIX=${DEST_DIR} \
-DWITH_ZLIB=bundled \
-DWITH_NUMA=ON \
-DWITH_TOKUDB=OFF \
-DWITH_ROCKSDB=OFF \
-DROCKSDB_DISABLE_AVX2=1 \
-DROCKSDB_DISABLE_MARCH_NATIVE=1 \
-DGROUP_REPLICATION_WITH_ROCKSDB=OFF \
-DALLOW_NO_SSE42=ON \
-DMYSQL_MAINTAINER_MODE=OFF \
-DFORCE_INSOURCE_BUILD=1 \
-DWITH_NDB=OFF \
-DWITH_NDBCLUSTER_STORAGE_ENGINE=OFF \
-DWITH_NDBCLUSTER=OFF \
-DWITH_UNIT_TESTS=OFF \
-DWITH_SSL=system \
-DWITH_SYSTEMD=ON \
-DWITH_AUTHENTICATION_LDAP=OFF \
-DWITH_PAM=1 \
-DWITH_LIBEVENT=bundled \
-DWITH_LDAP=system \
-DWITH_SYSTEM_LIBS=ON \
-DWITH_LZ4=bundled \
-DWITH_PROTOBUF=bundled \
-DWITH_RAPIDJSON=bundled \
-DWITH_ICU=bundled \
-DWITH_READLINE=system \
-DWITH_ZSTD=bundled \
-DWITH_FIDO=bundled \
-DWITH_KEYRING_VAULT=ON \
>> ${MAKELOG} 2>&1 && \
make -j14 >> ${MAKELOG} 2>&1 && \
make -j14 install >> ${MAKELOG} 2>&1
```
::: tip 小贴士

1. 编译工作需要消耗大量 CPU 资源，根据机器配置不同，可能需要的时间也不同，请耐心等待。在普通的 16 核 PC 工作机上约耗时10分钟。

2. 以服务器上有16核 CPU 为例，建议指定 "make -j14" 参数，不要把所有CPU都跑满。
 
3. 如果是 ARM 架构的服务器，可以不用添加 "-ljemalloc" 参数。
:::

如果编译过程都顺利的话，则完成后会将 GreatSQL 二进制包安装在 /opt 目录下，例如：

```bash
ls -la /opt

...
drwxrwxr-x 13 root root       293 Oct 16 06:45 GreatSQL-8.4.4-4-ol-glibc2.28-x86_64
drwxr-xr-x  8 root root      4096 Aug  5  2021 boost_1_77_0
-rw-r--r--  1 root root  92029112 Aug  5  2021 boost_1_77_0.tar.xz
drwxr-xr-x 35 root root      4096 Oct 16 06:29 greatsql-8.4.4-4
-rw-r--r--  1 root root 404712372 Oct 13 02:24 greatsql-8.4.4-4.tar.xz
-rw-r--r--  1 root root    124767 Oct 16 04:53 patchelf-0.14.5.tar.gz
drwxr-xr-x  3 root root        28 Oct 16 04:51 rh
-rw-r--r--  1 root root     53424 Oct 16 04:53 rpcgen-1.3.1-4.el8.x86_64.rpm


/opt/GreatSQL-8.4.4-4-ol-glibc2.28-x86_64/bin/mysqld -V

...
/opt/GreatSQL-8.4.4-4-ol-glibc2.28-x86_64/bin/mysqld  Ver 8.4.4-4 for Linux on x86_64 (GreatSQL, Release 4, Revision d73de75905d)
```

这就完成 GreatSQL 二进制包的编译工作了。

如果编译过程中发生错误，则会将所有日志记录到 */tmp/greatsql-make.log* 文件中，可以打开该文件分析具体原因再解决。

## 编译 GreatSQL RPM 包

**1. 安装软件包**

```bash
microdnf install -y libssh rpm-build time vim-common perl perl-Carp perl-Data-Dumper perl-Errno \
perl-Exporter perl-File-Temp perl-Getopt-Long perl-JSON perl-Memoize perl-Time-HiRes perl-generators perl*LWP* && \
microdnf update -y && microdnf clean all
```

**2. 创建工作目录**

执行下面的命令：

```bash
mkdir -p /opt/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
```

**3. 准备 RPM 编译相关文件**

```bash
cd /opt/greatsql-8.4.4-4/build-gs/rpm/ && \
cp mysql-5.7-sharedlib-rename.patch mysql_config.sh mysqld.cnf /opt/rpmbuild/SOURCES && \
cd /opt && \
cp boost_1_77_0.tar.xz greatsql-8.4.4-4.tar.xz /opt/rpmbuild/SOURCES
```

下载 *greatsql.spec* 文件到本地：

```bash
curl -kOL -o /opt/rpmbuild/SPECS/greatsql.spec https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/build-gs/greatsql.spec
```

**4. 准备 src.rpm 包

执行下面的命令构建GreatSQL src.rpm包：
```bash
cd /opt/rpmbuild && \
rpmbuild --nodebuginfo --define "_smp_mflags -j14" --define 'dist .ol8' --define "_topdir /opt/rpmbuild/" -bs ./SPECS/greatsql.spec

...
Wrote: /opt/rpmbuild/SRPMS/greatsql-8.4.4-4.1.ol8.src.rpm
```

如果顺利的话就会生成相应的 src.rpm 包，这个 src.rpm 包文件可以拷贝到其他相同服务器环境中编译 RPM 包。

**5. 编译 RPM 包**

接下来，利用 src.rpm 包编译出正式的 RPM 包：

```bash
cd /opt/rpmbuild && \
rpmbuild --nodebuginfo --define "_smp_mflags -j14" --define 'dist .ol8' --define "_topdir /opt/rpmbuild/" --rebuild SRPMS/greatsql-8.4.4-4.1.ol8.src.rpm > ./rpmbuild.log 2>&1
```

编译成功后，生成的 RPM 包文件放在 RPMS 目录下：

```bash
ls -la /opt/rpmbuild/RPMS

...
/opt/rpmbuild/RPMS:
total 4
drwxr-xr-x 3 root root   20 Oct 16 10:11 .
drwxr-xr-x 8 root root  109 Oct 16 09:46 ..
drwxr-xr-x 2 root root 4096 Oct 16 10:14 x86_64

/opt/rpmbuild/RPMS/x86_64:
total 977920
drwxr-xr-x 2 root root      4096 Oct 16 10:14 .
drwxr-xr-x 3 root root        20 Oct 16 10:11 ..
-rw-r--r-- 1 root root  70747972 Oct 16 10:12 greatsql-client-8.4.4-4.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root   8707856 Oct 16 10:14 greatsql-devel-8.4.4-4.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root   2273872 Oct 16 10:14 greatsql-icu-data-files-8.4.4-4.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root  74873792 Oct 16 10:14 greatsql-mysql-router-8.4.4-4.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root 406446944 Oct 16 10:12 greatsql-server-8.4.4-4.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root   5403800 Oct 16 10:14 greatsql-shared-8.4.4-4.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root 432917028 Oct 16 10:14 greatsql-test-8.4.4-4.1.ol8.x86_64.rpm
```

最后，将编译得到的二进制包及 RPM 包拷贝到宿主机中

```bash
# 拷贝二进制包
docker cp greatsql_build:/opt/GreatSQL-8.4.4-4-ol-glibc2.28-x86_64 /opt

# 拷贝 RPM 包
docker cp greatsql_build:/opt/rpmbuild/RPMS /opt
```

这些安装包可以分发到其他和编译环境相同（一般要求 CPU 架构和 glibc 版本一致）的服务器上进行安装。

**延伸阅读**

- [在Linux下源码编译安装GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source.md)
- [麒麟OS+龙芯环境编译GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source-under-kylin-and-loongson.md)
- [openEuler、龙蜥Anolis、统信UOS系统下编译GreatSQL二进制包](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-under-openeuler-anolis-uos.md)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
