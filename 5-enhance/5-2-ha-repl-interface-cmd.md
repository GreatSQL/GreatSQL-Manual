# 恢复部分主从复制兼容接口
---

## 一、升级语法变更带来的运维痛点

从 8.4 版本起全面改用 `Source/Replica` 标准化复制术语，同步废弃旧版 `Master/Slave` 全套复制语法、状态字段、全局状态变量、报错文案。

线上普遍存在大量长期运行运维脚本、监控采集程序、自动化发布平台、巡检工具，全部依赖 `CHANGE MASTER TO`、`SHOW SLAVE STATUS`、`Slave_*` 状态变量等旧接口。

版本升级后会出现以下问题：
1. 存量运维脚本直接执行报错，自动化复制管理流程失效；
2. 监控程序读取不到复制延迟、IO/SQL线程状态，监控面板断数据；
3. 批量变更、灾备切换、数据同步脚本需要大规模重构，改造成本极高；
4. 客户侧自研运维平台、中间件适配工作量大，拉长数据库升级周期。

原有方案只能全部改写脚本适配新版 `Source/Replica` 语法，人力与时间成本高，因此 **恢复Master/Slave旧版复制兼容接口**特性，新旧两套语法完全并行共存，无需改造存量运维代码。

## 二、Master/Slave兼容接口特性介绍

本特性为内核复制兼容增强层，不改动底层复制同步核心逻辑，仅在 SQL 解析、结果输出、错误提示外层做双向映射适配：
1. 完整恢复以前高频使用的 `Master/Slave` 复制管理 SQL 语法，新旧语法均可正常执行；
2. `SHOW SLAVE STATUS`、`SHOW MASTER STATUS` 输出结果兼容旧字段名、字段顺序；
3. 同步保留 `Slave_*` 系列全局状态变量，与新版 `Replica_*` 变量数据实时双向同步；
4. 旧语法执行报错时，返回历史兼容错误码与 Master/Slave 风格提示文本；
5. 新旧语法完全隔离互不干扰，底层复用同一套复制执行逻辑，性能无损耗、数据一致性不受影响。

整体架构分层：
1. **语法兼容层**：Lex/Yacc 解析器恢复 `MASTER`/`SLAVE` 关键字与完整旧语法规则，识别旧语句并打上标记；
2. **参数映射层**：旧版 `MASTER_XXX` 参数自动转换为新版 `SOURCE_XXX` 内部参数，调用统一复制底层逻辑；
3. **输出适配层**：根据语法标记，动态转换查询字段名、状态变量名称、报错文案，分别输出两套术语风格。

## 三、完整兼容语法清单

### 3.1 复制管理语句新旧对应

| 旧版Master/Slave语法 | 新版Source/Replica标准语法 |
|---------------------|---------------------------|
| `CHANGE MASTER TO` | `CHANGE REPLICATION SOURCE TO` |
| `START SLAVE` | `START REPLICA` |
| `STOP SLAVE` | `STOP REPLICA` |
| `RESET SLAVE` | `RESET REPLICA` |
| `SHOW SLAVE STATUS` | `SHOW REPLICA STATUS` |
| `SHOW SLAVE HOSTS` | `SHOW REPLICAS` |
| `RESET MASTER` | `RESET BINARY LOGS AND GTIDS` |
| `SHOW MASTER STATUS` | `SHOW BINARY LOG STATUS` |
| `SHOW MASTER LOGS` | `SHOW BINARY LOGS` |
| `PURGE MASTER LOGS` | `PURGE BINARY LOGS` |

### 3.2 CHANGE MASTER TO 参数映射
旧 `MASTER_*` 选项会自动映射为内部 `SOURCE_*` 参数，完整兼容：`MASTER_HOST`/`MASTER_USER`/`MASTER_PASSWORD`/`MASTER_PORT`/`MASTER_AUTO_POSITION`/`MASTER_LOG_FILE`/`MASTER_LOG_POS`/`MASTER_CONNECT_RETRY`/`MASTER_RETRY_COUNT`/`MASTER_DELAY`/SSL全套参数/压缩参数/心跳参数/公钥参数等。

## 四、使用示例

### 示例1：使用旧版语法搭建主从复制（存量脚本无需修改）
```sql
CHANGE MASTER TO
MASTER_HOST='127.0.0.1',
MASTER_PORT=3306,
MASTER_USER='repl',
MASTER_PASSWORD='xxx',
MASTER_AUTO_POSITION=1;

START SLAVE;
SHOW SLAVE STATUS\G
```

执行后返回结果字段为 `Slave_IO_State`、`Master_Host` 等旧版名称，兼容旧采集逻辑。

### 示例 2：新版标准语法不受任何影响
```sql
CHANGE REPLICATION SOURCE TO
SOURCE_HOST='127.0.0.1',
SOURCE_PORT=3306,
SOURCE_USER='repl',
SOURCE_PASSWORD='xxx',
SOURCE_AUTO_POSITION=1;

START REPLICA;
SHOW REPLICA STATUS\G
```
输出字段为 `Replica_IO_State`、`Source_Host` 新版标准命名，两套语法可在同一实例交替使用。

### 示例 3：全局状态变量兼容查询
```sql
# 旧版兼容变量，与新版实时同步
SHOW STATUS LIKE 'Slave%';
# 新版标准变量
SHOW STATUS LIKE 'Replica%';
```

两组变量数值完全一致，监控可任选一套采集。

## 五、核心兼容适配逻辑
### 5.1 SQL 语法识别逻辑

SQL 解析阶段区分新旧语法：
1. 若匹配 `MASTER/SLAVE` 旧关键字，标记 `m_is_replication_deprecated_syntax_used = true`；
2. 参数映射模块将所有 `MASTER_XXX` 配置项转换为底层统一 `SOURCE_XXX` 结构；
3. 底层复用完全相同的复制调度、IO/SQL 线程、GTID 同步逻辑，无差异化执行分支。

### 5.2 查询结果字段适配逻辑

内置字段映射对照表，旧语法查询时自动替换输出列名：
```cpp
static const std::unordered_map<std::string, std::string> deprecated_field_map{
    {"Replica_IO_State", "Slave_IO_State"},
    {"Source_Host", "Master_Host"},
    {"Source_User", "Master_User"},
    {"Replica_IO_Running", "Slave_IO_Running"},
    {"Seconds_Behind_Source", "Seconds_Behind_Master"},
    // 完整字段双向映射省略
};
```
执行 `SHOW SLAVE STATUS` 时调用 `rename_fields_use_old_replica_source_terms` 函数批量替换结果集字段名，字段顺序与以前版本保持一致。

### 5.3 错误信息兼容
旧语法触发复制类报错时，自动替换错误提示文本中的 `Source/Replica` 为 `Master/Slave`，错误码保持历史兼容值，原有日志告警解析规则无需调整。

## 六、性能与兼容性说明

1. **性能损耗**：仅增加语法识别与字段映射逻辑，无磁盘 IO、线程开销，对复制同步、SQL 执行性能无任何负面影响；
2. **双向兼容**：新版 Source/Replica 全套语法功能、输出格式完全保留，新开发工具可继续使用标准术语；
3. **多复制通道兼容**：普通多源复制、MGR 组复制、异步延迟复制均支持新旧语法混用；
4. **存储过程 / 脚本兼容**：存储过程、定时事件、Shell/Python 运维脚本内可直接使用旧复制语句，无需改造；
5. **Binlog 无变更**：复制 Binlog、Relaylog 存储格式完全不变，主从、MGR 同步逻辑无改动。

## 七、使用约束与特殊限制

1. 底层复制同步逻辑完全统一，新旧语法不能单独配置不同复制参数，最终生效配置以最新执行语句为准；
2. 字段映射仅针对复制状态查询语句，普通业务表字段不受影响；
3. 不新增全局开关控制兼容功能，内核默认永久启用两套语法并行；
4. 仅兼容以前主流高频复制接口，极小众废弃底层内部接口不予恢复。

## 八、运维落地价值

1. **升级改造成本大幅降低**

数据库跨大版本升级时，存量监控、自动化、灾备脚本无需重构，避免大规模代码改造与测试。

2. **平滑过渡方案**

升级后可长期并行使用新旧语法，运维团队可分阶段逐步迁移至标准 Source/Replica 语法，无强制改造窗口期。

3. **降低业务中断风险**

升级后复制管理流程、监控采集逻辑无缝衔接，不会出现复制状态监控断流、自动化切换失败故障。

4. **适配存量第三方工具**

自研平台、开源备份 / 同步工具、DTS 数据同步组件无需二次适配数据库新版本。

## 九、适用场景
1. 现有低版本升级至新版本；
2. 线上存在大量基于 `Slave/Master` 语法的自动化运维脚本、监控采集程序；
3. 多套业务平台、中间件对接数据库复制状态；
4. MGR 组复制、多源异步复制混合架构，需要统一兼容新旧管理语句；
5. 第三方数据同步、备份工具暂不支持新版 Replica 术语。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
