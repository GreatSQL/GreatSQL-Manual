# User Statistics USER_STATISTICS

---

## Introduction to the USER_STATISTICS Table

This table contains information about user activity. GreatSQL restricts viewing this table to users with the `SUPER` or `PROCESS` privilege.

This table provides answers to questions such as which users are causing the most load and whether there is any user abuse. At the same time, it can also help evaluate how close the server is to capacity. For example, this table can be used to determine whether replication may start to lag.

The output of the USER_STATISTICS table is as follows:

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

| Column Name             | Description                                                         |
| ---------------------- | ------------------------------------------------------------ |
| USER                   | The username. When there is no username (for example, for the replica SQL thread), the value #mysql_system_user# appears |
| TOTAL_CONNECTIONS      | The number of connections created from this user                                         |
| CONCURRENT_CONNECTIONS | The number of concurrent connections of this user                                           |
| CONNECTED_TIME         | The cumulative seconds elapsed while this user was establishing connections                               |
| BUSY_TIME              | The cumulative seconds of activity of this user's connections                                   |
| CPU_TIME               | The cumulative CPU time (seconds) used to serve this user's connections    |
| BYTES_RECEIVED         | The number of bytes received from this user's connections                                 |
| BYTES_SENT             | The number of bytes sent to this user's connections                                     |
| BINLOG_BYTES_WRITTEN   | The number of bytes written to the binary log from this user's connections                         |
| ROWS_FETCHED           | The number of rows fetched by this user's connections                                       |
| ROWS_UPDATED           | The number of rows updated by this user's connections                                       |
| TABLE_ROWS_READ        | The number of rows read from tables by this user's connections. (It may differ from ROWS_FETCHED) |
| SELECT_COMMANDS        | The number of SELECT commands executed from this user's connections                       |
| UPDATE_COMMANDS        | The number of UPDATE commands executed from this user's connections                       |
| OTHER_COMMANDS         | The number of other commands executed from this user's connections                           |
| COMMIT_TRANSACTIONS    | The number of COMMIT commands issued by this user's connections                         |
| ROLLBACK_TRANSACTIONS  | The number of ROLLBACK commands issued by this user's connections                       |
| DENIED_CONNECTIONS     | The number of connections denied for this user                                           |
| LOST_CONNECTIONS       | The number of this user's connections terminated abnormally                                   |
| ACCESS_DENIED          | The number of times commands issued by this user's connections were denied                           |
| EMPTY_QUERIES          | The number of times this user's connections sent empty queries to the server                         |
| TOTAL_SSL_CONNECTIONS  | The number of thread connections using SSL                                        |


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
