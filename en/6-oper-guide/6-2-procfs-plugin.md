# ProcFS Plugin

---

> Important! This feature is a technical preview. Before using this feature in a production environment, it is recommended that you test it in a test environment first.

The ProcFS plugin provides access to Linux performance counters by running SQL queries against GreatSQL.

In some environments, such as GreatSQL service installations, operating system metrics may not be captured. These metrics are crucial for complete system performance monitoring.

This plugin performs the following operations:

- Reads selected files from the `/proc` file system and the `/sys` file system.
- Populates the file names and their contents as rows in the `INFORMATION_SCHEMA.PROCFS` view.

The system variable `procfs_files_spec` provides access permissions to `/proc` and `/sys` files and directories. This variable cannot be changed at runtime, to prevent compromised accounts from having greater access to these file systems.

## Manually Installing the Plugin

It is recommended to install this plugin as part of the package. If needed, this plugin can be manually installed. Execute the following SQL command:

```sql
greatsql> INSTALL PLUGIN procfs SONAME 'procfs.so';
Query OK, 0 rows affected (0.05 sec)
```

## Required Access Privileges

Only users with the `ACCESS_PROCFS` dynamic privilege can access the `INFORMATION_SCHEMA.PROCFS` view. During plugin startup, this dynamic privilege is registered with the server.

After installing the plugin, grant users access to the `INFORMATION_SCHEMA.PROCFS` view by executing the following command:

The root user does not include this privilege and needs to grant it to themselves

```sql
greatsql> GRANT ACCESS_PROCFS ON *.* TO 'user'@'host';
```

::: warning Important Reminder
SELinux policies or AppArmor profiles may block access to file locations required by the ProcFS plugin, such as the "/proc/sys/fs/file-nr" directory or any subdirectories or files under "/proc/irq/". Edit the policies or configuration files to ensure the plugin has the necessary access. If the policies and configuration files do not allow access, the plugin may behave unexpectedly.
:::

## Using the ProcFS Plugin

Authorized users can obtain the information of a single file by specifying the exact file name in the WHERE clause. Files not included are ignored and treated as nonexistent.

All files matching `procfs_files_spec` are opened, read, stored in memory, and finally returned to the client. Adding a WHERE clause to return only specific files is crucial to limit the plugin's impact on server performance. Not using a WHERE clause causes long query response times, high load, and high memory usage on the server. The WHERE clause can contain the equality operator, the LIKE operator, or the IN operator. The LIKE operator limits the file matching pattern.

The following example returns `proc/version`:

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.PROCFS WHERE FILE = '/proc/version'\G
*************************** 1. row ***************************
    FILE: /proc/version
CONTENTS: Linux version 6.6.3-arch1-1 (linux@archlinux) (gcc (GCC) 13.2.1 20230801, GNU ld (GNU Binutils) 2.41.0) #1 SMP PREEMPT_DYNAMIC Wed, 29 Nov 2023 00:37:40 +0000

1 row in set (0.00 sec)
```

::: tip Tip
If the WHERE condition is not added, all information is output.
:::

For example, the DEV information can be viewed:

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.PROCFS WHERE FILE = '/proc/net/dev' \G
```

And the CPU information can be viewed:

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.PROCFS WHERE FILE = '/proc/cpuinfo' \G
```

## New Table PROCFS

The schema definition of the INFORMATION_SCHEMA.PROCFS view is:

```sql
greatsql> SHOW CREATE TABLE INFORMATION_SCHEMA.PROCFS\G
*************************** 1. row ***************************
       Table: PROCFS
Create Table: CREATE TEMPORARY TABLE `PROCFS` (
  `FILE` varchar(1024) NOT NULL DEFAULT '',
  `CONTENTS` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
1 row in set (0.00 sec)
```

## New Status Variables and Related Parameters

### New Status Variables Providing Basic Metrics

| Variable Name             | Description                                          |
| ------------------------ | --------------------------------------------- |
| procfs_access_violations | The number of times users without the ACCESS_PROCFS privilege attempted to query. |
| procfs_queries           | The number of queries made against the procfs view.                |
| procfs_files_read        | The number of files read to provide content                      |
| procfs_bytes_read        | The number of bytes read to provide content                      |

View the new status variables in the following way
```sql
greatsql> SHOW STATUS LIKE 'procfs_access_violations';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| procfs_access_violations | 1     |
+--------------------------+-------+
1 row in set (0.00 sec)
```

### New System Parameter

| System Variable Name       | procfs_files_spec |
| -------------------------- | ----------------- |
| Variable Scope             | Global            |
| Dynamic Variable           | YES               |
| Read, Write, or Read-Only: | Read-Only         |

This system parameter has been implemented in GreatSQL. The default value of `procfs_files_spec` is:

`/proc/cpuinfo;/proc/irq/*/*;/proc/loadavg/proc/net/dev;/proc/net/sockstat;/proc/net/sockstat_rhe4;/proc/net/tcpstat;/proc/self/net/netstat;/proc/self/stat;/proc/self/io;/proc/self/numa_maps/proc/softirqs;/proc/spl/kstat/zfs/arcstats;/proc/stat;/proc/sys/fs/file-nr;/proc/version;/proc/vmstat`

Access to `/proc` and `/sys` directories and files is allowed. This variable is global and read-only, and can be set by using the command line or by editing `my.cnf`.

## Plugin Limitations

The ProcFS plugin limitations are as follows:

- Only the first 60k of /proc/ /sys/ files are returned
- The file name size is limited to 1k
- If the path does not start with /proc or /sys, the plugin cannot read the file
- Complex WHERE conditions may force the plugin to read all configured files

## Uninstalling the Plugin

The following SQL command removes the procfs plugin

```sql
UNINSTALL PLUGIN procfs;
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
