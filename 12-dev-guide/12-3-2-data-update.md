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
UPDATE test SET age=10;
```
::: danger 危险提醒
此SQL不带WHERE条件，它会将所有行中的 `age` 字段更新为10。

线上生产环境中，请务必使用包含 WHERE 条件的SQL语句来指定需要更新的数据。
:::

### 指定需要更新的数据

使用 `WHERE` 子句指定需要更新的数据

举例，更新 *id=2* 的行中的 `age` 字段：

```sql
UPDATE test SET age=10 WHERE id=2;
```
此SQL只会更新 *id=2* 的行中的 `age` 字段。

### 更新多个字段
可以在 `SET` 语句后指定多个字段。

举例，将 *id=2* 的行中的 `age` 字段更新为 *10*，`name` 字段更新为 *GreatSQL*：
```sql
UPDATE test SET age=10, name='GreatSQL' WHERE id=2;
```
此SQL会将 *id=2* 的行中的 `age` 字段更新为 *10*，`name` 字段更新为 *GreatSQL*。

## 使用 ON DUPLICATE KEY UPDATE 子句

当使用 INSERT 语句插入数据时，如果数据表中存在相同的主键，则会报错。可以使用 `ON DUPLICATE KEY UPDATE` 语句将插入数据转变为更新数据的语句来更新相关字段。
语法如下：
```sql
INSERT INTO table (column1, column2, …)
  VALUES (value1, value2, …)
  ON DUPLICATE KEY UPDATE column1=value1, column2=value2, …;
```
举例：
```sql
INSERT INTO test (id, name)
  VALUES (1, 'GreatSQL')
  ON DUPLICATE KEY UPDATE name='GreatSQL';
```
示例中，若 *id=1* 的数据不存在，则会插入一行数据。如果 *id=1* 的数据存在，则会更新 `name` 字段值为 *GreatSQL*。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
