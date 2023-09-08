# 行锁及行锁等待分析
---

本文介绍在GreatSQL数据库中，如何查看行锁以及发生行锁等待时如何排查分析。

## 1. 关于行锁
行锁，也称为行级锁、row lock。

在MySQL/GreatSQL数据库中的InnoDB引擎表支持行锁，依赖来实现事务的隔离性。行锁定是一种并发控制机制，允许多个用户同时访问表中的不同数据行，而不会造成数据不一致或冲突。

InnoDB行锁是基于索引的，加锁时逐行扫描并检查和上锁，当要加锁的条件列上没有索引时，则会对表中所有数据都加上行锁。

同一行数据的不同列之间的修改会导致同一把锁上的互斥，不是同一行数据上的修改则是两把不同的锁，可能会产生互斥（也可能不会）。

通常，只有在修改数据时才需要加上互斥锁，只读时默认无需加锁，除非显式指定加锁，例如：`SELECT ... FROM t WHERE id=? FOR SHARE` 或 `SELECT ... FROM t WHERE id=? FOR UPDATE`。

InnoDB行锁加锁方式有以下几种：

- 共享锁（Shared Lock）：多个事务可以同时持有共享锁，以允许并发读取相同的数据行。共享锁不阻止其他事务获取共享锁，但会阻止其他事务获取排他锁。例如：`SELECT ... FROM t WHERE id=? FOR SHARE`。

- 排他锁（Exclusive Lock）：一次只能有一个事务持有排他锁，用于修改或插入数据。排他锁会阻止其他事务获取共享锁或排他锁，确保数据的独占性。例如：`SELECT ... FROM t WHERE id=? FOR UPDATE` 或 `UPDATE t SET c1=? where id=?`。

此外，在InnoDB种还有一种特殊加锁方式，叫做意向锁（Intention Lock），分为两种：
- 意向共享锁（Intention Shared Lock / IS）：当要读取表中数据时，同时要对该表加上IS锁。
- 意向排他锁（Intention Exclusive Lock / IX）：当要修改表中数据时，同时要对该表加上IX锁。

上述两种意向锁通常是对数据表级加锁，不是行锁。

上述几个不同加锁方式的互斥表格如下：

| \  | IS | IX | S | X |
|--- | ---| ---|---|---| 
| IS |  + |  + | + | - |
| IX |  + |  + | - | - |
| S  |  + |  - | + | - |
| X  |  - |  - | - | - |

表格中的 "+" 表示兼容，"-" 表示不兼容。

用文字总结成以下几条规则：
1. 意向锁之间相互兼容，因为加IX、IS锁的作用是为了申请对数据行上的X、S锁。
1. 表级S锁和X、IX锁不兼容，因为表级加上S锁后，就不允许其他事务再加X锁，相当于是加上了"只读保护"。
1. 表级X锁和IS、IX、S、X均不兼容，因为表级加上X锁后，可能会修改表结构或修改表数据，这时候要加上"只写保护"，避免其他事务修改表结构或修改表数据。
1. 加上行级X锁后，不会被别的读写事务阻塞，因为InnoDB支持多个行级X锁并存，只要不是在相同的数据行上加锁（即支持同时修改多行数据）。


InnoDB行锁有几种不同的加锁粒度（范围）：

- 记录锁（Record Lock）
	- 记录锁是在行级别上的锁，用于保护单个数据行，不包括两行中间的间隙（Gap）。
	- 如果事务Trx1在行R1上持有共享锁（S），其他事务Trx2可以同时持有共享锁（S），但不能持有排他锁（X）。
	- 如果事务Trx1在行R1上持有排他锁（X），其他事务Trx2不能同时持有任何类型的锁。
	- 主键索引、唯一索引默认添加 Record Lock。
- 间隙锁（Gap Lock）
	- 间隙锁用于锁定记录之间的范围，而不是单个行。它用于确保在一个范围内的插入操作不会破坏唯一性约束。
	- 当事务Trx1持有间隙锁（Gap）时，其他事务Trx2不能在同一间隙内插入新行，但可以在其他间隙内插入新行。
	- 间隙锁可以防止幻读问题，即事务在两次查询之间发生了新行插入。
- 意向插入锁（Intention Insert Lock）
	- 是一种特殊类型的间隙锁（Gap Lock），用于控制对一个数据表中间隙（Gap）的插入操作。
	- 专门用于协调多个事务并发插入新记录的场景，确保数据的完整性和一致性。
- Next-Key Lock
	- 是InnoDB引擎中特有的加锁方式，它结合了记录锁（Record Lock）和间隙锁（Gap Lock）。
	- 当事务Trx1对某一范围的数据行进行操作时，它会锁定 **满足条件的记录** 以及 **这些记录之间的间隙**。
	- 它用于确保唯一性约束，同时防止幻读。
	- 辅助索引上默认添加 Next-Key Lock。

这些不同的行锁方式允许InnoDB引擎在多个事务同时访问数据库时保持数据的一致性和完整性，同时提供了灵活性以满足不同的并发需求。

## 2. 查看行锁状态
可以通过执行 `SHOW ENGINE INNODB STATUS\G` 或查看 `performance_schema.data_locks` 来观察行锁状态。

选项 `innodb_status_output_locks` 用于设置是否在执行 `SHOW ENGINE INNODB STATUS` 时显示行锁信息，默认关闭，建议打开。

选用sysbench创建的标准测试表观察，先采用两个不同视角来看表数据的组织顺序：
```
greatsql> select id, k           greatsql> select k, id
  from t1 order by id;            from t1 order by k;
+----+--------+               +--------+----+
| id | k      |               | k      | id |
+----+--------+               +--------+----+
|  1 | 138562 |               | 116311 |  3 |
|  2 | 506525 |               | 138562 |  1 |
|  3 | 116311 |               | 169091 |  6 |
|  4 | 953626 |               | 211310 |  5 |
|  5 | 211310 |               | 347368 | 10 |
|  6 | 169091 |               | 506525 |  2 |
|  7 | 680431 |               | 680431 |  7 |
|  8 | 995844 |               | 901640 |  9 |
|  9 | 901640 |               | 953626 |  4 |
| 10 | 347368 |               | 995844 |  8 |
+----+--------+               +--------+----+
```
也就是分别根据主键索引、辅助索引的组织顺序读取数据，有助于理解下面加锁的例子。

启动一个事务，并锁定一行数据：
```
greatsql> BEGIN; SELECT * FROM t1 WHERE k = 211310 FOR UPDATE;
...
*************************** 1. row ***************************
 id: 5
  k: 211310
  c: 79230092690-18015886351-20814229767-74051492749-92766406337-56361550942-61071912119-36644661046-06519823634-83902323394
pad: 75239007095-21240899951-18845450077-03788416707-63186498182
```

在另一个会话观察行锁信息：
```
greatsql> SHOW ENGINE INNODB STATUS\G
...
# 事务ID，事务活跃时长
---TRANSACTION 5315754169, ACTIVE 4 sec

# 有4把锁，其中3个行锁，占用内存
4 lock struct(s), heap size 1128, 3 row lock(s)

# 连接ID，OS层线程信息，查询ID
MySQL thread id 13312, OS thread handle 139836433352448, query id 36923051665 localhost root

# 表级加IX锁
TABLE LOCK table `greatsql`.`t1` trx id 5315754169 lock mode IX

# 辅助索引 idx_k 上加锁 Next-Key Lock | X，tablespace_id=685，pageno=5，heapno=5（k = 211310这条记录）
# 锁定两个列，因为idx_k是辅助索引，索引树中包含主键索引列id
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754169 lock_mode X
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
# 16进制表示，转成10进制是211310，即k=211310
 0: len 4; hex 8003396e; asc   9n;;
# 16进制表示，转成10进制是5，即id=5
 1: len 4; hex 80000005; asc     ;;

# 主键索引 PRIMARY 上加锁 Record Lock | X，tablespace_id=685，pageno=4，heapno=6（id = 5这条记录）
# 主键索引上包含所有列
RECORD LOCKS space id 685 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754169 lock_mode X locks rec but not gap
Record lock, heap no 6 PHYSICAL RECORD: n_fields 6; compact format; info bits 0
 0: len 4; hex 80000005; asc     ;;
 1: len 6; hex 00003df5e425; asc   =  %;;
 2: len 7; hex 01000016982efd; asc      . ;;
 3: len 4; hex 8003396e; asc   9n;;
 4: len 30; hex 37393233303039323639302d31383031353838363335312d323038313432; asc 79230092690-18015886351-208142; (total 120 bytes);
 5: len 30; hex 37353233393030373039352d32313234303839393935312d313838343534; asc 75239007095-21240899951-188454; (total 60 bytes);

# 辅助索引 idx_k 上加锁 Gap Lock | X（在k=347368,id=10的前面加上Gap Lock，因为k=347368是k=211310的下一条记录）
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754169 lock_mode X locks gap before rec
Record lock, heap no 6 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 80054ce8; asc   L ;;
 1: len 4; hex 8000000a; asc     ;;
```
在这个视角下基本上解释清楚行锁信息了。

再换个视角来查看：
```
greatsql> select * from performance_schema.data_locks;
+--------+-----------------------------------------+-----------------------+-----------+----------+---------------+-------------+----------------+-------------------+------------+-----------------------+-----------+---------------+-------------+------------+
| ENGINE | ENGINE_LOCK_ID                          | ENGINE_TRANSACTION_ID | THREAD_ID | EVENT_ID | OBJECT_SCHEMA | OBJECT_NAME | PARTITION_NAME | SUBPARTITION_NAME | INDEX_NAME | OBJECT_INSTANCE_BEGIN | LOCK_TYPE | LOCK_MODE     | LOCK_STATUS | LOCK_DATA  |
+--------+-----------------------------------------+-----------------------+-----------+----------+---------------+-------------+----------------+-------------------+------------+-----------------------+-----------+---------------+-------------+------------+
| INNODB | 139846278460776:1881:139846301860896    |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | NULL       |       139846301860896 | TABLE     | IX            | GRANTED     | NULL       |
| INNODB | 139846278460776:685:5:5:139846301868064 |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | idx_k      |       139846301868064 | RECORD    | X             | GRANTED     | 211310, 5  |
| INNODB | 139846278460776:685:4:6:139846301868408 |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | PRIMARY    |       139846301868408 | RECORD    | X,REC_NOT_GAP | GRANTED     | 5          |
| INNODB | 139846278460776:685:5:6:139846301868752 |            5315754169 |     11576 |       98 | greatsql      | t1          | NULL           | NULL              | idx_k      |       139846301868752 | RECORD    | X,GAP         | GRANTED     | 347368, 10 |
+--------+-----------------------------------------+-----------------------+-----------+----------+---------------+-------------+----------------+-------------------+------------+-----------------------+-----------+---------------+-------------+------------+

# 去掉一些用处不大的信息后
greatsql> select ENGINE_LOCK_ID, ENGINE_TRANSACTION_ID, INDEX_NAME, LOCK_TYPE, LOCK_MODE, LOCK_STATUS, LOCK_DATA from performance_schema.data_locks;
+-----------------------------------------+-----------------------+------------+-----------+---------------+-------------+------------+
| ENGINE_LOCK_ID                          | ENGINE_TRANSACTION_ID | INDEX_NAME | LOCK_TYPE | LOCK_MODE     | LOCK_STATUS | LOCK_DATA  |
+-----------------------------------------+-----------------------+------------+-----------+---------------+-------------+------------+
| 139846278460776:1881:139846301860896    |            5315754171 | NULL       | TABLE     | IX            | GRANTED     | NULL       |
| 139846278460776:685:5:5:139846301868064 |            5315754171 | idx_k      | RECORD    | X             | GRANTED     | 211310, 5  |
| 139846278460776:685:4:6:139846301868408 |            5315754171 | PRIMARY    | RECORD    | X,REC_NOT_GAP | GRANTED     | 5          |
| 139846278460776:685:5:6:139846301868752 |            5315754171 | idx_k      | RECORD    | X,GAP         | GRANTED     | 347368, 10 |
+-----------------------------------------+-----------------------+------------+-----------+---------------+-------------+------------+
```
上表中，几个信息解读如下：
- ENGINE_LOCK_ID，锁ID，锁ID格式是内部的，随时可能更改，可以观察到有table_id, tablespace_id, pageno, heapno等信息。
- ENGINE_TRANSACTION_ID，事务ID，请求锁定的事务ID，该锁的持有者。
- INDEX_NAME，索引名。
- LOCK_TYPE，锁类型，表锁/行锁。
- LOCK_MODE，锁模式，是表级IS/IX锁，还是行级S/X锁，以及行级锁是否包含GAP。
- LOCK_STATUS，锁状态，是否已获得锁（GRANTED），还是被阻塞（WAITING）。
- LOCK_DATA，该锁对应的数据

这两种查看行锁的方式可根据个人喜好自行选择。

## 3. 查看分析行锁等待

可以通过执行 `SHOW ENGINE INNODB STATUS\G` 或查看 `sys.innodb_locK_waits` 来观察行锁状态。

启动两个会话，分别执行下面的事务：

| 时间线 | 事务1 | 事务2|
| --- | --- | --- |
| t1 | begin;<br/>select * from t1 where k = 211310 for update;| |
| t2 | |begin;<br/>begin; update t1 set pad=rand() where k=211310; |

则事务2的请求会被阻塞，直至行锁等待超时退出，报告：
```
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

在事务2等待获得行锁期间，可以观察到行锁等待的情况。
```
greatsql> SHOW ENGINE INNODB STATUS\G
...

# 事务2，等待获得行锁，被阻塞的事务
---TRANSACTION 5315754189, ACTIVE 5 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1128, 1 row lock(s)
MySQL thread id 13336, OS thread handle 139846262703872, query id 36923051957 localhost root updating
update t1 set pad=rand() where k=211310

# 等待获得 idx_k 上（k=211310）的Next-Key Lock | X
------- TRX HAS BEEN WAITING 5 SEC FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754189 lock_mode X waiting
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 8003396e; asc   9n;;
 1: len 4; hex 80000005; asc     ;;

------------------
TABLE LOCK table `greatsql`.`t1` trx id 5315754189 lock mode IX
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754189 lock_mode X waiting
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 8003396e; asc   9n;;
 1: len 4; hex 80000005; asc     ;;

# 事务1，当前持有锁的事务，持有的锁参考上面的解析
---TRANSACTION 5315754188, ACTIVE 24 sec
4 lock struct(s), heap size 1128, 3 row lock(s)
MySQL thread id 13333, OS thread handle 139836264539904, query id 36923051955 localhost root
TABLE LOCK table `greatsql`.`t1` trx id 5315754188 lock mode IX
RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754188 lock_mode X
Record lock, heap no 5 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 8003396e; asc   9n;;
 1: len 4; hex 80000005; asc     ;;

RECORD LOCKS space id 685 page no 4 n bits 80 index PRIMARY of table `greatsql`.`t1` trx id 5315754188 lock_mode X locks rec but not gap
Record lock, heap no 6 PHYSICAL RECORD: n_fields 6; compact format; info bits 0
 0: len 4; hex 80000005; asc     ;;
 1: len 6; hex 00003df5e425; asc   =  %;;
 2: len 7; hex 01000016982efd; asc      . ;;
 3: len 4; hex 8003396e; asc   9n;;
 4: len 30; hex 37393233303039323639302d31383031353838363335312d323038313432; asc 79230092690-18015886351-208142; (total 120 bytes);
 5: len 30; hex 37353233393030373039352d32313234303839393935312d313838343534; asc 75239007095-21240899951-188454; (total 60 bytes);

RECORD LOCKS space id 685 page no 5 n bits 80 index idx_k of table `greatsql`.`t1` trx id 5315754188 lock_mode X locks gap before rec
Record lock, heap no 6 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 4; hex 80054ce8; asc   L ;;
 1: len 4; hex 8000000a; asc     ;;
```

或者换个视角观察：
```
greatsql> select * from sys.innodb_locK_waits\G
*************************** 1. row ***************************
                wait_started: 2023-09-07 14:03:53
                    wait_age: 00:00:31					#<-- 行锁等待了31秒
               wait_age_secs: 31                #<-- 行锁等待了31秒
                locked_table: `greatsql`.`t1`
         locked_table_schema: greatsql
           locked_table_name: t1
      locked_table_partition: NULL
   locked_table_subpartition: NULL
                locked_index: idx_k             #<-- 被锁住的索引
                 locked_type: RECORD            #<-- 锁类型，是Next-Key Lock
              waiting_trx_id: 5315754189        #<-- 等待（被阻塞）的事务ID
         waiting_trx_started: 2023-09-07 14:03:53
             waiting_trx_age: 00:00:31
     waiting_trx_rows_locked: 1                 #<-- 被锁定的行数
   waiting_trx_rows_modified: 0                 #<-- 被锁定的行数中，有多少行被修改
                 waiting_pid: 13336             #<-- 等待事务对应的PROCESSLIST_ID
               waiting_query: update t1 set pad=rand() where k=211310    #<-- 被阻塞的事务SQL
             waiting_lock_id: 139846278460776:685:5:5:139846301868064
           waiting_lock_mode: X                 #<-- 等待获得排他锁
             blocking_trx_id: 5315754188        #<-- 持有锁的事务ID
                blocking_pid: 13333             #<-- 持有锁事务对应的PROCESSLIST_ID
              blocking_query: NULL              #<-- 持有锁事务当前活跃的SQL，因为SQL已经执行完（但事务仍未提交），所以显示为NULL
            blocking_lock_id: 139846278459928:685:5:5:139846301553696
          blocking_lock_mode: X                 #<-- 持有排他锁
        blocking_trx_started: 2023-09-07 14:03:34
            blocking_trx_age: 00:00:50          #<-- 持有时长
    blocking_trx_rows_locked: 3                 #<-- 锁定多少行数据（实际上这里是指有3把行锁，即辅助索引上的Next-Key锁、主键索引上的Record锁以及辅助索引上下一条记录前面的Gap锁）
  blocking_trx_rows_modified: 0                 #<-- 锁定的数据中，有多少行被修改
     sql_kill_blocking_query: KILL QUERY 13333  #<-- 解锁方法之一
sql_kill_blocking_connection: KILL 13333        #<-- 解锁方法之二
```

在上面的输出结果中，甚至还给出了解锁方法，即KILL当前正在执行的SQL或连接。不过这种是比较粗暴的做法，最好是找到持有行锁的那个事务，主动发起COMMIT/ROLLBACK结束这个事务，就可以释放相应的行锁了。

利用上述方法，就可以清晰观察InnoDB表当前存在的行锁以及行锁等待，同时建议针对行锁等待设置相应的监控告警规则，例如当行锁等待超过10秒就发出告警，更多关于监控告警的内容可参考：[监控告警](../6-oper-guide/3-monitoring-and-alerting.md)。

## 4. 行锁等待优化建议

为了避免产生大量、长时间的行锁等待，建议适当调低行锁等待时长阈值 `innodb_lock_wait_timeout`，在[GreatSQL my.cnf模板](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.32-24)中，这个阈值设置为10(秒)，可根据实际情况适当调整，通常建议不超过120(秒)。

**参考资料**
- [InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
