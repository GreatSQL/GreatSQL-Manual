# mysqldump Backup & Restore
---

This article introduces how to use `mysqldump` for backup and restore in the GreatSQL database.

`mysqldump` is the logical backup tool bundled with the GreatSQL database. It can implement various methods such as backing up the entire database, a single database, a single table, and part of the data in a table.

## Full Database Backup
When running `mysqldump`, specifying the `-A / --all-databases` parameter backs up all database data. If stored procedures, stored functions, views, and events also need to be backed up, the three parameters `--triggers --routines --events` also need to be specified:
```bash
mysqldump -S/data/GreatSQL/mysql.sock -A --triggers --routines --events > /backup/GreatSQL/fullbackup-`date +'%Y%m%d'`.sql
```
This completes the backup of all data, and also backs up other metadata such as triggers, stored functions, and events.

If triggers, stored functions, and events do not need to be backed up, remove the above options `--triggers --routines --events`.

Usually, when performing logical backups, pipeline synchronous compression is also used to make the backup files smaller:
```bash
mysqldump -S/data/GreatSQL/mysql.sock -A --triggers --routines --events | gzip > /backup/GreatSQL/fullbackup-`date +'%Y%m%d'`.sql.gz
```

## Single Database Backup

```bash
export db="greatsql"

mysqldump -S/data/GreatSQL/mysql.sock --triggers --routines --events -B ${db} | gzip > /backup/GreatSQL/${db}-`date +'%Y%m%d'`.sql.gz
```

If not backing up all database data, a prompt similar to the following may appear at this time:
```log
Warning: A partial dump from a server that has GTIDs will by default include the GTIDs of all transactions, even those that changed suppressed parts of the database. If you don't want to restore GTIDs, pass --set-gtid-purged=OFF. To make a complete dump, pass --all-databases --triggers --routines --events.
```

The general meaning is that this is a partial data backup and cannot be used for full recovery, so adding `gtid_purged` has certain risks. It is recommended to manually add the option `--set-gtid-purged=OFF`.

It is recommended not to add this option. If this logical backup file is used for later recovery, use `sed` to remove the `gtid_purged` information, or record the `gtid_purged` information at that time before recovery, and restore it back after recovery is complete.

## Single Table Backup

```bash
export db="greatsql"
export table="t1"

mysqldump -S/data/GreatSQL/mysql.sock --triggers --routines --events ${db} ${table} | gzip > /backup/GreatSQL/${db}-${table}-`date +'%Y%m%d'`.sql.gz
```

## Backing Up Only Part of the Data

When running `mysqldump`, adding the `-w / --where` option can specify a WHERE filter condition, achieving the purpose of backing up only part of the data, for example:
```bash
export db="greatsql"
export table="t1"

# Back up only part of the data of a single table
mysqldump -S/data/GreatSQL/mysql.sock -w "id>=10000" ${db} ${table} > /backup/GreatSQL/${db}-${table}-partial-`date +'%Y%m%d'`.sql

# Back up part of the data of all tables in a single database
mysqldump -S/data/GreatSQL/mysql.sock -f -w "id>=10000" -B ${db} > /backup/GreatSQL/${db}-partial-`date +'%Y%m%d'`.sql
```

If some tables do not have the column name specified in the where condition, an error similar to the following is reported:
```log
mysqldump: Couldn't execute 'SELECT /*!40001 SQL_NO_CACHE */ * FROM `t4` WHERE id>=1000000': Unknown column 'id' in 'where clause' (1054)
```

After adding the option `-f / --force`, the backup task can still continue without affecting the backup of other tables later.

## Logical Backup & Restore

Restoring from the `mysqldump` logical backup file is simple: just call the `mysql` client to perform the restore. There are two ways:

In the `mysql` client tool, execute the `SOURCE` command to import the SQL file. The disadvantage of this method is that the terminal keeps outputting the execution results, which is not friendly. The usage is:
```sql
USE db;
SOURCE path/file.sql;
```

For example:
```sql
USE greatsql;
SOURCE /backup/GreatSQL/greatsql-20230830.sql;
```

::: tip Tip
If the SQL file to be restored does not contain `USE db` to switch to the specified database name, you need to manually execute the `USE db` operation first.
:::

Or use the command line redirection method:
```bash
mysql -f -S/data/GreatSQL/mysql.sock greatsql < /backup/GreatSQL/greatsql-20230830.sql;
```
::: tip Tip
If the SQL file to be restored does not contain `USE db` to switch to the specified database name, the corresponding database name `greatsql` needs to be specified when calling the `mysql` client. The same applies below.
:::

Or in the operating system command line mode, directly use the pipeline method to import the SQL file:
```bash
cat /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock greatsql
```

It is even possible to use `sed` extraction to restore only part of the data.

Example 1: Extract all data between database db1 and db2 in the backup file, i.e., restore only the db1 database
```bash
export DB1="db1"
export DB2="db2"

sed -n "/^-- Current Database: \`$DB1\`/,/^-- Current Database: \`$DB2\`/p" /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock
```

Example 2: Extract all data between table tb1 and tb2 in the backup file, i.e., restore only the tb1 table
```bash
export TB1="tb1"
export TB2="tb2"

sed -n "/^-- Table structure for table \`$TB1\`/,/^-- Table structure for table \`$TB2\`/p" /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock greatsql
```

Example 3: Pass parameters to `sed` to extract only the data at the specified line numbers:
```bash
sed -n "100,200p" /backup/GreatSQL/greatsql-20230830.sql | mysql -f -S/data/GreatSQL/mysql.sock greatsql
```
That is: extract the data between lines 100-200 in the backup file for restoration.


For more detailed instructions on `mysqldump`, see the document: [mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html).

Starting from GreatSQL 8.0.32-25, `mysqldump` supports encrypted backup. For details, see the document: [mysqldump Backup Encryption](../5-enhance/5-4-security-mysqldump-encrypt.md).

**Reference materials:**

- [mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
- [How to Extract Some Database Tables from a mysqldump Full Backup for Restore](https://imysql.com/2010/06/01/mysql-faq-how-to-extract-data-from-dumpfile.html)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
