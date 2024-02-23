# 其它INFORMATION_SCHEMA表

---
此页面列出了由GreatSQL新增的其它`INFORMATION_SCHEMA` 表，这些表在文档其它地方不存在。

## Temporary tables 临时表

### INFORMATION_SCHEMA.GLOBAL_TEMPORARY_TABLES

只显示使用`CREATE TEMPORARY TABLE`或`ALTER TABLE`明确创建的临时表，不显示为处理复杂查询而创建的临时表。

创建一张临时表：

```sql
greatsql> CREATE TEMPORARY TABLE tmp_table (
   id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   age INT
);
```

查询表输出如下：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.GLOBAL_TEMPORARY_TABLES\G
*************************** 1. row ***************************
    SESSION_ID: 170
  TABLE_SCHEMA: test_db
    TABLE_NAME: tmp_table
        ENGINE: InnoDB
          NAME: #sql4014d_aa_4
    TABLE_ROWS: 0
AVG_ROW_LENGTH: 0
   DATA_LENGTH: 16384
  INDEX_LENGTH: 0
   CREATE_TIME: NULL
   UPDATE_TIME: NULL
1 row in set (0.00 sec)
```

| 列名称         | 描述                       |
| -------------- | -------------------------- |
| SESSION_ID     | 连接 ID                    |
| TABLE_SCHEMA   | 创建临时表的架构（库名）   |
| TABLE_NAME     | 临时表的名称               |
| ENGINE         | 临时表的引擎               |
| NAME           | 临时表的内部名称           |
| TABLE_ROWS     | 临时表的行数               |
| AVG_ROW_LENGTH | 临时表的平均行长度         |
| DATA_LENGTH    | 数据大小（字节）           |
| INDEX_LENGTH   | 索引的大小（字节）         |
| CREATE_TIME    | 临时表的创建日期和时间     |
| UPDATE_TIME    | 临时表最近更新的日期和时间 |

该表保存所有连接存在的临时表的信息。不需要 `SUPER` 权限来查询该表。

### INFORMATION_SCHEMA.TEMPORARY_TABLES

该表保存有关正在运行的连接的现有临时表的信息。

换一个连接GreatSQL，查询此表没有内容：

```sql
greatsql> SELECT connection_id();
+-----------------+
| connection_id() |
+-----------------+
|             171 |
+-----------------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM INFORMATION_SCHEMA.TEMPORARY_TABLES\G
Empty set (0.00 sec)
```

用当前连接创建一个临时表：

```sql
greatsql> CREATE TEMPORARY TABLE tmp_table2 (
   id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   age INT
);
```

再次查询 TEMPORARY_TABLES 表结果如下：

```sql
greatsql> SELECT * FROM INFORMATION_SCHEMA.TEMPORARY_TABLES\G
*************************** 1. row ***************************
    SESSION_ID: 171
  TABLE_SCHEMA: test_db
    TABLE_NAME: tmp_table2
        ENGINE: InnoDB
          NAME: #sql4014d_ab_4
    TABLE_ROWS: 0
AVG_ROW_LENGTH: 0
   DATA_LENGTH: 16384
  INDEX_LENGTH: 0
   CREATE_TIME: NULL
   UPDATE_TIME: NULL
1 row in set (0.00 sec)
```

**问题反馈**
---

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
