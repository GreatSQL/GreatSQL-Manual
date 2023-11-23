# Oracle兼容-函数-SYS_CONNECT_BY_PATH()函数
---
[toc]

## 1. 语法

```sql
SYS_CONNECT_BY_PATH(column, char)
```

## 2. 定义和用法

`SYS_CONNECT_BY_PATH()` 函数主要用于**树查询(层次查询)**以及**多列转行**。

`SYS_CONNECT_BY_PATH()` 仅在分层查询中有效，它返回列值从根到节点的路径，对于 `CONNECT BY` 条件返回的每一行，列值由 `char` 分隔。

含有伪列的计算，并且存在 `WHERE` 过滤条件，`ROWNUM` 的值，根据在 `CONNECT BY` 排序后的结果将会保存，而不是重新计算，例如：

- GreatSQL运行结果：
```sql
greatsql> SELECT LEVEL, SYS_CONNECT_BY_PATH(ROWNUM, '->') FROM DUAL WHERE ROWNUM < 3 AND LEVEL=2 CONNECT BY LEVEL<=10;
+-------+--------+
| LEVEL | ROWNUM |
+-------+--------+
|     2 | ->1->2 |
+-------+--------+
```

- Oracle运行结果：
```sql
SQL> SELECT LEVEL, SYS_CONNECT_BY_PATH(ROWNUM, '->') FROM DUAL WHERE ROWNUM < 3 AND LEVEL=2 CONNECT BY LEVEL<=10;

     LEVEL
----------
SYS_CONNECT_BY_PATH(ROWNUM,'->
------------------------------
         2
->1->1
```


## 3. 示例

```sql
greatsql> CREATE TABLE student (
    id       INT,
    name  VARCHAR(10),
    grade INT
);

greatsql> INSERT INTO student VALUES(1, 'John', -1),
(2, 'Paul',  1),
(3, 'Nancy', 1),
(4, 'Sarah', 2);

greatsql> SELECT * FROM student;
+------+-------+-------+
| id   | name  | grade |
+------+-------+-------+
|    1 | John  |    -1 |
|    2 | Paul  |     1 |
|    3 | Nancy |     1 |
|    4 | Sarah |     2 |
+------+-------+-------+

greatsql> SELECT id, grade, LEVEL, SYS_CONNECT_BY_PATH(id ,'->'), PRIOR name, CONNECT_BY_ROOT id FROM student CONNECT BY PRIOR id = grade;
+------+-------+-------+-------------------------------+------------+--------------------+
| id   | grade | LEVEL | SYS_CONNECT_BY_PATH(id ,'->') | PRIOR name | CONNECT_BY_ROOT id |
+------+-------+-------+-------------------------------+------------+--------------------+
|    1 |    -1 |     1 | ->1                           | NULL       |                  1 |
|    2 |     1 |     2 | ->1->2                        | John       |                  1 |
|    4 |     2 |     3 | ->1->2->4                     | Paul       |                  1 |
|    3 |     1 |     2 | ->1->3                        | John       |                  1 |
|    2 |     1 |     1 | ->2                           | NULL       |                  2 |
|    4 |     2 |     2 | ->2->4                        | Paul       |                  2 |
|    3 |     1 |     1 | ->3                           | NULL       |                  3 |
|    4 |     2 |     1 | ->4                           | NULL       |                  4 |
+------+-------+-------+-------------------------------+------------+--------------------+
```

**其他参考**：分层查询 [connect by](5-3-easyuse-ora-syntax-connectby.md)。



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
