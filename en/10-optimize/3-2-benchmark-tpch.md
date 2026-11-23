# TPC-H Performance Benchmark
---

This article mainly introduces the method of using the TPC-H tool to benchmark GreatSQL performance.

## About TPC-H

TPC-H is a toolkit provided by the TPC (Transaction Processing Performance Council) organization. It is mainly used for OLAP business scenario testing to evaluate the performance of decision support systems (DSS) in business analysis. It includes a full set of business-oriented ad-hoc queries and concurrent data modifications, emphasizing the testing of database, platform, and I/O performance, with a focus on query capabilities.

Official website: [http://www.tpc.org/tpch](http://www.tpc.org/tpch)

## Compiling and Installing TPC-H

**1. Download TPC-H**

Visit the [TPC-H download page](https://www.tpc.org/tpc_documents_current_versions/download_programs/tools-download-request5.asp?bm_type=TPC-H) and download the source package.

**2. After downloading, decompress it and copy the `makefile.suite` file**

```bash
unzip 41aa248b-48a5-11ee-8bef-d08e7908bcb1-tpc-h-tool.zip
cd TPC-H_Tools_v3.0.1
cd dbgen
cp makefile.suite Makefile
```

**3. Modify the Makefile to adapt**

Referring to the content below, modify the `Makefile` file:
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

**4. Modify the tpcd.h file and add several MYSQL macro definitions at the end of the file**

Referring to the content below, modify the `tpcd.h` file:
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

**5. Compile**

Execute make to compile. After compilation, two executable files are generated:

- dbgen: data generation tool. When testing with the official InfiniDB test script, this tool is needed to generate the tpch-related table data.
- qgen: SQL generation tool

## Generating Test Data

According to the actual situation, test data at different dataset Scale Factor levels such as 1, 10, 100, 1000 can be generated, for example 30:

```bash
./dbgen -vf -s 30
```
Finally, several .tbl files are generated:
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

The [pdbgen.sh script](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pdbgen.sh) can also be used to generate the test dataset. It uses a parallel method, generating multiple file slices for each large table, and its efficiency is at least doubled compared with directly calling `dbgen`. This multi-file slicing method is also more conducive to using the [pload.sh script](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pload.sh) later for more efficient concurrent import.

## Generating TPC-H Test Query SQL

The corresponding SQL can be obtained directly from the [gitee repository](https://gitee.com/GreatSQL/GreatSQL-Doc/tree/master/tpch/3.0.1/queries). These SQL script files can be directly used to test the GreatSQL Rapid Engine, and the corresponding HINTs have already been added, for example:

```sql
-- tpch_queries_1.sql
SELECT /*+ SET_VAR(use_secondary_engine=1) SET_VAR(secondary_engine_cost_threshold=0) */ /*+ Q1 */
    l_returnflag,
    l_linestatus,
...
```

The 22 TPC-H test query SQLs can also be manually generated using the following method:
```bash
# Generate 22 SQL files
for i in $(seq 1 22); do ./qgen -d $i -s 1000 > tpch_queries_"$i".sql; done

# Convert the file format
dos2unix *.sql
```

The parameter `-s 1000` indicates that the test dataset scale factor is 1000. The difference between different scale factors is the condition factor in the 11th query SQL, which is also noted in tpch_queries_11.sql:

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

## Creating the TPC-H Test Database and Importing Test Data

### Initializing the TPC-H Test Tables

1. Download the [tpch-create-table.sql file](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/tpch-create-table.sql), import it into the database, and complete the TPC-H test table initialization.

The file content is as follows:

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
When creating tables, the above SQL script also specifies the secondary engine as Rapid, which facilitates subsequent TPC-H performance testing.

2. Import data in parallel

The [parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md) feature provided by GreatSQL can be used to import test data in parallel, improving import efficiency:
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

The parallel thread count and shard size of parallel LOAD DATA can be further set. For details, refer to the documentation: [Parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md).

As mentioned earlier, the [pdbgen.sh script](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pdbgen.sh) can be used to generate the (multi-file multi-slice style) test dataset, so the [pload.sh script](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/pload.sh) can be correspondingly used to achieve double parallel import on the basis of enabling parallel LOAD DATA, and its efficiency is at least several times higher than native LOAD DATA.

### Starting the TPC-H Test

Before starting the test, first lower the value of `long_query_time` (or even set it to 0), so that all TPC-H query test requests can be recorded:
```sql
-- Set long_query_time = 1ms
SET GLOBAL long_query_time = 0.001;

-- Or even set it to 0, i.e., record all requests
SET GLOBAL long_query_time = 0;
```

In the earlier **4. Generating TPC-H Test Query SQL**, the 22 test query SQL files have been generated. Execute these query files one by one, or write a script to execute them, and record the runtime duration of each respectively:

Edit the script `run-tpch.sh` with the following content:
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

# Each query SQL is executed 5 times, of which the first 2 times are warm-up
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
The latest version of this script can be seen here: [TPC-H automatic test script run-tpch.sh](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/tpch/3.0.1/run-tpch.sh). 

When running the query SQL, related metrics should also be observed:

```sql
greatsql> SHOW GLOBAL STATUS LIKE 'Secondary_engine_execution_count';
+----------------------------------+-------+
| Variable_name                    | Value |
+----------------------------------+-------+
| Secondary_engine_execution_count | 41    |
+----------------------------------+-------+
```
The `Secondary_engine_execution_count` status metric value in the above result is 41, indicating that a total of 41 secondary engine (Rapid) read requests occurred. 

## Test Results

In tests on the unlimited version of GreatSQL 8.0.32-27, when running TPC-H SF100/SF1000 data volume tests with the Rapid Engine, the total durations were 38.016 and 386.195 seconds respectively.

|Test Data Volume | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 | Q12 | Q13 | Q14 | Q15 | Q16 | Q17 | Q18 | Q19 | Q20 | Q21 | Q22 | Total Duration | 
| :---: |  --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TPC-H SF100 | 3.113 | 0.299 | 1.033 | 0.830 | 1.007 | 0.218 | 4.367 | 0.833 | 3.024 | 2.486 | 0.141 | 0.584 | 2.640 | 0.712 | 0.982 | 0.644 | 0.737 | 8.945 | 1.333 | 0.608 | 2.967 | 0.513 | 38.016 |
| TPC-H SF1000 | 3.537 | 3.865 | 4.167 | 22.712 | 4.119 | 0.959 | 50.217 | 3.534 | 31.872 | 15.301 | 0.921 | 2.294 | 10.997 | 2.471 | 11.898 | 3.487 | 27.523 | 108.237 | 4.046 | 10.668 | 60.084 | 3.286 | 386.195 | 

The test machine configuration for the above data is **32C64G, NVMe PCIe SSD 3.8T**.

For more detailed information about GreatSQL's TPC-H testing, refer to: [GreatSQL TPC-H Performance Benchmark Report](./3-3-benchmark-greatsql-tpch-report.md).

The above test method can also be used to test the TPC-H performance of the Turbo Engine yourself. For the usage of the Turbo Engine, refer to: [Turbo Engine](../5-enhance/5-1-highperf-turbo-engine.md).

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
