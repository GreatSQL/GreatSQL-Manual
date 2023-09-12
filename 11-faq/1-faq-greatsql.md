# FAQ - GreatSQL相关
---

本文内容主要是GreatSQL相关的FAQ。

## 1. GreatSQL简介
GreatSQL开源数据库是适用于金融级应用的国内自主MySQL版本，专注于提升MGR可靠性及性能，支持InnoDB并行查询等特性，可以作为MySQL或Percona Server的可选替换，用于线上生产环境，且完全免费并兼容MySQL或Percona Server。

GreatSQL除了提升MGR性能及可靠性，还引入InnoDB事务锁优化及并行查询优化等特性，以及众多BUG修复。

GreatSQL社区官网：[https://greatsql.cn](https://greatsql.cn)

## 2. GreatSQL的特色有哪些

相较于MySQL/Percona Server，GreatSQL主要增加几个特性：
1. **地理标签**
1. **仲裁节点**
1. **快速单主**
1. **智能选主**
1. **并行查询**

选用GreatSQl主要有以下几点优势：

- 专注于提升MGR可靠性及性能，支持InnoDB并行查询特性
- 是适用于金融级应用的MySQL分支版本
- 地理标签，提升多机房架构数据可靠性
- 仲裁节点，用更低的服务器成本实现更高可用
- 单主模式下更快，选主机制更完善
- InnoDB表也支持并行查询，让CPU资源不再浪费
- 全新流控机制，让MGR运行更流畅不频繁抖动
- 相对官方社区版，MGR运行更稳定、可靠
- 其他...

无论是更可靠的MGR还是性能更好的InnoDB，都值得将当前的MySQL或Percona Server升级到GreatSQL。

目前GreatSQL最新版本是8.0.32-24，[可点击这里下载最新版本](https://gitee.com/GreatSQL/GreatSQL/releases)

关于GreatSQL的优势可阅读下面几篇文章：

- [GreatSQL 8.0.32-24](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/changes-greatsql-8-0-32-24-20230605.md)

- [GreatSQL 8.0.25-17](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-17-20230313.md)
- [GreatSQL 8.0.25-16](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-16-20220516.md)
- [GreatSQL 8.0.25-15](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-20210820.md)
- [GreatSQL 5.7.36-39](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-5-7-36-20220407.md)
- [GreatSQL重磅特性，InnoDB并行并行查询优化测试](https://mp.weixin.qq.com/s/_LeEtwJlfyvIlxzLoyNVdA)
- [面向金融级应用的GreatSQL正式开源](https://mp.weixin.qq.com/s/cI_wPKQJuXItVWpOx_yNTg)

## 3. GreatSQL在哪里可以下载
### 二进制包、RPM包
二进制包下载地址：[https://gitee.com/GreatSQL/GreatSQL/releases](https://gitee.com/GreatSQL/GreatSQL/releases)

目前提供CentOS 7、CentOS 8两种操作系统，以及X86和ARM两种不同架构下的二进制包、RPM包。

带 **minimal** 关键字的安装包是对二进制文件进行strip后，所以文件尺寸较小，功能上没本质区别，仅是不支持gdb debug功能，可以放心使用。
### 源码
可以直接用git clone的方式下载GreatSQL源码，例如：
```
# 可从gitee下载
$ git clone https://gitee.com/GreatSQL/GreatSQL.git

# 或从github下载
$ git clone https://github.com/GreatSQL/GreatSQL.git
```

### Ansible安装包
GreatSQL提供Ansible一键安装包，可在gitee或github下载：
- https://gitee.com/GreatSQL/GreatSQL-Ansible/releases
- https://github.com/GreatSQL/GreatSQL-Ansible/releases

### Docker镜像
GreatSQL提供Docker镜像，可直接从docker hub拉取：
```
# 直接下载最新版本
$ docker pull docker.io/greatsql/greatsql

# 或自行指定版本
$ docker pull docker.io/greatsql/greatsql:8.0.25

# 或指定ARM版本
$ docker pull docker.io/greatsql/greatsql:8.0.25-aarch64
```

## 4. 使用GreatSQL遇到问题时找谁

使用GreatSQL过程中如果遇到问题，可将问题细节整理清楚后，联系GreatSQL社区寻求帮助。

扫码添加GreatSQL社区助手：<br/>
-![扫码添加GreatSQL社区助手](greatsql-wx-assist.jpg)

或扫码加入GreatSQL社区QQ群（533341697）：<br/>
-![或扫码加入GreatSQL社区QQ群533341697](greatsql-qqqun.jpg)

此外，我们已经在B站发布MGR相关系列视频，可以前往学习，视频链接：[https://space.bilibili.com/1363850082](https://space.bilibili.com/1363850082) 。

## 5. GreatSQL相关资源有哪些

一、文档
目前GreatSQL相关文档全部发布在gitee上（[https://gitee.com/GreatSQL/GreatSQL-Doc/](https://gitee.com/GreatSQL/GreatSQL-Doc/)），主要有以下几部分
1. GreatSQL历史版本说明
- https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/changes-greatsql-8-0-32-24-20230605.md

- [https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-17-20230313.md](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-17-20230313.md)
- [https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-16-20220516.md](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-16-20220516.md)
- [https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-20210820.md](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-20210820.md)
- [https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-5-7-36-20220407.md](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-5-7-36-20220407.md)

2. 《深入浅出MGR》系列
- [https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/deep-dive-mgr)

3. 《GreatSQL手册》系列，地址
- [https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/user-manual](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/user-manual)

二、视频
目前GreatSQL相关视频全部发布在B站上（[https://space.bilibili.com/1363850082](https://space.bilibili.com/1363850082)），主要有以下几部分

1. 《实战MGR》
- [https://space.bilibili.com/1363850082/channel/seriesdetail?sid=488623&ctype=0](https://space.bilibili.com/1363850082/channel/seriesdetail?sid=488623&ctype=0)

2. 《深入浅出MGR》
- [https://space.bilibili.com/1363850082/channel/collectiondetail?sid=343928&ctype=0](https://space.bilibili.com/1363850082/channel/collectiondetail?sid=343928&ctype=0)

3. 《零基础学习MySQL》
- [https://space.bilibili.com/1363850082/channel/collectiondetail?sid=328292&ctype=0](https://space.bilibili.com/1363850082/channel/collectiondetail?sid=328292&ctype=0)

4. 《GCA_GreatSQL课程》

- https://www.bilibili.com/video/BV1qk4y1N7dB/?vd_source=ae1951b64ea7b9e6ba11f1d0bbcff0e4

5. 万里数据库工程师的公开分享

- [https://www.bilibili.com/medialist/detail/ml1406093582?type=1&spm_id_from=333.999.0.0](https://www.bilibili.com/medialist/detail/ml1406093582?type=1&spm_id_from=333.999.0.0)


## 6. GreatSQL版本计划是怎样的
GreatSQL不计划每个小版本都跟随，暂定奇数版本跟随方式，即 8.0.25、8.0.27、8.0.29 ... 以此类推。

未来若有版本计划变更我们再更新。

目前已有的版本：<br/>

**GreatSQL 8.0**

- [GreatSQL 8.0.32-24](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/greatsql-803224/changes-greatsql-8-0-32-24-20230605.md)

- [GreatSQL 8.0.25-17](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-17-20230313.md)
- [GreatSQL 8.0.25-16](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-16-20220516.md)
- [GreatSQL 8.0.25-15](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-8-0-25-20210820.md)

**GreatSQL 5.7**
- [GreatSQL 5.7.36-39](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/relnotes/changes-greatsql-5-7-36-20220407.md)




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
