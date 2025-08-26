# MGR节点内置VIP
---

## 简介
GreatSQL支持在单主（Single-Primary）模式下，在读写节点（Primary节点）绑定动态VIP，使得高可用切换更便捷。

还可以为只读节点（Secondary节点）绑定只读VIP，业务可以通过该VIP来访问Secondary节点，实现Secondary节点的动态VIP漂移。

## 启用插件

在 *my.cnf* 配置文件 *[mysqld]* 区间中，增加下面这行配置：

```ini
[mysqld]
plugin_load_add=greatdb_ha.so
```

或者在启动数据库实例后，执行下面的 SQL 命令：

```sql
INSTALL PLUGIN greatdb_ha SONAME 'greatdb_ha.so';
```

## 配置参数

在 *my.cnf* 配置文件 *[mysqld]* 区间中，增加下面相关配置参数。

- 动态VIP总开关`greatdb_ha_enable_mgr_vip`。可选值为 **ON/OFF**（ON：启用，OFF：禁用），默认为 **OFF**。

```ini
greatdb_ha_enable_mgr_vip=ON
```

- 配置Primary节点绑定的VIP地址`greatdb_ha_mgr_vip_ip`

```ini
greatdb_ha_mgr_vip_ip="172.17.140.250"
```

- 配置ARP包广播重复次数`greatdb_ha_send_arp_packge_times`。当节点绑定VIP以后，会广播ARP包来更新广播域内的ARP缓存，此参数是广播次数，默认是5次，合法取值范围为3-20

```ini
greatdb_ha_send_arp_packge_times=5
```

- 配置Secondary节点绑定的VIP地址`greatdb_ha_mgr_read_vip_ips`。如果想绑定多个只读VIP，只需用逗号 `,` 隔开

```ini
greatdb_ha_mgr_read_vip_ips="172.17.140.251"

# 或绑定多个只读VIP
# greatdb_ha_mgr_read_vip_ips="172.17.140.251,172.17.140.252"
```

- 配置当只读VIP所在节点意外不可用后的处理方式`greatdb_ha_mgr_read_vip_floating_type`。可选值为 **["TO_PRIMARY", "TO_ANOTHER_SECONDARY"]**
  - 设置为 **TO_PRIMARY** 表示重新将只读VIP绑定到Primary节点上；
  - 设置为 **TO_ANOTHER_SECONDARY** 表示重新将只读VIP绑定到另外的Secondary节点上；
  - 默认值是 **TO_PRIMARY**，即重新绑定到Primary节点上。

```ini
greatdb_ha_mgr_read_vip_floating_type="TO_ANOTHER_SECONDARY"
```

- 配置动态绑定VIP服务专用通信端口`greatdb_ha_port`。各节点通过该端口进行通信数据传输，当Primary节点发生状态变更时，会根据预设的VIP绑定关系，按照 **变更小、平均分配** 的原则重新分配VIP绑定关系，并将VIP绑定关系通过专用通信端口发送给相应节点（该节点可能已被投票选为新的Primary节点，或被投票去掉Primary角色），该节点根据新的绑定关系解绑或绑定VIP。

```ini
greatdb_ha_port=33062
```

- 配置只读VIP的拓扑关系`greatdb_ha_vip_tope`，可以在运行状态下强行修改拓扑关系。当MGR只读节点发生状态变更时，可能需要重新配置其拓扑关系。关于该参数的使用注意事项有以下几点：
  - 该参数不能在配置文件中提前预设配置；
  - 变更操作只能在Primary节点上执行；
  - 不能通过此操作修改Primary节点的VIP绑定关系；
  - 不能通过此操作添加或移除VIP（即拓扑关系里面的VIP只能是读、写VIP中的成员）；
  - 不能通过此操作添加或移除成员（即拓扑关系里面的MEMBER_ID只能是现有MGR成员节点的MEMBER_ID，不能增加也不能删除）。

```sql
SET GLOABL greatdb_ha_vip_tope="node1_uuid1::vip1; node2_uuid2::vip2,vip3; node3_uuid3::vip4";
```

- 配置要绑定的网卡名`greatdb_ha_mgr_vip_nic`。插件会将VIP绑定到Primary节点所在服务器指定的网卡上，为了防止该网卡上原有的IP被覆盖，实际上是绑定在 **指定网卡名:0** 的网卡上，例如 **eth0:0**。如果在同一个服务器中运行多实例，则需要分别对每个实例设置不同的网卡名，而不能多个实例对同一个网卡绑定不同的VIP。如第一个实例设置`greatdb_ha_mgr_vip_nic='eth0:0'`，第二个实例设置`greatdb_ha_mgr_vip_nic='eth0:1'`，将二者区分开。同样地，各个实例也要设置不同的`greatdb_ha_port`参数值。

```ini
greatdb_ha_mgr_vip_nic='eth0'
```

- 配置VIP地址相应的掩码`greatdb_ha_mgr_vip_mask`

```ini
greatdb_ha_mgr_vip_mask='255.255.255.0'
```

- 只支持在单主模式下才能启用内置VIP功能，因此还需要设置以下两个参数：

```ini
group_replication_single_primary_mode=ON
group_replication_enforce_update_everywhere_checks=OFF
```

- 上述参数如果没有配置，或者配置格式不对时，内置VIP功能会失效。
- 除了上述新增参数，其他MGR相关参数按照常规单主MGR配置要求即可。
- 上述参数均支持在线动态修改。
- 参数 `greatdb_ha_mgr_vip_broad` 已废弃不再使用，无需配置。

一份完整的内置VIP相关参数（仅列出内置VIP相关参数，其他参数未列出）示例如下，MGR组内每个实例都需要配置这些参数：

```ini
[mysqld]
#GreatSQL MGR VIP
plugin-load-add=greatdb_ha.so
greatdb_ha_enable_mgr_vip=ON
greatdb_ha_mgr_vip_ip="172.17.140.250"
greatdb_ha_mgr_vip_mask="255.255.255.0"
greatdb_ha_mgr_vip_nic="eth0"
greatdb_ha_port=33062
greatdb_ha_mgr_read_vip_ips="172.17.140.251"
#greatdb_ha_mgr_read_vip_ips="172.17.140.251,172.17.140.252"
greatdb_ha_mgr_read_vip_floating_type="TO_ANOTHER_SECONDARY"
greatdb_ha_send_arp_packge_times=5
report_host="172.17.140.10"
report_port=3306

#single-primary mode
group_replication_single_primary_mode=ON
group_replication_enforce_update_everywhere_checks=OFF
```

当Primary节点上绑定的 VIP 被手动删除或者出现异常导致 VIP 绑定行为异常时，可以通过在Primary节点上执行SQL命令`SET GLOBAL greatdb_ha_force_change_mgr_vip=ON`，其作用是重新获取MGR拓扑结构，并重新绑定VIP。该命令执行完后，参数`greatdb_ha_force_change_mgr_vip`的值仍为**OFF**，这个是符合预期的行为。

如果物理网卡由于异常或人为原因关闭又再次启用后，可能会由于MGR成员间通信异常而导致MGR发生报错，比如发生网络分区等情况，这时候也会导致VIP绑定关系发生异常，需要手动执修复这类异常问题。修复完毕后，如果VIP绑定还是不对的话，可以在Primary节点上执行SQL命令`SET GLOBAL greatdb_ha_force_change_mgr_vip=ON`操作再次尝试修复该问题。

## 启动说明

启用内置VIP功能需要部分内核权限，获取相关权限有几种方式，以下三选一即可（推荐采用方法一）：

- 【推荐方法】方案1：利用systemd提权。

修改systemd服务文件，增加`AmbientCapabilities`参数，例如：
```ini
[Unit]
Description=GreatSQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target
[Install]
WantedBy=multi-user.target
[Service]
# some limits
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=65535
# processes/threads
LimitNPROC=65535
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false

User=mysql
Group=mysql
Type=notify
TimeoutSec=10
PermissionsStartOnly=true
ExecStartPre=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
#增加这行以保证MGR VIP功能可用
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW
```
然后执行 `systemctl daemon-reload` 重新加载systemd服务，启动GreatSQL就可以。

**备注**：感谢社区用户 **芬达** 提供的建议方法。

- 方案2：利用`setcap`提权。

利用系统命令`setcap`为mysqld二进制文件添加 `CAP_NET_ADMIN` 和 `CAP_NET_RAW` 的capability，实现提权。

具体命令如下：
```bash
#执行该命令需要sudo权限或root
setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld
```

然后将GreatSQL二进制包的`lib/private`子目录加载到`LD_LIBRARY_PATH`中：
```bash
$ cat /etc/ld.so.conf.d/greatsql.conf

...
/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/lib/private
```

执行 `ldconfig && ldconfig -p | grep -i libpro` 确认配置无误：
```bash
$ ldconfig && ldconfig -p | grep -i 'libprotobuf.so'

...
	libprotobuf.so.3.19.4 (libc6,x86-64) => /usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.3.19.4
```

之后启动GreatSQL即可。

- 方案3：用root权限启动mysqld进程。

给mysqld进程的启动用户，例如是mysql用户，加上root权限，或者直接用root用户启动mysqld进程。

**注意**
- 建议采用 `systemd` 方式管理GreatSQL服务，或者对启动用户用户（如mysql）开启sudo权限，利用sudo调用 `systemd` 再启动GreatSQL服务，这样能确保mysqld进程可获得内核权限，成功绑定VIP。
- 当 `setcap` 命令为mysqld二进制文件添加capability以后，需要保证登录系统的用户和启动mysqld的用户保持一致，才能确保mysqld进程可获得内核权限。例如：用root用户登录系统，然后再以普通用户（mysql）启动mysqld进程，`setcap`无法生效，绑定vip时会失败报错。

## 注意事项

1. 解绑VIP后，若想让通过VIP与Primary节点建立的连接会被主动KILL掉，其前提是设置`bind_address="0.0.0.0"`。如果`bind_address`参数指定固定IP地址，则无法实现连接被主动KILL功能。详情参考：[MGR切主后断开应用连接](./5-2-ha-mgr-kill-conn-after-switch.md)。

2. 为了保证MGR节点间能正常通信，需要在各个MGR节点的系统 `/etc/hosts` 文件中配置各个节点的host和ip对应关系，**更推荐的做法是在每个MGR节点中都配置`report_host`**，以确保能够通过`PERFORMANCE_SCHEMA.REPLICATION_GROUP_MEMBERS`表中的`MEMBER_HOST`列连接到其他节点，否则有可能导致MGR节点角色切换时VIP漂移绑定失败。

3. 动态绑定VIP需要新启动一个额外通信端口（由参数`greatdb_ha_port`指定），请修改并检查防火墙规则，确保该端口不会被屏蔽。

4. 只支持MGR单主模式（Single-Primary），不支持多主模式（Multi-Primary），所以要确保参数设置正确`group_replication_single_primary_mode=ON`以及`group_replication_enforce_update_everywhere_checks=OFF`。

5. 当存在多张网卡时，可能出现VIP漂移后无法主动广播MAC地址的情况，可以在服务器上定时主动执行`arping`对外广播MAC地址。例如：

```bash
/usr/sbin/arping -U -I bond0 -c 3 172.17.140.254
```

其中
  - 参数`-U`的作用是无理由的（强制的）ARP模式去更新别的主机上的ARP CACHE列表中的本机的信息，不需要响应；
  - 参数`-I bond00`是指定绑定VIP的那个网卡名；
  - 参数 `-c 3` 表示发送 3 次请求；
  - 参数*172.17.140.250*是VIP地址。

也可以采用下面的方法：

```bash
/usr/sbin/arping -U -I bond0 -c 3 172.17.140.140 -s 172.117.140.250
```

其中
  - 参数`-s 172.17.140.250`是指定广播的IP为绑定的VIP地址；
  - 参数*172.17.140.140*是其他节点服务器的IP地址。


如果想启用IPv6支持，有以下几点注意事项：

1. 仅支持同网段下通信。

2. 几个相关参数`report_host / group_replication_group_seeds / group_replication_local_address`也需要使用IPv6地址。

3. 不支持IPv4和IPv6混用。

4. 需要关闭系统层的 **DAD检测**，否则VIP漂移之后无法绑定。新增或修改`/etc/sysctl.d/local.conf`文件，配置内容参考如下，编辑保存退出后重启服务器：

```ini
net.ipv6.conf.all.accept_dad = 0
net.ipv6.conf.default.accept_dad = 0
net.ipv6.conf.eth0.accept_dad = 0
net.ipv6.conf.eth1.accept_dad = 0
# IPv6 Privacy Extensions (RFC 4941)
net.ipv6.conf.all.use_tempaddr = 0
net.ipv6.conf.default.use_tempaddr = 0
```

## 在Docker容器中使用内置VIP功能

GreatSQL Docker镜像默认不支持在Docker中使用内置VIP功能。原因如下：

1. 在Docker中默认无法用systemd方式来启动GreatSQL。
2. 在GreatSQL Docker镜像打包时，也没有将mysqld程序文件属主改为root，并加上`setcap`提权操作。

因此，想要在Docker中使用GreatSQL内置VIP功能，就需要自行处理。

下面介绍如何在Docker容器中使用GreatSQL内置VIP功能。可以采用以下方式实现：

1. 创建新容器时加上`--privileged`参数。
2. 安装GreatSQL软件包（二进制包或RPM包都行）。
3. 修改mysqld程序文件属主为root，并利用`setcap`对mysqld二进制文件提权。
4. 正确配置相关参数。

详细操作过程如下所示。

1. 创建一个新容器。

```bash
docker run -itd --privileged --hostname t1 --name t1 centos:8 bash
```

2. 进入容器，查看初始IP信息。

```bash
[root@t1 /]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
233: eth0@if234: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 02:42:ac:11:00:04 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.4/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

3. 安装GreatSQL，这里采用 RPM 包方式，具体过程不赘述。

4. 在容器中执行提权操作。

```bash
[root@t1 /]# setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/sbin/mysqld
[root@t1 /]# chown root:root /usr/sbin/mysqld

[root@t1 /]# getcap /usr/sbin/mysqld
/usr/sbin/mysqld = cap_net_admin,cap_net_raw+ep

[root@t1 /]# ls -la /usr/sbin/mysqld
-rwxr-xr-x 1 root root 67858088 Jul 30 08:18 /usr/sbin/mysqld
```

4. 修改 **/etc/my.cnf** 配置文件，修改启动用户为root（只展示部分相关内容）：

```ini
[mysqld]
user=root
plugin_load_add='greatdb_ha.so'
greatdb_ha_enable_mgr_vip=ON
greatdb_ha_mgr_vip_nic='eth0'
greatdb_ha_mgr_vip_ip='172.17.0.40'
greatdb_ha_mgr_vip_mask='255.255.0.0'
greatdb_ha_port=33062
#greatdb_ha_mgr_read_vip_ips="172.17.0.41,172.17.0.42"
greatdb_ha_mgr_read_vip_floating_type="TO_ANOTHER_SECONDARY"
greatdb_ha_send_arp_packge_times=5
greatdb_ha_mgr_exit_primary_kill_connection_mode=OFF
report_host=172.17.0.4
report_port=3306
...
```

5. 在已经完成GreatSQL数据初始化操作之后，启动GreatSQL服务进程（确认是以root身份运行）。

```bash
[root@t1 /]# /usr/sbin/mysqld &

[root@t1 /]# ps -ef | grep mysqld
root        1518       1  1 07:02 ?        00:00:23 /usr/sbin/mysqld
```

6. 进入GreatSQL查看VIP绑定/运行状态。

```sql
[root@GreatSQL][(none)]> SHOW GLOBAL VARIABLES LIKE 'greatdb_ha%';
+--------------------------------------------------+---------------------------------------------------+
| Variable_name                                    | Value                                             |
+--------------------------------------------------+---------------------------------------------------+
| greatdb_ha_enable_mgr_vip                        | ON                                                |
| greatdb_ha_force_change_mgr_vip                  | OFF                                               |
| greatdb_ha_gateway_address                       |                                                   |
| greatdb_ha_mgr_exit_primary_kill_connection_mode | OFF                                               |
| greatdb_ha_mgr_read_vip_floating_type            | TO_ANOTHER_SECONDARY                              |
| greatdb_ha_mgr_read_vip_ips                      |                                                   |
| greatdb_ha_mgr_vip_broad                         | 255.255.255.255                                   |
| greatdb_ha_mgr_vip_ip                            | 172.17.0.40                                       |
| greatdb_ha_mgr_vip_mask                          | 255.255.0.0                                       |
| greatdb_ha_mgr_vip_nic                           | eth0                                              |
| greatdb_ha_port                                  | 33062                                             |
| greatdb_ha_send_arp_packge_times                 | 5                                                 |
| greatdb_ha_vip_tope                              | bcd374fc-593c-11ef-a05e-0242ac110004::172.17.0.40 |
+--------------------------------------------------+---------------------------------------------------+
13 rows in set (0.00 sec)
```

7. 在容器中系统层查看VIP绑定/运行状态。

```bash
[root@t1 /]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
233: eth0@if234: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 02:42:ac:11:00:04 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.4/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 172.17.0.40/16 brd 172.17.255.255 scope global secondary eth0:0
       valid_lft forever preferred_lft forever
```

8. 在外部宿主系统环境下检测VIP是否可连通。

```bash
$ ping 172.17.0.40

...
PING 172.17.0.40 (172.17.0.40) 56(84) bytes of data.
64 bytes from 172.17.0.40: icmp_seq=1 ttl=64 time=0.038 ms
64 bytes from 172.17.0.40: icmp_seq=2 ttl=64 time=0.032 ms
...
```

可以看到，已经正确绑定VIP并且可连通。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
