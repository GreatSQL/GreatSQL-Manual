# Percona Toolkit Development

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## Development

In Percona Toolkit, the development category includes the following tools:

- `pt-duplicate-key-checker`: List and delete duplicate indexes and foreign keys.
- `pt-online-schema-change`: Modify table structure online.
- `pt-show-grants`: Normalize and print grants.
- `pt-upgrade`: Execute queries on multiple servers and compare differences.

## pt-duplicate-key-checker

### Overview

Check duplicate or redundant indexes and foreign keys in MySQL/GreatSQL tables.

**Usage**

```bash
pt-duplicate-key-checker [OPTIONS] [DSN]
```

### Options

All options of this tool are as follows

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --all-structs       | Compare indexes with different structures (BTREE, HASH, etc.)                     |
| --ask-pass          | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset           | Default character set                                                   |
| --[no]clustered     | Disable duplicate key checking for clustered indexes                                     |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --databases         | Only check this comma-separated database list                                 |
| --defaults-file     | Read MySQL/GreatSQL options only from the given file                       |
| --engines           | Only check tables whose storage engine is in this comma-separated list                     |
| --help              | Display help                                                     |
| --host              | Connect to the host                                                   |
| --ignore-databases  | Specify the database list to ignore, multiple database lists separated by commas         |
| --ignore-engines    | Specify the engine list to ignore, multiple engine lists separated by commas             |
| --ignore-order      | Ignore index order, making KEY(a,b) duplicate KEY(b,a)                    |
| --ignore-tables     | Specify the table list to ignore, multiple tables separated by commas                     |
| --key-types         | The index types to check                                             |
| --password          | The password used when connecting                                             |
| --pid               | Create the given PID file                                          |
| --port              | The port number used for the connection                                             |
| --set-vars          | Session variables for the checked tables                                           |
| --socket            | The socket file used for the connection                                         |
| --[no]sql           | Print `DROP KEY` statements for each duplicate key                               |
| --[no]summary       | Print an index summary at the end of the output                                       |
| --tables            | The table list to check only, multiple tables separated by commas                         |
| --user              | The user used for login                                               |
| --verbose           | Output all found keys and/or foreign keys, not just redundant ones                  |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

Create a table with two duplicate indexes:

```sql
-- Create a test_table table
CREATE TABLE `test_table` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Create an index on the name field
greatsql> CREATE INDEX `idx_name` ON `test_table` (`name`);

-- Create an index on the age field
greatsql> CREATE INDEX `idx_age` ON `test_table` (`age`);

-- Create a redundant index `idx_name_age`
greatsql> CREATE INDEX `idx_name_age` ON `test_table` (`name`, `age`);
```

Use the `pt-duplicate-key-checker` tool:

```bash
pt-duplicate-key-checker -uroot --ask-pass --socket=/data/GreatSQL/MySQL.sock -d test_db
```
::: details View the result
```bash
$ pt-duplicate-key-checker -uroot --ask-pass --socket=/data/GreatSQL/MySQL.sock -d test_db
 
Enter password: # Enter the password here 
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

From the check information output above, it can be seen that there is a redundant index in the table `test_table`, and the corresponding SQL command to delete the duplicate index is also given.

The statistics at the end:

- Size Duplicate Indexes, the space occupied by the checked indexes.
- Total Duplicate Indexes, the number of redundant indexes checked.
- Total Indexes, the total number of indexes checked.

Of course, you can also directly view the system table `schema_redundant_indexes`:

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

### Overview

Modify table structure online. The characteristic is that read/write blocking does not occur during the modification process.

**Principle**

The working principle is to create an empty copy of the table to be changed, modify it as needed, and then copy the rows from the original table to the new table. After the copy is completed, it moves away the original table and replaces it with the new table. By default, it also deletes the original table.

**Usage**

```bash
pt-online-schema-change [OPTIONS] DSN
```

### Options

**Mutual exclusion relationship**

| Option A     | Option B     | Relationship |
| --------- | --------- | ---- |
| --dry-run | --execute | Mutually exclusive |

**All options of this tool are as follows**

| Parameter                            | Meaning                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| --alter                         | Schema modification, no `ALTER TABLE` keyword needed                            |
| --alter-foreign-keys-method     | Used to specify how to handle foreign key constraints when modifying the table structure (auto, rebuild_constraints, drop_swap, none) |
| --[no]analyze-before-swap       | Execute `ANALYZE TABLE` on the new table before swapping with the old table                    |
| --ask-pass                      | Prompt for a password when connecting                                           |
| --channel                       | The channel name used when connecting to the server with a replication channel                     |
| --charset                       | Default character set                                                   |
| --[no]check-alter               | Used to control whether the tool checks when executing the `ALTER TABLE` statement              |
| --[no]check-foreign-keys        | Check self-referencing foreign keys                                               |
| --check-interval                | Used to specify the sleep interval when checking replica lag, default 1 second              |
| --[no]check-plan                | Check the safety of the query execution plan                                     |
| --[no]check-replication-filters | Used to control whether the tool checks replication filter rules                             |
| --check-slave-lag               | Used to check the lag between the primary and secondary servers before executing data migration operations           |
| --chunk-index                   | Used to specify which index to use for chunking the table                             |
| --chunk-index-columns           | The index columns used for chunking operations                                         |
| --chunk-size                    | Used to specify the size of each data block copied each time, in rows                   |
| --chunk-size-limit              | Limit the amount of data for each batch operation                                     |
| --chunk-time                    | The maximum time to process each data block                                     |
| --config                        | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --critical-load                 | Set the system load threshold that triggers the tool to directly end the operation                       |
| --database                      | The database name to connect to                                           |
| --default-engine                | Used to specify the storage engine of the new table                                       |
| --data-dir                      | Specify a directory for storing some temporary files created by the tool during the operation     |
| --remove-data-dir               | Used to automatically delete the temporary directory and files created in `--data-dir` after the tool operation is completed |
| --defaults-file                 | Read GreatSQL options only from the given file                               |
| --[no]drop-new-table            | Drop the new table if copying the original table fails                               |
| --[no]drop-old-table            | Drop the original table after renaming                                           |
| --[no]drop-triggers             | Drop triggers on the old table                                           |
| --dry-run                       | Create and alter the new table, but do not create triggers, copy data, or replace the original table         |
| --execute                       | Indicate that you have read the documentation and want to alter the table                               |
| --[no]check-unique-key-change   | Used to control whether the tool checks unique key changes when executing table structure changes           |
| --force                         | Used to force table structure changes when the tool encounters some specific problems or obstacles during operation |
| --help                          | Display help                                                     |
| --host                          | Connect to the host                                                   |
| --max-flow-ctl                  | Similar to `--max-lag`, but applicable to PXC clusters                       |
| --max-lag                       | Pause data copying until the lag of all replicas is less than this value, default 1 second            |
| --max-load                      | Check `SHOW GLOBAL STATUS` after each block. If any status variable is higher than its threshold, pause |
| --preserve-triggers             | Preserve old triggers when specified                                           |
| --new-table-name                | The new table name before swapping                                           |
| --null-to-not-null              | Allow modifying columns that allow NULL values to columns that do not allow NULL values               |
| --only-same-schema-fks          | Only check foreign keys on tables with the same schema as the original table                       |
| --password                      | The password used when connecting                                             |
| --pause-file                    | When the file specified by this parameter exists, execution pauses                         |
| --pid                           | Create the given PID file                                          |
| --plugin                        | The Perl module file defining the `pt_online_schema_change_plugin` class     |
| --port                          | The port number used for the connection                                             |
| --print                         | Print SQL statements to STDOUT                                     |
| --progress                      | Print progress reports to STDERR when copying rows                              |
| --quiet                         | Do not print messages to STDOUT, disable `--progress`                   |
| --recurse                       | Used to specify whether the tool should recursively apply to all replicas                   |
| --recursion-method              | Used to specify how the tool finds and connects to replicas (Slaves)                |
| --skip-check-slave-lag          | DSNs to skip when checking replica lag                                   |
| --slave-user                    | Set the user used to connect to replicas                                       |
| --slave-password                | Set the password used to connect to replicas                                       |
| --set-vars                      | Set variables in this comma-separated `variable=value` pair list         |
| --sleep                         | How long to sleep after copying each block (in seconds)                       |
| --socket                        | The socket file used for the connection                                         |
| --statistics                    | Print statistics about internal counters                                 |
| --[no]swap-tables               | Swap the original table and the new, altered table                                 |
| --tries                         | How many times to try critical operations                                           |
| --user                          | The login user                                                     |
| --version                       | Display the version                                                     |
| --[no]version-check             | Version check                                                     |

### Best Practices

First create a table and insert 10,000 rows of data:

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

#### Adding a Column

Use the `pt-online-schema-change` tool to add column a of type INT:

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "ADD COLUMN a INT" D=test_db,t=ptosc --print --execute
```

::: tip Tip
`--print` prints the tool execution process.
`--execute` confirms to start.
:::

At this time, the execution process of the tool is output. Let's analyze it section by section:

1. Some status checks and default operation settings before execution:

```bash
# The next line indicates that the tool did not find any secondary servers (slaves)
No slaves found.  See --recursion-method if host myarch has slaves.
# The next line indicates that the tool did not check replica lag because it did not find any replicas and did not specify the --check-slave-lag option to force checking replica lag.
Not checking slave lag because no slaves were found and --check-slave-lag was not specified.
# The following part lists the operations that the pt-online-schema-change tool may perform during the change process, as well as the default retry counts and wait times:
Operation, tries, wait:
# Analyze the structure of the original table to prepare for the change. If it fails, retry 10 times, waiting 1 second after each failure.
  analyze_table, 10, 1
# Copy rows from the original table to the new table. If copying fails, retry 10 times, waiting 0.25 seconds after each failure.
  copy_rows, 10, 0.25
# Create triggers on the new table to capture any changes to the original table and apply these changes to the new table. If it fails, retry 10 times, waiting 1 second after each failure.
  create_triggers, 10, 1
# Drop these triggers after the swap is completed. If it fails, retry 10 times, waiting 1 second after each failure.
  drop_triggers, 10, 1
# Swap the original table and the new table so that the new table becomes the active table. If it fails, retry 10 times, waiting 1 second after each failure.
  swap_tables, 10, 1
# Update any foreign key constraints related to the new table. If it fails, retry 10 times, waiting 1 second after each failure.
  update_foreign_keys, 10, 1
```

2. Create a new table named `_ptosc_new`:

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

3. Add column a to the new table `_ptosc_new`:

```bash
Altering new table...
ALTER TABLE `test_db`.`_ptosc_new` ADD COLUMN a INT
Altered `test_db`.`_ptosc_new` OK.
```

4. Create three triggers `DELETE`, `UPDATE`, `INSERT`:

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

5. Copy the old table data to the new table:

```bash
2024-04-10T14:53:52 Copying approximately 9861 rows...
INSERT LOW_PRIORITY IGNORE INTO `test_db`.`_ptosc_new` (`id`, `k`, `c`, `pad`) SELECT `id`, `k`, `c`, `pad` FROM `test_db`.`ptosc` FORCE INDEX(`PRIMARY`) WHERE ((`id` >= ?)) AND ((`id` <= ?)) LOCK IN SHARE MODE /*pt-online-schema-change 214419 copy nibble*/
SELECT /*!40001 SQL_NO_CACHE */ `id` FROM `test_db`.`ptosc` FORCE INDEX(`PRIMARY`) WHERE ((`id` >= ?)) ORDER BY `id` LIMIT ?, 2 /*next chunk boundary*/
2024-04-10T14:53:52 Copied rows OK.
```

6. Analyze the new table, swap the old and new tables, and finally drop the old table:

```bash
2024-04-10T14:53:52 Analyzing new table...
2024-04-10T14:53:52 Swapping tables...
RENAME TABLE `test_db`.`ptosc` TO `test_db`.`_ptosc_old`, `test_db`.`_ptosc_new` TO `test_db`.`ptosc`
2024-04-10T14:53:52 Swapped original and new tables OK.
2024-04-10T14:53:52 Dropping old table...
DROP TABLE IF EXISTS `test_db`.`_ptosc_old`
2024-04-10T14:53:52 Dropped old table `test_db`.`_ptosc_old` OK.
```

7. Drop the triggers and complete all operations:

```bash
2024-04-10T14:53:52 Dropping triggers...
DROP TRIGGER IF EXISTS `test_db`.`pt_osc_test_db_ptosc_del`
DROP TRIGGER IF EXISTS `test_db`.`pt_osc_test_db_ptosc_upd`
DROP TRIGGER IF EXISTS `test_db`.`pt_osc_test_db_ptosc_ins`
2024-04-10T14:53:52 Dropped triggers OK.
Successfully altered `test_db`.`ptosc`.
```

#### Modifying the Character Set

Modify the character set of the c field of the ptosc table to utf8mb4:

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "modify column c varchar(255) character set utf8mb4" D=test_db,t=ptosc --alter-foreign-keys-method=auto --execute
```

::: tip Tip
Here `--alter-foreign-keys-method` is set to specify the handling method for foreign key constraints. Setting it to `auto` means automatically selecting the handling method.
:::

#### Dropping a Column

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "drop column c" D=test_db,t=ptosc --alter-foreign-keys-method=auto --execute
```

#### Dropping a Foreign Key

```bash
pt-online-schema-change --host=localhost --user=root --ask-pass --alter "drop foreign key _dept_emp_ibfk_1" D=test_db,t=ptosc --alter-foreign-keys-method=auto --execute
```

### Notes

When using this tool, pay attention to the following points:

1. During the tool operation, avoid making changes to the original table, as data inconsistency may occur.
2. Fully test before using this tool.
3. It is best to operate during business off-peak periods.

## pt-show-grants

### Overview

Display the grants of all users in the current database, and display them as `GRANT` statements, which is convenient for copying and executing on other databases.

**Usage**

```bash
pt-show-grants [OPTIONS] [DSN]
```

### Options

| Parameter                       | Meaning                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset                  | Default character set                                                   |
| --config                   | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --databases                | Only check this comma-separated database list                                 |
| --defaults-file            | Read MySQL/GreatSQL options only from the given file                       |
| --drop                     | Add `DROP USER` before each user in the output                         |
| --flush                    | Add `FLUSH PRIVILEGES` after the output                                  |
| --[no]header               | Print the dump header, header by default                                     |
| --help                     | Display help                                                     |
| --host                     | Connect to the host                                                   |
| --ignore                   | Users to ignore                                                 |
| --only                     | Users to display only                                                 |
| --password                 | The password used when connecting                                             |
| --pid                      | Create the given PID file                                          |
| --port                     | The port number used for the connection                                             |
| --revoke                   | Add a `REVOKE` statement for each `GRANT` statement                            |
| --separate                 | List each `GRANT` or `REVOKE` separately                                 |
| --set-vars                 | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --[no]include-unused-roles | When dumping MySQL 8+ roles, include unused roles                       |
| --socket                   | The socket file used for the connection                                         |
| --[no]timestamp            | Add a timestamp to the dump header                                       |
| --user                     | The user used for login                                               |
| --version                  | Display the version                                                     |

### Best Practices

Display only the grant information of the GreatSQL user:

```bash
pt-show-grants --host=localhost --user=root --ask-pass --only=GreatSQL
```
::: details View the result

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

This tool displays all privileges of the GreatSQL user. Users can directly copy the output results, which is convenient for pasting and executing on other databases.

## pt-upgrade

### Overview

Used to verify whether the query results of SQL statements on different databases are the same, which helps determine whether upgrading (or downgrading) to a new version of MySQL/GreatSQL is safe.

**Usage**

```bash
pt-upgrade [OPTIONS] LOGS|RESULTS DSN [DSN]
```

---

The judgment of query differences mainly comes from the following points:

1. Row count, whether the number of returned rows is the same.
2. Row data, whether the returned row data is the same.
3. Warnings, whether the returned warnings are the same.
4. Query time, the difference in query time.
5. Query errors, query errors. If an error occurs on one database, it is reported as a "query error".
6. SQL errors, SQL errors. If errors occur on both databases, it is reported as a "SQL error".

### Options

| Parameter                       | Meaning                                                         |
| -------------------------- | ------------------------------------------------------------ |
| --ask-pass                 | Prompt for a password when connecting to MySQL/GreatSQL                               |
| --charset                  | Default character set                                                   |
| --config                   | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --[no]continue-on-error    | Continue parsing even if errors occur                                       |
| --[no]create-upgrade-table | Create the `--upgrade-table` database and table                            |
| --daemonize                | Run in the background                                                     |
| --databases                | Database list                                                   |
| --defaults-file            | Read MySQL/GreatSQL options only from the given file                       |
| --[no]disable-query-cache  | `SET SESSION query_cache_type = OFF` to disable the query cache            |
| --dry-run                  | "Dry run" mode, which shows what `pt-upgrade` will do, but does not actually perform any changes |
| --filter                   | Specify one or more filter conditions                                       |
| --help                     | Display help                                                     |
| --host                     | Connect to the host                                                   |
| --ignore-warnings          | Ignore these MySQL/GreatSQL warning codes when comparing warnings                   |
| --log                      | When running in the background, print STDOUT and STDERR to this file               |
| --max-class-size           | Limit the maximum number of rows in each data type category used for comparison and generating difference samples       |
| --max-examples             | Limit the maximum number of difference samples that the `pt-upgrade` tool generates for each difference type |
| --password                 | The password used when connecting                                             |
| --pid                      | Create the given PID file                                          |
| --port                     | The port number used for the connection                                             |
| --progress                 | Print progress reports to STDERR                                      |
| --[no]read-only            | By default, only `SELECT` and `SET` operations are executed. To execute other operations, this parameter must be specified |
| --report                   | Print these parts of the "report"                                         |
| --run-time                 | Run time                                                     |
| --save-results             | Save the results to this directory                                           |
| --set-vars                 | Set MySQL/GreatSQL variables in the comma-separated `variable=value` pair list |
| --socket                   | The socket file used for the connection                                         |
| --type                     | The type of log file                                               |
| --upgrade-table            | Use this table to clear warnings. Default is `percona_schema.pt_upgrade`          |
| --user                     | The user used for login                                               |
| --version                  | Display the version                                                     |
| --[no]version-check        | Version check                                                     |

### Best Practices

Just provide the connection information of two instances and the file name, and directly compare the execution effect of the SQL in a file on two instances.

```bash
pt-upgrade h=host1 h=host2 slow.log
```

Use the `--type` parameter to easily specify the file type, supporting slow logs, general logs, binary logs (parsed with `mysqlbinlog`), raw SQL statements, and `tcpdump`. If not specified, the default is the slow log.

Next, do a simple demonstration. Create a `pt_upgrade_test.sql` file containing several test statements:

```ini
SELECT NOW();
SELECT DATEDIFF('2023-10-23', '2023-01-01') AS days_diff;
SELECT 5 + 3 * 2 AS result;
SELECT DATABASE();
SHOW GRANTS FOR CURRENT_USER();
```

Run the `pt-upgrade` tool for comparison:

```bash
pt-upgrade h=localhost,P=3306,u=root,--ask-pass h=localhost,P=3306,u=root,--ask-pass --type rawlog /tmp/pt_upgrade_test.sql --no-read-only
```
::: details View the result
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

- failed_queries: The number of SQL statements that failed for some reason.
- not_select: The number of SQL statements processed that are not SELECT type.
- queries_filtered: The number of SQL statements excluded because of some filter condition.
- queries_no_diffs: The number of SQL statements with no differences in the execution plan.
- queries_read: How many queries were read in total for comparison.
- queries_with_diffs: The number of SQL statements whose execution plans differ on the two databases.
- queries_with_errors: The number of SQL statements that encountered errors during execution.

::: tip Tip
If the value of `queries_with_diffs` is not 0, the differences should be checked carefully.
:::


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
