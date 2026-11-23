# GreatSQL Logs

---

This section introduces several important logs in GreatSQL.

## [Error Log](./4-1-greatsql-error-log.md)

The **Error Log** mainly records information during the startup and shutdown of the GreatSQL server, as well as failures and abnormal conditions that occur while the server is running.

## [Slow Query Log](./4-2-greatsql-slow-log.md)

The **Slow Query Log** is used to record query requests in GreatSQL whose response time exceeds a threshold. The slow query log can help discover query requests that take an especially long time to execute, and optimize them in a targeted manner to improve the overall efficiency of the system.

## [Binary Log](./4-3-greatsql-binary-log.md)

The **Binary log** records all database change events such as DDL and DML in the GreatSQL database, but does not include requests that do not modify data (such as `SELECT`, `SHOW`, etc.).

## [Relay Log](./4-4-greatsql-relay-log.md)

The **Relay log** is used on the Slave server in source-replica replication environments, storing and recording all data change statements on the Master server. It is equivalent to a copy of the Master server's Binlog saved as a Relay Log on the Slave server. When data modification operations are executed on the Master server, the corresponding Binlog Events are recorded. These Events are transmitted to the Slave server and dumped into the Relay Log. The Slave server then reads the local Relay Log and re-executes these Events, achieving data synchronization with the Master server.

## [Redo Log](./4-5-greatsql-redo-log.md)

The **Redo Log** records the modifications made to data in transactions, ensuring transaction durability. When a transaction commits, only the modifications in the Redo Log are persisted to the data files. If the database crashes unexpectedly, the modifications in the Redo Log are redone during restart to recover the data. This process is called roll-forward.

## [Undo Log](./4-6-greatsql-undo-log.md)

The **Undo Log** records the state of data before modifications in transactions (in contrast, the Redo Log records the state after modifications), and is used to implement transaction atomicity. If the database crashes unexpectedly, the Undo Log can be used during restart to roll back (undo) the data modifications, restoring the data to its state before the transaction executed. This process is called rollback.

## [General Log](./4-7-greatsql-general-log.md)

The **General Log** records all request operations sent by clients to the GreatSQL server, including connections, data read/write requests, exits, and all other behaviors. The server records all received requests in the log file. The general log is very useful for locating difficult problems such as SQL performance bottleneck analysis and deadlock reproduction.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
