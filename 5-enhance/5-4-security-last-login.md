# 最后登录信息
---

在 GreatSQL 中，用户可查看上一次成功登录以及上一次成功登录后所有的失败登录信息。

用户通过查看自身的登录信息，可判定是否有被其他人员登录或者被尝试破解登录的情况。

本功能基于审计插件，所以需要先开启[审计插件](./5-4-security-audit.md)才能使用，并且必须确保设置参数 `audit_log_enabled = 1`，和`audit_log_to_table = 1`，启用审计和审计日志入表特性。

## 记录的信息

登录用户可查询在当前登录节点上，当前用户上一次成功登录以来所有登录信息。如果没有在当前节点成功登录过，则返回当前节点当前用户所有的失败登录信息。

登录信息包括：*连接id、登录时间、登录host、登录用户名、登录ip、登录状态、server id* 等信息。

## 使用方法

连接到数据库上后，执行 `SELECT audit_login_messages(N)` 函数可查询最后登录信息。该函数需指定参数 *N*，设置返回登录记录的最大行数，取值范围为 *[1 - 10000]*，若实际行数大于参数 *N* 指定的数值，则不显示超过部分的记录。

```shell
# 务必加上 --binary-as-hex=0 参数，否则查询到的结果以十六进制显式
$ mysql -hlocalhost -uroot -p --binary-as-hex=0
...
greatsql> SELECT audit_login_messages(10);
| | name | time | connection_id | status | user | host | ip | server_id |
| Connect | 2024-07-17 14:41:13 | 136 | 1045 | root | localhost |  | 1 |
| Connect | 2024-07-17 14:41:12 | 134 | 1045 | root | localhost |  | 1 |
| Connect | 2024-07-17 14:41:12 | 132 | 1045 | root | localhost |  | 1 |
| Connect | 2024-07-17 14:09:01 | 59 | 0 | root | localhost |  | 1 |
| Total 4 rows | |
```

查询结果中，`status` 列如果不为0，则表示这是一次登录失败的记录，管理员应该加以重视，确认该账户是否存在被 DDoS 攻击等安全风险。

例如上面的查询结果，前面 3 次均为失败记录，只有最后一次才是成功的。

> 使用 mysql 客户端建立连接时，务必加上 --binary-as-hex=0 参数，否则查询到的结果以十六进制显示


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
