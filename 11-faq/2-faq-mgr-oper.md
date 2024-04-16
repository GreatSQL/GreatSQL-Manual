# FAQ - MGR运维部署
---

## 1. 可以使用MySQL Shell来管理GreatSQL吗

是可以的，最好采用相同版本号的MySQL Shell即可。

GreatSQL 8.0.25-16起，如果有仲裁节点，则需要用MySQL Shell for GreatSQL版本才能管理，否则只能在命令行下管理。

MySQL Shell for GreatSQL下载链接 [https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.25-16](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.0.25-16)
。

## 2. MGR最多可支持多少个节点
MGR最多可支持9个节点，无论是单主还是多主模式。

## 3. MGR可以设置为自启动吗
设置选项 `group_replication_start_on_boot = ON` 即可。但是当MGR第一个节点初始化启动时，或者整个MGR集群都关闭再重启时，第一个节点都必须先采用引导模式 `group_replication_bootstrap_group = ON`。

当整个MGR集群都关闭再重启时，也可以用MySQL Shell实现一键自动快速拉起，详见：[万答#12，MGR整个集群挂掉后，如何才能自动选主，不用手动干预](https://mp.weixin.qq.com/s/07o1poO44zwQIvaJNKEoPA)。

## 4. 为什么启动MGR后，多了个33061端口
当启用MGR服务后，GreatSQL默认会监听33061端口，该端口用于MGR节点间的通信。因此当服务器间有防火墙策略时，记得针对该端口开放。

也可以自行定义该端口，例如 `group_replication_local_address=192.168.0.1:33062`。

## 5. 部署MGR时，务必对所有节点都设置hostname吗
这个不是必须的。

之所以要在每个节点上都加上各节点的hostname对照表，是因为在MGR节点间通信过程中，可能收到的主机名和本地实际配置的不一致。

这种情况下，也可以在每个节点上自行设置 `report_host` 及 `report_port` 来解决这个问题。如果想启用GreatSQL MGR支持绑定动态VIP特性，也建议要设置 `report_host` 和 `report_port`，详见：[GreatSQL高可用特性之内置动态VIP](../5-enhance/5-2-ha-mgr-vip.md)。

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
greatsql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID ... | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
| group_replication_applier | 4ebd3504-1... |        3306 | ONLINE       | SECONDARY   | 8.0.32         |
| group_replication_applier | 549b92bf-1... |        3307 | ONLINE       | SECONDARY   | 8.0.32         |
| group_replication_applier | 5596116c-1... |        3308 | ONLINE       | SECONDARY   | 8.0.32         |
| group_replication_applier | ed5fe7ba-3... |        3309 | ONLINE       | PRIMARY     | 8.0.32         |
+---------------------------+-----------...-+-------------+--------------+-------------+----------------+
```
如果只看到一个节点的 `MEMBER_ROLE` 值为 **PRIMARY**，则表示这是单主模式。如果看到所有节点上该状态值均为 **PRIMARY**，则表示这是多主模式。

另外，也可以通过查询GreatSQL选项值来确认：
```
$ mysqladmin var|grep -i group_replication_single_primary_mode
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
在GreatSQL客户端命令行模式下，执行下面的命令即可：
```
-- 从单主切换为多主
greatsql> SELECT group_replication_switch_to_multi_primary_mode();
+--------------------------------------------------+
| group_replication_switch_to_multi_primary_mode() |
+--------------------------------------------------+
| Mode switched to multi-primary successfully.     |
+--------------------------------------------------+

-- 从多主切换为单主
greatsql> SELECT group_replication_switch_to_single_primary_mode();
+---------------------------------------------------+
| group_replication_switch_to_single_primary_mode() |
+---------------------------------------------------+
| Mode switched to single-primary successfully.     |
+---------------------------------------------------+
```
**注意：** 切换时会重新选主，新的主节点有可能不是切换之前的那个，这时可以运行下面的命令来重新指定：
```
greatsql> SELECT group_replication_set_as_primary('ed5fe7ba-37c2-11ec-8e12-70b5e873a570');
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
$ mysqlrouter --bootstrap mymgr@192.168.1.1:3306 --name=MGR1 --directory=/etc/mysqlrouter/MGR1  --user=mysqlrouter --conf-base-port=6446 --https-port=8443

-- 部署第二个实例
$ mysqlrouter --bootstrap mymgr@192.168.1.1:4306 --name=MGR2 --directory=/etc/mysqlrouter/MGR2  --user=mysqlrouter --conf-base-port=7446 --https-port=9443
```
然后每个实例用各自目录下的 `start.sh` 和 `stop.sh` 脚本启停即可。

关于MySQL Router多实例部署的方法，可以参考这篇参考文档：[**《叶问》38期，MGR整个集群挂掉后，如何才能自动选主，不用手动干预**](https://mp.weixin.qq.com/s/9eLnQ2EJIMQnZuEvScIhiw)。

## 10. MySQL Shell 8.0能管理MySQL/GreatSQL 5.7的MGR集群吗
答案是肯定的。

不过由于MySQL/GreatSQL 5.7里没有MGR管理的几个UDF，因此在MySQL Shell里调用 `setPrimaryInstance()`、`switchToMultiPrimaryMode()` 等函数时会报错，是不支持的。

所以说，还是尽量升级到MySQL/GreatSQL 8.0吧。

## 11. GreatSQL 支持ARBITRATOR节点冗余（多个ARBITRATOR节点）吗

支持的，可以同时有多个ARBITRATOR节点。

## 12. 当ARBITRATOR节点异常退出后剩下的两个节点会有脑裂风险吗
是的，当ARBITRATOR节点退出后，只剩下两个节点，存在脑裂风险。因此当ARBITRATOR节点异常退出时，应当尽快重新拉起，做好监控及自愈处理。

## 13. 多个MGR集群，是否可以共用ARBITRATOR节点
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

## 14. 新增ARBITRATOR节点时，一定要CLONE全量数据吗
并不是必需的。

当MGR中Primary节点已有用户数据时，无论是用shell还是手动加入一个新的仲裁节点（ARBITRATOR），首次加入都需要经过CLONE的过程（即便是在启动前已经设置 `group_replication_arbitrator = 1`）。


变通办法是：
1. 第一个加入的ARBITRATOR节点，可以在加入成功后，关闭ARBITRATOR角色，然后删除所有用户数据，这时候就变成一个空实例了，再次重启后，再开启ARBITRATOR角色，不会再次CLONE数据。
2. 在上述第一个ARBITRATOR节点的基础上，在其关闭期间，做一次物理全备，然后这个备份就可以作为未来新的ARBITRATOR节点的datadir，再次加入MGR集群也不会再次CLONE数据。

实际上，在加入MGR时，判断是否需要CLONE数据的依据是看 `gtid_purged`，因此还有第三个办法：

3. 在完成实例初始化后，手动修改 gtid_purged，例如 `set global gtid_purged = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1:1-1449587416';` 也可以跳过数据CLONE。


## 15. 为什么在用MySQL Router构建读写分离架构时会提示schema does not exist

这通常是因为缺少 `mysql_innodb_cluster_metadata` 这个必须的元数据信息库。

这是需试用GreatSQL Shell接管MGR集群，它会创建 `mysql_innodb_cluster_metadata` 这个元数据Schema，然后就可以用Router接入了。

详情参考：[MySQL Shell接管现存的MGR集群](../8-mgr/2-mgr-install-deploy.md#3-mysql-shell接管现存的mgr集群)。


## 16. 有个成员节点无法加入MGR集群，且报错Old incarnation，这是什么情况

这是因为该成员节点曾经加入过MGR集群，但因为节点异常/网络异常/网络分区等原因该成员节点状态异常，且尚未被正式驱逐出MGR集群，MGR组视图中还保留该成员节点的相关信息，因此会提示类似下面的错误：
```
[Warning] [MY-011735] [Repl] Plugin group_replication reported: '[GCS] Old incarnation found while trying to add node ...
```

可以尝试以下几种方法解决：

1. 在有问题的成员节点上执行 `stop group_replication` 操作，并观察MGR成员列表信息中是否不再显示该节点；

2. 在正常的成员节点上执行一次Primary节点切换操作，在切换过程中会更新MGR组视图，就有可能会清除有问题的旧节点信息；

3. 在正常的成员节点上用GreatSQL Shell执行一次 `removeInstance()` 操作，将有问题的成员节点从MGR集群中手动清除；

4. 如果以上操作都无法解决问题，可以尝试在正常的成员节点上设置 `group_replication_force_members` 选项，更新MGR成员列表，详情参考：[15. 故障检测与网络分区](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/deep-dive-mgr/deep-dive-mgr-15.md#3-多数派成员失联时)。


## 17. 怎么将MGR集群从8.0.25升级到8.0.32版本

由于8.0.26版本中新增 `group_replication_view_change_uuid` 选项，所以不支持MGR集群跨8.0.26版本平滑升级，可以采用类似下面的方法升级：

1. 关闭所有成员节点mysqld进程，设置 `super_read_only=ON` 并关闭业务应用程序，避免再有新事务写入；

2. 做好Primary成员节点数据文件物理备份，以防出现升级失败的情况；

3. 修改my.cnf配置文件的 `basedir`，将其指向8.0.32版本安装目录（若采用systemd管理服务，也要修改相应配置），并修改 `group_replication_bootstrap_group=OFF` 和 `group_replication_start_on_boot=OFF`，避免各节点自动启动MGR服务；

4. 逐个启动所有成员节点mysqld进程，由于 `upgrade` 选项默认值是 **AUTO**，会自动完成从8.0.25到8.0.32版本的升级；

5. 手动启动MGR集群（先启动Primary节点，后启动Secondary节点），更推荐用GreatSQL Shell启动MGR集群，详情参考：[重启MGR集群，如何自动选主](https://mp.weixin.qq.com/s/07o1poO44zwQIvaJNKEoPA)；

## 18. 为什么手动搭建MGR时报caching_sha2_password错，或某个节点状态一直处于RECOVERING

这是由于8.0.4中新引入 `caching_sha2_password` 身份验证插件，它对密码安全性要求更高，要求用户认证过程中在网络传输的密码是加密的，所以导致的这个问题的出现。

可以在手动搭建MGR执行 `CHANGE MASTER TO` 前先修改选项设置 `group_replication_recovery_get_public_key=ON`，这样就可以了。

详情参考：[MGR新节点RECOVERING状态的分析与解决：caching_sha2_password验证插件的影响](https://mp.weixin.qq.com/s/G9bpThAR-fYHHZsA8l4uuw)。

## 19. 某个MGR成员节点发生报错Duplicate entry...Error_code: 1062; handler error HA_ERR_FOUND_DUPP_KEY (1062)，怎么处理

这是因为该成员节点上应用事务时发生重复冲突报错了，可能是该节点有部分数据由于手动操作或误操作等原因造成不一致。

这种情况下，如果数据量较小，则建议直接重建该节点后再加入MGR集群；如果数据量较大，则考虑手动修复不一致的数据后再加入MGR集群，数据修复可以考虑采用 [gt-checksum工具](https://gitee.com/GreatSQL/gt-checksum)。

## 20. 某个MGR成员节点发生报错This member has more executed transactions than those present in the group，怎么处理

这是因为该成员节点有部分本地事务，和MGR全局事务产生冲突，较大可能是该节点有由于手动操作或误操作等原因造成。

这种情况下，如果数据量较小，则建议直接重建该节点后再加入MGR集群；如果数据量较大，则考虑手动修复不一致的数据后再加入MGR集群，数据修复可以考虑采用 [gt-checksum工具](https://gitee.com/GreatSQL/gt-checksum)。

## 21. 为什么用GreatSQL Shell创建/接管MGR集群时报错，提示Access denied

请用管理员创建MGR服务专用账户时，加上 `WITH GRANT OPTION` 选项。

另外，也不能用 `root@localhost` 这个最高管理员账户连接GreatSQL Shell后再创建/接管MGR集群。


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
