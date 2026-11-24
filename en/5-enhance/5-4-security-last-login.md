# Last Login Information
---

In GreatSQL, users can view the information of the last successful login and all failed login attempts since the last successful login.

By reviewing their own login information, users can determine whether their accounts have been logged in by others or targeted by password cracking attempts.

This feature is based on the auditing plugin, so the [auditing plugin](./5-4-security-audit.md) must be enabled first. In addition, the parameters `audit_log_enabled = 1` and `audit_log_to_table = 1` must be set to enable auditing and the audit log to table feature.

## Recorded Information

The logged-in user can query all login information recorded on the current login node since the last successful login of the current user. If the user has never successfully logged in on the current node, all failed login attempts of the current user on the current node are returned.

The login information includes: *connection id, login time, login host, login user name, login IP, login status, server id*, etc.

## Usage

After connecting to the database, execute the `SELECT audit_login_messages(N)` function to query the last login information. This function requires the parameter *N*, which sets the maximum number of login records to return, with a valid range of *[1 - 10000]*. If the actual number of rows is greater than the value specified by the parameter *N*, records beyond the limit are not displayed.

```bash
# Make sure to add the --binary-as-hex=0 parameter, otherwise the query results are displayed in hexadecimal
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

In the query results, if the `status` column is not 0, it indicates a failed login attempt. Administrators should pay attention to such records and confirm whether the account is exposed to security risks such as DDoS attacks.

For example, in the query results above, the first 3 records are all failed login attempts, and only the last one is successful.

::: tip Tip
When connecting using the mysql client, make sure to add the --binary-as-hex=0 parameter, otherwise the query results are displayed in hexadecimal. For example:


```sql
greatsql> SELECT audit_login_messages(10);
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| audit_login_messages(10)                                                                                                                                                                                                                                                                                                               |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 0x7C206E616D65207C2074696D65207C20636F6E6E656374696F6E5F6964207C20737461747573207C2075736572207C20686F7374207C206970207C207365727665725F6964207C0A7C20436F6E6E656374207C20323032342D30392D32332031363A35313A3537207C2031333338207C2030207C20726F6F74207C206C6F63616C686F7374207C20207C2033333036207C0A7C20546F74616C203120726F7773207C |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```
:::


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
