# Auditing
---

GreatSQL supports the auditing feature and can write audit logs into data tables, and the audit log into-table rules can be configured to meet different auditing needs.

The auditing feature only records audit information of the current node, and does not record Binlog when writing to tables to avoid data being replicated to secondary nodes. When `sql_log_bin = 1` is set, only `SELECT, SHOW CREATE, SHOW FIELDS` are allowed to view the audit tables.

The audit content will include the operating account, client IP, the database objects operated on, the complete statement of the operation, and the operation result.

The auditing feature can achieve the following effects:
- Audit login failure behavior.
- Audit database service startup and shutdown.
- Allow auditing database operations based on database operation types, allowing 1 or more data operation types to be configured for auditing.
- Allow auditing database operations based on database objects, allowing operations on 1 or more database objects to be configured for auditing.
- Allow auditing operations based on database users, allowing operations of 1 or more database users to be configured for auditing.
- After the audit log into-table feature is enabled, a copy of the audit logs can still be stored in the log file at the same time.

## Enabling the Auditing Feature

```sql
-- Install and enable the audit plugin
-- %basedir% is the installation directory of the GreatSQL binary package
-- When installed with the TAR package, it is placed in the /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/share directory
-- Or when installed with the RPM package, it is placed in the /usr/share/mysql directory
greatsql> SOURCE %basedir%/share/install_audit_log.sql;

-- Uninstall and disable the audit plugin
greatsql> SOURCE %basedir%/share/uninstall_audit_log.sql;

-- Enable the audit log into-table feature
greatsql> SET GLOBAL audit_log_to_table = 1;

-- View audit information
greatsql> select * from sys_audit.audit_log\G
...
          name: Query
        record: 1_17_2024-07-17T05:57:34
     timestamp: 2024-07-17 13:58:34
 command_class: create_table
 connection_id: 40
        status: 0
       sqltext: create table t1(id int unsigned not null primary key, c1 varchar(20) not null)
          user: root[root] @ localhost []
          host: localhost
     priv_user:
       os_user:
            ip:
            db: greatsql
server_version:
    os_version:
     server_id: 1
       timegmt: 1721195915424930
...
```

Where

- `name` The audited operation behavior. Common ones are Query (query), Quit (exit), Connect (connection), Init DB (selecting a database).
- `record` The unique identifier of the audit record, composed of *server_id + current node incrementing sequence number + timestamp*.
- `timestamp` The audit record time.
- `command_class` The operation behavior type, e.g., select (SELECT query), init db (selecting a database).
- `connection_id` The user connection ID.
- `status` The status of the executed operation. **0** means success, non-zero means error (usually SQL execution errors, such as syntax errors, etc.).
- `sqltext` The SQL statement for which the operation was requested.
- `user` The client user name that performed the operation.
- `host` The client host name.
- `priv_user` The user name used to check privileges.
- `os_user` The operating system user name.
- `ip` The user login IP.
- `db` The current database name when the operation was executed.
- `server_version` The database version.
- `os_version` The operating system version.
- `server_id` The *server_id* of the current database node.
- `timegmt` The audit record timestamp.

If the audit log into-table feature is not enabled, the audit logs are stored in an external log file, by default `audit.log`, in the `datadir` directory, for example:

```bash
$ cat audit.log

...
<AUDIT_RECORD
  NAME="Query"
  RECORD="1_17_2024-07-17T05:57:34"
  TIMESTAMP="2024-07-17 13:58:34"
  COMMAND_CLASS="create_table"
  CONNECTION_ID="40"
  STATUS="0"
  SQLTEXT="create table t1(id int unsigned not null primary key, c1 varchar(20) not null)"
  USER="root[root] @ localhost []"
  HOST="localhost"
  OS_USER=""
  IP=""
  DB="greatsql"
/>
...
```

## Description of New Variables

The new parameters/options related to the auditing feature are

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

| System Variable Name | audit_log_enabled |
| -------------------- | ----------------- |
| Command-line         | Yes               |
| Scope                | Global            |
| Dynamic              | Yes               |
| Data type            | Boolean           |
| Default value        | 1                 |
| Allowed values       | 1 (on), 0 (off)   |

The master switch of the audit log feature, used to set whether to enable this feature.

::: tip Tip
After executing `SOURCE install_audit_log.sql` to install the audit plugin, `audit_log_enabled = 1` will be automatically set to enable the auditing feature.

You can also execute `SET GLOBAL audit_log_enabled = 0` to temporarily disable the auditing feature without uninstalling the audit plugin.
:::

- audit_log_to_table

| System Variable Name | audit_log_to_table |
| -------------------- | ------------------ |
| Command-line         | Yes                |
| Scope                | Global             |
| Dynamic              | Yes                |
| Data type            | Boolean            |
| Default value        | 0                  |
| Allowed values       | 1 (on), 0 (off)    |

The switch for whether audit logs are written to data tables, used to set whether to enable this feature.

- audit_log_strategy

| System Variable Name | audit_log_strategy                  |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | ASYNCHRONOUS                        |
| Allowed values       | ASYNCHRONOUS, PERFORMANCE, SEMISYNCHRONOUS, SYNCHRONOUS |

Sets the audit log storage strategy. It is only effective when `audit_log_handler=FILE`. The optional values are:

- **ASYNCHRONOUS (default)**, uses a memory buffer to store logs; if the buffer is full, messages are not discarded.
- **PERFORMANCE**, uses a memory buffer to store logs; if the buffer is full, messages are discarded.
- **SEMISYNCHRONOUS**, directly records to the file without flushing & syncing each event.
- **SYNCHRONOUS**, directly records to the file, flushing and syncing each event.

<br/>

- audit_log_file

| System Variable Name | audit_log_file                      |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | audit.log                           |

Sets the audit log file name, which can be a relative path containing `datadir` or an absolute path.

- audit_log_flush

| System Variable Name | audit_log_flush                     |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |
| Default value        | OFF                                 |

When this variable is set to ON, the audit log file is first closed and then reopened, which can be used to manually switch log files.

- audit_log_buffer_size

| System Variable Name | audit_log_buffer_size               |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | Numeric                             |
| Default value        | 1 Mb                                |

Sets the size of the memory buffer used to store audit log records. It is effective when `audit_log_strategy = ASYNCHRONOUS | PERFORMANCE` and `audit_log_handler = FILE`.

- audit_log_exclude_accounts

| System Variable Name | audit_log_exclude_accounts          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

Used to specify the excluded user list when applying "filter by user". The value can be NULL or a comma-separated account list, e.g., `user1@host,'user2'@'host',user3@%`. It takes effect in new sessions after being set. If this variable is set, `audit_log_include_accounts` cannot be set at the same time, and vice versa.

- audit_log_exclude_commands

| System Variable Name | audit_log_exclude_commands          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

Used to specify the excluded SQL command list when applying "filter by SQL command". The value can be NULL or a comma-separated command list. If this variable is set, `audit_log_include_commands` cannot be set at the same time, and vice versa.

- audit_log_exclude_databases

| System Variable Name | audit_log_exclude_databases         |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

Used to specify the excluded database list when applying "filter by database". The value can be NULL or a comma-separated database list. If this variable is set, `audit_log_include_databases` cannot be set at the same time, and vice versa.

- audit_log_format

| System Variable Name | audit_log_format                    |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | OLD                                 |
| Allowed values       | OLD, NEW, CSV, JSON                 |

Used to set the audit log format, supporting four formats: `OLD/NEW/JSON/CSV`. Among them, `OLD` and `NEW` formats are based on XML; the former outputs log record attributes as XML attributes, and the latter outputs them as XML tags.

- audit_log_include_accounts

| System Variable Name | audit_log_include_accounts          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

Used to specify the included user list when applying "filter by user". The value can be NULL or a comma-separated account list, e.g., `user1@host,'user2'@'host',user3@%`. If this variable is set, `audit_log_exclude_accounts` cannot be set at the same time, and vice versa.

- audit_log_include_commands

| System Variable Name | audit_log_include_commands          |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

Used to specify the included SQL command list when applying "filter by SQL command". The value can be NULL or a comma-separated SQL command list. If this variable is set, `audit_log_exclude_commands` cannot be set at the same time, and vice versa.

- audit_log_include_databases

| System Variable Name | audit_log_include_databases         |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |

Used to specify the included database list when applying "filter by database". The value can be NULL or a comma-separated database list. If this variable is set, `audit_log_exclude_databases` cannot be set at the same time, and vice versa.

- audit_log_policy

| System Variable Name | audit_log_policy                    |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | Yes                                 |
| Data type            | String                              |
| Default value        | ALL                                 |
| Allowed values       | ALL, LOGINS, QUERIES, NONE          |

Sets which events should be recorded in the audit log. The possible values are:

  - **ALL**, all events will be recorded.
  - **LOGINS**, only login events are recorded.
  - **QUERIES**, only query events are recorded.
  - **NONE**, no events will be recorded.

<br/>

- audit_log_rotate_on_size

| System Variable Name | audit_log_rotate_on_size            |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | Numeric                             |
| Default value        | 0 (don't rotate the log file)       |

Sets the maximum size of the audit log file, in Bytes. When the threshold is reached, the audit log is automatically rotated, and the new file after rotation automatically gets a corresponding sequence number. It is only effective when `audit_log_handler = FILE`.

- audit_log_rotations

| System Variable Name | audit_log_rotations                 |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | Numeric                             |
| Default value        | 0                                   |

Used to set how many log files should be kept when `audit_log_rotate_on_size` is set to a non-zero value. It is only effective when `audit_log_handler = FILE`.

- audit_log_handler

| System Variable Name | audit_log_handler                   |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | FILE                                |
| Allowed values       | FILE, SYSLOG                         |

Used to set the way audit logs are written. If set to `FILE`, they are written to the file specified by the `audit_log_file` variable. If set to `SYSLOG`, they are written to the operating system `SYSLOG`.

- audit_log_syslog_ident

| System Variable Name | audit_log_syslog_ident              |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | percona-audit                       |

Used to set the `ident` value of SYSLOG. The meaning of this variable is the same as the corresponding parameter described in the [syslog(3) manual](http://linux.die.net/man/3/syslog).

- audit_log_syslog_facility

| System Variable Name | audit_log_syslog_facility           |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | LOG_USER                            |

Used to set the `facility` value of SYSLOG. The meaning of this variable is the same as the corresponding parameter described in the [syslog(3) manual](http://linux.die.net/man/3/syslog).

- audit_log_syslog_priority

| System Variable Name | audit_log_syslog_priority           |
| -------------------- | ----------------------------------- |
| Command-line         | Yes                                 |
| Scope                | Global                              |
| Dynamic              | No                                  |
| Data type            | String                              |
| Default value        | LOG_INFO                            |

Used to set the `priority` value of SYSLOG. The meaning of this variable is the same as the corresponding parameter described in the [syslog(3) manual](http://linux.die.net/man/3/syslog).

## New Status Variables

- Audit_log_buffer_size_overflow

| Option    | Description |
| ---       | ---         |
| Scope     | Global      |
| Data type | Numeric     |

The number of times audit log records are deleted or directly written to the file because their size is larger than the `audit_log_buffer_size` variable.

## Application Example
```sql
-- Enable the audit log into-table feature
SET GLOBAL audit_log_to_table = 1;

-- Exclude the operation records of some administrator-role users
-- Note that this only excludes, not prohibits, the operations of administrators
SET PERSIST audit_log_exclude_accounts = 'root@localhost, admin@%, app_adm@%';

-- Reset the exclusion list. Note that you should set = NULL here, not = 'NULL'
SET PERSIST audit_log_exclude_accounts = NULL;

-- View audit logs (in reverse chronological order)
SELECT * FROM sys_audit.audit_log ORDER BY timestamp DESC LIMIT 10;
```


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
