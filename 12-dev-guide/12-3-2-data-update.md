# UPDATE 更新数据
---

本节介绍使用 UPDATE 命令向GreatSQL数据库更新数据。

## 使用 UPDATE 语句
使用 UPDATE 语句更新数据。语法如下
```sql
UPDATE table_name
SET column1=value1, column2=value2, … , column=valuen
[WHERE condition]
```

举例将所有行中的age字段更新为10：
```sql
greatsql> UPDATE test SET age=10;
```
> 注意！此SQL会将所有行中的age字段更新为10。请使用 WHERE 语句来指定需要更新的数据。

### 指定需要更新的数据
使用 `WHERE` 子句指定需要更新的数据
举例更新id为2的行中的age字段：
```sql
greatsql> UPDATE test SET age=10 WHERE id=2;
```
此SQL只会更新id为2的行中的age字段。
### 更新多个字段
可以在 `SET` 语句后指定多个字段。
举例id为2的行中的age字段更新为10，name字段更新为GreatSQL：
```sql
greatsql> UPDATE test SET age=10, name='GreatSQL' WHERE id=2;
```
此SQL会将id为2的行中的age字段更新为10，name字段更新为GreatSQL。

## 使用 ON DUPLICATE KEY UPDATE 子句

当使用 INSERT 语句插入数据时，如果数据表中存在相同的主键，则会报错。可以使用 `ON DUPLICATE KEY UPDATE` 语句将插入数据转变为更新数据的语句来更新相关字段。
语法如下：
```sql
INSERT INTO table (column1, column2, …) VALUES (value1, value2, …) ON DUPLICATE KEY UPDATE column1=value1, column2=value2, …;
```
举例：
```sql
greatsql> INSERT INTO test (id, name) VALUES (1, 'GreatSQL') ON DUPLICATE KEY UPDATE name='GreatSQL';
```
示例中，若id为1的数据不存在，则会插入一行数据。如果id为1的数据存在，则会更新name字段为GreatSQL。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
