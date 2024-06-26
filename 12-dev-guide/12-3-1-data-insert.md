# INSERT 插入数据
---

本节介绍使用 INSERT 命令向 GreatSQL 数据库插入数据。

## 使用 INSERT 插入数据

### VALUES的方式添加
#### 指定列名
```sql
INSERT INTO 表名(column1 [, column2, …, columnn]) 
VALUES (value1 [,value2, …, valuen]);
```
在 INSERT 子句中随意列出列名，但是一旦列出，VALUES中要插入的value1,…valuen需要与column1,…columnn列一一对应。如果类型不同，将无法插入，并且GreatSQL会产生错误。

举例插入一条数据：
```sql
greatsql> INSERT INTO student(id, name) VALUES (1001,'张三');
Query OK, 1 row affected (0.05 sec)
```
举例插入多条数据：
```sql
greatsql> INSERT INTO student(id, name) VALUES (1002,'李四'),(1003,'王五');
Query OK, 2 rows affected (0.05 sec)
Records: 2  Duplicates: 0  Warnings: 0
```
#### 不指定列名
```sql
INSERT INTO 表名 
VALUES (value1 [,value2, …, valuen]);
```
在INSERT子句中不指定列名，则默认使用表中所有列名。
举例插入一条数据：
```sql
greatsql> INSERT INTO student VALUES (1004,'赵六');
Query OK, 1 row affected (0.05 sec)
```
举例插入多条数据：
```sql
greatsql> INSERT INTO student VALUES (1005,'钱七'),(1006,'孙八');
Query OK, 2 rows affected (0.05 sec)
Records: 2  Duplicates: 0  Warnings: 0
```

## INSERT ... SELECT语句添加
还可以将SELECT语句查询的结果插入到表中，此时不需要把每一条记录的值一个一个输入，只需要使用一条INSERT语句和一条SELECT语句组成的组合语句即可快速地从一个或多个表中向一个表中插入多行
```sql
INSERT INTO 目标表名
(tar_column1 [, tar_column2, …, tar_columnn])
SELECT
(src_column1 [, src_column2, …, src_columnn])
FROM 源表名
[WHERE condition]
```
- 在 INSERT 语句中加入子查询。
- 不必再加入 VALUES 子句。
- 子查询中的值列表应与 INSERT 子句中的列名对应。


举例将student表中id大于1002的数据插入到teacher中：
```sql
greatsql> INSERT INTO teacher(id, name) SELECT id, name FROM student WHERE id > 1002;
Query OK, 2 rows affected (0.05 sec)
Records: 2  Duplicates: 0  Warnings: 0
```

## 插入数据建议
1. 插入数据时，建议使用 VALUES 子句的方式，可以避免SQL注入问题，避免重复数据。还可以进一步，采用 `PREPARE` 方式格式化数据，也能避免SQL注入风险。详情参考：[PREPARE 预处理语句](./12-3-5-data-prepare.md)。
2. 插入数据时，建议先了解表结构、各列信息、字段数据类型，避免插入错误的数据。
    表结构与字段数据类型可通过 `DESC` 命令（`DESCRIBE` 的缩写）查查看
    ```sql
    greatsql> DESC student;
    +-------+-------------+------+-----+---------+----------------+
    | Field | Type        | Null | Key | Default | Extra          |
    +-------+-------------+------+-----+---------+----------------+
    | id    | int(11)     | NO   | PRI | NULL    | auto_increment |
    | name  | varchar(20) | YES  |     | NULL    |                |
    +-------+-------------+------+-----+---------+----------------+
    2 rows in set (0.01 sec)
    ```
3. 插入数据时，建议了解列上的约束定义情况。
    `NOT NULL`、`PRIMARY KEY` 约束、`UNIQUE` 约束均可以通过 `DESC` 语句查看，`FOREIGN KEY`、`CHECK` 约束可以通过查询 `information_schema.TABLE_CONSTRAINTS` 视图进行查看。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
