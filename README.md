[![](https://img.shields.io/badge/GreatSQL-官网-orange.svg)](https://greatsql.cn/)
[![](https://img.shields.io/badge/GreatSQL-论坛-brightgreen.svg)](https://greatsql.cn/forum.php)
[![](https://img.shields.io/badge/GreatSQL-博客-brightgreen.svg)](https://greatsql.cn/home.php?mod=space&uid=10&do=blog&view=me&from=space)
[![](https://img.shields.io/badge/License-GPL_v2.0-blue.svg)](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE)
[![](https://img.shields.io/badge/release-8.0.32_25-blue.svg)](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26)

最后更新：2024-06-25。

本文档适用版本：GreatSQL 8.0.32-26。

## 关于 GreatSQL
---

GreatSQL 数据库是一款**开源免费**数据库，可在普通硬件上满足金融级应用场景，具有**高可用**、**高性能**、**高兼容**、**高安全**等特性，可作为MySQL或Percona Server for MySQL的理想可选替换。

![GreatSQL LOGO](./GreatSQL-logo-01.png "GreatSQL LOGO")

## 下载GreatSQL
---

- [下载 GreatSQL 最新版本](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-26)
- [下载 GreatSQL 历史版本](https://gitee.com/GreatSQL/GreatSQL/releases/)

## GreatSQL核心特性
---

### [高可用](./5-enhance/5-2-ha.md)
针对MGR进行了大量改进和提升工作，新增支持**地理标签**、**仲裁节点**、**读写节点可绑定动态IP**、**快速单主模式**、**智能选主**，并针对**流控算法**、**事务认证队列清理算法**、**节点加入&退出机制**、**recovery机制**等多项MGR底层工作机制算法进行深度优化，进一步提升优化了MGR的高可用保障及性能稳定性。

- 支持 [地理标签](./5-enhance/5-2-ha-mgr-zoneid.md) 特性，提升多机房架构数据可靠性。
- 支持 [仲裁节点](./5-enhance/5-2-ha-mgr-arbitrator.md) 特性，用更低的服务器成本实现更高可用。
- 支持 [读写节点动态VIP](./5-enhance/5-2-ha-mgr-vip.md) 特性，高可用切换更便捷。
- 支持 [快速单主模式](./5-enhance/5-2-ha-mgr-fast-mode.md)，在单主模式下更快，性能更高。
- 支持 [智能选主](./5-enhance/5-2-ha-mgr-election-mode.md) 特性，高可用切换选主机制更合理。
- 采用 [全新流控算法](./5-enhance/5-2-ha-mgr-new-fc.md)，使得事务更平稳，避免剧烈抖动。
- 优化了节点加入、退出时可能导致性能剧烈抖动的问题。
- 优化事务认证队列清理算法，高负载下不复存在每60秒性能抖动问题。
- 解决了个别节点上磁盘空间爆满时导致MGR集群整体被阻塞的问题。
- 解决了长事务造成无法选主的问题。
- 修复了recovery过程中长时间等待的问题。

更多信息详见文档：[高可用](./5-enhance/5-2-ha.md)。

### [高性能](./5-enhance/5-1-highperf.md)
相对MySQL及Percona Server For MySQL的性能表现更稳定优异，支持**高性能的内存查询加速 Rapid 引擎**、**InnoDB并行查询**、**并行LOAD DATA**、**事务无锁化**、**线程池等**特性，在TPC-C测试中相对MySQL性能提升超过30%，在TPC-H测试中的性能表现是MySQL的十几倍甚至上百倍。

- 支持 [大规模并行、高性能的内存查询加速 Rapid 引擎](./5-enhance/5-1-highperf-rapid-engine.md)，可将GreatSQL的数据分析性能提升几个数量级。
- 优化InnoDB事务系统，实现了大锁拆分及无锁化等多种优化方案，OLTP场景整体性能提升约20%。
- 支持 [并行LOAD DATA](./5-enhance/5-1-highperf-parallel-load.md)，适用于频繁导入大批量数据的应用场景，性能可提升约20+倍；对于无显式定义主键的场景亦有优化提升。
- 支持 [异步删除大表](./5-enhance/5-1-highperf-async-purge-big-table.md)，提高InnoDB引擎运行时性能的稳定性。
- 支持 [线程池](./5-enhance/5-1-highperf-thread-pool.md)，降低了线程创建和销毁的代价，保证高并发下，性能稳定不会明显衰退。
- 支持 [非阻塞式 DDL](./5-enhance/5-1-highperf-nonblocking-ddl.md)，可以避免数据库因为必须尽快完成 DDL 操作而导致业务请求大量被阻塞的问题。
- 支持 [NUMA 亲和性优化](./5-enhance/5-1-highperf-numa-affinity.md)，通过 NUMA 亲和性调度优化，将前端用户线程和后台线程绑定到固定 NUMA 节点上以提升线程处理性能。

更多信息详见文档：[高性能](./5-enhance/5-1-highperf.md)。

### [高兼容](./5-enhance/5-3-easyuse.md)

GreatSQL 实现 100% 完全兼容 MySQL 及 Percona Server For MySQL 用法，支持大多数常见 Oracle 用法，包括 [数据类型兼容、函数兼容、SQL语法、存储程序兼容](./5-enhance/5-3-easyuse.md) 等众多兼容扩展用法。

更多信息详见文档：[高兼容](./5-enhance/5-3-easyuse.md)。

### [高安全](./5-enhance/5-4-security.md)

- 支持 [mysqldump 逻辑备份加密](./5-enhance/5-4-security-mysqldump-encrypt.md)，提供了利用 mysqldump 逻辑备份的安全加密需求。
- 支持 [Clone 备份加密](./5-enhance/5-4-security-clone-encrypt.md)，提供了利用 Clone 物理备份的安全加密需求。
- 支持 [审计功能](./5-enhance/5-4-security-audit.md)，及时记录和发现未授权或不安全行为。
- 支持 [InnoDB 表空间国密加密算法](./5-enhance/5-4-security-innodb-tablespace-encrypt.md)，确保重要数据的加密安全。
- 支持 [基于函数和策略的两种数据脱敏](./5-enhance/5-4-security-data-masking.md) 工作方式，保障敏感用户数据查询结果保密性。
- 支持 [记录指定用户的最后一次登入时间](./5-enhance/5-4-security-last-login.md)，便于管理员查询，进一步提升数据库安全性。

通过上述多个安全提升特性，进一步保障业务数据安全。更多信息详见文档：[高安全](./5-enhance/5-4-security.md)。

## 安装 jemalloc
---

运行 GreatSQL 时如果有 jemalloc（推荐5.2.1+版本）支持，则数据库进程的内存分配会更稳定、高效，因此建议安装 jemalloc（不是必须安装 jemalloc）

```
# 先安装 epel 源
$ yum install -y epel-release

# 再安装jemalloc
$ yum -y install jemalloc jemalloc-devel
```

也可以把自行安装的lib库so文件路径加到系统配置文件中，例如：

```
$ cat /etc/ld.so.conf
/usr/local/lib64/
```

而后执行下面的操作加载libjemalloc库，并确认是否已存在

```
$ ldconfig

$ ldconfig -p | grep libjemalloc
        libjemalloc.so.1 (libc6,x86-64) => /usr/local/lib64/libjemalloc.so.1
        libjemalloc.so (libc6,x86-64) => /usr/local/lib64/libjemalloc.so
```

如果无法通过 yum 直接安装 jemalloc，可以自行下载 RPM 包，地址：[https://centos.pkgs.org/8/epel-x86_64/jemalloc-5.2.1-2.el8.x86_64.rpm.html](https://centos.pkgs.org/8/epel-x86_64/jemalloc-5.2.1-2.el8.x86_64.rpm.html)

## 安装GreatSQL

推荐安装GreatSQL RPM包。

[戳此链接下载GreatSQL RPM包](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.32-26)。

执行下面的命令安装GreatSQL：

```
#首先，查找GreatSQL是否已安装
$ yum search greatsql
...
No matches found.

#然后安装
$ rpm -ivh --nodeps greatsql-client-8.0.32-26.1.el8.x86_64.rpm greatsql-devel-8.0.32-26.1.el8.x86_64.rpm greatsql-icu-data-files-8.0.32-26.1.el8.x86_64.rpm greatsql-mysql-router-8.0.32-26.1.el8.x86_64.rpm greatsql-server-8.0.32-26.1.el8.x86_64.rpm greatsql-shared-8.0.32-26.1.el8.x86_64.rpm greatsql-test-8.0.32-26.1.el8.x86_64.rpm
```

**提示**：正式安装GreatSQL RPM包时，可能还需要依赖Perl等其他软件包，此处为快速演示，因此加上 `--nodeps` 参数，忽略相应的依赖关系检查。安装完毕后，如果因为依赖关系无法启动，请再行安装相应软件依赖包。

安装完成后，GreatSQL会自行完成初始化，可以再检查是否已加入系统服务或已启动：

```
$ systemctl status mysqld
● mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
...
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 1137698 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 1137732 (mysqld)
   Status: "Server is operational"
    Tasks: 39 (limit: 149064)
   Memory: 336.7M
   CGroup: /system.slice/mysqld.service
           └─1137732 /usr/sbin/mysqld
...
```

就可以正常启动GreatSQL服务了。

想要 GreatSQL 更高效运行，建议参考这份 my.cnf 配置模板：[my.cnf for GreatSQL 8.0.32-26](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-26)。

## 编译 GreatSQL 二进制包

推荐利用 Docker 环境快速编译 GreatSQL 二进制包，可参考方法：[编译源码安装GreatSQL](./4-install-guide/6-install-with-source-code.md)。

## 版本历史
---

戳此查看 [GreatSQL 版本历史](./1-docs-intro/1-2-release-history.md)。

## GreatSQL 用户手册及学习资料
---

### GreatSQL编译构建相关
- [利用Docker环境快速编译GreatSQL相关资源](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/greatsql_docker_build)
- [利用Docker环境快速编译MySQL Shell for GreatSQL相关资源](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/greatsql_shell_docker_build)
- [用于编译GreatSQL RPM包的Spec文件](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/build-gs/greatsql.spec)
- [在CentOS环境下源码编译安装GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source.md)
- [在麒麟OS+龙芯环境下源码编译安装GreatSQL](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-with-source-under-kylin-and-loongson.md)
- [在openEuler、龙蜥Anolis、统信UOS系统下编译GreatSQL二进制包](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/build-greatsql-under-openeuler-anolis-uos.md)

### GreatSQL管理运维使用相关
- [GCA认证课程学习视频](https://greatsql.cn/smx_course-lesson.html?op=video&ids=10)，GreatSQL认证数据库专员培训视频课程
- [实战MGR专栏视频](https://greatsql.cn/smx_course-lesson.html?op=video&ids=5)，适合新手入门的MGR学习实操视频内容
- [深入浅出MGR专栏文章](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr)，深入浅出MGR相关知识点、运维管理实操
- [深入浅出MGR专栏视频](https://greatsql.cn/smx_course-lesson.html?op=video&ids=6)，深入浅出MGR相关知识点、运维管理实操视频内容
- [一文掌握GreatSQL MGR集群的部署和运维](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/using-greatsql-to-build-mgr-and-node-manage.md)
- [在Docker中部署GreatSQL并构建MGR集群](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/install-greatsql-with-docker.md)
- [MySQL InnoDB Cluster+GreatSQL部署MGR集群](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/mysql-innodb-cluster-with-greatsql.md)
- [GreatSQL MGR FAQ](https://greatsql.cn/docs/11-faq/0-faq.html)

## 其他 GreatSQL 相关资源仓库
- [GreatSQL用户手册](https://gitee.com/GreatSQL/GreatSQL-Manual)，最新版本GreatSQL用户手册
- [GreatSQL-Docker](https://gitee.com/GreatSQL/GreatSQL-Docker)，在Docker中运行GreatSQL
- [GreatSQL-Ansible](https://gitee.com/GreatSQL/GreatSQL-Ansible)，利用Ansible一键安装GreatSQL并完成MGR集群部署

## GreatSQL vs MySQL

GreatSQL 8.0.32-26 基于Percona Server for MySQL 8.0.32，它在 MySQL 8.0.32 基础上做了大量的改进和提升以及众多新特性，详情请见：[**Percona Server for MySQL feature comparison**](https://docs.percona.com/percona-server/8.0/feature-comparison.html)，这其中包括线程池、审计、数据脱敏等MySQL企业版才有的特性，以及performance_schema提升、information_schema提升、性能和可扩展性提升、用户统计增强、PROCESSLIST增强、Slow log增强等大量改进和提升，这里不一一重复列出。

下面是 GreatSQL 和 MySQL 社区版本的特性对比表：

| **1.主要特性** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
| :--- | :---: | :---: |
| 开源 |  :heavy_check_mark: |  :heavy_check_mark: |
|ACID 完整性| :heavy_check_mark: | :heavy_check_mark: |
|MVCC 特性| :heavy_check_mark:     | :heavy_check_mark: |
|支持行锁| :heavy_check_mark: | :heavy_check_mark: |
|Crash 自动修复| :heavy_check_mark: | :heavy_check_mark: |
|表分区（Partitioning）| :heavy_check_mark: | :heavy_check_mark: |
|视图（Views）| :heavy_check_mark: | :heavy_check_mark: |
|子查询（Subqueries）| :heavy_check_mark: | :heavy_check_mark: |
|触发器（Triggers）| :heavy_check_mark: | :heavy_check_mark: |
|存储程序（Stored Programs）| :heavy_check_mark: | :heavy_check_mark: |
|外键（Foreign Keys）| :heavy_check_mark: | :heavy_check_mark: |
|窗口函数（Window Functions）| :heavy_check_mark: | :heavy_check_mark: |
|通用表表达式 CTE| :heavy_check_mark: | :heavy_check_mark: |
|地理信息（GIS）| :heavy_check_mark: | :heavy_check_mark: |
|基于 GTID 的复制| :heavy_check_mark: | :heavy_check_mark: |
|组复制（MGR）| :heavy_check_mark: | :heavy_check_mark: |
|MyRocks 引擎| :heavy_check_mark: | |
| **2. 性能提升扩展** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|AP 引擎| :heavy_check_mark: | 仅云上HeatWave |
|NUMA 亲和性优化| :heavy_check_mark: | ❌ |
|非阻塞式 DDL| :heavy_check_mark: | ❌ |
|无主键表导入提速 | :heavy_check_mark: | ❌ |
|InnoDB 并行查询| :heavy_check_mark: | 仅主键扫描 |
|并行 LOAD DATA| :heavy_check_mark: | ❌ |
|InnoDB 事务 ReadView 无锁优化| :heavy_check_mark: | ❌ |
|InnoDB 事务大锁拆分优化| :heavy_check_mark: | ❌ |
|InnoDB 资源组| :heavy_check_mark: | :heavy_check_mark: |
|自定义 InnoDB 页大小| :heavy_check_mark: | :heavy_check_mark: |
|Contention-Aware Transaction Scheduling| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB Mutexes 拆分优化| :heavy_check_mark: | ❌ |
|MEMORY 引擎优化| :heavy_check_mark: | ❌ |
|InnoDB Flushing 优化| :heavy_check_mark: | ❌ |
|并行 Doublewrite Buffer| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 快速索引创建优化| :heavy_check_mark: | ❌ |
|VARCHAR/BLOB/JSON 类型存储单列压缩| :heavy_check_mark: | ❌ |
|数据字典中存储单列压缩信息| :heavy_check_mark: | ❌ |
| **3. 面向开发者提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|X API| :heavy_check_mark: | :heavy_check_mark: |
|JSON| :heavy_check_mark: | :heavy_check_mark: |
|NoSQL Socket-Level接口| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 全文搜索改进| :heavy_check_mark: | ❌ |
|更多 Hash/Digest 函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-数据类型| :heavy_check_mark: | ❌ |
|Oracle 兼容-函数| :heavy_check_mark: | ❌ |
|Oracle 兼容-SQL语法| :heavy_check_mark: | ❌ |
|Oracle 兼容-存储程序| :heavy_check_mark: | ❌ |
| **4. 基础特性提升改进** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|MGR 提升-地理标签| :heavy_check_mark: | ❌ |
|MGR 提升-仲裁节点| :heavy_check_mark: | ❌ |
|MGR 提升-读写节点绑定VIP| :heavy_check_mark: | ❌ |
|MGR 提升-快速单主模式| :heavy_check_mark: | ❌ |
|MGR 提升-智能选主机制| :heavy_check_mark: | ❌ |
|MGR 提升-全新流控算法| :heavy_check_mark: | ❌ |
|MGR 提升-自动选择 Donor 节点| :heavy_check_mark: | ❌ |
|Clone 全备 & 增备| :heavy_check_mark: | ❌ |
|Clone 备份压缩| :heavy_check_mark: | ❌ |
|information_schema 表数量|95|65|
|全局性能和状态指标|853|434|
|优化器直方图（Histograms）| :heavy_check_mark: | :heavy_check_mark: |
|Per-Table 性能指标| :heavy_check_mark: | ❌ |
|Per-Index 性能指标| :heavy_check_mark: | ❌ |
|Per-User 性能指标| :heavy_check_mark: | ❌ |
|Per-Client 性能指标| :heavy_check_mark: | ❌ |
|Per-Thread 性能指标| :heavy_check_mark: | ❌ |
|全局查询相应耗时统计| :heavy_check_mark: | ❌ |
|SHOW INNODB ENGINE STATUS 增强| :heavy_check_mark: | ❌ |
|回滚段信息增强| :heavy_check_mark: | ❌ |
|临时表信息增强| :heavy_check_mark: | ❌ |
|用户统计信息增强| :heavy_check_mark: | ❌ |
|Slow log 信息增强| :heavy_check_mark: | ❌ |
| **5.安全性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|国密支持| :heavy_check_mark: | ❌ |
|备份加密| :heavy_check_mark: | ❌ |
|审计| :heavy_check_mark: | 仅企业版 |
|数据脱敏| :heavy_check_mark: | ❌ |
|最后登录记录| :heavy_check_mark: | ❌ |
|SQL Roles| :heavy_check_mark: | :heavy_check_mark: |
|SHA-2 密码Hashing| :heavy_check_mark: | :heavy_check_mark: |
|密码轮换策略| :heavy_check_mark: | :heavy_check_mark: |
|PAM 认证插件| :heavy_check_mark: | 仅企业版 |
|Keyring 存储在文件中| :heavy_check_mark: | :heavy_check_mark: |
|Keyring 存储在Hashicorp Vault中| :heavy_check_mark: | 仅企业版 |
|InnoDB 数据加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 日志加密| :heavy_check_mark: | :heavy_check_mark: |
|InnoDB 各种表空间文件加密| :heavy_check_mark: | :heavy_check_mark: |
|二进制日志加密| :heavy_check_mark: | ❌ |
|临时文件加密| :heavy_check_mark: | ❌ |
|强制加密| :heavy_check_mark: | ❌ |
| **6. 运维便利性提升** | GreatSQL 8.0.32-26 | MySQL 8.0.32 |
|DDL 原子性| :heavy_check_mark: | :heavy_check_mark: |
|数据字典存储 InnoDB 表| :heavy_check_mark: | :heavy_check_mark: |
|快速 DDL| :heavy_check_mark: | :heavy_check_mark: |
|SET PERSIST| :heavy_check_mark: | :heavy_check_mark: |
|不可见索引| :heavy_check_mark: | :heavy_check_mark: |
|线程池（Threadpool）| :heavy_check_mark: | 仅企业版 |
|备份锁| :heavy_check_mark: | ❌ |
|SHOW GRANTS 扩展| :heavy_check_mark: | ❌ |
|表损坏动作扩展| :heavy_check_mark: | ❌ |
|杀掉不活跃事务| :heavy_check_mark: | ❌ |
|START TRANSACTION WITH CONSISTENT SNAPSHOT 扩展| :heavy_check_mark: | ❌ |

GreatSQL同时也是gitee（码云）平台上的GVP项目，详见：[https://gitee.com/gvp/database-related](https://gitee.com/gvp/database-related) **数据库相关**类目。

## 温馨提示

[如果您在使用 GreatSQL，请告诉我们，将有机会获得精美礼品和免费技术支持](https://wj.qq.com/s2/11543483/9e09/)。

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](./greatsql-wx.jpg)
