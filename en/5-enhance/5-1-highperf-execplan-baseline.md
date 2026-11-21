# Execution Plan Drift Detection

---

## 1. Feature Overview

The execution plan change anomaly detection feature at the SQL Digest level continuously collects and caches execution plan baseline information during database operation. After a database restart or a period of operation, it identifies changed execution plans and their corresponding suspicious SQL by comparing old and new execution plan data, helping users promptly discover potential performance regression issues.

This feature mainly solves the following problems:

- Execution plan drift is invisible after a database upgrade or restart
- SQL execution plan changes are difficult to locate
- SQL optimization effects at the Digest level cannot be tracked
- Lack of historical execution plan comparison capability

---

## 2. Overall Architecture Design

The system consists of the following core modules:

### 2.1 Plugin-Based Operation

It operates in a plugin-based manner; the plugin name is `plan_baseline`. To install and enable the plugin:

```sql
INSTALL PLUGIN plan_baseline SONAME 'libgreatdb_plan_baseline.so';
```

It is responsible for execution plan collection, serialization, and in-memory cache management.

Main capabilities:
- access path collection
- Execution plan serialization
- Normalization at the digest level
- plan_name generation and unique identification

---

### 2.2 Execution Plan Cache Module

Two core in-memory structures:

- plan_hash_map  
  ```
  key: db#digest_hash#plan_name
  value: explain_query_result
  ```

- plan_sql_map  
  ```
  key: db#query_sql
  value: explain_query_result
  ```

---

### 2.3 Persistence Module

Periodically persists in-memory data to disk:

- GDB_SQL_PLAN_BASELINES
- GDB_HIST_SQL_PLAN
- GDB_DIGEST_SQL_INFO

Executed asynchronously through a scheduled task thread pool (ThreadPool) to avoid affecting the main thread.

---

### 2.4 Difference Comparison Module

Through the stored procedure:

- plan_compare_result

It performs a JOIN comparison of the persisted tables at different points in time and outputs execution plan change results.

---

## 3. Data Structure Design

### 3.1 GDB_SQL_PLAN_BASELINES

Records execution plan baseline information at the Digest level:

| Field | Description |
|------|------|
| digest_hash | SQL digest hash |
| digest_text | Normalized SQL |
| plan_name | Unique identifier of the execution plan |
| cost | Plan cost |

---

### 3.2 GDB_HIST_SQL_PLAN

Records the serialized execution plan structure:

- db_name
- operation (plan tree)

---

### 3.3 GDB_DIGEST_SQL_INFO

Records the original SQL and the number of scanned rows:

- query_text
- table_rows

---

### 3.4 plan_compare_result

Used to record difference results:

- Different plan_name for the same digest
- cost comparison
- SQL comparison results

---

## 4. Core Process Design

### 4.1 Execution Plan Collection Process

1. Optimizer execution completes
2. Generate access path
3. Perform normalization (replace constants / limit)
4. Serialize to generate JSON
5. Generate plan_name via SHA256
6. Write to plan_hash_map

---

### 4.2 Query-Triggered Write Process

Triggered when users access the following tables:

- GDB_HIST_SQL_PLAN
- GDB_SQL_PLAN_BASELINES
- GDB_DIGEST_SQL_INFO

Process:

1. Get data from the in-memory map
2. Dynamically build a temporary table
3. Return to the client
4. Release temporary table resources

---

### 4.3 Persistence Process

Scheduled task:

- Triggered by refresh_interval
- Multi-threaded write to disk
- Generate historical version tables
- Update the table_info metadata table

---

## 5. Anomaly Detection Mechanism

### 5.1 Anomaly Types

- In-memory data cleared due to a database restart
- Execution failure during collection
- explain serialization exception
- iterator executor exception

---

### 5.2 Handling Strategy

- Exceptions do not interrupt the main process
- Return a placeholder:
  ```
  <not executable by iterator executor>
  ```
- Skip erroneous SQL without affecting overall collection

---

## 6. Parameter Description

### 6.1 Feature Switch

| Parameter | Default | Description |
|------|--------|------|
| plan_baseline_enable_summary | OFF | Whether collection is enabled |
| plan_baseline_enable_persistent | OFF | Whether persistence is enabled |

---

### 6.2 Persistence Control

| Parameter | Default |
|------|--------|
| plan_baseline_refresh_interval | 1800s |
| plan_baseline_max_rows_count | 3000 |
| plan_baseline_max_tables_count | 24 |

---

## 7. Security and Privilege Control

In four-power separation mode:

- sysdba: plugin installation/uninstallation/parameter modification
- sysdbo: data read/write privileges
- sysdaa: audit access privileges

In non-four-power mode, root has full privileges by default.

---

## 8. Performance Design

### 8.1 Design Principles

- Decoupling of collection and query
- In-memory cache first
- Asynchronous persistence
- Lock-free access for queries

---

### 8.2 Performance Benefits

- Avoid execution plan collection affecting the main query path
- Reduce table write lock contention
- Improve stability under high concurrency

---

## 9. Usage Limitations

- performance_schema must be enabled
- rapid / turbo engines are not supported yet
- cursor SQL is not collected
- SQL inside stored procedures is not counted in the digest

---

## 10. Compatibility Notes

- Compatible with the existing Digest system
- Does not affect original SQL execution results
- Does not modify the optimizer's core execution logic
- Backward compatible with MySQL protocol behavior

---

## 11. Summary

Through the "in-memory cache + asynchronous persistence + Digest-level difference comparison" approach, this feature provides execution plan history tracking capability and offers observable execution plan change analysis for the database without affecting main-path performance.




**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
