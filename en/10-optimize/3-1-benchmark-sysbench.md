# sysbench Performance Benchmark
---

This article mainly introduces the method of using the sysbench tool to benchmark GreatSQL performance.

## About sysbench

[sysbench](https://github.com/akopytov/sysbench) is usually used to benchmark database performance.

sysbench is a scriptable, multi-threaded benchmark tool based on LuaJIT, commonly used to evaluate and test the performance and stability of database systems. It has the following features:

- **Versatility**: supports multiple performance tests, including CPU, memory, disk, file I/O, thread, and other aspects of performance testing. The most commonly used is database performance testing.
- **Support for multiple databases**: supports multiple databases, including MySQL, PostgreSQL, MariaDB, etc., making it a cross-database performance testing tool.
- **Modular design**: adopts a modular design, allowing users to write custom scripts to meet different testing needs. This flexibility makes it suitable for various scenarios.
- **Simple and easy to use**: simple and intuitive to use, making it easy to configure and use.
- **Widely applied**: usually used for database performance testing, for example, evaluating database throughput, concurrency, response time, etc. This is very valuable for database administrators and developers.

In short, sysbench is a powerful and widely used performance testing tool, especially suitable for database performance testing, helping to evaluate and optimize the performance of database systems.

## Installing sysbench

**1. Download sysbench**

Visit the [sysbench github repository](https://github.com/akopytov/sysbench/releases) and download the source package.

**2. Decompress**

```bash
cd /opt
tar xf sysbench-1.0.20.tar.gz
```

**3. Compile sysbench**

Before starting the compilation, the GreatSQL binary package has been installed in the /usr/local directory, and first make a symbolic link for the `libperconaserverclient.so` file:
```bash
$ cd /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/

$ ls -la

...
-rw-r--r--  1 root root   230864 Aug 21 09:17 libcoredumper.a
-rw-r--r--  1 root root  1450924 Aug 21 09:17 libkmip.a
-rw-r--r--  1 root root   156718 Aug 21 09:18 libkmippp.a
-rw-r--r--  1 root root   132150 Aug 21 09:17 libmysqlservices.a
-rw-r--r--  1 root root 21821286 Aug 21 09:22 libperconaserverclient.a
lrwxrwxrwx  1 root root       28 Jul 17 10:33 libperconaserverclient.so -> libperconaserverclient.so.21
lrwxrwxrwx  1 root root       33 Jul 17 10:33 libperconaserverclient.so.21 -> libperconaserverclient.so.21.2.32
-rwxr-xr-x  1 root root 12586032 Aug 21 09:22 libperconaserverclient.so.21.2.32
drwxr-xr-x  3 root root     4096 Aug 21 09:37 mysqlrouter
drwxr-xr-x  2 root root       36 Aug 21 09:37 pkgconfig
drwxr-xr-x  3 root root     8192 Aug 21 09:37 plugin
drwxr-xr-x  3 root root       85 Aug 21 09:36 private

$ ln -s libperconaserverclient.so.21.2.32 libmysqlclient.so
```

Otherwise, an error may be reported in the compilation below:
```log
configure: error: cannot find MySQL client libraries in /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/
```

In addition, compiling and installing sysbench requires the necessary tools such as gcc/automake/libtool to be installed in advance.

Start compiling
```bash
cd sysbench-1.0.20
./autogen.sh
./configure --prefix=/usr/local/sysbench \
  --with-mysql \
  --with-mysql-includes=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/include/ \
  --with-mysql-libs=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/ \
  && make && make install
```

Compilation parameter description:
| Compilation Parameter | Description |
| --- | --- |
| --prefix   | Specifies the installation directory, installed to /usr/local by default |
| --with-mysql  | Declares that compilation supports MySQL/GreatSQL |
| --with-mysql-includes | Specifies the includes directory of MySQL/GreatSQL |
| --with-mysql-libs |  Specifies the libs directory of MySQL/GreatSQL |

**4. Run sysbench to confirm it is usable**

Before starting to run sysbench, first modify the `LD_LIBRARY_PATH` environment variable and add the lib directory of the GreatSQL binary package:
```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/
```

Otherwise, an error may be reported, indicating that the client dynamic library file cannot be found:
```log
error while loading shared libraries: libperconaserverclient.so.21: cannot open shared object file: No such file or directory
```

```bash
$ cd /usr/local/sysbench/bin
$ cp -rf ../share/sysbench/* .
$ ldd ./sysbench  #<-- Confirm that all dynamic library files can be found

...
        libperconaserverclient.so.21 => /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/libperconaserverclient.so.21 (0x00007f6bbcd9d000)
...
$ ./sysbench --version
sysbench 1.0.20 
```

## sysbench Stress Testing Modes

sysbench supports the following OLTP test solutions by default:

- oltp_delete
- oltp_insert
- oltp_point_select
- oltp_read_only
- oltp_read_write
- oltp_update_index
- oltp_update_non_index
- oltp_write_only

If possible, all of these solutions can be run.

In addition, Percona has open sourced a [sysbench-tpcc project](https://github.com/Percona-Lab/sysbench-tpcc/) on github, which can use sysbench to simulate TPC-C testing, saving the trouble of installing a separate TPC-C testing tool. As a supplement, this project can also be used for testing.

## Executing Stress Tests

First modify the `PATH` environment variable and add the path where the sysbench executable binary file is located:

```bash
export PATH=$PATH:/usr/local/sysbench/bin
```

**1. Run the following command to initialize the database**

```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua --db-driver=mysql --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-user=x --mysql-password=x --mysql-db=sbtest --report-interval=1 --percentile=99 --rand-type=uniform --tables=16 --table_size=1000000 --threads=16 --time=600 prepare
```

**2. Run the following command to execute the test**

```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua --db-driver=mysql --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-user=x --mysql-password=x --mysql-db=sbtest --report-interval=1 --percentile=99 --rand-type=uniform --tables=16 --table_size=1000000 --threads=16 --time=600 run
```

**3. After the stress test, clear the data**

```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua --db-driver=mysql --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-user=x --mysql-password=x --mysql-db=sbtest --report-interval=1 --percentile=99 --rand-type=uniform --tables=16 --table_size=1000000 --threads=16 --time=600 cleanup
```

Parameter description:

| Parameter| Description |
| --- | --- |
| ./oltp_read_write.lua | sysbench built-in test cases for different scenarios |
| --db-driver | Connection driver method: mysql. Connecting to GreatSQL also uses this method |
| --mysql-host | Database host address |
| --mysql-port | Port |
| --mysql-user | Username 
| --mysql-password | Password |
| --mysql-db | Test database name |
| --report-interval | Status report frequency during the run, unit: seconds |
| --percentile | Prints the percentile rt, default value is 95(%), it is recommended to change to 99(%)|
| --rand-type | The random generation function used when accessing data. Values can be special, uniform, gaussian, or pareto. The default value is special |
| --tables | The number of stress test data tables |
| --table_size | The number of rows in each stress test data table |
| --threads | The number of concurrent connections |
| --time | Total stress test duration, unit: seconds, set to 0 to run indefinitely |
| --events | Maximum number of requests, choose either this or the --time option |

## Stress Test Parameters and Suggestions

The purpose of stress testing is usually to find the performance bottleneck of the database at runtime, and to continuously explore and adjust parameter options to find which setting mode gives the best performance.

Only occasionally is the stress test aimed at finding the operating limit value of the server hardware or the database, to see under what circumstances the hardware or database can be "pressed to death".

Different server configuration levels correspond to different stress test values.

For stress test parameters, there are several suggestions:

1. The number of concurrent threads can be 1/8, 1/4, 1/2 of the logical CPU count, as well as running at full capacity.
2. The database's `innodb_buffer_pool_size` is usually set not to exceed 50% of physical memory.
3. The number of test tables is usually not less than 1/2 of the logical CPU count.
4. The physical size of the test database is usually not less than `innodb_buffer_pool_size`, because the business data volume in production environments is basically larger than physical memory.
5. If the intention is to test the database performance in scenarios where physical I/O is not the bottleneck, the test data volume can be reduced so that the data is loaded into the buffer pool as much as possible.
6. Run the sysbench stress test client and the database server separately; do not put them in the same physical environment, to avoid sysbench itself also producing performance loss and affecting the database performance.
7. The duration of a single round of testing is usually not less than 10 minutes.
8. After each round of testing, leave sufficient interval so that the database has ample time to flush all dirty data and logs to disk, and after the server tends to be at idle load, start the next round of stress testing.
9. Before each round of testing, it is best to perform data warm-up first, i.e., run a short period of stress testing so that the hot data is loaded into the buffer pool, and then formally start the stress test.
10. After each round of testing, it is best to clear all data and re-initialize and fill the data before the next round of testing begins.

The following is the sysbench stress test parameter set I commonly use for reference:
```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua \
...
--tables=64 \
--table_size=10000000 \
--rand-type=uniform \
--report-interval=1 \
--percentile=99 \
--mysql-ignore-errors=all \
--threads=64 \
--time=900 run
```

## Performance Benchmark Report

After the sysbench performance stress test ends, output similar to the following is printed:

```log
SQL statistics:
    queries performed:
        read:                            61109440
        write:                           17459840
        other:                           8729920
        total:                           87299200
    transactions:                        4364960 (7268.30 per sec.)
    queries:                             87299200 (145366.09 per sec.)
    ignored errors:                      0      (0.00 per sec.)
    reconnects:                          0      (0.00 per sec.)

Throughput:
    events/s (eps):                      7268.3045
    time elapsed:                        600.5472s
    total number of events:              4364960

Latency (ms):
         min:                                    2.41
         avg:                                    8.80
         max:                                 2133.89
         95th percentile:                        9.39
         99th percentile:                       27.17
        999th percentile:                      816.63
         sum:                             38403928.94

Threads fairness:
    events (avg/stddev):           68202.5000/1188.00
    execution time (avg/stddev):   600.0614/0.26
```
Several data metrics generally need attention:
1. The performance metric TPS, i.e., the value in the **transactions** line: 7268.30.
1. The performance metric QPS, i.e., the value in the **queries** line: 145366.09.
1. Average latency Lat avg, i.e., the value in the **avg** line: 8.80(ms).
1. Several other latency data, including 95(%), 99(%), 99.9(%), can also be used as multi-dimensional indicators for reference and comparison.

**Reference materials:**
- [Executing Tests with sysbench](https://mp.weixin.qq.com/s/QPzlrrt7z0ui1ShtA2_P2Q)
- [GreatSQL vs MySQL Performance Benchmark](https://mp.weixin.qq.com/s/tjrz7tJYmfvaYzxruNWMzw)
- [Simple Test of MGR Stability Performance of MySQL 8.0.26 vs GreatSQL 8.0.25](https://mp.weixin.qq.com/s/mn9Nssh7P1cHGcTfRg0vwg)
- [GreatSQL Open Source Database & NVIDIA InfiniBand Storage-Compute Separation Pooling Solution: High-Performance Distributed Deployment](https://mp.weixin.qq.com/s/F9804_7H1WiJ6xD0E1AueQ)
- [Joint Evaluation | Application Exploration of the GreatSQL Open Source Database in DapuStor Roealsen5 NVMe SSD](https://mp.weixin.qq.com/s/QrIZ8Fu69Bzq5MvNZwtTww)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
