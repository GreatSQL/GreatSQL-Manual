# Connect via GreatSQL Client
---

Before connecting to the GreatSQL database, make sure that the GreatSQL service is running properly.

```bash
$ systemctl status greatsql
Active: active (running) since ...
```
It is enough to see the `Active: active (running)` keyword.

You can connect to the GreatSQL database directly with the Client client.

```bash
mysql -hhost_name -Pport_number -uuser_name -ppassword
```

::: tip Note
If the password contains special characters, enclose it in '' single quotes.
:::

The following is a connection example.

```bash
$ mysql -hlocalhost -P3306 -urepl -p'GreatSQL@2024'
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with; or \g.
Your MySQL connection id is 174
Server version: 8.4.4-5 GreatSQL, Release 5, Revision 39b389cdf3b
...
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> 
```

::: tip Tip
Because the password is supplied in plain text, the warning `[Warning] Using a password on the command line interface can be insecure.` is triggered. If you do not want to trigger the warning, simply leave out the password after `-p`.
:::

After connecting to the database, you can view basic database information with `SHOW VARIABLES LIKE '%version%';` or `\s`.

```sql
greatsql> SHOW VARIABLES LIKE '%version%';
+--------------------------------------------------+--------------------------------------------+
| Variable_name                                    | Value                                      |
+--------------------------------------------------+--------------------------------------------+
| admin_tls_version                                | TLSv1.2,TLSv1.3                            |
| gdb_sqld_version                                 | 8.4.4.5                                    |
| group_replication_allow_local_lower_version_join | OFF                                        |
| group_replication_recovery_tls_version           | TLSv1.2,TLSv1.3                            |
| immediate_server_version                         | 999999                                     |
| innodb_version                                   | 8.4.4-8.4.4                                |
| original_server_version                          | 999999                                     |
| protocol_version                                 | 10                                         |
| replica_type_conversions                         |                                            |
| tls_version                                      | TLSv1.2,TLSv1.3                            |
| version                                          | 8.4.4-5                                    |
| version_comment                                  | GreatSQL, Release 5, Revision 39b389cdf3b  |
| version_compile_machine                          | x86_64                                     |
| version_compile_os                               | Linux                                      |
| version_compile_zlib                             | 1.2.13                                     |
| version_suffix                                   |                                            |
+--------------------------------------------------+--------------------------------------------+
17 rows in set (0.01 sec)
```

Use the `EXIT` or `QUIT` command to exit the GreatSQL client connection.

```sql
greatsql> EXIT
Bye
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
