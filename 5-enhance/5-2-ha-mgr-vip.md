# GreatSQL高可用特性之内置动态VIP
---

GreatSQL支持在单主（Single-Primary）模式下，在读写节点（以下称呼：Primary节点）绑定动态VIP，使得高可用切换更便捷。

还可以为只读节点（以下称呼：Secondary节点）绑定只读VIP，业务可以通过该VIP来访问Secondary节点，实现Secondary节点的动态VIP漂移。

目前绑定动态VIP只支持IPv4，不支持IPv6。

**特别提醒**：

1. 动态VIP解绑以后，通过读写VIP与MGR Primary节点建立的连接会被主动kill掉，前提是需要添加配置 `bind_address="0.0.0.0"`；如果绑定某个固定IP地址，则无法实现MGR Primary节点切换后主动kill连接。该特性可参考：[MGR切主后断开应用连接](./5-2-ha-mgr-kill-conn-after-switch.md)。

2. 为了保证MGR节点间能正常通信，需要在各个MGR节点的系统 `/etc/hosts` 文件中配置各个节点的host和ip对应关系，**更推荐的做法是在每个MGR节点中都配置 `report_host`**，以确保能够通过 `performance_schema.REPLICATION_GROUP_MEMBERS` 表中的 `MEMBER_HOST` 列连接到其他节点，否则有可能导致MGR节点角色切换时VIP漂移绑定失败。

3. 动态绑定VIP需要新启动一个额外通信端口，请修改防火墙规则，确保该端口不会被屏蔽。

4. 只支持MGR单主模式（single-primary mode），不支持多主模式（multi-primary mode），所以要确保这两个选项设置正确值 `group_replication_single_primary_mode = ON` 以及 `group_replication_enforce_update_everywhere_checks= FALSE`。

## 启用内置VIP插件
- 开启新插件
```
plugin_load_add=greatdb_ha.so
```

或者在启动数据库实例后， 执行
```
install plugin greatdb_ha soname 'greatdb_ha.so';
```

## 新增配置参数
- 配置开启内置支持绑定VIP功能
```
loose-greatdb_ha_enable_mgr_vip = 1
```
- 配置Primary节点绑定的VIP
```
loose-greatdb_ha_mgr_vip_ip = "172.17.140.250"
```

- 配置ARP包广播重复次数。当节点绑定浮动IP以后，会广播ARP包来更新广播域内的ARP缓存，此参数是广播次数，默认是5次，合法取值范围为3-20
```
loose-greatdb_ha_send_arp_packge_times = 5
```

- 配置Secondary节点绑定的VIP，如果想绑定多个只读VIP，只需用逗号 `,` 隔开
```
loose-greatdb_ha_mgr_read_vip_ips = "172.17.140.251"

# 或绑定多个只读VIP
# loose-greatdb_ha_mgr_read_vip_ips = "172.17.140.251,172.17.140.252"
```

- 当只读VIP所在节点意外不可用后的处理方式，可选值为 `["TO_PRIMARY", "TO_ANOTHER_SECONDARY"]`。设置为 `TO_PRIMARY` 表示重新将只读VIP绑定到Primary节点上；设置为 `TO_ANOTHER_SECONDARY` 表示重新将只读VIP绑定到另外的Secondary节点上；默认值是 `TO_PRIMARY`，即重新绑定到Primary节点上。
```
loose-greatdb_ha_mgr_read_vip_floating_type = "TO_ANOTHER_SECONDARY"
```

- 配置动态绑定VIP服务专用通信端口，通过该端口进行通信数据传输。当MGR节点发生状态变更时，Primary节点根据预设的VIP绑定关系，按照 **变更小、平均分配** 的原则重新分配VIP绑定关系，并将VIP绑定关系通过专用通信端口发送给Secondary节点，Secondary节点根据绑定关系解绑或绑定指定VIP。
```
loose-greatdb_ha_port = 33062
```

- 可以强制配置只读VIP的绑定关系。但是一旦发生状态变更，可能需要重新配置：
  - 1. 该参数不能在配置文件配置
  - 2. 变更命令只能在主上执行
  - 3. 不能通过此命令修改写vip的绑定关系
  - 4. 不能通过此命令添加或移除vip(即拓扑关系里面的vip只能是读、写vip中的成员)
  - 5. 不能通过此命令添加或移除成员(即拓扑关系里面的uuid只能是先有mgr集群中的uuid，不能增加也不能删除)
```
> SET GLOABL greatdb_ha_vip_tope = "node1_uuid1::vip1; node2_uuid2::vip2,vip3; node3_uuid3::vip4";
```

- 配置要绑定的网卡名，插件会将vip绑定到MGR主所在机器的指定网卡上，比如配置为eth0，为了防止网卡原有的ip被覆盖，实际绑定后，会绑定在名为eth0:0的网卡上
```
loose-greatdb_ha_mgr_vip_nic = 'eth0'
```

- 配置掩码
```
loose-greatdb_ha_mgr_vip_mask = '255.255.255.0'
```

- 目前只支持在单主模式下才能启用内置vip特性，所以还需要设置下面参数：
```
loose-group_replication_single_primary_mode= TRUE
loose-group_replication_enforce_update_everywhere_checks= FALSE
```

- 选项 `greatdb_ha_mgr_vip_broad` 已废弃不再使用。
- 上述参数如果没有配置，或者配置格式不对时，内置VIP功能会失效（目前没有格式检查报错的功能）。
- 除了上述新增参数，其他MGR相关参数按照常规单主MGR配置要求即可。
- 上述参数支持在线动态修改。

上述配置说明的完整示例如下（MGR组内每个实例都需要配置）：
```
[mysqld]
#GreatSQL MGR vip
plugin-load-add=greatdb_ha.so
loose-greatdb_ha_enable_mgr_vip = ON
loose-greatdb_ha_mgr_vip_ip = "172.17.140.250"
loose-greatdb_ha_mgr_vip_mask = "255.255.255.0"
loose-greatdb_ha_mgr_vip_nic = "eth0"
loose-greatdb_ha_port = 33062
loose-greatdb_ha_mgr_read_vip_ips = "172.17.140.251"
#loose-greatdb_ha_mgr_read_vip_ips = "172.17.140.251,172.17.140.252"
loose-greatdb_ha_mgr_read_vip_floating_type = "TO_ANOTHER_SECONDARY"
loose-greatdb_ha_send_arp_packge_times = 5
report_host = 172.17.140.10
report_port = 3306

#single-primary mode
loose-group_replication_single_primary_mode=1
loose-group_replication_enforce_update_everywhere_checks=0
```

当MGR Primary节点上绑定的VIP被手动删除或者出现异常配置导致VIP绑定行为不对时，可以通过在MGR Primary节点上执行 `SET GLOBAL greatdb_ha_force_change_mgr_vip = ON` 命令去重新获取MGR拓扑结构，从而重新绑定VIP，该命令执行之后，参数  `greatdb_ha_force_change_mgr_vip` 值仍然为OFF，这个是符合预期的行为。

## 启动说明
配置VIP需要相关内核权限，获取相关权限有两种方式，以下三选一即可（推荐采用方法一）：

1. 【推荐方法】修改systemd服务文件，增加AmbientCapabilities参数，例如：
```
[Unit]
Description=GreatSQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target
[Install]
WantedBy=multi-user.target
[Service]
User=mysql
Group=mysql
Type=notify
TimeoutSec=0
PermissionsStartOnly=true
ExecStartPre=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld_pre_systemd
ExecStart=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld $MYSQLD_OPTS
EnvironmentFile=-/etc/sysconfig/mysql
LimitNOFILE = 10000
Restart=on-failure
RestartPreventExitStatus=1
Environment=MYSQLD_PARENT_PID=1
PrivateTmp=false
#增加这行以保证MGR VIP功能可用
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW
```
然后执行 `systemctl daemon-reload` 重新加载systemd服务，启动GreatSQL就可以。

**备注**：感谢社区用户 **芬达** 提供的建议方法。

2. 通过setcap命令为mysqld二进制文件添加 `CAP_NET_ADMIN` 和 `CAP_NET_RAW` 的capability。具体命令如下：
```shell
#执行该命令需要sudo权限或root
$ setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld
```

然后将GreatSQL二进制包的`lib/private`子目录加载到`LD_LIBRARY_PATH`中：
```
$ cat /etc/ld.so.conf.d/greatsql.conf
/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/lib/private
```

执行 `ldconfig && ldconfig -p | grep -i libpro` 确认配置无误：
```
$ ldconfig && ldconfig -p | grep -i 'libprotobuf.so'
	libprotobuf.so.3.19.4 (libc6,x86-64) => /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.3.19.4
```

之后启动GreatSQL即可。

3. 给mysqld进程的启动用户，例如是mysql用户，设置root权限。

**注意**
- 建议采用 `systemd` 方式管理GreatSQL服务，或者对启动用户用户（如 mysql）开启sudo权限，利用sudo调用 `systemd` 再启动GreatSQL服务，这样能确保mysqld进程可获得内核权限，成功绑定VIP。
- 当 `setcap` 命令为mysqld二进制文件添加capability以后，需要保证登录系统的用户和启动mysqld的用户保持一致，才能确保mysqld进程可获得内核权限。例如：用root用户登录系统，然后再以普通用户（mysql）启动mysqld进程，setcap无法生效，绑定vip时会失败报错。



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
