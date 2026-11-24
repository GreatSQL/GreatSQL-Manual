# Installation Preparation
---

This document describes the runtime environment that needs to be prepared before installing GreatSQL.

GreatSQL can be deployed and run well on Intel architecture server environments, ARM architecture server environments, and mainstream virtualization environments, and supports most mainstream hardware networks.

GreatSQL supports the following installation methods:
- RPM package
- Tarball package
- Docker
- Ansible
- Source code compilation

Supports x86 and ARM, Kunpeng, Hygon, LoongArch, and other CPU architecture platforms.

Supports CentOS, Ubuntu, UnionTech OS, openEuler, Anolis, Kylin, and other common operating systems.

Unless otherwise specified in this chapter, all installation environments refer to the **CentOS 8.x x86_64 environment**.

## Hardware Environment

GreatSQL supports deployment and operation on 64-bit general-purpose hardware server platforms with the Intel x86_64 architecture, or hardware server platforms with the ARM architecture.

For development, test, and production environment server hardware configurations, the following requirements and recommendations apply:

**Development and Test Environment**

| Configuration | Requirement |
| --- | --- |
| CPU | 1 cores+ |
| Memory | 1 GB+ |
| Disk | 10 GB+ |
| Network | 100 Mbps network |

**Production Environment**

| Configuration | Requirement |
| --- | --- |
| CPU | 8 cores+ |
| Memory | 8 GB+ |
| Disk | 100 GB+ |
| Network | 1 Gbps network |

## System Environment

GreatSQL supports mainstream Linux operating system environments.

| Linux Operating System    | Version |
| --- | --- |
| Red Hat Enterprise Linux    | 7.x and above |
| CentOS    | 7.x and above |
| Oracle Enterprise Linux    | 7.x and above |
| Ubuntu LTS    | 16.04 and above |
| UnionTech OS | 20 and above |
| openEuler | 20.03 and above |
| Anolis OS | 8.6 and above |
| Kylin Linux | V10 and above |

## Mounting a Dedicated Database Partition
It is recommended to use a partition with the XFS file system to store GreatSQL database files. Its comprehensive performance, reliability, security, and stability have been proven in a large number of online scenarios.

Taking the /dev/nvme0n1 data disk as an example, the specific operation steps are as follows:

1. **Format the entire partition as an xfs file system**
```bash
mkfs.xfs -f -L /data /dev/nvme0n1
```

2. **Modify the `/etc/fstab` system file and add the dedicated database partition**
```ini
LABEL=/data /data    xfs     defaults,noatime,nodiratime,inode64 0 0
```
3. **Create the `/data` directory and mount the partition**
```bash
mkdir -p /data && mount /data
```

4. **Check the partition mounting result**
```bash
$ mount | grep /data

...
/dev/nvme0n1 on /data type xfs (rw,noatime,nodiratime,attr2,inode64,logbufs=8,logbsize=32k,noquota)
```

## Disabling the Firewall and SELinux

Database servers usually run on internal networks. In addition, multiple TCP ports need to be opened on the internal network when deploying MGR, so the firewall and SELinux settings can be disabled.

::: tip Tip
Although data is deployed on the internal network, always be alert to the risk of data leakage and take necessary security protection measures.
:::

1. **Disable the firewall service**
```bash
systemctl stop firewalld ; systemctl disable firewalld
```

2. **Disable SELinux**
```bash
setenforce=0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

## Disabling swap

It is recommended to configure sufficient physical memory when running GreatSQL. If memory is insufficient, using swap as a buffer is not recommended, because it reduces performance. It is recommended to permanently disable system swap.
```bash
echo "vm.swappiness=0">> /etc/sysctl.conf
swapoff -a && swapon -a
sysctl -p
```

::: tip Tip
Regarding the setting of `vm.swappiness=0`, there are two different views in the industry.
:::

- One view is: **it is not recommended to set it to 0**, because in a sense there is a risk. When the system memory is insufficient, it will not try to use swap, but directly trigger the oom-kill mechanism, which may cause the GreatSQL service process to be killed. In scenarios where double 1 is not set, this may cause the loss of some transaction data.

- Another view is: **it is recommended to set it to 0**, because when swap is used, the database response speed usually drops very seriously, giving a very poor experience to the business side. In this case, it is better to directly kill or restart the service process to avoid triggering an avalanche effect.

For the above two views, please make your own choice and judgment.

## Operating System Optimization

1. **Modify the I/O Scheduler setting of the database partition to noop / deadline**

First check the current setting
```bash
$ cat /sys/block/nvme0n1/queue/scheduler

...
none
```
This is fine. If it is not noop or deadline, it can be modified:

```bash
echo 'noop' > /sys/block/nvme0n1/queue/scheduler
```
This modification takes effect immediately without restarting.

2. **Confirm the CPU performance mode setting**

First check the current setting mode
```bash
$ cpupower frequency-info --policy

...
analyzing CPU 0:
  current policy: frequency should be within 800 MHz and 4.80 GHz.
                  The governor "performance" may decide which speed to use
```
::: tip Tip

If the output is not The governor "performance" but The governor "powersave", then attention is needed.

The governor "powersave" indicates that the energy-saving strategy of cpufreq uses powersave, which needs to be adjusted to the performance strategy.

If it is a virtual machine or cloud host, no adjustment is needed, and the command output is usually Unable to determine current policy.
:::

3. **Disable Transparent Huge Pages**

It is recommended to disable Transparent Huge Pages (THP). The memory access pattern of OLTP databases is usually sparse rather than continuous. When high-order memory fragmentation is serious, allocating THP pages will have higher latency, which in turn affects performance.

First check the current setting:
```bash
$ cat /sys/kernel/mm/transparent_hugepage/enabled

...
always madvise [never]
```
If the output is not **never**, execute the following commands to disable it:
```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```

4. **Optimize kernel parameters**
It is recommended to adjust and optimize the following kernel parameters:
```bash
echo "fs.file-max=1000000" >> /etc/sysctl.conf
echo "net.core.somaxconn=32768" >> /etc/sysctl.conf
echo "net.ipv4.tcp_syncookies=0" >> /etc/sysctl.conf
echo "vm.overcommit_memory=1" >> /etc/sysctl.conf
sysctl -p
```

5. **Modify the resource upper limit of the mysql user**

Modify the `/etc/security/limits.conf` system file to increase the upper limit of the mysql system account:
```ini
mysql           soft    nofile         65535
mysql           hard    nofile         65535
mysql           soft    stack          32768
mysql           hard    stack          32768
mysql           soft    nproc          65535
mysql           hard    nproc          65535
```

6. **Confirm the NUMA mode**
It is recommended to enable NUMA mode for better performance.

After enabling NUMA and configuring it correctly, in a certain test, OLTP performance improved by about 10% ~ 20%.

Starting from GreatSQL 8.0.32-27, [NUMA affinity optimization](../5-enhance/5-1-highperf-numa-affinity.md) is supported, which also helps optimize performance in high-load scenarios.

Taking CentOS as an example, open the `/etc/default/grub` file and ensure that the file content does not contain the `NUMA=OFF` text. If it does, delete it:
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

If the `/etc/default/grub` file is modified, the UEFI boot file needs to be regenerated:
```
grub2-mkconfig -o /boot/efi/EFI/centos/grub.cfg
```

Then restart the operating system to make it take effect.

After enabling NUMA at the operating system level, remember to modify the GreatSQL configuration option `innodb_numa_interleave=ON` to ensure that InnoDB uses the correct NUMA policy when allocating memory.

If the GreatSQL service process is started manually, `numactl --interleave=all` can also be added at startup, for example:
```bash
numactl --interleave=all /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld &
```

If `systemd` is used to start the GreatSQL service process, the `/etc/systemd/system.conf` configuration file can be modified to add a line in the *[Manager]* section:
```ini
NUMAPolicy=interleave
```
After modification, reload the `systemd` configuration to ensure the NUMA policy takes effect:
```bash
systemctl daemon-reload
```

## Others

- **Configure the correct yum source, and install some dependency packages in advance**

Confirm that the yum source is available, because other dependency packages need to be installed first when installing GreatSQL, and installing through yum is the most convenient.

If the yum source needs to be configured, refer to [this document](https://developer.aliyun.com/mirror/centos).

When installing the GreatSQL RPM package, these related dependency packages need to be installed first.
```bash
yum install -y pkg-config perl libaio-devel numactl-devel numactl-libs net-tools openssl openssl-devel jemalloc jemalloc-devel perl-Data-Dumper perl-Digest-MD5 python2 perl-JSON perl-Test-Simple
```
If more dependency packages need to be installed, add them yourself. If a dependency package installation fails or is not found, delete it and then retry.

Add/modify the system file `/etc/sysconfig/mysql`:
```ini
LD_PRELOAD=/usr/lib64/libjemalloc.so
THP_SETTING=never
```
Confirm whether the file `/usr/lib64/libjemalloc.so` exists (it may be a symbolic link file):
```bash
$ ls -la /usr/lib64/libjemalloc.so*

...
lrwxrwxrwx 1 root root     16 Oct  2  2019 /usr/lib64/libjemalloc.so -> libjemalloc.so.2
-rwxr-xr-x 1 root root 608096 Oct  2  2019 /usr/lib64/libjemalloc.so.2
```
In this way, when GreatSQL is started with the systemd method, the `jemalloc` dynamic library is loaded. The following method can be used to view and confirm:

```bash
$ lsof -p 43653 | grep -i jema

...
mysqld  52003 mysql  mem       REG              253,0     608096   68994440 /usr/lib64/libjemalloc.so.2

```

::: tip Reminder
When starting GreatSQL with the systemd method, ensure that the `EnvironmentFile=-/etc/sysconfig/mysql` parameter has been configured in the service file. For details, refer to: [Managing GreatSQL with systemd](./8-greatsql-with-systemd.md#editing-the-systemd-service-configuration-script).

If GreatSQL is started in other ways, `export LD_PRELOAD=/usr/lib64/libjemalloc.so` can be executed in the terminal command line mode before startup, so that the jemalloc library can be loaded when GreatSQL starts.
:::

It is recommended to use Jemalloc instead of the malloc library bundled with glibc. Its advantages are reducing memory fragmentation and improving memory allocation efficiency in high-concurrency scenarios, improving memory management efficiency while also reducing the risk of OOM during database runtime.

In ARM environments, the above jemalloc dependency does not need to be installed and configured.

- **Configure the correct NTP service**

Building MGR requires multiple nodes, and time synchronization must be ensured between nodes.

NTP service is usually used to ensure time synchronization. For a specific solution, refer to this document: [How to configure NTP server on RHEL 8 / CentOS 8 Linux](https://linuxconfig.org/redhat-8-configure-ntp-server).

- **Install other common auxiliary tool packages**

It is recommended to install auxiliary tool packages commonly used by DBAs in advance:
```bash
yum install -y net-tools perf sysstat iotop tmux
```

After installing the `sysstat` package, edit the file `/etc/cron.d/sysstat` and modify the sysstat running frequency (adjust from running every 10 minutes to running every 1 minute):
```ini
#*/10 * * * * root  /usr/lib64/sa/sa1 1 1
*/1 * * * * root  /usr/lib64/sa/sa1 1 1
```


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
