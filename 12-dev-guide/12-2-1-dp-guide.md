# 模式开发设计概览
---

本节介绍GreatSQL的模式开发设计。

## 术语概述

为避免和通用术语数据库 (Database)混淆，将逻辑对象称为数据库 (Database)，而使用的GreatSQL数据库则称为GreatSQL。

### 常见术语

#### Database 数据库
数据库是由若干个相关数据的集合组成，这些数据被存储在计算机系统中，以便于进行管理、处理和访问。可以包含多个表格或者集合，每个表格或集合包含一组相似的数据。数据可以是结构化的（如表格中的行和列）或非结构化的（如文本、图像、音频等）

#### Table 表
表是数据库中存储数据的基本单元，也是关系型数据库中的基本对象。表由列和行组成。

#### Column 列
列是表中的数据字段，列的名称和类型定义了数据在表中存储的数据。

#### Row 行
行是表中的数据记录，每一行包含了表中所有列的数据。

#### Index 索引
索引是数据库中用于快速检索数据的数据结构。索引通常由表中的一列或多列组成。
- **Primary Key 主键**
主键是表中一列或一组列的组合，其值能唯一标识表中的每一行。主键可以由一个或多个列组成，并且每个表只能有一个主键。
- **Foreign Key 外键**
外键是表中的一列或一组列，其值匹配另一张表中主键的值。外键用于建立和加强两个表之间的关联。
- **Unique Key 唯一键**
唯一键是表中的一列或一组列，其值唯一标识表中每一行。唯一键可以由一个或多个列组成，并且每个表只能有一个唯一键。

### SQL术语
#### SQL 结构化查询语言
SQL是结构化查询语言，是一种数据库查询语言。

#### DDL 数据定义语言
DDL是数据定义语言，用于创建、删除或修改数据库对象。关键字包括CREATE 、DROP 、ALTER 等

#### DML 数据操作语言
DML是数据操作语言，用于对数据库中的数据进行增删改查。关键字包括INSERT 、UPDATE 、DELETE 等

#### DCL 数据控制语言
DCL是数据控制语言，用于授予或回收权限。关键字包括GRANT 、REVOKE 等


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
