# 事务
---

本节介绍事务相关内容。

## 事务简介

数据库事务是指作为一个单独逻辑工作单元执行的一系列数据库操作，这些操作要么全部成功执行，要么全部不执行，没有部分执行的情况。

数据库事务通常具有以下四个基本特性，即 ACID 特性：

1. 原子性（Atomicity）：事务中的所有操作要么全部执行成功，要么全部不执行，不存在部分执行的情况。如果其中一个操作失败，整个事务都会被回滚到初始状态，以保证数据库的一致性。
2. 一致性（Consistency）：事务在执行前后，数据库的状态应该保持一致性。换句话说，事务执行后数据库应该从一个一致的状态转变到另一个一致的状态，不会破坏数据库的完整性约束。
3. 隔离性（Isolation）：多个事务并发执行时，每个事务应该感觉到它在独立地操作数据库，即事务之间应该相互隔离，不会相互影响。这意味着一个事务在执行过程中对其他事务的操作是不可见的。
4. 持久性（Durability）：一旦事务提交成功，其所做的修改应该永久保存在数据库中，即使系统发生故障或者重启，这些修改也应该能够被恢复。

综上所述，数据库事务是为了确保数据操作的完整性、一致性和可靠性而设计的一种机制。通过事务，可以将一系列相关的数据库操作作为一个整体进行管理，保证数据在执行过程中的正确性和可靠性。

## 事务控制语句

GreatSQL 数据库中常用的事务控制语句包括 `START TRANSACTION`、`COMMIT` 和 `ROLLBACK`。这些语句用于开始、提交和回滚事务，保证数据操作的原子性、一致性、隔离性和持久性。

1. **START TRANSACTION**：开始一个事务。在开始一个事务后，所有的数据库操作将被视为一个整体，要么全部成功执行，要么全部回滚。

```sql
greatsql> START TRANSACTION;
```

2. **COMMIT**：提交一个事务，将事务中的所有操作永久保存到数据库中。只有在执行 COMMIT 命令后，事务中的修改才会对其他会话可见。

```sql
greatsql> COMMIT;
```

3. **ROLLBACK**：回滚事务，将事务中的所有操作撤销，数据库恢复到事务开始之前的状态。

```sql
greatsql> ROLLBACK;
```

除了以上基本的事务控制语句外，GreatSQL 还支持 SAVEPOINT 语句用于设置保存点，可以在事务中进行部分回滚操作。例如：

- 设置保存点：

```sql
greatsql> SAVEPOINT savepoint_name;
```

- 部分回滚到保存点：

```sql
greatsql> ROLLBACK TO SAVEPOINT savepoint_name;
```

需要注意的是，GreatSQL 默认的事务隔离级别是 **可重复读（REPEATABLE READ）**，可以通过设置 `SET [GLOBAL | SESSION] TRANSACTION ISOLATION LEVEL` 语句来修改隔离级别，也可以在开始事务之前使用 `START TRANSACTION WITH ISOLATION LEVEL` 语句来设置。例如：

```sql
greatsql> SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 或者下面这样开始一个事务，并在该事务中发起一致性快照读
greatsql> START TRANSACTION WITH CONSISTENT SNAPSHOT;
```

以上是 GreatSQL 数据库中常用的事务控制语句及其用法，可以根据具体业务需求来合理应用。


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
