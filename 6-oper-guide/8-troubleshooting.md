# 故障排查

本篇文档总结了使用 GreatSQL 时的常见错误。在遇到这些相关错误时，可以通过本文档的问题排查思路检查发生错误原因并进行处理。

## 安装完 GreatSQL 后，启动失败，提示 `valid data directory`

这个问题通常发生在一个全新的环境中手动安装 GreatSQL 二进制包的时候。

在启动 GreatSQL 时，可能会遇到类似下面的报错信息：

```
[ERROR] [MY-011011] [Server] Failed to find valid data directory.
[ERROR] [MY-010020] [Server] Data Dictionary initialization failed.
[ERROR] [MY-010119] [Server] Aborting
```

发生这个错误，通常是由于 GreatSQL 初始化时遇到问题了，不能正确初始化 *datadir* 目录，导致无法启动。可以从几个方面着手检查：

- 检查确认 *my.cnf* 中所有的配置参数是否设置正确，避免参数名写错，或者存在部分不兼容的参数名。

这时也可以先用下面这份最简单的 *my.cnf* 进行测试。 
```ini
[mysqld]
basedir = /usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64
datadir = /data/GreatSQL
user = mysql
log_error_verbosity = 3
```
其中的 `basedir` 和 `datadir` 根据实际情况替换调整。

- 可能因为操作系统环境兼容性或其他原因，导致 `mysqld_pre_systemd` 这个初始化脚本无法正确工作。

这时可以改成手动初始化，确认 GreatSQL 工作正常：
```bash
/usr/local/GreatSQL-8.0.32-26-Linux-glibc2.28-x86_64/bin/mysqld --no-defaults --user=mysql --log_error_verbosity=3 --datadir=/data/GreatSQL --initialize
```
如果手动初始化工作正常，再进一步排查 `mysqld_pre_systemd` 脚本哪里工作异常。

- 在 `mysqld_pre_systemd` 的初始化处理逻辑中，需要创建 `/var/lib/mysql-files` 目录，可能由于某种异常导致创建失败，初始化失败。

这时可以手动创建  `/var/lib/mysql-files` 目录，再次重新初始化。

## 安装完 GreatSQL 后，启动失败，提示 `PID file could not be found`

出现这种错误，通常是由于参数 `pid_file`（或 `pid-file`）设置的文件目录错误，文件目录不存在，或者没有权限写入等。

通常建议把 `pid_file` 放在 `datadir` 目录下，因此该参数只配置文件名，无需指定完整路径，例如：
```ini
[mysqld]
datadir = /data/GreatSQL
pid_file = greatsql.pid
```
如果该参数设置为包含完整文件目录时，则要确保其上级目录是存在的且有写入权限，例如设置 `pid_file = /data/run/greatsql/3306.pid`，这时要确保目录 `/data/run/greatsql/` 是存在的，并且 GreatSQL 进程的运行用户对其有写入权限。

```bash
mkdir -p /data/run/greatsql/
chown -R mysql:mysql /data/run/greatsql/
```

## 无法连接 GreatSQL，提示 `Can 't connect to local MySQL server through socket '/tmp/mysql.sock'` 错误

这个错误的字面意思是：无法通过 /tmp/mysql.sock 连接到 MySQL/GreatSQL 服务器上。通常是由于以下几种情况所致：

- 没有设置正确的 socket 文件路径

执行命令 `systemctl status greatsql` 或 `ps -ef|grep -i mysqld` 确认相应的 GreatSQL 服务进程是否已启动。

如果 GreatSQL 服务进程正常运行，那可能是因为 socket 文件路径错误，在 */etc/my.cnf* 中配置指向正确的文件路径即可。

```ini
[client]
socket = /data/GreatSQL/mysql.sock

[mysqld]
datadir = /data/GreatSQL
socket = /data/GreatSQL/mysql.sock
```

- GreatSQL 服务器未能正确启动。

执行命令 `systemctl status greatsql` 或 `ps -ef|grep -i mysqld` 确认相应的 GreatSQL 服务进程是否已启动。

如果 GreatSQL 服务进程确实没有启动，先检查 GreatSQL 的错误日志文件（参数 `log_error` 指向的文件）以及操作系统的错误日志文件（`/var/log/message`），查看是否有发生意外错误导致服务进程退出，再启动 GreatSQL 数据库服务。

- mysql.sock 文件被意外删除

这种情况下，改成用 TCP/IP 方式连接 GreatSQL 数据库即可。例如：

```bash
mysql -h127.0.0.1 -uroot -P3306 -p'xx'
```

如果不影响应用业务正常使用的话（应用业务通常是采用 TCP/IP 方式连接，不通过本地 socket 文件连接），所以一般没必要急着重启 GreatSQL 服务，等到下一次业务例行维护时再重启即可。

## GreatSQL 中运行一些查询 SQL 会 hang 住一直无响应

这可能是因为触发了 [InnoDB 并行查询（InnoDB PQ）](../5-enhance/5-1-highperf-innodb-pq.md)的 bug，请尝试升级到 GreatSQL 最新版本，或者修改选项 `force_parallel_execute=OFF` 临时关闭InnoDB并行查询特性。

可以参考下面的案例：

- [mysqldump导出108353886字节的数据后，hang](https://greatsql.cn/thread-522-1-1.html)
- [greatsql执行sql卡死](https://greatsql.cn/thread-422-1-1.html)

## GreatSQL 中运行一些 SQL 后数据库crash了

可能是因为触发了某些 bug，请尝试升级到 GreatSQL 最新版本，或者参考文章 [MySQL报障之coredump收集处理流程](https://mp.weixin.qq.com/s/CrV9kgIUnUd4GEru93xjdA) 提到的方法，打包收集相应的coredump文件、my.cnf配置文件、错误日志文件以及能稳定复现的方法，然后联系我们报告bug。

可以参考下面的案例：

- [执行某些 SQL 导致数据库重启](https://greatsql.cn/thread-529-1-1.html)

## GreatSQL 数据库无缘无故停掉或重启

以下几种情况的可能性较大：

- 发生了OOM Killer（out-of-memory killer）

简单说，就是被系统判定为内存占用太多，触发OOM KIller机制，杀掉mysqld进程以释放内存。

可以查看操作系统日志文件 `/var/log/messages`，通常会有类似下面的日志内容

```
kernel: Out of memory: Kill process 6033 (mysqld) score 615 or sacrifice child
kernel: Killed process 6033, UID 498, (mysqld) total-vm:56872260kB, anon-rss:3202560kB, file-rss:40kB
```

当发生OOM Killer事件时，可以选择适当调低部分设计内存的参数选项，例如 `innodb_buffer_pool_size` 等，也可以适当加大操作系统的物理内存。

此外，如果想保护mysqld进程不被OOM Killer机制杀掉，可以调整相应进程的 `oom_score_adj` 设置，将其修改为 -1000，例如：
```bash
$ ps -ef | grep mysqld
ps -ef | grep mysqld | grep -v grep
mysql     597099   1  9 Apr27 ?        21:16:54 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/etc/my.cnf

$ cat /proc/597099/oom_score_adj
0

$ echo -1000 > /proc/597099/oom_score_adj

$ cat /proc/597099/oom_score_adj
-1000
```

关于 `oom_score_adj` 的值定义如下：
- 默认为0，表示不调整分数。
- 如果改为负数，表示尽量不要被Kill。
- 如果改为正数，表示可以优先被Kill。

更多关于OOM Killer的内容请参考：[深入理解Linux内核OOM killer机制](https://zhuanlan.zhihu.com/p/560714542)。


- 管理员意外执行kill -9，杀掉mysqld进程。

- 操作系统意外重启。

## 用 systemd 启动 GreatSQL 时，报错提示 `Failed to execute command: Permission denied`

问题现象：GreatSQL 的 mysqld 二进制文件权限设置正确，手工调用也能正常启动，但只要是通过 `systemd` 启动时就会报告 `Permission denied` 错误，例如：


```
systemd[1549425]: greatdb.service: Failed to execute command: Permission denied
systemd[1549425]: greatdb.service: Failed at step EXEC spawning /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld: Permission denied
-- Subject: Process /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld could not be executed
-- Defined-By: systemd
-- Support: https://access.redhat.com/support
--
-- The process /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld could not be executed and failed.
--
-- The error number returned by this process is 13.
```

文件权限设置是正常的

```bash
$ ls -la /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld 

-rwxr-xr-x 1 mysql mysql 383759416 Feb  2 23:36 /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/mysqld
```

出现这种情况，应该是 **SELinux* 导致的。

在开启 **SELinux** 时，如果先把二进制可执行文件放在用户主目录，然后移动到其他目标目录的，就会由于文件的 **安全上下文** 不正确导致上述问题。

可以采用下面方法修复：

1. 首先，执行 `restorecon` 命令将文件和目录的SELinux安全上下文重置为默认值
```bash
restorecon -rv /data/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin/
```

2. 关闭 SELinux
```bash
setenforce 0
sed -i '/^SELINUX=/c'SELINUX=disabled /etc/selinux/config
```

再次重试，应该就可以了。


## GreatSQL 异常重启，且日志中的报错信息有 `long semaphore wait` 字样

出现这种情况时，通常是因为 InnoDB 内部的 mutex 或者 lock 互斥等待太久，日志中一般还包含类似下面的内容

```
Thread XXX has waited at XXX line XXX for 928 seconds the semaphore
```

这可能是因为当时系统负载太高了，也可能是因为叠加了某些 bug 导致。当信号量互斥等待事件 持续太久（约900秒）后，GreatSQL 就会自行重启（不重启的话其他啥也做不了，也没意义）。

几个可能的原因及可选解决办法
1. 垃圾SQL太多，需要进行优化垃圾SQL，能看到有些事务修改多行记录，看起来效率也很低
2. 数据库层面关闭自适应哈希索引（`innodb_adaptive_hash_index = OFF`），也可能是这个引起的
3. 加强监控，不少事务活跃时间太久了，一直没提交。垃圾SQL（事务）长时间不结束，会占用更多资源，之后一起玩完。参考 [监控告警](../6-oper-guide/3-monitoring-and-alerting.md)。
4. 可能系统层I/O设备有故障，能看到多个事务处于PREPARED状态，此时可能因为物理I/O设备故障导致无法提交/刷新数据。
5. 最后建议升级到 GreatSQL 最新版本，相对更稳定可靠。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
