# 生成随机测试数据

本节介绍使用mysql_random_data_load、Shell脚本、存储过程/函数向GreatSQL数据库生存随机测试数据。

在 [概述章节](./12-dev-guide.md) 已安装样例数据库，若有需要生成额外测试数据，可参考本节内容。

## mysql_random_data_load 生成随机数据

mysql_random_data_load 是使用 Go 语言开发的 MySQL/GreatSQL 随机造数工具，可从下方链接中直接下载编译完成的二进制程序。
 > https://github.com/Percona-Lab/mysql_random_data_load

 下载后，解压到任意目录：
 ```bash
$ tar -xvzf mysql_random_data_load_0.1.12_Linux_x86_64.tar.gz
$ ls
LICENSE  mysql_random_data_load  README.md
```
验证下是否可用
```bash
$ ./mysql_random_data_load --help

usage: mysql_random_data_loader [<flags>] <database> <table> <rows>
MySQL Random Data Loader
......下方省略
```
`mysql_random_data_load` 将加载（插入）“n”条记录到源表，并根据数据类型用随机数据填充它。所以这个工具不会像 sysbench 那样确定预定义的表列或数据类型。它将根据列数据类型将数据插入表中。因此，可以根据自定义需求生成随机数据。表格可以有任意数量的不同数据类型的列，此工具将根据列的数据类型生成数据并插入数据。

- 如果字段小于10，程序将生成一个随机的“名字”
- 如果字段大于10且小于30，程序将生成一个随机的“全名”
- 如果字段大于30，程序将生成一个“lorem ipsum”段落，最多包含100个字符。
- 该程序可以检测一个字段是否接受 NULL，如果接受，它将随机生成 NULL（约 10% 的值）。

### 生成随机数据

进入数据库在test_db库下创建一张t3表
```sql
CREATE TABLE `t3` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tcol01` tinyint(4) DEFAULT NULL,
  `tcol02` smallint(6) DEFAULT NULL,
  `tcol03` mediumint(9) DEFAULT NULL,
  `tcol04` int(11) DEFAULT NULL,
  `tcol05` bigint(20) DEFAULT NULL,
  `tcol06` float DEFAULT NULL,
  `tcol07` double DEFAULT NULL,
  `tcol08` decimal(10,2) DEFAULT NULL,
  `tcol09` date DEFAULT NULL,
  `tcol10` datetime DEFAULT NULL,
  `tcol11` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tcol12` time DEFAULT NULL,
  `tcol13` year(4) DEFAULT NULL,
  `tcol14` varchar(100) DEFAULT NULL,
  `tcol15` char(2) DEFAULT NULL,
  `tcol16` blob,
  `tcol17` text,
  `tcol18` mediumtext,
  `tcol19` mediumblob,
  `tcol20` longblob,
  `tcol21` longtext,
  `tcol22` mediumtext,
  `tcol23` varchar(3) DEFAULT NULL,
  `tcol24` varbinary(10) DEFAULT NULL,
  `tcol25` enum('a','b','c') DEFAULT NULL,
  `tcol26` set('red','green','blue') DEFAULT NULL,
  `tcol27` float(5,3) DEFAULT NULL,
  `tcol28` double(4,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
Query OK, 0 rows affected, 9 warnings (0.03 sec)
```
要生成 100K 随机行，只需运行：
```bash
$ ./mysql_random_data_load test_db t3 100000 --user=root --password=GreatSQL@2024

INFO[2024-05-08T17:07:49+08:00] Starting                                     
   0s [====================================================================] 100%
INFO[2024-05-08T17:07:49+08:00] 100000 rows inserted   
```
- test_db：数据库名
- t3：表名
- 100000：行数
- --user=root：用户名
- --password=root：密码

`mysql_random_data_load`不关心这个表有哪些列，它都能自动进行填充

生成的随机数据入下所示
```sql
greatsql> SELECT * from t3 LIMIT 1\G
*************************** 1. row ***************************
    id: 1
tcol01: 5
tcol02: 136
tcol03: 172113
tcol04: 1801160058
tcol05: 3916589616287113937
tcol06: 5.49459
tcol07: 0.939116
tcol08: 1.20
tcol09: 2024-05-08
tcol10: 2023-11-22 14:02:56
tcol11: 2024-03-28 18:10:19
tcol12: 17:35:34
tcol13: 2024
tcol14: earum cum possimus odio tenetur odio recusandae.
tcol15: Pa
tcol16: 0x766F6C7570746174656D206E617475732068696320766F6C757074617465206175742073697420617574656D2E
tcol17: culpa aut aliquid architecto aut repudiandae consequuntur nam quis.
tcol18: aut ut officiis eum sed ut facilis.
tcol19: 0x656E696D2071756920696E20726572756D2071756F73206E6968696C2065756D20726570656C6C617420667567697420616D65742E
tcol20: 0x766F6C75707461732070726F766964656E742062656174616520636F6D6D6F64692E
tcol21: a aut incidunt sed veniam eos dolores neque.
tcol22: inventore sint numquam et.
tcol23: Sha
tcol24: 0x4A757374696E
tcol25: a
tcol26: blue
tcol27: 0.000
tcol28: 0.42
1 row in set (0.00 sec)
```

## Shell脚本生成随机数据

也可以自己写脚本生成随机数据，利用Shell脚本，生成多条Insert语句，然后导入到数据库中执行。

### 创建测试表
首先在数据库中创建一张表`test_shell`

```sql
CREATE TABLE `test_shell` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(20) DEFAULT NULL,
    `age` int(10) DEFAULT NULL,
    `sex` varchar(10) DEFAULT NULL,
    `address` varchar(100) DEFAULT NULL,
    `phone` varchar(15) DEFAULT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### 创建Shell脚本文件

在使用 `vi` 或 `vim` 编辑器创建一个新的 Shell 脚本文件

```bash
$ vim random_data.sh
```
### 编写Shell脚本
进入文件后，按下`i`键，左下方出现 `--- INSERT ---` 表示进入编辑模式，然后输入/粘贴以下内容
```bash
#!/bin/bash  
  
# 设置输出文件的路径和名称  
output_file="insert_sql.sql"  
  
# 清空输出文件  
> "$output_file"  
  
# 表名  
table_name="test_shell"  
 
# 生成随机名字（只使用英文字母）  
function generate_random_name() {  
    local length=4  
    local name=""  
    for (( i=0; i<$length; i++ )); do  
        # 使用RANDOM生成0-25的随机数，对应ASCII码中的小写字母  
        char=$((RANDOM%26+97))  
        # 如果是第一个字符，则转换为大写（ASCII码中大写字母和小写字母相差32）  
        if [ $i -eq 0 ]; then  
            char=$((char-32))  
        fi  
        name+="$(printf \\$(printf '%o' $char))"  # 使用printf将ASCII码转换为字符  
    done  
    echo "$name"
}  

# 生成随机年龄（这里假设在18-100之间）  
function generate_random_age() {  
    echo $((RANDOM%83+18))  
}  
  
# 生成随机性别（男或女）  
function generate_random_sex() {  
    if [ $((RANDOM%2)) -eq 0 ]; then  
        echo "男"  
    else  
        echo "女"  
    fi  
}  
  
# 生成随机地址（只生成随机字符串）  
function generate_random_address() {  
    local length=10  
    local address=""  
    for (( i=0; i<$length; i++ )); do  
        address+=$((RANDOM%26+97))  # ASCII码97-122对应a-z  
    done  
    echo "地址${address}"  
}  
  
# 生成随机电话（只生成11位数字）  
function generate_random_phone() {  
    echo $((RANDOM%90000000000+10000000000))  
}  
  
-- 此处可设置生成多少条数据，这里我们生成100条数据
for i in {1..100}; do  
    name=$(generate_random_name)  
    age=$(generate_random_age)  
    sex=$(generate_random_sex)  
    address=$(generate_random_address)  
    phone=$(generate_random_phone)  
      
    # 由于ID是自增的，这里直接用循环变量$i代替，假设从1开始  
    echo "INSERT INTO $table_name (id, name, age, sex, address, phone) VALUES ($i, '$name', $age, '$sex', '$address', '$phone');" >> "$output_file"  
done  
  
echo "Insert语句已生成并保存到$output_file文件中"
```

按下 `Esc` 键退出插入模式，并输入 `:wq` 命令保存文件并退出

### 执行Shell脚本

使用`sh`命令运行该Shell脚本，生成Insert语句
```bash
$ sh random_data.sh 
Insert语句已生成并保存到insert_sql.sql文件中
```
### 查看生成的Insert语句

使用`tail`命令查看生成的Insert语句文件，截取部分内容如下：
```bash
$ tail -n 5 insert_sql.sql
INSERT INTO test_shell (id, name, age, sex, address, phone) VALUES (96, 'Ohky', 65, '男', '地址102105105979711110397105110', '10000016611');
INSERT INTO test_shell (id, name, age, sex, address, phone) VALUES (97, 'Tydx', 50, '男', '地址10311712012111110110410910697', '10000010900');
INSERT INTO test_shell (id, name, age, sex, address, phone) VALUES (98, 'Wsrs', 18, '女', '地址112119114106101122118116102104', '10000011526');
INSERT INTO test_shell (id, name, age, sex, address, phone) VALUES (99, 'Knyh', 25, '男', '地址10010511811011610910612297104', '10000011057');
INSERT INTO test_shell (id, name, age, sex, address, phone) VALUES (100, 'Mwsd', 51, '女', '地址103971031209811411197101113', '10000003984');
```
### 导入数据
生成insert_sql.sql文件后需将此文件导入到GreatSQL中的test_db库中
```bash
$ mysql -uroot -pGreatSQL@2024 test_db < /data/insert_sql.sql
```
查看test_db库中test_shell表中的数据情况
```bash
$ mysql -uroot -pGreatSQL@2024  -e'select count(*) from test_db.test_shell;'
+----------+
| count(*) |
+----------+
|      100 |
+----------+
```
### 注意事项
1. 生成Insert语句时，需注意表名、字段名和数据类型，否则生成的Insert语句将无法执行
2. 运行Shell脚本时或向GreatSQL数据库插入数据时，请提前关注相关服务器的资源使用情况，避免由于资源使用情况而导致数据插入失败或性能下降的情况，若资源不足，可分批导入。

## 存储过程生成随机数据
### 创建表

创建一张test_book表
```sql
CREATE TABLE IF NOT EXISTS `test_book`(
	`bookid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `card`INT(10) UNSIGNED NOT NULL,
	PRIMARY KEY (`bookid`)
);
```
### 定义存储过程

现在，我们可以定义一个存储过程来插入数据。例如，可以定义一个存储过程INSERT_DATA，并将使用`CALL`调用存储过程插入随机数。


```sql
greatsql> DROP PROCEDURE IF EXISTS INSERT_DATA;
greatsql> DELIMITER //
greatsql> CREATE PROCEDURE INSERT_DATA()   
            BEGIN  
                DECLARE n INT DEFAULT 1;
                -- 此处定义生成20条语句，若要生成更多，可修改此处数字  
                WHILE n < 21 DO  
                    INSERT INTO test_book(card) VALUES (FLOOR(1 + (RAND() * 20)));  
                    SET n = n + 1;  
                    END WHILE;  
            END //
greatsql> DELIMITER ;
```
注意：使用了`DELIMITER`来改变命令分隔符，以便在存储过程内部使用分号。

### 调用存储过程
可以通过调用INSERT_DATA存储过程来插入数据。
```sql
greatsql> CALL INSERT_DATA();
```
### 查看数据
查看test_book表中的数据情况，可以看到生成了20条随机数。
```sql
greatsql> SELECT COUNT(*) FROM test_book;
+----------+
| COUNT(*) |
+----------+
|       20 |
+----------+
1 row in set (0.00 sec)
```
### 删除存储过程
如果不需要存储过程，可以使用`DROP PROCEDURE`删除它。
```sql
greatsql> DROP PROCEDURE INSERT_DATA;
```

## 存储过程和函数生成随机数据

### 创建表

创建一张t1表，用于存储随机数据
```sql
CREATE TABLE `t1` (
    `Id` INT ( 11 ) NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR ( 10 ) DEFAULT NULL,
    `Address` CHAR ( 20 ) DEFAULT NULL,
    `Telephone` CHAR ( 11 ) DEFAULT NULL,
    `Date` DATETIME DEFAULT NULL,
    `Money` DECIMAL ( 10, 2 ),
    PRIMARY KEY ( `Id` ) 
) ENGINE = INNODB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8;
```
### 创建函数
开启可以设置函数，否则创建函数时会报错
```sql
greatsql> SET GLOBAL log_bin_trust_function_creators = 1;
```
随机字符串函数
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_string;
CREATE FUNCTION rand_string ( n INT ) RETURNS VARCHAR ( 255 ) BEGIN
    DECLARE
        chars_str VARCHAR ( 100 ) DEFAULT 'abcdefghijklmnopqrstuvwxyzABCDEFJHIJKLMNOPQRSTUVWXYZ';
    DECLARE
        return_str VARCHAR ( 255 ) DEFAULT '';
    DECLARE
        i INT DEFAULT 0;
    WHILE
            i < n DO
            SET return_str = CONCAT(
                return_str,
            SUBSTRING( chars_str, FLOOR( 1+RAND ()* 52 ), 1 ));
        SET i = i + 1;
    END WHILE;
    RETURN return_str;
END // 
DELIMITER ;
```
随机中文函数
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_address ;
CREATE FUNCTION rand_address ( n INT ) RETURNS VARCHAR ( 255 ) BEGIN
    DECLARE
        chars_str VARCHAR ( 100 ) DEFAULT '京津晋湘赣沪渝冀台辽吉黑苏浙皖闽鲁豫鄂青粤琼川黔滇陕甘';
    DECLARE
        return_str VARCHAR ( 255 ) DEFAULT '';
    DECLARE
        i INT DEFAULT 0;
    WHILE
            i < n DO
            SET return_str = CONCAT(
                return_str,
            SUBSTRING( chars_str, FLOOR( 1+RAND ()* 27 ), 1 ));
        SET i = i + 1;
    END WHILE;
    RETURN return_str;
END // 
DELIMITER ;
```
随机时间
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_date;
CREATE  FUNCTION  rand_date ( n YEAR ) RETURNS varchar(255) CHARSET utf8mb4
BEGIN
declare Date VARCHAR(255) default '';
    set Date=CONCAT(n,'-',
                    lpad(floor(2 + (rand() * 11)),2,0),'-',
                    lpad(floor(3 + (rand() * 20)),2,0),' ',
        lpad(floor(2 + (rand() * 11)),2,0),':',
        lpad(floor((rand() * 60)),2,0),':',
        lpad(floor((rand() * 60)),2,0));
    RETURN Date;
END // 
DELIMITER ;
```
随机区间数字
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_num;
CREATE FUNCTION rand_num (from_num DECIMAL ( 10, 2 ) ,to_num DECIMAL ( 10, 2 )) RETURNS DECIMAL ( 10, 2 )
BEGIN
    DECLARE i DOUBLE DEFAULT 0;
        SET i = from_num +RAND()*(to_num - from_num+1);
    RETURN i;
END//
DELIMITER ;
```
随机电话号码
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_phone ;
CREATE FUNCTION rand_phone ( ) RETURNS CHAR ( 11 ) DETERMINISTIC BEGIN
    DECLARE
        head VARCHAR ( 100 ) DEFAULT '000,156,136,176,159';
    DECLARE
        content CHAR ( 10 ) DEFAULT '0123456789';
    DECLARE
        phone CHAR ( 11 ) DEFAULT substring( head, 1+ ( FLOOR( 1 + ( RAND() * 3 ))* 4 ), 3 );
    DECLARE
        i INT DEFAULT 1;
    DECLARE
        len INT DEFAULT LENGTH( content );
    WHILE
            i < 9 DO
            SET i = i + 1;
        SET phone = CONCAT(
            phone,
        substring( content, floor( 1 + RAND() * len ), 1 ));
    END WHILE;
    RETURN phone;

END // 
DELIMITER ;
```
查看创建的所有函数
```sql
greatsql> SHOW FUNCTION STATUS LIKE 'rand%' \G 
```
### 创建存储过程
创建存储过程插入数据
```sql
DELIMITER //
CREATE PROCEDURE insert_t1(max_num INT )
BEGIN
    DECLARE i INT DEFAULT 0;
        SET autocommit = 0; #设置手动提交事务
    REPEAT #循环
        SET i = i + 1; #赋值
        INSERT INTO t1 (Name, Address ,Telephone,Date ,Money ) VALUES (rand_string(3),rand_address(1),rand_phone ( ) ,rand_date(2022),rand_num(2000.10,10000.99));
        UNTIL i = max_num
    END REPEAT;
    COMMIT; #提交事务
END //
DELIMITER ;
```
执行存储过程，插入1000条数据
```sql
greatsql> CALL insert_t1(1000);
Query OK, 0 rows affected (0.01 sec)
```
查看表数据生成情况，截选部分数据
```sql
greatsql> SELECT * FROM t1 LIMIT 10;
+----+------+---------+-------------+---------------------+---------+
| Id | Name | Address | Telephone   | Date                | Money   |
+----+------+---------+-------------+---------------------+---------+
|  1 | The  | 甘      | 17654682642 | 2022-03-19 09:05:20 | 5256.30 |
|  2 | bTr  | 京      | 15655191930 | 2022-11-12 10:25:45 | 6270.81 |
|  3 | urC  | 鄂      | 17694513016 | 2022-02-22 10:01:45 | 7704.54 |
|  4 | ptZ  | 粤      | 17639827083 | 2022-02-10 09:05:30 | 4149.96 |
|  5 | Qpa  | 沪      | 17688467081 | 2022-03-07 10:20:17 | 5551.59 |
|  6 | rqD  | 滇      | 17679469761 | 2022-12-09 10:44:28 | 3032.83 |
|  7 | lLX  | 闽      | 17621132376 | 2022-12-19 04:44:59 | 7968.58 |
|  8 | NDB  | 甘      | 15656832999 | 2022-11-14 04:31:54 | 9281.44 |
|  9 | SAZ  | 苏      | 15619376859 | 2022-04-05 03:21:16 | 4539.28 |
| 10 | NTd  | 青      | 13612036377 | 2022-04-06 02:53:14 | 5946.22 |
+----+------+---------+-------------+---------------------+---------+
10 rows in set (0.00 sec)
```
查看表内数据量情况
```sql
greatsql> SELECT COUNT(*) FROM t1;
+----------+
| COUNT(*) |
+----------+
|     1000 |
+----------+
1 row in set (0.02 sec)
```
### 删除函数
查看创建的所有函数
```sql
greatsql> SHOW FUNCTION STATUS LIKE 'rand%' \G 
```
删除函数
```sql
greatsql> DROP FUNCTION rand_string;
```

**问题反馈**
---



**联系我们**
---

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
