# 致谢
---
我们衷心地感谢参与和协助GreatSQL项目的所有成员。是你们的辛勤付出使得版本顺利发布，也为GreatSQL更好地发展提供可能。

## 社区用户

| 序号 | 社区用户 | 应用场景 | 
| :--- | :--- | :--- |
| 1 | 中移智家 | 移动爱家日活存储中心 |
| 2 | 杭州恒生芸擎 | 交易数据存储查询 |
| 3 | 深圳华润网络 | 在线商城及内部业务系统 |
| 4 | 浪潮卓数大数据 | 政务系统 |
| 5 | 深圳富泰华工业 | 人事周边系统、教育训练系统、模具开发系统、物联网平台（关系数据存储）等 |
| 6 | 福建靠谱云 | 云上数据库及企业私有云 |
| 7 | 海峡金桥财产保险 | 投保平台 |
| 8 | 深圳市亚飞电子商务 | 电商业务报表系统 |
| 9 | 深圳美丽田园集团 | 小程序商城 |
| 10 | 郑州刀锋互娱网络 | 事务交易 |
| 11 | 江苏新巢天诚智能 | 政府性公共事业项目 |
| 12 | 深圳市中智车联 | 停车收费管理系统 |
| 13 | 湖南财信数字 | MySQL 替换 |
| 14 | 福州某电信服务商 | IPTV 后台管理平台报表统计 |
| 15 | 航融智慧能源 | 企业应用 |
| 16 | 宝塔面板 | 系统中集成 GreatSQL 数据库 |
| 17 | 杭州艾草信息技术 | 政务系统 |
| 18 | 上海旺壹科技 | 生活服务 |
| 19 | 全球溯源中心等政务系统 |
| 20 | 中电安世（成都） | 公共安全业务系统 |
| 21 | 上海镁信健康 | 运维内部系统 |
| 22 | 青岛博海科技 | 企业内部cmdb服务 |
| 23 | 杭州迪普科技 | 安全和政务系统 |
| 24 | 江苏新巢天诚智能 | 生活服务，政务，教育 |
| 25 | 上海太屋网络 | 电商，生活服务，企业OA |
| 26 | 易思博酷客 | 内部系统 |
| 27 | 合合信息 | 文件信息元数据 |

## 开发贡献

#### 1. 中信建投证券股份有限公司信息技术部（Ethan_LY）
 - [两个Oracle兼容函数 sys_guid()、decode()](https://gitee.com/GreatSQL/GreatSQL/pulls/7)

#### 2. 中移智家DBA团队（zjjxxl）
 - **跨机房容灾场景，同时开启多源复制和主主双向复制，存在数据回路问题**（[issue#I8E8QB](https://gitee.com/GreatSQL/GreatSQL/issues/I8E8QB)）<br>
 详细文档请参见：[GreatSQL高可用特性之主主双向复制防止回路](https://greatsql.cn/docs/8032-25/user-manual/5-enhance/5-2-ha-repl-server-mode.html)

#### 3. [earl86](https://gitee.com/earl86)
 - 提供了MySQL Shell for GreatSQL编译时对V8库（JS语法）支持的解决方法，以及对CentOS 7（x86_64）编译环境的支持。详见 [GreatSQL-Shell-Build分支](https://gitee.com/earl86/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build)。

#### 4. [xiongyu](https://gitee.com/xiongyu-net)
 - 提供了在Rocky Linux编译环境下构建MySQL Shell for GreatSQL的方案。详见 [GreatSQL-Shell-Build分支](https://gitee.com/xiongyu-net/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build)。

#### 5. [loong_hy](https://github.com/loong-hy) [zhangwenlong01](https://gitee.com/zhangwenlong01)
 - 提供了loongarch64 support for GreatSQL patch。详见 [add loongarch64 support](https://github.com/GreatSQL/GreatSQL/pull/7)、[add loongarch64 support](https://gitee.com/src-openeuler/greatsql/pulls/54)。

#### 6. [开源之夏Sammmmy](https://gitee.com/sammmmy) [laokz](https://gitee.com/laokz)
 - 提供了 riscv64 for GreatSQL 支持。详见 [给GreatSQL 8.0.32-25添加openEuler riscv64支持](https://gitee.com/GreatSQL/GreatSQL/pulls/10)、[更新RISC-V下的MTR测试文档](https://gitee.com/GreatSQL/GreatSQL/pulls/11)、[set riscv64 to KNOWN_64BIT_ARCHITECTURES](https://gitee.com/GreatSQL/GreatSQL/pulls/12)

#### 7. [earl86](https://gitee.com/earl86)
 - 提供了MySQL Shell for GreatSQL编译时对V8库（JS语法）支持的解决方法，以及对CentOS 7（x86_64）编译环境的支持。详见 [GreatSQL-Shell-Build分支](https://gitee.com/earl86/GreatSQL-Docker/tree/master/GreatSQL-Shell-Build)。

#### 8. [许怀安](https://github.com/gagraler)
 - 发起 [greatsql-operator](https://github.com/greatsql-sigs/greatsql-operator) 项目。

#### 9. [月城](https://gitee.com/david058)
 - 提交 gt-checksum 的bug fix PR：[update actions/schema_tab_struct.go](https://gitee.com/GreatSQL/gt-checksum/pulls/7)。

## 文档贡献
- 1. [高文佳](https://gitee.com/gaogao67)
  - [修复关于group_replication_unreachable_majority_timeout参数的解读](https://gitee.com/GreatSQL/GreatSQL-Doc/commit/0b12ce535fc4cb17c3dcdc3fb87066984c2b928a)
- 2. [wldba](https://gitee.com/wldba)
  - [update 9-ha/4-ha-multi-city-multi-idc.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/17)
- 3. [熊猫与猫无关](https://gitee.com/panyx)
  - [update 3-quick-start/3-2-quick-start-with-tarball.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/16)
- 4. [Uest](https://gitee.com/uest)
  - [update 10-optimize/3-4-benchmarksql.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/15)
  - [update 6-oper-guide/8-troubleshooting.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/14)
- 5. [jillwx](https://gitee.com/jillwx)
  - [update 12-dev-guide/12-4-4-functions.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/13)
  - [update 12-dev-guide/12-2-3-dp-table.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/12)
- 6. [Dale](https://gitee.com/Dale_nn)
  - [update 2-about-greatsql/4-3-greatsql-binary-log.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/11)
  - [update 5-enhance/5-2-ha-mgr-fast-mode.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/10)
  - [update 4-install-guide/4-install-with-docker.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/9)
- 7. [ShawnYan](https://gitee.com/shawnyan)
  - [update 8-mgr/8-mgr-best-practices.md](https://gitee.com/GreatSQL/GreatSQL-Manual/pulls/8)

[我要参与改进文档](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)

## 感谢列表

以下是GreatSQL项目感谢列表（成员排名不分先后）：

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

**扫码关注微信公众号**

![greatsql-wx](./greatsql-wx.jpg)
