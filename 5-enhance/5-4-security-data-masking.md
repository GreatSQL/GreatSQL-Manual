# 数据脱敏插件

数据脱敏有助于防止非授权用户访问敏感数据，从而限制敏感数据的暴露。数据脱敏提供了一种在不应使用真实数据的情况下创建数据版本的方法，如演示、销售演示或软件测试。数据脱敏会改变数据值，同时使用相同的格式，无法进行逆向工程。数据脱敏可使数据对外部无用，从而降低泄露数据的风险。

## 数据脱敏技术

常见的数据脱敏技术有以下几种：

| 技术         | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| 自定义字符串 | 用特定字符串替换敏感数据，例如用 XXX-XXX-XXXX 替换电话号码   |
| 数据替换     | 将敏感数据替换为实际的替代值，例如将城市名称替换为字典中的另一个名称 |

## 安装和删除数据脱敏插件

### 安装插件

以下命令安装插件和功能：

```sql
greatsql> INSTALL PLUGIN data_masking SONAME 'data_masking.so';
Query OK, 0 rows affected (0.01 sec)

greatsql> SHOW PLUGINS;
......
| data_masking                     | ACTIVE   | DAEMON             | data_masking.so | GPL     |
+----------------------------------+----------+--------------------+-----------------+---------+
# 确认插件已经成功安装
```

### 卸载插件

使用 `UNINSTALL PLUGIN` 语句和 `DROP FUNCTION` 语句禁用和卸载插件，然后删除函数。

```sql
greatsql> UNINSTALL PLUGIN data_masking;
Query OK, 0 rows affected (0.01 sec)
```

## 数据脱敏插件功能

数据屏蔽提供了一组功能来隐藏修改内容的敏感数据，数据脱敏可以具有以下任一特征：

- 生成随机数据，例如电子邮件地址
- 通过转换数据以隐藏内容来消除数据的标识

数据屏蔽函数有以下几类：

- 一般用途
- 特殊目的
- 生成具有定义特征的随机数据
- 使用字典生成随机数据

### 一般用途

通用数据屏蔽函数如下：

| 功能                                               | 描述                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| mask_inner(string, margin1, margin2 [, character]) | 返回仅屏蔽字符串内部部分的结果。可以指定不同的掩码字符。     |
| mask_outer(string, margin1, margin2 [, character]) | 遮盖字符串的外部部分。内部部分没有被遮盖。可以指定不同的掩码字符。 |

`mask_inner()` 的示例：

```sql
greatsql> SELECT mask_inner('123456789', 1, 2);
+-------------------------------+
| mask_inner('123456789', 1, 2) |
+-------------------------------+
| 1XXXXXX89                     |
+-------------------------------+
1 row in set (0.00 sec)

# 从第1个字符开始打码，直到最后2个字符，用"*"代替（默认用'X'打码）
greatsql> SELECT mask_inner('GreatSQL is good', 1, 2, "*");
+-------------------------------------------+
| mask_inner('GreatSQL is good', 1, 2, "*") |
+-------------------------------------------+
| G*************od                          |
+-------------------------------------------+
1 row in set (0.00 sec)
```

`mask_outer()` 的示例：

```sql
greatsql> SELECT mask_outer('123456789', 2, 2); 
+-------------------------------+
| mask_outer('123456789', 2, 2) |
+-------------------------------+
| XX34567XX                     |
+-------------------------------+
1 row in set (0.00 sec)
```

### 特殊目的

特殊用途的数据脱敏函数如下：

| 范围                     | 描述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| mask_pan(string)         | 通过将字符串替换为“X”（最后四个字符除外）来屏蔽主帐号 (PAN)。 PAN 字符串的长度必须为 15 个字符或 16 个字符。 |
| mask_pan_relaxed(string) | 返回前 6 个数字和后 4 个数字。字符串的其余部分被“X”替换。    |
| mask_ssn(string)         | 返回一个仅最后四个数字可见的字符串。字符串的其余部分被“X”替换。 |

`mask_pan()` 的示例：

- gen_rand_pan()是GreatSQL中内置的一个函数,用于生成随机的PAN(Primary Account Number,主账号)。

```sql
greatsql> SELECT mask_pan (gen_rnd_pan());
+--------------------------+
| mask_pan (gen_rnd_pan()) |
+--------------------------+
| XXXXXXXXXXXX0472         |
+--------------------------+
1 row in set (0.01 sec)
```

`mask_pan_relaxed()` 的示例：

```sql
greatsql> SELECT mask_pan_relaxed(gen_rnd_pan());
+---------------------------------+
| mask_pan_relaxed(gen_rnd_pan()) |
+---------------------------------+
| 349133XXXXX1292                 |
+---------------------------------+
1 row in set (0.00 sec)
```

`mask_ssn()` 的示例：

```sql
greatsql> SELECT mask_ssn('555-55-5555');
+-------------------------+
| mask_ssn('555-55-5555') |
+-------------------------+
| XXX-XX-5555             |
+-------------------------+
1 row in set (0.00 sec)
```

### 为特定要求生成随机数据

这些函数生成满足特定要求的随机值。

| 范围                           | 描述                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| gen_range(lower, upper)        | 根据选定范围生成随机数并支持负数。                           |
| gen_rnd_email()                | 生成随机电子邮件地址。域名是 example.com。                   |
| gen_rnd_pan([size in integer]) | 生成随机主帐号。此功能只能用于测试目的。                     |
| gen_rnd_us_phone()             | 生成随机的电话号码。生成的号码添加 1 拨号代码，属于 555 区号。 |
| gen_rnd_ssn()                  | 生成 AAA-BBB-CCCC 格式的随机。此功能只能用于测试目的。       |

`gen_range(lower, upper)` 的示例：

```sql
greatsql> SELECT gen_range(10, 100);
+--------------------+
| gen_range(10, 100) |
+--------------------+
|                 31 |
+--------------------+
1 row in set (0.01 sec)
```

带有负数的 `gen_range(lower, upper)` 示例：

```sql
greatsql> SELECT gen_range(-100,-80);
+---------------------+
| gen_range(-100,-80) |
+---------------------+
|                 -97 |
+---------------------+
1 row in set (0.00 sec)
```

`gen_rnd_email()` 的示例：

```sql
greatsql> SELECT gen_rnd_email();
+----------------------+
| gen_rnd_email()      |
+----------------------+
| Yhz4Q1AA@example.com |
+----------------------+
1 row in set (0.00 sec)
```

`mask_pan(gen_rnd_pan())` 的示例：

```sql
greatsql> SELECT mask_pan(gen_rnd_pan());
+-------------------------+
| mask_pan(gen_rnd_pan()) |
+-------------------------+
| XXXXXXXXXXXX3883        |
+-------------------------+
1 row in set (0.00 sec)
```

`gen_rnd_us_phone()` 的示例：

```sql
greatsql> SELECT gen_rnd_us_phone();
+--------------------+
| gen_rnd_us_phone() |
+--------------------+
| 1-555-405-9656     |
+--------------------+
1 row in set (0.00 sec)
```

`gen_rnd_ssn()` 的示例：

```sql
greatsql> SELECT gen_rnd_ssn();
+---------------+
| gen_rnd_ssn() |
+---------------+
| 971-51-1394   |
+---------------+
1 row in set (0.00 sec)
```

### 使用字典生成随机术语

使用选定的词典生成随机术语。字典必须从具有以下特征的文件加载：

- 纯文本
- 每行一个术语
- 必须包含至少一项

将字典文件复制到 GreatSQL 可以访问的目录。 GreatSQL 使用 `gen_dictionary_load()` 的 `secure-file-priv` 选项启用。 `secure-file-priv` 选项定义 `gen_dictionary_load()` 加载字典文件的目录。

| 范围                                                         | 描述                                                         | 返回值               |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------- |
| gen_blacklist(str, dictionary_name, replacement_dictionary_name) | 用第二个字典中的术语替换术语。                               | 字典术语             |
| gen_dictionary(dictionary_name)                              | 随机化抽取字典术语。                                         | 所选词典中的随机术语 |
| gen_dictionary_drop(dictionary_name)                         | 从词典注册表中删除选定的字典。                               | 成功或失败           |
| gen_dictionary_load(dictionary path, dictionary name)        | 将文件加载到字典注册表中并配置字典名称。该名称可以与任何函数一起使用。如果编辑了词典，则必须删除然后重新加载词典才能查看更改。 | 成功或失败           |

`gen_dictionary_load(path, name)` 的示例：

先创建一个`cn_cities.txt`词典，并加载到数据库中

```sql
$ cat cn_cities.txt 
Beijing
Shanghai
Shenzhen
Guangzhou
Hangzhou
Wuhan

greatsql> SELECT gen_dictionary_load('/data/cn_cities.txt', 'testdict');
+--------------------------------------------------------+
| gen_dictionary_load('/data/cn_cities.txt', 'testdict') |
+--------------------------------------------------------+
| Dictionary load success                                |
+--------------------------------------------------------+
1 row in set (0.00 sec)
```

`gen_dictionary_drop()` 可以删除词典的示例：

```sql
greatsql> SELECT gen_dictionary_drop('testdict');
+---------------------------------+
| gen_dictionary_drop('testdict') |
+---------------------------------+
| Dictionary removed              |
+---------------------------------+
1 row in set (0.00 sec)
```

`gen_blacklist() `的示例：

创建另一个`fruit`词典并载入

```sql
$ cat fruit.txt          
apple
watermelon
pear
orange

greatsql> SELECT gen_dictionary_load('/data/fruit.txt', 'fruit');
+-------------------------------------------------+
| gen_dictionary_load('/data/fruit.txt', 'fruit') |
+-------------------------------------------------+
| Dictionary load success                         |
+-------------------------------------------------+
1 row in set (0.00 sec)
```

用第二个词典`testdict`中的术语替换`fruit`词典中术语

```sql
greatsql> SELECT gen_blacklist('apple','fruit','testdict');
+-------------------------------------------+
| gen_blacklist('apple','fruit','testdict') |
+-------------------------------------------+
| Guangzhou                                 |
+-------------------------------------------+
1 row in set (0.00 sec)

# 如果这个str在第一个词典中没有，则会直接输出这个srt
greatsql> SELECT gen_blacklist('apples','fruit','testdict');
+--------------------------------------------+
| gen_blacklist('apples','fruit','testdict') |
+--------------------------------------------+
| apples                                     |
+--------------------------------------------+
1 row in set (0.00 sec)
```

`gen_dictionary() `的示例：

```sql
greatsql> SELECT gen_dictionary('testdict') AS City;
+---------+
| City    |
+---------+
| Beijing |
+---------+
1 row in set (0.00 sec)

# 还可以配合 ELT() 函数从多个字典中随机抽取
greatsql> SELECT gen_dictionary(ELT(gen_range(1,3), 'fruit', 'testdict'));
+----------------------------------------------------------+
| gen_dictionary(ELT(gen_range(1,3), 'fruit', 'testdict')) |
+----------------------------------------------------------+
| Shanghai                                                 |
+----------------------------------------------------------+
1 row in set (0.00 sec)

greatsql> SELECT gen_dictionary(ELT(gen_range(1,3), 'fruit', 'testdict'));
+----------------------------------------------------------+
| gen_dictionary(ELT(gen_range(1,3), 'fruit', 'testdict')) |
+----------------------------------------------------------+
| orange                                                   |
+----------------------------------------------------------+
1 row in set (0.00 sec)
```

## 相关阅读

- [MySQL企业版之数据脱敏功能](https://mp.weixin.qq.com/s/74pUYuPRUp-BkvjI0ysoCg)

**问题反馈**
---

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)