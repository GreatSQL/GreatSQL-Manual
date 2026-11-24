# 社区站点英文翻译 问题修复报告 v1

**修复日期：** 2026-11-24
**基于审查报告：** review/en-translation-impl-review-v1-cc-20261124.md

## 修复摘要

- 已修复：2 个（CRITICAL-001、WARNING-004）
- 已修复（按红线回退专有名词）：1 个（WARNING-002）
- 已修复（按用户确认方案 B）：2 个（WARNING-001 中文站 title/description 回退、WARNING-003 行为守则 v1.4 链接改指官方英文版）
- 误报/不适用：1 个（INFO-006，与中文源逐字一致的原样保留）
- 遗留-记录：1 个（INFO-001 中文源 GCP 流程图文件名 typo，超出本次范围不动中文站）

## 逐条处理记录

### [CRITICAL-001] `.vuepress/configs/` 与 `index.styl` 未纳入版本控制，全新 clone 构建必然失败
- **状态：** ✅ 已修复
- **核实结论：** 真实存在。`git ls-files .vuepress/` 仅 3 个历史文件（config.js/enhanceApp.js/palette.styl）；`.gitignore` 的 `/.vuepress` 忽略整个目录，导致本功能新增的 `configs/sidebar-en.js`、`nav-en.js`（config.js `require` 依赖）与 `index.styl` 新增的 `.lang-switch-btn` 样式无法入库；全新 clone 构建将 MODULE_NOT_FOUND 失败。
- **修复方案：** `.gitignore` 由 `/.vuepress` 改为 `/.vuepress/dist`（仅忽略构建产物），并 `git add .vuepress/configs/ .vuepress/styles/index.styl`（index.styl 整体入库，含历史配色主题样式）。补充：原 `.gitignore` 内含一行 `.gitignore`（忽略自身），导致该文件本身从未入库、改动只对本地生效——已移除该自忽略行并 `git add .gitignore`，使 ignore 规则随版本库发布（全新 clone 后同样只忽略 dist、configs/ 与 styles/ 可正常入库）。
- **修复文件：** .gitignore（已入库）、.vuepress/configs/nav-en.js（入库）、.vuepress/configs/sidebar-en.js（入库）、.vuepress/styles/index.styl（入库）
- **验证结果：** `git status` 显示 `A .gitignore`、`A .vuepress/configs/nav-en.js`、`A .vuepress/configs/sidebar-en.js`、`A .vuepress/styles/index.styl`；`git check-ignore .vuepress/dist` 确认 dist 仍被忽略；`.gitignore` 不再被自身忽略（可提交）。

### [WARNING-001] 中文站 title/description 变更：导航栏品牌文字与 SEO meta 变化
- **状态：** ✅ 已修复（按用户确认方案 B：中文站零变化）
- **核实结论：** 真实存在（构建产物确认 `site-name` 显示 "GreatSQL社区"、meta description 变更）。用户确认执行方案 B——恢复中文站原状。
- **修复方案：** `locales['/']` 仅保留 `lang: 'zh-CN'`，移除 title/description，回退到顶层 `title: ''`、`description: "GreatSQL User Manual"`（中文站导航栏品牌文字消失、SEO meta 恢复，与变更前一致）。
- **修复文件：** .vuepress/config.js:8-10
- **验证结果：** 构建后 `dist/index.html`：`<title>参与贡献</title>`（无品牌后缀）、无 `site-name` 品牌文字、`<meta name="description" content="GreatSQL User Manual">`；`dist/en/index.html` 仍为 "Contribute | GreatSQL Community" + "GreatSQL Community" 品牌文字。

### [WARNING-002] en/6-thanks.md 第 19 行组织名被翻译，触碰专有名词红线
- **状态：** ✅ 已修复（按红线回退）
- **核实结论：** 真实存在。中文源第 19 行 `| 19 | 全球溯源中心等政务系统 |` 结构异常（「社区用户」列内容含组织名、缺「应用场景」列），英文版将组织名翻译为 "Global Traceability Center and other government systems"，违反「公司名/组织名原样保留，即使含中文」红线；且计划完成记录 9.3 描述该文件残留为「机构名/人名/账号」，与实际文件不符（该处被翻译故未计入残留）。
- **修复方案：** 回退为该单元格原样保留中文：`| 19 | 全球溯源中心等政务系统 |`（与中文源逐字一致，与同表其他行「公司名保留中文」策略一致；表格结构/列数不变）。
- **修复文件：** en/6-thanks.md:27
- **验证结果：** `node scripts/check-translation.js en/6-thanks.md` 残留 331 字符全部为机构名/人名/账号；构建后 `dist/en/6-thanks.html` 含「全球溯源中心等政务系统」原样文本。

### [WARNING-003] 行为守则英文页 v1.4 参考链接指向中文版公约
- **状态：** ✅ 已修复（按用户确认方案 B：改指官方英文版）
- **核实结论：** 真实存在——英文页 "Please refer to the [v1.4 version]" 链接指向中文版 v1.4 公约页。用户确认执行方案 B。
- **修复方案：** 将 v1.4 参考链接 target 改为官方英文版 `https://www.contributor-covenant.org/version/1/4/code-of-conduct.html`（沿用 gitee 中转包裹格式：`https://gitee.com/link?target=https%3A%2F%2Fwww.contributor-covenant.org%2Fversion%2F1%2F4%2Fcode-of-conduct.html`）；首个链接（公约官网首页，语言中立）保持不变。
- **修复文件：** en/2-community-rules.md:3
- **验证结果：** `node scripts/check-translation.js en/2-community-rules.md` 残留中文 0；构建后 `dist/en/2-community-rules.html` 内链接解析为英文版 code-of-conduct.html，zh-cn 引用已消失。

### [WARNING-004] 语言切换按钮 base 推导在无尾斜杠 URL 场景可能探测错误路径
- **状态：** ✅ 已修复
- **核实结论：** 真实存在。`langTarget()` 从 `location.pathname` 反推 base，当 URL 无尾斜杠（如访问 `/docs/community`）时 `P.endsWith('/')` 不成立，base 会推成 `/docs/`，HEAD 探测 URL 错误。
- **修复方案：** 优先使用 vue-router 已注入的 `router.options.base`（VuePress 站点 base 固定值 `/docs/community/`，已核验 `node_modules/@vuepress/core/lib/client/app.js` L68 `base: routerBase`），仅在缺失/格式异常时回退原 pathname 推导逻辑。
- **修复文件：** .vuepress/enhanceApp.js（`langTarget()`）
- **验证结果：** 构建通过；产物 `dist/assets/js/app.*.js` 中已编译入 `options.base` 分支。

### [INFO-001] 中文源 GCP 流程图文件名 typo
- **状态：** ⚠️ 遗留-记录（不修复）
- **核实结论：** 真实存在但超本次范围（本次不动中文站）。中文源 `4-greatsql-certified.md:49` 在 GCP 小节误引用 `gca-flow-chart.png`；英文版已正确引用 `gcp-flow-chart.png`（合理修正）。中文源修复留作可选后续项。

### [INFO-002] right-anchor ignore 注释过时
- **状态：** ✅ 已修复（仅注释）
- **核实结论：** 属实。注释「英文站占位页/首页」已过时（页面已非占位），且插件按 `$page.regularPath` 精确匹配仅命中 en 首页。
- **修复方案：** 更新注释为准确描述（en 首页不显示右侧锚点目录）。
- **修复文件：** .vuepress/config.js:66

### [INFO-003] check-translation.js 注释残留 8.4.4-5 语境
- **状态：** ❌ 误报/不适用
- **核实结论：** 注释提及 "Phase 2 Step 3~33" 等 8.4.4-5 语境属拷贝残留，但脚本逻辑与用法通用且正确，不影响功能；精简注释无功能收益，本次不改（避免无谓 diff）。

### [INFO-004] 语言切换依赖 fetch HEAD 的 404 语义
- **状态：** ❌ 误报/不适用
- **核实结论：** 当前 nginx 为纯静态（404 语义正常），且部署手册已注明排查方式；SPA 回退场景不存在，无需处理。

### [INFO-005] 语言下拉隐藏依赖 200ms 延迟兜底
- **状态：** ❌ 误报/不适用
- **核实结论：** 与 8.4.4-5 成熟实现一致的可接受取舍；多次兜底（afterEach/load/200ms）已覆盖主流场景，无需处理。

### [INFO-006] en/4 GCP 名单表部分行多余空格
- **状态：** ❌ 误报/不适用
- **核实结论：** 已与中文源逐字 diff 确认格式异常为**源文件原样**（`4-greatsql-certified.md:401-403` 与 en 完全一致），属原样保留而非翻译问题，无需处理。

## 编译验证

- [x] `cd /home/yejr/gitee && yarn community:build` —— Server/Client Compiled successfully，约 9.6s，`dist/en/` 7 页面生成（修复后重跑通过）
- [x] `node scripts/check-translation.js` —— 全站扫描：README/1/2/3 残留 0；4/5/6 残留全部为按策略保留的专有名词（含修复后 en/6 的 331 字符机构名/人名/账号）
- [x] `node scripts/check-translation.js --codeblocks` —— 代码块内 CJK 0
- [x] 证书编号一致性 diff（4 号文件 GCA/GCP 编号集合与中文源一致）
- [x] 表格行数/列数：5 号文件 114 行表格行与中文源一致；4/5/6 表头已译、专有名词原样
- [x] 图片 7 张 `../` 引用全部有效，dist/assets/img 全量打包
- [x] H1 与英文侧边栏一致；html lang / title / meta 按 locale 区分

**回归说明：** 按项目约束，本阶段仅执行不触网的本地构建与脚本校验；`community.sh`（含线上 rsync）与浏览器手工验证由用户按 `docs/community-en-deploy.md` 部署手册在收口后手动执行。

## 待确认事项（需用户拍板）

1. ~~**WARNING-001**：中文站导航栏品牌文字「GreatSQL社区」与 SEO meta description 变更——保留（方案 A）还是恢复中文站原状（方案 B）~~ ✅ 已按方案 B 执行（zh locale 仅保留 lang，title/description 回退顶层 `''`/`"GreatSQL User Manual"`）；
2. ~~**WARNING-003**：行为守则英文页 v1.4 参考链接——保持外部链接不动（方案 A）还是改指官方英文版（方案 B）~~ ✅ 已按方案 B 执行（改指 `https://www.contributor-covenant.org/version/1/4/code-of-conduct.html`）。

两项确认后均已修复并重新构建验证通过，无剩余待确认事项。
