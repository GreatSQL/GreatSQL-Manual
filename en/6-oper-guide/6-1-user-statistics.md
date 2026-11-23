# User Statistics

---
GreatSQL provides the User statistics feature. This feature adds several `INFORMATION_SCHEMA` tables, several commands, and the `userstat` variable. These tables and commands can be used to better understand server activity and identify the sources of load. This feature is disabled by default and must be enabled by setting `userstat` to `ON`. Its working principle is to keep several hash tables in memory. To avoid contention on a global mutex, each connection has its own local statistics, which are occasionally merged into the global statistics, after which the local statistics are reset to 0.

Enable the User statistics feature:

```sql
greatsql> SET GLOBAL userstat = ON;
```

## New System Parameters

The 2 related parameters added by the user statistics feature:

| System Variable Name | userstat                                                     |
| -------------------- | ------------------------------------------------------------ |
| Variable Scope       | global                                                       |
| Dynamic Variable     | YES                                                          |
| Permitted Values     | ON/OFF                                                       |
| Default              | OFF                                                          |
| Description          | Enables or disables the collection of statistics. The default value is `OFF`, meaning no statistics are collected. This is to ensure that statistics collection does not cause any extra load on the server unless needed. |

| System Variable Name | thread_statistics                                            |
| -------------------- | ------------------------------------------------------------ |
| Variable Scope       | global                                                       |
| Dynamic Variable     | YES                                                          |
| Permitted Values     | ON/OFF                                                       |
| Default              | OFF                                                          |
| Description          | Enables or disables the collection of thread statistics. The default value is `OFF`, meaning thread statistics are not collected. This is to ensure that statistics collection does not cause any extra load on the server unless needed. The variable `userstat` must also be enabled to collect thread statistics. |

## INFORMATION_SCHEMA Tables Added by This Feature

### Client statistics - [INFORMATION_SCHEMA.CLIENT_STATISTICS](./6-1-1-client-statistics.md)

### Index statistics - [INFORMATION_SCHEMA.INDEX_STATISTICS](./6-1-2-index-statistics.md)

### Table statistics - [INFORMATION_SCHEMA.TABLE_STATISTICS](./6-1-3-table-statistics.md)

### Thread statistics - [INFORMATION_SCHEMA.THREAD_STATISTICS](./6-1-4-thread-statistics.md)

### User statistics - [INFORMATION_SCHEMA.USER_STATISTICS](./6-1-5-user-statistics.md)

## New Commands

- `FLUSH CLIENT_STATISTICS`
- `FLUSH INDEX_STATISTICS`
- `FLUSH TABLE_STATISTICS`
- `FLUSH THREAD_STATISTICS`
- `FLUSH USER_STATISTICS`

The above commands discard the stored statistics of the specified type.

---

- `SHOW CLIENT_STATISTICS`
- `SHOW INDEX_STATISTICS`
- `SHOW TABLE_STATISTICS`
- `SHOW THREAD_STATISTICS`
- `SHOW USER_STATISTICS`

The above commands are another way to display the information obtainable from the `INFORMATION_SCHEMA` tables. These commands accept a `WHERE` clause, and accept but ignore `LIKE` conditions.

## New Status Variables

View with `SHOW STATUS LIKE`

- Com_show_client_statistics

The `Com_show_client_statistics` statement counter variable indicates the number of executions of the statement `SHOW CLIENT_STATISTICS`.

- Com_show_index_statistics

The `Com_show_index_statistics` statement counter variable indicates the number of executions of the statement `SHOW INDEX_STATISTICS`.

- Com_show_table_statistics

The `Com_show_table_statistics` statement counter variable indicates the number of executions of the statement `SHOW TABLE_STATISTICS`.

- Com_show_thread_statistics

The `Com_show_thread_statistics` statement counter variable indicates the number of executions of the statement `SHOW THREAD_STATISTICS`.

- Com_show_user_statistics

The `Com_show_user_statistics` statement counter variable indicates the number of executions of the statement `SHOW USER_STATISTICS`.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
