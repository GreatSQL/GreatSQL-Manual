# Large Transaction Binlog Independent Flush Optimization

## Feature Release Notes

This feature optimizes the binlog flush path for large transactions, enabling a direct conversion of the binlog cache file into a binlog file. It avoids the high I/O overhead of "cache read-back + second write" in the traditional mode, thereby significantly reducing large transaction commit latency and improving overall database throughput and stability.

---

## 1. Feature Overview

In the traditional MySQL / GreatSQL binlog commit process, a large transaction needs to re-read the binlog cache contents and write them into the binlog file at commit time, resulting in:

- High I/O consumption
- Long binlog lock hold time
- Blocking of other transaction commits
- Noticeable TPS fluctuations

Through the "pre-built binlog cache file structure + reserved header space + rename replacement mechanism", this feature enables large transactions to:

> **Directly convert the binlog cache file into a binlog file to complete the commit**

---

## 2. Design Goals

- Reduce the I/O cost of large transaction commits
- Reduce binlog lock hold time
- Improve system TPS stability
- Optimize write amplification issues
- Improve overall throughput in high-concurrency scenarios

---

## 3. Core Principles

This solution is based on three key changes:

### 3.1 Reconstructable binlog cache file structure

The binlog cache reserves the following space during the write phase:

- File Header space
- Format Description Event
- Previous GTID Event
- GTID Event
- Aligned padding space (IO_SIZE alignment)

so that it has the structural basis to be "directly usable as a binlog file".

---

### 3.2 Direct rename flush mechanism

When a large transaction is detected to meet the conditions:

1. End the current binlog file (rotate)
2. Generate a new binlog file structure
3. Write the header events into the reserved cache space
4. Delete the temporary binlog file
5. Rename the binlog cache to the official binlog file

---

### 3.3 checksum state inheritance mechanism

To ensure file consistency:

- binlog checksum is disabled during the independent flush of a large transaction
- Transactions subsequently written to the same binlog file inherit this state
- The rotate process propagates the checksum state synchronously

---

## 4. Trigger Conditions

The optimization is enabled when the following conditions are met:

- Transaction size ≥ binlog_large_commit_threshold (default 128MB)
- The binlog cache has already been flushed to disk (not purely in-memory)
- stmt cache and trx cache are not used simultaneously
- binlog compression / encryption is not enabled
- The end_log_pos calculation consistency check passes

---

## 5. System Architecture Changes

### 5.1 Before Optimization

binlog cache → read → binlog file write → commit.

Existing problems:
- Second I/O
- CPU + I/O amplification
- Long commit path

---

### 5.2 After Optimization

binlog cache → pre-build → rename → commit.

Advantages:
- Zero second-write I/O
- Shorter commit path
- Significantly lower I/O latency

---

## 6. Performance Benefits

In large transaction scenarios:

- Commit time is significantly reduced
- Reduced binlog write amplification
- TPS fluctuations converge
- I/O wait is significantly reduced

Typical benefits:

- Large transaction commit latency reduced by 30%~70%
- TPS improvement of 10%~40% in high-concurrency scenarios

---

## 7. Parameter Description

### binlog_large_commit_threshold

- Type: ulonglong
- Default: 128MB
- Description: the threshold for triggering large transaction optimization
- Range: [0, ULLONG_MAX]

---

## 8. Compatibility Notes

- Fully compatible with the MySQL binlog protocol
- Compatible with the GTID system
- Supports parsing by the mysqlbinlog tool
- Does not affect source-replica replication logic
- Does not change transaction semantics

---

## 9. Usage Limitations

The optimization is not enabled in the following scenarios:

- binlog compression enabled
- binlog encryption enabled
- stmt cache and trx cache mixed usage
- Insufficient header space
- Checksum inconsistency risk scenarios

---

## 10. Risks and Control

- Insufficient reserved space → automatic fallback to the traditional write mode
- end_log_pos inconsistency → automatic degradation
- Abnormal checksum state → rename optimization is prohibited
- File system failure → fallback to standard binlog write

---

## 11. Summary

By reconstructing the binlog cache file model, this feature gives large transactions "zero-copy style flush capability", fundamentally reducing I/O amplification in the binlog write path. It is an important optimization for improving database stability under high-load scenarios.



**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
