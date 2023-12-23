# Oracle兼容-语法-SEQUENCE（序列）
---



序列（`SEQUENCE`）是序列号生成器，可以为表中的行自动生成序列号，产生一组等间隔的数值（类型为数字）。不占用磁盘空间，但占用内存。

通常用于生成表的主键值，可以在插入语句中引用，也可以通过查询检查当前值，或使序列增至下一个值。

GreatSQL的 `SEQUENCE` 语法与Oracle完全兼容，只有部分特性在实现上略有差异。

## 1. 语法

```sql
CREATE SEQUENCE schema_name.sequence_name
[INCREMENT BY interval]
[START WITH first_number]
[MAXVALUE max_value | NOMAXVALUE]
[MINVALUE min_value | NOMINVALUE]
[CYCLE | NOCYCLE]
[CACHE cache_size | NOCACHE]
[ORDER | NOORDER];
```

## 2. 定义和用法

### 2.1 创建 `SEQUENCE` 相关参数说明

创建 `SEQUENCE` 相关参数默认值如下表所示：

| 属性名       | 默认值  | 描述                                   |
| ------------ | ------- | -------------------------------------- |
| START WITH   | 1       | 起始值                                 |
| INCREMENT BY | 1       | 获取下个值的步长（可为负数）           |
| MINVALUE     | 1       | 最小值                                 |
| MAXALUE      | 10^29-1 | 28位十进制值                           |
| CYCLE        | false   | 当为true时，使用完所有值后重新循环获取 |
| CACHE        | 20      | 高速缓存中为当前序列储存的值的数量     |
| ORDER        | false   | 当为true时，保证全局有序（会损失性能） |


关于使用 `SEQUENCE` 有几点要注意：

- 1. 确保高速访问 `SEQUENCE`

`SEQUENCE` 使用内存高速缓存用于快速访问并获取 `NEXTVAL`，同时使用物理表持久化当前值（高速缓存中缓存 `SEQUENCE` 值的个数和选项 `CACHE` 指定的个数有关）。

参数 `ORDER` 通常用于多实例场景中（例如MGR多写场景）获取 `SEQUENCE` 值时全局保证有序性，当指定 `ORDER` 为 **true** 时，高速缓存失效，性能会受到一定程度损失。

**提醒**：当 `ORDER` 为 true，或 `CACHE` 参数值较小时，会降低序列取值性能。

- 2. 序列值预分配及确保全局唯一

高速缓存中的序列值采用 **预分配机制**。当高速缓存值用尽时，则读取当前序列在物理表中的记录，并依据此记录再次分配20个(默认)序列值，并更新物理表。更新成功后这20个序列值预分配成功，保存在高速缓存中。

若GreatSQL实例被关闭或异常崩溃，缓存中的未使用完的值会丢失，重启实例后再次获取的序列值不包含上次预分配的序列值。

- 3. 其他注意事项

  - 1. 不建议用于MGR多主写场景。

  - 2. 为提高性能，序列对象需要占用内部连接，在序列对象较多时需要适当调大最大连接数。


### 2.2 使用 `SEQUENCE`

- 1. 创建/删除/修改

GreatSQL支持的SEQUENCE操作有 `CREATE`、`DROP`、`ALTER`，暂未支持 `RENAME`。

执行 `ALTER SEQUENCE` 修改时，不支持修改 `START WITH` 值。

执行 `DROP SEQUENCE` 删除序列时只支持每次删除一个序列。

对 `SEQUENCE` 执行上述DDL操作时，会对 `SEQUENCE` 加MDL锁保护，因此无需考虑DDL和DML同时操作同一序列会产生冲突。

`SEQUENCE` 对象名与表名、视图名互斥。同一个 `SCHEMA` 下无法创建同名的序列、表、视图。

- 2. 查看

可通过 `SHOW CREATE SEQUENCE seq_name` 语句展示 `SEQUENCE` 创建的DDL。

还可通过`SHOW [FULL] SEQUENCES [FROM|IN schema_name] [LIKE seq_name] [WHERE where_condition]` 展示指定schema中的所有序列。


- 3. 导出备份

在使用 `mysqldump` 导出数据时，可通过增加 `--sequences` 选项（默认为关闭），导出序列对象。导出时，序列的 `START WITH` 是下一个有效值。

**注意**：`--sequences` 选项不能与 `--xml` 选项同时使用。

示例：
```
mysqldump -S/data/GreatSQL/mysql.sock -uroot -pxxx -B greatsql -d --sequences > /data/backup/GreatSQL/greatsql-ddl.sql
```

## 3. 示例
```sql
-- 创建
greatsql> CREATE SEQUENCE `seq1`
 START WITH 1
 MINVALUE 1
 MAXVALUE 9999999999999999999999999999
 INCREMENT BY 1
 NOCYCLE CACHE 20 NOORDER;

-- 查看
greatsql> SHOW SEQUENCES;
+-----------------------+
| Sequences_in_greatsql |
+-----------------------+
| seq1                  |
+-----------------------+

greatsql> SHOW FULL SEQUENCES;
+-----------------------+------------+----------+------------------------------+--------------+-------+-------+-------+
| Sequences_in_greatsql | Start_with | Minvalue | Maxvalue                     | Increment_by | Cycle | Cache | Order |
+-----------------------+------------+----------+------------------------------+--------------+-------+-------+-------+
| seq1                  |          1 |        1 | 9999999999999999999999999999 |            1 |     0 |    20 |     0 |
+-----------------------+------------+----------+------------------------------+--------------+-------+-------+-------+

greatsql> SHOW CREATE SEQUENCE SEQ1;
+----------+------------------------------------------------------------------------------------------------------------------------------+
| Sequence | Create Sequence                                                                                                              |
+----------+------------------------------------------------------------------------------------------------------------------------------+
| seq1     | CREATE SEQUENCE `seq1` START WITH 1 MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 NOCYCLE CACHE 20 NOORDER |
+----------+------------------------------------------------------------------------------------------------------------------------------+

-- 修改
greatsql> ALTER SEQUENCE seq1 MAXVALUE 99999;

-- 修改最小值失败，因为当前值比最小值还小（要求 MINVALUE <= currval <= MAXVALUE）
greatsql> ALTER SEQUENCE seq1 MINVALUE 3;
ERROR 8586 (HY000): alter sequence failed, cause "currval" should between MINVALUE and MAXVALUE!

-- 执行下面操作，反复取值，直到 currval >= MINVALUE
greatsql> SELECT seq1.NEXTVAL;
+---------+
| nextval |
+---------+
|       1 |
+---------+
...
+---------+
| nextval |
+---------+
|      15 |
+---------+

-- 再次修改
greatsql> ALTER SEQUENCE seq1 MINVALUE 10;
Query OK, 1 row affected (0.00 sec)

-- 不能修改START WITH
greatsql> alter sequence seq1 start with 10;
ERROR 8586 (HY000): alter sequence failed, cause can not modify START WITH

-- 删除
greatsql> DROP SEQUENCE seq1;
Query OK, 1 row affected (0.00 sec)
```

## 4. `SEQUENCE` 数据字典

```sql
-- 1. 查询 information_schema.SEQUENCES 查看所有SEQUENCE
greatsql> SELECT * FROM information_schema.SEQUENCES;
+----------+------+------------+----------+------------------------------+-----------+------------+-----------+------------+
| DB       | NAME | START_WITH | MINVALUE | MAXVALUE                     | INCREMENT | CYCLE_FLAG | CACHE_NUM | ORDER_FLAG |
+----------+------+------------+----------+------------------------------+-----------+------------+-----------+------------+
| greatsql | seq1 |          1 |        1 | 9999999999999999999999999999 |         1 |          0 |        20 |          0 |
+----------+------+------------+----------+------------------------------+-----------+------------+-----------+------------+
1 row in set (0.00 sec)
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
