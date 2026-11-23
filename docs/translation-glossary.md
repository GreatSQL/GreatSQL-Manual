# 翻译术语表与翻译规范（Translation Glossary & Guidelines）

> 创建日期：2026-11-19
> 用途：作为全量英文翻译（Phase 2，共 333 个文件）的**唯一译法基准**。所有翻译步骤必须先查本表，禁止自行发明译法。
> 术语基准：**MySQL 官方文档（dev.mysql.com/doc）用语** + GreatSQL 官方术语（`1-docs-intro/1-5-glossary.md`、`scripts/translate-sidebar-titles.js` 标题映射表）。
> 维护：审校步骤（Step 35 / 8.4.4-4 移植 Step 15）发现新术语时补充本表；修订后所有后续翻译批次立即生效。
> 8.4.4-4 移植审校（2026-11-23）：本仓库复用 8.4.4-5 已定稿术语表，抽查 8-mgr、12-6-3、rapid-engine、sql-compat 全部通过，未引入新术语（新译 gt-checksum 文件所用 checksum/repair/consistency 均已收录于 2.4/2.11），无需增补条目。

---

## 一、术语一致性优先级

1. **本表（docs/translation-glossary.md）** > `1-docs-intro/1-5-glossary.md`（英文术语已定） > MySQL/GreatSQL 官方文档；
2. H1 标题译法必须与 `sidebar-en.js` 对应条目**逐字一致**（VuePress 侧边栏与页面标题联动）；
3. 同一术语在正文与标题中允许大小写差异（见「五、大小写与书写规范」），但**拼写必须一致**。

---

## 二、核心术语对照表

> 译法标注「官方」= 与 MySQL/GreatSQL 官方文档一致；「固定」= 产品/专有名词，任何语境保持原样。

### 2.1 产品四大特性（高频，标题用）

| 中文 | 英文（标题/正文） | 说明 |
| --- | --- | --- |
| 高可用 | High Availability | 官方（MySQL 官方有 High Availability 章节） |
| 高性能 | High Performance | 官方 |
| 高兼容 | High Compatibility | 官方风格 |
| 高安全 | High Security | 官方风格 |
| 高可用架构 | High Availability Architecture | 章节标题（9-ha） |
| 快速上手 | Quick Start | 章节标题（3-quick-start） |

### 2.2 MGR / 复制 / 高可用（术语最密集区）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 组复制 | Group Replication | 官方，MySQL Group Replication 简称 MGR/GR |
| 主从复制 | source-replica replication | MySQL 8.0+ 官方新术语；文中可括注 (also known as master-slave replication) |
| 半同步复制 | semi-synchronous replication | 官方 |
| 异步复制 | asynchronous replication | 官方 |
| 全同步复制 | fully synchronous replication | 官方语境（MGR 常被描述为全同步复制） |
| 仲裁节点 | arbitrator | GreatSQL 固定术语（`1-5-glossary.md` 已定） |
| 投票节点 | voting node | arbitrator 的别称，首次出现可括注 |
| 选主 / 选主策略 | primary election / primary election mode | 官方（group_replication_primary_election_mode） |
| 智能选主 | smart primary election | 固定（sidebar 标题） |
| 自定义选主模式 | custom primary election mode | 固定 |
| 快速单主模式 | fast single-primary mode | 固定（sidebar 标题：MGR Fast Single-Primary Mode） |
| 流控 | flow control | 官方（group_replication_flow_control_*） |
| 全新流控算法 | new flow control algorithm | 固定（sidebar 标题） |
| 地理标签 | zone id | 固定（`1-5-glossary.md` 已定；sidebar：MGR Zone Tags） |
| 多数派 | majority | 官方（Paxos 多数派投票） |
| 共识 | consensus | 官方（`1-5-glossary.md` 已定） |
| 新加入节点 | joiner | 固定（`1-5-glossary.md` 已定） |
| 数据提供节点 | donor | 固定（`1-5-glossary.md` 已定） |
| 成员 / 节点 | member | 固定（`1-5-glossary.md` 已定） |
| 主节点 | primary | 固定（`1-5-glossary.md` 已定） |
| 从节点 | secondary | 固定（`1-5-glossary.md` 已定） |
| 切主 / 主切换 | primary switchover | 固定（sidebar：After MGR Primary Switchover） |
| 故障转移 | failover | 官方 |
| 读写分离 | read/write splitting | 行业通用，官方语境可用 read-write splitting |
| 虚拟 IP | virtual IP（VIP） | 固定缩写（`1-5-glossary.md` 已定） |
| 节点加入/离开 | node join/leave | 官方 |
| 事务认证队列 | transaction certification queue | 官方（MGR certification） |
| 网络开销阈值 | network overhead threshold | 固定（sidebar 标题） |
| 主主复制防止回路 | loop prevention in primary-primary replication | 固定（sidebar 标题） |

### 2.3 日志体系（2-about-greatsql 章节）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 错误日志 | error log | 官方（sidebar：Error Log） |
| 慢查询日志 | slow query log | 官方（sidebar：Slow Query Log） |
| 二进制日志 | binary log | 官方（sidebar：Binary Log） |
| 中继日志 | relay log | 官方（sidebar：Relay Log） |
| 重做日志 | redo log | 官方（sidebar：Redo Log） |
| 撤销日志 | undo log | 官方（sidebar：Undo Log） |
| 通用日志 | general log | 官方（sidebar：General Log） |
| 审计日志 | audit log | 官方 |
| 日志回放 | log replay / replay | 官方 |
| binlog 刷盘 | binlog flush | 官方（binlog flush optimization） |

### 2.4 备份与恢复（6-oper-guide 章节）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 备份 | backup | 官方 |
| 恢复 | restore | 官方 |
| 物理备份 | physical backup | 官方 |
| 逻辑备份 | logical backup | 官方 |
| 克隆备份 | Clone backup | Clone 为官方插件专有名词，固定大写 |
| 全量备份 | full backup | 官方 |
| 增量备份 | incremental backup | 官方 |
| 备份加密 | backup encryption | 官方（mysqldump backup encryption / Clone backup encryption） |
| 压缩 | compression | 官方 |
| 页压缩 | page compression | 官方（InnoDB Page Compression） |
| 快照 | snapshot | 官方 |
| 校验和 | checksum | 官方 |
| 崩溃恢复 | crash recovery | 官方 |
| 数据一致性 | data consistency | 官方 |
| 备份恢复（总称） | Backup & Restore | sidebar 标题 |

### 2.5 性能与优化（5-enhance / 10-optimize / 12-dev-guide 章节）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 并行查询 | parallel query | 官方（PQ = parallel query，`1-5-glossary.md` 已定） |
| 线程池 | thread pool | 官方（MySQL Enterprise Thread Pool） |
| 无锁事务 | lock-free transactions | 固定（GreatSQL 特性） |
| 非阻塞式 DDL | non-blocking DDL | 官方（online DDL 同义） |
| 在线 DDL | online DDL | 官方 |
| 异步删除大表 | asynchronous drop of large tables | 固定（sidebar 标题） |
| NUMA 亲和性 | NUMA affinity | 官方 |
| 大事务 binlog 独立落盘 | large transaction binlog independent flush | 固定（sidebar 标题） |
| 并行复制回放 | parallel replication replay | 固定（sidebar 标题） |
| 执行计划 | execution plan | 官方 |
| 执行计划基线 | execution plan baseline | 固定（sidebar：Execution Plan Drift Detection） |
| 执行计划漂移 / 变更异常捕获 | execution plan drift | 固定 |
| 优化器 | optimizer | 官方 |
| 基数 | cardinality | 官方 |
| 直方图 | histogram | 官方 |
| 采样 | sampling | 官方 |
| 索引 | index | 官方 |
| 全文索引 | full-text index | 官方 |
| 倒排索引 | inverted index | 官方（Rapid Engine 相关） |
| 联合索引 | composite index | 官方（亦称 multi-column index） |
| 覆盖索引 | covering index | 官方 |
| 主键 | primary key | 官方 |
| 外键 | foreign key | 官方 |
| 唯一键 | unique key | 官方 |
| 向量相似度检索 | vector similarity search | 固定（sidebar：Turbo Engine Vector Similarity Search） |
| 扫描 | scan | 官方 |
| 过滤 | filter | 官方 |
| 条件下推 | condition pushdown / predicate pushdown | 官方 |
| 物化 | materialization | 官方 |
| 半连接 | semi-join | 官方 |
| 缓冲池 | buffer pool | 官方（InnoDB Buffer Pool） |
| 吞吐量 | throughput | 官方 |
| 延迟 | latency | 官方 |
| 并发 | concurrency | 官方 |
| 连接池 | connection pool | 官方 |
| 锁等待 | lock wait | 官方 |
| 慢 SQL / 慢查询 | slow SQL / slow query | 官方 |

### 2.6 事务与锁（12-dev-guide 12-6 章节）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 事务 | transaction | 官方 |
| 事务隔离级别 | transaction isolation level | 官方 |
| 读未提交 | READ UNCOMMITTED | 官方（SQL 标准隔离级别，全大写） |
| 读已提交 | READ COMMITTED | 官方 |
| 可重复读 | REPEATABLE READ | 官方 |
| 串行化 | SERIALIZABLE | 官方 |
| 多版本并发控制 | multi-version concurrency control（MVCC） | 官方 |
| 行锁 | row lock | 官方 |
| 表锁 | table lock | 官方 |
| 间隙锁 | gap lock | 官方 |
| 临键锁 | next-key lock | 官方 |
| 元数据锁 | metadata lock | 官方 |
| 死锁 | deadlock | 官方 |
| 锁等待超时 | lock wait timeout | 官方（innodb_lock_wait_timeout） |
| 提交 | commit | 官方 |
| 回滚 | rollback | 官方 |
| 脏读 | dirty read | 官方 |
| 不可重复读 | non-repeatable read | 官方 |
| 幻读 | phantom read | 官方 |
| 一致性读 | consistent read | 官方 |
| 快照读 | snapshot read | 官方 |
| 当前读 / 锁定读 | current read / locking read | 官方 |

### 2.7 安全（5-enhance 5-4 章节）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 审计 | auditing | 官方（审计功能）；审计日志=audit log |
| 数据脱敏 / 数据屏蔽 | data masking | 官方（MySQL 官方 data masking 组件） |
| 国密算法 | national cryptographic algorithms（SM2/SM3/SM4） | 固定（sidebar：GMSSL (National Cryptography) Support） |
| 加密 | encryption | 官方 |
| 解密 | decryption | 官方 |
| 密钥 | encryption key | 官方 |
| 证书 | certificate | 官方 |
| 认证 | authentication | 官方 |
| 授权 | grant / authorization | 官方（GRANT 语句用 grant） |
| 权限 | privileges | 官方 |
| 白名单 | allowlist | 官方新术语 |
| 黑名单 | blocklist | 官方新术语 |
| 访问控制 | access control | 官方 |
| 最后登录时间 | last login time | 固定（sidebar：Last Login） |
| 会话 | session | 官方 |
| 掩码 | mask / masking | 官方 |

### 2.8 数据库对象与 SQL（12-dev-guide 章节）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 数据库 | database | 官方 |
| 模式 / Schema | schema | 官方（sidebar：Schema/Database Management） |
| 表 | table | 官方 |
| 视图 | view | 官方（sidebar：Views） |
| 存储过程 | stored procedure | 官方 |
| 存储函数 | stored function | 官方 |
| 存储程序（统称） | stored routines | 官方（sidebar：Stored Routines） |
| 触发器 | trigger | 官方（sidebar：Triggers） |
| 事件调度器 | event scheduler | 官方（sidebar：Event Scheduler） |
| 分区 | partitioning | 官方（sidebar：PARTITION） |
| 数据类型 | data type | 官方（sidebar：Data Types） |
| 字符集 | character set | 官方 |
| 校验集 / 排序规则 | collation | 官方 |
| 预处理语句 | prepared statements | 官方（sidebar：PREPARE Statements） |
| 窗口函数 | window functions | 官方（sidebar：Window Functions） |
| 子查询 | subquery | 官方 |
| 连接查询 | join query | 官方 |
| 派生表 | derived table | 官方 |
| 公用表表达式 | common table expression（CTE） | 官方 |
| 生成列 | generated column | 官方 |
| 默认值 | default value | 官方 |
| 自增 | AUTO_INCREMENT | 官方（SQL 关键字保持原样） |
| 数据写入 / 修改 | data write & modification | sidebar 标题 |
| 数据查询 | data query | sidebar 标题 |
| 单表查询 | single-table query | sidebar 标题 |
| 多表关联查询 | multi-table join query | sidebar 标题 |

### 2.9 Oracle 兼容（5-enhance 5-3 / sql-compat）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| Oracle 兼容 | Oracle compatibility | 固定（sidebar：High Compatibility (Oracle Compatible)） |
| 数据类型兼容 | data type compatibility | sidebar 标题 |
| SQL 语法兼容 | SQL syntax compatibility | sidebar 标题 |
| 函数兼容 | function compatibility | sidebar 标题 |
| 存储程序兼容 | stored routine compatibility | sidebar 标题 |
| 层次查询 | hierarchical query | 官方（Oracle CONNECT BY） |
| 匿名块 | anonymous block | PL/SQL 术语 |
| 游标 | cursor | PL/SQL 术语 |
| 异常处理 | exception handling | PL/SQL 术语 |
| 包（程序包） | package | PL/SQL 术语 |
| 批量收集 | BULK COLLECT | SQL 关键字，保持原样 |
| 记录类型 | record type | PL/SQL 术语 |
| 表类型 | table type | PL/SQL 术语 |
| 变量类型 | variable type | PL/SQL 术语 |
| 外部表 | external table | 官方 |

### 2.10 运维与部署（6-oper-guide / 4-install-guide）

| 中文 | 英文 | 说明 |
| --- | --- | --- |
| 运维管理 | operations & maintenance | sidebar 标题 |
| 监控 | monitoring | 官方 |
| 告警 | alerting | 官方（monitoring & alerting） |
| 巡检 | health check / routine inspection | 官方风格 |
| 故障排查 | troubleshooting | 官方 |
| 安装 | installation | 官方（sidebar：Installation Guide） |
| 升级 | upgrade | 官方 |
| 迁移 | migration | 官方（sidebar：Migration & Upgrade） |
| 卸载 | uninstall | 官方 |
| 多实例 | multiple instances | 官方（multi-instance） |
| 负载均衡 | load balancing | 官方 |
| 容灾 | disaster recovery | 官方 |
| 数据中心 / 机房 | data center | 官方 |
| 多机房 | multi-site / multi-datacenter | 官方风格 |
| 健康检查 | health check | 官方 |
| 每日健康检查 | daily health check | 固定 |
| 压测 / 基准测试 | benchmark | 官方（sidebar：Performance Benchmarking） |

### 2.11 术语 = 英文（保持原样，不翻译）

| 术语 | 说明 |
| --- | --- |
| MGR / GR | MySQL Group Replication 缩写，全文保留 |
| XCom | Paxos 算法在 MGR 中的实现（`1-5-glossary.md` 已定） |
| GCS | Group Communication System（`1-5-glossary.md` 已定） |
| VIP | Virtual IP 缩写（`1-5-glossary.md` 已定） |
| PQ | parallel query 缩写（`1-5-glossary.md` 已定） |
| GMSSL | 国密 SSL 实现，固定（sidebar：GMSSL (National Cryptography) Support） |
| Rapid Engine / Turbo Engine | GreatSQL 自有引擎名，固定（sidebar 同名） |
| InnoDB / MyISAM / NDB / RocksDB | 存储引擎名 |
| mysqldump / mysql / mysqladmin / mysqlslap / mysqlbinlog | 客户端工具名 |
| Percona / Percona Toolkit / pt-archiver 等 pt-\* 工具 | 固定（`1-5-glossary.md` 已定） |
| MariaDB | 固定（`1-5-glossary.md` 已定） |
| gt-checksum | 固定（sidebar 同名） |
| sysbench / BenchmarkSQL / TPC-C / TPC-H / TpmC / QphH | 基准测试工具/指标 |
| SQLSTATE / ER\_xxx 错误符号 | 固定（错误码文件） |
| utf8mb4 / gbk / latin1 等字符集名 | 固定 |
| systemd / systemctl / rpm / yum / dnf / apt / podman / Docker / Ansible | 部署工具/命令 |
| group\_replication\_\* 等系统变量名 | 固定 |
| PL/SQL | 保持原样 |
| BULK COLLECT / FORALL 等 PL/SQL 关键字 | SQL 关键字一律不译 |

---

## 三、翻译保护规则（所有步骤强制）

1. **代码块**（``` 围栏，含 SQL、bash、配置文件、命令输出）：**代码、命令、输出、文件路径一律不译**；**代码块内的注释文字**（`--`、`#`、`/* */` 注释）**可译为英文**（便于英文读者理解，全站已统一执行）；**测试数据/字符串值**（如 `SELECT '测试'`、`maskall('GreatSQL 数据库')` 的中文参数、示例表数据）**必须原样保留**；
2. **行内代码**（反引号 `` ` `` 包裹）不译；
3. **命令、文件名、URL、路径**不译（含 `systemctl`、`my.cnf`、`/etc/my.cnf`、`https://...`、`../xxx.md`）；
4. **图片引用** `![alt](path)`：**path 不译**，alt 文本可译；
5. **表格**（`|` 分隔）保持列数与结构不变，仅译单元格文本；
6. **内部相对链接路径不变，只译链接文字**（如 `[高可用](../9-ha/0-ha.md)` → `[High Availability](../9-ha/0-ha.md)`）；
7. **H1 标题**与 `sidebar-en.js` 对应条目一致；
8. 只允许翻译：正文、标题、表格单元格、列表项、图片 alt、链接文字。

## 四、锚点与链接处理规则

1. VuePress 页内锚点由 **H2/H3 标题文本自动生成**：英文标题翻译后，站内 `#锚点` 链接的锚点段必须与目标标题译法**保持一致**（链接文字可译，`#` 后锚点须与目标标题对应）；
2. 站内相对链接（`../xxx.md`、`/en/xxx.html`）路径与中文镜像**逐字节一致**，仅译链接文字；
3. 跨章节交叉引用（如 `../5-enhance/5-2-ha-mgr-arbitrator.md#...`）路径不动，目标锚点需确认已在目标文件英文版中同步翻译；
4. 外链（`http/https`）不译、不改。

## 五、大小写与书写规范

1. **标题（H1/H2/H3）**：Title Case，如 `High Availability`、`MGR Fast Single-Primary Mode`；
2. **正文**：普通术语用小写（如 "high availability"）；**专有特性/产品名固定大写**（Rapid Engine、Turbo Engine、Clone、MGR、Group Replication、InnoDB）；
3. 缩写首次出现给全称并括注缩写：`parallel query (PQ)`、`MySQL Group Replication (MGR)`、`Virtual IP (VIP)`、`Group Communication System (GCS)`；后续直接用缩写；
4. 数字、版本号、日期格式不变（`8.4.4-5`、`2026-11-19`、`3306`）；
5. 错误码符号 `ER_xxx`、`SQLSTATE` 保持原样；函数名（`ADD_MONTHS()` 等）不译；
6. 中英文混排规则：术语首次出现可括注中文原文（如 `read/write splitting（读写分离）`），便于读者对照，后续直接使用英文。

## 六、验收检查清单（每个翻译步骤执行）

1. `node scripts/check-translation.js <章节路径>`：该批文件残留中文为 0（代码块/占位文案除外）；
2. `node scripts/check-translation.js --codeblocks <章节路径>`：代码块内注释类中文应为 0（数据类中文允许保留）；
2. H1 与 `sidebar-en.js` 对应条目一致；
3. 表格列数与中文原文件一致；
4. 抽查代码块、行内代码、链接路径未被误译；
5. 抽查高频术语与 MySQL 官方用语一致（重点见下）。

## 七、高频术语抽查清单（20 个，人工评审用）

| # | 中文 | 标准译法 |
| --- | --- | --- |
| 1 | 高可用 | High Availability |
| 2 | 组复制 | Group Replication |
| 3 | 二进制日志 | binary log |
| 4 | 慢查询日志 | slow query log |
| 5 | 并行查询 | parallel query |
| 6 | 读写分离 | read/write splitting |
| 7 | 事务隔离级别 | transaction isolation level |
| 8 | 死锁 | deadlock |
| 9 | 仲裁节点 | arbitrator |
| 10 | 地理标签 | zone id |
| 11 | 快速单主模式 | fast single-primary mode |
| 12 | 数据脱敏 | data masking |
| 13 | 国密 | GMSSL / national cryptographic algorithms (SM2/SM3/SM4) |
| 14 | 审计 | auditing |
| 15 | 克隆备份 | Clone backup |
| 16 | 线程池 | thread pool |
| 17 | 无锁事务 | lock-free transactions |
| 18 | 主从复制 | source-replica replication |
| 19 | 物理备份 / 逻辑备份 | physical backup / logical backup |
| 20 | 存储程序 | stored routines |
