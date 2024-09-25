# Percona Toolkit 系列

---

Percona Toolkit简称（PT工具），是一组高级命令行工具，用于管理MySQL/GreatSQL的工具。可以用它来执行各种难以手动执行的MySQL/GreatSQL和系统任务。其功能包括检查主从复制的数据一致性、检查重复索引、定位IO占用高的表文件、在线DDL等，DBA熟悉掌握PT工具后将极大提高工作效率。

::: tip 小贴士
`$`为命令提示符、`greatsql>`为GreatSQL数据库提示符。
:::

### 使用包管理器安装

- 对于 Debian 或 Ubuntu：

  ```bash
  sudo apt-get install percona-toolkit
  ```

- 对于 RHEL 或 CentOS：

   ```bash
   sudo yum install percona-toolkit
   ```

### 使用TAR包安装

选择合适的版本和规格下载 [Percona Toolkit](https://www.percona.com/downloads)

> 选择合适自己的CPU架构和操作系统版本Percona Toolkit包

创建文件夹pt，并将下载的安装包保存于此

```bash
mkdir /usr/local/pt
```

并检查sha256sum码，确保完整性
```bash
sha256sum -c percona-toolkit-3.5.7_x86_64.tar.gz.sha256sum
```

::: details 查看运行结果

```bash
$ sha256sum -c percona-toolkit-3.5.7_x86_64.tar.gz.sha256sum
percona-toolkit-3.5.7_x86_64.tar.gz: OK
```
:::

解压文件，并添加到环境变量

```bash
tar -xvf percona-toolkit-3.5.7_x86_64.tar.gz
echo 'export PATH=/usr/local/pt/percona-toolkit-3.5.7/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

选择一个工具查看版本号，确认安装成功

```bash
pt-online-schema-change --version
```
::: details 查看运行结果
```bash
$ pt-online-schema-change --version
pt-online-schema-change 3.5.7
```
:::

### 使用RPM包安装

> 以下示范环境为 Centos7 - X86_64架构 - ldd (GNU libc) 2.17

下载好3.5.7版本的Centos7 RPM包

```bash
$ ls
percona-toolkit-3.5.7-1.el7.x86_64.rpm
```

使用 rpm 命令安装 Percona Toolkit，如果此时有报缺失依赖，用 YUM 安装即可

```bash
rpm -ivh --nodeps percona-toolkit-3.5.7-1.el7.x86_64.rpm
```

选择一个工具查看版本号，确认安装成功

```bash
pt-online-schema-change --version
```
::: details 查看运行结果
```bash
$ pt-online-schema-change --version
pt-online-schema-change 3.5.7
```
:::

## Percona Toolkit 包含的工具

3.5.7版本Percona Toolkit工具拥有39个工具，将这39个工具分为七大类(实用类、配置类、监控类、系统类、开发类、复制类、性能类）

```bash
$ ls
pt-align                  pt-fingerprint           pt-mext                  pt-query-digest    pt-summary
pt-archiver               pt-fk-error-logger       pt-mongodb-index-check   pt-secure-collect  pt-table-checksum
pt-config-diff            pt-galera-log-explainer  pt-mongodb-query-digest  pt-show-grants     pt-table-sync
pt-deadlock-logger        pt-heartbeat             pt-mongodb-summary       pt-sift            pt-table-usage
pt-diskstats              pt-index-usage           pt-mysql-summary         pt-slave-delay     pt-upgrade
pt-duplicate-key-checker  pt-ioprofile             pt-online-schema-change  pt-slave-find      pt-variable-advisor
pt-fifo-split             pt-k8s-debug-collector   pt-pg-summary            pt-slave-restart   pt-visual-explain
pt-find                   pt-kill                  pt-pmp                   pt-stalk`
```

### [实用类](./10-1-pt-practical.md)

| 工具命令               | 工具用途                                              |
| ---------------------- | ----------------------------------------------------- |
| pt-align               | 将其它工具输出内容与列对齐                            |
| pt-archiver            | 将表中的行存档到另一个表或文件中                      |
| pt-find                | 查找表并执行命令                                      |
| pt-fingerprint         | 将查询转成密文                                        |
| pt-kill                | Kill掉符合条件的SQL                                   |
| pt-k8s-debug-collector | 从 k8s/OpenShift 集群收集调试数据（日志、资源状态等） |
| pt-secure-collect      | 收集、清理、打包和加密数据                            |

### [配置类](./10-2-pt-configuration.md)

| 工具命令            | 工具描述                             |
| ------------------- | ------------------------------------ |
| pt-config-diff      | 比较数据库配置文件和参数             |
| pt-mysql-summary    | 对GreatSQL/MySQL配置和STATUS进行汇总 |
| pt-variable-advisor | 分析参数，并提出建议                 |

### [监控类](./10-3-pt-monitoring.md)

| 工具命令           | 工具描述                       |
| ------------------ | ------------------------------ |
| pt-deadlock-logger | 提取和记录GreatSQL/MySQL死锁   |
| pt-fk-error-logger | 提取和记录外键信息             |
| pt-mext            | 并行查看STATUS样本信息         |
| pt-query-digest    | 分析查询日志，并产生报告       |
| pt-mongodb-summary | 收集有关 MongoDB 集群的信息    |
| pt-pg-summary      | 收集有关 PostgreSQL 集群的信息 |

### [系统类](./10-4-pt-system.md)

| 工具命令      | 工具描述                     |
| ------------- | ---------------------------- |
| pt-diskstats  | 查看系统磁盘状态             |
| pt-fifo-split | 模拟切割文件并输出           |
| pt-ioprofile  | 查询进程IO并打印一个IO活动表 |
| pt-sift       | 浏览由pt-stalk创建的文件     |
| pt-stalk      | 出现问题时，收集诊断数据     |
| pt-summary    | 收集和显示系统概况           |

### [开发类](./10-5-pt-development.md)

| 工具命令                 | 工具描述                           |
| ------------------------ | ---------------------------------- |
| pt-duplicate-key-checker | 列出并删除重复的索引和外键         |
| pt-online-schema-change  | 在线修改表结构                     |
| pt-show-grants           | 规范化和打印权限                   |
| pt-upgrade               | 在多个服务器上执行查询，并比较不同 |

### [复制类](./10-6-pt-replication.md)

| 工具命令                | 工具描述                                 |
| ----------------------- | ---------------------------------------- |
| pt-heartbeat            | 监控GreatSQL/MySQL复制延迟               |
| pt-slave-delay          | 设定从落后主的时间                       |
| pt-slave-find           | 查找和打印所有GreatSQL/MySQL复制层级关系 |
| pt-slave-restart        | 监控Salve错误，并尝试重启Salve           |
| pt-table-checksum       | 校验主从复制一致性                       |
| pt-table-sync           | 高效同步表数据                           |
| pt-galera-log-explainer | 对多个Galera日志进行过滤、聚合和汇总     |

### [性能类](./10-7-pt-performance.md)

| 工具命令                | 工具描述                                                    |
| ----------------------- | ----------------------------------------------------------- |
| pt-index-usage          | 分析日志中索引使用情况，并出报告                            |
| pt-pmp                  | 查询结果跟踪，并汇总跟踪结果                                |
| pt-table-usage          | 分析日志中查询并分析表使用情况                              |
| pt-visual-explain       | 格式化执行计划                                              |
| pt-mongodb-index-check  | MongoDB 索引执行检查                                        |
| pt-mongodb-query-digest | 通过聚合来自 MongoDB 查询分析器的查询来报告查询使用统计信息 |



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
