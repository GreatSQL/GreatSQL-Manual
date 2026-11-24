# Generating Random Test Data

This section describes how to generate random test data for the GreatSQL database with **mysql_random_data_load**, a Shell script, and stored procedures/functions.

The sample databases have already been installed in the [overview chapter](./12-dev-guide.md). If you need to generate additional test data, refer to this section.

## Generating Random Data with mysql_random_data_load

**mysql_random_data_load** is a random data generation tool for MySQL/GreatSQL developed in Go. The compiled binary can be downloaded directly from the link below.

> [https://github.com/Percona-Lab/mysql_random_data_load](https://github.com/Percona-Lab/mysql_random_data_load)

After downloading, extract it to any directory:

```bash
$ tar -xvzf mysql_random_data_load_0.1.12_Linux_x86_64.tar.gz

$ ls
LICENSE  mysql_random_data_load  README.md
```
Verify that it works:
```bash
$ ./mysql_random_data_load --help

usage: mysql_random_data_loader [<flags>] <database> <table> <rows>
MySQL Random Data Loader
......omitted below
```
`mysql_random_data_load` loads (inserts) "n" records into the source table and fills it with random data according to the data types. So this tool does not require predefined table columns or data types like sysbench does. It inserts data into the table according to the column data types. Therefore, random data can be generated to meet customized requirements. A table can have any number of columns of different data types, and this tool generates and inserts data according to the data type of each column.

- If a field is shorter than 10 characters, the program generates a random "first name".
- If a field is longer than 10 and shorter than 30 characters, the program generates a random "full name".
- If a field is longer than 30 characters, the program generates a "lorem ipsum" paragraph of at most 100 characters.
- The program can detect whether a field accepts NULL, and if so, it randomly generates NULL (about 10% of the values).

### Generating Random Data

Enter the database and create a table named t3 in the test_db schema.
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
```

To generate 100K random rows, simply run:
```bash
$ ./mysql_random_data_load test_db t3 100000 --user=root --password=root

INFO[2024-05-08T17:07:49+08:00] Starting                                     
   0s [====================================================================] 100%
INFO[2024-05-08T17:07:49+08:00] 100000 rows inserted   
```
- `test_db`: the database name
- `t3`: the table name
- `100000`: the number of rows to insert
- `--user=root`: the user name
- `--password=root`: the password

`mysql_random_data_load` does not care which columns the table has; it fills them all automatically.

The generated random data is shown below.
```sql
greatsql> SELECT * FROM t3 LIMIT 1\G
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

## Generating Random Data with a Shell Script

You can also write your own script to generate random data: use a Shell script to generate a number of INSERT statements and then import them into the database for execution.

### Creating a Test Table
First, create a table named `test_shell` in the database.

```sql
CREATE TABLE `test_shell` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(20) DEFAULT NULL,
    `age` int(10) DEFAULT NULL,
    `gender` varchar(10) DEFAULT NULL,
    `address` varchar(100) DEFAULT NULL,
    `phone` varchar(15) DEFAULT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### Creating a Shell Script File

Use the `vi` or `vim` editor to create a new Shell script file.

```bash
vim random_data.sh
```
### Writing the Shell Script
After entering the file, press `i`; `--- INSERT ---` appears in the lower left corner, indicating that you are in edit mode. Then enter or paste the following content.
```ini
#!/bin/bash  
  
# Set the path and name of the output file  
output_file="insert_sql.sql"  
  
# Clear the output file  
> "$output_file"  
  
# Table name  
table_name="test_shell"  
 
# Generate a random name (using English letters only)  
function generate_random_name() {  
    local length=4  
    local name=""  
    for (( i=0; i<$length; i++ )); do  
        # Use RANDOM to generate a random number between 0 and 25, corresponding to lowercase letters in the ASCII table  
        char=$((RANDOM%26+97))  
        # If this is the first character, convert it to uppercase (in ASCII, the uppercase and lowercase letters differ by 32)  
        if [ $i -eq 0 ]; then  
            char=$((char-32))  
        fi  
        name+="$(printf \\$(printf '%o' $char))"  # Use printf to convert the ASCII code into a character  
    done  
    echo "$name"
}  

# Generate a random age (assumed to be between 18 and 100 here)  
function generate_random_age() {  
    echo $((RANDOM%83+18))  
}  
  
# Generate a random gender (male or female)  
function generate_random_gender() {  
    if [ $((RANDOM%2)) -eq 0 ]; then  
        echo "男"  
    else  
        echo "女"  
    fi  
}  
  
# Generate a random address (a random string only)  
function generate_random_address() {  
    local length=10  
    local address=""  
    for (( i=0; i<$length; i++ )); do  
        address+=$((RANDOM%26+97))  # ASCII codes 97-122 correspond to a-z  
    done  
    echo "地址${address}"  
}  
  
# Generate a random phone number (11 digits only)  
function generate_random_phone() {  
    echo $((RANDOM%90000000000+10000000000))  
}  
  
-- Set how many rows to generate here; we generate 100 rows in this example
for i in {1..100}; do  
    name=$(generate_random_name)  
    age=$(generate_random_age)  
    gender=$(generate_random_gender)  
    address=$(generate_random_address)  
    phone=$(generate_random_phone)  
      
    # Because ID is auto-increment, use the loop variable $i directly, assuming it starts from 1  
    echo "INSERT INTO $table_name (id, name, age, gender, address, phone) VALUES ($i, '$name', $age, '$gender', '$address', '$phone');" >> "$output_file"  
done  
  
echo "Insert语句已生成并保存到$output_file文件中"
```

Press `Esc` to exit insert mode, then type `:wq` to save the file and quit.

### Running the Shell Script

Run the Shell script with the `sh` command to generate the INSERT statements.
```bash
$ sh random_data.sh 
Insert语句已生成并保存到insert_sql.sql文件中
```
### Viewing the Generated INSERT Statements

Use the `tail` command to view the generated file of INSERT statements; part of the content is shown below:
```bash
$ tail -n 5 insert_sql.sql

INSERT INTO test_shell (id, name, age, gender, address, phone) VALUES (96, 'Ohky', 65, '男', '地址102105105979711110397105110', '10000016611');
INSERT INTO test_shell (id, name, age, gender, address, phone) VALUES (97, 'Tydx', 50, '男', '地址10311712012111110110410910697', '10000010900');
INSERT INTO test_shell (id, name, age, gender, address, phone) VALUES (98, 'Wsrs', 18, '女', '地址112119114106101122118116102104', '10000011526');
INSERT INTO test_shell (id, name, age, gender, address, phone) VALUES (99, 'Knyh', 25, '男', '地址10010511811011610910612297104', '10000011057');
INSERT INTO test_shell (id, name, age, gender, address, phone) VALUES (100, 'Mwsd', 51, '女', '地址103971031209811411197101113', '10000003984');
```
### Importing the Data
After the `insert_sql.sql` file is generated, import it into the `test_db` schema in GreatSQL.
```bash
mysql -uroot -pGreatSQL@2024 test_db < /data/insert_sql.sql
```
View the data in the test_shell table of the test_db schema:
```bash
$ mysql -uroot -pGreatSQL@2024  -e 'SELECT COUNT(*) FROM test_db.test_shell;'
+----------+
| count(*) |
+----------+
|      100 |
+----------+
```
### Notes
1. When generating INSERT statements, pay attention to the table name, column names, and data types; otherwise the generated INSERT statements cannot be executed.
2. Before running the Shell script or inserting data into the GreatSQL database, check the resource usage of the relevant servers in advance to avoid failed inserts or performance degradation caused by insufficient resources. If resources are insufficient, import the data in batches.

## Generating Random Data with Stored Procedures
### Creating a Table

Create a table named test_book.
```sql
CREATE TABLE IF NOT EXISTS `test_book`(
  `bookid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `card`INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`bookid`)
);
```
### Defining a Stored Procedure

Now we can define a stored procedure to insert data. For example, define a stored procedure named INSERT_DATA and call it with `CALL` to insert random numbers.


```sql
DROP PROCEDURE IF EXISTS INSERT_DATA ;
DELIMITER //
CREATE PROCEDURE INSERT_DATA()   
  BEGIN  
    DECLARE n INT DEFAULT 1;
    -- 20 statements are generated here; modify this number to generate more rows  
    WHILE n < 21 DO  
      INSERT INTO test_book(card) VALUES (FLOOR(1 + (RAND() * 20)));  
      SET n = n + 1;  
    END WHILE;  
  END //
DELIMITER ;
```

### Calling the Stored Procedure
You can insert data by calling the INSERT_DATA stored procedure.
```sql
CALL INSERT_DATA();
```
### Viewing the Data
View the data in the test_book table; you can see that 20 random numbers have been generated.
```sql
greatsql> SELECT COUNT(*) FROM test_book;
+----------+
| COUNT(*) |
+----------+
|       20 |
+----------+
1 row in set (0.00 sec)
```
### Dropping the Stored Procedure
If the stored procedure is no longer needed, you can drop it with `DROP PROCEDURE`.
```sql
DROP PROCEDURE INSERT_DATA;
```

## Generating Random Data with Stored Procedures and Functions

### Creating a Table

Create a table named t1 to store the random data.
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
### Creating Functions

Function creation must be enabled first; otherwise an error is reported when a function is created.
```sql
SET GLOBAL log_bin_trust_function_creators = 1;
```
Random string function
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_string ;
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

Random Chinese character function
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

Random time
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_date ;
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

Random number in a range
```sql
DELIMITER //
DROP FUNCTION IF EXISTS rand_num ;
CREATE FUNCTION rand_num (from_num DECIMAL ( 10, 2 ),to_num DECIMAL ( 10, 2 )) RETURNS DECIMAL ( 10, 2 )
BEGIN
    DECLARE i DOUBLE DEFAULT 0;
        SET i = from_num +RAND()*(to_num - from_num+1);
    RETURN i;
END//
DELIMITER ;
```

Random phone number
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

View all created functions
```sql
SHOW FUNCTION STATUS LIKE 'rand%' \G 
```
### Creating a Stored Procedure
Create a stored procedure to insert data.
```sql
DELIMITER //
CREATE PROCEDURE insert_t1(max_num INT )
BEGIN
    DECLARE i INT DEFAULT 0;
        SET autocommit = 0; # Set manual transaction commit
    REPEAT # Loop
        SET i = i + 1; # Assignment
        INSERT INTO t1 (Name, Address,Telephone,Date,Money ) VALUES (rand_string(3),rand_address(1),rand_phone ( ),rand_date(2022),rand_num(2000.10,10000.99));
        UNTIL i = max_num
    END REPEAT;
    COMMIT; # Commit the transaction
END //
DELIMITER ;
```
Execute the stored procedure to insert 1,000 rows.
```sql
greatsql> CALL insert_t1(1000);
Query OK, 0 rows affected (0.01 sec)
```

View the generated table data; part of the data is shown below.
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

View the number of rows in the table.
```sql
greatsql> SELECT COUNT(*) FROM t1;
+----------+
| COUNT(*) |
+----------+
|     1000 |
+----------+
1 row in set (0.02 sec)
```
### Dropping Functions
View all created functions
```sql
SHOW FUNCTION STATUS LIKE 'rand%' \G 
```
Drop the function
```sql
DROP FUNCTION rand_string;
```

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
