# GreatSQL vs MySQL TPC-C 性能测试（2025.12.26）

**GreatSQL TPC-C 性能测试报告**

**（2025年12月26日）**

**GreatSQL 社区**

## 1.【文档声明】

GreatSQL 社区提醒您在阅读或使用本文档之前仔细阅读、充分理解本法律声明各条款的内容。如果您阅读或使用本文档，您的阅读或使用行为将被视为对本声明全部内容的认可。您应当通过 GreatSQL 社区网站或 GreatSQL 社区提供的其他授权通道下载、获取本文档，且仅能用于自身的合法合规的业务活动。本文档的内容视为 GreatSQL 社区的保密信息，您应当严格遵守保密义务；未经 GreatSQL 社区事先书面同意，您不得向任何第三方披露本手册内容或提供给任何第三方使用。

未经 GreatSQL 社区事先书面许可，任何单位、公司或个人不得擅自摘抄、翻译、复制本文档内容的部分或全部，不得以任何方式或途径进行替换和宣传。

由于产品版本升级、调整或其他原因，本文档内容有可能变更。GreatSQL 社区保留在没有任何通知或者提示下对本文档的内容进行修改的权利，并在 GreatSQL 社区授权通道中不定期发布更新后的用户文档。您应当实时关注用户文档的版本变更并通过 GreatSQL 社区授权渠道下载、获取最新版的用户文档。

本文档仅作为用户使用 GreatSQL 社区产品及服务的参考性指引。GreatSQL 社区在现有技术的基础上尽最大努力提供相应的介绍及操作指引，但 GreatSQL 社区在此明确声明对本文档内容的准确性、完整性、适用性、可靠性等不作任何明示或暗示的保证。任何单位、公司或个人因为下载、使用或信赖本文档而发生任何差错或经济损失的，GreatSQL 社区不承担任何法律责任。在任何情况下，GreatSQL 社区均不对任何间接性、后果性、惩戒性、偶然性、特殊性或刑罚性的损害，包括用户使用或信赖本文档而遭受的利润损失，承担责任（即使 GreatSQL 社区已被告知该等损失的可能性）。

GreatSQL 社区文档中所有内容，包括但不限于图片、架构设计、页面布局、文字描述，均由 GreatSQL 社区和/或其关联公司依法拥有其知识产权，包括但不限于商标权、专利权、著作权、商业秘密等。非经 GreatSQL 社区和/或其关联公司书面同意，任何人不得擅自使用、修改、复制、公开替换、改变、散布、发行或公开发表 GreatSQL 社区网站、产品程序或内容。此外，未经 GreatSQL 社区事先书面同意，任何人不得为了任何营销、广告、促销或其他目的使用、公布或复制 GreatSQL 社区的名称（包括但不限于单独为或以组合形式包含“GreatSQL 社区”、“GreatSQL”等 GreatSQL 社区和/或其关联公司品牌，上述品牌的附属标志及图案或任何类似公司名称、商号、商标、产品或服务名称、域名、图案标示、标志、标识或通过特定描述使第三方能够识别 GreatSQL 社区和/或其关联公司）。

如若发现本文档存在任何错误，请与 GreatSQL 社区取得直接联系。

GreatSQL社区官网：[https://greatsql.cn](https://greatsql.cn)。

## 2. 概述

本次测试针对 GreatSQL 数据库基于 [BenchmarkSQL](./3-4-benchmarksql.md) 的标准 TPC-C 场景的测试。

BenchmarkSQL 是一个开源的 Java 应用程序，用于评估数据库系统在 OLTP 场景下的性能，它是符合 TPC-C 基准压力测试的工具。它最初由 HammerDB 的作者开发，后来由 Cloud V LLC 维护。

TPC-C 模型是模拟一个商品批发公司的销售模型，这个模型涵盖了一个批发公司面向客户对一系列商品进行销售的过程，这包括管理订单，管理库存，管理账号收支等操作。这些操作涉及到仓库、商品、客户、订单等概念，围绕这些概念，构造了数据表格，以及相应的数据库操作。

BenchmarkSQL 支持 MySQL（Percona、GreatSQL）、PostgreSQL、Oracle、SQL Server 等。

GreatSQL 数据库是一款 **开源免费** 数据库，可在普通硬件上满足金融级应用场景，具有 **高可用**、**高性能**、**高兼容**、**高安全** 等特性，可作为 MySQL 或 Percona 的理想可选替换。

下文中提到的 **ibp** 是指 *innodb_buffer_pool_size* 参数简写。

本次测试的目的：对GreatSQL 8.4.4-4（简称GreatSQL）、MySQL 8.4.4（简称MySQL）进行TPC-C性能测试，对比这两个数据库分别在Intel X86和鲲鹏ARM平台下不同的性能表现。

## 3. 测试结果

从本次测试的结果来看，可以得到以下几点结论：

1. 总体而言，在主要几个并发场景中，GreatSQL相对MySQL的性能能提升约10% - 20%。
2. GreatSQL相对MySQL的性能抖动更小，tpmC和Latency数据都更平稳。
3. 在经过8小时连续压测后，在Intel X86平台下，GreatSQL的tpmC降为原来的90%，在鲲鹏ARM平台降为原来的76%，而MySQL则相应分别降为原来的50%和45%；证明GreatSQL相对MySQL的稳定性更优秀可靠。

以上结论，仅基于本次测试的几个场景的总结。

TPC-C性能对比图如下所示：

- Intel X86下的对比图

![GreatSQL 8.4.4-4 vs MySQL 8.4.4 Warehouses 1000 tpmC under X86](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86.png)

- 鲲鹏ARM下的对比图

![GreatSQL 8.4.4-4 vs MySQL 8.4.4 Warehouses 1000 tpmC under ARM](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm.png)

- 测试服务器信息

|        | Intel X86                                                           | 鲲鹏ARM |
| :---   | :---                                                                | :--- |
| 服务端 | Dell R840<br/>Intel 6238 x 4, 共176核；256Gi内存；Nvme SSD, 3TB * 1 | Huawei TS200-2280 V2<br/>Kunpeng 920 7270Z x 2, 共256核；内存：2TB内存；存储：Nvme SSD, 3TB |
| 客户端 | Dell R840<br/>Intel 6238 x 4, 共176核；377Gi内存；Nvme SSD, 3TB * 1 | Huawei TS200-2280 V2<br/>Kunpeng 920 7270Z x 2, 共128核；内存：2TB内存；存储：Nvme SSD, 3TB |

- 测试模式

| 数据库     | - GreatSQL-8.4.4-4-Linux-glibc2.28<br/> - mysql-8.4.4-linux-glibc2.17 |
| :---       | :--- |
| 测试工具   | BenchmakrSQL 5.0 |
| 测试数据量 | warehouses = 1000<br/> 测试数据库初始化后物理大小约 90GB |

## 4. 测试结果详细数据
### 4.1 Intel X86 平台测试数据

1. GreatSQL 8.4.4-4
- innodbbufferpool_size=180G
- 只启用NUMA，未进行网卡中断绑定，双1模式+开slow log+pfs

| 并发数 | 32         | 64         | 128        | 256        | 384        | 512        |
|--------|------------|------------|------------|------------|------------|------------|
| round 1 | 201907.41  | 332984.55  | 488054.97  | 511285.03  | 412555.37  | 406627.81  |
| round 2 | 202717.73  | 334184.79  | 491608.93  | 524536.51  | 426337.31  | 408807.53  |
| round 3 | 202878.23  | 335139.59  | 492393.93  | 525970.00  | 427441.67  | 428666.25  |
| round 4 | 203652.66  | 338542.96  | 493886.09  | 526874.49  | 428892.93  | 439100.95  |
| round 5 | 204745.76  | 340275.05  | 495615.97  | 527100.01  | 437859.65  | 442972.41  |
| avg     | **203180.36**  | **336225.39**  | **492311.98**  | **523153.21**  | **426617.39**  | **425234.99**  |

2. MySQL 8.4.4
- innodbbufferpool_size=180G
- 只启用NUMA，未进行网卡中断绑定，双1模式+开slow log+pfs

| 并发数 | 32         | 64         | 128        | 256        | 384        | 512        |
|--------|------------|------------|------------|------------|------------|------------|
| round 1 | 156110.47  | 262799.11  | 385478.94  | 459070.91  | 442072.99  | 414013.36  |
| round 2 | 162735.65  | 276969.75  | 389364.69  | 463834.48  | 455029.77  | 427281.38  |
| round 3 | 162765.30  | 277795.95  | 394744.22  | 480302.58  | 464610.22  | 442331.82  |
| round 4 | 163458.46  | 282947.50  | 401869.24  | 484189.69  | 471868.69  | 451571.49  |
| round 5 | 164966.72  | 284580.72  | 412365.76  | 485594.32  | 472196.95  | 451871.54  |
| avg     | **162007.32**  | **277018.61**  | **396764.57**  | **474598.40**  | **461155.72**  | **437413.92**  |

| GreatSQL作为基数对比（并发数）  | 32      | 64      | 128     | 256     | 384     | 512     |
|-----------------------|---------|---------|---------|---------|---------|---------|
| 对比MySQL             | **25.41%** | **21.37%** | **24.08%** | **10.23%** | **-7.49%** | **-2.78%** |

结论：**在X86平台下，GreatSQL在大部分并发场景下表现比MySQL要更好，tpmC数据高10% ~ 25%；在并发384和512时表现比MySQL略差（但是在这两个并发模式下，GreatSQL的Latency值仍比MySQL更低一些）**。

![GreatSQL 8.4.4-4 vs MySQL 8.4.4 Warehouses 1000 tpmC under X86](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86.png)

### 4.2 鲲鹏ARM 平台测试数据

1. GreatSQL 8.4.4-4
- innodb_buffer_pool_size=180G
- 启用NUMA和网卡中断绑定，双1模式+开slow log+pfs

| 并发数 | 32         | 64         | 128        | 256        | 384        | 512        |
|--------|------------|------------|------------|------------|------------|------------|
| round 1 | 179402.52  | 336006.71  | 543341.77  | 319289.60  | 344824.60  | 449849.11  |
| round 2 | 187574.45  | 338985.38  | 547766.34  | 319477.50  | 344858.99  | 457579.96  |
| round 3 | 189302.81  | 339620.65  | 549039.52  | 320047.96  | 346223.92  | 460930.00  |
| round 4 | 190417.68  | 341710.79  | 549561.12  | 322833.13  | 349817.60  | 466876.29  |
| round 5 | 192296.94  | 343265.96  | 555050.69  | 328863.63  | 355220.04  | 469374.28  |
| avg     | **187798.88**  | **339917.90**  | **548951.89**  | **322102.36**  | **348189.03**  | **460921.93**  |

2. MySQL 8.4.4
- innodb_buffer_pool_size=180G
- 启用NUMA和网卡中断绑定，双1模式+开slow log+pfs. 

| 并发数 | 32         | 64         | 128        | 256        | 384        | 512        |
|--------|------------|------------|------------|------------|------------|------------|
| round 1 | 168770.24  | 302410.89  | 491520.78  | 323778.25  | 333552.38  | 381161.67  |
| round 2 | 169072.51  | 302682.72  | 495234.28  | 324030.23  | 335690.91  | 382482.97  |
| round 3 | 169587.21  | 304935.51  | 496005.96  | 328414.69  | 335796.34  | 383243.77  |
| round 4 | 170617.79  | 306967.69  | 497659.32  | 328608.03  | 336111.10  | 383485.45  |
| round 5 | 170650.99  | 307024.62  | 505156.74  | 335866.19  | 338284.19  | 385629.35  |
| avg     | 169739.75  | 304804.29  | 497115.42  | 328139.48  | 335886.98  | 383200.64  |


| GreatSQL作为基数对比（并发数）  | 32      | 64      | 128     | 256     | 384     | 512     |
|-----------------------|---------|---------|---------|---------|---------|---------|
| 对比MySQL             | **10.64%** | **11.52%** | **10.43%** | **-1.84%** | **3.66%** | **20.28%** |

结论：**鲲鹏ARM平台下，GreatSQL在大部分并发场景下表现也是比MySQL要更好，tpmC数据高10% ~ 20%；只有在并发256和384时看起来像是因为其他原因导致的异常波动**。

![GreatSQL 8.4.4-4 vs MySQL 8.4.4 Warehouses 1000 tpmC under ARM](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm.png)

### 4.3 Intel X86环境下tpmC最高时的tpmC及Latency曲线

- 32并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-greatsql84-32th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-mysql84-32th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-greatsql84-32th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-mysql84-32th.png)


- 64并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-greatsql84-64th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-mysql84-64th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-greatsql84-64th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-mysql84-64th.png)


- 128并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-greatsql84-128th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-mysql84-128th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-greatsql84-128th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-mysql84-128th.png)


- 256并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-greatsql84-256th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-mysql84-256th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-greatsql84-256th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-mysql84-256th.png)


- 384并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-greatsql84-384th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-mysql84-384th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-greatsql84-384th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-mysql84-384th.png)


- 512并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-greatsql84-512th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-x86-mysql84-512th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-greatsql84-512th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-x86-mysql84-512th.png)


### 4.4 鲲鹏ARM环境下tpmC最高时的tpmC及Latency曲线

- 32并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-greatsql84-32th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-mysql84-32th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-greatsql84-32th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-mysql84-32th.png)


- 64并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-greatsql84-64th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-mysql84-64th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-greatsql84-64th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-mysql84-64th.png)


- 128并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-greatsql84-128th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-mysql84-128th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-greatsql84-128th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-mysql84-128th.png)


- 256并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-greatsql84-256th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-mysql84-256th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-greatsql84-256th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-mysql84-256th.png)


- 384并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-greatsql84-384th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-mysql84-384th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-greatsql84-384th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-mysql84-384th.png)


- 512并发
  - GreatSQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-greatsql84-512th.png)

  - MySQL tpmC
![](./3-7-greatsql84-mysql84-bmsql1000-tpmc-arm-mysql84-512th.png)

  - GreatSQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-greatsql84-512th.png)

  - MySQL Latency
![](./3-7-greatsql84-mysql84-bmsql1000-latency-arm-mysql84-512th.png)


### 4.5 运行8小时后的tpmC和Latency变化

- Intel X86平台下

|                    | 运行20分钟(tpmC) | 运行8小时(tpmC) | tpmC下降值 | 降为原值比率 | 初始表空间 | 8小时后表空间 | 表空间增长比率 | 事务总数       |
|--------------------|------------------|-----------------|------------|--------------|------------|---------------|----------------|----------------|
| GreatSQL（并发256）| 523153.21        | 474228.51       | 48924.70   | 90.65%       | 90G        | 350G          | 388.89%        | 505,879,211    |
| MySQL（并发256）   | 474598.40        | 237711.26       | 236887.14  | 50.09%       | 90G        | 222G          | 246.67%        | 253,552,583    |

tpmC对比图

![GreatSQL 8.4.4-4 vs MySQL 8.4.4 BenchmarkSQL run 8h tpmC under x86](./3-7-greatsql84-mysql84-bmsql1000-x86-8h-tpmc.png)

运行8H的tpmC及Latency曲线

- tpmC曲线
  - GreatSQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-x86-8h-tpmc-greatsql84.png)

  - MySQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-x86-8h-tpmc-mysql84.png)

说明：MySQL 8.4的tpmC下降趋势更快，波动也更剧烈（图中曲率更大）。

- Latency曲线
  - GreatSQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-x86-8h-latency-greatsql84.png)

  - MySQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-x86-8h-latency-mysql84.png)

说明：MySQL 8.4的Latency曲线一路向上，持续处于较高水位。

- 鲲鹏ARM平台下

|                    | 运行20分钟(tpmC) | 运行8小时(tpmC) | tpmC下降值 | 降为原值比率 | 初始表空间 | 8小时后表空间 | 表空间增长比率 | 事务总数       |
|---------------------|------------------|-----------------|------------|--------------|------------|---------------|----------------|----------------|
| GreatSQL（并发128） | 548951.89        | 419824.97       | 129126.92  | 76.48%       | 90G        | 320G          | 255.56%        | 447,823,234    |
| MySQL（并发128）    | 497115.42        | 225635.72       | 271479.70 | 45.39%   | 90G    | 218G      | 142.22%    | 240,701,779 |

tpmC对比图

![GreatSQL 8.4.4-4 vs MySQL 8.4.4 BenchmarkSQL run 8h tpmC under arm](./3-7-greatsql84-mysql84-bmsql1000-arm-8h-tpmc.png)

运行8H的tpmC及Latency曲线

- tpmC曲线
  - GreatSQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-arm-8h-tpmc-greatsql84.png)

  - MySQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-arm-8h-tpmc-mysql84.png)

说明：MySQL 8.4的tpmC下降趋势更快，波动也更剧烈（图中曲率更大）。

- Latency曲线
  - GreatSQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-arm-8h-latency-greatsql84.png)

  - MySQL 8.4
![](./3-7-greatsql84-mysql84-bmsql1000-arm-8h-latency-mysql84.png)

说明：MySQL 8.4的Latency曲线一路向上，持续处于较高水位。

## 5. 附录

### 5.1 测试步骤

参考手册内容 [BenchmarkSQL 性能测试](./3-4-benchmarksql.md)，执行 TPC-C 压测，详细过程不赘述。

### 5.2 测试工具

BenchmarkSQL 5.0。

相应代码仓库：[https://gitee.com/GreatSQL/benchmarksql](https://gitee.com/GreatSQL/benchmarksql)。

### 5.3 测试模式

- 利用BenchmarkSQL构造测试数据，设置参数 warehouses=1000。
- 测试数据库初始大小约90G。
- 服务器端开启NUMA，并设置innodb_numa_interleave=ON（8.4版本下默认开启）。
- 鲲鹏ARM环境中对网卡中断进行绑定操作，绑定脚本内容见下方服务端详细信息。
- 测试过程中开启Binlog及双1模式，其余主要参数详见后面描述。

### 5.4 BenchmarkSQL相关参数如下

```ini
conn=jdbc:mysql://DBIP:3306/bmsql?useServerPrepStmts=false&prepStmtCacheSize=250&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=GMT&useLocalSessionState=true&maintainTimeStats=false&useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&cacheResultSetMetadata=true&metadataCacheSize=1024&useConfigs=maxPerformance
warehouses=2000
loadWorkers=128

terminals=32
//terminals=64
runTxnsPerTerminal=0
runMins=20
limitTxnsPerMin=0

terminalWarehouseFixed=true

report-on-new-line=0
table-engine=innodb

newOrderWeight=45
paymentWeight=43
orderStatusWeight=4
deliveryWeight=4
stockLevelWeight=4
```

### 5.5 数据库主要相关参数配置

```ini
[mysqld]
user=mysql
port=3306
server_id=3306
basedir=/usr/local/GreatSQL
#basedir=/usr/local/mysql
datadir=/data/GreatSQL
socket=/data/GreatSQL/mysql.sock
pid-file=mysql.pid
character-set-server=UTF8MB4
skip_name_resolve=ON
default_time_zone="+8:00"
bind_address="0.0.0.0"
secure_file_priv=/data/GreatSQL
mysql_native_password=ON

# Performance
lock_wait_timeout=3600
open_files_limit=65535
back_log=1024
max_connections=1024
max_connect_errors=1000000
table_open_cache=4096
table_definition_cache=2048
sort_buffer_size=4M
join_buffer_size=4M
read_buffer_size=8M
read_rnd_buffer_size=4M
bulk_insert_buffer_size=64M
thread_cache_size=768
interactive_timeout=600
wait_timeout=600
tmp_table_size=96M
max_heap_table_size=96M
max_allowed_packet=64M
loose-net_buffer_shrink_interval=180
sql_generate_invisible_primary_key=ON
loose-lock_ddl_polling_mode=ON
loose-lock_ddl_polling_runtime=200

# Logs
log_timestamps=SYSTEM
log_error=error.log
log_error_verbosity=3
slow_query_log=ON
log_slow_extra=ON
slow_query_log_file=slow.log
long_query_time=0.01
log_queries_not_using_indexes=ON
log_throttle_queries_not_using_indexes=60
min_examined_row_limit=100
log_slow_admin_statements=ON
log_slow_replica_statements=ON
loose-log_slow_verbosity=FULL
log_bin=binlog
binlog_format=ROW
sync_binlog=1
binlog_cache_size=4M
max_binlog_cache_size=6G
max_binlog_size=1G
loose-binlog_space_limit=500G
binlog_rows_query_log_events=ON
binlog_expire_logs_seconds=604800
binlog_checksum=CRC32
binlog_order_commits=OFF
gtid_mode=ON
enforce_gtid_consistency=ON

# Replication
relay-log=relaylog
relay_log_recovery=ON
replica_parallel_type=LOGICAL_CLOCK
replica_parallel_workers=16
replica_preserve_commit_order=ON
replica_checkpoint_period=2
loose-rpl_read_binlog_speed_limit=100

# InnoDB
innodb_buffer_pool_size=180G
innodb_buffer_pool_instances=24
innodb_data_file_path=ibdata1:12M:autoextend
innodb_flush_log_at_trx_commit=1
innodb_log_buffer_size=64M
innodb_redo_log_capacity=16G
innodb_doublewrite_files=64
innodb_doublewrite_pages=64
innodb_max_undo_log_size=4G
innodb_io_capacity=40000
innodb_io_capacity_max=80000
innodb_open_files=65534
innodb_flush_method=O_DIRECT
innodb_use_fdatasync=ON
innodb_lru_scan_depth=4000
innodb_lock_wait_timeout=10
innodb_rollback_on_timeout=ON
innodb_print_all_deadlocks=ON
innodb_online_alter_log_max_size=4G
innodb_print_ddl_logs=OFF
innodb_status_file=ON
innodb_status_output=OFF
innodb_status_output_locks=ON
innodb_sort_buffer_size=64M
innodb_adaptive_hash_index=OFF
innodb_numa_interleave=ON
innodb_spin_wait_delay=6
innodb_spin_wait_pause_multiplier=50
innodb_sync_spin_loops=30
loose-innodb_print_lock_wait_timeout_info=ON
innodb_change_buffering=none
loose-kill_idle_transaction=300
loose-innodb_data_file_async_purge=ON
```
### 5.6 测试环境

#### 5.6.1 Intel X86测试环境

简要信息

| 测试机 | 配置信息 |
| :---   | :---     |
| 服务端 | Dell R840<br/> Intel 6238 x 4, 共176核；256Gi内存；Nvme SSD, 3TB * 1 |
| 客户端 | Dell R840<br/> Intel 6238 x 4, 共176核；377Gi内存；Nvme SSD, 3TB * 1 |

##### 5.6.1.1 服务端详细信息

- 1. 操作系统

```bash
$ cat /etc/os-release

NAME="CentOS Linux"
VERSION="8"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="8"
PLATFORM_ID="platform:el8"
PRETTY_NAME="CentOS Linux 8"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:8"
HOME_URL="https://centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"
CENTOS_MANTISBT_PROJECT="CentOS-8"
CENTOS_MANTISBT_PROJECT_VERSION="8"
```

- 2. CPU

```bash
$ lscpu

Architecture:        x86_64
CPU op-mode(s):      32-bit, 64-bit
Byte Order:          Little Endian
CPU(s):              176
On-line CPU(s) list: 0-175
Thread(s) per core:  2
Core(s) per socket:  22
Socket(s):           4
NUMA node(s):        1
Vendor ID:           GenuineIntel
BIOS Vendor ID:      Intel
CPU family:          6
Model:               85
Model name:          Intel(R) Xeon(R) Gold 6238 CPU @ 2.10GHz
BIOS Model name:     Intel(R) Xeon(R) Gold 6238 CPU @ 2.10GHz
Stepping:            7
CPU MHz:             2799.999
CPU max MHz:         3700.0000
CPU min MHz:         1000.0000
BogoMIPS:            4200.00
Virtualization:      VT-x
L1d cache:           32K
L1i cache:           32K
L2 cache:            1024K
L3 cache:            30976K
NUMA node0 CPU(s):   0-175
Flags:               fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc art arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx smx est tm2 ssse3 sdbg fma cx16 xtpr pdcm pcid dca sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb cat_l3 cdp_l3 invpcid_single intel_ppin ssbd mba ibrs ibpb stibp ibrs_enhanced tpr_shadow vnmi flexpriority ept vpid ept_ad fsgsbase tsc_adjust bmi1 hle avx2 smep bmi2 erms invpcid cqm mpx rdt_a avx512f avx512dq rdseed adx smap clflushopt clwb intel_pt avx512cd avx512bw avx512vl xsaveopt xsavec xgetbv1 xsaves cqm_llc cqm_occup_llc cqm_mbm_total cqm_mbm_local dtherm ida arat pln pts pku ospke avx512_vnni md_clear flush_l1d arch_capabilities
```

- 3. 内存

```bash
$ free -ht
              total        used        free      shared  buff/cache   available
Mem:          251Gi       146Gi       1.7Gi        17Mi       102Gi       102Gi
Swap:         4.0Gi       318Mi       3.7Gi
Total:        255Gi       146Gi       5.4Gi
```

- 4. 磁盘

磁盘设备型号

```bash
$ nvme list

Node             SN                   Model                                    Namespace Usage                      Format           FW Rev
---------------- -------------------- ---------------------------------------- --------- -------------------------- ---------------- --------
/dev/nvme0n1          PHLN018200FD3P2BGN   INTEL SSDPE2KE032T8                      1           3.20  TB /   3.20  TB    512   B +  0 B   VDV10152
```

磁盘挂载参数、文件系统、ioscheduler

```bash
$ df -hT | grep /ssd1
/dev/nvme0n1        xfs       3.0T  682G  2.3T  23% /ssd1

$ mount | grep ssd1
/dev/nvme0n1 on /ssd1 type xfs (rw,noatime,nodiratime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)

$ cat /sys/block/nvme0n1/queue/scheduler
[mq-deadline] kyber bfq none
```

NVMe SSD设备简单测速

```bash
$ dd oflag=direct if=/dev/zero of=./zero bs=1M count=20480

20480+0 records in
20480+0 records out
21474836480 bytes (21 GB, 20 GiB) copied, 11.389 s, 1.9 GB/s
```

- 5. 内核相关优化

```ini
# 修改 /etc/sysctl.conf

# 内存和IO优化
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
vm.swappiness = 10
vm.overcommit_memory = 1  # 允许内存超分
kernel.perf_event_max_sample_rate = 1000  # 限制采样率
kernel.nmi_watchdog = 0                   # 关闭NMI看门狗
fs.file-max=1000000
net.core.somaxconn=32768
net.ipv4.tcp_syncookies=0

# 修改 /etc/security/limits.conf
# 配置 memlock    大于  nr_hugepages   大于  shared_buffers
greatdb hard nofile 1024000
greatdb soft nofile 1024000
greatdb hard nproc 1024000
greatdb soft nproc 1024000

* hard nofile 1024000
* soft nofile 1024000
* hard nproc 1024000
* soft nproc 1024000


# 配置 memlock    大于  nr_hugepages   大于  shared_buffers
* soft   memlock    250000000
* hard   memlock    250000000
```

##### 5.6.1.2 客户端详细信息

- 1. 操作系统

```bash
$ cat /etc/os-release

NAME="CentOS Linux"
VERSION="8"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="8"
PLATFORM_ID="platform:el8"
PRETTY_NAME="CentOS Linux 8"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:8"
HOME_URL="https://centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"
CENTOS_MANTISBT_PROJECT="CentOS-8"
CENTOS_MANTISBT_PROJECT_VERSION="8"
```

- 2. CPU

```bash
$ lscpu

Architecture:        x86_64
CPU op-mode(s):      32-bit, 64-bit
Byte Order:          Little Endian
CPU(s):              176
On-line CPU(s) list: 0-175
Thread(s) per core:  2
Core(s) per socket:  22
Socket(s):           4
NUMA node(s):        1
Vendor ID:           GenuineIntel
BIOS Vendor ID:      Intel
CPU family:          6
Model:               85
Model name:          Intel(R) Xeon(R) Gold 6238 CPU @ 2.10GHz
BIOS Model name:     Intel(R) Xeon(R) Gold 6238 CPU @ 2.10GHz
Stepping:            7
CPU MHz:             2799.999
CPU max MHz:         3700.0000
CPU min MHz:         1000.0000
BogoMIPS:            4200.00
Virtualization:      VT-x
L1d cache:           32K
L1i cache:           32K
L2 cache:            1024K
L3 cache:            30976K
NUMA node0 CPU(s):   0-175
Flags:               fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc art arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx smx est tm2 ssse3 sdbg fma cx16 xtpr pdcm pcid dca sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb cat_l3 cdp_l3 invpcid_single intel_ppin ssbd mba ibrs ibpb stibp ibrs_enhanced tpr_shadow vnmi flexpriority ept vpid ept_ad fsgsbase tsc_adjust bmi1 hle avx2 smep bmi2 erms invpcid cqm mpx rdt_a avx512f avx512dq rdseed adx smap clflushopt clwb intel_pt avx512cd avx512bw avx512vl xsaveopt xsavec xgetbv1 xsaves cqm_llc cqm_occup_llc cqm_mbm_total cqm_mbm_local dtherm ida arat pln pts pku ospke avx512_vnni md_clear flush_l1d arch_capabilities
```

- 3. 内存

```bash
[root@130-55 run]# free -ht
              total        used        free      shared  buff/cache   available
Mem:          377Gi       5.2Gi       255Gi        22Mi       116Gi       369Gi
Swap:         4.0Gi          0B       4.0Gi
Total:        381Gi       5.2Gi       259Gi
```

#### 5.6.2 鲲鹏ARM测试环境

简要信息

| 测试机 | 配置信息 |
| :---   | :---     |
| 服务端 | Huawei TS200-2280 V2<br/> CPU：Kunpeng 920 7270Z x 2, 共256核；内存：2TB内存；存储：Nvme SSD, 3TB |
| 客户端 | Huawei TS200-2280 V2<br/> CPU：Kunpeng 920 7270Z x 2, 共128核；内存：2TB内存；存储：Nvme SSD, 3TB |

##### 5.6.2.1 服务端详细信息

- 1. 操作系统

```bash
[root@kp01 data]# cat /etc/os-release
NAME="openEuler"
VERSION="22.03 (LTS-SP3)"
ID="openEuler"
VERSION_ID="22.03"
PRETTY_NAME="openEuler 22.03 (LTS-SP3)"
ANSI_COLOR="0;31"
```

- 2. CPU

```bash
[root@kp01 data]# lscpu
Architecture:           aarch64
  CPU op-mode(s):       64-bit
  Byte Order:           Little Endian
CPU(s):                 256
  On-line CPU(s) list:  0-255
Vendor ID:              HiSilicon
  BIOS Vendor ID:       HiSilicon
  BIOS Model name:      Kunpeng 920 7270Z
  Model:                0
  Thread(s) per core:   2
  Core(s) per socket:   64
  Socket(s):            2
  Stepping:             0x0
  Frequency boost:      disabled
  CPU max MHz:          2900.0000
  CPU min MHz:          400.0000
  BogoMIPS:             200.00
  Flags:                fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 sm3 sm4 asimddp sha512 sve asimdfhm d
                        it uscat ilrcpc flagm ssbs sb paca pacg dcpodp flagm2 frint svei8mm svef32mm svef64mm svebf16 i8mm bf16 dgh rng ecv
Caches (sum of all):
  L1d:                  8 MiB (128 instances)
  L1i:                  8 MiB (128 instances)
  L2:                   160 MiB (128 instances)
  L3:                   224 MiB (4 instances)
NUMA:
  NUMA node(s):         4
  NUMA node0 CPU(s):    0-63
  NUMA node1 CPU(s):    64-127
  NUMA node2 CPU(s):    128-191
  NUMA node3 CPU(s):    192-255
Vulnerabilities:
  Gather data sampling: Not affected
  Itlb multihit:        Not affected
  L1tf:                 Not affected
  Mds:                  Not affected
  Meltdown:             Not affected
  Mmio stale data:      Not affected
  Retbleed:             Not affected
  Spec rstack overflow: Not affected
  Spec store bypass:    Not affected
  Spectre v1:           Mitigation; __user pointer sanitization
  Spectre v2:           Not affected
  Srbds:                Not affected
  Tsx async abort:      Not affected
```

- 3. 内存

```bash
[root@kp01 data]# free -ht
               total        used        free      shared  buff/cache   available
Mem:           2.0Ti       389Gi       1.3Ti       5.0Mi       358Gi       1.6Ti
Swap:          4.0Gi          0B       4.0Gi
Total:         2.0Ti       389Gi       1.3Ti
```

- 4. 磁盘

磁盘设备型号

```bash
[root@kp01 data]# nvme list
Node                  SN                   Model                                    Namespace Usage                      Format           FW Rev
--------------------- -------------------- ---------------------------------------- --------- -------------------------- ---------------- --------
/dev/nvme0n1          034XETD9QC006693     HWE6AP443T2M00KN                         1           3.20  TB /   3.20  TB    512   B +  0 B   1069
/dev/nvme1n1          034XETD9QC006708     HWE6AP443T2M00KN                         1           3.20  TB /   3.20  TB    512   B +  0 B   1069
/dev/nvme2n1          034XETD9QC007078     HWE6AP443T2M00KN                         1           3.20  TB /   3.20  TB    512   B +  0 B   1069
```

磁盘挂载参数、文件系统、ioscheduler

```bash
[root@kp01 data]# mount | grep '/ '
/dev/mapper/vg_sda-lv_root on / type xfs (rw,relatime,attr2,inode64,logbufs=8,logbsize=128k,sunit=256,swidth=256,noquota)

[root@kp01 data]# cat /sys/block/nvme0n1/queue/scheduler
[none] mq-deadline kyber bfq
```

NVMe SSD设备简单测速

```bash
[root@kp01 data]# dd oflag=direct if=/dev/zero of=./zero bs=1M count=20480
20480+0 records in
20480+0 records out
21474836480 bytes (21 GB, 20 GiB) copied, 6.37675 s, 3.4 GB/s
```

- 5. 内核相关优化

```ini
# 修改 /etc/sysctl.conf

# 内存和IO优化
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
vm.swappiness = 10
vm.overcommit_memory = 1  # 允许内存超分
kernel.perf_event_max_sample_rate = 1000  # 限制采样率
kernel.nmi_watchdog = 0                   # 关闭NMI看门狗
fs.file-max=1000000
net.core.somaxconn=32768
net.ipv4.tcp_syncookies=0

# 修改 /etc/security/limits.conf
# 配置 memlock    大于  nr_hugepages   大于  shared_buffers
greatdb hard nofile 1024000
greatdb soft nofile 1024000
greatdb hard nproc 1024000
greatdb soft nproc 1024000

* hard nofile 1024000
* soft nofile 1024000
* hard nproc 1024000
* soft nproc 1024000


# 配置 memlock    大于  nr_hugepages   大于  shared_buffers
* soft   memlock    250000000
* hard   memlock    250000000
```

- 6. 网卡中断绑定脚本（直接运行即可）

```bash
#!/bin/bash
# 修复版：动态获取NUMA节点CPU列表，解决CPU编号拼接异常

#set -x

# ========== 可配置项 ==========
TOTAL_IRQ=${1:-24}          # 从输入参数获取TOTAL_IRQ，默认为24
# ========== 配置结束 ==========

declare net_devices_array
declare net_dev_no=0

#get all the network active devices
function get_active_devices()
{
    net_dev_all_no=$(ip link | awk -F: '$0 !~ "lo|vir|wl|^[^0-9]"{print $2;getline}' |wc -l)
    net_devices=$(ip link | awk -F: '$0 !~ "lo|vir|wl|^[^0-9]"{print $2;getline}')
    net_devices_all=($net_devices)
    net_devices_array=()
    for((n=0; n<$net_dev_all_no; ++n))
    do
    if_speed=$(ethtool ${net_devices_all[$n]}|grep Speed|awk {'print $2'}|grep -o '[0-9]*')
        if [[ $if_speed -ge 10000 ]]
        then
            net_devices_array[$net_dev_no]=${net_devices_all[$n]}
            net_dev_no=$(($net_dev_no+1))
        fi
    done
}

# 1. 安全获取NUMA节点列表（兼容不同numactl输出格式）
get_numa_nodes() {
    local node_range=$(numactl -H | grep -E "available: [0-9]+ nodes" | awk '{print $4}' | tr -d '()')
    if [[ $node_range =~ ([0-9]+)-([0-9]+) ]]; then
        seq ${BASH_REMATCH[1]} ${BASH_REMATCH[2]}
    else
        echo $node_range
    fi
}


bind_net_irq_for_device() {


NIC_NAME=$1                # 目标网卡名



NUMA_NODES=($(get_numa_nodes))

# 2. 动态获取各节点CPU列表和核心数（修复解析逻辑）
declare -A NUMA_CPU_LIST
declare -A NUMA_CPU_COUNT
TOTAL_CPU=0

for NODE in "${NUMA_NODES[@]}"; do
    # 精准提取节点CPU列表（仅保留数字+空格，过滤多余字符）
    CPU_LIST=$(numactl -H | grep -E "^node $NODE cpus:" | awk -F': ' '{gsub(/[^0-9 ]/, "", $2); print $2}')
    # 去重+排序（防止重复/乱序）
    CPU_LIST=$(echo $CPU_LIST | tr ' ' '\n' | sort -nu | tr '\n' ' ')
    NUMA_CPU_LIST[$NODE]="$CPU_LIST"

    # 计算节点核心数
    CPU_ARRAY=($CPU_LIST)
    CPU_COUNT=${#CPU_ARRAY[@]}
    NUMA_CPU_COUNT[$NODE]=$CPU_COUNT
    TOTAL_CPU=$(( TOTAL_CPU + CPU_COUNT ))
done

# 3. 计算各节点IRQ分配数（按核心数比例）
declare -A NUMA_IRQ_COUNT
REMAIN_IRQ=$TOTAL_IRQ

for NODE in "${NUMA_NODES[@]}"; do
    if [ $TOTAL_CPU -eq 0 ]; then
        IRQ_NUM=0
    else
        IRQ_NUM=$(( TOTAL_IRQ * ${NUMA_CPU_COUNT[$NODE]} / TOTAL_CPU ))
    fi
    NUMA_IRQ_COUNT[$NODE]=$IRQ_NUM
    REMAIN_IRQ=$(( REMAIN_IRQ - IRQ_NUM ))
done

# 处理余数（分配给核心数最多的节点）
MAX_CPU_NODE=${NUMA_NODES[0]}
for NODE in "${NUMA_NODES[@]}"; do
    if [ ${NUMA_CPU_COUNT[$NODE]} -gt ${NUMA_CPU_COUNT[$MAX_CPU_NODE]} ]; then
        MAX_CPU_NODE=$NODE
    fi
done
NUMA_IRQ_COUNT[$MAX_CPU_NODE]=$(( ${NUMA_IRQ_COUNT[$MAX_CPU_NODE]} + REMAIN_IRQ ))

# 4. 提取网卡IRQ列表（过滤空值+去重）
IRQ_LIST=($(cat /proc/interrupts | grep "$NIC_NAME" | awk -F ':' '{gsub(/ /, "", $1); print $1}' | sort -nu))

# 5. 绑定IRQ到对应节点的CPU（从最后一个CPU开始）
IRQ_IDX=0
for NODE in "${NUMA_NODES[@]}"; do
    IRQ_NUM=${NUMA_IRQ_COUNT[$NODE]}
    if [ $IRQ_NUM -eq 0 ] || [ $IRQ_IDX -ge $TOTAL_IRQ ]; then
        continue
    fi

    # 节点CPU列表转数组（确保是独立编号）
    CPU_ARRAY=(${NUMA_CPU_LIST[$NODE]})
    CPU_IDX=$(( ${#CPU_ARRAY[@]} - 1 ))  # 最后一个CPU

    # 分配当前节点的IRQ
    for ((i=0; i<IRQ_NUM; i++)); do
        if [ $IRQ_IDX -ge ${#IRQ_LIST[@]} ]; then
            break
        fi
        IRQ=${IRQ_LIST[$IRQ_IDX]}
        CPU=${CPU_ARRAY[$CPU_IDX]}

        # 安全写入（先校验CPU编号合法性）
        if [[ $CPU =~ ^[0-9]+$ ]] && [ -f /proc/irq/$IRQ/smp_affinity_list ]; then
            echo $CPU > /proc/irq/$IRQ/smp_affinity_list
            echo "IRQ $IRQ 绑定到NUMA$NODE-CPU$CPU"
        else
            echo "WARNING: IRQ $IRQ 绑定失败（CPU$CPU 非法或文件不存在）"
        fi

        # 更新索引
        ((IRQ_IDX++))
        ((CPU_IDX--))

        # CPU索引越界则回到最后一个
        if [ $CPU_IDX -lt 0 ]; then
            CPU_IDX=$(( ${#CPU_ARRAY[@]} - 1 ))
        fi
    done
done

echo -e "\n=== IRQ绑定完成 NIC_NAME:$NIC_NAME ==="

}

echo "TOTAL_IRQ is set to $TOTAL_IRQ"
get_active_devices
for((k=0;k<net_dev_no;++k))
do
    net_irq_other_no=$(ethtool -l ${net_devices_array[k]} |grep Other | tail -n 1|awk {'print $2'} )
    if [[ $net_irq_other_no -gt 0 ]]
    then
        SET_IRQ=$(($TOTAL_IRQ - 1))
    else
        SET_IRQ=$TOTAL_IRQ
    fi

    ethtool -L ${net_devices_array[k]} combined $SET_IRQ
    echo -e "\n=== net rpq number setting for NIC_NAME: ${net_devices_array[k]} ==="
    ethtool -l ${net_devices_array[k]}
    echo -e "\n=== IRQ绑定开始 NIC_NAME:${net_devices_array[k]}  ==="
    bind_net_irq_for_device ${net_devices_array[k]}
done
```

##### 5.6.2.2 客户端详细信息

- 1. 操作系统

```bash
[root@kp01 data]# cat /etc/os-release
NAME="openEuler"
VERSION="22.03 (LTS-SP3)"
ID="openEuler"
VERSION_ID="22.03"
PRETTY_NAME="openEuler 22.03 (LTS-SP3)"
ANSI_COLOR="0;31"
```

- 2. CPU

```bash
[root@kp01 data]# lscpu
Architecture:           aarch64
  CPU op-mode(s):       64-bit
  Byte Order:           Little Endian
CPU(s):                 256
  On-line CPU(s) list:  0-255
Vendor ID:              HiSilicon
  BIOS Vendor ID:       HiSilicon
  BIOS Model name:      Kunpeng 920 7270Z
  Model:                0
  Thread(s) per core:   2
  Core(s) per socket:   64
  Socket(s):            2
  Stepping:             0x0
  Frequency boost:      disabled
  CPU max MHz:          2900.0000
  CPU min MHz:          400.0000
  BogoMIPS:             200.00
  Flags:                fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 sm3 sm4 asimddp sha512 sve asimdfhm d
                        it uscat ilrcpc flagm ssbs sb paca pacg dcpodp flagm2 frint svei8mm svef32mm svef64mm svebf16 i8mm bf16 dgh rng ecv
Caches (sum of all):
  L1d:                  8 MiB (128 instances)
  L1i:                  8 MiB (128 instances)
  L2:                   160 MiB (128 instances)
  L3:                   224 MiB (4 instances)
NUMA:
  NUMA node(s):         4
  NUMA node0 CPU(s):    0-63
  NUMA node1 CPU(s):    64-127
  NUMA node2 CPU(s):    128-191
  NUMA node3 CPU(s):    192-255
Vulnerabilities:
  Gather data sampling: Not affected
  Itlb multihit:        Not affected
  L1tf:                 Not affected
  Mds:                  Not affected
  Meltdown:             Not affected
  Mmio stale data:      Not affected
  Retbleed:             Not affected
  Spec rstack overflow: Not affected
  Spec store bypass:    Not affected
  Spectre v1:           Mitigation; __user pointer sanitization
  Spectre v2:           Not affected
  Srbds:                Not affected
  Tsx async abort:      Not affected
```

- 3. 内存

```bash
[root@kp01 data]# free -ht
               total        used        free      shared  buff/cache   available
Mem:           2.0Ti       389Gi       1.3Ti       5.0Mi       358Gi       1.6Ti
Swap:          4.0Gi          0B       4.0Gi
Total:         2.0Ti       389Gi       1.3Ti
```

## 参考资料

- [TPC-C官网](https://www.tpc.org/tpcc/)
- [GreatSQL安装指南](../4-install-guide/0-install-guide.md)
- [BenchmarkSQL 性能测试](./3-4-benchmarksql.md)

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
