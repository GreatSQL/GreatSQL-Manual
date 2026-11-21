# FAQ - GreatSQL Related
---

## 1. Introduction to GreatSQL
GreatSQL is an **open-source and free** database that can meet financial-grade application scenarios on commodity hardware. It features **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, and can serve as an ideal alternative to MySQL or Percona.

GreatSQL community official website: [https://greatsql.cn](https://greatsql.cn)

## 2. What are the advantages and features of GreatSQL

GreatSQL is an **open-source and free** database that can meet financial-grade application scenarios on commodity hardware. It features **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, and can serve as an ideal alternative to MySQL or Percona.

For details on the advantages and features of GreatSQL, see: [Advantages and features of GreatSQL](../1-docs-intro/1-3-greatsql-features.md).

## 3. Where can GreatSQL be downloaded
### 3.1 Binary packages and RPM packages
Binary package download address: [https://gitee.com/GreatSQL/GreatSQL/releases](https://gitee.com/GreatSQL/GreatSQL/releases)

GreatSQL provides binary packages, RPM packages, and SRC RPM packages for at least CentOS 7 and CentOS 8 operating systems, as well as for both X86 and ARM architectures.

In addition, GreatSQL also provides binary packages or RPM packages for some domestic (Chinese) operating systems, as well as binary packages supporting national cryptographic (SM) algorithms.

### 3.2 Source code
You can download the GreatSQL source code directly via git clone, for example:
```bash
# Download from gitee
git clone https://gitee.com/GreatSQL/GreatSQL.git

# Or download from github
git clone https://github.com/GreatSQL/GreatSQL.git
```

### 3.3 Docker images
GreatSQL provides Docker images that can be pulled directly from Docker Hub:
```bash
# Pull the latest version directly
docker pull docker.io/greatsql/greatsql

# Or specify a version number
docker pull docker.io/greatsql/greatsql:8.0.32-26
```

If you cannot pull the GreatSQL image from docker.io due to network issues, you can pull it from Alibaba Cloud ACR instead, as follows:

```bash
docker pull registry.cn-beijing.aliyuncs.com/greatsql/greatsql
```

You can also pull it from Tencent Cloud TCR:

```bash
docker pull ccr.ccs.tencentyun.com/greatsql/greatsql
```

### 3.4 Ansible installation package
GreatSQL provides a one-click Ansible installation package, available for download on Gitee or GitHub:
- [https://gitee.com/GreatSQL/GreatSQL-Ansible/releases](https://gitee.com/GreatSQL/GreatSQL-Ansible/releases)
- [https://github.com/GreatSQL/GreatSQL-Ansible/releases](https://github.com/GreatSQL/GreatSQL-Ansible/releases)

Starting from GreatSQL 8.0.32-25, the GreatSQL Ansible package is no longer updated. If you need to install GreatSQL via Ansible, you can use the **dbops** provided by Teacher Fenda, see: [dbops](https://gitee.com/fanderchan/dbops).

## 4. Who to contact when encountering problems with GreatSQL

If you encounter any problems while using GreatSQL, you can organize the details of the problem and post it to the GreatSQL community forum. Forum address: [https://greatsql.cn/forum.php](https://greatsql.cn/forum.php).

You can also contact the GreatSQL community for help.

Scan the QR code to add the GreatSQL community assistant: <br/>
![Scan to add the GreatSQL community assistant](./greatsql-wx-assist.jpg)

Or scan the QR code to join the GreatSQL community QQ group (533341697): <br/>
![Or scan to join the GreatSQL community QQ group 533341697](./greatsql-qqqun.jpg)

You can also consult the GreatSQL User Manual yourself first. Manual address: [https://greatsql.cn/docs/](https://greatsql.cn/docs/).

We have also published a large number of supporting video resources. Video viewing address: [Video resources](https://greatsql.cn/smx_course-lesson.html?op=video).

## 5. What resources are available for GreatSQL

1. Documentation
Currently, all GreatSQL documentation is published on Gitee ([https://gitee.com/GreatSQL/GreatSQL-Doc/](https://gitee.com/GreatSQL/GreatSQL-Doc/)), mainly including the following parts:

1. [GreatSQL historical versions](../1-docs-intro/1-2-release-history.md)

2. [The "Deep Dive into MGR" series of column articles](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr)

3. [GreatSQL User Manual](https://greatsql.cn/docs/)

2. Videos

1. [MGR in Practice](https://greatsql.cn/smx_course-lesson.html?op=video&ids=5)

2. [Deep Dive into MGR](https://greatsql.cn/smx_course-lesson.html?op=video&ids=6)

3. [Learn MySQL from Scratch](https://greatsql.cn/smx_course-lesson.html?op=video&ids=7)

4. [GreatSQL GCA Course](https://greatsql.cn/smx_course-lesson.html?op=video&ids=10)

5. [GreatSQL GCP Course](https://greatsql.cn/smx_course-lesson.html?op=video&ids=11)

6. [GreatSQL New Version Launch Event](https://greatsql.cn/smx_course-lesson.html?op=video&ids=9)

7. [Other public sharing](https://greatsql.cn/smx_course-lesson.html?op=video&ids=4)

After finishing the above courses, you can also register for the GreatSQL GCA or GCP certification exam. For details, see: [GreatSQL GCA/GCP training and certification](https://greatsql.cn/docs/community/4-greatsql-certified.html).

## 6. What is the GreatSQL version plan

GreatSQL is committed to maintaining the openness of open source. GreatSQL adopts the [GPLv2 license](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE).

The GreatSQL version number uses the dot-separated naming scheme (X.Y.Z-R), where:
- X denotes the major version: MYSQL_VERSION_MAJOR, e.g., 3.x, 4.x, 5.x, 8.x, etc.
- Y denotes the minor version: MYSQL_VERSION_MINOR, e.g., 3.23.x, 4.0.x, 4.1.x, 5.0.x, 5.1.x, 5.5.x, 5.6.x, 5.7.x, 8.0.x, etc.
- Z denotes the patch version: MYSQL_VERSION_PATCH, e.g., 3.23.58, 4.0.30, 4.1.25, 5.0.96, 5.1.73, 5.5.62, 5.6.51, 5.7.37, 8.0.29, etc.
- R denotes the revision: MYSQL_VERSION_REVISION, e.g., 5.7.36-39, 8.0.25-16, 8.0.32-25, etc.
- The GreatSQL version number corresponds to the Percona/Oracle MySQL version number.

Normally, GreatSQL releases two versions per year, usually one new version in the first half of the year and one in the second half.

## 7. Can I use GreatSQL for free

Yes.

On the basis of complying with the [GPLv2 license](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE), you can use GreatSQL completely free of charge.

If you need commercial service support, you can also scan the QR code at the bottom of the page to contact us.

## 8. Does GreatSQL have XC certification

GreatSQL is an **open-source and free** database and does not have XC certification. If you need a database product with XC certification, you can scan the QR code at the bottom of the page to contact us.

![Scan to add the GreatSQL community assistant](./greatsql-wx-assist.jpg)

## 9. Why does installing GreatSQL on openEuler report a compat-openssl-devel conflict

Why does installing greatsql with yum/dnf on openEuler report an error similar to the following:

```bash
$ dnf install greatsql-server

...
Error:
 Problem: problem with installed package openssl-devel-1:3.0.12-4.oe2403.x86_64
  - package compat-openssl11-devel-1:1.1.1m-10.oe2403.x86_64 from everything conflicts with openssl-devel provided by openssl-devel-1:3.0.12-4.oe2403.x86_64 from @System
...
```

This is because GreatSQL requires the compat-openssl-devel package when installed on openEuler, and this package conflicts with the system default openssl package, hence the above error. You can add the `--allowerasing` parameter during installation, which will automatically resolve the conflict and install compat-openssl-devel to replace the openssl-devel package:

```bash
$ dnf install -y --allowerasing greatsql-server

...
Removing dependent packages:
 openssl-devel                                    x86_64                          1:3.0.12-4.oe2403                             @OS                                  14 M
...
```

This issue is resolved starting from version 8.0.32-26.

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
