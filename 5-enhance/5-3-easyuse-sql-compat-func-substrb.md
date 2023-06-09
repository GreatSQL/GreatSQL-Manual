# SQL兼容性 - SUBSTRB()函数
---
[toc]

## 1. 语法

```sql
SUBSTRB(string, pos [, substring_length] )
```

## 2. 定义和用法
函数 `SUBSTRB()` 的作用是返回字符型参数 `string` 的一部分。该部分是由 `string` 的第 `pos` 个byte开始，取 `substring_length`个byte长度。

- 若pos为0，视为1。表示string的最开始的byte开始（第1个byte）。
- 若pos为正数，表示由string的第pos个byte开始。
- 若pos为负数，表示由string末尾反向数回第pos个byte开始。
- 若substring_length未指定，表示取到string的最后一个byte为止。
- 若substring_length小于1，则返回NULL。
- 若传回的内容只包含multi-byte字符（多字节字符，例如中文字符）的一部分，该部分会以空格替代。

## 3. 示例

```sql
greatsql> create table ssbtable ( c1 char(20) );
greatsql> insert into ssbtable values ('测试1字1234');

greatsql> select hex(substrb(c1, 1, 6)), substrb(c1, 1, 6), c1 from ssbtable;
+------------------------+-------------------+----------------+
| hex(substrb(c1, 1, 6)) | substrb(c1, 1, 6) | c1             |
+------------------------+-------------------+----------------+
| E6B58BE8AF95           | 测试              | 测试1字1234    |
+------------------------+-------------------+----------------+

greatsql> select hex(substrb(c1, 2, 2)), substrb(c1, 2, 2), c1 from ssbtable;
+------------------------+-------------------+----------------+
| hex(substrb(c1, 2, 2)) | substrb(c1, 2, 2) | c1             |
+------------------------+-------------------+----------------+
| 2020                   |                   | 测试1字1234    |
+------------------------+-------------------+----------------+

greatsql> select hex(substrb(c1, 2, 6)), substrb(c1, 2, 6), c1 from ssbtable;
+------------------------+-------------------+----------------+
| hex(substrb(c1, 2, 6)) | substrb(c1, 2, 6) | c1             |
+------------------------+-------------------+----------------+
| 2020E8AF9531           |   试1             | 测试1字1234    |
+------------------------+-------------------+----------------+

greatsql> select hex(substrb(c1, 3, 6)), substrb(c1, 3, 6), c1 from ssbtable;
+------------------------+-------------------+----------------+
| hex(substrb(c1, 3, 6)) | substrb(c1, 3, 6) | c1             |
+------------------------+-------------------+----------------+
| 20E8AF953120           |  试1              | 测试1字1234    |
+------------------------+-------------------+----------------+
```

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
