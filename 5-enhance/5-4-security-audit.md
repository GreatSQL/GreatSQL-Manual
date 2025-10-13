# 审计
---

GreatSQL 8.4 版本审计功能相较于8.0版本有较大变化，从之前的插件（Plugin）工作方式改为组件（Component）工作方式。

利用审计日志过滤器组件可以实现监控、记录和阻止在所选服务器上主动执行的连接或查询。

启用该组件会生成一个日志文件（默认文件名`audit_filter.log`），其中包含服务器活动记录。日志文件包含有关该连接访问的连接和数据库的信息。

该组件默认使用 **mysql** 系统数据库来存储过滤器和用户帐户数据。在服务器启动时设置 `audit_log_filter.database` 参数，可以选择不同的数据库，当该参数发生变化时，需要重新执行初始化安装脚本（下面有演示）。

审计日志过滤器相关权限：
- 需要 **AUDIT_ADMIN** 权限才能让用户管理配置审计日志过滤器组件。
- 需要 **AUDIT_ABORT_EXEMPT** 权限允许普通用户查询审计日志。具有 **SYSTEM_USER** 权限的用户帐户同时具有 **AUDIT_ABORT_EXEMPT** 权限。

## 安装审计日志过滤器

```sql
-- 安装和启用审计日志过滤器组件
-- %basedir% 是 GreatSQL 二进制包安装目录
-- 如用 TAR 包安装时放在 /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/share 目录下
-- 或用 RPM 包安装时放在 /usr/share/mysql 目录下

-- 先切换到mysql系统库
greatsql> USE mysql;

-- 执行审计功能初始化脚本
greatsql> SOURCE %basedir%/share/audit_log_filter_linux_install.sql;

-- 检查组件是否已正确安装
greatsql> SELECT * FROM mysql.component;
+--------------+--------------------+-----------------------------------+
| component_id | component_group_id | component_urn                     |
+--------------+--------------------+-----------------------------------+
|           10 |                  1 | file://component_audit_log_filter |
+--------------+--------------------+-----------------------------------+

-- 运行脚本后，验证是否创建了所需的表
greatsql> SHOW TABLES IN MYSQL LIKE 'aud%';
+------------------------+
| Tables_in_mysql (aud%) |
+------------------------+
| audit_log_filter       |
| audit_log_user         |
+------------------------+

-- 测试审核日志过滤器是否正常工作
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

-- 卸载关闭审计组件
greatsql> UNINSTALL COMPONENT "file://component_audit_log_filter";
```

## 管理审计日志

审计日志存储在外部日志文件中，默认文件名为 `audit_filter.log`，在 `datadir` 目录下，例如：

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

审计日志文件默认存储在数据目录下，默认文件名是 `audit_log_filter.file`，如果需要，可以在服务器启动时修改 `audit_log_filter.file` 参数来更改位置。

默认情况下，这些文件没有加密，可能包含敏感信息，因此要注意保护审计日志文件避免泄露。可以通过修改 `audit_log_filter.encryption` 参数启用文件加密。

如果审计日志文件较大，可以开启日志轮换，这时可能存在多个审计日志文件。可以采用以下几种方式进行日志轮转：

- 手动调用函数进行日志轮转。

```sql
-- 手动执行日志轮转函数时，返回相应的归档日志文件名
greatsql> SELECT audit_log_rotate();
+----------------------------------+
| audit_log_rotate()               |
+----------------------------------+
| audit_filter.20251009T162203.log |
+----------------------------------+
```

- 设置参数 `audit_log_filter.rotate_on_size` 大于0，默认值为1GB，也即当审计日志文件大于1GB时会自动轮转。如果设置为0则不会自动轮转。

- 如果参数 `audit_log_filter.max_size` 或 `audit_log_filter.prune_seconds` 的值大于0，并且参数 `audit_log_filter.rotate_on_size` 的值大于0，则日志文件将被自动清理。

## 筛选审核日志

审计过滤器日志过滤基于规则。过滤器规则定义能够根据以下属性包含或排除事件：

- 用户帐户
- 审核活动类
- 审计事件子类
- 审核事件字段（例如 **COMMAND_CLASS** 或 **STATUS**）

### 筛选器相关函数

可以定义多个过滤器，并将任何过滤器分配给多个帐户。还可以为特定用户帐户创建默认过滤器。过滤器是调用函数来定义的。定义过滤器后，过滤器存储在 `mysql` 系统表中。

| 函数  | 描述 | 示例 |
| :--- | :--- | :--- |
| audit_log_filter_flush()         | 手动刷新过滤表 | `SELECT audit_log_filter_flush()` |
| audit_log_filter_set_filter()    | 定义一个过滤器 | `SELECT audit_log_filter_set_filter('log_all', '{"filter": {"log": true}}');` |
| audit_log_filter_remove_filter() | 删除过滤器     | `SELECT audit_log_filter_remove_filter('log_all');` |
| audit_log_filter_set_user()      | 为特定用户帐户分配过滤器   | `SELECT audit_log_filter_set_user('greatsql@%', 'log_all');` |
| audit_log_filter_remove_user()   | 从特定用户帐户中删除过滤器 | `SELECT audit_log_filter_remove_user('greatsql@%');` |

### **set_filter** 选项和可用过滤器

| 筛选器 | 可用过滤器 |
| :--- | :--- |
| class Filter | `general`: 记录服务器通用事件<br/>`connection`: 跟踪与连接相关的活动<br/>`table_access`: 监控数据库表交互 |
| user Filter  | 接受特定的用户名作为参数，可以包含多个用户名，支持通配符 |
| database Filter | 按数据库名称过滤事件，接受数据库名称作为参数，支持通配符 |
| table Filter | 指定单个表名，允许对数据库中的特定表进行过滤，支持通配符 |
| operation Filter | `read`: SELECT语句<br/>`write`: INSERT, UPDATE, DELETE语句<br/>`ddl`: DDL语句<br/>`dcl`: DCL语句 |
| event Filter | `status`: 跟踪查询执行状态<br/>`query`: 捕获查询详细信息<br/>`connection`: 监控连接事件 |
| status Filter | `0`: 成功<br/>`1`: 失败 |

示例：

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

## 禁用审计日志过滤器

在线修改参数 `audit_log_filter.disable` 以禁用或启用审计日志过滤器。例如：

```sql
-- 禁用
greatsql> SET GLOBAL audit_log_filter.disable=ON;

-- 启用
greatsql> SET GLOBAL audit_log_filter.disable=OFF;
```

在线修改该参数需要拥有 **AUDIT_ADMIN** 或 **SYSTEM_VARIABLES_ADMIN** 权限。

## 相关函数、参数、状态变量

### 函数

| 函数 | 简介 |
| :--- | :--- |
| audit_log_encryption_password_get(keyring_id)   | 此函数返回加密密码，如果不包含参数 `eyring_id`，将返回当前加密密码 |
| audit_log_encryption_password_set(new_password) | 加密密码，并将新密码存储在 keyring 中，参数 `password` 为字符串，最大长度为766字节 |
| audit_log_filter_flush()                        | 直接用 `INSERT, UPDATE, DELETE` 修改审计日志过滤器表不会立即生效，调用该函数可更新审计日志过滤策略并使之生效 |
| audit_log_read()                                | 读取审计日志，并返回 JSON 格式字符串。如果审计日志格式不是 JSON，则产生报错 |
| audit_log_read_bookmark()                       | 为最近写入的审计日志事件提供书签，以 JSON 字符串形式呈现。如果格式不是 JSON，则产生报错 |
| audit_log_session_filter_id()                   | 返回当前会话中审计日志过滤器的内部 ID，如果会话没有分配过滤器，则返回0 |
| audit_log_filter_remove_filter(filter_name)     | 删除过滤器 |
| audit_log_filter_remove_user(user_name)         | 从特定用户帐户中删除过滤器 |
| audit_log_rotate()                              | 日志轮转函数 |
| audit_log_filter_set_filter(filter_name, definition) | 定义一个过滤器 |
| audit_log_filter_set_user(user_name, filter_name) | 为特定用户帐户分配过滤器 |

### 参数

| System Variable Name | Dynamic Variable | Variable Scope |Type | Default |  Permitted Values |  Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| audit_log_filter.buffer_size | No | Global | Integer     | 1048576 | 4096-18446744073709547520 | 审计日志过滤器缓冲区大小，单位：字节 |
| audit_log_filter.compression | No | Global | Enumeration | NONE    | NONE, GZIP | 是否启用压缩 |
| audit_log_filter.database    | No | Global | String      | mysql   | / | 过滤器规则表存储在哪个数据库 |
| audit_log_filter.disable     | Yes| Global | Boolean     | OFF     | ON, OFF | 是否禁用审计日志过滤器 |
| audit_log_filter.encryption  | No | Global | Enumeration | NONE    | NONE, AES | 是否启用加密 |
| audit_log_filter.file        | No | Global | String      | audit_filter.log | / | 审计日志文件名，支持相对路径和绝对路径写法 |
| audit_log_filter.format      | No | Global | Enumeration | NEW | [OLD](https://docs.percona.com/percona-server/8.4/audit-log-filter-old.html), [NEW](https://docs.percona.com/percona-server/8.4/audit-log-filter-new.html), [JSON](https://docs.percona.com/percona-server/8.4/audit-log-filter-json.html) | 审计日志过滤器格式 |
| audit_log_filter.format_unix_timestamp | Yes | Global | Boolean | OFF | ON, OFF | 审计日志条目是否增加时间戳，仅支持JSON格式 |
| audit_log_filter.handler     | No | Global | String      | FILE | FILE, SYSLOG | 日志过滤器处理器<br/>1. **FILE** - 将日志写入`audit_log_filter.file`文件<br/>2. **SYSLOG** - 将日志写入系统日志文件 |
| audit_log_filter.key_derivation_iterations_count_mean | Yes | Global | Integer | 60000 | 1000-1000000 | 定义基于密码的派生例程在计算加密密钥和iv值时使用的迭代的平均值。随机数表示实际迭代计数，并且偏离该值不超过10% |
| audit_log_filter.max_size    | Yes| Global | Integer     | 1GB     | 0-18446744073709551615 | 超过该值就自动清理日志文件，单位：字节，设置为0则不自动清理。建议设置为 `audit_log_filter.rotate_on_size` 的7倍左右 |
| audit_log_filter.password_history_keep_days | Yes | Global | Integer | 0 | / | 定义何时可以删除密码，并以天为单位进行测量 |
| audit_log_filter.prune_seconds    | Yes | Global | Integer | 0 | 0-1844674073709551615 | 设置审计日志文件自动清理的时长，单位：秒，设置为0则不自动清理 |
| audit_log_filter.read_buffer_size | Yes | Global | Integer | 32768 | / | 从审计日志文件中读取的缓冲区大小，单位：字节，仅支持JSON格式文件 |
| audit_log_filter.rotate_on_size   | Yes | Global | Integer | 1GB   | / | 超过该值就自动轮转日志文件，单位：字节，设置为<4096时则不自动轮转，还可以手动调用 `audit_log_rotate()` 函数轮转日志文件 |
| audit_log_filter.strategy    | No | Global | Enumeration | ASYNCHRONOUS | ASYNCHRONOUS<br/>PERFORMANCE<br/>SEMISYNCHRONOUS</br>SYNCHRONOUS | 设置日志记录策略。<br/>1. **ASYNCHRONOUS** - 异步，等到有外部缓冲空间时写入<br/>2. **PERFORMANCE** - 高性能，如果外部缓冲区没有足够空间，请放弃请求<br/>SEMISYNCHRONOUS - 操作系统允许缓存<br/>3. **SYNCHRONOUS** - 同步，每次都调用 `sync()` |
| audit_log_filter.syslog_tag  | No | Global | String      | audit-filter | / | 设置syslog标签 |
| audit_log_filter.syslog_facility  | No | Global | String | LOG_USER | / | 设置syslog的facility值 |
| audit_log_filter.syslog_priority  | No | Global | String | LOG_INFO | / | 设置syslog的优先级 |

### 状态变量

| 状态变量 | 描述 |
| :--- | :--- |
| audit_log_filter_current_size   | 审计日志文件当前大小，如果日志被轮转，将重置为0 |
| audit_log_filter_direct_writes  | 审计事件绕过缓冲区直接写入日志文件的总次数 |
| audit_log_filter_max_drop_size  | 在高性能模式下，事件丢弃总次数 |
| audit_log_filter_events         | 审计日志过滤器调用的总次数 |
| audit_log_filter_events_filtered| 执行过滤的审计日志事件总数量 |
| audit_log_filter_events_lost    | 如果事件大于可用的缓冲区，则事件将丢失，总共丢失的次数 |
| audit_log_filter_events_written | 写入审计事件的总次数 |
| audit_log_filter_total_size     | 写入审计事件的总大小。即使日志被轮转，该值也会增加 |
| audit_log_filter_write_waits    | 在异步日志模式下，事件在缓冲区中等待空闲空间的次数 |

## 应用案例

启动 GreatSQL 实例前先修改 *my.cnf* 配置文件，增加以下几个参数：

```ini
loose-audit_log_filter.database=mysql
loose-audit_log_filter.format='JSON'
loose-audit_log_filter.read_buffer_size=1048576
```

启动 GreatSQL 实例后，安装和启用审计日志过滤器组件，并设置相应的规则，对所有应用账户都记录相应的操作：

```sql
-- 安装和启用审计日志过滤器组件
greatsql> USE mysql;
greatsql> SOURCE /usr/local/GreatSQL/share/audit_log_filter_linux_install.sql;

-- 创建过滤器，记录用户 greatsql@% 的所有操作
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

-- 分配过滤器给用户 greastql@%
greatsql> SELECT audit_log_filter_set_user('greatsql@%', 'greatsql_filter');

-- 刷新配置（非必须）
greatsql> SELECT audit_log_filter_flush();

-- 验证配置
greatsql> SELECT * FROM mysql.audit_log_filter;
greatsql> SELECT * FROM mysql.audit_log_user;
```

分别使用 *greatsql@%* 和 *yejr@%* 用户进行验证测试：

```bash
$ mysql -h127.0.0.1 -ugreatsql -pXX -P3306 db1 -e "SELECT * FROM t1 LIMIT 1"
$ mysql -h127.0.0.1 -ugreatsql -pXX -P3306 db1 -e "SELECT * FROM t1 LIMIT 1"
```

查看审计日志，应该能看到记录了 *greatsql@%* 用户的操作，而不会记录 *yejr@%* 用户的操作：

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

## 审核日志筛选限制

审计日志过滤器有以下限制：

- 仅记录SQL语句，NoSQL API（如Memcached API）所做的语句不会被记录。

- 仅记录顶级语句，存储过程或触发器中的语句不记录。不记录 `LOAD DATA` 等语句的文件内容。

- 如果与MGR一起使用，则要求将组件安装在用于在MGR各成员节点服务器上。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
