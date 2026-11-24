# 中英双语化（i18n）可行性调研与实施记录

> 调研日期：2026-10-20（参考 8.4.4-5 仓库同名文档）
> 实施日期：2026-11-19（8.0.32-27 仓库）
> 关联文档：`docs/en-translation-research-and-plan-8327.md`（本次实施计划）、`docs/translation-glossary.md`（术语表）、`docs/translation-sync-process.md`（增量同步流程）

---

## 一、结论先行

8.0.32-27 用户手册已完成**全站中英双语化**：中文原位保留（仓库根目录），英文镜像到 `en/` 目录（324 个文档 + `en/README.md`），通过 VuePress 1.x 的 `locales` 机制在同一站点内提供 `/`（中文）与 `/en/`（英文）两个语言版本，导航栏提供一键中英切换按钮。

英文译文的主体来自 **8.4.4-5 仓库已完成的英文译文**（`/home/yejr/gitee/8.4.4-5/en/`），按两版本中文内容差异逐文件微调而成，因此术语与 8.4.4-5 英文站完全一致。

---

## 二、Phase 1：i18n 脚手架（2026-11-19 完成）

沿用 8.4.4-5 已验证方案，改造本仓库配置：

| 项目 | 改动 |
|---|---|
| `.vuepress/config.js` | 新增 `locales`（zh-CN / en-US 站点元信息）与 `themeConfig.locales`（中英 nav/sidebar 分别 require）；`sidebar`/`nav` 从内联数组外置为 `require('./configs/sidebar-zh.js')` 等；`base` 保持 `/docs/8.0.32-27/` |
| `.vuepress/configs/sidebar-zh.js` | 从原 `config.js` 内联 sidebar 抽取（13 个分组、157 个标题），结构/路径不变 |
| `.vuepress/configs/sidebar-en.js` | 由 `scripts/translate-sidebar-titles.js` 从 sidebar-zh.js + `scripts/zh-en-titles.js` 自动生成，路径自动加 `/en/` 前缀 |
| `.vuepress/configs/nav-zh.js` | 从原 `config.js` 内联 nav 抽取 |
| `.vuepress/configs/nav-en.js` | 英文导航（版本切换下拉含 `8.0.32-27 (English)`，其余历史版本指向中文页） |
| `.vuepress/enhanceApp.js` | 移植 8.4.4-5 的语言切换按钮（替代默认语言下拉）、英文模式文案、代码折行按钮 |
| `.vuepress/styles/index.styl` | 追加 `.lang-switch-btn` 样式 |
| `scripts/` | 新增 `check-translation.js`（残留中文扫描）、`check-links.js`（断链/锚点/跨语言链接检查）、`translate-sidebar-titles.js`、`zh-en-titles.js` |

**验证**：`vuepress build` 通过；中英页面路由可达；语言切换按钮工作正常。

---

## 三、Phase 2：全量英文翻译（2026-11-19 完成）

### 3.1 规模与来源

| 项目 | 数量 |
|---|---|
| 中文章节 | 14 章 |
| 中文文档 | 324 个（+ `README.md`） |
| 英文文档 | 324 个 + `en/README.md` = 325 个文件 |
| 与 8.4.4-5 公共文件 | 324 个（含 README.md） |
| 仅本版本独有（全新翻译） | 1 个：`6-oper-guide/11-gt-checksum.md` |
| 仅 8.4.4-5 独有（本次不涉及） | 9 个（8444/8445 relnotes、vector-search、execplan-baseline、parallel-replica、binlog-flush-opt、repl-interface-cmd、tpcc-wh1000、live-demo） |

### 3.2 差异分析与微调策略

两版本中文内容逐文件比对（`diff -w` 忽略空白，2026-11-19 实测）：**字节级完全一致 9 个、仅空白/格式差异 105 个（合计 114 个 `diff -w` 一致，译文可原样复制）、真实内容差异 209 个（约 7,245 行变更）**。另有 1 个本版本独有文件（`6-oper-guide/11-gt-checksum.md`）需全新翻译。

按差异类型分别处理：

1. **版本号/链接替换**：`8.4.4-5` → `8.0.32-27`、下载链接、RPM 包名、`my.cnf` 模板链接、`Release 27, Revision aa66a385910` 等；
2. **删除 8.4 新增内容对应的英文段落**：如 5-2-ha-mgr-vip 的「安全加固说明」、5-4-security 的组件化审计、3-4-benchmarksql 的 RC 隔离级别章节、4-install-guide 的多处依赖安装段落、ARM 提示等；
3. **补译 8.0.32-27 独有内容**：如 `1-3-greatsql-features.md` 的「GreatSQL VS MySQL」对比大表、`13-reference/3-variables.md` 的 5 列系统变量表、`6-oper-guide/11-gt-checksum.md` 全文；
4. **术语回退**：8.0 版用 `CHANGE MASTER TO` / `SHOW SLAVE STATUS` / `slave_*` 参数名 / `log_slow_slave_statements`（8.4.4-5 已改为 REPLICA/SOURCE 术语），按 8.0.32-27 中文原文回退英文译文；
5. **整篇重写**（版本间文档结构完全不同的）：`7-migrate-and-upgrade/1-upgrade-to-greatsql8.md`（5.7→8.0 vs 8.0→8.4）、`2-migrate-from-mysql-togreatsql.md`、`3-migrate-from-percona-to-greatsql.md`、`5-4-security-audit.md`（插件式 vs 组件式审计）、`5-4-security-encrypt-with-gmssl.md`（BabaSSL 编译 vs 国密二进制包）、`10-optimize/3-3`/`3-5` 压测报告、`4-install-guide/6-install-with-source-code.md`、`12-8-1-error-code-reference.md`（补 25 条 8.0.19/8.0.20 新增错误码，错误号 3939~3963，最终 1,480 错误号 / 1,468 符号与中文版完全对齐）。

### 3.3 验收结果

| 验收项 | 结果 |
|---|---|
| `node scripts/check-translation.js`（全站 325 个 en 文件） | 残留中文 **0** |
| en/ 与 zh/ 文件数镜像 | 14 章逐章一致（324/324） |
| en 内部相对链接 | 断链 **0** |
| en 图片引用 | 全部存在（沿用中文截图） |
| `vuepress build` | 成功，英文站 **325** 页，全站 **655** 页（含 404 页及 docs/ 规划文档 4 页） |
| 版本字符串残留（`8.4.4`、`39b389cdf3b`） | **0** |

---

## 四、Phase 3：验证与增量同步

- 残留中文扫描工具：`scripts/check-translation.js`（支持按章节/文件过滤、`--codeblocks` 模式）；
- 增量同步流程：见 `docs/translation-sync-process.md`；
- 术语基准：`docs/translation-glossary.md`；
- 侧边栏标题映射：`scripts/zh-en-titles.js`（唯一事实来源，新增/修改中文侧边栏标题时需同步补充英文译法，再运行 `scripts/translate-sidebar-titles.js` 重新生成 `sidebar-en.js`）。

---

## 五、与 8.4.4-5 的差异文件清单（供后续版本同步参考）

> 数据来源：对两份仓库的中文 md 文件逐文件 `diff -w` 比对（2026-11-19 实测，与 §3.2 口径一致）。
> 用途：后续从 8.4.4-5 升级/回溯版本、或重跑增量翻译时，按本清单快速定位「需微调的文件」；未列出的文件为 `diff -w` 一致（114 个），译文可原样复制。

### 6.1 生成命令（可随时重跑）

```bash
# 在 8.0.32-27 仓库根目录执行；8.4.4-5 仓库路径为 /home/yejr/gitee/8.4.4-5
for f in $(find 1-docs-intro 2-about-greatsql 3-quick-start 4-install-guide 5-enhance 6-oper-guide 7-migrate-and-upgrade 8-mgr 9-ha 10-optimize 11-faq 12-dev-guide 13-reference 14-greatsql-demo -name '*.md' | sort); do
  if [ ! -f "/home/yejr/gitee/8.4.4-5/$f" ]; then echo "ONLY-8327  $f";
  elif /usr/bin/diff -w -q "$f" "/home/yejr/gitee/8.4.4-5/$f" >/dev/null 2>&1; then echo "SAME  $f";
  else echo "DIFF  $f"; fi
done
```

### 6.2 统计

| 类别 | 数量 | 说明 |
| --- | --- | --- |
| 字节级一致 | 9 | 译文可原样复制 |
| 仅空白/格式差异 | 105 | 空格、标点微调，译文无需改动 |
| 真实内容差异 | 209 | 需按差异逐段微调（见 §3.2 的 5 类处理方式） |
| 仅 8.0.32-27 独有 | 1 | `6-oper-guide/11-gt-checksum.md`（全新翻译） |
| 合计 | 324 | 与中文章节文件数一致 |

### 6.3 真实内容差异文件清单（209 个，按章节分组）

```
== 1-docs-intro (13) ==
1-docs-intro/1-1-notes-to-users.md  1-docs-intro/1-2-release-history.md  1-docs-intro/1-3-greatsql-features.md
1-docs-intro/1-4-issues-known.md  1-docs-intro/1-5-glossary.md
1-docs-intro/relnotes/changes-greatsql-5-7-36-20220407.md
1-docs-intro/relnotes/changes-greatsql-8-0-25-16-20220516.md
1-docs-intro/relnotes/changes-greatsql-8-0-25-17-20230313.md
1-docs-intro/relnotes/changes-greatsql-8-0-25-20210820.md
1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605.md
1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228.md
1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805.md
1-docs-intro/relnotes/changes-greatsql-8-0-32-27.md

== 2-about-greatsql (12) ==
2-about-greatsql/0-about-greatsql.md  2-about-greatsql/2-greatsql-product-positioning.md
2-about-greatsql/3-greatsql-arch.md  2-about-greatsql/4-greatsql-log.md
2-about-greatsql/4-1-greatsql-error-log.md  2-about-greatsql/4-2-greatsql-slow-log.md
2-about-greatsql/4-3-greatsql-binary-log.md  2-about-greatsql/4-4-greatsql-relay-log.md
2-about-greatsql/4-5-greatsql-redo-log.md  2-about-greatsql/4-6-greatsql-undo-log.md
2-about-greatsql/4-7-greatsql-general-log.md  2-about-greatsql/7-greatsql-keywords.md

== 3-quick-start (5) ==
3-quick-start/3-1-quick-start-with-rpm.md  3-quick-start/3-2-quick-start-with-tarball.md
3-quick-start/3-3-quick-start-with-docker.md  3-quick-start/3-4-quick-start-with-cnf.md
3-quick-start/3-5-quick-start-dbrw.md

== 4-install-guide (16) ==
4-install-guide/1-install-prepare.md  4-install-guide/2-install-with-rpm.md
4-install-guide/3-install-with-tarball.md  4-install-guide/4-install-with-docker.md
4-install-guide/5-install-with-ansible.md  4-install-guide/6-install-with-source-code.md
4-install-guide/8-greatsql-with-systemd.md  4-install-guide/9-custom-cnf-file-path.md
4-install-guide/10-uninstall-greatsql.md
4-install-guide/3-1-centos-install.md  4-install-guide/3-2-ubuntu-install.md
4-install-guide/3-3-openeuler-install.md  4-install-guide/3-4-uos-install.md
4-install-guide/3-5-anolis-install.md  4-install-guide/3-6-kylin-install.md
4-install-guide/3-7-arch-install.md

== 5-enhance (79) ==
5-enhance/5-1-highperf.md  5-enhance/5-1-highperf-ap-supported-functions.md
5-enhance/5-1-highperf-async-purge-big-table.md  5-enhance/5-1-highperf-innodb-pq.md
5-enhance/5-1-highperf-numa-affinity.md  5-enhance/5-1-highperf-rapid-engine.md
5-enhance/5-1-highperf-thread-pool.md  5-enhance/5-1-highperf-turbo-engine.md
5-enhance/5-2-ha-binlog-speed-limit.md  5-enhance/5-2-ha-mgr-arbitrator.md
5-enhance/5-2-ha-mgr-election-mode.md  5-enhance/5-2-ha-mgr-fast-mode.md
5-enhance/5-2-ha-mgr-kill-conn-after-switch.md  5-enhance/5-2-ha-mgr-vip.md
5-enhance/5-2-ha-mgr-zoneid.md  5-enhance/5-3-easyuse.md  5-enhance/5-3-sql-compat-faq.md
5-enhance/5-4-security.md  5-enhance/5-4-security-audit.md
5-enhance/5-4-security-clone-encrypt.md  5-enhance/5-4-security-data-masking.md
5-enhance/5-4-security-encrypt-with-gmssl.md  5-enhance/5-4-security-last-login.md
5-enhance/5-4-security-mysqldump-encrypt.md
5-enhance/5-5-clone-compressed-and-incrment-backup.md
5-enhance/5-5-innodb-page-compression.md
5-enhance/sql-compat/5-3-easyuse-ora-datatypes.md
5-enhance/sql-compat/5-3-easyuse-ora-func-addmonths.md
5-enhance/sql-compat/5-3-easyuse-ora-func-currenttimestamp.md
5-enhance/sql-compat/5-3-easyuse-ora-func-decode.md
5-enhance/sql-compat/5-3-easyuse-ora-func-dump.md
5-enhance/sql-compat/5-3-easyuse-ora-func-lengthb.md
5-enhance/sql-compat/5-3-easyuse-ora-func-length.md
5-enhance/sql-compat/5-3-easyuse-ora-func-listagg.md
5-enhance/sql-compat/5-3-easyuse-ora-func-nvl2.md
5-enhance/sql-compat/5-3-easyuse-ora-func-regexpcount.md
5-enhance/sql-compat/5-3-easyuse-ora-func-replace.md
5-enhance/sql-compat/5-3-easyuse-ora-func-rpad.md
5-enhance/sql-compat/5-3-easyuse-ora-func-sqlcode-sqlerrm.md
5-enhance/sql-compat/5-3-easyuse-ora-func-substrb.md
5-enhance/sql-compat/5-3-easyuse-ora-func-substr.md
5-enhance/sql-compat/5-3-easyuse-ora-func-sysguid.md
5-enhance/sql-compat/5-3-easyuse-ora-func-tochar.md
5-enhance/sql-compat/5-3-easyuse-ora-func-toclob.md
5-enhance/sql-compat/5-3-easyuse-ora-func-todate.md
5-enhance/sql-compat/5-3-easyuse-ora-func-translate.md
5-enhance/sql-compat/5-3-easyuse-ora-func-trim.md
5-enhance/sql-compat/5-3-easyuse-ora-func-trunc.md
5-enhance/sql-compat/5-3-easyuse-ora-func-wmconcat.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-basic-constructs.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-bulk-collect.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-continue.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-default-optval.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-goto-label.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-if.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-table-type.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-trigger.md
5-enhance/sql-compat/5-3-easyuse-ora-sp-while.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-createforceview.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-create-type.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-datetime-arithmetic.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-empstr-equal-null.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-execute-immediate.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-explain-plan-for.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-external-table.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-forupdate-waitn.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-global-temptable.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-hierarchical-query.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-merge-into.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-oracle-comment.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-oracle-plus.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-pivot.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-rownum.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-sequence.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-shrinkmode.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-sysdateisnow.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-table-udt.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-update-set.md
5-enhance/sql-compat/5-3-easyuse-ora-syntax-with-func.md

== 6-oper-guide (29 DIFF + 1 ONLY) ==
6-oper-guide/1-basic-oper.md  6-oper-guide/2-oper-rw-splitting.md
6-oper-guide/3-monitoring-and-alerting.md  6-oper-guide/4-1-mysqldump.md
6-oper-guide/4-2-outfile.md  6-oper-guide/4-3-shell-util.md
6-oper-guide/4-4-physical-backup.md  6-oper-guide/4-5-clone.md
6-oper-guide/5-multi-instances.md  6-oper-guide/6-1-user-statistics.md
6-oper-guide/6-1-1-client-statistics.md  6-oper-guide/6-1-2-index-statistics.md
6-oper-guide/6-1-4-thread-statistics.md  6-oper-guide/6-1-5-user-statistics.md
6-oper-guide/6-2-procfs-plugin.md  6-oper-guide/6-3-compressed-columns.md
6-oper-guide/6-8-other-tables.md  6-oper-guide/6-feature-enhancement.md
6-oper-guide/7-avoid-mistakes.md  6-oper-guide/8-troubleshooting.md
6-oper-guide/9-daily-health-check.md  6-oper-guide/10-percona-toolkit.md
6-oper-guide/10-1-pt-practical.md  6-oper-guide/10-2-pt-configuration.md
6-oper-guide/10-3-pt-monitoring.md  6-oper-guide/10-4-pt-system.md
6-oper-guide/10-5-pt-development.md  6-oper-guide/10-6-pt-replication.md
6-oper-guide/10-7-pt-performance.md
[ONLY-8327] 6-oper-guide/11-gt-checksum.md（全新翻译）

== 7-migrate-and-upgrade (5) ==
7-migrate-and-upgrade/0-migrate-and-upgrade.md
7-migrate-and-upgrade/1-upgrade-to-greatsql8.md
7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql.md
7-migrate-and-upgrade/3-migrate-from-percona-to-greatsql.md
7-migrate-and-upgrade/4-migrate-from-mariadb-to-greatsql.md

== 8-mgr (9) ==
8-mgr/0-mgr-fundamentals.md  8-mgr/1-mgr-introduction.md
8-mgr/2-mgr-install-deploy.md  8-mgr/3-mgr-maintain-admin.md
8-mgr/4-mgr-status-monitor.md  8-mgr/5-mgr-readwrite-split.md
8-mgr/6-mgr-data-security.md  8-mgr/7-mgr-performance-tuning.md
8-mgr/8-mgr-best-practices.md

== 9-ha (3) ==
9-ha/1-ha-single-machine-multi-instance.md  9-ha/2-ha-single-idc.md
9-ha/5-ha-single-vlan.md

== 10-optimize (10) ==
10-optimize/1-hardware-and-os-optimize.md  10-optimize/2-greatsql-optimize.md
10-optimize/2-4-slow-update-diag.md  10-optimize/2-5-rowlock-diag.md
10-optimize/2-6-deadlock-diag.md  10-optimize/2-7-mdllock-diag.md
10-optimize/3-performance-benchmark.md  10-optimize/3-3-benchmark-greatsql-tpch-report.md
10-optimize/3-4-benchmarksql.md  10-optimize/3-5-benchmark-greatsql-vs-mysql-tpcc-report.md

== 11-faq (5) ==
11-faq/1-faq-greatsql.md  11-faq/2-faq-mgr-oper.md  11-faq/3-faq-mgr-arch.md
11-faq/4-faq-mgr-monitor.md  11-faq/5-faq-others.md

== 12-dev-guide (19) ==
12-dev-guide/12-1-1-cw-cli.md  12-dev-guide/12-1-3-cw-drive.md
12-dev-guide/12-2-2-dp-schema.md  12-dev-guide/12-2-3-dp-table.md
12-dev-guide/12-3-4-data-replace.md  12-dev-guide/12-3-6-gen-random-data.md
12-dev-guide/12-3-7-gen-sysbench-data.md  12-dev-guide/12-4-2-data-select-multi-table.md
12-dev-guide/12-4-3-data-select-subquery.md  12-dev-guide/12-4-4-functions.md
12-dev-guide/12-6-1-trx-control.md  12-dev-guide/12-6-2-trx-isolation.md
12-dev-guide/12-6-3-trx-mvcc-and-locking.md  12-dev-guide/12-6-4-trx-troubleshoot.md
12-dev-guide/12-7-sql-optimize-overview.md  12-dev-guide/12-7-3-sql-optimize-engines.md
12-dev-guide/12-7-4-sql-optimize-slowsql.md  12-dev-guide/12-8-1-error-code-reference.md
12-dev-guide/12-8-2-error-connection-failure.md

== 13-reference (4) ==
13-reference/1-index.md  13-reference/3-variables.md
13-reference/7-why-upgrade-to-greatsql80.md  13-reference/8-credential-and-honor.md

== 14-greatsql-demo (0) ==
（无差异文件）
```

### 6.4 仅 8.4.4-5 独有、本仓库不存在的文件（9 个，本次跳过）

```
1-docs-intro/relnotes/changes-greatsql-8444.md
1-docs-intro/relnotes/changes-greatsql-8445.md
5-enhance/5-2-ha-repl-interface-cmd.md
5-enhance/5-1-highperf-parallel-replica.md
5-enhance/5-1-highperf-binlog-flush-opt-large-trx.md
5-enhance/5-1-highperf-execplan-baseline.md
5-enhance/5-1-highperf-vector-search.md
10-optimize/3-7-benchmark-greatsql-vs-mysql-tpcc-wh1000-report.md
14-greatsql-demo/greatsql-live-demo.md
```

---

## 六、已知限制

1. **189 张中文截图**：英文页面沿用中文截图，未重制；
2. **Percona Toolkit 侧边栏外链**：英文侧边栏中 pt-* 子项仍指向中文站页面锚点（锚点为工具名，中英一致），与 8.4.4-5 做法一致；
3. **中文修订漂移**：中文手册后续修订需按 `docs/translation-sync-process.md` 增量同步英文译文。

---

## 七、Review 迭代修复记录（2026-11-24）

对本次翻译功能执行完整 review/bugfix 迭代（详见 `review/` 目录 4 份文档：impl-review / impl-review-v1 / impl-bugfix-v1 / impl-final-review）后的修复与终检：

| 修复项 | 说明 |
|---|---|
| right-anchor ignore 补 `/en/` 条目 | `.vuepress/config.js`：英文首页 `/en/` 与两个 iframe demo 页（`/en/14-greatsql-demo/greatsql-live-sql`、`/en/14-greatsql-demo/greatsql-live-mgr`）不再渲染右侧锚点目录（对齐 8.4.4-5 参考实现） |
| 跨语言绝对链接修复 | `en/6-oper-guide/10-6-pt-replication.md` 的 gt-checksum 链接补 `/en/` 前缀（原缺前缀会跳中文页） |
| `scripts/check-links.js` 加固 | 新增「绝对内部链接跨语言检查」：en/ 内 `/xxx` 形式绝对链接必须指向 `/en/`（英文站）或 `/`（中文首页），否则报 `CROSS-LOCALE LINK`，防止跨语言链接回归 |
| `.gitignore` | 追加 `review`（与 8.4.4-5 一致），review 文档不提交、不随发布构建上线 |

**Review 终检数据（2026-11-24）**：残留中文 0（325 文件）；断链 0（697 链接 + 94 锚点 + 跨语言检查）；错误码 1,480 条对齐；`vuepress build` 成功（en 325 页 / zh 325 页 / docs 4 页 / 404 1 页）。
