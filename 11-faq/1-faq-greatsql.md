# FAQ - GreatSQL 相关
---

## 1. GreatSQL 简介
GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona 的理想可选替换。

GreatSQL 社区官网：[https://greatsql.cn](https://greatsql.cn)

## 2. GreatSQL 的优势特性有哪些

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona 的理想可选替换。

关于 GreatSQL 的优势特性详见：[GreatSQL 优势特性](../1-docs-intro/1-3-greatsql-features.md)。

## 3. GreatSQL 在哪里可以下载
### 3.1 二进制包、RPM 包
二进制包下载地址：[https://gitee.com/GreatSQL/GreatSQL/releases](https://gitee.com/GreatSQL/GreatSQL/releases)

GreatSQL 至少提供 CentOS 7、CentOS 8 两种操作系统，以及 X86 和 ARM 两种不同架构下的二进制包、RPM 包、SRC RPM 包。

除此外，GreatSQL 还提供适用于部分国产化操作系统的二进制包或 RPM 包，以及支持国密加密算法的二进制包。

### 3.2 源码
可以直接用 git clone 的方式下载 GreatSQL 源码，例如：
```bash
# 从gitee下载
git clone https://gitee.com/GreatSQL/GreatSQL.git

# 或从github下载
git clone https://github.com/GreatSQL/GreatSQL.git
```

### 3.3 Docker 镜像
GreatSQL 提供 Docker 镜像，可直接从 Docker Hub 拉取：
```bash
# 直接下载最新版本
docker pull docker.io/greatsql/greatsql

# 或自行指定版本号
docker pull docker.io/greatsql/greatsql:8.0.32-26
```

若由于网络原因无法从 docker.io 拉取 GreatSQL 镜像的话，可以改成从阿里云 ACR 拉取，方法如下：

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

也可以从腾讯云 TCR 拉取：

```bash
docker pull ccr.ccs.tencentyun.com/greatsql/greatsql
```

### 3.4 Ansible 安装包
GreatSQL 提供 Ansible 一键安装包，可在 Gitee 或 GitHub 下载：
- [https://gitee.com/GreatSQL/GreatSQL-Ansible/releases](https://gitee.com/GreatSQL/GreatSQL-Ansible/releases)
- [https://github.com/GreatSQL/GreatSQL-Ansible/releases](https://github.com/GreatSQL/GreatSQL-Ansible/releases)

从 GreatSQL 8.0.32-25 版本开始，GreatSQL Ansible 暂停更新，如果您需要通过 Ansible 安装 GreatSQL，可以采用芬达老师提供的 **dbops**，详见：[dbops](https://gitee.com/fanderchan/dbops)。

## 4. 使用 GreatSQL 遇到问题时找谁

使用 GreatSQL 过程中如果遇到问题，可将问题细节整理清楚后，发布到 GreatSQL 社区论坛上，论坛地址：[https://greatsql.cn/forum.php](https://greatsql.cn/forum.php)。

也可以联系 GreatSQL 社区寻求帮助。

扫码添加 GreatSQL 社区助手：<br/>
![扫码添加GreatSQL社区助手](./greatsql-wx-assist.jpg)

或扫码加入 GreatSQL 社区 QQ 群（533341697）：<br/>
![或扫码加入GreatSQL社区QQ群533341697](./greatsql-qqqun.jpg)

您也可以先自行查阅 GreatSQL 用户手册，手册地址：[https://greatsql.cn/docs/](https://greatsql.cn/docs/)。

我们也发布了大量配套视频资源，视频观看地址：[视频资料](https://greatsql.cn/smx_course-lesson.html?op=video)。

## 5. GreatSQL 相关资源有哪些

一、文档
目前 GreatSQL 相关文档全部发布在 Gitee 上（[https://gitee.com/GreatSQL/GreatSQL-Doc/](https://gitee.com/GreatSQL/GreatSQL-Doc/)），主要有以下几部分

1. [GreatSQL 历史版本](../1-docs-intro/1-2-release-history.md)

2. [《深入浅出 MGR》系列专栏文章](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr)

3. [《GreatSQL 用户手册》](https://greatsql.cn/docs/)

二、视频

1. [《实战 MGR》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=5)

2. [《深入浅出 MGR》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=6)

3. [《零基础学习 MySQL》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=7)

4. [《GreatSQL GCA 课程》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=10)

5. [《GreatSQL GCP 课程》](https://greatsql.cn/smx_course-lesson.html?op=video&ids=11)

6. [GreatSQL 新版本发布会](https://greatsql.cn/smx_course-lesson.html?op=video&ids=9)

7. [其他公开分享](https://greatsql.cn/smx_course-lesson.html?op=video&ids=4)

您学习完上述课程后，还可以报名参加 GreatSQL GCA 或 GCP 认证考试，详见：[GreatSQL GCA/GCP 培训认证](https://greatsql.cn/docs/community/4-greatsql-certified.html)。


## 6. GreatSQL 版本计划是怎样的

GreatSQL 致力于保持开源的开放性。GreatSQL 采用 [GPLv2 协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)。

GreatSQL 版本号采用点分位命名规则（X.Y.Z-R）模式，其中
- X 表示大版本号：MYSQL_VERSION_MAJOR，例如 3.x、4.x、5.x、8.x 等
- Y 表示小版本号：MYSQL_VERSION_MINOR，例如 3.23.x、4.0.x、4.1.x、5.0.x、5.1.x、5.5.x、5.6.x、5.7.x、8.0.x 等
- Z 表示补丁版本：MYSQL_VERSION_PATCH，例如 3.23.58、4.0.30、4.1.25、5.0.96、5.1.73、5.5.62、5.6.51、5.7.37、8.0.29 等
- R 表示修订版本：MYSQL_VERSION_REVISION，例如 5.7.36-39、8.0.25-16、8.0.32-25 等
- GreatSQL 版本号与 Percona/Oracle MySQL 版本号对应。

正常情况下，GreatSQL 每年会发布两次版本，一般是上半年、下半年各发布一个新版本。


## 7. 我可以免费使用 GreatSQL 吗

是的。

在遵循[GPLv2 协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)的基础上，您可以完全免费使用 GreatSQL。

如果您需要商业服务支持，也可以扫描页面下方二维码联系我们。

## 8. GreatSQL 具有 XC 资质吗

GreatSQL 数据库是一款 **开源免费** 数据库，没有 XC 资质。如果您需要有 XC 资质的数据库产品，可以扫描页面下方二维码联系我们。

![扫码添加GreatSQL社区助手](./greatsql-wx-assist.jpg)

## 9. 为什么在 openEuler 系统中安装 GreatSQL 时提示 compat-openssl-devel 冲突

为什么在 openEuler 系统中用 yum/dnf 安装 greatsql 时会提示类似下面的错误：

```bash
$ dnf install greatsql-server

...
Error:
 Problem: problem with installed package openssl-devel-1:3.0.12-4.oe2403.x86_64
  - package compat-openssl11-devel-1:1.1.1m-10.oe2403.x86_64 from everything conflicts with openssl-devel provided by openssl-devel-1:3.0.12-4.oe2403.x86_64 from @System
...
```

这是因为 GreatSQL 在 openEuler 中安装时需要依赖 compat-openssl-devel 包，而这个包和系统默认的 openssl 包产生冲突了，因此会有上述报错。可以在安装时加上 --allowerasing 参数，这时就会自动解决冲突问题，安装 compat-openssl-devel 以替换 openssl-devel 包：

```bash
$ dnf install -y --allowerasing greatsql-server

...
Removing dependent packages:
 openssl-devel                                    x86_64                          1:3.0.12-4.oe2403                             @OS                                  14 M
...
```

这个问题从 8.0.32-26 版本开始会得到解决。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
