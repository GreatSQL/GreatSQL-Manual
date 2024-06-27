# 线程池 & 连接参数
---

## 线程池

GreatSQL默认为每个客户端连接创建一个工作线程（**one-thread-per-connection**）。由于系统资源是有限的，并且创建、销毁线程也是有额外开销的，在这种模式下，一旦出现连接数瞬间激增的情况，数据库整体吞吐性能就会明显下降。

GreatSQL中引入线程池（**Thread pool**）特性，可以避免在连接数瞬间激增时因资源竞争而导致系统吞吐下降的问题，使得GreatSQL的性能表现更稳定。

详细描述详见：[线程池（Thread pool）](../5-enhance/5-1-highperf-thread-pool.md)

### 查看线程池特性是否开启
```sql
greatsql> SHOW GLOBAL VARIABLES LIKE "thread_handling";
+-----------------+-----------------+
| Variable_name   | Value           |
+-----------------+-----------------+
| thread_handling | pool-of-threads |
+-----------------+-----------------+
1 row in set (0.01 sec)
```
由输出可知，`thread_handling`为`pool-of-threads`时，表示线程池特性已开启。

### 如何开启线程池特性

在my.cnf配置文件将设置选项`thread_handling`值设为`pool-of-threads`，并重启GreatSQL服务即可启用线程池特性：
```sql
[mysqld]
thread_handling = "pool-of-threads"
```

## 连接参数

在GreatSQL中，关于常用连接参数有：
- `max_connect_errors`：允许单用户连接错误最大值
- `max_connections`：实例最大连接数限制
- `max_user_connections`：用户连接最大限制
- `connect_timeout`：用户连接超时限制
- `delayed_insert_timeout`：延迟插入超时时间
- `interactive_timeout`：交互式连接超时时间
- ......

使用`SHOW GLOBAL VARIABLES LIKE`即可查看相关参数值
```sql
greatsql> SHOW GLOBAL VARIABLES LIKE "%max_connect%";
```

在开发中建议设置这些参数，以提升连接GreatSQL性能。

- `max_connect_errors`：建议设置为1000
- `max_connections`：建议设置为1024
- `max_user_connections`：建议设置为`max_connections`参数的一半
- `connect_timeout`：建议设置为10秒
- `delayed_insert_timeout`：建议设置为300秒
- `interactive_timeout`：建议设置为600秒
- ......

使用`SET GLOBAL`即可修改这些相关参数值
```sql
greatsql> SET GLOBAL max_connect_errors=1000;
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
