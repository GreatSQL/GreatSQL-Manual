# 扩展显示授权

---

在 MySQL 的`SHOW GRANTS` 中，仅显示显式授予指定帐户的授权。该帐户可能具有其他授权，但不会显示。例如，如果存在匿名帐户，则指定帐户可能能够使用其授权，但 `SHOW GRANTS` 将不会显示它们。GreatSQL 提供 `SHOW EFFECTIVE GRANTS` 命令来显示帐户的所有有效可用授权，包括授予其他帐户的授权。

## 例子

如果我们创建以下用户：

```sql
greatsql> CREATE USER grantee@localhost IDENTIFIED BY 'grantee1';
Query OK, 0 rows affected (0.06 sec)
```
以及创建grantee匿名用户

```sql
greatsql> CREATE USER grantee IDENTIFIED BY 'grantee2';
Query OK, 0 rows affected (0.06 sec)
```

再创建一个DATABASE

```sql
greatsql> CREATE DATABASE db2;
Query OK, 1 row affected (0.06 sec)
```

授权grantee用户

```sql
greatsql> GRANT ALL PRIVILEGES ON db2.* TO grantee WITH GRANT OPTION;
Query OK, 0 rows affected (0.01 sec)
```

若只使用`SHOW GRANTS`查看不会显示用户的所有授权：

```sql
greatsql> SHOW GRANTS FOR 'grantee'@'localhost';
+---------------------------------------------+
| Grants for grantee@localhost                |
+---------------------------------------------+
| GRANT USAGE ON *.* TO `grantee`@`localhost` |
+---------------------------------------------+
1 row in set (0.00 sec)
```

尽管未显示对 `db2` 数据库的授权，但 `grantee@localhost` 用户具有足够的授权在该数据库中创建表：

```bash
$ mysql -ugrantee -pgrantee1 -h localhost

greatsql> CREATE TABLE db2.t1(a int);
Query OK, 0 rows affected (0.02 sec)
```

更改后 `SHOW EFFECTIVE GRANTS` 的输出显示了 `grantee` 用户的所有授权：

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

## 问题反馈

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
