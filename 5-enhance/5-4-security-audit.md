# 审计
---

GreatSQL支持审计功能，并将审计日志写入数据表中，并且设置审计日志入表规则，以便达到不同的审计需求。

审计内容将包括操作账户、客户端ip、被操作的数据库对象、操作的完整语句、操作结果。

审计功能可实现以下几个作用：
- 对登录失败行为进行审计。
- 对数据库服务的启动和关闭进行审计。
- 允许基于数据库操作类型对数据库的操作进行审计，允许配置1个到多个的数据操作类型进行审计。
- 允许基于数据库对象对数据库的操作进行审计，允许配置针对1个到多个的数据库对象的操作进行审计。
- 允许基于数据库用户的操作进行审计，允许配置针对1个到多个的数据库用户的操作进行审计。
- 启用审计日志入表后，审计日志仍然可以同时存储一份在日志文件中。

## 1. 启用审计功能

```sql
-- 安装插件
greatsql> INSTALL PLUGIN audit_log SONAME 'audit_log.so';

-- 启用审计功能
greatsql> SET GLOBAL audit_log_enabled = 1;

-- 启用审计入表特性
greatsql> SET GLOBAL audit_log_to_table = 1;

-- 查看审计信息
greatsql> select * from sys_audit.audit_log\G
*************************** 1. row ***************************
         name: Query
       record: 75670_2024-02-26T02:17:29
    timestamp: 2024-02-26T10:55:17Z
command_class: select
connection_id: 444
       status: 0
      sqltext: explain select /*+ JOIN_ORDER(t1, t2) */ * from nation t1, region t2
         user: yejr[yejr] @  [127.0.0.1]
         host:
      os_user:
           ip: 127.0.0.1
           db: tpch
```

如果没启用审计入表特性，则审计日志存储在外部日志文件中，默认文件为 `audit.log`，在 `datadir` 目录下，例如：
```shell
$ cat audit.log
...
<AUDIT_RECORD
  NAME="Query"
  RECORD="75691_2024-02-26T02:17:29"
  TIMESTAMP="2024-02-26T10:56:41Z"
  COMMAND_CLASS="select"
  CONNECTION_ID="454"
  STATUS="0"
  SQLTEXT="explain select /*+ JOIN_ORDER(t1, t2) */ * from nation t1, region t2"
  USER="yejr[yejr] @  [127.0.0.1]"
  HOST=""
  OS_USER=""
  IP="127.0.0.1"
  DB="tpch"
/>
...
```

## 2. 新增变量说明

审计功能相关新增参数/选项有

```sql
greatsql> SHOW VARIABLES LIKE 'audit%';
+-----------------------------+----------------+
| Variable_name               | Value          |
+-----------------------------+----------------+
| audit_log_buffer_size       | 1048576        |
| audit_log_enabled           | 1              |
| audit_log_exclude_accounts  |                |
| audit_log_exclude_commands  |                |
| audit_log_exclude_databases |                |
| audit_log_file              | audit.log      |
| audit_log_flush             | OFF            |
| audit_log_format            | OLD            |
| audit_log_handler           | FILE           |
| audit_log_include_accounts  |                |
| audit_log_include_commands  |                |
| audit_log_include_databases |                |
| audit_log_max_rows          | 2147483647     |
| audit_log_policy            | ALL            |
| audit_log_rotate_on_size    | 0              |
| audit_log_rotations         | 0              |
| audit_log_strategy          | ASYNCHRONOUS   |
| audit_log_syslog_facility   | LOG_USER       |
| audit_log_syslog_ident      | percona-audit  |
| audit_log_syslog_priority   | LOG_INFO       |
| audit_log_to_table          | 1              |
+-----------------------------+----------------+
21 rows in set (0.00 sec)
```
- audit_log_enabled

| System Variable Name | audit_log_enabled                   |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | Boolean                             |
| Default value        | 1                                   |
| Allowed values       | 1(ON), 0(OFF)                       |

审计日志功能总开关，设置是否启用该功能。

- audit_log_to_table

| System Variable Name | audit_log_to_table                  |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | Boolean                             |
| Default value        | 0                                   |
| Allowed values       | 1(ON), 0(OFF)                       |

审计日志是否写入到数据表开关，设置是否启用该特性。

- audit_log_strategy

| System Variable Name | audit_log_strategy                  |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | ASYNCHRONOUS                        |
| Allowed values       | ASYNCHRONOUS, PERFORMANCE, SEMISYNCHRONOUS, SYNCHRONOUS |

设置审计日志存盘策略，当 `audit_log_handler=FILE` 时才有效，可选值有：

- ASYNCHRONOUS（默认），使用内存缓冲区存储日志，如果缓冲区已满，不丢弃消息。
- PERFORMANCE，使用内存缓冲区存储日志，如果缓冲区已满，则丢弃消息。
- SEMISYNCHRONOUS，直接记录到文件，不刷新&同步每个事件。
- SYNCHRONOUS，直接记录到文件，刷新并同步每个事件。

- audit_log_file

| System Variable Name | audit_log_file                      |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | audit.log                           |

设置审计日志文件名，可以是包含 `datadir` 的相对路径或绝对路径。

- audit_log_flush

| System Variable Name | audit_log_flush                     |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |
| Default value        | OFF                                 |

当此变量设置为ON时，审计日志文件会先关闭而后重新打开，这可用于手动切换日志文件。

- audit_log_buffer_size

| System Variable Name | audit_log_buffer_size               |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | Numeric                             |
| Default value        | 1 Mb                                |

设置用于存储审计日志记录的内存缓冲区大小，当 `audit_log_strategy = ASYNCHRONOUS | PERFORMANCE` 时，且当 `audit_log_handler = FILE` 时有效。

- audit_log_exclude_accounts

| System Variable Name | audit_log_exclude_accounts          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

用于指定应用“按用户筛选”时的排除用户列表。该值可以是NULL，也可以是以逗号分隔的帐户列表，例如：`user1@host,'user2'@'host',user3@%`。如果设置了此变量，则不能同时设置 `audit_log_include_accounts`，反之亦然。

- audit_log_exclude_commands

| System Variable Name | audit_log_exclude_commands          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

用于指定应用“按SQL命令筛选”时的排除SQL命令列表。该值可以是NULL或逗号分隔的命令列表。如果设置了此变量，则不能同时设置 `audit_log_include_commands`，反之亦然。

- audit_log_exclude_databases

| System Variable Name | audit_log_exclude_databases         |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

用于指定应用“按数据库筛选”时的排除数据库列表。该值可以是NULL或逗号分隔的数据库列表。如果设置了此变量，则不能同时设置 `audit_log_include_databases`，反之亦然。

- audit_log_max_rows

| System Variable Name | audit_log_max_rows                  |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | Numeric                             |
| Default value        | 2147483647                          |
| Allowed values       | [0, ULONG]                          |

- audit_log_format

| System Variable Name | audit_log_format                    |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | OLD                                 |
| Allowed values       | OLD, NEW, CSV, JSON                 |

用于设置审计日志格式，支持四种格式：`OLD/NEW/JSON/CSV`。其中`OLD`和`NEW`格式基于XML，前者将日志记录属性输出为XML属性，后者输出为XML标记。

- audit_log_include_accounts

| System Variable Name | audit_log_include_accounts          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

用于指定应用“按用户筛选”时的包含用户列表。该值可以是NULL，也可以是以逗号分隔的帐户列表，例如：`user1@host,'user2'@'host',user3@%`。如果设置了此变量，则不能同时设置 `audit_log_exclude_accounts`，反之亦然。

- audit_log_include_commands

| System Variable Name | audit_log_include_commands          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

用于指定应用“按SQL命令筛选”时的包含SQL命令列表。该值可以是NULL，也可以是以逗号分隔的SQL命令列表。如果设置了此变量，则不能同时设置 `audit_log_exclude_commands`，反之亦然。

- audit_log_include_databases

| System Variable Name | audit_log_include_databases         |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

用于指定应用“按数据库筛选”时的包含数据库列表。该值可以是NULL，也可以是以逗号分隔的数据库列表。如果设置了此变量，则不能同时设置 `audit_log_exclude_databases`，反之亦然。

- audit_log_policy

| System Variable Name | audit_log_policy                    |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |
| Default value        | ALL                                 |
| Allowed values       | ALL, LOGINS, QUERIES, NONE          |

设定审计日志应该记录哪些事件，可能的值为：
- ALL，将记录所有事件。
- 登录，只记录登录事件。
- 查询，只记录查询事件。
- NONE，不会记录任何事件。

- audit_log_rotate_on_size

| System Variable Name | audit_log_rotate_on_size            |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | Numeric                             |
| Default value        | 0 (don’t rotate the log file)       |

设置审计日志文件的最大大小，单位：Byte。达到阈值后，将自动轮转审计日志，轮转后的新文件将自动增加相应的序号。当 `audit_log_handler = FILE` 时才有效。

- audit_log_rotations

| System Variable Name | audit_log_rotations                 |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | Numeric                             |
| Default value        | 0                                   |

用于设置当 `audit_log_rotate_on_size` 设置为非零值时应保留多少个日志文件。当 `audit_log_handler = FILE` 时才有效。

- audit_log_handler

| System Variable Name | audit_log_handler                   |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | FILE                                |
| Allowed values       | FILE, SYSLOG                        |

用于设置审计日志的写入的方式。如果设置为 `FILE`，则写入由 `audit_log_file` 变量指定的文件中。如果设置为 `SYSLOG`，则写入操作系统 `SYSLOG`。

- audit_log_syslog_ident

| System Variable Name | audit_log_syslog_ident              |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | percona-audit                       |

用于设置SYSLOG的 `ident` 值，该变量的含义与[syslog(3)手册](http://linux.die.net/man/3/syslog)中描述的相应参数相同。

- audit_log_syslog_facility

| System Variable Name | audit_log_syslog_facility           |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | LOG_USER                            |

用于设置SYSLOG的 `facility` 值，该变量的含义与[syslog(3)手册](http://linux.die.net/man/3/syslog)中描述的相应参数相同。

- audit_log_syslog_priority

| System Variable Name | audit_log_syslog_priority           |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | LOG_INFO                            |

用于设置SYSLOG的 `priority` 值，该变量的含义与[syslog(3)手册](http://linux.die.net/man/3/syslog)中描述的相应参数相同。

## 3. 新增状态变量

- Audit_log_buffer_size_overflow

| Option    | Description |
| ---       | ---         |
| Scope     | Global      |
| Data type | Numeric     |

由于审计日志记录的大小大于 `audit_log_buffer_size` 变量而将其删除或直接写入文件的次数。


## 4. 应用案例
```
-- 启用审计入表特性
greatsql> SET GLOBAL audit_log_to_table = 1;

-- 排除部分管理员角色用户的操作记录
-- 注意，这里只是排除，而不是禁止管理员的操作
greatsql> SET PERSIST audit_log_exclude_accounts = 'root@localhost, admin@%, app_adm@%';

-- 重置排除名单，注意这里要设置 = NULL，而不是 = 'NULL'
greatsql> SET PERSIST audit_log_exclude_accounts = NULL;

-- 查看审计日志（按时间倒序）
greatsql> SELECT * FROM sys_audit.audit_log ORDER BY timestamp DESC LIMIT 10;
```

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
