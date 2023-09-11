# TPC-H性能测试
---

本文主要介绍采用TPC-H工具对GreatSQL进行性能测试的方法。

## 1. 关于TPC-H

TPC-H是TPC(Transaction Processing Performance Council)组织提供的工具包。主要用于进行OLAP业务场景测试，以评估商业分析中决策支持系统（DSS）的性能。它包含了一整套面向商业的ad-hoc查询和并发数据修改，强调测试的是数据库、平台和I/O性能，关注查询能力。

官网：[http://www.tpc.org/tpch](http://www.tpc.org/tpch)

## 2. 编译安装TPC-H
**1. 下载TPC-H**

访问[TPC-H下载页面](https://www.tpc.org/tpc_documents_current_versions/download_programs/tools-download-request5.asp?bm_type=TPC-H)，下载源码包。

**2. 下载完后，解压缩，并复制 `makefile.suite` 文件**
```
$ unzip 41aa248b-48a5-11ee-8bef-d08e7908bcb1-tpc-h-tool.zip
$ cd TPC-H_Tools_v3.0.1
$ cd dbgen
$ cp makefile.suite Makefile
```

**3. 修改Makefile以适配**
```
$ vim Makefile
CC      = gcc
# Current values for DATABASE are: INFORMIX, DB2, TDAT (Teradata)
#                                  SQLSERVER, SYBASE, ORACLE, VECTORWISE
# Current values for MACHINE are:  ATT, DOS, HP, IBM, ICL, MVS,
#                                  SGI, SUN, U2200, VMS, LINUX, WIN32
# Current values for WORKLOAD are:  TPCH
DATABASE= MYSQL
MACHINE = LINUX
WORKLOAD = TPCH
```

**4. 修改tpcd.h文件，在文件末尾新增几行MYSQL宏定义**
```
$ vim tpcd.h
#ifdef MYSQL
#define GEN_QUERY_PLAN ""
#define START_TRAN "START TRANSACTION"
#define END_TRAN "COMMIT"
#define SET_OUTPUT ""
#define SET_ROWCOUNT "limit %d;\n"
#define SET_DBASE "use %s;\n"
#endif
```

**5. 编译**

执行make编译，编译完毕后会生成两个可执行文件：

- dbgen：数据生成工具。在使用InfiniDB官方测试脚本进行测试时，需要用该工具生成tpch相关表数据。
- qgen：SQL生成工具

## 3. 生成测试数据

可根据实际情况，生成1G、10G、100G等不同量级的测试数据，例如30G：

```Bash
$ ./dbgen -vf -s 30
```
最后会生成数个 .tbl 文件：
```
$ ls -lh
-rw-r--r-- 1 root root 703M Jul 19 15:36 customer.tbl
-rw-r--r-- 1 root root  23G Jul 19 15:36 lineitem.tbl
-rw-r--r-- 1 root root 2.2K Jul 19 15:36 nation.tbl
-rw-r--r-- 1 root root 5.0G Jul 19 15:36 orders.tbl
-rw-r--r-- 1 root root 3.4G Jul 19 15:36 partsupp.tbl
-rw-r--r-- 1 root root 699M Jul 19 15:36 part.tbl
-rw-r--r-- 1 root root  389 Jul 19 15:36 region.tbl
-rw-r--r-- 1 root root  41M Jul 19 15:36 supplier.tbl
```

## 4. 生成TPC-H测试查询SQL
可直接访问[gitee仓库获取相应的SQL](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/tpch/3.0.1/queries)，使用这些SQL测试GreatSQL的InnoDB并行查询特性时，需要自行调整语句中的HINT，例如：
```
$ vim tpch_queries_1.sql

select /*+ PQ(16) */
    l_returnflag,
    l_linestatus,
```
更多关于GreatSQL中InnoDB并行查询特性的介绍详见文档：[InnoDB并行查询](../5-enhance/5-1-highperf-innodb-pq.md)。


也可参考下面的方法手动生成22个TPC-H测试查询SQL：
```
# 生成22个SQL文件
$ for i in $(seq 1 22); do ./qgen -d $i -s 30 > tpch_queries_"$i".sql; done

# 转换文件格式
$ dos2unix *.sql
```
参数 `-s 30` 表示测试数据集大小是30G。

## 5. 新建TPC-H测试数据库，导入测试数据

### 5.1 修改GreatSQL选项，启用InnoDB并行特性

```
$ vim /etc/my.cnf 

...
# 打开并行查询
force_parallel_execute = 1

# 设置并行查询的使用最大内存为8G，请根据实际情况调整设置
parallel_memory_limit = 8G
```
InnoDB并行查询相关选项可在线动态调整，也可在每个SQL中单独添加HINT以启用，不是必须全局开启的。


确认InnoDB并行查询相关选项：

```SQL
greatsql> show global variables like '%parall%';
+----------------------------------+----------------+
| force_parallel_execute           | ON             |
| parallel_cost_threshold          | 1000           |
| parallel_default_dop             | 4              |
| parallel_max_threads             | 64             |
| parallel_memory_limit            | 8589934592     |
| parallel_queue_timeout           | 0              |
+----------------------------------+----------------+
11 rows in set (0.01 sec)
```

### 5.2 初始化TPC-H测试库表
1. 下载 [tpch-create-table.sql文件](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/tpch-create-table.sql)，导入数据库，完成TPC-H测试库表初始化。

文件内容如下：
```
DROP DATABASE IF EXISTS tpch;
CREATE DATABASE IF NOT EXISTS tpch DEFAULT CHARACTER SET latin1;
USE tpch;

create table nation  ( n_nationkey  integer not null,
                n_name       char(25) not null,
                n_regionkey  integer not null,
                n_comment    varchar(152),
                primary key(n_nationkey),
                key nation_fk1 (n_regionkey) );

create table region  ( r_regionkey  integer not null,
                r_name       char(25) not null,
                r_comment    varchar(152),
                primary key(r_regionkey) );

create table part  ( p_partkey     integer not null,
                p_name        varchar(55) not null,
                p_mfgr        char(25) not null,
                p_brand       char(10) not null,
                p_type        varchar(25) not null,
                p_size        integer not null,
                p_container   char(10) not null,
                p_retailprice decimal(15,2) not null,
                p_comment     varchar(23) not null,
                primary key(p_partkey) );

create table supplier ( s_suppkey     integer not null,
                s_name        char(25) not null,
                s_address     varchar(40) not null,
                s_nationkey   integer not null,
                s_phone       char(15) not null,
                s_acctbal     decimal(15,2) not null,
                s_comment     varchar(101) not null,
                primary key(s_suppkey),
                key supplier_fk1 (s_nationkey) );

create table partsupp ( ps_partkey     integer not null,
                ps_suppkey     integer not null,
                ps_availqty    integer not null,
                ps_supplycost  decimal(15,2)  not null,
                ps_comment     varchar(199) not null,
                primary key(ps_partkey,ps_suppkey),
                key partsupp_fk1 (ps_suppkey),
                key partsupp_fk2 (ps_partkey) );


create table customer ( c_custkey     integer not null,
                c_name        varchar(25) not null,
                c_address     varchar(40) not null,
                c_nationkey   integer not null,
                c_phone       char(15) not null,
                c_acctbal     decimal(15,2)   not null,
                c_mktsegment  char(10) not null,
                c_comment     varchar(117) not null,
                primary key(c_custkey),
                key customer_fk1 (c_nationkey) );

create table orders  ( o_orderkey       integer not null,
                o_custkey        integer not null,
                o_orderstatus    char(1) not null,
                o_totalprice     decimal(15,2) not null,
                o_orderdate      date not null,
                o_orderpriority  char(15) not null,
                o_clerk          char(15) not null,
                o_shippriority   integer not null,
                o_comment        varchar(79) not null,
                primary key(o_orderkey),
                key orders_fk1 (o_custkey) );

create table lineitem ( l_orderkey    integer not null,
                l_partkey     integer not null,
                l_suppkey     integer not null,
                l_linenumber  integer not null,
                l_quantity    decimal(15,2) not null,
                l_extendedprice  decimal(15,2) not null,
                l_discount    decimal(15,2) not null,
                l_tax         decimal(15,2) not null,
                l_returnflag  char(1) not null,
                l_linestatus  char(1) not null,
                l_shipdate    date not null,
                l_commitdate  date not null,
                l_receiptdate date not null,
                l_shipinstruct char(25) not null,
                l_shipmode     char(10) not null,
                l_comment      varchar(44) not null,
                primary key(l_orderkey,l_linenumber),
                key lineitem_fk1 (l_orderkey) ,
                key lineitem_fk2 (l_partkey,l_suppkey) );
```

2. 并行导入数据
可以利用GreatSQL提供的并行load data特性并行导入测试数据，提高导入效率：
```
$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/region.tbl' into table region FIELDS TERMINATED BY '|'; analyze table region;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/nation.tbl' into table nation FIELDS TERMINATED BY '|'; analyze table nation;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/supplier.tbl' into table supplier FIELDS TERMINATED BY '|'; analyze table supplier;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/part.tbl' into table part FIELDS TERMINATED BY '|'; analyze table part;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/customer.tbl' into table customer FIELDS TERMINATED BY '|'; analyze table customer;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/partsupp.tbl' into table partsupp FIELDS TERMINATED BY '|'; analyze table partsupp;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/orders.tbl' into table orders FIELDS TERMINATED BY '|'; analyze table orders;" tpch

$ mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/lineitem.tbl' into table lineitem FIELDS TERMINATED BY '|'; analyze table lineitem;" tpch
```

还可以进一步设置并行load data的并行线程数以及分片大小，详情参考文档：[并行load data](../5-enhance/5-1-highperf-parallel-load.md)。

### 5.3 开始TPC-H测试

在开始测试前，先调低 `long_query_time` 的值（甚至可以设置为0），使得可以记录所有TPC-H查询测试请求：
```
# 设置 long_query_time = 1ms
greatsql> set global long_query_time = 0.001;

# 甚至设置为 0，即记录所有请求
#greatsql> set global long_query_time = 0;
```

在前面 **4. 生成TPC-H测试查询SQL** 中已经生成了测试22个测试查询SQL文件，逐一执行这些查询文件，也可以写个小脚本来执行，并分别记录运行耗时：
```
$ cat run-thch.sh
#!/bin/bash
workdir=/data/tpch
cd ${workdir}
MYSQL_CLI="mysql -h$host -P$port -u$user -p'$passwd' -f tpch"

# 第一遍执行，先预热数据
for i in $(seq 1 22)
do
 $MYSQL_CLI < ./queries/tpch_queries_$i.sql
done

# 正式测试，每个查询SQL执行3遍
for i in $(seq 1 22)
do
 for j in $(seq 1 3)
 do

   time_1=`date +%s%N`
	 echo `date  '+[%Y-%m-%d %H:%M:%S]'` "BEGIN RUN TPC-H Q${i} ${j} times" >> ./run-tpch-queries.log 2>&1

	 $MYSQL_CLI < ./queries/tpch_queries_$i.sql >> ./tpch_queries_$i.res 2>&1

	 time_2=`date +%s%N`
	 durtime=`echo $time_2 $time_1 | awk '{printf "%0.2f\n", ($1 - $2) / 1000000000}'`
	 echo `date  '+[%Y-%m-%d %H:%M:%S]'` "TPC-H Q${i} END, COST: ${durtime}s" >> ./run-tpch-queries.log 2>&1
	 echo "" >> ./run-tpch-queries.log 2>&1
	 echo "" >> ./run-tpch-queries.log 2>&1
 done
done
```

在运行查询SQL时，也要观察相关指标：

```SQL
greatsql> show global status like '%PQ%';
+--------------------+-------+
| Variable_name      | Value |
+--------------------+-------+
| PQ_memory_refused  | 0     |
| PQ_memory_used     | 0     |
| PQ_threads_refused | 0     |
| PQ_threads_running | 0     |
+--------------------+-------+
4 rows in set (0.00 sec)

greatsql> show processlist;
greatsql> explain for connection **;
```

## 6. 测试结果
在GreatSQL中引入了InnoDB查询特性，对轻量级TPC-H查询有很好的优化效果，可支持的查询SQL类型也在不断增加中。

关于TPC-H测试结果可参考：[InnoDB并行查询（InnoDB Parallel Query, InnoDB PQ）](../5-enhance/5-1-highperf-innodb-pq.md)。


**参考资料**

- [MySQL TPCH测试工具简要手册](https://imysql.com/2012/12/21/tpch-for-mysql-manual.html)
- [使用TPC-H 进行GreatSQL并行查询测试](https://mp.weixin.qq.com/s/9yyKxzMT4Udh-EbX_HAHsQ)
- [GreatSQL重磅特性，InnoDB并行并行查询优化测试](https://mp.weixin.qq.com/s/_LeEtwJlfyvIlxzLoyNVdA)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
