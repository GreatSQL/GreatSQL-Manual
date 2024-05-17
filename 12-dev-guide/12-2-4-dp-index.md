# Index/索引管理
---

## 什么是索引
在GreatSQL中，索引（Index）是用于提高数据库查询性能的一种数据结构。它允许数据库系统更快地访问数据表中的特定数据，而不是必须从头开始搜索整个表。简单来说，索引就像一个指向表中数据的指针，通过它可以更快地找到数据。
## 索引类型
索引包括普通索引、唯一性索引、全文索引、单列索引、多列索引和空间索引等。

- 从功能逻辑上说，索引主要有 4 种，分别是普通索引、唯一索引、主键索引、全文索引 。

- 按照物理实现方式，索引可以分为 2 种：聚簇索引 和 非聚簇索引 。

- 按照作用字段个数进行划分，分成单列索引 和 联合索引。

### 聚簇索引&非聚簇索引
索引按照物理实现方式，索引可以分为 2 种：聚簇（聚集） 和非聚簇（非聚集） 索引。也把非聚集
索引称为二级索引或者辅助索引。

**聚簇索引**

- 聚簇索引（Clustered Index）是按照数据在物理存储中的组织方式来决定索引的逻辑结构。一个表只能有一个聚簇。聚簇索引就是按照每张表的主键构造一颗B+树，同时叶子节点中存放的就是整张表的行记录数据，也将聚集索引的叶子节点称为数据页。

- 每个表只能有一个聚簇索引，通常由主键构成。如果没有显式指定主键，InnoDB存储引擎会尝试使用第一个唯一非空索引作为聚簇索引。如果表既没有主键也没有合适的唯一索引，InnoDB会隐式地创建一个包含行ID的聚簇索引。


**非聚簇索引**

- 非聚簇索引（也称为辅助索引或二级索引）在叶子节点存储的是主键和索引列，而不是完整的记录行。这意味着当通过非聚簇索引查询数据时，需要先找到对应的主键值，然后再通过主键值去聚簇索引中查找完整的记录行。

- 非聚簇索引的表记录的排列顺序和索引的排列顺序通常不一致。此外，一个表可以有多个非聚簇索引，每个索引都是独立的。

- 非聚簇索引的优点在于可以为多个列创建索引，从而支持更复杂的查询条件。此外，由于非聚簇索引的结构相对简单，因此在某些情况下可能具有更高的查询性能。但是，由于需要通过两次查找（先查非聚簇索引再查聚簇索引）来获取完整的数据记录，因此在某些情况下可能会增加查询的复杂度和开销。

### 主键索引&辅助索引
**主键索引**

- 主键索引是基于表的主键创建的。主键是用于唯一标识表中某一行的属性或属性组，因此主键索引具有唯一性。

- 对于InnoDB存储引擎来说，主键索引就是聚簇索引。这意味着表中的数据行实际上是按照主键索引的顺序来存储的。因此，主键索引的叶节点包含了行的全部数据。

- 一个表只能有一个主键索引，且主键索引中的值必须唯一且非空。

**辅助索引**

- 辅助索引是基于表中的非主键列创建的索引。与主键索引不同，辅助索引的叶节点不包含行的全部数据，而是包含索引键值以及一个指向存储行数据的位置的指针（对于InnoDB存储引擎来说，这个指针指向主键值）。

- 一个表可以有多个辅助索引，每个辅助索引都是独立的。

- 辅助索引的主要作用是加速对表中数据的访问速度。当查询条件包含辅助索引的列时，数据库可以使用辅助索引来快速定位到满足条件的数据行，而无需扫描整个表。

- 需要注意的是，由于辅助索引的叶节点只包含索引键值和一个指向数据行的指针，因此通过辅助索引查询数据时，数据库需要先找到索引键值对应的主键值，然后再通过主键值去聚簇索引中查找完整的数据行。这个过程称为 **回表** 。因此，在某些情况下，如果查询条件只涉及辅助索引的列而不涉及主键列，那么即使使用了辅助索引，查询性能也可能不如预期。

### 单列索引&联合索引

**单列索引**
- 单列索引是基于表中的单个列创建的索引。一个表可以有多个单列索引，每个索引都针对表中的一个列。
- 常见的单列索引类型包括普通索引、唯一索引、主键索引和前缀索引。
  - 普通索引：仅用于提高查询速度，允许数据重复和NULL值。
  - 唯一索引：确保索引列中的值是唯一的，但允许有空值。
  - 主键索引：特殊的唯一索引，不允许有空值，并且每个表只能有一个主键索引。
  - 前缀索引：仅对字符串类型的数据的前几个字符创建索引，适用于长字符串的列。
- 当查询条件只涉及单个列时，单列索引可以显著提高查询速度。
- 但是，如果查询条件经常涉及多个列，那么可能需要考虑使用联合索引。

**联合索引**
- 联合索引是基于表中的多个列创建的索引。这些列按照在索引定义中的顺序组合在一起。
- 联合索引的主要作用是优化多列条件查询的性能。当查询条件涉及多个列时，联合索引可以将这些列组合在一起，使得GreatSQL可以更快地定位到符合条件的数据。
- 联合索引的创建需要仔细考虑列的顺序。对于经常一起用于查询条件的列，应该将它们放在联合索引的前面位置。这样，当查询条件只涉及这些前面的列时，联合索引仍然可以被有效利用。
- 联合索引可以提高多列条件查询的速度，同时也可以提高多列排序操作的性能。
- 与单列索引相比，联合索引可能会占用更多的存储空间，并且可能需要更多的维护成本（如更新索引）。

## 索引的创建
支持多种方法在单个或多个列上创建索引，在创建表的定义语句`CREATE TABLE`中指定索引列，使用`ALTER TABLE`语句在存在的表上创建索引，或者使用`CREATE INDEX`语句在已存在的表上添加索引。

### ALTER TABLE
使用`ALTER TABLE`语句创建索引的基本语法如下
```sql
ALTER TABLE table_name ADD [UNIQUE | FULLTEXT | SPATIAL] [INDEX | KEY]
[index_name] (col_name[length],...) [ASC | DESC]
```
  - `UNIQUE`：表示创建唯一索引。
  - `FULLTEXT`：表示创建全文索引。
  - `SPATIAL`：表示创建空间索引。
  - `INDEX`：表示创建普通索引。

伪代码如下
```sql
ALTER TABLE 表名 ADD 索引类型 索引名称(字段);
```
例如，创建普通索引
```sql
greatsql> ALTER TABLE test ADD INDEX index_name(id);
```
例如，创建唯一索引
```sql
greatsql> ALTER TABLE test ADD UNIQUE index_name(id);
```
例如，创建联合索引
```sql
greatsql> ALTER TABLE test ADD INDEX index_name(id, name);
```
### CREATE INDEX

使用`CREATE INDEX`语句创建索引的基本语法如下
```sql
CREATE [UNIQUE | FULLTEXT | SPATIAL] INDEX index_name
ON table_name (col_name[length],...) [ASC | DESC]
```
伪代码如下
```sql
CREATE 索引类型 索引名称 on 表名(字段);
```
例如，创建普通索引
```sql
greatsql> CREATE INDEX index_name ON test(id);
```
例如，创建唯一索引
```sql
greatsql> CREATE UNIQUE INDEX index_name ON test(id);
```
例如，创建联合索引
```sql
greatsql> CREATE INDEX index_name ON test(id, name);
```
## 索引的删除
使用`ALTER TABLE`删除索引的基本语法格式如下：
```sql
ALTER TABLE table_name DROP INDEX index_name;
```
使用`DROP INDEX`删除索引的基本语法格式如下：
```sql
DROP INDEX index_name ON table_name;
```
> 1. 在需要大量删除表数据，修改表数据时，可以考虑先删除索引。等修改完数据之后再插入
> 2. AUTO_INCREMENT 约束字段的唯一索引不能被删除
> 3. 删除表中的列时，如果要删除的列为索引的组成部分，则该列也会从索引中删除。如果组成索引的所有列都被删除，则整个索引将被删除。

### 删除主键索引
如果一个主键是自增长的，不能直接删除该列的主键索引，应当先取消自增长，再删除主键特性
```sql
# 重新定义列类型
ALTER TABLE tablename MODIFY id INT ;
# 删除主键索引
ALTER TABLE tablename DROP PRIMARY KEY;
```
## 隐藏索引
在GreatSQL 5.7及更早版本中，索引的删除和恢复均依赖于显式操作。若删除索引后遇到错误，需再次显式创建以恢复，这对于数据量大或表结构复杂的场景而言，不仅操作繁琐，更将极大消耗系统资源，提升操作成本。

自GreatSQL 8.0起，引入隐藏索引功能，让索引管理更加灵活。只需将待删索引设为隐藏状态，查询优化器将不再使用它，即便使用强制索引也无法触发。确认设置后，系统无响应影响，便可轻松实现索引的软删除。这种创新方式，简化了索引管理，提高了系统效率。

同时，你想验证某个索引删除之后的查询性能影响，就可以暂时先隐藏该索引

索引默认是可见的，在使用`CREATE TABLE，CREATE INDEX`或者`ALTERTABLE`等语句时可以通过`VISIBLE`或者`INVISIBLE`关键词设置索引的可见性。

### 在建表时候创建隐藏索引
隐藏索引通过SQL语句INVISIBLE来实现，其语法形式如下：
```sql
CREATE TABLE tablename(
	propname1 type1 [ CONSTRAINT1],propname2 type2[ CONSTRAINT2],
    ...
	propnamen typen,
	INDEX [indexname ](propname1 [ ( length)]) INVISIBLE
);
```
举例：
```sql
greatsql> CREATE TABLE t1(a int, b int, INDEX idx_b (b) INVISIBLE);
```
此时这个索引`idx_b`是隐藏的，无法使用。

### 已创建的表上创建隐藏索引

为已经存在的表设置隐藏索引，其语法形式如下：
```sql
CREATE [UNIQUE | FULLTEXT | SPATIAL] INDEX index_name ON table_name (col_name[length] [ASC | DESC] ,...) [INVISIBLE|VISIBLE]
```
举例：
```sql
greatsql> CREATE INDEX idx_b ON t1 (b) INVISIBLE;
```
在t1表中创建隐藏索引idx_b，此时该索引不可见。

### ALTER TABLE语句创建/修改索引可见性
#### ALTER TABLE创建索引
语法如下：
```sql
ALTER TABLE table_name ADD [UNIQUE | FULLTEXT | SPATIAL] INDEX index_name (col_name[length],...) INVISIBLE
```
举例创建隐藏索引idx_b：
```sql
greatsql> ALTER TABLE t1 ADD INDEX idx_b (b) INVISIBLE;
```
在t1表中创建隐藏索引idx_b，此时该索引不可见。
#### ALTER TABLE修改索引可见性
已存在的索引可通过如下语句切换可见状态：
```sql
ALTER TABLE table_name MODIFY INDEX index_name INVISIBLE|VISIBLE;
```
举例,将t1表中的索引idx_b设置为不可见：
```sql
greatsql> ALTER TABLE t1 MODIFY INDEX idx_b INVISIBLE;
```
举例,将t1表中的索引idx_b设置为可见：
```sql
greatsql> ALTER TABLE t1 MODIFY INDEX idx_b VISIBLE;
```
> 隐藏索引时，其内容保持实时更新。若需长期隐藏，建议直接删除，以减少对插入、更新和删除操作的性能影响。

## 降序索引

GreatSQL在8.0版本之前创建的仍然是升序索引，使用时进行反向扫描，这大大降低了数据库的效率。在某些场景下，降序索引意义重大。例如，如果一个查询，需要对多个列进行排序，且顺序要求不一致，那么使用降序索引将会避免数据库使用额外的文件排序操作，从而提高性能。

降序索引使用方法如下：

举例创建 t1 表，并创建联合索引 idx_a_b，其中 a 升序，b 降序
```sql
greatsql> CREATE TABLE t1(a int, b int, index idx_a_b(a, b desc) ) ;
```
查看数据表 t1 的结构，结果如下
```sql
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `my_row_id` bigint unsigned NOT NULL AUTO_INCREMENT /*!80023 INVISIBLE */,
  `a` int DEFAULT NULL,
  `b` int DEFAULT NULL,
  PRIMARY KEY (`my_row_id`),
  KEY `idx_a_b` (`a`,`b` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```
从结果可以看出，索引已经是降序了。


## 索引应用参考
为了使索引的使用效率更高，在创建索引时，必须考虑在哪些字段上创建索引和创建什么类型的索引。索引设计不合理或者缺少索引都会对数据库和应用程序的性能造成障碍。高效的索引对于获得良好的性能非常重要。设计索引时，应该考虑相应准则。详情可见：[索引应用参考](../10-optimze/2-2-sql-develop-refer.md)

- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
