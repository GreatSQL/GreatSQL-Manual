# MGR 网络开销阈值
---

新增相应选项 `group_replication_request_time_threshold`。

在MGR结构中，事务的开销包含网络层以及本地资源（例如CPU、磁盘I/O等）开销。当事务响应较慢想要分析性能瓶颈时，可以先确定是网络层的开销还是本地资源性能瓶颈导致的。通过设置选项 `group_replication_request_time_threshold` 即可记录超过阈值的事件，便于进一步分析。输出的内容记录在error log中，例如：
```log
[Note] Plugin group_replication reported: 'MGR request time:30808us, server id:3306879, thread_id:17368'
```
表示当时这个事务在MGR层的网络开销耗时30808微秒（30.808毫秒），再去查看那个时段的网络监控，分析网络延迟较大的原因。

选项 `group_replication_request_time_threshold` 单位是毫秒，默认值是0，最小值0，最大值100000。如果MGR跑在局域网环境，则建议设置为50 ~ 100毫秒区间，如果是运行在跨公网环境，则建议设置为1 ~ 10秒左右。另外，当该值设置为1 ~ 9之间时，会自动调整为10（毫秒）且不会提示warning，如果设置为0则表示禁用。

| System Variable Name    | group_replication_request_time_threshold |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | YES |
| Type    | Integer |
| Permitted Values |    [0, 100000] |
| Default    | 0 |
| Description    |单位：毫秒。<br/>参数值设置>0，当事务的MGR层网络开销超过该阈值时，会在error log中记录一条日志。<br/>设置为0时，表示禁用。<br/>建议：当怀疑可能因为MGR通信耗时过久成为事务性能瓶颈时再在线动态开启，平时没必要开启。|



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
