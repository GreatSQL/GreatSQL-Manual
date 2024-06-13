# 非阻塞式 DDL

对用户表发起 DDL 操作前，需要先申请 MDL-X 锁，此时如果用户表当前有正在进行中的事务或查询时，会导致 MDL-X 锁的申请被阻塞不能立即获取。由于 MDL-X 锁具有最高优先级，因此当申请 MDL-X 锁被阻塞时，同时还会影响该用户表上的其他新事务、新查询请求，可能会导致这些事务、查询请求继续被阻塞而堆积，可能会严重影响整体业务系统可用性。

下面介绍非阻塞式 DDL 功能的使用方法并解释相关新增选项的作用。

1. 首先修改锁等待时长选项 `lock_wait_timeout`，将其设置为 100 秒。

```sql
greatsql> SET lock_wait_timeout = 100;
```

2. 修改选项 `lock_ddl_polling_mode` 设置，启用该功能。

```sql
greatsql> SET lock_ddl_polling_mode = ON;
```
该选项支持在 session 会话中单独设置，也可以修改全局设置。

3. 可根据业务特点或需要，修改选项 `lock_ddl_polling_runtime`，设置每次尝试申请 MDL-X 锁的时长。

```sql
greatsql> SET lock_ddl_polling_runtime = 1000;
```

原生的 MDL 锁申请是独占式的，也就是在发起 DDL 操作时，需要先申请 MDL-X 锁，如果不能立即申请到，则会被阻塞，直至达到 `lock_wait_timeout` 选项设定的阈值。

启用非阻塞式 DDL 功能后，在不超过 `lock_wait_timeout` 定义的时长内，会进行多次申请 MDL-X 锁的尝试，而非原生的独占申请方式，这就可以在多次重试的间隙释放锁资源允许新事务进行。

选项 `lock_ddl_polling_runtime` 的作用是设置每次尝试申请 MDL-X 锁的最长等待时间。该选项的单位是 ms（毫秒），默认值为 1000，即 1 秒。

4. 新模式对 DDL 的影响

开启非阻塞式 DDL 功能会导致 DDL 请求申请 MDL-X 锁的时间有所延长，增加 DDL 操作超时失败的概率。

非阻塞式 DDL 功能仅支持 `ALTER, OPTIMIZE, TRUNCATE TABLE` 等 DDL 操作。


推荐相关阅读：[InnoDB and Online DDL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html)。


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
