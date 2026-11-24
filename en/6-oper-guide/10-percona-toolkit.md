# Percona Toolkit

---

Percona Toolkit (abbreviated as PT tools) is a set of advanced command-line tools for managing MySQL/GreatSQL. It can be used to perform various MySQL/GreatSQL and system tasks that are difficult to perform manually. Its functions include checking the data consistency of source-replica replication, checking duplicate indexes, locating table files with high I/O usage, online DDL, etc. DBAs who are familiar with and master the PT tools will greatly improve work efficiency.

::: tip Tip
`$` is the command prompt, and `greatsql>` is the GreatSQL database prompt.
:::

### Installing with a Package Manager

- For Debian or Ubuntu:

  ```bash
  sudo apt-get install percona-toolkit
  ```

- For RHEL or CentOS:

   ```bash
   sudo yum install percona-toolkit
   ```

### Installing with the TAR Package

Download [Percona Toolkit](https://www.percona.com/downloads) by selecting the appropriate version and specification.

::: tip Tip
Select the Percona Toolkit package that suits your CPU architecture and operating system version.
:::

Create the pt folder and save the downloaded installation package there.

```bash
mkdir /usr/local/pt
```

And check the sha256sum code to ensure integrity.
```bash
sha256sum -c percona-toolkit-3.5.7_x86_64.tar.gz.sha256sum
```

::: details View the result

```bash
$ sha256sum -c percona-toolkit-3.5.7_x86_64.tar.gz.sha256sum
percona-toolkit-3.5.7_x86_64.tar.gz: OK
```
:::

Decompress the percona-toolkit file.

```bash
tar -xvf percona-toolkit-3.5.7_x86_64.tar.gz
```

Add percona-toolkit to the environment variables.
```bash
echo 'export PATH=/usr/local/pt/percona-toolkit-3.5.7/bin:$PATH' >> ~/.bash_profile
```

Make the environment variables take effect.
```bash
source ~/.bash_profile
```

Select a tool to view the version number to confirm the installation is successful.

```bash
pt-online-schema-change --version
```
::: details View the result
```bash
$ pt-online-schema-change --version
pt-online-schema-change 3.5.7
```
:::

### Installing with the RPM Package

> The demonstration environment below is Centos7 - X86_64 architecture - ldd (GNU libc) 2.17.

Download the Percona Toolkit 3.5.7 version CentOS 7.x RPM package.

```bash
$ ls
percona-toolkit-3.5.7-1.el7.x86_64.rpm
```

Install Percona Toolkit with the rpm command. If there are missing dependency errors at this time, install them with YUM.

```bash
rpm -ivh --nodeps percona-toolkit-3.5.7-1.el7.x86_64.rpm
```

Select a tool to view the version number to confirm the installation is successful.

```bash
pt-online-schema-change --version
```
::: details View the result
```bash
$ pt-online-schema-change --version
pt-online-schema-change 3.5.7
```
:::

## Tools Included in Percona Toolkit

Percona Toolkit version 3.5.7 has 39 tools. These 39 tools are divided into seven categories (practical, configuration, monitoring, system, development, replication, performance)

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

### [Practical](./10-1-pt-practical.md)

| Tool Command               | Tool Purpose                                              |
| ---------------------- | ----------------------------------------------------- |
| [pt-align](./10-1-pt-practical.md#pt-align)               | Align the output of other tools with columns                            |
| [pt-archiver](./10-1-pt-practical.md#pt-archiver)            | Archive rows in a table to another table or file                      |
| [pt-find](./10-1-pt-practical.md#pt-find)                | Find tables and execute commands                                      |
| [pt-fingerprint](./10-1-pt-practical.md#pt-fingerprint)         | Convert queries to ciphertext                                        |
| [pt-kill](./10-1-pt-practical.md#pt-kill)                | Kill SQL statements that meet the conditions                                   |
| pt-k8s-debug-collector | Collect debug data (logs, resource status, etc.) from k8s/OpenShift clusters |
| [pt-secure-collect](./10-1-pt-practical.md#pt-secure-collect)       | Collect, clean, package, and encrypt data                            |

### [Configuration](./10-2-pt-configuration.md)

| Tool Command            | Tool Description                             |
| ------------------- | ------------------------------------ |
| [pt-config-diff](./10-2-pt-configuration.md#pt-config-diff)      | Compare database configuration files and parameters             |
| [pt-mysql-summary](./10-2-pt-configuration.md#pt-mysql-summary)    | Summarize MySQL/GreatSQL configuration and STATUS |
| [pt-variable-advisor](./10-2-pt-configuration.md#pt-variable-advisor) | Analyze parameters and make suggestions                 |

### [Monitoring](./10-3-pt-monitoring.md)

| Tool Command           | Tool Description                       |
| ------------------ | ------------------------------ |
| [pt-deadlock-logger](./10-3-pt-monitoring.md#pt-deadlock-logger) | Extract and record MySQL/GreatSQL deadlocks   |
| [pt-fk-error-logger](./10-3-pt-monitoring.md#pt-fk-error-logger) | Extract and record foreign key information             |
| [pt-mext](./10-3-pt-monitoring.md#pt-mext)            | View STATUS sample information in parallel         |
| [pt-query-digest](./10-3-pt-monitoring.md#pt-query-digest)    | Analyze query logs and generate reports       |
| pt-mongodb-summary | Collect information about MongoDB clusters    |
| pt-pg-summary      | Collect information about PostgreSQL clusters |

### [System](./10-4-pt-system.md)

| Tool Command      | Tool Description                     |
| ------------- | ---------------------------- |
| [pt-diskstats](./10-4-pt-system.md#pt-diskstats)  | View system disk status             |
| [pt-fifo-split](./10-4-pt-system.md#pt-fifo-split) | Simulate splitting files and output           |
| [pt-ioprofile](./10-4-pt-system.md#pt-ioprofile)  | Query process I/O and print an I/O activity table |
| [pt-sift](./10-4-pt-system.md#pt-sift)       | Browse files created by pt-stalk     |
| [pt-stalk](./10-4-pt-system.md#pt-stalk)      | Collect diagnostic data when problems occur     |
| [pt-summary](./10-4-pt-system.md#pt-summary)    | Collect and display system overview           |

### [Development](./10-5-pt-development.md)

| Tool Command                 | Tool Description                           |
| ------------------------ | ---------------------------------- |
| [pt-duplicate-key-checker](./10-5-pt-development.md#pt-duplicate-key-checker) | List and delete duplicate indexes and foreign keys         |
| [pt-online-schema-change](./10-5-pt-development.md#pt-online-schema-change)  | Modify table structure online                     |
| [pt-show-grants](./10-5-pt-development.md#pt-show-grants)           | Normalize and print grants                   |
| [pt-upgrade](./10-5-pt-development.md#pt-upgrade)               | Execute queries on multiple servers and compare differences |

### [Replication](./10-6-pt-replication.md)

| Tool Command                | Tool Description                                 |
| ----------------------- | ---------------------------------------- |
| [pt-heartbeat](./10-6-pt-replication.md#pt-heartbeat)            | Monitor MySQL/GreatSQL replication delay               |
| [pt-slave-delay](./10-6-pt-replication.md#pt-slave-delay)          | Set the time the replica lags behind the source                       |
| [pt-slave-find](./10-6-pt-replication.md#pt-slave-find)           | Find and print all MySQL/GreatSQL replication hierarchy relationships |
| [pt-slave-restart](./10-6-pt-replication.md#pt-slave-restart)        | Monitor Slave errors and try to restart the Slave           |
| [pt-table-checksum](./10-6-pt-replication.md#pt-table-checksum)       | Verify source-replica replication consistency                       |
| [pt-table-sync](./10-6-pt-replication.md#pt-table-sync)           | Efficiently synchronize table data                           |
| [pt-galera-log-explainer](./10-6-pt-replication.md) | Filter, aggregate, and summarize multiple Galera logs     |

### [Performance](./10-7-pt-performance.md)

| Tool Command                | Tool Description                                                    |
| ----------------------- | ----------------------------------------------------------- |
| [pt-index-usage](./10-7-pt-performance.md#pt-index-usage)          | Analyze index usage in logs and produce reports                            |
| [pt-pmp](./10-7-pt-performance.md#pt-pmp)                  | Track query results and summarize tracking results                                |
| [pt-table-usage](./10-7-pt-performance.md#pt-table-usage)          | Analyze queries in logs and analyze table usage                              |
| [pt-visual-explain](./10-7-pt-performance.md#pt-visual-explain)       | Format the execution plan                                              |
| pt-mongodb-index-check | Perform MongoDB index checks                                        |
| pt-mongodb-query-digest | Report query usage statistics by aggregating queries from the MongoDB query analyzer |


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
