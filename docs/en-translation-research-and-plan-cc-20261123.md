# GreatSQL 8.4.4-4 英文文档上线（复用 8.4.4-5 译文）需求调研与开发计划

> 调研日期：2026-11-23
> **完成状态：✅ 全部 15 个 Step 已执行完毕（2026-11-23），英文站构建验证通过、en/ 328 文件残留中文 0、审校完成（详见 Step 15）**。
> 参考基准：`~/gitee/8.4.4-5/docs/en-translation-research-and-plan-cc-20261119.md`（8.4.4-5 全量英文翻译计划，已完成并上线）
> 本仓库现状：8.4.4-4 站点**尚无 i18n 脚手架**（无 locales、无 en/ 目录、无 scripts/、无 docs/），侧边栏内联在 config.js 中
> 核心思路：**8.4.4-5 的 333 个英文文件已全部翻译完成，本计划以「脚手架移植 + en/ 批量复制 + diff 驱动修补 + 少量新译」为主，避免重新翻译 300+ 文件**

---

## 一、需求背景与目标

### 需求来源

GreatSQL 8.4.4-5 用户手册已完成中英双语上线（8.4.4-5 仓库，Phase 1 脚手架 + Phase 2 全量翻译均完成，`en/` 下 333 个英文文件无占位页）。现需将 8.4.4-4 版本手册（本仓库）同样上线英文版。

8.4.4-4 与 8.4.4-5 为同源相邻版本：中文内容绝大多数一致，8.4.4-5 仅做了「中英文间空格排版格式化 + 少量修订 + 新增 8.4.4-5 特性」。因此**英文译文不应从零翻译，而应从 8.4.4-5/en 复用**，按中文差异逐文件修补。

### 功能目标与验收标准

- 本仓库具备与 8.4.4-5 相同的 i18n 脚手架（config.js locales、sidebar/nav 双语配置、语言切换按钮、校验脚本）；
- `en/` 目录与中文 14 章节镜像对齐：**327 个中文文件均有对应英文译文**（8.4.4-4 共 327 个章节文件，另有根 README.md）；
- 英文译文与 **8.4.4-4 中文内容**一致（以本仓库 zh 为唯一内容基准，不沿用 8.4.4-5 特有的新增段落）；
- 翻译用词延续 8.4.4-5 已定稿的术语体系（docs/translation-glossary.md），贴近 MySQL/GreatSQL 专业术语；
- 英文站构建通过，无内部断链；`en/README.md` 章节状态表与 8.4.4-4 文件数一致。

### Out of scope（本次不包含）

- 8.4.4-5 特有内容的翻译：6 个文件（8445 发行说明、`5-1-highperf-vector-search`、`5-1-highperf-binlog-flush-opt-large-trx`、`5-1-highperf-parallel-replica`、`5-1-highperf-execplan-baseline`、`5-2-ha-repl-interface-cmd`）为 8.4.4-5 新增特性，**不纳入本仓库**；
- 中文截图重制（8.4.4-5 已明确 Out of scope，英文页沿用中文截图）；
- SEO/收录优化；
- 其他版本（8.0.32-27 等）英文翻译；
- 线上发布（构建验证仅限本地 `vuepress build`，发布由用户手动执行）。

---

## 二、现有代码调研

### 本仓库（8.4.4-4）结构

```
├── 1-docs-intro/ … 14-greatsql-demo/   # 14 个中文章节目录（327 个 md 文件）
├── .vuepress/
│   ├── config.js                       # 1020 行，侧边栏/导航内联，无 locales（无 i18n）
│   ├── enhanceApp.js                   # 仅配色切换，无语言切换
│   ├── styles/                         # palette.styl / index.styl
│   └── dist/                           # 已有构建产物（此前构建过）
└── README.md                           # 中文根页
```

**无**：`en/` 目录、`scripts/`、`docs/`、`configs/`。

### 参考仓库（8.4.4-5）可复用资产

| 资产 | 位置 | 说明 |
|---|---|---|
| 英文译文 | `en/`（333 个 md + 图片） | **全部翻译完成**，无占位页 |
| i18n 配置 | `.vuepress/config.js` | locales + themeConfig.locales，base `/docs/8.4.4-5/`，branch `greatsql-8.4.4-5` |
| 双语侧边栏 | `.vuepress/configs/sidebar-zh.js`（930 行）/ `sidebar-en.js`（933 行） | 由脚本生成，含 6 个 8.4.4-5 特有条目 |
| 双语导航 | `.vuepress/configs/nav-zh.js` / `nav-en.js` | 版本切换下拉 + 社区链接 |
| 增强脚本 | `.vuepress/enhanceApp.js` | 配色切换（含 EN 文案）+ 中英一键切换按钮 |
| 工具脚本 | `scripts/` 5 个：check-translation.js、gen-en-placeholders.js、gen-error-code-en.js、translate-sidebar-titles.js、zh-en-titles.js | **均无 8.4.4-5/8445 硬编码**，可直接复制 |
| 文档 | `docs/` 3 个：i18n-feasibility.md、translation-glossary.md、translation-sync-process.md | 术语表/同步机制可直接沿用 |
| 构建环境 | `/data/home/yejr/node_modules/.bin/vuepress` | VuePress 1.9.10，无 package.json，可用 |

### 中英文文件对应关系（本次调研实测）

- 8.4.4-4 共 **328** 个 md（327 章节文件 + 根 README.md）；8.4.4-5 共 **333** 个 en 文件（332 + en/README.md）；
- **327 个章节文件在 8.4.4-5/en 有同名对应文件** → 可复制复用；
- 8.4.4-5/en 独有 6 个文件（上述 Out of scope）→ 跳过；
- 8.4.4-4 独有 **1 个文件需新译**：`6-oper-guide/11-gt-checksum.md`（173 行，gt-checksum 工具介绍，被 `13-reference/1-index.md` 与 `6-oper-guide/10-6-pt-replication.md` 引用）。

### 中文内容差异分析（8.4.4-5 zh vs 8.4.4-4 zh）

用 `LC_ALL=C diff -w`（忽略空白）逐文件对比，316 个同名文件分布：

| 差异类别 | 文件数 | 说明 |
|---|---|---|
| 完全相同 | 11 | 直接复制 en 即可 |
| 仅排版差异（忽略空白后相同） | 119 | 8.4.4-5 做过「中英文间加空格」格式化，内容相同 → 复制 en 即可 |
| 1~10 行真实差异 | 100 | 多为版本号（8.4.4-5→8.4.4-4）、错别字修复（如 `group_replicaiton`→`group_replication`、`登入`→`登录`）→ en 基本无需改动，抽查核验 |
| 11~50 行真实差异 | 70 | 内容有小幅增删/改写 → 需对照 diff 修补 en |
| >50 行真实差异 | 27 | 多 OS 安装包命令、Rapid/Turbo 引擎、MGR VIP、快速上手、特性介绍等 → 重点修补 |
| **合计** | **316** | 另 11 个完全相同文件 |

> 注：`12-dev-guide/12-8-1-error-code-reference.md`（11K 行错误码表）忽略空白后**完全相同**，其 en 版（266KB）可直接复制，**无需重跑 gen-error-code-en.js**。

### 真实差异文件章节分布

- 11~50 行（70 个）：6-oper-guide 15、5-enhance 14、1-docs-intro 8、2-about-greatsql 5、8-mgr 4、4-install-guide 4、12-dev-guide 4、11-faq 4、10-optimize 4、3-quick-start 3、9-ha 2、13-reference 2、7-migrate 1
- >50 行（27 个）：4-install-guide 10、5-enhance 4、7-migrate 3、1-docs-intro 2、3-quick-start 2、12-dev-guide 2、11-faq 1、10-optimize 1、6-oper-guide 1、8-mgr 1、9-ha 1、README.md 1

### en 文件版本号引用

34 个 en 文件（33 md + README.md）含 `8.4.4-5`/`8445` 引用需适配，章节分布：4-install-guide 14、7-migrate 4、1-docs-intro 4、3-quick-start 4、5-enhance 2、6-oper-guide 2、12-dev-guide 1、2-about 1、8-mgr 1。

### 依赖关系

- 每个 en 译文依赖：8.4.4-5/en 原译文（内容源）+ 8.4.4-4 zh 原文件（一致性基准）+ 术语表（译法基准）+ diff 分类脚本（修补清单）；
- 文件间无编译期依赖，但**脚手架（Step 1-2）必须先就绪**，否则 en/ 文件无法构建验证；
- 侧边栏/导航在 8.4.4-5 已拆分到 configs/，移植时需删除 6 个特有条目并把 23 处外链 `docs/8.4.4-5/` 改为 `docs/8.4.4-4/`（两仓库 sidebar 路径差异**仅此两类**，已实测确认）。

---

## 三、技术方案设计

### 整体方案

**「复用 + 修补」而非「重新翻译」**：

1. **脚手架移植**：将 8.4.4-5 的 i18n 全套（config.js、configs/、enhanceApp.js、scripts/、docs/）复制到本仓库，做版本号/路径适配；
2. **en/ 批量复制**：327 个文件从 8.4.4-5/en 按同名路径复制（跳过 6 个特有文件），图片资源一并复制；
3. **全局版本适配**：sed 批量替换 en/ 与配置中的 `8.4.4-5`→`8.4.4-4`（注意区分：仅替换版本号文本，不动 8.4.4-4/8.0.32-27 等历史版本链接）；
4. **diff 驱动修补**：以「8.4.4-4 zh vs 8.4.4-5 zh」的真实差异清单为输入，逐文件对齐 en 与 8.4.4-4 中文内容：zh 8.4.4-4 有而 8.4.4-5 无 → en 补译；zh 8.4.4-5 有而 8.4.4-4 无 → en 删除对应段落；双方有但不同 → en 按 8.4.4-4 改写；
5. **新译**：`6-oper-guide/11-gt-checksum.md` 全文翻译 + `1-docs-intro/1-3-greatsql-features.md` 特有的 "GreatSQL VS MySQL" 表格段落翻译；
6. **验证收尾**：vuepress build + check-translation.js 全站扫描 + 链接/锚点检查 + 审校。

### 核心机制

1. **差异分类脚本**：新建 `scripts/classify-zh-diffs.js`（或 bash 脚本），对比两仓库 zh 文件（`LC_ALL=C diff -w`），输出三类清单：`[copy-as-is]`（无真实差异，en 直接复制）、`[patch]`（有真实差异，列出 diff 概要）、`[new-translate]`（8.4.4-4 独有文件），作为 Step 3~11 的执行驱动。脚本可重复运行，幂等。
2. **翻译保护规则**（沿用 8.4.4-5 已定稿规则，见 docs/translation-glossary.md）：
   - 代码块/行内代码/命令/文件名/URL/图片路径不译；代码块内注释可译、测试数据原样保留；
   - 内部相对链接路径不变，仅译链接文字；表格结构保持列数；
   - H1 与 sidebar-en.js 英文标题一致；
   - 术语以 MySQL 官方文档用语为基准。
3. **版本号替换规则**：en/ 中 `8.4.4-5`、`8445`、`GreatSQL-8.4.4-5` 等版本串替换为 8.4.4-4 对应串；但**仅限指向本仓库版本的引用**（如下载链接、包名、文档适用版本），不得替换 nav 中指向 8.4.4-5 线上站点的历史版本链接（`https://greatsql.cn/docs/8.4.4-5/` 是外链，保留）。

### 方案对比

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| 复用 8.4.4-5/en + diff 修补（本方案） | 节省 95%+ 翻译工作量、术语天然一致、与上游译法零偏差 | 需仔细处理两版本内容差异 | ✅ 采用 |
| 从零翻译 327 个文件 | 无版本差异问题 | 资源消耗巨大、术语易漂移、与 8.4.4-5 上线版不一致 | 不采用 |
| 直接复制 8.4.4-5/en 不做修补 | 最快 | 英文页含 8.4.4-5 特有内容/版本号，与 8.4.4-4 中文不对应，验收不通过 | 不采用 |

---

## 四、风险评估

| 风险 | 等级 | 说明与对策 |
|---|---|---|
| 版本号替换误伤外链 | 中 | en/ 与配置中 `8.4.4-5` 出现 34+ 处，其中部分指向线上 8.4.4-5 站点（历史版本导航）。对策：Step 4 用「白名单 + 逐处确认」方式，仅替换指向本仓库的版本引用，nav 外链保留 |
| 内容差异修补遗漏 | 中 | 70+27 个文件有真实差异，个别文件差异隐蔽（如错误码文件无差异但其他大文件有）。对策：以分类脚本输出为准逐文件处理，每步用 diff 复查「en 译文 ↔ 8.4.4-4 zh」无未处理差异 |
| 修补时误删/误留 8.4.4-5 特有段落 | 中 | README、1-3-features、多 OS 安装等文件 8.4.4-5 新增了段落。对策：删除段落前先确认 8.4.4-4 zh 确无对应内容；check-translation.js 校验残留中文 |
| 侧边栏/导航条目错位 | 中 | sidebar-en.js 含 6 个 8.4.4-5 特有条目需删除，删除后数组结构/逗号易出错。对策：用 node 语法校验（`node -e "require(...)"`）或构建验证兜底 |
| 锚点失效 | 中 | 英文 H2/H3 标题沿用 8.4.4-5 译法（与中文标题对应），8.4.4-4 中文标题若不同需同步核对。对策：构建后链接检查 |
| 术语不一致 | 低 | 全部复用已定稿译文，天然一致；仅新译 1 个文件需遵循术语表 |
| 构建环境风险 | 低 | VuePress 1.9.10 构建环境已实测可用（8.4.4-5 使用同一环境） |

---

## 五、开发计划（分步骤）

> **全局规则**：
> - 唯一内容基准 = **本仓库（8.4.4-4）中文文件**；8.4.4-5/en 译文仅在「与 8.4.4-4 中文一致」的前提下复用；
> - 每步修补/新译后运行 `node scripts/check-translation.js <路径>` 确认残留中文为 0（代码块/URL 除外）；
> - 修补方向判断：`LC_ALL=C diff -w 8.4.4-5/zh 8.4.4-4/zh` 输出中，`<` 行 = 8.4.4-5 独有（en 需删除对应译文），`>` 行 = 8.4.4-4 独有（en 需补译）；
> - 本仓库无 package.json，构建命令：`/data/home/yejr/node_modules/.bin/vuepress build`。

---

### Step 1：移植 i18n 脚手架（config.js + configs/ + enhanceApp.js）
- **目标**：本仓库具备与 8.4.4-5 一致的双语站点骨架。
- **涉及文件**：复制 `.vuepress/config.js`、`.vuepress/configs/{sidebar-zh,sidebar-en,nav-zh,nav-en}.js`、`.vuepress/enhanceApp.js`；修改 `.vuepress/config.js`
- **关键改动**：
  - 复制上述 6 个文件（enhanceApp.js 含 i18n 语言切换按钮与 EN 配色文案，整体采用）；
  - config.js 适配：`base: '/docs/8.4.4-4/'`、`branch: 'greatsql-8.4.4-4'`、`docsBranch: 'greatsql-8.4.4-4'`；locales/themeConfig.locales 照搬；
  - 原 config.js 内联侧边栏内容由 configs/sidebar-zh.js 替代（8.4.4-5 已拆分，两仓库 sidebar 内容差异仅「6 个特有条目 + 外链版本号」，见 Step 2）。
- **验证方式**：`node -e "const c=require('./.vuepress/config.js'); console.log(c.base, Object.keys(c.themeConfig.locales))"` 输出 `/docs/8.4.4-4/` 与 `['/', '/en/']`。
- **预估复杂度**：低

### Step 2：侧边栏/导航适配（删除 8.4.4-5 特有条目 + 外链版本号）
- **目标**：sidebar/nav 与 8.4.4-4 内容对齐。
- **涉及文件**：`.vuepress/configs/sidebar-zh.js`、`sidebar-en.js`、`nav-zh.js`、`nav-en.js`
- **关键改动**：
  - sidebar-zh/sidebar-en 各删除 6 个条目：`/1-docs-intro/relnotes/changes-greatsql-8445`、`/5-enhance/5-1-highperf-vector-search`、`/5-enhance/5-1-highperf-binlog-flush-opt-large-trx`、`/5-enhance/5-1-highperf-parallel-replica`、`/5-enhance/5-1-highperf-execplan-baseline`、`/5-enhance/5-2-ha-repl-interface-cmd`；
  - sidebar 中 23 处外链 `http(s)://greatsql.cn/docs/8.4.4-5/` → `docs/8.4.4-4/`（pt-archiver 等锚点外链 + 5-3-easyuse 锚点外链）；
  - nav-zh/nav-en：版本切换下拉调整为「8.4.4-4 为当前版本（首项），8.4.4-5 移入历史版本」，nav-en 首项增加 `8.4.4-4 (English)` → `https://greatsql.cn/docs/8.4.4-4/en/`（待英文版发布后生效）；
  - gt-checksum 侧边栏条目（外链 gitee 手册）两个仓库一致，保留。
- **验证方式**：`node -e "require('./.vuepress/configs/sidebar-zh.js'); require('./.vuepress/configs/sidebar-en.js'); require('./.vuepress/configs/nav-zh.js'); require('./.vuepress/configs/nav-en.js')"` 无语法错误；grep 确认 6 个特有路径已不存在。
- **预估复杂度**：低

### Step 3：移植工具脚本与文档
- **目标**：校验/生成工具与术语基准就绪。
- **涉及文件**：复制 `scripts/` 全部 5 个脚本 + `docs/translation-glossary.md`、`docs/i18n-feasibility.md`、`docs/translation-sync-process.md`；新建 `scripts/classify-zh-diffs.js`（本计划新增）
- **关键改动**：
  - 复制 5 个脚本（均无版本硬编码，已核实）；gen-en-placeholders.js 本计划**不再需要生成占位页**（en 直接复制），保留备用；
  - 复制 3 个 docs（i18n-feasibility.md 末尾追加本仓库移植记录，见 Step 14）；
  - 新建 classify-zh-diffs.js：对比 `/nvme/gitee/8.4.4-4` 与 `~/gitee/8.4.4-5` 中文文件（`diff -w`），输出三类清单（copy-as-is / patch / new-translate）到 `docs/zh-diff-classification.md`，作为后续步骤驱动。
- **验证方式**：`node scripts/classify-zh-diffs.js` 输出 316 patch/copy 分类与 1 个 new-translate，数量与本文档调研一致（11 相同 + 119 排版 + 100 小 + 70 中 + 27 大 + 1 新译）。
- **预估复杂度**：低

### Step 4：en/ 全量复制（327 个文件）
- **目标**：en/ 目录与中文章节镜像对齐。
- **涉及文件**：`en/` 下 14 章节全部文件（327 md + 图片等资源）
- **关键改动**：
  - 遍历 8.4.4-4 中文章节文件，从 `~/gitee/8.4.4-5/en/<同名路径>` 复制对应英文文件（目录结构镜像）；
  - 跳过 8.4.4-5/en 独有的 6 个文件；`en/README.md` 一并复制（Step 6 再适配）；
  - 复制 en 目录引用的图片资源（如各章节图片，8.4.4-5/en 内图片与中文共用，确认路径一致即可）。
- **验证方式**：`find en -name "*.md" | wc -l` = 327；与 8.4.4-4 中文文件路径逐一比对无缺失、无多余。
- **预估复杂度**：低

### Step 5：全局版本号适配（en/ 34 个文件 + 配置）
- **目标**：英文内容版本引用与 8.4.4-4 一致。
- **涉及文件**：en/ 下含 `8.4.4-5`/`8445` 的 33 个 md（4-install-guide 14、7-migrate 4、1-docs-intro 4、3-quick-start 4、5-enhance 2、6-oper-guide 2、12-dev-guide 1、2-about 1、8-mgr 1）
- **关键改动**：
  - 逐个文件确认后替换：`GreatSQL-8.4.4-5`→`GreatSQL-8.4.4-4`（包名/下载链接）、`8.4.4-5`→`8.4.4-4`（版本说明文字）、`8445`→`8444`（relnotes/文件名引用，若有）；
  - 注意：指向线上历史版本的链接（nav 中 `https://greatsql.cn/docs/8.4.4-5/`）**不替换**；
  - 与 8.4.4-4 中文文件比对，确认中文侧版本号即 8.4.4-4（中文侧已如此，en 对齐即可）。
- **验证方式**：`grep -rl "8\.4\.4-5\|8445" en/` 输出为空（排除 nav 外链场景）；抽查 3 个文件版本号与中文一致。
- **预估复杂度**：低

### Step 6：en/README.md 适配
- **目标**：英文首页与 8.4.4-4 对齐。
- **涉及文件**：`en/README.md`
- **关键改动**：
  - 版本号：8.4.4-5 → 8.4.4-4；「Last updated」更新为当日；下载链接 `releases/GreatSQL-8.4.4-4`；
  - 章节状态表调整：1-docs-intro 16/16 → **15/15**、5-enhance 141/141 → **136/136**、6-oper-guide 36/36 → **37/37**、Total 332/332 → **327/327**；
  - 若 8.4.4-5 的 en/README.md 存在指向 8.4.4-5 特有文件/特性的描述（如新增特性列表），对照 8.4.4-4 中文 README 删改。
- **验证方式**：章节计数与 8.4.4-4 各章节文件数一致（1-docs-intro 15、5-enhance 136、6-oper-guide 37，合计 327）；`check-translation.js en/README.md` 残留中文 0。
- **预估复杂度**：低

### Step 7：小差异文件核验（119 排版 + 100 个 1~10 行真实差异）
- **目标**：确认这部分 en 译文与 8.4.4-4 中文一致，无需改动或仅微调。
- **涉及文件**：classify-zh-diffs.js 输出的 copy-as-is 清单（约 219 个文件）
- **关键改动**：
  - 119 个仅排版差异文件：en 直接可用，零改动（8.4.4-5 中文格式化不影响英文）；
  - 100 个 1~10 行真实差异：多数为版本号/错别字修复（8.4.4-5 修复了 8.4.4-4 的错别字，如 `group_replicaiton`→`group_replication`、`登入`→`登录`），英文译文不受影响，抽查确认即可；个别含实质内容差异的（由分类脚本标注）按 diff 微调 en。
- **验证方式**：抽查 10 个代表性文件（含 relnotes、2-about、sql-compat）对照 zh 8.4.4-4 与 en 译文，确认无内容缺失/多余；`check-translation.js` 全站扫描该批文件残留中文 0。
- **预估复杂度**：低

### Step 8：中等差异修补第一批：6-oper-guide + 2-about-greatsql + 8-mgr + 11-faq + 13-reference + 9-ha（约 32 个文件）
- **目标**：对齐 11~50 行真实差异文件的英文译文。
- **涉及文件**：6-oper-guide 15 个、2-about-greatsql 5 个、8-mgr 4 个、11-faq 4 个、13-reference 2 个、9-ha 2 个（以分类脚本清单为准）
- **关键改动**：
  - 逐文件运行 `LC_ALL=C diff -w 8.4.4-5/zh 8.4.4-4/zh`，按「`>` 行补译、`<` 行删除、改动行改写」原则修补对应 en 段落；
  - 典型内容：6-oper-guide 的 statistics 系列（6-1-1~6-1-5）与健康检查、8-mgr 的部署/数据安全/性能调优、2-about 日志体系小节。
- **验证方式**：每文件修补后 `diff -w <en 译文> <8.4.4-4 zh>` 无对应残留（结构性检查：en 段落数≈zh 段落数）；`check-translation.js` 该批残留中文 0。
- **预估复杂度**：中

### Step 9：中等差异修补第二批：5-enhance + 1-docs-intro + 4-install-guide + 12-dev-guide + 10-optimize + 3-quick-start + 7-migrate（约 38 个文件）
- **目标**：同上，覆盖剩余章节。
- **涉及文件**：5-enhance 14 个、1-docs-intro 8 个、4-install-guide 4 个、12-dev-guide 4 个、10-optimize 4 个、3-quick-start 3 个、7-migrate 1 个（以分类脚本清单为准）
- **关键改动**：
  - 同 Step 8 的 diff 驱动修补法；
  - 典型内容：5-enhance 的 sql-compat 函数/语法/存储过程模板文件（少量措辞差异）、1-docs-intro 的 relnotes 各版本、12-dev-guide 的 trx-control 等。
- **验证方式**：同 Step 8；抽查 sql-compat 模板文件标题与 sidebar-en.js 一致。
- **预估复杂度**：中

### Step 10：大差异修补第一批：4-install-guide 多 OS 安装（10 个）+ 3-quick-start（2 个）
- **目标**：处理 100+ 行差异的安装/快速上手类文档。
- **涉及文件**：en/4-install-guide/2-install-with-rpm.md、3-1-centos-install.md、3-2-ubuntu-install.md、3-3-openeuler-install.md、3-4-uos-install.md、3-5-anolis-install.md、3-6-kylin-install.md、3-7-arch-install.md、4-install-with-docker.md、6-install-with-source-code.md；en/3-quick-start/3-1-quick-start-with-rpm.md、3-2-quick-start-with-tarball.md
- **关键改动**：
  - 先诊断差异性质：多为 8.4.4-5 对安装命令/包名/章节结构做了修订（含中英文空格格式化叠加），逐文件 diff 修补；
  - 命令代码块内版本串（如 `greatsql-client-8.4.4-5.1.el8`）随 Step 5 一并替换为 8.4.4-4 对应串（注意 rpm 版本号格式 8.4.4-4 → 8.4.4-4.1 视中文侧而定）；
  - 若差异为 8.4.4-5 新增段落（如新增验证步骤），确认 8.4.4-4 无对应内容后删除对应 en 段落。
- **验证方式**：每文件修补后与 8.4.4-4 中文段落结构对比（标题序列一致）；`check-translation.js` 该批残留中文 0；抽查 2 个文件命令内版本号与中文一致。
- **预估复杂度**：高

### Step 11：大差异修补第二批：5-enhance（4 个）+ 1-docs-intro（2 个）+ 7-migrate（3 个）
- **目标**：处理引擎/安全/特性/迁移类大差异文档。
- **涉及文件**：en/5-enhance/5-1-highperf-rapid-engine.md、5-1-highperf-turbo-engine.md、5-2-ha-mgr-vip.md、5-4-security-encrypt-with-gmssl.md；en/1-docs-intro/1-3-greatsql-features.md、relnotes/changes-greatsql-8-0-32-24-20230605.md；en/7-migrate-and-upgrade/1-upgrade-to-greatsql8.md、2-migrate-from-mysql-togreatsql.md、3-migrate-from-percona-to-greatsql.md
- **关键改动**：
  - 1-3-greatsql-features.md：8.4.4-4 中文含「GreatSQL VS MySQL」对比表格段落（8.4.4-5 已将其移至 8445 relnotes），**需补译该表格**（见 Step 13 新译清单）；其余差异按 diff 修补；
  - rapid-engine/turbo-engine：差异多为 8.4.4-5 修订与格式化，按 diff 逐段对齐；
  - gmssl/vip/迁移类：同 diff 驱动修补。
- **验证方式**：同 Step 10；1-3-greatsql-features.md 的 en 表格与 8.4.4-4 中文表格列数一致。
- **预估复杂度**：高

### Step 12：大差异修补第三批：其余大文件（8 个）
- **目标**：处理剩余大差异文件与根 README。
- **涉及文件**：en/11-faq/5-faq-others.md、en/10-optimize/2-5-rowlock-diag.md、en/6-oper-guide/10-1-pt-practical.md、en/8-mgr/2-mgr-install-deploy.md、en/12-dev-guide/12-4-4-functions.md、12-6-3-trx-mvcc-and-locking.md、en/9-ha/5-ha-single-vlan.md；根 `README.md`（中文根页）
- **关键改动**：
  - 各文件按 diff 驱动修补（同 Step 8 原则）；
  - 根 README.md：8.4.4-4 中文版无 8.4.4-5 新增的 4 个特性段落（repl-interface-cmd、vector-search、binlog-flush、parallel-replica、execplan-baseline 相关链接），删除这些段落；保留 8.4.4-4 已有内容；版本徽标/下载链接已是 8.4.4-4 无需改（中文侧）。
- **验证方式**：同 Step 10；README.md 与 8.4.4-4 中文内容对齐。
- **预估复杂度**：高

### Step 13：新译 6-oper-guide/11-gt-checksum.md（+ 1-3-greatsql-features.md 特有表格）
- **目标**：补齐 8.4.4-4 独有内容的英文译文。
- **涉及文件**：新建 `en/6-oper-guide/11-gt-checksum.md`；修补 `en/1-docs-intro/1-3-greatsql-features.md` 的 "GreatSQL VS MySQL" 表格段落
- **关键改动**：
  - 11-gt-checksum.md（173 行）：全文翻译，主题为 gt-checksum 静态数据校验修复工具（特性、5 大适用场景、下载、快速运行、Oracle 驱动配置、校验/修复用法等）；工具名/命令/URL 不译；文中指向 `./10-6-pt-replication.md#pt-table-checksum` 等内部链接路径保持与中文一致；术语遵循 glossary（checksum、replication、MGR 等）；
  - 1-3-greatsql-features.md：将 8.4.4-4 中文 "GreatSQL VS MySQL" 特性对比表格（列：主要特性/GreatSQL 8.4.4-4/MySQL 8.4.4）译为英文表格，表格列数不变，`:heavy_check_mark:` 等保留。
- **验证方式**：`check-translation.js en/6-oper-guide/11-gt-checksum.md` 残留中文 0（URL/命令除外）；en 表格列数与中文一致；构建后 gt-checksum 页可达（被 13-reference/1-index.md 与 10-6-pt-replication.md 链接）。
- **预估复杂度**：中

### Step 14：构建验证 + 全站检查
- **目标**：英文站整体构建通过，无断链/残留中文。
- **涉及文件**：全站（无需改文件，仅验证；如有问题修复对应文件）
- **关键改动**：
  - `/data/home/yejr/node_modules/.bin/vuepress build` 构建成功；
  - `node scripts/check-translation.js` 全站扫描：en/ 正文残留中文为 0（代码块/URL/截图 alt 除外）；
  - 链接检查：en 页内相对链接路径均存在（与中文镜像一致）；英文 H2/H3 锚点与站内 `#` 链接目标一致；
  - en/README.md 状态表为全部翻译完成（15/15、136/136、37/37、Total 327/327）。
- **验证方式**：构建日志无 error；`find .vuepress/dist -path "*en*" -name "*.html" | wc -l` ≥ 327；残留中文统计符合预期。
- **预估复杂度**：中

### Step 15：审校 + 增量同步机制 + 文档更新 ✅（2026-11-23 完成）
- **目标**：术语一致性终检；建立 8.4.4-4 中文修订 → 增量翻译流程。
- **涉及文件**：docs/translation-glossary.md（审校补充）、docs/translation-sync-process.md（沿用 8.4.4-5 版本，路径基准改为本仓库）、docs/i18n-feasibility.md（追加本仓库移植记录）、docs/en-translation-research-and-plan-cc-20261123.md（本计划，标注完成状态）
- **关键改动**：
  - 抽查高术语密度文件（8-mgr、12-6-3、5-1-highperf-rapid-engine、sql-compat）与 glossary 一致；
  - 增量同步流程：中文 diff → classify-zh-diffs.js 定位变更文件 → 对变更段落增量翻译 → check-translation.js + build 验证（沿用 8.4.4-5 流程文档）；
  - i18n-feasibility.md 追加「8.4.4-4 英文版上线记录」。
- **验证方式**：审校记录输出；流程文档评审。
- **预估复杂度**：中
- **实际执行结果**：
  - 审校：8-mgr（9 文件）、12-6-3、rapid-engine、sql-compat（102 文件）术语抽查全部与 glossary 一致；en/ 328 文件残留中文 0；各章节 zh/en 文件数完全镜像（327）；master/slave 仅 1 处（11-faq，中文原文对照术语的忠实翻译，保留）；未引入新术语，glossary 无需增补。审校记录已写入 translation-sync-process.md §6.2 与 glossary 头部；
  - sync-process.md：适用仓库改为 8.4.4-4，新增 §①a classify-zh-diffs.js 复核步骤，文件数基准 332→327、构建页数 333→327，追加 §6.2 审校记录；
  - i18n-feasibility.md：追加 §7「8.4.4-4 英文版上线记录」（已交付清单 + 327 章节状态表 + 验证结果 + 遗留说明）；
  - glossary.md：头部追加 8.4.4-4 审校补充说明；
  - 本计划文档：头部标注完成状态，Step 15 标注 ✅。

---

## 六、测试计划

### 自动化校验（每步执行）
- `node scripts/check-translation.js <path>`：该批文件正文残留中文字符为 0（代码块/URL 除外）；
- 修补文件结构校验：en 译文标题序列与 8.4.4-4 中文对应（标题数量一致、H1 与 sidebar-en.js 一致）；
- 表格校验：修补/新译文件的表格列数与中文原文件一致。

### 构建回归（Step 1 脚手架就绪后 + Step 14 各一次）
- `/data/home/yejr/node_modules/.bin/vuepress build`；
- 检查：英文站页面数 ≥ 327、无构建 error、`/en/` 下无 404 内部链接。

### 手工验证场景
- 语言切换器在中英页面间跳转，同路径另一语言页可达（8.4.4-4 中文 ↔ en 同路径）；
- 抽查英文页：代码块渲染正常（SQL/bash 高亮）、图片正常显示（沿用中文截图）、表格对齐；
- 抽查锚点：页内 `#` 链接跳转正确；
- 全站搜索（fulltext-search）能搜到英文关键词。

---

## 七、文档更新计划

| 文档 | 更新时机 | 内容 |
|---|---|---|
| docs/en-translation-research-and-plan-cc-20261123.md | 本计划 | 完成状态标注（Step 15） |
| docs/i18n-feasibility.md | Step 15 | 追加 8.4.4-4 英文版移植记录 |
| docs/translation-glossary.md | 沿用 + Step 15 | 8.4.4-5 术语表直接沿用，审校补充 |
| docs/translation-sync-process.md | 沿用 | 路径基准改为本仓库 |
| docs/zh-diff-classification.md | Step 3 生成 | 差异分类清单（脚本输出） |
| en/README.md | Step 6、Step 14 | 章节状态表对齐 8.4.4-4 |

---

## 八、注意事项与约束

- **复用优先**：凡 8.4.4-5/en 译文与 8.4.4-4 中文一致的文件，**直接复制，禁止重新翻译**（节省资源、保证术语一致）；
- **内容基准**：8.4.4-4 中文文件是唯一内容基准，8.4.4-5/en 仅为译文来源；8.4.4-5 特有内容（6 个文件 + 各文件新增段落）一律不进入本仓库英文版；
- **版本号替换边界**：仅替换指向本仓库的版本引用；`https://greatsql.cn/docs/8.4.4-5/` 等线上历史版本外链保留；
- **构建约束**：本仓库无 package.json，构建环境 `/data/home/yejr/node_modules/.bin/vuepress`；构建仅限本地验证，不涉及线上发布（发布由用户手动执行）；
- **截图不重制**：英文页沿用中文截图（与 8.4.4-5 一致）；
- **每步规模控制**：单步文件数 1~38 个，按章节/差异类型分批，避免单次任务承载过多导致质量下降；
- **diff 驱动**：所有修补步骤以 `LC_ALL=C diff -w`（中文对比）为输入驱动，以「en 译文 ↔ 8.4.4-4 中文」复查为验收，避免凭印象修补。
