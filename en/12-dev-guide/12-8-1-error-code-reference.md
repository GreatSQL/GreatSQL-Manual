# Common Error Code Reference
This section introduces the common error codes reported by GreatSQL.
## Error Numbers 1000~1887
</br>
- Error number: 1002; Symbol: ER_NO; SQLSTATE: HY000

Message: NO

Used in the construction of other messages.

</br>
- Error number: 1003; Symbol: ER_YES; SQLSTATE: HY000

Message: YES

Used in the construction of other messages.
Extended EXPLAIN format generates Note messages. ER_YES is used in the Code column for these messages in subsequent SHOW WARNINGS output.

</br>
- Error number: 1004; Symbol: ER_CANT_CREATE_FILE; SQLSTATE: HY000

Message: Can't create file '%s' (errno: %d - %s)

Occurs for failure to create or copy a file needed for some operation.
Possible causes: Permissions problem for source file; destination file already exists but is not writeable.

</br>
- Error number: 1005; Symbol: ER_CANT_CREATE_TABLE; SQLSTATE: HY000

Message: Can't create table '%s' (errno: %d - %s)

InnoDB reports this error when a table cannot be created. If the error message refers to error 150, table creation failed because a foreign key constraint was not correctly formed. If the error message refers to error −1, table creation probably failed because the table includes a column name that matched the name of an internal InnoDB table.

</br>
- Error number: 1006; Symbol: ER_CANT_CREATE_DB; SQLSTATE: HY000

Message: Can't create database '%s' (errno: %d - %s)

</br>
- Error number: 1007; Symbol: ER_DB_CREATE_EXISTS; SQLSTATE: HY000

Message: Can't create database '%s'; database exists

An attempt to create a database failed because the database already exists.
Drop the database first if you really want to replace an existing database, or add an IF NOT EXISTS clause to the CREATE DATABASE statement if to retain an existing database without having the statement produce an error.

</br>
- Error number: 1008; Symbol: ER_DB_DROP_EXISTS; SQLSTATE: HY000

Message: Can't drop database '%s'; database doesn't exist

</br>
- Error number: 1010; Symbol: ER_DB_DROP_RMDIR; SQLSTATE: HY000

Message: Error dropping database (can't rmdir '%s', errno: %d - %s)

</br>
- Error number: 1012; Symbol: ER_CANT_FIND_SYSTEM_REC; SQLSTATE: HY000

Message: Can't read record in system table

Returned by InnoDB for attempts to access InnoDB INFORMATION_SCHEMA tables when InnoDB is unavailable.

</br>
- Error number: 1013; Symbol: ER_CANT_GET_STAT; SQLSTATE: HY000

Message: Can't get status of '%s' (errno: %d - %s)

</br>
- Error number: 1015; Symbol: ER_CANT_LOCK; SQLSTATE: HY000

Message: Can't lock file (errno: %d - %s)

</br>
- Error number: 1016; Symbol: ER_CANT_OPEN_FILE; SQLSTATE: HY000

Message: Can't open file: '%s' (errno: %d - %s)

InnoDB reports this error when the table from the InnoDB data files cannot be found.

</br>
- Error number: 1017; Symbol: ER_FILE_NOT_FOUND; SQLSTATE: HY000

Message: Can't find file: '%s' (errno: %d - %s)

</br>
- Error number: 1018; Symbol: ER_CANT_READ_DIR; SQLSTATE: HY000

Message: Can't read dir of '%s' (errno: %d - %s)

</br>
- Error number: 1020; Symbol: ER_CHECKREAD; SQLSTATE: HY000

Message: Record has changed since last read in table '%s'

</br>
- Error number: 1022; Symbol: ER_DUP_KEY; SQLSTATE: 23000

Message: Can't write; duplicate key in table '%s'

</br>
- Error number: 1024; Symbol: ER_ERROR_ON_READ; SQLSTATE: HY000

Message: Error reading file '%s' (errno: %d - %s)

</br>
- Error number: 1025; Symbol: ER_ERROR_ON_RENAME; SQLSTATE: HY000

Message: Error on rename of '%s' to '%s' (errno: %d - %s)

</br>
- Error number: 1026; Symbol: ER_ERROR_ON_WRITE; SQLSTATE: HY000

Message: Error writing file '%s' (errno: %d - %s)

</br>
- Error number: 1027; Symbol: ER_FILE_USED; SQLSTATE: HY000

Message: '%s' is locked against change

</br>
- Error number: 1028; Symbol: ER_FILSORT_ABORT; SQLSTATE: HY000

Message: Sort aborted

ER_FILSORT_ABORT was removed after 8.0.18.

</br>
- Error number: 1030; Symbol: ER_GET_ERRNO; SQLSTATE: HY000

Message: Got error %d - '%s' from storage engine

Check the %d value to see what the OS error means. For example, 28 indicates that you have run out of disk space.

</br>
- Error number: 1031; Symbol: ER_ILLEGAL_HA; SQLSTATE: HY000

Message: Table storage engine for '%s' doesn't have this option

</br>
- Error number: 1032; Symbol: ER_KEY_NOT_FOUND; SQLSTATE: HY000

Message: Can't find record in '%s'

</br>
- Error number: 1033; Symbol: ER_NOT_FORM_FILE; SQLSTATE: HY000

Message: Incorrect information in file: '%s'

</br>
- Error number: 1034; Symbol: ER_NOT_KEYFILE; SQLSTATE: HY000

Message: Incorrect key file for table '%s'; try to repair it

</br>
- Error number: 1035; Symbol: ER_OLD_KEYFILE; SQLSTATE: HY000

Message: Old key file for table '%s'; repair it!

</br>
- Error number: 1036; Symbol: ER_OPEN_AS_READONLY; SQLSTATE: HY000

Message: Table '%s' is read only

</br>
- Error number: 1037; Symbol: ER_OUTOFMEMORY; SQLSTATE: HY001

Message: Out of memory; restart server and try again (needed %d bytes)

</br>
- Error number: 1038; Symbol: ER_OUT_OF_SORTMEMORY; SQLSTATE: HY001

Message: Out of sort memory, consider increasing server sort buffer size

</br>
- Error number: 1040; Symbol: ER_CON_COUNT_ERROR; SQLSTATE: 08004

Message: Too many connections

</br>
- Error number: 1041; Symbol: ER_OUT_OF_RESOURCES; SQLSTATE: HY000

Message: Out of memory; check if mysqld or some other process uses all available memory; if not, you may have to use 'ulimit' to allow mysqld to use more memory or you can add more swap space

</br>
- Error number: 1042; Symbol: ER_BAD_HOST_ERROR; SQLSTATE: 08S01

Message: Can't get hostname for your address

</br>
- Error number: 1043; Symbol: ER_HANDSHAKE_ERROR; SQLSTATE: 08S01

Message: Bad handshake

</br>
- Error number: 1044; Symbol: ER_DBACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: Access denied for user '%s'@'%s' to database '%s'

</br>
- Error number: 1045; Symbol: ER_ACCESS_DENIED_ERROR; SQLSTATE: 28000

Message: Access denied for user '%s'@'%s' (using password: %s)

</br>
- Error number: 1046; Symbol: ER_NO_DB_ERROR; SQLSTATE: 3D000

Message: No database selected

</br>
- Error number: 1047; Symbol: ER_UNKNOWN_COM_ERROR; SQLSTATE: 08S01

Message: Unknown command

</br>
- Error number: 1048; Symbol: ER_BAD_NULL_ERROR; SQLSTATE: 23000

Message: Column '%s' cannot be null

</br>
- Error number: 1049; Symbol: ER_BAD_DB_ERROR; SQLSTATE: 42000

Message: Unknown database '%s'

</br>
- Error number: 1050; Symbol: ER_TABLE_EXISTS_ERROR; SQLSTATE: 42S01

Message: Table '%s' already exists

</br>
- Error number: 1051; Symbol: ER_BAD_TABLE_ERROR; SQLSTATE: 42S02

Message: Unknown table '%s'

</br>
- Error number: 1052; Symbol: ER_NON_UNIQ_ERROR; SQLSTATE: 23000

Message: Column '%s' in %s is ambiguous

```none
%s = column name
%s = location of column (for example, "field list")

```
Likely cause: A column appears in a query without appropriate qualification, such as in a select list or ON clause.
Examples:

```sql
mysql> SELECT i FROM t INNER JOIN t AS t2;
ERROR 1052 (23000): Column 'i' in field list is ambiguous
mysql> SELECT * FROM t LEFT JOIN t AS t2 ON i = i;
ERROR 1052 (23000): Column 'i' in on clause is ambiguous

```
Resolution:
- Qualify the column with the appropriate table name:

```sql
mysql> SELECT t2.i FROM t INNER JOIN t AS t2;

```

</br>
- Error number: 1053; Symbol: ER_SERVER_SHUTDOWN; SQLSTATE: 08S01

Message: Server shutdown in progress

</br>
- Error number: 1054; Symbol: ER_BAD_FIELD_ERROR; SQLSTATE: 42S22

Message: Unknown column '%s' in '%s'

</br>
- Error number: 1055; Symbol: ER_WRONG_FIELD_WITH_GROUP; SQLSTATE: 42000

Message: '%s' isn't in GROUP BY

</br>
- Error number: 1056; Symbol: ER_WRONG_GROUP_FIELD; SQLSTATE: 42000

Message: Can't group on '%s'

</br>
- Error number: 1057; Symbol: ER_WRONG_SUM_SELECT; SQLSTATE: 42000

Message: Statement has sum functions and columns in same statement

</br>
- Error number: 1058; Symbol: ER_WRONG_VALUE_COUNT; SQLSTATE: 21S01

Message: Column count doesn't match value count

</br>
- Error number: 1059; Symbol: ER_TOO_LONG_IDENT; SQLSTATE: 42000

Message: Identifier name '%s' is too long

</br>
- Error number: 1060; Symbol: ER_DUP_FIELDNAME; SQLSTATE: 42S21

Message: Duplicate column name '%s'

</br>
- Error number: 1061; Symbol: ER_DUP_KEYNAME; SQLSTATE: 42000

Message: Duplicate key name '%s'

</br>
- Error number: 1062; Symbol: ER_DUP_ENTRY; SQLSTATE: 23000

Message: Duplicate entry '%s' for key %d

The message returned with this error uses the format string for ER_DUP_ENTRY_WITH_KEY_NAME.

</br>
- Error number: 1063; Symbol: ER_WRONG_FIELD_SPEC; SQLSTATE: 42000

Message: Incorrect column specifier for column '%s'

</br>
- Error number: 1064; Symbol: ER_PARSE_ERROR; SQLSTATE: 42000

Message: %s near '%s' at line %d

</br>
- Error number: 1065; Symbol: ER_EMPTY_QUERY; SQLSTATE: 42000

Message: Query was empty

</br>
- Error number: 1066; Symbol: ER_NONUNIQ_TABLE; SQLSTATE: 42000

Message: Not unique table/alias: '%s'

</br>
- Error number: 1067; Symbol: ER_INVALID_DEFAULT; SQLSTATE: 42000

Message: Invalid default value for '%s'

</br>
- Error number: 1068; Symbol: ER_MULTIPLE_PRI_KEY; SQLSTATE: 42000

Message: Multiple primary key defined

</br>
- Error number: 1069; Symbol: ER_TOO_MANY_KEYS; SQLSTATE: 42000

Message: Too many keys specified; max %d keys allowed

</br>
- Error number: 1070; Symbol: ER_TOO_MANY_KEY_PARTS; SQLSTATE: 42000

Message: Too many key parts specified; max %d parts allowed

</br>
- Error number: 1071; Symbol: ER_TOO_LONG_KEY; SQLSTATE: 42000

Message: Specified key was too long; max key length is %d bytes

</br>
- Error number: 1072; Symbol: ER_KEY_COLUMN_DOES_NOT_EXITS; SQLSTATE: 42000

Message: Key column '%s' doesn't exist in table

</br>
- Error number: 1073; Symbol: ER_BLOB_USED_AS_KEY; SQLSTATE: 42000

Message: BLOB column '%s' can't be used in key specification with the used table type

</br>
- Error number: 1074; Symbol: ER_TOO_BIG_FIELDLENGTH; SQLSTATE: 42000

Message: Column length too big for column '%s' (max = %lu); use BLOB or TEXT instead

</br>
- Error number: 1075; Symbol: ER_WRONG_AUTO_KEY; SQLSTATE: 42000

Message: Incorrect table definition; there can be only one auto column and it must be defined as a key

</br>
- Error number: 1076; Symbol: ER_READY; SQLSTATE: HY000

Message: %s: ready for connections. Version: '%s' socket: '%s' port: %d

</br>
- Error number: 1077; Symbol: ER_NORMAL_SHUTDOWN; SQLSTATE: HY000

Message: %s: Normal shutdown

ER_NORMAL_SHUTDOWN was removed after 8.0.4.

</br>
- Error number: 1079; Symbol: ER_SHUTDOWN_COMPLETE; SQLSTATE: HY000

Message: %s: Shutdown complete

</br>
- Error number: 1080; Symbol: ER_FORCING_CLOSE; SQLSTATE: 08S01

Message: %s: Forcing close of thread %ld user: '%s'

</br>
- Error number: 1081; Symbol: ER_IPSOCK_ERROR; SQLSTATE: 08S01

Message: Can't create IP socket

</br>
- Error number: 1082; Symbol: ER_NO_SUCH_INDEX; SQLSTATE: 42S12

Message: Table '%s' has no index like the one used in CREATE INDEX; recreate the table

</br>
- Error number: 1083; Symbol: ER_WRONG_FIELD_TERMINATORS; SQLSTATE: 42000

Message: Field separator argument is not what is expected; check the manual

</br>
- Error number: 1084; Symbol: ER_BLOBS_AND_NO_TERMINATED; SQLSTATE: 42000

Message: You can't use fixed rowlength with BLOBs; please use 'fields terminated by'

</br>
- Error number: 1085; Symbol: ER_TEXTFILE_NOT_READABLE; SQLSTATE: HY000

Message: The file '%s' must be in the database directory or be readable by all

</br>
- Error number: 1086; Symbol: ER_FILE_EXISTS_ERROR; SQLSTATE: HY000

Message: File '%s' already exists

</br>
- Error number: 1087; Symbol: ER_LOAD_INFO; SQLSTATE: HY000

Message: Records: %ld Deleted: %ld Skipped: %ld Warnings: %ld

</br>
- Error number: 1088; Symbol: ER_ALTER_INFO; SQLSTATE: HY000

Message: Records: %ld Duplicates: %ld

</br>
- Error number: 1089; Symbol: ER_WRONG_SUB_KEY; SQLSTATE: HY000

Message: Incorrect prefix key; the used key part isn't a string, the used length is longer than the key part, or the storage engine doesn't support unique prefix keys

</br>
- Error number: 1090; Symbol: ER_CANT_REMOVE_ALL_FIELDS; SQLSTATE: 42000

Message: You can't delete all columns with ALTER TABLE; use DROP TABLE instead

</br>
- Error number: 1091; Symbol: ER_CANT_DROP_FIELD_OR_KEY; SQLSTATE: 42000

Message: Can't DROP '%s'; check that column/key exists

</br>
- Error number: 1092; Symbol: ER_INSERT_INFO; SQLSTATE: HY000

Message: Records: %ld Duplicates: %ld Warnings: %ld

</br>
- Error number: 1093; Symbol: ER_UPDATE_TABLE_USED; SQLSTATE: HY000

Message: You can't specify target table '%s' for update in FROM clause

This error occurs for attempts to select from and modify the same table within a single statement. If the select attempt occurs within a derived table, you can avoid this error by setting the derived_merge flag of the optimizer_switch system variable to force the subquery to be materialized into a temporary table, which effectively causes it to be a different table from the one modified. See Optimizing Derived Tables, View References, and Common Table Expressions with Merging or Materialization.

</br>
- Error number: 1094; Symbol: ER_NO_SUCH_THREAD; SQLSTATE: HY000

Message: Unknown thread id: %lu

</br>
- Error number: 1095; Symbol: ER_KILL_DENIED_ERROR; SQLSTATE: HY000

Message: You are not owner of thread %lu

</br>
- Error number: 1096; Symbol: ER_NO_TABLES_USED; SQLSTATE: HY000

Message: No tables used

</br>
- Error number: 1097; Symbol: ER_TOO_BIG_SET; SQLSTATE: HY000

Message: Too many strings for column %s and SET

</br>
- Error number: 1098; Symbol: ER_NO_UNIQUE_LOGFILE; SQLSTATE: HY000

Message: Can't generate a unique log-filename %s.(1-999)

</br>
- Error number: 1099; Symbol: ER_TABLE_NOT_LOCKED_FOR_WRITE; SQLSTATE: HY000

Message: Table '%s' was locked with a READ lock and can't be updated

</br>
- Error number: 1100; Symbol: ER_TABLE_NOT_LOCKED; SQLSTATE: HY000

Message: Table '%s' was not locked with LOCK TABLES

</br>
- Error number: 1101; Symbol: ER_BLOB_CANT_HAVE_DEFAULT; SQLSTATE: 42000

Message: BLOB, TEXT, GEOMETRY or JSON column '%s' can't have a default value

</br>
- Error number: 1102; Symbol: ER_WRONG_DB_NAME; SQLSTATE: 42000

Message: Incorrect database name '%s'

</br>
- Error number: 1103; Symbol: ER_WRONG_TABLE_NAME; SQLSTATE: 42000

Message: Incorrect table name '%s'

</br>
- Error number: 1104; Symbol: ER_TOO_BIG_SELECT; SQLSTATE: 42000

Message: The SELECT would examine more than MAX_JOIN_SIZE rows; check your WHERE and use SET SQL_BIG_SELECTS=1 or SET MAX_JOIN_SIZE=# if the SELECT is okay

</br>
- Error number: 1105; Symbol: ER_UNKNOWN_ERROR; SQLSTATE: HY000

Message: Unknown error

</br>
- Error number: 1106; Symbol: ER_UNKNOWN_PROCEDURE; SQLSTATE: 42000

Message: Unknown procedure '%s'

</br>
- Error number: 1107; Symbol: ER_WRONG_PARAMCOUNT_TO_PROCEDURE; SQLSTATE: 42000

Message: Incorrect parameter count to procedure '%s'

</br>
- Error number: 1108; Symbol: ER_WRONG_PARAMETERS_TO_PROCEDURE; SQLSTATE: HY000

Message: Incorrect parameters to procedure '%s'

</br>
- Error number: 1109; Symbol: ER_UNKNOWN_TABLE; SQLSTATE: 42S02

Message: Unknown table '%s' in %s

</br>
- Error number: 1110; Symbol: ER_FIELD_SPECIFIED_TWICE; SQLSTATE: 42000

Message: Column '%s' specified twice

</br>
- Error number: 1111; Symbol: ER_INVALID_GROUP_FUNC_USE; SQLSTATE: HY000

Message: Invalid use of group function

</br>
- Error number: 1112; Symbol: ER_UNSUPPORTED_EXTENSION; SQLSTATE: 42000

Message: Table '%s' uses an extension that doesn't exist in this MySQL version

</br>
- Error number: 1113; Symbol: ER_TABLE_MUST_HAVE_COLUMNS; SQLSTATE: 42000

Message: A table must have at least 1 column

</br>
- Error number: 1114; Symbol: ER_RECORD_FILE_FULL; SQLSTATE: HY000

Message: The table '%s' is full

InnoDB reports this error when the system tablespace runs out of free space. Reconfigure the system tablespace to add a new data file.

</br>
- Error number: 1115; Symbol: ER_UNKNOWN_CHARACTER_SET; SQLSTATE: 42000

Message: Unknown character set: '%s'

</br>
- Error number: 1116; Symbol: ER_TOO_MANY_TABLES; SQLSTATE: HY000

Message: Too many tables; MySQL can only use %d tables in a join

</br>
- Error number: 1117; Symbol: ER_TOO_MANY_FIELDS; SQLSTATE: HY000

Message: Too many columns

</br>
- Error number: 1118; Symbol: ER_TOO_BIG_ROWSIZE; SQLSTATE: 42000

Message: Row size too large. The maximum row size for the used table type, not counting BLOBs, is %ld. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs

</br>
- Error number: 1119; Symbol: ER_STACK_OVERRUN; SQLSTATE: HY000

Message: Thread stack overrun: Used: %ld of a %ld stack. Use 'mysqld --thread_stack=#' to specify a bigger stack if needed

</br>
- Error number: 1120; Symbol: ER_WRONG_OUTER_JOIN; SQLSTATE: 42000

Message: Cross dependency found in OUTER JOIN; examine your ON conditions

ER_WRONG_OUTER_JOIN was removed after 8.0.0.

</br>
- Error number: 1120; Symbol: ER_WRONG_OUTER_JOIN_UNUSED; SQLSTATE: 42000

Message: Cross dependency found in OUTER JOIN; examine your ON conditions

ER_WRONG_OUTER_JOIN_UNUSED was added in 8.0.1.

</br>
- Error number: 1121; Symbol: ER_NULL_COLUMN_IN_INDEX; SQLSTATE: 42000

Message: Table handler doesn't support NULL in given index. Please change column '%s' to be NOT NULL or use another handler

</br>
- Error number: 1122; Symbol: ER_CANT_FIND_UDF; SQLSTATE: HY000

Message: Can't load function '%s'

</br>
- Error number: 1123; Symbol: ER_CANT_INITIALIZE_UDF; SQLSTATE: HY000

Message: Can't initialize function '%s'; %s

</br>
- Error number: 1124; Symbol: ER_UDF_NO_PATHS; SQLSTATE: HY000

Message: No paths allowed for shared library

</br>
- Error number: 1125; Symbol: ER_UDF_EXISTS; SQLSTATE: HY000

Message: Function '%s' already exists

</br>
- Error number: 1126; Symbol: ER_CANT_OPEN_LIBRARY; SQLSTATE: HY000

Message: Can't open shared library '%s' (errno: %d %s)

</br>
- Error number: 1127; Symbol: ER_CANT_FIND_DL_ENTRY; SQLSTATE: HY000

Message: Can't find symbol '%s' in library

</br>
- Error number: 1128; Symbol: ER_FUNCTION_NOT_DEFINED; SQLSTATE: HY000

Message: Function '%s' is not defined

</br>
- Error number: 1129; Symbol: ER_HOST_IS_BLOCKED; SQLSTATE: HY000

Message: Host '%s' is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts'

</br>
- Error number: 1130; Symbol: ER_HOST_NOT_PRIVILEGED; SQLSTATE: HY000

Message: Host '%s' is not allowed to connect to this MySQL server

</br>
- Error number: 1131; Symbol: ER_PASSWORD_ANONYMOUS_USER; SQLSTATE: 42000

Message: You are using MySQL as an anonymous user and anonymous users are not allowed to change passwords

</br>
- Error number: 1132; Symbol: ER_PASSWORD_NOT_ALLOWED; SQLSTATE: 42000

Message: You must have privileges to update tables in the mysql database to be able to change passwords for others

</br>
- Error number: 1133; Symbol: ER_PASSWORD_NO_MATCH; SQLSTATE: 42000

Message: Can't find any matching row in the user table

</br>
- Error number: 1134; Symbol: ER_UPDATE_INFO; SQLSTATE: HY000

Message: Rows matched: %ld Changed: %ld Warnings: %ld

</br>
- Error number: 1135; Symbol: ER_CANT_CREATE_THREAD; SQLSTATE: HY000

Message: Can't create a new thread (errno %d); if you are not out of available memory, you can consult the manual for a possible OS-dependent bug

</br>
- Error number: 1136; Symbol: ER_WRONG_VALUE_COUNT_ON_ROW; SQLSTATE: 21S01

Message: Column count doesn't match value count at row %ld

</br>
- Error number: 1137; Symbol: ER_CANT_REOPEN_TABLE; SQLSTATE: HY000

Message: Can't reopen table: '%s'

</br>
- Error number: 1138; Symbol: ER_INVALID_USE_OF_NULL; SQLSTATE: 22004

Message: Invalid use of NULL value

</br>
- Error number: 1139; Symbol: ER_REGEXP_ERROR; SQLSTATE: 42000

Message: Got error '%s' from regexp

</br>
- Error number: 1140; Symbol: ER_MIX_OF_GROUP_FUNC_AND_FIELDS; SQLSTATE: 42000

Message: Mixing of GROUP columns (MIN(),MAX(),COUNT(),...) with no GROUP columns is illegal if there is no GROUP BY clause

</br>
- Error number: 1141; Symbol: ER_NONEXISTING_GRANT; SQLSTATE: 42000

Message: There is no such grant defined for user '%s' on host '%s'

</br>
- Error number: 1142; Symbol: ER_TABLEACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: %s command denied to user '%s'@'%s' for table '%s'

</br>
- Error number: 1143; Symbol: ER_COLUMNACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: %s command denied to user '%s'@'%s' for column '%s' in table '%s'

</br>
- Error number: 1144; Symbol: ER_ILLEGAL_GRANT_FOR_TABLE; SQLSTATE: 42000

Message: Illegal GRANT/REVOKE command; please consult the manual to see which privileges can be used

</br>
- Error number: 1145; Symbol: ER_GRANT_WRONG_HOST_OR_USER; SQLSTATE: 42000

Message: The host or user argument to GRANT is too long

</br>
- Error number: 1146; Symbol: ER_NO_SUCH_TABLE; SQLSTATE: 42S02

Message: Table '%s.%s' doesn't exist

</br>
- Error number: 1147; Symbol: ER_NONEXISTING_TABLE_GRANT; SQLSTATE: 42000

Message: There is no such grant defined for user '%s' on host '%s' on table '%s'

</br>
- Error number: 1148; Symbol: ER_NOT_ALLOWED_COMMAND; SQLSTATE: 42000

Message: The used command is not allowed with this MySQL version

</br>
- Error number: 1149; Symbol: ER_SYNTAX_ERROR; SQLSTATE: 42000

Message: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use

</br>
- Error number: 1152; Symbol: ER_ABORTING_CONNECTION; SQLSTATE: 08S01

Message: Aborted connection %ld to db: '%s' user: '%s' (%s)

</br>
- Error number: 1153; Symbol: ER_NET_PACKET_TOO_LARGE; SQLSTATE: 08S01

Message: Got a packet bigger than 'max_allowed_packet' bytes

</br>
- Error number: 1154; Symbol: ER_NET_READ_ERROR_FROM_PIPE; SQLSTATE: 08S01

Message: Got a read error from the connection pipe

</br>
- Error number: 1155; Symbol: ER_NET_FCNTL_ERROR; SQLSTATE: 08S01

Message: Got an error from fcntl()

</br>
- Error number: 1156; Symbol: ER_NET_PACKETS_OUT_OF_ORDER; SQLSTATE: 08S01

Message: Got packets out of order

</br>
- Error number: 1157; Symbol: ER_NET_UNCOMPRESS_ERROR; SQLSTATE: 08S01

Message: Couldn't uncompress communication packet

</br>
- Error number: 1158; Symbol: ER_NET_READ_ERROR; SQLSTATE: 08S01

Message: Got an error reading communication packets

</br>
- Error number: 1159; Symbol: ER_NET_READ_INTERRUPTED; SQLSTATE: 08S01

Message: Got timeout reading communication packets

</br>
- Error number: 1160; Symbol: ER_NET_ERROR_ON_WRITE; SQLSTATE: 08S01

Message: Got an error writing communication packets

</br>
- Error number: 1161; Symbol: ER_NET_WRITE_INTERRUPTED; SQLSTATE: 08S01

Message: Got timeout writing communication packets

</br>
- Error number: 1162; Symbol: ER_TOO_LONG_STRING; SQLSTATE: 42000

Message: Result string is longer than 'max_allowed_packet' bytes

</br>
- Error number: 1163; Symbol: ER_TABLE_CANT_HANDLE_BLOB; SQLSTATE: 42000

Message: The used table type doesn't support BLOB/TEXT columns

</br>
- Error number: 1164; Symbol: ER_TABLE_CANT_HANDLE_AUTO_INCREMENT; SQLSTATE: 42000

Message: The used table type doesn't support AUTO_INCREMENT columns

</br>
- Error number: 1166; Symbol: ER_WRONG_COLUMN_NAME; SQLSTATE: 42000

Message: Incorrect column name '%s'

</br>
- Error number: 1167; Symbol: ER_WRONG_KEY_COLUMN; SQLSTATE: 42000

Message: The used storage engine can't index column '%s'

</br>
- Error number: 1168; Symbol: ER_WRONG_MRG_TABLE; SQLSTATE: HY000

Message: Unable to open underlying table which is differently defined or of non-MyISAM type or doesn't exist

</br>
- Error number: 1169; Symbol: ER_DUP_UNIQUE; SQLSTATE: 23000

Message: Can't write, because of unique constraint, to table '%s'

</br>
- Error number: 1170; Symbol: ER_BLOB_KEY_WITHOUT_LENGTH; SQLSTATE: 42000

Message: BLOB/TEXT column '%s' used in key specification without a key length

</br>
- Error number: 1171; Symbol: ER_PRIMARY_CANT_HAVE_NULL; SQLSTATE: 42000

Message: All parts of a PRIMARY KEY must be NOT NULL; if you need NULL in a key, use UNIQUE instead

</br>
- Error number: 1172; Symbol: ER_TOO_MANY_ROWS; SQLSTATE: 42000

Message: Result consisted of more than one row

</br>
- Error number: 1173; Symbol: ER_REQUIRES_PRIMARY_KEY; SQLSTATE: 42000

Message: This table type requires a primary key

</br>
- Error number: 1175; Symbol: ER_UPDATE_WITHOUT_KEY_IN_SAFE_MODE; SQLSTATE: HY000

Message: You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column. %s

</br>
- Error number: 1176; Symbol: ER_KEY_DOES_NOT_EXITS; SQLSTATE: 42000

Message: Key '%s' doesn't exist in table '%s'

</br>
- Error number: 1177; Symbol: ER_CHECK_NO_SUCH_TABLE; SQLSTATE: 42000

Message: Can't open table

</br>
- Error number: 1178; Symbol: ER_CHECK_NOT_IMPLEMENTED; SQLSTATE: 42000

Message: The storage engine for the table doesn't support %s

</br>
- Error number: 1179; Symbol: ER_CANT_DO_THIS_DURING_AN_TRANSACTION; SQLSTATE: 25000

Message: You are not allowed to execute this command in a transaction

</br>
- Error number: 1180; Symbol: ER_ERROR_DURING_COMMIT; SQLSTATE: HY000

Message: Got error %d - '%s' during COMMIT

</br>
- Error number: 1181; Symbol: ER_ERROR_DURING_ROLLBACK; SQLSTATE: HY000

Message: Got error %d - '%s' during ROLLBACK

</br>
- Error number: 1182; Symbol: ER_ERROR_DURING_FLUSH_LOGS; SQLSTATE: HY000

Message: Got error %d during FLUSH_LOGS

</br>
- Error number: 1184; Symbol: ER_NEW_ABORTING_CONNECTION; SQLSTATE: 08S01

Message: Aborted connection %u to db: '%s' user: '%s' host: '%s' (%s)

</br>
- Error number: 1188; Symbol: ER_MASTER; SQLSTATE: HY000

Message: Error from master: '%s'

ER_MASTER was removed after 8.0.32.

</br>
- Error number: 1189; Symbol: ER_MASTER_NET_READ; SQLSTATE: 08S01

Message: Net error reading from master

ER_MASTER_NET_READ was removed after 8.0.32.

</br>
- Error number: 1190; Symbol: ER_MASTER_NET_WRITE; SQLSTATE: 08S01

Message: Net error writing to master

ER_MASTER_NET_WRITE was removed after 8.0.32.

</br>
- Error number: 1191; Symbol: ER_FT_MATCHING_KEY_NOT_FOUND; SQLSTATE: HY000

Message: Can't find FULLTEXT index matching the column list

</br>
- Error number: 1192; Symbol: ER_LOCK_OR_ACTIVE_TRANSACTION; SQLSTATE: HY000

Message: Can't execute the given command because you have active locked tables or an active transaction

</br>
- Error number: 1193; Symbol: ER_UNKNOWN_SYSTEM_VARIABLE; SQLSTATE: HY000

Message: Unknown system variable '%s'

</br>
- Error number: 1194; Symbol: ER_CRASHED_ON_USAGE; SQLSTATE: HY000

Message: Table '%s' is marked as crashed and should be repaired

</br>
- Error number: 1195; Symbol: ER_CRASHED_ON_REPAIR; SQLSTATE: HY000

Message: Table '%s' is marked as crashed and last (automatic?) repair failed

</br>
- Error number: 1196; Symbol: ER_WARNING_NOT_COMPLETE_ROLLBACK; SQLSTATE: HY000

Message: Some non-transactional changed tables couldn't be rolled back

</br>
- Error number: 1197; Symbol: ER_TRANS_CACHE_FULL; SQLSTATE: HY000

Message: Multi-statement transaction required more than 'max_binlog_cache_size' bytes of storage; increase this mysqld variable and try again

</br>
- Error number: 1199; Symbol: ER_SLAVE_NOT_RUNNING; SQLSTATE: HY000

Message: This operation requires a running slave; configure slave and do START SLAVE

ER_SLAVE_NOT_RUNNING was removed after 8.0.32.

</br>
- Error number: 1200; Symbol: ER_BAD_SLAVE; SQLSTATE: HY000

Message: The server is not configured as slave; fix in config file or with CHANGE MASTER TO

ER_BAD_SLAVE was removed after 8.0.32.

</br>
- Error number: 1201; Symbol: ER_MASTER_INFO; SQLSTATE: HY000

Message: Could not initialize master info structure; more error messages can be found in the MySQL error log

ER_MASTER_INFO was removed after 8.0.32.

</br>
- Error number: 1202; Symbol: ER_SLAVE_THREAD; SQLSTATE: HY000

Message: Could not create slave thread; check system resources

ER_SLAVE_THREAD was removed after 8.0.32.

</br>
- Error number: 1203; Symbol: ER_TOO_MANY_USER_CONNECTIONS; SQLSTATE: 42000

Message: User %s already has more than 'max_user_connections' active connections

</br>
- Error number: 1204; Symbol: ER_SET_CONSTANTS_ONLY; SQLSTATE: HY000

Message: You may only use constant expressions with SET

</br>
- Error number: 1205; Symbol: ER_LOCK_WAIT_TIMEOUT; SQLSTATE: HY000

Message: Lock wait timeout exceeded; try restarting transaction

InnoDB reports this error when lock wait timeout expires. The statement that waited too long was rolled back (not the entire transaction). You can increase the value of the innodb_lock_wait_timeout configuration option if SQL statements should wait longer for other transactions to complete, or decrease it if too many long-running transactions are causing locking problems and reducing concurrency on a busy system.

</br>
- Error number: 1206; Symbol: ER_LOCK_TABLE_FULL; SQLSTATE: HY000

Message: The total number of locks exceeds the lock table size

InnoDB reports this error when the total number of locks exceeds the amount of memory devoted to managing locks. To avoid this error, increase the value of innodb_buffer_pool_size. Within an individual application, a workaround may be to break a large operation into smaller pieces. For example, if the error occurs for a large INSERT, perform several smaller INSERT operations.

</br>
- Error number: 1207; Symbol: ER_READ_ONLY_TRANSACTION; SQLSTATE: 25000

Message: Update locks cannot be acquired during a READ UNCOMMITTED transaction

</br>
- Error number: 1210; Symbol: ER_WRONG_ARGUMENTS; SQLSTATE: HY000

Message: Incorrect arguments to %s

</br>
- Error number: 1211; Symbol: ER_NO_PERMISSION_TO_CREATE_USER; SQLSTATE: 42000

Message: '%s'@'%s' is not allowed to create new users

</br>
- Error number: 1213; Symbol: ER_LOCK_DEADLOCK; SQLSTATE: 40001

Message: Deadlock found when trying to get lock; try restarting transaction

InnoDB reports this error when a transaction encounters a deadlock and is automatically rolled back so that your application can take corrective action. To recover from this error, run all the operations in this transaction again. A deadlock occurs when requests for locks arrive in inconsistent order between transactions. The transaction that was rolled back released all its locks, and the other transaction can now get all the locks it requested. Thus, when you re-run the transaction that was rolled back, it might have to wait for other transactions to complete, but typically the deadlock does not recur. If you encounter frequent deadlocks, make the sequence of locking operations (LOCK TABLES, SELECT ... FOR UPDATE, and so on) consistent between the different transactions or applications that experience the issue. See Deadlocks in InnoDB for details.

</br>
- Error number: 1214; Symbol: ER_TABLE_CANT_HANDLE_FT; SQLSTATE: HY000

Message: The used table type doesn't support FULLTEXT indexes

</br>
- Error number: 1215; Symbol: ER_CANNOT_ADD_FOREIGN; SQLSTATE: HY000

Message: Cannot add foreign key constraint

</br>
- Error number: 1216; Symbol: ER_NO_REFERENCED_ROW; SQLSTATE: 23000

Message: Cannot add or update a child row: a foreign key constraint fails

InnoDB reports this error when you try to add a row but there is no parent row, and a foreign key constraint fails. Add the parent row first.

</br>
- Error number: 1217; Symbol: ER_ROW_IS_REFERENCED; SQLSTATE: 23000

Message: Cannot delete or update a parent row: a foreign key constraint fails

InnoDB reports this error when you try to delete a parent row that has children, and a foreign key constraint fails. Delete the children first.

</br>
- Error number: 1218; Symbol: ER_CONNECT_TO_MASTER; SQLSTATE: 08S01

Message: Error connecting to master: %s

ER_CONNECT_TO_MASTER was removed after 8.0.32.

</br>
- Error number: 1220; Symbol: ER_ERROR_WHEN_EXECUTING_COMMAND; SQLSTATE: HY000

Message: Error when executing command %s: %s

</br>
- Error number: 1221; Symbol: ER_WRONG_USAGE; SQLSTATE: HY000

Message: Incorrect usage of %s and %s

</br>
- Error number: 1222; Symbol: ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT; SQLSTATE: 21000

Message: The used SELECT statements have a different number of columns

</br>
- Error number: 1223; Symbol: ER_CANT_UPDATE_WITH_READLOCK; SQLSTATE: HY000

Message: Can't execute the query because you have a conflicting read lock

</br>
- Error number: 1224; Symbol: ER_MIXING_NOT_ALLOWED; SQLSTATE: HY000

Message: Mixing of transactional and non-transactional tables is disabled

</br>
- Error number: 1225; Symbol: ER_DUP_ARGUMENT; SQLSTATE: HY000

Message: Option '%s' used twice in statement

</br>
- Error number: 1226; Symbol: ER_USER_LIMIT_REACHED; SQLSTATE: 42000

Message: User '%s' has exceeded the '%s' resource (current value: %ld)

</br>
- Error number: 1227; Symbol: ER_SPECIFIC_ACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: Access denied; you need (at least one of) the %s privilege(s) to perform this operation

</br>
- Error number: 1228; Symbol: ER_LOCAL_VARIABLE; SQLSTATE: HY000

Message: Variable '%s' is a SESSION variable and can't be used with SET GLOBAL

</br>
- Error number: 1229; Symbol: ER_GLOBAL_VARIABLE; SQLSTATE: HY000

Message: Variable '%s' is a GLOBAL variable and should be set with SET GLOBAL

</br>
- Error number: 1230; Symbol: ER_NO_DEFAULT; SQLSTATE: 42000

Message: Variable '%s' doesn't have a default value

</br>
- Error number: 1231; Symbol: ER_WRONG_VALUE_FOR_VAR; SQLSTATE: 42000

Message: Variable '%s' can't be set to the value of '%s'

</br>
- Error number: 1232; Symbol: ER_WRONG_TYPE_FOR_VAR; SQLSTATE: 42000

Message: Incorrect argument type to variable '%s'

</br>
- Error number: 1233; Symbol: ER_VAR_CANT_BE_READ; SQLSTATE: HY000

Message: Variable '%s' can only be set, not read

</br>
- Error number: 1234; Symbol: ER_CANT_USE_OPTION_HERE; SQLSTATE: 42000

Message: Incorrect usage/placement of '%s'

</br>
- Error number: 1235; Symbol: ER_NOT_SUPPORTED_YET; SQLSTATE: 42000

Message: This version of MySQL doesn't yet support '%s'

</br>
- Error number: 1236; Symbol: ER_MASTER_FATAL_ERROR_READING_BINLOG; SQLSTATE: HY000

Message: Got fatal error %d from master when reading data from binary log: '%s'

ER_MASTER_FATAL_ERROR_READING_BINLOG was removed after 8.0.32.

</br>
- Error number: 1237; Symbol: ER_SLAVE_IGNORED_TABLE; SQLSTATE: HY000

Message: Slave SQL thread ignored the query because of replicate-*-table rules

ER_SLAVE_IGNORED_TABLE was removed after 8.0.32.

</br>
- Error number: 1238; Symbol: ER_INCORRECT_GLOBAL_LOCAL_VAR; SQLSTATE: HY000

Message: Variable '%s' is a %s variable

</br>
- Error number: 1239; Symbol: ER_WRONG_FK_DEF; SQLSTATE: 42000

Message: Incorrect foreign key definition for '%s': %s

</br>
- Error number: 1240; Symbol: ER_KEY_REF_DO_NOT_MATCH_TABLE_REF; SQLSTATE: HY000

Message: Key reference and table reference don't match

</br>
- Error number: 1241; Symbol: ER_OPERAND_COLUMNS; SQLSTATE: 21000

Message: Operand should contain %d column(s)

</br>
- Error number: 1242; Symbol: ER_SUBQUERY_NO_1_ROW; SQLSTATE: 21000

Message: Subquery returns more than 1 row

</br>
- Error number: 1243; Symbol: ER_UNKNOWN_STMT_HANDLER; SQLSTATE: HY000

Message: Unknown prepared statement handler (%.*s) given to %s

</br>
- Error number: 1244; Symbol: ER_CORRUPT_HELP_DB; SQLSTATE: HY000

Message: Help database is corrupt or does not exist

</br>
- Error number: 1246; Symbol: ER_AUTO_CONVERT; SQLSTATE: HY000

Message: Converting column '%s' from %s to %s

</br>
- Error number: 1247; Symbol: ER_ILLEGAL_REFERENCE; SQLSTATE: 42S22

Message: Reference '%s' not supported (%s)

</br>
- Error number: 1248; Symbol: ER_DERIVED_MUST_HAVE_ALIAS; SQLSTATE: 42000

Message: Every derived table must have its own alias

</br>
- Error number: 1249; Symbol: ER_SELECT_REDUCED; SQLSTATE: 01000

Message: Select %u was reduced during optimization

</br>
- Error number: 1250; Symbol: ER_TABLENAME_NOT_ALLOWED_HERE; SQLSTATE: 42000

Message: Table '%s' from one of the SELECTs cannot be used in %s

</br>
- Error number: 1251; Symbol: ER_NOT_SUPPORTED_AUTH_MODE; SQLSTATE: 08004

Message: Client does not support authentication protocol requested by server; consider upgrading MySQL client

</br>
- Error number: 1252; Symbol: ER_SPATIAL_CANT_HAVE_NULL; SQLSTATE: 42000

Message: All parts of a SPATIAL index must be NOT NULL

</br>
- Error number: 1253; Symbol: ER_COLLATION_CHARSET_MISMATCH; SQLSTATE: 42000

Message: COLLATION '%s' is not valid for CHARACTER SET '%s'

</br>
- Error number: 1256; Symbol: ER_TOO_BIG_FOR_UNCOMPRESS; SQLSTATE: HY000

Message: Uncompressed data size too large; the maximum size is %d (probably, length of uncompressed data was corrupted)

</br>
- Error number: 1257; Symbol: ER_ZLIB_Z_MEM_ERROR; SQLSTATE: HY000

Message: ZLIB: Not enough memory

</br>
- Error number: 1258; Symbol: ER_ZLIB_Z_BUF_ERROR; SQLSTATE: HY000

Message: ZLIB: Not enough room in the output buffer (probably, length of uncompressed data was corrupted)

</br>
- Error number: 1259; Symbol: ER_ZLIB_Z_DATA_ERROR; SQLSTATE: HY000

Message: ZLIB: Input data corrupted

</br>
- Error number: 1260; Symbol: ER_CUT_VALUE_GROUP_CONCAT; SQLSTATE: HY000

Message: Row %u was cut by GROUP_CONCAT()

</br>
- Error number: 1261; Symbol: ER_WARN_TOO_FEW_RECORDS; SQLSTATE: 01000

Message: Row %ld doesn't contain data for all columns

</br>
- Error number: 1262; Symbol: ER_WARN_TOO_MANY_RECORDS; SQLSTATE: 01000

Message: Row %ld was truncated; it contained more data than there were input columns

</br>
- Error number: 1263; Symbol: ER_WARN_NULL_TO_NOTNULL; SQLSTATE: 22004

Message: Column set to default value; NULL supplied to NOT NULL column '%s' at row %ld

</br>
- Error number: 1264; Symbol: ER_WARN_DATA_OUT_OF_RANGE; SQLSTATE: 22003

Message: Out of range value for column '%s' at row %ld

</br>
- Error number: 1265; Symbol: WARN_DATA_TRUNCATED; SQLSTATE: 01000

Message: Data truncated for column '%s' at row %ld

</br>
- Error number: 1266; Symbol: ER_WARN_USING_OTHER_HANDLER; SQLSTATE: HY000

Message: Using storage engine %s for table '%s'

</br>
- Error number: 1267; Symbol: ER_CANT_AGGREGATE_2COLLATIONS; SQLSTATE: HY000

Message: Illegal mix of collations (%s,%s) and (%s,%s) for operation '%s'

</br>
- Error number: 1269; Symbol: ER_REVOKE_GRANTS; SQLSTATE: HY000

Message: Can't revoke all privileges for one or more of the requested users

</br>
- Error number: 1270; Symbol: ER_CANT_AGGREGATE_3COLLATIONS; SQLSTATE: HY000

Message: Illegal mix of collations (%s,%s), (%s,%s), (%s,%s) for operation '%s'

</br>
- Error number: 1271; Symbol: ER_CANT_AGGREGATE_NCOLLATIONS; SQLSTATE: HY000

Message: Illegal mix of collations for operation '%s'

</br>
- Error number: 1272; Symbol: ER_VARIABLE_IS_NOT_STRUCT; SQLSTATE: HY000

Message: Variable '%s' is not a variable component (can't be used as XXXX.variable_name)

</br>
- Error number: 1273; Symbol: ER_UNKNOWN_COLLATION; SQLSTATE: HY000

Message: Unknown collation: '%s'

</br>
- Error number: 1274; Symbol: ER_SLAVE_IGNORED_SSL_PARAMS; SQLSTATE: HY000

Message: SSL parameters in CHANGE MASTER are ignored because this MySQL slave was compiled without SSL support; they can be used later if MySQL slave with SSL is started

ER_SLAVE_IGNORED_SSL_PARAMS was removed after 8.0.32.

</br>
- Error number: 1275; Symbol: ER_SERVER_IS_IN_SECURE_AUTH_MODE; SQLSTATE: HY000

Message: Server is running in --secure-auth mode, but '%s'@'%s' has a password in the old format; please change the password to the new format

ER_SERVER_IS_IN_SECURE_AUTH_MODE was removed after 8.0.15.

</br>
- Error number: 1276; Symbol: ER_WARN_FIELD_RESOLVED; SQLSTATE: HY000

Message: Field or reference '%s%s%s%s%s' of SELECT #%d was resolved in SELECT #%d

</br>
- Error number: 1277; Symbol: ER_BAD_SLAVE_UNTIL_COND; SQLSTATE: HY000

Message: Incorrect parameter or combination of parameters for START SLAVE UNTIL

ER_BAD_SLAVE_UNTIL_COND was removed after 8.0.32.

</br>
- Error number: 1278; Symbol: ER_MISSING_SKIP_SLAVE; SQLSTATE: HY000

Message: It is recommended to use --skip-replica-start when doing step-by-step replication with START SLAVE UNTIL; otherwise, you will get problems if you get an unexpected slave's mysqld restart

ER_MISSING_SKIP_SLAVE was removed after 8.0.32.

</br>
- Error number: 1279; Symbol: ER_UNTIL_COND_IGNORED; SQLSTATE: HY000

Message: SQL thread is not to be started so UNTIL options are ignored

</br>
- Error number: 1280; Symbol: ER_WRONG_NAME_FOR_INDEX; SQLSTATE: 42000

Message: Incorrect index name '%s'

</br>
- Error number: 1281; Symbol: ER_WRONG_NAME_FOR_CATALOG; SQLSTATE: 42000

Message: Incorrect catalog name '%s'

</br>
- Error number: 1282; Symbol: ER_WARN_QC_RESIZE; SQLSTATE: HY000

Message: Query cache failed to set size %lu; new query cache size is %lu

ER_WARN_QC_RESIZE was removed after 8.0.2.

</br>
- Error number: 1283; Symbol: ER_BAD_FT_COLUMN; SQLSTATE: HY000

Message: Column '%s' cannot be part of FULLTEXT index

</br>
- Error number: 1284; Symbol: ER_UNKNOWN_KEY_CACHE; SQLSTATE: HY000

Message: Unknown key cache '%s'

</br>
- Error number: 1285; Symbol: ER_WARN_HOSTNAME_WONT_WORK; SQLSTATE: HY000

Message: MySQL is started in --skip-name-resolve mode; you must restart it without this switch for this grant to work

</br>
- Error number: 1286; Symbol: ER_UNKNOWN_STORAGE_ENGINE; SQLSTATE: 42000

Message: Unknown storage engine '%s'

</br>
- Error number: 1287; Symbol: ER_WARN_DEPRECATED_SYNTAX; SQLSTATE: HY000

Message: '%s' is deprecated and will be removed in a future release. Please use %s instead

</br>
- Error number: 1288; Symbol: ER_NON_UPDATABLE_TABLE; SQLSTATE: HY000

Message: The target table %s of the %s is not updatable

</br>
- Error number: 1289; Symbol: ER_FEATURE_DISABLED; SQLSTATE: HY000

Message: The '%s' feature is disabled; you need MySQL built with '%s' to have it working

</br>
- Error number: 1290; Symbol: ER_OPTION_PREVENTS_STATEMENT; SQLSTATE: HY000

Message: The MySQL server is running with the %s option so it cannot execute this statement

</br>
- Error number: 1291; Symbol: ER_DUPLICATED_VALUE_IN_TYPE; SQLSTATE: HY000

Message: Column '%s' has duplicated value '%s' in %s

</br>
- Error number: 1292; Symbol: ER_TRUNCATED_WRONG_VALUE; SQLSTATE: 22007

Message: Truncated incorrect %s value: '%s'

</br>
- Error number: 1294; Symbol: ER_INVALID_ON_UPDATE; SQLSTATE: HY000

Message: Invalid ON UPDATE clause for '%s' column

</br>
- Error number: 1295; Symbol: ER_UNSUPPORTED_PS; SQLSTATE: HY000

Message: This command is not supported in the prepared statement protocol yet

</br>
- Error number: 1296; Symbol: ER_GET_ERRMSG; SQLSTATE: HY000

Message: Got error %d '%s' from %s

</br>
- Error number: 1297; Symbol: ER_GET_TEMPORARY_ERRMSG; SQLSTATE: HY000

Message: Got temporary error %d '%s' from %s

</br>
- Error number: 1298; Symbol: ER_UNKNOWN_TIME_ZONE; SQLSTATE: HY000

Message: Unknown or incorrect time zone: '%s'

</br>
- Error number: 1299; Symbol: ER_WARN_INVALID_TIMESTAMP; SQLSTATE: HY000

Message: Invalid TIMESTAMP value in column '%s' at row %ld

</br>
- Error number: 1300; Symbol: ER_INVALID_CHARACTER_STRING; SQLSTATE: HY000

Message: Invalid %s character string: '%s'

</br>
- Error number: 1301; Symbol: ER_WARN_ALLOWED_PACKET_OVERFLOWED; SQLSTATE: HY000

Message: Result of %s() was larger than max_allowed_packet (%ld) - truncated

</br>
- Error number: 1302; Symbol: ER_CONFLICTING_DECLARATIONS; SQLSTATE: HY000

Message: Conflicting declarations: '%s%s' and '%s%s'

</br>
- Error number: 1303; Symbol: ER_SP_NO_RECURSIVE_CREATE; SQLSTATE: 2F003

Message: Can't create a %s from within another stored routine

</br>
- Error number: 1304; Symbol: ER_SP_ALREADY_EXISTS; SQLSTATE: 42000

Message: %s %s already exists

</br>
- Error number: 1305; Symbol: ER_SP_DOES_NOT_EXIST; SQLSTATE: 42000

Message: %s %s does not exist

</br>
- Error number: 1306; Symbol: ER_SP_DROP_FAILED; SQLSTATE: HY000

Message: Failed to DROP %s %s

</br>
- Error number: 1307; Symbol: ER_SP_STORE_FAILED; SQLSTATE: HY000

Message: Failed to CREATE %s %s

</br>
- Error number: 1308; Symbol: ER_SP_LILABEL_MISMATCH; SQLSTATE: 42000

Message: %s with no matching label: %s

</br>
- Error number: 1309; Symbol: ER_SP_LABEL_REDEFINE; SQLSTATE: 42000

Message: Redefining label %s

</br>
- Error number: 1310; Symbol: ER_SP_LABEL_MISMATCH; SQLSTATE: 42000

Message: End-label %s without match

</br>
- Error number: 1311; Symbol: ER_SP_UNINIT_VAR; SQLSTATE: 01000

Message: Referring to uninitialized variable %s

</br>
- Error number: 1312; Symbol: ER_SP_BADSELECT; SQLSTATE: 0A000

Message: PROCEDURE %s can't return a result set in the given context

</br>
- Error number: 1313; Symbol: ER_SP_BADRETURN; SQLSTATE: 42000

Message: RETURN is only allowed in a FUNCTION

</br>
- Error number: 1314; Symbol: ER_SP_BADSTATEMENT; SQLSTATE: 0A000

Message: %s is not allowed in stored procedures

</br>
- Error number: 1315; Symbol: ER_UPDATE_LOG_DEPRECATED_IGNORED; SQLSTATE: 42000

Message: The update log is deprecated and replaced by the binary log; SET SQL_LOG_UPDATE has been ignored.

</br>
- Error number: 1316; Symbol: ER_UPDATE_LOG_DEPRECATED_TRANSLATED; SQLSTATE: 42000

Message: The update log is deprecated and replaced by the binary log; SET SQL_LOG_UPDATE has been translated to SET SQL_LOG_BIN.

</br>
- Error number: 1317; Symbol: ER_QUERY_INTERRUPTED; SQLSTATE: 70100

Message: Query execution was interrupted

</br>
- Error number: 1318; Symbol: ER_SP_WRONG_NO_OF_ARGS; SQLSTATE: 42000

Message: Incorrect number of arguments for %s %s; expected %u, got %u

</br>
- Error number: 1319; Symbol: ER_SP_COND_MISMATCH; SQLSTATE: 42000

Message: Undefined CONDITION: %s

</br>
- Error number: 1320; Symbol: ER_SP_NORETURN; SQLSTATE: 42000

Message: No RETURN found in FUNCTION %s

</br>
- Error number: 1321; Symbol: ER_SP_NORETURNEND; SQLSTATE: 2F005

Message: FUNCTION %s ended without RETURN

</br>
- Error number: 1322; Symbol: ER_SP_BAD_CURSOR_QUERY; SQLSTATE: 42000

Message: Cursor statement must be a SELECT

</br>
- Error number: 1323; Symbol: ER_SP_BAD_CURSOR_SELECT; SQLSTATE: 42000

Message: Cursor SELECT must not have INTO

</br>
- Error number: 1324; Symbol: ER_SP_CURSOR_MISMATCH; SQLSTATE: 42000

Message: Undefined CURSOR: %s

</br>
- Error number: 1325; Symbol: ER_SP_CURSOR_ALREADY_OPEN; SQLSTATE: 24000

Message: Cursor is already open

</br>
- Error number: 1326; Symbol: ER_SP_CURSOR_NOT_OPEN; SQLSTATE: 24000

Message: Cursor is not open

</br>
- Error number: 1327; Symbol: ER_SP_UNDECLARED_VAR; SQLSTATE: 42000

Message: Undeclared variable: %s

</br>
- Error number: 1328; Symbol: ER_SP_WRONG_NO_OF_FETCH_ARGS; SQLSTATE: HY000

Message: Incorrect number of FETCH variables

</br>
- Error number: 1329; Symbol: ER_SP_FETCH_NO_DATA; SQLSTATE: 02000

Message: No data - zero rows fetched, selected, or processed

</br>
- Error number: 1330; Symbol: ER_SP_DUP_PARAM; SQLSTATE: 42000

Message: Duplicate parameter: %s

</br>
- Error number: 1331; Symbol: ER_SP_DUP_VAR; SQLSTATE: 42000

Message: Duplicate variable: %s

</br>
- Error number: 1332; Symbol: ER_SP_DUP_COND; SQLSTATE: 42000

Message: Duplicate condition: %s

</br>
- Error number: 1333; Symbol: ER_SP_DUP_CURS; SQLSTATE: 42000

Message: Duplicate cursor: %s

</br>
- Error number: 1334; Symbol: ER_SP_CANT_ALTER; SQLSTATE: HY000

Message: Failed to ALTER %s %s

</br>
- Error number: 1335; Symbol: ER_SP_SUBSELECT_NYI; SQLSTATE: 0A000

Message: Subquery value not supported

</br>
- Error number: 1336; Symbol: ER_STMT_NOT_ALLOWED_IN_SF_OR_TRG; SQLSTATE: 0A000

Message: %s is not allowed in stored function or trigger

</br>
- Error number: 1337; Symbol: ER_SP_VARCOND_AFTER_CURSHNDLR; SQLSTATE: 42000

Message: Variable or condition declaration after cursor or handler declaration

</br>
- Error number: 1338; Symbol: ER_SP_CURSOR_AFTER_HANDLER; SQLSTATE: 42000

Message: Cursor declaration after handler declaration

</br>
- Error number: 1339; Symbol: ER_SP_CASE_NOT_FOUND; SQLSTATE: 20000

Message: Case not found for CASE statement

</br>
- Error number: 1340; Symbol: ER_FPARSER_TOO_BIG_FILE; SQLSTATE: HY000

Message: Configuration file '%s' is too big

</br>
- Error number: 1341; Symbol: ER_FPARSER_BAD_HEADER; SQLSTATE: HY000

Message: Malformed file type header in file '%s'

</br>
- Error number: 1342; Symbol: ER_FPARSER_EOF_IN_COMMENT; SQLSTATE: HY000

Message: Unexpected end of file while parsing comment '%s'

</br>
- Error number: 1343; Symbol: ER_FPARSER_ERROR_IN_PARAMETER; SQLSTATE: HY000

Message: Error while parsing parameter '%s' (line: '%s')

</br>
- Error number: 1344; Symbol: ER_FPARSER_EOF_IN_UNKNOWN_PARAMETER; SQLSTATE: HY000

Message: Unexpected end of file while skipping unknown parameter '%s'

</br>
- Error number: 1345; Symbol: ER_VIEW_NO_EXPLAIN; SQLSTATE: HY000

Message: EXPLAIN/SHOW can not be issued; lacking privileges for underlying table

</br>
- Error number: 1347; Symbol: ER_WRONG_OBJECT; SQLSTATE: HY000

Message: '%s.%s' is not %s

The named object is incorrect for the type of operation attempted on it. It must be an object of the named type. Example: HANDLER OPEN requires a base table, not a view. It fails if attempted on an INFORMATION_SCHEMA table that is implemented as a view on data dictionary tables.

</br>
- Error number: 1348; Symbol: ER_NONUPDATEABLE_COLUMN; SQLSTATE: HY000

Message: Column '%s' is not updatable

</br>
- Error number: 1350; Symbol: ER_VIEW_SELECT_CLAUSE; SQLSTATE: HY000

Message: View's SELECT contains a '%s' clause

</br>
- Error number: 1351; Symbol: ER_VIEW_SELECT_VARIABLE; SQLSTATE: HY000

Message: View's SELECT contains a variable or parameter

</br>
- Error number: 1352; Symbol: ER_VIEW_SELECT_TMPTABLE; SQLSTATE: HY000

Message: View's SELECT refers to a temporary table '%s'

</br>
- Error number: 1353; Symbol: ER_VIEW_WRONG_LIST; SQLSTATE: HY000

Message: In definition of view, derived table or common table expression, SELECT list and column names list have different column counts

</br>
- Error number: 1354; Symbol: ER_WARN_VIEW_MERGE; SQLSTATE: HY000

Message: View merge algorithm can't be used here for now (assumed undefined algorithm)

</br>
- Error number: 1355; Symbol: ER_WARN_VIEW_WITHOUT_KEY; SQLSTATE: HY000

Message: View being updated does not have complete key of underlying table in it

</br>
- Error number: 1356; Symbol: ER_VIEW_INVALID; SQLSTATE: HY000

Message: View '%s.%s' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them

</br>
- Error number: 1357; Symbol: ER_SP_NO_DROP_SP; SQLSTATE: HY000

Message: Can't drop or alter a %s from within another stored routine

</br>
- Error number: 1359; Symbol: ER_TRG_ALREADY_EXISTS; SQLSTATE: HY000

Message: Trigger already exists

</br>
- Error number: 1360; Symbol: ER_TRG_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Trigger does not exist

</br>
- Error number: 1361; Symbol: ER_TRG_ON_VIEW_OR_TEMP_TABLE; SQLSTATE: HY000

Message: Trigger's '%s' is view or temporary table

</br>
- Error number: 1362; Symbol: ER_TRG_CANT_CHANGE_ROW; SQLSTATE: HY000

Message: Updating of %s row is not allowed in %strigger

</br>
- Error number: 1363; Symbol: ER_TRG_NO_SUCH_ROW_IN_TRG; SQLSTATE: HY000

Message: There is no %s row in %s trigger

</br>
- Error number: 1364; Symbol: ER_NO_DEFAULT_FOR_FIELD; SQLSTATE: HY000

Message: Field '%s' doesn't have a default value

</br>
- Error number: 1365; Symbol: ER_DIVISION_BY_ZERO; SQLSTATE: 22012

Message: Division by 0

</br>
- Error number: 1366; Symbol: ER_TRUNCATED_WRONG_VALUE_FOR_FIELD; SQLSTATE: HY000

Message: Incorrect %s value: '%s' for column '%s' at row %ld

</br>
- Error number: 1367; Symbol: ER_ILLEGAL_VALUE_FOR_TYPE; SQLSTATE: 22007

Message: Illegal %s '%s' value found during parsing

</br>
- Error number: 1368; Symbol: ER_VIEW_NONUPD_CHECK; SQLSTATE: HY000

Message: CHECK OPTION on non-updatable view '%s.%s'

</br>
- Error number: 1369; Symbol: ER_VIEW_CHECK_FAILED; SQLSTATE: HY000

Message: CHECK OPTION failed '%s.%s'

</br>
- Error number: 1370; Symbol: ER_PROCACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: %s command denied to user '%s'@'%s' for routine '%s'

</br>
- Error number: 1371; Symbol: ER_RELAY_LOG_FAIL; SQLSTATE: HY000

Message: Failed purging old relay logs: %s

</br>
- Error number: 1373; Symbol: ER_UNKNOWN_TARGET_BINLOG; SQLSTATE: HY000

Message: Target log not found in binlog index

</br>
- Error number: 1374; Symbol: ER_IO_ERR_LOG_INDEX_READ; SQLSTATE: HY000

Message: I/O error reading log index file

</br>
- Error number: 1375; Symbol: ER_BINLOG_PURGE_PROHIBITED; SQLSTATE: HY000

Message: Server configuration does not permit binlog purge

</br>
- Error number: 1376; Symbol: ER_FSEEK_FAIL; SQLSTATE: HY000

Message: Failed on fseek()

</br>
- Error number: 1377; Symbol: ER_BINLOG_PURGE_FATAL_ERR; SQLSTATE: HY000

Message: Fatal error during log purge

</br>
- Error number: 1378; Symbol: ER_LOG_IN_USE; SQLSTATE: HY000

Message: A purgeable log is in use, will not purge

</br>
- Error number: 1379; Symbol: ER_LOG_PURGE_UNKNOWN_ERR; SQLSTATE: HY000

Message: Unknown error during log purge

</br>
- Error number: 1380; Symbol: ER_RELAY_LOG_INIT; SQLSTATE: HY000

Message: Failed initializing relay log position: %s

</br>
- Error number: 1381; Symbol: ER_NO_BINARY_LOGGING; SQLSTATE: HY000

Message: You are not using binary logging

</br>
- Error number: 1382; Symbol: ER_RESERVED_SYNTAX; SQLSTATE: HY000

Message: The '%s' syntax is reserved for purposes internal to the MySQL server

</br>
- Error number: 1390; Symbol: ER_PS_MANY_PARAM; SQLSTATE: HY000

Message: Prepared statement contains too many placeholders

</br>
- Error number: 1391; Symbol: ER_KEY_PART_0; SQLSTATE: HY000

Message: Key part '%s' length cannot be 0

</br>
- Error number: 1392; Symbol: ER_VIEW_CHECKSUM; SQLSTATE: HY000

Message: View text checksum failed

</br>
- Error number: 1393; Symbol: ER_VIEW_MULTIUPDATE; SQLSTATE: HY000

Message: Can not modify more than one base table through a join view '%s.%s'

</br>
- Error number: 1394; Symbol: ER_VIEW_NO_INSERT_FIELD_LIST; SQLSTATE: HY000

Message: Can not insert into join view '%s.%s' without fields list

</br>
- Error number: 1395; Symbol: ER_VIEW_DELETE_MERGE_VIEW; SQLSTATE: HY000

Message: Can not delete from join view '%s.%s'

</br>
- Error number: 1396; Symbol: ER_CANNOT_USER; SQLSTATE: HY000

Message: Operation %s failed for %s

</br>
- Error number: 1397; Symbol: ER_XAER_NOTA; SQLSTATE: XAE04

Message: XAER_NOTA: Unknown XID

</br>
- Error number: 1398; Symbol: ER_XAER_INVAL; SQLSTATE: XAE05

Message: XAER_INVAL: Invalid arguments (or unsupported command)

</br>
- Error number: 1399; Symbol: ER_XAER_RMFAIL; SQLSTATE: XAE07

Message: XAER_RMFAIL: The command cannot be executed when global transaction is in the %s state

</br>
- Error number: 1400; Symbol: ER_XAER_OUTSIDE; SQLSTATE: XAE09

Message: XAER_OUTSIDE: Some work is done outside global transaction

</br>
- Error number: 1401; Symbol: ER_XAER_RMERR; SQLSTATE: XAE03

Message: XAER_RMERR: Fatal error occurred in the transaction branch - check your data for consistency

</br>
- Error number: 1402; Symbol: ER_XA_RBROLLBACK; SQLSTATE: XA100

Message: XA_RBROLLBACK: Transaction branch was rolled back

</br>
- Error number: 1403; Symbol: ER_NONEXISTING_PROC_GRANT; SQLSTATE: 42000

Message: There is no such grant defined for user '%s' on host '%s' on routine '%s'

</br>
- Error number: 1404; Symbol: ER_PROC_AUTO_GRANT_FAIL; SQLSTATE: HY000

Message: Failed to grant EXECUTE and ALTER ROUTINE privileges

</br>
- Error number: 1405; Symbol: ER_PROC_AUTO_REVOKE_FAIL; SQLSTATE: HY000

Message: Failed to revoke all privileges to dropped routine

</br>
- Error number: 1406; Symbol: ER_DATA_TOO_LONG; SQLSTATE: 22001

Message: Data too long for column '%s' at row %ld

</br>
- Error number: 1407; Symbol: ER_SP_BAD_SQLSTATE; SQLSTATE: 42000

Message: Bad SQLSTATE: '%s'

</br>
- Error number: 1408; Symbol: ER_STARTUP; SQLSTATE: HY000

Message: %s: ready for connections. Version: '%s' socket: '%s' port: %d %s

</br>
- Error number: 1409; Symbol: ER_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR; SQLSTATE: HY000

Message: Can't load value from file with fixed size rows to variable

</br>
- Error number: 1410; Symbol: ER_CANT_CREATE_USER_WITH_GRANT; SQLSTATE: 42000

Message: You are not allowed to create a user with GRANT

</br>
- Error number: 1411; Symbol: ER_WRONG_VALUE_FOR_TYPE; SQLSTATE: HY000

Message: Incorrect %s value: '%s' for function %s

</br>
- Error number: 1412; Symbol: ER_TABLE_DEF_CHANGED; SQLSTATE: HY000

Message: Table definition has changed, please retry transaction

</br>
- Error number: 1413; Symbol: ER_SP_DUP_HANDLER; SQLSTATE: 42000

Message: Duplicate handler declared in the same block

</br>
- Error number: 1414; Symbol: ER_SP_NOT_VAR_ARG; SQLSTATE: 42000

Message: OUT or INOUT argument %d for routine %s is not a variable or NEW pseudo-variable in BEFORE trigger

</br>
- Error number: 1415; Symbol: ER_SP_NO_RETSET; SQLSTATE: 0A000

Message: Not allowed to return a result set from a %s

</br>
- Error number: 1416; Symbol: ER_CANT_CREATE_GEOMETRY_OBJECT; SQLSTATE: 22003

Message: Cannot get geometry object from data you send to the GEOMETRY field

</br>
- Error number: 1418; Symbol: ER_BINLOG_UNSAFE_ROUTINE; SQLSTATE: HY000

Message: This function has none of DETERMINISTIC, NO SQL, or READS SQL DATA in its declaration and binary logging is enabled (you *might* want to use the less safe log_bin_trust_function_creators variable)

</br>
- Error number: 1419; Symbol: ER_BINLOG_CREATE_ROUTINE_NEED_SUPER; SQLSTATE: HY000

Message: You do not have the SUPER privilege and binary logging is enabled (you *might* want to use the less safe log_bin_trust_function_creators variable)

</br>
- Error number: 1421; Symbol: ER_STMT_HAS_NO_OPEN_CURSOR; SQLSTATE: HY000

Message: The statement (%lu) has no open cursor.

</br>
- Error number: 1422; Symbol: ER_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG; SQLSTATE: HY000

Message: Explicit or implicit commit is not allowed in stored function or trigger.

</br>
- Error number: 1423; Symbol: ER_NO_DEFAULT_FOR_VIEW_FIELD; SQLSTATE: HY000

Message: Field of view '%s.%s' underlying table doesn't have a default value

</br>
- Error number: 1424; Symbol: ER_SP_NO_RECURSION; SQLSTATE: HY000

Message: Recursive stored functions and triggers are not allowed.

</br>
- Error number: 1425; Symbol: ER_TOO_BIG_SCALE; SQLSTATE: 42000

Message: Too big scale %d specified for column '%s'. Maximum is %lu.

</br>
- Error number: 1426; Symbol: ER_TOO_BIG_PRECISION; SQLSTATE: 42000

Message: Too-big precision %d specified for '%s'. Maximum is %lu.

</br>
- Error number: 1427; Symbol: ER_M_BIGGER_THAN_D; SQLSTATE: 42000

Message: For float(M,D), double(M,D) or decimal(M,D), M must be >= D (column '%s').

</br>
- Error number: 1428; Symbol: ER_WRONG_LOCK_OF_SYSTEM_TABLE; SQLSTATE: HY000

Message: You can't combine write-locking of system tables with other tables or lock types

</br>
- Error number: 1429; Symbol: ER_CONNECT_TO_FOREIGN_DATA_SOURCE; SQLSTATE: HY000

Message: Unable to connect to foreign data source: %s

</br>
- Error number: 1430; Symbol: ER_QUERY_ON_FOREIGN_DATA_SOURCE; SQLSTATE: HY000

Message: There was a problem processing the query on the foreign data source. Data source error: %s

</br>
- Error number: 1431; Symbol: ER_FOREIGN_DATA_SOURCE_DOESNT_EXIST; SQLSTATE: HY000

Message: The foreign data source you are trying to reference does not exist. Data source error: %s

</br>
- Error number: 1432; Symbol: ER_FOREIGN_DATA_STRING_INVALID_CANT_CREATE; SQLSTATE: HY000

Message: Can't create federated table. The data source connection string '%s' is not in the correct format

</br>
- Error number: 1433; Symbol: ER_FOREIGN_DATA_STRING_INVALID; SQLSTATE: HY000

Message: The data source connection string '%s' is not in the correct format

</br>
- Error number: 1435; Symbol: ER_TRG_IN_WRONG_SCHEMA; SQLSTATE: HY000

Message: Trigger in wrong schema

</br>
- Error number: 1436; Symbol: ER_STACK_OVERRUN_NEED_MORE; SQLSTATE: HY000

Message: Thread stack overrun: %ld bytes used of a %ld byte stack, and %ld bytes needed. Use 'mysqld --thread_stack=#' to specify a bigger stack.

</br>
- Error number: 1437; Symbol: ER_TOO_LONG_BODY; SQLSTATE: 42000

Message: Routine body for '%s' is too long

</br>
- Error number: 1438; Symbol: ER_WARN_CANT_DROP_DEFAULT_KEYCACHE; SQLSTATE: HY000

Message: Cannot drop default keycache

</br>
- Error number: 1439; Symbol: ER_TOO_BIG_DISPLAYWIDTH; SQLSTATE: 42000

Message: Display width out of range for column '%s' (max = %lu)

</br>
- Error number: 1440; Symbol: ER_XAER_DUPID; SQLSTATE: XAE08

Message: XAER_DUPID: The XID already exists

</br>
- Error number: 1441; Symbol: ER_DATETIME_FUNCTION_OVERFLOW; SQLSTATE: 22008

Message: Datetime function: %s field overflow

</br>
- Error number: 1442; Symbol: ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG; SQLSTATE: HY000

Message: Can't update table '%s' in stored function/trigger because it is already used by statement which invoked this stored function/trigger.

</br>
- Error number: 1443; Symbol: ER_VIEW_PREVENT_UPDATE; SQLSTATE: HY000

Message: The definition of table '%s' prevents operation %s on table '%s'.

</br>
- Error number: 1444; Symbol: ER_PS_NO_RECURSION; SQLSTATE: HY000

Message: The prepared statement contains a stored routine call that refers to that same statement. It's not allowed to execute a prepared statement in such a recursive manner

</br>
- Error number: 1445; Symbol: ER_SP_CANT_SET_AUTOCOMMIT; SQLSTATE: HY000

Message: Not allowed to set autocommit from a stored function or trigger

</br>
- Error number: 1447; Symbol: ER_VIEW_FRM_NO_USER; SQLSTATE: HY000

Message: View '%s'.'%s' has no definer information (old table format). Current user is used as definer. Please recreate the view!

</br>
- Error number: 1448; Symbol: ER_VIEW_OTHER_USER; SQLSTATE: HY000

Message: You need the SUPER privilege for creation view with '%s'@'%s' definer

</br>
- Error number: 1449; Symbol: ER_NO_SUCH_USER; SQLSTATE: HY000

Message: The user specified as a definer ('%s'@'%s') does not exist

</br>
- Error number: 1450; Symbol: ER_FORBID_SCHEMA_CHANGE; SQLSTATE: HY000

Message: Changing schema from '%s' to '%s' is not allowed.

</br>
- Error number: 1451; Symbol: ER_ROW_IS_REFERENCED_2; SQLSTATE: 23000

Message: Cannot delete or update a parent row: a foreign key constraint fails (%s)

InnoDB reports this error when you try to delete a parent row that has children, and a foreign key constraint fails. Delete the children first.

</br>
- Error number: 1452; Symbol: ER_NO_REFERENCED_ROW_2; SQLSTATE: 23000

Message: Cannot add or update a child row: a foreign key constraint fails (%s)

InnoDB reports this error when you try to add a row but there is no parent row, and a foreign key constraint fails. Add the parent row first.

</br>
- Error number: 1453; Symbol: ER_SP_BAD_VAR_SHADOW; SQLSTATE: 42000

Message: Variable '%s' must be quoted with `...`, or renamed

</br>
- Error number: 1454; Symbol: ER_TRG_NO_DEFINER; SQLSTATE: HY000

Message: No definer attribute for trigger '%s'.'%s'. It's disallowed to create trigger without definer.

</br>
- Error number: 1455; Symbol: ER_OLD_FILE_FORMAT; SQLSTATE: HY000

Message: '%s' has an old format, you should re-create the '%s' object(s)

</br>
- Error number: 1456; Symbol: ER_SP_RECURSION_LIMIT; SQLSTATE: HY000

Message: Recursive limit %d (as set by the max_sp_recursion_depth variable) was exceeded for routine %s

</br>
- Error number: 1458; Symbol: ER_SP_WRONG_NAME; SQLSTATE: 42000

Message: Incorrect routine name '%s'

</br>
- Error number: 1459; Symbol: ER_TABLE_NEEDS_UPGRADE; SQLSTATE: HY000

Message: Table upgrade required. Please do "REPAIR TABLE `%s`" or dump/reload to fix it!

</br>
- Error number: 1460; Symbol: ER_SP_NO_AGGREGATE; SQLSTATE: 42000

Message: AGGREGATE is not supported for stored functions

</br>
- Error number: 1461; Symbol: ER_MAX_PREPARED_STMT_COUNT_REACHED; SQLSTATE: 42000

Message: Can't create more than max_prepared_stmt_count statements (current value: %lu)

</br>
- Error number: 1462; Symbol: ER_VIEW_RECURSIVE; SQLSTATE: HY000

Message: `%s`.`%s` contains view recursion

</br>
- Error number: 1463; Symbol: ER_NON_GROUPING_FIELD_USED; SQLSTATE: 42000

Message: Non-grouping field '%s' is used in %s clause

</br>
- Error number: 1464; Symbol: ER_TABLE_CANT_HANDLE_SPKEYS; SQLSTATE: HY000

Message: The used table type doesn't support SPATIAL indexes

</br>
- Error number: 1465; Symbol: ER_NO_TRIGGERS_ON_SYSTEM_SCHEMA; SQLSTATE: HY000

Message: Triggers can not be created on system tables

</br>
- Error number: 1466; Symbol: ER_REMOVED_SPACES; SQLSTATE: HY000

Message: Leading spaces are removed from name '%s'

</br>
- Error number: 1467; Symbol: ER_AUTOINC_READ_FAILED; SQLSTATE: HY000

Message: Failed to read auto-increment value from storage engine

</br>
- Error number: 1468; Symbol: ER_USERNAME; SQLSTATE: HY000

Message: user name

</br>
- Error number: 1469; Symbol: ER_HOSTNAME; SQLSTATE: HY000

Message: host name

</br>
- Error number: 1470; Symbol: ER_WRONG_STRING_LENGTH; SQLSTATE: HY000

Message: String '%s' is too long for %s (should be no longer than %d)

</br>
- Error number: 1471; Symbol: ER_NON_INSERTABLE_TABLE; SQLSTATE: HY000

Message: The target table %s of the %s is not insertable-into

</br>
- Error number: 1472; Symbol: ER_ADMIN_WRONG_MRG_TABLE; SQLSTATE: HY000

Message: Table '%s' is differently defined or of non-MyISAM type or doesn't exist

</br>
- Error number: 1473; Symbol: ER_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT; SQLSTATE: HY000

Message: Too high level of nesting for select

</br>
- Error number: 1474; Symbol: ER_NAME_BECOMES_EMPTY; SQLSTATE: HY000

Message: Name '%s' has become ''

</br>
- Error number: 1475; Symbol: ER_AMBIGUOUS_FIELD_TERM; SQLSTATE: HY000

Message: First character of the FIELDS TERMINATED string is ambiguous; please use non-optional and non-empty FIELDS ENCLOSED BY

</br>
- Error number: 1476; Symbol: ER_FOREIGN_SERVER_EXISTS; SQLSTATE: HY000

Message: The foreign server, %s, you are trying to create already exists.

</br>
- Error number: 1477; Symbol: ER_FOREIGN_SERVER_DOESNT_EXIST; SQLSTATE: HY000

Message: The foreign server name you are trying to reference does not exist. Data source error: %s

</br>
- Error number: 1478; Symbol: ER_ILLEGAL_HA_CREATE_OPTION; SQLSTATE: HY000

Message: Table storage engine '%s' does not support the create option '%s'

</br>
- Error number: 1479; Symbol: ER_PARTITION_REQUIRES_VALUES_ERROR; SQLSTATE: HY000

Message: Syntax error: %s PARTITIONING requires definition of VALUES %s for each partition

</br>
- Error number: 1480; Symbol: ER_PARTITION_WRONG_VALUES_ERROR; SQLSTATE: HY000

Message: Only %s PARTITIONING can use VALUES %s in partition definition

</br>
- Error number: 1481; Symbol: ER_PARTITION_MAXVALUE_ERROR; SQLSTATE: HY000

Message: MAXVALUE can only be used in last partition definition

</br>
- Error number: 1484; Symbol: ER_PARTITION_WRONG_NO_PART_ERROR; SQLSTATE: HY000

Message: Wrong number of partitions defined, mismatch with previous setting

</br>
- Error number: 1485; Symbol: ER_PARTITION_WRONG_NO_SUBPART_ERROR; SQLSTATE: HY000

Message: Wrong number of subpartitions defined, mismatch with previous setting

</br>
- Error number: 1486; Symbol: ER_WRONG_EXPR_IN_PARTITION_FUNC_ERROR; SQLSTATE: HY000

Message: Constant, random or timezone-dependent expressions in (sub)partitioning function are not allowed

</br>
- Error number: 1488; Symbol: ER_FIELD_NOT_FOUND_PART_ERROR; SQLSTATE: HY000

Message: Field in list of fields for partition function not found in table

</br>
- Error number: 1490; Symbol: ER_INCONSISTENT_PARTITION_INFO_ERROR; SQLSTATE: HY000

Message: The partition info in the frm file is not consistent with what can be written into the frm file

</br>
- Error number: 1491; Symbol: ER_PARTITION_FUNC_NOT_ALLOWED_ERROR; SQLSTATE: HY000

Message: The %s function returns the wrong type

</br>
- Error number: 1492; Symbol: ER_PARTITIONS_MUST_BE_DEFINED_ERROR; SQLSTATE: HY000

Message: For %s partitions each partition must be defined

</br>
- Error number: 1493; Symbol: ER_RANGE_NOT_INCREASING_ERROR; SQLSTATE: HY000

Message: VALUES LESS THAN value must be strictly increasing for each partition

</br>
- Error number: 1494; Symbol: ER_INCONSISTENT_TYPE_OF_FUNCTIONS_ERROR; SQLSTATE: HY000

Message: VALUES value must be of same type as partition function

</br>
- Error number: 1495; Symbol: ER_MULTIPLE_DEF_CONST_IN_LIST_PART_ERROR; SQLSTATE: HY000

Message: Multiple definition of same constant in list partitioning

</br>
- Error number: 1496; Symbol: ER_PARTITION_ENTRY_ERROR; SQLSTATE: HY000

Message: Partitioning can not be used stand-alone in query

</br>
- Error number: 1497; Symbol: ER_MIX_HANDLER_ERROR; SQLSTATE: HY000

Message: The mix of handlers in the partitions is not allowed in this version of MySQL

</br>
- Error number: 1498; Symbol: ER_PARTITION_NOT_DEFINED_ERROR; SQLSTATE: HY000

Message: For the partitioned engine it is necessary to define all %s

</br>
- Error number: 1499; Symbol: ER_TOO_MANY_PARTITIONS_ERROR; SQLSTATE: HY000

Message: Too many partitions (including subpartitions) were defined

</br>
- Error number: 1500; Symbol: ER_SUBPARTITION_ERROR; SQLSTATE: HY000

Message: It is only possible to mix RANGE/LIST partitioning with HASH/KEY partitioning for subpartitioning

</br>
- Error number: 1501; Symbol: ER_CANT_CREATE_HANDLER_FILE; SQLSTATE: HY000

Message: Failed to create specific handler file

</br>
- Error number: 1502; Symbol: ER_BLOB_FIELD_IN_PART_FUNC_ERROR; SQLSTATE: HY000

Message: A BLOB field is not allowed in partition function

</br>
- Error number: 1503; Symbol: ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF; SQLSTATE: HY000

Message: A %s must include all columns in the table's partitioning function (prefixed columns are not considered).

</br>
- Error number: 1504; Symbol: ER_NO_PARTS_ERROR; SQLSTATE: HY000

Message: Number of %s = 0 is not an allowed value

</br>
- Error number: 1505; Symbol: ER_PARTITION_MGMT_ON_NONPARTITIONED; SQLSTATE: HY000

Message: Partition management on a not partitioned table is not possible

</br>
- Error number: 1506; Symbol: ER_FOREIGN_KEY_ON_PARTITIONED; SQLSTATE: HY000

Message: Foreign keys are not yet supported in conjunction with partitioning

</br>
- Error number: 1507; Symbol: ER_DROP_PARTITION_NON_EXISTENT; SQLSTATE: HY000

Message: Error in list of partitions to %s

</br>
- Error number: 1508; Symbol: ER_DROP_LAST_PARTITION; SQLSTATE: HY000

Message: Cannot remove all partitions, use DROP TABLE instead

</br>
- Error number: 1509; Symbol: ER_COALESCE_ONLY_ON_HASH_PARTITION; SQLSTATE: HY000

Message: COALESCE PARTITION can only be used on HASH/KEY partitions

</br>
- Error number: 1510; Symbol: ER_REORG_HASH_ONLY_ON_SAME_NO; SQLSTATE: HY000

Message: REORGANIZE PARTITION can only be used to reorganize partitions not to change their numbers

</br>
- Error number: 1511; Symbol: ER_REORG_NO_PARAM_ERROR; SQLSTATE: HY000

Message: REORGANIZE PARTITION without parameters can only be used on auto-partitioned tables using HASH PARTITIONs

</br>
- Error number: 1512; Symbol: ER_ONLY_ON_RANGE_LIST_PARTITION; SQLSTATE: HY000

Message: %s PARTITION can only be used on RANGE/LIST partitions

</br>
- Error number: 1513; Symbol: ER_ADD_PARTITION_SUBPART_ERROR; SQLSTATE: HY000

Message: Trying to Add partition(s) with wrong number of subpartitions

</br>
- Error number: 1514; Symbol: ER_ADD_PARTITION_NO_NEW_PARTITION; SQLSTATE: HY000

Message: At least one partition must be added

</br>
- Error number: 1515; Symbol: ER_COALESCE_PARTITION_NO_PARTITION; SQLSTATE: HY000

Message: At least one partition must be coalesced

</br>
- Error number: 1516; Symbol: ER_REORG_PARTITION_NOT_EXIST; SQLSTATE: HY000

Message: More partitions to reorganize than there are partitions

</br>
- Error number: 1517; Symbol: ER_SAME_NAME_PARTITION; SQLSTATE: HY000

Message: Duplicate partition name %s

</br>
- Error number: 1518; Symbol: ER_NO_BINLOG_ERROR; SQLSTATE: HY000

Message: It is not allowed to shut off binlog on this command

</br>
- Error number: 1519; Symbol: ER_CONSECUTIVE_REORG_PARTITIONS; SQLSTATE: HY000

Message: When reorganizing a set of partitions they must be in consecutive order

</br>
- Error number: 1520; Symbol: ER_REORG_OUTSIDE_RANGE; SQLSTATE: HY000

Message: Reorganize of range partitions cannot change total ranges except for last partition where it can extend the range

</br>
- Error number: 1521; Symbol: ER_PARTITION_FUNCTION_FAILURE; SQLSTATE: HY000

Message: Partition function not supported in this version for this handler

</br>
- Error number: 1523; Symbol: ER_LIMITED_PART_RANGE; SQLSTATE: HY000

Message: The %s handler only supports 32 bit integers in VALUES

</br>
- Error number: 1524; Symbol: ER_PLUGIN_IS_NOT_LOADED; SQLSTATE: HY000

Message: Plugin '%s' is not loaded

</br>
- Error number: 1525; Symbol: ER_WRONG_VALUE; SQLSTATE: HY000

Message: Incorrect %s value: '%s'

</br>
- Error number: 1526; Symbol: ER_NO_PARTITION_FOR_GIVEN_VALUE; SQLSTATE: HY000

Message: Table has no partition for value %s

</br>
- Error number: 1527; Symbol: ER_FILEGROUP_OPTION_ONLY_ONCE; SQLSTATE: HY000

Message: It is not allowed to specify %s more than once

</br>
- Error number: 1528; Symbol: ER_CREATE_FILEGROUP_FAILED; SQLSTATE: HY000

Message: Failed to create %s

</br>
- Error number: 1529; Symbol: ER_DROP_FILEGROUP_FAILED; SQLSTATE: HY000

Message: Failed to drop %s

</br>
- Error number: 1530; Symbol: ER_TABLESPACE_AUTO_EXTEND_ERROR; SQLSTATE: HY000

Message: The handler doesn't support autoextend of tablespaces

</br>
- Error number: 1531; Symbol: ER_WRONG_SIZE_NUMBER; SQLSTATE: HY000

Message: A size parameter was incorrectly specified, either number or on the form 10M

</br>
- Error number: 1532; Symbol: ER_SIZE_OVERFLOW_ERROR; SQLSTATE: HY000

Message: The size number was correct but we don't allow the digit part to be more than 2 billion

</br>
- Error number: 1533; Symbol: ER_ALTER_FILEGROUP_FAILED; SQLSTATE: HY000

Message: Failed to alter: %s

</br>
- Error number: 1534; Symbol: ER_BINLOG_ROW_LOGGING_FAILED; SQLSTATE: HY000

Message: Writing one row to the row-based binary log failed

</br>
- Error number: 1537; Symbol: ER_EVENT_ALREADY_EXISTS; SQLSTATE: HY000

Message: Event '%s' already exists

</br>
- Error number: 1539; Symbol: ER_EVENT_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Unknown event '%s'

</br>
- Error number: 1542; Symbol: ER_EVENT_INTERVAL_NOT_POSITIVE_OR_TOO_BIG; SQLSTATE: HY000

Message: INTERVAL is either not positive or too big

</br>
- Error number: 1543; Symbol: ER_EVENT_ENDS_BEFORE_STARTS; SQLSTATE: HY000

Message: ENDS is either invalid or before STARTS

</br>
- Error number: 1544; Symbol: ER_EVENT_EXEC_TIME_IN_THE_PAST; SQLSTATE: HY000

Message: Event execution time is in the past. Event has been disabled

</br>
- Error number: 1551; Symbol: ER_EVENT_SAME_NAME; SQLSTATE: HY000

Message: Same old and new event name

</br>
- Error number: 1553; Symbol: ER_DROP_INDEX_FK; SQLSTATE: HY000

Message: Cannot drop index '%s': needed in a foreign key constraint

InnoDB reports this error when you attempt to drop the last index that can enforce a particular referential constraint.
For optimal performance with DML statements, InnoDB requires an index to exist on foreign key columns, so that UPDATE and DELETE operations on a parent table can easily check whether corresponding rows exist in the child table. MySQL creates or drops such indexes automatically when needed, as a side-effect of CREATE TABLE, CREATE INDEX, and ALTER TABLE statements.
When you drop an index, InnoDB checks if the index is used for checking a foreign key constraint. It is still OK to drop the index if there is another index that can be used to enforce the same constraint. InnoDB prevents you from dropping the last index that can enforce a particular referential constraint.

</br>
- Error number: 1554; Symbol: ER_WARN_DEPRECATED_SYNTAX_WITH_VER; SQLSTATE: HY000

Message: The syntax '%s' is deprecated and will be removed in MySQL %s. Please use %s instead

</br>
- Error number: 1556; Symbol: ER_CANT_LOCK_LOG_TABLE; SQLSTATE: HY000

Message: You can't use locks with log tables.

</br>
- Error number: 1557; Symbol: ER_FOREIGN_DUPLICATE_KEY_OLD_UNUSED; SQLSTATE: 23000

Message: Upholding foreign key constraints for table '%s', entry '%s', key %d would lead to a duplicate entry

</br>
- Error number: 1558; Symbol: ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE; SQLSTATE: HY000

Message: The column count of mysql.%s is wrong. Expected %d, found %d. Created with MySQL %d, now running %d. Please perform the MySQL upgrade procedure.

</br>
- Error number: 1559; Symbol: ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR; SQLSTATE: HY000

Message: Cannot switch out of the row-based binary log format when the session has open temporary tables

ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR was removed after 8.0.12.

</br>
- Error number: 1560; Symbol: ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_FORMAT; SQLSTATE: HY000

Message: Cannot change the binary logging format inside a stored function or trigger

</br>
- Error number: 1562; Symbol: ER_PARTITION_NO_TEMPORARY; SQLSTATE: HY000

Message: Cannot create temporary table with partitions

</br>
- Error number: 1563; Symbol: ER_PARTITION_CONST_DOMAIN_ERROR; SQLSTATE: HY000

Message: Partition constant is out of partition function domain

</br>
- Error number: 1564; Symbol: ER_PARTITION_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: This partition function is not allowed

</br>
- Error number: 1565; Symbol: ER_DDL_LOG_ERROR; SQLSTATE: HY000

Message: Error in DDL log

ER_DDL_LOG_ERROR was removed after 8.0.1.

</br>
- Error number: 1566; Symbol: ER_NULL_IN_VALUES_LESS_THAN; SQLSTATE: HY000

Message: Not allowed to use NULL value in VALUES LESS THAN

</br>
- Error number: 1567; Symbol: ER_WRONG_PARTITION_NAME; SQLSTATE: HY000

Message: Incorrect partition name

</br>
- Error number: 1568; Symbol: ER_CANT_CHANGE_TX_CHARACTERISTICS; SQLSTATE: 25001

Message: Transaction characteristics can't be changed while a transaction is in progress

</br>
- Error number: 1569; Symbol: ER_DUP_ENTRY_AUTOINCREMENT_CASE; SQLSTATE: HY000

Message: ALTER TABLE causes auto_increment resequencing, resulting in duplicate entry '%s' for key '%s'

</br>
- Error number: 1571; Symbol: ER_EVENT_SET_VAR_ERROR; SQLSTATE: HY000

Message: Error during starting/stopping of the scheduler. Error code %u

</br>
- Error number: 1572; Symbol: ER_PARTITION_MERGE_ERROR; SQLSTATE: HY000

Message: Engine cannot be used in partitioned tables

</br>
- Error number: 1575; Symbol: ER_BASE64_DECODE_ERROR; SQLSTATE: HY000

Message: Decoding of base64 string failed

</br>
- Error number: 1576; Symbol: ER_EVENT_RECURSION_FORBIDDEN; SQLSTATE: HY000

Message: Recursion of EVENT DDL statements is forbidden when body is present

</br>
- Error number: 1578; Symbol: ER_ONLY_INTEGERS_ALLOWED; SQLSTATE: HY000

Message: Only integers allowed as number here

</br>
- Error number: 1579; Symbol: ER_UNSUPORTED_LOG_ENGINE; SQLSTATE: HY000

Message: This storage engine cannot be used for log tables

</br>
- Error number: 1580; Symbol: ER_BAD_LOG_STATEMENT; SQLSTATE: HY000

Message: You cannot '%s' a log table if logging is enabled

</br>
- Error number: 1581; Symbol: ER_CANT_RENAME_LOG_TABLE; SQLSTATE: HY000

Message: Cannot rename '%s'. When logging enabled, rename to/from log table must rename two tables: the log table to an archive table and another table back to '%s'

</br>
- Error number: 1582; Symbol: ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT; SQLSTATE: 42000

Message: Incorrect parameter count in the call to native function '%s'

</br>
- Error number: 1583; Symbol: ER_WRONG_PARAMETERS_TO_NATIVE_FCT; SQLSTATE: 42000

Message: Incorrect parameters in the call to native function '%s'

</br>
- Error number: 1584; Symbol: ER_WRONG_PARAMETERS_TO_STORED_FCT; SQLSTATE: 42000

Message: Incorrect parameters in the call to stored function %s

</br>
- Error number: 1585; Symbol: ER_NATIVE_FCT_NAME_COLLISION; SQLSTATE: HY000

Message: This function '%s' has the same name as a native function

</br>
- Error number: 1586; Symbol: ER_DUP_ENTRY_WITH_KEY_NAME; SQLSTATE: 23000

Message: Duplicate entry '%s' for key '%s'

The format string for this error is also used with ER_DUP_ENTRY.

</br>
- Error number: 1587; Symbol: ER_BINLOG_PURGE_EMFILE; SQLSTATE: HY000

Message: Too many files opened, please execute the command again

</br>
- Error number: 1588; Symbol: ER_EVENT_CANNOT_CREATE_IN_THE_PAST; SQLSTATE: HY000

Message: Event execution time is in the past and ON COMPLETION NOT PRESERVE is set. The event was dropped immediately after creation.

</br>
- Error number: 1589; Symbol: ER_EVENT_CANNOT_ALTER_IN_THE_PAST; SQLSTATE: HY000

Message: Event execution time is in the past and ON COMPLETION NOT PRESERVE is set. The event was not changed. Specify a time in the future.

</br>
- Error number: 1591; Symbol: ER_NO_PARTITION_FOR_GIVEN_VALUE_SILENT; SQLSTATE: HY000

Message: Table has no partition for some existing values

</br>
- Error number: 1592; Symbol: ER_BINLOG_UNSAFE_STATEMENT; SQLSTATE: HY000

Message: Unsafe statement written to the binary log using statement format since BINLOG_FORMAT = STATEMENT. %s

</br>
- Error number: 1593; Symbol: ER_BINLOG_FATAL_ERROR; SQLSTATE: HY000

Message: Fatal error: %s

ER_BINLOG_FATAL_ERROR was added in 8.0.11.

</br>
- Error number: 1598; Symbol: ER_BINLOG_LOGGING_IMPOSSIBLE; SQLSTATE: HY000

Message: Binary logging not possible. Message: %s

</br>
- Error number: 1599; Symbol: ER_VIEW_NO_CREATION_CTX; SQLSTATE: HY000

Message: View `%s`.`%s` has no creation context

</br>
- Error number: 1600; Symbol: ER_VIEW_INVALID_CREATION_CTX; SQLSTATE: HY000

Message: Creation context of view `%s`.`%s' is invalid

</br>
- Error number: 1602; Symbol: ER_TRG_CORRUPTED_FILE; SQLSTATE: HY000

Message: Corrupted TRG file for table `%s`.`%s`

</br>
- Error number: 1603; Symbol: ER_TRG_NO_CREATION_CTX; SQLSTATE: HY000

Message: Triggers for table `%s`.`%s` have no creation context

</br>
- Error number: 1604; Symbol: ER_TRG_INVALID_CREATION_CTX; SQLSTATE: HY000

Message: Trigger creation context of table `%s`.`%s` is invalid

</br>
- Error number: 1605; Symbol: ER_EVENT_INVALID_CREATION_CTX; SQLSTATE: HY000

Message: Creation context of event `%s`.`%s` is invalid

</br>
- Error number: 1606; Symbol: ER_TRG_CANT_OPEN_TABLE; SQLSTATE: HY000

Message: Cannot open table for trigger `%s`.`%s`

</br>
- Error number: 1609; Symbol: ER_NO_FORMAT_DESCRIPTION_EVENT_BEFORE_BINLOG_STATEMENT; SQLSTATE: HY000

Message: The BINLOG statement of type `%s` was not preceded by a format description BINLOG statement.

</br>
- Error number: 1610; Symbol: ER_SLAVE_CORRUPT_EVENT; SQLSTATE: HY000

Message: Corrupted replication event was detected

ER_SLAVE_CORRUPT_EVENT was removed after 8.0.32.

</br>
- Error number: 1612; Symbol: ER_LOG_PURGE_NO_FILE; SQLSTATE: HY000

Message: Being purged log %s was not found

</br>
- Error number: 1613; Symbol: ER_XA_RBTIMEOUT; SQLSTATE: XA106

Message: XA_RBTIMEOUT: Transaction branch was rolled back: took too long

</br>
- Error number: 1614; Symbol: ER_XA_RBDEADLOCK; SQLSTATE: XA102

Message: XA_RBDEADLOCK: Transaction branch was rolled back: deadlock was detected

</br>
- Error number: 1615; Symbol: ER_NEED_REPREPARE; SQLSTATE: HY000

Message: Prepared statement needs to be re-prepared

</br>
- Error number: 1617; Symbol: WARN_NO_MASTER_INFO; SQLSTATE: HY000

Message: The master info structure does not exist

WARN_NO_MASTER_INFO was removed after 8.0.32.

</br>
- Error number: 1618; Symbol: WARN_OPTION_IGNORED; SQLSTATE: HY000

Message: <%s> option ignored

</br>
- Error number: 1619; Symbol: ER_PLUGIN_DELETE_BUILTIN; SQLSTATE: HY000

Message: Built-in plugins cannot be deleted

</br>
- Error number: 1620; Symbol: WARN_PLUGIN_BUSY; SQLSTATE: HY000

Message: Plugin is busy and will be uninstalled on shutdown

</br>
- Error number: 1621; Symbol: ER_VARIABLE_IS_READONLY; SQLSTATE: HY000

Message: %s variable '%s' is read-only. Use SET %s to assign the value

</br>
- Error number: 1622; Symbol: ER_WARN_ENGINE_TRANSACTION_ROLLBACK; SQLSTATE: HY000

Message: Storage engine %s does not support rollback for this statement. Transaction rolled back and must be restarted

</br>
- Error number: 1624; Symbol: ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE; SQLSTATE: HY000

Message: The requested value for the heartbeat period is either negative or exceeds the maximum allowed (%s seconds).

ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE was removed after 8.0.32.

</br>
- Error number: 1625; Symbol: ER_NDB_REPLICATION_SCHEMA_ERROR; SQLSTATE: HY000

Message: Bad schema for mysql.ndb_replication table. Message: %s

</br>
- Error number: 1626; Symbol: ER_CONFLICT_FN_PARSE_ERROR; SQLSTATE: HY000

Message: Error in parsing conflict function. Message: %s

</br>
- Error number: 1627; Symbol: ER_EXCEPTIONS_WRITE_ERROR; SQLSTATE: HY000

Message: Write to exceptions table failed. Message: %s

</br>
- Error number: 1628; Symbol: ER_TOO_LONG_TABLE_COMMENT; SQLSTATE: HY000

Message: Comment for table '%s' is too long (max = %lu)

</br>
- Error number: 1629; Symbol: ER_TOO_LONG_FIELD_COMMENT; SQLSTATE: HY000

Message: Comment for field '%s' is too long (max = %lu)

</br>
- Error number: 1630; Symbol: ER_FUNC_INEXISTENT_NAME_COLLISION; SQLSTATE: 42000

Message: FUNCTION %s does not exist. Check the 'Function Name Parsing and Resolution' section in the Reference Manual

</br>
- Error number: 1631; Symbol: ER_DATABASE_NAME; SQLSTATE: HY000

Message: Database

</br>
- Error number: 1632; Symbol: ER_TABLE_NAME; SQLSTATE: HY000

Message: Table

</br>
- Error number: 1633; Symbol: ER_PARTITION_NAME; SQLSTATE: HY000

Message: Partition

</br>
- Error number: 1634; Symbol: ER_SUBPARTITION_NAME; SQLSTATE: HY000

Message: Subpartition

</br>
- Error number: 1635; Symbol: ER_TEMPORARY_NAME; SQLSTATE: HY000

Message: Temporary

</br>
- Error number: 1636; Symbol: ER_RENAMED_NAME; SQLSTATE: HY000

Message: Renamed

</br>
- Error number: 1637; Symbol: ER_TOO_MANY_CONCURRENT_TRXS; SQLSTATE: HY000

Message: Too many active concurrent transactions

</br>
- Error number: 1638; Symbol: WARN_NON_ASCII_SEPARATOR_NOT_IMPLEMENTED; SQLSTATE: HY000

Message: Non-ASCII separator arguments are not fully supported

</br>
- Error number: 1639; Symbol: ER_DEBUG_SYNC_TIMEOUT; SQLSTATE: HY000

Message: debug sync point wait timed out

</br>
- Error number: 1640; Symbol: ER_DEBUG_SYNC_HIT_LIMIT; SQLSTATE: HY000

Message: debug sync point hit limit reached

</br>
- Error number: 1641; Symbol: ER_DUP_SIGNAL_SET; SQLSTATE: 42000

Message: Duplicate condition information item '%s'

</br>
- Error number: 1642; Symbol: ER_SIGNAL_WARN; SQLSTATE: 01000

Message: Unhandled user-defined warning condition

</br>
- Error number: 1643; Symbol: ER_SIGNAL_NOT_FOUND; SQLSTATE: 02000

Message: Unhandled user-defined not found condition

</br>
- Error number: 1644; Symbol: ER_SIGNAL_EXCEPTION; SQLSTATE: HY000

Message: Unhandled user-defined exception condition

</br>
- Error number: 1645; Symbol: ER_RESIGNAL_WITHOUT_ACTIVE_HANDLER; SQLSTATE: 0K000

Message: RESIGNAL when handler not active

</br>
- Error number: 1646; Symbol: ER_SIGNAL_BAD_CONDITION_TYPE; SQLSTATE: HY000

Message: SIGNAL/RESIGNAL can only use a CONDITION defined with SQLSTATE

</br>
- Error number: 1647; Symbol: WARN_COND_ITEM_TRUNCATED; SQLSTATE: HY000

Message: Data truncated for condition item '%s'

</br>
- Error number: 1648; Symbol: ER_COND_ITEM_TOO_LONG; SQLSTATE: HY000

Message: Data too long for condition item '%s'

</br>
- Error number: 1649; Symbol: ER_UNKNOWN_LOCALE; SQLSTATE: HY000

Message: Unknown locale: '%s'

</br>
- Error number: 1650; Symbol: ER_SLAVE_IGNORE_SERVER_IDS; SQLSTATE: HY000

Message: The requested server id %d clashes with the slave startup option --replicate-same-server-id

ER_SLAVE_IGNORE_SERVER_IDS was removed after 8.0.32.

</br>
- Error number: 1651; Symbol: ER_QUERY_CACHE_DISABLED; SQLSTATE: HY000

Message: Query cache is disabled; restart the server with query_cache_type=1 to enable it

ER_QUERY_CACHE_DISABLED was removed after 8.0.2.

</br>
- Error number: 1652; Symbol: ER_SAME_NAME_PARTITION_FIELD; SQLSTATE: HY000

Message: Duplicate partition field name '%s'

</br>
- Error number: 1653; Symbol: ER_PARTITION_COLUMN_LIST_ERROR; SQLSTATE: HY000

Message: Inconsistency in usage of column lists for partitioning

</br>
- Error number: 1654; Symbol: ER_WRONG_TYPE_COLUMN_VALUE_ERROR; SQLSTATE: HY000

Message: Partition column values of incorrect type

</br>
- Error number: 1655; Symbol: ER_TOO_MANY_PARTITION_FUNC_FIELDS_ERROR; SQLSTATE: HY000

Message: Too many fields in '%s'

</br>
- Error number: 1656; Symbol: ER_MAXVALUE_IN_VALUES_IN; SQLSTATE: HY000

Message: Cannot use MAXVALUE as value in VALUES IN

</br>
- Error number: 1657; Symbol: ER_TOO_MANY_VALUES_ERROR; SQLSTATE: HY000

Message: Cannot have more than one value for this type of %s partitioning

</br>
- Error number: 1658; Symbol: ER_ROW_SINGLE_PARTITION_FIELD_ERROR; SQLSTATE: HY000

Message: Row expressions in VALUES IN only allowed for multi-field column partitioning

</br>
- Error number: 1659; Symbol: ER_FIELD_TYPE_NOT_ALLOWED_AS_PARTITION_FIELD; SQLSTATE: HY000

Message: Field '%s' is of a not allowed type for this type of partitioning

</br>
- Error number: 1660; Symbol: ER_PARTITION_FIELDS_TOO_LONG; SQLSTATE: HY000

Message: The total length of the partitioning fields is too large

</br>
- Error number: 1661; Symbol: ER_BINLOG_ROW_ENGINE_AND_STMT_ENGINE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since both row-incapable engines and statement-incapable engines are involved.

</br>
- Error number: 1662; Symbol: ER_BINLOG_ROW_MODE_AND_STMT_ENGINE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since BINLOG_FORMAT = ROW and at least one table uses a storage engine limited to statement-based logging.

</br>
- Error number: 1663; Symbol: ER_BINLOG_UNSAFE_AND_STMT_ENGINE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since statement is unsafe, storage engine is limited to statement-based logging, and BINLOG_FORMAT = MIXED. %s

</br>
- Error number: 1664; Symbol: ER_BINLOG_ROW_INJECTION_AND_STMT_ENGINE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since statement is in row format and at least one table uses a storage engine limited to statement-based logging.

</br>
- Error number: 1665; Symbol: ER_BINLOG_STMT_MODE_AND_ROW_ENGINE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since BINLOG_FORMAT = STATEMENT and at least one table uses a storage engine limited to row-based logging.%s

</br>
- Error number: 1666; Symbol: ER_BINLOG_ROW_INJECTION_AND_STMT_MODE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since statement is in row format and BINLOG_FORMAT = STATEMENT.

</br>
- Error number: 1667; Symbol: ER_BINLOG_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since more than one engine is involved and at least one engine is self-logging.

</br>
- Error number: 1668; Symbol: ER_BINLOG_UNSAFE_LIMIT; SQLSTATE: HY000

Message: The statement is unsafe because it uses a LIMIT clause. This is unsafe because the set of rows included cannot be predicted.

</br>
- Error number: 1670; Symbol: ER_BINLOG_UNSAFE_SYSTEM_TABLE; SQLSTATE: HY000

Message: The statement is unsafe because it uses the general log, slow query log, or performance_schema table(s). This is unsafe because system tables may differ on replicas.

</br>
- Error number: 1671; Symbol: ER_BINLOG_UNSAFE_AUTOINC_COLUMNS; SQLSTATE: HY000

Message: Statement is unsafe because it invokes a trigger or a stored function that inserts into an AUTO_INCREMENT column. Inserted values cannot be logged correctly.

</br>
- Error number: 1672; Symbol: ER_BINLOG_UNSAFE_UDF; SQLSTATE: HY000

Message: Statement is unsafe because it uses a UDF which may not return the same value on the replica.

</br>
- Error number: 1673; Symbol: ER_BINLOG_UNSAFE_SYSTEM_VARIABLE; SQLSTATE: HY000

Message: Statement is unsafe because it uses a system variable that may have a different value on the replica.

</br>
- Error number: 1674; Symbol: ER_BINLOG_UNSAFE_SYSTEM_FUNCTION; SQLSTATE: HY000

Message: Statement is unsafe because it uses a system function that may return a different value on the replica.

</br>
- Error number: 1675; Symbol: ER_BINLOG_UNSAFE_NONTRANS_AFTER_TRANS; SQLSTATE: HY000

Message: Statement is unsafe because it accesses a non-transactional table after accessing a transactional table within the same transaction.

</br>
- Error number: 1676; Symbol: ER_MESSAGE_AND_STATEMENT; SQLSTATE: HY000

Message: %s Statement: %s

</br>
- Error number: 1677; Symbol: ER_SLAVE_CONVERSION_FAILED; SQLSTATE: HY000

Message: Column %d of table '%s.%s' cannot be converted from type '%s' to type '%s'

ER_SLAVE_CONVERSION_FAILED was removed after 8.0.4.

</br>
- Error number: 1678; Symbol: ER_SLAVE_CANT_CREATE_CONVERSION; SQLSTATE: HY000

Message: Can't create conversion table for table '%s.%s'

ER_SLAVE_CANT_CREATE_CONVERSION was removed after 8.0.32.

</br>
- Error number: 1679; Symbol: ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_FORMAT; SQLSTATE: HY000

Message: Cannot modify @@session.binlog_format inside a transaction

</br>
- Error number: 1680; Symbol: ER_PATH_LENGTH; SQLSTATE: HY000

Message: The path specified for %s is too long.

</br>
- Error number: 1681; Symbol: ER_WARN_DEPRECATED_SYNTAX_NO_REPLACEMENT; SQLSTATE: HY000

Message: '%s' is deprecated and will be removed in a future release.

</br>
- Error number: 1682; Symbol: ER_WRONG_NATIVE_TABLE_STRUCTURE; SQLSTATE: HY000

Message: Native table '%s'.'%s' has the wrong structure

</br>
- Error number: 1683; Symbol: ER_WRONG_PERFSCHEMA_USAGE; SQLSTATE: HY000

Message: Invalid performance_schema usage.

</br>
- Error number: 1684; Symbol: ER_WARN_I_S_SKIPPED_TABLE; SQLSTATE: HY000

Message: Table '%s'.'%s' was skipped since its definition is being modified by concurrent DDL statement

</br>
- Error number: 1685; Symbol: ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_DIRECT; SQLSTATE: HY000

Message: Cannot modify @@session.binlog_direct_non_transactional_updates inside a transaction

</br>
- Error number: 1686; Symbol: ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_DIRECT; SQLSTATE: HY000

Message: Cannot change the binlog direct flag inside a stored function or trigger

</br>
- Error number: 1687; Symbol: ER_SPATIAL_MUST_HAVE_GEOM_COL; SQLSTATE: 42000

Message: A SPATIAL index may only contain a geometrical type column

</br>
- Error number: 1688; Symbol: ER_TOO_LONG_INDEX_COMMENT; SQLSTATE: HY000

Message: Comment for index '%s' is too long (max = %lu)

</br>
- Error number: 1689; Symbol: ER_LOCK_ABORTED; SQLSTATE: HY000

Message: Wait on a lock was aborted due to a pending exclusive lock

</br>
- Error number: 1690; Symbol: ER_DATA_OUT_OF_RANGE; SQLSTATE: 22003

Message: %s value is out of range in '%s'

</br>
- Error number: 1691; Symbol: ER_WRONG_SPVAR_TYPE_IN_LIMIT; SQLSTATE: HY000

Message: A variable of a non-integer based type in LIMIT clause

ER_WRONG_SPVAR_TYPE_IN_LIMIT was removed after 8.0.21.

</br>
- Error number: 1692; Symbol: ER_BINLOG_UNSAFE_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE; SQLSTATE: HY000

Message: Mixing self-logging and non-self-logging engines in a statement is unsafe.

</br>
- Error number: 1693; Symbol: ER_BINLOG_UNSAFE_MIXED_STATEMENT; SQLSTATE: HY000

Message: Statement accesses nontransactional table as well as transactional or temporary table, and writes to any of them.

</br>
- Error number: 1694; Symbol: ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_SQL_LOG_BIN; SQLSTATE: HY000

Message: Cannot modify @@session.sql_log_bin inside a transaction

</br>
- Error number: 1695; Symbol: ER_STORED_FUNCTION_PREVENTS_SWITCH_SQL_LOG_BIN; SQLSTATE: HY000

Message: Cannot change the sql_log_bin inside a stored function or trigger

</br>
- Error number: 1696; Symbol: ER_FAILED_READ_FROM_PAR_FILE; SQLSTATE: HY000

Message: Failed to read from the .par file

</br>
- Error number: 1697; Symbol: ER_VALUES_IS_NOT_INT_TYPE_ERROR; SQLSTATE: HY000

Message: VALUES value for partition '%s' must have type INT

</br>
- Error number: 1698; Symbol: ER_ACCESS_DENIED_NO_PASSWORD_ERROR; SQLSTATE: 28000

Message: Access denied for user '%s'@'%s'

</br>
- Error number: 1699; Symbol: ER_SET_PASSWORD_AUTH_PLUGIN; SQLSTATE: HY000

Message: SET PASSWORD has no significance for users authenticating via plugins

ER_SET_PASSWORD_AUTH_PLUGIN was removed after 8.0.28.

</br>
- Error number: 1701; Symbol: ER_TRUNCATE_ILLEGAL_FK; SQLSTATE: 42000

Message: Cannot truncate a table referenced in a foreign key constraint (%s)

</br>
- Error number: 1702; Symbol: ER_PLUGIN_IS_PERMANENT; SQLSTATE: HY000

Message: Plugin '%s' is force_plus_permanent and can not be unloaded

</br>
- Error number: 1703; Symbol: ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN; SQLSTATE: HY000

Message: The requested value for the heartbeat period is less than 1 millisecond. The value is reset to 0, meaning that heartbeating will effectively be disabled.

ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN was removed after 8.0.32.

</br>
- Error number: 1704; Symbol: ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX; SQLSTATE: HY000

Message: The requested value for the heartbeat period exceeds the value of `replica_net_timeout' seconds. A sensible value for the period should be less than the timeout.

ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX was removed after 8.0.32.

</br>
- Error number: 1705; Symbol: ER_STMT_CACHE_FULL; SQLSTATE: HY000

Message: Multi-row statements required more than 'max_binlog_stmt_cache_size' bytes of storage; increase this mysqld variable and try again

</br>
- Error number: 1706; Symbol: ER_MULTI_UPDATE_KEY_CONFLICT; SQLSTATE: HY000

Message: Primary key/partition key update is not allowed since the table is updated both as '%s' and '%s'.

</br>
- Error number: 1707; Symbol: ER_TABLE_NEEDS_REBUILD; SQLSTATE: HY000

Message: Table rebuild required. Please do "ALTER TABLE `%s` FORCE" or dump/reload to fix it!

</br>
- Error number: 1708; Symbol: WARN_OPTION_BELOW_LIMIT; SQLSTATE: HY000

Message: The value of '%s' should be no less than the value of '%s'

</br>
- Error number: 1709; Symbol: ER_INDEX_COLUMN_TOO_LONG; SQLSTATE: HY000

Message: Index column size too large. The maximum column size is %lu bytes.

</br>
- Error number: 1710; Symbol: ER_ERROR_IN_TRIGGER_BODY; SQLSTATE: HY000

Message: Trigger '%s' has an error in its body: '%s'

</br>
- Error number: 1711; Symbol: ER_ERROR_IN_UNKNOWN_TRIGGER_BODY; SQLSTATE: HY000

Message: Unknown trigger has an error in its body: '%s'

</br>
- Error number: 1712; Symbol: ER_INDEX_CORRUPT; SQLSTATE: HY000

Message: Index %s is corrupted

</br>
- Error number: 1713; Symbol: ER_UNDO_RECORD_TOO_BIG; SQLSTATE: HY000

Message: Undo log record is too big.

</br>
- Error number: 1714; Symbol: ER_BINLOG_UNSAFE_INSERT_IGNORE_SELECT; SQLSTATE: HY000

Message: INSERT IGNORE... SELECT is unsafe because the order in which rows are retrieved by the SELECT determines which (if any) rows are ignored. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1715; Symbol: ER_BINLOG_UNSAFE_INSERT_SELECT_UPDATE; SQLSTATE: HY000

Message: INSERT... SELECT... ON DUPLICATE KEY UPDATE is unsafe because the order in which rows are retrieved by the SELECT determines which (if any) rows are updated. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1716; Symbol: ER_BINLOG_UNSAFE_REPLACE_SELECT; SQLSTATE: HY000

Message: REPLACE... SELECT is unsafe because the order in which rows are retrieved by the SELECT determines which (if any) rows are replaced. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1717; Symbol: ER_BINLOG_UNSAFE_CREATE_IGNORE_SELECT; SQLSTATE: HY000

Message: CREATE... IGNORE SELECT is unsafe because the order in which rows are retrieved by the SELECT determines which (if any) rows are ignored. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1718; Symbol: ER_BINLOG_UNSAFE_CREATE_REPLACE_SELECT; SQLSTATE: HY000

Message: CREATE... REPLACE SELECT is unsafe because the order in which rows are retrieved by the SELECT determines which (if any) rows are replaced. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1719; Symbol: ER_BINLOG_UNSAFE_UPDATE_IGNORE; SQLSTATE: HY000

Message: UPDATE IGNORE is unsafe because the order in which rows are updated determines which (if any) rows are ignored. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1720; Symbol: ER_PLUGIN_NO_UNINSTALL; SQLSTATE: HY000

Message: Plugin '%s' is marked as not dynamically uninstallable. You have to stop the server to uninstall it.

</br>
- Error number: 1721; Symbol: ER_PLUGIN_NO_INSTALL; SQLSTATE: HY000

Message: Plugin '%s' is marked as not dynamically installable. You have to stop the server to install it.

</br>
- Error number: 1722; Symbol: ER_BINLOG_UNSAFE_WRITE_AUTOINC_SELECT; SQLSTATE: HY000

Message: Statements writing to a table with an auto-increment column after selecting from another table are unsafe because the order in which rows are retrieved determines what (if any) rows will be written. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1723; Symbol: ER_BINLOG_UNSAFE_CREATE_SELECT_AUTOINC; SQLSTATE: HY000

Message: CREATE TABLE... SELECT... on a table with an auto-increment column is unsafe because the order in which rows are retrieved by the SELECT determines which (if any) rows are inserted. This order cannot be predicted and may differ on source and the replica.

</br>
- Error number: 1724; Symbol: ER_BINLOG_UNSAFE_INSERT_TWO_KEYS; SQLSTATE: HY000

Message: INSERT... ON DUPLICATE KEY UPDATE on a table with more than one UNIQUE KEY is unsafe

</br>
- Error number: 1725; Symbol: ER_TABLE_IN_FK_CHECK; SQLSTATE: HY000

Message: Table is being used in foreign key check.

</br>
- Error number: 1726; Symbol: ER_UNSUPPORTED_ENGINE; SQLSTATE: HY000

Message: Storage engine '%s' does not support system tables. [%s.%s]

</br>
- Error number: 1727; Symbol: ER_BINLOG_UNSAFE_AUTOINC_NOT_FIRST; SQLSTATE: HY000

Message: INSERT into autoincrement field which is not the first part in the composed primary key is unsafe.

</br>
- Error number: 1728; Symbol: ER_CANNOT_LOAD_FROM_TABLE_V2; SQLSTATE: HY000

Message: Cannot load from %s.%s. The table is probably corrupted

</br>
- Error number: 1729; Symbol: ER_MASTER_DELAY_VALUE_OUT_OF_RANGE; SQLSTATE: HY000

Message: The requested value %s for the master delay exceeds the maximum %u

ER_MASTER_DELAY_VALUE_OUT_OF_RANGE was removed after 8.0.32.

</br>
- Error number: 1730; Symbol: ER_ONLY_FD_AND_RBR_EVENTS_ALLOWED_IN_BINLOG_STATEMENT; SQLSTATE: HY000

Message: Only Format_description_log_event and row events are allowed in BINLOG statements (but %s was provided)

</br>
- Error number: 1731; Symbol: ER_PARTITION_EXCHANGE_DIFFERENT_OPTION; SQLSTATE: HY000

Message: Non matching attribute '%s' between partition and table

</br>
- Error number: 1732; Symbol: ER_PARTITION_EXCHANGE_PART_TABLE; SQLSTATE: HY000

Message: Table to exchange with partition is partitioned: '%s'

</br>
- Error number: 1733; Symbol: ER_PARTITION_EXCHANGE_TEMP_TABLE; SQLSTATE: HY000

Message: Table to exchange with partition is temporary: '%s'

</br>
- Error number: 1734; Symbol: ER_PARTITION_INSTEAD_OF_SUBPARTITION; SQLSTATE: HY000

Message: Subpartitioned table, use subpartition instead of partition

</br>
- Error number: 1735; Symbol: ER_UNKNOWN_PARTITION; SQLSTATE: HY000

Message: Unknown partition '%s' in table '%s'

</br>
- Error number: 1736; Symbol: ER_TABLES_DIFFERENT_METADATA; SQLSTATE: HY000

Message: Tables have different definitions

</br>
- Error number: 1737; Symbol: ER_ROW_DOES_NOT_MATCH_PARTITION; SQLSTATE: HY000

Message: Found a row that does not match the partition

</br>
- Error number: 1738; Symbol: ER_BINLOG_CACHE_SIZE_GREATER_THAN_MAX; SQLSTATE: HY000

Message: Option binlog_cache_size (%lu) is greater than max_binlog_cache_size (%lu); setting binlog_cache_size equal to max_binlog_cache_size.

</br>
- Error number: 1739; Symbol: ER_WARN_INDEX_NOT_APPLICABLE; SQLSTATE: HY000

Message: Cannot use %s access on index '%s' due to type or collation conversion on field '%s'

</br>
- Error number: 1740; Symbol: ER_PARTITION_EXCHANGE_FOREIGN_KEY; SQLSTATE: HY000

Message: Table to exchange with partition has foreign key references: '%s'

</br>
- Error number: 1742; Symbol: ER_RPL_INFO_DATA_TOO_LONG; SQLSTATE: HY000

Message: Data for column '%s' too long

</br>
- Error number: 1745; Symbol: ER_BINLOG_STMT_CACHE_SIZE_GREATER_THAN_MAX; SQLSTATE: HY000

Message: Option binlog_stmt_cache_size (%lu) is greater than max_binlog_stmt_cache_size (%lu); setting binlog_stmt_cache_size equal to max_binlog_stmt_cache_size.

</br>
- Error number: 1746; Symbol: ER_CANT_UPDATE_TABLE_IN_CREATE_TABLE_SELECT; SQLSTATE: HY000

Message: Can't update table '%s' while '%s' is being created.

</br>
- Error number: 1747; Symbol: ER_PARTITION_CLAUSE_ON_NONPARTITIONED; SQLSTATE: HY000

Message: PARTITION () clause on non partitioned table

</br>
- Error number: 1748; Symbol: ER_ROW_DOES_NOT_MATCH_GIVEN_PARTITION_SET; SQLSTATE: HY000

Message: Found a row not matching the given partition set

</br>
- Error number: 1750; Symbol: ER_CHANGE_RPL_INFO_REPOSITORY_FAILURE; SQLSTATE: HY000

Message: Failure while changing the type of replication repository: %s.

</br>
- Error number: 1751; Symbol: ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_CREATED_TEMP_TABLE; SQLSTATE: HY000

Message: The creation of some temporary tables could not be rolled back.

</br>
- Error number: 1752; Symbol: ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_DROPPED_TEMP_TABLE; SQLSTATE: HY000

Message: Some temporary tables were dropped, but these operations could not be rolled back.

</br>
- Error number: 1753; Symbol: ER_MTS_FEATURE_IS_NOT_SUPPORTED; SQLSTATE: HY000

Message: %s is not supported in multi-threaded slave mode. %s

ER_MTS_FEATURE_IS_NOT_SUPPORTED was removed after 8.0.32.

</br>
- Error number: 1754; Symbol: ER_MTS_UPDATED_DBS_GREATER_MAX; SQLSTATE: HY000

Message: The number of modified databases exceeds the maximum %d; the database names will not be included in the replication event metadata.

ER_MTS_UPDATED_DBS_GREATER_MAX was removed after 8.0.32.

</br>
- Error number: 1755; Symbol: ER_MTS_CANT_PARALLEL; SQLSTATE: HY000

Message: Cannot execute the current event group in the parallel mode. Encountered event %s, relay-log name %s, position %s which prevents execution of this event group in parallel mode. Reason: %s.

ER_MTS_CANT_PARALLEL was removed after 8.0.32.

</br>
- Error number: 1756; Symbol: ER_MTS_INCONSISTENT_DATA; SQLSTATE: HY000

Message: %s

ER_MTS_INCONSISTENT_DATA was removed after 8.0.32.

</br>
- Error number: 1757; Symbol: ER_FULLTEXT_NOT_SUPPORTED_WITH_PARTITIONING; SQLSTATE: HY000

Message: FULLTEXT index is not supported for partitioned tables.

</br>
- Error number: 1758; Symbol: ER_DA_INVALID_CONDITION_NUMBER; SQLSTATE: 35000

Message: Invalid condition number

</br>
- Error number: 1759; Symbol: ER_INSECURE_PLAIN_TEXT; SQLSTATE: HY000

Message: Sending passwords in plain text without SSL/TLS is extremely insecure.

</br>
- Error number: 1760; Symbol: ER_INSECURE_CHANGE_MASTER; SQLSTATE: HY000

Message: Storing MySQL user name or password information in the master info repository is not secure and is therefore not recommended. Please consider using the USER and PASSWORD connection options for START SLAVE; see the 'START SLAVE Syntax' in the MySQL Manual for more information.

ER_INSECURE_CHANGE_MASTER was removed after 8.0.32.

</br>
- Error number: 1761; Symbol: ER_FOREIGN_DUPLICATE_KEY_WITH_CHILD_INFO; SQLSTATE: 23000

Message: Foreign key constraint for table '%s', record '%s' would lead to a duplicate entry in table '%s', key '%s'

</br>
- Error number: 1762; Symbol: ER_FOREIGN_DUPLICATE_KEY_WITHOUT_CHILD_INFO; SQLSTATE: 23000

Message: Foreign key constraint for table '%s', record '%s' would lead to a duplicate entry in a child table

</br>
- Error number: 1763; Symbol: ER_SQLTHREAD_WITH_SECURE_SLAVE; SQLSTATE: HY000

Message: Setting authentication options is not possible when only the Slave SQL Thread is being started.

ER_SQLTHREAD_WITH_SECURE_SLAVE was removed after 8.0.32.

</br>
- Error number: 1764; Symbol: ER_TABLE_HAS_NO_FT; SQLSTATE: HY000

Message: The table does not have FULLTEXT index to support this query

</br>
- Error number: 1765; Symbol: ER_VARIABLE_NOT_SETTABLE_IN_SF_OR_TRIGGER; SQLSTATE: HY000

Message: The system variable %s cannot be set in stored functions or triggers.

</br>
- Error number: 1766; Symbol: ER_VARIABLE_NOT_SETTABLE_IN_TRANSACTION; SQLSTATE: HY000

Message: The system variable %s cannot be set when there is an ongoing transaction.

</br>
- Error number: 1769; Symbol: ER_SET_STATEMENT_CANNOT_INVOKE_FUNCTION; SQLSTATE: HY000

Message: The statement 'SET %s' cannot invoke a stored function.

</br>
- Error number: 1770; Symbol: ER_GTID_NEXT_CANT_BE_AUTOMATIC_IF_GTID_NEXT_LIST_IS_NON_NULL; SQLSTATE: HY000

Message: The system variable @@SESSION.GTID_NEXT cannot be 'AUTOMATIC' when @@SESSION.GTID_NEXT_LIST is non-NULL.

</br>
- Error number: 1772; Symbol: ER_MALFORMED_GTID_SET_SPECIFICATION; SQLSTATE: HY000

Message: Malformed GTID set specification '%s'.

</br>
- Error number: 1773; Symbol: ER_MALFORMED_GTID_SET_ENCODING; SQLSTATE: HY000

Message: Malformed GTID set encoding.

</br>
- Error number: 1774; Symbol: ER_MALFORMED_GTID_SPECIFICATION; SQLSTATE: HY000

Message: Malformed GTID specification '%s'.

</br>
- Error number: 1775; Symbol: ER_GNO_EXHAUSTED; SQLSTATE: HY000

Message: Impossible to generate GTID: the integer component reached the maximum value. Restart the server with a new server_uuid.

</br>
- Error number: 1776; Symbol: ER_BAD_SLAVE_AUTO_POSITION; SQLSTATE: HY000

Message: Parameters MASTER_LOG_FILE, MASTER_LOG_POS, RELAY_LOG_FILE and RELAY_LOG_POS cannot be set when MASTER_AUTO_POSITION is active.

ER_BAD_SLAVE_AUTO_POSITION was removed after 8.0.32.

</br>
- Error number: 1777; Symbol: ER_AUTO_POSITION_REQUIRES_GTID_MODE_NOT_OFF; SQLSTATE: HY000

Message: CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1 cannot be executed because @@GLOBAL.GTID_MODE = OFF.

</br>
- Error number: 1778; Symbol: ER_CANT_DO_IMPLICIT_COMMIT_IN_TRX_WHEN_GTID_NEXT_IS_SET; SQLSTATE: HY000

Message: Cannot execute statements with implicit commit inside a transaction when @@SESSION.GTID_NEXT == 'UUID:NUMBER'.

</br>
- Error number: 1779; Symbol: ER_GTID_MODE_ON_REQUIRES_ENFORCE_GTID_CONSISTENCY_ON; SQLSTATE: HY000

Message: GTID_MODE = ON requires ENFORCE_GTID_CONSISTENCY = ON.

</br>
- Error number: 1781; Symbol: ER_CANT_SET_GTID_NEXT_TO_GTID_WHEN_GTID_MODE_IS_OFF; SQLSTATE: HY000

Message: @@SESSION.GTID_NEXT cannot be set to UUID:NUMBER when @@GLOBAL.GTID_MODE = OFF.

</br>
- Error number: 1782; Symbol: ER_CANT_SET_GTID_NEXT_TO_ANONYMOUS_WHEN_GTID_MODE_IS_ON; SQLSTATE: HY000

Message: @@SESSION.GTID_NEXT cannot be set to ANONYMOUS when @@GLOBAL.GTID_MODE = ON.

</br>
- Error number: 1783; Symbol: ER_CANT_SET_GTID_NEXT_LIST_TO_NON_NULL_WHEN_GTID_MODE_IS_OFF; SQLSTATE: HY000

Message: @@SESSION.GTID_NEXT_LIST cannot be set to a non-NULL value when @@GLOBAL.GTID_MODE = OFF.

</br>
- Error number: 1785; Symbol: ER_GTID_UNSAFE_NON_TRANSACTIONAL_TABLE; SQLSTATE: HY000

Message: Statement violates GTID consistency: Updates to non-transactional tables can only be done in either autocommitted statements or single-statement transactions, and never in the same statement as updates to transactional tables.

</br>
- Error number: 1786; Symbol: ER_GTID_UNSAFE_CREATE_SELECT; SQLSTATE: HY000

Message: Statement violates GTID consistency: CREATE TABLE ... SELECT.

</br>
- Error number: 1787; Symbol: ER_GTID_UNSAFE_CREATE_DROP_TEMPORARY_TABLE_IN_TRANSACTION; SQLSTATE: HY000

Message: Statement violates GTID consistency: CREATE TEMPORARY TABLE and DROP TEMPORARY TABLE can only be executed outside transactional context. These statements are also not allowed in a function or trigger because functions and triggers are also considered to be multi-statement transactions.

ER_GTID_UNSAFE_CREATE_DROP_TEMPORARY_TABLE_IN_TRANSACTION was removed after 8.0.12.

</br>
- Error number: 1788; Symbol: ER_GTID_MODE_CAN_ONLY_CHANGE_ONE_STEP_AT_A_TIME; SQLSTATE: HY000

Message: The value of @@GLOBAL.GTID_MODE can only be changed one step at a time: OFF <-> OFF_PERMISSIVE <-> ON_PERMISSIVE <-> ON. Also note that this value must be stepped up or down simultaneously on all servers. See the Manual for instructions.

</br>
- Error number: 1789; Symbol: ER_MASTER_HAS_PURGED_REQUIRED_GTIDS; SQLSTATE: HY000

Message: Cannot replicate because the master purged required binary logs. Replicate the missing transactions from elsewhere, or provision a new slave from backup. Consider increasing the master's binary log expiration period. %s

ER_MASTER_HAS_PURGED_REQUIRED_GTIDS was removed after 8.0.32.

</br>
- Error number: 1790; Symbol: ER_CANT_SET_GTID_NEXT_WHEN_OWNING_GTID; SQLSTATE: HY000

Message: @@SESSION.GTID_NEXT cannot be changed by a client that owns a GTID. The client owns %s. Ownership is released on COMMIT or ROLLBACK.

</br>
- Error number: 1791; Symbol: ER_UNKNOWN_EXPLAIN_FORMAT; SQLSTATE: HY000

Message: Unknown EXPLAIN format name: '%s'

</br>
- Error number: 1792; Symbol: ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION; SQLSTATE: 25006

Message: Cannot execute statement in a READ ONLY transaction.

</br>
- Error number: 1793; Symbol: ER_TOO_LONG_TABLE_PARTITION_COMMENT; SQLSTATE: HY000

Message: Comment for table partition '%s' is too long (max = %lu)

</br>
- Error number: 1794; Symbol: ER_SLAVE_CONFIGURATION; SQLSTATE: HY000

Message: Slave is not configured or failed to initialize properly. You must at least set --server-id to enable either a master or a slave. Additional error messages can be found in the MySQL error log.

ER_SLAVE_CONFIGURATION was removed after 8.0.32.

</br>
- Error number: 1795; Symbol: ER_INNODB_FT_LIMIT; SQLSTATE: HY000

Message: InnoDB presently supports one FULLTEXT index creation at a time

</br>
- Error number: 1796; Symbol: ER_INNODB_NO_FT_TEMP_TABLE; SQLSTATE: HY000

Message: Cannot create FULLTEXT index on temporary InnoDB table

</br>
- Error number: 1797; Symbol: ER_INNODB_FT_WRONG_DOCID_COLUMN; SQLSTATE: HY000

Message: Column '%s' is of wrong type for an InnoDB FULLTEXT index

</br>
- Error number: 1798; Symbol: ER_INNODB_FT_WRONG_DOCID_INDEX; SQLSTATE: HY000

Message: Index '%s' is of wrong type for an InnoDB FULLTEXT index

</br>
- Error number: 1799; Symbol: ER_INNODB_ONLINE_LOG_TOO_BIG; SQLSTATE: HY000

Message: Creating index '%s' required more than 'innodb_online_alter_log_max_size' bytes of modification log. Please try again.

</br>
- Error number: 1800; Symbol: ER_UNKNOWN_ALTER_ALGORITHM; SQLSTATE: HY000

Message: Unknown ALGORITHM '%s'

</br>
- Error number: 1801; Symbol: ER_UNKNOWN_ALTER_LOCK; SQLSTATE: HY000

Message: Unknown LOCK type '%s'

</br>
- Error number: 1802; Symbol: ER_MTS_CHANGE_MASTER_CANT_RUN_WITH_GAPS; SQLSTATE: HY000

Message: CHANGE MASTER cannot be executed when the slave was stopped with an error or killed in MTS mode. Consider using RESET SLAVE or START SLAVE UNTIL.

ER_MTS_CHANGE_MASTER_CANT_RUN_WITH_GAPS was removed after 8.0.32.

</br>
- Error number: 1803; Symbol: ER_MTS_RECOVERY_FAILURE; SQLSTATE: HY000

Message: Cannot recover after SLAVE errored out in parallel execution mode. Additional error messages can be found in the MySQL error log.

ER_MTS_RECOVERY_FAILURE was removed after 8.0.32.

</br>
- Error number: 1804; Symbol: ER_MTS_RESET_WORKERS; SQLSTATE: HY000

Message: Cannot clean up worker info tables. Additional error messages can be found in the MySQL error log.

ER_MTS_RESET_WORKERS was removed after 8.0.32.

</br>
- Error number: 1805; Symbol: ER_COL_COUNT_DOESNT_MATCH_CORRUPTED_V2; SQLSTATE: HY000

Message: Column count of %s.%s is wrong. Expected %d, found %d. The table is probably corrupted

</br>
- Error number: 1806; Symbol: ER_SLAVE_SILENT_RETRY_TRANSACTION; SQLSTATE: HY000

Message: Slave must silently retry current transaction

ER_SLAVE_SILENT_RETRY_TRANSACTION was removed after 8.0.32.

</br>
- Error number: 1807; Symbol: ER_DISCARD_FK_CHECKS_RUNNING; SQLSTATE: HY000

Message: There is a foreign key check running on table '%s'. Cannot discard the table.

</br>
- Error number: 1808; Symbol: ER_TABLE_SCHEMA_MISMATCH; SQLSTATE: HY000

Message: Schema mismatch (%s)

</br>
- Error number: 1809; Symbol: ER_TABLE_IN_SYSTEM_TABLESPACE; SQLSTATE: HY000

Message: Table '%s' in system tablespace

</br>
- Error number: 1810; Symbol: ER_IO_READ_ERROR; SQLSTATE: HY000

Message: IO Read error: (%lu, %s) %s

</br>
- Error number: 1811; Symbol: ER_IO_WRITE_ERROR; SQLSTATE: HY000

Message: IO Write error: (%lu, %s) %s

</br>
- Error number: 1812; Symbol: ER_TABLESPACE_MISSING; SQLSTATE: HY000

Message: Tablespace is missing for table %s.

</br>
- Error number: 1813; Symbol: ER_TABLESPACE_EXISTS; SQLSTATE: HY000

Message: Tablespace '%s' exists.

</br>
- Error number: 1814; Symbol: ER_TABLESPACE_DISCARDED; SQLSTATE: HY000

Message: Tablespace has been discarded for table '%s'

</br>
- Error number: 1815; Symbol: ER_INTERNAL_ERROR; SQLSTATE: HY000

Message: Internal error: %s

</br>
- Error number: 1816; Symbol: ER_INNODB_IMPORT_ERROR; SQLSTATE: HY000

Message: ALTER TABLE %s IMPORT TABLESPACE failed with error %lu : '%s'

</br>
- Error number: 1817; Symbol: ER_INNODB_INDEX_CORRUPT; SQLSTATE: HY000

Message: Index corrupt: %s

</br>
- Error number: 1818; Symbol: ER_INVALID_YEAR_COLUMN_LENGTH; SQLSTATE: HY000

Message: Invalid display width. Use YEAR instead.

</br>
- Error number: 1819; Symbol: ER_NOT_VALID_PASSWORD; SQLSTATE: HY000

Message: Your password does not satisfy the current policy requirements

</br>
- Error number: 1820; Symbol: ER_MUST_CHANGE_PASSWORD; SQLSTATE: HY000

Message: You must reset your password using ALTER USER statement before executing this statement.

</br>
- Error number: 1821; Symbol: ER_FK_NO_INDEX_CHILD; SQLSTATE: HY000

Message: Failed to add the foreign key constraint. Missing index for constraint '%s' in the foreign table '%s'

</br>
- Error number: 1822; Symbol: ER_FK_NO_INDEX_PARENT; SQLSTATE: HY000

Message: Failed to add the foreign key constraint. Missing index for constraint '%s' in the referenced table '%s'

</br>
- Error number: 1823; Symbol: ER_FK_FAIL_ADD_SYSTEM; SQLSTATE: HY000

Message: Failed to add the foreign key constraint '%s' to system tables

</br>
- Error number: 1824; Symbol: ER_FK_CANNOT_OPEN_PARENT; SQLSTATE: HY000

Message: Failed to open the referenced table '%s'

</br>
- Error number: 1825; Symbol: ER_FK_INCORRECT_OPTION; SQLSTATE: HY000

Message: Failed to add the foreign key constraint on table '%s'. Incorrect options in FOREIGN KEY constraint '%s'

</br>
- Error number: 1826; Symbol: ER_FK_DUP_NAME; SQLSTATE: HY000

Message: Duplicate foreign key constraint name '%s'

</br>
- Error number: 1827; Symbol: ER_PASSWORD_FORMAT; SQLSTATE: HY000

Message: The password hash doesn't have the expected format.

</br>
- Error number: 1828; Symbol: ER_FK_COLUMN_CANNOT_DROP; SQLSTATE: HY000

Message: Cannot drop column '%s': needed in a foreign key constraint '%s'

</br>
- Error number: 1829; Symbol: ER_FK_COLUMN_CANNOT_DROP_CHILD; SQLSTATE: HY000

Message: Cannot drop column '%s': needed in a foreign key constraint '%s' of table '%s'

</br>
- Error number: 1830; Symbol: ER_FK_COLUMN_NOT_NULL; SQLSTATE: HY000

Message: Column '%s' cannot be NOT NULL: needed in a foreign key constraint '%s' SET NULL

</br>
- Error number: 1831; Symbol: ER_DUP_INDEX; SQLSTATE: HY000

Message: Duplicate index '%s' defined on the table '%s.%s'. This is deprecated and will be disallowed in a future release.

</br>
- Error number: 1832; Symbol: ER_FK_COLUMN_CANNOT_CHANGE; SQLSTATE: HY000

Message: Cannot change column '%s': used in a foreign key constraint '%s'

</br>
- Error number: 1833; Symbol: ER_FK_COLUMN_CANNOT_CHANGE_CHILD; SQLSTATE: HY000

Message: Cannot change column '%s': used in a foreign key constraint '%s' of table '%s'

</br>
- Error number: 1835; Symbol: ER_MALFORMED_PACKET; SQLSTATE: HY000

Message: Malformed communication packet.

</br>
- Error number: 1836; Symbol: ER_READ_ONLY_MODE; SQLSTATE: HY000

Message: Running in read-only mode

</br>
- Error number: 1837; Symbol: ER_GTID_NEXT_TYPE_UNDEFINED_GROUP; SQLSTATE: HY000

Message: When @@SESSION.GTID_NEXT is set to a GTID, you must explicitly set it to a different value after a COMMIT or ROLLBACK. Please check GTID_NEXT variable manual page for detailed explanation. Current @@SESSION.GTID_NEXT is '%s'.

ER_GTID_NEXT_TYPE_UNDEFINED_GROUP was removed after 8.0.4.

</br>
- Error number: 1837; Symbol: ER_GTID_NEXT_TYPE_UNDEFINED_GTID; SQLSTATE: HY000

Message: When @@SESSION.GTID_NEXT is set to a GTID, you must explicitly set it to a different value after a COMMIT or ROLLBACK. Please check GTID_NEXT variable manual page for detailed explanation. Current @@SESSION.GTID_NEXT is '%s'.

ER_GTID_NEXT_TYPE_UNDEFINED_GTID was added in 8.0.11.

</br>
- Error number: 1838; Symbol: ER_VARIABLE_NOT_SETTABLE_IN_SP; SQLSTATE: HY000

Message: The system variable %s cannot be set in stored procedures.

</br>
- Error number: 1840; Symbol: ER_CANT_SET_GTID_PURGED_WHEN_GTID_EXECUTED_IS_NOT_EMPTY; SQLSTATE: HY000

Message: @@GLOBAL.GTID_PURGED can only be set when @@GLOBAL.GTID_EXECUTED is empty.

</br>
- Error number: 1841; Symbol: ER_CANT_SET_GTID_PURGED_WHEN_OWNED_GTIDS_IS_NOT_EMPTY; SQLSTATE: HY000

Message: @@GLOBAL.GTID_PURGED can only be set when there are no ongoing transactions (not even in other clients).

</br>
- Error number: 1842; Symbol: ER_GTID_PURGED_WAS_CHANGED; SQLSTATE: HY000

Message: @@GLOBAL.GTID_PURGED was changed from '%s' to '%s'.

</br>
- Error number: 1843; Symbol: ER_GTID_EXECUTED_WAS_CHANGED; SQLSTATE: HY000

Message: @@GLOBAL.GTID_EXECUTED was changed from '%s' to '%s'.

</br>
- Error number: 1844; Symbol: ER_BINLOG_STMT_MODE_AND_NO_REPL_TABLES; SQLSTATE: HY000

Message: Cannot execute statement: impossible to write to binary log since BINLOG_FORMAT = STATEMENT, and both replicated and non replicated tables are written to.

</br>
- Error number: 1845; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED; SQLSTATE: 0A000

Message: %s is not supported for this operation. Try %s.

</br>
- Error number: 1846; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON; SQLSTATE: 0A000

Message: %s is not supported. Reason: %s. Try %s.

</br>
- Error number: 1847; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COPY; SQLSTATE: HY000

Message: COPY algorithm requires a lock

</br>
- Error number: 1848; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_PARTITION; SQLSTATE: HY000

Message: Partition specific operations do not yet support LOCK/ALGORITHM

</br>
- Error number: 1849; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_RENAME; SQLSTATE: HY000

Message: Columns participating in a foreign key are renamed

</br>
- Error number: 1850; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE; SQLSTATE: HY000

Message: Cannot change column type INPLACE

</br>
- Error number: 1851; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_CHECK; SQLSTATE: HY000

Message: Adding foreign keys needs foreign_key_checks=OFF

</br>
- Error number: 1853; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOPK; SQLSTATE: HY000

Message: Dropping a primary key is not allowed without also adding a new primary key

</br>
- Error number: 1854; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_AUTOINC; SQLSTATE: HY000

Message: Adding an auto-increment column requires a lock

</br>
- Error number: 1855; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_HIDDEN_FTS; SQLSTATE: HY000

Message: Cannot replace hidden FTS_DOC_ID with a user-visible one

</br>
- Error number: 1856; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_CHANGE_FTS; SQLSTATE: HY000

Message: Cannot drop or rename FTS_DOC_ID

</br>
- Error number: 1857; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FTS; SQLSTATE: HY000

Message: Fulltext index creation requires a lock

</br>
- Error number: 1858; Symbol: ER_SQL_SLAVE_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE; SQLSTATE: HY000

Message: sql_slave_skip_counter can not be set when the server is running with @@GLOBAL.GTID_MODE = ON. Instead, for each transaction that you want to skip, generate an empty transaction with the same GTID as the transaction

ER_SQL_SLAVE_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE was removed after 8.0.22.

</br>
- Error number: 1859; Symbol: ER_DUP_UNKNOWN_IN_INDEX; SQLSTATE: 23000

Message: Duplicate entry for key '%s'

</br>
- Error number: 1860; Symbol: ER_IDENT_CAUSES_TOO_LONG_PATH; SQLSTATE: HY000

Message: Long database name and identifier for object resulted in path length exceeding %d characters. Path: '%s'.

</br>
- Error number: 1861; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOT_NULL; SQLSTATE: HY000

Message: cannot silently convert NULL values, as required in this SQL_MODE

</br>
- Error number: 1862; Symbol: ER_MUST_CHANGE_PASSWORD_LOGIN; SQLSTATE: HY000

Message: Your password has expired. To log in you must change it using a client that supports expired passwords.

</br>
- Error number: 1863; Symbol: ER_ROW_IN_WRONG_PARTITION; SQLSTATE: HY000

Message: Found a row in wrong partition %s

</br>
- Error number: 1864; Symbol: ER_MTS_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX; SQLSTATE: HY000

Message: Cannot schedule event %s, relay-log name %s, position %s to Worker thread because its size %lu exceeds %lu of replica_pending_jobs_size_max.

ER_MTS_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX was removed after 8.0.32.

</br>
- Error number: 1866; Symbol: ER_BINLOG_LOGICAL_CORRUPTION; SQLSTATE: HY000

Message: The binary log file '%s' is logically corrupted: %s

</br>
- Error number: 1867; Symbol: ER_WARN_PURGE_LOG_IN_USE; SQLSTATE: HY000

Message: file %s was not purged because it was being read by %d thread(s), purged only %d out of %d files.

</br>
- Error number: 1868; Symbol: ER_WARN_PURGE_LOG_IS_ACTIVE; SQLSTATE: HY000

Message: file %s was not purged because it is the active log file.

</br>
- Error number: 1869; Symbol: ER_AUTO_INCREMENT_CONFLICT; SQLSTATE: HY000

Message: Auto-increment value in UPDATE conflicts with internally generated values

</br>
- Error number: 1870; Symbol: WARN_ON_BLOCKHOLE_IN_RBR; SQLSTATE: HY000

Message: Row events are not logged for %s statements that modify BLACKHOLE tables in row format. Table(s): '%s'

</br>
- Error number: 1871; Symbol: ER_SLAVE_MI_INIT_REPOSITORY; SQLSTATE: HY000

Message: Slave failed to initialize master info structure from the repository

ER_SLAVE_MI_INIT_REPOSITORY was removed after 8.0.32.

</br>
- Error number: 1872; Symbol: ER_SLAVE_RLI_INIT_REPOSITORY; SQLSTATE: HY000

Message: Slave failed to initialize relay log info structure from the repository

ER_SLAVE_RLI_INIT_REPOSITORY was removed after 8.0.32.

</br>
- Error number: 1873; Symbol: ER_ACCESS_DENIED_CHANGE_USER_ERROR; SQLSTATE: 28000

Message: Access denied trying to change to user '%s'@'%s' (using password: %s). Disconnecting.

</br>
- Error number: 1874; Symbol: ER_INNODB_READ_ONLY; SQLSTATE: HY000

Message: InnoDB is in read only mode.

</br>
- Error number: 1875; Symbol: ER_STOP_SLAVE_SQL_THREAD_TIMEOUT; SQLSTATE: HY000

Message: STOP SLAVE command execution is incomplete: Slave SQL thread got the stop signal, thread is busy, SQL thread will stop once the current task is complete.

ER_STOP_SLAVE_SQL_THREAD_TIMEOUT was removed after 8.0.32.

</br>
- Error number: 1876; Symbol: ER_STOP_SLAVE_IO_THREAD_TIMEOUT; SQLSTATE: HY000

Message: STOP SLAVE command execution is incomplete: Slave IO thread got the stop signal, thread is busy, IO thread will stop once the current task is complete.

ER_STOP_SLAVE_IO_THREAD_TIMEOUT was removed after 8.0.32.

</br>
- Error number: 1877; Symbol: ER_TABLE_CORRUPT; SQLSTATE: HY000

Message: Operation cannot be performed. The table '%s.%s' is missing, corrupt or contains bad data.

</br>
- Error number: 1878; Symbol: ER_TEMP_FILE_WRITE_FAILURE; SQLSTATE: HY000

Message: Temporary file write failure.

</br>
- Error number: 1879; Symbol: ER_INNODB_FT_AUX_NOT_HEX_ID; SQLSTATE: HY000

Message: Upgrade index name failed, please use create index(alter table) algorithm copy to rebuild index.

</br>
- Error number: 1880; Symbol: ER_OLD_TEMPORALS_UPGRADED; SQLSTATE: HY000

Message: TIME/TIMESTAMP/DATETIME columns of old format have been upgraded to the new format.

</br>
- Error number: 1881; Symbol: ER_INNODB_FORCED_RECOVERY; SQLSTATE: HY000

Message: Operation not allowed when innodb_force_recovery > 0.

</br>
- Error number: 1882; Symbol: ER_AES_INVALID_IV; SQLSTATE: HY000

Message: The initialization vector supplied to %s is too short. Must be at least %d bytes long

</br>
- Error number: 1883; Symbol: ER_PLUGIN_CANNOT_BE_UNINSTALLED; SQLSTATE: HY000

Message: Plugin '%s' cannot be uninstalled now. %s

</br>
- Error number: 1884; Symbol: ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_GTID_GROUP; SQLSTATE: HY000

Message: Cannot execute statement because it needs to be written to the binary log as multiple statements, and this is not allowed when @@SESSION.GTID_NEXT == 'UUID:NUMBER'.

ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_GTID_GROUP was removed after 8.0.4.

</br>
- Error number: 1884; Symbol: ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_ASSIGNED_GTID; SQLSTATE: HY000

Message: Cannot execute statement because it needs to be written to the binary log as multiple statements, and this is not allowed when @@SESSION.GTID_NEXT == 'UUID:NUMBER'.

ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_ASSIGNED_GTID was added in 8.0.11.

</br>
- Error number: 1885; Symbol: ER_SLAVE_HAS_MORE_GTIDS_THAN_MASTER; SQLSTATE: HY000

Message: Slave has more GTIDs than the master has, using the master's SERVER_UUID. This may indicate that the end of the binary log was truncated or that the last binary log file was lost, e.g., after a power or disk failure when sync_binlog != 1. The master may or may not have rolled back transactions that were already replicated to the slave. Suggest to replicate any transactions that master has rolled back from slave to master, and/or commit empty transactions on master to account for transactions that have been committed on master but are not included in GTID_EXECUTED.

ER_SLAVE_HAS_MORE_GTIDS_THAN_MASTER was removed after 8.0.32.

</br>
- Error number: 1886; Symbol: ER_MISSING_KEY; SQLSTATE: HY000

Message: The table '%s.%s' does not have the necessary key(s) defined on it. Please check the table definition and create index(s) accordingly.

ER_MISSING_KEY was added in 8.0.4.

</br>
- Error number: 1887; Symbol: WARN_NAMED_PIPE_ACCESS_EVERYONE; SQLSTATE: HY000

Message: Setting named_pipe_full_access_group='%s' is insecure. Consider using a Windows group with fewer members.

WARN_NAMED_PIPE_ACCESS_EVERYONE was added in 8.0.17.

</br>
## Error Numbers 3000~3985
</br>
- Error number: 3000; Symbol: ER_FILE_CORRUPT; SQLSTATE: HY000

Message: File %s is corrupted

</br>
- Error number: 3001; Symbol: ER_ERROR_ON_MASTER; SQLSTATE: HY000

Message: Query partially completed on the master (error on master: %d) and was aborted. There is a chance that your master is inconsistent at this point. If you are sure that your master is ok, run this query manually on the slave and then restart the slave with SET GLOBAL SQL_REPLICA_SKIP_COUNTER=1; START SLAVE;. Query:'%s'

ER_ERROR_ON_MASTER was removed after 8.0.32.

</br>
- Error number: 3003; Symbol: ER_STORAGE_ENGINE_NOT_LOADED; SQLSTATE: HY000

Message: Storage engine for table '%s'.'%s' is not loaded.

</br>
- Error number: 3004; Symbol: ER_GET_STACKED_DA_WITHOUT_ACTIVE_HANDLER; SQLSTATE: 0Z002

Message: GET STACKED DIAGNOSTICS when handler not active

</br>
- Error number: 3005; Symbol: ER_WARN_LEGACY_SYNTAX_CONVERTED; SQLSTATE: HY000

Message: %s is no longer supported. The statement was converted to %s.

</br>
- Error number: 3006; Symbol: ER_BINLOG_UNSAFE_FULLTEXT_PLUGIN; SQLSTATE: HY000

Message: Statement is unsafe because it uses a fulltext parser plugin which may not return the same value on the replica.

</br>
- Error number: 3007; Symbol: ER_CANNOT_DISCARD_TEMPORARY_TABLE; SQLSTATE: HY000

Message: Cannot DISCARD/IMPORT tablespace associated with temporary table

</br>
- Error number: 3008; Symbol: ER_FK_DEPTH_EXCEEDED; SQLSTATE: HY000

Message: Foreign key cascade delete/update exceeds max depth of %d.

</br>
- Error number: 3009; Symbol: ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE_V2; SQLSTATE: HY000

Message: The column count of %s.%s is wrong. Expected %d, found %d. Created with MySQL %d, now running %d. Please perform the MySQL upgrade procedure.

</br>
- Error number: 3010; Symbol: ER_WARN_TRIGGER_DOESNT_HAVE_CREATED; SQLSTATE: HY000

Message: Trigger %s.%s.%s does not have CREATED attribute.

</br>
- Error number: 3011; Symbol: ER_REFERENCED_TRG_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Referenced trigger '%s' for the given action time and event type does not exist.

</br>
- Error number: 3012; Symbol: ER_EXPLAIN_NOT_SUPPORTED; SQLSTATE: HY000

Message: EXPLAIN FOR CONNECTION command is supported only for SELECT/UPDATE/INSERT/DELETE/REPLACE

</br>
- Error number: 3013; Symbol: ER_INVALID_FIELD_SIZE; SQLSTATE: HY000

Message: Invalid size for column '%s'.

</br>
- Error number: 3014; Symbol: ER_MISSING_HA_CREATE_OPTION; SQLSTATE: HY000

Message: Table storage engine '%s' found required create option missing

</br>
- Error number: 3015; Symbol: ER_ENGINE_OUT_OF_MEMORY; SQLSTATE: HY000

Message: Out of memory in storage engine '%s'.

</br>
- Error number: 3016; Symbol: ER_PASSWORD_EXPIRE_ANONYMOUS_USER; SQLSTATE: HY000

Message: The password for anonymous user cannot be expired.

</br>
- Error number: 3017; Symbol: ER_SLAVE_SQL_THREAD_MUST_STOP; SQLSTATE: HY000

Message: This operation cannot be performed with a running slave sql thread; run STOP SLAVE SQL_THREAD first

ER_SLAVE_SQL_THREAD_MUST_STOP was removed after 8.0.32.

</br>
- Error number: 3018; Symbol: ER_NO_FT_MATERIALIZED_SUBQUERY; SQLSTATE: HY000

Message: Cannot create FULLTEXT index on materialized subquery

</br>
- Error number: 3019; Symbol: ER_INNODB_UNDO_LOG_FULL; SQLSTATE: HY000

Message: Undo Log error: %s

</br>
- Error number: 3020; Symbol: ER_INVALID_ARGUMENT_FOR_LOGARITHM; SQLSTATE: 2201E

Message: Invalid argument for logarithm

</br>
- Error number: 3021; Symbol: ER_SLAVE_CHANNEL_IO_THREAD_MUST_STOP; SQLSTATE: HY000

Message: This operation cannot be performed with a running slave io thread; run STOP SLAVE IO_THREAD FOR CHANNEL '%s' first.

ER_SLAVE_CHANNEL_IO_THREAD_MUST_STOP was removed after 8.0.32.

</br>
- Error number: 3022; Symbol: ER_WARN_OPEN_TEMP_TABLES_MUST_BE_ZERO; SQLSTATE: HY000

Message: This operation may not be safe when the replica has temporary tables. The tables will be kept open until the server restarts or until the tables are deleted by any replicated DROP statement. Suggest to wait until replica_open_temp_tables = 0.

</br>
- Error number: 3023; Symbol: ER_WARN_ONLY_MASTER_LOG_FILE_NO_POS; SQLSTATE: HY000

Message: CHANGE MASTER TO with a MASTER_LOG_FILE clause but no MASTER_LOG_POS clause may not be safe. The old position value may not be valid for the new binary log file.

ER_WARN_ONLY_MASTER_LOG_FILE_NO_POS was removed after 8.0.32.

</br>
- Error number: 3024; Symbol: ER_QUERY_TIMEOUT; SQLSTATE: HY000

Message: Query execution was interrupted, maximum statement execution time exceeded

</br>
- Error number: 3025; Symbol: ER_NON_RO_SELECT_DISABLE_TIMER; SQLSTATE: HY000

Message: Select is not a read only statement, disabling timer

</br>
- Error number: 3026; Symbol: ER_DUP_LIST_ENTRY; SQLSTATE: HY000

Message: Duplicate entry '%s'.

</br>
- Error number: 3028; Symbol: ER_AGGREGATE_ORDER_FOR_UNION; SQLSTATE: HY000

Message: Expression #%u of ORDER BY contains aggregate function and applies to a UNION, EXCEPT or INTERSECT

</br>
- Error number: 3029; Symbol: ER_AGGREGATE_ORDER_NON_AGG_QUERY; SQLSTATE: HY000

Message: Expression #%u of ORDER BY contains aggregate function and applies to the result of a non-aggregated query

</br>
- Error number: 3030; Symbol: ER_SLAVE_WORKER_STOPPED_PREVIOUS_THD_ERROR; SQLSTATE: HY000

Message: Slave worker has stopped after at least one previous worker encountered an error when replica-preserve-commit-order was enabled. To preserve commit order, the last transaction executed by this thread has not been committed. When restarting the slave after fixing any failed threads, you should fix this worker as well.

ER_SLAVE_WORKER_STOPPED_PREVIOUS_THD_ERROR was removed after 8.0.32.

</br>
- Error number: 3031; Symbol: ER_DONT_SUPPORT_SLAVE_PRESERVE_COMMIT_ORDER; SQLSTATE: HY000

Message: slave_preserve_commit_order is not supported %s.

ER_DONT_SUPPORT_SLAVE_PRESERVE_COMMIT_ORDER was removed after 8.0.25.

</br>
- Error number: 3032; Symbol: ER_SERVER_OFFLINE_MODE; SQLSTATE: HY000

Message: The server is currently in offline mode

</br>
- Error number: 3033; Symbol: ER_GIS_DIFFERENT_SRIDS; SQLSTATE: HY000

Message: Binary geometry function %s given two geometries of different srids: %u and %u, which should have been identical.

Geometry values passed as arguments to spatial functions must have the same SRID value.

</br>
- Error number: 3034; Symbol: ER_GIS_UNSUPPORTED_ARGUMENT; SQLSTATE: HY000

Message: Calling geometry function %s with unsupported types of arguments.

A spatial function was called with a combination of argument types that the function does not support.

</br>
- Error number: 3035; Symbol: ER_GIS_UNKNOWN_ERROR; SQLSTATE: HY000

Message: Unknown GIS error occurred in function %s.

</br>
- Error number: 3036; Symbol: ER_GIS_UNKNOWN_EXCEPTION; SQLSTATE: HY000

Message: Unknown exception caught in GIS function %s.

</br>
- Error number: 3037; Symbol: ER_GIS_INVALID_DATA; SQLSTATE: 22023

Message: Invalid GIS data provided to function %s.

A spatial function was called with an argument not recognized as a valid geometry value.

</br>
- Error number: 3038; Symbol: ER_BOOST_GEOMETRY_EMPTY_INPUT_EXCEPTION; SQLSTATE: HY000

Message: The geometry has no data in function %s.

</br>
- Error number: 3039; Symbol: ER_BOOST_GEOMETRY_CENTROID_EXCEPTION; SQLSTATE: HY000

Message: Unable to calculate centroid because geometry is empty in function %s.

</br>
- Error number: 3040; Symbol: ER_BOOST_GEOMETRY_OVERLAY_INVALID_INPUT_EXCEPTION; SQLSTATE: HY000

Message: Geometry overlay calculation error: geometry data is invalid in function %s.

</br>
- Error number: 3041; Symbol: ER_BOOST_GEOMETRY_TURN_INFO_EXCEPTION; SQLSTATE: HY000

Message: Geometry turn info calculation error: geometry data is invalid in function %s.

</br>
- Error number: 3042; Symbol: ER_BOOST_GEOMETRY_SELF_INTERSECTION_POINT_EXCEPTION; SQLSTATE: HY000

Message: Analysis procedures of intersection points interrupted unexpectedly in function %s.

</br>
- Error number: 3043; Symbol: ER_BOOST_GEOMETRY_UNKNOWN_EXCEPTION; SQLSTATE: HY000

Message: Unknown exception thrown in function %s.

</br>
- Error number: 3044; Symbol: ER_STD_BAD_ALLOC_ERROR; SQLSTATE: HY000

Message: Memory allocation error: %s in function %s.

</br>
- Error number: 3045; Symbol: ER_STD_DOMAIN_ERROR; SQLSTATE: HY000

Message: Domain error: %s in function %s.

</br>
- Error number: 3046; Symbol: ER_STD_LENGTH_ERROR; SQLSTATE: HY000

Message: Length error: %s in function %s.

</br>
- Error number: 3047; Symbol: ER_STD_INVALID_ARGUMENT; SQLSTATE: HY000

Message: Invalid argument error: %s in function %s.

</br>
- Error number: 3048; Symbol: ER_STD_OUT_OF_RANGE_ERROR; SQLSTATE: HY000

Message: Out of range error: %s in function %s.

</br>
- Error number: 3049; Symbol: ER_STD_OVERFLOW_ERROR; SQLSTATE: HY000

Message: Overflow error: %s in function %s.

</br>
- Error number: 3050; Symbol: ER_STD_RANGE_ERROR; SQLSTATE: HY000

Message: Range error: %s in function %s.

</br>
- Error number: 3051; Symbol: ER_STD_UNDERFLOW_ERROR; SQLSTATE: HY000

Message: Underflow error: %s in function %s.

</br>
- Error number: 3052; Symbol: ER_STD_LOGIC_ERROR; SQLSTATE: HY000

Message: Logic error: %s in function %s.

</br>
- Error number: 3053; Symbol: ER_STD_RUNTIME_ERROR; SQLSTATE: HY000

Message: Runtime error: %s in function %s.

</br>
- Error number: 3054; Symbol: ER_STD_UNKNOWN_EXCEPTION; SQLSTATE: HY000

Message: Unknown exception: %s in function %s.

</br>
- Error number: 3055; Symbol: ER_GIS_DATA_WRONG_ENDIANESS; SQLSTATE: HY000

Message: Geometry byte string must be little endian.

</br>
- Error number: 3056; Symbol: ER_CHANGE_MASTER_PASSWORD_LENGTH; SQLSTATE: HY000

Message: The password provided for the replication user exceeds the maximum length of 32 characters

ER_CHANGE_MASTER_PASSWORD_LENGTH was removed after 8.0.32.

</br>
- Error number: 3057; Symbol: ER_USER_LOCK_WRONG_NAME; SQLSTATE: 42000

Message: Incorrect user-level lock name '%s'. The name is empty, NULL, or can not be expressed in the current character-set.

</br>
- Error number: 3058; Symbol: ER_USER_LOCK_DEADLOCK; SQLSTATE: HY000

Message: Deadlock found when trying to get user-level lock; try rolling back transaction/releasing locks and restarting lock acquisition.

This error is returned when the metdata locking subsystem detects a deadlock for an attempt to acquire a named lock with GET_LOCK.

</br>
- Error number: 3059; Symbol: ER_REPLACE_INACCESSIBLE_ROWS; SQLSTATE: HY000

Message: REPLACE cannot be executed as it requires deleting rows that are not in the view

</br>
- Error number: 3060; Symbol: ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_GIS; SQLSTATE: HY000

Message: Do not support online operation on table with GIS index

</br>
- Error number: 3061; Symbol: ER_ILLEGAL_USER_VAR; SQLSTATE: 42000

Message: User variable name '%s' is illegal

</br>
- Error number: 3062; Symbol: ER_GTID_MODE_OFF; SQLSTATE: HY000

Message: Cannot %s when GTID_MODE = OFF.

</br>
- Error number: 3064; Symbol: ER_INCORRECT_TYPE; SQLSTATE: HY000

Message: Incorrect type for argument %s in function %s.

</br>
- Error number: 3065; Symbol: ER_FIELD_IN_ORDER_NOT_SELECT; SQLSTATE: HY000

Message: Expression #%u of ORDER BY clause is not in SELECT list, references column '%s' which is not in SELECT list; this is incompatible with %s

</br>
- Error number: 3066; Symbol: ER_AGGREGATE_IN_ORDER_NOT_SELECT; SQLSTATE: HY000

Message: Expression #%u of ORDER BY clause is not in SELECT list, contains aggregate function; this is incompatible with %s

</br>
- Error number: 3067; Symbol: ER_INVALID_RPL_WILD_TABLE_FILTER_PATTERN; SQLSTATE: HY000

Message: Supplied filter list contains a value which is not in the required format 'db_pattern.table_pattern'

</br>
- Error number: 3068; Symbol: ER_NET_OK_PACKET_TOO_LARGE; SQLSTATE: 08S01

Message: OK packet too large

</br>
- Error number: 3069; Symbol: ER_INVALID_JSON_DATA; SQLSTATE: HY000

Message: Invalid JSON data provided to function %s: %s

</br>
- Error number: 3070; Symbol: ER_INVALID_GEOJSON_MISSING_MEMBER; SQLSTATE: HY000

Message: Invalid GeoJSON data provided to function %s: Missing required member '%s'

</br>
- Error number: 3071; Symbol: ER_INVALID_GEOJSON_WRONG_TYPE; SQLSTATE: HY000

Message: Invalid GeoJSON data provided to function %s: Member '%s' must be of type '%s'

</br>
- Error number: 3072; Symbol: ER_INVALID_GEOJSON_UNSPECIFIED; SQLSTATE: HY000

Message: Invalid GeoJSON data provided to function %s

</br>
- Error number: 3073; Symbol: ER_DIMENSION_UNSUPPORTED; SQLSTATE: HY000

Message: Unsupported number of coordinate dimensions in function %s: Found %u, expected %u

</br>
- Error number: 3074; Symbol: ER_SLAVE_CHANNEL_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Slave channel '%s' does not exist.

ER_SLAVE_CHANNEL_DOES_NOT_EXIST was removed after 8.0.32.

</br>
- Error number: 3076; Symbol: ER_SLAVE_CHANNEL_NAME_INVALID_OR_TOO_LONG; SQLSTATE: HY000

Message: Couldn't create channel: Channel name is either invalid or too long.

ER_SLAVE_CHANNEL_NAME_INVALID_OR_TOO_LONG was removed after 8.0.32.

</br>
- Error number: 3077; Symbol: ER_SLAVE_NEW_CHANNEL_WRONG_REPOSITORY; SQLSTATE: HY000

Message: To have multiple channels, repository cannot be of type FILE; Please check the repository configuration and convert them to TABLE.

ER_SLAVE_NEW_CHANNEL_WRONG_REPOSITORY was removed after 8.0.32.

</br>
- Error number: 3079; Symbol: ER_SLAVE_MULTIPLE_CHANNELS_CMD; SQLSTATE: HY000

Message: Multiple channels exist on the slave. Please provide channel name as an argument.

ER_SLAVE_MULTIPLE_CHANNELS_CMD was removed after 8.0.32.

</br>
- Error number: 3080; Symbol: ER_SLAVE_MAX_CHANNELS_EXCEEDED; SQLSTATE: HY000

Message: Maximum number of replication channels allowed exceeded.

ER_SLAVE_MAX_CHANNELS_EXCEEDED was removed after 8.0.32.

</br>
- Error number: 3081; Symbol: ER_SLAVE_CHANNEL_MUST_STOP; SQLSTATE: HY000

Message: This operation cannot be performed with running replication threads; run STOP SLAVE FOR CHANNEL '%s' first

ER_SLAVE_CHANNEL_MUST_STOP was removed after 8.0.32.

</br>
- Error number: 3082; Symbol: ER_SLAVE_CHANNEL_NOT_RUNNING; SQLSTATE: HY000

Message: This operation requires running replication threads; configure slave and run START SLAVE FOR CHANNEL '%s'

ER_SLAVE_CHANNEL_NOT_RUNNING was removed after 8.0.32.

</br>
- Error number: 3083; Symbol: ER_SLAVE_CHANNEL_WAS_RUNNING; SQLSTATE: HY000

Message: Replication thread(s) for channel '%s' are already runnning.

ER_SLAVE_CHANNEL_WAS_RUNNING was removed after 8.0.32.

</br>
- Error number: 3084; Symbol: ER_SLAVE_CHANNEL_WAS_NOT_RUNNING; SQLSTATE: HY000

Message: Replication thread(s) for channel '%s' are already stopped.

ER_SLAVE_CHANNEL_WAS_NOT_RUNNING was removed after 8.0.32.

</br>
- Error number: 3085; Symbol: ER_SLAVE_CHANNEL_SQL_THREAD_MUST_STOP; SQLSTATE: HY000

Message: This operation cannot be performed with a running slave sql thread; run STOP SLAVE SQL_THREAD FOR CHANNEL '%s' first.

ER_SLAVE_CHANNEL_SQL_THREAD_MUST_STOP was removed after 8.0.32.

</br>
- Error number: 3086; Symbol: ER_SLAVE_CHANNEL_SQL_SKIP_COUNTER; SQLSTATE: HY000

Message: When sql_replica_skip_counter > 0, it is not allowed to start more than one SQL thread by using 'START SLAVE [SQL_THREAD]'. Value of sql_replica_skip_counter can only be used by one SQL thread at a time. Please use 'START SLAVE [SQL_THREAD] FOR CHANNEL' to start the SQL thread which will use the value of sql_replica_skip_counter.

ER_SLAVE_CHANNEL_SQL_SKIP_COUNTER was removed after 8.0.32.

</br>
- Error number: 3087; Symbol: ER_WRONG_FIELD_WITH_GROUP_V2; SQLSTATE: HY000

Message: Expression #%u of %s is not in GROUP BY clause and contains nonaggregated column '%s' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by

</br>
- Error number: 3088; Symbol: ER_MIX_OF_GROUP_FUNC_AND_FIELDS_V2; SQLSTATE: HY000

Message: In aggregated query without GROUP BY, expression #%u of %s contains nonaggregated column '%s'; this is incompatible with sql_mode=only_full_group_by

</br>
- Error number: 3089; Symbol: ER_WARN_DEPRECATED_SYSVAR_UPDATE; SQLSTATE: HY000

Message: Updating '%s' is deprecated. It will be made read-only in a future release.

</br>
- Error number: 3090; Symbol: ER_WARN_DEPRECATED_SQLMODE; SQLSTATE: HY000

Message: Changing sql mode '%s' is deprecated. It will be removed in a future release.

</br>
- Error number: 3091; Symbol: ER_CANNOT_LOG_PARTIAL_DROP_DATABASE_WITH_GTID; SQLSTATE: HY000

Message: DROP DATABASE failed; some tables may have been dropped but the database directory remains. The GTID has not been added to GTID_EXECUTED and the statement was not written to the binary log. Fix this as follows: (1) remove all files from the database directory %s; (2) SET GTID_NEXT='%s'; (3) DROP DATABASE `%s`.

</br>
- Error number: 3092; Symbol: ER_GROUP_REPLICATION_CONFIGURATION; SQLSTATE: HY000

Message: The server is not configured properly to be an active member of the group. Please see more details on error log.

</br>
- Error number: 3093; Symbol: ER_GROUP_REPLICATION_RUNNING; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed since the group is already running.

</br>
- Error number: 3094; Symbol: ER_GROUP_REPLICATION_APPLIER_INIT_ERROR; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed as the applier module failed to start.

</br>
- Error number: 3095; Symbol: ER_GROUP_REPLICATION_STOP_APPLIER_THREAD_TIMEOUT; SQLSTATE: HY000

Message: The STOP GROUP_REPLICATION command execution is incomplete: The applier thread got the stop signal while it was busy. The applier thread will stop once the current task is complete.

</br>
- Error number: 3096; Symbol: ER_GROUP_REPLICATION_COMMUNICATION_LAYER_SESSION_ERROR; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed as there was an error when initializing the group communication layer.

</br>
- Error number: 3097; Symbol: ER_GROUP_REPLICATION_COMMUNICATION_LAYER_JOIN_ERROR; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed as there was an error when joining the communication group.

</br>
- Error number: 3098; Symbol: ER_BEFORE_DML_VALIDATION_ERROR; SQLSTATE: HY000

Message: The table does not comply with the requirements by an external plugin.

</br>
- Error number: 3099; Symbol: ER_PREVENTS_VARIABLE_WITHOUT_RBR; SQLSTATE: HY000

Message: Cannot change the value of variable %s without binary log format as ROW.

transaction_write_set_extraction option value is set and binlog_format is not ROW.

</br>
- Error number: 3100; Symbol: ER_RUN_HOOK_ERROR; SQLSTATE: HY000

Message: Error on observer while running replication hook '%s'.

</br>
- Error number: 3101; Symbol: ER_TRANSACTION_ROLLBACK_DURING_COMMIT; SQLSTATE: 40000

Message: Plugin instructed the server to rollback the current transaction.

When using Group Replication, this means that a transaction failed the group certification process, due to one or more members detecting a potential conflict, and was thus rolled back. See Group Replication.

</br>
- Error number: 3102; Symbol: ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: Expression of generated column '%s' contains a disallowed function.

</br>
- Error number: 3103; Symbol: ER_UNSUPPORTED_ALTER_INPLACE_ON_VIRTUAL_COLUMN; SQLSTATE: HY000

Message: INPLACE ADD or DROP of virtual columns cannot be combined with other ALTER TABLE actions

</br>
- Error number: 3104; Symbol: ER_WRONG_FK_OPTION_FOR_GENERATED_COLUMN; SQLSTATE: HY000

Message: Cannot define foreign key with %s clause on a generated column.

</br>
- Error number: 3105; Symbol: ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN; SQLSTATE: HY000

Message: The value specified for generated column '%s' in table '%s' is not allowed.

</br>
- Error number: 3106; Symbol: ER_UNSUPPORTED_ACTION_ON_GENERATED_COLUMN; SQLSTATE: HY000

Message: '%s' is not supported for generated columns.

</br>
- Error number: 3107; Symbol: ER_GENERATED_COLUMN_NON_PRIOR; SQLSTATE: HY000

Message: Generated column can refer only to generated columns defined prior to it.

To address this issue, change the table definition to define each generated column later than any generated columns to which it refers.

</br>
- Error number: 3108; Symbol: ER_DEPENDENT_BY_GENERATED_COLUMN; SQLSTATE: HY000

Message: Column '%s' has a generated column dependency.

You cannot drop or rename a generated column if another column refers to it. You must either drop those columns as well, or redefine them not to refer to the generated column.

</br>
- Error number: 3109; Symbol: ER_GENERATED_COLUMN_REF_AUTO_INC; SQLSTATE: HY000

Message: Generated column '%s' cannot refer to auto-increment column.

</br>
- Error number: 3110; Symbol: ER_FEATURE_NOT_AVAILABLE; SQLSTATE: HY000

Message: The '%s' feature is not available; you need to remove '%s' or use MySQL built with '%s'

</br>
- Error number: 3111; Symbol: ER_CANT_SET_GTID_MODE; SQLSTATE: HY000

Message: SET @@GLOBAL.GTID_MODE = %s is not allowed because %s.

</br>
- Error number: 3112; Symbol: ER_CANT_USE_AUTO_POSITION_WITH_GTID_MODE_OFF; SQLSTATE: HY000

Message: The replication receiver thread%s cannot start in AUTO_POSITION mode: this server uses @@GLOBAL.GTID_MODE = OFF.

</br>
- Error number: 3116; Symbol: ER_CANT_ENFORCE_GTID_CONSISTENCY_WITH_ONGOING_GTID_VIOLATING_TX; SQLSTATE: HY000

Message: Cannot set ENFORCE_GTID_CONSISTENCY = ON because there are ongoing transactions that violate GTID consistency.

ER_CANT_SET_ENFORCE_GTID_CONSISTENCY_ON_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS was renamed to ER_CANT_ENFORCE_GTID_CONSISTENCY_WITH_ONGOING_GTID_VIOLATING_TX.

</br>
- Error number: 3117; Symbol: ER_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TX; SQLSTATE: HY000

Message: There are ongoing transactions that violate GTID consistency.

ER_SET_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS was renamed to ER_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TX.

</br>
- Error number: 3118; Symbol: ER_ACCOUNT_HAS_BEEN_LOCKED; SQLSTATE: HY000

Message: Access denied for user '%s'@'%s'. Account is locked.

The account was locked with CREATE USER ... ACCOUNT LOCK or ALTER USER ... ACCOUNT LOCK. An administrator can unlock it with ALTER USER ... ACCOUNT UNLOCK.

</br>
- Error number: 3119; Symbol: ER_WRONG_TABLESPACE_NAME; SQLSTATE: 42000

Message: Incorrect tablespace name `%s`

</br>
- Error number: 3120; Symbol: ER_TABLESPACE_IS_NOT_EMPTY; SQLSTATE: HY000

Message: Tablespace `%s` is not empty.

</br>
- Error number: 3121; Symbol: ER_WRONG_FILE_NAME; SQLSTATE: HY000

Message: Incorrect File Name '%s'.

</br>
- Error number: 3122; Symbol: ER_BOOST_GEOMETRY_INCONSISTENT_TURNS_EXCEPTION; SQLSTATE: HY000

Message: Inconsistent intersection points.

</br>
- Error number: 3123; Symbol: ER_WARN_OPTIMIZER_HINT_SYNTAX_ERROR; SQLSTATE: HY000

Message: Optimizer hint syntax error

</br>
- Error number: 3124; Symbol: ER_WARN_BAD_MAX_EXECUTION_TIME; SQLSTATE: HY000

Message: Unsupported MAX_EXECUTION_TIME

</br>
- Error number: 3125; Symbol: ER_WARN_UNSUPPORTED_MAX_EXECUTION_TIME; SQLSTATE: HY000

Message: MAX_EXECUTION_TIME hint is supported by top-level standalone SELECT statements only

The MAX_EXECUTION_TIME optimizer hint is supported only for SELECT statements.

</br>
- Error number: 3126; Symbol: ER_WARN_CONFLICTING_HINT; SQLSTATE: HY000

Message: Hint %s is ignored as conflicting/duplicated

</br>
- Error number: 3127; Symbol: ER_WARN_UNKNOWN_QB_NAME; SQLSTATE: HY000

Message: Query block name %s is not found for %s hint

</br>
- Error number: 3128; Symbol: ER_UNRESOLVED_HINT_NAME; SQLSTATE: HY000

Message: Unresolved name %s for %s hint

</br>
- Error number: 3129; Symbol: ER_WARN_ON_MODIFYING_GTID_EXECUTED_TABLE; SQLSTATE: HY000

Message: Please do not modify the %s table. This is a mysql internal system table to store GTIDs for committed transactions. Modifying it can lead to an inconsistent GTID state.

</br>
- Error number: 3130; Symbol: ER_PLUGGABLE_PROTOCOL_COMMAND_NOT_SUPPORTED; SQLSTATE: HY000

Message: Command not supported by pluggable protocols

</br>
- Error number: 3131; Symbol: ER_LOCKING_SERVICE_WRONG_NAME; SQLSTATE: 42000

Message: Incorrect locking service lock name '%s'.

A locking service name was specified as NULL, the empty string, or a string longer than 64 characters. Namespace and lock names must be non-NULL, nonempty, and no more than 64 characters long.

</br>
- Error number: 3132; Symbol: ER_LOCKING_SERVICE_DEADLOCK; SQLSTATE: HY000

Message: Deadlock found when trying to get locking service lock; try releasing locks and restarting lock acquisition.

</br>
- Error number: 3133; Symbol: ER_LOCKING_SERVICE_TIMEOUT; SQLSTATE: HY000

Message: Service lock wait timeout exceeded.

</br>
- Error number: 3134; Symbol: ER_GIS_MAX_POINTS_IN_GEOMETRY_OVERFLOWED; SQLSTATE: HY000

Message: Parameter %s exceeds the maximum number of points in a geometry (%lu) in function %s.

</br>
- Error number: 3135; Symbol: ER_SQL_MODE_MERGED; SQLSTATE: HY000

Message: 'NO_ZERO_DATE', 'NO_ZERO_IN_DATE' and 'ERROR_FOR_DIVISION_BY_ZERO' sql modes should be used with strict mode. They will be merged with strict mode in a future release.

</br>
- Error number: 3136; Symbol: ER_VTOKEN_PLUGIN_TOKEN_MISMATCH; SQLSTATE: HY000

Message: Version token mismatch for %.*s. Correct value %.*s

The client has set its version_tokens_session system variable to the list of tokens it requires the server to match, but the server token list has at least one matching token name that has a value different from what the client requires. See Version Tokens.

</br>
- Error number: 3137; Symbol: ER_VTOKEN_PLUGIN_TOKEN_NOT_FOUND; SQLSTATE: HY000

Message: Version token %.*s not found.

The client has set its version_tokens_session system variable to the list of tokens it requires the server to match, but the server token list is missing at least one of those tokens. See Version Tokens.

</br>
- Error number: 3138; Symbol: ER_CANT_SET_VARIABLE_WHEN_OWNING_GTID; SQLSTATE: HY000

Message: Variable %s cannot be changed by a client that owns a GTID. The client owns %s. Ownership is released on COMMIT or ROLLBACK.

</br>
- Error number: 3139; Symbol: ER_SLAVE_CHANNEL_OPERATION_NOT_ALLOWED; SQLSTATE: HY000

Message: %s cannot be performed on channel '%s'.

ER_SLAVE_CHANNEL_OPERATION_NOT_ALLOWED was removed after 8.0.32.

</br>
- Error number: 3140; Symbol: ER_INVALID_JSON_TEXT; SQLSTATE: 22032

Message: Invalid JSON text: "%s" at position %u in value for column '%s'.

</br>
- Error number: 3141; Symbol: ER_INVALID_JSON_TEXT_IN_PARAM; SQLSTATE: 22032

Message: Invalid JSON text in argument %u to function %s: "%s" at position %u.%s

</br>
- Error number: 3142; Symbol: ER_INVALID_JSON_BINARY_DATA; SQLSTATE: HY000

Message: The JSON binary value contains invalid data.

</br>
- Error number: 3143; Symbol: ER_INVALID_JSON_PATH; SQLSTATE: 42000

Message: Invalid JSON path expression. The error is around character position %u.%s

</br>
- Error number: 3144; Symbol: ER_INVALID_JSON_CHARSET; SQLSTATE: 22032

Message: Cannot create a JSON value from a string with CHARACTER SET '%s'.

</br>
- Error number: 3145; Symbol: ER_INVALID_JSON_CHARSET_IN_FUNCTION; SQLSTATE: 22032

Message: Invalid JSON character data provided to function %s: '%s'; utf8 is required.

</br>
- Error number: 3146; Symbol: ER_INVALID_TYPE_FOR_JSON; SQLSTATE: 22032

Message: Invalid data type for JSON data in argument %u to function %s; a JSON string or JSON type is required.

</br>
- Error number: 3147; Symbol: ER_INVALID_CAST_TO_JSON; SQLSTATE: 22032

Message: Cannot CAST value to JSON.

</br>
- Error number: 3148; Symbol: ER_INVALID_JSON_PATH_CHARSET; SQLSTATE: 42000

Message: A path expression must be encoded in the utf8 character set. The path expression '%s' is encoded in character set '%s'.

</br>
- Error number: 3149; Symbol: ER_INVALID_JSON_PATH_WILDCARD; SQLSTATE: 42000

Message: In this situation, path expressions may not contain the * and ** tokens or an array range.

</br>
- Error number: 3150; Symbol: ER_JSON_VALUE_TOO_BIG; SQLSTATE: 22032

Message: The JSON value is too big to be stored in a JSON column.

</br>
- Error number: 3151; Symbol: ER_JSON_KEY_TOO_BIG; SQLSTATE: 22032

Message: The JSON object contains a key name that is too long.

</br>
- Error number: 3152; Symbol: ER_JSON_USED_AS_KEY; SQLSTATE: 42000

Message: JSON column '%s' supports indexing only via generated columns on a specified JSON path.

</br>
- Error number: 3153; Symbol: ER_JSON_VACUOUS_PATH; SQLSTATE: 42000

Message: The path expression '$' is not allowed in this context.

</br>
- Error number: 3154; Symbol: ER_JSON_BAD_ONE_OR_ALL_ARG; SQLSTATE: 42000

Message: The oneOrAll argument to %s may take these values: 'one' or 'all'.

</br>
- Error number: 3155; Symbol: ER_NUMERIC_JSON_VALUE_OUT_OF_RANGE; SQLSTATE: 22003

Message: Out of range JSON value for CAST to %s%s from column %s at row %ld

</br>
- Error number: 3156; Symbol: ER_INVALID_JSON_VALUE_FOR_CAST; SQLSTATE: 22018

Message: Invalid JSON value for CAST to %s%s from column %s at row %ld

</br>
- Error number: 3157; Symbol: ER_JSON_DOCUMENT_TOO_DEEP; SQLSTATE: 22032

Message: The JSON document exceeds the maximum depth.

</br>
- Error number: 3158; Symbol: ER_JSON_DOCUMENT_NULL_KEY; SQLSTATE: 22032

Message: JSON documents may not contain NULL member names.

</br>
- Error number: 3159; Symbol: ER_SECURE_TRANSPORT_REQUIRED; SQLSTATE: HY000

Message: Connections using insecure transport are prohibited while --require_secure_transport=ON.

With the require_secure_transport system variable, clients can connect only using secure transports. Qualifying connections are those using SSL, a Unix socket file, or shared memory.

</br>
- Error number: 3160; Symbol: ER_NO_SECURE_TRANSPORTS_CONFIGURED; SQLSTATE: HY000

Message: No secure transports (SSL or Shared Memory) are configured, unable to set --require_secure_transport=ON.

The require_secure_transport system variable cannot be enabled if the server does not support at least one secure transport. Configure the server with the required SSL keys/certificates to enable SSL connections, or enable the shared_memory system variable to enable shared-memory connections.

</br>
- Error number: 3161; Symbol: ER_DISABLED_STORAGE_ENGINE; SQLSTATE: HY000

Message: Storage engine %s is disabled (Table creation is disallowed).

An attempt was made to create a table or tablespace using a storage engine listed in the value of the disabled_storage_engines system variable, or to change an existing table or tablespace to such an engine. Choose a different storage engine.

</br>
- Error number: 3162; Symbol: ER_USER_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Authorization ID %s does not exist.

</br>
- Error number: 3163; Symbol: ER_USER_ALREADY_EXISTS; SQLSTATE: HY000

Message: Authorization ID %s already exists.

</br>
- Error number: 3164; Symbol: ER_AUDIT_API_ABORT; SQLSTATE: HY000

Message: Aborted by Audit API ('%s';%d).

This error indicates that an audit plugin terminated execution of an event. The message typically indicates the event subclass name and a numeric status value.

</br>
- Error number: 3165; Symbol: ER_INVALID_JSON_PATH_ARRAY_CELL; SQLSTATE: 42000

Message: A path expression is not a path to a cell in an array.

</br>
- Error number: 3166; Symbol: ER_BUFPOOL_RESIZE_INPROGRESS; SQLSTATE: HY000

Message: Another buffer pool resize is already in progress.

</br>
- Error number: 3167; Symbol: ER_FEATURE_DISABLED_SEE_DOC; SQLSTATE: HY000

Message: The '%s' feature is disabled; see the documentation for '%s'

</br>
- Error number: 3168; Symbol: ER_SERVER_ISNT_AVAILABLE; SQLSTATE: HY000

Message: Server isn't available

</br>
- Error number: 3169; Symbol: ER_SESSION_WAS_KILLED; SQLSTATE: HY000

Message: Session was killed

</br>
- Error number: 3170; Symbol: ER_CAPACITY_EXCEEDED; SQLSTATE: HY000

Message: Memory capacity of %llu bytes for '%s' exceeded. %s

</br>
- Error number: 3171; Symbol: ER_CAPACITY_EXCEEDED_IN_RANGE_OPTIMIZER; SQLSTATE: HY000

Message: Range optimization was not done for this query.

</br>
- Error number: 3173; Symbol: ER_CANT_WAIT_FOR_EXECUTED_GTID_SET_WHILE_OWNING_A_GTID; SQLSTATE: HY000

Message: The client holds ownership of the GTID %s. Therefore, WAIT_FOR_EXECUTED_GTID_SET cannot wait for this GTID.

</br>
- Error number: 3174; Symbol: ER_CANNOT_ADD_FOREIGN_BASE_COL_VIRTUAL; SQLSTATE: HY000

Message: Cannot add foreign key on the base column of indexed virtual column.

</br>
- Error number: 3175; Symbol: ER_CANNOT_CREATE_VIRTUAL_INDEX_CONSTRAINT; SQLSTATE: HY000

Message: Cannot create index on virtual column whose base column has foreign constraint.

</br>
- Error number: 3176; Symbol: ER_ERROR_ON_MODIFYING_GTID_EXECUTED_TABLE; SQLSTATE: HY000

Message: Please do not modify the %s table with an XA transaction. This is an internal system table used to store GTIDs for committed transactions. Although modifying it can lead to an inconsistent GTID state, if necessary you can modify it with a non-XA transaction.

</br>
- Error number: 3177; Symbol: ER_LOCK_REFUSED_BY_ENGINE; SQLSTATE: HY000

Message: Lock acquisition refused by storage engine.

</br>
- Error number: 3178; Symbol: ER_UNSUPPORTED_ALTER_ONLINE_ON_VIRTUAL_COLUMN; SQLSTATE: HY000

Message: ADD COLUMN col...VIRTUAL, ADD INDEX(col)

</br>
- Error number: 3179; Symbol: ER_MASTER_KEY_ROTATION_NOT_SUPPORTED_BY_SE; SQLSTATE: HY000

Message: Master key rotation is not supported by storage engine.

</br>
- Error number: 3181; Symbol: ER_MASTER_KEY_ROTATION_BINLOG_FAILED; SQLSTATE: HY000

Message: Write to binlog failed. However, master key rotation has been completed successfully.

</br>
- Error number: 3182; Symbol: ER_MASTER_KEY_ROTATION_SE_UNAVAILABLE; SQLSTATE: HY000

Message: Storage engine is not available.

</br>
- Error number: 3183; Symbol: ER_TABLESPACE_CANNOT_ENCRYPT; SQLSTATE: HY000

Message: This tablespace can't be encrypted.

</br>
- Error number: 3184; Symbol: ER_INVALID_ENCRYPTION_OPTION; SQLSTATE: HY000

Message: Invalid encryption option.

</br>
- Error number: 3185; Symbol: ER_CANNOT_FIND_KEY_IN_KEYRING; SQLSTATE: HY000

Message: Can't find master key from keyring, please check in the server log if a keyring is loaded and initialized successfully.

</br>
- Error number: 3186; Symbol: ER_CAPACITY_EXCEEDED_IN_PARSER; SQLSTATE: HY000

Message: Parser bailed out for this query.

</br>
- Error number: 3187; Symbol: ER_UNSUPPORTED_ALTER_ENCRYPTION_INPLACE; SQLSTATE: HY000

Message: Cannot alter encryption attribute by inplace algorithm.

</br>
- Error number: 3188; Symbol: ER_KEYRING_UDF_KEYRING_SERVICE_ERROR; SQLSTATE: HY000

Message: Function '%s' failed because underlying keyring service returned an error. Please check if a keyring is installed and that provided arguments are valid for the keyring you are using.

</br>
- Error number: 3189; Symbol: ER_USER_COLUMN_OLD_LENGTH; SQLSTATE: HY000

Message: It seems that your db schema is old. The %s column is 77 characters long and should be 93 characters long. Please perform the MySQL upgrade procedure.

</br>
- Error number: 3190; Symbol: ER_CANT_RESET_MASTER; SQLSTATE: HY000

Message: RESET MASTER is not allowed because %s.

ER_CANT_RESET_MASTER was removed after 8.0.32.

</br>
- Error number: 3191; Symbol: ER_GROUP_REPLICATION_MAX_GROUP_SIZE; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed since the group already has 9 members.

</br>
- Error number: 3192; Symbol: ER_CANNOT_ADD_FOREIGN_BASE_COL_STORED; SQLSTATE: HY000

Message: Cannot add foreign key on the base column of stored column.

</br>
- Error number: 3193; Symbol: ER_TABLE_REFERENCED; SQLSTATE: HY000

Message: Cannot complete the operation because table is referenced by another connection.

</br>
- Error number: 3197; Symbol: ER_XA_RETRY; SQLSTATE: HY000

Message: The resource manager is not able to commit the transaction branch at this time. Please retry later.

ER_XA_RETRY was added in 8.0.2.

</br>
- Error number: 3198; Symbol: ER_KEYRING_AWS_UDF_AWS_KMS_ERROR; SQLSTATE: HY000

Message: Function %s failed due to: %s.

ER_KEYRING_AWS_UDF_AWS_KMS_ERROR was added in 8.0.2.

</br>
- Error number: 3199; Symbol: ER_BINLOG_UNSAFE_XA; SQLSTATE: HY000

Message: Statement is unsafe because it is being used inside a XA transaction. Concurrent XA transactions may deadlock on replicas when replicated using statements.

ER_BINLOG_UNSAFE_XA was added in 8.0.2.

</br>
- Error number: 3200; Symbol: ER_UDF_ERROR; SQLSTATE: HY000

Message: %s UDF failed; %s

ER_UDF_ERROR was added in 8.0.4.

</br>
- Error number: 3201; Symbol: ER_KEYRING_MIGRATION_FAILURE; SQLSTATE: HY000

Message: Can not perform keyring migration : %s

ER_KEYRING_MIGRATION_FAILURE was added in 8.0.4.

</br>
- Error number: 3202; Symbol: ER_KEYRING_ACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: Access denied; you need %s privileges for this operation

ER_KEYRING_ACCESS_DENIED_ERROR was added in 8.0.4.

</br>
- Error number: 3203; Symbol: ER_KEYRING_MIGRATION_STATUS; SQLSTATE: HY000

Message: Keyring migration %s.

ER_KEYRING_MIGRATION_STATUS was added in 8.0.4.

</br>
- Error number: 3218; Symbol: ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE; SQLSTATE: HY000

Message: Invalid "max_array_length" argument value.

ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE was added in 8.0.11.

</br>
- Error number: 3500; Symbol: ER_UNSUPPORT_COMPRESSED_TEMPORARY_TABLE; SQLSTATE: HY000

Message: CREATE TEMPORARY TABLE is not allowed with ROW_FORMAT=COMPRESSED or KEY_BLOCK_SIZE.

</br>
- Error number: 3501; Symbol: ER_ACL_OPERATION_FAILED; SQLSTATE: HY000

Message: The ACL operation failed due to the following error from SE: errcode %d - %s

</br>
- Error number: 3502; Symbol: ER_UNSUPPORTED_INDEX_ALGORITHM; SQLSTATE: HY000

Message: This storage engine does not support the %s index algorithm, storage engine default was used instead.

</br>
- Error number: 3503; Symbol: ER_NO_SUCH_DB; SQLSTATE: 42Y07

Message: Database '%s' doesn't exist

</br>
- Error number: 3504; Symbol: ER_TOO_BIG_ENUM; SQLSTATE: HY000

Message: Too many enumeration values for column %s.

</br>
- Error number: 3505; Symbol: ER_TOO_LONG_SET_ENUM_VALUE; SQLSTATE: HY000

Message: Too long enumeration/set value for column %s.

</br>
- Error number: 3506; Symbol: ER_INVALID_DD_OBJECT; SQLSTATE: HY000

Message: %s dictionary object is invalid. (%s)

</br>
- Error number: 3507; Symbol: ER_UPDATING_DD_TABLE; SQLSTATE: HY000

Message: Failed to update %s dictionary object.

</br>
- Error number: 3508; Symbol: ER_INVALID_DD_OBJECT_ID; SQLSTATE: HY000

Message: Dictionary object id (%lu) does not exist.

</br>
- Error number: 3509; Symbol: ER_INVALID_DD_OBJECT_NAME; SQLSTATE: HY000

Message: Dictionary object name '%s' is invalid. (%s)

</br>
- Error number: 3510; Symbol: ER_TABLESPACE_MISSING_WITH_NAME; SQLSTATE: HY000

Message: Tablespace %s doesn't exist.

</br>
- Error number: 3511; Symbol: ER_TOO_LONG_ROUTINE_COMMENT; SQLSTATE: HY000

Message: Comment for routine '%s' is too long (max = %lu)

</br>
- Error number: 3512; Symbol: ER_SP_LOAD_FAILED; SQLSTATE: HY000

Message: Failed to load routine '%s'.

</br>
- Error number: 3513; Symbol: ER_INVALID_BITWISE_OPERANDS_SIZE; SQLSTATE: HY000

Message: Binary operands of bitwise operators must be of equal length

</br>
- Error number: 3514; Symbol: ER_INVALID_BITWISE_AGGREGATE_OPERANDS_SIZE; SQLSTATE: HY000

Message: Aggregate bitwise functions cannot accept arguments longer than 511 bytes; consider using the SUBSTRING() function

</br>
- Error number: 3515; Symbol: ER_WARN_UNSUPPORTED_HINT; SQLSTATE: HY000

Message: Hints aren't supported in %s

</br>
- Error number: 3516; Symbol: ER_UNEXPECTED_GEOMETRY_TYPE; SQLSTATE: 22S01

Message: %s value is a geometry of unexpected type %s in %s.

</br>
- Error number: 3517; Symbol: ER_SRS_PARSE_ERROR; SQLSTATE: SR002

Message: Can't parse the spatial reference system definition of SRID %u.

</br>
- Error number: 3518; Symbol: ER_SRS_PROJ_PARAMETER_MISSING; SQLSTATE: SR003

Message: The spatial reference system definition for SRID %u does not specify the mandatory %s (EPSG %u) projection parameter.

</br>
- Error number: 3519; Symbol: ER_WARN_SRS_NOT_FOUND; SQLSTATE: 01000

Message: There's no spatial reference system with SRID %u.

</br>
- Error number: 3520; Symbol: ER_SRS_NOT_CARTESIAN; SQLSTATE: 22S00

Message: Function %s is only defined for Cartesian spatial reference systems, but one of its arguments is in SRID %u, which is not Cartesian.

</br>
- Error number: 3521; Symbol: ER_SRS_NOT_CARTESIAN_UNDEFINED; SQLSTATE: SR001

Message: Function %s is only defined for Cartesian spatial reference systems, but one of its arguments is in SRID %u, which has not been defined.

</br>
- Error number: 3522; Symbol: ER_PK_INDEX_CANT_BE_INVISIBLE; SQLSTATE: HY000

Message: A primary key index cannot be invisible

</br>
- Error number: 3523; Symbol: ER_UNKNOWN_AUTHID; SQLSTATE: HY000

Message: Unknown authorization ID `%s`@`%s`

</br>
- Error number: 3524; Symbol: ER_FAILED_ROLE_GRANT; SQLSTATE: HY000

Message: Failed to grant %s` to %s

</br>
- Error number: 3525; Symbol: ER_OPEN_ROLE_TABLES; SQLSTATE: HY000

Message: Failed to open the security system tables

</br>
- Error number: 3526; Symbol: ER_FAILED_DEFAULT_ROLES; SQLSTATE: HY000

Message: Failed to set default roles

</br>
- Error number: 3527; Symbol: ER_COMPONENTS_NO_SCHEME; SQLSTATE: HY000

Message: Cannot find schema in specified URN: '%s'.

</br>
- Error number: 3528; Symbol: ER_COMPONENTS_NO_SCHEME_SERVICE; SQLSTATE: HY000

Message: Cannot acquire scheme load service implementation for schema '%s' in specified URN: '%s'.

</br>
- Error number: 3529; Symbol: ER_COMPONENTS_CANT_LOAD; SQLSTATE: HY000

Message: Cannot load component from specified URN: '%s'.

</br>
- Error number: 3530; Symbol: ER_ROLE_NOT_GRANTED; SQLSTATE: HY000

Message: `%s`@`%s` is not granted to `%s`@`%s`

</br>
- Error number: 3531; Symbol: ER_FAILED_REVOKE_ROLE; SQLSTATE: HY000

Message: Could not revoke role from `%s`@`%s`

</br>
- Error number: 3532; Symbol: ER_RENAME_ROLE; SQLSTATE: HY000

Message: Renaming of a role identifier is forbidden

</br>
- Error number: 3533; Symbol: ER_COMPONENTS_CANT_ACQUIRE_SERVICE_IMPLEMENTATION; SQLSTATE: HY000

Message: Cannot acquire specified service implementation: '%s'.

</br>
- Error number: 3534; Symbol: ER_COMPONENTS_CANT_SATISFY_DEPENDENCY; SQLSTATE: HY000

Message: Cannot satisfy dependency for service '%s' required by component '%s'.

</br>
- Error number: 3535; Symbol: ER_COMPONENTS_LOAD_CANT_REGISTER_SERVICE_IMPLEMENTATION; SQLSTATE: HY000

Message: Cannot register service implementation '%s' provided by component '%s'.

</br>
- Error number: 3536; Symbol: ER_COMPONENTS_LOAD_CANT_INITIALIZE; SQLSTATE: HY000

Message: Initialization method provided by component '%s' failed.

</br>
- Error number: 3537; Symbol: ER_COMPONENTS_UNLOAD_NOT_LOADED; SQLSTATE: HY000

Message: Component specified by URN '%s' to unload has not been loaded before.

</br>
- Error number: 3538; Symbol: ER_COMPONENTS_UNLOAD_CANT_DEINITIALIZE; SQLSTATE: HY000

Message: De-initialization method provided by component '%s' failed.

</br>
- Error number: 3539; Symbol: ER_COMPONENTS_CANT_RELEASE_SERVICE; SQLSTATE: HY000

Message: Release of previously acquired service implementation failed.

</br>
- Error number: 3540; Symbol: ER_COMPONENTS_UNLOAD_CANT_UNREGISTER_SERVICE; SQLSTATE: HY000

Message: Unregistration of service implementation '%s' provided by component '%s' failed during unloading of the component.

</br>
- Error number: 3541; Symbol: ER_COMPONENTS_CANT_UNLOAD; SQLSTATE: HY000

Message: Cannot unload component from specified URN: '%s'.

</br>
- Error number: 3542; Symbol: ER_WARN_UNLOAD_THE_NOT_PERSISTED; SQLSTATE: HY000

Message: The Persistent Dynamic Loader was used to unload a component '%s', but it was not used to load that component before.

</br>
- Error number: 3543; Symbol: ER_COMPONENT_TABLE_INCORRECT; SQLSTATE: HY000

Message: The mysql.component table is missing or has an incorrect definition.

</br>
- Error number: 3544; Symbol: ER_COMPONENT_MANIPULATE_ROW_FAILED; SQLSTATE: HY000

Message: Failed to manipulate component '%s' persistence data. Error code %d from storage engine.

</br>
- Error number: 3545; Symbol: ER_COMPONENTS_UNLOAD_DUPLICATE_IN_GROUP; SQLSTATE: HY000

Message: The component with specified URN: '%s' was specified in group more than once.

</br>
- Error number: 3546; Symbol: ER_CANT_SET_GTID_PURGED_DUE_SETS_CONSTRAINTS; SQLSTATE: HY000

Message: @@GLOBAL.GTID_PURGED cannot be changed: %s

</br>
- Error number: 3547; Symbol: ER_CANNOT_LOCK_USER_MANAGEMENT_CACHES; SQLSTATE: HY000

Message: Can not lock user management caches for processing.

</br>
- Error number: 3548; Symbol: ER_SRS_NOT_FOUND; SQLSTATE: SR001

Message: There's no spatial reference system with SRID %u.

</br>
- Error number: 3549; Symbol: ER_VARIABLE_NOT_PERSISTED; SQLSTATE: HY000

Message: Variables cannot be persisted. Please retry.

</br>
- Error number: 3550; Symbol: ER_IS_QUERY_INVALID_CLAUSE; SQLSTATE: HY000

Message: Information schema queries do not support the '%s' clause.

</br>
- Error number: 3551; Symbol: ER_UNABLE_TO_STORE_STATISTICS; SQLSTATE: HY000

Message: Unable to store dynamic %s statistics into data dictionary.

</br>
- Error number: 3552; Symbol: ER_NO_SYSTEM_SCHEMA_ACCESS; SQLSTATE: HY000

Message: Access to system schema '%s' is rejected.

</br>
- Error number: 3553; Symbol: ER_NO_SYSTEM_TABLESPACE_ACCESS; SQLSTATE: HY000

Message: Access to system tablespace '%s' is rejected.

</br>
- Error number: 3554; Symbol: ER_NO_SYSTEM_TABLE_ACCESS; SQLSTATE: HY000

Message: Access to %s '%s.%s' is rejected.

</br>
- Error number: 3555; Symbol: ER_NO_SYSTEM_TABLE_ACCESS_FOR_DICTIONARY_TABLE; SQLSTATE: HY000

Message: data dictionary table

ER_NO_SYSTEM_TABLE_ACCESS_FOR_DICTIONARY_TABLE was added in 8.0.1.

</br>
- Error number: 3556; Symbol: ER_NO_SYSTEM_TABLE_ACCESS_FOR_SYSTEM_TABLE; SQLSTATE: HY000

Message: system table

ER_NO_SYSTEM_TABLE_ACCESS_FOR_SYSTEM_TABLE was added in 8.0.1.

</br>
- Error number: 3557; Symbol: ER_NO_SYSTEM_TABLE_ACCESS_FOR_TABLE; SQLSTATE: HY000

Message: table

ER_NO_SYSTEM_TABLE_ACCESS_FOR_TABLE was added in 8.0.1.

</br>
- Error number: 3558; Symbol: ER_INVALID_OPTION_KEY; SQLSTATE: 22023

Message: Invalid option key '%s' in function %s.

ER_INVALID_OPTION_KEY was added in 8.0.1.

</br>
- Error number: 3559; Symbol: ER_INVALID_OPTION_VALUE; SQLSTATE: 22023

Message: Invalid value '%s' for option '%s' in function '%s'.

ER_INVALID_OPTION_VALUE was added in 8.0.1.

</br>
- Error number: 3560; Symbol: ER_INVALID_OPTION_KEY_VALUE_PAIR; SQLSTATE: 22023

Message: The string '%s' is not a valid key %c value pair in function %s.

ER_INVALID_OPTION_KEY_VALUE_PAIR was added in 8.0.1.

</br>
- Error number: 3561; Symbol: ER_INVALID_OPTION_START_CHARACTER; SQLSTATE: 22023

Message: The options argument in function %s starts with the invalid character '%c'.

ER_INVALID_OPTION_START_CHARACTER was added in 8.0.1.

</br>
- Error number: 3562; Symbol: ER_INVALID_OPTION_END_CHARACTER; SQLSTATE: 22023

Message: The options argument in function %s ends with the invalid character '%c'.

ER_INVALID_OPTION_END_CHARACTER was added in 8.0.1.

</br>
- Error number: 3563; Symbol: ER_INVALID_OPTION_CHARACTERS; SQLSTATE: 22023

Message: The options argument in function %s contains the invalid character sequence '%s'.

ER_INVALID_OPTION_CHARACTERS was added in 8.0.1.

</br>
- Error number: 3564; Symbol: ER_DUPLICATE_OPTION_KEY; SQLSTATE: 22023

Message: Duplicate option key '%s' in funtion '%s'.

ER_DUPLICATE_OPTION_KEY was added in 8.0.1.

</br>
- Error number: 3565; Symbol: ER_WARN_SRS_NOT_FOUND_AXIS_ORDER; SQLSTATE: 01000

Message: There's no spatial reference system with SRID %u. The axis order is unknown.

ER_WARN_SRS_NOT_FOUND_AXIS_ORDER was added in 8.0.1.

</br>
- Error number: 3566; Symbol: ER_NO_ACCESS_TO_NATIVE_FCT; SQLSTATE: HY000

Message: Access to native function '%s' is rejected.

ER_NO_ACCESS_TO_NATIVE_FCT was added in 8.0.1.

</br>
- Error number: 3567; Symbol: ER_RESET_MASTER_TO_VALUE_OUT_OF_RANGE; SQLSTATE: HY000

Message: The requested value '%llu' for the next binary log index is out of range. Please use a value between '1' and '%lu'.

ER_RESET_MASTER_TO_VALUE_OUT_OF_RANGE was added in 8.0.1, removed after 8.0.32.

</br>
- Error number: 3568; Symbol: ER_UNRESOLVED_TABLE_LOCK; SQLSTATE: HY000

Message: Unresolved table name %s in locking clause.

ER_UNRESOLVED_TABLE_LOCK was added in 8.0.1.

</br>
- Error number: 3569; Symbol: ER_DUPLICATE_TABLE_LOCK; SQLSTATE: HY000

Message: Table %s appears in multiple locking clauses.

ER_DUPLICATE_TABLE_LOCK was added in 8.0.1.

</br>
- Error number: 3570; Symbol: ER_BINLOG_UNSAFE_SKIP_LOCKED; SQLSTATE: HY000

Message: Statement is unsafe because it uses SKIP LOCKED. The set of inserted values is non-deterministic.

ER_BINLOG_UNSAFE_SKIP_LOCKED was added in 8.0.1.

</br>
- Error number: 3571; Symbol: ER_BINLOG_UNSAFE_NOWAIT; SQLSTATE: HY000

Message: Statement is unsafe because it uses NOWAIT. Whether the command will succeed or fail is not deterministic.

ER_BINLOG_UNSAFE_NOWAIT was added in 8.0.1.

</br>
- Error number: 3572; Symbol: ER_LOCK_NOWAIT; SQLSTATE: HY000

Message: Statement aborted because lock(s) could not be acquired immediately and NOWAIT is set.

ER_LOCK_NOWAIT was added in 8.0.1.

</br>
- Error number: 3573; Symbol: ER_CTE_RECURSIVE_REQUIRES_UNION; SQLSTATE: HY000

Message: Recursive Common Table Expression '%s' should contain a UNION

ER_CTE_RECURSIVE_REQUIRES_UNION was added in 8.0.1.

</br>
- Error number: 3574; Symbol: ER_CTE_RECURSIVE_REQUIRES_NONRECURSIVE_FIRST; SQLSTATE: HY000

Message: Recursive Common Table Expression '%s' should have one or more non-recursive query blocks followed by one or more recursive ones

ER_CTE_RECURSIVE_REQUIRES_NONRECURSIVE_FIRST was added in 8.0.1.

</br>
- Error number: 3575; Symbol: ER_CTE_RECURSIVE_FORBIDS_AGGREGATION; SQLSTATE: HY000

Message: Recursive Common Table Expression '%s' can contain neither aggregation nor window functions in recursive query block

ER_CTE_RECURSIVE_FORBIDS_AGGREGATION was added in 8.0.1.

</br>
- Error number: 3576; Symbol: ER_CTE_RECURSIVE_FORBIDDEN_JOIN_ORDER; SQLSTATE: HY000

Message: In recursive query block of Recursive Common Table Expression '%s', the recursive table must neither be in the right argument of a LEFT JOIN, nor be forced to be non-first with join order hints

ER_CTE_RECURSIVE_FORBIDDEN_JOIN_ORDER was added in 8.0.1.

</br>
- Error number: 3577; Symbol: ER_CTE_RECURSIVE_REQUIRES_SINGLE_REFERENCE; SQLSTATE: HY000

Message: In recursive query block of Recursive Common Table Expression '%s', the recursive table must be referenced only once, and not in any subquery

ER_CTE_RECURSIVE_REQUIRES_SINGLE_REFERENCE was added in 8.0.1.

</br>
- Error number: 3578; Symbol: ER_SWITCH_TMP_ENGINE; SQLSTATE: HY000

Message: '%s' requires @@internal_tmp_disk_storage_engine=InnoDB

ER_SWITCH_TMP_ENGINE was added in 8.0.1.

</br>
- Error number: 3579; Symbol: ER_WINDOW_NO_SUCH_WINDOW; SQLSTATE: HY000

Message: Window name '%s' is not defined.

ER_WINDOW_NO_SUCH_WINDOW was added in 8.0.2.

</br>
- Error number: 3580; Symbol: ER_WINDOW_CIRCULARITY_IN_WINDOW_GRAPH; SQLSTATE: HY000

Message: There is a circularity in the window dependency graph.

ER_WINDOW_CIRCULARITY_IN_WINDOW_GRAPH was added in 8.0.2.

</br>
- Error number: 3581; Symbol: ER_WINDOW_NO_CHILD_PARTITIONING; SQLSTATE: HY000

Message: A window which depends on another cannot define partitioning.

ER_WINDOW_NO_CHILD_PARTITIONING was added in 8.0.2.

</br>
- Error number: 3582; Symbol: ER_WINDOW_NO_INHERIT_FRAME; SQLSTATE: HY000

Message: Window '%s' has a frame definition, so cannot be referenced by another window.

ER_WINDOW_NO_INHERIT_FRAME was added in 8.0.2.

</br>
- Error number: 3583; Symbol: ER_WINDOW_NO_REDEFINE_ORDER_BY; SQLSTATE: HY000

Message: Window '%s' cannot inherit '%s' since both contain an ORDER BY clause.

ER_WINDOW_NO_REDEFINE_ORDER_BY was added in 8.0.2.

</br>
- Error number: 3584; Symbol: ER_WINDOW_FRAME_START_ILLEGAL; SQLSTATE: HY000

Message: Window '%s': frame start cannot be UNBOUNDED FOLLOWING.

ER_WINDOW_FRAME_START_ILLEGAL was added in 8.0.2.

</br>
- Error number: 3585; Symbol: ER_WINDOW_FRAME_END_ILLEGAL; SQLSTATE: HY000

Message: Window '%s': frame end cannot be UNBOUNDED PRECEDING.

ER_WINDOW_FRAME_END_ILLEGAL was added in 8.0.2.

</br>
- Error number: 3586; Symbol: ER_WINDOW_FRAME_ILLEGAL; SQLSTATE: HY000

Message: Window '%s': frame start or end is negative, NULL or of non-integral type

ER_WINDOW_FRAME_ILLEGAL was added in 8.0.2.

</br>
- Error number: 3587; Symbol: ER_WINDOW_RANGE_FRAME_ORDER_TYPE; SQLSTATE: HY000

Message: Window '%s' with RANGE N PRECEDING/FOLLOWING frame requires exactly one ORDER BY expression, of numeric or temporal type

ER_WINDOW_RANGE_FRAME_ORDER_TYPE was added in 8.0.2.

</br>
- Error number: 3588; Symbol: ER_WINDOW_RANGE_FRAME_TEMPORAL_TYPE; SQLSTATE: HY000

Message: Window '%s' with RANGE frame has ORDER BY expression of datetime type. Only INTERVAL bound value allowed.

ER_WINDOW_RANGE_FRAME_TEMPORAL_TYPE was added in 8.0.2.

</br>
- Error number: 3589; Symbol: ER_WINDOW_RANGE_FRAME_NUMERIC_TYPE; SQLSTATE: HY000

Message: Window '%s' with RANGE frame has ORDER BY expression of numeric type, INTERVAL bound value not allowed.

ER_WINDOW_RANGE_FRAME_NUMERIC_TYPE was added in 8.0.2.

</br>
- Error number: 3590; Symbol: ER_WINDOW_RANGE_BOUND_NOT_CONSTANT; SQLSTATE: HY000

Message: Window '%s' has a non-constant frame bound.

ER_WINDOW_RANGE_BOUND_NOT_CONSTANT was added in 8.0.2.

</br>
- Error number: 3591; Symbol: ER_WINDOW_DUPLICATE_NAME; SQLSTATE: HY000

Message: Window '%s' is defined twice.

ER_WINDOW_DUPLICATE_NAME was added in 8.0.2.

</br>
- Error number: 3592; Symbol: ER_WINDOW_ILLEGAL_ORDER_BY; SQLSTATE: HY000

Message: Window '%s': ORDER BY or PARTITION BY uses legacy position indication which is not supported, use expression.

ER_WINDOW_ILLEGAL_ORDER_BY was added in 8.0.2.

</br>
- Error number: 3593; Symbol: ER_WINDOW_INVALID_WINDOW_FUNC_USE; SQLSTATE: HY000

Message: You cannot use the window function '%s' in this context.'

ER_WINDOW_INVALID_WINDOW_FUNC_USE was added in 8.0.2.

</br>
- Error number: 3594; Symbol: ER_WINDOW_INVALID_WINDOW_FUNC_ALIAS_USE; SQLSTATE: HY000

Message: You cannot use the alias '%s' of an expression containing a window function in this context.'

ER_WINDOW_INVALID_WINDOW_FUNC_ALIAS_USE was added in 8.0.2.

</br>
- Error number: 3595; Symbol: ER_WINDOW_NESTED_WINDOW_FUNC_USE_IN_WINDOW_SPEC; SQLSTATE: HY000

Message: You cannot nest a window function in the specification of window '%s'.

ER_WINDOW_NESTED_WINDOW_FUNC_USE_IN_WINDOW_SPEC was added in 8.0.2.

</br>
- Error number: 3596; Symbol: ER_WINDOW_ROWS_INTERVAL_USE; SQLSTATE: HY000

Message: Window '%s': INTERVAL can only be used with RANGE frames.

ER_WINDOW_ROWS_INTERVAL_USE was added in 8.0.2.

</br>
- Error number: 3597; Symbol: ER_WINDOW_NO_GROUP_ORDER; SQLSTATE: HY000

Message: ASC or DESC with GROUP BY isn't allowed with window functions; put ASC or DESC in ORDER BY

ER_WINDOW_NO_GROUP_ORDER was added in 8.0.2, removed after 8.0.12.

</br>
- Error number: 3597; Symbol: ER_WINDOW_NO_GROUP_ORDER_UNUSED; SQLSTATE: HY000

Message: ASC or DESC with GROUP BY isn't allowed with window functions; put ASC or DESC in ORDER BY

ER_WINDOW_NO_GROUP_ORDER_UNUSED was added in 8.0.13.

</br>
- Error number: 3598; Symbol: ER_WINDOW_EXPLAIN_JSON; SQLSTATE: HY000

Message: To get information about window functions use EXPLAIN FORMAT=JSON

ER_WINDOW_EXPLAIN_JSON was added in 8.0.2.

</br>
- Error number: 3599; Symbol: ER_WINDOW_FUNCTION_IGNORES_FRAME; SQLSTATE: HY000

Message: Window function '%s' ignores the frame clause of window '%s' and aggregates over the whole partition

ER_WINDOW_FUNCTION_IGNORES_FRAME was added in 8.0.2.

</br>
- Error number: 3600; Symbol: ER_WINDOW_SE_NOT_ACCEPTABLE; SQLSTATE: HY000

Message: Windowing requires @@internal_tmp_mem_storage_engine=TempTable.

ER_WINDOW_SE_NOT_ACCEPTABLE was added in 8.0.2, removed after 8.0.3.

</br>
- Error number: 3600; Symbol: ER_WL9236_NOW_UNUSED; SQLSTATE: HY000

Message: Windowing requires @@internal_tmp_mem_storage_engine=TempTable.

ER_WL9236_NOW_UNUSED was added in 8.0.4.

</br>
- Error number: 3601; Symbol: ER_INVALID_NO_OF_ARGS; SQLSTATE: HY000

Message: Too many arguments for function %s: %lu; maximum allowed is %s.

ER_INVALID_NO_OF_ARGS was added in 8.0.1.

</br>
- Error number: 3602; Symbol: ER_FIELD_IN_GROUPING_NOT_GROUP_BY; SQLSTATE: HY000

Message: Argument #%u of GROUPING function is not in GROUP BY

ER_FIELD_IN_GROUPING_NOT_GROUP_BY was added in 8.0.1.

</br>
- Error number: 3603; Symbol: ER_TOO_LONG_TABLESPACE_COMMENT; SQLSTATE: HY000

Message: Comment for tablespace '%s' is too long (max = %lu)

ER_TOO_LONG_TABLESPACE_COMMENT was added in 8.0.1.

</br>
- Error number: 3604; Symbol: ER_ENGINE_CANT_DROP_TABLE; SQLSTATE: HY000

Message: Storage engine can't drop table '%s'

ER_ENGINE_CANT_DROP_TABLE was added in 8.0.1.

</br>
- Error number: 3605; Symbol: ER_ENGINE_CANT_DROP_MISSING_TABLE; SQLSTATE: HY000

Message: Storage engine can't drop table '%s' because it is missing. Use DROP TABLE IF EXISTS to remove it from data-dictionary.

ER_ENGINE_CANT_DROP_MISSING_TABLE was added in 8.0.1.

</br>
- Error number: 3606; Symbol: ER_TABLESPACE_DUP_FILENAME; SQLSTATE: HY000

Message: Duplicate file name for tablespace '%s'

ER_TABLESPACE_DUP_FILENAME was added in 8.0.1.

</br>
- Error number: 3607; Symbol: ER_DB_DROP_RMDIR2; SQLSTATE: HY000

Message: Problem while dropping database. Can't remove database directory (%s). Please remove it manually.

ER_DB_DROP_RMDIR2 was added in 8.0.1.

</br>
- Error number: 3608; Symbol: ER_IMP_NO_FILES_MATCHED; SQLSTATE: HY000

Message: No SDI files matched the pattern '%s'

ER_IMP_NO_FILES_MATCHED was added in 8.0.1.

</br>
- Error number: 3609; Symbol: ER_IMP_SCHEMA_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Schema '%s', referenced in SDI, does not exist.

ER_IMP_SCHEMA_DOES_NOT_EXIST was added in 8.0.1.

</br>
- Error number: 3610; Symbol: ER_IMP_TABLE_ALREADY_EXISTS; SQLSTATE: HY000

Message: Table '%s.%s', referenced in SDI, already exists.

ER_IMP_TABLE_ALREADY_EXISTS was added in 8.0.1.

</br>
- Error number: 3611; Symbol: ER_IMP_INCOMPATIBLE_MYSQLD_VERSION; SQLSTATE: HY000

Message: Imported mysqld_version (%llu) is not compatible with current (%llu)

ER_IMP_INCOMPATIBLE_MYSQLD_VERSION was added in 8.0.1.

</br>
- Error number: 3612; Symbol: ER_IMP_INCOMPATIBLE_DD_VERSION; SQLSTATE: HY000

Message: Imported dd version (%u) is not compatible with current (%u)

ER_IMP_INCOMPATIBLE_DD_VERSION was added in 8.0.1.

</br>
- Error number: 3613; Symbol: ER_IMP_INCOMPATIBLE_SDI_VERSION; SQLSTATE: HY000

Message: Imported sdi version (%llu) is not compatible with current (%llu)

ER_IMP_INCOMPATIBLE_SDI_VERSION was added in 8.0.1.

</br>
- Error number: 3614; Symbol: ER_WARN_INVALID_HINT; SQLSTATE: HY000

Message: Invalid number of arguments for hint %s

ER_WARN_INVALID_HINT was added in 8.0.1.

</br>
- Error number: 3615; Symbol: ER_VAR_DOES_NOT_EXIST; SQLSTATE: HY000

Message: Variable %s does not exist in persisted config file

ER_VAR_DOES_NOT_EXIST was added in 8.0.1.

</br>
- Error number: 3616; Symbol: ER_LONGITUDE_OUT_OF_RANGE; SQLSTATE: 22S02

Message: Longitude %f is out of range in function %s. It must be within (%f, %f].

ER_LONGITUDE_OUT_OF_RANGE was added in 8.0.1.

</br>
- Error number: 3617; Symbol: ER_LATITUDE_OUT_OF_RANGE; SQLSTATE: 22S03

Message: Latitude %f is out of range in function %s. It must be within [%f, %f].

ER_LATITUDE_OUT_OF_RANGE was added in 8.0.1.

</br>
- Error number: 3618; Symbol: ER_NOT_IMPLEMENTED_FOR_GEOGRAPHIC_SRS; SQLSTATE: 22S00

Message: %s(%s) has not been implemented for geographic spatial reference systems.

ER_NOT_IMPLEMENTED_FOR_GEOGRAPHIC_SRS was added in 8.0.1.

</br>
- Error number: 3619; Symbol: ER_ILLEGAL_PRIVILEGE_LEVEL; SQLSTATE: HY000

Message: Illegal privilege level specified for %s

ER_ILLEGAL_PRIVILEGE_LEVEL was added in 8.0.1.

</br>
- Error number: 3620; Symbol: ER_NO_SYSTEM_VIEW_ACCESS; SQLSTATE: HY000

Message: Access to system view INFORMATION_SCHEMA.'%s' is rejected.

ER_NO_SYSTEM_VIEW_ACCESS was added in 8.0.2.

</br>
- Error number: 3621; Symbol: ER_COMPONENT_FILTER_FLABBERGASTED; SQLSTATE: HY000

Message: The log-filter component "%s" got confused at "%s" ...

ER_COMPONENT_FILTER_FLABBERGASTED was added in 8.0.2.

</br>
- Error number: 3622; Symbol: ER_PART_EXPR_TOO_LONG; SQLSTATE: HY000

Message: Partitioning expression is too long.

ER_PART_EXPR_TOO_LONG was added in 8.0.2.

</br>
- Error number: 3623; Symbol: ER_UDF_DROP_DYNAMICALLY_REGISTERED; SQLSTATE: HY000

Message: DROP FUNCTION can't drop a dynamically registered user defined function

ER_UDF_DROP_DYNAMICALLY_REGISTERED was added in 8.0.2.

</br>
- Error number: 3624; Symbol: ER_UNABLE_TO_STORE_COLUMN_STATISTICS; SQLSTATE: HY000

Message: Unable to store column statistics for column '%s' in table '%s'.'%s'

ER_UNABLE_TO_STORE_COLUMN_STATISTICS was added in 8.0.2.

</br>
- Error number: 3625; Symbol: ER_UNABLE_TO_UPDATE_COLUMN_STATISTICS; SQLSTATE: HY000

Message: Unable to update column statistics for column '%s' in table '%s'.'%s'

ER_UNABLE_TO_UPDATE_COLUMN_STATISTICS was added in 8.0.2.

</br>
- Error number: 3626; Symbol: ER_UNABLE_TO_DROP_COLUMN_STATISTICS; SQLSTATE: HY000

Message: Unable to remove column statistics for column '%s' in table '%s'.'%s'

ER_UNABLE_TO_DROP_COLUMN_STATISTICS was added in 8.0.2.

</br>
- Error number: 3627; Symbol: ER_UNABLE_TO_BUILD_HISTOGRAM; SQLSTATE: HY000

Message: Unable to build histogram statistics for column '%s' in table '%s'.'%s'

ER_UNABLE_TO_BUILD_HISTOGRAM was added in 8.0.2.

</br>
- Error number: 3628; Symbol: ER_MANDATORY_ROLE; SQLSTATE: HY000

Message: The role %s is a mandatory role and can't be revoked or dropped. The restriction can be lifted by excluding the role identifier from the global variable mandatory_roles.

ER_MANDATORY_ROLE was added in 8.0.2.

</br>
- Error number: 3629; Symbol: ER_MISSING_TABLESPACE_FILE; SQLSTATE: HY000

Message: Tablespace '%s' does not have a file named '%s'

ER_MISSING_TABLESPACE_FILE was added in 8.0.3.

</br>
- Error number: 3630; Symbol: ER_PERSIST_ONLY_ACCESS_DENIED_ERROR; SQLSTATE: 42000

Message: Access denied; you need %s privileges for this operation

ER_PERSIST_ONLY_ACCESS_DENIED_ERROR was added in 8.0.3.

</br>
- Error number: 3631; Symbol: ER_CMD_NEED_SUPER; SQLSTATE: HY000

Message: You need the SUPER privilege for command '%s'

ER_CMD_NEED_SUPER was added in 8.0.3.

</br>
- Error number: 3632; Symbol: ER_PATH_IN_DATADIR; SQLSTATE: HY000

Message: Path is within the current data directory '%s'

ER_PATH_IN_DATADIR was added in 8.0.3.

</br>
- Error number: 3633; Symbol: ER_DDL_IN_PROGRESS; SQLSTATE: HY000

Message: Concurrent DDL is performed during the operation. Please try again.

ER_DDL_IN_PROGRESS was added in 8.0.3, removed after 8.0.16.

</br>
- Error number: 3633; Symbol: ER_CLONE_DDL_IN_PROGRESS; SQLSTATE: HY000

Message: Concurrent DDL is performed during clone operation. Please try again.

ER_CLONE_DDL_IN_PROGRESS was added in 8.0.17.

</br>
- Error number: 3634; Symbol: ER_TOO_MANY_CONCURRENT_CLONES; SQLSTATE: HY000

Message: Too many concurrent clone operations. Maximum allowed - %d.

ER_TOO_MANY_CONCURRENT_CLONES was added in 8.0.3, removed after 8.0.16.

</br>
- Error number: 3634; Symbol: ER_CLONE_TOO_MANY_CONCURRENT_CLONES; SQLSTATE: HY000

Message: Too many concurrent clone operations. Maximum allowed - %d.

ER_CLONE_TOO_MANY_CONCURRENT_CLONES was added in 8.0.17.

</br>
- Error number: 3635; Symbol: ER_APPLIER_LOG_EVENT_VALIDATION_ERROR; SQLSTATE: HY000

Message: The table in transaction %s does not comply with the requirements by an external plugin.

ER_APPLIER_LOG_EVENT_VALIDATION_ERROR was added in 8.0.3.

</br>
- Error number: 3636; Symbol: ER_CTE_MAX_RECURSION_DEPTH; SQLSTATE: HY000

Message: Recursive query aborted after %u iterations. Try increasing @@cte_max_recursion_depth to a larger value.

ER_CTE_MAX_RECURSION_DEPTH was added in 8.0.3.

</br>
- Error number: 3637; Symbol: ER_NOT_HINT_UPDATABLE_VARIABLE; SQLSTATE: HY000

Message: Variable %s cannot be set using SET_VAR hint.

ER_NOT_HINT_UPDATABLE_VARIABLE was added in 8.0.3.

</br>
- Error number: 3638; Symbol: ER_CREDENTIALS_CONTRADICT_TO_HISTORY; SQLSTATE: HY000

Message: Cannot use these credentials for '%.*s@%.*s' because they contradict the password history policy

ER_CREDENTIALS_CONTRADICT_TO_HISTORY was added in 8.0.3.

</br>
- Error number: 3639; Symbol: ER_WARNING_PASSWORD_HISTORY_CLAUSES_VOID; SQLSTATE: HY000

Message: Non-zero password history clauses ignored for user '%s'@'%s' as its authentication plugin %s does not support password history

ER_WARNING_PASSWORD_HISTORY_CLAUSES_VOID was added in 8.0.3.

</br>
- Error number: 3640; Symbol: ER_CLIENT_DOES_NOT_SUPPORT; SQLSTATE: HY000

Message: The client doesn't support %s

ER_CLIENT_DOES_NOT_SUPPORT was added in 8.0.3.

</br>
- Error number: 3641; Symbol: ER_I_S_SKIPPED_TABLESPACE; SQLSTATE: HY000

Message: Tablespace '%s' was skipped since its definition is being modified by concurrent DDL statement

ER_I_S_SKIPPED_TABLESPACE was added in 8.0.3.

</br>
- Error number: 3642; Symbol: ER_TABLESPACE_ENGINE_MISMATCH; SQLSTATE: HY000

Message: Engine '%s' does not match stored engine '%s' for tablespace '%s'

ER_TABLESPACE_ENGINE_MISMATCH was added in 8.0.3.

</br>
- Error number: 3643; Symbol: ER_WRONG_SRID_FOR_COLUMN; SQLSTATE: HY000

Message: The SRID of the geometry does not match the SRID of the column '%s'. The SRID of the geometry is %lu, but the SRID of the column is %lu. Consider changing the SRID of the geometry or the SRID property of the column.

ER_WRONG_SRID_FOR_COLUMN was added in 8.0.3.

</br>
- Error number: 3644; Symbol: ER_CANNOT_ALTER_SRID_DUE_TO_INDEX; SQLSTATE: HY000

Message: The SRID specification on the column '%s' cannot be changed because there is a spatial index on the column. Please remove the spatial index before altering the SRID specification.

ER_CANNOT_ALTER_SRID_DUE_TO_INDEX was added in 8.0.3.

</br>
- Error number: 3645; Symbol: ER_WARN_BINLOG_PARTIAL_UPDATES_DISABLED; SQLSTATE: HY000

Message: When %s, the option binlog_row_value_options=%s will be ignored and updates will be written in full format to binary log.

ER_WARN_BINLOG_PARTIAL_UPDATES_DISABLED was added in 8.0.3.

</br>
- Error number: 3646; Symbol: ER_WARN_BINLOG_V1_ROW_EVENTS_DISABLED; SQLSTATE: HY000

Message: When %s, the option log_bin_use_v1_row_events=1 will be ignored and row events will be written in new format to binary log.

ER_WARN_BINLOG_V1_ROW_EVENTS_DISABLED was added in 8.0.3.

</br>
- Error number: 3647; Symbol: ER_WARN_BINLOG_PARTIAL_UPDATES_SUGGESTS_PARTIAL_IMAGES; SQLSTATE: HY000

Message: When %s, the option binlog_row_value_options=%s will be used only for the after-image. Full values will be written in the before-image, so the saving in disk space due to binlog_row_value_options is limited to less than 50%%.

ER_WARN_BINLOG_PARTIAL_UPDATES_SUGGESTS_PARTIAL_IMAGES was added in 8.0.3.

</br>
- Error number: 3648; Symbol: ER_COULD_NOT_APPLY_JSON_DIFF; SQLSTATE: HY000

Message: Could not apply JSON diff in table %.*s, column %s.

ER_COULD_NOT_APPLY_JSON_DIFF was added in 8.0.3.

</br>
- Error number: 3649; Symbol: ER_CORRUPTED_JSON_DIFF; SQLSTATE: HY000

Message: Corrupted JSON diff for table %.*s, column %s.

ER_CORRUPTED_JSON_DIFF was added in 8.0.3.

</br>
- Error number: 3650; Symbol: ER_RESOURCE_GROUP_EXISTS; SQLSTATE: HY000

Message: Resource Group '%s' exists

ER_RESOURCE_GROUP_EXISTS was added in 8.0.3.

</br>
- Error number: 3651; Symbol: ER_RESOURCE_GROUP_NOT_EXISTS; SQLSTATE: HY000

Message: Resource Group '%s' does not exist.

ER_RESOURCE_GROUP_NOT_EXISTS was added in 8.0.3.

</br>
- Error number: 3652; Symbol: ER_INVALID_VCPU_ID; SQLSTATE: HY000

Message: Invalid cpu id %u

ER_INVALID_VCPU_ID was added in 8.0.3.

</br>
- Error number: 3653; Symbol: ER_INVALID_VCPU_RANGE; SQLSTATE: HY000

Message: Invalid VCPU range %u-%u

ER_INVALID_VCPU_RANGE was added in 8.0.3.

</br>
- Error number: 3654; Symbol: ER_INVALID_THREAD_PRIORITY; SQLSTATE: HY000

Message: Invalid thread priority value %d for %s resource group %s. Allowed range is [%d, %d].

ER_INVALID_THREAD_PRIORITY was added in 8.0.3.

</br>
- Error number: 3655; Symbol: ER_DISALLOWED_OPERATION; SQLSTATE: HY000

Message: %s operation is disallowed on %s

ER_DISALLOWED_OPERATION was added in 8.0.3.

</br>
- Error number: 3656; Symbol: ER_RESOURCE_GROUP_BUSY; SQLSTATE: HY000

Message: Resource group %s is busy.

ER_RESOURCE_GROUP_BUSY was added in 8.0.3.

</br>
- Error number: 3657; Symbol: ER_RESOURCE_GROUP_DISABLED; SQLSTATE: HY000

Message: Resource group %s is disabled.

ER_RESOURCE_GROUP_DISABLED was added in 8.0.3.

</br>
- Error number: 3658; Symbol: ER_FEATURE_UNSUPPORTED; SQLSTATE: HY000

Message: Feature %s is unsupported (%s).

ER_FEATURE_UNSUPPORTED was added in 8.0.3.

</br>
- Error number: 3659; Symbol: ER_ATTRIBUTE_IGNORED; SQLSTATE: HY000

Message: Attribute %s is ignored (%s).

ER_ATTRIBUTE_IGNORED was added in 8.0.3.

</br>
- Error number: 3660; Symbol: ER_INVALID_THREAD_ID; SQLSTATE: HY000

Message: Invalid thread id (%llu).

ER_INVALID_THREAD_ID was added in 8.0.3.

</br>
- Error number: 3661; Symbol: ER_RESOURCE_GROUP_BIND_FAILED; SQLSTATE: HY000

Message: Unable to bind resource group %s with thread id (%llu).(%s).

ER_RESOURCE_GROUP_BIND_FAILED was added in 8.0.3.

</br>
- Error number: 3662; Symbol: ER_INVALID_USE_OF_FORCE_OPTION; SQLSTATE: HY000

Message: Option FORCE invalid as DISABLE option is not specified.

ER_INVALID_USE_OF_FORCE_OPTION was added in 8.0.3.

</br>
- Error number: 3663; Symbol: ER_GROUP_REPLICATION_COMMAND_FAILURE; SQLSTATE: HY000

Message: The %s command encountered a failure. %s

ER_GROUP_REPLICATION_COMMAND_FAILURE was added in 8.0.4.

</br>
- Error number: 3664; Symbol: ER_SDI_OPERATION_FAILED; SQLSTATE: HY000

Message: Failed to %s SDI '%s.%s' in tablespace '%s'.

ER_SDI_OPERATION_FAILED was added in 8.0.3.

</br>
- Error number: 3665; Symbol: ER_MISSING_JSON_TABLE_VALUE; SQLSTATE: 22035

Message: Missing value for JSON_TABLE column '%s'

ER_MISSING_JSON_TABLE_VALUE was added in 8.0.4.

</br>
- Error number: 3666; Symbol: ER_WRONG_JSON_TABLE_VALUE; SQLSTATE: 2203F

Message: Can't store an array or an object in the scalar JSON_TABLE column '%s'

ER_WRONG_JSON_TABLE_VALUE was added in 8.0.4.

</br>
- Error number: 3667; Symbol: ER_TF_MUST_HAVE_ALIAS; SQLSTATE: 42000

Message: Every table function must have an alias

ER_TF_MUST_HAVE_ALIAS was added in 8.0.4.

</br>
- Error number: 3668; Symbol: ER_TF_FORBIDDEN_JOIN_TYPE; SQLSTATE: HY000

Message: INNER or LEFT JOIN must be used for LATERAL references made by '%s'

ER_TF_FORBIDDEN_JOIN_TYPE was added in 8.0.4.

</br>
- Error number: 3669; Symbol: ER_JT_VALUE_OUT_OF_RANGE; SQLSTATE: 22003

Message: Value is out of range for JSON_TABLE's column '%s'

ER_JT_VALUE_OUT_OF_RANGE was added in 8.0.4.

</br>
- Error number: 3670; Symbol: ER_JT_MAX_NESTED_PATH; SQLSTATE: 42000

Message: More than supported %u NESTED PATHs were found in JSON_TABLE '%s'

ER_JT_MAX_NESTED_PATH was added in 8.0.4.

</br>
- Error number: 3671; Symbol: ER_PASSWORD_EXPIRATION_NOT_SUPPORTED_BY_AUTH_METHOD; SQLSTATE: HY000

Message: The selected authentication method %.*s does not support password expiration

ER_PASSWORD_EXPIRATION_NOT_SUPPORTED_BY_AUTH_METHOD was added in 8.0.4.

</br>
- Error number: 3672; Symbol: ER_INVALID_GEOJSON_CRS_NOT_TOP_LEVEL; SQLSTATE: HY000

Message: Invalid GeoJSON data provided to function %s: Member 'crs' must be specified in the top level object.

ER_INVALID_GEOJSON_CRS_NOT_TOP_LEVEL was added in 8.0.4.

</br>
- Error number: 3673; Symbol: ER_BAD_NULL_ERROR_NOT_IGNORED; SQLSTATE: 23000

Message: Column '%s' cannot be null

ER_BAD_NULL_ERROR_NOT_IGNORED was added in 8.0.4.

</br>
- Error number: 3674; Symbol: WARN_USELESS_SPATIAL_INDEX; SQLSTATE: HY000

Message: The spatial index on column '%s' will not be used by the query optimizer since the column does not have an SRID attribute. Consider adding an SRID attribute to the column.

WARN_USELESS_SPATIAL_INDEX was added in 8.0.4.

</br>
- Error number: 3675; Symbol: ER_DISK_FULL_NOWAIT; SQLSTATE: HY000

Message: Create table/tablespace '%s' failed, as disk is full

ER_DISK_FULL_NOWAIT was added in 8.0.4.

</br>
- Error number: 3676; Symbol: ER_PARSE_ERROR_IN_DIGEST_FN; SQLSTATE: HY000

Message: Could not parse argument to digest function: "%s".

ER_PARSE_ERROR_IN_DIGEST_FN was added in 8.0.4.

</br>
- Error number: 3677; Symbol: ER_UNDISCLOSED_PARSE_ERROR_IN_DIGEST_FN; SQLSTATE: HY000

Message: Could not parse argument to digest function.

ER_UNDISCLOSED_PARSE_ERROR_IN_DIGEST_FN was added in 8.0.4.

</br>
- Error number: 3678; Symbol: ER_SCHEMA_DIR_EXISTS; SQLSTATE: HY000

Message: Schema directory '%s' already exists. This must be resolved manually (e.g. by moving the schema directory to another location).

ER_SCHEMA_DIR_EXISTS was added in 8.0.4.

</br>
- Error number: 3679; Symbol: ER_SCHEMA_DIR_MISSING; SQLSTATE: HY000

Message: Schema directory '%s' does not exist

ER_SCHEMA_DIR_MISSING was added in 8.0.4.

</br>
- Error number: 3680; Symbol: ER_SCHEMA_DIR_CREATE_FAILED; SQLSTATE: HY000

Message: Failed to create schema directory '%s' (errno: %d - %s)

ER_SCHEMA_DIR_CREATE_FAILED was added in 8.0.4.

</br>
- Error number: 3681; Symbol: ER_SCHEMA_DIR_UNKNOWN; SQLSTATE: HY000

Message: Schema '%s' does not exist, but schema directory '%s' was found. This must be resolved manually (e.g. by moving the schema directory to another location).

ER_SCHEMA_DIR_UNKNOWN was added in 8.0.4.

</br>
- Error number: 3682; Symbol: ER_ONLY_IMPLEMENTED_FOR_SRID_0_AND_4326; SQLSTATE: 22S00

Message: Function %s is only defined for SRID 0 and SRID 4326.

ER_ONLY_IMPLEMENTED_FOR_SRID_0_AND_4326 was added in 8.0.4.

</br>
- Error number: 3683; Symbol: ER_BINLOG_EXPIRE_LOG_DAYS_AND_SECS_USED_TOGETHER; SQLSTATE: HY000

Message: The option expire_logs_days and binlog_expire_logs_seconds cannot be used together. Please use binlog_expire_logs_seconds to set the expire time (expire_logs_days is deprecated)

ER_BINLOG_EXPIRE_LOG_DAYS_AND_SECS_USED_TOGETHER was added in 8.0.11.

</br>
- Error number: 3684; Symbol: ER_REGEXP_STRING_NOT_TERMINATED; SQLSTATE: HY000

Message: An output string could not be zero-terminated because the length exceeds the buffer capacity.

ER_REGEXP_STRING_NOT_TERMINATED was added in 8.0.4, removed after 8.0.4.

</br>
- Error number: 3684; Symbol: ER_REGEXP_BUFFER_OVERFLOW; SQLSTATE: HY000

Message: The result string is larger than the result buffer.

ER_REGEXP_BUFFER_OVERFLOW was added in 8.0.4.

</br>
- Error number: 3685; Symbol: ER_REGEXP_ILLEGAL_ARGUMENT; SQLSTATE: HY000

Message: Illegal argument to a regular expression.

ER_REGEXP_ILLEGAL_ARGUMENT was added in 8.0.4.

</br>
- Error number: 3686; Symbol: ER_REGEXP_INDEX_OUTOFBOUNDS_ERROR; SQLSTATE: HY000

Message: Index out of bounds in regular expression search.

ER_REGEXP_INDEX_OUTOFBOUNDS_ERROR was added in 8.0.4.

</br>
- Error number: 3687; Symbol: ER_REGEXP_INTERNAL_ERROR; SQLSTATE: HY000

Message: Internal error in the regular expression library.

ER_REGEXP_INTERNAL_ERROR was added in 8.0.4.

</br>
- Error number: 3688; Symbol: ER_REGEXP_RULE_SYNTAX; SQLSTATE: HY000

Message: Syntax error in regular expression on line %u, character %u.

ER_REGEXP_RULE_SYNTAX was added in 8.0.4.

</br>
- Error number: 3689; Symbol: ER_REGEXP_BAD_ESCAPE_SEQUENCE; SQLSTATE: HY000

Message: Unrecognized escape sequence in regular expression.

ER_REGEXP_BAD_ESCAPE_SEQUENCE was added in 8.0.4.

</br>
- Error number: 3690; Symbol: ER_REGEXP_UNIMPLEMENTED; SQLSTATE: HY000

Message: The regular expression contains a feature that is not implemented in this library version.

ER_REGEXP_UNIMPLEMENTED was added in 8.0.4.

</br>
- Error number: 3691; Symbol: ER_REGEXP_MISMATCHED_PAREN; SQLSTATE: HY000

Message: Mismatched parenthesis in regular expression.

ER_REGEXP_MISMATCHED_PAREN was added in 8.0.4.

</br>
- Error number: 3692; Symbol: ER_REGEXP_BAD_INTERVAL; SQLSTATE: HY000

Message: Incorrect description of a {min,max} interval.

ER_REGEXP_BAD_INTERVAL was added in 8.0.4.

</br>
- Error number: 3693; Symbol: ER_REGEXP_MAX_LT_MIN; SQLSTATE: HY000

Message: The maximum is less than the minumum in a {min,max} interval.

ER_REGEXP_MAX_LT_MIN was added in 8.0.4.

</br>
- Error number: 3694; Symbol: ER_REGEXP_INVALID_BACK_REF; SQLSTATE: HY000

Message: Invalid back-reference in regular expression.

ER_REGEXP_INVALID_BACK_REF was added in 8.0.4.

</br>
- Error number: 3695; Symbol: ER_REGEXP_LOOK_BEHIND_LIMIT; SQLSTATE: HY000

Message: The look-behind assertion exceeds the limit in regular expression.

ER_REGEXP_LOOK_BEHIND_LIMIT was added in 8.0.4.

</br>
- Error number: 3696; Symbol: ER_REGEXP_MISSING_CLOSE_BRACKET; SQLSTATE: HY000

Message: The regular expression contains an unclosed bracket expression.

ER_REGEXP_MISSING_CLOSE_BRACKET was added in 8.0.4.

</br>
- Error number: 3697; Symbol: ER_REGEXP_INVALID_RANGE; SQLSTATE: HY000

Message: The regular expression contains an [x-y] character range where x comes after y.

ER_REGEXP_INVALID_RANGE was added in 8.0.4.

</br>
- Error number: 3698; Symbol: ER_REGEXP_STACK_OVERFLOW; SQLSTATE: HY000

Message: Overflow in the regular expression backtrack stack.

ER_REGEXP_STACK_OVERFLOW was added in 8.0.4.

</br>
- Error number: 3699; Symbol: ER_REGEXP_TIME_OUT; SQLSTATE: HY000

Message: Timeout exceeded in regular expression match.

ER_REGEXP_TIME_OUT was added in 8.0.4.

</br>
- Error number: 3700; Symbol: ER_REGEXP_PATTERN_TOO_BIG; SQLSTATE: HY000

Message: The regular expression pattern exceeds limits on size or complexity.

ER_REGEXP_PATTERN_TOO_BIG was added in 8.0.4.

</br>
- Error number: 3701; Symbol: ER_CANT_SET_ERROR_LOG_SERVICE; SQLSTATE: HY000

Message: Value for %s got confusing at or around "%s". Syntax may be wrong, component may not be INSTALLed, or a component that does not support instances may be listed more than once.

ER_CANT_SET_ERROR_LOG_SERVICE was added in 8.0.4.

</br>
- Error number: 3702; Symbol: ER_EMPTY_PIPELINE_FOR_ERROR_LOG_SERVICE; SQLSTATE: HY000

Message: Setting an empty %s pipeline disables error logging!

ER_EMPTY_PIPELINE_FOR_ERROR_LOG_SERVICE was added in 8.0.4.

</br>
- Error number: 3703; Symbol: ER_COMPONENT_FILTER_DIAGNOSTICS; SQLSTATE: HY000

Message: filter %s: %s

ER_COMPONENT_FILTER_DIAGNOSTICS was added in 8.0.4.

</br>
- Error number: 3704; Symbol: ER_INNODB_CANNOT_BE_IGNORED; SQLSTATE: HY000

Message: ignore-builtin-innodb is ignored and will be removed in future releases.

ER_INNODB_CANNOT_BE_IGNORED was added in 8.0.2, removed after 8.0.2.

</br>
- Error number: 3704; Symbol: ER_NOT_IMPLEMENTED_FOR_CARTESIAN_SRS; SQLSTATE: 22S00

Message: %s(%s) has not been implemented for Cartesian spatial reference systems.

ER_NOT_IMPLEMENTED_FOR_CARTESIAN_SRS was added in 8.0.4.

</br>
- Error number: 3705; Symbol: ER_NOT_IMPLEMENTED_FOR_PROJECTED_SRS; SQLSTATE: 22S00

Message: %s(%s) has not been implemented for projected spatial reference systems.

ER_NOT_IMPLEMENTED_FOR_PROJECTED_SRS was added in 8.0.4.

</br>
- Error number: 3706; Symbol: ER_NONPOSITIVE_RADIUS; SQLSTATE: 22003

Message: Invalid radius provided to function %s: Radius must be greater than zero.

ER_NONPOSITIVE_RADIUS was added in 8.0.4.

</br>
- Error number: 3707; Symbol: ER_RESTART_SERVER_FAILED; SQLSTATE: HY000

Message: Restart server failed (%s).

ER_RESTART_SERVER_FAILED was added in 8.0.4.

</br>
- Error number: 3708; Symbol: ER_SRS_MISSING_MANDATORY_ATTRIBUTE; SQLSTATE: SR006

Message: Missing mandatory attribute %s.

ER_SRS_MISSING_MANDATORY_ATTRIBUTE was added in 8.0.4.

</br>
- Error number: 3709; Symbol: ER_SRS_MULTIPLE_ATTRIBUTE_DEFINITIONS; SQLSTATE: SR006

Message: Multiple definitions of attribute %s.

ER_SRS_MULTIPLE_ATTRIBUTE_DEFINITIONS was added in 8.0.4.

</br>
- Error number: 3710; Symbol: ER_SRS_NAME_CANT_BE_EMPTY_OR_WHITESPACE; SQLSTATE: SR006

Message: The spatial reference system name can't be an empty string or start or end with whitespace.

ER_SRS_NAME_CANT_BE_EMPTY_OR_WHITESPACE was added in 8.0.4.

</br>
- Error number: 3711; Symbol: ER_SRS_ORGANIZATION_CANT_BE_EMPTY_OR_WHITESPACE; SQLSTATE: SR006

Message: The organization name can't be an empty string or start or end with whitespace.

ER_SRS_ORGANIZATION_CANT_BE_EMPTY_OR_WHITESPACE was added in 8.0.4.

</br>
- Error number: 3712; Symbol: ER_SRS_ID_ALREADY_EXISTS; SQLSTATE: SR004

Message: There is already a spatial reference system with SRID %u.

ER_SRS_ID_ALREADY_EXISTS was added in 8.0.4.

</br>
- Error number: 3713; Symbol: ER_WARN_SRS_ID_ALREADY_EXISTS; SQLSTATE: 01S00

Message: There is already a spatial reference system with SRID %u.

ER_WARN_SRS_ID_ALREADY_EXISTS was added in 8.0.4.

</br>
- Error number: 3714; Symbol: ER_CANT_MODIFY_SRID_0; SQLSTATE: SR000

Message: SRID 0 is not modifiable.

ER_CANT_MODIFY_SRID_0 was added in 8.0.4.

</br>
- Error number: 3715; Symbol: ER_WARN_RESERVED_SRID_RANGE; SQLSTATE: 01S01

Message: The SRID range [%u, %u] has been reserved for system use. SRSs in this range may be added, modified or removed without warning during upgrade.

ER_WARN_RESERVED_SRID_RANGE was added in 8.0.4.

</br>
- Error number: 3716; Symbol: ER_CANT_MODIFY_SRS_USED_BY_COLUMN; SQLSTATE: SR005

Message: Can't modify SRID %u. There is at least one column depending on it.

ER_CANT_MODIFY_SRS_USED_BY_COLUMN was added in 8.0.4.

</br>
- Error number: 3717; Symbol: ER_SRS_INVALID_CHARACTER_IN_ATTRIBUTE; SQLSTATE: SR006

Message: Invalid character in attribute %s.

ER_SRS_INVALID_CHARACTER_IN_ATTRIBUTE was added in 8.0.4.

</br>
- Error number: 3718; Symbol: ER_SRS_ATTRIBUTE_STRING_TOO_LONG; SQLSTATE: SR006

Message: Attribute %s is too long. The maximum length is %u characters.

ER_SRS_ATTRIBUTE_STRING_TOO_LONG was added in 8.0.4.

</br>
- Error number: 3719; Symbol: ER_DEPRECATED_UTF8_ALIAS; SQLSTATE: HY000

Message: 'utf8' is currently an alias for the character set UTF8MB3, but will be an alias for UTF8MB4 in a future release. Please consider using UTF8MB4 in order to be unambiguous.

ER_DEPRECATED_UTF8_ALIAS was added in 8.0.11.

</br>
- Error number: 3720; Symbol: ER_DEPRECATED_NATIONAL; SQLSTATE: HY000

Message: NATIONAL/NCHAR/NVARCHAR implies the character set UTF8MB3, which will be replaced by UTF8MB4 in a future release. Please consider using CHAR(x) CHARACTER SET UTF8MB4 in order to be unambiguous.

ER_DEPRECATED_NATIONAL was added in 8.0.11.

</br>
- Error number: 3721; Symbol: ER_INVALID_DEFAULT_UTF8MB4_COLLATION; SQLSTATE: HY000

Message: Invalid default collation %s: utf8mb4_0900_ai_ci or utf8mb4_general_ci expected

ER_INVALID_DEFAULT_UTF8MB4_COLLATION was added in 8.0.11.

</br>
- Error number: 3722; Symbol: ER_UNABLE_TO_COLLECT_LOG_STATUS; SQLSTATE: HY000

Message: Unable to collect information for column '%s': %s.

ER_UNABLE_TO_COLLECT_LOG_STATUS was added in 8.0.11.

</br>
- Error number: 3723; Symbol: ER_RESERVED_TABLESPACE_NAME; SQLSTATE: HY000

Message: The table '%s' may not be created in the reserved tablespace '%s'.

ER_RESERVED_TABLESPACE_NAME was added in 8.0.11.

</br>
- Error number: 3724; Symbol: ER_UNABLE_TO_SET_OPTION; SQLSTATE: HY000

Message: This option cannot be set %s.

ER_UNABLE_TO_SET_OPTION was added in 8.0.11.

</br>
- Error number: 3725; Symbol: ER_SLAVE_POSSIBLY_DIVERGED_AFTER_DDL; SQLSTATE: HY000

Message: A commit for an atomic DDL statement was unsuccessful on the master and the slave. The slave supports atomic DDL statements but the master does not, so the action taken by the slave and master might differ. Check that their states have not diverged before proceeding.

ER_SLAVE_POSSIBLY_DIVERGED_AFTER_DDL was added in 8.0.11, removed after 8.0.32.

</br>
- Error number: 3726; Symbol: ER_SRS_NOT_GEOGRAPHIC; SQLSTATE: 22S00

Message: Function %s is only defined for geographic spatial reference systems, but one of its arguments is in SRID %u, which is not geographic.

ER_SRS_NOT_GEOGRAPHIC was added in 8.0.12.

</br>
- Error number: 3727; Symbol: ER_POLYGON_TOO_LARGE; SQLSTATE: 22023

Message: Function %s encountered a polygon that was too large. Polygons must cover less than half the planet.

ER_POLYGON_TOO_LARGE was added in 8.0.12.

</br>
- Error number: 3728; Symbol: ER_SPATIAL_UNIQUE_INDEX; SQLSTATE: HY000

Message: Spatial indexes can't be primary or unique indexes.

ER_SPATIAL_UNIQUE_INDEX was added in 8.0.12.

</br>
- Error number: 3729; Symbol: ER_INDEX_TYPE_NOT_SUPPORTED_FOR_SPATIAL_INDEX; SQLSTATE: HY000

Message: The index type %s is not supported for spatial indexes.

ER_INDEX_TYPE_NOT_SUPPORTED_FOR_SPATIAL_INDEX was added in 8.0.12.

</br>
- Error number: 3730; Symbol: ER_FK_CANNOT_DROP_PARENT; SQLSTATE: HY000

Message: Cannot drop table '%s' referenced by a foreign key constraint '%s' on table '%s'.

ER_FK_CANNOT_DROP_PARENT was added in 8.0.12.

</br>
- Error number: 3731; Symbol: ER_GEOMETRY_PARAM_LONGITUDE_OUT_OF_RANGE; SQLSTATE: 22S02

Message: A parameter of function %s contains a geometry with longitude %f, which is out of range. It must be within (%f, %f].

ER_GEOMETRY_PARAM_LONGITUDE_OUT_OF_RANGE was added in 8.0.12.

</br>
- Error number: 3732; Symbol: ER_GEOMETRY_PARAM_LATITUDE_OUT_OF_RANGE; SQLSTATE: 22S03

Message: A parameter of function %s contains a geometry with latitude %f, which is out of range. It must be within [%f, %f].

ER_GEOMETRY_PARAM_LATITUDE_OUT_OF_RANGE was added in 8.0.12.

</br>
- Error number: 3733; Symbol: ER_FK_CANNOT_USE_VIRTUAL_COLUMN; SQLSTATE: HY000

Message: Foreign key '%s' uses virtual column '%s' which is not supported.

ER_FK_CANNOT_USE_VIRTUAL_COLUMN was added in 8.0.12.

</br>
- Error number: 3734; Symbol: ER_FK_NO_COLUMN_PARENT; SQLSTATE: HY000

Message: Failed to add the foreign key constraint. Missing column '%s' for constraint '%s' in the referenced table '%s'

ER_FK_NO_COLUMN_PARENT was added in 8.0.12.

</br>
- Error number: 3735; Symbol: ER_CANT_SET_ERROR_SUPPRESSION_LIST; SQLSTATE: HY000

Message: %s: Could not add suppression rule for code "%s". Rule-set may be full, or code may not correspond to an error-log message.

ER_CANT_SET_ERROR_SUPPRESSION_LIST was added in 8.0.13.

</br>
- Error number: 3736; Symbol: ER_SRS_GEOGCS_INVALID_AXES; SQLSTATE: SR002

Message: The spatial reference system definition for SRID %u specifies invalid geographic axes '%s' and '%s'. One axis must be NORTH or SOUTH and the other must be EAST or WEST.

ER_SRS_GEOGCS_INVALID_AXES was added in 8.0.13.

</br>
- Error number: 3737; Symbol: ER_SRS_INVALID_SEMI_MAJOR_AXIS; SQLSTATE: SR002

Message: The length of the semi-major axis must be a positive number.

ER_SRS_INVALID_SEMI_MAJOR_AXIS was added in 8.0.13.

</br>
- Error number: 3738; Symbol: ER_SRS_INVALID_INVERSE_FLATTENING; SQLSTATE: SR002

Message: The inverse flattening must be larger than 1.0, or 0.0 if the ellipsoid is a sphere.

ER_SRS_INVALID_INVERSE_FLATTENING was added in 8.0.13.

</br>
- Error number: 3739; Symbol: ER_SRS_INVALID_ANGULAR_UNIT; SQLSTATE: SR002

Message: The angular unit conversion factor must be a positive number.

ER_SRS_INVALID_ANGULAR_UNIT was added in 8.0.13.

</br>
- Error number: 3740; Symbol: ER_SRS_INVALID_PRIME_MERIDIAN; SQLSTATE: SR002

Message: The prime meridian must be within (-180, 180] degrees, specified in the SRS angular unit.

ER_SRS_INVALID_PRIME_MERIDIAN was added in 8.0.13.

</br>
- Error number: 3741; Symbol: ER_TRANSFORM_SOURCE_SRS_NOT_SUPPORTED; SQLSTATE: 22S00

Message: Transformation from SRID %u is not supported.

ER_TRANSFORM_SOURCE_SRS_NOT_SUPPORTED was added in 8.0.13.

</br>
- Error number: 3742; Symbol: ER_TRANSFORM_TARGET_SRS_NOT_SUPPORTED; SQLSTATE: 22S00

Message: Transformation to SRID %u is not supported.

ER_TRANSFORM_TARGET_SRS_NOT_SUPPORTED was added in 8.0.13.

</br>
- Error number: 3743; Symbol: ER_TRANSFORM_SOURCE_SRS_MISSING_TOWGS84; SQLSTATE: 22S00

Message: Transformation from SRID %u is not supported. The spatial reference system has no TOWGS84 clause.

ER_TRANSFORM_SOURCE_SRS_MISSING_TOWGS84 was added in 8.0.13.

</br>
- Error number: 3744; Symbol: ER_TRANSFORM_TARGET_SRS_MISSING_TOWGS84; SQLSTATE: 22S00

Message: Transformation to SRID %u is not supported. The spatial reference system has no TOWGS84 clause.

ER_TRANSFORM_TARGET_SRS_MISSING_TOWGS84 was added in 8.0.13.

</br>
- Error number: 3745; Symbol: ER_TEMP_TABLE_PREVENTS_SWITCH_SESSION_BINLOG_FORMAT; SQLSTATE: HY000

Message: Changing @@session.binlog_format is disallowed when the session has open temporary table(s). You could wait until these temporary table(s) are dropped and try again.

ER_TEMP_TABLE_PREVENTS_SWITCH_SESSION_BINLOG_FORMAT was added in 8.0.13.

</br>
- Error number: 3746; Symbol: ER_TEMP_TABLE_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT; SQLSTATE: HY000

Message: Changing @@global.binlog_format or @@persist.binlog_format is disallowed when any replication channel has open temporary table(s). You could wait until Replica_open_temp_tables = 0 and try again

ER_TEMP_TABLE_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT was added in 8.0.13.

</br>
- Error number: 3747; Symbol: ER_RUNNING_APPLIER_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT; SQLSTATE: HY000

Message: Changing @@global.binlog_format or @@persist.binlog_format is disallowed when any replication channel applier thread is running. You could execute STOP REPLICA SQL_THREAD and try again.

ER_RUNNING_APPLIER_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT was added in 8.0.13.

</br>
- Error number: 3748; Symbol: ER_CLIENT_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRX_IN_SBR; SQLSTATE: HY000

Message: Statement violates GTID consistency: CREATE TEMPORARY TABLE and DROP TEMPORARY TABLE are not allowed inside a transaction or inside a procedure in a transactional context when @@session.binlog_format=STATEMENT.

ER_CLIENT_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRX_IN_SBR was added in 8.0.13.

</br>
- Error number: 3750; Symbol: ER_TABLE_WITHOUT_PK; SQLSTATE: HY000

Message: Unable to create or change a table without a primary key, when the system variable 'sql_require_primary_key' is set. Add a primary key to the table or unset this variable to avoid this message. Note that tables without a primary key can cause performance problems in row-based replication, so please consult your DBA before changing this setting.

ER_TABLE_WITHOUT_PK was added in 8.0.13.

</br>
- Error number: 3751; Symbol: WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX; SQLSTATE: 01000

Message: Data truncated for functional index '%s' at row %ld

WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX was added in 8.0.13, removed after 8.0.16.

</br>
- Error number: 3751; Symbol: ER_WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX; SQLSTATE: 01000

Message: Data truncated for functional index '%s' at row %ld

ER_WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX was added in 8.0.17.

</br>
- Error number: 3752; Symbol: ER_WARN_DATA_OUT_OF_RANGE_FUNCTIONAL_INDEX; SQLSTATE: 22003

Message: Value is out of range for functional index '%s' at row %ld

ER_WARN_DATA_OUT_OF_RANGE_FUNCTIONAL_INDEX was added in 8.0.13.

</br>
- Error number: 3753; Symbol: ER_FUNCTIONAL_INDEX_ON_JSON_OR_GEOMETRY_FUNCTION; SQLSTATE: 42000

Message: Cannot create a functional index on a function that returns a JSON or GEOMETRY value.

ER_FUNCTIONAL_INDEX_ON_JSON_OR_GEOMETRY_FUNCTION was added in 8.0.13.

</br>
- Error number: 3754; Symbol: ER_FUNCTIONAL_INDEX_REF_AUTO_INCREMENT; SQLSTATE: HY000

Message: Functional index '%s' cannot refer to an auto-increment column.

ER_FUNCTIONAL_INDEX_REF_AUTO_INCREMENT was added in 8.0.13.

</br>
- Error number: 3755; Symbol: ER_CANNOT_DROP_COLUMN_FUNCTIONAL_INDEX; SQLSTATE: HY000

Message: Cannot drop column '%s' because it is used by a functional index. In order to drop the column, you must remove the functional index.

ER_CANNOT_DROP_COLUMN_FUNCTIONAL_INDEX was added in 8.0.13.

</br>
- Error number: 3756; Symbol: ER_FUNCTIONAL_INDEX_PRIMARY_KEY; SQLSTATE: HY000

Message: The primary key cannot be a functional index

ER_FUNCTIONAL_INDEX_PRIMARY_KEY was added in 8.0.13.

</br>
- Error number: 3757; Symbol: ER_FUNCTIONAL_INDEX_ON_LOB; SQLSTATE: HY000

Message: Cannot create a functional index on an expression that returns a BLOB or TEXT. Please consider using CAST.

ER_FUNCTIONAL_INDEX_ON_LOB was added in 8.0.13.

</br>
- Error number: 3758; Symbol: ER_FUNCTIONAL_INDEX_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: Expression of functional index '%s' contains a disallowed function.

ER_FUNCTIONAL_INDEX_FUNCTION_IS_NOT_ALLOWED was added in 8.0.13.

</br>
- Error number: 3759; Symbol: ER_FULLTEXT_FUNCTIONAL_INDEX; SQLSTATE: HY000

Message: Fulltext functional index is not supported.

ER_FULLTEXT_FUNCTIONAL_INDEX was added in 8.0.13.

</br>
- Error number: 3760; Symbol: ER_SPATIAL_FUNCTIONAL_INDEX; SQLSTATE: HY000

Message: Spatial functional index is not supported.

ER_SPATIAL_FUNCTIONAL_INDEX was added in 8.0.13.

</br>
- Error number: 3761; Symbol: ER_WRONG_KEY_COLUMN_FUNCTIONAL_INDEX; SQLSTATE: HY000

Message: The used storage engine cannot index the expression '%s'.

ER_WRONG_KEY_COLUMN_FUNCTIONAL_INDEX was added in 8.0.13.

</br>
- Error number: 3762; Symbol: ER_FUNCTIONAL_INDEX_ON_FIELD; SQLSTATE: HY000

Message: Functional index on a column is not supported. Consider using a regular index instead.

ER_FUNCTIONAL_INDEX_ON_FIELD was added in 8.0.13.

</br>
- Error number: 3763; Symbol: ER_GENERATED_COLUMN_NAMED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: Expression of generated column '%s' contains a disallowed function: %s.

ER_GENERATED_COLUMN_NAMED_FUNCTION_IS_NOT_ALLOWED was added in 8.0.13.

</br>
- Error number: 3764; Symbol: ER_GENERATED_COLUMN_ROW_VALUE; SQLSTATE: HY000

Message: Expression of generated column '%s' cannot refer to a row value.

ER_GENERATED_COLUMN_ROW_VALUE was added in 8.0.13.

</br>
- Error number: 3765; Symbol: ER_GENERATED_COLUMN_VARIABLES; SQLSTATE: HY000

Message: Expression of generated column '%s' cannot refer user or system variables.

ER_GENERATED_COLUMN_VARIABLES was added in 8.0.13.

</br>
- Error number: 3766; Symbol: ER_DEPENDENT_BY_DEFAULT_GENERATED_VALUE; SQLSTATE: HY000

Message: Column '%s' of table '%s' has a default value expression dependency and cannot be dropped or renamed.

ER_DEPENDENT_BY_DEFAULT_GENERATED_VALUE was added in 8.0.13.

</br>
- Error number: 3767; Symbol: ER_DEFAULT_VAL_GENERATED_NON_PRIOR; SQLSTATE: HY000

Message: Default value expression of column '%s' cannot refer to a column defined after it if that column is a generated column or has an expression as default value.

ER_DEFAULT_VAL_GENERATED_NON_PRIOR was added in 8.0.13.

</br>
- Error number: 3768; Symbol: ER_DEFAULT_VAL_GENERATED_REF_AUTO_INC; SQLSTATE: HY000

Message: Default value expression of column '%s' cannot refer to an auto-increment column.

ER_DEFAULT_VAL_GENERATED_REF_AUTO_INC was added in 8.0.13.

</br>
- Error number: 3769; Symbol: ER_DEFAULT_VAL_GENERATED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: Default value expression of column '%s' contains a disallowed function.

ER_DEFAULT_VAL_GENERATED_FUNCTION_IS_NOT_ALLOWED was added in 8.0.13.

</br>
- Error number: 3770; Symbol: ER_DEFAULT_VAL_GENERATED_NAMED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: Default value expression of column '%s' contains a disallowed function: %s.

ER_DEFAULT_VAL_GENERATED_NAMED_FUNCTION_IS_NOT_ALLOWED was added in 8.0.13.

</br>
- Error number: 3771; Symbol: ER_DEFAULT_VAL_GENERATED_ROW_VALUE; SQLSTATE: HY000

Message: Default value expression of column '%s' cannot refer to a row value.

ER_DEFAULT_VAL_GENERATED_ROW_VALUE was added in 8.0.13.

</br>
- Error number: 3772; Symbol: ER_DEFAULT_VAL_GENERATED_VARIABLES; SQLSTATE: HY000

Message: Default value expression of column '%s' cannot refer user or system variables.

ER_DEFAULT_VAL_GENERATED_VARIABLES was added in 8.0.13.

</br>
- Error number: 3773; Symbol: ER_DEFAULT_AS_VAL_GENERATED; SQLSTATE: HY000

Message: DEFAULT function cannot be used with default value expressions

ER_DEFAULT_AS_VAL_GENERATED was added in 8.0.13.

</br>
- Error number: 3774; Symbol: ER_UNSUPPORTED_ACTION_ON_DEFAULT_VAL_GENERATED; SQLSTATE: HY000

Message: '%s' is not supported for default value expressions.

ER_UNSUPPORTED_ACTION_ON_DEFAULT_VAL_GENERATED was added in 8.0.13.

</br>
- Error number: 3775; Symbol: ER_GTID_UNSAFE_ALTER_ADD_COL_WITH_DEFAULT_EXPRESSION; SQLSTATE: HY000

Message: Statement violates GTID consistency: ALTER TABLE ... ADD COLUMN .. with expression as DEFAULT.

ER_GTID_UNSAFE_ALTER_ADD_COL_WITH_DEFAULT_EXPRESSION was added in 8.0.13.

</br>
- Error number: 3776; Symbol: ER_FK_CANNOT_CHANGE_ENGINE; SQLSTATE: HY000

Message: Cannot change table's storage engine because the table participates in a foreign key constraint.

ER_FK_CANNOT_CHANGE_ENGINE was added in 8.0.13.

</br>
- Error number: 3777; Symbol: ER_WARN_DEPRECATED_USER_SET_EXPR; SQLSTATE: HY000

Message: Setting user variables within expressions is deprecated and will be removed in a future release. Consider alternatives: 'SET variable=expression, ...', or 'SELECT expression(s) INTO variables(s)'.

ER_WARN_DEPRECATED_USER_SET_EXPR was added in 8.0.13.

</br>
- Error number: 3778; Symbol: ER_WARN_DEPRECATED_UTF8MB3_COLLATION; SQLSTATE: HY000

Message: '%s' is a collation of the deprecated character set UTF8MB3. Please consider using UTF8MB4 with an appropriate collation instead.

ER_WARN_DEPRECATED_UTF8MB3_COLLATION was added in 8.0.13.

</br>
- Error number: 3779; Symbol: ER_WARN_DEPRECATED_NESTED_COMMENT_SYNTAX; SQLSTATE: HY000

Message: Nested comment syntax is deprecated and will be removed in a future release.

ER_WARN_DEPRECATED_NESTED_COMMENT_SYNTAX was added in 8.0.13.

</br>
- Error number: 3780; Symbol: ER_FK_INCOMPATIBLE_COLUMNS; SQLSTATE: HY000

Message: Referencing column '%s' and referenced column '%s' in foreign key constraint '%s' are incompatible.

ER_FK_INCOMPATIBLE_COLUMNS was added in 8.0.14.

</br>
- Error number: 3781; Symbol: ER_GR_HOLD_WAIT_TIMEOUT; SQLSTATE: HY000

Message: Timeout exceeded for held statement while new Group Replication primary member is applying backlog.

ER_GR_HOLD_WAIT_TIMEOUT was added in 8.0.14.

</br>
- Error number: 3782; Symbol: ER_GR_HOLD_KILLED; SQLSTATE: HY000

Message: Held statement aborted because Group Replication plugin got shut down or thread was killed while new primary member was applying backlog.

ER_GR_HOLD_KILLED was added in 8.0.14.

</br>
- Error number: 3783; Symbol: ER_GR_HOLD_MEMBER_STATUS_ERROR; SQLSTATE: HY000

Message: Held statement was aborted due to member being in error state, while backlog is being applied during Group Replication primary election.

ER_GR_HOLD_MEMBER_STATUS_ERROR was added in 8.0.14.

</br>
- Error number: 3784; Symbol: ER_RPL_ENCRYPTION_FAILED_TO_FETCH_KEY; SQLSTATE: HY000

Message: Failed to fetch key from keyring, please check if keyring is loaded.

ER_RPL_ENCRYPTION_FAILED_TO_FETCH_KEY was added in 8.0.14.

</br>
- Error number: 3785; Symbol: ER_RPL_ENCRYPTION_KEY_NOT_FOUND; SQLSTATE: HY000

Message: Can't find key from keyring, please check in the server log if a keyring is loaded and initialized successfully.

ER_RPL_ENCRYPTION_KEY_NOT_FOUND was added in 8.0.14.

</br>
- Error number: 3786; Symbol: ER_RPL_ENCRYPTION_KEYRING_INVALID_KEY; SQLSTATE: HY000

Message: Fetched an invalid key from keyring.

ER_RPL_ENCRYPTION_KEYRING_INVALID_KEY was added in 8.0.14.

</br>
- Error number: 3787; Symbol: ER_RPL_ENCRYPTION_HEADER_ERROR; SQLSTATE: HY000

Message: Error reading a replication log encryption header: %s.

ER_RPL_ENCRYPTION_HEADER_ERROR was added in 8.0.14.

</br>
- Error number: 3788; Symbol: ER_RPL_ENCRYPTION_FAILED_TO_ROTATE_LOGS; SQLSTATE: HY000

Message: Failed to rotate some logs after changing binlog encryption settings. Please fix the problem and rotate the logs manually.

ER_RPL_ENCRYPTION_FAILED_TO_ROTATE_LOGS was added in 8.0.14.

</br>
- Error number: 3789; Symbol: ER_RPL_ENCRYPTION_KEY_EXISTS_UNEXPECTED; SQLSTATE: HY000

Message: Key %s exists unexpected.

ER_RPL_ENCRYPTION_KEY_EXISTS_UNEXPECTED was added in 8.0.14.

</br>
- Error number: 3790; Symbol: ER_RPL_ENCRYPTION_FAILED_TO_GENERATE_KEY; SQLSTATE: HY000

Message: Failed to generate key, please check if keyring is loaded.

ER_RPL_ENCRYPTION_FAILED_TO_GENERATE_KEY was added in 8.0.14.

</br>
- Error number: 3791; Symbol: ER_RPL_ENCRYPTION_FAILED_TO_STORE_KEY; SQLSTATE: HY000

Message: Failed to store key, please check if keyring is loaded.

ER_RPL_ENCRYPTION_FAILED_TO_STORE_KEY was added in 8.0.14.

</br>
- Error number: 3792; Symbol: ER_RPL_ENCRYPTION_FAILED_TO_REMOVE_KEY; SQLSTATE: HY000

Message: Failed to remove key, please check if keyring is loaded.

ER_RPL_ENCRYPTION_FAILED_TO_REMOVE_KEY was added in 8.0.14.

</br>
- Error number: 3793; Symbol: ER_RPL_ENCRYPTION_UNABLE_TO_CHANGE_OPTION; SQLSTATE: HY000

Message: Failed to change binlog_encryption value. %s.

ER_RPL_ENCRYPTION_UNABLE_TO_CHANGE_OPTION was added in 8.0.14.

</br>
- Error number: 3794; Symbol: ER_RPL_ENCRYPTION_MASTER_KEY_RECOVERY_FAILED; SQLSTATE: HY000

Message: Unable to recover binlog encryption master key, please check if keyring is loaded.

ER_RPL_ENCRYPTION_MASTER_KEY_RECOVERY_FAILED was added in 8.0.14.

</br>
- Error number: 3795; Symbol: ER_SLOW_LOG_MODE_IGNORED_WHEN_NOT_LOGGING_TO_FILE; SQLSTATE: HY000

Message: slow query log file format changed as requested, but setting will have no effect when not actually logging to a file.

ER_SLOW_LOG_MODE_IGNORED_WHEN_NOT_LOGGING_TO_FILE was added in 8.0.14.

</br>
- Error number: 3796; Symbol: ER_GRP_TRX_CONSISTENCY_NOT_ALLOWED; SQLSTATE: HY000

Message: The option group_replication_consistency cannot be used on the current member state.

ER_GRP_TRX_CONSISTENCY_NOT_ALLOWED was added in 8.0.14.

</br>
- Error number: 3797; Symbol: ER_GRP_TRX_CONSISTENCY_BEFORE; SQLSTATE: HY000

Message: Error while waiting for group transactions commit on group_replication_consistency= 'BEFORE'.

ER_GRP_TRX_CONSISTENCY_BEFORE was added in 8.0.14.

</br>
- Error number: 3798; Symbol: ER_GRP_TRX_CONSISTENCY_AFTER_ON_TRX_BEGIN; SQLSTATE: HY000

Message: Error while waiting for transactions with group_replication_consistency= 'AFTER' to commit.

ER_GRP_TRX_CONSISTENCY_AFTER_ON_TRX_BEGIN was added in 8.0.14.

</br>
- Error number: 3799; Symbol: ER_GRP_TRX_CONSISTENCY_BEGIN_NOT_ALLOWED; SQLSTATE: HY000

Message: The Group Replication plugin is stopping, therefore new transactions are not allowed to start.

ER_GRP_TRX_CONSISTENCY_BEGIN_NOT_ALLOWED was added in 8.0.14.

</br>
- Error number: 3800; Symbol: ER_FUNCTIONAL_INDEX_ROW_VALUE_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: Expression of functional index '%s' cannot refer to a row value.

ER_FUNCTIONAL_INDEX_ROW_VALUE_IS_NOT_ALLOWED was added in 8.0.14.

</br>
- Error number: 3801; Symbol: ER_RPL_ENCRYPTION_FAILED_TO_ENCRYPT; SQLSTATE: HY000

Message: Failed to encrypt content to write into binlog file: %s.

ER_RPL_ENCRYPTION_FAILED_TO_ENCRYPT was added in 8.0.14.

</br>
- Error number: 3802; Symbol: ER_PAGE_TRACKING_NOT_STARTED; SQLSTATE: HY000

Message: Page Tracking is not started yet.

ER_PAGE_TRACKING_NOT_STARTED was added in 8.0.16.

</br>
- Error number: 3803; Symbol: ER_PAGE_TRACKING_RANGE_NOT_TRACKED; SQLSTATE: HY000

Message: Tracking was not enabled for the LSN range specified

ER_PAGE_TRACKING_RANGE_NOT_TRACKED was added in 8.0.16.

</br>
- Error number: 3804; Symbol: ER_PAGE_TRACKING_CANNOT_PURGE; SQLSTATE: HY000

Message: Cannot purge data when concurrent clone is in progress. Try later.

ER_PAGE_TRACKING_CANNOT_PURGE was added in 8.0.16.

</br>
- Error number: 3805; Symbol: ER_RPL_ENCRYPTION_CANNOT_ROTATE_BINLOG_MASTER_KEY; SQLSTATE: HY000

Message: Cannot rotate binary log master key when 'binlog-encryption' is off.

ER_RPL_ENCRYPTION_CANNOT_ROTATE_BINLOG_MASTER_KEY was added in 8.0.16.

</br>
- Error number: 3806; Symbol: ER_BINLOG_MASTER_KEY_RECOVERY_OUT_OF_COMBINATION; SQLSTATE: HY000

Message: Unable to recover binary log master key, the combination of new_master_key_seqno=%u, master_key_seqno=%u and old_master_key_seqno=%u are wrong.

ER_BINLOG_MASTER_KEY_RECOVERY_OUT_OF_COMBINATION was added in 8.0.16.

</br>
- Error number: 3807; Symbol: ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_OPERATE_KEY; SQLSTATE: HY000

Message: Failed to operate binary log master key on keyring, please check if keyring is loaded. The statement had no effect: the old binary log master key is still in use, the keyring, binary and relay log files are unchanged, and the server could not start using a new binary log master key for encrypting new binary and relay log files.

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_OPERATE_KEY was added in 8.0.16.

</br>
- Error number: 3808; Symbol: ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_ROTATE_LOGS; SQLSTATE: HY000

Message: Failed to rotate one or more binary or relay log files. A new binary log master key was generated and will be used to encrypt new binary and relay log files. There may still exist binary or relay log files using the previous binary log master key.

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_ROTATE_LOGS was added in 8.0.16.

</br>
- Error number: 3809; Symbol: ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_REENCRYPT_LOG; SQLSTATE: HY000

Message: %s. A new binary log master key was generated and will be used to encrypt new binary and relay log files. There may still exist binary or relay log files using the previous binary log master key.

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_REENCRYPT_LOG was added in 8.0.16.

</br>
- Error number: 3810; Symbol: ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_UNUSED_KEYS; SQLSTATE: HY000

Message: Failed to remove unused binary log encryption keys from the keyring, please check if keyring is loaded. The unused binary log encryption keys may still exist in the keyring, and they will be removed upon server restart or next 'ALTER INSTANCE ROTATE BINLOG MASTER KEY' execution.

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_UNUSED_KEYS was added in 8.0.16.

</br>
- Error number: 3811; Symbol: ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_AUX_KEY; SQLSTATE: HY000

Message: Failed to remove auxiliary binary log encryption key from keyring, please check if keyring is loaded. The cleanup of the binary log master key rotation process did not finish as expected and the cleanup will take place upon server restart or next 'ALTER INSTANCE ROTATE BINLOG MASTER KEY' execution.

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_AUX_KEY was added in 8.0.16.

</br>
- Error number: 3812; Symbol: ER_NON_BOOLEAN_EXPR_FOR_CHECK_CONSTRAINT; SQLSTATE: HY000

Message: An expression of non-boolean type specified to a check constraint '%s'.

ER_NON_BOOLEAN_EXPR_FOR_CHECK_CONSTRAINT was added in 8.0.16.

</br>
- Error number: 3813; Symbol: ER_COLUMN_CHECK_CONSTRAINT_REFERENCES_OTHER_COLUMN; SQLSTATE: HY000

Message: Column check constraint '%s' references other column.

ER_COLUMN_CHECK_CONSTRAINT_REFERENCES_OTHER_COLUMN was added in 8.0.16.

</br>
- Error number: 3814; Symbol: ER_CHECK_CONSTRAINT_NAMED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: An expression of a check constraint '%s' contains disallowed function: %s.

ER_CHECK_CONSTRAINT_NAMED_FUNCTION_IS_NOT_ALLOWED was added in 8.0.16.

</br>
- Error number: 3815; Symbol: ER_CHECK_CONSTRAINT_FUNCTION_IS_NOT_ALLOWED; SQLSTATE: HY000

Message: An expression of a check constraint '%s' contains disallowed function.

ER_CHECK_CONSTRAINT_FUNCTION_IS_NOT_ALLOWED was added in 8.0.16.

</br>
- Error number: 3816; Symbol: ER_CHECK_CONSTRAINT_VARIABLES; SQLSTATE: HY000

Message: An expression of a check constraint '%s' cannot refer to a user or system variable.

ER_CHECK_CONSTRAINT_VARIABLES was added in 8.0.16.

</br>
- Error number: 3817; Symbol: ER_CHECK_CONSTRAINT_ROW_VALUE; SQLSTATE: HY000

Message: Check constraint '%s' cannot refer to a row value.

ER_CHECK_CONSTRAINT_ROW_VALUE was added in 8.0.16.

</br>
- Error number: 3818; Symbol: ER_CHECK_CONSTRAINT_REFERS_AUTO_INCREMENT_COLUMN; SQLSTATE: HY000

Message: Check constraint '%s' cannot refer to an auto-increment column.

ER_CHECK_CONSTRAINT_REFERS_AUTO_INCREMENT_COLUMN was added in 8.0.16.

</br>
- Error number: 3819; Symbol: ER_CHECK_CONSTRAINT_VIOLATED; SQLSTATE: HY000

Message: Check constraint '%s' is violated.

ER_CHECK_CONSTRAINT_VIOLATED was added in 8.0.16.

</br>
- Error number: 3820; Symbol: ER_CHECK_CONSTRAINT_REFERS_UNKNOWN_COLUMN; SQLSTATE: HY000

Message: Check constraint '%s' refers to non-existing column '%s'.

ER_CHECK_CONSTRAINT_REFERS_UNKNOWN_COLUMN was added in 8.0.16.

</br>
- Error number: 3821; Symbol: ER_CHECK_CONSTRAINT_NOT_FOUND; SQLSTATE: HY000

Message: Check constraint '%s' is not found in the table.

ER_CHECK_CONSTRAINT_NOT_FOUND was added in 8.0.16.

</br>
- Error number: 3822; Symbol: ER_CHECK_CONSTRAINT_DUP_NAME; SQLSTATE: HY000

Message: Duplicate check constraint name '%s'.

ER_CHECK_CONSTRAINT_DUP_NAME was added in 8.0.16.

</br>
- Error number: 3823; Symbol: ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN; SQLSTATE: HY000

Message: Column '%s' cannot be used in a check constraint '%s': needed in a foreign key constraint '%s' referential action.

ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN was added in 8.0.16.

</br>
- Error number: 3824; Symbol: WARN_UNENCRYPTED_TABLE_IN_ENCRYPTED_DB; SQLSTATE: HY000

Message: Creating an unencrypted table in a database with default encryption enabled.

WARN_UNENCRYPTED_TABLE_IN_ENCRYPTED_DB was added in 8.0.16.

</br>
- Error number: 3825; Symbol: ER_INVALID_ENCRYPTION_REQUEST; SQLSTATE: HY000

Message: Request to create %s table while using an %s tablespace.

ER_INVALID_ENCRYPTION_REQUEST was added in 8.0.16.

</br>
- Error number: 3826; Symbol: ER_CANNOT_SET_TABLE_ENCRYPTION; SQLSTATE: HY000

Message: Table encryption differ from its database default encryption, and user doesn't have enough privilege.

ER_CANNOT_SET_TABLE_ENCRYPTION was added in 8.0.16.

</br>
- Error number: 3827; Symbol: ER_CANNOT_SET_DATABASE_ENCRYPTION; SQLSTATE: HY000

Message: Database default encryption differ from 'default_table_encryption' setting, and user doesn't have enough privilege.

ER_CANNOT_SET_DATABASE_ENCRYPTION was added in 8.0.16.

</br>
- Error number: 3828; Symbol: ER_CANNOT_SET_TABLESPACE_ENCRYPTION; SQLSTATE: HY000

Message: Tablespace encryption differ from 'default_table_encryption' setting, and user doesn't have enough privilege.

ER_CANNOT_SET_TABLESPACE_ENCRYPTION was added in 8.0.16.

</br>
- Error number: 3829; Symbol: ER_TABLESPACE_CANNOT_BE_ENCRYPTED; SQLSTATE: HY000

Message: This tablespace can't be encrypted, because one of table's schema has default encryption OFF and user doesn't have enough privilege.

ER_TABLESPACE_CANNOT_BE_ENCRYPTED was added in 8.0.16.

</br>
- Error number: 3830; Symbol: ER_TABLESPACE_CANNOT_BE_DECRYPTED; SQLSTATE: HY000

Message: This tablespace can't be decrypted, because one of table's schema has default encryption ON and user doesn't have enough privilege.

ER_TABLESPACE_CANNOT_BE_DECRYPTED was added in 8.0.16.

</br>
- Error number: 3831; Symbol: ER_TABLESPACE_TYPE_UNKNOWN; SQLSTATE: HY000

Message: Cannot determine the type of the tablespace named '%s'.

ER_TABLESPACE_TYPE_UNKNOWN was added in 8.0.16.

</br>
- Error number: 3832; Symbol: ER_TARGET_TABLESPACE_UNENCRYPTED; SQLSTATE: HY000

Message: Source tablespace is encrypted but target tablespace is not.

ER_TARGET_TABLESPACE_UNENCRYPTED was added in 8.0.16.

</br>
- Error number: 3833; Symbol: ER_CANNOT_USE_ENCRYPTION_CLAUSE; SQLSTATE: HY000

Message: ENCRYPTION clause is not valid for %s tablespace.

ER_CANNOT_USE_ENCRYPTION_CLAUSE was added in 8.0.16.

</br>
- Error number: 3834; Symbol: ER_INVALID_MULTIPLE_CLAUSES; SQLSTATE: HY000

Message: Multiple %s clauses

ER_INVALID_MULTIPLE_CLAUSES was added in 8.0.16.

</br>
- Error number: 3835; Symbol: ER_UNSUPPORTED_USE_OF_GRANT_AS; SQLSTATE: HY000

Message: GRANT ... AS is currently supported only for global privileges.

ER_UNSUPPORTED_USE_OF_GRANT_AS was added in 8.0.16.

</br>
- Error number: 3836; Symbol: ER_UKNOWN_AUTH_ID_OR_ACCESS_DENIED_FOR_GRANT_AS; SQLSTATE: HY000

Message: Either some of the authorization IDs in the AS clause are invalid or the current user lacks privileges to execute the statement.

ER_UKNOWN_AUTH_ID_OR_ACCESS_DENIED_FOR_GRANT_AS was added in 8.0.16.

</br>
- Error number: 3837; Symbol: ER_DEPENDENT_BY_FUNCTIONAL_INDEX; SQLSTATE: HY000

Message: Column '%s' has a functional index dependency and cannot be dropped or renamed.

ER_DEPENDENT_BY_FUNCTIONAL_INDEX was added in 8.0.17.

</br>
- Error number: 3838; Symbol: ER_PLUGIN_NOT_EARLY; SQLSTATE: HY000

Message: Plugin '%s' is not to be used as an "early" plugin. Don't add it to --early-plugin-load, keyring migration etc.

ER_PLUGIN_NOT_EARLY was added in 8.0.17.

</br>
- Error number: 3839; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_START_SUBDIR_PATH; SQLSTATE: HY000

Message: Redo log archiving start prohibits path name in 'subdir' argument

ER_INNODB_REDO_LOG_ARCHIVE_START_SUBDIR_PATH was added in 8.0.17.

</br>
- Error number: 3840; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_START_TIMEOUT; SQLSTATE: HY000

Message: Redo log archiving start timed out

ER_INNODB_REDO_LOG_ARCHIVE_START_TIMEOUT was added in 8.0.17.

</br>
- Error number: 3841; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_DIRS_INVALID; SQLSTATE: HY000

Message: Server variable 'innodb_redo_log_archive_dirs' is NULL or empty

ER_INNODB_REDO_LOG_ARCHIVE_DIRS_INVALID was added in 8.0.17.

</br>
- Error number: 3842; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_LABEL_NOT_FOUND; SQLSTATE: HY000

Message: Label '%s' not found in server variable 'innodb_redo_log_archive_dirs'

ER_INNODB_REDO_LOG_ARCHIVE_LABEL_NOT_FOUND was added in 8.0.17.

</br>
- Error number: 3843; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_DIR_EMPTY; SQLSTATE: HY000

Message: Directory is empty after label '%s' in server variable 'innodb_redo_log_archive_dirs'

ER_INNODB_REDO_LOG_ARCHIVE_DIR_EMPTY was added in 8.0.17.

</br>
- Error number: 3844; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_NO_SUCH_DIR; SQLSTATE: HY000

Message: Redo log archive directory '%s' does not exist or is not a directory

ER_INNODB_REDO_LOG_ARCHIVE_NO_SUCH_DIR was added in 8.0.17.

</br>
- Error number: 3845; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_DIR_CLASH; SQLSTATE: HY000

Message: Redo log archive directory '%s' is in, under, or over server directory '%s' - '%s'

ER_INNODB_REDO_LOG_ARCHIVE_DIR_CLASH was added in 8.0.17.

</br>
- Error number: 3846; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_DIR_PERMISSIONS; SQLSTATE: HY000

Message: Redo log archive directory '%s' is accessible to all OS users

ER_INNODB_REDO_LOG_ARCHIVE_DIR_PERMISSIONS was added in 8.0.17.

</br>
- Error number: 3847; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_FILE_CREATE; SQLSTATE: HY000

Message: Cannot create redo log archive file '%s' (OS errno: %d - %s)

ER_INNODB_REDO_LOG_ARCHIVE_FILE_CREATE was added in 8.0.17.

</br>
- Error number: 3848; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_ACTIVE; SQLSTATE: HY000

Message: Redo log archiving has been started on '%s' - Call innodb_redo_log_archive_stop() first

ER_INNODB_REDO_LOG_ARCHIVE_ACTIVE was added in 8.0.17.

</br>
- Error number: 3849; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_INACTIVE; SQLSTATE: HY000

Message: Redo log archiving is not active

ER_INNODB_REDO_LOG_ARCHIVE_INACTIVE was added in 8.0.17.

</br>
- Error number: 3850; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_FAILED; SQLSTATE: HY000

Message: Redo log archiving failed: %s

ER_INNODB_REDO_LOG_ARCHIVE_FAILED was added in 8.0.17.

</br>
- Error number: 3851; Symbol: ER_INNODB_REDO_LOG_ARCHIVE_SESSION; SQLSTATE: HY000

Message: Redo log archiving has not been started by this session

ER_INNODB_REDO_LOG_ARCHIVE_SESSION was added in 8.0.17.

</br>
- Error number: 3852; Symbol: ER_STD_REGEX_ERROR; SQLSTATE: HY000

Message: Regex error: %s in function %s.

ER_STD_REGEX_ERROR was added in 8.0.17.

</br>
- Error number: 3853; Symbol: ER_INVALID_JSON_TYPE; SQLSTATE: 22032

Message: Invalid JSON type in argument %u to function %s; an %s is required.

ER_INVALID_JSON_TYPE was added in 8.0.17.

</br>
- Error number: 3854; Symbol: ER_CANNOT_CONVERT_STRING; SQLSTATE: HY000

Message: Cannot convert string '%s' from %s to %s

ER_CANNOT_CONVERT_STRING was added in 8.0.17.

</br>
- Error number: 3855; Symbol: ER_DEPENDENT_BY_PARTITION_FUNC; SQLSTATE: HY000

Message: Column '%s' has a partitioning function dependency and cannot be dropped or renamed.

ER_DEPENDENT_BY_PARTITION_FUNC was added in 8.0.17.

</br>
- Error number: 3856; Symbol: ER_WARN_DEPRECATED_FLOAT_AUTO_INCREMENT; SQLSTATE: HY000

Message: AUTO_INCREMENT support for FLOAT/DOUBLE columns is deprecated and will be removed in a future release. Consider removing AUTO_INCREMENT from column '%s'.

ER_WARN_DEPRECATED_FLOAT_AUTO_INCREMENT was added in 8.0.17.

</br>
- Error number: 3857; Symbol: ER_RPL_CANT_STOP_SLAVE_WHILE_LOCKED_BACKUP; SQLSTATE: HY000

Message: Cannot stop the slave SQL thread while the instance is locked for backup. Try running `UNLOCK INSTANCE` first.

ER_RPL_CANT_STOP_SLAVE_WHILE_LOCKED_BACKUP was added in 8.0.17, removed after 8.0.32.

</br>
- Error number: 3858; Symbol: ER_WARN_DEPRECATED_FLOAT_DIGITS; SQLSTATE: HY000

Message: Specifying number of digits for floating point data types is deprecated and will be removed in a future release.

ER_WARN_DEPRECATED_FLOAT_DIGITS was added in 8.0.17.

</br>
- Error number: 3859; Symbol: ER_WARN_DEPRECATED_FLOAT_UNSIGNED; SQLSTATE: HY000

Message: UNSIGNED for decimal and floating point data types is deprecated and support for it will be removed in a future release.

ER_WARN_DEPRECATED_FLOAT_UNSIGNED was added in 8.0.17.

</br>
- Error number: 3860; Symbol: ER_WARN_DEPRECATED_INTEGER_DISPLAY_WIDTH; SQLSTATE: HY000

Message: Integer display width is deprecated and will be removed in a future release.

ER_WARN_DEPRECATED_INTEGER_DISPLAY_WIDTH was added in 8.0.17.

</br>
- Error number: 3861; Symbol: ER_WARN_DEPRECATED_ZEROFILL; SQLSTATE: HY000

Message: The ZEROFILL attribute is deprecated and will be removed in a future release. Use the LPAD function to zero-pad numbers, or store the formatted numbers in a CHAR column.

ER_WARN_DEPRECATED_ZEROFILL was added in 8.0.17.

</br>
- Error number: 3862; Symbol: ER_CLONE_DONOR; SQLSTATE: HY000

Message: Clone Donor Error: %s.

ER_CLONE_DONOR was added in 8.0.17.

</br>
- Error number: 3863; Symbol: ER_CLONE_PROTOCOL; SQLSTATE: HY000

Message: Clone received unexpected response from Donor : %s.

ER_CLONE_PROTOCOL was added in 8.0.17.

</br>
- Error number: 3864; Symbol: ER_CLONE_DONOR_VERSION; SQLSTATE: HY000

Message: Clone Donor MySQL version: %s is different from Recipient MySQL version %s.

ER_CLONE_DONOR_VERSION was added in 8.0.17.

</br>
- Error number: 3865; Symbol: ER_CLONE_OS; SQLSTATE: HY000

Message: Clone Donor OS: %s is different from Recipient OS: %s.

ER_CLONE_OS was added in 8.0.17.

</br>
- Error number: 3866; Symbol: ER_CLONE_PLATFORM; SQLSTATE: HY000

Message: Clone Donor platform: %s is different from Recipient platform: %s.

ER_CLONE_PLATFORM was added in 8.0.17.

</br>
- Error number: 3867; Symbol: ER_CLONE_CHARSET; SQLSTATE: HY000

Message: Clone Donor collation: %s is unavailable in Recipient.

ER_CLONE_CHARSET was added in 8.0.17.

</br>
- Error number: 3868; Symbol: ER_CLONE_CONFIG; SQLSTATE: HY000

Message: Clone Configuration %s: Donor value: %s is different from Recipient value: %s.

ER_CLONE_CONFIG was added in 8.0.17.

</br>
- Error number: 3869; Symbol: ER_CLONE_SYS_CONFIG; SQLSTATE: HY000

Message: Clone system configuration: %s

ER_CLONE_SYS_CONFIG was added in 8.0.17.

</br>
- Error number: 3870; Symbol: ER_CLONE_PLUGIN_MATCH; SQLSTATE: HY000

Message: Clone Donor plugin %s is not active in Recipient.

ER_CLONE_PLUGIN_MATCH was added in 8.0.17.

</br>
- Error number: 3871; Symbol: ER_CLONE_LOOPBACK; SQLSTATE: HY000

Message: Clone cannot use loop back connection while cloning into current data directory.

ER_CLONE_LOOPBACK was added in 8.0.17.

</br>
- Error number: 3872; Symbol: ER_CLONE_ENCRYPTION; SQLSTATE: HY000

Message: Clone needs SSL connection for encrypted table.

ER_CLONE_ENCRYPTION was added in 8.0.17.

</br>
- Error number: 3873; Symbol: ER_CLONE_DISK_SPACE; SQLSTATE: HY000

Message: Clone estimated database size is %s. Available space %s is not enough.

ER_CLONE_DISK_SPACE was added in 8.0.17.

</br>
- Error number: 3874; Symbol: ER_CLONE_IN_PROGRESS; SQLSTATE: HY000

Message: Concurrent clone in progress. Please try after clone is complete.

ER_CLONE_IN_PROGRESS was added in 8.0.17.

</br>
- Error number: 3875; Symbol: ER_CLONE_DISALLOWED; SQLSTATE: HY000

Message: The clone operation cannot be executed when %s.

ER_CLONE_DISALLOWED was added in 8.0.17.

</br>
- Error number: 3876; Symbol: ER_CANNOT_GRANT_ROLES_TO_ANONYMOUS_USER; SQLSTATE: HY000

Message: Cannot grant roles to an anonymous user.

ER_CANNOT_GRANT_ROLES_TO_ANONYMOUS_USER was added in 8.0.16.

</br>
- Error number: 3877; Symbol: ER_SECONDARY_ENGINE_PLUGIN; SQLSTATE: HY000

Message: %s

ER_SECONDARY_ENGINE_PLUGIN was added in 8.0.14.

</br>
- Error number: 3878; Symbol: ER_SECOND_PASSWORD_CANNOT_BE_EMPTY; SQLSTATE: HY000

Message: Empty password can not be retained as second password for user '%s'@'%s'.

ER_SECOND_PASSWORD_CANNOT_BE_EMPTY was added in 8.0.14.

</br>
- Error number: 3879; Symbol: ER_DB_ACCESS_DENIED; SQLSTATE: HY000

Message: Access denied for AuthId `%s`@`%s` to database '%s'.

ER_DB_ACCESS_DENIED was added in 8.0.16.

</br>
- Error number: 3880; Symbol: ER_DA_AUTH_ID_WITH_SYSTEM_USER_PRIV_IN_MANDATORY_ROLES; SQLSTATE: HY000

Message: Cannot set mandatory_roles: AuthId `%s`@`%s` has '%s' privilege.

ER_DA_AUTH_ID_WITH_SYSTEM_USER_PRIV_IN_MANDATORY_ROLES was added in 8.0.17.

</br>
- Error number: 3881; Symbol: ER_DA_RPL_GTID_TABLE_CANNOT_OPEN; SQLSTATE: HY000

Message: Gtid table is not ready to be used. Table '%s.%s' cannot be opened.

ER_DA_RPL_GTID_TABLE_CANNOT_OPEN was added in 8.0.17.

</br>
- Error number: 3882; Symbol: ER_GEOMETRY_IN_UNKNOWN_LENGTH_UNIT; SQLSTATE: SU001

Message: The geometry passed to function %s is in SRID 0, which doesn't specify a length unit. Can't convert to '%s'.

ER_GEOMETRY_IN_UNKNOWN_LENGTH_UNIT was added in 8.0.14.

</br>
- Error number: 3883; Symbol: ER_DA_PLUGIN_INSTALL_ERROR; SQLSTATE: HY000

Message: Error installing plugin '%s': %s

ER_DA_PLUGIN_INSTALL_ERROR was added in 8.0.17.

</br>
- Error number: 3884; Symbol: ER_NO_SESSION_TEMP; SQLSTATE: HY000

Message: Storage engine could not allocate temporary tablespace for this session.

ER_NO_SESSION_TEMP was added in 8.0.13.

</br>
- Error number: 3885; Symbol: ER_DA_UNKNOWN_ERROR_NUMBER; SQLSTATE: HY000

Message: Got unknown error: %d

ER_DA_UNKNOWN_ERROR_NUMBER was added in 8.0.17.

</br>
- Error number: 3886; Symbol: ER_COLUMN_CHANGE_SIZE; SQLSTATE: HY000

Message: Could not change column '%s' of table '%s'. The resulting size of index '%s' would exceed the max key length of %d bytes.

ER_COLUMN_CHANGE_SIZE was added in 8.0.14.

</br>
- Error number: 3887; Symbol: ER_REGEXP_INVALID_CAPTURE_GROUP_NAME; SQLSTATE: HY000

Message: A capture group has an invalid name.

ER_REGEXP_INVALID_CAPTURE_GROUP_NAME was added in 8.0.11.

</br>
- Error number: 3888; Symbol: ER_DA_SSL_LIBRARY_ERROR; SQLSTATE: HY000

Message: Failed to set up SSL because of the following SSL library error: %s

ER_DA_SSL_LIBRARY_ERROR was added in 8.0.17.

</br>
- Error number: 3889; Symbol: ER_SECONDARY_ENGINE; SQLSTATE: HY000

Message: Secondary engine operation failed. %s.

ER_SECONDARY_ENGINE was added in 8.0.13.

</br>
- Error number: 3890; Symbol: ER_SECONDARY_ENGINE_DDL; SQLSTATE: HY000

Message: DDLs on a table with a secondary engine defined are not allowed.

ER_SECONDARY_ENGINE_DDL was added in 8.0.13.

</br>
- Error number: 3891; Symbol: ER_INCORRECT_CURRENT_PASSWORD; SQLSTATE: HY000

Message: Incorrect current password. Specify the correct password which has to be replaced.

ER_INCORRECT_CURRENT_PASSWORD was added in 8.0.13.

</br>
- Error number: 3892; Symbol: ER_MISSING_CURRENT_PASSWORD; SQLSTATE: HY000

Message: Current password needs to be specified in the REPLACE clause in order to change it.

ER_MISSING_CURRENT_PASSWORD was added in 8.0.13.

</br>
- Error number: 3893; Symbol: ER_CURRENT_PASSWORD_NOT_REQUIRED; SQLSTATE: HY000

Message: Do not specify the current password while changing it for other users.

ER_CURRENT_PASSWORD_NOT_REQUIRED was added in 8.0.13.

</br>
- Error number: 3894; Symbol: ER_PASSWORD_CANNOT_BE_RETAINED_ON_PLUGIN_CHANGE; SQLSTATE: HY000

Message: Current password can not be retained for user '%s'@'%s' because authentication plugin is being changed.

ER_PASSWORD_CANNOT_BE_RETAINED_ON_PLUGIN_CHANGE was added in 8.0.14.

</br>
- Error number: 3895; Symbol: ER_CURRENT_PASSWORD_CANNOT_BE_RETAINED; SQLSTATE: HY000

Message: Current password can not be retained for user '%s'@'%s' because new password is empty.

ER_CURRENT_PASSWORD_CANNOT_BE_RETAINED was added in 8.0.14.

</br>
- Error number: 3896; Symbol: ER_PARTIAL_REVOKES_EXIST; SQLSTATE: HY000

Message: At least one partial revoke exists on a database. The system variable '@@partial_revokes' must be set to ON.

ER_PARTIAL_REVOKES_EXIST was added in 8.0.16.

</br>
- Error number: 3897; Symbol: ER_CANNOT_GRANT_SYSTEM_PRIV_TO_MANDATORY_ROLE; SQLSTATE: HY000

Message: AuthId `%s`@`%s` is set as mandatory_roles. Cannot grant the '%s' privilege.

ER_CANNOT_GRANT_SYSTEM_PRIV_TO_MANDATORY_ROLE was added in 8.0.16.

</br>
- Error number: 3898; Symbol: ER_XA_REPLICATION_FILTERS; SQLSTATE: HY000

Message: The use of replication filters with XA transactions is not supported, and can lead to an undefined state in the replica.

ER_XA_REPLICATION_FILTERS was added in 8.0.12.

</br>
- Error number: 3899; Symbol: ER_UNSUPPORTED_SQL_MODE; SQLSTATE: HY000

Message: sql_mode=0x%08x is not supported.

ER_UNSUPPORTED_SQL_MODE was added in 8.0.11.

</br>
- Error number: 3900; Symbol: ER_REGEXP_INVALID_FLAG; SQLSTATE: HY000

Message: Invalid match mode flag in regular expression.

ER_REGEXP_INVALID_FLAG was added in 8.0.12.

</br>
- Error number: 3901; Symbol: ER_PARTIAL_REVOKE_AND_DB_GRANT_BOTH_EXISTS; SQLSTATE: HY000

Message: '%s' privilege for database '%s' exists both as partial revoke and mysql.db simultaneously. It could mean that the 'mysql' schema is corrupted.

ER_PARTIAL_REVOKE_AND_DB_GRANT_BOTH_EXISTS was added in 8.0.16.

</br>
- Error number: 3902; Symbol: ER_UNIT_NOT_FOUND; SQLSTATE: SU001

Message: There's no unit of measure named '%s'.

ER_UNIT_NOT_FOUND was added in 8.0.14.

</br>
- Error number: 3903; Symbol: ER_INVALID_JSON_VALUE_FOR_FUNC_INDEX; SQLSTATE: 22018

Message: Invalid JSON value for CAST for functional index '%s'.

ER_INVALID_JSON_VALUE_FOR_FUNC_INDEX was added in 8.0.16.

</br>
- Error number: 3904; Symbol: ER_JSON_VALUE_OUT_OF_RANGE_FOR_FUNC_INDEX; SQLSTATE: 22003

Message: Out of range JSON value for CAST for functional index '%s'.

ER_JSON_VALUE_OUT_OF_RANGE_FOR_FUNC_INDEX was added in 8.0.16.

</br>
- Error number: 3905; Symbol: ER_EXCEEDED_MV_KEYS_NUM; SQLSTATE: HY000

Message: Exceeded max number of values per record for multi-valued index '%s' by %u value(s).

ER_EXCEEDED_MV_KEYS_NUM was added in 8.0.16.

</br>
- Error number: 3906; Symbol: ER_EXCEEDED_MV_KEYS_SPACE; SQLSTATE: HY000

Message: Exceeded max total length of values per record for multi-valued index '%s' by %u bytes.

ER_EXCEEDED_MV_KEYS_SPACE was added in 8.0.16.

</br>
- Error number: 3907; Symbol: ER_FUNCTIONAL_INDEX_DATA_IS_TOO_LONG; SQLSTATE: 22001

Message: Data too long for functional index '%s'.

ER_FUNCTIONAL_INDEX_DATA_IS_TOO_LONG was added in 8.0.16.

</br>
- Error number: 3908; Symbol: ER_WRONG_MVI_VALUE; SQLSTATE: HY000

Message: Cannot store an array or an object in a scalar key part of the index '%s'.

ER_WRONG_MVI_VALUE was added in 8.0.16.

</br>
- Error number: 3909; Symbol: ER_WARN_FUNC_INDEX_NOT_APPLICABLE; SQLSTATE: HY000

Message: Cannot use functional index '%s' due to type or collation conversion.

ER_WARN_FUNC_INDEX_NOT_APPLICABLE was added in 8.0.16.

</br>
- Error number: 3910; Symbol: ER_GRP_RPL_UDF_ERROR; SQLSTATE: HY000

Message: The function '%s' failed. %s

ER_GRP_RPL_UDF_ERROR was added in 8.0.13.

</br>
- Error number: 3911; Symbol: ER_UPDATE_GTID_PURGED_WITH_GR; SQLSTATE: HY000

Message: Cannot update GTID_PURGED with the Group Replication plugin running

ER_UPDATE_GTID_PURGED_WITH_GR was added in 8.0.12.

</br>
- Error number: 3912; Symbol: ER_GROUPING_ON_TIMESTAMP_IN_DST; SQLSTATE: HY000

Message: Grouping on temporal is non-deterministic for timezones having DST. Please consider switching to UTC for this query.

ER_GROUPING_ON_TIMESTAMP_IN_DST was added in 8.0.17.

</br>
- Error number: 3913; Symbol: ER_TABLE_NAME_CAUSES_TOO_LONG_PATH; SQLSTATE: HY000

Message: Long database name and identifier for object resulted in a path length too long for table '%s'. Please check the path limit for your OS.

ER_TABLE_NAME_CAUSES_TOO_LONG_PATH was added in 8.0.4.

</br>
- Error number: 3914; Symbol: ER_AUDIT_LOG_INSUFFICIENT_PRIVILEGE; SQLSTATE: HY000

Message: Request ignored for '%s'@'%s'. Role needed to perform operation: '%s'

ER_AUDIT_LOG_INSUFFICIENT_PRIVILEGE was added in 8.0.16.

</br>
- Error number: 3916; Symbol: ER_DA_GRP_RPL_STARTED_AUTO_REJOIN; SQLSTATE: HY000

Message: Started auto-rejoin procedure attempt %lu of %lu

ER_DA_GRP_RPL_STARTED_AUTO_REJOIN was added in 8.0.17.

</br>
- Error number: 3917; Symbol: ER_SYSVAR_CHANGE_DURING_QUERY; SQLSTATE: HY000

Message: A plugin was loaded or unloaded during a query, a system variable table was changed.

ER_SYSVAR_CHANGE_DURING_QUERY was added in 8.0.18.

</br>
- Error number: 3918; Symbol: ER_GLOBSTAT_CHANGE_DURING_QUERY; SQLSTATE: HY000

Message: A plugin was loaded or unloaded during a query, a global status variable was changed.

ER_GLOBSTAT_CHANGE_DURING_QUERY was added in 8.0.18.

</br>
- Error number: 3919; Symbol: ER_GRP_RPL_MESSAGE_SERVICE_INIT_FAILURE; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed to start its message service.

ER_GRP_RPL_MESSAGE_SERVICE_INIT_FAILURE was added in 8.0.18.

</br>
- Error number: 3920; Symbol: ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_CLIENT; SQLSTATE: HY000

Message: Invalid MASTER_COMPRESSION_ALGORITHMS '%s' for channel '%s'.

ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_CLIENT was added in 8.0.18, removed after 8.0.32.

</br>
- Error number: 3921; Symbol: ER_CHANGE_MASTER_WRONG_COMPRESSION_LEVEL_CLIENT; SQLSTATE: HY000

Message: Invalid MASTER_ZSTD_COMPRESSION_LEVEL %u for channel '%s'.

ER_CHANGE_MASTER_WRONG_COMPRESSION_LEVEL_CLIENT was added in 8.0.18, removed after 8.0.32.

</br>
- Error number: 3922; Symbol: ER_WRONG_COMPRESSION_ALGORITHM_CLIENT; SQLSTATE: HY000

Message: Invalid compression algorithm '%s'.

ER_WRONG_COMPRESSION_ALGORITHM_CLIENT was added in 8.0.18.

</br>
- Error number: 3923; Symbol: ER_WRONG_COMPRESSION_LEVEL_CLIENT; SQLSTATE: HY000

Message: Invalid zstd compression level for algorithm '%s'.

ER_WRONG_COMPRESSION_LEVEL_CLIENT was added in 8.0.18.

</br>
- Error number: 3924; Symbol: ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_LIST_CLIENT; SQLSTATE: HY000

Message: Specified compression algorithm list '%s' exceeds total count of 3 for channel '%s'.

ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_LIST_CLIENT was added in 8.0.18, removed after 8.0.32.

</br>
- Error number: 3925; Symbol: ER_CLIENT_PRIVILEGE_CHECKS_USER_CANNOT_BE_ANONYMOUS; SQLSTATE: HY000

Message: PRIVILEGE_CHECKS_USER for replication channel '%s' was set to ``@`%s`, but anonymous users are disallowed for PRIVILEGE_CHECKS_USER.

ER_CLIENT_PRIVILEGE_CHECKS_USER_CANNOT_BE_ANONYMOUS was added in 8.0.18.

</br>
- Error number: 3926; Symbol: ER_CLIENT_PRIVILEGE_CHECKS_USER_DOES_NOT_EXIST; SQLSTATE: HY000

Message: PRIVILEGE_CHECKS_USER for replication channel '%s' was set to `%s`@`%s`, but this is not an existing user.

ER_CLIENT_PRIVILEGE_CHECKS_USER_DOES_NOT_EXIST was added in 8.0.18.

</br>
- Error number: 3927; Symbol: ER_CLIENT_PRIVILEGE_CHECKS_USER_CORRUPT; SQLSTATE: HY000

Message: Invalid, corrupted PRIVILEGE_CHECKS_USER was found in the replication configuration repository for channel '%s'. Use CHANGE REPLICATION SOURCE TO PRIVILEGE_CHECKS_USER to correct the configuration.

ER_CLIENT_PRIVILEGE_CHECKS_USER_CORRUPT was added in 8.0.18.

</br>
- Error number: 3928; Symbol: ER_CLIENT_PRIVILEGE_CHECKS_USER_NEEDS_RPL_APPLIER_PRIV; SQLSTATE: HY000

Message: PRIVILEGE_CHECKS_USER for replication channel '%s' was set to `%s`@`%s`, but this user does not have REPLICATION_APPLIER privilege.

ER_CLIENT_PRIVILEGE_CHECKS_USER_NEEDS_RPL_APPLIER_PRIV was added in 8.0.18.

</br>
- Error number: 3929; Symbol: ER_WARN_DA_PRIVILEGE_NOT_REGISTERED; SQLSTATE: HY000

Message: Dynamic privilege '%s' is not registered with the server.

ER_WARN_DA_PRIVILEGE_NOT_REGISTERED was added in 8.0.18.

</br>
- Error number: 3930; Symbol: ER_CLIENT_KEYRING_UDF_KEY_INVALID; SQLSTATE: HY000

Message: Function '%s' failed because key is invalid.

ER_CLIENT_KEYRING_UDF_KEY_INVALID was added in 8.0.19.

</br>
- Error number: 3931; Symbol: ER_CLIENT_KEYRING_UDF_KEY_TYPE_INVALID; SQLSTATE: HY000

Message: Function '%s' failed because key type is invalid.

ER_CLIENT_KEYRING_UDF_KEY_TYPE_INVALID was added in 8.0.19.

</br>
- Error number: 3932; Symbol: ER_CLIENT_KEYRING_UDF_KEY_TOO_LONG; SQLSTATE: HY000

Message: Function '%s' failed because key length is too long.

ER_CLIENT_KEYRING_UDF_KEY_TOO_LONG was added in 8.0.19.

</br>
- Error number: 3933; Symbol: ER_CLIENT_KEYRING_UDF_KEY_TYPE_TOO_LONG; SQLSTATE: HY000

Message: Function '%s' failed because key type is too long.

ER_CLIENT_KEYRING_UDF_KEY_TYPE_TOO_LONG was added in 8.0.19.

</br>
- Error number: 3934; Symbol: ER_JSON_SCHEMA_VALIDATION_ERROR_WITH_DETAILED_REPORT; SQLSTATE: HY000

Message: %s.

ER_JSON_SCHEMA_VALIDATION_ERROR_WITH_DETAILED_REPORT was added in 8.0.19.

</br>
- Error number: 3935; Symbol: ER_DA_UDF_INVALID_CHARSET_SPECIFIED; SQLSTATE: HY000

Message: Invalid character set '%s' was specified. It must be either character set name or collation name as supported by server.

ER_DA_UDF_INVALID_CHARSET_SPECIFIED was added in 8.0.19.

</br>
- Error number: 3936; Symbol: ER_DA_UDF_INVALID_CHARSET; SQLSTATE: HY000

Message: Invalid character set '%s' was specified. It must be a character set name as supported by server.

ER_DA_UDF_INVALID_CHARSET was added in 8.0.19.

</br>
- Error number: 3937; Symbol: ER_DA_UDF_INVALID_COLLATION; SQLSTATE: HY000

Message: Invalid collation '%s' was specified. It must be a collation name as supported by server.

ER_DA_UDF_INVALID_COLLATION was added in 8.0.19.

</br>
- Error number: 3938; Symbol: ER_DA_UDF_INVALID_EXTENSION_ARGUMENT_TYPE; SQLSTATE: HY000

Message: Invalid extension argument type '%s' was specified. Refer the MySQL manual for the valid UDF extension arguments type.

ER_DA_UDF_INVALID_EXTENSION_ARGUMENT_TYPE was added in 8.0.19.

</br>
- Error number: 3939; Symbol: ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME; SQLSTATE: HY000

Message: Table has multiple constraints with the name '%s'. Please use constraint specific '%s' clause.

ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME was added in 8.0.19.

</br>
- Error number: 3940; Symbol: ER_CONSTRAINT_NOT_FOUND; SQLSTATE: HY000

Message: Constraint '%s' does not exist.

ER_CONSTRAINT_NOT_FOUND was added in 8.0.19.

</br>
- Error number: 3941; Symbol: ER_ALTER_CONSTRAINT_ENFORCEMENT_NOT_SUPPORTED; SQLSTATE: HY000

Message: Altering constraint enforcement is not supported for the constraint '%s'. Enforcement state alter is not supported for the PRIMARY, UNIQUE and FOREIGN KEY type constraints.

ER_ALTER_CONSTRAINT_ENFORCEMENT_NOT_SUPPORTED was added in 8.0.19.

</br>
- Error number: 3942; Symbol: ER_TABLE_VALUE_CONSTRUCTOR_MUST_HAVE_COLUMNS; SQLSTATE: HY000

Message: Each row of a VALUES clause must have at least one column, unless when used as source in an INSERT statement.

ER_TABLE_VALUE_CONSTRUCTOR_MUST_HAVE_COLUMNS was added in 8.0.19.

</br>
- Error number: 3943; Symbol: ER_TABLE_VALUE_CONSTRUCTOR_CANNOT_HAVE_DEFAULT; SQLSTATE: HY000

Message: A VALUES clause cannot use DEFAULT values, unless used as a source in an INSERT statement.

ER_TABLE_VALUE_CONSTRUCTOR_CANNOT_HAVE_DEFAULT was added in 8.0.19.

</br>
- Error number: 3944; Symbol: ER_CLIENT_QUERY_FAILURE_INVALID_NON_ROW_FORMAT; SQLSTATE: HY000

Message: The query does not comply with variable require_row_format restrictions.

ER_CLIENT_QUERY_FAILURE_INVALID_NON_ROW_FORMAT was added in 8.0.19.

</br>
- Error number: 3945; Symbol: ER_REQUIRE_ROW_FORMAT_INVALID_VALUE; SQLSTATE: HY000

Message: The requested value %s is invalid for REQUIRE_ROW_FORMAT, must be either 0 or 1.

ER_REQUIRE_ROW_FORMAT_INVALID_VALUE was added in 8.0.19.

</br>
- Error number: 3946; Symbol: ER_FAILED_TO_DETERMINE_IF_ROLE_IS_MANDATORY; SQLSTATE: HY000

Message: Failed to acquire lock on user management service, unable to determine if role %s@%s is mandatory

ER_FAILED_TO_DETERMINE_IF_ROLE_IS_MANDATORY was added in 8.0.19.

</br>
- Error number: 3947; Symbol: ER_FAILED_TO_FETCH_MANDATORY_ROLE_LIST; SQLSTATE: HY000

Message: Failed to acquire lock on user management service, unable to fetch mandatory role list

ER_FAILED_TO_FETCH_MANDATORY_ROLE_LIST was added in 8.0.19.

</br>
- Error number: 3948; Symbol: ER_CLIENT_LOCAL_FILES_DISABLED; SQLSTATE: 42000

Message: Loading local data is disabled; this must be enabled on both the client and server sides

ER_CLIENT_LOCAL_FILES_DISABLED was added in 8.0.19.

</br>
- Error number: 3949; Symbol: ER_IMP_INCOMPATIBLE_CFG_VERSION; SQLSTATE: HY000

Message: Failed to import %s because the CFG file version (%u) is not compatible with the current version (%u)

ER_IMP_INCOMPATIBLE_CFG_VERSION was added in 8.0.19.

</br>
- Error number: 3950; Symbol: ER_DA_OOM; SQLSTATE: HY000

Message: Out of memory

ER_DA_OOM was added in 8.0.19.

</br>
- Error number: 3951; Symbol: ER_DA_UDF_INVALID_ARGUMENT_TO_SET_CHARSET; SQLSTATE: HY000

Message: Character set can be set only for the UDF argument type STRING.

ER_DA_UDF_INVALID_ARGUMENT_TO_SET_CHARSET was added in 8.0.19.

</br>
- Error number: 3952; Symbol: ER_DA_UDF_INVALID_RETURN_TYPE_TO_SET_CHARSET; SQLSTATE: HY000

Message: Character set can be set only for the UDF RETURN type STRING.

ER_DA_UDF_INVALID_RETURN_TYPE_TO_SET_CHARSET was added in 8.0.19.

</br>
- Error number: 3953; Symbol: ER_MULTIPLE_INTO_CLAUSES; SQLSTATE: HY000

Message: Multiple INTO clauses in one query block.

ER_MULTIPLE_INTO_CLAUSES was added in 8.0.19.

</br>
- Error number: 3954; Symbol: ER_MISPLACED_INTO; SQLSTATE: HY000

Message: Misplaced INTO clause, INTO is not allowed inside subqueries, and must be placed at end of UNION clauses.

ER_MISPLACED_INTO was added in 8.0.19.

</br>
- Error number: 3955; Symbol: ER_USER_ACCESS_DENIED_FOR_USER_ACCOUNT_BLOCKED_BY_PASSWORD_LOCK; SQLSTATE: HY000

Message: Access denied for user '%s'@'%s'. Account is blocked for %s day(s) (%s day(s) remaining) due to %u consecutive failed logins.

ER_USER_ACCESS_DENIED_FOR_USER_ACCOUNT_BLOCKED_BY_PASSWORD_LOCK was added in 8.0.19.

</br>
- Error number: 3956; Symbol: ER_WARN_DEPRECATED_YEAR_UNSIGNED; SQLSTATE: HY000

Message: UNSIGNED for the YEAR data type is deprecated and support for it will be removed in a future release.

ER_WARN_DEPRECATED_YEAR_UNSIGNED was added in 8.0.19.

</br>
- Error number: 3957; Symbol: ER_CLONE_NETWORK_PACKET; SQLSTATE: HY000

Message: Clone needs max_allowed_packet value to be %u or more. Current value is %u

ER_CLONE_NETWORK_PACKET was added in 8.0.19.

</br>
- Error number: 3958; Symbol: ER_SDI_OPERATION_FAILED_MISSING_RECORD; SQLSTATE: HY000

Message: Failed to %s sdi for %s.%s in %s due to missing record.

ER_SDI_OPERATION_FAILED_MISSING_RECORD was added in 8.0.19.

</br>
- Error number: 3959; Symbol: ER_DEPENDENT_BY_CHECK_CONSTRAINT; SQLSTATE: HY000

Message: Check constraint '%s' uses column '%s', hence column cannot be dropped or renamed.

ER_DEPENDENT_BY_CHECK_CONSTRAINT was added in 8.0.19.

</br>
- Error number: 3960; Symbol: ER_GRP_OPERATION_NOT_ALLOWED_GR_MUST_STOP; SQLSTATE: HY000

Message: This operation cannot be performed while Group Replication is running; run STOP GROUP_REPLICATION first

ER_GRP_OPERATION_NOT_ALLOWED_GR_MUST_STOP was added in 8.0.20.

</br>
- Error number: 3961; Symbol: ER_WARN_DEPRECATED_JSON_TABLE_ON_ERROR_ON_EMPTY; SQLSTATE: HY000

Message: Specifying an ON EMPTY clause after the ON ERROR clause in a JSON_TABLE column definition is deprecated syntax and will be removed in a future release. Specify ON EMPTY before ON ERROR instead.

ER_WARN_DEPRECATED_JSON_TABLE_ON_ERROR_ON_EMPTY was added in 8.0.20.

</br>
- Error number: 3962; Symbol: ER_WARN_DEPRECATED_INNER_INTO; SQLSTATE: HY000

Message: The INTO clause is deprecated inside query blocks of query expressions and will be removed in a future release. Please move the INTO clause to the end of statement instead.

ER_WARN_DEPRECATED_INNER_INTO was added in 8.0.20.

</br>
- Error number: 3963; Symbol: ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL; SQLSTATE: HY000

Message: The VALUES() function is deprecated and will be removed in a future release. It always returns NULL in this situation. To access values from the VALUES clause of an INSERT statement, consider using an alias (INSERT INTO ... VALUES (...) AS alias) and reference alias.col instead of VALUES(col) in the ON DUPLICATE KEY UPDATE clause.

ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL was added in 8.0.20.

</br>
- Error number: 3964; Symbol: ER_MISSING_JSON_VALUE; SQLSTATE: 22035

Message: No value was found by '%s' on the specified path.

ER_MISSING_JSON_VALUE was added in 8.0.21.

</br>
- Error number: 3965; Symbol: ER_MULTIPLE_JSON_VALUES; SQLSTATE: 22034

Message: More than one value was found by '%s' on the specified path.

ER_MULTIPLE_JSON_VALUES was added in 8.0.21.

</br>
- Error number: 3966; Symbol: ER_WARN_DEPRECATED_SQL_CALC_FOUND_ROWS; SQLSTATE: HY000

Message: SQL_CALC_FOUND_ROWS is deprecated and will be removed in a future release. Consider using two separate queries instead.

ER_WARN_DEPRECATED_SQL_CALC_FOUND_ROWS was added in 8.0.16.

</br>
- Error number: 3967; Symbol: ER_WARN_DEPRECATED_FOUND_ROWS; SQLSTATE: HY000

Message: FOUND_ROWS() is deprecated and will be removed in a future release. Consider using COUNT(*) instead.

ER_WARN_DEPRECATED_FOUND_ROWS was added in 8.0.16.

</br>
- Error number: 3968; Symbol: ER_HOSTNAME_TOO_LONG; SQLSTATE: HY000

Message: Hostname cannot be longer than %d characters.

ER_HOSTNAME_TOO_LONG was added in 8.0.21.

</br>
- Error number: 3969; Symbol: ER_WARN_CLIENT_DEPRECATED_PARTITION_PREFIX_KEY; SQLSTATE: HY000

Message: Column '%s.%s.%s' having prefix key part '%s(%u)' is ignored by the partitioning function. Use of prefixed columns in the PARTITION BY KEY() clause is deprecated and will be removed in a future release.

ER_WARN_CLIENT_DEPRECATED_PARTITION_PREFIX_KEY was added in 8.0.21.

</br>
- Error number: 3970; Symbol: ER_GROUP_REPLICATION_USER_EMPTY_MSG; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed since the username provided for recovery channel is empty.

ER_GROUP_REPLICATION_USER_EMPTY_MSG was added in 8.0.21.

</br>
- Error number: 3971; Symbol: ER_GROUP_REPLICATION_USER_MANDATORY_MSG; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed since the USER option was not provided with PASSWORD for recovery channel.

ER_GROUP_REPLICATION_USER_MANDATORY_MSG was added in 8.0.21.

</br>
- Error number: 3972; Symbol: ER_GROUP_REPLICATION_PASSWORD_LENGTH; SQLSTATE: HY000

Message: The START GROUP_REPLICATION command failed since the password provided for the recovery channel exceeds the maximum length of 32 characters.

ER_GROUP_REPLICATION_PASSWORD_LENGTH was added in 8.0.21.

</br>
- Error number: 3973; Symbol: ER_SUBQUERY_TRANSFORM_REJECTED; SQLSTATE: HY000

Message: Statement requires a transform of a subquery to a non-SET operation (like IN2EXISTS, or subquery-to-LATERAL-derived-table). This is not allowed with optimizer switch 'subquery_to_derived' on

ER_SUBQUERY_TRANSFORM_REJECTED was added in 8.0.21.

</br>
- Error number: 3974; Symbol: ER_DA_GRP_RPL_RECOVERY_ENDPOINT_FORMAT; SQLSTATE: HY000

Message: Invalid input value for recovery socket endpoints '%s'. Please, provide a valid, comma separated, list of endpoints (IP:port)

ER_DA_GRP_RPL_RECOVERY_ENDPOINT_FORMAT was added in 8.0.21.

</br>
- Error number: 3975; Symbol: ER_DA_GRP_RPL_RECOVERY_ENDPOINT_INVALID; SQLSTATE: HY000

Message: The server is not listening on endpoint '%s'. Only endpoints that the server is listening on are valid recovery endpoints.

ER_DA_GRP_RPL_RECOVERY_ENDPOINT_INVALID was added in 8.0.21.

</br>
- Error number: 3976; Symbol: ER_WRONG_VALUE_FOR_VAR_PLUS_ACTIONABLE_PART; SQLSTATE: HY000

Message: Variable '%s' cannot be set to the value of '%s'. %s

ER_WRONG_VALUE_FOR_VAR_PLUS_ACTIONABLE_PART was added in 8.0.21.

</br>
- Error number: 3977; Symbol: ER_STATEMENT_NOT_ALLOWED_AFTER_START_TRANSACTION; SQLSTATE: HY000

Message: Only BINLOG INSERT, COMMIT and ROLLBACK statements are allowed after CREATE TABLE with START TRANSACTION statement.

ER_STATEMENT_NOT_ALLOWED_AFTER_START_TRANSACTION was added in 8.0.21.

</br>
- Error number: 3978; Symbol: ER_FOREIGN_KEY_WITH_ATOMIC_CREATE_SELECT; SQLSTATE: HY000

Message: Foreign key creation is not allowed with CREATE TABLE as SELECT and CREATE TABLE with START TRANSACTION statement.

ER_FOREIGN_KEY_WITH_ATOMIC_CREATE_SELECT was added in 8.0.21.

</br>
- Error number: 3979; Symbol: ER_NOT_ALLOWED_WITH_START_TRANSACTION; SQLSTATE: HY000

Message: START TRANSACTION clause cannot be used %s

ER_NOT_ALLOWED_WITH_START_TRANSACTION was added in 8.0.21.

</br>
- Error number: 3980; Symbol: ER_INVALID_JSON_ATTRIBUTE; SQLSTATE: HY000

Message: Invalid json attribute, error: "%s" at pos %u: '%s'

ER_INVALID_JSON_ATTRIBUTE was added in 8.0.21.

</br>
- Error number: 3981; Symbol: ER_ENGINE_ATTRIBUTE_NOT_SUPPORTED; SQLSTATE: HY000

Message: Storage engine '%s' does not support ENGINE_ATTRIBUTE.

ER_ENGINE_ATTRIBUTE_NOT_SUPPORTED was added in 8.0.21.

</br>
- Error number: 3982; Symbol: ER_INVALID_USER_ATTRIBUTE_JSON; SQLSTATE: HY000

Message: The user attribute must be a valid JSON object

ER_INVALID_USER_ATTRIBUTE_JSON was added in 8.0.21.

</br>
- Error number: 3983; Symbol: ER_INNODB_REDO_DISABLED; SQLSTATE: HY000

Message: Cannot perform operation as InnoDB redo logging is disabled. Please retry after enabling redo log with ALTER INSTANCE

ER_INNODB_REDO_DISABLED was added in 8.0.21.

</br>
- Error number: 3984; Symbol: ER_INNODB_REDO_ARCHIVING_ENABLED; SQLSTATE: HY000

Message: Cannot perform operation as InnoDB is archiving redo log. Please retry after stopping redo archive by invoking innodb_redo_log_archive_stop()

ER_INNODB_REDO_ARCHIVING_ENABLED was added in 8.0.21.

</br>
- Error number: 3985; Symbol: ER_MDL_OUT_OF_RESOURCES; SQLSTATE: HY000

Message: Not enough resources to complete lock request.

ER_MDL_OUT_OF_RESOURCES was added in 8.0.21.

</br>
**Scan the QR code to follow the GreatSQL WeChat official account**
![greatsql-wx](../greatsql-wx.jpg)
