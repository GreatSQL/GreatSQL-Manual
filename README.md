# GreatSQL 8.0 用户手册

最后更新: 2024-01-17。

本文档适用版本：GreatSQL 8.0.32-25。

GreatSQL数据库是一款**开源免费**数据库，可在普通硬件上满足金融级应用场景，具有**高可用**、**高性能**、**高兼容**、**高安全**等特性，可作为MySQL或Percona Server for MySQL的理想可选替换。

## 核心特性

### 高可用

针对MGR进行了大量改进和提升工作，新增支持**地理标签**、**仲裁节点**、**读写节点可绑定动态IP**、**快速单主模式**、**智能选主**，并针对**流控算法**、**事务认证队列清理算法**、**节点加入&退出机制**、**recovery机制**等多项MGR底层工作机制算法进行深度优化，进一步提升优化了MGR的高可用保障及性能稳定性。

更多信息详见文档：[高可用](./5-enhance/5-2-ha.md)。

### 高性能

相对MySQL及Percona Server For MySQL的性能表现更稳定优异，支持**高性能的内存查询加速AP引擎**、**InnoDB并行查询**、**并行LOAD DATA**、**事务无锁化**、**线程池等**特性，在TPC-C测试中相对MySQL性能提升超过30%，在TPC-H测试中的性能表现是MySQL的十几倍甚至上百倍。

更多信息详见文档：[高性能](./5-enhance/5-1-highperf.md)。

### 高兼容

支持大多数常见Oracle用法，包括数据类型、函数、SQL语法、存储程序等兼容性用法。

更多信息详见文档：[高兼容](./5-enhance/5-3-easyuse.md)。

### 高安全

支持逻辑备份加密、CLONE备份加密、审计日志入表、表空间国密加密等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

更多信息详见文档：[高安全](./5-enhance/5-4-security.md)。

---
# [1. 发行说明](./1-docs-intro/1-docs-intro.md)
 - ## [1.1 用户须知](./1-docs-intro/1-1-notes-to-users.md)
 - ## [1.2 版本历史](./1-docs-intro/1-2-release-history.md)
 - ## [1.3 优势特性](./1-docs-intro/1-3-greatsql-features.md)
 - ## [1.4 已知问题](./1-docs-intro/1-4-issues-known.md)
 - ## [1.5 参与贡献](./1-docs-intro/1-5-contribute-to-greatsql.md)
 - ## [1.6 社区行为守则](./1-docs-intro/1-6-community-rules.md)
 - ## [1.7 社区治理](./1-docs-intro/1-8-community-toc.md)
 - ## [1.8 致谢](./1-docs-intro/1-7-thanks.md)
 - ## [1.9 认证人员名单](./1-docs-intro/1-9-greatsql-certified.md)

# [2. GreatSQL系统架构](./2-about-greatsql/0-about-greatsql.md)
 - ## [2.1 GreatSQL简介](./2-about-greatsql/1-greatsql-brief-intro.md)
 - ## [2.2 产品定位](./2-about-greatsql/2-greatsql-product-positioning.md)
 - ## [2.3 系统架构](./2-about-greatsql/3-greatsql-arch.md)
 - ## [2.4 GreatSQL日志](./2-about-greatsql/4-greatsql-log.md)
 - ## [2.5 使用限制](./2-about-greatsql/5-greatsql-limitations.md)
 - ## [2.6 术语表](./2-about-greatsql/6-greatsql-glossary.md)
 - ## [2.7 保留字、关键字](./2-about-greatsql/7-greatsql-keywords.md)

# [3. 快速上手](./3-quick-start/3-quick-start.md)
 - ## [3.1 RPM安装](./3-quick-start/3-1-quick-start-with-rpm.md)
 - ## [3.2 二进制包安装](./3-quick-start/3-2-quick-start-with-tarball.md)
 - ## [3.3 容器化安装](./3-quick-start/3-3-quick-start-with-docker.md)
 - ## [3.4 访问数据库](./3-quick-start/3-4-quick-start-dbrw.md)

# [4. 安装指南](./4-install-guide/0-install-guide.md)
 - ## [4.1 安装准备](./4-install-guide/1-install-prepare.md)
 - ## [4.2 RPM安装](./4-install-guide/2-install-with-rpm.md)
 - ## [4.3 二进制包安装](./4-install-guide/3-install-with-tarball.md)
 - ## [4.4 容器化安装](./4-install-guide/4-install-with-docker.md)
 - ## [4.5 Ansible安装](./4-install-guide/5-install-with-ansible.md)
 - ## [4.6 编译源码安装](./4-install-guide/6-install-with-source-code.md)
 - ## [4.7 初始化测试数据库](./4-install-guide/7-load-sampledb.md)

# [5. GreatSQL增强](./5-enhance/5-enhance.md)
 - ## [5.2 高可用](./5-enhance/5-2-ha.md)
 - ## [5.1 高性能](./5-enhance/5-1-highperf.md)
 - ## [5.3 高兼容](./5-enhance/5-3-easyuse.md)
 - ## [5.4 高安全](./5-enhance/5-4-security.md)

# [6. 运维管理](./6-oper-guide/0-oper-guide.md)
- ## [6.1 日常管理](./6-oper-guide/1-basic-oper.md)
- ## [6.2 读写分离](./6-oper-guide/2-oper-rw-splitting.md)
- ## [6.3 监控告警](./6-oper-guide/3-monitoring-and-alerting.md)
- ## [6.4 备份恢复](./6-oper-guide/4-backup-and-restore.md)
- ## [6.5 单机多实例](./6-oper-guide/5-multi-instances.md)
- ## [6.6 防范误操作及快速恢复](./6-oper-guide/6-avoid-mistakes.md)

# [7. 迁移升级](./7-migrate-and-upgrade/0-migrate-and-upgrade.md)
 - ## [7.1 GreatSQL 5.7升级到8.0](./7-migrate-and-upgrade/1-upgrade-to-greatsql8.md)
 - ## [7.2 从MySQL迁移到GreatSQL](./7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql.md)
 - ## [7.3 从Percona Server迁移到GreatSQL](./7-migrate-and-upgrade/3-migrate-from-percona-to-greatsql.md)

# [8. MGR 基础](./8-mgr/0-mgr-fundamentals.md)
 - ## [8.1 MGR 简介](./8-mgr/1-mgr-introduction.md)
 - ## [8.2 MGR 安装部署](./8-mgr/2-mgr-install-deploy.md)
 - ## [8.3 MGR 维护管理](./8-mgr/3-mgr-maintain-admin.md)
 - ## [8.4 MGR 状态监控](./8-mgr/4-mgr-status-monitor.md)
 - ## [8.5 MGR Router构建读写分离集群](./8-mgr/5-mgr-readwrite-split.md)
 - ## [8.6 MGR 数据一致性安全性保障](./8-mgr/6-mgr-data-security.md)
 - ## [8.7 MGR 性能优化](./8-mgr/7-mgr-performance-tuning.md)
 - ## [8.8 MGR 最佳实践参考](./8-mgr/8-mgr-best-practices.md)

# [9. 高可用架构](./9-ha/0-ha.md)
 - ## [9.1 单机多实例高可用](./9-ha/1-ha-single-machine-multi-instance.md)
 - ## [9.2 单VLAN高可用](./9-ha/5-ha-single-vlan.md)
 - ## [9.3 单IDC高可用](./9-ha/2-ha-single-idc.md)
 - ## [9.4 同城跨IDC高可用](./9-ha/3-ha-same-city-multi-idc.md)
 - ## [9.5 跨城多IDC高可用](./9-ha/4-ha-multi-city-multi-idc.md)

# [10. 性能优化](./10-optimze/0-optimze.md)
 - ## [10.1 硬件、系统优化](./10-optimze/1-hardware-and-os-optimze.md)
 - ## [10.2 GreatSQL优化](./10-optimze/2-greatsql-optimze.md)
 - ## [10.3 性能测试](./10-optimze/3-performance-benchmark.md)

# [11. FAQ](./11-faq/0-faq.md)
 - ## [11.1 GreatSQL相关FAQ](./11-faq/1-faq-greatsql.md)
 - ## [11.2 MGR运维部署FAQ](./11-faq/2-faq-mgr-oper.md)
 - ## [11.3 基于MGR的架构方案](./11-faq/3-faq-mgr-arch.md)
 - ## [11.4 MGR监控及故障处理FAQ](./11-faq/4-faq-mgr-monitor.md)
 - ## [11.5 其他FAQ](./11-faq/5-faq-others.md)

# 问题反馈
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


# 联系我们
---

扫码关注微信公众号

![输入图片说明](./greatsql-wx.jpg)
