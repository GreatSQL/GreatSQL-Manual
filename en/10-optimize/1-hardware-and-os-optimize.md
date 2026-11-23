# Hardware and Operating System Optimization
---

This article mainly introduces multi-level optimization references from hardware and operating system.

## Server Configuration and Optimization

If the GreatSQL database is run on a physical machine, it is recommended to use at least the following configuration levels:

| Configuration | Requirement |
| --- | --- |
| CPU | 8 cores+ |
| Memory | 8 GB+ |
| Disk | 100 GB+ |
| Network | 1 Gbps network |

If you want to support higher database service capabilities, the server configuration should be further improved, including but not limited to the following points:

1. Configure a higher-performance CPU. Not only is more cores better, but a higher processing clock frequency is also better.
2. Configure larger physical memory.
3. Configure devices with higher physical IOPS performance, such as NVMe SSDs. Using better physical I/O devices usually has a lower overall cost than increasing physical memory.
4. For X86 architecture CPUs, it is usually recommended to disable NUMA; for ARM architecture, NUMA can be enabled. The MySQL/GreatSQL database is a single-process multi-threaded mode. In the single-instance scenario, there is no need to enable NUMA; when running multiple instances, NUMA can be enabled to improve performance.
5. Adjust the CPU settings to maximum performance mode.
6. If an MGR cluster is planned to be built, conditions of no less than a gigabit network are usually required. If possible, even a 10-gigabit network or InfiniBand network can be used.

For details, refer to the document: [Installation Preparation](../4-install-guide/1-install-prepare.md#hardware-environment).

## Operating System Layer Optimization

1. Use the XFS file system to ensure IOPS performance and stability under high I/O load.
2. Modify the I/O Scheduler of the database partition and set it to noop / deadline.
3. Disable SWAP. It is recommended to configure sufficient physical memory when running database services. If memory is insufficient, using SWAP as a buffer is not recommended, because it reduces performance. It is recommended to permanently disable system SWAP.
4. Disable Transparent Huge Pages (THP). The memory access pattern of OLTP databases is usually sparse rather than continuous. When high-order memory fragmentation is serious, allocating THP pages will have higher latency, which in turn affects performance.
5. Adjust the resource upper limit of the MySQL user to avoid limit errors such as insufficient file counts.
6. Other kernel parameter optimizations.

For details, refer to the document: [Installation Preparation](../4-install-guide/1-install-prepare.md#system-environment).


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
