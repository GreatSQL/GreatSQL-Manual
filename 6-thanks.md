# 致谢
---
我们衷心地感谢参与和协助GreatSQL项目的所有成员。是你们的辛勤付出使得版本顺利发布，也为GreatSQL更好地发展提供可能。

## 社区用户

| 社区用户 | 应用场景 | 
| :--- | :--- |
| 中移智家 | 移动爱家日活存储中心 |
| 杭州恒生芸擎 | 交易数据存储查询 |
| 深圳华润网络 | 在线商城及内部业务系统 |
| 浪潮卓数大数据 | 政务系统 |
| 深圳富泰华工业 | 人事周边系统、教育训练系统、模具开发系统、物联网平台（关系数据存储）等 |
| 福建靠谱云 | 云上数据库及企业私有云 |
| 海峡金桥财产保险 | 投保平台 |
| 深圳市亚飞电子商务 | 电商业务报表系统 |
| 深圳美丽田园集团 | 小程序商城 |
| 郑州刀锋互娱网络 | 事务交易 |
| 江苏新巢天诚智能 | 政府性公共事业项目 |
| 深圳市中智车联 | 停车收费管理系统 |
| 湖南财信数字 | MySQL 替换 |
| 福州某电信服务商 | IPTV 后台管理平台报表统计 |
| 航融智慧能源 | 企业应用 |
| 宝塔面板 | 系统中集成 GreatSQL 数据库 |

## 开发贡献

#### 中信建投证券股份有限公司信息技术部（Ethan_LY）
 - [两个Oracle兼容函数 sys_guid()、decode()](https://gitee.com/GreatSQL/GreatSQL/pulls/7)

#### 中移智家DBA团队（zjjxxl）
 - **跨机房容灾场景，同时开启多源复制和主主双向复制，存在数据回路问题**（[issue#I8E8QB](https://gitee.com/GreatSQL/GreatSQL/issues/I8E8QB)）<br>
 详细文档请参见：[GreatSQL高可用特性之主主双向复制防止回路](https://greatsql.cn/docs/8032-25/user-manual/5-enhance/5-2-ha-repl-server-mode.html)

#### [earl86](https://gitee.com/earl86)
 - 提供了MySQL Shell for GreatSQL编译时对V8库（JS语法）支持的解决方法，以及对CentOS 7（x86_64）编译环境的支持。详见 [GreatSQL-Shell-Build分支](https://gitee.com/earl86/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build)。

#### [xiongyu](https://gitee.com/xiongyu-net)
 - 提供了在Rocky Linux编译环境下构建MySQL Shell for GreatSQL的方案。详见 [GreatSQL-Shell-Build分支](https://gitee.com/xiongyu-net/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build)。

#### [loong_hy](https://github.com/loong-hy) [zhangwenlong01](https://gitee.com/zhangwenlong01)
 - 提供了loongarch64 support for GreatSQL patch。详见 [add loongarch64 support](https://github.com/GreatSQL/GreatSQL/pull/7)、[add loongarch64 support](https://gitee.com/src-openeuler/greatsql/pulls/54)。

#### [开源之夏Sammmmy](https://gitee.com/sammmmy) [laokz](https://gitee.com/laokz)
 - 提供了 riscv64 for GreatSQL 支持。详见 [给GreatSQL 8.0.32-25添加openEuler riscv64支持](https://gitee.com/GreatSQL/GreatSQL/pulls/10)、[更新RISC-V下的MTR测试文档](https://gitee.com/GreatSQL/GreatSQL/pulls/11)、[set riscv64 to KNOWN_64BIT_ARCHITECTURES](https://gitee.com/GreatSQL/GreatSQL/pulls/12)

#### [胡润泽](https://gitee.com/hu-runze)
 - 提交 gt-checksum 的bug fix PR：[update Oracle/or_query_table_date.go](https://gitee.com/GreatSQL/gt-checksum/pulls/3)。

#### [月城](https://gitee.com/david058)
 - 提交 gt-checksum 的bug fix PR：[update actions/schema_tab_struct.go](https://gitee.com/GreatSQL/gt-checksum/pulls/7)。

## 文档贡献
- [高文佳](https://gitee.com/gaogao67)
  - [修复关于group_replication_unreachable_majority_timeout参数的解读](https://gitee.com/GreatSQL/GreatSQL-Doc/commit/0b12ce535fc4cb17c3dcdc3fb87066984c2b928a)
- [wldba](https://gitee.com/wldba)
  - [update 9-ha/4-ha-multi-city-multi-idc.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/17)
- [熊猫与猫无关](https://gitee.com/panyx)
  - [update 3-quick-start/3-2-quick-start-with-tarball.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/16)
- [Uest](https://gitee.com/uest)
  - [update 10-optimize/3-4-benchmarksql.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/15)
  - [update 6-oper-guide/8-troubleshooting.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/14)
- [jillwx](https://gitee.com/jillwx)
  - [update 12-dev-guide/12-4-4-functions.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/13)
  - [update 12-dev-guide/12-2-3-dp-table.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/12)
- [Dale](https://gitee.com/Dale_nn)
  - [update 2-about-greatsql/4-3-greatsql-binary-log.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/11)
  - [update 5-enhance/5-2-ha-mgr-fast-mode.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/10)
  - [update 4-install-guide/4-install-with-docker.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/9)
- [ShawnYan](https://gitee.com/shawnyan)
  - [update 8-mgr/8-mgr-best-practices.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/8)

[我要参与改进文档](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)

## 感谢列表

以下是GreatSQL项目感谢列表（成员排名不分先后）：

- [gitee](https://gitee.com/)
- [OSCHINA](https://www.oschina.net/)
- [ATOMDB](https://atomdb.com)
- [ruyi1024](https://gitee.com/ruyi1024)
- [芬达](https://gitee.com/fanderchan)
- entei
- liufofu
- 忆雨林枫
- [月城](https://gitee.com/david058)
- [Ethan_LY](https://gitee.com/ethan-ly)
- 戴先森
- Think
- C_zitong
- alitao
- Lee6496
- bz
- 姚良-James.Yao
- 李强
- 八怪
- 田帅萌
- Paddy Zhang
- Dillon
- [zjjxxl](https://gitee.com/zjjxxl)
- [lirulei90](https://gitee.com/lirulei90)
- [xiongyu-net](https://gitee.com/xiongyu-net)
- [junzidp2022](https://gitee.com/junzidp2022)
- [earl86](https://gitee.com/earl86)
- [log4j](https://gitee.com/log4j)
- [704793286](https://gitee.com/704793286)
- [chengli258](https://gitee.com/chengli258)
- [mlovewt](https://gitee.com/mlovewt)
- W19LAG
- G.L.
- 是我的海
- Sky凌乱
- Yan ᯤ
- [iTransit](https://gitee.com/iTransit)
- 沿河而下
- [lgclt](https://gitee.com/lgclt)
- 许怀安
- L.B
- [王歡](https://greatsql.cn/home.php?mod=space&uid=1353&do=thread&view=me&from=space)
- [reddey](https://greatsql.cn/home.php?mod=space&uid=1772&do=thread&view=me&from=space)
- [梁熙民](https://gitee.com/daydreammirror)
- [lingoYS](https://greatsql.cn/home.php?mod=space&uid=1753&do=profile)
- [sunli8523](https://greatsql.cn/home.php?mod=space&uid=234&do=profile&from=space)
- [iwordz](https://github.com/iwordz)

**扫码关注微信公众号**

![greatsql-wx](./greatsql-wx.jpg)
