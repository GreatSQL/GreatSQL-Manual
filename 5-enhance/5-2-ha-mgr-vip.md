# MGR 节点内置 VIP
---

## 简介
GreatSQL 支持在单主（Single-Primary）模式下，在读写节点（Primary 节点）绑定动态 VIP，使得高可用切换更便捷。

还可以为只读节点（Secondary 节点）绑定只读 VIP，业务可以通过该 VIP 来访问 Secondary 节点，实现 Secondary 节点的动态 VIP 漂移。

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

## 安全加固说明

### 漏洞概述

在早期版本中，HA 插件存在以下安全漏洞：

1. **缺少认证的敏感信息读取（信息泄露）**：`get_local_listen_sock()` 将 HA 管理端口绑定到 `0.0.0.0`，任意网络可达主机均可建立连接。认证仅比较 16 字节硬编码 `"Great01HaReserv!"`，该字符串在源码中明文可见。认证通过后，`GET_BIND_VIPS` 消息类型无需任何授权即可读取并返回所有已绑定的 VIP 及网卡信息。

2. **缺少认证的 VIP 劫持**：`SET_ALL_NODE_BIND_VIPS` 消息类型允许主节点向从节点下发 VIP 分配指令。由于认证仅依赖硬编码魔术字，任意攻击者可伪造此消息，触发 `ioctl(SIOCSIFADDR)` 将任意 IP 地址绑定到目标网卡。

3. **线程内未捕获异常导致远程拒绝服务漏洞**：`get_view_id()` 中使用 `std::stoi()` 将 `view_id` 中冒号后的字符串转换为整数版本号，但未捕获 `std::invalid_argument` 异常。当 `view_id` 版本字段为任意非数字字符串时，会触发 `abort()` 和 `SIGABRT`，终止整个 mysqld 进程。

### 解决方案

经综合评估，采用 **UDF（用户定义函数）方式** 实现 HA 插件通信，废弃原有 HA 端口通信方式。主要变化如下：

1. **废弃 HA 端口**：删除原 HA 端口（`greatdb_ha_port`）的 listen/accept 逻辑，改为通过 UDF 函数调用方式实现通信。

2. **利用 MySQL 原生认证**：Primary 节点通过 MGR 回调获取所有 Secondary 节点的 host 和 port 信息，通过 `group_replication_recovery` 通道获取 `rpl_user` 和 `rpl_password`，使用 `mysql_real_connect()` 连接到 Secondary 节点。

3. **UDF 函数注册**：在 HA 插件 init/deinit 函数中进行 UDF 函数的注册和注销。

4. **权限校验**：调用 UDF 函数时，通过 `thd->security_context()->master_access() & SUPER_ACL` 和 `has_global_grant(thd->security_context(), "GROUP_REPLICATION_STREAM")` 进行鉴权。

### 新旧消息对应关系

| 旧版 HA 通信消息 | 新版 UDF 函数 | 返回值类型 |
|----------------|--------------|----------|
| GET_BIND_VIPS | `SELECT HA_GET_BIND_VIPS('viewid')` | STRING_RESULT |
| SET_ALL_NODE_BIND_VIPS | `SELECT HA_SET_ALL_NODE_BIND_VIPS('viewid;UUID1:vip1,vip2;UUID2:vip3;')` | 函数返回值 |
| OK_REPLY | ok | 函数返回值 |
| ERROR_REPLY | 抛出的 error 信息 | error 包 |
| YOU_ARE_NOT_PRIMARY | you_are_not_primary | 函数返回值 |

### 配置参数变化

**废弃的参数**（不再需要配置）：
- `greatdb_ha_port` - HA 通信端口已废弃，改为通过 MySQL 3306 端口进行 UDF 通信

**保留的参数**：
- `greatdb_ha_enable_mgr_vip` - 动态 VIP 总开关
- `greatdb_ha_mgr_vip_ip` - Primary 节点绑定的 VIP 地址
- `greatdb_ha_mgr_vip_mask` - VIP 地址相应的掩码
- `greatdb_ha_mgr_vip_nic` - 要绑定的网卡名
- `greatdb_ha_send_arp_packge_times` - ARP 包广播重复次数
- `greatdb_ha_mgr_read_vip_ips` - Secondary 节点绑定的 VIP 地址
- `greatdb_ha_mgr_read_vip_floating_type` - 只读 VIP 漂移策略
- `greatdb_ha_vip_tope` - 只读 VIP 的拓扑关系（运行时动态修改）
- `greatdb_ha_force_change_mgr_vip` - 强制重新绑定 VIP

### 升级注意事项

1. **版本兼容性**：新版 HA 插件采用 UDF 通信方式，与旧版 HA 端口通信方式不兼容。升级时需要所有 MGR 节点同时升级。

2. **防火墙规则**：由于废弃了 HA 端口，可以移除相关防火墙规则。MySQL 3306 端口需要保持可访问。

3. **进程列表**：通过 `SHOW PROCESSLIST` 可以查看 UDF 通信连接的使用情况。

4. **连接占用**：UDF 通信方式会占用 `max_connections` 的连接数。Primary 节点会连接到每个 Secondary 节点，请确保连接数配置充足。

## 配置参数

在 *my.cnf* 配置文件 *[mysqld]* 区间中，增加下面相关配置参数。

- 动态 VIP 总开关 `greatdb_ha_enable_mgr_vip`。可选值为 **ON/OFF**（ON：启用，OFF：禁用），默认为 **OFF**。

```ini
greatdb_ha_enable_mgr_vip=ON
```

- 配置 Primary 节点绑定的 VIP 地址 `greatdb_ha_mgr_vip_ip`

```ini
greatdb_ha_mgr_vip_ip="172.17.140.250"
```

- 配置 ARP 包广播重复次数 `greatdb_ha_send_arp_packge_times`。当节点绑定 VIP 以后，会广播 ARP 包来更新广播域内的 ARP 缓存，此参数是广播次数，默认是 5 次，合法取值范围为 3-20

```ini
greatdb_ha_send_arp_packge_times=5
```

- 配置 Secondary 节点绑定的 VIP 地址 `greatdb_ha_mgr_read_vip_ips`。如果想绑定多个只读 VIP，只需用逗号 `,` 隔开

```ini
greatdb_ha_mgr_read_vip_ips="172.17.140.251"

# 或绑定多个只读VIP
# greatdb_ha_mgr_read_vip_ips="172.17.140.251,172.17.140.252"
```

- 配置当只读 VIP 所在节点意外不可用后的处理方式 `greatdb_ha_mgr_read_vip_floating_type`。可选值为 **["TO_PRIMARY", "TO_ANOTHER_SECONDARY"]**
  - 设置为 **TO_PRIMARY** 表示重新将只读 VIP 绑定到 Primary 节点上；
  - 设置为 **TO_ANOTHER_SECONDARY** 表示重新将只读 VIP 绑定到另外的 Secondary 节点上；
  - 默认值是 **TO_PRIMARY**，即重新绑定到 Primary 节点上。

```ini
greatdb_ha_mgr_read_vip_floating_type="TO_ANOTHER_SECONDARY"
```

- 配置只读 VIP 的拓扑关系 `greatdb_ha_vip_tope`，可以在运行状态下强行修改拓扑关系。当 MGR 只读节点发生状态变更时，可能需要重新配置其拓扑关系。关于该参数的使用注意事项有以下几点：
  - 该参数不能在配置文件中提前预设配置；
  - 变更操作只能在 Primary 节点上执行；
  - 不能通过此操作修改 Primary 节点的 VIP 绑定关系；
  - 不能通过此操作添加或移除 VIP（即拓扑关系里面的 VIP 只能是读、写 VIP 中的成员）；
  - 不能通过此操作添加或移除成员（即拓扑关系里面的 MEMBER_ID 只能是现有 MGR 成员节点的 MEMBER_ID，不能增加也不能删除）。

```sql
SET GLOBAL greatdb_ha_vip_tope="node1_uuid1::vip1; node2_uuid2::vip2,vip3; node3_uuid3::vip4";
```

- 配置要绑定的网卡名 `greatdb_ha_mgr_vip_nic`。插件会将 VIP 绑定到 Primary 节点所在服务器指定的网卡上，为了防止该网卡上原有的 IP 被覆盖，实际上是绑定在 **指定网卡名:0** 的网卡上，例如 **eth0:0**。如果在同一个服务器中运行多实例，则需要分别对每个实例设置不同的网卡名，而不能多个实例对同一个网卡绑定不同的 VIP。如第一个实例设置 `greatdb_ha_mgr_vip_nic='eth0:0'`，第二个实例设置 `greatdb_ha_mgr_vip_nic='eth0:1'`，将二者区分开。

```ini
greatdb_ha_mgr_vip_nic='eth0'
```

- 配置 VIP 地址相应的掩码 `greatdb_ha_mgr_vip_mask`

```ini
greatdb_ha_mgr_vip_mask='255.255.255.0'
```

- 只支持在单主模式下才能启用内置 VIP 功能，因此还需要设置以下两个参数：

```ini
group_replication_single_primary_mode=ON
group_replication_enforce_update_everywhere_checks=OFF
```

- 上述参数如果没有配置，或者配置格式不对时，内置 VIP 功能会失效。
- 除了上述新增参数，其他 MGR 相关参数按照常规单主 MGR 配置要求即可。
- 上述参数均支持在线动态修改。
- 参数 `greatdb_ha_mgr_vip_broad` 已废弃不再使用，无需配置。

一份完整的内置 VIP 相关参数（仅列出内置 VIP 相关参数，其他参数未列出）示例如下，MGR 组内每个实例都需要配置这些参数：

```ini
[mysqld]
#GreatSQL MGR VIP
plugin-load-add=greatdb_ha.so
greatdb_ha_enable_mgr_vip=ON
greatdb_ha_mgr_vip_ip="172.17.140.250"
greatdb_ha_mgr_vip_mask="255.255.255.0"
greatdb_ha_mgr_vip_nic="eth0"
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

**注意**：新版配置中不再需要配置 `greatdb_ha_port` 参数。

当 Primary 节点上绑定的 VIP 被手动删除或者出现异常导致 VIP 绑定行为异常时，可以通过在 Primary 节点上执行 SQL 命令 `SET GLOBAL greatdb_ha_force_change_mgr_vip=ON`，其作用是重新获取 MGR 拓扑结构，并重新绑定 VIP。该命令执行完后，参数 `greatdb_ha_force_change_mgr_vip` 的值仍为 **OFF**，这个是符合预期的行为。

如果物理网卡由于异常或人为原因关闭又再次启用后，可能会由于 MGR 成员间通信异常而导致 MGR 发生报错，比如发生网络分区等情况，这时候也会导致 VIP 绑定关系发生异常，需要手动修复这类异常问题。修复完毕后，如果 VIP 绑定还是不对的话，可以在 Primary 节点上执行 SQL 命令 `SET GLOBAL greatdb_ha_force_change_mgr_vip=ON` 操作再次尝试修复该问题。

## 启动说明

启用内置VIP功能需要部分内核权限，获取相关权限有几种方式，以下三选一即可（推荐采用方法一）：

- 【推荐方法】方案1：利用 systemd 提权。

修改 systemd 服务文件，增加 `AmbientCapabilities` 参数，例如：
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
ExecStartPre=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
#增加这行以保证 MGR VIP 功能可用
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW
```
然后执行 `systemctl daemon-reload` 重新加载 systemd 服务，启动 GreatSQL 就可以。

**备注**：感谢社区用户 **芬达** 提供的建议方法。

- 方案2：利用 `setcap` 提权。

利用系统命令 `setcap` 为 mysqld 二进制文件添加 `CAP_NET_ADMIN` 和 `CAP_NET_RAW` 的 capability，实现提权。

具体命令如下：
```bash
#执行该命令需要 sudo 权限或 root
setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld
```

然后将 GreatSQL 二进制包的 `lib/private` 子目录加载到 `LD_LIBRARY_PATH` 中：
```bash
$ cat /etc/ld.so.conf.d/greatsql.conf

...
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private
```

执行 `ldconfig && ldconfig -p | grep -i libpro` 确认配置无误：
```bash
$ ldconfig && ldconfig -p | grep -i 'libprotobuf.so'

...
	libprotobuf.so.3.19.4 (libc6,x86-64) => /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.3.19.4
```

之后启动 GreatSQL 即可。

- 方案3：用 root 权限启动 mysqld 进程。

给 mysqld 进程的启动用户，例如是 mysql 用户，加上 root 权限，或者直接用 root 用户启动 mysqld 进程。

**注意**
- 建议采用 `systemd` 方式管理 GreatSQL 服务，或者对启动用户（如 mysql）开启 sudo 权限，利用 sudo 调用 `systemd` 再启动 GreatSQL 服务，这样能确保 mysqld 进程可获得内核权限，成功绑定 VIP。
- 当 `setcap` 命令为 mysqld 二进制文件添加 capability 以后，需要保证登录系统的用户和启动 mysqld 的用户保持一致，才能确保 mysqld 进程可获得内核权限。例如：用 root 用户登录系统，然后再以普通用户（mysql）启动 mysqld 进程，`setcap` 无法生效，绑定 VIP 时会失败报错。

## 注意事项

1. 解绑 VIP 后，若想让通过 VIP 与 Primary 节点建立的连接会被主动 KILL 掉，其前提是设置 `bind_address="0.0.0.0"`。如果 `bind_address` 参数指定固定 IP 地址，则无法实现连接被主动 KILL 功能。详情参考：[MGR 切主后断开应用连接](./5-2-ha-mgr-kill-conn-after-switch.md)。

2. 为了保证 MGR 节点间能正常通信，需要在各个 MGR 节点的系统 `/etc/hosts` 文件中配置各个节点的 host 和 ip 对应关系，**更推荐的做法是在每个 MGR 节点中都配置 `report_host`**，以确保能够通过 `performance_schema.replication_group_members` 表中的 `MEMBER_HOST` 列连接到其他节点，否则有可能导致 MGR 节点角色切换时 VIP 漂移绑定失败。

3. 只支持 MGR 单主模式（Single-Primary），不支持多主模式（Multi-Primary），所以要确保参数设置正确 `group_replication_single_primary_mode=ON` 以及 `group_replication_enforce_update_everywhere_checks=OFF`。

4. 当存在多张网卡时，可能出现 VIP 漂移后无法主动广播 MAC 地址的情况，可以在服务器上定时主动执行 `arping` 对外广播 MAC 地址。例如：

```bash
/usr/sbin/arping -U -I bond0 -c 3 172.17.140.254
```

其中
  - 参数 `-U` 的作用是无理由的（强制的）ARP 模式去更新别的主机上的 ARP CACHE 列表中的本机的信息，不需要响应；
  - 参数 `-I bond00` 是指定绑定 VIP 的那个网卡名；
  - 参数 `-c 3` 表示发送 3 次请求；
  - 参数*172.17.140.250*是VIP地址。

也可以采用下面的方法：

```bash
/usr/sbin/arping -U -I bond0 -c 3 172.17.140.140 -s 172.117.140.250
```

其中
  - 参数 `-s 172.17.140.250` 是指定广播的 IP 为绑定的 VIP 地址；
  - 参数 *172.17.140.140* 是其他节点服务器的 IP 地址。


如果想启用 IPv6 支持，有以下几点注意事项：

1. 仅支持同网段下通信。

2. 几个相关参数 `report_host / group_replication_group_seeds / group_replication_local_address` 也需要使用 IPv6 地址。

3. 不支持 IPv4 和 IPv6 混用。

4. 需要关闭系统层的 **DAD 检测**，否则 VIP 漂移之后无法绑定。新增或修改 `/etc/sysctl.d/local.conf` 文件，配置内容参考如下，编辑保存退出后重启服务器：

```ini
net.ipv6.conf.all.accept_dad = 0
net.ipv6.conf.default.accept_dad = 0
net.ipv6.conf.eth0.accept_dad = 0
net.ipv6.conf.eth1.accept_dad = 0
# IPv6 Privacy Extensions (RFC 4941)
net.ipv6.conf.all.use_tempaddr = 0
net.ipv6.conf.default.use_tempaddr = 0
```

6. **rpl_user 配置要求**：UDF 通信方式依赖 `group_replication_recovery` 通道的 rpl_user 和 rpl_password。验证表明，不配置 change master 的 rpl_user 会导致 MGR 启动成功后一段时间报错退出，因此必须正确配置 rpl_user。

## 在 Docker 容器中使用内置 VIP 功能

GreatSQL Docker 镜像默认不支持在 Docker 中使用内置 VIP 功能。原因如下：

1. 在 Docker 中默认无法用 systemd 方式来启动 GreatSQL。
2. 在 GreatSQL Docker 镜像打包时，也没有将 mysqld 程序文件属主改为 root，并加上 `setcap` 提权操作。

因此，想要在 Docker 中使用 GreatSQL 内置 VIP 功能，就需要自行处理。

下面介绍如何在 Docker 容器中使用 GreatSQL 内置 VIP 功能。可以采用以下方式实现：

1. 创建新容器时加上`--privileged`参数。
2. 安装 GreatSQL 软件包（二进制包或 RPM 包都行）。
3. 修改 mysqld 程序文件属主为 root，并利用 `setcap` 对 mysqld 二进制文件提权。
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

3. 安装 GreatSQL，这里采用 RPM 包方式，具体过程不赘述。

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
#greatdb_ha_mgr_read_vip_ips="172.17.0.41,172.17.0.42"
greatdb_ha_mgr_read_vip_floating_type="TO_ANOTHER_SECONDARY"
greatdb_ha_send_arp_packge_times=5
greatdb_ha_mgr_exit_primary_kill_connection_mode=OFF
report_host=172.17.0.4
report_port=3306
...
```

**注意**：新版配置中不再需要配置 `greatdb_ha_port` 参数。

5. 在已经完成 GreatSQL 数据初始化操作之后，启动 GreatSQL 服务进程（确认是以 root 身份运行）。

```bash
[root@t1 /]# /usr/sbin/mysqld &

[root@t1 /]# ps -ef | grep mysqld
root        1518       1  1 07:02 ?        00:00:23 /usr/sbin/mysqld
```

6. 进入 GreatSQL 查看 VIP 绑定/运行状态。

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
| greatdb_ha_send_arp_packge_times                 | 5                                                 |
| greatdb_ha_vip_tope                              | bcd374fc-593c-11ef-a05e-0242ac110004::172.17.0.40 |
+--------------------------------------------------+---------------------------------------------------+
12 rows in set (0.00 sec)
```

7. 在容器中系统层查看 VIP 绑定/运行状态。

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

8. 在外部宿主系统环境下检测 VIP 是否可连通。

```bash
$ ping 172.17.0.40

...
PING 172.17.0.40 (172.17.0.40) 56(84) bytes of data.
64 bytes from 172.17.0.40: icmp_seq=1 ttl=64 time=0.038 ms
64 bytes from 172.17.0.40: icmp_seq=2 ttl=64 time=0.032 ms
...
```

可以看到，已经正确绑定 VIP 并且可连通。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
