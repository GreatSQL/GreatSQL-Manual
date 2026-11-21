# Character Sets & Collations
---

## GreatSQL Character Sets

Before GreatSQL 8.0, the default character set was `latin1`, and the `utf8` character set pointed to `utf8mb3`. Developers often changed the encoding to the `utf8` character set when designing a database. If they forgot to change the default encoding, garbled characters would appear. Starting from GreatSQL 8.0, the default encoding of the database is changed to `utf8mb4`, which avoids the garbled character problem described above.

### Viewing the Character Set in Use

GreatSQL character sets and collations work at four levels: server level, database level, table level, and column level.

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

- `character_set_server`: the character set at server level

- `character_set_database`: the character set of the current database

- `character_set_client`: the character set used by the server when decoding requests

- `character_set_connection`: when processing requests, the server converts the request string from `character_set_client` to `character_set_connection`

- `character_set_results`: the character set used by the server when returning data to the client

### Server Level (server)

Expressed by two system variables: `character_set_server` and `collation_server`. These two variables can be modified through startup options when starting the server program, or through the set statement while the program is running. For example, configured in the configuration file:

```ini
 [mysqld]
 character_set_server=utf8mb4  
 collation_server=utf8mb4_bin
```

### Database Level (database)

Expressed by two system variables: `character_set_database` and `collation_database`. These two variables cannot be modified directly; they can only be modified with the create database or alter database statement. Whichever database is selected with use, the `character_set_database` and `collation_database` queried are the default character set and collation of the current database. Modifying these two variables produces a warning, and they will become read-only variables in a future version. If the create database statement does not specify a character set, the server-level setting is used.

The corresponding statements:

```sql
CREATE/ALTER database database_name [CHARACTER SET charset_name][COLLATE collation_name];
```

For example:
```sql
CREATE DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;

ALTER DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

### Table Level

Specified when creating and modifying a table. Different tables in the same database can use different character sets. If the create table statement does not specify a character set and collation, the character set and collation of the database in which the table resides are used.

The corresponding statements:

```sql
CREATE TABLE table_name(column_info)
[CHARACTER SET charset_name][COLLATE collation_name];

ALTER TABLE table_name
[CHARACTER SET charset_name][COLLATE collation_name];
```

For example:
```sql
CREATE TABLE t1(id int, 
  c1 varchar(30)) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;

ALTER TABLE t1 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

Note that the character set and the collation are associated with each other. If only the character set is specified when modifying, the collation also changes to the default collation of the modified character set. If only the collation is specified, the character set also changes to the character set corresponding to the collation. In this sense, specifying only the collation is enough.

Modifying the default character set of a table only affects columns added later; the collation of existing columns remains unchanged.

### Column Level

For columns that store strings, different columns in the same table can have different character sets and collations. You can specify the character set and collation of a column when creating or modifying the column information. If they are not specified when creating or modifying a column, the character set and collation of the table are used.

The corresponding statements:

```sql
CREATE TABLE table_name(column_name string_type [CHARACTER SET charset_name] [COLLATE collation_name], other_columns...);
ALTER TABLE table_name MODIFY column_name string_type [CHARACTER SET charset_name] [COLLATE collation_name];
```

Note the following when modifying column information: if the character set is not specified when modifying a column, the character set and collation of the table are used even if a character set was specified when the column was created. If the modified column character set cannot represent the data stored in the column, an error is reported.

**Modifying the Character Set in Version 5.7**

In GreatSQL 5.7, you can add the character set configuration to the `my.cnf` configuration file and then restart the server.

```ini
[mysqld]
character_set_server=utf8
```

::: tip Tip
However, the settings of the existing databases and tables do not change; the parameter modification only takes effect for newly created databases.
:::

In GreatSQL 5.7, the character set of previously created databases and tables is still `latin1`.

Modifying the character set of an existing database:

```sql
ALTER DATABASE db_name CHARACTER SET 'utf8';
```

Modifying the character set of an existing table:

```sql
ALTER TABLE table_name CONVERT TO CHARACTER SET 'utf8';
```

## Introduction to Character Sets

Computers store only binary data, and decimal numbers can be converted to binary. To convert strings to binary data, a mapping relationship is needed: converting characters to binary is called encoding, and converting binary to characters is called decoding. This is actually the concept of a character set, which describes the encoding rules for a certain range of characters. Different character sets contain different ranges of characters.

Some important character sets are introduced below.

### ASCII Character Set

It contains 128 characters in total, including spaces, punctuation marks, digits, upper- and lower-case letters, and some non-printable characters. Non-printable characters mainly refer to control characters (such as line feed and carriage return) and communication characters (such as SOH at the beginning of a message and EOT at the end of a message). The ASCII character set has 128 characters in total, which can be encoded with 1 byte.

### ISO8859-1 Character Set

It contains 256 characters in total, that is, the ASCII character set extended with another 128 common Western European characters (including German and French letters). The ISO8859-1 character set can also be encoded with 1 byte. This character set also has an alias, Latin1.

### GB2312 Character Set

It includes Chinese characters as well as Latin letters, Greek letters, Japanese hiragana and katakana letters, and Russian Cyrillic letters. It contains 6,763 Chinese characters and 682 other text symbols. This character set is compatible with the ASCII character set, so if a character is in the ASCII character set, 1-byte encoding is used; otherwise, 2-byte encoding is used.

### GBK Character Set

GBK extends the GB2312 character set, and its encoding scheme is compatible with the GB2312 character set. Like the GB2312 character set, if a character is in the ASCII character set, 1-byte encoding is used; otherwise, 2-byte encoding is used.

### UTF-8 Character Set

It covers almost all characters used in countries and regions around the world, and is still being extended. This character set is compatible with the ASCII character set and uses variable-length encoding: encoding one character requires 1 to 4 bytes. Usually, one Chinese character is encoded with 3 bytes, and one letter is encoded with 1 byte. UTF-8 is one encoding scheme of Unicode; there are also UTF-16 and UTF-32 encoding schemes.

As can be seen, the ISO8859-1, GB2312, GBK, and UTF-8 character sets all include the ASCII character set, GBK includes the GB2312 character set, and the characters covered by UTF-8 include those of GBK, GB2312, and ISO8859-1, but their encoding rules are different.

For example, the encoding of the Chinese character `我` (meaning "I"): in GBK the encoding is 1100111011010010, while in UTF-8 it is 111001101000100010010001.

## Character Set Collations

You can view the supported collations with the statement `show collation [like pattern] `. The data comes from the table `information_schema.collations`.

Each character set has several collations.

```sql
greatsql> SHOW COLLATION LIKE 'utf8mb4%';
+----------------------------+---------+-----+---------+----------+---------+---------------+
| Collation                  | Charset | Id  | Default | Compiled | Sortlen | Pad_attribute |
+----------------------------+---------+-----+---------+----------+---------+---------------+
| utf8mb4_0900_ai_ci         | utf8mb4 | 255 | Yes     | Yes      |       0 | NO PAD        |
| utf8mb4_0900_as_ci         | utf8mb4 | 305 |         | Yes      |       0 | NO PAD        |
| utf8mb4_0900_as_cs         | utf8mb4 | 278 |         | Yes      |       0 | NO PAD        |
......omitted in the middle
| utf8mb4_vi_0900_as_cs      | utf8mb4 | 300 |         | Yes      |       0 | NO PAD        |
| utf8mb4_zh_0900_as_cs      | utf8mb4 | 308 |         | Yes      |       0 | NO PAD        |
+----------------------------+---------+-----+---------+----------+---------+---------------+
89 rows in set (0.00 sec)
```

There are 89 collations for utf8mb4. The naming rules of collations are also regular: they start with the name of the character set, followed by the suffixes `_ai`, `_as`, `_ci`, `_cs`, and `_bin`. The meanings of these suffixes are as follows:

| Suffix | English meaning    | Description                     |
| :----- | :----------------- | :------------------------------ |
| _ai    | accent insensitive | Accents are not distinguished   |
| _as    | accent sensitive   | Accents are distinguished       |
| _ci    | case insensitive   | Letter case is not distinguished|
| _cs    | case sensitive     | Letter case is distinguished    |
| _bin   | binary             | Compared in binary form         |

## How to Choose the Right Character Set
1. Meet the language requirements of the application. If the application has to handle all kinds of text, or will be released to countries or regions using different languages, `utf8mb4` should be chosen
2. If existing data has to be imported, fully consider the compatibility of the database character set with the existing data
3. If the database needs to support ordinary Chinese text with a large amount of data and high performance requirements, choose a double-byte fixed-length Chinese character set such as GBK
4. If the character set requires a large number of character operations, such as sorting and comparison, a fixed-length character set may be a better choice, because fixed-length character sets are processed faster than variable-length character sets
5. If all client programs support the same character set, that character set should be preferred as the database character set. This avoids the performance overhead and data loss caused by character set conversion

## Garbled Character (Mojibake) Issues
1. The client does not correctly set the client character set, so the original SQL statement is converted to the character set specified by connection. Such conversion loses information: if client is in utf8 and the conversion is to gb2312, information will definitely be lost, while the reverse does not lose information. Make sure that the character set of connection is a superset of the client character set so that no information is lost during conversion.

2. The database character set is not set correctly. If the database character set is set incorrectly, converting the connection character set to the database character set will likewise lose the encoding, for the same reason as above.

3. To ensure that no garbled characters appear, the three system variables `character_set_client`, `character_set_connection`, and `character_set_result` should be the same as the default character sets of the client, database, table, and column, that is, all character sets should be unified.

Example of a garbled character problem:

The character set encoding of the operating system
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
The character encodings of the three database system variables are consistent
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
Next, test the garbled characters
```sql
greatsql> SELECT _utf8'GreatSQL社区';
+----------------+
| GreatSQL社区   |
+----------------+
| GreatSQL社区   |
+----------------+
1 row in set, 1 warning (0.00 sec)

greatsql> SELECT _gbk'GreatSQL社区';
+-------------------+
| GreatSQL绀惧尯    |
+-------------------+
| GreatSQL绀惧尯    |
+-------------------+
1 row in set (0.01 sec)
```

1. When the client sends the request, the characters `GreatSQL 社区 ` (`社区` means "community") are encoded as utf8. The English part is not affected, but the Chinese ` 社区 ` is encoded as `&#x793E;&#x533A;`

2. After the server receives the request and finds the prefix `_gbk`, it does not convert the following bytes `&#x793E;&#x533A;` from `character_set_client` to `character_set_connection`, but directly treats `&#x793E;&#x533A;` as a byte sequence obtained by encoding some string in gbk.

3. Then it converts the above `&#x793E;&#x533A;` from gbk to `character_set_results`, that is, utf8. `&#x793E;&#x533A;` stands for the Chinese characters ` 绀惧尯` in gbk.

## Further Reading

- [Summary of GreatSQL character sets](https://mp.weixin.qq.com/s/RERq6735UnbF8ZEmrD3AAw)


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
