# Oracle Compatibility - Syntax - SYSDATE_IS_NOW Mode
---

## 1. Syntax

```sql
SET [GLOBAL|SESSION] sql_mode = SYSDATE_IS_NOW;
```

## 2. Definition and Usage

After enabling the `sql_mode = SYSDATE_IS_NOW` mode, the functions `SYSDATE()` and `NOW()` behave identically.

In addition to modifying `sql_mode`, you can also add the startup parameter `--sysdate_is_now`. The function achieved is the same, but the startup parameter cannot be modified dynamically, while `sql_mode` can be modified dynamically online.

*Note:*

**In `oracle_mode`, regardless of whether `sql_mode` contains SYSDATE_IS_NOW**
**the behavior of SYSDATE is equivalent to now(6)**

## 3. Examples

```sql
greatsql> SET sql_mode = '';

greatsql> SELECT NOW(), SYSDATE();
+---------------------+---------------------+
| NOW()               | SYSDATE()           |
+---------------------+---------------------+
| 2023-11-14 16:26:42 | 2023-11-14 16:26:42 |
+---------------------+---------------------+

greatsql> SELECT NOW(), SLEEP(1) , SYSDATE();
+---------------------+----------+---------------------+
| NOW()               | SLEEP(1) | SYSDATE()           |
+---------------------+----------+---------------------+
| 2023-11-14 16:26:27 |        0 | 2023-11-14 16:26:28 |
+---------------------+----------+---------------------+
1 row in set (1.00 sec)

greatsql> SET sql_mode = SYSDATE_IS_NOW;

greatsql> SELECT NOW(), SLEEP(1) , SYSDATE();
+---------------------+----------+---------------------+
| NOW()               | SLEEP(1) | SYSDATE()           |
+---------------------+----------+---------------------+
| 2023-11-14 16:27:27 |        0 | 2023-11-14 16:27:27 |
+---------------------+----------+---------------------+
1 row in set (1.00 sec)
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
