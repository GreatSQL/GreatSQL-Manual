# Table/表管理
---

## 什么是表

在GreatSQL中，表（Table）是数据库的基本组成部分，用于存储具有相同结构的数据集合。表由行（Row）和列（Column）组成，每一列代表一个属性或字段（Field），每一行代表一个数据记录（Record）。

## 表的创建
在数据库中创建数据表基本语法如下：
```sql
CREATE TABLE [IF NOT EXISTS] tablename(
	COLUMN_NAME_1 COLUMN_TYPE_1 [CONSTRAINTS] [DEFAULT], 
	COLUMN_NAME_2 COLUMN_TYPE_2 [CONSTRAINTS] [DEFAULT], 
	字段3 数据类型 [约束条件] [默认值],  
	...
	COLUMN_NAME_N COLUMN_TYPE_N CONSTRAINTS
)
```

其中，
- `tablename`为数据表名称，
- `COLUMN_NAME_1`为列名，
- `COLUMN_TYPE_1`为列的数据类型，
- `CONSTRAINTS`为约束条件，
- `DEFAULT`为默认值。

举例：创建一个 `test_greatsql` 的表，表里包括 `id`(编号)、`name`(姓名)、`gender`(性别)、`address`(地址)四个字段
```sql
CREATE TABLE test_greatsql(
  id INT NOT NULL AUTO_INCREMENT,
  ename VARCHAR(10) NOT NULL,
  gender CHAR(1) NOT NULL,
  address VARCHAR(20) NOT NULL,
  PRIMARY KEY(id)
  );
```
使用`SHOW CREATE TABLE test_greatsql \G`可得到更全面的建表信息

```sql
greatsql> SHOW CREATE TABLE test_greatsql \G
*************************** 1. row ***************************
       Table: test_greatsql
Create Table: CREATE TABLE `test_greatsql` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ename` varchar(10) NOT NULL,
  `gender` char(1) NOT NULL,
  `address` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)
```
## 表的删除与清空
对表的操作，包括删除表和清空表。
### 删除表
```sql
DROP TABLE [IF EXISTS] tablename;
```
例如，删除`test_greatsql`表
```sql
DROP TABLE test_greatsql;
```
### 清空表
不删除表结构，只删除内容
```sql
TRUNCATE TABLE tablename;
```
例如，清空`test_greatsql`表
```sql
TRUNCATE TABLE test_greatsql;
```
## 表的修改
### 添加字段
```sql
ALTER TABLE tablename ADD COLUMN_NAME COLUMN_TYPE;
```
例如，在`test_greatsql`表中添加`age`字段
```sql
ALTER TABLE test_greatsql ADD age INT;
```
### 修改字段
```sql
ALTER TABLE tablename MODIFY COLUMN_NAME COLUMN_TYPE;
```
例如，将`test_greatsql`表的`age`字段修改为`varchar`类型
```sql
ALTER TABLE test_greatsql MODIFY age VARCHAR(10);
```
### 删除字段
```sql
ALTER TABLE tablename DROP COLUMN_NAME;
```
例如，删除`test_greatsql`表的`age`字段
```sql
ALTER TABLE test_greatsql DROP age;
```
### 重命名表
```sql
RENAME TABLE old_tablename TO new_tablename;

-- 或
ALTER TABLE old_tablename RENAME TO new_tablename;
```
例如，将`test_greatsql`表重命名为`test_greatsql1`
```sql
RENAME TABLE test_greatsql TO test_greatsql1;
```
## 表的查看
### 查看数据库中的表
```sql
SHOW TABLES;
```
例如，查看`test`数据库中的表
```sql
greatsql> SHOW TABLES;
+------------------+
| Tables_in_test   |
+------------------+
| test_greatsql    |
+------------------+
1 row in set (0.00 sec)
```
## 表的创建参考

详情可见：[Schema设计规范参考](../10-optimize/2-1-schema-design-refer.md)

举例几个《Java开发手册》之字段命名

1. 【强制】表名、字段名必须使用小写字母或数字，禁止出现数字开头，禁止两个下划线中间只出现数字。数据库字段名的修改代价很大，因为无法进行预发布，所以字段名称需要慎重考虑。
正例：aliyun_admin，rdc_config，level3_name
反例：AliyunAdmin，rdcConfig，level_3_name

2. 【强制】表必备三字段：id, gmt_create, gmt_modified。
说明：其中 id 必为主键，类型为BIGINT UNSIGNED、单表时自增、步长为 1。gmt_create, gmt_modified 的类型均为 DATETIME 类型，前者现在时表示主动式创建，后者过去分词表示被动式更新。

3. 【推荐】表的命名最好是遵循 “业务名称_表的作用”。
正例：alipay_task 、 force_project、 trade_config

4. 【推荐】库名与应用名称尽量一致。

5. 【参考】合适的字符存储长度，不但节约数据库表空间、节约索引存储，更重要的是提升检索速度。
正例：无符号值可以避免误存负数，且扩大了表示范围。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
