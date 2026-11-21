# Notes to Users

---

## About GreatSQL

GreatSQL is an **open source and free** database that can meet financial-grade application scenarios on commodity hardware. It features **High Availability**, **High Performance**, **High Compatibility**, and **High Security**, and can serve as an ideal drop-in replacement for MySQL or Percona Server for MySQL.

GreatSQL is committed to keeping open source open. GreatSQL is released under the [GPLv2 license](https://gitee.com/GreatSQL/GreatSQL/blob/master/LICENSE).

GreatSQL source code is hosted on [Gitee](https://gitee.com/GreatSQL/GreatSQL) and mirrored to [GitHub](https://github.com/GreatSQL/GreatSQL).

If you are using GreatSQL, [please fill out this questionnaire](https://wj.qq.com/s2/11543483/9e09/) to **enjoy free technical support services**. It takes only 1 minute, and it is also very important to us.

## Understanding GreatSQL Version Numbers

GreatSQL version numbers follow the dotted naming convention (X.Y.Z-R), where:

- X is the major version number: MYSQL_VERSION_MAJOR, e.g., 3.x, 4.x, 5.x, 8.x, etc.
- Y is the minor version number: MYSQL_VERSION_MINOR, e.g., 3.23.x, 4.0.x, 4.1.x, 5.0.x, 5.1.x, 5.5.x, 5.6.x, 5.7.x, 8.0.x, etc.
- Z is the patch version number: MYSQL_VERSION_PATCH, e.g., 3.23.58, 4.0.30, 4.1.25, 5.0.96, 5.1.73, 5.5.62, 5.6.51, 5.7.37, 8.0.29, etc.
- R is the revision number: MYSQL_VERSION_REVISION, e.g., 5.7.36-39 Revision a2ce7ad3400, 8.0.25-16 Revision 202302041847, 8.0.32-27 Revision aa66a385910, etc.
- The major version of GreatSQL corresponds to the version numbers of Percona Server for MySQL/Oracle MySQL.

Take GreatSQL 8.0.32-27 as an example. After logging in to the GreatSQL database, you can run the `\s` or `STATUS` command to obtain the following information:

```bash
# Log in to GreatSQL
$ mysql -hlocalhost -S/data/GreatSQL/mysql.sock -uroot -p
...

# Run STATUS in GreatSQL to view the version
greatsql> STATUS;
...
Server version:         8.0.32-27 GreatSQL, Release 27, Revision a68b3034c3d
...
```

Where:

- Major version X corresponds to: 8
- Minor version Y corresponds to: 0
- Patch version Z corresponds to: 32
- Revision R corresponds to: 27
- Revision (source code revision): a68b3034c3d

GreatSQL may release multiple versions based on the same base version. For example, GreatSQL 8.0.32-24, 8.0.32-25, and 8.0.32-27 are all based on the 8.0.32 base version.

Normally, GreatSQL releases two versions every year, generally one in the first half of the year and one in the second half.

## Conventions

In this document, the conventions for operating system command lines and SQL command prompts are as follows:

- `$` is the Linux command prompt.
- `greatsql>` is the GreatSQL database SQL command prompt.

As shown in the following example.

Run the following command to start the GreatSQL service:

```bash
systemctl start greatsql
```

Run the SQL command `SHOW DATABASES` in GreatSQL to view the list of databases:

```sql
greatsql> SHOW DATABASES;
+-------------------------------+
| Database                      |
+-------------------------------+
| employees                     |
| greatsql                      |
| information_schema            |
| mysql                         |
| mysql_innodb_cluster_metadata |
| performance_schema            |
| sakila                        |
| sys                           |
| sys_audit                     |
| world                         |
+-------------------------------+
14 rows in set (0.00 sec)
```

**Scan to follow our official WeChat account**

![greatsql-wx](../../greatsql-wx.jpg)
