# Ansible Installation
---

This section introduces how to use Ansible to quickly install GreatSQL and build an MGR cluster including an arbitrator node.

It is recommended to use the more convenient Ansible project [dbops](https://gitee.com/fanderchan/dbops) to install GreatSQL. This article has not been updated since GreatSQL 8.0.32-25.

## Installation Preparation

### Installing Ansible

First use dnf/yum to install Ansible:
```
$ yum install -y ansible
```

### Configuring Ansible

Modify the `/etc/ansible/hosts` file and add the IP addresses of the servers where GreatSQL is to be installed, for example:
```
[greatsql_dbs:children]
greatsql_mgr_primary
greatsql_mgr_secondary
greatsql_mgr_arbitrator

[greatsql_mgr_primary]
172.16.16.10
[greatsql_mgr_secondary]
172.16.16.11
[greatsql_mgr_arbitrator]
172.16.16.12
```

The above host list is divided into two groups. One is the group **greatsql_mgr_primary** for the node selected as the MGR PRIMARY node (or the first node that needs initialization bootstrap in multi-primary mode), with only one host. The other group **greatsql_mgr_secondary** is for nodes selected as SECONDARY nodes, with two hosts. The two groups can also be merged together to become a new group **greatsql_dbs**.

**Reminder**
1. Fill in the intranet IP address, because during MGR initialization, the intranet IP address is used by default.
2. If it is also to be installed on the local machine, also fill in the intranet IP address.
3. If multi-primary mode is to be used, in the above configuration, put the first node that needs initialization bootstrap in the **greatsql_mgr_primary** group, and put the other nodes as usual in the **greatsql_mgr_secondary** group.

### Establishing SSH Trust
For simplicity, directly establish SSH trust, making it convenient for Ansible one-click installation.

First generate the ssh key
```
$ ssh-keygen
```
Use the default values. When prompted to enter a passphrase, press Enter to use an empty passphrase.

Copy the ssh key to the target server:
```
$ ssh-copy-id root@172.16.16.10
```
Enter the password as prompted. After completion, test that logging in with ssh no longer prompts for a password. If installing on the local machine, ssh-copy-id also needs to be executed for the local machine. Or manually copy the ssh key to the remote host and write it into the ~/.ssh/authorized_keys file (be careful not to wrap or break lines).

### Testing Ansible
Execute any command to test that ansible can connect to the remote host:
```
$ ansible greatsql_dbs -a "uptime"
172.16.16.10 | CHANGED | rc=0 >>
 15:29:46 up 250 days, 19:40,  2 users,  load average: 0.04, 0.08, 0.07
172.16.16.11 | CHANGED | rc=0 >>
 15:29:46 up 303 days, 17:57,  3 users,  load average: 0.10, 0.13, 0.13
172.16.16.12 | CHANGED | rc=0 >>
 15:29:47 up 194 days, 18:08,  2 users,  load average: 0.07, 0.13, 0.10
```
This indicates that it can run normally.

### Downloading the GreatSQL-Ansible Installation Package

Open the GreatSQL-Ansible project homepage: [https://gitee.com/GreatSQL/GreatSQL-Ansible](https://gitee.com/GreatSQL/GreatSQL-Ansible)

Find "Releases" on the right side of the page, enter it, and select the "**GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal-ansible.tar.xz**" binary package to download to the server:

```
$ cd /opt/greatsql/; wget -c "https://gitee.com/xxx/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal-ansible.tar.xz"

$ tar -Jxvf GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal-ansible.tar.xz
```

After decompression, in addition to the *GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal.tar.xz* installation package, the GreatSQL-ansible one-click installation related files can also be seen:
```
$ cd /opt/greatsql/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal-ansible
$ ls -la
-rw-r--r-- 1 root root      333 Aug  8 11:04 check_mysql.yml
-rw-r--r-- 1 root root 46324036 Aug  8 11:09 GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal.tar.xz
-rw-r--r-- 1 root root     8920 Aug  8 12:41 greatsql.yml
drwxr-xr-x 3 root root      103 Aug  8 11:07 mysql-support-files
-rw-r--r-- 1 root root      869 Aug  8 11:04 README.en.md
-rw-r--r-- 1 root root      795 Aug  8 11:04 README.md
-rw-r--r-- 1 root root      413 Aug  8 14:03 vars.yml
```
The roles of the files are introduced respectively:
- GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal.tar.xz, the GreatSQL binary minimal installation package.
- greatsql.yml, the ansible one-click installation script.
- check_mysql.yml, the MySQL process and port pre-check script.
- vars.yml, a script that defines some variables. Some variable names in it need to be modified to adapt to different installation environments.

## Installing GreatSQL and Building an MGR Cluster

### Configuring the Ansible Installation Playbook

Before starting the installation, several configuration options in the `vars.yml` installation playbook need to be modified:
```
work_dir: /opt/greatsql/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal-ansible
extract_dir: /usr/local
data_dir: /data/GreatSQL
file_name: GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal.tar.xz
base_dir: /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal
my_cnf: /etc/my.cnf
mysql_user: mysql
mysql_port: 3306
mgr_user: GreatSQL
mgr_user_pwd: GreatSQL@2023
mgr_seeds: '172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061'
mgr_single_mode: 1
wait_for_start: 60
```

The following is an explanation of these parameters

|Parameter name | Default value | Purpose |
|--- | --- | --- |
|work_dir|/opt/greatsql|Working directory. Put the downloaded installation package in this directory. It can be adjusted as needed|
|extract_dir|/usr/local|After decompression, the GreatSQL binary package is placed under /usr/local. 【Adjustment not recommended】|
|data_dir|/data/GreatSQL|The datadir of GreatSQL at runtime. 【Adjustment not recommended】|
|file_name|GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal.tar.xz|The file name of the GreatSQL binary package. 【Adjustment not recommended】|
|base_dir|/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal|The basedir of GreatSQL. 【Adjustment not recommended】|
|my_cnf|/etc/my.cnf|The my.cnf configuration file path. 【Adjustment not recommended】|
|mysql_user|mysql|The user and group corresponding to running GreatSQL. 【Adjustment not recommended】|
|mysql_port|3306|The listening port of GreatSQL at runtime. 【Adjustment not recommended】|
|mgr_user|repl|The MGR account|
|mgr_user_pwd|repl4MGR|The MGR account password|
|mgr_seeds|172.16.16.10:33061,172.16.16.11:33061,172.16.16.12:33061|Defines the IP+port list of each node when MGR runs. 【Needs to be adjusted by yourself】|
|mgr_single_mode|Whether to use single-primary mode; 0 means no, i.e., multi-primary mode; 1 means yes, i.e., single-primary mode; default value: 1 (i.e., single-primary mode by default)|
|wait_for_start|60|At first startup, a series of data file initialization and other work must be completed first. The subsequent MGR initialization work must wait for the previous work to complete. If the first installation fails, this time can be lengthened|

**Reminder:**
1. Except for modifying the work_dir and mgr_seeds parameters, please modify the others with caution; otherwise, errors such as file directories not found may be reported.
2. If multi-primary mode is to be used, in the `/etc/ansible/hosts` file, put the first node that needs initialization bootstrap in the **greatsql_mgr_primary** group, and put the other nodes as usual in the **greatsql_mgr_secondary** group.

### Starting the Ansible Installation

Execute the following command to complete all work at once: GreatSQL installation, initialization, adding to the systemd service, and MGR initialization:
```
$ cd /opt/greatsql/GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal-ansible
$ ls -la
-rw-r--r-- 1 root root      333 Aug  8 11:04 check_mysql.yml
-rw-r--r-- 1 root root 46324036 Aug  8 11:09 GreatSQL-8.0.32-25-Linux-glibc2.17-x86_64-minimal.tar.xz
-rw-r--r-- 1 root root     8920 Aug  8 12:41 greatsql.yml
drwxr-xr-x 3 root root      103 Aug  8 11:07 mysql-support-files
-rw-r--r-- 1 root root      869 Aug  8 11:04 README.en.md
-rw-r--r-- 1 root root      795 Aug  8 11:04 README.md -rw-r--r-- 1 root root      413 Aug  8 14:03 vars.yml

$ ansible-playbook ./greatsql.yml
```

### Checking the Ansible Execution Process Output

During installation, it first checks whether a mysqld process is already running, or whether there is already another service on port 3306. If so, the output content may look like this:
```
PLAY [install GreatSQL] *****************************************************************************************************************************

TASK [Gathering Facts] ******************************************************************************************************************************
ok: [172.16.16.10]
ok: [172.16.16.11]
ok: [172.16.16.12]

TASK [check mysql port] *****************************************************************************************************************************
changed: [172.16.16.10]
changed: [172.16.16.11]
changed: [172.16.16.12]

TASK [check mysql processor] ************************************************************************************************************************
changed: [172.16.16.10]
changed: [172.16.16.11]
changed: [172.16.16.12]

TASK [modify selinux config file] *******************************************************************************************************************
skipping: [172.16.16.10]
skipping: [172.16.16.11]
skipping: [172.16.16.12]
```

The **skipping** and **skipped=N** text can be seen. If it is a normal installation, output similar to the following is produced:
```
PLAY [install GreatSQL] *****************************************************************************************************************************

TASK [Gathering Facts] ******************************************************************************************************************************
ok: [172.16.16.10]
ok: [172.16.16.11]
ok: [172.16.16.12]

TASK [check mysql port] *****************************************************************************************************************************
changed: [172.16.16.10]
changed: [172.16.16.11]
changed: [172.16.16.12]
...
PLAY RECAP ******************************************************************************************************************************************
172.16.16.10               : ok=31   changed=20   unreachable=0    failed=0    skipped=0    rescued=0    ignored=2
172.16.16.11               : ok=31   changed=20   unreachable=0    failed=0    skipped=0    rescued=0    ignored=2
172.16.16.12               : ok=31   changed=20   unreachable=0    failed=0    skipped=0    rescued=0    ignored=2
```
The **ok** and **skipped=0** text can be seen, indicating that everything was executed normally. The installation should already be successful at this time. Check it:
```
$ systemctl status greatsql
● greatsql.service - GreatSQL Server
   Loaded: loaded (/usr/lib/systemd/system/greatsql.service; disabled; vendor preset: disabled)
   Active: active (running) since Tue 2023-08-08 12:26:08 CST; 1h 58min ago
     Docs: man:mysqld(8)
           https://dev.mysql.com/doc/refman/8.4/en/using-systemd.html
  Process: 77972 ExecStartPre=/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 78043 (mysqld)
   Status: "Server is operational"
    Tasks: 38 (limit: 149064)
   Memory: 367.7M
   CGroup: /system.slice/greatsql.service
           └─78043 /usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64-minimal/bin/mysqld

systemd[1]: Starting GreatSQL Server...
systemd[1]: Started GreatSQL Server.
```

Check the MGR service running status:
```
[root@GreatSQL][(none)]> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE | MEMBER_ROLE | MEMBER_VERSION |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
| group_replication_applier | ac24eab8-def4-11eb-a5e8-525400e802e2 | GreatSQL-03 |        3306 | ONLINE       | ARBITRATOR  | 8.0.32        |
| group_replication_applier | ac275d97-def4-11eb-9e49-525400fb993a | GreatSQL-02 |        3306 | ONLINE       | SECONDARY   | 8.0.32        |
| group_replication_applier | ac383458-def4-11eb-bf1a-5254002eb6d6 | GreatSQL-01 |        3306 | ONLINE       | PRIMARY     | 8.0.32        |
+---------------------------+--------------------------------------+-------------+-------------+--------------+-------------+----------------+
```
At this point, the installation is complete.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
