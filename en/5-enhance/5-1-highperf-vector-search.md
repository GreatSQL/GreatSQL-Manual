# Turbo Engine Vector Similarity Search

---

# 1. Feature Overview

Vector Similarity Query is a new type of data analysis capability added in GreatSQL. It supports storing and computing high-dimensional vector data directly in the database and provides multiple distance functions to implement similarity computation.

This feature is mainly used for:

* Semantic Search
* Recommendation System
* Vector Search
* AI Embedding data processing

---

## 1.1 Core Capabilities

This feature provides three types of core capabilities:

### (1) Vector Data Type

New data type added:

* `VECTOR(N)`
* Default is `VECTOR(2048)`
* Maximum of `16383` dimensions supported

The vector uses the following underlying storage:

> BLOB storage structure

---

### (2) Vector Distance Functions

Three distance computation models are supported:

* Euclidean distance
* Cosine distance
* Dot product

---

### (3) Turbo Execution Engine Support

Implemented at the Turbo execution layer:

* VECTOR → BLOB mapping
* Zero-copy memory interaction
* Vector function registration and execution

---

# 2. Overall Architecture Design

## 2.1 Architecture Components

The vector query system consists of the following modules:

### ① SQL Layer VECTOR Type Extension

* Parser supports VECTOR(N)
* MYSQL_TYPE_VECTOR added to the type system

---

### ② Executor Vector Function Module

Responsible for:

* distance function scheduling
* parameter validation
* type matching

---

### ③ Vector Distance Kernel

Provides underlying computation capabilities:

* euclidean_distance
* cosine_distance
* dot_product

---

### ④ Turbo Execution Layer

Responsible for:

* VECTOR ↔ BLOB mapping
* zero-copy data transfer
* function registration and execution

---

# 3. Data Structure Design

## 3.1 VECTOR Type Storage Structure

VECTOR is essentially:

```text
float[]
```

Storage method:

* BLOB binary format
* contiguous memory layout

---

## 3.2 Turbo Internal Representation

VECTOR → LogicalType::BLOB

Mapping relationship:

| MySQL Type | Turbo Type |
| -------- | -------- |
| VECTOR   | BLOB     |

---

## 3.3 Vector Object Structure

```text
float *data
size_t size
```

---

# 4. Key Algorithm Design

## 4.1 Euclidean Distance

```cpp
dis += (v1[i] - v2[i])^2
return sqrt(dis)
```

Features:

* L2 distance
* used for spatial distance computation

---

## 4.2 Cosine Distance

Formula:

```text
1 - (dot(v1, v2) / |v1||v2|)
```

Features:

* measures direction similarity
* ignores numerical magnitude

---

## 4.3 Dot Product

```text
Σ(v1[i] * v2[i])
```

Features:

* basic metric for high-dimensional similarity
* commonly used in ANN retrieval

---

# 5. SQL Function Design

## 5.1 VECTOR_DISTANCE Function

### Parameter Rules

* Parameter 1: VECTOR
* Parameter 2: VECTOR
* Parameter 3: distance type (optional)

---

### Supported Types

| Type        | Description   |
| --------- | ---- |
| dot       | Dot product   |
| euclidean | Euclidean distance |
| cosine    | Cosine distance |

---

### Scheduling Logic

```cpp
if type == "dot" → dot_product
if type == "euclidean" → euclidean_distance
if type == "cosine" → cosine_distance
```

---

## 5.2 Parameter Validation Mechanism

* VECTOR types must match
* binary collation supported
* number of parameters validity check

---

# 6. Turbo Engine Support Design

## 6.1 Data Mapping Mechanism

### VECTOR → BLOB

```text
MySQL VECTOR
→ DuckDB BLOB
→ Turbo Vector
```

---

## 6.2 Zero-Copy Mechanism

Core optimization:

* direct mapping of contiguous memory
* avoids secondary conversion

---

## 6.3 Vector Function Registration

Functions registered in Turbo:

* vector_euclidean_distance
* vector_cosine_distance
* vector_dot_distance

---

# 7. Security Design

## 7.1 Type Safety

* VECTOR only supports:

```text
CAST(vec AS BINARY)
```

* arbitrary type conversion is not supported

---

## 7.2 Boundary Control

* Maximum dimensions: 16383
* Default dimensions: 2048
* parameters must be valid vectors

---

## 7.3 Security Conclusion

| Risk Item    | Exists?  |
| ------ | ----- |
| SQL injection | Not involved |
| Buffer overflow | Not involved |
| Privilege escalation | Not involved |

---

# 8. Performance Design

## 8.1 Computational Complexity

Distance computation:

* O(n) linear complexity

---

## 8.2 Performance Bottlenecks

* CPU consumption of high-dimensional vectors
* full table scans without an index

---

## 8.3 Turbo Optimization Points

* BLOB zero-copy
* SIMD scalability potential
* contiguous memory access

---

# 9. Usage Limitations

* 8.4: limited support (prepare not supported)
* 9.0: full support for prepare
* complex index optimization not supported yet

---

# 10. Compatibility Notes

* compatible with MySQL syntax extension methods
* does not affect the original SQL execution logic
* BLOB storage is compatible with existing systems
* supports ODBC / Python (limited)

---

# 11. Summary

The vector similarity query feature implements native in-database vector computation capabilities by introducing the VECTOR data type and multiple distance functions, combined with Turbo execution engine optimization.

Its core value is:

> Moving AI vector computation from the application layer down to the database execution layer

Thereby significantly improving:

* retrieval efficiency
* system consistency
* integrated data processing capability



**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
