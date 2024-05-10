# 用户统计 USER_STATISTICS

---

## USER_STATISTICS表介绍

此表包含有关用户活动的信息。GreatSQL限制了具有 `SUPER` 或 `PROCESS` 权限的用户查看此表。

此表提供了关于哪些用户导致最大负载以及是否存在用户滥用等问题。同时，还能够帮助评估服务器容量的接近程度。例如，可以利用此表来确定复制是否可能开始滞后。

USER_STATISTICS表输出结果如下：

```sql
greatsql>  SELECT * FROM INFORMATION_SCHEMA.USER_STATISTICS\G
*************************** 1. row ***************************
                  USER: root
     TOTAL_CONNECTIONS: 13
CONCURRENT_CONNECTIONS: 0
        CONNECTED_TIME: 5061.434347300002
             BUSY_TIME: 0.9713379999999995
              CPU_TIME: 0.48913948100000015
        BYTES_RECEIVED: 17315
            BYTES_SENT: 7880850
  BINLOG_BYTES_WRITTEN: 289
          ROWS_FETCHED: 1009117
          ROWS_UPDATED: 0
       TABLE_ROWS_READ: 15022437
       SELECT_COMMANDS: 91
       UPDATE_COMMANDS: 5
        OTHER_COMMANDS: 70
   COMMIT_TRANSACTIONS: 55
 ROLLBACK_TRANSACTIONS: 3
    DENIED_CONNECTIONS: 0
      LOST_CONNECTIONS: 0
         ACCESS_DENIED: 0
         EMPTY_QUERIES: 23
 TOTAL_SSL_CONNECTIONS: 0
1 row in set (0.00 sec)
```

| 列名称                 | 描述                                                         |
| ---------------------- | ------------------------------------------------------------ |
| USER                   | 用户名。当没有用户名时（例如对于副本 SQL 线程），会出现值 #mysql_system_user# |
| TOTAL_CONNECTIONS      | 从此用户创建的连接数                                         |
| CONCURRENT_CONNECTIONS | 该用户的并发连接数                                           |
| CONNECTED_TIME         | 该用户建立连接时经过的累计秒数                               |
| BUSY_TIME              | 该用户的连接活动的累计秒数                                   |
| CPU_TIME               | 为该用户的连接提供服务时所用的累计 CPU 时间（以秒为单位）    |
| BYTES_RECEIVED         | 从该用户的连接接收到的字节数                                 |
| BYTES_SENT             | 发送到该用户连接的字节数                                     |
| BINLOG_BYTES_WRITTEN   | 从该用户的连接写入二进制日志的字节数                         |
| ROWS_FETCHED           | 该用户的连接获取的行数                                       |
| ROWS_UPDATED           | 该用户的连接更新的行数                                       |
| TABLE_ROWS_READ        | 该用户的连接从表中读取的行数。（它可能与 ROWS_FETCHED 不同） |
| SELECT_COMMANDS        | 从该用户的连接执行的 SELECT 命令的数量                       |
| UPDATE_COMMANDS        | 从该用户的连接执行的 UPDATE 命令的数量                       |
| OTHER_COMMANDS         | 从该用户的连接执行的其他命令的数量                           |
| COMMIT_TRANSACTIONS    | 该用户的连接发出的 COMMIT 命令的数量                         |
| ROLLBACK_TRANSACTIONS  | 该用户的连接发出的 ROLLBACK 命令的数量                       |
| DENIED_CONNECTIONS     | 拒绝该用户的连接数                                           |
| LOST_CONNECTIONS       | 不正常终止的该用户的连接数                                   |
| ACCESS_DENIED          | 该用户的连接发出被拒绝的命令的次数                           |
| EMPTY_QUERIES          | 该用户的连接向服务器发送空查询的次数                         |
| TOTAL_SSL_CONNECTIONS  | 使用 SSL 的线程连接数                                        |

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
