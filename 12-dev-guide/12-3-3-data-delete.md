# DELETE 删除数据
---

本节介绍使用 DELETE 命令从GreatSQL数据库删除数据。

## 使用 DELETE 语句

使用 DELETE 语句从表中删除数据
```sql
DELETE FROM table_name [WHERE <condition>];
```
table_name指定要执行删除操作的表；`[WHERE ]`为可选参数，指定删除条件，如果没有WHERE子句，DELETE语句将删除表中的所有记录。

::: danger 危险警示
删除时请谨慎，加上WHERE子句，否则将删除表中的所有数据。
:::

举例，删除 *id=1* 的行：
```sql
DELETE FROM student WHERE id = 1;
```
## 删除全部数据
使用DELETE语句删除表中的所有数据，但保留表结构
```sql
DELETE FROM table_name;
```
举例，删除 student 表所有数据：
```sql
DELETE FROM student;
```

`TRUNCATE TABLE` 在功能上与不带 `WHERE` 子句的 `DELETE` 语句相同，但 `TRUNCATE TABLE` 比 `DELETE` 速度快，且使用的系统和事务日志资源少，但 `TRUNCATE TABLE` 无事务且不触发 `TRIGGER`，有可能造成事故，故不建议在开发代码中使用此语句


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
