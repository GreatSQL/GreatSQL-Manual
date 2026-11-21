# Extended Grant Display

---

In MySQL's `SHOW GRANTS`, only the grants explicitly granted to the specified account are displayed. The account may have other grants, but they are not displayed. For example, if anonymous accounts exist, the specified account may be able to use their grants, but `SHOW GRANTS` does not display them. GreatSQL provides the `SHOW EFFECTIVE GRANTS` command to display all effectively available grants of an account, including grants granted to other accounts.

## Examples

If we create the following user:

```sql
greatsql> CREATE USER grantee@localhost IDENTIFIED BY 'grantee1';
Query OK, 0 rows affected (0.06 sec)
```
And create the grantee anonymous user

```sql
greatsql> CREATE USER grantee IDENTIFIED BY 'grantee2';
Query OK, 0 rows affected (0.06 sec)
```

Create a DATABASE again

```sql
greatsql> CREATE DATABASE db2;
Query OK, 1 row affected (0.06 sec)
```

Grant the grantee user

```sql
greatsql> GRANT ALL PRIVILEGES ON db2.* TO grantee WITH GRANT OPTION;
Query OK, 0 rows affected (0.01 sec)
```

If only `SHOW GRANTS` is used to view, all grants of the user are not displayed:

```sql
greatsql> SHOW GRANTS FOR 'grantee'@'localhost';
+---------------------------------------------+
| Grants for grantee@localhost                |
+---------------------------------------------+
| GRANT USAGE ON *.* TO `grantee`@`localhost` |
+---------------------------------------------+
1 row in set (0.00 sec)
```

Although the grant on the `db2` database is not displayed, the `grantee@localhost` user has sufficient grants to create tables in this database:

```bash
$ mysql -ugrantee -pgrantee1 -h localhost

greatsql> CREATE TABLE db2.t1(a int);
Query OK, 0 rows affected (0.02 sec)
```

After the change, the output of `SHOW EFFECTIVE GRANTS` shows all grants of the `grantee` user:

```sql
greatsql> SHOW EFFECTIVE GRANTS FOR grantee@localhost;
+----------------------------------------------------------------------------+
| Effective grants for grantee@localhost                                     |
+----------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `grantee`@`localhost`                                |
| GRANT ALL PRIVILEGES ON `db2`.* TO `grantee`@`localhost` WITH GRANT OPTION |
+----------------------------------------------------------------------------+
2 rows in set (0.00 sec)

greatsql> SHOW EFFECTIVE GRANTS FOR grantee;
+--------------------------------------------------------------------+
| Effective grants for grantee@%                                     |
+--------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `grantee`@`%`                                |
| GRANT ALL PRIVILEGES ON `db2`.* TO `grantee`@`%` WITH GRANT OPTION |
+--------------------------------------------------------------------+
2 rows in set (0.00 sec)
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
