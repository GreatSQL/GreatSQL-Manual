# 字符集 & 校验集
---

## GreatSQL字符集

在GreatSQL 8.0版本之前，默认字符集为`latin1`，`utf8`字符集指向的是`utf8mb3`。开发人员在数据库设计的时候往往会将编码修改为`utf8`字符集。如果遗忘修改默认的编码，就会出现乱码的问题。从GreatSQL 8.0开始，数据库的默认编码将改为`utf8mb4`，从而避免上述乱码的问题。

### 查看默认使用的字符集

GreatSQL字符集与比较规则使用级别，分别为服务器级别、数据库级别、表级别、列级别。

```sql
greatsql> SHOW VARIABLES LIKE 'character%'; 
+--------------------------+----------------------------------------------------------------------+
| Variable_name            | Value                                                                |
+--------------------------+----------------------------------------------------------------------+
| character_set_client     | utf8mb4                                                              |
| character_set_connection | utf8mb4                                                              |
| character_set_database   | utf8mb4                                                              |
| character_set_filesystem | binary                                                               |
| character_set_results    | utf8mb4                                                              |
| character_set_server     | utf8mb4                                                              |
| character_set_system     | utf8mb3                                                              |
| character_sets_dir       | /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/share/charsets/ |
+--------------------------+----------------------------------------------------------------------+
8 rows in set (0.01 sec)
```

- `character_set_server`：服务器级别的字符集

- `character_set_database`：当前数据库的字符集

- `character_set_client`：服务器解码请求时使用的字符集

- `character_set_connection`：服务器处理请求时会把请求字符串从`character_set_client`转为`character_set_connection`

- `character_set_results`：服务器向客户端返回数据时使用的字符集

### 服务器级别（server）

提供两个系统变量来表示。`character_set_server`与`collation_server`。启动服务器程序时通过启动选项或程序运行中通过set 语句进行修改这两个变量。比如配置文件中配置：

```sql
 [server] 
 character_set_server=utf8mb4  
 collation_server=utf8mb4_bin
```

### 数据库级别（database）

提供两个系统变量来表示。`character_set_database`与`collation_database`, 这两个变量不能直接修改的，只能通过创建库或修改库语句来修改。use到哪个库，查询到的`character_set_database与collation_database`即为当前数据库的默认字符集与校验规则。这两个变量修改时会有warning，在将来的版本会变为只读变量。创建库语句不指定字符集将使用服务器级别的设置。

对应的语句：

```sql
create/alter database 数据库名 [character set 字符集名称][collate 比较规则名称] ;
例如：
create database test character set utf8mb4 collate utf8mb4_0900_bin;
alter database test character set utf8mb4 collate utf8mb4_0900_ai_ci;
```

### 表级别

创建和修改表时指定。同一个database里的不同表可以使用不同字符集。创建表的语句中没有指明字符集和比较规则，则使用该表所在数据库的字符集与比较规则。

对应的语句：

```sql
create table table_name(列信息)
[character set 字符集名称][collate 比较规则名称];
alter table table_name
[character set 字符集名称][collate 比较规则名称];

例如：
create table t1(id int,c1 varchar(30)) character set utf8mb4 collate utf8mb4_0900_bin;
alter table t1 character set utf8 collate utf8mb4_0900_ai_ci;
```

这里注意一下，字符集和比较规则是相互关联的，如果在修改时仅指定了字符集，那么比较规则也会随之变为修改后的字符集默认的比较规则。如果仅指定了比较规则，那么字符集也会变为比较规则对应的字符集。这么说来的话，只需要指定比较规则就够了。

修改表的默认字符集只对后面添加的列有效，已存在的列的校验规则保持不变。

### 列级别

对于存储字符串的列，同一个表中不同列可以有不同的字符集和比较规则。可以在创建和修改列信息时指定该列的字符集与比较规则。如果创建和修改列时不指定，则使用该表的字符集与比较规则。

对应的语句：

```sql
create table table_name(列名 字符串类型 [character set 字符集名称] [collate 比较规则名称]，其他列...);
alter table table_name modify 列名 字符串类型 [character set 字符集名称] [collate 比较规则名称];
```

修改列信息时注意：修改列时不指定字符集，即使创建时指定了字符集，也会使用表的字符集和比较规则。如果修改后的列字符集不能表示列中存储的数据，则会报错。

**修改5.7版本字符集**

在GreatSQL 5.7版本可以在`my.cnf`配置文件中加入字符集配置，然后重启服务器即可

```bash
$ vim /etc/my.cnf
character_set_server=utf8
```

> 但是原库、原表的设定不会发生变化，参数修改只对新建的数据库生效。

GreatSQL 5.7 版本中，以前创建的库，创建的表字符集还是`latin1`

修改已创建数据库的字符集

```sql
greatsql> ALTER DATABASE db_name CHARACTER SET 'utf8';
```

修改已创建数据表的字符集

```sql
greatsql> ALTER TABLE table_name CONVERT TO CHARACTER SET 'utf8';
```

## 字符集介绍

计算机存储的都是二进制数据，十进制数字可以转换为二进制，那么字符串要转换为二进制数据就需要一个映射关系，字符转换为二进制叫编码，二进制转换为字符叫解码，这个其实就是字符集的概念，描述某个字符范围的编码规则，不同的字符集包含的字符范围不一样。

下面介绍一些重要的字符集。

### **1.** ASCII字符集

共收录128个字符，包括空格、标点符号、数字、大小写字母和一些不可见字符。不可见字符主要指控制字符（比如换行、回车等）和通信字符（比如文头SOH、文尾EOT等）等。ASCII字符集总共128个字符，可以使用1个字节来进行编码。

### **2.** ISO8859-1字符集

共收录256个字符，是在ASCII字符集的基础上又扩充了128个西欧常用字符（包括德法两国的字母）。ISO8859-1字符集也可以使用1个字节来进行编码。这个字符集还有一个别名Latin1。

### **3.** GB2312字符集

收录了汉字以及拉丁字母、希腊字母、日文平假名及片假名字母、俄语西里尔字母。收录汉字6763个，收录其他文字符号682个。这种字符集同时兼容ASCII字符集，所以如果字符在ASCII字符集中则采用1字节编码，否则采用2字节编码。

### **4.** GBK字符集

GBK对GB2312字符集进行了扩充，编码方式兼容GB2312字符集。同GB2312字符集，如果字符在ASCII字符集中则采用一字节编码，否则采用2字节编码。

### **5.** UTF-8字符集

几乎收录了当今世界各个国家地区使用的字符，而且还在不断扩充。这种字符集兼容ASCII字符集，采用变长编码方式，编码一个字符需要使用1~4个字节。通常一个汉字是3个字节编码，一个字母是一个字节编码。UTF-8是Unicode的一种编码方案，此外还有UTF-16、UTF-32编码方案。

可以看出，ISO8859-1、GB2312、GBK、UTF-8字符集都包含了ASCIIS字符集，GBK包含了GB2312字符集,  UTF-8收录的字符涵盖GBK、GB2312、ISO8859-1的字符，但是它们编码规则是不一样的。

比如汉字“我”的编码方式：GBK中的编码：1100111011010010 \ UTF-8的编码：111001101000100010010001

## 字符集比较规则

可以通过语句`show collation [like 匹配的模式] `来查看支持的比较规则，数据来源于表`information_schema.collations`

每种字符集都有若干种比较规则。

```sql
greatsql> SHOW COLLATION LIKE 'utf8mb4%';
+----------------------------+---------+-----+---------+----------+---------+---------------+
| Collation                  | Charset | Id  | Default | Compiled | Sortlen | Pad_attribute |
+----------------------------+---------+-----+---------+----------+---------+---------------+
| utf8mb4_0900_ai_ci         | utf8mb4 | 255 | Yes     | Yes      |       0 | NO PAD        |
| utf8mb4_0900_as_ci         | utf8mb4 | 305 |         | Yes      |       0 | NO PAD        |
| utf8mb4_0900_as_cs         | utf8mb4 | 278 |         | Yes      |       0 | NO PAD        |
......中间省略
| utf8mb4_vi_0900_as_cs      | utf8mb4 | 300 |         | Yes      |       0 | NO PAD        |
| utf8mb4_zh_0900_as_cs      | utf8mb4 | 308 |         | Yes      |       0 | NO PAD        |
+----------------------------+---------+-----+---------+----------+---------+---------------+
89 rows in set (0.00 sec)
```

utf8mb4比较规则有89种。Collation的命名规则也有规律，以字符集的名字开头，后面有尾缀`_ai`,`_as`,`_ci`,`_cs`,`_bin`。这几个尾缀的含义如下：

| 尾缀 | 英文含义           | 中文描述         |
| :--- | :----------------- | :--------------- |
| _ai  | accent insensitive | 不区分重音       |
| _as  | accent sensitive   | 区分重音         |
| _ci  | case insensitive   | 不区分大小写     |
| _cs  | case sensitive     | 区分大小写       |
| _bin | binary             | 以二进制方式比较 |

## 怎样选择合适的字符集
1. 满足应用支持语言的需求，如果应用要处理各种各样的文字，或者将发布到使用不同国家语言或者地区，就应该选择`utf8mb4`
2. 如果已经涉及已有数据的导入，就要充分的考虑数据库字符集对已有数据的兼容性
3. 如果数据库需要支持一般中文，且数据量大，性能要求也高，那就要选择双字节定长编码的中文字符集比如GBK
4. 字符集如果需要做大量的字符运算，比如排序，比较等，那么选择定长字符集可能更好，因为定长字符集的处理速度要比变长字符集处理的速度快
5. 如果所有客户端程序都支持相同的字符集，则应该优先选择该字符集作为数据库字符集。这样可以避免字符集转换带来的性能开销和数据损失

## 乱码问题
1. 客户机没有正确地设置client字符集，导致原先的SQL语句被转换成connection所指字符集，而这种转换，是会丢失信息的，如果client是utf8格式，那么如果转换成gb2312格式，这其中必定会丢失信息，反之则不会丢失。一定要保证connection的字符集大于client字符集才能保证转换不丢失信息。

2. 数据库字体没有设置正确，如果数据库字体设置不正确，那么connection字符集转换成database字符集照样丢失编码，原因跟上面一样。

3. 要确保没有乱码出现`character_set_client`、`character_set_connection`、`character_set_result`这三个系统变量应该和客户端、库、表、列的默认字符集相同，既全部字符集都统一。

举例乱码问题：

操作系统的字符集编码
```bash
$ locale
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
```
数据库三个系统变量字符编码为一致
```sql
greatsql> SHOW GLOBAL VARIABLES LIKE "character_set_client";
+----------------------+---------+
| Variable_name        | Value   |
+----------------------+---------+
| character_set_client | utf8mb4 |
+----------------------+---------+
1 row in set (0.00 sec)

greatsql> SHOW GLOBAL VARIABLES LIKE "character_set_connection";
+--------------------------+---------+
| Variable_name            | Value   |
+--------------------------+---------+
| character_set_connection | utf8mb4 |
+--------------------------+---------+
1 row in set (0.01 sec)

greatsql> SHOW GLOBAL VARIABLES LIKE "character_set_database";
+------------------------+---------+
| Variable_name          | Value   |
+------------------------+---------+
| character_set_database | utf8mb4 |
+------------------------+---------+
1 row in set (0.01 sec)
```
接下来测试乱码
```sql
greatsql> select _utf8'GreatSQL社区';
+----------------+
| GreatSQL社区   |
+----------------+
| GreatSQL社区   |
+----------------+
1 row in set, 1 warning (0.00 sec)

greatsql> select _gbk'GreatSQL社区';
+-------------------+
| GreatSQL绀惧尯    |
+-------------------+
| GreatSQL绀惧尯    |
+-------------------+
1 row in set (0.01 sec)
```

1.客户端发送请求时会将字符'GreatSQL社区'按照utf8进行编码，英文不受影响，但中文"社区"编码也就是：`&#x793E;&#x533A;`

2.服务器收到请求后发现有前缀_gbk，则不会将其后边的字节`&#x793E;&#x533A;`进行从`character_set_client`到`character_set_connection`的转换，而是直接把`&#x793E;&#x533A;`认为是某个字符串由gbk编码后得到的字节序列。

3.再把上述`&#x793E;&#x533A;`从gbk转换为`character_set_results`，也就是utf8。`&#x793E;&#x533A;`在gbk中代表汉字'绀惧尯'。

## 扩展阅读

- [关于GreatSQL字符集的总结](https://mp.weixin.qq.com/s/RERq6735UnbF8ZEmrD3AAw)

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
