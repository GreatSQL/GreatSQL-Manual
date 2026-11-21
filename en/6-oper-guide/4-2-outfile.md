# OUTFILE Backup & Restore
---

This article introduces how to use `OUTFILE` for backup and restore in the GreatSQL database.

`OUTFILE` refers to the practice of executing a `SELECT` query in the GreatSQL database and directly outputting the query results to an external file.

The files exported by `OUTFILE` can be restored to the database using `LOAD DATA`.

## OUTFILE Export Backup
Executing the SQL command `SELECT ... INTO OUTFILE` can export the query results of this time to an external file, for example:
```sql
SELECT * INTO OUTFILE '/tmp/OUTFILE-t1.txt' FROM t1;
```

The specified export file must be placed in the directory pointed to by the option `secure_file_priv`; otherwise, an error similar to the following is reported:
```log
ERROR 1290 (HY000): The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```

If the target file already exists, an error similar to the following is reported:
```log
ERROR 1086 (HY000): File '/tmp/OUTFILE-t1.txt' already exists
```
At this time, the target file needs to be deleted or renamed to avoid conflicts.

The exported file is in plain text format, and the data of each column is separated by "\t" by default. If necessary, the row and column data separators can be specified yourself, for example:
```sql
SELECT * INTO OUTFILE '/tmp/OUTFILE-t1.txt' 
 FIELDS TERMINATED BY '$$$' 
 OPTIONALLY ENCLOSED BY '"' 
 ESCAPED BY '\'' 
 LINES TERMINATED BY '\n' 
 FROM t1;
```

The roles of the above parameters are respectively:
- The separator between columns is $$$
- The data of each column is enclosed in "
- Add \ for escaping where escaping is needed
- Rows of data are separated by \n

The DDL definition of table `t1` is as follows:
```sql
CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` varchar(10) NOT NULL,
  `c2` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

The following is a comparison of the different export results using the default mode and after adding each parameter:
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
Note that the two string column data are enclosed in quotes " before and after, and the single quotes ' and double quotes " in the original data have been escaped (by adding \ in front of them; because the columns are already enclosed in double quotes ", only the double quotes " need to be escaped, and there is no need to escape the single quotes ').

In addition, because `OUTFILE` uses the `SELECT` query method for backup, it is possible to specify backing up only some columns, or add a WHERE condition to back up only part of the data. For example:
```sql
SELECT c1,c2 INTO OUTFILE '/tmp/OUTFILE-t1.txt' FROM t1;
```
Only the c1 and c2 column data of table t1 are backed up, not the id column data. In this case, additional processing is needed in the subsequent `LOAD DATA` import and restore.

## LOAD DATA Import & Restore
The files exported by `OUTFILE` can be restored to the database with `LOAD DATA`.

In the above example, the exported data is stored in the file `/tmp/OUTFILE-t1.txt`. The following command can be executed to complete the import and restore:
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

If the target table already has data, this may cause duplicate conflicts, producing an error similar to the following:
```log
ERROR 1062 (23000): Duplicate entry '1' for key 't1.PRIMARY'
```

In this case, the data in the target table needs to be cleared first and then imported.

As shown in the above example, if separator parameters were specified during export, these parameters also need to be added during import:
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1
 FIELDS TERMINATED BY '$$$'
 OPTIONALLY ENCLOSED BY '"'
 ESCAPED BY '\\'
 LINES TERMINATED BY '\n';
```

::: tip Tip

Like `OUTFILE`, the import file specified by `LOAD DATA` must be placed in the directory pointed to by the option `secure_file_priv`; otherwise, an error similar to the following is reported:
```log
ERROR 1290 (HY000): The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```
:::

Above, we demonstrated the scenario of backing up only some column data. This backup file needs additional processing when importing, and the target object columns need to be specified, for example:
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1(c1, c2);
```
Because the primary key column id is defined as an auto-increment INT column, it is automatically filled even if no value is specified during import.

It is also possible to dynamically assign a value to a column during `LOAD DATA` import, for example:
```sql
LOAD DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1(c1, c2) SET id=RAND()*10240;
```
Then the id column is filled with random INT values, for example like this:
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

## LOAD DATA Parallel Import
Starting from GreatSQL 8.0.32-25, `LOAD DATA` supports parallel import. Just add the HINT `SET_VAR(gdb_parallel_load=ON)` during import, for example:
```sql
LOAD /*+ SET_VAR(gdb_parallel_load=ON) */ DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

In addition, the number of parallel threads and the size of each shard file can also be specified, for example:
```sql
LOAD /*+ SET_VAR(gdb_parallel_load=ON) SET_VAR(gdb_parallel_load_chunk_size=65536) SET_VAR(gdb_parallel_load_workers=16) */ DATA INFILE '/tmp/outfile-t1.txt' INTO TABLE t1;
```

For more detailed information about parallel LOAD DATA, refer to the document: [Parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md).


**Reference materials:**

- [SELECT ... INTO OUTFILE](https://dev.mysql.com/doc/refman/8.0/en/select-into.html)
- [LOAD DATA](https://dev.mysql.com/doc/refman/8.0/en/load-data.html)
- [GreatSQL Enhancement Feature: Parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
