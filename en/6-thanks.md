# Acknowledgments
---
We sincerely thank all the members who have participated in and supported the GreatSQL project. Your hard work has made each release possible and laid the foundation for the continued growth of GreatSQL.

## Community Users

| No. | Community User | Application Scenario |
| :--- | :--- | :--- |
| 1 | 中移智家 | Storage center for daily active data of Mobile AIJIA |
| 2 | 杭州恒生芸擎 | Transaction data storage and query |
| 3 | 深圳华润网络 | Online mall and internal business systems |
| 4 | 浪潮卓数大数据 | Government systems |
| 5 | 深圳富泰华工业 | HR peripheral systems, training systems, mold development systems, IoT platform (relational data storage), etc. |
| 6 | 福建靠谱云 | Cloud databases and enterprise private clouds |
| 7 | 海峡金桥财产保险 | Insurance application platform |
| 8 | 深圳市亚飞电子商务 | E-commerce business reporting system |
| 9 | 深圳美丽田园集团 | Mini-program mall |
| 10 | 郑州刀锋互娱网络 | Transactional trading |
| 11 | 江苏新巢天诚智能 | Government public utility projects |
| 12 | 深圳市中智车联 | Parking fee management system |
| 13 | 湖南财信数字 | MySQL replacement |
| 14 | 福州某电信服务商 | Reporting and statistics for the IPTV backend management platform |
| 15 | 航融智慧能源 | Enterprise applications |
| 16 | 宝塔面板 | Integrating the GreatSQL database into the system |
| 17 | 杭州艾草信息技术 | Government systems |
| 18 | 上海旺壹科技 | Life services |
| 19 | 全球溯源中心等政务系统 |
| 20 | 中电安世（成都） | Public security business systems |
| 21 | 上海镁信健康 | Internal operations systems |
| 22 | 青岛博海科技 | Internal CMDB services |
| 23 | 杭州迪普科技 | Security and government systems |
| 24 | 江苏新巢天诚智能 | Life services, government, education |
| 25 | 上海太屋网络 | E-commerce, life services, enterprise OA |
| 26 | 易思博酷客 | Internal systems |
| 27 | 合合信息 | File information metadata |
| 28 | 鑫鑫科技 | Government, enterprise OA |
| 29 | 赏金网 | Portal website |
| 30 | 北京同上科技 | System integration |
| 31 | 福建极数网络科技 | Industrial control systems |

## Development Contributions

#### 1. 中信建投证券股份有限公司信息技术部（Ethan_LY）
 - [Two Oracle-compatible functions sys_guid() and decode()](https://gitee.com/GreatSQL/GreatSQL/pulls/7)

#### 2. 中移智家DBA团队（zjjxxl）
 - **Data loop issue when multi-source replication and bidirectional primary-primary replication are enabled simultaneously in a cross-datacenter disaster recovery scenario**（[issue#I8E8QB](https://gitee.com/GreatSQL/GreatSQL/issues/I8E8QB)）<br>
 For details, please refer to: [GreatSQL HA Feature: Preventing Loops in Bidirectional Primary-Primary Replication](https://greatsql.cn/docs/8032-25/user-manual/5-enhance/5-2-ha-repl-server-mode.html)

#### 3. [earl86](https://gitee.com/earl86)
 - Provided a solution for supporting the V8 library (JS syntax) when compiling MySQL Shell for GreatSQL, as well as support for the CentOS 7 (x86_64) compilation environment. For details, see the [GreatSQL-Shell-Build branch](https://gitee.com/earl86/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build).

#### 4. [xiongyu](https://gitee.com/xiongyu-net)
 - Provided a solution for building MySQL Shell for GreatSQL in the Rocky Linux compilation environment. For details, see the [GreatSQL-Shell-Build branch](https://gitee.com/xiongyu-net/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build).

#### 5. [loong_hy](https://github.com/loong-hy) [zhangwenlong01](https://gitee.com/zhangwenlong01)
 - Provided the loongarch64 support for GreatSQL patch. For details, see [add loongarch64 support](https://github.com/GreatSQL/GreatSQL/pull/7) and [add loongarch64 support](https://gitee.com/src-openeuler/greatsql/pulls/54).

#### 6. [开源之夏Sammmmy](https://gitee.com/sammmmy) [laokz](https://gitee.com/laokz)
 - Provided riscv64 support for GreatSQL. For details, see [Add openEuler riscv64 support for GreatSQL 8.0.32-25](https://gitee.com/GreatSQL/GreatSQL/pulls/10), [Update the MTR test documentation for RISC-V](https://gitee.com/GreatSQL/GreatSQL/pulls/11), and [set riscv64 to KNOWN_64BIT_ARCHITECTURES](https://gitee.com/GreatSQL/GreatSQL/pulls/12)

#### 7. [earl86](https://gitee.com/earl86)
 - Provided a solution for supporting the V8 library (JS syntax) when compiling MySQL Shell for GreatSQL, as well as support for the CentOS 7 (x86_64) compilation environment. For details, see the [GreatSQL-Shell-Build branch](https://gitee.com/earl86/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build).

#### 8. [许怀安](https://github.com/gagraler)
 - Initiated the [greatsql-operator](https://github.com/greatsql-sigs/greatsql-operator) project.

#### 9. [月城](https://gitee.com/david058)
 - Submitted a bug fix PR for gt-checksum: [update actions/schema_tab_struct.go](https://gitee.com/GreatSQL/gt-checksum/pulls/7).

#### 10. [Annda](https://github.com/AnndaGH)
 - Submitted the Docker image of GreatSQL for the Loongson (Loongson-3A6000) architecture: *registry.cn-shanghai.aliyuncs.com/annda/greatsql:8.4.4-4*.

#### 11. 工业和信息化部网络安全威胁和漏洞信息共享平台信创政务产品安全漏洞专业库

- **Reported the vulnerability** in the "Verifying the GreatSQL command injection vulnerability" task

#### 12. 山石网科安全技术研究院团队

- **Reported the vulnerability** in the "Verifying the GreatSQL command injection vulnerability" task

## Documentation Contributions
- 1. [高文佳](https://gitee.com/gaogao67)
  - [Fix the interpretation of the group_replication_unreachable_majority_timeout parameter](https://gitee.com/GreatSQL/GreatSQL-Doc/commit/0b12ce535fc4cb17c3dcdc3fb87066984c2b928a)
- 2. [wldba](https://gitee.com/wldba)
  - [update 9-ha/4-ha-multi-city-multi-idc.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/17)
- 3. [熊猫与猫无关](https://gitee.com/panyx)
  - [update 3-quick-start/3-2-quick-start-with-tarball.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/16)
- 4. [Uest](https://gitee.com/uest)
  - [update 10-optimize/3-4-benchmarksql.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/15)
  - [update 6-oper-guide/8-troubleshooting.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/14)
  - [update 4-install-guide/3-1-centos-install.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/19)
- 5. [jillwx](https://gitee.com/jillwx)
  - [update 12-dev-guide/12-4-4-functions.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/13)
  - [update 12-dev-guide/12-2-3-dp-table.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/12)
- 6. [Dale](https://gitee.com/Dale_nn)
  - [update 2-about-greatsql/4-3-greatsql-binary-log.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/11)
  - [update 5-enhance/5-2-ha-mgr-fast-mode.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/10)
  - [update 4-install-guide/4-install-with-docker.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/9)
- 7. [ShawnYan](https://gitee.com/shawnyan)
  - [update 8-mgr/8-mgr-best-practices.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/8)
- 8. [合金来了](https://gitee.com/lvhejin)
  - [update 6-oper-guide/8-troubleshooting.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/25)
  - [update 4-install-guide/3-3-openeuler-install.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/23)
- 9. [yushao21](https://gitee.com/yushao21)
  - [27 [Lightweight PR]: update 12-dev-guide/12-3-6-gen-random-data.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/27)
  

[I want to contribute to improving the documentation](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)

## Thank-you List

The following is the GreatSQL project thank-you list (members are listed in no particular order):

1. [gitee](https://gitee.com/)
1. [OSCHINA](https://www.oschina.net/)
1. [ATOMDB](https://atomdb.com)
1. [ruyi1024](https://gitee.com/ruyi1024)
1. [芬达](https://gitee.com/fanderchan)
1. entei
1. liufofu
1. 忆雨林枫
1. [月城](https://gitee.com/david058)
1. [Ethan_LY](https://gitee.com/ethan-ly)
1. 戴先森
1. Think
1. C_zitong
1. alitao
1. Lee6496
1. bz
1. 姚良-James.Yao
1. 李强
1. 八怪
1. 田帅萌
1. Paddy Zhang
1. Dillon
1. [zjjxxl](https://gitee.com/zjjxxl)
1. [lirulei90](https://gitee.com/lirulei90)
1. [xiongyu-net](https://gitee.com/xiongyu-net)
1. [junzidp2022](https://gitee.com/junzidp2022)
1. [earl86](https://gitee.com/earl86)
1. [log4j](https://gitee.com/log4j)
1. [704793286](https://gitee.com/704793286)
1. [chengli258](https://gitee.com/chengli258)
1. [mlovewt](https://gitee.com/mlovewt)
1. W19LAG
1. G.L.
1. 是我的海
1. Sky凌乱
1. [Yan ᯤ](https://greatsql.cn/space-uid-42.html)
1. [iTransit](https://gitee.com/iTransit)
1. 沿河而下
1. [lgclt](https://gitee.com/lgclt)
1. [许怀安](https://github.com/gagraler)
1. L.B
1. [王歡](https://greatsql.cn/home.php?mod=space&uid=1353&do=thread&view=me&from=space)
1. [reddey](https://greatsql.cn/home.php?mod=space&uid=1772&do=thread&view=me&from=space)
1. [梁熙民](https://gitee.com/daydreammirror)
1. [lingoYS](https://greatsql.cn/home.php?mod=space&uid=1753&do=profile)
1. [sunli8523](https://greatsql.cn/home.php?mod=space&uid=234&do=profile&from=space)
1. [iwordz](https://github.com/iwordz)
1. [striver619](https://gitee.com/striver619)
1. [starwuleo](https://gitee.com/starwuleo)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
