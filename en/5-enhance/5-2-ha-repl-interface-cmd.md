# Restoring Compatible Replication Interfaces
---

## 1. Operational Pain Points Caused by Upgrade Syntax Changes

Starting from version 8.4, the standardized `Source/Replica` replication terminology has been fully adopted, and the old `Master/Slave` replication syntax, status fields, global status variables, and error message texts have been deprecated at the same time.

In production environments, there are a large number of long-running operations scripts, monitoring collection programs, automated release platforms, and inspection tools, all of which rely on old interfaces such as `CHANGE MASTER TO`, `SHOW SLAVE STATUS`, and `Slave_*` status variables.

After the version upgrade, the following problems occur:
1. Existing operations scripts directly report errors when executed, and the automated replication management process fails;
2. Monitoring programs cannot read replication lag or IO/SQL thread status, and monitoring dashboards lose data;
3. Batch change, disaster recovery switchover, and data synchronization scripts require large-scale refactoring, with extremely high modification costs;
4. The adaptation workload of customer-side self-developed operations platforms and middleware is large, lengthening the database upgrade cycle.

The original solution required rewriting all scripts to adapt to the new `Source/Replica` syntax, which is costly in both manpower and time. Therefore, this feature **restores the old Master/Slave replication compatibility interfaces**, allowing the old and new syntax sets to coexist completely in parallel, without the need to modify existing operations code.

## 2. Introduction to the Master/Slave Compatible Interface Feature

This feature is a kernel-level replication compatibility enhancement layer. It does not change the underlying core replication synchronization logic, and only performs bidirectional mapping and adaptation at the outer layers of SQL parsing, result output, and error messages:
1. Fully restores the previously frequently used `Master/Slave` replication management SQL syntax; both old and new syntaxes can be executed normally;
2. The output of `SHOW SLAVE STATUS` and `SHOW MASTER STATUS` is compatible with the old field names and field order;
3. The `Slave_*` series of global status variables are retained, with real-time bidirectional synchronization with the new `Replica_*` variables;
4. When old syntax triggers an error, the historical compatible error codes and Master/Slave style prompt texts are returned;
5. The old and new syntaxes are completely isolated and do not interfere with each other. The underlying layer reuses the same replication execution logic, with no performance loss and no impact on data consistency.

The overall architecture is layered:
1. **Syntax compatibility layer**: The Lex/Yacc parser restores the `MASTER`/`SLAVE` keywords and the complete old syntax rules, recognizing old statements and marking them;
2. **Parameter mapping layer**: Old `MASTER_XXX` parameters are automatically converted to the new internal `SOURCE_XXX` parameters, calling the unified underlying replication logic;
3. **Output adaptation layer**: Based on the syntax markers, the query field names, status variable names, and error message texts are dynamically converted to output the two sets of terminology styles respectively.

## 3. Complete Compatible Syntax List

### 3.1 Correspondence Between Old and New Replication Management Statements

| Old Master/Slave Syntax | New Source/Replica Standard Syntax |
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

### 3.2 CHANGE MASTER TO Parameter Mapping
Old `MASTER_*` options are automatically mapped to internal `SOURCE_*` parameters, with full compatibility: `MASTER_HOST`/`MASTER_USER`/`MASTER_PASSWORD`/`MASTER_PORT`/`MASTER_AUTO_POSITION`/`MASTER_LOG_FILE`/`MASTER_LOG_POS`/`MASTER_CONNECT_RETRY`/`MASTER_RETRY_COUNT`/`MASTER_DELAY`/all SSL parameters/compression parameters/heartbeat parameters/public key parameters, etc.

## 4. Usage Examples

### Example 1: Setting up source-replica replication with the old syntax (existing scripts need no modification)
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

After execution, the returned result fields are old-style names such as `Slave_IO_State` and `Master_Host`, compatible with existing collection logic.

### Example 2: The new standard syntax is completely unaffected
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
The output fields use the new standard names such as `Replica_IO_State` and `Source_Host`. The two syntax sets can be used alternately on the same instance.

### Example 3: Compatible queries for global status variables
```sql
# Old compatible variables, synchronized in real time with the new ones
SHOW STATUS LIKE 'Slave%';
# New standard variables
SHOW STATUS LIKE 'Replica%';
```

The values of the two variable sets are exactly the same, and monitoring can choose either set for collection.

## 5. Core Compatibility Adaptation Logic
### 5.1 SQL Syntax Recognition Logic

The old and new syntaxes are distinguished at the SQL parsing stage:
1. If the old `MASTER/SLAVE` keywords are matched, `m_is_replication_deprecated_syntax_used = true` is marked;
2. The parameter mapping module converts all `MASTER_XXX` configuration items to the unified underlying `SOURCE_XXX` structures;
3. The underlying layer reuses exactly the same replication scheduling, IO/SQL thread, and GTID synchronization logic, with no differentiated execution branches.

### 5.2 Query Result Field Adaptation Logic

A built-in field mapping table automatically replaces the output column names for old syntax queries:
```cpp
static const std::unordered_map<std::string, std::string> deprecated_field_map{
    {"Replica_IO_State", "Slave_IO_State"},
    {"Source_Host", "Master_Host"},
    {"Source_User", "Master_User"},
    {"Replica_IO_Running", "Slave_IO_Running"},
    {"Seconds_Behind_Source", "Seconds_Behind_Master"},
    // Full bidirectional field mapping omitted
};
```
When `SHOW SLAVE STATUS` is executed, the `rename_fields_use_old_replica_source_terms` function is called to batch replace the field names in the result set, keeping the field order consistent with previous versions.

### 5.3 Error Message Compatibility
When old syntax triggers a replication-related error, `Source/Replica` in the error message text is automatically replaced with `Master/Slave`, and the error codes remain the historical compatible values. Existing log and alert parsing rules do not need to be adjusted.

## 6. Performance and Compatibility Notes

1. **Performance impact**: Only syntax recognition and field mapping logic are added, with no disk I/O or thread overhead, and no negative impact on replication synchronization or SQL execution performance;
2. **Bidirectional compatibility**: The full set of new Source/Replica syntax functions and output formats is fully retained, and newly developed tools can continue to use the standard terminology;
3. **Multi-replication-channel compatibility**: Ordinary multi-source replication, MGR group replication, and asynchronous delayed replication all support mixed use of old and new syntaxes;
4. **Stored procedure/script compatibility**: Old replication statements can be used directly in stored procedures, scheduled events, and Shell/Python operations scripts without modification;
5. **No Binlog changes**: The storage formats of replication Binlog and Relaylog are completely unchanged, and the source-replica and MGR synchronization logic is not modified.

## 7. Usage Constraints and Special Limitations

1. The underlying replication synchronization logic is fully unified. The old and new syntaxes cannot be configured with different replication parameters separately; the final effective configuration follows the most recently executed statement;
2. Field mapping only applies to replication status query statements; fields of ordinary business tables are not affected;
3. No global switch is added to control the compatibility feature. The kernel permanently enables the two syntax sets in parallel by default;
4. Only the previous mainstream high-frequency replication interfaces are compatible. Extremely niche deprecated underlying internal interfaces are not restored.

## 8. Operational Landing Value

1. **Greatly reduced upgrade and modification costs**

When upgrading across major database versions, existing monitoring, automation, and disaster recovery scripts do not need to be refactored, avoiding large-scale code modifications and testing.

2. **Smooth transition solution**

After the upgrade, the old and new syntaxes can be used in parallel for a long time. Operations teams can gradually migrate to the standard Source/Replica syntax in phases, with no forced modification window.

3. **Reduced risk of business interruption**

After the upgrade, replication management processes and monitoring collection logic are seamlessly connected, without replication status monitoring interruption or automated switchover failures.

4. **Adaptation of existing third-party tools**

Self-developed platforms, open-source backup/synchronization tools, and DTS data synchronization components do not need secondary adaptation to the new database version.

## 9. Applicable Scenarios
1. Upgrading from an existing lower version to the new version;
2. A large number of automated operations scripts and monitoring collection programs based on the `Slave/Master` syntax exist in production;
3. Multiple business platforms and middleware need to interface with database replication status;
4. Hybrid architectures of MGR group replication and multi-source asynchronous replication require unified compatibility with old and new management statements;
5. Third-party data synchronization and backup tools do not yet support the new Replica terminology.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
