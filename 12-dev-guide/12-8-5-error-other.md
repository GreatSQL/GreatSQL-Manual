# 其他常见报错处理

## 事务空闲时间过长
开启事务后，空闲不操作较长一段时间，查询表数据时报错。

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

# 空闲一段时间后

greatsql> SELECT * FROM world.city limit 5;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    38
Current database: world
```
错误码为`2013`，表示连接断开。详见[GreatSQL常见报错错误码对照表](./12-8-1-error-code-reference.md)。

### 原因分析

事务空闲超时表示事务内两条语句的执行间隔超过了指定的阈值。当事务空闲时间超过了指定的阈值时，如果继续执行数据库操作，系统就会报错。

### 解决方案

可以通过设置参数 *kill_idle_transaction* 来调整事务空闲时间。

```sql
greatsql> SHOW GLOBAL VARIABLES LIKE 'kill_idle_transaction';
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| kill_idle_transaction | 300   |
+-----------------------+-------+
1 row in set (0.01 sec)
```
设置为0表示不限制事务空闲时间，设置为正整数则表示事务空闲时间。

```sql
greatsql> SET GLOBAL kill_idle_transaction=300;
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
