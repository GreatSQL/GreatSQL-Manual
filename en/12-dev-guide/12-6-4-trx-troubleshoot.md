# Transaction Error Handling
---

This section describes transaction error handling.

## Lock Wait Timeout

When a request for a row lock is blocked, a lock wait occurs. The maximum wait time is defined by the `innodb_lock_wait_timeout` option, whose default value is 50 seconds.

When an SQL request is blocked because of a lock wait, the state shown by `SHOW PROCESSLIST` is usually **updating**. So if you see this state, you can generally start by investigating the cause of the lock wait, for example:

```sql
greatsql> show processlist;
+----+------+-----------+------+---------+------+----------+-----------------------------------------+---------+-----------+---------------+
| Id | User | Host      | db   | Command | Time | State    | Info                                    | Time_ms | Rows_sent | Rows_examined |
+----+------+-----------+------+---------+------+----------+-----------------------------------------+---------+-----------+---------------+
| 91 | root | localhost | trx  | Query   |    0 | init     | show processlist                        |       0 |         0 |             0 |   <- transaction holding the lock
| 98 | root | localhost | trx  | Query   |   35 | updating | update t1 set c3 = 'row11' where id = 1 |   35617 |         0 |             0 |   <- blocked transaction
+----+------+-----------+------+---------+------+----------+-----------------------------------------+---------+-----------+---------------+
```

Execute `SHOW ENGINE INNODB STATUS\G` to see output similar to the following:

```sql
...
/* blocked transaction: transaction ID=2802, PROCESSLIST ID=98, active for 96 sec, state updating */
---TRANSACTION 2802, ACTIVE 96 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1128, 2 row lock(s)
MySQL thread id 98, OS thread handle 139691128010496, query id 8599 localhost root updating
update t1 set c3 = 'row11' where id = 1

/* transaction 2802 is requesting the lock resource below */
------- TRX HAS BEEN WAITING 7 SEC FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 53 page no 4 n bits 80 index PRIMARY of table `trx`.`t1` trx id 2802 lock_mode X locks rec but not gap waiting
Record lock, heap no 8 PHYSICAL RECORD: n_fields 6; compact format; info bits 0
 0: len 4; hex 00000001; asc    ;;
 1: len 6; hex 000000000af1; asc      ;;
 2: len 7; hex 01000000e70151; asc       Q;;
 3: len 4; hex 00000001; asc    ;;
 4: len 4; hex 00000001; asc    ;;
 5: len 5; hex 726f773131; asc row11;;

------------------

/* transaction holding the lock: transaction ID=2801, PROCESSLIST ID=91, active for 112 sec, state starting */
---TRANSACTION 2801, ACTIVE 112 sec
2 lock struct(s), heap size 1128, 1 row lock(s), undo log entries 1
MySQL thread id 91, OS thread handle 139690606827264, query id 8601 localhost root starting
show engine innodb status
Trx read view will not see trx with id >= 2801, sees < 2800
...
```

When you encounter a long lock wait like the one above, you can query `sys.innodb_lock_waits` to identify the source of the lock wait, commit the source transaction that causes the lock wait, or follow the suggestions provided by `sql_kill_blocking_query` or `sql_kill_blocking_connection` to kill the corresponding connection and roll back that transaction, so as to avoid more lock blocking and affecting more business systems.

More importantly, monitor long transactions or transactions that cause many locks in time. For details, refer to the following:
- [Locks and Waiting Events](../6-oper-guide/3-monitoring-and-alerting.md#locks-and-waiting-events)
- [Row Lock Monitoring](./12-6-3-trx-mvcc-and-locking.md#row-lock-monitoring) 


## Cannot Find the Thread of an Active Transaction

When you query the `information_schema.INNODB_TRX` table to list all active transactions, you may find that the `trx_mysql_thread_id` value of some transactions is 0, and the corresponding `PROCESSLIST ID` cannot be found.

This usually happens because these are XA transactions in the PREPARE state. You can use `XA RECOVER` to view the list of XA transactions, and then execute `XA COMMIT` or `XA ROLLBACK` to commit or roll back.

For details, see: [XA Transactions](./12-6-1-trx-control.md#xa-transactions).

## Slow or Failing Transaction Commit

The following situations may make a transaction commit very slow or impossible:
- High system load; in this case all transactions respond slowly;
- Too many inefficient SQL statements, that is, so-called slow SQL, which raises the system load and affects other transactions;
- The `innodb_thread_concurrency` option is set to a non-zero value and the current transaction concurrency is very high, so some transactions always have to queue and wait;
- The disk is full; in this case transactions cannot be committed; 
- Semi-synchronous replication (**Semisynchronous Replication**) or group commit (**group commit**) is enabled, which makes transaction commit slow;
- Other situations.

## Deadlocks

As mentioned in [Deadlock](./12-6-3-trx-mvcc-and-locking.md#deadlock), occasional deadlocks are not a big concern unless they occur frequently.

If deadlocks occur frequently, you can optimize from the following aspects:
- Improve transaction efficiency, especially the efficiency of every SQL request in the transaction, and reduce the lock holding time;
- Avoid long transactions and large transactions to reduce the lock holding time and the number of locks held;
- Appropriately lower the lock wait timeout threshold (`innodb_lock_wait_timeout`) to avoid long lock waits;
- Reduce explicit lock requests; for example, execute `UPDATE` to update a row directly instead of locking it with `SELECT ... FOR UPDATE` and then executing `UPDATE`;
- Make sure every locking condition has an index and that the index is efficient enough, because without an index all records are locked; an efficient index also reduces the number of locked rows.

With the measures above, you can effectively reduce the row lock wait time and the probability of deadlocks.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
