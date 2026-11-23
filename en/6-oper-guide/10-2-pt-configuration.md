# Percona Toolkit Configuration

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## Configuration

In Percona Toolkit, the configuration category includes the following tools:

- `pt-config-diff`: Compare database configuration files and parameters.
- `pt-mysql-summary`: Summarize MySQL/GreatSQL configuration and status.
- `pt-variable-advisor`: Analyze parameters and make suggestions.

## pt-config-diff

### Overview

Compare MySQL/GreatSQL configuration files and server variables.

**Usage**

```bash
pt-config-diff [OPTIONS] CONFIG CONFIG [CONFIG...]
```
### Options

All options of this tool are as follows:

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --ask-pass          | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --charset           | Character set                                                       |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --database          | Connect to this database                                               |
| --defaults-file     | Read MySQL/GreatSQL options only from the given file                       |
| --help              | Display help                                                     |
| --host              | Connect to the host                                                   |
| --[no]ignore-case   | Do not distinguish case when comparing variables                                       |
| --ignore-variables  | Ignore and do not compare these variables                                           |
| --password          | The password used for the connection                                               |
| --pid               | Create the given PID file                                          |
| --port              | The port number used for the connection                                             |
| --[no]report        | Print the MySQL/GreatSQL configuration difference report to STDOUT                  |
| --report-width      | Truncate report lines to the set number of characters                                     |
| --set-vars          | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket            | The socket file used for the connection                                         |
| --user              | The login user                                                   |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

First create two configuration files (for demonstration convenience, the configuration file content is small). Create the `test_my_1.cnf` configuration file:

```ini
[client]
socket    = /data/GreatSQL/mysql.sock
[mysql]
loose-skip-binary-as-hex
no-auto-rehash
[mysqld]
user    = mysql
port    = 3306
server_id = 3306
innodb_buffer_pool_size = 16G
loose-group_replication_group_seeds = '172.16.16.10:33061,172.16.16.12:33061,172.16.16.12:33061'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
```
Create the `test_my_2.cnf` configuration file:

```ini
[client]
socket    = /data/greatsql/greatsql.sock
[mysql]
loose-skip-binary-as-hex
no-auto-rehash
[mysqld]
user    = greatsql
port    = 3308
server_id = 3308
innodb_buffer_pool_size = 8G
loose-group_replication_group_seeds = '172.16.10:33081,172.16.10:33081,172.16.10:33081'
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1"
```
::: tip Tip
When configuring MGR, part of the my.cnf configuration of the nodes in the cluster needs to be consistent. This tool can be used for comparison.
::: 

#### Configuration File Comparison

Output only when inconsistent. If completely consistent, nothing is output:

```bash
pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf
```

::: details View the result
```bash
$ pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf

6 config differences
Variable                  /data/test_my_1.cnf       /data/test_my_2.cnf
========================= ========================= =========================
innodb_buffer_pool_size   17179869184               8589934592
loose_group_replicatio... aaaaaaaa-aaaa-aaaa-aaa... aaaaaaaa-aaaa-aaaa-aaa...
loose_group_replicatio... 172.16.16.10:33061,172... 172.16.10:33081,172.16...
port                      3306                      3308
server_id                 3306                      3308
user                      mysql                     greatsql
```
:::

Add `--report-width 200` to output the difference items completely:

```bash
pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf --report-width 200
```

::: details View the result
```bash
$ pt-config-diff /data/test_my_1.cnf /data/test_my_2.cnf --report-width 200

6 config differences
Variable                   /data/test_my_1.cnf                                      /data/test_my_2.cnf
========================== ======================================================== ===============================================
innodb_buffer_pool_size    17179869184                                              8589934592
loose_group_replication... aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1                     aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1
loose_group_replication... 172.16.16.10:33061,172.16.16.12:33061,172.16.16.12:33061 172.16.10:33081,172.16.10:33081,172.16.10:33081
port                       3306                                                     3308
server_id                  3306                                                     3308
user                       mysql                                                    greatsql
```
:::
#### Comparison Between Configuration Files and System Variables

Compare the configuration file with the local GreatSQL system variables. If completely consistent, nothing is output:

```bash
pt-config-diff --report-width=200 /etc/my.cnf u=root,p=
```

::: details View the result
```bash
$ pt-config-diff --report-width=200 /etc/my.cnf u=root,p=

1 config difference
Variable                  /etc/my.cnf myarch
========================= =========== ================================
slow_query_log_file       slow.log    /data/GreatSQL/myarch.log.000001
```
:::


#### Comparison Between System Variables

Comparison of system variables between two different database instances:

```bash
pt-config-diff --report-width=200 h=192.168.6.55,P=3306,u=GreatSQL,p=  h=192.168.6.129,P=3306,u=test,p='test'
```

::: details View the result
```bash
$ pt-config-diff --report-width=200 h=192.168.6.55,P=3306,u=GreatSQL,p=  h=192.168.6.129,P=3306,u=test,p='test'

104 config differences
Variable                   myarch                                                               hy
========================== ==================================================================== ====================================================================
admin_tls_version          TLSv1.2,TLSv1.3                                                      TLSv1.2
back_log                   1024                                                                 151
basedir                    /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/                /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64/
binlog_cache_size          4194304                                                              32768
binlog_expire_logs_seconds 604800                                                               2592000
binlog_rows_query_log_e... ON                                                                   OFF
......the following part is omitted
```
:::

## pt-mysql-summary

### Overview

Print descriptive information of MySQL/GreatSQL, including: version information, data directory, command statistics, users, databases, replication, etc., as well as information of various variables (status, variables) and the proportion information of each variable, and configuration file information, etc.

**Usage**

```bash
pt-mysql-summary [OPTIONS]
```

### Options

All options of this tool are as follows

| Parameter                    | Meaning                                                         |
| ----------------------- | ------------------------------------------------------------ |
| --all-databases         | mysqldump and summarize all databases                                   |
| --ask-pass              | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --config                | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --databases             | mysqldump and summarize this comma-separated database list. To dump and summarize all databases, specify `--all-databases` |
| --defaults-file         | Read MySQL/GreatSQL options only from the given file                       |
| --help                  | Display help                                                     |
| --host                  | The host to connect to                                                 |
| --list-encrypted-tables | Include a list of encrypted tables in all databases. This may slow things down, because querying information schema tables can be slow. |
| --password              | The password used when connecting                                             |
| --port                  | The port number used for the connection                                             |
| --read-samples          | Create a report from files found in this directory                                 |
| --save-samples          | Save the data files used to generate the summary in this directory                       |
| --sleep                 | The seconds to sleep when collecting status counters                                   |
| --socket                | The socket file used for the connection                                         |
| --user                  | The login user                                                   |
| --version               | Display the version                                                     |

### Best Practices

```bash
pt-mysql-summary --user=root --password=greatsql --host=localhost --port=3306
```
::: tip Tip
At this time, all information about GreatSQL is output, but note that many outputs are rounded and are not precise data.
It is not recommended to use this tool to remotely connect to other databases, because it may cause output data confusion.
:::

Next, the output of this tool is divided into modules for introduction:

```bash
# Percona Toolkit MySQL Summary Report #######################
              System time | 2024-03-14 08:19:45 UTC (local TZ: CST +0800)
# Instances ##################################################
  Port  Data Directory             Nice OOM Socket
  ===== ========================== ==== === ======
# MySQL Executable ###########################################
       Path to executable | /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld
              Has symbols | Yes
# Slave Hosts ################################################
No slaves found
```

The above four parts show on which server the report was generated and which GreatSQL instances are running on that server. This is detected from the output of `ps`, and not all instances and parameters are always detected.

```bash
# Report On Port 3306 ########################################
                     User | root@localhost
                     Time | 2024-03-14 16:19:45 (+08:00)
                 Hostname | myarch
                  Version | 8.0.32-25 GreatSQL, Release 25, Revision 79f57097e3f
                 Built On | Linux x86_64
                  Started | 2024-03-08 09:50 (up 6+06:29:24)
                Databases | 9
                  Datadir | /data/GreatSQL/
                Processes | 2 connected, 2 running
              Replication | Is not a slave, has 0 slaves connected
                  Pidfile | mysql.pid (does not exist)
```

The above is a quick summary of the GreatSQL instance: version, uptime, and other very basic parameters. The time output is generated from the GreatSQL server and may differ from the system date and time printed earlier. If different, you can check whether the database and operating system time match.

```bash
# Processlist ################################################

  Command                        COUNT(*) Working SUM(Time) MAX(Time)
  ------------------------------ -------- ------- --------- ---------
  Daemon                                1       1    500000    500000
  Query                                 1       1         0         0
  Sleep                                 1       0       450       450
......the middle is omitted
  State                          COUNT(*) Working SUM(Time) MAX(Time)
  ------------------------------ -------- ------- --------- ---------
                                        1       0         0         0
  init                                  1       1         0         0
  Waiting on empty queue                1       1    500000    500000
```

The above is a summary of the `SHOW PROCESSLIST` output. The numbers here are rounded and not the most precise.

```bash
# Status Counters (Wait 10 Seconds) ##########################
Variable                                Per day  Per second     10 secs
Aborted_clients                              10                        
Aborted_connects                              2                        
Binlog_snapshot_position                    100                        
.......the middle is omitted
Table_open_cache_overflows                   30                        
Threadpool_idle_threads                       2                        
Threadpool_threads                            2                        
Threads_created                              25                        
Uptime                                    90000           1           1
```

The above are counters selected from two snapshots of `SHOW GLOBAL STATUS`, collected approximately 10 seconds apart and fuzzily rounded.

- The first column is the variable name.

- The second column is the counter of the first snapshot divided by 86400 (the number of seconds in a day), so you can see how much the counter changes per day. 86400 is fuzzily rounded to 90000, so the uptime counter should always be about 90000.

- The third column is the value of the first snapshot divided by uptime, then fuzzily rounded, so it roughly indicates how fast the counter grows per second during the server's uptime.

- The fourth column is the incremental difference between the first and second snapshots, divided by the difference in uptime, then fuzzily rounded. Therefore, it shows how fast the counter grows per second when the report was generated.

```bash
# Table cache ################################################
                     Size | 1024
                    Usage | 70%
```

The above shows the size of the table cache, followed by the percentage of table cache usage.

```bash
# Key Percona Server features ################################
      Table & Index Stats | Disabled
     Multiple I/O Threads | Enabled
     Corruption Resilient | Enabled
      Durable Replication | Not Supported
     Import InnoDB Tables | Not Supported
     Fast Server Restarts | Not Supported
         Enhanced Logging | Disabled
     Replica Perf Logging | Enabled
      Response Time Hist. | Not Supported
          Smooth Flushing | Not Supported
      HandlerSocket NoSQL | Not Supported
           Fast Hash UDFs | Unknown
```

The above shows the features available in Percona Server and their enabling status.

```bash
# Plugins ####################################################
       InnoDB compression | ACTIVE
```

The above shows specific plugins and whether they are enabled.

::: tip Tip
This tool only detects a few plugins, not all plugins.
:::

```bash
# Schema #####################################################
Specify --databases or --all-databases to dump and summarize schemas
# If --databases or --all-databases is not specified, it is not printed

# Schema #####################################################
  Database  Tables Views SPs Trigs Funcs   FKs Partn
  mysql         38                                  
  aptest         7                                  
  db2            1                                  
  sys_audit      1                                  
  test_db       11                                  
  tpch           8                                  

  Database  InnoDB CSV
  aptest         7    
  db2            1    
  mysql          2   2
  sys_audit      1    
  test_db       11    
  tpch           8    

  Database  BTREE
  aptest        7
  db2           1
  mysql        45
  sys_audit     1
  test_db      19
  tpch         17
  
-- To display compactly below, the author set these column headings to vertical output
-- You need to read from top to bottom. The first column is char, the second is timestamp
              c   t   s   i   t   e   v   f   t   b   s   j   b   m   m   t   d   d   d   d
              h   i   e   n   e   n   a   l   i   i   m   s   l   e   e   i   a   o   a   e
              a   m   t   t   x   u   r   o   n   g   a   o   o   d   d   m   t   u   t   c
              r   e           t   m   c   a   y   i   l   n   b   i   i   e   e   b   e   i
                  s                   h   t   i   n   l           u   u       t   l       m
                  t                   a       n   t   i           m   m       i   e       a
                  a                   r       t       n           t   b       m           l
                  m                                   t           e   l       e            
                  p                                               x   o                    
                                                                  t   b                    
  Database  === === === === === === === === === === === === === === === === === === === ===
  aptest     23           1          58          19                           9   3   2    
  db2                     1                       1                                        
  mysql      64  10   4  46  31  61  25   5  15  23   6   2   4   2   2   2                
  sys_audit                          11                           1                        
  test_db     3   2      33   2      29       4   3   1                       7   2       5
  tpch       16          19          13                                               4   9
```

If you specify `--databases` or `--all-databases`, the tool prints the above parts.

The above shows the number and type of objects in the databases. It is generated by running `mysqldump --no-data`, not by querying `INFORMATION_SCHEMA`.

The first sub-report in this section is the object count by type in each database: tables, views, etc. The second shows how many tables in each database use different storage engines. The third sub-report shows the number of indexes of each type in each database.

The last part shows the number of columns of various data types in each database. For compact display, the column headings are formatted vertically, so you need to read from top to bottom. In this example, the first column is `char` and the second is `timestamp`.

::: tip Tip
The numbers in this part of the output are all precise, not rounded.
:::

```bash
# Noteworthy Technologies ####################################
                      SSL | No
     Explicit LOCK TABLES | No
           Delayed Insert | No
          XA Transactions | No
              NDB Cluster | No
      Prepared Statements | No
 Prepared statement count | 0
```

The above shows some specific technologies used on this server.

```bash
# InnoDB #####################################################
                  Version | 8.0.32-8.0.32
         Buffer Pool Size | 2.0G
         Buffer Pool Fill | 70%
        Buffer Pool Dirty | 0%
......the middle is omitted
      Pending I/O Flushes | 7 buf pool, 0 log
       Transaction States | 3xnot started
```

The above shows the important configuration variables of the InnoDB storage engine. The buffer pool fill percentage and dirty percentage are fuzzily rounded. The last few lines come from the output of `SHOW INNODB STATUS`.

```bash
# MyISAM #####################################################
                Key Cache | 32.0M
                 Pct Used | 20%
                Unflushed | 0%
```

The above shows the size of the MyISAM key cache, followed by the percentage of cache in use and the unflushed percentage (rounded).

```bash
# Security ###################################################
                    Users | 2 users, 0 anon, 0 w/o pw, 2 old pw
            Old Passwords | 
```

The above is generated based on queries to the tables in the GreatSQL system database. It shows how many users exist, and various potential security risks, such as old-style passwords and users without passwords.

```bash
# Binary Logging #############################################
                  Binlogs | 8
               Zero-Sized | 0
               Total Size | 10.6G
            binlog_format | ROW
         expire_logs_days | 0
              sync_binlog | 1
                server_id | 3306
             binlog_do_db | 
         binlog_ignore_db | 
```

The above shows the configuration and status of binary logging. If there are binary logs with a size of 0, the binary log index may be out of sync with the binary logs actually existing on disk.

```bash
# Noteworthy Variables #######################################
     Auto-Inc Incr/Offset | 1/1
   default_storage_engine | InnoDB
               flush_time | 0
             init_connect | 
                init_file | 
                 sql_mode | 
                ......the middle is omitted
log_queries_not_using_indexes | ON
      log_replica_updates | ON
```

The above shows several noteworthy server configuration variables. Knowing these variables may be important when using this server.

```bash
# Configuration File #########################################
              Config File | /etc/my.cnf
```

The last part shows a nicely printed version of the my.cnf file, with comments removed and spaces added to align content for easy reading.

## pt-variable-advisor

### Overview

This is a tool that analyzes parameters and gives parameter setting suggestions.

**Usage**

```bash
pt-variable-advisor [OPTIONS] [DSN]
```

### Options

All options of this tool are as follows

| Parameter                  | Meaning                                                         |
| --------------------- | ------------------------------------------------------------ |
| --ask-pass            | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --charset             | Character set                                                       |
| --config              | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --daemonize           | Run in the background                                                     |
| --database            | Connect to this database                                               |
| --defaults-file       | Read MySQL/GreatSQL options only from the given file                       |
| --help                | Display help                                                     |
| --host                | The host to connect to                                                 |
| --ignore-rules        | Ignore these rule IDs                                              |
| --password            | The password used when connecting                                             |
| --pid                 | Create the given PID file                                          |
| --port                | The port number used when connecting                                           |
| --set-vars            | Set MySQL/GreatSQL variables in this comma-separated `variable=value` pair list |
| --socket              | The socket file used for the connection                                         |
| --source-of-variables | Read `SHOW VARIABLES` from this source                                  |
| --user                | The login user                                                   |
| --verbose             | Increase the verbosity of the output                                           |
| --version             | Display the version                                                     |
| --[no]version-check   | Version check                                                     |

### Best Practices

Some suggestions for analyzing local GreatSQL database parameters:

```bash
pt-variable-advisor localhost
```

::: details View the result
```bash
$ pt-variable-advisor localhost

# WARN delay_key_write: MyISAM index blocks are never flushed until necessary.

# WARN innodb_log_buffer_size: The InnoDB log buffer size generally should not be set larger than 16MB.

# NOTE read_buffer_size-1: The read_buffer_size variable should generally be left at its default unless an expert determines it is necessary to change it.

# NOTE read_rnd_buffer_size-1: The read_rnd_buffer_size variable should generally be left at its default unless an expert determines it is necessary to change it.

# NOTE sort_buffer_size-1: The sort_buffer_size variable should generally be left at its default unless an expert determines it is necessary to change it.

# WARN expire_logs_days: Binary logs are enabled, but automatic purging is not enabled.

# NOTE innodb_data_file_path: Auto-extending InnoDB files can consume a lot of disk space that is very difficult to reclaim later.

# WARN myisam_recover_options: myisam_recover_options should be set to some value such as BACKUP,FORCE to ensure that table corruption is noticed.
```
:::

Of course, the output of `SHOW VARIABLES` can also be saved in the `pt_va.txt` file, and then analyzed with the tool:

```bash
pt-variable-advisor localhost --source-of-variables pt_va.txt
```
::: tip Tip
Except for very obvious errors, this suggestion does not have much meaning.

Here is also a recommended web version of the [MySQL/GreatSQL status diagnosis tool](https://imysql.com/my-state-diag.html).
:::

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
