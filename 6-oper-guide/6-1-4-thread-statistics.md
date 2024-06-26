# 线程统计 THREAD_STATISTICS

---

## THREAD_STATISTICS表介绍

要在此表中填入统计数据，应将附加变量`thread_statistics`设为`ON`

```sql
greatsql> set global thread_statistics = ON;
```

THREAD_STATISTICS表输出结果如下：

```sql
greatsql>  SELECT * FROM INFORMATION_SCHEMA.THREAD_STATISTICS\G
*************************** 1. row ***************************
            THREAD_ID: 167
    TOTAL_CONNECTIONS: 1
       CONNECTED_TIME: 130.7775121
            BUSY_TIME: 0.005097999999999999
             CPU_TIME: 0.005093540000000001
       BYTES_RECEIVED: 296
           BYTES_SENT: 0
 BINLOG_BYTES_WRITTEN: 0
         ROWS_FETCHED: 17
         ROWS_UPDATED: 0
      TABLE_ROWS_READ: 10000482
      SELECT_COMMANDS: 3
      UPDATE_COMMANDS: 0
       OTHER_COMMANDS: 2
  COMMIT_TRANSACTIONS: 2
ROLLBACK_TRANSACTIONS: 0
   DENIED_CONNECTIONS: 0
     LOST_CONNECTIONS: 0
        ACCESS_DENIED: 0
        EMPTY_QUERIES: 0
TOTAL_SSL_CONNECTIONS: 0
1 row in set (0.00 sec)
```

| 列名称                | 描述                             |
| --------------------- | -------------------------------- |
| THREAD_ID             | 线程ID                           |
| TOTAL_CONNECTIONS     | 从此线程创建的连接数             |
| CONNECTED_TIME        | 该线程建立连接时所经过的累计秒数 |
| BUSY_TIME             | 该线程活动的累计秒数             |
| CPU_TIME              | 服务该线程时消耗的累积 CPU 时间  |
| BYTES_RECEIVED        | 从该线程接收到的字节数           |
| BYTES_SENT            | 发送到该线程的字节数             |
| BINLOG_BYTES_WRITTEN  | 从此线程写入二进制日志的字节数   |
| ROWS_FETCHED          | 该线程获取的行数                 |
| ROWS_UPDATED          | 该线程更新的行数                 |
| TABLE_ROWS_READ       | 通过此步骤从表中读取的行数       |
| SELECT_COMMANDS       | 从此线程执行的 SELECT 命令的数量 |
| UPDATE_COMMANDS       | 从此线程执行的 UPDATE 命令的数量 |
| OTHER_COMMANDS        | 从此线程执行的其他命令的数量     |
| COMMIT_TRANSACTIONS   | 该线程发出的 COMMIT 命令的数量   |
| ROLLBACK_TRANSACTIONS | 该线程发出的 ROLLBACK 命令的数量 |
| DENIED_CONNECTIONS    | 该线程被拒绝的连接数             |
| LOST_CONNECTIONS      | 不正常终止的线程连接数           |
| ACCESS_DENIED         | 该线程发出被拒绝的命令的次数     |
| EMPTY_QUERIES         | 该线程向服务器发送空查询的次数   |
| TOTAL_SSL_CONNECTIONS | 使用 SSL 的线程连接数            |


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
