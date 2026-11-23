# Daily Health Check

This section mainly introduces the items that should be checked during daily health checks of the GreatSQL database, mainly including server hardware health status, operating system running status, and GreatSQL running health status, covering multiple dimensions such as performance, availability, resource levels, and data backup.

Daily health checks are mainly to promptly discover and fix hidden dangers in GreatSQL operation. The key indicators among them should be given focused attention.

## Server Host Hardware Status

*OpenIPMI (Open Inter Platform Management Interface)* is a tool for monitoring and managing server hardware. It implements the *IPMI (Intelligent Platform Management Interface)* protocol, allowing administrators to monitor and manage the hardware status of servers over the network. *OpenIPMI* is an open source project widely used in data centers and enterprise environments.

Main functions of *OpenIPMI*

- Hardware monitoring: Monitor hardware status such as server temperature, voltage, and fan speed.
- Event logs: Record hardware events, such as excessive temperature, power failures, etc.
- Remote control: Allow remote control of the server, such as power on/off, reset, and other operations.
- Alarm notifications: Send alarm notifications when hardware status is abnormal.

*ipmitool* is a command-line tool used to communicate with the IPMI interface, implementing monitoring and management of server hardware. ipmitool provides a rich command set that can be used to monitor and control server hardware.

Install *OpenIPMI* and *ipmitool*

```bash
yum install -y OpenIPMI ipmitool
```

List several common host monitoring commands of *ipmitool*

- `ipmitool sel list`, print all hardware logs

```bash
$ ipmitool sel list

...
Drive Slot / Bay #0xac | Drive Present () | Deasserted     <- Hard disk replacement event
Power Supply #0x86 | Power Supply AC lost | Asserted       <- Power failure event
Power Supply #0x77 | Fully Redundant | Asserted            <- Dual power redundancy protection added
Temperature #0x30 | Upper Critical going high | Asserted   <- Temperature warning
Voltage #0x60 | Lower Critical going low | Asserted        <- Voltage warning
Memory #0x53 | Correctable ECC (@DIMMO6 (CPU4)) | Asserted <- Memory ECC check error
```

- `ipmitool sensor`, print all sensor information

```bash
$ ipmitool sensor

...
<-- All temperature sensors
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
<-- All fan sensors
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

*ipmitool* can be used to conveniently check the running status of the server host hardware, especially when events affecting server stability and reliability occur, such as memory errors, hard disk replacement, and rapid temperature increases. These can be discovered promptly and response plans made.

## Server Host System Status

### 1. Check Overall Load

Run `vmstat` to view the overall system running status of the current server host. `vmstat` is a commonly used system monitoring tool in Linux systems that reports virtual memory statistics and other information about system activity in real time. `vmstat` can help understand the system's memory usage, process scheduling, disk I/O activity, etc.

The following is the result of running `vmstat -S m 1 10` on a server undergoing stress testing
```bash
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

Interpretation of the running results
- **procs**:
  - `r`: Currently 37 processes are running or waiting for CPU.
  - `b`: No processes are in an uninterruptible sleep state.
- **memory**:
  - `swpd`: Slight use of the swap area.
  - `free`: About 1440 KB of free physical memory.
  - `buff`: No memory is used as buffers.
  - `cache`: About 306860 KB of memory is used as cache.
- **swap**:
  - `si`: The amount of data swapped from disk to memory per second is 0 KB.
  - `so`: The amount of data swapped from memory to disk per second is 0 KB.
- **io**:
  - `bi`: The amount of data read from block devices per second is 4048 KB.
  - `bo`: The amount of data written to block devices per second is 591984 KB.
- **system**:
  - `in`: 93233 interrupts occur per second.
  - `cs`: 836275 context switches occur per second.
- **cpu**:
  - `us`: User-state CPU usage is 14%.
  - `sy`: System-state CPU usage is 3%.
  - `id`: Idle time is 83%.
  - `wa`: Time waiting for I/O completion is 0%.
  - `st`: Stolen time is 0%.

From the above results, the server currently has high concurrent requests, heavy CPU load, and disk I/O is mainly write-oriented with a large performance headroom. This result is consistent with the expectation of the current OLTP-type stress testing scenario.

### 2. Check CPU Load

`mpstat` is a powerful tool for monitoring CPU usage in Linux systems, especially in multi-processor or multi-core systems. `mpstat` is part of the `sysstat` package and can provide detailed CPU usage statistics. Through `mpstat`, the usage of each CPU core can be obtained, which is very useful for performance analysis and debugging.

The following is the result of running `mpstat 1 10` on a server undergoing stress testing

```bash
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

Meaning of each indicator
- CPU: Identifies the CPU core number, or all indicates the summary of all CPU cores.
- %usr: User-state CPU usage, i.e., the percentage of CPU time occupied by user processes, is about 14%.
- %nice: The percentage of CPU time occupied by user processes with a nice value.
- %sys: Kernel-state CPU usage, i.e., the percentage of CPU time occupied by system processes (kernel), is about 2.6%.
- %iowait: The percentage of CPU time waiting for I/O operations to complete is about 0.14%.
- %irq: The percentage of CPU time processing hardware interrupts.
- %soft: The percentage of CPU time processing software interrupts is about 0.70%.
- %steal: In virtualized environments, the percentage of time stolen by the virtual machine monitor.
- %guest: In virtualized environments, the percentage of CPU time occupied by virtual machines.
- %idle: The percentage of CPU idle time is about 82.60%.

From the above results, the current user-state CPU load of the server is high. However, because the server has many cores, the overall CPU resources still have a large headroom.

If the following three situations exist, performance optimization work should be started as soon as possible:
- When the value of the %usr column is continuously large (>=20), it indicates that the current server CPU load is high, and it is highly likely that the SQL request efficiency running in the current GreatSQL database is low.
- When the value of the %sys column is continuously large (>=10), it is highly likely that there are many row lock waits in the current GreatSQL database, or Swap swapping is currently occurring because of insufficient physical memory.
- When the value of the %iowait column is continuously large (>=10), it indicates that the disk I/O load on the current server is high.

### 3. Check Memory Status

`free` is a commonly used Linux tool that reports the memory usage of the system. It can help understand the current system memory usage status, including physical memory, swap space, and the usage of cache and buffers.

The following is the result of running `free -ht` on a server undergoing stress testing

```bash
$ free -ht
              total        used        free      shared  buff/cache   available
Mem:           377G         86G         12G         77M        278G        289G
Swap:          4.0G        282M        3.7G
Total:         381G         86G         16G
```

- Physical memory interpretation
  - **total**: The system has 377 GB of physical memory in total.
  - **used**: The currently used physical memory is 86 GB.
  - **free**: The currently unused physical memory is 12 GB.
  - **shared**: The memory shared by multiple processes is 77 MB.
  - **buff/cache**: The memory used as cache and buffers is 278 GB.
  - **available**: The memory that can be immediately allocated to new applications without affecting system performance is 289 GB.

- Swap space interpretation
  - **total**: The total swap space is 4.0 GB.
  - **used**: The currently used swap space is 282 MB.
  - **free**: The currently unused swap space is 3.7 GB.

By observing the memory usage trend over a period of time, it can be preliminarily determined whether there is a risk of memory leaks. If the **used** value keeps rising while the **buff/cache** and **available** values do not change correspondingly, there may be a memory leak risk.

Sometimes, after the database has been running for a long time, executing `top` may show that the *mysqld* process consumes a relatively high proportion of memory, for example like this:

```bash
$ top

...
   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
391734 mysql     20   0  228.5g 209.6g  34908 S  5179 80.6  11367:01 mysqld
  3271 root      20   0  727544  25964   6892 S   1.5  0.0   6690:04 node_exporter
```

Usually, the memory proportion consumed by the *mysqld* process should not exceed 70%. If it is similar to the above situation, it is highly likely that the memory-related parameters are set unreasonably, or there is a memory leak problem. The following situations can be confirmed first:
- How much physical memory does the server have;
- Check whether the parameter `innodb_buffer_pool_size` is set too large. Generally set to 50% of physical memory, and the upper limit generally does not exceed 70%;
- Check whether the parameter `max_connection` is set too large and should be appropriately lowered;
- Check whether the parameters `read_buffer_size / read_rnd_buffer_size / join_buffer_size / sort_buffer_size` are set too large. Usually, setting them not exceeding 4MB is sufficient;
- Check whether the parameters `tmp_table_size / max_heap_table_size` are set too large. Usually, setting them not exceeding 128MB is sufficient;

The above memory-related parameter settings can all be dynamically adjusted online, and can be appropriately lowered first. If unsure how to set them properly, use the [my.cnf generation tool](https://imysql.com/my-cnf-wizard.html) to generate a my.cnf reference template.

In addition, the following SQL can be executed to view which modules and threads currently consume a relatively high proportion of memory in the GreatSQL database:

```sql
-- Query the modules with a relatively high memory consumption proportion in the GreatSQL database
SELECT EVENT_NAME, SUM_NUMBER_OF_BYTES_ALLOC FROM
  performance_schema.memory_summary_global_by_event_name
    ORDER BY SUM_NUMBER_OF_BYTES_ALLOC DESC LIMIT 10;
+----------------------------------------------+---------------------------+
| EVENT_NAME                                   | SUM_NUMBER_OF_BYTES_ALLOC |
+----------------------------------------------+---------------------------+
| memory/innodb/memory                         |               45879336944 |
| memory/memory/HP_PTRS                        |               14473514832 |
| memory/sql/Filesort_buffer::sort_keys        |                7746519943 |
| memory/sql/THD::main_mem_root                |                3267545344 |
| memory/innodb/buf_buf_pool                   |                2195783680 |
| memory/sql/Sid_map::Node                     |                2169465576 |
| memory/sql/String::value                     |                1206132352 |
| memory/mysqld_openssl/openssl_malloc         |                 953197339 |
| memory/sql/Prepared_statement::main_mem_root |                 447738240 |
| memory/temptable/physical_ram                |                 428880672 |
+----------------------------------------------+---------------------------+

-- Query the threads with a relatively high memory consumption proportion in the GreatSQL database
SELECT THREAD_ID, EVENT_NAME, SUM_NUMBER_OF_BYTES_ALLOC FROM
  performance_schema.memory_summary_by_thread_by_event_name 
    ORDER BY SUM_NUMBER_OF_BYTES_ALLOC DESC LIMIT 20;
+-----------+-------------------------------+---------------------------+
| THREAD_ID | EVENT_NAME                    | SUM_NUMBER_OF_BYTES_ALLOC |
+-----------+-------------------------------+---------------------------+
|       290 | memory/innodb/memory          |                5838369088 |
|       291 | memory/innodb/memory          |                5057600600 |
|       292 | memory/innodb/memory          |                3662593216 |
|       338 | memory/innodb/memory          |                2862346672 |
|       289 | memory/innodb/memory          |                2846131168 |
|       342 | memory/innodb/memory          |                2791608696 |
|       339 | memory/innodb/memory          |                2775410744 |
|       344 | memory/innodb/memory          |                2772611072 |
|       336 | memory/innodb/memory          |                2734888512 |
|       337 | memory/innodb/memory          |                2719026704 |
|       340 | memory/innodb/memory          |                2654364752 |
|       343 | memory/innodb/memory          |                2580087392 |
|       335 | memory/innodb/memory          |                2490996400 |
|       341 | memory/innodb/memory          |                2463993728 |
|       288 | memory/sql/Sid_map::Node      |                2169424028 |
|       337 | memory/memory/HP_PTRS         |                1621687936 |
|       334 | memory/sql/THD::main_mem_root |                1587371392 |
|       339 | memory/memory/HP_PTRS         |                1584831392 |
|       343 | memory/memory/HP_PTRS         |                1547974848 |
|       341 | memory/memory/HP_PTRS         |                1547974848 |
+-----------+-------------------------------+---------------------------+
```

From the above query results, it can be roughly inferred: in the current database, some SQL requests may need to scan large amounts of data without indexes, or need to group and sort large amounts of data, generating memory temporary tables, and other possible reasons consume excessive memory. The SQL query status in the database and slow query SQL can be analyzed together to optimize these SQL requests as soon as possible.

If the situation is urgent, consider executing the following operation to try to reclaim some memory fragments:

```bash
gdb --batch --pid `pidof mysqld` --ex 'call malloc_trim(0)'
```

::: danger Danger Warning
The above operation has certain risks in the online production environment. Please carefully evaluate whether to execute it.
:::

Finally, it is strongly recommended to install *jemalloc* to replace the native *glibc* when running the GreatSQL database. Its memory allocation and management efficiency is higher and safer. For details, refer to: [Installation Preparation](../4-install-guide/1-install-prepare.md#others).

### 4. Check Disk I/O Load Status

`iostat` is a powerful tool for monitoring CPU usage and disk I/O statistics in Linux systems. It is part of the `sysstat` package and can provide detailed system performance data. `iostat` can help understand the load of the CPU and disk subsystems, which is very important for performance analysis and fault troubleshooting.

The following is the result of running `iostat` on a server undergoing stress testing

```bash
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

Meaning of each indicator
- Device: The disk device name is *nvme0n1p1*.
- rrqm/s: The merged read requests per second is 0.00.
- wrqm/s: The merged write requests per second is 0.00.
- r/s: The read requests completed per second is about 600.
- w/s: The write requests completed per second is about 30000.
- rkB/s: The amount of data read per second is about 10MB.
- wkB/s: The amount of data written per second is about 560MB.
- avgrq-sz: The average amount of data processed per I/O request is 38KB.
- avgqu-sz: The average I/O queue length is 0.00.
- await: The average processing time per I/O request is 0.00 milliseconds.
- r_await: The average processing time per read request is 0.00 milliseconds.
- w_await: The average processing time per write request is 0.00 milliseconds.
- svctm: The service time per I/O request is 0.00 milliseconds.
- %util: The percentage of time spent on I/O requests is 0.00%.

In the above results, if several values such as *await*, *r_await*, *w_await*, *svctm*, and *%util* are high, attention needs to be paid.

### 5. Check System Routine Status

Check the following system routine statuses
- Execute `df -hT` to pay attention to the trend of remaining available disk space.
- Execute `du -sch /data/GreatSQL` to pay attention to the trend of disk space occupied by GreatSQL.
- Execute `netstat -na` to record the list of all network connections and try to find whether there is any abnormal connection information.
- Execute `mii-tool` to view the network card status. In abnormal situations, a gigabit network card may be downgraded to a 100-megabit network card.
- Pay attention to the remaining available space of the disk partition where the /tmp directory or the directory pointed to by the `tmpdir` parameter in GreatSQL is located.

### 6. Check System Abnormal Status

Execute the command `dmesg | egrep -i 'error|failed|warn'` and `egrep -i 'error|failed|warn' /var/log/message` to check whether any abnormal events have occurred in the system, and confirm which of these events need focused attention and follow-up handling.

## GreatSQL Database Running Status

Performing daily health checks on the GreatSQL database is a key step to ensure database stability and performance. Health checks should cover multiple aspects, including database availability, performance load, and capacity change trends. The following are some suggestions and indicators for daily health checks of the GreatSQL database, to help administrators better monitor the running status of database instances:

### 1. Availability Check
- **Database service status**: Ensure that the GreatSQL service is running normally.
  - Use `systemctl status GreatSQL` or `mysqladmin ping` to check the service status.
- **Connection count**: Check the established/active connection count to ensure it does not exceed the maximum connection limit.
  - Use `SHOW GLOBAL STATUS LIKE 'Threads_connected';` to view the currently established connection count.
  - Use `SHOW GLOBAL STATUS LIKE 'Threads_running';` to view the number of connections with active transactions. If it is high, it indicates that the current instance has many concurrent transactions.
  - Check the `max_connections` configuration item to ensure that the current connection count does not exceed this limit.
- **Error log**: Check the GreatSQL error log to find any errors that may cause service interruption.
  - Execute `egrep -i 'error|failed|warn' /data/GreatSQL/error.log` or the corresponding error log file to confirm whether there are/pre-existing events in the current instance that need alerts.

### 2. Performance Load Check
- **Slow query log**: Check the slow query log, find slow queries, and optimize them.
  - Ensure that the slow query log is enabled, and check whether parameters such as `log_slow_verbosity`, `long_query_time`, and `log_queries_not_using_indexes` are set reasonably.
  - Use `SHOW VARIABLES LIKE 'slow_query_log_file';` to view the slow query log file path, and regularly check and pay attention to newly added slow query log records.
  - For more content about the slow query log, refer to: [Slow Query Log](../2-about-greatsql/4-2-greatsql-slow-log.md).
- **Query execution status**:
  - Use `SHOW PROCESSLIST;` to view the currently executing queries.
  - Use `SHOW FULL PROCESSLIST;` to get more query details.
  - Focus on whether there are states such as `converting HEAP to ondisk/copy to tmp table/Copying to group table/Copying to tmp table/Copying to tmp table on disk/Creating sort index/Creating tmp table/Rolling back/Sending data/Sorting result/Waiting for XXX`.
- **Temporary table/temporary file usage**:
  - Use `SHOW GLOBAL STATUS LIKE 'Created%tmp%';` to check temporary table/temporary file usage.
- **InnoDB buffer pool usage**:
  - Execute `SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_pages%';` to check status variables related to InnoDB buffer pool usage such as `Innodb_buffer_pool_pages_data/Innodb_buffer_pool_pages_dirty/Innodb_buffer_pool_pages_free`.
  - Check `SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_wait_free'` to see whether the InnoDB buffer pool is insufficient and in a waiting state.
- **Lock wait status**:
  - Use `SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_%'` and `SHOW ENGINE INNODB STATUS;` to view the InnoDB engine status, including lock wait situations.

### 3. Other Important Indicators

- **MGR status** (if any):
  - Execute `SELECT * FROM performance_schema.replication_group_member_stats;` to query the status of each MGR node.
- **Source-replica replication status** (if any):
  - Execute `SHOW REPLICA STATUS\G` to view the replication status of the secondary server.

### 4. Traverse All GreatSQL Configuration Parameters

Execute `mysqladmin variables` to record all current configuration parameter values, because sometimes `SET PERSIST` may be executed to modify a configuration parameter during operation. Therefore, only viewing the *my.cnf* configuration file may not be reliable enough.

### 5. Regular Backup Check
- **Backup strategy**: Ensure that database backups are performed regularly and verify the integrity and effectiveness of the backups.
- **Restore testing**: Regularly perform backup restore tests to ensure that backups can be restored in emergency situations.

## Summary

By performing regular health checks on the GreatSQL database, stable operation and performance optimization of the database can be ensured. Focusing on availability, performance load, and capacity change trends can help administrators discover problems promptly and take measures.

At the same time, establishing a complete monitoring and alerting mechanism can further improve the reliability and security of the database. Through these health check and monitoring measures, the GreatSQL database can be ensured to maintain the best state in daily operation.

For more GreatSQL database monitoring related content, refer to: [Monitoring & Alerting](./3-monitoring-and-alerting.md).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
