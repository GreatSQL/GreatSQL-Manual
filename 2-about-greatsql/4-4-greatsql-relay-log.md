# Relay Log（中继日志）

## 什么是中继日志（Relay Log）

### 简介
中继日志（Relay Log）是用于复制过程的一个关键组件。它在从服务器上转储记录由主服务器接收到的二进制日志事件。然后，从服务器读取中继日志，重放这些事件，从而使自身的数据与主服务器保持一致。中继日志有助于实现数据同步和容错机制。

从服务器上依托中继日志，还可以成为多层复制结构中的级联节点，例如 A => B => C 这样的复制关系，需要在服务器 B 上开启中继日志，那么服务器 C 就可以最终实现和服务器 A 的数据保持一致。也正是这个原因，所以被称为中继日志。

### 中继日志的作用

中继日志的主要功能有几种：

1. **数据复制**：中继日志是复制架构中用于记录主服务器上的二进制日志事件的日志文件。它们确保从服务器能够获取并执行这些事件，从而保持与主服务器数据一致。
2. **容错与恢复**：在网络中断或主服务器临时不可用的情况下，中继日志允许从服务器继续处理已接收但未应用的事件，确保数据的一致性和完整性。
3. **异步复制**：通过中继日志，从服务器可以异步地重放主服务器的日志事件，而不必实时处理，增强系统的容错性和稳定性。

## 管理与配置

中继日志相关的主要配置参数有以下几个：

- `relay_log`
  
  指定中继日志文件的名称和路径，可以只设置文件名，也可以设置全路径。例如：`relay_log = /data/GreatSQL/relay-log`，则会在 /data/GreatSQL 目录下生成以 relay-log 开头以数字编号为后缀的中继日志文件。例如：

```bash
ls -la relay-log*

-rw-r----- 1 mysql mysql 204 Jul  5 14:49 relay-log.000001
-rw-r----- 1 mysql mysql 204 Jul  5 14:49 relay-log.000002
-rw-r----- 1 mysql mysql 204 Jul  5 14:49 relay-log.000003
-rw-r----- 1 mysql mysql 204 Jul  5 14:49 relay-log.000004
-rw-r----- 1 mysql mysql 204 Jul  5 14:49 relay-log.000005
-rw-r----- 1 mysql mysql 204 Jul  5 14:49 relay-log.000006
-rw-r----- 1 mysql mysql 157 Jul  5 14:49 relay-log.000007
-rw-r----- 1 mysql mysql 133 Jul  5 14:49 relay-log.index
```
其中，`relay-log.index` 是中继日志索引文件，下面会介绍。

如果当前服务器在配置主从复制时，指定了复制通道名称（Replication channel），那么中继日志文件名就是另一个样子的了，例如：

```sql
-- 配置主从复制时，指定复制通道名称
CHANGE MASTER TO MASTER_AUTO_POSITION = 1 FOR CHANNEL 'repl-channel-01';
```

这时查看中继日志的结果是这样的：

```bash
ls -la relay-log*

-rw-r----- 1 mysql mysql 180 Jul  5 14:56 relay-log.000001
-rw-r----- 1 mysql mysql  19 Jul  5 14:56 relay-log.index
-rw-r----- 1 mysql mysql 228 Jul  5 14:57 relay-log-repl@002dchannel@002d01.000001
-rw-r----- 1 mysql mysql 228 Jul  5 14:57 relay-log-repl@002dchannel@002d01.000002
-rw-r----- 1 mysql mysql 157 Jul  5 14:57 relay-log-repl@002dchannel@002d01.000003
-rw-r----- 1 mysql mysql 129 Jul  5 14:57 relay-log-repl@002dchannel@002d01.index
```

类似地，如果当前服务器是 MGR 组复制中的一个成员节点，那么其中继日志文件名就是另一个样子的了，例如：

```bash
ls -la relay-log*

-rw-r----- 1 mysql mysql 180 Jul  5 14:56 relay-log.000001
-rw-r----- 1 mysql mysql 231 Jul  5 14:57 relay-log-group_replication_recovery.000001
-rw-r----- 1 mysql mysql 231 Jul  5 14:57 relay-log-group_replication_recovery.000002
-rw-r----- 1 mysql mysql 157 Jul  5 14:57 relay-log-group_replication_recovery.000003
-rw-r----- 1 mysql mysql 138 Jul  5 14:57 relay-log-group_replication_recovery.index
-rw-r----- 1 mysql mysql  19 Jul  5 14:56 relay-log.index
```

有次也不难想象，当一个服务器既是主从复制的从服务器，又是 MGR 组复制里的成员节点时，它的中继日志会有好几组并存，例如：

```bash
ls -la relay-log*

-rw-r----- 1 mysql mysql 180 Jul  5 14:56 relay-log.000001
-rw-r----- 1 mysql mysql 231 Jul  5 15:00 relay-log-group_replication_recovery.000001
-rw-r----- 1 mysql mysql 231 Jul  5 15:00 relay-log-group_replication_recovery.000002
-rw-r----- 1 mysql mysql 157 Jul  5 15:00 relay-log-group_replication_recovery.000003
-rw-r----- 1 mysql mysql 138 Jul  5 15:00 relay-log-group_replication_recovery.index
-rw-r----- 1 mysql mysql  19 Jul  5 14:56 relay-log.index
-rw-r----- 1 mysql mysql 228 Jul  5 14:57 relay-log-repl@002dchannel@002d01.000001
-rw-r----- 1 mysql mysql 228 Jul  5 14:57 relay-log-repl@002dchannel@002d01.000002
-rw-r----- 1 mysql mysql 228 Jul  5 15:00 relay-log-repl@002dchannel@002d01.000003
-rw-r----- 1 mysql mysql 228 Jul  5 15:00 relay-log-repl@002dchannel@002d01.000004
-rw-r----- 1 mysql mysql 157 Jul  5 15:00 relay-log-repl@002dchannel@002d01.000005
-rw-r----- 1 mysql mysql 215 Jul  5 15:00 relay-log-repl@002dchannel@002d01.index
```

- `relay_log_index`

  指定中继日志索引文件的名称和路径。该文件包含所有中继日志文件的列表。例如：`relay_log_index = /data/GreatSQL/relay-log.index`。

- `relay_log_purge`

  控制是否自动清理不再需要的中继日志文件。默认为 ON。例如：`relay_log_purge = ON`。

- `relay_log_recovery`

  启用或禁用崩溃后中继日志的自动恢复。默认为 OFF，但强烈建议开启以确保数据一致性。例如：`relay_log_recovery = ON`。

- `relay_log_space_limit`

  限制所有中继日志文件使用的总空间大小。如果超过这个限制，将会停止复制。默认为 0，表示不限制空间使用。可以通过适当设置此参数，防止磁盘空间耗尽。例如：`relay_log_space_limit = 0` 表示不限制空间使用。

- `max_relay_log_size`

  设置每个 Relay Log 文件的大小上限，如果该值为0，则表示和 `max_binlog_size` 一样。

- `sync_relay_log`

  控制从服务器在写入中继日志到磁盘时的同步策略，该参数决定了在将中继日志从内存缓冲区写入磁盘时，是否在每次写入后都同时立即刷新到磁盘，以确保数据立即持久化到磁盘上。如果每次写入时都要求立即同步刷新到磁盘，可以增加数据的一致性和安全性，但也会增加 I/O 负担，从而可能影响系统的性能。

  该参数支持以下几种不同设置模式：

    - 0：表示不立即同步刷新到磁盘。在系统崩溃时，可能会丢失部分数据。
    - 1：表示每次写入中继日志时都立即同步刷新到磁盘，确保数据持久化到磁盘。
    - N：表示每 N 次写入中继日志后才刷新到磁盘，这是一个折中方案，既提供了一定的安全性，又减轻了 I/O 负担。
    - 默认值为 10000。

## 管理与维护

### 清理中继日志

设置 `relay_log_purge = ON` 后会自动清理不再需要的中继日志文件。

### 查看中继日志事件

[和 Binlog 类似，支持采用 `mysqlbinlog` 工具来解析查看中继日志，也支持用 `SHOW` 命令来查看](./4-3-greatsql-binary-log.md#_查看_Binlog)，用法如下：

```sql
SHOW RELAYLOG EVENTS [IN 'log_name'] [FROM pos] [LIMIT [offset,] row_count]
```

### 检查中继日志

可以使用 `SHOW SLAVE STATUS` 命令来查看中继日志的状态和当前处理的位置。例如：

```sql
SHOW SLAVE STATUS\G
...
               Relay_Log_File: relay-log.000001
                Relay_Log_Pos: 4
        Relay_Master_Log_File:
              Relay_Log_Space: 157
      Slave_SQL_Running_State: Replica has read all relay log; waiting for more updates
...
```

上述结果中，从 `Relay_Log_File` 和 `Relay_Log_Pos` 字段就可以看到中继日志当前的最新文件名以及当前事件处理的位置。

上述结果中，其他无关信息已被过滤

### 恢复中继日志

当从服务器崩溃恢复时，设置 `relay_log_recovery = ON`，GreatSQL 将自动从崩溃点进行恢复，确保数据一致性。

## 中继日志的作用

下图展示了在级联的主从复制结构中，中继日志是如何发挥作用的：

![主从复制原理图](./4-4-greatsql-relay-log-01.png)

从服务器上的 I/O 线程（`io_thread`）接收来自主服务器的 Binlog 并转储到从服务器本地文件成为中继日志，然后从服务器上的 SQL 线程（`sql_thread`）读取中继日志并重放应用到从服务器，从而使从服务器和主服务器的数据保持一致，在从服务器重放过程中也会再次记录 Binlog，这才能使得它成为新的主服务器。

## 使用注意事项

1. **磁盘空间管理**：确保有足够的磁盘空间来存储中继日志，特别是在复制负载较大时，避免因空间不足导致复制中断。
2. **定期监控**：使用`SHOW SLAVE STATUS`命令定期监控复制状态，确保中继日志正常工作，及时发现和处理复制延迟或错误。
3. **自动清理**：启用`relay_log_purge`参数，自动清理不再需要的中继日志文件，避免磁盘空间被耗尽。
4. **安全性**：保护中继日志文件的访问权限，防止未经授权的访问和修改，确保数据安全。
5. **一致性检查**：定期检查从服务器的数据一致性，确保复制过程没有遗漏或错误的事件应用。

通过合理的配置和管理，可以确保MySQL中继日志在复制过程中高效、可靠地工作，保障数据的一致性和系统的稳定性。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
