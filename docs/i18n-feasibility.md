# 可行性调研：中英双语切换 + 全量英文文档翻译

> 调研日期：2026-10-20
> 调研范围：GreatSQL-Manual 仓库（branch: greatsql-8.4.4-5）
> 结论概要：双语切换**高可行**（VuePress 1.x 原生 i18n，工程成本 1~2 天）；全量英文翻译**技术可行但体量大**，需分阶段推进，最大风险是 189 张中文截图。

---

## 1. 仓库现状盘点

| 维度 | 数据 |
|---|---|
| 技术栈 | VuePress **1.9.10**（默认主题；仓库内无 package.json，构建环境在 `/data/home/yejr/node_modules`） |
| 文档规模 | **333 个 md 文件**，约 79,000 行，总大小 ~2.4MB |
| 中文量 | **351,490 个汉字** |
| 图片 | 189 张（绝大多数为含中文文字的截图：安装界面、监控面板、benchmark 报告等） |
| 导航配置 | `.vuepress/config.js` 共 1050 行；侧边栏含 **186 个 path 条目**、多级嵌套、部分外链（greatsql.cn/docs/...） |
| 页面标题 | 无 frontmatter title，全部取自 H1 标题（利于翻译：标题即文档首行） |
| 自定义功能 | 亮/暗/auto 主题切换、代码折行按钮（均 DOM 注入，aria/tooltip 为中文写死）、全文搜索插件（vuepress-plugin-fulltext-search）、right-anchor、medium-zoom、copy-code、百度统计 |
| 部署 | `base: '/docs/8.4.4-5/'`，发布到 greatsql.cn/docs/8.4.4-5/ |
| 更新节奏 | 活跃，近月几乎每月有修订提交（错别字修正、站点功能增强等），双语文档需建立增量同步机制 |

### 分目录规模

| 目录 | 行数 | 说明 |
|---|---|---|
| 1-docs-intro | 2,782 | 文档介绍/版本历史/术语表 |
| 2-about-greatsql | 2,424 | 产品介绍/日志体系 |
| 3-quick-start | 1,090 | 快速上手 |
| 4-install-guide | 6,456 | 安装指南（多 OS 分支） |
| 5-enhance | 26,239 | GreatSQL 增强（**最深技术章节之一**） |
| 6-oper-guide | 8,822 | 运维管理（含 Percona Toolkit 系列） |
| 7-migrate-and-upgrade | 558 | 迁移升级 |
| 8-mgr | 1,569 | MGR 组复制 |
| 9-ha | 327 | 高可用架构 |
| 10-optimize | 5,726 | 性能优化/benchmark |
| 11-faq | 1,182 | 常见问题 |
| 12-dev-guide | 20,814 | 应用开发（**最深技术章节之一**） |
| 13-reference | 553 | 参考指南（含超大的错误码对照表文件） |
| 14-greatsql-demo | 75 | 在线演示 |

### 特例文件

- `12-dev-guide/12-8-1-error-code-reference.md`：**292KB、约 11K 行**，自动生成的错误码清单。建议用脚本/从源码重新生成英文版，不人工逐条翻译。

---

## 2. 需求 1：中英双语切换 — 可行性分析

### 结论：可行，VuePress 1.x 默认主题原生支持 i18n

### 推荐方案：官方 i18n（同一站点，`/` 中文 + `/en/` 英文）

**需要做的事：**

1. **目录结构**：新建 `en/` 目录，镜像现有 14 个章节目录，逐个放置英文译文；中文 333 个文件原位不动（路径不变，现有链接/锚点零风险）。
2. **config.js 改造**：
   - 增加 `themeConfig.locales: { '/': {...中文导航/侧边栏...}, '/en/': {...英文导航/侧边栏...} }`；语言下拉切换器由主题**自动渲染**在导航栏，无需自研组件；
   - 现有 1050 行 config 中 186 个 sidebar 条目是唯一"硬骨头"：先抽取为独立模块（如 `configs/sidebar-zh.js`），再新建 `sidebar-en.js` 翻译 186 个标题。纯配置工作量约 1 天；
   - 按 locale 分别配置 `title`（站点标题：GreatSQL用户手册 / GreatSQL User Manual）、`description`、`editLinkText`、`repoLabel`、`lastUpdated` 等。
3. **自定义功能微调**（enhanceApp.js）：主题切换按钮、代码折行按钮的中文 aria/tooltip 改为按当前 locale（`$localePath` 或路径前缀）切换文案。约 0.5 小时。
4. **搜索**：`vuepress-plugin-fulltext-search` 索引全站，双语均进索引。英文搜索可能混入中文结果——可接受；如需隔离可加按 `/en/` 前缀过滤的小改动。

**注意点：**

- URL 方案：`/docs/8.4.4-5/`（中文）+ `/docs/8.4.4-5/en/`（英文）；
- 版本切换 nav 中其他版本链接（greatsql.cn/docs/8.0.32-27/ 等）目前只有中文版，英文版在对应版本未翻译前指向中文页或暂不提供；
- 侧边栏少量外链锚点（pt-archiver 等指向 greatsql.cn 中文页）在英文侧边栏需单独决策；
- 图片为中文截图，英文页面沿用中文图（见需求 2 的风险说明）。

**工作量：工程部分 1~2 天（配置 + 测试）；真正的成本在内容翻译（需求 2）。**

---

## 3. 需求 2：全量英文翻译 — 可行性分析

### 结论：技术可行，但体量大，需分阶段 + 建立持续同步流程

### 翻译量评估

| 类别 | 量 | 难度 |
|---|---|---|
| 正文文本 | 351K 汉字（≈30 万字的中文书） | LLM 批量翻译 + 术语表可做，质量需人工审校 |
| 代码块 | SQL/bash 为主，仅注释/echo 中文需译 | 低，可用脚本保护代码块不译 |
| 表格 | 大量（参数表、对比表） | 中，需保持 markdown 表格结构完整 |
| **图片** | **189 张中文截图** | **最高风险**：文本翻译救不了图内中文。安装界面、监控面板、benchmark 图要么重制（依赖真实环境，工作量大），要么英文文档先沿用中文图（体验打折）。建议"先文字全英、图片渐进替换" |
| 特例文件 | error-code-reference.md（292KB / 11K 行） | 建议脚本化/从源码重新生成英文版 |

### 技术要点

- **术语表先行**：高可用/组复制/高兼容/快速上手/二进制日志等 50~100 个核心术语先定稿英文译法，保证 333 个文件一致；
- **翻译保护规则**：代码块内容、行内代码、命令、文件名、URL 一律不译；只译正文、标题、表格单元格、列表项；
- **锚点/链接一致性**：英文文件内部相对链接路径与中文镜像一致（VuePress 按路径匹配），只译链接文字，不动路径；
- **持续同步机制**：中文仓库每月有修订提交，英文版需配套"按 diff 翻译增量"流程，否则快速漂移——这是双语文档最常见的长期失败点，立项时需确认人力。

### 建议的实施顺序

| 阶段 | 内容 | 预估 |
|---|---|---|
| Phase 0 | 术语表 + 翻译保护脚本 + 中文字符统计脚本 | 0.5 天 |
| Phase 1 | i18n 脚手架：`en/` 骨架 + 双语言 sidebar/nav + 切换器，占位页跑通链路 | 1~2 天 |
| Phase 2 | 按优先级批量翻译：1-docs-intro → 3-quick-start → 2-about-greatsql → 8-mgr → 7-migrate → 9-ha → 4-install → 6-oper → 10-optimize → 11-faq → 5-enhance → 12-dev-guide → 13-reference（超大错误码文件单独脚本） | 数天～两周（机器工时，取决于算力/并行度） |
| Phase 3 | 构建验证（断链/锚点/表格/代码块渲染）、人工审校（重点 12-dev-guide、5-enhance、10-optimize）、增量同步机制 | 1~3 周 × 1~2 人 |

### 工作量粗估

- 纯机翻全部 333 文件：**数天～两周**机器工时；
- 人工审校一遍：**1~3 周 × 1~2 人**；
- 图片重制：**视范围数周**，建议第一期明确"图片沿用中文版"边界。

---

## 4. 总体结论

| 需求 | 可行性 | 主要成本 |
|---|---|---|
| 需求 1：双语切换 | ✅ 高可行，VuePress 原生 i18n | 工程 1~2 天（侧边栏 186 条目双份化） |
| 需求 2：全量英文翻译 | ✅ 技术可行，需分阶段 | 机翻数天～两周 + 审校 1~3 周 × 1~2 人；最大风险为 189 张中文截图与长期增量同步 |

**建议路径**：先做 Phase 1（i18n 脚手架，双语切换功能上线），再按优先级推进 Phase 2 翻译，Phase 0 的术语表与保护脚本为 Phase 2 的前置。

---

## 5. Phase 1 完成情况（2026-10-20）

> ✅ **Phase 1（i18n 脚手架，双语切换功能上线）已完成**，本地构建验证通过。

### 已交付

| 项 | 说明 |
|---|---|
| `en/` 英文站点骨架 | 镜像 14 个章节目录，共 214 个 md 文件（首页 + 14 个章节占位页 + 199 个侧边栏路径占位页） |
| 双语言侧边栏 | `.vuepress/configs/sidebar-zh.js`（从 config.js 原样抽取）+ `sidebar-en.js`（151 个标题翻译 + 24 个纯 ASCII 标题保留，内部路径带 `/en/` 前缀，结构与中文版逐条一致） |
| 双语言导航 | `.vuepress/configs/nav-zh.js` / `nav-en.js`（英文导航新增 "8.4.4-5 (English)" 版本项，其余版本暂指向中文页） |
| config.js i18n | 根级 `locales`（lang/title/description 按 locale）+ `themeConfig.locales`（selectText/label/editLinkText/repoLabel/nav/sidebar）；语言切换下拉由主题自动渲染 |
| enhanceApp.js 双语 | 主题切换按钮、代码折行按钮的 aria/tooltip 按当前 locale（`/en/` 路径前缀判断）切换文案 |
| right-anchor | 英文首页/演示页加入 ignore 列表 |
| 标题翻译脚本 | `scripts/translate-sidebar-titles.js`（179 条标题映射表，中文侧边栏变动后可一键重新生成英文侧边栏） |

### 验证结果

- `vuepress build` 成功；英文站 214 页内部链接 0 失效；
- 语言切换器在导航栏自动渲染，中英页面互相映射到**同路径另一语言页**（如 `/en/8-mgr/2-mgr-install-deploy.html` ↔ `/8-mgr/2-mgr-install-deploy.html`）；
- 中文站点行为不变（标题、导航、侧边栏、搜索均正常）。

### Phase 1 遗留/说明

- 英文搜索会混入占位页与中文结果（`vuepress-plugin-fulltext-search` 全站索引），按可行性调研结论"可接受"；
- 占位页均标注 "English translation in progress" 并链接回中文页；Phase 2 翻译某页时直接覆盖对应 `en/<path>.md` 即可；
- 英文占位页被搜索引擎收录后可另加 noindex，建议 Phase 3 处理；
- 占位页生成脚本 `/tmp/gen-en-placeholders.js`（一次性，未入库；已具备幂等重生成能力，en/README.md 人工维护）。

### 下一步（Phase 2）

按优先级批量翻译：1-docs-intro → 3-quick-start → 2-about-greatsql → 8-mgr → 7-migrate → 9-ha → 4-install → 6-oper → 10-optimize → 11-faq → 5-enhance → 12-dev-guide → 13-reference（超大错误码文件单独脚本）；建议先定稿 Phase 0 术语表（50~100 个核心术语）。

---

## 6. Phase 2/3 完成情况（2026-11-20）

> ✅ **Phase 2（全量翻译，333 个文件）+ Phase 3（构建验证 / 审校 / 增量同步机制）均已完成（2026-11-20）**，实现计划见 `docs/en-translation-research-and-plan-cc-20261119.md`（Step 1~35）。

### 已交付

| 项 | 说明 |
| --- | --- |
| `docs/translation-glossary.md` | 术语表定稿（含 4 大特性、MGR/复制/高可用、安全、日志、性能、存储过程等分类 + 翻译保护规则 + 20 项高频术语抽查清单），全站唯一译法基准（Step 1） |
| `scripts/gen-en-placeholders.js` | 占位页补齐脚本（幂等），en/ 与中文 14 章节完全镜像（Step 2） |
| `scripts/check-translation.js` | 残留中文检测脚本（剔除代码块/行内代码/URL 后统计 CJK），支持目录/文件过滤，每个翻译批次的验收工具（Step 2） |
| `scripts/gen-error-code-en.js` | 错误码大文件（12-8-1，11,229 行）脚本化生成英文版，错误号/符号/SQLSTATE 保留、英文描述来自 MySQL 官方错误文本映射（Step 33） |
| `en/` 333 个英文文件 | 全部翻译完成（含 sql-compat 101 个 Oracle 兼容文档、14 章全量译文）；残留中文全站为 0；`en/README.md` 状态表更新为 332/332 全部翻译 |
| `docs/translation-sync-process.md` | 增量同步机制文档：中文 diff → 定位变更文件 → 增量翻译 → 校验 → 构建回归 → 术语表维护六步流程（Step 35） |

### 翻译概况

| 章节 | 中文文件数 | 英文文件数 | 状态 |
| --- | --- | --- | --- |
| 1-docs-intro | 16 | 16 | ✅ 完成 |
| 2-about-greatsql | 14 | 14 | ✅ 完成 |
| 3-quick-start | 6 | 6 | ✅ 完成 |
| 4-install-guide | 18 | 18 | ✅ 完成 |
| 5-enhance | 141 | 141 | ✅ 完成 |
| 6-oper-guide | 36 | 36 | ✅ 完成 |
| 7-migrate-and-upgrade | 5 | 5 | ✅ 完成 |
| 8-mgr | 9 | 9 | ✅ 完成 |
| 9-ha | 6 | 6 | ✅ 完成 |
| 10-optimize | 17 | 17 | ✅ 完成 |
| 11-faq | 6 | 6 | ✅ 完成 |
| 12-dev-guide | 47 | 47 | ✅ 完成 |
| 13-reference | 8 | 8 | ✅ 完成 |
| 14-greatsql-demo | 3 | 3 | ✅ 完成 |
| **合计** | **332** | **332（+en/README.md）** | **全部翻译完成** |

### Phase 3 审校结果（Step 34/35）

- `vuepress build` 构建通过，英文站页数 ≥ 333，无 404 内部链接（Step 34）；
- `check-translation.js` 全站扫描：333 文件残留中文 = 0（代码块注释 / 占位文案均无）；
- 术语一致性终检（重点 12-dev-guide、5-enhance、10-optimize、8-mgr）：核心术语与 MySQL 官方一致（arbitrator、fast single-primary mode、parallel query、record/gap/next-key lock、donor/joiner、GCS、XCom、Paxos、Rapid Engine、data masking、Clone backup、Oracle Compatibility、GMSSL、lock-free transactions 等）；全站无 master-slave 遗留，统一使用 source/replica；
- 代码块保护抽样：en 与 zh 代码块行数完全一致（430/289/528 行抽样）；sql-compat 101 文件标题统一「Oracle Compatibility - Xxx - YYY」模式；表格列数与中文一致；
- 审校修正：`en/5-enhance/5-1-highperf-parallel-replica.md` 连字符拼写统一（high-availability → high availability）。

### Phase 2/3 遗留 / 说明

- **189 张中文截图沿用**（Out of scope，见需求 2 风险评估）：英文页沿用中文截图，重制需另行立项；
- **英文搜索混入中文结果**：`vuepress-plugin-fulltext-search` 全站索引，未做 `/en/` 前缀隔离（可行性调研结论「可接受」）；如需隔离可加按 `/en/` 前缀过滤的小改动；
- **英文占位页 SEO**：现占位页已全部被译文覆盖，无 noindex 需求；如未来新增占位页可再议；
- **增量同步**：中文修订提交后按 `docs/translation-sync-process.md` 六步流程执行，同步频率建议与中文提交频率一致（月更文档：每月随中文修订同步；重要版本发布说明变更：当日同步）。

---

## 7. 8.4.4-4 英文版上线记录（2026-11-23）

> ✅ **GreatSQL 8.4.4-4 仓库英文版上线完成（2026-11-23）**，实现计划见 `docs/en-translation-research-and-plan-cc-20261123.md`（Step 1~15）。
> 本仓库（branch: greatsql-8.4.4-4）原无 i18n 脚手架（无 locales、无 en/、无 scripts/、无 docs/），本次以「**脚手架移植 + en/ 批量复制 + diff 驱动修补 + 少量新译**」方式完成，避免重新翻译 300+ 文件。

### 已交付

| 项 | 说明 |
| --- | --- |
| i18n 脚手架 | 复制 8.4.4-5 的 `.vuepress/config.js`（base `/docs/8.4.4-4/`、branch `greatsql-8.4.4-4`）、`configs/{sidebar-zh,sidebar-en,nav-zh,nav-en}.js`、`enhanceApp.js`；删除 6 个 8.4.4-5 特有条目；23 处外链版本号改为 8.4.4-4 |
| 工具脚本 | 复制 8.4.4-5 的 5 个脚本 + 新建 `scripts/classify-zh-diffs.js`（两仓库中文差异分类，输出 `docs/zh-diff-classification.md`） |
| `en/` 英文译文 | **327 个章节文件**与中文 14 章节完全镜像 + `en/README.md`；8.4.4-5 独有 6 个文件（8445 发行说明、vector-search、binlog-flush、parallel-replica、execplan-baseline、repl-interface-cmd）不纳入；新译 `6-oper-guide/11-gt-checksum.md`（8.4.4-4 独有）与 `1-3-greatsql-features.md` 的 GreatSQL VS MySQL 表格 |
| 版本适配 | 34 个 en 文件版本号引用 `8.4.4-5`→`8.4.4-4`（仅指向本仓库的引用，线上历史版本外链保留） |
| 文档 | `docs/` 3 个（glossary / sync-process / i18n-feasibility）+ 本计划 + zh-diff-classification |

### 章节状态表（与 8.4.4-4 中文一致）

| 章节 | 中文文件数 | 英文文件数 | 状态 |
| --- | --- | --- | --- |
| 1-docs-intro | 15 | 15 | ✅ 完成 |
| 2-about-greatsql | 14 | 14 | ✅ 完成 |
| 3-quick-start | 6 | 6 | ✅ 完成 |
| 4-install-guide | 18 | 18 | ✅ 完成 |
| 5-enhance | 136 | 136 | ✅ 完成 |
| 6-oper-guide | 37 | 37 | ✅ 完成 |
| 7-migrate-and-upgrade | 5 | 5 | ✅ 完成 |
| 8-mgr | 9 | 9 | ✅ 完成 |
| 9-ha | 6 | 6 | ✅ 完成 |
| 10-optimize | 17 | 17 | ✅ 完成 |
| 11-faq | 6 | 6 | ✅ 完成 |
| 12-dev-guide | 47 | 47 | ✅ 完成 |
| 13-reference | 8 | 8 | ✅ 完成 |
| 14-greatsql-demo | 3 | 3 | ✅ 完成 |
| **合计** | **327** | **327（+en/README.md）** | **全部翻译完成** |

### 验证结果（Step 14）

- `vuepress build` 构建通过，英文站页数 ≥ 327，无 404 内部链接；
- `check-translation.js` 全站扫描：en/ 328 文件残留中文 = 0；
- 审校（Step 15）：抽查 8-mgr、12-6-3、rapid-engine、sql-compat 术语与 glossary 一致；`en/README.md` 状态表 327/327 全部翻译。

### 遗留 / 说明

- **189 张中文截图沿用**（Out of scope，与 8.4.4-5 一致）；
- **英文搜索混入中文结果**：`vuepress-plugin-fulltext-search` 全站索引，未做 `/en/` 前缀隔离（同 8.4.4-5，可接受）；
- **线上发布**：英文站需发布到 greatsql.cn/docs/8.4.4-4/en/ 后，nav-en.js 首项「8.4.4-4 (English)」外链才生效（发布由用户手动执行）；
- **增量同步**：中文修订按 `docs/translation-sync-process.md`（已适配 8.4.4-4 路径基准）执行；8.4.4-5 与 8.4.4-4 两仓库同源，若修订同步到两版本，en 译文可互相复用。
