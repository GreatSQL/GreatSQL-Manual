# Compiling and Installing from Source Code
---

This article introduces how to compile the GreatSQL source code into binary packages and RPM packages in a Docker environment.

The host runtime environment of this article is CentOS 8 x86_64. For adaptation to other environments, please modify the parameters in the Dockerfile and related scripts yourself.

```bash
$ cat /etc/redhat-release
CentOS Linux release 8.4.2105

$ uname -a
Linux greatsql 4.18.0-305.19.1.el8_4.x86_64 #1 SMP Wed Sep 15 15:39:39 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
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

#After replacing, update the cache
yum clean all
yum makecache
```

### Installing Docker
Download Docker's yum source and clean up to generate a new yum cache
```bash
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo && \
yum clean all && yum makecache
```

Install Docker, start Docker and verify the version (the Docker version should preferably be no lower than 20.x; a specific version number is specified here)

```bash
yum install -y docker-ce-cli-1:26.1.3-1.el8.x86_64 docker-ce-3:26.1.3-1.el8.x86_64 docker-compose-plugin-2.6.0-3.el8.x86_64 docker-buildx-plugin-0.14.0-1.el8.x86_64 --allowerasing
```

The `--allowerasing` parameter is added to solve some potentially hidden conflicts.

After installation, execute `docker -v` to check and confirm the version:

```bash
docker -v

Docker version 26.1.3, build b72abbb
```

### Creating a Docker Container

Execute the following command to pull the Oracle Linux image:

```bash
docker pull oraclelinux:8-slim
```

Create a new container:

```bash
docker run -itd --name greatsql_build oraclelinux:8-slim bash
```

Enter the container:

```bash
docker exec -it greatsql_build bash
```

All subsequent operations, unless otherwise specified, are performed in this container and executed as the root account.

## Initializing the Compilation Environment

**1. Install necessary tools such as gcc, cmake in the container**

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

::: tip Tip
1. If some package does not exist or reports an error, just remove it from the list.

2. On ARM architecture, the two packages jemalloc and jemalloc-devel do not need to be installed.

3. After the above prerequisite tool packages are installed, execute `gcc -v` to view the gcc version. Generally, the version should not be lower than gcc 10; otherwise, compilation may fail.
:::

**2. Download the GreatSQL and boost source packages**

```bash
mkdir -p /opt && \
cd /opt && \
curl -kL -o greatsql-8.4.4-5.tar.xz https://product.greatdb.com/GreatSQL-8.4.4-5/greatsql-8.4.4-5.tar.xz && \
curl -kL -o boost_1_84_0.tar.bz2 https://sourceforge.net/projects/boost/files/boost/1.84.0/boost_1_84_0.tar.bz2 && \
curl -kL -o patchelf-0.14.5.tar.gz https://gitee.com/GreatSQL/GreatSQL-Docker/raw/master/deppkgs/patchelf-0.14.5.tar.gz && \
curl -kL -o rpcgen-1.3.1-4.el8.x86_64.rpm https://gitee.com/GreatSQL/GreatSQL-Docker/raw/master/deppkgs/rpcgen-1.3.1-4.el8.x86_64.rpm && \
tar xf greatsql-8.4.4-5.tar.xz && \
tar xf patchelf-0.14.5.tar.gz && \
tar xjf boost_1_84_0.tar.bz2
```

**3. Compile and install patchelf**

```bash
cd /opt/patchelf-0.14.5 && ./bootstrap.sh && ./configure && \
make && make install
```

If the patchelf package can be installed directly through yum/dnf/apt in your compilation environment, there is no need to additionally download and install the source package. patchelf can be installed through yum/dnf/apt:

```bash
# yum/dnf installation
#dnf install -y patchelf
yum install -y patchelf

# apt installation
apt install -y patchelf
```

**4. Install rpcgen**

```bash
rpm -ivh /opt/rpcgen-1.3.1-4.el8.x86_64.rpm
```

If the rpcgen package can be installed directly through yum/dnf/apt in your compilation environment, there is no need to additionally download and install the rpm package. rpcgen can be installed through yum/dnf/apt:

```bash
# yum/dnf installation
#dnf install -y rpcgen
yum install -y rpcgen

# apt installation
apt install -y rpcgen
```

## Compiling the GreatSQL Binary Package

Execute the following command to start the compilation and installation:

```bash
export MAJOR_VERSION=8 && \
MINOR_VERSION=4 && \
PATCH_VERSION=4 && \
RELEASE=5 && \
REVISION=39b389cdf3b && \
OPT_DIR=/opt && \
GLIBC=`ldd --version | head -n 1 | awk '{print $NF}'` && \
ARCH=`uname -p` && \
OS=`grep '^ID=' /etc/os-release | sed 's/.*"\(.*\)".*/\1/ig'` && \
GREATSQL=GreatSQL-${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}-${RELEASE}-${OS}-glibc${GLIBC}-${ARCH} && \
MAKELOG=/tmp/greatsql-make.log && \
BOOST="boost_1_84_0" && \
DEST_DIR=${OPT_DIR}/${GREATSQL} && \
cd /opt/greatsql-8.4.4-5/ && \
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
::: tip Tip

1. The compilation work consumes a lot of CPU resources. Depending on the machine configuration, the time required may vary. Please wait patiently. On an ordinary 16-core PC workstation, it takes about 10 minutes.

2. Taking a server with 16 CPU cores as an example, it is recommended to specify the "make -j14" parameter and not run all CPUs to full capacity.
 
3. On ARM architecture servers, the "-ljemalloc" parameter does not need to be added.
:::

If the compilation process goes smoothly, after completion, the GreatSQL binary package is installed in the /opt directory, for example:

```bash
ls -la /opt

...
drwxrwxr-x 13 root root       293 Oct 16 06:45 GreatSQL-8.4.4-5-ol-glibc2.28-x86_64
drwxr-xr-x  8 root root      4096 Aug  5  2021 boost_1_84_0
-rw-r--r--  1 root root 145151722 Aug  5  2021 boost_1_84_0.tar.bz2
drwxr-xr-x 35 root root      4096 Oct 16 06:29 greatsql-8.4.4-5
-rw-r--r--  1 root root 404712372 Oct 13 02:24 greatsql-8.4.4-5.tar.xz
-rw-r--r--  1 root root    124767 Oct 16 04:53 patchelf-0.14.5.tar.gz
drwxr-xr-x  3 root root        28 Oct 16 04:51 rh
-rw-r--r--  1 root root     53424 Oct 16 04:53 rpcgen-1.3.1-4.el8.x86_64.rpm


/opt/GreatSQL-8.4.4-5-ol-glibc2.28-x86_64/bin/mysqld -V

...
/opt/GreatSQL-8.4.4-5-ol-glibc2.28-x86_64/bin/mysqld  Ver 8.4.4-5 for Linux on x86_64 (GreatSQL, Release 5, Revision 39b389cdf3b)
```

This completes the compilation of the GreatSQL binary package.

If an error occurs during compilation, all logs are recorded in the */tmp/greatsql-make.log* file. You can open this file to analyze the specific cause and then solve it.

## Compiling the GreatSQL RPM Package

**1. Install software packages**

```bash
microdnf install -y libssh rpm-build time vim-common perl perl-Carp perl-Data-Dumper perl-Errno perl-Exporter \
perl-File-Temp perl-FindBin perl-Getopt-Long perl-JSON perl-Memoize perl-Time-HiRes perl-generators perl*LWP* && \
microdnf update -y && microdnf clean all
```

**2. Create the working directory**

Execute the following commands:

```bash
mkdir -p /opt/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
```

**3. Prepare RPM compilation related files**

```bash
cd /opt/greatsql-8.4.4-5/build-gs/rpm/ && \
cp mysql-5.7-sharedlib-rename.patch mysql_config.sh mysqld.cnf /opt/rpmbuild/SOURCES && \
cd /opt && \
cp boost_1_84_0.tar.bz2 greatsql-8.4.4-5.tar.xz /opt/rpmbuild/SOURCES
```

Download the *greatsql.spec* file to the local machine:

```bash
curl -kOL -o /opt/rpmbuild/SPECS/greatsql.spec https://gitee.com/GreatSQL/GreatSQL-Doc/raw/master/build-gs/greatsql.spec
```

**4. Prepare the src.rpm package**

Execute the following command to build the GreatSQL src.rpm package:
```bash
cd /opt/rpmbuild && \
rpmbuild --nodebuginfo --define "_smp_mflags -j14" --define 'dist .ol8' --define "_topdir /opt/rpmbuild/" -bs ./SPECS/greatsql.spec

...
Wrote: /opt/rpmbuild/SRPMS/greatsql-8.4.4-5.1.ol8.src.rpm
```

If all goes well, the corresponding src.rpm package is generated. This src.rpm package file can be copied to other identical server environments to compile RPM packages.

**5. Compile the RPM package**

Next, use the src.rpm package to compile the formal RPM package:

```bash
cd /opt/rpmbuild && \
rpmbuild --nodebuginfo --define "_smp_mflags -j14" --define 'dist .ol8' --define "_topdir /opt/rpmbuild/" --rebuild SRPMS/greatsql-8.4.4-5.1.ol8.src.rpm > ./rpmbuild.log 2>&1
```

After successful compilation, the generated RPM package files are placed in the RPMS directory:

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
-rw-r--r-- 1 root root  70747972 Oct 16 10:12 greatsql-client-8.4.4-5.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root   8707856 Oct 16 10:14 greatsql-devel-8.4.4-5.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root   2273872 Oct 16 10:14 greatsql-icu-data-files-8.4.4-5.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root  74873792 Oct 16 10:14 greatsql-mysql-router-8.4.4-5.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root 406446944 Oct 16 10:12 greatsql-server-8.4.4-5.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root   5403800 Oct 16 10:14 greatsql-shared-8.4.4-5.1.ol8.x86_64.rpm
-rw-r--r-- 1 root root 432917028 Oct 16 10:14 greatsql-test-8.4.4-5.1.ol8.x86_64.rpm
```

Finally, copy the compiled binary package and RPM packages to the host machine

```bash
# Copy the binary package
docker cp greatsql_build:/opt/GreatSQL-8.4.4-5-ol-glibc2.28-x86_64 /opt

# Copy the RPM packages
docker cp greatsql_build:/opt/rpmbuild/RPMS /opt
```

These installation packages can be distributed to other servers identical to the compilation environment (generally the CPU architecture and glibc version must be consistent) for installation.

**Extended Reading**

- [Compiling and Installing GreatSQL from Source Code under Linux](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source.md)
- [Compiling GreatSQL in Kylin OS + Loongson Environment](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source-under-kylin-and-loongson.md)
- [Compiling GreatSQL Binary Packages under openEuler, Anolis, and UOS Systems](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-under-openeuler-anolis-uos.md)

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
