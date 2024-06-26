# ProcFS 插件

---

> 重要！此功能为技术预览版。在生产环境中使用此功能前，我们建议您测试先在测试环境测试。

ProcFS 插件通过对 GreatSQL 运行 SQL 查询来提供对 Linux 性能计数器的访问。

在某些环境中，如 GreatSQL 服务安装，可能无法捕获操作系统指标。这些指标对于完整的系统性能监控至关重要。

该插件执行以下操作：

- 从 `/proc` 文件系统和 `/sys` 文件系统读取选定的文件。
- 将文件名及其内容填充为 `INFORMATION_SCHEMA.PROCFS` 视图中的行。

系统变量 `procfs_files_spec` 提供对 `/proc` 和 `/sys` 文件和目录的访问权限。运行时不能更改该变量，以防止被入侵的账户对这些文件系统拥有更大的访问权限。

## 手动安装插件

建议将该插件作为软件包的一部分安装。如果需要，可以手动安装此插件。执行以下命令：

```sql
greatsql> INSTALL PLUGIN procfs SONAME 'procfs.so';
Query OK, 0 rows affected (0.05 sec)
```

## 所需的访问权限

只有具有 `ACCESS_PROCFS` 动态权限的用户才能访问 `INFORMATION_SCHEMA.PROCFS` 视图。在插件启动期间，此动态权限会注册到服务器。

安装插件后，通过执行以下命令授予用户对`INFORMATION_SCHEMA.PROCFS`视图的访问权限：

root用户不包含此权限，需要给自己授权

```sql
greatsql> GRANT ACCESS_PROCFS ON *.* TO 'user'@'host';
```

> 重要！SELinux 策略或 AppArmor 配置文件可能会阻止访问 ProcFS 插件所需的文件位置，例如“/proc/sys/fs/file-nr”目录或“/proc/irq/”下的任何子目录或文件。编辑策略或配置文件以确保插件具有必要的访问权限。如果策略和配置文件不允许访问，则插件可能会出现意外行为。

## 使用 ProcFS 插件

授权用户可以通过在 WHERE 子句中指定确切的文件名来获取单个文件的信息。未包含的文件将被忽略并视为不存在。

所有符合`procfs_files_spec`的文件都会被打开、读取、存储在内存中，最后返回给客户端。添加 WHERE 子句以只返回特定文件对于限制插件对服务器性能的影响至关重要。不使用 WHERE 子句会导致服务器上出现冗长的查询响应时间、高负载和高内存使用率。WHERE 子句可以包含相等操作符、LIKE 操作符或 IN 操作符。LIKE 操作符限制了文件屏蔽。

以下示例返回 `proc/version` ：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.PROCFS WHERE FILE = '/proc/version'\G
*************************** 1. row ***************************
    FILE: /proc/version
CONTENTS: Linux version 6.6.3-arch1-1 (linux@archlinux) (gcc (GCC) 13.2.1 20230801, GNU ld (GNU Binutils) 2.41.0) #1 SMP PREEMPT_DYNAMIC Wed, 29 Nov 2023 00:37:40 +0000

1 row in set (0.00 sec)
```

> 若不加 WHERE 条件则输出所有信息

例如可以查看DEV信息：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.PROCFS WHERE FILE = '/proc/net/dev' \G
```

以及查看CPU信息：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.PROCFS WHERE FILE = '/proc/cpuinfo' \G
```

## 新增表PROCFS

INFORMATION_SCHEMA.PROCFS 视图的架构定义是：

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

## 新增状态变量、相关参数

### 新增状态变量提供基本指标

| 变量名                   | 描述                                          |
| ------------------------ | --------------------------------------------- |
| procfs_access_violations | 没有 ACCESS_PROCFS 权限的用户尝试查询的次数。 |
| procfs_queries           | 针对 procfs 视图进行的查询数。                |
| procfs_files_read        | 为提供内容而读取的文件数                      |
| procfs_bytes_read        | 为提供内容而读取的字节数                      |

使用以下方式查看新增的状态变量
```sql
greatsql> SHOW STATUS LIKE 'procfs_access_violations';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| procfs_access_violations | 1     |
+--------------------------+-------+
1 row in set (0.00 sec)
```

### 新增系统参数

| System Variable Name       | procfs_files_spec |
| -------------------------- | ----------------- |
| Variable Scope             | Global            |
| Dynamic Variable           | YES               |
| Read, Write, or Read-Only: | Read-Only         |

该系统参数已在 GreatSQL 中实现，`procfs_files_spec` 的默认值是：

`/proc/cpuinfo;/proc/irq/*/*;/proc/loadavg/proc/net/dev;/proc/net/sockstat;/proc/net/sockstat_rhe4;/proc/net/tcpstat;/proc/self/net/netstat;/proc/self/stat;/proc/self/io;/proc/self/numa_maps/proc/softirqs;/proc/spl/kstat/zfs/arcstats;/proc/stat;/proc/sys/fs/file-nr;/proc/version;/proc/vmstat`

允许访问 `/proc` 和 `/sys` 目录和文件。该变量是全局的、只读的，可以通过使用命令行或通过编辑 `my.cnf` 来设置。

## 插件限制

ProcFS 插件限制如下：

- 仅返回 /proc/ /sys/ 文件的前 60k
- 文件名大小限制为 1k
- 如果路径不是从 /proc 或 /sys 开始，则插件无法读取文件
- 复杂的 WHERE 条件可能会强制插件读取所有配置的文件

## 卸载插件

以下语句删除 procfs 插件

```sql
greatsql> UNINSTALL PLUGIN procfs;
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
