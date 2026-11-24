# 社区站点英文翻译 需求调研与开发计划

> 调研日期：2026-11-24
> 参考项目：`~/gitee/8.4.4-5` 全量英文翻译（规划文档 `docs/en-translation-research-and-plan-cc-20261119.md`，Phase 1 i18n 脚手架 + Phase 2 全量翻译 + Phase 3 验证，共 333 个文件已完成并上线）
> 当前状态：中文站已上线（`https://greatsql.cn/docs/community/`），无任何 i18n 基础设施，英文站从零搭建
> 目标仓库：`/nvme/gitee/community`（git branch `community`，与 `/home/yejr/gitee/community` 为同一 inode，改动即生效于部署源）

---

## 一、需求背景与目标

### 需求来源

GreatSQL 用户手册（8.4.4-5 等）已完成全量中译英并上线，但**社区站点**（参与贡献 / 社区行为守则 / 社区治理 / 培训认证 / 兼容适配流程 / 致谢，7 个页面）仍为纯中文。本次目标：参照 8.4.4-5 的做法，为社区站点搭建英文版，让国际用户可读。

### 功能目标与验收标准

- 英文站点与中文站同构：`en/` 目录镜像 7 个中文页面，路径为 `/docs/community/en/<页面>.html`，与原中文页一一对应；
- 搭建完整 i18n 脚手架：`config.js` locales（`/` 简体中文 + `/en/` English）、英文侧边栏与导航、导航栏中英一键直切按钮（照搬 8.4.4-5 成熟实现）；
- 翻译用词贴近 MySQL/GreatSQL 专业术语与官方表述（GCA/GCP/GDCA/GDCP、TOC/PMC、Maintainer/Reviewer/Contributor 等），可复用的英文素材优先从 `~/gitee/8.4.4-5/en` 及官方英文原文提取，不重复翻译；
- 代码块、命令、URL、图片路径、人名、公司名、证书编号一律不译；表格结构保持列数一致；
- 英文站 `vuepress build` 构建通过，无内部断链；`check-translation.js` 全站扫描正文残留中文为 0。

### Out of scope（本次不包含）

- **截图不重制**：英文页沿用中文截图（与 8.4.4-5 相同约定）；
- 认证通过名单 / 致谢名单等**动态列表**只做「表头 + 正文 + 类别」翻译，名单条目（人名、公司名、证书编号、链接）原样保留——名单更新由中文站常态维护，英文版随版本同步即可；
- 8.4.4-5 用户手册 FAQ 中指向 `4-greatsql-certified.html` 的链接更新为英文版 URL（跨仓库改动，作为可选后续项）；
- 其他语言（日/韩等）翻译。

---

## 二、现有代码调研

### 仓库结构

```
├── README.md                      # 参与贡献（与 1-contribute-to-greatsql.md 完全一致）
├── 1-contribute-to-greatsql.md    # 参与贡献
├── 2-community-rules.md           # 社区行为守则（Contributor Covenant v1.4 中文译本）
├── 3-community-toc.md             # 社区治理（TOC / PMC 治理机制）
├── 4-greatsql-certified.md        # 培训认证（GCA/GCP 简介、流程、FAQ、通过名单表格）
├── 5-greatsql-adaptation.md       # 兼容适配流程说明（申请流程 + 112 行认证通过列表）
├── 6-thanks.md                    # 致谢（社区用户表、开发贡献、文档贡献、感谢列表）
├── 5-greatsql-adaptation-flowchart.png / 5-logo-wall.png / community-toc.jpg
├── gca-flow-chart.png / gcp-flow-chart.png / greatsql-wx.jpg / greatsql-wx-assist.jpg / GreatSQL-logo-01.png
└── .vuepress/
    ├── config.js                  # 单语言配置：无 locales、无 i18n；sidebar 5 项、nav 4 项内联
    ├── enhanceApp.js              # 仅有配色模式切换按钮 + 百度统计，无语言切换
    └── styles/index.styl          # 配色主题样式（无 .lang-switch-btn）
```

### 规模盘点（本次调研实测）

| 文件 | 行数 | 正文可译量 | 备注 |
| --- | --- | --- | --- |
| README.md（= 1-contribute-to-greatsql.md） | 29 | 全文 | 两文件逐字节一致（diff 确认），翻译一次复制两份 |
| 2-community-rules.md | 46 | 全文 | 官方 Contributor Covenant v1.4 的忠实中文译本，官方英文原文可直接复用 |
| 3-community-toc.md | 181 | 全文 | 纯治理机制正文；TOC/PMC/Maintainer 等英文术语保留 |
| 4-greatsql-certified.md | 448 | 约 60 行 | 其余为 GCA/GCP 通过名单表格（人名掩码 + 证书编号，不译） |
| 5-greatsql-adaptation.md | 220 | 约 70 行 | 其余为 112 行兼容认证列表（公司/产品名称，不译） |
| 6-thanks.md | 168 | 约 40 行 | 其余为名单表格（公司/人名/链接，不译） |
| **合计** | **~1,121** | **约 400 行正文** | 与 8.4.4-5 手册（333 文件 / 78,600 行）相比规模小两个数量级 |

### 关键发现

1. **无 i18n 基础设施**：config.js 无 `locales`、无 `en/` 目录、enhanceApp.js 无语言切换按钮、styles 无 `.lang-switch-btn` 样式。8.4.4-5 的 Phase 1 脚手架（locales 配置、sidebar-en/nav-en、语言直切按钮、样式）可直接照搬，几乎零成本。
2. **README.md 与 1-contribute-to-greatsql.md 完全一致**：翻译一次、复制两份即可；`1-contribute-to-greatsql.md` 未在侧边栏，仅作为独立页存在。
3. **2-community-rules.md 是 Contributor Covenant v1.4 中文译本**（章节结构：贡献者和维护者的承诺 / 我们的准则 / 我们的义务 / 适用范围 / 贯彻落实，与官方 v1.4 完全对应）。**英文版应直接复用官方英文原文**（contributor-covenant.org v1.4），而不是从中文回译——这是本次最大的复用收益。
4. **三个大文件以表格为主**（4/5/6，合计 836 行），人名（张* 掩码）、公司名、证书编号（GCA-DBA-2024xxxx）、链接均为专有名词不译；真正需要翻译的是表头（序号/姓名/证书编号、序号/类别/产品名称/版本号/供应商、序号/社区用户/应用场景）与分类词（操作系统/存储/CPU/服务器/应用软件/中间件/DPU）。
5. **可复用英文素材清单**（来自 `~/gitee/8.4.4-5/en`，已验证存在）：
   - **页脚**：`**Scan the QR code to follow our WeChat Official Account**` + `![greatsql-wx](../greatsql-wx.jpg)`（7 个页面全部以此结尾，取自 `en/2-about-greatsql/1-greatsql-brief-intro.md`）；
   - **GreatSQL 简介段**：`The GreatSQL database is an **open source and free** database that can meet financial-grade application scenarios on commodity hardware...`（同上文件，README 参与贡献页的引言可参考改写）；
   - **GCA/GCP 认证表述**：`GreatSQL GCA Course` / `GreatSQL GCP Course` / `you can also register for the GreatSQL GCA or GCP certification exam` / 链接文字 `GreatSQL GCA/GCP training and certification`（取自 `en/11-faq/1-faq-greatsql.md`）；
   - **术语表**：`en/1-docs-intro/1-5-glossary.md`（arbitrator、MGR、primary/secondary 等）与 `docs/translation-glossary.md`（中文→英文对照 + 翻译规范）；
   - **基础设施**：`scripts/check-translation.js`（校验脚本可直接复制使用，其逻辑为遍历 `en/` 下 md、剔除代码块后统计 CJK）、`.vuepress/enhanceApp.js` 的语言直切按钮代码、`.vuepress/styles/index.styl` 的 `.lang-switch-btn` 样式、config.js locales 模式、sidebar-en.js/nav-en.js 模式。
6. **部署链路**：`community.sh`（`cd /home/yejr/gitee && yarn community:build && rsync community/.vuepress/dist/* /usr/share/nginx/html/docs/community`）；本地验证用 `cd /home/yejr/gitee && yarn community:build`（package.json 在 /home/yejr/gitee，community 是其子目录/同一 inode）。构建环境 VuePress 1.9.10，与 8.4.4-5 一致，已验证可用。

### 依赖关系

- 每个英文页面只依赖：中文原文件（内容源）+ 术语表（译法）+ `en/` 目录结构（镜像路径）+ 可复用英文素材（页脚/简介/GCA-GCP 表述）；
- 文件之间无编译期依赖，翻译顺序自由；**但 i18n 脚手架（Step 1）必须先完成**，否则 en 页面无路由可访问；
- 术语表（Step 2）应先于翻译批次定稿，保证 GCA/GCP/TOC/PMC 等术语全站一致。

---

## 三、技术方案设计

### 整体方案

**中文原位不动，`en/` 目录镜像翻译，脚手架照搬 8.4.4-5 成熟实现。** 按「i18n 脚手架 → 术语表与复用清单 → 单页分批翻译（7 个文件按内容类型分 6 批）→ 校验脚本入库 → 构建验证与审校」推进。

### 核心机制

1. **i18n 脚手架（照搬 8.4.4-5 Phase 1）**：
   - `config.js` 顶层新增 `locales`：`'/'`（lang zh-CN）+ `'/en/'`（lang en-US，title/description 英文）；
   - `themeConfig.locales` 拆出两套 nav/sidebar：中文保持现状（内联 5 项侧边栏 + 4 项导航），英文新建 `.vuepress/configs/sidebar-en.js` 与 `nav-en.js`（路径带 `/en/` 前缀）；
   - `enhanceApp.js` 增加语言直切按钮（复制 8.4.4-5 实现：隐藏默认语言下拉、按当前路径探测目标页、按钮文案 `English`/`简体中文`），保留现有配色切换与百度统计；
   - `styles/index.styl` 增加 `.lang-switch-btn` 样式（从 8.4.4-5 复制）。
2. **翻译保护规则**（所有翻译批次强制遵守，同 8.4.4-5）：
   - 代码块、行内代码、命令、文件名、URL、图片路径一律不译；代码块内注释文字可译、测试数据原样保留；
   - 相对链接路径不变，仅译链接文字；`en/` 页面中图片相对路径由 `./xxx` 调整为 `../xxx`（en 页面位于 en/ 子目录）；
   - 表格结构（`|` 分隔）列数不变；表头译、专有名词不译；
   - H1 与英文侧边栏标题一致（参与贡献→Contribute、社区行为守则→Community Code of Conduct、社区治理→Community Governance、兼容适配流程说明→Compatibility Adaptation、致谢→Acknowledgments、培训认证→Training & Certification）。
3. **专有名词保留策略**（本次翻译的核心难点在于「哪些不译」）：
   - 人名（含掩码 `张*`）、公司名、产品名、证书编号、社区账号、URL：一律原样保留；
   - 分类词与表头译：操作系统→Operating System、存储→Storage、CPU、服务器→Server、应用软件→Application Software、中间件→Middleware、DPU 保留；
   - 角色术语保留英文：TOC、PMC、Maintainer、Reviewer、Contributor、Ambassador、Consumer、User、SIG、RFC；
   - 认证等级：GCA（GreatSQL Certified Associate）、GCP（GreatSQL Certified Professional）、GDCA、GDCP 保留缩写，全称译法以官方表述为准。
4. **校验脚本**：复制 `scripts/check-translation.js`（逻辑通用：遍历 `en/` 下 md、剔除代码块后统计 CJK `[\u4e00-\u9fa5]`），作为每个翻译批次的验收工具。

### 方案对比

| 方案 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- |
| en/ 镜像 + 照搬 8.4.4-5 脚手架 | 零路径风险、实现成本最低（脚手架已有成熟代码）、增量可控 | 无（工程上已就绪） | ✅ 采用 |
| 独立英文仓库/子站 | 完全解耦 | 需重建导航/部署链路，双份维护成本高 | 不采用 |
| 一次性脚本全量机翻 | 快 | 术语不一致、破坏专有名词/链接风险高 | 不采用（正文量小，人工翻译可控） |

---

## 四、风险评估

| 风险 | 等级 | 说明与对策 |
| --- | --- | --- |
| 术语不一致 | 中 | 7 个文件分批翻译，GCA/GCP/TOC/PMC 等易出现多种译法。对策：Step 2 术语表先行 + Step 10 全站抽查 |
| 专有名词被误译 | 中 | 名单表格中人名/公司名/证书编号与正文混排。对策：翻译保护规则 + 表头译/内容不译 + 逐表校验列数 |
| 表格结构破坏 | 中 | 4/5/6 三文件 836 行表格。对策：每批校验列数一致；构建后检查渲染 |
| 图片路径失效 | 中 | en/ 页面中 `./xxx.png` 需改为 `../xxx.png`。对策：翻译批次逐一核对图片相对路径；构建后检查页面图片 |
| 锚点失效 | 低 | 社区页面几乎无站内 `#锚点` 内部链接（仅 6-thanks 含少量外部锚点链接），风险面小；翻译标题时保持与侧边栏一致即可 |
| 中文修订漂移 | 中 | 名单表格（认证通过名单/致谢名单）中文站持续更新。对策：收尾步骤说明「名单更新仅需同步表内新条目，正文无需重译」 |
| 语言切换按钮故障 | 中 | 8.4.4-5 的实现依赖 base path 推导与静态文件探测。对策：照搬已验证代码 + 构建后手工验证中英互切 |
| 构建环境风险 | 低 | VuePress 1.9.10 构建环境与 8.4.4-5 相同，已验证可用 |

---

## 五、开发计划（分步骤）

> **全局翻译规则**（每步适用）：只译正文、标题、表格表头、列表项、图片 alt；代码块/行内代码/命令/文件名/URL/图片路径不译；人名/公司名/证书编号/链接不译；相对链接路径不变（图片路径加 `../` 前缀）；H1 与英文侧边栏标题一致；用词遵循术语表（docs/translation-glossary-community.md）。
> **每步通用验证**：`node scripts/check-translation.js <en 文件路径>` 确认该文件残留中文为 0；人工核对专有名词与图片路径未被误改。

---

### Step 1：i18n 脚手架（locales + 侧边栏/导航 + 语言切换按钮 + en/ 骨架）
- **目标**：英文站路由、侧边栏、导航、语言直切按钮全部就绪；`en/` 下 7 个占位页可访问。
- **涉及文件**：.vuepress/config.js、新建 .vuepress/configs/sidebar-en.js、nav-en.js、.vuepress/enhanceApp.js、.vuepress/styles/index.styl、en/ 下 7 个占位页
- **关键改动**：
  - config.js 增加顶层 `locales`（`'/'` zh-CN、`'/en/'` en-US）与 `themeConfig.locales`（两套 nav/sidebar；中文原样，英文路径带 `/en/` 前缀）；
  - 从 8.4.4-5 复制语言直切按钮代码与 `.lang-switch-btn` 样式，与现有配色切换/百度统计共存；
  - 生成 en/ 占位页（H1 用英文标题 + "English translation in progress" + 回链中文页），后续翻译逐步覆盖。
- **验证方式**：`cd /home/yejr/gitee && yarn community:build` 构建通过；`/en/` 首页与占位页可达；语言按钮中英互切正常。
- **预估复杂度**：中

### Step 2：术语表与可复用内容清单
- **目标**：产出 `docs/translation-glossary-community.md`，作为全部翻译批次的唯一译法基准。
- **涉及文件**：新建 docs/translation-glossary-community.md（参考 `~/gitee/8.4.4-5/docs/translation-glossary.md` 与 `en/1-docs-intro/1-5-glossary.md`）
- **关键改动**：
  - 收录社区站点核心术语：参与贡献→Contribute、社区行为守则→Community Code of Conduct、社区治理→Community Governance、培训认证→Training & Certification、兼容适配→Compatibility Adaptation、致谢→Acknowledgments、GCA/GCP/GDCA/GDCP、TOC/PMC/SIG/RFC、Maintainer/Reviewer/Contributor/Ambassador/Consumer/User、社区小助手→Community Assistant 等；
  - 列出可复用英文素材及其来源（页脚、GreatSQL 简介、GCA/GCP 认证表述）；
  - 写明专有名词保留策略与翻译保护规则。
- **验证方式**：文档评审（人工确认 20 个高频术语与官方/8.4.4-5 译法一致）。
- **预估复杂度**：低

### Step 3：参与贡献（en/README.md + en/1-contribute-to-greatsql.md）
- **目标**：英文站首页（参与贡献）上线；两文件内容一致，翻译一次复制两份。
- **涉及文件**：en/README.md、en/1-contribute-to-greatsql.md
- **关键改动**：全文翻译；引言参考可复用 GreatSQL 简介改写；Gitee 注册/Issue/PR 流程为社区协作通用表述；页脚用可复用页脚文案；图片路径 `./greatsql-wx.jpg` → `../greatsql-wx.jpg`。
- **验证方式**：check-translation.js 两文件残留中文为 0；图片路径核对。
- **预估复杂度**：低

### Step 4：社区行为守则（en/2-community-rules.md）
- **目标**：行为守则英文版上线。
- **涉及文件**：en/2-community-rules.md
- **关键改动**：**直接复用 Contributor Covenant v1.4 官方英文原文**（五个章节一一对应，不从中译本回译），替换页脚为可复用页脚；保留举报邮箱 greatsql@greatdb.com 与外部链接。
- **验证方式**：check-translation.js 残留中文为 0；章节结构与官方 v1.4 逐条对应。
- **预估复杂度**：低

### Step 5：社区治理（en/3-community-toc.md）
- **目标**：社区治理英文版上线（正文量最大的纯文本页）。
- **涉及文件**：en/3-community-toc.md
- **关键改动**：全文翻译；TOC/PMC/Maintainer/Reviewer/Contributor/Ambassador/Consumer/User/SIG/RFC 等角色与机制术语保留英文；`community-toc.jpg` 路径调整为 `../community-toc.jpg`（含文末 `[def]:` 链接定义行）；页脚复用。
- **验证方式**：check-translation.js 残留中文为 0；术语抽查与术语表一致。
- **预估复杂度**：中

### Step 6：培训认证（en/4-greatsql-certified.md）
- **目标**：培训认证英文版上线。
- **涉及文件**：en/4-greatsql-certified.md
- **关键改动**：正文（认证简介、认证流程、FAQ 五问、通过名单引言）翻译；GCA/GCP 全称与考试规则（25 题 60 分、70 题 184 分等）用官方表述；**5 张 GCA + 1 张 GCP 通过名单表格仅译表头（序号/姓名/证书编号），人名掩码与证书编号原样保留**；`gca-flow-chart.png`/`gcp-flow-chart.png` 路径调整为 `../`；页脚复用。
- **验证方式**：check-translation.js 残留中文为 0（正文区）；抽查表格列数与中文一致、证书编号未被改动。
- **预估复杂度**：中

### Step 7：兼容适配流程（en/5-greatsql-adaptation.md）
- **目标**：兼容适配流程英文版上线。
- **涉及文件**：en/5-greatsql-adaptation.md
- **关键改动**：流程正文（申请前准备、四步流程、盖章、官网展示）翻译；**112 行认证通过列表仅译表头（序号/类别/产品名称/版本号/供应商）与类别词（操作系统→Operating System 等），公司名/产品名/版本号原样保留**；`5-greatsql-adaptation-flowchart.png`/`5-logo-wall.png`/`greatsql-wx-assist.jpg`/`greatsql-wx.jpg` 路径调整为 `../`；页脚复用。
- **验证方式**：check-translation.js 残留中文为 0；抽查表格列数一致、公司名未被改动。
- **预估复杂度**：中

### Step 8：致谢（en/6-thanks.md）
- **目标**：致谢页英文版上线。
- **涉及文件**：en/6-thanks.md
- **关键改动**：正文（引言、章节标题）与表头（序号/社区用户/应用场景）翻译；**社区用户表的公司名与「应用场景」中描述性短语翻译、公司名保留；开发贡献/文档贡献条目的贡献描述翻译、人名/账号/链接保留；感谢列表条目原样保留**；页脚复用。
- **验证方式**：check-translation.js 残留中文为 0；抽查链接与账号未被改动。
- **预估复杂度**：中

### Step 9：校验脚本入库 + 全站扫描
- **目标**：翻译完整性校验工具纳入仓库，全站残留中文清零确认。
- **涉及文件**：新建 scripts/check-translation.js（复制 8.4.4-5 版本）、en/README.md（英文站首页状态说明，可选）
- **关键改动**：复制校验脚本；全站扫描确认 7 个 en 文件正文残留中文为 0（专有名词如公司名/证书编号为无 CJK 或已按策略保留的除外）；en/README.md 可补充英文站说明与状态表。
- **验证方式**：`node scripts/check-translation.js` 输出 0 残留（或仅剩按策略保留的合法专有名词）。
- **预估复杂度**：低

### Step 10：构建验证 + 重点审校 + 部署手册
- **目标**：英文站整体构建通过、无断链；术语一致性终检；产出部署手册（由用户手动执行部署）。
- **涉及文件**：全站 en/（无需改文件，仅验证；如有问题则修复对应文件）；新建 docs/community-en-deploy.md
- **关键改动**：
  - `cd /home/yejr/gitee && yarn community:build` 构建成功；`/en/` 下 7 个页面均生成；
  - 链接/图片检查：en 页内相对链接与图片路径（`../` 前缀）均有效；语言按钮中英互切验证；
  - check-translation.js 全站扫描最终确认；抽查 GCA/GCP/TOC/PMC 等术语与术语表一致；
  - 产出部署手册：**用户手动执行** `bash community.sh`（重建 dist 并 rsync 至 `/usr/share/nginx/html/docs/community`），部署后访问 `https://greatsql.cn/docs/community/en/` 验证语言切换与 7 个页面。
- **验证方式**：构建日志无 error；链接/图片检查 0 失效；check-translation.js 残留中文符合预期。
- **预估复杂度**：中

---

## 六、测试计划

### 自动化校验（每个翻译批次执行）
- `node scripts/check-translation.js <en 文件>`：该文件残留中文字符为 0（代码块与按策略保留的专有名词除外）；
- 表格校验：英文文件表格列数与中文原文件一致（4/5/6 三个文件重点核对）。

### 构建回归（Step 1、Step 10 各一次）
- `cd /home/yejr/gitee && yarn community:build`；
- 检查：`/en/` 下 7 个页面生成、无构建 error、`dist/en/` 内无失效相对链接/图片。

### 手工验证场景
- 语言切换器在中文页与英文页之间互切，同路径另一语言页可达；中文站行为（配色切换、百度统计）不受影响；
- 抽查英文页：4/5/6 三页表格渲染正常、列对齐；名单中的人名/公司名/证书编号原样显示；图片正常显示（沿用中文截图）；
- 页脚（扫码关注微信公众号）在英文页显示为英文文案 + 原图。

---

## 七、文档更新计划

| 文档 | 更新时机 | 内容 |
| --- | --- | --- |
| docs/en-translation-research-and-plan-cc-20261124.md | Step 10 | 追加完成记录（各批翻译结果、构建验证结论、遗留问题） |
| docs/translation-glossary-community.md | Step 2 新建，Step 10 修订 | 术语对照表 + 翻译规范 + 可复用素材清单 |
| docs/community-en-deploy.md | Step 10 新建 | 部署手册（用户手动执行 community.sh + 上线验证步骤） |
| en/README.md | Step 9 | 英文站说明与状态表（可选） |
| CHANGELOG.md / README.md | 各翻译批次完成时 | 当前仓库无 CHANGELOG.md 惯例，如用户要求则同步（遵循现状） |

---

## 八、注意事项与约束

- **术语要求**：以 MySQL/GreatSQL 官方表述与 `~/gitee/8.4.4-5/en` 已定译法为基准，禁止日常通用英文（如「高可用」译为 high availability 而非 highly usable）；
- **可复用优先**：页脚、GreatSQL 简介、GCA/GCP 认证表述、Contributor Covenant v1.4 官方英文原文、术语表、校验脚本、语言切换代码均直接复用，**不重复翻译**（用户明确提醒，用于节省资源）；
- **单批次规模控制**：每步 1~2 个文件，按内容类型分批（纯正文 / 表格为主），避免单次承载过多文档；
- **不执行的操作**：开发期间**禁止**执行 `community.sh`（其包含部署到线上 nginx 的 rsync 操作）与任何 `podman`/`npm build` 等无关命令；本地验证仅限 `cd /home/yejr/gitee && yarn community:build`（构建到 `.vuepress/dist`，不触网）；线上发布由用户按 Step 10 部署手册手动执行；
- **专有名词红线**：人名掩码（张*）、公司名、证书编号、URL 在任何情况下不得改动，即使其含中文。

---

## 九、完成记录（Step 10，2026-11-24）

### 9.1 构建验证结论

- `cd /home/yejr/gitee && yarn community:build` **构建成功**（Server/Client Compiled successfully，约 10s），无 error；
- `dist/en/` 下 **7 个页面全部生成**：index.html（README/参与贡献）、1-contribute-to-greatsql.html、2-community-rules.html、3-community-toc.html、4-greatsql-certified.html、5-greatsql-adaptation.html、6-thanks.html；
- 7 张图片（community-toc.jpg、gca-flow-chart.png、gcp-flow-chart.png、5-greatsql-adaptation-flowchart.png、5-logo-wall.png、greatsql-wx.jpg、greatsql-wx-assist.jpg）全部被 webpack 打包至 `assets/img/`，src 引用有效。

### 9.2 链接/图片/锚点检查（脚本全量校验）

- 页面内部链接：**7/7 有效**（含 en 各页互链与中文站同构页）；
- 图片引用：**7/7 有效**；
- 站内锚点：**22/22 有效**（含 `#register-a-gitee-account`、`#our-pledge`、`#_1-preparation-before-application` 等 VuePress slug 锚点）；
- en 源 md 内相对链接目标全部存在（无失效链接）。

### 9.3 翻译校验（check-translation.js 全站扫描）

- `node scripts/check-translation.js`：7 个文件扫描，README/1/2/3 残留中文为 **0**；
- 4/5/6 三文件残留中文**全部为按策略保留的专有名词**（已逐行甄别）：
  - `en/4-greatsql-certified.md`（1065 字符）：非表格行中文为 0，残留仅人名掩码（张*、董*飞 等）；
  - `en/5-greatsql-adaptation.md`（2256 字符）：非表格行中文仅在 URL 内（申请表/自测报告文件名），残留为兼容认证列表的公司名/产品名（腾讯云计算（北京）有限责任公司、凝思安全操作系统 等）；
  - `en/6-thanks.md`（320 字符）：残留为机构名/人名/账号（中信建投证券股份有限公司信息技术部、许怀安、月城 等感谢列表条目，按「感谢列表条目原样保留」策略）；
- `--codeblocks` 模式：代码块内 CJK **0**（无中文注释残留）。

### 9.4 结构与术语一致性

- 表格列数核对（与中文源文件逐列比对）：4 号文件 7 列、5 号文件 6 列、6 号文件 4/3 列，**全部一致**；表头已翻译（`No. | Name | Certificate Number`、`No. | Community User | Application Scenario`、`Operating System` 等类别词）；
- H1 与英文侧边栏标题一致：Contribute / Community Code of Conduct / Community Governance / Training & Certification / Compatibility Adaptation / Acknowledgments；
- 术语抽查（与 `docs/translation-glossary-community.md` 一致）：GCA 483 处、GCP 178 处、TOC 16、PMC 13、Maintainer 14、Reviewer 9、Contributor 18、Ambassador 3、Community Assistant 6；
- 页脚：7 个文件全部含英文页脚文案（Scan the QR code to follow our WeChat Official Account）；
- `en/README.md` 与 `en/1-contribute-to-greatsql.md` 内容一致（除 H1，符合翻译一次复制两份的约定）；
- 语言切换按钮：enhanceApp.js 完整实现中英一键直切（隐藏默认语言下拉、按路径探测目标页、配色模式 i18n 文案），与 8.4.4-5 成熟实现一致。

### 9.5 产出物与遗留事项

- 新建 `docs/community-en-deploy.md`：部署手册（用户手动执行 `bash community.sh` + 上线验证步骤 + 常见问题处理）；
- **遗留事项**：
  - 线上发布由用户按部署手册手动执行（本次未执行 `community.sh`，线上仍为旧版中文站）；
  - 可选后续项：8.4.4-5 用户手册 FAQ 指向 `4-greatsql-certified.html` 的链接更新为英文版 URL（跨仓库改动，未纳入本次范围）；
  - 名单表格（认证通过名单/致谢名单）由中文站常态更新，英文版随版本同步表内新条目即可，正文无需重译。
