# Auditing
---

The auditing feature in GreatSQL 8.4 has changed significantly compared to the 8.0 version, switching from the previous Plugin-based working mode to a Component-based working mode.

The audit log filter component can be used to monitor, record and block connections or queries actively executed on the selected server.

Enabling this component generates a log file (default file name `audit_filter.log`) that contains a record of server activity. The log file contains information about the connections and databases accessed by those connections.

The component uses the **mysql** system database by default to store filter and user account data. A different database can be selected by setting the `audit_log_filter.database` parameter at server startup. When this parameter changes, the initialization installation script needs to be re-executed (demonstrated below).

Privileges related to the audit log filter:
- The **AUDIT_ADMIN** privilege is required for a user to manage and configure the audit log filter component.
- The **AUDIT_ABORT_EXEMPT** privilege allows ordinary users to query the audit log. User accounts with the **SYSTEM_USER** privilege also have the **AUDIT_ABORT_EXEMPT** privilege.

## Installing the Audit Log Filter

```sql
-- Install and enable the audit log filter component
-- %basedir% is the installation directory of the GreatSQL binary package
-- When installed with the TAR package, it is located in the /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/share directory
-- Or when installed with the RPM package, it is located in the /usr/share/mysql directory

-- First switch to the mysql system database
greatsql> USE mysql;

-- Execute the audit initialization script
greatsql> SOURCE %basedir%/share/audit_log_filter_linux_install.sql;

-- Check whether the component has been installed correctly
greatsql> SELECT * FROM mysql.component;
+--------------+--------------------+-----------------------------------+
| component_id | component_group_id | component_urn                     |
+--------------+--------------------+-----------------------------------+
|           10 |                  1 | file://component_audit_log_filter |
+--------------+--------------------+-----------------------------------+

-- After running the script, verify that the required tables were created
greatsql> SHOW TABLES IN MYSQL LIKE 'aud%';
+------------------------+
| Tables_in_mysql (aud%) |
+------------------------+
| audit_log_filter       |
| audit_log_user         |
+------------------------+

-- Test whether the audit log filter works properly
greatsql> SELECT audit_log_filter_set_filter('log_all', '{"filter": {"log": true}}');
+---------------------------------------------------------------------+
| audit_log_filter_set_filter('log_all', '{"filter": {"log": true}}') |
+---------------------------------------------------------------------+
| OK                                                                  |
+---------------------------------------------------------------------+

greatsql> SELECT audit_log_filter_set_user('greatsql@%', 'log_all');
+----------------------------------------------------+
| audit_log_filter_set_user('greatsql@%', 'log_all') |
+----------------------------------------------------+
| OK                                                 |
+----------------------------------------------------+

-- Uninstall and disable the audit component
greatsql> UNINSTALL COMPONENT "file://component_audit_log_filter";
```

## Managing the Audit Log

The audit log is stored in an external log file with the default file name `audit_filter.log`, located in the `datadir` directory, for example:

```bash
$ cat audit_filter.log

...
  <AUDIT_RECORD>
    <NAME>Query Start</NAME>
    <RECORD_ID>150_2025-10-09T15:02:05</RECORD_ID>
    <TIMESTAMP>2025-10-09T15:02:05</TIMESTAMP>
    <STATUS>0</STATUS>
    <CONNECTION_ID>17</CONNECTION_ID>
    <COMMAND_CLASS>show_variables</COMMAND_CLASS>
    <SQLTEXT>show global variables like '%audit%'</SQLTEXT>
  </AUDIT_RECORD>
  <AUDIT_RECORD>
    <NAME>Variable Get</NAME>
    <RECORD_ID>151_2025-10-09T15:02:05</RECORD_ID>
    <TIMESTAMP>2025-10-09T15:02:05</TIMESTAMP>
    <COMMAND_CLASS>show_variables</COMMAND_CLASS>
    <CONNECTION_ID>17</CONNECTION_ID>
    <VARIABLE_NAME>activate_all_roles_on_login</VARIABLE_NAME>
    <VARIABLE_VALUE>OFF</VARIABLE_VALUE>
  </AUDIT_RECORD>
...
```

By default, the audit log file is stored in the data directory with the default file name `audit_log_filter.file`. If necessary, the location can be changed by modifying the `audit_log_filter.file` parameter at server startup.

By default, these files are not encrypted and may contain sensitive information, so care should be taken to protect audit log files from leakage. File encryption can be enabled by modifying the `audit_log_filter.encryption` parameter.

If the audit log file is large, log rotation can be enabled, in which case there may be multiple audit log files. Log rotation can be performed in the following ways:

- Manually call a function to rotate the log.

```sql
-- When manually executing the log rotation function, the corresponding archived log file name is returned
greatsql> SELECT audit_log_rotate();
+----------------------------------+
| audit_log_rotate()               |
+----------------------------------+
| audit_filter.20251009T162203.log |
+----------------------------------+
```

- Set the parameter `audit_log_filter.rotate_on_size` to a value greater than 0. The default value is 1GB, meaning the log is automatically rotated when the audit log file exceeds 1GB. If set to 0, automatic rotation is disabled.

- If the value of the parameter `audit_log_filter.max_size` or `audit_log_filter.prune_seconds` is greater than 0, and the value of the parameter `audit_log_filter.rotate_on_size` is also greater than 0, the log files will be cleaned up automatically.

## Filtering the Audit Log

Audit log filtering is based on rules. Filter rules can include or exclude events based on the following attributes:

- User account
- Audit activity class
- Audit event subclass
- Audit event field (for example **COMMAND_CLASS** or **STATUS**)

### Filter-Related Functions

Multiple filters can be defined, and any filter can be assigned to multiple accounts. A default filter can also be created for a specific user account. Filters are defined by calling functions. Once defined, filters are stored in the `mysql` system tables.

| Function | Description | Example |
| :--- | :--- | :--- |
| audit_log_filter_flush()         | Manually flush the filter tables | `SELECT audit_log_filter_flush()` |
| audit_log_filter_set_filter()    | Define a filter | `SELECT audit_log_filter_set_filter('log_all', '{"filter": {"log": true}}');` |
| audit_log_filter_remove_filter() | Remove a filter | `SELECT audit_log_filter_remove_filter('log_all');` |
| audit_log_filter_set_user()      | Assign a filter to a specific user account | `SELECT audit_log_filter_set_user('greatsql@%', 'log_all');` |
| audit_log_filter_remove_user()   | Remove a filter from a specific user account | `SELECT audit_log_filter_remove_user('greatsql@%');` |

### **set_filter** Options and Available Filters

| Filter | Available Filters |
| :--- | :--- |
| class Filter | `general`: records general server events<br/>`connection`: tracks activities related to connections<br/>`table_access`: monitors database table interactions |
| user Filter  | Accepts specific user names as parameters, can include multiple user names, supports wildcards |
| database Filter | Filters events by database name, accepts database names as parameters, supports wildcards |
| table Filter | Specifies a single table name, allows filtering on specific tables in the database, supports wildcards |
| operation Filter | `read`: SELECT statements<br/>`write`: INSERT, UPDATE, DELETE statements<br/>`ddl`: DDL statements<br/>`dcl`: DCL statements |
| event Filter | `status`: tracks query execution status<br/>`query`: captures query details<br/>`connection`: monitors connection events |
| status Filter | `0`: success<br/>`1`: failure |

Examples:

```sql
greatsql> SELECT audit_log_filter_set_filter('log_general', '{
  "filter": {
    "class": {
      "name": "general"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_connection', '{
  "filter": {
    "class": {
      "name": "connection"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_table_access', '{
  "filter": {
    "class": {
      "name": "table_access"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_global_variable', '{
  "filter": {
    "class": {
      "name": "global_variable"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_command', '{
  "filter": {
    "class": {
      "name": "command"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_query', '{
  "filter": {
    "class": {
      "name": "query"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_stored_program', '{
  "filter": {
    "class": {
      "name": "stored_program"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_authentication', '{
  "filter": {
    "class": {
      "name": "authentication"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_message', '{
  "filter": {
    "class": {
      "name": "message"
    }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_connect', '{
  "filter": {
    "class": { "name": "connection" },
    "event": { "name": "connect" }
  }
}');

greatsql> SELECT audit_log_filter_set_filter('log_disconnect', '{
  "filter": {
    "class": { "name": "connection" },
    "event": { "name": "disconnect" }
  }
}');
```

## Disabling the Audit Log Filter

Modify the parameter `audit_log_filter.disable` online to disable or enable the audit log filter. For example:

```sql
-- Disable
greatsql> SET GLOBAL audit_log_filter.disable=ON;

-- Enable
greatsql> SET GLOBAL audit_log_filter.disable=OFF;
```

Modifying this parameter online requires the **AUDIT_ADMIN** or **SYSTEM_VARIABLES_ADMIN** privilege.

## Related Functions, Parameters, and Status Variables

### Functions

| Function | Description |
| :--- | :--- |
| audit_log_encryption_password_get(keyring_id)   | This function returns the encryption password. If the `keyring_id` parameter is omitted, the current encryption password is returned |
| audit_log_encryption_password_set(new_password) | Encrypts the password and stores the new password in the keyring. The `password` parameter is a string with a maximum length of 766 bytes |
| audit_log_filter_flush()                        | Directly modifying the audit log filter tables with `INSERT, UPDATE, DELETE` does not take effect immediately. Calling this function updates the audit log filtering policy and makes it effective |
| audit_log_read()                                | Reads the audit log and returns a JSON-formatted string. An error is raised if the audit log format is not JSON |
| audit_log_read_bookmark()                       | Provides a bookmark for the most recently written audit log event, presented as a JSON string. An error is raised if the format is not JSON |
| audit_log_session_filter_id()                   | Returns the internal ID of the audit log filter for the current session, or 0 if the session has no filter assigned |
| audit_log_filter_remove_filter(filter_name)     | Removes a filter |
| audit_log_filter_remove_user(user_name)         | Removes a filter from a specific user account |
| audit_log_rotate()                              | Log rotation function |
| audit_log_filter_set_filter(filter_name, definition) | Defines a filter |
| audit_log_filter_set_user(user_name, filter_name) | Assigns a filter to a specific user account |

### Parameters

| System Variable Name | Dynamic Variable | Variable Scope |Type | Default |  Permitted Values |  Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| audit_log_filter.buffer_size | No | Global | Integer     | 1048576 | 4096-18446744073709547520 | Audit log filter buffer size, in bytes |
| audit_log_filter.compression | No | Global | Enumeration | NONE    | NONE, GZIP | Whether compression is enabled |
| audit_log_filter.database    | No | Global | String      | mysql   | / | The database where the filter rule tables are stored |
| audit_log_filter.disable     | Yes| Global | Boolean     | OFF     | ON, OFF | Whether the audit log filter is disabled |
| audit_log_filter.encryption  | No | Global | Enumeration | NONE    | NONE, AES | Whether encryption is enabled |
| audit_log_filter.file        | No | Global | String      | audit_filter.log | / | Audit log file name, supports relative and absolute paths |
| audit_log_filter.format      | No | Global | Enumeration | NEW | [OLD](https://docs.percona.com/percona-server/8.4/audit-log-filter-old.html), [NEW](https://docs.percona.com/percona-server/8.4/audit-log-filter-new.html), [JSON](https://docs.percona.com/percona-server/8.4/audit-log-filter-json.html) | Audit log filter format |
| audit_log_filter.format_unix_timestamp | Yes | Global | Boolean | OFF | ON, OFF | Whether audit log entries include a timestamp, only supported for JSON format |
| audit_log_filter.handler     | No | Global | String      | FILE | FILE, SYSLOG | Log filter handler<br/>1. **FILE** - writes logs to the `audit_log_filter.file` file<br/>2. **SYSLOG** - writes logs to the system log file |
| audit_log_filter.key_derivation_iterations_count_mean | Yes | Global | Integer | 60000 | 1000-1000000 | Defines the average number of iterations used by the password-based derivation routine when calculating the encryption key and iv values. The actual iteration count is a random number that does not deviate from this value by more than 10% |
| audit_log_filter.max_size    | Yes| Global | Integer     | 1GB     | 0-18446744073709551615 | Log files are cleaned up automatically when this value is exceeded, in bytes; set to 0 to disable automatic cleanup. It is recommended to set it to about 7 times the value of `audit_log_filter.rotate_on_size` |
| audit_log_filter.password_history_keep_days | Yes | Global | Integer | 0 | / | Defines when a password can be deleted, measured in days |
| audit_log_filter.prune_seconds    | Yes | Global | Integer | 0 | 0-1844674073709551615 | Sets the duration for automatic cleanup of audit log files, in seconds; set to 0 to disable automatic cleanup |
| audit_log_filter.read_buffer_size | Yes | Global | Integer | 32768 | / | Buffer size for reading from the audit log file, in bytes, only supported for JSON format files |
| audit_log_filter.rotate_on_size   | Yes | Global | Integer | 1GB   | / | Log files are rotated automatically when this value is exceeded, in bytes; when set to a value < 4096, automatic rotation is disabled. The `audit_log_rotate()` function can also be called manually to rotate log files |
| audit_log_filter.strategy    | No | Global | Enumeration | ASYNCHRONOUS | ASYNCHRONOUS<br/>PERFORMANCE<br/>SEMISYNCHRONOUS</br>SYNCHRONOUS | Sets the log recording strategy.<br/>1. **ASYNCHRONOUS** - asynchronous, writes when there is space in the external buffer<br/>2. **PERFORMANCE** - high performance, discards requests if there is not enough space in the external buffer<br/>SEMISYNCHRONOUS - the operating system allows caching<br/>3. **SYNCHRONOUS** - synchronous, calls `sync()` every time |
| audit_log_filter.syslog_tag  | No | Global | String      | audit-filter | / | Sets the syslog tag |
| audit_log_filter.syslog_facility  | No | Global | String | LOG_USER | / | Sets the syslog facility value |
| audit_log_filter.syslog_priority  | No | Global | String | LOG_INFO | / | Sets the syslog priority |

### Status Variables

| Status Variable | Description |
| :--- | :--- |
| audit_log_filter_current_size   | Current size of the audit log file; reset to 0 if the log is rotated |
| audit_log_filter_direct_writes  | Total number of times audit events bypassed the buffer and were written directly to the log file |
| audit_log_filter_max_drop_size  | Total number of events dropped in high-performance mode |
| audit_log_filter_events         | Total number of audit log filter calls |
| audit_log_filter_events_filtered| Total number of audit log events that were filtered |
| audit_log_filter_events_lost    | If an event is larger than the available buffer, the event is lost; the total number of lost events |
| audit_log_filter_events_written | Total number of audit events written |
| audit_log_filter_total_size     | Total size of audit events written. This value increases even when logs are rotated |
| audit_log_filter_write_waits    | In asynchronous logging mode, the number of times events waited for free space in the buffer |

## Application Example

Before starting the GreatSQL instance, modify the *my.cnf* configuration file to add the following parameters:

```ini
loose-audit_log_filter.database=mysql
loose-audit_log_filter.format='JSON'
loose-audit_log_filter.read_buffer_size=1048576
```

After starting the GreatSQL instance, install and enable the audit log filter component, set the corresponding rules, and record the operations of all application accounts:

```sql
-- Install and enable the audit log filter component
greatsql> USE mysql;
greatsql> SOURCE /usr/local/GreatSQL/share/audit_log_filter_linux_install.sql;

-- Create a filter to record all operations of the user greatsql@%
greatsql> SELECT audit_log_filter_set_filter('greatsql_filter',
'{
  "filter": {
    "log": false,
    "class": [
      {
        "name": "connection",
        "event": [
          { "name": "connect", "log": false },
          { "name": "disconnect", "log": false }
        ]
      },
      {
        "name": "query",
        "log": true
      },
      {
        "name": "table_access",
        "event": [
          { "name": "read", "log": true },
          { "name": "write", "log": true },
          { "name": "ddl", "log": false },
          { "name": "dcl", "log": false }
        ]
      }
    ]
  }
}');

-- Assign the filter to the user greatsql@%
greatsql> SELECT audit_log_filter_set_user('greatsql@%', 'greatsql_filter');

-- Refresh the configuration (not required)
greatsql> SELECT audit_log_filter_flush();

-- Verify the configuration
greatsql> SELECT * FROM mysql.audit_log_filter;
greatsql> SELECT * FROM mysql.audit_log_user;
```

Use the *greatsql@%* and *yejr@%* users respectively for verification tests:

```bash
$ mysql -h127.0.0.1 -ugreatsql -pXX -P3306 db1 -e "SELECT * FROM t1 LIMIT 1"
$ mysql -h127.0.0.1 -ugreatsql -pXX -P3306 db1 -e "SELECT * FROM t1 LIMIT 1"
```

View the audit log. You should see that the operations of the *greatsql@%* user are recorded, while the operations of the *yejr@%* user are not:

```log
  {
    "timestamp": "2025-10-11 16:42:09",
    "id": 32,
    "class": "query",
    "event": "query_start",
    "connection_id": 134,
    "query_data": {
      "query": "SELECT * FROM t1 LIMIT 1",
      "status": 0,
      "sql_command": "select"}
  },
  {
    "timestamp": "2025-10-11 16:42:09",
    "id": 33,
    "class": "table_access",
    "event": "read",
    "connection_id": 134,
    "table_access_data": {
      "db": "appdb",
      "table": "t1"}
  },
  {
    "timestamp": "2025-10-11 16:42:09",
    "id": 34,
    "class": "query",
    "event": "query_status_end",
    "connection_id": 134,
    "query_data": {
      "query": "SELECT * FROM t1 LIMIT 1",
      "status": 0,
      "sql_command": "select"}
  }
```

## Audit Log Filtering Limitations

The audit log filter has the following limitations:

- Only SQL statements are recorded; statements made through NoSQL APIs (such as the Memcached API) are not recorded.

- Only top-level statements are recorded; statements in stored procedures or triggers are not recorded. The file content of statements such as `LOAD DATA` is not recorded.

- When used with MGR, the component must be installed on each member node server used in the MGR.

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
