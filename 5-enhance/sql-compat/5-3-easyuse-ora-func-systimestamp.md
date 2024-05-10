# Oracle兼容-函数-SYSTIMESTAMP()函数
---


## 1. 语法

```sql
SYSTIMESTAMP
SYSTIMESTAMP()
```

## 2. 定义和用法

`SYSTIMESTAMP()` 函数的作用是返回当前的日期和时间，类似于原生的函数`NOW()`。当未显式指定微秒位数时，时间的微秒位数默认值为6。


## 3. 示例

```sql
-- 默认微秒位数为6
greatsql> SELECT SYSTIMESTAMP FROM DUAL;
greatsql> SELECT SYSTIMESTAMP, SYSTIMESTAMP() FROM DUAL;
+----------------------------+----------------------------+
| SYSTIMESTAMP               | SYSTIMESTAMP()             |
+----------------------------+----------------------------+
| 2023-11-02 17:43:25.990131 | 2023-11-02 17:43:25.990131 |
+----------------------------+----------------------------+

-- 自行指定微秒位数
greatsql> SELECT SYSTIMESTAMP(0), SYSTIMESTAMP(3) FROM DUAL;
+---------------------+-------------------------+
| SYSTIMESTAMP(0)     | SYSTIMESTAMP(3)         |
+---------------------+-------------------------+
| 2023-11-02 17:43:45 | 2023-11-02 17:43:45.189 |
+---------------------+-------------------------+

-- 指定微秒位数超出范围会报错
greatsql> SELECT SYSTIMESTAMP(10) FROM DUAL;
ERROR 1426 (42000): Too-big precision 10 specified for 'now'. Maximum is 6.

greatsql> SELECT SYSTIMESTAMP(-1) FROM DUAL;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '-1) FROM DUAL' at line 1
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
