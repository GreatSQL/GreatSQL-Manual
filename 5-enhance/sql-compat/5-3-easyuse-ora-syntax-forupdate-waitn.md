# Oracle兼容-语法-SELECT ... FOR UPDATE WAIT n
---


## 1. 语法

```sql
SELECT ... FOR UPDATE ... WAIT n
```

## 2. 定义和用法

`SELECT ... FOR UPDATE ... WAIT n` 语句的作用是查询数据并加锁，在申请加锁时，如果不能立即获取行锁资源，则可以指定最多等待的时长。当等待n秒后仍未获得锁，会报告语句执行失败。如果该行没有被锁定，那么会马上返回结果而不需要等待。

关于参数 `n` 的说明：

1. 子句 `WAIT n`中，参数 `n` 的取值范围为：[0, 31536000]，即最久等待1年。

2. 当加锁等待时长参数 `n` 比 `innodb_lock_wait_timeout` 选项值更大时，以后者为准。

3. 等待总时长不包括SQL解析等时间，因此实际等待时间可能会大于n秒。

在GreatSQL中，由于行锁机制和Oracle不同，因此在实际加锁时，是锁定整行数据，无法像Oracle那样只锁定指定的列，不锁定其他列。也就是说，本语法只是兼容Oracle风格用法，实际行锁加锁还和GreatSQL原生行锁机制一样。

## 3. Oracle兼容说明

本语法和在Oracle中区别有以下几点：

1. 在Oracle中无论 `WHERE` 条件是不是索引列，都只会锁定满足条件的数据行；而在GreatSQL中如果非索引列则会锁定全部数据行，在上面已有阐述。

2. 参数 `n` 只支持正整数，其他值会报错。

3. 在Oracle中不支持类似 `SELECT * FROM (SELECT * FROM t1 FOR UPDATE WAIT 1000000) FOR UPDATE WAIT 1` 这种语句；在GreatSQL中，为了兼容原生功能，支持这种语句用法，等待时长以最后一个时间即为准（在本案例中即1秒）。但类似 `SELECT * FROM (SELECT * FROM t1 FOR UPDATE WAIT 10) FOR UPDATE NOWAIT` 这种只有一个 `WAIT n` 的语句，则以派生表的动作为准（在本案例中会等待10秒，而不是执行 `NOWAIT` 逻辑）。

6. 在Oracle中不支持类似 `INSERT INTO t1 SELECT * FROM t1 FOR UPDATE WAIT 3` 这种用法；在GreatSQL中，为了兼容原生功能，也支持这种语句用法，该语句执行时如果遇到锁就等待3秒后再报错。


## 4. 示例

创建测试表并初始化数据：
```sql
greatsql> CREATE TABLE t1(c1 INT, c2 CHAR(10));
greatsql> INSERT INTO t1 VALUES (10, 'r10'), (12, 'r12'), (13, 'r13');
greatsql> SELECT * FROM t1;
+------+------+
| c1   | c2   |
+------+------+
|   10 | r10  |
|   12 | r12  |
|   13 | r13  |
+------+------+
3 rows in set (0.00 sec)

greatsql> CREATE TABLE t2 (c1 INT, c2 CHAR(10));
greatsql> INSERT INTO t2 VALUES (11, 'r21'), (12, 'r22'), (13, 'r23');
greatsql> SELECT * FROM t2;
+------+------+
| c1   | c2   |
+------+------+
|   11 | r21  |
|   12 | r22  |
|   13 | r23  |
+------+------+
3 rows in set (0.00 sec)
```

- 1. 用法1：`FOR UPDATE WAIT n` 。

```
-- 先切换到ORACLE模式
greatsql> SET sql_mode = ORACLE;

-- session1：对 c1=10 记录加锁
greatsql> BEGIN; SELECT * FROM t1 WHERE c1=10 FOR UPDATE;
+------+------+
| c1   | c2   |
+------+------+
|   10 | aa   |
+------+------+
1 row in set (0.01 sec)

-- session2：请求加锁，等待3秒后报错
greatsql> SELECT * FROM t1 WHERE c1=10 FOR UPDATE WAIT 3;
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

- 2. 用法2：`FOR UPDATE OF table.column WAIT n`。

```
greatsql> SET sql_mode = ORACLE;

-- 新建视图
greatsql> CREATE VIEW v1 AS SELECT * FROM t1;

-- session1：对 c1=10 记录加锁
greatsql> BEGIN; SELECT * FROM t1 WHERE c1=10 FOR UPDATE;
+------+------+
| c1   | c2   |
+------+------+
|   10 | aa   |
+------+------+
1 row in set (0.01 sec)

-- session2：对视图加锁也会被阻塞
greatsql> SELECT * FROM v1 WHERE c1=10 FOR UPDATE OF v1.c1 WAIT 3;
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

- 3. 错误用法示例

```
-- 参数n值超限
greatsql> select * from t12 where c1=12 for update wait 31536001;
ERROR 1210 (HY000): Incorrect arguments to wait n
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
