# Deadlock Troubleshooting and Analysis
---

This article introduces how to view deadlock information in the GreatSQL database and analyze the possible causes of deadlocks.

## About Deadlocks
Deadlocks occur because lock waits produce a circular loop, i.e., a dead knot.

For example, transaction A holds lock L1 on data R1, and transaction B holds lock L2 on data R2; then, transaction A continues to request the lock on data R2, and transaction A is blocked by L2; transaction B continues to request the lock on data R1. At this time, a circular loop is produced, triggering deadlock detection, and one of the transactions fails and is rolled back.

| Timeline | Transaction A | Transaction B |
| --- | --- | --- |
| t1 | begin; | begin; |
| t2 | select * from t1 where id=1 for update; | |
| t3 | | select * from t1 where id=2 for update; |
| t4 | select * from t1 where id=2 for update;<br/>-- Blocked||
| t5 | | select * from t1 where id=1 for update;<br/>-- Deadlock detection triggered, reports deadlock, transaction fails and rolls back<br/>-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction|

In InnoDB, there is a background thread for deadlock detection. When a deadlock is detected, it immediately throws an exception and rolls back one transaction (the other continues to execute). InnoDB chooses the transaction with the smaller rollback cost (fewer locked or modified rows). If the cost of the two transactions is the same, the transaction that started later is chosen.

The option `innodb_deadlock_detect` is used to set whether deadlock detection is enabled. It is enabled by default.

In scenarios with a large number of high-concurrency transactions, enabling deadlock detection may slow down the system, because a large number of transactions may be waiting for the same lock. At this time, disabling deadlock detection can be considered (`innodb_deadlock_detect=0`), or lowering the row lock wait threshold `innodb_lock_wait_timeout`.

## Viewing the Deadlock Log
Taking the above deadlock scenario as an example, the generated deadlock log is as follows:
```sql
------------------------
LATEST DETECTED DEADLOCK
------------------------
# The first transaction A where the deadlock occurred
*** (1) TRANSACTION:
TRANSACTION 5315754291, ACTIVE 10 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s)
MySQL thread id 13338, OS thread handle 139836330592000, query id 36923052144 localhost root statistics
select * from t1 where id=2 for update

# The row lock held by transaction A (record lock on id=1)
*** (1) HOLDS THE LOCK(S):
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754291 lock_mode X locks rec but not gap
Record lock, heap no 2 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000001; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 82000010360110; asc     6  ;;
 3: len 4; hex 80021d42; asc    B;;
 4: len 4; hex 000aee94; asc     ;;


# The row lock transaction A is waiting for (record lock on id=2)
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754291 lock_mode X locks rec but not gap waiting
Record lock, heap no 3 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000002; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 8200001036011d; asc     6  ;;
 3: len 4; hex 8007ba9d; asc     ;;
 4: len 4; hex 000146d3; asc   F ;;


# The second transaction B where the deadlock occurred
*** (2) TRANSACTION:
TRANSACTION 5315754292, ACTIVE 5 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s)
MySQL thread id 13339, OS thread handle 139836355770112, query id 36923052145 localhost root statistics
select * from t1 where id=1 for update

# The row lock held by transaction B (record lock on id=2)
*** (2) HOLDS THE LOCK(S):
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754292 lock_mode X locks rec but not gap
Record lock, heap no 3 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000002; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 8200001036011d; asc     6  ;;
 3: len 4; hex 8007ba9d; asc     ;;
 4: len 4; hex 000146d3; asc   F ;;


# The row lock transaction B is waiting for (record lock on id=1)
*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754292 lock_mode X locks rec but not gap waiting
Record lock, heap no 2 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000001; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 82000010360110; asc     6  ;;
 3: len 4; hex 80021d42; asc    B;;
 4: len 4; hex 000aee94; asc     ;;

# Roll back the second transaction B (the cost of the two transactions is the same, but transaction B started later)
*** WE ROLL BACK TRANSACTION (2)
```

In the `SHOW ENGINE INNODB STATUS` output, only the last deadlock event can be saved. To record all deadlock events, set `innodb_print_all_deadlocks=1`, and all deadlock events are recorded in the log file pointed to by the option `log_error`.

## Viewing and Analyzing Row Lock Waits

In fact, if only the deadlock log is looked at, it is difficult to directly analyze the cause of the deadlock. Usually, a speculative simulation approach needs to be used to reproduce the deadlock scenario. Or observe the pattern of deadlock occurrence, set `general_log=1` during the time period when deadlocks are prone to occur, record all requests during that period, disable this option after the deadlock occurs, and then combine the deadlock log to analyze the request log of that period and determine the cause of the deadlock.


**Reference materials**
- [Deadlocks in InnoDB](https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html)
- [How to Minimize and Handle Deadlocks](https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks-handling.html)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
