# 单VLAN高可用
---

本文档主要介绍在单VLAN场景中，如何基于GreatSQL+VIP构建高可用架构。

GreatSQL支持在单主（Single-Primary）模式下，在读写节点绑定动态VIP，使得高可用切换更便捷。

整体架构图如下所示：

![跨城多IDC高可用方案](./5-ha-single-vlan01.png)


## 启用内置vip插件

- 开启新插件

```ini
plugin_load_add=greatdb_ha.so
```

或者在启动数据库实例后， 执行

```sql
INSTALL PLUGIN greatdb_ha SONAME 'greatdb_ha.so';
```

## 新增配置参数

- 配置开启内置vip功能

```ini
loose-greatdb_ha_enable_mgr_vip = ON
```

- 配置Primary节点绑定的VIP

```ini
loose-greatdb_ha_mgr_vip_ip = "172.17.140.250"
```

- 配置ARP包广播重复次数。当节点绑定浮动IP以后，会广播ARP包来更新广播域内的ARP缓存，此参数是广播次数，默认是5次，合法取值范围为3-20

```ini
loose-greatdb_ha_send_arp_packge_times = 5
```

- 配置动态绑定VIP服务专用通信端口，通过该端口进行通信数据传输。当MGR节点发生状态变更时，Primary节点根据预设的VIP绑定关系，按照 **变更小、平均分配** 的原则重新分配VIP绑定关系，并将VIP绑定关系通过专用通信端口发送给Secondary节点，Secondary节点根据绑定关系解绑或绑定指定VIP。

```ini
loose-greatdb_ha_port = 33062
```

- 配置要绑定的网卡名，插件会将vip绑定到MGR主（Primary）节点所在机器的指定网卡上，比如配置为eth0，为了防止网卡原有的ip被覆盖，实际绑定后，会绑定在名为eth0:0的网卡上

```ini
loose-greatdb_ha_mgr_vip_nic = 'eth0'
```

- 配置掩码

```ini
loose-greatdb_ha_mgr_vip_mask = '255.255.255.0'
```

- 目前只支持在单主模式下才能启用内置vip特性，所以还需要设置下面参数：

```ini
loose-group_replication_single_primary_mode = ON
loose-group_replication_enforce_update_everywhere_checks = OFF
```

- 选项 `greatdb_ha_mgr_vip_broad` 已废弃不再使用。
- 上述参数如果没有配置，或者配置格式不对时，内置VIP功能会失效（目前没有格式检查报错的功能）。
- 除了上述新增参数，其他MGR相关参数按照常规单主MGR配置要求即可。
- 上述参数支持在线动态修改。


上述配置说明的完整示例如下（MGR组内每个实例都需要配置）：

```ini
[mysqld]
#GreatSQL MGR vip
plugin-load-add=greatdb_ha.so
loose-greatdb_ha_enable_mgr_vip = ON
loose-greatdb_ha_mgr_vip_ip = "172.17.140.250"
loose-greatdb_ha_mgr_vip_mask = "255.255.255.0"
loose-greatdb_ha_mgr_vip_nic = "eth0"
loose-greatdb_ha_port = 33062
loose-greatdb_ha_send_arp_packge_times = 5
report_host = "172.17.140.10"
report_port = 3306

#single-primary mode
loose-group_replication_single_primary_mode = ON
loose-group_replication_enforce_update_everywhere_checks = OFF
```

当MGR Primary节点上绑定的vip被手动删除或者出现异常配置导致vip绑定行为不对时，可以通过在MGR Primary节点上执行 `set global greatdb_ha_force_change_mgr_vip = on` 命令去重新获取MGR拓扑结构，从而重新绑定vip，该命令执行之后，参数  `greatdb_ha_force_change_mgr_vip` 值仍然为off，这个是符合预期的行为。

## 启动说明
配置VIP需要相关内核权限，获取相关权限有两种方式，以下三选一即可（推荐采用方法一）：

1. 【推荐方法】修改systemd服务文件，增加AmbientCapabilities参数，例如：
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
User=mysql
Group=mysql
Type=notify
TimeoutSec=10
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
```bash
#执行该命令需要sudo权限或root
setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld
```

然后将GreatSQL二进制包的`lib/private`子目录加载到`LD_LIBRARY_PATH`中：
```bash
$ cat /etc/ld.so.conf.d/greatsql.conf

/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/lib/private
```

执行 `ldconfig && ldconfig -p | grep -i libpro` 确认配置无误：
```bash
$ ldconfig && ldconfig -p | grep -i 'libprotobuf.so'

	libprotobuf.so.3.19.4 (libc6,x86-64) => /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.3.19.4
```

之后启动GreatSQL即可。

3. 【强烈不推荐】给mysqld进程的启动用户，例如是mysql用户，设置root权限。

**注意**
- 建议采用 `systemd` 方式管理GreatSQL服务，或者对启动用户用户（如 mysql）开启sudo权限，利用sudo调用 `systemd` 再启动GreatSQL服务，这样能确保mysqld进程可获得内核权限，成功绑定VIP。
- 当 `setcap` 命令为mysqld二进制文件添加capability以后，需要保证登录系统的用户和启动mysqld的用户保持一致，才能确保mysqld进程可获得内核权限。例如：用root用户登录系统，然后再以普通用户（mysql）启动mysqld进程，setcap无法生效，绑定vip时会失败报错。




**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
