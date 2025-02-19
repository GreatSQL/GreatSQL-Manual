# TPC-H性能测试
---

本文主要介绍采用 TPC-H 工具对 GreatSQL 进行性能测试的方法。

## 关于TPC-H

TPC-H是TPC(Transaction Processing Performance Council)组织提供的工具包。主要用于进行OLAP业务场景测试，以评估商业分析中决策支持系统（DSS）的性能。它包含了一整套面向商业的ad-hoc查询和并发数据修改，强调测试的是数据库、平台和I/O性能，关注查询能力。

官网：[http://www.tpc.org/tpch](http://www.tpc.org/tpch)

## 编译安装TPC-H

**1. 下载TPC-H**

访问[TPC-H下载页面](https://www.tpc.org/tpc_documents_current_versions/download_programs/tools-download-request5.asp?bm_type=TPC-H)，下载源码包。

**2. 下载完后，解压缩，并复制 `makefile.suite` 文件**

```bash
unzip 41aa248b-48a5-11ee-8bef-d08e7908bcb1-tpc-h-tool.zip
cd TPC-H_Tools_v3.0.1
cd dbgen
cp makefile.suite Makefile
```

**3. 修改Makefile以适配**

参考下方内容，修改 `Makefile` 文件：
```ini
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

参考下方内容，修改 `tpcd.h` 文件：
```ini
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

## 生成测试数据

可根据实际情况，生成 1、10、100、1000 等不同数据集比例因子（Scale Factor）级别的测试数据，例如 30：

```bash
./dbgen -vf -s 30
```
最后会生成数个 .tbl 文件：
```bash
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

还可以利用 [pdbgen.sh脚本](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pdbgen.sh) 来生成测试数据集，它采用并行的方法，每个大表生成多个文件切片，其效率相比直接调用 `dbgen` 至少可以提升一倍。这种多文件切片的方式，也更有利于后续采用 [pload.sh脚本](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pload.sh)) 实现更高效并发导入。

## 生成TPC-H测试查询SQL

可直接访问[gitee仓库获取相应的SQL](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/tpch/3.0.1/queries)，这些 SQL 脚本文件可直接用于测试 GreatSQL 的 Rapid 引擎，已经加上了相应的 HINT，例如：

```sql
-- tpch_queries_1.sql
SELECT /*+ SET_VAR(use_secondary_engine=1) SET_VAR(secondary_engine_cost_threshold=0) */ /*+ Q1 */
    l_returnflag,
    l_linestatus,
...
```

也可参考下面的方法手动生成22个TPC-H测试查询SQL：
```bash
# 生成22个SQL文件
for i in $(seq 1 22); do ./qgen -d $i -s 1000 > tpch_queries_"$i".sql; done

# 转换文件格式
dos2unix *.sql
```

参数 `-s 1000` 表示测试数据集比例因子是 1000，不同比例因子的区别在于第 11 个查询SQL中的条件因子，在 tpch_queries_11.sql 中也已注明：

```sql
-- cat tpch_queries_11.sql
...
        SELECT
            sum(ps_supplycost * ps_availqty) * 0.0001000000 /* SF1 */
            /* sum(ps_supplycost * ps_availqty) * 0.0000100000 /* SF10 */
            /* sum(ps_supplycost * ps_availqty) * 0.0000010000 /* SF100 */
            /* sum(ps_supplycost * ps_availqty) * 0.0000001000 /* SF1000 */
        FROM
...
```

## 新建TPC-H测试数据库，导入测试数据

### 初始化TPC-H测试库表

1. 下载 [tpch-create-table.sql文件](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/tpch-create-table.sql)，导入数据库，完成TPC-H测试库表初始化。

文件内容如下：

```sql
-- DROP DATABASE IF EXISTS tpch;
-- CREATE DATABASE IF NOT EXISTS tpch DEFAULT CHARACTER SET latin1;
-- USE tpch;

drop table if exists nation;
create table nation  ( n_nationkey  bigint not null,
                n_name       char(25) not null,
                n_regionkey  bigint not null,
                n_comment    varchar(152),
                primary key(n_nationkey),
                key nation_fk1 (n_regionkey) ) secondary_engine = rapid;

drop table if exists region;
create table region  ( r_regionkey  bigint not null,
                r_name       char(25) not null,
                r_comment    varchar(152),
                primary key(r_regionkey) ) secondary_engine = rapid;

drop table if exists part;
create table part  ( p_partkey     bigint not null,
                p_name        varchar(55) not null,
                p_mfgr        char(25) not null,
                p_brand       char(10) not null,
                p_type        varchar(25) not null,
                p_size        integer not null,
                p_container   char(10) not null,
                p_retailprice decimal(15,2) not null,
                p_comment     varchar(23) not null,
                primary key(p_partkey) ) secondary_engine = rapid;

drop table if exists supplier;
create table supplier ( s_suppkey     bigint not null,
                s_name        char(25) not null,
                s_address     varchar(40) not null,
                s_nationkey   bigint not null,
                s_phone       char(15) not null,
                s_acctbal     decimal(15,2) not null,
                s_comment     varchar(101) not null,
                primary key(s_suppkey),
                key supplier_fk1 (s_nationkey) ) secondary_engine = rapid;

drop table if exists partsupp;
create table partsupp ( ps_partkey     bigint not null,
                ps_suppkey     bigint not null,
                ps_availqty    integer not null,
                ps_supplycost  decimal(15,2)  not null,
                ps_comment     varchar(199) not null,
                primary key(ps_partkey,ps_suppkey),
                key partsupp_fk1 (ps_suppkey),
                key partsupp_fk2 (ps_partkey) ) secondary_engine = rapid;


drop table if exists customer;
create table customer ( c_custkey     bigint not null,
                c_name        varchar(25) not null,
                c_address     varchar(40) not null,
                c_nationkey   bigint not null,
                c_phone       char(15) not null,
                c_acctbal     decimal(15,2)   not null,
                c_mktsegment  char(10) not null,
                c_comment     varchar(117) not null,
                primary key(c_custkey),
                key customer_fk1 (c_nationkey) ) secondary_engine = rapid;

drop table if exists orders;
create table orders  ( o_orderkey       bigint not null,
                o_custkey        bigint not null,
                o_orderstatus    char(1) not null,
                o_totalprice     decimal(15,2) not null,
                o_orderdate      date not null,
                o_orderpriority  char(15) not null,
                o_clerk          char(15) not null,
                o_shippriority   integer not null,
                o_comment        varchar(79) not null,
                primary key(o_orderkey),
                key orders_fk1 (o_custkey) ) secondary_engine = rapid;

drop table if exists lineitem;
create table lineitem ( l_orderkey    bigint not null,
                l_partkey     bigint not null,
                l_suppkey     bigint not null,
                l_linenumber  bigint not null,
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
                key lineitem_fk2 (l_partkey,l_suppkey) ) secondary_engine = rapid;
```
上述 SQL 脚本在建表时，同时指定了辅助引擎为 Rapid，便于后续进行 TPC-H 性能测试。

2. 并行导入数据

可以利用GreatSQL提供的 [并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md) 特性并行导入测试数据，提高导入效率：
```bash
mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/region.tbl' into table region FIELDS TERMINATED BY '|'; analyze table region;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/nation.tbl' into table nation FIELDS TERMINATED BY '|'; analyze table nation;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/supplier.tbl' into table supplier FIELDS TERMINATED BY '|'; analyze table supplier;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/part.tbl' into table part FIELDS TERMINATED BY '|'; analyze table part;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/customer.tbl' into table customer FIELDS TERMINATED BY '|'; analyze table customer;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/partsupp.tbl' into table partsupp FIELDS TERMINATED BY '|'; analyze table partsupp;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/orders.tbl' into table orders FIELDS TERMINATED BY '|'; analyze table orders;" tpch

mysql -f -e "load /*+ SET_VAR(gdb_parallel_load=ON) */ data infile '/data/tpch/data/lineitem.tbl' into table lineitem FIELDS TERMINATED BY '|'; analyze table lineitem;" tpch
```

还可以进一步设置并行 LOAD DATA 的并行线程数以及分片大小，详情参考文档：[并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)。

前面提到，可以使用 [pdbgen.sh脚本](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pdbgen.sh) 生成（多文件多切片式的）测试数据集，因此可以相应地使用 [pload.sh脚本](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pload.sh) 在已经开启 并行LOAD DATA 的基础上，实现双重并行导入，其效率相对原生的 LOAD DATA 至少可提升数倍。

### 开始TPC-H测试

在开始测试前，先调低 `long_query_time` 的值（甚至可以设置为0），使得可以记录所有TPC-H查询测试请求：
```sql
-- 设置 long_query_time = 1ms
SET GLOBAL long_query_time = 0.001;

-- 甚至设置为 0，即记录所有请求
SET GLOBAL long_query_time = 0;
```

在前面 **4. 生成TPC-H测试查询SQL** 中已经生成了测试22个测试查询SQL文件，逐一执行这些查询文件，也可以写个脚本来执行，并分别记录运行耗时：

编辑脚本 `run-tpch.sh`，内容如下所示：
```bash
#!/bin/bash
workdir=/data/tpch
tpchdb="tpch"
host="172.16.16.10"
port="3306"
user="tpch"
passwd="tpch"
logdir="tpch-runlog-`date +%Y%m%d`"
sleeptime=5

cd ${workdir}
mkdir -p ${logdir}
MYSQL_CLI="mysql -h"${host}" -P"${port}" -u"${user}" -p"${passwd}" -f ${tpchdb}"

# 每个查询SQL执行5遍，其中前2遍是预热
for i in $(seq 1 22)
do
 for j in $(seq 1 5)
 do
   if [ ${j} -le 2 ] ; then
     time_1=`date +%s%N`

     $MYSQL_CLI < ./queries/tpch_queries_$i.sql > /dev/null 2>&1

     time_2=`date +%s%N`
     durtime=`echo $time_2 $time_1 | awk '{printf "%0.3f\n", ($1 - $2) / 1000000000}'`

     echo "tpch_queries_$i.sql warmup ${j} times END, COST: ${durtime}s"
   else
     time_1=`date +%s%N`
     echo `date  '+[%Y-%m-%d %H:%M:%S]'` "BEGIN RUN TPC-H Q${i} ${j} times" >> ./${logdir}/run-tpch-queries.log 2>&1

     $MYSQL_CLI < ./queries/tpch_queries_$i.sql >> ./${logdir}/tpch_queries_${i}_${j}.res 2>&1

     time_2=`date +%s%N`
     durtime=`echo $time_2 $time_1 | awk '{printf "%0.3f\n", ($1 - $2) / 1000000000}'`
     echo `date  '+[%Y-%m-%d %H:%M:%S]'` "TPC-H Q${i} END, COST: ${durtime}s" >> ./${logdir}/run-tpch-queries.log 2>&1
     echo "RUN TPC-H Q${i} ${j} times END, COST: ${durtime}s"
     echo "" >> ./${logdir}/run-tpch-queries.log 2>&1
     echo "" >> ./${logdir}/run-tpch-queries.log 2>&1
   fi

   echo "sleeping for ${sleeptime} seconds"
   sleep ${sleeptime}
 done
done
```
这个脚本最新版本可以看这里 [TPC-H 自动测试脚本 run-tpch.sh](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/run-tpch.sh)。 

在运行查询SQL时，也要观察相关指标：

```sql
greatsql> SHOW GLOBAL STATUS LIKE 'Secondary_engine_execution_count';
+----------------------------------+-------+
| Variable_name                    | Value |
+----------------------------------+-------+
| Secondary_engine_execution_count | 41    |
+----------------------------------+-------+
```
上述结果中的 `Secondary_engine_execution_count` 状态指标值为 41，表示共发生了 41 次辅助引擎（Rapid）的读取请求。 

## 测试结果

在对GreatSQL 8.0.32-27未限制版本的测试中，利用Rapid引擎运行TPC-H SF100/SF1000数据量级测试时，总耗时分别为：38.016和386.195秒。

|测试数据量 | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 | Q12 | Q13 | Q14 | Q15 | Q16 | Q17 | Q18 | Q19 | Q20 | Q21 | Q22 | 总耗时 | 
| :---: |  --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TPC-H SF100 | 3.113 | 0.299 | 1.033 | 0.830 | 1.007 | 0.218 | 4.367 | 0.833 | 3.024 | 2.486 | 0.141 | 0.584 | 2.640 | 0.712 | 0.982 | 0.644 | 0.737 | 8.945 | 1.333 | 0.608 | 2.967 | 0.513 | 38.016 |
| TPC-H SF1000 | 3.537 | 3.865 | 4.167 | 22.712 | 4.119 | 0.959 | 50.217 | 3.534 | 31.872 | 15.301 | 0.921 | 2.294 | 10.997 | 2.471 | 11.898 | 3.487 | 27.523 | 108.237 | 4.046 | 10.668 | 60.084 | 3.286 | 386.195 | 

上述数据的测试机配置为 **32C64G、NVMe PCIe SSD 3.8T**。

更多关于 GreatSQL 的 TPC-H 测试的详细信息可参考：[GreatSQL TPC-H 性能测试报告](./3-3-benchmark-greatsql-tpch-report.md)。

也可以采用上述测试方法，自行测试Turbo引擎的TPC-H性能表现，关于Turbo引擎的使用方法参考：[Turbo引擎](../5-enhance/5-1-highperf-turbo-engine.md)。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
