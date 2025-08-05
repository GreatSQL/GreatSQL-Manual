# 非阻塞式 DDL

对用户表发起 DDL 操作前，需要先申请 MDL-X 锁，此时如果用户表当前有正在进行中的事务或查询时，会导致 MDL-X 锁的申请被阻塞不能立即获取。由于 MDL-X 锁具有最高优先级，因此当申请 MDL-X 锁被阻塞时，同时还会影响该用户表上的其他新事务、新查询请求，可能会导致这些事务、查询请求继续被阻塞而堆积，可能会严重影响整体业务系统可用性。

下面介绍非阻塞式 DDL 功能的使用方法并解释相关新增选项的作用。

1. 首先修改锁等待时长选项 `lock_wait_timeout`，将其设置为 100 秒。

```sql
SET lock_wait_timeout = 100;
```

2. 修改选项 `lock_ddl_polling_mode` 设置，启用该功能。

```sql
SET lock_ddl_polling_mode = ON;
```
该选项支持在 Session 会话中单独设置，也可以修改 Global 级别设置（修改完 Global 级别设置后，不会对当前 Session 立即生效，只对新建立的 Session 生效）。

3. 可根据业务特点或需要，修改选项 `lock_ddl_polling_runtime`，设置每次尝试申请 MDL-X 锁的间隔时长（单位：毫秒/ms）。

```sql
SET lock_ddl_polling_runtime = 1000;
```

上述设置的作用是，每间隔1秒尝试申请MDL-X锁，最多不超过MDL锁的总等待时长（100秒）。

4. 新增选项

| System Variable Name | Variable Scope |  Dynamic Variable | Permitted Values | Type | Default | Description |
| --- | --- | --- | --- | --- | --- | --- |
|lock_ddl_polling_mode|Session|YES|[ON/OFF]|ENUM|OFF|是否启用非阻塞式 DDL 特性，默认：不启用|
|lock_ddl_polling_runtime|Session|YES|[200, 31536000]|Integer|1000|非阻塞式 DDL 请求时，每次DDL请求尝试申请MDL-X锁的间隔时长，默认：1000 毫秒（1秒）|


原生的 MDL 锁申请是独占式的，也就是在发起 DDL 操作时，需要先申请 MDL-X 锁，如果不能立即申请到，则会被阻塞，直至达到 `lock_wait_timeout` 选项设定的阈值。

启用非阻塞式 DDL 功能后，在不超过 `lock_wait_timeout` 定义的时长内，会进行多次申请 MDL-X 锁的尝试，而非原生的独占申请方式，这就可以在多次重试的间隙释放锁资源允许新事务进行。

选项 `lock_ddl_polling_runtime` 的作用是设置每次尝试申请 MDL-X 锁的间隔时长。该选项的单位是 ms（毫秒），默认值为 1000，即 1 秒。

5. 新模式对 DDL 的影响

开启非阻塞式 DDL 功能会导致 DDL 请求申请 MDL-X 锁的时间有所延长，增加 DDL 操作超时失败的概率。

非阻塞式 DDL 功能仅支持在 `ALTER TABLE, OPTIMIZE TABLE, TRUNCATE TABLE` 这几个 DDL 操作模式下开启。

6. 案例

在下面的案例进行时，已经先分别修改各自会话中相关的两个选项：

```sql
SET GLOBAL lock_ddl_polling_mode = ON;
SET lock_ddl_polling_runtime = 200;
```

| 时间线 | Session 1 | Session 2 | Session 3 |
| --- | --- | --- | --- |
| T1  | BEGIN;<br/>SELECT * FROM t WHERE id = 1 FOR SHARE;<br>*发起事务，还未提交* | |
| T2  | | ALTER TABLE t ADD c3 INT UNSIGNED;<br/>*对表 t 发起 ALTER TABLE 操作，会被阻塞，提示：*<br/>*Waiting for table metadata lock*||
| T3  | | | SELECT * FROM t LIMIT 1;<br/>*可以返回结果，没有被阻塞*|

同时也能注意到，在 Session 3 中的 `SELECT` 查询请求如果多次执行，则每次的响应时长是不一样的，因为 Session 2 中的 `ALTER TABLE` 请求会多次反复请求 MDL-X 锁，每次间隔时长为 200ms。


推荐相关阅读：[InnoDB and Online DDL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
