# Oracle兼容-函数-CHR()函数
---


## 1. 语法

```sql
CHR(n [ USING characterset name ])
```

## 2. 定义和用法

参数：
- `n`，整数，例如：97。
  - 1. 参数 n 的值要求为非负数，如果是负数则会统一转换成255。
  - 2. 参数 n 也可以是整数或浮点数，浮点数会自动被转换为（四舍五入后的）整数，例如：97.3会被转换成97 ，而97.6会被转换成98。
  - 3. 参数 n 还可以是字符串，这个字符串必须能正确转换出非负整数。
- `characterset`，有效字符集名称，例如：utf8mb4。

将 **n** 视为一个整数，返回 **ASCII表** 中对应值的字符。

如果参数 `characterset` 是单字节字符集，当 `n > 256` 时，则返回 `n mod 256` 对应的二进制等效值。

如果参数 `characterset` 是多字节字符集，`n` 必须解析为一个完整的代码点。

如果 `n` 为NULL，将返回NULL。


## 3. 示例
```sql
greatsql> SELECT CHR(90+256 using utf8mb4);
+-------------------------------+
| chr(90+256 using utf8mb4) |
+-------------------------------+
| Z                            |
+-------------------------------+
1 row in set (0.00 sec)

greatsql> SELECT CHR(NULL using utf8mb4);
+-------------------------+
| chr(NULL using utf8mb4) |
+-------------------------+
| NULL                    |
+-------------------------+
1 row in set (0.00 sec)

greatsql> SELECT CHR(90 using utf8mb4);
+-----------------------+
| chr(90 using utf8mb4) |
+-----------------------+
| Z                     |
+-----------------------+
1 row in set (0.01 sec)

```





**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
