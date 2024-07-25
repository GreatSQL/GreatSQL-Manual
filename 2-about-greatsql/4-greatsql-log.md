# GreatSQL 日志

---

本节介绍 GreatSQL 中的几个重要日志。

## [Error Log/错误日志](./4-1-greatsql-error-log.md)

**错误日志（Error Log）** 主要记录 GreatSQL 服务器启动和停止过程中的信息、服务器在运行过程中发生的故障和异常情况等。

## [Slow Query Log/慢查询日志](./4-2-greatsql-slow-log.md)

**慢查询日志（Slow Log）** 用来记录在 GreatSQL 中响应时间超过阀值的查询请求。慢查询日志可以帮助发现那些执行时间特别长的查询请求，并且有针对性地进行优化，提高系统的整体效率。

## [Binary Log/二进制日志](./4-3-greatsql-binary-log.md)

**二进制日志（Binary log）** 记录了 GreatSQL 数据库中所有的 DDL、DML 等数据库变更事件，但不含没有修改数据的请求（如 `SELECT`、`SHOW` 等请求）。

## [Relay Log/中继日志](./4-4-greatsql-relay-log.md)

**中继日志（Relay log）** 用于主从复制环境中的 Slave 服务器，转储记录了 Master 服务器上的所有数据变更语句，相当于是 Master 服务器上 Binlog 在 Slave 服务器上另存一份为 Relay Log。当 Master 服务器上执行对数据的修改操作后，就会记录相应的 Binlog Event，这些 Event 会被传送到 Slave 服务器上并转储为 Relay Log中。然后 Slave 服务器读取本地的 Relay Log 并将这些 Event 重新执行，就实现了和 Master 服务器数据同步。

## [Redo Log/重做日志](./4-5-greatsql-redo-log.md)

**重做日志（Redo Log）** 记录了事务中对数据修改后的记录，以保证事务的持久性。在事务提交时，只有 Redo Log 中的修改被持久化到数据文件。如果数据库意外崩溃了，在重启时会重做 Redo Log 中的修改以恢复数据，这个过程称为前滚。

## [Undo Log/撤销日志](./4-6-greatsql-undo-log.md)

**撤销日志（Undo Log）** 记录了事务中数据修改前的记录（相对应的是，Redo Log 记录的是修改后的记录），用于实现事务的原子性。如果数据库意外崩溃了，在重启时可以利用 Undo Log 回滚（撤销）对数据的修改，将数据恢复到事务执行前的状态，这个过程称为回滚。

## [General Log/通用日志](./4-7-greatsql-general-log.md)

**通用日志（General Log）** 记录了客户端向 GreatSQL 服务器发送的所有请求操作，包括 连接、数据读写请求、退出 等所有行为。服务器会将收到的所有请求记录在日志文件中，通用日志对于 SQL 性能瓶颈分析、死锁发生复现等疑难问题的定位非常有用。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
