# Non-Blocking DDL

Before performing a DDL operation on a user table, an MDL-X lock must be requested first. If the user table currently has in-progress transactions or queries, the MDL-X lock request is blocked and cannot be acquired immediately. Since the MDL-X lock has the highest priority, when an MDL-X lock request is blocked, it also affects other new transactions and new query requests on the user table, which may cause these transactions and query requests to continue being blocked and pile up, potentially seriously affecting the availability of the entire business system.

The usage of the non-blocking DDL feature and the related new options are described below.

1. First, modify the lock wait timeout option `lock_wait_timeout`, setting it to 100 seconds.

```sql
SET lock_wait_timeout = 100;
```

2. Modify the option `lock_ddl_polling_mode` to enable this feature.

```sql
SET lock_ddl_polling_mode = ON;
```
This option can be set separately in a Session, or modified at the Global level (after modifying the Global level setting, it does not take effect immediately for the current Session; it only takes effect for newly established Sessions).

3. According to business characteristics or needs, modify the option `lock_ddl_polling_runtime` to set the interval for each attempt to acquire the MDL-X lock (unit: milliseconds/ms).

```sql
SET lock_ddl_polling_runtime = 1000;
```

The effect of the above settings is to attempt to acquire the MDL-X lock every 1 second, up to a maximum total MDL lock wait time of 100 seconds.

4. New options

| System Variable Name | Variable Scope | Dynamic Variable | Permitted Values | Type | Default | Description |
| --- | --- | --- | --- | --- | --- | --- |
|lock_ddl_polling_mode|Session|YES|[ON/OFF]|ENUM|OFF|Whether to enable the non-blocking DDL feature, default: disabled|
|lock_ddl_polling_runtime|Session|YES|[200, 31536000]|Integer|1000|For non-blocking DDL requests, the interval between each DDL request's attempts to acquire the MDL-X lock, default: 1000 milliseconds (1 second)|


The native MDL lock request is exclusive: when initiating a DDL operation, the MDL-X lock must be requested first; if it cannot be acquired immediately, the request is blocked until the threshold set by the `lock_wait_timeout` option is reached.

After the non-blocking DDL feature is enabled, within the time defined by `lock_wait_timeout`, multiple attempts are made to acquire the MDL-X lock instead of the native exclusive request method. This releases lock resources during the gaps between retries, allowing new transactions to proceed.

The role of the option `lock_ddl_polling_runtime` is to set the interval between each attempt to acquire the MDL-X lock. The unit of this option is ms (milliseconds), with a default value of 1000, i.e., 1 second.

5. Impact of the new mode on DDL

Enabling the non-blocking DDL feature will extend the time for DDL requests to acquire the MDL-X lock, increasing the probability of DDL operation timeout failures.

The non-blocking DDL feature is only supported in the `ALTER TABLE, OPTIMIZE TABLE, TRUNCATE TABLE` DDL operation modes.

6. Case

In the following case, the two related options in each session have been modified separately beforehand:

```sql
SET GLOBAL lock_ddl_polling_mode = ON;
SET lock_ddl_polling_runtime = 200;
```

| Timeline | Session 1 | Session 2 | Session 3 |
| --- | --- | --- | --- |
| T1  | BEGIN;<br/>SELECT * FROM t WHERE id = 1 FOR SHARE;<br>*Transaction started, not yet committed* | | |
| T2  | | ALTER TABLE t ADD c3 INT UNSIGNED;<br/>*ALTER TABLE operation initiated on table t, blocked, with prompt:*<br/>*Waiting for table metadata lock* | |
| T3  | | | SELECT * FROM t LIMIT 1;<br/>*Returns results, not blocked* |

It can also be noted that if the `SELECT` query in Session 3 is executed multiple times, the response time is different each time, because the `ALTER TABLE` request in Session 2 repeatedly requests the MDL-X lock, with an interval of 200ms each time.


Recommended reading: [InnoDB and Online DDL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html).


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
