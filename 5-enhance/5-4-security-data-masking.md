# 数据脱敏

数据脱敏有助于防止非授权用户访问敏感数据，从而限制敏感数据的暴露。数据脱敏提供了一种在不应使用真实数据的情况下创建数据版本的方法，如演示、销售演示或软件测试。数据脱敏会改变数据值，同时使用相同的格式，无法进行逆向工程。数据脱敏可使数据对外部无用，从而降低泄露数据的风险。

GreatSQL 中支持两种数据脱敏工作方式

- 基于函数的数据脱敏；
- 基于规则的数据脱敏。

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

## 基于规则的数据脱敏

### 准备工作

基于规则的数据脱敏需要在全局系统变量 `enable_data_masking` 为 TRUE（默认 FALSE）时才能生效。

开始使用前，需要先导入 `sys_masking.sql` SQL 脚本文件以完成相关配置
```sql
greatsql> SOURCE %basedir%/share/sys_masking.sql;
```

### 配置脱敏策略

存储过程名称  | 描述 | 
---- | ---- |
sys_masking.create_label | 创建脱敏字段的标签 
sys_masking.create_policy | 创建脱敏的策略 
sys_masking.policy_add_label | 添加脱敏策略的对应标签的关系
sys_masking.policy_add_user | 添加排除策略的特殊用户
sys_masking.policy_enable | 策略使能 
sys_masking.drop_policy| 删除策略
sys_masking.policy_delete_label | 删除策略与标签的关系
sys_masking.policy_delete_user |  删除策略与用户的关系
sys_masking.drop_label_by_id|  根据标签id删除脱敏标签
sys_masking.drop_label_by_name | 根据标签名称删除脱敏标签


### 使用流程参考

1. 将想要脱敏的数据对象设置标签

```sql
greatsql> CALL sys_masking.create_label('greatsql', 't1', 'c3', 'mask_greatsql_t1_c3') ;
```

调用 `sys_masking.create_label()` 函数为 `greatsql.t1.c3` 这个列（`greatsql.t1` 表中的 `c3` 列）加上 "mask_greatsql_t1_c3" 标签。

2. 创建一个脱敏规则

```sql
greatsql> CALL sys_masking.create_policy('policy1', 'maskall', '*' ) ;
```

调用 `sys_masking.create_policy()` 函数新建一个名为 "policy1" 的策略, 该策略中会调用 `maskall()` 函数将所有数据替换成字符 "*"。

3. 对脱敏规则添加指定标签，使之生效

```sql
greatsql> CALL sys_masking.policy_add_label('policy1', 'mask_greatsql_t1_c3')
```

调用 `sys_masking.policy_add_label()` 函数对规则 "policy1" 添加指定标签 "mask_greatsql_t1_c3"，使得该标签下的所有数据对象在查询返回结果时都会被脱敏，例如：

```sql
greatsql> SELECT c1, c2, c3 FROM greatsql.t1 LIMIT 1;
+----+--------+-------------------+--------------------+
| id | c1     | c2                | c3                 |
+----+--------+-------------------+--------------------+
|  1 | 280638 | 991512.2317965257 | ****************** |
+----+--------+-------------------+--------------------+
```

4. 单独将授权用户 "user2@%" 设置为对脱敏策略 "policy1" 不生效，也就是对 "user2@%" 用户的查询请求不启用脱敏策略，例如：

```sql
greatsql> CALL sys_masking.policy_add_user('policy1', 'user2@127.0.0.1');
```

```sql
-- 切换到 user2@% 用户登入
-- 当前登入用户是 user2@127.0.0.1，也就是从 127.0.0.1 登入的 user2 用户
greatsql> select user();
+-----------------+
| user()          |
+-----------------+
| user2@127.0.0.1 |
+-----------------+

-- 相应的授权用户是 user2@%，允许 user2 从任何地址以 TCP/IP 方式登入
greatsql> select current_user();
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

1. 仅支持对 `SELECT` 查询的字段脱敏，如果查询该字段时使用了函数或额外运算，则脱敏规则不生效。

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

2. 被脱敏的数据列返回结果数据类型将总是被转换成字符串类型。

3. 仅支持对基本表（不包含视图）中的列。

4. 对于带有 `SELECT` 子句的 `INSERT [ALL] INTO` 或 `REPLACE INTO` 操作，如果源表中包含脱敏列，则上述两种操作中插入或更新的结果为脱敏后的值，且不可还原。

5. 配置脱敏策略的用户需要有对 `sys_masking` 库的 `EXECUTE, INSERT, DELETE, UPDATE, RELOAD` 等权限（最好只向管理员开放对该库的管理权限）。

6. 默认地，脱敏策略对所有用户生效，除了 `sys_masking.maksing_policy_users` 中配置的用户以及拥有超级用户权限的用户之外。

执行下面的 SQL 命令可查看所有被排除脱敏规则的用户列表：

```sql
> SELECT user FROM mysql.user WHERE super_priv = 'y' UNION ALL 
  SELECT user_name FROM sys_masking.maksing_policy_users;
```

7. 对于查询中含有group by 含有脱敏字段，会多出一个warning 

```sql
select col_int from t1 group by col_int;
col_int
***********
**********
warnings:
warning 1052    column 'col_int' in group statement is ambiguous
```

8. 查询中使用 union / union all 进行计算，***将会按照脱敏结果进行去重，而不是原值***. order by 与group by 也将会按照脱敏的结果进行排序

```sql
select col_varchar as a from t1 union select col_int from t1 order by a;
   |        a    |
   +-------------+
   | -2147483648
   | !@**%^&*()
   | 2147483647
   | ha**
   | th**isvarchar
   +-------------+
```   

9. 集群模式/主备模式下策略更新后，需要其他节点生效需要在各个节点上运行

```sql
  flush privileges;
```

### 脱敏配置接口说明
#### 脱敏策略控制存储过程

##### 1. 创建脱敏字段的标签
sys_masking.create_label( ‘db_name’, ‘table_name’, ‘field_name’ , 'mask_label_name'); 

功能：添加需要脱敏的字段(允许多个字段使用相同的label 名称方便部署),配置的字段不区分大小写
参数：
-   db_name  数据库的名称 (不区分大小写)
-   table_name  表名称 (不区分大小写)
-   field_name  字段名称 (不区分大小写)
-   mask_label_name 作为脱敏标签

样例: 
```
call sys_masking.create_label('test', 't1', 'f3', 'mask_1') ;
Query OK, 0 rows affected (0.01 sec)

错误：
> call sys_masking.create_label('test', 't1', '', 'mask_1') ;
ERROR 45000:  field_name length must be greater than 1

> call sys_masking.create_label('test’, '', 'f3', 'mask_1') ;
ERROR 45000:  table_name length must be greater than 1
 
> call sys_masking.create_label('’, 't1', 'f3', 'mask_1') ;
ERROR 45000:  db_name length must be greater than 1
 
> call sys_masking.create_label('test', 't1', 'f3', 'm') ;
ERROR 45000:  mask_label_name length must be greater than 2

> call sys_masking.create_label('test', 't1', 'f3', 'mask_1') ;
ERROR 45000:  field has already define label

```

##### 2.  创建脱敏的策略 
sys_masking.create_policy( policy_name   ,mask_function,  args)

功能：添加需要脱敏的策略对应的脱敏函数, 脱敏策略将会对对应配置的标签字段生效，
默认将会对除了特权用户以外的所有用户生效。特权用户包含用户权限含有super_priv 和  maksing_policy_users 表中配置的用户以外都生效。 参数如果配置错误将会使策略不生效，后台日志将会报错

参数：
- policy_name  策略名称 , 长度必须大于1
- mask_function 脱敏函数名称 ENUM('maskall', 'mask_inside')
- args  剩余参数将作为 mask_function 函数的参数，多个参数使用 ’,‘ 进行分割,null或者''，将使用默认参数

样例: 
```
call sys_masking.create_policy('policy1', 'mask_inside', '0,5,#') ;
Query OK, 0 rows affected (0.03 sec)
call sys_masking.create_policy('policy2', 'maskall', null) ;
Query OK, 0 rows affected (0.01 sec)

错误：
call sys_masking.create_policy('policy2', 'mask_inside', '2,4,*');
ERROR 45000: p_policy_name has already exists
>call sys_masking.create_policy('policy3', 'mask_inside', ',4,*');
 ERROR 45000: Invalid optional parameter format number,number,char
>call sys_masking.create_policy('policy3', 'mask_inside', '1,4a');
ERROR 45000: Invalid optional parameter format number,number,char
>call sys_masking.create_policy('policy3', 'mask_inside', 'a,1');
 ERROR 45000: Invalid optional parameter format number,number,char
>call sys_masking.create_policy('policy3', 'mask_inside', 'a,1');
 ERROR 45000: Invalid optional parameter format number,number,char
>call sys_masking.create_policy('policy3', 'mask_inside', '1,a');
 ERROR 45000: Invalid optional parameter format number,number,char

```

##### 3. 添加脱敏策略的对应标签的关系
sys_masking.policy_add_label(policy_name, mask_label_name)

功能：添加策略生效的对应label 的关系， 如果一个label 被配置了多个策略,将只有一个策略生效。     

参数： 
- policy_name  策略名称
- mask_label_name  标签名称

样例: 
```
>call sys_masking.policy_add_label('policy1', 'mask_1') 
Query OK, 0 rows affected (0.03 sec)

错误：
>call sys_masking.policy_add_label('policy3', 'mask_1');
ERROR 45000: label has already bind policy
 
>call sys_masking.policy_add_label('p', 'mask_1');
ERROR 45000:  policy_name length must be greater than 2
 
>call sys_masking.policy_add_label('policy3', 'm');
ERROR 45000: label_name length must be greater than 2

>call sys_masking.policy_add_label('policy3', 'mask_2');
ERROR 45000: policy has not create, please check
```

##### 4. 添加排除策略的特殊用户
sys_masking.policy_add_user(policy_name, user_name)

功能: 添加排除策略的特殊用户,配置了的user_name 和拥有  super_priv 的权限的用户将不会进行脱敏。 
       
参数:
- policy_name 策略名称
- user_name 角色名称, 格式为 username@hostname

样例: 
```
call sys_masking.policy_add_user( 'policy1', 'user2@hostname');
Query OK, 0 rows affected (0.03 sec)
call sys_masking.policy_add_user( 'Policy1', 'user3@hostname');
Query OK, 0 rows affected (0.03 sec)

错误：
call sys_masking.policy_add_user( 'policy1', 'user2@hostname');
ERROR 45000: user has alread add, please check

call sys_masking.policy_add_user( 'policy1', 'USER2@hostname');
ERROR 45000: user has alread add, please check
```

##### 5. 脱敏策略使能 
    
sys_masking.policy_enable(policy_name ,  policy_enabled)

功能：默认策略创建完成就是生效，在不删除策略的情况下让策略失效。

参数:
- policy_name 策略名称(不区分大小写)
- policy_enabled 默认为 1 ，1-表示策略生效  ，  0-表示不生效

样例:
```
-- 启用策略
call sys_masking.policy_enable('policy1', 1);

-- 禁用策略
call sys_masking.policy_enable('policy1', 0);
```

##### 6. 删除策略
sys_masking.drop_policy('policy_name')   
功能：删除策略，并且会删除策略，与用户,与标签直接的关系

参数：  
- policy_name  策略名称

样例:
```
-- 删除策略
call sys_masking.drop_policy('policy1');
```

##### 7. 删除策略与标签的关系
sys_masking.policy_delete_label(policy_name, label_name)

功能： 删除 策略与标签的关系

参数：
- policy_name  策略名称

样例: 
```
-- 删除策略与标签的关系
call sys_masking.policy_delete_label('policy1', 'mask_1');
```

##### 8. 删除策略排除的特殊用户
sys_masking.policy_delete_user(policy_name, user_name)

功能： 删除策略与角色相关系

参数：
- policy_name  策略名称
- user_name 用户名称

样例: 
```
-- 删除策略排除的特殊用户
call sys_masking.policy_delete_user('policy1', 'user2@hostname');
```

##### 9. 根据标签id删除脱敏标签
sys_masking.drop_label_by_id(label_id)

功能： 根据 id 删除脱敏标签 

参数：
- label_id 标签名称id
    
样例: 
```
-- 根据标签id删除脱敏标签
call sys_masking.drop_label_by_id(1);
```


##### 10. 根据标签名称删除脱敏标签
sys_masking.drop_label_by_name(label)

功能：根据标签名称删除脱敏标签

参数： 
- label  标签名称

样例: 
```
-- 根据标签名称删除脱敏标签
call sys_masking.drop_label_by_name('my_label');
```

#### 脱敏函数 mask_function

##### 1. maskall(str, [, mask_char] ) 屏蔽全部字符串的
参数: mask_char 默认为 'x' ,字符串只取第一个字符,如果是’\0‘字符也会解析成 默认字符’x‘ 
```
    >select maskall('12345678') as f1 ,maskall('12345678', 'a') as f2;
    +----------+----------+
    | f1       | f2       |
    +----------+----------+
    | xxxxxxxx | aaaaaaaa |
    +----------+----------+
   > select maskall('中文测试','燙');
   +-------------------------------+
   | maskall('中文测试','燙')      |
   +-------------------------------+
   | 燙燙燙燙                      |
   +-------------------------------+

    > select maskall('中文测试','\0');
   +------------------------------+
   | maskall('中文测试','\0')     |
   +------------------------------+
   | xxxx                         |
   +------------------------------+
   1 row in set (0.00 sec)

   > select maskall('123456','\0');
   +------------------------+
   | maskall('123456','\0') |
   +------------------------+
   | xxxxxx                 |
   +------------------------+
   1 row in set (0.00 sec)

```

##### 2. mask_inside(str, margin1, margin2 [, mask_char]) 屏蔽字符串的内部部分。  
    参数: 
        margin1 默认为0 , 负数 -1 则表示为0  
        margin2 默认为int_max (最大值), 负数 -1，则表示最大值 （不包括）
        mask_char 默认为 'x' ,字符串只取第一个字符 ,如果是 ’\0‘字符也会解析成 默认字符’x‘ 
        如果 margin1 == margin2 并且margin1 和 margin2 都是整数，则意味着不进行脱敏,
```

    > select mask_inside('abcdef', 1, 3), mask_inside('abcdef',0, 4);
    +----------------------------+---------------------------+
    | mask_inside('abcdef', 1, 3) | mask_inside('abcdef',0, 4) |
    +----------------------------+---------------------------+
    | axxdef                     | xxxxef                    |
    +----------------------------+---------------------------+

    > select mask_inside('abcdef', 1, 3, '*'), mask_inside('abcdef',0, 4, '#');
    +---------------------------------+--------------------------------+
    | mask_inside('abcdef', 1, 3, '*') | mask_inside('abcdef',0, 4, '#') |
    +---------------------------------+--------------------------------+
    | a**def                          | ####ef                         |
    +---------------------------------+--------------------------------+

   >  select mask_inside('中文测试',1,3,'燙'); 
   +---------------------------------------+
   | mask_inside('中文测试',1,3,'燙')      |
   +---------------------------------------+
   | 中燙燙试                              |
   +---------------------------------------+

   > select mask_inside('中文测试',1,2,'\0'); 
   +--------------------------------------+
   | mask_inside('中文测试',1,2,'\0')     |
   +--------------------------------------+
   | 中x测试                              |
   +--------------------------------------+

   > select mask_inside(123456,0,-1 ,'\0');
   +--------------------------------+
   | mask_inside(123456,0,-1 ,'\0') |
   +--------------------------------+
   | xxxxxx                         |
   +--------------------------------+

``` 

#### 查看策略视图 
在 sys_masking 库中

##### 1. 表masking_policy 策略与脱敏函数的关系

列名称 |    |    
----  | ------ |
polname  | 策略名称
maskaction| 脱敏函数
optinal|脱敏函数的参数 （可选）
polenabled|是否生效
create_time|创建时间
update_time|修改时间

##### 2. 表masking_policy_users  策略与角色的关系

 列名称 |  |
 --- | -----
polname |策略名称
user_name | 用户名称
create_time| 创建时间

##### 3. 表masking_policy_labels  策略与标签的关系

列名称| |
--- | --- 
polname| 策略名称
label_name| 标签名称
create_time| 创建时间

一个策略允许有多个label

##### 4. 表masking_label 脱敏标签

列名称 |     |
 ---- | --- |
label_id | 标签id
label_name| 标签名称
db_name|数据库名称
table_name| 表名称
field_name| 字段名称
create_time| 创建时间

一个label 允许可以关联多个字段

## 系统变量
  脱敏策略需要在 enable_data_masking 全局变量生效的情况下，才会生效
  ```
    set global enable_data_masking = on;
    flush privileges;
  ```
  如果用户强制修改了，策略表中的数据，导致策略错误，
  会导致 flush privileges 报错，系统日志中有详细的错误数据

### 安装与卸载

 导入sys_masking 库
```
 source  $db_base/share/sys_masking.sql
```
> 以上实现均在默认配置下生效，如果强制修改系统默认配置，将会导致非预期行为，请合理修改配置
> 例如： collation = 'utf8mb4_bin'; 等全局配置就影响全局匹配，导致出现脏数据无法效验

 卸载
``` 
   set persist  enable_data_masking = off;
   reset persist;
   drop database sys_masking;
   drop tablespace gdb_sys_masking;
   flush privileges;
```


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
