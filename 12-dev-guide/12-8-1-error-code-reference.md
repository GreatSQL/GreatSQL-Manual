# 常见错误码对照表

本章介绍GreatSQL常见报错错误码

## 错误号1000~1887

</br>

- 错误号：1002; 符号： ER_NO; SQLSTATE： HY000

用于构建其他消息。


</br>

- 错误号：1003; 符号： ER_YES; SQLSTATE： HY000

用于构建其他消息。

扩展EXPLAIN格式生成注释消息。

在后续输出中的这些消息ER_YES的Code列中使用SHOW WARNINGS。


</br>

- 错误号：1004; 符号： ER_CANT_CREATE_FILE; SQLSTATE： HY000

报错信息格式：无法创建文件'％s'（错误号：％d-％s）。

由于无法创建或复制某些操作所需的文件而发生。

可能的原因：源文件的权限问题；目标文件已存在，但不可写。


</br>

- 错误号：1005; 符号： ER_CANT_CREATE_TABLE; SQLSTATE： HY000

报错信息格式：无法创建表'％s'（错误号：％d-％s）。

InnoDB无法创建表时报告此错误。

如果错误消息涉及错误150，则表创建失败，因为 未正确形成外键约束。

如果错误消息指示错误-1，则表创建可能失败，因为该表包含与内部InnoDB表名称匹配的列名称。

</br>

- 错误号：1006; 符号： ER_CANT_CREATE_DB; SQLSTATE： HY000

报错信息格式：无法创建数据库'％s'（错误号：％d-％s）。


</br>

- 错误号：1007; 符号： ER_DB_CREATE_EXISTS; SQLSTATE： HY000

报错信息格式：无法创建数据库“％s”；数据库存在。

尝试创建数据库失败，因为该数据库已经存在。

如果您确实要替换现有数据库，请先删除数据库，或者如果要保留现有数据库而不使该语句产生错误，请在该语句中添加一个IF NOT EXISTS子句 CREATE DATABASE。


</br>

- 错误号：1008; 符号： ER_DB_DROP_EXISTS; SQLSTATE： HY000

报错信息格式：无法删除数据库'％s'; 数据库不存在。

</br>

- 错误号：1010; 符号： ER_DB_DROP_RMDIR; SQLSTATE： HY000

报错信息格式：删除数据库时出错（无法rmdir'％s'，错误号：％d-％s）。

</br>

- 错误号：1012; 符号： ER_CANT_FIND_SYSTEM_REC; SQLSTATE： HY000

报错信息格式：无法读取系统表中的记录。

InnoDB如果尝试访问 InnoDB INFORMATION_SCHEMA 表InnoDB不可用，则 返回。

</br>

- 错误号：1013; 符号： ER_CANT_GET_STAT; SQLSTATE： HY000

报错信息格式：无法获取“％s”的状态（错误号：％d-％s）。

</br>

- 错误号：1015; 符号： ER_CANT_LOCK; SQLSTATE： HY000

报错信息格式：无法锁定文件（错误号：％d-％s）。


</br>

- 错误号：1016; 符号： ER_CANT_OPEN_FILE; SQLSTATE： HY000

报错信息格式：无法打开文件：'％s'（错误号：％d-％s）。

InnoDB当找不到InnoDB 数据文件中的表时，报告此错误。


</br>

- 错误号：1017; 符号： ER_FILE_NOT_FOUND; SQLSTATE： HY000

报错信息格式：找不到文件：'％s'（错误号：％d-％s）。


</br>

- 错误号：1018; 符号： ER_CANT_READ_DIR; SQLSTATE： HY000

报错信息格式：无法读取“％s”的目录（错误号：％d-％s）。


</br>

- 错误号：1020; 符号： ER_CHECKREAD; SQLSTATE： HY000

报错信息格式：自上次读取表'％s'以来，记录已更改。


</br>

- 错误号：1022; 符号： ER_DUP_KEY; SQLSTATE： 23000

报错信息格式：不会写；表'％s'中的重复键。

</br>

- 错误号：1024; 符号： ER_ERROR_ON_READ; SQLSTATE： HY000

报错信息格式：读取文件'％s'时出错（错误号：％d-％s）。


</br>

- 错误号：1025; 符号： ER_ERROR_ON_RENAME; SQLSTATE： HY000

报错信息格式：将“％s”重命名为“％s”时出错（错误号：％d-％s）。


</br>

- 错误号：1026; 符号： ER_ERROR_ON_WRITE; SQLSTATE： HY000

报错信息格式：写入文件'％s'时出错（错误号：％d-％s）。


</br>

- 错误号：1027; 符号： ER_FILE_USED; SQLSTATE： HY000

报错信息格式：'％s'被锁定，无法更改。


</br>

- 错误号：1028; 符号： ER_FILSORT_ABORT; SQLSTATE： HY000

报错信息格式：排序已中止。

ER_FILSORT_ABORT 在8.0.18之后被删除。


</br>

- 错误号：1030; 符号： ER_GET_ERRNO; SQLSTATE： HY000

报错信息格式：出现错误％d-来自存储引擎的'％s'。

检查该%d值以查看操作系统错误的含义。

例如，28表示您已用完磁盘空间。


</br>

- 错误号：1031; 符号： ER_ILLEGAL_HA; SQLSTATE： HY000

报错信息格式：“％s”的表存储引擎没有此选项。


</br>

- 错误号：1032; 符号： ER_KEY_NOT_FOUND; SQLSTATE： HY000

报错信息格式：在“％s”中找不到记录。


</br>

- 错误号：1033; 符号： ER_NOT_FORM_FILE; SQLSTATE： HY000

报错信息格式：文件“％s”中的信息不正确。


</br>

- 错误号：1034; 符号： ER_NOT_KEYFILE; SQLSTATE： HY000

报错信息格式：表'％s'的密钥文件不正确；尝试修复它。


</br>

- 错误号：1035; 符号： ER_OLD_KEYFILE; SQLSTATE： HY000

报错信息格式：表'％s'的旧密钥文件；修复它。


</br>

- 错误号：1036; 符号： ER_OPEN_AS_READONLY; SQLSTATE： HY000

报错信息格式：表'％s'是只读的。


</br>

- 错误号：1037; 符号： ER_OUTOFMEMORY; SQLSTATE： HY001
信息：内存不足；重新启动服务器，然后重试（需要％d字节）。


</br>

- 错误号：1038; 符号： ER_OUT_OF_SORTMEMORY; SQLSTATE： HY001

报错信息格式：内存不足，请考虑增加服务器排序缓冲区的大小。


</br>

- 错误号：1040; 符号： ER_CON_COUNT_ERROR; SQLSTATE： 08004


报错信息格式：连接过多。


</br>

- 错误号：1041; 符号： ER_OUT_OF_RESOURCES; SQLSTATE： HY000


报错信息格式：内存不足；检查mysqld或其他进程是否使用了所有可用内存；如果不是，则可能必须使用“ulimit”来允许mysqld使用更多的内存，或者可以添加更多的交换空间。


</br>

- 错误号：1042; 符号： ER_BAD_HOST_ERROR; SQLSTATE： 08S01


报错信息格式：无法获取您的地址的主机名。


</br>

- 错误号：1043; 符号： ER_HANDSHAKE_ERROR; SQLSTATE： 08S01


报错信息格式：握手报错。


</br>

- 错误号：1044; 符号： ER_DBACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：拒绝用户'％s'@'％s'访问数据库'％s'。


</br>

- 错误号：1045; 符号： ER_ACCESS_DENIED_ERROR; SQLSTATE： 28000

报错信息格式：拒绝访问用户'％s'@'％s'（使用密码：％s）。


</br>

- 错误号：1046; 符号： ER_NO_DB_ERROR; SQLSTATE： 3D000

报错信息格式：未选择数据库。

</br>

- 错误号：1047; 符号： ER_UNKNOWN_COM_ERROR; SQLSTATE： 08S01

报错信息格式：未知命令。

</br>

- 错误号：1048; 符号： ER_BAD_NULL_ERROR; SQLSTATE： 23000

报错信息格式：列'％s'不能为空。

</br>

- 错误号：1049; 符号： ER_BAD_DB_ERROR; SQLSTATE： 42000

报错信息格式：未知数据库'％s'。

</br>

- 错误号：1050; 符号： ER_TABLE_EXISTS_ERROR; SQLSTATE： 42S01

报错信息格式：表'％s'已经存在。

</br>

- 错误号：1051; 符号： ER_BAD_TABLE_ERROR; SQLSTATE： 42S02

报错信息格式：未知表'％s'。

</br>

- 错误号：1052; 符号： ER_NON_UNIQ_ERROR; SQLSTATE： 23000

报错信息格式：％s中的列'％s'不明确。

%s = column name

%s = location of column (for example, "field list")

可能的原因：查询中没有适当限定的列出现在选择列表或ON子句中。

例子：
```sql
mysql> SELECT i FROM t INNER JOIN t AS t2;
ERROR 1052 (23000): Column 'i' in field list is ambiguous
mysql> SELECT * FROM t LEFT JOIN t AS t2 ON i = i;
ERROR 1052 (23000): Column 'i' in on clause is ambiguous
```

解析度：

用适当的表名限定列：
```sql
mysql> SELECT t2.i FROM t INNER JOIN t AS t2;
```

修改查询以避免进行限定：
```sql
mysql> SELECT * FROM t LEFT JOIN t AS t2 USING (i);
```
</br>

- 错误号：1053; 符号： ER_SERVER_SHUTDOWN; SQLSTATE： 08S01

报错信息格式：服务器正在关闭。

</br>

- 错误号：1054; 符号： ER_BAD_FIELD_ERROR; SQLSTATE： 42S22

报错信息格式：“％s”中的未知列“％s”。

</br>

- 错误号：1055; 符号： ER_WRONG_FIELD_WITH_GROUP; SQLSTATE：42000

报错信息格式：“％s”不在GROUP BY中。

</br>

- 错误号：1056; 符号： ER_WRONG_GROUP_FIELD; SQLSTATE： 42000

报错信息格式：无法在“％s”上分组。

</br>

- 错误号：1057; 符号： ER_WRONG_SUM_SELECT; SQLSTATE： 42000

报错信息格式：语句在同一语句中具有求和函数和列。

</br>

- 错误号：1058; 符号： ER_WRONG_VALUE_COUNT; SQLSTATE： 21S01

报错信息格式：列计数与值计数不匹配。

</br>

- 错误号：1059; 符号： ER_TOO_LONG_IDENT; SQLSTATE： 42000

报错信息格式：标识符名称'％s'太长。

</br>

- 错误号：1060; 符号： ER_DUP_FIELDNAME; SQLSTATE： 42S21

报错信息格式：重复的列名'％s'。

</br>

- 错误号：1061; 符号： ER_DUP_KEYNAME; SQLSTATE： 42000

报错信息格式：重复的键名'％s'。

</br>

- 错误号：1062; 符号： ER_DUP_ENTRY; SQLSTATE： 23000

报错信息格式：键％d的条目'％s'重复。

返回此错误的消息使用的格式字符串 ER_DUP_ENTRY_WITH_KEY_NAME。


</br>

- 错误号：1063; 符号： ER_WRONG_FIELD_SPEC; SQLSTATE： 42000

报错信息格式：列'％s'的列说明符不正确。

</br>

- 错误号：1064; 符号： ER_PARSE_ERROR; SQLSTATE： 42000

报错信息格式：％s在第％d行靠近“％s”。

</br>

- 错误号：1065; 符号： ER_EMPTY_QUERY; SQLSTATE： 42000

报错信息格式：查询为空。

</br>

- 错误号：1066; 符号： ER_NONUNIQ_TABLE; SQLSTATE： 42000

报错信息格式：不是唯一的表/别名：'％s'。

</br>

- 错误号：1067; 符号： ER_INVALID_DEFAULT; SQLSTATE： 42000

报错信息格式：“％s”的默认值无效。

</br>

- 错误号：1068; 符号： ER_MULTIPLE_PRI_KEY; SQLSTATE： 42000

报错信息格式：定义了多个主键。

</br>

- 错误号：1069; 符号： ER_TOO_MANY_KEYS; SQLSTATE： 42000

报错信息格式：指定的密钥太多；允许的最大％d个键。

</br>

- 错误号：1070; 符号： ER_TOO_MANY_KEY_PARTS; SQLSTATE： 42000

报错信息格式：指定的关键部分太多；最多允许％d个零件。

</br>

- 错误号：1071; 符号： ER_TOO_LONG_KEY; SQLSTATE： 42000

报错信息格式：指定密钥太长；最大密钥长度为％d个字节。

</br>

- 错误号：1072; 符号： ER_KEY_COLUMN_DOES_NOT_EXITS; SQLSTATE：42000

报错信息格式：表中不存在键列'％s'。

</br>

- 错误号：1073; 符号： ER_BLOB_USED_AS_KEY; SQLSTATE： 42000

报错信息格式：BLOB列'％s'不能用于已使用表类型的键规范中。

</br>

- 错误号：1074; 符号： ER_TOO_BIG_FIELDLENGTH; SQLSTATE： 42000

报错信息格式：列长度对于列'％s'太大（最大值=％lu）；使用BLOB或TEXT代替。

</br>

- 错误号：1075; 符号： ER_WRONG_AUTO_KEY; SQLSTATE： 42000

报错信息格式：错误的表定义；只能有一个自动列，并且必须将其定义为键。

</br>

- 错误号：1076; 符号： ER_READY; SQLSTATE： HY000

报错信息格式：％s：已准备好进行连接。

版本：'％s'套接字：'％s'端口：％d

</br>

- 错误号：1077; 符号： ER_NORMAL_SHUTDOWN; SQLSTATE： HY000

报错信息格式：％s：正常关闭。

ER_NORMAL_SHUTDOWN 在8.0.4之后被删除。


</br>

- 错误号：1079; 符号： ER_SHUTDOWN_COMPLETE; SQLSTATE： HY000

报错信息格式：％s：关机完成。

</br>

- 错误号：1080; 符号： ER_FORCING_CLOSE; SQLSTATE： 08S01

报错信息格式：％s：强制关闭线程％ld用户：'％s'。

</br>

- 错误号：1081; 符号： ER_IPSOCK_ERROR; SQLSTATE： 08S01

报错信息格式：无法创建IP套接字。

</br>

- 错误号：1082; 符号： ER_NO_SUCH_INDEX; SQLSTATE： 42S12

报错信息格式：表'％s'没有类似于CREATE INDEX中使用的索引；重新创建表。

</br>

- 错误号：1083; 符号： ER_WRONG_FIELD_TERMINATORS; SQLSTATE：42000

报错信息格式：字段分隔符参数不是预期的；查看手册。

</br>

- 错误号：1084; 符号： ER_BLOBS_AND_NO_TERMINATED; SQLSTATE：42000

报错信息格式：您不能对BLOB使用固定的行长；请使用“字段终止于”。

</br>

- 错误号：1085; 符号： ER_TEXTFILE_NOT_READABLE; SQLSTATE：HY000

报错信息格式：文件'％s'必须在数据库目录中，或者所有人都可以读取。

</br>

- 错误号：1086; 符号： ER_FILE_EXISTS_ERROR; SQLSTATE： HY000

报错信息格式：文件“％s”已存在。

</br>

- 错误号：1087; 符号： ER_LOAD_INFO; SQLSTATE： HY000

报错信息格式：记录：％ld已删除：％ld跳过：％ld警告：％ld。

</br>

- 错误号：1088; 符号： ER_ALTER_INFO; SQLSTATE： HY000

报错信息格式：记录：％ld重复项：％ld。

</br>

- 错误号：1089; 符号： ER_WRONG_SUB_KEY; SQLSTATE： HY000

报错信息格式：不正确的前缀密钥；使用的密钥部分不是字符串，使用的长度比密钥部分长，或者存储引擎不支持唯一的前缀密钥。

</br>

- 错误号：1090; 符号： ER_CANT_REMOVE_ALL_FIELDS; SQLSTATE：42000

报错信息格式：您不能使用ALTER TABLE删除所有列；改用DROP TABLE。

</br>

- 错误号：1091; 符号： ER_CANT_DROP_FIELD_OR_KEY; SQLSTATE：42000

报错信息格式：不能删除'％s'; 检查列/键是否存在。

</br>

- 错误号：1092; 符号： ER_INSERT_INFO; SQLSTATE： HY000

报错信息格式：记录：％ld重复项：％ld警告：％ld。

</br>

- 错误号：1093; 符号： ER_UPDATE_TABLE_USED; SQLSTATE： HY000

报错信息格式：您无法在FROM子句中指定目标表'％s'用于更新。

如果尝试在单个语句中选择并修改同一表，则会发生此错误。

如果选择尝试发生在派生表中，则可以通过设置系统变量的derived_merge标志 optimizer_switch来强制将子查询具体化为临时表，从而有效地使它成为与修改后的表不同的表，从而避免此错误 。

请参见第8.2.2.4节“通过合并或实现来优化派生表，视图引用和公用表表达式”。


</br>

- 错误号：1094; 符号： ER_NO_SUCH_THREAD; SQLSTATE： HY000

报错信息格式：未知线程ID：％lu。

</br>

- 错误号：1095; 符号： ER_KILL_DENIED_ERROR; SQLSTATE： HY000

报错信息格式：您不是线程％lu的所有者。

</br>

- 错误号：1096; 符号： ER_NO_TABLES_USED; SQLSTATE： HY000

报错信息格式：未使用表。

</br>

- 错误号：1097; 符号： ER_TOO_BIG_SET; SQLSTATE： HY000

报错信息格式：％s列和SET的字符串太多。

</br>

- 错误号：1098; 符号： ER_NO_UNIQUE_LOGFILE; SQLSTATE： HY000

报错信息格式：无法生成唯一的日志文件名％s。（1-999）

</br>

- 错误号：1099; 符号： ER_TABLE_NOT_LOCKED_FOR_WRITE; SQLSTATE：HY000

报错信息格式：表'％s'被READ锁锁定，无法更新。

</br>

- 错误号：1100; 符号： ER_TABLE_NOT_LOCKED; SQLSTATE： HY000

报错信息格式：表'％s'没有被LOCK TABLES锁定。

</br>

- 错误号：1101; 符号： ER_BLOB_CANT_HAVE_DEFAULT; SQLSTATE：42000

报错信息格式：BLOB，TEXT，GEOMETRY或JSON列'％s'不能具有默认值。

</br>

- 错误号：1102; 符号： ER_WRONG_DB_NAME; SQLSTATE： 42000

报错信息格式：错误的数据库名称'％s'。

</br>

- 错误号：1103; 符号： ER_WRONG_TABLE_NAME; SQLSTATE： 42000

报错信息格式：不正确的表名'％s'。

</br>

- 错误号：1104; 符号： ER_TOO_BIG_SELECT; SQLSTATE： 42000

报错信息格式：SELECT将检查超过MAX_JOIN_SIZE行；检查您的WHERE并使用SET SQL_BIG_SELECTS = 1或SET MAX_JOIN_SIZE =＃（如果SELECT可以）。

</br>

- 错误号：1105; 符号： ER_UNKNOWN_ERROR; SQLSTATE： HY000
报错信息格式：未知错误。

</br>

- 错误号：1106; 符号： ER_UNKNOWN_PROCEDURE; SQLSTATE： 42000

报错信息格式：未知过程'％s'。

</br>

- 错误号：1107; 符号： ER_WRONG_PARAMCOUNT_TO_PROCEDURE; SQLSTATE：42000

报错信息格式：不正确的参数计数到过程'％s'。

</br>

- 错误号：1108; 符号： ER_WRONG_PARAMETERS_TO_PROCEDURE; SQLSTATE：HY000

报错信息格式：过程'％s'的参数不正确。

</br>

- 错误号：1109; 符号： ER_UNKNOWN_TABLE; SQLSTATE： 42S02

报错信息格式：％s中的未知表'％s'。

</br>

- 错误号：1110; 符号： ER_FIELD_SPECIFIED_TWICE; SQLSTATE：42000

报错信息格式：列“％s”指定了两次。

</br>

- 错误号：1111; 符号： ER_INVALID_GROUP_FUNC_USE; SQLSTATE：HY000

报错信息格式：无效使用组功能。

</br>

- 错误号：1112; 符号： ER_UNSUPPORTED_EXTENSION; SQLSTATE：42000

报错信息格式：表'％s'使用了此MySQL版本中不存在的扩展名。

</br>

- 错误号：1113; 符号： ER_TABLE_MUST_HAVE_COLUMNS; SQLSTATE：42000

报错信息格式：一个表必须至少有1列。

</br>

- 错误号：1114; 符号： ER_RECORD_FILE_FULL; SQLSTATE： HY000

报错信息格式：表'％s'已满。

InnoDB当系统表空间用完可用空间时，将报告此错误。

重新配置系统表空间以添加新的数据文件。


</br>

- 错误号：1115; 符号： ER_UNKNOWN_CHARACTER_SET; SQLSTATE：42000

报错信息格式：未知字符集：'％s'。

</br>

- 错误号：1116; 符号： ER_TOO_MANY_TABLES; SQLSTATE： HY000

报错信息格式：表太多；MySQL只能在联接中使用％d表。

</br>

- 错误号：1117; 符号： ER_TOO_MANY_FIELDS; SQLSTATE： HY000
报错信息格式：栏太多。

</br>

- 错误号：1118; 符号： ER_TOO_BIG_ROWSIZE; SQLSTATE： 42000

报错信息格式：行大小太大。

使用的表类型（不计BLOB）的最大行大小为％ld。

这包括存储开销，请查阅手册。

您必须将某些列更改为TEXT或BLOB

</br>

- 错误号：1119; 符号： ER_STACK_OVERRUN; SQLSTATE： HY000

报错信息格式：线程堆栈溢出：使用：％ld堆栈的％ld。

如果需要，使用'mysqld --thread_stack =＃'指定更大的堆栈

</br>

- 错误号：1120; 符号： ER_WRONG_OUTER_JOIN; SQLSTATE： 42000

报错信息格式：在外部联接中发现交叉依赖；检查您的开机条件。

ER_WRONG_OUTER_JOIN 在8.0.0之后被删除。


</br>

- 错误号：1120; 符号： ER_WRONG_OUTER_JOIN_UNUSED; SQLSTATE：42000

报错信息格式：在外部联接中发现交叉依赖；检查您的开机条件。

ER_WRONG_OUTER_JOIN_UNUSED 在8.0.1中添加。


</br>

- 错误号：1121; 符号： ER_NULL_COLUMN_IN_INDEX; SQLSTATE： 42000

报错信息格式：表处理程序在给定索引中不支持NULL。

请更改列'％s'为NOT NULL或使用其他处理程序

</br>

- 错误号：1122; 符号： ER_CANT_FIND_UDF; SQLSTATE： HY000

报错信息格式：无法加载功能'％s'。

</br>

- 错误号：1123; 符号： ER_CANT_INITIALIZE_UDF; SQLSTATE： HY000

报错信息格式：无法初始化函数'％s'; ％s。

</br>

- 错误号：1124; 符号： ER_UDF_NO_PATHS; SQLSTATE： HY000

报错信息格式：共享库不允许使用路径。

</br>

- 错误号：1125; 符号： ER_UDF_EXISTS; SQLSTATE： HY000

报错信息格式：功能'％s'已经存在。

</br>

- 错误号：1126; 符号： ER_CANT_OPEN_LIBRARY; SQLSTATE： HY000

报错信息格式：无法打开共享库'％s'（错误号：％d％s）。

</br>

- 错误号：1127; 符号： ER_CANT_FIND_DL_ENTRY; SQLSTATE： HY000

报错信息格式：在库中找不到符号“％s”。

</br>

- 错误号：1128; 符号： ER_FUNCTION_NOT_DEFINED; SQLSTATE： HY000

报错信息格式：未定义功能'％s'。

</br>

- 错误号：1129; 符号： ER_HOST_IS_BLOCKED; SQLSTATE： HY000

报错信息格式：由于许多连接错误，主机'％s'被阻止；用'mysqladmin flush-hosts'解锁。

</br>

- 错误号：1130; 符号： ER_HOST_NOT_PRIVILEGED; SQLSTATE： HY000

报错信息格式：不允许主机“％s”连接到该MySQL服务器。

</br>

- 错误号：1131; 符号： ER_PASSWORD_ANONYMOUS_USER; SQLSTATE：42000

报错信息格式：您将MySQL作为匿名用户使用，并且不允许匿名用户更改密码。

</br>

- 错误号：1132; 符号： ER_PASSWORD_NOT_ALLOWED; SQLSTATE： 42000

报错信息格式：您必须具有更新mysql数据库中表的权限，才能更改其他用户的密码。

</br>

- 错误号：1133; 符号： ER_PASSWORD_NO_MATCH; SQLSTATE： 42000

报错信息格式：在用户表中找不到任何匹配的行。

</br>

- 错误号：1134; 符号： ER_UPDATE_INFO; SQLSTATE： HY000

报错信息格式：匹配的行：％ld已更改：％ld警告：％ld。

</br>

- 错误号：1135; 符号： ER_CANT_CREATE_THREAD; SQLSTATE： HY000

报错信息格式：无法创建新线程（错误号％d）；如果您没有足够的可用内存，则可以查阅手册以获取可能的操作系统相关错误。

</br>

- 错误号：1136; 符号： ER_WRONG_VALUE_COUNT_ON_ROW; SQLSTATE：21S01

报错信息格式：列计数与第％ld行的值计数不匹配。

</br>

- 错误号：1137; 符号： ER_CANT_REOPEN_TABLE; SQLSTATE： HY000

报错信息格式：无法重新打开表：'％s'。

</br>

- 错误号：1138; 符号： ER_INVALID_USE_OF_NULL; SQLSTATE： 22004

报错信息格式：无效使用NULL值。

</br>

- 错误号：1139; 符号： ER_REGEXP_ERROR; SQLSTATE： 42000

报错信息格式：从正则表达式得到错误“％s”。

</br>

- 错误号：1140; 符号： ER_MIX_OF_GROUP_FUNC_AND_FIELDS; SQLSTATE：42000

报错信息格式：如果没有GROUP BY子句，则将GROUP列（MIN（），MAX（），COUNT（），...）与GROUP列混合使用是非法的。

</br>

- 错误号：1141; 符号： ER_NONEXISTING_GRANT; SQLSTATE： 42000

报错信息格式：在主机“％s”上没有为用户“％s”定义此类授予。

</br>

- 错误号：1142; 符号： ER_TABLEACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：表'％s'的用户'％s'@'％s'拒绝％s命令。

</br>

- 错误号：1143; 符号： ER_COLUMNACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：对表'％s'中列'％s'的用户'％s'@'％s'拒绝％s命令。

</br>

- 错误号：1144; 符号： ER_ILLEGAL_GRANT_FOR_TABLE; SQLSTATE：42000
信息：非法的GRANT / REVOKE命令; 请查阅手册以查看可以使用哪些特权

</br>

- 错误号：1145; 符号： ER_GRANT_WRONG_HOST_OR_USER; SQLSTATE：42000

报错信息格式：GRANT的主机或用户参数过长。

</br>

- 错误号：1146; 符号： ER_NO_SUCH_TABLE; SQLSTATE： 42S02

报错信息格式：表'％s。

％s'不存在

</br>

- 错误号：1147; 符号： ER_NONEXISTING_TABLE_GRANT; SQLSTATE：42000

报错信息格式：在表'％s'上没有为主机'％s'上的用户'％s'定义此类授予。

</br>

- 错误号：1148; 符号： ER_NOT_ALLOWED_COMMAND; SQLSTATE： 42000

报错信息格式：此MySQL版本不允许使用命令。

</br>

- 错误号：1149; 符号： ER_SYNTAX_ERROR; SQLSTATE： 42000

报错信息格式：您的SQL语法有错误；检查与您的MySQL服务器版本相对应的手册以使用正确的语法。

</br>

- 错误号：1152; 符号： ER_ABORTING_CONNECTION; SQLSTATE： 08S01

报错信息格式：与数据库的％ld连接中断：'％s'用户：'％s'（％s）。

</br>

- 错误号：1153; 符号： ER_NET_PACKET_TOO_LARGE; SQLSTATE： 08S01
报错信息格式：收到的封包大于'max_allowed_packet'个字节。

</br>

- 错误号：1154; 符号： ER_NET_READ_ERROR_FROM_PIPE; SQLSTATE：08S01

报错信息格式：从连接管道读取错误。

</br>

- 错误号：1155; 符号： ER_NET_FCNTL_ERROR; SQLSTATE： 08S01

报错信息格式：从fcntl（）获得错误。

</br>

- 错误号：1156; 符号： ER_NET_PACKETS_OUT_OF_ORDER; SQLSTATE：08S01

报错信息格式：数据包混乱。

</br>

- 错误号：1157; 符号： ER_NET_UNCOMPRESS_ERROR; SQLSTATE： 08S01

报错信息格式：无法解压缩通信数据包。

</br>

- 错误号：1158; 符号： ER_NET_READ_ERROR; SQLSTATE： 08S01

报错信息格式：读取通信数据包时出错。

</br>

- 错误号：1159; 符号： ER_NET_READ_INTERRUPTED; SQLSTATE： 08S01

报错信息格式：读取通信数据包超时。

</br>

- 错误号：1160; 符号： ER_NET_ERROR_ON_WRITE; SQLSTATE： 08S01

报错信息格式：写入通信数据包时出错。

</br>

- 错误号：1161; 符号： ER_NET_WRITE_INTERRUPTED; SQLSTATE：08S01

报错信息格式：写入通信数据包超时。

</br>

- 错误号：1162; 符号： ER_TOO_LONG_STRING; SQLSTATE： 42000

报错信息格式：结果字符串长于“ max_allowed_packet”字节。

</br>

- 错误号：1163; 符号： ER_TABLE_CANT_HANDLE_BLOB; SQLSTATE：42000

报错信息格式：使用的表类型不支持BLOB / TEXT列。

</br>

- 错误号：1164; 符号： ER_TABLE_CANT_HANDLE_AUTO_INCREMENT; SQLSTATE：42000

报错信息格式：使用的表类型不支持AUTO_INCREMENT列。

</br>

- 错误号：1166; 符号： ER_WRONG_COLUMN_NAME; SQLSTATE： 42000

报错信息格式：不正确的列名'％s'。

</br>

- 错误号：1167; 符号： ER_WRONG_KEY_COLUMN; SQLSTATE： 42000

报错信息格式：使用的存储引擎无法索引列'％s'。

</br>

- 错误号：1168; 符号： ER_WRONG_MRG_TABLE; SQLSTATE： HY000

报错信息格式：无法打开定义不同或非MyISAM类型或不存在的基础表。

</br>

- 错误号：1169; 符号： ER_DUP_UNIQUE; SQLSTATE： 23000

报错信息格式：由于唯一约束，无法写表'％s'。

</br>

- 错误号：1170; 符号： ER_BLOB_KEY_WITHOUT_LENGTH; SQLSTATE：42000

报错信息格式：密钥规范中使用的BLOB / TEXT列'％s'没有密钥长度。

</br>

- 错误号：1171; 符号： ER_PRIMARY_CANT_HAVE_NULL; SQLSTATE：42000

报错信息格式：PRIMARY KEY的所有部分都不能为NULL；如果键中需要NULL，请改用UNIQUE。

</br>

- 错误号：1172; 符号： ER_TOO_MANY_ROWS; SQLSTATE： 42000

报错信息格式：结果包含多于一行。

</br>

- 错误号：1173; 符号： ER_REQUIRES_PRIMARY_KEY; SQLSTATE： 42000

报错信息格式：此表类型需要主键。

</br>

- 错误号：1175; 符号： ER_UPDATE_WITHOUT_KEY_IN_SAFE_MODE; SQLSTATE：HY000

报错信息格式：您正在使用安全更新模式，并且试图在没有使用KEY列的WHERE的情况下更新表。

％s

</br>

- 错误号：1176; 符号： ER_KEY_DOES_NOT_EXITS; SQLSTATE： 42000

报错信息格式：键'％s'在表'％s'中不存在。

</br>

- 错误号：1177; 符号： ER_CHECK_NO_SUCH_TABLE; SQLSTATE： 42000

报错信息格式：无法打开桌子。

</br>

- 错误号：1178; 符号： ER_CHECK_NOT_IMPLEMENTED; SQLSTATE：42000

报错信息格式：表的存储引擎不支持％s。

</br>

- 错误号：1179; 符号： ER_CANT_DO_THIS_DURING_AN_TRANSACTION; SQLSTATE：25000

报错信息格式：不允许您在事务中执行此命令。

</br>

- 错误号：1180; 符号： ER_ERROR_DURING_COMMIT; SQLSTATE： HY000

报错信息格式：在COMMIT期间出错％d-'％s'。

</br>

- 错误号：1181; 符号： ER_ERROR_DURING_ROLLBACK; SQLSTATE：HY000

报错信息格式：在回滚期间出现错误％d-'％s'。

</br>

- 错误号：1182; 符号： ER_ERROR_DURING_FLUSH_LOGS; SQLSTATE：HY000

报错信息格式：在FLUSH_LOGS期间出错％d。

</br>

- 错误号：1184; 符号： ER_NEW_ABORTING_CONNECTION; SQLSTATE：08S01

报错信息格式：与数据库的％u连接终止：'％s'用户：'％s'主机：'％s'（％s）。

</br>

- 错误号：1188; 符号： ER_MASTER; SQLSTATE： HY000

报错信息格式：来自主服务器的错误：'％s'。

</br>

- 错误号：1189; 符号： ER_MASTER_NET_READ; SQLSTATE： 08S01

报错信息格式：从主站读取净错误。

</br>

- 错误号：1190; 符号： ER_MASTER_NET_WRITE; SQLSTATE： 08S01

报错信息格式：网络错误写入主机。

</br>

- 错误号：1191; 符号： ER_FT_MATCHING_KEY_NOT_FOUND; SQLSTATE：HY000

报错信息格式：找不到与列列表匹配的FULLTEXT索引。

</br>

- 错误号：1192; 符号： ER_LOCK_OR_ACTIVE_TRANSACTION; SQLSTATE：HY000

报错信息格式：无法执行给定命令，因为您有活动的锁定表或活动的事务。

</br>

- 错误号：1193; 符号： ER_UNKNOWN_SYSTEM_VARIABLE; SQLSTATE：HY000

报错信息格式：未知的系统变量'％s'。

</br>

- 错误号：1194; 符号： ER_CRASHED_ON_USAGE; SQLSTATE： HY000

报错信息格式：表'％s'被标记为已崩溃，应该修复。

</br>

- 错误号：1195; 符号： ER_CRASHED_ON_REPAIR; SQLSTATE： HY000

报错信息格式：表'％s'被标记为已崩溃，并且上次（自动？）修复失败。

</br>

- 错误号：1196; 符号： ER_WARNING_NOT_COMPLETE_ROLLBACK; SQLSTATE：HY000

报错信息格式：某些非事务性更改表无法回滚。

</br>

- 错误号：1197; 符号： ER_TRANS_CACHE_FULL; SQLSTATE： HY000

报错信息格式：多语句事务需要超过“ max_binlog_cache_size”个字节的存储空间；增加此mysqld变量，然后重试。

</br>

- 错误号：1199; 符号： ER_SLAVE_NOT_RUNNING; SQLSTATE： HY000

报错信息格式：此操作需要运行中的从属；配置从站并开始从站。

</br>

- 错误号：1200; 符号： ER_BAD_SLAVE; SQLSTATE： HY000

报错信息格式：服务器未配置为从服务器；修复配置文件或使用CHANGE MASTER TO。

</br>

- 错误号：1201; 符号： ER_MASTER_INFO; SQLSTATE： HY000

报错信息格式：无法初始化主信息结构；可以在MySQL错误日志中找到更多错误消息。

</br>

- 错误号：1202; 符号： ER_SLAVE_THREAD; SQLSTATE： HY000

报错信息格式：无法创建从属线程。

检查系统资源

</br>

- 错误号：1203; 符号： ER_TOO_MANY_USER_CONNECTIONS; SQLSTATE：42000

报错信息格式：用户％s已具有多个“ max_user_connections”活动连接。

</br>

- 错误号：1204; 符号： ER_SET_CONSTANTS_ONLY; SQLSTATE： HY000

报错信息格式：您只能将常量表达式与SET一起使用。

</br>

- 错误号：1205; 符号： ER_LOCK_WAIT_TIMEOUT; SQLSTATE： HY000

报错信息格式：超过了锁定等待超时；尝试重新启动事务。

InnoDB锁定等待超时到期时报告此错误。

等待时间过长的语句已 回滚（不是整个 事务）。

innodb_lock_wait_timeout 如果SQL语句应等待更长的时间来等待其他事务完成，则可以增加配置选项的值，或者如果太多长时间运行的事务导致锁定问题并减少 繁忙系统上的并发性，则可以减小配置选项 的值 。


</br>

- 错误号：1206; 符号： ER_LOCK_TABLE_FULL; SQLSTATE： HY000

报错信息格式：锁总数超过了锁表的大小。

InnoDB当锁的总数超过用于管理锁的内存量时，将报告此错误。

为避免此错误，请增加的值 innodb_buffer_pool_size。

在单个应用程序内，一种解决方法可能是将大型操作分解为较小的部分。

例如，如果错误发生在一个大的位置INSERT，则执行几个较小的INSERT操作。


</br>

- 错误号：1207; 符号： ER_READ_ONLY_TRANSACTION; SQLSTATE：25000

报错信息格式：在READ UNCOMMITTED事务期间无法获取更新锁。

</br>

- 错误号：1210; 符号： ER_WRONG_ARGUMENTS; SQLSTATE： HY000

报错信息格式：％s的参数不正确。

</br>

- 错误号：1211; 符号： ER_NO_PERMISSION_TO_CREATE_USER; SQLSTATE：42000

报错信息格式：不允许'％s'@'％s'创建新用户。

</br>

- 错误号：1213; 符号： ER_LOCK_DEADLOCK; SQLSTATE： 40001

报错信息格式：尝试获取锁时发现死锁；尝试重新启动事务。

InnoDB当事务遇到 死锁并自动 回滚时报告此错误， 以便您的应用程序可以采取纠正措施。

要从此错误中恢复，请再次运行此事务中的所有操作。

当事务之间的锁请求顺序不一致时，就会发生死锁。

回滚的事务释放了所有锁，其他事务现在可以获取其请求的所有锁。

因此，当您重新运行回滚的事务时，它可能不得不等待其他事务完成，但是通常不会再次发生死锁。

如果您经常遇到死锁，请执行锁定操作的顺序（LOCK TABLES，SELECT ... FOR UPDATE等等）在遇到问题的不同事务或应用程序之间保持一致。

有关详细信息，请参见 第15.7.5节“ InnoDB中的死锁”。


</br>

- 错误号：1214; 符号： ER_TABLE_CANT_HANDLE_FT; SQLSTATE： HY000

报错信息格式：使用的表类型不支持FULLTEXT索引。

</br>

- 错误号：1215; 符号： ER_CANNOT_ADD_FOREIGN; SQLSTATE： HY000

报错信息格式：无法添加外键约束。

</br>

- 错误号：1216; 符号： ER_NO_REFERENCED_ROW; SQLSTATE： 23000

报错信息格式：无法添加或更新子行：外键约束失败。

InnoDB当您尝试添加行但没有父行，并且外键约束失败时，将报告此错误 。

首先添加父行。


</br>

- 错误号：1217; 符号： ER_ROW_IS_REFERENCED; SQLSTATE： 23000

报错信息格式：无法删除或更新父行：外键约束失败。

InnoDB当您尝试删除具有子项的父行且外键约束失败时，将报告此错误 。

首先删除孩子。


</br>

- 错误号：1218; 符号： ER_CONNECT_TO_MASTER; SQLSTATE： 08S01

报错信息格式：连接到主服务器时出错：％s。

</br>

- 错误号：1220; 符号： ER_ERROR_WHEN_EXECUTING_COMMAND; SQLSTATE：HY000

报错信息格式：执行命令％s时出错：％s。

</br>

- 错误号：1221; 符号： ER_WRONG_USAGE; SQLSTATE： HY000

报错信息格式：％s和％s的用法不正确。

</br>

- 错误号：1222; 符号： ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT; SQLSTATE：21000
信息：使用的SELECT语句具有不同的列数

</br>

- 错误号：1223; 符号： ER_CANT_UPDATE_WITH_READLOCK; SQLSTATE：HY000

报错信息格式：无法执行查询，因为您的读锁冲突。

</br>

- 错误号：1224; 符号： ER_MIXING_NOT_ALLOWED; SQLSTATE： HY000

报错信息格式：事务表和非事务表的混合已禁用。

</br>

- 错误号：1225; 符号： ER_DUP_ARGUMENT; SQLSTATE： HY000

报错信息格式：选项“％s”在语句中使用了两次。

</br>

- 错误号：1226; 符号： ER_USER_LIMIT_REACHED; SQLSTATE： 42000

报错信息格式：用户'％s'已超出'％s'资源（当前值：％ld）。

-错误号：1227; 符号： ER_SPECIFIC_ACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：访问被拒绝；您需要（至少一个）％s权限才能执行此操作。

</br>

- 错误号：1228; 符号： ER_LOCAL_VARIABLE; SQLSTATE： HY000

报错信息格式：变量'％s'是SESSION变量，不能与SET GLOBAL一起使用。

</br>

- 错误号：1229; 符号： ER_GLOBAL_VARIABLE; SQLSTATE： HY000

报错信息格式：变量“％s”是GLOBAL变量，应使用SET GLOBAL进行设置。

</br>

- 错误号：1230; 符号： ER_NO_DEFAULT; SQLSTATE： 42000

报错信息格式：变量“％s”没有默认值。

</br>

- 错误号：1231; 符号： ER_WRONG_VALUE_FOR_VAR; SQLSTATE： 42000

报错信息格式：变量“％s”不能设置为“％s”的值。

</br>

- 错误号：1232; 符号： ER_WRONG_TYPE_FOR_VAR; SQLSTATE： 42000

报错信息格式：变量'％s'的参数类型不正确。

</br>

- 错误号：1233; 符号： ER_VAR_CANT_BE_READ; SQLSTATE： HY000

报错信息格式：只能设置变量'％s'，不能读取。

</br>

- 错误号：1234; 符号： ER_CANT_USE_OPTION_HERE; SQLSTATE： 42000

报错信息格式：“％s”的错误使用/放置。

</br>

- 错误号：1235; 符号： ER_NOT_SUPPORTED_YET; SQLSTATE： 42000

报错信息格式：此版本的MySQL尚不支持'％s'。

</br>

- 错误号：1236; 符号： ER_MASTER_FATAL_ERROR_READING_BINLOG; SQLSTATE：HY000

报错信息格式：从二进制日志'％s'中读取数据时，主机发生致命错误％d。

</br>

- 错误号：1237; 符号： ER_SLAVE_IGNORED_TABLE; SQLSTATE： HY000

报错信息格式：由于复制表规则，从SQL线程忽略了查询。

</br>

- 错误号：1238; 符号： ER_INCORRECT_GLOBAL_LOCAL_VAR; SQLSTATE：HY000

报错信息格式：变量'％s'是％s变量。

</br>

- 错误号：1239; 符号： ER_WRONG_FK_DEF; SQLSTATE： 42000

报错信息格式：'％s'的外键定义不正确：％s。

</br>

- 错误号：1240; 符号： ER_KEY_REF_DO_NOT_MATCH_TABLE_REF; SQLSTATE：HY000

报错信息格式：键引用和表引用不匹配。

</br>

- 错误号：1241; 符号： ER_OPERAND_COLUMNS; SQLSTATE： 21000

报错信息格式：操作数应包含％d列。

</br>

- 错误号：1242; 符号： ER_SUBQUERY_NO_1_ROW; SQLSTATE： 21000

报错信息格式：子查询返回多于1行。

</br>

- 错误号：1243; 符号： ER_UNKNOWN_STMT_HANDLER; SQLSTATE： HY000

报错信息格式：已将未知的预准备语句处理程序（％。

* s）分配给％s

</br>

- 错误号：1244; 符号： ER_CORRUPT_HELP_DB; SQLSTATE： HY000

报错信息格式：帮助数据库已损坏或不存在。

</br>

- 错误号：1246; 符号： ER_AUTO_CONVERT; SQLSTATE： HY000

报错信息格式：将列“％s”从％s转换为％s。

</br>

- 错误号：1247; 符号： ER_ILLEGAL_REFERENCE; SQLSTATE： 42S22

报错信息格式：不支持引用'％s'（％s）。

</br>

- 错误号：1248; 符号： ER_DERIVED_MUST_HAVE_ALIAS; SQLSTATE：42000

报错信息格式：每个派生表必须具有自己的别名。

</br>

- 错误号：1249; 符号： ER_SELECT_REDUCED; SQLSTATE： 01000

报错信息格式：选择％u在优化过程中减少了。

</br>

- 错误号：1250; 符号： ER_TABLENAME_NOT_ALLOWED_HERE; SQLSTATE：42000

报错信息格式：SELECT之一中的表'％s'不能在％s中使用。

</br>

- 错误号：1251; 符号： ER_NOT_SUPPORTED_AUTH_MODE; SQLSTATE：08004

报错信息格式：客户端不支持服务器请求的身份验证协议；考虑升级MySQL客户端。

</br>

- 错误号：1252; 符号： ER_SPATIAL_CANT_HAVE_NULL; SQLSTATE：42000

报错信息格式：SPATIAL索引的所有部分都必须为非空。

</br>

- 错误号：1253; 符号： ER_COLLATION_CHARSET_MISMATCH; SQLSTATE：42000

报错信息格式：收集'％s'对字符集'％s'无效。

</br>

- 错误号：1256; 符号： ER_TOO_BIG_FOR_UNCOMPRESS; SQLSTATE：HY000

报错信息格式：未压缩的数据大小太大；最大大小为％d（可能是未压缩数据的长度已损坏）。

</br>

- 错误号：1257; 符号： ER_ZLIB_Z_MEM_ERROR; SQLSTATE： HY000

报错信息格式：ZLIB：内存不足。

</br>

- 错误号：1258; 符号： ER_ZLIB_Z_BUF_ERROR; SQLSTATE： HY000

报错信息格式：ZLIB：输出缓冲区中没有足够的空间（可能未压缩数据的长度已损坏）。

</br>

- 错误号：1259; 符号： ER_ZLIB_Z_DATA_ERROR; SQLSTATE： HY000

报错信息格式：ZLIB：输入数据已损坏。

</br>

- 错误号：1260; 符号： ER_CUT_VALUE_GROUP_CONCAT; SQLSTATE：HY000

报错信息格式：％u行被GROUP_CONCAT（）剪切。

</br>

- 错误号：1261; 符号： ER_WARN_TOO_FEW_RECORDS; SQLSTATE： 01000

报错信息格式：第％ld行不包含所有列的数据。

</br>

- 错误号：1262; 符号： ER_WARN_TOO_MANY_RECORDS; SQLSTATE：01000

报错信息格式：％ld行被截断；它包含的数据多于输入列。

</br>

- 错误号：1263; 符号： ER_WARN_NULL_TO_NOTNULL; SQLSTATE： 22004

报错信息格式：列设置为默认值；向第％ld行的NOT NULL列'％s'提供了NULL。

</br>

- 错误号：1264; 符号： ER_WARN_DATA_OUT_OF_RANGE; SQLSTATE：22003

报错信息格式：第％ld行的列'％s'超出范围值。

</br>

- 错误号：1265; 符号： WARN_DATA_TRUNCATED; SQLSTATE： 01000

报错信息格式：第％ld行的列'％s'的数据被截断。

</br>

- 错误号：1266; 符号： ER_WARN_USING_OTHER_HANDLER; SQLSTATE：HY000

报错信息格式：将存储引擎％s用于表'％s'。

</br>

- 错误号：1267; 符号： ER_CANT_AGGREGATE_2COLLATIONS; SQLSTATE：HY000

报错信息格式：操作“％s”的归类（％s，％s）和（％s，％s）的非法混合。

</br>

- 错误号：1269; 符号： ER_REVOKE_GRANTS; SQLSTATE： HY000

报错信息格式：无法撤消一个或多个请求用户的所有特权。

</br>

- 错误号：1270; 符号： ER_CANT_AGGREGATE_3COLLATIONS; SQLSTATE：HY000

报错信息格式：操作'％s'的归类（％s，％s），（％s，％s），（％s，％s）的非法混合。

</br>

- 错误号：1271; 符号： ER_CANT_AGGREGATE_NCOLLATIONS; SQLSTATE：HY000

报错信息格式：操作'％s'的排序规则非法混合。

</br>

- 错误号：1272; 符号： ER_VARIABLE_IS_NOT_STRUCT; SQLSTATE：HY000

报错信息格式：变量'％s'不是变量组件（不能用作XXXX.variable_name）。

</br>

- 错误号：1273; 符号： ER_UNKNOWN_COLLATION; SQLSTATE： HY000

报错信息格式：未知归类：'％s'。

</br>

- 错误号：1274; 符号： ER_SLAVE_IGNORED_SSL_PARAMS; SQLSTATE：HY000

报错信息格式：CHANGE MASTER中的SSL参数将被忽略，因为该MySQL从站是在没有SSL支持的情况下编译的；如果启动具有SSL的MySQL从服务器，则可以在以后使用它们。

</br>

- 错误号：1275; 符号： ER_SERVER_IS_IN_SECURE_AUTH_MODE; SQLSTATE：HY000

报错信息格式：服务器以--secure-auth模式运行，但是'％s'@'％s'具有旧格式的密码；请更改密码为新格式。

ER_SERVER_IS_IN_SECURE_AUTH_MODE 在8.0.15之后被删除。


</br>

- 错误号：1276; 符号： ER_WARN_FIELD_RESOLVED; SQLSTATE： HY000

报错信息格式：在SELECT＃％d中解析了SELECT＃％d的字段或引用'％s％s％s％s％s％s'。

</br>

- 错误号：1277; 符号： ER_BAD_SLAVE_UNTIL_COND; SQLSTATE： HY000

报错信息格式：START SLAVE UNTIL的参数不正确或参数组合。

</br>

- 错误号：1278; 符号： ER_MISSING_SKIP_SLAVE; SQLSTATE： HY000

报错信息格式：建议对START SLAVE UNTIL进行逐步复制时，建议使用--skip-slave-start；否则，如果意外从属的mysqld重新启动，将会遇到问题。

</br>

- 错误号：1279; 符号： ER_UNTIL_COND_IGNORED; SQLSTATE： HY000

报错信息格式：不要启动SQL线程，因此将忽略UNTIL选项。

</br>

- 错误号：1280; 符号： ER_WRONG_NAME_FOR_INDEX; SQLSTATE： 42000

报错信息格式：不正确的索引名称'％s'。

</br>

- 错误号：1281; 符号： ER_WRONG_NAME_FOR_CATALOG; SQLSTATE：42000

报错信息格式：错误的目录名称'％s'。

</br>

- 错误号：1282; 符号： ER_WARN_QC_RESIZE; SQLSTATE： HY000

报错信息格式：查询高速缓存无法设置大小％lu。

新的查询缓存大小为％lu
ER_WARN_QC_RESIZE 在8.0.2之后被删除。


</br>

- 错误号：1283; 符号： ER_BAD_FT_COLUMN; SQLSTATE： HY000

报错信息格式：列'％s'不能成为FULLTEXT索引的一部分。

</br>

- 错误号：1284; 符号： ER_UNKNOWN_KEY_CACHE; SQLSTATE： HY000

报错信息格式：未知密钥缓存'％s'。

</br>

- 错误号：1285; 符号： ER_WARN_HOSTNAME_WONT_WORK; SQLSTATE：HY000

报错信息格式：MySQL以--skip-name-resolve模式启动；您必须在没有此开关的情况下重新启动它，此授权才能起作用。

</br>

- 错误号：1286; 符号： ER_UNKNOWN_STORAGE_ENGINE; SQLSTATE：42000

报错信息格式：未知的存储引擎'％s'。

</br>

- 错误号：1287; 符号： ER_WARN_DEPRECATED_SYNTAX; SQLSTATE：HY000

报错信息格式：'％s'已过时，将在以后的版本中删除。

请改用％s

</br>

- 错误号：1288; 符号： ER_NON_UPDATABLE_TABLE; SQLSTATE： HY000

报错信息格式：％s的目标表％s无法更新。

</br>

- 错误号：1289; 符号： ER_FEATURE_DISABLED; SQLSTATE： HY000

报错信息格式：“％s”功能已禁用；您需要使用'％s'构建的MySQL以使其正常运行。

</br>

- 错误号：1290; 符号： ER_OPTION_PREVENTS_STATEMENT; SQLSTATE：HY000

报错信息格式：MySQL服务器正在使用％s选项运行，因此它无法执行此语句。

</br>

- 错误号：1291; 符号： ER_DUPLICATED_VALUE_IN_TYPE; SQLSTATE：HY000

报错信息格式：列'％s'在％s中具有重复的值'％s'。

</br>

- 错误号：1292; 符号： ER_TRUNCATED_WRONG_VALUE; SQLSTATE：22007

报错信息格式：截断了错误的％s值：'％s'。

</br>

- 错误号：1294; 符号： ER_INVALID_ON_UPDATE; SQLSTATE： HY000

报错信息格式：'％s'列的无效的ON UPDATE子句。

</br>

- 错误号：1295; 符号： ER_UNSUPPORTED_PS; SQLSTATE： HY000

报错信息格式：预准备语句协议尚不支持此命令。

</br>

- 错误号：1296; 符号： ER_GET_ERRMSG; SQLSTATE： HY000

报错信息格式：从％s得到错误％d'％s'。

</br>

- 错误号：1297; 符号： ER_GET_TEMPORARY_ERRMSG; SQLSTATE： HY000

报错信息格式：从％s获得临时错误％d'％s'。

</br>

- 错误号：1298; 符号： ER_UNKNOWN_TIME_ZONE; SQLSTATE： HY000

报错信息格式：未知或不正确的时区：'％s'。

</br>

- 错误号：1299; 符号： ER_WARN_INVALID_TIMESTAMP; SQLSTATE：HY000

报错信息格式：第％ld行的列'％s'中的TIMESTAMP值无效。

</br>

- 错误号：1300; 符号： ER_INVALID_CHARACTER_STRING; SQLSTATE：HY000

报错信息格式：无效的％s字符串：'％s'。

</br>

- 错误号：1301; 符号： ER_WARN_ALLOWED_PACKET_OVERFLOWED; SQLSTATE：HY000

报错信息格式：％s（）的结果大于max_allowed_packet（％ld）-被截断。

</br>

- 错误号：1302; 符号： ER_CONFLICTING_DECLARATIONS; SQLSTATE：HY000

报错信息格式：声明冲突：'％s％s'和'％s％s'。

</br>

- 错误号：1303; 符号： ER_SP_NO_RECURSIVE_CREATE; SQLSTATE：2F003

报错信息格式：无法在另一个存储例程中创建％s。

</br>

- 错误号：1304; 符号： ER_SP_ALREADY_EXISTS; SQLSTATE： 42000
报错信息格式：％s％s已经存在。

</br>

- 错误号：1305; 符号： ER_SP_DOES_NOT_EXIST; SQLSTATE： 42000

报错信息格式：％s％s不存在。

</br>

- 错误号：1306; 符号： ER_SP_DROP_FAILED; SQLSTATE： HY000

报错信息格式：未能删除％s％s。

</br>

- 错误号：1307; 符号： ER_SP_STORE_FAILED; SQLSTATE： HY000
报错信息格式：无法建立％s％s。

</br>

- 错误号：1308; 符号： ER_SP_LILABEL_MISMATCH; SQLSTATE： 42000

报错信息格式：％s，没有匹配的标签：％s。

</br>

- 错误号：1309; 符号： ER_SP_LABEL_REDEFINE; SQLSTATE： 42000

报错信息格式：重新定义标签％s。

</br>

- 错误号：1310; 符号： ER_SP_LABEL_MISMATCH; SQLSTATE： 42000
报错信息格式：结束标签％s不匹配。

</br>

- 错误号：1311; 符号： ER_SP_UNINIT_VAR; SQLSTATE： 01000

报错信息格式：引用未初始化的变量％s。

</br>

- 错误号：1312; 符号： ER_SP_BADSELECT; SQLSTATE： 0A000

报错信息格式：PROCEDURE％s无法在给定上下文中返回结果集。

</br>

- 错误号：1313; 符号： ER_SP_BADRETURN; SQLSTATE： 42000

报错信息格式：仅在FUNCTION中允许RETURN。

</br>

- 错误号：1314; 符号： ER_SP_BADSTATEMENT; SQLSTATE： 0A000

报错信息格式：存储过程中不允许％s。

</br>

- 错误号：1315; 符号： ER_UPDATE_LOG_DEPRECATED_IGNORED; SQLSTATE：42000

报错信息格式：不推荐使用更新日志，并由二进制日志代替；SET SQL_LOG_UPDATE已被忽略。


</br>

- 错误号：1316; 符号： ER_UPDATE_LOG_DEPRECATED_TRANSLATED; SQLSTATE：42000

报错信息格式：不推荐使用更新日志，并由二进制日志代替；SET SQL_LOG_UPDATE已转换为SET SQL_LOG_BIN。


</br>

- 错误号：1317; 符号： ER_QUERY_INTERRUPTED; SQLSTATE： 70100

报错信息格式：查询执行被中断。

</br>

- 错误号：1318; 符号： ER_SP_WRONG_NO_OF_ARGS; SQLSTATE： 42000

报错信息格式：％s％s的参数数目不正确；预期％u，得到了％u。

</br>

- 错误号：1319; 符号： ER_SP_COND_MISMATCH; SQLSTATE： 42000

报错信息格式：不确定的条件：％s。

</br>

- 错误号：1320; 符号： ER_SP_NORETURN; SQLSTATE： 42000
报错信息格式：在FUNCTION％s中找不到RETURN。

</br>

- 错误号：1321; 符号： ER_SP_NORETURNEND; SQLSTATE： 2F005
报错信息格式：FUNCTION％s结束但未返回。

</br>

- 错误号：1322; 符号： ER_SP_BAD_CURSOR_QUERY; SQLSTATE： 42000

报错信息格式：游标语句必须是SELECT。

</br>

- 错误号：1323; 符号： ER_SP_BAD_CURSOR_SELECT; SQLSTATE： 42000

报错信息格式：游标SELECT不能具有INTO。

</br>

- 错误号：1324; 符号： ER_SP_CURSOR_MISMATCH; SQLSTATE： 42000

报错信息格式：未定义的游标：％s。

</br>

- 错误号：1325; 符号： ER_SP_CURSOR_ALREADY_OPEN; SQLSTATE：24000

报错信息格式：游标已经打开。

</br>

- 错误号：1326; 符号： ER_SP_CURSOR_NOT_OPEN; SQLSTATE： 24000

报错信息格式：游标未打开。

</br>

- 错误号：1327; 符号： ER_SP_UNDECLARED_VAR; SQLSTATE： 42000

报错信息格式：未声明的变量：％s。

</br>

- 错误号：1328; 符号： ER_SP_WRONG_NO_OF_FETCH_ARGS; SQLSTATE：HY000

报错信息格式：错误数量的FETCH变量。

</br>

- 错误号：1329; 符号： ER_SP_FETCH_NO_DATA; SQLSTATE： 02000

报错信息格式：无数据-提取，选择或处理了零行。

</br>

- 错误号：1330; 符号： ER_SP_DUP_PARAM; SQLSTATE： 42000

报错信息格式：重复的参数：％s。

</br>

- 错误号：1331; 符号： ER_SP_DUP_VAR; SQLSTATE： 42000

报错信息格式：重复变量：％s。

</br>

- 错误号：1332; 符号： ER_SP_DUP_COND; SQLSTATE： 42000

报错信息格式：重复条件：％s。

</br>

- 错误号：1333; 符号： ER_SP_DUP_CURS; SQLSTATE： 42000

报错信息格式：重复的光标：％s。

</br>

- 错误号：1334; 符号： ER_SP_CANT_ALTER; SQLSTATE： HY000
报错信息格式：无法更改％s％s。

</br>

- 错误号：1335; 符号： ER_SP_SUBSELECT_NYI; SQLSTATE： 0A000

报错信息格式：不支持子查询值。

</br>

- 错误号：1336; 符号： ER_STMT_NOT_ALLOWED_IN_SF_OR_TRG; SQLSTATE：0A000

报错信息格式：存储函数或触发器中不允许使用％s。

</br>

- 错误号：1337; 符号： ER_SP_VARCOND_AFTER_CURSHNDLR; SQLSTATE：42000

报错信息格式：在游标或处理程序声明之后的变量或条件声明。

</br>

- 错误号：1338; 符号： ER_SP_CURSOR_AFTER_HANDLER; SQLSTATE：42000

报错信息格式：处理程序声明后的游标声明。

</br>

- 错误号：1339; 符号： ER_SP_CASE_NOT_FOUND; SQLSTATE： 20000

报错信息格式：找不到CASE语句的大小写。

</br>

- 错误号：1340; 符号： ER_FPARSER_TOO_BIG_FILE; SQLSTATE： HY000

报错信息格式：配置文件'％s'太大。

</br>

- 错误号：1341; 符号： ER_FPARSER_BAD_HEADER; SQLSTATE： HY000

报错信息格式：文件'％s'中格式错误的文件类型头。

</br>

- 错误号：1342; 符号： ER_FPARSER_EOF_IN_COMMENT; SQLSTATE：HY000

报错信息格式：解析注释“％s”时文件意外结束。

</br>

- 错误号：1343; 符号： ER_FPARSER_ERROR_IN_PARAMETER; SQLSTATE：HY000

报错信息格式：解析参数'％s'时出错（行：'％s'）。

</br>

- 错误号：1344; 符号： ER_FPARSER_EOF_IN_UNKNOWN_PARAMETER; SQLSTATE：HY000

报错信息格式：跳过未知参数'％s'时文件意外结束。

</br>

- 错误号：1345; 符号： ER_VIEW_NO_EXPLAIN; SQLSTATE： HY000

报错信息格式：不能发布EXPLAIN / SHOW；缺乏基础表的特权。

</br>

- 错误号：1347; 符号： ER_WRONG_OBJECT; SQLSTATE： HY000

报错信息格式：'％s。

％s'不是％s
命名对象对于尝试的操作类型不正确。

它必须是命名类型的对象。

示例： HANDLER OPEN 需要基本表，而不是视图。

如果尝试在INFORMATION_SCHEMA实现为数据字典表视图的表上执行，则失败 。


</br>

- 错误号：1348; 符号： ER_NONUPDATEABLE_COLUMN; SQLSTATE： HY000

报错信息格式：列“％s”不可更新。

</br>

- 错误号：1350; 符号： ER_VIEW_SELECT_CLAUSE; SQLSTATE： HY000

报错信息格式：View的SELECT包含一个'％s'子句。

</br>

- 错误号：1351; 符号： ER_VIEW_SELECT_VARIABLE; SQLSTATE： HY000

报错信息格式：视图的SELECT包含变量或参数。

</br>

- 错误号：1352; 符号： ER_VIEW_SELECT_TMPTABLE; SQLSTATE： HY000

报错信息格式：视图的SELECT引用临时表'％s'。

</br>

- 错误号：1353; 符号： ER_VIEW_WRONG_LIST; SQLSTATE： HY000

报错信息格式：在视图定义，派生表或公共表表达式中，SELECT列表和列名列表具有不同的列数。

</br>

- 错误号：1354; 符号： ER_WARN_VIEW_MERGE; SQLSTATE： HY000

报错信息格式：视图合并算法暂时不能在这里使用（假定未定义算法）。

</br>

- 错误号：1355; 符号： ER_WARN_VIEW_WITHOUT_KEY; SQLSTATE：HY000

报错信息格式：正在更新的视图中没有基础表的完整密钥。

</br>

- 错误号：1356; 符号： ER_VIEW_INVALID; SQLSTATE： HY000

报错信息格式：视图'％s。

％s'引用了无效的表或列或函数或视图的定义器/调用者，缺少使用它们的权利

</br>

- 错误号：1357; 符号： ER_SP_NO_DROP_SP; SQLSTATE： HY000

报错信息格式：无法从另一个存储例程中删除或更改％s。

</br>

- 错误号：1359; 符号： ER_TRG_ALREADY_EXISTS; SQLSTATE： HY000

报错信息格式：触发器已存在。

</br>

- 错误号：1360; 符号： ER_TRG_DOES_NOT_EXIST; SQLSTATE： HY000

报错信息格式：触发器不存在。

</br>

- 错误号：1361; 符号： ER_TRG_ON_VIEW_OR_TEMP_TABLE; SQLSTATE：HY000

报错信息格式：触发器的“％s”是视图或临时表。

</br>

- 错误号：1362; 符号： ER_TRG_CANT_CHANGE_ROW; SQLSTATE： HY000

报错信息格式：％strigger中不允许更新％s行。

</br>

- 错误号：1363; 符号： ER_TRG_NO_SUCH_ROW_IN_TRG; SQLSTATE：HY000

报错信息格式：％s触发器中没有％s行。

</br>

- 错误号：1364; 符号： ER_NO_DEFAULT_FOR_FIELD; SQLSTATE： HY000

报错信息格式：字段“％s”没有默认值。

</br>

- 错误号：1365; 符号： ER_DIVISION_BY_ZERO; SQLSTATE： 22012
报错信息格式：除以0。

</br>

- 错误号：1366; 符号： ER_TRUNCATED_WRONG_VALUE_FOR_FIELD; SQLSTATE：HY000

报错信息格式：不正确的％s值：第％ld行的列'％s'的'％s'。

</br>

- 错误号：1367; 符号： ER_ILLEGAL_VALUE_FOR_TYPE; SQLSTATE：22007

报错信息格式：解析期间发现非法的％s'％s'值。

</br>

- 错误号：1368; 符号： ER_VIEW_NONUPD_CHECK; SQLSTATE： HY000

报错信息格式：在不可更新的视图'％s。

％s'上检查选项

</br>

- 错误号：1369; 符号： ER_VIEW_CHECK_FAILED; SQLSTATE： HY000

报错信息格式：检查选项失败'％s。

％s'

</br>

- 错误号：1370; 符号： ER_PROCACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：％s命令被例程'％s'拒绝给用户'％s'@'％s'。

</br>

- 错误号：1371; 符号： ER_RELAY_LOG_FAIL; SQLSTATE： HY000

报错信息格式：清除旧的中继日志失败：％s。

</br>

- 错误号：1373; 符号： ER_UNKNOWN_TARGET_BINLOG; SQLSTATE：HY000

报错信息格式：在二进制日志索引中找不到目标日志。

</br>

- 错误号：1374; 符号： ER_IO_ERR_LOG_INDEX_READ; SQLSTATE：HY000

报错信息格式：I / O错误读取日志索引文件。

</br>

- 错误号：1375; 符号： ER_BINLOG_PURGE_PROHIBITED; SQLSTATE：HY000

报错信息格式：服务器配置不允许清除二进制日志。

</br>

- 错误号：1376; 符号： ER_FSEEK_FAIL; SQLSTATE： HY000

报错信息格式：在fseek（）上失败。

</br>

- 错误号：1377; 符号： ER_BINLOG_PURGE_FATAL_ERR; SQLSTATE：HY000

报错信息格式：日志清除期间发生致命错误。

</br>

- 错误号：1378; 符号： ER_LOG_IN_USE; SQLSTATE： HY000

报错信息格式：正在清除的日志正在使用，不会清除。

</br>

- 错误号：1379; 符号： ER_LOG_PURGE_UNKNOWN_ERR; SQLSTATE：HY000

报错信息格式：日志清除期间出现未知错误。

</br>

- 错误号：1380; 符号： ER_RELAY_LOG_INIT; SQLSTATE： HY000

报错信息格式：初始化继电器日志位置失败：％s。

</br>

- 错误号：1381; 符号： ER_NO_BINARY_LOGGING; SQLSTATE： HY000

报错信息格式：您未使用二进制日志记录。

</br>

- 错误号：1382; 符号： ER_RESERVED_SYNTAX; SQLSTATE： HY000

报错信息格式：'％s'语法保留用于MySQL服务器内部。

</br>

- 错误号：1390; 符号： ER_PS_MANY_PARAM; SQLSTATE： HY000

报错信息格式：准备好的语句包含太多占位符。

</br>

- 错误号：1391; 符号： ER_KEY_PART_0; SQLSTATE： HY000

报错信息格式：关键部分'％s'的长度不能为0。

</br>

- 错误号：1392; 符号： ER_VIEW_CHECKSUM; SQLSTATE： HY000

报错信息格式：查看文本校验和失败。

</br>

- 错误号：1393; 符号： ER_VIEW_MULTIUPDATE; SQLSTATE： HY000

报错信息格式：不能通过联接视图'％s。

％s'修改多个基表

</br>

- 错误号：1394; 符号： ER_VIEW_NO_INSERT_FIELD_LIST; SQLSTATE：HY000

报错信息格式：没有字段列表，无法插入联接视图'％s。

％s'

</br>

- 错误号：1395; 符号： ER_VIEW_DELETE_MERGE_VIEW; SQLSTATE：HY000

报错信息格式：无法从联接视图'％s。

％s'中删除

</br>

- 错误号：1396; 符号： ER_CANNOT_USER; SQLSTATE： HY000

报错信息格式：％s操作％s失败。

</br>

- 错误号：1397; 符号： ER_XAER_NOTA; SQLSTATE： XAE04
报错信息格式：XAER_NOTA：未知的XID。

</br>

- 错误号：1398; 符号： ER_XAER_INVAL; SQLSTATE： XAE05

报错信息格式：XAER_INVAL：无效的参数（或不受支持的命令）。

</br>

- 错误号：1399; 符号： ER_XAER_RMFAIL; SQLSTATE： XAE07

报错信息格式：XAER_RMFAIL：当全局事务处于％s状态时，该命令无法执行。

</br>

- 错误号：1400; 符号： ER_XAER_OUTSIDE; SQLSTATE： XAE09

报错信息格式：XAER_OUTSIDE：在全局事务之外完成了一些工作。

</br>

- 错误号：1401; 符号： ER_XAER_RMERR; SQLSTATE： XAE03

报错信息格式：XAER_RMERR：事务分支中发生致命错误-检查数据的一致性。

</br>

- 错误号：1402; 符号： ER_XA_RBROLLBACK; SQLSTATE： XA100

报错信息格式：XA_RBROLLBACK：事务分支已回滚。

</br>

- 错误号：1403; 符号： ER_NONEXISTING_PROC_GRANT; SQLSTATE：42000

报错信息格式：没有为例程“％s”上的主机“％s”上的用户“％s”定义此类授予。

</br>

- 错误号：1404; 符号： ER_PROC_AUTO_GRANT_FAIL; SQLSTATE： HY000

报错信息格式：无法授予EXECUTE和ALTER ROUTINE特权。

</br>

- 错误号：1405; 符号： ER_PROC_AUTO_REVOKE_FAIL; SQLSTATE：HY000

报错信息格式：无法撤消已删除例程的所有特权。

</br>

- 错误号：1406; 符号： ER_DATA_TOO_LONG; SQLSTATE： 22001

报错信息格式：第％ld行的列'％s'的数据太长。

</br>

- 错误号：1407; 符号： ER_SP_BAD_SQLSTATE; SQLSTATE： 42000

报错信息格式：错误的SQLSTATE：'％s'。

</br>

- 错误号：1408; 符号： ER_STARTUP; SQLSTATE： HY000

报错信息格式：％s：已准备好进行连接。

版本：'％s'套接字：'％s'端口：％d％s

</br>

- 错误号：1409; 符号： ER_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR; SQLSTATE：HY000

报错信息格式：无法将具有固定大小的行的文件中的值加载到变量。

</br>

- 错误号：1410; 符号： ER_CANT_CREATE_USER_WITH_GRANT; SQLSTATE：42000

报错信息格式：不允许使用GRANT创建用户。

</br>

- 错误号：1411; 符号： ER_WRONG_VALUE_FOR_TYPE; SQLSTATE： HY000

报错信息格式：不正确的％s值：函数％s的'％s'。

</br>

- 错误号：1412; 符号： ER_TABLE_DEF_CHANGED; SQLSTATE： HY000

报错信息格式：表定义已更改，请重试事务。

</br>

- 错误号：1413; 符号： ER_SP_DUP_HANDLER; SQLSTATE： 42000

报错信息格式：在同一块中声明重复的处理程序。

</br>

- 错误号：1414; 符号： ER_SP_NOT_VAR_ARG; SQLSTATE： 42000

报错信息格式：例程％s的OUT或INOUT参数％d不是触发器之前的变量或NEW伪变量。

</br>

- 错误号：1415; 符号： ER_SP_NO_RETSET; SQLSTATE： 0A000

报错信息格式：不允许从％s返回结果集。

</br>

- 错误号：1416; 符号： ER_CANT_CREATE_GEOMETRY_OBJECT; SQLSTATE：22003

报错信息格式：无法从您发送到GEOMETRY字段的数据中获取几何对象。

</br>

- 错误号：1418; 符号： ER_BINLOG_UNSAFE_ROUTINE; SQLSTATE：HY000

报错信息格式：此函数的声明中没有DETERMINISTIC，NO SQL或READS SQL DATA，并且启用了二进制日志记录（您可能希望使用不太安全的log_bin_trust_function_creators变量）。

</br>

- 错误号：1419; 符号： ER_BINLOG_CREATE_ROUTINE_NEED_SUPER; SQLSTATE：HY000

报错信息格式：您没有SUPER特权，并且启用了二进制日志记录（您可能想使用不太安全的log_bin_trust_function_creators变量）。

</br>

- 错误号：1421; 符号： ER_STMT_HAS_NO_OPEN_CURSOR; SQLSTATE：HY000

报错信息格式：语句（％lu）没有打开的游标。


</br>

- 错误号：1422; 符号： ER_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG; SQLSTATE：HY000

报错信息格式：在存储的函数或触发器中不允许显式或隐式提交。


</br>

- 错误号：1423; 符号： ER_NO_DEFAULT_FOR_VIEW_FIELD; SQLSTATE：HY000

报错信息格式：视野'％s。

％s'基础表没有默认值

</br>

- 错误号：1424; 符号： ER_SP_NO_RECURSION; SQLSTATE： HY000

报错信息格式：不允许递归存储的函数和触发器。


</br>

- 错误号：1425; 符号： ER_TOO_BIG_SCALE; SQLSTATE： 42000

报错信息格式：为列'％s'指定的比例％d太大。

最大值为％lu。


</br>

- 错误号：1426; 符号： ER_TOO_BIG_PRECISION; SQLSTATE： 42000

报错信息格式：为'％s'指定的精度％d太大。

最大值为％lu。


</br>

- 错误号：1427; 符号： ER_M_BIGGER_THAN_D; SQLSTATE： 42000

报错信息格式：对于float（M，D），double（M，D）或小数点（M，D），M必须大于等于D（列'％s'）。


</br>

- 错误号：1428; 符号： ER_WRONG_LOCK_OF_SYSTEM_TABLE; SQLSTATE：HY000

报错信息格式：您无法将系统表的写锁定与其他表或锁类型结合使用。

</br>

- 错误号：1429; 符号： ER_CONNECT_TO_FOREIGN_DATA_SOURCE; SQLSTATE：HY000

报错信息格式：无法连接到外部数据源：％s。

</br>

- 错误号：1430; 符号： ER_QUERY_ON_FOREIGN_DATA_SOURCE; SQLSTATE：HY000

报错信息格式：在外部数据源上处理查询时出现问题。

数据源错误：％s

</br>

- 错误号：1431; 符号： ER_FOREIGN_DATA_SOURCE_DOESNT_EXIST; SQLSTATE：HY000

报错信息格式：您要引用的外部数据源不存在。

数据源错误：％s

</br>

- 错误号：1432; 符号： ER_FOREIGN_DATA_STRING_INVALID_CANT_CREATE; SQLSTATE：HY000

报错信息格式：无法创建联合表。

数据源连接字符串'％s'格式不正确

</br>

- 错误号：1433; 符号： ER_FOREIGN_DATA_STRING_INVALID; SQLSTATE：HY000

报错信息格式：数据源连接字符串'％s'格式不正确。

</br>

- 错误号：1435; 符号： ER_TRG_IN_WRONG_SCHEMA; SQLSTATE： HY000

报错信息格式：以错误的模式触发。

</br>

- 错误号：1436; 符号： ER_STACK_OVERRUN_NEED_MORE; SQLSTATE：HY000

报错信息格式：线程堆栈溢出：使用了％ld个字节堆栈中的％ld个字节，并且需要％ld个字节。

使用“ mysqld --thread_stack =＃”指定更大的堆栈。


</br>

- 错误号：1437; 符号： ER_TOO_LONG_BODY; SQLSTATE： 42000

报错信息格式：“％s”的常规正文太长。

</br>

- 错误号：1438; 符号： ER_WARN_CANT_DROP_DEFAULT_KEYCACHE; SQLSTATE：HY000

报错信息格式：无法删除默认密钥缓存。

</br>

- 错误号：1439; 符号： ER_TOO_BIG_DISPLAYWIDTH; SQLSTATE： 42000

报错信息格式：显示宽度超出列'％s'的范围（最大值=％lu）。

</br>

- 错误号：1440; 符号： ER_XAER_DUPID; SQLSTATE： XAE08

报错信息格式：XAER_DUPID：XID已经存在。

</br>

- 错误号：1441; 符号： ER_DATETIME_FUNCTION_OVERFLOW; SQLSTATE：22008

报错信息格式：日期时间函数：％s字段溢出。

</br>

- 错误号：1442; 符号： ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG; SQLSTATE：HY000

报错信息格式：无法更新存储函数/触发器中的表'％s'，因为调用该存储函数/触发器的语句已使用该表。


</br>

- 错误号：1443; 符号： ER_VIEW_PREVENT_UPDATE; SQLSTATE： HY000

报错信息格式：表'％s'的定义阻止对表'％s'进行％s操作。


</br>

- 错误号：1444; 符号： ER_PS_NO_RECURSION; SQLSTATE： HY000

报错信息格式：准备好的语句包含一个引用该相同语句的存储例程调用。

不允许以这种递归方式执行准备好的语句

</br>

- 错误号：1445; 符号： ER_SP_CANT_SET_AUTOCOMMIT; SQLSTATE：HY000

报错信息格式：不允许从存储的函数或触发器中设置自动提交。

</br>

- 错误号：1447; 符号： ER_VIEW_FRM_NO_USER; SQLSTATE： HY000

报错信息格式：视图'％s'。

'％s'没有定义程序信息（旧表格式）。

当前用户用作定义者。

请重新创建视图！

</br>

- 错误号：1448; 符号： ER_VIEW_OTHER_USER; SQLSTATE： HY000

报错信息格式：您需要使用'％s'@'％s'定义程序创建视图的SUPER特权。

</br>

- 错误号：1449; 符号： ER_NO_SUCH_USER; SQLSTATE： HY000

报错信息格式：指定为定义者的用户（'％s'@'％s'）不存在。

</br>

- 错误号：1450; 符号： ER_FORBID_SCHEMA_CHANGE; SQLSTATE： HY000

报错信息格式：不允许将模式从“％s”更改为“％s”。


</br>

- 错误号：1451; 符号： ER_ROW_IS_REFERENCED_2; SQLSTATE： 23000

报错信息格式：无法删除或更新父行：外键约束失败（％s）。

InnoDB当您尝试删除具有子项的父行且外键约束失败时，将报告此错误 。

首先删除孩子。


</br>

- 错误号：1452; 符号： ER_NO_REFERENCED_ROW_2; SQLSTATE： 23000

报错信息格式：无法添加或更新子行：外键约束失败（％s）。

InnoDB当您尝试添加行但没有父行，并且外键约束失败时，将报告此错误 。

首先添加父行。


</br>

- 错误号：1453; 符号： ER_SP_BAD_VAR_SHADOW; SQLSTATE： 42000

报错信息格式：变量'％s'必须用`...引号或重命名。

</br>

- 错误号：1454; 符号： ER_TRG_NO_DEFINER; SQLSTATE： HY000

报错信息格式：触发器'％s'。

'％s'没有定义程序属性。

不允许在没有定义器的情况下创建触发器。


</br>

- 错误号：1455; 符号： ER_OLD_FILE_FORMAT; SQLSTATE： HY000

报错信息格式：'％s'具有旧格式，您应该重新创建'％s'对象。

</br>

- 错误号：1456; 符号： ER_SP_RECURSION_LIMIT; SQLSTATE： HY000

报错信息格式：例程％s超出了递归限制％d（由max_sp_recursion_depth变量设置）。

</br>

- 错误号：1458; 符号： ER_SP_WRONG_NAME; SQLSTATE： 42000

报错信息格式：不正确的例程名称'％s'。

</br>

- 错误号：1459; 符号： ER_TABLE_NEEDS_UPGRADE; SQLSTATE： HY000

报错信息格式：需要表升级。

请执行“修复表％s”或转储/重新加载以解决该问题！

</br>

- 错误号：1460; 符号： ER_SP_NO_AGGREGATE; SQLSTATE： 42000

报错信息格式：存储的功能不支持AGGREGATE。

</br>

- 错误号：1461; 符号： ER_MAX_PREPARED_STMT_COUNT_REACHED; SQLSTATE：42000

报错信息格式：不能创建超过max_prepared_stmt_count条语句（当前值：％lu）。

</br>

- 错误号：1462; 符号： ER_VIEW_RECURSIVE; SQLSTATE： HY000

报错信息格式：％s。

％s包含视图递归

</br>

- 错误号：1463; 符号： ER_NON_GROUPING_FIELD_USED; SQLSTATE：42000

报错信息格式：％s子句中使用了非分组字段'％s'。

</br>

- 错误号：1464; 符号： ER_TABLE_CANT_HANDLE_SPKEYS; SQLSTATE：HY000

报错信息格式：使用的表类型不支持SPATIAL索引。

</br>

- 错误号：1465; 符号： ER_NO_TRIGGERS_ON_SYSTEM_SCHEMA; SQLSTATE：HY000

报错信息格式：无法在系统表上创建触发器。

</br>

- 错误号：1466; 符号： ER_REMOVED_SPACES; SQLSTATE： HY000

报错信息格式：前导空格已从名称'％s'中删除。

</br>

- 错误号：1467; 符号： ER_AUTOINC_READ_FAILED; SQLSTATE： HY000

报错信息格式：无法从存储引擎读取自动增量值。

</br>

- 错误号：1468; 符号： ER_USERNAME; SQLSTATE： HY000

报错信息格式：用户名。

</br>

- 错误号：1469; 符号： ER_HOSTNAME; SQLSTATE： HY000

报错信息格式：主机名。

</br>

- 错误号：1470; 符号： ER_WRONG_STRING_LENGTH; SQLSTATE： HY000

报错信息格式：字符串'％s'对于％s来说太长（不应超过％d）。

</br>

- 错误号：1471; 符号： ER_NON_INSERTABLE_TABLE; SQLSTATE： HY000

报错信息格式：％s的目标表％s不可插入。

</br>

- 错误号：1472; 符号： ER_ADMIN_WRONG_MRG_TABLE; SQLSTATE：HY000

报错信息格式：表'％s'定义不同或不是MyISAM类型，或者不存在。

</br>

- 错误号：1473; 符号： ER_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT; SQLSTATE：HY000

报错信息格式：嵌套级别太高，无法选择。

</br>

- 错误号：1474; 符号： ER_NAME_BECOMES_EMPTY; SQLSTATE： HY000

报错信息格式：名称“％s”已变为“。

</br>

- 错误号：1475; 符号： ER_AMBIGUOUS_FIELD_TERM; SQLSTATE： HY000

报错信息格式：FIELDS TERMINATED字符串的第一个字符不明确；请使用非可选和非空的字段。

</br>

- 错误号：1476; 符号： ER_FOREIGN_SERVER_EXISTS; SQLSTATE：HY000

报错信息格式：您尝试创建的外部服务器％s已存在。


</br>

- 错误号：1477; 符号： ER_FOREIGN_SERVER_DOESNT_EXIST; SQLSTATE：HY000

报错信息格式：您要引用的外部服务器名称不存在。

数据源错误：％s

</br>

- 错误号：1478; 符号： ER_ILLEGAL_HA_CREATE_OPTION; SQLSTATE：HY000

报错信息格式：表存储引擎'％s'不支持创建选项'％s'。

</br>

- 错误号：1479; 符号： ER_PARTITION_REQUIRES_VALUES_ERROR; SQLSTATE：HY000

报错信息格式：语法错误：％s PARTITIONING需要为每个分区定义VALUES％s。

</br>

- 错误号：1480; 符号： ER_PARTITION_WRONG_VALUES_ERROR; SQLSTATE：HY000

报错信息格式：只有％s PARTITIONING可以在分区定义中使用VALUES％s。

</br>

- 错误号：1481; 符号： ER_PARTITION_MAXVALUE_ERROR; SQLSTATE：HY000

报错信息格式：MAXVALUE只能在最后一个分区定义中使用。

</br>

- 错误号：1484; 符号： ER_PARTITION_WRONG_NO_PART_ERROR; SQLSTATE：HY000

报错信息格式：定义的分区数量错误，与先前的设置不匹配。

</br>

- 错误号：1485; 符号： ER_PARTITION_WRONG_NO_SUBPART_ERROR; SQLSTATE：HY000

报错信息格式：定义的子分区数量错误，与先前的设置不匹配。

</br>

- 错误号：1486; 符号： ER_WRONG_EXPR_IN_PARTITION_FUNC_ERROR; SQLSTATE：HY000

报错信息格式：（子）分区函数中不允许常量，随机或时区相关的表达式。

</br>

- 错误号：1488; 符号： ER_FIELD_NOT_FOUND_PART_ERROR; SQLSTATE：HY000

报错信息格式：在表中找不到分区功能的字段列表中的字段。

</br>

- 错误号：1490; 符号： ER_INCONSISTENT_PARTITION_INFO_ERROR; SQLSTATE：HY000

报错信息格式：frm文件中的分区信息与可写入frm文件的内容不一致。

</br>

- 错误号：1491; 符号： ER_PARTITION_FUNC_NOT_ALLOWED_ERROR; SQLSTATE：HY000

报错信息格式：％s函数返回错误的类型。

</br>

- 错误号：1492; 符号： ER_PARTITIONS_MUST_BE_DEFINED_ERROR; SQLSTATE：HY000

报错信息格式：对于％s分区，必须定义每个分区。

</br>

- 错误号：1493; 符号： ER_RANGE_NOT_INCREASING_ERROR; SQLSTATE：HY000

报错信息格式：每个分区的值必须小于值。

</br>

- 错误号：1494; 符号： ER_INCONSISTENT_TYPE_OF_FUNCTIONS_ERROR; SQLSTATE：HY000

报错信息格式：VALUES值必须与分区函数具有相同的类型。

</br>

- 错误号：1495; 符号： ER_MULTIPLE_DEF_CONST_IN_LIST_PART_ERROR; SQLSTATE：HY000

报错信息格式：列表分区中相同常量的多个定义。

</br>

- 错误号：1496; 符号： ER_PARTITION_ENTRY_ERROR; SQLSTATE：HY000

报错信息格式：无法在查询中单独使用分区。

</br>

- 错误号：1497; 符号： ER_MIX_HANDLER_ERROR; SQLSTATE： HY000

报错信息格式：此版本的MySQL中不允许在分区中混合使用处理程序。

</br>

- 错误号：1498; 符号： ER_PARTITION_NOT_DEFINED_ERROR; SQLSTATE：HY000

报错信息格式：对于分区引擎，必须定义所有％s。

</br>

- 错误号：1499; 符号： ER_TOO_MANY_PARTITIONS_ERROR; SQLSTATE：HY000

报错信息格式：定义了太多分区（包括子分区）。

</br>

- 错误号：1500; 符号： ER_SUBPARTITION_ERROR; SQLSTATE： HY000

报错信息格式：只能将RANGE / LIST分区与HASH / KEY分区混合以进行子分区。

</br>

- 错误号：1501; 符号： ER_CANT_CREATE_HANDLER_FILE; SQLSTATE：HY000

报错信息格式：无法创建特定的处理程序文件。

</br>

- 错误号：1502; 符号： ER_BLOB_FIELD_IN_PART_FUNC_ERROR; SQLSTATE：HY000

报错信息格式：分区功能中不允许BLOB字段。

</br>

- 错误号：1503; 符号： ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF; SQLSTATE：HY000

报错信息格式：％s必须在表的分区功能中包括所有列。

</br>

- 错误号：1504; 符号： ER_NO_PARTS_ERROR; SQLSTATE： HY000

报错信息格式：％s = 0的数量是不允许的值。

</br>

- 错误号：1505; 符号： ER_PARTITION_MGMT_ON_NONPARTITIONED; SQLSTATE：HY000

报错信息格式：无法对未分区的表进行分区管理。

</br>

- 错误号：1506; 符号： ER_FOREIGN_KEY_ON_PARTITIONED; SQLSTATE：HY000

报错信息格式：与分区结合尚不支持外键。

</br>

- 错误号：1507; 符号： ER_DROP_PARTITION_NON_EXISTENT; SQLSTATE：HY000

报错信息格式：％s分区列表中的错误。

</br>

- 错误号：1508; 符号： ER_DROP_LAST_PARTITION; SQLSTATE： HY000

报错信息格式：无法删除所有分区，请改用DROP TABLE。

</br>

- 错误号：1509; 符号： ER_COALESCE_ONLY_ON_HASH_PARTITION; SQLSTATE：HY000

报错信息格式：COALESCE PARTITION仅可用于HASH / KEY分区。

</br>

- 错误号：1510; 符号： ER_REORG_HASH_ONLY_ON_SAME_NO; SQLSTATE：HY000

报错信息格式：REORGANIZE PARTITION仅可用于重组分区，而不能更改其编号。

</br>

- 错误号：1511; 符号： ER_REORG_NO_PARAM_ERROR; SQLSTATE： HY000

报错信息格式：没有参数的REORGANIZE PARTITION只能在使用HASH PARTITIONs的自动分区表上使用。

</br>

- 错误号：1512; 符号： ER_ONLY_ON_RANGE_LIST_PARTITION; SQLSTATE：HY000

报错信息格式：％s PARTITION仅可用于RANGE / LIST分区。

</br>

- 错误号：1513; 符号： ER_ADD_PARTITION_SUBPART_ERROR; SQLSTATE：HY000

报错信息格式：尝试添加具有错误子分区数的分区。

</br>

- 错误号：1514; 符号： ER_ADD_PARTITION_NO_NEW_PARTITION; SQLSTATE：HY000

报错信息格式：必须添加至少一个分区。

</br>

- 错误号：1515; 符号： ER_COALESCE_PARTITION_NO_PARTITION; SQLSTATE：HY000

报错信息格式：必须合并至少一个分区。

</br>

- 错误号：1516; 符号： ER_REORG_PARTITION_NOT_EXIST; SQLSTATE：HY000

报错信息格式：要重组的分区多于分区。

</br>

- 错误号：1517; 符号： ER_SAME_NAME_PARTITION; SQLSTATE： HY000

报错信息格式：重复的分区名称％s。

</br>

- 错误号：1518; 符号： ER_NO_BINLOG_ERROR; SQLSTATE： HY000

报错信息格式：不允许关闭此命令上的binlog。

</br>

- 错误号：1519; 符号： ER_CONSECUTIVE_REORG_PARTITIONS; SQLSTATE：HY000

报错信息格式：重组一组分区时，它们必须是连续的顺序。

</br>

- 错误号：1520; 符号： ER_REORG_OUTSIDE_RANGE; SQLSTATE： HY000

报错信息格式：重组范围分区不能更改总范围，但可以扩展范围的最后一个分区除外。

</br>

- 错误号：1521; 符号： ER_PARTITION_FUNCTION_FAILURE; SQLSTATE：HY000

报错信息格式：此处理程序的此版本不支持分区功能。

</br>

- 错误号：1523; 符号： ER_LIMITED_PART_RANGE; SQLSTATE： HY000

报错信息格式：％s处理程序仅支持VALUES中的32位整数。

</br>

- 错误号：1524; 符号： ER_PLUGIN_IS_NOT_LOADED; SQLSTATE： HY000

报错信息格式：未加载插件'％s'。

</br>

- 错误号：1525; 符号： ER_WRONG_VALUE; SQLSTATE： HY000

报错信息格式：不正确的％s值：'％s'。

</br>

- 错误号：1526; 符号： ER_NO_PARTITION_FOR_GIVEN_VALUE; SQLSTATE：HY000

报错信息格式：表没有分区，值％s。

</br>

- 错误号：1527; 符号： ER_FILEGROUP_OPTION_ONLY_ONCE; SQLSTATE：HY000

报错信息格式：不允许多次指定％s。

</br>

- 错误号：1528; 符号： ER_CREATE_FILEGROUP_FAILED; SQLSTATE：HY000

报错信息格式：无法创建％s。

</br>

- 错误号：1529; 符号： ER_DROP_FILEGROUP_FAILED; SQLSTATE：HY000

报错信息格式：未能删除％s。

</br>

- 错误号：1530; 符号： ER_TABLESPACE_AUTO_EXTEND_ERROR; SQLSTATE：HY000

报错信息格式：处理程序不支持表空间的自动扩展。

</br>

- 错误号：1531; 符号： ER_WRONG_SIZE_NUMBER; SQLSTATE： HY000

报错信息格式：未正确指定大小参数，无论是数字还是格式为10M。

</br>

- 错误号：1532; 符号： ER_SIZE_OVERFLOW_ERROR; SQLSTATE： HY000
报错信息格式：大小数字正确，但我们不允许数字部分超过20亿。

</br>

- 错误号：1533; 符号： ER_ALTER_FILEGROUP_FAILED; SQLSTATE：HY000

报错信息格式：无法更改：％s。

</br>

- 错误号：1534; 符号： ER_BINLOG_ROW_LOGGING_FAILED; SQLSTATE：HY000

报错信息格式：将一行写入基于行的二进制日志失败。

</br>

- 错误号：1537; 符号： ER_EVENT_ALREADY_EXISTS; SQLSTATE： HY000

报错信息格式：事件'％s'已经存在。

</br>

- 错误号：1539; 符号： ER_EVENT_DOES_NOT_EXIST; SQLSTATE： HY000

报错信息格式：未知事件'％s'。

</br>

- 错误号：1542; 符号： ER_EVENT_INTERVAL_NOT_POSITIVE_OR_TOO_BIG; SQLSTATE：HY000
报错信息格式：INTERVAL不是正数或太大。

</br>

- 错误号：1543; 符号： ER_EVENT_ENDS_BEFORE_STARTS; SQLSTATE：HY000
报错信息格式：ENDS无效或在STARTS之前。

</br>

- 错误号：1544; 符号： ER_EVENT_EXEC_TIME_IN_THE_PAST; SQLSTATE：HY000

报错信息格式：事件执行时间已过去。

活动已被禁用

</br>

- 错误号：1551; 符号： ER_EVENT_SAME_NAME; SQLSTATE： HY000

报错信息格式：新旧事件名称相同。

</br>

- 错误号：1553; 符号： ER_DROP_INDEX_FK; SQLSTATE： HY000

报错信息格式：无法删除索引'％s'：在外键约束中需要。

InnoDB 当您尝试删除可以强制执行特定引用约束的最后一个索引时，将报告此错误。

为了使用DML语句获得最佳性能， InnoDB需要在外键列上存在索引 ，以便父表 上的UPDATE和DELETE操作可以轻松检查子表中是否存在对应的行。

MySQL的创建或在需要时自动下降这样的索引，作为副作用， 和 语句。

 CREATE TABLECREATE INDEXALTER TABLE
删除索引时，请InnoDB检查索引是否用于检查外键约束。

如果还有另一个可用于强制执行相同约束的索引，则仍然可以删除该索引。

InnoDB防止您删除可以强制执行特定引用约束的最后一个索引。


</br>

- 错误号：1554; 符号： ER_WARN_DEPRECATED_SYNTAX_WITH_VER; SQLSTATE：HY000

报错信息格式：不建议使用语法'％s'，并将在MySQL％s中将其删除。

请改用％s

</br>

- 错误号：1556; 符号： ER_CANT_LOCK_LOG_TABLE; SQLSTATE： HY000

报错信息格式：您不能对日志表使用锁。


</br>

- 错误号：1557; 符号： ER_FOREIGN_DUPLICATE_KEY_OLD_UNUSED; SQLSTATE：23000

报错信息格式：坚持表'％s'，条目'％s'，键％d的外键约束将导致条目重复。

</br>

- 错误号：1558; 符号： ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE; SQLSTATE：HY000

报错信息格式：mysql。

％s的列数错误。

预期％d，找到％d。

使用MySQL％d创建，现在运行％d。

请执行MySQL升级程序。


</br>

- 错误号：1559; 符号： ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR; SQLSTATE：HY000

报错信息格式：当会话具有打开的临时表时，无法切换出基于行的二进制日志格式。

ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR 在8.0.12之后被删除。


</br>

- 错误号：1560; 符号： ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_FORMAT; SQLSTATE：HY000

报错信息格式：无法更改存储的函数或触发器中的二进制日志记录格式。

</br>

- 错误号：1562; 符号： ER_PARTITION_NO_TEMPORARY; SQLSTATE：HY000

报错信息格式：无法创建具有分区的临时表。

</br>

- 错误号：1563; 符号： ER_PARTITION_CONST_DOMAIN_ERROR; SQLSTATE：HY000

报错信息格式：分区常量超出分区功能域。

</br>

- 错误号：1564; 符号： ER_PARTITION_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：不允许使用此分区功能。

</br>

- 错误号：1565; 符号： ER_DDL_LOG_ERROR; SQLSTATE： HY000

报错信息格式：DDL日志中的错误。

ER_DDL_LOG_ERROR 在8.0.1之后被删除。


</br>

- 错误号：1566; 符号： ER_NULL_IN_VALUES_LESS_THAN; SQLSTATE：HY000

报错信息格式：不允许使用小于VALUES的NULL值。

</br>

- 错误号：1567; 符号： ER_WRONG_PARTITION_NAME; SQLSTATE： HY000

报错信息格式：不正确的分区名称。

</br>

- 错误号：1568; 符号： ER_CANT_CHANGE_TX_CHARACTERISTICS; SQLSTATE：25001

报错信息格式：在进行交易时无法更改交易特征。

</br>

- 错误号：1569; 符号： ER_DUP_ENTRY_AUTOINCREMENT_CASE; SQLSTATE：HY000

报错信息格式：ALTER TABLE导致auto_increment重新排序，导致键“％s”的条目“％s”重复。

</br>

- 错误号：1571; 符号： ER_EVENT_SET_VAR_ERROR; SQLSTATE： HY000

报错信息格式：调度程序启动/停止期间出错。

错误代码％u

</br>

- 错误号：1572; 符号： ER_PARTITION_MERGE_ERROR; SQLSTATE：HY000

报错信息格式：无法在分区表中使用引擎。

</br>

- 错误号：1575; 符号： ER_BASE64_DECODE_ERROR; SQLSTATE： HY000

报错信息格式：base64字符串解码失败。

</br>

- 错误号：1576; 符号： ER_EVENT_RECURSION_FORBIDDEN; SQLSTATE：HY000

报错信息格式：当正文存在时，EVENT DDL语句的递归被禁止。

</br>

- 错误号：1578; 符号： ER_ONLY_INTEGERS_ALLOWED; SQLSTATE：HY000

报错信息格式：此处仅允许整数作为数字。

</br>

- 错误号：1579; 符号： ER_UNSUPORTED_LOG_ENGINE; SQLSTATE：HY000

报错信息格式：此存储引擎不能用于日志表。

</br>

- 错误号：1580; 符号： ER_BAD_LOG_STATEMENT; SQLSTATE： HY000

报错信息格式：如果启用了日志记录，则无法'％s'日志表。

</br>

- 错误号：1581; 符号： ER_CANT_RENAME_LOG_TABLE; SQLSTATE：HY000

报错信息格式：无法重命名'％s'。

启用日志记录后，重命名为日志表或从日志表重命名必须重命名两个表：将日志表重命名为存档表，将另一个表重命名为'％s'

</br>

- 错误号：1582; 符号： ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT; SQLSTATE：42000

报错信息格式：对本机函数'％s'的调用中参数计数不正确。

</br>

- 错误号：1583; 符号： ER_WRONG_PARAMETERS_TO_NATIVE_FCT; SQLSTATE：42000

报错信息格式：对本地函数“％s”的调用中的参数不正确。

</br>

- 错误号：1584; 符号： ER_WRONG_PARAMETERS_TO_STORED_FCT; SQLSTATE：42000

报错信息格式：对存储函数％s的调用中的参数不正确。

</br>

- 错误号：1585; 符号： ER_NATIVE_FCT_NAME_COLLISION; SQLSTATE：HY000

报错信息格式：此函数'％s'与本地函数同名。

</br>

- 错误号：1586; 符号： ER_DUP_ENTRY_WITH_KEY_NAME; SQLSTATE：23000

报错信息格式：键“％s”的条目“％s”重复。

此错误的格式字符串也与一起使用 ER_DUP_ENTRY。


</br>

- 错误号：1587; 符号： ER_BINLOG_PURGE_EMFILE; SQLSTATE： HY000

报错信息格式：打开的文件太多，请再次执行命令。

</br>

- 错误号：1588; 符号： ER_EVENT_CANNOT_CREATE_IN_THE_PAST; SQLSTATE：HY000

报错信息格式：事件执行时间已过去，并且设置了ON COMPLETION NOT PRESERVE。

该事件在创建后立即被删除。


</br>

- 错误号：1589; 符号： ER_EVENT_CANNOT_ALTER_IN_THE_PAST; SQLSTATE：HY000

报错信息格式：事件执行时间已过去，并且设置了ON COMPLETION NOT PRESERVE。

该事件未更改。

指定将来的时间。


</br>

- 错误号：1591; 符号： ER_NO_PARTITION_FOR_GIVEN_VALUE_SILENT; SQLSTATE：HY000

报错信息格式：表没有分区以用于某些现有值。

</br>

- 错误号：1592; 符号： ER_BINLOG_UNSAFE_STATEMENT; SQLSTATE：HY000

报错信息格式：由于BINLOG_FORMAT = STATEMENT，所以使用语句格式将不安全的语句写入二进制日志。

％s

</br>

- 错误号：1593; 符号： ER_BINLOG_FATAL_ERROR; SQLSTATE： HY000

报错信息格式：致命错误：％s。

ER_BINLOG_FATAL_ERROR 已在8.0.11中添加。


</br>

- 错误号：1598; 符号： ER_BINLOG_LOGGING_IMPOSSIBLE; SQLSTATE：HY000

报错信息格式：无法进行二进制日志记录。

报错信息格式：％s。

</br>

- 错误号：1599; 符号： ER_VIEW_NO_CREATION_CTX; SQLSTATE： HY000

报错信息格式：视图％s.％s没有创建上下文。

</br>

- 错误号：1600; 符号： ER_VIEW_INVALID_CREATION_CTX; SQLSTATE：HY000

报错信息格式：视图“％s”的创建上下文。

“％s”无效

</br>

- 错误号：1602; 符号： ER_TRG_CORRUPTED_FILE; SQLSTATE： HY000

报错信息格式：表％s。

％s的TRG文件损坏。


</br>

- 错误号：1603; 符号： ER_TRG_NO_CREATION_CTX; SQLSTATE： HY000

报错信息格式：表'％s.％s`的触发器没有创建上下文。

</br>

- 错误号：1604; 符号： ER_TRG_INVALID_CREATION_CTX; SQLSTATE：HY000

报错信息格式：表％s的触发器创建上下文。

％s无效

</br>

- 错误号：1605; 符号： ER_EVENT_INVALID_CREATION_CTX; SQLSTATE：HY000

报错信息格式：事件％s.％s的创建上下文无效。

</br>

- 错误号：1606; 符号： ER_TRG_CANT_OPEN_TABLE; SQLSTATE： HY000

报错信息格式：无法为触发器“％s”打开表。


</br>

- 错误号：1609; 符号： ER_NO_FORMAT_DESCRIPTION_EVENT_BEFORE_BINLOG_STATEMENT; SQLSTATE：HY000

报错信息格式：类型％s的BINLOG语句之前没有格式描述BINLOG语句。


</br>

- 错误号：1610; 符号： ER_SLAVE_CORRUPT_EVENT; SQLSTATE： HY000

报错信息格式：检测到损坏的复制事件。

</br>

- 错误号：1612; 符号： ER_LOG_PURGE_NO_FILE; SQLSTATE： HY000

报错信息格式：找不到正在清除的日志％s。

</br>

- 错误号：1613; 符号： ER_XA_RBTIMEOUT; SQLSTATE： XA106

报错信息格式：XA_RBTIMEOUT：事务分支已回滚：花了太长时间。

</br>

- 错误号：1614; 符号： ER_XA_RBDEADLOCK; SQLSTATE： XA102

报错信息格式：XA_RBDEADLOCK：事务分支已回滚：检测到死锁。

</br>

- 错误号：1615; 符号： ER_NEED_REPREPARE; SQLSTATE： HY000

报错信息格式：准备好的语句需要重新准备。

</br>

- 错误号：1617; 符号： WARN_NO_MASTER_INFO; SQLSTATE： HY000

报错信息格式：主信息结构不存在。

</br>

- 错误号：1618; 符号： WARN_OPTION_IGNORED; SQLSTATE： HY000

报错信息格式：<％s>选项被忽略。

</br>

- 错误号：1619; 符号： ER_PLUGIN_DELETE_BUILTIN; SQLSTATE：HY000

报错信息格式：内置插件无法删除。

</br>

- 错误号：1620; 符号： WARN_PLUGIN_BUSY; SQLSTATE： HY000

报错信息格式：插件正忙，将在关机时被卸载。

</br>

- 错误号：1621; 符号： ER_VARIABLE_IS_READONLY; SQLSTATE： HY000

报错信息格式：％s变量'％s'是只读的。

使用SET％s分配值

</br>

- 错误号：1622; 符号： ER_WARN_ENGINE_TRANSACTION_ROLLBACK; SQLSTATE：HY000

报错信息格式：存储引擎％s不支持此语句的回滚。

事务回滚，必须重新启动

</br>

- 错误号：1624; 符号： ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE; SQLSTATE：HY000

报错信息格式：心跳周期的请求值是负值或超过了所允许的最大值（％s秒）。


</br>

- 错误号：1625; 符号： ER_NDB_REPLICATION_SCHEMA_ERROR; SQLSTATE：HY000

报错信息格式：mysql.ndb_replication表的错误模式。

报错信息格式：％s。

</br>

- 错误号：1626; 符号： ER_CONFLICT_FN_PARSE_ERROR; SQLSTATE：HY000

报错信息格式：解析冲突函数时出错。

报错信息格式：％s。

</br>

- 错误号：1627; 符号： ER_EXCEPTIONS_WRITE_ERROR; SQLSTATE：HY000

报错信息格式：写入例外表失败。

报错信息格式：％s。

</br>

- 错误号：1628; 符号： ER_TOO_LONG_TABLE_COMMENT; SQLSTATE：HY000

报错信息格式：表'％s'的注释过长（最大值=％lu）。

</br>

- 错误号：1629; 符号： ER_TOO_LONG_FIELD_COMMENT; SQLSTATE：HY000

报错信息格式：字段'％s'的注释过长（最大值=％lu）。

</br>

- 错误号：1630; 符号： ER_FUNC_INEXISTENT_NAME_COLLISION; SQLSTATE：42000

报错信息格式：功能％s不存在。

检查参考手册中的“函数名称解析和解析”部分

</br>

- 错误号：1631; 符号： ER_DATABASE_NAME; SQLSTATE： HY000
报错信息格式：资料库。

</br>

- 错误号：1632; 符号： ER_TABLE_NAME; SQLSTATE： HY000
报错信息格式：表格。

</br>

- 错误号：1633; 符号： ER_PARTITION_NAME; SQLSTATE： HY000
报错信息格式：分区。

</br>

- 错误号：1634; 符号： ER_SUBPARTITION_NAME; SQLSTATE： HY000

报错信息格式：子分区。

</br>

- 错误号：1635; 符号： ER_TEMPORARY_NAME; SQLSTATE： HY000
报错信息格式：临时。

</br>

- 错误号：1636; 符号： ER_RENAMED_NAME; SQLSTATE： HY000
报错信息格式：已重命名。

</br>

- 错误号：1637; 符号： ER_TOO_MANY_CONCURRENT_TRXS; SQLSTATE：HY000

报错信息格式：活动并发事务太多。

</br>

- 错误号：1638; 符号： WARN_NON_ASCII_SEPARATOR_NOT_IMPLEMENTED; SQLSTATE：HY000

报错信息格式：不完全支持非ASCII分隔符参数。

</br>

- 错误号：1639; 符号： ER_DEBUG_SYNC_TIMEOUT; SQLSTATE： HY000

报错信息格式：调试同步点等待超时。

</br>

- 错误号：1640; 符号： ER_DEBUG_SYNC_HIT_LIMIT; SQLSTATE： HY000

报错信息格式：达到调试同步点命中限制。

</br>

- 错误号：1641; 符号： ER_DUP_SIGNAL_SET; SQLSTATE： 42000

报错信息格式：重复的条件信息项'％s'。

</br>

- 错误号：1642; 符号： ER_SIGNAL_WARN; SQLSTATE： 01000

报错信息格式：未处理的用户定义警告条件。

</br>

- 错误号：1643; 符号： ER_SIGNAL_NOT_FOUND; SQLSTATE： 02000

报错信息格式：未处理的用户定义找不到条件。

</br>

- 错误号：1644; 符号： ER_SIGNAL_EXCEPTION; SQLSTATE： HY000

报错信息格式：未处理的用户定义的异常情况。

</br>

- 错误号：1645; 符号： ER_RESIGNAL_WITHOUT_ACTIVE_HANDLER; SQLSTATE：0K000

报错信息格式：当处理程序不活动时，RESIGNAL。

</br>

- 错误号：1646; 符号： ER_SIGNAL_BAD_CONDITION_TYPE; SQLSTATE：HY000

报错信息格式：SIGNAL / RESIGNAL只能使用通过SQLSTATE定义的CONDITION。

</br>

- 错误号：1647; 符号： WARN_COND_ITEM_TRUNCATED; SQLSTATE：HY000

报错信息格式：条件项目“％s”的数据被截断。

</br>

- 错误号：1648; 符号： ER_COND_ITEM_TOO_LONG; SQLSTATE： HY000

报错信息格式：数据对于条件项“％s”而言过长。

</br>

- 错误号：1649; 符号： ER_UNKNOWN_LOCALE; SQLSTATE： HY000

报错信息格式：未知语言环境：“％s”。

</br>

- 错误号：1650; 符号： ER_SLAVE_IGNORE_SERVER_IDS; SQLSTATE：HY000

报错信息格式：请求的服务器标识％d与从属启动选项--replicate-same-server-id冲突。

</br>

- 错误号：1651; 符号： ER_QUERY_CACHE_DISABLED; SQLSTATE： HY000

报错信息格式：查询缓存已禁用；使用query_cache_type = 1重新启动服务器以启用它。

ER_QUERY_CACHE_DISABLED 在8.0.2之后被删除。


</br>

- 错误号：1652; 符号： ER_SAME_NAME_PARTITION_FIELD; SQLSTATE：HY000

报错信息格式：重复的分区字段名称'％s'。

</br>

- 错误号：1653; 符号： ER_PARTITION_COLUMN_LIST_ERROR; SQLSTATE：HY000

报错信息格式：用于分区的列列表用法不一致。

</br>

- 错误号：1654; 符号： ER_WRONG_TYPE_COLUMN_VALUE_ERROR; SQLSTATE：HY000

报错信息格式：类型不正确的分区列值。

</br>

- 错误号：1655; 符号： ER_TOO_MANY_PARTITION_FUNC_FIELDS_ERROR; SQLSTATE：HY000

报错信息格式：“％s”中的字段太多。

</br>

- 错误号：1656; 符号： ER_MAXVALUE_IN_VALUES_IN; SQLSTATE：HY000

报错信息格式：不能将MAXVALUE用作VALUES IN中的值。

</br>

- 错误号：1657; 符号： ER_TOO_MANY_VALUES_ERROR; SQLSTATE：HY000

报错信息格式：这种类型的％s分区不能有多个值。

</br>

- 错误号：1658; 符号： ER_ROW_SINGLE_PARTITION_FIELD_ERROR; SQLSTATE：HY000

报错信息格式：VALUES IN中的行表达式仅允许用于多字段列分区。

</br>

- 错误号：1659; 符号： ER_FIELD_TYPE_NOT_ALLOWED_AS_PARTITION_FIELD; SQLSTATE：HY000

报错信息格式：此分区类型的字段'％s'是不允许的类型。

</br>

- 错误号：1660; 符号： ER_PARTITION_FIELDS_TOO_LONG; SQLSTATE：HY000

报错信息格式：分区字段的总长度太大。

</br>

- 错误号：1661; 符号： ER_BINLOG_ROW_ENGINE_AND_STMT_ENGINE; SQLSTATE：HY000

报错信息格式：无法执行语句：由于无法使用行的引擎和不能使用语句的引擎，因此无法写入二进制日志。


</br>

- 错误号：1662; 符号： ER_BINLOG_ROW_MODE_AND_STMT_ENGINE; SQLSTATE：HY000

报错信息格式：无法执行语句：由于BINLOG_FORMAT = ROW并且至少一个表使用了仅限于基于语句的日志记录的存储引擎，因此无法写入二进制日志。


</br>

- 错误号：1663; 符号： ER_BINLOG_UNSAFE_AND_STMT_ENGINE; SQLSTATE：HY000

报错信息格式：无法执行语句：由于语句不安全，存储引擎仅限于基于语句的日志记录，并且BINLOG_FORMAT = MIXED，因此无法写入二进制日志。

％s

</br>

- 错误号：1664; 符号： ER_BINLOG_ROW_INJECTION_AND_STMT_ENGINE; SQLSTATE：HY000

报错信息格式：无法执行语句：由于语句为行格式，并且至少一个表使用仅限于基于语句的日志记录的存储引擎，因此无法写入二进制日志。


</br>

- 错误号：1665; 符号： ER_BINLOG_STMT_MODE_AND_ROW_ENGINE; SQLSTATE：HY000

报错信息格式：无法执行语句：由于BINLOG_FORMAT = STATEMENT并且至少一个表使用了仅限于基于行的日志记录的存储引擎，因此无法写入二进制日志。

％s

</br>

- 错误号：1666; 符号： ER_BINLOG_ROW_INJECTION_AND_STMT_MODE; SQLSTATE：HY000

报错信息格式：无法执行语句：由于语句为行格式且BINLOG_FORMAT = STATEMENT，因此无法写入二进制日志。


</br>

- 错误号：1667; 符号： ER_BINLOG_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE; SQLSTATE：HY000

报错信息格式：无法执行语句：无法写入二进制日志，因为涉及多个引擎并且至少一个引擎是自记录的。


</br>

- 错误号：1668; 符号： ER_BINLOG_UNSAFE_LIMIT; SQLSTATE： HY000

报错信息格式：该语句是不安全的，因为它使用了LIMIT子句。

这是不安全的，因为无法预测其中包含的行集。


</br>

- 错误号：1670; 符号： ER_BINLOG_UNSAFE_SYSTEM_TABLE; SQLSTATE：HY000

报错信息格式：该语句不安全，因为它使用常规日志，慢查询日志或Performance_schema表。

这是不安全的，因为系统表在从站上可能有所不同。


</br>

- 错误号：1671; 符号： ER_BINLOG_UNSAFE_AUTOINC_COLUMNS; SQLSTATE：HY000

报错信息格式：语句是不安全的，因为它调用插入到AUTO_INCREMENT列中的触发器或存储函数。

插入值无法正确记录。


</br>

- 错误号：1672; 符号： ER_BINLOG_UNSAFE_UDF; SQLSTATE： HY000

报错信息格式：语句是不安全的，因为它使用的UDF可能在从属服务器上未返回相同的值。


</br>

- 错误号：1673; 符号： ER_BINLOG_UNSAFE_SYSTEM_VARIABLE; SQLSTATE：HY000

报错信息格式：语句是不安全的，因为它使用的系统变量在从站上可能具有不同的值。


</br>

- 错误号：1674; 符号： ER_BINLOG_UNSAFE_SYSTEM_FUNCTION; SQLSTATE：HY000

报错信息格式：语句是不安全的，因为它使用的系统功能可能会在从站上返回不同的值。


</br>

- 错误号：1675; 符号： ER_BINLOG_UNSAFE_NONTRANS_AFTER_TRANS; SQLSTATE：HY000

报错信息格式：语句是不安全的，因为它在访问同一事务内的事务表之后访问了非事务表。


</br>

- 错误号：1676; 符号： ER_MESSAGE_AND_STATEMENT; SQLSTATE：HY000

报错信息格式：％s声明：％s。

</br>

- 错误号：1677; 符号： ER_SLAVE_CONVERSION_FAILED; SQLSTATE：HY000

报错信息格式：表'％s。

％s'的列％d无法从类型'％s'转换为类型'％s'
ER_SLAVE_CONVERSION_FAILED 在8.0.4之后被删除。


</br>

- 错误号：1678; 符号： ER_SLAVE_CANT_CREATE_CONVERSION; SQLSTATE：HY000

报错信息格式：无法为表'％s。

％s'创建转换表

</br>

- 错误号：1679; 符号： ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_FORMAT; SQLSTATE：HY000

报错信息格式：无法修改事务中的@@ session.binlog_format。

</br>

- 错误号：1680; 符号： ER_PATH_LENGTH; SQLSTATE： HY000

报错信息格式：为％s指定的路径太长。


</br>

- 错误号：1681; 符号： ER_WARN_DEPRECATED_SYNTAX_NO_REPLACEMENT; SQLSTATE：HY000

报错信息格式：'％s'已过时，将在以后的版本中删除。


</br>

- 错误号：1682; 符号： ER_WRONG_NATIVE_TABLE_STRUCTURE; SQLSTATE：HY000

报错信息格式：本机表'％s'。

'％s'具有错误的结构

</br>

- 错误号：1683; 符号： ER_WRONG_PERFSCHEMA_USAGE; SQLSTATE：HY000

报错信息格式：无效的performance_schema用法。


</br>

- 错误号：1684; 符号： ER_WARN_I_S_SKIPPED_TABLE; SQLSTATE：HY000

报错信息格式：表'％s'。

'％s'被跳过，因为其定义被并发DDL语句修改

</br>

- 错误号：1685; 符号： ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_DIRECT; SQLSTATE：HY000

报错信息格式：无法修改事务内的@@ session.binlog_direct_non_transactional_updates。

</br>

- 错误号：1686; 符号： ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_DIRECT; SQLSTATE：HY000

报错信息格式：无法更改存储的函数或触发器中的binlog直接标志。

</br>

- 错误号：1687; 符号： ER_SPATIAL_MUST_HAVE_GEOM_COL; SQLSTATE：42000

报错信息格式：一个空间索引只能包含一个几何类型列。

</br>

- 错误号：1688; 符号： ER_TOO_LONG_INDEX_COMMENT; SQLSTATE：HY000

报错信息格式：索引'％s'的注释过长（最大值=％lu）。

</br>

- 错误号：1689; 符号： ER_LOCK_ABORTED; SQLSTATE： HY000

报错信息格式：等待锁由于挂起的排他锁而中止。

</br>

- 错误号：1690; 符号： ER_DATA_OUT_OF_RANGE; SQLSTATE： 22003

报错信息格式：％s值超出了'％s'中的范围。

</br>

- 错误号：1691; 符号： ER_WRONG_SPVAR_TYPE_IN_LIMIT; SQLSTATE：HY000

报错信息格式：LIMIT子句中基于非整数类型的变量。

</br>

- 错误号：1692; 符号： ER_BINLOG_UNSAFE_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE; SQLSTATE：HY000

报错信息格式：在语句中混合使用自记录引擎和非自记录引擎是不安全的。


</br>

- 错误号：1693; 符号： ER_BINLOG_UNSAFE_MIXED_STATEMENT; SQLSTATE：HY000

报错信息格式：语句访问非事务表以及事务或临时表，并写入其中的任何一个。


</br>

- 错误号：1694; 符号： ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_SQL_LOG_BIN; SQLSTATE：HY000

报错信息格式：无法修改事务中的@@ session.sql_log_bin。

</br>

- 错误号：1695; 符号： ER_STORED_FUNCTION_PREVENTS_SWITCH_SQL_LOG_BIN; SQLSTATE：HY000

报错信息格式：无法在存储的函数或触发器中更改sql_log_bin。

</br>

- 错误号：1696; 符号： ER_FAILED_READ_FROM_PAR_FILE; SQLSTATE：HY000

报错信息格式：无法从.par文件读取。

</br>

- 错误号：1697; 符号： ER_VALUES_IS_NOT_INT_TYPE_ERROR; SQLSTATE：HY000

报错信息格式：分区'％s'的VALUES值必须具有INT类型。

</br>

- 错误号：1698; 符号： ER_ACCESS_DENIED_NO_PASSWORD_ERROR; SQLSTATE：28000

报错信息格式：对用户'％s'@'％s'的访问被拒绝。

</br>

- 错误号：1699; 符号： ER_SET_PASSWORD_AUTH_PLUGIN; SQLSTATE：HY000

报错信息格式：SET PASSWORD对用户通过插件进行身份验证没有意义。

</br>

- 错误号：1701; 符号： ER_TRUNCATE_ILLEGAL_FK; SQLSTATE： 42000

报错信息格式：无法截断外键约束（％s）中引用的表。

</br>

- 错误号：1702; 符号： ER_PLUGIN_IS_PERMANENT; SQLSTATE： HY000

报错信息格式：插件'％s'是force_plus_permanent，无法卸载。

</br>

- 错误号：1703; 符号： ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN; SQLSTATE：HY000

报错信息格式：心跳周期的请求值小于1毫秒。

将该值重置为0，这意味着将有效禁用心跳。


</br>

- 错误号：1704; 符号： ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX; SQLSTATE：HY000

报错信息格式：心跳周期的请求值超过了“ slave_net_timeout”秒的值。

该时间段的合理值应小于超时值。


</br>

- 错误号：1705; 符号： ER_STMT_CACHE_FULL; SQLSTATE： HY000

报错信息格式：多行语句需要超过“ max_binlog_stmt_cache_size”个字节的存储空间；增加此mysqld变量，然后重试。

</br>

- 错误号：1706; 符号： ER_MULTI_UPDATE_KEY_CONFLICT; SQLSTATE：HY000

报错信息格式：不允许更新主键/分区键，因为表被同时更新为'％s'和'％s'。


</br>

- 错误号：1707; 符号： ER_TABLE_NEEDS_REBUILD; SQLSTATE： HY000

报错信息格式：需要重建表。

请执行“ ALTER TABLE％s FORCE”或转储/重新加载以解决该问题！

</br>

- 错误号：1708; 符号： WARN_OPTION_BELOW_LIMIT; SQLSTATE： HY000

报错信息格式：“％s”的值应不小于“％s”的值。

</br>

- 错误号：1709; 符号： ER_INDEX_COLUMN_TOO_LONG; SQLSTATE：HY000

报错信息格式：索引列大小太大。

最大列大小为％lu个字节。


</br>

- 错误号：1710; 符号： ER_ERROR_IN_TRIGGER_BODY; SQLSTATE：HY000

报错信息格式：触发器“％s”的内文有错误：“％s”。

</br>

- 错误号：1711; 符号： ER_ERROR_IN_UNKNOWN_TRIGGER_BODY; SQLSTATE：HY000

报错信息格式：未知触发器的主体中有错误：'％s'。

</br>

- 错误号：1712; 符号： ER_INDEX_CORRUPT; SQLSTATE： HY000

报错信息格式：索引％s已损坏。

</br>

- 错误号：1713; 符号： ER_UNDO_RECORD_TOO_BIG; SQLSTATE： HY000

报错信息格式：撤消日志记录太大。


</br>

- 错误号：1714; 符号： ER_BINLOG_UNSAFE_INSERT_IGNORE_SELECT; SQLSTATE：HY000

报错信息格式：INSERT IGNORE ... SELECT是不安全的，因为SELECT检索行的顺序决定了忽略哪些行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1715; 符号： ER_BINLOG_UNSAFE_INSERT_SELECT_UPDATE; SQLSTATE：HY000

报错信息格式：INSERT ... SELECT ... ON DUPLICATE KEY UPDATE不安全，因为SELECT检索行的顺序决定了要更新的行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1716; 符号： ER_BINLOG_UNSAFE_REPLACE_SELECT; SQLSTATE：HY000

报错信息格式：REPLACE ... SELECT是不安全的，因为SELECT检索行的顺序决定了要替换的行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1717; 符号： ER_BINLOG_UNSAFE_CREATE_IGNORE_SELECT; SQLSTATE：HY000

报错信息格式：CREATE ... IGNORE SELECT是不安全的，因为SELECT检索行的顺序决定了忽略哪些行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1718; 符号： ER_BINLOG_UNSAFE_CREATE_REPLACE_SELECT; SQLSTATE：HY000

报错信息格式：CREATE ... REPLACE SELECT是不安全的，因为SELECT检索行的顺序决定了要替换的行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1719; 符号： ER_BINLOG_UNSAFE_UPDATE_IGNORE; SQLSTATE：HY000

报错信息格式：UPDATE IGNORE是不安全的，因为更新行的顺序决定了忽略哪些（如果有）行。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1720; 符号： ER_PLUGIN_NO_UNINSTALL; SQLSTATE： HY000

报错信息格式：插件'％s'被标记为不可动态卸载。

您必须停止服务器才能将其卸载。


</br>

- 错误号：1721; 符号： ER_PLUGIN_NO_INSTALL; SQLSTATE： HY000

报错信息格式：插件'％s'被标记为不可动态安装。

您必须停止服务器才能安装它。


</br>

- 错误号：1722; 符号： ER_BINLOG_UNSAFE_WRITE_AUTOINC_SELECT; SQLSTATE：HY000

报错信息格式：从另一个表中进行选择后，写入具有自动增量列的表的语句是不安全的，因为检索行的顺序决定了要写入的行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1723; 符号： ER_BINLOG_UNSAFE_CREATE_SELECT_AUTOINC; SQLSTATE：HY000

报错信息格式：具有自动增量列的表上的CREATE TABLE ... SELECT ...是不安全的，因为SELECT检索行的顺序决定了要插入的行（如果有）。

该顺序无法预测，并且在主机和从机上可能会有所不同。


</br>

- 错误号：1724; 符号： ER_BINLOG_UNSAFE_INSERT_TWO_KEYS; SQLSTATE：HY000

报错信息格式：INSERT ...在具有多个UNIQUE KEY的表上进行DUPLICATE KEY UPDATE不安全。

</br>

- 错误号：1725; 符号： ER_TABLE_IN_FK_CHECK; SQLSTATE： HY000

报错信息格式：表正在外键检查中。


</br>

- 错误号：1726; 符号： ER_UNSUPPORTED_ENGINE; SQLSTATE： HY000

报错信息格式：存储引擎'％s'不支持系统表。

[％s。

％s]

</br>

- 错误号：1727; 符号： ER_BINLOG_UNSAFE_AUTOINC_NOT_FIRST; SQLSTATE：HY000

报错信息格式：插入不是自动组成字段的第一部分的自动增量字段是不安全的。


</br>

- 错误号：1728; 符号： ER_CANNOT_LOAD_FROM_TABLE_V2; SQLSTATE：HY000

报错信息格式：无法从％s。

％s加载。

该表可能已损坏

</br>

- 错误号：1729; 符号： ER_MASTER_DELAY_VALUE_OUT_OF_RANGE; SQLSTATE：HY000

报错信息格式：主延迟请求的值％s超过最大％u。

</br>

- 错误号：1730; 符号： ER_ONLY_FD_AND_RBR_EVENTS_ALLOWED_IN_BINLOG_STATEMENT; SQLSTATE：HY000

报错信息格式：BINLOG语句中仅允许Format_description_log_event和行事件（但提供了％s）。

</br>

- 错误号：1731; 符号： ER_PARTITION_EXCHANGE_DIFFERENT_OPTION; SQLSTATE：HY000

报错信息格式：分区和表之间的属性'％s'不匹配。

</br>

- 错误号：1732; 符号： ER_PARTITION_EXCHANGE_PART_TABLE; SQLSTATE：HY000

报错信息格式：要与分区交换的表已分区：'％s'。

</br>

- 错误号：1733; 符号： ER_PARTITION_EXCHANGE_TEMP_TABLE; SQLSTATE：HY000

报错信息格式：要与分区交换的表是临时的：'％s'。

</br>

- 错误号：1734; 符号： ER_PARTITION_INSTEAD_OF_SUBPARTITION; SQLSTATE：HY000

报错信息格式：分区表，使用分区代替分区。

</br>

- 错误号：1735; 符号： ER_UNKNOWN_PARTITION; SQLSTATE： HY000

报错信息格式：表'％s'中未知分区'％s'。

</br>

- 错误号：1736; 符号： ER_TABLES_DIFFERENT_METADATA; SQLSTATE：HY000

报错信息格式：表具有不同的定义。

</br>

- 错误号：1737; 符号： ER_ROW_DOES_NOT_MATCH_PARTITION; SQLSTATE：HY000

报错信息格式：找到与分区不匹配的行。

</br>

- 错误号：1738; 符号： ER_BINLOG_CACHE_SIZE_GREATER_THAN_MAX; SQLSTATE：HY000

报错信息格式：选项binlog_cache_size（％lu）大于max_binlog_cache_size（％lu）; 设置binlog_cache_size等于max_binlog_cache_size。


</br>

- 错误号：1739; 符号： ER_WARN_INDEX_NOT_APPLICABLE; SQLSTATE：HY000

报错信息格式：由于字段'％s'上的类型或排序规则转换，无法在索引'％s'上使用％s访问。

</br>

- 错误号：1740; 符号： ER_PARTITION_EXCHANGE_FOREIGN_KEY; SQLSTATE：HY000

报错信息格式：要与分区交换的表具有外键引用：'％s'。

</br>

- 错误号：1742; 符号： ER_RPL_INFO_DATA_TOO_LONG; SQLSTATE：HY000

报错信息格式：列“％s”的数据太长。

</br>

- 错误号：1745; 符号： ER_BINLOG_STMT_CACHE_SIZE_GREATER_THAN_MAX; SQLSTATE：HY000

报错信息格式：选项binlog_stmt_cache_size（％lu）大于max_binlog_stmt_cache_size（％lu）；设置binlog_stmt_cache_size等于max_binlog_stmt_cache_size。


</br>

- 错误号：1746; 符号： ER_CANT_UPDATE_TABLE_IN_CREATE_TABLE_SELECT; SQLSTATE：HY000

报错信息格式：创建'％s'时无法更新表'％s'。


</br>

- 错误号：1747; 符号： ER_PARTITION_CLAUSE_ON_NONPARTITIONED; SQLSTATE：HY000

报错信息格式：非分区表上的PARTITION（）子句。

</br>

- 错误号：1748; 符号： ER_ROW_DOES_NOT_MATCH_GIVEN_PARTITION_SET; SQLSTATE：HY000

报错信息格式：找到与给定分区集不匹配的行。

</br>

- 错误号：1750; 符号： ER_CHANGE_RPL_INFO_REPOSITORY_FAILURE; SQLSTATE：HY000

报错信息格式：更改复制存储库类型：％s时失败。


</br>

- 错误号：1751; 符号： ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_CREATED_TEMP_TABLE; SQLSTATE：HY000

报错信息格式：无法还原某些临时表的创建。


</br>

- 错误号：1752; 符号： ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_DROPPED_TEMP_TABLE; SQLSTATE：HY000

报错信息格式：删除了一些临时表，但是这些操作无法回滚。


</br>

- 错误号：1753; 符号： ER_MTS_FEATURE_IS_NOT_SUPPORTED; SQLSTATE：HY000

报错信息格式：在多线程从属模式下不支持％s。

％s

</br>

- 错误号：1754; 符号： ER_MTS_UPDATED_DBS_GREATER_MAX; SQLSTATE：HY000

报错信息格式：已修改的数据库数超过最大％d；数据库名称将不包含在复制事件元数据中。


</br>

- 错误号：1755; 符号： ER_MTS_CANT_PARALLEL; SQLSTATE： HY000

报错信息格式：无法在并行模式下执行当前事件组。

遇到事件％s，中继日志名称％s，位置％s，这会阻止在并行模式下执行此事件组。

原因：％s。


</br>

- 错误号：1756; 符号： ER_MTS_INCONSISTENT_DATA; SQLSTATE：HY000
报错信息格式：％s。

</br>

- 错误号：1757; 符号： ER_FULLTEXT_NOT_SUPPORTED_WITH_PARTITIONING; SQLSTATE：HY000

报错信息格式：分区表不支持FULLTEXT索引。


</br>

- 错误号：1758; 符号： ER_DA_INVALID_CONDITION_NUMBER; SQLSTATE：35000

报错信息格式：无效的条件编号。

</br>

- 错误号：1759; 符号： ER_INSECURE_PLAIN_TEXT; SQLSTATE： HY000

报错信息格式：发送不带SSL / TLS的纯文本密码非常不安全。


</br>

- 错误号：1760; 符号： ER_INSECURE_CHANGE_MASTER; SQLSTATE：HY000

报错信息格式：在主信息存储库中存储MySQL用户名或密码信息是不安全的，因此不建议这样做。

请考虑将USER和PASSWORD连接选项用于START SLAVE；有关更多信息，请参见MySQL手册中的“ START SLAVE语法”。


</br>

- 错误号：1761; 符号： ER_FOREIGN_DUPLICATE_KEY_WITH_CHILD_INFO; SQLSTATE：23000

报错信息格式：表'％s'的外键约束，记录'％s'将导致表'％s'中的重复条目，键'％s'。

</br>

- 错误号：1762; 符号： ER_FOREIGN_DUPLICATE_KEY_WITHOUT_CHILD_INFO; SQLSTATE：23000

报错信息格式：表'％s'的外键约束，记录'％s'将导致子表中的条目重复。

</br>

- 错误号：1763; 符号： ER_SQLTHREAD_WITH_SECURE_SLAVE; SQLSTATE：HY000

报错信息格式：仅从属SQL线程正在启动时，无法设置身份验证选项。


</br>

- 错误号：1764; 符号： ER_TABLE_HAS_NO_FT; SQLSTATE： HY000

报错信息格式：该表没有FULLTEXT索引来支持此查询。

</br>

- 错误号：1765; 符号： ER_VARIABLE_NOT_SETTABLE_IN_SF_OR_TRIGGER; SQLSTATE：HY000

报错信息格式：无法在存储的函数或触发器中设置系统变量％s。


</br>

- 错误号：1766; 符号： ER_VARIABLE_NOT_SETTABLE_IN_TRANSACTION; SQLSTATE：HY000

报错信息格式：正在进行事务时，无法设置系统变量％s。


</br>

- 错误号：1769; 符号： ER_SET_STATEMENT_CANNOT_INVOKE_FUNCTION; SQLSTATE：HY000

报错信息格式：语句'SET％s'无法调用存储的函数。


</br>

- 错误号：1770; 符号： ER_GTID_NEXT_CANT_BE_AUTOMATIC_IF_GTID_NEXT_LIST_IS_NON_NULL; SQLSTATE：HY000

报错信息格式：当@@ SESSION.GTID_NEXT_LIST为非NULL时，系统变量@@ SESSION.GTID_NEXT不能为“ AUTOMATIC”。


</br>

- 错误号：1772; 符号： ER_MALFORMED_GTID_SET_SPECIFICATION; SQLSTATE：HY000

报错信息格式：格式错误的GTID集规范'％s'。


</br>

- 错误号：1773; 符号： ER_MALFORMED_GTID_SET_ENCODING; SQLSTATE：HY000

报错信息格式：格式错误的GTID集编码。


</br>

- 错误号：1774; 符号： ER_MALFORMED_GTID_SPECIFICATION; SQLSTATE：HY000

报错信息格式：格式错误的GTID规范'％s'。


</br>

- 错误号：1775; 符号： ER_GNO_EXHAUSTED; SQLSTATE： HY000

报错信息格式：无法生成全局事务标识符：整数部分达到最大值。

使用新的server_uuid重新启动服务器。


</br>

- 错误号：1776; 符号： ER_BAD_SLAVE_AUTO_POSITION; SQLSTATE：HY000

报错信息格式：当MASTER_AUTO_POSITION处于活动状态时，无法设置参数MASTER_LOG_FILE，MASTER_LOG_POS，RELAY_LOG_FILE和RELAY_LOG_POS。


</br>

- 错误号：1777; 符号： ER_AUTO_POSITION_REQUIRES_GTID_MODE_NOT_OFF; SQLSTATE：HY000

报错信息格式：由于@@ GLOBAL.GTID_MODE = OFF，无法执行CHANGE MASTER TO MASTER_AUTO_POSITION = 1。


</br>

- 错误号：1778; 符号： ER_CANT_DO_IMPLICIT_COMMIT_IN_TRX_WHEN_GTID_NEXT_IS_SET; SQLSTATE：HY000

报错信息格式：@@ SESSION.GTID_NEXT =='UUID：NUMBER'时，无法在事务内执行带有隐式提交的语句。


</br>

- 错误号：1779; 符号： ER_GTID_MODE_ON_REQUIRES_ENFORCE_GTID_CONSISTENCY_ON; SQLSTATE：HY000

报错信息格式：GTID_MODE = ON需要ENFORCE_GTID_CONSISTENCY = ON。


</br>

- 错误号：1781; 符号： ER_CANT_SET_GTID_NEXT_TO_GTID_WHEN_GTID_MODE_IS_OFF; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_MODE = OFF时，不能将@@ SESSION.GTID_NEXT设置为UUID：NUMBER。


</br>

- 错误号：1782; 符号： ER_CANT_SET_GTID_NEXT_TO_ANONYMOUS_WHEN_GTID_MODE_IS_ON; SQLSTATE：HY000

报错信息格式：当@@ GLOBAL.GTID_MODE = ON时，不能将@@ SESSION.GTID_NEXT设置为匿名。


</br>

- 错误号：1783; 符号： ER_CANT_SET_GTID_NEXT_LIST_TO_NON_NULL_WHEN_GTID_MODE_IS_OFF; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_MODE = OFF时，不能将@@ SESSION.GTID_NEXT_LIST设置为非NULL值。


</br>

- 错误号：1785; 符号： ER_GTID_UNSAFE_NON_TRANSACTIONAL_TABLE; SQLSTATE：HY000

报错信息格式：语句违反了GTID一致性：非事务表的更新只能在自动提交的语句或单语句事务中完成，而不能在与事务表的更新相同的语句中完成。


</br>

- 错误号：1786; 符号： ER_GTID_UNSAFE_CREATE_SELECT; SQLSTATE：HY000

报错信息格式：语句违反了GTID一致性：CREATE TABLE ... SELECT。


</br>

- 错误号：1787; 符号： ER_GTID_UNSAFE_CREATE_DROP_TEMPORARY_TABLE_IN_TRANSACTION; SQLSTATE：HY000

报错信息格式：语句违反了GTID一致性：CREATE TEMPORARY TABLE和DROP TEMPORARY TABLE只能在事务上下文之外执行。

在函数或触发器中也不允许使用这些语句，因为函数和触发器也被视为多语句事务。

ER_GTID_UNSAFE_CREATE_DROP_TEMPORARY_TABLE_IN_TRANSACTION 在8.0.12之后被删除。


</br>

- 错误号：1788; 符号： ER_GTID_MODE_CAN_ONLY_CHANGE_ONE_STEP_AT_A_TIME; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_MODE的值一次只能更改一次：OFF <-> OFF_PERMISSIVE <-> ON_PERMISSIVE <-> ON。

还请注意，必须在所有服务器上同时提高或降低此值。

有关说明，请参见手册。


</br>

- 错误号：1789; 符号： ER_MASTER_HAS_PURGED_REQUIRED_GTIDS; SQLSTATE：HY000

报错信息格式：无法复制，因为主服务器清除了所需的二进制日志。

从其他位置复制丢失的事务，或从备份中配置新的从服务器。

考虑增加主服务器的二进制日志到期时间。

％s

</br>

- 错误号：1790; 符号： ER_CANT_SET_GTID_NEXT_WHEN_OWNING_GTID; SQLSTATE：HY000

报错信息格式：@@ SESSION.GTID_NEXT无法由拥有GTID的客户端更改。

客户拥有％s。

所有权在COMMIT或ROLLBACK上释放。


</br>

- 错误号：1791; 符号： ER_UNKNOWN_EXPLAIN_FORMAT; SQLSTATE：HY000

报错信息格式：未知的EXPLAIN格式名称：'％s'。

</br>

- 错误号：1792; 符号： ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION; SQLSTATE：25006

报错信息格式：无法在只读事务中执行语句。


</br>

- 错误号：1793; 符号： ER_TOO_LONG_TABLE_PARTITION_COMMENT; SQLSTATE：HY000

报错信息格式：表分区'％s'的注释过长（最大值=％lu）。

</br>

- 错误号：1794; 符号： ER_SLAVE_CONFIGURATION; SQLSTATE： HY000

报错信息格式：从站未配置或无法正确初始化。

您必须至少设置--server-id才能启用主服务器或从服务器。

其他错误消息可以在MySQL错误日志中找到。


</br>

- 错误号：1795; 符号： ER_INNODB_FT_LIMIT; SQLSTATE： HY000

报错信息格式：InnoDB当前一次支持一个FULLTEXT索引创建。

</br>

- 错误号：1796; 符号： ER_INNODB_NO_FT_TEMP_TABLE; SQLSTATE：HY000

报错信息格式：无法在临时InnoDB表上创建FULLTEXT索引。

</br>

- 错误号：1797; 符号： ER_INNODB_FT_WRONG_DOCID_COLUMN; SQLSTATE：HY000

报错信息格式：InnoDB FULLTEXT索引的列'％s'类型错误。

</br>

- 错误号：1798; 符号： ER_INNODB_FT_WRONG_DOCID_INDEX; SQLSTATE：HY000

报错信息格式：对于InnoDB FULLTEXT索引，索引'％s'的类型错误。

</br>

- 错误号：1799; 符号： ER_INNODB_ONLINE_LOG_TOO_BIG; SQLSTATE：HY000

报错信息格式：创建索引'％s'所需的修改日志的字节数超过“ innodb_online_alter_log_max_size”字节。

请再试一遍。


</br>

- 错误号：1800; 符号： ER_UNKNOWN_ALTER_ALGORITHM; SQLSTATE：HY000

报错信息格式：未知算法'％s'。

</br>

- 错误号：1801; 符号： ER_UNKNOWN_ALTER_LOCK; SQLSTATE： HY000

报错信息格式：未知的LOCK类型'％s'。

</br>

- 错误号：1802; 符号： ER_MTS_CHANGE_MASTER_CANT_RUN_WITH_GAPS; SQLSTATE：HY000

报错信息格式：当从站由于错误而停止或在MTS模式下终止时，无法执行CHANGE MASTER。

考虑使用RESET SLAVE或START SLAVE UNTIL。


</br>

- 错误号：1803; 符号： ER_MTS_RECOVERY_FAILURE; SQLSTATE： HY000

报错信息格式：在并行执行模式下SLAVE错误出错后，无法恢复。

其他错误消息可以在MySQL错误日志中找到。


</br>

- 错误号：1804; 符号： ER_MTS_RESET_WORKERS; SQLSTATE： HY000

报错信息格式：无法清理工作人员信息表。

其他错误消息可以在MySQL错误日志中找到。


</br>

- 错误号：1805; 符号： ER_COL_COUNT_DOESNT_MATCH_CORRUPTED_V2; SQLSTATE：HY000

报错信息格式：％s。

％s的列数错误。

预期％d，找到％d。

该表可能已损坏

</br>

- 错误号：1806; 符号： ER_SLAVE_SILENT_RETRY_TRANSACTION; SQLSTATE：HY000

报错信息格式：从站必须静默重试当前事务。

</br>

- 错误号：1807; 符号： ER_DISCARD_FK_CHECKS_RUNNING; SQLSTATE：HY000

报错信息格式：表'％s'上正在运行外键检查。

无法丢弃该表。


</br>

- 错误号：1808; 符号： ER_TABLE_SCHEMA_MISMATCH; SQLSTATE：HY000

报错信息格式：架构不匹配（％s）。

</br>

- 错误号：1809; 符号： ER_TABLE_IN_SYSTEM_TABLESPACE; SQLSTATE：HY000

报错信息格式：系统表空间中的表'％s'。

</br>

- 错误号：1810; 符号： ER_IO_READ_ERROR; SQLSTATE： HY000

报错信息格式：IO读取错误：（％lu，％s）％s。

</br>

- 错误号：1811; 符号： ER_IO_WRITE_ERROR; SQLSTATE： HY000

报错信息格式：IO写入错误：（％lu，％s）％s。

</br>

- 错误号：1812; 符号： ER_TABLESPACE_MISSING; SQLSTATE： HY000

报错信息格式：表％s缺少表空间。


</br>

- 错误号：1813; 符号： ER_TABLESPACE_EXISTS; SQLSTATE： HY000

报错信息格式：表空间'％s'存在。


</br>

- 错误号：1814; 符号： ER_TABLESPACE_DISCARDED; SQLSTATE： HY000

报错信息格式：表空间已被表'％s'丢弃。

</br>

- 错误号：1815; 符号： ER_INTERNAL_ERROR; SQLSTATE： HY000

报错信息格式：内部错误：％s。

</br>

- 错误号：1816; 符号： ER_INNODB_IMPORT_ERROR; SQLSTATE： HY000

报错信息格式：ALTER TABLE％s导入表空间失败，错误％lu：'％s'。

</br>

- 错误号：1817; 符号： ER_INNODB_INDEX_CORRUPT; SQLSTATE： HY000

报错信息格式：索引损坏：％s。

</br>

- 错误号：1818; 符号： ER_INVALID_YEAR_COLUMN_LENGTH; SQLSTATE：HY000

报错信息格式：无效的显示宽度。

请改用YEAR。


</br>

- 错误号：1819; 符号： ER_NOT_VALID_PASSWORD; SQLSTATE： HY000

报错信息格式：您的密码不符合当前的政策要求。

</br>

- 错误号：1820; 符号： ER_MUST_CHANGE_PASSWORD; SQLSTATE： HY000

报错信息格式：您必须在执行此语句之前使用ALTER USER语句重置密码。


</br>

- 错误号：1821; 符号： ER_FK_NO_INDEX_CHILD; SQLSTATE： HY000

报错信息格式：无法添加外键约束。

外部表'％s'中缺少约束'％s'的索引

</br>

- 错误号：1822; 符号： ER_FK_NO_INDEX_PARENT; SQLSTATE： HY000

报错信息格式：无法添加外键约束。

引用表'％s'中缺少约束'％s'的索引

</br>

- 错误号：1823; 符号： ER_FK_FAIL_ADD_SYSTEM; SQLSTATE： HY000

报错信息格式：无法将外键约束'％s'添加到系统表中。

</br>

- 错误号：1824; 符号： ER_FK_CANNOT_OPEN_PARENT; SQLSTATE：HY000

报错信息格式：无法打开引用表'％s'。

</br>

- 错误号：1825; 符号： ER_FK_INCORRECT_OPTION; SQLSTATE： HY000

报错信息格式：无法在表'％s'上添加外键约束。

FOREIGN KEY约束'％s'中的选项不正确

</br>

- 错误号：1826; 符号： ER_FK_DUP_NAME; SQLSTATE： HY000

报错信息格式：重复的外键约束名称'％s'。

</br>

- 错误号：1827; 符号： ER_PASSWORD_FORMAT; SQLSTATE： HY000

报错信息格式：密码哈希没有预期的格式。


</br>

- 错误号：1828; 符号： ER_FK_COLUMN_CANNOT_DROP; SQLSTATE：HY000

报错信息格式：无法删除列'％s'：在外键约束'％s'中需要。

</br>

- 错误号：1829; 符号： ER_FK_COLUMN_CANNOT_DROP_CHILD; SQLSTATE：HY000

报错信息格式：无法删除列'％s'：在表'％s'的外键约束'％s'中需要。

</br>

- 错误号：1830; 符号： ER_FK_COLUMN_NOT_NULL; SQLSTATE： HY000

报错信息格式：列'％s'不能为空：在外键约束'％s'中需要SET NULL。

</br>

- 错误号：1831; 符号： ER_DUP_INDEX; SQLSTATE： HY000

报错信息格式：在表'％s。

％s'上定义了重复的索引'％s'。

不建议使用此功能，在以后的版本中将不允许使用。


</br>

- 错误号：1832; 符号： ER_FK_COLUMN_CANNOT_CHANGE; SQLSTATE：HY000

报错信息格式：无法更改列'％s'：用于外键约束'％s'。

</br>

- 错误号：1833; 符号： ER_FK_COLUMN_CANNOT_CHANGE_CHILD; SQLSTATE：HY000

报错信息格式：无法更改列'％s'：用于表'％s'的外键约束'％s'。

</br>

- 错误号：1835; 符号： ER_MALFORMED_PACKET; SQLSTATE： HY000

报错信息格式：格式错误的通信数据包。


</br>

- 错误号：1836; 符号： ER_READ_ONLY_MODE; SQLSTATE： HY000

报错信息格式：以只读模式运行。

</br>

- 错误号：1837; 符号： ER_GTID_NEXT_TYPE_UNDEFINED_GROUP; SQLSTATE：HY000

报错信息格式：@@ SESSION.GTID_NEXT设置为GTID时，必须在COMMIT或ROLLBACK之后将其显式设置为其他值。

请查看GTID_NEXT变量手册页以获取详细说明。

当前@@ SESSION.GTID_NEXT为'％s'。

ER_GTID_NEXT_TYPE_UNDEFINED_GROUP 在8.0.4之后被删除。


</br>

- 错误号：1837; 符号： ER_GTID_NEXT_TYPE_UNDEFINED_GTID; SQLSTATE：HY000

报错信息格式：@@ SESSION.GTID_NEXT设置为GTID时，必须在COMMIT或ROLLBACK之后将其显式设置为其他值。

请查看GTID_NEXT变量手册页以获取详细说明。

当前@@ SESSION.GTID_NEXT为'％s'。

ER_GTID_NEXT_TYPE_UNDEFINED_GTID 已在8.0.11中添加。


</br>

- 错误号：1838; 符号： ER_VARIABLE_NOT_SETTABLE_IN_SP; SQLSTATE：HY000

报错信息格式：无法在存储过程中设置系统变量％s。


</br>

- 错误号：1840; 符号： ER_CANT_SET_GTID_PURGED_WHEN_GTID_EXECUTED_IS_NOT_EMPTY; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_PURGED只能在@@ GLOBAL.GTID_EXECUTED为空时设置。


</br>

- 错误号：1841; 符号： ER_CANT_SET_GTID_PURGED_WHEN_OWNED_GTIDS_IS_NOT_EMPTY; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_PURGED只能在没有正在进行的事务时设置（甚至在其他客户端中也不能）。


</br>

- 错误号：1842; 符号： ER_GTID_PURGED_WAS_CHANGED; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_PURGED已从“％s”更改为“％s”。


</br>

- 错误号：1843; 符号： ER_GTID_EXECUTED_WAS_CHANGED; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_EXECUTED已从“％s”更改为“％s”。


</br>

- 错误号：1844; 符号： ER_BINLOG_STMT_MODE_AND_NO_REPL_TABLES; SQLSTATE：HY000

报错信息格式：无法执行语句：由于BINLOG_FORMAT = STATEMENT，并且已写入复制表和未复制表，因此无法写入二进制日志。


</br>

- 错误号：1845; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED; SQLSTATE：0A000

报错信息格式：此操作不支持％s。

尝试％s。


</br>

- 错误号：1846; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON; SQLSTATE：0A000

报错信息格式：不支持％s。

原因：％s。

尝试％s。


</br>

- 错误号：1847; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COPY; SQLSTATE：HY000

报错信息格式：COPY算法需要锁定。

</br>

- 错误号：1848; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_PARTITION; SQLSTATE：HY000

报错信息格式：分区特定的操作尚不支持LOCK / ALGORITHM。

</br>

- 错误号：1849; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_RENAME; SQLSTATE：HY000

报错信息格式：参与外键的列被重命名。

</br>

- 错误号：1850; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE; SQLSTATE：HY000

报错信息格式：无法更改列类型INPLACE。

</br>

- 错误号：1851; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_CHECK; SQLSTATE：HY000

报错信息格式：添加外键需要foreign_key_checks = OFF。

</br>

- 错误号：1853; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOPK; SQLSTATE：HY000

报错信息格式：不允许删除主键，而不添加新的主键。

</br>

- 错误号：1854; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_AUTOINC; SQLSTATE：HY000

报错信息格式：添加自动增量列需要锁定。

</br>

- 错误号：1855; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_HIDDEN_FTS; SQLSTATE：HY000

报错信息格式：无法将隐藏的FTS_DOC_ID替换为用户可见的FTS_DOC_ID。

</br>

- 错误号：1856; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_CHANGE_FTS; SQLSTATE：HY000

报错信息格式：无法删除或重命名FTS_DOC_ID。

</br>

- 错误号：1857; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FTS; SQLSTATE：HY000

报错信息格式：全文索引创建需要一个锁。

</br>

- 错误号：1858; 符号： ER_SQL_SLAVE_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE; SQLSTATE：HY000

报错信息格式：当服务器运行@@ GLOBAL.GTID_MODE = ON时，无法设置sql_slave_skip_counter。

相反，对于您要跳过的每个事务，请生成一个与该事务具有相同GTID的空事务

</br>

- 错误号：1859; 符号： ER_DUP_UNKNOWN_IN_INDEX; SQLSTATE： 23000

报错信息格式：键“％s”的条目重复。

</br>

- 错误号：1860; 符号： ER_IDENT_CAUSES_TOO_LONG_PATH; SQLSTATE：HY000

报错信息格式：对象的长数据库名称和标识符导致路径长度超过％d个字符。

路径：“％s”。


</br>

- 错误号：1861; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOT_NULL; SQLSTATE：HY000

报错信息格式：无法按此SQL_MODE的要求静默转换NULL值。

</br>

- 错误号：1862; 符号： ER_MUST_CHANGE_PASSWORD_LOGIN; SQLSTATE：HY000

报错信息格式：您的密码已过期。

要登录，必须使用支持过期密码的客户端对其进行更改。


</br>

- 错误号：1863; 符号： ER_ROW_IN_WRONG_PARTITION; SQLSTATE：HY000

报错信息格式：在错误的分区％s中找到一行。

</br>

- 错误号：1864; 符号： ER_MTS_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX; SQLSTATE：HY000

报错信息格式：无法计划事件％s，中继日志名称％s，位置％s到工作线程，因为它的大小％lu超过slave_pending_jobs_size_max的％lu。


</br>

- 错误号：1866; 符号： ER_BINLOG_LOGICAL_CORRUPTION; SQLSTATE：HY000

报错信息格式：二进制日志文件'％s'在逻辑上已损坏：％s。

</br>

- 错误号：1867; 符号： ER_WARN_PURGE_LOG_IN_USE; SQLSTATE：HY000

报错信息格式：未清除文件％s，因为％d线程正在读取文件％s，仅清除了％d文件中的％d。


</br>

- 错误号：1868; 符号： ER_WARN_PURGE_LOG_IS_ACTIVE; SQLSTATE：HY000

报错信息格式：文件％s未清除，因为它是活动日志文件。


</br>

- 错误号：1869; 符号： ER_AUTO_INCREMENT_CONFLICT; SQLSTATE：HY000

报错信息格式：UPDATE中的自动增量值与内部生成的值冲突。

</br>

- 错误号：1870; 符号： WARN_ON_BLOCKHOLE_IN_RBR; SQLSTATE：HY000

报错信息格式：未记录用于以行格式修改BLACKHOLE表的％s语句的行事件。

表格：“％s”

</br>

- 错误号：1871; 符号： ER_SLAVE_MI_INIT_REPOSITORY; SQLSTATE：HY000

报错信息格式：从站无法从存储库初始化主信息结构。

</br>

- 错误号：1872; 符号： ER_SLAVE_RLI_INIT_REPOSITORY; SQLSTATE：HY000

报错信息格式：从站无法从存储库初始化中继日志信息结构。

</br>

- 错误号：1873; 符号： ER_ACCESS_DENIED_CHANGE_USER_ERROR; SQLSTATE：28000

报错信息格式：访问被拒绝尝试更改为用户'％s'@'％s'（使用密码：％s）。

断开连接。


</br>

- 错误号：1874; 符号： ER_INNODB_READ_ONLY; SQLSTATE： HY000

报错信息格式：InnoDB处于只读模式。


</br>

- 错误号：1875; 符号： ER_STOP_SLAVE_SQL_THREAD_TIMEOUT; SQLSTATE：HY000

报错信息格式：STOP SLAVE命令执行未完成：从SQL线程收到停止信号，线程正忙，一旦当前任务完成，SQL线程将停止。


</br>

- 错误号：1876; 符号： ER_STOP_SLAVE_IO_THREAD_TIMEOUT; SQLSTATE：HY000

报错信息格式：STOP SLAVE命令执行未完成：从IO线程收到停止信号，线程正忙，一旦当前任务完成，IO线程将停止。


</br>

- 错误号：1877; 符号： ER_TABLE_CORRUPT; SQLSTATE： HY000

报错信息格式：无法执行操作。

表'％s。

％s'丢失，损坏或包含错误的数据。


</br>

- 错误号：1878; 符号： ER_TEMP_FILE_WRITE_FAILURE; SQLSTATE：HY000

报错信息格式：临时文件写入失败。


</br>

- 错误号：1879; 符号： ER_INNODB_FT_AUX_NOT_HEX_ID; SQLSTATE：HY000

报错信息格式：升级索引名称失败，请使用创建索引（更改表）算法副本来重建索引。


</br>

- 错误号：1880; 符号： ER_OLD_TEMPORALS_UPGRADED; SQLSTATE：HY000

报错信息格式：旧格式的TIME / TIMESTAMP / DATETIME列已升级为新格式。


</br>

- 错误号：1881; 符号： ER_INNODB_FORCED_RECOVERY; SQLSTATE：HY000

报错信息格式：当innodb_force_recovery> 0时，不允许进行操作。


</br>

- 错误号：1882; 符号： ER_AES_INVALID_IV; SQLSTATE： HY000

报错信息格式：提供给％s的初始化向量太短。

必须至少长％d个字节

</br>

- 错误号：1883; 符号： ER_PLUGIN_CANNOT_BE_UNINSTALLED; SQLSTATE：HY000

报错信息格式：插件'％s'现在无法卸载。

％s

</br>

- 错误号：1884; 符号： ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_GTID_GROUP; SQLSTATE：HY000

报错信息格式：无法执行语句，因为它需要作为多条语句写入二进制日志，并且@@ SESSION.GTID_NEXT =='UUID：NUMBER'时不允许这样做。

ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_GTID_GROUP 在8.0.4之后被删除。


</br>

- 错误号：1884; 符号： ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_ASSIGNED_GTID; SQLSTATE：HY000

报错信息格式：无法执行语句，因为它需要作为多条语句写入二进制日志，并且@@ SESSION.GTID_NEXT =='UUID：NUMBER'时不允许这样做。

ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_ASSIGNED_GTID 已在8.0.11中添加。


</br>

- 错误号：1885; 符号： ER_SLAVE_HAS_MORE_GTIDS_THAN_MASTER; SQLSTATE：HY000

报错信息格式：使用主服务器的SERVER_UUID，从服务器具有比主服务器更多的GTID。

这可能表明二进制日志的末尾已被截断，或者最后一个二进制日志文件已丢失，例如，在sync_binlog！= 1的电源或磁盘故障之后。

主数据库可能已回滚或可能未回滚已复制的事务。

给奴隶 建议将主服务器已从从服务器回滚的所有事务复制到主服务器，和/或在主服务器上提交空事务，以解决已在主服务器上提交但未包含在GTID_EXECUTED中的事务。


</br>

- 错误号：1886; 符号： ER_MISSING_KEY; SQLSTATE： HY000

报错信息格式：表'％s。

％s'上没有定义必需的键。

请检查表定义并相应地创建索引。

ER_MISSING_KEY 在8.0.4中添加。


</br>

- 错误号：1887; 符号： WARN_NAMED_PIPE_ACCESS_EVERYONE; SQLSTATE：HY000

报错信息格式：设置named_pipe_full_access_group ='％s'是不安全的。

考虑使用成员较少的Windows组。

WARN_NAMED_PIPE_ACCESS_EVERYONE 已在8.0.17中添加。


## 错误号3000~3985

</br>

- 错误号：3000; 符号： ER_FILE_CORRUPT; SQLSTATE： HY000

报错信息格式：文件％s已损坏。

</br>

- 错误号：3001; 符号： ER_ERROR_ON_MASTER; SQLSTATE： HY000

报错信息格式：在主服务器上的查询部分完成（主服务器上的错误：％d），并被中止。

此时，您的主机可能会出现不一致的情况。

如果确定主服务器正常，请在从服务器上手动运行此查询，然后使用SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1重新启动从服务器；否则，请重新启动该服务器。

开始从动；查询：'％s'

</br>

- 错误号：3003; 符号： ER_STORAGE_ENGINE_NOT_LOADED; SQLSTATE：HY000

报错信息格式：表'％s'的存储引擎。

'％s'未加载。


</br>

- 错误号：3004; 符号： ER_GET_STACKED_DA_WITHOUT_ACTIVE_HANDLER; SQLSTATE：0Z002

报错信息格式：处理程序不活动时获取堆叠诊断。

</br>

- 错误号：3005; 符号： ER_WARN_LEGACY_SYNTAX_CONVERTED; SQLSTATE：HY000

报错信息格式：％s不再受支持。

该语句已转换为％s。


</br>

- 错误号：3006; 符号： ER_BINLOG_UNSAFE_FULLTEXT_PLUGIN; SQLSTATE：HY000

报错信息格式：语句是不安全的，因为它使用全文分析器插件，该插件可能在从属服务器上未返回相同的值。


</br>

- 错误号：3007; 符号： ER_CANNOT_DISCARD_TEMPORARY_TABLE; SQLSTATE：HY000

报错信息格式：无法DISCARD / IMPORT表空间与临时表关联。

</br>

- 错误号：3008; 符号： ER_FK_DEPTH_EXCEEDED; SQLSTATE： HY000

报错信息格式：外键级联删除/更新超出最大深度％d。


</br>

- 错误号：3009; 符号： ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE_V2; SQLSTATE：HY000

报错信息格式：％s。

％s的列数错误。

预期％d，找到％d。

使用MySQL％d创建，现在运行％d。

请执行MySQL升级程序。


</br>

- 错误号：3010; 符号： ER_WARN_TRIGGER_DOESNT_HAVE_CREATED; SQLSTATE：HY000

报错信息格式：触发器％s。

％s。

％s没有CREATED属性。


</br>

- 错误号：3011; 符号： ER_REFERENCED_TRG_DOES_NOT_EXIST; SQLSTATE：HY000

报错信息格式：给定操作时间和事件类型的引用触发器'％s'不存在。


</br>

- 错误号：3012; 符号： ER_EXPLAIN_NOT_SUPPORTED; SQLSTATE：HY000

报错信息格式：仅SELECT / UPDATE / INSERT / DELETE / REPLACE支持EXPLAIN FOR CONNECTION命令。

</br>

- 错误号：3013; 符号： ER_INVALID_FIELD_SIZE; SQLSTATE： HY000

报错信息格式：列'％s'的大小无效。


</br>

- 错误号：3014; 符号： ER_MISSING_HA_CREATE_OPTION; SQLSTATE：HY000

报错信息格式：找不到表存储引擎'％s'所需的创建选项。

</br>

- 错误号：3015; 符号： ER_ENGINE_OUT_OF_MEMORY; SQLSTATE： HY000

报错信息格式：存储引擎'％s'的内存不足。


</br>

- 错误号：3016; 符号： ER_PASSWORD_EXPIRE_ANONYMOUS_USER; SQLSTATE：HY000

报错信息格式：匿名用户的密码不能过期。


</br>

- 错误号：3017; 符号： ER_SLAVE_SQL_THREAD_MUST_STOP; SQLSTATE：HY000

报错信息格式：无法通过正在运行的从属sql线程执行此操作；首先运行STOP SLAVE SQL_THREAD。

</br>

- 错误号：3018; 符号： ER_NO_FT_MATERIALIZED_SUBQUERY; SQLSTATE：HY000

报错信息格式：无法在实例化子查询上创建FULLTEXT索引。

</br>

- 错误号：3019; 符号： ER_INNODB_UNDO_LOG_FULL; SQLSTATE： HY000

报错信息格式：撤消日志错误：％s。

</br>

- 错误号：3020; 符号： ER_INVALID_ARGUMENT_FOR_LOGARITHM; SQLSTATE：2201E

报错信息格式：对数参数无效。

</br>

- 错误号：3021; 符号： ER_SLAVE_CHANNEL_IO_THREAD_MUST_STOP; SQLSTATE：HY000

报错信息格式：无法通过正在运行的从属io线程执行此操作；首先运行STOP SLAVE IO_THREAD FOR CHANNEL'％s'。


</br>

- 错误号：3022; 符号： ER_WARN_OPEN_TEMP_TABLES_MUST_BE_ZERO; SQLSTATE：HY000

报错信息格式：从站具有临时表时，此操作可能不安全。

在服务器重新启动或任何复制的DROP语句删除表之前，这些表将一直保持打开状态。

建议等待直到slave_open_temp_tables = 0。


</br>

- 错误号：3023; 符号： ER_WARN_ONLY_MASTER_LOG_FILE_NO_POS; SQLSTATE：HY000

报错信息格式：使用MASTER_LOG_FILE子句但没有MASTER_LOG_POS子句的CHANGE MASTER TO可能并不安全。

旧的位置值可能对新的二进制日志文件无效。


</br>

- 错误号：3024; 符号： ER_QUERY_TIMEOUT; SQLSTATE： HY000

报错信息格式：查询执行被中断，超过了最大语句执行时间。

</br>

- 错误号：3025; 符号： ER_NON_RO_SELECT_DISABLE_TIMER; SQLSTATE：HY000

报错信息格式：选择不是只读语句，禁用计时器。

</br>

- 错误号：3026; 符号： ER_DUP_LIST_ENTRY; SQLSTATE： HY000

报错信息格式：重复的条目'％s'。


</br>

- 错误号：3028; 符号： ER_AGGREGATE_ORDER_FOR_UNION; SQLSTATE：HY000

报错信息格式：ORDER BY的表达式＃％u包含聚合函数，并应用于UNION。

</br>

- 错误号：3029; 符号： ER_AGGREGATE_ORDER_NON_AGG_QUERY; SQLSTATE：HY000

报错信息格式：ORDER BY的表达式＃％u包含聚合函数，并应用于非聚合查询的结果。

</br>

- 错误号：3030; 符号： ER_SLAVE_WORKER_STOPPED_PREVIOUS_THD_ERROR; SQLSTATE：HY000

报错信息格式：当启用slave-preserve-commit-order时，至少一个先前的工作程序遇到错误后，从属工作程序已停止。

为了保留提交顺序，此线程执行的最后一个事务尚未提交。

修复任何失败的线程后重新启动从属服务器时，也应修复此工作程序。


</br>

- 错误号：3031; 符号： ER_DONT_SUPPORT_SLAVE_PRESERVE_COMMIT_ORDER; SQLSTATE：HY000

报错信息格式：％s不支持slave_preserve_commit_order。


</br>

- 错误号：3032; 符号： ER_SERVER_OFFLINE_MODE; SQLSTATE： HY000

报错信息格式：服务器当前处于脱机模式。

</br>

- 错误号：3033; 符号： ER_GIS_DIFFERENT_SRIDS; SQLSTATE： HY000

报错信息格式：二进制几何函数％s给出了两个不同条纹的几何：％u和％u，它们应该是相同的。

作为参数传递给空间函数的几何值必须具有相同的SRID值。


</br>

- 错误号：3034; 符号： ER_GIS_UNSUPPORTED_ARGUMENT; SQLSTATE：HY000

报错信息格式：使用不支持的参数类型调用几何函数％s。

调用了空间函数，并结合了该函数不支持的参数类型。


</br>

- 错误号：3035; 符号： ER_GIS_UNKNOWN_ERROR; SQLSTATE： HY000

报错信息格式：函数％s中发生未知的GIS错误。


</br>

- 错误号：3036; 符号： ER_GIS_UNKNOWN_EXCEPTION; SQLSTATE：HY000

报错信息格式：GIS函数％s中捕获了未知异常。


</br>

- 错误号：3037; 符号： ER_GIS_INVALID_DATA; SQLSTATE： 22023

报错信息格式：为功能％s提供了无效的GIS数据。

调用了一个空间函数，其参数未被识别为有效的几何值。


</br>

- 错误号：3038; 符号： ER_BOOST_GEOMETRY_EMPTY_INPUT_EXCEPTION; SQLSTATE：HY000

报错信息格式：几何在功能％s中没有数据。


</br>

- 错误号：3039; 符号： ER_BOOST_GEOMETRY_CENTROID_EXCEPTION; SQLSTATE：HY000

报错信息格式：由于函数％s中的几何为空，因此无法计算质心。


</br>

- 错误号：3040; 符号： ER_BOOST_GEOMETRY_OVERLAY_INVALID_INPUT_EXCEPTION; SQLSTATE：HY000

报错信息格式：几何叠加计算错误：几何数据在功能％s中无效。


</br>

- 错误号：3041; 符号： ER_BOOST_GEOMETRY_TURN_INFO_EXCEPTION; SQLSTATE：HY000

报错信息格式：几何转弯信息计算错误：几何数据在功能％s中无效。


</br>

- 错误号：3042; 符号： ER_BOOST_GEOMETRY_SELF_INTERSECTION_POINT_EXCEPTION; SQLSTATE：HY000

报错信息格式：相交点的分析过程在功能％s中意外中断。


</br>

- 错误号：3043; 符号： ER_BOOST_GEOMETRY_UNKNOWN_EXCEPTION; SQLSTATE：HY000

报错信息格式：函数％s中引发了未知异常。


</br>

- 错误号：3044; 符号： ER_STD_BAD_ALLOC_ERROR; SQLSTATE： HY000

报错信息格式：内存分配错误：函数％s中的％s。


</br>

- 错误号：3045; 符号： ER_STD_DOMAIN_ERROR; SQLSTATE： HY000

报错信息格式：域错误：函数％s中的％s。


</br>

- 错误号：3046; 符号： ER_STD_LENGTH_ERROR; SQLSTATE： HY000

报错信息格式：长度错误：函数％s中的％s。


</br>

- 错误号：3047; 符号： ER_STD_INVALID_ARGUMENT; SQLSTATE： HY000

报错信息格式：无效的参数错误：函数％s中的％s。


</br>

- 错误号：3048; 符号： ER_STD_OUT_OF_RANGE_ERROR; SQLSTATE：HY000

报错信息格式：超出范围错误：函数％s中的％s。


</br>

- 错误号：3049; 符号： ER_STD_OVERFLOW_ERROR; SQLSTATE： HY000

报错信息格式：溢出错误：函数％s中的％s。


</br>

- 错误号：3050; 符号： ER_STD_RANGE_ERROR; SQLSTATE： HY000

报错信息格式：范围错误：函数％s中的％s。


</br>

- 错误号：3051; 符号： ER_STD_UNDERFLOW_ERROR; SQLSTATE： HY000

报错信息格式：下溢错误：函数％s中的％s。


</br>

- 错误号：3052; 符号： ER_STD_LOGIC_ERROR; SQLSTATE： HY000

报错信息格式：逻辑错误：函数％s中的％s。


</br>

- 错误号：3053; 符号： ER_STD_RUNTIME_ERROR; SQLSTATE： HY000

报错信息格式：运行时错误：函数％s中的％s。


</br>

- 错误号：3054; 符号： ER_STD_UNKNOWN_EXCEPTION; SQLSTATE：HY000

报错信息格式：未知异常：函数％s中的％s。


</br>

- 错误号：3055; 符号： ER_GIS_DATA_WRONG_ENDIANESS; SQLSTATE：HY000

报错信息格式：几何字节串必须为小端。


</br>

- 错误号：3056; 符号： ER_CHANGE_MASTER_PASSWORD_LENGTH; SQLSTATE：HY000

报错信息格式：为复制用户提供的密码超过了32个字符的最大长度。

</br>

- 错误号：3057; 符号： ER_USER_LOCK_WRONG_NAME; SQLSTATE： 42000

报错信息格式：错误的用户级别锁名'％s'。


</br>

- 错误号：3058; 符号： ER_USER_LOCK_DEADLOCK; SQLSTATE： HY000

报错信息格式：尝试获取用户级锁定时发现死锁；尝试回滚事务/释放锁并重新启动锁获取。

当metdata锁定子系统检测到尝试使用获取命名锁的死锁时，将返回此错误 GET_LOCK。


</br>

- 错误号：3059; 符号： ER_REPLACE_INACCESSIBLE_ROWS; SQLSTATE：HY000

报错信息格式：无法执行REPLACE，因为它需要删除视图中未包含的行。

</br>

- 错误号：3060; 符号： ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_GIS; SQLSTATE：HY000

报错信息格式：不支持对具有GIS索引的表进行在线操作。

</br>

- 错误号：3061; 符号： ER_ILLEGAL_USER_VAR; SQLSTATE： 42000

报错信息格式：用户变量名'％s'是非法的。

</br>

- 错误号：3062; 符号： ER_GTID_MODE_OFF; SQLSTATE： HY000

报错信息格式：GTID_MODE = OFF时无法％s。


</br>

- 错误号：3064; 符号： ER_INCORRECT_TYPE; SQLSTATE： HY000

报错信息格式：函数％s中参数％s的类型错误。


</br>

- 错误号：3065; 符号： ER_FIELD_IN_ORDER_NOT_SELECT; SQLSTATE：HY000

报错信息格式：ORDER BY子句的表达式＃％u不在SELECT列表中，引用的列'％s'不在SELECT列表中；这与％s不兼容。

</br>

- 错误号：3066; 符号： ER_AGGREGATE_IN_ORDER_NOT_SELECT; SQLSTATE：HY000

报错信息格式：ORDER BY子句的表达式＃％u不在SELECT列表中，包含聚合函数；这与％s不兼容。

</br>

- 错误号：3067; 符号： ER_INVALID_RPL_WILD_TABLE_FILTER_PATTERN; SQLSTATE：HY000

报错信息格式：提供的过滤器列表包含的值不是必需的格式'db_pattern.table_pattern'。

</br>

- 错误号：3068; 符号： ER_NET_OK_PACKET_TOO_LARGE; SQLSTATE：08S01

报错信息格式：OK数据包太大。

</br>

- 错误号：3069; 符号： ER_INVALID_JSON_DATA; SQLSTATE： HY000

报错信息格式：提供给功能％s的无效JSON数据：％s。

</br>

- 错误号：3070; 符号： ER_INVALID_GEOJSON_MISSING_MEMBER; SQLSTATE：HY000

报错信息格式：提供给功能％s的无效GeoJSON数据：缺少必需的成员'％s'。

</br>

- 错误号：3071; 符号： ER_INVALID_GEOJSON_WRONG_TYPE; SQLSTATE：HY000

报错信息格式：提供给功能％s的无效GeoJSON数据：成员'％s'必须为'％s'类型。

</br>

- 错误号：3072; 符号： ER_INVALID_GEOJSON_UNSPECIFIED; SQLSTATE：HY000

报错信息格式：提供给功能％s的无效GeoJSON数据。

</br>

- 错误号：3073; 符号： ER_DIMENSION_UNSUPPORTED; SQLSTATE：HY000

报错信息格式：函数％s中坐标尺寸不受支持的数目：找到％u，预期为％u。

</br>

- 错误号：3074; 符号： ER_SLAVE_CHANNEL_DOES_NOT_EXIST; SQLSTATE：HY000

报错信息格式：从通道'％s'不存在。


</br>

- 错误号：3076; 符号： ER_SLAVE_CHANNEL_NAME_INVALID_OR_TOO_LONG; SQLSTATE：HY000

报错信息格式：无法创建频道：频道名称无效或太长。


</br>

- 错误号：3077; 符号： ER_SLAVE_NEW_CHANNEL_WRONG_REPOSITORY; SQLSTATE：HY000

报错信息格式：要具有多个通道，存储库不能为FILE类型；请检查存储库配置并将其转换为TABLE。


</br>

- 错误号：3079; 符号： ER_SLAVE_MULTIPLE_CHANNELS_CMD; SQLSTATE：HY000

报错信息格式：从站上存在多个通道。

请提供频道名称作为参数。


</br>

- 错误号：3080; 符号： ER_SLAVE_MAX_CHANNELS_EXCEEDED; SQLSTATE：HY000

报错信息格式：允许的最大复制通道数已超出。


</br>

- 错误号：3081; 符号： ER_SLAVE_CHANNEL_MUST_STOP; SQLSTATE：HY000

报错信息格式：无法通过正在运行的复制线程执行此操作；首先运行STOP SLAVE FOR CHANNEL'％s'。

</br>

- 错误号：3082; 符号： ER_SLAVE_CHANNEL_NOT_RUNNING; SQLSTATE：HY000

报错信息格式：此操作需要运行复制线程；配置从站并运行START SLAVE FOR CHANNEL'％s'。

</br>

- 错误号：3083; 符号： ER_SLAVE_CHANNEL_WAS_RUNNING; SQLSTATE：HY000

报错信息格式：通道'％s'的复制线程已在运行。


</br>

- 错误号：3084; 符号： ER_SLAVE_CHANNEL_WAS_NOT_RUNNING; SQLSTATE：HY000

报错信息格式：通道'％s'的复制线程已经停止。


</br>

- 错误号：3085; 符号： ER_SLAVE_CHANNEL_SQL_THREAD_MUST_STOP; SQLSTATE：HY000

报错信息格式：无法通过正在运行的从属sql线程执行此操作；首先运行STOP SLAVE SQL_THREAD FOR CHANNEL'％s'。


</br>

- 错误号：3086; 符号： ER_SLAVE_CHANNEL_SQL_SKIP_COUNTER; SQLSTATE：HY000

报错信息格式：当sql_slave_skip_counter> 0时，不允许使用'START SLAVE [SQL_THREAD]'启动多个SQL线程。

sql_slave_skip_counter的值一次只能由一个SQL线程使用。

请使用“ START SLAVE [SQL_THREAD] FOR CHANNEL”启动将使用sql_slave_skip_counter值的SQL线程。


</br>

- 错误号：3087; 符号： ER_WRONG_FIELD_WITH_GROUP_V2; SQLSTATE：HY000

报错信息格式：％s的表达式＃％u不在GROUP BY子句中，并且包含未聚合的列'％s'，该列在功能上不依赖于GROUP BY子句中的列；这与sql_mode = only_full_group_by不兼容。

</br>

- 错误号：3088; 符号： ER_MIX_OF_GROUP_FUNC_AND_FIELDS_V2; SQLSTATE：HY000

报错信息格式：在没有GROUP BY的聚合查询中，％s的表达式＃％u包含非聚合列'％s'；这与sql_mode = only_full_group_by不兼容。

</br>

- 错误号：3089; 符号： ER_WARN_DEPRECATED_SYSVAR_UPDATE; SQLSTATE：HY000

报错信息格式：不建议更新'％s'。

在将来的版本中，它将变为只读。


</br>

- 错误号：3090; 符号： ER_WARN_DEPRECATED_SQLMODE; SQLSTATE：HY000

报错信息格式：不建议更改sql模式'％s'。

它将在将来的版本中删除。


</br>

- 错误号：3091; 符号： ER_CANNOT_LOG_PARTIAL_DROP_DATABASE_WITH_GTID; SQLSTATE：HY000

报错信息格式：DROP DATABASE失败；某些表可能已删除，但数据库目录仍然保留。

GTID尚未添加到GTID_EXECUTED，并且该语句未写入二进制日志。

对此进行如下修复：（1）从数据库目录％s中删除所有文件；（2）SET GTID_NEXT ='％s'; （3）删除数据库'％s'。


</br>

- 错误号：3092; 符号： ER_GROUP_REPLICATION_CONFIGURATION; SQLSTATE：HY000

报错信息格式：服务器未正确配置为该组的活动成员。

请在错误日志中查看更多详细信息。


</br>

- 错误号：3093; 符号： ER_GROUP_REPLICATION_RUNNING; SQLSTATE：HY000

报错信息格式：由于该组已经在运行，因此START GROUP_REPLICATION命令失败。


</br>

- 错误号：3094; 符号： ER_GROUP_REPLICATION_APPLIER_INIT_ERROR; SQLSTATE：HY000

报错信息格式：由于应用程序模块无法启动，因此START GROUP_REPLICATION命令失败。


</br>

- 错误号：3095; 符号： ER_GROUP_REPLICATION_STOP_APPLIER_THREAD_TIMEOUT; SQLSTATE：HY000

报错信息格式：STOP GROUP_REPLICATION命令执行未完成：应用程序线程在繁忙时收到停止信号。

当前任务完成后，应用程序线程将停止。


</br>

- 错误号：3096; 符号： ER_GROUP_REPLICATION_COMMUNICATION_LAYER_SESSION_ERROR; SQLSTATE：HY000

报错信息格式：START GROUP_REPLICATION命令失败，因为初始化组通信层时出错。


</br>

- 错误号：3097; 符号： ER_GROUP_REPLICATION_COMMUNICATION_LAYER_JOIN_ERROR; SQLSTATE：HY000

报错信息格式：START GROUP_REPLICATION命令失败，因为加入通信组时出现错误。


</br>

- 错误号：3098; 符号： ER_BEFORE_DML_VALIDATION_ERROR; SQLSTATE：HY000

报错信息格式：该表不符合外部插件的要求。


</br>

- 错误号：3099; 符号： ER_PREVENTS_VARIABLE_WITHOUT_RBR; SQLSTATE：HY000

报错信息格式：如果没有二进制日志格式为ROW，则无法更改变量％s的值。

transaction_write_set_extraction 选项值已设置，binlog_format但未 设置 ROW。


</br>

- 错误号：3100; 符号： ER_RUN_HOOK_ERROR; SQLSTATE： HY000

报错信息格式：在运行复制挂钩'％s'时观察器发生错误。


</br>

- 错误号：3101; 符号： ER_TRANSACTION_ROLLBACK_DURING_COMMIT; SQLSTATE：40000

报错信息格式：插件指示服务器回滚当前事务。

使用组复制时，这意味着事务由于一个或多个成员检测到潜在的冲突而使组认证过程失败。

请参见 第18章，组复制。


</br>

- 错误号：3102; 符号： ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：生成的列'％s'的表达式包含不允许的函数。


</br>

- 错误号：3103; 符号： ER_UNSUPPORTED_ALTER_INPLACE_ON_VIRTUAL_COLUMN; SQLSTATE：HY000

报错信息格式：虚拟列的INPLACE ADD或DROP不能与其他ALTER TABLE操作结合使用。

</br>

- 错误号：3104; 符号： ER_WRONG_FK_OPTION_FOR_GENERATED_COLUMN; SQLSTATE：HY000

报错信息格式：无法在生成的列上使用％s子句定义外键。


</br>

- 错误号：3105; 符号： ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN; SQLSTATE：HY000

报错信息格式：不允许在表'％s'中为生成的列'％s'指定值。


</br>

- 错误号：3106; 符号： ER_UNSUPPORTED_ACTION_ON_GENERATED_COLUMN; SQLSTATE：HY000

报错信息格式：生成的列不支持'％s'。


</br>

- 错误号：3107; 符号： ER_GENERATED_COLUMN_NON_PRIOR; SQLSTATE：HY000

报错信息格式：生成的列只能引用在其之前定义的生成的列。

要解决此问题，请更改表定义以定义每个生成的列，而不是定义它所引用的任何生成的列。


</br>

- 错误号：3108; 符号： ER_DEPENDENT_BY_GENERATED_COLUMN; SQLSTATE：HY000

报错信息格式：列'％s'具有生成的列依赖性。

如果另一列引用了生成的列，则不能删除或重命名该列。

您也必须删除这些列，或者重新定义它们以不引用生成的列。


</br>

- 错误号：3109; 符号： ER_GENERATED_COLUMN_REF_AUTO_INC; SQLSTATE：HY000

报错信息格式：生成的列'％s'无法引用自动增量列。


</br>

- 错误号：3110; 符号： ER_FEATURE_NOT_AVAILABLE; SQLSTATE：HY000

报错信息格式：“％s”功能不可用；您需要删除“％s”或使用由“％s”构建的MySQL。

</br>

- 错误号：3111; 符号： ER_CANT_SET_GTID_MODE; SQLSTATE： HY000

报错信息格式：因为％s，所以不允许使用SET @@ GLOBAL.GTID_MODE =％s。


</br>

- 错误号：3112; 符号： ER_CANT_USE_AUTO_POSITION_WITH_GTID_MODE_OFF; SQLSTATE：HY000

报错信息格式：复制接收器线程％s无法在AUTO_POSITION模式下启动：此服务器使用@@ GLOBAL.GTID_MODE = OFF。


</br>

- 错误号：3116; 符号： ER_CANT_ENFORCE_GTID_CONSISTENCY_WITH_ONGOING_GTID_VIOLATING_TX; SQLSTATE：HY000

报错信息格式：无法设置ENFORCE_GTID_CONSISTENCY = ON，因为正在进行的事务违反了GTID一致性。

ER_CANT_SET_ENFORCE_GTID_CONSISTENCY_ON_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS 已重命名为 ER_CANT_ENFORCE_GTID_CONSISTENCY_WITH_ONGOING_GTID_VIOLATING_TX。


</br>

- 错误号：3117; 符号： ER_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TX; SQLSTATE：HY000

报错信息格式：存在正在进行的违反GTID一致性的事务。

ER_SET_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS 已重命名为 ER_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TX。


</br>

- 错误号：3118; 符号： ER_ACCOUNT_HAS_BEEN_LOCKED; SQLSTATE：HY000

报错信息格式：对用户'％s'@'％s'的访问被拒绝。

帐户已被锁定。

该帐户已用CREATE USER ... ACCOUNT LOCK或 锁定 ALTER USER ... ACCOUNT LOCK。

管理员可以使用对其进行解锁 ALTER USER ... ACCOUNT UNLOCK。


</br>

- 错误号：3119; 符号： ER_WRONG_TABLESPACE_NAME; SQLSTATE：42000

报错信息格式：不正确的表空间名称％s。

</br>

- 错误号：3120; 符号： ER_TABLESPACE_IS_NOT_EMPTY; SQLSTATE：HY000

报错信息格式：表空间“％s”不为空。


</br>

- 错误号：3121; 符号： ER_WRONG_FILE_NAME; SQLSTATE： HY000

报错信息格式：错误的文件名'％s'。


</br>

- 错误号：3122; 符号： ER_BOOST_GEOMETRY_INCONSISTENT_TURNS_EXCEPTION; SQLSTATE：HY000

报错信息格式：相交点不一致。


</br>

- 错误号：3123; 符号： ER_WARN_OPTIMIZER_HINT_SYNTAX_ERROR; SQLSTATE：HY000

报错信息格式：优化程序提示语法错误。

</br>

- 错误号：3124; 符号： ER_WARN_BAD_MAX_EXECUTION_TIME; SQLSTATE：HY000
报错信息格式：不支援的MAX_EXECUTION_TIME。

</br>

- 错误号：3125; 符号： ER_WARN_UNSUPPORTED_MAX_EXECUTION_TIME; SQLSTATE：HY000

报错信息格式：MAX_EXECUTION_TIME提示仅受顶级独立SELECT语句支持。

该MAX_EXECUTION_TIME优化提示只为支持SELECT 声明。


</br>

- 错误号：3126; 符号： ER_WARN_CONFLICTING_HINT; SQLSTATE：HY000

报错信息格式：提示％s被视为冲突/重复的。

</br>

- 错误号：3127; 符号： ER_WARN_UNKNOWN_QB_NAME; SQLSTATE： HY000

报错信息格式：找不到％s提示的查询块名称％s。

</br>

- 错误号：3128; 符号： ER_UNRESOLVED_HINT_NAME; SQLSTATE： HY000

报错信息格式：％s提示的未解析名称％s。

</br>

- 错误号：3129; 符号： ER_WARN_ON_MODIFYING_GTID_EXECUTED_TABLE; SQLSTATE：HY000

报错信息格式：请不要修改％s表。

这是一个mysql内部系统表，用于存储已提交事务的GTID。

修改它可能导致GTID状态不一致。


</br>

- 错误号：3130; 符号： ER_PLUGGABLE_PROTOCOL_COMMAND_NOT_SUPPORTED; SQLSTATE：HY000

报错信息格式：可插入协议不支持该命令。

</br>

- 错误号：3131; 符号： ER_LOCKING_SERVICE_WRONG_NAME; SQLSTATE：42000

报错信息格式：锁定服务锁名称'％s'不正确。

锁定服务名称指定为NULL，空字符串或长度超过64个字符的字符串。

命名空间和锁名称必须为非NULL，非空，并且长度不能超过64个字符。


</br>

- 错误号：3132; 符号： ER_LOCKING_SERVICE_DEADLOCK; SQLSTATE：HY000

报错信息格式：尝试获取锁定服务锁时发现死锁；尝试释放锁并重新开始获取锁。


</br>

- 错误号：3133; 符号： ER_LOCKING_SERVICE_TIMEOUT; SQLSTATE：HY000

报错信息格式：服务锁定等待超时已超过。


</br>

- 错误号：3134; 符号： ER_GIS_MAX_POINTS_IN_GEOMETRY_OVERFLOWED; SQLSTATE：HY000

报错信息格式：参数％s超出了函数％s中几何图形（％lu）的最大点数。


</br>

- 错误号：3135; 符号： ER_SQL_MODE_MERGED; SQLSTATE： HY000

报错信息格式：“ NO_ZERO_DATE”，“ NO_ZERO_IN_DATE”和“ ERROR_FOR_DIVISION_BY_ZERO” sql模式应与严格模式一起使用。

它们将在以后的版本中与严格模式合并。


</br>

- 错误号：3136; 符号： ER_VTOKEN_PLUGIN_TOKEN_MISMATCH; SQLSTATE：HY000

报错信息格式：％。

* s的版本令牌不匹配。

正确值％。

* s
客户端已将其version_tokens_session系统变量设置 为需要服务器匹配的令牌列表，但是服务器令牌列表具有至少一个匹配的令牌名称，该名称的值不同于客户端所需的值。

请参见 第5.6.6节“版本令牌”。


</br>

- 错误号：3137; 符号： ER_VTOKEN_PLUGIN_TOKEN_NOT_FOUND; SQLSTATE：HY000

报错信息格式：找不到版本令牌％。

* s。

客户端已将其version_tokens_session系统变量设置 为需要服务器匹配的令牌列表，但是服务器令牌列表至少缺少这些令牌之一。

请参见第5.6.6节“版本令牌”。


</br>

- 错误号：3138; 符号： ER_CANT_SET_VARIABLE_WHEN_OWNING_GTID; SQLSTATE：HY000

报错信息格式：拥有GTID的客户端无法更改变量％s。

客户拥有％s。

所有权在COMMIT或ROLLBACK上释放。


</br>

- 错误号：3139; 符号： ER_SLAVE_CHANNEL_OPERATION_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：％s无法在通道'％s'上执行。


</br>

- 错误号：3140; 符号： ER_INVALID_JSON_TEXT; SQLSTATE： 22032

报错信息格式：无效的JSON文本：列“％s”中位于值％u处的“％s”。


</br>

- 错误号：3141; 符号： ER_INVALID_JSON_TEXT_IN_PARAM; SQLSTATE：22032

报错信息格式：函数％s中的参数％u中的无效JSON文本：位置％u。

％s处的“％s”

</br>

- 错误号：3142; 符号： ER_INVALID_JSON_BINARY_DATA; SQLSTATE：HY000

报错信息格式：JSON二进制值包含无效数据。


</br>

- 错误号：3143; 符号： ER_INVALID_JSON_PATH; SQLSTATE： 42000

报错信息格式：无效的JSON路径表达式。

错误在字符位置％u。

％s附近

</br>

- 错误号：3144; 符号： ER_INVALID_JSON_CHARSET; SQLSTATE： 22032

报错信息格式：无法从具有CHARACTER SET'％s'的字符串创建JSON值。


</br>

- 错误号：3145; 符号： ER_INVALID_JSON_CHARSET_IN_FUNCTION; SQLSTATE：22032

报错信息格式：提供给函数％s的无效JSON字符数据：'％s'; utf8是必需的。


</br>

- 错误号：3146; 符号： ER_INVALID_TYPE_FOR_JSON; SQLSTATE：22032

报错信息格式：函数％s的参数％u中的JSON数据的数据类型无效；JSON字符串或JSON类型是必需的。


</br>

- 错误号：3147; 符号： ER_INVALID_CAST_TO_JSON; SQLSTATE： 22032

报错信息格式：无法将值CAST转换为JSON。


</br>

- 错误号：3148; 符号： ER_INVALID_JSON_PATH_CHARSET; SQLSTATE：42000

报错信息格式：路径表达式必须用utf8字符集编码。

路径表达式“％s”编码为字符集“％s”。


</br>

- 错误号：3149; 符号： ER_INVALID_JSON_PATH_WILDCARD; SQLSTATE：42000

报错信息格式：在这种情况下，路径表达式可能不包含*和**标记或数组范围。


</br>

- 错误号：3150; 符号： ER_JSON_VALUE_TOO_BIG; SQLSTATE： 22032

报错信息格式：JSON值太大，无法存储在JSON列中。


</br>

- 错误号：3151; 符号： ER_JSON_KEY_TOO_BIG; SQLSTATE： 22032

报错信息格式：JSON对象包含的密钥名称太长。


</br>

- 错误号：3152; 符号： ER_JSON_USED_AS_KEY; SQLSTATE： 42000

报错信息格式：JSON列'％s'仅支持通过指定JSON路径上的生成列进行索引。


</br>

- 错误号：3153; 符号： ER_JSON_VACUOUS_PATH; SQLSTATE： 42000

报错信息格式：在此上下文中不允许使用路径表达式“ $”。


</br>

- 错误号：3154; 符号： ER_JSON_BAD_ONE_OR_ALL_ARG; SQLSTATE：42000

报错信息格式：％s的oneOrAll参数可以采用以下值：“ one”或“ all”。


</br>

- 错误号：3155; 符号： ER_NUMERIC_JSON_VALUE_OUT_OF_RANGE; SQLSTATE：22003
报错信息格式：第％ld行的CAST到％s％s的CAST超出范围JSON值。

</br>

- 错误号：3156; 符号： ER_INVALID_JSON_VALUE_FOR_CAST; SQLSTATE：22018

报错信息格式：CAST无效的JSON值从第％ld行的％s列到％s％s。

</br>

- 错误号：3157; 符号： ER_JSON_DOCUMENT_TOO_DEEP; SQLSTATE：22032

报错信息格式：JSON文档超出最大深度。


</br>

- 错误号：3158; 符号： ER_JSON_DOCUMENT_NULL_KEY; SQLSTATE：22032

报错信息格式：JSON文档不能包含NULL成员名称。


</br>

- 错误号：3159; 符号： ER_SECURE_TRANSPORT_REQUIRED; SQLSTATE：HY000

报错信息格式：--require_secure_transport = ON时，禁止使用不安全的传输进行连接。

使用require_secure_transport 系统变量，客户端只能使用安全传输进行连接。

合格连接是使用SSL，Unix套接字文件或共享内存的连接。


</br>

- 错误号：3160; 符号： ER_NO_SECURE_TRANSPORTS_CONFIGURED; SQLSTATE：HY000

报错信息格式：未配置安全传输（SSL或共享内存），无法设置--require_secure_transport = ON。

该require_secure_transport 如果服务器不支持至少一个安全可靠的运输系统变量无法启用。

使用必需的SSL密钥/证书配置服务器以启用SSL连接，或启用shared_memory系统变量以启用共享内存连接。


</br>

- 错误号：3161; 符号： ER_DISABLED_STORAGE_ENGINE; SQLSTATE：HY000

报错信息格式：存储引擎％s已禁用（不允许创建表）。

试图使用disabled_storage_engines系统变量值中列出的存储引擎来创建表或表空间 ，或将现有表或表空间更改为此类引擎。

选择其他存储引擎。


</br>

- 错误号：3162; 符号： ER_USER_DOES_NOT_EXIST; SQLSTATE： HY000

报错信息格式：授权ID％s不存在。


</br>

- 错误号：3163; 符号： ER_USER_ALREADY_EXISTS; SQLSTATE： HY000

报错信息格式：授权ID％s已存在。


</br>

- 错误号：3164; 符号： ER_AUDIT_API_ABORT; SQLSTATE： HY000

报错信息格式：被审计API（'％s';％d）中止。

此错误表明审核插件终止了事件的执行。

该消息通常指示事件子类名称和数字状态值。


</br>

- 错误号：3165; 符号： ER_INVALID_JSON_PATH_ARRAY_CELL; SQLSTATE：42000

报错信息格式：路径表达式不是数组中单元格的路径。


</br>

- 错误号：3166; 符号： ER_BUFPOOL_RESIZE_INPROGRESS; SQLSTATE：HY000

报错信息格式：另一缓冲池调整大小已经在进行中。


</br>

- 错误号：3167; 符号： ER_FEATURE_DISABLED_SEE_DOC; SQLSTATE：HY000

报错信息格式：“％s”功能已禁用；请参阅“％s”的文档。

</br>

- 错误号：3168; 符号： ER_SERVER_ISNT_AVAILABLE; SQLSTATE：HY000

报错信息格式：服务器不可用。

</br>

- 错误号：3169; 符号： ER_SESSION_WAS_KILLED; SQLSTATE： HY000
报错信息格式：会话被杀死。

</br>

- 错误号：3170; 符号： ER_CAPACITY_EXCEEDED; SQLSTATE： HY000

报错信息格式：已超出％llu字节的'％s'存储容量。

％s

</br>

- 错误号：3171; 符号： ER_CAPACITY_EXCEEDED_IN_RANGE_OPTIMIZER; SQLSTATE：HY000

报错信息格式：此查询未完成范围优化。


</br>

- 错误号：3173; 符号： ER_CANT_WAIT_FOR_EXECUTED_GTID_SET_WHILE_OWNING_A_GTID; SQLSTATE：HY000

报错信息格式：客户端拥有GTID％s的所有权。

因此，WAIT_FOR_EXECUTED_GTID_SET无法等待此GTID。


</br>

- 错误号：3174; 符号： ER_CANNOT_ADD_FOREIGN_BASE_COL_VIRTUAL; SQLSTATE：HY000

报错信息格式：无法在索引虚拟列的基础列上添加外键。


</br>

- 错误号：3175; 符号： ER_CANNOT_CREATE_VIRTUAL_INDEX_CONSTRAINT; SQLSTATE：HY000

报错信息格式：无法在其基础列具有外部约束的虚拟列上创建索引。


</br>

- 错误号：3176; 符号： ER_ERROR_ON_MODIFYING_GTID_EXECUTED_TABLE; SQLSTATE：HY000

报错信息格式：请不要用XA事务修改％s表。

这是一个内部系统表，用于存储已提交事务的GTID。

尽管修改它可能导致GTID状态不一致，但是如果需要，您可以使用非XA事务进行修改。


</br>

- 错误号：3177; 符号： ER_LOCK_REFUSED_BY_ENGINE; SQLSTATE：HY000

报错信息格式：存储引擎拒绝锁获取。


</br>

- 错误号：3178; 符号： ER_UNSUPPORTED_ALTER_ONLINE_ON_VIRTUAL_COLUMN; SQLSTATE：HY000

报错信息格式：添加列颜色...虚拟，添加索引（col）。

</br>

- 错误号：3179; 符号： ER_MASTER_KEY_ROTATION_NOT_SUPPORTED_BY_SE; SQLSTATE：HY000

报错信息格式：存储引擎不支持主密钥旋转。


</br>

- 错误号：3181; 符号： ER_MASTER_KEY_ROTATION_BINLOG_FAILED; SQLSTATE：HY000

报错信息格式：写入二进制日志失败。

但是，主键旋转已成功完成。


</br>

- 错误号：3182; 符号： ER_MASTER_KEY_ROTATION_SE_UNAVAILABLE; SQLSTATE：HY000

报错信息格式：存储引擎不可用。


</br>

- 错误号：3183; 符号： ER_TABLESPACE_CANNOT_ENCRYPT; SQLSTATE：HY000

报错信息格式：无法加密此表空间。


</br>

- 错误号：3184; 符号： ER_INVALID_ENCRYPTION_OPTION; SQLSTATE：HY000

报错信息格式：无效的加密选项。


</br>

- 错误号：3185; 符号： ER_CANNOT_FIND_KEY_IN_KEYRING; SQLSTATE：HY000

报错信息格式：无法从密钥环中找到主密钥，请检查服务器日志中是否成功加载并初始化了密钥环插件。


</br>

- 错误号：3186; 符号： ER_CAPACITY_EXCEEDED_IN_PARSER; SQLSTATE：HY000

报错信息格式：解析器为该查询提供了保释。


</br>

- 错误号：3187; 符号： ER_UNSUPPORTED_ALTER_ENCRYPTION_INPLACE; SQLSTATE：HY000

报错信息格式：无法通过就地算法更改加密属性。


</br>

- 错误号：3188; 符号： ER_KEYRING_UDF_KEYRING_SERVICE_ERROR; SQLSTATE：HY000

报错信息格式：函数'％s'失败，因为基础密钥环服务返回了错误。

请检查是否安装了密钥环插件，并且所提供的参数对您使用的密钥环有效。


</br>

- 错误号：3189; 符号： ER_USER_COLUMN_OLD_LENGTH; SQLSTATE：HY000

报错信息格式：看来您的数据库架构是旧的。

％s列的长度为77个字符，应为93个字符。

请执行MySQL升级程序。


</br>

- 错误号：3190; 符号： ER_CANT_RESET_MASTER; SQLSTATE： HY000

报错信息格式：由于％s，不允许使用RESET MASTER。


</br>

- 错误号：3191; 符号： ER_GROUP_REPLICATION_MAX_GROUP_SIZE; SQLSTATE：HY000

报错信息格式：由于该组已有9个成员，因此START GROUP_REPLICATION命令失败。


</br>

- 错误号：3192; 符号： ER_CANNOT_ADD_FOREIGN_BASE_COL_STORED; SQLSTATE：HY000

报错信息格式：无法在存储列的基础列上添加外键。


</br>

- 错误号：3193; 符号： ER_TABLE_REFERENCED; SQLSTATE： HY000

报错信息格式：无法完成该操作，因为该表已被另一个连接引用。


</br>

- 错误号：3197; 符号： ER_XA_RETRY; SQLSTATE： HY000

报错信息格式：资源管理器当前无法提交事务分支。

请稍后重试。

ER_XA_RETRY 在8.0.2中添加。


</br>

- 错误号：3198; 符号： ER_KEYRING_AWS_UDF_AWS_KMS_ERROR; SQLSTATE：HY000

报错信息格式：功能％s失败，原因是：％s。

ER_KEYRING_AWS_UDF_AWS_KMS_ERROR 在8.0.2中添加。


</br>

- 错误号：3199; 符号： ER_BINLOG_UNSAFE_XA; SQLSTATE： HY000

报错信息格式：语句不安全，因为它在XA事务中使用。

使用语句复制时，并发XA事务可能在从属服务器上死锁。

ER_BINLOG_UNSAFE_XA 在8.0.2中添加。


</br>

- 错误号：3200; 符号： ER_UDF_ERROR; SQLSTATE： HY000

报错信息格式：％s UDF失败；％s。

ER_UDF_ERROR 在8.0.4中添加。


</br>

- 错误号：3201; 符号： ER_KEYRING_MIGRATION_FAILURE; SQLSTATE：HY000

报错信息格式：无法执行密钥环迁移：％s。

ER_KEYRING_MIGRATION_FAILURE 在8.0.4中添加。


</br>

- 错误号：3202; 符号： ER_KEYRING_ACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：访问被拒绝；您需要％s权限才能执行此操作。

ER_KEYRING_ACCESS_DENIED_ERROR 在8.0.4中添加。


</br>

- 错误号：3203; 符号： ER_KEYRING_MIGRATION_STATUS; SQLSTATE：HY000

报错信息格式：密钥环迁移％s。

ER_KEYRING_MIGRATION_STATUS 在8.0.4中添加。


</br>

- 错误号：3218; 符号： ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE; SQLSTATE：HY000

报错信息格式：无效的“ max_array_length”参数值。

ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE 已在8.0.11中添加。


</br>

- 错误号：3500; 符号： ER_UNSUPPORT_COMPRESSED_TEMPORARY_TABLE; SQLSTATE：HY000

报错信息格式：ROW_FORMAT = COMPRESSED或KEY_BLOCK_SIZE不允许使用CREATE TEMPORARY TABLE。


</br>

- 错误号：3501; 符号： ER_ACL_OPERATION_FAILED; SQLSTATE： HY000

报错信息格式：由于来自SE的以下错误，ACL操作失败：错误代码％d-％s。

</br>

- 错误号：3502; 符号： ER_UNSUPPORTED_INDEX_ALGORITHM; SQLSTATE：HY000

报错信息格式：此存储引擎不支持％s索引算法，而是使用了存储引擎默认值。


</br>

- 错误号：3503; 符号： ER_NO_SUCH_DB; SQLSTATE： 42Y07

报错信息格式：数据库'％s'不存在。

</br>

- 错误号：3504; 符号： ER_TOO_BIG_ENUM; SQLSTATE： HY000

报错信息格式：％s列的枚举值太多。


</br>

- 错误号：3505; 符号： ER_TOO_LONG_SET_ENUM_VALUE; SQLSTATE：HY000

报错信息格式：列％s的枚举/设置值太长。


</br>

- 错误号：3506; 符号： ER_INVALID_DD_OBJECT; SQLSTATE： HY000

报错信息格式：％s字典对象无效。

（％s）

</br>

- 错误号：3507; 符号： ER_UPDATING_DD_TABLE; SQLSTATE： HY000

报错信息格式：无法更新％s字典对象。


</br>

- 错误号：3508; 符号： ER_INVALID_DD_OBJECT_ID; SQLSTATE： HY000

报错信息格式：字典对象ID（％lu）不存在。


</br>

- 错误号：3509; 符号： ER_INVALID_DD_OBJECT_NAME; SQLSTATE：HY000

报错信息格式：字典对象名称'％s'无效。

（％s）

</br>

- 错误号：3510; 符号： ER_TABLESPACE_MISSING_WITH_NAME; SQLSTATE：HY000

报错信息格式：表空间％s不存在。


</br>

- 错误号：3511; 符号： ER_TOO_LONG_ROUTINE_COMMENT; SQLSTATE：HY000

报错信息格式：例程'％s'的注释过长（最大值=％lu）。

</br>

- 错误号：3512; 符号： ER_SP_LOAD_FAILED; SQLSTATE： HY000

报错信息格式：无法加载例程'％s'。


</br>

- 错误号：3513; 符号： ER_INVALID_BITWISE_OPERANDS_SIZE; SQLSTATE：HY000

报错信息格式：按位运算符的二进制操作数必须具有相等的长度。

</br>

- 错误号：3514; 符号： ER_INVALID_BITWISE_AGGREGATE_OPERANDS_SIZE; SQLSTATE：HY000

报错信息格式：聚合的按位函数不能接受超过511个字节的参数；考虑使用SUBSTRING（）函数。

</br>

- 错误号：3515; 符号： ER_WARN_UNSUPPORTED_HINT; SQLSTATE：HY000

报错信息格式：％s不支持提示。

</br>

- 错误号：3516; 符号： ER_UNEXPECTED_GEOMETRY_TYPE; SQLSTATE：22S01

报错信息格式：％s值是％s中的意外类型％s的几何。


</br>

- 错误号：3517; 符号： ER_SRS_PARSE_ERROR; SQLSTATE： SR002

报错信息格式：无法解析SRID％u的空间参考系统定义。


</br>

- 错误号：3518; 符号： ER_SRS_PROJ_PARAMETER_MISSING; SQLSTATE：SR003

报错信息格式：SRID％u的空间参考系统定义未指定强制性％s（EPSG％u）投影参数。


</br>

- 错误号：3519; 符号： ER_WARN_SRS_NOT_FOUND; SQLSTATE： 01000

报错信息格式：没有具有SRID％u的空间参照系。


</br>

- 错误号：3520; 符号： ER_SRS_NOT_CARTESIAN; SQLSTATE： 22S00

报错信息格式：函数％s仅为笛卡尔空间参考系统定义，但其参数之一在SRID％u中，而不是笛卡尔。


</br>

- 错误号：3521; 符号： ER_SRS_NOT_CARTESIAN_UNDEFINED; SQLSTATE：SR001

报错信息格式：仅为笛卡尔空间参考系统定义函数％s，但其参数之一在SRID％u中，尚未定义。


</br>

- 错误号：3522; 符号： ER_PK_INDEX_CANT_BE_INVISIBLE; SQLSTATE：HY000

报错信息格式：主键索引不能不可见。

</br>

- 错误号：3523; 符号： ER_UNKNOWN_AUTHID; SQLSTATE： HY000

报错信息格式：未知授权ID％s @％s。

</br>

- 错误号：3524; 符号： ER_FAILED_ROLE_GRANT; SQLSTATE： HY000

报错信息格式：无法将％s`授予％s。

</br>

- 错误号：3525; 符号： ER_OPEN_ROLE_TABLES; SQLSTATE： HY000

报错信息格式：无法打开安全系统表。

</br>

- 错误号：3526; 符号： ER_FAILED_DEFAULT_ROLES; SQLSTATE： HY000

报错信息格式：无法设置默认角色。

</br>

- 错误号：3527; 符号： ER_COMPONENTS_NO_SCHEME; SQLSTATE： HY000

报错信息格式：在指定的URN'％s'中找不到架构。


</br>

- 错误号：3528; 符号： ER_COMPONENTS_NO_SCHEME_SERVICE; SQLSTATE：HY000

报错信息格式：无法获取指定的URN：％s中的模式“％s”的方案加载服务实现。


</br>

- 错误号：3529; 符号： ER_COMPONENTS_CANT_LOAD; SQLSTATE： HY000

报错信息格式：无法从指定的URN：'％s'加载组件。


</br>

- 错误号：3530; 符号： ER_ROLE_NOT_GRANTED; SQLSTATE： HY000

报错信息格式：％s @@％s没有被授予％s @@％s。

</br>

- 错误号：3531; 符号： ER_FAILED_REVOKE_ROLE; SQLSTATE： HY000

报错信息格式：无法撤消％s @@ s中的角色。

</br>

- 错误号：3532; 符号： ER_RENAME_ROLE; SQLSTATE： HY000

报错信息格式：禁止重命名角色标识符。

</br>

- 错误号：3533; 符号： ER_COMPONENTS_CANT_ACQUIRE_SERVICE_IMPLEMENTATION; SQLSTATE：HY000

报错信息格式：无法获取指定的服务实现：'％s'。


</br>

- 错误号：3534; 符号： ER_COMPONENTS_CANT_SATISFY_DEPENDENCY; SQLSTATE：HY000

报错信息格式：无法满足组件'％s'对服务'％s'的依赖性。


</br>

- 错误号：3535; 符号： ER_COMPONENTS_LOAD_CANT_REGISTER_SERVICE_IMPLEMENTATION; SQLSTATE：HY000

报错信息格式：无法注册组件“％s”提供的服务实现“％s”。


</br>

- 错误号：3536; 符号： ER_COMPONENTS_LOAD_CANT_INITIALIZE; SQLSTATE：HY000

报错信息格式：由组件'％s'提供的初始化方法失败。


</br>

- 错误号：3537; 符号： ER_COMPONENTS_UNLOAD_NOT_LOADED; SQLSTATE：HY000

报错信息格式：由URN'％s'指定要卸载的组件之前尚未装载。


</br>

- 错误号：3538; 符号： ER_COMPONENTS_UNLOAD_CANT_DEINITIALIZE; SQLSTATE：HY000

报错信息格式：由组件'％s'提供的取消初始化方法失败。


</br>

- 错误号：3539; 符号： ER_COMPONENTS_CANT_RELEASE_SERVICE; SQLSTATE：HY000

报错信息格式：发布先前获得的服务实现失败。


</br>

- 错误号：3540; 符号： ER_COMPONENTS_UNLOAD_CANT_UNREGISTER_SERVICE; SQLSTATE：HY000

报错信息格式：在组件卸载期间，由组件'％s'提供的服务实现'％s'的注册失败。


</br>

- 错误号：3541; 符号： ER_COMPONENTS_CANT_UNLOAD; SQLSTATE：HY000

报错信息格式：无法从指定的URN'％s'卸载组件。


</br>

- 错误号：3542; 符号： ER_WARN_UNLOAD_THE_NOT_PERSISTED; SQLSTATE：HY000

报错信息格式：Persistent Dynamic Loader已用于卸载组件'％s'，但之前并未用于加载该组件。


</br>

- 错误号：3543; 符号： ER_COMPONENT_TABLE_INCORRECT; SQLSTATE：HY000

报错信息格式：mysql.component表丢失或定义不正确。


</br>

- 错误号：3544; 符号： ER_COMPONENT_MANIPULATE_ROW_FAILED; SQLSTATE：HY000

报错信息格式：无法处理组件'％s'的持久性数据。

来自存储引擎的错误代码％d。


</br>

- 错误号：3545; 符号： ER_COMPONENTS_UNLOAD_DUPLICATE_IN_GROUP; SQLSTATE：HY000

报错信息格式：在组中多次指定了具有指定的URN：'％s'的组件。


</br>

- 错误号：3546; 符号： ER_CANT_SET_GTID_PURGED_DUE_SETS_CONSTRAINTS; SQLSTATE：HY000

报错信息格式：@@ GLOBAL.GTID_PURGED无法更改：％s。

</br>

- 错误号：3547; 符号： ER_CANNOT_LOCK_USER_MANAGEMENT_CACHES; SQLSTATE：HY000

报错信息格式：无法锁定用户管理缓存进行处理。


</br>

- 错误号：3548; 符号： ER_SRS_NOT_FOUND; SQLSTATE： SR001

报错信息格式：没有具有SRID％u的空间参照系。


</br>

- 错误号：3549; 符号： ER_VARIABLE_NOT_PERSISTED; SQLSTATE：HY000

报错信息格式：变量不能持久化。

请重试。


</br>

- 错误号：3550; 符号： ER_IS_QUERY_INVALID_CLAUSE; SQLSTATE：HY000

报错信息格式：信息模式查询不支持'％s'子句。


</br>

- 错误号：3551; 符号： ER_UNABLE_TO_STORE_STATISTICS; SQLSTATE：HY000

报错信息格式：无法将动态％s统计信息存储到数据字典中。


</br>

- 错误号：3552; 符号： ER_NO_SYSTEM_SCHEMA_ACCESS; SQLSTATE：HY000

报错信息格式：对系统模式'％s'的访问被拒绝。


</br>

- 错误号：3553; 符号： ER_NO_SYSTEM_TABLESPACE_ACCESS; SQLSTATE：HY000

报错信息格式：对系统表空间'％s'的访问被拒绝。


</br>

- 错误号：3554; 符号： ER_NO_SYSTEM_TABLE_ACCESS; SQLSTATE：HY000

报错信息格式：对％s'％s。

％s'的访问被拒绝。


</br>

- 错误号：3555; 符号： ER_NO_SYSTEM_TABLE_ACCESS_FOR_DICTIONARY_TABLE; SQLSTATE：HY000

报错信息格式：数据字典表。

ER_NO_SYSTEM_TABLE_ACCESS_FOR_DICTIONARY_TABLE 在8.0.1中添加。


</br>

- 错误号：3556; 符号： ER_NO_SYSTEM_TABLE_ACCESS_FOR_SYSTEM_TABLE; SQLSTATE：HY000

报错信息格式：系统表。

ER_NO_SYSTEM_TABLE_ACCESS_FOR_SYSTEM_TABLE 在8.0.1中添加。


</br>

- 错误号：3557; 符号： ER_NO_SYSTEM_TABLE_ACCESS_FOR_TABLE; SQLSTATE：HY000
报错信息格式：表格。

ER_NO_SYSTEM_TABLE_ACCESS_FOR_TABLE 在8.0.1中添加。


</br>

- 错误号：3558; 符号： ER_INVALID_OPTION_KEY; SQLSTATE： 22023

报错信息格式：函数％s中的无效选项键'％s'。

ER_INVALID_OPTION_KEY 在8.0.1中添加。


</br>

- 错误号：3559; 符号： ER_INVALID_OPTION_VALUE; SQLSTATE： 22023

报错信息格式：函数'％s'中选项'％s'的值'％s'无效。

ER_INVALID_OPTION_VALUE 在8.0.1中添加。


</br>

- 错误号：3560; 符号： ER_INVALID_OPTION_KEY_VALUE_PAIR; SQLSTATE：22023

报错信息格式：字符串'％s'在函数％s中不是有效的键％c值对。

ER_INVALID_OPTION_KEY_VALUE_PAIR 在8.0.1中添加。


</br>

- 错误号：3561; 符号： ER_INVALID_OPTION_START_CHARACTER; SQLSTATE：22023

报错信息格式：函数％s中的options参数以无效字符'％c'开头。

ER_INVALID_OPTION_START_CHARACTER 在8.0.1中添加。


</br>

- 错误号：3562; 符号： ER_INVALID_OPTION_END_CHARACTER; SQLSTATE：22023

报错信息格式：函数％s中的options参数以无效字符'％c'结尾。

ER_INVALID_OPTION_END_CHARACTER 在8.0.1中添加。


</br>

- 错误号：3563; 符号： ER_INVALID_OPTION_CHARACTERS; SQLSTATE：22023

报错信息格式：函数％s中的options参数包含无效的字符序列'％s'。

ER_INVALID_OPTION_CHARACTERS 在8.0.1中添加。


</br>

- 错误号：3564; 符号： ER_DUPLICATE_OPTION_KEY; SQLSTATE： 22023

报错信息格式：功能'％s'中重复的选项键'％s'。

ER_DUPLICATE_OPTION_KEY 在8.0.1中添加。


</br>

- 错误号：3565; 符号： ER_WARN_SRS_NOT_FOUND_AXIS_ORDER; SQLSTATE：01000

报错信息格式：没有具有SRID％u的空间参照系。

轴顺序未知。

ER_WARN_SRS_NOT_FOUND_AXIS_ORDER 在8.0.1中添加。


</br>

- 错误号：3566; 符号： ER_NO_ACCESS_TO_NATIVE_FCT; SQLSTATE：HY000

报错信息格式：对本机函数'％s'的访问被拒绝。

ER_NO_ACCESS_TO_NATIVE_FCT 在8.0.1中添加。


</br>

- 错误号：3567; 符号： ER_RESET_MASTER_TO_VALUE_OUT_OF_RANGE; SQLSTATE：HY000

报错信息格式：下一个二进制日志索引的请求值'％llu'超出范围。

请使用介于'1'和'％lu'之间的值。

ER_RESET_MASTER_TO_VALUE_OUT_OF_RANGE 在8.0.1中添加。


</br>

- 错误号：3568; 符号： ER_UNRESOLVED_TABLE_LOCK; SQLSTATE：HY000

报错信息格式：锁定子句中未解析的表名％s。

ER_UNRESOLVED_TABLE_LOCK 在8.0.1中添加。


</br>

- 错误号：3569; 符号： ER_DUPLICATE_TABLE_LOCK; SQLSTATE： HY000

报错信息格式：表％s出现在多个锁定子句中。

ER_DUPLICATE_TABLE_LOCK 在8.0.1中添加。


</br>

- 错误号：3570; 符号： ER_BINLOG_UNSAFE_SKIP_LOCKED; SQLSTATE：HY000

报错信息格式：语句不安全，因为它使用“跳过锁定”。

插入值的集合是不确定的。

ER_BINLOG_UNSAFE_SKIP_LOCKED 在8.0.1中添加。


</br>

- 错误号：3571; 符号： ER_BINLOG_UNSAFE_NOWAIT; SQLSTATE： HY000

报错信息格式：语句不安全，因为它使用NOWAIT。

命令是成功还是失败是不确定的。

ER_BINLOG_UNSAFE_NOWAIT 在8.0.1中添加。


</br>

- 错误号：3572; 符号： ER_LOCK_NOWAIT; SQLSTATE： HY000

报错信息格式：语句中止，因为无法立即获取锁并且设置了NOWAIT。

ER_LOCK_NOWAIT 在8.0.1中添加。


</br>

- 错误号：3573; 符号： ER_CTE_RECURSIVE_REQUIRES_UNION; SQLSTATE：HY000

报错信息格式：递归公用表表达式'％s'应该包含UNION。

ER_CTE_RECURSIVE_REQUIRES_UNION 在8.0.1中添加。


</br>

- 错误号：3574; 符号： ER_CTE_RECURSIVE_REQUIRES_NONRECURSIVE_FIRST; SQLSTATE：HY000

报错信息格式：递归公用表表达式'％s'应该具有一个或多个非递归查询块，然后是一个或多个递归查询块。

ER_CTE_RECURSIVE_REQUIRES_NONRECURSIVE_FIRST 在8.0.1中添加。


</br>

- 错误号：3575; 符号： ER_CTE_RECURSIVE_FORBIDS_AGGREGATION; SQLSTATE：HY000

报错信息格式：递归公用表表达式'％s'不能在递归查询块中包含聚合或窗口函数。

ER_CTE_RECURSIVE_FORBIDS_AGGREGATION 在8.0.1中添加。


</br>

- 错误号：3576; 符号： ER_CTE_RECURSIVE_FORBIDDEN_JOIN_ORDER; SQLSTATE：HY000

报错信息格式：在递归公用表表达式'％s'的递归查询块中，递归表既不能在LEFT JOIN的正确参数中，也不能被强制为非第一个具有连接顺序提示的表。

ER_CTE_RECURSIVE_FORBIDDEN_JOIN_ORDER 在8.0.1中添加。


</br>

- 错误号：3577; 符号： ER_CTE_RECURSIVE_REQUIRES_SINGLE_REFERENCE; SQLSTATE：HY000

报错信息格式：在递归公用表表达式'％s'的递归查询块中，递归表必须仅被引用一次，而不能在任何子查询中引用。

ER_CTE_RECURSIVE_REQUIRES_SINGLE_REFERENCE 在8.0.1中添加。


</br>

- 错误号：3578; 符号： ER_SWITCH_TMP_ENGINE; SQLSTATE： HY000

报错信息格式：'％s'需要@@ internal_tmp_disk_storage_engine = InnoDB。

ER_SWITCH_TMP_ENGINE 在8.0.1中添加。


</br>

- 错误号：3579; 符号： ER_WINDOW_NO_SUCH_WINDOW; SQLSTATE：HY000

报错信息格式：未定义窗口名称'％s'。

ER_WINDOW_NO_SUCH_WINDOW 在8.0.2中添加。


</br>

- 错误号：3580; 符号： ER_WINDOW_CIRCULARITY_IN_WINDOW_GRAPH; SQLSTATE：HY000

报错信息格式：窗口相关性图中有一个圆度。

ER_WINDOW_CIRCULARITY_IN_WINDOW_GRAPH 在8.0.2中添加。


</br>

- 错误号：3581; 符号： ER_WINDOW_NO_CHILD_PARTITIONING; SQLSTATE：HY000

报错信息格式：依赖于另一个窗口的窗口无法定义分区。

ER_WINDOW_NO_CHILD_PARTITIONING 在8.0.2中添加。


</br>

- 错误号：3582; 符号： ER_WINDOW_NO_INHERIT_FRAME; SQLSTATE：HY000

报错信息格式：窗口'％s'具有框架定义，因此不能被另一个窗口引用。

ER_WINDOW_NO_INHERIT_FRAME 在8.0.2中添加。


</br>

- 错误号：3583; 符号： ER_WINDOW_NO_REDEFINE_ORDER_BY; SQLSTATE：HY000

报错信息格式：窗口'％s'不能继承'％s'，因为它们都包含ORDER BY子句。

ER_WINDOW_NO_REDEFINE_ORDER_BY 在8.0.2中添加。


</br>

- 错误号：3584; 符号： ER_WINDOW_FRAME_START_ILLEGAL; SQLSTATE：HY000

报错信息格式：窗口'％s'：帧开始不能为未绑定。

ER_WINDOW_FRAME_START_ILLEGAL 在8.0.2中添加。


</br>

- 错误号：3585; 符号： ER_WINDOW_FRAME_END_ILLEGAL; SQLSTATE：HY000

报错信息格式：窗口'％s'：帧结束不能为空前。

ER_WINDOW_FRAME_END_ILLEGAL 在8.0.2中添加。


</br>

- 错误号：3586; 符号： ER_WINDOW_FRAME_ILLEGAL; SQLSTATE： HY000

报错信息格式：窗口'％s'：帧的开始或结束为负，NULL或非整数类型。

ER_WINDOW_FRAME_ILLEGAL 在8.0.2中添加。


</br>

- 错误号：3587; 符号： ER_WINDOW_RANGE_FRAME_ORDER_TYPE; SQLSTATE：HY000

报错信息格式：具有范围N前/后帧的窗口'％s'要求仅一个数字或时间类型的ORDER BY表达式。

ER_WINDOW_RANGE_FRAME_ORDER_TYPE 在8.0.2中添加。


</br>

- 错误号：3588; 符号： ER_WINDOW_RANGE_FRAME_TEMPORAL_TYPE; SQLSTATE：HY000

报错信息格式：带有范围框架的窗口'％s'具有日期时间类型的ORDER BY表达式。

仅允许INTERVAL界限值。

ER_WINDOW_RANGE_FRAME_TEMPORAL_TYPE 在8.0.2中添加。


</br>

- 错误号：3589; 符号： ER_WINDOW_RANGE_FRAME_NUMERIC_TYPE; SQLSTATE：HY000

报错信息格式：带有范围框架的窗口'％s'具有数字类型的ORDER BY表达式，不允许INTERVAL绑定值。

ER_WINDOW_RANGE_FRAME_NUMERIC_TYPE 在8.0.2中添加。


</br>

- 错误号：3590; 符号： ER_WINDOW_RANGE_BOUND_NOT_CONSTANT; SQLSTATE：HY000

报错信息格式：窗口'％s'具有一个非恒定的框架绑定。

ER_WINDOW_RANGE_BOUND_NOT_CONSTANT 在8.0.2中添加。


</br>

- 错误号：3591; 符号： ER_WINDOW_DUPLICATE_NAME; SQLSTATE：HY000

报错信息格式：窗口'％s'被定义了两次。

ER_WINDOW_DUPLICATE_NAME 在8.0.2中添加。


</br>

- 错误号：3592; 符号： ER_WINDOW_ILLEGAL_ORDER_BY; SQLSTATE：HY000

报错信息格式：窗口'％s'：ORDER BY或PARTITION BY使用不支持的旧位置指示，请使用表达式。

ER_WINDOW_ILLEGAL_ORDER_BY 在8.0.2中添加。


</br>

- 错误号：3593; 符号： ER_WINDOW_INVALID_WINDOW_FUNC_USE; SQLSTATE：HY000

报错信息格式：您不能在此上下文中使用窗口函数'％s'。

ER_WINDOW_INVALID_WINDOW_FUNC_USE 在8.0.2中添加。


</br>

- 错误号：3594; 符号： ER_WINDOW_INVALID_WINDOW_FUNC_ALIAS_USE; SQLSTATE：HY000

报错信息格式：您不能在此上下文中使用包含窗口函数的表达式的别名'％s'。

ER_WINDOW_INVALID_WINDOW_FUNC_ALIAS_USE 在8.0.2中添加。


</br>

- 错误号：3595; 符号： ER_WINDOW_NESTED_WINDOW_FUNC_USE_IN_WINDOW_SPEC; SQLSTATE：HY000

报错信息格式：您无法在窗口'％s'的规范中嵌套窗口函数。

ER_WINDOW_NESTED_WINDOW_FUNC_USE_IN_WINDOW_SPEC 在8.0.2中添加。


</br>

- 错误号：3596; 符号： ER_WINDOW_ROWS_INTERVAL_USE; SQLSTATE：HY000

报错信息格式：窗口'％s'：INTERVAL仅可用于RANGE帧。

ER_WINDOW_ROWS_INTERVAL_USE 在8.0.2中添加。


</br>

- 错误号：3597; 符号： ER_WINDOW_NO_GROUP_ORDER; SQLSTATE：HY000

报错信息格式：窗口功能不允许带有GROUP BY的ASC或DESC；将ASC或DESC放入ORDER BY。

ER_WINDOW_NO_GROUP_ORDER 在8.0.2中新增，在8.0.12之后删除。


</br>

- 错误号：3597; 符号： ER_WINDOW_NO_GROUP_ORDER_UNUSED; SQLSTATE：HY000

报错信息格式：窗口功能不允许带有GROUP BY的ASC或DESC；将ASC或DESC放入ORDER BY。

ER_WINDOW_NO_GROUP_ORDER_UNUSED 已在8.0.13中添加。


</br>

- 错误号：3598; 符号： ER_WINDOW_EXPLAIN_JSON; SQLSTATE： HY000

报错信息格式：要获取有关窗口函数的信息，请使用EXPLAIN FORMAT = JSON。

ER_WINDOW_EXPLAIN_JSON 在8.0.2中添加。


</br>

- 错误号：3599; 符号： ER_WINDOW_FUNCTION_IGNORES_FRAME; SQLSTATE：HY000

报错信息格式：窗口函数'％s'忽略窗口'％s'的frame子句，并在整个分区上聚合。

ER_WINDOW_FUNCTION_IGNORES_FRAME 在8.0.2中添加。


</br>

- 错误号：3600; 符号： ER_WINDOW_SE_NOT_ACCEPTABLE; SQLSTATE：HY000

报错信息格式：开窗需要@@ internal_tmp_mem_storage_engine = TempTable。

ER_WINDOW_SE_NOT_ACCEPTABLE 在8.0.2中新增，在8.0.3之后删除。


</br>

- 错误号：3600; 符号： ER_WL9236_NOW_UNUSED; SQLSTATE： HY000

报错信息格式：开窗需要@@ internal_tmp_mem_storage_engine = TempTable。

ER_WL9236_NOW_UNUSED 在8.0.4中添加。


</br>

- 错误号：3601; 符号： ER_INVALID_NO_OF_ARGS; SQLSTATE： HY000

报错信息格式：函数％s的参数过多：％lu; 允许的最大值为％s。

ER_INVALID_NO_OF_ARGS 在8.0.1中添加。


</br>

- 错误号：3602; 符号： ER_FIELD_IN_GROUPING_NOT_GROUP_BY; SQLSTATE：HY000

报错信息格式：GROUPING函数的参数＃％u不在GROUP BY中。

ER_FIELD_IN_GROUPING_NOT_GROUP_BY 在8.0.1中添加。


</br>

- 错误号：3603; 符号： ER_TOO_LONG_TABLESPACE_COMMENT; SQLSTATE：HY000

报错信息格式：表空间'％s'的注释过长（最大值=％lu）。

ER_TOO_LONG_TABLESPACE_COMMENT 在8.0.1中添加。


</br>

- 错误号：3604; 符号： ER_ENGINE_CANT_DROP_TABLE; SQLSTATE：HY000

报错信息格式：存储引擎无法删除表'％s'。

ER_ENGINE_CANT_DROP_TABLE 在8.0.1中添加。


</br>

- 错误号：3605; 符号： ER_ENGINE_CANT_DROP_MISSING_TABLE; SQLSTATE：HY000

报错信息格式：存储引擎无法删除表'％s'，因为它已丢失。

使用DROP TABLE IF EXISTS将其从数据字典中删除。

ER_ENGINE_CANT_DROP_MISSING_TABLE 在8.0.1中添加。


</br>

- 错误号：3606; 符号： ER_TABLESPACE_DUP_FILENAME; SQLSTATE：HY000

报错信息格式：表空间'％s'的文件名重复。

ER_TABLESPACE_DUP_FILENAME 在8.0.1中添加。


</br>

- 错误号：3607; 符号： ER_DB_DROP_RMDIR2; SQLSTATE： HY000

报错信息格式：删除数据库时出现问题。

无法删除数据库目录（％s）。

请手动将其删除。

ER_DB_DROP_RMDIR2 在8.0.1中添加。


</br>

- 错误号：3608; 符号： ER_IMP_NO_FILES_MATCHED; SQLSTATE： HY000

报错信息格式：没有SDI文件与模式'％s'相匹配。

ER_IMP_NO_FILES_MATCHED 在8.0.1中添加。


</br>

- 错误号：3609; 符号： ER_IMP_SCHEMA_DOES_NOT_EXIST; SQLSTATE：HY000

报错信息格式：在SDI中引用的架构'％s'不存在。

ER_IMP_SCHEMA_DOES_NOT_EXIST 在8.0.1中添加。


</br>

- 错误号：3610; 符号： ER_IMP_TABLE_ALREADY_EXISTS; SQLSTATE：HY000

报错信息格式：在SDI中引用的表'％s。

％s'已经存在。

ER_IMP_TABLE_ALREADY_EXISTS 在8.0.1中添加。


</br>

- 错误号：3611; 符号： ER_IMP_INCOMPATIBLE_MYSQLD_VERSION; SQLSTATE：HY000

报错信息格式：导入的mysqld_version（％llu）与当前版本（％llu）不兼容。

ER_IMP_INCOMPATIBLE_MYSQLD_VERSION 在8.0.1中添加。


</br>

- 错误号：3612; 符号： ER_IMP_INCOMPATIBLE_DD_VERSION; SQLSTATE：HY000

报错信息格式：导入的dd版本（％u）与当前版本（％u）不兼容。

ER_IMP_INCOMPATIBLE_DD_VERSION 在8.0.1中添加。


</br>

- 错误号：3613; 符号： ER_IMP_INCOMPATIBLE_SDI_VERSION; SQLSTATE：HY000

报错信息格式：导入的sdi版本（％llu）与当前版本（％llu）不兼容。

ER_IMP_INCOMPATIBLE_SDI_VERSION 在8.0.1中添加。


</br>

- 错误号：3614; 符号： ER_WARN_INVALID_HINT; SQLSTATE： HY000

报错信息格式：提示％s的参数数目无效。

ER_WARN_INVALID_HINT 在8.0.1中添加。


</br>

- 错误号：3615; 符号： ER_VAR_DOES_NOT_EXIST; SQLSTATE： HY000

报错信息格式：变量％s在持久配置文件中不存在。

ER_VAR_DOES_NOT_EXIST 在8.0.1中添加。


</br>

- 错误号：3616; 符号： ER_LONGITUDE_OUT_OF_RANGE; SQLSTATE：22S02

报错信息格式：经度％f在功能％s中超出范围。

它必须在（％f，％f]之内。

ER_LONGITUDE_OUT_OF_RANGE 在8.0.1中添加。


</br>

- 错误号：3617; 符号： ER_LATITUDE_OUT_OF_RANGE; SQLSTATE：22S03

报错信息格式：纬度％f在功能％s中超出范围。

它必须在[％f，％f]之内。

ER_LATITUDE_OUT_OF_RANGE 在8.0.1中添加。


</br>

- 错误号：3618; 符号： ER_NOT_IMPLEMENTED_FOR_GEOGRAPHIC_SRS; SQLSTATE：22S00

报错信息格式：％s（％s）尚未用于地理空间参考系统。

ER_NOT_IMPLEMENTED_FOR_GEOGRAPHIC_SRS 在8.0.1中添加。


</br>

- 错误号：3619; 符号： ER_ILLEGAL_PRIVILEGE_LEVEL; SQLSTATE：HY000

报错信息格式：为％s指定了非法特权级别。

ER_ILLEGAL_PRIVILEGE_LEVEL 在8.0.1中添加。


</br>

- 错误号：3620; 符号： ER_NO_SYSTEM_VIEW_ACCESS; SQLSTATE：HY000

报错信息格式：无法访问系统视图INFORMATION_SCHEMA。

'％s'被拒绝。

ER_NO_SYSTEM_VIEW_ACCESS 在8.0.2中添加。


</br>

- 错误号：3621; 符号： ER_COMPONENT_FILTER_FLABBERGASTED; SQLSTATE：HY000

报错信息格式：日志过滤器组件“％s”在“％s”处感到困惑...。

ER_COMPONENT_FILTER_FLABBERGASTED 在8.0.2中添加。


</br>

- 错误号：3622; 符号： ER_PART_EXPR_TOO_LONG; SQLSTATE： HY000

报错信息格式：分区表达式太长。

ER_PART_EXPR_TOO_LONG 在8.0.2中添加。


</br>

- 错误号：3623; 符号： ER_UDF_DROP_DYNAMICALLY_REGISTERED; SQLSTATE：HY000

报错信息格式：DROP FUNCTION无法删除动态注册的用户定义函数。

ER_UDF_DROP_DYNAMICALLY_REGISTERED 在8.0.2中添加。


</br>

- 错误号：3624; 符号： ER_UNABLE_TO_STORE_COLUMN_STATISTICS; SQLSTATE：HY000

报错信息格式：无法在表'％s'中存储列'％s'的列统计信息。

'％s'
ER_UNABLE_TO_STORE_COLUMN_STATISTICS 在8.0.2中添加。


</br>

- 错误号：3625; 符号： ER_UNABLE_TO_UPDATE_COLUMN_STATISTICS; SQLSTATE：HY000

报错信息格式：无法更新表'％s'中的列'％s'的列统计信息。

'％s'
ER_UNABLE_TO_UPDATE_COLUMN_STATISTICS 在8.0.2中添加。


</br>

- 错误号：3626; 符号： ER_UNABLE_TO_DROP_COLUMN_STATISTICS; SQLSTATE：HY000

报错信息格式：无法删除表'％s'中的列'％s'的列统计信息。

'％s'
ER_UNABLE_TO_DROP_COLUMN_STATISTICS 在8.0.2中添加。


</br>

- 错误号：3627; 符号： ER_UNABLE_TO_BUILD_HISTOGRAM; SQLSTATE：HY000

报错信息格式：无法为表'％s'中的列'％s'建立直方图统计信息。

'％s'
ER_UNABLE_TO_BUILD_HISTOGRAM 在8.0.2中添加。


</br>

- 错误号：3628; 符号： ER_MANDATORY_ROLE; SQLSTATE： HY000

报错信息格式：角色％s是强制性角色，不能撤消或删除。

可以通过将角色标识符从全局变量strict_roles中排除来解除限制。

ER_MANDATORY_ROLE 在8.0.2中添加。


</br>

- 错误号：3629; 符号： ER_MISSING_TABLESPACE_FILE; SQLSTATE：HY000

报错信息格式：表空间'％s'没有名为'％s'的文件。

ER_MISSING_TABLESPACE_FILE 在8.0.3中添加。


</br>

- 错误号：3630; 符号： ER_PERSIST_ONLY_ACCESS_DENIED_ERROR; SQLSTATE：42000

报错信息格式：访问被拒绝；您需要％s权限才能执行此操作。

ER_PERSIST_ONLY_ACCESS_DENIED_ERROR 在8.0.3中添加。


</br>

- 错误号：3631; 符号： ER_CMD_NEED_SUPER; SQLSTATE： HY000

报错信息格式：您需要命令'％s'的SUPER特权。

ER_CMD_NEED_SUPER 在8.0.3中添加。


</br>

- 错误号：3632; 符号： ER_PATH_IN_DATADIR; SQLSTATE： HY000

报错信息格式：路径在当前数据目录'％s'内。

ER_PATH_IN_DATADIR 在8.0.3中添加。


</br>

- 错误号：3633; 符号： ER_DDL_IN_PROGRESS; SQLSTATE： HY000

报错信息格式：在操作过程中执行并发DDL。

请再试一遍。

ER_DDL_IN_PROGRESS 在8.0.3中新增，在8.0.16之后删除了。


</br>

- 错误号：3633; 符号： ER_CLONE_DDL_IN_PROGRESS; SQLSTATE：HY000

报错信息格式：在克隆操作期间执行了并行DDL。

请再试一遍。

ER_CLONE_DDL_IN_PROGRESS 已在8.0.17中添加。


</br>

- 错误号：3634; 符号： ER_TOO_MANY_CONCURRENT_CLONES; SQLSTATE：HY000

报错信息格式：并发克隆操作太多。

允许的最大值-％d。

ER_TOO_MANY_CONCURRENT_CLONES 在8.0.3中新增，在8.0.16之后删除了。


</br>

- 错误号：3634; 符号： ER_CLONE_TOO_MANY_CONCURRENT_CLONES; SQLSTATE：HY000

报错信息格式：并发克隆操作太多。

允许的最大值-％d。

ER_CLONE_TOO_MANY_CONCURRENT_CLONES 已在8.0.17中添加。


</br>

- 错误号：3635; 符号： ER_APPLIER_LOG_EVENT_VALIDATION_ERROR; SQLSTATE：HY000

报错信息格式：事务％s中的表不符合外部插件的要求。

ER_APPLIER_LOG_EVENT_VALIDATION_ERROR 在8.0.3中添加。


</br>

- 错误号：3636; 符号： ER_CTE_MAX_RECURSION_DEPTH; SQLSTATE：HY000

报错信息格式：％u迭代后中止了递归查询。

尝试将@@ cte_max_recursion_depth增加到更大的值。

ER_CTE_MAX_RECURSION_DEPTH 在8.0.3中添加。


</br>

- 错误号：3637; 符号： ER_NOT_HINT_UPDATABLE_VARIABLE; SQLSTATE：HY000

报错信息格式：无法使用SET_VAR提示设置变量％s。

ER_NOT_HINT_UPDATABLE_VARIABLE 在8.0.3中添加。


</br>

- 错误号：3638; 符号： ER_CREDENTIALS_CONTRADICT_TO_HISTORY; SQLSTATE：HY000

报错信息格式：无法将这些凭据用于'%.s@%.s'，因为它们与密码历史记录策略冲突。

ER_CREDENTIALS_CONTRADICT_TO_HISTORY 在8.0.3中添加。


</br>

- 错误号：3639; 符号： ER_WARNING_PASSWORD_HISTORY_CLAUSES_VOID; SQLSTATE：HY000

报错信息格式：用户'％s'@'％s'忽略了非零密码历史记录子句，因为其身份验证插件％s不支持密码历史记录。

ER_WARNING_PASSWORD_HISTORY_CLAUSES_VOID 在8.0.3中添加。


</br>

- 错误号：3640; 符号： ER_CLIENT_DOES_NOT_SUPPORT; SQLSTATE：HY000

报错信息格式：客户端不支持％s。

ER_CLIENT_DOES_NOT_SUPPORT 在8.0.3中添加。


</br>

- 错误号：3641; 符号： ER_I_S_SKIPPED_TABLESPACE; SQLSTATE：HY000

报错信息格式：表空间'％s'被跳过，因为其定义被并发DDL语句修改。

ER_I_S_SKIPPED_TABLESPACE 在8.0.3中添加。


</br>

- 错误号：3642; 符号： ER_TABLESPACE_ENGINE_MISMATCH; SQLSTATE：HY000

报错信息格式：引擎'％s'与表空间'％s'的存储引擎'％s'不匹配。

ER_TABLESPACE_ENGINE_MISMATCH 在8.0.3中添加。


</br>

- 错误号：3643; 符号： ER_WRONG_SRID_FOR_COLUMN; SQLSTATE：HY000

报错信息格式：几何的SRID与列'％s'的SRID不匹配。

几何的SRID为％lu，但列的SRID为％lu。

考虑更改几何的SRID或列的SRID属性。

ER_WRONG_SRID_FOR_COLUMN 在8.0.3中添加。


</br>

- 错误号：3644; 符号： ER_CANNOT_ALTER_SRID_DUE_TO_INDEX; SQLSTATE：HY000

报错信息格式：因为列上有空间索引，所以无法更改列'％s'上的SRID规范。

请先更改空间索引，然后再更改SRID规范。

ER_CANNOT_ALTER_SRID_DUE_TO_INDEX 在8.0.3中添加。


</br>

- 错误号：3645; 符号： ER_WARN_BINLOG_PARTIAL_UPDATES_DISABLED; SQLSTATE：HY000

报错信息格式：％s时，选项binlog_row_value_options =％s将被忽略，更新将以完整格式写入二进制日志。

ER_WARN_BINLOG_PARTIAL_UPDATES_DISABLED 在8.0.3中添加。


</br>

- 错误号：3646; 符号： ER_WARN_BINLOG_V1_ROW_EVENTS_DISABLED; SQLSTATE：HY000

报错信息格式：％s时，选项log_bin_use_v1_row_events = 1将被忽略，并且行事件将以新格式写入二进制日志。

ER_WARN_BINLOG_V1_ROW_EVENTS_DISABLED 在8.0.3中添加。


</br>

- 错误号：3647; 符号： ER_WARN_BINLOG_PARTIAL_UPDATES_SUGGESTS_PARTIAL_IMAGES; SQLSTATE：HY000

报错信息格式：％s时，选项binlog_row_value_options =％s将仅用于残像。

完整值将写入前映像中，因此由于binlog_row_value_options而导致的磁盘空间节省限制为小于50 %%。

ER_WARN_BINLOG_PARTIAL_UPDATES_SUGGESTS_PARTIAL_IMAGES 在8.0.3中添加。


</br>

- 错误号：3648; 符号： ER_COULD_NOT_APPLY_JSON_DIFF; SQLSTATE：HY000

报错信息格式：无法在表％。

* s的列％s中应用JSON差异。

ER_COULD_NOT_APPLY_JSON_DIFF 在8.0.3中添加。


</br>

- 错误号：3649; 符号： ER_CORRUPTED_JSON_DIFF; SQLSTATE： HY000

报错信息格式：表％。

* s，列％s的JSON diff损坏。

ER_CORRUPTED_JSON_DIFF 在8.0.3中添加。


</br>

- 错误号：3650; 符号： ER_RESOURCE_GROUP_EXISTS; SQLSTATE：HY000

报错信息格式：资源组'％s'存在。

ER_RESOURCE_GROUP_EXISTS 在8.0.3中添加。


</br>

- 错误号：3651; 符号： ER_RESOURCE_GROUP_NOT_EXISTS; SQLSTATE：HY000

报错信息格式：资源组'％s'不存在。

ER_RESOURCE_GROUP_NOT_EXISTS 在8.0.3中添加。


</br>

- 错误号：3652; 符号： ER_INVALID_VCPU_ID; SQLSTATE： HY000
报错信息格式：无效的CPU ID％u。

ER_INVALID_VCPU_ID 在8.0.3中添加。


</br>

- 错误号：3653; 符号： ER_INVALID_VCPU_RANGE; SQLSTATE： HY000

报错信息格式：无效的VCPU范围％u-％u。

ER_INVALID_VCPU_RANGE 在8.0.3中添加。


</br>

- 错误号：3654; 符号： ER_INVALID_THREAD_PRIORITY; SQLSTATE：HY000

报错信息格式：％s资源组％s的无效线程优先级值％d。

允许的范围是[％d，％d]。

ER_INVALID_THREAD_PRIORITY 在8.0.3中添加。


</br>

- 错误号：3655; 符号： ER_DISALLOWED_OPERATION; SQLSTATE： HY000

报错信息格式：％s上不允许进行％s操作。

ER_DISALLOWED_OPERATION 在8.0.3中添加。


</br>

- 错误号：3656; 符号： ER_RESOURCE_GROUP_BUSY; SQLSTATE： HY000

报错信息格式：资源组％s忙。

ER_RESOURCE_GROUP_BUSY 在8.0.3中添加。


</br>

- 错误号：3657; 符号： ER_RESOURCE_GROUP_DISABLED; SQLSTATE：HY000

报错信息格式：资源组％s已禁用。

ER_RESOURCE_GROUP_DISABLED 在8.0.3中添加。


</br>

- 错误号：3658; 符号： ER_FEATURE_UNSUPPORTED; SQLSTATE： HY000

报错信息格式：功能％s不支持（％s）。

ER_FEATURE_UNSUPPORTED 在8.0.3中添加。


</br>

- 错误号：3659; 符号： ER_ATTRIBUTE_IGNORED; SQLSTATE： HY000

报错信息格式：属性％s被忽略（％s）。

ER_ATTRIBUTE_IGNORED 在8.0.3中添加。


</br>

- 错误号：3660; 符号： ER_INVALID_THREAD_ID; SQLSTATE： HY000

报错信息格式：无效的线程ID（％llu）。

ER_INVALID_THREAD_ID 在8.0.3中添加。


</br>

- 错误号：3661; 符号： ER_RESOURCE_GROUP_BIND_FAILED; SQLSTATE：HY000

报错信息格式：无法将资源组％s与线程ID（％llu）。

（％s）绑定。

ER_RESOURCE_GROUP_BIND_FAILED 在8.0.3中添加。


</br>

- 错误号：3662; 符号： ER_INVALID_USE_OF_FORCE_OPTION; SQLSTATE：HY000

报错信息格式：选项FORCE无效，因为未指定DISABLE选项。

ER_INVALID_USE_OF_FORCE_OPTION 在8.0.3中添加。


</br>

- 错误号：3663; 符号： ER_GROUP_REPLICATION_COMMAND_FAILURE; SQLSTATE：HY000

报错信息格式：％s命令遇到故障。

％s
ER_GROUP_REPLICATION_COMMAND_FAILURE 在8.0.4中添加。


</br>

- 错误号：3664; 符号： ER_SDI_OPERATION_FAILED; SQLSTATE： HY000

报错信息格式：表空间'％s'中的％s SDI'％s。

％s'失败。

ER_SDI_OPERATION_FAILED 在8.0.3中添加。


</br>

- 错误号：3665; 符号： ER_MISSING_JSON_TABLE_VALUE; SQLSTATE：22035

报错信息格式：缺少JSON_TABLE列'％s'的值。

ER_MISSING_JSON_TABLE_VALUE 在8.0.4中添加。


</br>

- 错误号：3666; 符号： ER_WRONG_JSON_TABLE_VALUE; SQLSTATE：2203F

报错信息格式：无法在标量JSON_TABLE列'％s'中存储数组或对象。

ER_WRONG_JSON_TABLE_VALUE 在8.0.4中添加。


</br>

- 错误号：3667; 符号： ER_TF_MUST_HAVE_ALIAS; SQLSTATE： 42000

报错信息格式：每个表函数必须有一个别名。

ER_TF_MUST_HAVE_ALIAS 在8.0.4中添加。


</br>

- 错误号：3668; 符号： ER_TF_FORBIDDEN_JOIN_TYPE; SQLSTATE：HY000

报错信息格式：INNER或LEFT JOIN必须用于'％s'所做的LATERAL引用。

ER_TF_FORBIDDEN_JOIN_TYPE 在8.0.4中添加。


</br>

- 错误号：3669; 符号： ER_JT_VALUE_OUT_OF_RANGE; SQLSTATE：22003

报错信息格式：值超出JSON_TABLE的列'％s'的范围。

ER_JT_VALUE_OUT_OF_RANGE 在8.0.4中添加。


</br>

- 错误号：3670; 符号： ER_JT_MAX_NESTED_PATH; SQLSTATE： 42000

报错信息格式：在JSON_TABLE'％s'中发现了超过受支持的％u嵌套路径。

ER_JT_MAX_NESTED_PATH 在8.0.4中添加。


</br>

- 错误号：3671; 符号： ER_PASSWORD_EXPIRATION_NOT_SUPPORTED_BY_AUTH_METHOD; SQLSTATE：HY000

报错信息格式：所选的身份验证方法％。

* s不支持密码过期
ER_PASSWORD_EXPIRATION_NOT_SUPPORTED_BY_AUTH_METHOD 在8.0.4中添加。


</br>

- 错误号：3672; 符号： ER_INVALID_GEOJSON_CRS_NOT_TOP_LEVEL; SQLSTATE：HY000

报错信息格式：提供给函数％s的无效GeoJSON数据：必须在顶级对象中指定成员'crs'。

ER_INVALID_GEOJSON_CRS_NOT_TOP_LEVEL 在8.0.4中添加。


</br>

- 错误号：3673; 符号： ER_BAD_NULL_ERROR_NOT_IGNORED; SQLSTATE：23000

报错信息格式：列'％s'不能为空。

ER_BAD_NULL_ERROR_NOT_IGNORED 在8.0.4中添加。


</br>

- 错误号：3674; 符号： WARN_USELESS_SPATIAL_INDEX; SQLSTATE：HY000

报错信息格式：查询优化器将不使用列'％s'上的空间索引，因为该列没有SRID属性。

考虑将SRID属性添加到该列。

WARN_USELESS_SPATIAL_INDEX 在8.0.4中添加。


</br>

- 错误号：3675; 符号： ER_DISK_FULL_NOWAIT; SQLSTATE： HY000

报错信息格式：由于磁盘已满，创建表/表空间'％s'失败。

ER_DISK_FULL_NOWAIT 在8.0.4中添加。


</br>

- 错误号：3676; 符号： ER_PARSE_ERROR_IN_DIGEST_FN; SQLSTATE：HY000

报错信息格式：无法将参数解析为摘要功能：“％s”。

ER_PARSE_ERROR_IN_DIGEST_FN 在8.0.4中添加。


</br>

- 错误号：3677; 符号： ER_UNDISCLOSED_PARSE_ERROR_IN_DIGEST_FN; SQLSTATE：HY000

报错信息格式：无法将参数解析为摘要函数。

ER_UNDISCLOSED_PARSE_ERROR_IN_DIGEST_FN 在8.0.4中添加。


</br>

- 错误号：3678; 符号： ER_SCHEMA_DIR_EXISTS; SQLSTATE： HY000

报错信息格式：模式目录'％s'已经存在。

必须手动解决此问题（例如，通过将架构目录移动到另一个位置）。

ER_SCHEMA_DIR_EXISTS 在8.0.4中添加。


</br>

- 错误号：3679; 符号： ER_SCHEMA_DIR_MISSING; SQLSTATE： HY000

报错信息格式：模式目录'％s'不存在。

ER_SCHEMA_DIR_MISSING 在8.0.4中添加。


</br>

- 错误号：3680; 符号： ER_SCHEMA_DIR_CREATE_FAILED; SQLSTATE：HY000

报错信息格式：无法创建架构目录'％s'（错误号：％d-％s）。

ER_SCHEMA_DIR_CREATE_FAILED 在8.0.4中添加。


</br>

- 错误号：3681; 符号： ER_SCHEMA_DIR_UNKNOWN; SQLSTATE： HY000

报错信息格式：模式'％s'不存在，但是找到了模式目录'％s'。

必须手动解决此问题（例如，通过将架构目录移动到另一个位置）。

ER_SCHEMA_DIR_UNKNOWN 在8.0.4中添加。


</br>

- 错误号：3682; 符号： ER_ONLY_IMPLEMENTED_FOR_SRID_0_AND_4326; SQLSTATE：22S00

报错信息格式：仅为SRID 0和SRID 4326定义了功能％s。

ER_ONLY_IMPLEMENTED_FOR_SRID_0_AND_4326 在8.0.4中添加。


</br>

- 错误号：3683; 符号： ER_BINLOG_EXPIRE_LOG_DAYS_AND_SECS_USED_TOGETHER; SQLSTATE：HY000

报错信息格式：选项expire_logs_days和binlog_expire_logs_seconds不能一起使用。

请使用binlog_expire_logs_seconds设置到期时间（不建议使用expire_logs_days）
ER_BINLOG_EXPIRE_LOG_DAYS_AND_SECS_USED_TOGETHER 已在8.0.11中添加。


</br>

- 错误号：3684; 符号： ER_REGEXP_STRING_NOT_TERMINATED; SQLSTATE：HY000

报错信息格式：输出字符串不能以零结尾，因为长度超过了缓冲区容量。

ER_REGEXP_STRING_NOT_TERMINATED 在8.0.4中新增，在8.0.4之后删除了。


</br>

- 错误号：3684; 符号： ER_REGEXP_BUFFER_OVERFLOW; SQLSTATE：HY000

报错信息格式：结果字符串大于结果缓冲区。

ER_REGEXP_BUFFER_OVERFLOW 在8.0.4中添加。


</br>

- 错误号：3685; 符号： ER_REGEXP_ILLEGAL_ARGUMENT; SQLSTATE：HY000

报错信息格式：正则表达式的参数非法。

ER_REGEXP_ILLEGAL_ARGUMENT 在8.0.4中添加。


</br>

- 错误号：3686; 符号： ER_REGEXP_INDEX_OUTOFBOUNDS_ERROR; SQLSTATE：HY000

报错信息格式：索引超出了正则表达式搜索范围。

ER_REGEXP_INDEX_OUTOFBOUNDS_ERROR 在8.0.4中添加。


</br>

- 错误号：3687; 符号： ER_REGEXP_INTERNAL_ERROR; SQLSTATE：HY000

报错信息格式：正则表达式库中的内部错误。

ER_REGEXP_INTERNAL_ERROR 在8.0.4中添加。


</br>

- 错误号：3688; 符号： ER_REGEXP_RULE_SYNTAX; SQLSTATE： HY000

报错信息格式：第％u行的正则表达式的语法错误，字符％u。

ER_REGEXP_RULE_SYNTAX 在8.0.4中添加。


</br>

- 错误号：3689; 符号： ER_REGEXP_BAD_ESCAPE_SEQUENCE; SQLSTATE：HY000

报错信息格式：正则表达式中无法识别的转义序列。

ER_REGEXP_BAD_ESCAPE_SEQUENCE 在8.0.4中添加。


</br>

- 错误号：3690; 符号： ER_REGEXP_UNIMPLEMENTED; SQLSTATE： HY000

报错信息格式：正则表达式包含此库版本未实现的功能。

ER_REGEXP_UNIMPLEMENTED 在8.0.4中添加。


</br>

- 错误号：3691; 符号： ER_REGEXP_MISMATCHED_PAREN; SQLSTATE：HY000

报错信息格式：正则表达式中的括号不匹配。

ER_REGEXP_MISMATCHED_PAREN 在8.0.4中添加。


</br>

- 错误号：3692; 符号： ER_REGEXP_BAD_INTERVAL; SQLSTATE： HY000

报错信息格式：{min，max}间隔的错误描述。

ER_REGEXP_BAD_INTERVAL 在8.0.4中添加。


</br>

- 错误号：3693; 符号： ER_REGEXP_MAX_LT_MIN; SQLSTATE： HY000

报错信息格式：最大值小于{min，max}间隔中的最小值。

ER_REGEXP_MAX_LT_MIN 在8.0.4中添加。


</br>

- 错误号：3694; 符号： ER_REGEXP_INVALID_BACK_REF; SQLSTATE：HY000

报错信息格式：正则表达式中的反向引用无效。

ER_REGEXP_INVALID_BACK_REF 在8.0.4中添加。


</br>

- 错误号：3695; 符号： ER_REGEXP_LOOK_BEHIND_LIMIT; SQLSTATE：HY000

报错信息格式：后向断言超出了正则表达式的限制。

ER_REGEXP_LOOK_BEHIND_LIMIT 在8.0.4中添加。


</br>

- 错误号：3696; 符号： ER_REGEXP_MISSING_CLOSE_BRACKET; SQLSTATE：HY000

报错信息格式：正则表达式包含未封闭的括号表达式。

ER_REGEXP_MISSING_CLOSE_BRACKET 在8.0.4中添加。


</br>

- 错误号：3697; 符号： ER_REGEXP_INVALID_RANGE; SQLSTATE： HY000

报错信息格式：正则表达式包含[xy]字符范围，其中x在y之后。

ER_REGEXP_INVALID_RANGE 在8.0.4中添加。


</br>

- 错误号：3698; 符号： ER_REGEXP_STACK_OVERFLOW; SQLSTATE：HY000

报错信息格式：正则表达式回溯堆栈中溢出。

ER_REGEXP_STACK_OVERFLOW 在8.0.4中添加。


</br>

- 错误号：3699; 符号： ER_REGEXP_TIME_OUT; SQLSTATE： HY000

报错信息格式：正则表达式匹配中超出了超时。

ER_REGEXP_TIME_OUT 在8.0.4中添加。


</br>

- 错误号：3700; 符号： ER_REGEXP_PATTERN_TOO_BIG; SQLSTATE：HY000

报错信息格式：正则表达式模式超出了大小或复杂性的限制。

ER_REGEXP_PATTERN_TOO_BIG 在8.0.4中添加。


</br>

- 错误号：3701; 符号： ER_CANT_SET_ERROR_LOG_SERVICE; SQLSTATE：HY000

报错信息格式：％s的值在“％s”或附近引起混淆。

语法可能有误，可能未安装组件，或者列出了不支持实例的组件多次。

ER_CANT_SET_ERROR_LOG_SERVICE 在8.0.4中添加。


</br>

- 错误号：3702; 符号： ER_EMPTY_PIPELINE_FOR_ERROR_LOG_SERVICE; SQLSTATE：HY000

报错信息格式：设置一个空的％s管道将禁用错误日志记录！。

ER_EMPTY_PIPELINE_FOR_ERROR_LOG_SERVICE 在8.0.4中添加。


</br>

- 错误号：3703; 符号： ER_COMPONENT_FILTER_DIAGNOSTICS; SQLSTATE：HY000

报错信息格式：过滤器％s：％s。

ER_COMPONENT_FILTER_DIAGNOSTICS 在8.0.4中添加。


</br>

- 错误号：3704; 符号： ER_INNODB_CANNOT_BE_IGNORED; SQLSTATE：HY000

报错信息格式：ignore-builtin-innodb将被忽略，并将在以后的版本中删除。

ER_INNODB_CANNOT_BE_IGNORED 在8.0.2中新增，在8.0.2之后删除。


</br>

- 错误号：3704; 符号： ER_NOT_IMPLEMENTED_FOR_CARTESIAN_SRS; SQLSTATE：22S00

报错信息格式：尚未为笛卡尔空间参考系统实现％s（％s）。

ER_NOT_IMPLEMENTED_FOR_CARTESIAN_SRS 在8.0.4中添加。


</br>

- 错误号：3705; 符号： ER_NOT_IMPLEMENTED_FOR_PROJECTED_SRS; SQLSTATE：22S00

报错信息格式：尚未为投影空间参考系统实现％s（％s）。

ER_NOT_IMPLEMENTED_FOR_PROJECTED_SRS 在8.0.4中添加。


</br>

- 错误号：3706; 符号： ER_NONPOSITIVE_RADIUS; SQLSTATE： 22003

报错信息格式：提供给功能％s的无效半径：半径必须大于零。

ER_NONPOSITIVE_RADIUS 在8.0.4中添加。


</br>

- 错误号：3707; 符号： ER_RESTART_SERVER_FAILED; SQLSTATE：HY000

报错信息格式：重新启动服务器失败（％s）。

ER_RESTART_SERVER_FAILED 在8.0.4中添加。


</br>

- 错误号：3708; 符号： ER_SRS_MISSING_MANDATORY_ATTRIBUTE; SQLSTATE：SR006

报错信息格式：缺少必填属性％s。

ER_SRS_MISSING_MANDATORY_ATTRIBUTE 在8.0.4中添加。


</br>

- 错误号：3709; 符号： ER_SRS_MULTIPLE_ATTRIBUTE_DEFINITIONS; SQLSTATE：SR006

报错信息格式：属性％s的多个定义。

ER_SRS_MULTIPLE_ATTRIBUTE_DEFINITIONS 在8.0.4中添加。


</br>

- 错误号：3710; 符号： ER_SRS_NAME_CANT_BE_EMPTY_OR_WHITESPACE; SQLSTATE：SR006

报错信息格式：空间参考系统名称不能为空字符串，也不能以空格开头或结尾。

ER_SRS_NAME_CANT_BE_EMPTY_OR_WHITESPACE 在8.0.4中添加。


</br>

- 错误号：3711; 符号： ER_SRS_ORGANIZATION_CANT_BE_EMPTY_OR_WHITESPACE; SQLSTATE：SR006

报错信息格式：组织名称不能为空字符串，也不能以空格开头或结尾。

ER_SRS_ORGANIZATION_CANT_BE_EMPTY_OR_WHITESPACE 在8.0.4中添加。


</br>

- 错误号：3712; 符号： ER_SRS_ID_ALREADY_EXISTS; SQLSTATE：SR004

报错信息格式：已经有一个具有SRID％u的空间参照系。

ER_SRS_ID_ALREADY_EXISTS 在8.0.4中添加。


</br>

- 错误号：3713; 符号： ER_WARN_SRS_ID_ALREADY_EXISTS; SQLSTATE：01S00

报错信息格式：已经有一个具有SRID％u的空间参照系。

ER_WARN_SRS_ID_ALREADY_EXISTS 在8.0.4中添加。


</br>

- 错误号：3714; 符号： ER_CANT_MODIFY_SRID_0; SQLSTATE： SR000

报错信息格式：SRID 0不可修改。

ER_CANT_MODIFY_SRID_0 在8.0.4中添加。


</br>

- 错误号：3715; 符号： ER_WARN_RESERVED_SRID_RANGE; SQLSTATE：01S01

报错信息格式：SRID范围[％u，％u]已保留供系统使用。

在升级过程中，可以在不发出警告的情况下添加，修改或删除此范围内的SRS。

ER_WARN_RESERVED_SRID_RANGE 在8.0.4中添加。


</br>

- 错误号：3716; 符号： ER_CANT_MODIFY_SRS_USED_BY_COLUMN; SQLSTATE：SR005

报错信息格式：无法修改SRID％u。

至少有一列取决于它。

ER_CANT_MODIFY_SRS_USED_BY_COLUMN 在8.0.4中添加。


</br>

- 错误号：3717; 符号： ER_SRS_INVALID_CHARACTER_IN_ATTRIBUTE; SQLSTATE：SR006

报错信息格式：属性％s中的无效字符。

ER_SRS_INVALID_CHARACTER_IN_ATTRIBUTE 在8.0.4中添加。


</br>

- 错误号：3718; 符号： ER_SRS_ATTRIBUTE_STRING_TOO_LONG; SQLSTATE：SR006

报错信息格式：属性％s太长。

最大长度为％u个字符。

ER_SRS_ATTRIBUTE_STRING_TOO_LONG 在8.0.4中添加。


</br>

- 错误号：3719; 符号： ER_DEPRECATED_UTF8_ALIAS; SQLSTATE：HY000

报错信息格式：'utf8'当前是字符集UTF8MB3的别名，但在将来的发行版中将成为UTF8MB4的别名。

为了明确起见，请考虑使用UTF8MB4。

ER_DEPRECATED_UTF8_ALIAS 已在8.0.11中添加。


</br>

- 错误号：3720; 符号： ER_DEPRECATED_NATIONAL; SQLSTATE： HY000

报错信息格式：NATIONAL / NCHAR / NVARCHAR表示字符集UTF8MB3，在将来的版本中将由UTF8MB4代替。

为了明确起见，请考虑使用CHAR（x）CHARACTER SET UTF8MB4。

ER_DEPRECATED_NATIONAL 已在8.0.11中添加。


</br>

- 错误号：3721; 符号： ER_INVALID_DEFAULT_UTF8MB4_COLLATION; SQLSTATE：HY000

报错信息格式：无效的默认归类％s：预期为utf8mb4_0900_ai_ci或utf8mb4_general_ci。

ER_INVALID_DEFAULT_UTF8MB4_COLLATION 已在8.0.11中添加。


</br>

- 错误号：3722; 符号： ER_UNABLE_TO_COLLECT_LOG_STATUS; SQLSTATE：HY000

报错信息格式：无法收集列'％s'的信息：％s。

ER_UNABLE_TO_COLLECT_LOG_STATUS 已在8.0.11中添加。


</br>

- 错误号：3723; 符号： ER_RESERVED_TABLESPACE_NAME; SQLSTATE：HY000

报错信息格式：表'％s'可能未在保留表空间'％s'中创建。

ER_RESERVED_TABLESPACE_NAME 已在8.0.11中添加。


</br>

- 错误号：3724; 符号： ER_UNABLE_TO_SET_OPTION; SQLSTATE： HY000

报错信息格式：无法设置此选项％s。

ER_UNABLE_TO_SET_OPTION 已在8.0.11中添加。


</br>

- 错误号：3725; 符号： ER_SLAVE_POSSIBLY_DIVERGED_AFTER_DDL; SQLSTATE：HY000

报错信息格式：对原子DDL语句的提交在主服务器和从服务器上均未成功。

从服务器支持原子DDL语句，但主服务器不支持，因此从服务器和主服务器所采取的操作可能有所不同。

在继续之前，请检查其状态是否存在差异。

ER_SLAVE_POSSIBLY_DIVERGED_AFTER_DDL 已在8.0.11中添加。


</br>

- 错误号：3726; 符号： ER_SRS_NOT_GEOGRAPHIC; SQLSTATE： 22S00

报错信息格式：功能％s仅是为地理空间参考系统定义的，但其参数之一在SRID％u中，而不是地理范围。

ER_SRS_NOT_GEOGRAPHIC 已在8.0.12中添加。


</br>

- 错误号：3727; 符号： ER_POLYGON_TOO_LARGE; SQLSTATE： 22023

报错信息格式：函数％s遇到一个太大的多边形。

多边形必须覆盖不到地球的一半。

ER_POLYGON_TOO_LARGE 已在8.0.12中添加。


</br>

- 错误号：3728; 符号： ER_SPATIAL_UNIQUE_INDEX; SQLSTATE： HY000

报错信息格式：空间索引不能是主索引或唯一索引。

ER_SPATIAL_UNIQUE_INDEX 已在8.0.12中添加。


</br>

- 错误号：3729; 符号： ER_INDEX_TYPE_NOT_SUPPORTED_FOR_SPATIAL_INDEX; SQLSTATE：HY000

报错信息格式：空间索引不支持索引类型％s。

ER_INDEX_TYPE_NOT_SUPPORTED_FOR_SPATIAL_INDEX 已在8.0.12中添加。


</br>

- 错误号：3730; 符号： ER_FK_CANNOT_DROP_PARENT; SQLSTATE：HY000

报错信息格式：无法在表'％s'上删除由外键约束'％s'引用的表'％s'。

ER_FK_CANNOT_DROP_PARENT 已在8.0.12中添加。


</br>

- 错误号：3731; 符号： ER_GEOMETRY_PARAM_LONGITUDE_OUT_OF_RANGE; SQLSTATE：22S02

报错信息格式：功能％s的参数包含经度％f超出范围的几何。

它必须在（％f，％f]之内。

ER_GEOMETRY_PARAM_LONGITUDE_OUT_OF_RANGE 已在8.0.12中添加。


</br>

- 错误号：3732; 符号： ER_GEOMETRY_PARAM_LATITUDE_OUT_OF_RANGE; SQLSTATE：22S03

报错信息格式：函数％s的参数包含纬度为％f的几何，该几何超出范围。

它必须在[％f，％f]之内。

ER_GEOMETRY_PARAM_LATITUDE_OUT_OF_RANGE 已在8.0.12中添加。


</br>

- 错误号：3733; 符号： ER_FK_CANNOT_USE_VIRTUAL_COLUMN; SQLSTATE：HY000

报错信息格式：外键'％s'使用不支持的虚拟列'％s'。

ER_FK_CANNOT_USE_VIRTUAL_COLUMN 已在8.0.12中添加。


</br>

- 错误号：3734; 符号： ER_FK_NO_COLUMN_PARENT; SQLSTATE： HY000

报错信息格式：无法添加外键约束。

在参考表'％s'中缺少约束'％s'的列'％s'
ER_FK_NO_COLUMN_PARENT 已在8.0.12中添加。


</br>

- 错误号：3735; 符号： ER_CANT_SET_ERROR_SUPPRESSION_LIST; SQLSTATE：HY000

报错信息格式：％s：无法为代码“％s”添加禁止规则。

规则集可能已满，或者代码可能不对应于错误日志消息。

ER_CANT_SET_ERROR_SUPPRESSION_LIST 已在8.0.13中添加。


</br>

- 错误号：3736; 符号： ER_SRS_GEOGCS_INVALID_AXES; SQLSTATE：SR002

报错信息格式：SRID％u的空间参考系统定义指定了无效的地理轴'％s'和'％s'。

一个轴必须是北轴或南轴，而另一个轴必须是东轴或西轴。

ER_SRS_GEOGCS_INVALID_AXES 已在8.0.13中添加。


</br>

- 错误号：3737; 符号： ER_SRS_INVALID_SEMI_MAJOR_AXIS; SQLSTATE：SR002

报错信息格式：半长轴的长度必须为正数。

ER_SRS_INVALID_SEMI_MAJOR_AXIS 已在8.0.13中添加。


</br>

- 错误号：3738; 符号： ER_SRS_INVALID_INVERSE_FLATTENING; SQLSTATE：SR002
信息：反展平度必须大于1.0，如果椭球是球体，则必须大于0.0。

ER_SRS_INVALID_INVERSE_FLATTENING 已在8.0.13中添加。


</br>

- 错误号：3739; 符号： ER_SRS_INVALID_ANGULAR_UNIT; SQLSTATE：SR002

报错信息格式：角度单位转换系数必须为正数。

ER_SRS_INVALID_ANGULAR_UNIT 已在8.0.13中添加。


</br>

- 错误号：3740; 符号： ER_SRS_INVALID_PRIME_MERIDIAN; SQLSTATE：SR002
信息：本初子午线必须在（-180，180]度内，以SRS角度单位指定。

ER_SRS_INVALID_PRIME_MERIDIAN 已在8.0.13中添加。


</br>

- 错误号：3741; 符号： ER_TRANSFORM_SOURCE_SRS_NOT_SUPPORTED; SQLSTATE：22S00

报错信息格式：不支持从SRID％u转换。

ER_TRANSFORM_SOURCE_SRS_NOT_SUPPORTED 已在8.0.13中添加。


</br>

- 错误号：3742; 符号： ER_TRANSFORM_TARGET_SRS_NOT_SUPPORTED; SQLSTATE：22S00

报错信息格式：不支持转换为SRID％u。

ER_TRANSFORM_TARGET_SRS_NOT_SUPPORTED 已在8.0.13中添加。


</br>

- 错误号：3743; 符号： ER_TRANSFORM_SOURCE_SRS_MISSING_TOWGS84; SQLSTATE：22S00

报错信息格式：不支持从SRID％u转换。

空间参照系没有TOWGS84子句。

ER_TRANSFORM_SOURCE_SRS_MISSING_TOWGS84 已在8.0.13中添加。


</br>

- 错误号：3744; 符号： ER_TRANSFORM_TARGET_SRS_MISSING_TOWGS84; SQLSTATE：22S00

报错信息格式：不支持转换为SRID％u。

空间参照系没有TOWGS84子句。

ER_TRANSFORM_TARGET_SRS_MISSING_TOWGS84 已在8.0.13中添加。


</br>

- 错误号：3745; 符号： ER_TEMP_TABLE_PREVENTS_SWITCH_SESSION_BINLOG_FORMAT; SQLSTATE：HY000

报错信息格式：当会话具有打开的临时表时，不允许更改@@ session.binlog_format。

您可以等到删除这些临时表后再试一次。

ER_TEMP_TABLE_PREVENTS_SWITCH_SESSION_BINLOG_FORMAT 已在8.0.13中添加。


</br>

- 错误号：3746; 符号： ER_TEMP_TABLE_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT; SQLSTATE：HY000

报错信息格式：当任何复制通道具有打开的临时表时，不允许更改@@ global.binlog_format或@@ persist.binlog_format。

您可以等到Slave_open_temp_tables = 0再试一次
ER_TEMP_TABLE_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT 已在8.0.13中添加。


</br>

- 错误号：3747; 符号： ER_RUNNING_APPLIER_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT; SQLSTATE：HY000

报错信息格式：任何复制通道应用程序线程正在运行时，不允许更改@@ global.binlog_format或@@ persist.binlog_format。

您可以执行STOP SLAVE SQL_THREAD，然后重试。

ER_RUNNING_APPLIER_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT 已在8.0.13中添加。


</br>

- 错误号：3748; 符号： ER_CLIENT_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRX_IN_SBR; SQLSTATE：HY000

报错信息格式：语句违反了GTID一致性：@@ session.binlog_format = STATEMENT时，不允许在事务内部或事务上下文中的过程内部创建CREATE TEMPORARY TABLE和DROP TEMPORARY TABLE。

ER_CLIENT_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRX_IN_SBR 已在8.0.13中添加。


</br>

- 错误号：3750; 符号： ER_TABLE_WITHOUT_PK; SQLSTATE： HY000

报错信息格式：设置系统变量'sql_require_primary_key'时，无法创建或更改没有主键的表。

将主键添加到表中或取消设置此变量以避免出现此消息。

请注意，没有主键的表可能会导致基于行的复制中的性能问题，因此在更改此设置之前，请咨询您的DBA。

ER_TABLE_WITHOUT_PK 已在8.0.13中添加。


</br>

- 错误号：3751; 符号： WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX; SQLSTATE：01000

报错信息格式：第％ld行的功能索引'％s'的数据被截断。

WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX 在8.0.13中新增，在8.0.16之后删除。


</br>

- 错误号：3751; 符号： ER_WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX; SQLSTATE：01000

报错信息格式：第％ld行的功能索引'％s'的数据被截断。

ER_WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX 已在8.0.17中添加。


</br>

- 错误号：3752; 符号： ER_WARN_DATA_OUT_OF_RANGE_FUNCTIONAL_INDEX; SQLSTATE：22003

报错信息格式：第％ld行的功能索引'％s'的值超出范围。

ER_WARN_DATA_OUT_OF_RANGE_FUNCTIONAL_INDEX 已在8.0.13中添加。


</br>

- 错误号：3753; 符号： ER_FUNCTIONAL_INDEX_ON_JSON_OR_GEOMETRY_FUNCTION; SQLSTATE：42000

报错信息格式：无法在返回JSON或GEOMETRY值的函数上创建函数索引。

ER_FUNCTIONAL_INDEX_ON_JSON_OR_GEOMETRY_FUNCTION 已在8.0.13中添加。


</br>

- 错误号：3754; 符号： ER_FUNCTIONAL_INDEX_REF_AUTO_INCREMENT; SQLSTATE：HY000

报错信息格式：功能索引'％s'无法引用自动增量列。

ER_FUNCTIONAL_INDEX_REF_AUTO_INCREMENT 已在8.0.13中添加。


</br>

- 错误号：3755; 符号： ER_CANNOT_DROP_COLUMN_FUNCTIONAL_INDEX; SQLSTATE：HY000

报错信息格式：无法删除列'％s'，因为它由功能索引使用。

为了删除该列，必须删除功能索引。

ER_CANNOT_DROP_COLUMN_FUNCTIONAL_INDEX 已在8.0.13中添加。


</br>

- 错误号：3756; 符号： ER_FUNCTIONAL_INDEX_PRIMARY_KEY; SQLSTATE：HY000

报错信息格式：主键不能是功能索引。

ER_FUNCTIONAL_INDEX_PRIMARY_KEY 已在8.0.13中添加。


</br>

- 错误号：3757; 符号： ER_FUNCTIONAL_INDEX_ON_LOB; SQLSTATE：HY000

报错信息格式：无法在返回BLOB或TEXT的表达式上创建函数索引。

请考虑使用CAST。

ER_FUNCTIONAL_INDEX_ON_LOB 已在8.0.13中添加。


</br>

- 错误号：3758; 符号： ER_FUNCTIONAL_INDEX_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：功能索引'％s'的表达式包含不允许的功能。

ER_FUNCTIONAL_INDEX_FUNCTION_IS_NOT_ALLOWED 已在8.0.13中添加。


</br>

- 错误号：3759; 符号： ER_FULLTEXT_FUNCTIONAL_INDEX; SQLSTATE：HY000

报错信息格式：不支持全文功能索引。

ER_FULLTEXT_FUNCTIONAL_INDEX 已在8.0.13中添加。


</br>

- 错误号：3760; 符号： ER_SPATIAL_FUNCTIONAL_INDEX; SQLSTATE：HY000

报错信息格式：不支持空间功能索引。

ER_SPATIAL_FUNCTIONAL_INDEX 已在8.0.13中添加。


</br>

- 错误号：3761; 符号： ER_WRONG_KEY_COLUMN_FUNCTIONAL_INDEX; SQLSTATE：HY000

报错信息格式：使用的存储引擎无法索引表达式'％s'。

ER_WRONG_KEY_COLUMN_FUNCTIONAL_INDEX 已在8.0.13中添加。


</br>

- 错误号：3762; 符号： ER_FUNCTIONAL_INDEX_ON_FIELD; SQLSTATE：HY000

报错信息格式：不支持列上的功能索引。

考虑改为使用常规索引。

ER_FUNCTIONAL_INDEX_ON_FIELD 已在8.0.13中添加。


</br>

- 错误号：3763; 符号： ER_GENERATED_COLUMN_NAMED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：生成的列'％s'的表达式包含不允许的函数：％s。

ER_GENERATED_COLUMN_NAMED_FUNCTION_IS_NOT_ALLOWED 已在8.0.13中添加。


</br>

- 错误号：3764; 符号： ER_GENERATED_COLUMN_ROW_VALUE; SQLSTATE：HY000

报错信息格式：生成的列'％s'的表达式不能引用行值。

ER_GENERATED_COLUMN_ROW_VALUE 已在8.0.13中添加。


</br>

- 错误号：3765; 符号： ER_GENERATED_COLUMN_VARIABLES; SQLSTATE：HY000

报错信息格式：生成的列'％s'的表达式无法引用用户或系统变量。

ER_GENERATED_COLUMN_VARIABLES 已在8.0.13中添加。


</br>

- 错误号：3766; 符号： ER_DEPENDENT_BY_DEFAULT_GENERATED_VALUE; SQLSTATE：HY000

报错信息格式：表'％s'的列'％s'具有默认值表达式依赖性，不能删除或重命名。

ER_DEPENDENT_BY_DEFAULT_GENERATED_VALUE 已在8.0.13中添加。


</br>

- 错误号：3767; 符号： ER_DEFAULT_VAL_GENERATED_NON_PRIOR; SQLSTATE：HY000

报错信息格式：列'％s'的默认值表达式不能引用其后定义的列，如果该列是生成的列或具有默认值的表达式。

ER_DEFAULT_VAL_GENERATED_NON_PRIOR 已在8.0.13中添加。


</br>

- 错误号：3768; 符号： ER_DEFAULT_VAL_GENERATED_REF_AUTO_INC; SQLSTATE：HY000

报错信息格式：列'％s'的默认值表达式不能引用自动增量列。

ER_DEFAULT_VAL_GENERATED_REF_AUTO_INC 已在8.0.13中添加。


</br>

- 错误号：3769; 符号： ER_DEFAULT_VAL_GENERATED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：列'％s'的默认值表达式包含不允许的功能。

ER_DEFAULT_VAL_GENERATED_FUNCTION_IS_NOT_ALLOWED 已在8.0.13中添加。


</br>

- 错误号：3770; 符号： ER_DEFAULT_VAL_GENERATED_NAMED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：列'％s'的默认值表达式包含一个不允许的函数：％s。

ER_DEFAULT_VAL_GENERATED_NAMED_FUNCTION_IS_NOT_ALLOWED 已在8.0.13中添加。


</br>

- 错误号：3771; 符号： ER_DEFAULT_VAL_GENERATED_ROW_VALUE; SQLSTATE：HY000

报错信息格式：列'％s'的默认值表达式不能引用行值。

ER_DEFAULT_VAL_GENERATED_ROW_VALUE 已在8.0.13中添加。


</br>

- 错误号：3772; 符号： ER_DEFAULT_VAL_GENERATED_VARIABLES; SQLSTATE：HY000

报错信息格式：列'％s'的默认值表达式无法引用用户或系统变量。

ER_DEFAULT_VAL_GENERATED_VARIABLES 已在8.0.13中添加。


</br>

- 错误号：3773; 符号： ER_DEFAULT_AS_VAL_GENERATED; SQLSTATE：HY000

报错信息格式：DEFAULT函数不能与默认值表达式一起使用。

ER_DEFAULT_AS_VAL_GENERATED 已在8.0.13中添加。


</br>

- 错误号：3774; 符号： ER_UNSUPPORTED_ACTION_ON_DEFAULT_VAL_GENERATED; SQLSTATE：HY000

报错信息格式：默认值表达式不支持'％s'。

ER_UNSUPPORTED_ACTION_ON_DEFAULT_VAL_GENERATED 已在8.0.13中添加。


</br>

- 错误号：3775; 符号： ER_GTID_UNSAFE_ALTER_ADD_COL_WITH_DEFAULT_EXPRESSION; SQLSTATE：HY000

报错信息格式：语句违反了GTID一致性：ALTER TABLE ... ADD COLUMN ..表达式为DEFAULT。

ER_GTID_UNSAFE_ALTER_ADD_COL_WITH_DEFAULT_EXPRESSION 已在8.0.13中添加。


</br>

- 错误号：3776; 符号： ER_FK_CANNOT_CHANGE_ENGINE; SQLSTATE：HY000

报错信息格式：无法更改表的存储引擎，因为该表参与了外键约束。

ER_FK_CANNOT_CHANGE_ENGINE 已在8.0.13中添加。


</br>

- 错误号：3777; 符号： ER_WARN_DEPRECATED_USER_SET_EXPR; SQLSTATE：HY000

报错信息格式：不赞成在表达式中设置用户变量，并且在以后的版本中将其删除。

考虑替代方案：“ SET变量=表达式，...”或“ SELECT表达式INTO变量”。

ER_WARN_DEPRECATED_USER_SET_EXPR 已在8.0.13中添加。


</br>

- 错误号：3778; 符号： ER_WARN_DEPRECATED_UTF8MB3_COLLATION; SQLSTATE：HY000

报错信息格式：'％s'是已弃用的字符集UTF8MB3的排序规则。

请考虑改用带有适当排序规则的UTF8MB4。

ER_WARN_DEPRECATED_UTF8MB3_COLLATION 已在8.0.13中添加。


</br>

- 错误号：3779; 符号： ER_WARN_DEPRECATED_NESTED_COMMENT_SYNTAX; SQLSTATE：HY000

报错信息格式：嵌套的注释语法已被弃用，并将在以后的版本中删除。

ER_WARN_DEPRECATED_NESTED_COMMENT_SYNTAX 已在8.0.13中添加。


</br>

- 错误号：3780; 符号： ER_FK_INCOMPATIBLE_COLUMNS; SQLSTATE：HY000

报错信息格式：外键约束'％s'中的引用列'％s'和引用列'％s'不兼容。

ER_FK_INCOMPATIBLE_COLUMNS 已在8.0.14中添加。


</br>

- 错误号：3781; 符号： ER_GR_HOLD_WAIT_TIMEOUT; SQLSTATE： HY000

报错信息格式：当新的组复制主要成员正在应用积压时，保留的语句超过了超时。

ER_GR_HOLD_WAIT_TIMEOUT 已在8.0.14中添加。


</br>

- 错误号：3782; 符号： ER_GR_HOLD_KILLED; SQLSTATE： HY000

报错信息格式：由于新组主要成员正在应用积压工作而导致组复制插件关闭或线程被杀死，保留语句中止。

ER_GR_HOLD_KILLED 已在8.0.14中添加。


</br>

- 错误号：3783; 符号： ER_GR_HOLD_MEMBER_STATUS_ERROR; SQLSTATE：HY000

报错信息格式：由于成员处于错误状态而在组复制主选举期间应用积压工作时，保留语句被中止。

ER_GR_HOLD_MEMBER_STATUS_ERROR 已在8.0.14中添加。


</br>

- 错误号：3784; 符号： ER_RPL_ENCRYPTION_FAILED_TO_FETCH_KEY; SQLSTATE：HY000

报错信息格式：无法从密钥环获取密钥，请检查是否已加载密钥环插件。

ER_RPL_ENCRYPTION_FAILED_TO_FETCH_KEY 已在8.0.14中添加。


</br>

- 错误号：3785; 符号： ER_RPL_ENCRYPTION_KEY_NOT_FOUND; SQLSTATE：HY000

报错信息格式：找不到来自密钥环的密钥，请检查服务器日志中是否成功加载并初始化了密钥环插件。

ER_RPL_ENCRYPTION_KEY_NOT_FOUND 已在8.0.14中添加。


</br>

- 错误号：3786; 符号： ER_RPL_ENCRYPTION_KEYRING_INVALID_KEY; SQLSTATE：HY000

报错信息格式：从密钥环中获取了无效的密钥。

ER_RPL_ENCRYPTION_KEYRING_INVALID_KEY 已在8.0.14中添加。


</br>

- 错误号：3787; 符号： ER_RPL_ENCRYPTION_HEADER_ERROR; SQLSTATE：HY000

报错信息格式：读取复制日志加密标头：％s时出错。

ER_RPL_ENCRYPTION_HEADER_ERROR 已在8.0.14中添加。


</br>

- 错误号：3788; 符号： ER_RPL_ENCRYPTION_FAILED_TO_ROTATE_LOGS; SQLSTATE：HY000

报错信息格式：更改二进制日志加密设置后，无法旋转某些日志。

请解决问题并手动旋转日志。

ER_RPL_ENCRYPTION_FAILED_TO_ROTATE_LOGS 已在8.0.14中添加。


</br>

- 错误号：3789; 符号： ER_RPL_ENCRYPTION_KEY_EXISTS_UNEXPECTED; SQLSTATE：HY000

报错信息格式：密钥％s存在意外。

ER_RPL_ENCRYPTION_KEY_EXISTS_UNEXPECTED 已在8.0.14中添加。


</br>

- 错误号：3790; 符号： ER_RPL_ENCRYPTION_FAILED_TO_GENERATE_KEY; SQLSTATE：HY000

报错信息格式：未能生成密钥，请检查是否已加载密钥环插件。

ER_RPL_ENCRYPTION_FAILED_TO_GENERATE_KEY 已在8.0.14中添加。


</br>

- 错误号：3791; 符号： ER_RPL_ENCRYPTION_FAILED_TO_STORE_KEY; SQLSTATE：HY000

报错信息格式：无法存储密钥，请检查是否已加载密钥环插件。

ER_RPL_ENCRYPTION_FAILED_TO_STORE_KEY 已在8.0.14中添加。


</br>

- 错误号：3792; 符号： ER_RPL_ENCRYPTION_FAILED_TO_REMOVE_KEY; SQLSTATE：HY000

报错信息格式：未能删除密钥，请检查是否已加载密钥环插件。

ER_RPL_ENCRYPTION_FAILED_TO_REMOVE_KEY 已在8.0.14中添加。


</br>

- 错误号：3793; 符号： ER_RPL_ENCRYPTION_UNABLE_TO_CHANGE_OPTION; SQLSTATE：HY000

报错信息格式：无法更改binlog_encryption值。

％s。

ER_RPL_ENCRYPTION_UNABLE_TO_CHANGE_OPTION 已在8.0.14中添加。


</br>

- 错误号：3794; 符号： ER_RPL_ENCRYPTION_MASTER_KEY_RECOVERY_FAILED; SQLSTATE：HY000

报错信息格式：无法恢复Binlog加密主密钥，请检查是否已加载密钥环插件。

ER_RPL_ENCRYPTION_MASTER_KEY_RECOVERY_FAILED 已在8.0.14中添加。


</br>

- 错误号：3795; 符号： ER_SLOW_LOG_MODE_IGNORED_WHEN_NOT_LOGGING_TO_FILE; SQLSTATE：HY000

报错信息格式：慢速查询日志文件格式已按要求更改，但是当未实际登录到文件时，该设置将无效。

ER_SLOW_LOG_MODE_IGNORED_WHEN_NOT_LOGGING_TO_FILE 已在8.0.14中添加。


</br>

- 错误号：3796; 符号： ER_GRP_TRX_CONSISTENCY_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：选项group_replication_consistency不能在当前成员状态下使用。

ER_GRP_TRX_CONSISTENCY_NOT_ALLOWED 已在8.0.14中添加。


</br>

- 错误号：3797; 符号： ER_GRP_TRX_CONSISTENCY_BEFORE; SQLSTATE：HY000

报错信息格式：在group_replication_consistency ='BEFORE'上等待组事务提交时出错。

ER_GRP_TRX_CONSISTENCY_BEFORE 已在8.0.14中添加。


</br>

- 错误号：3798; 符号： ER_GRP_TRX_CONSISTENCY_AFTER_ON_TRX_BEGIN; SQLSTATE：HY000

报错信息格式：等待具有group_replication_consistency ='AFTER'的事务提交时出错。

ER_GRP_TRX_CONSISTENCY_AFTER_ON_TRX_BEGIN 已在8.0.14中添加。


</br>

- 错误号：3799; 符号： ER_GRP_TRX_CONSISTENCY_BEGIN_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：Group Replication插件正在停止，因此不允许启动新事务。

ER_GRP_TRX_CONSISTENCY_BEGIN_NOT_ALLOWED 已在8.0.14中添加。


</br>

- 错误号：3800; 符号： ER_FUNCTIONAL_INDEX_ROW_VALUE_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：功能索引'％s'的表达式不能引用行值。

ER_FUNCTIONAL_INDEX_ROW_VALUE_IS_NOT_ALLOWED 已在8.0.14中添加。


</br>

- 错误号：3801; 符号： ER_RPL_ENCRYPTION_FAILED_TO_ENCRYPT; SQLSTATE：HY000

报错信息格式：未能加密内容以写入二进制日志文件：％s。

ER_RPL_ENCRYPTION_FAILED_TO_ENCRYPT 已在8.0.14中添加。


</br>

- 错误号：3802; 符号： ER_PAGE_TRACKING_NOT_STARTED; SQLSTATE：HY000

报错信息格式：页面跟踪尚未开始。

ER_PAGE_TRACKING_NOT_STARTED 已在8.0.16中添加。


</br>

- 错误号：3803; 符号： ER_PAGE_TRACKING_RANGE_NOT_TRACKED; SQLSTATE：HY000

报错信息格式：未为指定的LSN范围启用跟踪。

ER_PAGE_TRACKING_RANGE_NOT_TRACKED 已在8.0.16中添加。


</br>

- 错误号：3804; 符号： ER_PAGE_TRACKING_CANNOT_PURGE; SQLSTATE：HY000

报错信息格式：正在进行并发克隆时，无法清除数据。

等会再试。

ER_PAGE_TRACKING_CANNOT_PURGE 已在8.0.16中添加。


</br>

- 错误号：3805; 符号： ER_RPL_ENCRYPTION_CANNOT_ROTATE_BINLOG_MASTER_KEY; SQLSTATE：HY000

报错信息格式：关闭“ binlog加密”时，无法旋转二进制日志主密钥。

ER_RPL_ENCRYPTION_CANNOT_ROTATE_BINLOG_MASTER_KEY 已在8.0.16中添加。


</br>

- 错误号：3806; 符号： ER_BINLOG_MASTER_KEY_RECOVERY_OUT_OF_COMBINATION; SQLSTATE：HY000

报错信息格式：无法恢复二进制日志主密钥，new_master_key_seqno =％u，master_key_seqno =％u和old_master_key_seqno =％u的组合是错误的。

ER_BINLOG_MASTER_KEY_RECOVERY_OUT_OF_COMBINATION 已在8.0.16中添加。


</br>

- 错误号：3807; 符号： ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_OPERATE_KEY; SQLSTATE：HY000

报错信息格式：无法在密钥环上操作二进制日志主密钥，请检查是否已加载密钥环插件。

该语句无效：旧的二进制日志主密钥仍在使用，密钥环，二进制和中继日志文件未更改，服务器无法开始使用新的二进制日志主密钥对新的二进制和中继日志文件进行加密。

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_OPERATE_KEY 已在8.0.16中添加。


</br>

- 错误号：3808; 符号： ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_ROTATE_LOGS; SQLSTATE：HY000

报错信息格式：无法旋转一个或多个二进制或中继日志文件。

生成了一个新的二进制日志主密钥，该密钥将用于加密新的二进制和中继日志文件。

使用先前的二进制日志主密钥，仍可能存在二进制或中继日志文件。

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_ROTATE_LOGS 已在8.0.16中添加。


</br>

- 错误号：3809; 符号： ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_REENCRYPT_LOG; SQLSTATE：HY000
报错信息格式：％s。

生成了一个新的二进制日志主密钥，该密钥将用于加密新的二进制和中继日志文件。

使用先前的二进制日志主密钥，仍可能存在二进制或中继日志文件。

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_REENCRYPT_LOG 已在8.0.16中添加。


</br>

- 错误号：3810; 符号： ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_UNUSED_KEYS; SQLSTATE：HY000

报错信息格式：无法从密钥环中删除未使用的二进制日志加密密钥，请检查是否已加载密钥环插件。

未使用的二进制日志加密密钥可能仍存在于密钥环中，并且在服务器重新启动或下次执行“ ALTER INSTANCE ROTATE BINLOG MASTER KEY”时将其删除。

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_UNUSED_KEYS 已在8.0.16中添加。


</br>

- 错误号：3811; 符号： ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_AUX_KEY; SQLSTATE：HY000

报错信息格式：无法从密钥环中删除辅助二进制日志加密密钥，请检查是否已加载密钥环插件。

二进制日志主密钥轮换过程的清理未按预期完成，并且清理将在服务器重新启动或下一次执行“ ALTER INSTANCE ROTATE BINLOG MASTER KEY”时进行。

ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_AUX_KEY 已在8.0.16中添加。


</br>

- 错误号：3812; 符号： ER_NON_BOOLEAN_EXPR_FOR_CHECK_CONSTRAINT; SQLSTATE：HY000

报错信息格式：为检查约束'％s'指定的非布尔类型的表达式。

ER_NON_BOOLEAN_EXPR_FOR_CHECK_CONSTRAINT 已在8.0.16中添加。


</br>

- 错误号：3813; 符号： ER_COLUMN_CHECK_CONSTRAINT_REFERENCES_OTHER_COLUMN; SQLSTATE：HY000

报错信息格式：列检查约束'％s'引用其他列。

ER_COLUMN_CHECK_CONSTRAINT_REFERENCES_OTHER_COLUMN 已在8.0.16中添加。


</br>

- 错误号：3814; 符号： ER_CHECK_CONSTRAINT_NAMED_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：检查约束'％s'的表达式包含不允许的功能：％s。

ER_CHECK_CONSTRAINT_NAMED_FUNCTION_IS_NOT_ALLOWED 已在8.0.16中添加。


</br>

- 错误号：3815; 符号： ER_CHECK_CONSTRAINT_FUNCTION_IS_NOT_ALLOWED; SQLSTATE：HY000

报错信息格式：检查约束'％s'的表达式包含不允许的功能。

ER_CHECK_CONSTRAINT_FUNCTION_IS_NOT_ALLOWED 已在8.0.16中添加。


</br>

- 错误号：3816; 符号： ER_CHECK_CONSTRAINT_VARIABLES; SQLSTATE：HY000

报错信息格式：检查约束'％s'的表达式不能引用用户或系统变量。

ER_CHECK_CONSTRAINT_VARIABLES 已在8.0.16中添加。


</br>

- 错误号：3817; 符号： ER_CHECK_CONSTRAINT_ROW_VALUE; SQLSTATE：HY000

报错信息格式：检查约束'％s'无法引用行值。

ER_CHECK_CONSTRAINT_ROW_VALUE 已在8.0.16中添加。


</br>

- 错误号：3818; 符号： ER_CHECK_CONSTRAINT_REFERS_AUTO_INCREMENT_COLUMN; SQLSTATE：HY000

报错信息格式：检查约束'％s'无法引用自动增量列。

ER_CHECK_CONSTRAINT_REFERS_AUTO_INCREMENT_COLUMN 已在8.0.16中添加。


</br>

- 错误号：3819; 符号： ER_CHECK_CONSTRAINT_VIOLATED; SQLSTATE：HY000

报错信息格式：检查约束'％s'被违反。

ER_CHECK_CONSTRAINT_VIOLATED 已在8.0.16中添加。


</br>

- 错误号：3820; 符号： ER_CHECK_CONSTRAINT_REFERS_UNKNOWN_COLUMN; SQLSTATE：HY000

报错信息格式：检查约束'％s'指向不存在的列'％s'。

ER_CHECK_CONSTRAINT_REFERS_UNKNOWN_COLUMN 已在8.0.16中添加。


</br>

- 错误号：3821; 符号： ER_CHECK_CONSTRAINT_NOT_FOUND; SQLSTATE：HY000

报错信息格式：在表中找不到检查约束'％s'。

ER_CHECK_CONSTRAINT_NOT_FOUND 已在8.0.16中添加。


</br>

- 错误号：3822; 符号： ER_CHECK_CONSTRAINT_DUP_NAME; SQLSTATE：HY000

报错信息格式：重复的检查约束名称'％s'。

ER_CHECK_CONSTRAINT_DUP_NAME 已在8.0.16中添加。


</br>

- 错误号：3823; 符号： ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN; SQLSTATE：HY000

报错信息格式：列'％s'不能在检查约束'％s'中使用：在外键约束'％s'引用操作中需要。

ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN 已在8.0.16中添加。


</br>

- 错误号：3824; 符号： WARN_UNENCRYPTED_TABLE_IN_ENCRYPTED_DB; SQLSTATE：HY000

报错信息格式：在启用了默认加密的数据库中创建未加密的表。

WARN_UNENCRYPTED_TABLE_IN_ENCRYPTED_DB 已在8.0.16中添加。


</br>

- 错误号：3825; 符号： ER_INVALID_ENCRYPTION_REQUEST; SQLSTATE：HY000

报错信息格式：请求使用％s表空间创建％s表。

ER_INVALID_ENCRYPTION_REQUEST 已在8.0.16中添加。


</br>

- 错误号：3826; 符号： ER_CANNOT_SET_TABLE_ENCRYPTION; SQLSTATE：HY000

报错信息格式：表加密与其数据库默认加密不同，并且用户没有足够的特权。

ER_CANNOT_SET_TABLE_ENCRYPTION 已在8.0.16中添加。


</br>

- 错误号：3827; 符号： ER_CANNOT_SET_DATABASE_ENCRYPTION; SQLSTATE：HY000

报错信息格式：数据库默认加密不同于“ default_table_encryption”设置，并且用户没有足够的特权。

ER_CANNOT_SET_DATABASE_ENCRYPTION 已在8.0.16中添加。


</br>

- 错误号：3828; 符号： ER_CANNOT_SET_TABLESPACE_ENCRYPTION; SQLSTATE：HY000

报错信息格式：表空间加密与“ default_table_encryption”设置不同，并且用户没有足够的特权。

ER_CANNOT_SET_TABLESPACE_ENCRYPTION 已在8.0.16中添加。


</br>

- 错误号：3829; 符号： ER_TABLESPACE_CANNOT_BE_ENCRYPTED; SQLSTATE：HY000

报错信息格式：无法加密该表空间，因为表的模式之一已将默认加密设置为OFF，并且用户没有足够的特权。

ER_TABLESPACE_CANNOT_BE_ENCRYPTED 已在8.0.16中添加。


</br>

- 错误号：3830; 符号： ER_TABLESPACE_CANNOT_BE_DECRYPTED; SQLSTATE：HY000

报错信息格式：无法解密该表空间，因为表的模式之一已将默认加密设置为ON，并且用户没有足够的特权。

ER_TABLESPACE_CANNOT_BE_DECRYPTED 已在8.0.16中添加。


</br>

- 错误号：3831; 符号： ER_TABLESPACE_TYPE_UNKNOWN; SQLSTATE：HY000

报错信息格式：无法确定名为'％s'的表空间的类型。

ER_TABLESPACE_TYPE_UNKNOWN 已在8.0.16中添加。


</br>

- 错误号：3832; 符号： ER_TARGET_TABLESPACE_UNENCRYPTED; SQLSTATE：HY000

报错信息格式：源表空间已加密，但目标表空间未加密。

ER_TARGET_TABLESPACE_UNENCRYPTED 已在8.0.16中添加。


</br>

- 错误号：3833; 符号： ER_CANNOT_USE_ENCRYPTION_CLAUSE; SQLSTATE：HY000

报错信息格式：ENCRYPTION子句对于％s表空间无效。

ER_CANNOT_USE_ENCRYPTION_CLAUSE 已在8.0.16中添加。


</br>

- 错误号：3834; 符号： ER_INVALID_MULTIPLE_CLAUSES; SQLSTATE：HY000

报错信息格式：多个％s子句。

ER_INVALID_MULTIPLE_CLAUSES 已在8.0.16中添加。


</br>

- 错误号：3835; 符号： ER_UNSUPPORTED_USE_OF_GRANT_AS; SQLSTATE：HY000

报错信息格式：GRANT ... AS仅当前受全局特权支持。

ER_UNSUPPORTED_USE_OF_GRANT_AS 已在8.0.16中添加。


</br>

- 错误号：3836; 符号： ER_UKNOWN_AUTH_ID_OR_ACCESS_DENIED_FOR_GRANT_AS; SQLSTATE：HY000

报错信息格式：AS子句中的某些授权ID无效或当前用户缺乏执行该语句的特权。

ER_UKNOWN_AUTH_ID_OR_ACCESS_DENIED_FOR_GRANT_AS 已在8.0.16中添加。


</br>

- 错误号：3837; 符号： ER_DEPENDENT_BY_FUNCTIONAL_INDEX; SQLSTATE：HY000

报错信息格式：列'％s'具有功能索引依赖性，不能删除或重命名。

ER_DEPENDENT_BY_FUNCTIONAL_INDEX 已在8.0.17中添加。


</br>

- 错误号：3838; 符号： ER_PLUGIN_NOT_EARLY; SQLSTATE： HY000

报错信息格式：插件'％s'不能用作“早期”插件。

不要将其添加到--early-plugin-load，keyring迁移等中。

ER_PLUGIN_NOT_EARLY 已在8.0.17中添加。


</br>

- 错误号：3839; 符号： ER_INNODB_REDO_LOG_ARCHIVE_START_SUBDIR_PATH; SQLSTATE：HY000

报错信息格式：重做日志归档开始禁止在“ subdir”参数中使用路径名。

ER_INNODB_REDO_LOG_ARCHIVE_START_SUBDIR_PATH 已在8.0.17中添加。


</br>

- 错误号：3840; 符号： ER_INNODB_REDO_LOG_ARCHIVE_START_TIMEOUT; SQLSTATE：HY000

报错信息格式：重做日志归档开始超时。

ER_INNODB_REDO_LOG_ARCHIVE_START_TIMEOUT 已在8.0.17中添加。


</br>

- 错误号：3841; 符号： ER_INNODB_REDO_LOG_ARCHIVE_DIRS_INVALID; SQLSTATE：HY000

报错信息格式：服务器变量“ innodb_redo_log_archive_dirs”为NULL或为空。

ER_INNODB_REDO_LOG_ARCHIVE_DIRS_INVALID 已在8.0.17中添加。


</br>

- 错误号：3842; 符号： ER_INNODB_REDO_LOG_ARCHIVE_LABEL_NOT_FOUND; SQLSTATE：HY000

报错信息格式：在服务器变量“ innodb_redo_log_archive_dirs”中找不到标签“％s”。

ER_INNODB_REDO_LOG_ARCHIVE_LABEL_NOT_FOUND 已在8.0.17中添加。


</br>

- 错误号：3843; 符号： ER_INNODB_REDO_LOG_ARCHIVE_DIR_EMPTY; SQLSTATE：HY000

报错信息格式：服务器变量“ innodb_redo_log_archive_dirs”中的标签“％s”后目录为空。

ER_INNODB_REDO_LOG_ARCHIVE_DIR_EMPTY 已在8.0.17中添加。


</br>

- 错误号：3844; 符号： ER_INNODB_REDO_LOG_ARCHIVE_NO_SUCH_DIR; SQLSTATE：HY000

报错信息格式：重做日志归档目录'％s'不存在或不是目录。

ER_INNODB_REDO_LOG_ARCHIVE_NO_SUCH_DIR 已在8.0.17中添加。


</br>

- 错误号：3845; 符号： ER_INNODB_REDO_LOG_ARCHIVE_DIR_CLASH; SQLSTATE：HY000

报错信息格式：重做日志归档目录'％s'在服务器目录'％s'中，之下或上方-'％s'。

ER_INNODB_REDO_LOG_ARCHIVE_DIR_CLASH 已在8.0.17中添加。


</br>

- 错误号：3846; 符号： ER_INNODB_REDO_LOG_ARCHIVE_DIR_PERMISSIONS; SQLSTATE：HY000

报错信息格式：所有操作系统用户均可访问重做日志归档目录'％s'。

ER_INNODB_REDO_LOG_ARCHIVE_DIR_PERMISSIONS 已在8.0.17中添加。


</br>

- 错误号：3847; 符号： ER_INNODB_REDO_LOG_ARCHIVE_FILE_CREATE; SQLSTATE：HY000

报错信息格式：无法创建重做日志归档文件'％s'（操作系统错误号：％d-％s）。

ER_INNODB_REDO_LOG_ARCHIVE_FILE_CREATE 已在8.0.17中添加。


</br>

- 错误号：3848; 符号： ER_INNODB_REDO_LOG_ARCHIVE_ACTIVE; SQLSTATE：HY000

报错信息格式：已在'％s'上开始重做日志归档-首先调用innodb_redo_log_archive_stop（）。

ER_INNODB_REDO_LOG_ARCHIVE_ACTIVE 已在8.0.17中添加。


</br>

- 错误号：3849; 符号： ER_INNODB_REDO_LOG_ARCHIVE_INACTIVE; SQLSTATE：HY000

报错信息格式：重做日志归档未激活。

ER_INNODB_REDO_LOG_ARCHIVE_INACTIVE 已在8.0.17中添加。


</br>

- 错误号：3850; 符号： ER_INNODB_REDO_LOG_ARCHIVE_FAILED; SQLSTATE：HY000

报错信息格式：重做日志归档失败：％s。

ER_INNODB_REDO_LOG_ARCHIVE_FAILED 已在8.0.17中添加。


</br>

- 错误号：3851; 符号： ER_INNODB_REDO_LOG_ARCHIVE_SESSION; SQLSTATE：HY000

报错信息格式：此会话尚未启动重做日志归档。

ER_INNODB_REDO_LOG_ARCHIVE_SESSION 已在8.0.17中添加。


</br>

- 错误号：3852; 符号： ER_STD_REGEX_ERROR; SQLSTATE： HY000

报错信息格式：正则表达式错误：函数％s中的％s。

ER_STD_REGEX_ERROR 已在8.0.17中添加。


</br>

- 错误号：3853; 符号： ER_INVALID_JSON_TYPE; SQLSTATE： 22032

报错信息格式：函数％s的参数％u中的JSON类型无效；需要一个％s。

ER_INVALID_JSON_TYPE 已在8.0.17中添加。


</br>

- 错误号：3854; 符号： ER_CANNOT_CONVERT_STRING; SQLSTATE：HY000

报错信息格式：无法将字符串'％s'从％s转换为％s。

ER_CANNOT_CONVERT_STRING 已在8.0.17中添加。


</br>

- 错误号：3855; 符号： ER_DEPENDENT_BY_PARTITION_FUNC; SQLSTATE：HY000

报错信息格式：列'％s'具有分区功能依赖性，不能删除或重命名。

ER_DEPENDENT_BY_PARTITION_FUNC 已在8.0.17中添加。


</br>

- 错误号：3856; 符号： ER_WARN_DEPRECATED_FLOAT_AUTO_INCREMENT; SQLSTATE：HY000

报错信息格式：不建议使用FLOAT / DOUBLE列的AUTO_INCREMENT支持，并将在以后的版本中删除。

考虑从“％s”列中删除AUTO_INCREMENT。

ER_WARN_DEPRECATED_FLOAT_AUTO_INCREMENT 已在8.0.17中添加。


</br>

- 错误号：3857; 符号： ER_RPL_CANT_STOP_SLAVE_WHILE_LOCKED_BACKUP; SQLSTATE：HY000

报错信息格式：实例被锁定备份时无法停止从SQL线程。

尝试先运行UNLOCK INSTANCE。

ER_RPL_CANT_STOP_SLAVE_WHILE_LOCKED_BACKUP 已在8.0.17中添加。


</br>

- 错误号：3858; 符号： ER_WARN_DEPRECATED_FLOAT_DIGITS; SQLSTATE：HY000

报错信息格式：不建议为浮点数据类型指定数字位数，并且在以后的版本中将删除该位数。

ER_WARN_DEPRECATED_FLOAT_DIGITS 已在8.0.17中添加。


</br>

- 错误号：3859; 符号： ER_WARN_DEPRECATED_FLOAT_UNSIGNED; SQLSTATE：HY000

报错信息格式：不赞成使用十进制和浮点数据类型的UNSIGNED，并且在将来的发行版中将删除对它的支持。

ER_WARN_DEPRECATED_FLOAT_UNSIGNED 已在8.0.17中添加。


</br>

- 错误号：3860; 符号： ER_WARN_DEPRECATED_INTEGER_DISPLAY_WIDTH; SQLSTATE：HY000

报错信息格式：整数显示宽度已弃用，在以后的版本中将被删除。

ER_WARN_DEPRECATED_INTEGER_DISPLAY_WIDTH 已在8.0.17中添加。


</br>

- 错误号：3861; 符号： ER_WARN_DEPRECATED_ZEROFILL; SQLSTATE：HY000

报错信息格式：不建议使用ZEROFILL属性，并将在以后的版本中将其删除。

使用LPAD函数将数字零填充，或将格式化的数字存储在CHAR列中。

ER_WARN_DEPRECATED_ZEROFILL 已在8.0.17中添加。


</br>

- 错误号：3862; 符号： ER_CLONE_DONOR; SQLSTATE： HY000

报错信息格式：克隆供体错误：％s。

ER_CLONE_DONOR 已在8.0.17中添加。


</br>

- 错误号：3863; 符号： ER_CLONE_PROTOCOL; SQLSTATE： HY000

报错信息格式：克隆收到来自捐助方％s的意外响应。

ER_CLONE_PROTOCOL 已在8.0.17中添加。


</br>

- 错误号：3864; 符号： ER_CLONE_DONOR_VERSION; SQLSTATE： HY000

报错信息格式：克隆供体MySQL版本：％s与收件人MySQL版本％s不同。

ER_CLONE_DONOR_VERSION 已在8.0.17中添加。


</br>

- 错误号：3865; 符号： ER_CLONE_OS; SQLSTATE： HY000

报错信息格式：克隆供体OS：％s与收件人OS：％s不同。

ER_CLONE_OS 已在8.0.17中添加。


</br>

- 错误号：3866; 符号： ER_CLONE_PLATFORM; SQLSTATE： HY000

报错信息格式：克隆供体平台：％s与收件人平台：％s不同。

ER_CLONE_PLATFORM 已在8.0.17中添加。


</br>

- 错误号：3867; 符号： ER_CLONE_CHARSET; SQLSTATE： HY000

报错信息格式：克隆供体排序规则：％s在收件人中不可用。

ER_CLONE_CHARSET 已在8.0.17中添加。


</br>

- 错误号：3868; 符号： ER_CLONE_CONFIG; SQLSTATE： HY000

报错信息格式：克隆配置％s：施主值：％s与收件人值：％s不同。

ER_CLONE_CONFIG 已在8.0.17中添加。


</br>

- 错误号：3869; 符号： ER_CLONE_SYS_CONFIG; SQLSTATE： HY000

报错信息格式：克隆系统配置：％s。

ER_CLONE_SYS_CONFIG 已在8.0.17中添加。


</br>

- 错误号：3870; 符号： ER_CLONE_PLUGIN_MATCH; SQLSTATE： HY000

报错信息格式：克隆捐赠者插件％s在收件人中未激活。

ER_CLONE_PLUGIN_MATCH 已在8.0.17中添加。


</br>

- 错误号：3871; 符号： ER_CLONE_LOOPBACK; SQLSTATE： HY000

报错信息格式：克隆到当前数据目录时，克隆无法使用回送连接。

ER_CLONE_LOOPBACK 已在8.0.17中添加。


</br>

- 错误号：3872; 符号： ER_CLONE_ENCRYPTION; SQLSTATE： HY000

报错信息格式：克隆需要用于加密表的SSL连接。

ER_CLONE_ENCRYPTION 已在8.0.17中添加。


</br>

- 错误号：3873; 符号： ER_CLONE_DISK_SPACE; SQLSTATE： HY000

报错信息格式：克隆估计的数据库大小为％s。

可用空间％s不够。

ER_CLONE_DISK_SPACE 已在8.0.17中添加。


</br>

- 错误号：3874; 符号： ER_CLONE_IN_PROGRESS; SQLSTATE： HY000

报错信息格式：正在进行并行克隆。

克隆完成后，请尝试。

ER_CLONE_IN_PROGRESS 已在8.0.17中添加。


</br>

- 错误号：3875; 符号： ER_CLONE_DISALLOWED; SQLSTATE： HY000

报错信息格式：％s时无法执行克隆操作。

ER_CLONE_DISALLOWED 已在8.0.17中添加。


</br>

- 错误号：3876; 符号： ER_CANNOT_GRANT_ROLES_TO_ANONYMOUS_USER; SQLSTATE：HY000

报错信息格式：无法将角色授予匿名用户。

ER_CANNOT_GRANT_ROLES_TO_ANONYMOUS_USER 已在8.0.16中添加。


</br>

- 错误号：3877; 符号： ER_SECONDARY_ENGINE_PLUGIN; SQLSTATE：HY000
报错信息格式：％s。

ER_SECONDARY_ENGINE_PLUGIN 已在8.0.14中添加。


</br>

- 错误号：3878; 符号： ER_SECOND_PASSWORD_CANNOT_BE_EMPTY; SQLSTATE：HY000

报错信息格式：空密码无法保留为用户'％s'@'％s'的第二个密码。

ER_SECOND_PASSWORD_CANNOT_BE_EMPTY 已在8.0.14中添加。


</br>

- 错误号：3879; 符号： ER_DB_ACCESS_DENIED; SQLSTATE： HY000

报错信息格式：拒绝对数据库'％s'的AuthId'％s @％s`的访问。

ER_DB_ACCESS_DENIED 已在8.0.16中添加。


</br>

- 错误号：3880; 符号： ER_DA_AUTH_ID_WITH_SYSTEM_USER_PRIV_IN_MANDATORY_ROLES; SQLSTATE：HY000

报错信息格式：无法设置必需的角色：AuthId％s @％s具有'％s'特权。

ER_DA_AUTH_ID_WITH_SYSTEM_USER_PRIV_IN_MANDATORY_ROLES 已在8.0.17中添加。


</br>

- 错误号：3881; 符号： ER_DA_RPL_GTID_TABLE_CANNOT_OPEN; SQLSTATE：HY000

报错信息格式：Gtid表尚未准备好使用。

表'％s。

％s'无法打开。

ER_DA_RPL_GTID_TABLE_CANNOT_OPEN 已在8.0.17中添加。


</br>

- 错误号：3882; 符号： ER_GEOMETRY_IN_UNKNOWN_LENGTH_UNIT; SQLSTATE：SU001

报错信息格式：传递给函数％s的几何位于SRID 0中，该ID未指定长度单位。

无法转换为“％s”。

ER_GEOMETRY_IN_UNKNOWN_LENGTH_UNIT 已在8.0.14中添加。


</br>

- 错误号：3883; 符号： ER_DA_PLUGIN_INSTALL_ERROR; SQLSTATE：HY000

报错信息格式：安装插件'％s'时出错：％s。

ER_DA_PLUGIN_INSTALL_ERROR 已在8.0.17中添加。


</br>

- 错误号：3884; 符号： ER_NO_SESSION_TEMP; SQLSTATE： HY000

报错信息格式：存储引擎无法为此会话分配临时表空间。

ER_NO_SESSION_TEMP 已在8.0.13中添加。


</br>

- 错误号：3885; 符号： ER_DA_UNKNOWN_ERROR_NUMBER; SQLSTATE：HY000

报错信息格式：出现未知错误：％d。

ER_DA_UNKNOWN_ERROR_NUMBER 已在8.0.17中添加。


</br>

- 错误号：3886; 符号： ER_COLUMN_CHANGE_SIZE; SQLSTATE： HY000

报错信息格式：无法更改表'％s'的列'％s'。

索引'％s'的结果大小将超过％d个字节的最大密钥长度。

ER_COLUMN_CHANGE_SIZE 已在8.0.14中添加。


</br>

- 错误号：3887; 符号： ER_REGEXP_INVALID_CAPTURE_GROUP_NAME; SQLSTATE：HY000

报错信息格式：捕获组的名称无效。

ER_REGEXP_INVALID_CAPTURE_GROUP_NAME 已在8.0.11中添加。


</br>

- 错误号：3888; 符号： ER_DA_SSL_LIBRARY_ERROR; SQLSTATE： HY000

报错信息格式：由于以下SSL库错误而无法设置SSL：％s。

ER_DA_SSL_LIBRARY_ERROR 已在8.0.17中添加。


</br>

- 错误号：3889; 符号： ER_SECONDARY_ENGINE; SQLSTATE： HY000

报错信息格式：辅助引擎操作失败。

％s。

ER_SECONDARY_ENGINE 已在8.0.13中添加。


</br>

- 错误号：3890; 符号： ER_SECONDARY_ENGINE_DDL; SQLSTATE： HY000

报错信息格式：不允许在已定义辅助引擎的表上使用DDL。

ER_SECONDARY_ENGINE_DDL 已在8.0.13中添加。


</br>

- 错误号：3891; 符号： ER_INCORRECT_CURRENT_PASSWORD; SQLSTATE：HY000

报错信息格式：当前密码不正确。

指定必须替换的正确密码。

ER_INCORRECT_CURRENT_PASSWORD 已在8.0.13中添加。


</br>

- 错误号：3892; 符号： ER_MISSING_CURRENT_PASSWORD; SQLSTATE：HY000

报错信息格式：需要在REPLACE子句中指定当前密码才能进行更改。

ER_MISSING_CURRENT_PASSWORD 已在8.0.13中添加。


</br>

- 错误号：3893; 符号： ER_CURRENT_PASSWORD_NOT_REQUIRED; SQLSTATE：HY000

报错信息格式：在为其他用户更改当前密码时，请不要指定当前密码。

ER_CURRENT_PASSWORD_NOT_REQUIRED 已在8.0.13中添加。


</br>

- 错误号：3894; 符号： ER_PASSWORD_CANNOT_BE_RETAINED_ON_PLUGIN_CHANGE; SQLSTATE：HY000

报错信息格式：无法更改用户'％s'@'％s'的当前密码，因为正在更改身份验证插件。

ER_PASSWORD_CANNOT_BE_RETAINED_ON_PLUGIN_CHANGE 已在8.0.14中添加。


</br>

- 错误号：3895; 符号： ER_CURRENT_PASSWORD_CANNOT_BE_RETAINED; SQLSTATE：HY000

报错信息格式：无法保留用户'％s'@'％s'的当前密码，因为新密码为空。

ER_CURRENT_PASSWORD_CANNOT_BE_RETAINED 已在8.0.14中添加。


</br>

- 错误号：3896; 符号： ER_PARTIAL_REVOKES_EXIST; SQLSTATE：HY000

报错信息格式：数据库上至少存在部分撤销。

系统变量'@@ partial_revokes'必须设置为ON。

ER_PARTIAL_REVOKES_EXIST 已在8.0.16中添加。


</br>

- 错误号：3897; 符号： ER_CANNOT_GRANT_SYSTEM_PRIV_TO_MANDATORY_ROLE; SQLSTATE：HY000

报错信息格式：将AuthId％s @％s设置为required_roles。

无法授予'％s'特权。

ER_CANNOT_GRANT_SYSTEM_PRIV_TO_MANDATORY_ROLE 已在8.0.16中添加。


</br>

- 错误号：3898; 符号： ER_XA_REPLICATION_FILTERS; SQLSTATE：HY000

报错信息格式：不支持将复制筛选器与XA事务一起使用，并且可能导致复制从属服务器处于未定义状态。

ER_XA_REPLICATION_FILTERS 已在8.0.12中添加。


</br>

- 错误号：3899; 符号： ER_UNSUPPORTED_SQL_MODE; SQLSTATE： HY000

报错信息格式：不支持sql_mode = 0x％08x。

ER_UNSUPPORTED_SQL_MODE 已在8.0.11中添加。


</br>

- 错误号：3900; 符号： ER_REGEXP_INVALID_FLAG; SQLSTATE： HY000

报错信息格式：正则表达式中的无效匹配模式标志。

ER_REGEXP_INVALID_FLAG 已在8.0.12中添加。


</br>

- 错误号：3901; 符号： ER_PARTIAL_REVOKE_AND_DB_GRANT_BOTH_EXISTS; SQLSTATE：HY000

报错信息格式：数据库'％s'的'％s'特权同时作为部分撤销和mysql.db存在。

这可能意味着“ mysql”模式已损坏。

ER_PARTIAL_REVOKE_AND_DB_GRANT_BOTH_EXISTS 已在8.0.16中添加。


</br>

- 错误号：3902; 符号： ER_UNIT_NOT_FOUND; SQLSTATE： SU001

报错信息格式：没有名为“％s”的计量单位。

ER_UNIT_NOT_FOUND 已在8.0.14中添加。


</br>

- 错误号：3903; 符号： ER_INVALID_JSON_VALUE_FOR_FUNC_INDEX; SQLSTATE：22018

报错信息格式：CAST的功能索引'％s'的JSON值无效。

ER_INVALID_JSON_VALUE_FOR_FUNC_INDEX 已在8.0.16中添加。


</br>

- 错误号：3904; 符号： ER_JSON_VALUE_OUT_OF_RANGE_FOR_FUNC_INDEX; SQLSTATE：22003

报错信息格式：功能索引'％s'的CAST超出范围JSON值。

ER_JSON_VALUE_OUT_OF_RANGE_FOR_FUNC_INDEX 已在8.0.16中添加。


</br>

- 错误号：3905; 符号： ER_EXCEEDED_MV_KEYS_NUM; SQLSTATE： HY000

报错信息格式：多记录索引'％s'的每条记录的最大数值超出％u值。

ER_EXCEEDED_MV_KEYS_NUM 已在8.0.16中添加。


</br>

- 错误号：3906; 符号： ER_EXCEEDED_MV_KEYS_SPACE; SQLSTATE：HY000

报错信息格式：多值索引'％s'的每条记录的最大总值超出％u字节。

ER_EXCEEDED_MV_KEYS_SPACE 已在8.0.16中添加。


</br>

- 错误号：3907; 符号： ER_FUNCTIONAL_INDEX_DATA_IS_TOO_LONG; SQLSTATE：22001

报错信息格式：数据对于功能索引'％s'而言太长。

ER_FUNCTIONAL_INDEX_DATA_IS_TOO_LONG 已在8.0.16中添加。


</br>

- 错误号：3908; 符号： ER_WRONG_MVI_VALUE; SQLSTATE： HY000

报错信息格式：无法将数组或对象存储在索引'％s'的标量键部分中。

ER_WRONG_MVI_VALUE 已在8.0.16中添加。


</br>

- 错误号：3909; 符号： ER_WARN_FUNC_INDEX_NOT_APPLICABLE; SQLSTATE：HY000

报错信息格式：由于类型或排序规则转换，无法使用功能索引'％s'。

ER_WARN_FUNC_INDEX_NOT_APPLICABLE 已在8.0.16中添加。


</br>

- 错误号：3910; 符号： ER_GRP_RPL_UDF_ERROR; SQLSTATE： HY000

报错信息格式：功能'％s'失败。

％s
ER_GRP_RPL_UDF_ERROR 已在8.0.13中添加。


</br>

- 错误号：3911; 符号： ER_UPDATE_GTID_PURGED_WITH_GR; SQLSTATE：HY000

报错信息格式：无法在运行组复制插件的情况下更新GTID_PURGED。

ER_UPDATE_GTID_PURGED_WITH_GR 已在8.0.12中添加。


</br>

- 错误号：3912; 符号： ER_GROUPING_ON_TIMESTAMP_IN_DST; SQLSTATE：HY000

报错信息格式：对于具有DST的时区，时间上的分组是不确定的。

请考虑针对此查询切换到UTC。

ER_GROUPING_ON_TIMESTAMP_IN_DST 已在8.0.17中添加。


</br>

- 错误号：3913; 符号： ER_TABLE_NAME_CAUSES_TOO_LONG_PATH; SQLSTATE：HY000

报错信息格式：数据库名和对象标识符太长，导致路径长度对于表'％s'而言太长。

请检查您操作系统的路径限制。

ER_TABLE_NAME_CAUSES_TOO_LONG_PATH 在8.0.4中添加。


</br>

- 错误号：3914; 符号： ER_AUDIT_LOG_INSUFFICIENT_PRIVILEGE; SQLSTATE：HY000

报错信息格式：对'％s'@'％s'的请求被忽略。

执行操作所需的角色：“％s”
ER_AUDIT_LOG_INSUFFICIENT_PRIVILEGE 已在8.0.16中添加。


</br>

- 错误号：3916; 符号： ER_DA_GRP_RPL_STARTED_AUTO_REJOIN; SQLSTATE：HY000

报错信息格式：开始自动重新加入过程，尝试％lu％lu。

ER_DA_GRP_RPL_STARTED_AUTO_REJOIN 已在8.0.17中添加。


</br>

- 错误号：3917; 符号： ER_SYSVAR_CHANGE_DURING_QUERY; SQLSTATE：HY000

报错信息格式：查询期间已加载或卸载了插件，系统变量表已更改。

ER_SYSVAR_CHANGE_DURING_QUERY 已在8.0.18中添加。


</br>

- 错误号：3918; 符号： ER_GLOBSTAT_CHANGE_DURING_QUERY; SQLSTATE：HY000

报错信息格式：查询期间加载或卸载了插件，全局状态变量已更改。

ER_GLOBSTAT_CHANGE_DURING_QUERY 已在8.0.18中添加。


</br>

- 错误号：3919; 符号： ER_GRP_RPL_MESSAGE_SERVICE_INIT_FAILURE; SQLSTATE：HY000

报错信息格式：START GROUP_REPLICATION命令无法启动其消息服务。

ER_GRP_RPL_MESSAGE_SERVICE_INIT_FAILURE 已在8.0.18中添加。


</br>

- 错误号：3920; 符号： ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_CLIENT; SQLSTATE：HY000

报错信息格式：通道'％s'的MASTER_COMPRESSION_ALGORITHMS'％s'无效。

ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_CLIENT 已在8.0.18中添加。


</br>

- 错误号：3921; 符号： ER_CHANGE_MASTER_WRONG_COMPRESSION_LEVEL_CLIENT; SQLSTATE：HY000

报错信息格式：通道'％s'的MASTER_ZSTD_COMPRESSION_LEVEL％u无效。

ER_CHANGE_MASTER_WRONG_COMPRESSION_LEVEL_CLIENT 已在8.0.18中添加。


</br>

- 错误号：3922; 符号： ER_WRONG_COMPRESSION_ALGORITHM_CLIENT; SQLSTATE：HY000

报错信息格式：无效的压缩算法'％s'。

ER_WRONG_COMPRESSION_ALGORITHM_CLIENT 已在8.0.18中添加。


</br>

- 错误号：3923; 符号： ER_WRONG_COMPRESSION_LEVEL_CLIENT; SQLSTATE：HY000

报错信息格式：算法'％s'的zstd压缩级别无效。

ER_WRONG_COMPRESSION_LEVEL_CLIENT 已在8.0.18中添加。


</br>

- 错误号：3924; 符号： ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_LIST_CLIENT; SQLSTATE：HY000

报错信息格式：指定的压缩算法列表'％s'超过了通道'％s'的总数3。

ER_CHANGE_MASTER_WRONG_COMPRESSION_ALGORITHM_LIST_CLIENT 已在8.0.18中添加。


</br>

- 错误号：3925; 符号： ER_CLIENT_PRIVILEGE_CHECKS_USER_CANNOT_BE_ANONYMOUS; SQLSTATE：HY000

报错信息格式：复制频道'％s'的PRIVILEGE_CHECKS_USER设置为``@％s，但是不允许匿名用户使用PRIVILEGE_CHECKS_USER。

ER_CLIENT_PRIVILEGE_CHECKS_USER_CANNOT_BE_ANONYMOUS 已在8.0.18中添加。


</br>

- 错误号：3926; 符号： ER_CLIENT_PRIVILEGE_CHECKS_USER_DOES_NOT_EXIST; SQLSTATE：HY000

报错信息格式：复制通道'％s'的PRIVILEGE_CHECKS_USER设置为'％s @％s`，但这不是现有用户。

ER_CLIENT_PRIVILEGE_CHECKS_USER_DOES_NOT_EXIST 已在8.0.18中添加。


</br>

- 错误号：3927; 符号： ER_CLIENT_PRIVILEGE_CHECKS_USER_CORRUPT; SQLSTATE：HY000

报错信息格式：在复制配置存储库中找到无效的PRIVILEGE_CHECKS_USER，用于通道'％s'。

使用CHANGE MASTER TO PRIVILEGE_CHECKS_USER来更正配置。

ER_CLIENT_PRIVILEGE_CHECKS_USER_CORRUPT 已在8.0.18中添加。


</br>

- 错误号：3928; 符号： ER_CLIENT_PRIVILEGE_CHECKS_USER_NEEDS_RPL_APPLIER_PRIV; SQLSTATE：HY000

报错信息格式：复制通道'％s'的PRIVILEGE_CHECKS_USER设置为'％s @％s`，但该用户没有REPLICATION_APPLIER特权。

ER_CLIENT_PRIVILEGE_CHECKS_USER_NEEDS_RPL_APPLIER_PRIV 已在8.0.18中添加。


</br>

- 错误号：3929; 符号： ER_WARN_DA_PRIVILEGE_NOT_REGISTERED; SQLSTATE：HY000

报错信息格式：动态特权'％s'未在服务器中注册。

ER_WARN_DA_PRIVILEGE_NOT_REGISTERED 已在8.0.18中添加。


</br>

- 错误号：3930; 符号： ER_CLIENT_KEYRING_UDF_KEY_INVALID; SQLSTATE：HY000

报错信息格式：功能'％s'失败，因为密钥无效。

ER_CLIENT_KEYRING_UDF_KEY_INVALID 在8.0.19中添加。


</br>

- 错误号：3931; 符号： ER_CLIENT_KEYRING_UDF_KEY_TYPE_INVALID; SQLSTATE：HY000

报错信息格式：函数'％s'失败，因为密钥类型无效。

ER_CLIENT_KEYRING_UDF_KEY_TYPE_INVALID 在8.0.19中添加。


</br>

- 错误号：3932; 符号： ER_CLIENT_KEYRING_UDF_KEY_TOO_LONG; SQLSTATE：HY000

报错信息格式：函数'％s'失败，因为密钥长度太长。

ER_CLIENT_KEYRING_UDF_KEY_TOO_LONG 在8.0.19中添加。


</br>

- 错误号：3933; 符号： ER_CLIENT_KEYRING_UDF_KEY_TYPE_TOO_LONG; SQLSTATE：HY000

报错信息格式：函数'％s'失败，因为密钥类型太长。

ER_CLIENT_KEYRING_UDF_KEY_TYPE_TOO_LONG 在8.0.19中添加。


</br>

- 错误号：3934; 符号： ER_JSON_SCHEMA_VALIDATION_ERROR_WITH_DETAILED_REPORT; SQLSTATE：HY000
报错信息格式：％s。

ER_JSON_SCHEMA_VALIDATION_ERROR_WITH_DETAILED_REPORT 在8.0.19中添加。


</br>

- 错误号：3935; 符号： ER_DA_UDF_INVALID_CHARSET_SPECIFIED; SQLSTATE：HY000

报错信息格式：指定了无效的字符集'％s'。

它必须是服务器支持的字符集名称或排序规则名称。

ER_DA_UDF_INVALID_CHARSET_SPECIFIED 在8.0.19中添加。


</br>

- 错误号：3936; 符号： ER_DA_UDF_INVALID_CHARSET; SQLSTATE：HY000

报错信息格式：指定了无效的字符集'％s'。

它必须是服务器支持的字符集名称。

ER_DA_UDF_INVALID_CHARSET 在8.0.19中添加。


</br>

- 错误号：3937; 符号： ER_DA_UDF_INVALID_COLLATION; SQLSTATE：HY000

报错信息格式：指定了无效的排序规则'％s'。

它必须是服务器支持的排序规则名称。

ER_DA_UDF_INVALID_COLLATION 在8.0.19中添加。


</br>

- 错误号：3938; 符号： ER_DA_UDF_INVALID_EXTENSION_ARGUMENT_TYPE; SQLSTATE：HY000
Message: Invalid extension argument type '%s' was specified. Refer the MySQL manual for the valid UDF extension arguments type.
ER_DA_UDF_INVALID_EXTENSION_ARGUMENT_TYPE was added in 8.0.19.

Error number: 3939; Symbol: ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME; SQLSTATE: HY000
Message: Table has multiple constraints with the name '%s'. Please use constraint specific '%s' clause.
ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME was added in 8.0.19.
Error number: 3940; Symbol: ER_CONSTRAINT_NOT_FOUND; SQLSTATE: HY000
Message: Constraint '%s' does not exist.

ER_CONSTRAINT_NOT_FOUND was added in 8.0.19.
Error number: 3941; Symbol: ER_ALTER_CONSTRAINT_ENFORCEMENT_NOT_SUPPORTED; SQLSTATE: HY000
Message: Altering constraint enforcement is not supported for the constraint '%s'. Enforcement state alter is not supported for the PRIMARY, UNIQUE and FOREIGN KEY type constraints.
ER_ALTER_CONSTRAINT_ENFORCEMENT_NOT_SUPPORTED was added in 8.0.19.

Error number: 3942; Symbol: ER_TABLE_VALUE_CONSTRUCTOR_MUST_HAVE_COLUMNS; SQLSTATE: HY000
Message: Each row of a VALUES clause must have at least one column, unless when used as source in an INSERT statement.
ER_TABLE_VALUE_CONSTRUCTOR_MUST_HAVE_COLUMNS was added in 8.0.19.

Error number: 3943; Symbol: ER_TABLE_VALUE_CONSTRUCTOR_CANNOT_HAVE_DEFAULT; SQLSTATE: HY000
Message: A VALUES clause cannot use DEFAULT values, unless used as a source in an INSERT statement.
ER_TABLE_VALUE_CONSTRUCTOR_CANNOT_HAVE_DEFAULT was added in 8.0.19.

Error number: 3944; Symbol: ER_CLIENT_QUERY_FAILURE_INVALID_NON_ROW_FORMAT; SQLSTATE: HY000
Message: The query does not comply with variable require_row_format restrictions.
ER_CLIENT_QUERY_FAILURE_INVALID_NON_ROW_FORMAT was added in 8.0.19.

Error number: 3945; Symbol: ER_REQUIRE_ROW_FORMAT_INVALID_VALUE; SQLSTATE: HY000
Message: The requested value %s is invalid for REQUIRE_ROW_FORMAT, must be either 0 or 1.
ER_REQUIRE_ROW_FORMAT_INVALID_VALUE was added in 8.0.19.

Error number: 3946; Symbol: ER_FAILED_TO_DETERMINE_IF_ROLE_IS_MANDATORY; SQLSTATE: HY000
Message: Failed to acquire lock on user management service, unable to determine if role %s@%s is mandatory
ER_FAILED_TO_DETERMINE_IF_ROLE_IS_MANDATORY was added in 8.0.19.

Error number: 3947; Symbol: ER_FAILED_TO_FETCH_MANDATORY_ROLE_LIST; SQLSTATE: HY000
Message: Failed to acquire lock on user management service, unable to fetch mandatory role list
ER_FAILED_TO_FETCH_MANDATORY_ROLE_LIST was added in 8.0.19.

Error number: 3948; Symbol: ER_CLIENT_LOCAL_FILES_DISABLED; SQLSTATE: 42000
Message: Loading local data is disabled; this must be enabled on both the client and server sides
ER_CLIENT_LOCAL_FILES_DISABLED was added in 8.0.19.

Error number: 3949; Symbol: ER_IMP_INCOMPATIBLE_CFG_VERSION; SQLSTATE: HY000
Message: Failed to import %s because the CFG file version (%u) is not compatible with the current version (%u)
ER_IMP_INCOMPATIBLE_CFG_VERSION was added in 8.0.19.

Error number: 3950; Symbol: ER_DA_OOM; SQLSTATE: HY000
Message: Out of memory
ER_DA_OOM was added in 8.0.19.

Error number: 3951; Symbol: ER_DA_UDF_INVALID_ARGUMENT_TO_SET_CHARSET; SQLSTATE: HY000
Message: Character set can be set only for the UDF argument type STRING.
ER_DA_UDF_INVALID_ARGUMENT_TO_SET_CHARSET was added in 8.0.19.

Error number: 3952; Symbol: ER_DA_UDF_INVALID_RETURN_TYPE_TO_SET_CHARSET; SQLSTATE: HY000
Message: Character set can be set only for the UDF RETURN type STRING.
ER_DA_UDF_INVALID_RETURN_TYPE_TO_SET_CHARSET was added in 8.0.19.

Error number: 3953; Symbol: ER_MULTIPLE_INTO_CLAUSES; SQLSTATE: HY000
Message: Multiple INTO clauses in one query block.
ER_MULTIPLE_INTO_CLAUSES was added in 8.0.19.

Error number: 3954; Symbol: ER_MISPLACED_INTO; SQLSTATE: HY000
Message: Misplaced INTO clause, INTO is not allowed inside subqueries, and must be placed at end of UNION clauses.
ER_MISPLACED_INTO was added in 8.0.19.

Error number: 3955; Symbol: ER_USER_ACCESS_DENIED_FOR_USER_ACCOUNT_BLOCKED_BY_PASSWORD_LOCK; SQLSTATE: HY000
Message: Access denied for user '%s'@'%s'. Account is blocked for %s day(s) (%s day(s) remaining) due to %u consecutive failed logins.
ER_USER_ACCESS_DENIED_FOR_USER_ACCOUNT_BLOCKED_BY_PASSWORD_LOCK was added in 8.0.19.

Error number: 3956; Symbol: ER_WARN_DEPRECATED_YEAR_UNSIGNED; SQLSTATE: HY000
Message: UNSIGNED for the YEAR data type is deprecated and support for it will be removed in a future release.
ER_WARN_DEPRECATED_YEAR_UNSIGNED was added in 8.0.19.

Error number: 3957; Symbol: ER_CLONE_NETWORK_PACKET; SQLSTATE: HY000
Message: Clone needs max_allowed_packet value to be %u or more. Current value is %u
ER_CLONE_NETWORK_PACKET was added in 8.0.19.

Error number: 3958; Symbol: ER_SDI_OPERATION_FAILED_MISSING_RECORD; SQLSTATE: HY000
Message: Failed to %s sdi for %s.%s in %s due to missing record.
ER_SDI_OPERATION_FAILED_MISSING_RECORD was added in 8.0.19.

Error number: 3959; Symbol: ER_DEPENDENT_BY_CHECK_CONSTRAINT; SQLSTATE: HY000
Message: Check constraint '%s' uses column '%s', hence column cannot be dropped or renamed.
ER_DEPENDENT_BY_CHECK_CONSTRAINT was added in 8.0.19.

Error number: 3960; Symbol: ER_GRP_OPERATION_NOT_ALLOWED_GR_MUST_STOP; SQLSTATE: HY000
Message: This operation cannot be performed while Group Replication is running; run STOP GROUP_REPLICATION first
ER_GRP_OPERATION_NOT_ALLOWED_GR_MUST_STOP was added in 8.0.20.

Error number: 3961; Symbol: ER_WARN_DEPRECATED_JSON_TABLE_ON_ERROR_ON_EMPTY; SQLSTATE: HY000
Message: Specifying an ON EMPTY clause after the ON ERROR clause in a JSON_TABLE column definition is deprecated syntax and will be removed in a future release. Specify ON EMPTY before ON ERROR instead.
ER_WARN_DEPRECATED_JSON_TABLE_ON_ERROR_ON_EMPTY was added in 8.0.20.

Error number: 3962; Symbol: ER_WARN_DEPRECATED_INNER_INTO; SQLSTATE: HY000
Message: The INTO clause is deprecated inside query blocks of query expressions and will be removed in a future release. Please move the INTO clause to the end of statement instead.
ER_WARN_DEPRECATED_INNER_INTO was added in 8.0.20.

Error number: 3963; Symbol: ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL; SQLSTATE: HY000

报错信息格式：不建议使用VALUES函数，并且在将来的版本中将其删除。

在这种情况下，它始终返回NULL。

如果要访问INSERT语句的VALUES子句中的值，请考虑使用别名（INSERT INTO ... VALUES（...）AS别名）并在ON DUPLICATE中引用alias.col而不是VALUES（col）。

 KEY UPDATE子句。

ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL 在8.0.20中添加。


</br>

- 错误号：3964; 符号： ER_MISSING_JSON_VALUE; SQLSTATE： 22035

报错信息格式：在指定路径上'％s'未找到任何值。

ER_MISSING_JSON_VALUE 在8.0.21中新增。


</br>

- 错误号：3965; 符号： ER_MULTIPLE_JSON_VALUES; SQLSTATE： 22034

报错信息格式：“％s”在指定路径上发现多个值。

ER_MULTIPLE_JSON_VALUES 在8.0.21中新增。


</br>

- 错误号：3966; 符号： ER_WARN_DEPRECATED_SQL_CALC_FOUND_ROWS; SQLSTATE：HY000

报错信息格式：不推荐使用SQL_CALC_FOUND_ROWS，并将在以后的版本中将其删除。

考虑改用两个单独的查询。

ER_WARN_DEPRECATED_SQL_CALC_FOUND_ROWS 已在8.0.16中添加。


</br>

- 错误号：3967; 符号： ER_WARN_DEPRECATED_FOUND_ROWS; SQLSTATE：HY000

报错信息格式：不建议使用FOUND_ROWS（），并将在以后的版本中将其删除。

考虑改用COUNT（*）。

ER_WARN_DEPRECATED_FOUND_ROWS 已在8.0.16中添加。


</br>

- 错误号：3968; 符号： ER_HOSTNAME_TOO_LONG; SQLSTATE： HY000

报错信息格式：主机名不能超过％d个字符。

ER_HOSTNAME_TOO_LONG 在8.0.21中新增。


</br>

- 错误号：3969; 符号： ER_WARN_CLIENT_DEPRECATED_PARTITION_PREFIX_KEY; SQLSTATE：HY000

报错信息格式：不赞成使用PARTITION BY KEY（）子句中具有前缀键部分'％s（％u）'的列'％s。

％s。

％s'，并将在以后的版本中将其删除。

ER_WARN_CLIENT_DEPRECATED_PARTITION_PREFIX_KEY 在8.0.21中新增。


</br>

- 错误号：3970; 符号： ER_GROUP_REPLICATION_USER_EMPTY_MSG; SQLSTATE：HY000

报错信息格式：由于为恢复通道提供的用户名为空，因此START GROUP_REPLICATION命令失败。

ER_GROUP_REPLICATION_USER_EMPTY_MSG 在8.0.21中新增。


</br>

- 错误号：3971; 符号： ER_GROUP_REPLICATION_USER_MANDATORY_MSG; SQLSTATE：HY000

报错信息格式：START GROUP_REPLICATION命令失败，因为未为恢复通道提供USER选项。

ER_GROUP_REPLICATION_USER_MANDATORY_MSG 在8.0.21中新增。


</br>

- 错误号：3972; 符号： ER_GROUP_REPLICATION_PASSWORD_LENGTH; SQLSTATE：HY000

报错信息格式：由于为恢复通道提供的密码超过了32个字符的最大长度，因此START GROUP_REPLICATION命令失败。

ER_GROUP_REPLICATION_PASSWORD_LENGTH 在8.0.21中新增。


</br>

- 错误号：3973; 符号： ER_SUBQUERY_TRANSFORM_REJECTED; SQLSTATE：HY000

报错信息格式：语句要求将子查询转换为非SET操作（例如IN2EXISTS或subquery-to-lateral-derived-table）。

使用优化程序开关'subquery_to_derived'不允许这样做
ER_SUBQUERY_TRANSFORM_REJECTED 在8.0.21中新增。


</br>

- 错误号：3974; 符号： ER_DA_GRP_RPL_RECOVERY_ENDPOINT_FORMAT; SQLSTATE：HY000

报错信息格式：恢复套接字端点'％s'的无效输入值。

请提供有效的，逗号分隔的端点列表（IP：端口）
ER_DA_GRP_RPL_RECOVERY_ENDPOINT_FORMAT 在8.0.21中新增。


</br>

- 错误号：3975; 符号： ER_DA_GRP_RPL_RECOVERY_ENDPOINT_INVALID; SQLSTATE：HY000

报错信息格式：服务器未在端点'％s'上侦听。

只有服务器正在侦听的端点才是有效的恢复端点。

ER_DA_GRP_RPL_RECOVERY_ENDPOINT_INVALID 在8.0.21中新增。


</br>

- 错误号：3976; 符号： ER_WRONG_VALUE_FOR_VAR_PLUS_ACTIONABLE_PART; SQLSTATE：HY000

报错信息格式：变量'％s'不能设置为'％s'的值。

％s
ER_WRONG_VALUE_FOR_VAR_PLUS_ACTIONABLE_PART 在8.0.21中新增。


</br>

- 错误号：3977; 符号： ER_STATEMENT_NOT_ALLOWED_AFTER_START_TRANSACTION; SQLSTATE：HY000

报错信息格式：在带有START TRANSACTION语句的CREATE TABLE之后，仅允许BINLOG INSERT，COMMIT和ROLLBACK语句。

ER_STATEMENT_NOT_ALLOWED_AFTER_START_TRANSACTION 在8.0.21中新增。


</br>

- 错误号：3978; 符号： ER_FOREIGN_KEY_WITH_ATOMIC_CREATE_SELECT; SQLSTATE：HY000

报错信息格式：使用CREATE TABLE作为SELECT以及使用START TRANSACTION语句的CREATE TABLE不允许外键创建。

ER_FOREIGN_KEY_WITH_ATOMIC_CREATE_SELECT 在8.0.21中新增。


</br>

- 错误号：3979; 符号： ER_NOT_ALLOWED_WITH_START_TRANSACTION; SQLSTATE：HY000

报错信息格式：不能使用START TRANSACTION子句％s。

ER_NOT_ALLOWED_WITH_START_TRANSACTION 在8.0.21中新增。


</br>

- 错误号：3980; 符号： ER_INVALID_JSON_ATTRIBUTE; SQLSTATE：HY000

报错信息格式：无效的json属性，错误：位置％u处的“％s”：“％s”。

ER_INVALID_JSON_ATTRIBUTE 在8.0.21中新增。


</br>

- 错误号：3981; 符号： ER_ENGINE_ATTRIBUTE_NOT_SUPPORTED; SQLSTATE：HY000

报错信息格式：存储引擎'％s'不支持ENGINE_ATTRIBUTE。

ER_ENGINE_ATTRIBUTE_NOT_SUPPORTED 在8.0.21中新增。


</br>

- 错误号：3982; 符号： ER_INVALID_USER_ATTRIBUTE_JSON; SQLSTATE：HY000

报错信息格式：用户属性必须是有效的JSON对象。

ER_INVALID_USER_ATTRIBUTE_JSON 在8.0.21中新增。


</br>

- 错误号：3983; 符号： ER_INNODB_REDO_DISABLED; SQLSTATE： HY000

报错信息格式：由于InnoDB重做日志已禁用，因此无法执行操作。

使用ALTER INSTANCE启用重做日志后，请重试。

ER_INNODB_REDO_DISABLED 在8.0.21中新增。


</br>

- 错误号：3984; 符号： ER_INNODB_REDO_ARCHIVING_ENABLED; SQLSTATE：HY000

报错信息格式：无法执行操作，因为InnoDB正在归档重做日志。

请通过调用 `innodb_redo_log_archive_stop()` 停止重做存档后重试。

ER_INNODB_REDO_ARCHIVING_ENABLED 在8.0.21中新增。


</br>

- 错误号：3985; 符号： ER_MDL_OUT_OF_RESOURCES; SQLSTATE： HY000

报错信息格式：没有足够的资源来完成锁定请求。

ER_MDL_OUT_OF_RESOURCES 在8.0.21中新增。


</br>

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
