# Event Scheduler/事件调度器
---

## 概述

在 GreatSQL 中，Event Scheduler/事件调度器是一种允许在服务器端定义和调度事件的机制，这些事件可以在指定的时间间隔或特定的时间点自动执行预定义的 SQL 语句。

事件调度器可以用来替代操作系统级的计划任务（如 Linux 的 `cron` 定时任务），用于定期执行维护任务、生成报告或进行其他自动化操作。

## 启用事件调度器

在使用事件调度器之前，需要确保它在 GreatSQL 服务器上已启用。

1. **检查事件调度器状态**

```sql
greatsql> SHOW VARIABLES LIKE 'event_scheduler';
```

2. **启用事件调度器**

可以通过以下几种方式启用事件调度器：

- 在 GreatSQL 配置文件 `my.cnf` 中设置

```ini
[mysqld]
# 默认启用，设置为 OFF 表示关闭
event_scheduler=ON
```

- 在线动态启用

```sql
greatsql> SET GLOBAL event_scheduler = ON;
```

- 还可以在线动态关闭

```sql
greatsql> SET GLOBAL event_scheduler = OFF;
```


## 创建事件

创建事件的基本语法如下：

```sql
CREATE EVENT event_name
ON SCHEDULE schedule
DO
    event_body;
```

- `event_name`：事件的名称。
- `schedule`：事件的调度计划，定义事件何时运行。
- `event_body`：事件执行的 SQL 语句。

## 示例

1. **创建一个每分钟执行一次的事件**

```sql
greatsql> CREATE EVENT my_1m_event
ON SCHEDULE EVERY 1 MINUTE
DO
    INSERT INTO log_table (aid, message, log_time) VALUES (0, 'Event triggered', NOW());
```

2. **创建一个在特定时间点只执行一次的事件**

```sql
greatsql> CREATE EVENT my_once_event
ON SCHEDULE AT '2024-05-23 12:00:00'
DO
    UPDATE my_table SET status = 1, update_time = NOW() WHERE aid = 1;
```

只执行一次（一次性）的时间调度器，在执行完毕后，会被自动删除，相应的信息会记录到 error log 中：

```log
[Note] [MY-010044] [Server] Event Scheduler: Last execution of tpch.my_once_event. Dropping.
[Note] [MY-010450] [Server] Event Scheduler: Dropping greatsql.my_once_event
```

3. **创建一个每天执行一次的事件**

```sql
greatsql> CREATE EVENT my_daily_event
ON SCHEDULE EVERY 1 DAY
STARTS '2024-05-23 00:00:00'
DO
    -- 每天删除 30 天前写入的历史数据
    DELETE FROM my_table WHERE created_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 修改和删除事件

- **修改事件**

可以使用 `ALTER EVENT` 语句修改事件：

```sql
-- 先改名，后修改事件执行频率
greatqsl> ALTER EVENT my_1m_event RENAME TO my_2m_event;
greatsql> ALTER EVENT my_2m_event
ON SCHEDULE EVERY 2 MINUTE;
```

- **删除事件**

可以使用 `DROP EVENT` 语句删除事件：

```sql
greatsql> DROP EVENT IF EXISTS my_2m_event;
```

## 查看事件

可以通过 `SHOW EVENTS` 语句查看数据库中的事件：

```sql
greatsql> SHOW EVENTS;
```

或查询 `information_schema` 数据库中的 `EVENTS` 表：

```sql
-- 查询条件中的 greatsql 替换成你自己的数据库名
greatsql> SELECT * FROM information_schema.EVENTS WHERE EVENT_SCHEMA = 'greatsql';
```

当事件执行遇到错误（例如因为 SQL 写错）则会记录到错误日志中，类似下面这样：

```log
[ERROR] [MY-010045] [Server] Event Scheduler: [root@localhost][greatsql.my_once_event] Unknown column 'aid' in 'where clause'
```

## 使用注意事项

1. **事件调度器的状态**

- 确保事件调度器已启用（`event_scheduler = ON`），否则事件不会执行。

2. **事件权限**

- 用户需要有 `EVENT` 权限才能创建、修改或删除事件。

3. **时间和时区**

- 事件的调度时间基于服务器的时区。确保服务器时区设置正确，以避免调度混乱。

4. **资源消耗**

- 频繁执行的事件可能会增加服务器的负载，特别是在大规模系统中。合理设计事件的执行频率和复杂度，以避免性能问题。

5. **事件错误处理**

- 如果事件执行过程中出现错误，事件可能会停止运行。建议在事件中包含必要的错误处理机制，或定期检查事件状态。

6. **持久性**

- 事件在创建时是持久化存储在数据库中的，即使数据库重启，事件也会保留。

7. **日志记录**

- 对重要的事件操作建议记录日志，以便在调试或审计时参考。

8. **对主从复制、MGR 的影响**

- 在主从复制、MGR 结构中，主节点上创建事件调度器后对数据库所产生的修改，都可以正常复制到从节点，无需在从节点额外创建相同的时间调度器。要注意在执行时间调度器时不要临时关闭 binlog（设置 `sql_log_bin = 0`），避免造成主从节点数据不一致。


## 小结

GreatSQL 事件调度器为数据库管理和维护提供了强大的自动化功能。

通过合理配置和使用事件调度器，可以实现定期任务的自动执行，减轻手动操作的负担，提高数据库管理的效率和可靠性。

在使用过程中，需要注意事件的调度频率、系统资源消耗及错误处理等，以确保事件调度的高效和稳定。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
