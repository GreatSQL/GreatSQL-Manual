# 通过 Client 客户端连接
---

连接到 GreatSQL 数据库之前，请确认 GreatSQL 服务正常运行。

```bash
$ systemctl status greatsql
Active: active (running) since ...
```
看到 `Active: active (running)` 关键字即可。

可以直接使用 Client 客户端连接到 GreatSQL 数据库

```bash
mysql -h主机名 -P端口号 -u用户名 -p密码
```

::: tip 注意
若密码有特殊字符请使用''英文引号包围密码。
:::

以下为连接示例

```bash
$ mysql -hlocalhost -P3306 -urepl -p'GreatSQL@2024'
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 174
Server version: 8.0.32-27 GreatSQL, Release 27, Revision aa66a385910

Copyright (c) 2021-2023 GreatDB Software Co., Ltd
Copyright (c) 2009-2023 Percona LLC and/or its affiliates
Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

greatsql> 
```

::: tip 小贴士
因为密码为明文填入，所以会触发警告`[Warning] Using a password on the command line interface can be insecure.`，若不想触发警告，在 `-p` 后面不要填入密码即可。
:::

连入数据库后，可以使用`SHOW VARIABLES LIKE '%version%';`或`\s`查看数据库基本信息

```sql
greatsql> SHOW VARIABLES LIKE '%version%';
+--------------------------------------------------+--------------------------------------------+
| Variable_name                                    | Value                                      |
+--------------------------------------------------+--------------------------------------------+
| admin_tls_version                                | TLSv1.2,TLSv1.3                            |
| gdb_sqld_version                                 | 8.0.32.5                                   |
| group_replication_allow_local_lower_version_join | OFF                                        |
| group_replication_recovery_tls_version           | TLSv1.2,TLSv1.3                            |
| immediate_server_version                         | 999999                                     |
| innodb_version                                   | 8.0.32-8.0.32                              |
| original_server_version                          | 999999                                     |
| protocol_version                                 | 10                                         |
| replica_type_conversions                         |                                            |
| slave_type_conversions                           |                                            |
| tls_version                                      | TLSv1.2,TLSv1.3                            |
| version                                          | 8.0.32-27                                  |
| version_comment                                  | GreatSQL, Release 27, Revision aa66a385910 |
| version_compile_machine                          | x86_64                                     |
| version_compile_os                               | Linux                                      |
| version_compile_zlib                             | 1.2.13                                     |
| version_suffix                                   |                                            |
+--------------------------------------------------+--------------------------------------------+
17 rows in set (0.01 sec)
```

使用`EXIT`或`QUIT`命令即可退出GreatSQL客户端连接

```sql
greatsql> EXIT
Bye
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
