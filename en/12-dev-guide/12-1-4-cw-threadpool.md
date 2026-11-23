# Thread Pool & Connection Parameters
---

## Thread Pool

By default, GreatSQL creates one worker thread per client connection (**one-thread-per-connection**). Since system resources are limited and creating and destroying threads also incurs additional overhead, under this mode the overall database throughput will drop noticeably once the number of connections spikes suddenly.

GreatSQL introduces the thread pool (**Thread pool**) feature, which avoids throughput degradation caused by resource contention when the number of connections spikes suddenly, and makes GreatSQL performance more stable.

For details, see: [Thread Pool](../5-enhance/5-1-highperf-thread-pool.md)

### Checking Whether the Thread Pool Feature Is Enabled
```sql
greatsql> SHOW GLOBAL VARIABLES LIKE "thread_handling";
+-----------------+-----------------+
| Variable_name   | Value           |
+-----------------+-----------------+
| thread_handling | pool-of-threads |
+-----------------+-----------------+
1 row in set (0.01 sec)
```
As shown in the output, when `thread_handling` is `pool-of-threads`, the thread pool feature is enabled.

### How to Enable the Thread Pool Feature

Set the `thread_handling` option to `pool-of-threads` in the my.cnf configuration file and restart the GreatSQL service to enable the thread pool feature:
```ini
[mysqld]
thread_handling = "pool-of-threads"
```

## Connection Parameters

In GreatSQL, the common connection parameters include:
- `max_connect_errors`: the maximum number of connection errors allowed for a single user
- `max_connections`: the maximum number of connections allowed for the instance
- `max_user_connections`: the maximum number of connections allowed for a user
- `connect_timeout`: the connection timeout for a user
- `delayed_insert_timeout`: the timeout for delayed insert
- `interactive_timeout`: the timeout for interactive connections
- ......

Use `SHOW GLOBAL VARIABLES LIKE` to view the relevant parameter values.
```sql
SHOW GLOBAL VARIABLES LIKE "%max_connect%";
```

During development, it is recommended to set these parameters to improve the performance of connecting to GreatSQL.

- `max_connect_errors`: recommended value 1000
- `max_connections`: recommended value 1024
- `max_user_connections`: recommended value is half of the `max_connections` parameter
- `connect_timeout`: recommended value 10 seconds
- `delayed_insert_timeout`: recommended value 300 seconds
- `interactive_timeout`: recommended value 600 seconds
- ......

Use `SET GLOBAL` to modify these parameter values.
```sql
SET GLOBAL max_connect_errors=1000;
```




**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
