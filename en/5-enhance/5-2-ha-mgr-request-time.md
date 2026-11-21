# MGR Network Overhead Threshold
---

## Introduction

Transaction overhead in MGR includes network layer overhead and local resource overhead (such as CPU, disk I/O, etc.).

When a transaction responds slowly and you want to analyze the performance bottleneck, you can first determine whether it is caused by network layer overhead or local resource performance bottlenecks.

GreatSQL supports recording requests whose network layer overhead exceeds the time threshold to the log, which is convenient for subsequent optimization analysis.

## New System Variable

The new system variable `group_replication_request_time_threshold` is added. Setting the threshold to a non-zero value enables recording events that exceed the threshold to the error log. For example:
```log
[Note] Plugin group_replication reported: 'MGR request time:30808us, server id:3306879, thread_id:17368'
```
This indicates that the network overhead of this transaction at the MGR layer took 30808 microseconds (30.808 milliseconds). Then check the network monitoring for that period to analyze the cause of the large network delay.

| System Variable Name    | group_replication_request_time_threshold |
| --- | --- | 
| Variable Scope    | Global |
| Dynamic Variable    | YES |
| Type    | Integer |
| Permitted Values |    [0, 100000] |
| Default    | 0 |
| Description    | Unit: milliseconds.<br/>When the parameter value is set to >0, if the MGR layer network overhead of a transaction exceeds this threshold, a log entry is recorded in the error log.<br/>When set to 0, it is disabled. |

## Notes

- If MGR runs in a LAN environment, it is recommended to set the value to the 50 ~ 100 millisecond range; if it runs in a cross-public-network environment, it is recommended to set it to about 1 ~ 10 seconds.

- When the value is set between 1 and 9, it is automatically adjusted to 10 (milliseconds) without a warning being shown. If set to 0, it is disabled.

- Only enable this feature dynamically online when you suspect that MGR communication latency has become a transaction performance bottleneck. There is no need to enable it under normal circumstances.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
