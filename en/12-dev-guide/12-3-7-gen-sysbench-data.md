# Generating Test Data with sysbench

**sysbench** is a lightweight and powerful benchmark tool used to evaluate system performance. It supports CPU, memory, thread, and I/O benchmarks, and is particularly suitable for database performance testing, such as for MySQL and GreatSQL. By simulating real application scenarios and workloads, sysbench helps users quickly identify system performance bottlenecks and then optimize the system and select hardware accordingly.

## Installing sysbench

Install sysbench on CentOS
```bash
yum install sysbench -y
```
Install sysbench on Ubuntu
```bash
apt-get install sysbench -y
```

If sysbench cannot be installed with yum / apt-get, try compiling and installing it from source. For details, see: [sysbench Benchmarking](../10-optimize/3-1-benchmark-sysbench.md)

View the sysbench version
```bash
$ sysbench --version
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta3)
```

## Generating Test Data
First create a default test database, for example sysbench_test.

Log in to GreatSQL
```bash
mysql -u root -p
```
Create the test database
```sql
greatsql> CREATE DATABASE sysbench_test;
Query OK, 1 row affected (0.03 sec)
```
Run the following command. This section only demonstrates the method, so table_size is set to a small value.
```bash
$ sysbench /usr/share/sysbench/oltp_read_write.lua \
  --tables=5 --table_size=100 \
  --mysql-user=root --mysql-password=GreatSQL@2024 \
  --mysql-socket=/var/lib/mysql/mysql.sock \
  --mysql-db=sysbench_test prepare

sysbench 1.0.20 (using system LuaJIT 2.0.5)
Creating table 'sbtest1'...
Inserting 100 records into 'sbtest1'
Creating a secondary index on 'sbtest1'...
Creating table 'sbtest2'...
Inserting 100 records into 'sbtest2'
Creating a secondary index on 'sbtest2'...
Creating table 'sbtest3'...
Inserting 100 records into 'sbtest3'
Creating a secondary index on 'sbtest3'...
Creating table 'sbtest4'...
Inserting 100 records into 'sbtest4'
Creating a secondary index on 'sbtest4'...
Creating table 'sbtest5'...
Inserting 100 records into 'sbtest5'
Creating a secondary index on 'sbtest5'...
```
Parameter descriptions:
- `--tables`: specifies the number of tables; the default is 1
- `--table_size`: specifies the table size; the default is 1000000
- `--mysql-user`: specifies the user name used to connect to the database; the default is root
- `--mysql-password`: specifies the password used to connect to the database; the default is empty
- `--mysql-socket`: specifies the socket file used to connect to the database; the default is empty
- `--mysql-db`: specifies the name of the database to connect to; the default is empty
- `prepare`: specifies that the prepare phase of sysbench is executed, that is, generating the test data

After the command completes, 5 tables are created, each containing 100 rows of data.
```sql
greatsql> USE sysbench_test;

greatsql> SHOW TABLES;
+-------------------------+
| Tables_in_sysbench_test |
+-------------------------+
| sbtest1                 |
| sbtest2                 |
| sbtest3                 |
| sbtest4                 |
| sbtest5                 |
+-------------------------+
5 rows in set (0.01 sec)

greatsql> SELECT COUNT(*) FROM sbtest1;
+----------+
| COUNT(*) |
+----------+
|      100 |
+----------+
1 row in set (0.00 sec)
```



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
