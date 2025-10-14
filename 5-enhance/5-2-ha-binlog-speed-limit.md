# Binlog 读取限速
---

## 简介

在主从复制中，由从节点向主节点发起 Binlog 读取请求，如果读取太快或并发太多线程就会加大主节点的网络负载压力。

在MGR集群中，当有新节点加入时，主节点可能需要瞬间传输大量Binlog数据到从节点，如果读取太快或同时有多个新节点加入就会加大主节点的网络负载压力。

在以上两种场景中，都应该考虑对Binlog读取进行限速。

## 新增系统参数

新增系统参数 `rpl_read_binlog_speed_limit` 用于控制从节点上向主节点发起 Binlog 读取请求的限速，这对于控制主从复制中的网络带宽使用率、降低主节点网络负载压力、或在数据恢复过程中降低消耗资源非常有用。

当 `rpl_read_binlog_speed_limit` 参数值为大于 0 的整数时，从节点会按照指定的速率（单位为 KB/s）向主节点请求读取 Binlog，从而实现流量控制。当设置为 0 时，表示不启用限速模式。

该系统参数可在从节点端设置生效。

| System Variable Name | rpl_read_binlog_speed_limit |
| -------------------- | --------------------------- |
| Variable Scope       | Global                      |
| Dynamic Variable     | Yes                         |
| Type                 | Integer                     |
| Default Value        | 0                           |
| Minimum Value        | 0                           |
| Maximum Value        | 4294967295                  |
| Unit                 | KB/s                        |

## 配置方法

- 动态设置

  可以在运行时通过命令动态修改这个参数，无需重启服务。例如，要限制速度为 100KB/s，执行下面命令：
```sql
SET GLOBAL rpl_read_binlog_speed_limit=100;
```

- 配置文件设置

  若要使该设置持久化生效，可以在配置文件中添加或修改以下内容：

  ```ini
  [mysqld]
  rpl_read_binlog_speed_limit = 100
  ```
  然后重启服务使设置生效。

- 查看限速状态

新增状态变量`Rpl_data_speed`显示当前binlog限速的状态，可以通过执行`SHOW GLOBAL STATUS LIKE 'Rpl_data_speed'`查看，例如

```sql
greatsql> SHOW GLOBAL STATUS LIKE 'Rpl%spee%';
+----------------+------------------+
| Variable_name  | Value            |
+----------------+------------------+
| Rpl_data_speed | async_rpl=100.00 |
+----------------+------------------+
```
表示当前的Binlog读取限速为100KB/s。

## 注意事项

1. 启用限速模式后，固然可以降低主节点服务器和网络传输的负载压力，但如果设置过低限速值可能会降低主从复制数据同步效率，影响从库上的数据复制时效性。需要根据实际情况和业务需要适当平衡和调整。

2. 在MGR运行过程中的Binlog传输不受该功能限制，只有在新节点加入期间传输Binlog才受限制。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
