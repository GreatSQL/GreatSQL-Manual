# GreatSQL 8.0.32-27 全量英文文档翻译 需求调研与开发计划

> 调研日期：2026-11-19
> 参考前置：`/home/yejr/gitee/8.4.4-5` 仓库已完成的中英双语化（Phase 1 i18n 脚手架 + Phase 2 全量翻译 + Phase 3 验证），规划文档见 `8.4.4-5/docs/en-translation-research-and-plan-cc-20261119.md`。
> 核心策略：**本仓库与 8.4.4-5 共享 324/325 个文档文件，绝大多数英文译文可直接从 `8.4.4-5/en/` 复制，仅需按两版本中文内容差异做局部微调**；i18n 脚手架整体复用 8.4.4-5 已验证的方案。

---

## 一、需求背景与目标

### 需求来源

本站（GreatSQL 8.0.32-27 用户手册，VuePress 站点）目前为**纯中文单语站点**：无 `en/` 目录、无 i18n 配置、无语言切换能力（与 8.4.4-5 在 Phase 1 之前的形态一致）。本次目标：参考 8.4.4-5 已完成的「Phase 1 脚手架 + Phase 2 全量翻译 + Phase 3 验证」三段式做法，将本仓库 324 个中文文档全部翻译为英文，正式上线英文版手册。

### 功能目标与验收标准

- 全部 14 个章节、324 个中文 md 文件均有对应英文译文，覆盖 `en/` 目录，路径与中文镜像一致；
- **翻译用词贴近 MySQL/GreatSQL 专业术语**，以 MySQL 官方文档用语为基准（与 8.4.4-5 的 `docs/translation-glossary.md` 术语表保持一致）；
- 代码块、行内代码、命令、文件名、URL、图片路径一律不译；内部相对链接路径与中文一致，只译链接文字；
- 英文站点构建通过，无内部断链/失效锚点，表格、代码块渲染正常；
- `en/README.md` 章节状态表与翻译进度保持同步；
- i18n 脚手架（中英切换、英文侧边栏/导航）与 8.4.4-5 站点交互一致。

### Out of scope（本次不包含）

- **189 张中文截图**：英文页面沿用中文截图，不重制（与 8.4.4-5 结论一致）；
- 8.4.4-5 独有、本版本不存在的 9 个文档文件（见 §二.2）及其译文；
- 搜索引擎收录/SEO 优化（noindex 等）；
- 其他版本的英文翻译：仅翻译当前 8.0.32-27 分支。

---

## 二、现有代码调研

### 2.1 仓库结构对比（8.0.32-27 现状 vs 8.4.4-5 已完成态）

| 项目 | 8.4.4-5（参考，已完成） | 8.0.32-27（本仓库，待做） |
|---|---|---|
| 中文章节目录 | 14 章 / 332 文件 | 14 章 / 324 文件 |
| `en/` 英文目录 | 333 文件全翻译，残留中文 0 | **不存在** |
| `.vuepress/config.js` | ~200 行，含 `locales` + `themeConfig.locales`，sidebar/nav 外置 | **1026 行，sidebar/nav 内联，无 i18n** |
| `.vuepress/configs/` | sidebar-zh/en.js、nav-zh/en.js | **不存在** |
| `.vuepress/enhanceApp.js` | 含语言切换按钮 + 英文模式文案 | 无切换能力 |
| `.vuepress/styles/index.styl` | 含 `.lang-switch-btn` 样式 | 缺该样式 |
| `scripts/` | check-translation.js、gen-en-placeholders.js、gen-error-code-en.js、translate-sidebar-titles.js、zh-en-titles.js | **不存在** |
| `docs/` | i18n-feasibility.md、translation-glossary.md、translation-sync-process.md | **不存在** |
| 构建环境 | `/data/home/yejr/node_modules/.bin/vuepress` 已验证 | 同路径可用（`.vuepress/dist` 已存在说明本地构建可行） |

### 2.2 文件级差异盘点（本次调研实测）

对两份中文文档全集做逐文件比对（`diff -w` 忽略空白）：

| 类别 | 文件数 | 说明 |
|---|---|---|
| 完全一致 | 9 | 译文可直接复制 |
| 仅空白/格式差异 | 81 | 空格、标点微调（如「Rapid引擎」vs「Rapid 引擎」），**译文无需改动** |
| 真实内容差异 | 243 | 需按差异逐段微调译文（共约 7,245 行变更） |
| 仅 8.0.32-27 独有 | 1 | `6-oper-guide/11-gt-checksum.md`（gt-checksum 工具介绍，173 行）→ **全新翻译** |
| 仅 8.4.4-5 独有 | 9 | 8444/8445 relnotes、vector-search、execplan-baseline、parallel-replica、binlog-flush-opt、repl-interface-cmd、tpcc-wh1000-report、live-demo → **本次跳过** |

324 个公共文件中，每个都已在 `8.4.4-5/en/` 有对应英文译文（100% 覆盖，残留中文为 0）。

### 2.3 真实内容差异的类型（决定微调方式）

抽样 243 个差异文件后归纳，差异主要分四类：

1. **版本号/链接差异**：`8.4.4-5` → `8.0.32-27`、下载链接、RPM 包名、`my.cnf` 模板链接等（集中在 1-docs-intro、4-install-guide、README）；
2. **8.4 新增特性段落**：8.4.4-5 中新增的 vector search、parallel replica、execplan baseline、binlog 独立落盘、复制语法兼容等段落，8.0.32-27 无对应内容 → **译文需删除对应英文段落**；
3. **8.0.32-27 独有内容**：如 `1-3-greatsql-features.md` 的「GreatSQL VS MySQL」对比大表（110 行）、`6-oper-guide/11-gt-checksum.md` 整篇 → **译文需新增（翻译）**；
4. **术语/文案修订**：如 12-8-1 错误码文件把 SLAVE/MASTER 术语改为 REPLICA/SOURCE（中文描述列），以及各文件零散 2~10 行的措辞修订 → **译文局部改写**。

### 2.4 关键发现

1. **i18n 脚手架可整体复用**：`configs/`（sidebar-zh/en.js、nav-zh/en.js）、`enhanceApp.js` 语言切换逻辑、`styles/index.styl` 的 `.lang-switch-btn` 均可从 8.4.4-5 移植，仅需调整：base 路径 `/docs/8.0.32-27/`、侧边栏结构（用本仓库内联 sidebar 抽取，含 `11-gt-checksum`、无 8.4 新增文件）、导航版本列表（当前版本 8.0.32-27）。
2. **标题映射表基本可复用**：8.4.4-5 的 `scripts/zh-en-titles.js`（179 条）覆盖本仓库侧边栏 172 个标题中的 147 个；仅 3 个中文标题需新增译法（`为什么升级到GreatSQL 8.0`→`Why Upgrade to GreatSQL 8.0`、`最后登录信息`→`Last Login Information`、`GreatSQL用户手册`→`GreatSQL User Manual`），其余为纯 ASCII 标题（版本号、pt-* 工具名）无需翻译。
3. **`12-8-1-error-code-reference.md`（11K 行）**：8.0.32-27 有 1,483 个错误码符号，8.4.4-5 英文版 1,457 个 → 需**补 26 个缺失错误码条目**（英文描述按 MySQL 官方英文错误信息翻译），其余条目英文描述（官方英文）两版本通用，可直接复制；中文列 SLAVE→REPLICA 术语修订不影响英文描述。
4. **链接断裂风险集中在 4 个文件**：8.4.4-5 英文译文中有链接指向本仓库不存在的 9 个文件（`1-3-greatsql-features.md`、`1-2-release-history.md`、`7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql.md`、`10-optimize/3-performance-benchmark.md`），微调时需同步修正/删除这些链接。
5. **en/README.md 需按本版本重写**：版本号 8.0.32-27、章节文件数（1-docs-intro 14、5-enhance 136、6-oper-guide 37、10-optimize 16、14-greatsql-demo 2，合计 324）、特性描述与 8.0.32-27 对齐（无 8.4 新特性）。
6. **`5-enhance/sql-compat/`（101 文件）差异极小**：大部分文件 `diff -w` 差异为 0~6 行（个别 typo 修正），译文基本可原样复制，仅少量局部改写。
7. **7-migrate-and-upgrade 与 10-optimize benchmark 差异较大**：`1-upgrade-to-greatsql8.md`（390 行）、`3-5-tpcc-report`（510 行）、`3-3-tpch-report`（370 行）等为版本数据差异（8.0.32-27 基于 8.0.32-26/27 压测、8.4.4-5 基于 8.4 压测），需整体替换对应章节译文。

### 依赖关系

- 每个英文译文文件只依赖：8.4.4-5 英文译文（基座）+ 两版本中文差异（微调源）+ 术语表（译法）。
- 文件之间无编译期依赖，翻译顺序自由；但**脚手架（sidebar-en.js 标题、config locales）必须先就绪**，H1 标题须与 sidebar-en.js 一致。
- 微调批次之间无依赖，可并行；但术语表先定稿可避免同一术语在不同批次译法不一致。

---

## 三、技术方案设计

### 整体方案

**「复制 8.4.4-5 英文译文 + 按版本中文差异微调」**，配合 i18n 脚手架整体移植。分三条主线：

1. **脚手架线（Phase A）**：把 8.4.4-5 的 i18n 配置结构移植到本仓库（sidebar/nav 外置、locales、语言切换按钮），并用本仓库的内联 sidebar/nav 生成英文版；
2. **内容线（Phase B）**：`en/` 目录镜像 324 个文件 —— 复制 323 个公共文件译文 → 逐文件对照中文差异微调 → 全新翻译 `11-gt-checksum.md` → 重写 `en/README.md`；
3. **验证线（Phase C）**：复用/移植 `check-translation.js` 做残留中文扫描，`vuepress build` 构建验证，链接/锚点检查。

### 核心机制

1. **术语表（复用 + 增补）**：复制 8.4.4-5 的 `docs/translation-glossary.md` 与 `scripts/zh-en-titles.js`，增补本版本特有条目（gt-checksum 相关术语等）；
2. **翻译保护规则**（与 8.4.4-5 完全一致）：
   - 代码块（围栏标记内容）、行内代码、命令、文件名、URL、图片路径一律不译；代码块内注释可译英文、测试数据/字符串值原样保留；图片 `![alt](path)` path 不译、alt 可译；
   - H1 标题译为英文（与 sidebar-en.js 对应条目逐字一致）；内部相对链接路径不变、仅译链接文字；表格列数不变；
   - 微调时删除 8.4 独有内容对应的英文段落、补译 8.0.32-27 独有内容，保证 en 与 zh 8.0.32-27 **内容对等**；
3. **版本差异微调工作流**（每个文件）：`/usr/bin/diff -w <zh-8.0.32-27> <zh-8.4.4-5>` 定位差异 hunk → 在对应英文译文中定位 → 删除/改写/补译差异段落 → 保持链接与锚点有效；
4. **错误码文件（12-8-1）**：复制英文版 + 用脚本/手工补 26 个缺失错误码条目（英文描述以 MySQL 官方英文为准）；
5. **残留中文检测**：移植 `check-translation.js`，每批次验收。

### 方案对比

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| 复制 8.4.4-5 译文 + 差异微调（本次采用） | 工作量最小（差异仅 ~7,245 行）、术语一致性好、8.4.4-5 已验证质量 | 依赖 8.4.4-5 仓库可读 | ✅ 采用 |
| 从零全量翻译 324 文件 | 无 | 重复劳动、术语不一致风险高 | 不采用 |
| 一次性脚本机翻 | 快 | 质量不可控 | 不采用 |

---

## 四、风险评估

| 风险 | 等级 | 说明与对策 |
|---|---|---|
| 复制译文与 8.0.32-27 内容不对等 | 高 | 243 个文件有真实差异，若漏改段落会出现英文多/少内容。对策：逐文件 `diff -w` 定位差异并逐一处理；check-translation.js 校验残留中文；构建后链接检查 |
| 8.4 独有内容对应的英文段落残留 | 中 | 复制过来的译文含 8.4 新增特性段落（vector search 等），本版本无对应中文。对策：微调时按 zh diff 删除，构建后全站链接检查（无断链）兜底 |
| 版本号/链接未替换 | 中 | 38 个英文文件含 `8.4.4-5` 字样。对策：微调批次中统一处理版本号；`en/README.md` 重写 |
| 侧边栏标题不一致 | 中 | H1 标题必须与 sidebar-en.js 一致。对策：H1 由 sidebar-en.js 生成流程保证（标题映射表 + translate-sidebar-titles.js） |
| 锚点失效 | 中 | 英文 H2/H3 标题翻译后站内 `#锚点` 链接可能失效。对策：链接文字可译但目标标题须同步；构建后检查 |
| 错误码文件缺失条目 | 中 | 8.0.32-27 比 8.4.4-5 多 26 个错误码。对策：专门步骤补齐并翻译 |
| 中文修订漂移 | 高 | 与 8.4.4-5 相同：收尾步骤建立增量同步流程 |
| 189 张中文截图 | 高 | 沿用中文截图（Out of scope） |

---

## 五、开发计划（分步骤）

> **全局翻译规则**（每步适用，同 8.4.4-5）：只译正文、标题、表格单元格、列表项、图片 alt；代码块/行内代码/命令/文件名/URL/图片路径不译；相对链接路径不变；H1 与 sidebar-en.js 标题一致；用词遵循 docs/translation-glossary.md。
> **每步通用验证**：`node scripts/check-translation.js <章节路径>` 确认本批文件残留中文为 0；抽查 2~3 个文件的代码块/链接未被误译；抽查版本号替换正确。
> **每步通用工作流**：① 复制 8.4.4-5 对应英文译文到 en/ ② `/usr/bin/diff -w` 对比两版本中文定位差异 ③ 微调英文译文（删除 8.4 独有段落 / 补译 8.0.32-27 独有段落 / 替换版本号与链接）④ 校验。

---

### Phase A：i18n 脚手架（移植 8.4.4-5 已验证方案）

#### Step 1：术语表 + 标题映射表定稿
- **目标**：产出 `docs/translation-glossary.md`（复制 8.4.4-5 版本并增补本版本特有术语）与 `scripts/zh-en-titles.js`（复制 8.4.4-5 179 条映射 + 新增 3 条：`为什么升级到GreatSQL 8.0`→`Why Upgrade to GreatSQL 8.0`、`最后登录信息`→`Last Login Information`、`GreatSQL用户手册`→`GreatSQL User Manual`）。
- **涉及文件**：新建 docs/translation-glossary.md、scripts/zh-en-titles.js（均复制 8.4.4-5 后微调）
- **验证方式**：文档评审（确认 20 个高频术语与 MySQL 官方用语一致）。
- **预估复杂度**：低

#### Step 2：i18n 脚手架搭建
- **目标**：仓库具备中英双语能力（配置、侧边栏、导航、切换按钮）。
- **涉及文件**：
  - 新建 `.vuepress/configs/sidebar-zh.js`：从本仓库 config.js 内联 sidebar 抽取（结构/路径保持不变，含 `11-gt-checksum`，外链版本号改为 8.0.32-27）；
  - 新建 `scripts/translate-sidebar-titles.js`（复制 8.4.4-5）：由 sidebar-zh.js + zh-en-titles.js 生成 `.vuepress/configs/sidebar-en.js`（路径自动加 `/en/` 前缀）；
  - 新建 `.vuepress/configs/nav-zh.js`：抽取本仓库内联 nav；新建 `.vuepress/configs/nav-en.js`：参照 8.4.4-5 英文导航，版本列表含 `8.0.32-27 (English)` 项，其余历史版本指向中文页；
  - 修改 `.vuepress/config.js`：加 `locales`（zh + en 元信息）、`themeConfig.locales`（label/selectText/editLinkText/nav/sidebar require），**base 保持 `/docs/8.0.32-27/`**，删除内联 sidebar/nav；
  - 修改 `.vuepress/enhanceApp.js`：移植语言切换按钮逻辑（参照 8.4.4-5，含 MODE_LABEL_EN 英文模式文案）；修改 `.vuepress/styles/index.styl`：追加 `.lang-switch-btn` 样式。
- **验证方式**：`vuepress build` 成功、中文站行为与现状一致、`/en/` 路由可访问（空侧边栏或无页面时至少不报错）；`node scripts/translate-sidebar-titles.js` 幂等、无未翻译标题告警。
- **预估复杂度**：中

### Phase B：内容翻译（复制 + 版本差异微调）

#### Step 3：镜像复制 en/ 目录
- **目标**：en/ 与 zh/ 完全镜像（324 文件对齐）。
- **涉及文件**：en/ 下 323 个公共文件（直接复制 8.4.4-5/en 译文）+ en/README.md 初稿（版本号、章节数改为 8.0.32-27）+ `en/6-oper-guide/11-gt-checksum.md` 占位（后续翻译）。
- **关键改动**：复制后先做一轮「版本号/链接替换」预处理（`8.4.4-5`→`8.0.32-27`、`greatsql.cn/docs/8.4.4-5`→`docs/8.0.32-27`），再进入逐章微调。
- **验证方式**：`find en -name '*.md' | wc -l` = 324；`node scripts/check-translation.js` 全站扫描（此时残留中文主要为 8.4 独有段落的误复制，应在后续步骤消除）。
- **预估复杂度**：低

#### Step 4：试译批次 9-ha + 14-greatsql-demo + 11-faq（14 文件）
- **目标**：最小章节先行，跑通「复制 + diff -w + 微调 + 校验」模式。
- **涉及文件**：en/9-ha/*（6 个，5-ha-single-vlan 差异 28 行）、en/14-greatsql-demo/*（2 个）、en/11-faq/*（6 个，5-faq-others 差异 90 行）
- **关键改动**：全文微调；14-greatsql-demo 为 iframe 演示页，外链不译。
- **验证方式**：check-translation.js 过滤三章节残留中文为 0。
- **预估复杂度**：低

#### Step 5：1-docs-intro（14 文件）
- **目标**：文档介绍（用户须知/版本历史/特性/已知问题/术语表/8 个 relnotes）。
- **涉及文件**：en/1-docs-intro/1-1-notes-to-users.md（11 行差异）、1-2-release-history.md（**删除 8.4 段 + 修复 8444/8445 链接**）、1-3-greatsql-features.md（**补译「GreatSQL VS MySQL」对比大表 110 行 + 修复 8445 链接**）、1-4-issues-known.md、1-5-glossary.md（22 行差异）、1-docs-intro.md 及 relnotes/*（8 个，差异 2~46 行，主要是版本号/格式）
- **关键改动**：1-3 的大表是本批次重点（表结构保持、指标术语与 MySQL 官方一致）；relnotes 版本号替换。
- **验证方式**：check-translation.js 过滤该批残留中文为 0；抽查 1-3 表格列数一致。
- **预估复杂度**：中

#### Step 6：2-about-greatsql（14 文件）
- **目标**：产品介绍 + 日志体系 + 限制 + 关键字。
- **涉及文件**：en/2-about-greatsql/*（14 个；7-greatsql-keywords 差异 71 行为本批重点，其余日志类 2~18 行）
- **关键改动**：日志体系为 MySQL 术语高发区，与官方一致；7-keywords 检查关键字列表版本差异。
- **验证方式**：check-translation.js 过滤该章节残留中文为 0。
- **预估复杂度**：低

#### Step 7：3-quick-start（6 文件）
- **目标**：快速上手（RPM/TAR/Docker/cnf/读写分离）。
- **涉及文件**：en/3-quick-start/*（6 个；3-2-tarball 差异 81 行、3-1-rpm 72 行为重点，主要是版本号/命令差异）
- **关键改动**：命令代码块不译；版本号、包名替换为 8.0.32-27。
- **验证方式**：check-translation.js 过滤该章节残留中文为 0。
- **预估复杂度**：低

#### Step 8：7-migrate-and-upgrade（5 文件）
- **目标**：迁移升级（本批差异较大，为「从 8.0 升级到 8.4」文案需回退为 8.0.32-27 语境）。
- **涉及文件**：en/7-migrate-and-upgrade/0-migrate-and-upgrade.md、1-upgrade-to-greatsql8.md（**差异 390 行**，删除 8.4 升级段落、恢复 8.0 升级内容）、2-migrate-from-mysql-togreatsql.md（**209 行，含 8445 链接需修复**）、3-migrate-from-percona-to-greatsql.md（105 行）、4-migrate-from-mariadb-to-greatsql.md（14 行）
- **关键改动**：本批重点是「删除 8.4 新增段落 + 补译 8.0 独有段落」的完整示范；升级路径描述与 8.0.32-27 一致（如「从 5.7/8.0 系列升级至 8.0.32-27」）。
- **验证方式**：check-translation.js 过滤该章节残留中文为 0。
- **预估复杂度**：中高

#### Step 9：4-install-guide 第一批：通用安装（10 文件）
- **目标**：安装准备/RPM/TAR/Docker/Ansible/示例库/systemd/cnf 路径/卸载。
- **涉及文件**：en/4-install-guide/0-install-guide.md、1-install-prepare.md（31 行）、2-install-with-rpm.md（131 行）、3-install-with-tarball.md（2 行）、4-install-with-docker.md（42 行）、5-install-with-ansible.md（26 行）、7-load-sampledb.md、8-greatsql-with-systemd.md（8 行）、9-custom-cnf-file-path.md（10 行）、10-uninstall-greatsql.md（4 行）
- **关键改动**：命令/配置文件片段/路径不译；包名与版本号替换（8.0.32-27.1.el8 等）；`systemctl`、`my.cnf` 保持原样。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：中

#### Step 10：4-install-guide 第二批：多 OS + 源码编译（8 文件）
- **目标**：CentOS/Ubuntu/openEuler/UOS/Anolis/Kylin/Arch 各平台安装 + 源码编译。
- **涉及文件**：en/4-install-guide/3-1-centos-install.md（130 行）、3-2-ubuntu-install.md（155 行）、3-3-openeuler-install.md（125 行）、3-4-uos-install.md（115 行）、3-5-anolis-install.md（110 行）、3-6-kylin-install.md（116 行）、3-7-arch-install.md（147 行）、6-install-with-source-code.md（**336 行，本批重点**）
- **关键改动**：各 OS 文件模板化（下载/配置/启动/验证），译法相互对齐；源码编译章节差异大，逐段核对依赖包/编译选项与 8.0.32-27 一致。
- **验证方式**：check-translation.js 过滤该批残留中文为 0；抽查各 OS 章节标题译法一致。
- **预估复杂度**：中高

#### Step 11：8-mgr（9 文件）
- **目标**：MGR 组复制章节。
- **涉及文件**：en/8-mgr/*（9 个；2-install-deploy 48 行、3-maintain-admin 36 行、4-status-monitor 30 行为重点）
- **关键改动**：MGR 术语（primary/secondary/arbitrator/consensus/donor/joiner/fast single-primary mode）严格遵循术语表。
- **验证方式**：check-translation.js 过滤该章节残留中文为 0。
- **预估复杂度**：中

#### Step 12：10-optimize 第一批：性能调优（9 文件）
- **目标**：硬件/OS、schema/SQL 设计、慢更新/行锁/死锁/MDL 锁诊断。
- **涉及文件**：en/10-optimize/0-optimize.md、1-hardware-and-os-optimize.md（6 行）、2-greatsql-optimize.md（6 行）、2-1-schema-design-refer.md、2-2-sql-develop-refer.md、2-4-slow-update-diag.md（12 行）、2-5-rowlock-diag.md（36 行）、2-6-deadlock-diag.md（8 行）、2-7-mdllock-diag.md（2 行）
- **关键改动**：锁类术语与官方一致（row lock、deadlock、metadata lock、row lock wait）。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：低

#### Step 13：10-optimize 第二批：benchmark 报告（7 文件）
- **目标**：sysbench/TPC-H/TPC-C 压测报告（本批差异大，为 8.4 压测数据回退）。
- **涉及文件**：en/10-optimize/3-performance-benchmark.md（5 行 + **删除 3-7-wh1000 链接**）、3-1-benchmark-sysbench.md、3-2-benchmark-tpch.md、3-3-benchmark-greatsql-tpch-report.md（**370 行**）、3-4-benchmarksql.md（52 行）、3-5-benchmark-greatsql-vs-mysql-tpcc-report.md（**510 行，本批重点**）、3-6-benchmark-greatsql-tpch-turbo-report.md
- **关键改动**：3-3/3-5/3-6 以 8.0.32-26/27 的压测数据重写对应章节（截图沿用中文版、表格结构与指标术语 TpmC/QphH 保留）；3-performance-benchmark 修复指向 3-7 的链接。
- **验证方式**：check-translation.js 过滤该批残留中文为 0；抽查 3-5 表格列数与原文件一致。
- **预估复杂度**：高（表格多、数据替换量大）

#### Step 14：6-oper-guide 第一批：基础运维与备份恢复（13 文件）
- **目标**：基本运维/读写分离/监控告警/备份恢复/多实例。
- **涉及文件**：en/6-oper-guide/0-oper-guide.md、1-basic-oper.md（16 行）、2-oper-rw-splitting.md（12 行）、3-monitoring-and-alerting.md（12 行）、4-backup-and-restore.md、4-1-mysqldump.md（8 行）、4-2-outfile.md（10 行）、4-3-shell-util.md（12 行）、4-4-physical-backup.md（20 行）、4-5-clone.md（6 行）、5-multi-instances.md（14 行）、6-1-user-statistics.md（4 行）、6-1-1-client-statistics.md（4 行）
- **关键改动**：备份恢复术语与官方一致；shell 脚本代码块不译。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：低

#### Step 15：6-oper-guide 第二批：Percona Toolkit + 运维增强 + 健康检查（16 文件）
- **目标**：pt-* 系列 + statistics 系列 + 避免误操作/故障排查/每日健康检查。
- **涉及文件**：en/6-oper-guide/10-percona-toolkit.md（4 行）、10-1-pt-practical.md（30 行）、10-2-pt-configuration.md（6 行）、10-3-pt-monitoring.md（22 行）、10-4-pt-system.md（12 行）、10-5-pt-development.md（6 行）、10-6-pt-replication.md（34 行）、10-7-pt-performance.md（8 行）、6-1-2/6-1-3/6-1-4/6-1-5-index/table/thread/user-statistics.md（各 2 行）、6-2-procfs-plugin.md（4 行）、6-3-compressed-columns.md（2 行）、6-4-extended-innodb-status.md、6-5-extended-show-grants.md、6-6-handle-corrupted-tables.md、6-7-kill-idle-trx.md、6-8-other-tables.md（2 行）、6-feature-enhancement.md（3 行）、7-avoid-mistakes.md（2 行）、8-troubleshooting.md（29 行）、9-daily-health-check.md（6 行）
- **关键改动**：Percona Toolkit 工具名与参数名不译；SHOW 扩展命令保持原样；差异多为版本号与措辞。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：中

#### Step 16：5-enhance 5-1 高性能（10 文件）
- **目标**：Rapid/Turbo 引擎、并行查询、NUMA 亲和等（8.0.32-27 已含 Turbo；不含 vector-search/execplan-baseline/parallel-replica/binlog-flush-opt 四个 8.4 文件）。
- **涉及文件**：en/5-enhance/5-1-highperf.md（4 行）、5-1-highperf-rapid-engine.md（**99 行**）、5-1-highperf-turbo-engine.md（60 行）、5-1-highperf-innodb-pq.md（6 行）、5-1-highperf-numa-affinity.md（6 行）、5-1-highperf-thread-pool.md（2 行）、5-1-highperf-parallel-load.md、5-1-highperf-async-purge-big-table.md（6 行）、5-1-highperf-nonblocking-ddl.md、5-1-highperf-ap-supported-functions.md（4 行）
- **关键改动**：rapid-engine 差异主要为锚点链接（`#3-数据导入`→`#数据导入`）与措辞，逐个核对；Rapid/Turbo Engine、parallel query 等术语保持专有名词风格。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：中

#### Step 17：5-enhance 5-2 高可用 + 5-3 易用 + 5-5 备份压缩（14 文件）
- **目标**：MGR 高可用增强 + Oracle 兼容概述 + Clone 压缩/页压缩。
- **涉及文件**：en/5-enhance/5-2-ha.md、5-2-ha-mgr-arbitrator.md（8 行）、5-2-ha-mgr-election-mode.md（5 行）、5-2-ha-mgr-fast-mode.md（2 行）、5-2-ha-mgr-improved.md、5-2-ha-mgr-kill-conn-after-switch.md（4 行）、5-2-ha-mgr-new-fc.md、5-2-ha-mgr-request-time.md、5-2-ha-mgr-vip.md（**105 行**）、5-2-ha-mgr-zoneid.md（2 行）、5-2-ha-binlog-speed-limit.md（4 行）、5-2-ha-repl-server-mode.md、5-3-easyuse.md（19 行）、5-3-sql-compat-faq.md（6 行）、5-5-clone-compressed-and-incrment-backup.md（10 行）、5-5-innodb-page-compression.md（6 行）、5-5-others.md
- **关键改动**：MGR 术语与 8-mgr 章节、术语表三方对齐；vip 文件差异大（8.4 新增安全内容回退）。
- **验证方式**：check-translation.js 过滤该批残留中文为 0；抽查与 Step 11 的 8-mgr 译法一致性。
- **预估复杂度**：中

#### Step 18：5-enhance 5-4 安全（7 文件）
- **目标**：审计/Clone 加密/数据屏蔽/国密/最后登录/mysqldump 加密。
- **涉及文件**：en/5-enhance/5-4-security.md（1 行）、5-4-security-audit.md（**713 行，本批重点**）、5-4-security-clone-encrypt.md（2 行）、5-4-security-data-masking.md（**261 行**）、5-4-security-encrypt-with-gmssl.md（**635 行**）、5-4-security-last-login.md（4 行，含标题映射「最后登录信息」）、5-4-security-mysqldump-encrypt.md（4 行）
- **关键改动**：audit/gmssl 两文件差异大（8.4 新增审计项与国密实现细节回退至 8.0.32-27 版本），逐段核对；data masking、audit、GMSSL、page compression 术语与官方一致。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：高

#### Step 19：5-enhance sql-compat（101 文件）
- **目标**：Oracle 兼容函数/语法/存储过程/数据类型（结构高度模板化，差异极小）。
- **涉及文件**：en/5-enhance/sql-compat/*（101 个；其中约 50 个 `diff -w` 差异为 0~6 行、可原样复制，其余 2~14 行局部改写）
- **关键改动**：函数名、SQL 语法、示例代码一律不译；"Oracle 兼容"统一译 "Oracle compatibility"；差异多为 typo 修正（如 `SET_VAR(use_secondary_engine=1 SET_VAR` 语法错误修正）与措辞微调。
- **验证方式**：check-translation.js 过滤该目录残留中文为 0。
- **预估复杂度**：低（文件多但单文件小、模板化）

#### Step 20：12-dev-guide（47 文件，分两批）
- **目标（第一批，31 文件）**：客户端工具（12-1）、数据库对象（12-2）、数据修改（12-3）、数据查询（12-4）；
- **目标（第二批，16 文件）**：事务（12-6）、SQL 优化与错误处理（12-7/12-8）。
- **涉及文件**：
  - 第一批：en/12-dev-guide/12-dev-guide.md、12-1-*.md（8 个；12-1-1-cw-cli 21 行为重点）、12-2-*.md（10 个；12-2-3-dp-table 12 行）、12-3-*.md（8 个）、12-4-*.md（6 个；12-4-4-functions 34 行为重点）；
  - 第二批：en/12-dev-guide/12-6-*.md（5 个；12-6-3-trx-mvcc-and-locking 36 行）、12-7-*.md（5 个）、12-8-2-error-connection-failure.md（3 行）、12-8-3-error-create-write.md、12-8-4-error-select.md、12-8-5-error-other.md。
- **关键改动**：事务与锁术语高发区（transaction isolation level、MVCC、gap lock、next-key lock、deadlock）严格对照 MySQL 官方术语；12-8-1 单独处理（见 Step 21）。
- **验证方式**：check-translation.js 过滤该批残留中文为 0。
- **预估复杂度**：中

#### Step 21：错误码大文件（12-8-1）+ 新文件 gt-checksum + en/README.md
- **目标**：补齐错误码缺失条目、翻译唯一新文件、定稿英文首页。
- **涉及文件**：
  - `en/12-dev-guide/12-8-1-error-code-reference.md`：复制 8.4.4-5 英文版 + **补 26 个 8.0.32-27 独有错误码条目**（错误号/符号/SQLSTATE/英文描述，描述以 MySQL 官方英文错误信息为准）；
  - `en/6-oper-guide/11-gt-checksum.md`：**全新翻译**（173 行，gt-checksum 工具：特性/下载/快速运行/MySQL 校验/异构校验/常见问题；工具名、命令不译）；
  - `en/README.md`：定稿（版本 8.0.32-27、章节文件数 14/14/6/18/136/37/5/9/6/16/6/47/8/2 合计 324、特性描述与 8.0.32-27 对齐）。
- **验证方式**：错误码条目数 diff 与中文一致（1,483）；gt-checksum 残留中文为 0；README 状态表与实际文件数一致。
- **预估复杂度**：中

### Phase C：验证与收尾

#### Step 22：残留中文扫描 + 链接/锚点检查
- **目标**：全站 en/ 无正文残留中文；无指向不存在的 9 个文件/本地文件的断链。
- **涉及文件**：全站 en/（修复发现的问题文件）
- **关键改动**：
  - 移植 `scripts/check-translation.js`（复制 8.4.4-5），全站扫描：残留中文仅允许出现在代码块注释/截图 alt 中；
  - 链接检查脚本：遍历 en/ 内相对链接，确认目标文件存在（重点排查指向 8.4 独有 9 文件的链接）；
  - 锚点检查：英文 H2/H3 标题翻译后站内 `#` 链接目标存在。
- **验证方式**：check-translation.js 输出残留中文 0（正文）；链接检查 0 失效。
- **预估复杂度**：中

#### Step 23：构建验证（vuepress build）
- **目标**：英文站整体构建通过，页面数 ≥ 324。
- **涉及文件**：无需改文件，仅验证；如有问题修复对应文件
- **关键改动**：`/data/home/yejr/node_modules/.bin/vuepress build`；检查英文站页面数、无 error、`/en/` 无 404 内部链接；语言切换按钮在中英页间跳转正常。
- **验证方式**：构建日志无 error；手工抽查英文页渲染（代码高亮、表格、图片）。
- **预估复杂度**：中

#### Step 24：审校 + 增量同步机制 + 文档更新
- **目标**：术语一致性终检；建立中文修订 → 增量翻译流程；更新 docs 文档。
- **涉及文件**：docs/translation-glossary.md（如发现新术语则补充）、新建 docs/translation-sync-process.md（复制 8.4.4-5 并适配本仓库）、docs/i18n-feasibility.md（新建，记录脚手架与翻译完成情况）、en/README.md（状态表定稿）
- **关键改动**：
  - 抽查高术语密度文件（8-mgr、5-1-highperf-rapid-engine、12-6-3、5-4-security-audit）与 MySQL 官方用语对照；
  - 增量同步流程：中文 diff 提交后 → check-translation.js + diff 定位变更文件 → 增量翻译 → 构建验证；
  - 记录本仓库与 8.4.4-5 的差异文件清单（324/325 公共 + 1 独有）供后续版本同步参考。
- **验证方式**：审校记录输出；流程文档评审。
- **预估复杂度**：中

---

## 六、测试计划

### 自动化校验（每个翻译步骤执行）
- `node scripts/check-translation.js <path>`：该批文件残留中文字符为 0（代码块除外）；
- 表格校验：英文文件表格列数与中文原文件一致（抽查大表格文件）；
- 链接校验：en/ 内相对链接目标文件均存在。

### 构建回归（Step 2、Step 23 各一次）
- `/data/home/yejr/node_modules/.bin/vuepress build`；
- 检查：英文站页面数 ≥ 324、无构建 error、`/en/` 下无 404 内部链接。

### 手工验证场景
- 语言切换器在中英页面间跳转（同路径另一语言页可达）；
- 抽查英文页：代码块渲染正常（SQL 高亮）、图片正常（沿用中文截图）、表格对齐；
- 抽查锚点：页内 `#` 链接跳转正确；
- 版本切换下拉（nav）跳转到 8.4.4-5/8.0.32-27 等版本站正常。

---

## 七、文档更新计划

| 文档 | 更新时机 | 内容 |
|---|---|---|
| docs/translation-glossary.md | Step 1 新建，审校时修订 | 复制 8.4.4-5 术语表 + 增补本版本术语 |
| docs/i18n-feasibility.md | Step 24 新建 | 脚手架 + 翻译完成记录、差异文件清单 |
| docs/translation-sync-process.md | Step 24 新建 | 增量翻译同步机制 |
| en/README.md | Step 3 初稿、Step 21/24 定稿 | 章节状态表（324/324 已翻译） |
| CHANGELOG.md / README.md | 各批次完成时 | 本仓库无 CHANGELOG.md，遵循现状 |

---

## 八、注意事项与约束

- **术语要求**：所有翻译以 MySQL/GreatSQL 专业术语为准（术语表 + `1-docs-intro/1-5-glossary.md`），禁止日常通用英文；与 8.4.4-5 译文术语保持一致性（本方案天然保证，因多数译文直接复制自 8.4.4-5）；
- **单批次规模控制**：每步 5~101 个文件，按章节/差异大小分批，大差异文件单独成批；
- **版本差异必须逐文件核对**：复制译文 ≠ 完成，243 个文件必须走「diff -w → 微调」流程，重点删除 8.4 独有内容对应的英文段落；
- **不执行的操作**：本仓库为文档站，无部署/容器操作；构建仅限本地 `vuepress build` 验证，不涉及线上发布；
- **截图不重制**：英文页沿用中文截图（Out of scope）；
- **依赖 8.4.4-5 仓库可读**：复制源为 `/home/yejr/gitee/8.4.4-5`，如该仓库路径变动需同步调整复制脚本源路径。

---

## 九、执行完成记录（2026-11-19）

> 本计划 24 个步骤已全部执行完成。

### 9.1 各阶段结果

| 阶段 | 步骤 | 结果 |
|---|---|---|
| Phase A 脚手架 | Step 1 术语表 + 标题映射；Step 2 i18n 脚手架 | 完成：`docs/translation-glossary.md`、`scripts/zh-en-titles.js`（+3 条新译法）、`configs/sidebar-zh.js`（157 标题）、`sidebar-en.js`（自动生成）、`nav-zh.js`/`nav-en.js`、`config.js` locales、`enhanceApp.js` 语言切换、`styles/index.styl` |
| Phase B 内容翻译 | Step 3 镜像复制；Step 4~21 逐章微调 | 完成：`en/` 324 个文档 + `en/README.md`；323 个复制自 8.4.4-5 后按中文差异微调；1 个（`6-oper-guide/11-gt-checksum.md`）全新翻译 |
| Phase C 验证收尾 | Step 22 残留中文 + 链接；Step 23 构建；Step 24 审校 + 文档 | 完成：残留中文 0、断链 0、构建成功（en 325 页 / 全站 653 页）；新增 `docs/i18n-feasibility.md`、`docs/translation-sync-process.md` |

### 9.2 实际微调要点（与计划略有调整的部分）

1. **Step 3 未做全局版本号批量替换**：改为逐文件按中文 `diff -w` 差异微调，避免误改 8.4 独有段落中的版本语义；
2. **整篇重写的文件**（版本间文档结构完全不同，译文按 8.0.32-27 中文重建）：
   - `7-migrate-and-upgrade/1-upgrade-to-greatsql8.md`（5.7→8.0，全文重译）
   - `7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql.md`、`3-migrate-from-percona-to-greatsql.md`
   - `5-enhance/5-4-security-audit.md`（插件式审计 vs 组件式审计）
   - `5-enhance/5-4-security-encrypt-with-gmssl.md`（BabaSSL 编译方式）
   - `4-install-guide/6-install-with-source-code.md`（Docker 编译方式）
   - `10-optimize/3-3-benchmark-greatsql-tpch-report.md`、`3-5-benchmark-greatsql-vs-mysql-tpcc-report.md`（压测数据版本差异）
   - `13-reference/3-variables.md`（8.0.32-27 为 5 列系统变量表，8.4.4-5 已简化为单列）
3. **错误码文件**（`12-dev-guide/12-8-1-error-code-reference.md`）：复制自 8.4.4-5 的英文版缺 25 条 8.0.19/8.0.20 新增错误码（错误号 3939~3963，符号如 `ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME`、`ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL` 等）。中文版文件中这 25 条以英文格式条目存在（24 条 Message 已是英文可直接复制，1 条 Message 为中文已按 MySQL 官方英文翻译），已全部补入英文版，最终符号 1,468 个 / 错误号 1,480 条与中文版完全对齐（1227 / `ER_SPECIFIC_ACCESS_DENIED_ERROR` 复制时已含，无需补）；
4. **sql-compat（101 文件）**：差异以表格边框宽度、空白、标点为主，仅对约 13 个文件做了内容级微调（typo、数据行、参数名等）；
5. **5-enhance/5-2-ha-mgr-vip.md**：删除了 8.4.4-5 新增的「安全加固说明」整节。

### 9.3 最终验收数据

| 项目 | 数值 |
|---|---|
| 中文文档 / 英文文档 | 324 / 324（+ README） |
| 残留中文字符（全站 en/） | 0 |
| 内部断链 | 0（707 链接 + 104 锚点全量校验，`scripts/check-links.js`） |
| 缺失图片 | 0 |
| 残留 `8.4.4` 版本串 | 0 |
| `vuepress build` | 成功；en 325 页、全站 653 页 |
