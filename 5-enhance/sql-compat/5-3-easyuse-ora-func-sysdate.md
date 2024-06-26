# Oracle兼容-函数-SYSDATE()函数
---

## 1. 语法
```sql
SYSDATE
SYSDATE()
```
调用时，可以不带上表示函数的括号。

## 2. 定义和用法

`SYSDATE` 作为系统关键字实现，在 ORACLE mode 中，等价 `NOW(6)`，在 DEFAULT mode 下就是 `SYSDATE()`。

## 3. 示例

```sql
-- 先在DEFAULT mode下执行
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT SYSDATE, SYSDATE() FROM DUAL;
+---------------------+---------------------+
| SYSDATE             | SYSDATE()           |
+---------------------+---------------------+
| 2023-05-11 14:43:52 | 2023-05-11 14:43:52 |
+---------------------+---------------------+

-- 切到ORACLE mode下执行
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT SYSDATE, SYSDATE() FROM DUAL;
+----------------------------+----------------------------+
| SYSDATE                    | SYSDATE()                  |
+----------------------------+----------------------------+
| 2023-05-11 14:43:52.865664 | 2023-05-11 14:43:52.865664 |
+----------------------------+----------------------------+
```
可以看到在不同 `sql_mode` 下输出结果不同，在Oracle mode下输出的精度更高。



**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
