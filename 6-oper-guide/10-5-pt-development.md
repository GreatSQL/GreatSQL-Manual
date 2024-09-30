# Percona Toolkit 开发类

::: tip 小贴士
`$`为 Linux 命令提示符、`greatsql>`为 GreatSQL 数据库提示符。
:::

## 开发类

在 Percona Toolkit 中开发类共有以下工具：

- `pt-duplicate-key-checker`：列出并删除重复的索引和外键。
- `pt-online-schema-change`：在线修改表结构。
- `pt-show-grants`：规范化和打印权限。
- `pt-upgrade`：在多个服务器上执行查询，并比较不同。

## pt-duplicate-key-checker

### 概要

检查 MySQL/GreatSQL 表中的重复或冗余索引和外键。

**用法**

```bash
pt-duplicate-key-checker [OPTIONS] [DSN]
```

### 选项

该工具所有选项如下

| 参数                | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| --all-structs       | 比较具有不同结构（BTREE、HASH 等）的索引                     |
| --ask-pass          | 连接 MySQL/GreatSQL 提示输入密码                               |
| --charset           | 默认字符集                                                   |
| --[no]clustered     | 禁用聚集索引的重复键检查                                     |
| --config            | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --databases         | 仅检查此逗号分隔的数据库列表                                 |
| --defaults-file     | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --engines           | 仅检查其存储引擎位于此逗号分隔列表中的表                     |
| --help              | 显示帮助                                                     |
| --host              | 连接到主机                                                   |
| --ignore-databases  | 指定要忽略的数据库列表，多个数据库列表之间用逗号隔开         |
| --ignore-engines    | 指定要忽略的引擎列表，多个引擎列表之间用逗号隔开             |
| --ignore-order      | 忽略索引顺序，使得 KEY(a,b) 重复 KEY(b,a)                    |
| --ignore-tables     | 指定要忽略的表列表，多个表之间用逗号隔开                     |
| --key-types         | 要检查的索引类型                                             |
| --password          | 连接时使用的密码                                             |
| --pid               | 创建给定的 PID 文件                                          |
| --port              | 用于连接的端口号                                             |
| --set-vars          | 检查的表的会话变量                                           |
| --socket            | 用于连接的套接字文件                                         |
| --[no]sql           | 为每个重复键打印`DROP KEY`语句                               |
| --[no]summary       | 在输出末尾打印索引摘要                                       |
| --tables            | 仅检查的表列表，多个表之间用逗号隔开                         |
| --user              | 用于登录的用户                                               |
| --verbose           | 输出找到的所有键和/或外键，而不仅仅是冗余的                  |
| --version           | 显示版本                                                     |
| --[no]version-check | 版本检查                                                     |

### 最佳实践

创建一张表，包含两个重复索引：

```sql
-- 创建一张test_table表
CREATE TABLE `test_table` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 创建name字段的索引
greatsql> CREATE INDEX `idx_name` ON `test_table` (`name`);

-- 创建age字段的索引
greatsql> CREATE INDEX `idx_age` ON `test_table` (`age`);

-- 创建一个冗余的索引`idx_name_age`
greatsql> CREATE INDEX `idx_name_age` ON `test_table` (`name`, `age`);
```

使用`pt-duplicate-key-checker`工具：

```bash
pt-duplicate-key-checker -uroot --ask-pass --socket=/data/GreatSQL/MySQL.sock -d test_db
```
::: details 查看运行结果
```bash
$ pt-duplicate-key-checker -uroot --ask-pass --socket=/data/GreatSQL/MySQL.sock -d test_db
 
Enter password: # 这里输入密码 
# ########################################################################
# test_db.test_table                                                      
# ########################################################################

# idx_name is a left-prefix of idx_name_age
# Key definitions:
#   KEY `idx_name` (`name`),
#   KEY `idx_name_age` (`name`,`age`)
# Column types:
#         `name` varchar(255) default null
#         `age` int default null
# To remove this duplicate index, execute:
ALTER TABLE `test_db`.`test_table` DROP INDEX `idx_name`;

# ########################################################################
# Summary of indexes                                                      
# ########################################################################

# Size Duplicate Indexes   1023
# Total Duplicate Indexes  1
# Total Indexes            11
```
:::

由上述输出的检查信息中，可以看到表 `test_table` 中存在冗余索引，并且给出对应可以删除重复索引的SQL命令。

结尾的统计信息：

- Size Duplicate Indexes，检查的索引占用空间大小。
- Total Duplicate Indexes，检查的冗余索引数量。
- Total Indexes，检查的总的索引数量。

当然也可以直接看系统表 `schema_redundant_indexes`：

```sql
greatsql> SELECT * FROM sys.schema_redundant_indexes\G
*************************** 1. row ***************************
              table_schema: test_db
                table_name: test_table
      redundant_index_name: idx_name
   redundant_index_columns: name
redundant_index_non_unique: 1
       dominant_index_name: idx_name_age
    dominant_index_columns: name,age
 dominant_index_non_unique: 1
            subpart_exists: 0
            sql_drop_index: ALTER TABLE `test_db`.`test_table` DROP INDEX `idx_name`
```

## pt-online-schema-change

### 概要

在线修改表结构，特点是修改过程中不会造成读写阻塞。

**原理**

工作原理是创建要更改的表的空副本，根据需要对其进行修改，然后将原始表中的行复制到新表中。复制完成后，它会移走原始表并用新表替换。默认情况下，它还会删除原始表。

**用法**

```bash
pt-online-schema-change [OPTIONS] DSN
```

### 选项

**互斥关系**

| 选项A     | 选项B     | 关系 |
| --------- | --------- | ---- |
| --dry-run | --execute | 互斥 |

**该工具所有选项如下**

| 参数                            | 含义                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| --alter                         | 架构修改，无需 `ALTER TABLE` 关键字                            |
| --alter-foreign-keys-method     | 用于指定在修改表结构时如何处理外键约束（auto、rebuild_constraints、drop_swap、none） |
| --[no]analyze-before-swap       | 在与旧表交换之前，对新表执行 `ANALYZE TABLE`                    |
| --ask-pass                      | 连接时提示输入密码                                           |
| --channel                       | 使用复制通道连接到服务器时使用的通道名称                     |
| --charset                       | 默认字符集                                                   |
| --[no]check-alter               | 用于控制工具在执行 `ALTER TABLE` 语句时是否进行检查              |
| --[no]check-foreign-keys        | 检查自引用外键                                               |
| --check-interval                | 用于指定在检查从库延迟时休眠的时间间隔，默认1秒              |
| --[no]check-plan                | 检查查询执行计划的安全性                                     |
| --[no]check-replication-filters | 用于控制工具是否检查复制过滤规则                             |
| --check-slave-lag               | 用于在执行数据迁移操作之前检查主从服务器之间的延迟           |
| --chunk-index                   | 用于指定根据哪个索引对表进行分块                             |
| --chunk-index-columns           | 用于分块操作的索引列                                         |
| --chunk-size                    | 用于指定每次复制数据块的大小，以行数为单位                   |
| --chunk-size-limit              | 限制每次批量操作的数据量                                     |
| --chunk-time                    | 每个数据块处理的最大时间                                     |
| --config                        | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --critical-load                 | 设置触发工具直接结束操作的系统负载阈值                       |
| --database                      | 连接到数据库的库名                                           |
| --default-engine                | 用于指定新表的存储引擎                                       |
| --data-dir                      | 指定一个目录，用于存放工具在操作过程中创建的一些临时文件     |
| --remove-data-dir               | 用于在工具操作完成后自动删除在 `--data-dir` 中创建的临时目录和文件 |
| --defaults-file                 | 只从给定文件中读取 GreatSQL 选项                               |
| --[no]drop-new-table            | 如果复制原始表失败，则删除新表                               |
| --[no]drop-old-table            | 重命名后删除原始表                                           |
| --[no]drop-triggers             | 在旧表上删除触发器                                           |
| --dry-run                       | 创建并更改新表，但不创建触发器、复制数据或替换原始表         |
| --execute                       | 表明您已阅读文档并想要更改该表                               |
| --[no]check-unique-key-change   | 用于控制工具在执行表结构变更时是否检查唯一键的变化           |
| --force                         | 用于在工具运行时遇到一些特定的问题或障碍时强制执行表结构变更 |
| --help                          | 显示帮助                                                     |
| --host                          | 连接到主机                                                   |
| --max-flow-ctl                  | 与` --max-lag `相似，但适用于 PXC 集群                       |
| --max-lag                       | 暂停数据复制，直到所有副本的滞后小于该值，默认1秒            |
| --max-load                      | 在每个块之后检查 `SHOW GLOBAL STATUS`，如果任何状态变量高于其阈值，则暂停 |
| --preserve-triggers             | 指定时保留旧触发器                                           |
| --new-table-name                | 交换之前的新表名称                                           |
| --null-to-not-null              | 允许将允许 NULL 值的列修改为不允许 NULL 值的列               |
| --only-same-schema-fks          | 仅检查与原始表具有相同架构的表上的外键                       |
| --password                      | 连接时使用的密码                                             |
| --pause-file                    | 当此参数指定的文件存在时，执行将暂停                         |
| --pid                           | 创建给定的 PID 文件                                          |
| --plugin                        | 定义 `pt_online_schema_change_plugin` 类的 Perl 模块文件     |
| --port                          | 用于连接的端口号                                             |
| --print                         | 将 SQL 语句打印到 STDOUT                                     |
| --progress                      | 复制行时将进度报告打印到 STDERR                              |
| --quiet                         | 不要将消息打印到 STDOUT，禁用 `--progress`                   |
| --recurse                       | 用于指定工具是否应该递归地应用到所有从库上                   |
| --recursion-method              | 用于指定工具如何查找和连接从库（Slave）的方法                |
| --skip-check-slave-lag          | 检查从机滞后时要跳过的 DSN                                   |
| --slave-user                    | 设置用于连接从机的用户                                       |
| --slave-password                | 设置用于连接从机的密码                                       |
| --set-vars                      | 在这个以逗号分隔的 `variable=value` 对列表中设置变量         |
| --sleep                         | 复制每个块后休眠多长时间（以秒为单位）                       |
| --socket                        | 用于链接的套接字文件                                         |
| --statistics                    | 打印有关内部计数器的统计信息                                 |
| --[no]swap-tables               | 交换原始表和新的、更改后的表                                 |
| --tries                         | 尝试关键操作多少次                                           |
| --user                          | 登录用户                                                     |
| --version                       | 显示版本                                                     |
| --[no]version-check             | 版本检查                                                     |

### 最佳实践

先创建一张表，并插入1万条数据：

```sql
greatsql> CREATE TABLE test_db.ptosc (id INT PRIMARY KEY AUTO_INCREMENT,k BIGINT NOT NULL,c VARCHAR(255) NOT NULL,pad VARCHAR(255) NOT NULL);

greatsql> SELECT count(*) FROM ptosc;
+----------+
| count(*) |
+----------+
|    10000 |
+----------+
1 row in set (0.00 sec)
```

#### 添加一列

使用 `pt-online-schema-change` 工具添加 a 列，类型为 INT：

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "ADD COLUMN a INT" D=test_db,t=ptosc --print --execute
```

::: tip 小贴士
`--print` 是打印工具执行过程。
`--execute` 确认开始。
:::

此时会输出工具的执行过程，来一段段解析：

1. 在执行前的一些状态检查及默认的操作设置：

```bash
# 下一行表示工具没有找到任何从服务器（slaves）
No slaves found.  See --recursion-method if host myarch has slaves.
# 下一行表示工具没有检查从服务器的延迟，因为它没有找到任何从服务器，并且也没有指定 --check-slave-lag 选项来强制检查从服务器的延迟。
Not checking slave lag because no slaves were found and --check-slave-lag was not specified.
# 以下部分列出了 pt-online-schema-change 工具在更改过程中可能会执行的操作，以及默认的重试次数和等待时间：
Operation, tries, wait:
# 分析原表的结构，以准备进行更改。如果失败，将重试 10 次，每次失败后等待 1 秒。
  analyze_table, 10, 1
# 从原表复制行到新表。如果复制失败，将重试 10 次，每次失败后等待 0.25 秒。
  copy_rows, 10, 0.25
# 在新表上创建触发器，以便捕获对原表的任何更改，并将这些更改应用到新表。如果失败，将重试 10 次，每次失败后等待 1 秒。
  create_triggers, 10, 1
# 在切换完成后删除这些触发器。如果失败，将重试 10 次，每次失败后等待 1 秒。
  drop_triggers, 10, 1
# 切换原表和新表，使新表成为活动表。如果失败，将重试 10 次，每次失败后等待 1 秒。
  swap_tables, 10, 1
# 更新与新表相关的任何外键约束。如果失败，将重试 10 次，每次失败后等待 1 秒。
  update_foreign_keys, 10, 1
```

2. 创建一张名为`_ptosc_new`的新表：

```bash
Creating new table...
CREATE TABLE `test_db`.`_ptosc_new` (
  `id` int NOT NULL AUTO_INCREMENT,
  `k` bigint NOT NULL,
  `c` varchar(255) NOT NULL,
  `pad` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
Created new table test_db._ptosc_new OK.
```

3. 对新表`_ptosc_new`增加一列 a：

```bash
Altering new table...
ALTER TABLE `test_db`.`_ptosc_new` ADD COLUMN a INT
Altered `test_db`.`_ptosc_new` OK.
```

4. 创建三个触发器 `DELETE`、`UPDATE` 、`INSERT` ：

```bash
2024-04-10T14:53:52 Creating triggers...
-----------------------------------------------------------
Event : DELETE 
Name  : pt_osc_test_db_ptosc_del 
SQL   : CREATE TRIGGER `pt_osc_test_db_ptosc_del` AFTER DELETE ON `test_db`.`ptosc` FOR EACH ROW BEGIN DECLARE CONTINUE HANDLER FOR 1146 begin end; DELETE IGNORE FROM `test_db`.`_ptosc_new` WHERE `test_db`.`_ptosc_new`.`id` <=> OLD.`id`; END  
Suffix: del 
Time  : AFTER 
-----------------------------------------------------------
-----------------------------------------------------------
Event : UPDATE 
Name  : pt_osc_test_db_ptosc_upd 
SQL   : CREATE TRIGGER `pt_osc_test_db_ptosc_upd` AFTER UPDATE ON `test_db`.`ptosc` FOR EACH ROW BEGIN DECLARE CONTINUE HANDLER FOR 1146 begin end; DELETE IGNORE FROM `test_db`.`_ptosc_new` WHERE !(OLD.`id` <=> NEW.`id`) AND `test_db`.`_ptosc_new`.`id` <=> OLD.`id`; REPLACE INTO `test_db`.`_ptosc_new` (`id`, `k`, `c`, `pad`) VALUES (NEW.`id`, NEW.`k`, NEW.`c`, NEW.`pad`); END  
Suffix: upd 
Time  : AFTER 
-----------------------------------------------------------
-----------------------------------------------------------
Event : INSERT 
Name  : pt_osc_test_db_ptosc_ins 
SQL   : CREATE TRIGGER `pt_osc_test_db_ptosc_ins` AFTER INSERT ON `test_db`.`ptosc` FOR EACH ROW BEGIN DECLARE CONTINUE HANDLER FOR 1146 begin end; REPLACE INTO `test_db`.`_ptosc_new` (`id`, `k`, `c`, `pad`) VALUES (NEW.`id`, NEW.`k`, NEW.`c`, NEW.`pad`);END  
Suffix: ins 
Time  : AFTER 
-----------------------------------------------------------
2024-04-10T14:53:52 Created triggers OK.
```

5. 拷贝旧表数据到新表：

```bash
2024-04-10T14:53:52 Copying approximately 9861 rows...
INSERT LOW_PRIORITY IGNORE INTO `test_db`.`_ptosc_new` (`id`, `k`, `c`, `pad`) SELECT `id`, `k`, `c`, `pad` FROM `test_db`.`ptosc` FORCE INDEX(`PRIMARY`) WHERE ((`id` >= ?)) AND ((`id` <= ?)) LOCK IN SHARE MODE /*pt-online-schema-change 214419 copy nibble*/
SELECT /*!40001 SQL_NO_CACHE */ `id` FROM `test_db`.`ptosc` FORCE INDEX(`PRIMARY`) WHERE ((`id` >= ?)) ORDER BY `id` LIMIT ?, 2 /*next chunk boundary*/
2024-04-10T14:53:52 Copied rows OK.
```

6. 分析新表，并交换新旧表，最后删除旧表：

```bash
2024-04-10T14:53:52 Analyzing new table...
2024-04-10T14:53:52 Swapping tables...
RENAME TABLE `test_db`.`ptosc` TO `test_db`.`_ptosc_old`, `test_db`.`_ptosc_new` TO `test_db`.`ptosc`
2024-04-10T14:53:52 Swapped original and new tables OK.
2024-04-10T14:53:52 Dropping old table...
DROP TABLE IF EXISTS `test_db`.`_ptosc_old`
2024-04-10T14:53:52 Dropped old table `test_db`.`_ptosc_old` OK.
```

7. 删除触发器，完成所有操作：

```bash
2024-04-10T14:53:52 Dropping triggers...
DROP TRIGGER IF EXISTS `test_db`.`pt_osc_test_db_ptosc_del`
DROP TRIGGER IF EXISTS `test_db`.`pt_osc_test_db_ptosc_upd`
DROP TRIGGER IF EXISTS `test_db`.`pt_osc_test_db_ptosc_ins`
2024-04-10T14:53:52 Dropped triggers OK.
Successfully altered `test_db`.`ptosc`.
```

#### 修改字符集

将表 ptosc 的 c 字段的字符集修改为 utf8mb4：

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "modify column c varchar(255) character set utf8mb4" D=test_db,t=ptosc --alter-foreign-keys-method=auto --execute
```

::: tip 小贴士
这里设置了一个`--alter-foreign-keys-method`用于设置外键约束的处理方法，设置为`auto`就是自动选择处理方法。
:::

#### 删除一列

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "drop column c" D=test_db,t=ptosc --alter-foreign-keys-method=auto --execute
```

#### 删除外键

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "drop foreign key _dept_emp_ibfk_1" D=test_db,t=ptosc --alter-foreign-keys-method=auto --execute
```

### 注意事项

在使用该工具时，需要注意以下几点：

1. 工具在运行过程中，避免对原表进行更改，可能会出现数据不一致。
2. 使用该工具前要充分测试。
3. 最好在业务低峰时候操作。

## pt-show-grants

### 概要

显示当前数据库中所有用户的授权情况，并以 GRANT 语句现实，方便复制到其他数据库上执行。

**用法**

```bash
pt-show-grants [OPTIONS] [DSN]
```

### 选项

| 参数                       | 含义                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | 连接 MySQL/GreatSQL 提示输入密码                               |
| --charset                  | 默认字符集                                                   |
| --config                   | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --databases                | 仅检查此逗号分隔的数据库列表                                 |
| --defaults-file            | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --drop                     | 在输出中的每个用户之前添加 `DROP USER`                         |
| --flush                    | 输出后添加 `FLUSH PRIVILEGES`                                  |
| --[no]header               | 打印转储标题，默认有标题                                     |
| --help                     | 显示帮助                                                     |
| --host                     | 连接到主机                                                   |
| --ignore                   | 要忽略的用户                                                 |
| --only                     | 只显示的用户                                                 |
| --password                 | 连接时使用的密码                                             |
| --pid                      | 创建给定的 PID 文件                                          |
| --port                     | 用于连接的端口号                                             |
| --revoke                   | 为每个 `GRANT` 语句添加 `REVOKE` 语句                            |
| --separate                 | 分别列出每个 `GRANT` 或 `REVOKE`                                 |
| --set-vars                 | 在这个以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --[no]include-unused-roles | 转储 MySQL 8+ 角色时，包括未使用的角色                       |
| --socket                   | 用于连接的套接字文件                                         |
| --[no]timestamp            | 将时间戳添加到转储标头                                       |
| --user                     | 用于登录的用户                                               |
| --version                  | 显示版本                                                     |

### 最佳实践

只显示 GreatSQL 用户的授权信息：

```bash
pt-show-grants --host=localhost --user=root --ask-pass --only=GreatSQL
```
::: details 查看运行结果

```bash
$ pt-show-grants --host=localhost --user=root --ask-pass --only=GreatSQL

-- Grants dumped by pt-show-grants
-- Dumped from server Localhost via UNIX socket, MySQL 8.0.32-25 at 2024-04-16 13:43:25
-- Grants for 'GreatSQL'@'%'
CREATE USER IF NOT EXISTS `GreatSQL`@`%`;
ALTER USER `GreatSQL`@`%` IDENTIFIED WITH 'caching_sha2_password' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK PASSWORD HISTORY DEFAULT PASSWORD REUSE INTERVAL DEFAULT PASSWORD REQUIRE CURRENT DEFAULT;
GRANT ACCESS_PROCFS,APPLICATION_PASSWORD_ADMIN,AUDIT_ABORT_EXEMPT,AUDIT_ADMIN,AUTHENTICATION_POLICY_ADMIN,BACKUP_ADMIN,BINLOG_ADMIN,BINLOG_ENCRYPTION_ADMIN,CLONE_ADMIN,CONNECTION_ADMIN,ENCRYPTION_KEY_ADMIN,FIREWALL_EXEMPT,FLUSH_OPTIMIZER_COSTS,FLUSH_STATUS,FLUSH_TABLES,FLUSH_USER_RESOURCES,GROUP_REPLICATION_ADMIN,GROUP_REPLICATION_STREAM,INNODB_REDO_LOG_ARCHIVE,INNODB_REDO_LOG_ENABLE,PASSWORDLESS_USER_ADMIN,PERSIST_RO_VARIABLES_ADMIN,REPLICATION_APPLIER,REPLICATION_SLAVE_ADMIN,RESOURCE_GROUP_ADMIN,RESOURCE_GROUP_USER,ROLE_ADMIN,SENSITIVE_VARIABLES_OBSERVER,SERVICE_CONNECTION_ADMIN,SESSION_VARIABLES_ADMIN,SET_USER_ID,SHOW_ROUTINE,SYSTEM_USER,SYSTEM_VARIABLES_ADMIN,TABLE_ENCRYPTION_ADMIN,XA_RECOVER_ADMIN ON *.* TO `GreatSQL`@`%` WITH GRANT OPTION;
GRANT ALTER, ALTER ROUTINE, CREATE, CREATE ROLE, CREATE ROUTINE, CREATE TABLESPACE, CREATE TEMPORARY TABLES, CREATE USER, CREATE VIEW, DELETE, DROP, DROP ROLE, EVENT, EXECUTE, FILE, INDEX, INSERT, LOCK TABLES, PROCESS, REFERENCES, RELOAD, REPLICATION CLIENT, REPLICATION SLAVE, SELECT, SHOW DATABASES, SHOW VIEW, SHUTDOWN, SUPER, TRIGGER, UPDATE ON *.* TO `GreatSQL`@`%` WITH GRANT OPTION;
```
:::

该工具会展示 GreatSQL 用户的所有权限，用户可以直接复制输出的结果，方便粘贴到其他数据库上执行。

## pt-upgrade

### 概要

用于验证不同数据库上的 SQL 语句查询结果是否相同，有助于确定升级（或降级）到新版本的 MySQL/GreatSQL 是否安全。

**用法**

```bash
pt-upgrade [OPTIONS] LOGS|RESULTS DSN [DSN]
```

---

查询差异的判断主要来源以下几点：

1. Row count，返回的行数是否相同。
2. Row data，返回的行数据是否相同。
3. Warnings，返回的警告是否相同。
4. Query time，查询的相差时间。
5. Query errors，查询错误，在一个数据库出错，则会报告为“查询错误”。
6. SQL errors，SQL错误，在两个数据库都出错，则会报告为“SQL 错误”。

### 选项

| 参数                       | 含义                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | 连接 MySQL/GreatSQL 提示输入密码                               |
| --charset                  | 默认字符集                                                   |
| --config                   | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --[no]continue-on-error    | 即使出现错误也继续解析                                       |
| --[no]create-upgrade-table | 创建 `--upgrade-table` 数据库和表                            |
| --daemonize                | 后台运行                                                     |
| --databases                | 数据库列表                                                   |
| --defaults-file            | 只从给定文件中读取 MySQL/GreatSQL 选项                       |
| --[no]disable-query-cache  | `SET SESSION query_cache_type = OFF` 禁用查询缓存            |
| --dry-run                  | “试运行”模式，会显示 `pt-upgrade` 将会执行的操作，但实际上不会执行任何更改 |
| --filter                   | 指定一个或多个过滤条件                                       |
| --help                     | 显示帮助                                                     |
| --host                     | 连接到主机                                                   |
| --ignore-warnings          | 比较警告时忽略这些 MySQL/GreatSQL 警告代码                   |
| --log                      | 当后台运行时，将 STDOUT 和 STDERR 打印到此文件               |
| --max-class-size           | 限制每个数据类型类别中用于比较和生成差异样本的最大行数       |
| --max-examples             | 限制 `pt-upgrade` 工具为每个差异类型生成的差异样本的最大数量 |
| --password                 | 连接时使用的密码                                             |
| --pid                      | 创建给定的 PID 文件                                          |
| --port                     | 用于连接的端口号                                             |
| --progress                 | 将进度报告打印到 STDERR                                      |
| --[no]read-only            | 默认情况下，只会执行 `SELECT` 和 `SET` 操作。如要执行其它操作，必须指定该参数 |
| --report                   | 打印“报告”的这些部分                                         |
| --run-time                 | 运行时间                                                     |
| --save-results             | 将结果保存到此目录                                           |
| --set-vars                 | 以逗号分隔的 `variable=value` 对列表中设置 MySQL/GreatSQL 变量 |
| --socket                   | 用于连接的套接字文件                                         |
| --type                     | 日志文件的类型                                               |
| --upgrade-table            | 使用此表清除警告，默认是 `percona_schema.pt_upgrade`          |
| --user                     | 用于登录的用户                                               |
| --version                  | 显示版本                                                     |
| --[no]version-check        | 版本检查                                                     |

### 最佳实践

只需提供两个实例的连接信息和文件名，直接比较一个文件中的 SQL 在两个实例中的执行效果。

```bash
pt-upgrade h=host1 h=host2 slow.log
```

使用 `--type` 参数轻松指定文件类型，支持慢日志、通用日志、二进制日志（经 mysqlbinlog 解析）、原始 SQL 语句和 tcpdump 。若未指定，则默认为慢日志。

接下来做个简单的示范，创建一个 `pt_upgrade_test.sql` 文件包含了若干条测试语句：

```ini
SELECT NOW();
SELECT DATEDIFF('2023-10-23', '2023-01-01') AS days_diff;
SELECT 5 + 3 * 2 AS result;
SELECT DATABASE();
SHOW GRANTS FOR CURRENT_USER();
```

运行 `pt-upgrade` 工具进行比较：

```bash
pt-upgrade h=localhost,P=3306,u=root,--ask-pass h=localhost,P=3306,u=root,--ask-pass --type rawlog /tmp/pt_upgrade_test.sql --no-read-only
```
::: details 查看运行结果
```bash
$ pt-upgrade h=localhost,P=3306,u=root,--ask-pass h=localhost,P=3306,u=root,--ask-pass --type rawlog /tmp/pt_upgrade_test.sql --no-read-only

#-----------------------------------------------------------------------
# Logs
#-----------------------------------------------------------------------
File: /tmp/pt_upgrade_test.sql
Size: 151
#-----------------------------------------------------------------------
# Hosts
#-----------------------------------------------------------------------
host1:
  DSN:       h=localhost,P=3306
  hostname:  myarch
  MySQL:     GreatSQL, Release 25, Revision 79f57097e3f 8.0.32
  
host2:
  DSN:       h=localhost,P=3306
  hostname:  myarch
  MySQL:     GreatSQL, Release 25, Revision 79f57097e3f 8.0.32
#-----------------------------------------------------------------------
# Stats
#-----------------------------------------------------------------------
failed_queries        0
not_select            0
queries_filtered      0
queries_no_diffs      5
queries_read          5
queries_with_diffs    0
queries_with_errors   0
```
:::

- failed_queries：查询因为某种原因而失败的 SQL 个数。
- not_select：非 SELECT 类型的查询被处理的 SQL 个数。
- queries_filtered：查询因为某种过滤条件而被排除的 SQL 个数。
- queries_no_diffs：执行计划没有差异的 SQL 个数。
- queries_read：总共读取了几个查询进行比较。
- queries_with_diffs：在两个数据库上的执行计划存在差异的 SQL 个数。
- queries_with_errors：在执行过程中遇到错误的 SQL 个数。

::: tip 小贴士
如果 `queries_with_diffs` 的值不为 0，就要着重检查下差异了。
:::


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)