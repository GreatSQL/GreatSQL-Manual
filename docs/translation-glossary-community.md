# 社区站点翻译术语表与翻译规范（Translation Glossary & Guidelines — Community）

> 创建日期：2026-11-24
> 用途：作为社区站点 7 个页面英文翻译（en/ 目录镜像）的**唯一译法基准**。所有翻译批次（Step 3~8）必须先查本表，禁止自行发明译法。
> 术语基准：**MySQL 官方文档用语** + GreatSQL 官方表述（`~/gitee/8.4.4-5/en` 已定译法）+ 中文源文件自定英文名称（TOC 等机构名称以源文定义为准）。
> 维护：审校（Step 10）发现新术语时补充本表；修订后所有后续翻译批次立即生效。

---

## 一、术语一致性优先级

1. **本表（docs/translation-glossary-community.md）** > `~/gitee/8.4.4-5/en` 已定译法 > MySQL/GreatSQL 官方文档；
2. H1 标题译法必须与 `.vuepress/configs/sidebar-en.js` 对应条目**逐字一致**（VuePress 侧边栏与页面标题联动）；`4-greatsql-certified.md` 不在侧边栏，其 H1 译法按本表「培训认证 → Training & Certification」执行；
3. 同一术语在正文与标题中允许大小写差异，但**拼写必须一致**；
4. **可复用优先**：凡本表「三、可复用英文素材清单」中已存在英文原文（页脚、简介、GCA/GCP 表述、Contributor Covenant v1.4 官方原文），**直接复制使用，不重新翻译**。

---

## 二、核心术语对照表

> 译法标注「固定」= 产品/专有名词，任何语境保持原样；「官方」= 与 MySQL/GreatSQL 官方表述一致；「已定」= sidebar-en.js 已确定的标题译法。

### 2.1 页面标题（H1 与英文侧边栏，最高优先级）

| 中文（H1） | 英文（H1/侧边栏） | 说明 |
| --- | --- | --- |
| 参与贡献 | Contribute | 已定（sidebar-en.js；README 与 1-contribute-to-greatsql.md 两文件一致） |
| 社区行为守则 | Community Code of Conduct | 已定（sidebar-en.js） |
| 社区治理 | Community Governance | 已定（sidebar-en.js） |
| 培训认证 | Training & Certification | 本表定（不在侧边栏，独立页） |
| 兼容适配流程说明 | Compatibility Adaptation | 已定（sidebar-en.js） |
| 致谢 | Acknowledgments | 已定（sidebar-en.js） |

### 2.2 组织与治理机制（3-community-toc.md，术语最密集区）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 技术观察委员会 | TOC | 中文源文自定英文 "Technical Observe Committee，简称 TOC"；**以缩写 TOC 为主**，首次出现可括注源文定义（Technical Observe Committee）。注：业界常见 Technical Oversight Committee，但源文机构名称不擅自改写 |
| 项目管理委员会 | Project Management Committee (PMC) | 官方通用（ASF 等开源社区通行表述），首次出现括注缩写 PMC |
| 主席 | Chair | TOC 主席 → TOC Chair；PMC 主席 → PMC Chair |
| 委员 | committee member | 在任委员 → sitting/incumbent committee member |
| 例会 | regular meeting | TOC 每两周例会 → biweekly regular meeting |
| 临时会议 | extraordinary/adhoc meeting | 1/2 以上委员提议 → proposed by more than half of the committee members |
| 邮件列表 | mailing list | 会议通知通过邮件列表发送 |
| 公开记名投票 | open recorded vote | 所有决议均需投票表决 |
| 赞同票 / 反对票 / 弃权票 | in favor / against / abstention | 通过条件：2/3 与会委员 + 1/2 全体委员赞同 |
| 决议 / 投票表决 | resolution / vote | 2/3（含）以上出席为有效会议 → a meeting is valid with at least 2/3 attendance |
| 最终裁决权 | final decision-making authority | TOC 职权 |
| 技术愿景和方向 | technical vision and direction | TOC 职权 |
| 离任 | leave/step down | 强制离任 → removed；申请离任 → resign |
| 任命 / 提名 | appoint / nominate | PMC 主席由 TOC 提名并票选 |
| 合并主分支的权限 | permission to merge into the main branch | Maintainer 权益 |
| 晋升标准 | promotion criteria | Maintainer/Reviewer/Contributor 各节 |
| 权益 | benefits/rights | 角色章节标题（晋升标准/职责/权益） |
| 证书作为纪念 | commemorative certificate | 社区 Maintainer/Reviewer 证书 |
| 社区周边定制纪念品 | customized community souvenirs | U型枕+保温杯+双肩背包 → U-shaped pillow, thermos cup and backpack set |
| 金币商城 | coin mall/store | 社区金币商城 |
| 界定条件 | eligibility criteria | Ambassador/Consumer/User 各节 |
| 生产环境 | production environment | 企业用户界定条件 |
| 案例研究 | case study | Ambassador 宣传形式 |
| 联合解决方案 | joint solution | 合作伙伴权益 |
| 官方背书 | official endorsement | 合作伙伴权益 |
| 深度赋能 | deep enablement | 合作伙伴权益 |
| 培养计划和技术认证 | training programs and technical certification | 技术服务合作伙伴 |
| 产业生态上下游厂商 | upstream and downstream vendors in the industry ecosystem | 产业生态合作伙伴 |
| 定制化开发 | customized development | 技术研发合作伙伴 |
| 公有云、私有云、行业云 | public cloud, private cloud, industry cloud | 云端服务合作伙伴 |

### 2.3 角色术语（保留英文，不翻译）

| 术语 | 说明 |
| --- | --- |
| Maintainer / Reviewer / Contributor | 开发者端角色，原样保留（中文页即英文，英文页不变） |
| Ambassador / Consumer / User | 用户端角色，原样保留 |
| SIG | Special Interest Group，首次出现可括注，之后用缩写 |
| RFC | Request for Comments，首次出现可括注，之后用缩写 |
| TOC / PMC | 见 2.2，保留缩写 |
| Issue / Pull Request（PR） | 开源协作术语，原样保留 |
| Community UID / UID | 社区账号编号，原样保留 |
| /assign | 命令，不译 |
| meetup | 社区活动形式，原样保留（线上或线下 meetup） |

### 2.4 认证与考试（4-greatsql-certified.md）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 培训认证 | Training & Certification | H1 标题 |
| 认证数据库专员 | GreatSQL Certified Associate (GCA) | 官方表述（"**GreatSQL认证数据库专员**（GreatSQL Certified Associate，简称**GCA**）"），首次出现给全称括注，之后用缩写 GCA |
| 认证数据库专家 | GreatSQL Certified Professional (GCP) | 官方表述，同上 |
| 认证免费 | free of charge / free certification | 认证不收取任何费用 |
| 考核认证流程 | certification process | GCA/GCP 考核认证流程 |
| 认证简介 | Certification Overview | 章节标题 |
| 认证流程 | Certification Process | 章节标题 |
| 认证FAQ | Certification FAQ | 章节标题 |
| 认证通过名单 | Certified Pass List | 章节标题 |
| 不定项选择题 | multiple-choice questions | GCA 25 题不定项选择；GCP 45 题不定项选择 |
| 判断题 | true/false questions | GCP 25 题判断 |
| 总分 / 通过分数 | total score / passing score | GCA 100 分 60 分通过；GCP 230 分 184 分通过（正确率 >= 80%） |
| 正确率 | accuracy rate | GCP 184/230 = 80% |
| 一个月（30天内） | within 30 days | 考试次数限制：GCA 两次、GCP 一次 |
| 五个工作日 | five business days | 证书发放时限 |
| 证书编号 | certificate number | 名单表格列头 |
| 序号 | No. | 名单表格列头（表头译，内容不译） |
| 姓名 | Name | 名单表格列头 |
| 通过GCA等级考核人员名单 | List of Members Who Passed the GCA Exam | 名单小节标题（第 1~100 / 101~200 / 201~300 / 301~400 / 401~500 分段保留数字区间） |
| 社区小助手 | Community Assistant | 联系小助手 → contact the Community Assistant |
| 额外学习资料 | additional learning materials | FAQ 小节 |
| 深入浅出MGR系列 | Deep Dive into MGR series | 链接文字可译（链接 URL 不译） |

### 2.5 兼容适配（5-greatsql-adaptation.md）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 兼容适配流程说明 | Compatibility Adaptation | H1 标题（与侧边栏一致） |
| 兼容适配测试 | compatibility adaptation testing | 面向产业生态上下游厂商 |
| 兼容互认 | mutual recognition | 《GreatSQL 数据库产品兼容互认申请表》→ GreatSQL Database Product Compatibility Mutual Recognition Application Form（**文档标题可译；作为链接的文件名/URL 不译**） |
| 认证证书 | official certification certificate | 通过适配测试后出具 |
| LOGO 墙 | Logo Wall | 「兼容适配认证通过企业 LOGO 墙」→ Logo Wall of Certified Enterprises |
| 兼容适配认证通过列表 | Compatibility Adaptation Certified List | 列表章节标题 |
| 申请前准备 | Preparation Before Application | 章节标题 |
| 申请单位 | applicant organization | 申请方 |
| 个人主页 | Personal Profile | 链接文字（链接不译） |
| 学习中心 | Learning Center | 链接文字（链接不译） |
| 社区UID | Community UID | 记下一个数字 |
| 步骤 / 步骤 1~4 | Step 1~4 | 申请流程四步 |
| 申请表 | application form | 填写申请表 → fill in the application form |
| 自测报告 | self-test report | 《GreatSQL-产品兼容互认自测报告模板》→ GreatSQL Product Compatibility Mutual Recognition Self-Test Report Template |
| 安装部署 / 功能验证 | installation and deployment / functional verification | 自测报告内容项 |
| 测试过程录屏视频 | screen recording of the testing process | 提交材料 |
| 兼容性验证及认证结果 | Compatibility Verification and Certification Result | 章节标题 |
| 通过 / 未通过 | Passed / Not Passed | 结果分支 |
| 15 个工作日 | 15 business days | 未调试成功终止时限 |
| 盖章 | stamping / sealing | 一式两份加盖社区主体章 → two copies stamped with the community seal |
| 快递寄送 | courier delivery | 寄送至申请单位 |
| 官网展示 | Official Website Showcase | 章节标题 |
| 完整流程概览 | Complete Process Overview | 章节标题 |
| 联系我们 | Contact Us | 小节标题 |

### 2.6 兼容适配列表分类词（表头与类别词，专有名词不译）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 类别 | Category | 表格列头 |
| 产品名称 | Product Name | 表格列头 |
| 版本号 | Version | 表格列头 |
| 供应商 | Vendor | 表格列头 |
| 操作系统 | Operating System | 类别词 |
| 存储 | Storage | 类别词 |
| CPU | CPU | 类别词，保留 |
| 服务器 | Server | 类别词 |
| 应用软件 | Application Software | 类别词 |
| 中间件 | Middleware | 类别词 |
| DPU | DPU | 类别词，保留 |
| 芯片 | chip / processor | 产业生态表述（操作系统、芯片、中间件、存储等） |

> 表格**内容行**（产品名称、版本号、供应商的公司/产品名称）一律原样保留，不译、不改。

### 2.7 致谢（6-thanks.md）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 致谢 | Acknowledgments | H1 标题（与侧边栏一致） |
| 社区用户 | Community Users | 章节标题 |
| 应用场景 | Application Scenario | 表格列头；场景描述性短语可译（如「政务系统」→ government systems），公司名保留 |
| 开发贡献 | Development Contributions | 章节标题 |
| 文档贡献 | Documentation Contributions | 章节标题 |
| 感谢列表 | Thank-you List | 章节标题（与 H1 Acknowledgments 区分） |
| 成员排名不分先后 | in no particular order | 感谢列表引言 |
| 贡献者名单 | contributor list | 官网展示 |
| 我要参与改进文档 | I want to contribute to improving the documentation | 链接文字（链接不译） |

### 2.8 参与贡献（README.md = 1-contribute-to-greatsql.md）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 参与贡献 | Contribute | H1 标题 |
| 开源社区 | open source community | GreatSQL 是一个开源社区 |
| 注册Gitee账号 | Register a Gitee Account | 章节标题（Gitee 固定不译） |
| 码云（Gitee） | Gitee | 固定（码云为 Gitee 中文品牌名，英文页直接用 Gitee） |
| 主邮箱 | primary email | 设置您的主邮箱 |
| 开始您的贡献 | Start Your Contribution | 章节标题 |
| 给自己分配Issue | Assign an Issue to Yourself | 章节标题 |
| 提交Issue | Submit an Issue | 章节标题 |
| 提交Pull Request | Submit a Pull Request | 章节标题 |
| 机器人 | bot | /assign 由机器人执行 |
| 代码检视 | code review | 分段提交更便于代码检视 |
| 欢迎参与贡献 | Welcome to Contribute | 章节标题 |
| 开放、共享 | open and shared | 目标：构建开放、共享的开源技术社区 |
| 中国广受欢迎的开源数据库 | the most popular open source database in China | 社区目标表述 |
| 发送邮件告知 | send an email to notify us | greatsql@greatdb.com 不译 |

### 2.9 术语 = 英文（保持原样，不翻译）

| 术语 | 说明 |
| --- | --- |
| GCA / GCP / GDCA / GDCP | 认证等级缩写，全文保留（GDCA/GDCP 见 5-greatsql-adaptation「如果已获得 GDCA 或 GDCP 认证也可以」） |
| TOC / PMC / SIG / RFC | 治理机制缩写，保留 |
| Maintainer / Reviewer / Contributor / Ambassador / Consumer / User | 角色术语，保留 |
| Issue / Pull Request / PR | 开源协作术语，保留 |
| Community UID / UID | 社区账号编号，保留 |
| Gitee / GitHub | 平台名称，保留 |
| MGR | MySQL Group Replication 缩写，保留 |
| MySQL / GreatSQL / GreatDB | 产品名称，保留 |
| WeChat | 微信（页脚官方表述为 WeChat Official Account） |
| LOGO / logo | 保留 |
| /assign | 命令，不译 |
| greatsql@greatdb.com | 邮箱，不译 |
| greatsql-wx.jpg 等图片文件名 | 文件名，不译 |

---

## 三、可复用英文素材清单（直接复制，不重复翻译）

| 素材 | 英文原文 | 来源文件 | 用途 |
| --- | --- | --- | --- |
| 页脚文案 | `**Scan the QR code to follow our WeChat Official Account**` | `~/gitee/8.4.4-5/en/2-about-greatsql/1-greatsql-brief-intro.md` | 7 个英文页面统一页脚 |
| 页脚图片 | `![greatsql-wx](../greatsql-wx.jpg)`（en 页面路径为 `../` 前缀） | 同上 | 7 个英文页面统一页脚 |
| GreatSQL 简介引言 | `The GreatSQL database is an **open source and free** database that can meet financial-grade application scenarios on commodity hardware. It features **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, and can serve as an ideal drop-in replacement for MySQL or Percona Server for MySQL.` | 同上 | README（参与贡献页）引言改写参考 |
| GCA/GCP 课程表述 | `[GreatSQL GCA Course](https://greatsql.cn/smx_course-lesson.html?op=video&ids=10)`、`[GreatSQL GCP Course](https://greatsql.cn/smx_course-lesson.html?op=video&ids=11)` | `~/gitee/8.4.4-5/en/11-faq/1-faq-greatsql.md` | 4-greatsql-certified「额外学习资料」链接 |
| GCA/GCP 报名表述 | `After finishing the above courses, you can also register for the GreatSQL GCA or GCP certification exam.` | 同上 | 4-greatsql-certified 相关句式参考 |
| 认证链接文字 | `GreatSQL GCA/GCP training and certification` | 同上 | 链接文字译法基准 |
| 行为守则全文 | Contributor Covenant v1.4 官方英文原文（contributor-covenant.org，五个章节：Pledge / Our Standards / Our Responsibilities / Scope / Enforcement 与中文译本一一对应） | contributor-covenant.org（官方站） | **2-community-rules.md 整页直接复用官方英文原文，不从中译本回译** |
| 术语基准 | `en/1-docs-intro/1-5-glossary.md`（arbitrator、MGR、primary/secondary 等）与 `~/gitee/8.4.4-5/docs/translation-glossary.md` | 8.4.4-5 仓库 | 涉及数据库术语时查表 |
| 校验脚本 | `scripts/check-translation.js`（遍历 en/ 下 md、剔除代码块后统计 CJK） | `~/gitee/8.4.4-5/scripts/check-translation.js` | Step 9 复制入库 |
| 语言切换按钮 | `.vuepress/enhanceApp.js` 语言直切按钮代码、`.vuepress/styles/index.styl` 的 `.lang-switch-btn` 样式 | 8.4.4-5 | Step 1 已复用（本次不改） |
| i18n 配置模式 | config.js locales 模式、sidebar-en.js / nav-en.js | 8.4.4-5 | Step 1 已复用（本次不改） |

> 特殊约定：README.md 与 1-contribute-to-greatsql.md 逐字节一致（已 diff 确认），**翻译一次、复制两份**；图片路径在 en/ 页面统一为 `../` 前缀（`./greatsql-wx.jpg` → `../greatsql-wx.jpg`）。

---

## 四、专有名词保留策略（红线，任何情况下不得改动）

1. **人名**（含掩码如 `张*`）、**公司名**、**产品名**、**证书编号**（`GCA-DBA-2024xxxx`）、**社区账号**（UID 链接）、**URL**：一律原样保留，**即使其含中文**（如名单表格中的公司名「腾讯云计算（北京）有限责任公司」）；
2. **角色与机制术语**保留英文：TOC、PMC、Maintainer、Reviewer、Contributor、Ambassador、Consumer、User、SIG、RFC；
3. **认证等级缩写**保留：GCA、GCP、GDCA、GDCP（全称译法见 2.4）；
4. **代码块、命令、文件名、图片路径、链接 URL** 不译；`/assign`、`greatsql-wx.jpg`、`https://gitee.com/...` 等保持原样；
5. 名单表格只译**表头**（序号/姓名/证书编号、序号/类别/产品名称/版本号/供应商、序号/社区用户/应用场景）与**类别词**（见 2.6），**表内条目内容原样保留**；
6. 认证/致谢名单的更新由中文站常态维护，英文版仅需同步表内新条目，正文无需重译。

---

## 五、翻译保护规则（所有翻译批次强制）

1. **代码块**（``` 围栏）与**行内代码**（反引号）不译；代码块内注释文字可译、测试数据/字符串值原样保留；
2. **命令、文件名、URL、路径**不译；相对链接**路径不变，仅译链接文字**；
3. **图片引用** `![alt](path)`：path 不译且 en/ 页面中 `./xxx` 调整为 `../xxx`（含 `[def]:` 链接定义行）；alt 文本可译；
4. **表格**（`|` 分隔）保持列数与结构不变，仅译表头与可译单元格；人名掩码、公司名、证书编号、链接原样保留；
5. **H1 标题**与英文侧边栏对应条目一致（见 2.1）；
6. 只允许翻译：正文、标题、表格表头、列表项、图片 alt、链接文字；
7. 页脚统一用可复用文案（见「三」），不得自行改写。

---

## 六、大小写与书写规范

1. **标题（H1/H2/H3）**：Title Case，如 `Community Code of Conduct`、`Training & Certification`、`Compatibility Adaptation`；
2. **正文**：普通术语用小写（如 "compatibility adaptation testing"）；专有名称固定大写（GreatSQL、Gitee、MySQL、TOC、PMC、GCA、GCP、GDCA、GDCP、MGR、WeChat、Logo）；
3. **缩写首次出现给全称并括注**：`GreatSQL Certified Associate (GCA)`、`Project Management Committee (PMC)`、`Special Interest Group (SIG)`；后续直接用缩写；
4. **数字、版本号、日期、编号格式不变**：`25`、`60`、`184`、`80%`、`15 个工作日`→`15 business days`、`GCA-DBA-2024xxxx`、`1~100`；
5. 中英文混排：术语首次出现可括注中文原文（如 `mutual recognition（兼容互认）`），便于读者对照，后续直接使用英文。

---

## 七、验收检查清单（每个翻译批次执行）

1. `node scripts/check-translation.js <en 文件路径>`：该文件正文残留中文为 0（名单表格中按策略保留的公司名/人名掩码等专有名词除外）；
2. H1 与 sidebar-en.js 对应条目一致（4-greatsql-certified 按 2.1 译法）；
3. 表格列数与中文原文件一致（4/5/6 三文件重点核对）；
4. 抽查代码块、行内代码、链接路径、图片路径（`../` 前缀）未被误译/误改；
5. 抽查高频术语与术语表一致（见下）。

---

## 八、高频术语抽查清单（20 个，人工评审用）

| # | 中文 | 标准译法 |
| --- | --- | --- |
| 1 | 参与贡献 | Contribute |
| 2 | 社区行为守则 | Community Code of Conduct |
| 3 | 社区治理 | Community Governance |
| 4 | 培训认证 | Training & Certification |
| 5 | 兼容适配 | Compatibility Adaptation |
| 6 | 致谢 | Acknowledgments |
| 7 | 技术观察委员会 | TOC |
| 8 | 项目管理委员会 | Project Management Committee (PMC) |
| 9 | 社区小助手 | Community Assistant |
| 10 | 认证数据库专员 | GreatSQL Certified Associate (GCA) |
| 11 | 认证数据库专家 | GreatSQL Certified Professional (GCP) |
| 12 | 通过名单 | Certified Pass List |
| 13 | 证书编号 | certificate number |
| 14 | 操作系统 | Operating System |
| 15 | 应用软件 | Application Software |
| 16 | 中间件 | Middleware |
| 17 | 供应商 | Vendor |
| 18 | 应用场景 | Application Scenario |
| 19 | 开发贡献 | Development Contributions |
| 20 | 文档贡献 | Documentation Contributions |

---

## 九、各翻译批次应用对照（速查）

| Step | 文件 | 主要用表 | 特记事项 |
| --- | --- | --- | --- |
| Step 3 | en/README.md、en/1-contribute-to-greatsql.md | 2.8、三（页脚/简介） | 翻译一次复制两份；`./greatsql-wx.jpg` → `../greatsql-wx.jpg` |
| Step 4 | en/2-community-rules.md | 三（Contributor Covenant v1.4 官方英文原文） | 整页复用官方原文，不从中译本回译；保留举报邮箱 greatsql@greatdb.com 与外部链接；页脚复用 |
| Step 5 | en/3-community-toc.md | 2.2、2.3、三（页脚） | TOC/PMC/角色术语保留英文；`community-toc.jpg` → `../community-toc.jpg`（含 `[def]:` 行）；页脚复用 |
| Step 6 | en/4-greatsql-certified.md | 2.1、2.4、三（页脚/GCA-GCP 表述） | 5 张 GCA + 1 张 GCP 名单表仅译表头（序号/姓名/证书编号），人名掩码与证书编号原样保留；`gca-flow-chart.png`/`gcp-flow-chart.png` → `../`；页脚复用 |
| Step 7 | en/5-greatsql-adaptation.md | 2.1、2.5、2.6、三（页脚） | 112 行列表仅译表头与类别词，公司/产品/版本号原样保留；4 张图片路径 → `../`；页脚复用 |
| Step 8 | en/6-thanks.md | 2.1、2.7、三（页脚） | 社区用户表公司名保留、应用场景描述可译；开发/文档贡献描述可译、人名/账号/链接保留；感谢列表原样保留；页脚复用 |
