# OUTFILE备份恢复
---

本文介绍GreatSQL数据库如何采用 `OUTFILE` 进行备份恢复。

`OUTFILE` 是指在GreatSQL数据库中执行select查询，并将查询结果直接输出到外部文件中的做法。

`OUTFILE` 导出的文件，可以利用 `LOAD DATA` 再恢复到数据库中。

##  OUTFILE导出备份
执行 SQL 命令 `SELECT ... INTO OUTFILE` 可以将本次查询结果导出到外部文件中，例如：
```sql
SELECT * INTO OUTFILE '/tmp/OUTFILE-t1.txt' FROM t1;
```

指定的导出文件必须放在选项 `secure_file_priv` 指向的目录下，否则会报告类似下面的错误：
```
ERROR 1290 (HY000): The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```

如果目标文件已经存在，则会报告类似下面的错误：
```
ERROR 1086 (HY000): File '/tmp/OUTFILE-t1.txt' already exists
```
这时需要先将目标文件删除或改名以避免冲突。

导出的文件是纯文本格式，每列数据间默认用"\t"分隔开，如果有需要还可以自行指定行、列数据的分隔符，例如：
```sql
greatsql> SELECT * INTO OUTFILE '/tmp/OUTFILE-t1.txt' 
 FIELDS TERMINATED BY '$$$' 
 OPTIONALLY ENCLOSED BY '"' 
 ESCAPED BY '\'' 
 LINES TERMINATED BY '\n' 
 FROM t1;
```

上述几个参数的作用分别是：
- 各列之间的间隔符是 $$$
- 各列的数据用"引用起来
- 遇到需要转义的地方加上\进行转移
- 行数据间用\n分隔

表 `t1` 的DDL定义如下：
```sql
CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` varchar(10) NOT NULL,
  `c2` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

下面是用默认模式，以及加上各个参数后不同导出结果对比：
```
1    c1    0.4356319591734856
2    c2    0.1"199'1518'5412
3    c3    0.2928499125808942
```
vs
```
1$$$1$$$"c1"$$$"0.4356319591734856"
2$$$2$$$"c2"$$$"0.1\"199'1518'5412"
3$$$3$$$"c3"$$$"0.2928499125808942"
```
注意到两个字符串列数据用引号"前后包围起来了，并且原数据中的单引号'、双引号"都做了转义（在其前面加上\，因为列之间已用双引号"包围，所以只需要转义双引号"，无需对单引号'做转义）。

另外，由于 `OUTFILE` 是采用SELECT查询方式备份的，因此可以指定只备份部分列，或加上WHERE条件只备份部分数据。例如：
```sql
SELECT c1,c2 INTO OUTFILE '/tmp/OUTFILE-t1.txt' FROM t1;
```
对表t1只备份其中的 c1,c2 两列数据，不备份 id 列数据，那么在后续的 `LOAD DATA` 导入恢复时就需要做额外处理了。

##  LOAD DATA导入恢复
可以通过 `LOAD DATA` 将 `OUTFILE` 导出的文件恢复到数据库中。

在上面的例子中，导出数据存储在文件 `/tmp/OUTFILE-t1.txt` 中，可以执行下面的命令完成导入恢复：
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

如果导入的目标表中已有数据，这可能会造成重复冲突，产生类似下面的报错：
```
ERROR 1062 (23000): Duplicate entry '1' for key 't1.PRIMARY'
```

这就需要先将目标表中的数据清空后再导入。

如上面例子所示，导出时如果执行了一些分隔符参数，导入时也要再加上这些参数：
```sql
greatsql> LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1
 FIELDS TERMINATED BY '$$$'
 OPTIONALLY ENCLOSED BY '"'
 ESCAPED BY '\\'
 LINES TERMINATED BY '\n';
```

::: tip 小贴士

和`OUTFILE`一样，`LOAD DATA`指定的导入文件必须放在选项 `secure_file_priv` 指向的目录下，否则会报告类似下面的错误：
```
ERROR 1290 (HY000): The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```
:::

在上面我们演示了只备份部分列数据的场景，这个备份文件在导入时需要做额外处理，需要指定导入的对象列，例如：
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1(c1, c2);
```
因为主键列id定义成自增INT列，导入时如果不指定值也会实现自动填充。

还可以在 `LOAD DATA` 导入时对某列进行动态赋值，例如：
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1(c1, c2) SET id=RAND()*10240;
```
那么id列填充的就是随机INT值了，例如下面这样的：
```sql
greatsql> SELECT * FROM t3;
+------+----+--------------------+
| id   | c1 | c2                 |
+------+----+--------------------+
| 1346 | c3 | 0.2928499125808942 |
| 1965 | c1 | 0.4356319591734856 |
| 3496 | c2 | 0.1"199'1518'5412  |
+------+----+--------------------+
```

##  LOAD DATA并行导入
从GreatSQL 8.0.32-25版本开始，`LOAD DATA`执行并行导入，只需在导入时加上HINT `SET_VAR(gdb_parallel_load=ON)` 即可，例如：
```sql
LOAD /*+ SET_VAR(gdb_parallel_load=ON) */ DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

除此外，还支持指定并行线程数，以及每个分片文件大小，例如：
```sql
LOAD /*+ SET_VAR(gdb_parallel_load=ON) SET_VAR(gdb_parallel_load_chunk_size=65536) SET_VAR(gdb_parallel_load_workers=16) */ DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

更多关于并行LOAD DATA的详细信息请参考文档：[并行LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)。


**参考资料：**

- [SELECT ... INTO OUTFILE](https://dev.mysql.com/doc/refman/8.0/en/select-into.html)
- [LOAD DATA](https://dev.mysql.com/doc/refman/8.0/en/load-data.html)
- [GreatSQL增强特性之：并行LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
