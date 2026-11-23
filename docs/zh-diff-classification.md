# 8.4.4-4 中文文件差异分类清单（zh-diff-classification）

> 生成：`node scripts/classify-zh-diffs.js`（幂等，可重复运行）
> 对比基准：本仓库（8.4.4-4，内容唯一基准） vs 参考仓库（~/gitee/8.4.4-5）
> 分类方法：`LC_ALL=C diff -w`（忽略空白）；`<` 行 = 8.4.4-5 独有（en 需删除对应译文），`>` 行 = 8.4.4-4 独有（en 需补译）

## 一、汇总

| 类别 | 数量 | 处理方式 |
|---|---|---|
| 相同（copy-as-is） | **11** | 字节完全相同，en 直接复制，零改动 |
| 仅排版差异（copy-as-is） | **119** | 8.4.4-5 做过「中英文间空格格式化」，diff -w 无差异，en 直接复制，零改动 |
| 小差异（patch，≤10 行） | **98** | 多为版本号（8.4.4-5→8.4.4-4）/错别字修复，英文译文不受影响，抽查核验即可 |
| 中差异（patch，11~50 行） | **71** | 内容有小幅增删/改写，需对照 diff 修补 en（Step 8/9） |
| 大差异（patch，>50 行） | **28** | 多 OS 安装命令、引擎特性、迁移等，重点修补 en（Step 10/11/12） |
| 需新译（new-translate） | **1** | 8.4.4-4 独有文件，8.4.4-5/en 无对应译文，全文新译（Step 13） |
| 8.4.4-5 独有（跳过） | **6** | Out of scope：8.4.4-5 新增特性/发行说明，不纳入本仓库 |
| **合计** | **328** | copy-as-is 130 + patch 197 + new-translate 1 |

## 二、分类明细

### identical（11）

- `5-enhance/5-4-security.md`
- `12-dev-guide/12-1-connect-to-greatsql.md`
- `12-dev-guide/12-3-data-modify.md`
- `12-dev-guide/12-4-data-read.md`
- `13-reference/2-keywords.md`
- `13-reference/4-features.md`
- `13-reference/5-sql-compat.md`
- `13-reference/6-sql-dev.md`
- `14-greatsql-demo/greatsql-live-demo.md`
- `14-greatsql-demo/greatsql-live-mgr.md`
- `14-greatsql-demo/greatsql-live-sql.md`

### formatting-only（119）

- `1-docs-intro/1-docs-intro.md`
- `2-about-greatsql/1-greatsql-brief-intro.md`
- `2-about-greatsql/5-greatsql-limitations.md`
- `2-about-greatsql/7-greatsql-keywords.md`
- `3-quick-start/3-quick-start.md`
- `4-install-guide/0-install-guide.md`
- `4-install-guide/7-load-sampledb.md`
- `5-enhance/5-1-highperf-nonblocking-ddl.md`
- `5-enhance/5-1-highperf-parallel-load.md`
- `5-enhance/5-2-ha-binlog-speed-limit.md`
- `5-enhance/5-2-ha-mgr-improved.md`
- `5-enhance/5-2-ha-mgr-new-fc.md`
- `5-enhance/5-2-ha-mgr-request-time.md`
- `5-enhance/5-2-ha-repl-server-mode.md`
- `5-enhance/5-2-ha.md`
- `5-enhance/5-5-others.md`
- `5-enhance/5-enhance.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-cast.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-chr.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-initcap.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-instr.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-instrb.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-lpad.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-monthsbetween.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-nchr.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-nvl.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-rawtohex.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-regexpreplace.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-sysdate.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-systimestamp.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-tonumber.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-totimestamp.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-vsize.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-anony-block.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-create-or-replace.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-cursor.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-exception-handler.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-exit-when.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-for-loop.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-forall-loop.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-named-parameters.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-record-type.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-ref-cursor.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-return.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-var-type.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-any-all.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-datetime-interval.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-default-val-curtime.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-delete-without-from.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-forupdate-ofcolumn.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-full-join.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-hint.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-insert-all.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-keep.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-minus.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-offset-fetch.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-oracle-exec.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-oraclemode-nullequal.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-oraclemode.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-order-by.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-psname-quotes.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-ratiotoreport.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-subquery-without-alias.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-table-func.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-table-oftype.md`
- `6-oper-guide/0-oper-guide.md`
- `6-oper-guide/4-backup-and-restore.md`
- `6-oper-guide/6-1-3-table-statistics.md`
- `6-oper-guide/6-4-extended-innodb-status.md`
- `6-oper-guide/6-5-extended-show-grants.md`
- `6-oper-guide/6-6-handle-corrupted-tables.md`
- `6-oper-guide/6-7-kill-idle-trx.md`
- `9-ha/0-ha.md`
- `9-ha/2-ha-single-idc.md`
- `9-ha/3-ha-same-city-multi-idc.md`
- `9-ha/4-ha-multi-city-multi-idc.md`
- `10-optimize/0-optimize.md`
- `10-optimize/2-1-schema-design-refer.md`
- `10-optimize/2-2-sql-develop-refer.md`
- `10-optimize/3-1-benchmark-sysbench.md`
- `10-optimize/3-2-benchmark-tpch.md`
- `10-optimize/3-3-benchmark-greatsql-tpch-report.md`
- `10-optimize/3-4-benchmarksql.md`
- `10-optimize/3-5-benchmark-greatsql-vs-mysql-tpcc-report.md`
- `10-optimize/3-6-benchmark-greatsql-tpch-turbo-report.md`
- `10-optimize/3-performance-benchmark.md`
- `11-faq/0-faq.md`
- `12-dev-guide/12-1-2-cw-gui.md`
- `12-dev-guide/12-1-4-cw-threadpool.md`
- `12-dev-guide/12-1-5-cw-charset.md`
- `12-dev-guide/12-1-6-sql-mode.md`
- `12-dev-guide/12-2-1-dp-guide.md`
- `12-dev-guide/12-2-10-datatype.md`
- `12-dev-guide/12-2-2-dp-schema.md`
- `12-dev-guide/12-2-3-dp-table.md`
- `12-dev-guide/12-2-4-dp-index.md`
- `12-dev-guide/12-2-5-dp-view.md`
- `12-dev-guide/12-2-6-dp-stored-routines.md`
- `12-dev-guide/12-2-7-dp-trigger.md`
- `12-dev-guide/12-2-8-dp-event.md`
- `12-dev-guide/12-2-9-dp-partition.md`
- `12-dev-guide/12-3-1-data-insert.md`
- `12-dev-guide/12-3-2-data-update.md`
- `12-dev-guide/12-3-3-data-delete.md`
- `12-dev-guide/12-3-5-data-prepare.md`
- `12-dev-guide/12-4-1-data-select-single-table.md`
- `12-dev-guide/12-4-5-window-funcs.md`
- `12-dev-guide/12-6-trx-overview.md`
- `12-dev-guide/12-7-1-sql-optimize-schema-design.md`
- `12-dev-guide/12-7-2-sql-optimize-sql-dev.md`
- `12-dev-guide/12-7-3-sql-optimize-engines.md`
- `12-dev-guide/12-7-4-sql-optimize-slowsql.md`
- `12-dev-guide/12-7-sql-optimize-overview.md`
- `12-dev-guide/12-8-1-error-code-reference.md`
- `12-dev-guide/12-8-2-error-connection-failure.md`
- `12-dev-guide/12-8-3-error-create-write.md`
- `12-dev-guide/12-8-4-error-select.md`
- `12-dev-guide/12-8-5-error-other.md`
- `12-dev-guide/12-dev-guide.md`

### small-patch（98）

- `1-docs-intro/1-2-release-history.md`
- `1-docs-intro/1-4-issues-known.md`
- `1-docs-intro/relnotes/changes-greatsql-5-7-36-20220407.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-25-17-20230313.md`
- `2-about-greatsql/0-about-greatsql.md`
- `2-about-greatsql/2-greatsql-product-positioning.md`
- `2-about-greatsql/3-greatsql-arch.md`
- `2-about-greatsql/4-4-greatsql-relay-log.md`
- `2-about-greatsql/4-7-greatsql-general-log.md`
- `2-about-greatsql/4-greatsql-log.md`
- `4-install-guide/10-uninstall-greatsql.md`
- `4-install-guide/3-install-with-tarball.md`
- `5-enhance/5-1-highperf-ap-supported-functions.md`
- `5-enhance/5-1-highperf-thread-pool.md`
- `5-enhance/5-1-highperf.md`
- `5-enhance/5-2-ha-mgr-arbitrator.md`
- `5-enhance/5-2-ha-mgr-election-mode.md`
- `5-enhance/5-2-ha-mgr-fast-mode.md`
- `5-enhance/5-2-ha-mgr-kill-conn-after-switch.md`
- `5-enhance/5-2-ha-mgr-zoneid.md`
- `5-enhance/5-4-security-clone-encrypt.md`
- `5-enhance/5-4-security-last-login.md`
- `5-enhance/5-4-security-mysqldump-encrypt.md`
- `5-enhance/5-5-innodb-page-compression.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-addmonths.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-currenttimestamp.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-decode.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-dump.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-listagg.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-nvl2.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-regexpcount.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-replace.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-rpad.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-sqlcode-sqlerrm.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-substr.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-substrb.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-sysguid.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-tochar.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-toclob.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-todate.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-trunc.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-wmconcat.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-basic-constructs.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-bulk-collect.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-continue.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-default-optval.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-goto-label.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-if.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-table-type.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-trigger.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-sp-while.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-create-type.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-createforceview.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-datetime-arithmetic.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-empstr-equal-null.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-execute-immediate.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-explain-plan-for.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-external-table.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-forupdate-waitn.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-merge-into.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-oracle-comment.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-oracle-plus.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-pivot.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-rownum.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-sequence.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-shrinkmode.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-sysdateisnow.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-table-udt.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-update-set.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-with-func.md`
- `6-oper-guide/10-2-pt-configuration.md`
- `6-oper-guide/10-percona-toolkit.md`
- `6-oper-guide/6-1-1-client-statistics.md`
- `6-oper-guide/6-1-2-index-statistics.md`
- `6-oper-guide/6-1-4-thread-statistics.md`
- `6-oper-guide/6-1-5-user-statistics.md`
- `6-oper-guide/6-1-user-statistics.md`
- `6-oper-guide/6-2-procfs-plugin.md`
- `6-oper-guide/6-3-compressed-columns.md`
- `6-oper-guide/6-8-other-tables.md`
- `6-oper-guide/6-feature-enhancement.md`
- `6-oper-guide/7-avoid-mistakes.md`
- `6-oper-guide/9-daily-health-check.md`
- `7-migrate-and-upgrade/0-migrate-and-upgrade.md`
- `8-mgr/0-mgr-fundamentals.md`
- `8-mgr/6-mgr-data-security.md`
- `8-mgr/7-mgr-performance-tuning.md`
- `8-mgr/8-mgr-best-practices.md`
- `10-optimize/2-7-mdllock-diag.md`
- `10-optimize/2-greatsql-optimize.md`
- `12-dev-guide/12-3-4-data-replace.md`
- `12-dev-guide/12-3-6-gen-random-data.md`
- `12-dev-guide/12-3-7-gen-sysbench-data.md`
- `12-dev-guide/12-4-3-data-select-subquery.md`
- `12-dev-guide/12-6-1-trx-control.md`
- `12-dev-guide/12-6-4-trx-troubleshoot.md`
- `13-reference/3-variables.md`
- `13-reference/8-credential-and-honor.md`

### medium-patch（71）

- `1-docs-intro/1-1-notes-to-users.md`
- `1-docs-intro/1-5-glossary.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-25-16-20220516.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-25-20210820.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-32-27.md`
- `1-docs-intro/relnotes/changes-greatsql-8444.md`
- `2-about-greatsql/4-1-greatsql-error-log.md`
- `2-about-greatsql/4-2-greatsql-slow-log.md`
- `2-about-greatsql/4-3-greatsql-binary-log.md`
- `2-about-greatsql/4-5-greatsql-redo-log.md`
- `2-about-greatsql/4-6-greatsql-undo-log.md`
- `3-quick-start/3-3-quick-start-with-docker.md`
- `3-quick-start/3-4-quick-start-with-cnf.md`
- `3-quick-start/3-5-quick-start-dbrw.md`
- `4-install-guide/1-install-prepare.md`
- `4-install-guide/5-install-with-ansible.md`
- `4-install-guide/8-greatsql-with-systemd.md`
- `4-install-guide/9-custom-cnf-file-path.md`
- `5-enhance/5-1-highperf-async-purge-big-table.md`
- `5-enhance/5-1-highperf-innodb-pq.md`
- `5-enhance/5-1-highperf-numa-affinity.md`
- `5-enhance/5-3-easyuse.md`
- `5-enhance/5-3-sql-compat-faq.md`
- `5-enhance/5-4-security-audit.md`
- `5-enhance/5-4-security-data-masking.md`
- `5-enhance/5-5-clone-compressed-and-incrment-backup.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-datatypes.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-length.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-lengthb.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-translate.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-func-trim.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-global-temptable.md`
- `5-enhance/sql-compat/5-3-easyuse-ora-syntax-hierarchical-query.md`
- `6-oper-guide/1-basic-oper.md`
- `6-oper-guide/10-3-pt-monitoring.md`
- `6-oper-guide/10-4-pt-system.md`
- `6-oper-guide/10-5-pt-development.md`
- `6-oper-guide/10-6-pt-replication.md`
- `6-oper-guide/10-7-pt-performance.md`
- `6-oper-guide/2-oper-rw-splitting.md`
- `6-oper-guide/3-monitoring-and-alerting.md`
- `6-oper-guide/4-1-mysqldump.md`
- `6-oper-guide/4-2-outfile.md`
- `6-oper-guide/4-3-shell-util.md`
- `6-oper-guide/4-4-physical-backup.md`
- `6-oper-guide/4-5-clone.md`
- `6-oper-guide/5-multi-instances.md`
- `6-oper-guide/8-troubleshooting.md`
- `7-migrate-and-upgrade/4-migrate-from-mariadb-to-greatsql.md`
- `8-mgr/1-mgr-introduction.md`
- `8-mgr/3-mgr-maintain-admin.md`
- `8-mgr/4-mgr-status-monitor.md`
- `8-mgr/5-mgr-readwrite-split.md`
- `9-ha/1-ha-single-machine-multi-instance.md`
- `9-ha/5-ha-single-vlan.md`
- `10-optimize/1-hardware-and-os-optimize.md`
- `10-optimize/2-4-slow-update-diag.md`
- `10-optimize/2-6-deadlock-diag.md`
- `10-optimize/3-7-benchmark-greatsql-vs-mysql-tpcc-wh1000-report.md`
- `11-faq/1-faq-greatsql.md`
- `11-faq/2-faq-mgr-oper.md`
- `11-faq/3-faq-mgr-arch.md`
- `11-faq/4-faq-mgr-monitor.md`
- `12-dev-guide/12-1-1-cw-cli.md`
- `12-dev-guide/12-1-3-cw-drive.md`
- `12-dev-guide/12-4-2-data-select-multi-table.md`
- `12-dev-guide/12-6-2-trx-isolation.md`
- `13-reference/1-index.md`
- `13-reference/7-why-upgrade-to-greatsql80.md`

### large-patch（28）

- `1-docs-intro/1-3-greatsql-features.md`
- `1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605.md`
- `3-quick-start/3-1-quick-start-with-rpm.md`
- `3-quick-start/3-2-quick-start-with-tarball.md`
- `4-install-guide/2-install-with-rpm.md`
- `4-install-guide/3-1-centos-install.md`
- `4-install-guide/3-2-ubuntu-install.md`
- `4-install-guide/3-3-openeuler-install.md`
- `4-install-guide/3-4-uos-install.md`
- `4-install-guide/3-5-anolis-install.md`
- `4-install-guide/3-6-kylin-install.md`
- `4-install-guide/3-7-arch-install.md`
- `4-install-guide/4-install-with-docker.md`
- `4-install-guide/6-install-with-source-code.md`
- `5-enhance/5-1-highperf-rapid-engine.md`
- `5-enhance/5-1-highperf-turbo-engine.md`
- `5-enhance/5-2-ha-mgr-vip.md`
- `5-enhance/5-4-security-encrypt-with-gmssl.md`
- `6-oper-guide/10-1-pt-practical.md`
- `7-migrate-and-upgrade/1-upgrade-to-greatsql8.md`
- `7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql.md`
- `7-migrate-and-upgrade/3-migrate-from-percona-to-greatsql.md`
- `8-mgr/2-mgr-install-deploy.md`
- `10-optimize/2-5-rowlock-diag.md`
- `11-faq/5-faq-others.md`
- `12-dev-guide/12-4-4-functions.md`
- `12-dev-guide/12-6-3-trx-mvcc-and-locking.md`
- `README.md`

### new-translate（1）

- `6-oper-guide/11-gt-checksum.md`

### skip-8445-only（6）

- `1-docs-intro/relnotes/changes-greatsql-8445.md`
- `5-enhance/5-1-highperf-binlog-flush-opt-large-trx.md`
- `5-enhance/5-1-highperf-execplan-baseline.md`
- `5-enhance/5-1-highperf-parallel-replica.md`
- `5-enhance/5-1-highperf-vector-search.md`
- `5-enhance/5-2-ha-repl-interface-cmd.md`

## 三、说明

- 内容基准 = 本仓库（8.4.4-4）中文文件；8.4.4-5/en 译文仅在「与 8.4.4-4 中文一致」的前提下复用；
- copy-as-is 两类：en 从 8.4.4-5/en 按同名路径直接复制；
- patch 三类：以 `diff -w 8.4.4-5/zh 8.4.4-4/zh` 为输入逐文件修补 en（`>` 行补译、`<` 行删除、改动行改写）；
- new-translate：`6-oper-guide/11-gt-checksum.md` 全文新译（Step 13）；
- skip-8445-only：6 个 8.4.4-5 新增特性/发行说明文件，不纳入本仓库（Out of scope）。
