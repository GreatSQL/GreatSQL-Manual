# 执行计划变更异常捕获

---

## 1. 功能概述

SQL Digest 维度的执行计划变更异常捕获功能用于在数据库运行过程中持续采集并缓存执行计划基线信息，并在数据库重启或运行一段时间后，通过新旧执行计划数据的差分比对，识别发生变化的执行计划及其对应的存疑 SQL，从而帮助用户及时发现潜在性能退化问题。

该功能主要解决以下问题：

- 数据库升级或重启后执行计划漂移不可见
- SQL 执行计划变化难以定位
- Digest 维度下 SQL 优化效果不可追踪
- 缺乏历史执行计划对比能力

---

## 2. 总体架构设计

系统由以下核心模块构成：

### 2.1 插件化工作

采用插件化方式工作，插件名 `plan_baseline`。插件安装启用方式：

```sql
INSTALL PLUGIN plan_baseline SONAME 'libgreatdb_plan_baseline.so';
```

负责执行计划的采集、序列化与内存缓存管理。

主要能力：
- access path 采集
- 执行计划序列化
- digest 维度归一化处理
- plan_name 生成与唯一标识

---

### 2.2 执行计划缓存模块

两大核心内存结构：

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

### 2.3 持久化模块

周期性将内存数据持久化到磁盘：

- GDB_SQL_PLAN_BASELINES
- GDB_HIST_SQL_PLAN
- GDB_DIGEST_SQL_INFO

通过定时任务线程池（ThreadPool）异步执行，避免影响主线程。

---

### 2.4 差分比对模块

通过存储过程：

- plan_compare_result

对不同时间点的持久化表进行 JOIN 比对，输出执行计划变化结果。

---

## 3. 数据结构设计

### 3.1 GDB_SQL_PLAN_BASELINES

记录 Digest 维度执行计划基线信息：

| 字段 | 说明 |
|------|------|
| digest_hash | SQL digest hash |
| digest_text | 归一化 SQL |
| plan_name | 执行计划唯一标识 |
| cost | 计划代价 |

---

### 3.2 GDB_HIST_SQL_PLAN

记录执行计划序列化结构：

- db_name
- operation（plan tree）

---

### 3.3 GDB_DIGEST_SQL_INFO

记录原始 SQL 与扫描行数：

- query_text
- table_rows

---

### 3.4 plan_compare_result

用于记录差异结果：

- 同一 digest 不同 plan_name
- cost 对比
- SQL 对比结果

---

## 4. 核心流程设计

### 4.1 执行计划采集流程

1. 优化器执行结束
2. 生成 access path
3. 进行 normalize（替换常量 / limit）
4. 序列化生成 JSON
5. SHA256 生成 plan_name
6. 写入 plan_hash_map

---

### 4.2 查询触发写入流程

当用户访问以下表时触发：

- GDB_HIST_SQL_PLAN
- GDB_SQL_PLAN_BASELINES
- GDB_DIGEST_SQL_INFO

流程：

1. 从内存 map 获取数据
2. 动态构建临时表
3. 返回客户端
4. 释放临时表资源

---

### 4.3 持久化流程

定时任务：

- refresh_interval 触发
- 多线程写盘
- 生成历史版本表
- 更新 table_info 元数据表

---

## 5. 异常捕获机制

### 5.1 异常类型

- 数据库重启导致内存清空
- 采集过程中执行失败
- explain 序列化异常
- iterator executor 异常

---

### 5.2 处理策略

- 异常不中断主流程
- 返回占位符：
  ```
  <not executable by iterator executor>
  ```
- 跳过错误 SQL，不影响整体采集

---

## 6. 参数说明

### 6.1 功能开关

| 参数 | 默认值 | 说明 |
|------|--------|------|
| plan_baseline_enable_summary | OFF | 是否开启采集 |
| plan_baseline_enable_persistent | OFF | 是否开启持久化 |

---

### 6.2 持久化控制

| 参数 | 默认值 |
|------|--------|
| plan_baseline_refresh_interval | 1800s |
| plan_baseline_max_row_count | 3000 |
| plan_baseline_max_table_count | 24 |

---

## 7. 安全与权限控制

在四权分立模式下：

- sysdba：插件安装/卸载/参数修改
- sysdbo：数据读写权限
- sysdaa：审计访问权限

非四权模式下默认 root 全权限。

---

## 8. 性能设计

### 8.1 设计原则

- 采集与查询解耦
- 内存缓存优先
- 异步持久化
- 查询无锁化访问

---

### 8.2 性能收益

- 避免执行计划采集影响查询主链路
- 减少表写入锁竞争
- 提升高并发稳定性

---

## 9. 使用限制

- 必须开启 performance_schema
- rapid / turbo 引擎暂不支持
- cursor SQL 不采集
- 存储过程内部 SQL 部分不计 digest

---

## 10. 兼容性说明

- 兼容现有 Digest 体系
- 不影响原 SQL 执行结果
- 不修改优化器核心执行逻辑
- 向下兼容 MySQL 协议行为

---

## 11. 总结

本功能通过“内存缓存 + 异步持久化 + Digest 维度差分比对”的方式，实现执行计划历史追踪能力，在不影响主链路性能的前提下，为数据库提供可观测的执行计划变化分析能力。




**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
