# FAQ - MGR运维部署
---

本文内容主要是MGR运维部署相关的FAQ。


## 1. 可以使用MySQL Shell来管理GreatSQL吗
是可以的，最好采用相同版本号的MySQL Shell即可。

GreatSQL 8.0.25-16起，如果有仲裁节点，则需要用GreatSQL MySQL Shell版本才能管理，否则只能在MySQL命令行下管理。

GreatSQL MySQL Shell下载链接 [https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.25-16](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.25-16)
。


## 2. MGR最多可支持多少个节点
MGR最多可支持9个节点，无论是单主还是多主模式。

## 3. MGR可以设置为自启动吗
设置参数 `group_replication_start_on_boot = ON` 即可。但是当MGR第一个节点初始化启动时，或者整个MGR集群都关闭再重启时，第一个节点都必须先采用引导模式 `group_replication_bootstrap_group = ON`。


## 4. 为什么启动MGR后，多了个33061端口
当启用MGR服务后，MySQL会监听33061端口，该端口用于MGR节点间的通信。因此当服务器间有防火墙策略时，记得针对该端口开放。

当然了，可自行定义该端口，例如 `group_replication_local_address=192.168.0.1:33062`。

## 5. 部署MGR时，务必对所有节点都设置hostname吗
这个不是必须的。

之所以要在每个节点上都加上各节点的hostname对照表，是因为在MGR节点间通信过程中，可能收到的主机名和本地实际配置的不一致。

这种情况下，也可以在每个节点上自行设置 `report_host` 及 `report_port` 来解决这个问题。

## 6. 可以跨公网部署MGR吗
可以的，但非常不推荐。

此外，由于MGR默认的allowlist不包含公网地址，因此需要将公网地址加进去，例如：
```
group_replication_ip_allowlist='192.0.2.0/24, 114.114.114.0/24'
```

顺便提醒下，MGR默认的allowlist范围（`group_replication_ip_allowlist=AUTOMATIC`）是以下几个
```
IPv4 (as defined in RFC 1918)
10/8 prefix       (10.0.0.0 - 10.255.255.255) - Class A
172.16/12 prefix  (172.16.0.0 - 172.31.255.255) - Class B
192.168/16 prefix (192.168.0.0 - 192.168.255.255) - Class C

IPv6 (as defined in RFC 4193 and RFC 5156)
fc00:/7 prefix    - unique-local addresses
fe80::/10 prefix  - link-local unicast addresses

127.0.0.1 - localhost for IPv4
::1       - localhost for IPv6
```
有时候docker容器的IP地址不在上述范围中，也会导致MGR服务无法启动。

## 7. 怎么查看MGR当前是单主还是多主模式
执行下面的命令：
```
[root@GreatSQL]> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID ... | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-1... |        3306 | ONLINE       | SECONDARY   | 8.0.25         |
| group_replication_applier | 549b92bf-1... |        3307 | ONLINE       | SECONDARY   | 8.0.25         |
| group_replication_applier | 5596116c-1... |        3308 | ONLINE       | SECONDARY   | 8.0.25         |
| group_replication_applier | ed5fe7ba-3... |        3309 | ONLINE       | PRIMARY     | 8.0.25         |
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
```
如果只看到一个节点的 `MEMBER_ROLE` 值为 **PRIMARY**，则表示这是单主模式。如果看到所有节点上该状态值均为 **PRIMARY**，则表示这是多主模式。

另外，也可以通过查询MySQL选项值来确认：
```
[root@GreatSQL]# mysqladmin var|grep -i group_replication_single_primary_mode
| group_replication_single_primary_mode        | ON
```
值为 **ON**，这表示采用单主模式。如果该值为 **OFF**，则表示采用多主模式。

在MySQL Shell中也可以查看状态来确认：
```
MySQL  GreatSQL:3306 ssl  JS > var c=dba.getCluster()
MySQL  GreatSQL:3306 ssl  JS > c.describe() /* 或者 c.status() */
...
        "topologyMode": "Single-Primary"
...
```

P.S，强烈建议采用单主模式，遇到bug或其他问题的概率更低，运行MGR更稳定可靠。

## 8. 怎么切换单主或多主
在MySQL客户端命令行模式下，执行下面的命令即可：
```
-- 从单主切换为多主
[root@GreatSQL]> SELECT group_replication_switch_to_multi_primary_mode();
+--------------------------------------------------+
| group_replication_switch_to_multi_primary_mode() |
+--------------------------------------------------+
| Mode switched to multi-primary successfully.     |
+--------------------------------------------------+

-- 从多主切换为单主
[root@GreatSQL]> SELECT group_replication_switch_to_single_primary_mode();
+---------------------------------------------------+
| group_replication_switch_to_single_primary_mode() |
+---------------------------------------------------+
| Mode switched to single-primary successfully.     |
+---------------------------------------------------+
```
**注意：** 切换时会重新选主，新的主节点有可能不是切换之前的那个，这时可以运行下面的命令来重新指定：
```
[root@GreatSQL]> SELECT group_replication_set_as_primary('ed5fe7ba-37c2-11ec-8e12-70b5e873a570');
+--------------------------------------------------------------------------+
| group_replication_set_as_primary('ed5fe7ba-37c2-11ec-8e12-70b5e873a570') |
+--------------------------------------------------------------------------+
| Primary server switched to: ed5fe7ba-37c2-11ec-8e12-70b5e873a570         |
+--------------------------------------------------------------------------+
```

也可以通过MySQL Shell来操作：
```
MySQL  GreatSQL:3306 ssl  JS > var c=dba.getCluster()
> c.switchToMultiPrimaryMode()  /*切换为多主模式*/
Switching cluster 'MGR27' to Multi-Primary mode...

Instance 'GreatSQL:3306' was switched from SECONDARY to PRIMARY.
Instance 'GreatSQL:3307' was switched from SECONDARY to PRIMARY.
Instance 'GreatSQL:3308' was switched from SECONDARY to PRIMARY.
Instance 'GreatSQL:3309' remains PRIMARY.

The cluster successfully switched to Multi-Primary mode.

> c.switchToSinglePrimaryMode()  /*切换为单主模式*/
Switching cluster 'MGR27' to Single-Primary mode...

Instance 'GreatSQL:3306' remains PRIMARY.
Instance 'GreatSQL:3307' was switched from PRIMARY to SECONDARY.
Instance 'GreatSQL:3308' was switched from PRIMARY to SECONDARY.
Instance 'GreatSQL:3309' was switched from PRIMARY to SECONDARY.

WARNING: The cluster internal session is not the primary member anymore. For cluster management operations please obtain a fresh cluster handle using dba.getCluster().

WARNING: Existing connections that expected a R/W connection must be disconnected, i.e. instances that became SECONDARY.

The cluster successfully switched to Single-Primary mode.

> c.setPrimaryInstance('GreatSQL:3309');  /*重新设置主节点*/
Setting instance 'GreatSQL:3309' as the primary instance of cluster 'MGR27'...

Instance 'GreatSQL:3306' was switched from PRIMARY to SECONDARY.
Instance 'GreatSQL:3307' remains SECONDARY.
Instance 'GreatSQL:3308' remains SECONDARY.
Instance 'GreatSQL:3309' was switched from SECONDARY to PRIMARY.

The instance 'GreatSQL:3309' was successfully elected as primary.
```

P.S，强烈建议采用单主模式，遇到bug或其他问题的概率更低，运行MGR更稳定可靠。

## 9. MySQL Router支持单机多实例部署吗
是的，支持。
在MySQL Router初始化部署时，添加 `--name`、`--directory` 及端口号等参数即可，例如：
```
-- 部署第一个实例
root@GreatSQL# mysqlrouter --bootstrap mymgr@192.168.1.1:3306 --name=MGR1 --directory=/etc/mysqlrouter/MGR1  --user=mysqlrouter --conf-base-port=6446 --https-port=8443

-- 部署第二个实例
root@GreatSQL# mysqlrouter --bootstrap mymgr@192.168.1.1:4306 --name=MGR2 --directory=/etc/mysqlrouter/MGR2  --user=mysqlrouter --conf-base-port=7446 --https-port=9443
```
然后每个实例用各自目录下的 `start.sh` 和 `stop.sh` 脚本启停即可。

关于MySQL Router多实例部署的方法，可以参考这篇参考文档：[**《叶问》38期，MGR整个集群挂掉后，如何才能自动选主，不用手动干预**](https://mp.weixin.qq.com/s/9eLnQ2EJIMQnZuEvScIhiw)。

## 10. MySQL Shell 8.0能管理MySQL 5.7的MGR集群吗
答案是肯定的。

不过由于MySQL 5.7里没有MGR管理的几个UDF，因此在MySQL Shell里调用 `setPrimaryInstance()`、`switchToMultiPrimaryMode()` 等函数时会报错，是不支持的。

所以说，还是尽量升级到MySQL 8.0吧。

## 11. GreatSQL 支持ARBITRATOR节点冗余（多个ARBITRATOR节点）吗

支持的，可以同时有多个ARBITRATOR节点。

## 12. 当ARBITRATOR节点异常退出后剩下的两个节点会有脑裂风险吗
是的，当ARBITRATOR节点退出后，只剩下两个节点，存在脑裂风险。因此当ARBITRATOR节点异常退出时，应当尽快重新拉起，做好监控及自愈处理。

## 13. 多个mgr集群，是否可以共用ARBITRATOR节点
不可以，不同集群的ARBITRATOR节点可以交叉部署，同一集群不能放一起。也可以在一台专属服务器上部署多实例，专门用作ARBITRATOR节点。
仲裁节点对系统负载的影响很小，可以参考下面的数据：
```#Primary节点
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 3  1      0    894    206  12238    0    0     0 27186 32669 44745 12  8 68 13  0
 1  0      0    893    206  12239    0    0     0 27555 34887 47219 12 10 64 14  0
 2  1      0    891    206  12240    0    0     0 27756 35025 47353 13  8 66 13  0

#Secondary节点
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  3      0   1950    168  11988    0    0     0 27236 23333 35077 25 19 42 15  0
 2  2      0   1946    168  11990    0    0     0 25950 22254 34017 23 21 42 13  0
 1  0      0   1943    168  11993    0    0     0 26382 21943 33385 24 20 41 14  0

#Arbitrator节点
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 0  0     22    328    193  14132    0    0     0     0 13587 14159  2  2 96  0  0
 1  0     22    326    193  14132    0    0     0     0 15274 15714  3  3 95  0  0
 0  0     22    324    193  14132    0    0     0     0 14983 15155  2  3 95  0  0
```





**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
