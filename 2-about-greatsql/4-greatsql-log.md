# 图解 GreatSQL 日志

---

本章文档主要介绍GreatSQL日志

## [图解GreatSQL Error Log](./4-1-greatsql-error-log.md)

**错误日志（Error Log）** 主要记录 GreatSQL 服务器启动和停止过程中的信息、服务器在运行过程中发生的故障和异常情况等。

## [图解GreatSQL Slow Log](./4-2-greatsql-slow-log.md)

**慢查询日志（Slow Log）** 用来记录在 GreatSQL 中响应时间超过阀值的语句。主要作用是，帮助我们发现那些执行时间特别长的SQL查询，并且有针对性地进行优化，从而提高系统的整体效率。

## [图解GreatSQL Binary Log](./4-3-greatsql-binary-log.md)

**二进制日志（Binary log）** 它记录了数据库所有执行的DDL和DML等数据库更新事件的语句，但是不包含没有修改任何数据的语句（如数据查询语句select、show等）。

## [图解GreatSQL Relay Log](./4-4-greatsql-relay-log.md)

**中继日志（Relay log）** 用于在主从复制环境中,记录主服务器上的所有数据变更语句。当主服务器上的数据库有更新时,这些更新语句会被记录到Relay Log中。从服务器会连接到主服务器,并读取Relay Log中的语句,将这些语句在自己的数据库中重新执行一次,以达到数据同步的目的。

## [图解GreatSQL Redo Log](./4-5-greatsql-redo-log.md)

**重做日志（Redo Log）** 记录了必须重做的修改,以保证事务的持久性。在事务提交时,只有Redo Log中的修改被持久化到数据文件。如果数据库崩溃,服务器重启时会重做Redo Log中的修改以恢复数据。

## [图解GreatSQL Undo Log](./4-6-greatsql-undo-log.md)

**回滚日志（Undo Log）** 记录了必须回滚的修改,用于实现事务的原子性。如果事务只修改了部分数据就发生故障,可以通过Undo Log回滚事务的修改,将数据恢复到事务执行前的状态。

## [图解GreatSQL General Log](./4-7-greatsql-query-log.md)

**通用查询日志（General Log）** 记录了客户端向 GreatSQL 服务器发送的所有SQL语句。服务器会将收到的所有语句记录在日志文件中,查询日志对于定位问题的查询语句和调优SQL非常有用。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
