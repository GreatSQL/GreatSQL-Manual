# OUTFILE备份恢复
---

本文介绍GreatSQL数据库如何采用 `OUTFILE` 进行备份恢复。

`OUTFILE` 是指在GreatSQL数据库中执行select查询，并将查询结果直接输出到外部文件中的做法。

`OUTFILE` 导出的文件，可以利用 `LOAD DATA` 再恢复到数据库中。

## 1. OUTFILE导出备份
执行 `SELECT ... INTO OUTFILE` 可以将本次查询结果导出到外部文件中，例如：
```
greatsql> SELECT * INTO OUTFILE '/tmp/OUTFILE-t1.txt' FROM t1;
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
```
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
```
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

## 2. LOAD DATA导入恢复
可以通过 `LOAD DATA` 将 `OUTFILE` 导出的文件恢复到数据库中。

在上面的例子中，导出数据存储在文件 `/tmp/OUTFILE-t1.txt` 中，可以执行下面的命令完成导入恢复：
```
greatsql> LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

如果导入的目标表中已有数据，这可能会造成重复冲突，产生类似下面的报错：
```
ERROR 1062 (23000): Duplicate entry '1' for key 't1.PRIMARY'
```

这就需要先将目标表中的数据清空后再导入。

如上面例子所示，导出时如果执行了一些分隔符参数，导入时也要再加上这些参数：
```
greatsql> LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1
 FIELDS TERMINATED BY '$$$'
 OPTIONALLY ENCLOSED BY '"'
 ESCAPED BY '\\'
 LINES TERMINATED BY '\n';
```

**提醒：** 和`OUTFILE`一样，`LOAD DATA`指定的导入文件必须放在选项 `secure_file_priv` 指向的目录下，否则会报告类似下面的错误：
```
ERROR 1290 (HY000): The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```

## 3. LOAD DATA并行导入
从GreatSQL 8.0.32-24版本开始，`LOAD DATA`执行并行导入，只需在导入时加上HINT `SET_VAR(gdb_parallel_load=ON)` 即可，例如：
```
greatsql> LOAD /*+ SET_VAR(gdb_parallel_load=ON) */ DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

除此外，还支持指定并行线程数，以及每个分片文件大小，例如：
```
greatsql> LOAD /*+ SET_VAR(gdb_parallel_load=ON) SET_VAR(gdb_parallel_load_chunk_size=65536) SET_VAR(gdb_parallel_load_workers=16) */ DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

更多关于并行LOAD DATA的详细信息请参考文档：[并行LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)。


**参考资料：**

- [SELECT ... INTO OUTFILE](https://dev.mysql.com/doc/refman/8.0/en/select-into.html)
- [LOAD DATA](https://dev.mysql.com/doc/refman/8.0/en/load-data.html)
- [GreatSQL增强特性之：并行LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Doc/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
