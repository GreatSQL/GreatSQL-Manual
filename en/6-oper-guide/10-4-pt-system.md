# Percona Toolkit System

::: tip Tip
`$` is the Linux command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

## System

In Percona Toolkit, the system category includes the following tools:

- `pt-diskstats`: View system disk status.
- `pt-fifo-split`: Simulate splitting files and output.
- `pt-ioprofile`: Query process I/O and print an I/O activity table.
- `pt-stalk`: Collect diagnostic data when problems occur.
- `pt-sift`: Browse files created by pt-stalk.
- `pt-summary`: Collect and display system overview.

## pt-diskstats

### Overview

Similar to the `iostat` command, but it outputs in more detail than `iostat`.

**Usage**

```bash
pt-diskstats [OPTIONS] [FILES]
```

Print GNU/Linux disk I/O statistics. It is somewhat similar to `iostat`, but it is interactive and more detailed. It can also analyze samples collected from another machine.

### Options

All options of this tool are as follows:

| Parameter                | Meaning                                                         |
| ------------------- | ------------------------------------------------------------ |
| --columns-regex     | Print columns matching this Perl regex                             |
| --config            | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --devices-regex     | Print devices matching this Perl regex                           |
| --group-by          | Grouping basis mode: `disk`,`sample`,`all`                          |
| --headers           | If `group` exists, each sample is separated by a blank line, unless the sample has only one line  |
| --help              | Display help                                                     |
| --interval          | In interactive mode, wait N seconds before printing to the screen.                      |
| --iterations        | In interactive mode, stop after N samples. Defaults to running forever      |
| --sample-time       | In `group-by sample` mode, each group contains N seconds of samples              |
| --save-samples      | The file used to save diskstats samples                                |
| --show-inactive     | Show inactive devices                                             |
| --show-timestamps   | Show "HH:MM:SS" timestamps in the `#ts` column                              |
| --version           | Display the version                                                     |
| --[no]version-check | Version check                                                     |

### Best Practices

::: danger Special Reminder
In newer Linux kernel versions, the number of fields returned for disk statistics has changed to 20, causing pt-diskstats to fail to provide any output on these systems.
※[See this issue for details](https://perconadev.atlassian.net/jira/software/c/projects/PT/issues/PT-2313?jql=project%20%3D%20%22PT%22%20AND%20text%20~%20%22diskstats%22%20ORDER%20BY%20created%20DESC)
※[Solution](https://github.com/percona/percona-toolkit/pull/526/files#diff-c3ecedaa384eecb55bd8fdb37456a89a3dc45a41588ef1ebe231120e965942d8R2247)
::: 

#### Direct Collection and Analysis

::: tip Tip
`--devices-regex` specifies the device name. Modify it according to your own device.
:::

```bash
pt-diskstats --interval=1 --iterations=10 --devices-regex=sda --show-timestamps
```
::: details View the result
```bash
$ pt-diskstats --interval=1 --iterations=10 --devices-regex=sda --show-timestamps
     #ts device    rd_s rd_avkb rd_mb_s rd_mrg rd_cnc   rd_rt    wr_s wr_avkb wr_mb_s wr_mrg wr_cnc   wr_rt busy in_prg    io_s  qtime stime
14:08:26 sda        0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
14:08:26 sda1       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
14:08:26 sda2       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
14:08:26 sda3       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
```
:::


- `ts`: The timestamp when `--show-timestamps` is used. But in group-by all mode, this column shows the timestamp offset; in sample mode, it indicates the total time span grouped into each sample.
- `device`: The device name.
- `rd_s`: The average number of reads per second.
- `rd_avkb`: The average size of reads in kb.
- `rd_mb_s`: The average megabytes read per second.
- `rd_mrg`: The percentage of read requests merged together in the queue scheduler before being sent to the physical device.
- `rd_cnc`: The average concurrency of read operations calculated according to Little's law.
- `rd_rt`: The average response time of read operations, in milliseconds.
- `wr_s`: The average number of writes per second.
- `wr_avkb`: The average write size.
- `wr_mb_s`: The average size written per second.
- `wr_mrg`: The percentage of write requests merged together in the queue scheduler before being sent to the physical device.
- `wr_cnc`: The average concurrency of write operations.
- `wr_rt`: The average response time of write operations.
- `busy`: Disk busyness.
- `in_prg`: The number of requests in progress.
- `io_s`: The average throughput of the physical device, in I/O operations per second (IOPS).
- `qtime`: The average queue time.
- `stime`: The average service time.

#### Collection and Analysis

First collect the information of `/proc/diskstats`, save it to a file, collect for a period of time, and then use `pt-diskstats` to calculate. The benefit of this is that you can understand the overall I/O performance during that period, rather than instantaneous performance indicators.

Create this `collection.sh` script:

::: tip Tip
The collection time can be modified with the LOOPS parameter, and the collection interval can be modified with the INTERVAL parameter.
:::

```ini
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

Grant execute permission to the `collection.sh` script:

```bash
chmod 755 collection.sh
```

Run the `collection.sh` script:
```bash
sh collection.sh
```

A `diskstats-samples.txt` text file is generated in the same directory as the script file. Then use the `pt-diskstats` tool to analyze it:

```bash
pt-diskstats --group-by disk diskstats-samples.txt
```
::: details View the result
```bash
$ pt-diskstats --group-by disk diskstats-samples.txt
  #ts device    rd_s rd_avkb rd_mb_s rd_mrg rd_cnc   rd_rt    wr_s wr_avkb wr_mb_s wr_mrg wr_cnc   wr_rt busy in_prg    io_s  qtime stime
 {19} sda        0.0     0.0     0.0     0%    0.0     0.0     0.4     6.8     0.0     8%    0.0     0.3   0%      0     0.4    0.2   0.2
 {19} sda3       0.0     0.0     0.0     0%    0.0     0.0     0.3     7.9     0.0    10%    0.0     0.3   0%      0     0.3    0.2   0.1
 {19} dm-0       0.0     0.0     0.0     0%    0.0     0.0     0.4     7.2     0.0     0%    0.0     0.5   0%      0     0.4    0.2   0.2
```
:::


The difference is that the ts column shows the number of samples included in the output row. The meanings of the other fields are the same as above.

**View the iops changes of sda during that period**

```bash
pt-diskstats --group-by sample --devices-regex sda --columns-regex io_s diskstats-samples.txt
```

::: details View the result
```bash
$ pt-diskstats --group-by sample --devices-regex sda --columns-regex io_s diskstats-samples.txt

 #ts device    io_s
  0.0 {4}      156.6
......the middle part is omitted
 55.2 {4}        0.0
 56.2 {4}        0.0
```
:::

**View the overall I/O average load of the two disks sda-sdb during the collection period**

```bash
pt-diskstats --group-by disk --devices-regex 'sd[a-c]' diskstats-samples.txt
```

**Tip**

When using the `pt-diskstats` tool for online analysis, pressing the "?" key brings up an interactive help menu, which shows which keys control the program:

```bash
$ pt-diskstats --devices-regex=sda --show-timestamps
15:08:06 sda        0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
15:08:06 sda1       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
15:08:06 sda2       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
15:08:06 sda3       0.0     0.0     0.0     0%    0.0     0.0     0.0     0.0     0.0     0%    0.0     0.0   0%      0     0.0    0.0   0.0
# Entering '?' at this time will pop up a prompt
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

### Overview

It can be used to split large files. After splitting, import them into the GreatSQL database in batches, which does not cause low efficiency and source-replica delay.

**Usage**

```bash
pt-fifo-split [OPTIONS] [FILE]
```

### Options

All options of this tool are as follows:

| Parameter         | Meaning                                                         |
| ------------ | ------------------------------------------------------------ |
| --config     | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --fifo       | The name of the fifo from which rows can be read                                 |
| --force      | If the fifo already exists, delete it and recreate it                   |
| --help       | Display help                                                     |
| --lines      | The number of lines to read in each block                                         |
| --offset     | Start from the Nth line. If the parameter is 0, all lines are printed to the fifo. If it is 1, lines are printed from the first line (exactly the same as 0). If it is 2, the first line is skipped, and the second line and subsequent lines are printed to the fifo |
| --pid        | Create the given PID file                                          |
| --statistics | Print statistics between blocks                                         |
| --version    | Display the version                                                     |

### Best Practices

Use the command `seq 1 1000000 > hugefile.txt` to insert one million lines of data into the hugefile.txt file:

```bash
$ wc -l hugefile.txt           
1000000 hugefile.txt
```

Create the script file `fifo_get.sh` to obtain the split data:

```ini
#!/bin/bash
filename=/tmp/hugefile
n=1
while [ -e /tmp/pt-fifo-split ];
do 
        cat /tmp/pt-fifo-split > "$filename"_"$n".txt ;
        let n++
done
```

Use the `pt-fifo-split` tool to split:

```bash
pt-fifo-split --lines 10000 --statistics hugefile.txt
```
::: details View the result
```bash
$ pt-fifo-split --lines 10000 --statistics hugefile.txt
chunks     lines  time  overall  current
    1     10000    48 208.33 208.33
    2     20000    48 416.67 10000.00
    3     30000    48 625.00 10000.00
    4     40000    48 833.33 10000.00
    5     50000    48 1041.67 10000.00
......the following is omitted
```
:::

Use the script tool to obtain the data:

```bash
$ chmod 755 fifo_get.sh
$ sh fifo_get.sh 
$ ls /tmp/hugefile_* 2>/dev/null | wc -l
100
```

Next, these split files can be imported into the GreatSQL database. At this time, the parallel LOAD DATA feature of GreatSQL can be used, with a maximum import speedup of about 20 times.

Use the LOAD statement with the HINT to enable it:

```sql
greatsql> LOAD /*+ SET_VAR(gdb_parallel_load=ON) SET_VAR(gdb_parallel_load_chunk_size=65536) SET_VAR(gdb_parallel_load_workers=16) */
DATA INFILE 'hugefile.txt' INTO TABLE t1;
```

For details, see: [GreatSQL Parallel LOAD DATA](../5-enhance/5-1-highperf-parallel-load.md) .

::: tip Tip
Of course, the `split` command can also be used for splitting: `split -l 1000 hugefile.txt chunk_` . 
:::

## pt-ioprofile

### Overview

Mainly used to monitor and analyze the I/O activity of the MySQL/GreatSQL process. It uses `strace` and `lsof` to track the I/O situation of the process and prints the related table files and active I/O information.

**Usage**

```bash
pt-ioprofile [OPTIONS] [FILE]
```
::: tip Tip
It is recommended to use root privileges to collect more information.
:::
### Options

All options of this tool are as follows:

| Parameter              | Meaning                                          |
| ----------------- | --------------------------------------------- |
| --aggregate       | The aggregate function, `sum` or `avg`                      |
| --cell            | Specify the content of the cell. Valid values are `count`, `sizes`, `times` |
| --group-by        | The grouping item. Valid values are `all`, `filename`, `pid`      |
| --help            | Display help                                      |
| --profile-pid     | The PID to analyze, overrides `--profile-process`       |
| --profile-process | The process name to analyze                              |
| --run-time        | The length of time to analyze                                |
| --save-samples    | The file name to save samples                              |
| --version         | Display the version                                      |

### Best Practices

Use it directly. The default `--cell` is times, i.e., the time of I/O operations. By default, it monitors the mysqld process for 30 seconds and gives the analysis result within 30 seconds

::: tip Tip
It takes 30 seconds to wait before giving the analysis result; it is not real-time output.
:::

```bash
pt-ioprofile
```
::: details View the result
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

You can specify `--cell` as sizes, i.e., the size of I/O operations:

```bash
pt-ioprofile --cell=sizes
```
::: details View the result
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


You can specify `--cell` as count, i.e., the number of I/O operations:

```bash
pt-ioprofile --cell=count 
```
::: details View the result
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

### Overview

The function of the `pt-stalk` tool is to collect diagnostic information of the GreatSQL database and system when problems occur, which can solve finer-grained on-site fault collection.

**Usage**

```bash
pt-stalk [OPTIONS]
```

::: tip Tip
It is recommended to use root privileges to collect more information.
:::

### Options

All options of this tool are as follows:

| Parameter               | Meaning                                                         |
| ------------------ | ------------------------------------------------------------ |
| --ask-pass         | Prompt for a password when connecting to MySQL/GreatSQL                           |
| --collect          | Collect diagnostic data when a fault occurs. Use `--no-collect` to make the tool only monitor the system without collecting data |
| --collect-gdb      | Collect GDB stack traces                                            |
| --collect-oprofile | Collect oprofile data                                           |
| --collect-strace   | Collect trace data                                                 |
| --collect-tcpdump  | Collect tcpdump data                                            |
| --config           | Read the comma-separated configuration file list. If specified, this must be the first option on the command line |
| --cycles           | How many times `--variable` must be greater than `--threshold` before `--collect` is triggered |
| --daemonize        | Daemon, run in the background                                           |
| --defaults-file    | Read MySQL/GreatSQL options only from the given file                             |
| --dest             | The location to save the diagnostic data of `--collect`. Do not choose the same directory as GreatSQL. It is best to use an independent directory, because the tool deletes files in the directory that exceed a certain date, which may cause accidental deletion. The default directory is `/var/lib/pt-stalk` |
| --disk-bytes-free  | Do not use `--collect` if the available space of the disk is less than this value. Prevents the disk from being filled with the tool's diagnostic data |
| --disk-pct-free    | Do not use `--collect` if the available space of the disk is less than this percentage. This can prevent the tool from filling the disk with diagnostic data. Similar to `--disk-bytes-free`, one is a specific value and the other is a percentage |
| --function         | Set the trigger condition. The default monitors `SHOW GLOBAL STATUS`. It can also be modified to `SHOW PROCESSLIST` through this parameter |
| --help             | Display help                                                     |
| --host             | Connect to the host                                                   |
| --interval         | The frequency of checking whether the trigger is true                                 |
| --iterations       | How many times to collect. The default is to run forever                                   |
| --log              | Print all output to this file when daemonized                             |
| --match            | The pattern used when monitoring `SHOW PROCESSLIST`                           |
| --notify-by-email  | Send the collection information to the specified email                                   |
| --password         | The password used for the connection                                               |
| --pid              | Create the given PID file                                          |
| --plugin           | Load a plugin to connect to this tool and extend its functions                           |
| --mysql-only       | Only trigger MySQL/GreatSQL related captures, ignore all others                     |
| --port             | The port number used for the connection                                             |
| --prefix           | The file name prefix of diagnostic samples. By default, all files created by the same `--collect` instance have a timestamp prefix based on the current local time, such as `2011_12_06_14_02_02`, i.e., December 6, 2011 at 14:02:02 |
| --retention-count  | Retain the data of the last N runs. If N > 0, the program retains the data of the last N runs and deletes older data |
| --retention-size   | Retain up to `–retention-size MB` of data                           |
| --retention-time   | The number of days to retain collected samples                                           |
| --run-time         | How long to trigger the `--collect` diagnostic data, default is 30 seconds                |
| --sleep            | How long to stop after `--collect`, which can prevent the tool from triggering continuously           |
| --sleep-collect    | How long to sleep between collection loop cycles                                 |
| --socket           | The socket file used for the connection                                         |
| --stalk            | Watch the server and wait for the trigger to occur                                     |
| --system-only      | Only trigger operating system related captures, ignore all other captures                 |
| --threshold        | The maximum acceptable value of `--variable`                                  |
| --user             | The login user                                                   |
| --variable         | The variable to compare with `--threshold`                            |
| --verbose          | Print more or less information when running                                     |
| --version          | Display the version                                                     |

### Best Practices

#### Monitoring the Status Values in `SHOW GLOBAL STATUS`

For example, monitor the `Threads_running` status value. If the `Threads_running` status value exceeds 100 for 5 consecutive times, trigger the collection of host and database information:

```bash
pt-stalk --function status --variable Threads_running --cycles 5 --threshold 500 --daemonize --user=root --password=
```

There are three trigger methods:

- status
  By monitoring the parameter values of `SHOW GLOBAL STATUS`, the specific parameter monitored by the `--variable` parameter. Default is `Threads_running`

- processlist

  By monitoring the results of the `SHOW FULL PROCESSLIST` command, the number of times the value of the column specified by the `--variable` parameter matches the value specified by `--match`. For example: State column, matching value: statistics

- Custom script

#### Immediately Collecting Host and Database Information

Without waiting for the trigger to occur, immediately collect the host and database information within 60 seconds, wait for 180 seconds, and then exit automatically:

```bash
pt-stalk --no-stalk --run-time=60 --iterations=1 --user=root --password=
```

View the default diagnostic data storage location `/var/lib/pt-stalk`:

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

There are many collected files. As can be seen from the file names, the naming method is by command name. At the same time, the `pt-sift` tool can also be used to view the contents of the generated files.

## pt-sift

### Overview

Used to analyze and view the file contents generated by the `pt-stalk` command, produce summary information, and then view different contents by entering different commands. For example, entering `m` views the contents of the `SHOW STATUS` command.

**Usage**

```bash
pt-sift FILE|PREFIX|DIRECTORY
```

This is an interactive command.

### Options

All options of this tool are as follows:

| Parameter      | Meaning     |
| --------- | -------- |
| --help    | Display help |
| --version | Display the version |

### Best Practices

#### Display All Information Collected by pt-stalk

You can directly use the `pt-sift` command and add the storage address of the information collected by the `pt-stalk` tool:

```bash
pt-sift /var/lib/pt-stalk
```

At this time, an interactive command line pops up. You can view help information by entering ?, and display different contents by entering different commands

- d: Set the operation to start the pt-diskstats tool on the sample disk performance statistics.
- i: Set the operation to view the first INNODB STATUS sample in less.
- m: Use the pt-mext tool to display the first 4 samples of the SHOW STATUS counters side by side.
- n: Summarize the first sample of netstat data in two ways: by original host and by connection state.
- j: Select the next timestamp as the active sample.
- k: Select the previous timestamp as the active sample.
- q: Quit the program.
- 1: Set the operation for each sample to the default, i.e., view the summary of the sample.
- 0: Set the operation to only list the files in the sample.
- *: View all files.

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

### Overview

The printed information covers core information such as CPU, memory, hard disk, and network card. It also displays detailed configurations such as file systems, disk scheduling, queue sizes, LVM, and RAID, as well as network connection statistics and netstat analysis, and highlights the top 10 loads and `vmstat` data.

**Usage**

```bash
pt-summary
```
### Options

| Parameter                  | Meaning                                                         |
| --------------------- | ------------------------------------------------------------ |
| --config              | Read this comma-separated configuration file list. If specified, this must be the first option on the command line |
| --help                | Display help                                                     |
| --read-samples        | Create a report from the files in this directory                                     |
| --save-samples        | Save the collected data in this directory                                 |
| --sleep               | How long to sleep when collecting samples from `vmstat`                             |
| --summarize-mounts    | Report installed file systems and disk usage                           |
| --summarize-network   | Report on network controllers and configuration                                   |
| --summarize-processes | Report top processes and `vmstat` output                                 |
| --version             | Print the tool version and exit                                         |

### Best Practices

Use it directly:

```bash
pt-summary
```

This section displays the current date and time, as well as an overview of the server and operating system:

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

This section is extracted from `/proc/cpuinfo`:

```bash
# Processor ##################################################
  Processors | physical = 1, cores = 6, virtual = 12, hyperthreading = yes
      Speeds | 1x4071.589, 1x4177.016, 1x4179.769, 1x4197.696, 1x4197.784, 1x4198.704, 6x800.000
      Models | 12xIntel(R) Core(TM) i7-8850H CPU @ 2.60GHz
      Caches | 12x9216 KB
```

This section is memory information. Generated from `free`, `ps`, `sysctl`, and `dmidecode`:

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

This section is mounted file systems. Generated from `mount` and `df`:

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

This section is disk scheduling information. Extracted from `/sys`:

```bash
# Disk Schedulers And Queue Size #############################
     nvme0n1 | [none] 1023
         sda | [mq-deadline] 64
```

This section is disk partition information. Generated from `fdisk -l`:

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

This section is `Kernel Inode State`:

```bash
# Kernel Inode State #########################################
dentry-state | 733944   717873  45      0       291017  0
     file-nr | 1120     0       9223372036854775807
    inode-nr | 631593   103806
```

This section is kernel inode information. Respectively extracted from files with the same names under the `/proc/sys/fs` directory:

```bash
# LVM Volumes ################################################
Unable to collect information
# LVM Volume Groups ##########################################
Unable to collect information
```

This section is the RAID controller. Generated from `lvs`:

```bash
# RAID Controller ############################################
  Controller | No RAID controller detected
```

This section is network configuration. Generated from `lspci` and `sysctl`:

```bash
# Network Config #############################################
  Controller | Intel Corporation Ethernet Connection (7) I219-LM (rev 10)
 FIN Timeout | 60
  Port Range | 60999
```

This section is network interface statistics. Generated from `ip -s link`:

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

This section is the first few lines of the `TOP` command:

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

This section is a place to pay attention to. Here it prompts that `sshd` is not running:

```bash
# Notable Processes ##########################################
  PID    OOM    COMMAND
    ?      ?    sshd doesn't appear to be running
```

This section is memory management. Here it prompts that transparent huge pages are enabled:

```bash
# Memory management ##########################################
Transparent huge pages are enabled.
```

This section indicates the end:

```bash
# The End ####################################################
```

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
