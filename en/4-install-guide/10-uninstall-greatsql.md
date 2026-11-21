# Uninstalling GreatSQL

When it is determined that the GreatSQL database is no longer needed, or when installing the MySQL database causes conflicts and the GreatSQL database needs to be uninstalled, refer to the method in this article to uninstall the GreatSQL database.

**Important Note**
Before starting to uninstall the GreatSQL database, be sure to back up the data files to avoid the loss of important data.

## Step 1: Stop the GreatSQL Database

Before starting the uninstallation, please stop the GreatSQL database correctly first.

First, set `innodb_fast_shutdown=0`, ensuring that all data in the memory buffer is flushed to the physical disk when the GreatSQL database is stopped.

```sql
SET GLOBAL innodb_fast_shutdown=0;
```

Then, execute the `SHUTDOWN` command to stop the GreatSQL database.

```sql
SHUTDOWN;
```

It can also be stopped with `systemctl`.

```bash
systemctl stop greatsql # If the system service name is mysqld, change it to systemctl stop mysqld
```

It can also be stopped with `mysqladmin`.

```bash
mysqladmin -hlocalhost -uroot -p shutdown
```

::: danger Special Reminder
**It is strictly prohibited to directly execute the `kill -9` command to forcibly and violently stop the GreatSQL database. This is very likely to cause transaction data loss**.
:::

## Step 2: Back Up the Data Files

For simplicity, all data files under the entire `datadir` directory can be backed up. Assuming `datadir=/data/GreatSQL`, execute the following command to complete the backup:
```bash
cp -rfp /data/GreatSQL /data/GreatSQL-fullbackup-`date +"%Y%m%d"`
```

If the [binary log](../2-about-greatsql/4-3-greatsql-binary-log.md) is not stored in the *datadir* directory, the binary log must also be backed up at the same time.

## Step 3: Uninstall the GreatSQL Database

If GreatSQL was installed with the RPM method, execute the following command to complete the uninstallation:

```bash
rpm -qa | grep -i greatsql | xargs rpm -e
```

If GreatSQL was installed with the binary package method, find the location of the installation package and delete it directly, for example:

```bash
rm -fr /usr/local/GreatSQL-8.4.4-5-Linux-glibc2.17-x86_64
```

## Step 4: Clean Up the Environment

If a systemd system service was set up, delete the corresponding service file and reload.

```bash
rm -f /lib/systemd/system/greatsql.service
systemctl daemon-reload
```

Then check whether GreatSQL-related environment variables are set in *~/.bashrc* or *~/.bash_profile* on the server, and clear them.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
