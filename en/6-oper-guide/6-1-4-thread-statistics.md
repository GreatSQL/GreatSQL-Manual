# Thread Statistics THREAD_STATISTICS

---

## Introduction to the THREAD_STATISTICS Table

To fill statistics data into this table, the additional variable `thread_statistics` should be set to `ON`

```sql
greatsql> set global thread_statistics = ON;
```

The output of the THREAD_STATISTICS table is as follows:

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

| Column Name            | Description                             |
| --------------------- | -------------------------------- |
| THREAD_ID             | The thread ID                           |
| TOTAL_CONNECTIONS     | The number of connections created from this thread             |
| CONNECTED_TIME        | The cumulative seconds elapsed while this thread was establishing connections |
| BUSY_TIME             | The cumulative seconds of activity of this thread             |
| CPU_TIME              | The cumulative CPU time consumed when serving this thread  |
| BYTES_RECEIVED        | The number of bytes received from this thread           |
| BYTES_SENT            | The number of bytes sent to this thread             |
| BINLOG_BYTES_WRITTEN  | The number of bytes written to the binary log from this thread   |
| ROWS_FETCHED          | The number of rows fetched by this thread                 |
| ROWS_UPDATED          | The number of rows updated by this thread                 |
| TABLE_ROWS_READ       | The number of rows read from tables through this thread       |
| SELECT_COMMANDS       | The number of SELECT commands executed from this thread |
| UPDATE_COMMANDS       | The number of UPDATE commands executed from this thread |
| OTHER_COMMANDS        | The number of other commands executed from this thread     |
| COMMIT_TRANSACTIONS   | The number of COMMIT commands issued by this thread   |
| ROLLBACK_TRANSACTIONS | The number of ROLLBACK commands issued by this thread |
| DENIED_CONNECTIONS    | The number of connections denied for this thread             |
| LOST_CONNECTIONS      | The number of thread connections terminated abnormally           |
| ACCESS_DENIED         | The number of times commands issued by this thread were denied     |
| EMPTY_QUERIES         | The number of times this thread sent empty queries to the server   |
| TOTAL_SSL_CONNECTIONS | The number of thread connections using SSL            |


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
