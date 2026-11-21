# Client Statistics CLIENT_STATISTICS
---
## Introduction to the CLIENT_STATISTICS Table

This table contains statistics about client connections. Visibility is limited to users with the `SUPER` or `PROCESS` privilege. Without the `SUPER` or `PROCESS` privilege, the error is as follows:

```bash
greatsql> SELECT * FROM INFORMATION_SCHEMA.CLIENT_STATISTICS\G
ERROR 1227 (42000): Access denied; you need (at least one of) the PROCESS, SUPER privilege(s) for this operation
```

Querying this table outputs the following:

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

| Column Name            | Description                                                        |
| ---------------------- | ----------------------------------------------------------- |
| CLIENT                 | The IP address or hostname that initiated the connection                                  |
| TOTAL_CONNECTIONS      | The number of connections created for this client                                      |
| CONCURRENT_CONNECTIONS | The number of concurrent connections of this client                                        |
| CONNECTED_TIME         | The cumulative seconds of this client's connection                                    |
| BUSY_TIME              | The cumulative seconds of activity of this client's connection                                  |
| CPU_TIME               | The cumulative CPU time (seconds) used to serve this client's connection           |
| BYTES_RECEIVED         | The number of bytes received from this client's connection                                |
| BYTES_SENT             | The number of bytes sent to this client's connection                                  |
| BINLOG_BYTES_WRITTEN   | The number of bytes written to the binary log from this client's connection                        |
| ROWS_FETCHED           | The number of records fetched by this client's connection                                    |
| ROWS_UPDATED           | The number of rows updated by this client's connection                                      |
| TABLE_ROWS_READ        | The number of records read from tables by this client's connection. (May differ from ROWS_FETCHED) |
| SELECT_COMMANDS        | The number of SELECT commands executed through this client's connection                    |
| UPDATE_COMMANDS        | The number of UPDATE commands executed from this client's connection                        |
| OTHER_COMMANDS         | The number of other commands executed through this client's connection                        |
| COMMIT_TRANSACTIONS    | The number of COMMIT commands issued by this client's connection                        |
| ROLLBACK_TRANSACTIONS  | The number of ROLLBACK commands issued by this client's connection                        |
| DENIED_CONNECTIONS     | The number of connections denied for this client                                      |
| LOST_CONNECTIONS       | The number of connections terminated in an unclean manner for this client                          |
| ACCESS_DENIED          | The number of times commands issued by this client's connection were denied                          |
| EMPTY_QUERIES          | The number of times this client's connection sent empty queries to the server                        |
| TOTAL_SSL_CONNECTIONS  | The number of thread connections using SSL                                       |



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
