# 最后登录信息记录
---

在GreatSQL中，可以将用户最后一次登录的信息存储在系统表 `sys_audit.greatdb_login_info` 中，并允许被授权的用户进行查询。

存储的最后登录信息包括线程号、登录时间、登录主机、登录用户名、校验权限的账户信息、失败登录次数。

启用该特性
```sql
greatsql> SET GLOBAL enable_last_login_info=1;
```

启用后，新建立的连接就会被记录下来。

查询最后登录信息：
```sql
greatsql> SELECT * FROM sys_audit.greatdb_login_info;
+-----------+---------------------+------------+------------+-----------+-----------+--------------+
| Thread_id | Login_time          | Login_host | Login_user | Priv_host | Priv_user | Failed_times |
+-----------+---------------------+------------+------------+-----------+-----------+--------------+
|         8 | 2023-12-03 18:56:20 | localhost  | root       | localhost | root      |            0 |
+-----------+---------------------+------------+------------+-----------+-----------+--------------+
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
