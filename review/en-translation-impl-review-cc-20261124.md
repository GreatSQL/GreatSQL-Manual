# 社区站点英文翻译 实现变更说明

**变更日期：** 2026-11-24
**影响模块：** i18n 脚手架（.vuepress/config.js、.vuepress/enhanceApp.js、.vuepress/configs/*、.vuepress/styles/index.styl）、英文页面翻译（en/ 7 文件）、校验脚本（scripts/check-translation.js）、配套文档（docs/ 3 文件）

## 一、变更概览

- 变更文件数量：2 个修改（.vuepress/config.js、.vuepress/enhanceApp.js）+ 13 个新增（en/ 7 个、.vuepress/configs/ 2 个、scripts/ 1 个、docs/ 3 个）
- 新增/修改/删除统计：修改 2、新增 13、删除 0（注：`.vuepress/configs/`、`.vuepress/styles/index.styl` 受 `.gitignore` 的 `/.vuepress` 规则影响未被 git 跟踪，见风险）
- 核心改动一句话描述：为社区站点搭建中英双站——新增 `en/` 目录镜像 7 个中文页面（约 400 行正文翻译），照搬 8.4.4-5 的 i18n 脚手架（locales 双 locale、英文侧边栏/导航、语言一键直切按钮、`.lang-switch-btn` 样式），并复制 `scripts/check-translation.js` 作为翻译完整性校验工具。

## 二、各模块变更详情

### 模块 1：i18n 脚手架（.vuepress/config.js）

**变更背景：** 中文站原本无任何 i18n 基础设施（无 locales、无 en/ 目录、无语言切换）。本次参照 8.4.4-5 成熟实现搭建中英双站。

**变更内容：**
- 顶层新增 `locales`：`'/'`（lang zh-CN，title/description 中文）+ `'/en/'`（lang en-US，title/description 英文）；
- `themeConfig.locales` 拆出两套 nav/sidebar：中文保持原样（内联 5 项侧边栏 + 4 项导航），英文引用新建 `.vuepress/configs/sidebar-en.js`（5 项，路径带 `/en/` 前缀）与 `nav-en.js`（4 项）；
- `vuepress-plugin-right-anchor` 增加 `ignore: ['/en/']`（en 首页不显示右侧锚点目录）；
- 中文站 sidebar/nav 从顶层内联移入 `themeConfig.locales['/']`，内容逐项不变（git diff 确认仅位置迁移）。

```js
// .vuepress/config.js（关键片段）
locales: {
  '/': { lang: 'zh-CN', title: 'GreatSQL社区', description: 'GreatSQL社区' },
  '/en/': { lang: 'en-US', title: 'GreatSQL Community', description: 'GreatSQL Community' },
},
themeConfig: {
  locales: {
    '/': { label: '简体中文', selectText: '语言', nav: [...4 项中文...], sidebar: [...5 项中文...] },
    '/en/': { label: 'English', selectText: 'Languages', nav: require('./configs/nav-en.js'), sidebar: require('./configs/sidebar-en.js') },
  },
}
```

**变更目的：** 使英文站拥有独立路由、标题、导航与侧边栏；语言切换下拉由默认主题按多 locale 自动渲染（后续由 enhanceApp.js 隐藏并替换为直切按钮）。

**潜在副作用（已记录）：** zh locale 的 title 由原 `''` 变为 `'GreatSQL社区'`、description 由 `"GreatSQL User Manual"` 变为 `'GreatSQL社区'` —— 中文站导航栏品牌文字与 SEO meta 发生变化（已构建验证渲染结果），需用户确认是否有意。

### 模块 2：语言切换与配色按钮 i18n（.vuepress/enhanceApp.js）

**变更背景：** 需要中英一键直切按钮（替代默认主题「语言」下拉）、配色按钮文案按 locale 切换，且不破坏 Vue 的 DOM diff 流程。

**变更内容：**
- 新增 `MODE_LABEL_EN`（英文配色模式文案）与 `isEnLocale()`/`L()`（按 `/en/` 路径前缀选择文案）；
- `updateBtn()` 增加 locale 感知的 title/aria-label；
- 新增语言直切按钮实现：
  - `removeLangDropdown()`：仅 `display:none` 隐藏标题为「语言 / Languages」的下拉（注释明确说明不能用 `item.remove()`，否则 Vue patch 会抛 HierarchyRequestError 导致页面不更新/侧边栏无法展开）；
  - `langTarget()`：由当前路径推导目标语言页路径，并从 `window.location.pathname` 反推站点 base（`/docs/community/`），拼出 HEAD 探测 URL；
  - 点击按钮 → `fetch(probeUrl, {method:'HEAD'})` 探测目标页静态文件是否存在 → 存在则 `router.push` 目标页，否则回退语言首页；
  - `ensureLangSwitch()`：路由切换/load/200ms 兜底时重新隐藏语言下拉并保持按钮位置（插入到 `.nav-links` 之后）。

**变更目的：** 中文页显示 `English`、英文页显示 `简体中文`，一键直达同路径另一语言页面；与配色切换、百度统计共存。

### 模块 3：英文页面翻译（en/ 7 个文件）

**变更背景：** 7 个中文页面无英文版，需镜像翻译，专有名词/代码块/链接不译。

**变更内容：**
| 文件 | 行数 | 翻译要点 |
| --- | --- | --- |
| en/README.md = en/1-contribute-to-greatsql.md | 29×2 | 全文翻译（两文件逐字节一致，diff 验证）；页脚复用「Scan the QR code to follow our WeChat Official Account」；图片路径 `./greatsql-wx.jpg` → `../greatsql-wx.jpg` |
| en/2-community-rules.md | 47 | 直接复用 Contributor Covenant v1.4 官方英文原文（五个章节 Our Pledge/Our Standards/Our Responsibilities/Scope/Enforcement 与中文译本一一对应，未从中译本回译）；保留举报邮箱与外部链接 |
| en/3-community-toc.md | 181 | 全文翻译；TOC/PMC/Maintainer/Reviewer/Contributor/Ambassador/Consumer/User/SIG/RFC 等术语保留英文；`community-toc.jpg` → `../`（含 `[def]:` 行） |
| en/4-greatsql-certified.md | 448 | 正文（简介/流程/FAQ 五问/名单引言）翻译；GCA/GCP 全称用官方表述；5 张 GCA + 1 张 GCP 名单表仅译表头（No. / Name / Certificate Number），人名掩码与证书编号逐字保留（证书号集合与中文源 diff 完全一致）；`gca-flow-chart.png`/`gcp-flow-chart.png` → `../` |
| en/5-greatsql-adaptation.md | 219 | 流程正文（申请前准备/四步流程/盖章/官网展示）翻译；112 行认证列表仅译表头与类别词（Operating System/Storage/CPU/Server/Application Software/Middleware/DPU），公司/产品/版本号原样保留；4 张图片路径 → `../` |
| en/6-thanks.md | 168 | 引言/章节标题/表头翻译；社区用户表公司名保留、应用场景描述翻译；开发/文档贡献描述翻译、人名/账号/链接保留；感谢列表原样保留 |

**变更目的：** 让国际用户可读的英文站与中文站同构（`/docs/community/en/<页面>.html`）。

### 模块 4：校验脚本（scripts/check-translation.js，134 行，新增）

**变更背景：** 需要翻译完整性验收工具（每个批次/全站扫描残留中文）。

**变更内容：** 从 8.4.4-5 复制：遍历 en/ 下 md，剔除围栏代码块/行内代码/markdown 链接 URL/裸 URL 后统计 CJK（`[\u4e00-\u9fa5]`）；支持单文件/目录过滤参数与 `--codeblocks` 模式（统计代码块内 CJK 并区分注释行/数据行）。

**变更目的：** 全站扫描确认残留中文为 0（或仅剩按策略保留的专有名词）。

### 模块 5：配套文档（docs/ 3 个文件，新增）

- `docs/translation-glossary-community.md`（术语表 + 翻译规范 + 可复用素材清单 + 专有名词红线 + 高频术语抽查清单）——全部翻译批次的唯一译法基准；
- `docs/community-en-deploy.md`（部署手册：用户手动执行 `bash community.sh` + 上线验证步骤 + 常见问题处理）；
- `docs/en-translation-research-and-plan-cc-20261124.md`（需求调研与开发计划 + Step 10 完成记录）。

## 三、潜在风险评估

| 风险点 | 严重程度 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| `.vuepress/configs/sidebar-en.js`、`nav-en.js`、`index.styl` 被 `.gitignore`（`/.vuepress`）忽略，无法提交 | **高** | 版本库完整性：全新 clone + build 将 MODULE_NOT_FOUND 失败；`.lang-switch-btn` 样式丢失 | 调整 .gitignore 为 `/.vuepress/dist`（或追加 `!.vuepress/configs/`、`!.vuepress/styles/index.styl`）并 git add；本阶段已用 `yarn community:build` 验证工作区构建可用 |
| 中文站 title/description 变化（navbar 品牌文字出现、SEO meta 变更） | 中 | 中文站外观/SEO | 已构建验证渲染结果；待用户确认是否有意 |
| en/6-thanks.md 第 19 行「全球溯源中心」被翻译（该单元格位于「社区用户」列，按红线公司名应保留） | 中 | 致谢页专有名词红线 | 建议回退保留中文或与用户确认 |
| en/2-community-rules.md 的 v1.4 参考链接指向中文版公约页 | 低 | 英文页外链体验 | 可选：改为官方英文 v1.4 链接 |
| 语言切换按钮对 `/docs/community`（无尾斜杠）等边界 URL 的 base 推导偏差 | 低 | 按钮跳转兜底 | nginx 通常 301 补斜杠；探测失败回退语言首页 |
| 中文源 GCP 流程图文件名 typo（`![gca-flow-chart](./gcp-flow-chart.png)`）英文版已修正，中文源未同步 | 低 | 中文站 GCP 流程图显示 | 超出本次范围，记录为遗留项 |

## 四、测试验证情况

- **编译验证：** ✅ 通过。`cd /home/yejr/gitee && yarn community:build`（VuePress 1.9.10）Server/Client Compiled successfully，约 9.6s 完成；`dist/en/` 下 7 个页面全部生成（index.html、1-contribute-to-greatsql.html、2-community-rules.html、3-community-toc.html、4-greatsql-certified.html、5-greatsql-adaptation.html、6-thanks.html）。
- **已执行的测试命令及结果：**
  - `node scripts/check-translation.js`：7 文件扫描，README/1/2/3 残留中文 0；4/5/6 残留均为按策略保留的专有名词（人名掩码/公司名/URL 内中文文件名），非表格行中文为 0；
  - `node scripts/check-translation.js --codeblocks`：代码块内 CJK 0（无中文注释残留）；
  - 证书编号一致性：`diff 4-greatsql-certified.md en/4-greatsql-certified.md` 的 GCA-DBA/GCP-DBA 编号集合完全一致；
  - 表格行数：5 号文件中文/英文各 114 行表格行，一致；表头与类别词已翻译；
  - 图片：7 张图片 `../` 引用全部指向存在的文件，构建产物 `dist/assets/img/` 全部打包（7 张）；
  - 相对链接：en 源 md 内仅图片相对链接，全部有效；站内 `#锚点` 手工链接 0 个（锚点均为 VuePress 自动生成）；
  - H1 与英文侧边栏一致：Contribute / Community Code of Conduct / Community Governance / Compatibility Adaptation / Acknowledgments（+ 独立页 Training & Certification）；
  - HTML 输出：`<html lang="zh-CN">` vs `<html lang="en-US">`、title/meta description 按 locale 区分、侧边栏链接均带 `/docs/community/en/` 前缀、`lang-switch-btn` 已编译进 app JS。
- 说明：按项目约束未执行 `community.sh`（含线上 rsync），线上发布由用户按部署手册手动执行。

## 五、待确认事项

1. `.gitignore` 调整方案（`/.vuepress` → `/.vuepress/dist` 或追加白名单）——需用户拍板后由修复轮执行；
2. 中文站 title/description 变更是否有意（`''`→`GreatSQL社区`、`"GreatSQL User Manual"`→`'GreatSQL社区'`）；
3. en/6-thanks.md 第 19 行专有名词处理方式（保留中文 / 维持英文 / 修正表格结构）；
4. en/2-community-rules.md 的 v1.4 参考链接是否改为官方英文版（可选项）。
