# 英文文档增量同步流程（Translation Sync Process）

> 创建日期：2026-11-19（Phase 3 收尾）
> 适用仓库：GreatSQL 8.0.32-27 用户手册（VuePress 中英双语站）
> 目的：中文手册后续有修订提交（错别字修正、内容更新等），本流程保证 `en/` 英文译文与中文原文**持续对齐**，避免快速漂移——这是双语文档长期维护的最大风险点。

---

## 一、同步总览

```
中文修订提交（git push / PR）
        │
        ▼
① 定位变更文件  ── git diff 找出本次改动的中文 md 文件
        │
        ▼
② 映射英文文件  ── 同名路径 en/<path>.md（en/ 目录与中文完全镜像）
        │
        ▼
③ 增量翻译段落  ── 只译变更 diff 涉及的段落，未变部分不动
        │
        ▼
④ 自动化校验    ── node scripts/check-translation.js <path>（残留中文 = 0）
                    + 表格列数 / H1 标题 / 锚点结构校验
        │
        ▼
⑤ 构建回归      ── vuepress build（涉及结构改动时必做）
        │
        ▼
⑥ 术语表维护    ── 变更引入新术语时补充 docs/translation-glossary.md
```

**核心原则**：只做「增量」翻译——中文改了哪些段落，英文只同步哪些段落；**绝不对整个文件重译**（重译会引入术语漂移与无关 diff）。

**跨版本复用**：本仓库英文译文源自 8.4.4-5 仓库（`/home/yejr/gitee/8.4.4-5/en/`）。若后续需要升级到新版本或回溯其他版本，优先做法是**复制目标版本的英文译文 + 按两版本中文 `diff -w` 差异微调**（详见 `docs/i18n-feasibility.md` §3.2），而不是从零翻译。

---

## 二、详细步骤

### ① 定位变更文件

```bash
# 最近一次提交（含上次同步点之后的所有变更）
git diff HEAD~1 --name-only -- '*.md' ':!en/*' ':!docs/*' ':!scripts/*'

# 指定时间窗口（如上次同步至今）
git log --since="2026-11-19" --name-only --pretty=format: -- '*.md' ':!en/*' | sort -u

# 查看具体内容变更
git diff HEAD~1 -- 12-dev-guide/12-6-3-trx-mvcc-and-locking.md
```

要点：
- **排除 `en/`**（英文译文不参与中文 diff 定位）、排除 `docs/`、`scripts/`（非手册内容）；
- 变更文件可能跨多个章节，逐个处理。

### ② 映射英文文件

`en/` 目录与 14 个中文章节**完全镜像**（324 个中文文件全部有对应英文文件），同路径即对应：

```bash
ls en/12-dev-guide/12-6-3-trx-mvcc-and-locking.md
```

特例：中文首页 `README.md` ↔ 英文 `en/README.md`（根 `README.md` 为中文站点首页，不在 en/ 扫描范围内）。

### ③ 增量翻译段落

只翻译 git diff 中**有变更的段落**，规则与 Phase 2 完全一致（见 `docs/translation-glossary.md` 翻译保护规则）：

- 只译正文、标题、表格单元格、列表项、图片 alt；
- 代码块 / 行内代码 / 命令 / 文件名 / URL / 图片路径**不译**；
- 相对链接路径不变，仅译链接文字；表格列数不变；
- 术语查 `docs/translation-glossary.md`，**禁止自创译法**；
- 变更若修改了标题（H2/H3），需同步检查站内 `#锚点` 链接目标是否仍存在。

### ④ 自动化校验

```bash
# 残留中文检测（验收指标：本文件残留中文 = 0）
node scripts/check-translation.js 12-dev-guide/12-6-3-trx-mvcc-and-locking.md

# 按章节批量检测
node scripts/check-translation.js 12-dev-guide

# 代码块内残留（注释类应为 0，数据类允许保留）
node scripts/check-translation.js --codeblocks 5-enhance/5-1-highperf-rapid-engine.md

# 链接/锚点/跨语言检查（相对链接断链、站内 # 锚点、en/ 绝对链接缺 /en/ 前缀）
node scripts/check-links.js
```

> ⚠️ **脚本盲区提醒**：残留中文 = 0 只代表 en/ 文件内没有漏译的中文，**不代表同步完整**——若中文修订新增了整段内容而英文未同步，脚本无法发现。必须结合步骤 ③ 的 diff 段落对照逐一确认。

### ⑤ 构建回归

```bash
/data/home/yejr/node_modules/.bin/vuepress build
```

- 涉及**标题 / 目录结构 / 链接**变动的批次必做；
- 纯正文翻译批次（无结构变化）可跳过，仅做步骤 ④；
- 构建成功标准：无 error；`en/` 页数 ≥ 324；无 404 内部链接。

### ⑥ 术语表维护

1. 在 `docs/translation-glossary.md` 补充「中文 → 英文」条目；
2. **先补术语表，再翻译**；
3. 若新术语与既有译法冲突，全站 grep 旧译法统一替换。

---

## 三、常见问题

| 问题 | 处理 |
| --- | --- |
| 中文改了标题，英文没改 | 站内锚点/侧边栏可能失效；同步 H1/H2/H3 → 更新 sidebar-en.js（`scripts/translate-sidebar-titles.js`）→ 构建回归 |
| 中文新增了整个文件 | 完整翻译该文件（不走增量）；若涉及侧边栏，需在 `sidebar-zh.js` 增加条目后重新生成 `sidebar-en.js` |
| 中文删除了文件 | 同步删除 `en/<path>.md`；检查其他文件是否有指向它的链接，一并清理 |
| 变更含大段代码块内中文注释 | 注释文字译为英文（数据/字符串值保留）→ `--codeblocks` 校验 → 构建回归 |
| 批量变更（如全站术语改称） | 先改术语表 → 全站 grep 定位 → 分批替换 → 每批过 check-translation.js → 构建回归 |
| 只改了图片/截图 | 图片路径不变则无需处理；alt 文本变更则同步译 alt |
| en 文件残留中文 > 0 | 主模式定位正文残留 → `--codeblocks` 模式区分注释类（需修复）与数据类（可保留） |

---

## 四、本次审校记录（2026-11-19）

### 4.1 自动化验收（Phase C 终检，Step 24 复跑）

| 审校项 | 范围 | 结果 |
| --- | --- | --- |
| 残留中文全站扫描 | en/ 325 文件（`node scripts/check-translation.js`） | 残留中文 = **0** |
| 内部链接检查 | en/ 全站相对链接（`node scripts/check-links.js`） | 断链 = **0**（697 链接） |
| 锚点检查 | en/ 全站 `#` 锚点（`node scripts/check-links.js`） | 失效 = **0**（94 锚点） |
| 图片引用检查 | en/ 全站图片 | 全部存在（沿用中文截图） |
| 文件数镜像 | 14 章节 | 324/324 一致 |
| 版本字符串残留 | 全站 `8.4.4` / `Release 5, Revision 39b389cdf3b` | 0 |
| 侧边栏结构一致性 | sidebar-zh.js vs sidebar-en.js 路径集 | 224/224 双向比对零差异（仅标题译法不同） |
| `vuepress build` | 全站 | 成功；en 325 页 / 全站 653 页 |

> **脚本修复记录**：审校时发现 `scripts/check-links.js` 对图片链接 `xxx.png#pic_center` 存在误报（图片居中语法被当作锚点检查）。已修复：先切分 `#` 锚点再判断图片扩展名，`#pic_center` 不再计入锚点检查；修复后锚点检查从 10 个误报降为 0。

> **Review 迭代（2026-11-24）**：`scripts/check-links.js` 新增「绝对内部链接跨语言检查」——en/ 内 `/xxx` 形式绝对链接必须指向 `/en/` 或 `/`，防止英文页误链中文页（曾发现 `en/6-oper-guide/10-6-pt-replication.md` 的 gt-checksum 链接缺 `/en/` 前缀）；`.vuepress/config.js` right-anchor ignore 补 `/en/` 条目（英文首页与 2 个 iframe demo 页不渲染右侧锚点目录）。终检复跑：断链 0 / 锚点 0 / 残留中文 0，构建成功（en 325 页 / 全站 655 页）。

### 4.2 术语一致性终检（4 个高术语密度文件）

| 文件 | 抽查要点 | 结论 |
| --- | --- | --- |
| `en/8-mgr/*`（9 文件） | arbitrator、fast single-primary mode、primary election、flow control、joiner/donor、consensus、switchover、zone id、voting node | 与 MySQL/GreatSQL 官方及术语表 §2.2 一致 |
| `en/5-enhance/5-1-highperf-rapid-engine.md` | Rapid Engine、shared-nothing、in-memory、hybrid columnar storage、inverted index、secondary_engine、Parallel LOAD DATA | 与官方/术语表一致；H1 与 sidebar-en.js 条目逐字一致 |
| `en/12-dev-guide/12-6-3-trx-mvcc-and-locking.md` | MVCC、consistent nonlocking read、semi-consistent read、current read、record/gap/next-key/insert intention lock、deadlock、transaction isolation level | 与 MySQL 官方一致；H1 与 sidebar-en.js 条目逐字一致 |
| `en/5-enhance/5-4-security-audit.md` | audit plugin、audit log into-table、audit_log_to_table、sys_audit.audit_log | 与官方一致；H1 与 sidebar-en.js 条目逐字一致 |

抽查结论：4 个文件的中英标题结构逐级对齐（H1/H2 数量与顺序一致），术语无自创译法。审校中发现 3 个未收录术语（**consistent nonlocking read、semi-consistent read、shared-nothing / in-memory / hybrid columnar storage**），已补充至 `docs/translation-glossary.md` §2.5/§2.6 与高频抽查清单（§七 21/22 条）。

**术语一致性抽查清单**（均与 MySQL/GreatSQL 官方一致）：arbitrator、fast single-primary mode、parallel query、High Availability、deadlock、thread pool、binary log、transaction isolation level、record lock / gap lock / next-key lock / insert intention lock、donor/joiner、GCS、XCom、Paxos、Rapid Engine、Turbo Engine、data masking、read/write splitting、Clone backup、Oracle Compatibility、GMSSL、lock-free transactions、audit、semi-consistent read、consistent nonlocking read。
