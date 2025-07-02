# sysbench性能测试
---

本文主要介绍采用sysbench工具对GreatSQL进行性能测试的方法。

## 关于sysbench

通常采用 [sysbench](https://github.com/akopytov/sysbench) 对数据库进行性能测试。

sysbench是一个基于 LuaJIT 的可编写脚本的多线程基准测试工具，常用于评估测试数据库系统的性能和稳定性。它具有以下特点：

- **多功能性**：支持多种性能测试，包括CPU、内存、磁盘、文件I/O、线程等各方面的性能测试。最常用的是数据库性能测试。
- **支持多种数据库**：支持多种数据库，包括MySQL、PostgreSQL、MariaDB等，使其成为一个跨数据库的性能测试工具。
- **模块化设计**：采用模块化设计，允许用户编写自定义脚本以满足不同测试需求。这种灵活性使其适用于各种场景。
- **简单易用**：使用起来简单直观，使其易于配置和使用。
- **广泛应用**：通常用于数据库性能测试，例如评估数据库的吞吐量、并发性、响应时间等。这对于数据库管理员和开发人员来说是非常有价值的。

总之，sysbench是一个功能强大且广泛应用的性能测试工具，特别适用于数据库性能测试，有助于评估和优化数据库系统的性能。

## 安装sysbench

**1. 下载sysbench**

访问[sysbench github仓库](https://github.com/akopytov/sysbench/releases)，下载源码包。

**2. 解压缩**

```bash
cd /opt
tar xf sysbench-1.0.20.tar.gz
```

**3. 编译sysbench**

在开始编译前，已经将GreatSQL二进制包安装到 /usr/local 目录下，并且先对 `libperconaserverclient.so` 文件做个软链接：
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

否则在下面的编译中可能会提示报错：
```log
configure: error: cannot find MySQL client libraries in /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/
```

另外，编译安装sysbench需要提前安装 gcc/automake/libtool 等必要的工具。

开始编译
```bash
cd sysbench-1.0.20
./autogen.sh
./configure --prefix=/usr/local/sysbench \
  --with-mysql \
  --with-mysql-includes=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/include/ \
  --with-mysql-libs=/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/ \
  && make && make install
```

编译参数说明：
| 编译参数 | 说明 |
| --- | --- |
| --prefix   | 指定安装目录，默认安装到 /usr/local |
| --with-mysql  | 声明编译支持MySQL/GreatSQL |
| --with-mysql-includes | 指定 MySQL/GreatSQL 的 includes 目录 |
| --with-mysql-libs |  指定 MySQL/GreatSQL 的 libs 目录 |

**4. 运行sysbench，确认可用**

在开始运行sysbench前，要先修改 `LD_LIBRARY_PATH` 环境变量，加上GreatSQL二进制文件包的lib目录：
```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/
```

要不然可能会报错，提示找不到客户端动态库文件：
```log
error while loading shared libraries: libperconaserverclient.so.21: cannot open shared object file: No such file or directory
```

```bash
$ cd /usr/local/sysbench/bin
$ cp -rf ../share/sysbench/* .
$ ldd ./sysbench  #<-- 确认可以找到所有动态库文件

...
        libperconaserverclient.so.21 => /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/lib/libperconaserverclient.so.21 (0x00007f6bbcd9d000)
...
$ ./sysbench --version
sysbench 1.0.20 
```

## sysbench压测模式

sysbench默认支持以下几种OLTP测试方案：

- oltp_delete
- oltp_insert
- oltp_point_select
- oltp_read_only
- oltp_read_write
- oltp_update_index
- oltp_update_non_index
- oltp_write_only

如果有条件，可以把这几种方案全部跑一遍。

此外，Percona在github上开源了一个[sysbench-tpcc项目](https://github.com/Percona-Lab/sysbench-tpcc/)，可利用sysbench模拟TPC-C测试，省去了单独安装TPC-C测试工具的麻烦。作为补充，也可以利用这个项目进行测试。

## 执行压力测试

先修改 `PATH` 环境变量，加上 sysbench 可执行二进制文件所在路径：

```bash
export PATH=$PATH:/usr/local/sysbench/bin
```

**1. 运行以下命令，初始化数据库**

```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua --db-driver=mysql --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-user=x --mysql-password=x --mysql-db=sbtest --report-interval=1 --percentile=99 --rand-type=uniform --tables=16 --table_size=1000000 --threads=16 --time=600 prepare
```

**2. 运行以下命令，执行测试**

```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua --db-driver=mysql --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-user=x --mysql-password=x --mysql-db=sbtest --report-interval=1 --percentile=99 --rand-type=uniform --tables=16 --table_size=1000000 --threads=16 --time=600 run
```

**3. 压测完毕，清除数据**

```bash
cd /usr/local/share/sysbench

sysbench ./oltp_read_write.lua --db-driver=mysql --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-user=x --mysql-password=x --mysql-db=sbtest --report-interval=1 --percentile=99 --rand-type=uniform --tables=16 --table_size=1000000 --threads=16 --time=600 cleanup
```

参数说明：

| 参数| 说明 |
| --- | --- |
| ./oltp_read_write.lua | sysbench内置针对不同场景的测试用例 |
| --db-driver | 连接驱动方式：mysql，连接GreatSQL也是选择这个方式 |
| --mysql-host | 数据库主机地址 |
| --mysql-port | 端口 |
| --mysql-user | 用户名 
| --mysql-password | 密码 |
| --mysql-db | 测试数据库名 |
| --report-interval | 运行期间状态报告频率，单位：秒 |
| --percentile | 打印百分位 rt，默认值为 95(%)，建议改成99(%)|
| --rand-type | 访问数据时使用的随机生成函数。取值可以为 special、uniform、gaussian 或 pareto。 默认值为 special |
| --tables | 压测数据表个数 |
| --table_size | 每个压测数据表的行数 |
| --threads | 并发连接数 |
| --time | 压测总时长，单位：秒，设置为0表示一致运行 |
| --events | 最大请求数量，和 --time 选项二选一即可 |

## 压测参数及建议

压测的目的通常是想找到数据库运行时的性能瓶颈，以及在不断摸索调整参数选项，采用何种设置模式下其性能表现最好。

只有个别时候的压测是为了找到服务器硬件或者数据库的运行极限值，看看在什么情况下能把硬件或数据库"压死"。

不同服务器配置等级，对应不同的压力测试值。

对于压测参数，有几个建议：

1. 并发线程数，可以分别是逻辑CPU数的1/8、1/4、1/2以及跑满。
2. 数据库的`innodb_buffer_pool_size`通常设置不超过物理内存的50%。
3. 测试表个数通常不低于逻辑CPU数的1/2。
4. 测试数据库物理大小通常不低于`innodb_buffer_pool_size`，因为生产环境中的业务数据量基本上都是大于物理内存的。
5. 如果本意就是想测试数据库在非物理I/O为瓶颈场景下的性能表现，则可以减少测试数据量，让数据尽可能加载到buffer pool中。
6. 运行sysbench压测客户机和数据库服务器分开，不要在同一个物理环境内，避免因为sysbench本身也产生性能损耗而影响数据库的性能表现。
7. 单轮测试时长通常不低于10分钟。
8. 每轮测试结束后，预留足够间隔时长，让数据库将所有脏数据、日志都有充分时间刷到磁盘，服务器趋于空负载后再次下一轮压测。
9. 每轮测试开始前，最好能先进行数据预热，即先运行一小段时间压测，让热点数据都加载到buffer pool中之后再正式开始压测。
10. 每轮测试结束后，最好清空所有数据，在下一轮新的测试开始前，重新初始化填充数据。

下面是我常用的sysbench压测参数供参考：
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

## 性能测试报告

sysbench性能压测结束后，打印输出类似以下面的内容：

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
一般要关注几个数据指标：
1. 性能指标TPS，即 **transactions** 这行的值：7268.30。
1. 性能指标QPS，即 **queries** 这行的值：145366.09。
1. 平均时延Lat avg，即 **avg** 这行的值：8.80(ms)。
1. 其他几个时延数据，包括95(%)、99(%)、99.9(%)，也可以用于参考对比的多维度指标。

**参考资料：**
- [利用sysbench执行测试](https://mp.weixin.qq.com/s/QPzlrrt7z0ui1ShtA2_P2Q)
- [GreatSQL vs MySQL性能测试](https://mp.weixin.qq.com/s/tjrz7tJYmfvaYzxruNWMzw)
- [简单测试MySQL 8.0.26 vs GreatSQL 8.0.25的MGR稳定性表现](https://mp.weixin.qq.com/s/mn9Nssh7P1cHGcTfRg0vwg)
- [GreatSQL 开源数据库 & NVIDIA InfiniBand存算分离池化方案：实现高性能分布式部署](https://mp.weixin.qq.com/s/F9804_7H1WiJ6xD0E1AueQ)
- [联合评测 | GreatSQL 开源数据库在 DapuStor Roealsen5 NVMe SSD 中的应用探索](https://mp.weixin.qq.com/s/QrIZ8Fu69Bzq5MvNZwtTww)



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
