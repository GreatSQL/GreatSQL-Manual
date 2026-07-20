# MGR 网络开销阈值
---

## 简介

在 MGR 中的事务开销包含网络层以及本地资源（例如 CPU、磁盘 I/O 等）开销。

当事务响应较慢想要分析性能瓶颈时，可以先确定是网络层的开销还是本地资源性能瓶颈导致的。

GreatSQL 支持记录在网络层开销超过耗时阈值的请求到日志中，便于后续优化分析。

## 新增系统参数

新增系统参数 `group_replication_request_time_threshold`。设置该参数阈值不为 0，即可记录超过阈值的事件到 error log 中，例如：
```log
[Note] Plugin group_replication reported: 'MGR request time:30808us, server id:3306879, thread_id:17368'
```
表示当时这个事务在 MGR 层的网络开销耗时 30808 微秒（30.808 毫秒），再去查看那个时段的网络监控，分析网络延迟较大的原因。

| System Variable Name    | group_replication_request_time_threshold |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | YES |
| Type    | Integer |
| Permitted Values |    [0, 100000] |
| Default    | 0 |
| Description    | 单位：毫秒。<br/>参数值设置 >0，当事务的 MGR 层网络开销超过该阈值时，会在 error log 中记录一条日志。<br/>设置为 0 时，表示禁用。|

## 注意事项

- 如果 MGR 跑在局域网环境，则建议设置为 50 ~ 100 毫秒区间；如果是运行在跨公网环境，则建议设置为 1 ~ 10 秒左右。

- 当该值设置为 1 ~ 9 之间时，会自动调整为 10（毫秒）且不会提示 warning，如果设置为 0 则表示禁用。

- 当怀疑可能因为 MGR 通信耗时过久成为事务性能瓶颈时再在线动态开启，平时没必要开启。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
