# Oracle 兼容-函数-LENGTH()函数
---

## 1. 语法
```
LENGTH(data)
```

## 2. 定义和用法
在 Oracle 中，`LENGTH()` 函数返回字符串的长度，而在 GreatSQL 中 `LENGTH()` 函数返回字符串的字节数。当参数 data 中字符串的长度为 0 时，GreatSQL 返回值为 0，而 Oracle 返回值为 NULL。

针对上述差异，GreatSQL 对 `LENGTH()` 函数做了扩展，以支持类似 Oracle 中的行为模式。

## 3. Oracle 兼容说明

因为 GreatSQL 已原生支持 `LENGTH()` 函数，因此想要在 GreatSQL 中使用扩展后的 `LENGTH()` 函数时，需要先执行 `SET sql_mode = ORACLE;` 激活 Oracle 兼容模式。

对于个别转义字符如 ‘\n’，因为 GreatSQL 会将其自动转为特殊字符，因此最后结果是算作 1 个字符而不是 2 个字符。

对于表达式比如 `LENGTH(''+1)` ，目前 ORACLE mode 下支持数字转字符串，最后结果变成数值字符串的长度，这个动作与 Oracle 的不一致。

## 4. 示例

```
-- 在DEFAULT mode中，在utf8mb4字符集模式下，结果返回17
-- 示例中的每个中文字符占位3个字节，每个ASCII字符占位1个字节
greatsql> SELECT LENGTH( _UTF8MB4 'GreatSQL数据库');
+--------------------------------------+
| LENGTH( _UTF8MB4 'GreatSQL数据库')    |
+--------------------------------------+
|                                   17 |
+--------------------------------------+

-- 先切换到ORACLE mode
greatsql> SET sql_mode = ORACLE;

-- 示例中的每个中文字符和ASCII字符都算作一个字符
greatsql> SELECT LENGTH( _UTF8MB4 'GreatSQL数据库');
+--------------------------------------+
| LENGTH( _UTF8MB4 'GreatSQL数据库')    |
+--------------------------------------+
|                                   11 |
+--------------------------------------+
```


**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
