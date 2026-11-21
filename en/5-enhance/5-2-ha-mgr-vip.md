# MGR Built-in Dynamic VIP
---

## Introduction
GreatSQL supports binding a dynamic VIP to the read/write node (Primary node) in single-primary mode, making high availability switchover more convenient.

It is also possible to bind a read-only VIP to read-only nodes (Secondary nodes). Businesses can access Secondary nodes through this VIP, realizing dynamic VIP drift of Secondary nodes.

## Enabling the Plugin

Add the following line to the *[mysqld]* section of the *my.cnf* configuration file:

```ini
[mysqld]
plugin_load_add=greatdb_ha.so
```

Or, after starting the database instance, execute the following SQL command:

```sql
INSTALL PLUGIN greatdb_ha SONAME 'greatdb_ha.so';
```

## Security Hardening Notes

### Vulnerability Overview

In earlier versions, the HA plugin had the following security vulnerabilities:

1. **Unauthenticated sensitive information reading (information disclosure)**: `get_local_listen_sock()` binds the HA management port to `0.0.0.0`, and any network-reachable host can establish a connection. Authentication only compares the 16-byte hardcoded string `"Great01HaReserv!"`, which is plainly visible in the source code. After authentication passes, the `GET_BIND_VIPS` message type can read and return all bound VIPs and NIC information without any additional authorization.

2. **Unauthenticated VIP hijacking**: The `SET_ALL_NODE_BIND_VIPS` message type allows the primary node to issue VIP assignment instructions to secondary nodes. Since authentication relies only on the hardcoded magic word, any attacker can forge this message and trigger `ioctl(SIOCSIFADDR)` to bind an arbitrary IP address to the target NIC.

3. **Remote denial of service caused by uncaught exceptions in threads**: `get_view_id()` uses `std::stoi()` to convert the string after the colon in `view_id` to an integer version number, but does not catch the `std::invalid_argument` exception. When the version field of `view_id` is any non-numeric string, `abort()` and `SIGABRT` are triggered, terminating the entire mysqld process.

### Solution

After comprehensive evaluation, the **UDF (User Defined Function) approach** is adopted for HA plugin communication, and the original HA port communication method is deprecated. The main changes are as follows:

1. **Deprecate the HA port**: The listen/accept logic of the original HA port (`greatdb_ha_port`) is removed, and communication is implemented through UDF function calls instead.

2. **Use MySQL native authentication**: The Primary node obtains the host and port information of all Secondary nodes through MGR callbacks, obtains `rpl_user` and `rpl_password` through the `group_replication_recovery` channel, and connects to the Secondary nodes using `mysql_real_connect()`.

3. **UDF function registration**: UDF functions are registered and unregistered in the HA plugin init/deinit functions.

4. **Permission validation**: When calling UDF functions, authentication is performed through `thd->security_context()->master_access() & SUPER_ACL` and `has_global_grant(thd->security_context(), "GROUP_REPLICATION_STREAM")`.

### Correspondence Between Old and New Messages

| Old HA communication message | New UDF function | Return value type |
|----------------|--------------|----------|
| GET_BIND_VIPS | `SELECT HA_GET_BIND_VIPS('viewid')` | STRING_RESULT |
| SET_ALL_NODE_BIND_VIPS | `SELECT HA_SET_ALL_NODE_BIND_VIPS('viewid;UUID1:vip1,vip2;UUID2:vip3;')` | function return value |
| OK_REPLY | ok | function return value |
| ERROR_REPLY | thrown error information | error packet |
| YOU_ARE_NOT_PRIMARY | you_are_not_primary | function return value |

### Configuration Parameter Changes

**Deprecated parameters** (no longer need to be configured):
- `greatdb_ha_port` - The HA communication port is deprecated, and UDF communication is now performed through the MySQL 3306 port

**Retained parameters**:
- `greatdb_ha_enable_mgr_vip` - Master switch for dynamic VIP
- `greatdb_ha_mgr_vip_ip` - VIP address bound to the Primary node
- `greatdb_ha_mgr_vip_mask` - Mask corresponding to the VIP address
- `greatdb_ha_mgr_vip_nic` - NIC name to bind
- `greatdb_ha_send_arp_packge_times` - Number of repeated ARP packet broadcasts
- `greatdb_ha_mgr_read_vip_ips` - VIP addresses bound to Secondary nodes
- `greatdb_ha_mgr_read_vip_floating_type` - Read-only VIP drift policy
- `greatdb_ha_vip_tope` - Topology relationship of read-only VIPs (dynamically modifiable at runtime)
- `greatdb_ha_force_change_mgr_vip` - Force rebinding of VIP

### Upgrade Notes

1. **Version compatibility**: The new HA plugin uses UDF communication, which is incompatible with the old HA port communication method. All MGR nodes must be upgraded at the same time during the upgrade.

2. **Firewall rules**: Since the HA port is deprecated, the relevant firewall rules can be removed. The MySQL 3306 port needs to remain accessible.

3. **Process list**: `SHOW PROCESSLIST` can be used to view the usage of UDF communication connections.

4. **Connection occupation**: The UDF communication method occupies connections from `max_connections`. The Primary node connects to each Secondary node, so ensure that the connection count is configured sufficiently.

## Configuration Parameters

Add the relevant configuration parameters below to the *[mysqld]* section of the *my.cnf* configuration file.

- The master switch for dynamic VIP `greatdb_ha_enable_mgr_vip`. The optional values are **ON/OFF** (ON: enable, OFF: disable), and the default value is **OFF**.

```ini
greatdb_ha_enable_mgr_vip=ON
```

- Configure the VIP address bound to the Primary node `greatdb_ha_mgr_vip_ip`

```ini
greatdb_ha_mgr_vip_ip="172.17.140.250"
```

- Configure the number of repeated ARP packet broadcasts `greatdb_ha_send_arp_packge_times`. After a node binds the VIP, ARP packets are broadcast to update the ARP cache in the broadcast domain. This parameter is the number of broadcasts, with a default of 5 and a valid range of 3-20.

```ini
greatdb_ha_send_arp_packge_times=5
```

- Configure the VIP addresses bound to Secondary nodes `greatdb_ha_mgr_read_vip_ips`. To bind multiple read-only VIPs, simply separate them with commas `,`.

```ini
greatdb_ha_mgr_read_vip_ips="172.17.140.251"

# Or bind multiple read-only VIPs
# greatdb_ha_mgr_read_vip_ips="172.17.140.251,172.17.140.252"
```

- Configure the handling method when the node where a read-only VIP is located becomes unexpectedly unavailable `greatdb_ha_mgr_read_vip_floating_type`. The optional values are **["TO_PRIMARY", "TO_ANOTHER_SECONDARY"]**.
  - Setting it to **TO_PRIMARY** means rebinding the read-only VIP to the Primary node;
  - Setting it to **TO_ANOTHER_SECONDARY** means rebinding the read-only VIP to another Secondary node;
  - The default value is **TO_PRIMARY**, i.e., rebinding to the Primary node.

```ini
greatdb_ha_mgr_read_vip_floating_type="TO_ANOTHER_SECONDARY"
```

- Configure the topology relationship of read-only VIPs `greatdb_ha_vip_tope`, which can be forcibly modified in the running state. When the status of an MGR read-only node changes, its topology relationship may need to be reconfigured. The following points should be noted when using this parameter:
  - This parameter cannot be preset in the configuration file;
  - Changes can only be performed on the Primary node;
  - The VIP binding relationship of the Primary node cannot be modified through this operation;
  - VIPs cannot be added or removed through this operation (i.e., the VIPs in the topology relationship can only be members of the read/write VIPs);
  - Members cannot be added or removed through this operation (i.e., the MEMBER_ID in the topology relationship can only be the MEMBER_ID of existing MGR member nodes, and cannot be added or removed).

```sql
SET GLOBAL greatdb_ha_vip_tope="node1_uuid1::vip1; node2_uuid2::vip2,vip3; node3_uuid3::vip4";
```

- Configure the NIC name to bind `greatdb_ha_mgr_vip_nic`. The plugin binds the VIP to the specified NIC on the server where the Primary node is located. To prevent the original IP on this NIC from being overwritten, the VIP is actually bound to the **specified NIC name:0** interface, for example **eth0:0**. If multiple instances run on the same server, each instance needs to be set with a different NIC name, and multiple instances cannot bind different VIPs to the same NIC. For example, set the first instance to `greatdb_ha_mgr_vip_nic='eth0:0'` and the second instance to `greatdb_ha_mgr_vip_nic='eth0:1'` to distinguish them.

```ini
greatdb_ha_mgr_vip_nic='eth0'
```

- Configure the mask corresponding to the VIP address `greatdb_ha_mgr_vip_mask`

```ini
greatdb_ha_mgr_vip_mask='255.255.255.0'
```

- The built-in VIP feature can only be enabled in single-primary mode, so the following two parameters also need to be set:

```ini
group_replication_single_primary_mode=ON
group_replication_enforce_update_everywhere_checks=OFF
```

- If the above parameters are not configured, or the configuration format is incorrect, the built-in VIP feature will not take effect.
- In addition to the above new parameters, other MGR-related parameters can be configured according to the requirements of a regular single-primary MGR.
- All the above parameters support dynamic modification online.
- The parameter `greatdb_ha_mgr_vip_broad` has been deprecated and is no longer used, so it does not need to be configured.

An example of a complete set of built-in VIP related parameters (only the built-in VIP related parameters are listed; other parameters are not listed) is as follows. Each instance in the MGR group needs to be configured with these parameters:

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

**Note**: In the new configuration, the `greatdb_ha_port` parameter no longer needs to be configured.

When the VIP bound to the Primary node is manually deleted or an exception causes abnormal VIP binding behavior, you can execute the SQL command `SET GLOBAL greatdb_ha_force_change_mgr_vip=ON` on the Primary node. Its function is to re-obtain the MGR topology and rebind the VIP. After the command is executed, the value of the parameter `greatdb_ha_force_change_mgr_vip` remains **OFF**, which is the expected behavior.

If a physical NIC is shut down due to an exception or human action and then re-enabled, MGR may report errors due to abnormal communication between MGR members, such as network partitioning. This can also cause abnormal VIP binding relationships that need to be manually repaired. After the repair, if the VIP binding is still incorrect, you can execute the SQL command `SET GLOBAL greatdb_ha_force_change_mgr_vip=ON` on the Primary node to try to fix the problem again.

## Startup Notes

Enabling the built-in VIP feature requires some kernel capabilities. There are several ways to obtain the relevant capabilities. Choose one of the following three (method 1 is recommended):

- 【Recommended】Method 1: Use systemd privilege escalation.

Modify the systemd service file and add the `AmbientCapabilities` parameter. For example:
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
#Add this line to make the MGR VIP feature available
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW
```
Then execute `systemctl daemon-reload` to reload the systemd service, and start GreatSQL.

**Note**: Thanks to community user **Fenda** for the suggested method.

- Method 2: Use `setcap` privilege escalation.

Use the system command `setcap` to add the `CAP_NET_ADMIN` and `CAP_NET_RAW` capabilities to the mysqld binary file to achieve privilege escalation.

The specific commands are as follows:
```bash
#Executing this command requires sudo privileges or root
setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld
```

Then load the `lib/private` subdirectory of the GreatSQL binary package into `LD_LIBRARY_PATH`:
```bash
$ cat /etc/ld.so.conf.d/greatsql.conf

...
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private
```

Execute `ldconfig && ldconfig -p | grep -i libpro` to confirm the configuration is correct:
```bash
$ ldconfig && ldconfig -p | grep -i 'libprotobuf.so'

...
	libprotobuf.so.3.19.4 (libc6,x86-64) => /usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/lib/private/libprotobuf.so.3.19.4
```

Then start GreatSQL.

- Method 3: Start the mysqld process with root privileges.

Add root privileges to the user that starts the mysqld process (for example, the mysql user), or start the mysqld process directly with the root user.

**Note**
- It is recommended to use the `systemd` method to manage the GreatSQL service, or enable sudo privileges for the startup user (such as mysql) and use sudo to invoke `systemd` to start the GreatSQL service. This ensures that the mysqld process can obtain kernel capabilities and successfully bind the VIP.
- After the `setcap` command adds capabilities to the mysqld binary file, the user logging into the system and the user starting mysqld must be the same to ensure that the mysqld process can obtain kernel capabilities. For example, if you log into the system as the root user and then start the mysqld process as a normal user (mysql), `setcap` will not take effect and VIP binding will fail with an error.

## Notes

1. After unbinding the VIP, for connections established with the Primary node through the VIP to be proactively KILLed, the prerequisite is to set `bind_address="0.0.0.0"`. If the `bind_address` parameter specifies a fixed IP address, the proactive connection KILL function cannot be implemented. For details, refer to: [Disconnecting App Connections After MGR Primary Switchover](./5-2-ha-mgr-kill-conn-after-switch.md).

2. To ensure normal communication between MGR nodes, the host and IP correspondence of each node needs to be configured in the system `/etc/hosts` file of each MGR node. **The more recommended approach is to configure `report_host` on each MGR node**, to ensure that other nodes can be connected through the `MEMBER_HOST` column in the `performance_schema.replication_group_members` table. Otherwise, VIP drift binding may fail when MGR node roles are switched.

3. Only MGR single-primary mode (Single-Primary) is supported, and multi-primary mode (Multi-Primary) is not supported. Therefore, make sure the parameters are set correctly: `group_replication_single_primary_mode=ON` and `group_replication_enforce_update_everywhere_checks=OFF`.

4. When multiple NICs exist, the MAC address may not be proactively broadcast after VIP drift. You can periodically execute `arping` on the server to proactively broadcast the MAC address. For example:

```bash
/usr/sbin/arping -U -I bond0 -c 3 172.17.140.254
```

Where:
  - The `-U` parameter is used to update this machine's information in the ARP CACHE list of other hosts in gratuitous (forced) ARP mode, without requiring a response;
  - The `-I bond00` parameter specifies the NIC name to which the VIP is bound;
  - The `-c 3` parameter means sending 3 requests;
  - The parameter *172.17.140.250* is the VIP address.

Alternatively, the following method can be used:

```bash
/usr/sbin/arping -U -I bond0 -c 3 172.17.140.140 -s 172.117.140.250
```

Where:
  - The `-s 172.17.140.250` parameter specifies the broadcast IP as the bound VIP address;
  - The parameter *172.17.140.140* is the IP address of another node server.

If you want to enable IPv6 support, note the following points:

1. Only communication within the same subnet is supported.

2. Several related parameters `report_host / group_replication_group_seeds / group_replication_local_address` also need to use IPv6 addresses.

3. Mixing IPv4 and IPv6 is not supported.

4. The system-level **DAD detection** needs to be disabled; otherwise, the VIP cannot be bound after drift. Create or modify the `/etc/sysctl.d/local.conf` file. The configuration content is for reference as follows. After editing and saving, restart the server:

```ini
net.ipv6.conf.all.accept_dad = 0
net.ipv6.conf.default.accept_dad = 0
net.ipv6.conf.eth0.accept_dad = 0
net.ipv6.conf.eth1.accept_dad = 0
# IPv6 Privacy Extensions (RFC 4941)
net.ipv6.conf.all.use_tempaddr = 0
net.ipv6.conf.default.use_tempaddr = 0
```

6. **rpl_user configuration requirement**: The UDF communication method depends on the rpl_user and rpl_password of the `group_replication_recovery` channel. Verification shows that not configuring the rpl_user of change master will cause MGR to report errors and exit after starting successfully for a while. Therefore, rpl_user must be configured correctly.

## Using the Built-in VIP Feature in Docker Containers

The GreatSQL Docker image does not support using the built-in VIP feature in Docker by default. The reasons are as follows:

1. systemd cannot be used to start GreatSQL in Docker by default.
2. When packaging the GreatSQL Docker image, the mysqld program file owner was not changed to root, and the `setcap` privilege escalation operation was not performed.

Therefore, to use the built-in VIP feature of GreatSQL in Docker, you need to handle it yourself.

The following describes how to use the GreatSQL built-in VIP feature in a Docker container. It can be implemented in the following ways:

1. Add the `--privileged` parameter when creating a new container.
2. Install the GreatSQL software package (either the binary package or the RPM package).
3. Change the owner of the mysqld program file to root, and use `setcap` to escalate privileges on the mysqld binary file.
4. Correctly configure the relevant parameters.

The detailed operation process is as follows.

1. Create a new container.

```bash
docker run -itd --privileged --hostname t1 --name t1 centos:8 bash
```

2. Enter the container and view the initial IP information.

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

3. Install GreatSQL. The RPM package method is used here. The specific process is not described in detail.

4. Perform the privilege escalation operation in the container.

```bash
[root@t1 /]# setcap CAP_NET_ADMIN,CAP_NET_RAW+ep /usr/sbin/mysqld
[root@t1 /]# chown root:root /usr/sbin/mysqld

[root@t1 /]# getcap /usr/sbin/mysqld
/usr/sbin/mysqld = cap_net_admin,cap_net_raw+ep

[root@t1 /]# ls -la /usr/sbin/mysqld
-rwxr-xr-x 1 root root 67858088 Jul 30 08:18 /usr/sbin/mysqld
```

4. Modify the **/etc/my.cnf** configuration file and change the startup user to root (only part of the relevant content is shown):

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

**Note**: In the new configuration, the `greatdb_ha_port` parameter no longer needs to be configured.

5. After the GreatSQL data initialization is completed, start the GreatSQL service process (confirm that it runs as root).

```bash
[root@t1 /]# /usr/sbin/mysqld &

[root@t1 /]# ps -ef | grep mysqld
root        1518       1  1 07:02 ?        00:00:23 /usr/sbin/mysqld
```

6. Enter GreatSQL to view the VIP binding/running status.

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

7. View the VIP binding/running status at the system level in the container.

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

8. Check on the external host system whether the VIP is reachable.

```bash
$ ping 172.17.0.40

...
PING 172.17.0.40 (172.17.0.40) 56(84) bytes of data.
64 bytes from 172.17.0.40: icmp_seq=1 ttl=64 time=0.038 ms
64 bytes from 172.17.0.40: icmp_seq=2 ttl=64 time=0.032 ms
...
```

It can be seen that the VIP has been correctly bound and is reachable.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
