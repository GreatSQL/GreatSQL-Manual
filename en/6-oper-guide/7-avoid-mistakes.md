# Preventing Misoperations
---

This article introduces how to avoid misoperations such as accidentally deleting databases or tables, and how to improve database security.

## Common Dangerous Misoperations
Any operation in the online production environment must be very cautious, because a small negligence may cause irreparable huge losses.

Several common online misoperations:
- Wanting to delete files in the current directory, but accidentally executing `rm -fr /`, forcibly deleting all files in the entire system.
- Mistaking it for a test environment and wanting to delete a data object, but deleting data objects such as databases and tables in the online production environment.
- Mistaking it for a test environment and wanting to shut down or restart the database instance, or even shut down or restart the host operating system.
- Hot-swap operations such as replacing the hard disk of a server. The on-site engineer gets the information wrong and unplugs a normal server.
- Wanting to update or delete only part of the data, but because the WHERE condition has not been written yet, accidentally pressing the Enter key, causing the entire table to be updated or deleted.

Several methods to prevent this:
1. Always confirm whether every database has a reliable backup strategy, and the effectiveness of the backup files.
1. Configure a delayed replication instance to achieve fast recovery on the replica node even if data is accidentally deleted on the primary node.
1. Avoid server connection methods with layer-by-layer jumps. Each jump adds a bit more possibility of misoperation.
1. Exit the production business server immediately after completing operations, reducing the chance of making mistakes.
1. Frequently confirm the server, database, and path identifiers, and repeatedly confirm the server information before every operation.
1. Set a unique hostname on every server host system to improve recognition.
1. The production environment and test environment must be physically isolated so that they cannot connect to each other.
1. Use a dedicated operation machine or must first dial VPN to connect to the production environment, adding an extra protective barrier.
1. Avoid opening multiple terminals or operation windows at the same time, which easily leads to mistakes.
1. Before executing any important operation, write it clearly in a document first, and check each item one by one to confirm it is correct.
1. Only grant the necessary privileges to each database account, avoiding excessively high privileges that provide more opportunities for destruction.
1. Do not execute delete operations in the production environment; change them to RENAME operations instead. Rename first, confirm it is correct, and then delete, rather than deleting directly.
1. Set `sql_safe_updates=1` in the database to try to avoid the risk of full-table updates and deletes.

In the event of accidentally deleting data or misoperating with large-scale data updates, refer to the following methods for flashback or rescue:

1. [Summary of MySQL accidental data deletion](https://mp.weixin.qq.com/s/zMtgC24j7iIJ9xwbNo6AYQ)
1. [MySQL flashback tool binlog2sql](https://mp.weixin.qq.com/s/hEE12-LeCUsC1zKH48hcag)
1. [Quick start of the my2sql tool](https://mp.weixin.qq.com/s/APgBs7MvJuxJvLwg5i7N_w)
1. [How to recover data mistakenly written to a Slave to the source library](https://mp.weixin.qq.com/s/yoUNEehE6eOBQ7uFqSR48A)
1. [Add MASTER_DELAY to the delayed replica. How to quickly recover services after the source library goes down](https://mp.weixin.qq.com/s/qlAhbJq_ZPB5OXDd_zTQNw)
1. [A case of delayed replica recovery](https://mp.weixin.qq.com/s/i8cvftodUhkcejswuLSQ3w)
1. [Discussion on the implementation of MySQL flashback](https://mp.weixin.qq.com/s/ZuXS2UcgGS2p2x3p9mTwQg)

## Data Security Maintenance Suggestions

To make the GreatSQL database run more securely, it is recommended to follow the following specifications:

- On the application side, all user requests and input data must be preprocessed and cannot be submitted directly to the database, to avoid SQL injection.
- Regularly scan the application-side user request logs, scan abnormal requests and handle them promptly.
- Deploy a firewall on the application server side to block illegal user requests.
- Before applications go online, necessary security scans must be performed to avoid common SQL injection risks.
- On the database side, regularly scan request characteristics to determine whether there are requests that match security risks, and promptly block and handle them.
- Enable components such as auditing (AUDIT) and SQL firewall on the database side to promptly discover and block illegal requests.
- Sensitive data stored in the database must first be one-way encrypted to avoid being cracked and information leakage.
- Before importing production environment data into the development test environment, transcoding and masking operations must be performed first to avoid information leakage.
- Do a good job of connection request detection and monitoring. When abnormal frequent requests are found, block and handle them promptly.


**Reference materials:**
- [MySQL data security strategy](https://mp.weixin.qq.com/s/E1TcnHXf0E-mowiQ-JcdqQ)
- [I guess you will definitely not meet the requirements of the "MySQL security strategy"](https://mp.weixin.qq.com/s/TKqG5eQ4gSwNn6M5UaKaRw)
- [A few simple tricks to improve MySQL security](https://mp.weixin.qq.com/s/UrTXWtPMl8UQFDp-BHKsQw)
- [A MySQL backup and restore design idea](https://mp.weixin.qq.com/s/EThZLUV8AediGkRzYZPGjQ)
- [Several benefits of deploying a MySQL delayed replica](https://mp.weixin.qq.com/s/HSjbrZx5fNMbzxhDc4u6cQ)
- [Using MySQL source-replica replication delay to rescue accidentally deleted data](https://mp.weixin.qq.com/s/UhmlZMPDn9k5LmFnEm1glQ)
- ["Ye Wen" issue 34, add MASTER_DELAY to the delayed replica. How to quickly recover services after the source library goes down](https://mp.weixin.qq.com/s/7ejpu9ysQhbYB2j_4-WtRQ)



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
