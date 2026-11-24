# 社区站点英文翻译 代码审查报告 v1

**审查日期：** 2026-11-24
**审查依据：** review/en-translation-impl-review-cc-20261124.md

> 说明：本环境未安装 `code-review:code-review` skill（`/home/yejr/.agents/skills/` 无此 skill），本轮初审由审查员按 feature-review-cycle Step 4 的审查要点（功能性缺陷 / 性能与可维护性 / 改进建议 / 严重程度分级）逐文件源码核实后完成。

## 审查结论

- Critical 问题数：1
- Warning 问题数：4
- Info 建议数：6
- 总体评估：待修复（1 个 critical 必须处理，warning 按需处理）

## 逐条审查意见

### [CRITICAL-001] `.vuepress/configs/` 与 `.vuepress/styles/index.styl` 未纳入版本控制，全新 clone 构建必然失败

- **文件**：.gitignore（内容 `/.vuepress`）、.vuepress/config.js:134-135（`require('./configs/nav-en.js')`、`require('./configs/sidebar-en.js')`）、.vuepress/configs/sidebar-en.js、.vuepress/configs/nav-en.js、.vuepress/styles/index.styl:341-356（`.lang-switch-btn` 样式）
- **问题描述**：
  1. `.gitignore` 规则 `/.vuepress` 忽略整个目录，git 仅跟踪历史已入库的 `config.js`、`enhanceApp.js`、`styles/palette.styl`；
  2. 本次新增的 `.vuepress/configs/sidebar-en.js`（23 行）与 `nav-en.js`（7 行）为 config.js 的 `require` 依赖——**全新 clone 后 `yarn community:build` 将抛 MODULE_NOT_FOUND 构建失败**；
  3. `.vuepress/styles/index.styl` 中的 `.lang-switch-btn` 样式（本功能新增）同样不会随版本库发布（且 index.styl 本身历史即未跟踪，配色主题样式同理）。
  4. 验证：`git ls-files .vuepress/` 仅返回 3 个历史文件；`git status` 未显示 configs/ 与 index.styl 变更。
- **严重程度**：critical
- **修改建议**：
  - 方案 A（推荐）：`.gitignore` 由 `/.vuepress` 改为 `/.vuepress/dist`（仅忽略构建产物），使 configs/、styles/ 可入库；
  - 方案 B：`.gitignore` 追加 `!.vuepress/configs/`、`!.vuepress/styles/index.styl` 白名单；
  - 无论哪种方案，需 `git add .vuepress/configs/ .vuepress/styles/index.styl` 将新文件纳入版本库。`dist/` 保持忽略。
- **示例代码**：
  ```diff
  -/.vuepress
  +/.vuepress/dist
  ```

### [WARNING-001] 中文站 title/description 变更：导航栏品牌文字与 SEO meta 发生变化

- **文件**：.vuepress/config.js:8-13（顶层 locales）
- **问题描述**：zh locale `title: 'GreatSQL社区'`（原顶层 `title: ''`）、`description: 'GreatSQL社区'`（原 `"GreatSQL User Manual"`）。构建产物验证：`dist/index.html` 出现 `<span class="site-name can-hide">GreatSQL社区</span>`、`<meta name="description" content="GreatSQL社区">`。即中文站导航栏从「仅 logo」变为「logo + GreatSQL社区 文字」，SEO meta 描述也变了。计划文档写明要加 locales title/description，但 zh 取值与原文不同，属于对中文站的可见变更。
- **严重程度**：warning
- **修改建议**：与用户确认是否有意；若需保持中文站原状，zh description 可改回 `"GreatSQL User Manual"`，title 可考虑保持 `''` 或确认品牌文字效果。

### [WARNING-002] en/6-thanks.md 第 19 行：位于「社区用户」列的组织名被翻译，触碰专有名词红线

- **文件**：en/6-thanks.md:27（`| 19 | Global Traceability Center and other government systems |`）；对照 6-thanks.md:27（`| 19 | 全球溯源中心等政务系统 |`）
- **问题描述**：中文源第 19 行结构异常——「社区用户」列（公司名位置）填入「全球溯源中心等政务系统」，且缺「应用场景」列内容（源文件本身数据问题）。英文版将该单元格整体译成英文。按术语表红线「公司名原样保留，即使含中文」，「全球溯源中心」作为组织名不应翻译；且该行结构未修正（英文同样缺应用场景列）。
- **严重程度**：warning
- **修改建议**：至少将「全球溯源中心」回退为中文原样（如 `| 19 | 全球溯源中心等政务系统 |` 或 `| 19 | 全球溯源中心 | Global Traceability Center and other government systems |` 补全结构）；或与用户确认该行的正确内容后按确认值处理。

### [WARNING-003] 行为守则英文页的 v1.4 参考链接指向中文版公约

- **文件**：en/2-community-rules.md:3
- **问题描述**：英文页 "Please refer to the [v1.4 version](https://gitee.com/link?target=https%3A%2F%2Fwww.contributor-covenant.org%2Fzh-cn%2Fversion%2F1%2F4%2Fcode-of-conduct.html)" —— 链接指向**中文版** v1.4 公约页。英文读者点击进入中文页面，体验不一致。（保留中文源链接符合「链接 URL 不译」规则，但英文页语义上应指英文版。）
- **严重程度**：warning
- **修改建议**：可选修复——将 target 改为官方英文版 `https://www.contributor-covenant.org/version/1/4/code-of-conduct.html`（或经 gitee 中转）；若坚持「外部链接一律不动」则记录为已知取舍。

### [WARNING-004] 语言切换按钮 base 推导在无尾斜杠 URL 场景可能探测错误路径

- **文件**：.vuepress/enhanceApp.js（`langTarget()`）
- **问题描述**：`langTarget()` 中 base 由 `window.location.pathname` 反推：`P.endsWith(path)` 为真时截取 base，否则取 `lastIndexOf('/')+1`。若用户直接访问 `/docs/community`（无尾斜杠）且 router 路径为 `/`，则 `P.endsWith('/')` 不成立，base 会推成 `/docs/`，探测 URL 变成 `/docs/`（错误），HEAD 探测结果不可靠。正常 nginx 配置下 `/docs/community` 会 301 到 `/docs/community/`，概率低。
- **严重程度**：warning
- **修改建议**：可加防御——当 `P` 不以 `path` 结尾且不匹配时，fallback 到 `P + '/'` 或直接以 `router.options.base` 拼 URL；或接受现状（8.4.4-5 同款实现）。

### [INFO-001] 中文源 GCP 流程图文件名 typo，英文版已修正

- **文件**：4-greatsql-certified.md:49（`![gca-flow-chart](./gcp-flow-chart.png)`）vs en/4-greatsql-certified.md:38（`![gcp-flow-chart](../gcp-flow-chart.png)`）
- **问题描述**：中文源在 GCP 小节错误引用了 gca-flow-chart.png（文件名 typo），英文版自动修正为 gcp-flow-chart.png，属合理改进；但中文源未同步修复。
- **严重程度**：info
- **修改建议**：可选——顺带修复中文源（超本次范围，记录即可）。

### [INFO-002] right-anchor 的 ignore 注释已过时

- **文件**：.vuepress/config.js:66-69
- **问题描述**：注释「英文站占位页/首页不显示右侧锚点目录」，en 页面已全部翻译上线非占位；且插件按 `$page.regularPath` 精确匹配，`'/en/'` 实际只命中 en 首页。
- **严重程度**：info
- **修改建议**：更新注释描述（「en 首页不显示右侧锚点目录」）即可。

### [INFO-003] check-translation.js 注释残留 8.4.4-5 语境

- **文件**：scripts/check-translation.js:1-16
- **问题描述**：注释提及 "Phase 2 Step 3~33"、"按章节目录过滤（en/9-ha）" 等 8.4.4-5 用户手册语境，与社区站点规模不符。
- **严重程度**：info
- **修改建议**：可选——精简头部注释为社区站点适用描述。

### [INFO-004] 语言切换依赖 fetch HEAD 探测的服务器 404 语义

- **文件**：.vuepress/enhanceApp.js（langBtn click handler）
- **问题描述**：若线上 nginx 对 `/docs/community/en/*` 配置了 SPA 回退（找不到文件时返回 index.html 200），HEAD 探测将恒 200，按钮会直接 push 不存在的目标路径（VuePress 路由渲染 404 页）。当前 nginx 为纯静态（实测 404 语义正常），风险低。
- **严重程度**：info
- **修改建议**：无需处理；部署手册可注明「若出现切到 404 页，检查 nginx 是否开启 try_files 回退」。

### [INFO-005] 语言下拉隐藏依赖 200ms 延迟兜底

- **文件**：.vuepress/enhanceApp.js（`setTimeout(ensureLangSwitch, 200)`）
- **问题描述**：若 SSR hydrate 慢于 200ms，默认语言下拉会短暂可见，直到下一次路由切换才被隐藏。与 8.4.4-5 实现一致，属可接受取舍。
- **严重程度**：info
- **修改建议**：无需处理。

### [INFO-006] en/4 GCP 名单表部分行存在多余空格

- **文件**：en/4-greatsql-certified.md:401-403 等
- **问题描述**：`|    GCP-DBA-2026532163    |` 等单元格含多余空格——已与中文源逐字 diff 确认**原样保留**（中文源同格式），不属本次翻译问题。
- **严重程度**：info
- **修改建议**：无需处理（若追求整洁可后续统一清理，但会破坏「与中文源一致」原则）。

## 不需要处理的问题

- INFO-004 / INFO-005 / INFO-006：均属已知取舍或源文件原样保留，本次不处理；
- INFO-001（中文源 typo）：超本次范围（本次不动中文站），记录为遗留事项。
