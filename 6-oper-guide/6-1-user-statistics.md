# 用户统计 User statistics

---
GreatSQL提供User statistics（用户统计）功能，此功能添加了几个`INFORMATION_SCHEMA`表，几个命令，以及`userstat`变量。这些表和命令可以用于更好地理解服务器活动，并识别负载的来源。此功能默认是关闭的，必须通过将`userstat`设置为`ON`来启用它。它的工作原理是在内存中保留几个哈希表。为了避免全局互斥锁的争用，每个连接都有自己的本地统计信息，这些本地统计信息会偶尔合并到全局统计信息中，之后本地统计信息会被重置为0。

开启User statistics（用户统计）功能：

```sql
greatsql> SET GLOBAL userstat = ON;
```

## 新增系统参数

用户统计功能增加的2个相关参数：

| System Variable Name | userstat                                                     |
| -------------------- | ------------------------------------------------------------ |
| Variable Scope       | global                                                       |
| Dynamic Variable     | YES                                                          |
| Permitted Values     | ON/OFF                                                       |
| Default              | OFF                                                          |
| Description          | 启用或禁用统计信息的收集默认值为 `OFF` ，表示不收集任何统计信息。这是为了确保统计信息收集不会在服务器上造成任何额外的负载，除非需要。 |

| System Variable Name | thread_statistics                                            |
| -------------------- | ------------------------------------------------------------ |
| Variable Scope       | global                                                       |
| Dynamic Variable     | YES                                                          |
| Permitted Values     | ON/OFF                                                       |
| Default              | OFF                                                          |
| Description          | 启用或禁用线程统计信息的收集。默认值为 `OFF` ，表示不收集线程统计信息。这是为了确保统计信息收集不会在服务器上造成任何额外的负载，除非需要。还必须启用该变量 `userstat` 才能收集线程统计信息。 |

## 该功能新增的INFORMATION_SCHEMA表

### 1.客户端统计-[INFORMATION_SCHEMA.CLIENT_STATISTICS](./6-1-1-client-statistics.md)

### 2.索引统计-[INFORMATION_SCHEMA.INDEX_STATISTICS](./6-1-2-index-statistics.md)

### 3.表统计-[INFORMATION_SCHEMA.TABLE_STATISTICS](./6-1-3-table-statistics.md)

### 4.线程统计-[INFORMATION_SCHEMA.THREAD_STATISTICS](./6-1-4-thread-statistics.md)

### 5.用户统计-[INFORMATION_SCHEMA.USER_STATISTICS](./6-1-5-user-statistics.md)

## 新增的命令

- `FLUSH CLIENT_STATISTICS`
- `FLUSH INDEX_STATISTICS`
- `FLUSH TABLE_STATISTICS`
- `FLUSH THREAD_STATISTICS`
- `FLUSH USER_STATISTICS`

以上命令会丢弃指定类型的存储统计信息。

---

- `SHOW CLIENT_STATISTICS`
- `SHOW INDEX_STATISTICS`
- `SHOW TABLE_STATISTICS`
- `SHOW THREAD_STATISTICS`
- `SHOW USER_STATISTICS`

以上命令是显示可从 `INFORMATION_SCHEMA` 表中获取的信息的另种方式。这些命令接受 `WHERE` 子句，且接受但忽略 `LIKE` 条件。

## 新增状态变量

使用`show status like`查看

- Com_show_client_statistics

`Com_show_client_statistics` 语句计数器变量指示语句 `SHOW CLIENT_STATISTICS` 的执行次数。

- Com_show_index_statistics

`Com_show_index_statistics` 语句计数器变量指示语句 `SHOW INDEX_STATISTICS` 的执行次数。

- Com_show_table_statistics

`Com_show_table_statistics` 语句计数器变量指示语句 `SHOW TABLE_STATISTICS` 的执行次数。

- Com_show_thread_statistics

`Com_show_thread_statistics` 语句计数器变量指示语句 `SHOW THREAD_STATISTICS` 的执行次数。

- Com_show_user_statistics

`Com_show_user_statistics` 语句计数器变量指示语句 `SHOW USER_STATISTICS` 的执行次数。

**问题反馈**
---

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
