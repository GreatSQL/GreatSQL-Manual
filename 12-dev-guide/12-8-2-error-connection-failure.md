# GreatSQL 连接失败

本节介绍 GreatSQL 连接失败的常见问题。

在文档 [通过GreatSQL客户端连接](./12-1-1-cw-cli.md)中，我们介绍了 GreatSQL 客户端连接的方法。

在 GreatSQL 中，连接失败分为以下几种：
- 连接中断
- 连接失败

## 连接中断
连接中断，通常是与 GreatSQL 服务器端中断，并报错。
### 问题现象
连接 GreatSQL 后，一段时间内没有操作，再次操作时，报错。

```sql
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    25
```
错误码为2013，表示连接中断。错误信息为`Lost connection to MySQL server during query`。

### 原因分析
 GreatSQL 当会话空闲时间超过指定的阈值时，系统将主动关闭当前连接，并在执行下一次操作时报 ERROR 2013 的错误。

此时进入 GreatSQL 数据库中，查看timeout相关参数

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

将变量 *wait_timeout* 的值设置为 600 即10分钟。
```sql
greatsql> SET GLOBAL wait_timeout=600;
Query OK, 0 rows affected (0.00 sec)
```
将变量 *interactive_timeout* 的值设置为 600 既10分钟。
```sql
greatsql> SET GLOBAL interactive_timeout=600;
Query OK, 0 rows affected (0.00 sec)
```
> 以上两个参数，若有需求可适当调大。


## 连接失败
连接失败，通常是由于 GreatSQL 服务器端无法响应客户端的请求。

### 问题现象
```bash
$ mysql -uroot -p GreatSQL  -P3306 -h127.0.0.1
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
```
错误码为1045，表示拒绝访问用户，详见[ GreatSQL 常见报错错误码对照表](./12-8-1-error-code-reference.md)。错误信息为`Access denied for user 'root'@'localhost' (using password: YES)`。

### 原因分析

可能是以下几种情况导致 GreatSQL 服务器端拒绝了客户端的连接请求。

1. 密码错误
2. 用户名不存在
3. 用户的主机限制
4. 防火墙问题

### 解决方案
**密码错误**

请检查密码是否正确。

若忘记密码可以在my.cnf文件中加入`skip-grant-tables`参数，然后重启 GreatSQL 服务器。此时会跳过密码验证，直接登录。

> 注意！使用完成后要随用随关，并重启 GreatSQL 服务器，否则数据库有很大风险

**用户名不存在**

请检查用户名是否正确。root用户则跳过这个可能的错误。

若是自己创建用户，可以使用root用户登录后，使用`SELECT * FROM mysql.user;`查看用户是否存在。

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

**用户的主机限制**

这点错误在章节[通过GUI客户端连接](./12-1-2-cw-gui.md)中已经介绍过了，修改用户的当前主机配置信息即可

**防火墙问题**

防火墙问题，请检查防火墙是否开放了 GreatSQL 的端口。

例如，在Linux系统中，可以使用`netstat -anp | grep 3306`查看端口是否开放。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
