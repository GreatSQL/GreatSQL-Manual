# 社区站点英文翻译 最终审查报告

**完成日期：** 2026-11-24
**迭代轮次：** 共 1 轮（v1 审查 + v1 bugfix + 用户确认后补修复：WARNING-001/003 按方案 B 执行；无剩余代码缺陷）

## 功能实现总结

- **功能描述：** 为社区站点（参与贡献/社区行为守则/社区治理/培训认证/兼容适配流程/致谢 7 页）搭建与中文站同构的英文站 `/docs/community/en/`：照搬 8.4.4-5 成熟 i18n 脚手架（locales 双 locale、英文侧边栏/导航、语言一键直切按钮、`.lang-switch-btn` 样式），`en/` 目录镜像翻译约 400 行正文（专有名词/代码块/链接/图片路径不译、表格仅译表头），复制 `scripts/check-translation.js` 校验脚本，产出术语表与部署手册。
- **变更文件列表：**
  - 修改：.vuepress/config.js、.vuepress/enhanceApp.js、.gitignore
  - 新增（已入库）：.gitignore、.vuepress/configs/nav-en.js、.vuepress/configs/sidebar-en.js、.vuepress/styles/index.styl（本次整体入库，含历史主题样式）
  - 新增（待提交）：en/（7 文件）、scripts/check-translation.js、docs/（3 文件）、review/（4 文件）
  - 说明：en/、scripts/、docs/ 与 review/ 为未跟踪状态，随本次功能提交一并 `git add` 即可。

## 问题处理全记录

| 问题ID | 严重度 | 描述摘要 | 处理状态 | 备注 |
|-------|-------|---------|---------|------|
| CRITICAL-001 | critical | `.vuepress/configs/` 与 `index.styl` 被 .gitignore 忽略无法提交，全新 clone 构建必失败 | ✅ 已修复 | .gitignore 改 `/.vuepress/dist` 并入库（移除自忽略行），configs/ 与 styles/index.styl 已入库 |
| WARNING-001 | warning | 中文站 title/description 变更（导航栏品牌文字 + SEO meta） | ✅ 已修复 | 用户确认方案 B：zh locale 仅保留 lang，回退顶层 `''`/`"GreatSQL User Manual"` |
| WARNING-002 | warning | en/6 第 19 行组织名「全球溯源中心」被翻译，触碰专有名词红线 | ✅ 已修复 | 回退为中文原样，与中文源逐字一致 |
| WARNING-003 | warning | 行为守则英文页 v1.4 链接指向中文版公约 | ✅ 已修复 | 用户确认方案 B：改指官方英文版 v1.4 公约 |
| WARNING-004 | warning | langTarget base 推导在无尾斜杠 URL 下探测错误 | ✅ 已修复 | 优先用 router.options.base |
| INFO-001 | info | 中文源 GCP 流程图文件名 typo | ⏭ 跳过 | 超本次范围（不动中文站），英文版已正确 |
| INFO-002 | info | right-anchor ignore 注释过时 | ✅ 已修复 | 仅注释更新 |
| INFO-003 | info | check-translation.js 注释残留 8.4.4-5 语境 | ⏭ 跳过 | 无功能影响 |
| INFO-004 | info | fetch HEAD 依赖 404 语义 | ⏭ 跳过 | 当前 nginx 纯静态，风险不存在 |
| INFO-005 | info | 语言下拉隐藏 200ms 兜底 | ⏭ 跳过 | 与 8.4.4-5 一致，可接受 |
| INFO-006 | info | en/4 GCP 表部分行多余空格 | ⏭ 跳过 | 中文源原样，diff 确认 |

## 最终质量评估

- **代码质量：** A（脚手架照搬成熟实现；enhanceApp.js 对 Vue DOM diff 陷阱的处理（隐藏而非 remove 语言下拉）有注释说明；修复后无 critical/warning 级代码缺陷，全部 warning 均已闭环）
- **测试覆盖：** 完整（构建回归 ×4、全站 CJK 扫描、--codeblocks 扫描、证书编号集合 diff、表格行数/列数核对、图片引用与打包核验、H1 与侧边栏一致性、html lang/title/meta 按 locale 验证；浏览器手工验证与线上发布按部署手册由用户执行）
- **文档同步：** 已更新（术语表 translation-glossary-community.md、部署手册 community-en-deploy.md、计划文档含 Step 10 完成记录；本审查轮新增 review/ 下 4 份文档）

## 遗留事项（若有）

| 事项 | 类型 | 跟踪方式 |
| --- | --- | --- |
| 线上发布（`bash community.sh` + 上线验证） | 用户手动执行 | 按 `docs/community-en-deploy.md` 部署手册 |
| 可选后续项：中文源 GCP 流程图 typo、8.4.4-5 FAQ 链接改英文 URL、名单表格随中文站常态更新同步 | 超本次范围 | 记录于计划文档「遗留事项」 |

## 建议的后续步骤

1. 提交全部变更（en/、scripts/、docs/、.vuepress/configs/、styles/index.styl、.gitignore），并执行部署手册上线验证；
2. 调用 `/update-docs` 同步 CHANGELOG / README 等文档（如需）。
