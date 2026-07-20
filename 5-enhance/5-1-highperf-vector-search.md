# Turbo 引擎向量相似度查询

---

# 1. 功能概述

向量相似度查询（Vector Similarity Query）是 GreatSQL 新增的一类数据分析能力，支持在数据库内直接存储与计算高维向量数据，并提供多种距离函数实现相似度计算。

本功能主要用于：

* 语义检索（Semantic Search）
* 推荐系统（Recommendation System）
* 向量检索（Vector Search）
* AI Embedding 数据处理

---

## 1.1 核心能力

本功能提供三类核心能力：

### （1）向量数据类型

新增数据类型：

* `VECTOR(N)`
* 默认 `VECTOR(2048)`
* 最大支持 `16383` 维

向量底层采用：

> BLOB 存储结构

---

### （2）向量距离函数

支持三种距离计算模型：

* 欧式距离（Euclidean）
* 余弦距离（Cosine）
* 点积距离（Dot Product）

---

### （3）Turbo 执行引擎支持

在 Turbo 执行层实现：

* VECTOR → BLOB 映射
* 零拷贝内存交互
* 向量函数注册执行

---

# 2. 总体架构设计

## 2.1 架构组成

向量查询体系由以下模块构成：

### ① SQL 层 VECTOR 类型扩展

* Parser 支持 VECTOR(N)
* 类型系统新增 MYSQL_TYPE_VECTOR

---

### ② Executor 向量函数模块

负责：

* distance function 调度
* 参数校验
* 类型匹配

---

### ③ Vector Distance Kernel

提供底层计算能力：

* euclidean_distance
* cosine_distance
* dot_product

---

### ④ Turbo 执行层

负责：

* VECTOR ↔ BLOB 映射
* 数据零拷贝传输
* 函数注册与执行

---

# 3. 数据结构设计

## 3.1 VECTOR 类型存储结构

VECTOR 本质为：

```text
float[]
```

存储方式：

* BLOB 二进制格式
* 连续内存布局

---

## 3.2 Turbo 内部表示

VECTOR → LogicalType::BLOB

映射关系：

| MySQL 类型 | Turbo 类型 |
| -------- | -------- |
| VECTOR   | BLOB     |

---

## 3.3 向量对象结构

```text
float *data
size_t size
```

---

# 4. 关键算法设计

## 4.1 欧式距离（Euclidean Distance）

```cpp
dis += (v1[i] - v2[i])^2
return sqrt(dis)
```

特点：

* L2 距离
* 用于空间距离计算

---

## 4.2 余弦距离（Cosine Distance）

公式：

```text
1 - (dot(v1, v2) / |v1||v2|)
```

特点：

* 衡量方向相似度
* 忽略数值大小

---

## 4.3 点积（Dot Product）

```text
Σ(v1[i] * v2[i])
```

特点：

* 高维相似性基础指标
* 常用于 ANN 检索

---

# 5. SQL 函数设计

## 5.1 VECTOR_DISTANCE 函数

### 参数规则

* 参数1：VECTOR
* 参数2：VECTOR
* 参数3：distance type（可选）

---

### 支持类型

| 类型        | 说明   |
| --------- | ---- |
| dot       | 点积   |
| euclidean | 欧式距离 |
| cosine    | 余弦距离 |

---

### 调度逻辑

```cpp
if type == "dot" → dot_product
if type == "euclidean" → euclidean_distance
if type == "cosine" → cosine_distance
```

---

## 5.2 参数校验机制

* VECTOR 类型必须匹配
* 支持 binary collation
* 参数数量合法性检查

---

# 6. Turbo 引擎支持设计

## 6.1 数据映射机制

### VECTOR → BLOB

```text
MySQL VECTOR
→ DuckDB BLOB
→ Turbo Vector
```

---

## 6.2 零拷贝机制

核心优化：

* 连续内存直接映射
* 避免二次转换

---

## 6.3 向量函数注册

Turbo 注册函数：

* vector_euclidean_distance
* vector_cosine_distance
* vector_dot_distance

---

# 7. 安全设计

## 7.1 类型安全

* VECTOR 仅支持：

```text
CAST(vec AS BINARY)
```

* 不支持任意类型转换

---

## 7.2 边界控制

* 最大维度：16383
* 默认维度：2048
* 参数必须合法 vector

---

## 7.3 安全结论

| 风险项    | 是否存在  |
| ------ | ----- |
| SQL 注入 | 不涉及 |
| 缓冲区溢出 | 不涉及 |
| 越权 | 不涉及 |

---

# 8. 性能设计

## 8.1 计算复杂度

距离计算：

* O(n) 线性复杂度

---

## 8.2 性能瓶颈

* 高维向量 CPU 消耗
* 无索引情况下全表扫描

---

## 8.3 Turbo 优化点

* BLOB 零拷贝
* SIMD 可扩展潜力
* 连续内存访问

---

# 9. 使用限制

* 8.4：受限支持（不支持 prepare）
* 9.0：完整支持 prepare
* 暂不支持复杂索引优化

---

# 10. 兼容性说明

* 兼容 MySQL 语法扩展方式
* 不影响原 SQL 执行逻辑
* BLOB 存储兼容现有系统
* 支持 ODBC / Python（受限）

---

# 11. 总结

向量相似度查询功能通过引入 VECTOR 数据类型与多种距离函数，并结合 Turbo 执行引擎优化，实现了数据库内原生向量计算能力。

其核心价值在于：

> 将 AI 向量计算从应用层下沉至数据库执行层

从而显著提升：

* 检索效率
* 系统一致性
* 数据处理一体化能力



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
