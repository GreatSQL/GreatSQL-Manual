# 客户端统计 CLIENT_STATISTICS
---
## CLIENT_STATISTICS表介绍

此表包含有关客户端连接的统计信息。可见性限制为具有 `SUPER` or `PROCESS` 权限的用户

若没`SUPER` or `PROCESS` 权限报错如下：

```bash
greatsql> SELECT * FROM INFORMATION_SCHEMA.CLIENT_STATISTICS\G
ERROR 1227 (42000): Access denied; you need (at least one of) the PROCESS, SUPER privilege(s) for this operation
```

查询此表输出如下：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.CLIENT_STATISTICS\G
*************************** 1. row ***************************
                CLIENT: localhost
     TOTAL_CONNECTIONS: 5
CONCURRENT_CONNECTIONS: 0
        CONNECTED_TIME: 1923.6986942999986
             BUSY_TIME: 0.27151300000000017
              CPU_TIME: 0.10907934100000004
        BYTES_RECEIVED: 6528
            BYTES_SENT: 146
  BINLOG_BYTES_WRITTEN: 104
          ROWS_FETCHED: 19
          ROWS_UPDATED: 0
       TABLE_ROWS_READ: 8789
       SELECT_COMMANDS: 11
       UPDATE_COMMANDS: 5
        OTHER_COMMANDS: 36
   COMMIT_TRANSACTIONS: 20
 ROLLBACK_TRANSACTIONS: 3
    DENIED_CONNECTIONS: 0
      LOST_CONNECTIONS: 0
         ACCESS_DENIED: 0
         EMPTY_QUERIES: 1
 TOTAL_SSL_CONNECTIONS: 0
1 row in set (0.00 sec)
```

| 列名称                 | 描述                                                        |
| ---------------------- | ----------------------------------------------------------- |
| CLIENT                 | 发起连接的 IP 地址或主机名                                  |
| TOTAL_CONNECTIONS      | 为该客户端创建的连接数                                      |
| CONCURRENT_CONNECTIONS | 该客户端的并发连接数                                        |
| CONNECTED_TIME         | 该客户端连接时的累计秒数                                    |
| BUSY_TIME              | 该客户端连接活动的累计秒数                                  |
| CPU_TIME               | 为该客户端连接提供服务时所用的 CPU 累计时间（秒）           |
| BYTES_RECEIVED         | 从该客户端连接接收到的字节数                                |
| BYTES_SENT             | 发送到该客户端连接的字节数                                  |
| BINLOG_BYTES_WRITTEN   | 从该客户端连接写入二进制日志的字节数                        |
| ROWS_FETCHED           | 该客户端连接获取的记录数                                    |
| ROWS_UPDATED           | 该客户端连接更新的行数                                      |
| TABLE_ROWS_READ        | 该客户端连接从表中读取的记录数。(可能与 ROWS_FETCHED 不同） |
| SELECT_COMMANDS        | 通过该客户端连接执行的 SELECT 命令的数量                    |
| UPDATE_COMMANDS        | 从该客户端连接执行的 UPDATE 命令数量                        |
| OTHER_COMMANDS         | 通过该客户端连接执行的其他命令的数量                        |
| COMMIT_TRANSACTIONS    | 该客户端连接发出的 COMMIT 命令的数量                        |
| ROLLBACK_TRANSACTIONS  | 该客户端连接发出的 ROLLBACK 命令数量                        |
| DENIED_CONNECTIONS     | 该客户端被拒绝的连接数                                      |
| LOST_CONNECTIONS       | 该客户端以不干净方式终止的连接数                            |
| ACCESS_DENIED          | 该客户端连接发出的命令被拒绝的次数                          |
| EMPTY_QUERIES          | 该客户端连接向服务器发送空查询的次数                        |
| TOTAL_SSL_CONNECTIONS  | 使用 SSL 的线程连接数                                       |


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
