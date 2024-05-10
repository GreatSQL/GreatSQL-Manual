# Oracle兼容-语法-INSERT ALL
---


## 1. 语法

```sql
INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY]
    { ALL insert_into_clause ... | conditional_insert_clause }
    {SELECT ...  }

insert_into_clause:
    INTO tbl_name
    [PARTITION (partition_name [, partition_name] ...)]
    [(col_name [, col_name] ...)]
    [{ VALUES | VALUE} (value_list)]

conditional_insert_clause:
    { ALL | FIRST } when_insert_clause ... [ else_insert_clause ]

when_insert_clause:
    WHEN condition THEN insert_into_clause ...

else_insert_clause:
    ELSE insert_into_clause ...

value:
    {expr | DEFAULT}

value_list:
    value [, value] ...


EXPLAIN insert_all_stmt
```

## 2. 定义和用法

在多表插入中，`INSERT ALL INTO`支持从子查询计算返回的行派生的计算行插入到一个或多个表中。

1. 支持插入不同表。

2. 支持条件查询插入。

`INSERT ALL INTO`使用限制：

1. 插入的目标只能是表，不能是视图，不能是集合表达式  

2. 插入结束后，函数 `LAST_INSERT_ID()` 返回值为0，避免多表插入歧义。

3. 运行`EXPLAIN FORMAT=JSON` 查看执行计划的输出结果只会展示插入第一张表。

## 3. 示例

```
greatsql> CREATE TABLE t3(id INT PRIMARY KEY, cc VARCHAR(10));
greatsql> CREATE TABLE t2 LIKE t3;
greatsql> CREATE TABLE t1 LIKE t3;
greatsql> INSERT INTO t3 VALUES(1, 'test1'),(2,'test2'), (3,'test3');

greatsql> INSERT ALL 
   INTO t1 
   INTO t2 
   SELECT * FROM t3;
Query OK, 6 rows affected (0.45 sec)
Records: 6  Duplicates: 0  Warnings: 0

greatsql> INSERT ALL 
  INTO t1(id) VALUES (id+20)
  INTO t2(cc,id) VALUES ('test',id+10) 
  SELECT id FROM t3;
Query OK, 6 rows affected (0.05 sec)
Records: 6  Duplicates: 0  Warnings: 0

greatsql> INSERT ALL 
  INTO t1 (id,cc) VALUES(13,'test13')
  INTO t1 (id,cc) VALUES(12,'test12')
  SELECT 1 FROM DUAL;
Query OK, 2 rows affected (0.06 sec)
Records: 2  Duplicates: 0  Warnings: 0

greatsql> SELECT * FROM t2;
+----+-------+
| id | cc    |
+----+-------+
|  1 | test1 |
|  2 | test2 |
|  3 | test3 |
| 11 | test  |
| 12 | test  |
| 13 | test  |
+----+-------+

greatsql> SELECT * FROM t1;
+----+--------+
| id | cc     |
+----+--------+
|  1 | test1  |
|  2 | test2  |
|  3 | test3  |
| 12 | test12 |
| 13 | test13 |
| 21 | NULL   |
| 22 | NULL   |
| 23 | NULL   |
+----+--------+
```


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
