# Database Connection Failures

This section introduces common issues with connection failures in GreatSQL.

In the document [Connect via GreatSQL Client](./12-1-1-cw-cli.md), we introduced the methods for connecting through the GreatSQL client.

In GreatSQL, connection failures are classified into the following:
- Connection interrupted
- Connection failed

## Connection Interrupted

A connection interruption usually means that the connection to the GreatSQL server is dropped, and an error is reported.
### Symptoms
After connecting to GreatSQL, if you perform no operation for a period of time and then operate again, an error is reported.

```sql
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    25
```
Error code 2013 indicates a connection interruption. The error message is `Lost connection to MySQL server during query`.

### Cause Analysis
When the session idle time exceeds the specified threshold, GreatSQL actively closes the current connection, and reports ERROR 2013 the next time an operation is executed.

At this point, enter the GreatSQL database and view the timeout-related parameters:

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE '%timeout%';
+------------------------------------------------+----------+
| Variable_name                                  | Value    |
+------------------------------------------------+----------+
| connect_timeout                                | 10       |
| delayed_insert_timeout                         | 300      |
| group_replication_auto_evict_timeout           | 0        |
| group_replication_communication_flp_timeout    | 5        |
| group_replication_components_stop_timeout      | 300      |
| group_replication_member_expel_timeout         | 5        |
| group_replication_unreachable_majority_timeout | 0        |
| have_statement_timeout                         | YES      |
| innodb_flush_log_at_timeout                    | 1        |
| innodb_lock_wait_timeout                       | 10       |
| innodb_print_lock_wait_timeout_info            | ON       |
| innodb_rollback_on_timeout                     | ON       |
| interactive_timeout                            | 600      |
| lock_wait_timeout                              | 3600     |
| mysqlx_connect_timeout                         | 30       |
| mysqlx_idle_worker_thread_timeout              | 60       |
| mysqlx_interactive_timeout                     | 28800    |
| mysqlx_port_open_timeout                       | 0        |
| mysqlx_read_timeout                            | 30       |
| mysqlx_wait_timeout                            | 28800    |
| mysqlx_write_timeout                           | 60       |
| net_read_timeout                               | 30       |
| net_write_timeout                              | 60       |
| parallel_queue_timeout                         | 0        |
| replica_net_timeout                            | 60       |
| rpl_stop_replica_timeout                       | 31536000 |
| rpl_stop_slave_timeout                         | 31536000 |
| secondary_engine_read_delay_wait_timeout       | 60       |
| slave_net_timeout                              | 60       |
| ssl_session_cache_timeout                      | 300      |
| thread_pool_idle_timeout                       | 60       |
| wait_timeout                                   | 600      |
+------------------------------------------------+----------+
32 rows in set (0.01 sec)
```

Set the value of the variable *wait_timeout* to 600, that is, 10 minutes.
```sql
greatsql> SET GLOBAL wait_timeout=600;
Query OK, 0 rows affected (0.00 sec)
```
Set the value of the variable *interactive_timeout* to 600, that is, 10 minutes.
```sql
greatsql> SET GLOBAL interactive_timeout=600;
Query OK, 0 rows affected (0.00 sec)
```
> If needed, the above two parameters can be increased appropriately.


## Connection Failed
A connection failure usually occurs because the GreatSQL server cannot respond to the client's request.

### Symptoms
```bash
$ mysql -uroot -p GreatSQL  -P3306 -h127.0.0.1
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
```
Error code 1045 indicates that access for the user is denied. For details, see [Common Error Code Reference](./12-8-1-error-code-reference.md). The error message is `Access denied for user 'root'@'localhost' (using password: YES)`.

### Cause Analysis

The following situations may cause the GreatSQL server to reject the client's connection request:

1. Incorrect password
2. The user does not exist
3. Host restriction on the user
4. Firewall issues

### Solutions
**Incorrect password**

Check whether the password is correct.

If you forget the password, you can add the `skip-grant-tables` parameter to the my.cnf file and restart the GreatSQL server. This skips password verification, allowing direct login.

> Note! After use, disable it as soon as you are done and restart the GreatSQL server; otherwise the database is at great risk.

**The user does not exist**

Check whether the user name is correct. For the root user, skip this possible cause.

If you created the user yourself, you can log in as root and run `SELECT * FROM mysql.user;` to check whether the user exists.

```sql
greatsql> SELECT User,Host FROM mysql.user;
+------------------+-----------+
| User             | Host      |
+------------------+-----------+
|  GreatSQL          | %         |
| root             | %         |
| mysql.infoschema | localhost |
| mysql.session    | localhost |
| mysql.sys        | localhost |
+------------------+-----------+
5 rows in set (0.00 sec)
```

**Host restriction on the user**

This kind of error has already been introduced in the chapter [Connect via GUI Client](./12-1-2-cw-gui.md). Simply modify the user's current host configuration information.

**Firewall issues**

For firewall issues, check whether the firewall has opened the GreatSQL port.

For example, on a Linux system, you can run `netstat -anp | grep 3306` to check whether the port is open.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)