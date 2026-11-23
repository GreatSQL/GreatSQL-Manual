# 英文文档增量同步流程（Translation Sync Process）

> 创建日期：2026-11-20（8.4.4-5 Phase 3 收尾，Step 35）
> 适配日期：2026-11-23（8.4.4-4 英文版移植收尾，Step 15，路径基准改为本仓库）
> 适用仓库：GreatSQL 8.4.4-4 用户手册（VuePress 1.9.10 中英双语站）；8.4.4-5 流程同构，仅文件数/路径基准不同
> 目的：中文手册每月有修订提交（错别字修正、内容更新、站点功能增强等），本流程保证 `en/` 英文译文与中文原文**持续对齐**，避免快速漂移——这是双语文档长期维护的最大风险点。

---

## 一、同步总览

```
中文修订提交（git push / PR）
        │
        ▼
① 定位变更文件  ── git diff 找出本次改动的中文 md 文件
                    + scripts/classify-zh-diffs.js 对照 8.4.4-5 复核差异分类
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
⑤ 构建回归      ── vuepress build（可选，涉及结构改动时必做）
        │
        ▼
⑥ 术语表维护    ── 变更引入新术语时补充 docs/translation-glossary.md
```

**核心原则**：只做「增量」翻译——中文改了哪些段落，英文只同步哪些段落；**绝不对整个文件重译**（重译会引入术语漂移与无关 diff，且浪费算力）。

---

## 二、详细步骤

### ① 定位变更文件

中文修订通常以 commit 形式进入仓库，用 git 定位本次变更涉及的中文文档；8.4.4-4 与 8.4.4-5 为同源相邻版本，另可用分类脚本复核差异分类（见下文「①a」）：

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
- 变更文件可能跨多个章节，逐个处理；
- 若仓库有 CI，可在 push 后自动执行本步（见「五、可选自动化」）。

### ①a 用 classify-zh-diffs.js 复核差异分类（8.4.4-4 特有）

8.4.4-4 中文修订若与 8.4.4-5 中文版本存在内容漂移（如修订内容与 8.4.4-5 同步过），可运行分类脚本生成差异清单，辅助判断变更文件及其差异性质：

```bash
# 对比本仓库（8.4.4-4）与 8.4.4-5 的中文文件（LC_ALL=C diff -w 忽略空白），
# 输出三类清单到 docs/zh-diff-classification.md：
#   [copy-as-is]    无真实差异（en 直接沿用，零改动）
#   [patch]         有真实差异（en 需对照 diff 修补）
#   [new-translate] 本仓库独有（en 需全文新译）
node scripts/classify-zh-diffs.js
```

- 脚本幂等、可重复运行，以 `docs/zh-diff-classification.md` 为唯一差异清单基准；
- 注意脚本对比的是两仓库中文（`diff -w` 忽略空白），输出为「8.4.4-4 zh vs 8.4.4-5 zh」的差异——`<` 行 = 8.4.4-5 独有（en 需删除对应译文），`>` 行 = 8.4.4-4 独有（en 需补译）；
- 中文修订通常只涉及少数文件，直接看 git diff 即可；本脚本用于「8.4.4-5 同步过的内容」复核或全量定期体检。

### ② 映射英文文件

`en/` 目录与 14 个中文章节**完全镜像**（8.4.4-4 为 **327 个中文文件**全部有对应英文文件，另含 `en/README.md`），同路径即对应：

```bash
# 中文文件 → 英文文件
ls en/12-dev-guide/12-6-3-trx-mvcc-and-locking.md
```

注意特例：
- 中文首页 `README.md` ↔ 英文 `en/README.md`（注意：根 `README.md` 为中文站点首页，不在 en/ 扫描范围内，`check-translation.js` 不统计它）；
- `en/` 没有、也不需要额外文件的场景：无（镜像完整）。

### ③ 增量翻译段落

只翻译 git diff 中**有变更的段落**，规则与 Phase 2 完全一致（见 `docs/translation-glossary.md` 翻译保护规则）：

- 只译正文、标题、表格单元格、列表项、图片 alt；
- 代码块 / 行内代码 / 命令 / 文件名 / URL / 图片路径**不译**；
- 相对链接路径不变，仅译链接文字；表格列数不变；
- 术语查 `docs/translation-glossary.md`，**禁止自创译法**；
- 变更若修改了标题（H2/H3），需同步检查站内 `#锚点` 链接目标是否仍存在（VuePress 按标题生成锚点，标题变了锚点就变）。

建议逐段落对照：`git diff <中文文件>` 的输出与英文文件对应段并行打开，逐块同步。

### ④ 自动化校验

每个变更文件同步完成后执行：

```bash
# 残留中文检测（验收指标：本文件残留中文 = 0）
node scripts/check-translation.js 12-dev-guide/12-6-3-trx-mvcc-and-locking.md

# 按章节批量检测
node scripts/check-translation.js 12-dev-guide
```

**注意**：`check-translation.js` 主模式会剔除围栏代码块、行内代码、URL 后统计 CJK。代码块内的中文注释需按规则译为英文（`--`/`#`/`/* */` 注释文字），测试数据/字符串值（`SELECT '测试'` 等）原样保留。用 `node scripts/check-translation.js --codeblocks <path>` 单独校验代码块内残留：注释类应为 0，数据类允许保留。

> ⚠️ **脚本盲区提醒**：残留中文 = 0 只代表 en/ 文件内没有漏译的中文，**不代表同步完整**——若中文修订新增了整段内容而英文未同步（en 文件无对应段落，自然无中文残留），脚本无法发现。必须结合步骤 ③ 的 diff 段落对照，逐一确认中文变更段落都有英文对应，才能判定同步完整。

结构校验（中文变更涉及表格 / 标题时）：
- 表格列数：对比中文与英文文件的最大列数（应与中文一致）：
  ```bash
  awk -F'|' '/^\|/{n=NF; if(n>max) max=n} END{print "max cols:", max}' <en文件>
  ```
- H1：与 `.vuepress/configs/sidebar-en.js` 对应条目一致（若中文改了 H1，同步英文 H1 后需更新 sidebar-en.js——用 `scripts/translate-sidebar-titles.js` 重新生成）；
- 锚点：变更的英文 H2/H3 标题若被站内其他文件 `#锚点` 引用，逐一确认目标存在。

### ⑤ 构建回归

以下情况需要本地构建验证（构建环境：`/data/home/yejr/node_modules/.bin/vuepress`）：

```bash
/data/home/yejr/node_modules/.bin/vuepress build
```

- 涉及**标题 / 目录结构 / 链接**变动的批次必做；
- 纯正文翻译批次（无结构变化）可跳过，仅做步骤 ④；
- 构建成功标准：无 error；`en/` 页数 ≥ 327（8.4.4-4，另加 en/README.md 首页）；无 404 内部链接。

### ⑥ 术语表维护

中文修订若引入 Phase 2 未覆盖的新术语：

1. 在 `docs/translation-glossary.md` 对应分类（2.1~2.x）补充「中文 → 英文」条目，标注来源（官方文档 / 产品命名）；
2. **先补术语表，再翻译**——保证本批次及后续批次译法一致；
3. 若新术语与既有译法冲突（如中文改称），全站 grep 旧译法统一替换：
   ```bash
   grep -rn "旧译法" en/ --include="*.md"
   ```

---

## 三、术语表维护原则（同 Step 35 审校）

| 优先级 | 来源 |
| --- | --- |
| 1 | `docs/translation-glossary.md`（唯一译法基准） |
| 2 | `1-docs-intro/1-5-glossary.md`（英文术语已定） |
| 3 | MySQL / GreatSQL 官方文档（dev.mysql.com/doc） |

审校触发时机：每次增量同步发现新术语、或定期（每季度）对重点章节（12-dev-guide、5-enhance、10-optimize、8-mgr）做一次术语一致性抽查，方法与 Phase 3 审校相同（见 `en-translation-research-and-plan-cc-20261119.md` Step 35）。

---

## 四、常见问题

| 问题 | 处理 |
| --- | --- |
| 中文改了标题，英文没改 | 站内锚点/侧边栏可能失效；同步 H1/H2/H3 → 更新 sidebar-en.js（`scripts/translate-sidebar-titles.js`）→ 构建回归 |
| 中文新增了整个文件 | `scripts/gen-en-placeholders.js` 幂等生成占位页 → 按占位页回链中文 → 完整翻译该文件（不走增量） |
| 中文删除了文件 | 同步删除 `en/<path>.md`；检查其他文件是否有指向它的链接，一并清理 |
| 变更含大段代码块内中文注释 | 注释文字译为英文（数据/字符串值保留）→ `check-translation.js --codeblocks` 校验注释类残留为 0 → 构建回归 |
| 批量变更（如全站术语改称） | 先改术语表 → 全站 grep 定位 → 分批替换 → 每批过 check-translation.js → 构建回归 |
| 只改了图片/截图 | 图片路径不变则无需处理；alt 文本变更则同步译 alt |
| en 文件残留中文 > 0 | 主模式定位正文残留 → `--codeblocks` 模式区分注释类（需修复）与数据类（可保留） |

---

## 五、可选自动化

若后续仓库接入 CI，可将步骤 ① ② ④ 脚本化：

```bash
# 伪代码：找出「自上次同步点以来变更过的中文文件」对应的英文文件
# 1) git diff 定位中文变更文件
# 2) 映射为 en/<path>.md
# 3) 对每个文件跑 node scripts/check-translation.js <path>
# 4) 残留中文 > 0 的输出到 MR 评论，人工处理
```

当前仓库无 CI 配置，按上文手动流程执行即可；建议**同步频率与中文提交频率一致**（月更文档：每月随中文修订做一次增量同步；重要版本发布说明变更：当日同步）。

---

## 六、审校记录

### 6.1 8.4.4-5 Phase 3 审校记录（2026-11-20，Step 35）

| 审校项 | 范围 | 结果 |
| --- | --- | --- |
| 术语一致性终检 | 12-dev-guide、5-enhance、10-optimize、8-mgr 全量 grep | 通过，核心术语与 MySQL 官方一致（详见下方清单） |
| 残留中文全站扫描 | en/ 333 文件 | 残留中文 = 0（代码块注释/占位文案均无） |
| 代码块保护 | 抽样 3 个大文件（rapid-engine 430 行、mgr-install 289 行、rpm-install 528 行代码块） | en 与 zh 代码块行数完全一致 |
| 标题一致性 | 抽样 8 文件 H1 + sql-compat 101 文件标题模式 | H1 与 sidebar-en.js 一致；sql-compat 统一「Oracle Compatibility - Xxx - YYY」模式 |
| 表格结构 | 抽样 benchmark 报告 | 列数与中文一致 |
| master/slave 遗留 | 全站 | 0 处；全部使用 MySQL 8.0+ 官方新术语 source/replica |
| 占位页残留 | 全站 | 0 个 "English translation in progress" |
| 修正 | `en/5-enhance/5-1-highperf-parallel-replica.md` | "high-availability" → "high availability"（全站唯一连字符用法，与术语表拼写规则统一） |

**术语一致性抽查清单**（均与 MySQL/GreatSQL 官方一致）：arbitrator、fast single-primary mode、parallel query、High Availability、deadlock、thread pool、binary log/binlog、transaction isolation level、record lock / gap lock / next-key lock / insert intention lock、donor/joiner、GCS、XCom、Paxos、Rapid Engine、data masking、read/write splitting、Clone backup、Oracle Compatibility、GMSSL、lock-free transactions、audit。

### 6.2 8.4.4-4 移植审校记录（2026-11-23，Step 15）

| 审校项 | 范围 | 结果 |
| --- | --- | --- |
| 术语一致性抽查 | en/8-mgr（9 文件）、en/12-dev-guide/12-6-3、en/5-enhance/5-1-highperf-rapid-engine、en/5-enhance/sql-compat（102 文件） | 通过，核心术语与 glossary 一致（arbitrator/donor/joiner/GCS/XCom/Paxos、record/gap/next-key/insert intention lock、REPEATABLE READ/READ COMMITTED、Rapid Engine 等） |
| 残留中文全站扫描 | en/ 328 文件（327 章节 + en/README.md） | 残留中文 = 0 |
| 章节镜像核对 | 14 章节 zh/en 逐目录文件数 | 全部一致（合计 327；1-docs-intro 15、5-enhance 136、6-oper-guide 37） |
| 新译文件 | en/6-oper-guide/11-gt-checksum.md | 标题结构与中文镜像一致；checksum/repair/consistency 用词与 glossary 2.4/2.11 一致 |
| sql-compat 标题模式 | 102 文件 H1 | 统一「Oracle Compatibility - Xxx - Yyy」模式 |
| master/slave 遗留 | 全站 | 1 处（en/11-faq/3-faq-mgr-arch.md），为中文原文「Master-Slave/M-S」对照术语的忠实翻译，非术语错误，保留 |
| 修正项 | 无 | 移植批次未引入新术语，glossary 无需增补（gt-checksum 已收录于 2.11） |

> 术语表如需补充新术语，追加到 `docs/translation-glossary.md` 后，本流程立即生效。
