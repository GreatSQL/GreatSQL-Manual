# Binlog Read Rate Limiting
---

## Introduction

In source-replica replication, the replica initiates Binlog read requests to the source. If reading is too fast or too many threads are reading concurrently, the network load pressure on the source node increases.

In an MGR cluster, when a new node joins, the primary node may need to transfer a large amount of Binlog data to the replica at once. If reading is too fast or multiple new nodes join at the same time, the network load pressure on the primary node increases.

In both scenarios above, rate limiting of Binlog reads should be considered.

## New System Variable

The new system variable `rpl_read_binlog_speed_limit` is added to control the rate limit for Binlog read requests initiated by replicas to the source. This is useful for controlling network bandwidth usage in source-replica replication, reducing network load pressure on the source node, or reducing resource consumption during data recovery.

When the value of `rpl_read_binlog_speed_limit` is an integer greater than 0, the replica requests Binlog reads from the source at the specified rate (unit: KB/s), thereby achieving traffic control. When set to 0, rate limiting is disabled.

This system variable takes effect when set on the replica side.

| System Variable Name | rpl_read_binlog_speed_limit |
| -------------------- | --------------------------- |
| Variable Scope       | Global                      |
| Dynamic Variable     | Yes                         |
| Type                 | Integer                     |
| Default Value        | 0                           |
| Minimum Value        | 0                           |
| Maximum Value        | 4294967295                  |
| Unit                 | KB/s                        |

## Configuration Methods

- Dynamic setting

  The parameter can be dynamically modified at runtime without restarting the service. For example, to limit the speed to 100KB/s, execute the following command:
```sql
SET GLOBAL rpl_read_binlog_speed_limit=100;
```

- Configuration file setting

  To make the setting persistent, add or modify the following content in the configuration file:

  ```ini
  [mysqld]
  rpl_read_binlog_speed_limit = 100
  ```
  Then restart the service for the setting to take effect.

- Checking the rate limiting status

A new status variable `Rpl_data_speed` is added to display the current Binlog rate limiting status. It can be checked by executing `SHOW GLOBAL STATUS LIKE 'Rpl_data_speed'`. For example:

```sql
greatsql> SHOW GLOBAL STATUS LIKE 'Rpl%spee%';
+----------------+------------------+
| Variable_name  | Value            |
+----------------+------------------+
| Rpl_data_speed | async_rpl=100.00 |
+----------------+------------------+
```
This indicates that the current Binlog read rate limit is 100KB/s. For more detailed usage, please refer to: [Binlog Read Rate Limiting](../../5-enhance/5-2-ha-binlog-speed-limit.md).

## Notes

1. After enabling rate limiting mode, the load pressure on the source server and network transmission can certainly be reduced. However, if the rate limit value is set too low, the data synchronization efficiency of source-replica replication may be reduced, affecting the timeliness of data replication on the replica. It needs to be properly balanced and adjusted according to the actual situation and business needs.

2. Binlog transmission during MGR operation is not restricted by this feature. Only Binlog transmission during the period when new nodes join is rate limited.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
