# 日常巡检

本节主要介绍日常对 GreatSQL 数据库进行巡检应该检查的事项，主要包含服务器硬件健康状况、操作系统运行状况以及 GreatSQL 运行健康状况，  涉及性能、可用性、资源水位和数据备份等多个维度。

日常巡检主要是为了及时发现和修复 GreatSQL 运行中的隐患，应当针对其中的关键指标予以重点关注。

## 服务器主机硬件状态

*OpenIPMI（Open Inter Platform Management Interface）* 是一个用于监控和管理服务器硬件的工具。它实现了 *IPMI（Intelligent Platform Management Interface）* 协议，允许管理员通过网络监控和管理服务器的硬件状态。*OpenIPMI* 是一个开源项目，广泛用于数据中心和企业环境中。

*OpenIPMI* 的主要功能

- 硬件监控：监控服务器的温度、电压、风扇转速等硬件状态。
- 事件日志：记录硬件事件，如温度过高、电源故障等。
- 远程控制：允许远程控制服务器，如开关机、重置等操作。
- 报警通知：当硬件状态异常时，可以发送报警通知。

*ipmitool* 是一个命令行工具，用于与 IPMI 接口通信，实现对服务器硬件的监控和管理。ipmitool 提供了丰富的命令集，可以用来监控和控制服务器硬件。

安装 *OpenIPMI* 及 *ipmitool*

```shell
$ yum install -y OpenIPMI ipmitool
```

列举几个 *ipmitool* 常用主机监控命令

- `ipmitool sel list`，打印所有硬件日志

```shell
$ ipmitool sel list
Drive Slot / Bay #0xac | Drive Present () | Deasserted     <- 硬盘更换事件
Power Supply #0x86 | Power Supply AC lost | Asserted       <- 断电事件
Power Supply #0x77 | Fully Redundant | Asserted            <- 增加双电冗余保护
Temperature #0x30 | Upper Critical going high | Asserted   <- 温度预警
Voltage #0x60 | Lower Critical going low | Asserted        <- 电压预警
Memory #0x53 | Correctable ECC (@DIMMO6 (CPU4)) | Asserted <- 内存ECC校验报错
```

- `ipmitool sensor`，打印所有传感器信息

```shell
$ ipmitool sensor
...
<-- 所有温度传感器
Temp             | 61.000     | degrees C  | ok    | na        | 3.000     | na        | na        | 104.000   | na
Temp             | 59.000     | degrees C  | ok    | na        | 3.000     | na        | na        | 104.000   | na
Inlet Temp       | 21.000     | degrees C  | ok    | na        | -7.000    | 3.000     | 38.000    | 42.000    | na
GPU1 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
GPU2 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
Exhaust Temp     | 43.000     | degrees C  | ok    | na        | 3.000     | 8.000     | 75.000    | 80.000    | na
Temp             | 48.000     | degrees C  | ok    | na        | 3.000     | na        | na        | 104.000   | na
Temp             | 48.000     | degrees C  | ok    | na        | 3.000     | na        | na        | 104.000   | na
GPU3 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
GPU4 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
GPU5 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
GPU6 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
GPU7 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
GPU8 Temp        | na         |            | na    | na        | na        | na        | na        | na        | na
...
<-- 所有风扇传感器
Fan1             | 7800.000   | RPM        | ok    | na        | 480.000   | 840.000   | na        | na        | na
Fan2             | 7800.000   | RPM        | ok    | na        | 480.000   | 840.000   | na        | na        | na
Fan3             | 7800.000   | RPM        | ok    | na        | 480.000   | 840.000   | na        | na        | na
Fan4             | 7800.000   | RPM        | ok    | na        | 480.000   | 840.000   | na        | na        | na
Fan5             | 7680.000   | RPM        | ok    | na        | 480.000   | 840.000   | na        | na        | na
Fan6             | 7800.000   | RPM        | ok    | na        | 480.000   | 840.000   | na        | na        | na
Fan Redundancy   | 0x0        | discrete   | 0x0180| na        | na        | na        | na        | na        | na
Fan1 Status      | 0x0        | discrete   | 0x0980| na        | na        | na        | na        | na        | na
Fan2 Status      | 0x0        | discrete   | 0x0980| na        | na        | na        | na        | na        | na
Fan3 Status      | 0x0        | discrete   | 0x0980| na        | na        | na        | na        | na        | na
Fan4 Status      | 0x0        | discrete   | 0x0980| na        | na        | na        | na        | na        | na
Fan5 Status      | 0x0        | discrete   | 0x0980| na        | na        | na        | na        | na        | na
Fan6 Status      | 0x0        | discrete   | 0x0980| na        | na        | na        | na        | na        | na
``` 

利用 *ipmitool* 可以方便地检查服务器主机硬件运行状态，尤其是发生内存报错、硬盘更换、温度快速升高等影响服务器稳定可靠性的事件时，能及时发现并做出应对处置方案。

## 服务器主机系统状态

### 1. 检查整体负载

可以运行 `vmstat` 查看当前服务器主机的整体系统运行状态。`vmstat` 是一个在 Linux 系统中常用的系统监控工具，它可以实时地报告虚拟内存统计信息以及其他有关系统活动的信息。`vmstat` 可以帮助了解系统的内存使用情况、进程调度、磁盘 I/O 活动等。

下面是一个正在进行压力测试的服务器上运行 `vmstat -S m 1 10` 得到的结果
```shell
$ vmstat -S m 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
37  0    296   1442      0 306867    0    0  4048 591984 93233 836275 14  3 82  0  0
29  2    296   1424      0 306875    0    0  3728 614132 95095 841087 14  3 83  0  0
36  0    296   1414      0 306879    0    0  3984 618636 95079 839711 14  3 83  0  0
33  1    296   1443      0 306841    0    0  3872 614004 96879 834200 14  3 82  0  0
36  0    296   1422      0 306842    0    0  3792 626742 101347 834456 14  4 82  0  0
36  1    296   1422      0 306848    0    0  4224 617496 97188 832442 14  3 82  0  0
36  0    296   1450      0 306808    0    0  4048 589544 92330 832099 14  3 83  0  0
34  0    296   1441      0 306810    0    0  4176 579165 91404 827838 14  3 82  0  0
34  0    296   1432      0 306816    0    0  4128 611000 94913 846789 14  3 82  0  0
35  0    296   1423      0 306822    0    0  4096 613664 94893 836484 14  3 82  0  0
```

运行结果解读
- **procs**：
  - `r`: 当前有 37 个进程正在运行或等待 CPU。
  - `b`: 没有进程处于不可中断睡眠状态。
- **memory**：
  - `swpd`: 轻微使用交换区。
  - `free`: 有 1440 KB 左右的空闲物理内存。
  - `buff`: 没有内存用作缓冲区。
  - `cache`: 有 306860 KB 左右的内存用作缓存。
- **swap**：
  - `si`: 每秒从磁盘交换到内存的数据量为 0 KB。
  - `so`: 每秒从内存交换到磁盘的数据量为 0 KB。
- **io**：
  - `bi`: 每秒从块设备读取的数据量为 4048 KB。
  - `bo`: 每秒写入块设备的数据量为 591984 KB。
- **system**：
  - `in`: 每秒发生 93233 次中断。
  - `cs`: 每秒发生 836275 次上下文切换。
- **cpu**：
  - `us`: 用户态 CPU 使用率为 14%。
  - `sy`: 系统态 CPU 使用率为 3%。
  - `id`: 空闲时间为 83%。
  - `wa`: 等待 I/O 完成的时间为 0%。
  - `st`: 被偷走的时间为 0%。

从上述结果来看，服务器当前的并发请求较高，CPU 的负载较重，磁盘 I/O 以写入为主且还有较大性能余量空间，这结果符合当前正在进行 OLTP 型压力测试场景的预期。

### 2. 检查 CPU 负载

`mpstat` 是一个用于监控 Linux 系统 CPU 使用情况的强大工具，特别是在多处理器或多核系统中。`mpstat` 是 `sysstat` 包的一部分，它可以提供详细的 CPU 使用情况统计数据。通过 `mpstat`，可以获取每个 CPU 核心的使用情况，这对于性能分析和调试非常有用。

下面是一个正在进行压力测试的服务器上运行 `mpstat 1 10` 得到的结果

```shell
$ mpstat 1 11
Linux 3.10.0-1160.el7.x86_64 (59)     09/09/2024     _x86_64_    (176 CPU)

03:28:31 PM  CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
03:28:32 PM  all   13.89    0.00    2.68    0.14    0.00    0.66    0.00    0.00    0.00   82.63
03:28:33 PM  all   14.03    0.00    2.63    0.13    0.00    0.74    0.00    0.00    0.00   82.46
03:28:34 PM  all   14.05    0.00    2.62    0.14    0.00    0.68    0.00    0.00    0.00   82.51
03:28:35 PM  all   13.88    0.00    2.58    0.13    0.00    0.72    0.00    0.00    0.00   82.70
03:28:36 PM  all   13.93    0.00    2.82    0.14    0.00    0.70    0.00    0.00    0.00   82.40
03:28:37 PM  all   13.98    0.00    2.63    0.14    0.00    0.71    0.00    0.00    0.00   82.54
03:28:38 PM  all   14.00    0.00    2.59    0.14    0.00    0.70    0.00    0.00    0.00   82.57
03:28:39 PM  all   13.94    0.00    2.58    0.14    0.00    0.69    0.00    0.00    0.00   82.64
03:28:40 PM  all   14.06    0.00    2.65    0.12    0.00    0.69    0.00    0.00    0.00   82.48
03:28:41 PM  all   13.96    0.00    2.56    0.13    0.00    0.68    0.00    0.00    0.00   82.67
Average:     all   13.99    0.00    2.63    0.13    0.00    0.69    0.00    0.00    0.00   82.56
```

各个指标的含义
- CPU：标识 CPU 核心编号或 all 表示所有 CPU 核心的汇总。
- %usr：用户态 CPU 使用率，即用户进程占用的 CPU 时间百分比为 14% 左右。
- %nice：带有 nice 值的用户进程占用的 CPU 时间百分比。
- %sys：内核态 CPU 使用率，即系统进程（内核）占用的 CPU 时间百分比为 2.6% 左右。
- %iowait：等待 I/O 操作完成的 CPU 时间百分比为 0.14% 左右。
- %irq：处理硬件中断的 CPU 时间百分比。
- %soft：处理软件中断的 CPU 时间百分比为 0.70% 左右。
- %steal：在虚拟化环境中，表示被虚拟机监视器偷走的时间百分比。
- %guest：在虚拟化环境中，表示虚拟机占用的 CPU 时间百分比。
- %idle：CPU 空闲时间百分比为 82.60% 左右。

从上述结果来看，服务器当前的用户态 CPU 负载较高，不过由于服务器的核数较多，所以整体 CPU 资源还有较大余量。

### 3. 检查内存状态

`free` 是一个常用的 Linux 工具，用于报告系统中内存的使用情况。它可以帮助了解当前系统的内存使用状态，包括物理内存、交换空间（swap）以及缓存和缓冲区的使用情况。

下面是一个正在进行压力测试的服务器上运行 `free -ht` 得到的结果

```shell
$ free -ht
              total        used        free      shared  buff/cache   available
Mem:           377G         86G         12G         77M        278G        289G
Swap:          4.0G        282M        3.7G
Total:         381G         86G         16G
```

- 物理内存解读
  - **total**: 系统共有 377 GB 的物理内存。
  - **used**: 当前使用的物理内存为 86 GB。
  - **free**: 当前未被使用的物理内存为 12 GB。
  - **shared**: 多个进程共享的内存为 77 MB。
  - **buff/cache**: 用作缓存和缓冲区的内存为 278 GB。
  - **available**: 可以立即分配给新应用而不影响系统性能的内存为 289 GB。

- 交换空间解读
  - **total**: 交换空间总量为 4.0 GB。
  - **used**: 当前使用的交换空间为 282 MB。
  - **free**: 当前未被使用的交换空间为 3.7 GB。

通过观察一段时间内的内存使用趋势，可以初步判断是否有内存泄漏的风险。如果 **used** 值持续上升，而 **buff/cache** 和 **available** 值没有相应的变化，可能存在内存泄漏的风险。

### 4. 检查磁盘 I/O 负载状态

`iostat` 是一个用于监控 Linux 系统中 CPU 使用情况和磁盘 I/O 统计信息的强大工具。它是 `sysstat` 包的一部分，可以提供详细的系统性能数据。`iostat` 可以帮助了解 CPU 和磁盘子系统的负载情况，这对于性能分析和故障排除非常重要。

下面是一个正在进行压力测试的服务器上运行 `iostat` 得到的结果

```shell
$ iostat -dmx 1 10 | grep nvme0n1p1
Linux 3.10.0-1160.el7.x86_64 (59)     09/09/2024     _x86_64_    (176 CPU)

Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
nvme0n1p1         0.00     0.00  585.00 30541.00     9.08   571.94    38.23     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  672.00 25844.00    10.39   490.40    38.68     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  634.00 27770.00     9.88   524.41    38.52     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  616.00 29791.00     9.53   561.07    38.43     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  636.00 30010.00     9.91   559.97    38.08     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  611.00 31029.00     9.53   578.64    38.07     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  603.00 30368.00     9.36   563.91    37.91     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  547.00 28568.00     8.47   540.07    38.58     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  564.00 29258.00     8.78   550.25    38.39     0.00    0.00    0.00    0.00   0.00   0.00
nvme0n1p1         0.00     0.00  560.00 29020.00     8.69   545.89    38.40     0.00    0.00    0.00    0.00   0.00   0.00
```

各个指标的含义
- Device: 磁盘设备名称为 *nvme0n1p1*。
- rrqm/s: 每秒合并的读请求为 0.00。
- wrqm/s: 每秒合并的写请求为 0.00。
- r/s: 每秒完成的读请求为 600左右。
- w/s: 每秒完成的写请求为 30000左右。
- rkB/s: 每秒读取的数据量为 10MB 左右。
- wkB/s: 每秒写入的数据量为 560MB 左右。
- avgrq-sz: 平均每次 I/O 请求处理的数据量为 38KB。
- avgqu-sz: 平均 I/O 队列长度为 0.00。
- await: 每次 I/O 请求的平均处理时间为 0.00 毫秒。
- r_await: 每次读请求的平均处理时间为 0.00 毫秒。
- w_await: 每次写请求的平均处理时间为 0.00 毫秒。
- svctm: 每次 I/O 请求的服务时间为 0.00 毫秒。
- %util: I/O 请求花费的时间百分比为 0.00%。

上述结果中，如果 *await*、*r_await*、*w_await*、*svctm*、*%util* 等几个值较高的话，就需要引起关注。

### 5. 检查系统常规状态

检查以下几项系统常规状态
- 执行 `df -hT` 关注剩余可用磁盘空间变化趋势。
- 执行 `du -sch /data/GreatSQL` 关注 GreatSQL 占用磁盘空间变化趋势。
- 执行 `netstat -na` 记录所有网络连接列表，并尝试发现是否有异常连接信息。
- 执行 `mii-tool` 查看网卡状态，在发生异常情况时，千兆网卡可能会被降级为百兆网卡。
- 关注 /tmp 目录或者 GreatSQL 中的 `tmpdir` 参数指向的目录所在磁盘分区剩余可用空间。

### 6. 检查系统异常状态

可以执行 `dmesg | egrep -i 'error|failed|warn'` 命令以及 `egrep -i 'error|failed|warn' /var/log/message` 检查系统中是否发生一些异常事件，并确认这些事件有哪些是需要重点关注和后续跟进处理的。

## GreatSQL 数据库运行状态

对 GreatSQL 数据库进行日常巡检是确保数据库稳定性和性能的关键步骤。巡检应该覆盖多个方面，包括数据库的可用性、性能负载、容量变化趋势等。以下是针对 MySQL 数据库日常巡检的一些建议和指标，以帮助管理员更好地监控数据库实例的运行状态：

### 1. 可用性检查
- **数据库服务状态**：确保 GreatSQL 服务正常运行。
  - 使用 `systemctl status GreatSQL` 或 `mysqladmin ping` 检查服务状态。
- **连接数**：检查已建立/活跃连接数，确保没有超出最大连接数限制。
  - 使用 `SHOW GLOBAL STATUS LIKE 'Threads_connected';` 查看当前已建立的连接数。
  - 使用 `SHOW GLOBAL STATUS LIKE 'Threads_running';` 查看当前有活跃事务的连接数，如果较高表示当前实例事务并发较多。
  - 检查 `max_connections` 配置项，确保当前连接数没有超过此限制。
- **错误日志**：检查 GreatSQL 错误日志，查找任何可能导致服务中断的错误。
  - 执行 `egrep -i 'error|failed|warn' /data/GreatSQL/error.log` 或相应的错误日志文件，确认当前实例是否存在/新增一些需要预警的事件。

### 2. 性能负载检查
- **慢查询日志**：检查慢查询日志，找出慢查询并进行优化。
  - 确保慢查询日志已开启，并检查 `log_slow_verbosity`、`long_query_time`、`log_queries_not_using_indexes` 等参数是否设置合理。
  - 使用 `SHOW VARIABLES LIKE 'slow_query_log_file';` 查看慢查询日志文件路径，定期检查关注新增的慢查询日志记录。
  - 更多关于慢查询日志的内容参考：[慢查询日志](../2-about-greatsql/4-2-greatsql-slow-log.md)。
- **查询执行情况**：
  - 使用 `SHOW PROCESSLIST;` 查看当前正在执行的查询。
  - 使用 `SHOW FULL PROCESSLIST;` 获取更多查询详情。
  - 重点关注是否有 `converting HEAP to ondisk/copy to tmp table/Copying to group table/Copying to tmp table/Copying to tmp table on disk/Creating sort index/Creating tmp table/Rolling back/Sending data/Sorting result/Waiting for XXX` 等状态。
- **临时表/临时文件使用情况**：
  - 使用 `SHOW GLOBAL STATUS LIKE 'Created%tmp%';` 检查临时表/临时文件使用情况。
- **InnoDB 缓冲池使用情况**：
  - 执行 `SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_pages%';`，检查 `Innodb_buffer_pool_pages_data/Innodb_buffer_pool_pages_dirty/Innodb_buffer_pool_pages_free` 等 InnoDB 缓冲池使用情况相关状态变量。
  - 检查 `SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_wait_free'` InnoDB 缓冲池是否出现不足而等待状态。
- **锁等待情况**：
  - 使用 `SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_%'` 和 `SHOW ENGINE INNODB STATUS;` 查看 InnoDB 引擎的状态，包括锁等待情况。

### 3. 其他重要指标

- **MGR 状态**（如果有）：
  - 执行 `SELECT * FROM performance_schema.replication_group_member_stats;` 查询 MGR 各节点状态。
- **主从复制状态**（如果有）：
  - 执行 `SHOW REPLICA STATUS\G` 查看从服务器的复制状态。

### 4. 遍历 GreatSQL 所有配置参数

执行 `mysqladmin variables` 记录当前所有的配置参数值，因为有时候会在运行过程中执行 `SET PERSIST` 修改某个配置参数，因此只查看 *my.cnf* 配置文件可能是不够可信的。

### 5. 定期备份检查
- **备份策略**：确保定期进行数据库备份，并验证备份的完整性和有效性。
- **恢复测试**：定期进行备份恢复测试，确保备份可以在紧急情况下恢复。

## 总结

通过对 GreatSQL 数据库进行定期巡检，可以确保数据库的稳定运行和性能优化。重点关注可用性、性能负载以及容量变化趋势，可以帮助管理员及时发现问题并采取措施。

同时，建立一套完善的监控和报警机制，可以进一步提升数据库的可靠性和安全性。通过这些巡检和监控措施，可以确保 GreatSQL 数据库在日常运行中保持最佳状态。

更多 GreatSQL 数据库监控相关内容请参考：[监控告警](./3-monitoring-and-alerting.md)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
