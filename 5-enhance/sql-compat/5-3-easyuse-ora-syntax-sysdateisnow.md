# Oracle兼容-语法-SYSDATE_IS_NOW模式
---


## 1. 语法

```sql
SET [GLOBAL|SESSION] sql_mode = SYSDATE_IS_NOW;
```

## 2. 定义和用法

在启用 `sql_mode = SYSDATE_IS_NOW` 模式后，函数 `SYSDATE()` 与 `NOW()` 将表现一致。 

除了修改 `sql_mode`，还可以增加启动参数 `--sysdate_is_now`，这么做实现的功能是一致的，但启动参数不能动态修改，而 `sql_mode` 则可以在线动态修改。
 
*注意:*
 
**在 oracle_mode 的情况下，无论sql_mode 中是否含有 SYSDATE_IS_NOW**   
**SYSDATE 的行为都等价与 now(6)**

## 3. 示例

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



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
