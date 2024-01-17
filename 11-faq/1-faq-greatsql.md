# FAQ - GreatSQL相关
---

本文内容主要是GreatSQL相关的FAQ。

## 1. GreatSQL简介
GreatSQL数据库是一款**开源免费**数据库，可在普通硬件上满足金融级应用场景，具有**高可用**、**高性能**、**高兼容**、**高安全**等特性，可作为MySQL或Percona Server for MySQL的理想可选替换。

GreatSQL社区官网：[https://greatsql.cn](https://greatsql.cn)

## 2. GreatSQL的特色有哪些

GreatSQL主要有以下几个核心特性。

### 2.1 高可用

针对MGR进行了大量改进和提升工作，新增支持**地理标签**、**仲裁节点**、**读写节点可绑定动态IP**、**快速单主模式**、**智能选主**，并针对**流控算法**、**事务认证队列清理算法**、**节点加入&退出机制**、**recovery机制**等多项MGR底层工作机制算法进行深度优化，进一步提升优化了MGR的高可用保障及性能稳定性。

- 支持地理标签特性，提升多机房架构数据可靠性。
- 支持仲裁节点特性，用更低的服务器成本实现更高可用。
- 支持读写节点动态VIP特性，高可用切换更便捷。
- 支持快速单主模式，在单主模式下更快，性能更高。
- 支持智能选主特性，高可用切换选主机制更合理。
- 采用全新流控算法，使得事务更平稳，避免剧烈抖动。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 优化事务认证队列清理算法，高负载下不不复存在每60秒性能抖动问题。
- 解决了个别节点上磁盘空间爆满时导致MGR集群整体被阻塞的问题。
- 解决了长事务造成无法选主的问题。
- 修复了recovery过程中长时间等待的问题。

更多信息详见文档：[高可用](../5-enhance/5-2-ha.md)。

### 2.2 高性能
相对MySQL及Percona Server For MySQL的性能表现更稳定优异，支持**高性能的内存查询加速AP引擎**、**InnoDB并行查询**、**并行LOAD DATA**、**事务无锁化**、**线程池等**特性，在TPC-C测试中相对MySQL性能提升超过30%，在TPC-H测试中的性能表现是MySQL的十几倍甚至上百倍。

- 支持类似MySQL HeatWave的大规模并行、高性能的内存查询加速AP引擎，可将GreatSQL的数据分析性能提升几个数量级。
- 支持InnoDB并行查询，适用于轻量级OLAP应用场景，在TPC-H测试中平均提升15倍，最高提升40+倍。
- 优化InnoDB事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP场景整体性能提升约20%。
- 支持并行LOAD DATA，适用于频繁导入大批量数据的应用场景，性能可提升约20+倍。
- 支持线程池(Threadpool)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。

更多信息详见文档：[高性能](../5-enhance/5-1-highperf.md)。

### 2.3 高兼容

支持大多数常见Oracle用法，包括数据类型、函数、SQL语法、存储程序等兼容性用法。

更多信息详见文档：[高兼容](../5-enhance/5-3-easyuse.md)。

### 2.4 高安全

支持逻辑备份加密、CLONE备份加密、审计日志入表、表空间国密加密等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

更多信息详见文档：[高安全](../5-enhance/5-4-security.md)。

综上，GreatSQL数据库是一款**开源免费**数据库，可在普通硬件上满足金融级应用场景，具有**高可用**、**高性能**、**高兼容**、**高安全**等特性，可作为MySQL或Percona Server for MySQL的理想可选替换。

## 3. GreatSQL在哪里可以下载
### 3.1 二进制包、RPM包
二进制包下载地址：[https://gitee.com/GreatSQL/GreatSQL/releases](https://gitee.com/GreatSQL/GreatSQL/releases)

GreatSQL至少提供CentOS 7、CentOS 8两种操作系统，以及X86和ARM两种不同架构下的二进制包、RPM包。

除此外，GreatSQL还提供适用于国产化操作系统的二进制包或RPM包。

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

# 或自行指定版本
$ docker pull docker.io/greatsql/greatsql:8.0.32-25

# 或指定ARM版本
$ docker pull docker.io/greatsql/greatsql:8.0.32-25-aarch64
```

### 3.4 Ansible安装包
GreatSQL提供Ansible一键安装包，可在gitee或github下载：
- https://gitee.com/GreatSQL/GreatSQL-Ansible/releases
- https://github.com/GreatSQL/GreatSQL-Ansible/releases

## 4. 使用GreatSQL遇到问题时找谁

使用GreatSQL过程中如果遇到问题，可将问题细节整理清楚后，发布到GreatSQL社区论坛上，论坛地址：[https://greatsql.cn/forum.php](https://greatsql.cn/forum.php)。

也可以联系GreatSQL社区寻求帮助。

扫码添加GreatSQL社区助手：<br/>
-![扫码添加GreatSQL社区助手](./greatsql-wx-assist.jpg)

或扫码加入GreatSQL社区QQ群（533341697）：<br/>
-![或扫码加入GreatSQL社区QQ群533341697](./greatsql-qqqun.jpg)

您也可以先自行查阅GreatSQL用户手册，手册地址：[https://greatsql.cn/docs/](https://greatsql.cn/docs/)。

我们也发布了大量配套视频资源，视频观看地址：[视频资料](https://greatsql.cn/smx_course-lesson.html?op=video)。

## 5. GreatSQL相关资源有哪些

一、文档
目前GreatSQL相关文档全部发布在gitee上（[https://gitee.com/GreatSQL/GreatSQL-Doc/](https://gitee.com/GreatSQL/GreatSQL-Doc/)），主要有以下几部分

1. GreatSQL历史版本

- [历史版本变更说明](../1-docs-intro/1-2-release-history.md)

2. 《深入浅出MGR》系列

- 专栏文章：[https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr)

3. 《GreatSQL用户手册》

- [GreatSQL用户手册](https://greatsql.cn/docs/)

二、视频

1. 《实战MGR》

- [实战MGR](https://greatsql.cn/smx_course-lesson.html?op=video&ids=5)

2. 《深入浅出MGR》

- [深入浅出MGR](https://greatsql.cn/smx_course-lesson.html?op=video&ids=6)

3. 《零基础学习MySQL》

- [零基础学习MySQL](https://greatsql.cn/smx_course-lesson.html?op=video&ids=7)

4. 《GreatSQL GCA课程》

- [GreatSQL GCA课程](https://greatsql.cn/smx_course-lesson.html?op=video&ids=10)

5. 《GreatSQL GCP课程》

- [GreatSQL GCP课程](https://greatsql.cn/smx_course-lesson.html?op=video&ids=11)

6. GreatSQL新版本发布会

- [GreatSQL新版本发布会](https://greatsql.cn/smx_course-lesson.html?op=video&ids=9)

7. 其他公开分享

- [其他公开分享](https://greatsql.cn/smx_course-lesson.html?op=video&ids=4)


## 6. GreatSQL版本计划是怎样的

GreatSQL和MySQL一样，采用[GPLv2协议](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)。

GreatSQL版本号采用点分位命名规则（X.Y.Z-R）模式，其中
- X表示大版本号：MYSQL_VERSION_MAJOR，例如3.x、4.x、5.x、8.x等
- Y表示小版本号：MYSQL_VERSION_MINOR，例如3.23.x、4.0.x、4.1.x、5.0.x、5.1.x、5.5.x、5.6.x、5.7.x、8.0.x等
- Z表示补丁版本：MYSQL_VERSION_PATCH，例如3.23.58、4.0.30、4.1.25、5.0.96、5.1.73、5.5.62、5.6.51、5.7.37、8.0.29等
- R表示修订版本：MYSQL_VERSION_REVISION，例如5.7.36-39、8.0.25-16、8.0.32-25等

正常情况下，GreatSQL每年会发布两次版本，一般是上半年、下半年各发布一个新版本。




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
