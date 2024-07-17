# 数据脱敏

数据脱敏有助于防止非授权用户访问敏感数据，从而限制敏感数据的暴露。数据脱敏提供了一种在不应使用真实数据的情况下创建数据版本的方法，如演示、销售演示或软件测试。数据脱敏会改变数据值，同时使用相同的格式，无法进行逆向工程。数据脱敏可使数据对外部无用，从而降低泄露数据的风险。

GreatSQL 中支持两种数据脱敏工作方式

- 基于函数的数据脱敏；
- 基于策略的数据脱敏。

## 基于函数的数据脱敏

常见的数据脱敏方式有以下两种：

| 技术         | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| 自定义字符串 | 用特定字符串替换敏感数据，例如用 XXX-XXX-XXXX 替换电话号码   |
| 数据替换     | 将敏感数据替换为实际的替代值，例如将城市名称替换为字典中的另一个名称 |

### 启用与关闭

#### 启用

执行以下命令安装 `data_masking` 插件以启用数据脱敏功能：

```sql
greatsql> INSTALL PLUGIN data_masking SONAME 'data_masking.so';
Query OK, 0 rows affected (0.01 sec)

greatsql> SHOW PLUGINS;
......
| data_masking                     | ACTIVE   | DAEMON             | data_masking.so | GPL     |
+----------------------------------+----------+--------------------+-----------------+---------+
```
看到 `data_masking` 插件的状态是 *ACTIVE*，表示该插件已经成功安装。

#### 关闭

使用 `UNINSTALL PLUGIN` 语句和 `DROP FUNCTION` 语句禁用和卸载插件，然后删除函数，就可以禁用数据脱敏功能。

```sql
greatsql> UNINSTALL PLUGIN data_masking;
Query OK, 0 rows affected (0.01 sec)
```

### 数据脱敏使用

数据屏蔽提供了一组功能来隐藏修改内容的敏感数据，数据脱敏可以具有以下任一特征：

- 生成随机数据，例如电子邮件地址
- 通过转换数据以隐藏内容来消除数据的标识

数据屏蔽函数有以下几类：

- 常见场景
- 特殊场景
- 生成具有定义特征的随机数据
- 使用字典生成随机数据

#### 常见场景

常用的数据脱敏函数如下：

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

#### 特殊场景

特殊场景的数据脱敏函数如下：

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

#### 为特定要求生成随机数据

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

#### 使用字典生成随机术语

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

## 基于策略的数据脱敏

### 准备工作

基于策略的数据脱敏需要在全局系统变量 `enable_data_masking` 为 TRUE（默认 FALSE）时才能生效。

开始使用前，需要先导入 `sys_masking.sql` SQL 脚本文件以完成相关配置
```sql
greatsql> SOURCE %basedir%/share/sys_masking.sql;
```
其中，"%basedir%" 表示 GreatSQL 的安装目录。

### 配置脱敏策略

存储过程名称  | 描述 | 
---- | ---- |
sys_masking.create_label | 创建脱敏字段的标签 
sys_masking.create_policy | 创建脱敏的策略 
sys_masking.policy_add_label | 添加脱敏策略的对应标签的关系
sys_masking.policy_add_user | 添加排除策略的特殊账户
sys_masking.policy_enable | 策略使能 
sys_masking.drop_policy| 删除策略
sys_masking.policy_delete_label | 删除策略与标签的关系
sys_masking.policy_delete_user |  删除策略与账户的关系
sys_masking.drop_label_by_id|  根据标签id删除脱敏标签
sys_masking.drop_label_by_name | 根据标签名称删除脱敏标签


### 使用参考

- 1. 将想要脱敏的数据对象设置标签

```sql
greatsql> CALL sys_masking.create_label('greatsql', 't1', 'c3', 'mask_greatsql_t1_c3');
```

调用 `sys_masking.create_label()` 函数为 `greatsql.t1.c3` 这个列（`greatsql.t1` 表中的 `c3` 列）加上 "mask_greatsql_t1_c3" 标签。

- 2. 创建一个脱敏策略

```sql
greatsql> CALL sys_masking.create_policy('policy1', 'maskall', '*' );
```

调用 `sys_masking.create_policy()` 函数新建一个名为 "policy1" 的策略, 该策略的行为是调用 `maskall()` 函数将所有数据替换成字符 "*"。

- 3. 对脱敏策略添加指定标签，使之生效

```sql
greatsql> CALL sys_masking.policy_add_label('policy1', 'mask_greatsql_t1_c3');
```

调用 `sys_masking.policy_add_label()` 函数对策略 "policy1" 添加指定标签 "mask_greatsql_t1_c3"，使得该标签下的所有数据对象在查询返回结果时都会被脱敏，例如：

```sql
greatsql> SELECT c1, c2, c3 FROM greatsql.t1 LIMIT 1;
+----+--------+-------------------+--------------------+
| id | c1     | c2                | c3                 |
+----+--------+-------------------+--------------------+
|  1 | 280638 | 991512.2317965257 | ****************** |
+----+--------+-------------------+--------------------+
```

> 此时需要改成用普通用户连入查询，该脱敏规则默认对具有管理权限的账户不生效

- 4. 单独将授权账户 "user2@%" 设置为对脱敏策略 "policy1" 不生效，也就是对 "user2@%" 账户的查询请求不启用脱敏策略，例如：

```sql
greatsql> CALL sys_masking.policy_add_user('policy1', 'user2@%');
```

```sql
-- 切换到 user2@% 账户登入
-- 当前登入账户是 user2@127.0.0.1，也就是从 127.0.0.1 登入的 user2 账户
greatsql> SELECT USER();
+-----------------+
| user()          |
+-----------------+
| user2@127.0.0.1 |
+-----------------+

-- 相应的授权账户是 user2@%，允许 user2 从任何地址以 TCP/IP 方式登入
greatsql> SELECT CURRENT_USER();
+----------------+
| current_user() |
+----------------+
| user2@%        |
+----------------+

-- 再执行查询，确认脱敏策略不会生效
greatsql> SELECT * FROM t1 LIMIT 1;
+----+--------+-------------------+--------------------+
| id | c1     | c2                | c3                 |
+----+--------+-------------------+--------------------+
|  1 | 280638 | 991512.2317965257 | 0.9644671762031197 |
+----+--------+-------------------+--------------------+
```

### 约束限制

- 1. 仅支持对 `SELECT` 查询的字段脱敏，如果查询该字段时使用了函数或额外运算，则脱敏策略不生效。

```sql
-- 当 c3 列上使用了函数时，不支持脱敏
greatsql> SELECT id, c3, LEFT(c3, 5) FROM t1 LIMIT 1;
+----+--------------------+-------------+
| id | c3                 | left(c3, 5) |
+----+--------------------+-------------+
|  1 | ****************** | 0.964       |
+----+--------------------+-------------+

-- 当 c3 列上有额外运算时，不支持脱敏
greatsql> SELECT id, c3, c3 + 1 FROM t1 LIMIT 1;
+----+--------------------+--------------------+
| id | c3                 | c3 + 1             |
+----+--------------------+--------------------+
|  1 | ****************** | 1.9644671762031196 |
+----+--------------------+--------------------+
``` 

- 2. 被脱敏的数据列返回结果数据类型将总是被转换成字符串类型。

- 3. 仅支持对基本表（不包含视图）中的列，只支持在最外层查询中对结果脱敏，不支持对内层子查询中的列脱敏。

```sql
greatsql> SELECT * FROM t1 WHERE id <= 3;
+----+--------+-------------------+---------------------+
| id | c1     | c2                | c3                  |
+----+--------+-------------------+---------------------+
|  1 | 280638 | 991512.2317965257 | ******************  |
|  2 |  19646 | 195692.9542456688 | ******************* |
+----+--------+-------------------+---------------------+

greatsql> SELECT id, c3 FROM (SELECT * FROM t1) t WHERE id <= 3;
+----+---------------------+
| id | c3                  |
+----+---------------------+
|  1 | 0.9644671762031197  |
|  2 | 0.45393493906961285 |
+----+---------------------+
```

- 4. 对于 `INSERT ... SELECT` 或 `REPLACE INTO ... SELECT` 操作，如果源表中包含脱敏列，则这些操作中插入的数据为脱敏后的值，且不可还原。

- 5. 配置脱敏策略的员账户需要有对 `sys_masking` 库拥有 `EXECUTE, INSERT, DELETE, UPDATE, RELOAD` 等权限（最好只向管理员开放对该库的管理权限）。

- 6. 默认地，脱敏策略对所有账户生效，除了 `sys_masking.maksing_policy_users` 中配置的账户以及拥有超级权限的账户之外。

执行下面的 SQL 命令可查看所有被排除脱敏策略的账户列表：

```sql
greatsql> SELECT CONCAT(user, '@', host) AS masking_skip_users FROM mysql.user WHERE super_priv = 'y'
  UNION ALL 
  SELECT user_name AS masking_skip_users FROM sys_masking.masking_policy_users;
+-------------------------+
| masking_skip_users      |
+-------------------------+
| mysql.session@localhost |
| root@localhost          |
| user2@%                 |
+-------------------------+
```

- 7. 如果查询中的 `GROUP BY` 子句包含脱敏字段，则会有 Warning 提示。

```sql
greatsql> SELECT c3, count(*) AS c FROM t1 WHERE id <= 3 GROUP BY c3 ORDER BY c;
+---------------------+---+
| c3                  | c |
+---------------------+---+
| ******************  | 1 |
| ******************* | 1 |
+---------------------+---+
2 rows in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------------------------------------+
| Level   | Code | Message                                     |
+---------+------+---------------------------------------------+
| Warning | 1052 | Column 'c3' in group statement is ambiguous |
+---------+------+---------------------------------------------+
```

- 8. 如果查询中包含 `UNION / UNION ALL`，则查询结果中脱敏后的值 "***" 将会按照脱敏后的结果去重，而不是按原值去重；后续的 `GROUP BY / ORDER BY` 也将按照脱敏后的结果进行分组及排序。

```sql
greatsql> SELECT id, c3 FROM t1 WHERE id <= 4 UNION SELECT id, c3 FROM t2 WHERE id <= 4;
+----+---------------------+
| id | c3                  |
+----+---------------------+
|  1 | ******************  |
|  2 | ******************* |
|  4 | ******************* |
|  1 | 0.9644671762031197  |
|  2 | 0.45393493906961285 |
|  4 | 0.37627319747234994 |
+----+---------------------+
6 rows in set (0.00 sec)

-- 只查询 c3 列时，会按照脱敏后的结果去重
greatsql> SELECT c3 FROM t1 WHERE id <= 4 UNION SELECT c3 FROM t2 WHERE id <= 4;
+---------------------+
| c3                  |
+---------------------+
| ******************  |
| ******************* |
| 0.9644671762031197  |
| 0.45393493906961285 |
| 0.37627319747234994 |
+---------------------+
5 rows in set (0.00 sec)

-- 按照脱敏后的结果排序
greatsql> SELECT c3 FROM t1 WHERE id <= 4 UNION SELECT c3 FROM t2 WHERE id <= 4 ORDER BY c3 DESC;
+---------------------+
| c3                  |
+---------------------+
| 0.9644671762031197  |
| 0.45393493906961285 |
| 0.37627319747234994 |
| ******************* |
| ******************  |
+---------------------+
```   

### 脱敏策略配置接口说明
#### 脱敏策略控制存储过程

- 1. 创建标签

```sql
sys_masking.create_label('db_name', 'table_name', 'field_name', 'label_name'); 
```

功能：创建新标签，并添加需要脱敏的字段，标签中配置的字段名不区分大小写，允许多个字段使用相同的标签名，但不允许同一个列重复加到某个标签里。

参数：
- db_name，数据库名，不区分大小写，不能为空。
- table_name，表名，不区分大小写，不能为空。
- field_name，字段名，不区分大小写，不能为空。
- label_name，标签名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- 上述所有参数名，都必须加上引号，否则会报错。

如下例所示，对数据对象 `greatsql.t1.c1`（库.表.列）创建标签 "label1"：

```sql
greatsql> CALL sys_masking.create_label('greatsql', 't1', 'c3', 'label1') ;
```

- 2. 创建脱敏策略 

```sql
sys_masking.create_policy('policy_name', 'mask_function', 'args')
```

功能：添加需要脱敏策略，指定使用哪个脱敏函数，以及相应的参数。参数如果配置错误，策略则不生效，日志中会记录相应报错信息。

添加完脱敏策略后，再将策略应用到指定标签上，使其生效。默认地，脱敏策略对所有账户生效，除了 `sys_masking.maksing_policy_users` 中配置的账户以及拥有超级权限的账户之外。

参数：
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- mask_function，脱敏函数名，可选值为 `[maskall | mask_inside]`。
- args，剩余参数将作为 "mask_function" 函数的参数，如果有多个参数可以用逗号 "," 进行分割，如果置空或写成 NULL（注意：NULL 和 'NULL' 是不同的） 或 ''，将使用默认参数。
- 上述所有参数名，都必须加上引号，否则会报错。

如下例所示，创建名为 "policy1" 的策略，该策略的行为是调用 `mask_inside()` 函数将查询结果中的 0-5 个字符内容替换成 "#"：

```sql
greatsql> CALL sys_masking.create_policy('policy1', 'mask_inside', '0,5,#') ;
```

或者如下例所示，创建名为 "policy1" 的策略，该策略的行为是调用 `maskall()` 函数将所有数据替换成字符 "*"：

```sql
greatsql> CALL sys_masking.create_policy('policy1', 'maskall', '*') ;
```

- 3. 将脱敏策略应用于指定标签
```sql
sys_masking.policy_add_label('policy_name', 'label_name')
```

功能：将脱敏策略应用于指定标签，并使其立即生效。一个标签只能被应用一个策略，否则会报错，提示 `ERROR 1644 (45000): label has already bind policy`。

参数： 
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- label_name，标签名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- 上述所有参数名，都必须加上引号，否则会报错。

如下例所示，将策略 "policy1" 应用于标签 "label1"：

```
greatsql> CALL sys_masking.policy_add_label('policy1', 'label1') 
```

- 4. 添加排除策略的特殊账户（可选操作，非必须）

```sql
sys_masking.policy_add_user('policy_name', 'user_name')
```

功能: 添加排除策略的特殊账户，"配置了排除策略的账户" 和 "拥有超级权限的账户"，脱敏策略对这些账户都不会生效。
       
参数:
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- user_name，授权账户名，不区分大小写，不能为空，格式为 "user@host"，要对应 `mysql.user` 中的授权账户名，否则可能不能正确生效。
- 上述所有参数名，都必须加上引号，否则会报错。

如下例所示，将策略 "policy1" 对账户 "user2@%" 添加排除规则。

```sql
greatsql> CALL sys_masking.policy_add_user('policy1', 'user2@%');
```

- 5. 启用/禁用脱敏策略

```sql
sys_masking.policy_enable('policy_name', policy_enabled)
```

功能：将制定策略设置为启用/禁用状态。策略创建完成后默认立即生效，该函数可以满足在不删除策略的情况下使其失效，方便后续重用。

参数:
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度；策略名参数必须加上引号，否则会报错。
- policy_enabled，策略启用与否开关，默认为 "1"，表示启用策略；如果设置为 "0"，则表示禁用策略。

如下例所示，修改策略 "policy1" 状态为启用/禁用：

```sql
-- 启用策略
greatsql> CALL sys_masking.policy_enable('policy1', 1);

-- 禁用策略
greatsql> CALL sys_masking.policy_enable('policy1', 0);
```

- 6. 删除策略

```sql
sys_masking.drop_policy('policy_name')
```

功能：删除策略，并会删除与该策略相对应的排除用户规则、标签应用等关联关系。注意：这个关联删除并不会做二次提醒，而是直接删除。

参数：  
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度；策略名参数必须加上引号，否则会报错。

如下例所示，删除策略 "policy1"：

```sql
greatsql> CALL sys_masking.drop_policy('policy1');
```

- 7. 删除策略与标签的对应关系

```sql
sys_masking.policy_delete_label('policy_name', 'label_name')
```

功能：删除策略与标签的对应关系，使该策略不再作用与该标签。

参数：
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- label_name，标签名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- 上述所有参数名，都必须加上引号，否则会报错。

如下例所示，删除策略 "policy1" 与标签 "label1" 的关系：

```sql
CALL sys_masking.policy_delete_label('policy1', 'label1');
```

- 8. 删除策略排除的特殊用户
sys_masking.policy_delete_user('policy_name', 'user_name')

功能：删除策略与账号的排除关系。

参数：
- policy_name，策略名，不区分大小写，不能为空，且必须大于等于3个字符长度。
- user_name，授权账户名，不区分大小写，不能为空，格式为 "user@host"，要对应 `mysql.user` 中的授权账户名，否则可能不能正确生效。
- 上述所有参数名，都必须加上引号，否则会报错。

如下例所示，删除策略 "policy1" 和账户 "user2@%" 的排除关系。

```sql
-- 删除策略排除的特殊用户
CALL sys_masking.policy_delete_user('policy1', 'user2@%');
```

- 9. 指定名称方式删除标签

```sql
sys_masking.drop_label_by_name(label)
```

功能：根据标签名称删除脱敏标签

参数： 
- label_name，标签名，不区分大小写，不能为空，且必须大于等于3个字符长度。

如下例所示，删除标签 "label1"：

```sql
greatsql> CALL sys_masking.drop_label_by_name('label1');
```

- 10. 指定 ID 方式删除标签

```sql
sys_masking.drop_label_by_id(label_id)
```

功能：根据指定 ID 删除标签。 

参数：
- label_id，标签名对应的 ID，不能为空，必须是整型数值。
    
如下例所示，删除 id = 1 的标签。
```
-- 用具有管理权限的账户查询标签，可获得相应的 id 值
greatsql> SELECT label_id, label_name FROM sys_masking.masking_label WHERE label_name = 'label1';
+----------+---------------+
| label_id | label_name    |
+----------+---------------+
|        2 | label1        |
+----------+---------------+

-- 根据 id 值删除标签
greatsql> CALL sys_masking.drop_label_by_id(2);
```

#### 脱敏函数

- 1. `maskall(str, [, mask_char] )`

该函数的作用是对全部字符串都进行脱敏，替换成指定字符。

参数
- str，传入的数据对象。
- mask_char，用于替换的字符，默认为 "x"。如果参数是字符串，则只取第一个字符；如果参数是 "\0"，则解析成默认的字符 "x"。 

函数 `maskall()` 工作方式如下面几个例子所示：

```sql
greatsql> SELECT maskall('GreatSQL数据库') AS c1, 
                 maskall('GreatSQL数据库', 'a') AS c2,
		 maskall('GreatSQL数据库', '赞喔') AS c3,
		 maskall('GreatSQL数据库', '\0') AS c4 FROM DUAL;
+-------------+-------------+-----------------------------------+-------------+
| c1          | c2          | c3                                | c4          |
+-------------+-------------+-----------------------------------+-------------+
| xxxxxxxxxxx | aaaaaaaaaaa | 赞赞赞赞赞赞赞赞赞赞赞            | xxxxxxxxxxx |
+-------------+-------------+-----------------------------------+-------------+
```

- 2. `mask_inside(str, margin1, margin2 [, mask_char])`

该函数的作用是只对部分字符串内容进行脱敏。

参数
- margin1，指定开始脱敏的字符位置，默认为 0，如果指定为负数，则仍表示为 0。
- margin2，指定结束脱敏的字符位置，默认为 INT32_MAX，如果指定为负数，则仍表示为 INT32_MAX。
- mask_char，指定要替换的字符，默认为 "x"，如果参数是字符串，则只取第一个字符；如果参数是 "\0"，则解析成默认的字符 "x"。 
- 如果 margin1 == margin2，并且 margin1 和 margin2 都是整数，则意味着不进行脱敏替换字符。

```sql
greatsql> SELECT mask_inside('GreatSQL数据库', 1, 3) AS c1,
	         mask_inside('GreatSQL数据库', 0, 4) AS c2,
		 mask_inside('GreatSQL数据库', 1, 3, '*#') AS c3,
		 mask_inside('GreatSQL数据库', 0, 4, '#*') AS c4,
		 mask_inside('GreatSQL数据库', 1, 3, '赞喔') AS c5,
		 mask_inside('GreatSQL数据库', 1, 2, '\0') AS c6,
		 mask_inside('GreatSQL数据库', 0, -1, '\0')  AS c7 FROM DUAL;
+-------------------+-------------------+-------------------+-------------------+-----------------------+-------------------+-------------+
| c1                | c2                | c3                | c4                | c5                    | c6                | c7          |
+-------------------+-------------------+-------------------+-------------------+-----------------------+-------------------+-------------+
| GxxatSQL数据库    | xxxxtSQL数据库    | G**atSQL数据库    | ####tSQL数据库    | G赞赞atSQL数据库      | GxeatSQL数据库    | xxxxxxxxxxx |
+-------------------+-------------------+-------------------+-------------------+-----------------------+-------------------+-------------+
``` 

#### 查看策略视图 

所有和脱敏策略相关的元数据都存储在 `sys_masking` 库中。

- 1. 表 `masking_policy`，存储脱敏策略规则

列名称 |    |    
----  | ------ |
polname  | 策略名
maskaction| 脱敏函数
optinal|脱敏函数的参数 （可选）
polenabled|是否生效
create_time|创建时间
update_time|修改时间

- 2. 表 `masking_policy_users`，存储脱敏策略与排除账户的对应关系

 列名称 |  |
 --- | -----
polname |策略名
user_name | 账户名
create_time| 创建时间

- 3. 表 `masking_policy_labels`，存储脱敏策略与标签的对应关系

列名称| |
--- | --- 
polname| 策略名
label_name| 标签名称
create_time| 创建时间

一个策略允许应用于多个标签。

- 4. 表 `masking_label`，存储脱敏标签

列名称 |     |
 ---- | --- |
label_id | 标签id
label_name| 标签名
db_name|数据库名
table_name| 表名
field_name| 字段名
create_time| 创建时间

在同一个标签里允许关联多个字段。

### 系统变量

脱敏策略需要在 `enable_data_masking` 全局变量设置为 "ON" 的情况下才会生效：

```sql
greatsql> SET GLOBAL enable_data_masking = ON;
```

如果管理员手动修改了 `sys_masking` 元数据库中的数据，可能会导致策略应用错误，在执行 `FLUSH PRIVILEGES` 时也会引发报错，在错误日志中会有详细记录。

### 安装与卸载

- 1. 安装

执行 `sys_masking.sql` 脚本初始化 `sys_masking` 元数据库并启用基于策略的脱敏功能：

```sql
greatsql> SOURCE %basedir%/share/sys_masking.sql;
```
其中，"%basedir%" 表示 GreatSQL 的安装目录。

以上操作在默认配置下可以生效，但如果修改系统默认配置，如修改默认字符集或默认校验集，则可能会导致该功能无法使用。

例如，当修改校验集设置 `collation_server = utf8mb4_bin` 等可能会影响策略规则匹配，导致脱敏策略无法生效。

- 2. 卸载

执行下面的命令卸载禁用基于策略的脱敏功能：

```sql
greatsql> SET GLOBAL enable_data_masking = OFF;
greatsql> DROP DATABASE sys_masking;
greatsql> DROP TABLESPACE gdb_sys_masking;
greatsql> FLUSH PRIVILEGES;
```

推荐相关阅读：[MySQL企业版之数据脱敏功能](https://mp.weixin.qq.com/s/74pUYuPRUp-BkvjI0ysoCg)。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
