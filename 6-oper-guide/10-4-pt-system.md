# Percona Toolkit 系统类

::: tip 小贴士
`$`为命令提示符、`greatsql>`为GreatSQL数据库提示符。
:::

## 系统类

在Percona Toolkit中系统类共有以下工具

- `pt-diskstats`：查看系统磁盘状态
- `pt-fifo-split`：模拟切割文件并输出
- `pt-ioprofile`：查询进程 I/O 并打印一个 I/O 活动表
- `pt-stalk`：出现问题时，收集诊断数据
- `pt-sift`：浏览由 pt-stalk 创建的文件
- `pt-summary`：收集和显示系统概况

## pt-diskstats

### 概要

类似于 iostat 命令，不过它比 iostat 输出的更加详细一点

**用法**

```bash
pt-diskstats [OPTIONS] [FILES]
```

打印 GNU/Linux 的磁盘 I/O 统计信息。它有点类似于iostat，但它是交互式的并且更详细。且可以分析从另一台机器收集的样本。

### 选项

该工具所有选项如下

| 参数                | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| --columns-regex     | 打印与此 Perl 正则表达式匹配的列                             |
| --config            | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --devices-regex     | 打印与此 Perl 正则表达式匹配的设备                           |
| --group-by          | 分组依据模式：`disk`,`sample`,`all`                          |
| --headers           | 如果存在 `group` ，则每个样本将由空行分隔，除非样本只有一行  |
| --help              | 显示帮助                                                     |
| --interval          | 在交互模式下，等待 N 秒后再打印到屏幕。                      |
| --iterations        | 当处于交互模式时，在 N 个样本后停止。默认情况下永远运行      |
| --sample-time       | 在 `group-by sample`模式下，每组包含 N 秒的样本              |
| --save-samples      | 用于保存 diskstats 样本的文件                                |
| --show-inactive     | 显示不活动的设备                                             |
| --show-timestamps   | 在`#ts`列中显示“HH:MM:SS”时间戳                              |
| --version           | 显示版本                                                     |
| --[no]version-check | 版本检查                                                     |

### 最佳实践

注意！在较新的 Linux 内核版本中，为磁盘统计信息返回的字段量更改为 20 个，并导致 pt-diskstat 在这些系统上无法提供任何输出。

※[该问题详见](https://perconadev.atlassian.net/jira/software/c/projects/PT/issues/PT-2313?jql=project%20%3D%20%22PT%22%20AND%20text%20~%20%22diskstats%22%20ORDER%20BY%20created%20DESC)

※[解决方法](https://github.com/percona/percona-toolkit/pull/526/files#diff-c3ecedaa384eecb55bd8fdb37456a89a3dc45a41588ef1ebe231120e965942d8R2247)

#### 直接采集分析

::: tip 小贴士
`--devices-regex`指定设备名称，根据自身设备而修改
:::

```bash
pt-diskstats --interval=1 --iterations=10 --devices-regex=sda --show-timestamps
```
::: details 查看运行结果
```bash
$ pt-diskstats --interval=1 --iterations=10 --devices-regex=sda --show-timestamps
     #ts device    rd_s rd_avkb rd_mb_s rd_mrg rd_cnc   rd_rt    wr_s wr_avkb wr_mb_s wr_mrg wr_cnc   wr_rt busy in_prg    io_s  qtime stime
14:08:26 sda        0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
14:08:26 sda1       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
14:08:26 sda2       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
14:08:26 sda3       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
```
:::


- `ts`：在`--show-timestamps`操作时候的时间戳。但如果在group-by为all模式下此列显示时间戳偏移量，如果在sample模式下表示分组到每个样本的总时间跨度
- `device`：设备名称
- `rd_s`：每秒的平均读取次数
- `rd_avkb`：读取的平均大小单位kb
- `rd_mb_s`：每秒读取的平均兆字节数
- `rd_mrg`：在发送到物理设备之前在队列调度程序中合并在一起的读取请求的百分比
- `rd_cnc`：根据利特尔定律计算得出的读取操作的平均并发度
- `rd_rt`：读取操作的平均响应时间，以毫秒为单位
- `wr_s`：每秒平均写入次数
- `wr_avkb`：平均写入大小
- `wr_mb_s`：每秒平均写入的平均大小
- `wr_mrg`：发送到物理设备之前，在队列调度程序中合并在一起的写入请求的百分比
- `wr_cnc`：写入操作的平均并发量
- `wr_rt`：写入操作的平均相应时间
- `busy`：磁盘繁忙程度
- `in_prg`：正在进行的请求数
- `io_s`：物理设备的平均吞吐量，以每秒 I/O 操作数 (IOPS) 为单位
- `qtime`：平均排队时间
- `stime`：平均服务时间

#### 采集分析

先收集 /proc/diskstats 的信息，存到一个文件里面，采集一段时候后再通过 pt-diskstats 来计算。这样的好处是，可以了解该段时间内的整体 I/O 性能，而不是瞬间的性能指标

使用该 Shell 脚本

::: tip 小贴士
采集时间可以修改 LOOPS 参数，采集间隔修改 INTERVAL 参数即可
:::

```ini
$ vim collection.sh

#!/bin/bash
INTERVAL=1
LOOPS=10
INT=1
echo `date`
while (( $INT <= $LOOPS )) do Sleep=$(date +%s.%N | awk "{print $INTERVAL - (\$1 % $INTERVAL)}") 
    sleep $Sleep 
    date +"TS %s.%N %F %T" >> diskstats-samples.txt
    cat /proc/diskstats >> diskstats-samples.txt
    let INT=INT+1
done
echo `date`
```

授权该 Shell 脚本

```bash
chmod 755 collection.sh
```

运行该 Shell 脚本
```bash
sh collection.sh
```

在脚本文件的同一个目录下会生成`diskstats-samples.txt`文本文件，接着使用 pt-diskstats 工具分析即可

```bash
pt-diskstats --group-by disk diskstats-samples.txt
```
::: details 查看运行结果
```bash
$ pt-diskstats --group-by disk diskstats-samples.txt
  #ts device    rd_s rd_avkb rd_mb_s rd_mrg rd_cnc   rd_rt    wr_s wr_avkb wr_mb_s wr_mrg wr_cnc   wr_rt busy in_prg    io_s  qtime stime
 {19} sda        0.0     0.0     0.0     0%    0.0     0.0     0.4     6.8     0.0     8%    0.0     0.3   0%      0     0.4    0.2   0.2
 {19} sda3       0.0     0.0     0.0     0%    0.0     0.0     0.3     7.9     0.0    10%    0.0     0.3   0%      0     0.3    0.2   0.1
 {19} dm-0       0.0     0.0     0.0     0%    0.0     0.0     0.4     7.2     0.0     0%    0.0     0.5   0%      0     0.4    0.2   0.2
```
:::


不同点是ts列显示包含在输出行中的样本数，其它字段意思和上方一致

**查看该段时间内 sda 的 iops 变化情况**

```bash
pt-diskstats --group-by sample --devices-regex sda --columns-regex io_s diskstats-samples.txt
```

::: details 查看运行结果
```bash
$ pt-diskstats --group-by sample --devices-regex sda --columns-regex io_s diskstats-samples.txt

 #ts device    io_s
  0.0 {4}      156.6
......中间省略部分
 55.2 {4}        0.0
 56.2 {4}        0.0
```
:::

**查看 sda-sdb 两块盘在采集的时间段内的整体 I/O 平均负载情况**

```bash
pt-diskstats --group-by disk --devices-regex 'sd[a-c]' diskstats-samples.txt
```

**小技巧**

在使用 pt-diskstats 工具在线分析的时候按 “？” 键，将调出交互式帮助菜单，其中显示哪些键控制程序

```bash
$ pt-diskstats --devices-regex=sda --show-timestamps
15:08:06 sda        0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
15:08:06 sda1       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
15:08:06 sda2       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
15:08:06 sda3       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
-- 此时输入'?'会弹出提示
   You can control this program by key presses:
   ------------------- Key ------------------- ---- Current Setting ----
   A, D, S) Set the group-by mode              A
   c) Enter a Perl regex to match column names .
   /) Enter a Perl regex to match disk names   sda
   z) Set the sample size in seconds           1
   i) Hide inactive disks                      yes
   p) Pause the program
   q) Quit the program
   space) Print headers
   ------------------- Press any key to continue -----------------------
```

## pt-fifo-split

### 概要

可以用做切割大文件，切割完成后再分批导入 GreatSQL 数据库中，不会造成效率低以及主从延迟

**用法**

```bash
pt-fifo-split [OPTIONS] [FILE]
```

### 选项

该工具所有选项如下

| 参数         | 含义                                                         |
| ------------ | ------------------------------------------------------------ |
| --config     | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --fifo       | 可以从中读取行的 fifo 的名称                                 |
| --force      | 如果 fifo 已存在，请将其删除，然后重新创建                   |
| --help       | 显示帮助                                                     |
| --lines      | 每个块中要读取的行数                                         |
| --offset     | 从第 N 行开始。如果参数为 0，则所有行都打印到 fifo。如果为 1，则从第一行开始打印行（与 0 完全相同）。如果为 2，则跳过第一行，并将第二行及后续行打印到 fifo |
| --pid        | 创建给定的 PID 文件                                          |
| --statistics | 打印块之间的统计信息                                         |
| --version    | 显示版本                                                     |

### 最佳实践

用命令`seq 1 1000000 > hugefile.txt `向 hugefile.txt文件 插入一百万行数据

```bash
$ wc -l hugefile.txt           
1000000 hugefile.txt
```

脚本文件 fifo_get.sh 获取切割后的数据

```shell
$ vim fifo_get.sh

#!/bin/bash
filename=/tmp/hugefile
n=1
while [ -e /tmp/pt-fifo-split ];
do 
        cat /tmp/pt-fifo-split > "$filename"_"$n".txt ;
        let n++
done
```

使用 pt-fifo-split 工具切割

```bash
pt-fifo-split --lines 10000 --statistics hugefile.txt
```
::: details 查看运行结果
```bash
$ pt-fifo-split --lines 10000 --statistics hugefile.txt
chunks     lines  time  overall  current
    1     10000    48 208.33 208.33
    2     20000    48 416.67 10000.00
    3     30000    48 625.00 10000.00
    4     40000    48 833.33 10000.00
    5     50000    48 1041.67 10000.00
......下方省略
```
:::


使用脚本工具获取数据

```bash
$ chmod 755 fifo_get.sh
$ sh fifo_get.sh 
$ ls /tmp/hugefile_* 2>/dev/null | wc -l
100
```

接下来就可以把这些切割后的文件导入到 GreatSQL 数据库中了，此时可以用 GreatSQL 的并行LOAD DATA特性，最大导入的加速比大概为20倍

使用 LOAD 语句增加 HINT 启用

```sql
greatsql> LOAD /*+ SET_VAR(gdb_parallel_load=ON) SET_VAR(gdb_parallel_load_chunk_size=65536) SET_VAR(gdb_parallel_load_workers=16) */
DATA INFILE 'hugefile.txt' INTO TABLE t1;
```

此处可详见：[GreatSQL 的并行 LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md)

::: tip 小贴士
当然也可以使用`split`命令来做切割 `split -l 1000 hugefile.txt chunk_`
:::

## pt-ioprofile

### 概要

主要用于监视和分析 GreatSQL/MySQL 进程的 I/O 活动。通过 `strace` 和 `lsof` 来跟踪进程的 I/O 情况，并打印出相关的表文件和活动 I/O 信息。

**用法**

```bash
pt-ioprofile [OPTIONS] [FILE]
```
::: tip 小贴士
建议使用root权限，可以收集到更多的信息
:::
### 选项

该工具所有选项如下

| 参数              | 含义                                          |
| ----------------- | --------------------------------------------- |
| --aggregate       | 聚合函数，`sum` 或 `avg`                      |
| --cell            | 指定单元格的内容，有效值为count、sizes、times |
| --group-by        | 分组项，有效值为all、filename、pid            |
| --help            | 显示帮助                                      |
| --profile-pid     | 要分析的 PID 会覆盖 `--profile-process`       |
| --profile-process | 要分析的进程名称                              |
| --run-time        | 分析的时间长度                                |
| --save-samples    | 保存样本的文件名                              |
| --version         | 显示版本                                      |

### 最佳实践

直接使用即可，默认`--cell`为times既I/O操作的时间，默认监听30秒的mysqld进程，并给出30秒内的分析结果

::: tip 小贴士
是要等待30秒后给出分析结果，并不是实时出结果
:::

```bash
pt-ioprofile
```
::: details 查看运行结果
```bash
$ pt-ioprofile
Wed Apr  3 02:16:37 PM CST 2024
Tracing process ID 657147
     total      write      lseek  ftruncate filename
  0.000468   0.000232   0.000142   0.000094 /data/GreatSQL/innodb_status.657147
  0.000184   0.000000   0.000184   0.000000 /tmp/#13526
  0.000180   0.000000   0.000180   0.000000 /tmp/#13525
```
:::

可指定`--cell`为sizes既I/O操作的大小

```bash
pt-ioprofile --cell=sizes
```
::: details 查看运行结果
```bash
$ pt-ioprofile --cell=sizes                                                        
Wed Apr  3 02:11:09 PM CST 2024
Tracing process ID 657147
     total      write      lseek  ftruncate filename
     53620      26810      26810          0 /data/GreatSQL/innodb_status.657147
      5074          0       5074          0 /tmp/#13525
      2024          0       2024          0 /tmp/#13526
```
:::


可指定`--cell`为count既I/O操作的次数

```bash
pt-ioprofile --cell=count 
```
::: details 查看运行结果
```bash
$ pt-ioprofile --cell=count 
Wed Apr  3 02:15:18 PM CST 2024
Tracing process ID 657147
     total      write      lseek  ftruncate filename
         7          4          2          1 /data/GreatSQL/innodb_status.657147
         1          0          1          0 /tmp/#13526
         1          0          1          0 /tmp/#13525
```
:::

## pt-stalk

### 概要

pt-stalk 工具的功能是出现问题时收集 GreatSQL 数据库和系统的诊断信息，可以解决更细粒度的现场故障采集

**用法**

```bash
pt-stalk [OPTIONS]
```

::: tip 小贴士
建议使用root权限，可以收集到更多的信息
:::

### 选项

该工具所有选项如下

| 参数               | 含义                                                         |
| ------------------ | ------------------------------------------------------------ |
| --ask-pass         | 连接 MySQL/GreatSQL 时提示输入密码                           |
| --collect          | 当故障发生时收集诊断数据，可使用 `--no-collect` 使工具只监视系统不收集数据 |
| --collect-gdb      | 收集 GDB 堆栈跟踪                                            |
| --collect-oprofile | 收集 oprofile 数据                                           |
| --collect-strace   | 收集跟踪数据                                                 |
| --collect-tcpdump  | 收集 tcpdump 数据                                            |
| --config           | 读取以逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --cycles           | 在触发`--collect`之前，`--variable`必须大于`--threshold`多少次 |
| --daemonize        | 守护进程，后台运行                                           |
| --defaults-file    | 只从给定文件中读取 MySQL/GreatSQL 选项                             |
| --dest             | 保存`--collect`的诊断数据的位置，不要选择和GreatSQL同一个目录，最好是独立的目录，因为该工具会删除目录下超过一定日期的文件，可能会造成误删。默认目录`/var/lib/pt-stalk` |
| --disk-bytes-free  | 如果磁盘的可用空间少于次值的设定就不使用`--collect`。防止磁盘被该工具的诊断数据填满 |
| --disk-pct-free    | 如果磁盘的可用空间少于次值的百分比就不使用`--collect` 。这可以防止该工具用诊断数据填充磁盘，和`--disk-bytes-free`差不多，一个是具体值一个是百分比 |
| --function         | 设置触发条件，默认值监视`SHOW GLOBAL STATUS`，也可以通过此参数修改为`SHOW PROCESSLIST` |
| --help             | 显示帮助                                                     |
| --host             | 连接到主机                                                   |
| --interval         | 检查触发器是否为 true 的频率                                 |
| --iterations       | 收集多少次，默认是一直运行                                   |
| --log              | 守护进程时将所有输出打印到此文件                             |
| --match            | 监测`SHOW PROCESSLIST`时使用的模式                           |
| --notify-by-email  | 发送收集信息到指定的邮箱中                                   |
| --password         | 用于连接的密码                                               |
| --pid              | 创建给定的 PID 文件                                          |
| --plugin           | 加载插件以连接到该工具并扩展其功能                           |
| --mysql-only       | 仅触发 MySQL/GreatSQL 相关的捕获，忽略所有其他                     |
| --port             | 用于连接的端口号                                             |
| --prefix           | 诊断样本的文件名前缀，默认情况下，同一`--collect`实例创建的所有文件都具有基于当前本地时间的时间戳前缀，例如 `2011_12_06_14_02_02` ，即 2011 年 12 月 6 日 14:02:02 |
| --retention-count  | 保留最后 N 次运行的数据。如果 N > 0，程序将保留最后 N 次运行的数据，并删除较旧的数据 |
| --retention-size   | 保留最多`–retention-size MB`的数据                           |
| --retention-time   | 保留收集样本的天数                                           |
| --run-time         | 触发多长时间的 `--collect` 诊断数据，默认30秒                |
| --sleep            | `--collect` 之后要停止多久，可以防止该工具连续触发           |
| --sleep-collect    | 收集循环周期之间休眠多长时间                                 |
| --socket           | 用于连接的套接字文件                                         |
| --stalk            | 观察服务器并等待触发发生                                     |
| --system-only      | 仅触发与操作系统相关的捕获，忽略所有其他捕获                 |
| --threshold        | `--variable` 的最大可接受值                                  |
| --user             | 登录的用户                                                   |
| --variable         | 要与 `--threshold` 进行比较的变量                            |
| --verbose          | 运行时打印或多或少的信息                                     |
| --version          | 显示版本                                                     |

### 最佳实践

#### 监控`SHOW GLOBAL STATUS`中的状态值

例如监控`Threads_running`状态值，如果`Threads_running`状态值连续5次超过100，这触发收集主机和数据库的信息

```bash
pt-stalk --function status --variable Threads_running --cycles 5 --threshold 500 --daemonize --user=root --password=
```

有以下三种触发方式

- status
  通过监控`SHOW GLOBAL STATUS`的参数值，`--variable`参数指定的监控的具体是哪个参数，默认`Threads_running`

- processlist

  通过监控`SHOW FULL PROCESSLIST`命令的结果，`--variable`参数指定列的值和`--match`指定值相匹配的次数，如：State列，匹配值：statistics

- 自定义脚本

#### 立即收集主机和数据库信息

不等待触发发生，立即收集在60秒内主机和数据库的信息，等待180秒后结束自动退出

```bash
pt-stalk --no-stalk --run-time=60 --iterations=1 --user=root --password=
```

查看默认诊断数据存放的位置`/var/lib/pt-stalk`

```bash
$ ls /var/lib/pt-stalk                            
2024_04_07_14_47_10-df              2024_04_07_14_47_10-lsof            2024_04_07_14_47_10-numastat     2024_04_07_14_47_10-ps-locks-transactions
2024_04_07_14_47_10-disk-space      2024_04_07_14_47_10-meminfo         2024_04_07_14_47_10-opentables1  2024_04_07_14_47_10-slabinfo
2024_04_07_14_47_10-diskstats       2024_04_07_14_47_10-mpstat          2024_04_07_14_47_10-opentables2  2024_04_07_14_47_10-slave-status
2024_04_07_14_47_10-hostname        2024_04_07_14_47_10-mpstat-overall  2024_04_07_14_47_10-output       2024_04_07_14_47_10-sysctl
2024_04_07_14_47_10-innodbstatus1   2024_04_07_14_47_10-mutex-status1   2024_04_07_14_47_10-pmap         2024_04_07_14_47_10-top
2024_04_07_14_47_10-innodbstatus2   2024_04_07_14_47_10-mutex-status2   2024_04_07_14_47_10-processlist  2024_04_07_14_47_10-trigger
2024_04_07_14_47_10-interrupts      2024_04_07_14_47_10-mysqladmin      2024_04_07_14_47_10-procstat     2024_04_07_14_47_10-variables
2024_04_07_14_47_10-iostat          2024_04_07_14_47_10-netstat         2024_04_07_14_47_10-procvmstat   2024_04_07_14_47_10-vmstat
2024_04_07_14_47_10-iostat-overall  2024_04_07_14_47_10-netstat_s       2024_04_07_14_47_10-ps           2024_04_07_14_47_10-vmstat-overall
```

有很多采集的文件，从文件名可以看出来，命名方式就是以命令来命名的。同时也可以用`pt-sift`工具来查看产生的文件内容

## pt-sift

### 概要

用于分析、查看`pt-stalk`命令产生的文件内容，并生产概要信息，然后通过输入不同的命令查看不同的内容。如，输入`m`,查看的是`SHOW STATUS`命令的内容。

**用法**

```bash
pt-sift FILE|PREFIX|DIRECTORY
```

这是一个交互式的命令

### 选项

该工具所有选项如下

| 参数      | 含义     |
| --------- | -------- |
| --help    | 显示帮助 |
| --version | 显示版本 |

### 最佳实践

#### 显示所有pt-stalk收集的信息

可以直接使用`pt-sift`命令，并加上`pt-stalk`工具收集的信息存放地址

```bash
pt-sift /var/lib/pt-stalk
```

此时会跳出一个交互式的命令行，可以通过输入?来查看帮助信息，通过输入不同的命令显示不同的内容

- d：设置在样本磁盘性能统计信息上启动 pt-diskstats 工具的操作
- i：设置在 less 中查看第一个 INNODB STATUS 样本的操作
- m：使用 pt-mext 工具并排显示 SHOW STATUS 计数器的前 4 个样本
- n：以两种方式汇总 netstat 数据的第一个样本：按原始主机和按连接状态
- j：选择下一个时间戳作为活动样本
- k：选择前一个时间戳作为活动样本
- q：退出程序
- 1：将每个示例的操作设置为默认值，即查看示例的摘要
- 0：将操作设置为仅列出示例中的文件
- *：查看所有文件

```bash
                  ---  COMMANDS  ---
      1  Default action: summarize files
      0  Minimal action: list files
      *  View all the files in less
      d  Invoke 'diskstats' on the disk performance data
      i  View the first INNODB STATUS sample in 'less'
      m  Invoke 'pt-mext' to show the SHOW STATUS counters side by side
      n  Summarize the 'netstat -antp' status data
                  --- NAVIGATION ---
      j  Select the next timestamp
      k  Select the previous timestamp
      q  Quit the program
Press any key to continue
```

## pt-summary

### 概要

打印信息涵盖CPU、内存、硬盘、网卡等核心信息，同时展现文件系统、磁盘调度、队列大小、LVM、RAID等详细配置，以及网络链接统计、netstat分析，并突出前10负载与 vmstat 数据

**用法**

```bash
pt-summary
```
### 选项

| 参数                  | 含义                                                         |
| --------------------- | ------------------------------------------------------------ |
| --config              | 读取这个逗号分隔的配置文件列表，如果指定，这必须是命令行上的第一个选项 |
| --help                | 显示帮助                                                     |
| --read-samples        | 从此目录中的文件创建报告                                     |
| --save-samples        | 将收集到的数据保存在此目录中                                 |
| --sleep               | 从 vmstat 收集样本时休眠多长时间                             |
| --summarize-mounts    | 报告已安装的文件系统和磁盘使用情况                           |
| --summarize-network   | 有关网络控制器和配置的报告                                   |
| --summarize-processes | 报告顶级进程和 `vmstat` 输出                                 |
| --version             | 打印工具的版本并退出                                         |

### 最佳实践

直接使用即可

```bash
pt-summary
```

 该段展示当前日期和时间，以及服务器和操作系统的概览

```bash
# Percona Toolkit System Summary Report ######################
        Date | 2024-04-15 07:49:13 UTC (local TZ: CST +0800)
    Hostname | myarch
      Uptime | 74 days,  5:25,  4 users,  load average: 0.03, 0.01, 0.00
    Platform | Linux
     Release | "Arch Linux" (n/a)
      Kernel | 6.6.3-arch1-1
Architecture | CPU = 64-bit, OS = 64-bit
   Threading | NPTL 2.39
    Compiler | GNU CC version 13.2.1 20230801.
     SELinux | No SELinux detected
 Virtualized | No virtualization detected
```

该段提取自`/proc/cpuinfo`

```bash
# Processor ##################################################
  Processors | physical = 1, cores = 6, virtual = 12, hyperthreading = yes
      Speeds | 1x4071.589, 1x4177.016, 1x4179.769, 1x4197.696, 1x4197.784, 1x4198.704, 6x800.000
      Models | 12xIntel(R) Core(TM) i7-8850H CPU @ 2.60GHz
      Caches | 12x9216 KB
```

该段是内存信息。生成自`free`、`ps`、`sysctl`以及`dmidecode`

```bash
# Memory #####################################################
         Total | 15.4G
          Free | 1.1G
          Used | physical = 3.7G, swap allocated = 0.0, swap used = 0.0, virtual = 3.7G
        Shared | 3.9M
       Buffers | 10.9G
        Caches | 11.7G
         Dirty | 20 kB
       UsedRSS | 3.3G
    Swappiness | 60
   DirtyPolicy | 20, 10
   DirtyStatus | 0, 0
    Numa Nodes | 1
   Numa Policy | default
Preferred Node | current
   Node    Size        Free        CPUs
   ====    ====        ====        ====
   node0   15787 MB    1165 MB     0 1 2 3 4 5 6 7 8 9 10 11
```

该段是挂载文件系统。生成自`mount`和`df`

```bash
# Mounted Filesystems ########################################
  Filesystem      Size Used Type     Opts
                   Mountpoint
  /dev/nvme0n1p1  799M   1% vfat     rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro /efi
  /dev/nvme0n1p2  233G  34% ext4     rw,relatime
                   /
  /dev/sda1       916G   4% ext4     rw,relatime
                   /home
  efivarfs        384K  19% efivarfs rw,nosuid,nodev,noexec,relatime
                   /sys/firmware/efi/efivars
  run             7.8G   1% tmpfs    rw,nosuid,nodev,relatime,mode=755,inode64
                   /run
  tmpfs           1.6G   1% tmpfs    rw,nosuid,nodev,inode64
                   /run/user/0
  tmpfs           1.6G   1% tmpfs    rw,nosuid,nodev,relatime,size=1616676k,nr_inodes=404169,mode=700,inode64
                   /run/user/0
  tmpfs           1.6G   1% tmpfs    rw,nosuid,nodev,nr_inodes=1048576,inode64
                   /run/user/0
  tmpfs           7.8G   0% tmpfs    rw,nosuid,nodev,inode64
                   /dev/shm
  tmpfs           7.8G   0% tmpfs    rw,nosuid,nodev,relatime,size=1616676k,nr_inodes=404169,mode=700,inode64
                   /dev/shm
  tmpfs           7.8G   0% tmpfs    rw,nosuid,nodev,nr_inodes=1048576,inode64
                   /dev/shm
  tmpfs           7.8G   1% tmpfs    rw,nosuid,nodev,inode64
                   /tmp
  tmpfs           7.8G   1% tmpfs    rw,nosuid,nodev,relatime,size=1616676k,nr_inodes=404169,mode=700,inode64
                   /tmp
  tmpfs           7.8G   1% tmpfs    rw,nosuid,nodev,nr_inodes=1048576,inode64
                   /tmp
```

该段是磁盘调度信息。提取自`/sys`

```bash
# Disk Schedulers And Queue Size #############################
     nvme0n1 | [none] 1023
         sda | [mq-deadline] 64
```

该段是磁盘分区信息。生成自`fdisk -l`

```bash
# Disk Partitioning ##########################################
Device       Type      Start        End               Size
============ ==== ========== ========== ==================
/dev/nvme0n1 Disk                             256060514304
/dev/nvme0n1p1 Part       2048    1640447                  0
/dev/nvme0n1p2 Part    1640448  500117503                  0
/dev/sda     Disk                            1000204886016
/dev/sda1    Part       2048 1953523711                  0
```

该段是`Kernel Inode State`

```bash
# Kernel Inode State #########################################
dentry-state | 733944   717873  45      0       291017  0
     file-nr | 1120     0       9223372036854775807
    inode-nr | 631593   103806
```

该段是内核索引节点信息。分别提取自`/proc/sys/fs`目录下同名文件

```bash
# LVM Volumes ################################################
Unable to collect information
# LVM Volume Groups ##########################################
Unable to collect information
```

该段是RAID控制器。生成自`lvs`

```bash
# RAID Controller ############################################
  Controller | No RAID controller detected
```

该段是网络配置，生成自`lspci`和`sysctl`

```bash
# Network Config #############################################
  Controller | Intel Corporation Ethernet Connection (7) I219-LM (rev 10)
 FIN Timeout | 60
  Port Range | 60999
```

该段是网络接口统计，生成自`ip -s link`

```bash
# Network Connections ########################################
  Connections from remote IP addresses
    192.168.6.76        1
    213.133.111.6       1
  Connections to local IP addresses
    192.168.6.55        2
  Connections to top 10 local ports
    22                  1
    35554               1
  States of connections
    ESTABLISHED         2
    LISTEN              5
```

该段是`TOP`命令前几行

```bash
# Top Processes ##############################################
    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
1526529 root      20   0   15316   5632   3584 R  16.7   0.0   0:00.03 top
      1 root      20   0   22644  13452  10112 S   0.0   0.1  12:08.33 systemd
      2 root      20   0       0      0      0 S   0.0   0.0   0:05.75 kthreadd
      3 root      20   0       0      0      0 S   0.0   0.0   0:00.00 pool_wo+
      4 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 kworker+
      5 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 kworker+
      6 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 kworker+
      7 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 kworker+
      9 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 kworker+
```

该段是要注意的地方，这里提示`sshd`没运行

```bash
# Notable Processes ##########################################
  PID    OOM    COMMAND
    ?      ?    sshd doesn't appear to be running
```

该段是内存管理，这里提示开启了透明大页

```bash
# Memory management ##########################################
Transparent huge pages are enabled.
```

该段表示结束

```bash
# The End ####################################################
```

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)