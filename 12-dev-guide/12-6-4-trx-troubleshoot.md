# 事务错误处理
---

本节介绍事务错误处理相关内容。

## 锁等待超时

当请求行锁被阻塞时，就产生锁等待，最长等待时长由选项 `innodb_lock_wait_timeout` 定义，默认值是 50 秒。

当一个 SQL 请求因为锁等待被阻塞时，执行 `SHOW PROCESSLIST` 看到的状态通常是 **updating**，所以如果看到这种状态，一般可以先排查锁等待的原因，例如：

```sql
greatsql> show processlist;
+----+------+-----------+------+---------+------+----------+-----------------------------------------+---------+-----------+---------------+
| Id | User | Host      | db   | Command | Time | State    | Info                                    | Time_ms | Rows_sent | Rows_examined |
+----+------+-----------+------+---------+------+----------+-----------------------------------------+---------+-----------+---------------+
| 91 | root | localhost | trx  | Query   |    0 | init     | show processlist                        |       0 |         0 |             0 |   <- 持有锁的事务
| 98 | root | localhost | trx  | Query   |   35 | updating | update t1 set c3 = 'row11' where id = 1 |   35617 |         0 |             0 |   <- 被阻塞的事务
+----+------+-----------+------+---------+------+----------+-----------------------------------------+---------+-----------+---------------+
```

执行 `SHOW ENGINE INNODB STATUS\G` 可以看到类似下面的输出：

```sql
...
/* 被阻塞的事务，事务ID=2802，PROCESSLIST ID=98，活跃时长 96 秒，状态 updating */
---TRANSACTION 2802, ACTIVE 96 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1128, 2 row lock(s)
MySQL thread id 98, OS thread handle 139691128010496, query id 8599 localhost root updating
update t1 set c3 = 'row11' where id = 1

/* 事务2802在请求下面的锁资源 */
------- TRX HAS BEEN WAITING 7 SEC FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 53 page no 4 n bits 80 index PRIMARY of table `trx`.`t1` trx id 2802 lock_mode X locks rec but not gap waiting
Record lock, heap no 8 PHYSICAL RECORD: n_fields 6; compact format; info bits 0
 0: len 4; hex 00000001; asc     ;;
 1: len 6; hex 000000000af1; asc       ;;
 2: len 7; hex 01000000e70151; asc       Q;;
 3: len 4; hex 00000001; asc     ;;
 4: len 4; hex 00000001; asc     ;;
 5: len 5; hex 726f773131; asc row11;;

------------------

/* 持有锁的事务，事务ID=2801，PROCESSLIST ID=91，活跃时长 112秒，状态 starting */
---TRANSACTION 2801, ACTIVE 112 sec
2 lock struct(s), heap size 1128, 1 row lock(s), undo log entries 1
MySQL thread id 91, OS thread handle 139690606827264, query id 8601 localhost root starting
show engine innodb status
Trx read view will not see trx with id >= 2801, sees < 2800
...
```

遇到上述长时间锁等待问题时，可以查询 `sys.innodb_lock_waits` 确认锁等待源头，将造成锁等待的源头事务提交，或根据 `sql_kill_blocking_query` 或 `sql_kill_blocking_connection` 提供的建议，杀掉相应的连接，回滚该事务，避免造成更多锁阻塞，影响更多业务系统。

更重要的是，要及时监控长事务或造成很多锁的事务，详情参考以下内容
- [锁、等待事件](../6-oper-guide/3-monitoring-and-alerting.md#_2-锁、等待事件)
- [行锁观测监控](./12-6-3-trx-mvcc-and-locking.md#行锁观测监控) 


## 找不到活跃事务对应的线程

查询 `information_schema.INNODB_TRX` 表，列出所有活跃事务时，发现部分事务对应的 `trx_mysql_thread_id` 值为 0，找不到相应的 `PROCESSLIST ID`。

出现这种情况通常是因为这些是进入 PREPARE 状态的 XA 事务，可以用 `XA RECOVER` 查看 XA 事务列表，然后执行 `XA COMMIT` 或 `XA ROLLBACK` 提交/回滚。

具体可参考：[XA 事务](./12-6-1-trx-control.md#xa-事务)。

## 事务提交很慢，或无法提交

以下几种情况可能导致事务提交很慢，或无法提交：
- 系统负载高，这种情况下所有事务响应都很慢；
- 低效 SQL 太多，也就是所谓的慢 SQL，会导致系统负载升高，影响到其他事务；
- 选项 `innodb_thread_concurrency` 值设置为非 0，当前的事务并发又非常高，导致有些事务总是要进入排队等待状态；
- 磁盘空间满了，这种情况下事务无法提交； 
- 可能由于开启了半同步复制（**Semisynchronous Replication**），或者组提交（**group commit**），导致事务提交慢；
- 其他情况。

## 发生死锁

在 [死锁](./12-6-3-trx-mvcc-and-locking.md#死锁) 这部分内容中提到过，偶尔发生死锁不必太担心，除非是频繁发生死锁。

如果频繁发生死锁，可以从以下几方面着手优化：
- 提高事务效率，尤其是事务中每个 SQL 请求的效率，降低持有锁时长；
- 避免使用长事务、大事务，降低事务持有锁时长以及持有的锁数量；
- 适当调低锁等待超时阈值（`innodb_lock_wait_timeout`），避免长时间锁等待；
- 减少显式加锁请求，例如可以执行 `UPDATE` 直接更新某行数据，而不是先执行 `SELECT ... FOR UPDATE` 加锁后再 `UPDATE` 更新；
- 确保每次加锁的条件都有索引，并且保证索引的效率足够高，因为如果没有索引会导致锁住全部记录，索引效率高也可以减少锁定的行数。

通过上面几个措施，相信可以有效降低行锁等待时长以及死锁发生的概率。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
