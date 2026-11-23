# Backup & Restore
---

This article introduces several different backup and restore methods for the GreatSQL database, mainly including:

## Logical Backup & Restore
### [mysqldump Logical Backup & Restore](./4-1-mysqldump.md)
### [OUTFILE Logical Backup & Restore](./4-2-outfile.md)
### [MySQL Shell util Logical Backup & Restore](./4-3-shell-util.md)

## Physical Backup & Restore
### [Physical Backup & Restore, xtrabackup Backup & Restore](./4-4-physical-backup.md)

### CLONE Backup & Restore
### [CLONE Backup & Restore](./4-5-clone.md)

Different backup and restore strategies can be selected and customized according to the actual situation and business needs.

**Important Reminder** At any time, for any database (including test environments), remember to configure an appropriate backup strategy and check backup effectiveness. Avoid the situation where data is deleted by misoperation and cannot be restored because there is no backup or the backup is invalid and unavailable, affecting business and production.

**Reference materials:**

- [The Clone Plugin](https://dev.mysql.com/doc/refman/8.0/en/clone-plugin.html)
- [mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
- [mysqlpump](https://dev.mysql.com/doc/refman/8.0/en/mysqlpump.html)
- [mydumper](https://github.com/mydumper/mydumper)
- [How to Extract Some Database Tables from a mysqldump Full Backup for Restore](https://imysql.com/2010/06/01/mysql-faq-how-to-extract-data-from-dumpfile.html)
- [XtraBackup](https://docs.percona.com/percona-xtrabackup/latest/manual.html)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
