# 死锁排查分析
---

本文介绍在GreatSQL数据库中，如何查看死锁信息以及分析死锁发生的可能原因。

## 1. 关于死锁
之所以会发生死锁，是因为锁等待产生了循环回路，也就是死结。

例如，事务A持有数据R1上的锁L1，事务B持有数据R2上的锁L2；紧接着，事务A继续请求数据R2上的锁，事务A会被L2阻塞；事务B继续请求数据R1上的锁，这时就产生了循环回路，触发死锁检测，其中有个事务会失败被回滚。

| 时间线 | 事务A | 事务B |
| --- | --- | --- |
| t1 | begin; | begin; |
| t2 | select * from t1 where id=1 for update; | |
| t3 | | select * from t1 where id=2 for update; |
| t4 | select * from t1 where id=2 for update;<br/>被阻塞||
| t5 | | select * from t1 where id=1 for update;<br/>触发死锁检测，报告死锁，失败回滚事务<br/>ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction|

在InnoDB中，有个死锁检测的后台线程，当检测到死锁后，会马上抛出异常并回滚一个事务（另一个继续执行），InnoDB选择回滚代价较小（锁定或修改的行数较少）的事务，如果两个事务代价一样，则选择启动时间较晚的那个事务。

选项 `innodb_deadlock_detect` 用于设置是否启用死锁检测，默认打开。

在有大量高并发事务场景中，开启死锁检测可能会造成系统变慢，因为有可能大量事务在等待同一个锁。此时可以考虑关闭死锁检测 `innodb_deadlock_detect=0`，或者调低行锁等待阈值 `innodb_lock_wait_timeout`。

## 2. 查看死锁日志
以上述死锁场景为例，产生的死锁日志如下：
```
------------------------
LATEST DETECTED DEADLOCK
------------------------

# 死锁发生时间
2023-09-07 16:45:13 139836574922496

# 发生死锁的第一个事务A
*** (1) TRANSACTION:
TRANSACTION 5315754291, ACTIVE 10 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s)
MySQL thread id 13338, OS thread handle 139836330592000, query id 36923052144 localhost root statistics
select * from t1 where id=2 for update

# 事务A持有的行锁（id=1上的Record Lock）
*** (1) HOLDS THE LOCK(S):
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754291 lock_mode X locks rec but not gap
Record lock, heap no 2 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000001; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 82000010360110; asc     6  ;;
 3: len 4; hex 80021d42; asc    B;;
 4: len 4; hex 000aee94; asc     ;;


# 事务A在等待的行锁（id=2上的Record Lock）
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754291 lock_mode X locks rec but not gap waiting
Record lock, heap no 3 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000002; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 8200001036011d; asc     6  ;;
 3: len 4; hex 8007ba9d; asc     ;;
 4: len 4; hex 000146d3; asc   F ;;


# 发生死锁的第二个事务B
*** (2) TRANSACTION:
TRANSACTION 5315754292, ACTIVE 5 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s)
MySQL thread id 13339, OS thread handle 139836355770112, query id 36923052145 localhost root statistics
select * from t1 where id=1 for update

# 事务B持有的行锁（id=2上的Record Lock）
*** (2) HOLDS THE LOCK(S):
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754292 lock_mode X locks rec but not gap
Record lock, heap no 3 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000002; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 8200001036011d; asc     6  ;;
 3: len 4; hex 8007ba9d; asc     ;;
 4: len 4; hex 000146d3; asc   F ;;


# 事务B在等待的行锁（id=1上的Record Lock）
*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 688 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754292 lock_mode X locks rec but not gap waiting
Record lock, heap no 2 PHYSICAL RECORD: n_fields 5; compact format; info bits 0
 0: len 4; hex 80000001; asc     ;;
 1: len 6; hex 00013cd7f90c; asc   <   ;;
 2: len 7; hex 82000010360110; asc     6  ;;
 3: len 4; hex 80021d42; asc    B;;
 4: len 4; hex 000aee94; asc     ;;

# 回滚第二个事务B（两个事务代价一样，但事务B启动时间更晚）
*** WE ROLL BACK TRANSACTION (2)
```

在 `SHOW ENGINE INNODB STATUS` 输出结果中，只能保存最后一次死锁事件，如果想要记录全部死锁事件，需要设置 `innodb_print_all_deadlocks=1`，就会在选项 `log_error` 指向的日志文件中，记录所有死锁事件。

## 3. 查看分析行锁等待

事实上，如果只看死锁日志的话，是很难直接分析出死锁发生的原因，通常要采用推测模拟的方式来复现死锁场景。或者观察死锁发生的规律，在容易发生死锁的时间段里设置 `general_log=1`，记录那个时段的所有请求，在死锁发生后再关闭该选项，然后结合死锁日志，分析那个时段的请求日志，判断死锁产生原因。


**参考资料**
- [Deadlocks in InnoDB](https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html)

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
