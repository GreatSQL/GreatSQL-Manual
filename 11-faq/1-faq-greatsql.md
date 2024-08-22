# FAQ - GreatSQL相关
---

## 1. GreatSQL简介
GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

GreatSQL社区官网：[https://greatsql.cn](https://greatsql.cn)

## 2. GreatSQL的优势特性有哪些

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona Server for MySQL 的理想可选替换。

关于 GreatSQL 的优势特性详见：[GreatSQL优势特性](../1-docs-intro/1-3-greatsql-features.md)。

## 3. GreatSQL在哪里可以下载
### 3.1 二进制包、RPM包
二进制包下载地址：[https://gitee.com/GreatSQL/GreatSQL/releases](https://gitee.com/GreatSQL/GreatSQL/releases)

GreatSQL至少提供CentOS 7、CentOS 8两种操作系统，以及X86和ARM两种不同架构下的二进制包、RPM包、SRC RPM包。

除此外，GreatSQL 还提供适用于部分国产化操作系统的二进制包或RPM包，以及支持国密加密算法的二进制包。

### 3.2 源码
可以直接用git clone的方式下载GreatSQL源码，例如：
```
# 可从gitee下载
$ git clone https://gitee.com/GreatSQL/GreatSQL.git

# 或从github下载
$ git clone https://github.com/GreatSQL/GreatSQL.git
```
### 3.3 Docker镜像
GreatSQL提供Docker镜像，可直接从docker hub拉取：
```
# 直接下载最新版本
$ docker pull docker.io/greatsql/greatsql

# 或自行指定版本号
$ docker pull docker.io/greatsql/greatsql:8.0.32-26
```

若由于网络原因无法从 docker.io 拉取 GreatSQL 镜像的话，可以改成从阿里云 ACR 拉取，方法如下：

```shell
$ docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

也可以从腾讯云 TCR 拉取：

```shell
$ docker pull ccr.ccs.tencentyun.com/greatsql/greatsql
```

### 3.4 Ansible安装包
GreatSQL提供Ansible一键安装包，可在gitee或github下载：
- https://gitee.com/GreatSQL/GreatSQL-Ansible/releases
- https://github.com/GreatSQL/GreatSQL-Ansible/releases

从GreatSQL 8.0.32-25版本开始，GreatSQL Ansible暂停更新，如果您需要通过Ansible安装GreatSQL，可以采用芬达老师提供的**dbops**，详见：[dbops](https://gitee.com/fanderchan/dbops)。

## 4. 使用GreatSQL遇到问题时找谁

使用GreatSQL过程中如果遇到问题，可将问题细节整理清楚后，发布到GreatSQL社区论坛上，论坛地址：[https://greatsql.cn/forum.php](https://greatsql.cn/forum.php)。

也可以联系GreatSQL社区寻求帮助。

扫码添加GreatSQL社区助手：<br/>
![扫码添加GreatSQL社区助手](./greatsql-wx-assist.jpg)

或扫码加入GreatSQL社区QQ群（533341697）：<br/>
![或扫码加入GreatSQL社区QQ群533341697](./greatsql-qqqun.jpg)

您也可以先自行查阅GreatSQL用户手册，手册地址：[https://greatsql.cn/docs/](https://greatsql.cn/docs/)。

我们也发布了大量配套视频资源，视频观看地址：[视频资料](https://greatsql.cn/smx_course-lesson.html?op=video)。

## 5. GreatSQL相关资源有哪些

一、文档
目前GreatSQL相关文档全部发布在gitee上（[https://gitee.com/GreatSQL/GreatSQL-Doc/](https://gitee.com/GreatSQL/GreatSQL-Doc/)），主要有以下几部分

1. [GreatSQL历史版本](../1-docs-intro/1-2-release-history.md)

2. [《深入浅出MGR》系列专栏文章](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr)

3. [《GreatSQL用户手册》](https://greatsql.cn/docs/)

二、视频

1. [《实战MGR》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=5)

2. [《深入浅出MGR》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=6)

3. [《零基础学习MySQL》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=7)

4. [《GreatSQL GCA课程》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=10)

5. [《GreatSQL GCP课程》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=11)

6. [GreatSQL新版本发布会](https://greatsql.cn/smx_course-lesson.html?op=video&ids=9)

7. [其他公开分享](https://greatsql.cn/smx_course-lesson.html?op=video&ids=4)

您学习完上述课程后，还可以报名参加GreatSQL GCA或GCP认证考试，详见：[GreatSQL GCA/GCP培训认证](https://greatsql.cn/docs/community/4-greatsql-certified.html)。


## 6. GreatSQL版本计划是怎样的

GreatSQL 致力于保持开源的开放性。GreatSQL 采用 [GPLv2 协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)。

GreatSQL版本号采用点分位命名规则（X.Y.Z-R）模式，其中
- X表示大版本号：MYSQL_VERSION_MAJOR，例如3.x、4.x、5.x、8.x等
- Y表示小版本号：MYSQL_VERSION_MINOR，例如3.23.x、4.0.x、4.1.x、5.0.x、5.1.x、5.5.x、5.6.x、5.7.x、8.0.x等
- Z表示补丁版本：MYSQL_VERSION_PATCH，例如3.23.58、4.0.30、4.1.25、5.0.96、5.1.73、5.5.62、5.6.51、5.7.37、8.0.29等
- R表示修订版本：MYSQL_VERSION_REVISION，例如5.7.36-39、8.0.25-16、8.0.32-25等
- GreatSQL版本号与Percona Server for MySQL/Oracle MySQL版本号对应。

正常情况下，GreatSQL每年会发布两次版本，一般是上半年、下半年各发布一个新版本。


## 7. 我可以免费使用GreatSQL吗

是的。

在遵循[GPLv2协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)的基础上，您可以完全免费使用GreatSQL。

如果您需要商业服务支持，也可以扫描页面下方二维码联系我们。

## 8. GreatSQL具有XC资质吗

GreatSQL 数据库是一款 **开源免费** 数据库，没有 XC 资质。如果您需要有 XC 资质的数据库产品，可以扫描页面下方二维码联系我们。

![扫码添加GreatSQL社区助手](./greatsql-wx-assist.jpg)

## 9. 为什么在 openEuler 系统中安装 GreatSQL 时提示 compat-openssl-devel 冲突

为什么在 openEuler 系统中用 yum/dnf 安装 greatsql 时会提示类似下面的错误：

```shell
$ dnf install greatsql-server
...
Error:
 Problem: problem with installed package openssl-devel-1:3.0.12-4.oe2403.x86_64
  - package compat-openssl11-devel-1:1.1.1m-10.oe2403.x86_64 from everything conflicts with openssl-devel provided by openssl-devel-1:3.0.12-4.oe2403.x86_64 from @System
...
```

这是因为 GreatSQL 在 openEuler 中安装时需要依赖 compat-openssl-devel 包，而这个包和系统默认的 openssl 包产生冲突了，因此会有上述报错。可以在安装时加上 --allowerasing 参数，这时就会自动解决冲突问题，安装 compat-openssl-devel 以替换 openssl-devel 包：

```shell
$ dnf install -y --allowerasing greatsql-server
...
Removing dependent packages:
 openssl-devel                                    x86_64                          1:3.0.12-4.oe2403                             @OS                                  14 M
...
```

这个问题从 8.0.32-26 版本开始会得到解决。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
