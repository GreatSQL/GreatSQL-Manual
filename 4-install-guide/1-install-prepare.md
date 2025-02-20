# 安装准备
---

本文档描述安装 GreatSQL 之前需要先准备的运行环境说明。

GreatSQL 可以很好地部署和运行在 Intel 架构服务器环境、ARM 架构的服务器环境及主流虚拟化环境，并支持绝大多数的主流硬件网络。

GreatSQL 支持以下几种安装方式：
- RPM包
- 二进制包
- Docker
- Ansible
- 源码编译

支持X86和ARM、鲲鹏、海光、龙芯等多种CPU架构平台。

支持CentOS、Ubuntu、统信、openEuler、龙蜥、麒麟等多种常见操作系统。

本章节文档若无特别说明，所有安装环境均是指 **CentOS 8.x x86_64 环境**。

##  硬件环境

GreatSQL 支持部署和运行在 Intel x86_64 架构的 64 位通用硬件服务器平台或者 ARM 架构的硬件服务器平台。

对于开发、测试及生产环境的服务器硬件配置有以下要求和建议：

**开发及测试环境**

| 配置 | 要求 |
| --- | --- |
| CPU | 1 cores+ |
| 内存 | 1 GB+ |
| 磁盘 | 10 GB+ |
| 网络 | 百兆网络 |

**生产环境**

| 配置 | 要求 |
| --- | --- |
| CPU | 8 cores+ |
| 内存 | 8 GB+ |
| 磁盘 | 100 GB+ |
| 网络 | 千兆网络 |

## 系统环境

GreatSQL 支持主流的 Linux 操作系统环境。

| Linux 操作系统    | 版本 |
| --- | --- |
| Red Hat Enterprise Linux    | 7.x 及以上的版本 |
| CentOS    | 7.x 及以上的版本 |
| Oracle Enterprise Linux    | 7.x 及以上的版本 |
| Ubuntu LTS    | 16.04 及以上的版本 |
| UnionTech OS | 20 及以上的版本 |
| openEuler | 20.03 及以上的版本 |
| Anolis OS | 8.6 及以上的版本 |
| Kylin Linux | V10 及以上的版本 |

## 挂载数据库专用分区
建议采用XFS文件系统的分区来存储 GreatSQL 数据库文件，其综合性能、可靠性、安全性、稳定性已经在大量线上场景中得到证实。

以 /dev/nvme0n1 数据盘为例，具体操作步骤如下：

1. **将整个分区都格式化为xfs文件系统**
```bash
mkfs.xfs -f -L /data /dev/nvme0n1
```

2. **修改 `/etc/fstab` 系统文件，增加数据库专用分区**
```ini
LABEL=/data /data    xfs     defaults,noatime,nodiratime,inode64 0 0
```
3. **创建 `/data` 目录，挂载分区**
```bash
mkdir -p /data && mount /data
```

4. **检查分区挂载结果**
```bash
$ mount | grep /data

...
/dev/nvme0n1 on /data type xfs (rw,noatime,nodiratime,attr2,inode64,logbufs=8,logbsize=32k,noquota)
```

## 关闭防火墙及selinux

数据库服务器通常运行在内部网络，此外部署MGR时也需要对内网开放多个TCP端口，因此可以关闭防火墙及selinux设置。

::: tip 小贴士
虽然数据部署在内部网络，但也要时刻警惕数据泄漏的风险，做好必要的安全防护措施。
:::

1. **关闭防火墙服务**
```bash
systemctl stop firewalld ; systemctl disable firewalld
```

2. **关闭selinux**
```bash
setenforce 0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

## 关闭swap

运行 GreatSQL 建议配置足够的物理内存。如果内存不足，不建议使用 swap 作为缓冲，因为这会降低性能。建议永久关闭系统 swap。
```bash
echo "vm.swappiness = 0">> /etc/sysctl.conf
swapoff -a && swapon -a
sysctl -p
```

::: tip 小贴士
对于 `vm.swappiness=0` 的设置，业内有以下两种不同看法。
:::

- 一种观点是：**不建议设置为0**，因为某种意义上存在风险，当系统内存不够用时，不会尝试去使用swap，而直接触发oom-kill机制，这可能会导致GreatSQL服务进程被kill，这在设置非双1的场景中可能会导致部分事务数据丢失。

- 另一种观点是：**建议设置为0**，因为当使用swap时，通常会导致数据库响应速度下降非常严重，对业务端体验非常差，这种情况下，不如直接kill或重启服务进程，避免引发雪崩效应。

对于上述两种观点，请用户自行选择判断。

## 操作系统优化

1. **修改数据库分区的 I/O Scheduler 设置为 noop / deadline**

先查看当前设置
```bash
$ cat /sys/block/nvme0n1/queue/scheduler

...
none
```
这样没问题，如果不是 noop 或 deadline，可以动手修改：

```bash
echo 'noop' > /sys/block/nvme0n1/queue/scheduler
```
这样修改后立即生效，无需重启。

2. **确认CPU性能模式设置**

先检查当前的设置模式
```bash
$ cpupower frequency-info --policy

...
analyzing CPU 0:
  current policy: frequency should be within 800 MHz and 4.80 GHz.
                  The governor "performance" may decide which speed to use
```
::: tip 小贴士

如果输出内容不是 The governor "performance" 而是 The governor "powersave" 的话，则要注意了。

The governor "powersave" 表示 cpufreq 的节能策略使用 powersave，需要调整为 performance 策略。

如果是虚拟机或者云主机，则不需要调整，命令输出通常为 Unable to determine current policy。
:::

3. **关闭透明大页**

建议关闭透明大页（Transparent Huge Pages / THP）。OLTP型数据库内存访问模式通常是稀疏的而非连续的。当高阶内存碎片化比较严重时，分配 THP 页面会出现较高的延迟，反而影响性能。

先检查当前设置：
```bash
$ cat /sys/kernel/mm/transparent_hugepage/enabled

...
always madvise [never]
```
如果输出结果不是 **never** 的话，则需要执行下面的命令关闭：
```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```

4. **优化内核参数**
建议调整优化下面几个内核参数：
```bash
echo "fs.file-max = 1000000" >> /etc/sysctl.conf
echo "net.core.somaxconn = 32768" >> /etc/sysctl.conf
echo "net.ipv4.tcp_syncookies = 0" >> /etc/sysctl.conf
echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
sysctl -p
```

5. **修改mysql用户使用资源上限**

修改 `/etc/security/limits.conf` 系统文件，调高mysql系统账户的上限：
```ini
mysql           soft    nofile         65535
mysql           hard    nofile         65535
mysql           soft    stack          32768
mysql           hard    stack          32768
mysql           soft    nproc          65535
mysql           hard    nproc          65535
```

6. **确认NUMA模式**
推荐开启NUMA模式以获得更好的性能表现。

开启NUMA并正确设置后，在某次测试中，OLTP性能提升约10% ~ 20%。

从 GreatSQL 8.0.32-26 开始支持 [NUMA 亲和性优化](../5-enhance/5-1-highperf-numa-affinity.md)，对高负载场景下的性能优化也有帮助。

以CentOS为例，打开 `/etc/default/grub` 文件，确保文件内容中没有 `NUMA=OFF` 字样，如果有的话就删掉：
```ini
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR="$(sed 's, release .*$,,g' /etc/system-release)"
GRUB_DEFAULT=saved
GRUB_DISABLE_SUBMENU=true
GRUB_TERMINAL_OUTPUT="console"
#GRUB_CMDLINE_LINUX="crashkernel=auto spectre_v2=retpoline rhgb quiet numa=off"
GRUB_CMDLINE_LINUX="crashkernel=auto spectre_v2=retpoline rhgb quiet"
GRUB_DISABLE_RECOVERY="true"
```

如果修改了 `/etc/default/grub` 文件，需要重新生成UEFI启动文件：
```
grub2-mkconfig -o /boot/efi/EFI/centos/grub.cfg
```

然后重启操作系统，使之生效。

操作系统层开启NUMA后，还要记得修改GreatSQL配置选项 `innodb_numa_interleave = ON`，确保InnoDB在分配内存时使用正确的NUMA策略。

如果采用手动方式启动GreatSQL服务进程，还可以在启动时加上 `numactl --interleave=all`，例如：
```bash
numactl --interleave=all /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld &
```

如果采用 `systemd` 来启动 GreatSQL服务进程，则可以修改 `/etc/systemd/system.conf` 配置文件，在 *[Manager]* 这个区间内增加一行：
```ini
NUMAPolicy=interleave
```
修改完毕后，重新加载 `systemd` 配置，确保NUMA策略生效：
```bash
systemctl daemon-reload
```

## 其他

- **配置正确的yum源，并提前安装一些依赖包**

要确认yum源可用，因为安装GreatSQL时还要先安装其他依赖包，通过yum安装最省事。

如果需要配置yum源，可以参考[这篇文档](https://developer.aliyun.com/mirror/centos)。

安装GreatSQL RPM包时，要先安装这些相关依赖包。
```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```
如果有更多依赖包需要安装，请自行添加。如果报告个别依赖包安装失败或者找不到就删掉，然后重试。

添加/修改系统文件 `/etc/sysconfig/mysql`：
```ini
LD_PRELOAD=/usr/lib64/libjemalloc.so
THP_SETTING=never
```
确认文件 `/usr/lib64/libjemalloc.so` 是否存在（可能是个软链接文件）：
```bash
$ ls -la /usr/lib64/libjemalloc.so*

...
lrwxrwxrwx 1 root root     16 Oct  2  2019 /usr/lib64/libjemalloc.so -> libjemalloc.so.2
-rwxr-xr-x 1 root root 608096 Oct  2  2019 /usr/lib64/libjemalloc.so.2
```
这样在启动MySQL时就会加载 `jemalloc` 动态库了。

建议采用Jemalloc代替glibc自带的malloc库，其优势在于减少内存碎片和提升高并发场景下内存的分配效率，提高内存管理效率的同时还能降低数据库运行时发生OOM的风险。

如果是ARM环境下，可以不必安装配置上述 jemalloc 依赖。

- **配置正确的NTP服务**

构建MGR需要由多节点组成，各节点间要保证时间同步。

通常采用 NTP 服务来保证时间同步，具体解决方案可参考这篇文档：[How to configure NTP server on RHEL 8 / CentOS 8 Linux](https://linuxconfig.org/redhat-8-configure-ntp-server)。

- **安装其他常用辅助工具包**

建议提前安装DBA常用的辅助工具包：
```bash
yum install -y net-tools perf sysstat iotop tmux
```

安装完 `sysstat` 包之后，编辑文件 `/etc/cron.d/sysstat`，修改sysstat运行频率（将原先每10分钟运行调整为每1分钟运行）：
```ini
#*/10 * * * * root  /usr/lib64/sa/sa1 1 1
*/1 * * * * root  /usr/lib64/sa/sa1 1 1
```


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
