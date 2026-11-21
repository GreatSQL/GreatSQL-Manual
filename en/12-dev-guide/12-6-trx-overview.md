# Transaction Overview
---

This section introduces transactions.

## Transaction Introduction

A database transaction is a series of database operations executed as a single logical unit of work. These operations either all succeed or none of them are executed; there is no such thing as partial execution.

Database transactions usually have the following four basic properties, namely the **ACID** properties:

1. **Atomicity**: all operations in a transaction either all execute successfully or none of them execute; there is no partial execution. If one of the operations fails, the entire transaction is rolled back to its initial state to keep the database consistent.
2. **Consistency**: the state of the database should remain consistent before and after the transaction executes. In other words, after the transaction completes, the database should move from one consistent state to another consistent state without violating the database's integrity constraints.
3. **Isolation**: when multiple transactions execute concurrently, each transaction should feel as if it is operating on the database independently, that is, transactions should be isolated from each other and should not affect each other. This means that the operations of one transaction are invisible to other transactions while it is executing.
4. **Durability**: once a transaction commits successfully, its modifications should be permanently stored in the database. Even if the system fails or restarts, these modifications should still be recoverable.

In summary, a database transaction is a mechanism designed to ensure the integrity, consistency, and reliability of data operations. With transactions, a series of related database operations can be managed as a whole, guaranteeing that data stays correct and reliable during execution.

## Transaction Control Statements

Common transaction control statements in GreatSQL include `START TRANSACTION`, `COMMIT`, and `ROLLBACK`. These statements are used to start, commit, and roll back transactions, guaranteeing the atomicity, consistency, isolation, and durability of data operations.

1. **START TRANSACTION**: starts a transaction. Once a transaction has started, all database operations are treated as a whole: they either all succeed or all roll back.

```sql
START TRANSACTION;
```

2. **COMMIT**: commits a transaction and permanently stores all operations in the transaction in the database. Only after `COMMIT` is executed do the modifications in the transaction become visible to other sessions.

```sql
COMMIT;
```

3. **ROLLBACK**: rolls back a transaction, undoing all operations in the transaction and restoring the database to the state it had before the transaction started.

```sql
ROLLBACK;
```

In addition to the basic transaction control statements above, GreatSQL also supports the `SAVEPOINT` statement for setting savepoints, which allows partial rollback within a transaction. For example:

- Setting a savepoint:

```sql
SAVEPOINT savepoint_name;
```

- Partially rolling back to a savepoint:

```sql
ROLLBACK TO SAVEPOINT savepoint_name;
```

Note that the default transaction isolation level in GreatSQL is **REPEATABLE READ**. You can change the isolation level with the `SET [GLOBAL | SESSION] TRANSACTION ISOLATION LEVEL` statement, or set it with the `START TRANSACTION WITH ISOLATION LEVEL` statement before starting a transaction. For example:

```sql
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Or start a transaction as follows, and issue a consistent snapshot read in that transaction
START TRANSACTION WITH CONSISTENT SNAPSHOT;
```

The above are the commonly used transaction control statements and their usage in GreatSQL. You can apply them appropriately according to your specific business requirements.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
