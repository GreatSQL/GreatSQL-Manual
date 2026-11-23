# Other Common Error Handling

## Transaction Idle Timeout

After starting a transaction, if you leave it idle without any operation for a long period and then query table data, an error is reported.

```sql
greatsql> BEGIN;
greatsql> SELECT * FROM world.city limit 5;
+----+----------------+-------------+---------------+------------+
| ID | Name           | CountryCode | District      | Population |
+----+----------------+-------------+---------------+------------+
|  1 | Kabul          | AFG         | Kabol         |    1780000 |
|  2 | Qandahar       | AFG         | Qandahar      |     237500 |
|  3 | Herat          | AFG         | Herat         |     186800 |
|  4 | Mazar-e-Sharif | AFG         | Balkh         |     127800 |
|  5 | Amsterdam      | NLD         | Noord-Holland |     731200 |
+----+----------------+-------------+---------------+------------+
5 rows in set (0.01 sec)

# After being idle for a period of time

greatsql> SELECT * FROM world.city limit 5;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    38
Current database: world
```
Error code `2013` indicates that the connection was lost. For details, see [Common Error Code Reference](./12-8-1-error-code-reference.md).

### Cause Analysis

A transaction idle timeout means that the interval between two statements within the transaction exceeds the specified threshold. When the transaction idle time exceeds the specified threshold, the system reports an error if you continue to execute database operations.

### Solutions

You can adjust the transaction idle time by setting the *kill_idle_transaction* parameter.

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'kill_idle_transaction';
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| kill_idle_transaction | 300   |
+-----------------------+-------+
1 row in set (0.01 sec)
```
Setting it to 0 means no limit on the transaction idle time, while setting it to a positive integer specifies the transaction idle time.

```sql
greatsql> SET GLOBAL kill_idle_transaction=300;
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
